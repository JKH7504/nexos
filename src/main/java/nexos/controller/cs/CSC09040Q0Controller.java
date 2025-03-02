package nexos.controller.cs;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.input.ReversedLinesFileReader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.core.LoggerContext;
import org.apache.logging.log4j.core.appender.RollingFileAppender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import nexos.framework.Consts;
import nexos.framework.NexosConsts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ControllerSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: WAS 로그 조회 컨트롤러<br>
 * Description: WAS 로그 조회 Controller<br>
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
@RequestMapping("/CSC09040Q0")
public class CSC09040Q0Controller extends ControllerSupport {

    // private final Logger logger = LoggerFactory.getLogger(CSC09040Q0Controller.class);

    @Autowired
    @Qualifier("defaultService")
    private ServiceSupport service;

    /**
     * 데이터 조회
     *
     * @param request
     *        HttpServletRequest
     * @param queryId
     *        쿼리ID
     * @param queryParams
     *        쿼리 호출 파라메터
     * @return
     */
    @RequestMapping(value = "/getDataSet.do", method = RequestMethod.POST)
    public ResponseEntity<String> getDataSet(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getDataSet(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/getLog.do", method = RequestMethod.POST)
    public ResponseEntity<String> getLog(HttpServletRequest request, HttpServletResponse response, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        ReversedLinesFileReader logFileReader = null;
        try {
            int logCount = Util.toInt(params.get("P_LOG_COUNT"), 1000);
            String logCharset = Util.nullToDefault(params.get("P_LOG_CHARSET"), Consts.CHARSET);

            logFileReader = new ReversedLinesFileReader(getBaseLogFile(), Charset.forName(logCharset));
            List<String> logList = logFileReader.readLines(logCount);
            StringBuffer sbLog = new StringBuffer();
            for (int rIndex = logList.size() - 1; rIndex > 0; rIndex--) {
                sbLog.append(logList.get(rIndex)).append("\n");
            }
            result = getResponseEntity(request, sbLog.toString());
            request.setAttribute("__RESPONSE_STATUS", NexosConsts.OK);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        } finally {
            Util.closeObject(logFileReader);
        }

        return result;
    }

    @RequestMapping(value = "/getLogFiles.do", method = RequestMethod.POST)
    public ResponseEntity<String> getLogFiles(HttpServletRequest request, HttpServletResponse response) {

        ResponseEntity<String> result = null;

        try {
            List<File> logFiles = Arrays.asList(getBaseLogFile().getParentFile().listFiles());
            // 최종수정일시 역순으로 정렬
            logFiles.sort(new Comparator<File>() {
                @Override
                public int compare(File f1, File f2) {
                    return Long.compare(f1.lastModified(), f2.lastModified()) * -1;
                }
            });
            List<Map<String, Object>> dsResult = new ArrayList<Map<String, Object>>();
            SimpleDateFormat dateFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);
            for (int rIndex = 0, rCount = logFiles.size(); rIndex < rCount; rIndex++) {
                Map<String, Object> rowData = new HashMap<String, Object>();
                File logFile = logFiles.get(rIndex);
                rowData.put("LOG_FILE_NM", logFile.getName());
                rowData.put("LOG_FILE_DATETIME", dateFormat.format(new Date(logFile.lastModified())));
                rowData.put("LOG_FILE_SIZE", FileUtils.byteCountToDisplaySize(logFile.length()));
                rowData.put("LOG_FILE_FULL_NM", logFile.getAbsolutePath());
                rowData.put("id", "id_" + rIndex);
                dsResult.add(rowData);
            }
            result = getResponseEntity(request, dsResult);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 로그파일 다운로드
     *
     * @param request
     * @param response
     * @param downloadParams
     * @return
     */
    @RequestMapping(value = "/downloadLogFile.do", method = RequestMethod.POST)
    public ResponseEntity<String> downloadLogFile(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("P_DOWNLOAD_PARAMS") String downloadParams) {

        ResponseEntity<String> result = null;

        Map<String, Object> params = getParameter(downloadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        OutputStream responseOutput = null;
        try {
            String downloadFilePath = getBaseLogFile().getParent();
            File downloadFile = new File(downloadFilePath, (String)params.get("P_LOG_FILE_NM"));
            if (!downloadFile.exists()) {
                throw new FileNotFoundException(NexosMessage.getDisplayMsg("JAVA.CSC09040Q0.001", "로그 파일이 서버에 존재하지 않습니다."));
            }

            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, downloadFile);
            // 파일 기록
            setResponseBody(responseOutput, downloadFile);
        } catch (Exception e) {
            result = getResponseEntityError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.CSC09040Q0.002", "로그 파일 다운로드 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
        }

        return result;
    }

    private File getBaseLogFile() {

        LoggerContext logContext = (LoggerContext)LogManager.getContext(false);
        RollingFileAppender logAppender = (RollingFileAppender)logContext.getConfiguration().getAppender("NEXOS-FILE");

        return new File(logAppender.getFileName());
    }
}
