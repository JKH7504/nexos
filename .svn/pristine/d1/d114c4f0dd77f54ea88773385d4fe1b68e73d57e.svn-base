/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : RIM03010Q1
 *  프로그램명         : 반입진행현황 (의류)
 *  프로그램설명       : 반입진행현황 (의류) 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-06-17
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-06-17    ASETEC           신규작성
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

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 반입예정일자, 예정/반입일자 라벨 숨김
    $("#lblQOrder_Date").hide();
    $("#lblQOrderInbound_Date").hide();
    $("#tdQProcess_Level").hide();

    // 프로세스 버튼 클릭 이벤트 연결
    $("#divT2DetailInfoView input[type=button]").bind("click", function(e) {
        var view = $(this);
        onSubViewChange(e, view);
    });

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $(".trQAdditionalCondition").hide();

    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setValue("#edtQBu_No");
    $NC.setInitDateRangePicker("#dtpQInbound_Date1", "#dtpQInbound_Date2");

    // 그리드 초기화
    grdT1MasterInitialize();

    grdT2MasterAInitialize();
    grdT2DetailAInitialize();
    grdT2MasterBInitialize();
    grdT2DetailBInitialize();
    grdT2MasterCInitialize();
    grdT2DetailCInitialize();
    grdT2MasterDInitialize();
    grdT2DetailDInitialize();
    grdT2MasterEInitialize();
    grdT2DetailEInitialize();

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

    // 조회조건 - 반입구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: $ND.C_INOUT_GRP_EM,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        onComplete: function() {
            // 반입전표/수량 정보 세팅, ※ 조회 조건이 모두 세팅이 되는 시점
            setSubSummaryInfo();
        }
    });

    // 반입단계 콤보 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "RI.INBOUND_STATE",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQProcess_Level",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    // 조회조건 - 시즌구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "SEASON_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQSeason_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
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
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    // 조회조건 - 연도구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "YEAR_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQYear_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    // 조회조건 - 상품구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });
}

