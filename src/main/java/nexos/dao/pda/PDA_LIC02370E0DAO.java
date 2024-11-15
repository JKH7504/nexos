package nexos.dao.pda;

import java.util.Map;

public interface PDA_LIC02370E0DAO {

    /**
     * [입고]입고작업비관리 - 추가작업비 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLIProcExtraWorkDiv(Map<String, Object> params) throws Exception;
}
