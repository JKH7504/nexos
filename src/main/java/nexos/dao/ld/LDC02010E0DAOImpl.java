package nexos.dao.ld;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LDC02010E0DAOImpl<br>
 * Description: LDC02010E0 DAO (Data Access Object)<br>
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
@Repository("LDC02010E0DAO")
public class LDC02010E0DAOImpl extends DaoSupport implements LDC02010E0DAO {

    final String SP_ID_LD_FW_CHANGE_CAR_T1 = "LD_FW_CHANGE_DOCK_T1";
    final String SP_ID_LD_FW_CHANGE_CAR_T2 = "LD_FW_CHANGE_DOCK_T2";
    final String SP_ID_LD_FW_CHANGE_CAR_T3 = "LD_FW_CHANGE_DOCK_T2";

    final String CHANGE_TYPE_DOCK          = "1";
    final String CHANGE_TYPE_OUTBOUND      = "2";
    final String CHANGE_TYPE_DELIVERY      = "3";

    @Override
    @SuppressWarnings("unchecked")
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String changeType = (String)params.get("P_CHANGE_TYPE");
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        if (CHANGE_TYPE_DOCK.equals(changeType)) {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsSave.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud) || Consts.DV_CRUD_U.equals(rowCrud)) {
                    // 도크변경 처리 sp 호출
                    Map<String, Object> resultMap = callProcedure(SP_ID_LD_FW_CHANGE_CAR_T1, rowData);

                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                }
            }
        } else if (CHANGE_TYPE_OUTBOUND.equals(changeType)) {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsSave.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud) || Consts.DV_CRUD_U.equals(rowCrud)) {
                    // 도크변경 처리 sp 호출
                    Map<String, Object> resultMap = callProcedure(SP_ID_LD_FW_CHANGE_CAR_T2, rowData);

                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                }
            }
        } else if (CHANGE_TYPE_DELIVERY.equals(changeType)) {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsSave.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud) || Consts.DV_CRUD_U.equals(rowCrud)) {
                    // 도크변경 처리 sp 호출
                    Map<String, Object> resultMap = callProcedure(SP_ID_LD_FW_CHANGE_CAR_T3, rowData);

                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                }
            }
        }
    }

}
