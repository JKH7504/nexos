package nexos.service.ro;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import nexos.dao.ro.ROC02010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ServiceSupport;
import nexos.service.ed.common.EDCommonService;

/**
 * Class: ROC02010E0Service<br>
 * Description: 반출작업(ROC02010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class ROC02010E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(ROC02010E0Service.class);

    final String            SP_ID_GET_RO_OUTBOUND_STATE  = "WF.GET_RO_OUTBOUND_STATE";
    final String            SP_ID_RO_PROCESSING          = "RO_PROCESSING";
    final String            SP_ID_RO_FW_ENTRY_PROCESSING = "RO_FW_ENTRY_PROCESSING";

    @Autowired
    private ROC02010E0DAO   dao;

    @Autowired
    private EDCommonService edCommonService;

    public String canProcessingState(Map<String, Object> params, String checkState) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_RO_OUTBOUND_STATE, params);
        String oMsg = Util.getOutMessage(resultMap);
        if (Consts.OK.equals(oMsg)) {
            String oOutboundState = (String)resultMap.get("O_OUTBOUND_STATE");
            if (!Util.nullToEmpty(checkState).equals(oOutboundState)) {
                result = NexosMessage.getDisplayMsg("JAVA.STATE.002", "[전표번호 : " + (String)resultMap.get("P_OUTBOUND_NO") //
                    + ", 진행상태 : " + oOutboundState + "] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오."//
                    , new String[] {(String)resultMap.get("P_OUTBOUND_NO"), oOutboundState});
            }
        } else {
            result = oMsg;
        }

        return result;
    }

    /**
     * 반출등록 마스터/디테일 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 신규 등록이 아닐 경우 저장 전 반출진행상태 체크
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);

        String PROCESS_CD = (String)params.get(Consts.PK_PROCESS_CD);
        String PROCESS_STATE_FW = (String)params.get(Consts.PK_PROCESS_STATE_FW);
        String PROCESS_STATE_BW = (String)params.get(Consts.PK_PROCESS_STATE_BW);

        String oMsg = "";
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

            oMsg = canProcessingState(checkParams, CHECK_STATE);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }

        // 저장 처리
        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.save(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 반출확정 저장 처리
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

        // 반출지시 저장
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
     * RO_PROCESSING 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public String callROProcessing(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

        String PROCESS_CD = (String)params.get(Consts.PK_PROCESS_CD);
        String DIRECTION = (String)params.get(Consts.PK_DIRECTION);
        String PROCESS_STATE_FW = (String)params.get(Consts.PK_PROCESS_STATE_FW);
        String PROCESS_STATE_BW = (String)params.get(Consts.PK_PROCESS_STATE_BW);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        // 처리할 수 있는 진행상태
        String CHECK_STATE = "";
        // 처리
        if (Consts.DIRECTION_FW.equals(DIRECTION)) {
            CHECK_STATE = PROCESS_STATE_FW;
        }
        // 취소
        else {
            CHECK_STATE = PROCESS_STATE_BW;
        }

        Map<String, Object> checkParams = new HashMap<String, Object>();
        checkParams.put("P_LINE_NO", ""); // 전표단위
        checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ENTRY);// 진행상태체크 프로세스코드([A]예정, [B]등록)
        checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

        // RO_PROCESSING 호출
        // 전표 단위 Transaction
        StringBuffer sbResult = new StringBuffer();
        Map<String, Object> realtimeMap = null;
        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {

            // SP 호출 파라메터
            Map<String, Object> callParams = dsMaster.get(rIndex);
            callParams.put(Consts.PK_PROCESS_CD, PROCESS_CD);
            callParams.put(Consts.PK_DIRECTION, DIRECTION);
            callParams.put(Consts.PK_USER_ID, USER_ID);
            String outbound_No = (String)callParams.get("P_OUTBOUND_NO");

            // 진행상태 체크
            checkParams.put("P_CENTER_CD", callParams.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", callParams.get("P_BU_CD"));
            checkParams.put("P_OUTBOUND_DATE", callParams.get("P_OUTBOUND_DATE"));
            checkParams.put("P_OUTBOUND_NO", outbound_No);
            String oMsg = canProcessingState(checkParams, CHECK_STATE);
            if (!Consts.OK.equals(oMsg)) {
                sbResult.append(oMsg).append(Consts.CRLF);
                continue;
            }

            // RO_PROCESSING 호출
            realtimeMap = null;
            TransactionStatus ts = beginTrans(td);
            try {
                Map<String, Object> resultMap = callProcedure(SP_ID_RO_PROCESSING, callParams);
                oMsg = Util.getOutMessage(resultMap);
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
     * RO_FW_ENTRY_PROCESSING 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public String callROEntryProcessing(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

        String PROCESS_CD = (String)params.get(Consts.PK_PROCESS_CD);
        String DIRECTION = (String)params.get(Consts.PK_DIRECTION);
        String PROCESS_STATE_FW = (String)params.get(Consts.PK_PROCESS_STATE_FW);
        // String PROCESS_STATE_BW = (String)params.get(Consts.PK_PROCESS_STATE_BW);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        // 처리
        if (!Consts.DIRECTION_FW.equals(DIRECTION) && !Consts.PROCESS_ENTRY.equals(PROCESS_CD)) {
            return NexosMessage.getDisplayMsg("JAVA.STATE.003", "[프로세스, 진행방향 : " + PROCESS_CD + ", " + DIRECTION + "] 처리할 수 있는 프로세스가 아닙니다.",
                new String[] {PROCESS_CD, DIRECTION});
        }

        Map<String, Object> checkParams = new HashMap<String, Object>();
        checkParams.put("P_LINE_NO", ""); // 전표단위
        checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
        checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

        // RO_PROCESSING 호출
        // 전표 단위 Transaction
        StringBuffer sbResult = new StringBuffer();
        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {

            // SP 호출 파라메터
            Map<String, Object> callParams = dsMaster.get(rIndex);
            callParams.put(Consts.PK_PROCESS_CD, PROCESS_CD);
            callParams.put(Consts.PK_DIRECTION, DIRECTION);
            callParams.put(Consts.PK_USER_ID, USER_ID);

            // 진행상태 체크
            checkParams.put("P_CENTER_CD", callParams.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", callParams.get("P_BU_CD"));
            checkParams.put("P_OUTBOUND_DATE", callParams.get("P_ORDER_DATE"));
            checkParams.put("P_OUTBOUND_NO", callParams.get("P_ORDER_NO"));
            String oMsg = canProcessingState(checkParams, PROCESS_STATE_FW);
            if (!Consts.OK.equals(oMsg)) {
                continue;
            }

            // RO_FW_ENTRY_PROCESSING 호출
            TransactionStatus ts = beginTrans(td);
            try {
                Map<String, Object> resultMap = callProcedure(SP_ID_RO_FW_ENTRY_PROCESSING, callParams);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    rollbackTrans(ts);
                    sbResult.append(oMsg).append(Consts.CRLF);
                    continue;
                }

                // 리턴된 입고일자, 입고번호로 필요시 추가 처리
                // String oInbound_Date = (String)resultMap.get("O_OUTBOUND_DATE");
                // String oInbound_No = (String)resultMap.get("O_OUTBOUND_NO");
                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                throw new RuntimeException(Util.getErrorMessage(e));
            }
        }

        if (sbResult.length() == 0) {
            sbResult.append(Consts.OK);
        }

        return sbResult.toString();
    }
}
