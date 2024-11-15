/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _InquiryC(args) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERC);
    // 파라메터 세팅
    G_GRDMASTERC.queryParams = {
        P_CENTER_CD: args.CENTER_CD,
        P_BU_CD: args.BU_CD,
        P_INBOUND_DATE: args.INBOUND_DATE,
        P_INOUT_CD: args.INOUT_CD,
        P_BU_NO: args.BU_NO,
        P_DELIVERY_CD: args.DELIVERY_CD,
        P_BRAND_CD: args.BRAND_CD,
        P_ITEM_CD: args.ITEM_CD,
        P_ITEM_NM: args.ITEM_NM,
        P_ORDERER_NM: args.ORDERER_NM,
        P_SHIPPER_NM: args.SHIPPER_NM,
        P_ITEM_STATE: args.ITEM_STATE,
        P_YEAR_DIV: args.YEAR_DIV,
        P_SEASON_DIV: args.SEASON_DIV,
        P_ITEM_DIV: args.ITEM_DIV,
        P_STATE_PRE_YN: args.STATE_PRE_YN,
        P_STATE_CUR_YN: args.STATE_CUR_YN
    };
    // 데이터 조회
    $NC.serviceCall("/RIM02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTERC), onGetMasterC);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _NewC() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _SaveC() {

    if (G_GRDMASTERC.data.getLength() == 0 || $NC.isNull(G_GRDMASTERC.lastRow) || G_GRDSUBC.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.035", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUBC)) {
        return;
    }

    var dsSub, dsTarget, rowData, rIndex, rCount;
    // [LS220]파렛트ID 사용 기준 : 1 - 파렛트ID 사용 안함
    // [LS220]파렛트ID 사용 기준 : 2 - 파렛트ID 사용 함
    // [RI230]파렛트ID 매핑 기준 : 1 - 파렛트 분할구분별 자동매핑(단일상품)
    // [RI230]파렛트ID 매핑 기준 : 2 - 상품별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 3 - 공급처별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 4 - 파렛트ID 하나로 자동 매핑(멀티상품)
    if ($NC.G_VAR.policyVal.LS220 == "1" || $NC.G_VAR.policyVal.LS220 == "2" && $NC.G_VAR.policyVal.RI230 == "1") {
        dsSub = [];
        // 필터링 된 데이터라 전체 데이터를 기준으로 처리
        dsTarget = G_GRDSUBC.data.getItems();
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
                P_ENTRY_QTY: rowData.ENTRY_QTY,
                P_CONFIRM_QTY: rowData.ENTRY_QTY,
                P_PUTAWAY_QTY: rowData.ENTRY_QTY,
                P_INSPECT_YN: $ND.C_NO,
                P_CRUD: rowData.CRUD
            });
        }

        if (dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.RIM02010E1.036", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/RIM02010E0/saveDirections.do", {
            P_DS_MASTER: {
                P_CENTER_CD: dsSub[0].P_CENTER_CD,
                P_BU_CD: dsSub[0].P_BU_CD,
                P_INBOUND_DATE: dsSub[0].P_INBOUND_DATE,
                P_INBOUND_NO: dsSub[0].P_INBOUND_NO,
                P_LINE_NO: "",
                P_PROCESS_CD: $NC.G_VAR.activeView.PROCESS_CD,
                P_CHECK_STATE: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM
            },
            P_DS_SUB: dsSub,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSaveC);
    } else {
        var dsD = [];
        var dsCU = [];
        // 필터링 된 데이터라 전체 데이터를 기준으로 처리
        dsTarget = G_GRDSUBC.data.getItems();
        for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
            rowData = dsTarget[rIndex];
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
                dsSub = dsD;
            } else {
                dsSub = dsCU;
            }
            dsSub.push({
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_INBOUND_DATE: rowData.INBOUND_DATE,
                P_INBOUND_NO: rowData.INBOUND_NO,
                P_LINE_NO: rowData.LINE_NO,
                P_PALLET_ID: rowData.PALLET_ID,
                P_INBOUND_SEQ: rowData.INBOUND_SEQ,
                P_ENTRY_QTY: rowData.ENTRY_QTY,
                P_VALID_DATE: rowData.VALID_DATE,
                P_BATCH_NO: rowData.BATCH_NO,
                P_CRUD_FLAG: rowData.CRUD
            });
        }
        dsSub = dsD.concat(dsCU);

        if (dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.RIM02010E1.036", "데이터 수정 후 저장하십시오."));
            return;
        }

        var refRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
        $NC.serviceCall("/RIM02010E0/saveDirectionsPltId.do", {
            P_DS_MASTER: {
                P_CENTER_CD: refRowData.CENTER_CD,
                P_BU_CD: refRowData.BU_CD,
                P_INBOUND_DATE: refRowData.INBOUND_DATE,
                P_INBOUND_NO: refRowData.INBOUND_NO,
                P_LINE_NO: "",
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_PROCESS_CD: $NC.G_VAR.activeView.PROCESS_CD,
                P_CHECK_STATE: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM
            },
            P_DS_SUB: dsSub,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSaveC);
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _DeleteC() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _CancelC() {

}

function onProcessPreC() {

    var rCount = G_GRDMASTERC.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.022", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.023", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.RIM02010E1.037", "반입지시 취소 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERC.view.getEditorLock().isActive()) {
        G_GRDMASTERC.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERC.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 반입지시 상태인 전표만 대상
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
        alert($NC.getDisplayMsg("JS.RIM02010E1.038", "반입지시 취소 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.039", "선택한 데이터 중 반입지시 취소 처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/RIM02010E0/callRIProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_DIRECTIONS,
        P_DIRECTION: $ND.C_DIRECTION_BW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessC, onSaveErrorC, 2);
}

function onProcessNxtC() {

    var rCount = G_GRDMASTERC.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.022", "조회 후 처리하십시오."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.023", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.RIM02010E1.040", "반입지시 처리하시겠습니까?"))) {
        return;
    }

    if (G_GRDMASTERC.view.getEditorLock().isActive()) {
        G_GRDMASTERC.view.getEditorLock().commitCurrentEdit();
    }

    if ($NC.isGridModified(G_GRDSUBC)) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.041", "데이터가 수정되었습니다. 저장 후 반입지시 처리하십시오."));
        return;
    }

    var dsMaster = [];
    var PROCESS_STATE = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTERC.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 반입등록 상태인 전표만 대상
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
        alert($NC.getDisplayMsg("JS.RIM02010E1.042", "반입지시 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.043", "선택한 데이터 중 반입지시 처리 가능한 데이터가 없습니다."));
        return;
    }

    $NC.serviceCall("/RIM02010E0/callRIProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_DIRECTIONS,
        P_DIRECTION: $ND.C_DIRECTION_FW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccessC, onSaveErrorC, 2);
}

