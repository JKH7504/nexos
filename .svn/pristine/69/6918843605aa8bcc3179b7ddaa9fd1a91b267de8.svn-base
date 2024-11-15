package nexos.service.lo;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.lo.LOB05020E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LOB05020E0Service<br>
 * Description: 출고중량처리(LOB05020E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LOB05020E0Service extends ServiceSupport {

    final String          SP_ID_GET_LO_OUTBOUND_STATE = "WF.GET_LO_OUTBOUND_STATE";

    @Autowired
    private LOB05020E0DAO dao;

    /**
     * 출고중량처리 저장 처리
     * 
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        Map<String, Object> checkParams = new HashMap<String, Object>((Map<String, Object>)params.get(Consts.PK_DS_MASTER));
        checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ENTRY);
        checkParams.put("P_STATE_DIV", "1");
        String checkState = (String)checkParams.get("P_CHECK_STATE");
        String oMsg = canProcessingState(checkParams, checkState);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }
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
            if (!checkState.equals(oOutboundState)) {
                result = NexosMessage.getDisplayMsg("JAVA.STATE.001", "[진행상태 : " + oOutboundState //
                    + "] 가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.", new String[] {oOutboundState});
            } else {
                result = oMsg;
            }
        } else {
            result = oMsg;
        }
        return result;
    }

}