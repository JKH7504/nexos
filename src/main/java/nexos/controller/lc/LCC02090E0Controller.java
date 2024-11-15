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
import nexos.service.lc.LCC02090E0Service;

/**
 * Class: 가공작업관리 컨트롤러<br>
 * Description: 가공작업관리 Controller<br>
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
@RequestMapping("/LCC02090E0")
public class LCC02090E0Controller extends ControllerSupport {

    final String              SP_ID_GET_LC_CONFIRM_YN = "WF.GET_LC_CONFIRM_YN";

    @Autowired
    private LCC02090E0Service service;

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
     * 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
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

    /**
     * 저장 처리 (REMARK1)
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
     * 확정/확정취소 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callLCProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLCProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLCProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 확정여부 체크
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
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
     * 가공작업내역 삭제
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callLCBwProcessingEntry.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLCBwProcessingEntry(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            Map<String, Object> resultMap = service.callLCBwProcessingEntry(params);
            result = getResponseEntity(request, resultMap);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}