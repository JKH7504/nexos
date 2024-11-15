package nexos.dao.lo;

import java.util.Map;

public interface LOF02010E0DAO {

    /**
     * 출고등록 마스터/디테일 저장 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

    /**
     * 출고등록(개별) - 출고예정 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    void saveOrder(Map<String, Object> params) throws Exception;

    /**
     * 출고등록(일괄) 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    void saveEntryBT(Map<String, Object> params) throws Exception;

    /**
     * 출고차수 업데이트
     *
     * @param params
     * @return
     * @throws Exception
     */
    void updateOutboundBatch(Map<String, Object> params) throws Exception;

    /**
     * 출고확정 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    void saveConfirm(Map<String, Object> params) throws Exception;

    /**
     * 배송완료 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    void saveDelivery(Map<String, Object> params) throws Exception;

    /**
     * 거래명세서일자 수정 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    void callInoutDateUpdate(Map<String, Object> params) throws Exception;

    /**
     * 출고차수 채번
     */
    Map<String, Object> getOutboundBatch(Map<String, Object> params);

    /**
     * 운송차수 채번
     */
    Map<String, Object> getDeliveryBatch(Map<String, Object> params);

    /**
     * 송장 출력 횟수 업데이트 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    Map<String, Object> callSetWbnoPrintCntUpdate(Map<String, Object> params) throws Exception;

}