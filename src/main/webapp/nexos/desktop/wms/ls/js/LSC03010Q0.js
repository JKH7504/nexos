﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC03010Q0
 *  프로그램명         : 재고분석현황
 *  프로그램설명       : 재고분석현황 화면 Javascript
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
        autoResizeView: function() {
            var resizeView = {
                container: "#divMasterView"
            };
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = "#grdT1Master";
            } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {
                resizeView.grids = "#grdT2Master";
            } else if ($NC.getTabActiveIndex("#divMasterView") == 2) {
                resizeView.grids = "#grdT3Master";
            } else if ($NC.getTabActiveIndex("#divMasterView") == 3) {
                resizeView.grids = [
                    "#grdT4Master",
                    "#grdT4Detail"
                ];
            } else if ($NC.getTabActiveIndex("#divMasterView") == 4) {
                resizeView.grids = "#grdT5Master";
            } else {
                resizeView.grids = "#grdT6Master";
            }
            return resizeView;
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();
    grdT3MasterInitialize();
    grdT4MasterInitialize();
    grdT4DetailInitialize();
    grdT5MasterInitialize();
    grdT6MasterInitialize();

    // 기준일자 표시
    $("#divOConditionInoutDate1").show();
    // 기준일자From-to 비표시
    $("#divOConditionInoutDate2").hide();
    // 상품보관구분 비표시
    $("#divOConditionKeepDiv").hide();
    // 잔여일수 초기화
    $NC.setValue("#edtQRemain_Days", "30");
    $("#divOConditionRemainDays").hide();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 출고구분 초기화
    $NC.setValue("#chkQInout_Cd1", $ND.C_YES);
    $NC.setValue("#chkQInout_Cd2", $ND.C_YES);
    $NC.setValue("#chkQInout_Cd3", $ND.C_YES);

    $NC.setInitDatePicker("#dtpQInout_Date");
    $NC.setInitDateRangePicker("#dtpQInout_Date1", "#dtpQInout_Date2", null, "CM");

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQDept_Cd").click(showDeptPopup);

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

    // 조회조건 - 상품상태 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_STATE",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_State",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQItem_State", 0);
        }
    });

    // 조회조건 - 상품보관구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "KEEP_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQKeep_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQKeep_Div", 0);
        }
    });

    // 조회조건 - 분류구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "CLASS_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQClass_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQClass_Div", 0);
        }
    });

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

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
 * Condition Change Event - Input, Select Change 시 호출 됨
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
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "INOUT_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC03010Q0.001", "기준일자를 정확히 입력하십시오."));
            break;
        case "INOUT_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC03010Q0.002", "기준 시작일자를 정확히 입력하십시오."));
            break;
        case "INOUT_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC03010Q0.003", "기준 종료일자를 정확히 입력하십시오."));
            break;
        case "DEPT_CD":
            $NP.onDeptChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DEPT_CD: val
            }, onDeptPopup);
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
        alert($NC.getDisplayMsg("JS.LSC03010Q0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC03010Q0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var KEEP_DIV = $NC.getValue("#cboQKeep_Div");
    var DEPT_CD = $NC.getValue("#edtQDept_Cd", true);

    var INOUT_CD1 = $NC.getValue("#chkQInout_Cd1");
    var INOUT_CD2 = $NC.getValue("#chkQInout_Cd2");
    var INOUT_CD3 = $NC.getValue("#chkQInout_Cd3");
    if ($NC.isVisible("#trQInoutCd")) {
        if ($NC.isNull(INOUT_CD1) && $NC.isNull(INOUT_CD2) && $NC.isNull(INOUT_CD3)) {
            alert($NC.getDisplayMsg("JS.LSC03010Q0.007", "출고구분을 선택하십시오."));
            $NC.setFocus("#chkQInout_Cd1");
            return;
        }
    }

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    if (tabActiveIndex < 2) {
        var BASE_DATE = $NC.getValue("#dtpQInout_Date");
        if ($NC.isNull(BASE_DATE)) {
            alert($NC.getDisplayMsg("JS.LSC03010Q0.006", "기준일자를 입력하십시오."));
            $NC.setFocus("#dtpQInout_Date");
            return;
        }

        var REMAIN_DAYS = $NC.getValue("#edtQRemain_Days");
        if ($NC.isNull(REMAIN_DAYS)) {
            REMAIN_DAYS = "0";
        }

        var CLASS_DIV = $NC.getValue("#cboQClass_Div", true);

        switch (tabActiveIndex) {
            case 0:
                $NC.setInitGridVar(G_GRDT1MASTER);
                // 파라메터 세팅
                G_GRDT1MASTER.queryParams = {
                    P_CENTER_CD: CENTER_CD,
                    P_BU_CD: BU_CD,
                    P_BASE_DATE: BASE_DATE,
                    P_BRAND_CD: BRAND_CD,
                    P_ITEM_CD: ITEM_CD,
                    P_ITEM_NM: ITEM_NM,
                    P_ITEM_STATE: ITEM_STATE,
                    P_DEPT_CD: DEPT_CD,
                    P_CLASS_DIV: CLASS_DIV
                };

                // 데이터 조회
                $NC.serviceCall("/LSC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
                break;
            case 1:
                $NC.setInitGridVar(G_GRDT2MASTER);
                // 파라메터 세팅
                G_GRDT2MASTER.queryParams = {
                    P_CENTER_CD: CENTER_CD,
                    P_BU_CD: BU_CD,
                    P_BASE_DATE: BASE_DATE,
                    P_REMAIN_DAYS: REMAIN_DAYS,
                    P_BRAND_CD: BRAND_CD,
                    P_ITEM_CD: ITEM_CD,
                    P_ITEM_NM: ITEM_NM,
                    P_ITEM_STATE: ITEM_STATE,
                    P_DEPT_CD: DEPT_CD
                };

                // 데이터 조회
                $NC.serviceCall("/LSC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
                break;
        }
    } else {
        var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
        if ($NC.isNull(INOUT_DATE1)) {
            alert($NC.getDisplayMsg("JS.LSC03010Q0.008", "기준 시작일자를 입력하십시오."));
            $NC.setFocus("#dtpQInout_Date1");
            return;
        }

        var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
        if ($NC.isNull(INOUT_DATE2)) {
            alert($NC.getDisplayMsg("JS.LSC03010Q0.009", "기준 종료일자를 입력하십시오."));
            $NC.setFocus("#dtpQInout_Date2");
            return;
        }

        if (INOUT_DATE1 > INOUT_DATE2) {
            alert($NC.getDisplayMsg("JS.LSC03010Q0.010", "기준일자 검색 범위 오류입니다."));
            $NC.setFocus("#dtpQInout_Date1");
            return;
        }

        switch (tabActiveIndex) {
            case 2:
                $NC.setInitGridVar(G_GRDT3MASTER);

                // 파라메터 세팅
                G_GRDT3MASTER.queryParams = {
                    P_CENTER_CD: CENTER_CD,
                    P_BU_CD: BU_CD,
                    P_INOUT_DATE1: INOUT_DATE1,
                    P_INOUT_DATE2: INOUT_DATE2,
                    P_BRAND_CD: BRAND_CD,
                    P_ITEM_CD: ITEM_CD,
                    P_ITEM_NM: ITEM_NM,
                    P_ITEM_STATE: ITEM_STATE,
                    P_DEPT_CD: DEPT_CD
                };

                // 데이터 조회
                $NC.serviceCall("/LSC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
                break;
            case 3:
                $NC.setInitGridVar(G_GRDT4MASTER);

                // 파라메터 세팅
                G_GRDT4MASTER.queryParams = {
                    P_CENTER_CD: CENTER_CD,
                    P_BU_CD: BU_CD,
                    P_INOUT_DATE1: INOUT_DATE1,
                    P_INOUT_DATE2: INOUT_DATE2,
                    P_BRAND_CD: BRAND_CD,
                    P_ITEM_CD: ITEM_CD,
                    P_ITEM_NM: ITEM_NM,
                    P_ITEM_STATE: ITEM_STATE,
                    P_DEPT_CD: DEPT_CD,
                    P_KEEP_DIV: KEEP_DIV
                };

                // 데이터 조회
                $NC.serviceCall("/LSC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT4MASTER), onGetT4Master);
                break;
            case 4:
                $NC.setInitGridVar(G_GRDT5MASTER);

                // 파라메터 세팅
                G_GRDT5MASTER.queryParams = {
                    P_CENTER_CD: CENTER_CD,
                    P_BU_CD: BU_CD,
                    P_INOUT_DATE1: INOUT_DATE1,
                    P_INOUT_DATE2: INOUT_DATE2,
                    P_BRAND_CD: BRAND_CD,
                    P_ITEM_CD: ITEM_CD,
                    P_ITEM_NM: ITEM_NM,
                    P_ITEM_STATE: ITEM_STATE,
                    P_DEPT_CD: DEPT_CD,
                    P_INOUT_CD1: INOUT_CD1,
                    P_INOUT_CD2: INOUT_CD2,
                    P_INOUT_CD3: INOUT_CD3
                };

                // 데이터 조회
                $NC.serviceCall("/LSC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT5MASTER), onGetT5Master);
                break;
            case 5:
                $NC.setInitGridVar(G_GRDT6MASTER);

                // 파라메터 세팅
                G_GRDT6MASTER.queryParams = {
                    P_CENTER_CD: CENTER_CD,
                    P_BU_CD: BU_CD,
                    P_INOUT_DATE1: INOUT_DATE1,
                    P_INOUT_DATE2: INOUT_DATE2,
                    P_BRAND_CD: BRAND_CD,
                    P_ITEM_CD: ITEM_CD,
                    P_ITEM_NM: ITEM_NM,
                    P_ITEM_STATE: ITEM_STATE,
                    P_DEPT_CD: DEPT_CD,
                    P_INOUT_CD1: INOUT_CD1,
                    P_INOUT_CD2: INOUT_CD2,
                    P_INOUT_CD3: INOUT_CD3
                };

                // 데이터 조회
                $NC.serviceCall("/LSC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT6MASTER), onGetT6Master);
                break;
        }
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

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *        newTab: The tab that was just activated.<br>
 *        oldTab: The tab that was just deactivated.<br>
 *        newPanel: The panel that was just activated.<br>
 *        oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    switch (tabActiveIndex) {
        case 0:
            $("#divOConditionInoutDate1").show();
            $("#divOConditionInoutDate2").hide();
            $("#divOConditionRemainDays").hide();
            $("#divOConditionKeepDiv").hide();
            $("#divOConditionClassDiv").show();
            $("#trQInoutCd").hide();
            break;
        case 1:
            $("#divOConditionInoutDate1").show();
            $("#divOConditionInoutDate2").hide();
            $("#divOConditionRemainDays").show();
            $("#divOConditionKeepDiv").hide();
            $("#divOConditionClassDiv").hide();
            $("#trQInoutCd").hide();
            break;
        case 3:
            $("#divOConditionInoutDate1").hide();
            $("#divOConditionInoutDate2").show();
            $("#divOConditionRemainDays").hide();
            $("#divOConditionKeepDiv").show();
            $("#divOConditionClassDiv").hide();
            $("#trQInoutCd").hide();
            break;
        case 2:
        case 4:
        case 5:
            $("#divOConditionInoutDate1").hide();
            $("#divOConditionInoutDate2").show();
            $("#divOConditionRemainDays").hide();
            $("#divOConditionKeepDiv").hide();
            $("#divOConditionClassDiv").hide();
            $("#trQInoutCd").show();
            break;
    }

    if (tabActiveIndex == 2) {
        $("#trQInoutCd").hide();
    }

    if (tabActiveIndex == 3) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT4TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT4TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT4TabSheetView", "hb", 300);
        }
    } else {
        $NC.onGlobalResize();
    }
}

function grdT1MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        band: 0,
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        band: 1,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 1,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        band: 1,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK01_QTY",
        field: "STOCK01_QTY",
        name: "재고수량",
        cssClass: "styRight",
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK01_BOX",
        field: "STOCK01_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK01_EA",
        field: "STOCK01_EA",
        name: "재고EA",
        cssClass: "styRight",
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK12_QTY",
        field: "STOCK12_QTY",
        name: "재고수량",
        cssClass: "styRight",
        band: 3,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK12_BOX",
        field: "STOCK12_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 3,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK12_EA",
        field: "STOCK12_EA",
        name: "재고EA",
        cssClass: "styRight",
        band: 3,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK23_QTY",
        field: "STOCK23_QTY",
        name: "재고수량",
        cssClass: "styRight",
        band: 4,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK23_BOX",
        field: "STOCK23_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 4,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK23_EA",
        field: "STOCK23_EA",
        name: "재고EA",
        cssClass: "styRight",
        band: 4,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK34_QTY",
        field: "STOCK34_QTY",
        name: "재고수량",
        cssClass: "styRight",
        band: 5,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK34_BOX",
        field: "STOCK34_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 5,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK34_EA",
        field: "STOCK34_EA",
        name: "재고EA",
        cssClass: "styRight",
        band: 5,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK45_QTY",
        field: "STOCK45_QTY",
        name: "재고수량",
        cssClass: "styRight",
        band: 6,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK45_BOX",
        field: "STOCK45_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 6,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK45_EA",
        field: "STOCK45_EA",
        name: "재고EA",
        cssClass: "styRight",
        band: 6,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK56_QTY",
        field: "STOCK56_QTY",
        name: "재고수량",
        cssClass: "styRight",
        band: 7,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK56_BOX",
        field: "STOCK56_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 7,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK56_EA",
        field: "STOCK56_EA",
        name: "재고EA",
        cssClass: "styRight",
        band: 7,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK60_QTY",
        field: "STOCK60_QTY",
        name: "재고수량",
        cssClass: "styRight",
        band: 8,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK60_BOX",
        field: "STOCK60_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 8,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK60_EA",
        field: "STOCK60_EA",
        name: "재고EA",
        cssClass: "styRight",
        band: 8,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분",
        band: 9
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분",
        band: 9
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분",
        band: 9
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드",
        band: 9
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 장기재고분석 그리드
 */
function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 3,
        showBandRow: true,
        bands: [
            "기본정보",
            "현재고",
            "1개월이내",
            "1~2개월",
            "2~3개월",
            "3~4개월",
            "4~5개월",
            "5~6개월",
            "6개월이상",
            "약품정보"
        ],
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LSC03010Q0.RS_T1_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT2MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "PERIOD_DATE",
        field: "PERIOD_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LEFT_DAYS",
        field: "LEFT_DAYS",
        name: "잔존일수",
        formatter: Slick.Formatters.Number,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 유효기간임박 상품분석
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 6,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.REMAIN_YN == $ND.C_NO) {
                    return "styUnder";
                }
            }
        },
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LSC03010Q0.RS_T2_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

function grdT3MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        band: 0,
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "AVG_QTY",
        field: "AVG_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "AVG_BOX",
        field: "AVG_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "AVG_EA",
        field: "AVG_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "AVG_WEIGHT",
        field: "AVG_WEIGHT",
        name: "재고중량",
        cssClass: "styRight",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight",
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_WEIGHT",
        field: "STOCK_WEIGHT",
        name: "재고중량",
        cssClass: "styRight",
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드",
        band: 3
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 일평균재고
 */
function grdT3MasterInitialize() {

    var options = {
        frozenColumn: 3,
        showBandRow: true,
        bands: [
            "기본정보",
            "일평균재고",
            "현재고",
            "약품정보"
        ],
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT3Master", {
        columns: grdT3MasterOnGetColumns(),
        queryId: "LSC03010Q0.RS_T3_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
}

function grdT3MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT3MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT3MASTER, row + 1);
}

function grdT4MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "ROTATE_DAY",
        field: "ROTATE_DAY",
        name: "평균재고일수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "출고수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 평균재고회전율
 */
function grdT4MasterInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT4Master", {
        columns: grdT4MasterOnGetColumns(),
        queryId: "LSC03010Q0.RS_T4_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT4MASTER.view.onSelectedRowsChanged.subscribe(grdT4MasterOnAfterScroll);
}

function grdT4MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT4MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT4MASTER.data.getItem(row);

    $NC.setInitGridVar(G_GRDT4DETAIL);
    onGetT4Detail({
        data: null
    });

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");

    // 파라메터 세팅
    G_GRDT4DETAIL.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INOUT_DATE1: INOUT_DATE1,
        P_INOUT_DATE2: INOUT_DATE2,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE
    };
    // 데이터 조회
    $NC.serviceCall("/LSC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT4DETAIL), onGetT4Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT4MASTER, row + 1);
}

