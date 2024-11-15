package nexos.service.report;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.report.ReportDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: ReportService<br>
 * Description: Report 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class ReportService extends ServiceSupport {

    @Autowired
    private ReportDAO dao;

    /**
     * PDF 문서를 생성하여 Response에 기록
     * 
     * @param params
     * @return
     */
    public Map<String, Object> getReport(Map<String, Object> params) {

        Map<String, Object> resultMap = new HashMap<String, Object>();

        try {
            String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);
            String internalQueryYn = (String)params.get("P_INTERNAL_QUERY_YN");
            if (Util.isNull(checkedValue) && Consts.NO.equals(internalQueryYn)) {
                resultMap = dao.getReport(params);
            } else {
                TransactionStatus ts = beginTrans();
                try {
                    resultMap = dao.getReport(params);
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    throw new RuntimeException(Util.getErrorMessage(e));
                }
            }
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            Util.setOutMessage(resultMap, Consts.OK);
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        }
        return resultMap;
    }
}
