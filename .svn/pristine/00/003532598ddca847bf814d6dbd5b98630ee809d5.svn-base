/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC01020Q0
 *  프로그램명         : 배차현황
 *  프로그램설명       : 배차현황 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-11-19
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-11-19    ASETEC           신규작성
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
                grids: $NC.getTabActiveIndex("#divMasterView") == 0 ? "#grdT1Master" : "#grdT2Master"
            };
        },
        // 체크할 정책 값
        policyVal: {
            CM510: "" // 운송권역 관리정책
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // Grid 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $NC.setInitDatePicker("#dtpQOutbound_Date");
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2", null, "W2"); // -15

    // 조회 조건 팝업버튼 Event 연결
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQArea_Cd").click(showDeliveryAreaPopup);
    $("#btnQRDelivery_Cd").click(showRDeliveryPopup);

    $NC.setVisible("#divQT2_Outbound_Date", false);

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
        onComplete: function(dsResult) {
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    });

}

/**
 * 화면 로드가 완료되었을 경우 자동 호출 됨
 */
function _OnLoaded() {

}

/**
 * 화면 리사이즈 Offset 세팅 - 고정 값
 */
function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 * 
 * @param {JQueryObject}
 *        parent Window JQueryObject
 * @param {Number}
 *        viewWidth Window width
 * @param {Number}
 *        viewHeight Window height
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 조회 조건에 있는 Input, Select Change Event 처리
 * 
 * @param {Object}
 *        e Event Object
 * @param {JQueryObject}
 *        view Event가 발생한 Element
 * @param {String}
 *        val Event가 발생한 Element의 현재 값
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC01020Q0.001", "출고일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC01020Q0.002", "시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC01020Q0.003", "종료일자를 정확히 입력하십시오."));
            break;
        case "AREA_CD":
            $NP.onDeliveryAreaChange(val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: val
            }, onDeliveryAreaPopup);
            return;
        case "RDELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onRDeliveryPopup);
            return;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회 조건 입력 값 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC01020Q0.004", "[물류센터]항목의 값을 먼저 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LDC01020Q0.005", "[사업부]항목의 값을 먼저 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC01020Q0.006", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LDC01020Q0.007", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LDC01020Q0.008", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LDC01020Q0.009", "출고일자 범위 입력오류입니다."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);
    var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    // 배차현황
    if (tabActiveIndex == 0) {
        // 조회시 전역 변수 값 초기화
        $NC.clearGridData(G_GRDT1MASTER);

        // 서비스 호출 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_AREA_CD: AREA_CD,
            P_RDELIVERY_CD: RDELIVERY_CD,
            P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
        };
        // 데이터 조회 서비스 호출
        $NC.serviceCall("/LDC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    } else {
        // 조회시 전역 변수 값 초기화
        $NC.clearGridData(G_GRDT2MASTER);

        // 서비스 호출 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2,
            P_AREA_CD: AREA_CD,
            P_RDELIVERY_CD: RDELIVERY_CD,
            P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
        };
        // 데이터 조회 서비스 호출
        $NC.serviceCall("/LDC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);

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
    $NC.setVisible("#divQT1_Outbound_Date", tabActiveIndex == 0);
    $NC.setVisible("#divQT2_Outbound_Date", tabActiveIndex == 1);
    $NC.onGlobalResize();
}

/**
 * grdT1Master Grid 컬럼 세팅
 * 
 * @returns {Array}
 */
