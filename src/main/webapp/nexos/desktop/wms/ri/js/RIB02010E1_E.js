/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _InquiryE(args) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERE);
    // 파라메터 세팅
    G_GRDMASTERE.queryParams = {
        P_CENTER_CD: args.CENTER_CD,
        P_BU_CD: args.BU_CD,
        P_INBOUND_DATE1: args.INBOUND_DATE1,
        P_INBOUND_DATE2: args.INBOUND_DATE2,
        P_INOUT_CD: args.INOUT_CD,
        P_BU_NO: args.BU_NO,
        P_DELIVERY_CD: args.DELIVERY_CD,
        P_RDELIVERY_CD: args.RDELIVERY_CD,
        P_BRAND_CD: args.BRAND_CD,
        P_ITEM_CD: args.ITEM_CD,
        P_ITEM_NM: args.ITEM_NM,
        P_RETURN_TYPE: args.RETURN_TYPE,
        P_ARRIVAL_YN: args.ARRIVAL_YN,
        P_BOX_SEQ: args.BOX_SEQ,
        P_RETURN_BATCH_DIV: args.RETURN_BATCH_DIV,
        P_ITEM_STATE: args.ITEM_STATE,
        P_YEAR_DIV: args.YEAR_DIV,
        P_SEASON_DIV: args.SEASON_DIV,
        P_ITEM_DIV: args.ITEM_DIV,
        P_ENTRY_USER_ID: args.ENTRY_USER_ID,
        P_STATE_PRE_YN: args.STATE_PRE_YN,
        P_STATE_CUR_YN: args.STATE_CUR_YN
    };
    // 데이터 조회
    $NC.serviceCall("/RIB02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTERE), onGetMasterE);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _NewE() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _SaveE() {

    if (G_GRDSUBE.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.040", "저장할 데이터가 없습니다."));
        return;
    }
    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUBE)) {
        return;
    }

    var dsSub = [];
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var rowData, rIndex, rCount;
    var dsTarget = G_GRDSUBE.data.getItems();
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
            P_PUTAWAY_LOCATION_CD: rowData.PUTAWAY_LOCATION_CD,
            P_PUTAWAY_QTY: rowData.PUTAWAY_QTY,
            P_PUTAWAY_YN: $ND.C_YES,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsSub.length == 0) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.041", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/RIB02010E0/saveDirections.do", {
        P_DS_MASTER: {
            P_CENTER_CD: dsSub[0].P_CENTER_CD,
            P_BU_CD: dsSub[0].P_BU_CD,
            P_INBOUND_DATE: dsSub[0].P_INBOUND_DATE,
            P_INBOUND_NO: dsSub[0].P_INBOUND_NO,
            P_LINE_NO: "",
            P_PROCESS_CD: $NC.G_VAR.activeView.PROCESS_CD,
            P_CHECK_STATE: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM
        },
        P_DS_DETAIL: [],
        P_DS_SUB: dsSub,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveE);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _DeleteE() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _CancelE() {

}

function onProcessPreE() {

    var rCount = G_GRDMASTERE.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.022", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.023", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.RIB02010E1.072", "반입적치취소 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERE.view.getEditorLock().isActive()) {
        G_GRDMASTERE.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERE.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 적치확정 상태인 전표만 대상
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
        alert($NC.getDisplayMsg("JS.RIB02010E1.073", "반입적치취소 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.074", "선택한 데이터 중 반입적치취소 처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/RIB02010E0/callRIProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_PUTAWAY,
        P_DIRECTION: $ND.C_DIRECTION_BW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessE, onSaveErrorE, 2);
}

function onProcessNxtE() {

    var rCount = G_GRDMASTERE.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.022", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.023", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.RIB02010E1.075", "반입적치 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERE.view.getEditorLock().isActive()) {
        G_GRDMASTERE.view.getEditorLock().commitCurrentEdit();
    }

    if ($NC.isGridModified(G_GRDSUBE)) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.076", "데이터가 수정되었습니다. 저장 후 반입적치 처리하십시오."));
        return;
    }

    var dsMaster = [];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERE.data.getItem(rIndex);
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
        alert($NC.getDisplayMsg("JS.RIB02010E1.077", "반입적치 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.RIB02010E1.078", "선택한 데이터 중 반입적치처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/RIB02010E0/callRIProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_PUTAWAY,
        P_DIRECTION: $ND.C_DIRECTION_FW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessE, onSaveErrorE, 2);
}

