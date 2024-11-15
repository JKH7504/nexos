/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC03030E0
 *  프로그램명         : 배차조정
 *  프로그램설명       : 배차조정 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-08-27
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-27    ASETEC           신규작성
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
                "#grdDetail",
                "#grdSub"
            ]
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();

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
            // 출고차수 콤보 값 설정
            setOutboundBatchCombo();
        }
    });

    $NC.setInitDatePicker("#dtpQOutbound_Date");

    // 버튼 이벤트 연결
    $("#btnFwDistributeDiv").click(btnFwDistributeDivOnClick); // 배차조정
    $("#btnBwDistributeDiv").click(btnBwDistributeDivOnClick); // 운송장취소
    $("#btnQBu_Cd").click(showUserBuPopup);

    // 출고확정의 출고차수 다시보기 이미지 클릭시 처리
    $("#btnQOutbound_Batch").click(function() {
        // 출고차수 콤보 값 설정
        setOutboundBatchCombo();
    });

    // 프로그램 권한 설정
    setUserProgramPermission();

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo({
        P_BU_CD: $NC.G_USERINFO.BU_CD
    });
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divDetailView", "h", 350);
    $NC.setInitSplitter("#divMasterView", "v", 850);
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
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC03030E0.001", "출고일자를 정확히 입력하십시오."));
            setOutboundBatchCombo();
            break;
    }

    onChangingCondition();
}

function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDSUB);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd", true);

    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.003", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_BATCH: OUTBOUND_BATCH
    };
    // 데이터 조회
    $NC.serviceCall("/LDC03030E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);
    G_GRDSUB.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_BATCH: OUTBOUND_BATCH
    };
    // 데이터 조회
    $NC.serviceCall("/LDC03030E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
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
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
    if ($NC.isNull(OUTBOUND_BATCH) || OUTBOUND_BATCH == $ND.C_ALL) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.005", "출고차수를 입력하십시오."));
        $NC.setFocus("#cboQOutbound_Batch");
        return;
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LDC03 - 유통구분별집계현황
        case "PAPER_LDC03":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH
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

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo() {

    // 조회조건 - 출고차수 세팅
    $NC.setInitCombo("/LDC03030E0/getDataSet.do", {
        P_QUERY_ID: "LDC03030E0.POP_OUTBOUND_BATCH",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd", true),
            P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date")
        }
    }, {
        selector: "#cboQOutbound_Batch",
        codeField: "OUTBOUND_BATCH",
        nameField: "OUTBOUND_BATCH",
        fullNameField: "OUTBOUND_BATCH_F",
        addAll: true
    });
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_DIV",
        field: "DISTRIBUTE_DIV",
        name: "유통구분",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_DIV_D",
        field: "DISTRIBUTE_DIV_D",
        name: "유통구분명"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CNT",
        field: "RDELIVERY_CNT",
        name: "배송처수",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_CNT",
        field: "BOX_CNT",
        name: "총박스수",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LDC03030E0.RS_MASTER",
        sortCol: "DISTRIBUTE_DIV",
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
        P_DISTRIBUTE_DIV: rowData.DISTRIBUTE_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/LDC03030E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

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
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
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
        id: "INSPECT_USER_ID",
        field: "INSPECT_USER_ID",
        name: "작업자"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_BATCH",
        field: "OUTBOUND_BATCH",
        name: "출고차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LDC03030E0.RS_DETAIL",
        sortCol: "RDELIVERY_CD",
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

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_DIV",
        field: "DISTRIBUTE_DIV",
        name: "유통구분"
    });
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_DIV_D",
        field: "DISTRIBUTE_DIV_D",
        name: "유통구분명"
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
        name: "출고차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LDC03030E0.RS_SUB",
        sortCol: "RDELIVERY_CD",
        gridOptions: options
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onHeaderClick.subscribe(grdSubOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHECK_YN");
}

function grdSubOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDSUB, e, args);
            break;
    }
}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "DISTRIBUTE_DIV")) {
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
    $NC.G_VAR.buttons._print = "1";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 권한 설정
    setUserProgramPermission();
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL);
}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB);
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "DISTRIBUTE_DIV"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnableButton("#divMasterView", permission.canSave && enable);
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
    onChangingCondition();

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo({
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    });
}

function btnFwDistributeDivOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.006", "처리할 데이터가 존재하지 않습니다."));
        return;
    }

    if (G_GRDSUB.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.006", "처리할 데이터가 존재하지 않습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC03030E0.007", "배차조정 하시겠습니까?"))) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDSUB.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDSUB.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_DISTRIBUTE_DIV: refRowData.DISTRIBUTE_DIV
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.008", "배차조정할 데이터를 선택하십시오."));
        return;
    }

    $NC.serviceCall("/LDC03030E0/callLdFwDistributeDiv.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

function btnBwDistributeDivOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.006", "처리할 데이터가 존재하지 않습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LDC03030E0.009", "취소처리 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [];
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
            P_OUTBOUND_NO: rowData.OUTBOUND_NO
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC03030E0.010", "취소할 데이터를 선택하십시오."));
        return;
    }

    $NC.serviceCall("/LDC03030E0/callLdBwDistributeDiv.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}
