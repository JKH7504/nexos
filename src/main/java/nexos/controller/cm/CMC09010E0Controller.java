package nexos.controller.cm;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.cm.CMC09010E0Service;

/**
 * Class: 작업일자 관리 컨트롤러<br>
 * Description: 작업일자 관리 Controller<br>
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
@RequestMapping("/CMC09010E0")
public class CMC09010E0Controller extends ControllerSupport {

    @Autowired
    private CMC09010E0Service service;

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
     * 저장 처리
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/save.do", method = RequestMethod.POST)
    public ResponseEntity<String> save(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.save(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 작업일자 복사
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/setWorkCalenderCopy.do", method = RequestMethod.POST)
    public ResponseEntity<String> setWorkCalenderCopy(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.setWorkCalenderCopy(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 작업일자 생성
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/setWorkCalenderCreate.do", method = RequestMethod.POST)
    public ResponseEntity<String> setWorkCalenderCreate(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.setWorkCalenderCreate(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

}
