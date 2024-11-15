/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC04020E0
 *  프로그램명         : 운행일지
 *  프로그램설명       : 운행일지 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2020-09-25
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-09-25    ASETEC           신규작성
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
            if ($NC.getTabActiveIndex("#divMasterView") == 1) {
                resizeView.grids = [
                    "#grdT2Master",
                    "#grdT2Detail"
                ];
            }
            return $NC.getTabActiveIndex("#divMasterView") != 2 ? resizeView : null;
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: [
                    "#grdT1Master",
                    "#grdT1Detail"
                ]
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
    grdT1DetailInitialize();
    grdT2MasterInitialize();
    grdT2DetailInitialize();
    grdT3MasterInitialize();

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

    // 운행일지구분
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "CARLOG_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboCarlog_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        onComplete: function() {
            $NC.setValue("#cboCarlog_Div");
        }
    });

    // 이전도착지 구분
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "PRIOR_DESTINATION_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "0,1", // 0:전체, 1:이전도착지, 2:다음도착지
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboPrior_Destination_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        addEmpty: true,
        fullNameField: "COMMON_CD_F",
        onComplete: function() {
            $NC.setValue("#cboPrior_Destination_Div");
        }
    });

    // 다음도착지 구분
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "NEXT_DESTINATION_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "0,2", // 0:전체, 1:이전도착지, 2:다음도착지
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboNext_Destination_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        addEmpty: true,
        fullNameField: "COMMON_CD_F",
        onComplete: function() {
            $NC.setValue("#cboNext_Destination_Div");
        }
    });

    $("#divOConditionOutbound_Date1").show();
    $("#divOConditionOutbound_Date2").hide();
    $("#btnFuelPriceT").show();
    $("#divOConditionProcess").show();
    $("#btnErrorProcess").hide();

    // 조회조건 - 운송일자 초기값 설정
    $NC.setInitDatePicker("#dtpQOutbound_Date");
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2", null, "CM");
    $NC.setInitDatePicker("#dtpOutbound_Date", null, "N");

    $("#btnQCar_Cd").click(showQCarPopup);
    $("#btnCar_Cd").click(showCarPopup);
    $("#btnFuelPriceT").click(btnFuelPriceTOnClick);
    $("#btnProcessPre").click(onProcessPre);
    $("#btnProcessNxt").click(onProcessNxt);
    $("#btnErrorProcess").click(btnErrorProcessOnClick);

    // 에디터 Disable
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    $NC.setInitSplitter("#divLeftView", "hb", $NC.G_OFFSET.topViewWidth);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.topViewWidth = 400;
    $NC.G_OFFSET.rightViewWidth = 450;
    $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    if ($NC.getTabActiveIndex("#divMasterView") == 2) {
        $NC.resizeGridView("#divMasterView", "#grdT3Master", null, null, $NC.G_LAYOUT.border2);
    }
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
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC04020E0.001", "출고일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC04020E0.002", "출고 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC04020E0.003", "출고 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 화면클리어
    onChangingCondition();
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
    grdT1DetailOnCellChange(e, {
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
        alert($NC.getDisplayMsg("JS.LDC04020E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.005", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.006", "시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }
    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.007", "종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.008", "기준일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }
    var CAR_CD = $NC.getValue("#edtQCar_Cd", true);
    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);
    var AREA_NM = $NC.getValue("#edtQArea_Nm", true);

    // 운행일지등록 탭
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 조회시 전역 변수 값 초기화
        $NC.clearGridData(G_GRDT1MASTER);
        $NC.clearGridData(G_GRDT1DETAIL);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_CAR_CD: CAR_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_AREA_CD: AREA_CD,
            P_AREA_NM: AREA_NM,
            P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
        };
        // 데이터 조회
        $NC.serviceCall("/LDC04020E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {
        // 운행일지내역 탭
        // 조회시 전역 변수 값 초기화
        $NC.clearGridData(G_GRDT2MASTER);
        $NC.clearGridData(G_GRDT2DETAIL);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_CAR_CD: CAR_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2,
            P_AREA_CD: AREA_CD,
            P_AREA_NM: AREA_NM,
            P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
        };
        // 데이터 조회
        $NC.serviceCall("/LDC04020E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    } else {
        // 거리계산 오류내역 탭
        // 조회시 전역 변수 값 초기화
        $NC.clearGridData(G_GRDT3MASTER);

        // 파라메터 세팅
        G_GRDT3MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE
        };
        // 데이터 조회
        $NC.serviceCall("/LDC04020E0/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
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
    $NC.setValue("#dtpOutbound_Date", $NC.getValue("#dtpQOutbound_Date"));

    // 수기용차의 경우만 신규 가능
    $NC.setValue("#cboCarlog_Div", "9");

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        OUTBOUND_DATE: $NC.getValue("#dtpOutbound_Date"),
        CAR_CD: null,
        DELIVERY_BATCH: "000",
        CARLOG_DIV: $NC.getValue("#cboCarlog_Div"),
        TRANS_PLT: 0,
        TRANS_BOX: 0,
        TRANS_WEIGHT: 0,
        TRANS_CBM: 0,
        TRANS_SUPPLY_AMT: 0,
        TRANS_BSUPPLY_AMT: 0,
        CALL_CNT: 0,
        DISTANCE_QTY: 0,
        FUEL_RATE: 0,
        FUEL_PRICE: 0,
        FUEL_AMT: 0,
        TOLL_COST: 0,
        DELIVERY_COST: 0,
        RENTCAR_COST: 0,
        TOTAL_COST: 0,
        REMARK1: null,
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

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.009", "저장할 데이터가 없습니다."));
        return;
    }

    // 현재 선택된 로우 Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
        return;
    }

    var dsMaster = [];
    // 마스터 데이터
    var rIndex, rCount, rowData;
    for (rIndex = 0, rCount = G_GRDT1MASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1MASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_ORG_OUTBOUND_DATE: rowData.ORG_OUTBOUND_DATE,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_CAR_CD: rowData.CAR_CD,
            P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
            P_CARLOG_DIV: rowData.CARLOG_DIV,
            P_TRANS_PLT: rowData.TRANS_PLT,
            P_TRANS_BOX: rowData.TRANS_BOX,
            P_TRANS_WEIGHT: rowData.TRANS_WEIGHT,
            P_TRANS_CBM: rowData.TRANS_CBM,
            P_TRANS_SUPPLY_AMT: rowData.TRANS_SUPPLY_AMT,
            P_TRANS_BSUPPLY_AMT: rowData.TRANS_BSUPPLY_AMT,
            P_CALL_CNT: rowData.CALL_CNT,
            P_DISTANCE_QTY: rowData.DISTANCE_QTY,
            P_FUEL_RATE: rowData.FUEL_RATE,
            P_FUEL_PRICE: rowData.FUEL_PRICE,
            P_FUEL_AMT: rowData.FUEL_AMT,
            P_TOLL_COST: rowData.TOLL_COST,
            P_DELIVERY_COST: rowData.DELIVERY_COST,
            P_RENTCAR_COST: rowData.RENTCAR_COST,
            P_TOTAL_COST: rowData.TOTAL_COST,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    var dsDetail = [];
    var dsSub = {};
    // 디테일 데이터
    for (rIndex = 0, rCount = G_GRDT1DETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1DETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        var detailRow = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_CAR_CD: rowData.CAR_CD,
            P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
            P_BU_CD: rowData.BU_CD,
            P_CUST_CD: rowData.CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_RDELIVERY_CD: rowData.RDELIVERY_CD,
            P_PRIOR_DESTINATION_DIV: rowData.PRIOR_DESTINATION_DIV,
            P_NEXT_DESTINATION_DIV: rowData.NEXT_DESTINATION_DIV,
            P_PRIOR_DISTANCE_QTY: rowData.PRIOR_DISTANCE_QTY,
            P_CRUD: rowData.CRUD
        };

        // 다음도착지 변경 시 거리계산 처리할 파라메터
        if (rowData.NEXT_DESTINATION_DIV != rowData.ORG_NEXT_DESTINATION_DIV) {
            detailRow.P_NEXT_DISTANCE_QTY = rowData.NEXT_DISTANCE_QTY;
            detailRow.P_DISTANCE_QTY = rowData.DISTANCE_QTY;
            detailRow.P_ERROR_CD = "";
            detailRow.P_ERROR_MSG = "";

            dsSub = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                P_CAR_CD: rowData.CAR_CD,
                P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
                P_BU_CD: rowData.BU_CD,
                P_CUST_CD: rowData.CUST_CD,
                P_DELIVERY_CD: rowData.DELIVERY_CD,
                P_RDELIVERY_CD: rowData.RDELIVERY_CD
            };
        }

        dsDetail.push(detailRow);
    }

    if (dsMaster.length == 0 && dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.010", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LDC04020E0/saveP2.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_DS_SUB: dsSub,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.011", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    if (rowData.CARLOG_DIV != "9") {
        alert($NC.getDisplayMsg("JS.LDC04020E0.013", "수기용차 데이터가 아닙니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC04020E0.012", "삭제 하시겠습니까?"))) {
        return;
    }

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

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "CAR_CD",
            "DELIVERY_BATCH"
        ],
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "RDELIVERY_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
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

    if (tabActiveIndex == 0) {
        $("#divOConditionOutbound_Date1").show();
        $("#divOConditionOutbound_Date2").hide();
        $("#btnFuelPriceT").show();
        $("#divOConditionProcess").show();
        $("#trQSpecialCondition").show();
        $("#btnErrorProcess").hide();

        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divLeftView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divLeftView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divLeftView", "hb", $NC.G_OFFSET.topViewWidth);
        }
    } else if (tabActiveIndex == 1) {
        $("#divOConditionOutbound_Date1").hide();
        $("#divOConditionOutbound_Date2").show();
        $("#btnFuelPriceT").hide();
        $("#divOConditionProcess").hide();
        $("#trQSpecialCondition").show();
        $("#btnErrorProcess").hide();

        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT2TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT2TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT2TabSheetView", "hb", $NC.G_OFFSET.topViewWidth);
        }
    } else {
        $("#divOConditionOutbound_Date1").show();
        $("#divOConditionOutbound_Date2").hide();
        $("#btnFuelPriceT").hide();
        $("#divOConditionProcess").hide();
        $("#trQSpecialCondition").hide();
        $("#btnErrorProcess").show();

        $NC.onGlobalResize();
    }

    setTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
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
        $NC.setValue("#dtpOutbound_Date", rowData["OUTBOUND_DATE"]);
        $NC.setValue("#edtCar_Cd", rowData["CAR_CD"]);
        $NC.setValue("#edtCar_Nm", rowData["CAR_NM"]);
        $NC.setValue("#edtDelivery_Batch", rowData["DELIVERY_BATCH"]);
        $NC.setValue("#cboCarlog_Div", rowData["CARLOG_DIV"]);
        $NC.setValue("#edtCall_Cnt", rowData["CALL_CNT"]);
        $NC.setValue("#edtDriving_Dist", rowData["DISTANCE_QTY"]);
        $NC.setValue("#edtFuel_Rate", rowData["FUEL_RATE"]);
        $NC.setValue("#edtFuel_Price", rowData["FUEL_PRICE"]);
        $NC.setValue("#edtFuel_Amt", rowData["FUEL_AMT"]);
        $NC.setValue("#edtToll_Cost", rowData["TOLL_COST"]);
        $NC.setValue("#edtDelivery_Cost", rowData["DELIVERY_COST"]);
        $NC.setValue("#edtRentcar_Cost", rowData["RENTCAR_COST"]);
        $NC.setValue("#edtTotal_Cost", rowData["TOTAL_COST"]);
        $NC.setValue("#edtTrans_Plt", rowData["TRANS_PLT"]);
        $NC.setValue("#edtTrans_Box", rowData["TRANS_BOX"]);
        $NC.setValue("#edtTrans_Weight", rowData["TRANS_WEIGHT"]);
        $NC.setValue("#edtTrans_Cbm", rowData["TRANS_CBM"]);
        $NC.setValue("#edtTrans_Supply_Amt", rowData["TRANS_SUPPLY_AMT"]);
        $NC.setValue("#edtTrans_Bsupply_Amt", rowData["TRANS_BSUPPLY_AMT"]);
        $NC.setValue("#edtRemark1", rowData["REMARK1"]);

        // 신규 데이터면 차량코드 수정할 수 있게 함
        if (rowData["CRUD"] == $ND.C_DV_CRUD_C || rowData["CRUD"] == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#dtpOutbound_Date");
            $NC.setEnable("#edtCar_Cd");
            $NC.setEnable("#btnCar_Cd");
            $NC.setEnable("#cboCarlog_Div", false);
            $NC.setEnable("#edtDriving_Dist", false);
            $NC.setEnable("#edtFuel_Price", false);
            $NC.setEnable("#edtToll_Cost", false);
            $NC.setEnable("#edtRentcar_Cost");
            $NC.setValue("#cboPrior_Destination_Div");
            $NC.setValue("#cboNext_Destination_Div");
            $NC.setEnable("#cboPrior_Destination_Div", false);
            $NC.setEnable("#cboNext_Destination_Div", false);
        } else {
            $NC.setEnable("#dtpOutbound_Date", false);
            $NC.setEnable("#edtCar_Cd", false);
            $NC.setEnable("#btnCar_Cd", false);
            if (rowData["CARLOG_DIV"] == "1") {
                $NC.setEnable("#cboCarlog_Div");
                $NC.setEnable("#edtDriving_Dist");
                $NC.setEnable("#edtFuel_Price");
                $NC.setEnable("#edtToll_Cost");
                $NC.setEnable("#edtRentcar_Cost", false);
            } else if (rowData["CARLOG_DIV"] == "2") {
                $NC.setEnable("#cboCarlog_Div");
                $NC.setEnable("#edtDriving_Dist", false);
                $NC.setEnable("#edtFuel_Price", false);
                $NC.setEnable("#edtToll_Cost", false);
                $NC.setEnable("#edtRentcar_Cost");
            } else {
                $NC.setEnable("#cboCarlog_Div", false);
                $NC.setEnable("#edtDriving_Dist", false);
                $NC.setEnable("#edtFuel_Price", false);
                $NC.setEnable("#edtToll_Cost", false);
                $NC.setEnable("#edtRentcar_Cost", $NC.isNotNull(rowData["CARLOG_DIV"]));
            }
        }
    }

    if (grdSelector == "#grdT1Detail") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }

        // Row 데이터로 에디터 세팅
        $NC.setValue("#cboPrior_Destination_Div", rowData["PRIOR_DESTINATION_DIV"]);
        $NC.setValue("#cboNext_Destination_Div", rowData["NEXT_DESTINATION_DIV"]);

        $NC.setEnable("#cboPrior_Destination_Div", rowData["FIRST_YN"] == $ND.C_YES);
        $NC.setEnable("#cboNext_Destination_Div", rowData["LAST_YN"] == $ND.C_YES);
    }

}

