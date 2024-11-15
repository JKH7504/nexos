package nexos.service.cs;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.cs.CSC01010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CSC01010E0Service<br>
 * Description: 사용자관리 내역 조회(CSC01010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class CSC01010E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(CSC01010E0Service.class);
    @Autowired
    private CSC01010E0DAO dao;

    /**
     * 메뉴 정보를 리턴
     */
    public List<Map<String, Object>> getMenu(String queryId, Map<String, Object> params) {

        // 메뉴정보 가져오기
        List<Map<String, Object>> lstResult = getDataList(queryId, params);

        if (lstResult == null || lstResult.size() == 0) {
            return lstResult;
        }

        // ID, PARENT, COLLAPSED 추가
        int listCnt = lstResult.size();
        for (int i = 0; i < listCnt; i++) {
            Map<String, Object> rowData = lstResult.get(i);
            rowData.put(Consts.DK_ID, Consts.DV_ID_PREFIX + String.valueOf(rowData.get("ROW_ID")));
            String parent = String.valueOf(rowData.get("PARENT_ID"));
            if (Util.isNotNull(parent)) {
                parent = Consts.DV_ID_PREFIX + parent;
            } else {
                parent = "";
            }
            rowData.put("parent", parent);
            rowData.put("_collapsed", true);
        }

        return lstResult;
    }

    /**
     * 사용자 복사
     * 
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callUserCopy(Map<String, Object> params) throws Exception {

        Map<String, Object> result;

        TransactionStatus ts = beginTrans();
        try {
            result = dao.callUserCopy(params);
            String oMsg = Util.getOutMessage(result);
            // 오류면 Rollback
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 사용자 삭제
     * 
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callUserDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> result;

        TransactionStatus ts = beginTrans();
        try {
            result = dao.callUserDelete(params);
            String oMsg = Util.getOutMessage(result);
            // 오류면 Rollback
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 사용자 마스터 저장 처리
     * 
     * @param params
     *        신규, 수정, 삭제된 데이터
     */
    public String save(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.save(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 사용자별프로그램마스터 저장
     * 
     * @param params
     *        삭제된 데이터
     */
    public String saveUserProgram(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveUserProgram(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

}
