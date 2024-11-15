package nexos.service.lo;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LOB01040E0Service<br>
 * Description: 출고예정병합(LOB01040E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-03-15    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class LOB01040E0Service extends ServiceSupport {

    final String SP_ID_LO_ORDER_MERGE        = "LO_ORDER_MERGE";
    final String SP_ID_LO_ORDER_MERGE_CANCEL = "LO_ORDER_MERGE_CANCEL";

    /**
     * 출고예정 병합 처리
     * 
     * @param params
     */
    public Map<String, Object> callLOOrderMerge(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_ORDER_MERGE, params);

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
     * 출고예정 병합취소 처리
     * 
     * @param params
     */
    public Map<String, Object> callLOOrderMergeCancel(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_ORDER_MERGE_CANCEL, params);

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
