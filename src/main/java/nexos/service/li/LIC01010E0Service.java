package nexos.service.li;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.li.LIC01010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LIC01010E0 Service<br>
 * Description: 입고예정작업(LIC01010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LIC01010E0Service extends ServiceSupport {

    final String          SP_ID_GET_LI_INBOUND_STATE = "WF.GET_LI_INBOUND_STATE";
    final String          SP_ID_LI_ORDER_CLOSING     = "LI_ORDER_CLOSING";
    final String          SP_ID_LI_ORDER_DELETE      = "LI_ORDER_DELETE";

    @Autowired
    private LIC01010E0DAO dao;

    /**
     * 저장/삭제시 상태를 체크해서 "10"이 아닐경우 저장/삭제 불가
     *
     * @param params
     * @param checkState
     * @return
     */
    public String canProcessingdState(Map<String, Object> params, String checkState) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_LI_INBOUND_STATE, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (Consts.OK.equals(oMsg)) {
            String oInboundState = (String)resultMap.get("O_INBOUND_STATE");
            if (!checkState.equals(oInboundState)) {
                result = NexosMessage.getDisplayMsg("JAVA.STATE.001", "[진행상태 : " + oInboundState + "] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오.",
                    new String[] {oInboundState});
            } else {
                result = oMsg;
            }
        } else {
            result = oMsg;
        }
        return result;
    }

    /**
     * 입고예정작업 QC상태전환 처리
     *
     * @param params
     *        체크된 데이터
     */
    @SuppressWarnings("unchecked")
    public String changeItemStateToQCState(Map<String, Object> params) throws Exception {

        // 신규 등록이 아닐 경우 저장 전 입고진행상태 체크
        Map<String, Object> dsMaster = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);

        Map<String, Object> checkParams = new HashMap<String, Object>();
        checkParams.put("P_CENTER_CD", dsMaster.get("P_CENTER_CD"));
        checkParams.put("P_BU_CD", dsMaster.get("P_BU_CD"));
        checkParams.put("P_INBOUND_DATE", dsMaster.get("P_ORDER_DATE"));
        checkParams.put("P_INBOUND_NO", dsMaster.get("P_ORDER_NO"));
        checkParams.put("P_LINE_NO", "");
        checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
        checkParams.put("P_STATE_DIV", "1");

        String oMsg = canProcessingdState(checkParams, Consts.STATE_ORDER);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 저장 처리
        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.changeItemStateToQCState(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 입고예정작업 화면 저장 처리
     *
     * @param params
     *        수정된 데이터
     */
    public String saveOrder(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveDetail(params);
            dao.saveMaster(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 입고예정작업 팝업 화면 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 신규 등록이 아닐 경우 저장 전 입고진행상태 체크
        Map<String, Object> dsMaster = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        String processCd = (String)params.get(Consts.PK_PROCESS_CD);

        if (!Consts.PROCESS_ORDER_CREATE.equals(processCd)) {
            Map<String, Object> checkParams = new HashMap<String, Object>();
            checkParams.put("P_CENTER_CD", dsMaster.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", dsMaster.get("P_BU_CD"));
            checkParams.put("P_INBOUND_DATE", dsMaster.get("P_ORDER_DATE"));
            checkParams.put("P_INBOUND_NO", dsMaster.get("P_ORDER_NO"));
            checkParams.put("P_LINE_NO", "");
            checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
            checkParams.put("P_STATE_DIV", "1");

            String oMsg = canProcessingdState(checkParams, Consts.STATE_ORDER);
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
     * 입고예정 종결 처리
     *
     * @param params
     */
    public Map<String, Object> callLIOrderClosing(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LI_ORDER_CLOSING, params);

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
     * 입고예정 삭제 처리
     *
     * @param params
     */
    public Map<String, Object> callLIOrderDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LI_ORDER_DELETE, params);

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
