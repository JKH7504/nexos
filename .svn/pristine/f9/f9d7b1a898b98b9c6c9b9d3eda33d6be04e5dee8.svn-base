package nexos.dao.ro;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.DaoSupport;

/**
 * Class: ROC01010E0DAOImpl<br>
 * Description: ROC01010E0 DAO (Data Access Object)<br>
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
@Repository("ROC01010E0DAO")
public class ROC01010E0DAOImpl extends DaoSupport implements ROC01010E0DAO {

    final String PROGRAM_ID              = "ROC01010E0";

    final String TABLE_NM_RO010NM        = "RO010NM";
    final String INSERT_ID_RO010NM       = PROGRAM_ID + ".INSERT_" + TABLE_NM_RO010NM;
    final String UPDATE_ID_RO010NM       = PROGRAM_ID + ".UPDATE_" + TABLE_NM_RO010NM;
    final String DELETE_ID_RO010NM       = PROGRAM_ID + ".DELETE_" + TABLE_NM_RO010NM;

    final String TABLE_NM_RO010ND        = "RO010ND";
    final String INSERT_ID_RO010ND       = PROGRAM_ID + ".INSERT_" + TABLE_NM_RO010ND;
    final String UPDATE_ID_RO010ND       = PROGRAM_ID + ".UPDATE_" + TABLE_NM_RO010ND;
    final String DELETE_ID_RO010ND       = PROGRAM_ID + ".DELETE_" + TABLE_NM_RO010ND;

    final String SP_ID_RO010NM_GETNO     = "WT.RO_010NM_GETNO";
    final String SP_ID_RO010ND_GETNO     = "WT.RO_010ND_GETNO";
    final String SP_ID_RO_PROCESSING     = "RO_PROCESSING";
    final String SP_ID_RO_OUTBOUND_STATE = "WF.GET_RO_OUTBOUND_STATE";

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        // 파라메터 처리
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);

        // N: 신규 등록
        String processCd = (String)params.get(Consts.PK_PROCESS_CD);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String orderNo;
        int lineNo;
        int dsCnt = dsDetail.size();

        // 등록자ID 입력
        masterRowData.put(Consts.PK_USER_ID, userId);

        Map<String, Object> callParams;
        // AC: 신규 등록
        if (Consts.PROCESS_ORDER_CREATE.equals(processCd)) {

            if (dsCnt < 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ROC01010E0.001", "출고예정등록 상세내역이 존재하지 않습니다."));
            }

            // 출고번호 채번
            callParams = new HashMap<String, Object>();
            callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            callParams.put("P_ORDER_DATE", masterRowData.get("P_ORDER_DATE"));

            Map<String, Object> resultMap = callProcedure(SP_ID_RO010NM_GETNO, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            lineNo = 1;

            orderNo = (String)resultMap.get("O_ORDER_NO");
            masterRowData.put("P_ORDER_NO", orderNo);

            // 마스터 생성, CRUD 체크 안함
            masterRowData.put(Consts.PK_ORDER_USER_ID, userId);
            masterRowData.put(Consts.PK_ORDER_DATETIME, Consts.DV_SYSDATE);
            insertSql(INSERT_ID_RO010NM, masterRowData);
        }
        // AU: 수정 처리
        else {
            // 수정전 상태 체크
            callParams = new HashMap<String, Object>();
            callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            callParams.put("P_OUTBOUND_DATE", masterRowData.get("P_ORDER_DATE"));
            callParams.put("P_OUTBOUND_NO", masterRowData.get("P_ORDER_NO"));
            callParams.put("P_LINE_NO", "");
            callParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
            callParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

            Map<String, Object> resultMap = callProcedure(SP_ID_RO_OUTBOUND_STATE, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            } else {
                if (!resultMap.get("O_OUTBOUND_STATE").toString().equals(masterRowData.get("P_OUTBOUND_STATE").toString())) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ROC01010E0.002",
                        "[진행상태 : " + resultMap.get("O_OUTBOUND_STATE").toString() + "] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오.",
                        new String[] {resultMap.get("O_OUTBOUND_STATE").toString()}));
                }
            }
            // 수정 처리
            // 출고순번 채번
            orderNo = (String)masterRowData.get("P_ORDER_NO");
            callParams = new HashMap<String, Object>();
            callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            callParams.put("P_ORDER_DATE", masterRowData.get("P_ORDER_DATE"));
            callParams.put("P_ORDER_NO", orderNo);

            resultMap = callProcedure(SP_ID_RO010ND_GETNO, callParams);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            lineNo = ((Number)resultMap.get("O_LINE_NO")).intValue();

            // 마스터 수정, 마스터를 수정했으면
            if (Consts.DV_CRUD_U.equals(masterRowData.get(Consts.PK_CRUD))) {
                updateSql(UPDATE_ID_RO010NM, masterRowData);
            }
        }

        // 디테일이 변경되었으면 LO_PROCESSING 호출
        if (dsCnt > 0) {

            // 디테일 처리
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsDetail.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowData.put("P_ORDER_NO", orderNo);
                    if ("".equals(String.valueOf(rowData.get("P_LINE_NO")))) {
                        rowData.put("P_LINE_NO", lineNo);
                        lineNo++;
                    }
                    rowData.put(Consts.PK_ORDER_USER_ID, userId);
                    rowData.put(Consts.PK_ORDER_DATETIME, Consts.DV_SYSDATE);
                    insertSql(INSERT_ID_RO010ND, rowData);
                } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                    updateSql(UPDATE_ID_RO010ND, rowData);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_RO010ND, rowData);
                }
            }

            callParams.clear();
            callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            callParams.put("P_OUTBOUND_DATE", masterRowData.get("P_ORDER_DATE"));
            callParams.put("P_OUTBOUND_NO", orderNo);
            callParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
            callParams.put(Consts.PK_DIRECTION, Consts.DIRECTION_FW);
            callParams.put(Consts.PK_USER_ID, userId);

            Map<String, Object> resultMap2 = callProcedure(SP_ID_RO_PROCESSING, callParams);
            String oMsg = Util.getOutMessage(resultMap2);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }
}
