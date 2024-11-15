/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC02010E0
 *  프로그램명         : 운송권역관리
 *  프로그램설명       : 운송권역관리 화면(일반) Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-02-27
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-02-27    ASETEC           신규작성
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
        },
        // 체크할 정책 값
        policyVal: {
            CM510: "" // 운송권역 관리정책
        }
    });

    // 버튼 이벤트 연결
    $("#btnEntryArea").click(btnEntryAreaOnClick);

    // 그리드 초기화
    grdMasterInitialize();

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // 운송권역 관리정책 : 1-물류센터별 관리
        if ($NC.G_VAR.policyVal.CM510 == $ND.C_POLICY_VAL_1) {
            $NC.setVisible("#divQCenter_Cd", true);
            $NC.setVisible("#btnEntryArea", true);

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
            // 운송권역 관리정책 : 2-통합 관리
        } else {
            $NC.setVisible("#divQCenter_Cd", false);
            $NC.setVisible("#btnEntryArea", false);

            $NC.setInitComboData({
                selector: "#cboQCenter_Cd",
                codeField: "CENTER_CD",
                nameField: "CENTER_NM",
                data: [
                    {
                        CENTER_CD: "*",
                        CENTER_NM: $NC.getDisplayMsg("JS.CMC02010E0.008", "전체")
                    }
                ],
                onComplete: function() {
                    $NC.setValue("#cboQCenter_Cd", "*");
                }
            });
        }
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

    $NC.setEnable("#btnEntryArea", permission.canSave && enable);
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
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

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC02010E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);
    var AREA_NM = $NC.getValue("#edtQArea_Nm", true);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_AREA_CD: AREA_CD,
        P_AREA_NM: AREA_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CMC02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        AREA_CD: null,
        AREA_NM: null,
        AREA_GRP: null,
        AREA_ORDER: null,
        REMARK1: null,
        REG_USER_ID: null,
        REG_DATETIME: null,
        AREA_GRP_F: null,
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
        alert($NC.getDisplayMsg("JS.CMC02010E0.002", "저장할 데이터가 없습니다."));
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
            P_AREA_CD: rowData.AREA_CD,
            P_AREA_NM: rowData.AREA_NM,
            P_AREA_GRP: rowData.AREA_GRP,
            P_AREA_ORDER: rowData.AREA_ORDER,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC02010E0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC02010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC02010E0.004", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC02010E0.005", "삭제 하시겠습니까?"))) {
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
        selectKey: "AREA_CD",
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
        id: "AREA_CD",
        field: "AREA_CD",
        name: "권역코드",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "권역명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "AREA_GRP_F",
        field: "AREA_GRP_F",
        name: "운송권역그룹",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "AREA_GRP",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "AREA_GRP",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            addEmpty: true
        })

    });
    $NC.setGridColumn(columns, {
        id: "AREA_ORDER",
        field: "AREA_ORDER",
        name: "운송권역순위",
        cssClass: "styRight",
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

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC02010E0.RS_MASTER",
        sortCol: "AREA_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, 0, true);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "AREA_CD":
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
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "AREA_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.AREA_CD)) {
            alert($NC.getDisplayMsg("JS.CMC02010E0.006", "운송권역코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "AREA_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.AREA_NM)) {
            alert($NC.getDisplayMsg("JS.CMC02010E0.007", "운송권역명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "AREA_NM", true);
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

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "AREA_CD", true);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

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
        selectKey: "AREA_CD"
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
 * 운송권역 복사등록 버튼 호출.
 */
function btnEntryAreaOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var AREA_CD = $NC.getValue("#edtQArea_Cd");
    var AREA_NM = $NC.getValue("#edtQArea_Nm");

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC02011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC02011P0.001", "운송권역 복사"),
        url: "cm/CMC02011P0.html",
        width: 650,
        height: 160,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_AREA_CD: AREA_CD,
            P_AREA_NM: AREA_NM,
            P_PERMISSION: permission
        },
        onOk: function() {
            _Inquiry();
        }
    });
}
