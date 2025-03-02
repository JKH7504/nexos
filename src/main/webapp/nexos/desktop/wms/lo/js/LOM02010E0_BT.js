/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _InquiryBT(args) {

    // 출고가능 표시 란 클리어
    clearAdjustQtyInfo();
    // 출고일자는 조회용 출고일자가 아닌 처리용 출고일자로 지정
    var OUTBOUND_DATE_BT = $NC.getValue("#dtpOutbound_DateBT");
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERBT);
    // 파라메터 세팅
    G_GRDMASTERBT.queryParams = {
        P_CENTER_CD: args.CENTER_CD,
        P_BU_CD: args.BU_CD,
        P_ORDER_DATE1: args.ORDER_DATE1,
        P_ORDER_DATE2: args.ORDER_DATE2,
        P_INOUT_CD: args.INOUT_CD,
        P_BU_NO: args.BU_NO,
        P_SO_NO: args.SO_NO,
        P_BRAND_CD: args.BRAND_CD,
        P_ITEM_CD: args.ITEM_CD,
        P_ITEM_NM: args.ITEM_NM,
        P_OUTBOUND_DIV: "2", // 2: 온라인출고
        P_CAR_DIV: args.CAR_DIV,
        P_DELIVERY_CD: args.DELIVERY_CD,
        P_RDELIVERY_CD: "",
        P_RDELIVERY_DIV: "",
        P_ERP_BATCH: args.ERP_BATCH,
        P_DISTRIBUTE_DIV: $ND.C_ALL,
        P_ORDERER_NM: args.ORDERER_NM,
        P_SHIPPER_NM: args.SHIPPER_NM,
        P_OUTBOUND_DATE: OUTBOUND_DATE_BT, // args.OUTBOUND_DATE,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    // 데이터 조회
    $NC.serviceCall("/LOM02010E0/getDataSetEntryBT.do", $NC.getGridParams(G_GRDMASTERBT), onGetMasterBT, null, 2);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _NewBT() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _SaveBT() {

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _DeleteBT() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _CancelBT() {

}

function onProcessPreBT() {

    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.028", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.011", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.012", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE_BT = $NC.getValue("#dtpOutbound_DateBT");
    if ($NC.isNull(OUTBOUND_DATE_BT)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.013", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpOutbound_DateBT");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    if ($NC.isNull(INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.016", "출고구분을 선택하십시오."));
        $NC.setFocus("#cboQInout_Cd");
        return;
    }

    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var SO_NO = $NC.getValue("#edtQSo_No", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    var CAR_DIV = $NC.getValue("#cboQCar_Div", true);
    var ERP_BATCH = $NC.getValue("#cboQErp_Batch", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
    var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);

    var DELIVERY_BATCH;
    var DELIVERY_BATCH_F;
    if ($NC.G_VAR.policyVal.LO721 == $ND.C_YES) {
        DELIVERY_BATCH = $NC.getValue("#cboDelivery_BatchBT");
        DELIVERY_BATCH_F = $NC.getValueCombo("#cboDelivery_BatchBT", "F");
    }

    if ($NC.isNotNull(DELIVERY_BATCH_F)) {
        if (!confirm($NC.getDisplayMsg("JS.LOM02010E0.041", "출고등록 일괄 취소 처리하시겠습니까?\n운송차수(" + DELIVERY_BATCH_F + ")", DELIVERY_BATCH_F))) {
            return;
        }
    } else {
        if (!confirm($NC.getDisplayMsg("JS.LOM02010E0.042", "출고등록 일괄 취소 처리하시겠습니까?"))) {
            return;
        }
    }

    var dsMaster = [
        {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE_BT,
            P_DELIVERY_BATCH: DELIVERY_BATCH,
            P_INOUT_CD: INOUT_CD,
            P_BU_NO: BU_NO,
            P_SO_NO: SO_NO,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_OUTBOUND_DIV: "2", // 2: 온라인출고
            P_CAR_DIV: CAR_DIV,
            P_ERP_BATCH: ERP_BATCH,
            P_DELIVERY_CD: DELIVERY_CD,
            P_RDELIVERY_CD: "",
            P_RDELIVERY_DIV: "",
            P_DISTRIBUTE_DIV: $ND.C_ALL,
            P_ORDERER_NM: ORDERER_NM,
            P_SHIPPER_NM: SHIPPER_NM
        }
    ];

    $NC.serviceCall("/LOM02010E0/callLOProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_ENTRY_BATCH,
        P_DIRECTION: $ND.C_DIRECTION_BW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD.substr(0, 1)].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD.substr(0, 1)].CANCEL,
        // -- PROCESS_ENTRY, DIRECTION_FW 처리에 사용 -------
        P_OUTBOUND_DATE_B: "",
        P_DELIVERY_BATCH: "",
        P_DELIVERY_BATCH_NM: "",
        P_ENTRY_BATCH_DIV: "1", // 취소는 일괄로 처리
        // -- PROCESS_DIRECTIONS, DIRECTION_FW 처리에 사용 --
        P_OUTBOUND_BATCH: "",
        P_OUTBOUND_BATCH_NM: "",
        P_DIRECTIONS_DIV: "",
        P_EQUIP_DIV: "",
        // --------------------------------------------------
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onEntryBatchSuccess, onEntryBatchError, 2);
}

function onProcessNxtBT() {

    if (G_GRDMASTERBT.data.getItems().length == 0) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.042", "일괄등록 처리할 대상이 없습니다."));
        return;
    }
    if ($NC.G_VAR.PROCESS_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.028", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록 후 처리하십시오."));
        return;
    }

    if (!$NC.isGridValidLastRow(G_GRDDETAILBT)) {
        return;
    }

    if (G_GRDDETAILBT.isCellChangeError) {
        return;
    }

    // 디테일 수정여부 체크, 수정시 자동 저장 처리
    if ($NC.isGridModified(G_GRDDETAILBT)) {
        if (!saveEntryBT()) {
            return;
        }
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.011", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.012", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    if ($NC.isNull(ORDER_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.014", "출고예정 검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }
    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    if ($NC.isNull(ORDER_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.015", "출고예정 검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date2");
        return;
    }
    var OUTBOUND_DATE_BT = $NC.getValue("#dtpOutbound_DateBT");
    if ($NC.isNull(OUTBOUND_DATE_BT)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.013", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpOutbound_DateBT");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    if ($NC.isNull(INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.016", "출고구분을 선택하십시오."));
        $NC.setFocus("#cboQInout_Cd");
        return;
    }

    var DELIVERY_BATCH;
    var DELIVERY_BATCH_NM;
    var DELIVERY_BATCH_F;
    if ($NC.G_VAR.policyVal.LO721 == $ND.C_YES) {
        DELIVERY_BATCH = $NC.getValue("#cboDelivery_BatchBT");
        DELIVERY_BATCH_NM = $NC.getValue("#edtDelivery_Batch_NmBT", "");
        DELIVERY_BATCH_F = $NC.getValueCombo("#cboDelivery_BatchBT", "F");
        if ($NC.isNull(DELIVERY_BATCH)) {
            DELIVERY_BATCH = $ND.C_BASE_BATCH_NO;
            DELIVERY_BATCH_NM = "";
        }
    }

    if ($NC.isNotNull(DELIVERY_BATCH_F)) {
        if (!confirm($NC.getDisplayMsg("JS.LOM02010E0.046", "출고등록 일괄처리하시겠습니까?\n운송차수(" + DELIVERY_BATCH_F + ")", DELIVERY_BATCH_F))) {
            return;
        }
    } else {
        if (!confirm($NC.getDisplayMsg("JS.LOM02010E0.047", "출고등록 일괄처리하시겠습니까?"))) {
            return;
        }
    }

    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var SO_NO = $NC.getValue("#edtQSo_No", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

    var CAR_DIV = $NC.getValue("#cboQCar_Div", true);
    var ERP_BATCH = $NC.getValue("#cboQErp_Batch", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
    var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);

    var dsMaster = [];
    // 개별등록
    var queryParams = {
        P_QUERY_ID: "LOM02010E0.RS_T1B_SUB1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ORDER_DATE1: ORDER_DATE1,
            P_ORDER_DATE2: ORDER_DATE2,
            P_INOUT_CD: INOUT_CD,
            P_BU_NO: BU_NO,
            P_SO_NO: SO_NO,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_CAR_DIV: CAR_DIV,
            P_ERP_BATCH: ERP_BATCH,
            P_DELIVERY_CD: DELIVERY_CD,
            P_ORDERER_NM: ORDERER_NM,
            P_SHIPPER_NM: SHIPPER_NM
        }
    }, serviceCallError = false, dsResult;
    $NC.serviceCallAndWait("/LOM02010E0/getDataSet.do", queryParams, function(ajaxData) {
        dsResult = $NC.toArray(ajaxData);
    }, function(ajaxData) {
        $NC.onError(ajaxData);
        serviceCallError = true;
    });
    if (serviceCallError) {
        return;
    }

    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM02010E0_BT.XXX", "출고등록 처리 가능한 데이터가 없습니다."));
        return;
    }

    var rowData;
    for (var rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
        rowData = dsResult[rIndex];
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.ORDER_DATE,
            P_OUTBOUND_NO: rowData.ORDER_NO
        });
    }
    // // 일괄등록
    // dsMaster.push({
    // P_CENTER_CD: CENTER_CD,
    // P_BU_CD: BU_CD,
    // P_ORDER_DATE1: ORDER_DATE1,
    // P_ORDER_DATE2: ORDER_DATE2,
    // P_INOUT_CD: INOUT_CD,
    // P_BU_NO: BU_NO,
    // P_BRAND_CD: BRAND_CD,
    // P_ITEM_CD: ITEM_CD,
    // P_ITEM_NM: ITEM_NM,
    // P_OUTBOUND_DIV: "2", // 2: 온라인출고
    // P_DELIVERY_CD: DELIVERY_CD,
    // P_RDELIVERY_CD: "",
    // P_RDELIVERY_DIV: "",
    // P_ERP_BATCH: $ND.C_ALL,
    // P_DISTRIBUTE_DIV: $ND.C_ALL,
    // P_ORDERER_NM: ORDERER_NM,
    // P_SHIPPER_NM: SHIPPER_NM,
    // P_OUTBOUND_DATE: OUTBOUND_DATE_BT,
    // P_DELIVERY_BATCH: DELIVERY_BATCH,
    // P_DELIVERY_BATCH_NM: DELIVERY_BATCH_NM
    // });

    $NC.serviceCall("/LOM02010E0/callLOProcessing.do", {
        P_PROCESS_CD: $ND.C_PROCESS_ENTRY_BATCH,
        P_DIRECTION: $ND.C_DIRECTION_FW,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD.substr(0, 1)].CONFIRM,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD.substr(0, 1)].CANCEL,
        // -- PROCESS_ENTRY, DIRECTION_FW 처리에 사용 -------
        P_OUTBOUND_DATE_B: OUTBOUND_DATE_BT,
        P_DELIVERY_BATCH: DELIVERY_BATCH,
        P_DELIVERY_BATCH_NM: DELIVERY_BATCH_NM,
        P_ENTRY_BATCH_DIV: "2", // 일괄조정 후 개별등록
        // -- PROCESS_DIRECTIONS, DIRECTION_FW 처리에 사용 --
        P_OUTBOUND_BATCH: "",
        P_OUTBOUND_BATCH_NM: "",
        P_DIRECTIONS_DIV: "",
        P_EQUIP_DIV: "",
        // --------------------------------------------------
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onEntryBatchSuccess, onEntryBatchError, 2);
}

