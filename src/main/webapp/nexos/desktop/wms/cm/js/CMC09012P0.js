﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC09012P0
 *  프로그램명         : 작업일자생성 팝업
 *  프로그램설명       : 작업일자생성 팝업 화면 Javascript
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
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#chkSunDay", $ND.C_YES);

    // 이벤트 연결
    $("#btnOk").click(onWorkDateCreate);
    $("#btnCancel").click(onCancel);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setFocus("#edtTo_Bu_Cd");
}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

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

}

/**
 * 삭제
 */
function _Delete() {

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

function onWorkDateCreate() {

    var HOLIDAY_WEEK = $NC.nullToDefault($NC.getValue("#chkSunDay"), "0") //
        + $NC.nullToDefault($NC.getValue("#chkMonDay"), "0") //
        + $NC.nullToDefault($NC.getValue("#chkTueDay"), "0") //
        + $NC.nullToDefault($NC.getValue("#chkWedDay"), "0") //
        + $NC.nullToDefault($NC.getValue("#chkThuDay"), "0") //
        + $NC.nullToDefault($NC.getValue("#chkFriDay"), "0") //
        + $NC.nullToDefault($NC.getValue("#chkSatDay"), "0");

    $NC.serviceCall("/CMC09010E0/setWorkCalenderCreate.do", {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_INOUT_MONTH: $NC.G_VAR.G_PARAMETER.P_INOUT_MONTH,
        P_HOLIDAY_WEEK: HOLIDAY_WEEK,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        onClose();
    });
}
