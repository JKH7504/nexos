package nexos.service.pda;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.pda.PDA_LCC02010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;
import nexos.service.ed.common.EDCommonService;

/**
 * Class: PDA_LCC02010E0Service<br>
 * Description: PDA 상태변환 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class PDA_LCC02010E0Service extends ServiceSupport {

    @Autowired
    private PDA_LCC02010E0DAO dao;

    @Autowired
    private EDCommonService   edCommonService;

    /**
     * [센터운영]상태변환 - 상태변환 처리
     *
     * @param params
     */
    public Map<String, Object> callLCProcStateChange(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;
        Map<String, Object> realtimeMap = null;
        TransactionStatus ts = beginTrans();
        try {
            resultMap = dao.callLCProcStateChange(params);
            String oMsg = Util.getOutMessage(resultMap);
            // 오류면 Rollback
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            // 실시간 송신 호출
            realtimeMap = edCommonService.realtimeSendProcessing();
            oMsg = Util.getOutMessage(realtimeMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 실시간 결과 데이터 반영, 자체 트랜잭션 처리 함
        if (realtimeMap != null && Consts.OK.equals(Util.getOutMessage(realtimeMap))) {
            edCommonService.ifResultProcessing(realtimeMap);
        }

        return resultMap;
    }
}