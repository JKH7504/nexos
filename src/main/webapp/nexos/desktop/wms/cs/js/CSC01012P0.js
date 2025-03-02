﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01012P0
 *  프로그램명         : 사용자프로그램권한등록 팝업
 *  프로그램설명       : 사용자프로그램권한등록 팝업 화면 Javascript
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
            container: "#ctrMasterView",
            grids: [
                "#grdMaster"
            ],
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnCancel").click(onCancel);
    $("#btnSave").click(_Save);
    $("#btnInitRole").click(_Delete);

    $NC.setEnable("#btnSave", $NC.G_VAR.G_PARAMETER.P_PERMISSION.canSave);
    $NC.setEnable("#btnInitRole", $NC.G_VAR.G_PARAMETER.P_PERMISSION.canDelete);

    // 그리드 초기화
    grdMasterInitialize();
    grdMasterInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtUser_Id", $NC.G_VAR.G_PARAMETER.P_USER_ID);
    $NC.setValue("#edtUser_Nm", $NC.G_VAR.G_PARAMETER.P_USER_NM);
    $NC.setValue("#edtRole_Group_Div_F", $NC.G_VAR.G_PARAMETER.P_ROLE_GROUP_DIV_F);

    _Inquiry();
}

/**
 * 화면 리사이즈 Offset 계산
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

    _Inquiry();
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

    var USER_ID = $NC.getValue("#edtUser_Id");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    G_GRDMASTER.queryParams = {
        P_USER_ID: USER_ID
    };
    $NC.serviceCall("/CSC01010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        alert($NC.getDisplayMsg("JS.CSC01012P0.002", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsTarget = G_GRDMASTER.data.getItems();
    var dsMaster = [ ];
    var rowData;
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
        alert($NC.getDisplayMsg("JS.CSC01012P0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC01010E0/saveUserProgram.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC01012P0.004", "프로그램 권한 초기화할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC01012P0.005", "프로그램 권한을 기본권한으로 초기화하시겠습니까?"))) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsMaster = [
        {
            P_USER_ID: $NC.G_VAR.G_PARAMETER.P_USER_ID,
            P_CRUD: $ND.C_DV_CRUD_D
        }
    ];

    $NC.serviceCall("/CSC01010E0/saveUserProgram.do", {
        P_DS_MASTER: dsMaster,
        P_REG_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

function grdMasterOnGetColumns() {

    var columns = [ ];
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
        id: "EXE_LEVEL1",
        field: "EXE_LEVEL1",
        name: "저장권한",
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
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "ROLE_EXE_LEVEL1",
        field: "ROLE_EXE_LEVEL1",
        name: "[기본]저장",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "ROLE_EXE_LEVEL2",
        field: "ROLE_EXE_LEVEL2",
        name: "[기본]삭제",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "ROLE_EXE_LEVEL3",
        field: "ROLE_EXE_LEVEL3",
        name: "[기본]확정",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "ROLE_EXE_LEVEL4",
        field: "ROLE_EXE_LEVEL4",
        name: "[기본]취소",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "ROLE_EXE_LEVEL5",
        field: "ROLE_EXE_LEVEL5",
        name: "[기본]승인",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "APPLICATION_DIV_F",
        field: "APPLICATION_DIV_F",
        name: "애플리케이션구분"
    });
    $NC.setGridColumn(columns, {
        id: "PROGRAM_DIV_F",
        field: "PROGRAM_DIV_F",
        name: "프로그램구분"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 2,
        editable: true,
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC01010E0.RS_SUB3",
        sortCol: "PROGRAM_ID",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
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

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "PROGRAM_ID");
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "PROGRAM_ID"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}