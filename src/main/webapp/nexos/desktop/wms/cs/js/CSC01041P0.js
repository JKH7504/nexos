/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01041P0
 *  프로그램명         : 메뉴복사 팝업
 *  프로그램설명       : 메뉴복사 팝업 화면 Javascript
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: 310
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnOk").click(_Save);
    $("#btnCancel").click(onCancel);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtQMenu_Grp_F", $NC.G_VAR.G_PARAMETER.P_MENU_GRP_F);

    // 메뉴그룹 세팅
    $NC.setInitCombo("/CSC01040E0/getDataSet.do", {
        P_QUERY_ID: "CSC01040E0.RS_REF1",
        P_QUERY_PARAMS: null
    }, {
        selector: "#cboMenu_Grp",
        codeField: "MENU_GRP",
        nameField: "MENU_GRP_NM",
        fullNameField: "MENU_GRP_F",
        data: $.extend([], $NC.G_VAR.G_PARAMETER.P_MENU_GRP_DATA),
        onComplete: function(dsResult) {
            $NC.setFocus("#cboMenu_Grp");
        }
    });
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

    var TO_MENU_GRP = $NC.getValue("#cboMenu_Grp");
    if ($NC.isNull(TO_MENU_GRP)) {
        alert($NC.getDisplayMsg("JS.CSC01041P0.002", "대상 메뉴그룹을 선택하십시오."));
        $NC.setFocus("#cboMenu_Grp");
        return;
    }

    if (TO_MENU_GRP == $NC.G_VAR.G_PARAMETER.P_MENU_GRP) {
        alert($NC.getDisplayMsg("JS.CSC01041P0.003", "기준 메뉴그룹과 대상 메뉴그룹가 같습니다.\n다른 메뉴그룹을 선택하십시오."));
        $NC.setFocus("#cboMenu_Grp");
        return;
    }

    $NC.serviceCall("/CSC01040E0/callCSMenuCopy.do", {
        P_MENU_GRP: $NC.G_VAR.G_PARAMETER.P_MENU_GRP,
        P_TO_MENU_GRP: TO_MENU_GRP,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
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

    $NC.setPopupCloseAction($ND.C_OK, {
        TO_MENU_GRP: $NC.getValue("#cboMenu_Grp")
    });
    $NC.onPopupClose();
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
