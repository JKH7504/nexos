package nexos.controller.li;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.support.ControllerSupport;
import nexos.service.li.LIC02010E0Service;

/**
 * Class: 입고작업 컨트롤러<br>
 * Description: 입고작업 관리 Controller<br>
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
@RequestMapping("/LIC02010E0")
public class LIC02010E0Controller extends ControllerSupport {

    @Autowired
    private LIC02010E0Service service;

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
     * 입고등록 - 입고등록 마스터/디테일 저장 처리
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
     * 입고등록 - 입고등록 마스터/디테일 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param dsDetail
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveEntry.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveEntry(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveEntry(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 입고등록 - 입고등록 마스터/디테일/디테일상세 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveWithNS.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveWithNS(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.save(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 입고지시 - 입고지시 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveDirectionsPltId.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveDirectionsPltId(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveDirectionsPltId(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 입고확정/적치 - 입고지시 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveDirections.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveDirections(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveDirections(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 입고확정 - 디테일 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsDetail
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveConfirmDetail.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveConfirmDetail(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveConfirmDetail(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 입고확정/적치 - 직송여부 변경 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveDirectYn.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveDirectYn(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveDirectYn(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * LI_PROCESSING 호출
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
    @RequestMapping(value = "/callLIProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLIProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLIProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * LI_FW_ENTRY_PROCESSING 호출
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
    @RequestMapping(value = "/callLIEntryProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLIEntryProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        // String PROCESS_CD = (String)params.get(Consts.PK_PROCESS_CD);
        // String DIRECTION = (String)params.get(Consts.PK_DIRECTION);

        try {
            result = getResponseEntity(request, service.callLIEntryProcessing(params));
            // String sendMessage = getProcessMessage(PROCESS_CD, DIRECTION, params);
            // if (Util.isNotNull(sendMessage)) {
            // }
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 신규 파렛트ID 생성
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/callCMPalletIdGetNo.do", method = RequestMethod.POST)
    public ResponseEntity<String> callCMPalletIdGetNo(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callCMPalletIdGetNo(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 소터투입여부 변경
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/callLISetSorterPutYn.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLISetSorterPutYn(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLISetSorterPutYn(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 소터투입여부 변경
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/saveVConfirmYn.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveVConfirmYn(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveVConfirmYn(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - 입고 전표를 분할 처리
     * 
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/callLIPatialCancel.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLIPatialCancel(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLIPatialCancel(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP 처리 - WCS중량계전송
     * 
     * @param masterParams
     *        조회조건
     */

    @RequestMapping(value = "/callSendFwLiOrder.do", method = RequestMethod.POST)
    public ResponseEntity<String> callSendFwLiOrder(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callSendFwLiOrder(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
