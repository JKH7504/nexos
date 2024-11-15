/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01030E0
 *  프로그램명         : 메뉴그룹관리
 *  프로그램설명       : 메뉴그룹관리 화면 Javascript
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
        case "DEFAULT_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);

            var refRowData = grdObject.data.getItem(args.row);
            if (refRowData.DEFAULT_YN == $ND.C_YES) {
                // 사용여부가 변경될 경우 기록
                grdObject.globalVar.useParams = {
                    P_MENU_GRP: refRowData.MENU_GRP
                };
                // 사용여부는 하나만 선택 가능
                var rowData;
                for (var rIndex = 0, rCount = grdObject.data.getLength(); rIndex < rCount; rIndex++) {
                    rowData = grdObject.data.getItem(rIndex);
                    if (rowData.DEFAULT_YN == $ND.C_YES && rowData.id != refRowData.id) {
                        rowData.DEFAULT_YN = $ND.C_NO;
                        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                            rowData.CRUD = $ND.C_DV_CRUD_U;
                        }
                        grdObject.data.updateItem(rowData.id, rowData);
                    }
                }
            }
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 데이터 조회
    $NC.serviceCall("/CSC01030E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        MENU_GRP: null,
        MENU_GRP_NM: null,
        DEFAULT_YN: $ND.C_NO,
        DEAL_DIV: "1",
        DEAL_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
            columnId: "DEAL_DIV_F",
            searchVal: "1",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        }),
        REMARK1: null,
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
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsMaster = [];
    var rowData;
    var defaultCount = 0;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.DEFAULT_YN == $ND.C_YES) {
            defaultCount++;
        }
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_MENU_GRP: rowData.MENU_GRP,
            P_MENU_GRP_NM: rowData.MENU_GRP_NM,
            P_DEFAULT_YN: rowData.DEFAULT_YN,
            P_DEAL_DIV: rowData.DEAL_DIV || "1",
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01030E0.001", "데이터 수정 후 저장하십시오."));
        return;
    }
    if (defaultCount == 0) {
        alert($NC.getDisplayMsg("JS.CSC01030E0.002", "기본메뉴여부가 지정되지 않았습니다.\n시스템에 사용할 기본 메뉴그룹를 선택하십시오."));
        return;
    } else if (defaultCount > 1) {
        alert($NC.getDisplayMsg("JS.CSC01030E0.003", "기본메뉴는 하나만 지정되어야 합니다."));
        return;
    }

    $NC.serviceCall("/CSC01030E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USE_PARAMS: G_GRDMASTER.useParams,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01030E0.004", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC01030E0.005", "메뉴그룹을 삭제 하시겠습니까?\n삭제시 해당 메뉴그룹으로 등록된 하위메뉴 전체가 삭제됩니다."))) {
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
            "MENU_GRP"
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "MENU_GRP",
        field: "MENU_GRP",
        name: "메뉴그룹",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "MENU_GRP_NM",
        field: "MENU_GRP_NM",
        name: "메뉴그룹명",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "DEFAULT_YN",
        field: "DEFAULT_YN",
        name: "기본메뉴여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
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
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "LAST_USER_ID",
        field: "LAST_USER_ID",
        name: "최종수정자ID"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정자일시",
        cssClass: "styCenter"
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
        queryId: "CSC01030E0.RS_MASTER",
        sortCol: "MENU_GRP",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
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
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "DEAL_DIV_F":
            if (rowData.DEFAULT_YN == $ND.C_YES && rowData.DEAL_DIV != "1") {
                alert($NC.getDisplayMsg("JS.CSC01030E0.006", "기본메뉴를 거래진행이 아닌 다른 값으로 변경할 수 없습니다."));

                rowData.DEAL_DIV = "1";
                rowData.DEAL_DIV_F = $NC.getGridComboName(G_GRDMASTER, {
                    columnId: "DEAL_DIV_F",
                    searchVal: rowData.DEAL_DIV,
                    dataCodeField: "COMMON_CD",
                    dataFullNameField: "COMMON_CD_F"
                });

                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, false, 200); // 다음 컬럼으로 이동되는 이벤트로 인해 지정 시간 후 처리
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = G_GRDMASTER.data.getItem(args.row);
    if (rowData) {
        // 신규 데이터가 아니면 코드 수정 불가
        if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
            if (args.column.id == "MENU_GRP") {
                return false;
            }
        }
    }
    return true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "MENU_GRP")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.MENU_GRP)) {
            alert($NC.getDisplayMsg("JS.CSC01030E0.007", "메뉴그룹 코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "MENU_GRP", true);
            return false;
        }

        if ($NC.isNull(rowData.MENU_GRP_NM)) {
            alert($NC.getDisplayMsg("JS.CSC01030E0.008", "메뉴그룹명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "MENU_GRP_NM", true);
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

    $NC.setFocusGrid(G_GRDMASTER, args.row, "MENU_GRP", true);
}

function onGetMaster(ajaxData) {

    G_GRDMASTER.useParams = {};
    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "MENU_GRP"
    ], true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";

    $NC.setInitTopButtons($NC.G_VAR.buttons);

}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "MENU_GRP"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}