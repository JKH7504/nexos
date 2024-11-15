/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC03040Q0
 *  프로그램명         : 상차지시서출력
 *  프로그램설명       : 상차지시서출력 화면 Javascript
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
                "#grdMaster",
                "#grdDetail",
                "#grdSub"
            ]
        },
        carChangeType: "",
        // 체크할 정책 값
        policyVal: {
            CM510: "" // 운송권역 관리정책
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();

    $NC.setInitDatePicker("#dtpQOutbound_Date");

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    });

    // 프로그램 권한 설정
    setUserProgramPermission();

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "v", 600);
    $NC.setInitSplitter("#divSubViewDetail", "h", 350);
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
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC03040Q0.001", "출고일자를 정확히 입력하십시오."));
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
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC03040Q0.002", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC03040Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC03040Q0.003", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var dsDetail = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_CAR_CD: rowData.CAR_CD,
            P_CUST_CD: rowData.CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_RDELIVERY_CD: rowData.RDELIVERY_CD,
            P_DELIVERY_MSG: rowData.DELIVERY_MSG,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC03040Q0.004", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LDC03040Q0/saveMsgChange.do", {
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC03040Q0.002", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LDC03 - 상차지시서
        case "PAPER_LDC03":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                checkColumnId: "CHECK_YN",
                valueColumns: "CAR_CD"
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
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
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
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
        id: "AREA_CD",
        field: "AREA_CD",
        name: "권역"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운전자성명"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "권역명"
    });
    $NC.setGridColumn(columns, {
        id: "CALL_CNT",
        field: "CALL_CNT",
        name: "콜수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "운송박스수",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "운송파렛트수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_BOX",
        field: "CAPACITY_BOX",
        name: "적재박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_TON_DIV_D",
        field: "CAR_TON_DIV_D",
        name: "차량톤",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_WEIGHT",
        field: "CAPACITY_WEIGHT",
        name: "적재중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "운송중량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_CBM",
        field: "CAPACITY_CBM",
        name: "적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "운송용적",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_CBM"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_DIV_D",
        field: "TRANS_DIV_D",
        name: "운송구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_KEEP_DIV_D",
        field: "CAR_KEEP_DIV_D",
        name: "차량보관구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LDC03040Q0.RS_MASTER",
        sortCol: "AREA_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
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
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_CAR_CD: rowData.CAR_CD,
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC03040Q0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CENTER_CD",
        field: "CENTER_CD",
        name: "물류센터코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_ROUTE",
        field: "TRANS_ROUTE",
        name: "운송루트",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_CD",
        field: "AREA_CD",
        name: "권역"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "권역명"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "BOX수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "PLT수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM",
        field: "ADDR_NM",
        name: "주소"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_MSG",
        field: "DELIVERY_MSG",
        name: "배송처공지사항",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_ROUTE",
        field: "DELIVERY_ROUTE",
        name: "배송루트",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "중량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "CBM",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_CBM"),
        cssClass: "styRight"
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
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailInitialize() {

    var options = {
        frozenColumn: 3,
        editable: true,
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LDC03040Q0.RS_DETAIL",
        sortCol: "AREA_CD",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnBeforeEditCell(e, args) {

    return true;
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row)) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAIL.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
        data: null
    });

    G_GRDSUB.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_CAR_CD: rowData.CAR_CD,
        P_DELIVERY_CD: rowData.DELIVERY_CD,
        P_RDELIVERY_CD: rowData.RDELIVERY_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LDC03040Q0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        resizable: false,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
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
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "BOX수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "EA수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "BOX수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_EA",
        field: "TRANS_EA",
        name: "EA수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "PLT수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_IN_PLT",
        field: "BOX_IN_PLT",
        name: "파렛트입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "중량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "CBM",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_CBM"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
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
        id: "BOX_CBM",
        field: "BOX_CBM",
        name: "박스용적",
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
        name: "전표순번"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LDC03040Q0.RS_SUB",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
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
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "OUTBOUND_DATE",
        "CAR_CD"
    ], true)) {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAIL);
        // 출고지시 초기화
        $NC.clearGridData(G_GRDSUB);
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = $NC.iif(G_GRDMASTER.data.getLength() > 0, "1", "0");

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "OUTBOUND_NO",
        "DELIVERY_CD",
        "RDELIVERY_CD"
    ]);

}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB);
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "CAR_CD"
        ]
    });
    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "OUTBOUND_NO",
            "DELIVERY_CD",
            "RDELIVERY_CD"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyValM;
    G_GRDDETAIL.lastKeyVal = lastKeyValD;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDDETAIL, rowData, true);
    }

    _Inquiry();
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnableButton("#divMasterView", permission.canSave && enable);
}
