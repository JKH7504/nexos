﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDR02010E0
 *  프로그램명         : [수신]상품마스터
 *  프로그램설명       : [수신]상품마스터 화면 Javascript
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
            return {
                container: "#divMasterView",
                grids: $NC.getTabActiveIndex("#divMasterView") == 0 ? [
                    "#grdT1Master"
                ] : "#grdT2Master"
            };
        },
        autoResizeFixedView: {
            viewFirst: function() {
                return $NC.getTabActiveIndex("#divMasterView") == 0 ? {
                    container: "#divT1Detail",
                    grids: "#grdT1Detail"
                } : {};
            },
            viewSecond: function() {
                return $NC.getTabActiveIndex("#divMasterView") == 0 && $NC.isVisible("#divT1Sub") ? {
                    container: "#divT1Sub",
                    grids: "#grdT1Sub"
                } : {};
            },
            viewType: "h",
            viewFixed: {
                container: "viewSecond",
                size: 400
            }
        },
        EDI_DIV: "RCM10"
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT1SubInitialize();
    grdT2MasterInitialize();

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    // 수신일자에 달력이미지 설정
    $NC.setInitDatePicker("#dtpQRecv_Date");
    $NC.setInitDateRangePicker("#dtpQRecv_Date1", "#dtpQRecv_Date2");

    // 조회조건 - 수신정의 세팅
    onGetDefineNo();

    $("#divQT2_Recv_Date").hide();

    // 조회조건에 오류수신내역 선택
    $NC.setValue("#rgbQView_Div1", "1");

    // 사업부 검색 이미지 클릭
    $("#btnQBu_Cd").click(showUserBuPopup);

    $("#btnRecv").click(btnRecvOnClick);
    $("#btnErrorProcess").click(btnErrorProcessAndColseOnClick);
    $("#btnClose").click(btnErrorProcessAndColseOnClick);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divT1TabSheetView", "h", 200);
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

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();

    switch (id) {
        case "BU_CD":
            if (val == $ND.C_BASE_BU_CD) {
                $NC.setValue("#edtQBu_Nm", $ND.C_BASE_NM);
                // 조회조건 - 수신정의 세팅
                onGetDefineNo();
                break;
            } else {
                $NP.onUserBuChange(val, {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_BU_CD: val,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }, onUserBuPopup, {
                    addBase: $ND.C_BASE_BU_CD
                });
                return;
            }
        case "RECV_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.EDR02010E0.017", "수신 일자를 정확히 입력하십시오."));
            break;
        case "RECV_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.EDR02010E0.001", "수신 시작일자를 정확히 입력하십시오."));
            break;
        case "RECV_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.EDR02010E0.002", "수신 종료일자를 정확히 입력하십시오."));
            break;
    }
    // 화면클리어
    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDT1SUB);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2MASTER);

    // 오류내역 그리드 초기화
    $("#divT1Sub").hide();
    $("#divT1Detail").css("border-width", "0");
    $NC.onGlobalResize();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
    if ($NC.isNull(DEFINE_NO)) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.004", "수신정의를 선택하십시오."));
        $NC.setFocus("#cboQDefine_No");
        return;
    }
    var RECV_DATE = $NC.getValue("#dtpQRecv_Date");
    if ($NC.isNull(RECV_DATE)) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.018", "수신 일자를 입력하십시오."));
        $NC.setFocus("#dtpQRecv_Date");
        return;
    }
    var RECV_DATE1 = $NC.getValue("#dtpQRecv_Date1");
    if ($NC.isNull(RECV_DATE1)) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.005", "수신 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQRecv_Date1");
        return;
    }
    var RECV_DATE2 = $NC.getValue("#dtpQRecv_Date2");
    if ($NC.isNull(RECV_DATE2)) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.006", "수신 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQRecv_Date2");
        return;
    }
    var VIEW_DIV = $NC.getValueRadioGroup("rgbQView_Div");

    // 수신내역 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1SUB);
        $NC.setInitGridVar(G_GRDT1DETAIL);
        $NC.setInitGridVar(G_GRDT1MASTER);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_BU_CD: BU_CD,
            P_DEFINE_NO: DEFINE_NO,
            P_RECV_DATE1: RECV_DATE1,
            P_RECV_DATE2: RECV_DATE2,
            P_VIEW_DIV: VIEW_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/EDR02010E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    } else {

        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_BU_CD: BU_CD,
            P_DEFINE_NO: DEFINE_NO,
            P_RECV_DATE: RECV_DATE
        };
        // 데이터 조회
        $NC.serviceCall("/EDR02010E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        $("#divViewDiv").show();
        $("#divQT1_Recv_Date").show();
        $("#divQT2_Recv_Date").hide();

        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT1TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT1TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT1TabSheetView", "h");
        }
    } else {
        $("#divViewDiv").hide();
        $("#divQT1_Recv_Date").hide();
        $("#divQT2_Recv_Date").show();

        $NC.onGlobalResize();
    }
}

