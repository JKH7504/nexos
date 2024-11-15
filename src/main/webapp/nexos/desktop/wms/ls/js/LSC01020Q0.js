/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC01020Q0
 *  프로그램명         : 통합재고현황
 *  프로그램설명       : 통합재고현황 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-13
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2016-12-13    ASETEC           신규작성
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
        autoResizeView: function() {
            var resizeView = {
                container: "#divMasterView"
            };
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = [
                    "#grdT1Master",
                    "#grdT1Detail"
                ];
            } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {
                resizeView.grids = [
                    "#grdT2Master",
                    "#grdT2Detail"
                ];
            } else {
                resizeView.grids = "#grdT3Master";
            }
            return resizeView;
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT2MasterInitialize();
    grdT2DetailInitialize();
    grdT3MasterInitialize();

    $("#btnQBrand_Cd").click(showBrandPopup);

    // 조회조건 - 물류센터 초기화
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSUSERCENTER",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CENTER_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQCenter_Cd",
        codeField: "CENTER_CD",
        nameField: "CENTER_NM",
        onComplete: function() {
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
            setTimeout(function() {
                // 조회조건 - 존코드 세팅
                setZoneCdCombo();
            }, $ND.C_TIMEOUT_ACT);
        }
    });

    // 조회조건 - 상품상태 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_STATE",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_State",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQItem_State", 0);
        }
    });
}

function _OnLoaded() {

    $NC.setInitSplitter("#divT1TabSheetView", "hb", $NC.G_OFFSET.topViewWidth);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.topViewWidth = 200;
    $NC.G_OFFSET.leftViewWidth = 500;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            setZoneCdCombo();
            break;
        case "BRAND_CD":
            $NP.onBrandChange(val, {
                P_BRAND_CD: val,
                P_VIEW_DIV: "2"
            }, onBrandPopup);
            return;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LSC01020Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var ITEM_LOT = $NC.getValue("#edtQItem_Lot");
    var ZONE_CD = $NC.getValue("#cboQZone_Cd");
    var BANK_CD = $NC.getValue("#edtQBank_Cd", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    // 상품별 입고내역 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        $NC.setInitGridVar(G_GRDT1MASTER);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_STATE: ITEM_STATE,
            P_ITEM_LOT: ITEM_LOT,
            P_ZONE_CD: ZONE_CD,
            P_BANK_CD: BANK_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LSC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {

        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_STATE: ITEM_STATE,
            P_ITEM_LOT: ITEM_LOT,
            P_ZONE_CD: ZONE_CD,
            P_BANK_CD: BANK_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LSC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);

    } else {

        $NC.setInitGridVar(G_GRDT3MASTER);

        // 파라메터 세팅
        G_GRDT3MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_STATE: ITEM_STATE,
            P_ITEM_LOT: ITEM_LOT,
            P_ZONE_CD: ZONE_CD,
            P_BANK_CD: BANK_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LSC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

}

/**
 * Print Button Event - 메인 상단 출력 버튼의 리스트 클릭시 호출 됨
 * 
 * @param {Object}
 *        reportInfo 선택한 레포트 정보
 * 
 * <pre style="font-family: GulimChe; font-size: 12px;">
 * PROGRAM_ID        : 프로그램ID         PROGRAM_SUB_CD    : 프로그램하위코드
 * REPORT_CD         : 레포트코드         REPORT_NM         : 레포트명
 * REPORT_TITLE_NM   : 레포트타이틀명
 * REPORT_DOC_CD     : 레포트문서코드     REPORT_DOC_URL    : 레포트문서URL
 * REPORT_QUERY_ID   : 레포트쿼리ID       INTERNAL_QUERY_YN : 내부쿼리사용여부
 * USE_YN            : 사용여부           SORT_RANK         : 정렬순서
 *        </pre>
 */
function _Print(reportInfo) {

}

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *        newTab: The tab that was just activated.<br>
 *        oldTab: The tab that was just deactivated.<br>
 *        newPanel: The panel that was just activated.<br>
 *        oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    var container = "#divT" + (tabActiveIndex + 1) + "TabSheetView";
    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter(container)) {
        // 스필리터를 통한 _OnResize 호출
        $(container).trigger("resize");
    } else {
        // 스플리터 초기화
        if (tabActiveIndex == 0) {
            $NC.setInitSplitter(container, "hb", $NC.G_OFFSET.topViewWidth);
        } else if (tabActiveIndex == 1) {
            $NC.setInitSplitter(container, "v", $NC.G_OFFSET.leftViewWidth);
        } else {
            $NC.onGlobalResize();
        }
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        summaryTitle: "[합계]"
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
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_ENTRY_QTY",
        field: "OUT_ENTRY_QTY",
        name: "출고등록",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_WAIT_QTY",
        field: "OUT_WAIT_QTY",
        name: "출고대기",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SAFETY_QTY",
        field: "SAFETY_QTY",
        name: "안전재고",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_WEIGHT",
        field: "STOCK_WEIGHT",
        name: "재고중량",
        cssClass: "styRight",
        aggregator: "SUM"
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareKey: "SAFETY_YN",
            compareVal: $ND.C_NO,
            compareOperator: "==",
            cssClass: "styLack"
        },
        summaryRow: {
            visible: true
        }
    };

    // Grid DataView 생성 및 초기화
    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LSC01020Q0.RS_T1_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onGetCellValue.subscribe(grdT1MasterOnGetCellValue);
    G_GRDT1MASTER.view.onDblClick.subscribe(onOutwaitPopup);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    // 조회시 디테일 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);
    onGetT1Detail({
        data: null
    });

    // 파라메터 세팅
    G_GRDT1DETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_ZONE_CD: rowData.ZONE_CD,
        P_BANK_CD: rowData.BANK_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LSC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

