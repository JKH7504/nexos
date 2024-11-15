package nexos.dao.pda;

import java.util.Map;

public interface PDA_LIC02210E0DAO {

    /**
     * [입고]입고지시(파렛트매핑) - 지시 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLIProcMapping(Map<String, Object> params) throws Exception;
}
