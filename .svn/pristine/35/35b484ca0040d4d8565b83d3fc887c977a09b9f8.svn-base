/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC05011P0
 *  프로그램명         : 월지입료관리 기초데이터 생성 팝업
 *  프로그램설명       : 월지입료관리 기초데이터 생성 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2020-10-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-10-07    ASETEC           신규작성
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
    $("#btnOk").click(onCreateData);
    $("#btnCancel").click(onCancel);

    var CENTER_CD_F = $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F;
    var ADJUST_MONTH = $NC.G_VAR.G_PARAMETER.P_ADJUST_MONTH;
    var POLICY_CM520 = $NC.G_VAR.G_PARAMETER.P_POLICY_CM520;

    $NC.setValue("#edtCenter_Cd", CENTER_CD_F);
    $NC.setInitMonthPicker("#mtpAdjust_Month", ADJUST_MONTH);
    $NC.setEnable("#mtpAdjust_Month", false);

    // 월지입료 관리정책 : 1-물류센터별 관리
    if (POLICY_CM520 == $ND.C_POLICY_VAL_1) {
        $NC.setVisible("#divQCenter_Cd", true);
        // 월지입료 관리정책 : 2-통합 관리
    } else {
        $NC.setVisible("#divQCenter_Cd", false);
    }

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

function onCreateData() {

    var CENTER_CD = $NC.G_VAR.G_PARAMETER.P_CENTER_CD;
    var ADJUST_MONTH = $NC.getValue("#mtpAdjust_Month");
    if ($NC.isNull(ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LDC05011P0.002", "정산월을 선택하십시오."));
        $NC.setFocus("#mtpAdjust_Month");
        return;
    }
    var RUNNING_CNT = Number($NC.getValue("#edtRunning_Cnt"));
    if ($NC.isNull(RUNNING_CNT) || RUNNING_CNT <= 0) {
        alert($NC.getDisplayMsg("JS.LDC05011P0.003", "운행횟수를 확인하십시오."));
        $NC.setFocus("#edtRunning_Cnt");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC05011P0.004", "기초데이터 생성하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LDC05010E0/callCreateData.do", {
        P_CENTER_CD: CENTER_CD,
        P_ADJUST_MONTH: ADJUST_MONTH + "-01",
        P_RUNNING_CNT: RUNNING_CNT,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        onClose();
    });
}