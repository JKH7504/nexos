/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LIC03040Q0
 *  프로그램명         : 입고대비반출현황
 *  프로그램설명       : 입고대비반출현황 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-11-14
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

    // 조회조건 - 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQVendor_Cd").click(showVendorPopup);

    $NC.setInitDateRangePicker("#dtpQInbound_Date1", "#dtpQInbound_Date2", null, "CM");

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
 * Condition Change Event - Input, Select Change 시 호출 됨
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
        case "INBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LIC03040Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LIC03040Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
        case "VENDOR_CD":
            $NP.onVendorChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_VENDOR_CD: val,
                P_VIEW_DIV: "2"
            }, onVendorPopup);
            return;
    }

    onChangingCondition();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LIC03040Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LIC03040Q0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
    if ($NC.isNull(INBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LIC03040Q0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }
    var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
    if ($NC.isNull(INBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LIC03040Q0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date2");
        return;
    }
    if (INBOUND_DATE1 > INBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LIC03040Q0.007", "입고일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INBOUND_DATE1: INBOUND_DATE1,
        P_INBOUND_DATE2: INBOUND_DATE2,
        P_VENDOR_CD: VENDOR_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/LIC03040Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처코드",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
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
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "상품규격"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_QTY",
        field: "BILL_QTY",
        name: "매입총수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_AMT",
        field: "BILL_AMT",
        name: "매입금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RO_BILL_QTY",
        field: "RO_BILL_QTY",
        name: "반품총수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RO_QTY_RATE",
        field: "RO_QTY_RATE",
        name: "수량반품율(%)",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RO_BILL_AMT",
        field: "RO_BILL_AMT",
        name: "반품금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "RO_AMT_RATE",
        field: "RO_AMT_RATE",
        name: "금액반품율(%)",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.RO_BILL_QTY > 0) {
                    return "stySubTotal";
                }
                return;
            }
        },
        summaryRow: {
            visible: true,
            resultFn: function(field, summary) {
                var result;
                switch (field) {
                    case "RO_QTY_RATE":
                        result = Number((summary.RO_BILL_QTY / summary.BILL_QTY * 100).toFixed(2));
                        return isNaN(result) ? 0 : result;
                    case "RO_AMT_RATE":
                        result = Number((summary.RO_BILL_AMT / summary.BILL_AMT * 100).toFixed(2));
                        return isNaN(result) ? 0 : result;
                    default:
                        return summary[field];
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LIC03040Q0.RS_MASTER",
        sortCol: "VENDOR_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * 상품별입고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 상품별입고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
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
 * 공급처 검색 결과
 * 
 * @param resultInfo
 */
function showVendorPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

    $NP.showVendorPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_VENDOR_CD: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onVendorPopup, function() {
        $NC.setFocus("#edtQVendor_Cd", true);
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

    // 공급처 조회조건 초기화
    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");

    onChangingCondition();
}

/**
 * 공급처 검색 결과
 * 
 * @param resultInfo
 */
function onVendorPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQVendor_Cd", resultInfo.VENDOR_CD);
        $NC.setValue("#edtQVendor_Nm", resultInfo.VENDOR_NM);
    } else {
        $NC.setValue("#edtQVendor_Cd");
        $NC.setValue("#edtQVendor_Nm");
        $NC.setFocus("#edtQVendor_Cd", true);
    }
    onChangingCondition();
}
