/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC03010E0
 *  프로그램명         : 프로세스관리
 *  프로그램설명       : 프로세스관리 화면 Javascript
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

    // 그리드 초기화
    grdMasterInitialize();
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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 데이터 조회
    $NC.serviceCall("/CSC03010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // grdMaster에 포커스가 있을 경우
    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    var PROCESS_GRP;
    if ($NC.isNull(refRowData)) {
        PROCESS_GRP = $ND.C_PROCESS_GRP_IN;
    } else {
        PROCESS_GRP = refRowData.PROCESS_GRP;
    }
    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        PROCESS_GRP: PROCESS_GRP,
        PROCESS_CD: null,
        PROCESS_NM: null,
        SKIP_PROCESS_YN: $ND.C_NO,
        PROCESS_STATE: null,
        PROCESS_STATE_D: null,
        REG_DATETIME: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N,
        PROCESS_GRP_F: $NC.getGridComboName(G_GRDMASTER, {
            columnId: "PROCESS_GRP_F",
            searchVal: PROCESS_GRP,
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        })
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC03010E0.001", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 프로세스 수정 데이터
    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_PROCESS_GRP: rowData.PROCESS_GRP,
            P_PROCESS_CD: rowData.PROCESS_CD,
            P_PROCESS_NM: rowData.PROCESS_NM,
            P_PROCESS_STATE: rowData.PROCESS_STATE,
            P_SKIP_PROCESS_YN: rowData.SKIP_PROCESS_YN,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC03010E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC03010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: [],
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC03010E0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC03010E0.004", "프로세스를 삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.deleteGridRowData(G_GRDMASTER, rowData);
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
        selectKey: [
            "PROCESS_GRP",
            "PROCESS_CD"
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
        case "SKIP_PROCESS_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "PROCESS_GRP_F",
        field: "PROCESS_GRP_F",
        name: "프로세스그룹",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "PROCESS_GRP",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "PROCESS_GRP",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "PROCESS_CD",
        field: "PROCESS_CD",
        name: "프로세스코드",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "PROCESS_NM",
        field: "PROCESS_NM",
        name: "프로세스명",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "SKIP_PROCESS_YN",
        field: "SKIP_PROCESS_YN",
        name: "생략가능여부",
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
        name: "프로세스상태",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/CSC03010E0/getDataSet.do", {
            P_QUERY_ID: "CSC03010E0.RS_REF1",
            P_QUERY_PARAMS: {
                P_PROCESS_GRP: $ND.C_PROCESS_GRP_IN
            }
        }, {
            codeField: "PROCESS_STATE",
            dataCodeField: "PROCESS_STATE",
            dataFullNameField: "PROCESS_STATE_F",
            isKeyField: true
        })
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
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC03010E0.RS_MASTER",
        sortCol: "PROCESS_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, "PROCESS_GRP_F", true);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "PROCESS_GRP_F":
            case "PROCESS_CD":
                return false;
        }
    }
    return true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "PROCESS_GRP_F":
            if ($NC.isNotNull(rowData.PROCESS_GRP)) {
                // 데이터 조회
                $NC.serviceCallAndWait("/CSC03010E0/getDataSet.do", {
                    P_QUERY_ID: "CSC03010E0.RS_REF1",
                    P_QUERY_PARAMS: {
                        P_PROCESS_GRP: rowData.PROCESS_GRP
                    }
                }, onGetProcessStateCombo);

                rowData.PROCESS_STATE = null;
                rowData.PROCESS_STATE_F = null;
            }
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, [
        "PROCESS_GRP",
        "PROCESS_CD"
    ])) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.PROCESS_GRP)) {
            alert($NC.getDisplayMsg("JS.CSC03010E0.005", "프로세스 그룹을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "PROCESS_GRP", true);
            return false;
        }
        if ($NC.isNull(rowData.PROCESS_CD)) {
            alert($NC.getDisplayMsg("JS.CSC03010E0.006", "프로세스 코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "PROCESS_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.PROCESS_NM)) {
            alert($NC.getDisplayMsg("JS.CSC03010E0.007", "프로세스 명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "PROCESS_NM", true);
            return false;
        }
        if ($NC.isNull(rowData.PROCESS_STATE)) {
            alert($NC.getDisplayMsg("JS.CSC03010E0.008", "프로세스 상태를 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "PROCESS_STATE_F", true);
            return false;
        }

        // 전체 데이터를 기준으로 동일 그룹, 프로세스 체크
        var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
            searchKey: [
                "PROCESS_GRP",
                "PROCESS_CD"
            ],
            searchVal: [
                rowData.PROCESS_GRP,
                rowData.PROCESS_CD
            ],
            isAllData: true
        });
        if (searchRows.length > 1) {
            alert($NC.getDisplayMsg("JS.CSC03010E0.009", "해당 프로세스 코드는 이미 입력된 코드입니다.\n\n다른 프로세스 코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "PROCESS_CD", true);
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

    var refRowData = null;
    if ($NC.isNotNull(G_GRDMASTER.lastRow)) {
        // 신규 데이터에 입력하지 않고 이동할 경우
        if (G_GRDMASTER.lastRow >= G_GRDMASTER.data.getLength()) {
            G_GRDMASTER.lastRow = null;
        } else {
            refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        }
    }
    if ($NC.isNotNull(G_GRDMASTER.lastRow) && rowData.PROCESS_GRP != refRowData.PROCESS_GRP) {
        $NC.serviceCallAndWait("/CSC03010E0/getDataSet.do", {
            P_QUERY_ID: "CSC03010E0.RS_REF1",
            P_QUERY_PARAMS: {
                P_PROCESS_GRP: rowData.PROCESS_GRP
            }
        }, onGetProcessStateCombo);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "PROCESS_GRP",
        "PROCESS_CD"
    ], true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);

}

function onGetProcessStateCombo(ajaxData) {

    var activeCell = G_GRDMASTER.view.getActiveCell();
    var activeEditing = G_GRDMASTER.view.getEditorLock().isActive();
    var columns = G_GRDMASTER.view.getColumns();
    columns[G_GRDMASTER.view.getColumnIndex("PROCESS_STATE_F")].editorOptions = {
        codeField: "PROCESS_STATE",
        dataCodeField: "PROCESS_STATE",
        dataFullNameField: "PROCESS_STATE_F",
        data: $NC.toArray(ajaxData),
        isKeyField: true
    };
    G_GRDMASTER.view.setColumns(columns);
    if (activeEditing && $NC.isNotNull(activeCell)) {
        $NC.setFocusGrid(G_GRDMASTER, activeCell.row, activeCell.cell, true);
    }
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "PROCESS_GRP",
            "PROCESS_CD"
        ]
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
