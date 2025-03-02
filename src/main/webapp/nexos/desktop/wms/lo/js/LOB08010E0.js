/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB08010E0
 *  프로그램명         : 운송장관리[한덱스]
 *  프로그램설명       : 운송장관리[한덱스] 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-08-28
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-28    ASETEC           신규작성
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
        CARRIER_CD: null,
        WB_REPORT_DOC_URL: null,
        WB_REPORT_CD: null,
        WB_REPORT_QUERY_ID: null
    // 송장번호별
    });
    var programId = $NC.G_JWINDOW.get("G_PARAMETER").PROGRAM_ID;
    if (programId === "LOB08010E0") {
        $NC.G_VAR.CARRIER_CD = "1010"; // 한덱스
        $NC.G_VAR.WB_REPORT_DOC_URL = "lo/LABEL_LO_HANDEX_WAYBILL01";
        $NC.G_VAR.WB_REPORT_CD = "LABEL_LO03";
        $NC.G_VAR.WB_REPORT_QUERY_ID = "WRLABEL.RS_LABEL_LO_HANJIN_WAYBILL01"; // 출고번호
        $("#tdCreateAssortWb").show();
    } else if (programId === "LOB08011E0") {
        $NC.G_VAR.CARRIER_CD = "1030"; // 세이프티
        $NC.G_VAR.WB_REPORT_DOC_URL = "lo/LABEL_LO_SAFETY_WAYBILL01";
        $NC.G_VAR.WB_REPORT_CD = "LABEL_LO05";
        $NC.G_VAR.WB_REPORT_QUERY_ID = "WRLABEL.RS_LABEL_LO_SAFETY_WAYBILL01"; // 출고번호
        $("#tdCreateAssortWb").hide();
    } else if (programId === "LOB08012E0") {
        $NC.G_VAR.CARRIER_CD = "1010"; // CJ
        $NC.G_VAR.WB_REPORT_DOC_URL = "lo/LABEL_LOM_CJ_WAYBILL_01";
        $NC.G_VAR.WB_REPORT_CD = "LABEL_LOB06";
        $NC.G_VAR.WB_REPORT_QUERY_ID = "WRLABEL.RS_LOB_WB_CJ_03"; // 출고번호
        $("#tdCreateAssortWb").show();
    }

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

    // 조회조건 - 장비구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "EQUIP_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQEquip_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });

    // 어소트코드 콤보 초기값 세팅
    setAssortCdCombo();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnQRDelivery_Cd").click(showRDeliveryPopup);
    // 출고차수 새로고침
    $("#btnOutbound_Batch").click(setOutboundBatchCombo);
    $("#btnCreateAssortWb").click(btnCreateAssortWbClick);
    $("#btnInputCnt").click(btnInputCntClick);
    $("#btnPrintReceipt").click(btnPrintReceiptClick);
    $("#btnPrintWbNoDetail").click(function() {
        btnPrintWbNoDetailClick("btnPrintWbNoDetail");
    });
    $("#btnPrintWbNoSub").click(function() {
        btnPrintWbNoDetailClick("btnPrintWbNoSub");
    });
    $("#btnDelWbNo").click(btnDelWbNoClick);
    $("#btnNewWbNo").click(btnNewWbNoClick);

    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2");

    $NC.setEnable("#btnCreateAssortWb", false);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSub1Initialize();
    grdSub2Initialize();

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();

}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divSplitterArea1", "v", 400, null, 700);
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
    $NC.resizeGrid("#grdDetail");
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
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB08010E0.001", "검색 시작일자를 정확히 입력하십시오."));
            setOutboundBatchCombo();
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB08010E0.002", "검색 종료일자를 정확히 입력하십시오."));
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
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
        case "RDELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onRDeliveryPopup);
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

    // 어소트코드 콤보 초기화
    setAssortCdCombo();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "ASSORT_CD":
            // 조회시 전역 변수 값 초기화
            $NC.setInitGridVar(G_GRDDETAIL);
            onGetDetail({
                data: null
            });

            var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
            G_GRDDETAIL.queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
                P_DELIVERY_CD: $NC.getValue("#edtQDelivery_Cd", true),
                P_RDELIVERY_CD: $NC.getValue("#edtQRDelivery_Cd", true),
                P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
                P_ITEM_CD: $NC.getValue("#edtQItem_Cd", true),
                P_ITEM_NM: $NC.getValue("#edtQItem_Nm", true),
                P_ITEM_LOT: $NC.getValue("#cboAssort_Cd")
            };

            // 변경된 어소트코드로 재조회
            $NC.serviceCall("/LOB08010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
    var EQUIP_DIV = $NC.getValue("#cboQEquip_Div");
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
        P_RDELIVERY_CD: RDELIVERY_CD,
        P_EQUIP_DIV: EQUIP_DIV,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/LOB08010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    var columns = [ ];
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
        queryId: "LOB08010E0.RS_MASTER",
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

    // 어소트코드 콤보 세팅
    setAssortCdCombo(row);

    $NC.setEnable("#btnCreateAssortWb", rowData.EQUIP_DIV == "40" || rowData.EQUIP_DIV == "50");
    if (rowData.EQUIP_DIV == "40" || rowData.EQUIP_DIV == "50") {
        $("#btnCreateAssortWb").attr("value", rowData.EQUIP_DIV == "40" ? "어소트초도분 운송장 생성" : "솔리드초도분 운송장 생성");
    }

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
        P_RDELIVERY_CD: $NC.getValue("#edtQRDelivery_Cd", true),
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
        P_ITEM_CD: $NC.getValue("#edtQItem_Cd", true),
        P_ITEM_NM: $NC.getValue("#edtQItem_Nm", true),
        P_ITEM_LOT: $NC.getValue("#cboAssort_Cd")
    };
    // 데이터 조회
    $NC.serviceCall("/LOB08010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [ ];
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
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
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
        queryId: "LOB08010E0.RS_DETAIL",
        sortCol: "OUTBOUND_DATE",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
    G_GRDDETAIL.view.onClick.subscribe(grdDetailOnClick);
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
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_ITEM_LOT: $NC.getValue("#cboAssort_Cd")
    };
    // 데이터 조회
    $NC.serviceCall("/LOB08010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB1), onGetSub1);

    $NC.setInitGridVar(G_GRDSUB2);
    onGetSub2({
        data: null
    });

    G_GRDSUB2.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_ITEM_LOT: $NC.getValue("#cboAssort_Cd")
    };
    // 데이터 조회
    $NC.serviceCall("/LOB08010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB2), onGetSub2);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdDetailOnClick(e, args) {

    var columnId = G_GRDDETAIL.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDDETAIL, e, args);
            break;
    }
}

