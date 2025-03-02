﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC07020E0
 *  프로그램명         : 사업부레포트관리
 *  프로그램설명       : 사업부레포트관리 화면 Javascript
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
        autoResizeView: function() {
            var resizeView = {
                container: "#divMasterView"
            };

            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = [
                    "#grdT1Master",
                    "#grdT1Detail"
                ];
            } else {
                resizeView.grids = [
                    "#grdT2Master"
                ];
            }
            return resizeView;
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    $("#btnQBu_Cd").click(showUserBuPopup);

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT2MasterInitialize();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {
    // 스플리터 초기화
    $NC.setInitSplitter("#divT1TabSheetView", "v", $NC.G_OFFSET.fixedLeftWidth, 400, 400);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.fixedLeftWidth = 550;
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
    // 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT2MASTER);

    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_NO;
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_NO;

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CSC07020E0.001", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    // 조회시 전역 변수 값 초기화
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        $NC.setInitGridVar(G_GRDT1MASTER);
        $NC.setInitGridData(G_GRDT1MASTER);
        $NC.setInitGridVar(G_GRDT1DETAIL);
        $NC.setInitGridData(G_GRDT1DETAIL);

        // 데이터 조회
        $NC.serviceCall("/CSC07020E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    } else {
        $NC.setInitGridVar(G_GRDT2MASTER);
        $NC.setInitGridData(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_BU_CD: BU_CD
        };
        // 데이터 조회
        $NC.serviceCall("/CSC07020E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }
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

    if ($NC.getTabActiveIndex("#divMasterView") != 0) {
        return;
    }

    if (G_GRDT1DETAIL.data.getLength() == 0 || $NC.isNull(G_GRDT1DETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC07020E0.002", "저장할 데이터가 없습니다."));
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CSC07020E0.001", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
        return;
    }

    var selectedCount = 0;
    var dsD = [ ];
    var dsC = [ ];
    var dsMaster, rowData, saveRowData;
    for (var rIndex = 0, rCount = G_GRDT1DETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1DETAIL.data.getItem(rIndex);
        // 선택되었을 경우, 기존 등록 데이터가 아니면 생성
        if (rowData.SELECT_YN == $ND.C_YES) {
            selectedCount++;
            if (rowData.ENTRY_YN == $ND.C_NO || rowData.CRUD == $ND.C_DV_CRUD_U) {
                saveRowData = {
                    P_BU_CD: BU_CD,
                    P_PROGRAM_ID: rowData.PROGRAM_ID,
                    P_PROGRAM_SUB_CD: rowData.PROGRAM_SUB_CD,
                    P_REPORT_CD: rowData.REPORT_CD,
                    P_REPORT_DOC_CD: rowData.REPORT_DOC_CD,
                    P_CRUD: rowData.ENTRY_YN == $ND.C_NO ? $ND.C_DV_CRUD_C : $ND.C_DV_CRUD_U
                };
                dsC.push(saveRowData);
            }
        } else {
            // 선택되지 않았을 경우, 기존 등록 데이터면 삭제
            if (rowData.ENTRY_YN == $ND.C_YES) {
                saveRowData = {
                    P_BU_CD: BU_CD,
                    P_PROGRAM_ID: rowData.PROGRAM_ID,
                    P_PROGRAM_SUB_CD: rowData.PROGRAM_SUB_CD,
                    P_REPORT_CD: rowData.REPORT_CD,
                    P_REPORT_DOC_CD: rowData.REPORT_DOC_CD,
                    P_CRUD: $ND.C_DV_CRUD_D
                };
                dsD.push(saveRowData);
            }
        }
    }

    if (selectedCount > 1) {
        alert($NC.getDisplayMsg("JS.CSC07020E0.004", "레포트 적용문서는 하나만 선택하여야 합니다."));
    }

    dsMaster = dsD.concat(dsC);
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC07020E0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC07020E0/save.do", {
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

    if ($NC.getTabActiveIndex("#divMasterView") != 0) {
        return;
    }

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "PROGRAM_ID",
            "PROGRAM_SUB_CD",
            "REPORT_CD"
        ],
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "REPORT_DOC_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
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

    var refRowData;
    switch (columnId) {
        case "SELECT_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            refRowData = grdObject.data.getItem(args.row);
            if (refRowData.SELECT_YN == $ND.C_YES) {
                // 레포트상세 그리드의 권장여부는 한 행만 "Y"이어야 한다.
                var rowData;
                for (var rIndex = 0, rCount = grdObject.data.getLength(); rIndex < rCount; rIndex++) {
                    rowData = grdObject.data.getItem(rIndex);
                    if (rowData.SELECT_YN == $ND.C_YES && rowData.id != refRowData.id) {
                        rowData.SELECT_YN = $ND.C_NO;

                        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
                        $NC.setGridApplyChange(grdObject, rowData);
                    }
                }
            }
            break;
        case "INTERNAL_QUERY_YN":
            refRowData = grdObject.data.getItem(args.row);
            if (refRowData.SELECT_YN == $ND.C_NO) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *        newTab: The tab that was just activated.<br>
 *        oldTab: The tab that was just deactivated.<br>
 *        newPanel: The panel that was just activated.<br>
 *        oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT1TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT1TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT1TabSheetView", "v", $NC.G_OFFSET.leftViewWidth, 400, 400);
        }

        // 공통 버튼 활성화 처리
        if ($NC.G_VAR.T1_INQUIRY_YN == $ND.C_YES) {
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._delete = "1";
        }
    } else {
        $NC.onGlobalResize();
    }
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function grdT1MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "APPLICATION_DIV_F",
        field: "APPLICATION_DIV_F",
        name: "애플리케이션구분"
    });
    $NC.setGridColumn(columns, {
        id: "MENU_NM",
        field: "MENU_NM",
        name: "메뉴명"
    });
    $NC.setGridColumn(columns, {
        id: "PROGRAM_ID",
        field: "PROGRAM_ID",
        name: "프로그램ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PROGRAM_NM",
        field: "PROGRAM_NM",
        name: "프로그램명"
    });
    $NC.setGridColumn(columns, {
        id: "PROGRAM_SUB_CD",
        field: "PROGRAM_SUB_CD",
        name: "프로그램하위코드"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_CD",
        field: "REPORT_CD",
        name: "레포트코드"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_NM",
        field: "REPORT_NM",
        name: "레포트명"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_TITLE_NM",
        field: "REPORT_TITLE_NM",
        name: "레포트타이틀"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_QUERY_ID",
        field: "REPORT_QUERY_ID",
        name: "레포트쿼리ID"
    });
    $NC.setGridColumn(columns, {
        id: "INTERNAL_QUERY_YN",
        field: "INTERNAL_QUERY_YN",
        name: "내부쿼리사용여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "CSC07020E0.RS_T1_MASTER",
        sortCol: "REPORT_CD",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    var BU_CD = $NC.getValue("#edtQBu_Cd");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);

    // 파라메터 세팅
    G_GRDT1DETAIL.queryParams = {
        P_REPORT_CD: rowData.REPORT_CD,
        P_PROGRAM_ID: rowData.PROGRAM_ID,
        P_PROGRAM_SUB_CD: rowData.PROGRAM_SUB_CD,
        P_BU_CD: BU_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CSC07020E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1DetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "REPORT_DOC_CD",
        field: "REPORT_DOC_CD",
        name: "레포트문서코드"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_DOC_NM",
        field: "REPORT_DOC_NM",
        name: "레포트문서명"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_DOC_URL",
        field: "REPORT_DOC_URL",
        name: "레포트문서URL"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_QUERY_ID",
        field: "REPORT_QUERY_ID",
        name: "레포트쿼리ID"
    });
    $NC.setGridColumn(columns, {
        id: "INTERNAL_QUERY_YN",
        field: "INTERNAL_QUERY_YN",
        name: "내부쿼리사용여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "RECOMMEND_YN",
        field: "RECOMMEND_YN",
        name: "권장여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "SELECT_YN",
        field: "SELECT_YN",
        name: "선택여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0,
        specialRow: {
            compareKey: "SELECT_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styApplyDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "CSC07020E0.RS_T1_DETAIL",
        sortCol: "REPORT_DOC_CD",
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onBeforeEditCell.subscribe(grdT1DetailOnBeforeEditCell);
    G_GRDT1DETAIL.view.onCellChange.subscribe(grdT1DetailOnCellChange);
}

/**
 * 레포트상세(오른쪽그리드)의 셀 값 변경전 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdT1DetailOnBeforeEditCell(e, args) {

    // var rowData = args.item;

    return true;
}

/**
 * 레포트상세(오른쪽그리드)의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 *        row: activeRow, cell: activeCell, item: item
 */
function grdT1DetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1DETAIL, rowData);
}

