package nexos.dao.ed.common;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;

import nexos.framework.db.dynamic.DynamicDataSource;
import nexos.framework.support.DaoSupport;

public interface EDCommonDAO {

    /**
     * EDI 송수신 정의 정보 리턴
     *
     * @param params
     * @return
     */
    List<Map<String, Object>> getDefineInfo(Map<String, Object> params);

    /**
     * EDI 수신조회조건 정의 정보 리턴
     *
     * @param params
     * @return
     */
    List<Map<String, Object>> getIdentifierInfo(Map<String, Object> params);

    /**
     * EDI 송수신 정의 원격 서버 정보 리턴
     *
     * @param params
     * @return
     */
    List<Map<String, Object>> getDefineRemoteInfo(Map<String, Object> params);

    /**
     * 송수신 오류 정보 리턴
     *
     * @param params
     * @return
     */
    List<Map<String, Object>> getErrorInfo(Map<String, Object> params);

    /**
     * 수신처리 결과 정보 리턴
     *
     * @param params
     * @return
     */
    List<Map<String, Object>> getRecvResultInfo(Map<String, Object> params);

    /**
     * 송신 대상 정보 리턴
     *
     * @param params
     * @return
     */
    List<Map<String, Object>> getSendInfo(Map<String, Object> params);

    /**
     * 송신 대상 상세 정보 리턴
     *
     * @param params
     * @return
     */
    List<Map<String, Object>> getSendDetailInfo(Map<String, Object> params);

    /**
     * 수신일자 리턴, 1순위 DB_SERVER, 2순위 WAS_SERVER
     *
     * @return
     * @throws Exception
     */
    String getEDIDate() throws Exception;

    /**
     * 수신일시 리턴, 1순위 DB_SERVER, 2순위 WAS_SERVER
     *
     * @return
     * @throws Exception
     */
    String getEDIDatetime() throws Exception;

    /**
     * NexosDaoSupport 리턴
     *
     * @return
     */
    DaoSupport getDaoSupport();

    /**
     * Json Result Tag Mapping 리턴
     *
     * @param jsonResultTagMap
     * @return
     */
    Map<String, Object> getJsonResultInfo(String jsonResultTag, String jsonResultTagMap);

    /**
     * Xml Result Tag Mapping 리턴
     *
     * @param xmlResultTagMap
     * @return
     */
    Map<String, Object> getXMLResultInfo(String xmlResultTag, String xmlResultTagMap);

    /**
     * Sap Result Mapping 리턴
     *
     * @param xmlResultTagMap
     * @return
     */
    Map<String, Object> getSAPResultInfo(String sapResultMap);

    /**
     * 동적 Datasource 생성 후 리턴
     * <pre>
     * 호출 파라메터 - 필수
     *
     *   P_REMOTE_DIV        : 원격송수신구분
     *   P_LINK_DB_NM        : 데이터베이스명
     *   P_REMOTE_IP         : 원격서버IP
     *   P_REMOTE_PORT       : 원격서버포트
     *   P_REMOTE_USER_ID    : 데이터베이스 사용자ID
     *   P_REMOTE_USER_PWD   : 데이터베이스 사용자PWD
     * </pre>
     *
     * @param params
     * @return
     */
    DynamicDataSource getDynamicDataSource(Map<String, Object> params) throws Exception;

    /**
     * 송수신 파일 백업 Path 리턴
     *
     * @param path
     * @param curDatetime
     * @param ediDiv
     * @return
     */
    String getBackupFilePath(String path, String curDatetime, String ediDiv);

    /**
     * 수신번호 채번
     *
     * @param params
     * @return
     */
    Map<String, Object> getRecvNo(Map<String, Object> params);

    /**
     * 송신시 SELECT/UPDATE 대상에 대한 정보 리턴
     *
     * @param params
     * @return
     */
    Map<String, Object> getSendUpdateInfo(Map<String, Object> params);

