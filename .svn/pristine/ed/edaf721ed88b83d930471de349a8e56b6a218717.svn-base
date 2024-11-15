package nexos.service.cs;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.cs.CSC04040E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CSC04040E0Service<br>
 * Description: 브랜드별 정책 관리(CSC04040E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class CSC04040E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(CSC04040E0Service.class);

    @Autowired
    private CSC04040E0DAO dao;

    /**
     * 사업부별 정책 마스터 저장 처리
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
     * 물류센터사업부정책 복사
     * 
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callCenterBuPolicyCopy(Map<String, Object> params) throws Exception {

        Map<String, Object> result;

        TransactionStatus ts = beginTrans();
        try {
            result = dao.callCenterBuPolicyCopy(params);
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
