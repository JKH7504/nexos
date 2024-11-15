package nexos.controller.ed;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ControllerSupport;
import nexos.service.ed.common.EDCommonService;

/**
 * Class: [송신]입고확정 관리<br>
 * Description: [송신]입고확정 관리 Controller
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
@RequestMapping("/EDS03010E0")
public class EDS03010E0Controller extends ControllerSupport {

    @Autowired
    private EDCommonService service;

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

    /**
     * 송신 다운로드 처리
     *
     * @param request
     * @param ediFile
     * @param queryId
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/sendFileDownload.do", method = RequestMethod.POST)
    public ResponseEntity<String> sendFileDownload(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("P_DOWNLOAD_PARAMS") String downloadParams) {

        Map<String, Object> params = getParameter(downloadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        ResponseEntity<String> result = null;

        try {
            params.put("P_RESPONSE", response);
            params.put("P_USER_AGENT", request.getHeader(HttpHeaders.USER_AGENT));
            params.put("P_FILE_DIV", "2"); // "2" - FILE_DIV_ATTACHMENT

            oMsg = service.sendFileDownload(params);
            if (!Consts.OK.equals(oMsg)) {
                result = getResponseEntityError(request, oMsg);
                return result;
            }
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
            return result;
        }

        return result;
    }

    /**
     * SP 처리 - 송신처리 및 오류내역 처리
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/sendProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> sendProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.manualSendProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
