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
 * Class: LOM07050E0Service<br>
 * Description: 운송장수동관리(LOM07050E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LOM07050E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(LOM07050E0Service.class);

    final String SP_ID_LO_WB_NO_MANUAL_UPDATE = "LO_WB_NO_MANUAL_UPDATE";

    /**
     * LO_WB_NO_MANUAL_UPDATE 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public String callLOWBNoManualUpdate(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        // LO_WB_NO_MANUAL_UPDATE 호출
        // 전표 단위 Transaction
        Map<String, Object> callParams;
        StringBuffer sbResult = new StringBuffer();
        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {

            // SP 호출 파라메터
            callParams = dsMaster.get(rIndex);
            callParams.put(Consts.PK_USER_ID, USER_ID);

            TransactionStatus ts = beginTrans(td);
            try {
                Map<String, Object> resultMap = callProcedure(SP_ID_LO_WB_NO_MANUAL_UPDATE, callParams);
                String oMsg = Util.getOutMessage(resultMap);

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
        }

        if (sbResult.length() == 0) {
            sbResult.append(Consts.OK);
        }

        return sbResult.toString();
    }

}