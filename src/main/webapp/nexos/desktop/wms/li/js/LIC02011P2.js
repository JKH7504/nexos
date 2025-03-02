/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LIC02011P2(의약)
 *  프로그램명         : 입고등록 팝업
 *  프로그램설명       : 입고등록 팝업 화면 Javascript
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
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdDetail"
            },
            viewSecond: {
                container: "#divRightView",
                grids: "#grdSub"
            },
            viewType: "h",
            viewFixed: {
                container: "viewSecond",
                size: 300
            }
        },
        // 예정이 존재하는 데이터인지...
        ORDER_YN: $ND.C_NO,
        // 마스터 데이터
        masterData: null,
        // 상품 분할 등록 시 디테일과 디테일상세의 키 값 구하기 위한 변수
        maxRowId: 0
    });

    // ================================================================================================================
    // $NC.G_VAR.G_PARAMETER.P_PROCESS_CD
    // N: 신규 등록
    // BP: 등록 수정
    // A : 예정으로 등록
    // ================================================================================================================

    $NC.setInitDatePicker("#dtpInbound_Date");
    $NC.setInitDatePicker("#dtpValid_Date");

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel);
    $("#btnVendor_Cd").click(showVendorPopup);

    $("#btnEntryNew").click(_New);
    $("#btnEntryDelete").click(_Delete);
    $("#btnEntrySave").click(_Save);
    $("#btnSubDelete").click(btnSubDeleteOnClick);
    $("#edtEntry_Qty").keydown(edtEntryQtyOnKeyDown);

    // 그리드 초기화
    grdDetailInitialize();
    grdSubInitialize();

    // 신규/삭제/저장 버튼 툴팁 세팅
    $NC.setTooltip("#btnEntryNew", $NC.getDisplayMsg("JS.LIC02011P2.001", "신규"));
    $NC.setTooltip("#btnEntryDelete", $NC.getDisplayMsg("JS.LIC02011P2.002", "삭제"));
    $NC.setTooltip("#btnEntrySave", $NC.getDisplayMsg("JS.LIC02011P2.003", "저장"));
    $NC.setTooltip("#btnSubDelete", $NC.getDisplayMsg("JS.LIC02011P2.002", "삭제"));
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    // [LS220]파렛트ID 사용 기준 : 1 - 파렛트ID 사용 안함
    // [LS220]파렛트ID 사용 기준 : 2 - 파렛트ID 사용 함
    // [LI230]파렛트ID 매핑 기준 : 1 - 파렛트 분할구분별 자동매핑(단일상품)
    // [LI230]파렛트ID 매핑 기준 : 2 - 파렛트 분할구분별 자동매핑(멀티상품)
    // [LI230]파렛트ID 매핑 기준 : 3 - 사용자 수작업 매핑(멀티상품)
    if ($NC.G_VAR.G_PARAMETER.P_POLICY_LS220 == "2" && $NC.G_VAR.G_PARAMETER.P_POLICY_LI230 == "3") {
        $("#lblPallet_Id_Cnt").show();
        $("#edtPallet_Id_Cnt").show();
    }

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtCenter_Cd", $NC.G_VAR.G_PARAMETER.P_CENTER_CD);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);
    $NC.setValue("#edtCust_Cd", $NC.G_VAR.G_PARAMETER.P_CUST_CD);

    var INBOUND_DATE;
    // 신규 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {

        INBOUND_DATE = $NC.getValue("#dtpInbound_Date");
        // var INOUT_CD = $NC.getValue("#cboInout_Cd");
        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            INBOUND_DATE: INBOUND_DATE,
            INBOUND_NO: "",
            INOUT_CD: "",// INOUT_CD,
            INBOUND_STATE: $ND.C_STATE_ENTRY,
            CUST_CD: $NC.G_VAR.G_PARAMETER.P_CUST_CD,
            VENDOR_CD: "",
            IN_CAR_DIV: "",
            CAR_NO: "",
            PLANED_DATETIME: "",
            DIRECT_YN: "",
            PALLET_ID_CNT: "",
            OLD_PALLET_ID_CNT: "",
            DATA_DIV: "00",
            REMARK1: "",
            ORDER_DATE: "",
            ORDER_NO: "",
            CRUD: $ND.C_DV_CRUD_C
        };

        $NC.setFocus("#edtVendor_Cd");

        setInputValue("#grdSub");
    }
    // 예정 -> 등록, 등록 수정
    else {

        var INBOUND_NO;
        var INBOUND_STATE;
        var CRUD;
        var dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
        if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
            INBOUND_DATE = $NC.getValue("#dtpInbound_Date");
            INBOUND_NO = "";
            INBOUND_STATE = $ND.C_STATE_ENTRY;
            CRUD = $ND.C_DV_CRUD_C;
        } else {
            INBOUND_DATE = dsMaster.INBOUND_DATE;
            INBOUND_NO = dsMaster.INBOUND_NO;
            INBOUND_STATE = null;// dsMaster.INBOUND_STATE;
            CRUD = $ND.C_DV_CRUD_R;
            $NC.setValue("#dtpInbound_Date", INBOUND_DATE);
            $NC.setValue("#edtInbound_No", INBOUND_NO);
        }

        // 마스터 데이터 세팅
        $NC.setValue("#edtVendor_Cd", dsMaster.VENDOR_CD);
        $NC.setValue("#edtVendor_Nm", dsMaster.VENDOR_NM);
        // $NC.setValue("#cboInout_Cd", dsMaster.INOUT_CD);
        $NC.setValue("#edtCar_No", dsMaster.CAR_NO);
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);
        $NC.setValue("#edtPallet_Id_Cnt", dsMaster.PALLET_ID_CNT);

        $NC.setValue("#edtOrder_Date", dsMaster.ORDER_DATE);
        $NC.setValue("#edtOrder_No", dsMaster.ORDER_NO);
        $NC.setValue("#edtBu_Date", dsMaster.BU_DATE);
        $NC.setValue("#edtBu_No", dsMaster.BU_NO);

        $NC.G_VAR.masterData = {
            CENTER_CD: dsMaster.CENTER_CD,
            BU_CD: dsMaster.BU_CD,
            INBOUND_DATE: INBOUND_DATE,
            INBOUND_NO: INBOUND_NO,
            INOUT_CD: dsMaster.INOUT_CD,
            INBOUND_STATE: INBOUND_STATE,
            CUST_CD: dsMaster.CUST_CD,
            VENDOR_CD: dsMaster.VENDOR_CD,
            IN_CAR_DIV: dsMaster.IN_CAR_DIV,
            CAR_NO: dsMaster.CAR_NO,
            PLANED_DATETIME: dsMaster.PLANED_DATETIME,
            DIRECT_YN: dsMaster.DIRECT_YN,
            PALLET_ID_CNT: dsMaster.PALLET_ID_CNT,
            OLD_PALLET_ID_CNT: dsMaster.PALLET_ID_CNT,
            DATA_DIV: dsMaster.DATA_DIV,
            REMARK1: dsMaster.REMARK1,
            ORDER_DATE: dsMaster.ORDER_DATE,
            ORDER_NO: dsMaster.ORDER_NO,
            CRUD: CRUD
        };

        // 디테일 데이터 세팅
        var dsDetail = $NC.G_VAR.G_PARAMETER.P_DETAIL_DS;
        var rowData, newRowData, REMAIN_QTY;
        G_GRDDETAIL.data.beginUpdate();
        try {
            for (var rIndex = 0, rCount = dsDetail.length; rIndex < rCount; rIndex++) {
                rowData = $.extend({}, dsDetail[rIndex]);
                $NC.G_VAR.maxRowId = rowData.MAX_ROW_ID;
                REMAIN_QTY = Number(rowData.REMAIN_QTY);
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
                    if (REMAIN_QTY < 1) {
                        continue;
                    }
                    rowData.INBOUND_DATE = INBOUND_DATE;
                    rowData.INBOUND_NO = INBOUND_NO;
                    rowData.INBOUND_STATE = INBOUND_STATE;
                    rowData.LINE_NO = "";
                    rowData.ORDER_QTY = REMAIN_QTY;
                    rowData.ENTRY_QTY = 0;
                    rowData.CONFIRM_QTY = 0;
                    rowData.PUTAWAY_QTY = 0;
                } else {
                    rowData.INBOUND_STATE = null;
                }

                newRowData = {
                    CENTER_CD: rowData.CENTER_CD,
                    BU_CD: rowData.BU_CD,
                    INBOUND_DATE: rowData.INBOUND_DATE,
                    INBOUND_NO: rowData.INBOUND_NO,
                    LINE_NO: rowData.LINE_NO,
                    INBOUND_STATE: rowData.INBOUND_STATE,
                    BRAND_CD: rowData.BRAND_CD,
                    BRAND_NM: rowData.BRAND_NM,
                    ITEM_CD: rowData.ITEM_CD,
                    ITEM_NM: rowData.ITEM_NM,
                    ITEM_SPEC: rowData.ITEM_SPEC,
                    ITEM_STATE: rowData.ITEM_STATE,
                    ITEM_STATE_F: rowData.ITEM_STATE_F,
                    FLOCATION_CD: rowData.FLOCATION_CD,
                    ITEM_LOT: rowData.ITEM_LOT,
                    QTY_IN_BOX: rowData.QTY_IN_BOX,
                    VALID_DATE: rowData.VALID_DATE,
                    BATCH_NO: rowData.BATCH_NO,
                    ORG_ORDER_QTY: rowData.ORG_ORDER_QTY,
                    ORDER_QTY: rowData.ORDER_QTY,
                    ENTRY_QTY: rowData.ENTRY_QTY,
                    ENTRY_BOX: rowData.ENTRY_BOX,
                    ENTRY_EA: rowData.ENTRY_EA,
                    CONFIRM_QTY: rowData.CONFIRM_QTY,
                    PUTAWAY_QTY: rowData.PUTAWAY_QTY,
                    REMAIN_QTY: rowData.REMAIN_QTY,
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
                    DRUG_CAUTION: rowData.DRUG_CAUTION,
                    DRUG_CD: rowData.DRUG_CD,
                    ORDER_DATE: rowData.ORDER_DATE,
                    ORDER_NO: rowData.ORDER_NO,
                    ORDER_LINE_NO: rowData.ORDER_LINE_NO,
                    BU_DATE: dsMaster.BU_DATE,
                    BU_NO: dsMaster.BU_NO,
                    BU_LINE_NO: rowData.BU_LINE_NO,
                    BU_KEY: rowData.BU_KEY,
                    BU_DATETIME: rowData.BU_DATETIME,
                    REMARK1: rowData.REMARK1,
                    SPARE1_NOTE: rowData.SPARE1_NOTE,
                    SPARE2_NOTE: rowData.SPARE2_NOTE,
                    SPARE3_NOTE: rowData.SPARE3_NOTE,
                    SPARE4_NOTE: rowData.SPARE4_NOTE,
                    SPARE5_NOTE: rowData.SPARE5_NOTE,
                    ROW_ID: rowData.ROW_ID,
                    id: $NC.getGridNewRowId(),
                    CRUD: CRUD
                };

                // 등록BOX/EA중량/금액 계산
                newRowData = grdDetailOnCalc(newRowData);
                G_GRDDETAIL.data.addItem(newRowData);
            }
        } finally {
            G_GRDDETAIL.data.endUpdate();
        }

        // 예정으로 등록/ 등록수정
        $NC.setEnable("#cboInout_Cd", false);
        $NC.setEnable("#edtVendor_Cd", false);
        $NC.setEnable("#btnVendor_Cd", false);
        // $NC.setEnable("#edtPallet_Id_Cnt", false);
        // 예정으로 등록
        if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
        }
        // 등록수정
        else if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_UPDATE) {
            $NC.setEnable("#dtpInbound_Date", false);
        }

        setPalletIdCnt();

        $NC.G_VAR.ORDER_YN = $NC.isNotNull($NC.getValue("#edtOrder_No")) ? $ND.C_YES : $ND.C_NO;
        $NC.setFocus("#edtCar_No");

        // 파라메터 세팅
        G_GRDSUB.queryParams = {
            P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            P_INBOUND_DATE: INBOUND_DATE,
            P_INBOUND_NO: INBOUND_NO
        };
        // 데이터 조회
        $NC.serviceCall("/LIC02010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

        $NC.setGridSelectRow(G_GRDDETAIL, 0);
    }

    // 입고구분 세팅
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
        selectOption: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE ? "F" : null,
        onComplete: function() {
            if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {
                $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
            } else {
                $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
            }
        }
    });

    // 입고차량구분 세팅
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
        addEmpty: true,
        onComplete: function() {
            $NC.setValue("#cboIn_Car_Div", $NC.G_VAR.masterData.IN_CAR_DIV);
        }
    });

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

    if (G_GRDDETAIL.view.getEditorLock().isActive() && !G_GRDDETAIL.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
    }

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "BATCH_NO":
        case "VALID_DATE":
        case "ENTRY_QTY":
            subDataOnChange(e, {
                view: view,
                col: id,
                val: val
            });
            break;
        default:
            masterDataOnChange(e, {
                view: view,
                col: id,
                val: val
            });
            break;
    }
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
        alert($NC.getDisplayMsg("JS.LIC02011P2.004", "먼저 공급처 코드를 입력하십시오."));
        $NC.setFocus("#edtVendor_Cd");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    $NC.G_VAR.maxRowId = $NC.G_VAR.maxRowId + 1;
    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        BU_CD: $NC.G_VAR.masterData.BU_CD,
        INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
        INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
        LINE_NO: "",
        INBOUND_STATE: $NC.G_VAR.masterData.INBOUND_STATE || $ND.C_STATE_ENTRY,
        BRAND_CD: "",
        BRAND_NM: "",
        ITEM_CD: "",
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
        VALID_DATE: "",
        BATCH_NO: "",
        ORDER_QTY: 0,
        ENTRY_QTY: 0,
        ENTRY_BOX: 0,
        ENTRY_EA: 0,
        CONFIRM_QTY: 0,
        PUTAWAY_QTY: 0,
        BOX_WEIGHT: 0,
        ENTRY_WEIGHT: 0,
        BUY_PRICE: 0,
        DC_PRICE: 0,
        APPLY_PRICE: 0,
        BUY_AMT: 0,
        VAT_AMT: 0,
        DC_AMT: 0,
        TOTAL_AMT: 0,
        ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
        ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
        ORDER_LINE_NO: "",
        BU_DATE: $NC.G_VAR.masterData.BU_DATE,
        BU_NO: $NC.G_VAR.masterData.BU_NO,
        BU_LINE_NO: "",
        BU_KEY: "",
        REMARK1: "",
        ROW_ID: $NC.G_VAR.maxRowId,
        VAT_YN: $ND.C_NO,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDDETAIL, newRowData);

    setInputValue("#grdSub");
}

