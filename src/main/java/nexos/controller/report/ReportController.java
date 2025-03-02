package nexos.controller.report;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.AuthenticationUtil;
import nexos.framework.security.SecurityUserDetailsService;
import nexos.framework.support.ControllerSupport;
import nexos.service.report.ReportService;

/**
 * Class: ReportController<br>
 * Description: Report 출력에서 사용할 공통 컨트롤러 Class<br>
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
@Controller
public class ReportController extends ControllerSupport {

    @Autowired
    private ReportService              service;

    @Autowired
    private SecurityUserDetailsService securityUserService;

    // private final Logger logger = LoggerFactory.getLogger(ReportController.class);

    public ReportController() throws Exception {
    }

    /**
     * 리포트 기본 호출에 대한 컨트롤러(POST)
     *
     * @param request
     * @param response
     * @return PDF 문서를 리턴
     */
    @RequestMapping(value = "/report.do", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<byte[]> report(HttpServletRequest request, HttpServletResponse response) {

        return getReport(request, response);
    }

    /**
     * 리포트 기본 호출에 대한 컨트롤러(POST)
     *
     * @param request
     * @param response
     * @return PDF 문서를 리턴
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/anonymousReport.do", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<byte[]> anonymousReport(HttpServletRequest request, HttpServletResponse response) {

        // Http 기본인증 토큰 체크
        try {
            validateUserToken(request);
        } catch (Exception e) {
            AuthenticationUtil.clearHttpAuthorization(request);
            ResponseEntity<String> responseEntity = getResponseEntitySubmitError(request, e, e.getMessage());
            return new ResponseEntity<byte[]>(responseEntity.getBody().getBytes(), responseEntity.getHeaders(), HttpStatus.UNAUTHORIZED);
        }

        // 익명 인증으로 서비스 호출
        AuthenticationUtil.configureAuthentication();
        try {
            return getReport(request, response);
        } finally {
            AuthenticationUtil.clearAuthentication();
        }
    }

    private ResponseEntity<byte[]> getReport(HttpServletRequest request, HttpServletResponse response) {

        ResponseEntity<byte[]> result = null;

        ByteArrayOutputStream reportOutput = null;
        try {
            reportOutput = new ByteArrayOutputStream();
            // Report 파라메터 값 읽기
            Map<String, Object> params = getReportParams(request, reportOutput);
            String oMsg = Util.getOutMessage(params);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            // PDF 문서 생성하고 servletOutput에 기록
            Map<String, Object> resultMap = service.getReport(params);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            byte[] reportOutputBytes = reportOutput.toByteArray();
            HttpHeaders headers = new HttpHeaders();

            String downloadYn = (String)params.get("P_DOWNLOAD_YN");
            String fileName = "";
            String contentType = "";
            String contentDisposition = "";
            if (Consts.YES.equals(downloadYn)) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                contentDisposition = "attachment";
                fileName = Util.replaceRestrictChars(Util.toJoin("_", //
                    new String[] { //
                        (String)params.get(Consts.PK_USER_ID), //
                        Util.nullToDefault(params.get("P_REPORT_TITLE_NM"), "report"), //
                        Util.getNowDate("yyyyMMddHHmmss"), //
                    }, ".pdf"));

                // jQuery FileDownload Event 처리를 위한 Cookie 세팅
                response.addCookie(Util.getDownloadCookie());
            } else {
                contentType = MediaType.APPLICATION_PDF_VALUE;
                contentDisposition = "inline";
                fileName = "report.pdf";
            }
            if (Util.isIE(request.getHeader(HttpHeaders.USER_AGENT))) {
                fileName = URLEncoder.encode(fileName, Consts.CHARSET);
            } else {
                fileName = new String(fileName.getBytes(Consts.CHARSET), StandardCharsets.ISO_8859_1);
            }
            headers.set(HttpHeaders.CONTENT_TYPE, contentType);
            headers.set(HttpHeaders.CONTENT_DISPOSITION, contentDisposition + "; filename=\"" + fileName + "\";");
            headers.set(HttpHeaders.CONTENT_LENGTH, Integer.toString(reportOutputBytes.length));
            headers.set("Content-Transfer-Encoding", "binary");
            // Cache 세팅
            headers.set(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
            headers.set(HttpHeaders.PRAGMA, "no-cache");
            headers.set(HttpHeaders.EXPIRES, "0");

            result = new ResponseEntity<byte[]>(reportOutputBytes, headers, HttpStatus.OK);
            request.setAttribute("__RESPONSE_STATUS", Consts.OK);
        } catch (Exception e) {
            ResponseEntity<String> responseEntity = getResponseEntitySubmitError(request, e,
                NexosMessage.getDisplayMsg("JAVA.REPORTCONTROLLER.XXX", "정상적으로 처리되지 않았습니다.") //
            );
            result = new ResponseEntity<byte[]>(responseEntity.getBody().getBytes(), responseEntity.getHeaders(), responseEntity.getStatusCode());
        } finally {
            Util.closeObject(reportOutput);
        }
        return result;
    }

    /**
     * Report 출력을 위한 파라메터를 Request에서 읽음
     *
     * @param request
     * @param servletOutput
     * @return
     */
    private Map<String, Object> getReportParams(HttpServletRequest request, ByteArrayOutputStream reportOutput) {

        Map<String, Object> result = null;

        String reportParams = request.getParameter("P_REPORT_PARAMS");
        if (Util.isNotNull(reportParams)) {
            result = getParameter(reportParams);
            String oMsg = Util.getOutMessage(result);
            if (!Consts.OK.equals(oMsg)) {
                return result;
            }
            // 파라메터가 없거나, O_MSG만 존재할 경우 오류
            if (Util.getCount(result) <= 1) {
                Util.setOutMessage(result, NexosMessage.getDisplayMsg("JAVA.REPORTCONTROLLER.XXX", "출력을 위한 레포트 정보가 존재하지 않습니다."));
                return result;
            }
            result.put("P_DOWNLOAD_YN", Consts.NO);
            result.put("P_SERVLET_CONTEXT", request.getSession().getServletContext());
            result.put("P_REPORT_OUTPUT", reportOutput);

            return result;
        }

        reportParams = request.getParameter("P_DOWNLOAD_PARAMS");
        if (Util.isNotNull(reportParams)) {
            result = getParameter(reportParams);
            String oMsg = Util.getOutMessage(result);
            if (!Consts.OK.equals(oMsg)) {
                return result;
            }
            // 파라메터가 없거나, O_MSG만 존재할 경우 오류
            if (Util.getCount(result) <= 1) {
                Util.setOutMessage(result, NexosMessage.getDisplayMsg("JAVA.REPORTCONTROLLER.XXX", "다운로드를 위한 레포트 정보가 존재하지 않습니다."));
                return result;
            }
            result.put("P_DOWNLOAD_YN", Consts.YES);
            result.put("P_SERVLET_CONTEXT", request.getSession().getServletContext());
            result.put("P_REPORT_OUTPUT", reportOutput);

            return result;
        }

        result = Util.newMap();
        Util.setOutMessage(result, NexosMessage.getDisplayMsg("JAVA.REPORTCONTROLLER.XXX", "레포트 [출력/다운로드]를 위한 파라메터 정보가 존재하지 않습니다."));
        return result;
    }

    /**
     * Basic 인증 유효성 체크
     *
     * @param request
     * @throws Exception
     */
    private void validateUserToken(HttpServletRequest request) throws Exception {

        String authorization = AuthenticationUtil.getHttpAuthorization(request);
        if (Util.isNull(authorization)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.REPORTCONTROLLER.XXX", "인증 정보가 존재하지 않습니다."));
        }
        String principal = AuthenticationUtil.getPrincipalFromAuthorization(authorization);

        if (Util.isNull(principal)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.REPORTCONTROLLER.XXX", "인증 정보가 유효하지 않습니다."));
        } else {
            UserDetails user = securityUserService.loadUserByUsername(principal);
            AuthenticationUtil.validateAuthorization(authorization, user);
        }
    }
}
