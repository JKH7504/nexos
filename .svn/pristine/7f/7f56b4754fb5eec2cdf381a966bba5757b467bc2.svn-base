/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDS04050E0
 *  프로그램명         : [송신]출고지시
 *  프로그램설명       : [송신]출고지시 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-13
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-31    ASETEC           신규작성
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
            grids: "#grdMaster"
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divDetail1",
                grids: "#grdDetail1"
            },
            viewSecond: function() {
                return $NC.isVisible("#divDetail2") ? {
                    container: "#divDetail2",
                    grids: "#grdDetail2"
                } : {};
            },
            viewType: "h",
            viewFixed: {
                container: "viewSecond",
                size: 400
            }
        },
        EDI_DIV: "SLO11",
        nonSendCnt: 0
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetail1Initialize();
    grdDetail2Initialize();

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
        }
    });

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    // 송신일자에 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQSend_Date1", "#dtpQSend_Date2");
    $NC.setInitDatePicker("#dtpInout_Date");

    // 조회조건 - 송신정의 세팅
    onGetDefineNo();

    // 조회조건에 오류송신내역 선택
    $NC.setValue("#rgbQView_Div1", "1");

    // 사업부 검색 이미지 클릭
    $("#btnQBu_Cd").click(showUserBuPopup);

    $("#btnSend").click(btnSendOnClick);
    $("#btnErrorProcess").click(btnErrorProcessOnClick);
    $("#btnDownloadFile").click(btnDownloadFileOnClick);
    $("#btnShowPopup").click(btnShowPopupOnClick);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "h", 200);

    setValueNonSendCnt();
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
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "SEND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.EDS04050E0.001", "송신 시작일자를 정확히 입력하십시오."));
            break;
        case "SEND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.EDS04050E0.002", "송신 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "INOUT_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.EDS04050E0.003", "송신 출고일자를 정확히 입력하십시오."));
            break;
    }
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDDETAIL2);
    $NC.clearGridData(G_GRDDETAIL1);
    $NC.clearGridData(G_GRDMASTER);

    setValueNonSendCnt();

    // 오류내역 그리드 초기화
    $("#divDetail2").hide();
    $("#divDetail1").css("border-width", "0");
    $NC.onGlobalResize();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var SEND_DATE1 = $NC.getValue("#dtpQSend_Date1");
    if ($NC.isNull(SEND_DATE1)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.006", "송신 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQSend_Date1");
        return;
    }
    var SEND_DATE2 = $NC.getValue("#dtpQSend_Date2");
    if ($NC.isNull(SEND_DATE2)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.007", "송신 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQSend_Date2");
        return;
    }
    var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
    if ($NC.isNull(DEFINE_NO)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.008", "송신정의를 선택하십시오."));
        $NC.setFocus("#cboQDefine_No");
        return;
    }
    var VIEW_DIV = $NC.getValueRadioGroup("rgbQView_Div");

    // 데이터 조회 - 미송신건수
    $NC.serviceCall("/EDS04050E0/getDataSet.do", {
        P_QUERY_ID: "EDCOMMON.POP_NON_SEND_INFO",
        P_QUERY_PARAMS: {
            P_BU_CD: BU_CD,
            P_EDI_DIV: $NC.G_VAR.EDI_DIV,
            P_DEFINE_NO: DEFINE_NO,
            P_CENTER_CD: CENTER_CD,
            P_SEND_DATE1: SEND_DATE1,
            P_SEND_DATE2: SEND_DATE2
        }
    }, onGetNonSendInfo);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL2);
    $NC.setInitGridVar(G_GRDDETAIL1);
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_DEFINE_NO: DEFINE_NO,
        P_SEND_DATE1: SEND_DATE1,
        P_SEND_DATE2: SEND_DATE2,
        P_VIEW_DIV: VIEW_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/EDS04050E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "SEND_DATE",
        field: "SEND_DATE",
        name: "송신일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_NO",
        field: "SEND_NO",
        name: "송신번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSING_YN",
        field: "CLOSING_YN",
        name: "처리완료여부",
        cssClass: "styCenter",
        resizable: false,
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "SEND_CNT",
        field: "SEND_CNT",
        name: "총송신건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_CNT0",
        field: "SEND_CNT0",
        name: "생성오류건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_CNT1",
        field: "SEND_CNT1",
        name: "컬럼값오류건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_CNT2",
        field: "SEND_CNT2",
        name: "미처리건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_CNT3",
        field: "SEND_CNT3",
        name: "처리오류건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_CNT4",
        field: "SEND_CNT4",
        name: "정상처리건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_CNT9",
        field: "SEND_CNT9",
        name: "종결처리건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("INT"),
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 송신처리 내역
 */
