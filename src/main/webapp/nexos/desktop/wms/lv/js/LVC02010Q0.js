/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC02010Q0
 *  프로그램명         : 재고Capa 현황
 *  프로그램설명       : 재고Capa 현황 화면 Javascript
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
        G_TOOLTIP: [
            [
                $NC.getDisplayMsg("JS.LVC02010Q0.003", "전체셀수"),
                $NC.getDisplayMsg("JS.LVC02010Q0.004", "공셀수")
            ],
            [
                $NC.getDisplayMsg("JS.LVC02010Q0.003", "전체셀수"),
                $NC.getDisplayMsg("JS.LVC02010Q0.005", "적재셀수")
            ]
        ]
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

    // 바차트 초기화
    barChartInitialize("#chtZoneEmptyLocReport");
    barChartInitialize("#chtBankEmptyLocReport");
    barChartInitialize("#chtZonePutawayReport");
    barChartInitialize("#chtBankPutawayReport");
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
            "#divZoneEmptyLocView",
            "#divBankEmptyLocView"
        ]
    }, "v");
    var chartArea = $("#divZoneEmptyLocView").width() - $NC.G_LAYOUT.space.width;
    $NC.resizeChart("#chtZoneEmptyLocReport", chartArea - $("#chtZoneEmptyLocPerBar").outerWidth(true));
    $NC.resizeChart("#chtBankEmptyLocReport", chartArea - $("#chtBankEmptyLocPerBar").outerWidth(true));

    $NC.resizeSplitView({
        containers: [
            "#divZonePutawayView",
            "#divBankPutawayView"
        ]
    }, "v");
    chartArea = $("#divZonePutawayView").width() - $NC.G_LAYOUT.space.width;
    $NC.resizeChart("#chtZonePutawayReport", chartArea - $("#chtZonePutawayPerBar").outerWidth(true));
    $NC.resizeChart("#chtBankPutawayReport", chartArea - $("#chtBankPutawayPerBar").outerWidth(true));
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
        alert($NC.getDisplayMsg("JS.LVC02010Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    // 공셀 View, 적재율 View
    $NC.serviceCall("/LVC02010Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_EMPTYLOC",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD
        }
    }, onGetMaster);
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
 * 바차트 초기화
 */
function barChartInitialize(selector) {

    var options = {
        seriesDefaults: {
            min: 0,
            lineWidth: 1.5,
            markerOptions: {
                size: 7.0
            },
            renderer: $.jqplot.BarRenderer,
            rendererOptions: {
                barWidth: 30,
                fillToZero: true,
                shadowDepth: 2

            },
            pointLabels: {
                show: true,
                seriesLabelIndex: 1
            }
        },
        series: [
            {
                pointLabels: {
                    location: "n"
                }
            },
            {
                pointLabels: {
                    location: "s"
                }
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
                    angle: -25
                }
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
                if (plot.targetId == "#chtZoneEmptyLocReport") {
                    return seriesData[0] + ", " + $NC.G_VAR.G_TOOLTIP[0][seriesIndex] + ": " + $NC.getDisplayNumber(seriesData[1]);
                } else {
                    return seriesData[0] + ", " + $NC.G_VAR.G_TOOLTIP[1][seriesIndex] + ": " + $NC.getDisplayNumber(seriesData[1]);
                }
            }
        },
        grid: {
            gridLineColor: "#e2e2e2",
            background: "#fafafa",
            borderColor: "#dbdbdb",
            borderWidth: 1,
            shadow: false
        },
        gridPadding: {
            top: 30,
            bottom: 70,
            left: 60,
            right: 15
        }
    };
    var initData = [
        [
            [
                "",
                0
            ]
        ],
        [
            [
                "",
                0
            ]
        ]
    ];

    $NC.setInitChartObject(selector, {
        chartOptions: options,
        initData: initData,
        scrollable: true,
        maxSeriesX: 14
    });
    $(selector).parent().css("display", "inline-block");

    var chartOnDblClick = window[selector.replace("#", "") + "OnDblClick"];
    if ($.isFunction(chartOnDblClick)) {
        $(selector).bind("jqplotDblClick", chartOnDblClick);
    }
}

