package nexos.service.lo;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.lo.LOB09010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LOB09010E0Service<br>
 * Description: 거래명세서회수(LOB09010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-04-26    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class LOB09010E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(LOB09010E0Service.class);

    final String          SP_ID_CHK_LO_PROCESS_STATE = "WF.CHK_LO_PROCESS_STATE";

    @Autowired
    private LOB09010E0DAO dao;

    /**
     * 거래명세서회수 저장 처리
     * 
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 진행상태 체크
        Map<String, Object> checkParams = (Map<String, Object>)params.get(Consts.PK_MASTER_PARAMS);
        String checkState = (String)checkParams.get("P_OUTBOUND_STATE");
        checkParams.put("P_PROCESS_STATE", checkState);
        String oMsg = canProcessingState(checkParams, checkState);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

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
     * 처리 가능 진행상태 체크
     * 
     * @param params
     * @param checkState
     * @return
     */
    public String canProcessingState(Map<String, Object> params, String checkState) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_CHK_LO_PROCESS_STATE, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        result = oMsg;

        return result;
    }

}