function grdMasterInitialize() {

    var options = {
        summaryRow: {
            visible: true
        },
        specialRow: {
            compareKey: "CLOSING_YN",
            compareVal: $ND.C_NO,
            compareOperator: "==",
            cssClass: "styDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "EDS04050E0.RS_MASTER",
        sortCol: "SEND_DATE",
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

    var VIEW_DIV = $NC.getValueRadioGroup("rgbQView_Div");
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL2);
    $NC.setInitGridVar(G_GRDDETAIL1);
    // 파라메터 세팅
    G_GRDDETAIL1.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_SEND_DATE: rowData.SEND_DATE,
        P_SEND_NO: rowData.SEND_NO,
        P_VIEW_DIV: VIEW_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/EDS04050E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);

    if (rowData.CLOSING_YN == $ND.C_YES) {
        $("#divDetail2").hide();
        $("#divDetail1").css("border-width", "0");
    } else {
        $("#divDetail2").show();
        $("#divDetail1").css("border-width", "0 1px 0 0");
    }
    $NC.onGlobalResize();

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetail1OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "SEND_SEQ",
        field: "SEND_SEQ",
        name: "순번",
        cssClass: "styRight",
        resizable: false,
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV_D",
        field: "ERROR_DIV_D",
        name: "오류구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_CD",
        field: "CENTER_CD",
        name: "물류센터코드"
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
        id: "INOUT_CD",
        field: "INOUT_CD",
        name: "송신출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BU_KEY",
        field: "BU_KEY",
        name: "전표키"
    });
    $NC.setGridColumn(columns, {
        id: "ORG_BU_NO",
        field: "ORG_BU_NO",
        name: "원전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATETIME",
        field: "BU_DATETIME",
        name: "전표일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_CENTER_CD",
        field: "SEND_CENTER_CD",
        name: "송신물류센터코드"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_BU_CD",
        field: "SEND_BU_CD",
        name: "송신사업부코드"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_OUTBOUND_DATE",
        field: "SEND_OUTBOUND_DATE",
        name: "송신출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_OUTBOUND_NO",
        field: "SEND_OUTBOUND_NO",
        name: "송신출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_INOUT_CD",
        field: "SEND_INOUT_CD",
        name: "송신출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "수불일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_BATCH",
        field: "DELIVERY_BATCH",
        name: "운송차수"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_BATCH",
        field: "OUTBOUND_BATCH",
        name: "출고차수"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_DIV",
        field: "ORDER_DIV",
        name: "주문구분"
    });
    $NC.setGridColumn(columns, {
        id: "ERP_BATCH",
        field: "ERP_BATCH",
        name: "ERP차수"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_DIV",
        field: "CAR_DIV",
        name: "차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드"
    });
    $NC.setGridColumn(columns, {
        id: "PLANED_DATETIME",
        field: "PLANED_DATETIME",
        name: "납품예정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIP_RCP_NO",
        field: "SHIP_RCP_NO",
        name: "운송접수번호"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "전표별비고"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_LINE_NO",
        field: "SEND_LINE_NO",
        name: "송신순번"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "브랜드코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE",
        field: "ITEM_STATE",
        name: "상품상태"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_YN",
        field: "VAT_YN",
        name: "부가세여부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_ORDER_DIV",
        field: "ITEM_ORDER_DIV",
        name: "상품주문유형",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHORTAGE_DIV",
        field: "SHORTAGE_DIV",
        name: "결품사유구분"
    });
    $NC.setGridColumn(columns, {
        id: "SHORTAGE_COMMENT",
        field: "SHORTAGE_COMMENT",
        name: "결품사유내역"
    });
    $NC.setGridColumn(columns, {
        id: "MISSED_DIV",
        field: "MISSED_DIV",
        name: "미배송사유구분"
    });
    $NC.setGridColumn(columns, {
        id: "MISSED_COMMENT",
        field: "MISSED_COMMENT",
        name: "미배송사유내역"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK2",
        field: "REMARK2",
        name: "순번별비고"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_NO",
        field: "BOX_NO",
        name: "박스번호",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_CD",
        field: "CARRIER_CD",
        name: "운송사코드"
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_NO",
        field: "BOX_NO",
        name: "박스번호",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_CD",
        field: "ORDERER_CD",
        name: "주문자코드",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ID")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_TEL",
        field: "ORDERER_TEL",
        name: "주문자전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_HP",
        field: "ORDERER_HP",
        name: "주문자휴대폰",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_EMAIL",
        field: "ORDERER_EMAIL",
        name: "주문자메일",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("EMAIL")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송요청사항"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "몰요청사항"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "수령자전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "수령자휴대폰",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ZIP_CD",
        field: "SHIPPER_ZIP_CD",
        name: "수령자우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR_BASIC",
        field: "SHIPPER_ADDR_BASIC",
        name: "수령자기본주소"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR_DETAIL",
        field: "SHIPPER_ADDR_DETAIL",
        name: "수령자상세주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ALL")
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_USER_ID",
        field: "ENTRY_USER_ID",
        name: "등록사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_DATETIME",
        field: "ENTRY_DATETIME",
        name: "등록일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DIRECTIONS_USER_ID",
        field: "DIRECTIONS_USER_ID",
        name: "지시사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "DIRECTIONS_DATETIME",
        field: "DIRECTIONS_DATETIME",
        name: "지시일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_USER_ID",
        field: "CONFIRM_USER_ID",
        name: "확정사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_DATETIME",
        field: "CONFIRM_DATETIME",
        name: "확정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_USER_ID",
        field: "DELIVERY_USER_ID",
        name: "배송사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_DATETIME",
        field: "DELIVERY_DATETIME",
        name: "배송완료일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SPARE1_NOTE",
        field: "SPARE1_NOTE",
        name: "예비1"
    });
    $NC.setGridColumn(columns, {
        id: "SPARE2_NOTE",
        field: "SPARE2_NOTE",
        name: "예비2"
    });
    $NC.setGridColumn(columns, {
        id: "SPARE3_NOTE",
        field: "SPARE3_NOTE",
        name: "예비3"
    });
    $NC.setGridColumn(columns, {
        id: "SPARE4_NOTE",
        field: "SPARE4_NOTE",
        name: "예비4"
    });
    $NC.setGridColumn(columns, {
        id: "SPARE5_NOTE",
        field: "SPARE5_NOTE",
        name: "예비5"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_BAR_CD",
        field: "BOX_BAR_CD",
        name: "박스바코드"
    });
    $NC.setGridColumn(columns, {
        id: "STYLE_CD",
        field: "STYLE_CD",
        name: "스타일코드"
    });
    $NC.setGridColumn(columns, {
        id: "COLOR_CD",
        field: "COLOR_CD",
        name: "컬러코드"
    });
    $NC.setGridColumn(columns, {
        id: "SIZE_CD",
        field: "SIZE_CD",
        name: "사이즈코드"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_USER_ID",
        field: "SEND_USER_ID",
        name: "송신자ID"
    });
    $NC.setGridColumn(columns, {
        id: "SEND_DATETIME",
        field: "SEND_DATETIME",
        name: "송신일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CUST1_NOTE",
        field: "CUST1_NOTE",
        name: "고객사예비1"
    });
    $NC.setGridColumn(columns, {
        id: "CUST2_NOTE",
        field: "CUST2_NOTE",
        name: "고객사예비2"
    });
    $NC.setGridColumn(columns, {
        id: "CUST3_NOTE",
        field: "CUST3_NOTE",
        name: "고객사예비3"
    });
    $NC.setGridColumn(columns, {
        id: "CUST4_NOTE",
        field: "CUST4_NOTE",
        name: "고객사예비4"
    });
    $NC.setGridColumn(columns, {
        id: "CUST5_NOTE",
        field: "CUST5_NOTE",
        name: "고객사예비5"
    });
    $NC.setGridColumn(columns, {
        id: "CUST6_NOTE",
        field: "CUST6_NOTE",
        name: "고객사예비6"
    });
    $NC.setGridColumn(columns, {
        id: "CUST7_NOTE",
        field: "CUST7_NOTE",
        name: "고객사예비7"
    });
    $NC.setGridColumn(columns, {
        id: "CUST8_NOTE",
        field: "CUST8_NOTE",
        name: "고객사예비8"
    });
    $NC.setGridColumn(columns, {
        id: "CUST9_NOTE",
        field: "CUST9_NOTE",
        name: "고객사예비9"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 송신내역
 */
function grdDetail1Initialize() {

    var options = {
        frozenColumn: 2,
        summaryRow: {
            visible: true
        },
        specialRow: {
            compareKey: "ERROR_DIV",
            compareVal: "4",
            compareOperator: "!=",
            cssClass: "styError"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail1", {
        columns: grdDetail1OnGetColumns(),
        queryId: "EDS04050E0.RS_DETAIL",
        sortCol: "SEND_SEQ",
        gridOptions: options
    });
    G_GRDDETAIL1.view.onSelectedRowsChanged.subscribe(grdDetail1OnAfterScroll);
}

function grdDetail1OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL1, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAIL1.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL2);
    // 파라메터 세팅
    G_GRDDETAIL2.queryParams = {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_SEND_DATE: rowData.SEND_DATE,
        P_SEND_NO: rowData.SEND_NO,
        P_SEND_SEQ: rowData.SEND_SEQ
    };
    // 데이터 조회
    $NC.serviceCall("/EDS04050E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL2), onGetDetail2);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL1, row + 1);
}

function grdDetail2OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ERROR_CD",
        field: "ERROR_CD",
        name: "오류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_NM",
        field: "ERROR_NM",
        name: "오류명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 오류내역
 */
function grdDetail2Initialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail2", {
        columns: grdDetail2OnGetColumns(),
        queryId: "EDS04050E0.RS_SUB",
        sortCol: "ERROR_CD",
        gridOptions: options
    });
    G_GRDDETAIL2.view.onSelectedRowsChanged.subscribe(grdDetail2OnAfterScroll);
}

