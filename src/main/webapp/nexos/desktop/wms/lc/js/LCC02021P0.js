/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC02021P0
 *  프로그램명         : 상품변환등록 팝업
 *  프로그램설명       : 상품변환등록 팝업 화면 Javascript
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
        autoResizeView: function() {
            // 기본, 신규 등록/수정
            if ($NC.G_VAR.ORDER_YN == $ND.C_NO) {
                return {
                    container: "#ctrGridView",
                    childContainer: "#ctrEntryView",
                    exceptHeight: function() {
                        return $NC.getViewHeight("#ctrPopupView");
                    }
                };
            }
            // 예정으로 등록
            else {
                return {
                    container: "#ctrGridView",
                    exceptHeight: function() {
                        return $NC.getViewHeight("#ctrPopupView");
                    }
                };
            }
        },
        autoResizeFixedView: function() {
            // 기본, 신규 등록/수정
            if ($NC.G_VAR.ORDER_YN == $ND.C_NO) {
                return {
                    viewFirst: {
                        container: "#divStockView",
                        grids: "#grdStock"
                    },
                    viewSecond: {
                        container: "#divSubView",
                        grids: "#grdSub"
                    },
                    viewType: "v",
                    viewFixed: 180
                };
            }
            // 예정으로 등록
            else {
                return {
                    viewFirst: {
                        container: "#ctrOrderView",
                        grids: "#grdDetail"
                    },
                    viewSecond: {
                        container: "#ctrEntryView"
                    },
                    viewType: "h",
                    viewFixed: 450
                };
            }
        },
        autoResizeSplitView: function() {
            // 기본, 신규 등록/수정
            if ($NC.G_VAR.ORDER_YN == $ND.C_NO) {
                return;
            }
            // 예정으로 등록
            else {
                return {
                    splitViews: [
                        {
                            container: "#divStockView",
                            grids: "#grdStock",
                            size: 180
                        },
                        {
                            container: "#divSubView",
                            grids: "#grdSub"
                        }
                    ],
                    viewType: "v"
                };
            }
        },
        // 예정으로 등록 여부
        ORDER_YN: $ND.C_NO,
        // 마스터 데이터
        masterData: null,
        DIV_LOC: "_____", // '_' 다섯개
        // 체크할 정책 값
        policyVal: {
            CM120: "", // 로케이션표시정책
            CM121: "", // 로케이션 존 길이
            CM122: "", // 로케이션 행 길이
            CM123: "", // 로케이션 열 길이
            CM124: "", // 로케이션 단 길이
            LS210: "" // 재고 관리 기준
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnNew").click(_New); // 그리드 행 추가 버튼
    $("#btnDelete").click(_Delete); // 그리드 행 삭제버튼
    $("#btnSave").click(_Save); // 저장 버튼
    $("#btnQLocation").click(showQLocationPopup); // 현재고 검색시 사용되는 로케이션 검색 버튼 클릭
    $("#btnLocation").click(showLocationPopup); // 입고지시 그리드의 로케이션 값 설정에 사용되는 로케이션 검색 버튼
    $("#btnSearchStock").click(_Inquiry); // 현재고검색 버튼 클릭
    $("#btnQItem_Cd").click(showQItemPopup); // 현재고 검색의 상품검색 버튼 클릭
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    $NC.setEnable("#edtCenter_Cd_F", false); // 물류센터 비활성화
    $NC.setEnable("#edtBu_Cd", false); // 사업부 비활성화
    $NC.setEnable("#edtEtc_No", false); // 입출고번호 비활성화

    $NC.setInitDatePicker("#dtpEtc_Date"); // 입출고일자
    $NC.setInitDatePicker("#dtpQValid_Date", null, "N"); // 유통기한
    $NC.setInitDatePicker("#dtpQStock_Date", null, "N"); // 재고입고일자

    grdDetailInitialize();
    grdStockInitialize();
    grdSubInitialize();

    // 상품상태 콤보 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_STATE",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "1",
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_State",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F"
    });

    // 정책 값 세팅
    setPolicyValInfo();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);

    var dsMaster, ETC_DATE, rIndex, rCount, rowData, newRowData;

    // 신규 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {

        $NC.setValue("#dtpEtc_Date", $NC.G_VAR.G_PARAMETER.P_ETC_DATE);

        ETC_DATE = $NC.getValue("#dtpEtc_Date");
        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            ETC_DATE: ETC_DATE,
            ETC_NO: "",
            ORDER_DATE: "",
            ORDER_NO: "",
            INOUT_CD: "",
            REMARK1: "",
            CRUD: $ND.C_DV_CRUD_C
        };
    }
    // 예정으로 등록
    else if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {

        $NC.G_VAR.ORDER_YN = $ND.C_YES;
        $NC.setValue("#dtpEtc_Date", $NC.G_VAR.G_PARAMETER.P_ETC_DATE);

        ETC_DATE = $NC.getValue("#dtpEtc_Date");
        dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: dsMaster.CENTER_CD,
            BU_CD: dsMaster.BU_CD,
            ETC_DATE: ETC_DATE,
            ETC_NO: "",
            ORDER_DATE: dsMaster.ORDER_DATE,
            ORDER_NO: dsMaster.ORDER_NO,
            INOUT_CD: dsMaster.INOUT_CD,
            REMARK1: dsMaster.REMARK1,
            CRUD: $ND.C_DV_CRUD_C
        };

        // 디자인 조정
        $NC.setVisible("#ctrOrderView");
        $("#ctrEntryView").css({
            "margin-left": "5px",
            "border-left-width": "1px"
        });

        // 그리드 조정
        G_GRDSTOCK.view.setOptions({
            frozenColumn: 2
        });
        G_GRDSUB.view.setOptions({
            frozenColumn: 1
        });

        // SUB 데이터 세팅
        var dsDetail = $NC.G_VAR.G_PARAMETER.P_DETAIL_DS;
        G_GRDDETAIL.data.beginUpdate();
        try {
            for (rIndex = 0, rCount = dsDetail.length; rIndex < rCount; rIndex++) {
                rowData = dsDetail[rIndex];
                newRowData = {
                    CENTER_CD: rowData.CENTER_CD,
                    BU_CD: rowData.BU_CD,
                    ETC_DATE: rowData.ETC_DATE,
                    ETC_NO: rowData.ETC_NO,
                    ORDER_DATE: rowData.ORDER_DATE,
                    ORDER_NO: rowData.ORDER_NO,
                    LINE_NO: rowData.LINE_NO,
                    BRAND_CD: rowData.BRAND_CD,
                    BRAND_NM: rowData.BRAND_NM,
                    ITEM_CD: rowData.ITEM_CD,
                    ITEM_BAR_CD: rowData.ITEM_BAR_CD,
                    ITEM_NM: rowData.ITEM_NM,
                    ITEM_SPEC: rowData.ITEM_SPEC,
                    ITEM_STATE: rowData.ITEM_STATE,
                    ITEM_STATE_F: rowData.ITEM_STATE_F,
                    ITEM_LOT: rowData.ITEM_LOT,
                    QTY_IN_BOX: rowData.QTY_IN_BOX,
                    IN_UNIT_DIV_F: rowData.IN_UNIT_DIV_F,
                    VALID_DATE: rowData.VALID_DATE,
                    BATCH_NO: rowData.BATCH_NO,
                    ETC_DIV: rowData.ETC_DIV,
                    ETC_DIV_F: rowData.ETC_DIV_F,
                    ETC_COMMENT: rowData.ETC_COMMENT,
                    ORDER_QTY: rowData.ORDER_QTY,
                    ENTRY_QTY: rowData.ENTRY_QTY,
                    LOCATION_CD: rowData.LOCATION_CD,
                    LINK_BRAND_CD: rowData.LINK_BRAND_CD,
                    LINK_BRAND_NM: rowData.LINK_BRAND_NM,
                    LINK_ITEM_CD: rowData.LINK_ITEM_CD,
                    LINK_ITEM_BAR_CD: rowData.LINK_ITEM_BAR_CD,
                    LINK_ITEM_NM: rowData.LINK_ITEM_NM,
                    LINK_ITEM_SPEC: rowData.LINK_ITEM_SPEC,
                    LINK_ITEM_LOT: rowData.LINK_ITEM_LOT,
                    DRUG_DIV_D: rowData.DRUG_DIV_D,
                    MEDICATION_DIV_D: rowData.MEDICATION_DIV_D,
                    KEEP_DIV_D: rowData.KEEP_DIV_D,
                    DRUG_CD: rowData.DRUG_CD,
                    id: $NC.getGridNewRowId(),
                    CRUD: $ND.C_DV_CRUD_R
                };
                G_GRDDETAIL.data.addItem(newRowData);
            }
        } finally {
            G_GRDDETAIL.data.endUpdate();
        }

        // 상품 및 변환상태 비활성, 예정 데이터의 값으로 처리
        $NC.setValue("#cboInout_Cd", dsMaster.INOUT_CD);
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);
        $NC.setValue("#edtOrder_Date", dsMaster.ORDER_DATE);
        $NC.setValue("#edtOrder_No", dsMaster.ORDER_NO);
        $NC.setValue("#edtBu_Date", dsMaster.BU_DATE);
        $NC.setValue("#edtBu_No", dsMaster.BU_NO);

        $NC.setEnable("#cboInout_Cd", false);
        $NC.setEnable("#edtQBrand_Cd", false);
        $NC.setEnable("#btnQBrand_Cd", false);
        $NC.setEnable("#edtQItem_Cd", false);
        $NC.setEnable("#btnQItem_Cd", false);
        $NC.setEnable("#cboQItem_State", false);
        $NC.setEnable("#edtQItem_Lot", false);

        $NC.setGridSelectRow(G_GRDDETAIL, 0);
    }
    // 예정 -> 등록, 등록 수정
    else {
        // 마스터 데이터 세팅
        dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
        $NC.setValue("#dtpEtc_Date", dsMaster.ETC_DATE);
        $NC.setValue("#edtEtc_No", dsMaster.ETC_NO);
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);

        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: dsMaster.CENTER_CD,
            BU_CD: dsMaster.BU_CD,
            ETC_DATE: dsMaster.ETC_DATE,
            ETC_NO: dsMaster.ETC_NO,
            ORDER_DATE: dsMaster.ORDER_DATE,
            ORDER_NO: dsMaster.ORDER_NO,
            INOUT_CD: dsMaster.INOUT_CD,
            REMARK1: dsMaster.REMARK1,
            CRUD: $ND.C_DV_CRUD_R
        };

        // SUB 데이터 세팅
        var dsSub = $NC.G_VAR.G_PARAMETER.P_SUB_DS;
        G_GRDSUB.data.beginUpdate();
        try {
            for (rIndex = 0, rCount = dsSub.length; rIndex < rCount; rIndex++) {
                rowData = dsSub[rIndex];
                newRowData = {
                    CENTER_CD: rowData.CENTER_CD,
                    BU_CD: rowData.BU_CD,
                    ETC_DATE: rowData.ETC_DATE,
                    ETC_NO: rowData.ETC_NO,
                    LINE_NO: rowData.LINE_NO,
                    BRAND_CD: rowData.BRAND_CD,
                    BRAND_NM: rowData.BRAND_NM,
                    ITEM_CD: rowData.ITEM_CD,
                    ITEM_BAR_CD: rowData.ITEM_BAR_CD,
                    ITEM_NM: rowData.ITEM_NM,
                    ITEM_SPEC: rowData.ITEM_SPEC,
                    ITEM_STATE: rowData.ITEM_STATE,
                    ITEM_STATE_F: rowData.ITEM_STATE_F,
                    ITEM_LOT: rowData.ITEM_LOT,
                    QTY_IN_BOX: rowData.QTY_IN_BOX,
                    IN_UNIT_DIV_F: rowData.IN_UNIT_DIV_F,
                    VALID_DATE: rowData.VALID_DATE,
                    BATCH_NO: rowData.BATCH_NO,
                    STOCK_DATE: rowData.STOCK_DATE,
                    CONFIRM_QTY: rowData.CONFIRM_QTY,
                    CONFIRM_EA: rowData.CONFIRM_EA,
                    CONFIRM_BOX: rowData.CONFIRM_BOX,
                    ETC_DIV: rowData.ETC_DIV,
                    ETC_DIV_F: rowData.ETC_DIV_F,
                    ETC_COMMENT: rowData.ETC_COMMENT,
                    STOCK_QTY: "",
                    PSTOCK_QTY: "",
                    PSTOCK_EA: "",
                    PSTOCK_BOX: "",
                    OUT_WAIT_QTY: "",
                    LOCATION_CD: rowData.LOCATION_CD,
                    LINK_LOCATION_CD: rowData.LINK_LOCATION_CD,
                    LINK_BRAND_CD: rowData.LINK_BRAND_CD,
                    LINK_BRAND_NM: rowData.LINK_BRAND_NM,
                    LINK_ITEM_CD: rowData.LINK_ITEM_CD,
                    LINK_ITEM_BAR_CD: rowData.LINK_ITEM_BAR_CD,
                    LINK_ITEM_NM: rowData.LINK_ITEM_NM,
                    LINK_ITEM_SPEC: rowData.LINK_ITEM_SPEC,
                    LINK_ITEM_LOT: rowData.LINK_ITEM_LOT,
                    LINK_VALID_DATE: rowData.LINK_VALID_DATE,
                    LINK_BATCH_NO: rowData.LINK_BATCH_NO,
                    LINK_QTY_IN_BOX: rowData.LINK_QTY_IN_BOX,
                    LINK_IN_UNIT_DIV_F: rowData.LINK_IN_UNIT_DIV_F,
                    LINK_CENTER_CD: rowData.LINK_CENTER_CD,
                    LINK_BU_CD: rowData.LINK_BU_CD,
                    LINK_ETC_DATE: rowData.LINK_ETC_DATE,
                    LINK_ETC_NO: rowData.LINK_ETC_NO,
                    LINK_LINE_NO: rowData.LINK_LINE_NO,
                    LINK_DRUG_DIV_D: rowData.LINK_DRUG_DIV_D,
                    LINK_MEDICATION_DIV_D: rowData.LINK_MEDICATION_DIV_D,
                    LINK_KEEP_DIV_D: rowData.LINK_KEEP_DIV_D,
                    LINK_DRUG_CD: rowData.LINK_DRUG_CD,
                    id: $NC.getGridNewRowId(),
                    CRUD: $ND.C_DV_CRUD_R
                };
                G_GRDSUB.data.addItem(newRowData);
            }
        } finally {
            G_GRDSUB.data.endUpdate();
        }

        // 수정일 경우 비활성화
        $NC.setEnable("#dtpEtc_Date", false);
        $NC.setEnable("#cboInout_Cd", false);
        // $NC.setEnable("#edtRemark1", false);

        $NC.setGridSelectRow(G_GRDSUB, 0);
    }

    // 입출고구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "D6", // 상품변환그룹
            P_ATTR02_CD: "1", // 일반작업
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
        }
    });

    $NC.onGlobalResize();
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
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "ITEM_CD":
            $NP.onItemChange(val, {
                P_BU_CD: $NC.getValue("#edtBu_Cd"),
                P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
                P_ITEM_CD: val,
                P_VIEW_DIV: "2",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onQItemPopup);
            return;
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "ZONE_CD":
            if ($NC.isNull(val)) {
                $NC.setValue("#edtQZone_Nm");
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM121)) {
                alert($NC.getDisplayMsg("JS.LCC02021P0.001", "로케이션 존코드 길이(" + $NC.G_VAR.policyVal.CM121 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM121));
                $NC.setValue("#edtQZone_Cd");
                $NC.setValue("#edtQZone_Nm");
                $NC.setFocus("#edtQZone_Cd", true);
                break;
            }
            $NP.onZoneChange(val, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: val,
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: "",
                P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, onQLocationPopup);
            return;
        case "BANK_CD":
            if ($NC.isNull(val)) {
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM122)) {
                alert($NC.getDisplayMsg("JS.LCC02021P0.002", "로케이션 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM122));
                $NC.setValue("#edtQBank_Cd");
                $NC.setFocus("#edtQBank_Cd", true);
            }
            break;
        case "BAY_CD":
            if ($NC.isNull(val)) {
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM123)) {
                alert($NC.getDisplayMsg("JS.LCC02021P0.003", "로케이션 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM123));
                $NC.setValue("#edtQBay_Cd");
                $NC.setFocus("#edtQBay_Cd", true);
            }
            break;
        case "LEV_CD":
            if ($NC.isNull(val)) {
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM124)) {
                alert($NC.getDisplayMsg("JS.LCC02021P0.004", "로케이션 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM124));
                $NC.setValue("#edtQLev_Cd");
                $NC.setFocus("#edtQLev_Cd", true);
            }
            break;
        case "STOCK_DATE":
            if ($NC.isNotNull(val)) {
                $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC02021P0.005", "입고일자를 정확히 입력하십시오."));
            }
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(val)) {
                $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC02021P0.006", "유통기한를 정확히 입력하십시오."));
            }
            break;
    }
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

    // 현재 수정모드면
    if (G_GRDSUB.view.getEditorLock().isActive()) {
        G_GRDSUB.view.getEditorLock().commitCurrentEdit();
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var ITEM_LOT = $NC.getValue("#edtQItem_Lot");
    var VALID_DATE = $NC.getValue("#dtpQValid_Date");
    var BATCH_NO = $NC.getValue("#edtQBatch_No");
    var STOCK_DATE = $NC.getValue("#dtpQStock_Date");
    var ZONE_CD = $NC.getValue("#edtQZone_Cd");
    var BANK_CD = $NC.getValue("#edtQBank_Cd");
    var BAY_CD = $NC.getValue("#edtQBay_Cd");
    var LEV_CD = $NC.getValue("#edtQLev_Cd");

    if ($NC.isNull(ZONE_CD)) {
        ZONE_CD = $NC.G_VAR.DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM121);
    }

    if ($NC.isNull(BANK_CD)) {
        BANK_CD = $NC.G_VAR.DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM122);
    }

    if ($NC.isNull(BAY_CD)) {
        BAY_CD = $NC.G_VAR.DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM123);
    }

    if ($NC.isNull(LEV_CD)) {
        LEV_CD = $NC.G_VAR.DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM124);
    }

    var LOCATION_CD = $NC.getDisplayLocation(ZONE_CD, BANK_CD, BAY_CD, LEV_CD, $NC.G_VAR.policyVal.CM120);

    $NC.setInitGridVar(G_GRDSTOCK);

    G_GRDSTOCK.queryParams = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_LOT: ITEM_LOT,
        P_VALID_DATE: VALID_DATE,
        P_BATCH_NO: BATCH_NO,
        P_LOCATION_CD: LOCATION_CD,
        P_STOCK_DATE: STOCK_DATE,
        P_POLICY_LS210: $NC.G_VAR.policyVal.LS210
    };
    // 데이터 조회
    $NC.serviceCall("/LCC02020E0/getDataSet.do", $NC.getGridParams(G_GRDSTOCK), onGetDetail);
}

