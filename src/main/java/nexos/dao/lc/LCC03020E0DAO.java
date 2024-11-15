package nexos.dao.lc;

import java.util.Map;

public interface LCC03020E0DAO {

    /**
     * 파렛트ID병합 화면 데이터 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void updateRemark(Map<String, Object> params) throws Exception;

    /**
     * 파렛트ID병합 데이터 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

}