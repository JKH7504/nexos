package nexos.dao.cs;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CSC05020E0DAOImpl<br>
 * Description: CSC05020E0 DAO (Data Access Object)<br>
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
@Repository("CSC05020E0DAO")
public class CSC05020E0DAOImpl extends DaoSupport implements CSC05020E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CSC05020E0DAOImpl.class);

    final String PROGRAM_ID       = "CSC05020E0";
    final String TABLE_NM_CMCODE  = "CMCODE";
    final String INSERT_ID_CMCODE = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMCODE;
    final String UPDATE_ID_CMCODE = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMCODE;
    final String DELETE_ID_CMCODE = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMCODE;

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
                insertSql(INSERT_ID_CMCODE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMCODE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMCODE, rowData);
            }
        }
    }

}
