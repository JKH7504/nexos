package nexos.service.ed.common;

import java.io.File;
import java.sql.BatchUpdateException;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import com.fasterxml.jackson.databind.ObjectMapper;

import nexos.dao.ed.common.EDCommonDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.AuthenticationUtil;
import nexos.framework.support.ServiceParam;
import nexos.framework.support.ServiceSupport;

/**
 * Class: EDIFApiService<br>
 * Description: WMS IF API 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDIFApiService extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(EDIFApiService.class);

    final String            SELECT_ID_CM_UNIQUE_GETID       = "WT.CM_UNIQUE_GETID";

    final String            SELECT_ID_GET_SPEC_DEFINITION   = "EDIFAPI.GET_SPEC_DEFINITION";
    final String            SELECT_ID_GET_SPEC_WCS          = "EDIFAPI.GET_SPEC_WCS";
    final String            SELECT_ID_GET_RESULT_DEFINITION = "EDIFAPI.GET_RESULT_DEFINITION";

    @Autowired
    private EDCommonDAO     dao;

    @Autowired
    private EDCommonService service;

    /**
     * 수신ID 채번 후 리턴, 기본 14자, 최대 20자
     *
     * @param ifApiDiv
     * @return
     */
    public String getIfApiUniqueId(String ifApiDiv) {

        Map<String, Object> params = Util.newMap();
        params.put("P_TABLE_NM", ifApiDiv); // 채번대상테이블명

        Map<String, Object> resultMap = getData(SELECT_ID_CM_UNIQUE_GETID, params);
        String oMsg = Util.getOutMessage(resultMap);
        if (Consts.OK.equals(oMsg)) {
            return (String)resultMap.get("O_UNIQUE_ID"); // YYMMDDHHMM0000000000, 20자
        }

        // DB에서 채번을 못했을 경우 로컬ID로 지정, LYYMMDDHHMMSSSSS0000 20자
        return "L" + Util.getNowDate("yyMMddHHmmssSSS") + RandomStringUtils.randomNumeric(4);
    }

    /**
     * IFAPI 송수신구분/사업부코드에 따른 송수신정의 정보 리턴
     *
     * @param params
     * @return
     */
    private Map<String, Object> getIfApiSpecDefinition(Map<String, Object> params) {

        List<Map<String, Object>> dsIfApiSpec = null;
        String ifApiDiv = (String)params.get("P_IFAPI_DIV");
        try {
            dsIfApiSpec = getDataList(SELECT_ID_GET_SPEC_DEFINITION, params);
        } catch (Exception e) {
            return Util.toMap(ServiceParam.valueOf(Consts.PK_O_MSG, Util.getErrorMessage(e)));
        }
        if (dsIfApiSpec == null || dsIfApiSpec.size() == 0) {
            String buCd = Util.nullToEmpty(params.get("P_BU_CD"));
            return Util.toMap(ServiceParam.valueOf(Consts.PK_O_MSG, //
                NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[" + ifApiDiv + ", " + buCd + "]정의되지 않은 API입니다. 호출 URL을 확인하십시오.",
                    new String[] {ifApiDiv, buCd})) //
            );
        }

        Map<String, Object> ifApiSpec = dsIfApiSpec.get(0);
        Util.setOutMessage(ifApiSpec, Consts.OK);
        return ifApiSpec;
    }

    /**
     * IFAPI WCS 수신구분에 따른 매핑 정보 리턴
     *
     * @param params
     * @return
     */
    private Map<String, Object> getIfApiSpecWcs(Map<String, Object> params) {

        List<Map<String, Object>> dsIfApiSpec = null;
        String ifApiDiv = (String)params.get("P_IFAPI_DIV");
        try {
            dsIfApiSpec = getDataList(SELECT_ID_GET_SPEC_WCS, params);
        } catch (Exception e) {
            return Util.toMap(ServiceParam.valueOf(Consts.PK_O_MSG, Util.getErrorMessage(e)));
        }
        if (dsIfApiSpec == null || dsIfApiSpec.size() == 0) {
            return Util.toMap(ServiceParam.valueOf(Consts.PK_O_MSG, //
                NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[" + ifApiDiv + "]정의되지 않은 API입니다. 호출 URL을 확인하십시오.", new String[] {ifApiDiv})));
        }

        Map<String, Object> ifApiSpec = dsIfApiSpec.get(0);
        Util.setOutMessage(ifApiSpec, Consts.OK);
        return ifApiSpec;
    }

    /**
     * IFAPI 수신처리 결과정보에서 추가 정보 변경 처리
     *
     * @param params
     */
    private void setIfApiResultDefinition(Map<String, Object> params) {

        List<Map<String, Object>> dsIfApiResult = null;
        try {
            dsIfApiResult = getDataList(SELECT_ID_GET_RESULT_DEFINITION, params);
        } catch (Exception e) {
        }

        // 오류, 리턴 데이터가 없을 경우 처리 안함
        if (dsIfApiResult == null || dsIfApiResult.size() == 0) {
            return;
        }

        // RESULT_CD(결과코드), RESULT_MSG(결과메시지)를 제외한 추가 정보 변경 처리
        Map<String, Object> ifApiResult = dsIfApiResult.get(0);
        @SuppressWarnings("unchecked")
        Map<String, Object> jsonResultInfo = (Map<String, Object>)params.get("P_JSON_RESULT_INFO");
        String tagResult = (String)jsonResultInfo.get("P_TAG_RESULT");
        String resultMessage = (String)jsonResultInfo.get("P_RESULT_MESSAGE");
        for (Map.Entry<String, Object> columnData : ifApiResult.entrySet()) {
            String columnNm = columnData.getKey();
            // 결과코드/메시지 제외, 해당 값은 Controller에서 최종 값 적용
            if ("RESULT_CD".equals(columnNm) || "RESULT_MSG".equals(columnNm)) {
                continue;
            }

            // 추가 정보 데이터 Json 값으로 변경
            String columnValue = null;
            try {
                columnValue = Util.toJson(columnData.getValue());
            } catch (Exception e) {
                // 오류 무시, null로 리턴
            }
            if (Util.isNull(columnValue)) {
                columnValue = "null";
            }

            // TAG_RESULT 및 RESULT_MESSAGE에서 값 변경 처리
            columnNm = "#" + columnNm + "#";
            tagResult = tagResult.replace(columnNm, columnValue);
            resultMessage = resultMessage.replace(columnNm, columnValue);
        }

        // 변경된 값 재등록
        jsonResultInfo.put("P_TAG_RESULT", tagResult);
        jsonResultInfo.put("P_RESULT_MESSAGE", resultMessage);
    }

    /**
     * IFAPI 수신 컬럼 세팅
     *
     * @param jsonMapping
     * @param columns
     * @param sbInsertSQLColumns
     * @param sbInsertSQLValues
     * @param userId
     * @param recvId
     */
    private void setIfApiColumns(Map<String, Object> jsonMapping, List<Vector<Object>> columns, StringBuffer sbInsertSQLColumns,
        StringBuffer sbInsertSQLValues, String userId, String recvId) {

        final String SC_BIND = "?";
        final String SC_SEP = " ,";
        String columnInfoMap = (String)jsonMapping.get("COLUMN_INFO_MAP");
        String columnSeparator = Util.nullToDefault(jsonMapping.get("COLUMN_SEPARATOR"), Consts.SEP_DATA);
        String[] allColumnDefs = columnInfoMap.split("\r?\n|\r");

        for (int rIndex = 0, rCount = allColumnDefs.length; rIndex < rCount; rIndex++) {
            try {
                String[] columnDefs = allColumnDefs[rIndex].split(columnSeparator);

                Vector<Object> vtColumn;
                String columnNm = null;
                String jsonColumnNm = null;
                String dataType = "1";
                String dataDefault = null;

                if (columnDefs.length > 0) {
                    columnNm = columnDefs[0];
                    if (columnDefs.length > 1) {
                        jsonColumnNm = columnDefs[1];
                        if (columnDefs.length > 2) {
                            dataType = columnDefs[2];
                            if (columnDefs.length > 3) {
                                dataDefault = columnDefs[3];
                            }
                        }
                    }
                }

                // WMS 컬럼이 존재하는 경우만 처리
                if (Util.isNotNull(columnNm)) {
                    // 수신 상대 컬럼이 있을 경우 컬럼정보 생성
                    if (Util.isNotNull(jsonColumnNm)) {
                        vtColumn = new Vector<Object>();
                        vtColumn.add("P_" + columnNm);
                        vtColumn.add(jsonColumnNm);
                        vtColumn.add(dataType);

                        // BATCH 처리를 위한 INSERT SQL에 수신 컬럼 추가
                        sbInsertSQLColumns.append(SC_SEP).append(columnNm);
                        // 기본값이 없을 경우
                        if (Util.isNull(dataDefault)) {
                            // 날짜
                            if ("2".equals(dataType)) {
                                sbInsertSQLValues.append(SC_SEP).append("WF.C_TO_DATETIME(").append(SC_BIND).append(")");
                            } else {
                                sbInsertSQLValues.append(SC_SEP).append(SC_BIND);
                            }
                        }
                        // 기본값 처리
                        else {
                            sbInsertSQLValues.append(SC_SEP).append("NVL(").append(SC_BIND).append(SC_SEP);
                            // 수신ID
                            if ("[RECV_ID]".equals(dataDefault)) {
                                sbInsertSQLValues.append(Util.toSingleQuoted(recvId));
                            }
                            // 사용자ID
                            else if ("[USER_ID]".equals(dataDefault)) {
                                sbInsertSQLValues.append(Util.toSingleQuoted(userId));
                            }
                            // 현재일시
                            else if ("[SYSDATE]".equals(dataDefault)) {
                                sbInsertSQLValues.append("SYSDATE");
                            }
                            // 그외, 값
                            else {
                                // 숫자
                                if ("3".equals(dataType)) {
                                    sbInsertSQLValues.append(dataDefault);
                                }
                                // 날짜
                                else if ("2".equals(dataType)) {
                                    sbInsertSQLValues.append("WF.C_TO_DATETIME(").append(Util.toSingleQuoted(dataDefault)).append(")");
                                }
                                // 그외, 문자
                                else {
                                    sbInsertSQLValues.append(Util.toSingleQuoted(dataDefault));
                                }
                            }
                            sbInsertSQLValues.append(")");
                        }
                        columns.add(vtColumn);
                    }
                    // 수신 컬럼이 없을 경우, 컬럼정보는 생성하지 않음
                    else {
                        // 기본값이 있을 경우만
                        if (Util.isNull(dataDefault)) {
                            continue;
                        }
                        // BATCH 처리를 위한 INSERT SQL에 수신 컬럼 추가
                        sbInsertSQLColumns.append(SC_SEP).append(columnNm);
                        // 기본값 처리
                        // 수신ID
                        if ("[RECV_ID]".equals(dataDefault)) {
                            sbInsertSQLValues.append(SC_SEP).append(Util.toSingleQuoted(recvId));
                        }
                        // 사용자ID
                        else if ("[USER_ID]".equals(dataDefault)) {
                            sbInsertSQLValues.append(SC_SEP).append(Util.toSingleQuoted(userId));
                        }
                        // 현재일시
                        else if ("[SYSDATE]".equals(dataDefault)) {
                            sbInsertSQLValues.append(SC_SEP).append("SYSDATE");
                        }
                        // 그외, 값
                        else {
                            // 숫자
                            if ("3".equals(dataType)) {
                                sbInsertSQLValues.append(SC_SEP).append(dataDefault);
                            }
                            // 날짜
                            else if ("2".equals(dataType)) {
                                sbInsertSQLValues.append(SC_SEP).append("WF.C_TO_DATETIME(").append(Util.toSingleQuoted(dataDefault)).append(")");
                            }
                            // 그외, 문자
                            else {
                                sbInsertSQLValues.append(SC_SEP).append(Util.toSingleQuoted(dataDefault));
                            }
                        }
                    }
                }
            } catch (Exception e) {
            }
        }
    }

    /**
     * Throw 생성(오류처리), 송수신정의 기준
     *
     * @param buCd
     * @param ediDiv
     * @param defineNo
     * @param errorMessage
     * @return
     * @throws Exception
     */
    private String throwIfApiDefinitionError(String buCd, String ediDiv, String defineNo, String errorMessage) throws Exception {

        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[사업부,송수신구분,정의번호: " //
            + buCd + "," + ediDiv + "," + defineNo //
            + "]\n" + errorMessage, new String[] {buCd, ediDiv, defineNo}));
    }

    /**
     * Throw 생성(오류처리), IFAPI
     *
     * @param ifApiDiv
     * @param errorMessage
     * @return
     * @throws Exception
     */
    private String throwIfApiError(String ifApiDiv, String errorMessage) throws Exception {

        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[" + ifApiDiv //
            + "]" + errorMessage, new String[] {ifApiDiv}));
    }

    /**
     * IFAPI 수신 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> recvIfApiWcsProcessing(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = Util.newMap();

        String oMsg = null;
        boolean isDBError = false;
        String ifApiDiv = (String)params.get("P_IFAPI_DIV");
        try {
            // Mapping 정보 검색
            Map<String, Object> ifApiSpec = getIfApiSpecWcs(params);
            oMsg = Util.getOutMessage(ifApiSpec);
            if (!Consts.OK.equals(oMsg)) {
                resultMap.put("O_ERROR_STATUS", HttpStatus.BAD_REQUEST);

                // IFAPI Spec이 없을 경우 오류 처리
                recvIfApiProcessingBeforeErrorLog( //
                    (String)params.get(Consts.PK_USER_ID), //
                    (String)params.get("P_IFAPI_GRP"), //
                    (String)params.get("P_IFAPI_DIV"), //
                    (String)params.get("P_DOCUMENT"), //
                    HttpStatus.BAD_REQUEST.toString() //
                );

                throw new RuntimeException(oMsg);
            }

            String queryId = (String)ifApiSpec.get("PROCESSING_QUERY_ID");
            if (Util.isNull(queryId)) {
                throwIfApiError(ifApiDiv, NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[결과반영]처리할 프로시저가 지정되어 있지 않습니다. SPEC을 확인하십시오."));
            }

            String dataDiv = (String)ifApiSpec.get("DATA_DIV");
            TransactionStatus ts = beginTrans();
            try {
                // Mapping 정보 추가
                params.put("P_IFAPI_SPEC", ifApiSpec);

                // TODO: 현재 Json 타입, paylaod는 단순 array 구조만 구현
                // 추후 필요시 추가
                /**
                 * 데이터 구조 샘플
                 * <pre>
                 * [
                 *     {
                 *         "CENTER_CD": "A1",
                 *         "BU_CD": "0010",
                 *         "OUTBOUND_DATE": "2024-01-01",
                 *         "OUTBOUND_NO": "000001",
                 *         ...
                 *     },
                 *     {
                 *         ...
                 *     },
                 *     ...
                 * ]
                 * </pre>
                 */

                // 1차 WCS Payload 수신 처리 - INSERT
                if (Consts.DATA_DIV_JSON.equals(dataDiv)) {
                    resultMap = recvIfApiWcsPayloadFromJson(params);
                } else {
                    throwIfApiError(ifApiDiv, NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[" + dataDiv + "]구현되지 않은 데이터 구분입니다.", //
                        new String[] {dataDiv}));
                }
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }

                // 2차 WCS 수신 처리 - 데이터 반영
                resultMap = callProcedure(queryId, params);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    isDBError = true;
                    throw new RuntimeException(oMsg);
                }

                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                throw new RuntimeException(Util.getErrorMessage(e));
            }

            Util.setOutMessage(resultMap, Consts.OK);
        } catch (Exception e) {
            String errorMessage = Util.getErrorMessage(e);
            Util.setOutMessage(resultMap, errorMessage);
            // 결과반영 프로시저를 처리하다가 발생한 오류가 아닐 경우 DB처리로그로 기록
            if (!isDBError) {
                recvIfApiProcessingErrorLogWrite(params, errorMessage);
            }
        }

        return resultMap;
    }

    /**
     * IFAPI Payload 수신 처리(Json) - INSERT
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> recvIfApiWcsPayloadFromJson(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = Util.newMap();

        File ediRecvFile = null;
        String ediRecvFileName = null;
        String ediRecvFileBackupFullName = null;
        PreparedStatement insertStatement = null;

        String ifApiDiv = (String)params.get("P_IFAPI_DIV");
        try {
            // Json to List
            String jsonDoc = (String)params.get("P_DOCUMENT");
            Map<String, Object> ifApiSpec = (Map<String, Object>)params.get("P_IFAPI_SPEC");

            // 매핑 정보 읽기, WCS는 리턴 메시지 HttpStatus로 처리
            // Map<String, Object> jsonResultInfo = dao.getJsonResultInfo( //
            // (String)jsonMapping.get("JSON_TAG_RESULT"), //
            // (String)jsonMapping.get("JSON_TAG_RESULT_MAP"));
            // params.put("P_JSON_RESULT_INFO", jsonResultInfo);

            String fileDiv = (String)params.get("P_FILE_DIV");
            String userId = (String)params.get(Consts.PK_USER_ID);
            String tableNm = (String)ifApiSpec.get("TABLE_NM");
            String ediRecvDatetime = Util.getNowDate("yyyyMMddHHmmssSSS");
            String recvId = getIfApiUniqueId(ifApiDiv);
            // 수신ID 추가
            params.put("P_RECV_ID", recvId);

            // 문자열
            if (Consts.FILE_DIV_DOC.equals(fileDiv)) {
                ediRecvFileName = Util.replaceRestrictChars(Util.toJoin("_", //
                    new String[] { //
                        userId, // 사용자ID
                        ediRecvDatetime, // 수신일시
                        ifApiDiv, // API구분
                        RandomStringUtils.randomNumeric(5), // 랜덤 5자리 숫자
                        "DOC.json" //
                    }));
            }
            // 기타 오류
            else {
                throwIfApiError(ifApiDiv, NexosMessage.getDisplayMsg("JAVA.ED.XXX", "처리할 수 없는 파일유형[" + fileDiv + "]입니다.", new String[] {fileDiv}));
            }

            String ediRecvFullPath = Util.getPathName(dao.getRecvFileRootPath(), ifApiDiv);
            String ediRecvFileFullName = ediRecvFullPath + ediRecvFileName;
            String ediRecvFileBackupPath = dao.getBackupFilePath(ediRecvFullPath, ediRecvDatetime, ifApiDiv);
            ediRecvFileBackupFullName = ediRecvFileBackupPath + ediRecvFileName;

            // upload dir이 존재하지 않으면 생성
            Util.createDir(ediRecvFullPath, ediRecvFileBackupPath);
            ediRecvFile = new File(ediRecvFileFullName);
            if (Consts.FILE_DIV_DOC.equals(fileDiv)) {
                try {
                    FileUtils.writeStringToFile(ediRecvFile, jsonDoc, Consts.CHARSET);
                } catch (Exception e) {
                    throwIfApiError(ifApiDiv, NexosMessage.getDisplayMsg("JAVA.ED.XXX", "수신 처리할 문서를 파일로 기록하지 못했습니다."));
                }
            }

            List<Map<String, Object>> jsonRows = null;
            try {
                jsonRows = Util.toDataSet(jsonDoc);
            } catch (Exception e) {
                throwIfApiError(ifApiDiv, NexosMessage.getDisplayMsg("JAVA.ED.XXX", "수신 데이터(payload)의 포맷이 잘못되어 파싱할 수 없습니다.\n" + e.getMessage()));
            }
            if (jsonRows == null || jsonRows.size() == 0) {
                throwIfApiError(ifApiDiv, NexosMessage.getDisplayMsg("JAVA.ED.XXX", "수신 데이터(payload)가 존재하지 않습니다."));
            }

            // BATCH 처리를 위한 INSERT SQL 생성
            StringBuffer sbInsertSQLColumns = new StringBuffer();
            StringBuffer sbInsertSQLValues = new StringBuffer();

            // 실제 정의한 컬럼만 추출
            List<Vector<Object>> columns = Util.newAnyList();
            setIfApiColumns(ifApiSpec, columns, sbInsertSQLColumns, sbInsertSQLValues, userId, recvId);
            if (columns.size() == 0) {
                throwIfApiError(ifApiDiv, NexosMessage.getDisplayMsg("JAVA.ED.XXX", "수신정의 컬럼 중 처리 가능한 컬럼이 없습니다."));
            }

            StringBuffer sbBuffer = new StringBuffer();

            // BATCH 처리를 위한 최종 INSERT SQL 생성
            sbBuffer.setLength(0);
            sbBuffer //
                .append("INSERT INTO ") //
                .append(tableNm) //
                .append(" ( ") //
                .append(sbInsertSQLColumns.toString().substring(2)) //
                .append(" ) ") //
                .append(" VALUES ( ") //
                .append(sbInsertSQLValues.toString().substring(2)) //
                .append(" ) ");

            String insertSql = sbBuffer.toString();

            String jsonColumnNm = null;
            Object jsonColumnVal;
            // String columnNm = null;
            String columnVal = null;
            String dataType = null;

            // BATCH 처리를 위한 Connection으로부터 PreparedStatement 취득
            insertStatement = dao.getDaoSupport().getConnection().prepareStatement(insertSql);

            int recvSeq = 0;
            Map<String, Object> jsonRowData;
            for (int rIndex = 0, rCount = jsonRows.size(); rIndex < rCount; rIndex++) {
                jsonRowData = jsonRows.get(rIndex);

                for (int cIndex = 0, cCount = columns.size(); cIndex < cCount; cIndex++) {
                    Vector<Object> vtColumn = columns.get(cIndex);
                    // columnNm = (String)vtColumn.get(0);
                    jsonColumnNm = (String)vtColumn.get(1);
                    dataType = (String)vtColumn.get(2);

                    jsonColumnVal = jsonRowData.get(jsonColumnNm);
                    // 문자, 날짜
                    if ("1".equals(dataType) || "2".equals(dataType)) {
                        if (jsonColumnVal == null) {
                            columnVal = "";
                        } else if (jsonColumnVal instanceof String) {
                            columnVal = (String)jsonColumnVal;
                        } else if (jsonColumnVal instanceof Number) {
                            columnVal = String.valueOf(jsonColumnVal);
                        } else {
                            columnVal = jsonColumnVal.toString();
                        }
                        insertStatement.setString(cIndex + 1, columnVal.trim()); // jdbc first index: 1
                    }
                    // 그외, 숫자
                    else {
                        insertStatement.setObject(cIndex + 1, jsonColumnVal); // jdbc first index: 1
                    }
                }

                recvSeq++;
                // BATCH에 추가
                insertStatement.addBatch();
                // 파라메터 초기화
                insertStatement.clearParameters();
                // 1000건씩 처리
                if (recvSeq % Consts.BULK_CNT == 0) {
                    // BATCH 실행
                    insertStatement.executeBatch();
                    // BATCH 초기화
                    insertStatement.clearBatch();
                }
            }

            // 나머지 데이터가 있을 경우 처리
            if (recvSeq % Consts.BULK_CNT != 0) {
                // BATCH 실행
                insertStatement.executeBatch();
                // BATCH 초기화
                insertStatement.clearBatch();
            }
            params.put("O_PROCESS_CNT", recvSeq);
            params.put("O_FILE_NM", ediRecvFileName);
            Util.setOutMessage(resultMap, Consts.OK);
        } catch (Exception e) {
            String errorMessage = Util.getErrorMessage(e);
            // 반영 오류 중 KEY 중복은 메시지 변경
            if (e instanceof BatchUpdateException) {
                if (errorMessage.contains("ORA-00001")) {
                    errorMessage = NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[" + ifApiDiv //
                        + "] 중복 데이터가 수신되었습니다. 확인 후 처리하십시오.", new String[] {ifApiDiv});
                }
            }
            Util.setOutMessage(resultMap, errorMessage);
            // Error로 백업
            if (ediRecvFileBackupFullName != null) {
                ediRecvFileBackupFullName = ediRecvFileBackupFullName.replace(".json", "_ERROR.json");
            }
            if (ediRecvFileName != null) {
                params.put("O_FILE_NM", ediRecvFileName.replace(".json", "_ERROR.json"));
            }
        } finally {
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

        return resultMap;
    }

    /**
     * IFAPI EDI 수신정의로 수신 처리(Json)
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> recvIfApiDefinitionProcessing(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = Util.newMap();
        try {
            // IFAPI 종류
            // R11 - EDI 수신정의 정보로 수신 처리(payload에 정의정보 존재), 기본값
            // R12 - EDI 수신정의 정보로 수신 처리(수신구분,사업부코드로 정의정보 검색)
            String ifApiType = Util.nullToEmpty(params.get("P_IFAPI_TYPE"));

            // R12일 경우 수신정의 정보 검색해서 params에 추가
            if ("R12".equals(ifApiType)) {
                // 수신정의 정보 검색
                Map<String, Object> ifApiSpec = getIfApiSpecDefinition(params);
                String oMsg = Util.getOutMessage(ifApiSpec);
                if (!Consts.OK.equals(oMsg)) {
                    params.put("O_ERROR_STATUS", HttpStatus.BAD_REQUEST);

                    // IFAPI Spec이 없을 경우 오류 처리
                    recvIfApiProcessingBeforeErrorLog( //
                        (String)params.get(Consts.PK_USER_ID), //
                        (String)params.get("P_IFAPI_GRP"), //
                        (String)params.get("P_IFAPI_DIV"), //
                        (String)params.get("P_DOCUMENT"), //
                        HttpStatus.BAD_REQUEST.toString() //
                    );

                    throw new RuntimeException(oMsg);
                }

                params.put("P_BU_CD", ifApiSpec.get("BU_CD"));
                params.put("P_EDI_DIV", ifApiSpec.get("EDI_DIV"));
                params.put("P_DEFINE_NO", ifApiSpec.get("DEFINE_NO"));
                params.put("P_RETURN_AFTER_DATA_INSERT", ifApiSpec.get("RETURN_AFTER_DATA_INSERT"));
            }

            // 수신정의 상세 정보 검색
            List<Map<String, Object>> lstDefineInfo = dao.getDefineRemoteInfo(params);
            if (lstDefineInfo == null || lstDefineInfo.size() == 0) {
                params.put("O_ERROR_STATUS", HttpStatus.NOT_FOUND);

                // 수신정의 정보가 없을 경우 오류 처리
                recvIfApiProcessingBeforeErrorLog( //
                    (String)params.get(Consts.PK_USER_ID), //
                    (String)params.get("P_IFAPI_GRP"), //
                    (String)params.get("P_IFAPI_DIV"), //
                    (String)params.get("P_DOCUMENT"), //
                    HttpStatus.NOT_FOUND.toString() //
                );

                throwIfApiDefinitionError( //
                    Util.nullToEmpty(params.get("P_BU_CD")), //
                    Util.nullToEmpty(params.get("P_EDI_DIV")), //
                    Util.nullToEmpty(params.get("P_DEFINE_NO")), //
                    NexosMessage.getDisplayMsg("JAVA.ED.XXX", "수신정의 정보가 존재하지 않습니다. 확인 후 작업하십시오.") //
                );
            }
            Map<String, Object> defineInfo = lstDefineInfo.get(0);
            params.put("P_DATA_DIV", Consts.DATA_DIV_JSON);
            Map<String, Object> jsonResultInfo = dao.getJsonResultInfo( //
                (String)defineInfo.get("JSON_TAG_RESULT"), //
                (String)defineInfo.get("JSON_TAG_RESULT_MAP"));
            params.put("P_JSON_RESULT_INFO", jsonResultInfo);

            String returnAfterDataInsertYn = (String)params.get("P_RETURN_AFTER_DATA_INSERT");
            if (Util.isNull(returnAfterDataInsertYn)) {
                returnAfterDataInsertYn = (String)jsonResultInfo.get("P_RETURN_AFTER_DATA_INSERT");
            }

            // Json parsing -> Insert EDI Table
            TransactionStatus ts = beginTrans();
            try {
                resultMap = dao.recvDataProcessing(params);

                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }

                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                throw new RuntimeException(Util.getErrorMessage(e));
            }

            params.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
            params.put("P_RECV_NO", resultMap.get("P_RECV_NO"));

            // P_RETURN_AFTER_DATA_INSERT가
            // Y일 경우 EDI 테이블에만 정상 INSERT가 되면 정상으로 리턴
            // [컬럼체크, 수신처리, 수신후처리]까지 백그라운드에서 처리
            if (Consts.YES.equals(returnAfterDataInsertYn)) {
                recvIfApiDefinitionPayloadTask(params);
            }
            // N일 경우 EDI 수신처리 후 오류가 없을 경우 정상으로 리턴
            // 수신 payload 전체를 기준으로 모두 정상처리일 경우만 정상, 그외 모두 오류
            // [EDI 테이블 INSERT, 컬럼체크, 수신처리, 수신후처리]까지 모두 정상
            else {
                resultMap = callERProcessing(params);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
            Util.setOutMessage(params, Consts.OK);
        } catch (Exception e) {
            Util.setOutMessage(params, Util.getErrorMessage(e));
        }

        // IFAPI 리턴 메시지 변경 처리
        setIfApiResultDefinition(params);

        return params;
    }

    private void recvIfApiDefinitionPayloadTask(Map<String, Object> params) {

        final Map<String, Object> callParams = new HashMap<String, Object>(params);
        new Thread(new Runnable() {

            @Override
            public void run() {
                AuthenticationUtil.configureAuthentication();
                try {
                    callERProcessing(callParams);
                } catch (Exception e) {
                } finally {
                    AuthenticationUtil.clearAuthentication();
                }
            }
        }).start();
    }

    /**
     * 데이터 입력 이후의 수신 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    private Map<String, Object> callERProcessing(Map<String, Object> params) throws Exception {

        Map<String, Object> returnMap = new HashMap<String, Object>();
        returnMap.put(Consts.PK_O_MSG, Consts.OK);
        Map<String, Object> realtimeMap = null;
        TransactionStatus ts = beginTrans();
        try {
            params.put("P_ERROR_MSG", null);
            // ER_PROCESSING 호출
            params.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);
            Map<String, Object> resultMap = dao.callERProcessing(params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                params.put("P_ERROR_CD", "P9999R");
                params.put("P_ERROR_NM", "수신처리오류");
                throw new RuntimeException(oMsg);
            }

            // 수신체크 오류 확인
            params.put("P_EDI_DATE", params.get("P_RECV_DATE"));
            params.put("P_EDI_NO", params.get("P_RECV_NO"));
            resultMap = dao.callGetErrorMessage(params);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                params.put("P_ERROR_CD", "P9999R");
                params.put("P_ERROR_NM", "수신처리오류");
                throw new RuntimeException(oMsg);
            }

            // ER_PROCESSING_AFTER 호출
            resultMap = dao.callERProcessingAfter(params);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                params.put("P_ERROR_CD", "P9999A");
                params.put("P_ERROR_NM", "수신후처리오류");
                throw new RuntimeException(oMsg);
            }

            // AFTER 오류 확인
            resultMap = dao.callGetErrorMessage(params);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                params.put("P_ERROR_CD", "P9999A");
                params.put("P_ERROR_NM", "수신후처리오류");
                throw new RuntimeException(oMsg);
            }

            // 실시간 송신 호출
            realtimeMap = service.realtimeSendProcessing();
            oMsg = Util.getOutMessage(realtimeMap);
            if (!Consts.OK.equals(oMsg)) {
                params.put("P_ERROR_CD", "P9999S");
                params.put("P_ERROR_NM", "수신 후 실시간 송신처리오류");
                throw new RuntimeException(oMsg);
            }

            commitTrans(ts);
        } catch (Exception e) {
            String errorMessage = Util.getErrorMessage(e);
            params.put("P_ERROR_MSG", errorMessage);
            Util.setOutMessage(returnMap, errorMessage);
            rollbackTrans(ts);
        }

        // 실시간 결과 데이터 반영, 자체 트랜잭션 처리 함
        if (realtimeMap != null && Consts.OK.equals(Util.getOutMessage(realtimeMap))) {
            service.ifResultProcessing(realtimeMap);
        }

        // 오류일 경우 오류 처리
        if (!Consts.OK.equals(returnMap.get(Consts.PK_O_MSG))) {
            ts = beginTrans();
            try {
                Map<String, Object> resultMap = dao.callERErrorProcessing(params);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
            }
        }

        return returnMap;
    }

    /**
     * IFAPI EDI 송신정의로 수신 처리(Json)
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> sendIfApiDefinitionProcessing(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = Util.newMap();

        ObjectMapper objMapper = new ObjectMapper();
        try {
            // IFAPI 종류
            // S11 - EDI 송신정의 정보로 송신 처리(requestParams에 정의정보 존재)
            // S12 - EDI 송신정의 정보로 송신 처리(송신구분,송업부코드로 정의정보 검색)
            String ifApiType = Util.nullToEmpty(params.get("P_IFAPI_TYPE"));

            // S12일 경우 송신정의 정보 검색해서 params에 추가
            if ("S12".equals(ifApiType)) {
                // 송신정의 정보 검색
                Map<String, Object> ifApiSpec = getIfApiSpecDefinition(params);
                String oMsg = Util.getOutMessage(ifApiSpec);
                if (!Consts.OK.equals(oMsg)) {
                    resultMap.put("O_ERROR_STATUS", HttpStatus.BAD_REQUEST);

                    // IFAPI Spec이 없을 경우 오류 처리
                    sendIfApiProcessingBeforeErrorLog( //
                        (String)params.get(Consts.PK_USER_ID), //
                        (String)params.get("P_IFAPI_GRP"), //
                        (String)params.get("P_IFAPI_DIV"), //
                        (String)params.get("P_REQUEST_PARAMS"), //
                        HttpStatus.BAD_REQUEST.toString() //
                    );

                    throw new RuntimeException(oMsg);
                }

                params.put("P_BU_CD", ifApiSpec.get("BU_CD"));
                params.put("P_EDI_DIV", ifApiSpec.get("EDI_DIV"));
                params.put("P_DEFINE_NO", ifApiSpec.get("DEFINE_NO"));
            }

            // 송신정의 상세내역 쿼리 파라메터 값 읽기
            String buCd = Util.nullToEmpty(params.get("P_BU_CD"));
            String ediDiv = Util.nullToEmpty(params.get("P_EDI_DIV"));
            String defineNo = Util.nullToEmpty(params.get("P_DEFINE_NO"));

            // 송신정의 상세내역 데이터 쿼리
            List<Map<String, Object>> lstDefineInfo = dao.getDefineInfo(params);
            if (lstDefineInfo == null || lstDefineInfo.size() == 0) {

                resultMap.put("O_ERROR_STATUS", HttpStatus.NOT_FOUND);
                // 송신정의 정보가 없을 경우 오류 처리
                sendIfApiProcessingBeforeErrorLog( //
                    (String)params.get(Consts.PK_USER_ID), //
                    (String)params.get("P_IFAPI_GRP"), //
                    (String)params.get("P_IFAPI_DIV"), //
                    (String)params.get("P_REQUEST_PARAMS"), //
                    HttpStatus.NOT_FOUND.toString() //
                );

                throwIfApiDefinitionError(buCd, ediDiv, defineNo, //
                    NexosMessage.getDisplayMsg("JAVA.ED.XXX", "송신정의 정보가 존재하지 않습니다. 확인 후 작업하십시오."));
            }

            Map<String, Object> defineInfo = lstDefineInfo.get(0);
            Map<String, Object> jsonResultInfo = dao.getJsonResultInfo( //
                (String)defineInfo.get("JSON_TAG_RESULT"), //
                (String)defineInfo.get("JSON_TAG_RESULT_MAP"));
            params.put("P_JSON_RESULT_INFO", jsonResultInfo);

            // 송신정의에서 기본 정보 읽기
            String pkgNm = (String)defineInfo.get("PKG_NM");
            String pkgParamMap = (String)defineInfo.get("PKG_PARAM_MAP");
            String jsonTagRoot = (String)defineInfo.get("JSON_TAG_ROOT");
            String jsonTagBunch = (String)defineInfo.get("JSON_TAG_BUNCH");
            String jsonTagSubBunch = (String)defineInfo.get("JSON_TAG_SUB_BUNCH");

            if (Util.isNull(jsonTagRoot)) {
                throwIfApiDefinitionError(buCd, ediDiv, defineNo, //
                    NexosMessage.getDisplayMsg("JAVA.ED.XXX", "JSON 루트태그가 정의되지 않았습니다."));
            }
            if (Util.isNull(jsonTagBunch) && Util.isNull(jsonTagSubBunch)) {
                throwIfApiDefinitionError(buCd, ediDiv, defineNo, //
                    NexosMessage.getDisplayMsg("JAVA.ED.XXX", "JSON 단위태그가 정의되지 않았습니다."));
            }
            boolean writeDetailToRoot = false;
            if (Util.isNotNull(jsonTagSubBunch)) {
                if (jsonTagBunch.indexOf("#DETAIL_DATA#") == -1) {
                    if (jsonTagRoot.indexOf("#DETAIL_DATA#") != -1) {
                        writeDetailToRoot = true;
                    } else {
                        throwIfApiDefinitionError(buCd, ediDiv, defineNo, //
                            NexosMessage.getDisplayMsg("JAVA.ED.XXX", "JSON 단위 태그에 #DETAIL_DATA#에 대한 정의가 되어 있지 않습니다."));
                    }
                }
            } else {
                if (jsonTagRoot.indexOf("#MASTER_DATA#") == -1) {
                    throwIfApiDefinitionError(buCd, ediDiv, defineNo, //
                        NexosMessage.getDisplayMsg("JAVA.ED.XXX", "JSON 루트 태그에 #MASTER_DATA#에 대한 정의가 되어 있지 않습니다."));
                }
            }

            String jsonTagResult = (String)jsonResultInfo.get("P_TAG_RESULT");
            if (Util.isNotNull(jsonTagResult)) {
                String messageCd = (String)jsonResultInfo.get("P_RESULT_CD_SUCCESS");
                // 숫자 타입
                if ("NUMBER".equals(jsonResultInfo.get("P_RESULT_CD_DATA_TYPE"))) {
                    jsonTagResult = jsonTagResult.replace("#RESULT_CD#", messageCd);
                }
                // 문자 타입
                else {
                    jsonTagResult = jsonTagResult.replace("#RESULT_CD#", "\"" + messageCd + "\"");
                }
                jsonTagResult = jsonTagResult.replace("#RESULT_MSG#", "\"" + Consts.OK + "\"");
            }

            String columnNm = null;
            String dataType = null;
            Object columnVal = null;
            String dataDefault = null;
            String writeColumnVal = null;

            // 실제 정의한 컬럼만 추출
            Vector<Object> vtColumn;
            int columnCount = lstDefineInfo.size();
            ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();

            for (int i = 0; i < columnCount; i++) {
                defineInfo = lstDefineInfo.get(i);
                try {
                    columnNm = (String)defineInfo.get("COLUMN_NM");
                    dataType = (String)defineInfo.get("DATA_TYPE");
                    dataDefault = (String)defineInfo.get("DATA_DEFAULT");

                    if (Util.isNotNull(columnNm)) {
                        vtColumn = new Vector<Object>();
                        vtColumn.add(columnNm);
                        vtColumn.add(dataType);
                        if (Util.isNull(dataDefault)) {
                            vtColumn.add(null);
                        } else {
                            vtColumn.add(dataDefault);
                        }
                        columns.add(vtColumn);
                    }
                } catch (Exception e) {
                }
            }
            columnCount = columns.size();
            if (columnCount == 0) {
                throwIfApiDefinitionError(buCd, ediDiv, defineNo, //
                    NexosMessage.getDisplayMsg("JAVA.ED.XXX", "송신정의 컬럼 중 처리 가능한 컬럼이 없습니다."));
            }

            // SQL#[SQL문]# -> SQL문 실행 후 결과 입력
            jsonTagRoot = dao.replaceSQLText(jsonTagRoot);
            jsonTagBunch = dao.replaceSQLText(jsonTagBunch);
            jsonTagSubBunch = dao.replaceSQLText(jsonTagSubBunch);

            // 파라메터 매핑정보로 파라메터 값 세팅
            Map<String, Object> callParams = Util.newMap();
            callParams.put("P_BU_CD", buCd);
            callParams.put("P_EDI_DIV", ediDiv);
            callParams.put("P_DEFINE_NO", defineNo);
            callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
            Map<String, Object> pkgParams = Util.toKeyValues(pkgParamMap);
            for (String keyValue : pkgParams.keySet()) {
                callParams.put((String)pkgParams.get(keyValue), params.get(keyValue));
            }

            // 파라메터 값 입력
            for (String keyValue : callParams.keySet()) {
                columnNm = "#" + keyValue + "#";
                columnVal = callParams.get(keyValue);
                jsonTagRoot = jsonTagRoot.replace(columnNm, Util.nullToDefault(columnVal, ""));
                jsonTagBunch = jsonTagBunch.replace(columnNm, Util.nullToDefault(columnVal, ""));
                jsonTagSubBunch = jsonTagSubBunch.replace(columnNm, Util.nullToDefault(columnVal, ""));
            }

            // 송신정의 상세내역 데이터 쿼리
            List<Map<String, Object>> list = null;
            TransactionStatus ts = beginTrans();
            try {
                list = getDataList(pkgNm, callParams);
                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                throw e;
            }
            if (list == null || list.size() == 0) {
                throwIfApiDefinitionError(buCd, ediDiv, defineNo, //
                    NexosMessage.getDisplayMsg("JAVA.ED.XXX", "송신할 데이터가 존재하지 않습니다."));
            }

            int listCnt = list.size();
            Map<String, Object> rowData;

            String jsonCurrTagRoot = jsonTagRoot;
            String jsonCurrTagBunch = jsonTagBunch;
            String jsonCurrTagSubBunch = jsonTagSubBunch;
            ArrayList<String> jsonCurrTagBunchList = new ArrayList<String>();
            StringBuffer sbWriteBuffer = new StringBuffer();
            int bunchCount;

            // 마스터 형태로 구성된 데이터 처리
            if (Util.isNull(jsonTagSubBunch)) {
                boolean encode = Consts.YES.equals(jsonResultInfo.get("P_MESSAGE_ENCODE_YN"));
                for (int row = 0; row < listCnt; row++) {
                    rowData = list.get(row);

                    jsonCurrTagBunch = jsonTagBunch;
                    for (int col = 0; col < columnCount; col++) {
                        vtColumn = columns.get(col);

                        columnNm = (String)vtColumn.get(0);
                        dataType = (String)vtColumn.get(1);
                        columnVal = rowData.get(columnNm);
                        if (columnVal == null) {
                            writeColumnVal = "null";
                        } else {
                            try {
                                // 숫자
                                if ("3".equals(dataType) && columnVal instanceof String) {
                                    writeColumnVal = objMapper.writeValueAsString(Integer.parseInt((String)columnVal));
                                } else {
                                    // 문자열, 날짜, 기타
                                    if (columnVal instanceof String) {
                                        writeColumnVal = objMapper.writeValueAsString(dao.urlEncodeMessage(encode, (String)columnVal));
                                    } else {
                                        writeColumnVal = objMapper.writeValueAsString(columnVal);
                                    }
                                }
                            } catch (Exception e) {
                                if (columnVal instanceof String) {
                                    writeColumnVal = objMapper.writeValueAsString(dao.urlEncodeMessage(encode, (String)columnVal));
                                } else {
                                    writeColumnVal = objMapper.writeValueAsString(columnVal);
                                }
                            }
                        }
                        columnNm = "#" + columnNm + "#";
                        jsonCurrTagBunch = jsonCurrTagBunch.replace(columnNm, writeColumnVal);
                        jsonCurrTagRoot = jsonCurrTagRoot.replace(columnNm, writeColumnVal);
                    }
                    jsonCurrTagBunchList.add(jsonCurrTagBunch);
                }

                sbWriteBuffer.setLength(0);
                bunchCount = jsonCurrTagBunchList.size();
                if (bunchCount > 0) {
                    sbWriteBuffer.append(jsonCurrTagBunchList.get(0));
                    for (int i = 1; i < bunchCount; i++) {
                        sbWriteBuffer.append(",").append(Consts.CRLF).append(jsonCurrTagBunchList.get(i));
                    }
                    jsonCurrTagBunchList.clear();
                    jsonCurrTagRoot = jsonCurrTagRoot.replace("#MASTER_DATA#", sbWriteBuffer.toString());
                    sbWriteBuffer.setLength(0);
                }
                if (Util.isNotNull(jsonTagResult)) {
                    jsonCurrTagRoot = jsonCurrTagRoot.replace("#RESULT_DATA#", jsonTagResult + ",");
                }
            }
            // 마스터/디테일 형태로 구성된 데이터 처리
            else {
                ArrayList<String> jsonCurrTagSubBunchList = new ArrayList<String>();
                // 마스터, 디테일이 별도로 루트에 포함되어 있는 경우
                if (writeDetailToRoot) {
                    for (int row = 0; row < listCnt; row++) {
                        rowData = list.get(row);

                        boolean mdTypeM = "M".equals(rowData.get("MD_TYPE"));
                        // 마스터 데이터일 경우 마스터 입력 태그 기본값으로 초기화, 전표별 첫 데이터
                        if (mdTypeM) {
                            jsonCurrTagBunch = jsonTagBunch;
                        }
                        // 디테일 입력 태그 기본값으로 초기화
                        jsonCurrTagSubBunch = jsonTagSubBunch;
                        // 데이터 변경 처리
                        for (int col = 0; col < columnCount; col++) {
                            vtColumn = columns.get(col);

                            columnNm = (String)vtColumn.get(0);
                            dataType = (String)vtColumn.get(1);
                            columnVal = rowData.get(columnNm);
                            if (columnVal == null) {
                                writeColumnVal = "null";
                            } else {
                                try {
                                    // 숫자
                                    if ("3".equals(dataType) && columnVal instanceof String) {
                                        writeColumnVal = objMapper.writeValueAsString(Integer.parseInt((String)columnVal));
                                    } else {
                                        // 문자열, 날짜, 기타
                                        writeColumnVal = objMapper.writeValueAsString(columnVal);
                                    }
                                } catch (Exception e) {
                                    writeColumnVal = objMapper.writeValueAsString(columnVal);
                                }
                            }
                            columnNm = "#" + columnNm + "#";
                            jsonCurrTagBunch = jsonCurrTagBunch.replace(columnNm, writeColumnVal);
                            jsonCurrTagSubBunch = jsonCurrTagSubBunch.replace(columnNm, writeColumnVal);
                            jsonCurrTagRoot = jsonCurrTagRoot.replace(columnNm, writeColumnVal);
                        }
                        if (mdTypeM) {
                            jsonCurrTagBunchList.add(jsonCurrTagBunch);
                        }
                        jsonCurrTagSubBunchList.add(jsonCurrTagSubBunch);
                    }

                    // 마스터 변경
                    sbWriteBuffer.setLength(0);
                    bunchCount = jsonCurrTagBunchList.size();
                    if (bunchCount > 0) {
                        sbWriteBuffer.append(jsonCurrTagBunchList.get(0));
                        for (int i = 1; i < bunchCount; i++) {
                            sbWriteBuffer.append(",").append(Consts.CRLF).append(jsonCurrTagBunchList.get(i));
                        }
                        jsonCurrTagBunchList.clear();
                        jsonCurrTagRoot = jsonCurrTagRoot.replace("#MASTER_DATA#", sbWriteBuffer.toString());
                    }
                    // 디테일 변경
                    sbWriteBuffer.setLength(0);
                    bunchCount = jsonCurrTagSubBunchList.size();
                    if (bunchCount > 0) {
                        sbWriteBuffer.append(jsonCurrTagSubBunchList.get(0));
                        for (int i = 1; i < bunchCount; i++) {
                            sbWriteBuffer.append(",").append(Consts.CRLF).append(jsonCurrTagSubBunchList.get(i));
                        }
                        jsonCurrTagSubBunchList.clear();
                        jsonCurrTagRoot = jsonCurrTagRoot.replace("#DETAIL_DATA#", sbWriteBuffer.toString());
                    }
                    if (Util.isNotNull(jsonTagResult)) {
                        jsonCurrTagRoot = jsonCurrTagRoot.replace("#RESULT_DATA#", jsonTagResult + ",");
                    }
                    sbWriteBuffer.setLength(0);
                }
                // 마스터 하위에 디테일이 포함되어 있는 경우
                else {
                    for (int row = 0; row < listCnt; row++) {
                        rowData = list.get(row);

                        if ("M".equals(rowData.get("MD_TYPE"))) {
                            // 이전 데이터 처리
                            sbWriteBuffer.setLength(0);
                            bunchCount = jsonCurrTagSubBunchList.size();
                            if (bunchCount > 0) {
                                sbWriteBuffer.append(jsonCurrTagSubBunchList.get(0));
                                for (int i = 1; i < bunchCount; i++) {
                                    sbWriteBuffer.append(",").append(Consts.CRLF).append(jsonCurrTagSubBunchList.get(i));
                                }
                                jsonCurrTagSubBunchList.clear();
                                jsonCurrTagBunch = jsonCurrTagBunch.replace("#DETAIL_DATA#", sbWriteBuffer.toString());
                                sbWriteBuffer.setLength(0);

                                jsonCurrTagBunchList.add(jsonCurrTagBunch);
                            }

                            jsonCurrTagBunch = jsonTagBunch;
                        }

                        jsonCurrTagSubBunch = jsonTagSubBunch;
                        for (int col = 0; col < columnCount; col++) {
                            vtColumn = columns.get(col);

                            columnNm = (String)vtColumn.get(0);
                            dataType = (String)vtColumn.get(1);
                            columnVal = rowData.get(columnNm);
                            if (columnVal == null) {
                                writeColumnVal = "null";
                            } else {
                                try {
                                    // 숫자
                                    if ("3".equals(dataType) && columnVal instanceof String) {
                                        writeColumnVal = objMapper.writeValueAsString(Integer.parseInt((String)columnVal));
                                    } else {
                                        // 문자열, 날짜, 기타
                                        writeColumnVal = objMapper.writeValueAsString(columnVal);
                                    }
                                } catch (Exception e) {
                                    writeColumnVal = objMapper.writeValueAsString(columnVal);
                                }
                            }
                            columnNm = "#" + columnNm + "#";
                            jsonCurrTagBunch = jsonCurrTagBunch.replace(columnNm, writeColumnVal);
                            jsonCurrTagSubBunch = jsonCurrTagSubBunch.replace(columnNm, writeColumnVal);
                            jsonCurrTagRoot = jsonCurrTagRoot.replace(columnNm, writeColumnVal);
                        }
                        jsonCurrTagSubBunchList.add(jsonCurrTagSubBunch);
                    }

                    // 이전 데이터 처리
                    sbWriteBuffer.setLength(0);
                    bunchCount = jsonCurrTagSubBunchList.size();
                    if (bunchCount > 0) {
                        sbWriteBuffer.append(jsonCurrTagSubBunchList.get(0));
                        for (int i = 1; i < bunchCount; i++) {
                            sbWriteBuffer.append(",").append(Consts.CRLF).append(jsonCurrTagSubBunchList.get(i));
                        }
                        jsonCurrTagSubBunchList.clear();
                        jsonCurrTagBunch = jsonCurrTagBunch.replace("#DETAIL_DATA#", sbWriteBuffer.toString());
                        jsonCurrTagBunchList.add(jsonCurrTagBunch);
                    }

                    sbWriteBuffer.setLength(0);
                    bunchCount = jsonCurrTagBunchList.size();
                    if (bunchCount > 0) {
                        sbWriteBuffer.append(jsonCurrTagBunchList.get(0));
                        for (int i = 1; i < bunchCount; i++) {
                            sbWriteBuffer.append(",").append(Consts.CRLF).append(jsonCurrTagBunchList.get(i));
                        }
                        jsonCurrTagBunchList.clear();
                        jsonCurrTagRoot = jsonCurrTagRoot.replace("#MASTER_DATA#", sbWriteBuffer.toString());
                    }
                    if (Util.isNotNull(jsonTagResult)) {
                        jsonCurrTagRoot = jsonCurrTagRoot.replace("#RESULT_DATA#", jsonTagResult + ",");
                    }
                    sbWriteBuffer.setLength(0);
                }
            }

            resultMap.put("O_DOCUMENT", jsonCurrTagRoot);
            Util.setOutMessage(resultMap, Consts.OK);
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        }

        return resultMap;
    }

    /**
     * 수신처리 Java 오류 DB처리로그에 기록
     *
     * @param params
     * @param errorMessage
     */
    public void recvIfApiProcessingErrorLogWrite(Map<String, Object> params, String errorMessage) {

        try {
            StringBuffer sbLogComment = new StringBuffer();
            String doc = Util.nullToEmpty(params.get("P_DOCUMENT")).replaceAll("\r{0,}\n {2,}", " ").replaceAll("\r{0,}\n", " ");
            // 수신 데이터는 최대 1000자만 기록
            if (doc.length() > 1000) {
                doc = doc.substring(0, 1000) + " ... [" + (doc.length() - 1000) + "]";
            }
            sbLogComment //
                .append("P_RECV_ID: ").append(Util.nullToEmpty(params.get("P_RECV_ID"))).append(Consts.CR) //
                .append("P_USER_ID: ").append(Util.nullToEmpty(params.get(Consts.PK_USER_ID))).append(Consts.CR) //
                .append("P_IFAPI_DIV: ").append(params.get("P_IFAPI_DIV")).append(Consts.CR) //
                .append("P_DOCUMENT: ").append(doc).append(Consts.CR) //
                .append("P_FILE_NM: ").append(Util.nullToEmpty(params.get("O_FILE_NM"))).append(Consts.CR) //
                .append("O_MSG: ").append(errorMessage) //
            ;
            Map<String, Object> callParams = Util.newMap();
            callParams.put("P_LOG_CD", "JAVA.EDIFAPISERVICE.RECVIFAPIPROCESSING");
            callParams.put("P_LOG_COMMENT", sbLogComment.toString());
            callParams.put("P_LOG_DIV", "E");
            getDefaultDao().writeLog(callParams);
        } catch (Exception e) {
        }
    }

    /**
     * 송신처리 Java 오류 DB처리로그에 기록
     *
     * @param params
     * @param errorMessage
     */
    public void sendIfApiProcessingErrorLogWrite(Map<String, Object> params, String errorMessage) {

        try {
            StringBuffer sbLogComment = new StringBuffer();
            String requestParams = Util.nullToEmpty(params.get("P_REQUEST_PARAMS")).replaceAll("\r{0,}\n {2,}", " ").replaceAll("\r{0,}\n", " ");
            // 송신 요청 파라메터 데이터는 최대 1000자만 기록
            if (requestParams.length() > 1000) {
                requestParams = requestParams.substring(0, 1000) + " ... [" + (requestParams.length() - 1000) + "]";
            }
            sbLogComment //
                .append("P_USER_ID: ").append(Util.nullToEmpty(params.get(Consts.PK_USER_ID))).append(Consts.CR) //
                .append("P_IFAPI_DIV: ").append(params.get("P_IFAPI_DIV")).append(Consts.CR) //
                .append("P_REQUEST_PARAMS: ").append(requestParams).append(Consts.CR) //
                .append("P_FILE_NM: ").append(Util.nullToEmpty(params.get("O_FILE_NM"))).append(Consts.CR) //
                .append("O_MSG: ").append(errorMessage) //
            ;
            Map<String, Object> callParams = Util.newMap();
            callParams.put("P_LOG_CD", "JAVA.EDIFAPISERVICE.SENDIFAPIPROCESSING");
            callParams.put("P_LOG_COMMENT", sbLogComment.toString());
            callParams.put("P_LOG_DIV", "E");
            getDefaultDao().writeLog(callParams);
        } catch (Exception e) {
        }
    }

    /**
     * recvIfApiProcessing 호출 전 Java 오류 DB처리로그에 기록
     *
     * @param principal
     * @param ifApiGrp
     * @param ifApiDiv
     * @param payload
     * @param errorMessage
     */
    public void recvIfApiProcessingBeforeErrorLog(Object principal, String ifApiGrp, String ifApiDiv, String payload, String errorMessage) {

        String userId = null;
        // principal이 HttpServletRequest일 경우 인증정보에서 사용자ID 가져오기
        if (principal instanceof HttpServletRequest) {
            try {
                userId = AuthenticationUtil.getPrincipalFromAuthorization(AuthenticationUtil.getHttpAuthorization((HttpServletRequest)principal));
            } catch (Exception e) {
            }
        }
        // principal이 String일 경우 사용자ID로
        else if (principal instanceof String) {
            userId = (String)principal;
        }

        if (Util.isNull(userId)) {
            userId = "NONE";
        }

        // 수신 payload 파일로 기록
        String ediRecvFileName = null;
        try {
            String ediRecvDatetime = Util.getNowDate("yyyyMMddHHmmssSSS");
            ediRecvFileName = Util.replaceRestrictChars(Util.toJoin("_", //
                new String[] { //
                    userId, // 사용자ID
                    ediRecvDatetime, // 수신일시
                    ifApiDiv, // API구분
                    RandomStringUtils.randomNumeric(5), // 랜덤 5자리 숫자
                    "DOC_ERROR.json" //
                }));
            String ediRecvFullPath = Util.getPathName(dao.getRecvFileRootPath(), ifApiGrp);
            String ediRecvFileBackupPath = dao.getBackupFilePath(ediRecvFullPath, ediRecvDatetime, ifApiDiv);
            String ediRecvFileBackupFullName = ediRecvFileBackupPath + ediRecvFileName;

            Util.createDir(ediRecvFullPath, ediRecvFileBackupPath);
            File ediRecvFile = new File(ediRecvFileBackupFullName);
            FileUtils.writeStringToFile(ediRecvFile, payload, Consts.CHARSET);
        } catch (Exception e) {
        }

        // 오류 로그 기록 추가 정보 입력
        Map<String, Object> params = Util.newMap();
        params.put("P_FILE_DIV", Consts.FILE_DIV_DOC);
        params.put("P_DOCUMENT", payload);
        params.put("O_FILE_NM", Util.nullToEmpty(ediRecvFileName));
        params.put("P_IFAPI_DIV", ifApiDiv);
        params.put(Consts.PK_USER_ID, userId);

        // 오류 로그 기록
        recvIfApiProcessingErrorLogWrite(params, errorMessage);
    }

    /**
     * sendIfApiProcessing 호출 전 Java 오류 DB처리로그에 기록
     *
     * @param principal
     * @param ifApiGrp
     * @param ifApiDiv
     * @param payload
     * @param errorMessage
     */
    public void sendIfApiProcessingBeforeErrorLog(Object principal, String ifApiGrp, String ifApiDiv, String requestParams, String errorMessage) {

        String userId = null;
        // principal이 HttpServletRequest일 경우 인증정보에서 사용자ID 가져오기
        if (principal instanceof HttpServletRequest) {
            try {
                userId = AuthenticationUtil.getPrincipalFromAuthorization(AuthenticationUtil.getHttpAuthorization((HttpServletRequest)principal));
            } catch (Exception e) {
            }
        }
        // principal이 String일 경우 사용자ID로
        else if (principal instanceof String) {
            userId = (String)principal;
        }

        if (Util.isNull(userId)) {
            userId = "NONE";
        }

        // 수신 payload 파일로 기록
        String ediSendFileName = null;
        try {
            String ediSendDatetime = Util.getNowDate("yyyyMMddHHmmssSSS");
            ediSendFileName = Util.replaceRestrictChars(Util.toJoin("_", //
                new String[] { //
                    userId, // 사용자ID
                    ediSendDatetime, // 수신일시
                    ifApiDiv, // API구분
                    RandomStringUtils.randomNumeric(5), // 랜덤 5자리 숫자
                    "REQ_ERROR.json" //
                }));
            String ediSendFullPath = Util.getPathName(dao.getSendFileRootPath(), ifApiGrp);
            String ediSendFileBackupPath = dao.getBackupFilePath(ediSendFullPath, ediSendDatetime, ifApiDiv);
            String ediSendFileBackupFullName = ediSendFileBackupPath + ediSendFileName;

            Util.createDir(ediSendFullPath, ediSendFileBackupPath);
            File ediSendFile = new File(ediSendFileBackupFullName);
            FileUtils.writeStringToFile(ediSendFile, requestParams, Consts.CHARSET);
        } catch (Exception e) {
        }

        // 오류 로그 기록 추가 정보 입력
        Map<String, Object> params = Util.newMap();
        params.put("P_FILE_DIV", Consts.FILE_DIV_DOC);
        params.put("P_REQUEST_PARAMS", requestParams);
        params.put("O_FILE_NM", Util.nullToEmpty(ediSendFileName));
        params.put("P_IFAPI_DIV", ifApiDiv);
        params.put(Consts.PK_USER_ID, userId);

        // 오류 로그 기록
        sendIfApiProcessingErrorLogWrite(params, errorMessage);
    }
}