/**
 * 저장
 */
function _Save() {

    if ($NC.isNull($NC.G_VAR.masterData.INBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.006", "먼저 입고일자를 입력하십시오."));
        $NC.setFocus("#dtpInbound_Date");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.VENDOR_CD)) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.004", "먼저 공급처 코드를 입력하십시오."));
        $NC.setFocus("#edtVendor_Cd");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.007", "먼저 입고구분을 선택하십시오."));
        $NC.setFocus("#cboInout_Cd");
        return;
    }

    // [LS220]파렛트ID 사용 기준 : 1 - 파렛트ID 사용 안함
    // [LS220]파렛트ID 사용 기준 : 2 - 파렛트ID 사용 함
    // [LI230]파렛트ID 매핑 기준 : 1 - 파렛트 분할구분별 자동매핑(단일상품)
    // [LI230]파렛트ID 매핑 기준 : 2 - 파렛트 분할구분별 자동매핑(멀티상품)
    // [LI230]파렛트ID 매핑 기준 : 3 - 사용자 수작업 매핑(멀티상품)
    if ($NC.G_VAR.G_PARAMETER.P_POLICY_LS220 == "2" && $NC.G_VAR.G_PARAMETER.P_POLICY_LI230 == "3") {
        if ($NC.toNumber($NC.G_VAR.masterData.PALLET_ID_CNT) < 1) {
            alert($NC.getDisplayMsg("JS.LIC02011P2.008", "파렛트ID수를 정확히 입력하십시오[1이상]"));
            $NC.setFocus("#edtPallet_Id_Cnt");
            return;
        }
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.005", "저장할 데이터가 없습니다."));
        return;
    }

    // [LI140]입고예정 종결처리 정책 : 1 - 입고예정 전표 종결처리
    // [LI140]입고예정 종결처리 정책 : 2 - 입고 완료시까지 대기[확정시 예정잔량 조정 안함]
    // [LI140]입고예정 종결처리 정책 : 3 - 입고 완료시까지 대기[확정시 예정잔량 조정]
    var dsTarget = G_GRDDETAIL.data.getItems();
    var rowData, rIndex, rCount;
    if ($NC.G_VAR.G_PARAMETER.P_POLICY_LI140 != "1") {
        for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
            rowData = dsTarget[rIndex];
            if ($NC.isNull(rowData.ORDER_LINE_NO)) {
                continue;
            }
            if (Number(rowData.REMAIN_QTY) > Number(rowData.ENTRY_QTY)) {
                if (!confirm($NC.getDisplayMsg("JS.LIC02011P2.009", "미등록 상품이 존재합니다.\n분할입고 하시겠습니까?"))) {
                    return;
                }
                break;
            }
        }
    }

    var dsD = [];
    var dsCU = [];
    var dsDetail, dsSub;
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        } else if (rowData.CRUD != $ND.C_DV_CRUD_U && rowData.ENTRY_QTY == "0") {
            continue;
        } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsDetail = dsD;
        } else {
            dsDetail = dsCU;
        }
        dsDetail.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
            P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_INBOUND_STATE: rowData.INBOUND_STATE,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: rowData.ITEM_LOT,
            P_VALID_DATE: rowData.VALID_DATE,
            P_BATCH_NO: rowData.BATCH_NO,
            P_ORDER_QTY: rowData.ORDER_QTY,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_CONFIRM_QTY: rowData.CONFIRM_QTY,
            P_PUTAWAY_QTY: rowData.PUTAWAY_QTY,
            P_BUY_PRICE: rowData.BUY_PRICE,
            P_DC_PRICE: rowData.DC_PRICE,
            P_APPLY_PRICE: rowData.APPLY_PRICE,
            P_BUY_AMT: rowData.BUY_AMT,
            P_VAT_AMT: rowData.VAT_AMT,
            P_VAT_YN: rowData.VAT_YN,
            P_DC_AMT: rowData.DC_AMT,
            P_TOTAL_AMT: rowData.TOTAL_AMT,
            P_ORDER_DATE: rowData.ORDER_DATE,
            P_ORDER_NO: rowData.ORDER_NO,
            P_ORDER_LINE_NO: rowData.ORDER_LINE_NO,
            P_BU_DATE: rowData.BU_DATE,
            P_BU_NO: rowData.BU_NO,
            P_BU_LINE_NO: rowData.BU_LINE_NO,
            P_BU_KEY: rowData.BU_KEY,
            P_ROW_ID: rowData.ROW_ID,
            P_REMARK1: rowData.REMARK1,
            P_SPARE1_NOTE: rowData.SPARE1_NOTE,
            P_SPARE2_NOTE: rowData.SPARE2_NOTE,
            P_SPARE3_NOTE: rowData.SPARE3_NOTE,
            P_SPARE4_NOTE: rowData.SPARE4_NOTE,
            P_SPARE5_NOTE: rowData.SPARE5_NOTE,
            P_CRUD: rowData.CRUD
        });
    }
    dsDetail = dsD.concat(dsCU);

    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    dsD = [];
    dsCU = [];
    dsTarget = G_GRDSUB.data.getItems();
    for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsSub = dsD;
        } else {
            dsSub = dsCU;
        }
        dsSub.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
            P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_VALID_DATE: rowData.VALID_DATE,
            P_BATCH_NO: rowData.BATCH_NO,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_REMARK1: rowData.REMARK1,
            P_ROW_ID: rowData.ROW_ID,
            P_CRUD: rowData.CRUD
        });
    }
    dsSub = dsD.concat(dsCU);

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R && dsDetail.length == 0 && dsSub.length == 0) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.010", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LIC02010E0/saveWithNS.do", {
        P_DS_MASTER: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
            P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
            P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
            P_INBOUND_STATE: $NC.G_VAR.masterData.INBOUND_STATE,
            P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
            P_VENDOR_CD: $NC.G_VAR.masterData.VENDOR_CD,
            P_IN_CAR_DIV: $NC.G_VAR.masterData.IN_CAR_DIV,
            P_CAR_NO: $NC.G_VAR.masterData.CAR_NO,
            P_PLANED_DATETIME: $NC.G_VAR.masterData.PLANED_DATETIME,
            P_DIRECT_YN: $NC.G_VAR.masterData.DIRECT_YN,
            P_PALLET_ID_CNT: $NC.G_VAR.masterData.PALLET_ID_CNT,
            P_OLD_PALLET_ID_CNT: $NC.G_VAR.masterData.PALLET_ID_CNT,
            P_DATA_DIV: $NC.G_VAR.masterData.DATA_DIV,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
            P_CRUD: $NC.G_VAR.masterData.CRUD
        },
        P_DS_DETAIL: dsDetail,
        P_DS_SUB: dsSub,
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
        alert($NC.getDisplayMsg("JS.LIC02011P2.011", "삭제할 데이터가 없습니다."));
        return;
    }

    if (G_GRDSUB.data.getLength() > 0) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.012", "제조번호/사용기한 데이터가 존재합니다.\n제조번호/사용기한 데이터를 먼저 삭제하십시오."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.deleteGridRowData(G_GRDDETAIL, rowData, true) == 0) {
        setInputValue("#grdSub");
    }
}

