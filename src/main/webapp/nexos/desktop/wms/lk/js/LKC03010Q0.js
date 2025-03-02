/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LKC03010Q0
 *  프로그램명         : 입출고실적
 *  프로그램설명       : 입출고실적 화면 Javascript
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
        autoResizeView: {
            container: "#divMasterView"
        },
        autoResizeFixedView: function() {
            return {
                viewFirst: {
                    container: "#div" + $NC.G_VAR.activeTab + "LeftView",
                    grids: "#grd" + $NC.G_VAR.activeTab + "Master"
                },
                viewSecond: {
                    container: "#div" + $NC.G_VAR.activeTab + "RightView"
                },
                viewType: "h",
                viewFixed: 450
            };
        },
        activeTab: "T1"
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();

    // 차트 초기화
    chartInitialize("#chtT1Master", [
        "입고수량",
        "입고율"
    ]);
    chartInitialize("#chtT2Master", [
        "출고수량",
        "출고율"
    ]);

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQDept_Cd").click(showDeptPopup);

    $NC.setInitDateRangePicker("#dtpQInout_Date1", "#dtpQInout_Date2");

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

    $NC.resizeChart("#cht" + $NC.G_VAR.activeTab + "Master");
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
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LKC03010Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INOUT_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LKC03010Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
        case "DEPT_CD":
            $NP.onDeptChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DEPT_CD: val
            }, onDeptPopup);
            break;
    }

    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "T1_DISPLAY_DIV1":
        case "T1_DISPLAY_DIV2":
        case "T2_DISPLAY_DIV1":
        case "T2_DISPLAY_DIV2":
            if (val == $ND.C_NO) {
                if ($NC.isNull($NC.getValueCheckGroup("chk" + $NC.G_VAR.activeTab + "_Display_Div"))) {
                    alert($NC.getDisplayMsg("JS.LKC03010Q0.003", "표시항목은 하나 이상 선택해야 됩니다."));
                    $NC.setValue(view, true);
                    return;
                }
            }
            var grdObject = $NC.getGridObject("#grd" + $NC.G_VAR.activeTab + "Master");
            if (grdObject.data.getLength() > 0) {
                chartDataInitialize(grdObject);
            }
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LKC03010Q0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LKC03010Q0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
    }
    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    if ($NC.isNull(INOUT_DATE1)) {
        alert($NC.getDisplayMsg("JS.LKC03010Q0.006", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date1");
        return;
    }
    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
    if ($NC.isNull(INOUT_DATE2)) {
        alert($NC.getDisplayMsg("JS.LKC03010Q0.007", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date2");
        return;
    }
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var DEPT_CD = $NC.getValue("#edtQDept_Cd", true);

    var grdObject = $NC.getGridObject("#grd" + $NC.G_VAR.activeTab + "Master");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(grdObject);
    // 파라메터 세팅
    grdObject.globalVar.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INOUT_DATE1: INOUT_DATE1,
        P_INOUT_DATE2: INOUT_DATE2,
        P_BRAND_CD: BRAND_CD,
        P_DEPT_CD: DEPT_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/LKC03010Q0/getDataSet.do", $NC.getGridParams(grdObject), onGetMaster);
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

    $NC.G_VAR.activeTab = "T" + ($NC.getTabActiveIndex("#divMasterView") + 1);
    $NC.onGlobalResize();
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처코드",
        cssClass: "styCenter",
        summaryTitle: "[전체합계]"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_CNT",
        field: "ORDER_CNT",
        name: "예정상품수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_AMT",
        field: "ORDER_AMT",
        name: "예정금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_CNT",
        field: "CONFIRM_CNT",
        name: "확정상품수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_AMT",
        field: "CONFIRM_AMT",
        name: "확정금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DIFF_QTY",
        field: "DIFF_QTY",
        name: "차이수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DIFF_AMT",
        field: "DIFF_AMT",
        name: "차이금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_RATE",
        field: "QTY_RATE",
        name: "입고율",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CNT_RATE",
        field: "CNT_RATE",
        name: "상품입고율",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 2,
        summaryRow: {
            visible: true,
            resultFn: function(field, summary) {
                var result;
                switch (field) {
                    case "QTY_RATE":
                        result = Math.round(summary.CONFIRM_QTY / summary.ORDER_QTY * 10000) / 100;
                        return isNaN(result) ? 0 : result;
                    case "CNT_RATE":
                        result = Math.round(summary.CONFIRM_CNT / summary.ORDER_CNT * 10000) / 100;
                        return isNaN(result) ? 0 : result;
                    case "DIFF_QTY":
                        result = Math.round(summary.ORDER_QTY - summary.CONFIRM_QTY);
                        return isNaN(result) ? 0 : result;
                    case "DIFF_AMT":
                        result = Math.round(summary.ORDER_AMT - summary.CONFIRM_AMT);
                        return isNaN(result) ? 0 : result;
                    default:
                        return summary[field];
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LKC03010Q0.RS_T1_MASTER",
        sortCol: "CUST_CD",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function chartDataInitialize(grdObject) {

    var rCount = grdObject.data.getLength();
    var dsChart = [
        [],
        []
    ];
    if (rCount == 0) {
        dsChart[0].push([
            null
        ]);
        dsChart[1].push([
            null
        ]);
    } else {
        var seriesXColumn;
        if ($NC.G_VAR.activeTab == "T1") {
            seriesXColumn = "VENDOR_NM";
        } else {
            seriesXColumn = "DELIVERY_NM";
        }
        var rowData;
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = grdObject.data.getItem(rIndex);
            dsChart[0].push([
                getEllipsisValue(rowData[seriesXColumn] || ""),
                rowData.CONFIRM_QTY,
                rowData[seriesXColumn]
            ]);
            dsChart[1].push([
                getEllipsisValue(rowData[seriesXColumn] || ""),
                rowData.CNT_RATE,
                rowData[seriesXColumn]
            ]);
        }
    }

    var chtObject = $NC.getChartObject("#cht" + $NC.G_VAR.activeTab + "Master");
    $NC.setInitChartData(chtObject, {
        series: [
            {
                show: $NC.getValue("#chk" + $NC.G_VAR.activeTab + "_Display_Div1") == $ND.C_YES
            },
            {
                show: $NC.getValue("#chk" + $NC.G_VAR.activeTab + "_Display_Div2") == $ND.C_YES
            }
        ],
        data: dsChart
    });

    if (chtObject.globalVar.scrollable) {
        $NC.resizeChart(chtObject.selector);
    }
}

function getEllipsisValue(value) {

    return value.length > 8 ? value.substring(0, 8) + "…" : value;
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처코드",
        cssClass: "styCenter",
        summaryTitle: "[전체합계]"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_CNT",
        field: "ORDER_CNT",
        name: "예정상품수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_AMT",
        field: "ORDER_AMT",
        name: "예정금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_CNT",
        field: "CONFIRM_CNT",
        name: "확정상품수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_AMT",
        field: "CONFIRM_AMT",
        name: "확정금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DIFF_QTY",
        field: "DIFF_QTY",
        name: "차이수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DIFF_AMT",
        field: "DIFF_AMT",
        name: "차이금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_RATE",
        field: "QTY_RATE",
        name: "출고율",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CNT_RATE",
        field: "CNT_RATE",
        name: "상품출고율",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 2,
        summaryRow: {
            visible: true,
            resultFn: function(field, summary) {
                var result;
                switch (field) {
                    case "QTY_RATE":
                        result = Math.round(summary.CONFIRM_QTY / summary.ORDER_QTY * 10000) / 100;
                        return isNaN(result) ? 0 : result;
                    case "CNT_RATE":
                        result = Math.round(summary.CONFIRM_CNT / summary.ORDER_CNT * 10000) / 100;
                        return isNaN(result) ? 0 : result;
                    case "DIFF_QTY":
                        result = Math.round(summary.ORDER_QTY - summary.CONFIRM_QTY);
                        return isNaN(result) ? 0 : result;
                    case "DIFF_AMT":
                        result = Math.round(summary.ORDER_AMT - summary.CONFIRM_AMT);
                        return isNaN(result) ? 0 : result;
                    default:
                        return summary[field];
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LKC03010Q0.RS_T2_MASTER",
        sortCol: "DELIVERY_CD",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

function chartInitialize(selector, seriesTitles) {

    var series = [];
    for ( var rIndex in seriesTitles) {
        series.push({
            label: seriesTitles[rIndex]
        });
    }

    var options = {
        seriesDefaults: {
            min: 0,
            lineWidth: 1.5,
            markerOptions: {
                size: 7.0
            },
            renderer: $.jqplot.BarRenderer,
            rendererOptions: {
                fillToZero: true,
                shadowDepth: 2
            }
        },
        series: series,
        axesDefaults: {
            rendererOptions: {
                drawBaseline: false
            }
        },
        axes: {
            xaxis: {
                autoscale: true,
                renderer: $.jqplot.CategoryAxisRenderer,
                tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                tickOptions: {
                    angle: -20
                }
            },
            yaxis: {
                autoscale: true,
                tickOptions: {
                    formatString: "%'d"
                }
            },
            y2axis: {
                autoscale: true,
                tickOptions: {
                    formatString: "%d%%"
                }
            }
        },
        highlighter: {
            show: true,
            tooltipAxes: "both",
            tooltipLocation: "ne",
            tooltipContentEditor: function(str, seriesIndex, pointIndex, plot) {
                var seriesData = plot.data[seriesIndex][pointIndex];
                return seriesData[2] + ", " + $NC.getDisplayNumber(seriesData[1]);
            }
        },
        grid: {
            gridLineColor: "#e2e2e2",
            background: "#fafafa",
            borderColor: "#dbdbdb",
            gridLineWidth: 1.0,
            borderWidth: 1,
            shadow: false
        },
        gridPadding: {
            top: 20,
            bottom: 70,
            left: 80,
            right: 30
        },        legend: {
            show: true,
            placement: "inside"
        }
    };
    var initData = [
        [
            [
                null
            ]
        ],
        [
            [
                null
            ]
        ]
    ];

    $NC.setInitChartObject(selector, {
        chartOptions: options,
        initData: initData,
        scrollable: true,
        maxSeriesX: 25
    });
}

function onGetMaster(ajaxData) {

    var grdObject = $NC.getGridObject("#grd" + $NC.G_VAR.activeTab + "Master");

    $NC.setInitGridData(grdObject, ajaxData);
    $NC.setInitGridAfterOpen(grdObject);

    chartDataInitialize(grdObject);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onChangingCondition() {

    for (var rIndex = 1, rCount = 3; rIndex < rCount; rIndex++) {
        $NC.clearGridData("#grdT" + rIndex + "Master");
        $NC.clearChartData("#chtT" + rIndex + "Master");
    }

    var chtObject = $NC.getChartObject("#cht" + $NC.G_VAR.activeTab + "Master");
    if (chtObject.globalVar.scrollable) {
        $NC.resizeChart(chtObject.selector);
    }

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
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

    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    // 부서 조회조건 초기화
    $NC.setValue("#edtQDept_Cd");
    $NC.setValue("#edtQDept_Nm");

    onChangingCondition();
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

/**
 * 부서 검색 이미지 클릭
 * 
 * @param resultInfo
 */

function showDeptPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

    $NP.showDeptPopup({
        P_CUST_CD: CUST_CD,
        P_DEPT_CD: $ND.C_ALL
    }, onDeptPopup, function() {
        $NC.setFocus("#edtQDept_Cd", true);
    });
}

/**
 * 부서 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onDeptPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQDept_Cd", resultInfo.DEPT_CD);
        $NC.setValue("#edtQDept_Nm", resultInfo.DEPT_NM);
    } else {
        $NC.setValue("#edtQDept_Cd");
        $NC.setValue("#edtQDept_Nm");
        $NC.setFocus("#edtQDept_Cd", true);
    }

    onChangingCondition();
}