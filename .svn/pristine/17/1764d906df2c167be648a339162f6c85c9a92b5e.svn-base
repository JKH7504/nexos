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
        detailData: null
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼

    // 그리드 초기화
    grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    // 마스터 데이터 세팅
    $NC.setValue("#edtItem_Cd", $NC.G_VAR.G_PARAMETER.P_ITEM_CD);
    $NC.setValue("#edtItem_Nm", $NC.G_VAR.G_PARAMETER.P_ITEM_NM);
    $NC.setValue("#edtItem_Spec", $NC.G_VAR.G_PARAMETER.P_ITEM_SPEC);
    $NC.setValue("#edtItem_State", $NC.G_VAR.G_PARAMETER.P_ITEM_STATE);
    $NC.setValue("#edtValid_Date", $NC.G_VAR.G_PARAMETER.P_VALID_DATE);
    $NC.setValue("#edtBatch_No", $NC.G_VAR.G_PARAMETER.P_BATCH_NO);

    // 디테일 데이터 세팅
    $NC.G_VAR.detailData = {
        CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        BRAND_CD: $NC.G_VAR.G_PARAMETER.P_BRAND_CD,
        ITEM_CD: $NC.G_VAR.G_PARAMETER.P_ITEM_CD,
        ITEM_STATE: $NC.G_VAR.G_PARAMETER.P_ITEM_STATE,
        ITEM_LOT: $NC.G_VAR.G_PARAMETER.P_ITEM_LOT,
        BATCH_NO: $NC.G_VAR.G_PARAMETER.P_BATCH_NO,
        VALID_DATE: $NC.G_VAR.G_PARAMETER.P_VALID_DATE
    };

    _Inquiry();
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
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 조회
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);

    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: $NC.G_VAR.detailData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.detailData.BU_CD,
        P_BRAND_CD: $NC.G_VAR.detailData.BRAND_CD,
        P_ITEM_CD: $NC.G_VAR.detailData.ITEM_CD,
        P_ITEM_STATE: $NC.G_VAR.detailData.ITEM_STATE,
        P_ITEM_LOT: $NC.G_VAR.detailData.ITEM_LOT,
        P_BATCH_NO: $NC.G_VAR.detailData.BATCH_NO,
        P_VALID_DATE: $NC.G_VAR.detailData.VALID_DATE
    };
    // 데이터 조회
    $NC.serviceCall("/LSC05010Q0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
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
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_ID",
        field: "STOCK_ID",
        name: "재고ID"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LSC05010Q0.RS_DETAIL",
        sortCol: "OUTBOUND_DATE",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

}

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
    $NC.setInitGridAfterOpen(G_GRDDETAIL, null, true);
}