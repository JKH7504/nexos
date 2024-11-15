/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC03010Q0
 *  프로그램명         : 입고추이
 *  프로그램설명       : 입고추이 화면 Javascript
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
        autoResizeSplitView: {
            splitViews: {
                containers: [
                    "#divLeftView",
                    "#divRightView"
                ],
                sizes: [
                    450
                ]
            },
            viewType: "h"
        }
    });

    // 라인차트 초기화
    lineChartInitialize("#chtWeekReport");
    lineChartInitialize("#chtMonthReport");
    lineChartInitialize("#chtQuarterReport");
    lineChartInitialize("#chtYearReport");

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
        addAll: true
    });

    $("#btnQCust_Cd").click(showCustPopup);
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

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

    $NC.resizeSplitView({
        containers: [
            "#divWeekView",
            "#divQuarterView"
        ]
    }, "v");
    $NC.resizeChart("#chtWeekReport");
    $NC.resizeChart("#chtQuarterReport");

    $NC.resizeSplitView({
        containers: [
            "#divMonthView",
            "#divYearView"
        ]
    }, "v");
    $NC.resizeChart("#chtMonthReport");
    $NC.resizeChart("#chtYearReport");
}

function _OnLoaded() {

}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            // 고객사, 사업부, 브랜드 조회조건 초기화
            $NC.setValue("#edtQCust_Cd");
            $NC.setValue("#edtQCust_Nm");
            $NC.setValue("#edtQBu_Cd");
            $NC.setValue("#edtQBu_Nm");
            $NC.setValue("#edtQBrand_Cd");
            $NC.setValue("#edtQBrand_Nm");
            break;
        case "CUST_CD":
            // 사업부, 브랜드 조회조건 초기화
            $NC.setValue("#edtQBu_Cd");
            $NC.setValue("#edtQBu_Nm");
            $NC.setValue("#edtQBrand_Cd");
            $NC.setValue("#edtQBrand_Nm");

            if ($NC.isNotNull(val) && $NC.getValue("#cboQCenter_Cd") == $ND.C_ALL) {
                alert($NC.getDisplayMsg("JS.LVC03010Q0.001", "물류센터를 먼저 선택 하십시오."));
                $NC.setValue("#edtQCust_Cd");
                $NC.setFocus("#cboQCenter_Cd");
                return;
            }
            $NP.onCustChange(val, {
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onCustPopup);
            return;
        case "BU_CD":
            // 브랜드 조회조건 초기화
            $NC.setValue("#edtQBrand_Cd");
            $NC.setValue("#edtQBrand_Nm");

            var CUST_CD = $NC.getValue("#edtQCust_Cd");
            if ($NC.isNotNull(val) && $NC.isNull(CUST_CD)) {
                alert($NC.getDisplayMsg("JS.LVC03010Q0.002", "고객사를 먼저 입력 하십시오."));
                $NC.setValue("#edtQBu_Cd");
                $NC.setFocus("#edtQCust_Cd");
                return;
            }
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_CUST_CD: CUST_CD,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "BRAND_CD":
            var BU_CD = $NC.getValue("#edtQBu_Cd");
            if ($NC.isNotNull(val) && $NC.isNull(BU_CD)) {
                alert($NC.getDisplayMsg("JS.LVC03010Q0.003", "사업부를 먼저 입력 하십시오."));
                $NC.setValue("#edtQBrand_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onBuBrandChange(val, {
                P_BU_CD: BU_CD,
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    var P_QUERY_PARAMS = {
        P_CENTER_CD: CENTER_CD,
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_BRAND_CD: BRAND_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    $NC.serviceCall("/LVC03010Q0/getDataSet.do", {
        P_QUERY_ID: "LVC03010Q0.RS_MASTER1",
        P_QUERY_PARAMS: P_QUERY_PARAMS
    }, onGetWeekReport);

    $NC.serviceCall("/LVC03010Q0/getDataSet.do", {
        P_QUERY_ID: "LVC03010Q0.RS_MASTER2",
        P_QUERY_PARAMS: P_QUERY_PARAMS
    }, onGetMonthReport);

    $NC.serviceCall("/LVC03010Q0/getDataSet.do", {
        P_QUERY_ID: "LVC03010Q0.RS_MASTER3",
        P_QUERY_PARAMS: P_QUERY_PARAMS
    }, onGetQuarterReport);

    $NC.serviceCall("/LVC03010Q0/getDataSet.do", {
        P_QUERY_ID: "LVC03010Q0.RS_MASTER4",
        P_QUERY_PARAMS: P_QUERY_PARAMS
    }, onGetYearReport);

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

function lineChartInitialize(selector) {

    var options = {
        seriesDefaults: {
            min: 0,
            lineWidth: 1.5,
            markerOptions: {
                size: 7.0
            }
        },
        series: [
            {
                label: "데이터구분"
            }
        ],
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
                return seriesData[0] + ", " + $NC.getDisplayNumber(seriesData[1]);
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
        },
        legend: {
            show: true,
            placement: "inside"
        }
    };
    var initData = [
        [
            [
                null
            ]
        ]
    ];

    $NC.setInitChartObject(selector, {
        chartOptions: options,
        initData: initData
    });
}

/**
 * 주간 일자별 입고량 검색 결과
 */
function onGetWeekReport(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChart = [
        []
    ];
    var dsSeries = [];

    if (rCount == 0) {
        dsChart[0].push([
            null
        ]);
        dsSeries.push({
            label: "데이터구분"
        });
    } else {
        var rowData, rIndex, mIndex, mCount;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsSeries.push({
                label: rowData.COL_NM
            });

            dsChart[rIndex] = [];
            for (mIndex = 1, mCount = 7 + 1; mIndex < mCount; mIndex++) {
                dsChart[rIndex].push([
                    rowData["DAY_DISP" + mIndex],
                    rowData["IN_QTY" + mIndex]
                ]);
            }
        }
    }

    $NC.setInitChartData("#chtWeekReport", {
        series: dsSeries,
        data: dsChart
    });
}

/**
 * 월간 일자별 입고량 검색 결과
 */
function onGetMonthReport(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChart = [
        []
    ];
    var dsSeries = [];

    if (rCount == 0) {
        dsChart[0].push([
            null
        ]);
        dsSeries.push({
            label: "데이터구분"
        });
    } else {
        var rowData, rIndex, mIndex, mCount;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsSeries.push({
                label: rowData.COL_NM
            });

            dsChart[rIndex] = [];
            for (mIndex = 1, mCount = 28 + 1; mIndex < mCount; mIndex++) {
                dsChart[rIndex].push([
                    mIndex,
                    rowData["IN_QTY" + mIndex]
                ]);
            }
            if (rowData.DAY_CNT >= 29) {
                dsChart[rIndex].push([
                    29,
                    rowData.IN_QTY29
                ]);
            }
            if (rowData.DAY_CNT >= 30) {
                dsChart[rIndex].push([
                    30,
                    rowData.IN_QTY30
                ]);
            }
            if (rowData.DAY_CNT == 31) {
                dsChart[rIndex].push([
                    31,
                    rowData.IN_QTY31
                ]);
            }
        }
    }

    $NC.setInitChartData("#chtMonthReport", {
        series: dsSeries,
        data: dsChart
    });
}

/**
 * 년간 분기별 입고량 검색 결과
 */
function onGetQuarterReport(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChart = [
        []
    ];
    var dsSeries = [];

    if (rCount == 0) {
        dsChart[0].push([
            null
        ]);
        dsSeries.push({
            label: "데이터구분"
        });
    } else {
        var rowData, rIndex, mIndex, mCount;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsSeries.push({
                label: rowData.COL_NM
            });

            dsChart[rIndex] = [];
            for (mIndex = 1, mCount = 4 + 1; mIndex < mCount; mIndex++) {
                dsChart[rIndex].push([
                    rowData["QUARTER_DISP" + mIndex],
                    rowData["IN_QTY" + mIndex]
                ]);
            }
        }
    }

    $NC.setInitChartData("#chtQuarterReport", {
        series: dsSeries,
        data: dsChart
    });
}