function grdT1MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "RECV_DATE",
        field: "RECV_DATE",
        name: "수신일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_NO",
        field: "RECV_NO",
        name: "수신번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSING_YN",
        field: "CLOSING_YN",
        name: "처리완료여부",
        cssClass: "styCenter",
        resizable: false,
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT",
        field: "RECV_CNT",
        name: "총수신건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT0",
        field: "RECV_CNT0",
        name: "생성오류건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT1",
        field: "RECV_CNT1",
        name: "컬럼값오류건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT2",
        field: "RECV_CNT2",
        name: "미처리건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT3",
        field: "RECV_CNT3",
        name: "처리오류건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT4",
        field: "RECV_CNT4",
        name: "정상처리건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT5",
        field: "RECV_CNT5",
        name: "후처리오류건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT6",
        field: "RECV_CNT6",
        name: "정상후처리건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    // $NC.setGridColumn(columns, {
    // id: "RECV_CNTE",
    // field: "RECV_CNTE",
    // name: "실시간오류처리건수",
    // cssClass: "styRight",
    // formatter: Slick.Formatters.Number,
    // formatterOptions: $NC.getGridNumberColumnOptions("INT"),
    // aggregator: "SUM"
    // });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT8",
        field: "RECV_CNT8",
        name: "에러종결처리건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_CNT9",
        field: "RECV_CNT9",
        name: "종결처리건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 수신처리 내역
 */
