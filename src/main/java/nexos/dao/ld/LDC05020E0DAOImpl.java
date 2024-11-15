package nexos.dao.ld;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LDC05020E0DAOImpl<br>
 * Description: LDC05020E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2020-12-24    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LDC05020E0DAO")
public class LDC05020E0DAOImpl extends DaoSupport implements LDC05020E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(LDC05020E0DAOImpl.class);

    final String PROGRAM_ID        = "LDC05020E0";

    final String TABLE_NM_LD020ND  = "LD020ND";
    final String INSERT_ID_LD020ND = PROGRAM_ID + ".INSERT_" + TABLE_NM_LD020ND;
    final String UPDATE_ID_LD020ND = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LD020ND;
    final String DELETE_ID_LD020ND = PROGRAM_ID + ".DELETE_" + TABLE_NM_LD020ND;

    @Override
    @SuppressWarnings("unchecked")
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_LD020ND, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LD020ND, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_LD020ND, rowData);
            }
        }
    }

}
