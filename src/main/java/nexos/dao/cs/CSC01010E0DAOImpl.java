package nexos.dao.cs;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.DataEncryptor;
import nexos.framework.support.DaoSupport;
import nexos.framework.support.NexosSupport;

/**
 * Class: CSC01010E0DAOImpl<br>
 * Description: CSC01010E0 DAO (Data Access Object)<br>
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
@Repository("CSC01010E0DAO")
public class CSC01010E0DAOImpl extends DaoSupport implements CSC01010E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CSC01010E0DAOImpl.class);

    final String          PROGRAM_ID              = "CSC01010E0";

    final String          TABLE_NM_CSUSER         = "CSUSER";                                        // 사용자마스터
    final String          INSERT_ID_CSUSER        = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSUSER;
    final String          UPDATE_ID_CSUSER        = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSUSER;
    final String          DELETE_ID_CSUSER        = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSUSER;

    final String          TABLE_NM_CSUSERCENTER   = "CSUSERCENTER";                                  // 사용자별운영센터마스터
    final String          INSERT_ID_CSUSERCENTER  = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSUSERCENTER;
    final String          DELETE_ID_CSUSERCENTER  = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSUSERCENTER;

    final String          TABLE_NM_CSUSERBU       = "CSUSERBU";                                      // 사용자별운영브랜드마스터
    final String          INSERT_ID_CSUSERBU      = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSUSERBU;
    final String          DELETE_ID_CSUSERBU      = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSUSERBU;

    final String          TABLE_NM_CSUSERPROGRAM  = "CSUSERPROGRAM";                                 // 사용자별프로그램마스터
    final String          INSERT_ID_CSUSERPROGRAM = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSUSERPROGRAM;
    final String          UPDATE_ID_CSUSERPROGRAM = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSUSERPROGRAM;
    final String          DELETE_ID_CSUSERPROGRAM = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSUSERPROGRAM;

    final String          SP_ID_CS_USER_COPY      = "CS_USER_COPY";
    final String          SP_ID_CS_USER_DELETE    = "CS_USER_DELETE";

    @Autowired
    private DataEncryptor dataEncryptor;

    private String getEncryptUserPwd(String user_Pwd) {

        String result = user_Pwd;

        if (result == null) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.004", "비밀번호가 지정되지 않았습니다."));
        }

        // 암호화 되어 있는 비밀번호일 경우는 암호화 처리하지 않음
        if (result.startsWith(Consts.ENCRYPTED_MSG_PREFIX) && result.endsWith(Consts.ENCRYPTED_MSG_SUFFIX)) {
            return result;
        }

        try {
            result = Consts.ENCRYPTED_MSG_PREFIX + dataEncryptor.encryptHASH(result) + Consts.ENCRYPTED_MSG_SUFFIX;
        } catch (Exception e) {
        }

        return result;
    }

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        List<Map<String, Object>> dsSub = Util.getDataSet(params, Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String clientIp = (String)params.get("P_CLIENT_IP");

        boolean useSecurityLog = NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false);
        List<String> lstCertifyChanged = Util.newAnyList();
        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_LAST_USER_ID, userId); // P_USER_ID 대신 P_LAST_USER_ID 사용, P_USER_ID는 일반 필드

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                if (rowData.containsKey("P_USER_PWD")) {
                    rowData.put("P_USER_PWD", getEncryptUserPwd((String)rowData.get("P_USER_PWD")));
                }
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSUSER, rowData);

                // 권한 변경 로그
                if (useSecurityLog) {
                    String changedValue = "P_USER_ID: " + Util.nullToDefault(rowData.get("P_USER_ID"), "NULL") + "\n" //
                        + "P_CRUD: " + rowCrud + "\n" //
                        + "P_OLD_CERTIFY_DIV: NULL\n" //
                        + "P_NEW_CERTIFY_DIV: " + Util.nullToDefault(rowData.get("P_CERTIFY_DIV"), "NULL") + "\n" //
                        + "P_OLD_ROLE_GROUP_DIV: NULL\n" //
                        + "P_NEW_ROLE_GROUP_DIV: " + Util.nullToDefault(rowData.get("P_ROLE_GROUP_DIV"), "NULL");
                    lstCertifyChanged.add(changedValue);
                }

            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                if (rowData.containsKey("P_USER_PWD")) {
                    rowData.put("P_USER_PWD", getEncryptUserPwd((String)rowData.get("P_USER_PWD")));
                }
                Object orgUserPwd = rowData.get("P_ORG_USER_PWD");
                if (orgUserPwd != null && !orgUserPwd.equals(rowData.get("P_USER_PWD"))) {
                    rowData.put("P_PWD_LAST_DATE", "");
                }
                updateSql(UPDATE_ID_CSUSER, rowData);

                // 권한 변경 로그
                if (useSecurityLog) {
                    String changedValue = "";
                    String oldValue = Util.nullToDefault(rowData.get("P_OLD_CERTIFY_DIV"), "NULL");
                    String newValue = Util.nullToDefault(rowData.get("P_CERTIFY_DIV"), "NULL");
                    if (!oldValue.equals(newValue)) {
                        changedValue += "P_OLD_CERTIFY_DIV: " + oldValue + "\n" + "P_NEW_CERTIFY_DIV: " + newValue + "\n";
                    }
                    oldValue = Util.nullToDefault(rowData.get("P_OLD_ROLE_GROUP_DIV"), "NULL");
                    newValue = Util.nullToDefault(rowData.get("P_ROLE_GROUP_DIV"), "NULL");
                    if (!oldValue.equals(newValue)) {
                        changedValue += "P_OLD_ROLE_GROUP_DIV: " + oldValue + "\n" + "P_NEW_ROLE_GROUP_DIV: " + newValue + "\n";
                    }
                    if (Util.isNotNull(changedValue)) {
                        changedValue = "P_USER_ID: " + Util.nullToDefault(rowData.get("P_USER_ID"), "NULL") + "\n" //
                            + "P_CRUD: " + rowCrud + "\n" + changedValue;
                        lstCertifyChanged.add(changedValue.substring(0, changedValue.length() - 1)); // 마지막 줄바꿈 제거
                    }
                }

            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CSUSER, rowData);

                // 권한 변경 로그
                if (useSecurityLog) {
                    String changedValue = "P_USER_ID: " + Util.nullToDefault(rowData.get("P_USER_ID"), "NULL") + "\n" //
                        + "P_CRUD: " + rowCrud + "\n" //
                        + "P_OLD_CERTIFY_DIV: " + Util.nullToDefault(rowData.get("P_OLD_CERTIFY_DIV"), "NULL") + "\n" //
                        + "P_NEW_CERTIFY_DIV: NULL\n" //
                        + "P_OLD_ROLE_GROUP_DIV: " + Util.nullToDefault(rowData.get("P_OLD_ROLE_GROUP_DIV"), "NULL") + "\n" //
                        + "P_NEW_ROLE_GROUP_DIV: NULL";
                    lstCertifyChanged.add(changedValue);
                }

            }
        }

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_LAST_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSUSERCENTER, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CSUSERCENTER, rowData);
            }
        }

        for (int rIndex = 0, rCount = dsSub.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsSub.get(rIndex);
            rowData.put(Consts.PK_LAST_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSUSERBU, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CSUSERBU, rowData);
            }
        }

        // 권한 변경 로그
        if (lstCertifyChanged.size() > 0) {
            Map<String, Object> logParams = Util.newMap();
            logParams.put(Consts.PK_USER_ID, userId);
            logParams.put("P_CLIENT_IP", clientIp);
            logParams.put("P_ACTIVITY_CD", null);
            logParams.put("P_ACTIVITY_DIV", "31"); // 31 - 사용자권한변경
            for (int rIndex = 0, rCount = lstCertifyChanged.size(); rIndex < rCount; rIndex++) {
                logParams.put("P_ACTIVITY_COMMENT", lstCertifyChanged.get(rIndex));
                try {
                    writeActivityLog(logParams);
                } catch (Exception e) {
                    //
                }
            }
        }
    }

    @Override
    public void saveUserProgram(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_LAST_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSUSERPROGRAM, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                if (updateSql(UPDATE_ID_CSUSERPROGRAM, rowData) == 0) {
                    rowData.put(Consts.PK_REG_USER_ID, userId);
                    rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                    insertSql(INSERT_ID_CSUSERPROGRAM, rowData);
                }
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CSUSERPROGRAM, rowData);
            }
        }
    }

    @Override
    public Map<String, Object> callUserCopy(Map<String, Object> params) throws Exception {

        // 비밀번호 암호화 처리
        if (params.containsKey("P_USER_PWD")) {
            params.put("P_USER_PWD", getEncryptUserPwd((String)params.get("P_USER_PWD")));
        }
        params.put("P_ACTIVITY_LOG_YN", NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false) ? Consts.YES : Consts.NO);

        return callProcedure(SP_ID_CS_USER_COPY, params);
    }

    @Override
    public Map<String, Object> callUserDelete(Map<String, Object> params) throws Exception {

        params.put("P_ACTIVITY_LOG_YN", NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false) ? Consts.YES : Consts.NO);
        return callProcedure(SP_ID_CS_USER_DELETE, params);
    }
}
