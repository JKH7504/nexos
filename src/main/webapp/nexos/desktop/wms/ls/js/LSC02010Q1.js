/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC02010Q1
 *  프로그램명         : 수불현황(의류)
 *  프로그램설명       : 수불현황 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-08-17
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-17    ASETEC           신규작성
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
                resizeView.grids = "#grdT1Master";
            } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {
                resizeView.grids = "#grdT2Master";
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
    grdT2MasterInitialize();
    grdT3MasterInitialize();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    $NC.setInitDateRangePicker("#dtpQInout_Date1", "#dtpQInout_Date2", null, "CM");

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

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
        }
    });

    // 수불발생여부 콤보박스 세팅
    $NC.setInitComboData({
        selector: "#cboQView_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        data: [
            {
                COMMON_CD: 0,
                COMMON_NM: $NC.getDisplayMsg("JS.LSC02010Q1.010", "전체")
            },
            {
                COMMON_CD: 1,
                COMMON_NM: $NC.getDisplayMsg("JS.LSC02010Q1.011", "수불발생상품")
            }
        ],
        onComplete: function() {
            $NC.setValue("#cboQView_Div", 1);
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
        multiSelect: true
    });

    // 조회조건 - 연도구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "YEAR_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQYear_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    // 조회조건 - 시즌구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "SEASON_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQSeason_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    // 조회조건 - 상품구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });
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
        case "INOUT_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC02010Q1.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INOUT_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC02010Q1.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LSC02010Q1.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC02010Q1.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    if ($NC.isNull(INOUT_DATE1)) {
        alert($NC.getDisplayMsg("JS.LSC02010Q1.005", "수불 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date1");
        return;
    }
    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
    if ($NC.isNull(INOUT_DATE2)) {
        alert($NC.getDisplayMsg("JS.LSC02010Q1.006", "수불 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date2");
        return;
    }
    if (INOUT_DATE1 > INOUT_DATE2) {
        alert($NC.getDisplayMsg("JS.LSC02010Q1.007", "수불일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQInout_Date1");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var VIEW_DIV = $NC.getValue("#cboQView_Div");
    if ($NC.isNull(VIEW_DIV)) {
        alert($NC.getDisplayMsg("JS.LSC02010Q1.008", "수불발생상품여부를 선택하십시오."));
        $NC.setFocus("#cboQView_Div");
    }
    var YEAR_DIV = $NC.getValue("#cboQYear_Div");
    var SEASON_DIV = $NC.getValue("#cboQSeason_Div");
    var ITEM_DIV = $NC.getValue("#cboQItem_Div");

    // 입출고 수불내역 조회
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE1: INOUT_DATE1,
            P_INOUT_DATE2: INOUT_DATE2,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_STATE: ITEM_STATE,
            P_YEAR_DIV: YEAR_DIV,
            P_SEASON_DIV: SEASON_DIV,
            P_ITEM_DIV: ITEM_DIV,
            P_VIEW_DIV: VIEW_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/LSC02010Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

        // 일자별 수불내역 조회
    } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE1: INOUT_DATE1,
            P_INOUT_DATE2: INOUT_DATE2,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_STATE: ITEM_STATE,
            P_YEAR_DIV: YEAR_DIV,
            P_SEASON_DIV: SEASON_DIV,
            P_ITEM_DIV: ITEM_DIV,
            P_VIEW_DIV: VIEW_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/LSC02010Q0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);

        // 기간별 수불내역 조회
    } else {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT3MASTER);

        // 파라메터 세팅
        G_GRDT3MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE1: INOUT_DATE1,
            P_INOUT_DATE2: INOUT_DATE2,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_STATE: ITEM_STATE,
            P_YEAR_DIV: YEAR_DIV,
            P_SEASON_DIV: SEASON_DIV,
            P_ITEM_DIV: ITEM_DIV,
            P_VIEW_DIV: VIEW_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/LSC02010Q0/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
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

    $NC.onGlobalResize();
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        band: 0,
        summaryTitle: "[합계]",
        groupToggler: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        band: 0,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        band: 0,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        band: 0,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_D",
        field: "ITEM_STATE_D",
        name: "상태",
        band: 0,
        cssClass: "styCenter",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호",
        band: 0,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        band: 0,
        cssClass: "styRight",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "수불일자",
        band: 0,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "입출고구분",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "BSTOCK_QTY",
        field: "BSTOCK_QTY",
        name: "기초재고",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E1_QTY",
        field: "E1_QTY",
        name: "일반(입고)",
        band: 1,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E2_QTY",
        field: "E2_QTY",
        name: "수송(입고)",
        band: 1,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E3_QTY",
        field: "E3_QTY",
        name: "반품(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E4_QTY",
        field: "E4_QTY",
        name: "실사(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E9_QTY",
        field: "E9_QTY",
        name: "기타(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E0_QTY",
        field: "E0_QTY",
        name: "합계(입고)",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D1_QTY",
        field: "D1_QTY",
        name: "일반(출고)",
        band: 1,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D2_QTY",
        field: "D2_QTY",
        name: "수송(출고)",
        band: 1,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D3_QTY",
        field: "D3_QTY",
        name: "반품(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D4_QTY",
        field: "D4_QTY",
        name: "실사(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D9_QTY",
        field: "D9_QTY",
        name: "기타(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D0_QTY",
        field: "D0_QTY",
        name: "합계(출고)",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "NSTOCK_QTY",
        field: "NSTOCK_QTY",
        name: "당일재고",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 입출고 수불내역탭의 그리드 초기값 설정
 */
