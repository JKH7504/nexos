package nexos.dao.li;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LIC05020E0DAOImpl<br>
 * Description: LIC05020E0 DAO (Data Access Object)<br>
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
@Repository("LIC05020E0DAO")
public class LIC05020E0DAOImpl extends DaoSupport implements LIC05020E0DAO {

    final String PROGRAM_ID        = "LIC05020E0";

    final String TABLE_NM_LI040NM  = "LI040NM";
    final String INSERT_ID_LI040NM = PROGRAM_ID + ".INSERT_" + TABLE_NM_LI040NM;
    final String UPDATE_ID_LI040NM = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LI040NM;
    final String DELETE_ID_LI040NM = PROGRAM_ID + ".DELETE_" + TABLE_NM_LI040NM;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);

        deleteSql(DELETE_ID_LI040NM, masterRowData);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            rowData.put(Consts.PK_REG_USER_ID, userId);
            rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
            insertSql(INSERT_ID_LI040NM, rowData);
        }
    }
}
