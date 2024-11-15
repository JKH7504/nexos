package nexos.dao.ed;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: EDC01010E0DAOImpl<br>
 * Description: EDC01010E0 DAO (Data Access Object)<br>
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
@Repository("EDC01010E0DAO")
public class EDC01010E0DAOImpl extends DaoSupport implements EDC01010E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(EDC01010E0DAOImpl.class);

    final String PROGRAM_ID        = "EDC01010E0";

    final String TABLE_NM_CMCODE   = "CMCODE";
    final String INSERT_ID_CMCODE  = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMCODE;
    final String UPDATE_ID_CMCODE  = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMCODE;
    final String DELETE_ID_CMCODE  = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMCODE;

    final String TABLE_NM_EMCHECK  = "EMCHECK";
    final String INSERT_ID_EMCHECK = PROGRAM_ID + ".INSERT_" + TABLE_NM_EMCHECK;
    final String UPDATE_ID_EMCHECK = PROGRAM_ID + ".UPDATE_" + TABLE_NM_EMCHECK;
    final String DELETE_ID_EMCHECK = PROGRAM_ID + ".DELETE_" + TABLE_NM_EMCHECK;

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
                insertSql(INSERT_ID_CMCODE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMCODE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 삭제일 경우 상용코드 먼저 삭제
                Map<String, Object> newRowData = new HashMap<String, Object>();
                newRowData.put("P_COMMON_GRP", rowData.get("P_COMMON_CD"));
                deleteSql(DELETE_ID_CMCODE, newRowData);
                // 그룹코드 삭제
                deleteSql(DELETE_ID_CMCODE, rowData);
            }
        }
    }

    @Override
    public void saveDetail(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_EMCHECK, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_EMCHECK, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_EMCHECK, rowData);
            }
        }
    }

}
