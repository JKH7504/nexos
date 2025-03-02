﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01040E0
 *  프로그램명         : 메뉴관리
 *  프로그램설명       : 메뉴관리 화면 Javascript
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divRightView",
                grids: "#grdDetail",
                exceptGridHeight: $NC.getViewHeight("#divMasterInfoView") + $NC.G_LAYOUT.header
            },
            viewType: "h",
            viewFixed: {
                container: "#divRightView",
                size: 700
            }
        }
    });

    // 초기화 및 초기값 세팅
    // 미사용기능 숨김 처리
    // 초기 숨김 처리
    // 초기 비활성화 처리
    $NC.setEnableGroup("#divMasterInfoView", false);
    $NC.setEnableGroup("#ctrAdditionalB_grdDetail", false);
    $NC.setVisible("#btnEntryUser", false);

    // 이벤트 연결
    $("#btnEntryUser").click(btnEntryUserOnClick);
    $("#btnSetMenuLevel").click(btnSetMenuLevelOnClick);
    $("#btnAddMenu").click(btnAddMenuOnClick);
    $("#btnMoveUpMenu").click(btnMoveUpMenuOnClick);
    $("#btnMoveDownMenu").click(btnMoveDownMenuOnClick);
    $("#btnCopy").click(btnCopyOnClick);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_CSC01040E0_RS_REF1",
                P_QUERY_ID: "CSC01040E0.RS_REF1",
                P_QUERY_PARAMS: null
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_APPLICATION_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "APPLICATION_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 메뉴그룹 세팅
        $NC.setInitComboData({
            selector: "#cboQMenu_Grp",
            codeField: "MENU_GRP",
            nameField: "MENU_GRP_NM",
            fullNameField: "MENU_GRP_F",
            data: $NC.toArray(multipleData.O_CSC01040E0_RS_REF1),
            onComplete: function(dsResult) {
                var searchIndex = $NC.getSearchArray(dsResult, {
                    searchKey: "DEFAULT_YN",
                    searchVal: $ND.C_YES
                });
                $NC.setValue("#cboQMenu_Grp", searchIndex);
            }
        });

        // 애플리케이션구분 세팅
        var dsApplicationDiv = $NC.toArray(multipleData.O_WC_POP_CMCODE_APPLICATION_DIV);
        $NC.setInitComboData({
            selector: "#cboApplication_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: dsApplicationDiv,
            onComplete: function() {
                $NC.setValue("#cboApplication_Div");
            }
        });
        $NC.setInitComboData({
            selector: "#cboQApplication_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: dsApplicationDiv,
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQApplication_Div", $ND.C_ALL);
            }
        });
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
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
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;
    // 저장
    $NC.setEnableButton(permission.canSave && enable);
}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "MENU_GRP":
            break;
    }

    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    $NC.setEnableGroup("#divMasterInfoView", false);
    $NC.setEnableGroup("#ctrAdditionalB_grdDetail", false);
    $NC.setValue("#edtQProgram_Id");
    $NC.setValue("#cboQApplication_Div", $ND.C_ALL);
    $NC.setValueRadioGroup("rgbQEntry_Div", 0);
    grdDetailOnSetFilter();
    setUserProgramPermission();
    setInputValue("#grdMaster");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id;
    if (view.parents("#divMasterInfoView").length > 0) {
        id = view.prop("id").substr(3).toUpperCase();
        grdMasterOnCellChange(e, {
            view: view,
            col: id,
            val: val
        });
    } else if (view.parents("#ctrAdditionalB_grdDetail").length > 0) {
        grdDetailOnSetFilter();
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var MENU_GRP = $NC.getValue("#cboQMenu_Grp");
    if ($NC.isNull(MENU_GRP)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.001", "메뉴그룹을 선택하십시오."));
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_MENU_GRP: MENU_GRP
    };
    // 데이터 조회
    $NC.serviceCall("/CSC01040E0/getMenu.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    // 파라메터 세팅
    G_GRDDETAIL.queryParams = {
        P_MENU_GRP: MENU_GRP
    };
    // 데이터 조회
    $NC.serviceCall("/CSC01040E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.002", "조회 후 등록하십시오."));
        return;
    }
    // 현재 선택된 로우 Validation 체크
    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(refRowData)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.003", "신규 등록할 메뉴의 상위 메뉴를 선택하십시오."));
        return;
    }

    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 현재 선택된 프로그램이 메뉴인지 체크
    if (refRowData.MENU_DIV != "M") {
        alert($NC.getDisplayMsg("JS.CSC01040E0.003", "신규 등록할 메뉴의 상위 메뉴를 선택하십시오."));
        return;
    }

    if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.004", "신규 등록한 메뉴입니다. 메뉴 저장 후 처리하십시오."));
        return;
    }

    if (refRowData.APPLICATION_DIV != "1") {
        alert($NC.getDisplayMsg("JS.CSC01040E0.005", "[프로그램 메뉴]만 하위 그룹메뉴를 추가할 수 있습니다."));
        return;
    }

    // 메뉴가 닫혀 있으면 펼침
    if (refRowData._collapsed) {
        refRowData._collapsed = false;
        G_GRDMASTER.data.updateItem(refRowData.id, refRowData);
    }

    // 다음 메뉴 검색
    var PARENT_MENU_INDENT = parseInt(refRowData.MENU_INDENT);
    var MENU_INDENT = PARENT_MENU_INDENT + 1 + "";
    var MENU_LEVEL1 = 0;
    var MENU_LEVEL2 = 0;
    var MENU_LEVEL3 = 0;
    var MENU_LEVEL4 = 0;

    var rowData, nextRowData, groupLastRowData;
    for (var rIndex = G_GRDMASTER.lastRow + 1, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.MENU_INDENT == MENU_INDENT) {
            groupLastRowData = rowData;
        }
        if (rowData.MENU_INDENT <= refRowData.MENU_INDENT) {
            nextRowData = rowData;
            break;
        }
    }

    if ($NC.isNull(groupLastRowData)) {
        switch (PARENT_MENU_INDENT) {
            case 0:
                MENU_LEVEL1 = 1;
                break;
            case 1:
                MENU_LEVEL1 = refRowData.MENU_LEVEL1;
                MENU_LEVEL2 = 1;
                break;
            case 2:
                MENU_LEVEL1 = refRowData.MENU_LEVEL1;
                MENU_LEVEL2 = refRowData.MENU_LEVEL2;
                MENU_LEVEL3 = 1;
                break;
            case 3:
                MENU_LEVEL1 = refRowData.MENU_LEVEL1;
                MENU_LEVEL2 = refRowData.MENU_LEVEL2;
                MENU_LEVEL3 = refRowData.MENU_LEVEL3;
                MENU_LEVEL4 = 1;
                break;
        }
    } else {
        switch (PARENT_MENU_INDENT) {
            case 0:
                MENU_LEVEL1 = $NC.toNumber(groupLastRowData.MENU_LEVEL1) + 1;
                break;
            case 1:
                MENU_LEVEL1 = groupLastRowData.MENU_LEVEL1;
                MENU_LEVEL2 = $NC.toNumber(groupLastRowData.MENU_LEVEL2) + 1;
                break;
            case 2:
                MENU_LEVEL1 = groupLastRowData.MENU_LEVEL1;
                MENU_LEVEL2 = groupLastRowData.MENU_LEVEL2;
                MENU_LEVEL3 = $NC.toNumber(groupLastRowData.MENU_LEVEL3) + 1;
                break;
            case 3:
                MENU_LEVEL1 = groupLastRowData.MENU_LEVEL1;
                MENU_LEVEL2 = groupLastRowData.MENU_LEVEL2;
                MENU_LEVEL3 = groupLastRowData.MENU_LEVEL3;
                MENU_LEVEL4 = $NC.toNumber(groupLastRowData.MENU_LEVEL4) + 1;
                break;
        }
    }

    var parent = refRowData.id;
    var rowId = $NC.getGridNewRowId();
    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        MENU_GRP: refRowData.MENU_GRP,
        MENU_ID: "",
        MENU_NM: "",
        MENU_LEVEL1: MENU_LEVEL1,
        MENU_LEVEL2: MENU_LEVEL2,
        MENU_LEVEL3: MENU_LEVEL3,
        MENU_LEVEL4: MENU_LEVEL4,
        MENU_DIV: "M",
        PROGRAM_ID: "",
        PARENT_MENU_ID: refRowData.MENU_ID,
        APPLICATION_DIV: refRowData.APPLICATION_DIV || "1",
        REMARK1: null,
        MENU_INDENT: MENU_INDENT,
        PROGRAM_DIV: "M",

        parent: parent,
        _collapsed: false,
        id: rowId,
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData, $NC.isNull(nextRowData) ? null : G_GRDMASTER.data.getIdxById(nextRowData.id), true);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.006", "저장할 데이터가 없습니다."));
        return;
    }

    // 현재 선택된 로우 Validation 체크
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
            P_MENU_GRP: rowData.MENU_GRP,
            P_MENU_ID: rowData.MENU_ID,
            P_MENU_NM: rowData.MENU_DIV == "M" ? rowData.MENU_NM : "",
            P_MENU_LEVEL1: rowData.MENU_LEVEL1,
            P_MENU_LEVEL2: rowData.MENU_LEVEL2,
            P_MENU_LEVEL3: rowData.MENU_LEVEL3,
            P_MENU_LEVEL4: rowData.MENU_LEVEL4,
            P_MENU_DIV: rowData.MENU_DIV,
            P_PROGRAM_ID: rowData.PROGRAM_ID,
            P_PARENT_MENU_ID: rowData.PARENT_MENU_ID,
            P_APPLICATION_DIV: rowData.APPLICATION_DIV,
            P_REMARK1: rowData.REMARK1,
            P_MENU_INDENT: rowData.MENU_INDENT,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.007", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC01040E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveErrorM);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.008", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (isRootMenuGrp(rowData)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.010", "기본 메뉴그룹은 삭제할 수 없습니다.\n하위 메뉴 선택 후 삭제하십시오."));
        return;
    }

    if (rowData.MENU_DIV == "M") {
        if (!confirm($NC.getDisplayMsg("JS.CSC01040E0.011", "메뉴그룹을 삭제 하시겠습니까?\n삭제시 하위메뉴 전체가 삭제됩니다."))) {
            return;
        }
    } else {
        if (!confirm($NC.getDisplayMsg("JS.CSC01040E0.009", "삭제 하시겠습니까?"))) {
            return;
        }
    }

    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        // 신규 데이터일 경우 프로그램 메뉴 삭제 전 프로그램 등록여부 변경
        if (rowData.MENU_DIV == "P") {
            var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
                searchKey: [
                    "PROGRAM_ID"
                ],
                searchVal: [
                    rowData.PROGRAM_ID
                ],
                isAllData: true
            });
            if (searchRows.length == 1) {
                searchRows = $NC.getGridSearchRows(G_GRDDETAIL, {
                    searchKey: [
                        "PROGRAM_ID"
                    ],
                    searchVal: [
                        rowData.PROGRAM_ID
                    ]
                });
                if (searchRows.length == 1) {
                    var searchRowData = G_GRDDETAIL.data.getItem(searchRows[0]);
                    searchRowData.ENTRY_YN = $ND.C_NO;
                    G_GRDDETAIL.data.updateItem(searchRowData.id, searchRowData);
                }
            }
        }
        if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
            $NC.setEnableGroup("#divMasterInfoView", false);
            setInputValue("#grdMaster");
        }
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
        selectKey: "MENU_ID",
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

function btnEntryUserOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (isRootMenuGrp(rowData)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.012", "프로그램 메뉴는 사용자 등록할 수 없습니다."));
        return;
    }
    if (rowData.MENU_DIV == "M") {
        alert($NC.getDisplayMsg("JS.CSC01040E0.013", "메뉴는 사용자 등록할 수 없습니다."));
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD == $ND.C_DV_CRUD_C) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.014", "신규 프로그램입니다.\n\n저장 후 프로그램 사용자 등록 처리하십시오."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC01042P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC01042P0.001", "프로그램 사용자 등록"),
        url: "cs/CSC01042P0.html",
        width: 950,
        height: 600,
        resizeable: false,
        G_PARAMETER: {
            P_PROGRAM_ID: rowData.PROGRAM_ID,
            P_PROGRAM_NM: rowData.MENU_NM,
            P_PROGRAM_DIV: rowData.PROGRAM_DIV,
            P_PERMISSION: permission
        }
    });
}

function btnSetMenuLevelOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    if ($NC.isGridModified(G_GRDMASTER)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.015", "데이터가 변경되었습니다. 저장 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.MENU_DIV != "M") {
        alert($NC.getDisplayMsg("JS.CSC01040E0.016", "메뉴 그룹을 선택하고 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC01040E0.017", "메뉴 단계를 재설정하시겠습니까?"))) {
        return;
    }

    var MENU_ID = isRootMenuGrp(rowData) ? $ND.C_ALL : rowData.MENU_ID;
    $NC.serviceCall("/CSC01040E0/callCSMenuSetMenuLevel.do", {
        P_MENU_GRP: rowData.MENU_GRP,
        P_MENU_ID: MENU_ID,
        P_APPLICATION_DIV: rowData.APPLICATION_DIV,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.018", "메뉴 단계가 재설정되었습니다."));
        onSave(ajaxData);
    });
}

function btnAddMenuOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.002", "조회 후 등록하십시오."));
        return;
    }

    // 현재 선택된 로우 Validation 체크
    var refRow = G_GRDMASTER.lastRow;
    var refRowData = G_GRDMASTER.data.getItem(refRow);
    if ($NC.isNull(refRowData)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.003", "신규 등록할 메뉴의 상위 메뉴를 선택하십시오."));
        return;
    }

    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 현재 선택된 프로그램이 메뉴인지 체크
    if (refRowData.MENU_DIV != "M") {
        alert($NC.getDisplayMsg("JS.CSC01040E0.003", "신규 등록할 메뉴의 상위 메뉴를 선택하십시오."));
        return;
    }

    if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.004", "신규 등록한 메뉴입니다. 메뉴 저장 후 처리하십시오."));
        return;
    }

    var selectedRows = G_GRDDETAIL.view.getSelectedRows();
    var rCount = selectedRows.length;
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.019", "메뉴에 추가할 프로그램을 먼저 선택하십시오."));
        return;
    }

    // 애플리케이션 구분 체크
    var rowData, rIndex;
    for (rIndex = 0; rIndex < rCount; rIndex++) {
        // 추가할 프로그램 데이터
        rowData = G_GRDDETAIL.data.getItem(selectedRows[rIndex]);
        if (rowData.APPLICATION_DIV != refRowData.APPLICATION_DIV) {
            alert($NC.getDisplayMsg("JS.CSC01040E0.020", "선택한 메뉴와 동일한 애플리케이션구분의 프로그램만 추가 가능합니다."));
            return;
        }
    }

    // 메뉴가 닫혀 있으면 펼침
    if (refRowData._collapsed) {
        refRowData._collapsed = false;
        G_GRDMASTER.data.updateItem(refRowData.id, refRowData);
    }

    selectedRows.sort(function(a, b) {
        return a - b;
    });

    // 필터가 적용되어 있어 인덱스로 처리하면 데이터 정상 처리 안됨
    // 배열에 추가할 데이터를 추가 후 배열로 처리
    var dsMaster = [ ];
    var addedCount = 0;
    for (rIndex = 0; rIndex < rCount; rIndex++) {
        // 추가할 프로그램 데이터
        dsMaster.push(G_GRDDETAIL.data.getItem(selectedRows[rIndex]));
    }

    for (rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = dsMaster[rIndex];
        if (addMenuFromProgram(refRowData, refRow, rowData)) {
            addedCount++;
        }
    }

    if (addedCount == 0) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.021", "등록하려는 프로그램은 해당 메뉴에 이미 추가되어 있습니다."));
        return;
    }

    var activeCell = G_GRDDETAIL.view.getActiveCell();
    $NC.setGridSelectRow(G_GRDDETAIL, activeCell ? activeCell.row : G_GRDDETAIL.data.getLength() - 1);
}

