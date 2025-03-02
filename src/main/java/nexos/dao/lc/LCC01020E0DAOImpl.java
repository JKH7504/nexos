package nexos.dao.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LCC01020E0DAOImpl<br>
 * Description: LCC01020E0 DAO (Data Access Object)<br>
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
@Repository("LCC01020E0DAO")
public class LCC01020E0DAOImpl extends DaoSupport implements LCC01020E0DAO {

    final String PROGRAM_ID              = "LCC01020E0";

    final String TABLE_NM_LC000NM        = "LC000NM";
    final String INSERT_ID_LC000NM       = PROGRAM_ID + ".INSERT_" + TABLE_NM_LC000NM;
    final String UPDATE_ID_LC000NM       = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC000NM;
    final String DELETE_ID_LC000NM       = PROGRAM_ID + ".DELETE_" + TABLE_NM_LC000NM;

    final String TABLE_NM_LC000ND        = "LC000ND";
    final String INSERT_ID_LC000ND       = PROGRAM_ID + ".INSERT_" + TABLE_NM_LC000ND;
    final String UPDATE_ID_LC000ND       = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC000ND;
    final String DELETE_ID_LC000ND       = PROGRAM_ID + ".DELETE_" + TABLE_NM_LC000ND;

    final String SP_ID_LC000NM_GETNO     = "WT.LC_000NM_GETNO";
    final String SP_ID_GET_LINK_INOUT_CD = "WF.GET_LINK_INOUT_CD";
    final String SP_ID_GET_PROTECT       = "WF.GET_PROTECT";

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);

        String processCd = (String)params.get(Consts.PK_PROCESS_CD);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String orderNo;
        String linkInoutCd;
        String linkOrderNo;
        int dsMasterCount = masterRowData.size();
        int dsDetailCount = dsDetail.size();
        int dsSubCount = dsSub.size();
        if (dsMasterCount == 0 && dsDetailCount == 0 && dsSubCount == 0) {
            return;
        }

        // 등록자ID 입력
        masterRowData.put(Consts.PK_USER_ID, userId);
        Map<String, Object> callParams;
        Map<String, Object> resultMap = null;

        // 보안 설정 CHECK SP 호출
        callParams = new HashMap<String, Object>();
        callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
        callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
        callParams.put("P_PROTECT_DATE", masterRowData.get("P_ORDER_DATE"));

        resultMap = callProcedure(SP_ID_GET_PROTECT, callParams);
        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 상대입출고구분 Return
        callParams.clear();
        callParams.put("P_INOUT_CD", masterRowData.get("P_INOUT_CD"));
        resultMap = callProcedure(SP_ID_GET_LINK_INOUT_CD, callParams);
        linkInoutCd = (String)resultMap.get("O_RESULT");

        // 신규 등록
        if (Consts.PROCESS_ORDER_CREATE.equals(processCd)) {

            callParams.clear();
            callParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            callParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            callParams.put("P_ORDER_DATE", masterRowData.get("P_ORDER_DATE"));
            callParams.put(Consts.PK_PROCESS_CD, processCd);
            callParams.put(Consts.PK_USER_ID, userId);

            // 예정번호 채번
            resultMap = callProcedure(SP_ID_LC000NM_GETNO, callParams);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            orderNo = (String)resultMap.get("O_ORDER_NO");
            // 상대예정번호 채번
            resultMap = callProcedure(SP_ID_LC000NM_GETNO, callParams);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            linkOrderNo = (String)resultMap.get("O_ORDER_NO");

            masterRowData.put(Consts.PK_ORDER_USER_ID, userId);
            masterRowData.put(Consts.PK_ORDER_DATETIME, Consts.DV_SYSDATE);

            // 출고
            masterRowData.put("P_ORDER_NO", orderNo);
            masterRowData.put("P_LINK_ORDER_NO", linkOrderNo);
            insertSql(INSERT_ID_LC000NM, masterRowData);

            // 입고
            masterRowData.put("P_INOUT_CD", linkInoutCd);
            masterRowData.put("P_ORDER_NO", linkOrderNo);
            masterRowData.put("P_LINK_ORDER_NO", orderNo);
            insertSql(INSERT_ID_LC000NM, masterRowData);
        }
        // AU: 수정 처리
        else {
            orderNo = (String)masterRowData.get("P_ORDER_NO");
            if (Consts.DV_CRUD_U.equals(masterRowData.get(Consts.PK_CRUD))) {
                updateSql(UPDATE_ID_LC000NM, masterRowData);
            }

            linkOrderNo = (String)masterRowData.get("P_LINK_ORDER_NO");
            masterRowData.put("P_INOUT_CD", linkInoutCd);
            masterRowData.put("P_ORDER_NO", linkOrderNo);
            masterRowData.put("P_LINK_ORDER_NO", orderNo);

            if (Consts.DV_CRUD_U.equals(masterRowData.get(Consts.PK_CRUD))) {
                updateSql(UPDATE_ID_LC000NM, masterRowData);
            }
        }

        if (dsDetailCount > 0) {

            // 디테일 처리
            for (int i = 0; i < dsDetailCount; i++) {
                Map<String, Object> rowDataD = dsDetail.get(i);
                rowDataD.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowDataD.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowDataD.put(Consts.PK_ORDER_USER_ID, userId);
                    rowDataD.put(Consts.PK_ORDER_DATETIME, Consts.DV_SYSDATE);
                    rowDataD.put("P_ORDER_NO", linkOrderNo);
                    insertSql(INSERT_ID_LC000ND, rowDataD);
                } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                    updateSql(UPDATE_ID_LC000ND, rowDataD);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_LC000ND, rowDataD);
                }
            }
        }

        if (dsSubCount > 0) {

            // 서브 처리
            for (int i = 0; i < dsSubCount; i++) {
                Map<String, Object> rowDataS = dsSub.get(i);
                rowDataS.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowDataS.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowDataS.put(Consts.PK_ORDER_USER_ID, userId);
                    rowDataS.put(Consts.PK_ORDER_DATETIME, Consts.DV_SYSDATE);
                    rowDataS.put("P_ORDER_NO", orderNo);
                    insertSql(INSERT_ID_LC000ND, rowDataS);
                } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                    updateSql(UPDATE_ID_LC000ND, rowDataS);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_LC000ND, rowDataS);
                }
            }
        }
    }
}
