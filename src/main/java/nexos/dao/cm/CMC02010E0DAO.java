package nexos.dao.cm;

import java.util.Map;

public interface CMC02010E0DAO {

    /**
     * 운송권역 내역 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
}