function grdT1MasterInitialize() {

    var options = {
        summaryRow: {
            visible: true
        },
        specialRow: {
            compareKey: "CLOSING_YN",
            compareVal: $ND.C_NO,
            compareOperator: "==",
            cssClass: "styDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "EDR02010E0.RS_T1_MASTER",
        sortCol: "RECV_DATE",
        gridOptions: options
    });
    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    var VIEW_DIV = $NC.getValueRadioGroup("rgbQView_Div");
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1SUB);
    $NC.setInitGridVar(G_GRDT1DETAIL);
    // 파라메터 세팅
    G_GRDT1DETAIL.queryParams = {
        P_BU_CD: rowData.BU_CD,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_RECV_DATE: rowData.RECV_DATE,
        P_RECV_NO: rowData.RECV_NO,
        P_VIEW_DIV: VIEW_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/EDR02010E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    if (rowData.CLOSING_YN == $ND.C_YES) {
        $("#divT1Sub").hide();
        $("#divT1Detail").css("border-width", "0");
    } else {
        $("#divT1Sub").show();
        $("#divT1Detail").css("border-width", "0 1px 0 0");
    }
    $NC.onGlobalResize();

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1DetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "RECV_SEQ",
        field: "RECV_SEQ",
        name: "순번",
        cssClass: "styRight",
        resizable: false
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV_D",
        field: "ERROR_DIV_D",
        name: "오류구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CRUD_FLAG",
        field: "CRUD_FLAG",
        name: "CRUD구분"
    });
    $NC.setGridColumn(columns, {
        id: "PROC_BU_CD",
        field: "PROC_BU_CD",
        name: "처리사업부코드"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "브랜드코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_FULL_NM",
        field: "ITEM_FULL_NM",
        name: "상품정식명칭"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "상품규격"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_DIV",
        field: "ITEM_DIV",
        name: "상품구분"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처코드"
    });
    $NC.setGridColumn(columns, {
        id: "DEPART_CD",
        field: "DEPART_CD",
        name: "상품대분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_CD",
        field: "LINE_CD",
        name: "상품중분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_CD",
        field: "CLASS_CD",
        name: "상품소분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV",
        field: "KEEP_DIV",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DETAIL",
        field: "KEEP_DETAIL",
        name: "보관상세"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "CASE_BAR_CD",
        field: "CASE_BAR_CD",
        name: "소박스바코드"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_BAR_CD",
        field: "BOX_BAR_CD",
        name: "박스바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_WEIGHT",
        field: "ITEM_WEIGHT",
        name: "상품중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WIDTH",
        field: "BOX_WIDTH",
        name: "박스넓이",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_LENGTH",
        field: "BOX_LENGTH",
        name: "박스길이",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_HEIGHT",
        field: "BOX_HEIGHT",
        name: "박스높이",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_CBM",
        field: "BOX_CBM",
        name: "박스용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_CASE",
        field: "QTY_IN_CASE",
        name: "소박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_IN_PLT",
        field: "BOX_IN_PLT",
        name: "파렛트입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PLT_STAIR",
        field: "PLT_STAIR",
        name: "파렛트단박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PLT_PLACE",
        field: "PLT_PLACE",
        name: "파렛트면박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FILL_UNIT_QTY",
        field: "FILL_UNIT_QTY",
        name: "보충단위수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PLT_SPLIT_DIV",
        field: "PLT_SPLIT_DIV",
        name: "파렛트분할구분"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DIV",
        field: "VALID_DIV",
        name: "유효기한구분"
    });
    $NC.setGridColumn(columns, {
        id: "TERM_DIV",
        field: "TERM_DIV",
        name: "유효기한적용단위"
    });
    $NC.setGridColumn(columns, {
        id: "TERM_VAL",
        field: "TERM_VAL",
        name: "유효기한적용값",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SALE_PRICE",
        field: "SALE_PRICE",
        name: "판매단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TAG_PRICE",
        field: "TAG_PRICE",
        name: "택단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_YN",
        field: "VAT_YN",
        name: "과세여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SET_ITEM_YN",
        field: "SET_ITEM_YN",
        name: "세트상품여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_IN_DIV",
        field: "SERIAL_IN_DIV",
        name: "입고일련번호관리구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_OUT_DIV",
        field: "SERIAL_OUT_DIV",
        name: "출고일련번호관리구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOT_NO_REQ_YN",
        field: "LOT_NO_REQ_YN",
        name: "LOT번호필수여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATEREQ_YN",
        field: "VALID_DATE_REQ_YN",
        name: "제조유효일자필수여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO_REQ_YN",
        field: "BATCH_NO_REQ_YN",
        name: "제조배치번호필수여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LABELLING_DIV",
        field: "LABELLING_DIV",
        name: "라벨링구분"
    });
    $NC.setGridColumn(columns, {
        id: "MAKER_CD",
        field: "MAKER_CD",
        name: "제약사코드"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV",
        field: "DRUG_DIV",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV",
        field: "MEDICATION_DIV",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_QTY",
        field: "SERIAL_QTY",
        name: "일련번호관리수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "YEAR_DIV",
        field: "YEAR_DIV",
        name: "연도구분"
    });
    $NC.setGridColumn(columns, {
        id: "SEASON_DIV",
        field: "SEASON_DIV",
        name: "시즌구분"
    });
    $NC.setGridColumn(columns, {
        id: "GENDER_DIV",
        field: "GENDER_DIV",
        name: "성별구분"
    });
    $NC.setGridColumn(columns, {
        id: "STYLE_CD",
        field: "STYLE_CD",
        name: "스타일코드"
    });
    $NC.setGridColumn(columns, {
        id: "COLOR_CD",
        field: "COLOR_CD",
        name: "컬러코드"
    });
    $NC.setGridColumn(columns, {
        id: "COLOR_NM",
        field: "COLOR_NM",
        name: "컬러명"
    });
    $NC.setGridColumn(columns, {
        id: "SIZE_CD",
        field: "SIZE_CD",
        name: "사이즈코드"
    });
    $NC.setGridColumn(columns, {
        id: "SIZE_NM",
        field: "SIZE_NM",
        name: "사이즈명"
    });
    $NC.setGridColumn(columns, {
        id: "TAG_DIV",
        field: "TAG_DIV",
        name: "택구분"
    });
    $NC.setGridColumn(columns, {
        id: "PACK_BOX_DIV",
        field: "PACK_BOX_DIV",
        name: "포장박스구분"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_CD",
        field: "IN_UNIT_CD",
        name: "입고단위코드"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_UNIT_CD",
        field: "OUT_UNIT_CD",
        name: "출고단위코드"
    });
    $NC.setGridColumn(columns, {
        id: "SEASON_YN",
        field: "SEASON_YN",
        name: "계절상품여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "WEIGHT_ITEM_YN",
        field: "WEIGHT_ITEM_YN",
        name: "중량상품여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DISCARD_PURCHASE_YN",
        field: "DISCARD_PURCHASE_YN",
        name: "매입폐기반품여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DISCARD_SALE_YN",
        field: "DISCARD_SALE_YN",
        name: "매출폐기반품여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "RESTRICT_IN_MONTHS",
        field: "RESTRICT_IN_MONTHS",
        name: "입고제한잔존개월수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RESTRICT_OUT_MONTHS",
        field: "RESTRICT_OUT_MONTHS",
        name: "출고제한잔존개월수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DEPT_CD",
        field: "DEPT_CD",
        name: "부서코드"
    });
    $NC.setGridColumn(columns, {
        id: "AGING_DIV",
        field: "AGING_DIV",
        name: "숙성구분"
    });
    $NC.setGridColumn(columns, {
        id: "PROCURE_DIV",
        field: "PROCURE_DIV",
        name: "조달구분"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_DIV",
        field: "CLASS_DIV",
        name: "분류구분"
    });
    $NC.setGridColumn(columns, {
        id: "IDENTIFY_CD",
        field: "IDENTIFY_CD",
        name: "식별코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NO",
        field: "ITEM_NO",
        name: "상품번호"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SEQ",
        field: "ITEM_SEQ",
        name: "상품순번"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_BATCH_DIV",
        field: "RETURN_BATCH_DIV",
        name: "반품차수구분"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_CELL_NO",
        field: "RETURN_CELL_NO",
        name: "반품셀번호"
    });
    $NC.setGridColumn(columns, {
        id: "IMPORT_CD",
        field: "IMPORT_CD",
        name: "수입상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "IMPORT_BAR_CD",
        field: "IMPORT_BAR_CD",
        name: "수입상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ORIGIN_DIV",
        field: "ORIGIN_DIV",
        name: "원산지구분"
    });
    $NC.setGridColumn(columns, {
        id: "SORTER_PUT_YN",
        field: "SORTER_PUT_YN",
        name: "소터투입여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV",
        field: "DEAL_DIV",
        name: "거래구분"
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고1"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_USER_ID",
        field: "RECV_USER_ID",
        name: "수신자ID"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_DATETIME",
        field: "RECV_DATETIME",
        name: "수신일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CUST1_NOTE",
        field: "CUST1_NOTE",
        name: "고객사예비1"
    });
    $NC.setGridColumn(columns, {
        id: "CUST2_NOTE",
        field: "CUST2_NOTE",
        name: "고객사예비2"
    });
    $NC.setGridColumn(columns, {
        id: "CUST3_NOTE",
        field: "CUST3_NOTE",
        name: "고객사예비3"
    });
    $NC.setGridColumn(columns, {
        id: "CUST4_NOTE",
        field: "CUST4_NOTE",
        name: "고객사예비4"
    });
    $NC.setGridColumn(columns, {
        id: "CUST5_NOTE",
        field: "CUST5_NOTE",
        name: "고객사예비5"
    });
    $NC.setGridColumn(columns, {
        id: "CUST6_NOTE",
        field: "CUST6_NOTE",
        name: "고객사예비6"
    });
    $NC.setGridColumn(columns, {
        id: "CUST7_NOTE",
        field: "CUST7_NOTE",
        name: "고객사예비7"
    });
    $NC.setGridColumn(columns, {
        id: "CUST8_NOTE",
        field: "CUST8_NOTE",
        name: "고객사예비8"
    });
    $NC.setGridColumn(columns, {
        id: "CUST9_NOTE",
        field: "CUST9_NOTE",
        name: "고객사예비9"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 수신내역
 */
function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 2,
        specialRow: {
            compareKey: "ERROR_DIV",
            compareVal: "6",
            compareOperator: "!=",
            cssClass: "styError"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "EDR02010E0.RS_T1_DETAIL",
        sortCol: "RECV_SEQ",
        gridOptions: options
    });
    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);

}

