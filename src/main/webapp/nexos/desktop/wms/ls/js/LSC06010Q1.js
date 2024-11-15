/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC06010Q
 *  프로그램명         : 재고실사결과표
 *  프로그램설명       : 재고실사결과표 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-10-02
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-10-02    ASETEC           신규작성
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
        },
        CUST_CD: ""
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 물류센터 세팅
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

    // 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 수불일자에 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQInout_Date1", "#dtpQInout_Date2");

    $("#btnQBu_Cd").click(showUserBuPopup);
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

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
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
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
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC06010Q1.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INOUT_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC06010Q1.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LSC06010Q1.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC06010Q1.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    if ($NC.isNull(INOUT_DATE1)) {
        alert($NC.getDisplayMsg("JS.LSC06010Q1.005", "시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date1");
        return;
    }
    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
    if ($NC.isNull(INOUT_DATE2)) {
        alert($NC.getDisplayMsg("JS.LSC06010Q1.006", "종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date2");
        return;
    }

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INOUT_DATE1: INOUT_DATE1,
        P_INOUT_DATE2: INOUT_DATE2
    };
    // 데이터 조회
    $NC.serviceCall("/LSC06010Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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
        id: "STYLE_CD",
        field: "STYLE_CD",
        name: "상품코드",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "BSTOCK_RBOX",
        field: "BSTOCK_RBOX",
        name: "기초재고",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "E1_RBOX",
        field: "E1_RBOX",
        name: "일반(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "E2_RBOX",
        field: "E2_RBOX",
        name: "수송(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "E3_RBOX",
        field: "E3_RBOX",
        name: "반품(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "E4_RBOX",
        field: "E4_RBOX",
        name: "실사(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "E9_RBOX",
        field: "E9_RBOX",
        name: "기타(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "E0_RBOX",
        field: "E0_RBOX",
        name: "합계(입고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "D1_RBOX",
        field: "D1_RBOX",
        name: "일반(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "D2_RBOX",
        field: "D2_RBOX",
        name: "수송(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "D3_RBOX",
        field: "D3_RBOX",
        name: "반품(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "D4_RBOX",
        field: "D4_RBOX",
        name: "실사(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "D9_RBOX",
        field: "D9_RBOX",
        name: "기타(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "D0_RBOX",
        field: "D0_RBOX",
        name: "합계(출고)",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "NSTOCK_RBOX",
        field: "NSTOCK_RBOX",
        name: "당일재고",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_RBOX",
        field: "INVEST_RBOX",
        name: "실사수량",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "LOSS_RBOX",
        field: "LOSS_RBOX",
        name: "LOSS수량",
        band: 1,
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "BSTOCK_QTY",
        field: "BSTOCK_QTY",
        name: "기초재고",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "E1_QTY",
        field: "E1_QTY",
        name: "일반(입고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "E2_QTY",
        field: "E2_QTY",
        name: "수송(입고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "E3_QTY",
        field: "E3_QTY",
        name: "반품(입고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "E4_QTY",
        field: "E4_QTY",
        name: "실사(입고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "E9_QTY",
        field: "E9_QTY",
        name: "기타(입고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "E0_QTY",
        field: "E0_QTY",
        name: "합계(입고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "D1_QTY",
        field: "D1_QTY",
        name: "일반(출고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "D2_QTY",
        field: "D2_QTY",
        name: "수송(출고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "D3_QTY",
        field: "D3_QTY",
        name: "반품(출고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "D4_QTY",
        field: "D4_QTY",
        name: "실사(출고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "D9_QTY",
        field: "D9_QTY",
        name: "기타(출고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "D0_QTY",
        field: "D0_QTY",
        name: "합계(출고)",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "NSTOCK_QTY",
        field: "NSTOCK_QTY",
        name: "당일재고",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_QTY",
        field: "INVEST_QTY",
        name: "실사수량",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOSS_QTY",
        field: "LOSS_QTY",
        name: "LOSS수량",
        band: 2,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SALE_PRICE",
        field: "SALE_PRICE",
        name: "판매단가",
        band: 3,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOSS_AMT",
        field: "LOSS_AMT",
        name: "LOSS금액",
        band: 3,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOSS_RATE",
        field: "LOSS_RATE",
        name: "LOSS율",
        band: 3,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_DIV_D",
        field: "ITEM_DIV_D",
        name: "품목구분",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "YEAR_DIV_D",
        field: "YEAR_DIV_D",
        name: "년도구분",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "SEASON_DIV_D",
        field: "SEASON_DIV_D",
        name: "시즌구분",
        band: 3
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 기간별재고실사결과표 탭의 그리드 초기화
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 2,
        showBandRow: true,
        bands: [
            "기본정보",
            "BOX기준 수불재고",
            "EA기준 수불재고",
            ""
        ],
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.LOSS_QTY != 0) {
                    return "styDiff";
                }
            }
        }

    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LSC06010Q1.RS_MASTER",
        sortCol: "STYLE_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
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

    onChangingCondition();
}

/**
 * 기간별재고실사결과표 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);

}

/**
 * 기간별재고실사결과표 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "DELIVERY_CD", true);

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
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}