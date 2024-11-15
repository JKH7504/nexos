/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LFC01020E0
 *  프로그램명         : 월마감처리
 *  프로그램설명       : 월마감처리 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-13
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2016-12-13    ASETEC           신규작성
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
                "#grdMaster",
                "#grdDetail"
            ]
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

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
        multiSelect: true,
        onComplete: function() {
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnConfirm").click(onCloseProcessing);

    // 사업부코드/명에 초기값 설정
    // $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    // $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    $NC.setInitMonthPicker("#mtpClose_Month", $NC.addMonth($NC.G_USERINFO.LOGIN_DATE, -1));
    $NC.setInitDatePicker("#dtpProtect_Date", $NC.addMonth($NC.G_USERINFO.LOGIN_DATE, -1), "L");

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "h", 350, 250);
}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
    }

    onChangingCondition();
}

function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "CLOSE_MONTH":
            $NC.setValueMonthPicker(view, val, $NC.getDisplayMsg("JS.LFC01020E0.001", "마감월을 정확히 입력하십시오."));
            break;
        case "PROTECT_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LFC01020E0.002", "보안설정일자를 정확히 입력하십시오."));
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LFC01020E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    // 데이터 조회
    $NC.serviceCall("/LFC01020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        id: "CENTER_CD",
        field: "CENTER_CD",
        name: "물류센터",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_NM",
        field: "CENTER_NM",
        name: "물류센터명"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });
    $NC.setGridColumn(columns, {
        id: "PROTECT_DATE",
        field: "PROTECT_DATE",
        name: "보안설정일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BASE_DATE",
        field: "BASE_DATE",
        name: "최종이월수불일자",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LFC01020E0.RS_MASTER",
        sortCol: "BU_CD",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 그리드 데이터 초기화
    $NC.clearGridData(G_GRDDETAIL);

    // 파라메터 세팅
    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_CLOSE_MONTH: $NC.getValue("#mtpClose_Month") + "-01"
    };
    // 데이터 조회
    $NC.serviceCall("/LFC01020E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
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
            $NC.onGridCheckBoxEditorChange(G_GRDMASTER, e, args);
            break;
    }
}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 * @param view
 *        대상 Object
 * @param args
 *        row, cell, value
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
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "수불일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD",
        field: "INOUT_CD",
        name: "입출고구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "입출고구분명"
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
        name: "상품규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상품상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "NOTE_QTY",
        field: "NOTE_QTY",
        name: "전표수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_QTY",
        field: "INOUT_QTY",
        name: "수불수량",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 하단그리드 초기화
 */
function grdDetailInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LFC01020E0.RS_DETAIL",
        sortCol: "INOUT_DATE",
        gridOptions: options
    });
    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1, G_GRDDETAIL.data.getLength());
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
    onChangingCondition();
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "BU_CD")) {
        $NC.clearGridData(G_GRDDETAIL);
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";
    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 조회버튼 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "INOUT_DATE");
}

/*
 * 마감처리
 */
function onCloseProcessing() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LFC01020E0.004", "조회 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LFC01020E0.005", "월마감을 처리하시겠습니까?"))) {
        return;
    }

    var CLOSING_LEVEL1_YN = $NC.nullToDefault($NC.getValue("#chkQClosing_Level1"), $ND.C_NO);
    var CLOSING_LEVEL2_YN = $NC.nullToDefault($NC.getValue("#chkQClosing_Level2"), $ND.C_NO);
    var CLOSING_LEVEL3_YN = $NC.nullToDefault($NC.getValue("#chkQClosing_Level3"), $ND.C_NO);

    if (CLOSING_LEVEL1_YN == $ND.C_NO && CLOSING_LEVEL2_YN == $ND.C_NO && CLOSING_LEVEL3_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.LFC01020E0.006", "선택된 마감처리 대상 작업이 없습니다."));
        return;
    }
    var CLOSE_MONTH = $NC.getValue("#mtpClose_Month") + "-01";
    var PROTECT_DATE = $NC.getValue("#dtpProtect_Date");

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_CLOSE_MONTH: CLOSE_MONTH,
            P_PROTECT_DATE: PROTECT_DATE,
            P_CLOSING_LEVEL1_YN: CLOSING_LEVEL1_YN,
            P_CLOSING_LEVEL2_YN: CLOSING_LEVEL2_YN,
            P_CLOSING_LEVEL3_YN: CLOSING_LEVEL3_YN
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LFC01020E0.007", "월마감 처리할 사업부를 선택하십시오."));
        return;
    }

    $NC.serviceCall("/LFC01020E0/callProcessingClossing.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "BU_CD"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnable("#btnConfirm", permission.canSave && enable);
}