function grdT1MasterOnGetColumns() {

    var columns = [];

    $NC.setGridColumn(columns, {
        id: "AREA_CD_F",
        field: "AREA_CD_F",
        name: "운송권역"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_TON_DIV_F",
        field: "CAR_TON_DIV_F",
        name: "차량톤구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_DIV_D",
        field: "CAR_DIV_D",
        name: "차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "기사성명"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_HP",
        field: "DRIVER_HP",
        name: "휴대전화번호"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "LO_QTY",
        field: "LO_QTY",
        name: "출고합계박스",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LO_AMT",
        field: "LO_AMT",
        name: "출고합계금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LO_WEIGHT",
        field: "LO_WEIGHT",
        name: "출고합계중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RI_QTY",
        field: "RI_QTY",
        name: "반품합계수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RI_AMT",
        field: "RI_AMT",
        name: "반품합계금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L3_QTY",
        field: "L3_QTY",
        name: "냉동출고박스",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L3_AMT",
        field: "L3_AMT",
        name: "냉동출고금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L2_QTY",
        field: "L2_QTY",
        name: "냉장출고박스",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L2_AMT",
        field: "L2_AMT",
        name: "냉장출고금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L1_QTY",
        field: "L1_QTY",
        name: "상온출고박스",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L1_AMT",
        field: "L1_AMT",
        name: "상온출고금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R3_QTY",
        field: "R3_QTY",
        name: "냉동반품수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R3_AMT",
        field: "R3_AMT",
        name: "냉동반품금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R2_QTY",
        field: "R2_QTY",
        name: "냉장반품수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R2_AMT",
        field: "R2_AMT",
        name: "냉장반품금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R1_QTY",
        field: "R1_QTY",
        name: "상온반품수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R1_AMT",
        field: "R1_AMT",
        name: "상온반품금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * grdT1Master Grid 초기화
 */
function grdT1MasterInitialize() {

    // Grid 옵션 세팅
    var options = {
        frozenColumn: 2,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
                    return "stySubTotal";
                }
            }
        },
        summaryRow: {
            visible: true,
            compareFn: function(field, rowData) {
                if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
                    return false;
                }
                return true;
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LDC01020Q0.RS_T1_MASTER", // QUERY ID
        sortCol: "AREA_CD", // 기본 정렬 컬럼의 ID
        gridOptions: options
    });

    // Grid 스크롤 이벤트
    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);

}

/**
 * grdT1Master Grid 스크롤 이벤트
 * 
 * @param {Object}
 *        e Event Object
 * @param {Object}
 *        args grid: SlickGrid, rows: Array
 */
function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재 Row/총 건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

/**
 * grdT2Master Grid 컬럼 세팅
 * 
 * @returns {Array}
 */
function grdT2MasterOnGetColumns() {

    var columns = [];

    $NC.setGridColumn(columns, {
        id: "AREA_CD_F",
        field: "AREA_CD_F",
        name: "운송권역",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_TON_DIV_F",
        field: "CAR_TON_DIV_F",
        name: "차량톤구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_DIV_D",
        field: "CAR_DIV_D",
        name: "차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "기사성명"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_HP",
        field: "DRIVER_HP",
        name: "휴대전화번호"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "LO_QTY",
        field: "LO_QTY",
        name: "출고합계박스",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LO_AMT",
        field: "LO_AMT",
        name: "출고합계금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LO_WEIGHT",
        field: "LO_WEIGHT",
        name: "출고합계중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RI_QTY",
        field: "RI_QTY",
        name: "반품합계수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RI_AMT",
        field: "RI_AMT",
        name: "반품합계금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L3_QTY",
        field: "L3_QTY",
        name: "냉동출고박스",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L3_AMT",
        field: "L3_AMT",
        name: "냉동출고금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L2_QTY",
        field: "L2_QTY",
        name: "냉장출고박스",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L2_AMT",
        field: "L2_AMT",
        name: "냉장출고금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L1_QTY",
        field: "L1_QTY",
        name: "상온출고박스",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "L1_AMT",
        field: "L1_AMT",
        name: "상온출고금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R3_QTY",
        field: "R3_QTY",
        name: "냉동반품수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R3_AMT",
        field: "R3_AMT",
        name: "냉동반품금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R2_QTY",
        field: "R2_QTY",
        name: "냉장반품수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R2_AMT",
        field: "R2_AMT",
        name: "냉장반품금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R1_QTY",
        field: "R1_QTY",
        name: "상온반품수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "R1_AMT",
        field: "R1_AMT",
        name: "상온반품금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * grdT2Master Grid 초기화
 */
function grdT2MasterInitialize() {

    // Grid 옵션 세팅
    var options = {
        frozenColumn: 2,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
                    return "stySubTotal";
                }
            }
        },
        summaryRow: {
            visible: true,
            compareFn: function(field, rowData) {
                if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
                    return false;
                }
                return true;
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LDC01020Q0.RS_T2_MASTER", // QUERY ID
        sortCol: "AREA_CD", // 기본 정렬 컬럼의 ID
        gridOptions: options,
        canDblClick: true
    });

    // Grid 스크롤 이벤트
    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
    G_GRDT2MASTER.view.onDblClick.subscribe(grdT2MasterOnDblClick);
}