function masterDataOnChange(e, args) {

    switch (args.col) {
        case "VENDOR_CD":
            $NP.onVendorChange(args.val, {
                P_CUST_CD: $NC.getValue("#edtCust_Cd"),
                P_VENDOR_CD: args.val,
                P_VIEW_DIV: "2"
            }, onVendorPopup);
            return;
        case "INOUT_CD":
            // 수송입고는 신규 등록 불가
            if (args.val == "E20") {
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {
                    alert($NC.getDisplayMsg("JS.LIC02011P2.013", "수송입고는 신규로 등록할 수 없습니다."));
                    args.val = "E10";
                    $NC.setValue(args.view, args.val);
                    $NC.setFocus(args.view);
                }
            }
            $NC.G_VAR.masterData.INOUT_CD = args.val;
            break;
        case "INBOUND_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LIC02011P2.014", "입고일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.INBOUND_DATE = $NC.getValue(args.view);
            break;
        case "IN_CAR_DIV":
            $NC.G_VAR.masterData.IN_CAR_DIV = args.val;
            break;
        case "CAR_NO":
        case "REMARK1":
        case "PALLET_ID_CNT":
            $NC.G_VAR.masterData[args.col] = args.val;
            break;
    }
    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
}

function subDataOnChange(e, args) {

    switch (args.col) {
        case "VALID_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LIC02011P2.015", "사용기한을 정확히 입력하십시오."));
            // $NC.G_VAR.masterData.VALID_DATE = $NC.getValue(args.view);
            checkLimitDate();
            return;
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
            isKeyField: true,
            onPopup: grdDetailOnPopup
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
        id: "ORG_ORDER_QTY",
        field: "ORG_ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
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
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
        $NC.setGridColumn(columns, {
            id: "REMAIN_QTY",
            field: "REMAIN_QTY",
            name: "미처리수량",
            cssClass: "styRight"
        });
    }
    $NC.setGridColumn(columns, {
        id: "FLOCATION_CD",
        field: "FLOCATION_CD",
        name: "고정로케이션",
        cssClass: "styCenter"
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
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
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

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.ORDER_QTY > rowData.ENTRY_QTY) {
                    return "styUnder";
                }
                if (rowData.DRUG_CAUTION == "1") {
                    return "stySpecial";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: null,
        sortCol: [
            "LINE_NO",
            "ITEM_CD"
        ],
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

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "ITEM_CD", true);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "ITEM_CD":
        case "ITEM_STATE_F":
        case "ITEM_LOT":
            return $NC.isNull(rowData.ORDER_LINE_NO);
        case "ENTRY_QTY":
            // 수송입고일 경우 수정 불가능
            return $NC.G_VAR.masterData.INOUT_CD != "E20";
        case "VALID_DATE":
        case "BATCH_NO":
            // 재고관리 기준 - 입고일자, 유효일자, 배치번호별 관리
            return $NC.G_VAR.G_PARAMETER.P_POLICY_LS210 == "2" && $NC.G_VAR.masterData.INOUT_CD != "E20";
    }

    return true;
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDDETAIL.view.getColumnId(args.cell)) {
        case "ITEM_CD":
            $NP.onItemChange(rowData.ITEM_CD, {
                P_BU_CD: rowData.BU_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemPopup);
            return;
        case "ENTRY_QTY":
            var CHECK_QTY = $NC.isNull(rowData.ORDER_LINE_NO) ? 1 : 0;
            var ENTRY_QTY = Number(rowData.ENTRY_QTY) || 0;
            if (ENTRY_QTY < CHECK_QTY) {
                alert($NC.getDisplayMsg("JS.LIC02011P2.016", "등록수량이 " + CHECK_QTY + "보다 작을 수 없습니다.", CHECK_QTY));
                rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
            if ($NC.G_VAR.ORDER_YN == $ND.C_YES && $NC.G_VAR.G_PARAMETER.P_POLICY_LI220 != "1") {
                if (Number(rowData.ORDER_QTY) < ENTRY_QTY) {
                    alert($NC.getDisplayMsg("JS.LIC02011P2.017", "등록수량이 예정수량을 초과할 수 없습니다."));
                    rowData.ENTRY_QTY = args.oldItem.ENTRY_QTY;
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                    break;
                }
            }
            // 입고디테일상세의 등록수량 합계와 디테일의 등록수량 체크
            var SUM_ENTRY_QTY = $NC.getGridSumVal(G_GRDSUB, {
                searchKey: "ROW_ID",
                searchVal: rowData.ROW_ID,
                sumKey: "ENTRY_QTY"
            });
            if (G_GRDSUB.data.getLength() > 0 && SUM_ENTRY_QTY != ENTRY_QTY) {
                alert($NC.getDisplayMsg("JS.LIC02011P2.018", "등록수량은 제조번호/사용기한의 총등록수량과 일치해야 합니다."));
                rowData.ENTRY_QTY = SUM_ENTRY_QTY;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
                break;
            }
            rowData.ENTRY_QTY = ENTRY_QTY;
            rowData = grdDetailOnCalc(rowData);
            // 유통기한 표시 정책인 경우만 포커스 이동
            // if ($NC.G_VAR.G_PARAMETER.P_POLICY_LS210 == "2") {
            // // 포커스 이동
            // $NC.setFocusGrid(G_GRDDETAIL, args.row, "VALID_DATE", true);
            // }
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(rowData.VALID_DATE)) {
                if (!$NC.isDate(rowData.VALID_DATE)) {
                    alert($NC.getDisplayMsg("JS.LIC02011P2.015", "사용기한을 정확히 입력하십시오."));
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
            alert($NC.getDisplayMsg("JS.LIC02011P2.019", "상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_STATE)) {
            alert($NC.getDisplayMsg("JS.LIC02011P2.020", "상태를 선택하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_STATE", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_LOT)) {
            alert($NC.getDisplayMsg("JS.LIC02011P2.021", "LOT번호를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_LOT", true);
            return false;
        }
        if ($NC.isNull(rowData.ENTRY_QTY)) {
            alert($NC.getDisplayMsg("JS.LIC02011P2.022", "등록수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ENTRY_QTY", true);
            return false;
        }
        var CHECK_QTY = $NC.isNull(rowData.ORDER_LINE_NO) ? 1 : 0;
        var ENTRY_QTY = Number(rowData.ENTRY_QTY) || 0;
        if (ENTRY_QTY < CHECK_QTY) {
            alert($NC.getDisplayMsg("JS.LIC02011P2.016", "등록수량이 " + CHECK_QTY + "보다 작을 수 없습니다.", CHECK_QTY));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ENTRY_QTY", true);
            return false;
        }
        // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
        if ($NC.G_VAR.ORDER_YN == $ND.C_YES && $NC.G_VAR.G_PARAMETER.P_POLICY_LI220 != "1") {
            if (Number(rowData.ORDER_QTY) < ENTRY_QTY) {
                alert($NC.getDisplayMsg("JS.LIC02011P2.023", "등록수량이 예정수량을 초과할 수 없습니다."));
                $NC.setFocusGrid(G_GRDDETAIL, row, "ENTRY_QTY", true);
                return false;
            }
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
    var rowData = G_GRDDETAIL.data.getItem(row);

    $NC.setGridFilterValue(G_GRDSUB, rowData.ROW_ID);
    if (G_GRDSUB.data.getLength() == 0) {
        setInputValue("#grdSub");
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

    var options = {};

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LIC02010E2.RS_T1_SUB1",
        sortCol: [
            "LINE_NO",
            "BATCH_NO",
            "VALID_DATE"
        ],
        gridOptions: options,
        canExportExcel: false,
        onFilter: grdSubOnFilter
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onClick.subscribe(grdSubOnClick);
}

/**
 * grdSub 데이터 필터링 이벤트
 */
function grdSubOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D && G_GRDSUB.lastFilterVal == item.ROW_ID;
}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    // var rowData = G_GRDSUB.data.getItem(row);

    setInputValue("#grdSub");

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

function grdSubOnClick(e, args) {

    var rowData = G_GRDSUB.data.getItem(args.row);
    setTimeout(function() {
        setInputValue("#grdSub", rowData);
        $NC.setFocus("#edtEntry_Qty");
    });
}

function grdDetailOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "ITEM_CD":
            $NP.showItemPopup({
                P_BU_CD: rowData.BU_CD,
                P_ITEM_CD: $ND.C_ALL,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemPopup, function() {
                $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, "ITEM_CD", true, true);
            });
            break;
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
        POLICY_VAL: $NC.G_VAR.G_PARAMETER.P_POLICY_LI190
    };

    rowData.BUY_AMT = $NC.getItemAmt(calcParams);
    rowData.VAT_AMT = $NC.getVatAmt(calcParams);
    rowData.TOTAL_AMT = $NC.getTotalAmt(calcParams);

    rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
    rowData.PUTAWAY_QTY = rowData.ENTRY_QTY;

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
        rowData.BRAND_CD = resultInfo.BRAND_CD;
        rowData.BRAND_NM = resultInfo.BRAND_NM;
        rowData.ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
        rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
        rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
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
        rowData.VALID_DATE = "";
        rowData.BATCH_NO = "";
        rowData.DRUG_DIV_D = resultInfo.DRUG_DIV_D;
        rowData.MEDICATION_DIV_D = resultInfo.MEDICATION_DIV_D;
        rowData.KEEP_DIV_D = resultInfo.KEEP_DIV_D;
        rowData.DRUG_CD = resultInfo.DRUG_CD;
        rowData = grdDetailOnCalc(rowData);

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
        rowData.PUTAWAY_QTY = 0;
        rowData.VALID_DATE = "";
        rowData.BATCH_NO = "";
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

function onGetPalletIdCnt(ajaxData) {

    var PALLET_ID_CNT = 1;
    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg == $ND.C_OK) {
        PALLET_ID_CNT = resultData.O_PALLET_ID_CNT;
    }

    $NC.setValue("#edtPallet_Id_Cnt", PALLET_ID_CNT);
    $NC.G_VAR.masterData.PALLET_ID_CNT = PALLET_ID_CNT;
}

function onGetSub(ajaxData) {

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    $NC.setGridFilterValue(G_GRDSUB, $NC.isNull(rowData) ? null : rowData.ROW_ID);
    $NC.setInitGridData(G_GRDSUB, ajaxData, grdSubOnFilter);
    $NC.setInitGridAfterOpen(G_GRDSUB);

}

function setPalletIdCnt() {

    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD != $ND.C_PROCESS_ORDER) {
        return;
    }

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.G_VAR.G_PARAMETER.P_MASTER_DS.CENTER_CD;
    var BU_CD = $NC.G_VAR.G_PARAMETER.P_MASTER_DS.BU_CD;
    var ORDER_DATE = $NC.G_VAR.G_PARAMETER.P_MASTER_DS.ORDER_DATE;
    var ORDER_NO = $NC.G_VAR.G_PARAMETER.P_MASTER_DS.ORDER_NO;
    var IN_GRP = $NC.G_VAR.G_PARAMETER.P_MASTER_DS.INOUT_SUB_CD;

    // 데이터 조회
    $NC.serviceCall("/LIC02010E0/getData.do", {
        P_QUERY_ID: "LI_POLICY_PLTID_GETCNT",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ORDER_DATE: ORDER_DATE,
            P_ORDER_NO: ORDER_NO,
            P_IN_GRP: IN_GRP
        }
    }, onGetPalletIdCnt);
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
        var POLICY_LI221 = $NC.G_VAR.G_PARAMETER.P_POLICY_LI221.match(/N|Y/gi);
        if ($NC.isNull(POLICY_LI221)) {
            POLICY_LI221 = [
                $ND.C_NO,
                $ND.C_NO
            ];
        }
        // 예정으로 등록시 추가/삭제 허용 기준 정책 및 프로그램 사용 권한 체크
        $NC.setEnable("#btnEntryNew", POLICY_LI221[0] == $ND.C_YES && permission.canSave);
        $NC.setEnable("#btnEntryDelete", POLICY_LI221[1] == $ND.C_YES && permission.canDelete);
        $NC.setEnable("#btnEntrySave", permission.canSave);
    } else {
        // 신규 등록, 신규로 등록한 데이터 수정일 경우
        $NC.setEnable("#btnEntryNew", permission.canSave);
        $NC.setEnable("#btnEntryDelete", permission.canDelete);
        $NC.setEnable("#btnEntrySave", permission.canSave);
    }
}

/**
 * 제조번호/사용기한 row Insert/Update
 */
function edtEntryQtyOnKeyDown(e) {

    if (e.keyCode != 13) {
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.024", "상세정보에서 상품을 먼저 선택 후 작업하십시오."));
        return;
    }

    // 필수체크
    var BATCH_NO = $NC.getValue("#edtBatch_No");
    if ($NC.isNull(BATCH_NO)) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.025", "제조배치를 입력하십시오."));
        $NC.setFocus("#edtBatch_No", true);
        return;
    }
    var VALID_DATE = $NC.getValue("#dtpValid_Date");
    if ($NC.isNull(VALID_DATE)) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.026", "사용기한을 입력하십시오."));
        $NC.setFocus("#dtpValid_Date", true);
        return;
    }
    var ENTRY_QTY = $NC.getValue("#edtEntry_Qty");
    if ($NC.isNull(ENTRY_QTY)) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.022", "등록수량을 입력하십시오."));
        $NC.setFocus("#edtEntry_Qty", true);
        return;
    }
    if ($NC.toNumber(ENTRY_QTY) <= 0) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.027", "등록수량에는 0보다 큰 수를 입력하십시오."));
        return;
    }

    var refRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    var searchIndex = $NC.getGridSearchRow(G_GRDSUB, {
        searchKey: [
            "ROW_ID",
            "BATCH_NO",
            "VALID_DATE"
        ],
        searchVal: [
            refRowData.ROW_ID,
            BATCH_NO,
            VALID_DATE
        ]
    });

    if (searchIndex == -1) {
        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        var newRowData = {
            CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            BU_CD: $NC.G_VAR.masterData.BU_CD,
            INBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE ? "" : $NC.G_VAR.masterData.INBOUND_DATE,
            INBOUND_NO: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE ? "" : $NC.G_VAR.masterData.INBOUND_NO,
            LINE_NO: "",
            VALID_DATE: VALID_DATE,
            BATCH_NO: BATCH_NO,
            ENTRY_QTY: ENTRY_QTY,
            REMARK1: "",
            ROW_ID: refRowData.ROW_ID,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_C
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDSUB, newRowData);
    } else {
        $NC.setGridSelectRow(G_GRDSUB, searchIndex, "ENTRY_QTY", false);

        var rowData = G_GRDSUB.data.getItem(searchIndex);
        rowData.BATCH_NO = BATCH_NO;
        rowData.VALID_DATE = VALID_DATE;
        rowData.ENTRY_QTY = ENTRY_QTY;

        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
        $NC.setGridApplyChange(G_GRDSUB, rowData);
    }

    var SUM_ENTRY_QTY = $NC.getGridSumVal(G_GRDSUB, {
        searchKey: "ROW_ID",
        searchVal: refRowData.ROW_ID,
        sumKey: "ENTRY_QTY"
    });
    refRowData.ENTRY_QTY = SUM_ENTRY_QTY;
    refRowData = grdDetailOnCalc(refRowData);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, refRowData);

    setInputValue("#grdSub");
    $NC.setFocus("#edtBatch_No", true);
}

