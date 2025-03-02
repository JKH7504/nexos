﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : usergridlayoutpopup
 *  프로그램명         : 사용자 그리드 설정 팝업
 *  프로그램설명       : 사용자 그리드 설정 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-12
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
                container: "#ctrMasterView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#ctrDetailView",
                grids: "#grdDetail"
            },
            viewType: "v",
            viewFixed: {
                container: "#ctrDetailView",
                size: 150
            },
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    $NC.setTooltip("#btnUp", $NC.getDisplayMsg("JS.USERGRIDLAYOUT.XXX", "위로 이동"));
    $NC.setTooltip("#btnDown", $NC.getDisplayMsg("JS.USERGRIDLAYOUT.XXX", "아래로 이동"));

    $("#btnAdd").click(btnAddOnClick);
    $("#btnDelete").click(btnDeleteOnClick);
    $("#btnUp").click(btnUpOnClick);
    $("#btnDown").click(btnDownOnClick);
    $("#btnInitializeProgram").click(btnInitializeProgramOnClick);
    $("#btnInitializeGrid").click(btnInitializeGridOnClick);
    $("#btnOk").click(_Save);
    $("#btnCancel").click(onCancel);
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
 * Load Complete Event
 */
function _OnLoaded() {

    // 데이터를 넘겨 받으면 데이터 그냥 표시
    $NC.setValue("#edtProgram_Id_F", $NC.getDisplayCombo($NC.G_VAR.G_PARAMETER.P_PROGRAM_ID, $NC.G_VAR.G_PARAMETER.P_PROGRAM_NM));
    $NC.setValue("#edtGrid_Nm", $NC.G_VAR.G_PARAMETER.P_GRID_NM);

    // 컬럼 정보 세팅
    setGridColumnInfo();
}

function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

function onClose() {

    $NC.setPopupCloseAction($ND.C_OK, $NC.G_VAR.RESULT_INFO);
    $NC.onPopupClose();
}

function _Save() {

    if (!confirm($NC.getDisplayMsg("JS.USERGRIDLAYOUT.XXX", "[그리드: " + $NC.G_VAR.G_PARAMETER.P_GRID_NM
        + "]\n\n해당 그리드의 설정을 저장하시겠습니까?\n(※ 저장 후 화면이 다시 로딩됩니다.)", $NC.G_VAR.G_PARAMETER.P_GRID_NM))) {
        return;
    }

    var rowCount = G_GRDMASTER.data.getLength();
    if (rowCount == 0) {
        alert($NC.getDisplayMsg("JS.USERGRIDLAYOUTPOPUP.XXX", "그리드의 항목을 모두 제거할 수 없습니다."));
        return;
    }

    var frozenColumn = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: "FROZEN_COL_YN",
        searchVal: $ND.C_YES
    });
    // if (frozenColumn == rowCount - 1) {
    // alert($NC.getDisplayMsg("JS.USERGRIDLAYOUTPOPUP.XXX", "고정을 마지막 항목에 지정할 수 없습니다."));
    // return;
    // }

    var orderBy = [], hiddenColumns = [], rIndex, rCount, rowData;
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        orderBy.push(rowData.COLUMN_ID);
    }

    for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        hiddenColumns.push(rowData.COLUMN_ID);
    }

    $NC.G_VAR.RESULT_INFO = {
        P_ACTION: "S", // 저장
        P_GRID_ID: $NC.G_VAR.G_PARAMETER.P_GRID_ID,
        P_GRID_OBJECT: $NC.G_VAR.G_PARAMETER.P_GRID_OBJECT,
        P_USER_GRID_LAYOUT: {
            frozenColumn: frozenColumn,
            orderBy: orderBy,
            hiddenColumns: hiddenColumns
        }
    };

    $NC.serviceCall("/WC/saveUserGridLayout.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_PROGRAM_ID: $NC.G_VAR.G_PARAMETER.P_PROGRAM_ID,
        P_GRID_ID: $NC.G_VAR.G_PARAMETER.P_GRID_ID,
        P_GRID_CFG: $NC.toJson($NC.G_VAR.RESULT_INFO.P_USER_GRID_LAYOUT),
        // 저장은 R로 송신
        P_CRUD: $ND.C_DV_CRUD_R
    }, onSave);
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "COLUMN_NM",
        field: "COLUMN_NM",
        name: "항목명",
        sortable: false
    });
    $NC.setGridColumn(columns, {
        id: "BAND_NM",
        field: "BAND_NM",
        name: "항목그룹명"
    });
    $NC.setGridColumn(columns, {
        id: "FROZEN_COL_YN",
        field: "FROZEN_COL_YN",
        name: "항목고정",
        resizable: false,
        sortable: false,
        minWidth: 70,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        specialRow: {
            compareKey: "REQUIRED_COL_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "stySpecial"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        gridOptions: options,
        canExportExcel: false,
        redefineColumn: $ND.C_NO,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 물류센터 %d건 삭제",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = dd.dragGridObject.data.getItem(dd.dragRows[0]);
                var result;
                if (dd.dragCount == 1) {
                    result = "[항목: " + rowData.COLUMN_NM + "] 삭제";
                } else {
                    result = "[항목: " + rowData.COLUMN_NM + "] 외 " + (dd.dragCount - 1) + "건 삭제";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdDetail",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                btnAddOnClick();
            }
        }
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
    G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
}

function grdMasterOnDblClick(e, args) {

    var rowData = G_GRDMASTER.data.getItem(args.row);
    if ($NC.isNull(rowData)) {
        return;
    }

    // 삭제 호출
    btnDeleteOnClick();
}

function grdMasterOnBeforeEditCell(e, args) {

    return true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        //
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

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "COLUMN_NM",
        field: "COLUMN_NM",
        name: "항목명"
    });
    $NC.setGridColumn(columns, {
        id: "BAND_NM",
        field: "BAND_NM",
        name: "항목그룹명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {};

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        gridOptions: options,
        canExportExcel: false,
        redefineColumn: $ND.C_NO,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 물류센터 %d건 추가",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = dd.dragGridObject.data.getItem(dd.dragRows[0]);
                var result;
                if (dd.dragCount == 1) {
                    result = "[항목: " + rowData.COLUMN_NM + "] 추가";
                } else {
                    result = "[항목: " + rowData.COLUMN_NM + "] 외 " + (dd.dragCount - 1) + "건 추가";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdMaster",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                btnDeleteOnClick();
            }
        }
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
    G_GRDDETAIL.view.onDblClick.subscribe(grdDetailOnDblClick);
}

