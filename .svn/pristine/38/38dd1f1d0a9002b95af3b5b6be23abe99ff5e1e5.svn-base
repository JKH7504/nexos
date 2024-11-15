/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC05020E0
 *  프로그램명         : 공통코드관리
 *  프로그램설명       : 공통코드관리 화면 Javascript
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

    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);
    $NC.setValue("#chkQDeal_Div2", $ND.C_YES);
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {
    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "v", $NC.G_OFFSET.leftViewWidth, 300, 400);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.leftViewWidth = 420;
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
    $NC.serviceCall("/CSC05020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC05020E0.001", "공통그룹코드가 없습니다.\n\n공통그룹코드를 먼저 등록하십시오."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        COMMON_GRP: refRowData.COMMON_GRP,
        COMMON_CD: null,
        COMMON_NM: null,
        ATTR01_CD: null,
        ATTR02_CD: null,
        ATTR03_CD: null,
        ATTR04_CD: null,
        ATTR05_CD: null,
        ATTR06_CD: null,
        ATTR07_CD: null,
        ATTR08_CD: null,
        ATTR09_CD: null,
        ATTR10_CD: null,
        SORT_RANK: null,
        DEAL_DIV: null,
        REMARK1: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDDETAIL, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC05020E0.002", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 공통코드 수정 데이터
    var dsDetail = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_COMMON_GRP: rowData.COMMON_GRP,
            P_COMMON_CD: rowData.COMMON_CD,
            P_COMMON_NM: rowData.COMMON_NM,
            P_ATTR01_CD: rowData.ATTR01_CD,
            P_ATTR02_CD: rowData.ATTR02_CD,
            P_ATTR03_CD: rowData.ATTR03_CD,
            P_ATTR04_CD: rowData.ATTR04_CD,
            P_ATTR05_CD: rowData.ATTR05_CD,
            P_ATTR06_CD: rowData.ATTR06_CD,
            P_ATTR07_CD: rowData.ATTR07_CD,
            P_ATTR08_CD: rowData.ATTR08_CD,
            P_ATTR09_CD: rowData.ATTR09_CD,
            P_ATTR10_CD: rowData.ATTR10_CD,
            P_SORT_RANK: rowData.SORT_RANK,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC05020E0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC05020E0/save.do", {
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC05020E0.004", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC05020E0.005", "공통코드를 삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.deleteGridRowData(G_GRDDETAIL, rowData);
    } else {
        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        _Save();
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
        selectKey: "COMMON_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyValM;
    G_GRDDETAIL.lastKeyVal = lastKeyValD;
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
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "COMMON_GRP_NM",
        field: "COMMON_GRP_NM",
        name: "공통그룹명"
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
        // editable: true,
        // autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC05020E0.RS_MASTER",
        sortCol: "COMMON_GRP",
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
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    // 컬럼 변경
    G_GRDDETAIL.view.setColumns(grdDetailOnGetColumns(rowData));
    G_GRDDETAIL.queryParams = {
        P_COMMON_GRP: rowData.COMMON_GRP,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3
    };
    // 디테일 조회
    $NC.serviceCall("/CSC05020E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns(refRowData) {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "COMMON_CD",
        field: "COMMON_CD",
        name: "공통코드",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "COMMON_NM",
        field: "COMMON_NM",
        name: "공통코드명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    if ($NC.isNotNull(refRowData)) {
        var colNo, colPrefix;
        for (var rIndex = 1; rIndex < 11; rIndex++) {
            colNo = $NC.lPad(rIndex, 2);
            colPrefix = "ATTR" + colNo;
            if ($NC.isNull(refRowData[colPrefix + "_DIV"])) {
                continue;
            }
            $NC.setGridColumn(columns, {
                id: colPrefix + "_CD_F",
                field: colPrefix + "_CD_F",
                name: $NC.nullToDefault(refRowData[colPrefix + "_TITLE_NM"], "공통특성") + "[" + colNo + "]",
                editor: Slick.Editors.ComboBox,
                editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
                    P_QUERY_ID: "WC.POP_CMCODEATTR",
                    P_QUERY_PARAMS: {
                        P_COMMON_GRP: refRowData.COMMON_GRP,
                        P_ATTR_DIV: colNo
                    }
                }, {
                    codeField: colPrefix + "_CD",
                    dataCodeField: "ATTR_CD",
                    dataFullNameField: "ATTR_CD_F",
                    addEmpty: true
                })
            }, false);
        }
    }
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "SORT_RANK",
        field: "SORT_RANK",
        name: "정렬순서",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_F",
        field: "DEAL_DIV_F",
        name: "거래구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "DEAL_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "DEAL_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        })
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CSC05020E0.RS_DETAIL",
        sortCol: "COMMON_CD",
        redefineColumn: $ND.C_NO, // 컬럼 재정의 사용안함, 동적 특성 컬럼 사용으로 재정의 사용불가
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "COMMON_CD", true);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "COMMON_CD":
                return false;
        }
    }
    return true;
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "COMMON_CD")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.COMMON_CD)) {
            alert($NC.getDisplayMsg("JS.CSC05020E0.006", "공통코드를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDDETAIL, {
                selectRow: row,
                activeCell: G_GRDDETAIL.view.getColumnIndex("COMMON_CD"),
                editMode: true
            });
            return false;
        }
        if ($NC.isNull(rowData.COMMON_NM)) {
            alert($NC.getDisplayMsg("JS.CSC05020E0.007", "공통코드명을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDDETAIL, {
                selectRow: row,
                activeCell: G_GRDDETAIL.view.getColumnIndex("COMMON_NM"),
                editMode: true
            });
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // var rowData = G_GRDDETAIL.data.getItem(row);
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "COMMON_GRP", true)) {
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
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "COMMON_CD");
}

function onSave(ajaxData) {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "COMMON_GRP"
    });
    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "COMMON_CD"
    });

    _Inquiry();

    G_GRDMASTER.lastKeyVal = lastKeyValM;
    G_GRDDETAIL.lastKeyVal = lastKeyValD;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDDETAIL, rowData, true);
    }
}
