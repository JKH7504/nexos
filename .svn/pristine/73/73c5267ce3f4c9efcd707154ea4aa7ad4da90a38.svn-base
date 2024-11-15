package nexos.dao.lo;

import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LOB09010E0DAOImpl<br>
 * Description: LOB09010E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-04-26    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LOB09010E0DAO")
public class LOB09010E0DAOImpl extends DaoSupport implements LOB09010E0DAO {

    final String PROGRAM_ID        = "LOB09010E0";

    final String TABLE_NM_LO020NM  = "LO020NM";

    final String UPDATE_ID_LO020NM = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LO020NM;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        Map<String, Object> rowData = (Map<String, Object>)params.get(Consts.PK_MASTER_PARAMS);
        String userId = (String)params.get(Consts.PK_USER_ID);

        String rowCrud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_U.equals(rowCrud)) {
            rowData.put(Consts.PK_USER_ID, userId);
            updateSql(UPDATE_ID_LO020NM, rowData);
        }

    }

}
