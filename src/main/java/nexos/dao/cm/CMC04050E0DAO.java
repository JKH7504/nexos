package nexos.dao.cm;

import java.util.Map;

public interface CMC04050E0DAO {

    /**
     * 물류센터상품관리 마스터 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

    /**
     * 물류센터상품관리 (개별 할당) 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    String callCenterItemCheckAllocate(Map<String, Object> params) throws Exception;

}
