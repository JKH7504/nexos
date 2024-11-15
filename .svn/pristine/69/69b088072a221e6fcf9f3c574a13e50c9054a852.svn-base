/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC02020Q0
 *  프로그램명         : 재고보유현황
 *  프로그램설명       : 재고보유현황 화면 Javascript
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
                ]
            },
            viewType: "h"
        },
        G_DISPLAY: {
            DAY10L: $NC.getDisplayMsg("JS.LVC02020Q0.009", "10일 이하"),
            DAY20L: $NC.getDisplayMsg("JS.LVC02020Q0.010", "20일 이하"),
            DAY30L: $NC.getDisplayMsg("JS.LVC02020Q0.011", "30일 이하"),
            DAY30M: $NC.getDisplayMsg("JS.LVC02020Q0.012", "30일 초과"),
            MONTH01L: $NC.getDisplayMsg("JS.LVC02020Q0.013", "1개월 이하"),
            MONTH13L: $NC.getDisplayMsg("JS.LVC02020Q0.014", "1개월~3개월"),
            MONTH30M: $NC.getDisplayMsg("JS.LVC02020Q0.015", "3개월 이상"),
            NONE: $NC.getDisplayMsg("JS.LVC02020Q0.016", "미지정"),
            DAYL: $NC.getDisplayMsg("JS.LVC02020Q0.017", "일 이하"),
            MONTHL: $NC.getDisplayMsg("JS.LVC02020Q0.018", "개월 이하")
        }
    });

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

    // 검색 이미지 클릭 이벤트
    $("#btnQCust_Cd").click(showCustPopup);
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    // 사업부 조회 조건 초기값 셋팅
    /*
     * $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD); $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
     */

    // 조회일자 셋팅
    $NC.setInitDateRangePicker("#dtpQAgg_Date1", "#dtpQAgg_Date2", null, "W3"); // -20

    // 콤보 셋팅
    setHighRotateDayCombo();
    setLongTermMonthCombo();
    setImpendDayCombo();

    // 차트 초기화
    stackChartInitialize("#chtBarPutawayReport");
    stackChartInitialize("#chtBarLongTermReport");
    stackChartInitialize("#chtBarRotateReport");
    stackChartInitialize("#chtBarValidReport");

    pieChartInitialize("#chtPiePutawayReport");
    pieChartInitialize("#chtPieLongTermReport");
    pieChartInitialize("#chtPieRotateReport");
    pieChartInitialize("#chtPieValidReport");
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.pieWidth = 200;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    $NC.resizeSplitView({
        containers: [
            "#divPutawayView",
            "#divLongTermView"
        ]
    }, "v");
    var chartArea = $NC.getViewHeight("#divPutawayView", false) - $NC.getViewHeight("#divTitle_Putaway");
    $NC.resizeChart("#chtPiePutawayReport", $NC.G_OFFSET.pieWidth, chartArea);
    $NC.resizeChart("#chtBarPutawayReport", $NC.getViewWidth("#divPutawayView", false) - $NC.getViewWidth("#chtPiePutawayReport"), chartArea);

    chartArea = $NC.getViewHeight("#divLongTermView", false) - $NC.getViewHeight("#divTitle_Putaway,#divAdditional_LongTerm");
    $NC.resizeChart("#chtPieLongTermReport", $NC.G_OFFSET.pieWidth, chartArea);
    $NC.resizeChart("#chtBarLongTermReport", $NC.getViewWidth("#divLongTermView", false) - $NC.getViewWidth("#chtPieLongTermReport"), chartArea);

    $NC.resizeSplitView({
        containers: [
            "#divRotateView",
            "#divValidView"
        ]
    }, "v");
    chartArea = $NC.getViewHeight("#divRotateView", false) - $NC.getViewHeight("#divTitle_Rotate,#divAdditional_Rotate");
    $NC.resizeChart("#chtPieRotateReport", $NC.G_OFFSET.pieWidth, chartArea);
    $NC.resizeChart("#chtBarRotateReport", $NC.getViewWidth("#divRotateView", false) - $NC.getViewWidth("#chtPieRotateReport"), chartArea);

    chartArea = $NC.getViewHeight("#divValidView", false) - $NC.getViewHeight("#divTitle_Valid,#divAdditional_Valid");
    $NC.resizeChart("#chtPieValidReport", $NC.G_OFFSET.pieWidth, chartArea);
    $NC.resizeChart("#chtBarValidReport", $NC.getViewWidth("#divValidView", false) - $NC.getViewWidth("#chtPieValidReport"), chartArea);
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
                alert($NC.getDisplayMsg("JS.LVC02020Q0.001", "물류센터를 먼저 선택 하십시오."));
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
                alert($NC.getDisplayMsg("JS.LVC02020Q0.002", "고객사를 먼저 입력 하십시오."));
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
                alert($NC.getDisplayMsg("JS.LVC02020Q0.003", "사업부를 먼저 입력 하십시오."));
                $NC.setValue("#edtQBrand_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onBuBrandChange(val, {
                P_BU_CD: BU_CD,
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "HIGH_ROTATE_DAY":
            inquiryMaster2(getConditionParams());
            return;
        case "LONG_TERM_MONTH":
            inquiryMaster3(getConditionParams());
            return;
        case "IMPEND_DAY":
            inquiryMaster4(getConditionParams());
            return;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var params = getConditionParams();
    if ($NC.isNull(params)) {
        return;
    }

    // 로케이션적재 현황
    $NC.serviceCall("/LVC02020Q0/getDataSet.do", {
        P_QUERY_ID: "LVC02020Q0.RS_MASTER1",
        P_QUERY_PARAMS: params
    }, onGetMaster1);

    // 회전일수 현황
    inquiryMaster2(params);
    // 장기재고 현황
    inquiryMaster3(params);
    // 유통기한 도래 현황
    inquiryMaster4(params);
}

