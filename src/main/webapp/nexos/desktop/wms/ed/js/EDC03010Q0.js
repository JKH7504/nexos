﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDC03010Q0
 *  프로그램명         : 송수신현황
 *  프로그램설명       : 송수신현황 화면 Javascript
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
        autoResizeView: function() {
            var resizeView = {
                container: "#divMasterView"
            };
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = "#grdT1Master";
            } else {
                resizeView.grids = "#grdT2Master";
            }
            return resizeView;
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();

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
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQCenter_Cd", $ND.C_ALL);
            // $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });

    // 조회조건 - 검색기간 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQEdi_Date1", "#dtpQEdi_Date2");

    // 사업부 검색 이미지 클릭
    $("#btnQBu_Cd").click(showUserBuPopup);
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
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input, Select Change Event 처리
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
        case "EDI_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.EDC03010Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "EDI_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.EDC03010Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.EDC03010Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var EDI_DATE1 = $NC.getValue("#dtpQEdi_Date1");
    if ($NC.isNull(EDI_DATE1)) {
        alert($NC.getDisplayMsg("JS.EDC03010Q0.004", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQEdi_Date1");
        return;
    }
    var EDI_DATE2 = $NC.getValue("#dtpQEdi_Date2");
    if ($NC.isNull(EDI_DATE2)) {
        alert($NC.getDisplayMsg("JS.EDC03010Q0.005", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQEdi_Date2");
        return;
    }

    // 수신현황 조회
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_EDI_DATE1: EDI_DATE1,
            P_EDI_DATE2: EDI_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        };
        // 데이터 조회
        $NC.serviceCall("/EDC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    }
    // 송신현황 조회
    else {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_EDI_DATE1: EDI_DATE1,
            P_EDI_DATE2: EDI_DATE2,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        };
        // 데이터 조회
        $NC.serviceCall("/EDC03010Q0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *        newTab: The tab that was just activated.<br>
 *        oldTab: The tab that was just deactivated.<br>
 *        newPanel: The panel that was just activated.<br>
 *        oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

    $NC.onGlobalResize();
}

function grdT1MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "BU_CD_F",
        field: "BU_CD_F",
        name: "사업부"
    });
    $NC.setGridColumn(columns, {
        id: "PROC_BU_CD_F",
        field: "PROC_BU_CD_F",
        name: "처리사업부"
    });
    $NC.setGridColumn(columns, {
        id: "EDI_DIV_F",
        field: "EDI_DIV_F",
        name: "수신구분",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "DEFINE_NO_F",
        field: "DEFINE_NO_F",
        name: "수신정의"
    });
    $NC.setGridColumn(columns, {
        id: "EDI_DATE",
        field: "EDI_DATE",
        name: "수신일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REC_CNT",
        field: "REC_CNT",
        name: "총수신건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "EDI_CNT",
        field: "EDI_CNT",
        name: "수신횟수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV0_CNT",
        field: "ERROR_DIV0_CNT",
        name: "생성오류건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV1_CNT",
        field: "ERROR_DIV1_CNT",
        name: "컬럼값오류건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV2_CNT",
        field: "ERROR_DIV2_CNT",
        name: "미처리건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV3_CNT",
        field: "ERROR_DIV3_CNT",
        name: "처리오류건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV4_CNT",
        field: "ERROR_DIV4_CNT",
        name: "정상처리건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV5_CNT",
        field: "ERROR_DIV5_CNT",
        name: "후처리오류건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV6_CNT",
        field: "ERROR_DIV6_CNT",
        name: "정상후처리건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIVE_CNT",
        field: "ERROR_DIVE_CNT",
        name: "실시간오류처리건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV8_CNT",
        field: "ERROR_DIV8_CNT",
        name: "예러종결건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV9_CNT",
        field: "ERROR_DIV9_CNT",
        name: "종결처리건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 수신현황 탭 그리드 초기값 설정
 */
function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 1,
        summaryRow: {
            visible: true
        },
        specialRow: {
            compareKey: "ERROR_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styError"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "EDC03010Q0.RS_T1_MASTER",
        sortCol: "EDI_DIV_F",
        gridOptions: options
    });
    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT2MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "BU_CD_F",
        field: "BU_CD_F",
        name: "사업부"
    });
    $NC.setGridColumn(columns, {
        id: "EDI_DIV_F",
        field: "EDI_DIV_F",
        name: "송신구분",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "DEFINE_NO_F",
        field: "DEFINE_NO_F",
        name: "송신정의"
    });
    $NC.setGridColumn(columns, {
        id: "EDI_DATE",
        field: "EDI_DATE",
        name: "송신일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REC_CNT",
        field: "REC_CNT",
        name: "총송신건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "EDI_CNT",
        field: "EDI_CNT",
        name: "송신횟수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV0_CNT",
        field: "ERROR_DIV0_CNT",
        name: "생성오류건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV1_CNT",
        field: "ERROR_DIV1_CNT",
        name: "컬럼값오류건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV2_CNT",
        field: "ERROR_DIV2_CNT",
        name: "미처리건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV3_CNT",
        field: "ERROR_DIV3_CNT",
        name: "처리오류건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV4_CNT",
        field: "ERROR_DIV4_CNT",
        name: "정상처리건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ERROR_DIV9_CNT",
        field: "ERROR_DIV9_CNT",
        name: "종결처리건수",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 송신현황 탭 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 1,
        summaryRow: {
            visible: true
        },
        specialRow: {
            compareKey: "ERROR_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styError"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "EDC03010Q0.RS_T2_MASTER",
        sortCol: "EDI_DIV_F",
        gridOptions: options
    });
    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 수신현황 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

/**
 * 송신현황 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

/**
 * 수신현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER);

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
 * 송신현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);

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
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        queryParams: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        },
        addBase: $ND.C_BASE_BU_CD
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
}
