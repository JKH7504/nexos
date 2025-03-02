/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LIC01011P0
 *  프로그램명         : 입고예정등록 팝업
 *  프로그램설명       : 입고예정등록 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2016-12-14    ASETEC           신규작성
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
            container: "#divDetailView",
            grids: [
                "#grdDetail"
            ],
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        },
        // 마스터 데이터
        masterData: null
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnVendor_Cd").click(showVendorPopup); // 공급처 검색 버튼
    $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
    $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
    $("#btnEntrySave").click(_Save); // 저장 버튼

    $NC.setEnable("#edtCenter_Cd_F", false);
    $NC.setEnable("#edtBu_Cd", false);
    $NC.setEnable("#edtOrder_No", false);
    $NC.setEnable("#edtShipment_No", false);
    $NC.setEnable("#edtBu_Date", false);
    $NC.setEnable("#edtBu_No", false);

    $NC.setInitDatePicker("#dtpPlaned_DateTime"); // 도착예정일자
    $NC.setInitDatePicker("#dtpOrder_Date"); // 예정일자

    // 그리드 초기화
    grdDetailInitialize();

    // 신규/삭제/저장 버튼 툴팁 세팅
    $NC.setTooltip("#btnEntryNew", $NC.getDisplayMsg("JS.LIC01011P0.001", "신규"));
    $NC.setTooltip("#btnEntryDelete", $NC.getDisplayMsg("JS.LIC01011P0.002", "삭제"));
    $NC.setTooltip("#btnEntrySave", $NC.getDisplayMsg("JS.LIC01011P0.003", "저장"));

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    // 입고예정등록 전표생성 가능여부 N -> 입고예정등록시 신규, 수정 불가능
    if ($NC.G_VAR.G_PARAMETER.P_POLICY_LI110 != $ND.C_YES) {
        $NC.setEnable("#btnEntryNew", false);
        $NC.setEnable("#btnEntryDelete", false);
    }

    var planedDateEnabled = false; // 도착예정일 제어
    $NC.setValue("#chkPlaned_Date", $ND.C_NO); // 체크해제(체크해제시 도착예정일 항목은 비활성화)
    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);
    $NC.setValue("#edtCust_Cd", $NC.G_VAR.G_PARAMETER.P_CUST_CD);
    $NC.setValue("#dtpOrder_Date", $NC.G_VAR.G_PARAMETER.P_ORDER_DATE);

    // 신규 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER_CREATE) {

        var ORDER_DATE = $NC.getValue("#dtpOrder_Date");
        var PLANED_DATETIME = $NC.getValue("#dtpPlaned_DateTime");
        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            ORDER_DATE: ORDER_DATE,
            ORDER_NO: "",
            INOUT_CD: "",
            INBOUND_STATE: $ND.C_STATE_ORDER,
            CUST_CD: $NC.G_VAR.G_PARAMETER.P_CUST_CD,
            VENDOR_CD: "",
            IN_CAR_DIV: "",
            CAR_NO: "",
            PLANED_DATETIME: PLANED_DATETIME,
            PLANED_DATETIME_ORG: "",
            DIRECT_YN: "",
            SHIPMENT_NO: "",
            BU_DATE: "",
            BU_NO: "",
            DATA_DIV: "00",
            REMARK1: "",
            CRUD: $ND.C_DV_CRUD_C
        };

        $NC.setFocus("#edtVendor_Cd");

    }
    // 예정 -> 등록, 등록 수정
    else {
        // 마스터 데이터 세팅
        var dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
        $NC.setValue("#dtpOrder_Date", dsMaster.ORDER_DATE);
        $NC.setValue("#edtOrder_No", dsMaster.ORDER_NO);
        $NC.setValue("#edtVendor_Cd", dsMaster.VENDOR_CD);
        $NC.setValue("#edtVendor_Nm", dsMaster.VENDOR_NM);
        $NC.setValue("#cboIn_Car_Div", dsMaster.IN_CAR_DIV);
        $NC.setValue("#edtCar_No", dsMaster.CAR_NO);
        $NC.setValue("#edtShipment_No", dsMaster.SHIPMENT_NO);
        $NC.setValue("#edtBu_Date", dsMaster.BU_DATE);
        $NC.setValue("#edtBu_No", dsMaster.BU_NO);
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);

        // 도착예정일 편집
        if ($NC.isNotNull(dsMaster.PLANED_DATETIME)) {
            $NC.setValue("#chkPlaned_Date", $ND.C_YES);
            $NC.setValue("#dtpPlaned_DateTime", dsMaster.PLANED_DATETIME.substring(0, 10));
            var hh = dsMaster.PLANED_DATETIME.substring(11, 13);
            var mm = dsMaster.PLANED_DATETIME.substring(14, 16);
            hh = $NC.isNull(hh) ? 0 : hh;
            mm = $NC.isNull(mm) ? 0 : mm;
            var ampm = hh / 12 < 1 ? "0" : "12";
            $NC.setValue("#cboAmPm", ampm);
            $NC.setValue("#edtHours", hh - ampm);
            $NC.setValue("#edtMinutes", mm);
            planedDateEnabled = true;
        } else {
            $NC.setValue("#dtpPlaned_DateTime");
        }

        $NC.G_VAR.masterData = {
            CENTER_CD: dsMaster.CENTER_CD,
            BU_CD: dsMaster.BU_CD,
            ORDER_DATE: dsMaster.ORDER_DATE,
            ORDER_NO: dsMaster.ORDER_NO,
            INOUT_CD: dsMaster.INOUT_CD,
            INBOUND_STATE: $ND.C_STATE_ORDER,
            CUST_CD: dsMaster.CUST_CD,
            VENDOR_CD: dsMaster.VENDOR_CD,
            IN_CAR_DIV: dsMaster.IN_CAR_DIV,
            CAR_NO: dsMaster.CAR_NO,
            PLANED_DATETIME: dsMaster.PLANED_DATETIME,
            PLANED_DATETIME_ORG: dsMaster.PLANED_DATETIME,
            DIRECT_YN: dsMaster.DIRECT_YN,
            SHIPMENT_NO: dsMaster.SHIPMENT_NO,
            BU_DATE: dsMaster.BU_DATE,
            BU_NO: dsMaster.BU_NO,
            DATA_DIV: dsMaster.DATA_DIV,
            REMARK1: dsMaster.REMARK1,
            CRUD: $ND.C_DV_CRUD_R
        };

        // 디테일 데이터 세팅
        var dsDetail = $NC.G_VAR.G_PARAMETER.P_DETAIL_DS;
        var rowData, newRowData;
        G_GRDDETAIL.data.beginUpdate();
        try {
            for (var rIndex = 0, rCount = dsDetail.length; rIndex < rCount; rIndex++) {
                rowData = dsDetail[rIndex];
                if (Number(rowData.ORDER_QTY) < 1) {
                    continue;
                }
                newRowData = {
                    CENTER_CD: rowData.CENTER_CD,
                    BU_CD: rowData.BU_CD,
                    ORDER_DATE: rowData.ORDER_DATE,
                    ORDER_NO: rowData.ORDER_NO,
                    LINE_NO: rowData.LINE_NO,
                    INBOUND_STATE: $ND.C_STATE_ORDER,
                    BRAND_CD: rowData.BRAND_CD,
                    BRAND_NM: rowData.BRAND_NM,
                    ITEM_CD: rowData.ITEM_CD,
                    ITEM_BAR_CD: rowData.ITEM_BAR_CD,
                    ITEM_NM: rowData.ITEM_NM,
                    ITEM_SPEC: rowData.ITEM_SPEC,
                    ITEM_STATE: rowData.ITEM_STATE,
                    ITEM_STATE_F: rowData.ITEM_STATE_F,
                    FLOCATION_CD: rowData.FLOCATION_CD,
                    ITEM_LOT: rowData.ITEM_LOT,
                    QTY_IN_BOX: rowData.QTY_IN_BOX,
                    IN_UNIT_DIV_F: rowData.IN_UNIT_DIV_F,
                    LABELLING_DIV_D: rowData.LABELLING_DIV_D,
                    ORDER_QTY: rowData.ORDER_QTY,
                    ORDER_BOX: $NC.getBBox(rowData.ORDER_QTY, rowData.QTY_IN_BOX),
                    ORDER_EA: $NC.getBEa(rowData.ORDER_QTY, rowData.QTY_IN_BOX),
                    BOX_WEIGHT: rowData.BOX_WEIGHT,
                    ORDER_WEIGHT: rowData.ORDER_WEIGHT,
                    VALID_DATE: rowData.VALID_DATE,
                    BATCH_NO: rowData.BATCH_NO,
                    BUY_PRICE: rowData.BUY_PRICE,
                    APPLY_PRICE: rowData.APPLY_PRICE,
                    DC_PRICE: rowData.DC_PRICE,
                    BUY_AMT: rowData.BUY_AMT,
                    VAT_AMT: rowData.VAT_AMT,
                    DC_AMT: rowData.DC_AMT,
                    TOTAL_AMT: rowData.TOTAL_AMT,
                    ARRIVAL_DATE: rowData.ARRIVAL_DATE,
                    FLIGHT_NO: rowData.FLIGHT_NO,
                    BL_WEIGHT: rowData.BL_WEIGHT,
                    VAT_YN: rowData.VAT_YN,
                    DRUG_DIV_D: rowData.DRUG_DIV_D,
                    MEDICATION_DIV_D: rowData.MEDICATION_DIV_D,
                    KEEP_DIV_D: rowData.KEEP_DIV_D,
                    DRUG_CD: rowData.DRUG_CD,
                    BU_LINE_NO: rowData.BU_LINE_NO,
                    BU_KEY: rowData.BU_KEY,
                    REMARK1: rowData.REMARK1,
                    SPARE1_NOTE: rowData.SPARE1_NOTE,
                    SPARE2_NOTE: rowData.SPARE2_NOTE,
                    SPARE3_NOTE: rowData.SPARE3_NOTE,
                    SPARE4_NOTE: rowData.SPARE4_NOTE,
                    SPARE5_NOTE: rowData.SPARE5_NOTE,
                    SPARE6_NOTE: rowData.SPARE6_NOTE,
                    SPARE7_NOTE: rowData.SPARE7_NOTE,
                    SPARE8_NOTE: rowData.SPARE8_NOTE,
                    SPARE9_NOTE: rowData.SPARE9_NOTE,
                    id: $NC.getGridNewRowId(),
                    CRUD: $ND.C_DV_CRUD_R
                };
                G_GRDDETAIL.data.addItem(newRowData);
            }
        } finally {
            G_GRDDETAIL.data.endUpdate();
        }

        // 수정일 경우 입력불가 항목 비활성화 처리
        $NC.setEnable("#dtpOrder_Date", false);
        $NC.setEnable("#cboInout_Cd", false);
        $NC.setEnable("#edtVendor_Cd", false);
        $NC.setEnable("#btnVendor_Cd", false);
        /*
        if (dsMaster.INOUT_CD == "EB0" || dsMaster.INOUT_CD == "E51") {
            $NC.setEnable("#btnEntryNew", false);
            $NC.setEnable("#btnEntryDelete", false);
            $NC.setEnable("#btnEntrySave", false);
        }
        */
        // 입고예정 삭제 기준, 수기등록만 삭제 가능일 경우 신규, 수정 불가능
        if ($NC.G_VAR.masterData.DATA_DIV != "00" && $NC.G_VAR.G_PARAMETER.P_POLICY_LI113 == "1") {
            $NC.setEnable("#btnEntryNew", false);
            $NC.setEnable("#btnEntryDelete", false);
            $NC.setEnable("#btnEntrySave", false);
        }

        $NC.setGridSelectRow(G_GRDDETAIL, 0);
    }

    // 조회조건 - 입고구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: [
                $ND.C_INOUT_GRP_E1,
                $ND.C_INOUT_GRP_E2
            ].join($ND.C_SEP_DATA),
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        selectOption: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER_CREATE ? "F" : null,
        onComplete: function() {
            if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER_CREATE) {
                $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
            } else {
                $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
            }
        }
    });

    // 조회조건 - 입고차량구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "IN_CAR_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboIn_Car_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        selectOption: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER_CREATE ? "F" : null,
        addEmpty: true,
        onComplete: function() {
            if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER_CREATE) {
                $NC.G_VAR.masterData.IN_CAR_DIV = $NC.getValue("#cboIn_Car_Div");
            } else {
                $NC.setValue("#cboIn_Car_Div", $NC.G_VAR.masterData.IN_CAR_DIV);
            }
        }
    });

    $NC.setEnable("#cboAmPm", planedDateEnabled);
    $NC.setEnable("#edtHours", planedDateEnabled);
    $NC.setEnable("#edtMinutes", planedDateEnabled);
    $NC.setEnable("#dtpPlaned_DateTime", planedDateEnabled);
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
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_OK);
    $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    masterDataOnChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

    var VENDOR_CD = $NC.getValue("#edtVendor_Cd");
    if ($NC.isNull(VENDOR_CD)) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.004", "먼저 공급처 코드를 입력하십시오."));
        $NC.setFocus("#edtVendor_Cd");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        BU_CD: $NC.G_VAR.masterData.BU_CD,
        ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
        ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
        LINE_NO: "",
        INBOUND_STATE: $NC.G_VAR.masterData.INBOUND_STATE,
        BRAND_CD: "",
        BRAND_NM: "",
        ITEM_CD: "",
        ITEM_BAR_CD: "",
        ITEM_NM: "",
        ITEM_STATE: $ND.C_BASE_ITEM_STATE,
        ITEM_STATE_F: $NC.getGridComboName(G_GRDDETAIL, {
            columnId: "ITEM_STATE_F",
            searchVal: $ND.C_BASE_ITEM_STATE,
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        }),
        ITEM_LOT: $ND.C_BASE_ITEM_LOT,
        QTY_IN_BOX: 1,
        ORDER_QTY: 0,
        ORDER_BOX: 0,
        ORDER_EA: 0,
        ENTRY_QTY: 0,
        BOX_WEIGHT: 0,
        ORDER_WEIGHT: 0,
        VALID_DATE: "",
        BATCH_NO: "",
        BUY_PRICE: 0,
        DC_PRICE: 0,
        APPLY_PRICE: 0,
        BUY_AMT: 0,
        VAT_AMT: 0,
        DC_AMT: 0,
        TOTAL_AMT: 0,
        ARRIVAL_DATE: "",
        FLIGHT_NO: "",
        BL_WEIGHT: 0,
        VAT_YN: $ND.C_NO,
        BU_LINE_NO: "",
        BU_KEY: "",
        REMARK1: "",
        SPARE1_NOTE: "",
        SPARE2_NOTE: "",
        SPARE3_NOTE: "",
        SPARE4_NOTE: "",
        SPARE5_NOTE: "",
        SPARE6_NOTE: "",
        SPARE7_NOTE: "",
        SPARE8_NOTE: "",
        SPARE9_NOTE: "",
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDDETAIL, newRowData);
}

