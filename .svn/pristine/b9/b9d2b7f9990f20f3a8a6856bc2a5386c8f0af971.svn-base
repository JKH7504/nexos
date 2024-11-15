package nexos.dao.cs;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;
import nexos.framework.support.NexosSupport;

/**
 * Class: 권한그룹 프로그램관리 DAO<br>
 * Description: 권한그룹 프로그램관리 DAO (Data Access Object)<br>
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
@Repository("CSC01050E0DAO")
public class CSC01050E0DAOImpl extends DaoSupport implements CSC01050E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CSC01050E0DAOImpl.class);

    final String PROGRAM_ID              = "CSC01050E0";

    final String TABLE_NM_CSPROGRAMROLE  = "CSPROGRAMROLE";
    final String INSERT_ID_CSPROGRAMROLE = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSPROGRAMROLE;
    final String UPDATE_ID_CSPROGRAMROLE = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSPROGRAMROLE;
    final String DELETE_ID_CSPROGRAMROLE = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSPROGRAMROLE;

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String clientIp = (String)params.get("P_CLIENT_IP");

        boolean useSecurityLog = NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false);
        List<String> lstExeLevelChanged = Util.newAnyList();

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_LAST_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);

                insertSql(INSERT_ID_CSPROGRAMROLE, rowData);

                // 실행권한변경 로그
                if (useSecurityLog) {
                    String changedValue = "P_ROLE_GROUP_DIV: " + Util.nullToDefault(rowData.get("P_ROLE_GROUP_DIV"), "null") + "\n" //
                        + "P_PROGRAM_ID: " + Util.nullToDefault(rowData.get("P_PROGRAM_ID"), "null") + "\n" //
                        + "P_CRUD: " + rowCrud + "\n" //
                        + "P_OLD_EXE_LEVEL1: NULL\n" //
                        + "P_NEW_EXE_LEVEL1: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL1"), "NULL") + "\n" //
                        + "P_OLD_EXE_LEVEL2: NULL\n" //
                        + "P_NEW_EXE_LEVEL2: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL2"), "NULL") + "\n" //
                        + "P_OLD_EXE_LEVEL3: NULL\n" //
                        + "P_NEW_EXE_LEVEL3: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL3"), "NULL") + "\n" //
                        + "P_OLD_EXE_LEVEL4: NULL\n" //
                        + "P_NEW_EXE_LEVEL4: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL4"), "NULL") + "\n" //
                        + "P_OLD_EXE_LEVEL5: NULL\n" //
                        + "P_NEW_EXE_LEVEL5: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL5"), "NULL");
                    lstExeLevelChanged.add(changedValue);
                }

            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CSPROGRAMROLE, rowData);

                // 실행권한변경 로그
                if (useSecurityLog) {
                    String changedValue = "";
                    String oldValue = Util.nullToDefault(rowData.get("P_OLD_EXE_LEVEL1"), "NULL");
                    String newValue = Util.nullToDefault(rowData.get("P_EXE_LEVEL1"), "NULL");
                    if (!oldValue.equals(newValue)) {
                        changedValue += "P_OLD_EXE_LEVEL1: " + oldValue + "\n" + "P_NEW_EXE_LEVEL1: " + newValue + "\n";
                    }
                    oldValue = Util.nullToDefault(rowData.get("P_OLD_EXE_LEVEL2"), "NULL");
                    newValue = Util.nullToDefault(rowData.get("P_EXE_LEVEL2"), "NULL");
                    if (!oldValue.equals(newValue)) {
                        changedValue += "P_OLD_EXE_LEVEL2: " + oldValue + "\n" + "P_NEW_EXE_LEVEL2: " + newValue + "\n";
                    }
                    oldValue = Util.nullToDefault(rowData.get("P_OLD_EXE_LEVEL3"), "NULL");
                    newValue = Util.nullToDefault(rowData.get("P_EXE_LEVEL3"), "NULL");
                    if (!oldValue.equals(newValue)) {
                        changedValue += "P_OLD_EXE_LEVEL3: " + oldValue + "\n" + "P_NEW_EXE_LEVEL3: " + newValue + "\n";
                    }
                    oldValue = Util.nullToDefault(rowData.get("P_OLD_EXE_LEVEL4"), "NULL");
                    newValue = Util.nullToDefault(rowData.get("P_EXE_LEVEL4"), "NULL");
                    if (!oldValue.equals(newValue)) {
                        changedValue += "P_OLD_EXE_LEVEL4: " + oldValue + "\n" + "P_NEW_EXE_LEVEL4: " + newValue + "\n";
                    }
                    oldValue = Util.nullToDefault(rowData.get("P_OLD_EXE_LEVEL5"), "NULL");
                    newValue = Util.nullToDefault(rowData.get("P_EXE_LEVEL5"), "NULL");
                    if (!oldValue.equals(newValue)) {
                        changedValue += "P_OLD_EXE_LEVEL5: " + oldValue + "\n" + "P_NEW_EXE_LEVEL5: " + newValue + "\n";
                    }
                    if (Util.isNotNull(changedValue)) {
                        changedValue = "P_ROLE_GROUP_DIV: " + Util.nullToDefault(rowData.get("P_ROLE_GROUP_DIV"), "null") + "\n" //
                            + "P_PROGRAM_ID: " + Util.nullToDefault(rowData.get("P_PROGRAM_ID"), "null") + "\n" //
                            + "P_CRUD: " + rowCrud + "\n" + changedValue; //
                        lstExeLevelChanged.add(changedValue.substring(0, changedValue.length() - 1)); // 마지막 줄바꿈 제거
                    }
                }

            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CSPROGRAMROLE, rowData);

                // 실행권한변경 로그
                if (useSecurityLog) {
                    String changedValue = "P_ROLE_GROUP_DIV: " + Util.nullToDefault(rowData.get("P_ROLE_GROUP_DIV"), "null") + "\n" //
                        + "P_PROGRAM_ID: " + Util.nullToDefault(rowData.get("P_PROGRAM_ID"), "null") + "\n" //
                        + "P_CRUD: " + rowCrud + "\n" //
                        + "P_OLD_EXE_LEVEL1: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL1"), "NULL") + "\n" //
                        + "P_NEW_EXE_LEVEL1: NULL\n" //
                        + "P_OLD_EXE_LEVEL2: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL2"), "NULL") + "\n" //
                        + "P_NEW_EXE_LEVEL2: NULL\n" //
                        + "P_OLD_EXE_LEVEL3: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL3"), "NULL") + "\n" //
                        + "P_NEW_EXE_LEVEL3: NULL\n" //
                        + "P_OLD_EXE_LEVEL4: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL4"), "NULL") + "\n" //
                        + "P_NEW_EXE_LEVEL4: NULL\n" //
                        + "P_OLD_EXE_LEVEL5: " + Util.nullToDefault(rowData.get("P_EXE_LEVEL5"), "NULL") + "\n" //
                        + "P_NEW_EXE_LEVEL5: NULL";
                    lstExeLevelChanged.add(changedValue);
                }

            }
        }

        // 권한 변경 로그
        if (lstExeLevelChanged.size() > 0) {
            Map<String, Object> logParams = Util.newMap();
            logParams.put(Consts.PK_USER_ID, userId);
            logParams.put("P_CLIENT_IP", clientIp);
            logParams.put("P_ACTIVITY_CD", null);
            logParams.put("P_ACTIVITY_DIV", "32"); // 32 - 프로그램실행권한변경
            for (int rIndex = 0, rCount = lstExeLevelChanged.size(); rIndex < rCount; rIndex++) {
                logParams.put("P_ACTIVITY_COMMENT", lstExeLevelChanged.get(rIndex));
                try {
                    writeActivityLog(logParams);
                } catch (Exception e) {
                    //
                }
            }
        }
    }
}
