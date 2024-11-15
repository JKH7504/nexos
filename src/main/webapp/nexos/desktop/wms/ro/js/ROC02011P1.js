/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : ROC02011P1
 *  프로그램명         : 반출등록 팝업
 *  프로그램설명       : 반출등록 팝업 화면 Javascript
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
        // 예정이 존재하는 데이터인지...
        ORDER_YN: $ND.C_NO,
        // 마스터 데이터
        masterData: null
    });

    // ================================================================================================================
    // $NC.G_VAR.G_PARAMETER.P_PROCESS_CD
    // N: 신규 등록
    // BP: 등록 수정
    // A : 예정으로 등록
    // ================================================================================================================

    // 현재고 검색 조건.상품상태 콤보 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_STATE",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "1",
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_State",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQItem_State", "X");
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnVendor_Cd").click(showVendorPopup); // 공급처 검색 버튼
    $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
    $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
    $("#btnEntrySave").click(_Save); // 저장 버튼
    $("#btnStockPopup").click(showStockOverlay);// 재고에서 선택버튼 클릭
    $("#btnStockAddItem").click(btnStockAddItemOnClick); // 재고팝업에서 확인버튼클릭
    $("#btnStockInquiry").click(_Inquiry); // 재고팝업에서 조회버튼클릭
    $("#btnStockOverlayClose").click(function() { // 재고에서 선택 창 닫기
        $("#divStockOverlay").hide();
    });
    $("#btnOutwaitOverlayClose").click(function() { // 출고대기에서 창 닫기
        $("#divOutwaitOverlay").hide();
    });

    $("#btnQBrand_Cd").click(showBuBrandStockPopup); // 브랜드검색 버튼 클릭
    $("#btnQItem_Cd").click(showItemStockPopup); // 상품검색 버튼 클릭
    $("#btnLocation").click(showLocationPopup); // 로케이션 검색 버튼 클릭

    $NC.setEnable("#edtCenter_Cd_F", false);
    $NC.setEnable("#edtBu_Cd", false);
    $NC.setEnable("#edtOrder_No", false);
    $NC.setEnable("#edtBu_Date", false);
    $NC.setEnable("#edtBu_No", false);

    $NC.setInitDatePicker("#dtpOutbound_Date");
    $("#btnOutwaitPopup").click(showOutwaitOverlay); // 출고대기량 조회 버튼 클릭

    // 그리드 초기화
    grdDetailInitialize();
    grdOutwaitInitialize();
    grdStockInitialize();

    // 신규/삭제/저장 버튼 툴팁 세팅
    $NC.setTooltip("#btnEntryNew", $NC.getDisplayMsg("JS.ROC02011P1.001", "신규"));
    $NC.setTooltip("#btnEntryDelete", $NC.getDisplayMsg("JS.ROC02011P1.002", "삭제"));
    $NC.setTooltip("#btnEntrySave", $NC.getDisplayMsg("JS.ROC02011P1.003", "저장"));
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);
    $NC.setValue("#edtCust_Cd", $NC.G_VAR.G_PARAMETER.P_CUST_CD);

    var OUTBOUND_DATE;
    // 신규 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {

        OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
        // var INOUT_CD = $NC.getValue("#cboInout_Cd");
        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            OUTBOUND_DATE: OUTBOUND_DATE,
            OUTBOUND_NO: "",
            INOUT_CD: "", // INOUT_CD,
            OUTBOUND_STATE: $ND.C_STATE_ENTRY,
            CUST_CD: $NC.G_VAR.G_PARAMETER.P_CUST_CD,
            VENDOR_CD: "",
            CAR_NO: "",
            ORDER_DATE: "",
            ORDER_NO: "",
            PLANED_DATETIME: "",
            DATA_DIV: "00",
            REMARK1: "",
            CRUD: $ND.C_DV_CRUD_C
        };

        $NC.setFocus("#edtVendor_Cd");

    }
    // 예정 -> 등록, 등록 수정
    else {
        // 마스터 데이터 세팅
        var OUTBOUND_NO;
        var OUTBOUND_STATE;
        var CRUD;
        var dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
        if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
            OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
            OUTBOUND_NO = "";
            OUTBOUND_STATE = $ND.C_STATE_ENTRY;
            CRUD = $ND.C_DV_CRUD_C;
        } else {
            OUTBOUND_DATE = dsMaster.OUTBOUND_DATE;
            OUTBOUND_NO = dsMaster.OUTBOUND_NO;
            OUTBOUND_STATE = null;// dsMaster.OUTBOUND_STATE;
            CRUD = $ND.C_DV_CRUD_R;
            $NC.setValue("#dtpOutbound_Date", OUTBOUND_DATE);
            $NC.setValue("#edtOutbound_No", OUTBOUND_NO);
        }
        $NC.setValue("#edtOrder_Date", dsMaster.ORDER_DATE);
        $NC.setValue("#edtOrder_No", dsMaster.ORDER_NO);
        $NC.setValue("#edtVendor_Cd", dsMaster.VENDOR_CD);
        $NC.setValue("#edtVendor_Nm", dsMaster.VENDOR_NM);
        $NC.setValue("#edtCar_No", dsMaster.CAR_NO);
        $NC.setValue("#edtBu_Date", dsMaster.BU_DATE);
        $NC.setValue("#edtBu_No", dsMaster.BU_NO);
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);

        $NC.G_VAR.masterData = {
            CENTER_CD: dsMaster.CENTER_CD,
            BU_CD: dsMaster.BU_CD,
            OUTBOUND_DATE: OUTBOUND_DATE,
            OUTBOUND_NO: OUTBOUND_NO,
            INOUT_CD: dsMaster.INOUT_CD,
            OUTBOUND_STATE: OUTBOUND_STATE,
            CUST_CD: dsMaster.CUST_CD,
            VENDOR_CD: dsMaster.VENDOR_CD,
            CAR_NO: dsMaster.CAR_NO,
            ORDER_DATE: dsMaster.ORDER_DATE,
            ORDER_NO: dsMaster.ORDER_NO,
            PLANED_DATETIME: dsMaster.PLANED_DATETIME,
            DATA_DIV: dsMaster.DATA_DIV,
            REMARK1: dsMaster.REMARK1,
            CRUD: CRUD
        };

        // 디테일 데이터 세팅
        var dsDetail = $NC.G_VAR.G_PARAMETER.P_DETAIL_DS;
        var rowData, rIndex, rCount, newRowData, ORDER_QTY;
        G_GRDDETAIL.data.beginUpdate();
        try {
            for (rIndex = 0, rCount = dsDetail.length; rIndex < rCount; rIndex++) {
                rowData = $.extend({}, dsDetail[rIndex]);

                ORDER_QTY = Number(rowData.ORDER_QTY);
                // 예정과 등록에 맞게 rowData 수정
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) { // 예정
                    // 예정수량이 1보다 작은 데이터는 제외
                    if (ORDER_QTY < 1) {
                        continue;
                    }
                    rowData.OUTBOUND_DATE = OUTBOUND_DATE;
                    rowData.OUTBOUND_NO = OUTBOUND_NO;
                    rowData.OUTBOUND_STATE = $ND.C_STATE_ENTRY;
                    rowData.LINE_NO = "";
                    rowData.ENTRY_QTY = ORDER_QTY;
                    rowData.OLD_ENTRY_QTY = 0;
                    rowData.ENTRY_BOX = $NC.getBBox(ORDER_QTY, rowData.QTY_IN_BOX);
                    rowData.ENTRY_EA = $NC.getBEa(ORDER_QTY, rowData.QTY_IN_BOX);
                    rowData.ENTRY_WEIGHT = $NC.getWeight(ORDER_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
                    rowData.CONFIRM_QTY = ORDER_QTY;
                }
                // 등록
                else {
                    rowData.OUTBOUND_STATE = null;
                }

                newRowData = {
                    CENTER_CD: rowData.CENTER_CD,
                    BU_CD: rowData.BU_CD,
                    OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                    OUTBOUND_NO: rowData.OUTBOUND_NO,
                    LINE_NO: rowData.LINE_NO,
                    OUTBOUND_STATE: rowData.OUTBOUND_STATE,
                    BRAND_CD: rowData.BRAND_CD,
                    BRAND_NM: rowData.BRAND_NM,
                    ITEM_CD: rowData.ITEM_CD,
                    ITEM_NM: rowData.ITEM_NM,
                    ITEM_SPEC: rowData.ITEM_SPEC,
                    ITEM_STATE: rowData.ITEM_STATE,
                    ITEM_STATE_F: rowData.ITEM_STATE_F,
                    ITEM_LOT: rowData.ITEM_LOT,
                    QTY_IN_BOX: rowData.QTY_IN_BOX,
                    ORDER_QTY: rowData.ORDER_QTY,
                    ENTRY_QTY: rowData.ENTRY_QTY,
                    OLD_ENTRY_QTY: rowData.ENTRY_QTY,
                    ENTRY_BOX: rowData.ENTRY_BOX,
                    ENTRY_EA: rowData.ENTRY_EA,
                    CONFIRM_QTY: rowData.CONFIRM_QTY,
                    BOX_WEIGHT: rowData.BOX_WEIGHT,
                    ENTRY_WEIGHT: rowData.ENTRY_WEIGHT,
                    VALID_DATE: rowData.VALID_DATE,
                    BATCH_NO: rowData.BATCH_NO,
                    BUY_PRICE: rowData.BUY_PRICE,
                    APPLY_PRICE: rowData.APPLY_PRICE,
                    DC_PRICE: rowData.DC_PRICE,
                    BUY_AMT: rowData.BUY_AMT,
                    VAT_AMT: rowData.VAT_AMT,
                    DC_AMT: rowData.DC_AMT,
                    TOTAL_AMT: rowData.TOTAL_AMT,
                    VAT_YN: rowData.VAT_YN,
                    DRUG_DIV_D: rowData.DRUG_DIV_D,
                    MEDICATION_DIV_D: rowData.MEDICATION_DIV_D,
                    KEEP_DIV_D: rowData.KEEP_DIV_D,
                    DRUG_CD: rowData.DRUG_CD,
                    RETURN_DIV: rowData.RETURN_DIV,
                    RETURN_DIV_F: rowData.RETURN_DIV_F,
                    RETURN_COMMENT: rowData.RETURN_COMMENT,
                    ORDER_DATE: rowData.ORDER_DATE,
                    ORDER_NO: rowData.ORDER_NO,
                    ORDER_LINE_NO: rowData.ORDER_LINE_NO,
                    BU_DATE: dsMaster.BU_DATE,
                    BU_NO: dsMaster.BU_NO,
                    BU_LINE_NO: rowData.BU_LINE_NO,
                    BU_KEY: rowData.BU_KEY,
                    SUM_ENTRY_QTY: 0,
                    SPARE1_NOTE: rowData.SPARE1_NOTE,
                    SPARE2_NOTE: rowData.SPARE2_NOTE,
                    SPARE3_NOTE: rowData.SPARE3_NOTE,
                    SPARE4_NOTE: rowData.SPARE4_NOTE,
                    SPARE5_NOTE: rowData.SPARE5_NOTE,
                    REMARK1: rowData.REMARK1,
                    id: $NC.getGridNewRowId(),
                    CRUD: CRUD
                };
                // 예정에만 SHORTAGE_YN 추가
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
                    newRowData.SHORTAGE_YN = $ND.NO;
                }
                G_GRDDETAIL.data.addItem(newRowData);
            }
        } finally {
            G_GRDDETAIL.data.endUpdate();
        }

        // 가용재고 체크
        for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
            grdDetailOnCheckPStock(rIndex, true);
        }

        // 예정으로 등록/ 등록수정
        $NC.setEnable("#cboInout_Cd", false);
        $NC.setEnable("#edtVendor_Cd", false);
        $NC.setEnable("#btnVendor_Cd", false);

        // 예정으로 등록
        if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
        }
        // 등록수정
        else if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_UPDATE) {
            $NC.setEnable("#dtpOutbound_Date", false);
        }

        $NC.G_VAR.ORDER_YN = $NC.isNotNull($NC.getValue("#edtOrder_No")) ? $ND.C_YES : $ND.C_NO;

        $NC.setFocus("#edtRemark1");

        $NC.setGridSelectRow(G_GRDDETAIL, 0);
    }

    // 조회조건 - 반출구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: $ND.C_INOUT_GRP_D3,
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        selectOption: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE ? "F" : null,
        onComplete: function() {
            if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {
                $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
            } else {
                $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
            }
            $NC.G_VAR.masterData.INOUT_CD_SUB = $NC.getComboData("#cboInout_Cd", -1).ATTR01_CD;
        }
    });

    // 검색구분에 초기값 설정
    $NC.setEnable("#rgbQView_Div2", $NC.G_VAR.G_PARAMETER.P_POLICY_LS210 == "2" && $NC.G_VAR.G_PARAMETER.P_POLICY_RO250 == "2");
    $NC.setValue("#rgbQView_Div1", true);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
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

    var $parent;
    if ($NC.isVisible("#divStockOverlay")) {
        $parent = $("#divStockView").parent();
        $NC.resizeGridView("#divStockView", "#grdStock", null, $parent.height() - $NC.getViewHeight($parent.children().not("#divStockView")));
    }

    if ($NC.isVisible("#divOutwaitOverlay")) {
        $parent = $("#divOutwaitView").parent();
        $NC.resizeGridView("#divOutwaitView", "#grdOutwait", null, $parent.height() - $NC.getViewHeight($parent.children().not("#divOutwaitView")));
    }
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
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
                P_BRAND_CD: val
            }, onBuBrandStockPopup);
            return;
        case "ITEM_CD":
            $NP.onItemChange(val, {
                P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
                P_ITEM_CD: val,
                P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemStockPopup);
            return;
        case "LOCATION_CD":
            $NP.onLocationChange(val, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: val,
                P_ZONE_DIV_ATTR01_CD: "1", // 1 - 일반, 2- 유통가공, 3 - 보세
                P_INOUT_DIV: "2"
            }, onLocationPopup);
            return;
        case "VIEW_DIV1":
        case "VIEW_DIV2":
            grdStockOnSetColumns();
            break;
    }

    onChangingCondition();
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

    // 재고조회
    var CENTER_CD = $NC.G_VAR.G_PARAMETER.P_CENTER_CD;
    var BU_CD = $NC.G_VAR.G_PARAMETER.P_BU_CD;
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_STATE = $NC.getValue("#cboQItem_State", true);
    var LOCATION_CD = $NC.getValue("#edtQLocation_Cd");
    var POLICY_VAL = $NC.getValue("#rgbQView_Div1") == "1" ? "1" : "2";
    var OUTBOUND_DATE = $NC.G_VAR.masterData.OUTBOUND_DATE; // 반출일자 기준

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSTOCK);

    G_GRDSTOCK.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_LOCATION_CD: LOCATION_CD,
        P_POLICY_VAL: POLICY_VAL,
        P_OUTBOUND_DATE: OUTBOUND_DATE
    };
    // 데이터 조회
    $NC.serviceCall("/ROC02010E0/getDataSet.do", $NC.getGridParams(G_GRDSTOCK), onGetStock);
}

