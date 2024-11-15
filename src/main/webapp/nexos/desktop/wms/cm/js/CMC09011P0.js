/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC09011P0
 *  프로그램명         : 작업일자복사 팝업
 *  프로그램설명       : 작업일자복사 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-13
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2016-12-13    ASETEC           신규작성
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

    // 이벤트 연결
    $("#btnTo_Bu_Cd").click(showBuPopup);
    $("#btnOk").click(onWorkDateCopy);
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

function onWorkDateCopy() {

    var TO_BU_CD = $NC.getValue("#edtTo_Bu_Cd");
    if ($NC.isNull(TO_BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC09011P0.002", "복사대상 사업부를 입력하십시오."));
        $NC.setFocus("#edtTo_Bu_Cd");
        return;
    }

    $NC.serviceCall("/CMC09010E0/setWorkCalenderCopy.do", {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_INOUT_MONTH: $NC.G_VAR.G_PARAMETER.P_INOUT_MONTH,
        P_TO_BU_CD: TO_BU_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        onClose();
    });
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "TO_BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
    }
}

/**
 * 사업부 검색 이미지 클릭
 */
function showBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtTo_Bu_Cd", true);
    });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtTo_Bu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtTo_Bu_Nm", resultInfo.BU_NM);
    } else {
        $NC.setValue("#edtTo_Bu_Cd");
        $NC.setValue("#edtTo_Bu_Nm");
        $NC.setFocus("#edtTo_Bu_Cd", true);
    }
}
