package nexos.dao.pda;

import java.util.Map;

public interface PDA_LCC05010E1DAO {

    /**
     * [센터운영]매장실사 - 매장실사 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLCProcDeliveryInvest(Map<String, Object> params) throws Exception;
}
