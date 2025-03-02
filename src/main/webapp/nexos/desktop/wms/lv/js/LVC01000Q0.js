﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC01000Q0
 *  프로그램명         : Dashboard
 *  프로그램설명       : Dashboard 화면 Javascript
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
        autoResizeSplitView: {
            splitViews: {
                containers: [
                    "#divLeftView",
                    "#divRightView"
                ]
            },
            viewType: "h"
        },
        // 자동조회 Timeout Event
        onAutoInquiryTimeout: null,
        isDisplayNotice: false,
        isDisplayLOSumReport: false
    });

    if (!$NC.G_VAR.isDisplayNotice) {
        $("#ctrNotice").hide();
    }
    if (!$NC.G_VAR.isDisplayLOSumReport) {
        $("#ctrLOSumReport").hide();
    }

    grdNoConfirmInitialize();
    grdNoticeInitialize();

    $NC.setInitDatePicker("#dtpQInout_Date");

    // 차트 초기화
    chtEmptyLocReportInitialize();
    chtPutawayReportInitialize();

    chtLIMasterReportInitialize();
    chtLIDetailReportInitialize();
    chtLICntReportInitialize();

    chtLOMasterReportInitialize();
    chtLODetailReportInitialize();
    chtLOCntReportInitialize();

    chtRIMasterReportInitialize();
    chtRIDetailReportInitialize();
    chtRICntReportInitialize();

    chtROMasterReportInitialize();
    chtRODetailReportInitialize();
    chtROCntReportInitialize();

    chtLCMasterReportInitialize();
    chtLCDetailReportInitialize();
    chtLCCntReportInitialize();

    chtLOSumMasterReportInitialize();
    chtLOSumDetailReportInitialize();
    chtLOSumCntReportInitialize();

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
            // _Inquiry();
        }
    });

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#divMoreNotice").click(function() {
        $NC.showProgramPopup("CSC01000E0");
    });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.noticeGridHeight = 90;
    $NC.G_OFFSET.noConfirmGridHeight = 71;
    $NC.G_OFFSET.perBarWidth = 30;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    // 왼쪽 그리드/차트 사이즈 조정
    // 그리드는 고정 사이즈로 조정
    $NC.resizeGridView("#divNoticeView", "#grdNotice", null, $NC.G_OFFSET.noticeGridHeight);
    $NC.resizeGridView("#divNoConfirmView", "#grdNoConfirm", null, $NC.G_OFFSET.noConfirmGridHeight);

    // 차트는 그리드 나머지 영역에 비율로 조정
    var $charts = $("#divLeftView .lblGroupTitle").filter(":visible");
    var chartArea = $("#divLeftView>.ctrInner").height() //
        - $NC.getViewHeight("#divNoticeView,#divNoConfirmView") //
        - $NC.getViewHeight($charts) //
        - (($charts.length - 1) * 4 + 2);
    var chartOne = $NC.getTruncVal(chartArea / 2);
    var $view = $("#divEmptyLocReportView");
    $NC.resizeContainer($view, null, chartOne);
    $NC.resizeContainer("#divPutawayReportView", null, chartArea - $NC.getViewHeight($view));

    chartArea = $view.width() - $NC.G_LAYOUT.space.width;
    $NC.resizeChart("#chtEmptyLocReport", chartArea - $("#chtEmptyLocPerBar").outerWidth(true));
    $NC.resizeChart("#chtPutawayReport", chartArea - $("#chtPutawayPerBar").outerWidth(true));

    // 오른쪽 차트 사이즈 조정
    $charts = $("#divRightView .lblGroupTitle").filter(":visible");
    chartArea = $("#divRightView>.ctrInner").height() //
        - $NC.getViewHeight($charts) //
        - (($charts.length - 1) * 4);
    chartOne = $NC.getTruncVal(chartArea / $charts.length);
    $NC.resizeContainer("#divLIReportView", null, chartOne);
    $NC.resizeContainer("#divLOReportView", null, chartOne);
    $NC.resizeContainer("#divRIReportView", null, chartOne);
    $NC.resizeContainer("#divROReportView", null, chartOne);
    if ($NC.G_VAR.isDisplayLOSumReport) {
        $NC.resizeContainer("#divLCReportView", null, chartOne);
        $NC.resizeContainer("#divLOSumReportView", null, chartArea
            - $NC.getViewHeight("#divLIReportView,#divLOReportView,#divRIReportView,#divROReportView,#divLCReportView"));
    } else {
        $NC.resizeContainer("#divLCReportView", null, chartArea
            - $NC.getViewHeight("#divLIReportView,#divLOReportView,#divRIReportView,#divROReportView"));
    }

    chartArea = $("#divLIReportView").width() - $NC.G_LAYOUT.space.width * 5;
    chartOne = $NC.getTruncVal(chartArea / 3) - $NC.G_OFFSET.perBarWidth;

    var chartGroups = [
        "LI",
        "LO",
        "RI",
        "RO",
        "LC"
    ], chartGroup;
    for (var rIndex = 0, rCount = chartGroups.length; rIndex < rCount; rIndex++) {
        chartGroup = chartGroups[rIndex];
        $NC.resizeChart("#cht" + chartGroup + "MasterReport", chartOne);
        $NC.resizeChart("#cht" + chartGroup + "DetailReport", chartOne);
        $NC.resizeChart("#cht" + chartGroup + "CntReport", chartOne);
        $("#div" + chartGroup + "ReportView .ctrPercentBar").css({
            width: $NC.G_OFFSET.perBarWidth,
            height: $("#div" + chartGroup + "ReportView").height()
        });
    }

    if ($NC.G_VAR.isDisplayLOSumReport) {
        chartOne = $NC.getTruncVal(($("#divLIReportView").width() - $NC.G_LAYOUT.space.width * 2) / 3);
        $NC.resizeChart("#chtLOSumMasterReport", chartOne);
        $NC.resizeChart("#chtLOSumDetailReport", chartOne);
        $NC.resizeChart("#chtLOSumCntReport", chartOne);
    }
}

