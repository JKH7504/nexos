/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB08021P1
 *  프로그램명         : 일반출고 택배사 배송조회 팝업
 *  프로그램설명       : 일반출고 택배사 배송조회 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-04-01
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-04-01    ASETEC           신규작성
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
            container: "#divMasterView",
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onClose); // 닫기 버튼
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCarrier_Cd", $NC.G_VAR.G_PARAMETER.P_CARRIER_CD);
    $NC.setValue("#edtCarrier_Nm", $NC.G_VAR.G_PARAMETER.P_CARRIER_NM);
    $NC.setValue("#edtWb_No", $NC.G_VAR.G_PARAMETER.P_WB_NO);

    var hdcUrl = null;
    // 택배사구분 -> 01 - CJ대한통운, 02 - 롯데택배, 03 - 우체국택배, 04 - 한덱스
    switch ($NC.G_VAR.G_PARAMETER.P_HDC_DIV) {
        // CJ대한통운
        case "01":
            hdcUrl = "https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=" //
                + $NC.G_VAR.G_PARAMETER.P_WB_NO;
            break;
        // 우체국택배
        case "03":
            hdcUrl = "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?displayHeader=N&sid1=" //
                + $NC.G_VAR.G_PARAMETER.P_WB_NO;
            break;
        // 롯데택배
        case "02":
            hdcUrl = "https://www.lotteglogis.com/open/tracking?invno=" //
                + $NC.G_VAR.G_PARAMETER.P_WB_NO;
            break;
    }

    if ($NC.isNull(hdcUrl)) {
        return;
    }

    $("#ifmWBDelivery").attr("src", hdcUrl);
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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}
