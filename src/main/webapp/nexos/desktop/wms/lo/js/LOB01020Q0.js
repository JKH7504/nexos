/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB01020Q0
 *  프로그램명         : 미출예상내역
 *  프로그램설명       : 미출예상내역 화면 Javascript
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

    // 조회조건 - 브랜드 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 조회조건 - 출고예정일자 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQOrder_Date1", "#dtpQOrder_Date2", null, "W2"); // -15
    $NC.setInitDatePicker("#dtpOrder_Date");

    // 세트결품예정내역생성 버튼 권한 체크 및 클릭 이벤트 연결
    setUserProgramPermission();

    // 조회조건 - 출고구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: [
                $ND.C_INOUT_GRP_D1,
                $ND.C_INOUT_GRP_D2
            ].join($ND.C_SEP_DATA),
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    $NC.setValue("#edtQRDelivery_Cd");
    $NC.setValue("#edtQRDelivery_Nm");
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");

    // 사업부 검색 이미지 클릭
    $("#btnQBu_Cd").click(showUserBuPopup);
    // 브랜드 검색 이미지 클릭
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    // 배송처 검색 이미지 클릭
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    // 실배송처 검색 이미지 클릭
    $("#btnQRDelivery_Cd").click(showRDeliveryPopup);
    // 세트결품예정내역 생성 버튼 클릭
    $("#btnSetShortageEntry").click(btnSetShortageEntryOnClick);

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo();
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
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "ORDER_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB01020Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            // 시작일자와 종료일자가 동일하면 세트결품예정일자도 변경
            if (val == $NC.getValue("#dtpQOrder_Date2")) {
                $NC.setInitDatePicker("#dtpOrder_Date", val);
            }
            break;
        case "ORDER_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB01020Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            $NC.setInitDatePicker("#dtpOrder_Date", val);
            break;
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

    // 조회 조건에 Object Change
    onChangingCondition();
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);

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
        alert($NC.getDisplayMsg("JS.LOB01020Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    if ($NC.isNull(ORDER_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.005", "출고예정 검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }
    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    if ($NC.isNull(ORDER_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.006", "출고예정 검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date2");
        return;
    }
    if (ORDER_DATE1 > ORDER_DATE2) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.007", "출고예정 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    if ($NC.isNull(INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.008", "출고구분을 선택하십시오."));
        $NC.setFocus("#cboQInout_Cd");
        return;
    }
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var BU_NO = $NC.getValue("#edtQBu_No");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ORDER_DATE1: ORDER_DATE1,
        P_ORDER_DATE2: ORDER_DATE2,
        P_INOUT_CD: INOUT_CD,
        P_BRAND_CD: BRAND_CD,
        P_BU_NO: BU_NO,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM,
        P_DELIVERY_CD: DELIVERY_CD,
        P_RDELIVERY_CD: RDELIVERY_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LOB01020Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_CD_F = $NC.getDisplayCombo(BU_CD, $NC.getValue("#edtQBu_Nm"));
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    if ($NC.isNull(ORDER_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.005", "출고예정 검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }
    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    if ($NC.isNull(ORDER_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.006", "출고예정 검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date2");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    var INOUT_CD_F = $NC.getValueCombo("#cboQInout_Cd", "F");
    if ($NC.isNull(INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.008", "출고구분을 선택하십시오."));
        $NC.setFocus("#cboQInout_Cd");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var BRAND_CD_F = $NC.iif(BRAND_CD == $ND.C_ALL, $NC.getDisplayCombo($ND.C_ALL, "전체"), $NC.getValue("#edtQBrand_Nm"));
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var DELIVERY_NM = $NC.getValue("#edtQDelivery_Nm", "전체");
    var DELIVERY_CD_F = $NC.getDisplayCombo(DELIVERY_CD, DELIVERY_NM);
    var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_CD_F = $NC.iif(ITEM_CD == $ND.C_ALL, "전체", ITEM_CD);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    var ITEM_NM_F = $NC.iif(ITEM_NM == $ND.C_ALL, "전체", ITEM_NM);

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LOB01 - 미출예상내역
        case "PAPER_LOB01":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_CD_F: BU_CD_F,
                P_ORDER_DATE1: ORDER_DATE1,
                P_ORDER_DATE2: ORDER_DATE2,
                P_INOUT_CD: INOUT_CD,
                P_INOUT_CD_F: INOUT_CD_F,
                P_BRAND_CD: BRAND_CD,
                P_BRAND_CD_F: BRAND_CD_F,
                P_ITEM_CD: ITEM_CD,
                P_ITEM_CD_F: ITEM_CD_F,
                P_ITEM_NM: ITEM_NM,
                P_ITEM_NM_F: ITEM_NM_F,
                P_DELIVERY_CD: DELIVERY_CD,
                P_RDELIVERY_CD: RDELIVERY_CD,
                P_DELIVERY_CD_F: DELIVERY_CD_F,
                P_BU_NO: BU_NO
            };
            break;
        // 미정의된 레포트
        default:
            alert($NC.getDisplayMsg("JS.COMMON.036", "[" + reportInfo.REPORT_NM + "]구현되지 않은 레포트 정보입니다. 출력할 수 없습니다.", reportInfo.REPORT_NM));
            return;
    }

    if ($NC.isNotEmpty(checkedData)) {
        // 선택 건수 체크
        if (checkedData.checkedCount == 0) {
            alert($NC.getDisplayMsg("JS.COMMON.037", "[" + reportInfo.REPORT_NM + "]출력할 데이터를 선택하십시오.", reportInfo.REPORT_NM));
            return;
        }
        // 선택 건수 중 출력 대상 건수
        if (checkedData.values.length == 0) {
            alert($NC.getDisplayMsg("JS.COMMON.038", "[" + reportInfo.REPORT_NM + "]출력 가능한 데이터를 선택하십시오.", reportInfo.REPORT_NM));
            return;
        }
    }

    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: reportInfo.REPORT_DOC_URL,
        reportTitle: reportInfo.REPORT_TITLE_NM,
        queryId: reportInfo.REPORT_QUERY_ID,
        queryParams: queryParams,
        internalQueryYn: reportInfo.INTERNAL_QUERY_YN,
        checkedValue: $NC.toJoin(checkedData.values)
    };

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);
}

function grdMasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
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
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_DATE",
        field: "ORDER_DATE",
        name: "예정일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_NO",
        field: "ORDER_NO",
        name: "예정번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number
    });
    $NC.setGridColumn(columns, {
        id: "OUT_UNIT_DIV_F",
        field: "OUT_UNIT_DIV_F",
        name: "출고단위"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "PRE_ADJUST_QTY",
        field: "PRE_ADJUST_QTY",
        name: "출고가능수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "SHORTAGE_QTY",
        field: "SHORTAGE_QTY",
        name: "미출예상수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "BACKORDER_YN",
        field: "BACKORDER_YN",
        name: "백오더여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "SET_ITEM_YN",
        field: "SET_ITEM_YN",
        name: "세트상품여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 4,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.BACKORDER_YN == $ND.C_YES) {
                    return "stySpecial ";
                }
                // 세트상품일 경우 스타일 지정
                if (rowData.SET_ITEM_YN == $ND.C_YES) {
                    return "styActive";
                }
            }
        },
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOB01020Q0.RS_MASTER",
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

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 미출예상내역 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "ORDER_DATE",
        "ORDER_NO"
    ]);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    // print 버튼 활성화 처리
    if (G_GRDMASTER.data.getLength() > 0) {
        $NC.G_VAR.buttons._print = "1";
    } else {
        $NC.G_VAR.buttons._print = "0";
    }

    $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 세트결품예정내역 처리 결과
 */