function grdT1MasterOnGetColumns() {

    var columns = [];
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
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운송자성명"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_BATCH_F",
        field: "DELIVERY_BATCH_F",
        name: "운송차수"
    });
    $NC.setGridColumn(columns, {
        id: "CARLOG_DIV_F",
        field: "CARLOG_DIV_F",
        name: "운행일지구분"
    });
    $NC.setGridColumn(columns, {
        id: "CALL_CNT",
        field: "CALL_CNT",
        name: "콜수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "운송PLT",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "운송BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "운송중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "운송적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BSUPPLY_AMT",
        field: "TRANS_BSUPPLY_AMT",
        name: "운송기준단가금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_QTY",
        field: "DISTANCE_QTY",
        name: "운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_RATE",
        field: "FUEL_RATE",
        name: "연비",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_PRICE",
        field: "FUEL_PRICE",
        name: "유류단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_AMT",
        field: "FUEL_AMT",
        name: "유류금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOLL_COST",
        field: "TOLL_COST",
        name: "도로비",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_COST",
        field: "DELIVERY_COST",
        name: "지입료",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RENTCAR_COST",
        field: "RENTCAR_COST",
        name: "용차비",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_COST",
        field: "TOTAL_COST",
        name: "총비용",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LDC04020E0.RS_T1_MASTER",
        sortCol: [
            "CAR_CD",
            "DELIVERY_BATCH"
        ],
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
        if ($NC.isNull(rowData.OUTBOUND_DATE)) {
            alert($NC.getDisplayMsg("JS.LDC04020E0.005", "출고일자를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDT1MASTER, row);
            $NC.setFocus("#dtpOutbound_Date");
            return false;
        }
        if ($NC.isNull(rowData.CAR_CD)) {
            alert($NC.getDisplayMsg("JS.LDC04020E0.014", "차량코드를 입력하십시오."));
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

    if ($NC.isGridModified(G_GRDT1DETAIL)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.015", "데이터가 변경되었습니다. 저장 후 처리하십시오."));
        $NC.setGridSelectRow(G_GRDT1MASTER, G_GRDT1MASTER.lastRow);
        return;
    }

    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    // 에디터 값 세팅
    setInputValue("#grdT1Master", rowData);
    setInputValue("#grdT1Detail");

    // 디테일 전역 변수 값 초기화
    $NC.clearGridData(G_GRDT1DETAIL);
    if (rowData.CRUD != $ND.C_DV_CRUD_C && rowData.CRUD != $ND.C_DV_CRUD_N) {
        G_GRDT1DETAIL.queryParams = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_CAR_CD: rowData.CAR_CD,
            P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
            P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
        };
        // 데이터 조회
        $NC.serviceCall("/LDC04020E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1MasterOnCellChange(e, args) {

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "OUTBOUND_DATE":
            rowData.OUTBOUND_DATE = args.val;
            break;
        case "CAR_CD":
            $NP.onCarChange(args.val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_CAR_CD: args.val,
                P_CAR_DIV: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }, onCarPopup);
            break;
        case "CARLOG_DIV":
            if (rowData.CARLOG_DIV != "9" && args.val == "9") {
                alert($NC.getDisplayMsg("JS.LDC04020E0.016", "수기용차로 변경할 수 없습니다."));
                $NC.setValue("#cboCarlog_Div", rowData.CARLOG_DIV);
                break;
            }
            rowData.CARLOG_DIV = args.val;
            rowData.CARLOG_DIV_F = $NC.getValueCombo(args.view, "F");
            if (rowData.CARLOG_DIV == "1") {
                var sumVal = $NC.getGridSumVal(G_GRDT1DETAIL, {
                    sumKey: [
                        "DISTANCE_QTY",
                        "PRIOR_DISTANCE_QTY",
                        "NEXT_DISTANCE_QTY"
                    ]
                });
                rowData.DISTANCE_QTY = $NC.getRoundVal(sumVal.DISTANCE_QTY + sumVal.PRIOR_DISTANCE_QTY + sumVal.NEXT_DISTANCE_QTY, 3);
                rowData.RENTCAR_COST = 0;
                $NC.setValue("#edtDriving_Dist", rowData.DISTANCE_QTY);
                $NC.setValue("#edtRentcar_Cost", rowData.RENTCAR_COST);
                $NC.setEnable("#edtDriving_Dist");
                $NC.setEnable("#edtFuel_Price");
                $NC.setEnable("#edtToll_Cost");
                $NC.setEnable("#edtRentcar_Cost", false);
                rowData.TOTAL_COST = getTotalCost();
            } else if (rowData.CARLOG_DIV == "2") {
                rowData.DISTANCE_QTY = 0;
                rowData.FUEL_PRICE = 0;
                rowData.TOLL_COST = 0;
                $NC.setValue("#edtDriving_Dist", rowData.DISTANCE_QTY);
                $NC.setValue("#edtFuel_Price", rowData.FUEL_PRICE);
                $NC.setValue("#edtToll_Cost", rowData.TOLL_COST);
                $NC.setEnable("#edtDriving_Dist", false);
                $NC.setEnable("#edtFuel_Price", false);
                $NC.setEnable("#edtToll_Cost", false);
                $NC.setEnable("#edtRentcar_Cost");
                rowData.FUEL_AMT = getFuelAmt();
                rowData.TOTAL_COST = getTotalCost();
            }
            break;
        case "DRIVING_DIST":
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
        case "DELIVERY_COST":
            rowData.DELIVERY_COST = args.val;
            rowData.TOTAL_COST = getTotalCost();
            break;
        case "RENTCAR_COST":
            rowData.RENTCAR_COST = args.val;
            rowData.TOTAL_COST = getTotalCost();
            break;
        case "TRANS_PLT":
            rowData.TRANS_PLT = args.val;
            break;
        case "TRANS_BOX":
            rowData.TRANS_BOX = args.val;
            break;
        case "TRANS_WEIGHT":
            rowData.TRANS_WEIGHT = args.val;
            break;
        case "TRANS_CBM":
            rowData.TRANS_CBM = args.val;
            break;
        case "TRANS_SUPPLY_AMT":
            rowData.TRANS_SUPPLY_AMT = args.val;
            break;
        case "TRANS_BSUPPLY_AMT":
            rowData.TRANS_BSUPPLY_AMT = args.val;
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);
}

function grdT1MasterOnNewRecord(args) {

    $NC.setFocus("#edtCar_Cd");
}

function grdT1DetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "TRANS_ROUTE",
        field: "TRANS_ROUTE",
        name: "운송루트",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PRIOR_DESTINATION_DIV_F",
        field: "PRIOR_DESTINATION_DIV_F",
        name: "이전도착지구분"
    });
    $NC.setGridColumn(columns, {
        id: "NEXT_DESTINATION_DIV_F",
        field: "NEXT_DESTINATION_DIV_F",
        name: "다음도착지구분"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "운송PLT",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "운송BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "운송중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "운송적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BSUPPLY_AMT",
        field: "TRANS_BSUPPLY_AMT",
        name: "운송기준단가금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PRIOR_DISTANCE_QTY",
        field: "PRIOR_DISTANCE_QTY",
        name: "이전운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "NEXT_DISTANCE_QTY",
        field: "NEXT_DISTANCE_QTY",
        name: "다음운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_QTY",
        field: "DISTANCE_QTY",
        name: "운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_YN",
        field: "DISTANCE_YN",
        name: "거리계산여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

    var options = {};

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "LDC04020E0.RS_T1_DETAIL",
        sortCol: [
            "TRANS_ROUTE",
            "RDELIVERY_CD"
        ],
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
}

function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 에디터 값 세팅
    setInputValue("#grdT1Detail", G_GRDT1DETAIL.data.getItem(row));

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function grdT1DetailOnCellChange(e, args) {

    var refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    var rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
    if ($NC.isNull(rowData) || $NC.isNull(refRowData)) {
        return;
    }

    if (rowData.DISTANCE_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.017", "거리계산 처리가 완료 되지 않았습니다. 처리 완료 후 변경하십시오."));
        return;
    }

    switch (args.col) {
        case "PRIOR_DESTINATION_DIV":
            var DISTANCE_QTY = refRowData.DISTANCE_QTY;
            if (rowData.PRIOR_DESTINATION_DIV == "1") {
                DISTANCE_QTY -= rowData.WORK_DIST;
            } else {
                DISTANCE_QTY += args.val == "1" ? rowData.WORK_DIST : 0;
            }
            rowData.PRIOR_DESTINATION_DIV = args.val;
            rowData.PRIOR_DESTINATION_DIV_F = $NC.getValueCombo(args.view, "F");
            rowData.PRIOR_DISTANCE_QTY = args.val == "1" ? rowData.WORK_DIST : 0;

            // 마스터 Row 데이터 업데이트
            refRowData.DISTANCE_QTY = $NC.getRoundVal(DISTANCE_QTY, 3);
            $NC.setValue("#edtDriving_Dist", refRowData.DISTANCE_QTY);
            refRowData.FUEL_AMT = getFuelAmt();
            refRowData.TOTAL_COST = getTotalCost();
            $NC.setGridApplyChange(G_GRDT1MASTER, refRowData);
            break;
        case "NEXT_DESTINATION_DIV":
            rowData.NEXT_DESTINATION_DIV = args.val;
            rowData.NEXT_DESTINATION_DIV_F = $NC.getValueCombo(args.view, "F");
            rowData.NEXT_DISTANCE_QTY = 0;
            rowData.DISTANCE_QTY = 0;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1DETAIL, rowData);
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
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
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운송자성명"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_BATCH",
        field: "DELIVERY_BATCH",
        name: "운송차수"
    });
    $NC.setGridColumn(columns, {
        id: "CARLOG_DIV_F",
        field: "CARLOG_DIV_F",
        name: "운행일지구분"
    });
    $NC.setGridColumn(columns, {
        id: "CALL_CNT",
        field: "CALL_CNT",
        name: "콜수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_QTY",
        field: "DISTANCE_QTY",
        name: "운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_RATE",
        field: "FUEL_RATE",
        name: "연비",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_PRICE",
        field: "FUEL_PRICE",
        name: "유류단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_AMT",
        field: "FUEL_AMT",
        name: "유류금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOLL_COST",
        field: "TOLL_COST",
        name: "도로비",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_COST",
        field: "DELIVERY_COST",
        name: "지입료",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RENTCAR_COST",
        field: "RENTCAR_COST",
        name: "용차비",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_COST",
        field: "TOTAL_COST",
        name: "총비용",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "운송PLT",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "운송BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "운송중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BSUPPLY_AMT",
        field: "TRANS_BSUPPLY_AMT",
        name: "운송기준단가금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LDC04020E0.RS_T2_MASTER",
        sortCol: [
            "OUTBOUND_DATE",
            "CAR_CD",
            "DELIVERY_BATCH"
        ],
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT2MASTER.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDT2DETAIL);
    G_GRDT2DETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_CAR_CD: rowData.CAR_CD,
        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH
    };
    // 데이터 조회
    $NC.serviceCall("/LDC04020E0/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

function grdT2DetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "TRANS_ROUTE",
        field: "TRANS_ROUTE",
        name: "운송루트",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PRIOR_DESTINATION_DIV_F",
        field: "PRIOR_DESTINATION_DIV_F",
        name: "이전도착지구분"
    });
    $NC.setGridColumn(columns, {
        id: "NEXT_DESTINATION_DIV_F",
        field: "NEXT_DESTINATION_DIV_F",
        name: "다음도착지구분"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "운송PLT"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "운송BOX"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "운송중량"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "운송적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BSUPPLY_AMT",
        field: "TRANS_BSUPPLY_AMT",
        name: "운송기준단가금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PRIOR_DISTANCE_QTY",
        field: "PRIOR_DISTANCE_QTY",
        name: "이전운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "NEXT_DISTANCE_QTY",
        field: "NEXT_DISTANCE_QTY",
        name: "다음운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_QTY",
        field: "DISTANCE_QTY",
        name: "운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailInitialize() {

    var options = {};

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Detail", {
        columns: grdT2DetailOnGetColumns(),
        queryId: "LDC04020E0.RS_T2_DETAIL",
        sortCol: "TRANS_ROUTE",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2DETAIL, row + 1);
}