/**
 * 신규
 */
function _New() {

    var VENDOR_CD = $NC.getValue("#edtVendor_Cd");
    if ($NC.isNull(VENDOR_CD)) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.004", "먼저 공급처 코드를 입력하십시오."));
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
        OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
        OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
        LINE_NO: "",
        OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE || $ND.C_STATE_ENTRY,
        BRAND_CD: "",
        BRAND_NM: "",
        ITEM_CD: "",
        ITEM_NM: "",
        ITEM_STATE: $NC.G_VAR.G_PARAMETER.P_POLICY_RO240,
        ITEM_STATE_F: $NC.getGridComboName(G_GRDDETAIL, {
            columnId: "ITEM_STATE_F",
            searchVal: $NC.G_VAR.G_PARAMETER.P_POLICY_RO240,
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        }),
        ITEM_LOT: $ND.C_BASE_ITEM_LOT,
        QTY_IN_BOX: 1,
        ORDER_QTY: 0,
        OLD_ENTRY_QTY: 0,
        ENTRY_QTY: 0,
        ENTRY_BOX: 0,
        ENTRY_EA: 0,
        CONFIRM_QTY: 0,
        PUTAWAY_QTY: 0,
        BOX_WEIGHT: 0,
        ENTRY_WEIGHT: 0,
        VALID_DATE: "",
        BATCH_NO: "",
        BUY_PRICE: 0,
        DC_PRICE: 0,
        APPLY_PRICE: 0,
        BUY_AMT: 0,
        VAT_AMT: 0,
        DC_AMT: 0,
        TOTAL_AMT: 0,
        VAT_YN: $ND.C_NO,
        RETURN_DIV: $ND.C_REASON_ETC_DIV,
        RETURN_DIV_F: $NC.getGridComboName(G_GRDDETAIL, {
            columnId: "RETURN_DIV_F",
            searchVal: $ND.C_REASON_ETC_DIV,
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        }),
        RETURN_COMMENT: "",
        ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
        ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
        ORDER_LINE_NO: "",
        BU_DATE: $NC.G_VAR.masterData.BU_DATE,
        BU_NO: $NC.G_VAR.masterData.BU_NO,
        BU_LINE_NO: "",
        BU_KEY: "",
        REMARK1: "",
        SPARE1_NOTE: "",
        SPARE2_NOTE: "",
        SPARE3_NOTE: "",
        SPARE4_NOTE: "",
        SPARE5_NOTE: "",
        SHORTAGE_YN: $ND.C_NO,
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
        alert($NC.getDisplayMsg("JS.ROC02011P1.005", "물류센터가 지정되어 있지 않습니다. 다시 작업하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.006", "사업부가 지정되어 있지 않습니다. 다시 작업하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.007", "먼저 반출일자를 입력하십시오."));
        $NC.setFocus("#dtpOutbound_Date");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.VENDOR_CD)) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.004", "먼저 공급처 코드를 입력하십시오."));
        $NC.setFocus("#edtVendor_Cd");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.008", "저장할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.ROC02011P1.009", "저장하시겠습니까?"))) {
        return;
    }

    var rowData, rIndex, rCount;
    // 재고체크
    for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        grdDetailOnCheckPStock(rIndex, true);
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.SHORTAGE_YN == $ND.C_YES) {
            alert($NC.getDisplayMsg("JS.ROC02011P1.010", "출고가능량을 초과한 상품이 존재합니다\n조정 후 저장하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, rIndex, "ENTRY_QTY", true);
            return;
        }
    }

    var dsD = [ ];
    var dsCU = [ ];
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var dsTarget = G_GRDDETAIL.data.getItems();
    var dsDetail;
    for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
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
            P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
            P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_OUTBOUND_STATE: rowData.OUTBOUND_STATE,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: rowData.ITEM_LOT,
            P_QTY_IN_BOX: rowData.QTY_IN_BOX,
            P_ORDER_QTY: rowData.ORDER_QTY,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_OLD_ENTRY_QTY: rowData.OLD_ENTRY_QTY,
            P_CONFIRM_QTY: rowData.ENTRY_QTY,
            P_VALID_DATE: rowData.VALID_DATE,
            P_BATCH_NO: rowData.BATCH_NO,
            P_BUY_PRICE: rowData.BUY_PRICE,
            P_DC_PRICE: rowData.DC_PRICE,
            P_APPLY_PRICE: rowData.APPLY_PRICE,
            P_BUY_AMT: rowData.BUY_AMT,
            P_VAT_AMT: rowData.VAT_AMT,
            P_DC_AMT: rowData.DC_AMT,
            P_TOTAL_AMT: rowData.TOTAL_AMT,
            P_VAT_YN: rowData.VAT_YN,
            P_RETURN_DIV: rowData.RETURN_DIV,
            P_RETURN_COMMENT: rowData.RETURN_COMMENT,
            P_ORDER_DATE: rowData.ORDER_DATE,
            P_ORDER_NO: rowData.ORDER_NO,
            P_ORDER_LINE_NO: rowData.ORDER_LINE_NO,
            P_BU_DATE: rowData.BU_DATE,
            P_BU_NO: rowData.BU_NO,
            P_BU_LINE_NO: rowData.BU_LINE_NO,
            P_BU_KEY: rowData.BU_KEY,
            P_LOCATION_CD: rowData.LOCATION_CD,
            P_SUM_ENTRY_QTY: rowData.SUM_ENTRY_QTY,
            P_SPARE1_NOTE: rowData.SPARE1_NOTE,
            P_SPARE2_NOTE: rowData.SPARE2_NOTE,
            P_SPARE3_NOTE: rowData.SPARE3_NOTE,
            P_SPARE4_NOTE: rowData.SPARE4_NOTE,
            P_SPARE5_NOTE: rowData.SPARE5_NOTE,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }
    dsDetail = dsD.concat(dsCU);
    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R && dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.011", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/ROC02010E0/save.do", {
        P_DS_MASTER: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
            P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
            P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
            P_OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE,
            P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
            P_VENDOR_CD: $NC.G_VAR.masterData.VENDOR_CD,
            P_CAR_NO: $NC.G_VAR.masterData.CAR_NO,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
            P_PLANED_DATETIME: $NC.G_VAR.masterData.PLANED_DATETIME,
            P_DATA_DIV: $NC.G_VAR.masterData.DATA_DIV,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_CRUD: $NC.G_VAR.masterData.CRUD
        },
        P_DS_DETAIL: dsDetail,
        P_PROCESS_CD: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD,
        P_PROCESS_STATE_BW: $NC.G_VAR.G_PARAMETER.P_PROCESS_STATE_BW,
        P_PROCESS_STATE_FW: $NC.G_VAR.G_PARAMETER.P_PROCESS_STATE_FW,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.012", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제, 그외 CRUD를 "D"로 변경
    if ($NC.deleteGridRowData(G_GRDDETAIL, rowData, true) > 0) {
        // 같은 상품이 그리드에 있을 경우, 해당 상품을 삭제 했을 경우, 재계산하여 가용재고량과 비교하기 위해 아래 로직 추가
        for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
            grdDetailOnCheckPStock(rIndex, rIndex != G_GRDDETAIL.lastRow); // 마지막 Row와 같으면 출고가용량 표시
        }
    }
    // 데이터가 모두 삭제되었으면 출고가능량 정보 초기화
    else {
        grdDetailOnCheckPStock(-1); // 출고가용량정보 초기화
    }
}

