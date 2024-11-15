package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: WCDAOImpl<br>
 * Description: CMC05010E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2017-10-10    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("CMC05010E0DAO")
public class CMC05010E0DAOImpl extends DaoSupport implements CMC05010E0DAO {

    final String PROGRAM_ID                 = "CMC05010E0";

    final String TABLE_NM_CMLOCATIONREC     = "CMLOCATIONREC";
    final String INSERT_ID_CMLOCATIONREC    = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMLOCATIONREC;
    final String DELETE_ID_CMLOCATIONREC    = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMLOCATIONREC;

    final String SP_ID_CM_LOCATIONFIX_CHECK = "CM_LOCATIONFIX_CHECK";

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String policyCM120 = (String)params.get("P_POLICY_CM120");

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                // LOCATION_CD 컬럼값 교체
                rowData.put("P_LOCATION_CD", Util.getDisplayLocation( //
                    (String)rowData.get("P_ZONE_CD"), //
                    (String)rowData.get("P_BANK_CD"), //
                    (String)rowData.get("P_BAY_CD"), //
                    (String)rowData.get("P_LEV_CD"), //
                    policyCM120 //
                ));

                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMLOCATIONREC, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                // LOCATION_CD 컬럼값 교체
                rowData.put("P_LOCATION_CD", Util.getDisplayLocation( //
                    (String)rowData.get("P_ZONE_CD"), //
                    (String)rowData.get("P_BANK_CD"), //
                    (String)rowData.get("P_BAY_CD"), //
                    (String)rowData.get("P_LEV_CD"), //
                    policyCM120 //
                ));

                deleteSql(DELETE_ID_CMLOCATIONREC, rowData);
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMLOCATIONREC, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMLOCATIONREC, rowData);
            }
        }
    }
}
