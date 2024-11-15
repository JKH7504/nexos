/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LOC02340E0
 *  프로그램명         : PDA 수동DAS작업
 *  프로그램설명       : PDA 수동DAS작업
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
        // 옵션
        SCANNED_DISPLAY_ITEM_BAR_CD: true, // 기본값 true
        SCANNED_ITEM_BAR_CD: false,

        onSaveAction: "C",
        ignoreKeyUp: false,
        lastPaperNo: null,
        lastItemBarCd: null,
        distributeData: null,
        nextDistribute: false,
        lastSaveSuccess: false
    });

    // 초기 숨김 처리
    //

    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 취소버튼 클릭 -> _Cancel로 처리
    $("#btnCancel").click(_Cancel);
    // 처리버튼 클릭 -> _Save로 처리
    // $("#btnSave").click(_Save);

    // 분배취소
    $("#btnDistributeCancel").click(btnDistributeCancelOnClick);
    // 분배작업
    $("#btnDistribute").click(btnDistributeOnClick);
    $("#btnDistributeClose").click(btnDistributeCloseOnClick);

    // 그리드 초기화
    grdMasterInitialize();

    // 권한 설정
    setUserProgramPermission();
    // 환경 세팅 읽기
    if ($Android.isValid()) {
        var props = [
            // "SCANNED_INC_QTY",
            "SCANNED_DISPLAY_ITEM_BAR_CD"
        ];
        // 프로그램 단위 환경 세팅은 PROGRAM_ID + "," + propertyName으로 읽기
        $NC.G_VAR[props[0]] = $Android.callby("getBooleanGlobalProp", props[0], $NC.G_VAR[props[0]]);
        // $NC.G_VAR[props[1]] = $Android.callby("getBooleanGlobalProp", props[1], $NC.G_VAR[props[1]]);
    }
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

    if ($NC.isVisible("#ctrDistributeOverlay")) {
        $NC.resizeContainer("#ctrDistributeView", null, null, $NC.getViewHeight("#ctrPopupActionBar"));
    }
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
        case "PAPER_NO":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onPaperScan(view, val);
            break;
        case "ITEM_BAR_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onItemScan(view, val);
            break;
        case "L1_SHELF_NO":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onShelfScan(view, val);
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
        case "PAPER_NO":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onPaperScan(view, $NC.getValue(view));
            break;
        case "ITEM_BAR_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onItemScan(view, $NC.getValue(view));
            break;
        case "L1_SHELF_NO":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onShelfScan(view, $NC.getValue(view));
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

    // 저장 전 Validation
    if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "지시서를 먼저 스캔하십시오."));
        onShelfError();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "처리할 상품 내역이 없습니다."));
        onShelfError();
        return;
    }

    if ($NC.isNull($NC.G_VAR.distributeData)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "분배할 상품이 없습니다."));
        onShelfError();
        return;
    }

    var refRowData = $NC.G_VAR.distributeData;
    $NC.G_VAR.onSaveAction = "N";
    $NC.serviceCall("/PDA_LOC02340E0/callLOProcDistribute.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: refRowData.OUTBOUND_NO,
        P_BRAND_CD: refRowData.BRAND_CD,
        P_ITEM_CD: refRowData.ITEM_CD,
        P_ITEM_STATE: refRowData.ITEM_STATE,
        P_ITEM_LOT: refRowData.ITEM_LOT,
        P_DISTRIBUTE_QTY: refRowData.DISTRIBUTE_QTY + refRowData.REMAIN_QTY,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onShelfError);
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

    if (clearType <= $ND.C_CLEAR_TYPE_MASTER) {
        // 전역 변수 초기화
        $NC.G_VAR.lastPaperNo = null;
        $NC.G_VAR.lastItemBarCd = null;
        $NC.G_VAR.distributeData = null;
        $NC.G_VAR.nextDistribute = false;

        // 값 초기화
        $NC.setValue("#edtPaper_No");
        setMasterInputValue();

        $NC.clearGridData(G_GRDMASTER);
        // 모두 비활성
        $NC.setEnableGroup("#ctrDetailView", false);

        // 리사이즈 호출
        $NC.onGlobalResize();
    }

    if (clearType <= $ND.C_CLEAR_TYPE_DETAIL) {
        // 전역 변수 초기화
        $NC.G_VAR.lastItemBarCd = null;
        $NC.G_VAR.distributeData = null;
        $NC.G_VAR.nextDistribute = false;
        // 값 초기화
        setDetailInputValue();
    }

    if (clearType == $ND.C_CLEAR_TYPE_DETAIL) {
        setFocusScan("#edtItem_Bar_Cd");
    } else {
        setFocusScan();
    }
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
    // 스캔 Element - 지시서
    if ($view.prop("id") == "edtPaper_No") {
        return;
    }
    // 스캔 Element - 로케이션
    if ($view.prop("id") == "edtItem_Bar_Cd") {
        // 비활성이면 지시서로
        if (!$NC.isEnable($view)) {
            setFocusScan();
        }
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        if ($NC.isVisible("#ctrDistributeOverlay")) {
            setFocusScan("#edtL1_Shelf_No");
        }
        // 지시서 스캔하여 정상 조회되어 있으면 로케이션에 포커
        else if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
            setFocusScan();
        } else {
            setFocusScan("#edtItem_Bar_Cd");
        }
    }
}

