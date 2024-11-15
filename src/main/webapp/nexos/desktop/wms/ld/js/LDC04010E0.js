/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC04010E0
 *  프로그램명         : 운행일지
 *  프로그램설명       : 운행일지 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-13
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-11-25    ASETEC           신규작성
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
                grids: $NC.getTabActiveIndex("#divMasterView") == 0 ? null : "#grdT2Master"
            };
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdT1Master"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewFixed: {
                container: "viewSecond",
                sizeFn: function(viewWidth, viewHeight) {

                    var scrollOffset = viewHeight < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
                    // Container 사이즈 조정
                    return $NC.G_OFFSET.rightViewWidth + scrollOffset;
                }
            }
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

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();

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

    // 조회조건 - 운송일자 초기값 설정
    $NC.setInitDatePicker("#dtpQDelivery_Date");
    $NC.setInitDateRangePicker("#dtpQDelivery_Date1", "#dtpQDelivery_Date2", null, "CM");
    $NC.setInitDatePicker("#dtpDelivery_Date", null, "N");

    $("#btnQCar_Cd").click(showQCarPopup);
    $("#btnCar_Cd").click(showCarPopup);
    $("#btnFuelPriceT").click(btnFuelPriceTOnClick);

    $NC.setVisible("#divQT2_Delivery_Date", false);

    // 에디터 Disable
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    });

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

    $NC.G_OFFSET.rightViewWidth = 450;
    $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CAR_CD":
            $NP.onCarChange(val, {
                P_CAR_CD: val,
                P_CAR_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQCarPopup);
            return;
        case "DELIVERY_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC04010E0.001", "운송일자를 정확히 입력하십시오."));
            break;
        case "DELIVERY_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC04010E0.002", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "DELIVERY_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC04010E0.003", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2MASTER);

    // 사용자상세정보 컴퍼넌트 초기화.
    setInputValue("#grdT1Master");
    // 에디터 Disable
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    grdT1MasterOnCellChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC04010E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var CAR_CD = $NC.getValue("#edtQCar_Cd", true);
    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);
    var AREA_NM = $NC.getValue("#edtQArea_Nm", true);

    // 운행일지등록 탭
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        var DELIVERY_DATE = $NC.getValue("#dtpQDelivery_Date");
        if ($NC.isNull(DELIVERY_DATE)) {
            alert($NC.getDisplayMsg("JS.LDC04010E0.005", "운송일자를 입력하십시오."));
            $NC.setFocus("#dtpQDelivery_Date");
            return;
        }

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_CAR_CD: CAR_CD,
            P_DELIVERY_DATE: DELIVERY_DATE,
            P_AREA_CD: AREA_CD,
            P_AREA_NM: AREA_NM,
            P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
        };
        // 데이터 조회
        $NC.serviceCall("/LDC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    }
    // 운행일지내역 탭
    else {
        var DELIVERY_DATE1 = $NC.getValue("#dtpQDelivery_Date1");
        if ($NC.isNull(DELIVERY_DATE1)) {
            alert($NC.getDisplayMsg("JS.LDC04010E0.006", "시작일자를 입력하십시오."));
            $NC.setFocus("#dtpQDelivery_Date1");
            return;
        }

        var DELIVERY_DATE2 = $NC.getValue("#dtpQDelivery_Date2");
        if ($NC.isNull(DELIVERY_DATE2)) {
            alert($NC.getDisplayMsg("JS.LDC04010E0.007", "종료일자를 입력하십시오."));
            $NC.setFocus("#dtpQDelivery_Date2");
            return;
        }

        if (DELIVERY_DATE1 > DELIVERY_DATE2) {
            alert($NC.getDisplayMsg("JS.LDC04010E0.008", "기준일자 검색 범위 오류입니다."));
            $NC.setFocus("#dtpQDelivery_Date1");
            return;
        }

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_CAR_CD: CAR_CD,
            P_DELIVERY_DATE1: DELIVERY_DATE1,
            P_DELIVERY_DATE2: DELIVERY_DATE2,
            P_AREA_CD: AREA_CD,
            P_AREA_NM: AREA_NM,
            P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
        };
        // 데이터 조회
        $NC.serviceCall("/LDC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        return;
    }

    // 운송일자 디폴트값 설정
    $NC.setValue("#dtpDelivery_Date", $NC.getValue("#dtpQDelivery_Date"));

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        DELIVERY_DATE: $NC.getValue("#dtpDelivery_Date"),
        CAR_CD: null,
        FUEL_RATE: null,
        FUEL_PRICE: 0,
        DISTANCE_QTY: 0,
        FUEL_AMT: 0,
        TOLL_COST: 0,
        ETC_COST: 0,
        TOTAL_COST: 0,
        PLTKPP_OUT_QTY: 0,
        PLTAJ_OUT_QTY: 0,
        PLTETC_OUT_QTY: 0,
        PLTKPP_IN_QTY: 0,
        PLTAJ_IN_QTY: 0,
        PLTETC_IN_QTY: 0,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 이전 데이터가 한건도 없었으면 에디터 Enable
    if (G_GRDT1MASTER.data.getLength() == 0) {
        $NC.setEnableGroup("#divMasterInfoView", true);
    }

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDT1MASTER, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDT1MASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC04010E0.009", "저장할 데이터가 없습니다."));
        return;
    }

    // 현재 선택된 로우 Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        return;
    }

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDT1MASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1MASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_ORG_DELIVERY_DATE: rowData.ORG_DELIVERY_DATE,
            P_DELIVERY_DATE: rowData.DELIVERY_DATE,
            P_CAR_CD: rowData.CAR_CD,
            P_FUEL_RATE: rowData.FUEL_RATE,
            P_FUEL_PRICE: rowData.FUEL_PRICE,
            P_DISTANCE_QTY: rowData.DISTANCE_QTY,
            P_FUEL_AMT: rowData.FUEL_AMT,
            P_TOLL_COST: rowData.TOLL_COST,
            P_ETC_COST: rowData.ETC_COST,
            P_TOTAL_COST: rowData.TOTAL_COST,
            P_PLTKPP_OUT_QTY: rowData.PLTKPP_OUT_QTY,
            P_PLTAJ_OUT_QTY: rowData.PLTAJ_OUT_QTY,
            P_PLTETC_OUT_QTY: rowData.PLTETC_OUT_QTY,
            P_PLTKPP_IN_QTY: rowData.PLTKPP_IN_QTY,
            P_PLTAJ_IN_QTY: rowData.PLTAJ_IN_QTY,
            P_PLTETC_IN_QTY: rowData.PLTETC_IN_QTY,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC04010E0.010", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LDC04010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LDC04010E0.011", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC04010E0.012", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        if ($NC.deleteGridRowData(G_GRDT1MASTER, rowData) == 0) {
            $NC.setEnableGroup("#divMasterInfoView", false);
            setInputValue("#grdT1Master");
        }
    } else {
        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
        _Save();
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: "CAR_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
}

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
    $NC.setVisible("#divQT1_Delivery_Date", tabActiveIndex == 0);
    $NC.setVisible("#divQT2_Delivery_Date", tabActiveIndex == 1);
    $NC.onGlobalResize();
    setTopButtons();
}

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdT1Master") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }

        // Row 데이터로 에디터 세팅
        $NC.setValue("#dtpDelivery_Date", rowData["DELIVERY_DATE"]);
        $NC.setValue("#edtCar_Cd", rowData["CAR_CD"]);
        $NC.setValue("#edtCar_Nm", rowData["CAR_NM"]);
        $NC.setValue("#edtDriver_Nm", rowData["DRIVER_NM"]);
        $NC.setValue("#edtArea_Cd", rowData["AREA_CD"]);
        $NC.setValue("#edtArea_Nm", rowData["AREA_NM"]);
        $NC.setValue("#edtFuel_Rate", rowData["FUEL_RATE"]);
        $NC.setValue("#edtFuel_Price", rowData["FUEL_PRICE"]);
        $NC.setValue("#edtDistance_Qty", rowData["DISTANCE_QTY"]);
        $NC.setValue("#edtFuel_Amt", rowData["FUEL_AMT"]);
        $NC.setValue("#edtToll_Cost", rowData["TOLL_COST"]);
        $NC.setValue("#edtEtc_Cost", rowData["ETC_COST"]);
        $NC.setValue("#edtTotal_Cost", rowData["TOTAL_COST"]);
        $NC.setValue("#edtPltkpp_Out_Qty", rowData["PLTKPP_OUT_QTY"]);
        $NC.setValue("#edtPltaj_Out_Qty", rowData["PLTAJ_OUT_QTY"]);
        $NC.setValue("#edtPltetc_Out_Qty", rowData["PLTETC_OUT_QTY"]);
        $NC.setValue("#edtPltkpp_In_Qty", rowData["PLTKPP_IN_QTY"]);
        $NC.setValue("#edtPltaj_In_Qty", rowData["PLTAJ_IN_QTY"]);
        $NC.setValue("#edtPltetc_In_Qty", rowData["PLTETC_IN_QTY"]);
        $NC.setValue("#edtRemark1", rowData["REMARK1"]);

        // 신규 데이터면 차량코드 수정할 수 있게 함
        if (rowData["CRUD"] == $ND.C_DV_CRUD_C || rowData["CRUD"] == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#dtpDelivery_Date");
            $NC.setEnable("#edtCar_Cd");
            $NC.setEnable("#btnCar_Cd");
        } else {
            $NC.setEnable("#dtpDelivery_Date", false);
            $NC.setEnable("#edtCar_Cd", false);
            $NC.setEnable("#btnCar_Cd", false);
        }
    }
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "기사성명",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "AREA_CD",
        field: "AREA_CD",
        name: "운송권역",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "운송권역명",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_RATE",
        field: "FUEL_RATE",
        name: "연비",
        cssClass: "styRight",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_PRICE",
        field: "FUEL_PRICE",
        name: "유류단가",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_QTY",
        field: "DISTANCE_QTY",
        name: "운행거리",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_AMT",
        field: "FUEL_AMT",
        name: "유류금액",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "TOLL_COST",
        field: "TOLL_COST",
        name: "도로비",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "ETC_COST",
        field: "ETC_COST",
        name: "기타비",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_COST",
        field: "TOTAL_COST",
        name: "총비용",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "PLTKPP_OUT_QTY",
        field: "PLTKPP_OUT_QTY",
        name: "KPP",
        cssClass: "styRight",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "PLTAJ_OUT_QTY",
        field: "PLTAJ_OUT_QTY",
        name: "AJ",
        cssClass: "styRight",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "PLTETC_OUT_QTY",
        field: "PLTETC_OUT_QTY",
        name: "기타",
        cssClass: "styRight",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "PLTKPP_IN_QTY",
        field: "PLTKPP_IN_QTY",
        name: "KPP",
        cssClass: "styRight",
        band: 4
    });
    $NC.setGridColumn(columns, {
        id: "PLTAJ_IN_QTY",
        field: "PLTAJ_IN_QTY",
        name: "AJ",
        cssClass: "styRight",
        band: 4
    });
    $NC.setGridColumn(columns, {
        id: "PLTETC_IN_QTY",
        field: "PLTETC_IN_QTY",
        name: "기타",
        cssClass: "styRight",
        band: 4
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        band: 5
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 1,
        showBandRow: true,
        bands: [
            "차량",
            "차량정보",
            "운행정보",
            "파렛트출고",
            "파렛트입고",
            ""
        ]
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LDC04010E0.RS_T1_MASTER",
        sortCol: "CAR_CD",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1MASTER, row, "CAR_CD")) {
        return true;
    }

    var rowData = G_GRDT1MASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.DELIVERY_DATE)) {
            alert($NC.getDisplayMsg("JS.LDC04010E0.013", "운송일자를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDT1MASTER, row);
            $NC.setFocus("#dtpDelivery_Date");
            return false;
        }
        if ($NC.isNull(rowData.CAR_CD)) {
            alert($NC.getDisplayMsg("JS.LDC04010E0.014", "차량코드를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDT1MASTER, row);
            $NC.setFocus("#edtCar_Cd");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1MASTER, rowData);
    return true;
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 에디터 값 세팅
    setInputValue("#grdT1Master", G_GRDT1MASTER.data.getItem(row));

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1MasterOnCellChange(e, args) {

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "DELIVERY_DATE":
            rowData.DELIVERY_DATE = args.val;
            break;
        case "CAR_CD":
            $NP.onCarChange(args.val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_CAR_CD: args.val,
                P_CAR_DIV: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }, onCarPopup);
            break;
        case "DISTANCE_QTY":
            rowData.DISTANCE_QTY = args.val;
            rowData.FUEL_AMT = getFuelAmt();
            rowData.TOTAL_COST = getTotalCost();
            break;
        case "FUEL_PRICE":
            rowData.FUEL_PRICE = args.val;
            rowData.FUEL_AMT = getFuelAmt();
            rowData.TOTAL_COST = getTotalCost();
            break;
        case "TOLL_COST":
            rowData.TOLL_COST = args.val;
            rowData.TOTAL_COST = getTotalCost();
            break;
        case "ETC_COST":
            rowData.ETC_COST = args.val;
            rowData.TOTAL_COST = getTotalCost();
            break;
        case "PLTKPP_OUT_QTY":
            rowData.PLTKPP_OUT_QTY = args.val;
            break;
        case "PLTAJ_OUT_QTY":
            rowData.PLTAJ_OUT_QTY = args.val;
            break;
        case "PLTETC_OUT_QTY":
            rowData.PLTETC_OUT_QTY = args.val;
            break;
        case "PLTKPP_IN_QTY":
            rowData.PLTKPP_IN_QTY = args.val;
            break;
        case "PLTAJ_IN_QTY":
            rowData.PLTAJ_IN_QTY = args.val;
            break;
        case "PLTETC_IN_QTY":
            rowData.PLTETC_IN_QTY = args.val;
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;

    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);
}

/**
 * 유류금액 계산
 */
function getFuelAmt() {
    var FUEL_RATE = $NC.getValue("#edtFuel_Rate");
    var FUEL_PRICE = $NC.getValue("#edtFuel_Price");
    var DISTANCE_QTY = $NC.getValue("#edtDistance_Qty");

    var FUEL_AMT = 0;
    if (FUEL_RATE != 0) {
        FUEL_AMT = Math.round(DISTANCE_QTY / FUEL_RATE * FUEL_PRICE);
    }

    $NC.setValue("#edtFuel_Amt", FUEL_AMT);
    return FUEL_AMT;
}

/**
 * 총금액 계산
 */
function getTotalCost() {
    var FUEL_AMT = $NC.getValue("#edtFuel_Amt");
    var TOLL_COST = $NC.getValue("#edtToll_Cost");
    var ETC_COST = $NC.getValue("#edtEtc_Cost");

    var TOTAL_COST = Number(FUEL_AMT) + Number(TOLL_COST) + Number(ETC_COST);
    $NC.setValue("#edtTotal_Cost", TOTAL_COST);
    return TOTAL_COST;
}

function grdT1MasterOnNewRecord(args) {

    $NC.setFocus("#edtCar_Cd");
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DELIVERY_DATE",
        field: "DELIVERY_DATE",
        name: "운행일자",
        cssClass: "styCenter",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "기사성명",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "AREA_CD",
        field: "AREA_CD",
        name: "운송권역",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "운송권역명",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_RATE",
        field: "FUEL_RATE",
        name: "연비",
        cssClass: "styRight",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_PRICE",
        field: "FUEL_PRICE",
        name: "유류단가",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_QTY",
        field: "DISTANCE_QTY",
        name: "운행거리",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_AMT",
        field: "FUEL_AMT",
        name: "유류금액",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "TOLL_COST",
        field: "TOLL_COST",
        name: "도로비",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "ETC_COST",
        field: "ETC_COST",
        name: "기타비",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_COST",
        field: "TOTAL_COST",
        name: "총비용",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "PLTKPP_OUT_QTY",
        field: "PLTKPP_OUT_QTY",
        name: "KPP",
        cssClass: "styRight",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "PLTAJ_OUT_QTY",
        field: "PLTAJ_OUT_QTY",
        name: "AJ",
        cssClass: "styRight",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "PLTETC_OUT_QTY",
        field: "PLTETC_OUT_QTY",
        name: "기타",
        cssClass: "styRight",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "PLTKPP_IN_QTY",
        field: "PLTKPP_IN_QTY",
        name: "KPP",
        cssClass: "styRight",
        band: 4
    });
    $NC.setGridColumn(columns, {
        id: "PLTAJ_IN_QTY",
        field: "PLTAJ_IN_QTY",
        name: "AJ",
        cssClass: "styRight",
        band: 4
    });
    $NC.setGridColumn(columns, {
        id: "PLTETC_IN_QTY",
        field: "PLTETC_IN_QTY",
        name: "기타",
        cssClass: "styRight",
        band: 4
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        band: 5
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 2,
        showBandRow: true,
        bands: [
            "차량",
            "차량정보",
            "운행정보",
            "파렛트출고",
            "파렛트입고",
            ""
        ]
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LDC04010E0.RS_T2_MASTER",
        sortCol: "CAR_CD",
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

function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDT1MASTER, "CAR_CD", true)) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnable("#dtpDelivery_Date", false);
        $NC.setEnable("#btnCar_Cd", false);
        $NC.setEnable("#edtCar_Cd", false);
    } else {
        $NC.setEnableGroup("#divMasterInfoView", false);
        setInputValue("#grdT1Master");
    }

    setTopButtons();
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER, "CENTER_CD");

    setTopButtons();
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: "CAR_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;

}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDT1MASTER, rowData, true);
    }
}

