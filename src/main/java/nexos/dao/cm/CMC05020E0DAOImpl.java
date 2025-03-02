package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: WCDAOImpl<br>
 * Description: CMC05020E0 DAO (Data Access Object)<br>
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
@Repository("CMC05020E0DAO")
public class CMC05020E0DAOImpl extends DaoSupport implements CMC05020E0DAO {

    final String PROGRAM_ID              = "CMC05020E0";

    final String TABLE_NM_CMLOCATIONRTN  = "CMLOCATIONRTN";
    final String INSERT_ID_CMLOCATIONRTN = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMLOCATIONRTN;
    final String UPDATE_ID_CMLOCATIONRTN = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMLOCATIONRTN;
    final String DELETE_ID_CMLOCATIONRTN = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMLOCATIONRTN;

    final String SP_ID_CHK_LOCATION      = "WF.CHK_LOCATION_02";

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String policyCM120 = (String)params.get("P_POLICY_CM120");

        Map<String, Object> callParams = Util.newMap();
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

                // 로케이션 체크
                callParams.clear();
                callParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
                callParams.put("P_ZONE_CD", rowData.get("P_ZONE_CD"));
                callParams.put("P_BANK_CD", rowData.get("P_BANK_CD"));
                callParams.put("P_BAY_CD", rowData.get("P_BAY_CD"));
                callParams.put("P_LEV_CD", rowData.get("P_LEV_CD"));

                Map<String, Object> resultMap = callProcedure(SP_ID_CHK_LOCATION, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }

                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMLOCATIONRTN, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMLOCATIONRTN, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMLOCATIONRTN, rowData);
            }
        }
    }
}
