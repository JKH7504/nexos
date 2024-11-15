package nexos.dao.pda;

import java.util.Map;

public interface PDA_LIC02320E0DAO {

    /**
     * [입고]입고검수(멀티상품매핑) - 검수 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLIProcInspectT2(Map<String, Object> params) throws Exception;
}
