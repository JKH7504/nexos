/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04010E0
 *  프로그램명         : 상품그룹관리
 *  프로그램설명       : 상품그룹관리 화면 Javascript
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
        autoResizeSplitView: {
            splitViews: [
                {
                    container: "#divMasterView",
                    grids: "#grdMaster"
                },
                {
                    container: "#divDetailView",
                    grids: "#grdDetail"
                },
                {
                    container: "#divSubView",
                    grids: "#grdSub"
                }
            ],
            viewType: "h"
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);

    // 이벤트 연결
    $("#btnQCust_Cd").click(showCustPopup);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();
}

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

    // 조회조건 체크
    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var CUST_NM = $NC.getValue("#edtQCust_Nm");
    if ($NC.isNull(CUST_NM)) {
        alert($NC.getDisplayMsg("JS.CMC04010E0.001", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CUST_CD: CUST_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var refRowData, newRowData;
    // grdMaster에 포커스가 있을 경우
    if (G_GRDMASTER.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            CUST_CD: $NC.getValue("#edtQCust_Cd"),
            DEPART_CD: null,
            LINE_CD: $ND.C_BASE_LINE_CD,
            CLASS_CD: $ND.C_BASE_CLASS_CD,
            GROUP_NM: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDMASTER, newRowData);
    }
    // grdDetail에 포커스가 있을 경우
    else if (G_GRDDETAIL.focused) {
        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.002", "상품그룹 대분류가 없습니다.\n\n상품그룹 대분류를 먼저 등록하십시오."));
            return;
        }

        refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.003", "신규 상품그룹 대분류입니다.\n\n저장 후 상품그룹 중분류를 등록하십시요."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            CUST_CD: refRowData.CUST_CD,
            DEPART_CD: refRowData.DEPART_CD,
            LINE_CD: null,
            CLASS_CD: $ND.C_BASE_CLASS_CD,
            GROUP_NM: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDDETAIL, newRowData);
    }
    // grdSub에 포커스가 있을 경우
    else {
        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.002", "상품그룹 대분류가 없습니다.\n\n상품그룹 대분류를 먼저 등록하십시오."));
            return;
        }

        refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.003", "신규 상품그룹 대분류입니다.\n\n저장 후 상품그룹 중분류를 등록하십시요."));
            return;
        }

        if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.004", "상품그룹 중분류가 없습니다.\n\n상품그룹 중분류를 먼저 등록하십시오."));
            return;
        }

        refRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.005", "신규 상품그룹 중분류입니다.\n\n저장 후 상품그룹 소분류를 등록하십시요."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDSUB)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            CUST_CD: refRowData.CUST_CD,
            DEPART_CD: refRowData.DEPART_CD,
            LINE_CD: refRowData.LINE_CD,
            CLASS_CD: null,
            GROUP_NM: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDSUB, newRowData);
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04010E0.006", "저장할 데이터가 없습니다."));
        return;
    }

    // 대분류
    if (G_GRDMASTER.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }
    }
    // 중분류
    else if (G_GRDDETAIL.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }
    }
    // 소분류
    else {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDSUB)) {
            return;
        }
    }

    var dsMaster = [];
    var dsDetail = [];
    var dsSub = [];

    var rowData, rIndex, rCount;
    // 상품그룹 대분류 수정 데이터
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CUST_CD: rowData.CUST_CD,
            P_DEPART_CD: rowData.DEPART_CD,
            P_LINE_CD: rowData.LINE_CD,
            P_CLASS_CD: rowData.CLASS_CD,
            P_GROUP_NM: rowData.GROUP_NM,
            P_CRUD: rowData.CRUD
        });
    }

    // 상품그룹 중분류 수정 데이터
    for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_CUST_CD: rowData.CUST_CD,
            P_DEPART_CD: rowData.DEPART_CD,
            P_LINE_CD: rowData.LINE_CD,
            P_CLASS_CD: rowData.CLASS_CD,
            P_GROUP_NM: rowData.GROUP_NM,
            P_CRUD: rowData.CRUD
        });
    }

    // 상품그룹 소분류 수정 데이터
    for (rIndex = 0, rCount = G_GRDSUB.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDSUB.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsSub.push({
            P_CUST_CD: rowData.CUST_CD,
            P_DEPART_CD: rowData.DEPART_CD,
            P_LINE_CD: rowData.LINE_CD,
            P_CLASS_CD: rowData.CLASS_CD,
            P_GROUP_NM: rowData.GROUP_NM,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0 && dsDetail.length == 0 && dsSub.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04010E0.007", "데이터를 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC04010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_DS_SUB: dsSub,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var rowData;
    // 대분류
    if (G_GRDMASTER.focused) {

        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.008", "삭제할 데이터가 없습니다."));
            return;
        }

        if (G_GRDDETAIL.data.getLength() == 0) {
            if (!confirm($NC.getDisplayMsg("JS.CMC04010E0.009", "상품그룹 대분류를 삭제 하시겠습니까?"))) {
                return;
            }
        } else {
            if (!confirm($NC.getDisplayMsg("JS.CMC04010E0.010", "하위 데이터가 있습니다.\n\n상품그룹 대분류를 삭제 하시겠습니까?"))) {
                return;
            }
        }

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDMASTER, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDMASTER.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
    // 중분류
    else if (G_GRDDETAIL.focused) {

        if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.008", "삭제할 데이터가 없습니다."));
            return;
        }

        if (G_GRDSUB.data.getLength() == 0) {
            if (!confirm($NC.getDisplayMsg("JS.CMC04010E0.011", "상품그룹 중분류를 삭제 하시겠습니까?"))) {
                return;
            }
        } else {
            if (!confirm($NC.getDisplayMsg("JS.CMC04010E0.012", "하위 데이터가 있습니다.\n\n상품그룹 중분류를 삭제 하시겠습니까?"))) {
                return;
            }
        }

        rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDDETAIL, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
    // 소분류
    else {

        if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.008", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC04010E0.013", "상품그룹 소분류를 삭제 하시겠습니까?"))) {
            return;
        }

        rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDSUB, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDSUB.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "DEPART_CD",
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "LINE_CD",
        isCancel: true
    });
    var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDSUB, {
        selectKey: "CLASS_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
    G_GRDSUB.lastKeyVal = lastKeyVal3;
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

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDSUB);
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CUST_CD":
            $NP.onUserCustChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onCustPopup);
            return;
    }

    onChangingCondition();
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DEPART_CD",
        field: "DEPART_CD",
        name: "상품대분류코드",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "GROUP_NM",
        field: "GROUP_NM",
        name: "대분류명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC04010E0.RS_MASTER",
        sortCol: "DEPART_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onFocus.subscribe(grdMasterOnFocus);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);

    // 최초 조회시 포커스 처리
    G_GRDMASTER.focused = true;
}