/**
 * 차량코드 팝업
 * 
 * @returns
 */
function showQCarPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showCarPopup({
        queryParams: {
            P_CENTER_CD: CENTER_CD,
            P_CAR_CD: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onQCarPopup, function() {
        $NC.setFocus("#edtQCar_Cd", true);
    });
}

function onQCarPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCar_Cd", resultInfo.CAR_CD);
        $NC.setValue("#edtQCar_Nm", resultInfo.CAR_NM);
    } else {
        $NC.setValue("#edtQCar_Cd");
        $NC.setValue("#edtQCar_Nm");
    }
    onChangingCondition();
}

function showCarPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showCarPopup({
        queryParams: {
            P_CENTER_CD: CENTER_CD,
            P_CAR_CD: $ND.C_ALL,
            P_VIEW_DIV: "1"
        }
    }, onCarPopup, function() {
        $NC.setFocus("#edtCar_Cd", true);
    });
}

function onCarPopup(resultInfo) {

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtCar_Cd", resultInfo.CAR_CD);
        $NC.setValue("#edtCar_Nm", resultInfo.CAR_NM);
        $NC.setValue("#edtDriver_Nm", resultInfo.DRIVER_NM);
        $NC.setValue("#edtArea_Cd", resultInfo.AREA_CD);
        $NC.setValue("#edtArea_Nm", resultInfo.AREA_NM);
        $NC.setValue("#edtFuel_Rate", resultInfo.FUEL_RATE);

        rowData.CAR_CD = resultInfo.CAR_CD;
        rowData.CAR_NM = resultInfo.CAR_NM;
        rowData.DRIVER_NM = resultInfo.DRIVER_NM;
        rowData.AREA_CD = resultInfo.AREA_CD;
        rowData.AREA_NM = resultInfo.AREA_NM;
        rowData.FUEL_RATE = resultInfo.FUEL_RATE;

    } else {
        $NC.setValue("#edtCar_Cd");
        $NC.setValue("#edtCar_Nm");
        $NC.setValue("#edtDriver_Nm");
        $NC.setValue("#edtFuel_Rate");
        $NC.setValue("#edtArea_Cd");
        $NC.setValue("#edtArea_Nm");
        $NC.setFocus("#edtCar_Cd", true);

        rowData.CAR_CD = "";
        rowData.CAR_NM = "";
        rowData.DRIVER_NM = "";
        rowData.FUEL_RATE = "";
        rowData.AREA_CD = "";
        rowData.AREA_NM = "";

    }

    // 유류금액 및 총비용 재계산
    rowData.FUEL_AMT = getFuelAmt();
    rowData.TOTAL_COST = getTotalCost();

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);
}

function setTopButtons() {

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    // 운행일지등록탭
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        if ($NC.isNotNull(G_GRDT1MASTER.queryParams)) {
            $NC.G_VAR.buttons._new = "1";
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "1";
            $NC.G_VAR.buttons._delete = "1";
        }
    }

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function btnFuelPriceTOnClick() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC04010E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LDC04011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LDC04011P0.001", "유류단가 일괄적용"),
        url: "ld/LDC04011P0.html",
        width: 320,
        height: 200,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD
        },
        onOk: function() {
            _Inquiry();
        }
    });
}