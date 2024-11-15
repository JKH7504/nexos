/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB02012P0
 *  프로그램명         : 택배라벨출력 팝업
 *  프로그램설명       : 택배라벨출력 팝업 화면 Javascript
 *                       출력매수 입력가능
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-04-22
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-04-22    ASETEC           신규작성
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
        // 마스터 데이터
        masterData: null
    });

    $NC.setEnable("#edtCenter_Cd", false);
    $NC.setEnable("#edtCenter_Nm", false);
    $NC.setEnable("#edtBu_Cd", false);
    $NC.setEnable("#edtBu_Nm", false);
    $NC.setEnable("#dtpOutbound_Date", false);
    $NC.setEnable("#edtDelivery_Nm", false);
    $NC.setEnable("#dtpBu_Date", false);
    $NC.setEnable("#edtBu_No", false);

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel);
    $("#btnConfirm").click(onClose);

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCenter_Cd", $NC.G_VAR.G_PARAMETER.P_CENTER_CD);
    $NC.setValue("#edtCenter_Nm", $NC.G_VAR.G_PARAMETER.P_CENTER_NM);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);
    $NC.setValue("#dtpOutbound_Date", $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE);
    $NC.setValue("#edtDelivery_Nm", $NC.G_VAR.G_PARAMETER.P_DELIVERY_NM);
    $NC.setValue("#dtpBu_Date", $NC.G_VAR.G_PARAMETER.P_BU_DATE);
    $NC.setValue("#edtBu_No", $NC.G_VAR.G_PARAMETER.P_BU_NO);
    $NC.setFocus("#edtPrint_Cnt");

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

    var printCnt = $NC.getValue("#edtPrint_Cnt");
    if ($NC.isNull(printCnt)) {
        alert($NC.getDisplayMsg("JS.LOB02012P0.002", "출력매수를 입력하십시오."));
        $NC.setFocus("#edtPrint_Cnt");
        return;
    }
    $NC.setPopupCloseAction($ND.C_OK, printCnt);
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

}

/**
 * 삭제
 */
function _Delete() {

}
