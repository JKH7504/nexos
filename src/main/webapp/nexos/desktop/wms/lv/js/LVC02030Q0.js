/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC02030Q0
 *  프로그램명         : 재고분석(문제재고)
 *  프로그램설명       : 재고분석(문제재고) 화면 Javascript
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

    // 그리드 초기화
    grdMaster1Initialize();
    grdMaster2Initialize();
    grdMaster3Initialize();
    grdMaster4Initialize();

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
            $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
        }
    });

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    // 팝업 클릭 이벤트
    $("#btnQBu_Cd").click(showUserBuPopup);

    // 유통기한 잔존기한 콤보 셋팅
    setRemainDayCombo();
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

    $NC.resizeSplitView([
        {
            container: "#divMaster1View",
            grids: "#grdMaster1"
        },
        {
            container: "#divMaster3View",
            grids: "#grdMaster3"
        }
    ], "v");
    $NC.resizeSplitView([
        {
            container: "#divMaster2View",
            grids: "#grdMaster2"
        },
        {
            container: "#divMaster4View",
            grids: "#grdMaster4"
        }
    ], "v");
}

/**
 * Input, Select Change Event 처리
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
        case "REMAIN_DAY":
            inquiryMaster1();
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
    $NC.clearGridData(G_GRDMASTER1);
    $NC.clearGridData(G_GRDMASTER2);
    $NC.clearGridData(G_GRDMASTER3);
    $NC.clearGridData(G_GRDMASTER4);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LVC02030Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LVC02030Q0.002", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER2);
    $NC.setInitGridVar(G_GRDMASTER3);
    $NC.setInitGridVar(G_GRDMASTER4);

    // grdMaster1 조회
    inquiryMaster1();

    // 파라메터 세팅
    G_GRDMASTER2.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LVC02030Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER2), onGetMaster2);

    // 파라메터 세팅
    G_GRDMASTER3.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LVC02030Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER3), onGetMaster3);

    // 파라메터 세팅
    G_GRDMASTER4.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LVC02030Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER4), onGetMaster4);
}

function inquiryMaster1() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER1);

    // 파라메터 세팅
    G_GRDMASTER1.queryParams = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_REMAIN_DAY: $NC.getValue("#cboQRemain_Day")
    };
    // 데이터 조회
    $NC.serviceCall("/LVC02030Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER1), onGetMaster1);
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

function grdMaster1OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "PERIOD_DATE",
        field: "PERIOD_DATE",
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
        name: "재고",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMaster1Initialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster1", {
        columns: grdMaster1OnGetColumns(),
        queryId: "LVC02030Q0.RS_MASTER1",
        sortCol: "INBOUND_DATE",
        gridOptions: options
    });

    G_GRDMASTER1.view.onSelectedRowsChanged.subscribe(grdMaster1OnAfterScroll);
}

function grdMaster1OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER1, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER1, row + 1);
}

function onGetMaster1(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER1, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER1);
}

function grdMaster2OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_D",
        field: "DEAL_DIV_D",
        name: "구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "PERIOD_DATE",
        field: "PERIOD_DATE",
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
        name: "재고",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMaster2Initialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster2", {
        columns: grdMaster2OnGetColumns(),
        queryId: "LVC02030Q0.RS_MASTER2",
        sortCol: "INBOUND_DATE",
        gridOptions: options
    });

    G_GRDMASTER2.view.onSelectedRowsChanged.subscribe(grdMaster2OnAfterScroll);
}

function grdMaster2OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER2, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER2, row + 1);
}

function onGetMaster2(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER2, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER2);
}

function grdMaster3OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SAFETY_QTY",
        field: "SAFETY_QTY",
        name: "안전재고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REASONABLE_QTY",
        field: "REASONABLE_QTY",
        name: "적정재고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SHORT_STOCK_QTY",
        field: "SHORT_STOCK_QTY",
        name: "부족재고",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMaster3Initialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster3", {
        columns: grdMaster3OnGetColumns(),
        queryId: "LVC02030Q0.RS_MASTER3",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER3.view.onSelectedRowsChanged.subscribe(grdMaster3OnAfterScroll);
}

function grdMaster3OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER3, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER3, row + 1);
}

function onGetMaster3(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER3, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER3);
}

function grdMaster4OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SAFETY_QTY",
        field: "SAFETY_QTY",
        name: "안전재고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REASONABLE_QTY",
        field: "REASONABLE_QTY",
        name: "적정재고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REASONABLE_15_QTY",
        field: "REASONABLE_15_QTY",
        name: "적정재고*1.5",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OVER_STOCK_QTY",
        field: "OVER_STOCK_QTY",
        name: "과다재고",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMaster4Initialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster4", {
        columns: grdMaster4OnGetColumns(),
        queryId: "LVC02030Q0.RS_MASTER4",
        sortCol: "NO",
        gridOptions: options
    });

    G_GRDMASTER4.view.onSelectedRowsChanged.subscribe(grdMaster4OnAfterScroll);
}

function grdMaster4OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER4, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER4, row + 1);
}

function onGetMaster4(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER4, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER4);
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

function setRemainDayCombo() {

    var nameSuffix = $NC.getDisplayMsg("JS.LVC02030Q0.003", "일 이하");
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
            COMMON_CD_F: dsCustom[rIndex] + nameSuffix
        });
    }

    $NC.setInitComboData({
        selector: "#cboQRemain_Day",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        data: dsResult,
        onComplete: function() {
            $NC.setValue("#cboQRemain_Day", "30");
        }
    });
}
