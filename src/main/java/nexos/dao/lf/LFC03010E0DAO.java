package nexos.dao.lf;

import java.util.Map;

public interface LFC03010E0DAO {

    /**
     * 일반단가 마스터(사업부별) 저장 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;

    /**
     * 일반단가 마스터(보관유형별/상품그룹별/상품별) 저장 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    void saveDetail(Map<String, Object> params) throws Exception;

}