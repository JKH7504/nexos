/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC06020E0
 *  프로그램명         : 메시지속성관리
 *  프로그램설명       : 메시지속성관리 화면 Javascript
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
    $("#btnDisplay_Grp").click(btnDisplayGrpOnClick);
    $("#btnRemark1").click(btnRemark1OnClick);
    $("#btnColumn_Width").click(btnColumnWidthOnClick);

    // 그리드 초기화
    grdMasterInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_MSG_GRP_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "MSG_GRP",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_MSG_GRP_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "MSG_GRP",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_CSC06020E0_RS_REF",
                P_QUERY_ID: "CSC06020E0.RS_REF",
                P_QUERY_PARAMS: null
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 - 메시지 그룹
        $NC.setInitComboData({
            selector: "#cboQMsg_Grp",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_MSG_GRP_2),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQMsg_Grp", 0);
            }
        });

        // 그리드 콤보박스 에디터 세팅 - 메시지그룹, 화면표시그룹
        var dsRef = $NC.toArray(multipleData.O_CSC06020E0_RS_REF);
        var columns = G_GRDMASTER.view.getColumns();
        columns[G_GRDMASTER.view.getColumnIndex("MSG_GRP_F")].editorOptions = {
            codeField: "MSG_GRP",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_MSG_GRP_1)
        };
        columns[G_GRDMASTER.view.getColumnIndex("DISPLAY_GRP_F")].editorOptions = {
            codeField: "DISPLAY_GRP",
            dataCodeField: "DISPLAY_GRP",
            dataNameField: "DISPLAY_NM",
            isKeyField: true,
            data: dsRef
        };
        G_GRDMASTER.view.setColumns(columns);

        // 조회조건 - 화면표시그룹 세팅
        $NC.setInitComboData({
            selector: "#cboQDisplay_Grp",
            codeField: "DISPLAY_GRP",
            nameField: "DISPLAY_NM",
            data: dsRef,
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQDisplay_Grp", 0);
            }
        });

        // 일괄수정 - 화면표시그룹 세팅
        $NC.setInitComboData({
            selector: "#cboDisplay_Grp",
            codeField: "DISPLAY_GRP",
            nameField: "DISPLAY_NM",
            data: dsRef,
            onComplete: function() {
                $NC.setValue("#cboDisplay_Grp", 0);
            }
        });
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

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
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, null, false);
            break;
    }
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var MSG_GRP = $NC.getValue("#cboQMsg_Grp");
    var DISPLAY_GRP = $NC.getValue("#cboQDisplay_Grp");
    var MSG_ID = $NC.getValue("#edtQMsg_Id", true);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    G_GRDMASTER.queryParams = {
        P_MSG_GRP: MSG_GRP,
        P_DISPLAY_GRP: DISPLAY_GRP,
        P_MSG_ID: MSG_ID
    };
    // 데이터 조회
    $NC.serviceCall("/CSC06020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var MSG_GRP = $NC.getValueCombo("#cboQMsg_Grp");
    if (MSG_GRP == $ND.C_ALL) {
        MSG_GRP = "00";
    }
    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        MSG_GRP: MSG_GRP,
        MSG_GRP_F: $NC.getGridComboName(G_GRDMASTER, {
            columnId: "MSG_GRP_F",
            searchVal: MSG_GRP,
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        }),
        MSG_ID: "",
        DISPLAY_GRP: "00",
        DISPLAY_GRP_F: $NC.getGridComboName(G_GRDMASTER, {
            columnId: "DISPLAY_GRP_F",
            searchVal: "00",
            dataCodeField: "DISPLAY_GRP",
            dataFullNameField: "DISPLAY_GRP_F"
        }),
        MSG_LANG1: "",
        MSG_LANG2: "",
        MSG_LANG3: "",
        MSG_LANG4: "",
        COLUMN_WIDTH: null,
        REMARK1: "",
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.001", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_MSG_GRP: rowData.MSG_GRP,
            P_MSG_ID: rowData.MSG_ID,
            P_DISPLAY_GRP: rowData.DISPLAY_GRP,
            P_MSG_LANG1: rowData.MSG_LANG1,
            P_MSG_LANG2: rowData.MSG_LANG2,
            P_MSG_LANG3: rowData.MSG_LANG3,
            P_MSG_LANG4: rowData.MSG_LANG4,
            P_COLUMN_WIDTH: rowData.COLUMN_WIDTH,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    if (rowData.CRUD == $ND.C_DV_CRUD_U && !confirm($NC.getDisplayMsg("JS.CSC06020E0.003", "메시지속성을 변경하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/CSC06020E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.004", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC06020E0.005", "삭제 하시겠습니까?"))) {
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
            "MSG_GRP",
            "MSG_ID"
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
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 데이터 초기화
    $NC.clearGridData(G_GRDMASTER);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
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
        id: "MSG_ID",
        field: "MSG_ID",
        name: "메시지ID",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "MSG_GRP_F",
        field: "MSG_GRP_F",
        name: "메시지그룹",
        editor: Slick.Editors.ComboBox
    });
    $NC.setGridColumn(columns, {
        id: "DISPLAY_GRP_F",
        field: "DISPLAY_GRP_F",
        name: "화면표시그룹",
        editor: Slick.Editors.ComboBox
    });
    $NC.setGridColumn(columns, {
        id: "MSG_LANG1",
        field: "MSG_LANG1",
        name: "제1언어",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "MSG_LANG2",
        field: "MSG_LANG2",
        name: "제2언어",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "MSG_LANG3",
        field: "MSG_LANG3",
        name: "제3언어",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "MSG_LANG4",
        field: "MSG_LANG4",
        name: "제4언어",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_WIDTH",
        field: "COLUMN_WIDTH",
        name: "컬럼너비",
        cssClass: "styRight",
        editor: Slick.Editors.Number
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
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC06020E0.RS_MASTER",
        sortCol: "MSG_GRP_F",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "MSG_GRP_F":
            case "MSG_ID":
                return false;
        }
    }
    return true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "MSG_ID")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.MSG_GRP)) {
            alert($NC.getDisplayMsg("JS.CSC06020E0.006", "메시지그룹을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "MSG_GRP", true);
            return false;
        }

        if ($NC.isNull(rowData.MSG_ID)) {
            alert($NC.getDisplayMsg("JS.CSC06020E0.007", "메시지ID를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "MSG_ID", true);
            return false;
        }
        if ($NC.isNull(rowData.DISPLAY_GRP)) {
            alert($NC.getDisplayMsg("JS.CSC06020E0.008", "화면표시그룹을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "DISPLAY_GRP", true);
            return false;
        }
        if ($NC.isNull(rowData.MSG_LANG1)) {
            alert($NC.getDisplayMsg("JS.CSC06020E0.009", "제1언어를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "MSG_LANG1", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, "MSG_ID", true);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "MSG_GRP",
        "MSG_ID"
    ], true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function grdMasterOnClick(e, args) {

    var columnId = G_GRDMASTER.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTER, e, args, null, false);
            break;
    }
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args, null, false);
            break;
    }
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "MSG_GRP",
            "MSG_ID"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 비고 수정
 */
function btnRemark1OnClick(e) {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.010", "수정할 데이터가 없습니다."));
        return;
    }

    var checkedRows = $NC.getGridSearchRows(G_GRDMASTER, {
        searchKey: "CHECK_YN",
        searchVal: $ND.C_YES
    });
    if (checkedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.011", "수정할 데이터를 선택하십시오."));
        return;
    }

    var REMARK1 = $NC.getValue("#edtRemark1");
    var rowData;

    G_GRDMASTER.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = checkedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(checkedRows[rIndex]);

            rowData.REMARK1 = REMARK1;

            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                rowData.CRUD = $ND.C_DV_CRUD_U;
            }
            G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
    } finally {
        G_GRDMASTER.data.endUpdate();
    }
}

/**
 * 화면표시그룹 수정
 */
function btnDisplayGrpOnClick(e) {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.010", "수정할 데이터가 없습니다."));
        return;
    }
    var checkedRows = $NC.getGridSearchRows(G_GRDMASTER, {
        searchKey: "CHECK_YN",
        searchVal: $ND.C_YES
    });
    if (checkedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.011", "수정할 데이터를 선택하십시오."));
        return;
    }

    var DISPLAY_GRP = $NC.getValue("#cboDisplay_Grp");
    var DISPLAY_GRP_F = $NC.getValueCombo("#cboDisplay_Grp", "F");
    var rowData;

    G_GRDMASTER.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = checkedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(checkedRows[rIndex]);

            rowData.DISPLAY_GRP = DISPLAY_GRP;
            rowData.DISPLAY_GRP_F = DISPLAY_GRP_F;

            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                rowData.CRUD = $ND.C_DV_CRUD_U;
            }
            G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
    } finally {
        G_GRDMASTER.data.endUpdate();
    }
}

/**
 * 컬럼너비 수정
 */
function btnColumnWidthOnClick(e) {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.010", "수정할 데이터가 없습니다."));
        return;
    }
    var checkedRows = $NC.getGridSearchRows(G_GRDMASTER, {
        searchKey: "CHECK_YN",
        searchVal: $ND.C_YES
    });
    if (checkedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC06020E0.011", "수정할 데이터를 선택하십시오."));
        return;
    }

    var COLUMN_WIDTH = $NC.getValue("#edtColumn_Width");
    var rowData;

    G_GRDMASTER.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = checkedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(checkedRows[rIndex]);

            rowData.COLUMN_WIDTH = COLUMN_WIDTH;

            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                rowData.CRUD = $ND.C_DV_CRUD_U;
            }
            G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
    } finally {
        G_GRDMASTER.data.endUpdate();
    }
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnableButton(permission.canSave && enable);
}