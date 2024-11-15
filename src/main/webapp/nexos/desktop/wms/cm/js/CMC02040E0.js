/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC02040E0
 *  프로그램명         : 차량운송권역관리
 *  프로그램설명       : 차량운송권역관리 화면 Javascript
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
                "#grdMaster",
                "#grdSub"
            ]
        },
        // 체크할 정책 값
        policyVal: {
            CM510: "" // 운송권역 관리정책
        }
    });

    // 초기화 및 초기값 세팅
    // 이벤트 연결
    $("#btnAddCar").click(btnAddCarOnClick); // 차량등록 버튼 클릭 이벤트 연결
    $("#btnEntryCarref").click(btnEntryCarrefOnClick); // 차량간편등록 버튼 클릭 이벤트 연결
    $("#btnQArea_Cd").click(showQDeliveryAreaPopup);
    $("#btnArea_Cd").click(showDeliveryAreaPopup);

    // 그리드 초기화
    grdMasterInitialize(); // 상단그리드 초기화
    grdSubInitialize(); // 하단그리드 초기화

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // 운송권역 관리정책 : 1-물류센터별 관리
        if ($NC.G_VAR.policyVal.CM510 == $ND.C_POLICY_VAL_1) {
            $NC.setVisible("#divQCenter_Cd", true);
            $NC.setVisible("#btnEntryCarref", true);

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
            $NC.setVisible("#btnEntryCarref", false);

            $NC.setInitComboData({
                selector: "#cboQCenter_Cd",
                codeField: "CENTER_CD",
                nameField: "CENTER_NM",
                data: [
                    {
                        CENTER_CD: "*",
                        CENTER_NM: $NC.getDisplayMsg("JS.CMC02010E0.XXX", "전체")
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

function _OnLoaded() {

    $NC.setInitSplitter("#divMasterView", "h", 300);
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
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            $NC.setValue("#edtQArea_Cd");
            $NC.setValue("#edtQArea_Nm");
            $NC.setValue("#edtArea_Cd");
            $NC.setValue("#edtArea_Nm");
            break;
        case "AREA_CD":
            $NP.onDeliveryAreaChange(val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: val
            }, onQDeliveryAreaPopup);
            return;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    // 하단그리드 위의 윤송권역 검색 값 변경 했을 경우
    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "AREA_CD":
            $NP.onDeliveryAreaChange(val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: val
            }, onDeliveryAreaPopup);
            return;
    }
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable1 = G_GRDMASTER.data.getLength() > 0;
    var enable2 = G_GRDSUB.data.getLength() > 0;

    $NC.setEnable("#btnEntryCarref", permission.canSave && enable1);
    $NC.setEnable("#btnAddCar", permission.canSave && enable2);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC02040E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_AREA_CD: AREA_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC02040E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);

    G_GRDSUB.queryParams = {
        P_CENTER_CD: CENTER_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC02040E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
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

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC02040E0.002", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 운송권역 입력여부 체크(INSERT/UPDATE), 미입력시 FRK 오류
    var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
        compareFn: function(rowData) {
            // CRUD가 C/N/U만 체크 대상
            if (rowData.CRUD == $ND.C_DV_CRUD_R || rowData.CRUD == $ND.C_DV_CRUD_D) {
                return false;
            }
            // 운송권역 미입력 체크
            if ($NC.isNull(rowData.AREA_CD)) {
                return true;
            }
            return false;
        }
    });
    if (searchRows.length > 0) {
        alert($NC.getDisplayMsg("JS.CMC02040E0.003", "운송권역 미입력 데이터가 존재합니다. 운송권역을 먼저 입력하십시오."));
        $NC.setGridSelectRow(G_GRDMASTER, {
            selectRow: searchRows[0],
            activeCell: "AREA_CD",
            editMode: true
        });
        return;
    }

    // 물류센터코드는 저장시 선택된 물류센터로 입력
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

    var dsMaster = [ ];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: CENTER_CD,
            P_CAR_CD: rowData.CAR_CD,
            P_AREA_CD: rowData.AREA_CD,
            P_WORK_DIST: rowData.WORK_DIST,
            P_CHARGE_YN: rowData.CHARGE_YN,
            P_PAY_YN: rowData.PAY_YN,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC02040E0.004", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC02040E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC02040E0.005", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC02040E0.006", "삭제 하시겠습니까?"))) {
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
        selectKey: "CAR_CD",
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

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운전자성명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_TON_DIV_F",
        field: "CAR_TON_DIV_F",
        name: "차량톤수"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_KEEP_DIV_F",
        field: "CAR_KEEP_DIV_F",
        name: "차량보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_CBM",
        field: "CAPACITY_CBM",
        name: "적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_WEIGHT",
        field: "CAPACITY_WEIGHT",
        name: "적재중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_BOX",
        field: "CAPACITY_BOX",
        name: "적재박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_CD",
        field: "AREA_CD",
        name: "운송권역",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup
        }
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "운송권역명"
    });
    $NC.setGridColumn(columns, {
        id: "WORK_DIST",
        field: "WORK_DIST",
        name: "출근거리",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "CHARGE_YN",
        field: "CHARGE_YN",
        name: "청구수수료발생여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "PAY_YN",
        field: "PAY_YN",
        name: "지급수수료발생여부",
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

/**
 * 상단그리드 초기화
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
        queryId: "CMC02040E0.RS_MASTER",
        sortCol: "CAR_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "AREA_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.AREA_CD)) {
            alert($NC.getDisplayMsg("JS.CMC02040E0.007", "운송권역코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "AREA_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.WORK_DIST)) {
            alert($NC.getDisplayMsg("JS.CMC02040E0.008", "출근거리를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "WORK_DIST", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

/**
 * 상단그리드의 입력항목 값 변경
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "AREA_CD":
            $NP.onDeliveryAreaChange(rowData.AREA_CD, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: rowData.AREA_CD
            }, grdMasterOnDeliveryAreaPopup);
            return;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

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
 * 그리드의 운송권역 셀의 검색 아이콘 클릭시 팝업창 표시
 */
function grdMasterOnPopup(e, args) {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    switch (args.column.id) {
        case "AREA_CD":
            $NP.showDeliveryAreaPopup({
                P_CENTER_CD: CENTER_CD,
                P_AREA_CD: $ND.C_ALL
            }, grdMasterOnDeliveryAreaPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            break;
    }
}

function grdMasterOnDeliveryAreaPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.AREA_CD = resultInfo.AREA_CD;
        rowData.AREA_NM = resultInfo.AREA_NM;
        focusCol = G_GRDMASTER.view.getColumnIndex("AREA_CD");
    } else {
        rowData.AREA_CD = "";
        rowData.AREA_NM = "";
        focusCol = G_GRDMASTER.view.getColumnIndex("AREA_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

function grdSubOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운전자성명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_TON_DIV_F",
        field: "CAR_TON_DIV_F",
        name: "차량톤수"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_KEEP_DIV_F",
        field: "CAR_KEEP_DIV_F",
        name: "차량보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_CBM",
        field: "CAPACITY_CBM",
        name: "적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_WEIGHT",
        field: "CAPACITY_WEIGHT",
        name: "적재중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_BOX",
        field: "CAPACITY_BOX",
        name: "적재박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 하단그리드 초기화
 */
function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "CMC02040E0.RS_SUB1",
        sortCol: "CAR_CD",
        gridOptions: options
    });

    G_GRDSUB.view.onHeaderClick.subscribe(grdSubOnHeaderClick);
    G_GRDSUB.view.onClick.subscribe(grdSubOnClick);
    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHECK_YN");
}

/**
 * 하단 그리드.헤더의 전체선택 체크박스 클릭
 */
function grdSubOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDSUB, e, args);
            break;
    }
}

