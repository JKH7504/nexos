package nexos.dao.ed;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: WCDAOImpl<br>
 * Description: EDS01010E0 DAO (Data Access Object)<br>
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
@Repository("EDS01010E0DAO")
public class EDS01010E0DAOImpl extends DaoSupport implements EDS01010E0DAO {

    final String PROGRAM_ID                = "EDS01010E0";

    final String TABLE_NM_EMDEFINE         = "EMDEFINE";
    final String INSERT_ID_EMDEFINE        = PROGRAM_ID + ".INSERT_" + TABLE_NM_EMDEFINE;
    final String UPDATE_ID_EMDEFINE        = PROGRAM_ID + ".UPDATE_" + TABLE_NM_EMDEFINE;
    final String DELETE_ID_EMDEFINE        = PROGRAM_ID + ".DELETE_" + TABLE_NM_EMDEFINE;

    final String TABLE_NM_EMDEFINESUB      = "EMDEFINESUB";
    final String INSERT_ID_EMDEFINESUB     = PROGRAM_ID + ".INSERT_" + TABLE_NM_EMDEFINESUB;
    final String UPDATE_ID_EMDEFINESUB     = PROGRAM_ID + ".UPDATE_" + TABLE_NM_EMDEFINESUB;
    final String DELETE_ID_EMDEFINESUB     = PROGRAM_ID + ".DELETE_" + TABLE_NM_EMDEFINESUB;

    final String SP_ID_EM_DEFINE_SEND_COPY = "EM_DEFINE_SEND_COPY";

    @Override
    public void saveMaster(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_EMDEFINE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_EMDEFINE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 인터페이스 송신정의 디테일 삭제
                deleteSql(DELETE_ID_EMDEFINESUB, rowData);
                deleteSql(DELETE_ID_EMDEFINE, rowData);
            }
        }
    }

    @Override
    public void saveDetail(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_EMDEFINESUB, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_EMDEFINESUB, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_EMDEFINESUB, rowData);
            }
        }
    }

    @Override
    public Map<String, Object> callEMDefineSendCopy(Map<String, Object> params) throws Exception {

        // 선택 값 CTCHECKVALUE 테이블에 INSERT
        String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);
        Map<String, Object> checkedParams = new HashMap<String, Object>();
        checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
        insertCheckedValue(checkedParams);

        // 프로시저 호출
        return callProcedure(SP_ID_EM_DEFINE_SEND_COPY, params);
    }
}
