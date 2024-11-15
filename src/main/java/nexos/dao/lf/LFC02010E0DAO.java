package nexos.dao.lf;

import java.util.Map;

public interface LFC02010E0DAO {

    /**
     * 정산계약 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

}