/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC02041P0
 *  프로그램명         : 물류센터 차량복사 팝업
 *  프로그램설명       : 물류센터 차량복사 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2020-03-06
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-03-06    ASETEC           신규작성
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: 300
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnCancel").click(onCancel);
    $("#btnCopy").click(_Save);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtQCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtQArea_Cd", $NC.G_VAR.G_PARAMETER.P_AREA_CD);
    $NC.setValue("#edtQArea_Nm", $NC.G_VAR.G_PARAMETER.P_AREA_NM);

    // 조회조건 - 물류센터 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSUSERCENTER",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CENTER_CD: $ND.C_ALL
        }
    }, {
        selector: "#cboTo_Center_Cd",
        codeField: "CENTER_CD",
        nameField: "CENTER_NM",
        onComplete: function() {
            $NC.setValue("#cboTo_Center_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });

    $NC.setFocus("#cboTo_Center_Cd");
}

/**
 * 화면 리사이즈 Offset 계산
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

    $NC.setPopupCloseAction($ND.C_OK, {
        CENTER_CD: $NC.getValue("#cboTo_Center_Cd")
    });
    $NC.onPopupClose();
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

    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);

    var TO_CENTER_CD = $NC.getValue("#cboTo_Center_Cd");
    if ($NC.isNull(TO_CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC02041P0.002", "대상 물류센터를 입력하십시오."));
        $NC.setFocus("#cboTo_Center_Cd");
        return;
    }

    if (TO_CENTER_CD == $NC.G_VAR.G_PARAMETER.P_CENTER_CD) {
        alert($NC.getDisplayMsg("JS.CMC02041P0.003", "기준 물류센터와 대상 물류센터가 같습니다.\n다른 물류센터를 선택하십시오."));
        return;
    }

    $NC.serviceCall("/CMC02040E0/callCarRefCopy.do", {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_AREA_CD: AREA_CD,
        P_TO_CENTER_CD: TO_CENTER_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    onClose();
}
