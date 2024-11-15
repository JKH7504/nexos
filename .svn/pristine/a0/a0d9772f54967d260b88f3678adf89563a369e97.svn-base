/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC09030Q0
 *  프로그램명         : 액티비티로그조회조회
 *  프로그램설명       : 액티비티로그조회 화면 Javascript
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
            grids: "#grdMaster"
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ACTIVITY_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQActivity_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    $NC.setInitDateRangePicker("#dtpQActivity_Date1", "#dtpQActivity_Date2");

    $("#btnLoadActivityComment").click(btnLoadActivityCommentOnClick);
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {
    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "vr", 305);
}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    var $view = $("#edtActivity_Comment");
    $view.css({
        "width": $view.parent().width(),
        "height": $view.parent().height() - $NC.G_LAYOUT.header
    });
}

function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    setInputValue("#grdMaster");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "ACTIVITY_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.CSC09030Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "ACTIVITY_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.CSC09030Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}
/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var ACTIVITY_DIV = $NC.getValue("#cboQActivity_Div");
    var ACTIVITY_USER_ID = $NC.getValue("#edtQActivity_User_Id", true);
    var ACTIVITY_CD = $NC.getValue("#edtQActivity_Cd", true);
    var ACTIVITY_COMMENT = $NC.getValue("#edtQActivity_Comment", true);

    var ACTIVITY_DATE1 = $NC.getValue("#dtpQActivity_Date1");
    if ($NC.isNull(ACTIVITY_DATE1)) {
        alert($NC.getDisplayMsg("JS.CSC09030Q0.001", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQActivity_Date1");
        return;
    }

    var ACTIVITY_DATE2 = $NC.getValue("#dtpQActivity_Date2");
    if ($NC.isNull(ACTIVITY_DATE2)) {
        alert($NC.getDisplayMsg("JS.CSC09030Q0.002", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQActivity_Date2");
        return;
    }

    if (ACTIVITY_DATE1 > ACTIVITY_DATE2) {
        alert($NC.getDisplayMsg("JS.CSC09030Q0.003", "액티비티로그일자 범위 입력오류입니다."));
        $NC.setFocus("#dtpQActivity_Date1");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_ACTIVITY_DATE1: ACTIVITY_DATE1,
        P_ACTIVITY_DATE2: ACTIVITY_DATE2,
        P_ACTIVITY_DIV: ACTIVITY_DIV,
        P_ACTIVITY_USER_ID: ACTIVITY_USER_ID,
        P_ACTIVITY_COMMENT: ACTIVITY_COMMENT,
        P_ACTIVITY_CD: ACTIVITY_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CSC09030Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        id: "ACTIVITY_DATE",
        field: "ACTIVITY_DATE",
        name: "액티비티일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ACTIVITY_ID",
        field: "ACTIVITY_ID",
        name: "액티비티ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ACTIVITY_DIV_F",
        field: "ACTIVITY_DIV_F",
        name: "액티비티구분"
    });
    $NC.setGridColumn(columns, {
        id: "ACTIVITY_COMMENT",
        field: "ACTIVITY_COMMENT",
        name: "액티비티상세내역"
    });
    $NC.setGridColumn(columns, {
        id: "ACTIVITY_CD",
        field: "ACTIVITY_CD",
        name: "액티비티코드"
    });
    $NC.setGridColumn(columns, {
        id: "ACTIVITY_USER_ID",
        field: "ACTIVITY_USER_ID",
        name: "사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "CLIENT_IP",
        field: "CLIENT_IP",
        name: "접속IP"
    });
    $NC.setGridColumn(columns, {
        id: "ACTIVITY_DATETIME",
        field: "ACTIVITY_DATETIME",
        name: "로그일시",
        cssClass: "styCenter"
    });
    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC09030Q0.RS_MASTER",
        sortCol: "ACTIVITY_ID",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);
    $NC.setEnable("#btnLoadActivityComment", rowData.ACTIVITY_COMMENT_PART_YN == $ND.C_YES);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
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
        $NC.setValue("#edtActivity_Comment", rowData["ACTIVITY_COMMENT"]);
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "ACTIVITY_ID", true)) {
        setInputValue("#grdMaster");
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function btnLoadActivityCommentOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 데이터 조회
    $NC.serviceCallAndWait("/CSC09030Q0/getDataSet.do", {
        P_QUERY_ID: "CSC09030Q0.RS_SUB",
        P_QUERY_PARAMS: {
            P_ACTIVITY_ID: rowData.ACTIVITY_ID
        }
    }, onGetSub);
}

function onGetSub(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (!Array.isArray(dsResult) && dsResult.length < 1) {
        return;
    }
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    rowData.ACTIVITY_COMMENT_PART_YN = $ND.C_NO;
    rowData.ACTIVITY_COMMENT = dsResult[0].ACTIVITY_COMMENT;
    G_GRDMASTER.data.updateItem(rowData.id, rowData);

    $NC.setValue("#edtActivity_Comment", rowData.ACTIVITY_COMMENT);
    $NC.setEnable("#btnLoadActivityComment", false);

}
