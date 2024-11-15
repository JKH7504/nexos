package nexos.service.lo;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LOM08010E0Service<br>
 * Description: 운송장관리(LOB08010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LOM08010E0Service extends ServiceSupport {

    final String SP_ID_CREATE_MANUAL_WB = "WB.CREATE_MANUAL_WB";
    final String SP_ID_DELETE_MANUAL_WB = "WB.DELETE_MANUAL_WB";

    /**
     * 운송장생성 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public String callCreateManualWb(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        StringBuffer sbResult = new StringBuffer();
        Map<String, Object> callParams;
        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int i = 0; i < dsCnt; i++) {
            // SP 호출 파라메터
            callParams = dsSave.get(i);
            callParams.put(Consts.PK_USER_ID, userId);

            TransactionStatus ts = beginTrans(td);
            try {
                Map<String, Object> resultMap = callProcedure(SP_ID_CREATE_MANUAL_WB, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                // 오류면 Rollback
                if (!Consts.OK.equals(oMsg)) {
                    rollbackTrans(ts);
                    sbResult.append(oMsg);
                    sbResult.append(Consts.CRLF);
                    continue;
                }

                commitTrans(ts);
            } catch (Exception e) {
                // SP 내에서 오류가 아니면 Exit
                rollbackTrans(ts);
                throw new RuntimeException(Util.getErrorMessage(e));
            }
        }

        if (sbResult.length() == 0) {
            sbResult.append(Consts.OK);
        }
        return sbResult.toString();
    }

    /**
     * 운송장삭제 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public String callDeleteManualWb(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        StringBuffer sbResult = new StringBuffer();
        Map<String, Object> callParams;
        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int i = 0; i < dsCnt; i++) {
            // SP 호출 파라메터
            callParams = dsSave.get(i);
            callParams.put(Consts.PK_USER_ID, userId);

            TransactionStatus ts = beginTrans(td);
            try {
                Map<String, Object> resultMap = callProcedure(SP_ID_DELETE_MANUAL_WB, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                // 오류면 Rollback
                if (!Consts.OK.equals(oMsg)) {
                    rollbackTrans(ts);
                    sbResult.append(oMsg);
                    sbResult.append(Consts.CRLF);
                    continue;
                }

                commitTrans(ts);
            } catch (Exception e) {
                // SP 내에서 오류가 아니면 Exit
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