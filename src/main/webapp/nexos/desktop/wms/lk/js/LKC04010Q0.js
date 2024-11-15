/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LKC04010Q0
 *  프로그램명         : 재고실사오차율추이
 *  프로그램설명       : 재고실사오차율추이 화면 Javascript
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: 450
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 차트 초기화
    chartInitialize("#chtMaster", [
        "오차율",
        "오차건수"
    ]);

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    $NC.setInitDateRangePicker("#dtpQInvest_Date1", "#dtpQInvest_Date2");

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

    $NC.resizeChart("#chtMaster");
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
        case "INVEST_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LKC04010Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INVEST_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LKC04010Q0.002", "검색 종료일자를 정확히 입력하십시오."));
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
        case "DISPLAY_DIV1":
        case "DISPLAY_DIV2":
            if (val == $ND.C_NO) {
                if ($NC.isNull($NC.getValueCheckGroup("chkDisplay_Div"))) {
                    alert($NC.getDisplayMsg("JS.LKC04010Q0.003", "표시항목은 하나 이상 선택해야 됩니다."));
                    $NC.setValue(view, true);
                    return;
                }
            }
            if (G_GRDMASTER.data.getLength() > 0) {
                chartDataInitialize();
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
        alert($NC.getDisplayMsg("JS.LKC04010Q0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LKC04010Q0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
    }
    var INVEST_DATE1 = $NC.getValue("#dtpQInvest_Date1");
    if ($NC.isNull(INVEST_DATE1)) {
        alert($NC.getDisplayMsg("JS.LKC04010Q0.006", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInvest_Date1");
        return;
    }
    var INVEST_DATE2 = $NC.getValue("#dtpQInvest_Date2");
    if ($NC.isNull(INVEST_DATE2)) {
        alert($NC.getDisplayMsg("JS.LKC04010Q0.007", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInvest_Date2");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INVEST_DATE1: INVEST_DATE1,
        P_INVEST_DATE2: INVEST_DATE2,
        P_BRAND_CD: BRAND_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LKC04010Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        id: "INVEST_MONTH",
        field: "INVEST_DATE",
        name: "실사월",
        cssClass: "styCenter",
        summaryTitle: "[전체합계]"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_CNT",
        field: "TOTAL_CNT",
        name: "실사건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_CNT",
        field: "ERROR_CNT",
        name: "오차건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_RATE",
        field: "ERROR_RATE",
        name: "오차율",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0,
        summaryRow: {
            visible: true,
            resultFn: function(field, summary) {
                if (field == "ERROR_RATE") {
                    var result = Math.round(summary.ERROR_CNT / summary.TOTAL_CNT * 10000) / 100;
                    return isNaN(result) ? 0 : result;
                } else {
                    return summary[field];
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LKC04010Q0.RS_MASTER",
        sortCol: "INVEST_DATE",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onGetCellValue.subscribe(grdMasterOnGetCellValue);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 특정 Cell 값에 대한 특수한 처리가 필요할 경우 경우 구현
 * 
 * @param event
 *        jQuery Event Object
 * @param args
 *        Event Parameter Object row {Number} Active Row Index cell {Number} Active Cell Index item {Object} Active Row Data column {Object} column
 *        definition value {String} Current Cell Value grid {Object} Grid Object
 */
function grdMasterOnGetCellValue(e, args) {

    var rowData = args.item;
    // 특정 값 체크 다른 값으로 표현
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "INVEST_MONTH":
            if ($NC.isNotNull(rowData.INVEST_DATE)) {
                return rowData.INVEST_DATE.substring(0, 7);
            }
            break;
    }
}

function chartDataInitialize() {

    var rCount = G_GRDMASTER.data.getLength();
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
        var rowData;
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(rIndex);
            dsChart[0].push([
                rowData.INVEST_DATE_SHORT,
                rowData.ERROR_RATE,
                rowData.INVEST_DATE
            ]);
            dsChart[1].push([
                rowData.INVEST_DATE_SHORT,
                rowData.ERROR_CNT,
                rowData.INVEST_DATE
            ]);
        }
    }

    var chtObject = $NC.getChartObject("#chtMaster");
    $NC.setInitChartData(chtObject, {
        series: [
            {
                show: $NC.getValue("#chkDisplay_Div1") == $ND.C_YES
            },
            {
                show: $NC.getValue("#chkDisplay_Div2") == $ND.C_YES
            }
        ],
        data: dsChart
    });

    if (chtObject.globalVar.scrollable) {
        $NC.resizeChart(chtObject.selector);
    }
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
            lineWidth: 1.5,
            markerOptions: {
                size: 7.0
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
                tickRenderer: $.jqplot.CanvasAxisTickRenderer
            },
            yaxis: {
                min: 0,
                autoscale: true,
                tickOptions: {
                    formatString: "%'d"
                }
            }
        },
        highlighter: {
            show: true,
            tooltipAxes: "both",
            tooltipLocation: "ne",
            tooltipContentEditor: function(str, seriesIndex, pointIndex, plot) {
                var seriesData = plot.data[seriesIndex][pointIndex];
                return seriesData[2].substring(0, 7) + ", " + $NC.getDisplayNumber(seriesData[1]);
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
            bottom: 40,
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
        scrollable: true
    });
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    chartDataInitialize();

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

    $NC.clearGridData(G_GRDMASTER);

    var chtObject = $NC.getChartObject("#chtMaster");
    $NC.clearChartData(chtObject);

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
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setFocus("#edtQBu_Cd", true);
    }
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
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