function getConditionParams() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LVC02020Q0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    return {
        P_CENTER_CD: CENTER_CD,
        P_CUST_CD: $NC.getValue("#edtQCust_Cd", true),
        P_BU_CD: $NC.getValue("#edtQBu_Cd", true),
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
}

function inquiryMaster2(params) {

    $NC.serviceCall("/LVC02020Q0/getDataSet.do", {
        P_QUERY_ID: "LVC02020Q0.RS_MASTER2",
        P_QUERY_PARAMS: $.extend({
            P_HIGH_ROTATE_DAY: $NC.getValue("#cboQHigh_Rotate_Day")
        }, params)
    }, onGetMaster2);
}

function inquiryMaster3(params) {

    $NC.serviceCall("/LVC02020Q0/getDataSet.do", {
        P_QUERY_ID: "LVC02020Q0.RS_MASTER3",
        P_QUERY_PARAMS: $.extend({
            P_LONG_TERM_MONTH: $NC.getValue("#cboQLong_Term_Month")
        }, params)
    }, onGetMaster3);
}

function inquiryMaster4(params) {

    $NC.serviceCall("/LVC02020Q0/getDataSet.do", {
        P_QUERY_ID: "LVC02020Q0.RS_MASTER4",
        P_QUERY_PARAMS: $.extend({
            P_IMPEND_DAY: $NC.getValue("#cboQImpend_Day")
        }, params)
    }, onGetMaster4);
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
 * 파이차트 초기화
 */
function pieChartInitialize(selector) {

    var options = {
        title: {
            rendererOptions: {
                paddingBottom: 25,
                position: "bottom",
                textAlign: "center"
            }
        },
        seriesDefaults: {
            renderer: $.jqplot.PieRenderer,
            rendererOptions: {
                sliceMargin: 2,
                startAngle: 90,
                padding: 5,
                showDataLabels: true,
                shadowDepth: 1,
                dataLabels: "value"
            }
        },
        grid: {
            background: "#fbfbfb",
            drawBorder: true,
            borderColor: "#fbfbfb",
            borderWidth: 3,
            shadow: false
        },
        gridPadding: {
            top: 10,
            bottom: 35,
            left: 2,
            right: 2
        }
    };
    var initData = [
        [
            "",
            0
        ]
    ];

    $NC.setInitChartObject(selector, {
        chartOptions: options,
        initData: initData
    });
}

/**
 * 바차트 초기화
 */
function stackChartInitialize(selector) {

    var options = {
        stackSeries: true,
        seriesDefaults: {
            min: 0,
            lineWidth: 1.5,
            markerOptions: {
                size: 7.0
            },
            renderer: $.jqplot.BarRenderer,
            rendererOptions: {
                barWidth: 30,
                shadowDepth: 2
            },
            pointLabels: {
                show: true,
                hideZeros: true,
                formatString: "%'d"
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
                tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                tickOptions: {
                    angle: -25,
                    formatString: "%'d"
                },
                ticks: [
                    [
                        ""
                    ]
                ]
            },
            yaxis: {
                autoscale: true,
                min: 0,
                tickOptions: {
                    formatString: "%'d"
                }
            }
        },
        highlighter: {
            show: true,
            tooltipAxes: "y",
            tooltipLocation: "ne"
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
            right: 120
        },
        legend: {
            show: true,
            location: "se",
            placement: "outside"
        }
    };
    var initData = [
        [
            [
                "",
                ""
            ]
        ]
    ];

    $NC.setInitChartObject(selector, {
        chartOptions: options,
        initData: initData,
        scrollable: true,
        maxSeriesX: 8
    });
    $(selector).parent().css("display", "inline-block");
}

function onChangingCondition() {

    var pieOptions = {
        title: {
            text: null
        },
        series: []
    };
    var barOptions = {
        series: [
            {
                label: "데이터구분"
            }
        ],
        axes: {
            xaxis: {
                ticks: [
                    [
                        ""
                    ]
                ]
            }
        }
    };
    // 차트 초기화
    $NC.clearChartData("#chtPiePutawayReport", pieOptions);
    $NC.getChartObject("#chtBarPutawayReport").view.options.axes.xaxis.ticks = null;
    $NC.clearChartData("#chtBarPutawayReport", barOptions);
    $NC.clearChartData("#chtPieLongTermReport", pieOptions);
    $NC.getChartObject("#chtBarLongTermReport").view.options.axes.xaxis.ticks = null;
    $NC.clearChartData("#chtBarLongTermReport", barOptions);
    $NC.clearChartData("#chtPieRotateReport", pieOptions);
    $NC.getChartObject("#chtBarRotateReport").view.options.axes.xaxis.ticks = null;
    $NC.clearChartData("#chtBarRotateReport", barOptions);
    $NC.clearChartData("#chtPieValidReport", pieOptions);
    $NC.getChartObject("#chtBarValidReport").view.options.axes.xaxis.ticks = null;
    $NC.clearChartData("#chtBarValidReport", barOptions);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showCustPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if (CENTER_CD == $ND.C_ALL) {
        alert($NC.getDisplayMsg("JS.LVC02020Q0.001", "물류센터를 먼저 선택 하십시오."));
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
        alert($NC.getDisplayMsg("JS.LVC02020Q0.002", "고객사를 먼저 선택 하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
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
        alert($NC.getDisplayMsg("JS.LVC02020Q0.003", "사업부를 먼저 선택 하십시오."));
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

function onGetMaster1(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChartPie = [
        []
    ];
    var dsChartBar = [];
    var dsCkeckZoneCd = [];
    var dsZoneNm = [];
    var dsCheckTicks = [];
    var dsTicks = [];
    var dsLabels = [];
    var totalQty = 0;

    if (rCount == 0) {
        dsChartPie[0].push([
            null
        ]);
        dsChartBar[0].push([
            null
        ]);
    } else {
        var rowData, rIndex;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            if ($.inArray(rowData.ZONE_CD, dsCkeckZoneCd) < 0) {
                dsCkeckZoneCd.push(rowData.ZONE_CD);
                dsZoneNm.push({
                    label: rowData.ZONE_NM
                });
                dsChartBar.push([]);
            }
            if ($.inArray(rowData.COL_CD, dsCheckTicks) < 0) {
                dsCheckTicks.push(rowData.COL_CD);
                dsTicks.push(rowData.COL_NM);
                dsLabels.push(rowData.COL_NM + "<br>(" + $NC.getDisplayNumber(rowData.TOTAL_STOCK_QTY) + ")");
                dsChartPie[0].push(rowData.TOTAL_STOCK_QTY);
                totalQty += rowData.TOTAL_STOCK_QTY;
            }
        }
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsChartBar[$.inArray(rowData.ZONE_CD, dsCkeckZoneCd)][$.inArray(rowData.COL_CD, dsCheckTicks)] = rowData.STOCK_QTY;
        }
    }

    var dspTotalQty = $NC.getDisplayNumber(totalQty);
    $NC.setInitChartData("#chtPiePutawayReport", {
        title: {
            text: $NC.getDisplayMsg("JS.LVC02020Q0.005", "보유재고 : " + dspTotalQty, dspTotalQty)
        },
        seriesDefaults: {
            rendererOptions: {
                dataLabels: dsLabels
            }
        },
        data: dsChartPie
    });
    $NC.setInitChartData("#chtBarPutawayReport", {
        series: dsZoneNm,
        axes: {
            xaxis: {
                ticks: dsTicks
            }
        },
        data: dsChartBar
    });
}

function onGetMaster2(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChartPie = [
        []
    ];
    var dsChartBar = [
        [],
        [],
        [],
        []
    ];
    var dsCheckTicks = [];
    var dsTicks = [];
    var dsLabels = [];
    var totalQty = 0;

    if (rCount == 0) {
        //
    } else {
        var rowData, rIndex;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsChartBar[0].push(rowData.CNT_10_LESS);
            dsChartBar[1].push(rowData.CNT_20_LESS);
            dsChartBar[2].push(rowData.CNT_30_LESS);
            dsChartBar[3].push(rowData.CNT_30_BETTER);
            if ($.inArray(rowData.COL_CD, dsCheckTicks) < 0) {
                dsCheckTicks.push(rowData.COL_CD);
                dsTicks.push(rowData.COL_NM);
                dsLabels.push(rowData.COL_NM + "<br>(" + $NC.getDisplayNumber(rowData.CNT_HIGH) + ")");
                dsChartPie[0].push(rowData.CNT_HIGH);
                totalQty += rowData.CNT_HIGH;
            }
        }
    }

    var dspTotalQty = $NC.getDisplayNumber(totalQty);
    $NC.setInitChartData("#chtPieRotateReport", {
        title: {
            text: $NC.getDisplayMsg("JS.LVC02020Q0.006", "고회전상품수 : " + dspTotalQty, dspTotalQty)
        },
        seriesDefaults: {
            rendererOptions: {
                dataLabels: dsLabels
            }
        },
        data: dsChartPie
    });
    $NC.setInitChartData("#chtBarRotateReport", {
        series: [
            {
                label: $NC.G_VAR.G_DISPLAY.DAY10L
            },
            {
                label: $NC.G_VAR.G_DISPLAY.DAY20L
            },
            {
                label: $NC.G_VAR.G_DISPLAY.DAY30L
            },
            {
                label: $NC.G_VAR.G_DISPLAY.DAY30M
            }
        ],
        axes: {
            xaxis: {
                ticks: dsTicks
            }
        },
        data: dsChartBar
    });
}

function onGetMaster3(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChartPie = [
        []
    ];
    var dsChartBar = [
        [],
        [],
        []
    ];
    var dsCheckTicks = [];
    var dsTicks = [];
    var dsLabels = [];
    var totalQty = 0;

    if (rCount == 0) {
        //
    } else {
        var rIndex, rowData;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsChartBar[0].push(rowData.STOCK_QTY01);
            dsChartBar[1].push(rowData.STOCK_QTY13);
            dsChartBar[2].push(rowData.STOCK_QTY03);
            if ($.inArray(rowData.COL_CD, dsCheckTicks) < 0) {
                dsCheckTicks.push(rowData.COL_CD);
                dsTicks.push(rowData.COL_NM);
                dsLabels.push(rowData.COL_NM + "<br>(" + $NC.getDisplayNumber(rowData.LONG_TERM_STOCK_QTY) + ")");
                dsChartPie[0].push(rowData.LONG_TERM_STOCK_QTY);
                totalQty += rowData.LONG_TERM_STOCK_QTY;
            }
        }
    }

    var dspTotalQty = $NC.getDisplayNumber(totalQty);
    $NC.setInitChartData("#chtPieLongTermReport", {
        title: {
            text: $NC.getDisplayMsg("JS.LVC02020Q0.007", "장기재고 : " + dspTotalQty, dspTotalQty)
        },
        seriesDefaults: {
            rendererOptions: {
                dataLabels: dsLabels
            }
        },
        data: dsChartPie
    });
    $NC.setInitChartData("#chtBarLongTermReport", {
        series: [
            {
                label: $NC.G_VAR.G_DISPLAY.MONTH01L
            },
            {
                label: $NC.G_VAR.G_DISPLAY.MONTH13L
            },
            {
                label: $NC.G_VAR.G_DISPLAY.MONTH30M
            }
        ],
        axes: {
            xaxis: {
                ticks: dsTicks
            }
        },
        data: dsChartBar
    });
}

function onGetMaster4(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChartPie = [
        []
    ];
    var dsChartBar = [
        [],
        [],
        [],
        []
    ];
    var dsCheckTicks = [];
    var dsTicks = [];
    var dsLabels = [];
    var totalQty = 0;

    if (rCount == 0) {
        //
    } else {
        var rowData, rIndex;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsChartBar[0].push(rowData.STOCK_QTY01);
            dsChartBar[1].push(rowData.STOCK_QTY13);
            dsChartBar[2].push(rowData.STOCK_QTY03);
            dsChartBar[3].push(rowData.STOCK_QTY00);
            if ($.inArray(rowData.COL_CD, dsCheckTicks) < 0) {
                dsCheckTicks.push(rowData.COL_CD);
                dsTicks.push(rowData.COL_NM);
                dsLabels.push(rowData.COL_NM + "<br>(" + $NC.getDisplayNumber(rowData.IMPEND_STOCK_QTY) + ")");
                dsChartPie[0].push(rowData.IMPEND_STOCK_QTY);
                totalQty += rowData.IMPEND_STOCK_QTY;
            }
        }
    }

    var dspTotalQty = $NC.getDisplayNumber(totalQty);
    $NC.setInitChartData("#chtPieValidReport", {
        title: {
            text: $NC.getDisplayMsg("JS.LVC02020Q0.008", "임박재고 : " + dspTotalQty, dspTotalQty)
        },
        seriesDefaults: {
            rendererOptions: {
                dataLabels: dsLabels
            }
        },
        data: dsChartPie
    });
    $NC.setInitChartData("#chtBarValidReport", {
        series: [
            {
                label: $NC.G_VAR.G_DISPLAY.MONTH01L
            },
            {
                label: $NC.G_VAR.G_DISPLAY.MONTH13L
            },
            {
                label: $NC.G_VAR.G_DISPLAY.MONTH30M
            },
            {
                label: $NC.G_VAR.G_DISPLAY.NONE
            }
        ],
        axes: {
            xaxis: {
                ticks: dsTicks
            }
        },
        data: dsChartBar
    });
}