function btnNewPalletIdCOnClick() {

    if (G_GRDMASTERC.data.getLength() == 0 || $NC.isNull(G_GRDMASTERC.lastRow)) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.022", "조회 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.RIM02010E1.044", "새 파렛트ID를 생성하시겠습니까?"))) {
        return;
    }

    var refRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
    var rowData = G_GRDDETAILC.data.getItem(0);

    $NC.serviceCall("/RIM02010E0/callCMPalletIdGetNo.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_INBOUND_DATE: refRowData.INBOUND_DATE,
        P_INBOUND_NO: refRowData.INBOUND_NO,
        P_INOUT_CD: refRowData.INOUT_CD,
        P_CUST_CD: refRowData.CUST_CD,
        P_VENDOR_CD: refRowData.VENDOR_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_CREATE_DATE: "",
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onGetNewPalletIdC);
}

function onGetNewPalletIdC(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var rowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
    // 파렛트ID 조회
    $NC.serviceCall("/RIM02010E0/getDataSet.do", {
        P_QUERY_ID: "RIM02010E1.RS_T2_SUB1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO,
            P_INOUT_CD: rowData.INOUT_CD
        }
    }, function(subAjaxData) {
        G_GRDPALLETIDC.lastKeyVal = resultData.O_PALLET_ID;
        onGetPalletIdC(subAjaxData);
        G_GRDPALLETIDC.lastKeyVal = "";
    });
}

