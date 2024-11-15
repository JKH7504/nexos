package nexos.dao.ld;

import java.util.Map;

public interface LDC03030E0DAO {

    /**
     * 배차조정 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void callLdFwDistributeDiv(Map<String, Object> params) throws Exception;

    /**
     * 운송장취소 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void callLdBwDistributeDiv(Map<String, Object> params) throws Exception;
}