/**
 * 레포트상세(오른쪽그리드)의 입력체크 처리
 */
function grdT1DetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1DETAIL, row)) {
        return true;
    }

    return true;
}

function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function grdT2MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "APPLICATION_DIV_F",
        field: "APPLICATION_DIV_F",
        name: "애플리케이션구분"
    });
    $NC.setGridColumn(columns, {
        id: "PROGRAM_ID",
        field: "PROGRAM_ID",
        name: "프로그램ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PROGRAM_NM",
        field: "PROGRAM_NM",
        name: "프로그램명"
    });
    $NC.setGridColumn(columns, {
        id: "PROGRAM_SUB_CD",
        field: "PROGRAM_SUB_CD",
        name: "프로그램하위코드"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_CD",
        field: "REPORT_CD",
        name: "레포트코드"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_NM",
        field: "REPORT_NM",
        name: "레포트명"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_TITLE_NM",
        field: "REPORT_TITLE_NM",
        name: "레포트타이틀"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_TYPE_F",
        field: "REPORT_TYPE_F",
        name: "레포트타입"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_DIV_F",
        field: "REPORT_DIV_F",
        name: "레포트구분"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_DOC_CD",
        field: "REPORT_DOC_CD",
        name: "레포트문서코드"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_DOC_NM",
        field: "REPORT_DOC_NM",
        name: "레포트문서명"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_DOC_URL",
        field: "REPORT_DOC_URL",
        name: "레포트문서URL"
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_QUERY_ID",
        field: "REPORT_QUERY_ID",
        name: "레포트쿼리ID"
    });
    $NC.setGridColumn(columns, {
        id: "INTERNAL_QUERY_YN",
        field: "INTERNAL_QUERY_YN",
        name: "내부쿼리사용여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "RECOMMEND_YN",
        field: "RECOMMEND_YN",
        name: "권장여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "LAST_USER_ID",
        field: "LAST_USER_ID",
        name: "최종수정자ID"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "CSC07020E0.RS_T2_MASTER",
        sortCol: "REPORT_DOC_CD",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}
/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, [
        "PROGRAM_ID",
        "PROGRAM_SUB_CD",
        "REPORT_CD"
    ], true)) {
        $NC.setInitGridVar(G_GRDT1DETAIL);
        onGetT1Detail({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_YES;
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL, "REPORT_DOC_CD");
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER, [
        "PROGRAM_ID",
        "PROGRAM_SUB_CD",
        "REPORT_CD"
    ]);
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_YES;
}

function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "PROGRAM_ID",
            "PROGRAM_SUB_CD",
            "REPORT_CD"
        ]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "REPORT_DOC_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
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