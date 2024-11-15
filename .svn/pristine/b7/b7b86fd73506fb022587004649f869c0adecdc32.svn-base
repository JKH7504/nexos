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
import nexos.service.cm.CMC02060E0Service;

/**
 * Class: 택배기준관리 컨트롤러<br>
 * Description: 택배기준관리 Controller<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-11-26    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Controller
@RequestMapping("/CMC02060E0")
public class CMC02060E0Controller extends ControllerSupport {

    @Autowired
    private CMC02060E0Service service;

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
     * 운송사 저장 처리
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/saveMaster.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveMaster(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveMaster(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 운송장대역 저장 처리
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/saveDetail.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveDetail(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveDetail(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 운송장번호 생성
     *
     * @param request
     *        HttpServletRequest
     * @param queryId
     *        쿼리ID
     * @param queryParams
     *        쿼리 호출 파라메터
     * @return
     */
    @RequestMapping(value = "/callSetWbNoCreate.do", method = RequestMethod.POST)
    public ResponseEntity<String> callSetWbNoCreate(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callSetWbNoCreate(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

}
