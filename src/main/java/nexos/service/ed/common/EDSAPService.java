package nexos.service.ed.common;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import com.sap.conn.jco.AbapClassException;
import com.sap.conn.jco.AbapException;
import com.sap.conn.jco.JCo;
import com.sap.conn.jco.JCoDestination;
import com.sap.conn.jco.JCoDestinationManager;
import com.sap.conn.jco.JCoException;
import com.sap.conn.jco.JCoField;
import com.sap.conn.jco.JCoFieldIterator;
import com.sap.conn.jco.JCoFunction;
import com.sap.conn.jco.JCoParameterList;
import com.sap.conn.jco.JCoTable;
import com.sap.conn.jco.server.DefaultServerHandlerFactory;
import com.sap.conn.jco.server.JCoServer;
import com.sap.conn.jco.server.JCoServerContext;
import com.sap.conn.jco.server.JCoServerContextInfo;
import com.sap.conn.jco.server.JCoServerErrorListener;
import com.sap.conn.jco.server.JCoServerExceptionListener;
import com.sap.conn.jco.server.JCoServerFactory;
import com.sap.conn.jco.server.JCoServerFunctionHandler;
import com.sap.conn.jco.server.JCoServerState;
import com.sap.conn.jco.server.JCoServerStateChangedListener;

import nexos.dao.ed.common.EDCommonDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.AuthenticationUtil;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServerHandlerSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: EDSAPService<br>
 * Description: SAP 관련 인터페이스 처리를 담당하는 공통 Class<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */

