package nexos.dao.pda;

import java.util.Map;

public interface PDA_LOC02380E0DAO {

    /**
     * [출고]출고작업비관리 - 추가작업비 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLOProcExtraWorkDiv(Map<String, Object> params) throws Exception;
}
