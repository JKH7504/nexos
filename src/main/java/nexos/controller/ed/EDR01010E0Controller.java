package nexos.controller.ed;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.ed.EDR01010E0Service;

/**
 * Class: 인터페이스 수신관리 컨트롤러<br>
 * Description: 인터페이스 수신관리 Controller<br>
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
@RequestMapping("/EDR01010E0")
public class EDR01010E0Controller extends ControllerSupport {

    @Autowired
    private EDR01010E0Service service;

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
     * 인터페이스 수신관리 마스터/디테일 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        수신정의 마스터 DataSet
     * @param dsDetail
     *        수신정의 디테일 DataSet
     * @param userId
     *        사용자ID
     *        참고 : 마스터 삭제 시에는 dsDetail에 빈 DataSet이 넘어와야 한다.
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
     * 인터페이스 수신관리 수신체크 저장 처리
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/saveBuCheck.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveBuCheck(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveBuCheck(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 인터페이스 수신관리 수신플래그 저장 처리
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/saveIdentifier.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveIdentifier(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveIdentifier(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 사업부수신관리 복사
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/callEMDefineRecvCopy.do", method = RequestMethod.POST)
    public ResponseEntity<String> callEMDefineRecvCopy(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callEMDefineRecvCopy(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
