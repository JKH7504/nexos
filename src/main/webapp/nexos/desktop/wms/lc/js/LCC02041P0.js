﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC02041P0
 *  프로그램명         : 세트작업등록 팝업
 *  프로그램설명       : 세트작업등록 팝업 화면 Javascript
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#divDetailView",
                grids: "#grdDetail"
            },
            viewSecond: {
                container: "#divSubView",
                grids: "#grdSub"
            },
            viewType: "v",
            viewFixed: 180,
            exceptHeight: function() {
                return $NC.getViewHeight("#ctrPopupView");
            }
        },
        // 마스터 데이터
        masterData: null,
        // 디테일 데이터, 예정으로 처리에 값 존재
        detailData: {},
        // 체크할 정책 값
        policyVal: {
            LS210: "" // 재고 관리 기준
        },
        dsInoutCd: {
            // 조립, assemble
            A: null,
            // 해체, disassemble
            D: null
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnSave").click(_Save); // 저장 버튼
    $("#btnSearchStock").click(_Inquiry); // 현재고검색 버튼 클릭
    $("#btnQBrand_Cd").click(showBuBrandPopup); // 조회조건 브랜드 검색팝업
    $("#btnQSet_Item_Cd").click(showSetItemPopup); // 조회조건 세트상품 검색팝업

    $NC.setEnable("#edtCenter_Cd_F", false); // 물류센터 비활성화
    $NC.setEnable("#edtBu_Cd", false); // 사업부 비활성화
    $NC.setEnable("#edtEtc_No", false); // 입출고번호 비활성화

    $NC.setInitDatePicker("#dtpEtc_Date"); // 입출고일자
    $NC.setInitDatePicker("#dtpQValid_Date", null, "N"); // 유통기한
    $NC.setInitDatePicker("#dtpQStock_Date", null, "N"); // 재고입고일자

    grdDetailInitialize();
    grdSubInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_STATE",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_STATE",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "1",
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMZONE",
                P_QUERY_ID: "WC.POP_CMZONE",
                P_QUERY_PARAMS: {
                    P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                    P_ZONE_CD: $ND.C_ALL,
                    P_ZONE_DIV_ATTR01_CD: "2" // 1 - 일반, 2- 유통가공, 3 - 보세
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 상품상태 콤보 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_State",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE),
            onComplete: function() {
                // 예정으로 처리시 서비스 호출이 비동기라 _OnLoad이후에 세팅된 경우
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
                    $NC.setValue("#cboQItem_State", $NC.G_VAR.detailData.ITEM_STATE);
                }
            }
        });
        // 존 콤보 세팅
        $NC.setInitComboData({
            selector: "#cboQZone_Cd",
            codeField: "ZONE_CD",
            fullNameField: "ZONE_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMZONE),
            onComplete: function() {
                $NC.G_VAR.masterData.ZONE_CD = $NC.getValue("#cboQZone_Cd");
            }
        });
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

    var ETC_DATE, SET_PROC_DIV;
    // 신규 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {

        $NC.setValue("#dtpEtc_Date", $NC.G_VAR.G_PARAMETER.P_ETC_DATE);
        ETC_DATE = $NC.getValue("#dtpEtc_Date");
        SET_PROC_DIV = $NC.getValueRadioGroup("rgbSet_Proc_Div");

        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            ETC_DATE: ETC_DATE,
            ETC_NO: "",
            ORDER_DATE: "",
            ORDER_NO: "",
            INOUT_CD: "",
            ZONE_CD: "",
            ITEM_LOT: "",
            VALID_DATE: "",
            BATCH_NO: "",
            STOCK_DATE: "",
            SET_PROC_DIV: SET_PROC_DIV,
            REMARK1: "",
            CRUD: $ND.C_DV_CRUD_C
        };
    }
    // 예정 -> 등록
    else {
        var dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
        ETC_DATE = $NC.getValue("#dtpEtc_Date");
        SET_PROC_DIV = dsMaster.INOUT_WORK_DIV;
        $NC.setValueRadioGroup("rgbSet_Proc_Div", SET_PROC_DIV);

        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: dsMaster.CENTER_CD,
            BU_CD: dsMaster.BU_CD,
            ETC_DATE: ETC_DATE,
            ETC_NO: "",
            INOUT_CD: dsMaster.INOUT_CD,
            ORDER_DATE: dsMaster.ORDER_DATE,
            ORDER_NO: dsMaster.ORDER_NO,
            ZONE_CD: "",
            ITEM_LOT: "",
            VALID_DATE: "",
            BATCH_NO: "",
            STOCK_DATE: "",
            SET_PROC_DIV: SET_PROC_DIV,
            REMARK1: dsMaster.REMARK1,
            CRUD: $ND.C_DV_CRUD_C
        };

        // 마스터 데이터 세팅
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);

        $NC.setValue("#edtOrder_Date", dsMaster.ORDER_DATE);
        $NC.setValue("#edtOrder_No", dsMaster.ORDER_NO);
        $NC.setValue("#edtBu_Date", dsMaster.BU_DATE);
        $NC.setValue("#edtBu_No", dsMaster.BU_NO);

        // 세트 상품정보 세팅
        $NC.G_VAR.detailData = $NC.G_VAR.G_PARAMETER.P_DETAIL_DS[0]; // 무조건 1건이기 때문에 첫번재 인덱스
        $NC.setValue("#edtQBrand_Cd", $NC.G_VAR.detailData.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", $NC.G_VAR.detailData.BRAND_NM);
        $NC.setValue("#edtQSet_Item_Cd", $NC.G_VAR.detailData.ITEM_CD);
        $NC.setValue("#edtQSet_Item_Nm", $NC.G_VAR.detailData.ITEM_NM);
        $NC.setValue("#cboQItem_State", $NC.G_VAR.detailData.ITEM_STATE);
        // LOT번호가 *가 아닐경우 세팅하고 변경 불가로 처리
        if ($ND.C_BASE_ITEM_LOT != $NC.G_VAR.detailData.ITEM_LOT) {
            $NC.setValue("#edtQItem_Lot", $NC.G_VAR.detailData.ITEM_LOT);
            $NC.setEnable("#edtQItem_Lot", false);
        }

        // 예정으로 등록시 비활성화
        $NC.setEnable("#rgbSet_Proc_Div1", false);
        $NC.setEnable("#rgbSet_Proc_Div2", false);
        $NC.setEnable("#cboInout_Cd", false);
        $NC.setEnableGroup("#tdQDsp_Brand_Cd", false);
        $NC.setEnableGroup("#tdQSet_Item_Cd", false);
        $NC.setEnableGroup("#tdQItem_State", false);
    }

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_INOUT_CD_A",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "INOUT_CD",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "D4",
                    P_ATTR02_CD: "1", // 세트 조립
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_INOUT_CD_D",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "INOUT_CD",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "D4",
                    P_ATTR02_CD: "2", // 세트 해체
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 세트 조립/해체 입출고구분 세팅
        $NC.G_VAR.dsInoutCd.A = $NC.toArray(multipleData.O_WC_POP_CMCODE_INOUT_CD_A);
        $NC.G_VAR.dsInoutCd.D = $NC.toArray(multipleData.O_WC_POP_CMCODE_INOUT_CD_D);

        // 입출고구분 세팅
        $NC.setInitComboData({
            selector: "#cboInout_Cd",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: SET_PROC_DIV == "1" ? $NC.G_VAR.dsInoutCd.A : $NC.G_VAR.dsInoutCd.D,
            onComplete: function() {
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {
                    $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
                } else {
                    $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
                }
            }
        });
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
        case "ZONE_CD":
            $NC.G_VAR.masterData.ZONE_CD = val;
            break;
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "SET_ITEM_CD":
            $NP.onItemChange(val, {
                P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
                P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
                P_ITEM_CD: val,
                P_VIEW_DIV: "2"
            }, onSetItemPopup, {
                queryId: "LCC02040E0.RS_SUB3"
            });
            return;
        case "ITEM_LOT":
            $NC.G_VAR.masterData.ITEM_LOT = val;
            break;
        case "VALID_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC02041P0.001", "유통기한을 정확히 입력하십시오."));
            $NC.G_VAR.masterData.VALID_DATE = $NC.getValue(view);
            break;
        case "BATCH_NO":
            $NC.G_VAR.masterData.BATCH_NO = val;
            break;
        case "STOCK_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC02041P0.002", "입고일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.VALID_DATE = $NC.getValue(view);
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
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
        G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
    }

    var ZONE_CD = $NC.getValue("#cboQZone_Cd");
    if ($NC.isNull(ZONE_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02041P0.003", "존을 선택하십시오."));
        $NC.setFocus("#cboQZone_Cd");
        return;
    }

    var ITEM_CD = $NC.getValue("#edtQSet_Item_Cd");
    if ($NC.isNull(ITEM_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02041P0.004", "세트상품을 입력하십시오."));
        $NC.setFocus("#edtQSet_Item_Cd");
        return;
    }

    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    if ($NC.isNull(ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.LCC02041P0.005", "상태를 선택하십시오."));
        $NC.setFocus("#cboQItem_State");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    var ITEM_LOT = $NC.getValue("#edtQItem_Lot");
    var VALID_DATE = $NC.getValue("#dtpQValid_Date");
    var BATCH_NO = $NC.getValue("#edtQBatch_No");
    var STOCK_DATE = $NC.getValue("#dtpQStock_Date");
    var SET_PROC_DIV = $NC.getValueRadioGroup("rgbSet_Proc_Div");

    $NC.setInitGridVar(G_GRDDETAIL);

    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE, // 예정으로 처리시 사용
        P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO, // 예정으로 처리시 사용
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_LOT: ITEM_LOT,
        P_ORDER_QTY: $NC.G_VAR.detailData.ORDER_QTY, // 예정으로 처리시 사용
        P_VALID_DATE: VALID_DATE,
        P_BATCH_NO: BATCH_NO,
        P_ZONE_CD: ZONE_CD,
        P_STOCK_DATE: STOCK_DATE,
        P_POLICY_LS210: $NC.G_VAR.policyVal.LS210,
        P_SET_PROC_DIV: SET_PROC_DIV
    };

    // 예정으로 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
        G_GRDDETAIL.queryId = "LCC02040E0.RS_SUB5";
    }
    // 신규 등록
    else {
        G_GRDDETAIL.queryId = "LCC02040E0.RS_SUB1";
    }

    // 데이터 조회
    $NC.serviceCall("/LCC02040E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

/**
 * 상품추가 버튼 클릭 이벤트 처리
 */
function _New() {

}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Save() {

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC02041P0.006", "저장할 데이터가 없습니다."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02041P0.007", "물류센터를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02041P0.008", "사업부를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02041P0.009", "먼저 입출고구분을 선택하십시오."));
        $NC.setFocus("#cboInout_Cd");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.ETC_DATE)) {
        alert($NC.getDisplayMsg("JS.LCC02041P0.010", "먼저 입출고일자를 입력하십시오."));
        $NC.setFocus("#dtpEtc_Date");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 지시내역 그리드 저장
    var dsSub = [];
    var dsTarget = G_GRDDETAIL.data.getItems();
    var rowData;
    for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        if (Number(rowData.CONFIRM_QTY) < 1) {
            continue;
        }
        dsSub.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
            P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
            P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_ZONE_CD: $NC.G_VAR.masterData.ZONE_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: $NC.isNull($NC.G_VAR.masterData.ITEM_LOT) ? "" : $NC.G_VAR.masterData.ITEM_LOT,
            P_VALID_DATE: $NC.isNull($NC.G_VAR.masterData.VALID_DATE) ? "" : $NC.G_VAR.masterData.VALID_DATE,
            P_BATCH_NO: $NC.isNull($NC.G_VAR.masterData.BATCH_NO) ? "" : $NC.G_VAR.masterData.BATCH_NO,
            P_STOCK_DATE: $NC.isNull($NC.G_VAR.masterData.STOCK_DATE) ? "" : $NC.G_VAR.masterData.STOCK_DATE,
            P_CONFIRM_QTY: rowData.CONFIRM_QTY,
            P_LINK_LOCATION_CD: rowData.LINK_LOCATION_CD,
            P_LINK_ITEM_LOT: rowData.LINK_ITEM_LOT,
            P_LINK_VALID_DATE: rowData.LINK_VALID_DATE,
            P_LINK_BATCH_NO: rowData.LINK_BATCH_NO,
            P_SET_PROC_DIV: $NC.G_VAR.masterData.SET_PROC_DIV,
            /*rowData.CRUD*/// Java에서 "C"만 처리하므로 강제로 "C"로 처리
            P_CRUD: $ND.C_DV_CRUD_C
        });
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_C) {
        if (dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC02041P0.011", "저장할 지시내역 정보가 없습니다."));
            return;
        }
    } else {
        if ($NC.G_VAR.masterData.CRUD != $ND.C_DV_CRUD_U && dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC02041P0.012", "수정 후 저장하십시오."));
            return;
        }
    }

    $NC.serviceCall("/LCC02040E0/save.do", {
        P_DS_MASTER: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
            P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
            P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_CRUD: $NC.G_VAR.masterData.CRUD
        },
        P_DS_SUB: dsSub,
        P_PROCESS_CD: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제 버튼 클릭 이벤트 처리(지시내역 그리드 행 삭제)
 */
function _Delete() {

}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

    switch (args.col) {
        case "ETC_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LCC02041P0.013", "입출고일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.ETC_DATE = $NC.getValue("#dtpEtc_Date");
            break;
        case "INOUT_CD":
            $NC.G_VAR.masterData.INOUT_CD = args.val;
            break;
        case "REMARK1":
            $NC.G_VAR.masterData.REMARK1 = args.val;
            break;
        case "SET_PROC_DIV1":
        case "SET_PROC_DIV2":
            onChangingSetItem();
            break;
        default:
            // 마스터 데이터 변경이 아닐 경우는 CRUD 변경하지 않기 위해 RETURN
            return;
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
}

function grdDetailOnGetColumns() {

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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "출고가능량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_BOX",
        field: "PSTOCK_BOX",
        name: "출고가능BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_EA",
        field: "PSTOCK_EA",
        name: "출고가능EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "변환수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
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
        editor: Slick.Editors.Popup,
        cssClass: "styCenter",
        editorOptions: {
            onPopup: grdDetailOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_LOT",
        field: "LINK_ITEM_LOT",
        name: "변환LOT번호",
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
        cssClass: "styCenter",
        editor: Slick.Editors.Date,
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_BATCH_NO",
        field: "LINK_BATCH_NO",
        name: "변환제조배치",
        editor: Slick.Editors.Text,
        initialHidden: true
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDDETAIL, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "LINK_VALID_DATE,LINK_BATCH_NO" : ""
    ]);
}