/**
 * 상품추가 버튼 클릭 이벤트 처리
 */
function _New() {

    if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
        // 지시 내역 추가 전 사유구분 체크 위해 수정 상태로 변경
        G_GRDDETAIL.lastRowModified = true;

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSTOCK)) {
        return;
    }

    // 선택 데이터 검색 -> Indexes
    var checkedRows = $NC.getGridSearchRows(G_GRDSTOCK, {
        searchKey: "CHECK_YN",
        searchVal: $ND.C_YES
    });
    if (checkedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.007", "추가할 재고내역 데이터를 선택하십시오."));
        return;
    }
    var LOCATION_CD = $NC.getValue("#edtLocation_Cd");

    var refRowData, remainQty;
    // 예정으로 등록
    if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
        refRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        remainQty = refRowData.ORDER_QTY - refRowData.ENTRY_QTY;
        if (remainQty < 1) {
            alert($NC.getDisplayMsg("JS.LCC02021P0.008", "이미 지시내역이 모두 추가되어 있습니다.\n\n기존 지시내역을 삭제하거나 확정수량 조정 후 추가하십시오."));
            return;
        }
    }

    // 기등록 체크 키
    var searchKey = [
        "BRAND_CD",
        "ITEM_CD",
        "ITEM_STATE",
        "ITEM_LOT",
        "VALID_DATE",
        "BATCH_NO",
        "LOCATION_CD"
    ];

    var addedCount = 0;
    var rowData, newRowData, confirmQty, confirmBox, confirmEa;
    G_GRDSUB.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = checkedRows.length; rIndex < rCount; rIndex++) {
            // 선택 데이터
            rowData = G_GRDSTOCK.data.getItem(checkedRows[rIndex]);
            // 기등록 체크
            if ($NC.getGridSearchRow(G_GRDSUB, {
                searchKey: searchKey,
                searchVal: [
                    rowData.BRAND_CD,
                    rowData.ITEM_CD,
                    rowData.ITEM_STATE,
                    rowData.ITEM_LOT,
                    rowData.VALID_DATE,
                    rowData.BATCH_NO,
                    rowData.LOCATION_CD
                ]
            }) > -1) {
                continue;
            }

            confirmQty = rowData.PSTOCK_QTY;
            confirmBox = rowData.PSTOCK_BOX;
            confirmEa = rowData.PSTOCK_EA;
            // 예정으로 등록, 수량 체크
            if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
                // 예정 수량만큼 추가되어 있으면 중지
                if (remainQty < 1) {
                    break;
                }

                if (remainQty > confirmQty) {
                    remainQty -= confirmQty;
                } else {
                    confirmQty = remainQty;
                    confirmBox = $NC.getBBox(confirmQty, rowData.QTY_IN_BOX);
                    confirmEa = $NC.getBEa(confirmQty, rowData.QTY_IN_BOX);
                    remainQty = 0;
                }
            }

            // 추가할 데이터
            newRowData = {
                CENTER_CD: rowData.CENTER_CD,
                BU_CD: rowData.BU_CD,
                BRAND_CD: rowData.BRAND_CD,
                BRAND_NM: rowData.BRAND_NM,
                ITEM_CD: rowData.ITEM_CD,
                ITEM_BAR_CD: rowData.ITEM_BAR_CD,
                ITEM_NM: rowData.ITEM_NM,
                ITEM_STATE: rowData.ITEM_STATE,
                ITEM_STATE_F: rowData.ITEM_STATE_F,
                ITEM_SPEC: rowData.ITEM_SPEC,
                ITEM_LOT: rowData.ITEM_LOT,
                QTY_IN_BOX: rowData.QTY_IN_BOX,
                IN_UNIT_DIV_F: rowData.IN_UNIT_DIV_F,
                VALID_DATE: rowData.VALID_DATE,
                BATCH_NO: rowData.BATCH_NO,
                STOCK_DATE: rowData.STOCK_DATE,
                CONFIRM_QTY: confirmQty, // 이동수량
                CONFIRM_BOX: confirmBox,
                CONFIRM_EA: confirmEa,
                ETC_DIV: $ND.C_REASON_ETC_DIV,
                ETC_DIV_F: $NC.getGridComboName(G_GRDSUB, {
                    columnId: "ETC_DIV_F",
                    searchVal: $ND.C_REASON_ETC_DIV,
                    dataCodeField: "COMMON_CD",
                    dataFullNameField: "COMMON_CD_F"
                }),
                ETC_COMMENT: "",
                STOCK_QTY: rowData.STOCK_QTY,
                PSTOCK_QTY: rowData.PSTOCK_QTY,
                PSTOCK_BOX: rowData.PSTOCK_BOX,
                PSTOCK_EA: rowData.PSTOCK_EA,
                OUT_WAIT_QTY: rowData.OUT_WAIT_QTY,
                LOCATION_CD: rowData.LOCATION_CD,
                LINK_LOCATION_CD: $NC.isNull(LOCATION_CD) ? rowData.LOCATION_CD : LOCATION_CD,
                LINK_BU_CD: rowData.BU_CD,
                LINK_BRAND_CD: "",
                LINK_ITEM_CD: "",
                LINK_QTY_IN_BOX: 1,
                LINK_IN_UNIT_DIV_F: "",
                LINK_VALID_DATE: rowData.VALID_DATE,
                LINK_BATCH_NO: rowData.BATCH_NO,
                LINK_DRUG_DIV_D: rowData.DRUG_DIV_D,
                LINK_MEDICATION_DIV_D: rowData.MEDICATION_DIV_D,
                LINK_KEEP_DIV_D: rowData.KEEP_DIV_D,
                LINK_DRUG_CD: rowData.DRUG_CD,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };
            // 예정으로 등록
            if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
                newRowData.ORDER_DATE = refRowData.ORDER_DATE;
                newRowData.ORDER_NO = refRowData.ORDER_NO;
                newRowData.LINE_NO = refRowData.LINE_NO;
                newRowData.ETC_DIV = refRowData.ETC_DIV;
                newRowData.ETC_DIV_F = refRowData.ETC_DIV_F;
                newRowData.ETC_COMMENT = refRowData.ETC_COMMENT;
                newRowData.ORDER_LINE_NO = refRowData.LINE_NO;
                newRowData.LINK_BRAND_CD = refRowData.LINK_BRAND_CD;
                newRowData.LINK_BRAND_NM = refRowData.LINK_BRAND_NM;
                newRowData.LINK_ITEM_CD = refRowData.LINK_ITEM_CD;
                newRowData.LINK_ITEM_BAR_CD = refRowData.LINK_ITEM_BAR_CD;
                newRowData.LINK_ITEM_NM = refRowData.LINK_ITEM_NM;
                newRowData.LINK_ITEM_STATE = refRowData.LINK_ITEM_STATE;
                newRowData.LINK_ITEM_SPEC = refRowData.LINK_ITEM_SPEC;
                newRowData.LINK_ITEM_LOT = refRowData.LINK_ITEM_LOT;
            }
            G_GRDSUB.data.addItem(newRowData);
            addedCount++;
        }
    } finally {
        G_GRDSUB.data.endUpdate();
    }

    // 예정으로 등록
    if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
        grdDetailOnCalc(refRowData);
    }

    // 선택한 행이 모두 이미 지시내역 그리드에 존재할 경우
    if (addedCount == 0) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.009", "선택한 상품은 이미 추가된 재고내역입니다."));
        return;
    }
    $NC.setGridSelectRow(G_GRDSUB, G_GRDSUB.data.getLength() - 1);

    // 수정 상태로 변경
    G_GRDSUB.lastRowModified = true;
}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Save() {

    if (G_GRDSUB.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.010", "저장할 데이터가 없습니다."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.011", "물류센터를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.012", "사업부를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.013", "먼저 입출고구분을 선택하십시오."));
        $NC.setFocus("#cboInout_Cd");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.ETC_DATE)) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.014", "먼저 입출고일자를 입력하십시오."));
        $NC.setFocus("#dtpEtc_Date");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }

    // 예정으로 등록
    if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }

        var checkedData = $NC.getGridCheckedValues(G_GRDSUB, {
            checkColumnId: $ND.C_NULL, // 체크없이 전체
            dataType: "S", // 문자열 결합
            valueColumns: [
                "LINE_NO",
                "LOCATION_CD",
                "VALID_DATE",
                "BATCH_NO",
                "PALLET_ID",
                "STOCK_DATE",
                "CONFIRM_QTY",
                "LINK_LOCATION_CD",
                "ETC_DIV",
                "ETC_COMMENT",
                "LINK_VALID_DATE",
                "LINK_BATCH_NO"
            ],
            isAllData: true
        });

        if (checkedData.checkedCount == 0) {
            alert($NC.getDisplayMsg("JS.LCC02021P0.015", "저장할 지시내역 정보가 없습니다."));
            return;
        }

        $NC.serviceCall("/LCC02020E0/callLCFWStockChangeEntry.do", {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
            P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_AUTO_YN: $ND.C_NO,
            P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave);
    }
    // 신규 등록/수정
    else {
        // 지시내역 그리드 저장
        var dsD = [];
        var dsC = [];
        var dsSub, rowData;
        var dsTarget = G_GRDSUB.data.getItems();
        for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
            rowData = dsTarget[rIndex];
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            }
            if (!validateSubData(rIndex, rowData)) {
                return;
            }
            if (rowData.CRUD == $ND.C_DV_CRUD_D) {
                dsSub = dsD;
            } else {
                dsSub = dsC;
            }

            dsSub.push({
                P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
                P_BU_CD: $NC.G_VAR.masterData.BU_CD,
                P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
                P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
                P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
                P_REMARK1: $NC.G_VAR.masterData.REMARK1,
                P_LINE_NO: rowData.LINE_NO,
                P_ETC_DIV: rowData.ETC_DIV,
                P_ETC_COMMENT: $NC.isNull(rowData.ETC_COMMENT) ? "" : rowData.ETC_COMMENT,
                P_LOCATION_CD: rowData.LOCATION_CD,
                P_BRAND_CD: rowData.BRAND_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_ITEM_STATE: rowData.ITEM_STATE,
                P_ITEM_LOT: rowData.ITEM_LOT,
                P_VALID_DATE: $NC.isNull(rowData.VALID_DATE) ? "" : rowData.VALID_DATE,
                P_BATCH_NO: $NC.isNull(rowData.BATCH_NO) ? "" : rowData.BATCH_NO,
                P_STOCK_DATE: $NC.isNull(rowData.STOCK_DATE) ? "" : rowData.STOCK_DATE,
                P_CONFIRM_QTY: rowData.CONFIRM_QTY,
                P_LINK_BRAND_CD: rowData.LINK_BRAND_CD,
                P_LINK_ITEM_CD: rowData.LINK_ITEM_CD,
                P_LINK_ITEM_STATE: rowData.LINK_ITEM_STATE,
                P_LINK_ITEM_LOT: rowData.LINK_ITEM_LOT,
                P_LINK_CONFIRM_QTY: rowData.CONFIRM_QTY,
                P_LINK_LOCATION_CD: rowData.LINK_LOCATION_CD,
                P_LINK_VALID_DATE: rowData.LINK_VALID_DATE,
                P_LINK_BATCH_NO: rowData.LINK_BATCH_NO,
                P_LINK_CENTER_CD: rowData.LINK_CENTER_CD, // 삭제시에 사용
                P_LINK_BU_CD: rowData.LINK_BU_CD, // 삭제시에 사용
                P_LINK_ETC_DATE: rowData.LINK_ETC_DATE, // 삭제시에 사용
                P_LINK_ETC_NO: rowData.LINK_ETC_NO, // 삭제시에 사용
                P_LINK_LINE_NO: rowData.LINK_LINE_NO, // 삭제시에 사용
                P_CRUD: rowData.CRUD
            });
        }
        // 에러방지 위해, 신규 + 삭제 순으로 DS 구성
        dsSub = dsC.concat(dsD);

        if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_C) {
            if (dsSub.length == 0) {
                alert($NC.getDisplayMsg("JS.LCC02021P0.015", "저장할 지시내역 정보가 없습니다."));
                return;
            }
        } else {
            if ($NC.G_VAR.masterData.CRUD != $ND.C_DV_CRUD_U && dsSub.length == 0) {
                alert($NC.getDisplayMsg("JS.LCC02021P0.016", "수정 후 저장하십시오."));
                return;
            }
        }

        $NC.serviceCall("/LCC02020E0/save.do", {
            P_DS_MASTER: {
                P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
                P_BU_CD: $NC.G_VAR.masterData.BU_CD,
                P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
                P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
                P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
                P_REMARK1: $NC.G_VAR.masterData.REMARK1,
                P_CRUD: $NC.G_VAR.masterData.CRUD
            },
            P_DS_SUB: dsSub,
            P_PROCESS_CD: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave);
    }

}

