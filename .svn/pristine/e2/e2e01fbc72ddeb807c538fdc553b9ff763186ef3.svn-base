/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB05021P0
 *  프로그램명         : 출고중량등록 팝업
 *  프로그램설명       : 출고중량등록 팝업 화면 Javascript
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

    $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
    $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
    $("#btnEntrySave").click(_Save); // 저장 버튼

    // 그리드 초기화
    grdDetailInitialize();

    // 신규/삭제/저장 버튼 툴팁 세팅
    $NC.setTooltip("#btnEntryNew", $NC.getDisplayMsg("JS.LOB05021P0.011", "신규"));
    $NC.setTooltip("#btnEntryDelete", $NC.getDisplayMsg("JS.LOB05021P0.012", "삭제"));
    $NC.setTooltip("#btnEntrySave", $NC.getDisplayMsg("JS.LOB05021P0.013", "저장"));
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtItem_Cd", $NC.G_VAR.G_PARAMETER.P_ITEM_CD);
    $NC.setValue("#edtItem_Nm", $NC.G_VAR.G_PARAMETER.P_ITEM_NM);
    $NC.setValue("#edtItem_Spec", $NC.G_VAR.G_PARAMETER.P_ITEM_SPEC);
    $NC.setValue("#edtBrand_Cd", $NC.G_VAR.G_PARAMETER.P_BRAND_CD);
    $NC.setValue("#edtBrand_Nm", $NC.G_VAR.G_PARAMETER.P_BRAND_NM);
    $NC.setValue("#edtConfirm_Qty", $NC.getDisplayNumber($NC.G_VAR.G_PARAMETER.P_CONFIRM_QTY));

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
        CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        OUTBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE,
        OUTBOUND_NO: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_NO,
        LINE_NO: $NC.G_VAR.G_PARAMETER.P_LINE_NO,
        OUTBOUND_STATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_STATE,
        BRAND_CD: $NC.G_VAR.G_PARAMETER.P_BRAND_CD,
        ITEM_CD: $NC.G_VAR.G_PARAMETER.P_ITEM_CD,
        ITEM_NM: $NC.G_VAR.G_PARAMETER.P_ITEM_NM,
        ITEM_SPEC: $NC.G_VAR.G_PARAMETER.P_ITEM_SPEC,
        CONFIRM_QTY: $NC.G_VAR.G_PARAMETER.P_CONFIRM_QTY,
        CRUD: $ND.C_DV_CRUD_R
    };

    // 디테일 데이터 세팅
    var dsDetail = $NC.G_VAR.G_PARAMETER.P_SUB_DS;
    G_GRDDETAIL.data.beginUpdate();
    try {
        var rowData, newRowData;
        for (var rIndex = 0, rCount = dsDetail.length; rIndex < rCount; rIndex++) {
            rowData = dsDetail[rIndex];
            newRowData = {
                ENTRY_QTY: rowData.ENTRY_QTY,
                ITEM_WEIGHT: rowData.ITEM_WEIGHT,
                ENTRY_WEIGHT: rowData.ENTRY_WEIGHT,
                REMARK1: rowData.REMARK1,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_R
            };
            G_GRDDETAIL.data.addItem(newRowData);
        }
    } finally {
        G_GRDDETAIL.data.endUpdate();
    }
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
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

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var ITEM_CD = $NC.getValue("#edtItem_Cd");

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        BU_CD: $NC.G_VAR.masterData.BU_CD,
        OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
        OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
        LINE_NO: $NC.G_VAR.masterData.LINE_NO,
        BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
        ITEM_CD: ITEM_CD,
        ENTRY_QTY: 0,
        ITEM_WEIGHT: 0,
        ENTRY_WEIGHT: 0,
        REMARK1: "",
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDDETAIL, newRowData);
}

/**
 * 저장
 */
