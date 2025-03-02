﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LFC02010E0
 *  프로그램명         : 정산계약관리
 *  프로그램설명       : 정산계약관리 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-10-29
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-10-29    ASETEC           신규작성
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
                container: "#divLeftView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: {
                container: "#divRightView",
                sizeFn: function(viewWidth, viewHeight) {

                    var scrollOffset = viewHeight < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
                    // Container 사이즈 조정
                    return $NC.G_OFFSET.rightViewWidth + scrollOffset;
                }
            }
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);
    $NC.setValue("#chkQDeal_Div2", $ND.C_YES);

    $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
    $NC.setInitDatePicker("#dtpClose_Date", null, "N");

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 이벤트 연결
    $("#btnQCust_Cd").click(showQCustPopup);

    $("#btnCust_Cd").click(showCustPopup);

    // 그리드 초기화
    grdMasterInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CONTRACT_DIV_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CONTRACT_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CONTRACT_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CONTRACT_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_TAX_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "TAX_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CURRENCY_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CURRENCY_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 계약구분 콤보
        $NC.setInitComboData({
            selector: "#cboQContract_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addAll: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CONTRACT_DIV_2),
            onComplete: function() {
                $NC.setValue("#cboQContract_Div", 0);
            }
        });
        // 계약구분 콤보
        $NC.setInitComboData({
            selector: "#cboContract_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CONTRACT_DIV_1),
            onComplete: function() {
                $NC.setValue("#cboContract_Div", 0);
            }
        });
        // 과세구분 콤보
        $NC.setInitComboData({
            selector: "#cboTax_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_TAX_DIV),
            onComplete: function() {
                $NC.setValue("#cboTax_Div", 0);
            }
        });
        // 통화구분 콤보
        $NC.setInitComboData({
            selector: "#cboCurrency_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CURRENCY_DIV),
            onComplete: function() {
                $NC.setValue("#cboCurrency_Div", 0);
            }
        });
    });

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.rightViewWidth = 450;
    $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CUST_CD":
            $NP.onCustChange(val, {
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQCustPopup);
            return;
    }
    onChangingCondition();
}

