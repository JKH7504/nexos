package nexos.dao.ed;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: EDC01020E0DAOImpl<br>
 * Description: EDC01020E0 DAO (Data Access Object)<br>
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
@Repository("EDC01020E0DAO")
public class EDC01020E0DAOImpl extends DaoSupport implements EDC01020E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(EDC01020E0DAOImpl.class);
    final String PROGRAM_ID              = "EDC01020E0";

    final String TABLE_NM_EMINTERFACE    = "EMINTERFACE";

    final String INSERT_ID_EMINTERFACE   = PROGRAM_ID + ".INSERT_" + TABLE_NM_EMINTERFACE;
    final String UPDATE_ID_EMINTERFACE   = PROGRAM_ID + ".UPDATE_" + TABLE_NM_EMINTERFACE;
    final String DELETE_ID_EMINTERFACE   = PROGRAM_ID + ".DELETE_" + TABLE_NM_EMINTERFACE;

    final String SP_ID_EM_INTERFACE_COPY = "EM_INTERFACE_COPY";

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_EMINTERFACE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_EMINTERFACE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_EMINTERFACE, rowData);
            }
        }
    }

    @Override
    public Map<String, Object> callEMInterfaceCopy(Map<String, Object> params) throws Exception {

        // 선택 값 CTCHECKVALUE 테이블에 INSERT
        String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);
        Map<String, Object> checkedParams = new HashMap<String, Object>();
        checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
        insertCheckedValue(checkedParams);

        // 프로시저 호출
        return callProcedure(SP_ID_EM_INTERFACE_COPY, params);
    }
}