    /**
     * DBLink -> EDI Temp Table에 Insert
     *
     * @param params
     */
    Map<String, Object> recvDBLink(Map<String, Object> params) throws Exception;

    /**
     * DBConnect -> EDI Temp Table에 Insert
     *
     * @param params
     */
    Map<String, Object> recvDBConnect(Map<String, Object> params) throws Exception;

    /**
     * Excel 파일 -> EDI Temp Table에 Insert
     *
     * @param params
     */
    Map<String, Object> recvExcel(Map<String, Object> params) throws Exception;

    /**
     * Text 파일 -> EDI Temp Table에 Insert
     *
     * @param params
     */
    Map<String, Object> recvText(Map<String, Object> params) throws Exception;

    /**
     * XML 파일 -> EDI Temp Table에 Insert
     *
     * @param params
     */
    Map<String, Object> recvXML(Map<String, Object> params) throws Exception;

    /**
     * Json 파일 -> EDI Temp Table에 Insert
     *
     * @param params
     */
    Map<String, Object> recvJson(Map<String, Object> params) throws Exception;

    /**
     * SAP Function의 Table -> EDI Temp Table에 Insert
     *
     * @param params
     */
    Map<String, Object> recvSAPFunction(Map<String, Object> params) throws Exception;

    /**
     * EDI Temp Table의 데이터를 DBLink로 송신
     *
     * @param params
     */
    Map<String, Object> sendDBLink(Map<String, Object> params) throws Exception;

    /**
     * EDI Temp Table의 데이터를 DBConnect로 송신
     *
     * @param params
     */
    Map<String, Object> sendDBConnect(Map<String, Object> params) throws Exception;

    /**
     * EDI Temp Table의 데이터를 Excel 파일로 생성
     *
     * @param params
     */
    Map<String, Object> sendExcel(Map<String, Object> params) throws Exception;

    /**
     * EDI Temp Table의 데이터를 Text 파일로 생성
     *
     * @param params
     */
    Map<String, Object> sendText(Map<String, Object> params) throws Exception;

    /**
     * EDI Temp Table의 데이터를 XML 파일로 생성
     *
     * @param params
     */
    Map<String, Object> sendXML(Map<String, Object> params) throws Exception;

    /**
     * EDI Temp Table의 데이터를 Json 파일로 생성
     *
     * @param params
     */
    Map<String, Object> sendJson(Map<String, Object> params) throws Exception;

    /**
     * EDI Temp Table의 데이터를 SAP Function의 Table에 생성
     *
     * @param params
     */
    Map<String, Object> sendSAPFunction(Map<String, Object> params) throws Exception;

    /**
     * FTP 파일 다운로드
     *
     * @param remoteDiv
     * @param remoteIP
     * @param remotePort
     * @param remotePassiveYN
     * @param remoteCharset
     * @param remoteConnTimeout
     * @param remoteReadTimeout
     * @param remoteUserId
     * @param remoteUserPwd
     * @param remoteAuthKey
     * @param remoteDir
     * @param prefixFileNm
     * @param ediDir
     * @return
     * @throws Exception
     */
    Map<String, Object> ftpDownload(String remoteDiv, String remoteIP, String remotePort, String remotePassiveYN, String remoteCharset,
        int remoteConnTimeout, int remoteReadTimeout, String remoteUserId, String remoteUserPwd, String remoteAuthKey, String remoteDir,
        String prefixFileNm, String ediDir) throws Exception;

    /**
     * FTP 파일 업로드
     *
     * @param remoteDiv
     * @param remoteIP
     * @param remorePort
     * @param remotePassiveYN
     * @param remoteCharset
     * @param remoteConnTimeout
     * @param remoteReadTimeout
     * @param remoteUserId
     * @param remoteUserPwd
     * @param remoteAuthKey
     * @param remoteDir
     * @param ediFileName
     * @param backupDir
     * @return
     * @throws Exception
     */
    Map<String, Object> ftpUpload(String remoteDiv, String remoteIP, String remorePort, String remotePassiveYN, String remoteCharset,
        int remoteConnTimeout, int remoteReadTimeout, String remoteUserId, String remoteUserPwd, String remoteAuthKey, String remoteDir,
        String ediFileName, String backupDir) throws Exception;

