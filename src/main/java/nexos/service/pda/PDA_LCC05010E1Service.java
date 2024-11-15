package nexos.service.pda;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.pda.PDA_LCC05010E1DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: PDA_LCC05010E1Service<br>
 * Description: PDA 매장실사 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class PDA_LCC05010E1Service extends ServiceSupport {

    @Autowired
    private PDA_LCC05010E1DAO dao;

    /**
     * [센터운영]매장실사 - 매장실사 처리
     * 
     * @param params
     */
    public Map<String, Object> callLCProcDeliveryInvest(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = dao.callLCProcDeliveryInvest(params);
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