function grdT4DetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_DATE",
        field: "STOCK_DATE",
        name: "입고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_DAY",
        field: "STOCK_DAY",
        name: "재고일수"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "출고수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "출고BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "출고EA",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/*
 * 평균재고회전율 - 상품별 출고내역
 */
function grdT4DetailInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT4Detail", {
        columns: grdT4DetailOnGetColumns(),
        queryId: "LSC03010Q0.RS_T4_DETAIL",
        sortCol: "OUTBOUND_DATE",
        gridOptions: options
    });

    G_GRDT4DETAIL.view.onSelectedRowsChanged.subscribe(grdT4DetailOnAfterScroll);
}

function grdT4DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT4DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT4DETAIL, row + 1);
}

function grdT5MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "HIT_CNT",
        field: "HIT_CNT",
        name: "총히트수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "HIT_QTY",
        field: "HIT_QTY",
        name: "총피킹수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "WORKDAY_CNT",
        field: "WORKDAY_CNT",
        name: "작업일수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUNDDAY_CNT",
        field: "OUTBOUNDDAY_CNT",
        name: "출고일수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "HIT_RATE",
        field: "HIT_RATE",
        name: "평균히트율",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "AVG_OUT_QTY",
        field: "AVG_OUT_QTY",
        name: "평균피킹수량(1회)",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "AVG_DAY_QTY",
        field: "AVG_DAY_QTY",
        name: "평균피킹수량(1일)",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상품별 평균히트율
 */
