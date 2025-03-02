﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOM07023P0
 *  프로그램명         : 온라인출고 반입요청 팝업
 *  프로그램설명       : 온라인출고 반입요청 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-05-19
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-05-19    ASETEC           신규작성
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
            container: "#divMasterView",
            grids: [
                "#grdMaster"
            ],
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        },
        // 체크할 정책 값
        policyVal: {
            LS210: "", // 재고 관리 기준
            RI190: "", // 공급금액 계산정책
            RI240: "" // 반입 기본 상품상태 기준
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onClose); // 닫기 버튼
    $("#btnReturnSave").click(_Save); // 저장 버튼

    $NC.setVisible("#tdSend_DateTime", false);

    $NC.setTooltip("#btnReturnSave", $NC.getDisplayMsg("JS.LOM07023P0.001", "반품요청"));
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCarrier_Cd", $NC.G_VAR.G_PARAMETER.P_CARRIER_CD);
    $NC.setValue("#edtCarrier_Nm", $NC.G_VAR.G_PARAMETER.P_CARRIER_NM);
    $NC.setValue("#edtWb_No", $NC.G_VAR.G_PARAMETER.P_WB_NO);
    $NC.setValue("#edtOutbound_Date", $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE);
    $NC.setValue("#edtOutbound_No", $NC.G_VAR.G_PARAMETER.P_OUTBOUND_NO);
    $NC.setValue("#edtBu_Date", $NC.G_VAR.G_PARAMETER.P_BU_DATE);
    $NC.setValue("#edtBu_No", $NC.G_VAR.G_PARAMETER.P_BU_NO);
    $NC.setValue("#edtOrderer_Nm", $NC.G_VAR.G_PARAMETER.P_ORDERER_NM);
    $NC.setValue("#edtShipper_Nm", $NC.G_VAR.G_PARAMETER.P_SHIPPER_NM);
    $NC.setValue("#edtDelivery_Cd", $NC.G_VAR.G_PARAMETER.P_DELIVERY_CD);
    $NC.setValue("#edtDelivery_Nm", $NC.G_VAR.G_PARAMETER.P_DELIVERY_NM);
    $NC.setValue("#edtShipper_Zip_Cd", $NC.G_VAR.G_PARAMETER.P_SHIPPER_ZIP_CD);
    $NC.setValue("#edtShipper_Addr_Basic", $NC.G_VAR.G_PARAMETER.P_SHIPPER_ADDR_BASIC);
    $NC.setValue("#edtShipper_Addr_Detail", $NC.G_VAR.G_PARAMETER.P_SHIPPER_ADDR_DETAIL);

    _Inquiry();
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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.G_VAR.G_PARAMETER.P_CENTER_CD;
    var BU_CD = $NC.G_VAR.G_PARAMETER.P_BU_CD;
    var OUTBOUND_DATE = $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE;
    var OUTBOUND_NO = $NC.G_VAR.G_PARAMETER.P_OUTBOUND_NO;
    var BOX_NO = $NC.G_VAR.G_PARAMETER.P_BOX_NO;

    var queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_NO: OUTBOUND_NO,
        P_BOX_NO: BOX_NO,
        P_POLICY_RI240: $NC.G_VAR.G_PARAMETER.P_POLICY_RI240
    };

    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = queryParams;
    // 데이터 조회
    $NC.serviceCall("/LOM07020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var CUST_CD = null;
    var WB_NO = $NC.G_VAR.G_PARAMETER.P_WB_NO;
    if ($NC.isNull(WB_NO)) {
        alert($NC.getDisplayMsg("JS.LOM07023P0.002", "출고 택배송장이 없는 전표는 반품요청 불가능 합니다."));
        return;
    }
    var RI_ORDER_NO = $NC.G_VAR.G_PARAMETER.P_RI_ORDER_NO;
    if ($NC.isNotNull(RI_ORDER_NO)) {
        alert($NC.getDisplayMsg("JS.LOM07023P0.003", "해당 택배송장번호에 대해 반품요청 한 내역이 존재 합니다.\n신규 등록하려면, 반품예정작업[B2C]화면에서 삭제 후 다시 작업 하세요."));
        return;
    }

    if ($NC.getValueRadioGroup("rgbSend_Div") == "2") {
        if (!confirm($NC.getDisplayMsg("JS.LOM07023P0.004", "[택배사 반품요청 송신 안함]\n저장하시겠습니까?"))) {
            return;
        }
    } else {
        if (!confirm($NC.getDisplayMsg("JS.LOM07023P0.005", "저장하시겠습니까?"))) {
            return;
        }
    }

    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var dsTarget = G_GRDMASTER.data.getItems();
    var dsDetail = [];
    var rowData;
    for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.RETURN_QTY == 0) {
            continue;
        }
        CUST_CD = rowData.CUST_CD;
        dsDetail.push({
            P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            P_ORDER_DATE: $NC.G_USERINFO.LOGIN_DATE,
            P_ORDER_NO: "",
            P_LINE_NO: "",
            P_INBOUND_STATE: $ND.C_STATE_ORDER,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: rowData.ITEM_LOT,
            P_VALID_DATE: rowData.VALID_DATE,
            P_BATCH_NO: rowData.BATCH_NO,
            P_ORDER_QTY: rowData.RETURN_QTY,
            P_ENTRY_QTY: rowData.RETURN_QTY,
            P_SUPPLY_PRICE: rowData.SUPPLY_PRICE,
            P_DC_PRICE: rowData.DC_PRICE,
            P_APPLY_PRICE: rowData.APPLY_PRICE,
            P_SUPPLY_AMT: rowData.SUPPLY_AMT,
            P_VAT_YN: rowData.VAT_YN,
            P_VAT_AMT: rowData.VAT_AMT,
            P_DC_AMT: rowData.DC_AMT,
            P_TOTAL_AMT: rowData.TOTAL_AMT,
            P_BU_LINE_NO: "",
            P_BU_KEY: $NC.G_VAR.G_PARAMETER.P_CENTER_CD + "-" //
                + $NC.G_VAR.G_PARAMETER.P_BU_CD + "-" //
                + $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE.replace(/\-/gi, "") + "-" //
                + $NC.G_VAR.G_PARAMETER.P_OUTBOUND_NO + "-" //
                + rowData.LINE_NO, // A1-0000-20210101-000001-1
            P_RETURN_DIV: rowData.RETURN_DIV,
            P_RETURN_COMMENT: rowData.RETURN_COMMENT,
            P_REMARK1: rowData.REMARK1
        });
    }

    if (dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM07023P0.006", "반품수량 입력 후 저장하십시오."));
        return;
    }

    var WB_REMARK1 = $NC.getValue("#edtWb_Remark1");
    var REMARK1 = $NC.getValue("#edtRemark1");
    var SEND_STATE = $NC.getValueRadioGroup("rgbSend_Div") == "2" ? "XX" : ""; // 송신안할(2) 경우 'XX' 설정
    var RI_BU_NO = $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE.replace(/\-/gi, "") + "-" //
        + $NC.G_VAR.G_PARAMETER.P_OUTBOUND_NO + "-" //
        + $NC.G_VAR.G_PARAMETER.P_BOX_NO;

    $NC.serviceCall("/LOM07020E0/returnSave.do", {
        P_DS_MASTER: {
            P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            P_ORDER_DATE: $NC.G_USERINFO.LOGIN_DATE,
            P_ORDER_NO: "",
            P_INOUT_CD: "EM0",
            P_INBOUND_STATE: $ND.C_STATE_ORDER,
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $NC.G_VAR.G_PARAMETER.P_DELIVERY_CD,
            P_RDELIVERY_CD: $NC.G_VAR.G_PARAMETER.P_RDELIVERY_CD,
            P_BU_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE,
            P_BU_NO: RI_BU_NO,
            P_ORG_BU_NO: $NC.G_VAR.G_PARAMETER.P_WB_NO,
            P_RHDC_DIV: rowData.RHDC_DIV,
            P_SEND_STATE: SEND_STATE,
            P_REMARK1: REMARK1
        },
        P_DS_DETAIL: dsDetail,
        P_DS_SUB: {
            P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            P_ORDER_DATE: $NC.G_USERINFO.LOGIN_DATE,
            P_ORDER_NO: "",
            P_MALL_MSG: $NC.G_VAR.G_PARAMETER.P_MALL_MSG,
            P_ORDERER_CD: $NC.G_VAR.G_PARAMETER.P_ORDERER_CD,
            P_ORDERER_NM: $NC.G_VAR.G_PARAMETER.P_ORDERER_NM,
            P_ORDERER_TEL: $NC.G_VAR.G_PARAMETER.P_ORDERER_TEL,
            P_ORDERER_HP: $NC.G_VAR.G_PARAMETER.P_ORDERER_HP,
            P_ORDERER_EMAIL: $NC.G_VAR.G_PARAMETER.P_ORDERER_EMAIL,
            P_ORDERER_MSG: $NC.G_VAR.G_PARAMETER.P_ORDERER_MSG,
            P_SHIPPER_NM: $NC.G_VAR.G_PARAMETER.P_SHIPPER_NM,
            P_SHIPPER_TEL: $NC.G_VAR.G_PARAMETER.P_SHIPPER_TEL,
            P_SHIPPER_HP: $NC.G_VAR.G_PARAMETER.P_SHIPPER_HP,
            P_SHIPPER_ZIP_CD: $NC.G_VAR.G_PARAMETER.P_SHIPPER_ZIP_CD,
            P_SHIPPER_ADDR_BASIC: $NC.G_VAR.G_PARAMETER.P_SHIPPER_ADDR_BASIC,
            P_SHIPPER_ADDR_DETAIL: $NC.G_VAR.G_PARAMETER.P_SHIPPER_ADDR_DETAIL,
            P_REMARK1: WB_REMARK1
        },
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);

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

function grdMasterOnGetColumns() {

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
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_QTY",
        field: "RETURN_QTY",
        name: "반품수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_DIV_F",
        field: "RETURN_DIV_F",
        name: "반품사유구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "RI.RETURN_DIV",
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
        id: "REMARK1",
        field: "REMARK1",
        name: "비고1",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDMASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOM07020E0.RS_SUB2",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);

}

function grdMasterOnBeforeEditCell(e, args) {

    return true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "RETURN_QTY":
            var RETURN_QTY = Number(rowData.RETURN_QTY);
            if (RETURN_QTY < 0) {
                alert($NC.getDisplayMsg("JS.LOM07023P0.007", "반품수량이 0보다 작을 수 없습니다."));
                rowData.RETURN_QTY = args.oldItem.RETURN_QTY;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                break;
            }
            // 그리드.ORDER_LINE_NO > 0 && 출고구분 != "D20" && 등록수량>예정수량일 경우 에러
            if (Number(rowData.CONFIRM_QTY) < RETURN_QTY) {
                alert($NC.getDisplayMsg("JS.LOM07023P0.008", "반품수량이 출고수량을 초과할 수 없습니다."));
                rowData.RETURN_QTY = args.oldItem.RETURN_QTY;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                break;
            }
            rowData = grdDetailOnCalc(rowData);
            break;
        case "RETURN_DIV_F":
            $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("RETURN_COMMENT"), true);
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(rowData.VALID_DATE)) {
                if (!$NC.isDate(rowData.VALID_DATE)) {
                    alert($NC.getDisplayMsg("JS.LOM07023P0.009", "유통기한을 정확히 입력하십시오."));
                    rowData.VALID_DATE = "";
                    $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                } else {
                    rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    var rowData = G_GRDMASTER.data.getItem(row);
    if ($NC.isNull(rowData.RETURN_QTY)) {
        alert($NC.getDisplayMsg("JS.LOM07023P0.010", "반품수량을 입력하십시오."));
        $NC.setFocusGrid(G_GRDMASTER, row, "RETURN_QTY", true);
        return false;
    }
    var RETURN_QTY = Number(rowData.RETURN_QTY);
    if ($NC.isNotNull(rowData.RETURN_QTY) && RETURN_QTY > 0 && $NC.isNull(rowData.RETURN_DIV)) {
        alert($NC.getDisplayMsg("JS.LOM07023P0.011", "반품사유구분을 입력하십시오."));
        $NC.setGridSelectRow(G_GRDMASTER, {
            selectRow: row,
            activeCell: G_GRDMASTER.view.getColumnIndex("RETURN_DIV_F"),
            editMode: true
        });
        return false;
    }
    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);

}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 송장추가발행 저장 완료
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

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setValue("#edtOrder_Date", rowData.RI_ORDER_DATE);
    $NC.setValue("#edtOrder_No", rowData.RI_ORDER_NO);
    $NC.setValue("#edtRemark1", rowData.MASTER_REMARK1);
    $NC.setValue("#edtWb_Remark1", rowData.WB_REMARK1);
    $NC.setValue("#rgbSend_Div1", rowData.SEND_DIV == "1");
    $NC.setValue("#rgbSend_Div2", rowData.SEND_DIV == "2");
    $NC.setValue("#etdSend_DateTime", rowData.SEND_DATETIME);

    $NC.setVisible("#tdSend_DateTime", $NC.isNotNull(rowData.RI_ORDER_NO) && rowData.SEND_DIV == "1");
    $NC.setEnable("#btnReturnSave", $NC.isNull(rowData.RI_ORDER_NO));

}