function grdDetail2OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL2, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL2, row + 1);
}

/**
 * 송신처리 내역
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "SEND_DATE",
        "SEND_NO"
    ], true)) {
        $NC.clearGridData(G_GRDDETAIL2);
        $NC.clearGridData(G_GRDDETAIL1);
    }

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 미송신내역 건수
 */
function onGetNonSendInfo(ajaxData) {

    setValueNonSendCnt($NC.getArraySumVal($NC.toArray(ajaxData), {
        sumKey: "NON_SEND_CNT"
    }));
}

/**
 * 송신내역
 */
function onGetDetail1(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL1, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDDETAIL1)) {
        $NC.clearGridData(G_GRDDETAIL2);
    }
}

/**
 * 오류내역
 */
function onGetDetail2(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL2, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL2);
}

/**
 * 송신처리버튼 처리내역
 */
function onGetSendProc(ajaxData) {

    _Inquiry();
}

/**
 * 오류내역처리버튼 처리내역
 */
function onGetSendError(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "SEND_DATE",
            "SEND_NO"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
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
    // 조회조건 - 송신정의 세팅
    onGetDefineNo();
}

function btnSendOnClick(e) {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.009", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.005", "사업부를 입력하십시오."));
        return;
    }
    var DATA_DIV = $NC.getValue("#cboQDefine_No");
    if ($NC.isNull(DATA_DIV)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.010", "송신정의를 먼저 선택하십시오."));
        return;
    }
    var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
    var INOUT_DATE = $NC.getValue("#dtpInout_Date");
    if ($NC.isNull(INOUT_DATE)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.011", "송신 출고일자를 입력하십시오."));
        $NC.setFocus("#dtpInout_Date");
        return;
    }

    // 송신처리
    var PROCESS_CD = $ND.C_EDI_PROCESS_CREATE;
    // ES_PROCESSING 호출
    $NC.serviceCall("/EDS04050E0/sendProcessing.do", {
        P_BU_CD: BU_CD,
        P_EDI_DIV: $NC.G_VAR.EDI_DIV,
        P_DEFINE_NO: DEFINE_NO,
        P_SEND_DATE: null,
        P_SEND_NO: null,
        P_CENTER_CD: CENTER_CD,
        P_INOUT_DATE: INOUT_DATE,
        P_PROCESS_CD: PROCESS_CD,
        P_DATA_DIV: DATA_DIV,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onGetSendProc);
}

