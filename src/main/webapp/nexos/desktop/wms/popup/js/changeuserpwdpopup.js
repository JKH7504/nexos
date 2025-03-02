﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : changeuserpwdpopup
 *  프로그램명         : 사용자비밀번호변경 팝업
 *  프로그램설명       : 사용자비밀번호변경 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2016-12-14    ASETEC           신규작성
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 * 
 *  ==================================================================================================================================================
 * </pre>
 */

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

    // 단위화면에서 사용될 일반 전역 변수 정의
    $NC.setGlobalVar({
        autoResizeView: {
            container: "#ctrPopupView"
        },
        // 체크할 정책 값
        policyVal: {
            CS111: "", // 사용자 비밀번호 최소 입력 길이
            CS112: "", // 사용자 비밀번호 문자조합 기준
            CS113: "", // 사용자 비밀번호 연속문자 사용 기준
            CS114: "", // 사용자 비밀번호 반복문자 사용 기준
            CS115: "", // 사용자 비밀번호 재사용 기준
            CS116: "" // 사용자 비밀번호 금칙어 적용 기준
        }
    });

    // 전역 정책 값 세팅
    setPolicyValInfo();

    // 버튼 클릭 이벤트 연결
    $("#btnOk").click(_Save);
    $("#btnCancel").click(onCancel);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    if ($NC.G_USERINFO.USE_PASSWORD_CHANGE_RULES == $ND.C_YES) {
        var rules = "비밀번호 변경 규칙<br>";
        // 사용자 비밀번호 최소 입력 길이
        if ($NC.G_VAR.policyVal.CS111 != "-1") {
            rules += "최소길이: " + $NC.G_VAR.policyVal.CS111 + "자 이상<br>";
        }
        // 사용자 비밀번호 문자조합 기준
        if ($NC.G_VAR.policyVal.CS112 != "-1") {
            rules += "문자조합: 영문, 숫자, 특수문자 " + $NC.G_VAR.policyVal.CS112 + "가지 이상 조합<br>";
        }
        // 사용자 비밀번호 연속문자 사용 기준
        if ($NC.G_VAR.policyVal.CS113 != "-1") {
            rules += "연속문자: " + $NC.G_VAR.policyVal.CS113 + "자 이상 연속 불가(abc, 123)<br>";
        }
        // 사용자 비밀번호 반복문자 사용 기준
        if ($NC.G_VAR.policyVal.CS114 != "-1") {
            rules += "반복문자: " + $NC.G_VAR.policyVal.CS114 + "자 이상 반복 불가(aaa, 111)<br>";
        }
        // 사용자 비밀번호 재사용 기준
        if ($NC.G_VAR.policyVal.CS115 != "-1") {
            rules += "재 사 용: 직전 비밀번호 " + $NC.G_VAR.policyVal.CS115 + "개 사용 불가<br>";
        }
        // 사용자 비밀번호 금칙어 적용 기준
        if ($NC.G_VAR.policyVal.CS116 != "-1") {
            rules += "기　　타: 사용자ID, 금칙어 포함 불가<br>";
        }
        $("#lblChangePwdRules").html(rules);
        if ($NC.G_MAIN.location.href.endsWith("/nexos/html/mobile/")) {
            $("#ctrChangePwdRules").height(152);
        }
        $NC.setVisible("#ctrChangePwdRules");
    } else {
        $NC.setVisible("#ctrChangePwdRules", false);
    }

    // 비밀번호 변경규칙에 의한 비밀번호 변경 대상
    // 비밀번호 오류에 의한 비밀번호 변경 대상
    if ($NC.G_USERINFO.CHANGE_PWD_YN == $ND.C_YES //
        || $NC.G_USERINFO.ERROR_CHANGE_PWD_YN == $ND.C_YES) {
        // 관리자 비밀번호 변경시 마지막 변경일자 초기화(NULL)
        if ($NC.G_USERINFO.ERROR_CHANGE_PWD_YN == $ND.C_YES //
            || $NC.isNull($NC.G_USERINFO.PWD_LAST_DATE)) {
            $("#lblChangePwdComments").html("[시스템, 관리자]에 의해 초기화된 비밀번호로 시스템에 로그인할 수 없습니다.<br>규칙에 맞게 비밀번호 변경 후 사용하십시오.");
        } else {
            $("#lblChangePwdComments").html("현재 비밀번호의 사용기한[" + $NC.G_USERINFO.CHANGE_PWD_CYCLE + "일]이 만료되었습니다.<br>비밀번호를 변경해야 시스템에 로그인할 수 있습니다.");
        }
        $NC.G_JWINDOW.set("draggable", false);
        $NC.G_JWINDOW.getDomNodes().closeButton.hide();
        $NC.G_JWINDOW.getDomNodes().refreshButton.css("right", "0");
        $NC.G_JWINDOW.getDomNodes().subTitle.css("right", "30px");

        $($NC.getChildIFrame($NC.G_JWINDOW)).parents(".jWindow-modalBackground:first").css("background-color", "#fff");
    }
    // 비밀번호 사용기한 만료 알림
    else if ($NC.G_USERINFO.CHANGE_PWD_ALERT_YN == $ND.C_YES) {
        $("#lblChangePwdComments").html("현재 사용중인 비밀번호가 [" + $NC.G_USERINFO.CHANGE_PWD_DATE + "]에 만료됩니다.<br>사용기한 만료 전 비밀번호를 변경하십시오.");
    }
    // 기타
    else {
        $("#lblChangePwdComments").html("사용자 비밀번호 변경시 로그아웃 처리됩니다.");
    }
    $("#ctrChangePwdRules").css("top", $("#edtUser_Id").offset().top);

    $NC.setValue("#edtUser_Id", $NC.G_USERINFO.USER_ID);
    $NC.setValue("#edtUser_Nm", $NC.G_USERINFO.USER_NM);

    $NC.setFocus("#edtUser_Pwd");
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_OK);
    $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

}

