/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDR01012P0
 *  프로그램명         : 인터페이스수신체크등록 팝업
 *  프로그램설명       : 인터페이스수신체크등록 팝업 화면 Javascript
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
        autoResizeView: {
            container: "#ctrPopupView",
            grids: [
                "#grdMaster",
                "#grdDetail"
            ]
        },
        // 마스터 데이터
        masterData: null
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnEntry").click(btnEntryOnClick); // 수신체크 등록버튼
    $("#btnDelete").click(btnDeleteOnClick); // 수신체크 삭제버튼
}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#ctrPopupView", "h", 200, 100, 150);

    // 수신체크 세팅
    var dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
    var rowData, newRowData;
    G_GRDMASTER.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = dsMaster.length; rIndex < rCount; rIndex++) {
            rowData = dsMaster[rIndex];
            newRowData = {
                BU_CD: rowData.BU_CD,
                EDI_DIV: rowData.EDI_DIV,
                DEFINE_NO: rowData.DEFINE_NO,
                CHECK_NO: rowData.CHECK_NO,
                CHECK_NM: rowData.CHECK_NM,
                REMARK1: rowData.REMARK1,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_R
            };
            G_GRDMASTER.data.addItem(newRowData);
        }
    } finally {
        G_GRDMASTER.data.endUpdate();
    }

    $NC.setInitGridAfterOpen(G_GRDMASTER);

    var EDI_DIV = $NC.G_VAR.G_PARAMETER.P_EDI_DIV;
    // 데이터 조회
    $NC.serviceCall("/EDR01010E0/getDataSet.do", {
        P_QUERY_ID: "EDR01010E0.RS_SUB4",
        P_QUERY_PARAMS: {
            P_EDI_DIV: EDI_DIV
        }
    }, onGetDetail);

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
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

}

/**
 * 저장
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.EDR01012P0.002", "저장할 데이터가 없습니다."));
        return;
    }

    var dsMaster = [];
    var dsTarget = G_GRDMASTER.data.getItems();
    var rowData;
    for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_BU_CD: rowData.BU_CD,
            P_EDI_DIV: rowData.EDI_DIV,
            P_DEFINE_NO: rowData.DEFINE_NO,
            P_CHECK_NO: rowData.CHECK_NO,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.EDR01012P0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/EDR01010E0/saveBuCheck.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 * @param view
 *        대상 Object
 * @param args
 *        row, cell, value
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
        case "CHECK_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "CHECK_NO",
        field: "CHECK_NO",
        name: "수신체크번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CHECK_NM",
        field: "CHECK_NM",
        name: "수신체크명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdMasterInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "EDR01010E0.RS_SUB2",
        sortCol: "CHECK_NO",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

function grdMasterOnClick(e, args) {

    var columnId = G_GRDMASTER.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTER, e, args);
            break;
    }
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "CHECK_NO",
        field: "CHECK_NO",
        name: "수신체크번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CHECK_NM",
        field: "CHECK_NM",
        name: "수신체크명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "EDR01010E0.RS_SUB4",
        sortCol: "CHECK_NO",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
    G_GRDDETAIL.view.onClick.subscribe(grdDetailOnClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdDetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDDETAIL, e, args);
            break;
    }
}

function grdDetailOnClick(e, args) {

    var columnId = G_GRDDETAIL.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDDETAIL, e, args);
            break;
    }
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "CHECK_NO");
}

function btnEntryOnClick() {

    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
        G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
    }

    var checkedCount = 0;
    var rowData, newRowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;

        if ($NC.getGridSearchRow(G_GRDMASTER, {
            searchKey: "CHECK_NO",
            searchVal: rowData.CHECK_NO
        }) > -1) {
            continue;
        }

        newRowData = {
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            EDI_DIV: $NC.G_VAR.G_PARAMETER.P_EDI_DIV,
            DEFINE_NO: $NC.G_VAR.G_PARAMETER.P_DEFINE_NO,
            CHECK_NO: rowData.CHECK_NO,
            CHECK_NM: rowData.CHECK_NM,
            REMARK1: rowData.REMARK1,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_C
        };
        G_GRDMASTER.data.addItem(newRowData);
    }

    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.EDR01012P0.004", "등록할 수신체크 내역을 선택 후 처리하십시오."));
        return;
    }

    _Save();
}

function btnDeleteOnClick() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.EDR01012P0.005", "선택한 수신체크를 삭제하시겠습니까?"))) {
        return;
    }

    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }

    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.EDR01012P0.006", "삭제할 수신체크를 선택하십시오."));
        return;
    }

    _Save();
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}