/**
 * 상품/배송처정보 저장 처리
 * 
 * @returns {Boolean}
 */
function saveEntryBT() {

    var result = true;
    var dsDetail = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAILBT.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAILBT.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_ORDER_DATE: rowData.ORDER_DATE,
            P_ORDER_NO: rowData.ORDER_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_ADJUST_QTY: rowData.ADJUST_QTY,
            P_SHORTAGE_DIV: rowData.SHORTAGE_DIV,
            P_SHORTAGE_COMMENT: rowData.SHORTAGE_COMMENT,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsDetail.length > 0) {
        $NC.serviceCallAndWait("/LOM02010E0/saveEntryBT.do", {
            P_DS_DETAIL: dsDetail,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, null, function(ajaxData) {
            $NC.onError(ajaxData);
            result = false;
        });
    }

    return result;
}

function grdMasterBTOnGetColumns() {

    var columns = [];
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
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_UNIT_DIV_F",
        field: "OUT_UNIT_DIV_F",
        name: "출고단위"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
        name: "예정EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_QTY",
        field: "ADJUST_QTY",
        name: "출고조정량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_BOX",
        field: "ADJUST_BOX",
        name: "출고조정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_EA",
        field: "ADJUST_EA",
        name: "출고조정EA",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 출고등록(일괄) 마스터 그리드 초기화
 */
function grdMasterBTInitialize() {

    var options = {
        specialRow: {
            compareKey: "ADJUST_QTY",
            compareCol: "ORDER_QTY",
            compareOperator: "!=",
            cssClass: "styDiff"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMasterBT", {
        columns: grdMasterBTOnGetColumns(),
        queryId: "LOM02010E0.RS_T1B_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options,
        onFilter: grdMasterBTOnFilter
    });

    G_GRDMASTERBT.lastFilterVal = "1";

    G_GRDMASTERBT.view.onSelectedRowsChanged.subscribe(grdMasterBTOnAfterScroll);
}

/**
 * grdMasterBT 데이터 필터링 이벤트
 */
function grdMasterBTOnFilter(item) {

    if ($NC.isNull(G_GRDMASTERBT.lastFilterVal)) {
        return false;
    }
    if (G_GRDMASTERBT.lastFilterVal == "0") {
        return true;
    }

    return Number(item.ORDER_QTY) > Number(item.ADJUST_QTY);
}

function grdMasterBTOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTERBT, args.rows, e)) {
        return;
    }

    G_GRDDETAILBT.isCellChangeError = false;
    if (!$NC.isGridValidLastRow(G_GRDDETAILBT, null, e)) {
        G_GRDDETAILBT.isCellChangeError = false;
        $NC.setGridSelectRow(G_GRDMASTERBT, G_GRDMASTERBT.lastRow);
        return;
    }

    if (G_GRDDETAILBT.isCellChangeError) {
        e.stopImmediatePropagation();
        G_GRDDETAILBT.isCellChangeError = false;
        $NC.setGridSelectRow(G_GRDMASTERBT, G_GRDMASTERBT.lastRow);
        return;
    }

    // 디테일 수정여부 체크, 수정시 자동 저장 처리
    if ($NC.isGridModified(G_GRDDETAILBT)) {
        if (!saveEntryBT()) {
            $NC.setGridSelectRow(G_GRDMASTERBT, G_GRDMASTERBT.lastRow);
            e.stopImmediatePropagation();
            return;
        }
    }

    // 검색구분 -> 재고부족상품 선택시 재고부족이 없을 경우에 대한 처리
    if (G_GRDMASTERBT.data.getLength() == 0) {
        $NC.clearGridData(G_GRDDETAILBT);

        // 상단 현재로우/총건수 업데이트
        $NC.setGridDisplayRows(G_GRDMASTERBT, 0, 0);
        return;
    }

    var row = args.rows[0];
    var rowData = G_GRDMASTERBT.data.getItem(row);
    var refRowData = G_GRDMASTERBT.queryParams;

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAILBT);
    G_GRDDETAILBT.queryParams = {
        P_CENTER_CD: refRowData.P_CENTER_CD,
        P_BU_CD: refRowData.P_BU_CD,
        P_ORDER_DATE1: refRowData.P_ORDER_DATE1,
        P_ORDER_DATE2: refRowData.P_ORDER_DATE2,
        P_INOUT_CD: refRowData.P_INOUT_CD,
        P_BU_NO: refRowData.P_BU_NO,
        P_SO_NO: refRowData.P_SO_NO,
        P_CAR_DIV: refRowData.P_CAR_DIV,
        P_DELIVERY_CD: refRowData.P_DELIVERY_CD,
        P_ORDERER_NM: refRowData.P_ORDERER_NM,
        P_SHIPPER_NM: refRowData.P_SHIPPER_NM,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT
    };
    // 데이터 조회
    $NC.serviceCall("/LOM02010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAILBT), onGetDetailBT);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTERBT, row + 1);
}

