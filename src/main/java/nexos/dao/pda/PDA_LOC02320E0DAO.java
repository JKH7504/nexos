package nexos.dao.pda;

import java.util.Map;

public interface PDA_LOC02320E0DAO {

    /**
     * [출고]출고피킹 - 피킹 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLOProcPick(Map<String, Object> params) throws Exception;
}