/**
 * 상단그리드(상품정보) 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LCC02040E0.RS_SUB1",
        sortCol: "ITEM_CD",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
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

    // 변수 초기화
    $NC.setInitGridVar(G_GRDSUB);

    // 파라메터 세팅
    G_GRDSUB.queryParams = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE, // 예정으로 처리시 사용
        P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO, // 예정으로 처리시 사용
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        // 예정으로 처리시 사용
        P_ORDER_QTY: $NC.G_VAR.detailData.ORDER_QTY
    };

    // 예정으로 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
        G_GRDSUB.queryId = "LCC02040E0.RS_SUB6";
    }
    // 신규 등록
    else {
        G_GRDSUB.queryId = "LCC02040E0.RS_SUB2";
    }

    // 데이터 조회
    $NC.serviceCall("/LCC02040E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdDetailOnBeforeEditCell(e, args) {

    // var rowData = args.item;
    var isOrder = $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER;
    switch (args.column.id) {
        // case "CONFIRM_QTY":
        // 예정으로 등록은 수정불가, 예정수량 모두 처리 가능 경우만 등록
        // return !isOrder;
        case "LINK_ITEM_LOT":
            return !isOrder // 예정으로 등록이 아니거나
                || (isOrder && $ND.C_BASE_ITEM_LOT == $NC.G_VAR.detailData.ITEM_LOT); // 예정으로 등록일 경우 LOT번호를 지정하지 않은 경우 수정
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
    switch (G_GRDDETAIL.view.getColumnId(args.cell)) {
        case "LINK_LOCATION_CD":
            $NP.onLocationChange(rowData.LINK_LOCATION_CD, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: rowData.LINK_LOCATION_CD,
                P_ZONE_DIV_ATTR01_CD: "2" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, grdDetailOnLocationPopup);
            return;
        case "CONFIRM_QTY":
        case "CONFIRM_BOX":
        case "CONFIRM_EA":
            var columnId = G_GRDDETAIL.view.getColumnId(args.cell);
            rowData = grdDetailOnCalc(rowData, columnId);
            if ($NC.isNull(rowData.CONFIRM_QTY)) {
                alert($NC.getDisplayMsg("JS.LCC02041P0.014", "변환수량을 정확히 입력하십시오."));
                rowData.CONFIRM_QTY = 0;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, "CONFIRM_QTY", true);
            } else if (Number(rowData.PSTOCK_QTY) < Number(rowData.CONFIRM_QTY)) {
                alert($NC.getDisplayMsg("JS.LCC02041P0.015", "변환수량이 가능수량을 초과할수 없습니다."));
                rowData.CONFIRM_QTY = 0;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
            }
            rowData = grdDetailOnCalc(rowData);

            // 구성상품내역 변환수량 변경
            G_GRDSUB.data.beginUpdate();
            try {
                var subRowData;
                for (var rIndex = 0, rCount = G_GRDSUB.data.getLength(); rIndex < rCount; rIndex++) {
                    subRowData = G_GRDSUB.data.getItem(rIndex);
                    subRowData.CONFIRM_QTY = subRowData.SET_ITEM_QTY * rowData.CONFIRM_QTY;
                    subRowData.CONFIRM_BOX = $NC.getBBox(subRowData.CONFIRM_QTY, subRowData.QTY_IN_BOX);
                    subRowData.CONFIRM_EA = $NC.getBEa(subRowData.CONFIRM_QTY, subRowData.QTY_IN_BOX);
                    G_GRDSUB.data.updateItem(subRowData.id, subRowData);
                }
            } finally {
                G_GRDSUB.data.endUpdate();
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

/**
 * 재고 내역 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row)) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CONFIRM_QTY) || Number(rowData.CONFIRM_QTY) < 1) {
            alert($NC.getDisplayMsg("JS.LCC02041P0.016", "변환수량에 0보다 큰 수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "CONFIRM_QTY", true);
            return false;
        } else {
            if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
                if (Number(rowData.PSTOCK_QTY) < Number(rowData.CONFIRM_QTY)) {
                    alert($NC.getDisplayMsg("JS.LCC02041P0.017", "세트 가공작업 가능한 재고가 부족합니다. 출고가능량을 확인하십시오."));
                    $NC.setFocusGrid(G_GRDDETAIL, row, "CONFIRM_QTY", true);
                    return false;
                }
            }
        }
        if ($NC.isNull(rowData.LINK_LOCATION_CD)) {
            alert($NC.getDisplayMsg("JS.LCC02041P0.018", "로케이션을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "LINK_LOCATION_CD", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

/**
 * 그리드 팝업 이벤트 처리
 */
