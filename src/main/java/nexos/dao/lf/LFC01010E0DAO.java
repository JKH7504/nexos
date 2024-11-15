package nexos.dao.lf;

import java.util.Map;

public interface LFC01010E0DAO {

    /**
     * 보안설정/해제 마스터 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

}