function grdMasterEOnGetColumns() {

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
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "반입일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "반입구분"
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
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_TYPE_F",
        field: "RETURN_TYPE_F",
        name: "반품유형"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_SEQ",
        field: "BOX_SEQ",
        name: "반품박스번호"
    });
    $NC.setGridColumn(columns, {
        id: "TOT_CONFIRM_QTY",
        field: "TOT_CONFIRM_QTY",
        name: "총수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_D",
        field: "INBOUND_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
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
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterEInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.INBOUND_STATE < $ND.C_STATE_PUTAWAY) {
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
    $NC.setInitGridObject("#grdMasterE", {
        columns: grdMasterEOnGetColumns(),
        queryId: "RIB02010E1.RS_T4_MASTER",
        sortCol: "INBOUND_NO",
        gridOptions: options
    });

    G_GRDMASTERE.view.onSelectedRowsChanged.subscribe(grdMasterEOnAfterScroll);
    G_GRDMASTERE.view.onHeaderClick.subscribe(grdMasterEOnHeaderClick);
    G_GRDMASTERE.view.onClick.subscribe(grdMasterEOnClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTERE, "CHECK_YN");
}

function grdMasterEOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTERE, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTERE.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAILE);
    G_GRDDETAILE.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/RIB02010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAILE), onGetDetailE);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDSUBE);
    G_GRDSUBE.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/RIB02010E0/getDataSet.do", $NC.getGridParams(G_GRDSUBE), onGetSubE);

    // 반입지시 수정 가능 여부 -> 진행상태: 40
    var canEdit = rowData.INBOUND_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    G_GRDSUBE.view.setOptions({
        editable: canEdit,
        autoEdit: canEdit
    });

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTERE, row + 1);
}

function grdMasterEOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTERE, e, args);
            break;
    }
}

function grdMasterEOnClick(e, args) {

    var columnId = G_GRDMASTERE.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTERE, e, args);
            break;
    }
}

function grdDetailEOnGetColumns() {

    var columns = [];
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
        id: "RETURN_BATCH_DIV_F",
        field: "RETURN_BATCH_DIV_F",
        name: "반품차수"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_CELL_NO",
        field: "RETURN_CELL_NO",
        name: "반품셀번호"
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
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_QTY",
        field: "PUTAWAY_QTY",
        name: "적치수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_BOX",
        field: "PUTAWAY_BOX",
        name: "적치BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_EA",
        field: "PUTAWAY_EA",
        name: "적치EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_WEIGHT",
        field: "PUTAWAY_WEIGHT",
        name: "적치중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
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
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
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
        id: "ENTRY_USER_NM",
        field: "ENTRY_USER_NM",
        name: "등록자명"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_USER_NM",
        field: "CONFIRM_USER_NM",
        name: "확정자명"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_USER_NM",
        field: "PUTAWAY_USER_NM",
        name: "적치자명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailEInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.ORDER_QTY > 0) {
                    if (rowData.ORDER_QTY > rowData.CONFIRM_QTY) {
                        return "styUnder";
                    } else if (rowData.ORDER_QTY < rowData.CONFIRM_QTY) {
                        return "styOver";
                    }
                } else {
                    if (rowData.ENTRY_QTY > rowData.CONFIRM_QTY) {
                        return "styUnder";
                    } else if (rowData.ENTRY_QTY < rowData.CONFIRM_QTY) {
                        return "styOver";
                    }
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetailE", {
        columns: grdDetailEOnGetColumns(),
        queryId: "RIB02010E1.RS_T4_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAILE.view.onSelectedRowsChanged.subscribe(grdDetailEOnAfterScroll);
}

function grdDetailEOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAILE, args.rows, e)) {
        return;
    }

    // 지시 수정 체크
    if (!$NC.isGridValidLastRow(G_GRDSUBE, null, e)) {
        $NC.setGridSelectRow(G_GRDDETAILE, G_GRDDETAILE.lastRow);
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAILE.data.getItem(row);

    $NC.setGridFilterValue(G_GRDSUBE, rowData.LINE_NO);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAILE, row + 1);
}

function grdSubEOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_LOCATION_CD",
        field: "PUTAWAY_LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdSubEOnPopup
        }
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_QTY",
        field: "PUTAWAY_QTY",
        name: "적치수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_BOX",
        field: "PUTAWAY_BOX",
        name: "적치BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_EA",
        field: "PUTAWAY_EA",
        name: "적치EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_WEIGHT",
        field: "PUTAWAY_WEIGHT",
        name: "적치중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_YN",
        field: "PUTAWAY_YN",
        name: "적치여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_USER_ID",
        field: "PUTAWAY_USER_ID",
        name: "적치자ID"
    });
    $NC.setGridColumn(columns, {
        id: "PUTAWAY_DATETIME",
        field: "PUTAWAY_DATETIME",
        name: "적치일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubEOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDSUBE, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdSubEInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSubE", {
        columns: grdSubEOnGetColumns(),
        queryId: "RIB02010E1.RS_T4_SUB1",
        sortCol: "INBOUND_SEQ",
        gridOptions: options
    });

    G_GRDSUBE.view.onSelectedRowsChanged.subscribe(grdSubEOnAfterScroll);
    G_GRDSUBE.view.onBeforeEditCell.subscribe(grdSubEOnBeforeEditCell);
    G_GRDSUBE.view.onCellChange.subscribe(grdSubEOnCellChange);
}

/**
 * grdSubC 데이터 필터링 이벤트
 */
function grdSubEOnFilter(item) {

    return G_GRDSUBE.lastFilterVal == item.LINE_NO;
}

/**
 * @param e
 * @param args
 *        row: activeRow, cell: activeCell, item: item
 */
function grdSubEOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDSUBE.view.getColumnId(args.cell)) {
        case "PUTAWAY_QTY":
            rowData.PUTAWAY_BOX = $NC.getBBox(rowData.PUTAWAY_QTY, rowData.QTY_IN_BOX);
            rowData.PUTAWAY_EA = $NC.getBEa(rowData.PUTAWAY_QTY, rowData.QTY_IN_BOX);
            rowData.PUTAWAY_WEIGHT = $NC.getWeight(rowData.PUTAWAY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
            break;
        case "PUTAWAY_LOCATION_CD":
            $NP.onLocationChange(rowData.PUTAWAY_LOCATION_CD, {
                P_CENTER_CD: rowData.CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: rowData.PUTAWAY_LOCATION_CD,
                // 1 - 일반, 2- 유통가공, 3 - 보세
                P_ZONE_DIV_ATTR01_CD: getZoneDivAttr01Cd(),
                P_INOUT_DIV: "1"
            }, onLocationPopup);
            return;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUBE, rowData);
}

function grdSubEOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUBE, row)) {
        return true;
    }

    var rowData = G_GRDSUBE.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.PUTAWAY_LOCATION_CD)) {
            alert($NC.getDisplayMsg("JS.RIB02010E1.079", "적치 로케이션을 지정하십시오."));
            $NC.setFocusGrid(G_GRDSUBE, row, "PUTAWAY_LOCATION_CD", true);
            return false;
        }
    }
    return true;
}

/**
 * @param e
 *        Event Handler
 * @param args
 *        row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdSubEOnBeforeEditCell(e, args) {

    // var rowData = args.item;

    return true;
}

/**
 * @param e
 * @param args
 *        grid: SlickGrid, rows: Array
 */
function grdSubEOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUBE, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUBE, row + 1);
}

