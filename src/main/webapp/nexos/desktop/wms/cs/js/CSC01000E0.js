﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01000E0
 *  프로그램명         : 공지사항
 *  프로그램설명       : 공지사항 화면 Javascript
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
                "#grdMaster"
            ]
        }
    });

    // 버튼 이벤트 연결
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnDownload").click(btnDownloadOnClick);
    $("#btnModify").click(btnModifyOnClick);
    $("#btnEntryReply").click(btnEntryReplyOnClick);
    $("#btnModifyReply").click(btnModifyReplyOnClick);
    $("#btnDeleteReply").click(btnDeleteReplyOnClick);
    $("#btnNoticeInfoClose").click(btnNoticeInfoCloseOnClick);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    // 신규/삭제/저장 버튼 툴팁 세팅
    $NC.setTooltip("#btnDeleteReply", $NC.getDisplayMsg("JS.CSC01000E0.014", "삭제"));
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

    if (!$NC.isVisible("#divNoticeOverlay")) {
        return;
    }

    var $parent = $("#divDetailView").parent();
    $NC.resizeGridView("#divDetailView", "#grdDetail", //
    null, $parent.height() - $NC.getViewHeight($parent.children().not("#divDetailView")));
}

/**
 * Window Close Event - Window Close 시 호출 됨
 */
function _OnClose(jWindow) {

    if (!$NC.isVisible("#divNoticeOverlay")) {
        return true;
    }
    $("#btnNoticeInfoClose").click();
    return false;
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    // 저장
    $NC.setEnable("#btnModify", permission.canSave);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        // 브랜드 값 변경시 마스터체크
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
    }

    // 화면클리어
    onChangingCondition();
}

function onChangingCondition() {

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnInputChange(e, view, val) {

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var NOTICE_TITLE = $NC.getValue("#edtQNotice_Title", true);
    var CONTENT_TEXT = $NC.getValue("#edtQContent_Text", false);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 데이터 조회
    G_GRDMASTER.queryParams = {
        P_BU_CD: BU_CD,
        P_NOTICE_TITLE: NOTICE_TITLE,
        P_CONTENT_TEXT: CONTENT_TEXT,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    $NC.serviceCall("/CSC01000E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC01001P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC01001P0.001", "공지사항등록/수정"),
        url: "cs/CSC01001P0.html",
        width: 700,
        height: 430,
        resizeable: false,
        G_PARAMETER: {
            P_PROCESS_CD: $ND.C_PROCESS_CREATE,
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_BU_NM: $NC.getValue("#edtQBu_Nm")
        },
        onOk: function() {
            _Inquiry();
        }
    });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.001", "저장할 데이터가 없습니다."));
        return;
    }

    var dsMaster = [ ];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_WRITE_NO: rowData.WRITE_NO,
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_NOTICE_DIV: rowData.NOTICE_DIV,
            P_NOTICE_TITLE: rowData.NOTICE_TITLE,
            P_CONTENT_HTML: rowData.CONTENT_HTML,
            P_CONTENT_TEXT: rowData.CONTENT_TEXT,
            P_NOTICE_FROM_DATE: rowData.NOTICE_FROM_DATE,
            P_NOTICE_TO_DATE: rowData.NOTICE_TO_DATE,
            P_ATTACH_FILE_NM: rowData.ATTACH_FILE_NM,
            P_ATTACH_FILE_SIZE: rowData.ATTACH_FILE_SIZE,
            P_REG_USER_ID: rowData.REG_USER_ID,
            P_ORG_ATTACH_FILE_NM: rowData.ORG_ATTACH_FILE_NM,
            P_ORG_ATTACH_FILE_SIZE: rowData.ORG_ATTACH_FILE_SIZE,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC01000E0/saveMaster.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC01000E0.004", "공지사항을 삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.deleteGridRowData(G_GRDMASTER, rowData);
    } else {
        // 삭제시 공지사항 상세정보 표시되지 않도록 하기 위한 변수 세팅
        G_GRDMASTER.lastAction = $ND.C_DV_CRUD_D;

        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        _Save();
    }
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