function _OnLoaded() {

    // 로드시 화면 초기화 처리
    onChangingCondition();
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "INOUT_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LVC01000Q0.001", "입출고일자를 정확히 입력하십시오."));
            break;
        case "AUTO_INQUIRY":
            if (val == $ND.C_NO) {
                clearTimeout($NC.G_VAR.onAutoInquiryTimeout);
                $NC.setEnable("#edtQInquiry_Interval");
            } else {
                $NC.setEnable("#edtQInquiry_Interval", false);
                _Inquiry();
            }
            return;
        case "INQUIRY_INTERVAL":
            // 자동조회 시간 수정시 초기화 하지 않음
            return;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 자동조회 초기화
    clearTimeout($NC.G_VAR.onAutoInquiryTimeout);

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LVC01000Q0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LVC01000Q0.003", "사업부를 선택하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INOUT_DATE = $NC.getValue("#dtpQInout_Date");
    if ($NC.isNull(INOUT_DATE)) {
        alert($NC.getDisplayMsg("JS.LVC01000Q0.004", "입출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date");
        return;
    }

    var AUTO_INQUIRY_YN = $NC.getValue("#chkQAuto_Inquiry");
    var INQUIRY_INTERVAL = $NC.toNumber($NC.getValue("#edtQInquiry_Interval", "60"));
    if (AUTO_INQUIRY_YN == $ND.C_YES) {
        if (INQUIRY_INTERVAL < 20) {
            alert($NC.getDisplayMsg("JS.LVC01000Q0.005", "자동조회 시간을 20초 이상으로 지정하십시오."));
            $NC.setFocus("#edtQInquiry_Interval");
            return;
        }
    }

    // 공지사항
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_NOTICE",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_LIST_CNT: 5
        }
    }, onGetNotice);

    // 공셀 현황
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_EMPTYLOC",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD
        }
    }, onGetMeterReport);

    // 지시 후 미확정 전표
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_NOCONFIRM",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE
        }
    }, onGetNoConfirm);

    // 입고진행 현황
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_LIPROCESS",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE
        }
    }, onGetLIProcessReport);

    // 출고진행 현황
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_LOPROCESS",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE
        }
    }, onGetLOProcessReport);

    // 반입진행 현황
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_RIPROCESS",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE
        }
    }, onGetRIProcessReport);

    // 반출진행 현황
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_ROPROCESS",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE
        }
    }, onGetROProcessReport);

    // 센터운영진행 현황
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_LCPROCESS",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE
        }
    }, onGetLCProcessReport);

    // 출고요약(차수별)
    $NC.serviceCall("/LVC01000Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01000Q0.RS_LOABSTRACT",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_DATE: INOUT_DATE
        }
    }, onGetLOSumProcessReport);

    // 자동조회 세팅
    if (AUTO_INQUIRY_YN == $ND.C_YES) {
        $NC.G_VAR.onAutoInquiryTimeout = setTimeout(_Inquiry, INQUIRY_INTERVAL * 1000);
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

function grdNoticeOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "WRITE_NO",
        field: "WRITE_NO",
        name: "공지번호",
        resizable: false,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "NOTICE_TITLE",
        field: "NOTICE_TITLE",
        name: "제목"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정일시",
        resizable: false,
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdNoticeInitialize() {

    var options = {
        showColumnHeader: false
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdNotice", {
        columns: grdNoticeOnGetColumns(),
        queryId: "LVC01000Q0.GET_NOTICE_LIST",
        sortCol: "",
        gridOptions: options
    });

    G_GRDNOTICE.view.onSelectedRowsChanged.subscribe(grdNoticeOnAfterScroll);

    // Grid 가로 스크롤바 숨김
    $NC.hideGridHorzScroller(G_GRDNOTICE);
}