function masterDataOnChange(e, args) {

    switch (args.col) {
        case "INOUT_CD":
            $NC.G_VAR.masterData.INOUT_CD = args.val;
            break;
        case "CAR_NO":
            $NC.G_VAR.masterData.CAR_NO = args.val;
            break;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.ROC02011P1.013", "반출일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
            break;
        case "VENDOR_CD":
            $NP.onVendorChange(args.val, {
                P_CUST_CD: $NC.getValue("#edtCust_Cd"),
                P_VENDOR_CD: args.val,
                P_VIEW_DIV: "1"
            }, onVendorPopup);
            return;
        case "REMARK1":
            $NC.G_VAR.masterData.REMARK1 = args.val;
            break;
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
}

function grdDetailOnGetColumns() {

    if ($NC.isNull($NC.G_VAR.G_PARAMETER.P_POLICY_LS210)) {
        $NC.G_VAR.G_PARAMETER.P_POLICY_LS210 = "1";
    }
    if ($NC.isNull($NC.G_VAR.G_PARAMETER.P_POLICY_RO250)) {
        $NC.G_VAR.G_PARAMETER.P_POLICY_RO250 = "1";
    }

    var columns = [ ];
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
                P_ATTR01_CD: "1",
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
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        // 기본 editorOptions 자동 지정이 아닌 임의 지정
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions({
            formatterType: "FLOAT_QTY",
            isKeyField: true
        })
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
    // 정책에 따른 컬럼 표시
    if ($NC.G_VAR.G_PARAMETER.P_POLICY_LS210 == "2" && $NC.G_VAR.G_PARAMETER.P_POLICY_RO250 == "2") {
        $NC.setGridColumn(columns, {
            id: "VALID_DATE",
            field: "VALID_DATE",
            name: "유통기한",
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
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_DIV_F",
        field: "RETURN_DIV_F",
        name: "반품사유구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "RO.RETURN_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "RETURN_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_COMMENT",
        field: "RETURN_COMMENT",
        name: "반품사유내역",
        editor: Slick.Editors.Text
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
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.SHORTAGE_YN == $ND.C_YES) {
                    return "styLack";
                }
                if (rowData.ORDER_QTY > rowData.ENTRY_QTY) {
                    return "styUnder";
                }
            }
        }
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

function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    var isNew = (rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD == $ND.C_DV_CRUD_C) && $NC.isNull(rowData.ORDER_LINE_NO);
    switch (args.column.id) {
        case "ITEM_CD":
        case "ITEM_STATE_F":
        case "ITEM_LOT":
            return isNew;
    }
    return true;
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;
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
            grdDetailOnCheckPStock(args.row, null);
            break;
        case "ITEM_LOT":
            grdDetailOnCheckPStock(args.row, false);
            break;
        case "ENTRY_QTY":
            var CHECK_QTY = $NC.isNull(rowData.ORDER_LINE_NO) ? 1 : 0;
            var ENTRY_QTY = Number(rowData.ENTRY_QTY);
            if (ENTRY_QTY < CHECK_QTY) {
                alert($NC.getDisplayMsg("JS.ROC02011P1.014", "등록수량이 " + CHECK_QTY + "보다 작을 수 없습니다.", CHECK_QTY));
                rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            // 반출등록 수량 허용기준 2 -> 반출예정 수량 초과등록 불가능
            if ($NC.G_VAR.ORDER_YN == $ND.C_YES && $NC.G_VAR.G_PARAMETER.P_POLICY_RO220 != "1") {
                if (Number(rowData.ORDER_QTY) < ENTRY_QTY) {
                    alert($NC.getDisplayMsg("JS.ROC02011P1.015", "등록수량이 예정수량을 초과할 수 없습니다."));
                    rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                    break;
                }
            }

            rowData = grdDetailOnCalc(rowData);
            grdDetailOnCheckPStock(args.row, true);
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(rowData.VALID_DATE)) {
                if (!$NC.isDate(rowData.VALID_DATE)) {
                    alert($NC.getDisplayMsg("JS.ROC02011P1.016", "유통기한을 정확히 입력하십시오."));
                    rowData.VALID_DATE = "";
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                } else {
                    rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ITEM_CD) || $NC.isNull(rowData.ITEM_NM)) {
            alert($NC.getDisplayMsg("JS.ROC02011P1.017", "상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_STATE)) {
            alert($NC.getDisplayMsg("JS.ROC02011P1.018", "상태를 선택하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_STATE_F", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_LOT)) {
            alert($NC.getDisplayMsg("JS.ROC02011P1.019", "LOT번호를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_LOT", true);
            return false;
        }
        if ($NC.isNull(rowData.ENTRY_QTY)) {
            alert($NC.getDisplayMsg("JS.ROC02011P1.020", "등록수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ENTRY_QTY", true);
            return false;
        }
        if ($NC.isNull(rowData.RETURN_DIV)) {
            alert($NC.getDisplayMsg("JS.ROC02011P1.021", "반품사유구분을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "RETURN_DIV_F", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 현재고 표시
    grdDetailOnCheckPStock(row, false);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

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

function grdDetailOnCalc(rowData, entryQty) {

    if ($NC.isNotNull(entryQty)) {
        rowData.ENTRY_QTY = Number(entryQty);
    }

    rowData.ENTRY_BOX = $NC.getBBox(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
    rowData.ENTRY_EA = $NC.getBEa(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
    rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

    var calcParams = {
        ITEM_PRICE: rowData.BUY_PRICE,// 매입단가 또는 공급단가
        APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
        ITEM_QTY: rowData.ENTRY_QTY,// 상품수량
        ITEM_AMT: rowData.BUY_AMT,// 매입금액 또는 공급금액
        VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
        VAT_AMT: rowData.VAT_AMT,// 부가세
        DC_AMT: rowData.DC_AMT,// 할인금액
        TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
        POLICY_VAL: $NC.G_VAR.G_PARAMETER.P_POLICY_RO190
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
        $NC.setFocus("#edtCar_No", true);
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

function onItemPopup(resultInfo) {

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
        rowData.BRAND_CD = resultInfo.BRAND_CD;
        rowData.BRAND_NM = resultInfo.BRAND_NM;
        rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
        rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
        rowData.BUY_PRICE = resultInfo.BUY_PRICE;
        rowData.DC_PRICE = 0;
        rowData.APPLY_PRICE = 0;
        if ($NC.G_VAR.G_PARAMETER.P_POLICY_RO190 == "2") { // 매입금액 계산정책
            rowData.APPLY_PRICE = rowData.BUY_PRICE;
        }
        rowData.BUY_AMT = 0;
        rowData.VAT_AMT = 0;
        rowData.DC_AMT = 0;
        rowData.TOTAL_AMT = 0;
        rowData.VAT_YN = resultInfo.VAT_YN;
        rowData.DRUG_DIV_D = resultInfo.DRUG_DIV_D;
        rowData.MEDICATION_DIV_D = resultInfo.MEDICATION_DIV_D;
        rowData.KEEP_DIV_D = resultInfo.KEEP_DIV_D;
        rowData.DRUG_CD = resultInfo.DRUG_CD;

        rowData = grdDetailOnCalc(rowData);
        grdDetailOnCheckPStock(G_GRDDETAIL.lastRow, null);
        focusCol = G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY");
    } else {
        rowData.ITEM_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";
        rowData.BRAND_CD = "";
        rowData.BRAND_NM = "";
        rowData.QTY_IN_BOX = 1;
        rowData.ENTRY_QTY = 0;
        rowData.ENTRY_BOX = 0;
        rowData.ENTRY_EA = 0;
        rowData.CONFIRM_QTY = 0;
        rowData.BOX_WEIGHT = 0;
        rowData.ENTRY_WEIGHT = 0;
        rowData.BUY_PRICE = 0;
        rowData.DC_PRICE = 0;
        rowData.APPLY_PRICE = 0;
        rowData.BUY_AMT = 0;
        rowData.VAT_AMT = 0;
        rowData.DC_AMT = 0;
        rowData.TOTAL_AMT = 0;
        rowData.VAT_YN = $ND.C_NO;
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

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}

/**
 * 출고가능량 체크하기
 * 
 * @param row
 * @param isCheckOnly
 */
function grdDetailOnCheckPStock(row, isCheckOnly) {

    var rowData = G_GRDDETAIL.data.getItem(row);
    if ($NC.isNull(rowData)) {
        $NC.setValue("#edtStock_Qty");
        $NC.setValue("#edtVirtual_Qty");
        $NC.setValue("#edtOut_Wait_Qty");
        $NC.setValue("#edtPstock_Qty");
        return;
    }

    // 데이터 조회
    $NC.serviceCallAndWait("/ROC02010E0/getData.do", {
        P_QUERY_ID: "WF.GET_RO_PSTOCK_QTY",
        P_QUERY_PARAMS: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: rowData.ITEM_LOT,
            P_POLICY_LO310: "",
            P_POLICY_LO320: "",
            // 반출일자는 필수, 반출번호는 수정일 경우만 세팅
            P_OUTBOUND_DATE: $NC.getValue("#dtpOutbound_Date"),
            P_OUTBOUND_NO: $NC.getValue("#edtOutbound_No")
        }
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            alert($NC.getDisplayMsg("JS.ROC02011P1.022", "출고가능량 정보를 가져오지 못했습니다."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }

        var PSTOCK_QTY = Number(resultData.O_PSTOCK_QTY);
        var OUT_WAIT_QTY = Number(resultData.O_OUT_WAIT_QTY);

        // 추가
        var SUM_ENTRY_QTY = $NC.getGridSumVal(G_GRDDETAIL, {
            searchKey: [
                "ITEM_CD",
                "ITEM_STATE",
                "ITEM_LOT",
                "CRUD"
            ],
            searchVal: [
                rowData.ITEM_CD,
                rowData.ITEM_STATE,
                rowData.ITEM_LOT,
                [
                    $ND.C_DV_CRUD_C,
                    $ND.C_DV_CRUD_N,
                    $ND.C_DV_CRUD_R,
                    $ND.C_DV_CRUD_U
                ]
            ],
            sumKey: "ENTRY_QTY",
            isAllData: false
        });

        rowData.SUM_ENTRY_QTY = SUM_ENTRY_QTY;
        if ($NC.isNull(isCheckOnly)) {
            if (PSTOCK_QTY < Number(SUM_ENTRY_QTY)) {
                rowData.SHORTAGE_YN = $ND.C_YES; // 'Y'이면 출고 가능량 부족.
            } else {
                rowData.SHORTAGE_YN = $ND.C_NO; // 'N'이면 출고 가능량 만족.
            }
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);

            $NC.setValue("#edtStock_Qty", $NC.getDisplayNumber(resultData.O_STOCK_QTY));
            $NC.setValue("#edtVirtual_Qty", $NC.getDisplayNumber(resultData.O_VIRTUAL_QTY));
            $NC.setValue("#edtOutwait_Qty", $NC.getDisplayNumber(OUT_WAIT_QTY));
            $NC.setValue("#edtPstock_Qty", $NC.getDisplayNumber(PSTOCK_QTY));

        } else {
            if (isCheckOnly) {
                if (PSTOCK_QTY < Number(SUM_ENTRY_QTY)) {
                    rowData.SHORTAGE_YN = $ND.C_YES; // 'Y'이면 출고 가능량 부족.
                } else {
                    rowData.SHORTAGE_YN = $ND.C_NO; // 'N'이면 출고 가능량 만족.
                }
                G_GRDDETAIL.data.updateItem(rowData.id, rowData);
            } else {
                $NC.setValue("#edtStock_Qty", $NC.getDisplayNumber(resultData.O_STOCK_QTY));
                $NC.setValue("#edtVirtual_Qty", $NC.getDisplayNumber(resultData.O_VIRTUAL_QTY));
                $NC.setValue("#edtOutwait_Qty", $NC.getDisplayNumber(OUT_WAIT_QTY));
                $NC.setValue("#edtPstock_Qty", $NC.getDisplayNumber(PSTOCK_QTY));
            }
        }
    });
}

function showOutwaitOverlay(e) {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.023", "출고대기 내역을 확인할 상품을 선택하십시오."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var CENTER_CD = $NC.G_VAR.G_PARAMETER.P_CENTER_CD;
    var BU_CD = $NC.G_VAR.G_PARAMETER.P_BU_CD;
    var OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
    var OUTBOUND_NO = $NC.getValue("#edtOutbound_No");
    var BRAND_CD = rowData.BRAND_CD;
    var ITEM_CD = rowData.ITEM_CD;
    var ITEM_STATE = rowData.ITEM_STATE;
    var ITEM_LOT = rowData.ITEM_LOT;

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDOUTWAIT);

    G_GRDOUTWAIT.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_NO: OUTBOUND_NO,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_LOT: ITEM_LOT
    };
    // 데이터 조회
    $NC.serviceCallAndWait("/ROC02010E0/getDataSet.do", $NC.getGridParams(G_GRDOUTWAIT), onGetOutwait);

    if (G_GRDOUTWAIT.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.024", "출고대기 내역이 존재하지 않습니다."));
        return;
    }

    $NC.showOverlay("#divOutwaitOverlay", {
        title: $NC.getDisplayMsg("JS.ROC02011P1.025", "출고대기 내역"),
        fullscreen: false,
        width: 700,
        height: 300,
        onComplete: function() {
            $NC.onGlobalResize();
            G_GRDOUTWAIT.view.focus();
            G_GRDOUTWAIT.view.invalidate();
            $NC.setGridSelectRow(G_GRDOUTWAIT, 0);
        }
    });
}

function onGetOutwait(ajaxData) {

    $NC.setInitGridData(G_GRDOUTWAIT, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDOUTWAIT, "OUTBOUND_DATE");
}

function grdOutwaitOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "출고처"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "출고처명"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "출고대기수량",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdOutwaitInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdOutwait", {
        columns: grdOutwaitOnGetColumns(),
        queryId: "ROC02010E1.RS_SUB1",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDOUTWAIT.view.onSelectedRowsChanged.subscribe(grdOutwaitOnAfterScroll);
}

function grdOutwaitOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDOUTWAIT, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDOUTWAIT, row + 1);
}

function showStockOverlay(e) {

    var VENDOR_CD = $NC.getValue("#edtVendor_Cd");
    if ($NC.isNull(VENDOR_CD)) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.004", "먼저 공급처 코드를 입력하십시오."));
        $NC.setFocus("#edtVendor_Cd");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setValue("#cboQItem_State", $NC.G_VAR.G_PARAMETER.P_POLICY_RO240);
    $NC.setValue("#edtQLocation_Cd");

    // 초기화
    $NC.clearGridData(G_GRDSTOCK);

    $NC.showOverlay("#divStockOverlay", {
        onComplete: function() {
            $NC.onGlobalResize();
            // G_GRDSTOCK.view.focus();

            $NC.setFocus("#edtQBrand_Cd");
        }
    });
}

function onGetStock(ajaxData) {

    $NC.setInitGridData(G_GRDSTOCK, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSTOCK, "ITEM_CD");
}

function grdStockOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
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
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "현재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "출고가능량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_BOX",
        field: "PSTOCK_BOX",
        name: "출고가능BOX",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_EA",
        field: "PSTOCK_EA",
        name: "출고가능EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "INPUT_QTY",
        field: "INPUT_QTY",
        name: "등록수량",
        cssClass: "styRight",
        // 기본 editorOptions 자동 지정이 아닌 임의 지정
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions({
            formatterType: "FLOAT_QTY",
            isKeyField: true
        })
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdStockOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDSTOCK, [ // 숨김컬럼 세팅
        $NC.getValue("#rgbQView_Div2") != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdStockInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 5
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdStock", {
        columns: grdStockOnGetColumns(),
        queryId: "WC.POP_LS010NM",
        sortCol: "ITEM_LOT",
        gridOptions: options
    });

    G_GRDSTOCK.view.onSelectedRowsChanged.subscribe(grdStockOnAfterScroll);
    G_GRDSTOCK.view.onHeaderClick.subscribe(grdStockOnHeaderClick);
    G_GRDSTOCK.view.onCellChange.subscribe(grdStockOnCellChange);
    $NC.setGridColumnHeaderCheckBox(G_GRDSTOCK, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdStockOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDSTOCK, e, args);
            break;
    }
}

function grdStockOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDSTOCK.view.getColumnId(args.cell)) {
        case "INPUT_QTY":
            if (rowData.CHECK_YN != $ND.C_YES) {
                rowData.CHECK_YN = $ND.C_YES;
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSTOCK, rowData);
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 * @param view
 *        대상 Object
 * @param args
 *        grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

    var grdObject = $NC.getGridObject(args.grid);
    if (!grdObject.isValid) {
        return;
    }

    var columnId = grdObject.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function grdStockOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSTOCK, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSTOCK, row + 1);
}

/**
 * 재고팝업에서 선택한 상품을 그리드에 추가
 */
function btnStockAddItemOnClick() {

    if (G_GRDSTOCK.view.getEditorLock().isActive()) {
        G_GRDSTOCK.view.getEditorLock().commitCurrentEdit();
    }

    var dsStock = [ ];
    var rowData, rIndex, rCount;
    for (rIndex = 0, rCount = G_GRDSTOCK.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDSTOCK.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        if (Number(rowData.INPUT_QTY) <= 0) {
            alert($NC.getDisplayMsg("JS.ROC02011P1.026", "등록수량이 0보다 작을 수 없습니다."));
            $NC.setFocusGrid(G_GRDSTOCK, rIndex, "INPUT_QTY", true);
            return false;
        }
        dsStock.push(rowData);
    }

    if (dsStock.length == 0) {
        alert($NC.getDisplayMsg("JS.ROC02011P1.027", "출고등록할 재고를 선택하십시오."));
        return;
    }

    var lastRow = G_GRDDETAIL.data.getLength();

    var VIEW_DIV = $NC.getValue("#rgbQView_Div2");
    var RETURN_DIV = $ND.C_REASON_ETC_DIV;
    var RETURN_DIV_F = $NC.getGridComboName(G_GRDDETAIL, {
        columnId: "RETURN_DIV_F",
        searchVal: $ND.C_REASON_ETC_DIV,
        dataCodeField: "COMMON_CD",
        dataFullNameField: "COMMON_CD_F"
    });
    var LOCATION_CD = $NC.getValue("#edtQLocation_Cd");

    var newRowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
        for (rIndex = 0, rCount = dsStock.length; rIndex < rCount; rIndex++) {
            rowData = dsStock[rIndex];

            rowData.APPLY_PRICE = 0;
            rowData.DC_PRICE = 0;
            if ($NC.G_VAR.G_PARAMETER.P_POLICY_RO190 == "2") {
                rowData.APPLY_PRICE = rowData.BUY_PRICE;
            }
            rowData.BUY_AMT = 0;
            rowData.VAT_YN = rowData.VAT_YN;
            rowData.VAT_AMT = 0;
            rowData.DC_AMT = 0;
            grdDetailOnCalc(rowData, rowData.INPUT_QTY);

            newRowData = {
                CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
                BU_CD: $NC.G_VAR.masterData.BU_CD,
                ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
                ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
                LINE_NO: "",
                OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE || $ND.C_STATE_ENTRY,
                BRAND_CD: rowData.BRAND_CD,
                BRAND_NM: rowData.BRAND_NM,
                ITEM_CD: rowData.ITEM_CD,
                ITEM_NM: rowData.ITEM_NM,
                ITEM_STATE: rowData.ITEM_STATE,
                ITEM_STATE_F: rowData.ITEM_STATE_F,
                ITEM_LOT: rowData.ITEM_LOT,
                ITEM_SPEC: rowData.ITEM_SPEC,
                VALID_DATE: VIEW_DIV == "1" ? "" : rowData.VALID_DATE,
                BATCH_NO: VIEW_DIV == "1" ? "" : rowData.BATCH_NO,
                QTY_IN_BOX: rowData.QTY_IN_BOX,
                ORDER_QTY: 0,
                ENTRY_QTY: rowData.ENTRY_QTY,
                ENTRY_BOX: rowData.ENTRY_BOX,
                ENTRY_EA: rowData.ENTRY_EA,
                BOX_WEIGHT: rowData.BOX_WEIGHT,
                ENTRY_WEIGHT: rowData.ENTRY_WEIGHT,
                BUY_PRICE: rowData.BUY_PRICE,
                DC_PRICE: rowData.DC_PRICE,
                APPLY_PRICE: rowData.APPLY_PRICE,
                BUY_AMT: rowData.BUY_AMT,
                VAT_AMT: rowData.VAT_AMT,
                DC_AMT: rowData.DC_AMT,
                TOTAL_AMT: rowData.TOTAL_AMT,
                VAT_YN: rowData.VAT_YN,
                DRUG_DIV_D: rowData.DRUG_DIV_D,
                MEDICATION_DIV_D: rowData.MEDICATION_DIV_D,
                KEEP_DIV_D: rowData.KEEP_DIV_D,
                DRUG_CD: rowData.DRUG_CD,
                BU_LINE_NO: "",
                BU_KEY: "",
                REMARK1: "",
                RETURN_DIV: RETURN_DIV,
                RETURN_DIV_F: RETURN_DIV_F,
                SUM_ENTRY_QTY: 0,
                LOCATION_CD: LOCATION_CD,
                SHORTAGE_YN: Number(rowData.PSTOCK_QTY) < Number(rowData.INPUT_QTY) ? $ND.C_YES : $ND.C_NO,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };
            G_GRDDETAIL.data.addItem(newRowData);
        }
    } finally {
        G_GRDDETAIL.data.endUpdate();
    }
    $NC.setGridSelectRow(G_GRDDETAIL, lastRow);

    // 같은 상품이 그리드에 있을 경우, 해당 상품의 합과 가용재고량과 비교하기 위해 아래 로직 추가
    for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        grdDetailOnCheckPStock(rIndex, true);
    }

    // 수정 상태로 변경
    G_GRDDETAIL.lastRowModified = true;

    $("#divStockOverlay").hide();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandStockPopup() {

    var BU_CD = $NC.G_VAR.G_PARAMETER.P_BU_CD;

    $NP.showBuBrandPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: $ND.C_ALL
    }, onBuBrandStockPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onBuBrandStockPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
    } else {
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setFocus("#edtQBrand_Cd", true);
    }

    // 상품 조건 초기화
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");

    onChangingCondition();
}

