package nexos.dao.ld;

import java.util.Map;

public interface LDC05010E0DAO {

    /**
     * 월지입료 내역 저장
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

    /**
     * 월마감 취소 프로시저 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callLDBwClosingMonthly(Map<String, Object> params) throws Exception;

    /**
     * 운행일지 중간마감 프로시저 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callIntermediateClosing(Map<String, Object> params) throws Exception;

    /**
     * 기초데이터 생성 프로시저 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callCreateData(Map<String, Object> params) throws Exception;

}