/**
 * 년간 월별 입고량 검색 결과
 */
function onGetYearReport(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChart = [
        []
    ];
    var dsSeries = [];

    if (rCount == 0) {
        dsChart[0].push([
            null
        ]);
        dsSeries.push({
            label: "데이터구분"
        });
    } else {
        var rowData, rIndex, mIndex, mCount;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsSeries.push({
                label: rowData.COL_NM
            });

            dsChart[rIndex] = [];
            for (mIndex = 1, mCount = 12 + 1; mIndex < mCount; mIndex++) {
                dsChart[rIndex].push([
                    rowData["MONTH_DISP" + mIndex],
                    rowData["IN_QTY" + mIndex]
                ]);
            }
        }
    }

    $NC.setInitChartData("#chtYearReport", {
        series: dsSeries,
        data: dsChart
    });
}

function onChangingCondition() {

    var dsSeries = [
        {
            label: "데이터구분"
        }
    ];

    // 차트 초기화
    $NC.clearChartData("#chtWeekReport", {
        series: dsSeries
    });
    $NC.clearChartData("#chtMonthReport", {
        series: dsSeries
    });
    $NC.clearChartData("#chtQuarterReport", {
        series: dsSeries
    });
    $NC.clearChartData("#chtYearReport", {
        series: dsSeries
    });

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showCustPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if (CENTER_CD == $ND.C_ALL) {
        alert($NC.getDisplayMsg("JS.LVC03010Q0.001", "물류센터를 먼저 선택 하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    $NP.showCustPopup({
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onCustPopup, function() {
        $NC.setFocus("#edtQCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onCustPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtQCust_Nm", resultInfo.CUST_NM);
    } else {
        $NC.setValue("#edtQCust_Cd");
        $NC.setValue("#edtQCust_Nm");
        $NC.setFocus("#edtQCust_Cd", true);
    }
    // 사업부, 브랜드 조회조건 초기화
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.LVC03010Q0.002", "고객사를 먼저 선택 하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_CUST_CD: CUST_CD,
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
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LVC03010Q0.003", "사업부를 먼저 선택 하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

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
