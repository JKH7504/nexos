package nexos.dao.cs;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CSC06010E0DAOImpl<br>
 * Description: CSC06010E0 DAO (Data Access Object)<br>
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
@Repository("CSC06010E0DAO")
public class CSC06010E0DAOImpl extends DaoSupport implements CSC06010E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CSC06010E0DAOImpl.class);

    final String PROGRAM_ID               = "CSC06010E0";
    final String TABLE_NM_CSDISPLAY       = "CSDISPLAY";
    final String INSERT_ID_CSDISPLAY      = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSDISPLAY;
    final String UPDATE_ID_CSDISPLAY      = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSDISPLAY;
    final String DELETE_ID_CSDISPLAY      = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSDISPLAY;

    final String TABLE_NM_CSCHILDDISPLAY  = "CSCHILDDISPLAY";
    final String INSERT_ID_CSCHILDDISPLAY = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSCHILDDISPLAY;
    final String UPDATE_ID_CSCHILDDISPLAY = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSCHILDDISPLAY;
    final String DELETE_ID_CSCHILDDISPLAY = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSCHILDDISPLAY;

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
                insertSql(INSERT_ID_CSDISPLAY, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CSDISPLAY, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 화면표시그룹 삭제일 경우 메시지그룹 먼저 전체 삭제
                deleteSql(DELETE_ID_CSCHILDDISPLAY, rowData);
                deleteSql(DELETE_ID_CSDISPLAY, rowData);
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
                insertSql(INSERT_ID_CSCHILDDISPLAY, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CSCHILDDISPLAY, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CSCHILDDISPLAY, rowData);
            }
        }
    }

}
