/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB07010Q0
 *  프로그램명         : 출고모니터링조회
 *  프로그램설명       : 출고모니터링조회 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-05-02
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-05-02    ASETEC           신규작성
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

    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2", null, "CM");

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
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSUSERBU",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CENTER_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQBu_Cd",
        codeField: "BU_CD",
        nameField: "BU_NM",
        multiSelect: true,
        onComplete: function() {
            $NC.setValue("#cboQBu_Cd", $NC.G_USERINFO.BU_CD);
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
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB07010Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB07010Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB07010Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#cboQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB07010Q0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#cboQBu_Cd");
        return;
    }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOB07010Q0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }
    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOB07010Q0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }
    if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LOB07010Q0.007", "출고일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE1: OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: OUTBOUND_DATE2,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    // 데이터 조회
    $NC.serviceCall("/LOB07010Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드",
        cssClass: "styCenter",
        band: 0,
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부코드",
        cssClass: "styCenter",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "TOT_BILL",
        field: "TOT_BILL",
        name: "전체전표수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 1,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "TOT_QTY",
        field: "TOT_QTY",
        name: "전체수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 1,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_BILL",
        field: "ENTRY_BILL",
        name: "등록전표수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "예정수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 2,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DIRECTIONS_BILL",
        field: "DIRECTIONS_BILL",
        name: "지시전표수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 3,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "DIRECTIONS_QTY",
        field: "DIRECTIONS_QTY",
        name: "지시수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 3,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BILL",
        field: "CONFIRM_BILL",
        name: "확정전표수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 4,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 4,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_RATE",
        field: "BILL_RATE",
        name: "전표완료율",
        cssClass: "styRight",
        band: 5,
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_RATE",
        field: "QTY_RATE",
        name: "수량완료율",
        cssClass: "styRight",
        band: 5,
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 3,
        showBandRow: true,
        bands: [
            "기본정보",
            "전체",
            "출고작업예정",
            "출고작업진행",
            "출고작업완료",
            "완료율"
        ],
        summaryRow: {
            visible: true,
            resultFn: function(field, summary) {
                switch (field) {
                    case "BILL_RATE":
                        return $NC.toNumber(Math.round(summary.CONFIRM_BILL / summary.TOT_BILL * 10000) / 100);
                    case "QTY_RATE":
                        return $NC.toNumber(Math.round(summary.CONFIRM_QTY / summary.TOT_QTY * 10000) / 100);
                    default:
                        return summary[field];
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOB07010Q0.RS_MASTER",
        sortCol: "CUST_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * 출고모니터링 그리드 행 클릭시 처리
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
 * 출고모니터링 조회 버튼 클릭후 처리
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
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

