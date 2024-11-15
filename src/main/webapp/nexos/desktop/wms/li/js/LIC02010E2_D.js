/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _InquiryD(args) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERD);
    // 파라메터 세팅
    G_GRDMASTERD.queryParams = {
        P_CENTER_CD: args.CENTER_CD,
        P_BU_CD: args.BU_CD,
        P_INBOUND_DATE: args.INBOUND_DATE,
        P_INOUT_CD: args.INOUT_CD,
        P_VENDOR_CD: args.VENDOR_CD,
        P_BRAND_CD: args.BRAND_CD,
        P_ITEM_CD: args.ITEM_CD,
        P_ITEM_NM: args.ITEM_NM,
        P_STATE_PRE_YN: args.STATE_PRE_YN,
        P_STATE_CUR_YN: args.STATE_CUR_YN
    };
    // 데이터 조회
    $NC.serviceCall("/LIC02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTERD), onGetMasterD);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _NewD() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _SaveD() {

    if (G_GRDMASTERD.data.getLength() == 0 || $NC.isNull(G_GRDMASTERD.lastRow) || G_GRDSUBD.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.038", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUBD)) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTERD)) {
        return;
    }

    // 확정의 비고 등록위하여 추가
    var refRowData = G_GRDMASTERD.data.getItem(G_GRDMASTERD.lastRow);
    var REMARK1 = "";
    if (refRowData.CRUD != $ND.C_DV_CRUD_R) {
        REMARK1 = refRowData.REMARK1;
    }

    var dsSub = [];
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var rowData, rIndex, rCount;
    var dsTarget = G_GRDSUBD.data.getItems();
    for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsSub.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_INBOUND_SEQ: rowData.INBOUND_SEQ,
            P_VALID_DATE: rowData.VALID_DATE,
            P_BATCH_NO: rowData.BATCH_NO,
            P_CONFIRM_QTY: rowData.CONFIRM_QTY,
            P_PUTAWAY_QTY: rowData.CONFIRM_QTY,
            P_INSPECT_YN: $ND.C_YES,
            P_CRUD: rowData.CRUD
        });
    }

    if (refRowData.CRUD == $ND.C_DV_CRUD_R && dsSub.length == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.039", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LIC02010E0/saveDirections.do", {
        P_DS_MASTER: {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_INBOUND_DATE: refRowData.INBOUND_DATE,
            P_INBOUND_NO: refRowData.INBOUND_NO,
            P_INOUT_CD: refRowData.INOUT_CD,
            P_LINE_NO: "",
            P_PROCESS_CD: $NC.G_VAR.activeView.PROCESS_CD,
            P_CHECK_STATE: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
            P_REMARK1: REMARK1,
            P_CRUD: refRowData.CRUD
        },
        P_DS_SUB: dsSub,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveD);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _DeleteD() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _CancelD() {

}

function onProcessPreD() {

    var rCount = G_GRDMASTERD.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.026", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.027", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LIC02010E2.057", "입고확정취소 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERD.view.getEditorLock().isActive()) {
        G_GRDMASTERD.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERD.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 입고확정 상태인 전표만 대상
        if (rowData.INBOUND_STATE != PROCESS_STATE) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO
        });
    }
    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.058", "입고확정취소 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.059", "선택한 데이터 중 입고확정취소 처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/LIC02010E0/callLIProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_CONFIRM,
        P_DIRECTION: $ND.C_DIRECTION_BW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessD, onSaveErrorD, 2);
}

function onProcessNxtD() {

    var rCount = G_GRDMASTERD.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.026", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.027", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LIC02010E2.060", "입고확정 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERD.view.getEditorLock().isActive()) {
        G_GRDMASTERD.view.getEditorLock().commitCurrentEdit();
    }

    if ($NC.isGridModified(G_GRDSUBD)) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.061", "데이터가 수정되었습니다. 저장 후 입고확정 처리하십시오."));
        return;
    }

    var dsMaster = [];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERD.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 입고지시 상태인 전표만 대상
        if (rowData.INBOUND_STATE != PROCESS_STATE) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO
        });
    }
    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.062", "입고확정 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.063", "선택한 데이터 중 입고확정처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/LIC02010E0/callLIProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_CONFIRM,
        P_DIRECTION: $ND.C_DIRECTION_FW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessD, onSaveErrorD, 2);
}