function grdDetailBTOnGetColumns() {

    var columns = [];
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
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "OUT_UNIT_DIV_F",
        field: "OUT_UNIT_DIV_F",
        name: "출고단위"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
        name: "예정EA",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_QTY",
        field: "ADJUST_QTY",
        name: "조정수량",
        editor: Slick.Editors.Number,
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_BOX",
        field: "ADJUST_BOX",
        name: "조정BOX",
        editor: Slick.Editors.Number,
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_EA",
        field: "ADJUST_EA",
        name: "조정EA",
        editor: Slick.Editors.Number,
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "SHORTAGE_DIV_F",
        field: "SHORTAGE_DIV_F",
        name: "미출고사유",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "SHORTAGE_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "SHORTAGE_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "SHORTAGE_COMMENT",
        field: "SHORTAGE_COMMENT",
        name: "미출고사유내역",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "ACS_ERROR_CD_D",
        field: "ACS_ERROR_CD_D",
        name: "주소정제상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_CD_F",
        field: "CARRIER_CD_F",
        name: "운송사"
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
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
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
        id: "SO_DATE",
        field: "SO_DATE",
        name: "주문일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SO_NO",
        field: "SO_NO",
        name: "주문번호"
    });
    $NC.setGridColumn(columns, {
        id: "ACS_ERROR_MSG_D",
        field: "ACS_ERROR_MSG_D",
        name: "주소정제오류메시지"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailBTInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1,
        specialRow: {
            compareKey: "ADJUST_QTY",
            compareCol: "ORDER_QTY",
            compareOperator: "!=",
            cssClass: "styDiff"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetailBT", {
        columns: grdDetailBTOnGetColumns(),
        queryId: "LOM02010E0.RS_T1B_DETAIL",
        sortCol: "ORDER_DATE",
        gridOptions: options
    });

    G_GRDDETAILBT.view.onSelectedRowsChanged.subscribe(grdDetailBTOnAfterScroll);
    G_GRDDETAILBT.view.onBeforeEditCell.subscribe(grdDetailBTOnBeforeEditCell);
    G_GRDDETAILBT.view.onCellChange.subscribe(grdDetailBTOnCellChange);
}

function grdDetailBTOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAILBT, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAILBT, row + 1);
}

/**
 * @param e
 *        Event Handler
 * @param args
 *        row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdDetailBTOnBeforeEditCell(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        // 예정수량 > 조정수량일 경우 미출고사유및내역 입력 가능
        case "SHORTAGE_DIV_F":
        case "SHORTAGE_COMMENT":
            return Number(rowData.ORDER_QTY) > Number(rowData.ADJUST_QTY);
    }
    return true;
}

/**
 * @param e
 * @param args
 *        row: activeRow, cell: activeCell, item: item
 */
function grdDetailBTOnCellChange(e, args) {

    G_GRDDETAILBT.isCellChangeError = false;
    var rowData = args.item;
    var columnId = G_GRDDETAILBT.view.getColumnId(args.cell);
    switch (columnId) {
        case "ADJUST_QTY":
        case "ADJUST_BOX":
        case "ADJUST_EA":
            rowData = grdDetailBTOnCalc(rowData, columnId);
            // 수량조정정보/출고가능정보 표시
            setAdjustQtyInfo(false);
            if (Number(rowData.ORDER_QTY) < Number(rowData.ADJUST_QTY)) {
                alert($NC.getDisplayMsg("JS.LOM02010E0.048", "조정수량이 예정수량보다 클 수 없습니다."));

                G_GRDDETAILBT.isCellChangeError = true;
                rowData.ADJUST_QTY = args.oldItem.ADJUST_QTY;
                rowData.ADJUST_BOX = args.oldItem.ADJUST_BOX;
                rowData.ADJUST_EA = args.oldItem.ADJUST_EA;
                $NC.setFocusGrid(G_GRDDETAILBT, args.row, args.cell, true);

                // 수량조정정보/출고가능정보 표시
                setAdjustQtyInfo(false);
            } else if (Number($NC.getValue("#edtAdjust_Qty")) > Number($NC.getValue("#edtPStock_Qty"))) {
                alert($NC.getDisplayMsg("JS.LOM02010E0.049", "출고가능량을 초과해서 조정할 수 없습니다."));

                G_GRDDETAILBT.isCellChangeError = true;
                rowData.ADJUST_QTY = args.oldItem.ADJUST_QTY;
                rowData.ADJUST_BOX = args.oldItem.ADJUST_BOX;
                rowData.ADJUST_EA = args.oldItem.ADJUST_EA;
                $NC.setFocusGrid(G_GRDDETAILBT, args.row, args.cell, true);

                // 수량조정정보/출고가능정보 표시
                setAdjustQtyInfo(false);
            } else {
                rowData.ADJUST_BOX = $NC.getBBox(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
                rowData.ADJUST_EA = $NC.getBEa(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
            }

            var ADJUST_QTY = Number($NC.getValue("#edtAdjust_Qty"));
            var refRowData = G_GRDMASTERBT.data.getItem(G_GRDMASTERBT.lastRow);
            if (refRowData && refRowData.ADJUST_QTY != ADJUST_QTY) {
                refRowData.ADJUST_QTY = ADJUST_QTY;
                refRowData.ADJUST_BOX = $NC.getBBox(refRowData.ADJUST_QTY, refRowData.QTY_IN_BOX);
                refRowData.ADJUST_EA = $NC.getBEa(refRowData.ADJUST_QTY, refRowData.QTY_IN_BOX);

                G_GRDMASTERBT.data.updateItem(refRowData.id, refRowData);
            }

            if (Number(rowData.ORDER_QTY) == Number(rowData.ADJUST_QTY)) {
                rowData.SHORTAGE_DIV = "";
                rowData.SHORTAGE_DIV_F = "";
                rowData.SHORTAGE_COMMENT = "";
            }

            // 예정수량 > 등록수량 일때 미출고사유 '01 - 재고부족' 으로 기본셋팅
            if (Number(rowData.ORDER_QTY) > Number(rowData.ADJUST_QTY) && $NC.isNull(rowData.SHORTAGE_DIV)) {
                rowData.SHORTAGE_DIV = "01";
                rowData.SHORTAGE_DIV_F = $NC.getGridComboName(G_GRDDETAILBT, {
                    columnId: "SHORTAGE_DIV_F",
                    searchVal: "01",
                    dataCodeField: "COMMON_CD",
                    dataFullNameField: "COMMON_CD_F"
                });
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAILBT, rowData);
}

/**
 * 입력체크
 */
function grdDetailBTOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAILBT, row)) {
        return true;
    }

    var rowData = G_GRDDETAILBT.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        var ORDER_QTY = Number(rowData.ORDER_QTY);
        var ADJUST_QTY = Number(rowData.ADJUST_QTY);
        if (ORDER_QTY > ADJUST_QTY && $NC.isNull(rowData.SHORTAGE_DIV)) {
            alert($NC.getDisplayMsg("JS.LOM02010E0.050", "미출고사유를 선택하십시오."));
            $NC.setFocusGrid(G_GRDDETAILBT, row, "SHORTAGE_DIV_F", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAILBT, rowData);
    return true;
}

function grdOutwaitOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "출고처"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "출고처명"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "출고대기수량",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdOutwaitInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdOutwait", {
        columns: grdOutwaitOnGetColumns(),
        queryId: "LOM02010E0.RS_SUB1",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDOUTWAIT.view.onSelectedRowsChanged.subscribe(grdOutwaitOnAfterScroll);
}

