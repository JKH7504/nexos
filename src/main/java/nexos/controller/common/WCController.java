package nexos.controller.common;

import java.io.File;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.DataEncryptor;
import nexos.framework.security.SecurityUserDetails;
import nexos.framework.support.ControllerSupport;
import nexos.framework.support.NexosSupport;
import nexos.service.common.WCService;

/**
 * Class: WMS 공통 컨트롤러<br>
 * Description: WMS Common Controller Class<br>
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
@RequestMapping("/WC")
public class WCController extends ControllerSupport {

    @Autowired
    private WCService                     service;

    @Autowired
    private AuthenticationManager         authenticationManager;

    @Autowired
    private SessionAuthenticationStrategy sessionAuthenticationStrategy;

    @Autowired
    private SecurityContextRepository     securityContextRepository;

    @Autowired
    @Qualifier("dataEncryptor")
    private DataEncryptor                 dataEncryptor;

    private Cipher                        cipherEncPayload = null;

    /**
     * 로그인 처리
     *
     * @param request
     * @param response
     * @param params
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/login.do", method = RequestMethod.POST)
    public ResponseEntity<String> login(HttpServletRequest request, HttpServletResponse response, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        String userId = (String)params.get(Consts.PK_USER_ID);
        try {
            Map<String, Object> resultMap = service.login(params);
            String userPwd = (String)params.get("P_USER_PWD");
            // 다른 사용자로 로그인되어 있을 경우 logout후 로그인 처리
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof SecurityUserDetails) {
                if (!auth.getName().equals(userId)) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.001", "해당 세션은 다른 사용자로 이미 로그인 되어 있습니다.\n\n로그아웃 후 로그인하십시오."));
                }
            }

            // 로그인되어 있는 상태에서 재로그인 호출
            // 보안 체크, 쿠키 변조 후 로그인, 2023-09
            if (auth instanceof UsernamePasswordAuthenticationToken) {
                Map<String, Object> userDetails = ((SecurityUserDetails)auth.getPrincipal()).getDetails();

                String logonSession = Util.nullToDefault(userDetails.get("_LOGIN_SESSION"), "LOGON_SESSION");
                if (!logonSession.equals(getLoginSession(request, null))) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.XXX", "로그인할 수 없는 상태입니다. 브라우저 재실행 후 다시 로그인하십시오."));
                }
            }

            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                // Spring Security - Authenticate, 인증
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userId, userPwd);
                auth = authenticationManager.authenticate(authenticationToken);

                // Spring Security Current Context - Set Authentication, 인증정보 기록
                SecurityContext securityContext = SecurityContextHolder.getContext();
                securityContext.setAuthentication(auth);

                // Http Session - Create, 세션 생성
                HttpSession session = request.getSession(true);
                // Http Session - Set Reference Infomation, 참조정보 기록
                resultMap.put("_LOGIN_SESSION_ID", session.getId());
                resultMap.put("_LOGIN_SESSION_KEY", getSessionKeyName(request));
                resultMap.put("_LOGIN_SERVER", NexosSupport.getGlobalProperty("CONFIG.ACTIVE"));
                resultMap.put("_LOGIN_SESSION", getLoginSession(request, session.getId()));
                resultMap.put("_LOGIN_APPLICATION_DIV", params.get("P_APPLICATION_DIV"));
                // Spring Security User Detail - Set Details, 로그인 사용자 상세정보 기록
                SecurityUserDetails securityUser = (SecurityUserDetails)auth.getPrincipal();
                securityUser.setDetails(resultMap);

                // Spring Security - Check Session, 로그인 사용자 세션 체크
                sessionAuthenticationStrategy.onAuthentication(auth, request, response);
                // Spring Security Current Context - Set Session, 세션 정보 기록
                securityContextRepository.saveContext(securityContext, request, response);

                // 로그인 정보 기록
                if (NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false)) {
                    Map<String, Object> activityParams = Util.newMap();
                    activityParams.put("P_ACTIVITY_DIV", "01"); // 로그인
                    activityParams.put("P_ACTIVITY_CD", null);
                    activityParams.put("P_ACTIVITY_COMMENT", //
                        "P_APPLICATION_DIV: " + Util.nullToEmpty(resultMap.get("_LOGIN_APPLICATION_DIV")) + "\n" //
                            + "P_SESSION_ID: " + resultMap.get("_LOGIN_SESSION_ID") //
                    );
                    activityParams.put("P_USER_ID", userId);
                    activityParams.put("P_CLIENT_IP", resultMap.get("CLIENT_IP"));
                    try {
                        service.writeActivityLog(activityParams);
                    } catch (Exception e) {
                    }
                }
            } else {
                // 이미 로그인되어 있을 경우 기존 정보 리턴
                resultMap = ((SecurityUserDetails)auth.getPrincipal()).getDetails();
            }

            result = getResponseEntity(request, resultMap);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);

            // 로그인 오류 정보 기록
            if (NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false)) {
                Map<String, Object> activityParams = new HashMap<String, Object>();
                activityParams.put("P_ACTIVITY_DIV", "03"); // 로그오류
                activityParams.put("P_ACTIVITY_CD", null);
                activityParams.put("P_ACTIVITY_COMMENT", //
                    "P_APPLICATION_DIV: " + Util.nullToEmpty(params.get("P_APPLICATION_DIV")) + "\n" //
                        + "P_USER_AGENT: " + request.getHeader(HttpHeaders.USER_AGENT) + "\n" //
                        + "P_ERROR_MESSAGE: " + e.getMessage() //
                );
                activityParams.put("P_USER_ID", userId);
                activityParams.put("P_CLIENT_IP", Util.getHttpRequestAddr(request));
                try {
                    service.writeActivityLog(activityParams);
                } catch (Exception ex) {
                }
            }
        }

        return result;
    }

    /**
     * 로그인 처리(암호화)
     *
     * @param request
     * @param response
     * @param params
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/loginEnc.do", method = RequestMethod.POST)
    public ResponseEntity<String> loginEnc(HttpServletRequest request, HttpServletResponse response, @RequestBody Map<String, Object> params) {

        Map<String, Object> newParams = Util.newMap();
        try {
            String encSalt = (String)params.get("P_ENC_SALT");
            String encPayload = (String)params.get("P_ENC_PAYLOAD");
            String decPayload = decryptPayload(encSalt, encPayload);
            if (Util.isNull(decPayload)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.XXX", "호출 정보가 잘못되었습니다. 화면 새로고침 후 다시 로그인하십시오."));
            }
            Util.toMap(newParams, decPayload);
        } catch (Exception e) {
            return getResponseEntityError(request, e);
        }

        return login(request, response, newParams);
    }

    /**
     * 로그아웃 처리
     *
     * @param request
     * @param response
     * @param userId
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/logout.do", method = RequestMethod.POST)
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // 로그아웃 기록
        if (NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false)) {
            if (auth != null && auth.getPrincipal() instanceof SecurityUserDetails) {
                Map<String, Object> activityParams = Util.newMap();
                SecurityUserDetails securityUser = (SecurityUserDetails)auth.getPrincipal();
                activityParams.put("P_ACTIVITY_DIV", "02"); // 로그아웃
                activityParams.put("P_ACTIVITY_CD", null);
                activityParams.put("P_ACTIVITY_COMMENT", //
                    "P_APPLICATION_DIV: " + Util.nullToEmpty(securityUser.getDetails("_LOGIN_APPLICATION_DIV")) + "\n" //
                        + "P_SESSION_ID: " + securityUser.getDetails("_LOGIN_SESSION_ID") //
                );
                activityParams.put("P_USER_ID", securityUser.getDetails("USER_ID"));
                activityParams.put("P_CLIENT_IP", securityUser.getDetails("CLIENT_IP"));
                securityUser.getDetails().put("_USER_LOGOUT_YN", Consts.YES);
                try {
                    service.writeActivityLog(activityParams);
                } catch (Exception e) {
                }
            }
        }

        try {
            if (auth != null) {
                new SecurityContextLogoutHandler().logout(request, response, auth);
            }
            result = getResponseEntity(request, Consts.OK);
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 사용자 비밀번호 초기화 처리
     *
     * @param request
     * @param response
     * @param userId
     * @param userNm
     * @param userEmail
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/resetUserPwd.do", method = RequestMethod.POST)
    public ResponseEntity<String> resetUserPwd(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.resetUserPwd(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 로그인된 사용자의 정보 리턴
     *
     * @param request
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/getSessionUserInfo.do", method = RequestMethod.POST)
    public ResponseEntity<String> getSessionUserInfo(HttpServletRequest request) {

        ResponseEntity<String> result = null;

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof SecurityUserDetails) {

                String sessionId = "NONE";
                HttpSession session = request.getSession(false);
                if (session != null) {
                    sessionId = session.getId();
                }

                SecurityUserDetails securityUser = (SecurityUserDetails)auth.getPrincipal();
                Map<String, Object> userDetails = securityUser.getDetails();
                if (Util.isNull(userDetails.get("_LOGIN_SESSION_ID"))) {
                    userDetails.put("_LOGIN_SESSION_ID", sessionId);
                }

                // 보안 체크, 쿠키 변조 후 세션 체크, 2023-09
                String logonSession = Util.nullToDefault(userDetails.get("_LOGIN_SESSION"), "LOGON_SESSION");
                if (!logonSession.equals(getLoginSession(request, sessionId))) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.002", "로그인 세션 정보가 없습니다."));
                }

                result = getResponseEntity(request, userDetails);
            } else {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.002", "로그인 세션 정보가 없습니다."));
            }
        } catch (Exception e) {
            // result = getResponseEntityError(request, e);
            // 오류메시지 대신 Encrypt Salt 리턴
            result = getResponseEntityError(request, getEncSalt(request));
        }

        return result;
    }

    /**
     * 사용자 메뉴 가져오기
     *
     * @param request
     * @param userId
     * @param programId
     * @return
     */
    @RequestMapping(value = "/getUserProgramMenu.do", method = RequestMethod.POST)
    public ResponseEntity<String> getUserProgramMenu(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            // userId 변조 보안 이슈로 사용자 체크하도록 수정, 2021-11
            String logonUserId = getLogonUserId();
            if (Util.isNull(logonUserId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.002", "로그인 세션 정보가 없습니다."));
            }

            if (!logonUserId.equals(params.get(Consts.PK_USER_ID))) {
                return getResponseEntity(request, new ArrayList<Map<String, Object>>());
            }
            // ----------------------------------------------------------------------------------------------------

            result = getResponseEntity(request, service.getUserProgramMenu(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 사용자 즐겨찾기 가져오기
     *
     * @param request
     * @param userId
     * @param programId
     * @return
     */
    @RequestMapping(value = "/getUserFavoriteMenu.do", method = RequestMethod.POST)
    public ResponseEntity<String> getUserFavoriteMenu(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            // userId 변조 보안 이슈로 사용자 체크하도록 수정, 2023-09 추가
            String logonUserId = getLogonUserId();
            if (Util.isNull(logonUserId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.002", "로그인 세션 정보가 없습니다."));
            }

            if (!logonUserId.equals(params.get(Consts.PK_USER_ID))) {
                return getResponseEntity(request, new ArrayList<Map<String, Object>>());
            }
            // ----------------------------------------------------------------------------------------------------

            result = getResponseEntity(request, service.getUserFavoriteMenu(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 비밀번호 생성 규칙 체크
     *
     * @param request
     * @param userId
     * @param orgUserPwd
     * @param newUserPwd
     * @return
     */
    @RequestMapping(value = "/validateUserPasswordChangeRules.do", method = RequestMethod.POST)
    public ResponseEntity<String> validateUserPasswordChangeRules(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.validateUserPasswordChangeRules(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 사용자 비밀번호 변경
     *
     * @param request
     * @param userId
     * @param orgUserPwd
     * @param newUserPwd
     * @param usePasswordChangeRules
     * @return
     */
    @RequestMapping(value = "/changeUserPassword.do", method = RequestMethod.POST)
    public ResponseEntity<String> changeUserPassword(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            // userId 변조 보안 이슈로 사용자 체크하도록 수정, 2023-09
            String logonUserId = getLogonUserId();
            if (Util.isNull(logonUserId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.002", "로그인 세션 정보가 없습니다."));
            }

            if (!logonUserId.equals(params.get(Consts.PK_USER_ID))) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.XXX", "호출 정보가 잘못되었습니다. 비밀번호를 변경할 수 없습니다."));
            }
            // ----------------------------------------------------------------------------------------------------

            result = getResponseEntity(request, service.changeUserPassword(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 사용자 비밀번호 변경(암호화)
     *
     * @param request
     * @param response
     * @param params
     * @return
     */
    @RequestMapping(value = "/changeUserPasswordEnc.do", method = RequestMethod.POST)
    public ResponseEntity<String> changeUserPasswordEnc(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        Map<String, Object> newParams = Util.newMap();
        try {
            String encSalt = (String)params.get("P_ENC_SALT");
            String encPayload = (String)params.get("P_ENC_PAYLOAD");
            String decPayload = decryptPayload(encSalt, encPayload);
            if (Util.isNull(decPayload)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.XXX", "호출 정보가 잘못되었습니다. 비밀번호를 변경할 수 없습니다."));
            }
            Util.toMap(newParams, decPayload);
        } catch (Exception e) {
            return getResponseEntityError(request, e);
        }

        return changeUserPassword(request, newParams);
    }

    /**
     * Sqlmap 재로딩 처리
     *
     * @param request
     * @return
     */
    @RequestMapping(value = "/reloadSqlMap.do", method = RequestMethod.POST)
    public ResponseEntity<String> reloadSqlMap(HttpServletRequest request) {
        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.reloadSqlMap());
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 디스플레이 메시지 재로딩
     *
     * @param request
     * @return
     */
    @RequestMapping(value = "/reloadDisplayMsg.do", method = RequestMethod.POST)
    public ResponseEntity<String> reloadDisplayMsg(HttpServletRequest request) {
        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.reloadDisplayMsg());
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 데이터 조회 후 Json 문자열로 리턴
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/getDataList.do", method = RequestMethod.POST)
    public ResponseEntity<String> getDataList(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getDataList(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 데이터 조회 후 Json 문자열로 리턴
     *
     * @param request
     * @param params
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
     * 데이터 조회 후 Json 문자열로 리턴
     *
     * @param request
     * @param params
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
     * 멀티 쿼리ID로 데이터 조회 후 Json 문자열로 리턴
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/getMultiDataSet.do", method = RequestMethod.POST)
    public ResponseEntity<String> getMultiDataSet(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getMultiDataSet(getServiceParamList(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 멀티 쿼리ID로 데이터 조회 후 Json 문자열로 리턴
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/getMultiDataList.do", method = RequestMethod.POST)
    public ResponseEntity<String> getMultiDataList(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getMultiDataList(getServiceParamList(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 멀티 쿼리ID로 데이터 조회 후 Json 문자열로 리턴
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/getMultiData.do", method = RequestMethod.POST)
    public ResponseEntity<String> getMultiData(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getMultiData(getServiceParamList(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 멀티 쿼리ID로 데이터 조회 후 Json 문자열로 리턴
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/getMultiDataAny.do", method = RequestMethod.POST)
    public ResponseEntity<String> getMultiDataAny(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getMultiDataAny(getServiceParamList(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 해당 테이블에 데이터가 존재하는지 여부
     *
     * @param request
     * @param params
     *        <br>
     *        <b>P_QUERY_ID</b> Mapper Id를 입력, 미지정시 "WF.GET_DATA_EXIST_YN" 를 사용 함<br>
     *        <b>P_TABLE_NM</b> 테이블명<br>
     *        <b>P_PARAM_NAMES</b> 세미콜론으로 데이터를 구분해서 입력(예: "NAME1;NAME2;NAME3;...NAME100")<br>
     *        <b>P_PARAM_VALUES</b> 세미콜론으로 데이터를 구분해서 입력(예: "VALUE1;VALUE2;VALUE3;...VALUE100")
     * @return
     */
    @RequestMapping(value = "/getDataExistYn.do", method = RequestMethod.POST)
    public ResponseEntity<String> getDataExistYn(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getDataExistYn(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 엑셀 다운로드
     *
     * @param request
     * @param response
     * @param payload
     * @return
     */
    @RequestMapping(value = "/excelExport.do", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<String> excelExport(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("P_DOWNLOAD_PARAMS") String downloadParams) {

        ResponseEntity<String> result = null;

        Map<String, Object> params = getParameter(downloadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        File xlsFile = null;
        OutputStream responseOutput = null;
        try {
            setMergeParams(params, Consts.PK_SERVICE_PARAMS);
            params.put("P_CONTEXT_URL", request.getRequestURL().toString().replace(request.getRequestURI(), ""));
            Map<String, Object> resultMap = service.excelExport(params);

            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                return getResponseEntitySubmitError(request, oMsg);
            }

            xlsFile = new File((String)resultMap.get("O_XLS_FILE_FULL_NM"));
            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, xlsFile);
            // 파일 기록
            setResponseBody(responseOutput, xlsFile);
        } catch (Exception e) {
            result = getResponseEntitySubmitError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.WC.003", "EXCEL 파일 다운로드 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
            if (xlsFile != null) {
                try {
                    xlsFile.delete();
                } catch (Exception e) {
                }
            }
        }

        return result;
    }

    /**
     * 엑셀 파일 파싱하여 데이터 조회
     *
     * @param request
     * @param uploadFile
     * @param uploadParams
     * @return
     */
    @RequestMapping(value = "/excelImport.do", method = RequestMethod.POST)
    public ResponseEntity<String> excelImport(HttpServletRequest request, @RequestParam("P_UPLOAD_FILE") MultipartFile uploadFile,
        @RequestParam("P_UPLOAD_PARAMS") String uploadParams) {

        Map<String, Object> params = getParameter(uploadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        ResponseEntity<String> result = null;

        try {
            if (uploadFile == null || uploadFile.isEmpty()) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.017", "빈 파일입니다. 다른 파일을 선택하십시오."));
            }

            setMergeParams(params, Consts.PK_SERVICE_PARAMS);
            params.put("P_UPLOAD_FILE", uploadFile);

            result = getResponseEntity(request, service.excelImport(params));
        } catch (Exception e) {
            result = getResponseEntitySubmitError(request, e);
        }

        return result;
    }

    /**
     * 사용자 그리드 설정 저장
     *
     * @param request
     * @param params
     * @return
     */
    @RequestMapping(value = "/saveUserGridLayout.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveUserGridLayout(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveUserGridLayout(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * WAS 상태 체크
     *
     * @param request
     * @return
     */
    @RequestMapping(value = "/getServerStatus.do", method = RequestMethod.POST)
    public ResponseEntity<String> getServerStatus(HttpServletRequest request) {

        ResponseEntity<String> result = null;

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof SecurityUserDetails) {
                result = getResponseEntity(request, Consts.OK);
            } else {
                throw new AccessDeniedException(NexosMessage.getDisplayMsg("JAVA.WC.002", "로그인 세션 정보가 없습니다."));
            }
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 데이터 저장 처리
     *
     * @param request
     * @param dsMaster:
     *        INSERT/UPDATE/DELETE 처리할 데이터셋
     * @param queryParams:
     *        PK_INSERT_QUERY_ID, PK_UPDATE_QUERY_ID, PK_DELETE_QUERY_ID를 직접 입력하거나<br>
     *        PK_CRUD_PROGRAM_ID, PK_CRUD_TABLE_NM를 입력, QUERY_ID 우선 검색, 미지정시 PROGRAM_ID/TABLE_NM으로 QUERY_ID 생성
     * @param userId:
     *        사용자ID
     */
    @RequestMapping(value = "/saveDataSet.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveDataSet(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            setMergeParams(params, Consts.PK_QUERY_PARAMS);
            result = getResponseEntity(request, service.saveDataSet(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 액티비티 로그 저장
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/writeActivityLog.do", method = RequestMethod.POST)
    public ResponseEntity<String> writeActivityLog(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        params.put("P_CLIENT_IP", Util.getHttpRequestAddr(request));

        try {
            result = getResponseEntity(request, service.writeActivityLog(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    private String getSessionKeyName(HttpServletRequest request) {

        String result = "JSESSIONID";
        // Servlet 3.0 버전 이상일 경우만
        if ("3.0".compareTo(Util.nullToDefault(System.getProperty("was.servlet.version"), "0.0")) < 1) {
            try {
                ServletContext servletContext = request.getServletContext();
                if (servletContext != null) {
                    result = servletContext.getSessionCookieConfig().getName();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return result;
    }

    /**
     * 호출 세션의 로그인 사용자ID 정보 리턴
     *
     * @return
     */
    private String getLogonUserId() {

        String result = "";
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof SecurityUserDetails) {
                result = Util.nullToEmpty(((SecurityUserDetails)auth.getPrincipal()).getUsername());
            }
        } catch (Exception e) {
        }

        return result;
    }

    /**
     * 쿠키 변조 체크용 추가 세션 정보 리턴
     *
     * @param request
     * @param sessionId
     * @return
     */
    private String getLoginSession(HttpServletRequest request, String sessionId) {

        if (Util.isNull(sessionId)) {
            sessionId = "NONE";

            HttpSession session = request.getSession(false);
            if (session != null) {
                sessionId = session.getId();
            }
        }

        String loginSession = dataEncryptor.encryptMD5( //
            Util.nullToDefault(Util.getHttpRequestAddr(request), "0.0.0.0") //
                + "|" + Util.nullToDefault(request.getHeader(HttpHeaders.USER_AGENT), "NONE") //
                + "|" + sessionId //
        );

        return Util.nullToDefault(loginSession, "LOGIN_SESSION").toUpperCase();
    }

    private String getEncSalt(HttpServletRequest request) {

        String loginSalt = dataEncryptor.encryptMD5( //
            Util.nullToDefault(Util.getHttpRequestAddr(request), "0.0.0.0") //
                + "|" + Util.nullToDefault(request.getHeader(HttpHeaders.USER_AGENT), "NONE") //
                + "|" + Util.getNowDate(Consts.DATETIME_FORMAT) //
        );

        return Util.nullToDefault(loginSalt, Util.lPad("", 32, "0")).toUpperCase();
    }

    public String decryptPayload(String encSalt, String encPayload) {

        if (encPayload == null || encSalt == null) {
            return null;
        }

        String result = null;
        try {
            String secret = encSalt.substring(0, 16);
            String iv = encSalt.substring(16);

            SecretKeySpec secretSpec = new SecretKeySpec(secret.getBytes(), "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes());

            if (cipherEncPayload == null) {
                cipherEncPayload = Cipher.getInstance("AES/CBC/PKCS5Padding");
            }
            cipherEncPayload.init(Cipher.DECRYPT_MODE, secretSpec, ivSpec);
            result = new String(cipherEncPayload.doFinal(dataEncryptor.decryptBase64(encPayload)), Consts.CHARSET);
        } catch (Exception e) {
            System.out.println(e);
        }

        return result;
    }
}
