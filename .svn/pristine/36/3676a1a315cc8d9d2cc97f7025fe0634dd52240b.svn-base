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
 * Class: LOM04050E0Service<br>
 * Description: 온라인출고 수동DAS출고(LOM04050E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LOM04050E0Service extends ServiceSupport {

    final String SP_ID_LO_DISTRIBUTE_QTY_UPDATE        = "LO_DISTRIBUTE_QTY_UPDATE";   // 분배수량 업데이트
    final String SP_ID_LO_PROC_DISTRIBUTE_CANCEL       = "LO_DISTRIBUTE_CANCEL";       // 상품 분배취소 처리
    final String SP_ID_LO_PROC_DISTRIBUTE_CANCEL_BATCH = "LO_DISTRIBUTE_CANCEL_BATCH"; // 차수 분배취소 처리
    final String SP_ID_LO_PROC_DISTRIBUTE_REBATCH      = "LO_DISTRIBUTE_REBATCH";      // 결품차수 UPDATE

    public Map<String, Object> callLODistributeQtyUpdate(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_DISTRIBUTE_QTY_UPDATE, params);
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

    @SuppressWarnings("unchecked")
    public String callLODistributeQtyUpdateBT(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        // LO_DISTRIBUTE_QTY_UPDATE 호출
        // 1건 단위 Transaction
        StringBuffer sbResult = new StringBuffer();
        TransactionDefinition td = new DefaultTransactionDefinition();
        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            // SP 호출 파라메터
            Map<String, Object> callParams = dsMaster.get(rIndex);
            callParams.put(Consts.PK_USER_ID, USER_ID);

            TransactionStatus ts = beginTrans(td);
            try {
                Map<String, Object> resultMap = callProcedure(SP_ID_LO_DISTRIBUTE_QTY_UPDATE, callParams);
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

    /**
     * [출고]수동DAS작업 - 상품 분배취소 처리
     * 
     * @param params
     */
    public Map<String, Object> callLOProcDistributeCancel(Map<String, Object> params) throws Exception {

        Map<String, Object> result;
        TransactionStatus ts = beginTrans();
        try {
            result = callProcedure(SP_ID_LO_PROC_DISTRIBUTE_CANCEL, params);
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
     * [출고]수동DAS작업 - 차수 분배취소 처리
     * 
     * @param params
     */
    public Map<String, Object> callLOProcDistributeCancelBatch(Map<String, Object> params) throws Exception {

        Map<String, Object> result;
        TransactionStatus ts = beginTrans();
        try {
            result = callProcedure(SP_ID_LO_PROC_DISTRIBUTE_CANCEL_BATCH, params);
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
     * [출고]수동DAS작업 - 결품 전표를 결픔차수로 UPDATE
     * 
     * @param params
     */
    public Map<String, Object> callLOProcDistributeReBatch(Map<String, Object> params) throws Exception {

        Map<String, Object> result;
        TransactionStatus ts = beginTrans();
        try {
            result = callProcedure(SP_ID_LO_PROC_DISTRIBUTE_REBATCH, params);
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
}