function btnErrorProcessOnClick(e) {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.009", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.012", "처리할 대상을 선택하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (Number(rowData.SEND_CNT0) + Number(rowData.SEND_CNT1) + Number(rowData.SEND_CNT2) + Number(rowData.SEND_CNT3) == 0) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.013", "정상 송신 데이터입니다. 오류 데이터를 선택하십시오."));
        return;
    }

    // 오류내역처리
    var PROCESS_CD = $ND.C_EDI_PROCESS_CHECKING;
    var DATA_DIV = $NC.getValue("#cboQDefine_No");

    // ES_PROCESSING 호출
    $NC.serviceCall("/EDS04050E0/sendProcessing.do", {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_SEND_DATE: rowData.SEND_DATE,
        P_SEND_NO: rowData.SEND_NO,
        P_CENTER_CD: null,
        P_INOUT_DATE: null,
        P_PROCESS_CD: PROCESS_CD,
        P_DATA_DIV: DATA_DIV,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onGetSendError);
}

function btnDownloadFileOnClick(e) {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.014", "파일 다운로드할 대상을 선택하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (Number(rowData.SEND_CNT0) + Number(rowData.SEND_CNT1) + Number(rowData.SEND_CNT2) + Number(rowData.SEND_CNT3) > 0) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.015", "정상적으로 처리되지 않은 송신 데이터가 존재합니다."));
        return;
    }

    var DATA_DIV = $NC.getValue("#cboQDefine_No");
    if (!DATA_DIV.startsWith("3")) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.016", "송신정의가 파일 형식으로 지정된 경우만 파일로 다운로드할 수 있습니다."));
        return;
    }

    $NC.fileDownload("/EDS04050E0/sendFileDownload.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_SEND_DATE: rowData.SEND_DATE,
        P_SEND_NO: rowData.SEND_NO,
        P_VIEW_DIV: "1",
        P_DATA_DIV: DATA_DIV,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    });
}

