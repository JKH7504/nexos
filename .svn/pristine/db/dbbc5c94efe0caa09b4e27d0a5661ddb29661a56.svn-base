/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC01030Q0
 *  프로그램명         : 용차내역
 *  프로그램설명       : 용차내역 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-11-28
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-11-28    ASETEC           신규작성
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

    // Grid 초기화
    grdMasterInitialize();

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2");

    // 조회 조건 팝업버튼 Event 연결
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQCar").click(showCarPopup);
    $("#btnQCarrier_Cd").click(showCarrierPopup);

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
        onComplete: function(dsResult) {
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });

}

/**
 * 화면 로드가 완료되었을 경우 자동 호출 됨
 */
function _OnLoaded() {

}

/**
 * 화면 리사이즈 Offset 세팅 - 고정 값
 */
function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 * 
 * @param {JQueryObject}
 *        parent Window JQueryObject
 * @param {Number}
 *        viewWidth Window width
 * @param {Number}
 *        viewHeight Window height
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 조회 조건에 있는 Input, Select Change Event 처리
 * 
 * @param {Object}
 *        e Event Object
 * @param {JQueryObject}
 *        view Event가 발생한 Element
 * @param {String}
 *        val Event가 발생한 Element의 현재 값
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
        case "CAR_CD":
            $NP.onCarChange(val, {
                P_CENTER_CD: $NC.getValue("#edtQCenter_Cd"),
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_CAR_CD: val,
                P_VIEW_DIV: "2"
            }, onCarPopup);
            return;
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC01030Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC01030Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
        case "CARRIER_CD":
            $NP.onCarrierChange(val, {
                P_CARRIER_CD: val,
                P_CARRIER_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onCarrierPopup);
            return;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회 조건 입력 값 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC01030Q0.003", "[물류센터]항목의 값을 먼저 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LDC01030Q0.004", "[사업부]항목의 값을 먼저 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LDC01030Q0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LDC01030Q0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    var CAR_CD = $NC.getValue("#edtQCar_Cd", true);
    var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 서비스 호출 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE1: OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: OUTBOUND_DATE2,
        P_CAR_CD: CAR_CD,
        P_CARRIER_CD: CARRIER_CD
    };
    // 데이터 조회 서비스 호출
    $NC.serviceCall("/LDC01030Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
 * grdMaster Grid 컬럼 세팅
 * 
 * @returns {Array}
 */
function grdMasterOnGetColumns() {

    var columns = [];

    // 그리드 컬럼 정보
    // id: {String} 컬럼에 대한 ID
    // field: {String} 데이터 Field 명
    // name: {String} 컬럼 타이틀
    // minWidth: {Number} 컬럼 최소 너비
    // minWidth: {Number} 컬럼 최대 너비
    // formatter: {Object} 값 표시 Formatter, Slick.Formatters.CheckBox
    // editor: {Object} 값 편집 Editor, Slick.Editors.Text, CheckBox, Number, Date, ComboBox
    // editorOptions: {Object} Editor 옵션
    // summaryTitle: {String} Summary 컬럼 타이틀
    // groupToggler: {Boolean} Group Collapse/Expand 버튼 표시 컬럼
    // groupDisplay: {Boolean} Group 컬럼 값 표시
    // aggregator: {String} Aggregator, SUM, MAX, MIN, AVG
    // cssClass: {String} 컬럼 Css, styLeft, styCenter, styRight

    // TODO: 그리드 컬럼 세팅
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter",
        groupToggler: true
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "성명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량번호",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "CAR_DIV_D",
        field: "CAR_DIV_D",
        name: "차량구분",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "CAR_TON_DIV_D",
        field: "CAR_TON_DIV_D",
        name: "톤구분",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_CD",
        field: "CARRIER_CD",
        name: "운송사코드",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_NM",
        field: "CARRIER_NM",
        name: "운송사명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * grdMaster Grid 초기화
 */
function grdMasterInitialize() {

    // Grid 옵션 세팅
    var options = {
        frozenColumn: 4
    };

    // Data Grouping
    var dataGroupOptions = {
        getter: function(rowData) {
            return $NC.rPad(rowData.OUTBOUND_DATE, 10) //
                + "|" + $NC.rPad(rowData.CAR_CD, 30);
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LDC01030Q0.RS_MASTER", // QUERY ID
        sortCol: "OUTBOUND_DATE", // 기본 정렬 컬럼의 ID
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true
    });

    // Grid 스크롤 이벤트
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * grdMaster Grid 스크롤 이벤트
 * 
 * @param {Object}
 *        e Event Object
 * @param {Object}
 *        args grid: SlickGrid, rows: Array
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재 Row/총 건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
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
 * 검색항목 값 변경시 화면 클리어 처리
 */
function onChangingCondition() {

    // 데이터 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
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

    onChangingCondition();

}

/**
 * 검색조건의 차량코드 검색 팝업 클릭
 */
function showCarPopup() {

    $NP.showCarPopup({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_CAR_CD: $NC.getValue("#edtQCar_Cd"),
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onCarPopup, function() {
        $NC.setFocus("#edtQCar_Cd", true);
    });
}

function onCarPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCar_Cd", resultInfo.CAR_CD);
        $NC.setValue("#edtQCar_Nm", resultInfo.CAR_NM);
    } else {
        $NC.setValue("#edtQCar_Cd");
        $NC.setValue("#edtQCar_Nm");
        $NC.setFocus("#edtQCar_Cd", true);
    }
    onChangingCondition();
}

function showCarrierPopup() {

    var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
    $NP.showCarrierPopup({
        queryParams: {
            P_CARRIER_CD: CARRIER_CD,
            P_CARRIER_DIV: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onCarrierPopup, function() {
        $NC.setFocus("#edtQCarrier_Cd", true);
    });
}

function onCarrierPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCarrier_Cd", resultInfo.CARRIER_CD);
        $NC.setValue("#edtQCarrier_Nm", resultInfo.CARRIER_NM);
    } else {
        $NC.setValue("#edtQCarrier_Cd");
        $NC.setValue("#edtQCarrier_Nm");
    }
    onChangingCondition();
}