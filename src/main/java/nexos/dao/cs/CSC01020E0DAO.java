package nexos.dao.cs;

import java.util.Map;

public interface CSC01020E0DAO {

    /**
     * 프로그램 메뉴 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveProgram(Map<String, Object> params) throws Exception;

    /**
     * 프로그램 레포트 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveReport(Map<String, Object> params) throws Exception;

}