function btnSubDeleteOnClick() {

    if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
        alert($NC.getDisplayMsg("JS.LIC02011P2.011", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    if ($NC.deleteGridRowData(G_GRDSUB, rowData, true) == 0) {
        setInputValue("#grdSub");
    }

    // 디테일 상세 삭제일 경우 디테일 변경으로 갱신
    var refRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    var SUM_ENTRY_QTY = $NC.getGridSumVal(G_GRDSUB, {
        searchKey: "ROW_ID",
        searchVal: refRowData.ROW_ID,
        sumKey: "ENTRY_QTY"
    });
    refRowData.ENTRY_QTY = SUM_ENTRY_QTY;
    refRowData = grdDetailOnCalc(refRowData);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
    $NC.setGridApplyChange(G_GRDDETAIL, refRowData);
}

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdSub") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }
        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtBatch_No", rowData["BATCH_NO"]);
        $NC.setValue("#dtpValid_Date", rowData["VALID_DATE"]);
        $NC.setValue("#edtEntry_Qty", rowData["ENTRY_QTY"]);

        var isEnable = G_GRDDETAIL.data.getLength() > 0;
        $NC.setEnable("#edtBatch_No", isEnable);
        $NC.setEnable("#dtpValid_Date", isEnable);
        $NC.setEnable("#edtEntry_Qty", isEnable);
    }
}

