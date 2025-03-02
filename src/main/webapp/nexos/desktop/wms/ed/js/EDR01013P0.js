﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDR01013P0
 *  프로그램명         : 인터페이스수신플래그등록 팝업
 *  프로그램설명       : 인터페이스수신플래그등록 팝업 화면 Javascript
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
                "#grdMaster"
            ]
        },
        // 마스터 데이터
        masterData: null
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
    $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
    $("#btnEntrySave").click(_Save); // 저장 버튼

    // 신규/삭제/저장 버튼 툴팁 세팅
    $NC.setTooltip("#btnEntryNew", $NC.getDisplayMsg("JS.EDR01013P0.007", "신규"));
    $NC.setTooltip("#btnEntryDelete", $NC.getDisplayMsg("JS.EDR01013P0.008", "삭제"));
    $NC.setTooltip("#btnEntrySave", $NC.getDisplayMsg("JS.EDR01013P0.009", "저장"));
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
                LINK_COLUMN_NM: rowData.LINK_COLUMN_NM,
                LINK_COLUMN_ID: rowData.LINK_COLUMN_ID,
                LINK_DATA_TYPE: rowData.LINK_DATA_TYPE,
                LINK_DATA_TYPE_F: rowData.LINK_DATA_TYPE_F,
                COLUMN_VAL1: rowData.COLUMN_VAL1,
                COLUMN_VAL2: rowData.COLUMN_VAL2,
                COLUMN_VAL3: rowData.COLUMN_VAL3,
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

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        EDI_DIV: $NC.G_VAR.G_PARAMETER.P_EDI_DIV,
        DEFINE_NO: $NC.G_VAR.G_PARAMETER.P_DEFINE_NO,
        LINK_COLUMN_ID: "",
        LINK_COLUMN_NM: "",
        LINK_DATA_TYPE: "",
        COLUMN_VAL1: "",
        COLUMN_VAL2: "",
        COLUMN_VAL3: "",
        REMARK1: "",
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

/**
 * 저장
 */
function _Save() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsD = [ ];
    var dsCU = [ ];
    var dsMaster, rowData;
    var dsTarget = G_GRDMASTER.data.getItems();
    for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsMaster = dsD;
        } else {
            dsMaster = dsCU;
        }
        dsMaster.push({
            P_BU_CD: rowData.BU_CD,
            P_EDI_DIV: rowData.EDI_DIV,
            P_DEFINE_NO: rowData.DEFINE_NO,
            P_LINK_COLUMN_ID: rowData.LINK_COLUMN_ID,
            P_LINK_COLUMN_NM: rowData.LINK_COLUMN_NM,
            P_LINK_DATA_TYPE: rowData.LINK_DATA_TYPE,
            P_COLUMN_VAL1: rowData.COLUMN_VAL1,
            P_COLUMN_VAL2: rowData.COLUMN_VAL2,
            P_COLUMN_VAL3: rowData.COLUMN_VAL3,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }
    dsMaster = dsD.concat(dsCU);

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.EDR01013P0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/EDR01010E0/saveIdentifier.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.EDR01013P0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터 삭제, 그외 CRUD를 "D"로 변경
    $NC.deleteGridRowData(G_GRDMASTER, rowData, true);
}

function grdMasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "LINK_COLUMN_ID",
        field: "LINK_COLUMN_ID",
        name: "ID",
        cssClass: "styCenter",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "LINK_COLUMN_NM",
        field: "LINK_COLUMN_NM",
        name: "컬럼명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "LINK_DATA_TYPE_F",
        field: "LINK_DATA_TYPE_F",
        name: "컬럼타입",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "LINK_DATA_TYPE",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "LINK_DATA_TYPE",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_VAL1",
        field: "COLUMN_VAL1",
        name: "초기값",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_VAL2",
        field: "COLUMN_VAL2",
        name: "1차수신결과값",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_VAL3",
        field: "COLUMN_VAL3",
        name: "최종수신결과값",
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

/**
 * 그리드 초기값 설정
 */
function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "EDR01010E0.RS_SUB3",
        sortCol: "LINK_COLUMN_ID",
        gridOptions: options,
        onFilter: grdMasterOnFilter
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

/**
 * grdMaster 데이터 필터링 이벤트
 */
function grdMasterOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, "LINK_COLUMN_ID", true);
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

/**
 * 그리드의 편집 셀의 값 변경 가능 여부
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    var isNew = rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD == $ND.C_DV_CRUD_C;
    switch (args.column.id) {
        case "LINK_COLUMN_NM":
            return isNew;
    }
    return true;
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "LINK_COLUMN_NM")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    // 일반항목 체크
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.LINK_COLUMN_ID)) {
            alert($NC.getDisplayMsg("JS.EDR01013P0.004", "컬럼ID를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "LINK_COLUMN_ID", true);
            return false;
        }
        if ($NC.isNull(rowData.LINK_COLUMN_NM)) {
            alert($NC.getDisplayMsg("JS.EDR01013P0.005", "컬럼명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "LINK_COLUMN_NM", true);
            return false;
        }
        if ($NC.isNull(rowData.LINK_DATA_TYPE)) {
            alert($NC.getDisplayMsg("JS.EDR01013P0.006", "컬럼타입을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "LINK_DATA_TYPE_F", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
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
