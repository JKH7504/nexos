package nexos.dao.cs;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CSC07010E0DAOImpl<br>
 * Description: CSC07010E0 DAO (Data Access Object)<br>
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
@Repository("CSC07010E0DAO")
public class CSC07010E0DAOImpl extends DaoSupport implements CSC07010E0DAO {

    final String PROGRAM_ID              = "CSC07010E0";

    final String TABLE_NM_CSREPORT       = "CSREPORT";
    final String INSERT_ID_CSREPORT      = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSREPORT;
    final String UPDATE_ID_CSREPORT      = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSREPORT;
    final String DELETE_ID_CSREPORT      = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSREPORT;

    final String TABLE_NM_CSREPORTDOC    = "CSREPORTDOC";
    final String INSERT_ID_CSREPORTDOC   = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSREPORTDOC;
    final String UPDATE_ID_CSREPORTDOC   = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSREPORTDOC;
    final String DELETE_ID_CSREPORTDOC   = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSREPORTDOC;

    final String TABLE_NM_CSBUREPORTDOC  = "CSBUREPORTDOC";
    final String DELETE_ID_CSBUREPORTDOC = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSBUREPORTDOC;

    @Override
    public void saveReport(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSREPORT, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CSREPORT, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 삭제는 SP 호출로 처리
            }
        }
    }

    @Override
    public void saveReportDoc(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSREPORTDOC, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CSREPORTDOC, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 삭제일 경우 사업부레포트 먼저 삭제
                deleteSql(DELETE_ID_CSBUREPORTDOC, rowData);
                deleteSql(DELETE_ID_CSREPORTDOC, rowData);
            }
        }
    }

}
