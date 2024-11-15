package nexos.service.cs;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.cs.CSC01040E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CSC01040E0Service<br>
 * Description: 프로그램 관리(CSC01040E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class CSC01040E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(CSC01040E0Service.class);

    final String          SP_ID_CS_MENU_SET_MENU_LEVEL = "CS_MENU_SET_MENU_LEVEL";
    final String          SP_ID_CS_MENU_LEVEL_EXCHANGE = "CS_MENU_LEVEL_EXCHANGE";
    final String          SP_ID_CS_MENU_COPY           = "CS_MENU_COPY";

    @Autowired
    private CSC01040E0DAO dao;

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
     * 프로그램 메뉴 저장 처리
     * 
     * @param params
     *        신규, 수정된 데이터
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
     * 프로그램 사용자 저장 처리
     * 
     * @param params
     *        신규, 수정된 데이터
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

    /**
     * 메뉴 단계 재설정 SP 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callCSMenuSetMenuLevel(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_CS_MENU_SET_MENU_LEVEL, params);

            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }

    /**
     * 메뉴 이동 SP 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callCSMenuLevelExchange(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_CS_MENU_LEVEL_EXCHANGE, params);

            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }

    /**
     * 메뉴 복사 SP 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callCSMenuCopy(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_CS_MENU_COPY, params);

            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }
}
