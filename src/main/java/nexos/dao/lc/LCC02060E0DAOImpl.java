package nexos.dao.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LCC02060E0DAOImpl<br>
 * Description: LCC02060E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2014-07-22    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LCC02060E0DAO")
public class LCC02060E0DAOImpl extends DaoSupport implements LCC02060E0DAO {

    final String PROGRAM_ID                     = "LCC02060E0";

    final String TABLE_NM_LC010NM               = "LC010NM";
    final String UPDATE_ID_LC010NM              = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC010NM;

    final String TABLE_NM_LC010ND               = "LC010ND";
    final String UPDATE_ID_LC010ND              = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC010ND;

    final String SP_ID_LC_FW_STATE_CHANGE_ORDER = "LC_FW_STATE_CHANGE_ORDER";
    final String SP_ID_LC_BW_ETC_ENTRY          = "LC_BW_ETC_ENTRY";

    @Override
    @SuppressWarnings("unchecked")
    public void save(Map<String, Object> params) throws Exception {

        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);

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

        String etcNo = null;
        Map<String, Object> callParams = new HashMap<String, Object>();
        for (int i = 0; i < dsSubCount; i++) {
            Map<String, Object> rowData = dsSub.get(i);

            rowData.put(Consts.PK_USER_ID, userId);
            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {

                rowData.put("P_PALLET_NO", "");
                // etc_no가 null인 경우는 신규인 경우
                if (etcNo != null) {
                    rowData.put("P_ETC_NO", etcNo);
                }
                Map<String, Object> resultMap = callProcedure(SP_ID_LC_FW_STATE_CHANGE_ORDER, rowData);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                if (etcNo == null) {
                    etcNo = (String)resultMap.get("O_ETC_NO");
                }
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 입고삭제
                callParams.clear();
                callParams.put("P_CENTER_CD", rowData.get("P_LINK_CENTER_CD"));
                callParams.put("P_BU_CD", rowData.get("P_LINK_BU_CD"));
                callParams.put("P_ETC_DATE", rowData.get("P_LINK_ETC_DATE"));
                callParams.put("P_ETC_NO", rowData.get("P_LINK_ETC_NO"));
                callParams.put("P_LINE_NO", rowData.get("P_LINK_LINE_NO"));
                callParams.put(Consts.PK_USER_ID, userId);

                Map<String, Object> resultMap = callProcedure(SP_ID_LC_BW_ETC_ENTRY, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                // 출고삭제
                resultMap = callProcedure(SP_ID_LC_BW_ETC_ENTRY, rowData);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LC010ND, rowData);

                callParams.clear();
                callParams.put("P_CENTER_CD", rowData.get("P_LINK_CENTER_CD"));
                callParams.put("P_BU_CD", rowData.get("P_LINK_BU_CD"));
                callParams.put("P_ETC_DATE", rowData.get("P_LINK_ETC_DATE"));
                callParams.put("P_ETC_NO", rowData.get("P_LINK_ETC_NO"));
                callParams.put("P_LINE_NO", rowData.get("P_LINK_LINE_NO"));
                callParams.put("P_ETC_DIV", rowData.get("P_ETC_DIV"));
                callParams.put("P_ETC_COMMENT", rowData.get("P_ETC_COMMENT"));
                callParams.put(Consts.PK_USER_ID, userId);

                updateSql(UPDATE_ID_LC010ND, callParams);
            }
        }
    }
}
