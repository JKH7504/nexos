package nexos.dao.pda;

import java.util.Map;

public interface PDA_LCC04010E0DAO {

    /**
     * [센터운영]재고실사 - 재고실사 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLCProcInvest(Map<String, Object> params) throws Exception;
}
