/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LVC02040Q0
 *  프로그램명         : 재고분석(회전/히트)
 *  프로그램설명       : 재고분석(회전/히트) 화면 Javascript
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
            splitViews: [
                {
                    container: "#divLeftView",
                    grids: "#grdRotateDay"
                },
                {
                    container: "#divRightView",
                    grids: "#grdHitRate"
                }
            ],
            viewType: "h"
        }
    });

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    // 팝업 클릭 이벤트
    $("#btnQBu_Cd").click(showUserBuPopup);

    // 그리드 초기화
    grdRoateDayInitialize();
    grdHitRateInitialize();

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
        case "ITEM_CD":
            $NP.onItemChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd", true),
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: val,
                P_VIEW_DIV: "2",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemPopup);
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
    $NC.clearGridData(G_GRDROTATEDAY);
    $NC.clearGridData(G_GRDHITRATE);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LVC02040Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LVC02040Q0.002", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDROTATEDAY);
    $NC.setInitGridVar(G_GRDHITRATE);

    // 파라메터 세팅
    G_GRDHITRATE.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LVC02040Q0/getDataSet.do", $NC.getGridParams(G_GRDHITRATE), onGetHitRate);

    // 파라메터 세팅
    G_GRDROTATEDAY.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LVC02040Q0/getDataSet.do", $NC.getGridParams(G_GRDROTATEDAY), onGetRotateDay);
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

function grdRotateDayOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "NO",
        field: "NO",
        name: "No",
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
        id: "OUT_QTY",
        field: "OUT_QTY",
        name: "총출고수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "AVG_STOCK_QTY",
        field: "AVG_STOCK_QTY",
        name: "평균재고량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ROTATE_RATE",
        field: "ROTATE_RATE",
        name: "재고회전율",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ROTATE_DAY",
        field: "ROTATE_DAY",
        name: "재고회전일수",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdRoateDayInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdRotateDay", {
        columns: grdRotateDayOnGetColumns(),
        queryId: "LVC02040Q0.RS_ROTATEDAY",
        sortCol: "NO",
        gridOptions: options
    });

    G_GRDROTATEDAY.view.onSelectedRowsChanged.subscribe(grdRotateDayOnAfterScroll);
}

function grdRotateDayOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDROTATEDAY, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDROTATEDAY, row + 1);
}

function onGetRotateDay(ajaxData) {

    $NC.setInitGridData(G_GRDROTATEDAY, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDROTATEDAY);
}

function grdHitRateOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "NO",
        field: "NO",
        name: "No",
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
        id: "OUT_DAY",
        field: "OUT_DAY",
        name: "출고일수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_QTY",
        field: "OUT_QTY",
        name: "피킹수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOT_HIT_CNT",
        field: "TOT_HIT_CNT",
        name: "총히트수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "AVG_HIT_RATE",
        field: "AVG_HIT_RATE",
        name: "평균히트율",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdHitRateInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdHitRate", {
        columns: grdHitRateOnGetColumns(),
        queryId: "LVC02040Q0.RS_HITRATE",
        sortCol: "NO",
        gridOptions: options
    });

    G_GRDHITRATE.view.onSelectedRowsChanged.subscribe(grdHitRateOnAfterScroll);
}

function grdHitRateOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDHITRATE, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDHITRATE, row + 1);
}

function onGetHitRate(ajaxData) {

    $NC.setInitGridData(G_GRDHITRATE, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDHITRATE);
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
 * 상품 검색 팝업 표시
 */
function showItemPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd", true);

    $NP.showItemPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: $ND.C_ALL,
        P_ITEM_CD: $ND.C_ALL,
        P_VIEW_DIV: "2",
        P_DEPART_CD: $ND.C_ALL,
        P_LINE_CD: $ND.C_ALL,
        P_CLASS_CD: $ND.C_ALL
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
