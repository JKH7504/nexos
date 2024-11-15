package nexos.dao.common;

import java.util.List;
import java.util.Map;

import nexos.framework.json.JsonDataSet;

public interface WCDAO {

    /**
     * HASH512로 암호화
     * 
     * @param value
     * @return
     */
    String getEncryptHash(String value);

    /**
     * 비밀번호 비교
     * 
     * @param userPwd
     * @param savedUserPwd
     * @return
     */
    boolean equalUserPwd(String userPwd, String savedUserPwd);

    /**
     * 로그인 처리하기
     * 
     * @param params
     *        조회조건
     * @return
     * @throws Exception
     */
    Map<String, Object> getLogin(Map<String, Object> params);

    /**
     * 사용자 비밀번호 초기화 정보 검색
     * 
     * @param params
     *        조회조건
     * @return
     * @throws Exception
     */
    Map<String, Object> getResetUserPwd(Map<String, Object> params);

    /**
     * 로그인 기록
     * 
     * @param params
     * @throws Exception
     */
    Map<String, Object> callCSUserSysInfoUpdate(Map<String, Object> params);

    /**
     * 사용자 정보 변경
     * 
     * @param params
     * @throws Exception
     */
    void updateCSUser(Map<String, Object> params);

    /**
     * 사용자 비밀번호 변경 규칙 체크
     * 
     * @param params
     * @throws Exception
     */
    Map<String, Object> callCSUserPwdChangeRulesCheck(Map<String, Object> params);

    /**
     * 사용자 비밀번호 변경
     * 
     * @param params
     * @throws Exception
     */
    Map<String, Object> callCSUserPwdUpdate(Map<String, Object> params);

    /**
     * sqlmap 파일 다시 읽기
     */
    String reloadSqlMap();

    /**
     * Java/DB 메시지 다시 읽기
     * 
     * @return
     */
    String reloadDisplayMsg();

    /**
     * 메뉴정보 조회
     * 
     * @param params
     *        조회조건
     * @return
     * @throws Exception
     */
    List<Map<String, Object>> getUserProgramMenu(Map<String, Object> params);

    /**
     * 프로그램 메뉴데이터를 생성하는 Method.
     * 
     * @param list
     *        : 메뉴데이터
     * @return String : JSON메뉴데이터.
     * @throws Exception
     */
    List<Map<String, Object>> getUserProgramMenuTree(List<Map<String, Object>> list);

    /**
     * DB서버의 현재일자, 현재시간 리턴
     * 
     * @return
     */
    Map<String, Object> getSysDate();

    /**
     * Excel 파일 생성 후 생성된 서버의 파일명 리턴
     * 
     * @param params
     * @return
     */
    Map<String, Object> excelExport(Map<String, Object> params) throws Exception;

    /**
     * Excel 파일 읽어서 CTCHECKVALUE에 INSERT 후 QUERY 실행하여 결과 리턴
     * 
     * @param params
     * @return
     */
    JsonDataSet excelImport(Map<String, Object> params) throws Exception;

    /**
     * 사용자 그리드 설정 저장
     * 
     * @param params
     * @throws Exception
     */
    void saveUserGridLayout(Map<String, Object> params);
}