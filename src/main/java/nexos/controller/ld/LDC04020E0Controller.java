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
import nexos.service.ld.LDC04020E0Service;

/**
 * Class: 운행일지 컨트롤러<br>
 * Description: 운행일지 Controller<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2019-11-25    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Controller
@RequestMapping("/LDC04020E0")
public class LDC04020E0Controller extends ControllerSupport {

    @Autowired
    private LDC04020E0Service service;

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

    @RequestMapping(value = "/saveP2.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveP2(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveP2(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 유류단가 일괄적용
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/setLDApplyFuelPriceT2.do", method = RequestMethod.POST)
    public ResponseEntity<String> setLDApplyFuelPriceT2(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.setLDApplyFuelPriceT2(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 확정/취소 처리
     *
     * @param request
     * @param processDIv
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLDProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLDProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLDProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 거리계산 오류내역 처리
     *
     * @param request
     * @param processDIv
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLDErrorProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLDErrorProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLDErrorProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