function grdOutwaitOnAfterScroll(e, args) {

    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDOUTWAIT, row + 1);
}

/**
 * 수량조정정보 Clear
 */
function clearAdjustQtyInfo() {

    $NC.setValue("#edtOrder_Qty");
    $NC.setValue("#edtAdjust_Qty");
    $NC.setValue("#edtReal_PStock_Qty");
    $("#lblReal_PStock_Qty").removeClass("lblNormal lblKey").addClass("lblNormal");
    $("#edtReal_PStock_Qty").removeClass("edtNormal edtKey").addClass("edtNormal");
    $NC.setValue("#edtStock_Qty");
    $NC.setValue("#edtVirtual_Qty");
    $NC.setValue("#edtOut_Wait_Qty");
    $NC.setValue("#edtPStock_Qty");
}

/**
 * 수량조정정보 표시
 */
function setAdjustQtyInfo(withPStock) {

    if ($NC.isNull(G_GRDMASTERBT.lastRow)) {
        clearAdjustQtyInfo();
        return;
    }

    var rowData = G_GRDMASTERBT.data.getItem(G_GRDMASTERBT.lastRow);

    // 수량조정정보 총출고예정 표시
    var ADJUST_QTY = $NC.getGridSumVal(G_GRDDETAILBT, {
        sumKey: "ADJUST_QTY"
    });
    var PSTOCK_QTY = Number(rowData.ORDER_QTY) - ADJUST_QTY;
    $NC.setValue("#edtOrder_Qty", rowData.ORDER_QTY);
    $NC.setValue("#edtAdjust_Qty", ADJUST_QTY);
    $NC.setValue("#edtReal_PStock_Qty", PSTOCK_QTY);

    $("#lblReal_PStock_Qty").removeClass("lblNormal lblKey").addClass(PSTOCK_QTY > 0 ? "lblKey" : "lblNormal");
    $("#edtReal_PStock_Qty").removeClass("edtNormal edtKey").addClass(PSTOCK_QTY > 0 ? "edtKey" : "edtNormal");

    if (!withPStock) {
        return;
    }

    // 데이터 조회
    $NC.serviceCallAndWait("/LOM02010E0/getData.do", {
        P_QUERY_ID: "WF.GET_PSTOCK_QTY",
        P_QUERY_PARAMS: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: rowData.ITEM_LOT,
            P_POLICY_LO310: "",
            P_POLICY_LO320: "",
            // 출고일자 기준
            P_OUTBOUND_DATE: $NC.getValue("#dtpOutbound_DateBT")
        }
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert($NC.getDisplayMsg("JS.LOM02010E0.051", "출고가능량 정보를 가져오지 못했습니다.\n데이터를 다시 선택하십시오."));
            $NC.setValue("#edtStock_Qty", "0");
            $NC.setValue("#edtVirtual_Qty", "0");
            $NC.setValue("#edtOut_Wait_Qty", "0");
            $NC.setValue("#edtPStock_Qty", "0");
            return;
        }

        $NC.setValue("#edtStock_Qty", resultData.O_STOCK_QTY);
        $NC.setValue("#edtVirtual_Qty", resultData.O_VIRTUAL_QTY);
        $NC.setValue("#edtOut_Wait_Qty", resultData.O_OUT_WAIT_QTY);
        $NC.setValue("#edtPStock_Qty", resultData.O_PSTOCK_QTY);
    });
}

