/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOM07060E0
 *  프로그램명         : CJ택배정산데이터업로드
 *  프로그램설명       : CJ택배정산데이터업로드 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-05-06
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-05-06    ASETEC           신규작성
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
        // 입출고서브구분
        INOUT_SUB_CD1: $ND.C_INOUT_GRP_DM,
        INOUT_SUB_CD2: ""
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 물류센터 세팅
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
            $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
        }
    });

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    $NC.setInitMonthPicker("#mtpAdjust_Month", $NC.addMonth($NC.G_USERINFO.LOGIN_DATE, -1));

    // 사업부 검색 이미지 클릭
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnEntryXLS").click(btnEntryXLSOnClick);
    $NC.setEnable("#btnEntryXLS", false);
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
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "ADJUST_MONTH":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB07060E0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
    }

    // 조회 조건에 Object Change
    onChangingCondition();
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);

    $NC.setEnable("#btnEntryXLS", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07060E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07060E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var ADJUST_MONTH = $NC.getValue("#mtpAdjust_Month");
    if ($NC.isNull(ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LOM07060E0.004", "정산월을 입력하십시오."));
        $NC.setFocus("#mtpAdjust_Month");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ADJUST_MONTH: ADJUST_MONTH + "-01"
    };
    // 데이터 조회
    $NC.serviceCall("/LOM07060E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "WB_BOX_DIV_F",
        field: "WB_BOX_DIV_F",
        name: "택배박스구분"
    });
    $NC.setGridColumn(columns, {
        id: "WB_ADD_AMT",
        field: "WB_ADD_AMT",
        name: "택배추가수수료금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_CD",
        field: "CARRIER_CD",
        name: "운송사"
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_NM",
        field: "CARRIER_NM",
        name: "운송사명"
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_MONTH",
        field: "ADJUST_MONTH",
        name: "정산월",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ZIP_CD",
        field: "SHIPPER_ZIP_CD",
        name: "수령자우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "수령자주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 4,
        specialRow: {
            compareKey: "SHORTAGE_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styLack"
        },
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOM07060E0.RS_MASTER",
        sortCol: [
            "ITEM_CD",
            "BRAND_CD"
        ],
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

/**
 * CJ택배정산데이터업로드 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setEnable("#btnEntryXLS", $NC.getProgramPermission().canSave);
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

function btnEntryXLSOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.LOM07060E0.005", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07060E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07060E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var ADJUST_MONTH = $NC.getValue("#mtpAdjust_Month");
    if ($NC.isNull(ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LOM07060E0.004", "정산월을 선택하십시오."));
        $NC.setFocus("#mtpAdjust_Month");
        return;
    }

    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var BU_NM = $NC.getValue("#edtQBu_Nm");

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LOM07061P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LOM07061P0.001", "엑셀 등록"),
        url: "lo/LOM07061P0.html",
        width: 1024,
        height: 610,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_BU_CD: BU_CD,
            P_BU_NM: BU_NM,
            P_ADJUST_MONTH: ADJUST_MONTH
        },
        onOk: function() {
            _Inquiry();
        }
    });
}