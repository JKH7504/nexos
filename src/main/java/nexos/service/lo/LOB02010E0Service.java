package nexos.service.lo;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.web.multipart.MultipartFile;

import nexos.dao.lo.LOB02010E0DAO;
import nexos.framework.Consts;
import nexos.framework.NexosConsts;
import nexos.framework.Util;
import nexos.framework.json.JsonDataSet;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServiceSupport;
import nexos.service.ed.common.EDCommonService;
import nexos.service.ed.common.EDExternalDBService;
import nexos.service.ed.common.EDRESTfulService;
import nexos.service.ed.common.EDSOAPService;

/**
 * Class: LOB02010E0Service<br>
 * Description: 출고작업(LOB02010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LOB02010E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(LOB02010E0Service.class);

    final String                SP_ID_GET_LO_OUTBOUND_STATE         = "WF.GET_LO_OUTBOUND_STATE";
    final String                SP_ID_LO_PROCESSING                 = "LO_PROCESSING";
    final String                SP_ID_LO_FW_ENTRY_PROCESSING        = "LO_FW_ENTRY_PROCESSING";
    final String                SP_ID_LO_POLICY_ORDER_ADJUSTMENT_T1 = "LO_POLICY_ORDER_ADJUSTMENT_T1";
    final String                SP_ID_LO_FW_ENTRY_BATCH             = "LO_FW_ENTRY_BATCH";
    final String                SP_ID_LO_BW_ENTRY_BATCH             = "LO_BW_ENTRY_BATCH";
    final String                SP_ID_LO_ATTACH_FILE_NM_UPDATE      = "LO_ATTACH_FILE_NM_UPDATE";
    final String                SP_ID_WCS_SEND_FW_LO_BATCH          = "WCS.SEND_FW_LO_BATCH";
    final String                SP_ID_WCS_SEND_BW_LO_BATCH          = "WCS.SEND_BW_LO_BATCH";

    @Autowired
    private LOB02010E0DAO       dao;

    @Autowired
    private EDCommonService     edCommonService;

    @Autowired
    private EDSOAPService       edSOAPService;

    @Autowired
    private EDRESTfulService    edRESTfulService;

    @Autowired
    private EDExternalDBService edExternalDBService;

    /**
     * Query 실행 후 조회 데이터를 List 형태로 Return
     */
    public JsonDataSet getDataSetEntryBT(String queryId, Map<String, Object> params) throws Exception {

        // 출고가능 수량 조정 처리
        callOrderAdjustment(params);

        return getDataSet(queryId, params);
    }

    /**
     * 출고차수를 채번
     *
     * @param params
     * @return
     */
    public Map<String, Object> getOutboundBatch(Map<String, Object> params) {

        return dao.getOutboundBatch(params);
    }

    /**
     * OUTBOUND_STATE 체크
     *
     * @param params
     * @param checkState
     * @return
     */
    public String canProcessingState(Map<String, Object> params, String checkState) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_LO_OUTBOUND_STATE, params);
        String oMsg = Util.getOutMessage(resultMap);
        if (Consts.OK.equals(oMsg)) {
            String oOutboundState = (String)resultMap.get("O_OUTBOUND_STATE");
            if (!Util.nullToEmpty(checkState).equals(oOutboundState)) {
                result = NexosMessage.getDisplayMsg("JAVA.STATE.002", "[전표번호 : " + (String)resultMap.get("P_OUTBOUND_NO") //
                    + ", 진행상태 : " + oOutboundState + "] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오."//
                    , new String[ ] {(String)resultMap.get("P_OUTBOUND_NO"), oOutboundState});
            }
        } else {
            result = oMsg;
        }

        return result;
    }

    /**
     * LO_PROCESSING 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public String callLOProcessing(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

        String PROCESS_CD = Util.nullToEmpty(params.get(Consts.PK_PROCESS_CD));
        String DIRECTION = (String)params.get(Consts.PK_DIRECTION);
        String PROCESS_STATE_FW = (String)params.get(Consts.PK_PROCESS_STATE_FW);
        String PROCESS_STATE_BW = (String)params.get(Consts.PK_PROCESS_STATE_BW);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);
        // -- PROCESS_ENTRY, DIRECTION_FW 처리에 사용 파라메터 -----------------------------
        String OUTBOUND_DATE_B = (String)params.get("P_OUTBOUND_DATE_B"); // 출고일자
        String DELIVERY_BATCH = (String)params.get("P_DELIVERY_BATCH"); // 운송차수
        String DELIVERY_BATCH_NM = (String)params.get("P_DELIVERY_BATCH_NM"); // 운송차수명
        // -- PROCESS_DIRECTIONS, DIRECTION_FW 처리에 사용 파라메터 ------------------------
        String OUTBOUND_BATCH = (String)params.get("P_OUTBOUND_BATCH"); // 출고차수
        String OUTBOUND_BATCH_NM = (String)params.get("P_OUTBOUND_BATCH_NM"); // 출고차수명
        String OUTBOUND_BATCH_DIV = (String)params.get("P_OUTBOUND_BATCH_DIV"); // 출고차수구분
        String EQUIP_DIV = (String)params.get("P_EQUIP_DIV"); // 장비구분
        // ---------------------------------------------------------------------------------

        // 처리할 수 있는 진행상태
        String CHECK_STATE = "";
        String CHECK_PROCESS_CD = Consts.PROCESS_ENTRY;
        // 처리
        if (Consts.DIRECTION_FW.equals(DIRECTION)) {
            CHECK_STATE = PROCESS_STATE_FW;
            if (PROCESS_CD.startsWith(Consts.PROCESS_ENTRY)) {
                CHECK_STATE = Consts.STATE_ORDER;
                CHECK_PROCESS_CD = Consts.PROCESS_ORDER;
            }
        }
        // 취소
        else {
            CHECK_STATE = PROCESS_STATE_BW;
        }

        Map<String, Object> checkParams = new HashMap<String, Object>();
        checkParams.put("P_LINE_NO", ""); // 전표단위
        checkParams.put(Consts.PK_PROCESS_CD, CHECK_PROCESS_CD);
        checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

        // LO_PROCESSING 호출
        // 전표 단위 Transaction
        Map<String, Object> callParams;
        StringBuffer sbResult = new StringBuffer();
        Map<String, Object> realtimeMap = null;
        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {

            // SP 호출 파라메터
            callParams = dsMaster.get(rIndex);
            callParams.put(Consts.PK_PROCESS_CD, PROCESS_CD);
            callParams.put(Consts.PK_DIRECTION, DIRECTION);
            callParams.put(Consts.PK_USER_ID, USER_ID);

            String CENTER_CD = (String)callParams.get("P_CENTER_CD");
            String BU_CD = (String)callParams.get("P_BU_CD");
            String OUTBOUND_DATE = (String)callParams.get("P_OUTBOUND_DATE");
            String OUTBOUND_NO = (String)callParams.get("P_OUTBOUND_NO");

            // 진행상태 체크
            checkParams.put("P_CENTER_CD", CENTER_CD);
            checkParams.put("P_BU_CD", BU_CD);
            checkParams.put("P_OUTBOUND_DATE", OUTBOUND_DATE);
            checkParams.put("P_OUTBOUND_NO", OUTBOUND_NO);
            String oMsg = canProcessingState(checkParams, CHECK_STATE);
            if (!Consts.OK.equals(oMsg)) {
                sbResult.append(oMsg).append(Consts.CRLF);
                continue;
            }

            // LO_PROCESSING 호출
            realtimeMap = null;
            TransactionStatus ts = beginTrans(td);
            try {
                // 출고등록[개별] - FW 처리일 경우
                // 출고등록[일괄] - FW 처리일 경우 LO_PROCESSING이 아닌 LO_ENTRY_PROCESSING 호출
                if (PROCESS_CD.startsWith(Consts.PROCESS_ENTRY) && Consts.DIRECTION_FW.equals(DIRECTION)) {
                    // 출고등록[개별]일 경우 운송차수 채번 후 처리
                    callParams.put("P_ORDER_DATE", OUTBOUND_DATE);
                    callParams.put("P_ORDER_NO", OUTBOUND_NO);
                    callParams.put("P_OUTBOUND_DATE", OUTBOUND_DATE_B);
                    // 운송차수가 "999"가 아닌 경우만 해당일자 일마감 여부 체크
                    if (!"999".equals(DELIVERY_BATCH)) {
                        Map<String, Object> closingDailyCheckMap = dao.getClosingDailyCheck(callParams);
                        String LD_CONFIRM_YN = (String)closingDailyCheckMap.get("O_DAILY_CHECK");

                        if (Consts.YES.equals(LD_CONFIRM_YN)) {
                            rollbackTrans(ts);
                            sbResult.append(Util.getOutMessage(closingDailyCheckMap)).append(Consts.CRLF);
                            continue;
                        }
                    }
                    // 운송차수가 "000"인 경우만 채번하고 그 외에는 선택한 운송차수로 등록
                    if (Util.isNull(DELIVERY_BATCH) || Consts.BASE_BATCH_NO.equals(DELIVERY_BATCH)) {
                        callParams.put("P_DELIVERY_BATCH", DELIVERY_BATCH);
                        callParams.put("P_DELIVERY_BATCH_NM", DELIVERY_BATCH_NM);

                        Map<String, Object> deliveryBatchMap = dao.getDeliveryBatch(callParams);
                        DELIVERY_BATCH = (String)deliveryBatchMap.get("O_DELIVERY_BATCH");
                        callParams.put("P_DELIVERY_BATCH", DELIVERY_BATCH);
                    } else {
                        callParams.put("P_DELIVERY_BATCH", DELIVERY_BATCH);
                    }

                    Map<String, Object> resultMap = callProcedure(SP_ID_LO_FW_ENTRY_PROCESSING, callParams);
                    oMsg = Util.getOutMessage(resultMap);
                }
                // 출고지시 - FW 처리일 경우
                else if (Consts.PROCESS_DIRECTIONS.equals(PROCESS_CD) && Consts.DIRECTION_FW.equals(DIRECTION)) {
                    // 출고지시일 경우 출고차수 채번/UPDATE 후 처리
                    if (Util.isNull(OUTBOUND_BATCH) || Consts.BASE_BATCH_NO.equals(OUTBOUND_BATCH)) {
                        // 신규출고배치 취득 위한 파라메터 설정
                        callParams.put("P_OUTBOUND_BATCH", OUTBOUND_BATCH);
                        callParams.put("P_OUTBOUND_BATCH_NM", OUTBOUND_BATCH_NM);
                        callParams.put("P_OUTBOUND_BATCH_DIV", OUTBOUND_BATCH_DIV);
                        callParams.put("P_EQUIP_DIV", EQUIP_DIV);

                        Map<String, Object> outboundBatchMap = dao.getOutboundBatch(callParams);
                        // LO020NM에 저장할 데이터 파라메터에 설정
                        OUTBOUND_BATCH = (String)outboundBatchMap.get("O_OUTBOUND_BATCH");
                        OUTBOUND_BATCH_NM = (String)outboundBatchMap.get("O_OUTBOUND_BATCH_NM");
                        callParams.put("P_OUTBOUND_BATCH", OUTBOUND_BATCH);
                        callParams.put("P_OUTBOUND_BATCH_NM", OUTBOUND_BATCH_NM);
                    } else {
                        callParams.put("P_OUTBOUND_BATCH", OUTBOUND_BATCH);
                        callParams.put("P_OUTBOUND_BATCH_NM", OUTBOUND_BATCH_NM);
                        callParams.put("P_EQUIP_DIV", EQUIP_DIV);
                    }
                    dao.updateOutboundBatch(callParams);

                    // LO_PROCESSING 호출
                    Map<String, Object> resultMap = callProcedure(SP_ID_LO_PROCESSING, callParams);
                    oMsg = Util.getOutMessage(resultMap);
                }
                // 그외 LO_PROCESSING 호출
                else {
                    // LO_PROCESSING 호출
                    Map<String, Object> resultMap = callProcedure(SP_ID_LO_PROCESSING, callParams);
                    oMsg = Util.getOutMessage(resultMap);
                }

                if (!Consts.OK.equals(oMsg)) {
                    rollbackTrans(ts);
                    sbResult.append(oMsg).append(Consts.CRLF);
                    continue;
                }

                // 실시간 송신 호출
                realtimeMap = edCommonService.realtimeSendProcessing();
                oMsg = Util.getOutMessage(realtimeMap);
                if (!Consts.OK.equals(oMsg)) {
                    rollbackTrans(ts);
                    sbResult.append(oMsg).append(Consts.CRLF);
                    continue;
                }

                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                throw new RuntimeException(Util.getErrorMessage(e));
            }

            // 실시간 결과 데이터 반영, 자체 트랜잭션 처리 함
            if (realtimeMap != null && Consts.OK.equals(Util.getOutMessage(realtimeMap))) {
                edCommonService.ifResultProcessing(realtimeMap);
            }
        }

        if (sbResult.length() == 0) {
            sbResult.append(Consts.OK);
        }

        return sbResult.toString();
    }

    /**
     * 주소정체 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callAcsGetAddress(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = Util.newMap();
        Util.setOutMessage(resultMap, Consts.OK);
        resultMap.put("O_ACS_ERROR_MSG", Consts.OK);

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);

        // 주소정제 주문정보 입력
        StringBuffer sbAcsGetAddress;
        StringBuffer sbAcsGetAddressCJB2B = new StringBuffer();
        StringBuffer sbAcsGetAddressCJB2C = new StringBuffer();
        StringBuffer sbAcsGetAddressEPostB2B = new StringBuffer();
        StringBuffer sbAcsGetAddressEPostB2C = new StringBuffer();
        StringBuffer sbAcsGetAddressHanjinB2B = new StringBuffer();
        StringBuffer sbAcsGetAddressHanjinB2C = new StringBuffer();
        StringBuffer sbAcsGetAddressLotteB2B = new StringBuffer();
        StringBuffer sbAcsGetAddressLotteB2C = new StringBuffer();
        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);

            sbAcsGetAddress = null;
            String hdcDiv = Util.nullToEmpty(rowData.get("P_HDC_DIV"));
            switch (hdcDiv) {
                // A1 한진택배B2B
                case Consts.HDC_DIV_HANJIN_B2B:
                    sbAcsGetAddress = sbAcsGetAddressHanjinB2B;
                    break;
                // A2 한진택배B2C
                case Consts.HDC_DIV_HANJIN_B2C:
                    sbAcsGetAddress = sbAcsGetAddressHanjinB2C;
                    break;
                // B1 우체국택배B2B
                case Consts.HDC_DIV_EPOST_B2B:
                    sbAcsGetAddress = sbAcsGetAddressEPostB2B;
                    break;
                // B2 우체국택배B2C
                case Consts.HDC_DIV_EPOST_B2C:
                    sbAcsGetAddress = sbAcsGetAddressEPostB2C;
                    break;
                // C1 CJ대한통운B2B
                case Consts.HDC_DIV_CJ_B2B:
                    sbAcsGetAddress = sbAcsGetAddressCJB2B;
                    break;
                // C2 CJ대한통운B2C
                case Consts.HDC_DIV_CJ_B2C:
                    sbAcsGetAddress = sbAcsGetAddressCJB2C;
                    break;
                // D1 롯데택배B2B
                case Consts.HDC_DIV_LOTTE_B2B:
                    sbAcsGetAddress = sbAcsGetAddressLotteB2B;
                    break;
                // D2 롯데택배B2C
                case Consts.HDC_DIV_LOTTE_B2C:
                    sbAcsGetAddress = sbAcsGetAddressLotteB2C;
                    break;
            }
            if (sbAcsGetAddress != null) {
                sbAcsGetAddress.append(Consts.SEP_ROW) //
                    // CENTER_CD;BU_CD;ORDER_DATE;ORDER_NO;;CARRIER_CD;HDC_CUST_CD;HDC_DIV
                    .append(rowData.get("P_CENTER_CD")).append(Consts.SEP_COL) //
                    .append(rowData.get("P_BU_CD")).append(Consts.SEP_COL) //
                    .append(rowData.get("P_ORDER_DATE")).append(Consts.SEP_COL) //
                    .append(rowData.get("P_ORDER_NO")).append(Consts.SEP_COL) //
                    .append(rowData.get("P_CARRIER_CD")).append(Consts.SEP_COL) //
                    .append(rowData.get("P_HDC_CUST_CD")).append(Consts.SEP_COL) //
                    .append(hdcDiv); //
            }
        }

        int acsTotal = 0;
        int acsProcess = 0;
        int acsError = 0;
        String acsErrorMsg = "";
        // 주소정제 파라메터 기본값 입력
        Map<String, Object> acsGetAddressParams = Util.newMap();
        // A1 한진택배B2B
        if (sbAcsGetAddressHanjinB2B.length() > 0) {
            acsGetAddressParams.clear();
            acsGetAddressParams.put(Consts.PK_PROCESS_CD, params.get(Consts.PK_PROCESS_CD));
            acsGetAddressParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
            acsGetAddressParams.put(Consts.PK_CHECKED_VALUE, sbAcsGetAddressHanjinB2B.toString().substring(Consts.SEP_ROW.length()));
            edExternalDBService.callAcsGetAddressHanjin(acsGetAddressParams);
            acsTotal += Util.toInt(acsGetAddressParams.get("O_TOTAL_CNT"));
            acsProcess += Util.toInt(acsGetAddressParams.get("O_PROCESS_CNT"));
            acsError += Util.toInt(acsGetAddressParams.get("O_ERROR_CNT"));
            String oMsg = Util.getOutMessage(acsGetAddressParams);
            if (!Consts.OK.equals(oMsg)) {
                acsErrorMsg += "\n" + oMsg;
            }
        }
        // A2 한진택배B2C
        if (sbAcsGetAddressHanjinB2C.length() > 0) {
            acsGetAddressParams.clear();
            acsGetAddressParams.put(Consts.PK_PROCESS_CD, params.get(Consts.PK_PROCESS_CD));
            acsGetAddressParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
            acsGetAddressParams.put(Consts.PK_CHECKED_VALUE, sbAcsGetAddressHanjinB2C.toString().substring(Consts.SEP_ROW.length()));
            edRESTfulService.callAcsGetAddressHanjin(acsGetAddressParams);
            acsTotal += Util.toInt(acsGetAddressParams.get("O_TOTAL_CNT"));
            acsProcess += Util.toInt(acsGetAddressParams.get("O_PROCESS_CNT"));
            acsError += Util.toInt(acsGetAddressParams.get("O_ERROR_CNT"));
            String oMsg = Util.getOutMessage(acsGetAddressParams);
            if (!Consts.OK.equals(oMsg)) {
                acsErrorMsg += "\n" + oMsg;
            }
        }
        // B1 우체국택배B2B: TODO: 현재 처리 로직 없음, 오류 처리
        if (sbAcsGetAddressEPostB2B.length() > 0) {
            acsErrorMsg += "\n" + NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "우체국택배B2B는 주소정제 처리할 수 없습니다.");
        }
        // B2 우체국택배B2C
        if (sbAcsGetAddressEPostB2C.length() > 0) {
            acsGetAddressParams.clear();
            acsGetAddressParams.put(Consts.PK_PROCESS_CD, params.get(Consts.PK_PROCESS_CD));
            acsGetAddressParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
            acsGetAddressParams.put(Consts.PK_CHECKED_VALUE, sbAcsGetAddressEPostB2C.toString().substring(Consts.SEP_ROW.length()));
            edRESTfulService.callAcsGetAddressEPost(acsGetAddressParams);
            acsTotal += Util.toInt(acsGetAddressParams.get("O_TOTAL_CNT"));
            acsProcess += Util.toInt(acsGetAddressParams.get("O_PROCESS_CNT"));
            acsError += Util.toInt(acsGetAddressParams.get("O_ERROR_CNT"));
            String oMsg = Util.getOutMessage(acsGetAddressParams);
            if (!Consts.OK.equals(oMsg)) {
                acsErrorMsg += "\n" + oMsg;
            }
        }
        // C1 CJ대한통운B2B: TODO: 현재 처리 로직 없음, 오류 처리
        if (sbAcsGetAddressCJB2B.length() > 0) {
            acsErrorMsg += "\n" + NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "CJ대한통운B2B는 주소정제 처리할 수 없습니다.");
        }
        // C2 CJ대한통운B2C
        if (sbAcsGetAddressCJB2C.length() > 0) {
            acsGetAddressParams.clear();
            acsGetAddressParams.put(Consts.PK_PROCESS_CD, params.get(Consts.PK_PROCESS_CD));
            acsGetAddressParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
            acsGetAddressParams.put(Consts.PK_CHECKED_VALUE, sbAcsGetAddressCJB2C.toString().substring(Consts.SEP_ROW.length()));
            edSOAPService.callAcsGetAddressCJ(acsGetAddressParams);
            acsTotal += Util.toInt(acsGetAddressParams.get("O_TOTAL_CNT"));
            acsProcess += Util.toInt(acsGetAddressParams.get("O_PROCESS_CNT"));
            acsError += Util.toInt(acsGetAddressParams.get("O_ERROR_CNT"));
            String oMsg = Util.getOutMessage(acsGetAddressParams);
            if (!Consts.OK.equals(oMsg)) {
                acsErrorMsg += "\n" + oMsg;
            }
        }
        // D1 롯데택배B2B: TODO: 현재 처리 로직 없음, 오류 처리
        if (sbAcsGetAddressLotteB2B.length() > 0) {
            acsErrorMsg += "\n" + NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "롯데택배B2B는 주소정제 처리할 수 없습니다.");
        }
        // D2 롯데택배B2C
        if (sbAcsGetAddressLotteB2C.length() > 0) {
            acsGetAddressParams.clear();
            acsGetAddressParams.put(Consts.PK_PROCESS_CD, params.get(Consts.PK_PROCESS_CD));
            acsGetAddressParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
            acsGetAddressParams.put(Consts.PK_CHECKED_VALUE, sbAcsGetAddressLotteB2C.toString().substring(Consts.SEP_ROW.length()));
            edRESTfulService.callAcsGetAddressLotte(acsGetAddressParams);
            acsTotal += Util.toInt(acsGetAddressParams.get("O_TOTAL_CNT"));
            acsProcess += Util.toInt(acsGetAddressParams.get("O_PROCESS_CNT"));
            acsError += Util.toInt(acsGetAddressParams.get("O_ERROR_CNT"));
            String oMsg = Util.getOutMessage(acsGetAddressParams);
            if (!Consts.OK.equals(oMsg)) {
                acsErrorMsg += "\n" + oMsg;
            }
        }

        resultMap.put("O_TOTAL_CNT", acsTotal);
        resultMap.put("O_PROCESS_CNT", acsProcess);
        resultMap.put("O_ERROR_CNT", acsError);
        if (Util.isNotNull(acsErrorMsg)) {
            resultMap.put("O_ACS_ERROR_MSG", acsErrorMsg);
        }

        return resultMap;
    }

    /**
     * 출고등록(일괄) 출고가능 수량 조정 처리
     *
     * @param params
     *        조회 조건
     */
    public String callOrderAdjustment(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            Map<String, Object> resultMap = callProcedure(SP_ID_LO_POLICY_ORDER_ADJUSTMENT_T1, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 출고일괄등록/취소 처리
     *
     * @param params
     *        수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String callEntryBatchProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        Map<String, Object> realtimeMap = null;
        TransactionStatus ts = beginTrans();
        try {
            List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
            Map<String, Object> callParams = dsMaster.get(0);
            callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));

            String PROCEDURE_ID = null;
            if (Consts.DIRECTION_FW.equals(params.get(Consts.PK_DIRECTION))) {
                PROCEDURE_ID = SP_ID_LO_FW_ENTRY_BATCH;
            } else {
                PROCEDURE_ID = SP_ID_LO_BW_ENTRY_BATCH;
            }

            Map<String, Object> resultMap = callProcedure(PROCEDURE_ID, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            // 실시간 송신 호출
            realtimeMap = edCommonService.realtimeSendProcessing();
            oMsg = Util.getOutMessage(realtimeMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 실시간 결과 데이터 반영, 자체 트랜잭션 처리 함
        if (realtimeMap != null && Consts.OK.equals(Util.getOutMessage(realtimeMap))) {
            edCommonService.ifResultProcessing(realtimeMap);
        }

        return result;
    }

    /**
     * 배송지갱신 처리
     *
     * @param params
     *        수정된 데이터
     */
    public String callLoSetAddress(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.callLoSetAddress(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 거래명세서일자 수정 처리
     *
     * @param params
     *        수정된 데이터
     */
    public String callInoutDateUpdate(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.callInoutDateUpdate(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 출하장비전송 처리
     *
     * @param params
     *        수정된 데이터
     */
    public Map<String, Object> callSendFwLoBatch(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_WCS_SEND_FW_LO_BATCH, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return resultMap;
    }

    /**
     * 출하장비전송 취소 처리
     *
     * @param params
     *        수정된 데이터
     */
    public Map<String, Object> callSendBwLoBatch(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_WCS_SEND_BW_LO_BATCH, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return resultMap;
    }

    /**
     * 첨부파일 업로드 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> attachmentFileUpload(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;
        File oldAttachFile = null;
        File oldAttachBackupFile = null;
        TransactionStatus ts = beginTrans();
        try {
            String attachFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.ATTACHMENT.ORDER.LO") //
            );
            MultipartFile attachmentMultipartFile = (MultipartFile)params.get("P_UPLOAD_FILE");
            params.remove("P_UPLOAD_FILE"); // return시 MultipartFile는 serialize가 안되기 때문에 제거
            String attachFileNm = Util.replaceRestrictChars(attachmentMultipartFile.getOriginalFilename());
            params.put("P_ATTACH_FILE_NM", attachFileNm);

            resultMap = callProcedure(SP_ID_LO_ATTACH_FILE_NM_UPDATE, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            String newAttachFileNm = (String)resultMap.get("O_NEW_ATTACH_FILE_NM");
            String oldAttachFileNm = (String)resultMap.get("O_OLD_ATTACH_FILE_NM");

            File newAttachFile = new File(attachFilePath, newAttachFileNm);
            if (newAttachFile.exists()) {
                // 첨부파일명과 동일한 파일이 이미 존재할 경우, 삭제, 삭제불가시 오류
                if (!newAttachFile.delete()) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "첨부파일: " + attachFileNm //
                        + "\n\n해당 파일명으로 파일을 저장할 수 없습니다. 파일명을 변경 후 처리하십시오.", new String[ ] {attachFileNm}));
                }
            }

            // 기존 첨부파일이 존재할 경우 백업 후 정상 처리될 경우에 삭제
            if (Util.isNotNull(oldAttachFileNm)) {
                oldAttachFile = new File(attachFilePath, oldAttachFileNm);
                if (oldAttachFile.exists()) {
                    oldAttachBackupFile = new File(attachFilePath, oldAttachFileNm + ".bak");
                    if (!oldAttachFile.renameTo(oldAttachBackupFile)) {
                        // throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "기존 첨부 파일을 삭제할 수 없습니다."));
                    }
                }
            }
            try {
                attachmentMultipartFile.transferTo(newAttachFile);
            } catch (Exception e) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "첨부파일: " + attachFileNm //
                    + "\n\n해당 첨부 파일을 전송하지 못했습니다.", new String[ ] {attachFileNm}));
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 정상 처리시 이전 파일 삭제
        if (oldAttachFile != null) {
            try {
                if (oldAttachFile.exists()) {
                    oldAttachFile.delete();
                }
            } catch (Exception e) {
            }
        }
        if (oldAttachBackupFile != null) {
            try {
                if (oldAttachBackupFile.exists()) {
                    oldAttachBackupFile.delete();
                }
            } catch (Exception e) {
            }
        }

        return resultMap;
    }

    /**
     * 첨부파일 삭제 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> attachmentFileDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;
        TransactionStatus ts = beginTrans();
        try {
            String attachFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.ATTACHMENT.ORDER.LO") //
            );

            resultMap = callProcedure(SP_ID_LO_ATTACH_FILE_NM_UPDATE, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            // String newAttachFileNm = (String)resultMap.get("O_NEW_ATTACH_FILE_NM");
            String oldAttachFileNm = (String)resultMap.get("O_OLD_ATTACH_FILE_NM");
            // 기존 첨부파일이 존재할 경우 삭제
            if (Util.isNotNull(oldAttachFileNm)) {
                File oldAttachFile = new File(attachFilePath, oldAttachFileNm);
                if (oldAttachFile.exists()) {
                    if (!oldAttachFile.delete()) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "기존 첨부 파일을 삭제할 수 없습니다."));
                    }
                }
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return resultMap;
    }

    /**
     * 출고등록 마스터/디테일 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 신규 등록이 아닐 경우 저장 전 출고진행상태 체크
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);

        String PROCESS_CD = (String)params.get(Consts.PK_PROCESS_CD);
        String PROCESS_STATE_FW = (String)params.get(Consts.PK_PROCESS_STATE_FW);
        String PROCESS_STATE_BW = (String)params.get(Consts.PK_PROCESS_STATE_BW);

        if (!Consts.PROCESS_ENTRY_CREATE.equals(PROCESS_CD)) {
            Map<String, Object> checkParams = new HashMap<String, Object>();
            checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            checkParams.put("P_LINE_NO", "");
            checkParams.put(Consts.PK_PROCESS_CD, PROCESS_CD);
            checkParams.put("P_STATE_DIV", "1");

            String CHECK_STATE = "";
            if (Consts.PROCESS_ORDER.equals(PROCESS_CD)) {
                CHECK_STATE = PROCESS_STATE_FW;
                checkParams.put("P_OUTBOUND_DATE", masterRowData.get("P_ORDER_DATE"));
                checkParams.put("P_OUTBOUND_NO", masterRowData.get("P_ORDER_NO"));
            } else {
                CHECK_STATE = PROCESS_STATE_BW;
                checkParams.put("P_OUTBOUND_DATE", masterRowData.get("P_OUTBOUND_DATE"));
                checkParams.put("P_OUTBOUND_NO", masterRowData.get("P_OUTBOUND_NO"));
            }

            String oMsg = canProcessingState(checkParams, CHECK_STATE);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }

        // 저장 처리
        String result = Consts.ERROR;
        Map<String, Object> realtimeMap = null;
        TransactionStatus ts = beginTrans();
        try {
            dao.save(params);

            // 실시간 송신 호출
            if (Consts.PROCESS_ORDER.equals(PROCESS_CD)) {
                // 실시간 송신 호출
                realtimeMap = edCommonService.realtimeSendProcessing();
                String oMsg = Util.getOutMessage(realtimeMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }

            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 실시간 결과 데이터 반영, 자체 트랜잭션 처리 함
        if (realtimeMap != null && Consts.OK.equals(Util.getOutMessage(realtimeMap))) {
            edCommonService.ifResultProcessing(realtimeMap);
        }

        return result;
    }

    /**
     * 출고등록(개별) - 출고예정 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    public String saveOrder(Map<String, Object> params) throws Exception {

        // 진행상태 체크
        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);

        String checkState = Consts.STATE_ORDER;
        Map<String, Object> checkParams = Util.newMap();
        checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
        checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)
        checkParams.put("P_LINE_NO", "");

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);

            checkParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", rowData.get("P_BU_CD"));
            checkParams.put("P_OUTBOUND_DATE", rowData.get("P_ORDER_DATE"));
            checkParams.put("P_OUTBOUND_NO", rowData.get("P_ORDER_NO"));

            String oMsg = canProcessingState(checkParams, checkState);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }

        // 저장 처리
        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveOrder(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 출고확정 저장 처리
     *
     * @param params
     *        수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String saveConfirm(Map<String, Object> params) throws Exception {

        // 저장 전 입고진행상태 체크
        Map<String, Object> checkParams = new HashMap<String, Object>((Map<String, Object>)params.get(Consts.PK_DS_MASTER));
        checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ENTRY);
        checkParams.put("P_STATE_DIV", "1");
        String oMsg = canProcessingState(checkParams, (String)checkParams.get("P_CHECK_STATE"));
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 입고지시 저장
        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveConfirm(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 출고확정 - 유통구분, 직송여부변경
     *
     * @param params
     *        신규, 수정된 데이터
     */
    public String saveConfirmData(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveConfirmData(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 출고확정 - 디테일 저장 처리
     *
     * @param params
     *        수정된 데이터
     */
    public String saveConfirmDetail(Map<String, Object> params) throws Exception {

        // 확정 디테일 저장
        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveDetail(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 배송완료처리 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String saveDelivery(Map<String, Object> params) throws Exception {

        // 저장 전 입고진행상태 체크
        Map<String, Object> checkParams = new HashMap<String, Object>((Map<String, Object>)params.get(Consts.PK_DS_MASTER));
        checkParams.put("P_LINE_NO", "");
        checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ENTRY);
        checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)
        String oMsg = canProcessingState(checkParams, (String)checkParams.get("P_CUR_STATE"));
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveDelivery(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 출고등록(일괄) 저장 처리
     *
     * @param params
     *        수정된 데이터
     */
    public String saveEntryBT(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveEntryBT(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }
}