function grdDetailOnDblClick(e, args) {

    var rowData = G_GRDDETAIL.data.getItem(args.row);
    if ($NC.isNull(rowData)) {
        return;
    }

    // 추가 호출
    btnAddOnClick();
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row)) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        //
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

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function btnInitializeProgramOnClick() {

    if (!confirm($NC.getDisplayMsg("JS.USERGRIDLAYOUT.XXX", "[프로그램: " + $NC.G_VAR.G_PARAMETER.P_PROGRAM_NM
        + "]\n\n해당 프로그램의 모든 그리드 설정을 초기화하시겠습니까?\n(※ 초기화 후 화면이 다시 로딩됩니다.)", $NC.G_VAR.G_PARAMETER.P_PROGRAM_NM))) {
        return;
    }

    $NC.G_VAR.RESULT_INFO = {
        P_ACTION: "P", // 프로그램
        P_GRID_ID: "",
        P_GRID_OBJECT: null,
        P_USER_GRID_LAYOUT: {}
    };

    $NC.serviceCall("/WC/saveUserGridLayout.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_PROGRAM_ID: $NC.G_VAR.G_PARAMETER.P_PROGRAM_ID,
        P_GRID_ID: $NC.G_VAR.G_PARAMETER.P_GRID_ID,
        P_GRID_CFG: null,
        // 삭제은 D로 송신
        P_CRUD: $ND.C_DV_CRUD_D
    }, onSave);
}

function btnInitializeGridOnClick() {

    if (!confirm($NC.getDisplayMsg("JS.USERGRIDLAYOUT.XXX", "[그리드: " + $NC.G_VAR.G_PARAMETER.P_GRID_NM
        + "]\n\n해당 그리드의 설정을 초기화하시겠습니까?\n(※ 초기화 후 화면이 다시 로딩됩니다.)", $NC.G_VAR.G_PARAMETER.P_GRID_NM))) {
        return;
    }

    $NC.G_VAR.RESULT_INFO = {
        P_ACTION: "G", // 그리드
        P_GRID_ID: $NC.G_VAR.G_PARAMETER.P_GRID_ID,
        P_GRID_OBJECT: $NC.G_VAR.G_PARAMETER.P_GRID_OBJECT,
        P_USER_GRID_LAYOUT: {}
    };

    $NC.serviceCall("/WC/saveUserGridLayout.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_PROGRAM_ID: $NC.G_VAR.G_PARAMETER.P_PROGRAM_ID,
        P_GRID_ID: null,
        P_GRID_CFG: null,
        // 삭제은 D로 송신
        P_CRUD: $ND.C_DV_CRUD_D
    }, onSave);
}

