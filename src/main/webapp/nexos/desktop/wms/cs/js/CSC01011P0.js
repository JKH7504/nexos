﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01011P0
 *  프로그램명         : 사용자복사 팝업
 *  프로그램설명       : 사용자복사 팝업 화면 Javascript
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
            viewFixed: 280
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnFrom_User_Id").click(showUserPopup);
    $("#btnCancel").click(onCancel);
    $("#btnCopy").click(_Save);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtFrom_User_Id", $NC.G_VAR.G_PARAMETER.P_USER_ID);
    $NC.setValue("#edtFrom_User_Nm", $NC.G_VAR.G_PARAMETER.P_USER_NM);

    $NC.setFocus("#edtUser_Id");
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

    $NC.setPopupCloseAction($ND.C_OK);
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

    var USER_ID = $NC.getValue("#edtUser_Id");
    if ($NC.isNull(USER_ID)) {
        alert($NC.getDisplayMsg("JS.CSC01011P0.001", "사용자ID를 입력하십시오."));
        $NC.setFocus("#edtUser_Id");
        return;
    }

    var USER_NM = $NC.getValue("#edtUser_Nm");
    if ($NC.isNull(USER_NM)) {
        alert($NC.getDisplayMsg("JS.CSC01011P0.002", "사용자명을 입력하십시오."));
        $NC.setFocus("#edtUser_Nm");
        return;
    }

    var USER_PWD = $NC.getValue("#edtUser_Pwd");
    if ($NC.isNull(USER_PWD)) {
        alert($NC.getDisplayMsg("JS.CSC01011P0.003", "비밀번호를 입력하십시오."));
        $NC.setFocus("#edtUser_Pwd");
        return;
    }

    var FROM_USER_ID = $NC.getValue("#edtFrom_User_Id");
    if ($NC.isNull(FROM_USER_ID)) {
        alert($NC.getDisplayMsg("JS.CSC01011P0.004", "복사대상 사용자를 선택하십시오."));
        $NC.setFocus("#edtFrom_User_Id");
        return;
    }

    $NC.serviceCall("/CSC01010E0/callUserCopy.do", {
        P_USER_ID: USER_ID,
        P_USER_NM: USER_NM,
        P_USER_PWD: USER_PWD,
        P_FROM_USER_ID: FROM_USER_ID,
        P_EMPLOYEE_ID: $NC.getValue("#edtEmployee_Id"),
        P_USER_HP: $NC.getValue("#edtUser_Hp"),
        P_USER_EMAIL: $NC.getValue("#edtUser_Email"),
        P_ENTRY_COMMENT: $NC.getValue("#edtEntry_Comment"),
        P_REG_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

    var id = view.prop("id").substr(3).toUpperCase();
    grdMasterOnCellChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * 사용자정보 데이터 변경 시.
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

    switch (args.col) {
        case "FROM_USER_ID":
            $NP.onUserChange(args.val, {
                P_USER_ID: args.val,
                P_CERTIFY_DIV: $ND.C_ALL
            }, onUserPopup);
            break;
    }
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    onClose();
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    $NC.setFocus("#edtUser_Id");
}

/**
 * 사용자 검색 이미지 클릭
 */
function showUserPopup() {

    $NP.showUserPopup({
        P_USER_ID: $ND.C_ALL,
        P_CERTIFY_DIV: $ND.C_ALL
    }, onUserPopup, function() {
        $NC.setFocus("#edtFrom_User_Id", true);
    });
}

/**
 * 사용자 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtFrom_User_Id", resultInfo.USER_ID);
        $NC.setValue("#edtFrom_User_Nm", resultInfo.USER_NM);
    } else {
        $NC.setValue("#edtFrom_User_Id");
        $NC.setValue("#edtFrom_User_Nm");
        $NC.setFocus("#edtFrom_User_Id", true);
    }
}
