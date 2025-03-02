package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CMC04080E0DAOImpl<br>
 * Description: CMC04080E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2018-04-05    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("CMC04080E0DAO")
public class CMC04080E0DAOImpl extends DaoSupport implements CMC04080E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CMC04080E0DAOImpl.class);

    final String PROGRAM_ID             = "CMC04080E0";

    final String TABLE_NM_CMITEMASSORT  = "CMITEMASSORT";
    final String INSERT_ID_CMITEMASSORT = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMITEMASSORT;
    final String UPDATE_ID_CMITEMASSORT = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMITEMASSORT;
    final String DELETE_ID_CMITEMASSORT = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMITEMASSORT;

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
                insertSql(INSERT_ID_CMITEMASSORT, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMITEMASSORT, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMITEMASSORT, rowData);
            }
        }
    }

}