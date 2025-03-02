package nexos.service.cm;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.cm.CMC05040E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CMC05040E0Service<br>
 * Description: 고정로케이션 관리(CMC05040E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2017-09-06    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class CMC05040E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(CMC05040E0Service.class);

    final String          SP_ID_CM_LOCATIONFIX_ENTRY = "CM_LOCATIONFIX_ENTRY";
    final String          SP_ID_CM_LOCATIONFIX_RESET = "CM_LOCATIONFIX_RESET";

    @Autowired
    private CMC05040E0DAO dao;

    /**
     * 고정로케이션 상품 저장 처리
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
     * SP 실행 후 처리 결과를 Map 형태로 Return
     */
    public Map<String, Object> callCMLocationFixEntry(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_CM_LOCATIONFIX_ENTRY, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            // 오류면 Rollback
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }

    /**
     * SP 실행 후 처리 결과를 Map 형태로 Return
     */
    public Map<String, Object> callCMLocationFixReset(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_CM_LOCATIONFIX_RESET, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            // 오류면 Rollback
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }
}
