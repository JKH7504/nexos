package nexos.dao.ld;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LDC03040Q0DAOImpl<br>
 * Description: LDC03040Q0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-05-06    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LDC03040Q0DAO")
public class LDC03040Q0DAOImpl extends DaoSupport implements LDC03040Q0DAO {

    final String PROGRAM_ID                = "LDC03040Q0";

    final String TABLE_NM_LO020NM          = "LO020NM";
    final String SP_ID_LO_020NM_MSG_UPDATE = "LO_020NM_MSG_UPDATE";

    @Override
    @SuppressWarnings("unchecked")
    public void saveMsgChange(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                Map<String, Object> resultMap = callProcedure(SP_ID_LO_020NM_MSG_UPDATE, rowData);

                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);

                }
            }
        }
    }
}
