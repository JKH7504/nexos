package nexos.dao.lc;

import java.util.Map;

public interface LCC02020E0DAO {

    /**
     * 상품변환관리 화면에서 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    void updateRemark(Map<String, Object> params) throws Exception;

    /**
     * 상품변환관리 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

    /**
     * 상품변환 자동등록 SP 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLCFWStockChangeEntry(Map<String, Object> params) throws Exception;

}
