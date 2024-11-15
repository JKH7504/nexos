/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01042P0
 *  프로그램명         : 사용자프로그램등록 팝업
 *  프로그램설명       : 사용자프로그램등록 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2016-12-14    ASETEC           신규작성
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
                grids: "#grdSub1"
            },
            viewSecond: {
                container: "#divRightView",
                grids: "#grdSub2"
            },
            viewType: "h",
            viewFixed: 400,
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnCancel").click(onCancel);
    $("#btnSave").click(_Save);
    $("#btnDeleteUser").click(_Delete);
    $("#btnAddUser").click(_New);

    // 팝업이 표시되면 저장권한은 체크 됨, 삭제권한만 체크
    $NC.setEnable("#btnDeleteUser", $NC.G_VAR.G_PARAMETER.P_PERMISSION.canDelete);

    // 그리드 초기화
    grdSub1Initialize();
    grdSub2Initialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtProgram_Id", $NC.G_VAR.G_PARAMETER.P_PROGRAM_ID);
    $NC.setValue("#edtProgram_Nm", $NC.G_VAR.G_PARAMETER.P_PROGRAM_NM);

    _Inquiry();
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
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_OK);
    $NC.onPopupClose();
}

/**
 * 조회
 */
function _Inquiry() {

    var PROGRAM_ID = $NC.getValue("#edtProgram_Id");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB1);

    // 데이터 조회
    G_GRDSUB1.queryParams = {
        P_PROGRAM_ID: PROGRAM_ID
    };
    $NC.serviceCall("/CSC01040E0/getDataSet.do", $NC.getGridParams(G_GRDSUB1), onGetSub1);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB2);

    G_GRDSUB2.queryParams = {
        P_PROGRAM_ID: PROGRAM_ID
    };
    $NC.serviceCall("/CSC01040E0/getDataSet.do", $NC.getGridParams(G_GRDSUB2), onGetSub2);
}

/**
 * 신규
 */
function _New() {

    if (G_GRDSUB1.data.getLength() == 0) {
        return;
    }

    var selectedRows = G_GRDSUB1.view.getSelectedRows();
    if (selectedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01042P0.002", "등록할 사용자를 선택하십시오."));
        return;
    }

    var PROGRAM_ID = $NC.G_VAR.G_PARAMETER.P_PROGRAM_ID;
    var EXE_LEVEL1 = $NC.getValue("#chkExe_Level1");
    var EXE_LEVEL2 = $NC.getValue("#chkExe_Level2");
    var EXE_LEVEL3 = $NC.getValue("#chkExe_Level3");
    var EXE_LEVEL4 = $NC.getValue("#chkExe_Level4");
    var EXE_LEVEL5 = $NC.getValue("#chkExe_Level5");

    G_GRDSUB1.data.beginUpdate();
    G_GRDSUB2.data.beginUpdate();
    try {
        var rowData, newRowData;
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
            rowData = G_GRDSUB1.data.getItem(selectedRows[rIndex]);
            newRowData = {
                USER_ID: rowData.USER_ID,
                USER_NM: rowData.USER_NM,
                PROGRAM_ID: PROGRAM_ID,
                EXE_LEVEL1: EXE_LEVEL1,
                EXE_LEVEL2: EXE_LEVEL2,
                EXE_LEVEL3: EXE_LEVEL3,
                EXE_LEVEL4: EXE_LEVEL4,
                EXE_LEVEL5: EXE_LEVEL5,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };

            G_GRDSUB2.data.addItem(newRowData);

            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDSUB1.data.updateItem(rowData.id, rowData);
        }
    } finally {
        G_GRDSUB1.data.endUpdate();
        G_GRDSUB2.data.endUpdate();
    }
    G_GRDSUB1.data.refresh();
    G_GRDSUB2.data.refresh();

    if (G_GRDSUB1.data.getLength() == 0) {
        $NC.setGridDisplayRows(G_GRDSUB1, 0, 0);
    } else {
        $NC.setGridSelectRow(G_GRDSUB1, 0);
    }
    $NC.setGridSelectRow(G_GRDSUB2, 0);

    _Save();
}

/**
 * 저장
 */