function btnDeleteOnClick() {

    var rowCount = G_GRDMASTER.data.getLength();
    if (rowCount == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        // alert($NC.getDisplayMsg("JS.USERGRIDLAYOUTPOPUP.XXX", "삭제할 항목 데이터가 없습니다."));
        return;
    }

    if (rowCount == 1) {
        alert($NC.getDisplayMsg("JS.USERGRIDLAYOUTPOPUP.XXX", "그리드의 항목을 모두 제거할 수 없습니다."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.REQUIRED_COL_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.USERGRIDLAYOUTPOPUP.XXX", "필수 입력 항목입니다. 항목을 제거할 수 없습니다."));
        return;
    }

    var newRowData = {
        COLUMN_ID: rowData.COLUMN_ID,
        COLUMN_NM: rowData.COLUMN_NM,
        BAND_NO: rowData.BAND_NO,
        BAND_NM: rowData.BAND_NM,
        REQUIRED_COL_YN: rowData.REQUIRED_COL_YN,
        CRUD: $ND.C_DV_CRUD_R,
        id: $NC.getGridNewRowId()
    };

    // 데이터 삭제
    $NC.deleteGridRowData(G_GRDMASTER, rowData, false);

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDDETAIL, newRowData);
    // 마지막 데이터 수정중이 아닌 상태로 강제 변경
    G_GRDDETAIL.lastRowModified = false;
}

function btnAddOnClick() {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        // alert($NC.getDisplayMsg("JS.USERGRIDLAYOUTPOPUP.XXX", "추가할 항목 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    var newRowData = {
        COLUMN_ID: rowData.COLUMN_ID,
        COLUMN_NM: rowData.COLUMN_NM,
        BAND_NO: rowData.BAND_NO,
        BAND_NM: rowData.BAND_NM,
        FROZEN_COL_YN: $ND.C_NO,
        REQUIRED_COL_YN: rowData.REQUIRED_COL_YN,
        CRUD: $ND.C_DV_CRUD_R,
        id: $NC.getGridNewRowId()
    };

    // 데이터 삭제
    $NC.deleteGridRowData(G_GRDDETAIL, rowData, false);

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

function btnUpOnClick() {

    if ($NC.isNull(G_GRDMASTER.lastRow) || G_GRDMASTER.lastRow == 0) {
        return;
    }

    var lastRow = exchangeColumn(G_GRDMASTER.lastRow, "U");
    $NC.setGridSelectRow(G_GRDMASTER, lastRow);
}

function btnDownOnClick() {

    if ($NC.isNull(G_GRDMASTER.lastRow) || G_GRDMASTER.lastRow == G_GRDMASTER.data.getLength() - 1) {
        return;
    }

    var lastRow = exchangeColumn(G_GRDMASTER.lastRow, "D");
    $NC.setGridSelectRow(G_GRDMASTER, lastRow);
}

function exchangeColumn(row, exchangeMode) {

    var rowBase = row, rowMove;
    if (exchangeMode == "U") {
        rowMove = rowBase - 1;
    } else {
        rowMove = rowBase + 1;
    }

    // 대상 데이터
    var oldBaseRowData = G_GRDMASTER.data.getItem(rowBase);
    var oldMoveRowData = G_GRDMASTER.data.getItem(rowMove);

    // 대상 데이터 복제
    var newBaseRowData = $.extend({}, oldBaseRowData);
    var newMoveRowData = $.extend({}, oldMoveRowData);

    // 기존 데이터 삭제
    G_GRDMASTER.data.deleteItem(oldBaseRowData.id);
    G_GRDMASTER.data.deleteItem(oldMoveRowData.id);

    // 수정 상태
    if (newBaseRowData.CRUD == $ND.C_DV_CRUD_R) {
        newBaseRowData.CRUD = $ND.C_DV_CRUD_U;
    }
    if (newMoveRowData.CRUD == $ND.C_DV_CRUD_R) {
        newMoveRowData.CRUD = $ND.C_DV_CRUD_U;
    }

    // 위로 이동
    if (exchangeMode == "U") {
        G_GRDMASTER.data.insertItem(rowMove, newMoveRowData);
        G_GRDMASTER.data.insertItem(rowMove, newBaseRowData);
    }
    // 아래로 이동
    else {
        G_GRDMASTER.data.insertItem(rowBase, newBaseRowData);
        G_GRDMASTER.data.insertItem(rowBase, newMoveRowData);
    }

    return rowMove;
}

/**
 * 컬럼 세팅 정보로 데이터 생성
 * 
 * @returns
 */
function setGridColumnInfo() {

    var grdObject = $NC.G_VAR.G_PARAMETER.P_GRID_OBJECT, //
    dsMaster = [], //
    dsDetail = [], //
    dsDummy = [], dummyOrderBy = [], currentOrderBy = [], //
    currentColumns = grdObject.view.getColumns(), // 현재 그리드 컬럼
    grdOptions = grdObject.view.getOptions(), // 현재 그리드 옵션
    columnBands = grdOptions.bands || [], // 컬럼 밴드
    columnSets = grdObject.globalVar.columnSets, // 그리드 사용 가능 전체 컬럼(화면표시그룹에 의해 숨겨진 컬럼만 제외)
    userGridLayout = $NC.G_VAR.G_PARAMETER.P_USER_GRID_LAYOUT || {}, // 사용자 설정, 사용자 미설정시 없음
    userOrderBy = userGridLayout.orderBy, // 사용자 컬럼 순서
    hiddenColumns = userGridLayout.hiddenColumns, // 사용자 숨김 컬럼
    columnNoName = $NC.getDisplayMsg("JS.USERGRIDLAYOUTPOPUP.XXX", "[미지정]"), //
    column, rowData, rIndex, rCount, searchIndex, //
    REQUIRED_COL_YN;

    // 그리드 초기화 후 재세팅시
    if (!Array.isArray(hiddenColumns)) {
        hiddenColumns = [];
    }

    // 현재 컬럼 순서 기록
    for (rIndex = 0, rCount = currentColumns.length; rIndex < rCount; rIndex++) {
        column = currentColumns[rIndex];
        currentOrderBy.push(column.id);
    }

    // 사용 가능 컬럼에서 숨김 컬럼을 제외하고 사용자 컬럼 순서로 추가, [정책, 데이터값]으로 보임/숨김은 처리 안함
    for (rIndex = 0, rCount = columnSets.orderBy.length; rIndex < rCount; rIndex++) {
        column = columnSets.columns[rIndex];

        // 숨김 컬럼이 아닐 경우 추가
        searchIndex = hiddenColumns.indexOf(column.id);
        if (searchIndex != -1) {
            continue;
        }

        REQUIRED_COL_YN = $ND.C_NO;
        // 필수 컬럼 체크
        if (isRequiredEditColumn(column) || isRequiredCheckBoxColumn(column)) {
            // 제거 불가능
            REQUIRED_COL_YN = $ND.C_YES;
        }

        rowData = {
            COLUMN_ID: column.id,
            COLUMN_NM: $NC.isNull(column.name) ? columnNoName : column.name,
            BAND_NO: column.band,
            BAND_NM: columnBands[column.band || 0],
            FROZEN_COL_YN: $ND.C_NO,
            REQUIRED_COL_YN: REQUIRED_COL_YN,
            CRUD: $ND.C_DV_CRUD_R,
            id: $NC.getGridNewRowId()
        };

        dsDummy.push(rowData);
        dummyOrderBy.push(rowData.COLUMN_ID);
    }

    // 사용자 컬럼 순서로 재정렬
    if (Array.isArray(userOrderBy)) {
        for (rIndex = 0, rCount = userOrderBy.length; rIndex < rCount; rIndex++) {
            searchIndex = dummyOrderBy.indexOf(userOrderBy[rIndex]);
            if (searchIndex == -1) {
                continue;
            }

            dsMaster.push(dsDummy[searchIndex]);
        }
    } else {
        $.extend(dsMaster, dsDummy);
    }

    // 고정 컬럼 선택, 선택 가능할 경우
    if (grdOptions.frozenColumn != -1 && dsMaster.length > grdOptions.frozenColumn) {
        dsMaster[grdOptions.frozenColumn].FROZEN_COL_YN = $ND.C_YES;
    }

    // 제거된 컬럼, 사용자 숨김 컬럼이 전체 컬럼에 존재할 경우만 추가
    for (rIndex = 0, rCount = hiddenColumns.length; rIndex < rCount; rIndex++) {
        // 숨김 컬럼이 전체 컬럼에 존재할 경우 추가, 프로그램 수정으로 제거된 컬럼
        searchIndex = columnSets.orderBy.indexOf(hiddenColumns[rIndex]);
        if (searchIndex == -1) {
            continue;
        }

        column = columnSets.columns[searchIndex];

        REQUIRED_COL_YN = $ND.C_NO;
        // 필수 컬럼 체크
        if (isRequiredEditColumn(column) || isRequiredCheckBoxColumn(column)) {
            // 제거 불가능
            REQUIRED_COL_YN = $ND.C_YES;
        }

        rowData = {
            COLUMN_ID: column.id,
            COLUMN_NM: $NC.isNull(column.name) ? columnNoName : column.name,
            BAND_NO: column.band,
            BAND_NM: columnBands[column.band || 0],
            REQUIRED_COL_YN: REQUIRED_COL_YN,
            CRUD: $ND.C_DV_CRUD_R,
            id: $NC.getGridNewRowId()
        };

        dsDetail.push(rowData);
    }

    // 컬럼 밴드 사용에 따라
    $NC.setGridColumns(G_GRDMASTER, [ // 숨김컬럼 세팅
        grdOptions.showBandRow !== true ? "BAND_NM" : ""
    ]);

    $NC.setGridColumns(G_GRDDETAIL, [ // 숨김컬럼 세팅
        grdOptions.showBandRow !== true ? "BAND_NM" : ""
    ]);

    $NC.setInitGridData(G_GRDMASTER, dsMaster);
    $NC.setGridSelectRow(G_GRDMASTER, 0);

    $NC.setInitGridData(G_GRDDETAIL, dsDetail);
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
}

function isRequiredEditColumn(column) {

    // 필수 컬럼 여부, 필수는 숨김 불가
    // Editor 미지정
    if ($NC.isNull(column.editor)) {
        return false;
    }

    // Editor 옵션 지정
    if ($.isEmptyObject(column.editorOptions)) {
        return false;
    }

    // Editor 지정, 필수일 경우
    return column.editorOptions.isKeyField === true;
}

function isRequiredCheckBoxColumn(column) {

    // 체크박스 컬럼 여부, 체크박스 Editor는 숨김 불가
    // 체크박스 Formatter 지정, column 세팅 window 기준으로 체크해야 정상 체크 됨
    var ownerWindow = $NC.G_VAR.G_PARAMETER.P_WINDOW;
    if (column.formatter !== ownerWindow.Slick.Formatters.CheckBox) {
        return false;
    }

    // Editor 옵션 지정
    if ($NC.isNull(column.editorOptions)) {
        return false;
    }

    return true;
}

/**
 * 그리드에 컬럼 세팅 반영<br>
 * 현재 정책, 데이터값에 의해 현재 숨겨진 컬럼을 제외하고 반영
 * 
 * @returns
 */
function setOwnerGridColumns() {

    // args.grdObject, args.hiddenColumns, args.frozenColumn, args.headerCheckColumns
    var $ownerNC = $NC.G_VAR.G_PARAMETER.P_WINDOW.$NC, //
    grdObject = $NC.G_VAR.G_PARAMETER.P_GRID_OBJECT, //
    columnSets = grdObject.globalVar.columnSets; // 그리드 사용 가능 전체 컬럼(화면표시그룹에 의해 숨겨진 컬럼만 제외)

    // 그리드 사용자 설정 전역변수에 기록
    // 컬럼 재세팅시 사용
    $ownerNC.G_VAR.userGridLayout[$NC.G_VAR.G_PARAMETER.P_GRID_ID] = $.extend({}, $NC.G_VAR.RESULT_INFO.P_USER_GRID_LAYOUT);

    // 그리드 고정컬럼 세팅
    // grdObject.view.setOptions({
    // frozenColumn: args.frozenColumn
    // });
    // 기존 세팅의 컬럼수 보다 크게 고정컬럼을 지정하면 -1로 초기화가 되어 강제 변경 처리
    grdObject.view.getOptions().frozenColumn = $NC.nullToDefault($NC.G_VAR.RESULT_INFO.P_USER_GRID_LAYOUT.frozenColumn, columnSets.frozenColumn);

    // 그리드 컬럼 세팅
    $ownerNC.setGridColumns(grdObject, grdObject.globalVar.columnSets.lastHiddenColumns);
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
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
        case "FROZEN_COL_YN":
            // 체크 N -> 체크 Y, 체크할 경우 기존 선택은 해제, 하나만 선택
            if (args.val == $ND.C_NO) {
                var searchIndex = $NC.getGridSearchRow(grdObject, {
                    searchKey: columnId,
                    searchVal: $ND.C_YES
                });
                if (searchIndex != -1) {
                    var rowData = grdObject.data.getItem(searchIndex);
                    rowData.FROZEN_COL_YN = $ND.C_NO;

                    $NC.setGridApplyPost(grdObject, rowData, true);
                }
            }

            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}