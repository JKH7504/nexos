package nexos.dao.ri;

import java.util.Map;

public interface RIM01010E0DAO {

    /**
     * 온라인반입예정등록 마스터/디테일 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

}