function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 5,
        showBandRow: true,
        bands: [
            "기본정보",
            "수불재고"
        ],
        summaryRow: {
            visible: true,
            compareFn: function(field, rowData) {
                if (field == "BSTOCK_QTY" && rowData.DATA_GRP != "1") {
                    return false;
                }
                if (field == "NSTOCK_QTY" && rowData.DATA_GRP != "1") {
                    return false;
                }
                return true;
            }
        }
    };

    // Data Grouping
    var dataGroupOptions = {
        getter: function(rowData) {
            return $NC.rPad(rowData.ITEM_CD, 30) //
                + "|" + $NC.rPad(rowData.BRAND_CD, 20) //
                + "|" + rowData.ITEM_STATE //
                + "|" + $NC.rPad(rowData.ITEM_LOT, 20);
        },
        resultFn: function(field, summary) {
            if (field == "INOUT_DATE") {
                return "[상품별합계]";
            }

            if (field == "INOUT_NM") {
                return "[전체]";
            }

            return summary[field];
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LSC02010Q1.RS_T1_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true,
        canDblClick: true
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onDblClick.subscribe(onGridMasterDblClick);
    G_GRDT1MASTER.view.onGetCellValue.subscribe(grdT1MasterOnGetCellValue);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

/**
 * 특정 Cell 값에 대한 특수한 처리가 필요할 경우 경우 구현
 * 
 * @param event
 *        jQuery Event Object
 * @param args
 *        Event Parameter Object<br>
 *        row {Number} Active Row Index<br>
 *        cell {Number} Active Cell Index<br>
 *        item {Object} Active Row Data<br>
 *        column {Object} column definition<br>
 *        value {String} Current Cell Value<br>
 *        grid {Object} Grid Object
 */
function grdT1MasterOnGetCellValue(e, args) {

    // 그룹 데이터가 아닐 경우만 당일재고 값 표시안함
    if (args.item.__group) {
        return;
    }

    // 특정 값 체크 다른 값으로 표현
    switch (G_GRDT1MASTER.view.getColumnId(args.cell)) {
        case "NSTOCK_RBOX":
        case "NSTOCK_QTY":
            return "";
    }
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        band: 0,
        summaryTitle: "[합계]",
        groupToggler: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        band: 0,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        band: 0,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        band: 0,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_D",
        field: "ITEM_STATE_D",
        name: "상태",
        band: 0,
        cssClass: "styCenter",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호",
        band: 0,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        band: 0,
        cssClass: "styRight",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "수불일자",
        band: 0,
        cssClass: "styCenter"
    });

    $NC.setGridColumn(columns, {
        id: "BSTOCK_RBOX",
        field: "BSTOCK_RBOX",
        name: "기초재고",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E1_RBOX",
        field: "E1_RBOX",
        name: "일반(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E2_RBOX",
        field: "E2_RBOX",
        name: "수송(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E3_RBOX",
        field: "E3_RBOX",
        name: "반품(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E4_RBOX",
        field: "E4_RBOX",
        name: "실사(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E9_RBOX",
        field: "E9_RBOX",
        name: "기타(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E0_RBOX",
        field: "E0_RBOX",
        name: "합계(입고)",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D1_RBOX",
        field: "D1_RBOX",
        name: "일반(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D2_RBOX",
        field: "D2_RBOX",
        name: "수송(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D3_RBOX",
        field: "D3_RBOX",
        name: "반품(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D4_RBOX",
        field: "D4_RBOX",
        name: "실사(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D9_RBOX",
        field: "D9_RBOX",
        name: "기타(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D0_RBOX",
        field: "D0_RBOX",
        name: "합계(출고)",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "NSTOCK_RBOX",
        field: "NSTOCK_RBOX",
        name: "당일재고",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BSTOCK_QTY",
        field: "BSTOCK_QTY",
        name: "기초재고",
        band: 2,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E1_QTY",
        field: "E1_QTY",
        name: "일반(입고)",
        band: 2,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E2_QTY",
        field: "E2_QTY",
        name: "수송(입고)",
        band: 2,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E3_QTY",
        field: "E3_QTY",
        name: "반품(입고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E4_QTY",
        field: "E4_QTY",
        name: "실사(입고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E9_QTY",
        field: "E9_QTY",
        name: "기타(입고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E0_QTY",
        field: "E0_QTY",
        name: "합계(입고)",
        band: 2,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D1_QTY",
        field: "D1_QTY",
        name: "일반(출고)",
        band: 2,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D2_QTY",
        field: "D2_QTY",
        name: "수송(출고)",
        band: 2,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D3_QTY",
        field: "D3_QTY",
        name: "반품(출고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D4_QTY",
        field: "D4_QTY",
        name: "실사(출고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D9_QTY",
        field: "D9_QTY",
        name: "기타(출고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D0_QTY",
        field: "D0_QTY",
        name: "합계(출고)",
        band: 2,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "NSTOCK_QTY",
        field: "NSTOCK_QTY",
        name: "당일재고",
        band: 2,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 일자별 수불내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 6,
        showBandRow: true,
        bands: [
            "기본정보",
            "BOX기준 수불재고",
            "EA기준 수불재고"
        ],
        summaryRow: {
            visible: true,
            compareFn: function(field, rowData) {
                if (field == "BSTOCK_QTY" && rowData.BSTOCK_YN == $ND.C_NO) {
                    return false;
                }
                if (field == "NSTOCK_QTY" && rowData.NSTOCK_YN == $ND.C_NO) {
                    return false;
                }
                return true;
            }
        }
    };

    // Data Grouping
    var dataGroupOptions = {
        getter: function(rowData) {
            return $NC.rPad(rowData.ITEM_CD, 30) //
                + "|" + $NC.rPad(rowData.BRAND_CD, 20) //
                + "|" + rowData.ITEM_STATE //
                + "|" + $NC.rPad(rowData.ITEM_LOT, 20);
        },
        resultFn: function(field, summary) {
            if (field == "INOUT_DATE") {
                return "[상품별합계]";
            } else {
                return summary[field];
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LSC02010Q1.RS_T2_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        canDblClick: true
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
    G_GRDT2MASTER.view.onDblClick.subscribe(onGridMasterDblClick);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

function grdT3MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        band: 0,
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_D",
        field: "ITEM_STATE_D",
        name: "상태",
        band: 0,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        band: 0,
        cssClass: "styRight"
    });

    $NC.setGridColumn(columns, {
        id: "BSTOCK_RBOX",
        field: "BSTOCK_RBOX",
        name: "기초재고",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E1_RBOX",
        field: "E1_RBOX",
        name: "일반(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E2_RBOX",
        field: "E2_RBOX",
        name: "수송(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E3_RBOX",
        field: "E3_RBOX",
        name: "반품(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E4_RBOX",
        field: "E4_RBOX",
        name: "실사(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E9_RBOX",
        field: "E9_RBOX",
        name: "기타(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E0_RBOX",
        field: "E0_RBOX",
        name: "합계(입고)",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D1_RBOX",
        field: "D1_RBOX",
        name: "일반(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D2_RBOX",
        field: "D2_RBOX",
        name: "수송(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D3_RBOX",
        field: "D3_RBOX",
        name: "반품(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D4_RBOX",
        field: "D4_RBOX",
        name: "실사(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D9_RBOX",
        field: "D9_RBOX",
        name: "기타(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D0_RBOX",
        field: "D0_RBOX",
        name: "합계(출고)",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "NSTOCK_RBOX",
        field: "NSTOCK_RBOX",
        name: "당일재고",
        band: 1,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BSTOCK_QTY",
        field: "BSTOCK_QTY",
        name: "기초재고",
        band: 2,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E1_QTY",
        field: "E1_QTY",
        name: "일반(입고)",
        band: 2,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E2_QTY",
        field: "E2_QTY",
        name: "수송(입고)",
        band: 2,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E3_QTY",
        field: "E3_QTY",
        name: "반품(입고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E4_QTY",
        field: "E4_QTY",
        name: "실사(입고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E9_QTY",
        field: "E9_QTY",
        name: "기타(입고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E0_QTY",
        field: "E0_QTY",
        name: "합계(입고)",
        band: 2,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D1_QTY",
        field: "D1_QTY",
        name: "일반(출고)",
        band: 2,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D2_QTY",
        field: "D2_QTY",
        name: "수송(출고)",
        band: 2,
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D3_QTY",
        field: "D3_QTY",
        name: "반품(출고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D4_QTY",
        field: "D4_QTY",
        name: "실사(출고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D9_QTY",
        field: "D9_QTY",
        name: "기타(출고)",
        band: 2,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D0_QTY",
        field: "D0_QTY",
        name: "합계(출고)",
        band: 2,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "NSTOCK_QTY",
        field: "NSTOCK_QTY",
        name: "당일재고",
        band: 2,
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 기간별 수불내역탭의 그리드 초기값 설정
 */
function grdT3MasterInitialize() {

    var options = {
        frozenColumn: 4,
        showBandRow: true,
        bands: [
            "기본정보",
            "BOX기준 수불재고",
            "EA기준 수불재고"
        ],
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT3Master", {
        columns: grdT3MasterOnGetColumns(),
        queryId: "LSC02010Q1.RS_T3_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
    G_GRDT3MASTER.view.onDblClick.subscribe(onGridMasterDblClick);
}

function grdT3MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT3MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT3MASTER, row + 1);
}

function onGridMasterDblClick(e, args) {

    var row = args.row;
    var rowData;

    // 입출고 수불내역 조회
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        rowData = G_GRDT1MASTER.data.getItem(row);
        if (rowData.INOUT_CD == $ND.C_BASE_INOUT_CD) {// 이월기초재고는 팝업 미오픈
            return;
        }
        // 일자별 수불내역 조회
    } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {

        rowData = G_GRDT2MASTER.data.getItem(row);
        // 기간별 수불내역 조회
    } else {

        rowData = G_GRDT3MASTER.data.getItem(row);
    }

    var isGroup = false;
    if (rowData.__group) {
        rowData = rowData.rows[0];
        isGroup = true;
    }

    var ITEM_CD = rowData.ITEM_CD;
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");

    var INOUT_DATE = "";
    if (!isGroup) {
        INOUT_DATE = $NC.nullToDefault(rowData.INOUT_DATE, "");
    }

    var INOUT_DATE1 = rowData.INOUT_DATE1;
    var INOUT_DATE2 = rowData.INOUT_DATE2;

    var BRAND_CD = rowData.BRAND_CD;

    var ITEM_STATE = rowData.ITEM_STATE;
    if ($NC.isNull(ITEM_STATE)) {
        ITEM_STATE = $ND.C_ALL;
    }

    var ITEM_LOT = rowData.ITEM_LOT;
    if ($NC.isNull(ITEM_LOT)) {
        ITEM_LOT = $ND.C_ALL;
    }

    var INOUT_CD = rowData.INOUT_CD;
    if ($NC.isNull(INOUT_CD) || isGroup) {
        INOUT_CD = $ND.C_ALL;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LSC02011P1",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LSC02010Q1.009", "입출고상세내역"),
        url: "ls/LSC02011P1.html",
        width: 900,
        height: 500,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE,
            P_INOUT_DATE1: INOUT_DATE1,
            P_INOUT_DATE2: INOUT_DATE2,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_STATE: ITEM_STATE,
            P_ITEM_LOT: ITEM_LOT,
            P_INOUT_CD: INOUT_CD
        }
    });
}

/**
 * 입출고 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER);
}

/**
 * 일자별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);
}

/**
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT3Master(ajaxData) {

    $NC.setInitGridData(G_GRDT3MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT3MASTER);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    // 입출고 수불내역
    $NC.clearGridData(G_GRDT1MASTER);
    // 일자별 수불내역
    $NC.clearGridData(G_GRDT2MASTER);
    // 기간별 수불내역
    $NC.clearGridData(G_GRDT3MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BRAND_CD: $ND.C_ALL,
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

    // 브랜드 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");

    $NP.showBuBrandPopup({
        P_BU_CD: BU_CD,
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
