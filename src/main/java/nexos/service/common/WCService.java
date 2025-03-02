package nexos.service.common;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.session.SessionDestroyedEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import nexos.dao.common.WCDAO;
import nexos.dao.ed.common.EDCommonDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.json.JsonDataSet;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.AuthenticationUtil;
import nexos.framework.security.SecurityUserDetails;
import nexos.framework.support.DaoSupport;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: WCService<br>
 * Description: WMS Common 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service
public class WCService extends ServiceSupport implements ApplicationListener<SessionDestroyedEvent> {

    // private final Logger logger = LoggerFactory.getLogger(WCService.class);

    final String        SELECT_ID_GET_CSUSERFAVORITE     = "WC.GET_CSUSERFAVORITE";
    final String        SP_ID_CS_USER_CLIENT_IP_CHECKING = "CS_USER_CLIENT_IP_CHECKING";

    @Autowired
    private WCDAO       dao;

    @Autowired
    private EDCommonDAO commonDAO;

    /**
     * 로그인 처리 및 사용자 정보 리턴
     *
     * @param params
     *        조회조건
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public Map<String, Object> login(Map<String, Object> params) {

        Map<String, Object> userMap = null;

        // CLIENT IP
        ServletRequestAttributes requestAttrib = (ServletRequestAttributes)RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = requestAttrib.getRequest();
        String remoteAddr = Util.getHttpRequestAddr(request);
        params.put("P_CLIENT_IP", remoteAddr);

        // 접속 IP 체크
        String oMsg = validateClientIp(params);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 사용자 정보 가져오기
        try {
            userMap = dao.getLogin(params);
            userMap.put("CLIENT_IP", remoteAddr);
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            } else {
                throw new RuntimeException(Util.getErrorMessage(NexosMessage.getDisplayMsg("JAVA.WC.025", "[로그인 오류]"), e));
            }
        }

        // 비밀번호 오류 건수 체크
        oMsg = validateUserPasswordErrorCount(params, userMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 사용자 재직여부 체크
        oMsg = validateUserWork(userMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 시스템 장기 미사용 체크
        oMsg = validateDomantUser(userMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 비밀번호 사용기한 만료
        oMsg = validateUserPasswordExpire(userMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 기본값 체크
        oMsg = validateDefaultCode(userMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        // 보안관련처리로그 기록 여부
        userMap.put("USE_SECURITY_LOG", NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false) ? Consts.YES : Consts.NO);

        // 로그인 관련 정보 기록 처리
        TransactionStatus ts = beginTrans();
        try {
            Map<String, Object> resultMap = dao.callCSUserSysInfoUpdate(params);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return userMap;
    }

    /**
     * 사용자 비밀번호 초기화 처리
     *
     * @param params
     *        조회조건
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public String resetUserPwd(Map<String, Object> params) {

        // 임시 비밀번호
        String newUserPwd = AuthenticationUtil.getRamdomPassword(10);
        params.put("P_USER_PWD", newUserPwd);

        Map<String, Object> resetUserPwdMap = null;

        // 사용자 비밀번호 초기화 정보 검색
        try {
            resetUserPwdMap = dao.getResetUserPwd(params);
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(NexosMessage.getDisplayMsg("JAVA.WC.026", "[비밀번호 초기화 오류]"), e));
        }

        // 메일 발송
        Map<String, Object> callParams = Util.toParameter(resetUserPwdMap);
        String result = commonDAO.sendEmail(callParams);
        if (!Consts.OK.equals(result)) {
            throw new RuntimeException(result);
        }

        // 메일 정상 발송일 경우 사용자 비밀번호 - 임시 비밀번호로 업데이트
        TransactionStatus ts = beginTrans();
        try {
            callParams.clear();
            callParams.put("P_USER_ID", params.get("P_USER_ID"));
            callParams.put("P_USER_PWD", dao.getEncryptHash(newUserPwd));
            callParams.put("P_PWD_LAST_DATE", "");
            callParams.put("P_PWD_ERROR_CNT", 0);

            dao.updateCSUser(callParams);

            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 접속 IP 체크
     *
     * @param params
     * @return String
     */
    private String validateClientIp(Map<String, Object> params) {

        String result = Consts.ERROR;

        TransactionStatus ts = beginTrans();
        try {
            Map<String, Object> resultMap = callProcedure(SP_ID_CS_USER_CLIENT_IP_CHECKING, params);
            String oMsg = (String)resultMap.get(Consts.PK_O_MSG);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 사용자 기본 물류센터, 사업부 체크
     *
     * @param userMap
     * @return String
     */
    private String validateDefaultCode(Map<String, Object> userMap) {

        String centerNm = (String)userMap.get("CENTER_NM");
        String buNm = (String)userMap.get("BU_NM");
        String codeMessage = "";
        // 기본 물류센터가 정상인지 체크
        if (Util.isNull(centerNm)) {
            codeMessage += ", " + NexosMessage.getDisplayMsg("JAVA.WC.027", "기본물류센터");
        }
        // 기본 사업부가 정상인지 체크
        if (Util.isNull(buNm)) {
            codeMessage += ", " + NexosMessage.getDisplayMsg("JAVA.WC.028", "기본사업부");
        }

        if (Util.isNotNull(codeMessage)) {
            codeMessage = codeMessage.substring(2); // ", " 제거
            return NexosMessage.getDisplayMsg("JAVA.WC.029", "[" + codeMessage + "]코드가 정상적으로 지정되지 않았습니다." //
                + "\n\n시스템을 사용하려면 관리자에게 해당 코드 지정을 요청하십시오.", new String[] {codeMessage});
        }

        return Consts.OK;
    }

    /**
     * 시스템 장기 미사용 체크
     *
     * @param userMap
     * @return String
     */
    private String validateDomantUser(Map<String, Object> userMap) {

        String dormantUserLoginYn = (String)userMap.get("DORMANT_USER_LOGIN_YN");
        if (Consts.NO.equals(dormantUserLoginYn)) {
            if (Consts.YES.equals(userMap.get("DORMANT_USER_YN"))) {
                return NexosMessage.getDisplayMsg("JAVA.WC.030", "시스템 장기 미사용[" + Util.toString(userMap.get("DORMANT_MAX_DAY")) //
                    + "일 이상]으로 인해 시스템에 로그인할 수 없습니다.\n\n시스템 재사용을 원하시면 관리자에게 문의하십시오."//
                    , new String[] {Util.toString(userMap.get("DORMANT_MAX_DAY"))});
            }
        }

        return Consts.OK;
    }

    /**
     * 사용자 재직여부 체크
     *
     * @param userMap
     * @return String
     */
    private String validateUserWork(Map<String, Object> userMap) {

        // 1: 재직, 2: 휴직, 3: 퇴직, 미지정일 경우 재직으로 처리
        switch (Util.nullToDefault(userMap.get("USER_WORK_DIV"), "1")) {
            // 휴직
            case "2":
                return NexosMessage.getDisplayMsg("JAVA.WC.031", "사용자가 [휴직]처리되어 시스템에 로그인할 수 없습니다.\n\n시스템 재사용을 원하시면 관리자에게 문의하십시오.");
            // 퇴직
            case "3":
                return NexosMessage.getDisplayMsg("JAVA.WC.032", "사용자가 [퇴직]처리되어 시스템에 로그인할 수 없습니다.\n\n시스템 재사용을 원하시면 관리자에게 문의하십시오.");
        }

        return Consts.OK;
    }

    /**
     * 비밀번호 만료 체크
     *
     * @param userMap
     * @return String
     */
    private String validateUserPasswordExpire(Map<String, Object> userMap) {

        // 비밀번호 사용기한 만료 로그인 불가일 경우
        String expirePwdLoginYn = (String)userMap.get("EXPIRE_PWD_LOGIN_YN");
        if (Consts.NO.equals(expirePwdLoginYn)) {
            // 비밀번호 사용기한 만료로 변경 대상이면 오류 처리
            if (Consts.YES.equals(userMap.get("CHANGE_PWD_YN"))) {
                return NexosMessage.getDisplayMsg("JAVA.WC.033", "비밀번호 사용기한이 초과되어 시스템에 로그인할 수 없습니다.\n\n비밀번호 초기화 후 사용하십시오.");
            }
        }

        return Consts.OK;
    }

    /**
     * 비밀번호 오류건수 체크
     *
     * @param params
     * @param userMap
     * @return String
     */
    private String validateUserPasswordErrorCount(Map<String, Object> params, Map<String, Object> userMap) {

        int pwdErrorMaxCnt = Util.toInt(userMap.get("PWD_ERROR_MAX_CNT"), -1);
        int pwdErrorCnt = Util.toInt(userMap.get("PWD_ERROR_CNT"), 0);

        // 비밀번호 오류 시스템 사용제한일 경우
        if (pwdErrorMaxCnt > -1) {
            if (pwdErrorCnt >= pwdErrorMaxCnt) {
                if (!NexosSupport.getGlobalBooleanProperty("CONFIG.LOGIN.SIMPLE_ERROR_MESSAGE", false)) {
                    return NexosMessage.getDisplayMsg("JAVA.WC.034", "사용자 비밀번호를 [" + pwdErrorCnt + "번] 이상 잘못 입력했습니다." //
                        + "\n비밀번호 입력 오류로 인해 시스템에 로그인할 수 없습니다.\n\n비밀번호 초기화 후 사용하십시오." //
                        , new String[] {Util.toString(pwdErrorCnt)});
                } else {
                    return NexosMessage.getDisplayMsg("JAVA.WC.XXX", "로그인에 실패했습니다.\n\n비밀번호 초기화 후 사용하십시오.");
                }
            }
            // 비밀번호 오류 초기화 체크
            if (dao.getEncryptHash((String)userMap.get("USER_ID")).equals(dao.getEncryptHash((String)userMap.get("USER_PWD")))) {
                userMap.put("ERROR_CHANGE_PWD_YN", Consts.YES);
            } else {
                userMap.put("ERROR_CHANGE_PWD_YN", Consts.NO);
            }
        }

        String userPwd = (String)params.get("P_USER_PWD");
        if (!dao.equalUserPwd(userPwd, (String)userMap.get("USER_PWD"))) {
            // 비밀번호 오류 시스템 사용제한 안함일 경우
            if (pwdErrorMaxCnt == -1) {
                if (!NexosSupport.getGlobalBooleanProperty("CONFIG.LOGIN.SIMPLE_ERROR_MESSAGE", false)) {
                    return NexosMessage.getDisplayMsg("JAVA.WC.006", "사용자 비밀번호가 잘못되었습니다. 비밀번호를 다시 입력하십시오.");
                } else {
                    return NexosMessage.getDisplayMsg("JAVA.WC.XXX", "로그인에 실패했습니다.");
                }
            }

            pwdErrorCnt++;
            // 비밀번호 오류 건수 기록
            TransactionStatus ts = beginTrans();
            try {
                params.put("P_PWD_ERROR_CNT", -1); // 현재 값 + 1 처리를 위해 -1로 넘김
                params.remove("P_USER_PWD");
                dao.updateCSUser(params);

                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                return NexosMessage.getDisplayMsg("JAVA.WC.035", "사용자 비밀번호 오류 기록 중 오류가 발생했습니다.") //
                    + "\n" + Util.getErrorMessage(e);
            }

            if (pwdErrorCnt >= pwdErrorMaxCnt) {
                if (!NexosSupport.getGlobalBooleanProperty("CONFIG.LOGIN.SIMPLE_ERROR_MESSAGE", false)) {
                    return NexosMessage.getDisplayMsg("JAVA.WC.034", "사용자 비밀번호를 [" + pwdErrorCnt + "회] 이상 잘못 입력했습니다." //
                        + "\n비밀번호 입력 오류로 인해 시스템에 로그인할 수 없습니다.\n\n비밀번호 초기화 후 사용하십시오."//
                        , new String[] {Util.toString(pwdErrorCnt)});
                } else {
                    return NexosMessage.getDisplayMsg("JAVA.WC.XXX", "로그인에 실패했습니다.\n\n비밀번호 초기화 후 사용하십시오.");
                }
            }
            if (!NexosSupport.getGlobalBooleanProperty("CONFIG.LOGIN.SIMPLE_ERROR_MESSAGE", false)) {
                return NexosMessage.getDisplayMsg("JAVA.WC.036", "사용자 비밀번호가 잘못되었습니다. 비밀번호를 다시 입력하십시오." //
                    + "\n\n(비밀번호 입력 오류: " + pwdErrorCnt + "회, " + pwdErrorMaxCnt + "회 오류시 시스템 사용 제한)",
                    new String[] {Util.toString(pwdErrorCnt), Util.toString(pwdErrorMaxCnt)});
            } else {
                return NexosMessage.getDisplayMsg("JAVA.WC.XXX", "로그인에 실패했습니다.");
            }
        }

        return Consts.OK;
    }

    /**
     * 사용자 프로그램 메뉴 정보를 리턴
     *
     * @param params
     *        조회조건
     */
    public List<Map<String, Object>> getUserProgramMenu(Map<String, Object> params) {

        // 메뉴정보 가져오기
        List<Map<String, Object>> lstResult = dao.getUserProgramMenu(params);
        return dao.getUserProgramMenuTree(lstResult);
    }

    /**
     * 사용자 즐겨찾기 메뉴 정보를 리턴
     *
     * @param params
     *        조회조건
     */
    public JsonDataSet getUserFavoriteMenu(Map<String, Object> params) {

        return getDataSet(SELECT_ID_GET_CSUSERFAVORITE, params);
    }

    /**
     * sqlmap 리로드
     *
     * @return
     */
    public String reloadSqlMap() {

        return dao.reloadSqlMap();
    }

    /**
     * Java/DB 메시지 다시 읽기
     *
     * @return
     */

    public String reloadDisplayMsg() {

        return dao.reloadDisplayMsg();
    }

    /**
     * Excel 파일 생성 후 생성된 서버의 파일명 리턴
     *
     * @param params
     *        조회조건
     */
    public Map<String, Object> excelExport(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;
        // 임시 테이블 데이터 처리를 위해 트랜젝션 처리
        TransactionStatus ts = beginTrans();
        try {
            resultMap = dao.excelExport(params);
            rollbackTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }

    /**
     * Excel 파일 읽어서 CTCHECKVALUE에 INSERT 후 QUERY 실행하여 결과 리턴
     *
     * @param params
     *        처리 파라메터
     */
    public JsonDataSet excelImport(Map<String, Object> params) throws Exception {

        JsonDataSet resultDataSet;

        TransactionStatus ts = beginTrans();
        try {
            resultDataSet = dao.excelImport(params);
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return resultDataSet;
    }

    /**
     * 사용자 그리드 설정 저장
     *
     * @param params
     *        조회조건
     */
    public String saveUserGridLayout(Map<String, Object> params) {

        String result = Consts.ERROR;

        TransactionStatus ts = beginTrans();
        try {
            dao.saveUserGridLayout(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 데이터 저장 처리
     *
     * @param params
     *        <pre>
     * P_DS_MASTER        : INSERT/UPDATE/DELETE 처리할 데이터셋
     * P_DS_PARAM_NM      : 데이터셋 파라메터명, 지정할 경우 해당 데이터셋으로 처리
     *                      미지정시 P_DS_MASTER로 처리, since 7.5.0
     * P_USER_ID          : 사용자ID
     * P_INSERT_QUERY_ID  : 등록된 Insert sqlmap ID, 지정할 경우 해당 sqlmap으로 처리
     * P_UPDATE_QUERY_ID  : 등록된 Update sqlmap ID, 지정할 경우 해당 sqlmap으로 처리
     * P_DELETE_QUERY_ID  : 등록된 Delete sqlmap ID, 지정할 경우 해당 sqlmap으로 처리
     * P_CRUD_PROGRAM_ID  : 프로그램ID, 프로그램ID/테이블명으로 등록된 sqlmap을 사용할 경우
     * P_CRUD_TABLE_NM    : 테이블명,  프로그램ID/테이블명으로 등록된 sqlmap을 사용할 경우
     * P_USER_ID_PARAM_NM : 사용자ID 입력을 위한 파라메터명, 콤마(,)로 구분하여 입력 가능, P_USER_ID,P_LAST_USER_ID, ...
     *                      미지정시, P_USER_ID로 사용자ID 값 입력
     *                      사용자ID 입력이 불필요할 경우 "X"로 입력, since 7.5.0
     *
     * ※ 데이터의 P_CRUD의 값에 따라 처리, P_CRUD 값에 해당하는 sqlmap이 지정되어 있지 않으면 해당 데이터 처리 안함
     * </pre>
     * @return
     */
    public String saveDataSet(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            ((DaoSupport)dao).saveDataSet(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 액티비티 로그 저장
     *
     * @param params
     * @return
     */
    public String writeActivityLog(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        // TransactionStatus ts = beginTrans();
        try {
            ((DaoSupport)dao).writeActivityLog(params);
            // commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            // rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 비밀번호 생성 규칙 체크
     *
     * @param params
     * @return
     */
    public String validateUserPasswordChangeRules(Map<String, Object> params) {

        Map<String, Object> resultMap = dao.callCSUserPwdChangeRulesCheck(params);
        return Util.getOutMessage(resultMap);
    }

    /**
     * 사용자 비밀번호 변경
     *
     * @param params
     */
    public String changeUserPassword(Map<String, Object> params) {

        String result = Consts.ERROR;

        // 변경 비밀번호 암호화 처리
        params.put("P_ENC_USER_PWD", dao.getEncryptHash((String)params.get("P_NEW_USER_PWD")));

        // 비밀번호 변경 규칙 사용일때만 체크
        if (Consts.YES.equals(params.get("P_USE_PASSWORD_CHANGE_RULES"))) {
            result = validateUserPasswordChangeRules(params);
            if (!Consts.OK.equals(result)) {
                return result;
            }
        }

        TransactionStatus ts = beginTrans();
        try {
            Map<String, Object> resultMap = dao.callCSUserPwdUpdate(params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    @Override
    public void onApplicationEvent(SessionDestroyedEvent event) {
        if (!NexosSupport.getGlobalBooleanProperty("CONFIG.USE_SECURITY_LOG", false)) {
            return;
        }
        List<SecurityContext> contexts = event.getSecurityContexts();
        if (!contexts.isEmpty()) {
            Map<String, Object> activityParams = Util.newMap();
            for (SecurityContext ctx : contexts) {
                SecurityUserDetails securityUser = (SecurityUserDetails)ctx.getAuthentication().getPrincipal();
                if (Consts.YES.equals(securityUser.getDetails("_USER_LOGOUT_YN"))) {
                    continue;
                }
                activityParams.put("P_ACTIVITY_DIV", "02"); // 로그아웃
                activityParams.put("P_ACTIVITY_CD", "세션만료");
                activityParams.put("P_ACTIVITY_COMMENT", //
                    "P_APPLICATION_DIV: " + Util.nullToEmpty(securityUser.getDetails("_LOGIN_APPLICATION_DIV")) + "\n" //
                        + "P_SESSION_ID: " + securityUser.getDetails("_LOGIN_SESSION_ID") //
                );
                activityParams.put("P_USER_ID", securityUser.getDetails("USER_ID"));
                activityParams.put("P_CLIENT_IP", securityUser.getDetails("CLIENT_IP"));
                try {
                    writeActivityLog(activityParams);
                } catch (Exception e) {
                }
            }
        }
    }
}
