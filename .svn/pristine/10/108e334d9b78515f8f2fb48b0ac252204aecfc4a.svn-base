package nexos.dao.ld;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: LDC01010E0DAOImpl<br>
 * Description: LDC01010E0 DAO (Data Access Object)<br>
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
@Repository("LDC01010E0DAO")
public class LDC01010E0DAOImpl extends DaoSupport implements LDC01010E0DAO {

    final String SP_ID_LD_FW_CHANGE_CAR_T1 = "LD_FW_CHANGE_CAR_T1";
    final String SP_ID_LD_FW_CHANGE_CAR_T2 = "LD_FW_CHANGE_CAR_T2";
    final String SP_ID_LD_FW_CHANGE_CAR_T3 = "LD_FW_CHANGE_CAR_T3";
    final String SP_ID_LD_FW_SPLIT_ORDER   = "LD_FW_SPLIT_ORDER";
    final String SP_ID_LO_020NM_MSG_UPDATE = "LO_020NM_MSG_UPDATE";

    final String CHANGE_TYPE_CAR           = "1";
    final String CHANGE_TYPE_OUTBOUND      = "2";
    final String CHANGE_TYPE_LINE          = "3";

    @Override
    @SuppressWarnings("unchecked")
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String changeType = (String)params.get("P_CHANGE_TYPE");
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        if (CHANGE_TYPE_CAR.equals(changeType)) {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsSave.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud) || Consts.DV_CRUD_U.equals(rowCrud)) {
                    // 차량변경 처리 sp 호출
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
                    // 차량변경 처리 sp 호출
                    Map<String, Object> resultMap = callProcedure(SP_ID_LD_FW_CHANGE_CAR_T2, rowData);

                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                }
            }
        } else if (CHANGE_TYPE_LINE.equals(changeType)) {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsSave.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud) || Consts.DV_CRUD_U.equals(rowCrud)) {
                    // 차량변경 처리 sp 호출
                    Map<String, Object> resultMap = callProcedure(SP_ID_LD_FW_CHANGE_CAR_T3, rowData);

                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                }
            }
        }
    }

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

    @Override
    @SuppressWarnings("unchecked")
    public void saveSplitOrder(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                Map<String, Object> resultMap = callProcedure(SP_ID_LD_FW_SPLIT_ORDER, rowData);

                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
        }
    }

}
