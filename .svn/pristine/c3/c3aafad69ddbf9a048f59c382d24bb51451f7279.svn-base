package nexos.dao.lf;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LFC02010E0DAOImpl<br>
 * Description: LFC02010E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-10-29    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LFC02010E0DAO")
public class LFC02010E0DAOImpl extends DaoSupport implements LFC02010E0DAO {

    final String PROGRAM_ID           = "LFC02010E0";

    final String TABLE_NM_LFCONTRACT  = "LFCONTRACT";
    final String INSERT_ID_LFCONTRACT = PROGRAM_ID + ".INSERT_" + TABLE_NM_LFCONTRACT;
    final String UPDATE_ID_LFCONTRACT = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LFCONTRACT;
    final String DELETE_ID_LFCONTRACT = PROGRAM_ID + ".DELETE_" + TABLE_NM_LFCONTRACT;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        // DataSet 처리
        int dsCnt = dsMaster.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsMaster.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_LFCONTRACT, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LFCONTRACT, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_LFCONTRACT, rowData);
            }
        }
    }
}
