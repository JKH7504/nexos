/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : VOC01010Q0
 *  프로그램명         : 보이스 작업현황
 *  프로그램설명       : 보이스 작업현황 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-02-26
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-02-26    ASETEC           신규작성
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
        // 현재 액티브된 뷰 정보
        activeView: {
            container: "#divSubViewC",
            PROCESS_CD: $ND.C_PROCESS_DIRECTIONS
        },
        // 프로세스별 확정/취소 처리가능 진행상태
        // 0: A, 1: B, 2 : C, 3 : D, 4: E
        stateFWBW: {
            C: {
                CONFIRM: "",
                CANCEL: ""
            },
            D: {
                CONFIRM: "",
                CANCEL: ""
            }
        }
    });

    $("#btnProcessC").addClass("stySelect");

    // 프로세스 버튼 클릭 이벤트 연결
    $("#divMasterInfoView input[type=button]").bind("click", function(e) {
        var view = $(this);
        onSubViewChange(e, view);
    });

    $("#btnQBu_Cd").click(showUserBuPopup);

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $NC.setValue("#chkQState_Pre_Yn", $ND.C_YES);
    $NC.setValue("#chkQState_Cur_Yn", $ND.C_NO);
    $NC.setInitDatePicker("#dtpQOutbound_Date");
    // // 출고지시 화면의 출고차수 새로고침
    // $("#btnQOutbound_Batch").click(function() {
    // setOutboundBatchCombo("#cboQOutbound_Batch", true);
    // });

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
            // ※ 조회 조건이 모두 세팅이 되는 시점
            setTimeout(function() {
                $("#btnProcessC").click();
                // // 출고차수 콤보 값 설정
                // setOutboundBatchCombo("#cboQOutbound_Batch", true);
                // 출고전표/수량 정보 세팅, 프로세스 정보
                setMasterSummaryInfo();
            }, $ND.C_TIMEOUT_ACT);
        }
    });

    // 그리드 초기화 - 출고지시
    grdMasterCInitialize();
    grdDetailCInitialize();
    grdSubCInitialize();

    // 그리드 초기화 - 출고확정
    grdMasterDInitialize();
    grdDetailDInitialize();
}

function _OnLoaded() {

    $NC.setInitSplitter("#divSubViewC", "v", $NC.G_OFFSET.leftViewWidth, 270, 400);
    $NC.setInitSplitter("#divSubViewCDetail", "hb", 400);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.leftViewWidth = 560;
    $NC.G_OFFSET.pltIdViewWidth = 250;
    $NC.G_OFFSET.nonClientHeight = $("#ctrCondition").outerHeight(true) + $("#divMasterInfoView").outerHeight(true);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    // Main Container 사이즈 조정
    $NC.resizeContainer("#divMasterView");
    // Splitter Container 사이즈 조정
    $NC.resizeContainer($NC.G_VAR.activeView.container);
    var grdMasterHeight = $("#divSubView" + $NC.G_VAR.activeView.PROCESS_CD + "_Master").height() - $NC.G_LAYOUT.header;

    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        // 출고지시
        case $ND.C_PROCESS_DIRECTIONS:
            // Master Grid 사이즈 조정
            $NC.resizeGrid("#grdMasterC", null, grdMasterHeight);
            // Detail Grid 사이즈 조정
            $NC.resizeGrid("#grdDetailC");
            // Sub Grid 사이즈 조정
            $NC.resizeGrid("#grdSubC");
            break;
        // 출고확정
        case $ND.C_PROCESS_CONFIRM:
            $NC.resizeGrid("#grdMasterD", null, grdMasterHeight);
            $NC.resizeGrid("#grdDetailD");
            break;
    }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            // setOutboundBatchCombo("#cboQOutbound_Batch", true);
            setMasterSummaryInfo();
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.VOC01010Q0.001", "검색 출고일자를 정확히 입력하십시오."));
            // setOutboundBatchCombo("#cboQOutbound_Batch", true);
            break;
    }

    onChangingCondition();
}

