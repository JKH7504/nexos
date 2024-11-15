package nexos.dao.cs;

import java.util.Map;

public interface CSC05010E0DAO {

    /**
     * 그룹코드 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;

    /**
     * 공통코드 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveSub(Map<String, Object> params) throws Exception;
}