/**
 * @param e
 * @param args
 *        row, cell, item, column, value, grid
 * @returns
 */
function grdT1MasterOnGetCellValue(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "OUT_ENTRY_QTY":
            if (rowData.ZONE_CD != $ND.C_ALL || rowData.BANK_CD != $ND.C_ALL) {
                return "-";
            }
            break;
    }
    return null;
}

function grdT1DetailOnGetColumns() {

    var columns = [];
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
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        summable: true
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "OUT_WAIT_QTY",
        field: "OUT_WAIT_QTY",
        name: "출고대기",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_DATE",
        field: "STOCK_DATE",
        name: "입고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_WEIGHT",
        field: "STOCK_WEIGHT",
        name: "재고중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 1,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if ($NC.toNumber(rowData.OUT_WAIT_QTY) > 0) {
                    return "stySpecial";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "LSC01020Q0.RS_T1_DETAIL",
        sortCol: "LOCATION_CD",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onDblClick.subscribe(onOutwaitPopup);
}

function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_RBOX",
        field: "STOCK_RBOX",
        name: "재고BOX",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_WAIT_QTY",
        field: "OUT_WAIT_QTY",
        name: "출고대기",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_WEIGHT",
        field: "STOCK_WEIGHT",
        name: "재고중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 0,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LSC01020Q0.RS_T2_MASTER",
        sortCol: "LOCATION_CD",
        gridOptions: options
    });
    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT2MASTER.data.getItem(row);

    // 조회시 디테일 초기화
    $NC.setInitGridVar(G_GRDT2DETAIL);
    onGetT2Detail({
        data: null
    });

    // 파라메터 세팅
    G_GRDT2DETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_LOCATION_CD: rowData.LOCATION_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_NM: rowData.ITEM_NM,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT
    };
    // 데이터 조회
    $NC.serviceCall("/LSC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

function grdT2DetailOnGetColumns() {

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
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "OUT_WAIT_QTY",
        field: "OUT_WAIT_QTY",
        name: "출고대기",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_DATE",
        field: "STOCK_DATE",
        name: "입고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_WEIGHT",
        field: "STOCK_WEIGHT",
        name: "재고중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 배송처별 입고내역탭의 그리드 초기값 설정
 */
function grdT2DetailInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Detail", {
        columns: grdT2DetailOnGetColumns(),
        queryId: "LSC01020Q0.RS_T2_DETAIL",
        sortCol: "ITEM_CD",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
    G_GRDT2DETAIL.view.onDblClick.subscribe(onOutwaitPopup);
}

function grdT2DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2DETAIL, row + 1);
}

function grdT3MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        summaryTitle: "[합계]"
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
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_WAIT_QTY",
        field: "OUT_WAIT_QTY",
        name: "출고대기",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_DATE",
        field: "STOCK_DATE",
        name: "입고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_WEIGHT",
        field: "STOCK_WEIGHT",
        name: "재고중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
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
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3MasterInitialize() {

    var options = {
        frozenColumn: 3,
        summaryRow: {
            visible: true
        },
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if ($NC.toNumber(rowData.OUT_WAIT_QTY) > 0) {
                    return "stySpecial";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT3Master", {
        columns: grdT3MasterOnGetColumns(),
        queryId: "LSC01020Q0.RS_T3_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options,
        canDblClick: true
    });
    G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
    G_GRDT3MASTER.view.onDblClick.subscribe(onOutwaitPopup);

}

function grdT3MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT3MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT3MASTER, row + 1);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2DETAIL);
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.clearGridData(G_GRDT3MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 상품별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, null, true)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDT1DETAIL);
        onGetT1Detail({
            data: null
        });
    }
}

/**
 * 로케이션별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT2MASTER, null, true)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDT2DETAIL);
        onGetT2Detail({
            data: null
        });
    }
}

/**
 * 전체 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT3Master(ajaxData) {

    $NC.setInitGridData(G_GRDT3MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT3MASTER);
}

/**
 * 상품별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL);
}

/**
 * 로케이션별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2DETAIL);
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBrandPopup() {

    $NP.showBrandPopup({
        P_BRAND_CD: $ND.C_ALL,
        P_VIEW_DIV: "2"
    }, onBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onBrandPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
    } else {
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setFocus("#edtQBrand_Cd", true);
    }
    onChangingCondition();
}

/**
 * 물류센터 변경시 존 콤보 재설정
 */
