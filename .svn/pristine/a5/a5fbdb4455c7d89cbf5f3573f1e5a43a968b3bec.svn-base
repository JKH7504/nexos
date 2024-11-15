/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01020E0
 *  프로그램명         : 프로그램관리
 *  프로그램설명       : 프로그램관리 화면 Javascript
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
            viewSecond: function() {
                var resizeView = {
                    container: "#divRightView"
                };

                if ($NC.getTabActiveIndex(resizeView.container) == 1) {
                    resizeView.grids = "#grdDetail";
                }
                return resizeView;
            },
            viewType: "h",
            viewFixed: {
                container: "viewSecond",
                size: function(viewWidth, viewHeight) {

                    var scrollOffset = viewHeight < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
                    return $NC.G_OFFSET.rightViewWidth + scrollOffset;
                }
            }
        }
    });

    // 초기화 및 초기값 세팅
    // 탭 초기화
    $NC.setInitTab("#divRightView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    // 콤보박스 초기화
    // 애플리케이션구분 세팅
    $NC.serviceCall("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "APPLICATION_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, function(ajaxData) {

        var dsResult = $NC.toArray(ajaxData);
        $NC.setInitComboData({
            selector: "#cboQApplication_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: dsResult,
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQApplication_Div", $ND.C_ALL);
            }
        });

        $NC.setInitComboData({
            selector: "#cboApplication_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: dsResult,
            onComplete: function() {
                $NC.setValue("#cboApplication_Div");
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

    $NC.G_OFFSET.rightViewWidth = 700;
    $NC.G_OFFSET.rightViewMinHeight = $("#divT1TabSheetView").outerHeight(true) + $NC.G_LAYOUT.header;
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

}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

    onChangingCondition();
}

function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    setInputValue("#grdMaster");
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    if (view.parents("#divMasterInfoView").length > 0) {
        grdMasterOnCellChange(e, {
            view: view,
            col: id,
            val: val
        });
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var APPLICATION_DIV = $NC.getValue("#cboQApplication_Div");
    var PROGRAM_ID = $NC.getValue("#edtQProgram_Id");
    var PROGRAM_NM = $NC.getValue("#edtQProgram_Nm");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_APPLICATION_DIV: APPLICATION_DIV,
        P_PROGRAM_ID: PROGRAM_ID,
        P_PROGRAM_NM: PROGRAM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CSC01020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var tabActiveIndex = $NC.getTabActiveIndex("#divRightView");
    var newRowData;
    // 프로그램 상세 정보 탭
    if (tabActiveIndex == 0) {

        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            PROGRAM_ID: "",
            PROGRAM_NM: "",
            PROGRAM_DIV: "E",
            PROGRAM_DIV_F: $NC.getDisplayCombo("E", $NC.getValueText("#rgbProgram_Div_E")),
            WIDE_YN: $ND.C_NO,
            WEB_URL: null,
            APPLICATION_DIV: "1",
            APPLICATION_DIV_F: $NC.getComboName("#cboApplication_Div", {
                searchVal: "1",
                dataCodeField: "COMMON_CD",
                dataFullNameField: "COMMON_CD_F"
            }),
            DEAL_DIV: "1",
            REMARK1: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 이전 데이터가 한건도 없었으면 에디터 Enable
        if (G_GRDMASTER.data.getLength() == 0) {
            $NC.setEnableGroup("#divMasterInfoView", true);
        }

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDMASTER, newRowData);
    }
    // 프로그램 레포트 탭
    else if (tabActiveIndex == 1) {

        if (G_GRDMASTER.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.001", "조회 후 등록하십시오."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }

        var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if (refRowData.PROGRAM_DIV == "M") {
            alert($NC.getDisplayMsg("JS.CSC01020E0.002", "메뉴 프로그램은 레포트를 등록할 수 없습니다."));
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            PROGRAM_ID: refRowData.PROGRAM_ID,
            PROGRAM_SUB_CD: $ND.C_NULL,
            REPORT_CD: null,
            REPORT_CD_F: null,
            REPORT_TITLE_NM: null,
            REPORT_QUERY_ID: null,
            INTERNAL_QUERY_YN: $ND.C_NO,
            USE_YN: $ND.C_YES,
            SORT_RANK: 0,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDDETAIL, newRowData);
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC01020E0.003", "저장할 데이터가 없습니다."));
        return;
    }

    var tabActiveIndex = $NC.getTabActiveIndex("#divRightView");
    var dsMaster, dsTarget, rowData, rIndex, rCount;
    // 프로그램 상세 정보 탭
    if (tabActiveIndex == 0) {
        // 현재 선택된 로우 Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }

        dsTarget = G_GRDMASTER.data.getItems();
        dsMaster = [];
        for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
            rowData = dsTarget[rIndex];
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            }
            dsMaster.push({
                P_PROGRAM_ID: rowData.PROGRAM_ID,
                P_PROGRAM_NM: rowData.PROGRAM_NM,
                P_PROGRAM_GRP1: rowData.PROGRAM_GRP1,
                P_PROGRAM_GRP2: rowData.PROGRAM_GRP2,
                P_PROGRAM_GRP3: rowData.PROGRAM_GRP3,
                P_PROGRAM_GRP4: rowData.PROGRAM_GRP4,
                P_PROGRAM_DIV: rowData.PROGRAM_DIV,
                P_WIDE_YN: rowData.WIDE_YN,
                P_WEB_URL: rowData.WEB_URL,
                P_PARENT_PROGRAM_ID: rowData.PARENT_PROGRAM_ID,
                P_APPLICATION_DIV: rowData.APPLICATION_DIV,
                P_DEAL_DIV: rowData.DEAL_DIV,
                P_REMARK1: rowData.REMARK1,
                P_CRUD: rowData.CRUD
            });
        }

        if (dsMaster.length == 0) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.004", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/CSC01020E0/saveProgram.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveErrorM);
    }
    // 프로그램 레포트 탭
    else if (tabActiveIndex == 1) {

        if (G_GRDDETAIL.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.003", "저장할 데이터가 없습니다."));
            return;
        }

        // 현재 선택된 로우 Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }

        dsTarget = G_GRDDETAIL.data.getItems();
        dsMaster = [];
        for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
            rowData = dsTarget[rIndex];
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            }
            dsMaster.push({
                P_PROGRAM_ID: rowData.PROGRAM_ID,
                P_PROGRAM_SUB_CD: rowData.PROGRAM_SUB_CD,
                P_REPORT_CD: rowData.REPORT_CD,
                P_REPORT_TITLE_NM: rowData.REPORT_TITLE_NM,
                P_REPORT_QUERY_ID: rowData.REPORT_QUERY_ID,
                P_INTERNAL_QUERY_YN: rowData.INTERNAL_QUERY_YN,
                P_USE_YN: rowData.USE_YN,
                P_SORT_RANK: rowData.SORT_RANK,
                P_CRUD: rowData.CRUD
            });
        }

        if (dsMaster.length == 0) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.004", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/CSC01020E0/saveReport.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveErrorD);
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var tabActiveIndex = $NC.getTabActiveIndex("#divRightView");
    var rowData;
    // 프로그램 상세 정보 탭
    if (tabActiveIndex == 0) {

        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.005", "삭제할 데이터가 없습니다."));
            return;
        }

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if (rowData.PROGRAM_ID == "HTML_MENU" || rowData.PROGRAM_ID == "SCAN_MENU" || rowData.PROGRAM_ID == "PDA_MENU") {
            alert($NC.getDisplayMsg("JS.CSC01020E0.007", "프로그램 메뉴입니다.\n\n삭제할 프로그램을 선택하십시오."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CSC01020E0.006", "삭제 하시겠습니까?"))) {
            return;
        }
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
                $NC.setEnableGroup("#divMasterInfoView", false);
                setInputValue("#grdMaster");
            }
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDMASTER.data.updateItem(rowData.id, rowData);

            $NC.serviceCall("/CSC01020E0/callCSProgramDelete.do", {
                P_PROGRAM_ID: rowData.PROGRAM_ID,
                P_USER_ID: $NC.G_USERINFO.USER_ID
            }, onSave, onSaveErrorM);
        }

    }
    // 프로그램 레포트 탭
    else if (tabActiveIndex == 1) {

        if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.005", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CSC01020E0.006", "삭제 하시겠습니까?"))) {
            return;
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
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "PROGRAM_ID",
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
        case "INTERNAL_QUERY_YN":
        case "USE_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        } else {
            $NC.setEnableGroup("#divMasterInfoView", true);
        }

        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtProgram_Id", rowData["PROGRAM_ID"]);
        $NC.setValue("#edtProgram_Nm", rowData["PROGRAM_NM"]);
        $NC.setValue("#edtWeb_Url", rowData["WEB_URL"]);
        $NC.setValue("#cboApplication_Div", rowData["APPLICATION_DIV"]);
        $NC.setValueRadioGroup("rgbProgram_Div", rowData["PROGRAM_DIV"]);
        $NC.setValueRadioGroup("rgbWide_Yn", rowData["WIDE_YN"]);
        $NC.setValue("#edtRemark1", rowData["REMARK1"]);
        $NC.setValueRadioGroup("rgbDeal_Div", rowData["DEAL_DIV"]);

        // 신규 데이터면 프로그램ID 수정할 수 있게 함
        if (rowData["CRUD"] == $ND.C_DV_CRUD_C || rowData["CRUD"] == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtProgram_Id", true);
        } else {
            $NC.setEnable("#edtProgram_Id", false);
        }
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "PROGRAM_ID")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.PROGRAM_ID)) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.008", "프로그램ID를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtProgram_Id");
            return false;
        }
        if ($NC.isNull(rowData.PROGRAM_NM)) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.009", "프로그램명을 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtProgram_Nm");
            return false;
        }
        if (rowData.PROGRAM_DIV != "M") {
            if ($NC.isNull(rowData.WEB_URL)) {
                alert($NC.getDisplayMsg("JS.CSC01020E0.010", "WEB URL을 입력하십시오."));
                $NC.setTabActiveIndex("#divRightView", 0);
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#edtWeb_Url");
                return false;
            }
        } else {
            if ($NC.isNotNull(rowData.WEB_URL)) {
                rowData.WEB_URL = "";
                rowData.WIDE_YN = $ND.C_NO;
                G_GRDMASTER.data.updateItem(rowData.id, rowData);
            }
        }
        if ($NC.isNull(rowData.APPLICATION_DIV)) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.011", "애플리케이션구분을 선택하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboApplication_Div");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnGetColumns() {

    var columns = [];
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
        id: "WEB_URL",
        field: "WEB_URL",
        name: "웹접근URL"
    });
    $NC.setGridColumn(columns, {
        id: "PROGRAM_DIV_F",
        field: "PROGRAM_DIV_F",
        name: "프로그램구분"
    });
    $NC.setGridColumn(columns, {
        id: "APPLICATION_DIV_F",
        field: "APPLICATION_DIV_F",
        name: "애플리케이션구분"
    });
    $NC.setGridColumn(columns, {
        id: "WIDE_YN",
        field: "WIDE_YN",
        name: "화면와이드표시여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC01020E0.RS_MASTER",
        sortCol: "PROGRAM_ID",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnNewRecord(args) {

    $NC.setTabActiveIndex("#divRightView", 0);
    $NC.setFocus("#edtProgram_Id");
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);

    // 레포트, 사용자조회
    var tabActiveIndex = $NC.getTabActiveIndex("#divRightView");
    if (tabActiveIndex == 1) {
        setDetail(rowData);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "PROGRAM_ID":
            rowData.PROGRAM_ID = args.val;
            break;
        case "PROGRAM_NM":
            rowData.PROGRAM_NM = args.val;
            break;
        case "WEB_URL":
            rowData.WEB_URL = args.val;
            break;
        case "APPLICATION_DIV":
            rowData.APPLICATION_DIV = args.val;
            rowData.APPLICATION_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "PROGRAM_DIV_E":
        case "PROGRAM_DIV_Q":
        case "PROGRAM_DIV_R":
            rowData.PROGRAM_DIV = args.val;
            rowData.PROGRAM_DIV_F = $NC.getDisplayCombo(args.val, $NC.getValueText(e.target));
            break;
        case "WIDE_YN_Y":
        case "WIDE_YN_N":
            rowData.WIDE_YN = args.val;
            break;
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "PROGRAM_SUB_CD",
        field: "PROGRAM_SUB_CD",
        name: "프로그램하위코드",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_CD_F",
        field: "REPORT_CD_F",
        name: "레포트",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CSREPORT",
            P_QUERY_PARAMS: {
                P_REPORT_CD: $ND.C_ALL,
                P_REPORT_TYPE: $ND.C_ALL,
                P_REPORT_DIV: $ND.C_ALL
            }
        }, {
            codeField: "REPORT_CD",
            dataCodeField: "REPORT_CD",
            dataFullNameField: "REPORT_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_TITLE_NM",
        field: "REPORT_TITLE_NM",
        name: "레포트타이틀",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "REPORT_QUERY_ID",
        field: "REPORT_QUERY_ID",
        name: "레포트쿼리ID",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "INTERNAL_QUERY_YN",
        field: "INTERNAL_QUERY_YN",
        name: "내부쿼리사용여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "USE_YN",
        field: "USE_YN",
        name: "사용여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "SORT_RANK",
        field: "SORT_RANK",
        name: "정렬순서",
        cssClass: "styRight",
        editor: Slick.Editors.Number
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
        queryId: "CSC01020E0.RS_DETAIL",
        sortCol: "REPORT_CD_F",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "PROGRAM_SUB_CD", true);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "PROGRAM_SUB_CD":
            case "REPORT_CD_F":
                return false;
        }
    }
    return true;
}