function grdDetailOnPopup(e, args) {

    switch (args.column.id) {
        case "LINK_LOCATION_CD":
            $NP.showLocationPopup({
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: $ND.C_ALL,
                P_ZONE_DIV_ATTR01_CD: "2", // 1 - 일반, 2- 유통가공, 3 - 보세
                P_INOUT_DIV: "1",
                P_LOC_DIV_ATTR03_CD: [
                    "10", // 일반셀
                    "20" // 고정셀
                ].join($ND.C_SEP_DATA)
            }, grdDetailOnLocationPopup, function() {
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true, true);
            });
            break;
    }
}

/**
 * 로케이션 검색 팝업창에서 행 클릭 혹은 취소 했을 경우 처리
 * 
 * @param resultInfo
 */

function grdDetailOnLocationPopup(resultInfo) {

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.LINK_LOCATION_CD = resultInfo.LOCATION_CD;

        focusCol = G_GRDDETAIL.view.getColumnIndex("LINK_ITEM_LOT");
    } else {
        rowData.LINK_LOCATION_CD = "";

        focusCol = G_GRDDETAIL.view.getColumnIndex("LINK_LOCATION_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);

    $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
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
        id: "SET_ITEM_QTY",
        field: "SET_ITEM_QTY",
        name: "기준수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "변환수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "변환BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "변환EA",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 구성상품 데이터 그리드 초기값 설정
 */
function grdSubInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LCC02040E0.RS_SUB2",
        sortCol: "ITEM_CD",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
}

/**
 * 구성상품 데이터 그리드 행 선택 변경 했을 경우
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
 * 현재고 검색후 처리
 * 
 * @param ajaxData
 */
function onGetDetail(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length > 0) {
        var rowData = dsResult[0];
        // 가용 재고가 없으면 초기화
        if (Number(rowData.PSTOCK_QTY) == 0) {
            $NC.clearGridData(G_GRDDETAIL);
            $NC.clearGridData(G_GRDSUB);
            // 데이터 표시되지 않은 상태에서 메시지가 표시되어 Delay 처리
            setTimeout(function() {
                alert($NC.getDisplayMsg("JS.LCC02041P0.019", "세트 가공작업 가능한 재고가 존재하지 않습니다."));
            });
        }
        // 재고가 있을 경우
        else {
            $NC.setInitGridData(G_GRDDETAIL, dsResult);
            $NC.setInitGridAfterOpen(G_GRDDETAIL);
            // 예정으로 처리시 예정수량을 추가해서 데이터를 가져왔기 때문에 강제로 U로 변경
            if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER) {
                $NC.setGridApplyChange(G_GRDDETAIL, rowData);
                if (Number(rowData.PSTOCK_QTY) < Number(rowData.ORDER_QTY)) {
                    // 데이터 표시되지 않은 상태에서 메시지가 표시되어 Delay 처리
                    setTimeout(function() {
                        alert($NC.getDisplayMsg("JS.LCC02041P0.017", "세트 가공작업 가능한 재고가 부족합니다. 출고가능량을 확인하십시오."));
                        $NC.setFocusGrid(G_GRDDETAIL, 0, "CONFIRM_QTY", true);
                    });
                } else {
                    $NC.setFocusGrid(G_GRDDETAIL, 0, "LINK_LOCATION_CD", true);
                }
            } else {
                $NC.setFocusGrid(G_GRDDETAIL, 0, "LINK_LOCATION_CD", true);
            }
        }
    } else {
        // 서브 초기화
        $NC.clearGridData(G_GRDSUB);
        alert($NC.getDisplayMsg("JS.LCC02041P0.019", "세트 가공작업 가능한 재고가 존재하지 않습니다."));
    }
}

