﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOM02012P0
 *  프로그램명         : 주문구성선택 팝업
 *  프로그램설명       : 주문구성선택 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-06-02
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-06-02    ASETEC           신규작성
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
            container: "#ctrPopupView",
            grids: [
                "#grdMaster"
            ]
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    $("#btnItemSelect").click(onClose); // 선택버튼
    $("#btnClose").click(onCancel); // 닫기버튼
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_OUTBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE,
        P_STATE_PRE_YN: $NC.G_VAR.G_PARAMETER.P_STATE_PRE_YN,
        P_STATE_CUR_YN: $NC.G_VAR.G_PARAMETER.P_STATE_CUR_YN,
        P_INOUT_CD: $NC.G_VAR.G_PARAMETER.P_INOUT_CD,
        P_BU_NO: $NC.G_VAR.G_PARAMETER.P_BU_NO,
        P_SO_NO: $NC.G_VAR.G_PARAMETER.P_SO_NO,
        P_BRAND_CD: $NC.G_VAR.G_PARAMETER.P_BRAND_CD,
        P_ITEM_CD: $NC.G_VAR.G_PARAMETER.P_ITEM_CD,
        P_ITEM_NM: $NC.G_VAR.G_PARAMETER.P_ITEM_NM,
        P_OUTBOUND_BATCH: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_BATCH,
        P_DELIVERY_CD: $NC.G_VAR.G_PARAMETER.P_DELIVERY_CD,
        P_ORDERER_NM: $NC.G_VAR.G_PARAMETER.P_ORDERER_NM,
        P_SHIPPER_NM: $NC.G_VAR.G_PARAMETER.P_SHIPPER_NM,
        P_CAR_DIV: $NC.G_VAR.G_PARAMETER.P_CAR_DIV,
        P_ITEM_CNT_DIV: $NC.G_VAR.G_PARAMETER.P_ITEM_CNT_DIV,
        P_ITEM_CNT1: $NC.G_VAR.G_PARAMETER.P_ITEM_CNT1,
        P_ITEM_CNT2: $NC.G_VAR.G_PARAMETER.P_ITEM_CNT2,
        P_TOT_ITEM_QTY1: $NC.G_VAR.G_PARAMETER.P_TOT_ITEM_QTY1,
        P_TOT_ITEM_QTY2: $NC.G_VAR.G_PARAMETER.P_TOT_ITEM_QTY2
    };
    // 데이터 조회
    $NC.serviceCall("/LOM02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOM02012P0.XXX", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsMaster = [];
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var rowData, rIndex, rCount;
    var dsTarget = G_GRDMASTER.data.getItems();
    for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        dsMaster.push(rowData);
    }

    $NC.setPopupCloseAction($ND.C_OK, dsMaster);
    $NC.onPopupClose();
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "LIST_ITEM_CD",
        field: "LIST_ITEM_CD",
        name: "상품코드리스트",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "LIST_ITEM_NM",
        field: "LIST_ITEM_NM",
        name: "상품명리스트"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CNT",
        field: "ITEM_CNT",
        name: "상품수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_CNT",
        field: "ORDER_CNT",
        name: "전표수",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 2,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOM02010E0.RS_T2_SUB1",
        sortCol: "LIST_ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

function grdMasterOnClick(e, args) {

    var columnId = G_GRDMASTER.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTER, e, args);
            break;
    }
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 *        event object
 * @param view
 *        대상 Object
 * @param args
 *        grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

    var grdObject = $NC.getGridObject(args.grid);
    if (!grdObject.isValid) {
        return;
    }

    var columnId = grdObject.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);
}