function chtZoneEmptyLocReportOnDblClick(ev, gridpos, datapos, neighbor, plot) {

    if (!neighbor) {
        return;
    }

    $NC.clearChartData("#chtBankEmptyLocReport");
    setOneBarChart("#chtBankEmptyLocPerBar", 0);

    var QUERY_PARAMS = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_ZONE_CD: neighbor.data[2].ZONE_CD
    };
    $NC.serviceCall("/LVC02010Q0/getDataSet.do", {
        P_QUERY_ID: "LVC02010Q0.RS_EMPTYLOCBANK",
        P_QUERY_PARAMS: QUERY_PARAMS
    }, onGetBankEmptyLoc);
}

function chtZonePutawayReportOnDblClick(ev, gridpos, datapos, neighbor, plot) {

    if (!neighbor) {
        return;
    }

    $NC.clearChartData("#chtBankPutawayReport");
    setOneBarChart("#chtBankPutawayPerBar", 0);

    var QUERY_PARAMS = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_ZONE_CD: neighbor.data[2].ZONE_CD
    };
    $NC.serviceCall("/LVC02010Q0/getDataSet.do", {
        P_QUERY_ID: "LVC02010Q0.RS_PUTAWAYBANK",
        P_QUERY_PARAMS: QUERY_PARAMS
    }, onGetBankPutaway);
}

