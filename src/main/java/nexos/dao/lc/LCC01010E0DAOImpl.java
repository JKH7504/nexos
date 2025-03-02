package nexos.dao.lc;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LCC01010E0DAOImpl<br>
 * Description: LCC01010E0 DAO (Data Access Object)<br>
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
@Repository("LCC01010E0DAO")
public class LCC01010E0DAOImpl extends DaoSupport implements LCC01010E0DAO {

    final String PROGRAM_ID                  = "LCC01010E0";

    final String TABLE_NM_LC010NM            = "LC010NM";
    final String UPDATE_ID_LC010NM           = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC010NM;

    final String TABLE_NM_LC010ND            = "LC010ND";
    final String UPDATE_ID_LC010ND           = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC010ND;

    final String SP_ID_LC_BW_ETC_ENTRY       = "LC_BW_ETC_ENTRY";
    final String SP_ID_LC_FW_STOCK_IN_ORDER  = "LC_FW_STOCK_IN_ORDER";
    final String SP_ID_LC_FW_STOCK_OUT_ORDER = "LC_FW_STOCK_OUT_ORDER";

    @Override
    @SuppressWarnings("unchecked")
    public void updateRemark(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LC010NM, rowData);
            }
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String inoutCd = (String)masterRowData.get("P_INOUT_CD");

        // 마스터 비고 업데이트
        if (Consts.DV_CRUD_U.equals(masterRowData.get("P_CRUD"))) {
            masterRowData.remove("P_INOUT_CD");
            masterRowData.put(Consts.PK_USER_ID, userId);
            updateSql(UPDATE_ID_LC010NM, masterRowData);
        }

        int dsSubCount = dsSub.size();
        if (dsSubCount == 0) {
            return;
        }

        String PROCEDURE_ID = null;
        if (inoutCd.startsWith("D")) {
            PROCEDURE_ID = SP_ID_LC_FW_STOCK_OUT_ORDER;
        } else {
            PROCEDURE_ID = SP_ID_LC_FW_STOCK_IN_ORDER;
        }

        String etcNo = null;
        for (int i = 0; i < dsSubCount; i++) {
            Map<String, Object> rowData = dsSub.get(i);

            rowData.put(Consts.PK_USER_ID, userId);
            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                // etc_no가 null인 경우는 신규인 경우
                if (etcNo != null) {
                    rowData.put("P_ETC_NO", etcNo);
                }
                Map<String, Object> resultMap = callProcedure(PROCEDURE_ID, rowData);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                if (etcNo == null) {
                    etcNo = (String)resultMap.get("O_ETC_NO");
                }
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                Map<String, Object> resultMap = callProcedure(SP_ID_LC_BW_ETC_ENTRY, rowData);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LC010ND, rowData);
            }
        }
        if (etcNo != null) {
            params.put("O_ETC_NO", etcNo);
        } else {
            params.put("O_ETC_NO", masterRowData.get("P_ETC_NO"));
        }
    }
}