/**
 * 삭제 버튼 클릭 이벤트 처리(지시내역 그리드 행 삭제)
 */
function _Delete() {

    if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.017", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제, 그외 CRUD를 "D"로 변경
    $NC.deleteGridRowData(G_GRDSUB, rowData, true);

    // 예정으로 등록
    if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
        // 예정 등록수량 조정
        grdDetailOnCalc();
    }

    if (G_GRDSUB.data.getLength() == 0 && $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {
        $NC.setEnableGroup("#divStockCondition");
        $NC.setEnable("#cboInout_Cd");
        $NC.setEnable("#edtLocation_Cd");
        $NC.setEnable("#btnLocation");
        $NC.setEnable("#cboConvert_Item_State");
    }
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

    switch (args.col) {
        case "LOCATION_CD":
            $NP.onLocationChange(args.val, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: args.val,
                P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, onLocationPopup);
            return;
        case "ETC_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LCC02021P0.018", "입출고일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.ETC_DATE = $NC.getValue("#dtpEtc_Date");
            break;
        case "INOUT_CD":
            $NC.G_VAR.masterData.INOUT_CD = args.val;
            break;
        case "REMARK1":
            $NC.G_VAR.masterData.REMARK1 = args.val;
            break;
        default:
            // 마스터 데이터 변경이 아닐 경우는 CRUD 변경하지 않기 위해 RETURN
            return;
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
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
        id: "ETC_DIV_F",
        field: "ETC_DIV_F",
        name: "사유구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "ETC_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_ATTR04_CD: $ND.C_YES, // Y - 상품변환사유여부
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "ETC_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "ETC_COMMENT",
        field: "ETC_COMMENT",
        name: "사유내역",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드(상품정보) 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LCC02020E0.RS_SUB1",
        sortCol: "LINE_NO",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * 상단 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAIL.data.getItem(row);

    // 에디터 값 세팅
    grdDetailOnInputValue(rowData);

    // 예정으로 등록일 경우
    if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
        $NC.clearGridData(G_GRDSTOCK);
        $NC.setGridFilterValue(G_GRDSUB, rowData.LINE_NO);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 현재고 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

    var rowData = args.item, rIndex, rCount, subData, //
    columnId = G_GRDDETAIL.view.getColumnId(args.cell);
    switch (columnId) {
        case "ETC_DIV_F":
        case "ETC_COMMENT":
            for (rIndex = 0, rCount = G_GRDSUB.data.getLength(); rIndex < rCount; rIndex++) {
                subData = G_GRDSUB.data.getItem(rIndex);
                subData[columnId] = rowData[columnId];
                subData.ETC_DIV = rowData.ETC_DIV;
                $NC.setGridApplyChange(G_GRDSUB, subData);
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

/**
 * 지시내역 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row)) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if (rowData.ORDER_QTY < rowData.ENTRY_QTY) {
            alert($NC.getDisplayMsg("JS.LCC02021P0.019", "등록수량이 예정수량보다 클 수 없습니다."));
            $NC.setGridSelectRow(G_GRDDETAIL, row);
            $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, "CONFIRM_QTY", true);
            return false;
        }
    }
    if ($NC.isNull(rowData.ETC_DIV)) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.020", "사유구분을 선택하십시오."));
        $NC.setFocusGrid(G_GRDDETAIL, row, "ETC_DIV_F", true);
        return false;
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

function grdDetailOnCalc(rowData) {

    if ($NC.isNull(rowData)) {
        rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    }

    // 예정상세 등록수량 반영
    // 변환수량 합계
    var totConfirmQty = $NC.getGridSumVal(G_GRDSUB, {
        compareFn: function(subRowData) {
            // 현재 라인 SUM, 필터 처리되어 보이는 데이터 모두
            return true;
        },
        sumKey: "CONFIRM_QTY"
    });

    rowData.ENTRY_QTY = totConfirmQty;
    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtQBrand_Cd", rowData["BRAND_CD"]);
    $NC.setValue("#edtQBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtQItem_Cd", rowData["ITEM_CD"]);
    $NC.setValue("#edtQItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#cboQItem_State", rowData["ITEM_STATE"]);
    $NC.setValue("#edtQItem_Lot", rowData["ITEM_LOT"]);
}

function grdStockOnGetColumns() {

    var columns = [];
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
        id: "FLOCATION_CD",
        field: "FLOCATION_CD",
        name: "고정로케이션",
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
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_BOX",
        field: "PSTOCK_BOX",
        name: "가용재고BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_EA",
        field: "PSTOCK_EA",
        name: "가용재고EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
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

function grdStockOnSetColumns() {

    // 숨김컬럼 세팅
    $NC.setGridColumns(G_GRDSTOCK, [
        // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : "",
        // 예정 데이터의 경우
        $NC.G_VAR.ORDER_YN == $ND.C_YES ? "ITEM_CD,ITEM_BAR_CD,ITEM_NM,ITEM_SPEC,BRAND_NM,ITEM_STATE_F,FLOCATION_CD,ITEM_LOT,QTY_IN_BOX" : ""
    ]);
}

/**
 * 상단그리드(상품정보) 초기값 설정
 */
function grdStockInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdStock", {
        columns: grdStockOnGetColumns(),
        queryId: "LCC02020E0.RS_SUB1",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDSTOCK.view.onSelectedRowsChanged.subscribe(grdStockOnAfterScroll);
    G_GRDSTOCK.view.onHeaderClick.subscribe(grdStockOnHeaderClick);
    G_GRDSTOCK.view.onClick.subscribe(grdStockOnClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDSTOCK, "CHECK_YN");
}

/**
 * 상단 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdStockOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSTOCK, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSTOCK, row + 1);
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

/**
 * 상단 그리드의 행 체크 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdStockOnClick(e, args) {

    var columnId = G_GRDSTOCK.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDSTOCK, e, args);
            break;
    }
}

function grdSubOnGetColumns() {

    var columns = [];
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
        id: "LINK_ITEM_CD",
        field: "LINK_ITEM_CD",
        name: "변환상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdSubOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_BAR_CD",
        field: "LINK_ITEM_BAR_CD",
        name: "변환상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_NM",
        field: "LINK_ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_SPEC",
        field: "LINK_ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_BRAND_NM",
        field: "LINK_BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_LOT",
        field: "LINK_ITEM_LOT",
        name: "LOT번호",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumn(columns, {
        id: "LINK_VALID_DATE",
        field: "LINK_VALID_DATE",
        name: "변환사용기한",
        editor: Slick.Editors.Date,
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_BATCH_NO",
        field: "LINK_BATCH_NO",
        name: "변환제조배치",
        editor: Slick.Editors.Text,
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_QTY_IN_BOX",
        field: "LINK_QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_IN_UNIT_DIV_F",
        field: "LINK_IN_UNIT_DIV_F",
        name: "입고단위"
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
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_BOX",
        field: "PSTOCK_BOX",
        name: "가용재고BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_EA",
        field: "PSTOCK_EA",
        name: "가용재고EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "변환수량",
        cssClass: "styRight",
        // 기본 editorOptions 자동 지정이 아닌 임의 지정
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions({
            formatterType: "FLOAT_QTY",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "변환BOX",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "변환EA",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "LINK_LOCATION_CD",
        field: "LINK_LOCATION_CD",
        name: "이동로케이션",
        cssClass: "styCenter",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdSubOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ETC_DIV_F",
        field: "ETC_DIV_F",
        name: "사유구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "ETC_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_ATTR04_CD: $ND.C_YES, // Y - 상품변환사유여부
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "ETC_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "ETC_COMMENT",
        field: "ETC_COMMENT",
        name: "사유내역",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "재고로케이션",
        cssClass: "styCenter"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
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
        id: "LINK_DRUG_DIV_D",
        field: "LINK_DRUG_DIV_D",
        name: "변환상품 약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_MEDICATION_DIV_D",
        field: "LINK_MEDICATION_DIV_D",
        name: "변환상품 투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_KEEP_DIV_D",
        field: "LINK_KEEP_DIV_D",
        name: "변환상품 보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_DRUG_CD",
        field: "LINK_DRUG_CD",
        name: "변환상품 보험코드"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubOnSetColumns() {

    // 숨김컬럼 세팅
    $NC.setGridColumns(G_GRDSUB, [
        // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
        $NC.G_VAR.policyVal.LS210 != "2" ? "LINK_VALID_DATE,LINK_BATCH_NO,VALID_DATE,BATCH_NO" : "",
        // 사유구분 -> 예정 상태가 아닌 경우만 enable
        $NC.G_VAR.ORDER_YN == $ND.C_YES ? "ETC_DIV_F,ETC_COMMENT" : ""
    ]);
}

/**
 * 현재고 데이터 그리드 초기값 설정
 */
function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 5
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LCC02020E0.RS_T1_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options,
        canExportExcel: false,
        onFilter: grdSubOnFilter
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
    G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

/**
 * 현재고 데이터 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

/**
 * 현재고 데이터 그리드 편집 불가 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSubOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규일 경우 모두 수정 가능, 그외 아래 컬럼만 수정 가능
    if (rowData.CRUD == $ND.C_DV_CRUD_R || rowData.CRUD == $ND.C_DV_CRUD_U) {
        switch (args.column.id) {
            case "ETC_DIV_F":
            case "ETC_COMMENT":
                return true;
            default:
                return false;
        }
    }

    // 예정 데이터의 경우 변환 항목 변경되지 않도록 함
    if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
        switch (args.column.id) {
            case "LINK_ITEM_CD":
            case "LINK_ITEM_LOT":
                return false;
        }
    }

    return true;
}

/**
 * 현재고 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

    var rowData = args.item;
    var columnId = G_GRDSUB.view.getColumnId(args.cell);

    switch (G_GRDSUB.view.getColumnId(args.cell)) {
        case "CONFIRM_QTY":
        case "CONFIRM_BOX":
        case "CONFIRM_EA":
            // columnId = G_GRDSUB.view.getColumnId(args.cell);
            switch (columnId) {
                case "CONFIRM_BOX":
                case "CONFIRM_EA":
                    rowData.CONFIRM_QTY = $NC.getBQty(rowData.CONFIRM_BOX, rowData.CONFIRM_EA, rowData.QTY_IN_BOX);
                    break;
            }

            rowData.CONFIRM_BOX = $NC.getBBox(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);
            rowData.CONFIRM_EA = $NC.getBEa(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);

            // 예정의 등록
            if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
                // 예정등록수량 조정
                grdDetailOnCalc();
            }
            break;
        case "LINK_LOCATION_CD":
            $NP.onLocationChange(rowData.LINK_LOCATION_CD, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: rowData.LINK_LOCATION_CD,
                P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, grdSubOnLocationPopup);
            return;
        case "LINK_ITEM_CD":
            $NP.onItemChange(rowData.LINK_ITEM_CD, {
                P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
                P_ITEM_CD: rowData.LINK_ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdSubOnItemPopup);
            return;
        case "LINK_VALID_DATE":
            var focusCol;
            if ($NC.isNotNull(rowData.LINK_VALID_DATE)) {
                if (!$NC.isDate(rowData.LINK_VALID_DATE)) {
                    alert($NC.getDisplayMsg("JS.LCC02021P0.021", "사용기한을 정확히 입력하십시오."));
                    rowData.LINK_VALID_DATE = "";
                    focusCol = G_GRDSUB.view.getColumnIndex("LINK_VALID_DATE");
                } else {
                    rowData.LINK_VALID_DATE = $NC.getDate(rowData.LINK_VALID_DATE);
                    focusCol = G_GRDSUB.view.getColumnIndex("LINK_BATCH_NO");
                }
                $NC.setFocusGrid(G_GRDSUB, args.row, focusCol, true);
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);
}

/**
 * grdSub 데이터(지시 데이터) 필터링 이벤트
 */
function grdSubOnFilter(item) {

    // 예정으로 등록
    if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
        return item.CRUD != $ND.C_DV_CRUD_D && item.ORDER_LINE_NO == G_GRDSUB.lastFilterVal;
    }
    // 신규 등록/수정일 경우
    else {
        return item.CRUD != $ND.C_DV_CRUD_D;
    }
}

/**
 * 지시내역 그리드 입력 체크
 */
function grdSubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUB, row)) {
        return true;
    }

    var rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if (!validateSubData(row, rowData)) {
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUB, rowData);
    return true;
}

