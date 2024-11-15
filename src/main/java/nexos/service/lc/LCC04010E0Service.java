package nexos.service.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.lc.LCC04010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LCC04010E0Service<br>
 * Description: 재고실사(LCC04010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LCC04010E0Service extends ServiceSupport {

    final String          SP_ID_GET_LC_CONFIRM_YN         = "WF.GET_LC_CONFIRM_YN";
    final String          SP_ID_LC_FW_INVEST_CONFIRM      = "LC_FW_INVEST_CONFIRM";
    final String          SP_ID_LC_BW_INVEST_CONFIRM      = "LC_BW_INVEST_CONFIRM";
    final String          SP_ID_LC_FW_INVEST_APPLY_RESULT = "LC_FW_INVEST_APPLY_RESULT";
    final String          SP_ID_WCSRFID_SEND_FW_LC_INVEST = "WCSRFID.SEND_FW_LC_INVEST";
    final String          SP_ID_WCSRFID_SEND_BW_LC_INVEST = "WCSRFID.SEND_BW_LC_INVEST";

    @Autowired
    private LCC04010E0DAO dao;

    /**
     * 재고실사 화면 저장 처리
     * 
     * @param params
     *        신규, 수정된 데이터
     */
    public String saveEntry(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveEntry(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 재고실사 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
        final String TABLE_DIV = "C";

        // 신규 등록이 아닐 경우 저장 전 입고진행상태 체크
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        String processCd = (String)params.get(Consts.PK_PROCESS_CD);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String policyEM191 = (String)masterRowData.get("P_POLICY_EM191");

        if (!Consts.PROCESS_ENTRY_CREATE.equals(processCd)) {
            Map<String, Object> checkParams = new HashMap<String, Object>();
            checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            checkParams.put("P_ETC_DATE", masterRowData.get("P_INVEST_DATE"));
            checkParams.put("P_ETC_NO", masterRowData.get("P_INVEST_NO"));
            checkParams.put("P_TABLE_DIV", TABLE_DIV);

            String oMsg = getConfirmYn(checkParams);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }

        // 저장 처리
        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.save(params);
            // [RFID]시스템연동 정책 - 1.연동함
            if ("1".equals(policyEM191) && Consts.PROCESS_ENTRY_CREATE.equals(processCd)) {
                Map<String, Object> rfidParams = new HashMap<String, Object>();
                rfidParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
                rfidParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
                rfidParams.put("P_INVEST_DATE", masterRowData.get("P_INVEST_DATE"));
                rfidParams.put("P_INVEST_NO", params.get("O_INVEST_NO"));
                rfidParams.put("P_USER_ID", userId);
                Map<String, Object> resultMap = callProcedure(SP_ID_WCSRFID_SEND_FW_LC_INVEST, rfidParams);
                String oMsg = Util.getOutMessage(resultMap);
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
        return result;
    }

    /**
     * 재고실사 삭제 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String delete(Map<String, Object> params) throws Exception {

        // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
        final String TABLE_DIV = "C";

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        Map<String, Object> masterRowData = dsMaster.get(0);
        Map<String, Object> checkParams = new HashMap<String, Object>();
        checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
        checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
        checkParams.put("P_ETC_DATE", masterRowData.get("P_INVEST_DATE"));
        checkParams.put("P_ETC_NO", masterRowData.get("P_INVEST_NO"));
        checkParams.put("P_TABLE_DIV", TABLE_DIV);

        String oMsg = getConfirmYn(checkParams);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        String userId = (String)params.get(Consts.PK_USER_ID);
        String policyEM191 = (String)masterRowData.get("P_POLICY_EM191");

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            if ("1".equals(policyEM191)) {
                Map<String, Object> rfidParams = new HashMap<String, Object>();
                rfidParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
                rfidParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
                rfidParams.put("P_INVEST_DATE", masterRowData.get("P_INVEST_DATE"));
                rfidParams.put("P_INVEST_NO", masterRowData.get("P_INVEST_NO"));
                rfidParams.put("P_USER_ID", userId);
                Map<String, Object> resultMap = callProcedure(SP_ID_WCSRFID_SEND_BW_LC_INVEST, rfidParams);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }

            dao.delete(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 저장/삭제시 확정된 전표일 우 저장/삭제 불가
     *
     * @param params
     * @param checkState
     * @return
     */
    public String getConfirmYn(Map<String, Object> params) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_LC_CONFIRM_YN, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            result = oMsg;
        } else {
            String oConfirmYn = (String)resultMap.get("O_CONFIRM_YN");
            if (Consts.YES.equals(oConfirmYn)) {
                result = NexosMessage.getDisplayMsg("JAVA.LCC.001", "이미 확정 처리된 데이터입니다.");
            } else {
                result = oMsg;
            }
        }
        return result;
    }

    /**
     * 재고실사 재고반영 SP 실행 후 처리 결과를 Map 형태로 Return
     */
    public Map<String, Object> callLcFwInvestReplectConfirm(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LC_FW_INVEST_APPLY_RESULT, params);

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
     * 재고실사 확정취소 SP 실행 후 처리 결과를 Map 형태로 Return
     */
    public Map<String, Object> callLcInvestConfirm(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        String queryId;
        if (Consts.DIRECTION_FW.equals(params.get(Consts.PK_DIRECTION))) {
            queryId = SP_ID_LC_FW_INVEST_CONFIRM;
        } else {
            queryId = SP_ID_LC_BW_INVEST_CONFIRM;
        }

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(queryId, params);

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

}
