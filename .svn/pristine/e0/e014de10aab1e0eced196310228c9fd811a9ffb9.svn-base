/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC05012P0
 *  프로그램명         : 월지입료관리 운행일지 중간마감 팝업
 *  프로그램설명       : 월지입료관리 운행일지 중간마감 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2020-10-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-10-12    ASETEC           신규작성
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
    $("#btnOk").click(onIntermediateClosing);
    $("#btnCancel").click(onCancel);

    var CENTER_CD_F = $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F;
    var ADJUST_MONTH = $NC.G_VAR.G_PARAMETER.P_ADJUST_MONTH;
    var OUTBOUND_DATE = $NC.getDate($NC.G_USERINFO.LOGIN_DATE);

    $NC.setValue("#edtCenter_Cd", CENTER_CD_F);
    $NC.setInitMonthPicker("#mtpAdjust_Month", ADJUST_MONTH);
    $NC.setInitDatePicker("#dtpOutbound_Date", OUTBOUND_DATE);
    $NC.setEnable("#mtpAdjust_Month", false);

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

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

function onIntermediateClosing() {

    var CENTER_CD = $NC.G_VAR.G_PARAMETER.P_CENTER_CD;
    var ADJUST_MONTH = $NC.getValue("#mtpAdjust_Month");
    if ($NC.isNull(ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LDC05012P0.002", "정산월을 선택하십시오."));
        $NC.setFocus("#mtpAdjust_Month");
        return;
    }

    var OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC05012P0.003", "출고일자를 선택하십시오."));
        $NC.setFocus("#dtpOutbound_Date");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC05012P0.004", "운행일지 중간마감을 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LDC05010E0/callIntermediateClosing.do", {
        P_CENTER_CD: CENTER_CD,
        P_ADJUST_MONTH: ADJUST_MONTH + "-01",
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        onClose();
    });
}