@Service
public class EDSAPService extends ServiceSupport implements //
    // Handler
    JCoServerFunctionHandler, //

    // Listener
    JCoServerErrorListener, //
    JCoServerExceptionListener, //
    JCoServerStateChangedListener, //

    // Server Handler Support
    ServerHandlerSupport {

    private final Logger        logger                              = LoggerFactory.getLogger(EDSAPService.class);

    final String                SELECT_ID_RS_SAP_SERVER_DEFINE_INFO = "EDCOMMON.RS_SAP_SERVER_DEFINE_INFO";

    @Autowired
    private EDCommonDAO         dao;

    private JCoServer           sapServer                           = null;
    private EDSAPDataProvider   sapDataProvider                     = null;
    private Map<String, Object> sapFunctions                        = new HashMap<String, Object>();

    // ===============================================================================================================================================
    // [S]JCoServerStateChangedListener[S]
    // ===============================================================================================================================================
    @Override
    public void serverStateChangeOccurred(JCoServer server, JCoServerState oldState, JCoServerState newState) {

        StringBuffer sbLog = new StringBuffer();
        sbLog.append("SAP JCO SERVER STATE LOG\n"); //
        try {
            sbLog.append("  GATEWAYHOST     : ").append(server.getGatewayHost()).append("\n") //
                .append("  GATEWAYSERVICE  : ").append(server.getGatewayService()).append("\n") //
                .append("  PROGRAMID       : ").append(server.getProgramID()).append("\n") //
                .append("  OLDSTATE        : ").append(oldState == null ? "null" : oldState.toString()).append("\n") //
                .append("  NEWSTATE        : ").append(newState == null ? "null" : newState.toString()).append("\n");
        } catch (Exception e) {
            sbLog.append("  EXCEPTION       : ").append(getErrorMessage(e)).append("\n");
        }
        logger.debug(sbLog.toString());
    }
    // ===============================================================================================================================================
    // [E]JCoServerStateChangedListener[E]
    // ===============================================================================================================================================

    // ===============================================================================================================================================
    // [S]JCoServerExceptionListener[S]
    // ===============================================================================================================================================
    @Override
    public void serverExceptionOccurred(JCoServer server, String connectionID, JCoServerContextInfo context, Exception ex) {

        StringBuffer sbLog = new StringBuffer();
        sbLog.append("SAP JCO SERVER EXCEPTION LOG\n"); //
        try {
            sbLog.append("  GATEWAYHOST     : ").append(server.getGatewayHost()).append("\n") //
                .append("  GATEWAYSERVICE  : ").append(server.getGatewayService()).append("\n") //
                .append("  PROGRAMID       : ").append(server.getProgramID()).append("\n") //
                .append("  EXCEPTION       : ").append(ex == null ? "" : getErrorMessage(ex)).append("\n");
        } catch (Exception e) {
            sbLog.append("  EXCEPTION       : ").append(getErrorMessage(e)).append("\n");
        }
        logger.debug(sbLog.toString());
    }
    // ===============================================================================================================================================
    // [E]JCoServerExceptionListener[E]
    // ===============================================================================================================================================

    // ===============================================================================================================================================
    // [S]JCoServerErrorListener[S]
    // ===============================================================================================================================================
    @Override
    public void serverErrorOccurred(JCoServer server, String connectionID, JCoServerContextInfo context, Error er) {

        StringBuffer sbLog = new StringBuffer();
        sbLog.append("SAP JCO SERVER ERROR LOG\n"); //
        try {
            sbLog.append("  GATEWAYHOST     : ").append(server.getGatewayHost()).append("\n") //
                .append("  GATEWAYSERVICE  : ").append(server.getGatewayService()).append("\n") //
                .append("  PROGRAMID       : ").append(server.getProgramID()).append("\n") //
                .append("  EXCEPTION       : ").append(er == null ? "" : getErrorMessage(er)).append("\n");
        } catch (Exception e) {
            sbLog.append("  EXCEPTION       : ").append(getErrorMessage(e)).append("\n");
        }
        logger.debug(sbLog.toString());
    }
    // ===============================================================================================================================================
    // [E]JCoServerErrorListener[E]
    // ===============================================================================================================================================

    // ===============================================================================================================================================
    // [S]ServerHandlerSupport[S]
    // ===============================================================================================================================================
    /**
     * SAP JCO SERVER 실행 여부
     *
     * @return
     */
    @Override
    public boolean isStarted() {

        return sapServer != null;
    }

    /**
     * Starts the server.
     * The server will open the specified number of connections.
     *
     * @throws Exception
     */
    @Override
    public void start() throws Exception {

        if (isStarted()) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.049", "SAP 서버가 이미 동작 중 입니다."));
        }

        try {
            // Load EDI Define Information - SAP JCO Server
            loadServerFunctions();

            // Registers a provider for destination data.
            registerDataProvider();

            // Creates a new JCo server instance or returns the one which is already available.
            sapServer = JCoServerFactory.getServer(sapDataProvider.getDefaultProviderName());
        } catch (Exception e) {
            throw new RuntimeException(
                "Unable to create the server " + sapDataProvider.getDefaultProviderName() + ", because of " + Util.getErrorMessage(e), e);
        }

        // Function Handler settings
        registerFunctionHandler();;

        // Add Listener
        sapServer.addServerErrorListener(this); // Adds a new listener to the list of error listeners.
        sapServer.addServerExceptionListener(this); // Adds a new listener to the list of exception listeners.
        sapServer.addServerStateChangedListener(this); // Adds a new listener to the list of state change listeners.

        // Starts the server.
        // The server will open the specified number of connections.
        sapServer.start();
        logger.info("ServerIDs : ", Arrays.toString(JCo.getServerIDs().toArray()));
    }

    /**
     * Stops the server.
     * All connections will be closed, cached requests will not be processed and aborted.
     *
     * @throws Exception
     */
    @Override
    public void stop() throws Exception {

        if (!isStarted()) {
            return;
        }

        // Stops the server.
        // All connections will be closed, cached requests will not be processed and aborted.
        try {
            sapServer.stop();
        } catch (Exception e) {
        }
        int waitCount = 5;
        while (waitCount > 0 && sapServer.getState() != JCoServerState.STOPPED) {
            try {
                Thread.sleep(1000);
            } catch (Exception e) {
            } finally {
                waitCount--;
            }
        }

        // Clear allows to empty both the function template cache as well as the record metadata cache completely.
        if (sapServer.getRepository() != null) {
            sapServer.getRepository().clear();
        }

        // Remove Listener
        sapServer.removeServerErrorListener(this); // Removes a listener from the list of error listeners.
        sapServer.removeServerExceptionListener(this); // Removes a listener from the list of exception listeners.
        sapServer.removeServerStateChangedListener(this); // Removes a listener from the list of state change listeners.

        // Releases all resources allocated by the server instance.
        sapServer.release();

        sapServer = null;
    }

    @Override
    public void startup() throws Exception {

        // Registers a provider for destination data.
        registerDataProvider();

        // Starts the server.
        start();
    }

    @Override
    public void shutdown() throws Exception {

        // Stops the server.
        try {
            stop();
        } finally {
            // Unregisters a provider for destination data.
            unregisterDataProvider();
        }
    }
    // ===============================================================================================================================================
    // [E]ServerHandlerSupport[E]
    // ===============================================================================================================================================

    /**
     * Function Handler settings
     */
    public void registerFunctionHandler() {

        DefaultServerHandlerFactory.FunctionHandlerFactory factory = new DefaultServerHandlerFactory.FunctionHandlerFactory();
        // factory.registerHandler("FUNCTION_NAME", this);
        factory.registerGenericHandler(this);
        sapServer.setCallHandlerFactory(factory);
    }

    /**
     * Registers a provider for destination data.
     */
    public void registerDataProvider() {

        if (sapDataProvider == null) {
            // Create Data Provider.
            sapDataProvider = new EDSAPDataProvider();
            sapDataProvider.registerDataProvider();
        }
    }

    /**
     * Unregisters a provider for destination data.
     */
    public void unregisterDataProvider() {

        if (sapDataProvider != null) {
            sapDataProvider.unregisterDataProvider();
        }
    }

    /**
     * Load EDI Define Information - SAP JCO Server
     */
    private void loadServerFunctions() {

        sapFunctions.clear();

        Map<String, Object> callParams = new HashMap<String, Object>();
        List<Map<String, Object>> dsResult = getSAPServerDefineInfo(callParams);
        int dsCount = Util.getCount(dsResult);
        for (int row = 0; row < dsCount; row++) {
            Map<String, Object> rowData = dsResult.get(row);
            String sapFunctionNm = (String)rowData.get("SAP_FUNCTION_NM");
            Map<String, Object> sapParams = Util.toParameter(rowData);
            sapParams.put("P_SAP_RESULT_INFO", dao.getSAPResultInfo((String)rowData.get("SAP_RESULT_MAP")));

            sapFunctions.put(sapFunctionNm, sapParams);
        }
    }

    public String getErrorMessage(Throwable t) {

        return getErrorMessage(null, t);
    }

    public String getErrorMessage(String message, Throwable t) {

        if (t instanceof JCoException) {
            return (message != null ? message : "") + t.toString();
        } else {
            return Util.getErrorMessage(message, t);
        }
    }

    /**
     * Call this method to get an instance of a destination, on which you would like to execute a function module.
     *
     * @param params
     * @return
     */
    public JCoDestination getDestination(Map<String, Object> params) {

        registerDataProvider();

        return getDestination(sapDataProvider.getDefaultProviderName(), params);
    }

    /**
     * Call this method to get an instance of a destination, on which you would like to execute a function module.
     *
     * @param params
     * @return
     */
    public JCoDestination getDestination(String destinationName, Map<String, Object> params) {

        JCoDestination result = null;

        Util.setOutMessage(params, Consts.OK);
        // StringBuffer sbLog = new StringBuffer();
        // sbLog.append("SAP JCO GET DESTINATION LOG\n"); //
        try {
            result = JCoDestinationManager.getDestination(destinationName);
            // sbLog.append(" ATTRIBUTES : ") //
            // .append(result.getAttributes().toString()).append("\n");
        } catch (Exception e) {
            // sbLog.append(" EXCEPTION : ").append(getErrorMessage(e)).append("\n");
            Util.setOutMessage(params, getErrorMessage(e));
        }
        // logger.debug(sbLog.toString());

        return result;
    }

    /**
     * Returns a JCoFunction with initial parameters for the passed function name.
     *
     * @param params
     * @param destination
     * @return
     */
    public JCoFunction getFunction(JCoDestination destination, Map<String, Object> params) {

        JCoFunction result = null;

        Util.setOutMessage(params, Consts.OK);
        String functionName = (String)params.get("P_SAP_FUNCTION_NM");
        // StringBuffer sbLog = new StringBuffer();
        // sbLog.append("SAP JCO GET FUNCTION LOG\n") //
        // .append(" FUNCTION : " + functionName).append("\n");
        try {
            result = destination.getRepository().getFunction(functionName);
        } catch (Exception e) {
            // sbLog.append(" EXCEPTION : ").append(getErrorMessage(e)).append("\n");
            Util.setOutMessage(params, getErrorMessage(e));
        }
        // logger.debug(sbLog.toString());

        return result;
    }

    /**
     * Returns the value of the named field as a JCoTable object.
     *
     * @param params
     * @param destination
     * @return
     */
    public JCoTable getTable(JCoFunction function, Map<String, Object> params) {

        JCoTable result = null;

        Util.setOutMessage(params, Consts.OK);
        String tableName = (String)params.get("P_SAP_TABLE_NM");
        // StringBuffer sbLog = new StringBuffer();
        // sbLog.append("SAP JCO GET FUNCTION TABLE LOG\n") //
        // .append(" TABLE : " + tableName).append("\n");
        try {
            result = function.getTableParameterList().getTable(tableName);
        } catch (Exception e) {
            // sbLog.append(" EXCEPTION : ").append(getErrorMessage(e)).append("\n");
            Util.setOutMessage(params, getErrorMessage(e));
        }
        // logger.debug(sbLog.toString());

        return result;
    }

    // ===============================================================================================================================================
    // [S]JCoServerFunctionHandler[S]
    // ===============================================================================================================================================
    @SuppressWarnings("unchecked")
    @Override
    public void handleRequest(JCoServerContext context, JCoFunction function) throws AbapException, AbapClassException {

        StringBuffer sbLog = new StringBuffer();
        String errorMessage = "";
        String functionNm = function.getName();
        sbLog.append("SAP JCO SERVER FUNCTION HANDLER\n") //
            .append("  FUNCTION        : " + functionNm).append("\n"); //

        Map<String, Object> sapFunction = (Map<String, Object>)sapFunctions.get(functionNm);
        if (sapFunction == null) {
            // 정의 되지 않은 Function을 호출 했을 경우 오류 처리
            errorMessage = NexosMessage.getDisplayMsg("JAVA.ED.136", "[" + functionNm + "] 해당 Function에 대한 처리는 정의되어 있지 않습니다.",
                new String[] {Util.toString(functionNm)});
            sbLog.append("  EXCEPTION       : ").append(errorMessage).append("\n");
            logger.debug(sbLog.toString());
            throw new RuntimeException(errorMessage);
        }

        Map<String, Object> resultInfo = (Map<String, Object>)sapFunctions.get("P_SAP_RESULT_INFO");
        String RESULT_CD_SUCCESS = (String)resultInfo.get("P_RESULT_CD_SUCCESS");
        String RESULT_CD_ERROR = (String)resultInfo.get("P_RESULT_CD_ERROR");
        String COLUMN_RESULT_CD = (String)resultInfo.get("P_COLUMN_RESULT_CD");
        String COLUMN_RESULT_MSG = (String)resultInfo.get("P_COLUMN_RESULT_MSG");

        JCoParameterList importParams = null;
        JCoFieldIterator fieldIter = null;
        JCoField field = null;
        String fieldNm = null;
        // 임포트(Input) 파라메터 로깅
        try {
            importParams = function.getImportParameterList();
            if (importParams != null && importParams.getFieldCount() > 0) {
                fieldIter = importParams.getFieldIterator();
                sbLog.append("  IMPORT PARAMETERS\n"); //
                while (fieldIter.hasNextField()) {
                    field = fieldIter.nextField();
                    fieldNm = field.getName();
                    sbLog.append(String.format("  %-15s : %s\n", fieldNm, importParams.getString(fieldNm))); //
                }
            } else {
                sbLog.append("  IMPORT PARAMETERS\n    NONE\n"); //
            }
        } catch (Exception e) {
            // 로깅 처리라 오류 무시하고 로그만 기록
            sbLog.append("  EXCEPTION       : ").append(getErrorMessage(e)).append("\n");
        }

        String tableNm = (String)sapFunction.get("P_SAP_TABLE_NM");
        // String sapParamMap = (String)sapFunction.get("P_SAP_PARAM_MAP");

        JCoTable table = null;
        // 테이블이 지정되어 있을 경우 Function에서 Table을 읽음
        if (Util.isNotNull(tableNm)) {
            // Returns the value of the i'th field as a table.
            try {
                table = function.getTableParameterList().getTable(tableNm);
            } catch (Exception e) {
                // 테이블 읽기 오류 처리
                errorMessage = getErrorMessage(
                    NexosMessage.getDisplayMsg("JAVA.ED.050", "[" + tableNm + "] 테이블 읽기 오류 : ", new String[] {Util.toString(tableNm)}), e);
                function.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_ERROR);
                function.getExportParameterList().setValue(COLUMN_RESULT_MSG, errorMessage);
                sbLog.append("  EXCEPTION       : ").append(errorMessage).append("\n");
                logger.debug(sbLog.toString());
                return;
            }
        }

        // 테이블을 파라메터로 수신 처리
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("P_BU_CD", sapFunction.get("P_BU_CD"));
        params.put("P_EDI_DIV", sapFunction.get("P_EDI_DIV"));
        params.put("P_DEFINE_NO", sapFunction.get("P_DEFINE_NO"));
        params.put("P_SAP_FUNCTION", function);
        params.put("P_SAP_TABLE", table);
        params.put("P_SAP_FUNCTION_NM", sapFunction.get("P_SAP_FUNCTION_NM"));
        params.put("P_SAP_TABLE_NM", sapFunction.get("P_SAP_TABLE_NM"));
        params.put("P_SAP_RESULT_INFO", resultInfo);
        params.put(Consts.PK_USER_ID, NexosSupport.getGlobalProperty("EDI.USER_ID", "NULL"));

        try {
            Map<String, Object> resultMap = receiveSAPFunction(params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            // 정상 리턴
            function.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_SUCCESS);
            function.getExportParameterList().setValue(COLUMN_RESULT_MSG, Consts.OK);
            sbLog.append(String.format("  EXPORT PARAMETERS\n  %-16s: %s\n", COLUMN_RESULT_CD, RESULT_CD_SUCCESS))
                .append(String.format("  %-15s : ", COLUMN_RESULT_MSG)).append(Consts.OK).append("\n");
        } catch (Exception e) {
            errorMessage = getErrorMessage(
                NexosMessage.getDisplayMsg("JAVA.ED.051", "[" + tableNm + "] 테이블 데이터 수신 처리 오류 : ", new String[] {Util.toString(tableNm)}), e);
            function.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_ERROR);
            function.getExportParameterList().setValue(COLUMN_RESULT_MSG, errorMessage);
            sbLog.append("  EXCEPTION       : ").append(errorMessage).append("\n");
            sbLog.append(String.format("  %-15s : ", COLUMN_RESULT_CD)).append(RESULT_CD_ERROR).append("\n");
            sbLog.append(String.format("  %-15s : ", COLUMN_RESULT_MSG)).append(errorMessage).append("\n");
        }
        logger.debug(sbLog.toString());
    }
    // ===============================================================================================================================================
    // [E]JCoServerFunctionHandler[E]
    // ===============================================================================================================================================

    @SuppressWarnings("unchecked")
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public Map<String, Object> receiveSAPFunction(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = new HashMap<String, Object>();

        params.put("P_DATA_DIV", Consts.DATA_DIV_SAP);

        Map<String, Object> resultInfo = (Map<String, Object>)params.get("P_SAP_RESULT_INFO");
        String returnAfterDataInsertYn = (String)resultInfo.get("P_RETURN_AFTER_DATA_INSERT");
        // Return after Data Insert
        if (Consts.YES.equals(returnAfterDataInsertYn)) {
            AuthenticationUtil.configureAuthentication();
            try {
                try {
                    TransactionStatus ts = null;
                    // Json parsing -> Insert EDI Table
                    ts = beginTrans();
                    try {
                        resultMap = dao.recvDataProcessing(params);

                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }

                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                } finally {
                    AuthenticationUtil.clearAuthentication();
                }

                params.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
                params.put("P_RECV_NO", resultMap.get("P_RECV_NO"));

                // Thread Call
                receiveSAPFunctionTask(params);

                Util.setOutMessage(params, Consts.OK);
            } catch (Exception e) {
                Util.setOutMessage(params, Util.getErrorMessage(e));
            }
        }
        // Return Processing Call
        else {
            AuthenticationUtil.configureAuthentication();
            try {
                try {
                    TransactionStatus ts = null;
                    // Json parsing -> Insert EDI Table
                    ts = beginTrans();
                    try {
                        resultMap = dao.recvDataProcessing(params);

                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }

                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    params.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
                    params.put("P_RECV_NO", resultMap.get("P_RECV_NO"));

                    // ER_PROCESSING 호출
                    ts = beginTrans();
                    try {
                        params.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);
                        resultMap = dao.callERProcessing(params);

                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // ER_PROCESSING_AFTER 호출
                    ts = beginTrans();
                    try {
                        resultMap = dao.callERProcessingAfter(params);

                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }
                    Util.setOutMessage(params, Consts.OK);
                } catch (Exception e) {
                    Util.setOutMessage(params, Util.getErrorMessage(e));
                }
            } finally {
                AuthenticationUtil.clearAuthentication();
            }
        }
        return params;
    }

    private void receiveSAPFunctionTask(Map<String, Object> params) {

        final HashMap<String, Object> callParams = new HashMap<String, Object>(params);
        new Thread(new Runnable() {

            @Override
            public void run() {
                AuthenticationUtil.configureAuthentication();
                try {
                    TransactionStatus ts = null;
                    Map<String, Object> resultMap;
                    // ER_PROCESSING 호출
                    ts = beginTrans();
                    try {
                        callParams.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);
                        resultMap = dao.callERProcessing(callParams);

                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // ER_PROCESSING_AFTER 호출
                    ts = beginTrans();
                    try {
                        resultMap = dao.callERProcessingAfter(callParams);

                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }
                } catch (Exception e) {
                } finally {
                    AuthenticationUtil.clearAuthentication();
                }
            }
        }).start();
    }

    /**
     * SAP JCO SERVER로 처리하는 송수신 정보 리턴
     *
     * @param params
     * @return
     */
    private List<Map<String, Object>> getSAPServerDefineInfo(Map<String, Object> params) {

        return getDataList(SELECT_ID_RS_SAP_SERVER_DEFINE_INFO, params);
    }
}
