/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC03012P1
 *  프로그램명         : 수시보충내역생성 팝업 (의류)
 *  프로그램설명       : 수시보충내역생성 팝업 (의류) 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-08-16
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-16    ASETEC           신규작성
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
            container: "#divDetailView",
            grids: [
                "#grdDetail"
            ],
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        },
        detailData: null
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnSave").click(_Save); // 저장 버튼
    $("#btnInquiry").click(_Inquiry); // 닫기버튼

    // 그리드 초기화
    grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    // 디테일 데이터 세팅
    $NC.G_VAR.detailData = {
        CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD
    };

    // 조회조건 - 존코드 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMZONE",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_VAR.detailData.CENTER_CD,
            P_ZONE_CD: $ND.C_ALL,
            P_ZONE_DIV_ATTR01_CD: "1"
        }
    }, {
        selector: "#cboQZone_Cd",
        codeField: "ZONE_CD",
        nameField: "ZONE_NM",
        fullNameField: "ZONE_CD_F",
        addAll: true
    });

    _Inquiry();
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
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    // var id = view.prop("id").substr(4).toUpperCase();
    // switch (id) {
    // }

    // 화면클리어
    onChangingCondition();
}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_OK);
    $NC.onPopupClose();
}

/**
 * 조회
 */
function _Inquiry() {

    var ZONE_CD = $NC.getValue("#cboQZone_Cd");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);

    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: $NC.G_VAR.detailData.CENTER_CD,
        P_ZONE_CD: ZONE_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LCC03010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

/**
 * 신규
 */
function _New() {

}

/**
 * 저장
 */
function _Save() {

    var CENTER_CD = $NC.G_VAR.detailData.CENTER_CD;
    var BU_CD = $NC.G_VAR.detailData.BU_CD;
    var MOVE_DATE = $NC.G_USERINFO.LOGIN_DATE;

    var checkedData = $NC.getGridCheckedValues(G_GRDDETAIL, {
        valueColumns: function(rowData) {
            return rowData.ZONE_CD + ";" + rowData.BANK_CD;
        }
    });

    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.LCC03012P1.001", "수시보충내역 생성할 로케이션을 선택하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC03012P1.002", "수시보충내역을 생성 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC03010E0/callLcFWFillupSpotEntry.do", {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_MOVE_DATE: MOVE_DATE,
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values)
    }, onSave, null, 2);
}

/**
 * 삭제
 */
function _Delete() {

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

function grdDetailOnGetColumns() {

    var columns = [];
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
        id: "ZONE_CD",
        field: "ZONE_CD",
        name: "존코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ZONE_NM",
        field: "ZONE_NM",
        name: "존명"
    });
    $NC.setGridColumn(columns, {
        id: "BANK_CD",
        field: "BANK_CD",
        name: "행",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LCC03010E1.RS_SUB4",
        sortCol: "ZONE_CD",
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

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, null, true);
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 디테일초기화(재고현황)
    $NC.clearGridData(G_GRDDETAIL);
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}