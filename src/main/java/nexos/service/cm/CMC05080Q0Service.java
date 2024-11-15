package nexos.service.cm;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.cm.CMC05080Q0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CMC05080Q0Service<br>
 * Description: 적재파렛트출력(CMC05080Q0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class CMC05080Q0Service extends ServiceSupport {

    @Autowired
    private CMC05080Q0DAO dao;

    /**
     * 복수의 CMSHIPID 채번
     *
     * @param params
     */
    public Map<String, Object> callShipIdGetNo(Map<String, Object> params) throws Exception {

        Map<String, Object> result;

        TransactionStatus ts = beginTrans();
        try {
            result = dao.callShipIdGetNo(params);
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
     * 적재파렛트발행 출력체크 저장 처리
     *
     * @param params
     *        수정된 데이터
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
}