/**
 * 저장
 */
function _Save() {

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.006", "물류센터가 지정되어 있지 않습니다. 다시 작업하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.007", "사업부가 지정되어 있지 않습니다. 다시 작업하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.ORDER_DATE)) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.008", "먼저 예정일자를 입력하십시오."));
        $NC.setFocus("#dtpOrder_Date");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.VENDOR_CD)) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.004", "먼저 공급처 코드를 입력하십시오."));
        $NC.setFocus("#edtVendor_Cd");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.009", "먼저 입고구분을 선택하십시오."));
        $NC.setFocus("#cboInout_Cd");
        return;
    }

    if (Number($NC.getValue("#edtHours")) < 0 || Number($NC.getValue("#edtHours")) > 12) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.010", "도착예정일의 시간은 0~11의 숫자를 입력하십시오."));
        $NC.setFocus("#edtHours");
        return;
    }

    if (Number($NC.getValue("#edtMinutes")) < 0 || Number($NC.getValue("#edtMinutes")) > 59) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.011", "도착예정일의 분은 0~59의 숫자를 입력하십시오."));
        $NC.setFocus("#edtMinutes");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.005", "저장할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LIC01011P0.012", "저장하시겠습니까?"))) {
        return;
    }

    var dsD = [];
    var dsCU = [];
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var dsTarget = G_GRDDETAIL.data.getItems();
    var dsDetail, rowData;
    for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsDetail = dsD;
        } else {
            dsDetail = dsCU;
        }
        dsDetail.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_INBOUND_STATE: rowData.INBOUND_STATE,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: rowData.ITEM_LOT,
            P_QTY_IN_BOX: rowData.QTY_IN_BOX,
            P_ORDER_QTY: rowData.ORDER_QTY,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_VALID_DATE: rowData.VALID_DATE,
            P_BATCH_NO: rowData.BATCH_NO,
            P_BUY_PRICE: rowData.BUY_PRICE,
            P_DC_PRICE: rowData.DC_PRICE,
            P_APPLY_PRICE: rowData.APPLY_PRICE,
            P_BUY_AMT: rowData.BUY_AMT,
            P_VAT_YN: rowData.VAT_YN,
            P_VAT_AMT: rowData.VAT_AMT,
            P_DC_AMT: rowData.DC_AMT,
            P_TOTAL_AMT: rowData.TOTAL_AMT,
            P_ARRIVAL_DATE: rowData.ARRIVAL_DATE,
            P_FLIGHT_NO: rowData.FLIGHT_NO,
            P_BL_WEIGHT: rowData.BL_WEIGHT,
            P_BU_LINE_NO: rowData.BU_LINE_NO,
            P_BU_KEY: rowData.BU_KEY,
            P_REMARK1: rowData.REMARK1,
            P_SPARE1_NOTE: rowData.SPARE1_NOTE,
            P_SPARE2_NOTE: rowData.SPARE2_NOTE,
            P_SPARE3_NOTE: rowData.SPARE3_NOTE,
            P_SPARE4_NOTE: rowData.SPARE4_NOTE,
            P_SPARE5_NOTE: rowData.SPARE5_NOTE,
            P_SPARE6_NOTE: rowData.SPARE6_NOTE,
            P_SPARE7_NOTE: rowData.SPARE7_NOTE,
            P_SPARE8_NOTE: rowData.SPARE8_NOTE,
            P_SPARE9_NOTE: rowData.SPARE9_NOTE,
            P_CRUD: rowData.CRUD
        });
    }
    dsDetail = dsD.concat(dsCU);
    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R && dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.013", "수정 후 저장하십시오."));
        return;
    }

    var PLANED_DATETIME = $NC.G_VAR.masterData.PLANED_DATETIME;
    if ($NC.getValue("#chkPlaned_Date") != $ND.C_YES) {
        PLANED_DATETIME = $NC.G_VAR.masterData.PLANED_DATETIME_ORG;
    }

    $NC.serviceCall("/LIC01010E0/save.do", {
        P_DS_MASTER: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
            P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
            P_INBOUND_STATE: $NC.G_VAR.masterData.INBOUND_STATE,
            P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
            P_VENDOR_CD: $NC.G_VAR.masterData.VENDOR_CD,
            P_IN_CAR_DIV: $NC.G_VAR.masterData.IN_CAR_DIV,
            P_CAR_NO: $NC.G_VAR.masterData.CAR_NO,
            P_PLANED_DATETIME: PLANED_DATETIME,
            P_DIRECT_YN: $NC.G_VAR.masterData.DIRECT_YN,
            P_SHPMENT_NO: $NC.G_VAR.masterData.SHIPMENT_NO,
            P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
            P_BU_NO: $NC.G_VAR.masterData.BU_NO,
            P_DATA_DIV: $NC.G_VAR.masterData.DATA_DIV,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_CRUD: $NC.G_VAR.masterData.CRUD
        },
        P_DS_DETAIL: dsDetail,
        P_PROCESS_CD: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.LIC01011P0.014", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제, 그외 CRUD를 "D"로 변경
    $NC.deleteGridRowData(G_GRDDETAIL, rowData, true);
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

    switch (args.col) {
        case "INOUT_CD":
            $NC.G_VAR.masterData.INOUT_CD = args.val;
            if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER_CREATE) {
                if ($NC.G_VAR.masterData.INOUT_CD == "E20") {
                    alert($NC.getDisplayMsg("JS.LIC01011P0.015", "수송입고는 신규등록 할 수 없습니다."));
                    $NC.G_VAR.masterData.INOUT_CD = "E10";
                    $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
                }
            }
            break;
        case "ORDER_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LIC01011P0.016", "예정일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.ORDER_DATE = $NC.getValue(args.view);
            break;
        case "SHIPMENT_NO":
            $NC.G_VAR.masterData.SHIPMENT_NO = args.val;
            break;
        case "BU_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LIC01011P0.017", "전표일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.BU_DATE = args.val;
            break;
        case "VENDOR_CD":
            $NP.onVendorChange(args.val, {
                P_CUST_CD: $NC.getValue("#edtCust_Cd"),
                P_VENDOR_CD: args.val,
                P_VIEW_DIV: "2"
            }, onVendorPopup);
            return;
        case "PLANED_DATE":
            var isEnabled = args.val == $ND.C_YES;
            $NC.setEnable("#cboAmPm", isEnabled);
            $NC.setEnable("#edtHours", isEnabled);
            $NC.setEnable("#edtMinutes", isEnabled);
            $NC.setEnable("#dtpPlaned_DateTime", isEnabled);
            break;
        case "PLANED_DATETIME":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LIC01011P0.018", "도착예정일을 정확히 입력하십시오."));
            setPlanedDatetime();
            break;
        case "AMPM":
        case "HOURS":
        case "MINUTES":
            setPlanedDatetime();
            break;
        case "IN_CAR_DIV":
            $NC.G_VAR.masterData.IN_CAR_DIV = args.val;
            break;
        case "CAR_NO":
            $NC.G_VAR.masterData.CAR_NO = args.val;
            break;
        case "REMARK1":
            $NC.G_VAR.masterData.REMARK1 = args.val;
            break;
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
}