function grdMasterOnFocus(e, args) {

    if (G_GRDMASTER.focused) {
        return;
    }

    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = false;

    // 중분류 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 소분류 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }
}

function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, 0, true);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "DEPART_CD":
                return false;
        }
    }
    return true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "DEPART_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.DEPART_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.014", "대분류코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "DEPART_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.GROUP_NM)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.015", "대분류명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "GROUP_NM", true);
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

    // 조회시 중분류 변수 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
        data: null
    });

    if (rowData.CRUD != $ND.C_DV_CRUD_C && rowData.CRUD != $ND.C_DV_CRUD_N) {
        // 중분류 파라메터 세팅
        G_GRDDETAIL.queryParams = {
            P_CUST_CD: rowData.CUST_CD,
            P_DEPART_CD: rowData.DEPART_CD
        };
        // 중분류 조회
        $NC.serviceCall("/CMC04010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_CD",
        field: "LINE_CD",
        name: "중분류코드",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "GROUP_NM",
        field: "GROUP_NM",
        name: "중분류명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CMC04010E0.RS_DETAIL",
        sortCol: "LINE_CD",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onFocus.subscribe(grdDetailOnFocus);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnFocus(e, args) {

    if (G_GRDDETAIL.focused) {
        return;
    }

    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
    G_GRDSUB.focused = false;

    // 대분류 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 소분류 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }
}

function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, 0, true);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "LINE_CD":
                return false;
        }
    }
    return true;
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "LINE_CD")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.LINE_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.016", "중분류코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "LINE_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.GROUP_NM)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.017", "중분류명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "GROUP_NM", true);
            return false;
        }
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
    var rowData = G_GRDDETAIL.data.getItem(row);

    // 조회시 중분류 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
        data: null
    });

    if (rowData.CRUD != $ND.C_DV_CRUD_C && rowData.CRUD != $ND.C_DV_CRUD_N) {
        // 소분류 파라메터 세팅
        G_GRDSUB.queryParams = {
            P_CUST_CD: rowData.CUST_CD,
            P_DEPART_CD: rowData.DEPART_CD,
            P_LINE_CD: rowData.LINE_CD
        };
        // 소분류 조회
        $NC.serviceCall("/CMC04010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CLASS_CD",
        field: "CLASS_CD",
        name: "상품소분류코드",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "GROUP_NM",
        field: "GROUP_NM",
        name: "소분류명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "CMC04010E0.RS_SUB",
        sortCol: "CLASS_CD",
        gridOptions: options
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
    G_GRDSUB.view.onFocus.subscribe(grdSubOnFocus);
    G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

function grdSubOnFocus(e, args) {

    if (G_GRDSUB.focused) {
        return;
    }

    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = true;

    // 대분류 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 중분류 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }
}

function grdSubOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDSUB, args.row, 0, true);
}

function grdSubOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "CLASS_CD":
                return false;
        }
    }
    return true;
}

function grdSubOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);
}

function grdSubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUB, row, "CLASS_CD")) {
        return true;
    }

    var rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CLASS_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.018", "소분류코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUB, row, "CLASS_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.GROUP_NM)) {
            alert($NC.getDisplayMsg("JS.CMC04010E0.019", "소분류명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUB, row, "GROUP_NM", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUB, rowData);
    return true;
}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "DEPART_CD", G_GRDMASTER.focused)) {
        // 중분류 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDDETAIL, "LINE_CD", G_GRDDETAIL.focused)) {
        // 소분류 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDSUB);
        onGetSub({
            data: null
        });
    }
}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB, "CLASS_CD", G_GRDSUB.focused);
}

function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "DEPART_CD"
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "LINE_CD"
    });
    var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDSUB, {
        selectKey: "CLASS_CD"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
    G_GRDSUB.lastKeyVal = lastKeyVal3;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var grdObject;
    if (G_GRDMASTER.focused) {
        grdObject = G_GRDMASTER;
    } else if (G_GRDDETAIL.focused) {
        grdObject = G_GRDDETAIL;
    } else {
        grdObject = G_GRDSUB;
    }

    var rowData = grdObject.data.getItem(grdObject.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(grdObject, rowData, true);
    }
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */

function showCustPopup() {

    $NP.showUserCustPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onCustPopup, function() {
        $NC.setFocus("#edtQCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onCustPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtQCust_Nm", resultInfo.CUST_NM);
    } else {
        $NC.setValue("#edtQCust_Cd");
        $NC.setValue("#edtQCust_Nm");
        $NC.setFocus("#edtQCust_Cd", true);
    }
    onChangingCondition();
}
