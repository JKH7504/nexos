package nexos.controller.ed;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.Consts;
import nexos.framework.support.ControllerSupport;
import nexos.service.ed.EDC02010E0Service;

/**
 * Class: 인터페이스 송수신 스케줄링<br>
 * Description: 인터페이스 송수신 스케줄링 Controller<br>
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
@RequestMapping("/EDC02010E0")
public class EDC02010E0Controller extends ControllerSupport {

    @Autowired
    private EDC02010E0Service service;

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

    @RequestMapping(value = "/getSchedulerDataSet.do", method = RequestMethod.POST)
    public ResponseEntity<String> getSchedulerDataSet(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getSchedulerDataSet(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/getSchedulerStartedYN.do", method = RequestMethod.POST)
    public ResponseEntity<String> getSchedulerStartedYN(HttpServletRequest request) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getSchedulerStartedYN());
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/startScheduler.do", method = RequestMethod.POST)
    public ResponseEntity<String> startScheduler(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.startScheduler((String)params.get(Consts.PK_USER_ID)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/stopScheduler.do", method = RequestMethod.POST)
    public ResponseEntity<String> stopScheduler(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.stopScheduler((String)params.get(Consts.PK_USER_ID)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/getSAPServerUseYN.do", method = RequestMethod.POST)
    public ResponseEntity<String> getSAPServerUseYN(HttpServletRequest request) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getSAPServerUseYN());
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/getSAPServerStartedYN.do", method = RequestMethod.POST)
    public ResponseEntity<String> getSAPServerStartedYN(HttpServletRequest request) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getSAPServerStartedYN());
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/startSAPServer.do", method = RequestMethod.POST)
    public ResponseEntity<String> startSAPServer(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.startSAPServer((String)params.get(Consts.PK_USER_ID)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/stopSAPServer.do", method = RequestMethod.POST)
    public ResponseEntity<String> stopSAPServer(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.stopSAPServer((String)params.get(Consts.PK_USER_ID)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