function grdT5MasterInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT5Master", {
        columns: grdT5MasterOnGetColumns(),
        queryId: "LSC03010Q0.RS_T5_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT5MASTER.view.onSelectedRowsChanged.subscribe(grdT5MasterOnAfterScroll);
}

function grdT5MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT5MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT5MASTER, row + 1);
}

function grdT6MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "HIT_CNT",
        field: "HIT_CNT",
        name: "총히트수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "HIT_QTY",
        field: "HIT_QTY",
        name: "총피킹수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "WORKDAY_CNT",
        field: "WORKDAY_CNT",
        name: "작업일수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUNDDAY_CNT",
        field: "OUTBOUNDDAY_CNT",
        name: "출고일수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "HIT_RATE",
        field: "HIT_RATE",
        name: "평균히트율",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "AVG_OUT_QTY",
        field: "AVG_OUT_QTY",
        name: "평균피킹수량(1회 )",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "AVG_DAY_QTY",
        field: "AVG_DAY_QTY",
        name: "평균피킹수량(1일)",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 로케이션별 평균히트율
 */
function grdT6MasterInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT6Master", {
        columns: grdT6MasterOnGetColumns(),
        queryId: "LSC03010Q0.RS_T6_MASTER",
        sortCol: "LOCATION_CD",
        gridOptions: options
    });

    G_GRDT6MASTER.view.onSelectedRowsChanged.subscribe(grdT6MasterOnAfterScroll);
}

