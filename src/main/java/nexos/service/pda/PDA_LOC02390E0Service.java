package nexos.service.pda;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: PDA_LOC02390E0Service<br>
 * Description: PDA 적재파렛트매핑 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class PDA_LOC02390E0Service extends ServiceSupport {

    final String PROGRAM_ID           = "PDA_LOC02390E0";

    final String SP_ID_LO_SHIP_WORK   = PROGRAM_ID + ".LO_SHIP_WORK";   // [출고] 적재파렛트 매핑정보 UPDATE 처리
    final String SP_ID_LO_SHIP_DELETE = PROGRAM_ID + ".LO_SHIP_DELETE"; // [출고] 적재파렛트 매핑정보 NULL 처리

    /**
     * [출고]적재파렛트매핑 - 적재파렛트 매핑 처리
     *
     * @param params
     */
    public Map<String, Object> callLOShipWork(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_SHIP_WORK, params);
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

    /**
     * [출고]적재파렛트매핑 - 적재파렛트 매핑 삭제 처리
     *
     * @param params
     */
    public Map<String, Object> callLOShipDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_SHIP_DELETE, params);
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