function onChangingCondition() {

    // 차트 초기화
    $NC.clearChartData("#chtZoneEmptyLocReport");
    setOneBarChart("#chtZoneEmptyLocPerBar", 0);

    $NC.clearChartData("#chtBankEmptyLocReport");
    setOneBarChart("#chtBankEmptyLocPerBar", 0);

    $NC.clearChartData("#chtZonePutawayReport");
    setOneBarChart("#chtZonePutawayPerBar", 0);

    $NC.clearChartData("#chtBankPutawayReport");
    setOneBarChart("#chtBankPutawayPerBar", 0);

    $NC.setValue("#divBankEmptyLocReport");
    $NC.setValue("#divBankPutawayReport");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showCustPopup() {

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
    onChangingCondition();
}

/**
 * 공셀 View, 적재율 View 차트 업데이트
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChartZoneEmptyLoc = [
        [ ],
        [ ]
    ];
    var dsChartZonePutaway = [
        [ ],
        [ ]
    ];

    var refRowData = {
        EMPTY_LOC_RATE: 0,
        USING_RATE: 0
    };
    if (rCount == 0) {
        dsChartZoneEmptyLoc[0].push([
            null
        ]);
        dsChartZonePutaway[1].push([
            null
        ]);
    } else {
        var rowData;
        refRowData = dsResult[0];
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsChartZoneEmptyLoc[0].push([
                rowData.ZONE_NM,
                rowData.LOC_CNT,
                rowData
            ]);
            dsChartZoneEmptyLoc[1].push([
                rowData.ZONE_NM,
                rowData.EMPTY_LOC_CNT,
                rowData
            ]);
            dsChartZonePutaway[0].push([
                rowData.ZONE_NM,
                rowData.LOC_PLT_QTY,
                rowData
            ]);
            dsChartZonePutaway[1].push([
                rowData.ZONE_NM,
                rowData.STOCK_PLT_QTY,
                rowData
            ]);
        }

        var QUERY_PARAMS = {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_ZONE_CD: refRowData.ZONE_CD
        };
        $NC.serviceCall("/LVC02010Q0/getDataSet.do", {
            P_QUERY_ID: "LVC02010Q0.RS_EMPTYLOCBANK",
            P_QUERY_PARAMS: QUERY_PARAMS
        }, onGetBankEmptyLoc);

        $NC.serviceCall("/LVC02010Q0/getDataSet.do", {
            P_QUERY_ID: "LVC02010Q0.RS_PUTAWAYBANK",
            P_QUERY_PARAMS: QUERY_PARAMS
        }, onGetBankPutaway);
    }

    var chtObject = $NC.getChartObject("#chtZoneEmptyLocReport");
    $NC.setInitChartData(chtObject, {
        data: dsChartZoneEmptyLoc
    });
    if (chtObject.globalVar.scrollable) {
        $NC.resizeChart(chtObject.selector, //
        $("#divZoneEmptyLocView").width() - $NC.G_LAYOUT.space.width - $("#chtZoneEmptyLocPerBar").outerWidth(true));
    }
    setOneBarChart("#chtZoneEmptyLocPerBar", refRowData.EMPTY_LOC_RATE);

    chtObject = $NC.getChartObject("#chtZonePutawayReport");
    $NC.setInitChartData(chtObject, {
        data: dsChartZonePutaway
    });
    if (chtObject.globalVar.scrollable) {
        $NC.resizeChart(chtObject.selector, //
        $("#divZonePutawayView").width() - $NC.G_LAYOUT.space.width - $("#chtZonePutawayPerBar").outerWidth(true));
    }
    setOneBarChart("#chtZonePutawayPerBar", refRowData.USING_RATE);
}

function onGetBankEmptyLoc(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChart = [
        [ ],
        [ ]
    ];

    var refRowData = {
        EMPTY_LOC_RATE: 0
    };
    if (rCount == 0) {
        dsChart[0].push([
            null
        ]);
        dsChart[1].push([
            null
        ]);
    } else {
        var rowData;
        refRowData = dsResult[0];
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsChart[0].push([
                rowData.BANK_CD,
                rowData.LOC_CNT
            ]);
            dsChart[1].push([
                rowData.BANK_CD,
                rowData.EMPTY_LOC_CNT
            ]);
        }
    }
    var chtObject = $NC.getChartObject("#chtBankEmptyLocReport");
    $NC.setInitChartData(chtObject, {
        data: dsChart
    });
    if (chtObject.globalVar.scrollable) {
        $NC.resizeChart(chtObject.selector, //
        $("#divBankEmptyLocView").width() - $NC.G_LAYOUT.space.width - $("#chtBankEmptyLocPerBar").outerWidth(true));
    }
    setOneBarChart("#chtBankEmptyLocPerBar", refRowData.EMPTY_LOC_RATE);
    $NC.setValue("#divBankEmptyLocReport", refRowData.ZONE_NM);
}

function onGetBankPutaway(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChart = [
        [ ],
        [ ]
    ];

    var refRowData = {
        USING_RATE: 0
    };
    if (rCount == 0) {
        dsChart[0].push([
            null
        ]);
        dsChart[1].push([
            null
        ]);
    } else {
        var rowData;
        refRowData = dsResult[0];
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsChart[0].push([
                rowData.BANK_CD,
                rowData.LOC_PLT_QTY
            ]);
            dsChart[1].push([
                rowData.BANK_CD,
                rowData.STOCK_PLT_QTY
            ]);
        }
    }

    var chtObject = $NC.getChartObject("#chtBankPutawayReport");
    $NC.setInitChartData(chtObject, {
        data: dsChart
    });
    if (chtObject.globalVar.scrollable) {
        $NC.resizeChart(chtObject.selector, //
        $("#divBankPutawayView").width() - $NC.G_LAYOUT.space.width - $("#chtBankPutawayPerBar").outerWidth(true));
    }
    setOneBarChart("#chtBankPutawayPerBar", refRowData.USING_RATE);
    $NC.setValue("#divBankPutawayReport", refRowData.ZONE_NM);
}

function setOneBarChart(selector, perVal) {

    $(selector).empty();
    $("<span class='lblPercentBarValue'>" + perVal //
        + "%</span><span class='ctrPercentBarLine' style='height: " + Math.min(perVal, 100) //
        + "%;'></span>").appendTo(selector);
}
