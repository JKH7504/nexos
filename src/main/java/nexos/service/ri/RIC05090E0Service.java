package nexos.service.ri;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.ri.RIC05090E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: RIC05090E0Service<br>
 * Description: 반입작업비등록(RIC05090E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class RIC05090E0Service extends ServiceSupport {

    final String          SP_ID_GET_PROTECT = "WF.GET_PROTECT";

    @Autowired
    private RIC05090E0DAO dao;

    /**
     * 반입작업비등록 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 진행상태 체크
        List<Map<String, Object>> masterRowData = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> subRowData = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);

        int masterCnt = masterRowData.size();
        Map<String, Object> checkRow;
        Map<String, Object> callParams;

        // 마스터 데이터 수정여부에 따라 보안일자 체크 데이터 대상 변수에 담기
        if (masterCnt > 0) {
            checkRow = masterRowData.get(0);
        } else {
            checkRow = subRowData.get(0);
        }

        // 보안 설정 CHECK SP 호출
        callParams = new HashMap<String, Object>();
        callParams.put("P_CENTER_CD", checkRow.get("P_CENTER_CD"));
        callParams.put("P_BU_CD", checkRow.get("P_BU_CD"));
        callParams.put("P_PROTECT_DATE", checkRow.get("P_INBOUND_DATE"));

        Map<String, Object> resultMap = callProcedure(SP_ID_GET_PROTECT, callParams);
        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveSub(params);
            dao.saveMaster(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

}