/**
 * 저장
 */
function _Save() {

    var USER_PWD = $NC.getValue("#edtUser_Pwd");
    if ($NC.isNull(USER_PWD)) {
        alert($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.001", "현재 비밀번호를 입력하십시오."));
        $NC.setFocus("#edtUser_Pwd");
        return;
    }

    var SAVED_USER_PWD = $NC.G_USERINFO.USER_PWD;
    if (SAVED_USER_PWD.startsWith("ENC(") && SAVED_USER_PWD.endsWith(")")) {
        var objSHA = new jsSHA(USER_PWD, "TEXT");
        var ENC_USER_PWD = "ENC(" + objSHA.getHash("SHA-512", "HEX") + ")";
        if (SAVED_USER_PWD != ENC_USER_PWD) {
            alert($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.002", "현재 비밀번호가 잘못되었습니다.\n\n다시 입력하십시오."));
            $NC.setFocus("#edtUser_Pwd");
            return;
        }
    } else {
        if (USER_PWD != $NC.G_USERINFO.USER_PWD) {
            alert($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.002", "현재 비밀번호가 잘못되었습니다.\n\n다시 입력하십시오."));
            $NC.setFocus("#edtUser_Pwd");
            return;
        }
    }

    var NEW_USER_PWD1 = $NC.getValue("#edtNew_User_Pwd1");
    if ($NC.isNull(NEW_USER_PWD1)) {
        alert($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.003", "변경 비밀번호를 입력하십시오."));
        $NC.setFocus("#edtNew_User_Pwd1");
        return;
    }
    if (USER_PWD == NEW_USER_PWD1) {
        alert($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.004", "현재 비밀번호와 변경 비밀번호가 같습니다.\n\n다시 입력하십시오."));
        $NC.setFocus("#edtNew_User_Pwd1");
        return;
    }
    // 비밀번호오류 시스템 사용제한일 경우는 사용자ID와 비밀번호를 동일하게 지정 불가, 초기화시 사용자ID == 비밀번호 처리 함
    if ($NC.G_USERINFO.PWD_ERROR_MAX_CNT != -1 && $NC.G_USERINFO.USER_ID == NEW_USER_PWD1) {
        alert($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.005", "사용자ID와 비밀번호를 동일하게 지정할 수 없습니다.\n\n다시 입력하십시오."));
        $NC.setFocus("#edtNew_User_Pwd1");
        return;
    }
    var NEW_USER_PWD2 = $NC.getValue("#edtNew_User_Pwd2");
    if ($NC.isNull(NEW_USER_PWD1)) {
        alert($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.006", "확인 비밀번호를 입력하십시오."));
        $NC.setFocus("#edtNew_User_Pwd2");
        return;
    }
    if (NEW_USER_PWD1 != NEW_USER_PWD2) {
        alert($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.007", "변경 비밀번호와 확인 비밀번호가 다릅니다.\n\n다시 입력하십시오."));
        $NC.setFocus("#edtNew_User_Pwd2");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CHANGEUSERPWDPOPUP.008", "비밀번호를 변경하시겠습니까?\n\n비밀번호 변경시 로그아웃 처리됩니다."))) {
        return;
    }

    if ($.isFunction($NC.G_VAR.G_PARAMETER.P_ENC_PAYLOAD)) {
        $NC.serviceCall("/WC/changeUserPasswordEnc.do", $NC.G_VAR.G_PARAMETER.P_ENC_PAYLOAD({
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_ORG_USER_PWD: USER_PWD,
            P_NEW_USER_PWD: NEW_USER_PWD1,
            P_USE_PASSWORD_CHANGE_RULES: $NC.G_USERINFO.USE_PASSWORD_CHANGE_RULES
        }), onSave);
    } else {
        $NC.serviceCall("/WC/changeUserPassword.do", {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_ORG_USER_PWD: USER_PWD,
            P_NEW_USER_PWD: NEW_USER_PWD1,
            P_USE_PASSWORD_CHANGE_RULES: $NC.G_USERINFO.USE_PASSWORD_CHANGE_RULES
        }, onSave);
    }
}

/**
 * 삭제
 */
function _Delete() {

}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    // serviceCallWait 호출을 위해 공통 Function으로 호출하지 않음
    var arrPolicyCd = [ ];
    for ( var POLICY_CD in $NC.G_VAR.policyVal) {
        $NC.G_VAR.policyVal[POLICY_CD] = "";
        arrPolicyCd.push(POLICY_CD);
    }

    // 데이터 조회, 동기화
    $NC.serviceCallAndWait("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.GET_POLICY_VAL",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $ND.C_NULL,
            P_BU_CD: $ND.C_NULL,
            P_POLICY_CD: arrPolicyCd.join($ND.C_SEP_DATA)
        }
    }, function(ajaxData) {
        var dsResult = $NC.toArray(ajaxData);
        if ($NC.isNotNull(dsResult)) {
            var rowData;
            for (var rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
                rowData = dsResult[rIndex];
                $NC.G_VAR.policyVal[rowData.POLICY_CD] = rowData.POLICY_VAL || "";
            }
        }
    });
}
