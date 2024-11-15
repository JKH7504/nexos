package nexos.service.ro;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.ro.ROC01010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ServiceSupport;

/**
 * Class: ROC01010E0Service<br>
 * Description: 반출예정작업(ROC01010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class ROC01010E0Service extends ServiceSupport {

    final String          SP_ID_GET_RO_OUTBOUND_STATE = "WF.GET_RO_OUTBOUND_STATE";
    final String          SP_ID_RO_ORDER_CLOSING      = "RO_ORDER_CLOSING";
    final String          SP_ID_RO_ORDER_DELETE       = "RO_ORDER_DELETE";

    @Autowired
    private ROC01010E0DAO dao;

    /**
     * 반출예정작업 팝업 화면 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 신규 등록이 아닐 경우 저장 전 출고진행상태 체크
        Map<String, Object> dsMaster = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        String processCd = (String)params.get(Consts.PK_PROCESS_CD);

        if (!Consts.PROCESS_ORDER_CREATE.equals(processCd)) {
            String checkState;
            Map<String, Object> checkParams = new HashMap<String, Object>();
            checkParams.put("P_CENTER_CD", dsMaster.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", dsMaster.get("P_BU_CD"));
            checkParams.put("P_OUTBOUND_DATE", dsMaster.get("P_ORDER_DATE"));
            checkParams.put("P_OUTBOUND_NO", dsMaster.get("P_ORDER_NO"));
            checkParams.put("P_LINE_NO", "");
            checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
            checkParams.put("P_STATE_DIV", "1");

            checkState = Consts.STATE_ORDER;

            String oMsg = canProcessingdState(checkParams, checkState);
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
     * 저장/삭제시 상태를 체크해서 "10"이 아닐경우 저장/삭제 불가
     *
     * @param params
     * @param checkState
     * @return
     */
    public String canProcessingdState(Map<String, Object> params, String checkState) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_RO_OUTBOUND_STATE, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (Consts.OK.equals(oMsg)) {
            result = oMsg;
        } else {
            String oOutboundState = (String)resultMap.get("O_OUTBOUND_STATE");
            if (!checkState.equals(oOutboundState)) {
                result = NexosMessage.getDisplayMsg("JAVA.STATE.001", "[진행상태 : " + oOutboundState + "] 처리할 수 있는 상태가 아닙니다.",
                    new String[] {oOutboundState});
            }
        }
        return result;
    }

    /**
     * 반출예정 종결 처리
     *
     * @param params
     */
    public Map<String, Object> callROOrderClosing(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_RO_ORDER_CLOSING, params);

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
     * 반출예정 삭제 처리
     *
     * @param params
     */
    public Map<String, Object> callROOrderDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_RO_ORDER_DELETE, params);

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
