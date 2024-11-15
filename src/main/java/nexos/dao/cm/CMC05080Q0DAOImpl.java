package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: CMC05080Q0Impl<br>
 * Description: CMC05080Q0 DAO (Data Access Object)<br>
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
@Repository("CMC05080Q0DAO")
public class CMC05080Q0DAOImpl extends DaoSupport implements CMC05080Q0DAO {

    final String PROGRAM_ID             = "CMC05080Q0";

    final String TABLE_NM_CMSHIPID      = "CMSHIPID";
    final String UPDATE_ID_CMSHIPID     = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMSHIPID;

    final String SP_ID_CM_SHIPID_GETNOS = "WT.CM_SHIPID_GETNOS";

    @Override
    @SuppressWarnings("unchecked")
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_REG_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMSHIPID, rowData);
            }
        }
    }

    @Override
    public Map<String, Object> callShipIdGetNo(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_CM_SHIPID_GETNOS, params);
    }
}