function addMenuFromProgram(menuRowData, menuRow, programRowData) {

    // 다음 메뉴 검색
    var PARENT_MENU_INDENT = parseInt(menuRowData.MENU_INDENT);
    var MENU_INDENT = PARENT_MENU_INDENT + 1 + "";
    var MENU_LEVEL1 = 0;
    var MENU_LEVEL2 = 0;
    var MENU_LEVEL3 = 0;
    var MENU_LEVEL4 = 0;

    var rowData, nextRowData, groupLastRowData;
    for (var rIndex = menuRow + 1, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.MENU_INDENT == MENU_INDENT) {
            groupLastRowData = rowData;
        }
        if (rowData.MENU_INDENT <= menuRowData.MENU_INDENT) {
            nextRowData = rowData;
            break;
        }
        // 동일 레벨에 추가되어 있는지 체크
        if (rowData.PROGRAM_ID == programRowData.PROGRAM_ID) {
            return false;
        }
    }

    if ($NC.isNull(groupLastRowData)) {
        switch (PARENT_MENU_INDENT) {
            case 0:
                MENU_LEVEL1 = 1;
                break;
            case 1:
                MENU_LEVEL1 = menuRowData.MENU_LEVEL1;
                MENU_LEVEL2 = 1;
                break;
            case 2:
                MENU_LEVEL1 = menuRowData.MENU_LEVEL1;
                MENU_LEVEL2 = menuRowData.MENU_LEVEL2;
                MENU_LEVEL3 = 1;
                break;
            case 3:
                MENU_LEVEL1 = menuRowData.MENU_LEVEL1;
                MENU_LEVEL2 = menuRowData.MENU_LEVEL2;
                MENU_LEVEL3 = menuRowData.MENU_LEVEL3;
                MENU_LEVEL4 = 1;
                break;
        }
    } else {
        switch (PARENT_MENU_INDENT) {
            case 0:
                MENU_LEVEL1 = $NC.toNumber(groupLastRowData.MENU_LEVEL1) + 1;
                break;
            case 1:
                MENU_LEVEL1 = groupLastRowData.MENU_LEVEL1;
                MENU_LEVEL2 = $NC.toNumber(groupLastRowData.MENU_LEVEL2) + 1;
                break;
            case 2:
                MENU_LEVEL1 = groupLastRowData.MENU_LEVEL1;
                MENU_LEVEL2 = groupLastRowData.MENU_LEVEL2;
                MENU_LEVEL3 = $NC.toNumber(groupLastRowData.MENU_LEVEL3) + 1;
                break;
            case 3:
                MENU_LEVEL1 = groupLastRowData.MENU_LEVEL1;
                MENU_LEVEL2 = groupLastRowData.MENU_LEVEL2;
                MENU_LEVEL3 = groupLastRowData.MENU_LEVEL3;
                MENU_LEVEL4 = $NC.toNumber(groupLastRowData.MENU_LEVEL4) + 1;
                break;
        }
    }

    var parent = menuRowData.id;
    var rowId = $NC.getGridNewRowId();
    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        MENU_GRP: menuRowData.MENU_GRP,
        MENU_ID: menuRowData.MENU_ID + "-" + programRowData.PROGRAM_ID, // 멀티 등록을 위해 조정
        MENU_NM: programRowData.PROGRAM_NM,
        MENU_LEVEL1: MENU_LEVEL1,
        MENU_LEVEL2: MENU_LEVEL2,
        MENU_LEVEL3: MENU_LEVEL3,
        MENU_LEVEL4: MENU_LEVEL4,
        MENU_DIV: "P",
        PROGRAM_ID: programRowData.PROGRAM_ID,
        PARENT_MENU_ID: menuRowData.MENU_ID,
        APPLICATION_DIV: menuRowData.APPLICATION_DIV || "1",
        REMARK1: null,
        MENU_INDENT: MENU_INDENT,
        PROGRAM_DIV: programRowData.PROGRAM_DIV,

        parent: parent,
        _collapsed: false,
        id: rowId,
        CRUD: $ND.C_DV_CRUD_C
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData, $NC.isNull(nextRowData) ? null : G_GRDMASTER.data.getIdxById(nextRowData.id), true);

    // 프로그램 등록상태로 변경
    if (programRowData.ENTRY_YN == $ND.C_NO) {
        programRowData.ENTRY_YN = $ND.C_YES;
        G_GRDDETAIL.data.updateItem(programRowData.id, programRowData);
    }
    return true;
}

function btnMoveUpMenuOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    if ($NC.isGridModified(G_GRDMASTER)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.015", "데이터가 변경되었습니다. 저장 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (isRootMenuGrp(rowData)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.022", "기본 메뉴그룹은 이동할 수 없습니다.\n하위 메뉴 선택 후 이동하십시오."));
        return;
    }

    // 동일 레벨의 이전 메뉴 검색
    var toRowData, preRowData;
    for (var rIndex = G_GRDMASTER.lastRow - 1; rIndex > 0; rIndex--) {
        preRowData = G_GRDMASTER.data.getItem(rIndex);
        if (preRowData.MENU_INDENT == rowData.MENU_INDENT) {
            toRowData = preRowData;
            break;
        }
    }

    if ($NC.isNull(toRowData)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.023", "메뉴 이동은 동일 단계 내에서만 이동 가능합니다."));
        return;
    }

    if (rowData.APPLICATION_DIV != toRowData.APPLICATION_DIV) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.024", "메뉴 이동은 동일 애플리케이션구분 내에서만 이동 가능합니다."));
        return;
    }

    $NC.serviceCall("/CSC01040E0/callCSMenuLevelExchange.do", {
        P_MENU_GRP: rowData.MENU_GRP,
        P_MENU_ID: rowData.MENU_ID,
        P_TO_MENU_ID: toRowData.MENU_ID,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

function btnMoveDownMenuOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    if ($NC.isGridModified(G_GRDMASTER)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.015", "데이터가 변경되었습니다. 저장 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (isRootMenuGrp(rowData)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.025", "기본 메뉴그룹은 이동할 수 없습니다.\n하위 메뉴 선택 후 이동하십시오."));
        return;
    }

    // 동일 레벨의 다음 메뉴 검색
    var toRowData, nextRowData;
    for (var rIndex = G_GRDMASTER.lastRow + 1, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        nextRowData = G_GRDMASTER.data.getItem(rIndex);
        if (nextRowData.MENU_INDENT == rowData.MENU_INDENT) {
            toRowData = nextRowData;
            break;
        }
    }

    if ($NC.isNull(toRowData)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.023", "메뉴 이동은 동일 단계 내에서만 이동 가능합니다."));
        return;
    }

    if (rowData.APPLICATION_DIV != toRowData.APPLICATION_DIV) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.024", "메뉴 이동은 동일 애플리케이션구분 내에서만 이동 가능합니다."));
        return;
    }

    $NC.serviceCall("/CSC01040E0/callCSMenuLevelExchange.do", {
        P_MENU_GRP: rowData.MENU_GRP,
        P_MENU_ID: rowData.MENU_ID,
        P_TO_MENU_ID: toRowData.MENU_ID,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        } else {
            if (isRootMenuGrp(rowData)) {
                $NC.setEnableGroup("#divMasterInfoView", false);
                rowData = {
                    CRUD: $ND.C_DV_CRUD_R
                };
            } else {
                $NC.setEnableGroup("#divMasterInfoView", true);
            }
        }

        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtMenu_Id", rowData["MENU_ID"]);
        $NC.setValue("#edtMenu_Nm", rowData["MENU_NM"]);
        $NC.setValue("#edtMenu_Level1", rowData["MENU_LEVEL1"]);
        $NC.setValue("#edtMenu_Level2", rowData["MENU_LEVEL2"]);
        $NC.setValue("#edtMenu_Level3", rowData["MENU_LEVEL3"]);
        $NC.setValue("#edtMenu_Level4", rowData["MENU_LEVEL4"]);
        $NC.setValue("#cboApplication_Div", rowData["APPLICATION_DIV"]);
        $NC.setValue("#edtRemark1", rowData["REMARK1"]);

        // 신규 데이터/메뉴일 경우 메뉴ID 수정할 수 있게 함
        $NC.setEnable("#edtMenu_Id", (rowData["CRUD"] == $ND.C_DV_CRUD_C || rowData["CRUD"] == $ND.C_DV_CRUD_N) && rowData["MENU_DIV"] != "P");
        // 메뉴일 경우만 명칭 수정할 수 있도록 함
        if ($NC.isEnable("#edtMenu_Nm") && rowData["MENU_DIV"] == "P") {
            $NC.setEnable("#edtMenu_Nm", false);
        }

        $NC.setEnable("#cboApplication_Div", false);
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "MENU_ID")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.MENU_ID)) {
            alert($NC.getDisplayMsg("JS.CSC01040E0.026", "메뉴ID를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtMenu_Id");
            return false;
        }
        if ($NC.isNull(rowData.MENU_NM)) {
            alert($NC.getDisplayMsg("JS.CSC01040E0.027", "메뉴명을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtMenu_Nm");
            return false;
        }
        if ($NC.isNull(rowData.APPLICATION_DIV)) {
            alert($NC.getDisplayMsg("JS.CSC01040E0.028", "애플리케이션구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboApplication_Div");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

/**
 * grdMaster 데이터 필터링 이벤트
 */
function grdMasterOnFilter(item) {

    if ($NC.isNotNull(item.parent)) {
        var dsTarget = G_GRDMASTER.data.getItems();
        var parent = dsTarget[G_GRDMASTER.data.getIdxById(item.parent)];
        while ($NC.isNotNull(parent)) {
            if (parent._collapsed) {
                return false;
            }
            parent = dsTarget[G_GRDMASTER.data.getIdxById(parent.parent)];
        }
    }
    return true;
}

function grdMasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "MENU_NM",
        field: "MENU_NM",
        name: "메뉴명",
        minWidth: 200,
        formatter: function(row, cell, value, columnDef, dataContext) {
            var result = "<span class='slick-group-toggle";
            if (dataContext.MENU_DIV == "M") {
                if (dataContext._collapsed) {
                    result += " collapsed";
                } else {
                    result += " expanded";
                }
            }
            result += " styIcoProgram" + ($NC.isNull(dataContext.PROGRAM_DIV) ? dataContext.MENU_DIV : dataContext.PROGRAM_DIV) + "'" //
                + "style='margin-left: " + (2 + 10 * dataContext.MENU_INDENT) + "px'></span>" + value;

            return result;
        }
    });
    $NC.setGridColumn(columns, {
        id: "MENU_ID",
        field: "MENU_ID",
        name: "메뉴ID",
        resizable: false
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC01040E0.RS_MASTER",
        sortCol: "MENU_ID",
        redefineColumn: $ND.C_NO, // 컬럼 재정의 사용안함
        gridOptions: {
            showColumnHeader: false
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
                var selectedRow = dd.dropGridObject.view.getSelectedRows()[0];
                if (dd.dropCell.row != selectedRow) {
                    $NC.setGridSelectRow(dd.dropGridObject, dd.dropCell.row);
                }
                btnAddMenuOnClick();
            }
        }
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onGetCellValue.subscribe(grdMasterOnGetCellValue);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);

    // Grid 가로 스크롤바 숨김
    $NC.hideGridHorzScroller(G_GRDMASTER);
}

function grdMasterOnNewRecord(args) {

    $NC.setFocus("#edtMenu_Id");
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnClick(e, args) {

    if (!$(e.target).hasClass("slick-group-toggle")) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(args.row);
    if ($NC.isNull(rowData)) {
        return;
    }

    // 현재 선택된 로우 Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 메뉴
    if (rowData.MENU_DIV != "M") {
        return;
    }

    if (!rowData._collapsed) {
        rowData._collapsed = true;
    } else {
        rowData._collapsed = false;
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    $NC.setGridSelectRow(G_GRDMASTER, args.row);
    e.stopImmediatePropagation();
}

function grdMasterOnDblClick(e, args) {

    if (!$(e.target).hasClass("slick-cell")) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(args.row);
    if ($NC.isNull(rowData) || rowData.MENU_DIV != "M") {
        return;
    }

    // 메뉴
    if (!rowData._collapsed) {
        rowData._collapsed = true;
    } else {
        rowData._collapsed = false;
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    e.stopImmediatePropagation();
}

/**
 * OnGetCellValue, Cell 표시 값 리턴, 그리드에 값 표시하기전에 Event 발생
 * 
 * @param e
 * @param args
 *        row<br>
 *        cell<br>
 *        item<br>
 *        column<br>
 *        value<br>
 * @returns {String}<br>
 *          display value<br>
 *          null, undefined -> default value
 */
function grdMasterOnGetCellValue(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "MENU_ID":
            if (rowData.MENU_DIV == "M") {
                if (isRootMenuGrp(rowData)) {
                    return "";
                }
            } else {
                return args.item.PROGRAM_ID;
            }
            break;
    }
}

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "MENU_ID":
            rowData.MENU_ID = args.val;
            break;
        case "MENU_NM":
            rowData.MENU_NM = args.val;
            break;
        case "APPLICATION_DIV":
            rowData.APPLICATION_DIV = args.val;
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdDetailOnGetColumns() {

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
        id: "PROGRAM_DIV_F",
        field: "PROGRAM_DIV_F",
        name: "프로그램구분"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        frozenColumn: 0,
        multiSelect: true,
        specialRow: {
            compareKey: "ENTRY_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CSC01040E0.RS_DETAIL",
        sortCol: "PROGRAM_ID",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-cell",
            // helperMessageFormat: "선택 물류센터 %d건 추가",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = G_GRDDETAIL.data.getItem(dd.dragRows[0]);
                var result;
                if (dd.dragCount == 1) {
                    result = "[프로그램: " + $NC.getDisplayCombo(rowData.PROGRAM_ID, rowData.PROGRAM_NM) + "]를 추가";
                } else {
                    result = "[프로그램: " + $NC.getDisplayCombo(rowData.PROGRAM_ID, rowData.PROGRAM_NM) + "] 외 " + (dd.dragCount - 1) + "건 추가";
                }
                return result;
            }
        }
    });
    G_GRDDETAIL.lastFilterVal = [
        "0",
        $ND.C_ALL,
        ""
    ];

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnSetFilter() {

    $NC.setGridFilterValue(G_GRDDETAIL, [
        $NC.getValueRadioGroup("rgbQEntry_Div"),
        $NC.getValue("#cboQApplication_Div"),
        $NC.getValue("#edtQProgram_Id")
    ]);
}

function grdDetailOnFilter(item) {

    if ($NC.isNull(G_GRDDETAIL.lastFilterVal)) {
        return false;
    }

    var targetEntry = true;
    if (G_GRDDETAIL.lastFilterVal[0] == "1") {
        targetEntry = item.ENTRY_YN == $ND.C_NO;
    }

    var targetApplication = true;
    if (G_GRDDETAIL.lastFilterVal[1] != $ND.C_ALL) {
        targetApplication = item.APPLICATION_DIV == G_GRDDETAIL.lastFilterVal[1];
    }

    var targetProgram = true;
    if ($NC.isNotNull(G_GRDDETAIL.lastFilterVal[2])) {
        targetProgram = item.PROGRAM_ID.indexOf(G_GRDDETAIL.lastFilterVal[2]) > -1;
    }

    return targetEntry && targetApplication && targetProgram;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        if (args.rows.length == 0) {
            if (G_GRDDETAIL.data.getLength() > 0) {
                // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
                $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow);
            } else {
                $NC.setGridDisplayRows(G_GRDDETAIL, 0, 0);
            }
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData, grdMasterOnFilter);
    if (G_GRDMASTER.data.getLength() > 0) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnableGroup("#ctrAdditionalB_grdDetail", true);
        $NC.setEnable("#edtMenu_Id", false);
        setUserProgramPermission();

        var rowData;
        if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
            $NC.setGridSelectRow(G_GRDMASTER, 0);
            rowData = G_GRDMASTER.data.getItem(0);
            if ($NC.isNull(rowData)) {
                return;
            }
            // 프로그램 메뉴 펼침
            if (rowData.MENU_ID == "HTML_MENU") {
                rowData._collapsed = false;
                G_GRDMASTER.data.updateItem(rowData.id, rowData);
            }
        } else {
            // Tree 형태의 그리드는 접힌 메뉴는 검색이 되지 않기 때문에 메뉴를 펼침
            var lastKeyIndex = $NC.getGridSearchRow(G_GRDMASTER, {
                searchKey: "MENU_ID",
                searchVal: G_GRDMASTER.lastKeyVal,
                isAllData: true
            });
            if (lastKeyIndex == -1) {
                $NC.setGridSelectRow(G_GRDMASTER, 0);
                return;
            }

            var dsTarget = G_GRDMASTER.data.getItems();
            rowData = dsTarget[lastKeyIndex];
            while ($NC.isNotNull(rowData.parent)) {
                rowData = dsTarget[G_GRDMASTER.data.getIdxById(rowData.parent)] || {};
                if ($NC.isNotNull(rowData.id)) {
                    if (rowData._collapsed) {
                        rowData._collapsed = false;
                        G_GRDMASTER.data.updateItem(rowData.id, rowData);
                    }
                }
            }
            /*
            if (lastRowData.MENU_DIV == "M") {
                if (lastRowData._collapsed) {
                    lastRowData._collapsed = false;
                    G_GRDMASTER.data.updateItem(lastRowData.id, lastRowData);
                }
            }
            */
            $NC.setGridSelectRow(G_GRDMASTER, {
                selectKey: "MENU_ID",
                selectVal: G_GRDMASTER.lastKeyVal,
                activeCell: true
            });
        }
    } else {
        $NC.setEnableGroup("#divMasterInfoView", false);
        $NC.setEnableGroup("#ctrAdditionalB_grdDetail", false);
        setUserProgramPermission();
        setInputValue("#grdMaster");
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

    $NC.setInitGridData(G_GRDDETAIL, ajaxData, grdDetailOnFilter);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "PROGRAM_ID"
    ]);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "MENU_ID"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSaveErrorM(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData, true);
    }
}

function btnCopyOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var MENU_GRP = $NC.getValue("#cboQMenu_Grp");
    if ($NC.isNull(MENU_GRP)) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.001", "메뉴그룹을 선택하십시오."));
        $NC.setFocus("#cboQMenu_Grp");
        return;
    }

    var dsTarget = G_GRDMASTER.data.getItems();
    if (dsTarget.length < 4) {
        alert($NC.getDisplayMsg("JS.CSC01040E0.029", "등록된 메뉴가 없는 메뉴그룹입니다."));
        $NC.setFocus("#cboQMenu_Grp");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC01041P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC01041P0.001", "메뉴 복사"),
        url: "cs/CSC01041P0.html",
        width: 650,
        height: 160,
        resizeable: false,
        G_PARAMETER: {
            P_MENU_GRP: MENU_GRP,
            P_MENU_GRP_F: $NC.getValueCombo("#cboQMenu_Grp", "F"),
            P_MENU_GRP_DATA: $NC.getComboData("#cboQMenu_Grp"),
            P_PERMISSION: permission
        },
        onOk: function(resultInfo) {
            $NC.setValue("#cboQMenu_Grp", resultInfo.TO_MENU_GRP);
            _Inquiry();
        }
    });
}

function isRootMenuGrp(rowData) {

    var checkRowData = rowData || {};
    return checkRowData.MENU_ID == "HTML_MENU" //
        || checkRowData.MENU_ID == "SCAN_MENU" //
        || checkRowData.MENU_ID == "PDA_MENU";
}