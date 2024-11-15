/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC05010E0
 *  프로그램명         : 공통코드그룹관리
 *  프로그램설명       : 공통코드그룹관리 화면 Javascript
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
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divDetail",
                grids: "#grdDetail"
            },
            viewSecond: {
                container: "#divSub",
                grids: "#grdSub"
            },
            viewType: "h",
            viewFixed: 350
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "h", $NC.G_OFFSET.topViewHeight, 100, 100);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.topViewHeight = 400;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

    onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 데이터 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDSUB);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    var COMMON_GRP = $NC.getValue("#edtQCommon_Grp", $ND.C_ALL);
    var COMMON_GRP_NM = $NC.getValue("#edtQCommon_Grp_Nm", $ND.C_ALL);

    G_GRDMASTER.queryParams = {
        P_COMMON_GRP: COMMON_GRP,
        P_COMMON_GRP_NM: COMMON_GRP_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CSC05010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    if (G_GRDDETAIL.focused) {
        // grdDetail에 포커스가 있을 경우
        alert($NC.getDisplayMsg("JS.CSC05010E0.001", "공통그룹/공통특성 상세정보를 선택하고 신규 처리하십시오."));
        return;
    }

    var newRowData;
    // grdMaster에 포커스가 있을 경우
    if (G_GRDMASTER.focused) {

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            COMMON_GRP: null,
            COMMON_GRP_NM: null,
            ATTR01_TITLE_NM: null,
            ATTR02_TITLE_NM: null,
            ATTR03_TITLE_NM: null,
            ATTR04_TITLE_NM: null,
            ATTR05_TITLE_NM: null,
            ATTR06_TITLE_NM: null,
            ATTR07_TITLE_NM: null,
            ATTR08_TITLE_NM: null,
            ATTR09_TITLE_NM: null,
            ATTR10_TITLE_NM: null,
            REMARK1: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDMASTER, newRowData);
    }
    // grdSub에 포커스가 있을 경우
    else if (G_GRDSUB.focused) {

        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.002", "공통그룹코드가 없습니다.\n\n공통그룹코드를 먼저 등록하십시오."));
            return;
        }

        var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.003", "신규 공통그룹코드입니다.\n\n저장 후 공통특성 상세정보를 등록하십시요."));
            return;
        }

        var attrRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        if ($NC.isNull(attrRowData)) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.004", "공통특성 구분이 존재하지 않습니다.\n\n먼저 공통특성 구분을 등록 후 공통특성 상세정보를 등록하십시요."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDSUB)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            COMMON_GRP: refRowData.COMMON_GRP,
            ATTR_DIV: attrRowData.ATTR_DIV,
            ATTR_CD: null,
            ATTR_NM: null,
            REMARK1: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDSUB, newRowData);
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC05010E0.005", "저장할 데이터가 없습니다."));
        return;
    }

    if (G_GRDDETAIL.focused) {
        alert($NC.getDisplayMsg("JS.CSC05010E0.007", "공통그룹/공통특성 상세정보를 선택하고 저장 처리하십시오."));
        return;
    }

    if (G_GRDMASTER.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }
    } else {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDSUB)) {
            return;
        }
    }

    // 그룹코드 수정 데이터
    var dsMaster = [];
    var rowData, rIndex, rCount;
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_COMMON_GRP: rowData.COMMON_GRP,
            P_COMMON_GRP_NM: rowData.COMMON_GRP_NM,
            P_ATTR01_TITLE_NM: rowData.ATTR01_TITLE_NM,
            P_ATTR02_TITLE_NM: rowData.ATTR02_TITLE_NM,
            P_ATTR03_TITLE_NM: rowData.ATTR03_TITLE_NM,
            P_ATTR04_TITLE_NM: rowData.ATTR04_TITLE_NM,
            P_ATTR05_TITLE_NM: rowData.ATTR05_TITLE_NM,
            P_ATTR06_TITLE_NM: rowData.ATTR06_TITLE_NM,
            P_ATTR07_TITLE_NM: rowData.ATTR07_TITLE_NM,
            P_ATTR08_TITLE_NM: rowData.ATTR08_TITLE_NM,
            P_ATTR09_TITLE_NM: rowData.ATTR09_TITLE_NM,
            P_ATTR10_TITLE_NM: rowData.ATTR10_TITLE_NM,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    // 공통코드 수정 데이터
    var dsSub = [];
    for (rIndex = 0, rCount = G_GRDSUB.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDSUB.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsSub.push({
            P_COMMON_GRP: rowData.COMMON_GRP,
            P_ATTR_DIV: rowData.ATTR_DIV,
            P_ATTR_CD: rowData.ATTR_CD,
            P_ATTR_NM: rowData.ATTR_NM,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0 && dsSub.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC05010E0.006", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC05010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_SUB: dsSub,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDDETAIL.focused) {
        alert($NC.getDisplayMsg("JS.CSC05010E0.007", "공통그룹/공통특성 상세정보를 선택하고 저장 처리하십시오."));
        return;
    }

    var rowData;
    if (G_GRDMASTER.focused) {

        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.008", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CSC05010E0.009", "공통그룹코드를 삭제 하시겠습니까?\n\n※ 삭제시 해당 공통그룹코드로 등록된 공통특성 및 공통코드도 함께 삭제됩니다."))) {
            return;
        }

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDMASTER, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDMASTER.data.updateItem(rowData.id, rowData);
            _Save();
        }
    } else {

        if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.008", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CSC05010E0.010", "공통특성 코드를 삭제 하시겠습니까?"))) {
            return;
        }

        rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDSUB, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDSUB.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "COMMON_GRP",
        isCancel: true
    });
    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "ATTR_DIV",
        isCancel: true
    });
    var lastKeyValS = $NC.getGridLastKeyVal(G_GRDSUB, {
        selectKey: "ATTR_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyValM;
    G_GRDDETAIL.lastKeyVal = lastKeyValD;
    G_GRDSUB.lastKeyVal = lastKeyValS;
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
        id: "COMMON_GRP",
        field: "COMMON_GRP",
        name: "공통그룹코드",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "COMMON_GRP_NM",
        field: "COMMON_GRP_NM",
        name: "공통그룹명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ATTR01_TITLE_NM",
        field: "ATTR01_TITLE_NM",
        name: "공통특성타이틀01",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR02_TITLE_NM",
        field: "ATTR02_TITLE_NM",
        name: "공통특성타이틀02",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR03_TITLE_NM",
        field: "ATTR03_TITLE_NM",
        name: "공통특성타이틀03",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR04_TITLE_NM",
        field: "ATTR04_TITLE_NM",
        name: "공통특성타이틀04",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR05_TITLE_NM",
        field: "ATTR05_TITLE_NM",
        name: "공통특성타이틀05",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR06_TITLE_NM",
        field: "ATTR06_TITLE_NM",
        name: "공통특성타이틀06",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR07_TITLE_NM",
        field: "ATTR07_TITLE_NM",
        name: "공통특성타이틀07",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR08_TITLE_NM",
        field: "ATTR08_TITLE_NM",
        name: "공통특성타이틀08",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR09_TITLE_NM",
        field: "ATTR09_TITLE_NM",
        name: "공통특성타이틀09",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "ATTR10_TITLE_NM",
        field: "ATTR10_TITLE_NM",
        name: "공통특성타이틀10",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC05010E0.RS_MASTER",
        sortCol: "COMMON_GRP",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onFocus.subscribe(grdMasterOnFocus);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);

    // 최초 조회시 포커스 처리
    G_GRDMASTER.focused = true;
}

