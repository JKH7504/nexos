package nexos.service.lo;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LOB04030E0Service<br>
 * Description: 배분등록(LOB04030E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LOB04030E0Service extends ServiceSupport {

    final String SP_ID_LO_POLICY_ASSIGN_ADJUSTMENT = "LO_POLICY_ASSIGN_ADJUSTMENT";

    /**
     * SP 실행 후 처리 결과를 Map 형태로 Return
     */
    @SuppressWarnings("unchecked")
    public String callPolicyAssignAdjustment(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        // 전표 단위 Transaction
        int dsCnt = dsSave.size();
        StringBuffer sbResult = new StringBuffer();
        for (int i = 0; i < dsCnt; i++) {

            // SP 호출 파라메터
            Map<String, Object> callParams = dsSave.get(i);
            callParams.put(Consts.PK_USER_ID, userId);

            TransactionStatus ts = beginTrans();
            try {
                Map<String, Object> resultMap = callProcedure(SP_ID_LO_POLICY_ASSIGN_ADJUSTMENT, callParams);

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