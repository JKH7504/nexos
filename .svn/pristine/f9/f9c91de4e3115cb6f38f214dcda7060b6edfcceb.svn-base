/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC01010Q0
 *  프로그램명         : 주문분석
 *  프로그램설명       : 주문분석 화면 Javascript
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
        addAll: true,
        onComplete: function() {
            // $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
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

    // 차트 초기화
    barChartInitialize("#chtOrderCnt");
    barChartInitialize("#chtLineCnt");
    barChartInitialize("#chtOrderQty");
    stackChartInitialize("#chtOrderAnalysis");
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
            "#divOrderCntView",
            "#divLineCntView"
        ]
    }, "v");
    $NC.resizeChart("#chtOrderCnt");
    $NC.resizeChart("#chtLineCnt");

    $NC.resizeSplitView({
        containers: [
            "#divOrderQtyView",
            "#divOrderAnalysisView"
        ]
    }, "v");
    $NC.resizeChart("#chtOrderQty");
    $NC.resizeChart("#chtOrderAnalysis");
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
                alert($NC.getDisplayMsg("JS.LVC01010Q0.001", "물류센터를 먼저 선택 하십시오."));
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
                alert($NC.getDisplayMsg("JS.LVC01010Q0.002", "고객사를 먼저 입력 하십시오."));
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
                alert($NC.getDisplayMsg("JS.LVC01010Q0.003", "사업부를 먼저 입력 하십시오."));
                $NC.setValue("#edtQBrand_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onBuBrandChange(val, {
                P_BU_CD: BU_CD,
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "AGG_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LVC01010Q0.004", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "AGG_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LVC01010Q0.005", "검색 종료일자를 정확히 입력하십시오."));
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
        alert($NC.getDisplayMsg("JS.LVC01010Q0.006", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var AGG_DATE1 = $NC.getValue("#dtpQAgg_Date1");
    if ($NC.isNull(AGG_DATE1)) {
        alert($NC.getDisplayMsg("JS.LVC01010Q0.007", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQAgg_Date1");
        return;
    }
    var AGG_DATE2 = $NC.getValue("#dtpQAgg_Date2");
    if ($NC.isNull(AGG_DATE2)) {
        alert($NC.getDisplayMsg("JS.LVC01010Q0.008", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQAgg_Date2");
        return;
    }

    if (AGG_DATE1 > AGG_DATE2) {
        alert($NC.getDisplayMsg("JS.LVC01010Q0.009", "조회일자 범위 입력오류입니다."));
        $NC.setFocus("#dtpQAgg_Date1");
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    // 공지사항
    $NC.serviceCall("/LVC01010Q0/getDataSet.do", {
        P_QUERY_ID: "LVC01010Q0.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_CUST_CD: CUST_CD,
            P_BU_CD: BU_CD,
            P_BRAND_CD: BRAND_CD,
            P_AGG_DATE1: AGG_DATE1,
            P_AGG_DATE2: AGG_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID
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
                shadowDepth: 2
            },
            pointLabels: {
                show: true,
                location: "s",
                hideZeros: true,
                formatString: "%'d",
                seriesLabelIndex: 1
            }
        },
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
            left: 60,
            right: 30
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
        initData: initData,
        scrollable: true
    });
}

/**
 * 스택차트 초기화
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
        seriesColors: [
            "#3366CC",
            "#DC3912",
            "#FF9900",
            "#109618",
            "#990099",
            "#0099C6"
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
                tickOptions: {}
            }
        },
        highlighter: {
            show: true,
            tooltipAxes: "y",
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
            left: 60,
            right: 100
        },
        legend: {
            show: true,
            location: "se",
            placement: "outside",
            labels: [
                "1건",
                "2건",
                "3건",
                "4건",
                "5번",
                "6건이상"
            ]
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

    $NC.setInitChartObject(selector, {
        chartOptions: options,
        initData: initData,
        scrollable: true
    });
}

function onChangingCondition() {

    // 차트 초기화
    $NC.clearChartData("#chtOrderCnt");
    $NC.clearChartData("#chtLineCnt");
    $NC.clearChartData("#chtOrderQty");
    $NC.getChartObject("#chtOrderAnalysis").view.options.axes.xaxis.ticks = null;
    $NC.clearChartData("#chtOrderAnalysis", {
        axes: {
            xaxis: {
                ticks: [
                    [
                        ""
                    ]
                ]
            }
        },
        resetAxes: [
            "xaxis",
            "yaxis"
        ]
    });

    $NC.setValue("#edtTotal_Order_Cnt");
    $NC.setValue("#edtTotal_Line_Cnt");
    $NC.setValue("#edtTotal_Order_Qty");
    $NC.setValue("#edtTotal_Order_Analysis");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showCustPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if (CENTER_CD == $ND.C_ALL) {
        alert($NC.getDisplayMsg("JS.LVC01010Q0.001", "물류센터를 먼저 선택 하십시오."));
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
        alert($NC.getDisplayMsg("JS.LVC01010Q0.002", "고객사를 먼저 선택 하십시오."));
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
        alert($NC.getDisplayMsg("JS.LVC01010Q0.003", "사업부를 먼저 선택 하십시오."));
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

/**
 * 전표수, 라인수, 수량, 주문분석 차트 업데이트
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChartOrderCnt = [
        []
    ];
    var dsChartLineCnt = [
        []
    ];
    var dsChartOrderQty = [
        []
    ];
    var dsChartOrderAnalysis = [
        [],
        [],
        [],
        [],
        [],
        []
    ];
    var dsTicksOrderAnalysis = [];
    var dsTotals = [
        0,
        0,
        0,
        0
    ];
    var sIndex, sCount;
    if (rCount == 0) {
        dsChartOrderCnt[0].push([
            null
        ]);
        dsChartLineCnt[0].push([
            null
        ]);
        dsChartOrderQty[0].push([
            null
        ]);
        for (sIndex = 0, sCount = 6; sIndex < sCount; sIndex++) {
            dsChartOrderAnalysis[sIndex].push([
                "",
                0
            ]);
        }
    } else {
        var rIndex, rowData, ellipsColNm;
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            ellipsColNm = getEllipsisValue(rowData.COL_NM);
            dsChartOrderCnt[0].push([
                ellipsColNm,
                rowData.ORDER_CNT,
                rowData.COL_NM
            ]);
            dsChartLineCnt[0].push([
                ellipsColNm,
                rowData.LINE_CNT,
                rowData.COL_NM
            ]);
            dsChartOrderQty[0].push([
                ellipsColNm,
                rowData.ORDER_QTY,
                rowData.COL_NM
            ]);
            dsChartOrderAnalysis[0].push(rowData.ORDER_CNT1);
            dsChartOrderAnalysis[1].push(rowData.ORDER_CNT2);
            dsChartOrderAnalysis[2].push(rowData.ORDER_CNT3);
            dsChartOrderAnalysis[3].push(rowData.ORDER_CNT4);
            dsChartOrderAnalysis[4].push(rowData.ORDER_CNT5);
            dsChartOrderAnalysis[5].push(rowData.ORDER_CNT6);
            dsTicksOrderAnalysis[rIndex] = ellipsColNm;
            dsTotals[0] += rowData.ORDER_CNT;
            dsTotals[1] += rowData.LINE_CNT;
            dsTotals[2] += rowData.ORDER_QTY;
            dsTotals[3] += rowData.ORDER_CNT1 + rowData.ORDER_CNT2 + rowData.ORDER_CNT3 //
                + rowData.ORDER_CNT4 + rowData.ORDER_CNT5 + rowData.ORDER_CNT6;
        }
    }

    $NC.setInitChartData("#chtOrderCnt", {
        data: dsChartOrderCnt
    });
    $NC.setInitChartData("#chtLineCnt", {
        data: dsChartLineCnt
    });
    $NC.setInitChartData("#chtOrderQty", {
        data: dsChartOrderQty
    });
    $NC.setInitChartData("#chtOrderAnalysis", {
        axes: {
            xaxis: {
                ticks: dsTicksOrderAnalysis
            }
        },
        data: dsChartOrderAnalysis
    });

    $NC.setValue("#edtTotal_Order_Cnt", $NC.getDisplayNumber(dsTotals[0]));
    $NC.setValue("#edtTotal_Line_Cnt", $NC.getDisplayNumber(dsTotals[1]));
    $NC.setValue("#edtTotal_Order_Qty", $NC.getDisplayNumber($NC.getTruncVal(dsTotals[2], 2)));
    $NC.setValue("#edtTotal_Order_Analysis", $NC.getDisplayNumber(dsTotals[3]));
}

function getEllipsisValue(value) {

    return value.length > 8 ? value.substring(0, 8) + "…" : value;
}