/**
 * @param e
 * @param args
 *        row, cell, item, grid
 */
function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "REPORT_CD")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.PROGRAM_SUB_CD)) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.012", "프로그램하위코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "PROGRAM_SUB_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.REPORT_CD)) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.013", "레포트코드를 선택하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "REPORT_CD_F", true);
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

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
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

    $NC.onGlobalResize();
    var tabActiveIndex = $NC.getTabActiveIndex("#divRightView");
    if (tabActiveIndex > 0) {
        if ($NC.isGridModified(G_GRDMASTER)) {
            alert($NC.getDisplayMsg("JS.CSC01020E0.014", "프로그램 메뉴 데이터가 수정되었습니다. 저장 후 작업하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setFocus("#divTab1");
            return;
        }
        setDetail(G_GRDMASTER.data.getLength() == 0 ? null : G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow));
    }
}

function setDetail(rowData) {

    if ($NC.isNull(rowData) || rowData.PROGRAM_DIV == "M" || rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD == $ND.C_DV_CRUD_C) {
        $NC.clearGridData(G_GRDDETAIL);
    } else {
        // 조회시 그리드 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDDETAIL);
        G_GRDDETAIL.queryParams = {
            P_PROGRAM_ID: rowData.PROGRAM_ID
        };
        // 디테일 조회
        $NC.serviceCall("/CSC01020E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "PROGRAM_ID", true)) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnable("#edtProgram_Id", false);
        setUserProgramPermission();
    } else {
        $NC.setEnableGroup("#divMasterInfoView", false);
        setInputValue("#grdMaster");
        setUserProgramPermission();
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
    $NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "PROGRAM_SUB_CD",
        "REPORT_CD"
    ]);
}

function onSave(ajaxData) {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "PROGRAM_ID"
    });
    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "PROGRAM_SUB_CD",
            "REPORT_CD"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyValM;
    G_GRDDETAIL.lastKeyVal = lastKeyValD;
}

function onSaveErrorM(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData, true);
    }
}

function onSaveErrorD(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDDETAIL, rowData, true);
    }
}
