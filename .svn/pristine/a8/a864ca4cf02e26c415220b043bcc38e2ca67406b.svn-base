/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC05010E0
 *  프로그램명         : 월지입료관리
 *  프로그램설명       : 월지입료관리 화면(일반) Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2020-10-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-10-07    ASETEC           신규작성
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
            CM510: "", // 운송권역 관리정책
            CM520: "" // 월지입료 관리정책
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

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

    $NC.setInitMonthPicker("#mtpQAdjust_Month");

    // 초기 비활성화 처리
    $NC.setEnable("#btnCreateData", false);

    // 버튼 이벤트 연결
    $("#btnBwClosingMonth").click(btnBwClosingMonthOnClick);
    $("#btnCreateData").click(btnCreateDataOnClick);
    $("#btnIntermediateClosing").click(btnIntermediateClosingOnClick);

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // 월지입료 관리정책 : 1-물류센터별 관리
        if ($NC.G_VAR.policyVal.CM520 == $ND.C_POLICY_VAL_1) {
            $NC.setVisible("#divQCenter_Cd", true);
            $NC.setVisible("#btnBwClosingMonth", true);
            $NC.setVisible("#btnIntermediateClosing", true);

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
            // 월지입료 관리정책 : 2-통합 관리
        } else {
            $NC.setVisible("#divQCenter_Cd", false);
            $NC.setVisible("#btnBwClosingMonth", false);
            $NC.setVisible("#btnIntermediateClosing", false);

            $NC.setInitComboData({
                selector: "#cboQCenter_Cd",
                codeField: "CENTER_CD",
                nameField: "CENTER_NM",
                data: [
                    {
                        CENTER_CD: "*",
                        CENTER_NM: $NC.getDisplayMsg("JS.LDC05010E0.001", "전체")
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

    $NC.setEnable("#btnBwClosingMonth", permission.canSave && enable);
    $NC.setEnable("#btnIntermediateClosing", permission.canSave && enable);

}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);

    $NC.setInitTopButtons();

    $NC.setEnable("#btnCreateData", false);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "ADJUST_MONTH":
            $NC.setValueMonthPicker(view, val, $NC.getDisplayMsg("JS.LDC05010E0.002", "정산월을 정확히 입력하십시오."));
            break;
    }

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
        alert($NC.getDisplayMsg("JS.LDC05010E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var ADJUST_MONTH = $NC.getValue("#mtpQAdjust_Month");
    if ($NC.isNull(ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LDC05010E0.004", "정산월을 선택하십시오."));
        $NC.setFocus("#mtpQAdjust_Month");
        return;
    }

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_ADJUST_MONTH: ADJUST_MONTH + "-01",
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC05010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        alert($NC.getDisplayMsg("JS.LDC05010E0.005", "기초데이터 생성하십시오."));
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
            P_ADJUST_MONTH: rowData.ADJUST_MONTH,
            P_CAR_CD: rowData.CAR_CD,
            P_RUNNING_CNT: rowData.RUNNING_CNT,
            P_TOLL_COST: rowData.TOLL_COST,
            P_DELIVERY_COST: rowData.DELIVERY_COST,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC05010E0.006", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LDC05010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

    var columns = [];
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
        name: "톤구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_KEEP_DIV_F",
        field: "CAR_KEEP_DIV_F",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "운송권역명"
    });
    $NC.setGridColumn(columns, {
        id: "RUNNING_CNT",
        field: "RUNNING_CNT",
        name: "운행횟수",
        editor: Slick.Editors.Text,
        cssClass: "styRight",
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "TOLL_COST",
        field: "TOLL_COST",
        name: "도로비",
        editor: Slick.Editors.Number,
        cssClass: "styRight",
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_COST",
        field: "DELIVERY_COST",
        name: "지입료",
        editor: Slick.Editors.Number,
        cssClass: "styRight",
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
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
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LDC05010E0.RS_MASTER",
        sortCol: "CAR_CD",
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

    if (rowData.CONFIRM_YN == $ND.C_YES) {
        switch (args.column.id) {
            case "RUNNING_CNT":
            case "TOLL_COST":
            case "DELIVERY_COST":
            case "REMARK1":
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
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "CAR_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.RUNNING_CNT)) {
            alert($NC.getDisplayMsg("JS.LDC05010E0.007", "운행횟수를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "RUNNING_CNT", true);
            return false;
        }
        if ($NC.isNull(rowData.TOLL_COST)) {
            alert($NC.getDisplayMsg("JS.LDC05010E0.008", "도로비를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "TOLL_COST", true);
            return false;
        }
        if ($NC.isNull(rowData.DELIVERY_COST)) {
            alert($NC.getDisplayMsg("JS.LDC05010E0.009", "지입료를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "DELIVERY_COST", true);
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
    $NC.setInitGridAfterOpen(G_GRDMASTER, "CAR_CD", true);

    $NC.setEnable("#btnCreateData");

    setTopButtons();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "CAR_CD"
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

function setTopButtons() {

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 월마감 취소 버튼 호출
 */
function btnBwClosingMonthOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

    var ADJUST_MONTH = $NC.getValue("#mtpQAdjust_Month");
    if ($NC.isNull(ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LDC05010E0.004", "정산월을 선택하십시오."));
        $NC.setFocus("#mtpQAdjust_Month");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC05010E0.010", "월마감 취소 처리하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LDC05010E0/callLDBwClosingMonthly.do", {
        P_CENTER_CD: CENTER_CD,
        P_ADJUST_MONTH: ADJUST_MONTH + "-01",
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        alert($NC.getDisplayMsg("JS.LDC05010E0.011", "월마감 취소 처리되었습니다."));
        _Inquiry();
    });
}

/**
 * 운행일지 중간마감 버튼 호출.
 */
function btnIntermediateClosingOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");

    var ADJUST_MONTH = $NC.getValue("#mtpQAdjust_Month");
    if ($NC.isNull(ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LDC05010E0.004", "정산월을 선택하십시오."));
        $NC.setFocus("#mtpQAdjust_Month");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LDC05012P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LDC05012P0.001", "운행일지 중간마감"),
        url: "ld/LDC05012P0.html",
        width: 300,
        height: 250,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_ADJUST_MONTH: ADJUST_MONTH,
            P_PERMISSION: permission
        },
        onOk: function() {
            _Inquiry();
        }
    });
}

/**
 * 기초데이터 생성 버튼 호출.
 */
function btnCreateDataOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");

    var ADJUST_MONTH = $NC.getValue("#mtpQAdjust_Month");
    if ($NC.isNull(ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LDC05010E0.004", "정산월을 선택하십시오."));
        $NC.setFocus("#mtpQAdjust_Month");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LDC05011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LDC05011P0.001", "기초데이터 생성"),
        url: "ld/LDC05011P0.html",
        width: 300,
        height: 200,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_ADJUST_MONTH: ADJUST_MONTH,
            P_POLICY_CM520: $NC.G_VAR.policyVal.CM520,
            P_PERMISSION: permission
        },
        onOk: function() {
            _Inquiry();
        }
    });
}