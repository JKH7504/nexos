package nexos.dao.cs;

import java.util.Map;

public interface CSC04020E0DAO {

    /**
     * 브랜드별 정책 내역 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

    /**
     * 사업부정책 복사 프로시저 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callBuPolicyCopy(Map<String, Object> params) throws Exception;
}