function grdT6MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT6MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT6MASTER, row + 1);
}

/**
 * 입출고 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER);

}

/**
 * 일자별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);
}

/**
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT3Master(ajaxData) {

    $NC.setInitGridData(G_GRDT3MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT3MASTER);
}

/**
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT4Master(ajaxData) {

    $NC.setInitGridData(G_GRDT4MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT4MASTER, null, true)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDT4DETAIL);
        onGetT4Detail({
            data: null
        });
    }
}

/**
 * 평균재고회전율 - 상품별 출고내역
 * 
 * @param ajaxData
 */
function onGetT4Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT4DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT4DETAIL);
}

/**
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT5Master(ajaxData) {

    $NC.setInitGridData(G_GRDT5MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT5MASTER);
}

/**
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT6Master(ajaxData) {

    $NC.setInitGridData(G_GRDT6MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT6MASTER);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.clearGridData(G_GRDT3MASTER);
    $NC.clearGridData(G_GRDT4MASTER);
    $NC.clearGridData(G_GRDT4DETAIL);
    $NC.clearGridData(G_GRDT5MASTER);
    $NC.clearGridData(G_GRDT6MASTER);

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

    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    // 부서 조회조건 초기화
    $NC.setValue("#edtQDept_Cd");
    $NC.setValue("#edtQDept_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");

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
 * 부서 검색 이미지 클릭
 * 
 * @param resultInfo
 */

function showDeptPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

    $NP.showDeptPopup({
        P_CUST_CD: CUST_CD,
        P_DEPT_CD: $ND.C_ALL
    }, onDeptPopup, function() {
        $NC.setFocus("#edtQDept_Cd", true);
    });
}

/**
 * 부서 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onDeptPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQDept_Cd", resultInfo.DEPT_CD);
        $NC.setValue("#edtQDept_Nm", resultInfo.DEPT_NM);
    } else {
        $NC.setValue("#edtQDept_Cd");
        $NC.setValue("#edtQDept_Nm");
        $NC.setFocus("#edtQDept_Cd", true);
    }

    onChangingCondition();
}