function grdMasterOnFocus(e, args) {

    if (G_GRDMASTER.focused) {
        return;
    }
    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = false;

    // 디테일 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }
}

function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, "COMMON_GRP", true);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "COMMON_GRP":
                return false;
        }
    }
    return true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "COMMON_GRP")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.COMMON_GRP)) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.011", "공통그룹코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "COMMON_GRP", true);
            return false;
        }
        if ($NC.isNull(rowData.COMMON_GRP_NM)) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.012", "공통그룹명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "COMMON_GRP_NM", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        onGetDetail({
            data: null
        });
    } else {
        // 디테일 조회
        $NC.serviceCall("/CSC05010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ATTR_DIV",
        field: "ATTR_DIV",
        name: "공통특성구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ATTR_DIV_D",
        field: "ATTR_DIV_D",
        name: "공통특성구분명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
    // editable: true,
    // autoEdit: true,
    // frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CSC05010E0.RS_DETAIL",
        sortCol: "ATTR_DIV",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onFocus.subscribe(grdDetailOnFocus);
}

function grdDetailOnFocus(e, args) {

    if (G_GRDDETAIL.focused) {
        return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
    G_GRDSUB.focused = false;

    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAIL.data.getItem(row);

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (refRowData.CRUD == $ND.C_DV_CRUD_C || refRowData.CRUD == $ND.C_DV_CRUD_N) {
        onGetSub({
            data: null
        });
    } else {
        G_GRDSUB.queryParams = {
            P_COMMON_GRP: refRowData.COMMON_GRP,
            P_ATTR_DIV: rowData.ATTR_DIV
        };
        // 디테일 조회
        $NC.serviceCall("/CSC05010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ATTR_CD",
        field: "ATTR_CD",
        name: "공통특성코드",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ATTR_NM",
        field: "ATTR_NM",
        name: "공통특성명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "CSC05010E0.RS_SUB",
        sortCol: "ATTR_CD",
        gridOptions: options
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
    G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
    G_GRDSUB.view.onFocus.subscribe(grdSubOnFocus);
}

function grdSubOnFocus(e, args) {

    if (G_GRDSUB.focused) {
        return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = true;

    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }
}

function grdSubOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDSUB, args.row, "ATTR_CD", true);
}

function grdSubOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "ATTR_CD":
                return false;
        }
    }
    return true;
}

function grdSubOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);
}

function grdSubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUB, row, "ATTR_CD")) {
        return true;
    }

    var rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ATTR_CD)) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.013", "공통특성코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUB, row, "ATTR_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.ATTR_NM)) {
            alert($NC.getDisplayMsg("JS.CSC05010E0.014", "공통특성명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUB, row, "ATTR_NM", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUB, rowData);
    return true;
}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // var rowData = G_GRDSUB.data.getItem(row);
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "COMMON_GRP", G_GRDMASTER.focused)) {
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
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

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDDETAIL, "ATTR_DIV", G_GRDDETAIL.focused)) {
        onGetSub({
            data: null
        });
    }
}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB, "ATTR_CD", G_GRDSUB.focused);
}

function onSave(ajaxData) {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "COMMON_GRP"
    });
    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "ATTR_DIV"
    });
    var lastKeyValS = $NC.getGridLastKeyVal(G_GRDSUB, {
        selectKey: "ATTR_CD"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyValM;
    G_GRDDETAIL.lastKeyVal = lastKeyValD;
    G_GRDSUB.lastKeyVal = lastKeyValS;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var grdObject;
    if (G_GRDMASTER.focused) {
        grdObject = G_GRDMASTER;
    } else {
        grdObject = G_GRDSUB;
    }

    var rowData = grdObject.data.getItem(grdObject.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(grdObject, rowData, true);
    }
}
