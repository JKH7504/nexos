﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LFC05070E0
 *  프로그램명         : 화물운송비정산내역 조정
 *  프로그램설명       : 화물운송비정산내역 조정 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-03-20
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-03-20    ASETEC           신규작성
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
        BILL_TB: "LF520NM" // 정산테이블 - 화물운송비
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 조회조건 - 정산일자에 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2", null, "CM");
    // 조회조건 - 정산월에 달력이미지 설정
    $NC.setInitMonthPicker("#mtpQAdjust_Month", $NC.addMonth($NC.G_USERINFO.LOGIN_DATE, -1));

    // 등록조건 - 마감월 설정
    $NC.setInitMonthPicker("#mtpClose_Month", $NC.addMonth($NC.G_USERINFO.LOGIN_DATE, -1));

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

    // 조회/등록조건 검색 이미지 클릭
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQContract_No").click(showContractPopup);
    $("#btnContract_No").click(showContractBillPopup);

    // 버튼 클릭 이벤트 연결
    $("#btnDownloadXLSFormat").click(btnDownloadXLSFormatOnClick); // 엑셀포맷 다운로드
    $("#btnUploadXLS").click(btnUploadXLSOnClick); // 엑셀업로드

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    // 엑셀업로드 버튼 비활성화
    $NC.setEnable("#btnUploadXLS", false);
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
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, null, false);
            break;
    }
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
        case "OUTBOUND_DATE":
            $("#grpOutbound_Date").show();
            $("#grpAdjust_Month").hide();
            break;
        // 출고일자 입력값 체크
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LFC05070E0.001", "출고 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LFC05070E0.002", "출고 종료일자를 정확히 입력하십시오."));
            break;
        case "ADJUST_MONTH":
            $("#grpOutbound_Date").hide();
            // 정산월 보여질 경우 style 속성 값 변경
            $("#grpAdjust_Month").css("display", "inline-block");

            // 정산월 입력 시 체크
            if (val != "A") {
                $NC.setValueMonthPicker(view, val, $NC.getDisplayMsg("JS.LFC05070E0.003", "정산월을 정확히 입력하십시오."));
            }
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

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();

    switch (id) {
        case "CONTRACT_NO":
            $NP.onContractBillChange(val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_CONTRACT_NO: val,
                P_BILL_TB: $NC.G_VAR.BILL_TB,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, onContractBillPopup, {
                queryId: "WC.POP_LFBUCONTRACTBILL"
            });
            return;
        case "CLOSE_MONTH":
            $NC.setValueMonthPicker(view, val, $NC.getDisplayMsg("JS.LFC05070E0.003", "마감월을 정확히 입력하십시오."));
            break;
    }
}