/**
 * 그리드의 존구분의 검색 버튼 클릭시 로케이션 검색 창 표시
 */
function grdSubOnPopup(e, args) {

    switch (args.column.id) {
        case "LINK_LOCATION_CD":
            $NP.showLocationPopup({
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: $ND.C_ALL,
                P_ZONE_DIV_ATTR01_CD: "1", // 1 - 일반, 2- 유통가공, 3 - 보세
                P_INOUT_DIV: "1",
                P_LOC_DIV_ATTR03_CD: [
                    "10", // 일반셀
                    "20" // 고정셀
                ].join($ND.C_SEP_DATA)
            }, grdSubOnLocationPopup, function() {
                $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, "LINK_LOCATION_CD", true, true);
            });
            return;
        case "LINK_ITEM_CD":
            $NP.showItemPopup({
                P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
                P_ITEM_CD: $ND.C_ALL,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdSubOnItemPopup, function() {
                $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, "LINK_ITEM_CD", true, true);
            });
            return;
    }
}

/**
 * 지시내역 그리드의 로케이션 검색 팝업창에서 행 클릭 혹은 취소 했을 경우 처리
 * 
 * @param resultInfo
 */

function grdSubOnLocationPopup(resultInfo) {

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.LINK_LOCATION_CD = resultInfo.LOCATION_CD;

        focusCol = G_GRDSUB.view.getColumnIndex("ETC_DIV_F");
        if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
            focusCol = G_GRDSUB.view.getColumnIndex("LINK_LOCATION_CD");
        }
    } else {
        rowData.LINK_LOCATION_CD = "";

        focusCol = G_GRDSUB.view.getColumnIndex("LINK_LOCATION_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);

    $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, focusCol, true, true);
}

