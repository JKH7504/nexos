package nexos.service.lc;

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
 * Class: LCC05010E0Service<br>
 * Description: 재고속성 관리(LCC05010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LCC05010E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(LCC05010E0Service.class);

    final String SP_ID_LS_010NM_PROPERTIES_UPDATE = "LS_010NM_PROPERTIES_UPDATE";
    final String SP_ID_LS_010NM_PROPERTIES_SPLIT  = "LS_010NM_PROPERTIES_SPLIT";

    /**
     * 재고속성변경처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public String callPorpertiesUpdate(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        // 브랜드 단위 Transaction
        int dsMasterCount = dsMaster.size();
        StringBuffer sbResult = new StringBuffer();
        String oMsg;

        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int i = 0; i < dsMasterCount; i++) {

            // SP 호출 파라메터
            Map<String, Object> callParams = dsMaster.get(i);

            // LS_010NM_PROPERTIES_UPDATE 호출
            TransactionStatus ts = beginTrans(td);
            try {
                callParams.put(Consts.PK_USER_ID, userId);
                Map<String, Object> resultMap = callProcedure(SP_ID_LS_010NM_PROPERTIES_UPDATE, callParams);
                oMsg = Util.getOutMessage(resultMap);
                // 오류면 Rollback
                if (!Consts.OK.equals(oMsg)) {
                    rollbackTrans(ts);
                    sbResult.append(oMsg);
                    sbResult.append("\r\n");
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
     * 재고분할 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public String callPorpertiesSplit(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        // 브랜드 단위 Transaction
        int dsMasterCount = dsMaster.size();
        StringBuffer sbResult = new StringBuffer();
        String oMsg;

        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int i = 0; i < dsMasterCount; i++) {

            // SP 호출 파라메터
            Map<String, Object> callParams = dsMaster.get(i);

            // LS_010NM_PROPERTIES_UPDATE 호출
            TransactionStatus ts = beginTrans(td);
            try {
                callParams.put(Consts.PK_USER_ID, userId);
                Map<String, Object> resultMap = callProcedure(SP_ID_LS_010NM_PROPERTIES_SPLIT, callParams);
                oMsg = Util.getOutMessage(resultMap);
                // 오류면 Rollback
                if (!Consts.OK.equals(oMsg)) {
                    rollbackTrans(ts);
                    sbResult.append(oMsg);
                    sbResult.append("\r\n");
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
