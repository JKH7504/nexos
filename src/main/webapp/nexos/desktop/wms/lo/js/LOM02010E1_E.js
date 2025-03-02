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
        P_OUTBOUND_DATE: args.OUTBOUND_DATE,
        P_INOUT_CD: args.INOUT_CD,
        P_BU_NO: args.BU_NO,
        P_SO_NO: args.SO_NO,
        P_BRAND_CD: args.BRAND_CD,
        P_ITEM_CD: args.ITEM_CD,
        P_ITEM_NM: args.ITEM_NM,
        P_ITEM_BAR_CD: args.ITEM_BAR_CD,
        P_OUTBOUND_BATCH: args.OUTBOUND_BATCHD,
        P_DELIVERY_CD: args.DELIVERY_CD,
        P_ORDERER_NM: args.ORDERER_NM,
        P_SHIPPER_NM: args.SHIPPER_NM,
        P_CAR_DIV: args.CAR_DIV,
        P_ITEM_STATE: args.ITEM_STATE,
        P_YEAR_DIV: args.YEAR_DIV,
        P_SEASON_DIV: args.SEASON_DIV,
        P_ITEM_DIV: args.ITEM_DIV,
        P_STATE_PRE_YN: args.STATE_PRE_YN,
        P_STATE_CUR_YN: args.STATE_CUR_YN
    };
    // 데이터 조회
    $NC.serviceCall("/LOM02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTERE), onGetMasterE);
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

    if (G_GRDMASTERE.data.getLength() == 0 || G_GRDDETAILE.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOM02010E1.071", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAILE)) {
        return;
    }

    var dsMaster = [ ];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAILE.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAILE.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R || rowData.OUTBOUND_STATE != $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_DELIVERY_QTY: rowData.DELIVERY_QTY,
            P_MISSED_DIV: rowData.MISSED_DIV,
            P_MISSED_COMMENT: rowData.MISSED_COMMENT,
            P_OUTBOUND_STATE: rowData.OUTBOUND_STATE,
            P_CUR_STATE: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM02010E1.072", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LOM02010E0/saveDelivery.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveE, onSaveErrorE);
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
        alert($NC.getDisplayMsg("JS.LOM02010E1.026", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LOM02010E1.027", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOM02010E1.088", "배송완료 취소 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERE.view.getEditorLock().isActive()) {
        G_GRDMASTERE.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [ ];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERE.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 배송완료 상태인 전표만 대상
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
        alert($NC.getDisplayMsg("JS.LOM02010E1.089", "배송완료 취소 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM02010E1.090", "선택한 데이터 중 배송완료 취소 처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/LOM02010E0/callLOProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_DELIVERY,
        P_DIRECTION: $ND.C_DIRECTION_BW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        // -- PROCESS_ENTRY, DIRECTION_FW 처리에 사용 -------
        P_OUTBOUND_DATE_B: "",
        P_DELIVERY_BATCH: "",
        P_DELIVERY_BATCH_NM: "",
        // -- PROCESS_DIRECTIONS, DIRECTION_FW 처리에 사용 --
        P_OUTBOUND_BATCH: "",
        P_OUTBOUND_BATCH_NM: "",
        P_DIRECTIONS_DIV: "",
        P_EQUIP_DIV: "",
        // --------------------------------------------------
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessE, onSaveErrorE, 2);
}

function onProcessNxtE() {

    var rCount = G_GRDMASTERE.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LOM02010E1.026", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LOM02010E1.027", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOM02010E1.091", "배송완료 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERE.view.getEditorLock().isActive()) {
        G_GRDMASTERE.view.getEditorLock().commitCurrentEdit();
    }

    if ($NC.isGridModified(G_GRDDETAILE)) {
        alert($NC.getDisplayMsg("JS.LOM02010E1.092", "데이터가 수정되었습니다. 저장 후 배송완료 처리하십시오."));
        return;
    }

    var dsMaster = [ ];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERE.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 배송완료 상태인 전표만 대상
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
        alert($NC.getDisplayMsg("JS.LOM02010E1.093", "배송완료 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM02010E1.094", "선택한 데이터 중 배송완료처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/LOM02010E0/callLOProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_DELIVERY,
        P_DIRECTION: $ND.C_DIRECTION_FW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        // -- PROCESS_ENTRY, DIRECTION_FW 처리에 사용 -------
        P_OUTBOUND_DATE_B: "",
        P_DELIVERY_BATCH: "",
        P_DELIVERY_BATCH_NM: "",
        // -- PROCESS_DIRECTIONS, DIRECTION_FW 처리에 사용 --
        P_OUTBOUND_BATCH: "",
        P_OUTBOUND_BATCH_NM: "",
        P_DIRECTIONS_DIV: "",
        P_EQUIP_DIV: "",
        // --------------------------------------------------
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessE, onSaveErrorE, 2);
}

function grdMasterEOnGetColumns() {

    var columns = [ ];
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
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_STATE_D",
        field: "OUTBOUND_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_DIV_D",
        field: "ORDER_DIV_D",
        name: "주문구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_DIV_F",
        field: "CAR_DIV_F",
        name: "차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "SHIP_RCP_NO",
        field: "SHIP_RCP_NO",
        name: "운송접수번호"
    });
    $NC.setGridColumn(columns, {
        id: "ERP_BATCH",
        field: "ERP_BATCH",
        name: "ERP차수"
    });
    $NC.setGridColumn(columns, {
        id: "TOT_CONFIRM_QTY",
        field: "TOT_CONFIRM_QTY",
        name: "총수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "총금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_BATCH",
        field: "OUTBOUND_BATCH",
        name: "출고차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
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
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "거래명세서일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_USER_ID",
        field: "CONFIRM_USER_ID",
        name: "확정사용자"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_DATETIME",
        field: "CONFIRM_DATETIME",
        name: "확정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_USER_ID",
        field: "DELIVERY_USER_ID",
        name: "배송완료자"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_DATETIME",
        field: "DELIVERY_DATETIME",
        name: "배송완료일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "MISSED_YN",
        field: "MISSED_YN",
        name: "미배송처리여부",
        formatter: Slick.Formatters.CheckBox,
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterEInitialize() {

    var options = {
        frozenColumn: 5,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.OUTBOUND_STATE < $ND.C_STATE_DELIVERY) {
                    return;
                }
                if (rowData.SEND50_STATE >= "10") {
                    return "stySendDone";
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMasterE", {
        columns: grdMasterEOnGetColumns(),
        queryId: "LOM02010E1.RS_T4_MASTER",
        sortCol: "OUTBOUND_NO",
        gridOptions: options
    });

    G_GRDMASTERE.view.onSelectedRowsChanged.subscribe(grdMasterEOnAfterScroll);
    G_GRDMASTERE.view.onHeaderClick.subscribe(grdMasterEOnHeaderClick);
    G_GRDMASTERE.view.onClick.subscribe(grdMasterEOnClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTERE, "CHECK_YN");
}

/**
 * 배송완료처리탭 상단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
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
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LOM02010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAILE), onGetDetailE);

    // 출고디테일 수정 가능 여부 -> 진행상태: 40
    var canEdit = rowData.OUTBOUND_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    G_GRDDETAILE.view.setOptions({
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

    var columns = [ ];
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
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
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
        id: "DELIVERY_QTY",
        field: "DELIVERY_QTY",
        name: "배송수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "MISSED_QTY",
        field: "MISSED_QTY",
        name: "미배송수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "MISSED_DIV_F",
        field: "MISSED_DIV_F",
        name: "미배송사유",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "MISSED_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "MISSED_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "MISSED_COMMENT",
        field: "MISSED_COMMENT",
        name: "미배송사유내역",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "MARGIN_RATE",
        field: "MARGIN_RATE",
        name: "마진율",
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
        id: "ITEM_ORDER_DIV_F",
        field: "ITEM_ORDER_DIV_F",
        name: "상품주문유형"
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
        id: "ORDER_LINE_NO",
        field: "ORDER_LINE_NO",
        name: "예정순번",
        cssClass: "styRight"
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

function grdDetailEInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 5,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.CONFIRM_QTY > rowData.DELIVERY_QTY) {
                    return "styUnder";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetailE", {
        columns: grdDetailEOnGetColumns(),
        queryId: "LOM02010E1.RS_T4_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAILE.view.onSelectedRowsChanged.subscribe(grdDetailEOnAfterScroll);
    G_GRDDETAILE.view.onBeforeEditCell.subscribe(grdDetailEOnBeforeEditCell);
    G_GRDDETAILE.view.onCellChange.subscribe(grdDetailEOnCellChange);

}

function grdDetailEOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAILE, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAILE, row + 1);
}

/**
 * 배송완료처리 탭 : 하단그리드 편집불가능
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailEOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
    switch (args.column.id) {
        case "DELIVERY_QTY":
            return $NC.G_VAR.policyVal.LO510 == "1"; // 배송 완료 수량 수정 허용 기준
        case "MISSED_DIV_F":
        case "MISSED_COMMENT":
            return Number(rowData.MISSED_QTY) > 0;
    }
    return true;
}

/**
 * 배송완료처리 탭 하단그리드의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailEOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDDETAILE.view.getColumnId(args.cell)) {
        case "DELIVERY_QTY":
            var DELIVERY_QTY = Number(rowData.DELIVERY_QTY);
            if (DELIVERY_QTY < 0) {
                alert($NC.getDisplayMsg("JS.LOM02010E1.095", "배송수량에 0보다 작은값을 입력할 수 없습니다."));
                rowData.DELIVERY_QTY = args.oldItem.DELIVERY_QTY;
                rowData.MISSED_QTY = args.oldItem.MISSED_QTY;
                $NC.setFocusGrid(G_GRDDETAILE, args.row, args.cell, true);
                break;
            } else if (Number(rowData.CONFIRM_QTY) < DELIVERY_QTY) {
                alert($NC.getDisplayMsg("JS.LOM02010E1.096", "배송수량이 확정수량을 초과할 수 없습니다."));
                rowData.DELIVERY_QTY = args.oldItem.DELIVERY_QTY;
                rowData.MISSED_QTY = args.oldItem.MISSED_QTY;
                $NC.setFocusGrid(G_GRDDETAILE, args.row, args.cell, true);
                break;
            } else {
                rowData.MISSED_QTY = Number(rowData.CONFIRM_QTY) - DELIVERY_QTY;
                $NC.setFocusGrid(G_GRDDETAILE, args.row, "MISSED_DIV_F", true);
            }

            if (rowData.MISSED_QTY == 0) {
                rowData.MISSED_DIV = "";
                rowData.MISSED_DIV_F = "";
                rowData.MISSED_COMMENT = "";
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAILE, rowData);
}

/**
 * 배송완료처리 탭 하단그리드의 입력체크 처리
 */
function grdDetailEOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAILE, row)) {
        return true;
    }

    var rowData = G_GRDDETAILE.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.DELIVERY_QTY)) {
            alert($NC.getDisplayMsg("JS.LOM02010E1.097", "배송수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAILE, row, "DELIVERY_QTY", true);
            return false;
        }
        if (Number(rowData.MISSED_QTY) != 0 && $NC.isNull(rowData.MISSED_DIV)) {
            alert($NC.getDisplayMsg("JS.LOM02010E1.098", "미배송사유를 선택하십시오."));
            $NC.setFocusGrid(G_GRDDETAILE, row, "MISSED_DIV_F", true);
            return false;
        }
    }

    return true;
}

function onGetMasterE(ajaxData) {

    $NC.setInitGridData(G_GRDMASTERE, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTERE, "OUTBOUND_NO", true)) {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAILE);
    }

    // 전표 건수 정보 업데이트
    window.setMasterSummaryInfo();

    // 공통 버튼 활성화
    window.setTopButtons();
}

function onGetDetailE(ajaxData) {

    $NC.setInitGridData(G_GRDDETAILE, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAILE, "LINE_NO");
}

function onSaveE(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERE, {
        selectKey: "OUTBOUND_NO"
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
        selectKey: "OUTBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERE.lastKeyVal = lastKeyVal;
}
