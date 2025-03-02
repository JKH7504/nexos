/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _InquiryB(args) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERB);
    // 파라메터 세팅
    G_GRDMASTERB.queryParams = {
        P_CENTER_CD: args.CENTER_CD,
        P_BU_CD: args.BU_CD,
        P_OUTBOUND_DATE: args.OUTBOUND_DATE,
        P_ORDER_DATE1: args.ORDER_DATE1,
        P_ORDER_DATE2: args.ORDER_DATE2,
        P_INOUT_CD: args.INOUT_CD,
        P_VENDOR_CD: args.VENDOR_CD,
        P_BRAND_CD: args.BRAND_CD,
        P_ITEM_CD: args.ITEM_CD,
        P_ITEM_NM: args.ITEM_NM,
        P_ITEM_STATE: args.ITEM_STATE,
        P_YEAR_DIV: args.YEAR_DIV,
        P_SEASON_DIV: args.SEASON_DIV,
        P_ITEM_DIV: args.ITEM_DIV,
        P_STATE_PRE_YN: args.STATE_PRE_YN,
        P_STATE_CUR_YN: args.STATE_CUR_YN
    };
    // 데이터 조회
    $NC.serviceCall("/ROC02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTERB), onGetMasterB);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _NewB() {

    if ($NC.G_VAR.activeView.PROCESS_CD != $ND.C_PROCESS_ENTRY) {
        return;
    }
    if ($NC.G_VAR.policyVal.RO210 != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.016", "반출등록 신규처리가 불가능한 사업부입니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    var permission = $NC.getProgramPermission();

    $NC.showProgramSubPopup({
        PROGRAM_ID: "ROC02011P1",
        PROGRAM_NM: $NC.getDisplayMsg("JS.ROC02011P1.001", "반출등록/수정"),
        url: "ro/ROC02011P1.html",
        width: 1024,
        height: 600,
        G_PARAMETER: {
            P_PROCESS_CD: $ND.C_PROCESS_ENTRY_CREATE,
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_BU_CD: BU_CD,
            P_BU_NM: BU_NM,
            P_CUST_CD: CUST_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_POLICY_RO190: $NC.G_VAR.policyVal.RO190,
            P_POLICY_RO210: $NC.G_VAR.policyVal.RO210,
            P_POLICY_RO220: $NC.G_VAR.policyVal.RO220,
            P_POLICY_RO221: $NC.G_VAR.policyVal.RO221,
            P_POLICY_RO240: $NC.G_VAR.policyVal.RO240,
            P_POLICY_RO250: $NC.G_VAR.policyVal.RO250,
            P_POLICY_LS210: $NC.G_VAR.policyVal.LS210,
            P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
            P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
            P_MASTER_DS: {},
            P_DETAIL_DS: [],
            P_PERMISSION: permission
        },
        onOk: function() {
            onSaveB($NC.toJson({
                RESULT_DATA: $ND.C_OK
            }));
        }
    });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _SaveB() {

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _DeleteB() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _CancelB() {

}

function onProcessPreB() {

    var rCount = G_GRDMASTERB.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.017", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.018", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.ROC02010E1.019", "반출등록 취소 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERB.view.getEditorLock().isActive()) {
        G_GRDMASTERB.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERB.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 반출등록 상태인 전표만 대상
        if (rowData.OUTBOUND_STATE != PROCESS_STATE) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO
        });
    }
    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.020", "반출등록 취소 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.021", "선택한 데이터 중 반출등록 취소 처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/ROC02010E0/callROProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_ENTRY,
        P_DIRECTION: $ND.C_DIRECTION_BW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessB, onSaveErrorB, 2);
}

function onProcessNxtB() {

    var rCount = G_GRDMASTERB.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.017", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.018", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    var OUTBOUND_DATE = $NC.getValue("#dtpOutbound_DateB");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.022", "출고일자를 먼저 입력하십시오."));
        $NC.setFocus("#dtpOutbound_DateB");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.ROC02010E1.023", "반출등록 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERB.view.getEditorLock().isActive()) {
        G_GRDMASTERB.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERB.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 반출예정 상태인 전표만 대상
        if (rowData.OUTBOUND_STATE != PROCESS_STATE) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_ORDER_DATE: rowData.ORDER_DATE,
            P_ORDER_NO: rowData.ORDER_NO,
            P_OUTBOUND_DATE: OUTBOUND_DATE
        });
    }
    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.024", "반출등록 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.025", "선택한 데이터 중 반출등록 처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/ROC02010E0/callROEntryProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_ENTRY,
        P_DIRECTION: $ND.C_DIRECTION_FW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessB, onSaveErrorB, 2);
}

function grdMasterBOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_STATE_P",
        field: "OUTBOUND_STATE",
        name: "P",
        resizable: false,
        formatter: window.getGridProcessFormatter
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_STATE_S",
        field: "OUTBOUND_STATE",
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
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "반출일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "반출번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_STATE_D",
        field: "OUTBOUND_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "반출구분"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "TOT_ENTRY_QTY",
        field: "TOT_ENTRY_QTY",
        name: "총수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
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
        id: "PLANED_DATETIME",
        field: "PLANED_DATETIME",
        name: "납품예정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 반출등록 마스터 그리드 초기화
 */
function grdMasterBInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMasterB", {
        columns: grdMasterBOnGetColumns(),
        queryId: "ROC02010E1.RS_T1_MASTER",
        sortCol: "INBOUND_NO",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDMASTERB.view.onSelectedRowsChanged.subscribe(grdMasterBOnAfterScroll);
    G_GRDMASTERB.view.onHeaderClick.subscribe(grdMasterBOnHeaderClick);
    G_GRDMASTERB.view.onClick.subscribe(grdMasterBOnClick);
    G_GRDMASTERB.view.onDblClick.subscribe(grdMasterBOnDblClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTERB, "CHECK_YN");
}

function grdMasterBOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTERB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTERB.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAILB);
    G_GRDDETAILB.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/ROC02010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAILB), onGetDetailB);

    // 디테일 그리드 컬럼타이틀 변경
    if (rowData.OUTBOUND_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
        G_GRDDETAILB.view.updateColumnHeader("ENTRY_BOX", "등록BOX");
        G_GRDDETAILB.view.updateColumnHeader("ENTRY_EA", "등록EA");
        G_GRDDETAILB.view.updateColumnHeader("ENTRY_WEIGHT", "등록중량");
    } else {
        G_GRDDETAILB.view.updateColumnHeader("ENTRY_BOX", "예정BOX");
        G_GRDDETAILB.view.updateColumnHeader("ENTRY_EA", "예정EA");
        G_GRDDETAILB.view.updateColumnHeader("ENTRY_WEIGHT", "예정중량");
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTERB, row + 1);
}

function grdMasterBOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTERB, e, args);
            break;
    }
}

function grdMasterBOnClick(e, args) {

    var columnId = G_GRDMASTERB.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTERB, e, args);
            break;
    }
}

function grdMasterBOnDblClick(e, args) {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.026", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var refRowData = G_GRDMASTERB.data.getItem(args.row);
    if ($NC.isNull(refRowData)) {
        return;
    }

    if (refRowData.OUTBOUND_STATE == $ND.C_STATE_CONFIRM) {
        alert($NC.getDisplayMsg("JS.ROC02010E1.027", "반출작업에서 확정 된 전표는 수정할 수 없습니다."));
        return;
    }

    var PROCESS_CD, OUTBOUND_DATE, OUTBOUND_NO;
    // 예정일 경우
    if (refRowData.OUTBOUND_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        PROCESS_CD = $ND.C_PROCESS_ORDER;
        OUTBOUND_DATE = refRowData.ORDER_DATE;
        OUTBOUND_NO = refRowData.ORDER_NO;
    }
    // 등록일 경우
    else {
        PROCESS_CD = $ND.C_PROCESS_ENTRY_UPDATE;
        OUTBOUND_DATE = refRowData.OUTBOUND_DATE;
        OUTBOUND_NO = refRowData.OUTBOUND_NO;
    }

    // 진행상태 체크 후 처리 가능시 팝업 표시
    window.getOutboundState({
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_NO: OUTBOUND_NO,
        P_LINE_NO: "",
        P_PROCESS_CD: PROCESS_CD, // 프로세스코드([A]예정, [B]등록)
        P_STATE_DIV: $ND.C_STATE_MIN
    // 상태구분([1]MIN, [2]MAX)
    }, //
    // ServiceCall SuccessCallback
    function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            alert($NC.getDisplayMsg("JS.ROC02010E1.028", "반출진행상태를 확인하지 못했습니다.\n다시 처리하십시오."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }
        if (refRowData.OUTBOUND_STATE != resultData.O_OUTBOUND_STATE) {
            alert($NC.getDisplayMsg("JS.ROC02010E1.029", "[진행상태 : " + resultData.O_OUTBOUND_STATE + "] 데이터가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.",
                resultData.O_OUTBOUND_STATE));
            return;
        }

        // 디테일 데이터 재조회 후 처리, 다른 사용자에 의해 변경될 수 있음
        $NC.clearGridData(G_GRDDETAILB);
        G_GRDDETAILB.queryParams = {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_ORDER_DATE: refRowData.ORDER_DATE,
            P_ORDER_NO: refRowData.ORDER_NO,
            P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: refRowData.OUTBOUND_NO
        };
        // 데이터 조회, Synchronize
        var serviceCallError = false;
        $NC.serviceCallAndWait("/ROC02010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAILB), onGetDetailB, function(subAjaxData) {
            $NC.onError(subAjaxData);
            serviceCallError = true;
        });
        if (serviceCallError) {
            return;
        }

        var dsDetail = G_GRDDETAILB.data.getItems();
        if (dsDetail.length == 0) {
            alert($NC.getDisplayMsg("JS.ROC02010E1.030", "등록/수정할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
            return;
        }

        var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
        var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
        var BU_CD = $NC.getValue("#edtQBu_Cd");
        var BU_NM = $NC.getValue("#edtQBu_Nm");
        var CUST_CD = $NC.getValue("#edtQCust_Cd");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "ROC02011P1",
            PROGRAM_NM: $NC.getDisplayMsg("JS.ROC02011P1.001", "반출등록/수정"),
            url: "ro/ROC02011P1.html",
            width: 1024,
            height: 600,
            G_PARAMETER: {
                P_PROCESS_CD: PROCESS_CD,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_CUST_CD: CUST_CD,
                P_POLICY_RO190: $NC.G_VAR.policyVal.RO190,
                P_POLICY_RO210: $NC.G_VAR.policyVal.RO210,
                P_POLICY_RO220: $NC.G_VAR.policyVal.RO220,
                P_POLICY_RO221: $NC.G_VAR.policyVal.RO221,
                P_POLICY_RO240: $NC.G_VAR.policyVal.RO240,
                P_POLICY_RO250: $NC.G_VAR.policyVal.RO250,
                P_POLICY_LS210: $NC.G_VAR.policyVal.LS210,
                P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
                P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
                P_MASTER_DS: refRowData,
                P_DETAIL_DS: dsDetail,
                P_PERMISSION: permission
            },
            onOk: function() {
                onSaveB($NC.toJson({
                    RESULT_DATA: $ND.C_OK
                }));
            }
        });
    });
}

function grdDetailBOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        resizable: false,
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
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
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
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "등록BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "등록EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    // 정책에 따른 컬럼 표시
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
        id: "RETURN_DIV_F",
        field: "RETURN_DIV_F",
        name: "반품사유구분"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_COMMENT",
        field: "RETURN_COMMENT",
        name: "반품사유내역"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
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
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailBOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDDETAILB, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" || $NC.G_VAR.policyVal.RO250 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdDetailBInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetailB", {
        columns: grdDetailBOnGetColumns(),
        queryId: "ROC02010E1.RS_T1_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAILB.view.onSelectedRowsChanged.subscribe(grdDetailBOnAfterScroll);
}

function grdDetailBOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAILB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAILB, row + 1);
}

function onGetMasterB(ajaxData) {

    $NC.setInitGridData(G_GRDMASTERB, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTERB, "OUTBOUND_NO", true)) {
        // 마스터 총수량 세팅
        var rowData = G_GRDMASTERB.data.getItem(0);
        $NC.setValue("#edtTotal_Order_QtyB", $NC.getDisplayNumber(rowData.TOTAL_ORDER_QTY));
        $NC.setValue("#edtTotal_Entry_QtyB", $NC.getDisplayNumber(rowData.TOTAL_ENTRY_QTY));
        $NC.setValue("#edtTotal_Vendor_CntB", $NC.getDisplayNumber(rowData.TOTAL_VENDOR_CNT));
    } else {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAILB);
        // 마스터 총수량 초기화
        $NC.setValue("#edtTotal_Order_QtyB");
        $NC.setValue("#edtTotal_Entry_QtyB");
        $NC.setValue("#edtTotal_Vendor_CntB");
    }

    // 전표 건수 정보 업데이트
    window.setMasterSummaryInfo();

    // 공통 버튼 활성화
    window.setTopButtons();
}

function onGetDetailB(ajaxData) {

    $NC.setInitGridData(G_GRDDETAILB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAILB);
}

function onSaveB(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERB, {
        selectKey: "OUTBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERB.lastKeyVal = lastKeyVal;
}

function onSaveErrorB(ajaxData) {

    $NC.onError(ajaxData);
    window.setMasterSummaryInfo();
}

function onSuccessB(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        // 선택 처리, 오류 메시지 표시 후 재조회
        // return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERB, {
        selectKey: "OUTBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERB.lastKeyVal = lastKeyVal;
}
