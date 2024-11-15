/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC01021P0
 *  프로그램명         : 배차현황 상세내역 팝업
 *  프로그램설명       : 배차현황 상세내역 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-11-20
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-11-20    ASETEC           신규작성
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
            container: "#divDetailView",
            grids: [
                "#grdDetail"
            ],
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        },
        // 마스터 데이터
        masterData: null
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onClose); // 닫기버튼

    // 그리드 초기화
    grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtArea_Cd", $NC.G_VAR.G_PARAMETER.P_AREA_CD);
    $NC.setValue("#edtArea_Nm", $NC.G_VAR.G_PARAMETER.P_AREA_NM);
    $NC.setValue("#edtRDelivery_Cd", $NC.G_VAR.G_PARAMETER.P_RDELIVERY_CD);
    $NC.setValue("#edtRDelivery_Nm", $NC.G_VAR.G_PARAMETER.P_RDELIVERY_NM);
    $NC.setValue("#edtCar_Div_D", $NC.G_VAR.G_PARAMETER.P_CAR_DIV_D);
    $NC.setValue("#edtCar_Nm", $NC.G_VAR.G_PARAMETER.P_CAR_NM);
    $NC.setValue("#edtDriver_Nm", $NC.G_VAR.G_PARAMETER.P_DRIVER_NM);
    $NC.setValue("#edtDriver_Hp", $NC.G_VAR.G_PARAMETER.P_DRIVER_HP);

    $NC.setInitGridVar(G_GRDDETAIL);

    // 파라메터 세팅
    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_OUTBOUND_DATE1: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE2,
        P_AREA_CD: $NC.G_VAR.G_PARAMETER.P_AREA_CD,
        P_RDELIVERY_CD: $NC.G_VAR.G_PARAMETER.P_RDELIVERY_CD,
        P_CAR_CD: $NC.G_VAR.G_PARAMETER.P_CAR_CD,
        P_POLICY_CM510: $NC.G_VAR.G_PARAMETER.P_POLICY_CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
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

}

/**
 * 삭제
 */
function _Delete() {

}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "수불일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NO",
        field: "INOUT_NO",
        name: "입출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "거래구분"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_F",
        field: "KEEP_DIV_F",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LDC01020Q0.RS_T2_DETAIL",
        sortCol: "INOUT_DATE",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL);
}