    /**
     * 수신 웹서비스 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> recvWebService(Map<String, Object> params) throws Exception;

    /**
     * 송신 웹서비스 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> sendWebService(Map<String, Object> params) throws Exception;

    /**
     * 수신화면 1차 수신처리 - EDI TABLE에 INSERT
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> recvDataProcessing(Map<String, Object> params) throws Exception;

    /**
     * 송수신 오류 메시지 리턴
     *
     * @param params
     * @return
     */
    Map<String, Object> callGetErrorMessage(Map<String, Object> params);

    /**
     * 수신 오류 처리
     *
     * @param params
     * @return
     */
    Map<String, Object> callERErrorProcessing(Map<String, Object> params);

    /**
     * ER_PROCESSING 호출(컬럼체크, 수신체크, TRANSACTION TABLE에 INSERT)
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callERProcessing(Map<String, Object> params) throws Exception;

    /**
     * ER_PROCESSING_RESULT 호출(컬럼체크, 수신체크, TRANSACTION TABLE에 INSERT)
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callERProcessingResult(Map<String, Object> params) throws Exception;

    /**
     * ER_PROCESSING_AFTER 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callERProcessingAfter(Map<String, Object> params) throws Exception;

    /**
     * 송신화면 파일다운로드처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> sendFileDownload(Map<String, Object> params) throws Exception;

    /**
     * ES_PROCESSING 호출 - EDI TABLE에 INSERT, DBLink일 경우 고객사 EDI TABLE에 INSERT
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callESProcessing(Map<String, Object> params) throws Exception;

    /**
     * ES_PROCESSING_RESILT 호출 - EDI TABLE에 INSERT, DBLink일 경우 고객사 EDI TABLE에 INSERT
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callESProcessingResult(Map<String, Object> params) throws Exception;

    /**
     * 송신화면 2차 송신처리 - DBConnect만 해당, 고객사 EDI TABLE에 INSERT
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> sendDataProcessing(Map<String, Object> params) throws Exception;

    /**
     * 메일 전송
     *
     * @param params
     * @return
     * @throws Exception
     */
    String sendEmail(Map<String, Object> params);

    /**
     * Message를 Url Encode 처리
     *
     * @param resultInfo
     * @param message
     * @return
     */
    String urlEncodeMessage(Map<String, Object> resultInfo, String message);

    /**
     * Message를 Url Encode 처리
     *
     * @param encode
     * @param message
     * @return
     */
    String urlEncodeMessage(boolean encode, String message);

    /**
     * Message를 Url Decode 처리
     *
     * @param resultInfo
     * @param message
     * @return
     */
    String urlDecodeMessage(Map<String, Object> resultInfo, String message);

    /**
     * Message를 Url Decode 처리
     *
     * @param decode
     * @param message
     * @return
     */
    String urlDecodeMessage(boolean decode, String message);

    /**
     * 파일 수신 Root Path
     *
     * @return
     */
    String getRecvFileRootPath();

    /**
     * 파일 송신 Root Path
     *
     * @return
     */
    String getSendFileRootPath();

    /**
     * SQL#[SQL_TEXT] 형식으로 된 문자열에서 SQL_TEXT만 파싱하여 SELECT 후 결과를 SQL#[SQL_TEXT]와 치환 처리
     *
     * @param originalText
     * @return
     */
    String replaceSQLText(String originalText);

    /**
     * 송신 결과데이터 기록
     *
     * @param params
     * @throws DataAccessException
     */
    void insertEMIFResult(Map<String, Object> params) throws DataAccessException;
}