/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB04020E0
 *  프로그램명         : 주문취소결품사유관리
 *  프로그램설명       : 주문취소결품사유관리 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-10-04
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-10-04    ASETEC           신규작성
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
                "#grdDetail"
            ]
        }
    });

    // 상단그리드 초기화
    grdMasterInitialize();
    // 하단그리드 초기화
    grdDetailInitialize();

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
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
            // 출고차수 콤보 설정
            setOutboundBatchCombo();
            setErpBatchCombo();
        }
    });

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnSaveShortageDiv").click(_Save);

    $NC.setInitDatePicker("#dtpQOutbound_Date");

    // 출고차수 다시보기 이미지 클릭시 처리
    $("#btnQOutbound_Batch").click(setOutboundBatchCombo);

    // ERP차수 새로고침
    $("#btnQErp_Batch").click(setErpBatchCombo);
    $NC.setEnable("#btnSaveShortageDiv", false);
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

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            setOutboundBatchCombo();
            setErpBatchCombo();
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "DELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB04020E0.001", "검색 출고일자를 정확히 입력하십시오."));
            setOutboundBatchCombo();
            setErpBatchCombo();
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    $NC.setEnable("#btnSaveShortageDiv", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB04020E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB04020E0.003", "사업부코드를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LOB04020E0.004", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
    var ERP_BATCH = $NC.getValue("#cboQErp_Batch");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    $NC.setInitGridVar(G_GRDDETAIL);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_BATCH: OUTBOUND_BATCH,
        P_DELIVERY_CD: DELIVERY_CD,
        P_ERP_BATCH: ERP_BATCH,
        P_ITEM_CD: ITEM_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LOB04020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOB04020E0.005", "저장할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOB04020E0.006", "미출고사유구분을 [주문취소]로 저장 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [ ];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_SHORTAGE_DIV: "90",
            P_LINE_NO: rowData.LINE_NO,
            P_CRUD: $ND.C_DV_CRUD_U
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOB04020E0.007", "저장할 데이터를 선택하십시오."));
        return;
    }

    $NC.serviceCall("/LOB04020E0/save.do", {
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

    var columns = [ ];
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
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

    var options = {};

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOB04020E0.RS_MASTER",
        sortCol: "ITEM_CD",
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
        P_ERP_BATCH: rowData.ERP_BATCH,
        P_DELIVERY_CD: rowData.DELIVERY_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE
    };
    // 데이터 조회
    $NC.serviceCall("/LOB04020E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

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
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호"
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
        id: "OUTBOUND_BATCH",
        field: "OUTBOUND_BATCH",
        name: "출고차수"
    });
    $NC.setGridColumn(columns, {
        id: "ERP_BATCH",
        field: "ERP_BATCH",
        name: "ERP차수"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        resizable: false,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight"
    });
    // $NC.setGridColumn(columns, {
    // id: "ENTRY_BOX",
    // field: "ENTRY_BOX",
    // name: "등록BOX",
    // minWidth: 100,
    // cssClass: "styRight"
    // });
    // $NC.setGridColumn(columns, {
    // id: "ENTRY_EA",
    // field: "ENTRY_EA",
    // name: "등록EA",
    // minWidth: 100,
    // cssClass: "styRight"
    // });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    // $NC.setGridColumn(columns, {
    // id: "CONFIRM_BOX",
    // field: "CONFIRM_BOX",
    // name: "확정BOX",
    // minWidth: 100,
    // cssClass: "styRight"
    // });
    // $NC.setGridColumn(columns, {
    // id: "CONFIRM_EA",
    // field: "CONFIRM_EA",
    // name: "확정EA",
    // minWidth: 100,
    // cssClass: "styRight"
    // });
    $NC.setGridColumn(columns, {
        id: "SHORTAGE_DIV_F",
        field: "SHORTAGE_DIV_F",
        name: "결품구분"
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
function grdDetailInitialize() {

    var options = {};

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LOB04020E0.RS_DETAIL",
        sortCol: "OUTBOUND_NO",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
    G_GRDDETAIL.view.onClick.subscribe(grdDetailOnClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdDetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDDETAIL, e, args);
            break;
    }
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

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "ITEM_CD", true)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });

        $NC.setEnable("#btnSaveShortageDiv", false);
    } else {
        $NC.setEnable("#btnSaveShortageDiv", $NC.getProgramPermission().canSave);
    }
}

/**
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "DELIVERY_CD"
    });
    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    G_GRDDETAIL.lastKeyVal = lastKeyVal;
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "DELIVERY_CD");
}

/**
 * 저장 처리 성공 했을 경우 처리
 */
function onSave(ajaxData) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    // 데이터 조회 - 하단그리드
    $NC.serviceCall("/LOB04020E0/getDataSet.do", {
        P_QUERY_ID: "LOB04020E0.RS_DETAIL",
        P_QUERY_PARAMS: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
            P_ERP_BATCH: rowData.ERP_BATCH,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE
        }
    }, onGetDetail);

}

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo() {

    // 조회조건 - 출고차수 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
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

/**
 * 물류센터/사업부/출고일자 값 변경시 ERP차수 콤보 재설정
 */
function setErpBatchCombo(processCd) {

    $NC.setInitCombo("/LOB04020E0/getDataSet.do", {
        P_QUERY_ID: "LOB04020E0.RS_SUB1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date")
        }
    }, {
        selector: "#cboQErp_Batch",
        codeField: "ERP_BATCH",
        fullNameField: "ERP_BATCH",
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

    // 배송처 조회조건 초기화
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");

    setOutboundBatchCombo();
    setErpBatchCombo();
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