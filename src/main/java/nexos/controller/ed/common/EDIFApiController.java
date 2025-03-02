package nexos.controller.ed.common;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.AuthenticationUtil;
import nexos.framework.security.SecurityUserDetailsService;
import nexos.framework.support.NexosSupport;
import nexos.service.ed.common.EDIFApiService;

/**
 * Class: WMS IF API 컨트롤러<br>
 * Description: WMS IF API Controller Class<br>
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
@RequestMapping(value = "/ifapi")
public class EDIFApiController {

    /*
     * 수신 IF Url 정보
     *     - Url 및 처리로직 변경, 2024-02
     *
     * 1. 수신정의로 처리
     *     A. Json payload 수신정의 정보가 추가되어 있는 형태
     *         - Json에서 수신정의 정보 파싱해서 수신 처리
     *         - buCd, ediDiv, defineNo
     *
     *         Service URL: host.../ifapi/definition/receive.do
     *
     *         -- Request Parameter or Request Body
     *         --<payload sample>--------------------------------------------
     *         {
     *             "buCd": "0010",
     *             "ediDiv": "RLI10",
     *             "defineNo": "REST01",
     *             "data": {
     *                 "centerCd": "A1",
     *                 "orderDate": "2024-01-01",
     *                 "vendorCd": "V00001",
     *
     *                 ...
     *
     *                 "lines": [
     *                     {
     *                         "brandCd": "B0001",
     *                         "itemCd": "I0001",
     *                         "orderQty": 100,
     *
     *                         ....
     *                     }
     *                 ]
     *             }
     *         }
     *
     *     B. Json payload에 수신정의 정보가 없는 형태
     *         - URL에 입력된 수신구분, 사업부코드로 수신정의 정보 검색하여 수신 처리
     *         - EDIFAPI.GET_SPEC_DEFINITION 호출
     *
     *         Service URL: host.../ifapi/definition/수신구분/사업부코드/receive.do
     *
     *         -- Request Parameter or Request Body
     *         --<payload sample>--------------------------------------------
     *         {
     *             "centerCd": "A1",
     *             "orderDate": "2024-01-01",
     *             "vendorCd": "V00001",
     *
     *             ...
     *
     *             "lines": [
     *                 {
     *                     "brandCd": "B0001",
     *                     "itemCd": "I0001",
     *                     "orderQty": 100,
     *
     *                     ....
     *                 }
     *             ]
     *         }
     *
     * 2. 장비 작업결과
     *     - URL에 입력된 수신구분으로 수신 스펙 검색하여 수신 처리
     *     - EDIFAPI.GET_SPEC_WCS 호출
     *
     *     - v7.5 기준, 구현되어 있는 WCS 수신 API(수신구분)
     *         - 1. WCSLCMOVERESULT  - WCS 이동작업 결과정보
     *         - 2. WCSLCRMOVERESULT - WCS ASS 역이동작업 결과정보
     *         - 3. WCSLOASSRESULT   - WCS ASS 피킹작업 결과정보
     *         - 4. WCSLODASRESULT   - WCS DAS 분배작업 결과정보
     *         - 5. WCSLODPCRESULT   - WCS DPC 피킹작업 결과정보
     *
     *     Service URL: host.../ifapi/wcs/수신구분/receive.do
     *
     *     -- Request Parameter or Request Body
     *     --<payload sample>--------------------------------------------
     *     [
     *         "CENTER_CD": "A1",
     *         "BU_CD": "0010",
     *         "OUTBOUND_DATE": "2024-01-01",
     *         "OUTBOUND_NO": "000001",
     *
     *         ...
     *     ]
     */

    // private final Logger logger = LoggerFactory.getLogger(EDIFApiController.class);

    @Autowired
    private EDIFApiService             service;

    @Autowired
    private SecurityUserDetailsService securityUserService;

    private final String               DV_BU_CD                    = "buCd";
    private final String               DV_EDI_DIV                  = "ediDiv";
    private final String               DV_DEFINE_NO                = "defineNo";
    private final String               DV_RETURN_AFTER_DATA_INSERT = "returnAfterDataInsertYn";

    private final String               PK_BU_CD                    = "P_BU_CD";
    private final String               PK_EDI_DIV                  = "P_EDI_DIV";
    private final String               PK_DEFINE_NO                = "P_DEFINE_NO";
    private final String               PK_RETURN_AFTER_DATA_INSERT = "P_RETURN_AFTER_DATA_INSERT";

    /**
     * IFAPI EDI 수신정의 수신 - Request Parameter
     * <pre>
     * Service URL: host.../ifapi/definition/receive.do
     *
     *   - Json payload 수신정의 정보가 추가되어 있는 형태
     *   - Json에서 수신정의 정보 파싱해서 수신 처리
     *   - buCd, ediDiv, defineNo
     * </pre>
     *
     * @param request
     * @param response
     * @param payload
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/definition/receive.do", method = RequestMethod.POST, params = {"payload"})
    public ResponseEntity<String> recvIfApiDefinitionParam(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("payload") String payload) {

        // 수신정의 정보를 기준으로 처리
        // Json payload 수신정의 정보가 추가되어 있는 형태
        return recvIfApiDefinitionProcessing( //
            request, response, //
            Util.nullToEmpty(payload) //
        );
    }

    /**
     * IFAPI EDI 수신정의 수신 - Request Body
     * <pre>
     * Service URL: host.../ifapi/definition/receive.do
     *
     *   - Json payload 수신정의 정보가 추가되어 있는 형태
     *   - Json에서 수신정의 정보 파싱해서 수신 처리
     *   - buCd, ediDiv, defineNo
     * </pre>
     *
     * @param request
     * @param response
     * @param payload
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/definition/receive.do", method = RequestMethod.POST)
    public ResponseEntity<String> recvIfApiDefinitionBody(HttpServletRequest request, HttpServletResponse response, @RequestBody String payload) {

        // 수신정의 정보를 기준으로 처리
        // Json payload 수신정의 정보가 추가되어 있는 형태
        return recvIfApiDefinitionProcessing( //
            request, response, //
            Util.nullToEmpty(payload) //
        );
    }

    /**
     * IFAPI EDI 수신정의 수신 - Request Parameter
     * <pre>
     * Service URL: host.../ifapi/definition/수신구분/사업부코드/receive.do
     *
     *   - URL에 입력된 수신구분, 사업부코드로 수신정의 정보 검색하여 수신 처리
     *   - EDIFAPI.GET_SPEC_DEFINITION 호출
     * </pre>
     *
     * @param request
     * @param response
     * @param payload
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/definition/{ifApiDiv}/{buCd}/receive.do", method = RequestMethod.POST, params = {"payload"})
    public ResponseEntity<String> recvIfApiAnonymousDefinitionParam(HttpServletRequest request, HttpServletResponse response,
        @PathVariable("ifApiDiv") String ifApiDiv, @PathVariable("buCd") String buCd, @RequestParam("payload") String payload) {

        // 수신정의 정보를 기준으로 처리
        // URL에 입력된 수신구분, 사업부코드로 수신정의 정보 검색하여 수신 처리
        // PathVariable은 not null, null일 경우 호출 불가
        return recvIfApiAnonymousDefinitionProcessing( //
            request, response, //
            ifApiDiv.toUpperCase(), // 수신구분은 대분자로 변경
            buCd, //
            Util.nullToEmpty(payload) //
        );
    }

    /**
     * IFAPI EDI 수신정의 수신 - Request Body
     * <pre>
     * Service URL: host.../ifapi/definition/수신구분/사업부코드/receive.do
     *
     *   - URL에 입력된 수신구분, 사업부코드로 수신정의 정보 검색하여 수신 처리
     *   - EDIFAPI.GET_SPEC_DEFINITION 호출
     * </pre>
     *
     * @param request
     * @param response
     * @param payload
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/definition/{ifApiDiv}/{buCd}/receive.do", method = RequestMethod.POST)
    public ResponseEntity<String> recvIfApiAnonymousDefinitionBody(HttpServletRequest request, HttpServletResponse response,
        @PathVariable("ifApiDiv") String ifApiDiv, @PathVariable("buCd") String buCd, @RequestBody String payload) {

        // 수신정의 정보를 기준으로 처리
        // URL에 입력된 수신구분, 사업부코드로 수신정의 정보 검색하여 수신 처리
        // PathVariable은 not null, null일 경우 호출 불가
        return recvIfApiAnonymousDefinitionProcessing( //
            request, response, //
            ifApiDiv.toUpperCase(), // 수신구분은 대분자로 변경
            buCd, //
            Util.nullToEmpty(payload) //
        );
    }

    /**
     * IFAPI WCS 작업결과 수신 - Request Parameter
     * <pre>
     * Service URL: host.../ifapi/wcs/수신구분/receive.do
     *
     *   - URL에 입력된 수신구분으로 수신 스펙 검색하여 수신 처리
     *   - EDIFAPI.GET_SPEC_WCS 호출
     *
     *   - v7.5 기준, 구현되어 있는 WCS 수신 API(수신구분)
     *     - 1. WCSLCMOVERESULT  - WCS 이동작업 결과정보
     *     - 2. WCSLCRMOVERESULT - WCS ASS 역이동작업 결과정보
     *     - 3. WCSLOASSRESULT   - WCS ASS 피킹작업 결과정보
     *     - 4. WCSLODASRESULT   - WCS DAS 분배작업 결과정보
     *     - 5. WCSLODPCRESULT   - WCS DPC 피킹작업 결과정보
     * </pre>
     *
     * @param request
     * @param response
     * @param ifApiDiv
     * @param payload
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/wcs/{ifApiDiv}/receive.do", method = RequestMethod.POST, params = {"payload"})
    public ResponseEntity<String> recvIfApiWcsParam(HttpServletRequest request, HttpServletResponse response,
        @PathVariable("ifApiDiv") String ifApiDiv, @RequestParam("payload") String payload) {

        // IFAPI SPEC 정보를 기준으로 처리 - Package
        // PathVariable은 not null, null일 경우 호출 불가
        return recvIfApiWcsProcessing( //
            request, response, //
            ifApiDiv.toUpperCase(), // 수신구분은 대분자로 변경
            Util.nullToEmpty(payload) //
        );
    }

    /**
     * IFAPI WCS 작업결과 수신 - Request Body
     * <pre>
     * Service URL: host.../ifapi/wcs/수신구분/receive.do
     *
     *   - URL에 입력된 수신구분으로 수신 스펙 검색하여 수신 처리
     *   - EDIFAPI.GET_SPEC_WCS 호출
     *
     *   - v7.5 기준, 구현되어 있는 WCS 수신 API(수신구분)
     *     - 1. WCSLCMOVERESULT  - WCS 이동작업 결과정보
     *     - 2. WCSLCRMOVERESULT - WCS ASS 역이동작업 결과정보
     *     - 3. WCSLOASSRESULT   - WCS ASS 피킹작업 결과정보
     *     - 4. WCSLODASRESULT   - WCS DAS 분배작업 결과정보
     *     - 5. WCSLODPCRESULT   - WCS DPC 피킹작업 결과정보
     * </pre>
     *
     * @param request
     * @param response
     * @param ifApiDiv
     * @param payload
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/wcs/{ifApiDiv}/receive.do", method = RequestMethod.POST)
    public ResponseEntity<String> recvIfApiWcsBody(HttpServletRequest request, HttpServletResponse response,
        @PathVariable("ifApiDiv") String ifApiDiv, @RequestBody String payload) {

        // IFAPI SPEC 정보를 기준으로 처리 - Package
        // PathVariable은 not null, null일 경우 호출 불가
        return recvIfApiWcsProcessing( //
            request, response, //
            ifApiDiv.toUpperCase(), // 수신구분은 대분자로 변경
            Util.nullToEmpty(payload) //
        );

    }

    /**
     * IFAPI 송신 - Request Body<br>
     * requestParams에 송신정의 정보가 추가되어 있는 형태
     *
     * @param request
     * @param response
     * @param ifApiDiv
     * @param requestParams
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/definition/send.do", method = RequestMethod.POST)
    public ResponseEntity<String> sendIfApiDefinitionBody(HttpServletRequest request, HttpServletResponse response,
        @RequestBody String requestParams) {

        // 송신정의 정보를 기준으로 처리
        return sendIfApiDefinitionProcessing( //
            request, response, //
            Util.nullToEmpty(requestParams) //
        );
    }

    /**
     * IFAPI EDI 송신정의 송신 - Request Body<br>
     * - URL에 입력된 수신구분, 사업부코드로 수신정의 정보 검색하여 수신 처리
     * - EDIFAPI.GET_SPEC_DEFINITION 호출
     *
     * @param request
     * @param response
     * @param ifApiDiv
     * @param requestParams
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/definition/{ifApiDiv}/{buCd}/send.do", method = RequestMethod.POST)
    public ResponseEntity<String> sendIfApiAnonymousDefinitionBody(HttpServletRequest request, HttpServletResponse response,
        @PathVariable("ifApiDiv") String ifApiDiv, @PathVariable("buCd") String buCd, @RequestBody String requestParams) {

        // 송신정의 정보를 기준으로 처리
        // PathVariable은 not null, null일 경우 호출 불가
        return sendIfApiAnonymousDefinitionProcessing( //
            request, response, //
            ifApiDiv.toUpperCase(), // 수신구분은 대분자로 변경
            buCd, //
            Util.nullToEmpty(requestParams) //
        );
    }

    /**
     * IFAPI 수신 사전 처리<br>
     * 사용자 인증정보, 데이터 체크
     *
     * @param request
     * @param ifApiGrp
     * @param ifApiDiv
     * @param payload
     * @return
     */
    private Map<String, Object> recvIfApiProcessingBefore(HttpServletRequest request, String ifApiGrp, String ifApiDiv, String payload) {

        Map<String, Object> resultMap = Util.newMap();
        HttpStatus errorStatus = null;
        String errorMessage = Consts.OK;
        String principal = null;

        // 인증토큰 체크
        try {
            principal = validateUserToken(request);
        } catch (Exception e) {
            errorStatus = HttpStatus.UNAUTHORIZED;
            errorMessage = Util.getErrorMessage(e);
        }

        // 수신 데이터 Null 체크
        if (Util.isNull(errorStatus) && Util.isNull(payload)) {
            errorStatus = HttpStatus.BAD_REQUEST;
            errorMessage = NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[" + ifApiDiv + "]수신 데이터(payload)가 존재하지 않습니다.", new String[] {ifApiDiv});
        }

        // 에러 상태면 기록
        if (Util.isNotNull(errorStatus)) {
            service.recvIfApiProcessingBeforeErrorLog( //
                Util.isNull(principal) ? request : principal, //
                ifApiGrp, ifApiDiv, payload, //
                errorStatus.toString() //
            );
        }

        // Payload 및 추가 정보 입력
        resultMap.put("P_FILE_DIV", Consts.FILE_DIV_DOC);
        resultMap.put("P_DOCUMENT", payload);
        resultMap.put("P_IFAPI_GRP", ifApiGrp);
        resultMap.put("P_IFAPI_DIV", ifApiDiv);
        resultMap.put(Consts.PK_USER_ID, principal);
        resultMap.put("O_ERROR_STATUS", errorStatus);
        Util.setOutMessage(resultMap, errorMessage);

        return resultMap;
    }

    /**
     * IFAPI EDI 수신정의 수신 처리<br>
     * payload에 수신정의 정보가 포함되어 있는 형태
     * <pre>
     * // 데이터 샘플, 멀티
     * {
     *     "buCd": "0010",
     *     "ediDiv": "RLI10",
     *     "defineNo": "REST",
     *     "orders": [
     *         {
     *             "centerCd": "RD",
     *             "clientDate": "2019-07-18",
     *             "clientNo": "201907180001",
     *             "VendorCd": "V00001",
     *             "items": [
     *                 {
     *                     "clientLineNo": "001",
     *                     "itemCd": "I0001",
     *                     "itemState": "A",
     *                     "orderQty": 5
     *                 },
     *                 {
     *                     "clientLineNo": "002",
     *                     "itemCd": "I0002",
     *                     "itemState": "A",
     *                     "orderQty": 3
     *                 }
     *             ]
     *         },
     *         {
     *             "centerCd": "RD",
     *             "clientDate": "2019-07-18",
     *             "clientNo": "201907180002",
     *             "VendorCd": "V00002",
     *             "items": [
     *                 {
     *                     "clientLineNo": "001",
     *                     "itemCd": "I0003",
     *                     "itemState": "A",
     *                     "orderQty": 5
     *                 },
     *                 {
     *                     "clientLineNo": "002",
     *                     "itemCd": "I0004",
     *                     "itemState": "A",
     *                     "orderQty": 3
     *                 }
     *             ]
     *         }
     *     ]
     * }
     * </pre>
     *
     * @param request
     * @param response
     * @param payload
     * @return
     */
    private ResponseEntity<String> recvIfApiDefinitionProcessing(HttpServletRequest request, HttpServletResponse response, String payload) {

        ResponseEntity<String> result = null;

        // IFAPI 수신구분, 수신정의 사용
        String ifApiGroup = "IFAPI";
        String ifApiDiv = "DEFINITION";
        // 사전 처리, 체크
        Map<String, Object> params = recvIfApiProcessingBefore(request, ifApiGroup, ifApiDiv, payload);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntityError(request, oMsg, (HttpStatus)params.get("O_ERROR_STATUS"));
        }

        // Json payload -> 최상위 레벨 파싱
        Map<String, Object> defineInfo = getParameter(payload, true);
        oMsg = Util.getOutMessage(defineInfo);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntityError(request, oMsg, HttpStatus.BAD_REQUEST);
        }

        // 파싱된 데이터에서 수신정의 정보 추가 필수 체크
        if (Util.isNull(defineInfo.get(DV_BU_CD)) || Util.isNull(defineInfo.get(DV_EDI_DIV)) || Util.isNull(defineInfo.get(DV_DEFINE_NO))) {
            HttpStatus errorStatus = HttpStatus.BAD_REQUEST;
            service.recvIfApiProcessingBeforeErrorLog(params.get(Consts.PK_USER_ID), ifApiGroup, ifApiDiv, payload, errorStatus.toString());

            return getResponseEntityError(request, //
                NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[" + ifApiDiv + "]수신 데이터(payload)에 수신정의(buCd, ediDiv, defineNo) 정보가 존재하지 않습니다.",
                    new String[] {ifApiDiv}),
                errorStatus);
        }

        // 추가 파라메터 입력
        // 파싱된 데이터에서 수신정의 정보를 수신 파라메터에 추가
        params.put(PK_BU_CD, defineInfo.get(DV_BU_CD));
        params.put(PK_EDI_DIV, defineInfo.get(DV_EDI_DIV));
        params.put(PK_DEFINE_NO, defineInfo.get(DV_DEFINE_NO));
        params.put(PK_RETURN_AFTER_DATA_INSERT, defineInfo.get(DV_RETURN_AFTER_DATA_INSERT)); // 체크 없음, 미지정시 기본값으로 처리
        // IFAPI 종류
        // R11 - EDI 수신정의 정보로 수신 처리(payload에 정의정보 존재)
        // R12 - EDI 수신정의 정보로 수신 처리(수신구분,사업부코드로 정의정보 검색)
        // R21 - WCS 수신 처리(수신구분으로 IF_SPEC 검색)
        params.put("P_IFAPI_TYPE", "R11");
        params.put("P_DEFINE_DIV", Consts.DEFINE_DIV_RECV);

        try {
            // 수신 처리 호출
            Map<String, Object> resultMap = service.recvIfApiDefinitionProcessing(params);

            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                // 수신정의 정보가 존재하지 않을 경우
                if (Util.isNotNull(resultMap.get("O_ERROR_STATUS"))) {
                    return getResponseEntityError(request, oMsg, (HttpStatus)resultMap.get("O_ERROR_STATUS"));
                }
                throw new RuntimeException(oMsg);
            }

            // 정상 처리 리턴
            result = getResponseEntity(request, resultMap, getResultInfo(params));
        } catch (Exception e) {
            oMsg = Util.getErrorMessage(e);
            Map<String, Object> resultInfo = getResultInfo(params);
            // 결과 정보가 없으면 기본 포맷으로 오류 리턴
            if (Util.isNull(resultInfo)) {
                result = getResponseEntityError(request, oMsg);
            }
            // 결과 정보가 있으면 해당 포맷으로 변환하여 리턴
            else {
                result = getResponseEntityError(request, oMsg, resultInfo, HttpStatus.OK, null);
            }
        }

        return result;
    }

    /**
     * IFAPI EDI 수신정의 수신 처리<br>
     * payload에 수신정의 정보가 없음, 수신구분/사업부코드로 수신정의 정보 검색하여 수신
     *
     * @param request
     * @param response
     * @param ifApiDiv
     * @param buCd
     * @param payload
     * @return
     */
    private ResponseEntity<String> recvIfApiAnonymousDefinitionProcessing(HttpServletRequest request, HttpServletResponse response, String ifApiDiv,
        String buCd, String payload) {

        ResponseEntity<String> result = null;

        // 사전 처리, 체크
        String ifApiGrp = "IFAPI";
        Map<String, Object> params = recvIfApiProcessingBefore(request, ifApiGrp, ifApiDiv, payload);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntityError(request, oMsg, (HttpStatus)params.get("O_ERROR_STATUS"));
        }

        // 추가 파라메터 입력
        params.put(PK_BU_CD, buCd);
        // IFAPI 종류
        // R11 - EDI 수신정의 정보로 수신 처리(payload에 정의정보 존재)
        // R12 - EDI 수신정의 정보로 수신 처리(수신구분,사업부코드로 정의정보 검색)
        // R21 - WCS 수신 처리(수신구분으로 IF_SPEC 검색)
        params.put("P_IFAPI_TYPE", "R12");
        params.put("P_DEFINE_DIV", Consts.DEFINE_DIV_RECV);

        try {
            // 수신 처리 호출
            Map<String, Object> resultMap = service.recvIfApiDefinitionProcessing(params);

            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                // IFAPI Spec이 존재하지 않을 경우
                if (Util.isNotNull(resultMap.get("O_ERROR_STATUS"))) {
                    return getResponseEntityError(request, oMsg, (HttpStatus)resultMap.get("O_ERROR_STATUS"));
                }
                throw new RuntimeException(oMsg);
            }

            // 정상 처리 리턴
            result = getResponseEntity(request, resultMap, getResultInfo(params));
        } catch (Exception e) {
            oMsg = Util.getErrorMessage(e);
            Map<String, Object> resultInfo = getResultInfo(params);
            // 결과 정보가 없으면 기본 포맷으로 오류 리턴
            if (Util.isNull(resultInfo)) {
                result = getResponseEntityError(request, oMsg);
            }
            // 결과 정보가 있으면 해당 포맷으로 변환하여 리턴
            else {
                result = getResponseEntityError(request, oMsg, resultInfo, HttpStatus.OK, null);
            }
        }

        return result;
    }

    /**
     * IFAPI WCS 작업결과 수신 처리
     *
     * @param request
     * @param response
     * @param ifApiDiv
     * @param payload
     * @return
     */
    private ResponseEntity<String> recvIfApiWcsProcessing(HttpServletRequest request, HttpServletResponse response, String ifApiDiv, String payload) {

        ResponseEntity<String> result = null;

        // 사전 처리, 체크
        String ifApiGrp = "IFAPI";
        Map<String, Object> params = recvIfApiProcessingBefore(request, ifApiGrp, ifApiDiv, payload);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntityError(request, "[" + ifApiDiv + "]" + oMsg, (HttpStatus)params.get("O_ERROR_STATUS"));
        }

        // 추가 파라메터 입력
        // IFAPI 종류
        // R11 - EDI 수신정의 정보로 수신 처리(payload에 정의정보 존재)
        // R12 - EDI 수신정의 정보로 수신 처리(수신구분,사업부코드로 정의정보 검색)
        // R21 - WCS 수신 처리(수신구분으로 IF_SPEC 검색)
        params.put("P_IFAPI_TYPE", "R21");
        params.put("P_DEFINE_DIV", Consts.DEFINE_DIV_RECV);

        try {
            // 수신 처리 호출
            Map<String, Object> resultMap = service.recvIfApiWcsProcessing(params);

            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                // IFAPI Spec이 존재하지 않을 경우
                if (Util.isNotNull(resultMap.get("O_ERROR_STATUS"))) {
                    return getResponseEntityError(request, oMsg, (HttpStatus)resultMap.get("O_ERROR_STATUS"));
                }
                throw new RuntimeException(oMsg);
            }

            // 정상 처리 리턴
            result = getResponseEntity(request, resultMap, getResultInfo(params));
        } catch (Exception e) {
            oMsg = Util.getErrorMessage(e);
            Map<String, Object> resultInfo = getResultInfo(params);
            // 결과 정보가 없으면 기본 포맷으로 오류 리턴
            if (Util.isNull(resultInfo)) {
                result = getResponseEntityError(request, oMsg);
            }
            // 결과 정보가 있으면 해당 포맷으로 변환하여 리턴
            else {
                result = getResponseEntityError(request, oMsg, resultInfo);
            }
        }

        return result;
    }

    /**
     * IFAPI 송신 사전 처리<br>
     * 사용자 인증정보, 데이터 체크
     *
     * @param request
     * @param ifApiGrp
     * @param ifApiDiv
     * @param requestParams
     * @return
     */
    private Map<String, Object> sendIfApiProcessingBefore(HttpServletRequest request, String ifApiGrp, String ifApiDiv, String requestParams) {

        Map<String, Object> resultMap = Util.newMap();
        HttpStatus errorStatus = null;
        String errorMessage = Consts.OK;
        String principal = null;

        // 인증토큰 체크
        try {
            principal = validateUserToken(request);
        } catch (Exception e) {
            errorStatus = HttpStatus.UNAUTHORIZED;
            errorMessage = Util.getErrorMessage(e);
        }

        // 수신 데이터 Null 체크
        if (Util.isNull(errorStatus) && Util.isNull(requestParams)) {
            errorStatus = HttpStatus.BAD_REQUEST;
            errorMessage = NexosMessage.getDisplayMsg("JAVA.ED.XXX", "송신 데이터 검색 파라메터(requestParams)가 존재하지 않습니다.");
        }

        if (Util.isNull(errorStatus)) {
            Map<String, Object> requestParamsMap = getParameter(requestParams);
            String oMsg = Util.getOutMessage(requestParamsMap);
            if (!Consts.OK.equals(oMsg)) {
                errorStatus = HttpStatus.BAD_REQUEST;
                errorMessage = NexosMessage.getDisplayMsg("JAVA.ED.XXX", "송신 데이터 검색 파라메터(requestParams)를 파싱할 수 없습니다.\n" + oMsg);
            } else {
                resultMap.putAll(requestParamsMap);
            }
        }

        // 에러 상태면 기록
        if (Util.isNotNull(errorStatus)) {
            service.sendIfApiProcessingBeforeErrorLog( //
                Util.isNull(principal) ? request : principal, //
                ifApiGrp, ifApiDiv, requestParams, //
                errorStatus.toString() //
            );
        }

        // Payload 및 추가 정보 입력
        resultMap.put("P_IFAPI_GRP", ifApiGrp);
        resultMap.put("P_IFAPI_DIV", ifApiDiv);
        resultMap.put("P_REQUEST_PARAMS", requestParams);
        resultMap.put(Consts.PK_USER_ID, principal);
        resultMap.put("O_ERROR_STATUS", errorStatus);
        Util.setOutMessage(resultMap, errorMessage);

        return resultMap;
    }

    /**
     * IFAPI EDI 송신정의 송신 처리<br>
     * requestParams에 송신정의 정보가 포함되어 있는 형태
     *
     * @param request
     * @param response
     * @param requestParams
     * @return
     */
    private ResponseEntity<String> sendIfApiDefinitionProcessing(HttpServletRequest request, HttpServletResponse response, String requestParams) {

        ResponseEntity<String> result = null;

        // IFAPI 송신구분, 송신정의 사용
        String ifApiGrp = "IFAPI";
        String ifApiDiv = "DEFINITION";
        // 사전 처리, 체크
        Map<String, Object> params = sendIfApiProcessingBefore(request, ifApiGrp, ifApiDiv, requestParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntityError(request, oMsg, (HttpStatus)params.get("O_ERROR_STATUS"));
        }

        // requestParams 파라메터 내에 송신정의 정보가 있을 경우
        // 파싱된 데이터에서 송신정의 정보 추가 필수 체크
        if (Util.isNull(params.get(DV_BU_CD)) || Util.isNull(params.get(DV_EDI_DIV)) || Util.isNull(params.get(DV_DEFINE_NO))) {
            HttpStatus errorStatus = HttpStatus.BAD_REQUEST;
            service.sendIfApiProcessingBeforeErrorLog(params.get(Consts.PK_USER_ID), ifApiGrp, ifApiDiv, requestParams, errorStatus.toString());

            return getResponseEntityError(request, //
                NexosMessage.getDisplayMsg("JAVA.ED.XXX", "[" + ifApiDiv + "]송신 데이터 검색 파라메터에 송신정의(buCd, ediDiv, defineNo) 정보가 존재하지 않습니다.",
                    new String[] {ifApiDiv}),
                errorStatus);
        }

        // 파라메터명으로 변경 추가
        params.put(PK_BU_CD, params.get(DV_BU_CD)); // 사업부 buCd -> P_BU_CD
        params.put(PK_EDI_DIV, params.get(DV_EDI_DIV)); // 송수신구분 ediDiv -> P_EDI_DIV
        params.put(PK_DEFINE_NO, params.get(DV_DEFINE_NO)); // 송수신정의번호 defineNo -> P_DEFINE_NO
        // IFAPI 종류
        // S11 - EDI 송신정의 정보로 송신 처리(requestParams에 정의정보 존재)
        // S12 - EDI 송신정의 정보로 송신 처리(송신구분,송업부코드로 정의정보 검색)
        params.put("P_IFAPI_TYPE", "S11");
        params.put("P_DEFINE_DIV", Consts.DEFINE_DIV_SEND);

        try {
            // 송신 처리 호출
            Map<String, Object> resultMap = service.sendIfApiDefinitionProcessing(params);

            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                // 송신정의 정보가 존재하지 않을 경우
                if (Util.isNotNull(resultMap.get("O_ERROR_STATUS"))) {
                    return getResponseEntityError(request, oMsg, (HttpStatus)resultMap.get("O_ERROR_STATUS"));
                }
                throw new RuntimeException(oMsg);
            }

            // 정상 처리 리턴
            result = getResponseEntity(request, resultMap, getResultInfo(params));
        } catch (Exception e) {
            oMsg = Util.getErrorMessage(e);
            Map<String, Object> resultInfo = getResultInfo(params);
            // 결과 정보가 없으면 기본 포맷으로 오류 리턴
            if (Util.isNull(resultInfo)) {
                result = getResponseEntityError(request, oMsg);
            }
            // 결과 정보가 있으면 해당 포맷으로 변환하여 리턴
            else {
                result = getResponseEntityError(request, oMsg, resultInfo);
            }
        }

        return result;
    }

    /**
     * IFAPI EDI 송신정의 송신 처리<br>
     * requestParams에 송신정의 정보가 포함되어 있는 형태
     *
     * @param request
     * @param response
     * @param ifApiDiv
     * @param buCd
     * @param requestParams
     * @return
     */
    private ResponseEntity<String> sendIfApiAnonymousDefinitionProcessing(HttpServletRequest request, HttpServletResponse response, String ifApiDiv,
        String buCd, String requestParams) {

        ResponseEntity<String> result = null;

        // 사전 처리, 체크
        String ifApiGrp = "IFAPI";
        Map<String, Object> params = sendIfApiProcessingBefore(request, ifApiGrp, ifApiDiv, requestParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntityError(request, oMsg, (HttpStatus)params.get("O_ERROR_STATUS"));
        }

        // 추가 파라메터 입력
        params.put(PK_BU_CD, buCd);
        // IFAPI 종류
        // S11 - EDI 송신정의 정보로 송신 처리(requestParams에 정의정보 존재)
        // S12 - EDI 송신정의 정보로 송신 처리(송신구분,송업부코드로 정의정보 검색)
        params.put("P_IFAPI_TYPE", "S12");
        params.put("P_DEFINE_DIV", Consts.DEFINE_DIV_SEND);

        try {
            // 송신 처리 호출
            Map<String, Object> resultMap = service.sendIfApiDefinitionProcessing(params);

            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                // IFAPI Spec이 존재하지 않을 경우
                if (Util.isNotNull(resultMap.get("O_ERROR_STATUS"))) {
                    return getResponseEntityError(request, oMsg, (HttpStatus)resultMap.get("O_ERROR_STATUS"));
                }
                throw new RuntimeException(oMsg);
            }

            // 정상 처리 리턴
            result = getResponseEntity(request, resultMap, getResultInfo(params));
        } catch (Exception e) {
            oMsg = Util.getErrorMessage(e);
            Map<String, Object> resultInfo = getResultInfo(params);
            // 결과 정보가 없으면 기본 포맷으로 오류 리턴
            if (Util.isNull(resultInfo)) {
                result = getResponseEntityError(request, oMsg);
            }
            // 결과 정보가 있으면 해당 포맷으로 변환하여 리턴
            else {
                result = getResponseEntityError(request, oMsg, resultInfo);
            }
        }

        return result;
    }

    /**
     * 인증정보 유효성 체크
     *
     * @param request
     * @throws Exception
     * @return String
     */
    private String validateUserToken(HttpServletRequest request) throws Exception {

        // 인증 체크할 경우만 처리
        if (!NexosSupport.getGlobalBooleanProperty("EDI.IFAPI.AUTHORITY_CHECK", false)) {
            return "";
        }

        String authorization = AuthenticationUtil.getHttpAuthorization(request);
        if (Util.isNull(authorization)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.003", "인증 정보가 존재하지 않습니다."));
        }

        String principal = AuthenticationUtil.getPrincipalFromAuthorization(authorization);

        if (Util.isNull(principal)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.004", "인증 정보가 유효하지 않습니다."));
        } else {
            UserDetails user = securityUserService.loadUserByUsername(principal);
            AuthenticationUtil.validateAuthorization(authorization, user);
        }

        return principal;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getResultInfo(Map<String, Object> params) {

        return (Map<String, Object>)params.get("P_JSON_RESULT_INFO");
    }

    private ResponseEntity<String> getResponseEntity(HttpServletRequest request, Map<String, Object> resultMap, Map<String, Object> resultInfo) {

        // 송신일 경우
        String result = (String)resultMap.get("O_DOCUMENT");
        if (Util.isNotNull(result)) {
            return getResponseEntity(request, result, null, null, getHttpHeader());
        }

        return getResponseEntity(request, resultInfo);
    }

    private ResponseEntity<String> getResponseEntity(HttpServletRequest request, Map<String, Object> resultInfo) {

        return getResponseEntity(request, Consts.OK, resultInfo, null, null);
    }

    private ResponseEntity<String> getResponseEntity(HttpServletRequest request, String message, Map<String, Object> resultInfo,
        HttpStatus httpStatus, HttpHeaders httpHeaders) {

        request.setAttribute("__RESPONSE_STATUS", Consts.OK);
        // Http Status 기본값 200 - OK
        if (httpStatus == null) {
            httpStatus = HttpStatus.OK;
        }
        // 결과 메시지 변경, ResultInfo가 있을 경우 MediaType -> Json으로 전송
        if (resultInfo != null) {
            message = getResultMessage((String)resultInfo.get("P_RESULT_CD_SUCCESS"), message, resultInfo);
            if (httpHeaders == null) {
                httpHeaders = getHttpHeader();
            }
        }
        // 그외, MediaType -> Text/Html로 전송
        else {
            if (httpHeaders == null) {
                httpHeaders = getHttpHeader(MediaType.TEXT_PLAIN_VALUE + ";charset=" + Consts.CHARSET);
            }
        }

        return new ResponseEntity<String>(message, httpHeaders, httpStatus);
    }

    private ResponseEntity<String> getResponseEntityError(HttpServletRequest request, String message) {

        return getResponseEntityError(request, message, null, null, null);
    }

    private ResponseEntity<String> getResponseEntityError(HttpServletRequest request, String message, Map<String, Object> resultInfo) {

        return getResponseEntityError(request, message, resultInfo, null, null);
    }

    private ResponseEntity<String> getResponseEntityError(HttpServletRequest request, String message, HttpStatus httpStatus) {

        return getResponseEntityError(request, message, null, httpStatus, null);
    }

    private ResponseEntity<String> getResponseEntityError(HttpServletRequest request, String message, Map<String, Object> resultInfo,
        HttpStatus httpStatus, HttpHeaders httpHeaders) {

        // Null Pointer Exception일 경우 message가 없음
        message = Util.nullToDefault(message, "Null Pointer Exception");
        request.setAttribute("__RESPONSE_STATUS", message.replaceAll("\\r?\\n", ""));
        // Http Status 기본값 500 - INTERNAL_SERVER_ERROR
        if (httpStatus == null) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        // 결과 메시지 변경, ResultInfo가 있을 경우 MediaType -> Json으로 전송
        if (resultInfo != null) {
            message = getResultMessage((String)resultInfo.get("P_RESULT_CD_ERROR"), message, resultInfo);
            if (httpHeaders == null) {
                httpHeaders = getHttpHeader();
            }
        }
        // 그외, MediaType -> Text/Html로 전송
        else {
            if (httpHeaders == null) {
                httpHeaders = getHttpHeader(MediaType.TEXT_PLAIN_VALUE + ";charset=" + Consts.CHARSET);
            }
        }

        return new ResponseEntity<String>(message, httpHeaders, httpStatus);
    }

    private String getResultMessage(String messageCd, String message, Map<String, Object> resultInfo) {

        String resultTag = Util.nullToDefault((String)resultInfo.get("P_TAG_RESULT"), (String)resultInfo.get("P_RESULT_MESSAGE"));

        // 숫자 타입
        if ("NUMBER".equals(resultInfo.get("P_RESULT_CD_DATA_TYPE"))) {
            resultTag = resultTag.replace("#RESULT_CD#", messageCd);
        }
        // 문자 타입
        else {
            resultTag = resultTag.replace("#RESULT_CD#", "\"" + messageCd + "\"");
        }

        try {
            resultTag = resultTag.replace("#RESULT_MSG#", Util.nullToDefault(Util.toJson(message), "null"));
        } catch (Exception e) {
            resultTag = resultTag.replace("#RESULT_MSG#", NexosMessage.getDisplayMsg("JAVA.ED.008", "\"Json 변환 오류\""));
        }

        return resultTag;
    }

    /**
     * Json String 을 Map 로 변환하여 리턴
     *
     * @param jsonParams
     * @return Map<String, Object>
     */
    private Map<String, Object> getParameter(String jsonParams) {

        return Util.toMap(jsonParams);
    }

    @SuppressWarnings("unused")
    private void setParameter(Map<String, Object> params, String jsonParams) {

        Util.toMap(params, jsonParams);
    }

    /**
     * Json String 을 Map 로 변환하여 리턴
     *
     * @param jsonParams
     * @return Map<String, Object>
     */
    private Map<String, Object> getParameter(String jsonParams, boolean isFirstLevel) {

        if (isFirstLevel) {
            Map<String, Object> result = new HashMap<String, Object>();

            Util.setOutMessage(result, Consts.OK);
            if (Util.isNotNull(jsonParams)) {
                ObjectMapper objMapper = new ObjectMapper();
                try {
                    JsonNode rootNode = objMapper.readTree(jsonParams);
                    if (rootNode.size() > 0) {
                        Iterator<Entry<String, JsonNode>> fields = rootNode.fields();
                        while (fields.hasNext()) {
                            Entry<String, JsonNode> field = fields.next();
                            JsonNode node = field.getValue();
                            if (node.isTextual()) {
                                result.put(field.getKey(), node.textValue());
                            } else if (node.isNumber()) {
                                result.put(field.getKey(), String.valueOf(node.numberValue()));
                            }
                        }
                    }
                } catch (Exception e) {
                    Util.setOutMessage(result, Util.getErrorMessage(e));
                }
            }
            return result;
        } else {
            return getParameter(jsonParams);
        }
    }

    /**
     * response HttpHeader 리턴
     *
     * @return HttpHeaders
     */
    private HttpHeaders getHttpHeader() {

        HttpHeaders result = new HttpHeaders();
        // Context Type을 Json으로 설정.
        result.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE + ";charset=" + Consts.CHARSET);

        return result;
    }

    /**
     * response HttpHeader 리턴
     *
     * @return HttpHeaders
     */
    private HttpHeaders getHttpHeader(String mediaType) {

        HttpHeaders result = new HttpHeaders();
        // Context Type 설정.
        result.add(HttpHeaders.CONTENT_TYPE, mediaType);

        return result;
    }
}
