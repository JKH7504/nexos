package nexos.service.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.lc.LCC01020E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LCC01020E0Service<br>
 * Description: 세트예정등록(LCC01020E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LCC01020E0Service extends ServiceSupport {

    final String          PROGRAM_ID                     = "LCC01020E0";

    final String          SELECT_ID_MOVE_ENTRY_YN        = PROGRAM_ID + ".RS_SUB5";

    final String          SP_ID_GET_LC_CONFIRM_YN        = "WF.GET_LC_CONFIRM_YN";
    final String          SP_ID_GET_CHK_LC_PROCESS_STATE = "WF.CHK_LC_PROCESS_STATE";
    final String          SP_ID_LC_ORDER_DELETE          = "LC_ORDER_DELETE";

    @Autowired
    private LCC01020E0DAO dao;

    /**
     * 기타입출고관리 - 기타입출고 등록 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
        final String TABLE_DIV = "A";

        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        String processCd = (String)params.get(Consts.PK_PROCESS_CD);

        // 예정으로 등록
        if (Consts.PROCESS_ORDER.equals(processCd) || Consts.PROCESS_ORDER_UPDATE.equals(processCd) || Consts.PROCESS_DELETE.equals(processCd)) {
            Map<String, Object> checkParams = new HashMap<String, Object>();
            checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            checkParams.put("P_ETC_DATE", masterRowData.get("P_ORDER_DATE"));
            checkParams.put("P_ETC_NO", masterRowData.get("P_ORDER_NO"));
            checkParams.put("P_LINE_NO", "");
            checkParams.put("P_PROCESS_STATE", Consts.STATE_ORDER);

            String oMsg = canProcessingState(checkParams);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            checkParams.clear();
            checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            checkParams.put("P_ORDER_DATE", masterRowData.get("P_ORDER_DATE"));
            checkParams.put("P_ORDER_NO", masterRowData.get("P_ORDER_NO"));

            oMsg = getMoveEntryYn(checkParams);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
        // 신규가 아닐 경우 ??? - 현재 없음, 소스는 그대로 둠
        else if (!Consts.PROCESS_ORDER_CREATE.equals(processCd)) {
            Map<String, Object> checkParams = new HashMap<String, Object>();
            checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            checkParams.put("P_ETC_DATE", masterRowData.get("P_ETC_DATE"));
            checkParams.put("P_ETC_NO", masterRowData.get("P_ETC_NO"));
            checkParams.put("P_TABLE_DIV", TABLE_DIV);

            String oMsg = getConfirmYn(checkParams);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
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
     * 저장/삭제시 확정된 전표일 경우 저장/삭제 불가
     *
     * @param params
     * @param checkState
     * @return
     */
    public String getConfirmYn(Map<String, Object> params) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_LC_CONFIRM_YN, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            result = oMsg;
        } else {
            String oConfirmYn = (String)resultMap.get("O_CONFIRM_YN");
            if (Consts.YES.equals(oConfirmYn)) {
                result = NexosMessage.getDisplayMsg("JAVA.LCC.001", "이미 확정 처리된 데이터입니다.");
            } else {
                result = oMsg;
            }
        }
        return result;
    }

    public String canProcessingState(Map<String, Object> params) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_CHK_LC_PROCESS_STATE, params);
        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            result = oMsg;
        }

        return result;
    }

    /**
     * 저장시 재고이동 등록된 전표일 경우 저장 불가
     *
     * @param params
     * @param checkState
     * @return
     */
    public String getMoveEntryYn(Map<String, Object> params) {

        String result = Consts.OK;
        List<Map<String, Object>> lstMoveEntryYn = getDataList(SELECT_ID_MOVE_ENTRY_YN, params);
        String oEntryYn = Util.toString(lstMoveEntryYn.get(0).get("MOVE_ENTRY_YN"));

        if (Consts.YES.equals(oEntryYn)) {
            result = NexosMessage.getDisplayMsg("JAVA.LCC01020E0.001", "재고이동 등록된 전표는 처리할 수 없습니다.\n재고이동 삭제 후 처리하십시오.");;
        }

        return result;
    }

    /**
     * 세트예정 삭제 처리
     *
     * @param params
     */
    public Map<String, Object> callLcOrderDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LC_ORDER_DELETE, params);

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
}
