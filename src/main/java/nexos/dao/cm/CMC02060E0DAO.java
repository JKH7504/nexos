package nexos.dao.cm;

import java.util.Map;

public interface CMC02060E0DAO {

    /**
     * 운송사 내역 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;

    /**
     * 운송장대역 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveDetail(Map<String, Object> params) throws Exception;
}
