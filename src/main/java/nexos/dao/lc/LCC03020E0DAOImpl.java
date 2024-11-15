package nexos.dao.lc;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LCC03020E0DAOImpl<br>
 * Description: LCC03020E0 DAO (Data Access Object) - 데이터처리를 담당하는 Class<br>
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
@Repository("LCC03020E0DAO")
public class LCC03020E0DAOImpl extends DaoSupport implements LCC03020E0DAO {

    final String PROGRAM_ID                    = "LCC03010E0";

    final String TABLE_NM_LC030NM              = "LC030NM";
    final String UPDATE_ID_LC030NM             = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC030NM;

    final String SP_ID_LC_FW_PLTID_MERGE_ORDER = "LC_FW_PLTID_MERGE_ORDER";
    final String SP_ID_LC_BW_PLTID_MERGE_ENTRY = "LC_BW_PLTID_MERGE_ENTRY";

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
                updateSql(UPDATE_ID_LC030NM, rowData);
            }
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);

        // 마스터 비고 업데이트
        if (Consts.DV_CRUD_U.equals(masterRowData.get("P_CRUD"))) {
            masterRowData.put(Consts.PK_USER_ID, userId);
            updateSql(UPDATE_ID_LC030NM, masterRowData);
        }

        int dsSubCount = dsSub.size();
        if (dsSubCount == 0) {
            return;
        }

        String moveNo = null;
        for (int i = 0; i < dsSubCount; i++) {
            Map<String, Object> rowData = dsSub.get(i);
            rowData.put(Consts.PK_USER_ID, userId);
            String rowCrud = (String)rowData.get(Consts.PK_CRUD);

            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                if (moveNo != null) {
                    rowData.put("P_MOVE_NO", moveNo);
                }
                Map<String, Object> resultMap = callProcedure(SP_ID_LC_FW_PLTID_MERGE_ORDER, rowData);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                if (moveNo == null) {
                    moveNo = (String)resultMap.get("O_MOVE_NO");
                }
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                Map<String, Object> resultMap = callProcedure(SP_ID_LC_BW_PLTID_MERGE_ENTRY, rowData);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
        }
    }
}
