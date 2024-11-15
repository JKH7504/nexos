package nexos.controller.cs;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.cs.CSC01040E0Service;

/**
 * Class: 프로그램 관리 컨트롤러<br>
 * Description: 프로그램 관리 Controller<br>
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
@RequestMapping("/CSC01040E0")
public class CSC01040E0Controller extends ControllerSupport {

    @Autowired
    private CSC01040E0Service service;

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
     * 메뉴 트리 리스트 리턴
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/getMenu.do", method = RequestMethod.POST)
    public ResponseEntity<String> getMenu(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getMenu(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 프로그램 메뉴 저장 처리
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/save.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveProgram(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.save(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 프로그램 사용자 저장 처리
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/saveUserProgram.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveUserProgram(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveUserProgram(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 그룹 단계 재설정
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/callCSMenuSetMenuLevel.do", method = RequestMethod.POST)
    public ResponseEntity<String> callCSMenuSetMenuLevel(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callCSMenuSetMenuLevel(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 메뉴 단계 변경
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/callCSMenuLevelExchange.do", method = RequestMethod.POST)
    public ResponseEntity<String> callCSMenuLevelExchange(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callCSMenuLevelExchange(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 메뉴 복사
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/callCSMenuCopy.do", method = RequestMethod.POST)
    public ResponseEntity<String> callCSMenuCopy(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callCSMenuCopy(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
