/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC02050Q0
 *  프로그램명         : 재고위치파악
 *  프로그램설명       : 재고위치파악 화면 Javascript
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
                container: "#divLeftView"
            },
            viewSecond: {
                container: "#divRightView",
                grids: "#grdMaster"
            },
            viewType: "h",
            viewFixed: 300
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    pieChartInitialize("#chtMaster");

    // 팝업 클릭 이벤트
    $("#btnQBrand_Cd").click(showBrandPopup);
    $("#btnQItem_Cd").click(showItemPopup);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.chartHeight = 300;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    // $NC.resizeContainer("#divMasterView");
    // $NC.resizeContainer($("#chtMaster").parent(), $NC.G_OFFSET.fixedChartWidth, $("#divMasterView").height());
    // resizeChart("#chtMaster", null, $NC.G_OFFSET.fixedChartHeight);
    // $NC.resizeGridView($("#grdMaster").parent(), "#grdMaster", $("#divMasterView").width() - $("#chtMaster").parent().outerWidth(true), $(
    // "#divMasterView").height());

    $NC.resizeChart("#chtMaster", null, $NC.G_OFFSET.chartHeight);
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BRAND_CD":
            $NP.onBrandChange(val, {
                P_BRAND_CD: val,
                P_VIEW_DIV: "2"
            }, onBrandPopup);
            return;
        case "ITEM_CD":
            var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
            if ($NC.isNotNull(val) && $NC.isNull(BRAND_CD)) {
                alert($NC.getDisplayMsg("JS.LVC02050Q0.001", "브랜드를 먼저 선택하십시오."));
                $NC.setValue("#edtQItem_Cd");
                $NC.setFocus("#edtQBrand_Cd");
                return;
            }
            $NP.onItemChange(val, {
                P_BRAND_CD: BRAND_CD,
                P_ITEM_CD: val,
                P_VIEW_DIV: "2",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemPopup, {
                queryId: "WC.POP_CMBRANDITEM"
            });
            return;
    }

    // 조회 조건에 Object Change
    onChangingCondition();
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearChartData("#chtMaster");
    $NC.setValue("#edtTotal_Stock_Qty");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    if ($NC.isNull(BRAND_CD)) {
        alert($NC.getDisplayMsg("JS.LVC02050Q0.002", "브랜드를 선택하십시오."));
        $NC.setFocus("#edtQBrand_Cd");
        return;
    }
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    if ($NC.isNull(ITEM_CD)) {
        alert($NC.getDisplayMsg("JS.LVC02050Q0.003", "상품을 선택하십시오."));
        $NC.setFocus("#edtQItem_Cd");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LVC02050Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

function pieChartInitialize(selector) {

    var options = {
        title: {
            rendererOptions: {
                position: "bottom",
                textAlign: "center"
            }
        },
        series: [
            {
                pointLabels: {
                    location: "s"
                }
            }
        ],
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
            background: "#fff",
            drawBorder: false,
            shadow: false
        },
        gridPadding: {
            top: 0,
            bottom: 0,
            left: 5,
            right: 5
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CENTER_CD_NM",
        field: "CENTER_NM",
        name: "물류센터"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "입고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LVC02050Q0.RS_MASTER",
        sortCol: "CENTER_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);

    var TOTAL_STOCK_QTY = 0;
    var dsChart = [
        []
    ];
    var dsLabels = [];

    if ($NC.setInitGridAfterOpen(G_GRDMASTER, null, true)) {
        var rowData;
        for (var rIndex = 0; rIndex < G_GRDMASTER.data.getLength(); rIndex++) {
            rowData = G_GRDMASTER.data.getItem(rIndex);
            if (rowData.FIRST_YN == $ND.C_YES) {
                dsChart[0].push([
                    rowData.CENTER_NM,
                    rowData.SUM_STOCK_QTY
                ]);
                dsLabels.push(rowData.CENTER_NM + " : " + rowData.SUM_STOCK_QTY);
                TOTAL_STOCK_QTY += rowData.SUM_STOCK_QTY;
            }
        }
    }

    $NC.setValue("#edtTotal_Stock_Qty", TOTAL_STOCK_QTY);
    $NC.setInitChartData("#chtMaster", {
        data: dsChart,
        seriesDefaults: {
            rendererOptions: {
                dataLabels: dsLabels
            }
        }
    });
}

/**
 * 검색조건의 브랜드 검색 이미지 클릭
 */
function showBrandPopup() {

    $NP.showBrandPopup({
        P_BRAND_CD: $ND.C_ALL,
        P_VIEW_DIV: "2"
    }, onBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

function onBrandPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    } else {
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setValue("#edtQCust_Cd");
        $NC.setFocus("#edtQBrand_Cd", true);
    }

    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");

    onChangingCondition();
}

/**
 * 상품 검색 팝업 표시
 */
function showItemPopup() {

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    if ($NC.isNull(BRAND_CD)) {
        alert($NC.getDisplayMsg("JS.LVC02050Q0.001", "브랜드를 먼저 선택하십시오."));
        $NC.setValue("#edtQBrand_Cd");
        $NC.setFocus("#edtQBrand_Cd");
        return;
    }

    var P_QUERY_PARAMS = {
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: $ND.C_ALL,
        P_VIEW_DIV: "2",
        P_DEPART_CD: $ND.C_ALL,
        P_LINE_CD: $ND.C_ALL,
        P_CLASS_CD: $ND.C_ALL
    };
    $NP.showItemPopup({
        queryId: "WC.POP_CMBRANDITEM",
        queryParams: P_QUERY_PARAMS
    }, onItemPopup, function() {
        $NC.setFocus("#edtQItem_Cd", true);
    });

}

function onItemPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
        $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
    } else {
        $NC.setValue("#edtQItem_Cd");
        $NC.setValue("#edtQItem_Nm");
        $NC.setFocus("#edtQItem_Cd", true);
    }
    onChangingCondition();
}
