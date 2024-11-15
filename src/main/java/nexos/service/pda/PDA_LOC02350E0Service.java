package nexos.service.pda;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: PDA_LOC02350E0Service<br>
 * Description: PDA 수동DAS작업 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class PDA_LOC02350E0Service extends ServiceSupport {

    final String PROGRAM_ID                      = "PDA_LOC02350E0";

    final String SP_ID_LO_PROC_DISTRIBUTE_CANCEL = PROGRAM_ID + ".LO_PROC_DISTRIBUTE_CANCEL"; // [출고]수동DAS작업 - 분배취소 처리
    final String SP_ID_LO_PROC_DISTRIBUTE        = PROGRAM_ID + ".LO_PROC_DISTRIBUTE";        // [출고]수동DAS작업 - 분배 처리

    /**
     * [출고]수동DAS작업 - 분배취소 처리
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
     * [출고]수동DAS작업 - 분배 처리
     * 
     * @param params
     */
    public Map<String, Object> callLOProcDistribute(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_PROC_DISTRIBUTE, params);
            String oMsg = Util.getOutMessage(resultMap);
            // 오류면 Rollback
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