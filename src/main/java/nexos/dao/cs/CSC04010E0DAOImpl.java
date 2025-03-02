package nexos.dao.cs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CSC04010E0DAOImpl<br>
 * Description: CSC04010E0 DAO (Data Access Object)<br>
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
@Repository("CSC04010E0DAO")
public class CSC04010E0DAOImpl extends DaoSupport implements CSC04010E0DAO {

    final String PROGRAM_ID                       = "CSC04010E0";

    final String TABLE_NM_CPPOLICY                = "CPPOLICY";
    final String INSERT_ID_CPPOLICY               = PROGRAM_ID + ".INSERT_" + TABLE_NM_CPPOLICY;
    final String UPDATE_ID_CPPOLICY               = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CPPOLICY;
    final String DELETE_ID_CPPOLICY               = PROGRAM_ID + ".DELETE_" + TABLE_NM_CPPOLICY;

    final String TABLE_NM_CPPOLICYVAL             = "CPPOLICYVAL";
    final String INSERT_ID_CPPOLICYVAL            = PROGRAM_ID + ".INSERT_" + TABLE_NM_CPPOLICYVAL;
    final String UPDATE_ID_CPPOLICYVAL            = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CPPOLICYVAL;
    final String DELETE_ID_CPPOLICYVAL            = PROGRAM_ID + ".DELETE_" + TABLE_NM_CPPOLICYVAL;

    final String TABLE_NM_CPBUPOLICYVAL           = "CPBUPOLICYVAL";
    final String DELETE_ID_CPBUPOLICYVAL          = PROGRAM_ID + ".DELETE_" + TABLE_NM_CPBUPOLICYVAL;

    final String TABLE_NM_CPCENTERPOLICYVAL       = "CPCENTERPOLICYVAL";
    final String DELETE_ID_CPCENTERPOLICYVAL      = PROGRAM_ID + ".DELETE_" + TABLE_NM_CPCENTERPOLICYVAL;

    final String TABLE_NM_CPCENTERBUPOLICYVAL     = "CPCENTERBUPOLICYVAL";
    final String DELETE_ID_CPCENTERBUPOLICYVAL    = PROGRAM_ID + ".DELETE_" + TABLE_NM_CPCENTERBUPOLICYVAL;

    final String SP_ID_CS_POLICY_RECOMMEND_UPDATE = "CS_POLICY_RECOMMEND_UPDATE";

    @Override
    public void saveMaster(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CPPOLICY, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CPPOLICY, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 삭제일 경우 사업부정책, 정책 먼저 삭제
                Map<String, Object> newRowData = Util.newMap();
                newRowData.put("P_POLICY_CD", rowData.get("P_POLICY_CD"));
                deleteSql(DELETE_ID_CPCENTERBUPOLICYVAL, newRowData);
                deleteSql(DELETE_ID_CPCENTERPOLICYVAL, newRowData);
                deleteSql(DELETE_ID_CPBUPOLICYVAL, newRowData);
                deleteSql(DELETE_ID_CPPOLICYVAL, newRowData);

                deleteSql(DELETE_ID_CPPOLICY, rowData);
            }
        }
    }

    @Override
    public void saveDetail(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        Map<String, Object> recommendParams = Util.getParameter(params, "P_RECOMMEND_PARAMS");
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CPPOLICYVAL, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CPPOLICYVAL, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 삭제일 경우 사업부정책 먼저 삭제
                Map<String, Object> newRowData = new HashMap<String, Object>();
                newRowData.put("P_POLICY_CD", rowData.get("P_POLICY_CD"));
                newRowData.put("P_POLICY_VAL", rowData.get("P_POLICY_VAL"));
                deleteSql(DELETE_ID_CPCENTERBUPOLICYVAL, newRowData);
                deleteSql(DELETE_ID_CPCENTERPOLICYVAL, newRowData);
                deleteSql(DELETE_ID_CPBUPOLICYVAL, newRowData);

                deleteSql(DELETE_ID_CPPOLICYVAL, rowData);
            }
        }
        // 권장이 하나만 지정되도록 SP 호출
        if (Util.getCount(recommendParams) > 0) {
            recommendParams.put(Consts.PK_USER_ID, userId);
            Map<String, Object> resultMap = callProcedure(SP_ID_CS_POLICY_RECOMMEND_UPDATE, recommendParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }
}