function setFocusScan(selector) {

    var $view = $NC.getView($NC.isNull(selector) ? "#edtPaper_No" : selector);
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
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        minWidth: 150
    });
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_SHELF_CNT",
        field: "DISTRIBUTE_SHELF_CNT",
        name: "주문수",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "지시수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_QTY",
        field: "DISTRIBUTE_QTY",
        name: "분배수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        minWidth: 100
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        rowHeight: 30,
        frozenColumn: 0,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                // 분배완료
                if (rowData.DISTRIBUTE_YN == $ND.C_YES) {
                    return "styDone";
                }
                // 일부분배
                if (rowData.DISTRIBUTE_QTY > 0 && rowData.REMAIN_QTY > 0) {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "PDA_LOC02340E0.RS_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
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

function grdMasterOnClick(e, args) {

    // 상품정보 초기화 상태에서 클릭, 표시
    if ($NC.isNull($NC.G_VAR.lastItemBarCd)) {
        G_GRDMASTER.lastRow = -1;
        $NC.setGridSelectRow(G_GRDMASTER, args.row);
    }
}

function grdMasterOnSort() {

    $NC.setGridSort(G_GRDMASTER, {
        sortField: true,
        sortColumns: [
            {
                field: "DISTRIBUTE_YN",
                sortAsc: true
            },
            {
                field: "BRAND_CD",
                sortAsc: true
            },
            {
                field: "ITEM_CD",
                sortAsc: true
            },
            {
                field: "ITEM_STATE",
                sortAsc: true
            },
            {
                field: "ITEM_LOT",
                sortAsc: true
            }
        ]
    });

    // 정렬 후 다음 작업 대상인 첫번째 row 선택
    G_GRDMASTER.lastRow = -1;
    $NC.setGridSelectRow(G_GRDMASTER, 0);
}

function setMasterInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtOutbound_Date", rowData["OUTBOUND_DATE"]);
    $NC.setValue("#edtOutbound_Batch", rowData["OUTBOUND_BATCH"]);
}

function setDetailInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.G_VAR.lastItemBarCd = rowData["ITEM_CD"];
    if ($NC.G_VAR.SCANNED_DISPLAY_ITEM_BAR_CD) {
        $NC.setValue("#edtItem_Bar_Cd", $NC.isNull(rowData["ITEM_BAR_CD"]) ? $NC.G_VAR.lastItemBarCd : rowData["ITEM_BAR_CD"]);
    } else {
        $NC.setValue("#edtItem_Bar_Cd", $NC.G_VAR.lastItemBarCd);
    }

    $NC.setValue("#edtItem_Cd", rowData["ITEM_CD"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtItem_State", $NC.getDisplayCombo(rowData["ITEM_STATE"], rowData["ITEM_STATE_D"]));
    $NC.setValue("#edtQty_In_Box", rowData["QTY_IN_BOX"]);
    $NC.setValue("#edtBox_In_Plt", rowData["BOX_IN_PLT"]);
    $NC.setValue("#edtEntry_Box", rowData["ENTRY_BOX"]);
    $NC.setValue("#edtEntry_Ea", rowData["ENTRY_EA"]);
    $NC.setValue("#edtEntry_Qty", rowData["ENTRY_QTY"]);
    $NC.setValue("#edtDistribute_Box", rowData["DISTRIBUTE_BOX"]);
    $NC.setValue("#edtDistribute_Ea", rowData["DISTRIBUTE_EA"]);
    $NC.setValue("#edtDistribute_Qty", rowData["DISTRIBUTE_QTY"]);
    $NC.setValue("#edtRemain_Order_Cnt", rowData["REMAIN_ORDER_CNT"]);
    $NC.setValue("#edtDistribute_Order_Cnt", rowData["DISTRIBUTE_ORDER_CNT"]);

    setFocusScan("#edtItem_Bar_Cd");
    if ($NC.G_VAR.SCANNED_ITEM_BAR_CD) {
        // 권환이 있어 활성화 되어 있을 경우 분배화면 표시
        if (!$("#btnDistribute").hasClass("styDisabled")) {
            btnDistributeOnClick();
        }
    }
    $NC.G_VAR.SCANNED_ITEM_BAR_CD = false;
}

function setDistributeInputValue(dsResult) {

    if ($NC.isNull(dsResult)) {
        // 초기화시 기본값 지정
        dsResult = [];
    }

    var refRowData, resultData;
    if (dsResult.length > 0) {
        refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        resultData = dsResult[0];
        $NC.G_VAR.distributeData = resultData;
        $NC.G_VAR.nextDistribute = false;
    } else {
        refRowData = {};
        resultData = {};
        $NC.G_VAR.distributeData = null;
        $NC.G_VAR.nextDistribute = false;
    }

    $NC.setValue("#edtL1_Outbound_Date", refRowData["OUTBOUND_DATE"]);
    $NC.setValue("#edtL1_Outbound_No", resultData["OUTBOUND_NO"]);
    $NC.setValue("#edtL1_Shipper_Nm", resultData["SHIPPER_NM"]);
    $NC.setValue("#edtL1_Orderer_Msg", resultData["ORDERER_MSG"]);

    $NC.setValue("#edtL1_Item_Cd", refRowData["ITEM_CD"]);
    $NC.setValue("#edtL1_Item_Nm", refRowData["ITEM_NM"]);
    $NC.setValue("#edtL1_Item_State", refRowData["ITEM_STATE_D"]);
    $NC.setValue("#edtL1_Qty_In_Box", refRowData["QTY_IN_BOX"]);

    if (dsResult.length == 0) {
        $NC.setValue("#edtL1_Tot_Entry_Box");
        $NC.setValue("#edtL1_Tot_Entry_Ea");
        $NC.setValue("#edtL1_Tot_Distribute_Box");
        $NC.setValue("#edtL1_Tot_Distribute_Ea");
        $NC.setValue("#edtL1_1st_Distribute_Box");
        $NC.setValue("#edtL1_1st_Distribute_Ea");
    } else {
        $NC.setValue("#edtL1_Tot_Entry_Box", $NC.getBBox(resultData["TOT_ENTRY_QTY"], refRowData["QTY_IN_BOX"]));
        $NC.setValue("#edtL1_Tot_Entry_Ea", $NC.getBEa(resultData["TOT_ENTRY_QTY"], refRowData["QTY_IN_BOX"]));
        $NC.setValue("#edtL1_Tot_Distribute_Box", $NC.getBBox(resultData["TOT_DISTRIBUTE_QTY"], refRowData["QTY_IN_BOX"]));
        $NC.setValue("#edtL1_Tot_Distribute_Ea", $NC.getBEa(resultData["TOT_DISTRIBUTE_QTY"], refRowData["QTY_IN_BOX"]));
        $NC.setValue("#edtL1_1st_Distribute_Box", $NC.getBBox(resultData["REMAIN_QTY"], refRowData["QTY_IN_BOX"]));
        $NC.setValue("#edtL1_1st_Distribute_Ea", $NC.getBEa(resultData["REMAIN_QTY"], refRowData["QTY_IN_BOX"]));
    }

    $NC.setValue("#edtL1_Tot_Entry_Qty", resultData["TOT_ENTRY_QTY"]);
    $NC.setValue("#edtL1_Tot_Distribute_Qty", resultData["TOT_DISTRIBUTE_QTY"]);
    $NC.setValue("#edtL1_Remain_Order_Cnt", resultData["REMAIN_ORDER_CNT"]);
    $NC.setValue("#edtL1_Distribute_Order_Cnt", resultData["DISTRIBUTE_ORDER_CNT"]);

    $NC.setValue("#edtL1_1st_Shelf_No", resultData["SHELF_NO"]);
    $NC.setValue("#edtL1_1st_Distribute_Qty", resultData["REMAIN_QTY"]);
    $NC.setValue("#edtL1_Shelf_No");

    // 다음 선반
    if (dsResult.length > 1) {
        resultData = dsResult[1];
        $NC.G_VAR.nextDistribute = true;

        $NC.setValue("#edtL1_2nd_Shelf_No", resultData["SHELF_NO"]);
        $NC.setValue("#edtL1_2nd_Distribute_Box", $NC.getBBox(resultData["REMAIN_QTY"], refRowData["QTY_IN_BOX"]));
        $NC.setValue("#edtL1_2nd_Distribute_Ea", $NC.getBEa(resultData["REMAIN_QTY"], refRowData["QTY_IN_BOX"]));
        $NC.setValue("#edtL1_2nd_Distribute_Qty", resultData["REMAIN_QTY"]);

        // 다음선반
        if (dsResult.length > 2) {
            resultData = dsResult[2];
            $NC.setValue("#edtL1_3rd_Shelf_No", resultData["SHELF_NO"]);
            $NC.setValue("#edtL1_3rd_Distribute_Box", $NC.getBBox(resultData["REMAIN_QTY"], refRowData["QTY_IN_BOX"]));
            $NC.setValue("#edtL1_3rd_Distribute_Ea", $NC.getBEa(resultData["REMAIN_QTY"], refRowData["QTY_IN_BOX"]));
            $NC.setValue("#edtL1_3rd_Distribute_Qty", resultData["REMAIN_QTY"]);
        } else {
            $NC.setValue("#edtL1_3rd_Shelf_No");
            $NC.setValue("#edtL1_3rd_Distribute_Box");
            $NC.setValue("#edtL1_3rd_Distribute_Ea");
            $NC.setValue("#edtL1_3rd_Distribute_Qty");
        }
    } else {
        $NC.setValue("#edtL1_2nd_Shelf_No");
        $NC.setValue("#edtL1_2nd_Distribute_Box");
        $NC.setValue("#edtL1_2nd_Distribute_Ea");
        $NC.setValue("#edtL1_2nd_Distribute_Qty");
    }
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "출고지시 정보가 없습니다."));
        _Cancel();
        return;
    }

    // 기본 체크, 첫번째 ROW 데이터로
    var resultData = dsResult[0];
    if (resultData.ALL_DISTRIBUTE_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "분배가 완료된 지시서입니다."));
    }

    // 입력 활성, 값 세팅
    $NC.setEnableGroup("#ctrMasterInfoView");
    $NC.setEnableGroup("#ctrDetailView");
    setMasterInputValue(resultData);

    var lastKeyVal = G_GRDMASTER.lastKeyVal;
    // 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDMASTER, dsResult);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    // 초기 재정렬, 분배완료 아래로
    grdMasterOnSort();

    if ($NC.isNotNull(lastKeyVal)) {
        $NC.setGridSelectRow(G_GRDMASTER, {
            selectKey: [
                "BRAND_CD",
                "ITEM_CD",
                "ITEM_STATE",
                "ITEM_LOT"
            ],
            selectVal: lastKeyVal
        });
    }
}

