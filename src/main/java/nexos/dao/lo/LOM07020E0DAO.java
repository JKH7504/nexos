package nexos.dao.lo;

import java.util.Map;

public interface LOM07020E0DAO {

    /**
     * 송장 삭제처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void delete(Map<String, Object> params) throws Exception;

    /**
     * 송장 추가발행 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLOWbNoAdd(Map<String, Object> params) throws Exception;

    /**
     * 출고스캔검수-송장 출력 횟수 업데이트 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callSetWbNoPrintCntUpdate(Map<String, Object> params) throws Exception;

    /**
     * 반입요청 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void returnSave(Map<String, Object> params) throws Exception;

    /**
     * 송장 확정 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLOWbConfirm(Map<String, Object> params) throws Exception;
}