function onGetMasterBT(ajaxData) {

    $NC.setInitGridData(G_GRDMASTERBT, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTERBT, [
        "ITEM_CD",
        "ITEM_STATE",
        "ITEM_LOT"
    ], true)) {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAILBT);
    }

    // 공통 버튼 활성화
    window.setTopButtons();
    window.setProcessStateInfo();
    window.setDeliveryBatchCombo();
}

function onGetDetailBT(ajaxData) {

    $NC.setInitGridData(G_GRDDETAILBT, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAILBT);

    // 수량조정정보/출고가능정보 표시
    setAdjustQtyInfo(true);
}

function onSaveBT(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERBT, {
        selectKey: [
            "ITEM_CD",
            "ITEM_STATE",
            "ITEM_LOT"
        ]
    });
    window._Inquiry();
    G_GRDMASTERBT.lastKeyVal = lastKeyVal;
}

function onSaveErrorBT(ajaxData) {

    $NC.onError(ajaxData);
    window.setMasterSummaryInfo();
}

/**
 * 일괄등록/취소 성공시 처리
 */
function onEntryBatchSuccess(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    $NC.setValue("#edtDelivery_Batch_NmBT");
    alert($NC.getDisplayMsg("JS.LOM02010E0.052", "정상적으로 처리 되었습니다."));
    window.setMasterSummaryInfo();
    window._Inquiry();
}

