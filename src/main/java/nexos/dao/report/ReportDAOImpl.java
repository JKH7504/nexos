package nexos.dao.report;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.lowagie.text.pdf.PdfCopyFields;
import com.lowagie.text.pdf.PdfReader;

import net.sf.jasperreports.engine.JREmptyDataSource;
import net.sf.jasperreports.engine.JasperRunManager;
import nexos.dao.common.WCDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.report.ReportDataSource;
import nexos.framework.support.DaoSupport;
import nexos.framework.support.NexosSupport;

/**
 * Class: ReportDAOImpl<br>
 * Description: Report DAO (Data Access Object)<br>
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
@Repository("REPORTDAO")
public class ReportDAOImpl extends DaoSupport implements ReportDAO {

    final String  PK_SERVLET_CONTEXT   = "P_SERVLET_CONTEXT";
    final String  PK_REPORT_OUTPUT     = "P_REPORT_OUTPUT";
    final String  PK_REPORT_FILE       = "P_REPORT_FILE";
    final String  PK_REPORT_TITLE_NM   = "P_REPORT_TITLE_NM";
    final String  PK_PRINT_COPY        = "P_PRINT_COPY";
    final String  PK_INTERNAL_QUERY_YN = "P_INTERNAL_QUERY_YN";
    final String  PK_USER_NM           = "P_USER_NM";
    final String  PK_CLIENT_IP         = "P_CLIENT_IP";
    // final String PK_COOKIE_NM = "P_COOKIE_NM";
    // final String PK_CONTEXT_URL = "P_CONTEXT_URL";

    @Autowired
    private WCDAO dao;

    // private final Logger logger = LoggerFactory.getLogger(ReportDAOImpl.class);

    @SuppressWarnings("unchecked")
    @Override
    public Map<String, Object> getReport(Map<String, Object> params) {

        Map<String, Object> result = new HashMap<String, Object>();

        InputStream reportFile = null;
        try {
            // 파라메터 가져오기
            ByteArrayOutputStream reportOutput = (ByteArrayOutputStream)params.get(PK_REPORT_OUTPUT);
            ServletContext sevletContext = (ServletContext)params.get(PK_SERVLET_CONTEXT);

            reportFile = sevletContext.getResourceAsStream(getReportFullFileName((String)params.get(PK_REPORT_FILE)));
            if (reportFile == null) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.050", "Report 파일이 서버에 존재하지 않습니다."));
            }

            String queryId = (String)params.get(Consts.PK_QUERY_ID);
            Map<String, Object> reportParams = (HashMap<String, Object>)params.get(Consts.PK_QUERY_PARAMS);
            String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);
            String internalQueryYn = (String)params.get(PK_INTERNAL_QUERY_YN);

            // 서버 현재일시
            Map<String, Object> sysdateMap = dao.getSysDate();
            String oMsg = Util.getOutMessage(sysdateMap);
            if (!Consts.OK.equals(oMsg)) {
                return result;
            }
            // Report 파라메터 세팅
            reportParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
            reportParams.put(PK_USER_NM, params.get(PK_USER_NM));
            reportParams.put(PK_REPORT_TITLE_NM, params.get(PK_REPORT_TITLE_NM));
            reportParams.put(PK_CLIENT_IP, params.get(PK_CLIENT_IP));
            reportParams.put("P_SYSDATE", sysdateMap.get("SYS_DATETIME"));
            reportParams.put("P_SUBREPORT_DIR", NexosSupport.getWebFileRootPath("REPORT.ROOT"));
            reportParams.put("P_BI_CUST_DIR", NexosSupport.getWebFileRootPath("FILE.BI.CUST"));
            reportParams.put("P_BI_BU_DIR", NexosSupport.getWebFileRootPath("FILE.BI.BU"));
            reportParams.put("P_BI_BRAND_DIR", NexosSupport.getWebFileRootPath("FILE.BI.BRAND"));
            reportParams.put("P_BI_ITEM_DIR", NexosSupport.getWebFileRootPath("FILE.BI.ITEM"));

            // Package의 Query로 출력
            if (Consts.NO.equals(internalQueryYn)) {
                if (Util.isNotNull(queryId)) {
                    if (Util.isNotNull(checkedValue)) {
                        // 선택 값 CTCHECKVALUE 테이블에 INSERT
                        Map<String, Object> checkedParams = new HashMap<String, Object>();
                        checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
                        insertCheckedValue(checkedParams);
                    }
                    // 데이터 JRDataSource로 가져오기
                    ReportDataSource reportDataSource = new ReportDataSource(this, queryId, reportParams);
                    // 조회한 내역이 존재하지 않는다면 에러
                    if (reportDataSource == null || reportDataSource.size() == 0) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.051", "출력할 데이터가 존재하지 않습니다."));
                    }
                    // PDF 리턴
                    JasperRunManager.runReportToPdfStream(reportFile, reportOutput, reportParams, reportDataSource);
                } else {
                    // PDF 리턴
                    JasperRunManager.runReportToPdfStream(reportFile, reportOutput, reportParams, new JREmptyDataSource());
                }
            } else {
                // Report의 Query로 출력
                if (Util.isNotNull(checkedValue)) {
                    // 선택 값 CTCHECKVALUE 테이블에 INSERT
                    Map<String, Object> checkedParams = new HashMap<String, Object>();
                    checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
                    insertCheckedValue(checkedParams);
                }
                try {
                    // PDF 리턴
                    JasperRunManager.runReportToPdfStream(reportFile, reportOutput, reportParams, getConnection());
                } catch (Exception e) {
                    throw new RuntimeException(Util.getErrorMessage(e));
                }
            }
            reportOutput.flush();

            // PDF로 리턴
            // 출력매수에 대한 처리
            int printCopy = Util.toInt(params.get(PK_PRINT_COPY));
            if (printCopy == 0) {
                printCopy = 1;
            }
            if (printCopy > 1) {
                PdfCopyFields pdfPrintCopy = new PdfCopyFields(reportOutput);
                try {
                    for (int i = 0; i < printCopy; i++) {
                        pdfPrintCopy.addDocument(new PdfReader(outputToInputStream(reportOutput)));
                    }
                } finally {
                    pdfPrintCopy.close();
                }
            }
            reportOutput.flush();

            Util.setOutMessage(result, Consts.OK);
        } catch (Exception e) {
            Util.setOutMessage(result, Util.getErrorMessage(e));
        } finally {
            Util.closeObject(reportFile);
        }

        return result;
    }

    /**
     * Report File 전체 경로 리턴
     * 
     * @param reportFileNm
     * @return
     */
    private String getReportFullFileName(String reportFileNm) {

        String result = "";
        if (Util.isNull(reportFileNm)) {
            result = NexosSupport.getGlobalProperty("REPORT.ROOT") + NexosSupport.getGlobalProperty("REPORT.EMPTYFILE");
        } else {
            result = NexosSupport.getGlobalProperty("REPORT.ROOT") + reportFileNm + ".jasper";
        }
        if (!"/".equals(File.separator)) {
            result = result.replace("/", Matcher.quoteReplacement(File.separator));
        }

        return result;
    }

    /**
     * ByteArrayOutputStream를 InputStream으로 변환하는 Method.
     * 
     * @param source
     * @return
     * @throws IOException
     */
    private InputStream outputToInputStream(ByteArrayOutputStream source) {

        return new ByteArrayInputStream(source.toByteArray());
    }
}
