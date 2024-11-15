package nexos.dao.pda;

import java.util.Map;

public interface PDA_LCC03020E0DAO {

    /**
     * [센터운영]재고이동(단일) - 재고이동 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLCProcMove(Map<String, Object> params) throws Exception;
}
