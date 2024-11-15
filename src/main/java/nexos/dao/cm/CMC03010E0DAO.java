package nexos.dao.cm;

import java.util.Map;

public interface CMC03010E0DAO {

    /**
     * 고객사 내역 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

}