function onChangingCondition() {

    // 출고진행현황 화면
    $NC.clearGridData(G_GRDMASTERC);
    $NC.clearGridData(G_GRDDETAILC);
    $NC.clearGridData(G_GRDSUBC);
    $NC.clearGridData(G_GRDMASTERD);
    $NC.clearGridData(G_GRDDETAILD);

    setMasterSummaryInfo();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Sub View Button Click 시 호출 됨
 */
function onSubViewChange(e, view) {

    // btnProcessA ---> A
    var PROCESS_CD = view.prop("id").substr(10).toUpperCase();
    if ($NC.G_VAR.activeView.PROCESS_CD == PROCESS_CD) {
        return;
    }

    for ( var INIT_PROCESS_CD in $NC.G_VAR.stateFWBW) {
        if (INIT_PROCESS_CD == $ND.C_PROCESS_ORDER) {
            continue;
        }
        $("#btnProcess" + INIT_PROCESS_CD).removeClass("stySelect");
        $("#divSubView" + INIT_PROCESS_CD).hide();
    }

    view.addClass("stySelect");
    $("#divSubView" + PROCESS_CD).show();
    $NC.G_VAR.activeView.container = "#divSubView" + PROCESS_CD;
    $NC.G_VAR.activeView.PROCESS_CD = PROCESS_CD;

    // 출고확정
    if ($NC.G_VAR.activeView.PROCESS_CD == $ND.C_PROCESS_CONFIRM) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
            // 스필리터를 통한 _OnResize 호출
            $($NC.G_VAR.activeView.container).trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter($NC.G_VAR.activeView.container, "hb", 350);
        }

        _Inquiry();
        return;
    }

    var subContainer = null;
    if ($NC.G_VAR.activeView.PROCESS_CD == $ND.C_PROCESS_DIRECTIONS) {// 출고지시
        subContainer = $("#divSubViewCDetail");
    }

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
        // 스필리터를 통한 _OnResize 호출
        $($NC.G_VAR.activeView.container).trigger("resize");
        subContainer.trigger("resize");
    } else {
        $NC.setInitSplitter($NC.G_VAR.activeView.container, "v", $NC.G_OFFSET.leftViewWidth, 270, 400);
        $NC.setInitSplitter(subContainer, "hb", 400);
    }

    _Inquiry();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.VOC01010Q0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.VOC01010Q0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.VOC01010Q0.004", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }
    var INVOICE_NO = $NC.getValue("#edtQInvoice_No", true);
    var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
    // var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch", true);
    var STATE_PRE_YN = $NC.getValue("#chkQState_Pre_Yn");
    var STATE_CUR_YN = $NC.getValue("#chkQState_Cur_Yn");
    if (STATE_PRE_YN == $ND.C_NO && STATE_CUR_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.VOC01010Q0.005", "검색구분을 선택하십시오."));
        $NC.setFocus("#chkQState_Pre_Yn");
        return;
    }

    setMasterSummaryInfo();

    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        // 출고지시
        case $ND.C_PROCESS_DIRECTIONS:
            $NC.setInitGridVar(G_GRDMASTERC);
            $NC.setInitGridVar(G_GRDDETAILC);
            $NC.setInitGridVar(G_GRDSUBC);
            G_GRDMASTERC.queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: $ND.C_ALL,
                P_INVOICE_NO: INVOICE_NO,
                P_ORDERER_NM: ORDERER_NM,
                P_STATE_PRE_YN: STATE_PRE_YN,
                P_STATE_CUR_YN: STATE_CUR_YN
            };

            // 데이터 조회
            $NC.serviceCall("/VOC01010Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTERC), onGetMasterC);
            break;
        // 출고확정
        case $ND.C_PROCESS_CONFIRM:
            $NC.setInitGridVar(G_GRDMASTERD);
            $NC.setInitGridVar(G_GRDDETAILD);

            G_GRDMASTERD.queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: $ND.C_ALL,
                P_INVOICE_NO: INVOICE_NO,
                P_ORDERER_NM: ORDERER_NM,
                P_STATE_PRE_YN: STATE_PRE_YN,
                P_STATE_CUR_YN: STATE_CUR_YN
            };

            // 데이터 조회
            $NC.serviceCall("/VOC01010Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTERD), onGetMasterD);
            break;
    }

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

function grdMasterCOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ASSIGN_CODE_NM",
        field: "ASSIGN_CODE_NM",
        name: "할당",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ASSIGN_BATCH",
        field: "ASSIGN_BATCH",
        name: "할당차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_CNT",
        field: "OUTBOUND_CNT",
        name: "전표수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REC_CNT",
        field: "REC_CNT",
        name: "건수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ASSIGN_USER_ID",
        field: "ASSIGN_USER_ID",
        name: "작업자ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ASSIGN_UNIT_ID",
        field: "ASSIGN_UNIT_ID",
        name: "장비ID",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterCInitialize() {

    var options = {
        specialRow: {
            compareKey: "ENTRY_QTY",
            compareCol: "ENTRY_QTY",
            compareOperator: "!=",
            cssClass: "styDiff"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMasterC", {
        columns: grdMasterCOnGetColumns(),
        queryId: "VOC01010Q0.RS_T1_MASTER",
        sortCol: "ASSIGN_BATCH",
        gridOptions: options
    });

    G_GRDMASTERC.view.onSelectedRowsChanged.subscribe(grdMasterCOnAfterScroll);
    $("#grdMasterC").height(200);
}

function grdMasterCOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTERC, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTERC.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAILC);
    onGetDetailC({
        data: null
    });

    var STATE_PRE_YN = $NC.getValue("#chkQState_Pre_Yn");
    var STATE_CUR_YN = $NC.getValue("#chkQState_Cur_Yn");

    G_GRDDETAILC.queryParams = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
        P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
        P_ASSIGN_BATCH: rowData.ASSIGN_BATCH,
        P_ASSIGN_STATE: rowData.ASSIGN_STATE,
        P_INVOICE_NO: $NC.getValue("#edtQInvoice_No", true),
        P_ORDERER_NM: $NC.getValue("#edtQOrderer_Nm", true),
        P_STATE_PRE_YN: STATE_PRE_YN,
        P_STATE_CUR_YN: STATE_CUR_YN
    };
    // 데이터 조회
    $NC.serviceCall("/VOC01010Q0/getDataSet.do", $NC.getGridParams(G_GRDDETAILC), onGetDetailC);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTERC, row + 1);
}

function grdDetailCOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INVOICE_NO",
        field: "INVOICE_NO",
        name: "운송장번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "REC_CNT",
        field: "REC_CNT",
        name: "건수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "총수량",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_QTY",
        field: "PICK_QTY",
        name: "피킹수량",
        cssClass: "styCenter"
    });
    // $NC.setGridColumn(columns, {
    // id: "OUTBOUND_BATCH",
    // field: "OUTBOUND_BATCH",
    // name: "출고차수",
    // minWidth: 80,
    // cssClass: "styCenter"
    // });
    $NC.setGridColumn(columns, {
        id: "ASSIGN_BATCH",
        field: "ASSIGN_BATCH",
        name: "할당차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailCInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetailC", {
        columns: grdDetailCOnGetColumns(),
        queryId: "VOC01010Q0.RS_T1_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAILC.view.onSelectedRowsChanged.subscribe(grdDetailCOnAfterScroll);
}

function grdMasterDOnGetColumns() {

    var columns = [];
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
        id: "INVOICE_NO",
        field: "INVOICE_NO",
        name: "운송장번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "REC_CNT",
        field: "REC_CNT",
        name: "건수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "총수량",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_QTY",
        field: "PICK_QTY",
        name: "피킹수량",
        cssClass: "styCenter"
    });
    // $NC.setGridColumn(columns, {
    // id: "OUTBOUND_BATCH",
    // field: "OUTBOUND_BATCH",
    // name: "출고차수",
    // minWidth: 80,
    // cssClass: "styCenter"
    // });
    $NC.setGridColumn(columns, {
        id: "ASSIGN_BATCH",
        field: "ASSIGN_BATCH",
        name: "할당차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterDInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMasterD", {
        columns: grdMasterDOnGetColumns(),
        queryId: "VOC01010Q0.RS_T2_MASTER",
        sortCol: "OUTBOUND_DATE",
        gridOptions: options
    });

    G_GRDMASTERD.view.onSelectedRowsChanged.subscribe(grdMasterDOnAfterScroll);
}

function grdDetailDOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "상품LOT",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    // $NC.setGridColumn(columns, {
    // id: "ITEM_UNIT",
    // field: "ITEM_UNIT",
    // name: "단위",
    // minWidth: 80,
    // cssClass: "styCenter"
    // });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "스펙",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_QTY",
        field: "PICK_QTY",
        name: "피킹수량",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_YN",
        field: "PICK_YN",
        name: "피킹여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "PICK_USER_ID",
        field: "PICK_USER_ID",
        name: "작업자ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_DATETIME",
        field: "PICK_DATETIME",
        name: "피킹시간",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailDInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetailD", {
        columns: grdDetailDOnGetColumns(),
        queryId: "VOC01010Q0.RS_T2_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAILD.view.onSelectedRowsChanged.subscribe(grdDetailDOnAfterScroll);
}

function grdDetailCOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAILC, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAILC.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUBC);
    onGetSubC({
        data: null
    });

    G_GRDSUBC.queryParams = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/VOC01010Q0/getDataSet.do", $NC.getGridParams(G_GRDSUBC), onGetSubC);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAILC, row + 1);

}

function grdDetailDOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAILD, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAILD, row + 1);
}

function grdSubCOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "상품LOT",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    // $NC.setGridColumn(columns, {
    // id: "ITEM_UNIT",
    // field: "ITEM_UNIT",
    // name: "단위",
    // minWidth: 80,
    // cssClass: "styCenter"
    // });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "스펙",
        cssClass: "styCenter"
    });
    // $NC.setGridColumn(columns, {
    // id: "ITEM_USE",
    // field: "ITEM_USE",
    // name: "용도",
    // minWidth: 80,
    // cssClass: "styCenter"
    // });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_QTY",
        field: "PICK_QTY",
        name: "피킹수량",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_YN",
        field: "PICK_YN",
        name: "피킹여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "PICK_USER_ID",
        field: "PICK_USER_ID",
        name: "작업자ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_DATETIME",
        field: "PICK_DATETIME",
        name: "피킹시간",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubCInitialize() {

    var options = {
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.ENTRY_QTY != rowData.PICK_QTY && rowData.CODE_NM == "부족") {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSubC", {
        columns: grdSubCOnGetColumns(),
        queryId: "VOC01010Q0.RS_T1_SUB",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDSUBC.view.onSelectedRowsChanged.subscribe(grdSubCOnAfterScroll);
}

function grdSubCOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUBC, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUBC, row + 1);
}

function onGetMasterSummary(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var PROCESS_CD;
    if (dsResult.length == 0) {
        for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
            $NC.setValue("#divProcessCnt" + PROCESS_CD, "0 / 0");
        }
        return;
    }

    var rowData = dsResult[0];
    var PROCESS_CNT, PROCESS_QTY;
    for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
        PROCESS_CNT = $NC.getDisplayNumber($NC.nullToDefault(rowData["CNT_" + PROCESS_CD], "0"));
        PROCESS_QTY = $NC.getDisplayNumber($NC.nullToDefault(rowData["QTY_" + PROCESS_CD], "0"));

        $NC.setValue("#divProcessCnt" + PROCESS_CD, PROCESS_CNT + " / " + PROCESS_QTY);
    }
}

function grdMasterDOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTERD, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTERD.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAILD);
    onGetDetailD({
        data: null
    });

    G_GRDDETAILD.queryParams = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/VOC01010Q0/getDataSet.do", $NC.getGridParams(G_GRDDETAILD), onGetDetailD);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTERD, row + 1);
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
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
 * 사업부 검색 결과
 * 
 * @param resultInfo
 */
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

    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

function setMasterSummaryInfo() {

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    // var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
    var INVOICE_NO = $NC.getValue("#edtQInvoice_No", true);
    var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);

    // 데이터 조회
    $NC.serviceCall("/VOC01010Q0/getDataSet.do", {
        P_QUERY_ID: "VOC01010Q0.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_OUTBOUND_BATCH: $ND.C_ALL,
            P_INVOICE_NO: INVOICE_NO,
            P_ORDERER_NM: ORDERER_NM
        }
    }, onGetMasterSummary);
}

function onGetMasterC(ajaxData) {

    $NC.setInitGridData(G_GRDMASTERC, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTERC, [
        "OUTBOUND_BATCH",
        "ASSIGN_BATCH"
    ], true)) {
        $NC.setInitGridVar(G_GRDDETAILC);
        onGetDetailC({
            data: null
        });
    }
}

function onGetDetailC(ajaxData) {

    $NC.setInitGridData(G_GRDDETAILC, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDDETAILC, "LINE_NO", true)) {
        // 로케이션 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDSUBC);
        onGetSubC({
            data: null
        });
    }
}

function onGetSubC(ajaxData) {

    $NC.setInitGridData(G_GRDSUBC, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUBC, "LINE_NO");
}

function onGetMasterD(ajaxData) {

    $NC.setInitGridData(G_GRDMASTERD, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTERD, "OUTBOUND_NO", true)) {
        $NC.setInitGridVar(G_GRDDETAILD);
        onGetDetailD({
            data: null
        });
    }
}

function onGetDetailD(ajaxData) {

    $NC.setInitGridData(G_GRDDETAILD, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAILD, "LINE_NO");
}