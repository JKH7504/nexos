/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC07010Q0
 *  프로그램명         : 센터운영진행현황
 *  프로그램설명       : 센터운영진행현황 화면 Javascript
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
            switch ($NC.getTabActiveIndex(resizeView.container)) {
                case 0:
                    resizeView.grids = "#grdT1Master";
                    break;
                case 1:
                    resizeView.grids = [
                        $NC.G_VAR.activeView.master,
                        $NC.G_VAR.activeView.detail
                    ];
                    resizeView.childContainer = $NC.G_VAR.activeView.container;
                    resizeView.exceptChildHeight = $("#divT2DetailInfoView").outerHeight(true);
                    break;
                case 2:
                    resizeView.grids = "#grdT3Master";
                    break;
            }
            return resizeView;
        },

        // 현재 액티브된 상세 탭의 뷰 및 그리드 정보
        activeView: {
            container: "#divT2SubViewA",
            master: null,
            grdMaster: null,
            detail: null,
            grdDetail: null,
            PROCESS_CD: $ND.C_PROCESS_ORDER
        }
    });

    $NC.setInitDateRangePicker("#dtpQEtc_Date1", "#dtpQEtc_Date2");

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    $("#tdQProcess_Level").hide();

    // 프로세스 버튼 클릭 이벤트 연결
    $("#divT2DetailInfoView input[type=button]").bind("click", function(e) {
        var view = $(this);
        onSubViewChange(e, view);
    });

    $("#btnQBu_Cd").click(showUserBuPopup);

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterAInitialize();
    grdT2DetailAInitialize();
    grdT2MasterBInitialize();
    grdT2DetailBInitialize();
    grdT2MasterDInitialize();
    grdT2DetailDInitialize();
    grdT3MasterInitialize();

    $NC.G_VAR.activeView.master = "#grdT2MasterA";
    $NC.G_VAR.activeView.grdMaster = G_GRDT2MASTERA;
    $NC.G_VAR.activeView.detail = "#grdT2DetailA";
    $NC.G_VAR.activeView.grdDetail = G_GRDT2DETAILA;
    $("#btnProcessA").addClass("stySelect");

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

    // 조회조건 - 센터운영구분 세팅
    $NC.setInitComboData({
        selector: "#cboQInout_Cd",
        data: [
            {
                COMMON_CD: "E",
                COMMON_NM: $NC.getDisplayMsg("JS.LCC07010Q0.007", "입고")
            },
            {
                COMMON_CD: "D",
                COMMON_NM: $NC.getDisplayMsg("JS.LCC07010Q0.008", "출고")
            },
            {
                COMMON_CD: "M",
                COMMON_NM: $NC.getDisplayMsg("JS.LCC07010Q0.009", "이동")
            }
        ],
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        addAll: true,
        onComplete: function() {
            // 센터운영전표/수량 정보 세팅, ※ 조회 조건이 모두 세팅이 되는 시점
            setSubSummaryInfo();
        }
    });

    // 센터운영단계 콤보 세팅
    $NC.setInitComboData({
        selector: "#cboQProcess_Level",
        data: [
            {
                COMMON_CD: $ND.C_PROCESS_ORDER,
                COMMON_NM: $NC.getDisplayMsg("JS.LCC07010Q0.010", "센터운영예정")
            },
            {
                COMMON_CD: $ND.C_PROCESS_ENTRY,
                COMMON_NM: $NC.getDisplayMsg("JS.LCC07010Q0.011", "센터운영등록")
            },
            {
                COMMON_CD: $ND.C_PROCESS_CONFIRM,
                COMMON_NM: $NC.getDisplayMsg("JS.LCC07010Q0.012", "센터운영확정")
            }
        ],
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        addAll: true,
        multiSelect: true
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
        case "ETC_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC07010Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "ETC_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC07010Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * Sub View Button Click 시 호출 됨
 */
function onSubViewChange(e, $view) {

    // btnProcessA ---> A
    var PROCESS_CD = $view.prop("id").substr(10).toUpperCase();
    if ($NC.G_VAR.activeView.PROCESS_CD == PROCESS_CD) {
        return;
    }

    var INIT_PROCESS_CD;
    for (var rIndex = 0; rIndex < 5; rIndex++) {
        INIT_PROCESS_CD = String.fromCharCode(65 + rIndex);
        if (INIT_PROCESS_CD == "C" || INIT_PROCESS_CD == "E") {
            continue;
        }
        $("#btnProcess" + INIT_PROCESS_CD).removeClass("stySelect");
        $("#divT2SubView" + INIT_PROCESS_CD).hide();
    }

    $NC.G_VAR.activeView.container = "#divT2SubView" + PROCESS_CD;
    $NC.G_VAR.activeView.master = "#grdT2Master" + PROCESS_CD;
    $NC.G_VAR.activeView.grdMaster = window["G_GRDT2MASTER" + PROCESS_CD];
    $NC.G_VAR.activeView.detail = "#grdT2Detail" + PROCESS_CD;
    $NC.G_VAR.activeView.grdDetail = window["G_GRDT2DETAIL" + PROCESS_CD];
    $NC.G_VAR.activeView.PROCESS_CD = PROCESS_CD;

    $view.addClass("stySelect");
    $($NC.G_VAR.activeView.container).show();

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
        // 스필리터를 통한 _OnResize 호출
        $($NC.G_VAR.activeView.container).trigger("resize");
    } else {
        // 스플리터 초기화
        $NC.setInitSplitter($NC.G_VAR.activeView.container, "hb", 350);
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC07010Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var ETC_DATE1 = $NC.getValue("#dtpQEtc_Date1");
    if ($NC.isNull(ETC_DATE1)) {
        alert($NC.getDisplayMsg("JS.LCC07010Q0.004", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQEtc_Date1");
        return;
    }
    var ETC_DATE2 = $NC.getValue("#dtpQEtc_Date2");
    if ($NC.isNull(ETC_DATE2)) {
        alert($NC.getDisplayMsg("JS.LCC07010Q0.005", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQEtc_Date2");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    if ($NC.isNull(INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LCC07010Q0.006", "센터운영구분을 선택하십시오."));
        $NC.setFocus("#cboQInout_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd", true);

    // 센터운영진행현황 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);
        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_ETC_DATE1: ETC_DATE1,
            P_ETC_DATE2: ETC_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: BU_CD,
            P_INOUT_CD: INOUT_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LCC07010Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    }
    // 센터운영진행현황 상세화면
    else if ($NC.getTabActiveIndex("#divMasterView") == 1) {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar($NC.G_VAR.activeView.grdMaster);
        // 파라메터 세팅
        $NC.G_VAR.activeView.grdMaster.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_ETC_DATE1: ETC_DATE1,
            P_ETC_DATE2: ETC_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_PROCESS_CD: $NC.G_VAR.activeView.PROCESS_CD,
            P_BU_CD: BU_CD,
            P_INOUT_CD: INOUT_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LCC07010Q0/getDataSet.do", $NC.getGridParams($NC.G_VAR.activeView.grdMaster), onGetT2Master);
    }
    // 상세 센터운영진행내역 화면
    else {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT3MASTER);
        // 파라메터 세팅
        G_GRDT3MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ETC_DATE1: ETC_DATE1,
            P_ETC_DATE2: ETC_DATE2,
            P_INOUT_CD: INOUT_CD,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_PROCESS_CD: $NC.getValue("#cboQProcess_Level")
        };
        // 데이터 조회
        $NC.serviceCall("/LCC07010Q0/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
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
    if (tabActiveIndex == 0) {
        $("#tdQProcess_Level").hide();
        $NC.onGlobalResize();
    } else if (tabActiveIndex == 1) {
        $("#tdQProcess_Level").hide();

        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
            // 스필리터를 통한 _OnResize 호출
            $($NC.G_VAR.activeView.container).trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter($NC.G_VAR.activeView.container, "hb", 350);
        }
    } else {
        $("#tdQProcess_Level").show();
        $NC.onGlobalResize();
    }
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "SUM_DATA_DIV",
        field: "SUM_DATA_DIV",
        name: "데이터구분"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_A",
        field: "BILL_A",
        name: "예정",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BILL_B",
        field: "BILL_B",
        name: "등록",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BILL_D",
        field: "BILL_D",
        name: "확정",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 4,
        specialRow: {
            compareKey: "NO",
            compareVal: 1,
            compareOperator: "==",
            cssClass: "stySubTotal"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LCC07010Q0.RS_T1_MASTER",
        sortCol: "CUST_CD",
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

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow($NC.G_VAR.activeView.grdMaster, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = $NC.G_VAR.activeView.grdMaster.data.getItem(row);

    var ETC_DATE = "";
    var ETC_NO = "";

    if ($NC.G_VAR.activeView.PROCESS_CD == $ND.C_PROCESS_ORDER) {
        ETC_DATE = rowData.ORDER_DATE;
        ETC_NO = rowData.ORDER_NO;
    } else {
        ETC_DATE = rowData.ETC_DATE;
        ETC_NO = rowData.ETC_NO;
    }

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData($NC.G_VAR.activeView.grdDetail);

    // 파라메터 세팅
    $NC.G_VAR.activeView.grdDetail.queryParams = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: rowData.BU_CD,
        P_ETC_DATE: ETC_DATE,
        P_ETC_NO: ETC_NO,
        P_INOUT_GRP: rowData.INOUT_GRP
    };
    // 데이터 조회
    $NC.serviceCall("/LCC07010Q0/getDataSet.do", $NC.getGridParams($NC.G_VAR.activeView.grdDetail), onGetT2Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows($NC.G_VAR.activeView.grdMaster, row + 1);
}

function grdT2DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow($NC.G_VAR.activeView.grdDetail, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows($NC.G_VAR.activeView.grdDetail, row + 1);
}

function grdT2MasterAOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_DATE",
        field: "ORDER_DATE",
        name: "예정일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_NO",
        field: "ORDER_NO",
        name: "예정번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CNT",
        field: "ITEM_CNT",
        name: "상품수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_QTY",
        field: "BILL_QTY",
        name: "입출고총수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterAInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2MasterA", {
        columns: grdT2MasterAOnGetColumns(),
        queryId: "LCC07010Q0.RS_T2_MASTER",
        sortCol: "ETC_DATE",
        gridOptions: options
    });

    G_GRDT2MASTERA.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2DetailAOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
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
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
        name: "예정EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_WEIGHT",
        field: "ORDER_WEIGHT",
        name: "예정중량",
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
    $NC.setGridColumn(columns, {
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2DetailAInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2DetailA", {
        columns: grdT2DetailAOnGetColumns(),
        queryId: "LCC07010Q0.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT2DETAILA.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2MasterBOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_DATE",
        field: "ETC_DATE",
        name: "입출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_NO",
        field: "ETC_NO",
        name: "입출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CNT",
        field: "ITEM_CNT",
        name: "상품수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_QTY",
        field: "BILL_QTY",
        name: "입출고총수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterBInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2MasterB", {
        columns: grdT2MasterBOnGetColumns(),
        queryId: "LCC07010Q0.RS_T2_MASTER",
        sortCol: "ETC_DATE",
        gridOptions: options
    });

    G_GRDT2MASTERB.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2DetailBOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
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
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "등록BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "등록EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "확정EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_WEIGHT",
        field: "CONFIRM_WEIGHT",
        name: "확정중량",
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
    $NC.setGridColumn(columns, {
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2DetailBInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2DetailB", {
        columns: grdT2DetailBOnGetColumns(),
        queryId: "LCC07010Q0.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT2DETAILB.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2MasterDOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_DATE",
        field: "ETC_DATE",
        name: "입출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_NO",
        field: "ETC_NO",
        name: "입출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CNT",
        field: "ITEM_CNT",
        name: "상품수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_QTY",
        field: "BILL_QTY",
        name: "입출고총수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2MasterDInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2MasterD", {
        columns: grdT2MasterDOnGetColumns(),
        queryId: "LCC07010Q0.RS_T2_MASTER",
        sortCol: "ETC_DATE",
        gridOptions: options
    });

    G_GRDT2MASTERD.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2DetailDOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
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
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "등록BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "등록EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "확정EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_WEIGHT",
        field: "CONFIRM_WEIGHT",
        name: "확정중량",
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
    $NC.setGridColumn(columns, {
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailDInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2DetailD", {
        columns: grdT2DetailDOnGetColumns(),
        queryId: "LCC07010Q0.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT2DETAILD.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT3MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ETC_STATE_D",
        field: "ETC_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_DATE",
        field: "ETC_DATE",
        name: "입출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_NO",
        field: "ETC_NO",
        name: "입출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입출고구분"
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
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "등록BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "등록EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "확정EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_WEIGHT",
        field: "CONFIRM_WEIGHT",
        name: "확정중량",
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
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3MasterInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT3Master", {
        columns: grdT3MasterOnGetColumns(),
        queryId: "LCC07010Q0.RS_T3_MASTER",
        sortCol: "BU_CD",
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

function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT2Master(ajaxData) {

    $NC.setInitGridData($NC.G_VAR.activeView.grdMaster, ajaxData);
    if (!$NC.setInitGridAfterOpen($NC.G_VAR.activeView.grdMaster)) {
        // 디테일 초기화
        $NC.setInitGridVar($NC.G_VAR.activeView.grdDetail);
        onGetT2Detail({
            data: null
        });
    }

    // 전표건수/수량 합계 정보 업데이트
    setSubSummaryInfo();

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT2Detail(ajaxData) {

    $NC.setInitGridData($NC.G_VAR.activeView.grdDetail, ajaxData);
    $NC.setInitGridAfterOpen($NC.G_VAR.activeView.grdDetail);
}

function onGetT2Sub(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rIndex, PROCESS_CD;
    if (dsResult.length == 0) {
        for (rIndex = 0; rIndex < 5; rIndex++) {
            PROCESS_CD = String.fromCharCode(65 + rIndex);
            if (PROCESS_CD == "C" || PROCESS_CD == "E") {
                continue;
            }
            $NC.setValue("#divProcessCnt" + PROCESS_CD, "0 / 0");
        }
    } else {
        var PROCESS_CNT, PROCESS_QTY;
        var rowData = dsResult[0];
        for (rIndex = 0; rIndex < 5; rIndex++) {
            PROCESS_CD = String.fromCharCode(65 + rIndex);
            if (PROCESS_CD == "C" || PROCESS_CD == "E") {
                continue;
            }
            PROCESS_CNT = rowData["CNT_" + PROCESS_CD];
            PROCESS_QTY = rowData["QTY_" + PROCESS_CD];
            if ($NC.isNull(PROCESS_CNT)) {
                PROCESS_CNT = "0";
            }
            if ($NC.isNull(PROCESS_QTY)) {
                PROCESS_QTY = "0";
            }
            $NC.setValue("#divProcessCnt" + PROCESS_CD, $NC.getDisplayNumber(PROCESS_CNT) + " / " + $NC.getDisplayNumber(PROCESS_QTY));
        }
    }
}

function onGetT3Master(ajaxData) {

    $NC.setInitGridData(G_GRDT3MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT3MASTER);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onChangingCondition() {

    // 센터운영진행현황 화면
    $NC.clearGridData(G_GRDT1MASTER);

    // 센터운영진행현황 상세화면 전체
    var PROCESS_CD;
    for (var rIndex = 0; rIndex < 5; rIndex++) {
        PROCESS_CD = String.fromCharCode(65 + rIndex);
        if (PROCESS_CD == "C" || PROCESS_CD == "E") {
            continue;
        }

        // 조회시 전역 변수 값 초기화
        $NC.clearGridData(window["G_GRDT2MASTER" + PROCESS_CD]);
        $NC.clearGridData(window["G_GRDT2DETAIL" + PROCESS_CD]);
    }

    setSubSummaryInfo();

    // 상세 센터운영진행내역 화면
    $NC.clearGridData(G_GRDT3MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

function setSubSummaryInfo() {

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var ETC_DATE1 = $NC.getValue("#dtpQEtc_Date1");
    var ETC_DATE2 = $NC.getValue("#dtpQEtc_Date2");
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");

    // 데이터 조회
    $NC.serviceCall("/LCC07010Q0/getDataSet.do", {
        P_QUERY_ID: "LCC07010Q0.RS_T2_SUB",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_ETC_DATE1: ETC_DATE1,
            P_ETC_DATE2: ETC_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: BU_CD,
            P_INOUT_CD: INOUT_CD
        }
    }, onGetT2Sub);
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
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setFocus("#edtQBu_Cd", true);
    }
    onChangingCondition();
}
