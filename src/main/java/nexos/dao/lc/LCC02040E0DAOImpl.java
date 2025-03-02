package nexos.dao.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LCC02040E0DAOImpl<br>
 * Description: LCC02040E0 DAO (Data Access Object)<br>
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
@Repository("LCC02040E0DAO")
public class LCC02040E0DAOImpl extends DaoSupport implements LCC02040E0DAO {

    final String PROGRAM_ID                 = "LCC02040E0";

    final String TABLE_NM_LC010NM           = "LC010NM";
    final String UPDATE_ID_LC010NM          = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC010NM;

    final String SP_ID_LC_FW_SET_ORDER      = "LC_FW_SET_ORDER";
    final String SP_ID_LC_FW_SET_MOVE_ORDER = "LC_FW_SET_MOVE_ORDER";

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

        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsSubCount = dsSub.size();
        if (dsSubCount == 0) {
            return;
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

                Map<String, Object> resultMap = callProcedure(SP_ID_LC_FW_SET_ORDER, rowData);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                if (etcNo == null) {
                    etcNo = (String)resultMap.get("O_ETC_NO");
                }
            }
        }
    }

    @Override
    public Map<String, Object> callLCFWSetMoveOrder(Map<String, Object> params) throws Exception {

        // 선택 값 CTCHECKVALUE 테이블에 INSERT
        String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);
        Map<String, Object> checkedParams = new HashMap<String, Object>();
        checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
        insertCheckedValue(checkedParams);

        // 프로시저 호출
        return callProcedure(SP_ID_LC_FW_SET_MOVE_ORDER, params);
    }
}