function grdNoticeOnAfterScroll(e, args) {

}

function grdNoConfirmOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "SW",
        field: "SW",
        name: "구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LI_CNT",
        field: "LI_CNT",
        name: "입고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LO_CNT",
        field: "LO_CNT",
        name: "출고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RI_CNT",
        field: "RI_CNT",
        name: "반입",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RO_CNT",
        field: "RO_CNT",
        name: "반출",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "EI_CNT",
        field: "EI_CNT",
        name: "기타입고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "EO_CNT",
        field: "EO_CNT",
        name: "기타출고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "MV_CNT",
        field: "MV_CNT",
        name: "LOC이동",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdNoConfirmInitialize() {

    var options = {
        frozenColumn: -1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdNoConfirm", {
        columns: grdNoConfirmOnGetColumns(),
        queryId: "LVC01000Q0.RS_MASTER",
        sortCol: "",
        gridOptions: options
    });

    G_GRDNOCONFIRM.view.onSelectedRowsChanged.subscribe(grdNoConfirmOnAfterScroll);
}

function grdNoConfirmOnAfterScroll(e, args) {

}

function getChartEmptyData(chartType) {

    var dsResult;
    switch ((chartType || "").toUpperCase()) {
        case "BAR":
            dsResult = [
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
            break;
        case "METER":
            dsResult = [
                [
                    0
                ]
            ];
            break;
        case "DONUT":
        case "PIE":
            dsResult = [
                [
                    "",
                    0
                ]
            ];
            break;
        default:
            dsResult = [
                [ ]
            ];
            break;
    }

    return dsResult;
}

function getChartOptions(chartType, seriesTitles, extendOptions) {

    var chartOptions;
    switch ((chartType || "").toUpperCase()) {
        case "BAR":
            chartOptions = {
                // animate: true,
                // animateReplot: true,
                seriesDefaults: {
                    renderer: $.jqplot.BarRenderer,
                    rendererOptions: {
                        fillToZero: true,
                        shadowDepth: 2
                    },
                    pointLabels: {
                        show: true
                    }
                },
                series: [
                    {
                        label: seriesTitles[0] || "",
                        pointLabels: {
                            location: "n"
                        }
                    },
                    {
                        label: seriesTitles[1] || "",
                        pointLabels: {
                            location: "n"
                        }
                    }
                ],
                axesDefaults: {
                    rendererOptions: {
                        drawBaseline: false
                    },
                    tickOptions: {
                        fontSize: "9pt",
                        fontFamily: "GulimChe"
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
                        min: 0,
                        tickOptions: {
                            formatString: "%'d"
                        }
                    }
                },
                highlighter: {
                    show: true,
                    tooltipAxes: "y",
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
                    borderWidth: 1,
                    shadow: false
                },
                gridPadding: {
                    top: 20,
                    bottom: 40,
                    left: 60,
                    right: 10
                },
                legend: {
                    show: true,
                    placement: "inside"
                }
            };
            break;
        case "METER":
            chartOptions = {
                seriesDefaults: {
                    renderer: $.jqplot.MeterGaugeRenderer,
                    rendererOptions: {
                        label: "",
                        labelPosition: "bottom",
                        background: "#1da2e0",
                        ringColor: "#e8e8e8",
                        needleColor: "#d3394d",
                        needleRingColor: "#ea3f56",
                        tickColor: "#e8e8e8",
                        shadowDepth: 3,
                        ticks: [
                            0,
                            25,
                            50,
                            75,
                            100
                        ],
                        intervals: [ ]
                    }
                },
                gridPadding: {
                    top: 0,
                    bottom: 30,
                    left: 0,
                    right: 0
                }
            };
            break;
        case "DONUT":
            chartOptions = {
                title: {
                    rendererOptions: {
                        paddingBottom: 5,
                        position: "bottom"
                    }
                },
                seriesDefaults: {
                    renderer: $.jqplot.DonutRenderer,
                    rendererOptions: {
                        sliceMargin: 2,
                        startAngle: 90,
                        padding: 5,
                        showDataLabels: true,
                        labelPosition: "bottom",
                        shadowDepth: 1,
                        dataLabels: "value",
                        innerDiameter: 5,
                        semiCircular: true
                    }
                },
                axesDefaults: {
                    tickOptions: {
                        textColor: "#000000"
                    }
                },
                grid: {
                    background: "#fbfbfb",
                    drawBorder: false,
                    shadowOffset: 0,
                    shadowAngle: 90,
                    shadowWidth: 2,
                    shadowDepth: 1
                },
                gridPadding: {
                    top: 2,
                    bottom: 0,
                    left: 2,
                    right: 2
                }
            };
            break;
        case "PIE":
            chartOptions = {
                title: {
                    rendererOptions: {
                        paddingLeft: 3,
                        paddingBottom: 3,
                        position: "bottom",
                        textAlign: "left"
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
                    drawBorder: false,
                    shadowOffset: 0,
                    shadowAngle: 90,
                    shadowWidth: 2,
                    shadowDepth: 1
                },
                gridPadding: {
                    top: 2,
                    bottom: 0,
                    left: 2,
                    right: 2
                }
            };
            break;
        default:
            chartOptions = {};
    }

    if ($NC.isNotNull(extendOptions)) {
        chartOptions = $.extend(true, chartOptions, extendOptions);
    }

    return chartOptions;
}

function chtEmptyLocReportInitialize() {

    $NC.setInitChartObject("#chtEmptyLocReport", {
        initData: getChartEmptyData("BAR"),
        chartOptions: getChartOptions("BAR", [
            "전체셀",
            "공셀"
        ])
    });
}

function chtPutawayReportInitialize() {

    $NC.setInitChartObject("#chtPutawayReport", {
        initData: getChartEmptyData("BAR"),
        chartOptions: getChartOptions("BAR", [
            "적재가능파렛트수",
            "적재파렛트수"
        ])
    });
}

function chtLIMasterReportInitialize() {

    $NC.setInitChartObject("#chtLIMasterReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLIDetailReportInitialize() {

    $NC.setInitChartObject("#chtLIDetailReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLICntReportInitialize() {

    $NC.setInitChartObject("#chtLICntReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLOMasterReportInitialize() {

    $NC.setInitChartObject("#chtLOMasterReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLODetailReportInitialize() {

    $NC.setInitChartObject("#chtLODetailReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLOCntReportInitialize() {

    $NC.setInitChartObject("#chtLOCntReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtRIMasterReportInitialize() {

    $NC.setInitChartObject("#chtRIMasterReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtRIDetailReportInitialize() {

    $NC.setInitChartObject("#chtRIDetailReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtRICntReportInitialize() {

    $NC.setInitChartObject("#chtRICntReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtROMasterReportInitialize() {

    $NC.setInitChartObject("#chtROMasterReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtRODetailReportInitialize() {

    $NC.setInitChartObject("#chtRODetailReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtROCntReportInitialize() {

    $NC.setInitChartObject("#chtROCntReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLCMasterReportInitialize() {

    $NC.setInitChartObject("#chtLCMasterReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLCDetailReportInitialize() {

    $NC.setInitChartObject("#chtLCDetailReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLCCntReportInitialize() {

    $NC.setInitChartObject("#chtLCCntReport", {
        initData: getChartEmptyData("DONUT"),
        chartOptions: getChartOptions("DONUT")
    });
}

function chtLOSumMasterReportInitialize() {

    $NC.setInitChartObject("#chtLOSumMasterReport", {
        initData: getChartEmptyData("PIE"),
        chartOptions: getChartOptions("PIE")
    });
}

function chtLOSumDetailReportInitialize() {

    $NC.setInitChartObject("#chtLOSumDetailReport", {
        initData: getChartEmptyData("PIE"),
        chartOptions: getChartOptions("PIE")
    });
}

function chtLOSumCntReportInitialize() {

    $NC.setInitChartObject("#chtLOSumCntReport", {
        initData: getChartEmptyData("PIE"),
        chartOptions: getChartOptions("PIE")
    });
}

function onGetNoConfirm(ajaxData) {

    $NC.setInitGridData(G_GRDNOCONFIRM, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDNOCONFIRM);
}

function onChangingCondition() {

    // 자동조회 초기화
    if ($NC.G_VAR.onAutoInquiryTimeout) {
        clearTimeout($NC.G_VAR.onAutoInquiryTimeout);
        $NC.setEnable("#edtQInquiry_Interval");
        $NC.setValue("#chkQAuto_Inquiry", $ND.C_NO);
    }

    // 그리드 초기화
    $NC.clearGridData(G_GRDNOTICE);
    $("#divMoreNotice").hide();
    $NC.clearGridData(G_GRDNOCONFIRM);

    // 차트 초기화
    $NC.clearChartData("#chtEmptyLocReport");
    $NC.clearChartData("#chtPutawayReport");
    setOneBarChart("#chtEmptyLocPerBar", 0);
    setOneBarChart("#chtPutawayPerBar", 0);

    var titleMaster = $NC.getDisplayMsg("JS.LVC01000Q0.006", "전표(0)");
    var titleDetail = $NC.getDisplayMsg("JS.LVC01000Q0.007", "라인(0)");
    var titleCnt = $NC.getDisplayMsg("JS.LVC01000Q0.008", "수량(0)");
    var processGrps = [
        "LI",
        "LO",
        "RI",
        "RO",
        "LC",
        "LOSum"
    ];
    var processGrp;
    for (var rIndex = 0, rCount = processGrps.length; rIndex < rCount; rIndex++) {
        processGrp = processGrps[rIndex];
        $NC.clearChartData("#cht" + processGrp + "MasterReport", {
            title: titleMaster,
            seriesDefaults: {
                rendererOptions: {
                    dataLabels: null
                }
            }
        });
        $NC.clearChartData("#cht" + processGrp + "DetailReport", {
            title: titleDetail,
            seriesDefaults: {
                rendererOptions: {
                    dataLabels: null
                }
            }
        });
        $NC.clearChartData("#cht" + processGrp + "CntReport", {
            title: titleCnt,
            seriesDefaults: {
                rendererOptions: {
                    dataLabels: null
                }
            }
        });
        setOneBarChart("#cht" + processGrp + "MasterPerBar", 0);
        setOneBarChart("#cht" + processGrp + "DetailPerBar", 0);
        setOneBarChart("#cht" + processGrp + "CntPerBar", 0);
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
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    onChangingCondition();
}

function onGetNotice(ajaxData) {

    $("#divMoreNotice").hide();
    $NC.setInitGridData(G_GRDNOTICE, ajaxData);
    var rowCount = G_GRDNOTICE.data.getLength();
    if (rowCount > 0) {
        if (rowCount == 5) {
            $("#divMoreNotice").show();
            G_GRDNOTICE.data.deleteItem(G_GRDNOTICE.data.getItem(4).id);
        }
        $NC.setGridSelectRow(G_GRDNOTICE, 0);
    } else {
        $NC.setGridDisplayRows(G_GRDNOTICE, 0, 0);
    }
}

function onGetLIProcessReport(ajaxData) {

    onGetPieReport($ND.C_PROCESS_GRP_IN, ajaxData);
}

function onGetLOProcessReport(ajaxData) {

    onGetPieReport($ND.C_PROCESS_GRP_OUT, ajaxData);
}

function onGetRIProcessReport(ajaxData) {

    onGetPieReport($ND.C_PROCESS_GRP_RTN_IN, ajaxData);
}

function onGetROProcessReport(ajaxData) {

    onGetPieReport($ND.C_PROCESS_GRP_RTN_OUT, ajaxData);
}

function onGetLCProcessReport(ajaxData) {

    onGetPieReport("LC", ajaxData);
}

function onGetLOSumProcessReport(ajaxData) {

    onGetPieReport("LOSum", ajaxData);
}

/**
 * 공셀현황 및 적재현황 BAR차트 검색결과 업데이트
 * 
 * @param ajaxData
 */
function onGetMeterReport(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);

    var dsChart = [
        [
            [ ],
            [ ]
        ],
        [
            [ ],
            [ ]
        ],
        [
            [
                0
            ]
        ],
        [
            [
                0
            ]
        ]
    ];
    var EMPTY_LOC_RATE = 0, USING_RATE = 0;
    if ($NC.isNotNull(dsResult) && dsResult.length > 0) {
        var rowData;
        for (var rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            dsChart[0][0][rIndex] = [
                rowData.ZONE_NM,
                rowData.LOC_CNT
            ];
            dsChart[0][1][rIndex] = [
                rowData.ZONE_NM,
                rowData.EMPTY_LOC_CNT
            ];
            dsChart[1][0][rIndex] = [
                rowData.ZONE_NM,
                rowData.LOC_PLT_QTY
            ];
            dsChart[1][1][rIndex] = [
                rowData.ZONE_NM,
                rowData.STOCK_PLT_QTY
            ];
        }
        if ($NC.isNotNull(rowData)) {
            EMPTY_LOC_RATE = rowData.EMPTY_LOC_RATE;
            USING_RATE = rowData.USING_RATE;
        }
        dsChart[2][0] = [
            EMPTY_LOC_RATE
        ];
        dsChart[3][0] = [
            USING_RATE
        ];
    }

    $NC.setInitChartData("#chtEmptyLocReport", {
        data: dsChart[0]
    });
    $NC.setInitChartData("#chtPutawayReport", {
        data: dsChart[1]
    });

    setOneBarChart("#chtEmptyLocPerBar", dsChart[2][0]);
    setOneBarChart("#chtPutawayPerBar", dsChart[3][0]);
}

function onGetPieReport(processGrp, ajaxData) {

    var dsResult = $NC.toArray(ajaxData);

    var SUM_ORDER_QTY = 0;
    var SUM_LINE_QTY = 0;
    var SUM_QTY = 0;
    var SUM_ORDER_QTY40 = 0;
    var SUM_LINE_QTY40 = 0;
    var SUM_QTY40 = 0;
    var TRUNC_SUM_QTY = 0;
    var dsChart = [
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
        ],
        [
            [
                "",
                0
            ]
        ]
    ];
    var dsLabels = [
        [
            null
        ],
        [
            null
        ],
        [
            null
        ]
    ];
    if ($NC.isNotNull(dsResult) && dsResult.length > 0) {
        var rowData;
        for (var rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];

            dsChart[0][0][rIndex] = [
                rowData.STATE_NM,
                rowData.ORDER_QTY
            ];

            dsChart[1][0][rIndex] = [
                rowData.STATE_NM,
                rowData.LINE_QTY
            ];

            dsChart[2][0][rIndex] = [
                rowData.STATE_NM,
                rowData.QTY
            ];

            dsLabels[0][rIndex] = "<span>" + rowData.STATE_NM + "(" + rowData.ORDER_QTY + ")</span>";
            dsLabels[1][rIndex] = "<span>" + rowData.STATE_NM + "(" + rowData.LINE_QTY + ")</span>";
            dsLabels[2][rIndex] = "<span>" + rowData.STATE_NM + "(" + rowData.QTY + ")</span>";

            SUM_ORDER_QTY += rowData.ORDER_QTY;
            SUM_LINE_QTY += rowData.LINE_QTY;
            SUM_QTY += rowData.QTY;

            if (rowData.STATE >= $ND.C_STATE_CONFIRM) {
                SUM_ORDER_QTY40 += rowData.ORDER_QTY;
                SUM_LINE_QTY40 += rowData.LINE_QTY;
                SUM_QTY40 += rowData.QTY;
            }
        }
        TRUNC_SUM_QTY = $NC.getTruncVal(SUM_QTY, 2);
    }

    $NC.setInitChartData("#cht" + processGrp + "MasterReport", {
        title: $NC.getDisplayMsg("JS.LVC01000Q0.009", "전표(" + SUM_ORDER_QTY + ")", SUM_ORDER_QTY),
        data: dsChart[0],
        seriesDefaults: {
            rendererOptions: {
                dataLabels: dsLabels[0]
            }
        }
    });
    $NC.setInitChartData("#cht" + processGrp + "DetailReport", {
        title: $NC.getDisplayMsg("JS.LVC01000Q0.010", "라인(" + SUM_LINE_QTY + ")", SUM_LINE_QTY),
        data: dsChart[1],
        seriesDefaults: {
            rendererOptions: {
                dataLabels: dsLabels[1]
            }
        }
    });
    $NC.setInitChartData("#cht" + processGrp + "CntReport", {
        title: $NC.getDisplayMsg("JS.LVC01000Q0.011", "수량(" + TRUNC_SUM_QTY + ")", TRUNC_SUM_QTY),
        data: dsChart[2],
        seriesDefaults: {
            rendererOptions: {
                dataLabels: dsLabels[2]
            }
        }
    });
    setOneBarChart("#cht" + processGrp + "MasterPerBar", $NC.getTruncVal(SUM_ORDER_QTY40 / SUM_ORDER_QTY * 100));
    setOneBarChart("#cht" + processGrp + "DetailPerBar", $NC.getTruncVal(SUM_LINE_QTY40 / SUM_LINE_QTY * 100));
    setOneBarChart("#cht" + processGrp + "CntPerBar", $NC.getTruncVal(SUM_QTY40 / SUM_QTY * 100));
}

function setOneBarChart(selector, perVal) {

    $(selector).empty();
    $("<span class='lblPercentBarValue'>" + perVal //
        + "%</span><span class='ctrPercentBarLine' style='height: " + Math.min(perVal, 100) //
        + "%;'></span>").appendTo(selector);
}
