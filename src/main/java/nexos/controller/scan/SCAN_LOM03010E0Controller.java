package nexos.controller.scan;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.scan.SCAN_LOM03010E0Service;

/**
 * Class: 출고 스캔검수(B2B) 컨트롤러<br>
 * Description: 출고 스캔검수(B2B) Controller<br>
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
@RequestMapping("/SCAN_LOM03010E0")
public class SCAN_LOM03010E0Controller extends ControllerSupport {

    @Autowired
    private SCAN_LOM03010E0Service service;

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
     * SP 호출 - 조회
     *
     * @param request
     *        HttpServletRequest
     * @param queryId
     *        쿼리ID
     * @param queryParams
     *        쿼리 호출 파라메터
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
     * 출고 박스저장 처리
     *
     * @param request
     * @param dsMaster
     * @param dsDetail
     * @param completeYn
     * @param orderType
     * @param saveType
     * @return
     */
    @RequestMapping(value = "/callLOScanBoxSave.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOScanBoxSave(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOScanBoxSave(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고 팝업박스저장 처리
     *
     * @param request
     * @param dsMaster
     * @param dsDetail
     * @param orderType
     * @param saveType
     * @return
     */
    @RequestMapping(value = "/callLOScanPopBoxSave.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOScanPopBoxSave(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOScanPopBoxSave(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고 TOTAL 일괄검수 저장 처리
     *
     * @param request
     * @param queryParams
     * @param checkedValue
     * @return
     */
    @RequestMapping(value = "/callLOScanBoxTotalInspection.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOScanBoxTotalInspection(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOScanBoxTotalInspection(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고스캔검수-박스 삭제(팝업화면에서)
     *
     * @param request
     * @param dsMaster
     * @param userId
     * @return
     */
    @RequestMapping(value = "/callLOScanBoxDelete.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOScanBoxDelete(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOScanBoxDelete(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고스캔검수-박스 통합(팝업화면에서)
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLOScanBoxMerge.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOScanBoxMerge(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOScanBoxMerge(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고스캔검수-검수완료
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLOFWScanConfirm.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOFWScanConfirm(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            Map<String, Object> resultMap = service.callLOFWScanConfirm(params);
            result = getResponseEntity(request, resultMap);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고스캔검수-검수취소
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLOBWScanConfirm.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOBWScanConfirm(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            Map<String, Object> resultMap = service.callLOBWScanConfirm(params);
            result = getResponseEntity(request, resultMap);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고스캔검수-결품처리
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLOShortageRework.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOShortageRework(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            Map<String, Object> resultMap = service.callLOShortageRework(params);
            result = getResponseEntity(request, resultMap);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고스캔검수-주문취소처리
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLOOrderCancel.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOOrderCancel(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            Map<String, Object> resultMap = service.callLOOrderCancel(params);
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
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLOSetWbNoPrintCntUpdate.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOSetWbNoPrintCntUpdate(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callSetWbNoPrintCntUpdate(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고스캔검수-TDAS라벨
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callLOScanTdasLabel.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOScanTdasLabel(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            Map<String, Object> resultMap = service.callLOScanTdasLabel(params);
            result = getResponseEntity(request, resultMap);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

}
