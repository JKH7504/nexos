package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CMC05060E1DAOImpl<br>
 * Description: CMC05060E1 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-07-05    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("CMC05060E1DAO")
public class CMC05060E1DAOImpl extends DaoSupport implements CMC05060E1DAO {

    final String PROGRAM_ID           = "CMC05060E1";

    final String TABLE_NM_CMITEMZONE  = "CMITEMZONE";
    final String INSERT_ID_CMITEMZONE = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMITEMZONE;
    final String UPDATE_ID_CMITEMZONE = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMITEMZONE;
    final String DELETE_ID_CMITEMZONE = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMITEMZONE;

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMITEMZONE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMITEMZONE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMITEMZONE, rowData);
            }
        }
    }

}
