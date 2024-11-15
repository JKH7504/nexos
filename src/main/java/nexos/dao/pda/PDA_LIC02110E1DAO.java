package nexos.dao.pda;

import java.util.Map;

public interface PDA_LIC02110E1DAO {

    /**
     * [입고]입고처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLIProcDirect(Map<String, Object> params) throws Exception;
}