function grdSubOnClick(e, args) {

    var columnId = G_GRDSUB.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDSUB, e, args);
            break;
    }
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 *        event object
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
        case "CHARGE_YN":
        case "PAY_YN":
        case "CHECK_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

/**
 * 운송권역(검색항목) 검색 팝업 표시
 */
function showQDeliveryAreaPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showDeliveryAreaPopup({
        queryParams: {
            P_CENTER_CD: CENTER_CD,
            P_AREA_CD: $ND.C_ALL
        }
    }, onQDeliveryAreaPopup, function() {
        $NC.setFocus("#edtQArea_Cd");
    });
}

function onQDeliveryAreaPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQArea_Cd", resultInfo.AREA_CD);
        $NC.setValue("#edtQArea_Nm", resultInfo.AREA_NM);
    } else {
        $NC.setValue("#edtQArea_Cd");
        $NC.setValue("#edtQArea_Nm");
        $NC.setFocus("#edtQArea_Cd", true);
    }
    // 화면 클리어
    onChangingCondition();
}

/**
 * 운송권역(차량등록) 검색 팝업 표시
 */
function showDeliveryAreaPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showDeliveryAreaPopup({
        queryParams: {
            P_CENTER_CD: CENTER_CD,
            P_AREA_CD: $ND.C_ALL
        }
    }, onDeliveryAreaPopup, function() {
        $NC.setFocus("#edtArea_Cd", true);
    });
}

function onDeliveryAreaPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtArea_Cd", resultInfo.AREA_CD);
        $NC.setValue("#edtArea_Nm", resultInfo.AREA_NM);
    } else {
        $NC.setValue("#edtArea_Cd");
        $NC.setValue("#edtArea_Nm");
        $NC.setFocus("#edtArea_Cd", true);
    }
}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "CAR_CD", true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 조회버튼 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB, "AREA_CD");

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 저장 처리 성공 했을 경우 처리
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "CAR_CD"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장 처리 실패 했을 경우 처리
 */
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
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDSUB);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 하단 그리드에서 선택한 행을 상단 그리드에 추가
 */
function btnAddCarOnClick() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    if (G_GRDSUB.view.getEditorLock().isActive()) {
        G_GRDSUB.view.getEditorLock().commitCurrentEdit();
    }

    // 선택 데이터 검색 -> Indexes
    var checkedRows = $NC.getGridSearchRows(G_GRDSUB, {
        searchKey: "CHECK_YN",
        searchVal: $ND.C_YES
    });
    if (checkedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC02040E0.009", "추가할 미등록 차량 데이터를 선택하십시오."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var AREA_CD = $NC.getValue("#edtArea_Cd");
    var AREA_NM = $NC.getValue("#edtArea_Nm");

    var rowCount = G_GRDMASTER.data.getLength();
    var addedCount = 0;
    var rowData, newRowData;
    G_GRDMASTER.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = checkedRows.length; rIndex < rCount; rIndex++) {
            // 선택 데이터
            rowData = G_GRDSUB.data.getItem(checkedRows[rIndex]);

            // 이미 추가된 차량이면 다음 데이터 처리
            if ($NC.getGridSearchRow(G_GRDMASTER, {
                searchKey: "CAR_CD",
                searchVal: rowData.CAR_CD
            }) != -1) {
                continue;
            }

            newRowData = {
                CENTER_CD: CENTER_CD,
                CAR_CD: rowData.CAR_CD,
                CAR_NM: rowData.CAR_NM,
                CAR_TON_DIV_F: rowData.CAR_TON_DIV_F,
                CAR_KEEP_DIV_F: rowData.CAR_KEEP_DIV_F,
                CAPACITY_CBM: rowData.CAPACITY_CBM,
                CAPACITY_WEIGHT: rowData.CAPACITY_WEIGHT,
                CAPACITY_BOX: rowData.CAPACITY_BOX,
                AREA_CD: AREA_CD,
                AREA_NM: AREA_NM,
                WORK_DIST: "0",
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };

            G_GRDMASTER.data.addItem(newRowData);
            addedCount++;
        }
    } finally {
        G_GRDMASTER.data.endUpdate();
    }

    if (addedCount == 0) {
        alert($NC.getDisplayMsg("JS.CMC02040E0.010", "선택한 차량은 이미 추가된 차량입니다."));
        return;
    }

    if ($NC.isNull(AREA_CD)) {
        $NC.setGridSelectRow(G_GRDMASTER, {
            selectRow: rowCount,
            activeCell: "AREA_CD",
            editMode: true
        });
    } else {
        $NC.setGridSelectRow(G_GRDMASTER, rowCount);
    }
    // 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
}

function btnEntryCarrefOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC02040E0.011", "복사할 기준 데이터가 없습니다.\n데이터조회 후 처리하십시오."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var AREA_CD = $NC.getValue("#edtQArea_Cd");
    var AREA_NM = $NC.getValue("#edtQArea_Nm");

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC02041P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC02041P0.001", "물류센터 차량 복사"),
        url: "cm/CMC02041P0.html",
        width: 610,
        height: 210,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_AREA_CD: AREA_CD,
            P_AREA_NM: AREA_NM
        },
        onOk: function(resultInfo) {
            $NC.setValue("#cboQCenter_Cd", resultInfo.CENTER_CD);
            _Inquiry();
        }
    });
}