function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    // 등록조건 - 계약번호 값 초기화
    $NC.setValue("#edtContract_No");
    $NC.setValue("#edtContract_Nm");
    $NC.setValue("#edtBill_Div_F");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
    // 엑셀업로드 버튼 비활성화
    $NC.setEnable("#btnUploadXLS", false);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var DATE_DIV = $NC.getValueRadioGroup("rgbQDate_Div");
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    var ADJUST_MONTH = $NC.getValue("#mtpQAdjust_Month");

    if (DATE_DIV == "D") {
        // 출고일자 입력값 체크
        if ($NC.isNull(OUTBOUND_DATE1)) {
            alert($NC.getDisplayMsg("JS.LFC05070E0.006", "출고 시작일자를 입력하십시오."));
            $NC.setFocus("#dtpQOutbound_Date1");
            return;
        }
        if ($NC.isNull(OUTBOUND_DATE2)) {
            alert($NC.getDisplayMsg("JS.LFC05070E0.007", "출고 종료일자를 입력하십시오."));
            $NC.setFocus("#dtpQOutbound_Date2");
            return;
        }
    } else {
        // 정산월 입력값 체크
        if ($NC.isNull(ADJUST_MONTH)) {
            alert($NC.getDisplayMsg("JS.LFC05070E0.007", "정산월을 입력하십시오."));
            $NC.setFocus("#mtpQAdjust_Month");
            return;
        }
        OUTBOUND_DATE1 = ADJUST_MONTH + "-01";
        OUTBOUND_DATE2 = $NC.getLastDate(ADJUST_MONTH + "-01");
    }

    var CONTRACT_NO = $NC.getValue("#edtQContract_No", true);
    var BILL_DIV = $NC.getValue("#cboQBill_Div", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_DATE_DIV: DATE_DIV,
        P_OUTBOUND_DATE1: OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: OUTBOUND_DATE2,
        P_CONTRACT_NO: CONTRACT_NO,
        P_BILL_DIV: BILL_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/LFC05070E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        alert($NC.getDisplayMsg("JS.LFC05070E0.008", "저장할 데이터가 없습니다."));
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
        // 삭제 시 체크박스 선택이 안된 항목은 처리 불가
        if (rowData.CRUD == $ND.C_CD_CRUD_D && rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        dsMaster.push({
            P_CONTRACT_NO: rowData.CONTRACT_NO,
            P_BILL_DIV: rowData.BILL_DIV,
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_SHIP_RCP_NO: rowData.SHIP_RCP_NO,
            P_SHIP_CHARGE_DIV: rowData.SHIP_CHARGE_DIV,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_UNIT_DIV: rowData.UNIT_DIV,
            P_BILL_AMT: rowData.BILL_AMT,
            P_FINAL_AMT: rowData.FINAL_AMT,
            P_REMARK1: rowData.REMARK1,
            P_ADJUST_MONTH: rowData.ADJUST_MONTH + "-01",
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.009", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LFC05070E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.010", "삭제할 데이터가 없습니다."));
        return;
    }

    // 엑셀 업로드 후 미저장 시 삭제 불가
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: "XSL_YN",
        searchVal: $ND.C_YES
    });
    if (searchRow > -1) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.018", "저장 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LFC05070E0.011", "삭제 하시겠습니까?"))) {
        return;
    }

    var checkedCount = 0;
    var adjustCount = 0, protectCount = 0;
    var rIndex, rCount;
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        var rowData = G_GRDMASTER.data.getItem(rIndex);
        if ($NC.isNull(rowData.CHECK_YN) || rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;

        // 월마감 체크
        if ($NC.isNotNull(rowData.ADJUST_SDATE)) {
            adjustCount++;
        }
        // 보안일자 체크
        if (rowData.PROTECT_YN == $ND.C_YES) {
            protectCount++;
        }
        // 월마감 미처리 && (보안일자 < 정산월) -> 처리 가능 (이외의 경우는 삭제불가)
        if ($NC.isNull(rowData.ADJUST_SDATE) && rowData.PROTECT_YN == $ND.C_NO) {
            $NC.deleteGridRowData(G_GRDMASTER, rowData, true);
        }
    }

    if (adjustCount > 0) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.XXX", "월마감 처리된 데이터가 존재하여 삭제 처리할 수 없습니다."));
        _Inquiry();
        return;
    }

    if (protectCount > 0) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.XXX", "보안설정된 데이터가 존재하여 삭제 처리할 수 없습니다."));
        _Inquiry();
        return;
    }

    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.XXX", "삭제 처리할 데이터를 선택하십시오."));
        return;
    }

    _Save();
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "CONTRACT_NO",
            "BILL_DIV",
            "OUTBOUND_DATE",
            "SHIP_RCP_NO"
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
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
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
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIP_RCP_NO",
        field: "SHIP_RCP_NO",
        name: "운송접수번호"
    });
    $NC.setGridColumn(columns, {
        id: "SHIP_CHARGE_DIV_F",
        field: "SHIP_CHARGE_DIV_F",
        name: "운송청구구분"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "UNIT_DIV_F",
        field: "UNIT_DIV_F",
        name: "단위구분"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_AMT",
        field: "BILL_AMT",
        name: "정산금액",
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
 * 재고셀보관료 상세내역
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 2,
        editable: true,
        autoEdit: true,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LFC05070E0.RS_MASTER",
        sortCol: "CONTRACT_NO",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);

    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
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

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args, null, false);
            break;
    }
}

function grdMasterOnClick(e, args) {

    var columnId = G_GRDMASTER.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTER, e, args, null, false);
            break;
    }
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
                alert($NC.getDisplayMsg("JS.LFC05070E0.013", "최종확정금액은 0보다 작을 수 없습니다."));
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

    var isNew = rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD == $ND.C_DV_CRUD_C;
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: "XSL_YN",
        searchVal: $ND.C_YES
    });

    // 엑셀업로드 시 데이터 수정 제한
    if (isNew || searchRow > -1) {
        switch (args.column.id) {
            case "REMARK1":
            case "FINAL_AMT":
                return false;
        }
    }
    // 월정산 처리 후에 최종확정금액 수정 제한
    if (!isNew && $NC.isNotNull(rowData.ADJUST_SDATE)) {
        switch (args.column.id) {
            case "FINAL_AMT":
                return false;
        }
    }
    // 보안일자보다 정산일자가 낮은 Row 수정 제한
    if ($NC.equals(rowData.PROTECT_YN, $ND.C_YES)) {
        switch (args.column.id) {
            case "REMARK1":
            case "FINAL_AMT":
                return false;
        }
    }
    return true;
}

/**
 * 재고셀보관료 상세내역 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "CONTRACT_NO",
        "BILL_DIV",
        "OUTBOUND_DATE",
        "SHIP_RCP_NO"
    ]);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";
    $NC.setInitTopButtons($NC.G_VAR.buttons);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
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
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setValue("#edtQCust_Cd");
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
 * 등록조건의 계약번호 검색 이미지 클릭
 */
