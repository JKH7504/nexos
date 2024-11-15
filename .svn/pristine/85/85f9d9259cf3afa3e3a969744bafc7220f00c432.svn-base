package nexos.service.ld;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.ld.LDC04020E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;
import nexos.service.ed.common.EDRESTfulService;

/**
 * Class: LDC04020E0Service<br>
 * Description: 운행일지 (LDC04020E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2019-11-25    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class LDC04020E0Service extends ServiceSupport {

    final String             SP_ID_LD_APPLY_FUEL_PRICE_T2 = "LD_APPLY_FUEL_PRICE_T2";
    final String             SP_ID_LD_FW_CLOSING_DAILY    = "LD_FW_CLOSING_DAILY";
    final String             SP_ID_LD_BW_CLOSING_DAILY    = "LD_BW_CLOSING_DAILY";

    @Autowired
    private LDC04020E0DAO    dao;
    @Autowired
    private EDRESTfulService edRESTfulService;

    /**
     * 운행일지
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

    @SuppressWarnings("unchecked")
    public String saveP2(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveDetail(params);
            dao.saveMaster(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // [네이버] 거리계산 Service 호출
        Map<String, Object> callParams = (Map<String, Object>)params.get(Consts.PK_DS_SUB);
        if (Util.isNotNull(callParams)) {
            callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
            callParams.put("P_THREAD_YN", Consts.NO); // 별도 쓰레드로 처리 여부
            callParams.put("P_ERROR_PROC_YN", Consts.NO); // 오류내역 처리 여부
            edRESTfulService.callNMapGetDistance(callParams);
        }

        return result;
    }

    /**
     * SP 실행 후 처리 결과를 Map 형태로 Return
     */
    public Map<String, Object> setLDApplyFuelPriceT2(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LD_APPLY_FUEL_PRICE_T2, params);

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

    /**
     * 삭제/확정/취소시 SP 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callLDProcessing(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;
        String oMsg = Consts.ERROR;
        String PROCESS_DIV = (String)params.get("P_PROCESS_DIV");
        String PROCEDURE_ID = Consts.DIRECTION_FW.equals(PROCESS_DIV) ? SP_ID_LD_FW_CLOSING_DAILY : SP_ID_LD_BW_CLOSING_DAILY;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(PROCEDURE_ID, params);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // [네이버] 거리계산 Service 호출
        if (Consts.DIRECTION_FW.equals(PROCESS_DIV)) {
            params.put("P_THREAD_YN", Consts.YES); // 별도 쓰레드로 처리 여부
            params.put("P_ERROR_PROC_YN", Consts.NO); // 오류내역 처리 여부
            edRESTfulService.callNMapGetDistance(params);
        }

        return resultMap;
    }

    /**
     * [네이버] 거리계산 오류내역 처리 Service 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    public String callLDErrorProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;

        try {
            params.put("P_THREAD_YN", Consts.NO); // 별도 쓰레드로 처리 여부
            params.put("P_ERROR_PROC_YN", Consts.YES); // 오류내역 처리 여부
            edRESTfulService.callNMapGetDistance(params);
            result = Consts.OK;
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }
}