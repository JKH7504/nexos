/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC09010E0
 *  프로그램명         : 작업일자관리
 *  프로그램설명       : 작업일자관리 화면 Javascript
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

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setInitMonthPicker("#mtpQInout_Month");
    $NC.setValue("#rgbQYm_Div1", "1");

    // 초기 비활성화 처리
    $NC.setEnable("#btnCopy", false);
    $NC.setEnable("#btnCreate", false);

    // 이벤트 연결
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnCopy").click(btnCopyOnClick);
    $("#btnCreate").click(btnCreateOnClick);

    // 그리드 초기화
    grdMasterInitialize();

    // 콤보박스 초기화
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

    $NC.setEnable("#btnCopy", false);
    $NC.setEnable("#btnCreate", false);
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
        case "INOUT_MONTH":
            $NC.setValueMonthPicker(view, val, $NC.getDisplayMsg("JS.CMC09010E0.001", "작업월을 정확히 입력하십시오."));
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INOUT_MONTH = $NC.getValue("#mtpQInout_Month");
    if ($NC.isNull(INOUT_MONTH)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.004", "작업월를 입력하십시오."));
        $NC.setFocus("#mtpQInout_Month");
        return;
    }
    var YM_DIV = $NC.getValueRadioGroup("#rgbQYm_Div");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INOUT_MONTH: INOUT_MONTH + "-01",
        P_YM_DIV: YM_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/CMC09010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        alert($NC.getDisplayMsg("JS.CMC09010E0.005", "저장할 데이터가 없습니다."));
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
            P_INOUT_DATE: rowData.INOUT_DATE,
            P_HOLIDAY_DIV: rowData.HOLIDAY_DIV,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.006", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC09010E0/save.do", {
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

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "INOUT_DATE",
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
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "작업일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DY",
        field: "DY",
        name: "요일",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "HOLIDAY_DIV_F",
        field: "HOLIDAY_DIV_F",
        name: "휴일구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "HOLIDAY_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "HOLIDAY_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
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
        frozenColumn: 1,
        specialRow: {
            compareKey: "HOLIDAY_DIV",
            compareVal: "1",
            compareOperator: "==",
            cssClass: "stySpecial"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC09010E0.RS_MASTER",
        sortCol: "INOUT_DATE",
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

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.HOLIDAY_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC09010E0.007", "휴일구분을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "HOLIDAY_DIV_F", true);
            return false;
        }
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

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "INOUT_DATE", true);

    $NC.setEnable("#btnCopy");
    $NC.setEnable("#btnCreate");

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "INOUT_DATE"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function btnCreateOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INOUT_MONTH = $NC.getValue("#mtpQInout_Month");
    if ($NC.isNull(INOUT_MONTH)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.004", "작업월를 입력하십시오."));
        $NC.setFocus("#mtpQInout_Month");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC09012P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC09012P0.001", "작업일자 생성"),
        url: "cm/CMC09012P0.html",
        width: 400,
        height: 265,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_MONTH: INOUT_MONTH + "-01"
        },
        onOk: function() {

            $NC.setFocus("#mtpQInout_Month", true);
            _Inquiry();
        }
    });
}

function btnCopyOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INOUT_MONTH = $NC.getValue("#mtpQInout_Month");
    if ($NC.isNull(INOUT_MONTH)) {
        alert($NC.getDisplayMsg("JS.CMC09010E0.004", "작업월를 입력하십시오."));
        $NC.setFocus("#mtpQInout_Month");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC09011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC09011P0.001", "작업일자 복사"),
        url: "cm/CMC09011P0.html",
        width: 400,
        height: 200,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INOUT_MONTH: INOUT_MONTH + "-01"
        },
        onOk: function() {

            $NC.setFocus("#mtpQInout_Month", true);
            _Inquiry();
        }
    });
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