function showContractBillPopup() {

    $NP.showContractBillPopup({
        queryId: "WC.POP_LFBUCONTRACTBILL",
        queryParams: {
            P_CENTER_CD: $NC.getValueCombo("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_CONTRACT_NO: $ND.C_ALL,
            P_BILL_TB: $NC.G_VAR.BILL_TB,
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, onContractBillPopup, function() {
        $NC.setFocus("#edtContract_No", true);
    });
}

function onContractBillPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtContract_No", resultInfo.CONTRACT_NO);
        $NC.setValue("#edtContract_Nm", resultInfo.CONTRACT_NM);
        $NC.setValue("#edtBill_Div_F", resultInfo.BILL_DIV_F);

        $NC.G_VAR.BULL_DIV = resultInfo.BILL_DIV;
    } else {
        $NC.setValue("#edtContract_No");
        $NC.setValue("#edtContract_Nm");
        $NC.setValue("#edtBill_Div_F");
        $NC.setFocus("#edtContract_No", true);
    }
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
            "OUTBOUND_DATE",
            "SHIP_RCP_NO"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSetBillComboInfo() {
    $NC.setInitCombo("/LFC05070E0/getDataSet.do", {
        P_QUERY_ID: "LFC05070E0.RS_SUB1",
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

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    _Inquiry();
}

function btnDownloadXLSFormatOnClick() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");

    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.014", "물류센터를 입력하십시오."));
        return;
    }
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.015", "사업부를 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "OUTBOUND_DATE",
            P_COLUMN_TITLE: "출고일자",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "SHIP_RCP_NO",
            P_COLUMN_TITLE: "접수번호",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "SHIP_CHARGE_DIV",
            P_COLUMN_TITLE: "청구타입",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "BILL_AMT",
            P_COLUMN_TITLE: "운반금액",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "REMARK1",
            P_COLUMN_TITLE: "비고",
            P_COLUMN_WIDTH: 40
        }
    ];

    $NC.excelFileDownload({
        P_QUERY_ID: "LFC05070E0.RS_SUB2",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "화물운송비업로드", // Excel Sheet Title
            P_EXCEL_FREEZE_ROW: 2
        // 고정 ROW
        },
        P_COLUMN_INFO: COLUMN_INFO
    });
}

function btnUploadXLSOnClick() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var CONTRACT_NO = $NC.getValue("#edtContract_No");
    var CLOSE_MONTH = $NC.getValue("#mtpClose_Month");

    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.014", "물류센터를 선택하십시오."));
        return;
    }
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.015", "사업부를 선택하십시오."));
        return;
    }
    if ($NC.isNull(CONTRACT_NO)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.016", "계약번호를 선택하십시오."));
        $NC.setFocus("#edtContract_No");
        return;
    }
    if ($NC.isNull(CLOSE_MONTH)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.017", "마감월을 선택하십시오."));
        $NC.setFocus("#mtpClose_Month");
        return;
    }
    if ($NC.isGridModified(G_GRDMASTER)) {
        alert($NC.getDisplayMsg("JS.LFC05070E0.018", "저장 후 처리하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "OUTBOUND_DATE",
            P_XLS_COLUMN_NM: "A"
        },
        {
            P_COLUMN_NM: "SHIP_RCP_NO",
            P_XLS_COLUMN_NM: "B"
        },
        {
            P_COLUMN_NM: "SHIP_CHARGE_DIV",
            P_XLS_COLUMN_NM: "C"
        },
        {
            P_COLUMN_NM: "BILL_AMT",
            P_XLS_COLUMN_NM: "D"
        },
        {
            P_COLUMN_NM: "REMARK1",
            P_XLS_COLUMN_NM: "E"
        }
    ];

    $NC.excelFileUpload({
        P_QUERY_ID: "LFC05070E0.RS_SUB3",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ADJUST_MONTH: CLOSE_MONTH + "-01",
            P_CONTRACT_NO: CONTRACT_NO,
            P_BILL_DIV: $NC.G_VAR.BULL_DIV
        },
        P_SERVICE_PARAMS: {
            P_XLS_COL_CHECK_YN: $ND.C_YES,
            P_XLS_FIRST_ROW: 3,
            P_XLS_FILE_DIV: "LF520NM"
        },
        P_COLUMN_INFO: COLUMN_INFO
    }, function(ajaxData, dsResultData) {

        if ($NC.isNull(dsResultData) || dsResultData.length == 0) {
            alert($NC.getDisplayMsg("JS.LFC05070E0.019", "업로드할 수 있는 대상 데이터가 없습니다. 엑셀 파일을 확인하십시오."));
            return;
        }

        var len = G_GRDMASTER.data.getLength();
        for (var row = 0; row < dsResultData.length; row++) {
            dsResultData[row].id = $NC.getGridNewRowId();
            dsResultData[row].CRUD = $ND.C_DV_CRUD_C;
            G_GRDMASTER.data.addItem(dsResultData[row]);
        }
        G_GRDMASTER.data.endUpdate();
        $NC.setGridSelectRow(G_GRDMASTER, len);

    });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    $NC.setEnable("#btnDownloadXLSFormat", permission.canSave);
    $NC.setEnable("#btnUploadXLS", permission.canSave);
}