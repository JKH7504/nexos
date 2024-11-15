package nexos.service.lo;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.lo.LOB08020Q0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LOB08020Q0Service<br>
 * Description: 운송장조회(LOB08020Q0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2019-02-20    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class LOB08020Q0Service extends ServiceSupport {

    final String          SP_ID_GET_LO_OUTBOUND_STATE = "WF.GET_LO_OUTBOUND_STATE";

    @Autowired
    private LOB08020Q0DAO dao;

    /**
     * 출고스캔검수-송장 출력 횟수 업데이트 처리
     *
     * @param params
     */
    public Map<String, Object> callSetWbNoPrintCntUpdate(Map<String, Object> params) throws Exception {

        Map<String, Object> result;

        TransactionStatus ts = beginTrans();
        try {
            result = dao.callSetWbNoPrintCntUpdate(params);
            String oMsg = Util.getOutMessage(result);
            // 오류면 Rollback
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 저장/삭제시 상태를 체크해서 "30"이 아닐경우 저장/삭제 불가
     *
     * @param params
     * @param checkState
     * @return
     */
    public String canProcessingdState(Map<String, Object> params, String checkState) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_LO_OUTBOUND_STATE, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (Consts.OK.equals(oMsg)) {
            String oOutboundState = (String)resultMap.get("O_OUTBOUND_STATE");
            if (!checkState.equals(oOutboundState)) {
                result = NexosMessage.getDisplayMsg("JAVA.STATE.001", "[진행상태 : " + oOutboundState + "] 처리할 수 있는 상태가 아닙니다.",
                    new String[] {oOutboundState});
            } else {
                result = oMsg;
            }
        } else {
            result = oMsg;
        }
        return result;
    }
}