function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1DETAIL.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1SUB);
    // 파라메터 세팅
    G_GRDT1SUB.queryParams = {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_RECV_DATE: rowData.RECV_DATE,
        P_RECV_NO: rowData.RECV_NO,
        P_RECV_SEQ: rowData.RECV_SEQ
    };
    // 데이터 조회
    $NC.serviceCall("/EDR02010E0/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function grdT1SubOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ERROR_CD",
        field: "ERROR_CD",
        name: "오류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_NM",
        field: "ERROR_NM",
        name: "오류명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 오류내역
 */
function grdT1SubInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Sub", {
        columns: grdT1SubOnGetColumns(),
        queryId: "EDR02010E0.RS_T1_SUB",
        sortCol: "ERROR_CD",
        gridOptions: options
    });
    G_GRDT1SUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
}

function grdT1SubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1SUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1SUB, row + 1);
}

function grdT2MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "RECV_DATE",
        field: "RECV_DATE",
        name: "수신일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_NO",
        field: "RECV_NO",
        name: "수신번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_SEQ",
        field: "RECV_SEQ",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CRUD_FLAG",
        field: "CRUD_FLAG",
        name: "CRUD구분"
    });
    $NC.setGridColumn(columns, {
        id: "PROC_BU_CD",
        field: "PROC_BU_CD",
        name: "처리사업부코드"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "브랜드코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_FULL_NM",
        field: "ITEM_FULL_NM",
        name: "상품정식명칭"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "상품규격"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_DIV",
        field: "ITEM_DIV",
        name: "상품구분"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처코드"
    });
    $NC.setGridColumn(columns, {
        id: "DEPART_CD",
        field: "DEPART_CD",
        name: "상품대분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_CD",
        field: "LINE_CD",
        name: "상품중분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_CD",
        field: "CLASS_CD",
        name: "상품소분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV",
        field: "KEEP_DIV",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DETAIL",
        field: "KEEP_DETAIL",
        name: "보관상세"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "CASE_BAR_CD",
        field: "CASE_BAR_CD",
        name: "소박스바코드"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_BAR_CD",
        field: "BOX_BAR_CD",
        name: "박스바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_WEIGHT",
        field: "ITEM_WEIGHT",
        name: "상품중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WIDTH",
        field: "BOX_WIDTH",
        name: "박스넓이",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_LENGTH",
        field: "BOX_LENGTH",
        name: "박스길이",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_HEIGHT",
        field: "BOX_HEIGHT",
        name: "박스높이",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_CBM",
        field: "BOX_CBM",
        name: "박스용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_CASE",
        field: "QTY_IN_CASE",
        name: "소박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_IN_PLT",
        field: "BOX_IN_PLT",
        name: "파렛트입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PLT_STAIR",
        field: "PLT_STAIR",
        name: "파렛트단박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PLT_PLACE",
        field: "PLT_PLACE",
        name: "파렛트면박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FILL_UNIT_QTY",
        field: "FILL_UNIT_QTY",
        name: "보충단위수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PLT_SPLIT_DIV",
        field: "PLT_SPLIT_DIV",
        name: "파렛트분할구분"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DIV",
        field: "VALID_DIV",
        name: "유효기한구분"
    });
    $NC.setGridColumn(columns, {
        id: "TERM_DIV",
        field: "TERM_DIV",
        name: "유효기한적용단위"
    });
    $NC.setGridColumn(columns, {
        id: "TERM_VAL",
        field: "TERM_VAL",
        name: "유효기한적용값",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SALE_PRICE",
        field: "SALE_PRICE",
        name: "판매단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TAG_PRICE",
        field: "TAG_PRICE",
        name: "택단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_YN",
        field: "VAT_YN",
        name: "과세여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SET_ITEM_YN",
        field: "SET_ITEM_YN",
        name: "세트상품여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_IN_DIV",
        field: "SERIAL_IN_DIV",
        name: "입고일련번호관리구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_OUT_DIV",
        field: "SERIAL_OUT_DIV",
        name: "출고일련번호관리구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOT_NO_REQ_YN",
        field: "LOT_NO_REQ_YN",
        name: "LOT번호필수여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATEREQ_YN",
        field: "VALID_DATE_REQ_YN",
        name: "제조유효일자필수여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO_REQ_YN",
        field: "BATCH_NO_REQ_YN",
        name: "제조배치번호필수여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LABELLING_DIV",
        field: "LABELLING_DIV",
        name: "라벨링구분"
    });
    $NC.setGridColumn(columns, {
        id: "MAKER_CD",
        field: "MAKER_CD",
        name: "제약사코드"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV",
        field: "DRUG_DIV",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV",
        field: "MEDICATION_DIV",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_QTY",
        field: "SERIAL_QTY",
        name: "일련번호관리수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "YEAR_DIV",
        field: "YEAR_DIV",
        name: "연도구분"
    });
    $NC.setGridColumn(columns, {
        id: "SEASON_DIV",
        field: "SEASON_DIV",
        name: "시즌구분"
    });
    $NC.setGridColumn(columns, {
        id: "GENDER_DIV",
        field: "GENDER_DIV",
        name: "성별구분"
    });
    $NC.setGridColumn(columns, {
        id: "STYLE_CD",
        field: "STYLE_CD",
        name: "스타일코드"
    });
    $NC.setGridColumn(columns, {
        id: "COLOR_CD",
        field: "COLOR_CD",
        name: "컬러코드"
    });
    $NC.setGridColumn(columns, {
        id: "COLOR_NM",
        field: "COLOR_NM",
        name: "컬러명"
    });
    $NC.setGridColumn(columns, {
        id: "SIZE_CD",
        field: "SIZE_CD",
        name: "사이즈코드"
    });
    $NC.setGridColumn(columns, {
        id: "SIZE_NM",
        field: "SIZE_NM",
        name: "사이즈명"
    });
    $NC.setGridColumn(columns, {
        id: "TAG_DIV",
        field: "TAG_DIV",
        name: "택구분"
    });
    $NC.setGridColumn(columns, {
        id: "PACK_BOX_DIV",
        field: "PACK_BOX_DIV",
        name: "포장박스구분"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_CD",
        field: "IN_UNIT_CD",
        name: "입고단위코드"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_UNIT_CD",
        field: "OUT_UNIT_CD",
        name: "출고단위코드"
    });
    $NC.setGridColumn(columns, {
        id: "SEASON_YN",
        field: "SEASON_YN",
        name: "계절상품여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "WEIGHT_ITEM_YN",
        field: "WEIGHT_ITEM_YN",
        name: "중량상품여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DISCARD_PURCHASE_YN",
        field: "DISCARD_PURCHASE_YN",
        name: "매입폐기반품여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DISCARD_SALE_YN",
        field: "DISCARD_SALE_YN",
        name: "매출폐기반품여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "RESTRICT_IN_MONTHS",
        field: "RESTRICT_IN_MONTHS",
        name: "입고제한잔존개월수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RESTRICT_OUT_MONTHS",
        field: "RESTRICT_OUT_MONTHS",
        name: "출고제한잔존개월수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DEPT_CD",
        field: "DEPT_CD",
        name: "부서코드"
    });
    $NC.setGridColumn(columns, {
        id: "AGING_DIV",
        field: "AGING_DIV",
        name: "숙성구분"
    });
    $NC.setGridColumn(columns, {
        id: "PROCURE_DIV",
        field: "PROCURE_DIV",
        name: "조달구분"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_DIV",
        field: "CLASS_DIV",
        name: "분류구분"
    });
    $NC.setGridColumn(columns, {
        id: "IDENTIFY_CD",
        field: "IDENTIFY_CD",
        name: "식별코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NO",
        field: "ITEM_NO",
        name: "상품번호"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SEQ",
        field: "ITEM_SEQ",
        name: "상품순번"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_BATCH_DIV",
        field: "RETURN_BATCH_DIV",
        name: "반품차수구분"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_CELL_NO",
        field: "RETURN_CELL_NO",
        name: "반품셀번호"
    });
    $NC.setGridColumn(columns, {
        id: "IMPORT_CD",
        field: "IMPORT_CD",
        name: "수입상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "IMPORT_BAR_CD",
        field: "IMPORT_BAR_CD",
        name: "수입상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ORIGIN_DIV",
        field: "ORIGIN_DIV",
        name: "원산지구분"
    });
    $NC.setGridColumn(columns, {
        id: "SORTER_PUT_YN",
        field: "SORTER_PUT_YN",
        name: "소터투입여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV",
        field: "DEAL_DIV",
        name: "거래구분"
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고1"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_USER_ID",
        field: "RECV_USER_ID",
        name: "수신자ID"
    });
    $NC.setGridColumn(columns, {
        id: "RECV_DATETIME",
        field: "RECV_DATETIME",
        name: "수신일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CUST1_NOTE",
        field: "CUST1_NOTE",
        name: "고객사예비1"
    });
    $NC.setGridColumn(columns, {
        id: "CUST2_NOTE",
        field: "CUST2_NOTE",
        name: "고객사예비2"
    });
    $NC.setGridColumn(columns, {
        id: "CUST3_NOTE",
        field: "CUST3_NOTE",
        name: "고객사예비3"
    });
    $NC.setGridColumn(columns, {
        id: "CUST4_NOTE",
        field: "CUST4_NOTE",
        name: "고객사예비4"
    });
    $NC.setGridColumn(columns, {
        id: "CUST5_NOTE",
        field: "CUST5_NOTE",
        name: "고객사예비5"
    });
    $NC.setGridColumn(columns, {
        id: "CUST6_NOTE",
        field: "CUST6_NOTE",
        name: "고객사예비6"
    });
    $NC.setGridColumn(columns, {
        id: "CUST7_NOTE",
        field: "CUST7_NOTE",
        name: "고객사예비7"
    });
    $NC.setGridColumn(columns, {
        id: "CUST8_NOTE",
        field: "CUST8_NOTE",
        name: "고객사예비8"
    });
    $NC.setGridColumn(columns, {
        id: "CUST9_NOTE",
        field: "CUST9_NOTE",
        name: "고객사예비9"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 수신내역
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "EDR02010E0.RS_T2_MASTER",
        sortCol: "RECV_NO",
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

/**
 * 수신처리 내역
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, [
        "RECV_DATE",
        "RECV_NO"
    ], true)) {
        $NC.clearGridData(G_GRDT1SUB);
        $NC.clearGridData(G_GRDT1DETAIL);
    }

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 수신내역
 */
function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1DETAIL)) {
        $NC.clearGridData(G_GRDT1SUB);
    }
}