function grdT3MasterOnGetColumns() {

    var columns = [];
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
        id: "DELIVERY_BATCH",
        field: "DELIVERY_BATCH",
        name: "운송차수"
    });
    $NC.setGridColumn(columns, {
        id: "CARLOG_DIV_F",
        field: "CARLOG_DIV_F",
        name: "운행일지구분"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_ROUTE",
        field: "TRANS_ROUTE",
        name: "운송루트",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PRIOR_DESTINATION_DIV_F",
        field: "PRIOR_DESTINATION_DIV_F",
        name: "이전도착지"
    });
    $NC.setGridColumn(columns, {
        id: "NEXT_DESTINATION_DIV_F",
        field: "NEXT_DESTINATION_DIV_F",
        name: "다음도착지"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "PRIOR_DISTANCE_QTY",
        field: "PRIOR_DISTANCE_QTY",
        name: "이전운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "NEXT_DISTANCE_QTY",
        field: "NEXT_DISTANCE_QTY",
        name: "다음운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_QTY",
        field: "DISTANCE_QTY",
        name: "운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_MSG",
        field: "ERROR_MSG",
        name: "오류메시지"
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_YN",
        field: "DISTANCE_YN",
        name: "거리계산여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_USER_ID",
        field: "DISTANCE_USER_ID",
        name: "거리계산사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_DATETIME",
        field: "DISTANCE_DATETIME",
        name: "거리계산일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3MasterInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT3Master", {
        columns: grdT3MasterOnGetColumns(),
        queryId: "LDC04020E0.RS_T3_MASTER",
        sortCol: "CAR_CD",
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
    if ($NC.setInitGridAfterOpen(G_GRDT1MASTER, [
        "CAR_CD",
        "DELIVERY_BATCH"
    ], true)) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnable("#dtpOutbound_Date", false);
        $NC.setEnable("#btnCar_Cd", false);
        $NC.setEnable("#edtCar_Cd", false);

        if ($NC.getValue("#cboCarlog_Div") == "1") {
            $NC.setEnable("#cboCarlog_Div");
            $NC.setEnable("#edtDriving_Dist");
            $NC.setEnable("#edtFuel_Price");
            $NC.setEnable("#edtToll_Cost");
            $NC.setEnable("#edtRentcar_Cost", false);
        } else if ($NC.getValue("#cboCarlog_Div") == "2") {
            $NC.setEnable("#cboCarlog_Div");
            $NC.setEnable("#edtDriving_Dist", false);
            $NC.setEnable("#edtFuel_Price", false);
            $NC.setEnable("#edtToll_Cost", false);
            $NC.setEnable("#edtRentcar_Cost");
        } else {
            $NC.setEnable("#cboCarlog_Div", false);
            $NC.setEnable("#edtDriving_Dist", false);
            $NC.setEnable("#edtFuel_Price", false);
            $NC.setEnable("#edtToll_Cost", false);
            $NC.setEnable("#edtRentcar_Cost");
        }
    } else {
        $NC.setEnableGroup("#divMasterInfoView", false);
        setInputValue("#grdT1Master");
    }
    setInputValue("#grdT1Detail");

    setTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL, "RDELIVERY_CD");
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);
}