function btnShowPopupOnClick(e) {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.005", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var SEND_DATE1 = $NC.getValue("#dtpQSend_Date1");
    if ($NC.isNull(SEND_DATE1)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.006", "송신 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQSend_Date1");
        return;
    }
    var SEND_DATE2 = $NC.getValue("#dtpQSend_Date2");
    if ($NC.isNull(SEND_DATE2)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.007", "송신 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQSend_Date2");
        return;
    }
    var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
    if ($NC.isNull(DEFINE_NO)) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.008", "송신정의를 선택하십시오."));
        $NC.setFocus("#cboQDefine_No");
        return;
    }

    if ($NC.G_VAR.nonSendCnt == 0) {
        alert($NC.getDisplayMsg("JS.EDS04050E0.017", "미송신 데이터가 한건도 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "EDS04051P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.EDS04051P0.001", "미송신내역"),
        url: "ed/EDS04051P0.html",
        width: 1000,
        height: 600,
        G_PARAMETER: {
            P_BU_CD: BU_CD,
            P_EDI_DIV: $NC.G_VAR.EDI_DIV,
            P_DEFINE_NO: DEFINE_NO,
            P_CENTER_CD: CENTER_CD,
            P_SEND_DATE1: SEND_DATE1,
            P_SEND_DATE2: SEND_DATE2,
            P_PERMISSION: $NC.getProgramPermission()
        },
        onOk: function(resultInfo) {

            if ($NC.isNull(resultInfo)) {
                return;
            }
            $NC.setValue("#dtpInout_Date", resultInfo.INOUT_DATE);
            btnSendOnClick();
        }
    });
}

/**
 * 조회조건 - 송신정의 세팅
 */
function onGetDefineNo() {

    $NC.setInitCombo("/EDS04050E0/getDataSet.do", {
        P_QUERY_ID: "EDCOMMON.POP_DEFINE_NO",
        P_QUERY_PARAMS: {
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_EDI_DIV: $NC.G_VAR.EDI_DIV
        }
    }, {
        selector: "#cboQDefine_No",
        codeField: "DATA_DIV",
        fullNameField: "DEFINE_NO_F",
        onComplete: function() {
            $NC.setValue("#cboQDefine_No", 0);
        }
    });
}

/**
 * 미송신건수 값 세팅
 */
function setValueNonSendCnt(nonSendCnt) {

    $NC.G_VAR.nonSendCnt = nonSendCnt || 0;
    if ($NC.isNull(nonSendCnt) || nonSendCnt < 1) {
        $NC.setValue("#lblNon_Send_Cnt", $NC.getDisplayMsg("JS.EDS04050E0.018", "미송신건수 : -"));
    } else {
        $NC.setValue("#lblNon_Send_Cnt", $NC.getDisplayMsg("JS.EDS04050E0.019", "미송신건수 : " + nonSendCnt + "건", nonSendCnt));
    }
    $NC.setEnable("#btnShowPopup", $NC.G_VAR.nonSendCnt > 0);
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnable("#btnSend", permission.canSave);
    $NC.setEnable("#btnErrorProcess", permission.canSave && enable);
    $NC.setEnable("#btnDownloadFile", permission.canSave && enable);
}