/**
 * (그리드) 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function grdSubOnItemPopup(resultInfo) {

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.LINK_ITEM_CD = resultInfo.ITEM_CD;
        rowData.LINK_ITEM_BAR_CD = resultInfo.ITEM_BAR_CD;
        rowData.LINK_ITEM_NM = resultInfo.ITEM_NM;
        rowData.LINK_ITEM_SPEC = resultInfo.ITEM_SPEC;
        rowData.LINK_QTY_IN_BOX = resultInfo.QTY_IN_BOX;
        rowData.LINK_IN_UNIT_DIV_F = resultInfo.IN_UNIT_DIV_F;
        rowData.LINK_BRAND_CD = resultInfo.BRAND_CD;
        rowData.LINK_BRAND_NM = resultInfo.BRAND_NM;
        rowData.LINK_DRUG_DIV_D = resultInfo.DRUG_DIV_D;
        rowData.LINK_MEDICATION_DIV_D = resultInfo.MEDICATION_DIV_D;
        rowData.LINK_KEEP_DIV_D = resultInfo.KEEP_DIV_D;
        rowData.LINK_DRUG_CD = resultInfo.DRUG_CD;

        focusCol = G_GRDSUB.view.getColumnIndex("CONFIRM_QTY");
    } else {
        rowData.LINK_ITEM_CD = "";
        rowData.LINK_ITEM_BAR_CD = "";
        rowData.LINK_ITEM_NM = "";
        rowData.LINK_ITEM_SPEC = "";
        rowData.LINK_QTY_IN_BOX = "1";
        rowData.LINK_IN_UNIT_DIV_F = "";
        rowData.LINK_BRAND_CD = "";
        rowData.LINK_BRAND_NM = "";
        rowData.LINK_DRUG_DIV_D = "";
        rowData.LINK_MEDICATION_DIV_D = "";
        rowData.LINK_KEEP_DIV_D = "";
        rowData.LINK_DRUG_CD = "";

        focusCol = G_GRDSUB.view.getColumnIndex("LINK_ITEM_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);

    $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, focusCol, true, true);
}

function validateSubData(row, rowData) {

    if ($NC.isNull(rowData.CONFIRM_QTY) || Number(rowData.CONFIRM_QTY) <= 0) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.022", "변환수량에 0보다 큰 수량을 입력하십시오."));
        $NC.setFocusGrid(G_GRDSUB, row, "CONFIRM_QTY", true);
        return false;
    }

    if (rowData.CRUD == $ND.C_DV_CRUD_C) {
        // 예정으로 등록
        if ($NC.G_VAR.ORDER_YN == $ND.C_YES) {
            // 기등록 체크
            var totConfirmQty = $NC.getGridSumVal(G_GRDSUB, {
                searchKey: [
                    "BRAND_CD",
                    "ITEM_CD",
                    "ITEM_STATE",
                    "ITEM_LOT",
                    "VALID_DATE",
                    "BATCH_NO",
                    "LOCATION_CD"
                ],
                searchVal: [
                    rowData.BRAND_CD,
                    rowData.ITEM_CD,
                    rowData.ITEM_STATE,
                    rowData.ITEM_LOT,
                    rowData.VALID_DATE,
                    rowData.BATCH_NO,
                    rowData.LOCATION_CD
                ],
                sumKey: "CONFIRM_QTY",
                isAllData: true
            });
            if (rowData.PSTOCK_QTY < totConfirmQty) {
                alert($NC.getDisplayMsg("JS.LCC02021P0.023", "재고수량 보다 많은 수량을 입력하실 수 없습니다."));
                $NC.setFocusGrid(G_GRDSUB, row, "CONFIRM_QTY", true);
                return false;
            }
        }
        // 신규 등록/수정
        else {
            if (Number(rowData.PSTOCK_QTY) < Number(rowData.CONFIRM_QTY)) {
                alert($NC.getDisplayMsg("JS.LCC02021P0.023", "재고수량 보다 많은 수량을 입력하실 수 없습니다."));
                $NC.setFocusGrid(G_GRDSUB, row, "CONFIRM_QTY", true);
                return false;
            }
        }

        if ($NC.isNull(rowData.LINK_ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.LCC02021P0.024", "변환상품을 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUB, row, "LINK_ITEM_CD", true);
            return false;
        }

        if ($NC.isNull(rowData.LINK_LOCATION_CD)) {
            alert($NC.getDisplayMsg("JS.LCC02021P0.025", "이동로케이션을 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUB, row, "LINK_LOCATION_CD", true);
            return false;
        }

        if ($NC.isNull(rowData.LINK_ITEM_LOT)) {
            alert($NC.getDisplayMsg("JS.LCC02021P0.026", "변환상품의 LOT번호를 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUB, row, "LINK_ITEM_LOT", true);
            return false;
        }
    }

    if ($NC.isNull(rowData.ETC_DIV)) {
        alert($NC.getDisplayMsg("JS.LCC02021P0.020", "사유구분을 선택하십시오."));
        $NC.setFocusGrid(G_GRDDETAIL, row, "ETC_DIV_F", true);
        return false;
    }
    return true;
}

/**
 * 현재고 검색후 처리
 * 
 * @param ajaxData
 */
