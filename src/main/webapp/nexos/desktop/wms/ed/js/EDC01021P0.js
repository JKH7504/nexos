﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDC01021P0
 *  프로그램명         : 사업부코드매핑복사 팝업
 *  프로그램설명       : 사업부코드매핑복사 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-09-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-09-14    ASETEC           신규작성
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
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: 360
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 버튼 클릭 이벤트 연결
    $("#btnTo_Bu_Cd").click(showUserBuPopup);
    $("#btnOk").click(_Save);
    $("#btnCancel").click(onCancel);

    // 복사구분 세팅
    $NC.setInitComboData({
        selector: "#cboCreate_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        data: [
            {
                COMMON_CD: "1",
                COMMON_NM: $NC.getDisplayMsg("JS.EDC01021P0.002", "삭제 후 생성")
            },
            {
                COMMON_CD: "2",
                COMMON_NM: $NC.getDisplayMsg("JS.EDC01021P0.003", "미존재 코드만 생성")
            }
        ],
        onComplete: function() {
            $NC.setValue("#cboCreate_Div", "1");
        }
    });
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtQBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);

    _Inquiry();

    $NC.setFocus("#edtTo_Bu_Cd");
}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 조회
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD
    };
    // 데이터 조회
    $NC.serviceCall("/EDC01020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        alert($NC.getDisplayMsg("JS.EDC01021P0.004", "조회 후 처리하십시오."));
        return;
    }

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    // 선택 데이터 가져오기
    var checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
        valueColumns: "IF_CODE_GRP"
    });

    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.EDC01021P0.005", "복사할 코드매핑 코드를 선택하십시오."));
        return;
    }

    var TO_BU_CD = $NC.getValue("#edtTo_Bu_Cd");
    if ($NC.isNull(TO_BU_CD)) {
        alert($NC.getDisplayMsg("JS.EDC01021P0.006", "사업부를 입력하십시오."));
        $NC.setFocus("#edtTo_Bu_Cd");
        return;
    }

    if (TO_BU_CD == $NC.G_VAR.G_PARAMETER.P_BU_CD) {
        alert($NC.getDisplayMsg("JS.EDC01021P0.007", "기준 사업부와 대상 사업부가 같습니다. 다른 사업부를 선택하십시오."));
        $NC.setFocus("#edtTo_Bu_Cd");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.EDC01021P0.008", "선택한 코드매핑 데이터를 복사하시겠습니까?"))) {
        return;
    }

    var CREATE_DIV = $NC.getValue("#cboCreate_Div");

    $NC.serviceCall("/EDC01020E0/callEMInterfaceCopy.do", {
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_TO_BU_CD: TO_BU_CD,
        P_CREATE_DIV: CREATE_DIV,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

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

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "TO_BU_CD":
            if (val == $ND.C_BASE_BU_CD) {
                $NC.setValue("#edtTo_Bu_Nm", $ND.C_BASE_NM);
                break;
            } else {
                $NP.onUserBuChange(val, {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_BU_CD: val
                }, onUserBuPopup, {
                    addBase: $ND.C_BASE_BU_CD
                });
                return;
            }
    }
}

function grdMasterOnGetColumns() {

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
        id: "IF_CODE_GRP",
        field: "IF_CODE_GRP",
        name: "IF그룹코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "IF_CODE_GRP_D",
        field: "IF_CODE_GRP_D",
        name: "IF그룹명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "EDC01020E0.RS_MASTER",
        sortCol: "IF_CODE_GRP",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

function grdMasterOnClick(e, args) {

    var columnId = G_GRDMASTER.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTER, e, args);
            break;
    }
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    // var rowData = G_GRDMASTER.data.getItem(row);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        queryParams: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: $ND.C_ALL
        },
        addBase: $ND.C_BASE_BU_CD
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtQTo_Bu_Cd", true);
    });
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "IF_CODE_GRP", true);
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtTo_Bu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtTo_Bu_Nm", resultInfo.BU_NM);
    } else {
        $NC.setValue("#edtTo_Bu_Cd");
        $NC.setValue("#edtTo_Bu_Nm");
        $NC.setFocus("#edtTo_Bu_Cd", true);
    }
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */

function onSave(ajaxData) {
    onClose();
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
        case "CHECK_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}