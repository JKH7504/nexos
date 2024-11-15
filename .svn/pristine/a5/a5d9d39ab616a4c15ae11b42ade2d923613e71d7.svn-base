package nexos.controller.ro;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.ro.ROC02010E0Service;

/**
 * Class: 반출작업 컨트롤러<br>
 * Description: 반출작업 관리 Controller<br>
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
@RequestMapping("/ROC02010E0")
public class ROC02010E0Controller extends ControllerSupport {

    @Autowired
    private ROC02010E0Service service;

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
     * 반출확정 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveConfirm.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveConfirm(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveConfirm(params));
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
     * 반출등록 - 반출등록 마스터/디테일 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsSub
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
     * 반출확정 - 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callROProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callROProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callROProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * RI_FW_ENTRY_PROCESSING 호출
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param processCd
     *        프로세스 코드
     * @param direction
     *        처리 진행방향
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callROEntryProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callROEntryProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callROEntryProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
