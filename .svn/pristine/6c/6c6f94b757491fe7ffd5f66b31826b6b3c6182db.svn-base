/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC05050Q0
 *  프로그램명         : 상품 일련번호현황
 *  프로그램설명       : 상품 일련번호현황 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-07-17
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-07-17    ASETEC           신규작성
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
                container: "#ctrMasterView"
            }, tabActiveIndex = $NC.getTabActiveIndex("#ctrMasterView");
            if (tabActiveIndex == 0) {
                resizeView.grids = [
                    "#grdT1Master",
                    "#grdT1Detail"
                ];
            } else if (tabActiveIndex == 1) {
                resizeView.grids = [
                    "#grdT2Master",
                    "#grdT2Detail"
                ];
            }
            return resizeView;
        }
    });

    // 탭 초기화
    $NC.setInitTab("#ctrMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT2MasterInitialize();
    grdT2DetailInitialize();

    // 조회조건 - 물류센터 세팅
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
        }
    });
}

function _OnLoaded() {

    $NC.setInitSplitter("#ctrT1TabSheetView", "hb", $NC.G_OFFSET.bottomViewHeight);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.bottomViewHeight = 200;
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
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
    }

    onChangingCondition();
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.clearGridData(G_GRDT2DETAIL);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LSC05050Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC05050Q0.002", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var ITEM_SERIAL = $NC.getValue("#edtQItem_Serial");

    if ($NC.getTabActiveIndex("#ctrMasterView") == 0) {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);
        $NC.setInitGridVar(G_GRDT1DETAIL);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_SERIAL: ITEM_SERIAL
        };
        // 데이터 조회
        $NC.serviceCall("/LSC05050Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    } else {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);
        $NC.setInitGridVar(G_GRDT2DETAIL);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_SERIAL: ITEM_SERIAL
        };
        // 데이터 조회
        $NC.serviceCall("/LSC05050Q0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        summaryTitle: "[합계]",
        groupToggler: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_IN_YN",
        field: "SERIAL_IN_YN",
        name: "입고시리얼관리여부",
        minWidth: 90,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_OUT_YN",
        field: "SERIAL_OUT_YN",
        name: "출고시리얼관리여부",
        minWidth: 90,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "현재고",
        cssClass: "styRight",
        aggregator: "SUM",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "OUT_WAIT_QTY",
        field: "OUT_WAIT_QTY",
        name: "출고대기",
        cssClass: "styRight",
        aggregator: "SUM",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SERIAL",
        field: "ITEM_SERIAL",
        name: "시리얼번호",
        minWidth: 150,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_QTY",
        field: "INBOUND_QTY",
        name: "입고수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_QTY",
        field: "OUTBOUND_QTY",
        name: "출고수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 4,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.__group && rowData.totals && rowData.totals.summary //
                    && rowData.totals.summary.STOCK_QTY != rowData.totals.summary.INBOUND_QTY - rowData.totals.summary.OUTBOUND_QTY) {
                    return "styError";
                }
            }
        },
        summaryRow: {
            visible: true
        }
    };

    // Data Grouping
    var dataGroupOptions = [
        {
            getter: function(rowData) {
                return rowData.ITEM_CD + "|" + rowData.BRAND_CD;
            }
        }
    ];

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LSC05050Q0.RS_T1_MASTER",
        sortCol: "ITEM_SERIAL",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onGetCellValue.subscribe(grdT1MasterOnGetCellValue);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    // 그룹 데이터일 경우 디테일 초기화
    if (rowData.__group) {
        $NC.clearGridData(G_GRDT1DETAIL);
    }
    // 일반 데이터일 경우 정상 조회
    else {
        $NC.setInitGridVar(G_GRDT1DETAIL);

        G_GRDT1DETAIL.queryParams = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_SERIAL: rowData.ITEM_SERIAL
        };
        // 데이터 조회
        $NC.serviceCall("/LOB05050E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1MasterOnGetCellValue(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "INBOUND_QTY":
            if (rowData.INBOUND_QTY == 0) {
                return "";
            }
            break;
        case "OUTBOUND_QTY":
            if (rowData.OUTBOUND_QTY == 0) {
                return "";
            }
            break;
    }
    return null;
}

