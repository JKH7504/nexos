package nexos.controller.lc;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.lc.LCC03010E0Service;

/**
 * Class: 로케이션이동 컨트롤러<br>
 * Description: 로케이션이동 관리 Controller<br>
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
@RequestMapping("/LCC03010E0")
public class LCC03010E0Controller extends ControllerSupport {

    final String              SP_ID_GET_LC_CONFIRM_YN = "WF.GET_LC_CONFIRM_YN";

    @Autowired
    private LCC03010E0Service service;

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
     * 화면에서 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/updateRemark.do", method = RequestMethod.POST)
    public ResponseEntity<String> updateRemark(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.updateRemark(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 저장 처리
     * 
     * @param request
     * @param dsMaster
     * @param dsSub
     * @param processCd
     * @param userId
     * @return
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

    @RequestMapping(value = "/getConfirmYn.do", method = RequestMethod.POST)
    public ResponseEntity<String> getConfirmYn(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getData(SP_ID_GET_LC_CONFIRM_YN, params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP호출하여 데이터 취득
     * 
     * @param request
     * @param queryId
     * @param queryParams
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

    @RequestMapping(value = "/callLcBwMoveEntry.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLcBwMoveEntry(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLcBwMoveEntry(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/callLcMoveConfirm.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLcMoveConfirm(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLcMoveConfirm(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/callLcFWFillupEmergencyEntry.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLcFWFillupEmergencyEntry(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLcFWFillupEmergencyEntry(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/callLcFWFillupSpotEntry.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLcFWFillupSpotEntry(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLcFWFillupSpotEntry(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

}
