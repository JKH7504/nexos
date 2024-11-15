package nexos.dao.li;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LIC05050E0DAOImpl<br>
 * Description: LIC05050E0 DAO (Data Access Object)<br>
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
@Repository("LIC05050E0DAO")
public class LIC05050E0DAOImpl extends DaoSupport implements LIC05050E0DAO {

    final String PROGRAM_ID        = "LIC05050E0";

    final String TABLE_NM_LI070NM  = "LI070NM";
    final String INSERT_ID_LI070NM = PROGRAM_ID + ".INSERT_" + TABLE_NM_LI070NM;
    final String UPDATE_ID_LI070NM = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LI070NM;
    final String DELETE_ID_LI070NM = PROGRAM_ID + ".DELETE_" + TABLE_NM_LI070NM;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);
        Map<String, Object> rowData = (Map<String, Object>)params.get(Consts.PK_MASTER_PARAMS);
        // 기존 데이터 전체 삭제
        deleteSql(DELETE_ID_LI070NM, rowData);

        for (int rIndex = 0, rCount = dsSub.size(); rIndex < rCount; rIndex++) {
            rowData = dsSub.get(rIndex);
            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_LAST_USER_ID, userId);
                rowData.put(Consts.PK_LAST_DATETIME, Consts.DV_SYSDATE);

                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                rowData.put(Consts.PK_LAST_USER_ID, userId);
                rowData.put(Consts.PK_LAST_DATETIME, Consts.DV_SYSDATE);
            }
            insertSql(INSERT_ID_LI070NM, rowData);
        }
    }
}