function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDSTOCK, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSTOCK, [
        "BRAND_CD",
        "ITEM_CD",
        "ITEM_STATE",
        "ITEM_LOT",
        "VALID_DATE",
        "BATCH_NO",
        "LOCATION_CD"
    ]);
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

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD
    }, function() {
        // 컬럼 표시 조정
        grdStockOnSetColumns();
        grdSubOnSetColumns();

        // 재고 관리 기준 : 1 - 입고일자별 관리
        if ($NC.G_VAR.policyVal.LS210 == "1") {
            $NC.setVisible("#tdQDsp_Valid_Date", false);
            $NC.setVisible("#tdQDsp_Batch_No", false);
        }
    });
}

/**
 * 현재고 검색의 로케이션 검색 이미지 클릭
 */
function showQLocationPopup() {

    $NP.showLocationPopup({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: $ND.C_ALL,
        P_ZONE_DIV_ATTR01_CD: "1", // 1 - 일반, 2- 유통가공, 3 - 보세
        P_INOUT_DIV: "2",
        P_LOC_DIV_ATTR03_CD: [
            "10", // 일반셀
            "20" // 고정셀
        ].join($ND.C_SEP_DATA)
    }, onQLocationPopup, function() {
        $NC.setFocus("#edtQZone_Cd", true);
    });
}

