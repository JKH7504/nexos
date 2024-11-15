/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC02050Q0
 *  프로그램명         : 로케이션별 수불현황
 *  프로그램설명       : 로케이션별 수불현황 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-03-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-03-07    ASETEC           신규작성
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
        autoResizeView: {
            container: "#divMasterView",
            grids: [
                "#grdMaster"
            ]
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $NC.setInitDateRangePicker("#dtpQInout_Date1", "#dtpQInout_Date2", null, "CM");

    $("#btnQBu_Cd").click(showUserBuPopup);

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
                COMMON_NM: $NC.getDisplayMsg("JS.LSC02050Q0.010", "전체")
            },
            {
                COMMON_CD: 1,
                COMMON_NM: $NC.getDisplayMsg("JS.LSC02050Q0.011", "수불발생상품")
            }
        ],
        onComplete: function() {
            $NC.setValue("#cboQView_Div", 1);
        }
    });

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
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
        case "INOUT_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC02050Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INOUT_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC02050Q0.002", "검색 종료일자를 정확히 입력하십시오."));
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
        alert($NC.getDisplayMsg("JS.LSC02050Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC02050Q0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    if ($NC.isNull(INOUT_DATE1)) {
        alert($NC.getDisplayMsg("JS.LSC02050Q0.005", "수불 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date1");
        return;
    }
    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
    if ($NC.isNull(INOUT_DATE2)) {
        alert($NC.getDisplayMsg("JS.LSC02050Q0.006", "수불 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date2");
        return;
    }
    if (INOUT_DATE1 > INOUT_DATE2) {
        alert($NC.getDisplayMsg("JS.LSC02050Q0.007", "수불일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQInout_Date1");
        return;
    }

    var LOCATION_CD = $NC.getValue("#edtQLocation_Cd", true);
    var VIEW_DIV = $NC.getValue("#cboQView_Div");
    if ($NC.isNull(VIEW_DIV)) {
        alert($NC.getDisplayMsg("JS.LSC02050Q0.008", "수불발생상품여부를 선택하십시오."));
        $NC.setFocus("#cboQView_Div");
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INOUT_DATE1: INOUT_DATE1,
        P_INOUT_DATE2: INOUT_DATE2,
        P_LOCATION_CD: LOCATION_CD,
        P_VIEW_DIV: VIEW_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/LSC02050Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        summaryTitle: "[합계]",
        groupToggler: true
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "수불일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BSTOCK_QTY",
        field: "BSTOCK_QTY",
        name: "기초재고",
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
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E2_QTY",
        field: "E2_QTY",
        name: "수송(입고)",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "E3_QTY",
        field: "E3_QTY",
        name: "반품(입고)",
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
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "EL_QTY",
        field: "EL_QTY",
        name: "이동(입고)",
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
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D2_QTY",
        field: "D2_QTY",
        name: "수송(출고)",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "D3_QTY",
        field: "D3_QTY",
        name: "반품(출고)",
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
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DL_QTY",
        field: "DL_QTY",
        name: "이동(출고)",
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
        cssClass: "styRight styAccent",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 로케이션별 수불내역탭의 그리드 초기값 설정
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 2,
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
            return rowData.LOCATION_CD;
        },
        resultFn: function(field, summary) {
            if (field == "INOUT_DATE") {
                return "[로케이션별합계]";
            } else {
                return summary[field];
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LSC02050Q0.RS_MASTER",
        sortCol: "LOCATION_CD",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true,
        canDblClick: true
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onDblClick.subscribe(onGridMasterDblClick);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function onGridMasterDblClick(e, args) {

    var row = args.row;
    var rowData;

    rowData = G_GRDMASTER.data.getItem(row);

    var isGroup = false;
    if (rowData.__group) {
        rowData = rowData.rows[0];
        isGroup = true;
    }

    var LOCATION_CD = rowData.LOCATION_CD;
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");

    var INOUT_DATE = "";
    if (!isGroup) {
        INOUT_DATE = $NC.nullToDefault(rowData.INOUT_DATE, "");
    }

    var INOUT_DATE1 = rowData.INOUT_DATE1;
    var INOUT_DATE2 = rowData.INOUT_DATE2;

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LSC02051P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LSC02050Q0.009", "입출고상세내역"),
        url: "ls/LSC02051P0.html",
        width: 900,
        height: 500,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE,
            P_INOUT_DATE1: INOUT_DATE1,
            P_INOUT_DATE2: INOUT_DATE2,
            P_LOCATION_CD: LOCATION_CD
        }
    });
}

/**
 * 로케이션별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);
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
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setValue("#edtQCust_Cd");
        $NC.setFocus("#edtQBu_Cd", true);
    }

    onChangingCondition();
}