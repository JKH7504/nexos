package nexos.dao.ro;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: ROC05090E0DAOImpl<br>
 * Description: ROC05090E0 DAO (Data Access Object)<br>
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
@Repository("ROC05090E0DAO")
public class ROC05090E0DAOImpl extends DaoSupport implements ROC05090E0DAO {

    final String PROGRAM_ID        = "ROC05090E0";

    final String TABLE_NM_RO020NM  = "RO020NM";
    final String UPDATE_ID_RO020NM = PROGRAM_ID + ".UPDATE_" + TABLE_NM_RO020NM;

    final String TABLE_NM_RO090NM  = "RO090NM";
    final String INSERT_ID_RO090NM = PROGRAM_ID + ".INSERT_" + TABLE_NM_RO090NM;
    final String UPDATE_ID_RO090NM = PROGRAM_ID + ".UPDATE_" + TABLE_NM_RO090NM;

    @SuppressWarnings("unchecked")
    @Override
    public void saveMaster(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                rowData.put("P_BILL_USER_ID", userId);
                rowData.put("P_BILL_DATETIME", Consts.DV_SYSDATE);
                updateSql(UPDATE_ID_RO020NM, rowData);
            }
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public void saveSub(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_RO090NM, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_RO090NM, rowData);
            }
        }
    }

}