/**
 * 현재고 검색의 로케이션 검색 팝업창에서 행 클릭 했을 경우 처리
 * 
 * @param resultInfo
 */
function onQLocationPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQZone_Cd", resultInfo.ZONE_CD);
        $NC.setValue("#edtQZone_Nm", resultInfo.ZONE_NM);
        $NC.setValue("#edtQBank_Cd", resultInfo.BANK_CD);
        $NC.setValue("#edtQBay_Cd", resultInfo.BAY_CD);
        $NC.setValue("#edtQLev_Cd", resultInfo.LEV_CD);
    } else {
        $NC.setValue("#edtQZone_Cd");
        $NC.setValue("#edtQZone_Nm");
        $NC.setFocus("#edtQZone_Cd", true);
    }
}

/**
 * 기타입고 지시내역의 로케이션 검색 이미지 클릭
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
        P_INOUT_DIV: "1",
        P_LOC_DIV_ATTR03_CD: [
            "10", // 일반셀
            "20" // 고정셀
        ].join($ND.C_SEP_DATA)
    }, onLocationPopup, function() {
        $NC.setFocus("#edtLocation_Cd", true);
    });
}

/**
 * 로케이션 검색 팝업창에서 행 클릭 했을 경우 처리
 * 
 * @param resultInfo
 */
function onLocationPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtLocation_Cd", resultInfo.LOCATION_CD);
    } else {
        $NC.setValue("#edtLocation_Cd");
        $NC.setFocus("#edtLocation_Cd", true);
    }
}

/**
 * 상품 검색 팝업 표시
 */
function showQItemPopup() {

    $NP.showItemPopup({
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        P_ITEM_CD: $ND.C_ALL,
        P_VIEW_DIV: "2",
        P_DEPART_CD: $ND.C_ALL,
        P_LINE_CD: $ND.C_ALL,
        P_CLASS_CD: $ND.C_ALL
    }, onQItemPopup, function() {
        $NC.setFocus("#edtQItem_Cd", true);
    });
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onQItemPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
        $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
    } else {
        $NC.setValue("#edtQItem_Cd");
        $NC.setValue("#edtQItem_Nm");
        $NC.setFocus("#edtQItem_Cd", true);
    }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtBu_Cd");

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
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");

}

function grdSubOnCalc(rowData, changedColumnId) {

    switch (changedColumnId) {
        case "CONFIRM_BOX":
        case "CONFIRM_EA":
            rowData.CONFIRM_QTY = $NC.getBQty(rowData.CONFIRM_BOX, rowData.CONFIRM_EA, rowData.QTY_IN_BOX);
            break;
    }

    rowData.CONFIRM_BOX = $NC.getBBox(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);
    rowData.CONFIRM_EA = $NC.getBEa(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);

    return rowData;
}