function btnNoticeInfoCloseOnClick() {

    $("#divNoticeOverlay").hide();

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function btnDownloadOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.005", "첨부파일 다운로드할 대상을 선택하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData.ATTACH_FILE_NM)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.006", "첨부파일이 없는 공지사항입니다."));
        return;
    }

    $NC.fileDownload("/CSC01000E0/attachmentDownload.do", {
        P_ATTACH_FILE_NM: rowData.ATTACH_FILE_NM
    });
}

function btnModifyOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.007", "수정할 공시사항을 선택하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC01001P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC01001P0.001", "공지사항등록/수정"),
        url: "cs/CSC01001P0.html",
        width: 700,
        height: 430,
        resizeable: false,
        G_PARAMETER: {
            P_PROCESS_CD: $ND.C_PROCESS_UPDATE,
            P_WRITE_NO: rowData.WRITE_NO,
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_NOTICE_DIV: rowData.NOTICE_DIV,
            P_NOTICE_TITLE: rowData.NOTICE_TITLE,
            P_CONTENT_HTML: rowData.CONTENT_HTML,
            P_CONTENT_TEXT: rowData.CONTENT_TEXT,
            P_NOTICE_FROM_DATE: rowData.NOTICE_FROM_DATE,
            P_NOTICE_TO_DATE: rowData.NOTICE_TO_DATE,
            P_ATTACH_FILE_NM: rowData.ATTACH_FILE_NM,
            P_ATTACH_FILE_SIZE: rowData.ATTACH_FILE_SIZE,
            P_REG_USER_ID: rowData.REG_USER_ID,
            P_ORG_ATTACH_FILE_NM: rowData.ORG_ATTACH_FILE_NM,
            P_ORG_ATTACH_FILE_SIZE: rowData.ORG_ATTACH_FILE_SIZE
        },
        onOk: function() {
            var lastKeyVal = rowData.WRITE_NO;
            _Inquiry();
            G_GRDMASTER.lastKeyVal = lastKeyVal;
        }
    });
}

function btnEntryReplyOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.008", "덧글을 등록할 공지사항이 없습니다."));
        return;
    }

    var CONTENT_TEXT = $NC.getValue("#edtReply_Content_Text");
    if ($NC.isNull(CONTENT_TEXT)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.009", "덧글을 입력하십시오."));
        $NC.setFocus("#edtReply_Content_Text");
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    var dsDetail = [
        {
            P_WRITE_NO: rowData.WRITE_NO,
            P_REPLY_DIV: "1",
            P_REPLY_NO: "",
            P_CONTENT_HTML: "",
            P_CONTENT_TEXT: CONTENT_TEXT,
            P_CRUD: $ND.C_DV_CRUD_C
        }
    ];

    $NC.serviceCall("/CSC01000E0/saveDetail.do", {
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

function btnModifyReplyOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.008", "덧글을 수정할 공지사항이 없습니다."));
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.010", "수정할 덧글이 없습니다."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if (rowData.REG_USER_ID != $NC.G_USERINFO.USER_ID) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.011", "다른 사용자가 등록한 덧글입니다."));
        return;
    }

    var CONTENT_TEXT = $NC.getValue("#edtReply_Content_Text");
    if ($NC.isNull(CONTENT_TEXT)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.009", "덧글을 입력하십시오."));
        $NC.setFocus("#edtReply_Content_Text");
        return;
    }

    var dsDetail = [
        {
            P_WRITE_NO: rowData.WRITE_NO,
            P_REPLY_DIV: rowData.REPLY_DIV,
            P_REPLY_NO: rowData.REPLY_NO,
            P_CONTENT_HTML: "",
            P_CONTENT_TEXT: CONTENT_TEXT,
            P_CRUD: $ND.C_DV_CRUD_U
        }
    ];

    $NC.serviceCall("/CSC01000E0/saveDetail.do", {
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

function btnDeleteReplyOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.008", "덧글을 수정할 공지사항이 없습니다."));
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.010", "수정할 덧글이 없습니다."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if (rowData.REG_USER_ID != $NC.G_USERINFO.USER_ID) {
        alert($NC.getDisplayMsg("JS.CSC01000E0.011", "다른 사용자가 등록한 덧글입니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC01000E0.012", "덧글을 삭제 하시겠습니까?"))) {
        return;
    }

    var dsDetail = [
        {
            P_WRITE_NO: rowData.WRITE_NO,
            P_REPLY_DIV: rowData.REPLY_DIV,
            P_REPLY_NO: rowData.REPLY_NO,
            P_CRUD: $ND.C_DV_CRUD_D
        }
    ];

    $NC.serviceCall("/CSC01000E0/saveDetail.do", {
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

function grdMasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "WRITE_NO",
        field: "WRITE_NO",
        name: "공지번호",
        resizable: false,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "NOTICE_TITLE",
        field: "NOTICE_TITLE",
        name: "제목"
    });
    $NC.setGridColumn(columns, {
        id: "NOTICE_DIV_D",
        field: "NOTICE_DIV_D",
        name: "공지구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD_F",
        field: "BU_CD_F",
        name: "사업부"
    });
    $NC.setGridColumn(columns, {
        id: "NEW_NOTICE_YN",
        field: "NEW_NOTICE_YN",
        name: "신규여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "NOTICE_FROM_DATE",
        field: "NOTICE_FROM_DATE",
        name: "공지시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "NOTICE_TO_DATE",
        field: "NOTICE_TO_DATE",
        name: "공지종료일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REG_USER_NM",
        field: "REG_USER_NM",
        name: "등록자"
    });
    $NC.setGridColumn(columns, {
        id: "REG_DATETIME",
        field: "REG_DATETIME",
        name: "등록일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "READ_CNT",
        field: "READ_CNT",
        name: "조회수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REPLY_CNT",
        field: "REPLY_CNT",
        name: "덧글수",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 2,
        specialRow: {
            compareKey: "IMPORTANT_NOTICE",
            compareVal: "1",
            compareOperator: "==",
            cssClass: "stySpecial"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC01000E0.RS_MASTER",
        sortCol: "WRITE_NO",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    setInputValue("#grdMaster");

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnDblClick(e, args) {

    showNoticeInfo(args.row);
}

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "REPLY_NO",
        field: "REPLY_NO",
        name: "순번",
        resizable: false,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REG_USER_NM",
        field: "REG_USER_NM",
        name: "등록자"
    });
    $NC.setGridColumn(columns, {
        id: "CONTENT_TEXT",
        field: "CONTENT_TEXT",
        name: "덧글"
    }, false);
    $NC.setGridColumn(columns, {
        id: "REG_DATETIME",
        field: "REG_DATETIME",
        name: "최초등록일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        frozenColumn: 1,
        specialRow: {
            compareKey: "REG_USER_ID",
            compareVal: $NC.G_USERINFO.USER_ID,
            compareOperator: "==",
            cssClass: "styEqual"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CSC01000E0.RS_DETAIL",
        sortCol: "REPLY_NO",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAIL.data.getItem(row);
    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    var canEntry = refRowData.NOTICE_TO_DATE >= $NC.G_USERINFO.LOGIN_DATE;
    $NC.setEnable("#btnEntryReply", canEntry);
    $NC.setEnable("#edtReply_Content_Text", canEntry);
    $NC.setEnable("#btnModifyReply", canEntry);
    $NC.setEnable("#btnDeleteReply", canEntry);

    if (canEntry) {
        var canModify = rowData.REG_USER_ID == $NC.G_USERINFO.USER_ID;
        $NC.setEnable("#btnModifyReply", canModify);
        $NC.setEnable("#btnDeleteReply", canModify);
    }

    if (rowData.REG_USER_ID == $NC.G_USERINFO.USER_ID) {
        $NC.setValue("#edtReply_Content_Text", rowData.CONTENT_TEXT);
    } else {
        $NC.setValue("#edtReply_Content_Text");
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    var lastKeyVal = G_GRDMASTER.lastKeyVal;
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "WRITE_NO", true)) {
        if (G_GRDMASTER.lastAction != $ND.C_DV_CRUD_D && $NC.isNotNull(lastKeyVal)) {
            showNoticeInfo(G_GRDMASTER.lastRow);
            return;
        }
        G_GRDMASTER.lastAction = null;
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDDETAIL, "REPLY_NO")) {
        // 덧글이 한건도 없으면 Scroll 이벤트가 발생하지 않음
        var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        var canEntry = rowData.NOTICE_TO_DATE >= $NC.G_USERINFO.LOGIN_DATE;
        $NC.setEnable("#btnEntryReply", canEntry);
        $NC.setEnable("#edtReply_Content_Text", canEntry);
    }
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "WRITE_NO"
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

function showNoticeInfo(row) {

    var rowData = G_GRDMASTER.data.getItem(row);
    if ($NC.isNull(rowData)) {
        return;
    }

    $NC.serviceCall("/CSC01000E0/readNotice.do", {
        P_WRITE_NO: rowData.WRITE_NO,
        P_REPLY_DIV: "2",
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        $NC.setInitCombo("/CSC01000E0/getDataSet.do", {
            P_QUERY_ID: "CSC01000E0.RS_SUB2",
            P_QUERY_PARAMS: {
                P_WRITE_NO: rowData.WRITE_NO
            }
        }, {
            selector: "#cboReadUser",
            codeField: "USER_ID",
            fullNameField: "USER_ID_F"
        });
    });

    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);

    if (!$NC.isVisible("#divNoticeOverlay")) {
        $NC.showOverlay("#divNoticeOverlay", {
            title: $NC.getDisplayMsg("JS.CSC01000E0.013", "공지사항 상세내역"),
            width: 670,
            height: 600,
            fullscreen: false,
            onComplete: function() {
                $NC.onGlobalResize();
                G_GRDDETAIL.view.focus();
            }
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "0";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        $NC.setInitComboData({
            selector: "#cboReadUser",
            codeField: "USER_ID",
            fullNameField: "USER_ID_F",
            data: [ ]
        });
        if ($NC.isNull(rowData)) {
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }

        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtWrite_No", rowData["WRITE_NO"]);
        $NC.setValue("#edtBu_Cd", rowData["BU_CD"]);
        $NC.setValue("#edtBu_Nm", rowData["BU_NM"]);
        $NC.setValue("#edtNotice_Div", rowData["NOTICE_DIV"]);
        $NC.setValue("#edtNotice_Div_D", rowData["NOTICE_DIV_D"]);
        $NC.setValue("#edtUser_Id", rowData["REG_USER_ID"]);
        $NC.setValue("#edtUser_Nm", rowData["REG_USER_NM"]);
        $NC.setValue("#edtAttach_File_Nm", rowData["ATTACH_FILE_NM"]);
        $NC.setValue("#edtAttach_File_Size", rowData["ATTACH_FILE_SIZE"]);
        $NC.setValue("#edtNotice_Title", rowData["NOTICE_TITLE"]);
        $NC.setValue("#edtContent_Text", rowData["CONTENT_TEXT"]);
        $NC.setValue("#edtReg_Datetime", rowData["REG_DATETIME"]);
        $NC.setValue("#edtNotice_From_Date", rowData["NOTICE_FROM_DATE"]);
        $NC.setValue("#edtNotice_To_Date", rowData["NOTICE_TO_DATE"]);

        $NC.setEnable("#btnModify", rowData["REG_USER_ID"] == $NC.G_USERINFO.USER_ID && $NC.getProgramPermission().canSave);
        $NC.setEnable("#btnDownload", $NC.isNotNull(rowData["ATTACH_FILE_NM"]));
        $NC.setEnable("#btnEntryReply", false);
        $NC.setEnable("#btnModifyReply", false);
        $NC.setEnable("#btnDeleteReply", false);
        $NC.setEnable("#edtReply_Content_Text", false);
        $NC.setValue("#edtReply_Content_Text");

        if ($NC.isNotNull(rowData["WRITE_NO"])) {
            $NC.setEnable("#cboReadUser");
            // 데이터 조회
            $NC.setInitGridVar(G_GRDDETAIL);
            G_GRDDETAIL.queryParams = {
                P_WRITE_NO: rowData.WRITE_NO
            };
            $NC.serviceCall("/CSC01000E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
        } else {
            $NC.setEnable("#cboReadUser", false);
            $NC.setInitGridData(G_GRDDETAIL);
        }
    }
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

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
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
