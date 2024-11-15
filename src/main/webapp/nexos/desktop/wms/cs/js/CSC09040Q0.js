/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC09040Q0
 *  프로그램명         : 웹서버로그조회
 *  프로그램설명       : 웹서버로그조회 화면 Javascript
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
            container: "#ctrMasterView",
            grids: [
                "#grdMaster"
            ]
        }
    });

    // 이벤트 연결
    $("#btnLogDownload").click(btnLogDownloadOnClick);

    // 그리드 초기화
    grdMasterInitialize();

    // 캐릭터셋 콤보박스 세팅
    $NC.setInitComboData({
        selector: "#cboQLog_Charset",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_NM",
        data: [
            {
                COMMON_CD: "UTF-8",
                COMMON_NM: $NC.getDisplayMsg("JS.CSC09040Q0.001", "UTF-8")
            },
            {
                COMMON_CD: "MS949",
                COMMON_NM: $NC.getDisplayMsg("JS.CSC09040Q0.002", "MS949")
            }
        ],
        onComplete: function() {
            $NC.setValue("#cboQLog_Charset", 0);
        }
    });
}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#ctrMasterView", "vr", 450, 200, 300);

    $NC.setFocus("#edtQWeb_Server_Log");
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

    var $view = $("#edtQWeb_Server_Log");
    $view.css({
        "width": $view.parent().width(),
        "height": $view.parent().height() - $NC.G_LAYOUT.header
    });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회시 값 초기화
    $NC.setValue("#edtQWeb_Server_Log");
    $NC.clearGridData(G_GRDMASTER);

    var LOG_CHARSET = $NC.getValue("#cboQLog_Charset", "UTF-8");
    // 로그 조회
    $NC.serviceCall("/CSC09040Q0/getLog.do", {
        P_LOG_COUNT: 5000,
        P_LOG_CHARSET: LOG_CHARSET
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var $view = $("#edtQWeb_Server_Log");
        $NC.setValue($view, resultData.RESULT_DATA);
        // 마지막 라인으로 이동
        $view.get(0).scrollTop = $view.get(0).scrollHeight;
    });

    // 데이터 조회
    $NC.serviceCall("/CSC09040Q0/getLogFiles.do", null, onGetMaster);
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
        id: "LOG_FILE_NM",
        field: "LOG_FILE_NM",
        name: "로그파일명"
    });
    $NC.setGridColumn(columns, {
        id: "LOG_FILE_DATETIME",
        field: "LOG_FILE_DATETIME",
        name: "로그수정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOG_FILE_SIZE",
        field: "LOG_FILE_SIZE",
        name: "로그파일크기",
        cssClass: "styRight"
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
        queryId: "",
        sortCol: "LOG_FILE_NM",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "LOG_FILE_NM", true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function btnLogDownloadOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC09040Q0.003", "다운로드할 파일을 선택하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC09040Q0.004", "로그파일을 다운로드하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.fileDownload("/CSC09040Q0/downloadLogFile.do", {
        P_LOG_FILE_NM: rowData.LOG_FILE_NM,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    });
}