/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC04021P0
 *  프로그램명         : 사업부정책복사 팝업
 *  프로그램설명       : 사업부정책복사 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-09-15
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-09-15    ASETEC           신규작성
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
    $("#btnFrom_Bu_Cd").click(showUserFromBuPopup);
    $("#btnBu_Cd").click(showUserBuPopup);
    $("#btnCancel").click(onCancel);
    $("#btnCopy").click(_Save);

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {
    $NC.setValue("#edtFrom_Bu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtFrom_Bu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);
    $NC.setFocus("#edtBu_Cd");
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

    var FROM_BU_CD = $NC.getValue("#edtFrom_Bu_Cd");
    if ($NC.isNull(FROM_BU_CD)) {
        alert($NC.getDisplayMsg("JS.CSC04021P0.002", "기준 사업부를 입력하십시오."));
        $NC.setFocus("#edtFrom_Bu_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CSC04021P0.003", "대상 사업부를 입력하십시오."));
        $NC.setFocus("#edtBu_Cd");
        return;
    }

    if (FROM_BU_CD == BU_CD) {
        alert($NC.getDisplayMsg("JS.CSC04021P0.004", "동일 사업부로 사업부정책을 복사할 수 없습니다. \n다시 입력하십시오."));
        $NC.setFocus("#edtBu_Cd");
        return;
    }
    var CENTER_COPY_YN = $NC.getValue("#chkCenter_Copy_Yn");
    $NC.serviceCall("/CSC04020E0/callBuPolicyCopy.do", {
        P_FROM_BU_CD: FROM_BU_CD,
        P_BU_CD: BU_CD,
        P_CENTER_COPY_YN: CENTER_COPY_YN,
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
        case "FROM_BU_CD":
            $NP.onUserBuChange(args.val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: args.val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserFromBuPopup);
            return;
        case "BU_CD":
            $NP.onUserBuChange(args.val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: args.val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
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

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserFromBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onUserFromBuPopup, function() {
        $NC.setFocus("#edtFrom_Bu_Cd", true);
    });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserFromBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtFrom_Bu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtFrom_Bu_Nm", resultInfo.BU_NM);
    } else {
        $NC.setValue("#edtFrom_Bu_Cd");
        $NC.setValue("#edtFrom_Bu_Nm");
        $NC.setFocus("#edtFrom_Bu_Cd", true);
    }
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtBu_Cd", true);
    });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtBu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtBu_Nm", resultInfo.BU_NM);
    } else {
        $NC.setValue("#edtBu_Cd");
        $NC.setValue("#edtBu_Nm");
        $NC.setFocus("#edtBu_Cd", true);
    }
}