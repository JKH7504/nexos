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
import nexos.service.lo.LOF01010E0Service;

/**
 * Class: 온라인 출고예정작업[풀필먼트] 컨트롤러<br>
 * Description: 온라인 출고예정작업[풀필먼트] Controller<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-12-21    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Controller
@RequestMapping("/LOF01010E0")
public class LOF01010E0Controller extends ControllerSupport {

    @Autowired
    private LOF01010E0Service service;

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
     * 출고예정 종결처리 SP 호출
     * 
     * @param params
     */
    @RequestMapping(value = "/callLOOrderClosing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOOrderClosing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOOrderClosing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고예정 삭제처리 SP 호출
     * 
     * @param params
     */
    @RequestMapping(value = "/callLOOrderDelete.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOOrderDelete(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOOrderDelete(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고예정 보류처리 SP 호출
     * 
     * @param params
     */
    @RequestMapping(value = "/callLOOrderHold.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOOrderHold(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOOrderHold(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 주문취소처리 처리
     * 
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLOOrderCancel.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOOrderCancel(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOOrderCancel(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
