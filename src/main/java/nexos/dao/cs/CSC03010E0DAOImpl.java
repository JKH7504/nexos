package nexos.dao.cs;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CSC03010E0DAOImpl<br>
 * Description: CSC03010E0 DAO (Data Access Object)<br>
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
@Repository("CSC03010E0DAO")
public class CSC03010E0DAOImpl extends DaoSupport implements CSC03010E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CSC03010E0DAOImpl.class);

    final String PROGRAM_ID          = "CSC03010E0";

    final String TABLE_NM_CPPROCESS  = "CPPROCESS";
    final String INSERT_ID_CPPROCESS = PROGRAM_ID + ".INSERT_" + TABLE_NM_CPPROCESS;
    final String UPDATE_ID_CPPROCESS = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CPPROCESS;
    final String DELETE_ID_CPPROCESS = PROGRAM_ID + ".DELETE_" + TABLE_NM_CPPROCESS;

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
                insertSql(INSERT_ID_CPPROCESS, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CPPROCESS, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CPPROCESS, rowData);
            }
        }
    }
}
