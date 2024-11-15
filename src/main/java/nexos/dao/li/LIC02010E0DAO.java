package nexos.dao.li;

import java.util.Map;

public interface LIC02010E0DAO {

    /**
     * 입고 부분취소 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void callLIPatialCancel(Map<String, Object> params) throws Exception;

    /**
     * 입고등록 마스터/디테일 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

    /**
     * 입고등록 마스터 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;

    /**
     * 입고등록 디테일 저장 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveDetail(Map<String, Object> params) throws Exception;

    /**
     * 입고지시 - 입고지시 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveDirectionsPltId(Map<String, Object> params) throws Exception;

    /**
     * 입고확정 - 입고지시 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveDirections(Map<String, Object> params) throws Exception;

    /**
     * 입고확정/적치 - 직송여부 변경 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void saveDirectYn(Map<String, Object> params) throws Exception;

    /**
     * WCS중량계전송 처리
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void callSendFwLiOrder(Map<String, Object> params) throws Exception;

}