function grdT1DetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "SERIAL_DATE",
        field: "SERIAL_DATE",
        name: "입출고일자",
        minWidth: 90,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_NO",
        field: "SERIAL_NO",
        name: "입출고번호",
        minWidth: 90,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "VD_CD",
        field: "VD_CD",
        name: "공급처/배송처",
        minWidth: 100
    });
    $NC.setGridColumn(columns, {
        id: "VD_NM",
        field: "VD_NM",
        name: "공급처/배송처명",
        minWidth: 120
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "수령자전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "수령자휴대폰",
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
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        minWidth: 150
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "LSC05050Q0.RS_T1_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
}

function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER, null, true);
}

function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL, null, true);
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        summaryTitle: "[합계]",
        groupToggler: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_IN_YN",
        field: "SERIAL_IN_YN",
        name: "입고시리얼관리여부",
        minWidth: 90,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_OUT_YN",
        field: "SERIAL_OUT_YN",
        name: "출고시리얼관리여부",
        minWidth: 90,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "현재고",
        cssClass: "styRight",
        aggregator: "SUM",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "OUT_WAIT_QTY",
        field: "OUT_WAIT_QTY",
        name: "출고대기",
        cssClass: "styRight",
        aggregator: "SUM",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SERIAL",
        field: "ITEM_SERIAL",
        name: "시리얼번호",
        minWidth: 150,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_QTY",
        field: "INBOUND_QTY",
        name: "입고수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_QTY",
        field: "OUTBOUND_QTY",
        name: "출고수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 4,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.__group && rowData.totals && rowData.totals.summary //
                    && rowData.totals.summary.STOCK_QTY != rowData.totals.summary.INBOUND_QTY - rowData.totals.summary.OUTBOUND_QTY) {
                    return "styError";
                }
            }
        },
        summaryRow: {
            visible: true
        }
    };

    // Data Grouping
    var dataGroupOptions = [
        {
            getter: function(rowData) {
                return rowData.ITEM_CD + "|" + rowData.BRAND_CD;
            }
        }
    ];

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LSC05050Q0.RS_T2_MASTER",
        sortCol: "ITEM_SERIAL",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
    G_GRDT2MASTER.view.onGetCellValue.subscribe(grdT2MasterOnGetCellValue);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT2MASTER.data.getItem(row);

    // 그룹 데이터일 경우 디테일 초기화
    if (rowData.__group) {
        $NC.clearGridData(G_GRDT2DETAIL);
    }
    // 일반 데이터일 경우 정상 조회
    else {
        $NC.setInitGridVar(G_GRDT2DETAIL);

        G_GRDT2DETAIL.queryParams = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_SERIAL: rowData.ITEM_SERIAL
        };
        // 데이터 조회
        $NC.serviceCall("/LOB05050E0/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

function grdT2MasterOnGetCellValue(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "INBOUND_QTY":
            if (rowData.INBOUND_QTY == 0) {
                return "";
            }
            break;
        case "OUTBOUND_QTY":
            if (rowData.OUTBOUND_QTY == 0) {
                return "";
            }
            break;
    }
    return null;
}

function grdT2DetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "SERIAL_DATE",
        field: "SERIAL_DATE",
        name: "입출고일자",
        minWidth: 90,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_NO",
        field: "SERIAL_NO",
        name: "입출고번호",
        minWidth: 90,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "VD_CD",
        field: "VD_CD",
        name: "공급처/배송처",
        minWidth: 100
    });
    $NC.setGridColumn(columns, {
        id: "VD_NM",
        field: "VD_NM",
        name: "공급처/배송처명",
        minWidth: 120
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "수령자전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "수령자휴대폰",
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
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        minWidth: 150
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Detail", {
        columns: grdT2DetailOnGetColumns(),
        queryId: "LSC05050Q0.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2DETAIL, row + 1);
}

function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER, null, true);
}

function onGetT2Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2DETAIL, null, true);
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

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter(ui.newPanel)) {
        // 스필리터를 통한 _OnResize 호출
        ui.newPanel.trigger("resize");
    } else {
        // 스플리터 초기화
        $NC.setInitSplitter(ui.newPanel, "hb", $NC.G_OFFSET.bottomViewHeight);
    }
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtQBu_Cd", true);
    });
}

/**
 * 사업부 검색 결과
 * 
 * @param resultInfo
 */
function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setFocus("#edtQBu_Cd", true);
    }

    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    $NP.showBuBrandPopup({
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_BRAND_CD: $ND.C_ALL
    }, onBuBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onBuBrandPopup(resultInfo) {

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