/**
 * 입력한 사용기한 체크
 */
function checkLimitDate() {

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

    var CENTER_CD = $NC.G_VAR.G_PARAMETER.P_CENTER_CD;
    var BU_CD = $NC.G_VAR.G_PARAMETER.P_BU_CD;
    var INBOUND_DATE = $NC.getValue("#dtpInbound_Date");
    var BRAND_CD = rowData.BRAND_CD;
    var ITEM_CD = rowData.ITEM_CD;
    var ITEM_STATE = rowData.ITEM_STATE;
    var VALID_DATE = $NC.getValue("#dtpValid_Date");

    $NC.serviceCall("/LIC02010E0/getData.do", {
        P_QUERY_ID: "LI_POLICY_CMITEMLIMIT_CHECKING",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INBOUND_DATE: INBOUND_DATE,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_STATE: ITEM_STATE,
            P_VALID_DATE: VALID_DATE,
            P_POLICY_LI620: $NC.G_VAR.G_PARAMETER.P_POLICY_LI620,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }
    }, onCheckLimitDate);
}

function onCheckLimitDate(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        if (confirm($NC.getDisplayMsg("JS.LIC02011P2.028", oMsg + "\n계속 작업 하시겠습니까?", oMsg))) {
            $NC.setFocus("#edtEntry_Qty", true);
        } else {
            $NC.setValue("#dtpValid_Date");
            $NC.setFocus("#dtpValid_Date", true);
        }
    } else {
        $NC.setFocus("#edtEntry_Qty", true);
    }
}
