package nexos.service.cs;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.cs.CSC01020E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CSC01020E0Service<br>
 * Description: 프로그램 관리(CSC01020E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class CSC01020E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(CSC01020E0Service.class);

    final String          SP_ID_CS_PROGRAM_DELETE = "CS_PROGRAM_DELETE";

    @Autowired
    private CSC01020E0DAO dao;

    /**
     * 프로그램 메뉴 저장 처리
     * 
     * @param params
     *        신규, 수정된 데이터
     */
    public String saveProgram(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveProgram(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 프로그램 레포트 저장 처리
     * 
     * @param params
     *        신규, 수정된 데이터
     */
    public String saveReport(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.saveReport(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 프로그램 삭제
     * 
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> callCSProgramDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_CS_PROGRAM_DELETE, params);

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