function _OnLoaded() {
    // $(".btnIcoAdditionalCondition").hide();
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
            var BU_CD = $NC.getValue("#edtQBu_Cd");
            if ($NC.isNull(BU_CD)) {
                alert($NC.getDisplayMsg("JS.RIM03010Q1.001", "사업부를 먼저 선택 하십시오."));
                $NC.setValue("#edtQBrand_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onBuBrandChange(val, {
                P_BU_CD: BU_CD,
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "DELIVERY_CD":
            var CUST_CD = $NC.getValue("#edtQCust_Cd");
            if ($NC.isNull(CUST_CD)) {
                alert($NC.getDisplayMsg("JS.RIM03010Q1.001", "사업부를 먼저 선택 하십시오."));
                $NC.setValue("#edtQDelivery_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onDeliveryChange(val, {
                P_CUST_CD: CUST_CD,
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
        case "INBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIM03010Q1.002", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIM03010Q1.003", "검색 종료일자를 정확히 입력하십시오."));
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

    if ($NC.G_VAR.activeView.PROCESS_CD == $ND.C_PROCESS_ORDER) {
        $("#lblQOrder_Date").show();
        $("#lblQInbound_Date").hide();
    } else {
        $("#lblQOrder_Date").hide();
        $("#lblQInbound_Date").show();
    }

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
        alert($NC.getDisplayMsg("JS.RIM03010Q1.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
    if ($NC.isNull(INBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.RIM03010Q1.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }
    var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
    if ($NC.isNull(INBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.RIM03010Q1.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date2");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    if ($NC.isNull(INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.RIM03010Q1.007", "반입구분을 선택하십시오."));
        $NC.setFocus("#cboQInout_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var YEAR_DIV = $NC.getValue("#cboQYear_Div");
    var SEASON_DIV = $NC.getValue("#cboQSeason_Div");
    var ITEM_DIV = $NC.getValue("#cboQItem_Div");

    // 반입진행현황 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);
        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_INBOUND_DATE1: INBOUND_DATE1,
            P_INBOUND_DATE2: INBOUND_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: BU_CD,
            P_INOUT_CD: INOUT_CD,
            P_ITEM_STATE: ITEM_STATE,
            P_YEAR_DIV: YEAR_DIV,
            P_SEASON_DIV: SEASON_DIV,
            P_ITEM_DIV: ITEM_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/RIM03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {
        // 반입진행현황 상세화면
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar($NC.G_VAR.activeView.grdMaster);
        // 파라메터 세팅
        $NC.G_VAR.activeView.grdMaster.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_INBOUND_DATE1: INBOUND_DATE1,
            P_INBOUND_DATE2: INBOUND_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_PROCESS_CD: $NC.G_VAR.activeView.PROCESS_CD,
            P_BU_CD: BU_CD,
            P_INOUT_CD: INOUT_CD,
            P_ITEM_STATE: ITEM_STATE,
            P_YEAR_DIV: YEAR_DIV,
            P_SEASON_DIV: SEASON_DIV,
            P_ITEM_DIV: ITEM_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/RIM03010Q0/getDataSet.do", $NC.getGridParams($NC.G_VAR.activeView.grdMaster), onGetT2Master);
    } else {
        // 상세 반입진행내역 화면
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT3MASTER);
        // 파라메터 세팅
        G_GRDT3MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INBOUND_DATE1: INBOUND_DATE1,
            P_INBOUND_DATE2: INBOUND_DATE2,
            P_INOUT_CD: INOUT_CD,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_PROCESS_CD: $NC.getValue("#cboQProcess_Level"),
            P_DELIVERY_CD: DELIVERY_CD,
            P_BU_NO: BU_NO,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_STATE: ITEM_STATE,
            P_YEAR_DIV: YEAR_DIV,
            P_SEASON_DIV: SEASON_DIV,
            P_ITEM_DIV: ITEM_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/RIM03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
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
        $(".btnIcoAdditionalCondition").show();
        $("#lblQOrder_Date").hide();
        $("#lblQInbound_Date").show();
        $("#lblQOrderInbound_Date").hide();
        $("#tdQProcess_Level").hide();
        $(".trQAdditionalCondition").hide();
        $NC.onGlobalResize();
    } else if (tabActiveIndex == 1) {
        $(".btnIcoAdditionalCondition").show();
        $("#lblQOrderInbound_Date").hide();
        if ($NC.G_VAR.activeView.PROCESS_CD == $ND.C_PROCESS_ORDER) {
            $("#lblQOrder_Date").show();
            $("#lblQInbound_Date").hide();
        } else {
            $("#lblQOrder_Date").hide();
            $("#lblQInbound_Date").show();
        }
        $("#tdQProcess_Level").hide();
        $(".trQAdditionalCondition").hide();
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
            // 스필리터를 통한 _OnResize 호출
            $($NC.G_VAR.activeView.container).trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter($NC.G_VAR.activeView.container, "hb", 350);
        }
    } else {
        $(".btnIcoAdditionalCondition").show();
        $("#lblQOrder_Date").hide();
        $("#lblQInbound_Date").hide();
        $("#lblQOrderInbound_Date").show();
        $("#tdQProcess_Level").show();
        $(".trQAdditionalCondition").show();
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
        name: "반입예정",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "BILL_B",
        field: "BILL_B",
        name: "반입등록",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "BILL_C",
        field: "BILL_C",
        name: "반입지시",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "BILL_D",
        field: "BILL_D",
        name: "반입확정",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "BILL_E",
        field: "BILL_E",
        name: "반입적치",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
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
        queryId: "RIM03010Q1.RS_T1_MASTER",
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var ORDER_DATE = "";
    var ORDER_NO = "";
    var INBOUND_DATE = "";
    var INBOUND_NO = "";

    if ($NC.G_VAR.activeView.PROCESS_CD == $ND.C_PROCESS_ORDER) {
        ORDER_DATE = rowData.ORDER_DATE;
        ORDER_NO = rowData.ORDER_NO;
    } else {
        INBOUND_DATE = rowData.INBOUND_DATE;
        INBOUND_NO = rowData.INBOUND_NO;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar($NC.G_VAR.activeView.grdDetail);
    onGetT2Detail({
        data: null
    });

    // 파라메터 세팅
    $NC.G_VAR.activeView.grdDetail.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ORDER_DATE: ORDER_DATE,
        P_ORDER_NO: ORDER_NO,
        P_INBOUND_DATE: INBOUND_DATE,
        P_INBOUND_NO: INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/RIM03010Q0/getDataSet.do", $NC.getGridParams($NC.G_VAR.activeView.grdDetail), onGetT2Detail);

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
        name: "반입구분"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
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
        name: "반입총수량",
        cssClass: "styRight"
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
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
    });
    $NC.setGridColumn(columns, {
        id: "PLANED_DATETIME",
        field: "PLANED_DATETIME",
        name: "도착예정일시",
        cssClass: "styCenter"
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
        queryId: "RIM03010Q1.RS_T2_MASTER",
        sortCol: "INBOUND_DATE",
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
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
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
        cssClass: "styRight"
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
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight"
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

function grdT2DetailAInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2DetailA", {
        columns: grdT2DetailAOnGetColumns(),
        queryId: "RIM03010Q1.RS_T2_DETAIL",
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
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "반입일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "반입구분"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
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
        name: "반입총수량",
        cssClass: "styRight"
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
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
    });
    $NC.setGridColumn(columns, {
        id: "PLANED_DATETIME",
        field: "PLANED_DATETIME",
        name: "도착예정일시",
        cssClass: "styCenter"
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
        queryId: "RIM03010Q1.RS_T2_MASTER",
        sortCol: "INBOUND_DATE",
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
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
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
        cssClass: "styRight"
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
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight"
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

function grdT2DetailBInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2DetailB", {
        columns: grdT2DetailBOnGetColumns(),
        queryId: "RIM03010Q1.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT2DETAILB.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2MasterCOnGetColumns() {

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
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "반입일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "반입구분"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
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
        name: "반입총수량",
        cssClass: "styRight"
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
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
    });
    $NC.setGridColumn(columns, {
        id: "PLANED_DATETIME",
        field: "PLANED_DATETIME",
        name: "도착예정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterCInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2MasterC", {
        columns: grdT2MasterCOnGetColumns(),
        queryId: "RIM03010Q1.RS_T2_MASTER",
        sortCol: "INBOUND_DATE",
        gridOptions: options
    });

    G_GRDT2MASTERC.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2DetailCOnGetColumns() {

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
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
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
        cssClass: "styRight"
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
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight"
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

function grdT2DetailCInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2DetailC", {
        columns: grdT2DetailCOnGetColumns(),
        queryId: "RIM03010Q1.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT2DETAILC.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
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
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "반입일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "반입구분"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
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
        name: "반입총수량",
        cssClass: "styRight"
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
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
    });
    $NC.setGridColumn(columns, {
        id: "PLANED_DATETIME",
        field: "PLANED_DATETIME",
        name: "도착예정일시",
        cssClass: "styCenter"
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
        queryId: "RIM03010Q1.RS_T2_MASTER",
        sortCol: "INBOUND_DATE",
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
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
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
        cssClass: "styRight"
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
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight"
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

function grdT2DetailDInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2DetailD", {
        columns: grdT2DetailDOnGetColumns(),
        queryId: "RIM03010Q1.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT2DETAILD.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2MasterEOnGetColumns() {

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
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "반입일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "반입구분"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
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
        name: "반입총수량",
        cssClass: "styRight"
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
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
    });
    $NC.setGridColumn(columns, {
        id: "PLANED_DATETIME",
        field: "PLANED_DATETIME",
        name: "도착예정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterEInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2MasterE", {
        columns: grdT2MasterEOnGetColumns(),
        queryId: "RIM03010Q1.RS_T2_MASTER",
        sortCol: "INBOUND_DATE",
        gridOptions: options
    });

    G_GRDT2MASTERE.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2DetailEOnGetColumns() {

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
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PUTWAY_QTY",
        field: "PUTWAY_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PUTWAY_BOX",
        field: "PUTWAY_BOX",
        name: "확정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PUTWAY_EA",
        field: "PUTWAY_EA",
        name: "확정EA",
        cssClass: "styRight"
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
        id: "PUTWAY_WEIGHT",
        field: "PUTWAY_WEIGHT",
        name: "확정중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight"
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

function grdT2DetailEInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2DetailE", {
        columns: grdT2DetailEOnGetColumns(),
        queryId: "RIM03010Q1.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT2DETAILE.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT3MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_D",
        field: "INBOUND_STATE_D",
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
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "반입일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
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
        name: "반입구분"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
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
        id: "ORG_BU_NO",
        field: "ORG_BU_NO",
        name: "원주문번호"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
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
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
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
        cssClass: "styRight"
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
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight"
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
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
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
        queryId: "RIM03010Q1.RS_T3_MASTER",
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

function onGetT2Detail(ajaxData) {

    $NC.setInitGridData($NC.G_VAR.activeView.grdDetail, ajaxData);
    $NC.setInitGridAfterOpen($NC.G_VAR.activeView.grdDetail);
}

function onGetT2Sub(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var rIndex;
    if (dsResult.length == 0) {
        for (rIndex = 0; rIndex < 5; rIndex++) {
            $NC.setValue("#divProcessCnt" + String.fromCharCode(65 + rIndex), "0 / 0");
        }
    } else {
        var PROCESS_CD, PROCESS_CNT, PROCESS_QTY;
        var rowData = dsResult[0];
        for (rIndex = 0; rIndex < 5; rIndex++) {
            PROCESS_CD = String.fromCharCode(65 + rIndex);
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

function onChangingCondition() {

    // 반입진행현황 화면
    $NC.clearGridData(G_GRDT1MASTER);

    // 반입진행현황 상세화면 전체
    var grdObject, PROCESS_CD;
    for (var rIndex = 0; rIndex < 5; rIndex++) {
        PROCESS_CD = String.fromCharCode(65 + rIndex);

        // 마스터
        grdObject = window["G_GRDT2MASTER" + PROCESS_CD];
        // 조회시 전역 변수 값 초기화
        $NC.clearGridData(grdObject);
        // 디테일
        grdObject = window["G_GRDT2DETAIL" + PROCESS_CD];
        // 조회시 전역 변수 값 초기화
        $NC.clearGridData(grdObject);
    }

    setSubSummaryInfo();

    // 상세 반입진행내역 화면
    $NC.clearGridData(G_GRDT3MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

function setSubSummaryInfo() {

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
    var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var YEAR_DIV = $NC.getValue("#cboQYear_Div");
    var SEASON_DIV = $NC.getValue("#cboQSeason_Div");
    var ITEM_DIV = $NC.getValue("#cboQItem_Div");
    // 데이터 조회
    $NC.serviceCall("/RIM03010Q0/getDataSet.do", {
        P_QUERY_ID: "RIM03010Q1.RS_T2_SUB",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_INBOUND_DATE1: INBOUND_DATE1,
            P_INBOUND_DATE2: INBOUND_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: BU_CD,
            P_INOUT_CD: INOUT_CD,
            P_ITEM_STATE: ITEM_STATE,
            P_YEAR_DIV: YEAR_DIV,
            P_SEASON_DIV: SEASON_DIV,
            P_ITEM_DIV: ITEM_DIV
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
 * 검색조건의 사업부 검색 결과
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

    // 배송처 조회조건 초기화
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 배송처 검색 팝업 클릭
 */
function showDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.RIM03010Q1.001", "사업부를 먼저 선택 하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    $NP.showDeliveryPopup({
        title: $NC.getDisplayMsg("JS.RIM03010Q1.008", "온라인몰 검색"),
        columnTitle: [
            "온라인몰코드",
            "온라인몰명"
        ],
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: "92", // 92 - 온라인몰
            P_VIEW_DIV: "2"
        }
    }, onDeliveryPopup, function() {
        $NC.setFocus("#edtQDelivery_Cd", true);
    });
}

/**
 * 검색조건의 배송처 검색 결과
 * 
 * @param resultInfo
 */
function onDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQDelivery_Cd");
        $NC.setValue("#edtQDelivery_Nm");
        $NC.setFocus("#edtQDelivery_Cd", true);
    }
    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.RIM03010Q1.001", "사업부를 먼저 선택 하십시오."));
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
 * 검색조건의 브랜드 검색 결과
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