/**
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetT2Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2DETAIL);
}

function onGetT3Master(ajaxData) {

    $NC.setInitGridData(G_GRDT3MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT3MASTER);

    setUserProgramPermission();
}

function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "CAR_CD",
            "DELIVERY_BATCH"
        ]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "RDELIVERY_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;

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

function onExecSP(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "CAR_CD",
            "DELIVERY_BATCH"
        ]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "RDELIVERY_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.clearGridData(G_GRDT2DETAIL);
    $NC.clearGridData(G_GRDT3MASTER);

    // 기본정보 컴퍼넌트 초기화.
    setInputValue("#grdT1Master");
    setInputValue("#grdT1Detail");
    // 에디터 Disable
    $NC.setEnableGroup("#divMasterInfoView", false);
    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
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

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = false;

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        enable = G_GRDT1MASTER.data.getLength() > 0;
        $NC.setEnable("#btnFuelPriceT", permission.canSave && enable);
        $NC.setEnable("#btnProcessNxt", permission.canSave);
        $NC.setEnable("#btnProcessPre", permission.canSave && enable);
    } else if ($NC.getTabActiveIndex("#divMasterView") == 2) {
        enable = G_GRDT3MASTER.data.getLength() > 0;
        $NC.setEnable("#btnErrorProcess", permission.canSave && enable);
    }
}

/**
 * 취소처리
 */