function grdSub1OnGetColumns() {

    var columns = [ ];
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
        queryId: "LOB08010E0.RS_SUB1",
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

    var columns = [ ];
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
        queryId: "LOB08010E0.RS_SUB2",
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
            P_OUTBOUND_DIV: "1" // 출고작업구분(1:B2B, 2:B2C, 3:B2CF)
        }
    }, {
        selector: "#cboQOutbound_Batch",
        codeField: "OUTBOUND_BATCH",
        nameField: "OUTBOUND_BATCH",
        fullNameField: "OUTBOUND_BATCH_F",
        addAll: true
    });
}

function setAssortCdCombo(row) {

    if ($NC.isNotNull(row)) {
        var rowData = G_GRDMASTER.data.getItem(row);
        $NC.setInitCombo("/LOB08010E0/getDataSet.do", {
            P_QUERY_ID: "LOB08010E0.RS_SUB9",
            P_QUERY_PARAMS: {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
                P_DELIVERY_CD: $NC.getValue("#edtQDelivery_Cd", true),
                P_RDELIVERY_CD: $NC.getValue("#edtQRDelivery_Cd", true),
                P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
                P_ITEM_CD: $NC.getValue("#edtQItem_Cd", true),
                P_ITEM_NM: $NC.getValue("#edtQItem_Nm", true)
            }
        }, {
            selector: "#cboAssort_Cd",
            codeField: "ITEM_LOT",
            nameField: "ITEM_LOT_D",
            fullNameField: "ITEM_LOT_F",
            addAll: true
        });
    } else {
        $NC.setInitComboData({
            selector: "#cboAssort_Cd",
            data: [
                {
                    COMMON_CD: $ND.C_ALL,
                    COMMON_NM: $NC.getDisplayMsg("JS.LOB08010E0.007", "전체")
                }
            ],
            codeField: "COMMON_CD",
            nameField: "COMMON_NM"
        });
    }
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

    // 배송처 조회조건 초기화
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    // 실배송처 조회조건 초기화
    $NC.setValue("#edtQRDelivery_Cd");
    $NC.setValue("#edtQRDelivery_Nm");
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
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: $ND.C_ALL,
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

function showRDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onRDeliveryPopup, function() {
        $NC.setFocus("#edtQRDelivery_Cd", true);
    });
}

function onRDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQRDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQRDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQRDelivery_Cd");
        $NC.setValue("#edtQRDelivery_Nm");
        $NC.setFocus("#edtQRDelivery_Cd", true);
    }
    onChangingCondition();
}

/**
 * 어소트초도분 운송장 생성 버튼 클릭 이벤트 처리
 */
function btnCreateAssortWbClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    if (confirm($NC.getDisplayMsg("JS.LOB08010E0.009", "어소트초도분 운송장 생성 하시겠습니까?"))) {
        return;
    }

    // 어소트초도분/솔리드초도분 구분값 넘겨, 자바에서 SP 호출함
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.serviceCall("/LOB08010E0/callCreateAssortInit.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
        P_EQUIP_DIV: rowData.EQUIP_DIV,
        P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        alert($NC.getDisplayMsg("JS.LOB08010E0.010", "어소트초도분 운송장 생성 완료 하였습니다."));
        _Inquiry();
    });
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
        alert($NC.getDisplayMsg("JS.LOB08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    var BOX_CNT = $NC.getValue("#edtBox_Cnt");
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
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
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var rCount = G_GRDDETAIL.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOB08010E0.011", "운송장 생성 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [ ];
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
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
        alert($NC.getDisplayMsg("JS.LOB08010E0.012", "운송장번호 생성 할 데이터를 선택하십시오."));
        return;
    }

    var refRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    $NC.serviceCall("/LOB08010E0/callCreateManualWb.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        G_GRDSUB2.queryParams = {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: refRowData.OUTBOUND_NO,
            P_ITEM_LOT: $NC.getValue("#cboAssort_Cd")
        };
        // 데이터 조회
        $NC.serviceCall("/LOB08010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB2), onGetSub2);
    });
}

/**
 * 거래명세서 버튼 클릭 이벤트 처리
 */
function btnPrintReceiptClick() {

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    var checkedData = $NC.getGridCheckedValues(G_GRDDETAIL, {
        valueColumns: "OUTBOUND_NO"
    });

    // 선택 건수 체크
    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.013", "출력할 데이터를 선택하십시오.", ""));
        return;
    }

    printWbBill("SPEC_LOB01", checkedData.values);
}

/**
 * 운송장출력 버튼 클릭 이벤트 처리
 */
function btnPrintWbNoDetailClick(btnNm) {

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    var checkedData = [ ];
    var message, rowData, rIndex, rCount;
    // 박스번호별 출력
    if (btnNm == "btnPrintWbNoSub") {
        rCount = G_GRDSUB2.data.getLength();
        if (rCount == 0) {
            alert($NC.getDisplayMsg("JS.LOB08010E0.008", "조회 후 처리 하십시오."));
            return;
        }
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = G_GRDSUB2.data.getItem(rIndex);
            if (rowData.CHECK_YN != $ND.C_YES) {
                continue;
            }
            checkedData.push(rowData.OUTBOUND_DATE + ";" + rowData.OUTBOUND_NO + ";" + rowData.BOX_NO);
        }
        message = "박스번호";

        $NC.G_VAR.WB_REPORT_QUERY_ID = "WRLABEL.RS_LOB_WB_CJ_02";
    }
    // 출고번호별 출력
    else {
        rCount = G_GRDDETAIL.data.getLength();
        for (rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = G_GRDDETAIL.data.getItem(rIndex);
            if (rowData.CHECK_YN != $ND.C_YES) {
                continue;
            }
            checkedData.push(rowData.OUTBOUND_NO);
        }
        message = "출고번호";
        $NC.G_VAR.WB_REPORT_QUERY_ID = "WRLABEL.RS_LOB_WB_CJ_03";
    }

    if (checkedData.length == 0) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.014", "운송장출력 할 " + message + "를 선택하십시오.", message));
        return;
    }

    printWbBill($NC.G_VAR.WB_REPORT_CD, checkedData);
}

