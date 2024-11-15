package nexos.controller.ld;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.ld.LDC03030E0Service;

/**
 * Class: 배차조정 컨트롤러<br>
 * Description: 배차조정 Controller<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2018-08-27    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Controller
@RequestMapping("/LDC03030E0")
public class LDC03030E0Controller extends ControllerSupport {

    @Autowired
    private LDC03030E0Service service;

    /**
     * 내역 조회
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
     * 배차조정 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callLdFwDistributeDiv.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLdFwDistributeDiv(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLdFwDistributeDiv(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 운송장취소 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callLdBwDistributeDiv.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLdBwDistributeDiv(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLdBwDistributeDiv(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
