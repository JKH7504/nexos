/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOM08010E0
 *  프로그램명         : 운송장관리[우체국][B2C]
 *  프로그램설명       : 운송장관리[우체국][B2C] 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-08-29
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-29    ASETEC           신규작성
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
                container: "#divSplitterArea1"
            },
            viewSecond: {
                container: "#divSplitterArea3"
            },
            viewType: "h",
            viewFixed: {
                container: "#divSplitterArea3",
                size: 330
            }
        },
        CARRIER_CD: "1020" // 우체국
    });

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
            // 출고차수 콤보 설정
            setOutboundBatchCombo();
        }
    });

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    // 출고차수 새로고침
    $("#btnOutbound_Batch").click(setOutboundBatchCombo);
    $("#btnInputCnt").click(btnInputCntClick);
    $("#btnPrintWbNoSub").click(btnPrintWbNoSubClick);
    $("#btnDelWbNo").click(btnDelWbNoClick);
    $("#btnNewWbNo").click(btnNewWbNoClick);

    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2");

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSub1Initialize();
    grdSub2Initialize();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divSplitterArea1", "v", 400, null, 500);
    $NC.setInitSplitter("#divSplitterArea2", "h", 450, 200, null);
}

// 화면 리사이즈 Offset 계산
function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    // Splitter 컨테이너 크기 조정
    $NC.resizeGrid("#grdMaster");
    $NC.resizeGrid("#grdDetail", null, $("#divGrdDetail").height() - $NC.G_LAYOUT.header - $("#ctrAdditional_grdDetail").outerHeight(true));
    $NC.resizeGrid("#grdSub1");
    $NC.resizeGrid("#grdSub2", null, $("#divSplitterArea3").height() - $NC.G_LAYOUT.header - $("#ctrAdditional_grdSub2").outerHeight(true));

}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            setOutboundBatchCombo();
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOM08010E0.001", "검색 시작일자를 정확히 입력하십시오."));
            setOutboundBatchCombo();
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOM08010E0.002", "검색 종료일자를 정확히 입력하십시오."));
            setOutboundBatchCombo();
            break;
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "DELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: "92", // 92 - 온라인몰
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
    }

    onChangingCondition();
}

function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDSUB1);
    $NC.clearGridData(G_GRDSUB2);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE1: OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: OUTBOUND_DATE2,
        P_OUTBOUND_BATCH: OUTBOUND_BATCH,
        P_DELIVERY_CD: DELIVERY_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/LOM08010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
 * PROGRAM_ID        : 프로그램ID         PROGRAM_SUB1_CD    : 프로그램하위코드
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
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_BATCH_F",
        field: "OUTBOUND_BATCH_F",
        name: "출고차수"
    });
    $NC.setGridColumn(columns, {
        id: "EQUIP_DIV_F",
        field: "EQUIP_DIV_F",
        name: "장비구분"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_CNT",
        field: "BOX_CNT",
        name: "박스수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ADD_BOX_CNT",
        field: "ADD_BOX_CNT",
        name: "출고수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_CNT",
        field: "OUTBOUND_CNT",
        name: "출고전표수량",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOM08010E0.RS_MASTER",
        sortCol: "OUTBOUND_DATE",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
        data: null
    });

    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
        P_DELIVERY_CD: $NC.getValue("#edtQDelivery_Cd", true),
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
        P_ITEM_CD: $NC.getValue("#edtQItem_Cd", true),
        P_ITEM_NM: $NC.getValue("#edtQItem_Nm", true)
    };
    // 데이터 조회
    $NC.serviceCall("/LOM08010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

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
        id: "CHUTE_NO",
        field: "CHUTE_NO",
        name: "슈트번호",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_DIV_F",
        field: "DISTRIBUTE_DIV_F",
        name: "유통구분"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
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
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_CNT",
        field: "BOX_CNT",
        name: "박스수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ADD_BOX_CNT",
        field: "ADD_BOX_CNT",
        name: "추가박스수량",
        cssClass: "styRight"
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
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LOM08010E0.RS_DETAIL",
        sortCol: "CHUTE_NO",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

function grdDetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDDETAIL, e, args);
            break;
    }
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAIL.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB1);
    onGetSub1({
        data: null
    });

    G_GRDSUB1.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LOM08010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB1), onGetSub1);

    $NC.setInitGridVar(G_GRDSUB2);
    onGetSub2({
        data: null
    });

    G_GRDSUB2.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LOM08010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB2), onGetSub2);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSub1OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "MARGIN_RATE",
        field: "MARGIN_RATE",
        name: "마진",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSub1Initialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub1", {
        columns: grdSub1OnGetColumns(),
        queryId: "LOM08010E0.RS_SUB1",
        sortCol: "LINE_NO",
        gridOptions: options
    });
    G_GRDSUB1.view.onSelectedRowsChanged.subscribe(grdSub1OnAfterScroll);
}

function grdSub1OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB1, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB1, row + 1);
}

function grdSub2OnGetColumns() {

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
        id: "BOX_NO",
        field: "BOX_NO",
        name: "박스번호",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DSP_WB_NO",
        field: "DSP_WB_NO",
        name: "송장번호"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSub2Initialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub2", {
        columns: grdSub2OnGetColumns(),
        queryId: "LOM08010E0.RS_SUB2",
        sortCol: "BOX_NO",
        gridOptions: options
    });
    G_GRDSUB2.view.onSelectedRowsChanged.subscribe(grdSub2OnAfterScroll);
    G_GRDSUB2.view.onHeaderClick.subscribe(grdSub2OnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDSUB2, "CHECK_YN");
}