function _Save() {

    if (G_GRDSUB2.data.getItems().length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01042P0.003", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB2)) {
        return;
    }

    var dsTarget = G_GRDSUB2.data.getItems();
    var dsMaster = [];
    var rowData;
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_USER_ID: rowData.USER_ID,
            P_PROGRAM_ID: rowData.PROGRAM_ID,
            P_EXE_LEVEL1: rowData.EXE_LEVEL1,
            P_EXE_LEVEL2: rowData.EXE_LEVEL2,
            P_EXE_LEVEL3: rowData.EXE_LEVEL3,
            P_EXE_LEVEL4: rowData.EXE_LEVEL4,
            P_EXE_LEVEL5: rowData.EXE_LEVEL5,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01042P0.004", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC01040E0/saveUserProgram.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

    if (G_GRDSUB2.data.getLength() == 0) {
        return;
    }

    var selectedRows = G_GRDSUB2.view.getSelectedRows();
    if (selectedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01042P0.005", "삭제할 사용자를 선택하십시오."));
        return;
    }

    G_GRDSUB1.data.beginUpdate();
    G_GRDSUB2.data.beginUpdate();
    try {
        var rowData, dsTarget, uRowData, uIndex, uCount;
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDSUB2.data.getItem(selectedRows[rIndex]);
            // 신규 데이터일 경우 그냥 삭제
            if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
                G_GRDSUB2.data.deleteItem(rowData.id);
            } else {
                rowData.CRUD = $ND.C_DV_CRUD_D;
                G_GRDSUB2.data.updateItem(rowData.id, rowData);

                dsTarget = G_GRDSUB1.data.getItems();
                for (uIndex = 0, uCount = dsTarget.length; uIndex < uCount; uIndex++) {
                    uRowData = dsTarget[uIndex];
                    if (rowData.USER_ID == uRowData.USER_ID) {
                        uRowData.CRUD = $ND.C_DV_CRUD_R;
                        uRowData.EXIST_YN = $ND.C_NO;
                        G_GRDSUB1.data.updateItem(uRowData.id, uRowData);
                        break;
                    }
                }
            }
        }
    } finally {
        G_GRDSUB1.data.endUpdate();
        G_GRDSUB2.data.endUpdate();
    }
    G_GRDSUB1.data.refresh();
    G_GRDSUB2.data.refresh();

    if (G_GRDSUB2.data.getLength() == 0) {
        $NC.setGridDisplayRows(G_GRDSUB2, 0, 0);
    } else {
        $NC.setGridSelectRow(G_GRDSUB2, 0);
    }
    $NC.setGridSelectRow(G_GRDSUB1, 0);

    _Save();
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    _Inquiry();
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
        case "EXE_LEVEL1":
        case "EXE_LEVEL2":
        case "EXE_LEVEL3":
        case "EXE_LEVEL4":
        case "EXE_LEVEL5":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function grdSub1OnGetColumns() {

    var columns = [];
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
        id: "CENTER_CD_F",
        field: "CENTER_CD_F",
        name: "물류센터"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}
function grdSub1Initialize() {

    var options = {
        frozenColumn: 0,
        multiSelect: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub1", {
        columns: grdSub1OnGetColumns(),
        queryId: "CSC01040E0.RS_SUB1",
        sortCol: "USER_ID",
        gridOptions: options,
        onFilter: grdSub1OnFilter
    });

    G_GRDSUB1.view.onSelectedRowsChanged.subscribe(grdSub1OnAfterScroll);
}

/**
 * grdSub1 데이터 필터링 이벤트
 */
function grdSub1OnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D //
        && item.EXIST_YN != $ND.C_YES;
}

function grdSub1OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB1, args.rows, e)) {
        // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
        if (args.rows.length == 0) {
            $NC.setGridSelectRow(G_GRDSUB1, G_GRDSUB1.lastRow);
            return;
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB1, row + 1);
}

function grdSub2OnGetColumns() {

    var columns = [];
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
        id: "EXE_LEVEL1",
        field: "EXE_LEVEL1",
        name: "저장권한",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "EXE_LEVEL2",
        field: "EXE_LEVEL2",
        name: "삭제권한",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "EXE_LEVEL3",
        field: "EXE_LEVEL3",
        name: "확정권한",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "EXE_LEVEL4",
        field: "EXE_LEVEL4",
        name: "취소권한",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "EXE_LEVEL5",
        field: "EXE_LEVEL5",
        name: "승인권한",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_CD_F",
        field: "CENTER_CD_F",
        name: "물류센터"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}
function grdSub2Initialize() {

    var options = {
        frozenColumn: 1,
        multiSelect: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub2", {
        columns: grdSub2OnGetColumns(),
        queryId: "CSC01040E0.RS_SUB2",
        sortCol: "USER_ID",
        gridOptions: options,
        onFilter: grdSub2OnFilter
    });

    G_GRDSUB2.view.onSelectedRowsChanged.subscribe(grdSub2OnAfterScroll);
    G_GRDSUB2.view.onBeforeEditCell.subscribe(grdSub2OnBeforeEditCell);
    G_GRDSUB2.view.onCellChange.subscribe(grdSub2OnCellChange);
}

/**
 * grdSub2 데이터 필터링 이벤트
 */
function grdSub2OnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

function grdSub2OnNewRecord(args) {

    $NC.setFocusGrid(G_GRDSUB2, args.row, "ITEM_CD", true);
}

function grdSub2OnBeforeEditCell(e, args) {

    return true;
}

function grdSub2OnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdSub2OnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUB2, row)) {
        return true;
    }

    return true;
}

function grdSub2OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB2, args.rows, e)) {
        // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
        if (args.rows.length == 0) {
            $NC.setGridSelectRow(G_GRDSUB2, G_GRDSUB2.lastRow);
            return;
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB2, row + 1);
}

function onGetSub1(ajaxData) {

    $NC.setInitGridData(G_GRDSUB1, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB1);
}

function onGetSub2(ajaxData) {

    $NC.setInitGridData(G_GRDSUB2, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB2);
}

function onSave(ajaxData) {

    _Inquiry();
}