function btnNewDirectionsCOnClick() {

    if (G_GRDMASTERC.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.022", "조회 후 처리하십시오."));
        return;
    }

    if (G_GRDPALLETIDC.data.getLength() == 0 || $NC.isNull(G_GRDPALLETIDC.lastRow)) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.045", "신규 파렛트ID를 먼저 생성 후 처리하십시오."));
        return;
    }

    // 지시 수정 체크
    if (!$NC.isGridValidLastRow(G_GRDSUBC)) {
        return;
    }

    var rowData = G_GRDDETAILC.data.getItem(G_GRDDETAILC.lastRow);
    if (rowData.ENTRY_QTY == rowData.DIRECTIONS_QTY) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.046", "추가하려는 상품은 이미 등록수량만큼 지시 처리되었습니다."));
        return;
    }

    var searchIndex = $NC.getGridSearchRow(G_GRDSUBC, {
        searchKey: "LINE_NO",
        searchVal: rowData.LINE_NO
    });
    if (searchIndex != -1) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.047", "추가하려는 상품은 해당 파렛트ID에 이미 추가되어 있습니다."));
        $NC.setGridSelectRow(G_GRDSUBC, searchIndex, "ENTRY_QTY", true);
        return;
    }

    var refRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
    var pltRowData = G_GRDPALLETIDC.data.getItem(G_GRDPALLETIDC.lastRow);
    var REMAIN_QTY = Number(rowData.ENTRY_QTY) - Number(rowData.DIRECTIONS_QTY);

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: refRowData.CENTER_CD,
        BU_CD: refRowData.BU_CD,
        INBOUND_DATE: refRowData.INBOUND_DATE,
        INBOUND_NO: refRowData.INBOUND_NO,
        LINE_NO: rowData.LINE_NO,
        INBOUND_SEQ: "",
        LOCATION_CD: "",
        PUTAWAY_LOCATION_CD: "",
        IN_GRP: refRowData.INOUT_SUB_CD,
        INOUT_CD: refRowData.INOUT_CD,
        CUST_CD: refRowData.CUST_CD,
        DELIVERY_CD: refRowData.DELIVERY_CD,
        BRAND_CD: rowData.BRAND_CD,
        ITEM_CD: rowData.ITEM_CD,
        ITEM_STATE: rowData.ITEM_STATE,
        ITEM_LOT: rowData.ITEM_LOT,
        VALID_DATE: rowData.VALID_DATE,
        BATCH_NO: rowData.BATCH_NO,
        PALLET_ID: pltRowData.PALLET_ID,
        STOCK_ID: "",
        ENTRY_QTY: REMAIN_QTY,
        CONFIRM_QTY: REMAIN_QTY,
        PUTAWAY_QTY: REMAIN_QTY,
        DIRECTIONS_USER_ID: "",
        DIRECTIONS_DATETIME: "",
        ITEM_BAR_CD: rowData.ITEM_BAR_CD,
        ITEM_NM: rowData.ITEM_NM,
        ITEM_SPEC: rowData.ITEM_SPEC,
        BRAND_NM: rowData.BRAND_NM,
        ITEM_STATE_F: rowData.ITEM_STATE_F,
        QTY_IN_BOX: rowData.QTY_IN_BOX,
        BOX_WEIGHT: rowData.BOX_WEIGHT,
        ENTRY_BOX: $NC.getBBox(REMAIN_QTY, rowData.QTY_IN_BOX),
        ENTRY_EA: $NC.getBEa(REMAIN_QTY, rowData.QTY_IN_BOX),
        ENTRY_WEIGHT: $NC.getWeight(REMAIN_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT),
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDSUBC, newRowData);
}