/**
 * grdT2Master Grid 스크롤 이벤트
 * 
 * @param {Object}
 *        e Event Object
 * @param {Object}
 *        args grid: SlickGrid, rows: Array
 */
function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재 Row/총 건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

/**
 * grdT2Master Grid 더블 클릭 : 팝업 표시
 */
function grdT2MasterOnDblClick(e, args) {

    var row = args.row;
    var rowData = G_GRDT2MASTER.data.getItem(row);

    if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LDC01021P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LDC01021P0.001", "배차현황 상세내역"),
        url: "ld/LDC01021P0.html",
        width: 900,
        height: 500,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2,
            P_RDELIVERY_CD: rowData.RDELIVERY_CD,
            P_RDELIVERY_NM: rowData.RDELIVERY_NM,
            P_CAR_CD: rowData.CAR_CD,
            P_AREA_CD: rowData.AREA_CD,
            P_AREA_NM: rowData.AREA_NM,
            P_DRIVER_NM: rowData.DRIVER_NM,
            P_DRIVER_HP: rowData.DRIVER_HP,
            P_CAR_DIV_D: rowData.CAR_DIV_D,
            P_CAR_NM: rowData.CAR_NM,
            P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
        }
    });
}
/**
 * 배차현황 탭 조회 버튼 클릭후 처리
 */
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

/**
 * 기간별배차현황내역 탭 조회 버튼 클릭후 처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);

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
 * 검색항목 값 변경시 화면 클리어 처리
 */
function onChangingCondition() {

    // 데이터 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2MASTER);

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

    onChangingCondition();

}

/**
 * 검색조건의 운송권역 검색 팝업 클릭
 */
function showDeliveryAreaPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showDeliveryAreaPopup({
        P_CENTER_CD: CENTER_CD,
        P_AREA: $ND.C_ALL
    }, onDeliveryAreaPopup, function() {
        $NC.setFocus("#edtQArea_Cd", true);
    });
}

/**
 * 운송권역 검색 결과
 * 
 * @param resultInfo
 */
function onDeliveryAreaPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQArea_Cd", resultInfo.AREA_CD);
        $NC.setValue("#edtQArea_Nm", resultInfo.AREA_NM);
    } else {
        $NC.setValue("#edtQArea_Cd");
        $NC.setValue("#edtQArea_Nm");
        $NC.setFocus("#edtQArea_Cd", true);
    }

    onChangingCondition();
}

/**
 * 검색조건의 실배송처 검색 팝업 클릭
 */
function showRDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onRDeliveryPopup, function() {
        $NC.setFocus("#edtQRDelivery_Cd", true);
    });
}

/**
 * 실배송처 검색 결과
 * 
 * @param resultInfo
 */
function onRDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQRDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQRDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQRDelivery_Cd");
        $NC.setValue("#edtQRDelivery_Nm");
        $NC.setFocus("#edtQRDelivery_Cd", true);
    }
    onChangingCondition();
}
