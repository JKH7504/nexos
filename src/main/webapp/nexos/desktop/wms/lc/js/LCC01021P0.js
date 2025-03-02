﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC01021P0
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
        dsInoutCd: {
            // 조립, assemble
            A: null,
            // 해체, disassemble
            D: null
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnNewItem").click(_New);
    $("#btnDeleteItem").click(_Delete);
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnSave").click(_Save); // 저장 버튼

    $NC.setEnable("#edtCenter_Cd_F", false); // 물류센터 비활성화
    $NC.setEnable("#edtBu_Cd", false); // 사업부 비활성화
    $NC.setEnable("#edtOrder_No", false); // 입출고번호 비활성화

    $NC.setInitDatePicker("#dtpOrder_Date"); // 예정일자

    grdDetailInitialize();
    grdSubInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);

    var ORDER_DATE, SET_PROC_DIV;
    // 신규 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER_CREATE) {

        $NC.setValue("#dtpOrder_Date", $NC.G_VAR.G_PARAMETER.P_ORDER_DATE);
        ORDER_DATE = $NC.getValue("#dtpOrder_Date");
        SET_PROC_DIV = $NC.getValueRadioGroup("rgbSet_Proc_Div");

        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            ORDER_DATE: ORDER_DATE,
            ORDER_NO: "",
            INOUT_CD: "",
            ETC_STATE: $ND.C_STATE_ORDER,
            BU_DATE: "",
            BU_NO: "",
            LINK_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            LINK_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            LINK_ORDER_DATE: ORDER_DATE,
            LINK_ORDER_NO: "",
            LINK_BU_DATE: "",
            LINK_BU_NO: "",
            DATA_DIV: "00",
            REMARK1: "",
            CRUD: $ND.C_DV_CRUD_C
        };
    }
    // 예정 -> 등록
    else {
        var dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
        ORDER_DATE = $NC.getValue("#dtpOrder_Date");
        SET_PROC_DIV = dsMaster.INOUT_WORK_DIV;
        $NC.setValueRadioGroup("rgbSet_Proc_Div", SET_PROC_DIV);

        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: dsMaster.CENTER_CD,
            BU_CD: dsMaster.BU_CD,
            ORDER_DATE: dsMaster.ORDER_DATE,
            ORDER_NO: dsMaster.ORDER_NO,
            INOUT_CD: dsMaster.INOUT_CD,
            ETC_STATE: $ND.C_STATE_ORDER,
            BU_DATE: dsMaster.BU_DATE,
            BU_NO: dsMaster.BU_NO,
            LINK_CENTER_CD: dsMaster.LINK_CENTER_CD,
            LINK_BU_CD: dsMaster.LINK_BU_CD,
            LINK_ORDER_DATE: dsMaster.LINK_ORDER_DATE,
            LINK_ORDER_NO: dsMaster.LINK_ORDER_NO,
            LINK_BU_DATE: dsMaster.LINK_BU_DATE,
            LINK_BU_NO: dsMaster.LINK_BU_NO,
            DATA_DIV: dsMaster.DATA_DIV,
            REMARK1: dsMaster.REMARK1,
            CRUD: $ND.C_DV_CRUD_R
        };

        // 마스터 데이터 세팅
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);

        $NC.setValue("#dtpOrder_Date", dsMaster.ORDER_DATE);
        $NC.setValue("#edtOrder_No", dsMaster.ORDER_NO);
        $NC.setValue("#edtBu_Date", dsMaster.BU_DATE);
        $NC.setValue("#edtBu_No", dsMaster.BU_NO);

        // 예정으로 등록시 비활성화
        $NC.setEnable("#dtpOrder_Date", false);
        $NC.setEnable("#rgbSet_Proc_Div1", false);
        $NC.setEnable("#rgbSet_Proc_Div2", false);
        $NC.setEnable("#cboInout_Cd", false);

        var dsDetail = $NC.G_VAR.G_PARAMETER.P_DETAIL_DS;
        var rowData, newRowData, rIndex, rCount;
        G_GRDDETAIL.data.beginUpdate();
        try {
            for (rIndex = 0, rCount = dsDetail.length; rIndex < rCount; rIndex++) {
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
                    SET_ITEM_QTY: rowData.SET_ITEM_QTY,
                    ORDER_QTY: rowData.ORDER_QTY,
                    ORDER_EA: rowData.ORDER_EA,
                    ORDER_BOX: rowData.ORDER_BOX,
                    id: $NC.getGridNewRowId(),
                    CRUD: $ND.C_DV_CRUD_R
                };
                G_GRDDETAIL.data.addItem(newRowData);
            }
        } finally {
            G_GRDDETAIL.data.endUpdate();
        }

        $NC.setGridSelectRow(G_GRDDETAIL, 0);

        var dsSub = $NC.G_VAR.G_PARAMETER.P_SUB_DS;
        G_GRDSUB.data.beginUpdate();
        try {
            for (rIndex = 0, rCount = dsSub.length; rIndex < rCount; rIndex++) {
                rowData = dsSub[rIndex];
                if (Number(rowData.ORDER_QTY) < 1) {
                    continue;
                }
                newRowData = {
                    CENTER_CD: rowData.CENTER_CD,
                    BU_CD: rowData.BU_CD,
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
                    SET_ITEM_QTY: rowData.SET_ITEM_QTY,
                    ORDER_QTY: rowData.ORDER_QTY,
                    ORDER_EA: rowData.ORDER_EA,
                    ORDER_BOX: rowData.ORDER_BOX,
                    id: $NC.getGridNewRowId(),
                    CRUD: $ND.C_DV_CRUD_R
                };
                G_GRDSUB.data.addItem(newRowData);
            }
        } finally {
            G_GRDSUB.data.endUpdate();
        }

        $NC.setGridSelectRow(G_GRDSUB, 0);
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
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ORDER_CREATE) {
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
 * 상품추가 버튼 클릭 이벤트 처리
 */
function _New() {

    var newRowData;

    if (G_GRDDETAIL.data.getLength() > 0) {
        alert($NC.getDisplayMsg("JS.LCC01021P0.005", "하나의 세트상품만 추가 가능합니다."));
        return;
    }

    newRowData = {
        CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        BU_CD: $NC.G_VAR.masterData.BU_CD,
        ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
        ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
        ETC_STATE: $ND.C_STATE_ORDER,
        BRAND_CD: "",
        LINE_NO: 1,
        ITEM_CD: "",
        ITEM_STATE: $ND.C_BASE_ITEM_STATE,
        ITEM_STATE_F: $NC.getGridComboName(G_GRDDETAIL, {
            columnId: "ITEM_STATE_F",
            searchVal: $ND.C_BASE_ITEM_STATE,
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        }),
        ITEM_SPEC: "",
        ITEM_LOT: $ND.C_BASE_ITEM_LOT,
        QTY_IN_BOX: 1,
        IN_UNIT_DIV_F: "",
        ORDER_QTY: 0,
        ORDER_BOX: 0,
        ORDER_EA: 0,
        ENTRY_QTY: 0,
        REMARK1: "",
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDDETAIL, newRowData);
}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Save() {

    if (G_GRDDETAIL.data.getLength() == 0 || G_GRDSUB.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC01021P0.006", "저장할 데이터가 없습니다."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC01021P0.007", "물류센터를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC01021P0.008", "사업부를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LCC01021P0.009", "먼저 입출고구분을 선택하십시오."));
        $NC.setFocus("#cboInout_Cd");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.ORDER_DATE)) {
        alert($NC.getDisplayMsg("JS.LCC01021P0.010", "먼저 입출고일자를 입력하십시오."));
        $NC.setFocus("#dtpOrder_Date");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }
    // 세트상품정보 그리드 저장
    var dsSetItem = [];
    var dsSetItemD = [];
    var dsSetItemC = [];
    var dsSetItemTarget = G_GRDDETAIL.data.getItems();
    var rowDataD, rIndex, rCount;
    for (rIndex = 0, rCount = dsSetItemTarget.length; rIndex < rCount; rIndex++) {
        rowDataD = dsSetItemTarget[rIndex];
        if (rowDataD.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        } else if (rowDataD.CRUD == $ND.C_DV_CRUD_D) {
            dsSetItem = dsSetItemD;
        } else {
            dsSetItem = dsSetItemC;
        }
        if (Number(rowDataD.ORDER_QTY) < 1) {
            continue;
        }
        dsSetItem.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: rowDataD.ORDER_NO,
            P_LINE_NO: rowDataD.LINE_NO,
            P_ETC_STATE: rowDataD.ETC_STATE,
            P_BRAND_CD: rowDataD.BRAND_CD,
            P_ITEM_CD: rowDataD.ITEM_CD,
            P_ITEM_STATE: rowDataD.ITEM_STATE,
            P_ITEM_LOT: rowDataD.ITEM_LOT,
            P_ORDER_QTY: rowDataD.ORDER_QTY,
            P_ENTRY_QTY: rowDataD.ENTRY_QTY,
            P_BU_LINE_NO: rowDataD.BU_LINE_NO,
            P_BU_KEY: rowDataD.BU_KEY,
            P_LINK_LINE_NO: rowDataD.LINK_LINE_NO,
            P_LINK_BU_LINE_NO: rowDataD.LINK_BU_LINE_NO,
            P_LINK_BU_KEY: rowDataD.LINK_BU_KEY,
            P_ETC_DIV: rowDataD.ETC_DIV,
            P_ETC_COMMENT: rowDataD.ETC_COMMENT,
            P_REMARK1: rowDataD.REMARK1,
            P_CRUD: rowDataD.CRUD
        });
    }

    // 에러방지 위해, 신규 + 삭제 순으로 DS 구성
    dsSetItem = dsSetItemD.concat(dsSetItemC);

    // 지시내역 그리드 저장
    var dsItem = [];
    var dsItemD = [];
    var dsItemC = [];
    var dsItemTarget = G_GRDSUB.data.getItems();
    var rowDataS;
    for (rIndex = 0, rCount = dsItemTarget.length; rIndex < rCount; rIndex++) {
        rowDataS = dsItemTarget[rIndex];
        if (rowDataS.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        } else if (rowDataS.CRUD == $ND.C_DV_CRUD_D) {
            dsItem = dsItemD;
        } else {
            dsItem = dsItemC;
        }
        if (Number(rowDataS.ORDER_QTY) < 1) {
            continue;
        }
        dsItem.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: rowDataS.ORDER_NO,
            P_LINE_NO: rowDataS.LINE_NO,
            P_ETC_STATE: $ND.C_STATE_ORDER,
            P_BRAND_CD: rowDataS.BRAND_CD,
            P_ITEM_CD: rowDataS.ITEM_CD,
            P_ITEM_STATE: rowDataD.ITEM_STATE,
            P_ITEM_LOT: $ND.C_BASE_ITEM_LOT,
            P_ORDER_QTY: rowDataS.ORDER_QTY,
            P_ENTRY_QTY: rowDataS.ENTRY_QTY,
            P_BU_LINE_NO: rowDataS.BU_LINE_NO,
            P_BU_KEY: rowDataS.BU_KEY,
            P_LINK_LINE_NO: rowDataD.LINE_NO,
            P_LINK_BU_LINE_NO: rowDataD.BU_LINE_NO,
            P_LINK_BU_KEY: rowDataD.BU_KEY,
            P_ETC_DIV: rowDataS.ETC_DIV,
            P_ETC_COMMENT: rowDataS.ETC_COMMENT,
            P_REMARK1: rowDataS.REMARK1,
            P_CRUD: rowDataS.CRUD
        });
    }

    // 에러방지 위해, 삭제 + 신규 순으로 DS 구성
    dsItem = dsItemD.concat(dsItemC);

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_C) {
        if (dsItem.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC01021P0.011", "저장할 구성상품 정보가 없습니다."));
            return;
        }
    } else {
        if ($NC.G_VAR.masterData.CRUD != $ND.C_DV_CRUD_U && dsItem.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC01021P0.012", "수정 후 저장하십시오."));
            return;
        }
    }

    var SET_PROC_DIV = $NC.getValueRadioGroup("rgbSet_Proc_Div");

    $NC.serviceCall("/LCC01020E0/save.do", {
        P_DS_MASTER: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
            P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
            P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
            P_ETC_STATE: $NC.G_VAR.masterData.ETC_STATE,
            P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
            P_BU_NO: $NC.G_VAR.masterData.BU_NO,
            P_LINK_CENTER_CD: $NC.G_VAR.masterData.LINK_CENTER_CD,
            P_LINK_BU_CD: $NC.G_VAR.masterData.LINK_BU_CD,
            P_LINK_ORDER_DATE: $NC.G_VAR.masterData.LINK_ORDER_DATE,
            P_LINK_ORDER_NO: $NC.G_VAR.masterData.LINK_ORDER_NO,
            P_LINK_BU_DATE: $NC.G_VAR.masterData.LINK_BU_DATE,
            P_LINK_BU_NO: $NC.G_VAR.masterData.LINK_BU_NO,
            P_DATA_DIV: $NC.G_VAR.masterData.DATA_DIV,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_CRUD: $NC.G_VAR.masterData.CRUD
        },
        P_DS_DETAIL: $NC.iif(SET_PROC_DIV == 1, dsSetItem, dsItem),
        P_DS_SUB: $NC.iif(SET_PROC_DIV == 1, dsItem, dsSetItem),
        P_PROCESS_CD: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제 버튼 클릭 이벤트 처리(지시내역 그리드 행 삭제)
 */
function _Delete() {

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC01021P0.013", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowDataD = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제, 그외 CRUD를 "D"로 변경
    $NC.deleteGridRowData(G_GRDDETAIL, rowDataD, true);

    var dsTarget = G_GRDSUB.data.getItems();
    var rowDataS, rIndex;

    for (rIndex = dsTarget.length - 1; rIndex >= 0; rIndex--) {
        rowDataS = dsTarget[rIndex];
        $NC.deleteGridRowData(G_GRDSUB, rowDataS, true);
    }
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

    switch (args.col) {
        case "ORDER_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LCC01021P0.014", "입출고일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.ORDER_DATE = $NC.getValue("#dtpOrder_Date");
            $NC.G_VAR.masterData.LINK_ORDER_DATE = $NC.getValue("#dtpOrder_Date");
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
        name: "상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: onSetItemPopup,
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
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
        name: "예정EA",
        cssClass: "styRight",
        editor: Slick.Editors.Number
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
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: null,
        sortCol: "ITEM_CD",
        gridOptions: options,
        canExportExcel: false,
        onFilter: grdDetailOnFilter
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

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "ITEM_CD", true);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    if (rowData.CRUD == $ND.C_DV_CRUD_R || rowData.CRUD == $ND.C_DV_CRUD_U) {
        switch (args.column.id) {
            case "ITEM_CD":
            case "ITEM_STATE_F":
                return false;
        }
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

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", $ND.C_ALL);
    var rowData = args.item;
    switch (G_GRDDETAIL.view.getColumnId(args.cell)) {
        case "ITEM_CD":
            $NP.onItemChange(rowData.ITEM_CD, {
                P_CUST_CD: $NC.G_VAR.G_PARAMETER.P_CUST_CD,
                P_BRAND_CD: BRAND_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_VIEW_DIV: "2"
            }, grdSetItemPopup, {
                queryId: "LCC01020E0.RS_SUB1"
            });
            return;
        case "ORDER_QTY":
        case "ORDER_BOX":
        case "ORDER_EA":
            var columnId = G_GRDDETAIL.view.getColumnId(args.cell);
            rowData = grdDetailOnCalc(rowData, columnId);
            if ($NC.isNull(rowData.ORDER_QTY)) {
                alert($NC.getDisplayMsg("JS.LCC01021P0.015", "예정수량을 정확히 입력하십시오."));
                rowData.ORDER_QTY = 0;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, "ORDER_QTY", true);
            }
            if (rowData.ORDER_QTY < 1) {
                alert($NC.getDisplayMsg("JS.LCC01021P0.016", "변환수량에 0보다 큰 수량을 입력하십시오."));
                rowData.ORDER_QTY = args.oldItem.ORDER_QTY;
                rowData.ORDER_BOX = args.oldItem.ORDER_BOX;
                rowData.ORDER_EA = args.oldItem.ORDER_EA;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, "ORDER_QTY", true);
            }
            rowData = grdDetailOnCalc(rowData);

            // 구성상품내역 변환수량 변경
            G_GRDSUB.data.beginUpdate();
            try {
                var subRowData;
                for (var rIndex = 0, rCount = G_GRDSUB.data.getLength(); rIndex < rCount; rIndex++) {
                    subRowData = G_GRDSUB.data.getItem(rIndex);
                    subRowData.ORDER_QTY = subRowData.SET_ITEM_QTY * rowData.ORDER_QTY;
                    subRowData.ORDER_BOX = $NC.getBBox(subRowData.ORDER_QTY, subRowData.QTY_IN_BOX);
                    subRowData.ORDER_EA = $NC.getBEa(subRowData.ORDER_QTY, subRowData.QTY_IN_BOX);
                    if (subRowData.CRUD == $ND.C_DV_CRUD_R) {
                        subRowData.CRUD = $ND.C_DV_CRUD_U;
                    }
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
 * grdDetail 데이터(세트상품정보 데이터) 필터링 이벤트
 */
function grdDetailOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

/**
 * 세트상품정보 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row)) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ORDER_QTY) || Number(rowData.ORDER_QTY) < 1) {
            alert($NC.getDisplayMsg("JS.LCC01021P0.016", "변환수량에 0보다 큰 수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ORDER_QTY", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
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
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "변환수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "변환BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
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
        queryId: "LCC01020E0.RS_SUB2",
        sortCol: "ITEM_CD",
        gridOptions: options,
        canExportExcel: false,
        onFilter: grdSubOnFilter
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
 * grdSub 데이터(구성장품정보 데이터) 필터링 이벤트
 */
function grdSubOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

/**
 * 구성상품내역 검색후 처리
 * 
 * @param ajaxData
 */
function onGetSub(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var dsSub = G_GRDSUB.data.getItems();
    var rowData, rIndex, rCount;

    if (dsSub.length > 0) {
        for (rIndex = dsSub.length - 1; rIndex >= 0; rIndex--) {
            rowData = dsSub[rIndex];
            if (rowData.CRUD == $ND.C_DV_CRUD_D) {
                continue;
            }
            if (rowData.CRUD == $ND.C_DV_CRUD_C) {
                $NC.deleteGridRowData(G_GRDSUB, rowData, true);
            }
        }
    }

    for (rIndex = 0, rCount = resultData.length; rIndex < rCount; rIndex++) {
        rowData = resultData[rIndex];
        rowData.CRUD = $ND.C_DV_CRUD_C;
        $NC.newGridRowData(G_GRDSUB, rowData);
    }

    $NC.setGridSelectRow(G_GRDSUB, 0);
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
        if (!confirm($NC.getDisplayMsg("JS.LCC01021P0.020", "작업구분를 변경하시면 작업중인 데이터가 초기화됩니다.\n\n작업구분를 변경하시겠습니까?"))) {
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
 * 세트상품 검색 팝업 표시
 */
function onSetItemPopup() {

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", $ND.C_ALL);

    $NP.showItemPopup({
        requestUrl: "/LCC01020E0/getDataSet.do",
        queryId: "LCC01020E0.RS_SUB1",
        queryParams: {
            P_CUST_CD: $NC.G_VAR.G_PARAMETER.P_CUST_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, grdSetItemPopup);
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function grdSetItemPopup(resultInfo) {

    var focusCol;
    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        rowData.ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_BAR_CD = resultInfo.ITEM_BAR_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
        rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
        rowData.IN_UNIT_DIV_F = resultInfo.IN_UNIT_DIV_F;
        rowData.BRAND_CD = resultInfo.BRAND_CD;
        rowData.BRAND_NM = resultInfo.BRAND_NM;
        rowData.ORDER_QTY = "0";
        rowData.ORDER_BOX = "0";
        rowData.ORDER_EA = "0";

        focusCol = G_GRDDETAIL.view.getColumnIndex("ORDER_QTY");

        // 파라메터 세팅
        G_GRDSUB.queryParams = {
            P_BRAND_CD: resultInfo.BRAND_CD,
            P_ITEM_CD: resultInfo.ITEM_CD
        };

        // 데이터 조회
        $NC.serviceCall("/LCC01020E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
    } else {
        rowData.ITEM_CD = "";
        rowData.ITEM_BAR_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";
        rowData.QTY_IN_BOX = "1";
        rowData.IN_UNIT_DIV_F = "";
        rowData.BRAND_CD = "";
        rowData.BRAND_NM = "";
        rowData.ORDER_QTY = "0";
        rowData.ORDER_BOX = "0";
        rowData.ORDER_EA = "0";

        focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
        $NC.clearGridData(G_GRDSUB);
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);

    $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

function grdDetailOnCalc(rowData, changedColumnId) {

    switch (changedColumnId) {
        case "ORDER_BOX":
        case "ORDER_EA":
            rowData.ORDER_QTY = $NC.getBQty(rowData.ORDER_BOX, rowData.ORDER_EA, rowData.QTY_IN_BOX);
            break;
    }

    rowData.ORDER_BOX = $NC.getBBox(rowData.ORDER_QTY, rowData.QTY_IN_BOX);
    rowData.ORDER_EA = $NC.getBEa(rowData.ORDER_QTY, rowData.QTY_IN_BOX);

    return rowData;
}