function btnDeleteDirectionsCOnClick() {

    if (G_GRDSUBC.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.RIM02010E1.048", "삭제하려는 데이터를 선택하십시오."));
        return;
    }

    // 마지막 데이터가 신규 데이터일 경우 data에서 삭제하고 등록된 데이터면 CRUD만 "D"로 변경
    var refRowData = G_GRDSUBC.data.getItem(G_GRDSUBC.lastRow);
    $NC.deleteGridRowData(G_GRDSUBC, refRowData, true);

    // 디테일 지시수량 업데이트
    var S0_ENTRY_QTY = 0;
    // 반입지시 전체 데이터를 기준으로 지시수량 SUM
    var dsTarget = G_GRDSUBC.data.getItems();
    var rowData, rIndex, rCount;
    for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD != $ND.C_DV_CRUD_D && refRowData.LINE_NO == rowData.LINE_NO) {
            S0_ENTRY_QTY += Number(rowData.ENTRY_QTY);
        }
    }

    // 디테일에 해당 LINE_NO를 검색하여 등록 수량 가져오기
    rowData = null;
    for (rIndex = 0, rCount = G_GRDDETAILC.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAILC.data.getItem(rIndex);
        if (refRowData.LINE_NO == rowData.LINE_NO) {
            break;
        }
    }
    if ($NC.isNotNull(rowData)) {
        rowData.DIRECTIONS_QTY = S0_ENTRY_QTY;
        G_GRDDETAILC.data.updateItem(rowData.id, rowData);
    }
}

function grdMasterCOnGetColumns() {

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
        name: "반입번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "반입구분"
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
        id: "TOT_ENTRY_QTY",
        field: "TOT_ENTRY_QTY",
        name: "총수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
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
        id: "PALLET_ID_CNT",
        field: "PALLET_ID_CNT",
        name: "파렛트ID수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterCInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareKey: "INBOUND_STATE",
            compareVal: $ND.C_STATE_DIRECTIONS,
            compareOperator: ">=",
            cssClass: "styDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMasterC", {
        columns: grdMasterCOnGetColumns(),
        queryId: "RIM02010E1.RS_T2_MASTER",
        sortCol: "INBOUND_NO",
        gridOptions: options
    });

    G_GRDMASTERC.view.onSelectedRowsChanged.subscribe(grdMasterCOnAfterScroll);
    G_GRDMASTERC.view.onHeaderClick.subscribe(grdMasterCOnHeaderClick);
    G_GRDMASTERC.view.onClick.subscribe(grdMasterCOnClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTERC, "CHECK_YN");
}

function grdMasterCOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTERC, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTERC.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAILC);
    G_GRDDETAILC.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/RIM02010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAILC), onGetDetailC);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDPALLETIDC);
    G_GRDPALLETIDC.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO,
        P_INOUT_CD: rowData.INOUT_CD
    };
    // 데이터 조회
    $NC.serviceCall("/RIM02010E0/getDataSet.do", $NC.getGridParams(G_GRDPALLETIDC), onGetPalletIdC);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDSUBC);
    G_GRDSUBC.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/RIM02010E0/getDataSet.do", $NC.getGridParams(G_GRDSUBC), onGetSubC);

    // 입고지시 수정 가능 여부 -> 진행상태: 20
    var canEdit = rowData.INBOUND_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
    G_GRDSUBC.view.setOptions({
        editable: canEdit,
        autoEdit: canEdit
    });

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTERC, row + 1);
}

function grdMasterCOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTERC, e, args);
            break;
    }
}