/**
 * 상품 검색 팝업 표시
 */
function showItemStockPopup() {

    var BU_CD = $NC.G_VAR.G_PARAMETER.P_BU_CD;
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    $NP.showItemPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: $ND.C_ALL,
        P_VIEW_DIV: "2",
        P_DEPART_CD: $ND.C_ALL,
        P_LINE_CD: $ND.C_ALL,
        P_CLASS_CD: $ND.C_ALL
    }, onItemStockPopup, function() {
        $NC.setFocus("#edtQItem_Cd", true);
    });
}

/**
 * 로케이션 검색 이미지 클릭
 */
function showLocationPopup() {

    $NP.showLocationPopup({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: $ND.C_ALL,
        P_ZONE_DIV_ATTR01_CD: "1", // 1 - 일반, 2- 유통가공, 3 - 보세
        P_INOUT_DIV: "2"
    }, onLocationPopup, function() {
        $NC.setFocus("#edtQLocation_Cd", true);
    });
}

function onLocationPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQLocation_Cd", resultInfo.LOCATION_CD);
    } else {
        $NC.setValue("#edtQLocation_Cd");
        $NC.setFocus("#edtQLocation_Cd", true);
    }
    onChangingCondition();
}

function onItemStockPopup(resultInfo) {

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

/**
 * [제고에서선택] 팝업의 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDSTOCK);
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    // 프로그램 사용 권한
    var permission = $NC.G_VAR.G_PARAMETER.P_PERMISSION;

    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER || $NC.G_VAR.ORDER_YN == $ND.C_YES) {
        // 예정으로 등록, 예정으로 등록한 데이터 수정일 경우
        // 예정으로 등록 시 추가/삭제 허용 기준
        // NN - 추가/삭제 불가능
        // NY - 삭제만 가능
        // YN - 추가만 가능
        // YY - 추가/삭제 가능
        var POLICY_RO221 = $NC.G_VAR.G_PARAMETER.P_POLICY_RO221.match(/N|Y/gi);
        if ($NC.isNull(POLICY_RO221)) {
            POLICY_RO221 = [
                $ND.C_NO,
                $ND.C_NO
            ];
        }
        // 예정으로 등록시 추가/삭제 허용 기준 정책 및 프로그램 사용 권한 체크
        $NC.setEnable("#btnEntryNew", POLICY_RO221[0] == $ND.C_YES && permission.canSave);
        $NC.setEnable("#btnStockPopup", POLICY_RO221[0] == $ND.C_YES && permission.canSave);
        $NC.setEnable("#btnEntryDelete", POLICY_RO221[1] == $ND.C_YES && permission.canDelete);
        $NC.setEnable("#btnEntrySave", permission.canSave);
    } else {
        // 신규 등록, 신규로 등록한 데이터 수정일 경우
        $NC.setEnable("#btnEntryNew", permission.canSave);
        $NC.setEnable("#btnEntryDelete", permission.canDelete);
        $NC.setEnable("#btnEntrySave", permission.canSave);
    }
}