package nexos.dao.lc;

import java.util.Map;

public interface LCC03030E0DAO {

    /**
     * 어소트재고이동 마스터/디테일 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

}