/**
 * 도착예정일 설정
 */
function setPlanedDatetime() {

    var date = $NC.getValue("#dtpPlaned_DateTime");
    if ($NC.isNull(date)) {
        $NC.G_VAR.masterData.PLANED_DATETIME = "";
    } else {
        var hh = Number($NC.getValue("#cboAmPm")) + Number($NC.getValue("#edtHours")) + "";
        var mm = $NC.getValue("#edtMinutes");
        hh = hh.length == 1 ? "0" + hh : hh;
        mm = mm.length == 1 ? "0" + mm : mm;
        $NC.G_VAR.masterData.PLANED_DATETIME = date + " " + hh + ":" + mm + ":00";
    }
}

function grdDetailOnGetColumns() {

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
        name: "상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdDetailOnPopup,
            isKeyField: true
        }
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
        cssClass: "styCenter",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "ITEM_STATE",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "ITEM_STATE",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "FLOCATION_CD",
        field: "FLOCATION_CD",
        name: "고정로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
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
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
        name: "예정EA",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ARRIVAL_DATE",
        field: "ARRIVAL_DATE",
        name: "입항일자",
        cssClass: "styCenter",
        editor: Slick.Editors.Date
    });
    $NC.setGridColumn(columns, {
        id: "FLIGHT_NO",
        field: "FLIGHT_NO",
        name: "편기번호",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "BL_WEIGHT",
        field: "BL_WEIGHT",
        name: "BL중량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    // 정책에 따른 컬럼 표시
    if ($NC.G_VAR.G_PARAMETER.P_POLICY_LS210 == "2") {
        $NC.setGridColumn(columns, {
            id: "VALID_DATE",
            field: "VALID_DATE",
            name: "유통기한",
            cssClass: "styCenter",
            editor: Slick.Editors.Date
        });
        $NC.setGridColumn(columns, {
            id: "BATCH_NO",
            field: "BATCH_NO",
            name: "제조배치번호",
            editor: Slick.Editors.Text
        });
    }
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
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
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
        id: "BUY_AMT",
        field: "BUY_AMT",
        name: "매입금액",
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
        id: "LABELLING_DIV_D",
        field: "LABELLING_DIV_D",
        name: "라벨링구분"
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
    $NC.setGridColumn(columns, {
        id: "BU_KEY",
        field: "BU_KEY",
        name: "전표키"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: null,
        sortCol: "LINE_NO",
        gridOptions: options,
        canExportExcel: false,
        onFilter: grdDetailOnFilter
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);

}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "ITEM_CD", true);
}