function onProcessPre() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.018", "조회 후 처리하십시오."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.005", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC04020E0.019", "취소 처리 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LDC04020E0/callLDProcessing.do", {
        P_PROCESS_DIV: $ND.C_DIRECTION_BW,
        P_CENTER_CD: CENTER_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
}

/**
 * 확정처리
 */
function onProcessNxt() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.005", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC04020E0.020", "확정 처리 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LDC04020E0/callLDProcessing.do", {
        P_PROCESS_DIV: $ND.C_DIRECTION_FW,
        P_CENTER_CD: CENTER_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
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

/**
 * 유류금액 계산
 */
function getFuelAmt() {

    var FUEL_RATE = $NC.getValue("#edtFuel_Rate");
    var FUEL_PRICE = $NC.getValue("#edtFuel_Price");
    var DISTANCE_QTY = $NC.getValue("#edtDriving_Dist");

    var FUEL_AMT = 0;
    if (FUEL_RATE != 0) {
        FUEL_AMT = $NC.getRoundVal((Number(DISTANCE_QTY) / Number(FUEL_RATE) * Number(FUEL_PRICE)), 0);
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
    var DELIVERY_COST = $NC.getValue("#edtDelivery_Cost");
    var RENTCAR_COST = $NC.getValue("#edtRentcar_Cost");

    var TOTAL_COST = Number(FUEL_AMT) + Number(TOLL_COST) + Number(DELIVERY_COST) + Number(RENTCAR_COST);
    $NC.setValue("#edtTotal_Cost", TOTAL_COST);
    return TOTAL_COST;
}

function btnFuelPriceTOnClick() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.018", "조회 후 처리하십시오."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LDC04021P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LDC04021P0.001", "유류단가 일괄적용"),
        url: "ld/LDC04021P0.html",
        width: 350,
        height: 250,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD
        },
        onOk: function() {
            _Inquiry();
        }
    });
}

function btnErrorProcessOnClick() {

    if (G_GRDT3MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT3MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.021", "처리할 데이터가 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC04020E0.005", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC04020E0.022", "오류내역 거리계산 재처리 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LDC04020E0/callLDErrorProcessing.do", {
        P_CENTER_CD: CENTER_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
}
