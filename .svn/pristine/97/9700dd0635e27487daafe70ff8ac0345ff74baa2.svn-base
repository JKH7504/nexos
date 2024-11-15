package nexos.service.ls;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LSC03020Q0Service<br>
 * Description: 재고변동추적조회(LSC03020Q0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2020-06-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class LSC03020Q0Service extends ServiceSupport {

    @Override
    public List<Map<String, Object>> getDataList(String queryId, Map<String, Object> params) throws DataAccessException {

        // 임시 테이블 데이터를 정상적으로 가져오기 위해 트랜잭션 처리
        List<Map<String, Object>> dsResult = null;
        TransactionStatus ts = beginTrans();
        try {
            dsResult = getDefaultDao().getDataList(queryId, params);
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return dsResult;
    }
}
