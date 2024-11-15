package nexos.service.li;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.li.LIC05010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LIC05010E0Service<br>
 * Description: 입고파렛트재분할(LIC05010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LIC05010E0Service extends ServiceSupport {

    final String          SP_ID_LI_FW_SPLIT_PALLET = "LI_FW_SPLIT_PALLET";

    @Autowired
    private LIC05010E0DAO dao;

    /**
     * 입고파렛트재분할 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    public String save(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.save(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 자동분할 버튼 클릭시
     * SP 실행 후 처리 결과를 Map 형태로 Return
     */
    public Map<String, Object> callSplitPallet(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LI_FW_SPLIT_PALLET, params);

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