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
import nexos.service.lo.LOF04050E0Service;

/**
 * Class: 수동DAS출고 컨트롤러<br>
 * Description: 수동DAS출고 Controller<br>
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
@RequestMapping("/LOF04050E0")
public class LOF04050E0Controller extends ControllerSupport {

    @Autowired
    private LOF04050E0Service service;

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
     * 분배 수량 업데이트
     * 
     * @param request
     * @param queryParamms
     * @return
     */
    @RequestMapping(value = "/callLODistributeQtyUpdate.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLODistributeQtyUpdate(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLODistributeQtyUpdate(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 분배 수량 업데이트 멀티
     * 
     * @param request
     * @param queryParamms
     * @return
     */
    @RequestMapping(value = "/callLODistributeQtyUpdateBT.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLODistributeQtyUpdateBT(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLODistributeQtyUpdateBT(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * [출고]수동DAS작업 - 상품 분배취소 처리
     * 
     * @param request
     * @param masterParams
     * @param userId
     * @return
     */
    @RequestMapping(value = "/callLOProcDistributeCancel.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOProcDistributeCancel(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOProcDistributeCancel(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * [출고]수동DAS작업 - 차수 분배취소 처리
     * 
     * @param request
     * @param masterParams
     * @param userId
     * @return
     */
    @RequestMapping(value = "/callLOProcDistributeCancelBatch.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOProcDistributeCancelBatch(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOProcDistributeCancelBatch(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * [출고]수동DAS작업 - 결품 전표를 결픔차수로 UPDATE
     * 
     * @param request
     * @param masterParams
     * @param userId
     * @return
     */
    @RequestMapping(value = "/callLOProcDistributeReBatch.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOProcDistributeReBatch(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOProcDistributeReBatch(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
