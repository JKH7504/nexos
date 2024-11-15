/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC04020Q0
 *  프로그램명         : 전년대비출고추이
 *  프로그램설명       : 전년대비출고추이 화면 Javascript
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
                alert($NC.getDisplayMsg("JS.LVC04020Q0.001", "물류센터를 먼저 선택 하십시오."));
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
                alert($NC.getDisplayMsg("JS.LVC04020Q0.002", "고객사를 먼저 입력 하십시오."));
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
                alert($NC.getDisplayMsg("JS.LVC04020Q0.003", "사업부를 먼저 입력 하십시오."));
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

    // 주간, 월간, 분기, 연간
    $NC.serviceCall("/LVC04020Q0/getDataSet.do", {
        P_QUERY_ID: "LVC04020Q0.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_CUST_CD: CUST_CD,
            P_BU_CD: BU_CD,
            P_BRAND_CD: BRAND_CD,
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

function lineChartInitialize(selector) {

    var options = {
        seriesDefaults: {
            min: 0,
            lineWidth: 1.5,
            markerOptions: {
                size: 7.0
            },
            pointLabels: {
                show: true,
                location: "n",
                formatString: "%'d",
                hideZeros: true
            }
        },
        seriesColors: [
            "#2779D6",
            "#081E36"
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
            bottom: 40,
            left: 80,
            right: 30
        },
        legend: {
            show: true,
            placement: "inside",
            labels: [
                "금년",
                "전년"
            ]
        }
    };
    var initData = [
        [
            [
                null
            ],
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
 * 전표수, 라인수, 수량, 주문분석 차트 업데이트
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult && dsResult.length || 0;
    var dsChart = [
        [
            [],
            []
        ],
        [
            [],
            []
        ],
        [
            [],
            []
        ],
        [
            [],
            []
        ]
    ];
    var dsTicks = [
        [],
        [],
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
        dsChart[2].push([
            null
        ]);
        dsChart[3].push([
            null
        ]);
    } else {
        var rowData;
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            switch (rowData.CHT_TYPE) {
                case "WEEK":
                    if (rowData.YEAR_TYPE == "CURRENT") {
                        dsChart[0][0].push(rowData.OUT_QTY);
                    } else if (rowData.YEAR_TYPE == "PREV") {
                        dsChart[0][1].push(rowData.OUT_QTY);
                    }
                    if ($.inArray(rowData.OUT_DATE, dsTicks[0]) < 0) {
                        dsTicks[0].push(rowData.OUT_DATE);
                    }
                    break;
                case "MONTH":
                    if (rowData.YEAR_TYPE == "CURRENT") {
                        dsChart[1][0].push(rowData.OUT_QTY);
                    } else if (rowData.YEAR_TYPE == "PREV") {
                        dsChart[1][1].push(rowData.OUT_QTY);
                    }
                    if ($.inArray(rowData.OUT_DATE, dsTicks[1]) < 0) {
                        dsTicks[1].push(rowData.OUT_DATE);
                    }
                    break;
                case "QUARTER":
                    if (rowData.YEAR_TYPE == "CURRENT") {
                        dsChart[2][0].push(rowData.OUT_QTY);
                    } else if (rowData.YEAR_TYPE == "PREV") {
                        dsChart[2][1].push(rowData.OUT_QTY);
                    }
                    if ($.inArray(rowData.OUT_DATE, dsTicks[2]) < 0) {
                        dsTicks[2].push(rowData.OUT_DATE);
                    }
                    break;
                case "YEAR":
                    if (rowData.YEAR_TYPE == "CURRENT") {
                        dsChart[3][0].push(rowData.OUT_QTY);
                    } else if (rowData.YEAR_TYPE == "PREV") {
                        dsChart[3][1].push(rowData.OUT_QTY);
                    }
                    if ($.inArray(rowData.OUT_DATE, dsTicks[3]) < 0) {
                        dsTicks[3].push(rowData.OUT_DATE);
                    }
                    break;
            }
        }
        $NC.setInitChartData("#chtWeekReport", {
            data: dsChart[0],
            axes: {
                xaxis: {
                    ticks: dsTicks[0]
                }
            }
        });
        $NC.setInitChartData("#chtMonthReport", {
            data: dsChart[1],
            axes: {
                xaxis: {
                    ticks: dsTicks[1]
                }
            }
        });
        $NC.setInitChartData("#chtQuarterReport", {
            data: dsChart[2],
            axes: {
                xaxis: {
                    ticks: dsTicks[2]
                }
            }
        });
        $NC.setInitChartData("#chtYearReport", {
            data: dsChart[3],
            axes: {
                xaxis: {
                    ticks: dsTicks[3]
                }
            }
        });
    }
}

function onChangingCondition() {

    // 차트 초기화
    $NC.clearChartData("#chtWeekReport");
    $NC.clearChartData("#chtMonthReport");
    $NC.clearChartData("#chtQuarterReport");
    $NC.clearChartData("#chtYearReport");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showCustPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if (CENTER_CD == $ND.C_ALL) {
        alert($NC.getDisplayMsg("JS.LVC04020Q0.001", "물류센터를 먼저 선택 하십시오."));
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
        alert($NC.getDisplayMsg("JS.LVC04020Q0.002", "고객사를 먼저 선택 하십시오."));
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
        alert($NC.getDisplayMsg("JS.LVC04020Q0.003", "사업부를 먼저 선택 하십시오."));
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
