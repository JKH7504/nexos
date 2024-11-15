package nexos.dao.li;

import java.util.Map;

public interface LIC05090E0DAO {

    /**
     * 입고작업비등록 저장처리
     * 
     * @param params
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;

    /**
     * 입고작업비등록(추가작업비) 저장처리
     * 
     * @param params
     * @throws Exception
     */
    void saveSub(Map<String, Object> params) throws Exception;
}