/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC03020E0
 *  프로그램명         : 사업부프로세스관리
 *  프로그램설명       : 사업부프로세스관리 화면 Javascript
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
            viewFixed: 300
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnCopy").click(btnCopyOnClick);

    // 초기 비활성화 처리
    $NC.setEnable("#btnCopy", false);

    // 조회조건 - 물류센터 초기화
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
        }
    });
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

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

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    $NC.setEnable("#btnCopy", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();

}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
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
        case "EXEC_PROCESS_YN":
            var rowData = G_GRDDETAIL.data.getItem(args.row);
            if (rowData.SKIP_PROCESS_YN == $ND.C_NO) {
                alert($NC.getDisplayMsg("JS.CSC03020E0.001", "[" + rowData.PROCESS_NM + "]은 생략할 수 없는 프로세스입니다.", rowData.PROCESS_NM));
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    $NC.setInitGridVar(G_GRDDETAIL);

    // 데이터 조회
    $NC.serviceCall("/CSC03020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.004", "저장할 데이터가 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 프로세스 수정 데이터
    var checkedCount = 0;
    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.EXEC_PROCESS_YN == $ND.C_YES) {
            checkedCount++;
        }
        if (rowData.ENTRY_YN == $ND.C_YES && rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_PROCESS_GRP: rowData.PROCESS_GRP,
            P_PROCESS_CD: rowData.PROCESS_CD,
            P_PARENT_PROCESS_CD: rowData.PARENT_PROCESS_CD,
            P_EXEC_PROCESS_YN: rowData.EXEC_PROCESS_YN,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.ENTRY_YN == $ND.C_NO ? $ND.C_DV_CRUD_C : $ND.C_DV_CRUD_U
        });
    }

    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.006", "수행 프로세스를 선택하십시오."));
        return;
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.005", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC03020E0/save.do", {
        P_DS_MASTER: dsMaster,
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

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "PROCESS_GRP",
            "PROCESS_CD"
        ],
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "PROCESS_GRP",
            "PROCESS_CD"
        ],
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
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
        id: "PROCESS_GRP",
        field: "PROCESS_GRP",
        name: "프로세스그룹",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PROCESS_GRP_D",
        field: "PROCESS_GRP_D",
        name: "프로세스그룹명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {};

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC03020E0.RS_MASTER",
        sortCol: "PROCESS_GRP",
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_PROCESS_GRP: rowData.PROCESS_GRP
    };
    // 디테일 조회
    $NC.serviceCall("/CSC03020E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "PROCESS_CD",
        field: "PROCESS_CD",
        name: "프로세스코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PROCESS_NM",
        field: "PROCESS_NM",
        name: "프로세스명"
    });
    $NC.setGridColumn(columns, {
        id: "SKIP_PROCESS_YN",
        field: "SKIP_PROCESS_YN",
        name: "생략가능여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "EXEC_PROCESS_YN",
        field: "EXEC_PROCESS_YN",
        name: "프로세스수행여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "PROCESS_STATE_F",
        field: "PROCESS_STATE_F",
        name: "프로세스상태"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1,
        specialRow: {
            compareKey: "ENTRY_YN",
            compareVal: $ND.C_NO,
            compareOperator: "==",
            cssClass: "styError"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CSC03020E0.RS_DETAIL",
        sortCol: "PROCESS_GRP_F",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);

}

function grdDetailOnCellChange(e, args) {

    var rowData = G_GRDDETAIL.data.getItem(args.row);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row)) {
        return true;
    }
    var rowData = G_GRDDETAIL.data.getItem(row);

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "PROCESS_GRP"
    ], true)) {
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
        $NC.setEnable("#btnCopy", false);
    } else {
        $NC.setEnable("#btnCopy", $NC.getProgramPermission().canSave);
    }

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
 * 프로세스그룹을 선택하였을 경우 상단 등록프로세스 데이터 표시처리
 */
function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "PROCESS_GRP",
        "PROCESS_CD"
    ]);
}

function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "PROCESS_GRP"
        ]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "PROCESS_GRP",
            "PROCESS_CD"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
}

function btnCopyOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.CSC03020E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC03021P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC03021P0.001", "프로세스 복사"),
        url: "cs/CSC03021P0.html",
        width: 650,
        height: 160,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_BU_CD: BU_CD,
            P_BU_NM: BU_NM,
            P_PERMISSION: permission
        },
        onOk: function() {
            _Inquiry();
        }
    });
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
