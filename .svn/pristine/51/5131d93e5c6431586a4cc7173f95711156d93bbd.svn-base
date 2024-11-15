package nexos.service.ed.common;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.ed.common.EDCommonDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.db.dynamic.DynamicDataSource;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.AuthenticationUtil;
import nexos.framework.support.ServiceSupport;

/**
 * Class: EDExternalDBService<br>
 * Description: WMS External Database 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class EDExternalDBService extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(EDExternalDBService.class);

    final String        SELECT_ID_GET_ACS_INFO_HANJIN_B2B  = "EDIFAPI.GET_ACS_INFO_HANJIN_B2B";

    final String        SP_ID_PROCESSING_ACS_RESULT_HANJIN = "EDIFAPI.PROCESSING_ACS_RESULT_HANJIN";

    @SuppressWarnings("unused")
    @Autowired
    private EDCommonDAO dao;

    /**
     * 데이터의 키/값을 서비스 호출 데이터 키/값으로 변경 처리
     *
     * @param rowData
     *        변경 처리할 데이터 맵
     * @param excludeKeys
     *        변경 처리에서 제외할 데이터 키
     * @param callParams
     *        결과반영 호출 파라메터 맵
     */
    private void setParameter(Map<String, Object> rowData, String[] excludeKeys, Map<String, Object> callParams) {

        callParams.clear();
        for (Map.Entry<String, Object> entry : rowData.entrySet()) {
            String key = entry.getKey();
            for (String excludeKey : excludeKeys) {
                if (key.equals(excludeKey)) {
                    continue;
                }
            }
            // 결과반영 호출 기본 파라메터
            if (key.startsWith("P_")) {
                callParams.put(key, entry.getValue());
            }
        }
    }

    /**
     * 서비스호출 기본정보 리턴
     *
     * @param ifApiParams
     * @param ifApiSpec
     * @return
     */
    private Map<String, Object> getServiceParams(Map<String, Object> ifApiParams, Map<String, Object> ifApiSpec) {

        Map<String, Object> result = Util.newMap();

        for (Map.Entry<String, Object> entry : ifApiSpec.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("SP_")) {
                result.put(key.replaceFirst("SP_", "P_"), entry.getValue());
            }
            if (key.startsWith("PV_")) {
                result.put(key, entry.getValue());
            }
        }

        // 서비스 호출 결과 파라메터 매핑 정보 파싱
        Map<String, Object> resultToParams = Util.toKeyValues((String)result.get("P_RESULT_TO_PARAM_MAP"));
        if (resultToParams.size() == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDEXTERNALDBSERVICE.XXX", "[P_RESULT_TO_PARAM_MAP]파라메터 매핑 정보가 존재하지 않습니다."));
        }
        result.put("P_RESULT_TO_PARAMS", resultToParams);
        // IFAPI 구분 값 입력
        result.put("P_IFAPI_DIV", ifApiParams.get("P_IFAPI_DIV"));

        return result;
    }

    /**
     * [한진택배] 주소정제 웹서비스 호출<br>
     * 별도 쓰레드로 동작 함
     *
     * @param params
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_PROCESS_CD          프로세스코드(A: 출고예정, B: 출고등록)
     * P_CHECKED_VALUE       프로세스코드에 맞는 출고정보 및 택배기준(운송사/고객사/택배사구분)정보
     * P_USER_ID             사용자ID
     * P_THREAD_YN           쓰레드로 동작할지 여부, 기본값 N
     *        </pre>
     * @return
     */
    public void callAcsGetAddressHanjin(final Map<String, Object> params) {

        List<Map<String, Object>> dsAcsGetAddress = null;
        TransactionStatus ts = beginTrans();
        try {
            getDefaultDao().insertCheckedValue(params);
            dsAcsGetAddress = getDataList(SELECT_ID_GET_ACS_INFO_HANJIN_B2B, params);
        } finally {
            rollbackTrans(ts);
        }
        if (dsAcsGetAddress == null || dsAcsGetAddress.size() == 0) {
            return;
        }

        // IFAPI 구분 값 입력
        params.put("P_IFAPI_DIV", "ACS_HANJIN");
        // 쓰레드 동작, 기본값 N
        String threadYn = Util.nullToDefault(params.get("P_THREAD_YN"), Consts.NO);
        if (Consts.YES.equals(threadYn)) {
            final List<Map<String, Object>> dsThreadAcsGetAddress = dsAcsGetAddress;
            new Thread(new Runnable() {

                @Override
                public void run() {
                    AuthenticationUtil.configureAuthentication();
                    try {
                        callAcsGetAddressHanjin(params, dsThreadAcsGetAddress);
                    } catch (Exception e) {
                    } finally {
                        AuthenticationUtil.clearAuthentication();
                    }
                }
            }).start();
        } else {
            callAcsGetAddressHanjin(params, dsAcsGetAddress);
        }
    }

    @SuppressWarnings("unchecked")
    private void callAcsGetAddressHanjin(Map<String, Object> params, List<Map<String, Object>> dsAcsGetAddress) {

        int acsTotal = dsAcsGetAddress.size();
        int acsProcess = 0;
        int acsError = 0;

        DynamicDataSource dbcDataSource = null;
        PreparedStatement selectStatement = null;
        try {
            // External DB 호출 기본정보 - 컬럼명 SP_로 시작, 입력시 P_로 변경하여 입력
            Map<String, Object> serviceParams = getServiceParams(params, dsAcsGetAddress.get(0));

            String remoteDiv = (String)serviceParams.get("P_REMOTE_DIV");
            String remoteIp = (String)serviceParams.get("P_REMOTE_IP");
            String remotePort = (String)serviceParams.get("P_REMOTE_PORT");
            String remoteUserId = (String)serviceParams.get("P_REMOTE_USER_ID");
            String remoteUserPwd = (String)serviceParams.get("P_REMOTE_USER_PWD");
            String remoteDbNm = (String)serviceParams.get("P_LINK_DB_NM");
            String remoteTableNm = (String)serviceParams.get("P_LINK_TABLE_NM");

            if (remoteDiv == null //
                || remoteIp == null || remotePort == null || remoteUserId == null || remoteUserPwd == null //
                || remoteDbNm == null || remoteTableNm == null) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDEXTERNALDBSERVICE.XXX", "원격 데이터베이스 접속정보를 정확히 설정하십시오."));
            }

            Map<String, Object> resultToParams = (Map<String, Object>)serviceParams.get("P_RESULT_TO_PARAMS");
            Set<Map.Entry<String, Object>> resultToParamEntries = resultToParams.entrySet();
            String execTimeParam = (String)serviceParams.get("P_EXEC_TIME_PARAM");
            String userId = (String)params.get(Consts.PK_USER_ID);
            Util.setOutMessage(params, Consts.OK);

            String remoteSelectList = Util.nullToDefault(serviceParams.get("P_LINK_SELECT_LIST"), "*");
            String remoteWhereText = (String)serviceParams.get("P_LINK_WHERE_TEXT");
            int bindingParamCount = Util.toInt(serviceParams.get("PV_CNT"), 0);
            String linkSelectText = "SELECT " + remoteSelectList + " FROM " + remoteTableNm;
            if (remoteWhereText != null) {
                linkSelectText += " WHERE " + remoteWhereText;
            }

            // DataSource 생성
            dbcDataSource = new DynamicDataSource(remoteDiv, remoteIp, remotePort, remoteDbNm, remoteUserId, remoteUserPwd);
            selectStatement = dbcDataSource.prepareStatement(linkSelectText);

            // 전표 단위 처리
            Map<String, Object> callParams = Util.newMap();
            String[] excludeDataKeys = new String[] {};
            for (Map<String, Object> rowData : dsAcsGetAddress) {
                boolean incAcsError = false;
                TransactionStatus ts = beginTrans();
                try {
                    selectStatement.clearParameters();
                    // 조건 변수 바인딩
                    for (int rIndex = 1; rIndex <= bindingParamCount; rIndex++) {
                        selectStatement.setObject(rIndex, rowData.get("PV_" + (rIndex < 10 ? "0" : "") + rIndex));
                    }

                    // 주소정제 데이터 서비스호출/ 결과반영 키/값으로 변경
                    setParameter(rowData, excludeDataKeys, callParams);
                    // 추가 정보 파라메터에 추가
                    callParams.put(Consts.PK_USER_ID, userId);

                    long startTime = System.currentTimeMillis();
                    // 우편번호 뷰 데이터 조회
                    ResultSet rsAddress = selectStatement.executeQuery();
                    // 첫번째 Record의 값으로 파라메터 세팅
                    if (rsAddress.next()) {
                        for (Map.Entry<String, Object> resultToParamEntry : resultToParamEntries) {
                            callParams.put((String)resultToParamEntry.getValue(), rsAddress.getObject(resultToParamEntry.getKey()));
                        }
                        callParams.put((String)serviceParams.get("P_RESULT_CD"), "0");
                    } else {
                        callParams.put((String)serviceParams.get("P_RESULT_CD"), "-1");
                        callParams.put((String)serviceParams.get("P_RESULT_MSG"),
                            (bindingParamCount > 0 ? "[" + rowData.get("PV_01") + "]" : "") + "데이터 없음");
                        incAcsError = true;
                    }
                    if (Util.isNotNull(execTimeParam)) {
                        callParams.put(execTimeParam, String.format("%.2f", (System.currentTimeMillis() - startTime) / 1000f));
                    }
                    acsProcess++;

                    Map<String, Object> callResultMap = callProcedure(SP_ID_PROCESSING_ACS_RESULT_HANJIN, callParams);
                    String oMsg = Util.getOutMessage(callResultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }

                    commitTrans(ts);
                    if (incAcsError) {
                        acsError++;
                    }
                } catch (Exception e) {
                    acsError++;
                    rollbackTrans(ts);
                }
            }
        } catch (Exception e) {
            Util.setOutMessage(params, Util.getErrorMessage(e));
        } finally {
            JdbcUtils.closeStatement(selectStatement);
            DynamicDataSource.releaseConnection(dbcDataSource);
        }
        // 처리건수 및 오류건수 리턴
        params.put("O_TOTAL_CNT", acsTotal);
        params.put("O_PROCESS_CNT", acsProcess);
        params.put("O_ERROR_CNT", acsError);
    }
}