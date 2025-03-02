package nexos.dao.cs;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CSC01020E0DAOImpl<br>
 * Description: CSC01020E0 DAO (Data Access Object)<br>
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
@Repository("CSC01020E0DAO")
public class CSC01020E0DAOImpl extends DaoSupport implements CSC01020E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CSC01020E0DAOImpl.class);

    final String PROGRAM_ID                   = "CSC01020E0";

    final String TABLE_NM_CSPROGRAM           = "CSPROGRAM";
    final String INSERT_ID_CSPROGRAM          = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSPROGRAM;
    final String UPDATE_ID_CSPROGRAM          = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSPROGRAM;
    final String DELETE_ID_CSPROGRAM          = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSPROGRAM;

    final String TABLE_NM_CSPROGRAMREPORTDOC  = "CSPROGRAMREPORTDOC";
    final String INSERT_ID_CSPROGRAMREPORTDOC = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSPROGRAMREPORTDOC;
    final String UPDATE_ID_CSPROGRAMREPORTDOC = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSPROGRAMREPORTDOC;
    final String DELETE_ID_CSPROGRAMREPORTDOC = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSPROGRAMREPORTDOC;

    final String PROGRAM_DIV_MENU             = "M";

    @Override
    public void saveProgram(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSPROGRAM, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CSPROGRAM, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 프로그램삭제는 SP 호출로 처리
            }
        }
    }

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
                insertSql(INSERT_ID_CSPROGRAMREPORTDOC, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CSPROGRAMREPORTDOC, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CSPROGRAMREPORTDOC, rowData);
            }
        }
    }
}