function grdMasterCOnClick(e, args) {

    var columnId = G_GRDMASTERC.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTERC, e, args);
            break;
    }
}

function grdDetailCOnGetColumns() {

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
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
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
        id: "BOX_IN_PLT",
        field: "BOX_IN_PLT",
        name: "PLT입수",
        cssClass: "styRight"
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
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "등록BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "등록EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DIRECTIONS_QTY",
        field: "DIRECTIONS_QTY",
        name: "지시수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
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
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
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

function grdDetailCOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDDETAILC, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdDetailCInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.ENTRY_QTY != rowData.DIRECTIONS_QTY) {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetailC", {
        columns: grdDetailCOnGetColumns(),
        queryId: "RIM02010E1.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAILC.view.onSelectedRowsChanged.subscribe(grdDetailCOnAfterScroll);
    // Grid 더블클릭 이벤트
    G_GRDDETAILC.view.onDblClick.subscribe(grdDetailCOnDblClick);
}

function grdDetailCOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAILC, args.rows, e)) {
        return;
    }

    // 지시 수정 체크
    if (!$NC.isGridValidLastRow(G_GRDSUBC, null, e)) {
        $NC.setGridSelectRow(G_GRDDETAILC, G_GRDDETAILC.lastRow);
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAILC.data.getItem(row);

    // [LS220]파렛트ID 사용 기준 : 1 - 파렛트ID 사용 안함
    // [LS220]파렛트ID 사용 기준 : 2 - 파렛트ID 사용 함
    // [RI230]파렛트ID 매핑 기준 : 1 - 파렛트 분할구분별 자동매핑(단일상품)
    // [RI230]파렛트ID 매핑 기준 : 2 - 상품별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 3 - 공급처별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 4 - 파렛트ID 하나로 자동 매핑(멀티상품)
    if ($NC.G_VAR.policyVal.LS220 == "1" || $NC.G_VAR.policyVal.LS220 == "2" && $NC.G_VAR.policyVal.RI230 == "1") {
        $NC.setGridFilterValue(G_GRDSUBC, rowData.LINE_NO);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAILC, row + 1);
}

function grdDetailCOnDblClick(e, args) {

    // [LS220]파렛트ID 사용 기준 : 1 - 파렛트ID 사용 안함
    // [LS220]파렛트ID 사용 기준 : 2 - 파렛트ID 사용 함
    // [RI230]파렛트ID 매핑 기준 : 1 - 파렛트 분할구분별 자동매핑(단일상품)
    // [RI230]파렛트ID 매핑 기준 : 2 - 상품별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 3 - 공급처별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 4 - 파렛트ID 하나로 자동 매핑(멀티상품)
    if ($NC.G_VAR.policyVal.LS220 == "1" || $NC.G_VAR.policyVal.LS220 == "2" && $NC.G_VAR.policyVal.RI230 == "1") {
        return;
    }

    var rowData = G_GRDDETAILC.data.getItem(args.row);
    if ($NC.isNull(rowData)) {
        return;
    }

    btnNewDirectionsCOnClick();
}

function grdSubCOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호",
        initialHidden: true
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
        name: "지시수량",
        cssClass: "styRight",
        editor: null
    }, false);
    $NC.setGridColumn(columns, {
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "지시BOX",
        cssClass: "styRight"
    }, false);
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "지시EA",
        cssClass: "styRight"
    }, false);
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        editor: Slick.Editors.Date,
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
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DIRECTIONS_USER_ID",
        field: "DIRECTIONS_USER_ID",
        name: "지시자ID"
    });
    $NC.setGridColumn(columns, {
        id: "DIRECTIONS_DATETIME",
        field: "DIRECTIONS_DATETIME",
        name: "지시일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubCOnSetColumns() {

    // [LS210]재고 관리 기준 : 1 - 입고일자별 관리
    // [LS210]재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    // [LS220]파렛트ID 사용 기준 : 1 - 파렛트ID 사용 안함
    // [LS220]파렛트ID 사용 기준 : 2 - 파렛트ID 사용 함
    // [RI230]파렛트ID 매핑 기준 : 1 - 파렛트 분할구분별 자동매핑(단일상품)
    // [RI230]파렛트ID 매핑 기준 : 2 - 상품별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 3 - 공급처별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 4 - 파렛트ID 하나로 자동 매핑(멀티상품)

    // 에디터 옵션 변경
    $NC.setGridColumnOptions(G_GRDSUBC, {
        ENTRY_QTY: {
            editor: $NC.G_VAR.policyVal.RI230 == "2" //
                || $NC.G_VAR.policyVal.RI230 == "3" //
                || $NC.G_VAR.policyVal.RI230 == "4" ? Slick.Editors.Number : null
        }
    });

    $NC.setGridColumns(G_GRDSUBC, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS220 == "1" ? "PALLET_ID" : "",
        $NC.G_VAR.policyVal.RI230 == "1" ? "LINE_NO,ITEM_CD,ITEM_BAR_CD,ITEM_NM,ITEM_SPEC,BRAND_NM,ITEM_STATE_F,ITEM_LOT" : "",
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdSubCInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSubC", {
        columns: grdSubCOnGetColumns(),
        queryId: "RIM02010E1.RS_T2_SUB2",
        sortCol: "INBOUND_SEQ",
        gridOptions: options
    });

    G_GRDSUBC.view.onSelectedRowsChanged.subscribe(grdSubCOnAfterScroll);
    G_GRDSUBC.view.onBeforeEditCell.subscribe(grdSubCOnBeforeEditCell);
    G_GRDSUBC.view.onCellChange.subscribe(grdSubCOnCellChange);
}

/**
 * grdSubC 데이터 필터링 이벤트
 */
function grdSubCOnFilter(item) {

    // [LS220]파렛트ID 사용 기준 : 1 - 파렛트ID 사용 안함
    // [LS220]파렛트ID 사용 기준 : 2 - 파렛트ID 사용 함
    // [RI230]파렛트ID 매핑 기준 : 1 - 파렛트 분할구분별 자동매핑(단일상품)
    // [RI230]파렛트ID 매핑 기준 : 2 - 상품별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 3 - 공급처별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 4 - 파렛트ID 하나로 자동 매핑(멀티상품)
    if ($NC.G_VAR.policyVal.LS220 == "1" || $NC.G_VAR.policyVal.LS220 == "2" && $NC.G_VAR.policyVal.RI230 == "1") {
        return item.CRUD != $ND.C_DV_CRUD_D && G_GRDSUBC.lastFilterVal == item.LINE_NO;
    } else {
        return item.CRUD != $ND.C_DV_CRUD_D && G_GRDSUBC.lastFilterVal == item.PALLET_ID;
    }
}

/**
 * @param args
 *        row: activeRow, rowData: item
 */
function grdSubCOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDSUBC, args.row, "ENTRY_QTY", true);
}

/**
 * @param e
 * @param args
 *        row: activeRow, cell: activeCell, item: item
 */
function grdSubCOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDSUBC.view.getColumnId(args.cell)) {
        case "ENTRY_QTY":
            var ENTRY_QTY = Number(rowData.ENTRY_QTY);
            if (ENTRY_QTY < 0) {
                alert($NC.getDisplayMsg("JS.RIM02010E1.049", "지시수량이 0보다 작을 수 없습니다."));
                rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                rowData.ENTRY_BOX = args.oldItem.ENTRY_BOX;
                rowData.ENTRY_EA = args.oldItem.ENTRY_EA;
                rowData.ENTRY_WEIGHT = args.oldItem.ENTRY_WEIGHT;
                $NC.setFocusGrid(G_GRDSUBC, args.row, args.cell, true);
                break;
            }

            // 디테일에 해당 LINE_NO를 검색하여 등록 수량 가져오기
            var searchIndex = $NC.getGridSearchRow(G_GRDDETAILC, {
                searchKey: "LINE_NO",
                searchVal: rowData.LINE_NO
            });
            if (searchIndex == -1) {
                alert($NC.getDisplayMsg("JS.RIM02010E1.050", "상세정보에서 해당 상품을 검색하지 못해 지시수량을 반영하지 못했습니다."));
                rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                rowData.ENTRY_BOX = args.oldItem.ENTRY_BOX;
                rowData.ENTRY_EA = args.oldItem.ENTRY_EA;
                rowData.ENTRY_WEIGHT = args.oldItem.ENTRY_WEIGHT;
                $NC.setFocusGrid(G_GRDSUBC, args.row, args.cell, true);
                break;
            }

            var refRowData = G_GRDDETAILC.data.getItem(searchIndex);
            var D_ENTRY_QTY = Number(refRowData.ENTRY_QTY);
            // 입고지시 전체 데이터를 기준으로 지시수량 SUM
            var S0_ENTRY_QTY = $NC.getGridSumVal(G_GRDSUBC, {
                searchKey: [
                    "LINE_NO",
                    "CRUD"
                ],
                searchVal: [
                    rowData.LINE_NO,
                    [
                        $ND.C_DV_CRUD_C,
                        $ND.C_DV_CRUD_U,
                        $ND.C_DV_CRUD_R,
                        $ND.C_DV_CRUD_N
                    ]
                ],
                sumKey: "ENTRY_QTY",
                isAllData: true
            });

            if (D_ENTRY_QTY < S0_ENTRY_QTY) {
                alert($NC.getDisplayMsg("JS.RIM02010E1.051", "지시수량이 등록수량보다 클 수 없습니다."));
                rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                rowData.ENTRY_BOX = args.oldItem.ENTRY_BOX;
                rowData.ENTRY_EA = args.oldItem.ENTRY_EA;
                rowData.ENTRY_WEIGHT = args.oldItem.ENTRY_WEIGHT;
                $NC.setFocusGrid(G_GRDSUBC, args.row, args.cell, true);
                break;
            }

            // 디테일 지시수량 업데이트
            refRowData.DIRECTIONS_QTY = S0_ENTRY_QTY;
            if (Number(refRowData.ENTRY_QTY) < refRowData.DIRECTIONS_QTY) {
                refRowData.DIRECTIONS_QTY = refRowData.ENTRY_QTY;
            }
            G_GRDDETAILC.data.updateItem(refRowData.id, refRowData);

            rowData.ENTRY_BOX = $NC.getBBox(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
            rowData.ENTRY_EA = $NC.getBEa(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
            rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(rowData.VALID_DATE)) {
                if (!$NC.isDate(rowData.VALID_DATE)) {
                    alert($NC.getDisplayMsg("JS.RIM02010E1.052", "유통기한을 정확히 입력하십시오."));
                    rowData.VALID_DATE = "";
                    $NC.setFocusGrid(G_GRDSUBC, args.row, args.cell, true);
                } else {
                    rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUBC, rowData);
}

function grdSubCOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUBC, row)) {
        return true;
    }

    var rowData = G_GRDSUBC.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ENTRY_QTY)) {
            alert($NC.getDisplayMsg("JS.RIM02010E1.053", "지시수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ENTRY_QTY", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUBC, rowData);
    return true;
}

/**
 * @param e
 *        Event Handler
 * @param args
 *        row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdSubCOnBeforeEditCell(e, args) {

    // var rowData = args.item;
    switch (args.column.id) {
        case "ENTRY_QTY":
            return $NC.G_VAR.policyVal.RI230 == "2" || $NC.G_VAR.policyVal.RI230 == "3" || $NC.G_VAR.policyVal.RI230 == "4"; // 멀티상품
        case "VALID_DATE":
        case "BATCH_NO":
            return $NC.G_VAR.policyVal.LS210 == "2";
    }
    return true;
}

function grdSubCOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUBC, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUBC, row + 1);
}

function grdPalletIdCOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdPalletIdCInitialize() {

    var options = {};

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdPalletIdC", {
        columns: grdPalletIdCOnGetColumns(),
        queryId: "RIM02010E1.RS_T2_SUB1",
        sortCol: "PALLET_ID",
        gridOptions: options
    });

    G_GRDPALLETIDC.view.onSelectedRowsChanged.subscribe(grdPalletIdCOnAfterScroll);
}

function grdPalletIdCOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDPALLETIDC, args.rows, e)) {
        return;
    }

    // 지시 수정 체크
    if (!$NC.isGridValidLastRow(G_GRDSUBC, null, e)) {
        $NC.setGridSelectRow(G_GRDPALLETIDC, G_GRDPALLETIDC.lastRow);
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDPALLETIDC.data.getItem(row);

    $NC.setGridFilterValue(G_GRDSUBC, rowData.PALLET_ID);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDPALLETIDC, row + 1);
}

function onGetMasterC(ajaxData) {

    $NC.setInitGridData(G_GRDMASTERC, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTERC, "INBOUND_NO", true)) {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAILC);
        // 파렛트ID 초기화
        $NC.clearGridData(G_GRDPALLETIDC);
        // 반입지시 초기화
        $NC.clearGridData(G_GRDSUBC);
    }

    // 전표 건수 정보 업데이트
    window.setMasterSummaryInfo();

    // 공통 버튼 활성화
    window.setTopButtons();
}

function onGetDetailC(ajaxData) {

    $NC.setInitGridData(G_GRDDETAILC, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAILC);
}

function onGetSubC(ajaxData) {

    var rowData;
    // [LS220]파렛트ID 사용 기준 : 1 - 파렛트ID 사용 안함
    // [LS220]파렛트ID 사용 기준 : 2 - 파렛트ID 사용 함
    // [RI230]파렛트ID 매핑 기준 : 1 - 파렛트 분할구분별 자동매핑(단일상품)
    // [RI230]파렛트ID 매핑 기준 : 2 - 상품별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 3 - 공급처별 자동 매핑(멀티상품)
    // [RI230]파렛트ID 매핑 기준 : 4 - 파렛트ID 하나로 자동 매핑(멀티상품)
    if ($NC.G_VAR.policyVal.LS220 == "1" || $NC.G_VAR.policyVal.LS220 == "2" && $NC.G_VAR.policyVal.RI230 == "1") {
        rowData = G_GRDDETAILC.data.getItem(G_GRDDETAILC.lastRow);
        $NC.setGridFilterValue(G_GRDSUBC, $NC.isNull(rowData) ? null : rowData.LINE_NO);
    } else {
        rowData = G_GRDPALLETIDC.data.getItem(G_GRDPALLETIDC.lastRow);
        $NC.setGridFilterValue(G_GRDSUBC, $NC.isNull(rowData) ? null : rowData.PALLET_ID);
    }

    $NC.setInitGridData(G_GRDSUBC, ajaxData, grdSubCOnFilter);
    $NC.setInitGridAfterOpen(G_GRDSUBC);
}

function onGetPalletIdC(ajaxData) {

    $NC.setInitGridData(G_GRDPALLETIDC, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDPALLETIDC, "PALLET_ID");
}

function onSaveC(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERC, {
        selectKey: "INBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERC.lastKeyVal = lastKeyVal;
}

function onSaveErrorC(ajaxData) {

    $NC.onError(ajaxData);
    window.setMasterSummaryInfo();
}

function onSuccessC(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        // 선택 처리, 오류 메시지 표시 후 재조회
        // return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERC, {
        selectKey: "INBOUND_NO"
    });
    window._Inquiry();
    G_GRDMASTERC.lastKeyVal = lastKeyVal;
}