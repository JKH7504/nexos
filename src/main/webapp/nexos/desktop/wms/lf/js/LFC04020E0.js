﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LFC04020E0
 *  프로그램명         : 월기타수수료 등록
 *  프로그램설명       : 월기타수수료 등록 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2022-01-05
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2022-01-05    ASETEC           신규작성
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
            ]
        },
        BILL_TB: "LF310NM" // 정산테이블 - 월기타비
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    // 조회조건 - 정산일자 세팅
    $NC.setInitMonthPicker("#mtpQInout_Month");

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
            // 조회조건 - 정산구분 세팅
            onSetBillComboInfo();
        }
    });

    // 조회조건 검색 이미지 클릭
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQContract_No").click(showContractPopup);
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
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            onSetBillComboInfo();
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "INOUT_MONTH":
            $NC.setValueMonthPicker(view, val, $NC.getDisplayMsg("JS.LFC04020E0.001", "작업월을 정확히 입력하십시오."));
            break;
        case "CONTRACT_NO":
            $NP.onContractChange(val, {
                P_CENTER_CD: $NC.getValueCombo("#cboQCenter_Cd"),
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_CONTRACT_NO: val,
                P_BILL_TB: $NC.G_VAR.BILL_TB,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onContractPopup);
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LFC04020E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LFC04020E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var INOUT_DATE = $NC.getValue("#mtpQInout_Month");
    if ($NC.isNull(INOUT_DATE)) {
        alert($NC.getDisplayMsg("JS.LFC04020E0.004", "작업월을 입력하십시오."));
        $NC.setFocus("#mtpQInout_Month");
        return;
    }
    var CONTRACT_NO = $NC.getValue("#edtQContract_No", true);
    var BILL_DIV = $NC.getValue("#cboQBill_Div", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INOUT_DATE: INOUT_DATE + "-01",
        P_CONTRACT_NO: CONTRACT_NO,
        P_BILL_DIV: BILL_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/LFC04020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        BU_CD: $NC.getValue("#edtQBu_Cd"),
        CONTRACT_NO: null,
        CONTRACT_NM: null,
        BILL_DIV: null,
        BILL_DIV_D: null,
        INOUT_DATE: null,
        ETC_MONTHLY_DIV: null,
        UNIT_DIV: null,
        UNIT_DIV_F: null,
        UNIT_PRICE: null,
        BILL_QTY: null,
        BILL_AMT: null,
        FINAL_AMT: null,
        REMARK1: null,
        ADJUST_MONTH: null,
        REG_USER_ID: null,
        REG_DATETIME: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LFC04020E0.005", "저장할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData.CONTRACT_NO_F)) {
        alert($NC.getDisplayMsg("JS.LFC04020E0.012", "계약번호를 선택하십시오."));
        $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, "CONTRACT_NO_F", true);
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 물류센터코드는 저장시 선택된 물류센터로 입력
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var dsMaster = [];
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_CONTRACT_NO: rowData.CONTRACT_NO,
            P_BILL_DIV: rowData.BILL_DIV,
            P_INOUT_DATE: rowData.INOUT_DATE,
            P_ETC_MONTHLY_DIV: rowData.ETC_MONTHLY_DIV,
            P_UNIT_DIV: rowData.UNIT_DIV,
            P_UNIT_PRICE: rowData.UNIT_PRICE,
            P_BILL_QTY: rowData.BILL_QTY,
            P_BILL_AMT: rowData.BILL_AMT,
            P_FINAL_AMT: rowData.FINAL_AMT,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LFC04020E0.006", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LFC04020E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LFC04020E0.007", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LFC04020E0.008", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if (rowData.PROTECT_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LFC04020E0.009", "자료 보안설정이 되어 있어 처리할 수 없습니다."));
        return;
    }

    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.deleteGridRowData(G_GRDMASTER, rowData);
    } else {
        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        _Save();
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "CONTRACT_NO",
            "BILL_DIV",
            "ETC_MONTHLY_DIV",
            "INOUT_DATE"
        ],
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CONTRACT_NO_F",
        field: "CONTRACT_NO_F",
        name: "계약번호",
        summaryTitle: "[합계]",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "BILL_DIV_F",
        field: "BILL_DIV_F",
        name: "정산구분"
    });
    $NC.setGridColumn(columns, {
        id: "EXPENSES_YN",
        field: "EXPENSES_YN",
        name: "정산그룹",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "정산일자",
        cssClass: "styCenter",
        editor: Slick.Editors.Date,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ETC_MONTHLY_DIV_F",
        field: "ETC_MONTHLY_DIV_F",
        name: "월기타비구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "ETC_MONTHLY_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "ETC_MONTHLY_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "UNIT_DIV_F",
        field: "UNIT_DIV_F",
        name: "단위구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "UNIT_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_ATTR04_CD: $ND.C_YES,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "UNIT_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "UNIT_PRICE",
        field: "UNIT_PRICE",
        name: "기준단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_QTY",
        field: "BILL_QTY",
        name: "정산수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "BILL_AMT",
        field: "BILL_AMT",
        name: "정산금액",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true,
            allowMinus: true
        },
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "FINAL_AMT",
        field: "FINAL_AMT",
        name: "최종확정금액",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true,
            allowMinus: true
        },
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_MONTH",
        field: "ADJUST_MONTH",
        name: "정산월",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_SDATE",
        field: "ADJUST_SDATE",
        name: "정산대상시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_EDATE",
        field: "ADJUST_EDATE",
        name: "정산대상종료일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REG_USER_ID",
        field: "REG_USER_ID",
        name: "최초사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "REG_DATETIME",
        field: "REG_DATETIME",
        name: "최초등록일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_USER_ID",
        field: "LAST_USER_ID",
        name: "최종수정자ID"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PROTECT_YN",
        field: "PROTECT_YN",
        name: "보안대상여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 3,
        editable: true,
        autoEdit: true,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LFC04020E0.RS_MASTER",
        sortCol: "CONTRACT_NO",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "CONTRACT_NO_F":
            $NP.showContractBillPopup({
                queryId: "WC.POP_LFBUCONTRACTBILL",
                queryParams: {
                    P_CENTER_CD: rowData.CENTER_CD,
                    P_BU_CD: rowData.BU_CD,
                    P_CONTRACT_NO: $ND.C_ALL,
                    P_BILL_TB: $NC.G_VAR.BILL_TB,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }, grdMasterOnContractBillPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            return;
    }
}

function grdMasterOnContractBillPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.CONTRACT_NO = resultInfo.CONTRACT_NO;
        rowData.CONTRACT_NM = resultInfo.CONTRACT_NM;
        rowData.CONTRACT_NO_F = resultInfo.CONTRACT_NO_F;
        rowData.BILL_DIV = resultInfo.BILL_DIV;
        rowData.BILL_DIV_D = resultInfo.BILL_DIV_D;
        rowData.BILL_DIV_F = resultInfo.BILL_DIV_F;
        rowData.EXPENSES_YN = resultInfo.EXPENSES_YN;
        rowData.ADJUST_DATE = null;
        rowData.UNIT_DIV = null;
        rowData.UNIT_DIV_F = null;
        rowData.UNIT_PRICE = null;
        rowData.BILL_QTY = null;
        rowData.BILL_AMT = null;
        rowData.FINAL_AMT = null;

        focusCol = G_GRDMASTER.view.getColumnIndex("INOUT_DATE");
    } else {
        rowData.CONTRACT_NO = "";
        rowData.CONTRACT_NM = "";
        rowData.CONTRACT_NO_F = "";
        rowData.BILL_DIV = "";
        rowData.BILL_DIV_D = "";
        rowData.BILL_DIV_F = "";
        rowData.EXPENSES_YN = "";
        rowData.ADJUST_DATE = null;
        rowData.UNIT_DIV = null;
        rowData.UNIT_DIV_F = null;
        rowData.UNIT_PRICE = null;
        rowData.BILL_QTY = null;
        rowData.BILL_AMT = null;
        rowData.FINAL_AMT = null;

        focusCol = G_GRDMASTER.view.getColumnIndex("CONTRACT_NO_F");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 그리드의 편집 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "CONTRACT_NO_F":
            $NP.onContractBillChange(rowData.CONTRACT_NO_F, {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_CONTRACT_NO: rowData.CONTRACT_NO_F,
                P_BILL_TB: $NC.G_VAR.BILL_TB,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, grdMasterOnContractBillPopup, {
                queryId: "WC.POP_LFBUCONTRACTBILL"
            });
            return;
        case "BILL_QTY":
            rowData.BILL_AMT = rowData.UNIT_PRICE * rowData.BILL_QTY;
            rowData.FINAL_AMT = rowData.UNIT_PRICE * rowData.BILL_QTY;
            $NC.setFocusGrid(G_GRDMASTER, args.row, "FINAL_AMT", true);
            break;
        case "INOUT_DATE":
            rowData.BILL_QTY = null;
            rowData.BILL_AMT = null;
            rowData.FINAL_AMT = null;
            if ($NC.isNotNull(rowData.INOUT_DATE)) {
                if (!$NC.isDate(rowData.INOUT_DATE)) {
                    alert($NC.getDisplayMsg("JS.LFC04020E0.010", "정산일자를 정확히 입력하십시오."));
                    rowData.INOUT_DATE = "";
                    $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                } else {
                    rowData.INOUT_DATE = $NC.getFirstDate(rowData.INOUT_DATE);
                    // 보안일자 체크
                    $NC.serviceCallAndWait("/LFC04020E0/getDataSet.do", {
                        P_QUERY_ID: "WC.GET_PROTECT",
                        P_QUERY_PARAMS: {
                            P_CENTER_CD: rowData.CENTER_CD,
                            P_BU_CD: rowData.BU_CD,
                            P_PROTECT_DATE: rowData.INOUT_DATE
                        }
                    }, onGetProtectInfo);
                    // 보안일자 > 수불일자일 경우 return
                    if (rowData.PROTECT_YN == $ND.C_YES) {
                        $NC.setGridApplyChange(G_GRDMASTER, rowData);
                        return;
                    }
                    // 날짜 변경시 단위구분 및 단가 변경
                    $NC.serviceCallAndWait("/LFC04020E0/getDataSet.do", {
                        P_QUERY_ID: "LFC04020E0.RS_SUB2",
                        P_QUERY_PARAMS: {
                            P_CONTRACT_NO: rowData.CONTRACT_NO,
                            P_BILL_DIV: rowData.BILL_DIV,
                            P_ETC_MONTHLY_DIV: rowData.ETC_MONTHLY_DIV,
                            P_INOUT_DATE: rowData.INOUT_DATE
                        }
                    }, function(ajaxData) {
                        var dsResult = $NC.toArray(ajaxData);
                        if (dsResult[0].EXPENSES_YN != $ND.C_YES && dsResult.length == 0) {
                            alert($NC.getDisplayMsg("JS.LFC04020E0.011", "월기타수수료 단가관리에 등록되어 있지 않습니다."));
                            rowData.INOUT_DATE = "";
                            rowData.UNIT_DIV = "";
                            rowData.UNIT_DIV_F = "";
                            rowData.UNIT_PRICE = "";
                            rowData.BILL_QTY = "";
                            rowData.BILL_AMT = null;
                            rowData.FINAL_AMT = null;
                            $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                        } else {
                            if (dsResult[0].EXPENSES_YN == $ND.C_YES) {
                                rowData.EXPENSES_YN = dsResult[0].EXPENSES_YN;
                                rowData.UNIT_DIV = dsResult[0].UNIT_DIV;
                                rowData.UNIT_DIV_F = dsResult[0].UNIT_DIV_F;
                                rowData.UNIT_PRICE = dsResult[0].UNIT_PRICE;
                                rowData.BILL_QTY = 0;
                            } else {
                                rowData.EXPENSES_YN = dsResult[0].EXPENSES_YN;
                                rowData.UNIT_DIV = dsResult[0].UNIT_DIV;
                                rowData.UNIT_DIV_F = dsResult[0].UNIT_DIV_F;
                                rowData.UNIT_PRICE = dsResult[0].UNIT_PRICE;
                                rowData.BILL_QTY = "";
                            }
                            $NC.setFocusGrid(G_GRDMASTER, args.row, "ETC_MONTHLY_DIV_F", true);
                        }
                    });
                }
            }
            break;
        case "ETC_MONTHLY_DIV_F":
            if ($NC.isNotNull(rowData.INOUT_DATE)) {
                if (!$NC.isDate(rowData.INOUT_DATE)) {
                    alert($NC.getDisplayMsg("JS.LFC04010E0.014", "정산일자를 정확히 입력하십시오."));
                    rowData.INOUT_DATE = "";
                    $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                } else {
                    rowData.INOUT_DATE = rowData.INOUT_DATE;
                    // 보안일자 체크
                    $NC.serviceCallAndWait("/LFC04020E0/getDataSet.do", {
                        P_QUERY_ID: "WC.GET_PROTECT",
                        P_QUERY_PARAMS: {
                            P_CENTER_CD: rowData.CENTER_CD,
                            P_BU_CD: rowData.BU_CD,
                            P_PROTECT_DATE: rowData.INOUT_DATE
                        }
                    }, onGetProtectInfo);
                    // 보안일자 > 수불일자일 경우 return
                    if (rowData.PROTECT_YN == $ND.C_YES) {
                        $NC.setGridApplyChange(G_GRDMASTER, rowData);
                        return;
                    }
                    // 월기타비 변경시 단위구분 및 단가 변경
                    $NC.serviceCallAndWait("/LFC04020E0/getDataSet.do", {
                        P_QUERY_ID: "LFC04020E0.RS_SUB2",
                        P_QUERY_PARAMS: {
                            P_CONTRACT_NO: rowData.CONTRACT_NO,
                            P_BILL_DIV: rowData.BILL_DIV,
                            P_ETC_MONTHLY_DIV: rowData.ETC_MONTHLY_DIV,
                            P_INOUT_DATE: rowData.INOUT_DATE
                        }
                    }, function(ajaxData) {
                        var dsResult = $NC.toArray(ajaxData);
                        if (dsResult.length == 0) {
                            rowData.INOUT_DATE = "";
                            rowData.UNIT_DIV = "";
                            rowData.UNIT_DIV_F = "";
                            rowData.UNIT_PRICE = "";
                            rowData.BILL_QTY = "";
                            rowData.BILL_AMT = null;
                            rowData.FINAL_AMT = null;
                        } else {
                            if (dsResult[0].EXPENSES_YN == $ND.C_YES) {
                                rowData.EXPENSES_YN = dsResult[0].EXPENSES_YN;
                                rowData.UNIT_DIV = dsResult[0].UNIT_DIV;
                                rowData.UNIT_DIV_F = dsResult[0].UNIT_DIV_F;
                                rowData.UNIT_PRICE = dsResult[0].UNIT_PRICE;
                                rowData.BILL_QTY = 0;
                                $NC.setFocusGrid(G_GRDMASTER, args.row, "UNIT_DIV_F", true);
                            } else {
                                rowData.EXPENSES_YN = dsResult[0].EXPENSES_YN;
                                rowData.UNIT_DIV = dsResult[0].UNIT_DIV;
                                rowData.UNIT_DIV_F = dsResult[0].UNIT_DIV_F;
                                rowData.UNIT_PRICE = dsResult[0].UNIT_PRICE;
                                rowData.BILL_QTY = "";
                                $NC.setFocusGrid(G_GRDMASTER, args.row, "BILL_QTY", true);
                            }
                        }
                    });
                }
            }
            break;
        case "UNIT_DIV_F":
            $NC.setFocusGrid(G_GRDMASTER, args.row, "BILL_AMT", true);
            break;
        case "BILL_AMT":
            rowData.FINAL_AMT = rowData.BILL_AMT;
            $NC.setFocusGrid(G_GRDMASTER, args.row, "FINAL_AMT", true);
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    var isNotNew = rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (isNotNew) {
        switch (args.column.id) {
            case "CONTRACT_NO_F":
            case "INOUT_DATE":
            case "ETC_MONTHLY_DIV_F":
                return false;
        }
    }
    // 신규 데이터이고 계약번호 입력하지 않을 경우 edit 제한
    if (!isNotNew && $NC.isNull(rowData.CONTRACT_NO_F)) {
        switch (args.column.id) {
            case "INOUT_DATE":
            case "ETC_MONTHLY_DIV_F":
            case "BILL_QTY":
            case "FINAL_AMT":
                return false;
        }
    }
    // 보안일자보다 정산일자가 낮은 Row 수정 제한
    if (isNotNew && $NC.equals(rowData.PROTECT_YN, $ND.C_YES)) {
        switch (args.column.id) {
            case "UNIT_DIV_F":
            case "BILL_QTY":
            case "BILL_AMT":
            case "FINAL_AMT":
            case "REMARK1":
                return false;
        }
    }
    if (rowData.EXPENSES_YN == $ND.C_YES) {
        // 월실비 데이터인 경우 정산수량컬럼 입력 제한
        switch (args.column.id) {
            case "BILL_QTY":
                return false;
        }
    } else {
        // 월실비 데이터가 아닌 경우 단위구분, 정산금액 입력 제한
        switch (args.column.id) {
            case "UNIT_DIV_F":
            case "BILL_AMT":
                return false;
        }
    }
    return true;
}

/**
 * 그리드 입력 체크
 * 
 * @param row
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, [
        "CONTRACT_NO",
        "BILL_DIV",
        "ETC_MONTHLY_DIV",
        "INOUT_DATE"
    ])) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);

    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CONTRACT_NO_F)) {
            alert($NC.getDisplayMsg("JS.LFC04020E0.012", "계약번호를 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "CONTRACT_NO_F", true);
            return false;
        }
        if ($NC.isNull(rowData.INOUT_DATE)) {
            alert($NC.getDisplayMsg("JS.LFC04020E0.014", "수불일자를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "INOUT_DATE", true);
            return false;
        }
        if ($NC.isNull(rowData.ETC_MONTHLY_DIV)) {
            alert($NC.getDisplayMsg("JS.LFC04020E0.013", "월기타비구분을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "ETC_MONTHLY_DIV_F", true);
            return false;
        }
        if ($NC.isNull(rowData.UNIT_DIV_F)) {
            alert($NC.getDisplayMsg("JS.LFC04020E0.015", "단위구분을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "UNIT_DIV_F", true);
            return false;
        }
        if ($NC.isNull(rowData.BILL_QTY)) {
            alert($NC.getDisplayMsg("JS.LFC04020E0.016", "정산수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "BILL_QTY", true);
            return false;
        }
        if ($NC.isNull(rowData.BILL_AMT)) {
            alert($NC.getDisplayMsg("JS.LFC04020E0.017", "정산금액을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "BILL_AMT", true);
            return false;
        }
        if ($NC.isNull(rowData.FINAL_AMT)) {
            alert($NC.getDisplayMsg("JS.LFC04020E0.018", "최종확정금액을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "FINAL_AMT", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, "CONTRACT_NO_F", true);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "CONTRACT_NO",
        "BILL_DIV",
        "ETC_MONTHLY_DIV",
        "INOUT_DATE"
    ]);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "CONTRACT_NO",
            "BILL_DIV",
            "ETC_MONTHLY_DIV",
            "INOUT_DATE"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData, true);
    }
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
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

function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setFocus("#edtQBu_Cd", true);
    }

    // 계약번호 조회조건 초기화
    $NC.setValue("#edtQContract_No");
    $NC.setValue("#edtQContract_Nm");

    onSetBillComboInfo();
    onChangingCondition();
}

/**
 * 검색조건의 계약번호 검색 이미지 클릭
 */
function showContractPopup() {

    $NP.showContractPopup({
        P_CENTER_CD: $NC.getValueCombo("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_CONTRACT_NO: $ND.C_ALL,
        P_BILL_TB: $NC.G_VAR.BILL_TB,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onContractPopup, function() {
        $NC.setFocus("#edtQContract_No", true);
    });
}

function onContractPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQContract_No", resultInfo.CONTRACT_NO);
        $NC.setValue("#edtQContract_Nm", resultInfo.CONTRACT_NM);
    } else {
        $NC.setValue("#edtQContract_No");
        $NC.setValue("#edtQContract_Nm");
        $NC.setFocus("#edtQContract_No", true);
    }
    onSetBillComboInfo();
    onChangingCondition();
}

function onSetBillComboInfo() {

    // 조회조건 - 수수료 구분
    $NC.setInitCombo("/LFC04020E0/getDataSet.do", {
        P_QUERY_ID: "LFC04020E0.RS_SUB1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValueCombo("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_CONTRACT_NO: $NC.getValue("#edtQContract_No", true),
            P_ATTR04_CD: $NC.G_VAR.BILL_TB
        }
    }, {
        selector: "#cboQBill_Div",
        codeField: "BILL_DIV",
        fullNameField: "BILL_DIV_F",
        addAll: true
    });
}

function onGetProtectInfo(ajaxData) {
    var dsResult = $NC.toArray(ajaxData);
    var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (dsResult.length > 0) {
        var rowData = dsResult[0];
        lastRowData.PROTECT_YN = rowData.PROTECT_YN;
        if (rowData.PROTECT_YN == $ND.C_YES) {
            alert($NC.getDisplayMsg("JS.LFC04020E0.019", "자료 보안설정이 되어 있어 처리할 수 없습니다."));
            lastRowData.INOUT_DATE = null;
            lastRowData.UNIT_DIV = null;
            lastRowData.UNIT_DIV_F = null;
            $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, "INOUT_DATE", true);
        }
    }
}