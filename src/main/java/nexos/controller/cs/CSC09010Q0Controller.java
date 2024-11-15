package nexos.controller.cs;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ControllerSupport;
import nexos.service.cs.CSC09010Q0Service;

/**
 * Class: 쿼리 실행기 데이터 조회 컨트롤러<br>
 * Description: 쿼리 실행기 데이터 조회 조회 Controller<br>
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
@RequestMapping("/CSC09010Q0")
public class CSC09010Q0Controller extends ControllerSupport {

    @Autowired
    private CSC09010Q0Service service;

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
            result = getResponseEntity(request, service.getDataListEx(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 쿼리 파일 저장
     *
     * @param request
     * @param response
     * @param queryId
     * @param queryParams
     * @param columnInfo
     * @param excelTitle
     * @param userId
     * @return
     */
    @RequestMapping(value = "/saveQuery.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveQuery(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("P_DOWNLOAD_PARAMS") String downloadParams) {

        ResponseEntity<String> result = null;

        Map<String, Object> params = getParameter(downloadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        OutputStream responseOutput = null;
        try {
            String queryFileName = Util.toJoin("_", //
                new String[] { //
                    (String)params.get(Consts.PK_USER_ID), //
                    "Query", //
                    Util.getNowDate("yyyyMMddHHmmss") //
                }, ".txt");

            byte[] queryText = Util.nullToEmpty(params.get("P_QUERY_TEXT")).getBytes(Consts.CHARSET);

            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, queryFileName, Long.toString(queryText.length));
            // 파일 기록
            setResponseBody(responseOutput, queryText);
        } catch (Exception e) {
            result = getResponseEntitySubmitError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.CSC09010Q0.XXX", "QUERY 파일 저장 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
        }

        return result;
    }

    @RequestMapping(value = "/openQuery.do", method = RequestMethod.POST)
    public ResponseEntity<String> openQuery(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("P_UPLOAD_FILE") MultipartFile uploadFile, @RequestParam("P_UPLOAD_PARAMS") String uploadParams) {

        ResponseEntity<String> result = null;

        Map<String, Object> params = getParameter(uploadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        BufferedReader uploadFileReader = null;
        try {
            if (uploadFile == null || uploadFile.isEmpty()) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.017", "빈 파일입니다. 다른 파일을 선택하십시오."));
            }

            uploadFileReader = new BufferedReader(new InputStreamReader(uploadFile.getInputStream(), Consts.CHARSET));

            StringBuffer sbResult = new StringBuffer();
            String line = null;
            while ((line = uploadFileReader.readLine()) != null) {
                sbResult.append(line);
                sbResult.append("\n");
            }

            result = getResponseEntity(request, sbResult.toString());
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        } finally {
            Util.closeObject(uploadFileReader);
        }

        return result;
    }
}
