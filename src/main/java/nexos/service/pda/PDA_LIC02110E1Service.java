package nexos.service.pda;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.pda.PDA_LIC02110E1DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: PDA_LIC02110E1Service<br>
 * Description: PDA 입고처리 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class PDA_LIC02110E1Service extends ServiceSupport {

    @Autowired
    private PDA_LIC02110E1DAO dao;

    /**
     * [입고]입고예정내역서 - 예정~확정 처리
     * 
     * @param params
     */
    public Map<String, Object> callLIProcDirect(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = dao.callLIProcDirect(params);
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