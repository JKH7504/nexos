/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LSC01010Q0
 *  프로그램명         : PDA 상품별 재고조회
 *  프로그램설명       : PDA 상품별 재고조회 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-02-27
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-02-27    ASETEC           신규작성
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
            container: "#ctrMasterView",
            grids: "#grdMaster",
            exceptHeight: function() {
                return $NC.getViewHeight("#ctrMasterInfoView,#ctrDetailView,#ctrActionBar");
            }
        },
        ignoreKeyUp: false,
        lastItemBarCd: null
    });

    $NC.setVisible("#tdQDsp_Brand_Nm", false);
    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 취소버튼 클릭 -> _Cancel로 처리
    $("#btnCancel").click(_Cancel);

    // 그리드 초기화
    grdMasterInitialize();
}

/**
 * Window Open 시 호출 됨
 */
function _OnLoaded() {

    // setFocusScan();
    _Cancel();
}

/**
 * Window Focus 시 호출 됨
 */
function _OnFocus() {

    setFocusScan();
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

    // 기본정보 변경, id는 무조건 기본정보 뷰의 id 기준
    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            break;
        case "BU_CD":
            break;
        case "WORK_DATE":
            break;
    }

    // 조건 변경시 초기화
    _Cancel($ND.C_CLEAR_TYPE_ALL);
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "ITEM_BAR_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onItemScan(view, val);
            break;
        case "ALL_BU_YN":
            setFocusScan();
            break;
    }
}

/**
 * Input KeyUp Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnInputKeyUp(e, view) {

    // Enter Key일 경우만 처리
    if (e.keyCode != 13) {
        return;
    }

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "ITEM_BAR_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onItemScan(view, $NC.getValue(view));
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

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
function _Cancel(clearType) {

    // clearType
    // C_CLEAR_TYPE_ALL: 0
    // C_CLEAR_TYPE_MASTER: 1
    // C_CLEAR_TYPE_DETAIL: 2
    // C_CLEAR_TYPE_SUB: 3
    // clearType가 취소 버튼 클릭 Event Object일 경우도 있음
    if (clearType instanceof $.Event || $NC.isNull(clearType)) {
        clearType = $ND.C_CLEAR_TYPE_ALL;
    }

    // 전역 변수 초기화
    $NC.G_VAR.lastItemBarCd = null;
    // 값 초기화
    $NC.setValue("#edtItem_Bar_Cd");
    setMasterInputValue();
    setDetailInputValue();

    $NC.clearGridData(G_GRDMASTER);

    setFocusScan();
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
 * 최상위 컨테이너 Click에 이벤트 바인딩하여 스캔 Edit로 포커스 이동 처리
 * 
 * @param e
 * @returns
 */
function onContainerFocus(e) {

    var $view = $(e.target);
    // 하단 액션버튼은 처리 안함
    if ($view.is("span") && $view.parent(".btnAction").length > 0) {
        return;
    }
    // 그리드 셀 복사일 경우 처리 안함
    if (e.ctrlKey && $view.is(".slick-cell")) {
        return;
    }
    // 스캔 Element - 상품바코드
    if ($view.prop("id") == "edtItem_Bar_Cd") {
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        setFocusScan();
    }
}

function setFocusScan(selector) {

    var $view = $NC.getView($NC.isNull(selector) ? "#edtItem_Bar_Cd" : selector);
    if ($NC.isEnable($view)) {
        // Delay 처리
        setTimeout(function() {
            $view.focus();
            $NC.hideSoftInput(); // 일단 스캔 항목 키보드 숨김 처리
        }, $ND.C_TIMEOUT_FOCUS);
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ROW_NO",
        field: "ROW_NO",
        name: "No",
        resizable: false,
        minWidth: 40,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        rowHeight: 30,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "PDA_LSC01010Q0.RS_MASTER",
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
    var rowData = G_GRDMASTER.data.getItem(row);
    setTimeout(function() {
        setDetailInputValue(rowData);
    });

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function setMasterInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtQty_In_Box", rowData["QTY_IN_BOX"]);
    $NC.setValue("#edtBox_In_Plt", rowData["BOX_IN_PLT"]);
    $NC.setValue("#edtTot_PStock_Box", $NC.getDisplayNumber(rowData["TOT_PSTOCK_BOX"]));
    $NC.setValue("#edtTot_PStock_Ea", $NC.getDisplayNumber(rowData["TOT_PSTOCK_EA"]));
    $NC.setValue("#edtTot_PStock_Qty", $NC.getDisplayNumber(rowData["TOT_PSTOCK_QTY"]));
}

function setDetailInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtItem_State", rowData["ITEM_STATE_F"]);
    $NC.setValue("#edtValid_Date", rowData["VALID_DATE"]);
    $NC.setValue("#edtBatch_No", rowData["BATCH_NO"]);
    $NC.setValue("#edtPStock_Box", $NC.getDisplayNumber(rowData["PSTOCK_BOX"]));
    $NC.setValue("#edtPStock_Ea", $NC.getDisplayNumber(rowData["PSTOCK_EA"]));
    $NC.setValue("#edtPStock_Qty", $NC.getDisplayNumber(rowData["PSTOCK_QTY"]));
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LSC01010Q0.XXX", "상품의 재고가 존재하지 않습니다."));
        _Cancel();
        return;
    }

    // 기본 체크, 첫번째 ROW 데이터로
    var resultData = dsResult[0];
    setMasterInputValue(resultData);

    // 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDMASTER, dsResult);
    $NC.setInitGridAfterOpen(G_GRDMASTER);
}

function onItemScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtItem_Bar_Cd");
        scanVal = $NC.getValue($scan);
    }

    // 상품바코드
    if ($NC.isNull(scanVal)) {
        _Cancel();
        return;
    }

    // 초기화
    _Cancel();

    $NC.G_VAR.lastItemBarCd = scanVal;
    $NC.setValue($scan, scanVal);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_ITEM_BAR_CD: $NC.G_VAR.lastItemBarCd,
        P_ALL_BU_YN: $NC.getValue("#chkAll_Bu_Yn", $ND.C_NO)
    };
    // 데이터 조회
    $NC.serviceCall("/PDA_LSC01010Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onItemError);
}

function onItemError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel();
    setFocusScan();
}