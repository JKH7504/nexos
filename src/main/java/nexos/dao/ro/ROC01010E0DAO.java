package nexos.dao.ro;

import java.util.Map;

public interface ROC01010E0DAO {

    /**
     * 반출예정등록 마스터/디테일 저장 처리(팝업화면에서)
     * 
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
}