function grdDetailOnCalc(rowData, orderQty) {

    var calcParams = {
        ITEM_PRICE: rowData.SUPPLY_PRICE,// 매입단가 또는 공급단가
        APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
        ITEM_QTY: rowData.RETURN_QTY,// 상품수량
        ITEM_AMT: rowData.SUPPLY_AMT,// 매입금액 또는 공급금액
        VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
        VAT_AMT: rowData.VAT_AMT,// 부가세
        DC_AMT: rowData.DC_AMT,// 할인금액
        TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
        POLICY_VAL: $NC.G_VAR.G_PARAMETER.P_POLICY_RI190
    };

    rowData.SUPPLY_AMT = $NC.getItemAmt(calcParams);
    rowData.VAT_AMT = $NC.getVatAmt(calcParams);
    rowData.TOTAL_AMT = $NC.getTotalAmt(calcParams);
    return rowData;
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD
    }, function() {
        $NC.G_VAR.G_PARAMETER.P_POLICY_RI190 = $NC.G_VAR.policyVal.RI190;
        $NC.G_VAR.G_PARAMETER.P_POLICY_RI240 = $NC.G_VAR.policyVal.RI240;
        $NC.G_VAR.G_PARAMETER.P_POLICY_LS210 = $NC.G_VAR.policyVal.LS210;
        // 유통기한/제조배치번호 지정 정책에 따라 조건 표시 설정
        grdMasterOnSetColumns();
    });
}