/**
 * 오류내역
 */
function onGetT1Sub(ajaxData) {

    $NC.setInitGridData(G_GRDT1SUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1SUB);
}

/**
 * 수신내역탭
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);
}

function onGetRecvProc(ajaxData) {

    _Inquiry();
}
/**
 * 오류내역처리버튼 처리내역
 */
function onGetRecvError(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "RECV_DATE",
            "RECV_NO"
        ]
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;

}

/**
 * 종결처리버튼 처리내역
 */
function onGetRecvClose(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "RECV_DATE",
            "RECV_NO"
        ]
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
    alert($NC.getDisplayMsg("JS.EDR02010E0.007", "정상적으로 종결처리 되었습니다."));
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        queryParams: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        },
        addBase: $ND.C_BASE_BU_CD
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtQBu_Cd", true);
    });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
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
    onChangingCondition();
    // 조회조건 - 수신정의 세팅
    onGetDefineNo();
}

function btnRecvOnClick(e) {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.008", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.003", "사업부를 입력하십시오."));
        return;
    }
    var DATA_DIV = $NC.getValue("#cboQDefine_No");
    if ($NC.isNull(DATA_DIV)) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.009", "수신정의를 먼저 선택하십시오."));
        return;
    }
    var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");

    // 수신처리
    var PROCESS_CD = $ND.C_EDI_PROCESS_CREATE;
    // ComboBox 데이터에서 선택된 정의번호의 REMOTE_DIV 읽기
    var REMOTE_DIV = $NC.getComboData("#cboQDefine_No", -1).REMOTE_DIV;
    // 자료구분이 파일 형태일 경우(EXCEL, TEXT, XML, JSON) 원격송수신구분이 없으면 파일 선택
    if (DATA_DIV.startsWith("3") && $NC.isNull(REMOTE_DIV)) {
        var accept;
        switch (DATA_DIV) {
            // XLS
            case $ND.C_DATA_DIV_EXCEL:
                accept = ".xlsx, .xls";
                break;
            // TXT
            case $ND.C_DATA_DIV_TEXT:
                accept = ".txt";
                break;
            // XML
            case $ND.C_DATA_DIV_XML:
                accept = ".xml";
                break;
            // JSON
            case $ND.C_DATA_DIV_JSON:
                accept = ".json";
                break;
            default:
                alert($NC.getDisplayMsg("JS.EDR02010E0.010", "자료구분 값이 잘못 지정되었습니다."));
                return;
        }
        $NC.showUploadFilePopup(accept, function(view, fileName) {

            var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
            if (DATA_DIV == $ND.C_DATA_DIV_EXCEL) {
                if (fileExt != "xlsx" && fileExt != "xls") {
                    alert($NC.getDisplayMsg("JS.EDR02010E0.011", "엑셀 파일(*.xls, *.xlsx) 파일을 선택하십시오."));
                    return;
                }
            } else if (DATA_DIV == $ND.C_DATA_DIV_TEXT) {
                if (fileExt != "txt") {
                    alert($NC.getDisplayMsg("JS.EDR02010E0.012", "텍스트 파일(*.txt) 파일을 선택하십시오."));
                    return;
                }
            } else if (DATA_DIV == $ND.C_DATA_DIV_XML) {
                if (fileExt != "xml") {
                    alert($NC.getDisplayMsg("JS.EDR02010E0.013", "XML 파일(*.xml) 파일을 선택하십시오."));
                    return;
                }
            } else if (DATA_DIV == $ND.C_DATA_DIV_JSON) {
                if (fileExt != "json") {
                    alert($NC.getDisplayMsg("JS.EDR02010E0.014", "JSON 파일(*.json) 파일을 선택하십시오."));
                    return;
                }
            } else {
                alert($NC.getDisplayMsg("JS.EDR02010E0.010", "자료구분 값이 잘못 지정되었습니다."));
                return;
            }

            $NC.fileUpload("/EDR02010E0/recvFile.do", {
                P_BU_CD: BU_CD,
                P_EDI_DIV: $NC.G_VAR.EDI_DIV,
                P_DEFINE_NO: DEFINE_NO,
                P_RECV_DATE: null,
                P_RECV_NO: null,
                P_PROCESS_CD: PROCESS_CD,
                P_DATA_DIV: DATA_DIV,
                P_USER_ID: $NC.G_USERINFO.USER_ID
            }, function(ajaxData) {
                var resultData = $NC.toObject(ajaxData);
                var oMsg = $NC.getOutMessage(resultData);
                if (oMsg != $ND.C_OK) {
                    alert(oMsg);
                    return;
                }

                onGetRecvProc();
            });
        });
    } else {
        // ER_PROCESSING 호출 - DBLink, DBConnect, 자료구분이 파일 형태(EXCEL, TEXT, XML, JSON)이면서 원격송수신 지정된 수신정의
        $NC.serviceCall("/EDR02010E0/recvProcessing.do", {
            P_BU_CD: BU_CD,
            P_EDI_DIV: $NC.G_VAR.EDI_DIV,
            P_DEFINE_NO: DEFINE_NO,
            P_RECV_DATE: null,
            P_RECV_NO: null,
            P_PROCESS_CD: PROCESS_CD,
            P_DATA_DIV: DATA_DIV,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onGetRecvProc);
    }
}

