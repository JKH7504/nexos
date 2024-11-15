/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC06010E0
 *  프로그램명         : 안전재고관리
 *  프로그램설명       : 안전재고관리 화면 Javascript
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

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showUserBrandPopup);

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 물류센터 초기화
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSUSERCENTER",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CENTER_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQCenter_Cd",
        codeField: "CENTER_CD",
        nameField: "CENTER_NM",
        onComplete: function() {
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });
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
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input, Select Change Event 처리
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
        case "BRAND_CD":
            $NP.onUserBrandChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BRAND_CD: val
            }, onUserBrandPopup);
            return;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC06010E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CMC06010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        BU_CD: $NC.getValue("#edtQBu_Cd"),
        BRAND_CD: null,
        ITEM_CD: null,
        SAFETY_QTY: 0,
        QC_YN: $ND.C_NO,
        REMARK1: null,
        BU_NM: $NC.getValue("#edtQBu_Nm"),
        BRAND_NM: null,
        ITEM_NM: null,
        ITEM_SPEC: null,
        QTY_IN_BOX: null,
        SAFETY_BOX: 0,
        SAFETY_EA: null,
        DAY_CNT: 0,
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
        alert($NC.getDisplayMsg("JS.CMC06010E0.002", "저장할 데이터가 없습니다."));
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
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_SAFETY_QTY: rowData.SAFETY_QTY,
            P_DAY_CNT: rowData.DAY_CNT,
            P_QC_YN: rowData.QC_YN,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC06010E0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC06010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC06010E0.004", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC06010E0.005", "삭제 하시겠습니까?"))) {
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
            "BU_CD",
            "BRAND_CD",
            "ITEM_CD"
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
        case "QC_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "상품규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SAFETY_QTY",
        field: "SAFETY_QTY",
        name: "안전재고수량",
        editor: Slick.Editors.Number,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SAFETY_BOX",
        field: "SAFETY_BOX",
        name: "안전재고BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SAFETY_EA",
        field: "SAFETY_EA",
        name: "안전재고EA",
        cssClass: "styRight"
    });
    // $NC.setGridColumn(columns, {
    // id: "DAY_CNT",
    // field: "DAY_CNT",
    // name: "기준일수",
    // minWidth: 90,
    // editor: Slick.Editors.Number,
    // cssClass: "styRight"
    // });
    $NC.setGridColumn(columns, {
        id: "QC_YN",
        field: "QC_YN",
        name: "품질검사여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
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
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC06010E0.RS_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, args.rowData.BU_CD == "" ? "BU_CD" : "ITEM_CD", true);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    var isNew = rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD == $ND.C_DV_CRUD_C;
    // 신규 데이터일 때만 수정 가능한 컬럼
    switch (args.column.id) {
        case "BU_CD":
            return isNew;
        case "ITEM_CD":
            return isNew && $NC.isNotNull(rowData.BU_CD);
    }
    return true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "BU_CD":
            $NP.onUserBuChange(rowData.BU_CD, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: rowData.BU_CD,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, grdMasterOnUserBuPopup);
            return;
        case "ITEM_CD":
            $NP.onItemChange(rowData.ITEM_CD, {
                P_BU_CD: rowData.BU_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdMasterOnItemPopup);
            return;
        case "SAFETY_QTY":
            rowData = grdMasterOnCalc(rowData);
            if (isNaN(rowData.SAFETY_QTY) || Number(rowData.SAFETY_QTY) < 0) {
                alert($NC.getDisplayMsg("JS.CMC06010E0.006", "안전재고수량을 정확히 입력하십시오."));
                rowData.SAFETY_QTY = "";
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
            }
            break;
        // case "DAY_CNT":
        // rowData = grdMasterOnCalc(rowData);
        // if (isNaN(rowData.DAY_CNT) || (Number(rowData.DAY_CNT) < 0)) {
        // alert($NC.getDisplayMsg("JS.CMC06010E0.005", "기준일수를 정확히 입력하십시오."));
        // rowData.DAY_CNT = "0";
        // $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
        // }
        // break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.BU_CD)) {
            alert($NC.getDisplayMsg("JS.CMC06010E0.007", "사업부코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "BU_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC06010E0.008", "상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.SAFETY_QTY)) {
            alert($NC.getDisplayMsg("JS.CMC06010E0.009", "안전재고수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "BU_CD", true);
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

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "BU_CD":
            $NP.showUserBuPopup({
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: rowData.BU_CD,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, grdMasterOnUserBuPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            return;
        case "ITEM_CD":
            $NP.showItemPopup({
                P_BU_CD: rowData.BU_CD,
                P_ITEM_CD: $ND.C_ALL,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdMasterOnItemPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            return;
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "BU_CD",
        "BRAND_CD",
        "ITEM_CD"
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

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "BU_CD",
            "BRAND_CD",
            "ITEM_CD"
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

/**
 * 검색조건의 사업부 검색 팝업 클릭
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
 * 사업부 검색 결과
 * 
 * @param resultInfo
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

    // 브랜드 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

function grdMasterOnUserBuPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.BU_CD = resultInfo.BU_CD;
        rowData.BU_NM = resultInfo.BU_NM;
        rowData.BRAND_CD = "";
        rowData.BRAND_NM = "";
        rowData.ITEM_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";
        rowData.QTY_IN_BOX = 1;

        focusCol = G_GRDMASTER.view.getColumnIndex("ITEM_CD");
    } else {
        rowData.BU_CD = "";
        rowData.BU_NM = "";
        rowData.BRAND_CD = "";
        rowData.BRAND_NM = "";
        rowData.ITEM_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";
        rowData.QTY_IN_BOX = 1;

        focusCol = G_GRDMASTER.view.getColumnIndex("ITEM_CD");
    }

    rowData = grdMasterOnCalc(rowData);
    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showUserBrandPopup() {

    $NP.showUserBrandPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BRAND_CD: $ND.C_ALL
    }, onUserBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onUserBrandPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
    } else {
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setFocus("#edtQBrand_Cd", true);
    }
    onChangingCondition();
}

function grdMasterOnCalc(rowData, SAFETY_QTY) {

    if ($NC.isNotNull(SAFETY_QTY)) {
        rowData.SAFETY_QTY = Number(SAFETY_QTY);
    }
    rowData.SAFETY_BOX = $NC.getBBox(rowData.SAFETY_QTY, rowData.QTY_IN_BOX);
    rowData.SAFETY_EA = $NC.getBEa(rowData.SAFETY_QTY, rowData.QTY_IN_BOX);
    return rowData;
}

function grdMasterOnItemPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.BRAND_CD = resultInfo.BRAND_CD;
        rowData.BRAND_NM = resultInfo.BRAND_NM;
        rowData.ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
        rowData.ITEM_BAR_CD = resultInfo.ITEM_BAR_CD;
        rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;

        focusCol = G_GRDMASTER.view.getColumnIndex("SAFETY_QTY");
    } else {
        rowData.BRAND_CD = "";
        rowData.BRAND_NM = "";
        rowData.ITEM_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";
        rowData.ITEM_BAR_CD = "";
        rowData.QTY_IN_BOX = 1;

        focusCol = G_GRDMASTER.view.getColumnIndex("ITEM_CD");
    }

    rowData = grdMasterOnCalc(rowData);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}
