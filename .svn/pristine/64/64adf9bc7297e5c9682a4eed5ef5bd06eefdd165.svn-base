/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC01011P0
 *  프로그램명         : 전표분할등록 팝업
 *  프로그램설명       : 전표분할등록 팝업 화면 Javascript
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
                container: "#divRightView",
                grids: "#grdDetail"
            },
            viewType: "h",
            viewFixed: 320
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
    $NC.setTooltip("#btnEntryNew", $NC.getDisplayMsg("JS.LDC01011P0.002", "신규"));
    $NC.setTooltip("#btnEntryDelete", $NC.getDisplayMsg("JS.LDC01011P0.003", "삭제"));
    $NC.setTooltip("#btnEntrySave", $NC.getDisplayMsg("JS.LDC01011P0.004", "저장"));
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtOutbound_No", $NC.G_VAR.G_PARAMETER.P_OUTBOUND_NO);
    $NC.setValue("#edtLine_No", $NC.G_VAR.G_PARAMETER.P_LINE_NO);
    $NC.setValue("#edtItem_Cd", $NC.G_VAR.G_PARAMETER.P_ITEM_CD);
    $NC.setValue("#edtItem_Nm", $NC.G_VAR.G_PARAMETER.P_ITEM_NM);
    $NC.setValue("#edtItem_Spec", $NC.G_VAR.G_PARAMETER.P_ITEM_SPEC);
    $NC.setValue("#edtEntry_Qty", $NC.G_VAR.G_PARAMETER.P_ENTRY_QTY);
    $NC.setValue("#edtTotal_Entry_Qty", "0");

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
        CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        OUTBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE,
        OUTBOUND_NO: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_NO,
        LINE_NO: $NC.G_VAR.G_PARAMETER.P_LINE_NO,
        ITEM_CD: $NC.G_VAR.G_PARAMETER.P_ITEM_CD,
        ENTRY_QTY: $NC.G_VAR.G_PARAMETER.P_ENTRY_QTY,
        CRUD: $ND.C_DV_CRUD_R
    };

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

    if (Number($NC.getValue("#edtEntry_Qty")) <= $NC.getGridSumVal(G_GRDDETAIL, {
        sumKey: "ENTRY_QTY"
    })) {
        alert($NC.getDisplayMsg("JS.LDC01011P0.005", "이미 등록수량만큼 분할되어 있습니다."));
        $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, "ENTRY_QTY", true);
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        BU_CD: $NC.G_VAR.masterData.BU_CD,
        OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
        OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
        LINE_NO: $NC.G_VAR.masterData.LINE_NO,
        ENTRY_QTY: 1,
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

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC01011P0.006", "전표 분할 후 저장하십시오."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    if (Number($NC.getValue("#edtEntry_Qty")) == $NC.getGridSumVal(G_GRDDETAIL, {
        sumKey: "ENTRY_QTY"
    })) {
        alert($NC.getDisplayMsg("JS.LDC01011P0.007", "분할수량이 등록수량과 동일합니다.\n\n분할수량합계가 등록수량보다 작아야 처리가 됩니다."));
        $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, "ENTRY_QTY", true);
        return;
    }

    var dsDetail = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        dsDetail.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
            P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
            P_LINE_NO: $NC.G_VAR.masterData.LINE_NO,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_CRUD: rowData.CRUD
        });
    }

    $NC.serviceCall("/LDC01010E0/saveSplitOrder.do", {
        P_DS_MASTER: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.LDC01011P0.008", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    $NC.deleteGridRowData(G_GRDDETAIL, rowData);

    $NC.setValue("#edtTotal_Entry_Qty", $NC.getGridSumVal(G_GRDDETAIL, {
        sumKey: "ENTRY_QTY"
    }));
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "분할수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: null,
        sortCol: "ITEM_CD",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

    $NC.setValue("#edtTotal_Entry_Qty", $NC.getGridSumVal(G_GRDDETAIL, {
        sumKey: "ENTRY_QTY"
    }));

    // 신규 추가 후 포커싱
    $NC.setFocusGrid(G_GRDDETAIL, args.row, "ENTRY_QTY", true);
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
        case "ENTRY_QTY":
            if (Number(rowData.ENTRY_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.LDC01011P0.009", "분할수량이 1보다 작을 수 없습니다."));
                rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
            }
            // 등록수량 합계 체크.
            else {
                if (Number($NC.getValue("#edtEntry_Qty")) < $NC.getGridSumVal(G_GRDDETAIL, {
                    sumKey: "ENTRY_QTY"
                })) {
                    alert($NC.getDisplayMsg("JS.LDC01011P0.010", "분할수량 합계가 등록수량을 초과할 수 없습니다."));
                    rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                } else {
                    $NC.setValue("#edtTotal_Entry_Qty", $NC.getGridSumVal(G_GRDDETAIL, {
                        sumKey: "ENTRY_QTY"
                    }));
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row)) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if ($NC.isNull(rowData.ENTRY_QTY)) {
        alert($NC.getDisplayMsg("JS.LDC01011P0.011", "분할수량을 입력하십시오."));
        $NC.setFocusGrid(G_GRDDETAIL, row, "ENTRY_QTY", true);
        return false;
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
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