function grdSub2OnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDSUB2, e, args);
            break;
    }
}

function grdSub2OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB2, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB2, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "OUTBOUND_DATE",
        "OUTBOUND_BATCH"
    ], true)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";
    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "OUTBOUND_DATE",
        "OUTBOUND_BATCH",
        "OUTBOUND_NO"
    ])) {
        // 서브 초기화
        $NC.setInitGridVar(G_GRDSUB1);
        onGetSub1({
            data: null
        });
        $NC.setInitGridVar(G_GRDSUB2);
        onGetSub2({
            data: null
        });
    }
}

function onGetSub1(ajaxData) {

    $NC.setInitGridData(G_GRDSUB1, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB1);
}

function onGetSub2(ajaxData) {

    $NC.setInitGridData(G_GRDSUB2, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB2);
}

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo() {

    // 조회조건 - 출고차수 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_OUTBOUND_BATCH_TERM",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_OUTBOUND_DATE1: $NC.getValue("#dtpQOutbound_Date1"),
            P_OUTBOUND_DATE2: $NC.getValue("#dtpQOutbound_Date2"),
            P_OUTBOUND_DIV: "2" // 출고작업구분(1:B2B, 2:B2C, 3:B2CF)
        }
    }, {
        selector: "#cboQOutbound_Batch",
        codeField: "OUTBOUND_BATCH",
        nameField: "OUTBOUND_BATCH",
        fullNameField: "OUTBOUND_BATCH_F",
        addAll: true
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

function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setValue("#edtQCust_Cd");
        $NC.setFocus("#edtQBu_Cd", true);
    }

    setOutboundBatchCombo();

    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");

    $NP.showBuBrandPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: $ND.C_ALL
    }, onBuBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onBuBrandPopup(resultInfo) {

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

function showDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        title: $NC.getDisplayMsg("JS.LOM08010E0.007", "온라인몰 검색"),
        columnTitle: [
            "온라인몰코드",
            "온라인몰명"
        ],
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: "92", // 92 - 온라인몰
            P_VIEW_DIV: "2"
        }
    }, onDeliveryPopup, function() {
        $NC.setFocus("#edtQDelivery_Cd", true);
    });
}

function onDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQDelivery_Cd");
        $NC.setValue("#edtQDelivery_Nm");
        $NC.setFocus("#edtQDelivery_Cd", true);
    }
    onChangingCondition();
}

/**
 * 수량입력 버튼 클릭 이벤트 처리
 */
function btnInputCntClick() {

    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
        G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
    }

    var rCount = G_GRDDETAIL.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    var BOX_CNT = $NC.getValue("#edtBox_Cnt");
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        var rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        rowData.ADD_BOX_CNT = BOX_CNT;
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    }
}

/**
 * 운송장번호 생성 버튼 클릭 이벤트 처리
 */
function btnNewWbNoClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.009", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var rCount = G_GRDDETAIL.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOM08010E0.010", "운송장 생성 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [];
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        var rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
            P_CREATE_WB_CNT: rowData.ADD_BOX_CNT
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.011", "운송장번호 생성 할 데이터를 선택하십시오."));
        return;
    }

    $NC.serviceCall("/LOM08010E0/callCreateManualWb.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 운송장출력 버튼 클릭 이벤트 처리
 */
function btnPrintWbNoSubClick(btnNm) {

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    var rCount = G_GRDSUB2.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    var checkedData = [];
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDSUB2.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedData.push(rowData.OUTBOUND_NO + ";" + rowData.BOX_NO + ";" + $ND.C_YES);
    }

    if (checkedData.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.012", "운송장출력 할 박스번호를 선택하십시오."));
        return;
    }

    // 레포트별 출력 데이터 세팅
    rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    var queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_CARRIER_CD: $NC.G_VAR.CARRIER_CD
    };

    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: "lo/LABEL_LOM_POST_WAYBILL01",
        reportTitle: "택배송장(우체국)",
        queryId: "WR1.RS_LABEL_LOM_POST_WAYBILL02",
        queryParams: queryParams,
        internalQueryYn: $ND.C_NO,
        checkedValue: $NC.toJoin(checkedData)
    };

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);

}

/**
 * 운송장삭제 버튼 클릭 이벤트 처리
 */
function btnDelWbNoClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.013", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    var rCount = G_GRDSUB2.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOM08010E0.014", "운송장 삭제 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDSUB2.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
            P_WB_NO: rowData.WB_NO
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM08010E0.015", "삭제할 데이터를 선택하십시오."));
        return;
    }

    $NC.serviceCall("/LOM08010E0/callDeleteManualWb.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }

        alert($NC.getDisplayMsg("JS.LOM08010E0.016", "운송장 삭제 완료 하였습니다."));

        var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        G_GRDDETAIL.queryParams = {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
            P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
            P_DELIVERY_CD: $NC.getValue("#edtQDelivery_Cd", true),
            P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
            P_ITEM_CD: $NC.getValue("#edtQItem_Cd", true),
            P_ITEM_NM: $NC.getValue("#edtQItem_Nm", true)
        };
        // 데이터 조회
        $NC.serviceCall("/LOM08010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
    });
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    alert($NC.getDisplayMsg("JS.LOM08010E0.017", "운송장번호생성 완료 하였습니다."));
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnable("#btnInputCnt", permission.canSave && enable);
    $NC.setEnable("#btnNewWbNo", permission.canSave && enable);
    $NC.setEnable("#btnPrintWbNoSub", enable);
    $NC.setEnable("#btnDelWbNo", permission.canSave && enable);
}