/**
 * 일괄등록/취소 실패시 처리
 */
function onEntryBatchError(ajaxData) {

    $NC.onError(ajaxData);
}

function onGetOutwait(ajaxData) {

    $NC.setInitGridData(G_GRDOUTWAIT, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDOUTWAIT, "OUTBOUND_DATE");
}

/**
 * 출고대기량 조회 버튼 클릭 처리
 * 
 * @param e
 */
function showOutwaitOverlay(e) {

    if ($NC.isVisible("#divOutwaitOverlay")) {
        $("#divOutwaitOverlay").hide();
        return;
    }

    if (G_GRDMASTERBT.data.getLength() == 0 || $NC.isNull(G_GRDMASTERBT.lastRow)) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.053", "출고대기량을 조회할 상품을 선택하십시오."));
        return;
    }

    var rowData = G_GRDMASTERBT.data.getItem(G_GRDMASTERBT.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var OUTBOUND_DATE = $NC.getValue("#dtpOutbound_DateBT");
    var OUTBOUND_NO = rowData.OUTBOUND_NO;
    var BRAND_CD = rowData.BRAND_CD;
    var ITEM_CD = rowData.ITEM_CD;
    var ITEM_STATE = rowData.ITEM_STATE;
    var ITEM_LOT = rowData.ITEM_LOT;

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDOUTWAIT);

    G_GRDOUTWAIT.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_NO: OUTBOUND_NO,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_LOT: ITEM_LOT
    };
    // 데이터 조회
    $NC.serviceCallAndWait("/LOM02010E0/getDataSet.do", $NC.getGridParams(G_GRDOUTWAIT), onGetOutwait);

    if (G_GRDOUTWAIT.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOM02010E0.054", "출고대기 내역이 존재하지 않습니다."));
        return;
    }

    $NC.showOverlay("#divOutwaitOverlay", {
        title: $NC.getDisplayMsg("JS.LOM02010E0.055", "출고대기 내역"),
        fullscreen: false,
        width: 700,
        height: 300,
        onComplete: function() {
            $NC.onGlobalResize();
            G_GRDOUTWAIT.view.focus();
            $NC.setGridSelectRow(G_GRDOUTWAIT, 0);
        }
    });
}

function grdDetailBTOnCalc(rowData, changedColumnId) {

    switch (changedColumnId) {
        case "ADJUST_BOX":
        case "ADJUST_EA":
            rowData.ADJUST_QTY = $NC.getBQty(rowData.ADJUST_BOX, rowData.ADJUST_EA, rowData.QTY_IN_BOX);
            break;
    }

    rowData.ADJUST_BOX = $NC.getBBox(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
    rowData.ADJUST_EA = $NC.getBEa(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
    rowData.ADJUST_WEIGHT = $NC.getWeight(rowData.ADJUST_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

    return rowData;
}