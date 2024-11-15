/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01090Q0
 *  프로그램명         : 사용자별부가정보
 *  프로그램설명       : 사용자별부가정보 화면 Javascript
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divRightView",
                grids: "#grdDetail"
            },
            viewType: "h",
            viewFixed: {
                container: "#divRightView",
                size: 530
            }
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    // 콤보박스 초기화
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "CERTIFY_DIV",
            P_COMMON_CD: $ND.C_ALL
        }
    }, {
        selector: "#cboQCertify_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQCertify_Div", $ND.C_ALL);
        }
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
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {
    onChangingCondition();
}

function onChangingCondition() {
    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}
/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {
    var CERTIFY_DIV = $NC.getValue("#cboQCertify_Div", true);
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    G_GRDMASTER.queryParams = {
        P_CERTIFY_DIV: CERTIFY_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/CSC01090Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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
        id: "CERTIFY_DIV_F",
        field: "CERTIFY_DIV_F",
        name: "사용자구분"
    });
    $NC.setGridColumn(columns, {
        id: "USER_ID",
        field: "USER_ID",
        name: "사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "USER_NM",
        field: "USER_NM",
        name: "사용자명"
    });
    $NC.setGridColumn(columns, {
        id: "CLIENT_IP",
        field: "CLIENT_IP",
        name: "접속IP"
    });
    $NC.setGridColumn(columns, {
        id: "LOGIN_YN",
        field: "LOGIN_YN",
        name: "현재로그인여부",
        resizable: false,
        minWidth: 105,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "LOGIN_LAST_DATETIME",
        field: "LOGIN_LAST_DATETIME",
        name: "이전로그인일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOGIN_FINAL_DATETIME",
        field: "LOGIN_FINAL_DATETIME",
        name: "마지막로그인일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if ($NC.addMonth($NC.G_USERINFO.LOGIN_DATE, -3) > rowData.LOGIN_FINAL_DATETIME || rowData.LOGIN_FINAL_DATETIME == null) {
                    return "stySpecial";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC01090Q0.RS_MASTER",
        sortCol: "USER_ID",
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

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAIL);
    // 파라메터 세팅
    G_GRDDETAIL.queryParams = {
        P_USER_ID: rowData.USER_ID
    };
    // 데이터 조회
    $NC.serviceCall("/CSC01090Q0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CLIENT_IP",
        field: "CLIENT_IP",
        name: "접속IP"
    });
    $NC.setGridColumn(columns, {
        id: "LOGIN_CNT",
        field: "LOGIN_CNT",
        name: "접속건수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOGIN_LAST_DATETIME",
        field: "LOGIN_LAST_DATETIME",
        name: "이전로그인일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOGIN_FINAL_DATETIME",
        field: "LOGIN_FINAL_DATETIME",
        name: "마지막로그인일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CSC01090Q0.RS_DETAIL",
        sortCol: "LOGIN_FINAL_DATETIME"
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, null, true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL);
}
