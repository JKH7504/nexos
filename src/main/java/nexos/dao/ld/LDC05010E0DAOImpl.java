package nexos.dao.ld;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LDC05010E0DAOImpl<br>
 * Description: LDC05010E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2020-10-07    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LDC05010E0DAO")
public class LDC05010E0DAOImpl extends DaoSupport implements LDC05010E0DAO {

    final String PROGRAM_ID                  = "LDC05010E0";

    final String TABLE_NM_LD060NM            = "LD060NM";
    final String UPDATE_ID_LD060NM           = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LD060NM;

    final String SP_ID_LD_FW_INIT_LD060NM    = "LD_FW_INIT_LD060NM";
    final String SP_ID_LD_BW_CLOSING_MONTHLY = "LD_BW_CLOSING_MONTHLY";
    final String SP_ID_LD_FW_CLOSING_MONTHLY = "LD_FW_CLOSING_MONTHLY";

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
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LD060NM, rowData);
            }
        }
    }

    @Override
    public Map<String, Object> callLDBwClosingMonthly(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LD_BW_CLOSING_MONTHLY, params);
    }

    @Override
    public Map<String, Object> callCreateData(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LD_FW_INIT_LD060NM, params);
    }

    @Override
    public Map<String, Object> callIntermediateClosing(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LD_FW_CLOSING_MONTHLY, params);
    }

}