function onPartialPreD() {

    var rCount = G_GRDDETAILD.data.getLength();
    if (G_GRDMASTERD.data.getLength() == 0 || $NC.isNull(G_GRDMASTERD.lastRow) || rCount == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.026", "조회 후 처리하십시오."));
        return;
    }

    if (G_GRDDETAILD.view.getEditorLock().isActive()) {
        G_GRDDETAILD.view.getEditorLock().commitCurrentEdit();
    }

    var checkedData = $NC.getGridCheckedValues(G_GRDDETAILD, {
        valueColumns: "LINE_NO",
        compareFn: function(rowData) {
            return rowData.INBOUND_STATE >= $ND.C_STATE_CONFIRM;
        }
    });

    if (checkedData.values.length == 0) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.064", "입고 부분 확정취소 처리할 데이터를 선택하십시오."));
        return;
    }
    if (rCount == checkedData.values.length) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.065", "부분 확정 취소할 상품내역을 일부만 선택하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LIC02010E2.066", "입고 부분 확정취소 처리하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTERD.data.getItem(G_GRDMASTERD.lastRow);
    $NC.serviceCall("/LIC02010E0/callLIPatialCancel.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO,
        P_PROCESS_CD: $ND.C_PROCESS_CONFIRM,
        P_DIRECTION: $ND.C_DIRECTION_BW,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveD, onSaveErrorD, 2);
}

function grdMasterDOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_P",
        field: "INBOUND_STATE",
        name: "P",
        resizable: false,
        formatter: window.getGridProcessFormatter
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_S",
        field: "INBOUND_STATE",
        name: "S",
        resizable: false,
        formatter: window.getGridStateFormatter
    });
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
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "입고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "입고구분"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "VCONFIRM_YN",
        field: "VCONFIRM_YN",
        name: "가확정",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "VIRTUAL_YN",
        field: "VIRTUAL_YN",
        name: "가입고",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "TOT_CONFIRM_QTY",
        field: "TOT_CONFIRM_QTY",
        name: "총수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_D",
        field: "INBOUND_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "IN_CAR_DIV_F",
        field: "IN_CAR_DIV_F",
        name: "입고차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NO",
        field: "CAR_NO",
        name: "차량번호"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_DATE",
        field: "ORDER_DATE",
        name: "예정일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_NO",
        field: "ORDER_NO",
        name: "예정번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID_CNT",
        field: "PALLET_ID_CNT",
        name: "파렛트ID수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterDInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.INBOUND_STATE < $ND.C_STATE_CONFIRM) {
                    return;
                }
                if (rowData.SEND_STATE >= "10") {
                    return "stySendDone";
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMasterD", {
        columns: grdMasterDOnGetColumns(),
        queryId: "LIC02010E2.RS_T3_MASTER",
        sortCol: "INBOUND_NO",
        gridOptions: options
    });

    G_GRDMASTERD.view.onSelectedRowsChanged.subscribe(grdMasterDOnAfterScroll);
    G_GRDMASTERD.view.onHeaderClick.subscribe(grdMasterDOnHeaderClick);
    G_GRDMASTERD.view.onClick.subscribe(grdMasterDOnClick);
    G_GRDMASTERD.view.onBeforeEditCell.subscribe(grdMasterDOnBeforeEditCell);
    G_GRDMASTERD.view.onCellChange.subscribe(grdMasterDOnCellChange);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTERD, "CHECK_YN");
}

function grdMasterDOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTERD, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTERD.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAILD);
    G_GRDDETAILD.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LIC02010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAILD), onGetDetailD);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDSUBD);
    G_GRDSUBD.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LIC02010E0/getDataSet.do", $NC.getGridParams(G_GRDSUBD), onGetSubD);

    // 부분취소 버튼 표시
    $NC.setEnable("#btnPartialPreD", rowData.INBOUND_STATE >= $ND.C_STATE_CONFIRM);
    // 가확정설정/취소 버튼 표시
    $NC.setEnable("#btnVConfirmD", rowData.INBOUND_STATE == $ND.C_STATE_DIRECTIONS);
    $("#btnVConfirmD").val(rowData.VCONFIRM_YN == $ND.C_YES ? "가확정취소" : "가확정처리");

    // 입고지시 수정 가능 여부 -> 진행상태: 30
    var canEdit = rowData.INBOUND_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    G_GRDSUBD.view.setOptions({
        editable: canEdit,
        autoEdit: canEdit
    });

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTERD, row + 1);
}

function grdMasterDOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTERD, e, args);
            break;
    }
}

function grdMasterDOnClick(e, args) {

    var columnId = G_GRDMASTERD.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTERD, e, args);
            break;
    }
}

/**
 * @param e
 *        Event Handler
 * @param args
 *        row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdMasterDOnBeforeEditCell(e, args) {

    // var rowData = args.item;

    return true;
}

function grdMasterDOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTERD, rowData);
}

function grdDetailDOnGetColumns() {

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
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
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
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "FLOCATION_CD",
        field: "FLOCATION_CD",
        name: "고정로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
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
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "확정EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_WEIGHT",
        field: "CONFIRM_WEIGHT",
        name: "등록중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BUY_AMT",
        field: "BUY_AMT",
        name: "매입금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });
    $NC.setGridColumn(columns, {
        id: "BU_KEY",
        field: "BU_KEY",
        name: "전표키"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailDInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.ENTRY_QTY > rowData.CONFIRM_QTY) {
                    return "styUnder";
                }
                if (rowData.DRUG_CAUTION == "1") {
                    return "stySpecial";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetailD", {
        columns: grdDetailDOnGetColumns(),
        queryId: "LIC02010E2.RS_T3_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAILD.view.onSelectedRowsChanged.subscribe(grdDetailDOnAfterScroll);
    G_GRDDETAILD.view.onHeaderClick.subscribe(grdDetailDOnHeaderClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDDETAILD, "CHECK_YN");
}

function grdDetailDOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAILD, args.rows, e)) {
        return;
    }

    // 지시 수정 체크
    if (!$NC.isGridValidLastRow(G_GRDSUBD, null, e)) {
        $NC.setGridSelectRow(G_GRDDETAILD, G_GRDDETAILD.lastRow);
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAILD.data.getItem(row);

    $NC.setGridFilterValue(G_GRDSUBD, rowData.LINE_NO);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAILD, row + 1);
}

function grdDetailDOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDDETAILD, e, args);
            break;
    }
}

function grdSubDOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "확정EA",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        editor: Slick.Editors.Date,
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호",
        editor: Slick.Editors.Text,
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_WEIGHT",
        field: "CONFIRM_WEIGHT",
        name: "확정중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_YN",
        field: "INSPECT_YN",
        name: "검수여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_USER_ID",
        field: "INSPECT_USER_ID",
        name: "검수자ID"
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_DATETIME",
        field: "INSPECT_DATETIME",
        name: "검수일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_YN",
        field: "PUTAWAY_YN",
        name: "적치여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubDOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDSUBD, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdSubDInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 3,
        specialRow: {
            compareKey: "ENTRY_QTY",
            compareCol: "CONFIRM_QTY",
            compareOperator: ">",
            cssClass: "styUnder"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSubD", {
        columns: grdSubDOnGetColumns(),
        queryId: "LIC02010E2.RS_T3_SUB1",
        sortCol: "INBOUND_SEQ",
        gridOptions: options
    });

    G_GRDSUBD.view.onSelectedRowsChanged.subscribe(grdSubDOnAfterScroll);
    G_GRDSUBD.view.onBeforeEditCell.subscribe(grdSubDOnBeforeEditCell);
    G_GRDSUBD.view.onCellChange.subscribe(grdSubDOnCellChange);
}

/**
 * grdSubC 데이터 필터링 이벤트
 */
function grdSubDOnFilter(item) {

    return G_GRDSUBD.lastFilterVal == item.LINE_NO;
}

/**
 * @param e
 * @param args
 *        row: activeRow, cell: activeCell, item: item
 */
function grdSubDOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDSUBD.view.getColumnId(args.cell)) {
        case "CONFIRM_QTY":
            var CONFIRM_QTY = Number(rowData.CONFIRM_QTY);
            if (CONFIRM_QTY < 0) {
                alert($NC.getDisplayMsg("JS.LIC02010E2.067", "확정수량이 0보다 작을 수 없습니다."));
                rowData.CONFIRM_QTY = args.oldItem.CONFIRM_QTY;
                rowData.CONFIRM_BOX = args.oldItem.CONFIRM_BOX;
                rowData.CONFIRM_EA = args.oldItem.CONFIRM_EA;
                rowData.CONFIRM_WEIGHT = args.oldItem.CONFIRM_WEIGHT;
                break;
            }
            if ($NC.G_VAR.policyVal.LI710 == $ND.C_POLICY_VAL_2 && rowData.IN_GRP == $ND.C_INOUT_GRP_E2) { // 수송입고전표 등록수량 이하로 수량 수정 가능
                if ($NC.toNumber(rowData.ENTRY_QTY) < CONFIRM_QTY) {
                    alert($NC.getDisplayMsg("JS.LIC02010E2.068", "확정수량이 등록수량을 초과할 수 없습니다."));
                    rowData.CONFIRM_QTY = args.oldItem.CONFIRM_QTY;
                    rowData.CONFIRM_BOX = args.oldItem.CONFIRM_BOX;
                    rowData.CONFIRM_EA = args.oldItem.CONFIRM_EA;
                    rowData.CONFIRM_WEIGHT = args.oldItem.CONFIRM_WEIGHT;
                    $NC.setFocusGrid(G_GRDSUBD, args.row, args.cell, true);
                    break;
                }
            }

            rowData.CONFIRM_BOX = $NC.getBBox(CONFIRM_QTY, rowData.QTY_IN_BOX);
            rowData.CONFIRM_EA = $NC.getBEa(CONFIRM_QTY, rowData.QTY_IN_BOX);
            rowData.CONFIRM_WEIGHT = $NC.getWeight(CONFIRM_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(rowData.VALID_DATE)) {
                if (!$NC.isDate(rowData.VALID_DATE)) {
                    alert($NC.getDisplayMsg("JS.LIC02010E2.055", "유통기한을 정확히 입력하십시오."));
                    rowData.VALID_DATE = "";
                    $NC.setFocusGrid(G_GRDSUBD, args.row, args.cell, true);
                } else {
                    rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUBD, rowData);
}

function grdSubDOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUBD, row)) {
        return true;
    }

    var rowData = G_GRDSUBD.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CONFIRM_QTY)) {
            alert($NC.getDisplayMsg("JS.LIC02010E2.069", "확정수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUBD, row, "CONFIRM_QTY", true);
            return false;
        }
        if (rowData.VALID_DATE_CHK_YN == $ND.C_YES && $NC.isNull(rowData.VALID_DATE)) {
            alert($NC.getDisplayMsg("JS.LIC02010E0.070", "유통기한을 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUBD, row, "VALID_DATE", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUBD, rowData);
    return true;
}

/**
 * @param e
 *        Event Handler
 * @param args
 *        row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdSubDOnBeforeEditCell(e, args) {

    var refRowData = G_GRDMASTERD.data.getItem(G_GRDMASTERD.lastRow) || {};
    // var rowData = args.item;
    // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
    switch (args.column.id) {
        case "CONFIRM_QTY":
            // 수송입고일 경우
            if (refRowData.INOUT_SUB_CD == $ND.C_INOUT_GRP_E2) {
                return $NC.G_VAR.policyVal.LI710 != $ND.C_POLICY_VAL_1; // 수송입고 수량 수정 기준
            }
            // 일반입고일 경우
            else {
                return $NC.G_VAR.policyVal.LI410 == $ND.C_YES; // 입고확정 수량 수정 허용 기준
            }
            // 재고관리 기준 - 입고일자, 유효일자, 배치번호별 관리
        case "VALID_DATE":
        case "BATCH_NO":
            return $NC.G_VAR.policyVal.LS210 == "2";
    }
    return true;
}

function grdSubDOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUBD, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUBD, row + 1);
}

function onGetMasterD(ajaxData) {

    $NC.setInitGridData(G_GRDMASTERD, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTERD, "INBOUND_NO", true)) {
        $NC.setEnable("#btnPrintPallet", true);
    } else {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAILD);
        // 입고지시 초기화
        $NC.clearGridData(G_GRDSUBD);
        $NC.setEnable("#btnPrintPallet", false);
    }

    // 전표 건수 정보 업데이트
    window.setMasterSummaryInfo();

    // 공통 버튼 활성화
    window.setTopButtons();
}

function onGetDetailD(ajaxData) {

    $NC.setInitGridData(G_GRDDETAILD, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAILD);
}

function onGetSubD(ajaxData) {

    var rowData = G_GRDDETAILD.data.getItem(G_GRDDETAILD.lastRow);
    $NC.setGridFilterValue(G_GRDSUBD, $NC.isNull(rowData) ? null : rowData.LINE_NO);

    $NC.setInitGridData(G_GRDSUBD, ajaxData, grdSubDOnFilter);
    $NC.setInitGridAfterOpen(G_GRDSUBD);
}

function onSaveD(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERD, {
        selectKey: "INBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERD.lastKeyVal = lastKeyVal;
}

function onSaveErrorD(ajaxData) {

    $NC.onError(ajaxData);
    window.setMasterSummaryInfo();
}

function onSuccessD(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        // 선택 처리, 오류 메시지 표시 후 재조회
        // return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERD, {
        selectKey: "INBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERD.lastKeyVal = lastKeyVal;
}

function btnVConfirmDOnClick() {

    if (G_GRDMASTERD.data.getLength() == 0 || $NC.isNull(G_GRDMASTERD.lastRow)) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.071", "데이터조회 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDMASTERD.data.getItem(G_GRDMASTERD.lastRow);
    if (rowData.VCONFIRM_YN == $ND.C_YES) {
        if (!confirm($NC.getDisplayMsg("JS.LIC02010E2.072", "가확정 취소 하시겠습니까?"))) {
            return;
        }
    } else {
        if (!confirm($NC.getDisplayMsg("JS.LIC02010E2.073", "가확정 처리 하시겠습니까?"))) {
            return;
        }
    }

    var dsMaster = [
        {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO,
            P_VCONFIRM_YN: rowData.VCONFIRM_YN == $ND.C_YES ? $ND.C_NO : $ND.C_YES,
            P_CHECK_STATE: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CRUD: $ND.C_DV_CRUD_U
        }
    ];

    $NC.serviceCall("/LIC02010E0/saveVConfirmYn.do", {
        P_DS_MASTER: dsMaster
    }, onSaveD, onSaveErrorD, 2);
}

function btnPrintPalletOnClick() {

    var PALLET_QTY = $NC.getValue("#edtPallet_Qty");
    if ($NC.isNull(PALLET_QTY) || PALLET_QTY == "0") {
        alert($NC.getDisplayMsg("JS.LIC02010E2.074", "파렛트수량을 입력하십시오."));
        $NC.setFocus("#edtPallet_Qty");
        return;
    }

    if (G_GRDSUBD.data.getLength() == 0 || $NC.isNull(G_GRDSUBD.lastRow)) {
        alert($NC.getDisplayMsg("JS.LIC02010E2.075", "입고지시정보에서 출력할 파렛트ID를 선택하십시오."));
        return;
    }

    var PRINT_CNT = $NC.getValue("#edtPrint_Cnt");
    if ($NC.isNull(PRINT_CNT) || PRINT_CNT == "0") {
        PRINT_CNT = "1";
    }

    var rowData = G_GRDSUBD.data.getItem(G_GRDSUBD.lastRow);
    var PALLET_INFO = PALLET_QTY + "/" + rowData.PRINT_INBOUND_DATE;
    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: "li/PAPER_LI_PALLET01",
        reportTitle: null,
        queryId: null,
        queryParams: {
            P_PALLET_INFO: PALLET_INFO,
            P_BATCH_NO: rowData.BATCH_NO,
            P_VALID_DATE: rowData.PRINT_VALID_DATE
        },
        internalQueryYn: $ND.C_NO,
        printCopy: PRINT_CNT
    };

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);
}