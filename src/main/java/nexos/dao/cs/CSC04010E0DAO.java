package nexos.dao.cs;

import java.util.Map;

public interface CSC04010E0DAO {

    /**
     * 정책코드 내역 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;

    /**
     * 정책값 내역 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveDetail(Map<String, Object> params) throws Exception;
}