function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);

    $NC.setEnableGroup("#divMasterInfoView", false);
    setInputValue("#grdMaster");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    grdMasterOnCellChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CONTRACT_NM = $NC.getValue("#edtQContract_Nm", true);
    var CONTRACT_DIV = $NC.getValue("#cboQContract_Div", true);
    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CONTRACT_NM: CONTRACT_NM,
        P_CONTRACT_DIV: CONTRACT_DIV,
        P_CUST_CD: CUST_CD,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3
    };
    // 데이터 조회
    $NC.serviceCall("/LFC02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var CUST_NM = $NC.getValue("#edtQCust_Nm");

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CONTRACT_NO: null,
        CONTRACT_NM: null,
        CONTRACT_DIV: null,
        CUST_CD: CUST_CD,
        CUST_NM: CUST_NM,
        TAX_DIV: null,
        TAX_DIV_F: null,
        CURRENCY_DIV: null,
        CURRENCY_DIV_F: null,
        DEAL_DIV: "1",
        OPEN_DATE: null,
        CLOSE_DATE: null,
        CLOSE_DAY: 0,
        REMARK1: null,
        REG_USER_ID: null,
        REG_DATETIME: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 이전 데이터가 한건도 없었으면 에디터 Enable
    if (G_GRDMASTER.data.getLength() == 0) {
        $NC.setEnableGroup("#divMasterInfoView", true);
    }

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LFC02010E0.001", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var rowData;
    var dsMaster = [];
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CONTRACT_NO: rowData.CONTRACT_NO,
            P_CONTRACT_NM: rowData.CONTRACT_NM,
            P_CONTRACT_DIV: rowData.CONTRACT_DIV,
            P_CUST_CD: rowData.CUST_CD,
            P_TAX_DIV: rowData.TAX_DIV,
            P_CURRENCY_DIV: rowData.CURRENCY_DIV,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_CLOSE_DAY: rowData.CLOSE_DAY,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LFC02010E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LFC02010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LFC02010E0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LFC02010E0.004", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
            $NC.setEnableGroup("#divMasterInfoView", false);
            setInputValue("#grdMaster");
        }
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
        selectKey: "CONTRACT_NO",
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

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }
        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtContract_No", rowData.CONTRACT_NO);
        $NC.setValue("#edtContract_Nm", rowData.CONTRACT_NM);
        $NC.setValue("#cboContract_Div", rowData.CONTRACT_DIV);
        $NC.setValue("#edtCust_Cd", rowData.CUST_CD);
        $NC.setValue("#edtCust_Nm", rowData.CUST_NM);

        $NC.setValue("#cboTax_Div", rowData.TAX_DIV);
        $NC.setValue("#cboCurrency_Div", rowData.CURRENCY_DIV);

        $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV == "1");
        $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV == "2");
        $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV == "3");
        $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
        $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
        $NC.setValue("#edtClose_Day", rowData.CLOSE_DAY);
        $NC.setValue("#edtRemark1", rowData.REMARK1);
        // 신규 데이터면 계약번호, 고객사 수정할 수 있게 함
        if (rowData["CRUD"] == $ND.C_DV_CRUD_C || rowData["CRUD"] == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtContract_No");
            $NC.setEnable("#edtCust_Cd");
            $NC.setEnable("#btnCust_Cd");
        } else {
            $NC.setEnable("#edtContract_No", false);
            $NC.setEnable("#edtCust_Cd", false);
            $NC.setEnable("#btnCust_Cd", false);
        }
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "CONTRACT_NO")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CONTRACT_NO)) {
            alert($NC.getDisplayMsg("JS.LFC02010E0.005", "계약번호를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtContract_No");
            return false;
        }
        if ($NC.isNull(rowData.CONTRACT_NM)) {
            alert($NC.getDisplayMsg("JS.LFC02010E0.006", "계약명을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtContract_Nm");
            return false;
        }
        if ($NC.isNull(rowData.CUST_CD)) {
            alert($NC.getDisplayMsg("JS.LFC02010E0.007", "고객사를 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtCust_Cd");
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.LFC02010E0.008", "거래구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#rgbDeal_Div");
            return false;
        }
        if ($NC.isNull(rowData.CLOSE_DAY)) {
            alert($NC.getDisplayMsg("JS.LFC02010E0.009", "정산마감일을 입력하십시오."));
            $NC.setFocus("#edtClose_Day");
            $NC.setGridSelectRow(G_GRDMASTER, row);
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.LFC02010E0.015", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setTabActiveIndex("#divRightView", 0);
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#dtpClose_Date");
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnGetColumns() {
    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CONTRACT_NO",
        field: "CONTRACT_NO",
        name: "계약번호"
    });
    $NC.setGridColumn(columns, {
        id: "CONTRACT_NM",
        field: "CONTRACT_NM",
        name: "계약명"
    });
    $NC.setGridColumn(columns, {
        id: "CONTRACT_DIV_F",
        field: "CONTRACT_DIV_F",
        name: "계약구분"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });
    $NC.setGridColumn(columns, {
        id: "TAX_DIV_F",
        field: "TAX_DIV_F",
        name: "과세구분"
    });
    $NC.setGridColumn(columns, {
        id: "CURRENCY_DIV_F",
        field: "CURRENCY_DIV_F",
        name: "통화구분"
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_F",
        field: "DEAL_DIV_F",
        name: "거래구분"
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DAY",
        field: "CLOSE_DAY",
        name: "정산마감일",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LFC02010E0.RS_MASTER",
        sortCol: "CONTRACT_NO",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnNewRecord(args) {

    $NC.setFocus("#edtContract_No");
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 에디터 값 세팅
    setInputValue("#grdMaster", G_GRDMASTER.data.getItem(row));

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "CONTRACT_NO":
            rowData.CONTRACT_NO = args.val;
            break;
        case "CONTRACT_NM":
            rowData.CONTRACT_NM = args.val;
            break;
        case "CONTRACT_DIV":
            rowData.CONTRACT_DIV = args.val;
            rowData.CONTRACT_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "CUST_CD":
            $NP.onCustChange(args.val, {
                P_CUST_CD: args.val,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, onCustPopup);
            break;
        case "DEAL_DIV":
            rowData.DEAL_DIV = args.val;
            break;
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LFC02010E0.009", "거래일자를 정확히 입력하십시오."), "N");
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            if ($NC.isNull($NC.getValue("#dtpClose_Date"))) {
                $NC.setValue("#dtpClose_Date", $NC.getValue(args.view));
                rowData.CLOSE_DATE = $NC.getValue("#dtpClose_Date");
            }
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LFC02010E0.010", "종료일자를 정확히 입력하십시오."), "N");
            }
            rowData.CLOSE_DATE = $NC.getValue(args.view);
            if ($NC.isNull($NC.getValue("#dtpOpen_Date"))) {
                $NC.setValue("#dtpOpen_Date", $NC.getValue(args.view));
                rowData.OPEN_DATE = $NC.getValue("#dtpOpen_Date");
            }
            break;
        case "CLOSE_DAY":
            if (!(args.val >= 0 && args.val < 29) || $NC.isNull(args.val)) {
                alert($NC.getDisplayMsg("JS.LFC02010E0.011", "0부터 28 사이의 값을 입력하십시오."));
                $NC.setValue(args.view, rowData.CLOSE_DAY);
            } else {
                rowData.CLOSE_DAY = args.val;
            }
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
        case "TAX_DIV":
            rowData.TAX_DIV = args.val;
            rowData.TAX_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "CURRENCY_DIV":
            rowData.CURRENCY_DIV = args.val;
            rowData.CURRENCY_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showQCustPopup() {

    $NP.showCustPopup({
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onQCustPopup, function() {
        $NC.setFocus("#edtQCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onQCustPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtQCust_Nm", resultInfo.CUST_NM);
    } else {
        $NC.setValue("#edtQCust_Cd");
        $NC.setValue("#edtQCust_Nm");
        $NC.setFocus("#edtQCust_Cd", true);
    }
    onChangingCondition();
}

/**
 * 고객사 검색 이미지 클릭
 */
function showCustPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
    $NP.showCustPopup({
        P_CUST_CD: CUST_CD,
        P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
    }, onCustPopup, function() {
        $NC.setFocus("#edtCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onCustPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtCust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtCust_Nm", resultInfo.CUST_NM);

        rowData.CUST_CD = resultInfo.CUST_CD;
        rowData.CUST_NM = resultInfo.CUST_NM;
    } else {
        $NC.setValue("#edtCust_Cd");
        $NC.setValue("#edtCust_Nm");
        $NC.setFocus("#edtCust_Cd", true);

        rowData.CUST_CD = "";
        rowData.CUST_NM = "";

    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "CONTRACT_NO", true)) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnable("#edtContract_No", false);
        $NC.setEnable("#edtCust_Cd", false);
        $NC.setEnable("#btnCust_Cd", false);
    } else {
        $NC.setEnableGroup("#divMasterInfoView", false);
        setInputValue("#grdMaster");
    }

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
        selectKey: "CONTRACT_NO"
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
