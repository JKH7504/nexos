package nexos.dao.lo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.DaoSupport;

/**
 * Class: LOF07020E0DAOImpl<br>
 * Description: LOF07020E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-12-24    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LOF07020E0DAO")
public class LOF07020E0DAOImpl extends DaoSupport implements LOF07020E0DAO {

    final String PROGRAM_ID                      = "LOF07020E0";

    final String TABLE_NM_LO050NM                = "LO050NM";
    final String DELETE_ID_LO050NM               = PROGRAM_ID + ".DELETE_" + TABLE_NM_LO050NM;

    final String SP_ID_LO_WB_NO_ADD              = "LO_WB_NO_ADD";
    final String SP_ID_SET_WBNO_PRINT_CNT_UPDATE = "WB.SET_WBNO_PRINT_CNT_UPDATE";
    final String SP_ID_LO_MANUAL_INSPECT         = "LO_MANUAL_INSPECT";

    final String SP_ID_RI010NM_GETNO             = "WT.RI_010NM_GETNO";
    final String SP_ID_RI010ND_GETNO             = "WT.RI_010ND_GETNO";
    final String SP_ID_RI_PROCESSING             = "RI_PROCESSING";

    // 온라인반입예정테이블
    final String TABLE_NM_RI010NM                = "RI010NM";
    final String TABLE_NM_RI010ND                = "RI010ND";
    final String INSERT_ID_RI010NM               = PROGRAM_ID + ".INSERT_" + TABLE_NM_RI010NM;
    final String INSERT_ID_RI010ND               = PROGRAM_ID + ".INSERT_" + TABLE_NM_RI010ND;

    @SuppressWarnings("unchecked")
    @Override
    public void delete(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_LO050NM, rowData);
            }
        }
    }

    @Override
    public Map<String, Object> callLOWbNoAdd(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LO_WB_NO_ADD, params);
    }

    @Override
    public Map<String, Object> callSetWbNoPrintCntUpdate(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_SET_WBNO_PRINT_CNT_UPDATE, params);
    }

    @SuppressWarnings("unchecked")
    @Override
    public void returnSave(Map<String, Object> params) throws Exception {

        // 파라메터 처리
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        Map<String, Object> subRowData = (Map<String, Object>)params.get(Consts.PK_DS_SUB);
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        String userId = params.get(Consts.PK_USER_ID).toString();
        String orderNo;
        int lineNo;
        int dsCnt = dsDetail.size();

        // 등록자ID 입력
        masterRowData.put(Consts.PK_USER_ID, userId);
        subRowData.put(Consts.PK_USER_ID, userId);

        Map<String, Object> callParams = null;
        // 신규 등록

        if (dsCnt < 1) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOF07020E0.001", "온라인 반입예정등록 상세내역이 존재하지 않습니다."));
        }

        // 입고번호 채번
        callParams = new HashMap<String, Object>();
        callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
        callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
        callParams.put("P_ORDER_DATE", masterRowData.get("P_ORDER_DATE"));

        Map<String, Object> resultMap = callProcedure(SP_ID_RI010NM_GETNO, callParams);
        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        orderNo = (String)resultMap.get("O_ORDER_NO");
        masterRowData.put("P_ORDER_NO", orderNo);
        subRowData.put("P_ORDER_NO", orderNo);

        // 마스터 생성, CRUD 체크 안함
        masterRowData.put(Consts.PK_ORDER_USER_ID, userId);
        masterRowData.put(Consts.PK_ORDER_DATETIME, Consts.DV_SYSDATE);
        subRowData.put(Consts.PK_ORDER_USER_ID, userId);
        subRowData.put(Consts.PK_ORDER_DATETIME, Consts.DV_SYSDATE);
        insertSql(INSERT_ID_RI010NM, masterRowData);

        // 디테일이 변경되었으면 RI_PROCESSING 호출
        if (dsCnt > 0) {
            // 디테일 처리
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsDetail.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                // 입고순번 채번
                orderNo = (String)masterRowData.get("P_ORDER_NO");
                callParams = new HashMap<String, Object>();
                callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
                callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
                callParams.put("P_ORDER_DATE", masterRowData.get("P_ORDER_DATE"));
                callParams.put("P_ORDER_NO", orderNo);

                resultMap = callProcedure(SP_ID_RI010ND_GETNO, callParams);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }

                lineNo = ((Number)resultMap.get("O_LINE_NO")).intValue();
                rowData.put("P_ORDER_NO", orderNo);
                rowData.put("P_LINE_NO", lineNo);

                rowData.put(Consts.PK_ORDER_USER_ID, userId);
                rowData.put(Consts.PK_ORDER_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_RI010ND, rowData);
            }

            callParams = new HashMap<String, Object>();
            callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            callParams.put("P_INBOUND_DATE", masterRowData.get("P_ORDER_DATE"));
            callParams.put("P_INBOUND_NO", orderNo);
            callParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
            callParams.put(Consts.PK_DIRECTION, Consts.DIRECTION_FW);
            callParams.put(Consts.PK_USER_ID, userId);

            Map<String, Object> resultMap2 = callProcedure(SP_ID_RI_PROCESSING, callParams);
            oMsg = Util.getOutMessage(resultMap2);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }

    @Override
    public Map<String, Object> callLOWbConfirm(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LO_MANUAL_INSPECT, params);
    }
}