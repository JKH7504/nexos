package nexos.controller.lo;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.lo.LOC03010E0Service;

/**
 * Class: 화물통관관리 컨트롤러<br>
 * Description: 화물통관관리 Controller<br>
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
@RequestMapping("/LOC03010E0")
public class LOC03010E0Controller extends ControllerSupport {

    @Autowired
    private LOC03010E0Service service;

    /**
     * 데이터 조회
     *
     * @param request
     * @param params
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
     * 프로시저 호출 후 결과 조회
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/getData.do", method = RequestMethod.POST)
    public ResponseEntity<String> getData(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getData(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 화물통관확인(관세청)
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/callCsclRecvProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callCsclRecvProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {
        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callCsclRecvProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 화물통관확인(수동확인)
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/callCsclManualProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callCsclManualProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {
        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callCsclManualProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
