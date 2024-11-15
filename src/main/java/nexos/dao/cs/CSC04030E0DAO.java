package nexos.dao.cs;

import java.util.Map;

public interface CSC04030E0DAO {

    /**
     * 브랜드별 정책 내역 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

}