/**
 * 구성상품내역 검색후 처리
 * 
 * @param ajaxData
 */
function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    // 세트상품정보 초기화
    $NC.clearGridData(G_GRDDETAIL);
    // 구성상품정보 초기화
    $NC.clearGridData(G_GRDSUB);
}

/**
 * 세트작업구분 값 변경 되었을 경우의 처리
 */
function onChangingSetItem() {

    var SET_PROC_DIV = $NC.getValueRadioGroup("rgbSet_Proc_Div");
    if (G_GRDDETAIL.data.getLength() > 0) {
        if (!confirm($NC.getDisplayMsg("JS.LCC02041P0.020", "작업구분를 변경하시면 작업중인 데이터가 초기화됩니다.\n\n작업구분를 변경하시겠습니까?"))) {
            if (SET_PROC_DIV == "2") {
                $NC.setValueRadioGroup("rgbSet_Proc_Div", "1");
            } else {
                $NC.setValueRadioGroup("rgbSet_Proc_Div", "2");
            }
            return;
        }
    }
    $NC.G_VAR.masterData.SET_PROC_DIV = SET_PROC_DIV;
    // 입출고구분 재세팅
    $NC.setInitComboData({
        selector: "#cboInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        data: SET_PROC_DIV == "1" ? $NC.G_VAR.dsInoutCd.A : $NC.G_VAR.dsInoutCd.D,
        onComplete: function() {
            $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
        }
    });

    // 등록,검색조건 초기화
    // $NC.setValue("#edtQBrand_Cd");
    // $NC.setValue("#edtQBrand_Nm");
    // $NC.setValue("#edtQSet_Item_Cd");
    // $NC.setValue("#edtQSet_Item_Nm");
    // $NC.setValue("#edtQItem_Lot");

    // 구성상품내역 초기화
    $NC.clearGridData(G_GRDSUB);
    // 재고내역 초기화
    $NC.clearGridData(G_GRDDETAIL);

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
        // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
        if ($NC.G_VAR.policyVal.LS210 == "2") {
            // 컬럼 표시 조정
            grdDetailOnSetColumns();
        }
        // 재고 관리 기준 : 1 - 입고일자별 관리
        else {
            $NC.setVisible("#tdQDsp_Valid_Date", false);
            $NC.setVisible("#tdQDsp_Batch_No", false);
        }
    });
}

/**
 * 세트상품 검색 팝업 표시
 */
function showSetItemPopup() {

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", $ND.C_ALL);

    $NP.showItemPopup({
        requestUrl: "/LCC02040E0/getDataSet.do",
        queryId: "LCC02040E0.RS_SUB3",
        queryParams: {
            P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onSetItemPopup, function() {
        $NC.setFocus("#edtQSet_Item_Cd", true);
    });
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onSetItemPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
        $NC.setValue("#edtQSet_Item_Cd", resultInfo.ITEM_CD);
        $NC.setValue("#edtQSet_Item_Nm", resultInfo.ITEM_NM);

    } else {
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setValue("#edtQSet_Item_Cd");
        $NC.setValue("#edtQSet_Item_Nm");
        $NC.setFocus("#edtQSet_Item_Cd", true);
    }

    onChangingCondition();
}

/**
 * 브랜드 검색 팝업 클릭
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
    $NC.setValue("#edtQSet_Item_Cd");
    $NC.setValue("#edtQSet_Item_Nm");

    onChangingCondition();
}

function grdDetailOnCalc(rowData, changedColumnId) {

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