function onExecSP(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "ORDER_DATE",
            "ORDER_NO"
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

/**
 * 검색조건의 배송처 검색 이미지 클릭
 */
function showDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: $ND.C_ALL,
        P_DELIVERY_DIV: $ND.C_ALL,
        P_VIEW_DIV: "2"
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
 * 검색조건의 배송처 검색 이미지 클릭
 */
function showRDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: $ND.C_ALL,
        P_DELIVERY_DIV: $ND.C_ALL,
        P_VIEW_DIV: "2"
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
 * 세트결품예정내역생성
 */
function btnSetShortageEntryOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.002", "처리할 데이터가 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var ORDER_DATE = $NC.getValue("#dtpOrder_Date");
    if ($NC.isNull(ORDER_DATE)) {
        alert($NC.getDisplayMsg("JS.LOB01020Q0.009", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpOrder_Date");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOB01020Q0.010", "세트결품예정내역을 생성 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LOB01020Q0/callLOShortageSetItem.do", {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ORDER_DATE: ORDER_DATE,
        P_INOUT_GRP: $ND.C_INOUT_GRP_D1,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var enable = G_GRDMASTER.data.getLength() > 0;
    var canSave = $NC.getProgramPermission().canSave;
    // 세트상품이 있을 경우에만 활성화
    var searchSet = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: "SET_ITEM_YN",
        searchVal: $ND.C_YES
    }) > -1;

    $NC.setEnable("#btnSetShortageEntry", canSave && enable && searchSet);
    $NC.setEnable("#dtpOrder_Date", canSave && enable && searchSet);
}