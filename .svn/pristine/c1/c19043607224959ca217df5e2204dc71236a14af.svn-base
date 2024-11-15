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
import nexos.service.lo.LOB07020E0Service;

/**
 * Class: 운송장내역 컨트롤러<br>
 * Description: 운송장내역 Controller<br>
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
@RequestMapping("/LOB07020E0")
public class LOB07020E0Controller extends ControllerSupport {

    @Autowired
    private LOB07020E0Service service;

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
     * SP호출
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

    /**
     * 추가 발행 운송장 삭제 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/delete.do", method = RequestMethod.POST)
    public ResponseEntity<String> delete(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.delete(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 송장추가발행 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callLOWbNoAdd.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOWbNoAdd(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            Map<String, Object> resultMap = service.callLOWbNoAdd(params);
            result = getResponseEntity(request, resultMap);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고스캔검수-송장 출력 횟수 업데이트 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callSetWbNoPrintCntUpdate.do", method = RequestMethod.POST)
    public ResponseEntity<String> callSetWbNoPrintCntUpdate(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callSetWbNoPrintCntUpdate(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 반입요청 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/returnSave.do", method = RequestMethod.POST)
    public ResponseEntity<String> returnSave(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.returnSave(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 송장 확정 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callLOWbConfirm.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOWbConfirm(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            Map<String, Object> resultMap = service.callLOWbConfirm(params);
            result = getResponseEntity(request, resultMap);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}