function onGetDetail(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "상품바코드 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    // 상품코드 검색
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: [
            "BRAND_CD",
            "ITEM_CD"
        ],
        searchVal: [
            resultData.O_BRAND_CD,
            resultData.O_ITEM_CD
        ]
    });

    if (searchRow == -1) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "해당 출고차수에 존재하지 않는 상품입니다."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    // 스캔으로 세팅
    $NC.G_VAR.SCANNED_ITEM_BAR_CD = true;
    // 상품 선택
    G_GRDMASTER.lastRow = -1;
    $NC.setGridSelectRow(G_GRDMASTER, searchRow);
    // setFocusScan("#edtItem_Bar_Cd");
}

function onGetDistribute(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "분배가 완료된 상품입니다."));
        if ($NC.isVisible("#ctrDistributeOverlay")) {
            $("#ctrDistributeOverlay").hide();
        }
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }

    setDistributeInputValue(dsResult);

    if (!$NC.isVisible("#ctrDistributeOverlay")) {
        $NC.showOverlay("#ctrDistributeOverlay", {
            title: $NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "분배작업"),
            fullscreen: true,
            onComplete: function() {
                $NC.onGlobalResize();

                setFocusScan("#edtL1_Shelf_No");
            }
        });
    } else {
        setFocusScan("#edtL1_Shelf_No");
    }
}

function onPaperScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtPaper_No");
        scanVal = $NC.getValue($scan);
    }

    // 지시서
    if ($NC.isNull(scanVal)) {
        _Cancel();
        return;
    }

    // 초기화
    _Cancel();

    $NC.G_VAR.lastPaperNo = scanVal;
    $NC.setValue($scan, scanVal);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_OUTBOUND_DATE: $NC.G_USERINFO.WORK_DATE,
        P_PAPER_NO: $NC.G_VAR.lastPaperNo
    };
    // 데이터 조회
    $NC.serviceCall("/PDA_LOC02340E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onPaperError);
}

function onItemScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtItem_Bar_Cd");
        scanVal = $NC.getValue($scan);
    }

    // 상품바코드
    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        setFocusScan($scan);
        return;
    }

    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_DETAIL);

    $NC.G_VAR.lastItemBarCd = scanVal;
    if ($NC.G_VAR.SCANNED_DISPLAY_ITEM_BAR_CD) {
        $NC.setValue("#edtItem_Bar_Cd", scanVal);
    }

    $NC.serviceCall("/PDA_COMMON/getData.do", {
        P_QUERY_ID: "PDA_COMMON.CM_ITEM_CHECK",
        P_QUERY_PARAMS: {
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_ITEM_BAR_CD: $NC.G_VAR.lastItemBarCd
        }
    }, onGetDetail, onItemError);
}

function onShelfScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtL1_Shelf_No");
        scanVal = $NC.getValue($scan);
    }

    // 선반번호
    if ($NC.isNull(scanVal)) {
        setFocusScan($scan);
        return;
    }

    if ($NC.G_VAR.distributeData.SHELF_NO != scanVal) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "현재 작업해야할 선반과 다른 선반을 스캔했습니다. 다시 스캔하십시오."));
        $NC.setValue($scan);
        setFocusScan($scan);
        return;
    }

    _Save();
}

function onSave(ajaxData) {

    var title = $NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "확인"), //
    message = $NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "정상 처리되었습니다."), //
    onSaveAction = $NC.G_VAR.onSaveAction, //
    buttons = {};
    buttons[title] = function() {
        var lastKeyVal;
        switch (onSaveAction) {
            // 분배취소 호출 후
            case "C":
                lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
                    selectKey: [
                        "BRAND_CD",
                        "ITEM_CD",
                        "ITEM_STATE",
                        "ITEM_LOT"
                    ]
                });
                onPaperScan();
                G_GRDMASTER.lastKeyVal = lastKeyVal;
                break;
            // Overlay에서 분배 저장 후
            case "N":
                // 다음 선반이 없으면, 재조회, 다음 상품
                if (!$NC.G_VAR.nextDistribute) {
                    $("#ctrDistributeOverlay").hide();
                    onPaperScan();
                }
                // 다음 선반 조회
                else {
                    $NC.G_VAR.lastSaveSuccess = true;

                    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
                    $NC.serviceCall("/PDA_LOC02340E0/getDataSet.do", {
                        P_QUERY_ID: "PDA_LOC02340E0.RS_DETAIL",
                        P_QUERY_PARAMS: {
                            P_CENTER_CD: refRowData.CENTER_CD,
                            P_BU_CD: refRowData.BU_CD,
                            P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
                            P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
                            P_BRAND_CD: refRowData.BRAND_CD,
                            P_ITEM_CD: refRowData.ITEM_CD,
                            P_ITEM_STATE: refRowData.ITEM_STATE,
                            P_ITEM_LOT: refRowData.ITEM_LOT
                        }
                    }, onGetDistribute, onItemError);
                }
                break;
            default:
                _Cancel();
                break;
        }
        $NC.G_VAR.onSaveAction = "C";
    };

    $NC.showMessage({
        title: title,
        message: message,
        width: 300,
        height: 150,
        autoCloseDelayTime: $ND.C_TIMEOUT_CLOSE,
        buttons: buttons
    });
}

