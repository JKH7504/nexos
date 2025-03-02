package nexos.service.ed.common;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FilenameUtils;
import org.quartz.Trigger;
import org.quartz.TriggerKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import nexos.dao.ed.common.EDCommonDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.db.dynamic.DynamicDataSource;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: EDCommonService<br>
 * Description: 인터페이스 송수신 서비스를 담당하는 공통 Class(트랜잭션처리 담당)<br>
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
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDCommonService extends ServiceSupport {

    private final Logger          logger                       = LoggerFactory.getLogger(EDCommonService.class);

    final String                  SELECT_ID_SEND_DETAIL_INFO   = "EDCOMMON.RS_SEND_DETAIL_INFO";
    final String                  SP_ID_ES_FILE_NM_UPDATE      = "ES_FILE_NM_UPDATE";
    final String                  SP_ID_EM_IFTASK_CHECKING     = "EM_IFTASK_CHECKING";
    final String                  SP_ID_EM_IFRESULT_PROCESSING = "EM_IFRESULT_PROCESSING";

    @Autowired
    private EDCommonDAO           dao;

    @Autowired
    private EDTaskManagerService  edTaskManagerService;

    @Autowired
    private EDSAPService          edSAPService;

    @Autowired
    private EDCustomMethodService edJavaMethodService;

    public String execTask(Map<String, Object> params) {

        String result = Consts.OK;

        // String buCd = (String)params.get("P_BU_CD");
        // String ediDiv = (String)params.get("P_EDI_DIV");
        // String defineNo = (String)params.get("P_DEFINE_NO");
        String defineDiv = (String)params.get("P_DEFINE_DIV");
        // String dataDiv = Util.nullToEmpty(params.get("P_DATA_DIV"));
        String userId = NexosSupport.getGlobalProperty("EDI.USER_ID");

        params.put(Consts.PK_USER_ID, userId);
        params.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CREATE);
        boolean taskCheckedSuccess = true;
        try {
            // 스케줄 실행 기록
            try {
                checkingExecTask(params, Consts.DIRECTION_FW);
            } catch (Exception e) {
                taskCheckedSuccess = false;
                throw e;
            }

            // 송수신일자 입력
            params.put("P_EDI_DATE", dao.getEDIDate());

            // 이전 오류내역 처리
            errorProcessing(params);

            // 수신 처리
            if (Consts.DEFINE_DIV_RECV.equals(defineDiv)) {
                result = taskRecvProcessing(params);
            }
            // 송신 처리
            else if (Consts.DEFINE_DIV_SEND.equals(defineDiv)) {
                result = taskSendProcessing(params);
            }
        } catch (Exception e) {
            result = Util.getErrorMessage(e);
        } finally {
            // 스케줄 실행 제거
            if (taskCheckedSuccess) {
                checkingExecTask(params, Consts.DIRECTION_BW);
            }
        }

        return result;
    }

    private void checkingExecTask(Map<String, Object> params, String direction) {

        Map<String, Object> callParams = new HashMap<String, Object>();
        callParams.put("P_BU_CD", params.get("P_BU_CD"));
        callParams.put("P_EDI_DIV", params.get("P_EDI_DIV"));
        callParams.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
        callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
        callParams.put("P_DIRECTION", direction);
        try {
            callParams.put("P_SERVER_IP", InetAddress.getLocalHost().getHostAddress());
        } catch (Exception e) {
            callParams.put("P_SERVER_IP", "0.0.0.0");
        }
        callParams.put("P_SERVER_SALT", NexosSupport.getGlobalProperty("WEBAPP.SALT"));

        TransactionStatus ts = beginTrans();
        try {
            Map<String, Object> resultMap = callProcedure(SP_ID_EM_IFTASK_CHECKING, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            if (Consts.DIRECTION_FW.equals(direction)) {
                throw e;
            }
        }
    }

    public String taskRecvProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.OK;

        // 파라메터 값 읽기
        String buCd = (String)params.get("P_BU_CD");
        String ediDiv = (String)params.get("P_EDI_DIV");
        String defineNo = (String)params.get("P_DEFINE_NO");
        String customMethod = (String)params.get("P_CUSTOM_METHOD");

        // Java Method가 지정되어 있을 경우 별도 로직으로 처리
        if (Util.isNotNull(customMethod)) {
            try {
                result = customMethodProcessing(params);
            } catch (Exception e) {
                result = Util.getErrorMessage(e).replace("\n", " ");
                if (!result.startsWith("[")) {
                    result = "[사업부,송수신구분,정의번호: " + buCd + "," + ediDiv + "," + defineNo + "] " + result;
                }
            }

            return result;
        }

        // 추가 파라메터 값 읽기
        // String defineDiv = (String)params.get("P_DEFINE_DIV");
        String dataDiv = Util.nullToEmpty(params.get("P_DATA_DIV"));
        // String userId = (String)params.get(Consts.PK_USER_ID);
        // String recvDate = (String)params.get("P_EDI_DATE");

        String oMsg;
        Map<String, Object> resultMap = null;
        Map<String, Object> callParams = new HashMap<String, Object>();
        // 호출 파라메터 기본값 입력
        callParams.put("P_BU_CD", buCd);
        callParams.put("P_EDI_DIV", ediDiv);
        callParams.put("P_DEFINE_NO", defineNo);
        callParams.put("P_DATA_DIV", dataDiv);
        callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));

        params.put("P_RECV_DATE", params.get("P_EDI_DATE"));
        params.put("P_RECV_NO", "");

        TransactionStatus ts = null;
        try {
            // DBLink 처리
            if (Consts.DATA_DIV_DBLINK.equals(dataDiv)) {
                // 프로세스를 수신처리하도록 세팅
                callParams.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CREATE);

                // Call RecvDBLink
                ts = beginTrans();
                try {
                    resultMap = dao.recvDBLink(callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    throw new RuntimeException(Util.getErrorMessage(e));
                }

                // 실제 처리된 수신일자/번호 입력
                callParams.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
                callParams.put("P_RECV_NO", resultMap.get("P_RECV_NO"));

                // Call ERProcessingAfter
                taskRecvProcessingAfter(callParams);
            }
            // DBConnect 처리
            else if (Consts.DATA_DIV_DBCONNECT.equals(dataDiv)) {
                // Call RecvDBConnect
                TransactionStatus dbcTs = null;
                DynamicDataSource dbcDataSource = null;

                dbcDataSource = dao.getDynamicDataSource(params);
                try {
                    ts = beginTrans();
                    // DB 접속불가시 beginTrans에서 오류 발생
                    dbcTs = dbcDataSource.beginTrans();

                    resultMap = dao.recvDBConnect(params);

                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }

                    commitTrans(ts);
                    dbcDataSource.commitTrans(dbcTs);
                } catch (Exception e) {
                    try {
                        rollbackTrans(ts);
                    } catch (Exception ex) {
                    }
                    try {
                        dbcDataSource.rollbackTrans(dbcTs);
                    } catch (Exception ex) {
                    }
                    throw new RuntimeException(Util.getErrorMessage(e));
                }

                // 실제 처리된 수신일자/번호 입력
                callParams.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
                callParams.put("P_RECV_NO", resultMap.get("P_RECV_NO"));
                // 프로세스를 컬럼체크 처리하도록 세팅
                callParams.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);

                // Call ERProcessing
                ts = beginTrans();
                try {
                    resultMap = dao.callERProcessing(callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    throw new RuntimeException(Util.getErrorMessage(e));
                }

                // Call ERProcessingAfter
                taskRecvProcessingAfter(callParams);
            }
            // SAP
            else if (Consts.DATA_DIV_SAP.equals(dataDiv)) {
                String remoteDiv = (String)params.get("P_REMOTE_DIV");
                // SAP RFC일 경우만 처리, SAP JCO Server을 SAP에서 호출
                if (Consts.REMOTE_DIV_SAP_RFC.equals(remoteDiv)) {
                    // Call SAP RFC, 처리결과 정보
                    Map<String, Object> resultInfo = dao.getSAPResultInfo((String)params.get("P_SAP_RESULT_MAP"));
                    params.put("P_SAP_RESULT_INFO", resultInfo);

                    String RESULT_CD_SUCCESS = (String)resultInfo.get("P_RESULT_CD_SUCCESS");
                    String RESULT_CD_ERROR = (String)resultInfo.get("P_RESULT_CD_ERROR");
                    String COLUMN_RESULT_CD = (String)resultInfo.get("P_COLUMN_RESULT_CD");
                    String COLUMN_RESULT_MSG = (String)resultInfo.get("P_COLUMN_RESULT_MSG");
                    String RETURN_AFTER_DATA_INSERT = (String)resultInfo.get("P_RETURN_AFTER_DATA_INSERT");

                    com.sap.conn.jco.JCoDestination sapDestination = null;
                    com.sap.conn.jco.JCoFunction sapFunction = null;
                    ts = beginTrans();

                    // Get SAP Function Object
                    String functionNm = (String)params.get("P_SAP_FUNCTION_NM");
                    sapFunction = getSAPFunction(params);
                    sapDestination = (com.sap.conn.jco.JCoDestination)params.get("P_SAP_DESTINATION");
                    boolean rfcErrorResult = false;
                    try {
                        // Set SAP Import Parameter [IN]
                        setSAPFunctionImportParameter(params);
                        // Call Function
                        // Begins a stateful call sequence for calls to the specified destination.
                        com.sap.conn.jco.JCoContext.begin(sapDestination);
                        try {
                            sapFunction.execute(sapDestination);
                        } finally {
                            // Ends a stateful call sequence for calls to the specified destination.
                            com.sap.conn.jco.JCoContext.end(sapDestination);
                        }
                        // Checking Function Result
                        if (!RESULT_CD_SUCCESS.equals(sapFunction.getExportParameterList().getString(COLUMN_RESULT_CD))) {
                            rfcErrorResult = true;
                            throw new RuntimeException("[" + functionNm + "] " + sapFunction.getExportParameterList().getString(COLUMN_RESULT_MSG));
                        }

                        // Get Table
                        // com.sap.conn.jco.JCoTable sapTable = null;
                        // sapTable = getSAPTable(callParams);
                        getSAPTable(params);

                        resultMap = dao.recvSAPFunction(params);

                        oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }

                        commitTrans(ts);
                        if (Consts.YES.equals(RETURN_AFTER_DATA_INSERT)) {
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_SUCCESS);
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_MSG, Consts.OK);
                        }
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        if (!rfcErrorResult) {
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_ERROR);
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_MSG, edSAPService.getErrorMessage(e));
                        }
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // 실제 처리된 수신일자/번호 입력
                    callParams.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
                    callParams.put("P_RECV_NO", resultMap.get("P_RECV_NO"));
                    // 프로세스를 컬럼체크 처리하도록 세팅
                    callParams.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);

                    // Call ERProcessing
                    ts = beginTrans();
                    try {
                        resultMap = dao.callERProcessing(callParams);
                        oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                        if (!Consts.YES.equals(RETURN_AFTER_DATA_INSERT)) {
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_SUCCESS);
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_MSG, Consts.OK);
                        }
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        if (!Consts.YES.equals(RETURN_AFTER_DATA_INSERT)) {
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_ERROR);
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_MSG, Util.getErrorMessage(e));
                        }
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // Call ERProcessingAfter
                    taskRecvProcessingAfter(callParams);
                }
            }
            // TEXT, EXCEL, XML, JSON 파일 처리
            else if (dataDiv.startsWith("3")) {
                String remoteDiv = (String)params.get("P_REMOTE_DIV");
                String prefixFileNm = (String)params.get("P_PREFIX_FILE_NM");

                // FTP일 경우
                if (Consts.REMOTE_DIV_FTP.equals(remoteDiv) || Consts.REMOTE_DIV_SFTP.equals(remoteDiv)) {

                    // 파일 수신 처리, FTP를 통한 처리, 접속정보 Validation은 TaskManagerService에서 처리
                    String remoteIp = (String)params.get("P_REMOTE_IP");
                    String remotePort = (String)params.get("P_REMOTE_PORT");
                    String remotePassiveYn = (String)params.get("P_REMOTE_PASSIVE_YN");
                    String remoteCharset = (String)params.get("P_REMOTE_CHARSET");
                    int remoteConnTimeout = Util.toInt(params.get("P_REMOTE_CONN_TIMEOUT"), 60);
                    int remoteReadTimeout = Util.toInt(params.get("P_REMOTE_READ_TIMEOUT"), 300);
                    String remoteUserId = (String)params.get("P_REMOTE_USER_ID");
                    String remoteUserPwd = (String)params.get("P_REMOTE_USER_PWD");
                    String remoteDir = (String)params.get("P_REMOTE_DIR");
                    Map<String, Object> remoteParamMap = Util.toKeyValues((String)params.get("P_REMOTE_PARAM_MAP"));
                    String remoteAuthKey = (String)remoteParamMap.get("REMOTE_AUTH_KEY");

                    // 수신 경로 세팅
                    String ediDir = (String)params.get("P_EDI_DIR");
                    if (Util.isNull(ediDir)) {
                        ediDir = ediDiv + File.separator;
                    }
                    String ediRecvDatetime = Util.getNowDate("yyyyMMddHHmmss");
                    String ediFileRoot = dao.getRecvFileRootPath();
                    String ediRecvFullPath = Util.getPathName(ediFileRoot, ediDir);
                    String ediRecvFileBackupPath = dao.getBackupFilePath(ediRecvFullPath, ediRecvDatetime, ediDiv);

                    Util.createDir(ediRecvFullPath, ediRecvFileBackupPath);

                    // FTP 파일 다운로드
                    try {
                        resultMap = dao.ftpDownload(remoteDiv, remoteIp, remotePort, remotePassiveYn, remoteCharset, remoteConnTimeout,
                            remoteReadTimeout, remoteUserId, remoteUserPwd, remoteAuthKey, remoteDir, prefixFileNm, ediRecvFullPath);
                        oMsg = Util.getOutMessage(resultMap);
                        if (Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                    } catch (Exception e) {
                        Util.writeErrorMessage("EDCommonService[taskRecvProcessing] ftpDownload Error", e);
                    }

                    // 다운로드한 파일 처리
                    File ediFullDir = new File(ediRecvFullPath);
                    if (ediFullDir.exists()) {
                        // EDI 디렉토리에서 파일에 대한 리스트 가져오기
                        File[] ediFiles = ediFullDir.listFiles(new FileFilter() {
                            @Override
                            public boolean accept(File pathname) {
                                return pathname.isFile();
                            }
                        });
                        if (ediFiles.length == 0) {
                            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.029", "수신 처리할 파일이 없습니다."));
                        }

                        // 기본 처리 파라메터 입력
                        callParams.put("P_RECV_DATE", params.get("P_RECV_DATE"));
                        callParams.put("P_FILE_DIV", Consts.FILE_DIV_SERVER); // 수신 파일구분 세팅, 서버의 파일

                        for (int i = 0, fileCount = ediFiles.length; i < fileCount; i++) {
                            File ediFile = ediFiles[i];
                            String ediFileName = ediFile.getPath();

                            callParams.put("P_FILE_DIR", FilenameUtils.getFullPath(ediFileName));
                            callParams.put("P_FILE_NM", FilenameUtils.getName(ediFileName));
                            // logger.info("EDCommonService[taskRecvProcessing] >> " + (String)callParams.get("P_FILE_NM"));

                            // 파일 파싱 후 EDI 테이블에 데이터 생성
                            // Call RecvDataProcessing
                            ts = beginTrans();
                            try {
                                resultMap = dao.recvDataProcessing(callParams);

                                oMsg = Util.getOutMessage(resultMap);
                                if (!Consts.OK.equals(oMsg)) {
                                    throw new RuntimeException(oMsg);
                                }
                                commitTrans(ts);
                            } catch (Exception e) {
                                rollbackTrans(ts);
                                Util.writeErrorMessage("EDCommonService[taskRecvProcessing] Recv[A] Error : " + ediFile.getPath(), e);
                                // 오류시 다음 파일 처리
                                continue;
                            }

                            // 실제 처리된 수신일자/번호 입력
                            callParams.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
                            callParams.put("P_RECV_NO", resultMap.get("P_RECV_NO"));
                            // 프로세스를 컬럼체크 처리하도록 세팅
                            callParams.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);

                            // Call ERProcessing
                            ts = beginTrans();
                            try {
                                resultMap = dao.callERProcessing(callParams);
                                oMsg = Util.getOutMessage(resultMap);
                                if (!Consts.OK.equals(oMsg)) {
                                    throw new RuntimeException(oMsg);
                                }
                                commitTrans(ts);
                            } catch (Exception e) {
                                rollbackTrans(ts);
                                Util.writeErrorMessage("EDCommonService[taskRecvProcessing] Recv[B] Error : " + ediFile.getPath(), e);
                                // 오류시 다음 파일 처리
                                continue;
                            }

                            // Call ERProcessingAfter
                            taskRecvProcessingAfter(callParams);
                        }
                    }
                }
                // 원격 웹서비스
                else if (Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {

                    // 기본 처리 파라메터 입력
                    callParams.put("P_RECV_DATE", params.get("P_RECV_DATE"));
                    callParams.put("P_FILE_DIV", Consts.FILE_DIV_DOC); // 수신 파일구분 세팅, 파라메터에 포함된 문서
                    callParams.put("P_PREFIX_FILE_NM", prefixFileNm);

                    // 웹서비스 수신 처리, 접속정보 Validation은 TaskManagerService에서 처리
                    callParams.put("P_WEBSERVICE_DIV", params.get("P_WEBSERVICE_DIV"));
                    callParams.put("P_WEBSERVICE_URL", params.get("P_WEBSERVICE_URL"));
                    callParams.put("P_WEBSERVICE_HEADER_VAL", params.get("P_WEBSERVICE_HEADER_VAL"));
                    callParams.put("P_WEBSERVICE_METHOD", params.get("P_WEBSERVICE_METHOD"));
                    callParams.put("P_WEBSERVICE_NS_PREFIX", params.get("P_WEBSERVICE_NS_PREFIX"));
                    callParams.put("P_WEBSERVICE_NS_URI", params.get("P_WEBSERVICE_NS_URI"));
                    callParams.put("P_WEBSERVICE_TAG_RESULT", params.get("P_WEBSERVICE_TAG_RESULT"));
                    callParams.put("P_WEBSERVICE_PARAM_NM", params.get("P_WEBSERVICE_PARAM_NM"));
                    callParams.put("P_WEBSERVICE_PARAM_VAL", params.get("P_WEBSERVICE_PARAM_VAL"));
                    callParams.put("P_WEBSERVICE_AUTH_DIV", params.get("P_WEBSERVICE_AUTH_DIV"));
                    callParams.put("P_WEBSERVICE_AUTH_URL", params.get("P_WEBSERVICE_AUTH_URL"));
                    callParams.put("P_WEBSERVICE_AUTH_TYPE", params.get("P_WEBSERVICE_AUTH_TYPE"));
                    callParams.put("P_WEBSERVICE_AUTH_CID", params.get("P_WEBSERVICE_AUTH_CID"));
                    callParams.put("P_WEBSERVICE_AUTH_CSECRET", params.get("P_WEBSERVICE_AUTH_CSECRET"));
                    callParams.put("P_REMOTE_CONN_TIMEOUT", params.get("P_REMOTE_CONN_TIMEOUT"));
                    callParams.put("P_REMOTE_READ_TIMEOUT", params.get("P_REMOTE_READ_TIMEOUT"));
                    callParams.put("P_REMOTE_USER_ID", params.get("P_REMOTE_USER_ID"));
                    callParams.put("P_REMOTE_USER_PWD", params.get("P_REMOTE_USER_PWD"));
                    callParams.put("P_JSON_RESULT_INFO", dao.getJsonResultInfo((String)params.get("P_JSON_TAG_RESULT"), //
                        (String)params.get("P_JSON_TAG_RESULT_MAP")));
                    callParams.put("P_XML_RESULT_INFO", dao.getXMLResultInfo((String)params.get("P_XML_TAG_RESULT"), //
                        (String)params.get("P_XML_TAG_RESULT_MAP")));

                    // 웹서비스 호출
                    try {
                        resultMap = dao.recvWebService(callParams);

                        oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                    } catch (Exception e) {
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // 수신 처리한 문서 파라메터에 입력
                    callParams.put("P_DOCUMENT", resultMap.get("O_DOCUMENT"));

                    // 파일 파싱 후 EDI 테이블에 데이터 생성
                    // Call RecvDataProcessing
                    ts = beginTrans();
                    try {
                        resultMap = dao.recvDataProcessing(callParams);

                        oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // 실제 처리된 수신일자/번호 입력
                    callParams.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
                    callParams.put("P_RECV_NO", resultMap.get("P_RECV_NO"));
                    // 프로세스를 컬럼체크 처리하도록 세팅
                    callParams.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);

                    // Call ERProcessing
                    ts = beginTrans();
                    try {
                        resultMap = dao.callERProcessing(callParams);
                        oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // Call ERProcessingAfter
                    taskRecvProcessingAfter(callParams);
                }
            }
        } catch (Exception e) {
            result = Util.getErrorMessage(e).replace("\n", " ");
            if (!result.startsWith("[")) {
                result = "[사업부,송수신구분,정의번호: " + buCd + "," + ediDiv + "," + defineNo + "] " + result;
            }
        }

        return result;
    }

    public String taskRecvProcessingAfter(Map<String, Object> params) {

        String result = Consts.OK;

        Map<String, Object> realtimeMap = null;
        TransactionStatus ts = beginTrans();
        try {
            Map<String, Object> resultMap = dao.callERProcessingAfter(params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            realtimeMap = realtimeSendProcessing();
            oMsg = Util.getOutMessage(realtimeMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            commitTrans(ts);
            // logger.info("EDCommonService[recvProcessingAfter] : OK");
        } catch (Exception e) {
            rollbackTrans(ts);
            Util.writeErrorMessage("EDCommonService[recvProcessingAfter] Error", e);
        }

        // 실시간 결과 데이터 반영, 자체 트랜잭션 처리 함, 송신이 정상일 경우만
        if (realtimeMap != null && Consts.OK.equals(Util.getOutMessage(realtimeMap))) {
            ifResultProcessing(realtimeMap);
        }

        return result;
    }

    public String taskSendProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.OK;

        // 파라메터 값 읽기
        String buCd = (String)params.get("P_BU_CD");
        String ediDiv = (String)params.get("P_EDI_DIV");
        String defineNo = (String)params.get("P_DEFINE_NO");
        String customMethod = (String)params.get("P_CUSTOM_METHOD");

        // Java Method가 지정되어 있을 경우 별도 로직으로 처리
        if (Util.isNotNull(customMethod)) {
            try {
                result = customMethodProcessing(params);
            } catch (Exception e) {
                result = Util.getErrorMessage(e).replace("\n", " ");
                if (!result.startsWith("[")) {
                    result = "[사업부,송수신구분,정의번호: " + buCd + "," + ediDiv + "," + defineNo + "] " + result;
                }
            }

            return result;
        }

        // 추가 파라메터 값 읽기
        // String defineDiv = (String)params.get("P_DEFINE_DIV");
        String dataDiv = Util.nullToEmpty(params.get("P_DATA_DIV"));
        String userId = (String)params.get(Consts.PK_USER_ID);
        String remoteDiv = (String)params.get("P_REMOTE_DIV");
        String prefixFileNm = (String)params.get("P_PREFIX_FILE_NM");
        String processCd = (String)params.get(Consts.PK_PROCESS_CD);

        String sendDate = "";
        String sendNo = "";
        String centerCd = "";
        String inoutDate = "";

        // A - 송신 데이터 생성[스케줄], AM - 송신 데이터 생성[매뉴얼]
        if (Util.isIncluded(processCd, new Object[] {Consts.EDI_PROCESS_CREATE, Consts.EDI_PROCESS_CREATE_MANUAL})) {
            sendDate = (String)params.get("P_EDI_DATE");
            centerCd = (String)params.get("P_CENTER_CD");

            // 지정된 물류센터가 없을 경우 "%", 전체물류센터로 세팅, 스케줄은 항상 "%"
            if (Util.isNull(centerCd)) {
                centerCd = Consts.ALL;
            }
            inoutDate = (String)params.get("P_INOUT_DATE");
            // 지정된 입출고일자가 없을 경우 송신일자로 세팅, 스케줄은 항상 동일
            if (Util.isNull(inoutDate)) {
                inoutDate = sendDate;
            }
        }
        // B: 컬럼체크, C: 데이터송신
        else {
            sendDate = (String)params.get("P_SEND_DATE");
            sendNo = (String)params.get("P_SEND_NO");
        }

        String oMsg;
        Map<String, Object> resultMap = null;
        Map<String, Object> callParams = new HashMap<String, Object>();
        List<Map<String, Object>> lstEMIFResultProcessing = new ArrayList<Map<String, Object>>();
        // 호출 파라메터 기본값 입력
        callParams.put("P_BU_CD", buCd);
        callParams.put("P_EDI_DIV", ediDiv);
        callParams.put("P_DEFINE_NO", defineNo);
        callParams.put("P_DATA_DIV", dataDiv);
        callParams.put("P_SEND_DATE", sendDate);
        callParams.put("P_SEND_NO", sendNo);
        callParams.put(Consts.PK_PROCESS_CD, processCd);
        callParams.put(Consts.PK_USER_ID, userId);
        callParams.put("P_CENTER_CD", centerCd);
        callParams.put("P_INOUT_DATE", inoutDate);
        callParams.put("P_SEND_DIV", "1"); // 1 - TASKSCHEDULER(ES<TABLE>), 2 - REALTIME(CTCHECKVALUEEX)

        TransactionStatus ts = null;
        try {
            // DBLink 처리
            if (Consts.DATA_DIV_DBLINK.equals(dataDiv)) {
                // Call SendDBLink
                ts = beginTrans();
                try {
                    resultMap = dao.sendDBLink(callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    throw new RuntimeException(Util.getErrorMessage(e));
                }
            }
            // DB Connect 처리
            else if (Consts.DATA_DIV_DBCONNECT.equals(dataDiv)) {
                // Call ESProcessing
                ts = beginTrans();
                try {
                    resultMap = dao.callESProcessingResult(callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    throw new RuntimeException(Util.getErrorMessage(e));
                }

                // A - 송신 데이터 생성일 경우 송신 데이터가 생성되지 않으면(송신 데이터가 없으면) 오류
                if (Util.isIncluded(processCd, new Object[] {Consts.EDI_PROCESS_CREATE, Consts.EDI_PROCESS_CREATE_MANUAL})) {
                    sendNo = (String)resultMap.get("O_SEND_NO");
                    if (Util.isNull(sendNo)) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.009", "송신처리할 데이터가 존재하지 않습니다."));
                    }
                    params.put("P_SEND_DATE", resultMap.get("O_SEND_DATE"));
                    params.put("P_SEND_NO", sendNo);
                }

                // Call SendDataProcessing
                TransactionStatus dbcTs = null;
                DynamicDataSource dbcDataSource = null;

                dbcDataSource = dao.getDynamicDataSource(params);
                try {
                    ts = beginTrans();
                    // DB 접속불가시 beginTrans에서 오류 발생
                    dbcTs = dbcDataSource.beginTrans();

                    resultMap = dao.sendDataProcessing(params);

                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }

                    commitTrans(ts);
                    dbcDataSource.commitTrans(dbcTs);
                } catch (Exception e) {
                    try {
                        rollbackTrans(ts);
                    } catch (Exception ex) {
                    }
                    try {
                        dbcDataSource.rollbackTrans(dbcTs);
                    } catch (Exception ex) {
                    }
                    throw new RuntimeException(Util.getErrorMessage(e));
                }
            }
            // SAP
            else if (Consts.DATA_DIV_SAP.equals(dataDiv)) {
                // Call ESProcessing
                ts = beginTrans();
                try {
                    resultMap = dao.callESProcessingResult(callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    throw new RuntimeException(Util.getErrorMessage(e));
                }

                // SAP 처리결과 정보
                Map<String, Object> resultInfo = dao.getSAPResultInfo((String)params.get("P_SAP_RESULT_MAP"));
                String COLUMN_RESULT_CD = (String)resultInfo.get("P_COLUMN_RESULT_CD");
                String COLUMN_RESULT_MSG = (String)resultInfo.get("P_COLUMN_RESULT_MSG");
                String RESULT_CD_SUCCESS = (String)resultInfo.get("P_RESULT_CD_SUCCESS");
                String RESULT_CD_ERROR = (String)resultInfo.get("P_RESULT_CD_ERROR");
                params.put("P_SAP_RESULT_INFO", resultInfo);

                // A - 송신 데이터 생성일 경우 송신 데이터가 생성되지 않으면(송신 데이터가 없으면) 오류
                if (Util.isIncluded(processCd, new Object[] {Consts.EDI_PROCESS_CREATE, Consts.EDI_PROCESS_CREATE_MANUAL})) {
                    sendNo = (String)resultMap.get("O_SEND_NO");
                    if (Util.isNull(sendNo)) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.009", "송신처리할 데이터가 존재하지 않습니다."));
                    }
                    params.put("P_SEND_DATE", resultMap.get("O_SEND_DATE"));
                    params.put("P_SEND_NO", sendNo);
                }
                params.put(Consts.PK_QUERY_ID, SELECT_ID_SEND_DETAIL_INFO);
                params.put("P_VIEW_DIV", "2"); // 2 - 스케줄

                // Call SendDataProcessing
                com.sap.conn.jco.JCoDestination sapDestination = null;
                com.sap.conn.jco.JCoFunction sapFunction = null;
                // com.sap.conn.jco.JCoTable sapTable = null;
                // Get SAP Function Object
                String functionNm = (String)params.get("P_SAP_FUNCTION_NM");
                sapFunction = getSAPFunction(params);
                sapDestination = (com.sap.conn.jco.JCoDestination)params.get("P_SAP_DESTINATION");
                // sapTable = getSAPTable(callParams);
                getSAPTable(params);
                boolean rfcErrorResult = false;
                try {
                    // Set SAP Import Parameter [IN]
                    setSAPFunctionImportParameter(params);

                    resultMap = dao.sendDataProcessing(params);

                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }

                    // Call Function
                    // Begins a stateful call sequence for calls to the specified destination.
                    com.sap.conn.jco.JCoContext.begin(sapDestination);
                    try {
                        sapFunction.execute(sapDestination);
                    } finally {
                        // Ends a stateful call sequence for calls to the specified destination.
                        com.sap.conn.jco.JCoContext.end(sapDestination);
                    }

                    // Checking Function Result
                    if (!RESULT_CD_SUCCESS.equals(sapFunction.getExportParameterList().getString(COLUMN_RESULT_CD))) {
                        rfcErrorResult = true;
                        throw new RuntimeException("[" + functionNm + "] " + sapFunction.getExportParameterList().getString(COLUMN_RESULT_MSG));
                    }

                    sapFunction.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_SUCCESS);
                    sapFunction.getExportParameterList().setValue(COLUMN_RESULT_MSG, Consts.OK);
                } catch (Exception e) {
                    if (!rfcErrorResult) {
                        sapFunction.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_ERROR);
                        sapFunction.getExportParameterList().setValue(COLUMN_RESULT_MSG, edSAPService.getErrorMessage(e));
                    }
                    throw new RuntimeException(Util.getErrorMessage(e));
                }

                // SAP Function Call이 정상이면 송신진행상태 업데이트
                params.put("P_ERROR_MSG", Consts.OK);
                params.put("P_FILE_NM", null);

                // Call ESFileNmUpdate
                ts = beginTrans();
                try {
                    resultMap = callProcedure(SP_ID_ES_FILE_NM_UPDATE, params);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    Util.writeErrorMessage("EDCommonService[taskSendProcessing] Send[D] Error", e);
                }
            }
            // 파일 처리 - XML, JSON, TEXT, XLS
            else if (dataDiv.startsWith("3")) {
                // Call ESProcessing
                ts = beginTrans();
                try {
                    resultMap = dao.callESProcessing(callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    Util.writeErrorMessage("EDCommonService[taskSendProcessing] Send[A] Error", e);
                }

                callParams.remove("P_CENTER_CD");
                callParams.remove("P_INOUT_DATE");
                callParams.remove(Consts.PK_PROCESS_CD);

                List<Map<String, Object>> lstSendInfo = null;
                // 프로세스 코드가 A일 경우 EDI 테이블에서 정상처리 후 미송신된 송신일자/송신번호 정보 전체를 처리
                if (Util.isIncluded(processCd, new Object[] {Consts.EDI_PROCESS_CREATE, Consts.EDI_PROCESS_CREATE_MANUAL})) {
                    callParams.remove("P_SEND_NO");
                    lstSendInfo = dao.getSendInfo(callParams);
                }
                // 프로세스 코드가 B, C일 경우는 지정한 송신번호만 처리
                else {
                    // 아래 동일 로직으로 처리하기 위해 List에 담음
                    lstSendInfo = new ArrayList<Map<String, Object>>();
                    Map<String, Object> sendData = new HashMap<String, Object>();
                    sendData.put("SEND_DATE", callParams.get("P_SEND_DATE"));
                    sendData.put("SEND_NO", callParams.get("P_SEND_NO"));
                    lstSendInfo.add(sendData);
                }

                // 송신 데이터가 생성 되었을 경우에 처리
                if (lstSendInfo != null && lstSendInfo.size() > 0) {

                    // 파일 송신을 위한 기본 처리
                    String ediDir = (String)params.get("P_EDI_DIR"); // 송수신정의 EDI 파일 경로
                    // EDI 파일 경로 미지정시 송수신구분으로 지정
                    if (Util.isNull(ediDir)) {
                        ediDir = ediDiv + File.separator;
                    }
                    String ediFileRoot = dao.getSendFileRootPath(); // EDI 송신 루트
                    String ediSendDatetime = Util.getNowDate("yyyyMMddHHmmss"); // 송신일시 - yyyyMMddHHmmss
                    String ediSendAbsolutePath = null; // 로컬 파일 생성시 절대 경로로 지정시 파일 생성 경로

                    // 파일 생성 위치
                    // 원격 송수신일 경우 -> 상대 경로, EDI 송신 루트 하위
                    // 원격 송수신이 아닐 경우 -> 상대 경로 또는 절대 경로, 절대 경로는 부등호로 입력 <C:\EDI>

                    // 로컬 파일 생성, 절대 경로일 경우 경로 재조정
                    if (Util.isNull(remoteDiv) && ediDir.startsWith("<") && ediDir.endsWith(">")) {
                        ediSendAbsolutePath = ediDir.substring(1, ediDir.length() - 1);
                        ediDir = ediDiv + File.separator;
                    }
                    String ediSendFullPath = Util.getPathName(ediFileRoot, ediDir); // EDI 송신 루트\EDI 파일 경로
                    // EDI 송신 루트\EDI 파일 경로\yyyyMMdd
                    String ediSendFileBackupPath = dao.getBackupFilePath(ediSendFullPath, ediSendDatetime, ediDiv);
                    // Dir 생성
                    Util.createDir(ediSendFullPath, ediSendFileBackupPath, ediSendAbsolutePath);

                    // 송신 원격 정보
                    String remoteIp = (String)params.get("P_REMOTE_IP");
                    String remotePort = (String)params.get("P_REMOTE_PORT");
                    String remotePassiveYn = (String)params.get("P_REMOTE_PASSIVE_YN");
                    String remoteCharset = (String)params.get("P_REMOTE_CHARSET");
                    int remoteConnTimeout = Util.toInt(params.get("P_REMOTE_CONN_TIMEOUT"), 60);
                    int remoteReadTimeout = Util.toInt(params.get("P_REMOTE_READ_TIMEOUT"), 300);
                    String remoteUserId = (String)params.get("P_REMOTE_USER_ID");
                    String remoteUserPwd = (String)params.get("P_REMOTE_USER_PWD");
                    String remoteDir = (String)params.get("P_REMOTE_DIR");
                    Map<String, Object> remoteParamMap = Util.toKeyValues((String)params.get("P_REMOTE_PARAM_MAP"));
                    String remoteAuthKey = (String)remoteParamMap.get("REMOTE_AUTH_KEY");

                    // 파라메터 기본값 세팅
                    // FTP, SFTP
                    if (Consts.REMOTE_DIV_FTP.equals(remoteDiv) || Consts.REMOTE_DIV_SFTP.equals(remoteDiv)) {
                        callParams.put("P_FILE_DIV", Consts.FILE_DIV_SERVER);
                    }
                    // Local WebService, Remote WebService
                    else if (Consts.REMOTE_DIV_LOCAL_WS.equals(remoteDiv) || Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {
                        callParams.put("P_FILE_DIV", Consts.FILE_DIV_DOC);

                        callParams.put("P_WEBSERVICE_DIV", params.get("P_WEBSERVICE_DIV"));
                        callParams.put("P_WEBSERVICE_URL", params.get("P_WEBSERVICE_URL"));
                        callParams.put("P_WEBSERVICE_METHOD", params.get("P_WEBSERVICE_METHOD"));
                        callParams.put("P_WEBSERVICE_HEADER_VAL", params.get("P_WEBSERVICE_HEADER_VAL"));
                        callParams.put("P_WEBSERVICE_NS_PREFIX", params.get("P_WEBSERVICE_NS_PREFIX"));
                        callParams.put("P_WEBSERVICE_NS_URI", params.get("P_WEBSERVICE_NS_URI"));
                        callParams.put("P_WEBSERVICE_TAG_RESULT", params.get("P_WEBSERVICE_TAG_RESULT"));
                        callParams.put("P_WEBSERVICE_PARAM_NM", params.get("P_WEBSERVICE_PARAM_NM"));
                        callParams.put("P_WEBSERVICE_PARAM_VAL", params.get("P_WEBSERVICE_PARAM_VAL"));
                        callParams.put("P_WEBSERVICE_AUTH_DIV", params.get("P_WEBSERVICE_AUTH_DIV"));
                        callParams.put("P_WEBSERVICE_AUTH_URL", params.get("P_WEBSERVICE_AUTH_URL"));
                        callParams.put("P_WEBSERVICE_AUTH_TYPE", params.get("P_WEBSERVICE_AUTH_TYPE"));
                        callParams.put("P_WEBSERVICE_AUTH_CID", params.get("P_WEBSERVICE_AUTH_CID"));
                        callParams.put("P_WEBSERVICE_AUTH_CSECRET", params.get("P_WEBSERVICE_AUTH_CSECRET"));
                        callParams.put("P_REMOTE_CONN_TIMEOUT", remoteConnTimeout);
                        callParams.put("P_REMOTE_READ_TIMEOUT", remoteReadTimeout);
                        callParams.put("P_REMOTE_USER_ID", remoteUserId);
                        callParams.put("P_REMOTE_USER_PWD", remoteUserPwd);
                        callParams.put("P_JSON_RESULT_INFO", dao.getJsonResultInfo((String)params.get("P_JSON_TAG_RESULT"), //
                            (String)params.get("P_JSON_TAG_RESULT_MAP")));
                        callParams.put("P_XML_RESULT_INFO", dao.getXMLResultInfo((String)params.get("P_XML_TAG_RESULT"), //
                            (String)params.get("P_XML_TAG_RESULT_MAP")));
                    }
                    // Local File
                    else {
                        //
                    }
                    callParams.put("P_FILE_DIR", ediSendFullPath);
                    callParams.put(Consts.PK_QUERY_ID, SELECT_ID_SEND_DETAIL_INFO);
                    callParams.put("P_VIEW_DIV", "2"); // 2 - 스케줄
                    callParams.put("P_PREFIX_FILE_NM", prefixFileNm);

                    // 송신번호별로 파일 생성/송신 처리
                    for (int i = 0, sendCount = lstSendInfo.size(); i < sendCount; i++) {

                        Map<String, Object> rowData = lstSendInfo.get(i);
                        callParams.put("P_SEND_DATE", rowData.get("SEND_DATE"));
                        callParams.put("P_SEND_NO", rowData.get("SEND_NO"));

                        try {
                            resultMap = dao.sendDataProcessing(callParams);
                            oMsg = Util.getOutMessage(resultMap);
                            if (!Consts.OK.equals(oMsg)) {
                                throw new RuntimeException(oMsg);
                            }
                        } catch (Exception e) {
                            Util.writeErrorMessage("EDCommonService[taskSendProcessing] Send[A] Error", e);
                            // 파일 생성 오류시 다음 송신번호 처리
                            continue;
                        }

                        // 서버에 생성된 파일명
                        Object sendDocument = resultMap.get("O_DOCUMENT");
                        String sendFileNm = (String)resultMap.get("O_SEND_FILE_FULL_NM");
                        String backupFileNm = (String)resultMap.get("O_BACKUP_FILE_FULL_NM");
                        // 웹서비스 호출시 url, method는 데이터 생성시 변경될 수 있음
                        String sendWebServiceUrl = (String)resultMap.get("O_WEBSERVICE_URL");
                        String sendWebServiceMethod = (String)resultMap.get("O_WEBSERVICE_METHOD");

                        oMsg = Consts.OK;
                        try {
                            // 파일 수신 처리, FTP를 통한 처리, 접속정보 Validation은 TaskManagerService에서 처리
                            // FTP, SFTP
                            if (Consts.REMOTE_DIV_FTP.equals(remoteDiv) || Consts.REMOTE_DIV_SFTP.equals(remoteDiv)) {
                                // FTP 파일 송신
                                resultMap = dao.ftpUpload(remoteDiv, remoteIp, remotePort, remotePassiveYn, remoteCharset, remoteConnTimeout,
                                    remoteReadTimeout, remoteUserId, remoteUserPwd, remoteAuthKey, remoteDir, sendFileNm, ediSendFileBackupPath);
                                oMsg = Util.getOutMessage(resultMap);
                            }
                            // Local WebService, Remote WebService
                            else if (Consts.REMOTE_DIV_LOCAL_WS.equals(remoteDiv) || Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {
                                // 송신 파일 백업
                                File sendFile = new File(sendFileNm);
                                Util.renameFile(sendFile, new File(backupFileNm));

                                // WS 파일 송신
                                callParams.put("P_DOCUMENT", sendDocument);
                                callParams.put("P_WEBSERVICE_URL", sendWebServiceUrl);
                                callParams.put("P_WEBSERVICE_METHOD", sendWebServiceMethod);

                                resultMap = dao.sendWebService(callParams);
                                oMsg = Util.getOutMessage(resultMap);

                                // 서비스 호출이 정상일 경우 송수신 결과 데이터 생성
                                if (Consts.OK.equals(oMsg)) {
                                    saveEMIFResult(callParams, lstEMIFResultProcessing);
                                } else {
                                    oMsg = "[" + callParams.get("P_DEFINE_NO") + "]" + oMsg;
                                    resultMap.put("P_ERROR_YN", Consts.YES);
                                }

                                // 결과 데이터 반영, 자체 트랜잭션 처리 함
                                resultMap.put("O_EM_IFRESULT_DS", lstEMIFResultProcessing);
                                ifResultProcessing(resultMap);
                            }
                            // Local File
                            else {
                                File sendFile = new File(sendFileNm);
                                // 절대 경로 지정시 송신 파일 복사
                                if (Util.isNotNull(ediSendAbsolutePath)) {
                                    File sendAbsoluteFile = new File(Util.getPathName(ediSendAbsolutePath, sendFile.getName()));
                                    Files.copy(sendFile.toPath(), sendAbsoluteFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                                }
                                // 송신 파일 백업
                                Util.renameFile(sendFile, new File(backupFileNm));
                            }
                        } catch (Exception e) {
                            oMsg = Util.getErrorMessage("Send[B] Error", e);
                        }

                        // 파일 송신시 송신 파일명 업데이트 및 오류 기록
                        callParams.put("P_ERROR_MSG", oMsg);
                        callParams.put("P_FILE_NM", FilenameUtils.getName(sendFileNm));

                        // Call ESFileNmUpdate
                        ts = beginTrans();
                        try {
                            resultMap = callProcedure(SP_ID_ES_FILE_NM_UPDATE, callParams);
                            oMsg = Util.getOutMessage(resultMap);
                            if (!Consts.OK.equals(oMsg)) {
                                throw new RuntimeException(oMsg);
                            }
                            commitTrans(ts);
                        } catch (Exception e) {
                            rollbackTrans(ts);
                            Util.writeErrorMessage("EDCommonService[taskSendProcessing] Send[D] Error", e);
                        }
                    }
                } else {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.010", "송신 대상이 없습니다."));
                }
            }
        } catch (Exception e) {
            result = Util.getErrorMessage(e).replace("\n", " ");
            if (!result.startsWith("[")) {
                result = "[사업부,송수신구분,정의번호: " + buCd + "," + ediDiv + "," + defineNo + "] " + result;
            }
        }

        return result;
    }

    /**
     * 실시간 송신 처리
     *
     * @return
     */
    public Map<String, Object> realtimeSendProcessing() {

        Map<String, Object> callParams = new HashMap<String, Object>();

        callParams.put("P_BU_CD", "");
        callParams.put("P_EDI_DIV", "");
        callParams.put("P_DEFINE_NO", "");
        callParams.put("P_SEND_DATE", "");
        callParams.put("P_SEND_DIV", "2"); // 1 - TASKSCHEDULER(ES<TABLE>), 2 - REALTIME(CTCHECKVALUEEX)

        return realtimeSendProcessing(callParams);
    }

    /**
     * 실시간 송신 처리
     *
     * @param params
     *        <br>
     *        P_BU_CD: 사업부코드, 실시간송신은 사용안함<br>
     *        P_EDI_DIV: 송신구분, 실시간송신은 사용안함<br>
     *        P_DEFINE_NO: 송신정의번호, 실시간송신은 사용안함<br>
     *        P_SEND_DATE: 송신일자, 실시간송신은 사용안함<br>
     *        P_SEND_DIV: 1 - TASKSCHEDULER(ES&lt;TABLE&gt;), 2 - REALTIME(CTCHECKVALUEEX)
     * @return
     */
    public Map<String, Object> realtimeSendProcessing(Map<String, Object> params) {

        Map<String, Object> returnMap = new HashMap<String, Object>();
        List<Map<String, Object>> lstEMIFResultProcessing = new ArrayList<Map<String, Object>>();
        returnMap.put("O_EM_IFRESULT_DS", lstEMIFResultProcessing);
        Util.setOutMessage(returnMap, Consts.OK);

        boolean isDBError = false;
        try {
            Map<String, Object> callParams = new HashMap<String, Object>();

            callParams.put("P_BU_CD", params.get("P_BU_CD"));
            callParams.put("P_EDI_DIV", params.get("P_EDI_DIV"));
            callParams.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
            callParams.put("P_SEND_DATE", params.get("P_SEND_DATE"));
            callParams.put("P_SEND_DIV", params.get("P_SEND_DIV")); // 1 - TASKSCHEDULER(ES<TABLE>), 2 - REALTIME(CTCHECKVALUEEX)

            // EDI 테이블에서 정상처리 후 미송신된 송신일자/송신번호 정보 가져오기
            List<Map<String, Object>> sendInfoList = dao.getSendInfo(callParams);
            if (sendInfoList == null || sendInfoList.size() == 0) {
                // throw new RuntimeException("송신 대상 정보가 존재하지 않습니다.");
                return returnMap;
            }

            String ediFileRoot = dao.getSendFileRootPath(); // EDI 송신 루트
            String ediSendDatetime = Util.getNowDate("yyyyMMddHHmmss"); // 송신일시 - yyyyMMddHHmmss

            String oMsg;
            Map<String, Object> resultMap = null;
            // 송신번호별로 파일 생성/송신 처리
            for (int rIndex = 0, sendCount = sendInfoList.size(); rIndex < sendCount; rIndex++) {
                Map<String, Object> sendParams = Util.toParameter(sendInfoList.get(rIndex));

                // 파라메터 값 읽기
                String buCd = (String)sendParams.get("P_BU_CD");
                String ediDiv = (String)sendParams.get("P_EDI_DIV");
                String defineNo = (String)sendParams.get("P_DEFINE_NO");
                String customMethod = (String)sendParams.get("P_CUSTOM_METHOD");

                // Java Method가 지정되어 있을 경우 별도 로직으로 처리
                if (Util.isNotNull(customMethod)) {
                    oMsg = customMethodProcessing(sendParams);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    continue;
                }

                // 추가 파라메터 값 읽기
                String dataDiv = Util.nullToEmpty(sendParams.get("P_DATA_DIV"));
                String sendDate = (String)sendParams.get("P_SEND_DATE");
                String sendNo = (String)sendParams.get("P_SEND_NO");
                String userId = (String)sendParams.get(Consts.PK_USER_ID);

                callParams.clear();
                // DBLink는 처리 안함
                if (Consts.DATA_DIV_DBLINK.equals(dataDiv)) {
                    continue;
                }
                // DBConnect 처리
                else if (Consts.DATA_DIV_DBCONNECT.equals(dataDiv)) {
                    // 기본 파라메터 세팅
                    callParams.put("P_BU_CD", buCd);
                    callParams.put("P_EDI_DIV", ediDiv);
                    callParams.put("P_DEFINE_NO", defineNo);
                    callParams.put("P_DATA_DIV", dataDiv);
                    callParams.put("P_SEND_DATE", sendDate);
                    callParams.put("P_SEND_NO", sendNo);
                    callParams.put(Consts.PK_USER_ID, userId);

                    // 원격DB 파라메터 세팅
                    callParams.put("P_REMOTE_DIV", sendParams.get("P_REMOTE_DIV"));
                    callParams.put("P_LINK_DB_NM", sendParams.get("P_LINK_DB_NM"));
                    callParams.put("P_REMOTE_IP", sendParams.get("P_REMOTE_IP"));
                    callParams.put("P_REMOTE_PORT", sendParams.get("P_REMOTE_PORT"));
                    callParams.put("P_REMOTE_USER_ID", sendParams.get("P_REMOTE_USER_ID"));
                    callParams.put("P_REMOTE_USER_PWD", sendParams.get("P_REMOTE_USER_PWD"));

                    TransactionStatus ts = null;
                    TransactionStatus dbcTs = null;
                    DynamicDataSource dbcDataSource = null;

                    dbcDataSource = dao.getDynamicDataSource(callParams);
                    try {
                        ts = beginTrans();
                        // DB 접속불가시 beginTrans에서 오류 발생
                        dbcTs = dbcDataSource.beginTrans();

                        resultMap = dao.sendDataProcessing(callParams);

                        oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }

                        commitTrans(ts);
                        dbcDataSource.commitTrans(dbcTs);
                    } catch (Exception e) {
                        try {
                            rollbackTrans(ts);
                        } catch (Exception ex) {
                        }
                        try {
                            dbcDataSource.rollbackTrans(dbcTs);
                        } catch (Exception ex) {
                        }
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }
                }
                // SAP 처리
                else if (Consts.DATA_DIV_SAP.equals(dataDiv)) {

                    // 기본 파라메터 세팅
                    callParams.put("P_BU_CD", buCd);
                    callParams.put("P_EDI_DIV", ediDiv);
                    callParams.put("P_DEFINE_NO", defineNo);
                    callParams.put("P_DATA_DIV", dataDiv);
                    callParams.put("P_SEND_DATE", sendDate);
                    callParams.put("P_SEND_NO", sendNo);
                    callParams.put(Consts.PK_USER_ID, userId);
                    callParams.put(Consts.PK_QUERY_ID, SELECT_ID_SEND_DETAIL_INFO);
                    callParams.put("P_VIEW_DIV", "2"); // 2 - 스케줄

                    // SAP CALL 파라메터 세팅
                    callParams.put("P_REMOTE_DIV", sendParams.get("P_REMOTE_DIV"));
                    callParams.put("P_SAP_FUNCTION_NM", sendParams.get("P_SAP_FUNCTION_NM"));
                    callParams.put("P_SAP_TABLE_NM", sendParams.get("P_SAP_TABLE_NM"));
                    callParams.put("P_SAP_PARAM_MAP", sendParams.get("P_SAP_PARAM_MAP"));

                    // SAP 처리결과 정보
                    Map<String, Object> resultInfo = dao.getSAPResultInfo((String)sendParams.get("P_SAP_RESULT_MAP"));
                    String COLUMN_RESULT_CD = (String)resultInfo.get("P_COLUMN_RESULT_CD");
                    String COLUMN_RESULT_MSG = (String)resultInfo.get("P_COLUMN_RESULT_MSG");
                    String RESULT_CD_SUCCESS = (String)resultInfo.get("P_RESULT_CD_SUCCESS");
                    String RESULT_CD_ERROR = (String)resultInfo.get("P_RESULT_CD_ERROR");
                    callParams.put("P_SAP_RESULT_INFO", resultInfo);

                    // Call SendDataProcessing
                    com.sap.conn.jco.JCoDestination sapDestination = null;
                    com.sap.conn.jco.JCoFunction sapFunction = null;
                    // com.sap.conn.jco.JCoTable sapTable = null;
                    // Get SAP Function Object
                    String functionNm = (String)callParams.get("P_SAP_FUNCTION_NM");
                    sapFunction = getSAPFunction(callParams);
                    sapDestination = (com.sap.conn.jco.JCoDestination)callParams.get("P_SAP_DESTINATION");
                    // sapTable = getSAPTable(callParams);
                    getSAPTable(callParams);
                    boolean rfcErrorResult = false;
                    try {
                        // Set SAP Import Parameter [IN]
                        setSAPFunctionImportParameter(callParams);

                        resultMap = dao.sendDataProcessing(callParams);

                        oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }

                        // Call Function
                        // Begins a stateful call sequence for calls to the specified destination.
                        com.sap.conn.jco.JCoContext.begin(sapDestination);
                        try {
                            sapFunction.execute(sapDestination);
                        } finally {
                            // Ends a stateful call sequence for calls to the specified destination.
                            com.sap.conn.jco.JCoContext.end(sapDestination);
                        }

                        // Checking Function Result
                        if (!RESULT_CD_SUCCESS.equals(sapFunction.getExportParameterList().getString(COLUMN_RESULT_CD))) {
                            rfcErrorResult = true;
                            throw new RuntimeException("[" + functionNm + "] " + sapFunction.getExportParameterList().getString(COLUMN_RESULT_MSG));
                        }

                        sapFunction.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_SUCCESS);
                        sapFunction.getExportParameterList().setValue(COLUMN_RESULT_MSG, Consts.OK);
                    } catch (Exception e) {
                        if (!rfcErrorResult) {
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_CD, RESULT_CD_ERROR);
                            sapFunction.getExportParameterList().setValue(COLUMN_RESULT_MSG, edSAPService.getErrorMessage(e));
                        }
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // SAP Function Call이 정상이면 송신진행상태 업데이트
                    callParams.put("P_ERROR_MSG", Consts.OK);
                    callParams.put("P_FILE_NM", null);

                    // Call ESFileNmUpdate
                    resultMap = callProcedure(SP_ID_ES_FILE_NM_UPDATE, callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        isDBError = true;
                        throw new RuntimeException(oMsg);
                    }
                }
                // 파일 처리 - XML, JSON, TEXT, XLS
                else if (dataDiv.startsWith("3")) {
                    // 송신 원격 정보
                    String remoteDiv = (String)sendParams.get("P_REMOTE_DIV");
                    // 파일 송신을 위한 기본 처리
                    String prefixFileNm = (String)sendParams.get("P_PREFIX_FILE_NM");
                    String ediDir = (String)sendParams.get("P_EDI_DIR"); // 송수신정의 EDI 파일 경로
                    // EDI 파일 경로 미지정시 송수신구분으로 지정
                    if (Util.isNull(ediDir)) {
                        ediDir = ediDiv + File.separator;
                    }
                    String ediSendAbsolutePath = null; // 로컬 파일 생성시 절대 경로로 지정시 파일 생성 경로

                    // 파일 생성 위치
                    // 원격 송수신일 경우 -> 상대 경로, EDI 송신 루트 하위
                    // 원격 송수신이 아닐 경우 -> 상대 경로 또는 절대 경로, 절대 경로는 부등호로 입력 <C:\EDI>

                    // 로컬 파일 생성, 절대 경로일 경우 경로 재조정
                    if (Util.isNull(remoteDiv) && ediDir.startsWith("<") && ediDir.endsWith(">")) {
                        ediSendAbsolutePath = ediDir.substring(1, ediDir.length() - 1);
                        ediDir = ediDiv + File.separator;
                    }

                    String ediSendFullPath = Util.getPathName(ediFileRoot, ediDir); // EDI 송신 루트\EDI 파일 경로
                    // EDI 송신 루트\EDI 파일 경로\yyyyMMdd
                    String ediSendFileBackupPath = dao.getBackupFilePath(ediSendFullPath, ediSendDatetime, ediDiv);
                    // Dir 생성
                    Util.createDir(ediSendFullPath, ediSendFileBackupPath, ediSendAbsolutePath);

                    // 송신 원격 정보
                    String remoteIp = (String)sendParams.get("P_REMOTE_IP");
                    String remotePort = (String)sendParams.get("P_REMOTE_PORT");
                    String remotePassiveYn = (String)sendParams.get("P_REMOTE_PASSIVE_YN");
                    String remoteCharset = (String)sendParams.get("P_REMOTE_CHARSET");
                    int remoteConnTimeout = Util.toInt(sendParams.get("P_REMOTE_CONN_TIMEOUT"), 60);
                    int remoteReadTimeout = Util.toInt(sendParams.get("P_REMOTE_READ_TIMEOUT"), 300);
                    String remoteUserId = (String)sendParams.get("P_REMOTE_USER_ID");
                    String remoteUserPwd = (String)sendParams.get("P_REMOTE_USER_PWD");
                    String remoteDir = (String)sendParams.get("P_REMOTE_DIR");
                    Map<String, Object> remoteParamMap = Util.toKeyValues((String)params.get("P_REMOTE_PARAM_MAP"));
                    String remoteAuthKey = (String)remoteParamMap.get("REMOTE_AUTH_KEY");

                    // 파라메터 세팅
                    callParams.put("P_BU_CD", buCd);
                    callParams.put("P_EDI_DIV", ediDiv);
                    callParams.put("P_DEFINE_NO", defineNo);
                    callParams.put("P_DATA_DIV", dataDiv);
                    callParams.put("P_SEND_DATE", sendDate);
                    callParams.put("P_SEND_NO", sendNo);
                    callParams.put(Consts.PK_USER_ID, userId);

                    // FTP, SFTP
                    if (Consts.REMOTE_DIV_FTP.equals(remoteDiv) || Consts.REMOTE_DIV_SFTP.equals(remoteDiv)) {
                        callParams.put("P_FILE_DIV", Consts.FILE_DIV_SERVER);
                    }
                    // Local WebService, Remote WebService
                    else if (Consts.REMOTE_DIV_LOCAL_WS.equals(remoteDiv) || Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {
                        callParams.put("P_FILE_DIV", Consts.FILE_DIV_DOC);

                        callParams.put("P_WEBSERVICE_DIV", sendParams.get("P_WEBSERVICE_DIV"));
                        callParams.put("P_WEBSERVICE_URL", sendParams.get("P_WEBSERVICE_URL"));
                        callParams.put("P_WEBSERVICE_METHOD", sendParams.get("P_WEBSERVICE_METHOD"));
                        callParams.put("P_WEBSERVICE_HEADER_VAL", sendParams.get("P_WEBSERVICE_HEADER_VAL"));
                        callParams.put("P_WEBSERVICE_NS_PREFIX", sendParams.get("P_WEBSERVICE_NS_PREFIX"));
                        callParams.put("P_WEBSERVICE_NS_URI", sendParams.get("P_WEBSERVICE_NS_URI"));
                        callParams.put("P_WEBSERVICE_TAG_RESULT", sendParams.get("P_WEBSERVICE_TAG_RESULT"));
                        callParams.put("P_WEBSERVICE_PARAM_NM", sendParams.get("P_WEBSERVICE_PARAM_NM"));
                        callParams.put("P_WEBSERVICE_PARAM_VAL", sendParams.get("P_WEBSERVICE_PARAM_VAL"));
                        callParams.put("P_WEBSERVICE_AUTH_DIV", sendParams.get("P_WEBSERVICE_AUTH_DIV"));
                        callParams.put("P_WEBSERVICE_AUTH_URL", sendParams.get("P_WEBSERVICE_AUTH_URL"));
                        callParams.put("P_WEBSERVICE_AUTH_TYPE", sendParams.get("P_WEBSERVICE_AUTH_TYPE"));
                        callParams.put("P_WEBSERVICE_AUTH_CID", sendParams.get("P_WEBSERVICE_AUTH_CID"));
                        callParams.put("P_WEBSERVICE_AUTH_CSECRET", sendParams.get("P_WEBSERVICE_AUTH_CSECRET"));
                        callParams.put("P_REMOTE_CONN_TIMEOUT", remoteConnTimeout);
                        callParams.put("P_REMOTE_READ_TIMEOUT", remoteReadTimeout);
                        callParams.put("P_REMOTE_USER_ID", remoteUserId);
                        callParams.put("P_REMOTE_USER_PWD", remoteUserPwd);
                        callParams.put("P_JSON_RESULT_INFO", dao.getJsonResultInfo((String)sendParams.get("P_JSON_TAG_RESULT"), //
                            (String)sendParams.get("P_JSON_TAG_RESULT_MAP")));
                        callParams.put("P_XML_RESULT_INFO", dao.getXMLResultInfo((String)sendParams.get("P_XML_TAG_RESULT"), //
                            (String)sendParams.get("P_XML_TAG_RESULT_MAP")));
                    }
                    // Local File
                    else {

                    }
                    callParams.put("P_FILE_DIR", ediSendFullPath);
                    callParams.put(Consts.PK_QUERY_ID, SELECT_ID_SEND_DETAIL_INFO);
                    callParams.put("P_VIEW_DIV", "2"); // 2 - 스케줄
                    callParams.put("P_PREFIX_FILE_NM", prefixFileNm);

                    // 컬럼/송신 체크 오류 메시지 확인
                    callParams.put("P_EDI_DATE", sendDate);
                    callParams.put("P_EDI_NO", sendNo);
                    resultMap = dao.callGetErrorMessage(callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }

                    resultMap = dao.sendDataProcessing(callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }

                    // 서버에 생성된 파일명
                    Object sendDocument = resultMap.get("O_DOCUMENT");
                    String sendFileNm = (String)resultMap.get("O_SEND_FILE_FULL_NM");
                    String backupFileNm = (String)resultMap.get("O_BACKUP_FILE_FULL_NM");
                    // 웹서비스 호출시 url, method는 데이터 생성시 변경될 수 있음
                    String sendWebServiceUrl = (String)resultMap.get("O_WEBSERVICE_URL");
                    String sendWebServiceMethod = (String)resultMap.get("O_WEBSERVICE_METHOD");

                    oMsg = Consts.OK;
                    try {
                        // 파일 수신 처리, FTP를 통한 처리, 접속정보 Validation은 TaskManagerService에서 처리
                        // FTP, SFTP
                        if (Consts.REMOTE_DIV_FTP.equals(remoteDiv) || Consts.REMOTE_DIV_SFTP.equals(remoteDiv)) {
                            // FTP 파일 송신
                            resultMap = dao.ftpUpload(remoteDiv, remoteIp, remotePort, remotePassiveYn, remoteCharset, remoteConnTimeout,
                                remoteReadTimeout, remoteUserId, remoteUserPwd, remoteAuthKey, remoteDir, sendFileNm, ediSendFileBackupPath);
                            oMsg = Util.getOutMessage(resultMap);
                        }
                        // Local WebService, Remote WebService
                        else if (Consts.REMOTE_DIV_LOCAL_WS.equals(remoteDiv) || Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {
                            // 송신 파일 백업
                            File sendFile = new File(sendFileNm);
                            Util.renameFile(sendFile, new File(backupFileNm));

                            // WS 파일 송신
                            callParams.put("P_DOCUMENT", sendDocument);
                            callParams.put("P_WEBSERVICE_URL", sendWebServiceUrl);
                            callParams.put("P_WEBSERVICE_METHOD", sendWebServiceMethod);
                            callParams.put("P_BACKUP_FILE_FULL_NM", backupFileNm);

                            resultMap = dao.sendWebService(callParams);
                            oMsg = Util.getOutMessage(resultMap);

                            // 서비스 호출이 정상일 경우 송수신 결과 데이터 생성
                            if (Consts.OK.equals(oMsg)) {
                                saveEMIFResult(callParams, lstEMIFResultProcessing);
                            } else {
                                oMsg = "[" + callParams.get("P_DEFINE_NO") + "]" + oMsg;
                                resultMap.put("P_ERROR_YN", Consts.YES);
                            }
                        }
                        // Local File
                        else {
                            File sendFile = new File(sendFileNm);
                            // 절대 경로 지정시 송신 파일 복사
                            if (Util.isNotNull(ediSendAbsolutePath)) {
                                File sendAbsoluteFile = new File(Util.getPathName(ediSendAbsolutePath, sendFile.getName()));
                                Files.copy(sendFile.toPath(), sendAbsoluteFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                            }
                            // 송신 파일 백업
                            Util.renameFile(sendFile, new File(backupFileNm));
                        }
                    } catch (Exception e) {
                        oMsg = Util.getErrorMessage(e);
                    }

                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    // 파일 정상 송신시 송신 파일명 업데이트
                    callParams.put("P_ERROR_MSG", oMsg);
                    callParams.put("P_FILE_NM", FilenameUtils.getName(sendFileNm));

                    resultMap = callProcedure(SP_ID_ES_FILE_NM_UPDATE, callParams);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        isDBError = true;
                        throw new RuntimeException(oMsg);
                    }
                }
            }
        } catch (Exception e) {
            String errorMessage = Util.getErrorMessage(NexosMessage.getDisplayMsg("JAVA.ED.011", "데이터 송신 오류\n"), e);
            Util.setOutMessage(returnMap, errorMessage);
            // DB 오류일 경우만 Rollback을 위해 오류 발생
            if (isDBError) {
                throw new RuntimeException(errorMessage);
            }
        }

        return returnMap;
    }

    public void errorProcessing(Map<String, Object> params) {

        Map<String, Object> callParams = new HashMap<String, Object>();

        String defineDiv = (String)params.get("P_DEFINE_DIV");
        // String dataDiv = Util.nullToEmpty(params.get("P_DATA_DIV"));

        callParams.put("P_BU_CD", params.get("P_BU_CD"));
        callParams.put("P_EDI_DIV", params.get("P_EDI_DIV"));
        callParams.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
        callParams.put("P_EDI_DATE", params.get("P_EDI_DATE"));

        // 오류 송신 정보 가져오기
        List<Map<String, Object>> dsErrorInfo = dao.getErrorInfo(callParams);
        if (dsErrorInfo == null || dsErrorInfo.size() == 0) {
            return;
        }

        SimpleDateFormat sdf = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        StringBuffer sbLog = new StringBuffer();
        StringBuffer sbLogPrefix = new StringBuffer();
        sbLogPrefix.append("Executing error task\n") //
            .append("[START ERROR TASK]\n") //
            .append("  ▶ JOB      :【") //
            .append((String)params.get("P_BU_CD")).append("_") //
            .append((String)params.get("P_EDI_DIV")).append("_") //
            .append((String)params.get("P_DEFINE_NO")).append("_Job】\n") //
            .append("  ▶ JOB 설명 :【").append((String)params.get("P_DEFINE_NM")).append("】\n");
        // 수신 오류 처리 - 데이터를 이미 수신했기 때문에 수신 프로세싱만 호출
        if (Consts.DEFINE_DIV_RECV.equals(defineDiv)) {
            callParams.clear();
            // 기본 파라메터 세팅
            callParams.put("P_BU_CD", params.get("P_BU_CD"));
            callParams.put("P_EDI_DIV", params.get("P_EDI_DIV"));
            callParams.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
            callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));

            // 수신번호별 ER_PROCESSING 호출
            DefaultTransactionDefinition dtd = new DefaultTransactionDefinition();
            for (int i = 0, dsCount = dsErrorInfo.size(); i < dsCount; i++) {
                Map<String, Object> rowData = dsErrorInfo.get(i);

                TransactionStatus ts = beginTrans(dtd);
                try {
                    sbLog.setLength(0);
                    sbLog.append(sbLogPrefix) //
                        .append("  ▶ JOB 실행 :【") //
                        .append(rowData.get("RECV_DATE")).append(", ") //
                        .append(rowData.get("RECV_NO")).append(", ") //
                        .append(rowData.get("PROCESS_CD")).append("】\n") //
                        .append("    [실행    ").append(sdf.format(System.currentTimeMillis())).append("] ");

                    // 추가 파라메터 세팅
                    callParams.put("P_RECV_DATE", rowData.get("RECV_DATE"));
                    callParams.put("P_RECV_NO", rowData.get("RECV_NO"));
                    callParams.put(Consts.PK_PROCESS_CD, rowData.get("PROCESS_CD"));

                    Map<String, Object> resultMap = dao.callERProcessing(callParams);

                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                    sbLog.append("Success : ").append(oMsg).append("\n");
                } catch (Exception e) {
                    rollbackTrans(ts);
                    sbLog.append("Error   : ").append(Util.getErrorMessage(e)).append("\n");
                }

                try {
                    // Call ERProcessingAfter
                    taskRecvProcessingAfter(callParams);
                } catch (Exception e) {
                    sbLog.append("Error[A]: ").append(Util.getErrorMessage(e)).append("\n");
                }
                logger.info(sbLog.append("[STOP ERROR TASK]\n").toString());
            }
        }
        // 송신 오류 처리 - 오류 데이터에 대한 송신 프로세싱 호출 후 추가로 외부 송신 처리 진행
        else if (Consts.DEFINE_DIV_SEND.equals(defineDiv)) {
            for (int i = 0, dsCount = dsErrorInfo.size(); i < dsCount; i++) {
                Map<String, Object> rowData = dsErrorInfo.get(i);
                try {
                    sbLog.setLength(0);
                    sbLog.append(sbLogPrefix) //
                        .append("  ▶ JOB 실행 :【") //
                        .append(rowData.get("SEND_DATE")).append(", ") //
                        .append(rowData.get("SEND_NO")).append(", ") //
                        .append(rowData.get("PROCESS_CD")).append("】\n") //
                        .append("    [실행    ").append(sdf.format(System.currentTimeMillis())).append("] ");

                    callParams.clear();
                    callParams.putAll(params);
                    callParams.put("P_SEND_DATE", rowData.get("SEND_DATE"));
                    callParams.put("P_SEND_NO", rowData.get("SEND_NO"));
                    callParams.put(Consts.PK_PROCESS_CD, rowData.get("PROCESS_CD"));

                    String oMsg = taskSendProcessing(callParams);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    sbLog.append("Success : ").append(oMsg).append("\n");
                } catch (Exception e) {
                    sbLog.append("Error   : ").append(Util.getErrorMessage(e)).append("\n");
                }
                logger.info(sbLog.append("[STOP ERROR TASK]\n").toString());
            }
        }
    }

    /**
     * 수신 처리 - DBLink, DBConnect, 파일(EXCEL, TEXT, XML, JSON) 원격 수신
     *
     * @param params
     * @return
     * @throws Exception
     */
    public String manualRecvProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.OK;
        Map<String, Object> defineRemoteInfo = getDefineRemoteInfo(params);

        String processCd = (String)params.get(Consts.PK_PROCESS_CD);
        // 자동 실행일 때 체크, 스케줄이 실행 중일 경우 다음 실행 시간이 1분 미만이면 처리 안함, 종결은 체크 안함
        if (edTaskManagerService.isStarted() // 스케줄 동작 중
            && Consts.YES.equals(defineRemoteInfo.get("AUTO_EXEC_YN")) // 송수신정의 자동실행
            && !Consts.EDI_PROCESS_CLOSING.equals(processCd) // 종결처리가 아닐 경우
        ) {
            String buCd = (String)params.get("P_BU_CD");
            String ediDiv = (String)params.get("P_EDI_DIV");
            String defineNo = (String)params.get("P_DEFINE_NO");
            // String jobName = buCd + "_" + ediDiv + "_" + defineNo + "_Job";
            String triggerName = buCd + "_" + ediDiv + "_" + defineNo + "_Trigger";
            // JobDetail jobDetail = taskScheduler.getJobDetail(new JobKey(jobName, Consts.TRIGER_GROUP));
            // if (jobDetail != null) {
            // logger.debug("jobDetail: " + jobDetail.toString());
            // }
            Trigger trigger = edTaskManagerService.getTaskScheduler().getTrigger(new TriggerKey(triggerName, Consts.TRIGER_GROUP));
            if (trigger != null) {
                long nextFireSeconds = (trigger.getNextFireTime().getTime() - System.currentTimeMillis()) / 1000;
                if (nextFireSeconds < 120) {
                    throw new RuntimeException(
                        NexosMessage.getDisplayMsg("JAVA.ED.013", "해당 수신정의는 스케줄러에 의해 " + Math.max(0, nextFireSeconds) + "초 후에 실행될 예정입니다.\n"
                            + "자동실행일 경우 다음 실행시간이 2분미만으로 남았을 경우 수동으로 처리할 수 없습니다.", new String[] {String.valueOf(Math.max(0, nextFireSeconds))}));
                }
            }
        }

        // A - 데이터 수신 후 입력
        if (Consts.EDI_PROCESS_CREATE.equals(processCd)) {
            // Scheduler Task의 Method를 같이 사용하므로 파라메터 조정
            Map<String, Object> callParams = Util.toParameter(defineRemoteInfo);
            callParams.put("P_EDI_DATE", dao.getEDIDate());
            callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));

            // Processing 호출 파라메터 체크
            validateParameters(callParams);

            result = taskRecvProcessing(callParams);
            if (!Consts.OK.equals(result)) {
                throw new RuntimeException(result);
            }
        }
        // B: 컬럼체크, C: 수신체크, D:종결처리
        else {
            result = manualRecvProcessingAfter(params);
            if (!Consts.OK.equals(result)) {
                throw new RuntimeException(result);
            }
        }

        return result;
    }

    /**
     * 파일(EXCEL, TEXT, XML, JSON) 수신 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    public String attachmentRecvProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.OK;

        String dataDiv = (String)params.get("P_DATA_DIV");
        if (Consts.DATA_DIV_DBCONNECT.equals(dataDiv) //
            || Consts.DATA_DIV_DBLINK.equals(dataDiv) //
            || Consts.DATA_DIV_SAP.equals(dataDiv)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.014", "자료구분이 파일형태(EXCEL, TEXT, XML, JSON)인 수신정의만 처리할 수 있습니다."));
        }

        String fileDiv = (String)params.get("P_FILE_DIV");
        if (Consts.FILE_DIV_ATTACHMENT.equals(fileDiv)) {
            if (Util.isNull(params.get("P_UPLOAD_FILE"))) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.015", "수신 처리할 파일이 지정되지 않았습니다. 다시 처리하십시오."));
            }
        } else if (Consts.FILE_DIV_DOC.equals(fileDiv)) {
            if (Util.isNull(params.get("P_DOCUMENT"))) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.XXX", "수신 처리할 문서가 지정되지 않았습니다. 다시 처리하십시오."));
            }
        }

        params.putAll(Util.toParameter(getDefineRemoteInfo(params)));
        String customMethod = (String)params.get("P_CUSTOM_METHOD");

        // Java Method가 지정되어 있을 경우 별도 로직으로 처리
        if (Util.isNotNull(customMethod)) {
            result = customMethodProcessing(params);
            if (!Consts.OK.equals(result)) {
                throw new RuntimeException(result);
            }
            return result;
        }

        // 파일 수신 처리 - EDI TABLE에 INSERT
        TransactionStatus ts = null;
        Map<String, Object> resultMap = null;
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

        // 실제 처리된 수신일자/번호 입력
        params.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
        params.put("P_RECV_NO", resultMap.get("P_RECV_NO"));
        // 프로세스를 컬럼체크 처리하도록 세팅
        params.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);

        result = manualRecvProcessingAfter(params);
        if (!Consts.OK.equals(result)) {
            throw new RuntimeException(result);
        }

        return result;
    }

    /**
     * ER_PROCESSING 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    public String manualRecvProcessingAfter(Map<String, Object> params) throws Exception {

        String result = Consts.OK;

        String processCd = (String)params.get(Consts.PK_PROCESS_CD);

        Map<String, Object> resultMap;
        String oMsg;
        // ER_PROCESSING 호출
        TransactionStatus ts = beginTrans();
        try {
            resultMap = dao.callERProcessing(params);

            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 종결이 아니면 ER_PROCESSING_AFTER 호출
        if (!Consts.EDI_PROCESS_CLOSING.equals(processCd)) {
            // Call ERProcessingAfter
            taskRecvProcessingAfter(params);
        }

        return result;
    }

    /**
     * 송신 처리 - DBLink, DBConnect, 파일(EXCEL, TEXT, XML, JSON) 원격 송신
     *
     * @param params
     * @return
     * @throws Exception
     */
    public String manualSendProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.OK;
        Map<String, Object> defineRemoteInfo = getDefineRemoteInfo(params);

        String processCd = (String)params.get(Consts.PK_PROCESS_CD);
        // 자동 실행일 때 체크, 스케줄이 실행 중일 경우 다음 실행 시간이 1분 미만이면 처리 안함, 종결은 체크 안함
        if (edTaskManagerService.isStarted() // 스케줄 동작 중
            && Consts.YES.equals(defineRemoteInfo.get("AUTO_EXEC_YN")) // 송수신정의 자동실행
        // && !Consts.EDI_PROCESS_CLOSING.equals(processCd) // 종결처리가 아닐 경우
        ) {
            String buCd = (String)params.get("P_BU_CD");
            String ediDiv = (String)params.get("P_EDI_DIV");
            String defineNo = (String)params.get("P_DEFINE_NO");
            // String jobName = buCd + "_" + ediDiv + "_" + defineNo + "_Job";
            String triggerName = buCd + "_" + ediDiv + "_" + defineNo + "_Trigger";
            // JobDetail jobDetail = taskScheduler.getJobDetail(new JobKey(jobName, Consts.TRIGER_GROUP));
            // if (jobDetail != null) {
            // logger.debug("jobDetail: " + jobDetail.toString());
            // }
            Trigger trigger = edTaskManagerService.getTaskScheduler().getTrigger(new TriggerKey(triggerName, Consts.TRIGER_GROUP));
            if (trigger != null) {
                long nextFireSeconds = (trigger.getNextFireTime().getTime() - System.currentTimeMillis()) / 1000;
                if (nextFireSeconds < 120) {
                    throw new RuntimeException(
                        NexosMessage.getDisplayMsg("JAVA.ED.013", "해당 수신정의는 스케줄러에 의해 " + Math.max(0, nextFireSeconds) + "초 후에 실행될 예정입니다.\n"
                            + "자동실행일 경우 다음 실행시간이 2분미만으로 남았을 경우 수동으로 처리할 수 없습니다.", new String[] {String.valueOf(Math.max(0, nextFireSeconds))}));
                }
            }
        }

        // Scheduler Task의 Method를 같이 사용하므로 파라메터 조정
        Map<String, Object> callParams = Util.toParameter(defineRemoteInfo);
        // A - 송신 데이터 생성
        if (Consts.EDI_PROCESS_CREATE.equals(processCd)) {
            callParams.put("P_EDI_DATE", dao.getEDIDate());
            // 매뉴얼 송신일 경우 구분을 위해 PROCESS_CD를 강제로 조정, 2021-11
            // A -> AM
            processCd = Consts.EDI_PROCESS_CREATE_MANUAL;
            params.put(Consts.PK_PROCESS_CD, processCd);
        }
        // B: 컬럼체크, C: 데이터송신
        else {
            callParams.put("P_SEND_DATE", params.get("P_SEND_DATE"));
            callParams.put("P_SEND_NO", params.get("P_SEND_NO"));
        }
        callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
        callParams.put(Consts.PK_PROCESS_CD, processCd);
        callParams.put("P_CENTER_CD", params.get("P_CENTER_CD"));
        callParams.put("P_INOUT_DATE", params.get("P_INOUT_DATE"));

        // Processing 호출 파라메터 체크
        validateParameters(callParams);

        result = taskSendProcessing(callParams);
        if (!Consts.OK.equals(result)) {
            throw new RuntimeException(result);
        }

        return result;
    }

    /**
     * 송신 다운로드 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    public String sendFileDownload(Map<String, Object> params) throws Exception {

        String result = Consts.OK;
        Map<String, Object> resultMap = null;
        String dataDiv = Util.nullToEmpty(params.get("P_DATA_DIV"));
        // 파일 처리
        if (dataDiv.startsWith("3")) {
            if (!params.containsKey(Consts.PK_QUERY_ID)) {
                params.put(Consts.PK_QUERY_ID, SELECT_ID_SEND_DETAIL_INFO);
            }
            try {
                // EXCEL
                if (Consts.DATA_DIV_XLS.equals(dataDiv)) {
                    resultMap = dao.sendExcel(params);
                }
                // TEXT
                else if (Consts.DATA_DIV_TXT.equals(dataDiv)) {
                    resultMap = dao.sendText(params);
                }
                // XML
                else if (Consts.DATA_DIV_XML.equals(dataDiv)) {
                    // 결과 파싱정보 입력
                    Map<String, Object> defineRemoteInfo = getDefineRemoteInfo(params);
                    params.put("P_XML_RESULT_INFO", dao.getXMLResultInfo((String)defineRemoteInfo.get("XML_TAG_RESULT"), //
                        (String)defineRemoteInfo.get("XML_TAG_RESULT_MAP")));
                    resultMap = dao.sendXML(params);
                }
                // JSON
                else if (Consts.DATA_DIV_JSON.equals(dataDiv)) {
                    // 결과 파싱정보 입력
                    Map<String, Object> defineRemoteInfo = getDefineRemoteInfo(params);
                    params.put("P_JSON_RESULT_INFO", dao.getJsonResultInfo((String)defineRemoteInfo.get("JSON_TAG_RESULT"), //
                        (String)defineRemoteInfo.get("JSON_TAG_RESULT_MAP")));
                    resultMap = dao.sendJson(params);
                }
                // 기타
                else {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.017", "처리할 수 없는 자료구분입니다."));
                }

                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            } catch (Exception e) {
                throw new RuntimeException(Util.getErrorMessage(e));
            }
        } else {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.017", "처리할 수 없는 자료구분입니다."));
        }

        HttpServletResponse response = (HttpServletResponse)params.get("P_RESPONSE");
        String userAgent = (String)params.get("P_USER_AGENT");
        FileInputStream ediSendFileInput = null;
        OutputStream responseOutput = null;
        File ediSendFile = null;
        String ediSendFileBackupFullName = null;
        try {
            String ediSendFileFullName = (String)resultMap.get("O_SEND_FILE_FULL_NM");
            ediSendFileBackupFullName = (String)resultMap.get("O_BACKUP_FILE_FULL_NM");
            ediSendFile = new File(ediSendFileFullName);
            ediSendFileInput = new FileInputStream(ediSendFile);

            // jQuery FileDownload Event 처리를 위한 Cookie 세팅
            response.addCookie(Util.getDownloadCookie());

            response.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
            response.setHeader(HttpHeaders.CONTENT_LENGTH, Long.toString(ediSendFile.length()));
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
            response.setHeader(HttpHeaders.PRAGMA, "no-cache");
            response.setHeader(HttpHeaders.EXPIRES, "0");

            String ediSendFileName = null;
            if (Util.isIE(userAgent)) {
                ediSendFileName = URLEncoder.encode(ediSendFile.getName(), Consts.CHARSET);
            } else {
                ediSendFileName = new String(ediSendFile.getName().getBytes(Consts.CHARSET), StandardCharsets.ISO_8859_1);
            }
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ediSendFileName + "\";");
            response.setHeader("Content-Transfer-Encoding", "binary");

            responseOutput = response.getOutputStream();

            byte[] buffer = new byte[4096];
            int bytesRead = -1;

            while ((bytesRead = ediSendFileInput.read(buffer)) != -1) {
                responseOutput.write(buffer, 0, bytesRead);
            }
            responseOutput.flush();
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(NexosMessage.getDisplayMsg("JAVA.ED.018", "송신 파일 다운로드 중 오류가 발생했습니다.\n"), e));
        } finally {
            Util.closeObject(ediSendFileInput);
            Util.closeObject(responseOutput);
            if (ediSendFile != null) {
                try {
                    if (ediSendFileBackupFullName != null) {
                        ediSendFile.renameTo(new File(ediSendFileBackupFullName));
                    }
                } catch (Exception e) {
                }
            }
        }

        return result;
    }

    /**
     * Manual 송수신 처리시 파라메터 값 체크<br>
     * 수정시 EDTaskManagerService.createJobs method도 확인하여 수정
     *
     * @param params
     * @throws Exception
     */
    private void validateParameters(Map<String, Object> params) throws Exception {

        String dataDiv = Util.nullToEmpty(params.get("P_DATA_DIV"));
        // DBLink가 아닐 경우 접속 정보 체크
        if (Consts.DATA_DIV_DBLINK.equals(dataDiv)) {
            return;
        }

        String defineDiv = (String)params.get("P_DEFINE_DIV");
        String remoteDiv = (String)params.get("P_REMOTE_DIV");
        String remoteIp = (String)params.get("P_REMOTE_IP");
        String remotePort = (String)params.get("P_REMOTE_PORT");
        // String remotePassiveYN = (String)rowData.get("P_REMOTE_PASSIVE_YN");
        // String remoteCharset = (String)rowData.get("P_REMOTE_CHARSET");
        // int remoteConnTimeout = Util.toInt(params.get("P_REMOTE_CONN_TIMEOUT"), 60);
        // int remoteReadTimeout = Util.toInt(params.get("P_REMOTE_READ_TIMEOUT"), 300);
        String remoteUserId = (String)params.get("P_REMOTE_USER_ID");
        String remoteUserPwd = (String)params.get("P_REMOTE_USER_PWD");
        String remoteActionType = (String)params.get("P_REMOTE_ACTION_TYPE");
        String remoteParamMap = (String)params.get("P_REMOTE_PARAM_MAP");
        // String remoteDir = (String)rowData.get("P_REMOTE_DIR");
        // String ediDir = (String)rowData.get("P_EDI_DIR");
        String linkDbNm = (String)params.get("P_LINK_DB_NM");
        String linkTableNm = (String)params.get("P_LINK_TABLE_NM");

        String webServiceDiv = (String)params.get("P_WEBSERVICE_DIV");
        String webServiceUrl = (String)params.get("P_WEBSERVICE_URL");
        // String webServiceHeaderVal = (String)params.get("P_WEBSERVICE_HEADER_VAL");
        String webServiceMethod = (String)params.get("P_WEBSERVICE_METHOD");
        String webServiceNSPrefix = (String)params.get("P_WEBSERVICE_NS_PREFIX");
        String webServiceNSUri = (String)params.get("P_WEBSERVICE_NS_URI");
        // String webServiceTagResult = (String)params.get("P_WEBSERVICE_TAG_RESULT");
        String webServiceParamNm = (String)params.get("P_WEBSERVICE_PARAM_NM");
        // String webServiceParamVal = (String)rowData.get("P_WEBSERVICE_PARAM_VAL");
        String webServiceAuthDiv = (String)params.get("P_WEBSERVICE_AUTH_DIV");
        String webServiceAuthUrl = (String)params.get("P_WEBSERVICE_AUTH_URL");
        String webServiceAuthType = (String)params.get("P_WEBSERVICE_AUTH_TYPE");
        String webServiceClientId = (String)params.get("P_WEBSERVICE_AUTH_CID");
        String webServiceClientSecret = (String)params.get("P_WEBSERVICE_AUTH_CSECRET");

        // FTP, SFTP 체크
        if (Consts.REMOTE_DIV_FTP.equals(remoteDiv) //
            || Consts.REMOTE_DIV_SFTP.equals(remoteDiv)) {
            if (Util.isNull(remoteIp) //
                || Util.isNull(remotePort) //
                || Util.isNull(remoteUserId) //
                || Util.isNull(remoteUserPwd)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.019", "FTP접속 정보가 정상적으로 지정되지 않았습니다."));
            }
        }
        // Local WebService 체크
        // 매뉴얼 송수신일 경우는 Local WebService 호출 불가
        else if (Consts.REMOTE_DIV_LOCAL_WS.equals(remoteDiv)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.020", "로컬 웹서비스는 송수신 처리할 수 없습니다."));
        }
        // Remote WebService 체크
        else if (Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {

            // EXCEL 파일은 웹서비스로 처리 불가
            if (Consts.DATA_DIV_XLS.equals(dataDiv)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.021", "엑셀 파일은 웹서비스로 송수신 처리할 수 없습니다."));
            }

            if (Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {
                if (Util.isNull(webServiceDiv) //
                    || Util.isNull(webServiceUrl) //
                    || "1".equals(defineDiv) && webServiceDiv.startsWith("1") && Util.isNull(webServiceParamNm) //
                    || webServiceDiv.startsWith("2")
                        && (Util.isNull(webServiceMethod) || Util.isNull(webServiceNSPrefix) || Util.isNull(webServiceNSUri))) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.022", "웹서비스 정보가 정상적으로 지정되지 않았습니다."));
                }
                if (Util.isNotNull(webServiceAuthDiv)) {
                    // Basic 인증
                    if (webServiceAuthDiv.equals("1")) {
                        if (Util.isNull(remoteUserId) || Util.isNull(remoteUserPwd)) {
                            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.023", "웹서비스 호출 인증을 위한 정보가 정상적으로 지정되지 않았습니다."));
                        }
                    }
                    // OAuth 인증
                    else if (webServiceAuthDiv.equals("2")) {
                        if (Util.isNull(webServiceAuthUrl) || Util.isNull(webServiceClientId) || Util.isNull(webServiceClientSecret) //
                            || Util.isNull(webServiceAuthType) //
                            || "password".equals(webServiceAuthType) && (Util.isNull(remoteUserId) || Util.isNull(remoteUserPwd))) {
                            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.023", "웹서비스 호출 인증을 위한 정보가 정상적으로 지정되지 않았습니다."));
                        }
                    }
                    // 기타 오류
                    else {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.024", "처리할 수 없는 인증구분입니다."));
                    }
                }
            }
        }
        // DBConnect 체크
        else if (Consts.DATA_DIV_DBCONNECT.equals(dataDiv)) {
            // 필수 체크
            if (Util.isNull(remoteIp) //
                || Util.isNull(remotePort) //
                || Util.isNull(remoteUserId) //
                || Util.isNull(remoteUserPwd) //
                || Util.isNull(linkDbNm) //
                || Util.isNull(remoteActionType)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.025", "원격DB접속 정보가 정상적으로 지정되지 않았습니다."));
            }

            // 선택에 따른 체크
            // LINK_TABLE_NM 필수, 1 - TABLE<SELECT>, 2 - TABLE<INSERT>
            if (("1".equals(remoteActionType) || "2".equals(remoteActionType)) && Util.isNull(linkTableNm)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.026", "송수신 테이블명이 지정 않았습니다."));
            }
            // REMOTE_PARAM_MAP 필수, 3 - PROCEDURE<CALL>, 4 - SCRIPT<CALL>
            if (("3".equals(remoteActionType) || "4".equals(remoteActionType)) && Util.isNull(remoteParamMap)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.027", "원격파라메터매핑 정보가 지정되지 않았습니다."));
            }
        }
        // SAP
        else if (Consts.DATA_DIV_SAP.equals(dataDiv)) {
            if (Consts.REMOTE_DIV_SAP_JCO_SERVER.equals(remoteDiv)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.028", "SAP JCO Server는 송수신 처리할 수 없습니다."));
            }
        }
    }

    /**
     * SAP Function 리턴
     * <pre>
     * 호출 파라메터 - 필수
     *
     *   P_REMOTE_DIV        : 원격송수신구분
     *   P_SAP_FUNCTION_NM   : 펑션명
     * </pre>
     *
     * @param params
     * @return
     */
    public com.sap.conn.jco.JCoFunction getSAPFunction(Map<String, Object> params) throws Exception {

        // Get SAP Destination
        com.sap.conn.jco.JCoDestination sapDestination = edSAPService.getDestination(params);
        if (sapDestination == null) {
            throw new RuntimeException(Util.getOutMessage(params));
        }
        params.put("P_SAP_DESTINATION", sapDestination);

        // Get SAP Function
        com.sap.conn.jco.JCoFunction sapFunction = edSAPService.getFunction(sapDestination, params);
        if (sapFunction == null) {
            throw new RuntimeException(Util.getOutMessage(params));
        }

        params.put("P_SAP_FUNCTION", sapFunction);
        return sapFunction;
    }

    /**
     * SAP Function Table 리턴
     * <pre>
     * 호출 파라메터 - 필수
     *
     *   P_REMOTE_DIV        : 원격송수신구분
     *   P_SAP_FUNCTION      : SAP Function Object
     *   P_SAP_TABLE_NM      : 테이블명
     * </pre>
     *
     * @param params
     * @return
     */
    public com.sap.conn.jco.JCoTable getSAPTable(Map<String, Object> params) throws Exception {

        // Get SAP Function
        com.sap.conn.jco.JCoFunction sapFunction = (com.sap.conn.jco.JCoFunction)params.get("P_SAP_FUNCTION");

        // Get SAP Function Table
        com.sap.conn.jco.JCoTable sapTable = edSAPService.getTable(sapFunction, params);
        if (sapFunction == null) {
            throw new RuntimeException(Util.getOutMessage(params));
        }

        params.put("P_SAP_TABLE", sapTable);
        return sapTable;
    }

    /**
     * SAP Function에 Input Parameter 세팅
     * <pre>
     * 호출 파라메터 - 필수
     *
     *   P_SAP_FUNCTION      : SAP Function Object
     *   P_SAP_PARAM_MAP     : SAP Parameter Mapping
     * </pre>
     *
     * @param params
     * @return
     */
    public void setSAPFunctionImportParameter(Map<String, Object> params) throws Exception {

        com.sap.conn.jco.JCoFunction sapFunction = (com.sap.conn.jco.JCoFunction)params.get("P_SAP_FUNCTION");

        String sapParamMap = (String)params.get("P_SAP_PARAM_MAP");
        if (Util.isNull(sapParamMap)) {
            return;
        }

        // 파라메터 매핑정보로 파라메터 값 세팅
        String[] sapParams = sapParamMap.split("\\r?\\n");
        for (String sapParam : sapParams) {
            String[] sapParamKV = sapParam.split("=");
            if (sapParamKV != null && sapParamKV.length > 1) {
                String sapParamValue = sapParam.replaceFirst(sapParamKV[0] + "=", "");
                sapFunction.getImportParameterList().setValue(sapParamKV[0], dao.replaceSQLText(sapParamValue));
            }
        }
    }

    @SuppressWarnings("unchecked")
    public String customMethodProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.OK;

        String customMethod = (String)params.get("P_CUSTOM_METHOD");
        try {
            Method customMethodFn = edJavaMethodService.getClass().getMethod(customMethod, Map.class);
            Map<String, Object> resultMap = (Map<String, Object>)customMethodFn.invoke(edJavaMethodService, params);
            result = Util.getOutMessage(resultMap);
        } catch (NoSuchMethodException e) {
            result = NexosMessage.getDisplayMsg("JAVA.ED.135", "[" + customMethod + "]해당 송수신 처리메소드가 존재하지 않습니다.",
                new String[] {Util.toString(customMethod)});
        } catch (Exception e) {
            result = Util.getErrorMessage(e);
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    private String saveEMIFResult(Map<String, Object> params, List<Map<String, Object>> lstEMIFResultProcessing) {

        String result = Consts.OK;

        String dataDiv = (String)params.get("P_DATA_DIV");
        // WebService, Json일 경우만 코딩, TODO: 기타 송수신
        if (!Consts.DATA_DIV_JSON.equals(dataDiv)) {
            return result;
        }

        // Response 결과 데이터 매핑이 있을 경우만 처리
        Map<String, Object> resultInfo = (Map<String, Object>)params.get("P_JSON_RESULT_INFO");
        String resultBunch = (String)resultInfo.get("P_RETURN_BUNCH");
        if (Util.isNull(resultBunch)) {
            return result;
        }

        // 리턴 프로세싱 호출 파라메터 추가
        Map<String, Object> ifResultMap = Util.newMap();
        ifResultMap.put("P_BU_CD", params.get("P_BU_CD"));
        ifResultMap.put("P_EDI_DIV", params.get("P_EDI_DIV"));
        ifResultMap.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
        if (params.containsKey("P_SEND_DATE")) {
            ifResultMap.put("P_EDI_DATE", params.get("P_SEND_DATE"));
            ifResultMap.put("P_EDI_NO", params.get("P_SEND_NO"));
        } else {
            ifResultMap.put("P_EDI_DATE", params.get("P_RECV_DATE"));
            ifResultMap.put("P_EDI_NO", params.get("P_RECV_NO"));
        }
        ifResultMap.put("P_ERROR_YN", Consts.NO);
        ifResultMap.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
        lstEMIFResultProcessing.add(ifResultMap);

        String oMsg = Consts.OK;

        // 리턴 데이터 저장 기본 파라메터 추가
        List<Map<String, Object>> lstEMIFResult = Util.newList();
        Map<String, Object> emIFResultData = Util.newMap();
        Map<String, Object> callParams = Util.newAnyMap(ifResultMap);

        // 결과 데이터 파싱 및 기록 ----------------------------------------------------------------
        // 트랜잭션을 REQUIRES_NEW로 조정, 상위 호출 메서드에 적용된 트랜잭션과 별개로 트랜잭션 처리
        TransactionDefinition dtd = getTransDefinition(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        TransactionStatus ts = beginTrans(dtd);
        try {
            // 결과데이터 파싱
            String repDocument = (String)params.get("O_REP_DOCUMENT");
            Map<String, Object> repDocMap = Util.toMap(repDocument);
            oMsg = Util.getOutMessage(repDocMap);
            // 파싱 오류
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException("결과 데이터 파싱 오류\n" + oMsg);
            }

            List<Map<String, Object>> jsonRows;
            // 결과를 읽을 TAG 검색, 결과데이터가 없을 경우 오류 처리
            // ROOT일 경우는 결과 데이터 그대로 처리
            if ("ROOT".equals(resultBunch.toUpperCase())) {
                jsonRows = new ArrayList<Map<String, Object>>();
                jsonRows.add(repDocMap);
            }
            // ROOT가 아닐 경우 입력 TAG 검색
            else {
                Object resultBunchObject = null;
                // 실제 데이터를 읽어야할 TAG가 Sub Node인 경우를 위해, TAG1/TAG2 형태
                String[] actualResultBunch = resultBunch.split("/");
                if (actualResultBunch.length == 1) {
                    resultBunchObject = repDocMap.get(resultBunch);
                } else {
                    resultBunchObject = repDocMap;
                    // 상위 노드 검색
                    for (int bIndex = 0, bCount = actualResultBunch.length; bIndex < bCount; bIndex++) {
                        resultBunchObject = ((Map<String, Object>)resultBunchObject).get(actualResultBunch[bIndex]);
                        if (resultBunchObject == null) {
                            break;
                        }
                        // 마지막 전 단계까지는 Map, 아닐 경우 오류
                        if (!(resultBunchObject instanceof Map) && (bIndex < bCount - 1)) {
                            throw new RuntimeException("[" + resultBunch + "]해당 항목은 결과를 읽을 수 없는 TAG입니다.");
                        }
                    }
                }
                if (resultBunchObject == null) {
                    throw new RuntimeException("[" + resultBunch + "]해당 항목으로 결과 데이터가 존재하지 않습니다.");
                }

                if (resultBunchObject instanceof List) {
                    jsonRows = (List<Map<String, Object>>)resultBunchObject;
                } else {
                    jsonRows = Util.newList();
                    jsonRows.add((Map<String, Object>)resultBunchObject);
                }
            }

            StringBuilder sbIFResultValue = new StringBuilder();
            // 결과 데이터 컬럼 정보 기록 ----------------------------------------------------------
            Map<String, Object> ifResultData;
            // 전체 컬럼이 포함된 Row 체크
            int cIndex = 0, cCount = 0;
            for (int rIndex = 0, rCount = jsonRows.size(); rIndex < rCount; rIndex++) {
                ifResultData = jsonRows.get(rIndex);
                if (ifResultData.size() > cCount) {
                    cCount = ifResultData.size();
                    cIndex = rIndex;
                }
            }
            ifResultData = jsonRows.get(cIndex);
            Set<String> keys = ifResultData.keySet();
            cCount = keys.size();
            cIndex = 0;
            String[] columns = new String[cCount];
            for (String colName : keys) {
                columns[cIndex] = colName;
                cIndex++;
                // CHECK_VALUE 컬럼 인덱스는 1부터 시작, 컬럼명[인덱스]컬럼명[인덱스]...
                sbIFResultValue.append(colName).append("[").append(cIndex).append("]");
            }

            emIFResultData = Util.newMap();
            emIFResultData.put("P_IF_RESULT_DIV", "C"); // C - 컬럼정보
            emIFResultData.put("P_IF_RESULT_SEQ", 1);
            emIFResultData.put("P_IF_RESULT_VAL", sbIFResultValue.toString());
            lstEMIFResult.add(emIFResultData);

            // 결과 데이터 값 기록------------------------------------------------------------------
            // 구분자 변경(리턴 결과에 포함되어 있을 경우 처리불가)
            String colSeparator = String.valueOf((char)11);
            for (int rIndex = 0, rCount = jsonRows.size(); rIndex < rCount; rIndex++) {
                sbIFResultValue.setLength(0);
                ifResultData = jsonRows.get(rIndex);
                // 컬럼 순서대로 읽어서 기록
                for (cIndex = 0; cIndex < cCount; cIndex++) {
                    Object columnVal = ifResultData.get(columns[cIndex]);
                    // 값이 null이 아닐 경우
                    if (Util.isNotNull(columnVal)) {
                        sbIFResultValue.append(columnVal);
                    }
                    sbIFResultValue.append(colSeparator);
                }

                emIFResultData = Util.newMap();
                emIFResultData.put("P_IF_RESULT_DIV", "D"); // D - 결과데이터 값
                emIFResultData.put("P_IF_RESULT_SEQ", rIndex + 1); // 1부터 결과데이터 값
                emIFResultData.put("P_IF_RESULT_VAL", sbIFResultValue.toString());
                lstEMIFResult.add(emIFResultData);
            }
            callParams.put(Consts.PK_DS_MASTER, lstEMIFResult);

            // 결과 데이터 반영
            dao.insertEMIFResult(callParams);

            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            oMsg = Util.getErrorMessage(e);
            result = oMsg;
        }
        // -----------------------------------------------------------------------------------------

        // 정상 송신 후 결과 데이터를 반영하지 못한 경우 오류로 기록--------------------------------
        if (!Consts.OK.equals(oMsg)) {
            // 리턴 프로세싱에서 오류처리하도록 오류여부에 YES로 리턴
            ifResultMap.put("P_ERROR_YN", Consts.YES);
            ifResultMap.put("P_ERROR_MSG", oMsg);

            ts = beginTrans(dtd);
            try {
                lstEMIFResult.clear();
                emIFResultData = Util.newMap();
                emIFResultData.put("P_IF_RESULT_DIV", "E"); // E - 오류정보
                emIFResultData.put("P_IF_RESULT_SEQ", 1); // 결과기록 오류
                emIFResultData.put("P_IF_RESULT_VAL", oMsg //
                    + "\n\n[송신파일명]\n" + (String)params.get("P_BACKUP_FILE_FULL_NM") //
                    + "\n[처리결과]\n" + (String)params.get("O_REP_DOCUMENT"));
                lstEMIFResult.add(emIFResultData);

                callParams.put(Consts.PK_DS_MASTER, lstEMIFResult);

                // 결과 데이터 반영
                dao.insertEMIFResult(callParams);

                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                result = Util.getErrorMessage(e);
            }
        }
        // -----------------------------------------------------------------------------------------

        return result;
    }

    public Map<String, Object> getDefineRemoteInfo(Map<String, Object> params) {

        List<Map<String, Object>> lstDefineRemoteInfo = dao.getDefineRemoteInfo(params);
        if (lstDefineRemoteInfo == null || lstDefineRemoteInfo.size() == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.016", "송수신정의 정보가 존재하지 않습니다. 확인 후 작업하십시오."));
        }

        return lstDefineRemoteInfo.get(0);
    }

    /**
     * 실시간 송신 결과데이터 반영
     *
     * @param params
     */
    public void ifResultProcessing(Map<String, Object> params) {

        if (params == null) {
            return;
        }

        // 결과 리턴 대상이 존재하지 않으면 리턴
        List<Map<String, Object>> lstEMIFResultProcessing = Util.getDataSet(params, "O_EM_IFRESULT_DS");
        if (Util.getCount(lstEMIFResultProcessing) == 0) {
            return;
        }

        // 트랜잭션을 REQUIRES_NEW로 조정, 상위 호출 메서드에 적용된 트랜잭션과 별개로 트랜잭션 처리
        TransactionDefinition dtd = getTransDefinition(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        for (int rIndex = 0, rCount = lstEMIFResultProcessing.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> callParams = lstEMIFResultProcessing.get(rIndex);

            String oMsg = Consts.OK;
            TransactionStatus ts = beginTrans(dtd);
            try {
                // 결과반영 프로세싱 호출
                Map<String, Object> resultMap = callProcedure(SP_ID_EM_IFRESULT_PROCESSING, callParams);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }

                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                oMsg = Util.getErrorMessage(e);
            }

            // 결과데이터 정상 저장일 경우 처리 오류가 발생하면 오류로 기록
            // 웹서비스 호출이기 때문에 상대측 정상 반영
            // WMS측은 기본 처리 데이터는 반영되고, 리턴 결과만 본 테이블에 반영하지 못함
            if (!Consts.OK.equals(oMsg)) {
                ts = beginTrans(dtd);
                try {
                    List<Map<String, Object>> lstEMIFResult = Util.newList();

                    Map<String, Object> emIFResultData = Util.newMap();
                    emIFResultData.put("P_IF_RESULT_DIV", "E"); // E - 오류정보
                    emIFResultData.put("P_IF_RESULT_SEQ", 2); // 결과반영 오류
                    emIFResultData.put("P_IF_RESULT_VAL", oMsg);
                    lstEMIFResult.add(emIFResultData);

                    callParams.put(Consts.PK_DS_MASTER, lstEMIFResult);

                    // 결과 데이터 반영
                    dao.insertEMIFResult(callParams);

                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                }
            }
        }
    }
}