function setZoneCdCombo() {

    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMZONE",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_ZONE_CD: $ND.C_ALL
        }
    }, {
        selector: "#cboQZone_Cd",
        codeField: "ZONE_CD",
        nameField: "ZONE_NM",
        fullNameField: "ZONE_CD_F",
        addAll: true
    });
}

function onOutwaitPopup(e, args) {

    var rowDataM, rowDataD;
    var callParams;
    if (G_GRDT1MASTER.view == args.grid) {
        rowDataM = G_GRDT1MASTER.data.getItem(args.row);
        if (rowDataM == null || $NC.toNumber(rowDataM.OUT_ENTRY_QTY) == 0 && $NC.toNumber(rowDataM.OUT_WAIT_QTY) == 0) {
            return;
        }
        callParams = {
            P_CENTER_CD: rowDataM.CENTER_CD,
            P_BRAND_CD: rowDataM.BRAND_CD,
            P_ITEM_CD: rowDataM.ITEM_CD,
            P_ITEM_STATE: rowDataM.ITEM_STATE,
            P_ITEM_LOT: rowDataM.ITEM_LOT,
            P_QUERY_ID: "LSC01020Q0.RS_SUB2"
        };
    } else if (G_GRDT1DETAIL.view == args.grid) {
        rowDataM = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
        rowDataD = G_GRDT1DETAIL.data.getItem(args.row);
        if (rowDataD == null || $NC.toNumber(rowDataD.OUT_WAIT_QTY) == 0) {
            return;
        }
        callParams = {
            P_CENTER_CD: rowDataM.CENTER_CD,
            P_LOCATION_CD: rowDataD.LOCATION_CD,
            P_BRAND_CD: rowDataM.BRAND_CD,
            P_ITEM_CD: rowDataM.ITEM_CD,
            P_ITEM_STATE: rowDataM.ITEM_STATE,
            P_ITEM_LOT: rowDataD.ITEM_LOT,
            P_VALID_DATE: rowDataD.VALID_DATE,
            P_BATCH_NO: rowDataD.BATCH_NO,
            P_STOCK_DATE: rowDataD.STOCK_DATE,
            P_STOCK_IN_GRP: rowDataD.STOCK_IN_GRP,
            P_PALLET_ID: rowDataD.PALLET_ID,
            P_QUERY_ID: "LSC01020Q0.RS_SUB1"
        };
    } else if (G_GRDT2DETAIL.view == args.grid) {
        rowDataM = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);
        rowDataD = G_GRDT2DETAIL.data.getItem(args.row);
        if (rowDataD == null || $NC.toNumber(rowDataD.OUT_WAIT_QTY) == 0) {
            return;
        }
        callParams = {
            P_CENTER_CD: rowDataM.CENTER_CD,
            P_LOCATION_CD: rowDataM.LOCATION_CD,
            P_BRAND_CD: rowDataD.BRAND_CD,
            P_ITEM_CD: rowDataD.ITEM_CD,
            P_ITEM_STATE: rowDataD.ITEM_STATE,
            P_ITEM_LOT: rowDataD.ITEM_LOT,
            P_VALID_DATE: rowDataD.VALID_DATE,
            P_BATCH_NO: rowDataD.BATCH_NO,
            P_STOCK_DATE: rowDataD.STOCK_DATE,
            P_STOCK_IN_GRP: rowDataD.STOCK_IN_GRP,
            P_PALLET_ID: rowDataD.PALLET_ID,
            P_QUERY_ID: "LSC01020Q0.RS_SUB1"
        };
    } else if (G_GRDT3MASTER.view == args.grid) {
        rowDataM = G_GRDT3MASTER.data.getItem(args.row);
        if (rowDataM == null || $NC.toNumber(rowDataM.OUT_WAIT_QTY) == 0) {
            return;
        }
        callParams = {
            P_CENTER_CD: rowDataM.CENTER_CD,
            P_LOCATION_CD: rowDataM.LOCATION_CD,
            P_BRAND_CD: rowDataM.BRAND_CD,
            P_ITEM_CD: rowDataM.ITEM_CD,
            P_ITEM_STATE: rowDataM.ITEM_STATE,
            P_ITEM_LOT: rowDataM.ITEM_LOT,
            P_VALID_DATE: rowDataM.VALID_DATE,
            P_BATCH_NO: rowDataM.BATCH_NO,
            P_STOCK_DATE: rowDataM.STOCK_DATE,
            P_STOCK_IN_GRP: rowDataM.STOCK_IN_GRP,
            P_PALLET_ID: rowDataM.PALLET_ID,
            P_QUERY_ID: "LSC01020Q0.RS_SUB1"
        };
    }
    if ($NC.isNull(callParams)) {
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LSC01021P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LSC01020Q0.002", "출고대기상세내역"),
        url: "ls/LSC01021P0.html",
        width: 900,
        height: 500,
        G_PARAMETER: callParams
    });
}