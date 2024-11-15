package nexos.dao.lf;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LFC05080E0DAOImpl<br>
 * Description: LFC05080E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-04-13    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LFC05080E0DAO")
public class LFC05080E0DAOImpl extends DaoSupport implements LFC05080E0DAO {

    final String PROGRAM_ID        = "LFC05080E0";

    final String TABLE_NM_LF610NM  = "LF610NM";
    final String UPDATE_ID_LF610NM = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LF610NM;

    final String SP_ID_GET_PROTECT = "WF.GET_PROTECT";

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        // DataSet 처리
        int dsCnt = dsMaster.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsMaster.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            Map<String, Object> callParams;

            // 보안 설정 CHECK SP 호출
            callParams = new HashMap<String, Object>();
            callParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
            callParams.put("P_BU_CD", rowData.get("P_BU_CD"));
            callParams.put("P_PROTECT_DATE", rowData.get("P_INOUT_DATE"));

            Map<String, Object> resultMap = callProcedure(SP_ID_GET_PROTECT, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LF610NM, rowData);
            }
        }
    }
}
