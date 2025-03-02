package nexos.service.cm;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.cm.CMC04060E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CMC04060E0Service<br>
 * Description: 공급처별상품 관리(CMC04060E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class CMC04060E0Service extends ServiceSupport {

    @Autowired
    private CMC04060E0DAO dao;

    /**
     * 공급처별 할당상품 저장 처리
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

    /**
     * 공급처별 할당상품 처리
     *
     * @param params
     */
    public String callVendorItemAddItem(Map<String, Object> params) throws Exception {

        String result;

        TransactionStatus ts = beginTrans();
        try {
            result = dao.callVendorItemAddItem(params);
            // 오류면 Rollback
            if (!Consts.OK.equals(result)) {
                throw new RuntimeException(result);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 상품별 할당상품 처리
     *
     * @param params
     */
    public String callVendorItemAddVendor(Map<String, Object> params) throws Exception {

        String result;

        TransactionStatus ts = beginTrans();
        try {
            result = dao.callVendorItemAddVendor(params);
            // 오류면 Rollback
            if (!Consts.OK.equals(result)) {
                rollbackTrans(ts);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }
}