/**
 * 그리드에 입고예정등록 전표 생성 가능여부가 N일경우 편집 불가로 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

    // 입고예정등록 전표생성 가능여부 N -> 입고예정등록시 신규, 수정 불가능
    if ($NC.G_VAR.G_PARAMETER.P_POLICY_LI110 != $ND.C_YES) {
        return false;
    }

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    var isNew = rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD == $ND.C_DV_CRUD_C;
    switch (args.column.id) {
        case "ITEM_CD":
            return isNew;
        case "ITEM_STATE_F":
        case "ITEM_LOT":
        case "ORDER_QTY":
        case "ORDER_BOX":
        case "ORDER_EA":
        case "VALID_DATE":
        case "BATCH_NO":
        case "ARRIVAL_DATE":
        case "FLIGHT_NO":
        case "BL_WEIGHT":
            if (!isNew) {
                return $NC.G_VAR.masterData.INOUT_CD != "E20";
            }
            break;
    }
    return true;
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

    var rowData = args.item;
    var columnId = G_GRDDETAIL.view.getColumnId(args.cell);

    switch (G_GRDDETAIL.view.getColumnId(args.cell)) {
        case "ITEM_CD":
            $NP.onItemChange(rowData.ITEM_CD, {
                P_BU_CD: rowData.BU_CD,
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: rowData.ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemPopup);
            return;
        case "ITEM_STATE_F":
            if ($NC.G_VAR.masterData.INOUT_CD == "E10") {
                if (rowData.ITEM_STATE == "B") {
                    alert($NC.getDisplayMsg("JS.LIC01011P0.019", "정상입고는 상품상태를 [" + rowData.ITEM_STATE_F + "]으로 수정할 수 없습니다.", rowData.ITEM_STATE_F));
                    // 이전 데이터로 복원
                    rowData.ITEM_STATE = args.oldItem.ITEM_STATE;
                    rowData.ITEM_STATE_F = args.oldItem.ITEM_STATE_F;
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                }
            }
            break;
        case "ITEM_LOT":
            if (rowData.LOT_NO_REQ_YN == $ND.C_YES && ($NC.isNull(rowData.ITEM_LOT) || rowData.ITEM_LOT == $ND.C_BASE_ITEM_LOT)) {
                alert($NC.getDisplayMsg("JS.LIC01011P0.030", "LOT번호필수대상 상품입니다. LOT번호를 입력하십시오."));
                rowData.ITEM_LOT = args.oldItem.ITEM_LOT;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            break;
        case "ORDER_QTY":
            if (Number(rowData.ORDER_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.LIC01011P0.020", "예정수량은 1보다 작을 수 없습니다."));
                rowData.ORDER_QTY = args.oldItem.ORDER_QTY;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            rowData = grdDetailOnCalc(rowData);
            break;
        case "ORDER_BOX":
            if (Number(rowData.ORDER_BOX) < 0) {
                alert($NC.getDisplayMsg("JS.LIC01011P0.021", "예정BOX는 0보다 작을 수 없습니다."));
                rowData.ORDER_BOX = args.oldItem.ORDER_BOX;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            rowData = grdDetailOnCalc(rowData, undefined, columnId);
            // 예정수량이 1보다 작은 수량 등록 불가능
            if (Number(rowData.ORDER_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.LIC01011P0.020", "예정수량은 1보다 작을 수 없습니다."));
                rowData.ORDER_QTY = args.oldItem.ORDER_QTY;
                rowData.ORDER_BOX = args.oldItem.ORDER_BOX;
                rowData.ORDER_EA = args.oldItem.ORDER_EA;
                rowData = grdDetailOnCalc(rowData);
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            break;
        case "ORDER_EA":
            if (Number(rowData.ORDER_EA) < 0) {
                alert($NC.getDisplayMsg("JS.LIC01011P0.022", "예정EA는 0보다 작을 수 없습니다."));
                rowData.ORDER_EA = args.oldItem.ORDER_EA;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            rowData = grdDetailOnCalc(rowData, undefined, columnId);
            // 예정수량이 1보다 작은 수량 등록 불가능
            if (Number(rowData.ORDER_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.LIC01011P0.020", "예정수량은 1보다 작을 수 없습니다."));
                rowData.ORDER_QTY = args.oldItem.ORDER_QTY;
                rowData.ORDER_BOX = args.oldItem.ORDER_BOX;
                rowData.ORDER_EA = args.oldItem.ORDER_EA;
                rowData = grdDetailOnCalc(rowData);
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(rowData.VALID_DATE)) {
                if (!$NC.isDate(rowData.VALID_DATE)) {
                    alert($NC.getDisplayMsg("JS.LIC01011P0.023", "유통기한을 정확히 입력하십시오."));
                    rowData.VALID_DATE = "";
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                } else {
                    rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
                }
            }
            break;
        case "ARRIVAL_DATE":
            if ($NC.isNotNull(rowData.ARRIVAL_DATE)) {
                if (!$NC.isDate(rowData.ARRIVAL_DATE)) {
                    alert($NC.getDisplayMsg("JS.LIC01011P0.XXX", "입항일자을 정확히 입력하십시오."));
                    rowData.ARRIVAL_DATE = "";
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                } else {
                    rowData.ARRIVAL_DATE = $NC.getDate(rowData.ARRIVAL_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ITEM_CD) || $NC.isNull(rowData.ITEM_NM)) {
            alert($NC.getDisplayMsg("JS.LIC01011P0.024", "상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_STATE)) {
            alert($NC.getDisplayMsg("JS.LIC01011P0.025", "상태를 선택하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_STATE_F", true);
            return false;
        } else {
            if ($NC.G_VAR.masterData.INOUT_CD == "E10") {
                if (rowData.ITEM_STATE == "B") {
                    alert($NC.getDisplayMsg("JS.LIC01011P0.026", "정상입고는 상품상태를 [" + rowData.ITEM_STATE_F + "]으로 저장할 수 없습니다.", rowData.ITEM_STATE_F));
                    $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_STATE_F", true);
                    return false;
                }
            }
        }
        if (rowData.LOT_NO_REQ_YN == $ND.C_YES && ($NC.isNull(rowData.ITEM_LOT) || rowData.ITEM_LOT == $ND.C_BASE_ITEM_LOT)) {
            alert($NC.getDisplayMsg("JS.LIC01011P0.030", "LOT번호필수대상 상품입니다. LOT번호를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_LOT", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_LOT)) {
            alert($NC.getDisplayMsg("JS.LIC01011P0.027", "LOT번호를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_LOT", true);
            return false;
        }
        if ($NC.isNull(rowData.ORDER_QTY)) {
            alert($NC.getDisplayMsg("JS.LIC01011P0.028", "예정수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ORDER_QTY", true);
            return false;
        }
        if (rowData.ORDER_QTY < 1) {
            alert($NC.getDisplayMsg("JS.LIC01011P0.029", "예정수량은 1보다 작을 수 없습니다."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ORDER_QTY", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 그리드의 상품 팝업 처리
 */
function grdDetailOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "ITEM_CD":
            $NP.showItemPopup({
                P_BU_CD: rowData.BU_CD,
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: $ND.C_ALL,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemPopup, function() {
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true, true);
            });
            return;
    }
}

function grdDetailOnCalc(rowData, orderQty, changedColumnId) {

    if ($NC.isNotNull(orderQty)) {
        rowData.ORDER_QTY = Number(orderQty);
    }

    switch (changedColumnId) {
        case "ORDER_BOX":
        case "ORDER_EA":
            rowData.ORDER_QTY = $NC.getBQty(rowData.ORDER_BOX, rowData.ORDER_EA, rowData.QTY_IN_BOX);
            break;
    }

    rowData.ORDER_BOX = $NC.getBBox(rowData.ORDER_QTY, rowData.QTY_IN_BOX);
    rowData.ORDER_EA = $NC.getBEa(rowData.ORDER_QTY, rowData.QTY_IN_BOX);
    rowData.ORDER_WEIGHT = $NC.getWeight(rowData.ORDER_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

    var calcParams = {
        ITEM_PRICE: rowData.BUY_PRICE,// 매입단가 또는 공급단가
        APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
        ITEM_QTY: rowData.ORDER_QTY,// 상품수량
        ITEM_AMT: rowData.BUY_AMT,// 매입금액 또는 공급금액
        VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
        VAT_AMT: rowData.VAT_AMT,// 부가세
        DC_AMT: rowData.DC_AMT,// 할인금액
        TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
        POLICY_VAL: $NC.G_VAR.G_PARAMETER.P_POLICY_LI190
    };

    rowData.BUY_AMT = $NC.getItemAmt(calcParams);
    rowData.VAT_AMT = $NC.getVatAmt(calcParams);
    rowData.TOTAL_AMT = $NC.getTotalAmt(calcParams);
    return rowData;
}

function showVendorPopup() {

    var CUST_CD = $NC.getValue("#edtCust_Cd");

    $NP.showVendorPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_VENDOR_CD: $ND.C_ALL,
            P_VIEW_DIV: "1"
        }
    }, onVendorPopup, function() {
        $NC.setFocus("#edtVendor_Cd", true);
    });
}

function onVendorPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.G_VAR.masterData.VENDOR_CD = resultInfo.VENDOR_CD;
        $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
        $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);
        $NC.setFocus("#chkPlaned_Date", true);
    } else {
        $NC.G_VAR.masterData.VENDOR_CD = "";
        $NC.setValue("#edtVendor_Cd");
        $NC.setValue("#edtVendor_Nm");
        $NC.setFocus("#edtVendor_Cd", true);
    }
    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
}

/**
 * 그리드에서 상품 선택/취소했을 경우 처리
 * 
 * @param resultInfo
 */
function onItemPopup(resultInfo) {

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_BAR_CD = resultInfo.ITEM_BAR_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
        rowData.BRAND_CD = resultInfo.BRAND_CD;
        rowData.BRAND_NM = resultInfo.BRAND_NM;
        rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
        rowData.IN_UNIT_DIV_F = resultInfo.IN_UNIT_DIV_F;
        rowData.LABELLING_DIV_D = resultInfo.LABELLING_DIV_D;
        rowData.ORDER_QTY = 0;
        rowData.ORDER_BOX = 0;
        rowData.ORDER_EA = 0;
        rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
        rowData.ORDER_WEIGHT = 0;
        rowData.BUY_PRICE = resultInfo.BUY_PRICE;
        rowData.DC_PRICE = 0;
        rowData.APPLY_PRICE = 0;
        if ($NC.G_VAR.G_PARAMETER.P_POLICY_LI190 == "2") { // 매입금액 계산정책
            rowData.APPLY_PRICE = resultInfo.BUY_PRICE;
        }
        rowData.BUY_AMT = 0;
        rowData.VAT_AMT = 0;
        rowData.DC_AMT = 0;
        rowData.TOTAL_AMT = 0;
        rowData.VAT_YN = resultInfo.VAT_YN;
        rowData.LOT_NO_REQ_YN = resultInfo.LOT_NO_REQ_YN;
        rowData.DRUG_DIV_D = resultInfo.DRUG_DIV_D;
        rowData.MEDICATION_DIV_D = resultInfo.MEDICATION_DIV_D;
        rowData.KEEP_DIV_D = resultInfo.KEEP_DIV_D;
        rowData.DRUG_CD = resultInfo.DRUG_CD;
        rowData = grdDetailOnCalc(rowData);

        if (resultInfo.LOT_NO_REQ_YN == $ND.C_YES) {
            focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_LOT");
        } else {
            focusCol = G_GRDDETAIL.view.getColumnIndex("ORDER_QTY");
        }
    } else {
        rowData.ITEM_CD = "";
        rowData.ITEM_BAR_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";
        rowData.BRAND_CD = "";
        rowData.BRAND_NM = "";
        rowData.QTY_IN_BOX = 1;
        rowData.IN_UNIT_DIV_F = "";
        rowData.LABELLING_DIV_D = "";
        rowData.ORDER_QTY = 0;
        rowData.ORDER_BOX = 0;
        rowData.ORDER_EA = 0;
        rowData.BOX_WEIGHT = 0;
        rowData.ORDER_WEIGHT = 0;
        rowData.BUY_PRICE = 0;
        rowData.DC_PRICE = 0;
        rowData.APPLY_PRICE = 0;
        rowData.BUY_AMT = 0;
        rowData.VAT_AMT = 0;
        rowData.DC_AMT = 0;
        rowData.TOTAL_AMT = 0;
        rowData.VAT_YN = $ND.C_NO;
        rowData.LOT_NO_REQ_YN = $ND.C_NO;
        rowData.DRUG_DIV_D = "";
        rowData.MEDICATION_DIV_D = "";
        rowData.KEEP_DIV_D = "";
        rowData.DRUG_CD = "";

        focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);

    $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}
