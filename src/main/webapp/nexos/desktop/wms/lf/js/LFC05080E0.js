﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LFC05080E0
 *  프로그램명         : 가공작업비정산 조정
 *  프로그램설명       : 가공작업비정산 조정 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-04-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-04-14    ASETEC           신규작성
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
        BILL_TB: "LF610NM" // 정산테이블 - 가공작업작업비
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    // 정산일자에 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQProcessing_Date1", "#dtpQProcessing_Date2", null, "CM");

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
            $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
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
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
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
        case "PROCESSING_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LFC05080E0.001", "가공작업 시작일자를 정확히 입력하십시오."));
            break;
        case "PROCESSING_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LFC05080E0.002", "가공작업 종료일자를 정확히 입력하십시오."));
            break;
        case "CONTRACT_NO":
            $NP.onContractChange(val, {
                P_CENTER_CD: $NC.getValueCombo("#cboQCenter_Cd"),
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_CONTRACT_NO: val,
                P_BILL_TB: $NC.G_VAR.BILL_TB,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onContractPopup);
            return;
    }

    // 화면클리어
    onChangingCondition();
}

function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LFC05080E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.LFC05080E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var PROCESSING_DATE1 = $NC.getValue("#dtpQProcessing_Date1");
    if ($NC.isNull(PROCESSING_DATE1)) {
        alert($NC.getDisplayMsg("JS.LFC05080E0.005", "가공작업 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQProcessing_Date1");
        return;
    }
    var PROCESSING_DATE2 = $NC.getValue("#dtpQProcessing_Date2");
    if ($NC.isNull(PROCESSING_DATE2)) {
        alert($NC.getDisplayMsg("JS.LFC05080E0.006", "가공작업 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQProcessing_Date2");
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
        P_PROCESSING_DATE1: PROCESSING_DATE1,
        P_PROCESSING_DATE2: PROCESSING_DATE2,
        P_CONTRACT_NO: CONTRACT_NO,
        P_BILL_DIV: BILL_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/LFC05080E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LFC05080E0.007", "저장할 데이터가 없습니다."));
        return;
    }

    // 현재 수정모드면
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CONTRACT_NO: rowData.CONTRACT_NO,
            P_BILL_DIV: rowData.BILL_DIV,
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_PROCESSING_DATE: rowData.PROCESSING_DATE,
            P_PROCESSING_NO: rowData.PROCESSING_NO,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_PROCESSING_QTY: rowData.PROCESSING_QTY,
            P_CUST_CD: rowData.CUST_CD,
            P_MATERIAL_CD: rowData.MATERIAL_CD,
            P_PROCESSING_DIV: rowData.PROCESSING_DIV,
            P_MATERIAL_QTY: rowData.MATERIAL_QTY,
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
        alert($NC.getDisplayMsg("JS.LFC05080E0.008", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LFC05080E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "CONTRACT_NO",
            "BILL_DIV",
            "PROCESSING_DATE",
            "PROCESSING_NO",
            "ITEM_CD",
            "MATERIAL_CD"
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
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_DIV_F",
        field: "BILL_DIV_F",
        name: "정산구분"
    });
    $NC.setGridColumn(columns, {
        id: "PROCESSING_DATE",
        field: "PROCESSING_DATE",
        name: "가공작업일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PROCESSING_NO",
        field: "PROCESSING_NO",
        name: "가공작업번호",
        cssClass: "styCenter"
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
        id: "PROCESSING_QTY",
        field: "PROCESSING_QTY",
        name: "가공작업수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드"
    });
    $NC.setGridColumn(columns, {
        id: "MATERIAL_CD",
        field: "MATERIAL_CD",
        name: "자재코드"
    });
    $NC.setGridColumn(columns, {
        id: "MATERIAL_NM",
        field: "MATERIAL_NM",
        name: "자재명"
    });
    $NC.setGridColumn(columns, {
        id: "PROCESSING_DIV_F",
        field: "PROCESSING_DIV_F",
        name: "가공작업구분"
    });
    $NC.setGridColumn(columns, {
        id: "MATERIAL_QTY",
        field: "MATERIAL_QTY",
        name: "자재수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "UNIT_DIV_F",
        field: "UNIT_DIV_F",
        name: "단위구분"
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_AMT",
        field: "BILL_AMT",
        name: "수수료금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "FINAL_AMT",
        field: "FINAL_AMT",
        name: "최종확정금액",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
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
        name: "최초등록자ID"
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

/**
 * 위탁청구수수료 상세내역
 */
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
        queryId: "LFC05080E0.RS_MASTER",
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

/**
 * 그리드의 편집 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "FINAL_AMT":
            if (Number(rowData.FINAL_AMT) < 0) {
                alert($NC.getDisplayMsg("JS.LFC05080E0.009", "최종확정금액은 0보다 작을 수 없습니다."));
                rowData.FINAL_AMT = args.oldItem.FINAL_AMT;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                break;
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 보안일자 이후 데이터일 때만 수정 가능한 컬럼
    switch (args.column.id) {
        case "FINAL_AMT":
        case "REMARK1":
            return $NC.equals(rowData.PROTECT_YN, $ND.C_NO);
    }
    return false;
}

/**
 * 추가작업비조정 상세내역 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "CONTRACT_NO",
        "BILL_DIV",
        "PROCESSING_DATE",
        "PROCESSING_NO",
        "ITEM_CD",
        "MATERIAL_CD"
    ]);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";
    $NC.setInitTopButtons($NC.G_VAR.buttons);
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

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "CONTRACT_NO",
            "BILL_DIV",
            "PROCESSING_DATE",
            "PROCESSING_NO",
            "ITEM_CD",
            "MATERIAL_CD"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    _Inquiry();
}

/**
 * 조회조건 - 정산구분 세팅
 */
function onSetBillComboInfo() {
    $NC.setInitCombo("/LFC05080E0/getDataSet.do", {
        P_QUERY_ID: "LFC05080E0.RS_SUB",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValueCombo("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_CONTRACT_NO: $NC.getValue("#edtQContract_No", true),
            P_ATTR04_CD: $NC.G_VAR.BILL_TB
        }
    }, {
        selector: "#cboQBill_Div",
        codeField: "BILL_DIV",
        nameField: "COMMON_NM",
        fullNameField: "BILL_DIV_F",
        addAll: true
    });
}