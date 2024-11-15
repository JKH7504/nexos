package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CMC02020E0DAOImpl<br>
 * Description: CMC02020E0 DAO (Data Access Object)<br>
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
@Repository("CMC02020E0DAO")
public class CMC02020E0DAOImpl extends DaoSupport implements CMC02020E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CMC02020E0DAOImpl.class);

    final String PROGRAM_ID      = "CMC02020E0";

    final String TABLE_NM_CMCAR  = "CMCAR";
    final String INSERT_ID_CMCAR = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMCAR;
    final String UPDATE_ID_CMCAR = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMCAR;
    final String DELETE_ID_CMCAR = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMCAR;

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
                insertSql(INSERT_ID_CMCAR, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMCAR, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMCAR, rowData);
            }
        }
    }

}
