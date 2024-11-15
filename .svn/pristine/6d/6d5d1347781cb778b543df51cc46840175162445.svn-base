package nexos.service.li;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LIC06020E0 Service<br>
 * Description: 입고예정 물류센터변경(LIC06020E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2018-06-20    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class LIC06020E0Service extends ServiceSupport {

    final String SP_ID_LI_CHANGE_CENTER_CD = "LI_CHANGE_CENTER_CD";

    /**
     * 물류센터변경 처리
     * 
     * @param params
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> callLIChangeCenterCd(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);
        int dsCnt = dsMaster.size();

        TransactionStatus ts = beginTrans();
        Map<String, Object> resultMap = null;
        try {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsMaster.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                resultMap = callProcedure(SP_ID_LI_CHANGE_CENTER_CD, rowData);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }
}
