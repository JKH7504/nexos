package nexos.dao.common;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.sql.PreparedStatement;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import com.github.pjfanning.xlsx.StreamingReader;
import com.github.pjfanning.xlsx.exceptions.NotSupportedException;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.event.SqlMapperReloadedEvent;
import nexos.framework.json.JsonDataSet;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.DataEncryptor;
import nexos.framework.support.DaoSupport;
import nexos.framework.support.NexosSupport;

/**
 * Class: WCDAOImpl<br>
 * Description: WMS Common DAO (Data Access Object)<br>
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
@Repository("WCDAO")
public class WCDAOImpl extends DaoSupport implements WCDAO {

    private final Logger              logger                               = LoggerFactory.getLogger(WCDAOImpl.class);

    final String                      PROGRAM_ID                           = "WC";
    final String                      SELECT_ID_GET_LOGIN                  = PROGRAM_ID + ".GET_LOGIN";
    final String                      SELECT_ID_GET_RESET_USER_PWD         = PROGRAM_ID + ".GET_RESET_USER_PWD";
    final String                      SELECT_ID_GET_CSUSERPROGRAM          = PROGRAM_ID + ".GET_CSUSERPROGRAM";

    final String                      TABLE_NM_CSUSER                      = "CSUSER";
    final String                      UPDATE_ID_CSUSER                     = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSUSER;

    final String                      TABLE_NM_CSUSERGRIDLAYOUT            = "CSUSERGRIDLAYOUT";
    final String                      INSERT_ID_CSUSERGRIDLAYOUT           = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSUSERGRIDLAYOUT;
    final String                      UPDATE_ID_CSUSERGRIDLAYOUT           = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSUSERGRIDLAYOUT;
    final String                      DELETE_ID_CSUSERGRIDLAYOUT           = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSUSERGRIDLAYOUT;

    final String                      SP_ID_GET_SYSDATE                    = PROGRAM_ID + ".GET_SYSDATE";
    final String                      SP_ID_CS_USER_PWD_CHANGE_RULES_CHECK = "CS_USER_PWD_CHANGE_RULES_CHECK";
    final String                      SP_ID_CS_USER_PWD_UPDATE             = "CS_USER_PWD_UPDATE";
    final String                      SP_ID_CS_USERSYSINFO_UPDATE          = "CS_USERSYSINFO_UPDATE";

    @Autowired
    @Qualifier("dataEncryptor")
    private DataEncryptor             dataEncryptor;

    @Autowired
    private ApplicationEventPublisher appEventPublisher;

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @Override
    public String getEncryptHash(String value) {

        // Null이면 리턴
        if (Util.isNull(value)) {
            return value;
        }

        // 암호화되어 있으면 리턴
        if (value.startsWith(Consts.ENCRYPTED_MSG_PREFIX) && value.endsWith(Consts.ENCRYPTED_MSG_SUFFIX)) {
            return value;
        }

        try {
            // 암호화해서 ENC(암호화 값) 리턴
            return Consts.ENCRYPTED_MSG_PREFIX + dataEncryptor.encryptHASH(value) + Consts.ENCRYPTED_MSG_SUFFIX;
        } catch (Exception e) {
            // 암호화 오류시 원값 리턴
            return value;
        }
    }

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @Override
    public boolean equalUserPwd(String userPwd, String savedUserPwd) {

        if (Util.isNull(userPwd) || Util.isNull(savedUserPwd)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.004", "비밀번호가 지정되지 않았습니다."));
        }

        return getEncryptHash(savedUserPwd).equals(getEncryptHash(userPwd));
    }

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @Override
    public Map<String, Object> getLogin(Map<String, Object> params) {

        // 사용자정보 조회
        List<Map<String, Object>> lstUserInfo = getDataList(SELECT_ID_GET_LOGIN, params);

        if (lstUserInfo.size() == 0) {
            if (!NexosSupport.getGlobalBooleanProperty("CONFIG.LOGIN.SIMPLE_ERROR_MESSAGE", false)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.007", "사용자ID가 존재하지 않습니다."));
            } else {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.XXX", "로그인에 실패했습니다."));
            }
        }

        return lstUserInfo.get(0);
    }

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @Override
    public Map<String, Object> getResetUserPwd(Map<String, Object> params) {

        // 사용자 비밀번호 초기화 정보 검색
        List<Map<String, Object>> lstResetUserPwdInfo = getDataList(SELECT_ID_GET_RESET_USER_PWD, params);

        if (lstResetUserPwdInfo.size() == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.020", "입력한 정보와 일치하는 사용자가 존재하지 않습니다."));
        }

        return lstResetUserPwdInfo.get(0);
    }

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @Override
    public Map<String, Object> callCSUserSysInfoUpdate(Map<String, Object> params) {

        return callProcedure(SP_ID_CS_USERSYSINFO_UPDATE, params);
    }

    /**
     * 사용자 정보 변경
     *
     * @param params
     * @throws Exception
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @Override
    public void updateCSUser(Map<String, Object> params) {

        int update = updateSql(UPDATE_ID_CSUSER, params);

        if (update == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.007", "사용자ID가 존재하지 않습니다."));
        }
    }

    /**
     * 사용자 비밀번호 변경 규칙 체크
     *
     * @param params
     * @throws Exception
     */
    @Override
    public Map<String, Object> callCSUserPwdChangeRulesCheck(Map<String, Object> params) {

        return callProcedure(SP_ID_CS_USER_PWD_CHANGE_RULES_CHECK, params);
    }

    /**
     * 사용자 비밀번호 변경
     *
     * @param params
     * @throws Exception
     */
    @Override
    public Map<String, Object> callCSUserPwdUpdate(Map<String, Object> params) {

        return callProcedure(SP_ID_CS_USER_PWD_UPDATE, params);
    }

    /**
     * sqlmap 파일 다시 읽기
     */
    @Override
    public String reloadSqlMap() {

        String result = Consts.ERROR;

        try {
            SqlSessionFactoryBean sqlSessionFactory = NexosSupport.getBean(SqlSessionFactoryBean.class);
            // afterPropertiesSet에서 MapperLocations를 다시 읽지 않아서 재세팅 후 처리
            org.springframework.core.io.Resource[] sqlmapResources = NexosSupport.getApplicationContext().getResources("classpath:/nexos/sqlmap/" //
                + NexosSupport.getGlobalProperty("DB.TYPE") + "/**/*_sqlmap.xml");
            sqlSessionFactory.setMapperLocations(sqlmapResources);
            sqlSessionFactory.afterPropertiesSet();

            appEventPublisher.publishEvent(new SqlMapperReloadedEvent(this, sqlSessionFactory.getObject()));

            result = Consts.OK;
        } catch (Exception e) {
            return Util.getErrorMessage(e);
        }

        return result;
    }

    /**
     * Java/DB 메시지 다시 읽기
     *
     * @return
     */
    @Override
    public String reloadDisplayMsg() {

        String result = Consts.ERROR;

        try {
            NexosMessage.reloadDisplayMsg();

            result = Consts.OK;
        } catch (Exception e) {
            return Util.getErrorMessage(e);
        }

        return result;
    }

    @Override
    public List<Map<String, Object>> getUserProgramMenu(Map<String, Object> params) {

        return getDataList(SELECT_ID_GET_CSUSERPROGRAM, params);
    }

    @Override
    public List<Map<String, Object>> getUserProgramMenuTree(List<Map<String, Object>> list) {

        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        if (list == null || list.size() == 0) {
            return result;
        }

        Iterator<Map<String, Object>> iterator = list.iterator();
        Map<String, Object> rowData = null;

        /*
         * Tree 데이터 구조
         * [
         * { "id": "id_1", "PROGRAM_ID": "CS0000000M", .. , "EXE_LEVEL4": "Y", indent:"0", parent:"" },
         * { "id": "id_2", "PROGRAM_ID": "CSC01010E0", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"1" },
         * { "id": "id_3", "PROGRAM_ID": "CM0000000M", .. , "EXE_LEVEL4": "Y", indent:"0", parent:"" },
         * { "id": "id_4", "PROGRAM_ID": "CMC01010E0", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"3" },
         * { "id": "id_5", "PROGRAM_ID": "CMC01020E0", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"3" }
         * ]
         */
        while (iterator.hasNext()) {
            rowData = iterator.next();

            Map<String, Object> menuData = new HashMap<String, Object>();

            menuData.putAll(rowData);
            menuData.put(Consts.DK_ID, Consts.DV_ID_PREFIX + String.valueOf(rowData.get("ROW_ID")));
            menuData.put("indent", String.valueOf(rowData.get("MENU_INDENT")));
            String parent = String.valueOf(rowData.get("PARENT_ID"));
            if (Util.isNotNull(parent)) {
                parent = Consts.DV_ID_PREFIX + parent;
            } else {
                parent = "";
            }
            menuData.put("parent", parent);
            menuData.put("_collapsed", true);

            result.add(menuData);
        }

        return result;
    }

    @Override
    public Map<String, Object> excelExport(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = new HashMap<String, Object>();

        final String PK_XLS_FILE_FULL_NM = "O_XLS_FILE_FULL_NM";
        final String DEF_XLS_SHEET_NAME = "EXPORT";
        final String DEF_XLS_EXPORT_TYPE = "2"; // 1 - 그리드, 2 - 데이터셋
        final int DEF_XLS_FREEZE_ROW = 1;
        final String DEF_XLS_DATA_MASK_YN = Consts.YES;

        // 파라메터 값 읽기
        String xlsSheetName = Util.nullToDefault(params.get("P_XLS_SHEET_NAME"), DEF_XLS_SHEET_NAME);
        String xlsExportType = Util.nullToDefault(params.get("P_EXPORT_TYPE"), DEF_XLS_EXPORT_TYPE);
        int xlsFreezeRow = Util.toInt(params.get("P_EXCEL_FREEZE_ROW"), DEF_XLS_FREEZE_ROW);
        boolean xlsDataMask = Consts.YES.equals(Util.nullToDefault(params.get("P_XLS_DATA_MASK_YN"), DEF_XLS_DATA_MASK_YN));
        List<Map<String, Object>> columnInfo = Util.getDataSet(params, "P_COLUMN_INFO");
        String queryId = (String)params.get(Consts.PK_QUERY_ID);
        Map<String, Object> queryParams = Util.getParameter(params, Consts.PK_QUERY_PARAMS);
        String userId = (String)params.get(Consts.PK_USER_ID);

        String xlsVersion = NexosSupport.getGlobalProperty("XLS.VERSION", "xls"); // xls - 70 ~ 2003, xlsx - 2003 이후
        // 서버 파일명 지정
        String xlsFileName = Util.replaceRestrictChars(Util.toJoin("_", //
            new String[] { //
                userId, // 사용자ID
                xlsSheetName, // 시트명
                Util.getNowDate("yyyyMMddHHmmss") // 처리일시
            }, "." + xlsVersion));
        String xlsExportFullPath = NexosSupport.getWebFileRootPath("FILE.EXCEL.EXPORT");
        String xlsFileFullName = xlsExportFullPath + xlsFileName;

        // 이전 Export 파일 삭제
        deleteExcelExportFiles(xlsExportFullPath);

        // 엑셀 관련 Object 생성
        FileOutputStream xlsFile = null;
        HSSFWorkbook xlsWorkbook = null;
        XSSFWorkbook xlsxWorkbook = null;
        try {
            xlsFile = new FileOutputStream(xlsFileFullName);
            int listCount = 0;
            if ("xlsx".equals(xlsVersion)) {
                xlsxWorkbook = new XSSFWorkbook();
                listCount = toExcel(queryId, queryParams, xlsxWorkbook, columnInfo, xlsExportType, xlsSheetName, xlsFreezeRow, xlsDataMask);

                if (listCount == 0) {
                    Util.setOutMessage(resultMap, NexosMessage.getDisplayMsg("JAVA.WC.008", "EXCEL 파일을 생성할 데이터가 존재하지 않습니다."));
                    return resultMap;
                }

                // Excel 쓰기
                xlsxWorkbook.write(xlsFile);
            } else {
                xlsWorkbook = new HSSFWorkbook();
                listCount = toExcel(queryId, queryParams, xlsWorkbook, columnInfo, xlsExportType, xlsSheetName, xlsFreezeRow, xlsDataMask);

                if (listCount == 0) {
                    Util.setOutMessage(resultMap, NexosMessage.getDisplayMsg("JAVA.WC.008", "EXCEL 파일을 생성할 데이터가 존재하지 않습니다."));
                    return resultMap;
                }

                // Excel 쓰기
                xlsWorkbook.write(xlsFile);
            }

            resultMap.put(PK_XLS_FILE_FULL_NM, xlsFileFullName);
            Util.setOutMessage(resultMap, Consts.OK);
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        } finally {
            try {
                if (xlsWorkbook != null) {
                    xlsWorkbook.close();
                    xlsWorkbook = null;
                }
                if (xlsxWorkbook != null) {
                    xlsxWorkbook.close();
                    xlsxWorkbook = null;
                }
                if (xlsFile != null) {
                    xlsFile.close();
                    xlsFile = null;
                }
            } catch (Exception e) {
                Util.writeErrorMessage(e);
            }
        }
        return resultMap;
    }

    /**
     * Excel Export 파일 삭제 - 2시간 전에 생성된 파일
     *
     * @throws Exception
     */
    private void deleteExcelExportFiles(String exportPath) throws Exception {
        try {
            File exportDir = new File(exportPath);
            if (exportDir.exists()) {
                File[] exportFiles = exportDir.listFiles();

                long currentTime = System.currentTimeMillis();
                for (int i = 0; i < exportFiles.length; i++) {
                    if (currentTime - exportFiles[i].lastModified() > 7200000) {
                        exportFiles[i].delete();
                    }
                }
            } else {
                exportDir.mkdirs();
            }
        } catch (Exception e) {
            Util.writeErrorMessage(e);
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public JsonDataSet excelImport(Map<String, Object> params) throws Exception {

        JsonDataSet resultDataSet = null;
        final String DEF_XLS_FILE_DIV = "DEFAULT";

        // 수신정의 상세내역 쿼리 파라메터 값 읽기

        // upload dir로 edi 파일 수신
        String ediRecvFileBackupFullName = null;
        File ediRecvFile = null;
        FileInputStream xlsFileInput = null;

        Workbook xlsWorkbook = null;
        Sheet xlsSheet = null;
        Row xlsRow = null;
        Cell xlsCell = null;

        PreparedStatement insertStatement = null;
        try {
            String xlsColCheckYn = (String)params.get("P_XLS_COL_CHECK_YN");
            String queryId = (String)params.get(Consts.PK_QUERY_ID);
            if (Util.isNull(queryId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.037", "데이터 조회할 쿼리ID가 지정되지 않았습니다. 엑셀 수신 처리할 수 없습니다."));
            }
            Map<String, Object> queryParams = (Map<String, Object>)params.get(Consts.PK_QUERY_PARAMS);
            int xlsFirstRow = Util.toInt(params.get("P_XLS_FIRST_ROW"), 1) - 1;
            String xlsFileDiv = Util.nullToDefault(params.get("P_XLS_FILE_DIV"), DEF_XLS_FILE_DIV);

            // 일련번호 생성 여부, Y일 경우 컬럼 마지막에 일련번호 추가, 1부터 시작~
            // 중복 데이터 추가 가능하게 할 경우 사용, 기본값은 사용안함, N
            boolean xlsColGenSeq = Consts.YES.equals(Util.nullToDefault(params.get("P_XLS_COL_GEN_SEQ_YN"), Consts.NO));

            ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();
            Vector<Object> vtColumn;
            int columnCnt = 0;
            // 엑셀 컬럼 체크하지 않을 경우
            if (!Consts.YES.equals(xlsColCheckYn)) {
                String xlsColDefine = Util.nullToDefault(params.get("P_XLS_COL_DEFINE"), "");
                if (Util.isNull(xlsColDefine)) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.038", "수신 처리할 엑셀 컬럼정보가 지정되지 않았습니다."));
                }
                String[] xlsColArray = xlsColDefine.split(",");
                for (String col : xlsColArray) {
                    if (Util.isNull(col)) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.039", "엑셀 컬럼정보에 빈값이 존재합니다. 엑셀 컬럼정보를 확인하십시오."));
                    }
                }
                columnCnt = xlsColArray.length;
                for (int i = 0; i < columnCnt; i++) {
                    vtColumn = new Vector<Object>();
                    vtColumn.add(getXLSColumnIndex(xlsColArray[i])); // XLS Column Index, 0,1,2...
                    vtColumn.add(xlsColArray[i]); // XLS Column Name, A,B,C...
                    vtColumn.add(""); // 데이터 컬럼명, CENTER_CD,...

                    columns.add(vtColumn);
                }
            }
            // 엑셀 컬럼 체크할 경우
            else {
                if (xlsFirstRow < 1) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.040", "컬럼 체크 값을 읽을 행을 알 수 없습니다. 엑셀 데이터 시작 행을 정확히 지정하십시오."));
                }
                List<Map<String, Object>> columnInfo = (List<Map<String, Object>>)params.get("P_COLUMN_INFO");
                if (columnInfo == null || columnInfo.size() == 0) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.041", "수신 컬럼정보가 없습니다. 컬럼 체크를 사용하려면 수신 컬럼정보를 지정하십시오."));
                }
                columnCnt = columnInfo.size();
                for (int i = 0; i < columnCnt; i++) {
                    Map<String, Object> colInfo = columnInfo.get(i);
                    String xlsColumnNm = (String)colInfo.get("P_XLS_COLUMN_NM");
                    if (Util.isNull(xlsColumnNm)) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.042", "수신 컬럼정보에 엑셀 컬럼명이 지정되지 않았습니다. 엑셀 컬럼명을 지정하십시오."));
                    }
                    String ColumnNm = (String)colInfo.get("P_COLUMN_NM");
                    if (Util.isNull(ColumnNm)) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.043", "수신 컬럼정보에 체크 컬럼명이 지정되지 않았습니다. 체크 컬럼명을 지정하십시오."));
                    }
                    vtColumn = new Vector<Object>();
                    vtColumn.add(getXLSColumnIndex(xlsColumnNm)); // XLS Column Index, 0,1,2...
                    vtColumn.add(xlsColumnNm); // XLS Column Name, A,B,C...
                    vtColumn.add(ColumnNm); // 데이터 컬럼명, CENTER_CD,...

                    columns.add(vtColumn);
                }
            }

            String userId = (String)params.get(Consts.PK_USER_ID);
            String ediRecvDatetime = Util.getNowDate("yyyyMMddHHmmss");
            String ediFileRoot = NexosSupport.getWebFileRootPath("FILE.EXCEL.IMPORT");
            String ediRecvFullPath = Util.getPathName(ediFileRoot, xlsFileDiv);

            MultipartFile ediUploadMultipartFile = null;
            String ediRecvFileName = null;
            String ediRecvFileFullName = null;
            String ediRecvFileBackupPath = null;

            // Browser에서 파일 업로드
            ediUploadMultipartFile = (MultipartFile)params.get("P_UPLOAD_FILE");
            ediRecvFileName = Util.replaceRestrictChars(Util.toJoin("_", //
                new String[] { //
                    userId, // 사용자ID
                    ediRecvDatetime, // 수신일시
                    RandomStringUtils.randomNumeric(5), // 랜덤 5자리 숫자
                    ediUploadMultipartFile.getOriginalFilename() //
                }));

            ediRecvFileFullName = ediRecvFullPath + ediRecvFileName;
            ediRecvFileBackupPath = Util.getPathName(ediRecvFullPath, Consts.BACKUP_DIR, ediRecvDatetime.substring(0, 8));
            ediRecvFileBackupFullName = ediRecvFileBackupPath + ediRecvFileName;

            // upload dir이 존재하지 않으면 생성
            Util.createDir(ediRecvFullPath, ediRecvFileBackupPath);

            // BATCH 처리를 위한 최종 INSERT SQL 생성
            String insertSql = "INSERT INTO CTCHECKVALUE (CHECK_VALUE) VALUES (?)";

            ediRecvFile = new File(ediRecvFileFullName);
            try {
                ediUploadMultipartFile.transferTo(ediRecvFile);
                params.remove("P_UPLOAD_FILE");
            } catch (Exception e) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.044", "수신 처리할 파일을 전송하지 못했습니다."));
            }

            String xlsVersion = "xls";
            try {
                xlsFileInput = new FileInputStream(ediRecvFile);
                xlsWorkbook = WorkbookFactory.create(xlsFileInput);
                if (xlsWorkbook instanceof XSSFWorkbook) {
                    xlsVersion = "xlsx";
                    Util.closeObject(xlsWorkbook);
                    Util.closeObject(xlsFileInput);
                }
            } catch (Exception e) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.045", "엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.\n") + Util.getErrorMessage(e));
            }

            int xlsCol;
            String xlsColumnVal;
            int recvRows = 0;

            // Excel 2007
            if (xlsVersion.equals("xlsx")) {
                try {
                    xlsFileInput = new FileInputStream(ediRecvFile);
                    xlsWorkbook = StreamingReader.builder() //
                        .rowCacheSize(100) // number of rows to keep in memory (defaults to 10)
                        .bufferSize(4096) // buffer size to use when reading InputStream to file (defaults to 1024)
                        .open(xlsFileInput);
                } catch (Exception e) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.XXX", "엑셀 파일을 열 수 없습니다.\n") + Util.getErrorMessage(e));
                }
                try {
                    xlsSheet = xlsWorkbook.getSheetAt(0);
                } catch (Exception e) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.XXX", "엑셀 시트를 가져올 수 없습니다.") + Util.getErrorMessage(e));
                }

                // 엑셀의 날짜 타입 Cell 값 변환 Formatter
                SimpleDateFormat stringDatetimeFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);
                // 엑셀의 숫자 타입 Cell 값 변환 Formatter
                NumberFormat stringNumberFormat = NumberFormat.getNumberInstance();
                stringNumberFormat.setGroupingUsed(false);
                int xlsRowCount = xlsSheet.getLastRowNum() + 1;

                if (xlsFirstRow > xlsRowCount) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.046", "엑셀 파일에 처리할 데이터가 없습니다.[데이터건수:"//
                        + xlsRowCount + "][시작ROW:" + (xlsFirstRow + 1) + "]",
                        new String[] {String.valueOf(xlsRowCount), String.valueOf(xlsFirstRow + 1)}));
                }

                // BATCH 처리를 위한 Connection으로부터 PreparedStatement 취득
                insertStatement = getConnection().prepareStatement(insertSql);
                Iterator<Row> rowIterator = xlsSheet.rowIterator();
                // 시작 Row까지 이동
                if (xlsFirstRow > 0) {
                    int skipRow = xlsFirstRow;
                    // 체크컬럼 데이터 확인을 위해 엑셀 데이터 시작 행을 1 줄임
                    if (Consts.YES.equals(xlsColCheckYn)) {
                        skipRow--;
                    }
                    while (rowIterator.hasNext() && skipRow > 0) {
                        skipRow--;
                        rowIterator.next();
                    }
                }
                // 체크컬럼 확인
                if (Consts.YES.equals(xlsColCheckYn)) {
                    xlsRow = rowIterator.next();
                    if (xlsRow == null) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.047", "엑셀 행이 비어있습니다. 확인 후 작업하십시오."));
                    }
                    for (int i = 0; i < columnCnt; i++) {
                        vtColumn = columns.get(i);
                        xlsCol = (Integer)vtColumn.get(0);

                        // XLS 셀 값 읽기
                        xlsCell = xlsRow.getCell(xlsCol);
                        if (xlsCell == null) {
                            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.048", "엑셀에 체크컬럼 값이 없습니다. 지정된 엑셀포맷이 맞는지 확인하십시오."));
                        }
                        xlsColumnVal = (String)vtColumn.get(2);
                        if (!xlsColumnVal.equals(xlsCell.getRichStringCellValue().getString().trim())) {
                            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.049", "엑셀에 체크컬럼 값이 다릅니다. 지정된 엑셀포맷이 맞는지 확인하십시오."));
                        }
                    }
                }

                StringBuffer sbCheckVal = new StringBuffer();
                while (rowIterator.hasNext()) {

                    xlsRow = rowIterator.next();
                    if (xlsRow == null) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.047", "엑셀 행이 비어있습니다. 확인 후 작업하십시오."));
                    }
                    // Row의 Cell이 모두 빈값이면 Skip
                    if (isXLSEmptyRow(xlsVersion, xlsRow, columns, stringDatetimeFormat, stringNumberFormat)) {
                        continue;
                    }

                    sbCheckVal.setLength(0);
                    for (int i = 0; i < columnCnt; i++) {
                        // XLS 셀 값 읽기
                        xlsColumnVal = getXLSColumnValue(xlsVersion, //
                            xlsRow, // XLS Row Data
                            (Integer)columns.get(i).get(0), // XLS Cell Index, 0 based column number
                            stringDatetimeFormat, // XLS Date Type Cell Formatter
                            stringNumberFormat // XLS Number Type Cell Formatter
                        );
                        sbCheckVal.append(Consts.SEP_COL).append(xlsColumnVal);
                    }

                    recvRows++;
                    // 일련번호 생성일 경우 마지막에 Row Number 번호 추가
                    if (xlsColGenSeq) {
                        sbCheckVal.append(Consts.SEP_COL).append(recvRows);
                    }
                    insertStatement.setString(1, sbCheckVal.toString().substring(Consts.SEP_COL.length()));
                    // BATCH에 추가
                    insertStatement.addBatch();
                    // 파라메터 초기화
                    insertStatement.clearParameters();
                    // 1000건씩 처리
                    if (recvRows % Consts.BULK_CNT == 0) {
                        // BATCH 실행
                        insertStatement.executeBatch();
                        // BATCH 초기화
                        insertStatement.clearBatch();
                    }
                }

                // 나머지 데이터가 있을 경우 처리
                if (recvRows % Consts.BULK_CNT != 0) {
                    // BATCH 실행
                    insertStatement.executeBatch();
                    // BATCH 초기화
                    insertStatement.clearBatch();
                }
            } else {
                // Excel 2003 이하
                try {
                    xlsSheet = xlsWorkbook.getSheetAt(0);
                } catch (Exception e) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.XXX", "엑셀 시트를 가져올 수 없습니다.") + Util.getErrorMessage(e));
                }

                // 엑셀의 날짜 타입 Cell 값 변환 Formatter
                SimpleDateFormat stringDatetimeFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);
                // 엑셀의 숫자 타입 Cell 값 변환 Formatter
                NumberFormat stringNumberFormat = NumberFormat.getNumberInstance();
                stringNumberFormat.setGroupingUsed(false);
                int xlsRowCount = xlsSheet.getPhysicalNumberOfRows();

                if (xlsFirstRow > xlsRowCount) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.046", "엑셀 파일에 처리할 데이터가 없습니다.[데이터건수:"//
                        + xlsRowCount + "][시작ROW:" + (xlsFirstRow + 1) + "]",
                        new String[] {String.valueOf(xlsRowCount), String.valueOf(xlsFirstRow + 1)}));

                }

                // 체크컬럼 확인
                if (Consts.YES.equals(xlsColCheckYn)) {
                    xlsRow = xlsSheet.getRow(xlsFirstRow - 1);
                    if (xlsRow == null) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.047", "엑셀 행이 비어있습니다. 확인 후 작업하십시오."));
                    }

                    for (int i = 0; i < columnCnt; i++) {
                        vtColumn = columns.get(i);
                        xlsCol = (Integer)vtColumn.get(0);

                        // XLS 셀 값 읽기
                        xlsCell = xlsRow.getCell(xlsCol);
                        if (xlsCell == null) {
                            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.048", "엑셀에 체크컬럼 값이 없습니다. 지정된 엑셀포맷이 맞는지 확인하십시오."));
                        }
                        xlsColumnVal = (String)vtColumn.get(2);
                        if (!xlsColumnVal.equals(xlsCell.getRichStringCellValue().getString().trim())) {
                            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.049", "엑셀에 체크컬럼 값이 다릅니다. 지정된 엑셀포맷이 맞는지 확인하십시오."));
                        }
                    }
                }

                // BATCH 처리를 위한 Connection으로부터 PreparedStatement 취득
                insertStatement = getConnection().prepareStatement(insertSql);
                StringBuffer sbCheckVal = new StringBuffer();
                for (int row = xlsFirstRow; row < xlsRowCount; row++) {

                    xlsRow = xlsSheet.getRow(row);
                    if (xlsRow == null) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.047", "엑셀 행이 비어있습니다. 확인 후 작업하십시오."));
                    }
                    // Row의 Cell이 모두 빈값이면 Skip
                    if (isXLSEmptyRow(xlsVersion, xlsRow, columns, stringDatetimeFormat, stringNumberFormat)) {
                        continue;
                    }

                    sbCheckVal.setLength(0);
                    for (int i = 0; i < columnCnt; i++) {
                        // XLS 셀 값 읽기
                        xlsColumnVal = getXLSColumnValue(xlsVersion, //
                            xlsRow, // XLS Row Data
                            (Integer)columns.get(i).get(0), // XLS Cell Index, 0 based column number
                            stringDatetimeFormat, // XLS Date Type Cell Formatter
                            stringNumberFormat // XLS Number Type Cell Formatter
                        );
                        sbCheckVal.append(Consts.SEP_COL).append(xlsColumnVal);
                    }

                    recvRows++;
                    // 일련번호 생성일 경우 마지막에 Row Number 번호 추가
                    if (xlsColGenSeq) {
                        sbCheckVal.append(Consts.SEP_COL).append(recvRows);
                    }
                    insertStatement.setString(1, sbCheckVal.toString().substring(Consts.SEP_COL.length()));
                    // BATCH에 추가
                    insertStatement.addBatch();
                    // 파라메터 초기화
                    insertStatement.clearParameters();
                    // 1000건씩 처리
                    if (recvRows % Consts.BULK_CNT == 0) {
                        // BATCH 실행
                        insertStatement.executeBatch();
                        // BATCH 초기화
                        insertStatement.clearBatch();
                    }
                }

                // 나머지 데이터가 있을 경우 처리
                if (recvRows % Consts.BULK_CNT != 0) {
                    // BATCH 실행
                    insertStatement.executeBatch();
                    // BATCH 초기화
                    insertStatement.clearBatch();
                }
            }
            resultDataSet = getDataSet(queryId, queryParams);
        } catch (Exception e) {
            Util.writeErrorMessage("WCDAOImpl[excelImport]", e);
            throw e;
        } finally {
            xlsSheet = null;
            Util.closeObject(xlsWorkbook);
            Util.closeObject(xlsFileInput);
            if (ediRecvFile != null) {
                try {
                    if (ediRecvFileBackupFullName != null) {
                        Util.renameFile(ediRecvFile, new File(ediRecvFileBackupFullName));
                    }
                } catch (Exception e) {
                    Util.writeErrorMessage(e);
                }
            }
            if (insertStatement != null) {
                try {
                    insertStatement.close();
                } catch (Exception e) {
                }
            }
        }
        return resultDataSet;
    }

    private int getXLSColumnIndex(String columnName) {

        columnName = columnName.toUpperCase();
        short value = 0;
        for (int i = 0, k = columnName.length() - 1; i < columnName.length(); i++, k--) {
            int alpabetIndex = (short)columnName.charAt(i) - 64;
            int delta = 0;
            if (k == 0) {
                delta = alpabetIndex - 1;
            } else {
                if (alpabetIndex == 0) {
                    delta = 26 * k;
                } else {
                    delta = alpabetIndex * 26 * k;
                }
            }
            value += delta;
        }
        return value;
    }

    /**
     * 처리할 Row의 Cell에 값이 하나라도 입력되어 있는지 체크<br>
     * <br>
     * ※ 제공 Method로 Row 수 체크시 사용자 입력 방법에 따라 빈 Row가 대상이 되는 현상 발생<br>
     * 해당 문제 해결을 위한 데이터 입력 Row 체크 Function<br>
     * Row의 Cell에 값이 하나라도 입력이 되어 있어야 처리 대상이 됨. 값이 없을 경우 다음 Row 처리
     *
     * @return
     */
    private boolean isXLSEmptyRow(String xlsVersion, Row xlsRow, ArrayList<Vector<Object>> columns, SimpleDateFormat stringDatetimeFormat,
        NumberFormat stringNumberFormat) {

        for (int cIndex = 0, cCount = columns.size(); cIndex < cCount; cIndex++) {
            // Vector 0: 엑셀 컬럼 인덱스
            // Vector 1: 엑셀 컬럼명
            // Vector 2: 데이터 컬럼명
            // 빈 값이 아닐경우 리턴
            if (Util.isNotNull(getXLSColumnValue(xlsVersion, //
                xlsRow, (Integer)columns.get(cIndex).get(0), stringDatetimeFormat, stringNumberFormat))) {
                return false;
            }
        }

        // 체크 대상이 없거나 모두 빈값일 경우
        return true;
    }

    /**
     * 엑셀의 Row에서 Cell의 타입에 따라 값을 변환하여 리턴
     *
     * @param xlsRow
     * @param xlsCol
     * @param stringDatetimeFormat
     * @param stringNumberFormat
     * @return
     */
    private String getXLSColumnValue(String xlsVersion, Row xlsRow, int xlsCol, SimpleDateFormat stringDatetimeFormat,
        NumberFormat stringNumberFormat) {

        String result = "";

        Cell xlsCell = xlsRow.getCell(xlsCol);
        if (xlsCell != null) {
            CellType cellType = xlsCell.getCellType();
            // 수식 참조일 경우 참조 정보 CellType으로 처리
            if (CellType.FORMULA.equals(cellType)) {
                cellType = xlsCell.getCachedFormulaResultType();
                // HSSFCell, XSSFCell일 경우는 정상 Type 리턴
                logger.info(xlsCol + ": " + cellType.name());
                // StreamingCell일 경우 일부 참조 Formula로 리턴되는 경우도 있음
                // "값" 형식, " 제거 후 리턴
                // com.monitorjbl.xlsxstreamer v1.2.1 기준
                if (CellType.FORMULA.equals(cellType)) {
                    if ("xlsx".equals(xlsVersion)) {
                        XSSFRichTextString cellValue = new XSSFRichTextString(xlsCell.getStringCellValue());
                        result = cellValue.getString();
                    } else {
                        HSSFRichTextString cellValue = new HSSFRichTextString(xlsCell.getStringCellValue());
                        result = cellValue.getString();
                    }
                    if (result.startsWith("\"") && result.endsWith("\"")) {
                        result = result.substring(1, result.length() - 1);
                    }
                    return result.trim();
                }
            }

            // 문자열
            if (CellType.STRING.equals(cellType)) {
                result = xlsCell.getRichStringCellValue().getString().trim();
            }
            // 숫자
            else if (CellType.NUMERIC.equals(cellType)) {
                if (DateUtil.isCellDateFormatted(xlsCell)) {
                    result = stringDatetimeFormat.format(xlsCell.getDateCellValue());
                } else {
                    result = stringNumberFormat.format(xlsCell.getNumericCellValue());
                }
            }
            // Boolean
            else if (CellType.BOOLEAN.equals(cellType)) {
                try {
                    result = String.valueOf(xlsCell.getBooleanCellValue());
                } catch (NotSupportedException e) {
                    // StreamingCell Formula 결과 값이 Boolean일 경우 미지원, False 값 리턴
                    // com.monitorjbl.xlsxstreamer v1.2.1 기준
                    result = "0";
                }
            }
            // Error Cell, Cell 값이 Error일 경우 처리 안함, since 7.0.0
            // else if (CellType.ERROR.equals(cellType)) {
            // result = String.valueOf(xlsCell.getErrorCellValue());
            // }
        }

        return result;
    }

    @Override
    public Map<String, Object> getSysDate() {

        Map<String, Object> resultMap = null;

        try {
            List<Map<String, Object>> list = getDataList(SP_ID_GET_SYSDATE);
            if (list == null || list.size() == 0) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.009", "현재 일자를 가져오지 못했습니다. 다시 처리하십시오."));
            }
            resultMap = list.get(0);
            Util.setOutMessage(resultMap, Consts.OK);
        } catch (Exception e) {
            resultMap = new HashMap<String, Object>();
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        }
        return resultMap;
    }

    @Override
    public void saveUserGridLayout(Map<String, Object> params) {

        String rowCrud = (String)params.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_D.equals(rowCrud)) {
            insertSql(DELETE_ID_CSUSERGRIDLAYOUT, params);
        } else {
            params.put(Consts.PK_REG_USER_ID, params.get(Consts.PK_USER_ID));
            params.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);

            int update = updateSql(UPDATE_ID_CSUSERGRIDLAYOUT, params);
            if (update == 0) {
                insertSql(INSERT_ID_CSUSERGRIDLAYOUT, params);
            }
        }
    }
}