function grdSubEOnPopup(e, args) {

    switch (args.column.id) {
        case "PUTAWAY_LOCATION_CD":
            $NP.showLocationPopup({
                P_CENTER_CD: G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow).CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: $ND.C_ALL,
                // 1 - 일반, 2- 유통가공, 3 - 보세
                P_ZONE_DIV_ATTR01_CD: getZoneDivAttr01Cd(),
                P_INOUT_DIV: "1"
            }, onLocationPopup, function() {
                $NC.setFocusGrid(G_GRDSUBE, args.row, args.cell, true, true);
            });
            return;
    }
}

function onLocationPopup(resultInfo) {

    var rowData = G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        rowData.ZONE_CD = resultInfo.ZONE_CD;
        rowData.ZONE_NM = resultInfo.ZONE_NM;
        rowData.BANK_CD = resultInfo.BANK_CD;
        rowData.BAY_CD = resultInfo.BAY_CD;
        rowData.LEV_CD = resultInfo.LEV_CD;
        rowData.PUTAWAY_LOCATION_CD = resultInfo.LOCATION_CD;
    } else {
        rowData.ZONE_CD = "";
        rowData.ZONE_NM = "";
        rowData.BANK_CD = "";
        rowData.BAY_CD = "";
        rowData.LEV_CD = "";
        rowData.PUTAWAY_LOCATION_CD = "";
    }
    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUBE, rowData);

    $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, "PUTAWAY_LOCATION_CD", true, true);
}

function onGetMasterE(ajaxData) {

    $NC.setInitGridData(G_GRDMASTERE, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTERE, "INBOUND_NO", true)) {
        // 마스터 총수량 세팅
        var rowData = G_GRDMASTERE.data.getItem(0);
        $NC.setValue("#edtTotal_Order_QtyE", $NC.getDisplayNumber(rowData.TOTAL_ORDER_QTY));
        $NC.setValue("#edtTotal_Entry_QtyE", $NC.getDisplayNumber(rowData.TOTAL_ENTRY_QTY));
        $NC.setValue("#edtTotal_Confirm_QtyE", $NC.getDisplayNumber(rowData.TOTAL_CONFIRM_QTY));
    } else {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAILE);
        // 반입지시 초기화
        $NC.clearGridData(G_GRDSUBE);
        // 마스터 총수량 초기화
        $NC.setValue("#edtTotal_Order_QtyE");
        $NC.setValue("#edtTotal_Entry_QtyE");
        $NC.setValue("#edtTotal_Confirm_QtyE");
    }

    // 전표 건수 정보 업데이트
    window.setMasterSummaryInfo();

    // 공통 버튼 활성화
    window.setTopButtons();
}

function onGetDetailE(ajaxData) {

    $NC.setInitGridData(G_GRDDETAILE, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAILE);
}

function onGetSubE(ajaxData) {

    var rowData = G_GRDDETAILE.data.getItem(G_GRDDETAILE.lastRow);
    $NC.setGridFilterValue(G_GRDSUBE, $NC.isNull(rowData) ? null : rowData.LINE_NO);

    $NC.setInitGridData(G_GRDSUBE, ajaxData, grdSubEOnFilter);
    $NC.setInitGridAfterOpen(G_GRDSUBE);
}

function onSaveE(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERE, {
        selectKey: "INBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERE.lastKeyVal = lastKeyVal;
}

function onSaveErrorE(ajaxData) {

    $NC.onError(ajaxData);
    window.setMasterSummaryInfo();
}

function onSuccessE(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        // 선택 처리, 오류 메시지 표시 후 재조회
        // return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERE, {
        selectKey: "INBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERE.lastKeyVal = lastKeyVal;
}

/**
 * 입고구분/상품상태에 따른 ZONE_DIV 서브코드
 */
function getZoneDivAttr01Cd() {

    // var rowData = G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow);
    // var INOUT_CD = rowData.INOUT_CD;
    // var ITEM_STATE = rowData.ITEM_STATE;

    return "1"; // 1 - 일반, 2- 유통가공, 3 - 보세
}