/**
 * 운송장삭제 버튼 클릭 이벤트 처리
 */
function btnDelWbNoClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    var rCount = G_GRDSUB2.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LOB08010E0.008", "조회 후 처리 하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOB08010E0.015", "운송장 삭제 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [ ];
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
        alert($NC.getDisplayMsg("JS.LOB08010E0.016", "삭제할 데이터를 선택하십시오."));
        return;
    }

    $NC.serviceCall("/LOB08010E0/callDeleteManualWb.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }

        alert($NC.getDisplayMsg("JS.LOB08010E0.017", "운송장 삭제 완료 하였습니다."));

        var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        G_GRDDETAIL.queryParams = {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
            P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
            P_DELIVERY_CD: $NC.getValue("#edtQDelivery_Cd", true),
            P_RDELIVERY_CD: $NC.getValue("#edtQRDelivery_Cd", true),
            P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
            P_ITEM_CD: $NC.getValue("#edtQItem_Cd", true),
            P_ITEM_NM: $NC.getValue("#edtQItem_Nm", true),
            P_ITEM_LOT: $NC.getValue("#cboAssort_Cd")
        };
        // 데이터 조회
        $NC.serviceCall("/LOB08010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
    });
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    alert($NC.getDisplayMsg("JS.LOB08010E0.018", "운송장번호생성 완료 하였습니다."));
}

function printWbBill(reportCd, checkedData) {

    var REPORT_QUERY_ID;
    var REPORT_DOC_URL;
    var REPORT_TITLE;
    var INTERNAL_QUERY_YN = $ND.C_NO;

    // 레포트별 출력 데이터 세팅
    var queryParams, rowData;
    switch (reportCd) {
        // LABEL_LO03 - 택배송장(한진)
        // LABEL_LO05 - 택배송장(세이프티)
        case "LABEL_LO03":
        case "LABEL_LO05":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                P_ASSORT_CD: $NC.getValue("#cboAssort_Cd"),
                P_CARRIER_CD: $NC.G_VAR.CARRIER_CD
            };
            REPORT_QUERY_ID = $NC.G_VAR.WB_REPORT_QUERY_ID;
            REPORT_DOC_URL = $NC.G_VAR.WB_REPORT_DOC_URL;
            REPORT_TITLE = "택배송장";
            break;
        case "LABEL_LOB06":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                P_POLICY_LO450: "1"
            };
            REPORT_QUERY_ID = $NC.G_VAR.WB_REPORT_QUERY_ID;
            REPORT_DOC_URL = $NC.G_VAR.WB_REPORT_DOC_URL;
            REPORT_TITLE = "택배송장";
            break;
        // SPEC_LOB01 - 거래명세서
        case "SPEC_LOB01":
            // 선택 데이터 가져오기
            rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_OUTBOUND_DATE: rowData.OUTBOUND_DATE
            };
            REPORT_QUERY_ID = "WRSPEC.RS_LOB_SPEC_01";
            REPORT_DOC_URL = "lo/SPEC_LOB_OUTBOUND_01";
            REPORT_TITLE = "거래명세서";
            break;
        // 미정의된 레포트
        default:
            alert($NC.getDisplayMsg("JS.COMMON.036", "[" + reportCd + "]구현되지 않은 레포트 정보입니다. 출력할 수 없습니다.", reportCd));
            return;
    }

    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: REPORT_DOC_URL,
        reportTitle: REPORT_TITLE,
        queryId: REPORT_QUERY_ID,
        queryParams: queryParams,
        internalQueryYn: INTERNAL_QUERY_YN,
        checkedValue: $NC.toJoin(checkedData)
    };

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnable("#btnPrintReceipt", enable);
    $NC.setEnable("#btnPrintWbNoDetail", enable);
    $NC.setEnable("#btnInputCnt", permission.canSave && enable);
    $NC.setEnable("#btnNewWbNo", permission.canSave && enable);
    $NC.setEnable("#btnPrintWbNoSub", enable);
    $NC.setEnable("#btnDelWbNo", permission.canSave && enable);
}
