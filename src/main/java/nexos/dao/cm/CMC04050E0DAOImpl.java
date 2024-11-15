package nexos.dao.cm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: WCDAOImpl<br>
 * Description: CMC04050E0 DAO (Data Access Object)<br>
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
@Repository("CMC04050E0DAO")
public class CMC04050E0DAOImpl extends DaoSupport implements CMC04050E0DAO {

    final String PROGRAM_ID                         = "CMC04050E0";

    final String TABLE_NM_CMCENTERITEM              = "CMCENTERITEM";
    final String UPDATE_ID_CMCENTERITEM             = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMCENTERITEM;
    final String DELETE_ID_CMCENTERITEM             = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMCENTERITEM;
    final String INSERT_ID_CMCENTERITEM             = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMCENTERITEM;

    final String SP_ID_CM_CENTERITEM_CHECK_ALLOCATE = "CM_CENTERITEM_CHECK_ALLOCATE";
    final String SP_ID_CM_CENTERITEM_ENTRYXLS       = "CM_CENTERITEM_ENTRYXLS";

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMCENTERITEM, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMCENTERITEM, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMCENTERITEM, rowData);
            }
        }

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMCENTERITEM, rowData);
            }
        }
    }

    @Override
    public String callCenterItemCheckAllocate(Map<String, Object> params) throws Exception {

        String result = Consts.OK;

        Map<String, Object> resultMap = null;
        String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);

        // 선택 값 CTCHECKVALUE 테이블에 INSERT
        Map<String, Object> checkedParams = new HashMap<String, Object>();
        checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
        insertCheckedValue(checkedParams);

        resultMap = callProcedure(SP_ID_CM_CENTERITEM_CHECK_ALLOCATE, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        return result;
    }

}
