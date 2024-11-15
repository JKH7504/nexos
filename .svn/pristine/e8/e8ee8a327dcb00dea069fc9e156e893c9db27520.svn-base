package nexos.service.lo;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LOB01030Q0Service<br>
 * Description: 출고예정내역(LOB01030Q0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LOB01030Q0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(LOB01030Q0Service.class);

    final String SP_ID_LC_FW_BU_CHANGE_ORDER = "LC_FW_BU_CHANGE_ORDER";

    /**
     * 미출예상상품 사업부이관 SP 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callLcFwBuChangeOrder(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LC_FW_BU_CHANGE_ORDER, params);
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