function _Save() {

    if (G_GRDDETAIL.data.getItems().length == 0) {
        alert($NC.getDisplayMsg("JS.LOB05021P0.002", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 저장시 전체삭제 후 재등록이기 때문에 등록할 건수가 있을 경우에 수량이 같은지 체크
    if (G_GRDDETAIL.data.getLength() > 0) {
        var CONFIRM_QTY = $NC.toNumber($NC.getValue("#edtConfirm_Qty"));
        var SUM_ENTRY_QTY = $NC.getGridSumVal(G_GRDDETAIL, {
            sumKey: "ENTRY_QTY"
        });
        if (CONFIRM_QTY != SUM_ENTRY_QTY) {
            alert($NC.getDisplayMsg("JS.LOB05021P0.003", "전표의 출고수량만큼 입력되지 않았습니다."));
            return;
        }
    }

    // 전체 삭제 후 재등록 처리하므로 화면에 표시된 데이터 전체를 송신 함
    var dsDetail = [ ];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        dsDetail.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
            P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
            P_LINE_NO: $NC.G_VAR.masterData.LINE_NO,
            P_BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
            P_ITEM_CD: $NC.G_VAR.masterData.ITEM_CD,
            P_ITEM_WEIGHT: rowData.ITEM_WEIGHT,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: $ND.C_CRUD_C
        });
    }

    $NC.serviceCall("/LOB05020E0/save.do", {
        P_DS_MASTER: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
            P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
            P_LINE_NO: $NC.G_VAR.masterData.LINE_NO,
            P_CHECK_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE
        },
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOB05021P0.004", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제, 그외 CRUD를 "D"로 변경
    $NC.deleteGridRowData(G_GRDDETAIL, rowData, true);
}

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_WEIGHT",
        field: "ITEM_WEIGHT",
        name: "등록중량(Kg)",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions({
            formatterType: "FLOAT_WEIGHT",
            isKeyField: true
        }),
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        },
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: null,
        sortCol: "ITEM_WEIGHT",
        gridOptions: options,
        canExportExcel: false,
        onFilter: grdDetailOnFilter
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * 수정데이터일 경우 중량 컬럼은 수정불가.
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "ITEM_WEIGHT":
                return false;
        }
    }
    return true;
}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

    // 신규 추가 후 포커싱
    $NC.setFocusGrid(G_GRDDETAIL, args.row, "ITEM_WEIGHT", true);
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDDETAIL.view.getColumnId(args.cell)) {
        case "ITEM_WEIGHT":
            // 중량 체크
            if (Number(rowData.ITEM_WEIGHT) <= 0) {
                alert($NC.getDisplayMsg("JS.LOB05021P0.005", "상품중량은 0보다 작을 수 없습니다."));
                rowData.ITEM_WEIGHT = args.oldItem.ITEM_WEIGHT;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
            }
            // 중량이 키값이기 때문에 중복 체크
            else {
                if ($NC.getGridSearchRows(G_GRDDETAIL, {
                    searchKey: "ITEM_WEIGHT",
                    searchVal: rowData.ITEM_WEIGHT
                }).length > 1) {
                    alert($NC.getDisplayMsg("JS.LOB05021P0.006", "입력한 상품중량과 동일한 상품중량이 이미 등록되어 있습니다."));
                    rowData.ITEM_WEIGHT = args.oldItem.ITEM_WEIGHT;
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                }
            }
            break;
        case "ENTRY_QTY":
            // 등록수량 체크
            if (Number(rowData.ENTRY_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.LOB05021P0.007", "등록수량은 1보다 작을 수 없습니다."));
                rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
            }
            // 등록수량 합계 체크.
            else {
                var CONFIRM_QTY = $NC.toNumber($NC.getValue("#edtConfirm_Qty"));
                var SUM_ENTRY_QTY = $NC.getGridSumVal(G_GRDDETAIL, {
                    sumKey: "ENTRY_QTY"
                });
                if (CONFIRM_QTY < SUM_ENTRY_QTY) {
                    alert($NC.getDisplayMsg("JS.LOB05021P0.008", "중량 등록수량이 출고수량을 초과할 수 없습니다."));
                    rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                }
            }
            break;
    }

    rowData.ENTRY_WEIGHT = rowData.ITEM_WEIGHT * rowData.ENTRY_QTY;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "ITEM_WEIGHT")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (Number(rowData.ITEM_WEIGHT) <= 0) {
        alert($NC.getDisplayMsg("JS.LOB05021P0.009", "상품중량을 입력하십시오."));
        $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_WEIGHT", true);
        return false;
    }
    if (Number(rowData.ENTRY_QTY) < 1) {
        alert($NC.getDisplayMsg("JS.LOB05021P0.010", "등록수량을 입력하십시오."));
        $NC.setFocusGrid(G_GRDDETAIL, row, "ENTRY_QTY", true);
        return false;
    }

    // 신규 데이터 업데이트, N -> C, 일반 데이터 강제 업데이트
    $NC.setGridApplyPost(G_GRDDETAIL, rowData, true);
    return true;
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

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}