function btnErrorProcessAndColseOnClick(e) {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.008", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.015", "처리할 대상을 선택하십시오."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (Number(rowData.RECV_CNT0) + Number(rowData.RECV_CNT1) + Number(rowData.RECV_CNT2) //
        + Number(rowData.RECV_CNT3) + Number(rowData.RECV_CNT4) + Number(rowData.RECV_CNT5) == 0) {
        alert($NC.getDisplayMsg("JS.EDR02010E0.016", "[오류/종결]처리 가능한 데이터를 선택하십시오."));
        return;
    }

    var PROCESS_CD, onSuccess;
    if (e.target.id == "btnErrorProcess") {
        // 오류내역처리
        PROCESS_CD = $ND.C_EDI_PROCESS_CHECKING;
        onSuccess = onGetRecvError;
    } else {
        // 종결처리
        PROCESS_CD = $ND.C_EDI_PROCESS_CLOSING;
        onSuccess = onGetRecvClose;
    }

    // ER_PROCESSING 호출
    $NC.serviceCall("/EDR02010E0/recvProcessing.do", {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_RECV_DATE: rowData.RECV_DATE,
        P_RECV_NO: rowData.RECV_NO,
        P_PROCESS_CD: PROCESS_CD,
        P_DATA_DIV: rowData.DATA_DIV,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSuccess);
}

/**
 * 조회조건 - 수신정의 세팅
 */
function onGetDefineNo() {

    $NC.setInitCombo("/EDR02010E0/getDataSet.do", {
        P_QUERY_ID: "EDCOMMON.POP_DEFINE_NO",
        P_QUERY_PARAMS: {
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_EDI_DIV: $NC.G_VAR.EDI_DIV
        }
    }, {
        selector: "#cboQDefine_No",
        codeField: "DATA_DIV",
        fullNameField: "DEFINE_NO_F",
        onComplete: function() {
            $NC.setValue("#cboQDefine_No", 0);
        }
    });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDT1MASTER.data.getLength() > 0;

    $NC.setEnable("#btnRecv", permission.canSave);
    $NC.setEnable("#btnErrorProcess", permission.canSave && enable);
    $NC.setEnable("#btnClose", permission.canSave && enable);
}