function onPaperError(ajaxData) {

    $NC.onError(ajaxData);
    setFocusScan();
}

function onItemError(ajaxData) {

    $NC.onError(ajaxData);

    if ($NC.isVisible("#ctrDistributeOverlay")) {
        $("#ctrDistributeOverlay").hide();

        var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
            selectKey: [
                "BRAND_CD",
                "ITEM_CD",
                "ITEM_STATE",
                "ITEM_LOT"
            ]
        });
        onPaperScan();
        G_GRDMASTER.lastKeyVal = lastKeyVal;
        return;
    }

    setFocusScan("#edtItem_Bar_Cd");
}

function onShelfError(ajaxData) {

    if ($NC.isNotNull(ajaxData)) {
        $NC.onError(ajaxData);
    }
    setFocusScan("#edtL1_Shelf_No");
}

function btnDistributeCancelOnClick() {

    if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "지시서를 먼저 스캔하십시오."));
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "처리할 상품 내역이 없습니다."));
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (refRowData.DISTRIBUTE_QTY == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "분배되지 않은 상품입니다."));
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "분배취소 처리하시겠습니까?"))) {
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }

    $NC.G_VAR.onSaveAction = "C";
    $NC.serviceCall("/PDA_LOC02340E0/callLOProcDistributeCancel.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
        P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
        P_BRAND_CD: refRowData.BRAND_CD,
        P_ITEM_CD: refRowData.ITEM_CD,
        P_ITEM_STATE: refRowData.ITEM_STATE,
        P_ITEM_LOT: refRowData.ITEM_LOT,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onItemError);
}

function btnDistributeOnClick() {

    $NC.G_VAR.distributeData = null;
    $NC.G_VAR.nextDistribute = false;
    $NC.G_VAR.lastSaveSuccess = false;

    if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "지시서를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "처리할 상품 내역이 없습니다."));
        setFocusScan();
        return;
    }

    if ($NC.isNull($NC.G_VAR.lastItemBarCd)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "분배할 상품을 스캔하십시오."));
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (refRowData.DISTRIBUTE_YN == $ND.C_YES || refRowData.REMAIN_QTY == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02340E0.XXX", "분배가 완료된 상품입니다."));
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }

    $NC.serviceCall("/PDA_LOC02340E0/getDataSet.do", {
        P_QUERY_ID: "PDA_LOC02340E0.RS_DETAIL",
        P_QUERY_PARAMS: {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
            P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
            P_BRAND_CD: refRowData.BRAND_CD,
            P_ITEM_CD: refRowData.ITEM_CD,
            P_ITEM_STATE: refRowData.ITEM_STATE,
            P_ITEM_LOT: refRowData.ITEM_LOT
        }
    }, onGetDistribute, onItemError);
}

function btnDistributeCloseOnClick() {

    $("#ctrDistributeOverlay").hide();

    if ($NC.G_VAR.lastSaveSuccess) {
        var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
            selectKey: [
                "BRAND_CD",
                "ITEM_CD",
                "ITEM_STATE",
                "ITEM_LOT"
            ]
        });
        onPaperScan();
        G_GRDMASTER.lastKeyVal = lastKeyVal;
    } else {
        setFocusScan("#edtItem_Bar_Cd");
    }
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    if (!permission.canSave) {
        $("#btnDistribute").addClass("styDisabled");
    }
    if (!permission.canConfirmCancel) {
        $("#btnDistributeCancel").addClass("styDisabled");
    }
}