function setHighRotateDayCombo() {

    var dsResult = [];
    for (var rIndex = 1; rIndex < 31; rIndex++) {
        dsResult.push({
            COMMON_CD: rIndex,
            COMMON_CD_F: rIndex + $NC.G_VAR.G_DISPLAY.DAYL
        });
    }

    $NC.setInitComboData({
        selector: "#cboQHigh_Rotate_Day",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        data: dsResult,
        onComplete: function() {
            $NC.setValue("#cboQHigh_Rotate_Day", "10");
        }
    });
}

function setLongTermMonthCombo() {

    var dsResult = [];
    for (var rIndex = 1; rIndex < 13; rIndex++) {
        dsResult.push({
            COMMON_CD: rIndex,
            COMMON_CD_F: rIndex + $NC.G_VAR.G_DISPLAY.MONTHL
        });
    }

    $NC.setInitComboData({
        selector: "#cboQLong_Term_Month",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        data: dsResult,
        onComplete: function() {
            $NC.setValue("#cboQLong_Term_Month", "1");
        }
    });
}

function setImpendDayCombo() {

    var dsCustom = [
        10,
        15,
        20,
        30,
        60,
        90
    ];
    var dsResult = [];
    for (var rIndex = 0, rCount = dsCustom.length; rIndex < rCount; rIndex++) {
        dsResult.push({
            COMMON_CD: dsCustom[rIndex],
            COMMON_CD_F: dsCustom[rIndex] + $NC.G_VAR.G_DISPLAY.DAYL
        });
    }

    $NC.setInitComboData({
        selector: "#cboQImpend_Day",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        data: dsResult,
        onComplete: function() {
            $NC.setValue("#cboQImpend_Day", "10");
        }
    });
}
