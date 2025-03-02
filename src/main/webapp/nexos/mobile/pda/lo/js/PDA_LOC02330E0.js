/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LOC02330E0
 *  프로그램명         : PDA 출고피킹(파렛트ID)
 *  프로그램설명       : PDA 출고피킹(파렛트ID)
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
        lastPaperNo: null,
        lastPalletId: null,

        // 체크할 정책 값
        policyVal: {
            LS210: "", // 재고 관리 기준
            LO610: "" // [PDA] 출고피킹(파렛트ID) 처리방식
        }
    });

    // 초기 숨김 처리
    $("#edtOutbound_No").hide();
    $("#ctrDelivery").hide();
    $("#ctrShipper").hide();

    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 취소버튼 클릭 -> _Cancel로 처리
    $("#btnCancel").click(_Cancel);
    // 처리버튼 클릭 -> _Save로 처리
    $("#btnSave").click(_Save);
    // 피킹 처리
    $("#btnPick").click(onPickYnApply);
    // 수량 입력
    $("#lblPick_Qty").click(onQtyApply);

    // 그리드 초기화
    grdMasterInitialize();

    // 정책 값 읽기
    setPolicyValInfo();
    // 권한 설정
    setUserProgramPermission();
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
            setPolicyValInfo();
            break;
        case "BU_CD":
            setPolicyValInfo();
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
        case "PALLET_ID":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onPalletIdScan(view, val);
            break;
        default:
            grdMasterOnCellChange(e, {
                view: view,
                col: id,
                val: val
            });
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
        case "PALLET_ID":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onPalletIdScan(view, $NC.getValue(view));
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
        alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "지시서를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "처리할 상품 내역이 없습니다."));
        setFocusScan();
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
        checkColumnId: $ND.C_NULL, // 체크없이 전체
        compareFn: function(rowData) {
            // 수정한 데이터 중 피킹여부가 Y인 것만 처리대상
            return rowData.PICK_YN == $ND.C_YES && rowData.CRUD != $ND.C_DV_CRUD_R;
        },
        dataType: "S", // 문자열 결합
        valueColumns: [
            "LOCATION_CD",
            "PALLET_ID",
            "BRAND_CD",
            "ITEM_CD",
            "ITEM_STATE",
            "ITEM_LOT",
            "VALID_DATE",
            "BATCH_NO",
            "ENTRY_QTY",
            "PICK_QTY",
            "VIRTUAL_YN"
        ]
    });

    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹작업 후 처리하십시오.\n(변경사항 없음)"));
        setFocusScan();
        return;
    }

    var sumVals = $NC.getGridSumVal(G_GRDMASTER, {
        sumKey: [
            "ENTRY_QTY",
            "PICK_QTY"
        ]
    });

    if (sumVals.ENTRY_QTY == sumVals.PICK_QTY) {
        if (!confirm($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹완료 처리하시겠습니까?"))) {
            setFocusScan();
            return;
        }
    } else {
        if (!confirm($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "지시수량과 피킹수량이 동일하지 않습니다.\n피킹완료 처리하시겠습니까?"))) {
            setFocusScan();
            return;
        }
    }

    var refRowData = G_GRDMASTER.data.getItem(0);
    $NC.serviceCall("/PDA_LOC02330E0/callLOProcPick.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: refRowData.OUTBOUND_NO,
        P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
        P_ZONE_CD: refRowData.ZONE_CD,
        P_BANK_CD: refRowData.BANK_CD,
        P_PAPER_DIV: refRowData.PAPER_DIV,
        P_OUTBOUND_CNT: refRowData.OUTBOUND_CNT,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onPalletIdError);
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
        $NC.G_VAR.lastPalletId = null;

        // 값 초기화
        $NC.setValue("#edtPaper_No");
        setMasterInputValue();

        $NC.clearGridData(G_GRDMASTER);
        // 모두 비활성
        $NC.setEnableGroup("#ctrDetailView", false);

        // 기본 토탈피킹으로 표시
        $NC.setValue("#lblOutbound_Batch", $NC.getDisplayName("OUTBOUND_BATCH"));
        $NC.setVisible("#edtOutbound_Batch");
        $NC.setVisible("#edtOutbound_No", false);
        $NC.setVisible("#ctrDelivery", false);
        $NC.setVisible("#ctrShipper", false);

        // 리사이즈 호출
        $NC.onGlobalResize();
    }

    if (clearType <= $ND.C_CLEAR_TYPE_DETAIL) {
        // 전역 변수 초기화
        $NC.G_VAR.lastPalletId = null;
        // 값 초기화
        setDetailInputValue();

        if (clearType == $ND.C_CLEAR_TYPE_DETAIL) {
            $NC.setEnable("#edtPallet_Id");
        }
    }

    if (clearType == $ND.C_CLEAR_TYPE_DETAIL) {
        setFocusScan("#edtPallet_Id");
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
    // 스캔 Element - 파렛트ID
    if ($view.prop("id") == "edtPallet_Id") {
        // 비활성이면 지시서로
        if (!$NC.isEnable($view)) {
            setFocusScan();
        }
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        // 지시서 스캔하여 정상 조회되어 있으면 파렛트ID에 포커
        if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
            setFocusScan();
        } else {
            setFocusScan("#edtPallet_Id");
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
        id: "RLOCATION_CD",
        field: "RLOCATION_CD",
        name: "로케이션",
        minWidth: 80,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "상품LOT",
        minWidth: 120
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        minWidth: 120
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "지시수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PICK_QTY",
        field: "PICK_QTY",
        name: "피킹수량",
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
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        minWidth: 150
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
                // 피킹을 안했을 경우 기본 색상
                if (rowData.PICK_YN == $ND.C_NO) {
                    return;
                }

                // 피킹했을 경우, 수량 동일
                if (rowData.ENTRY_QTY == rowData.PICK_QTY) {
                    return "styEqual";
                }

                // 등록수량보다 작을 경우
                return "styDiff";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "PDA_LOC02330E0.RS_MASTER",
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

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var changeQty, pickQty, neededSort = false;
    switch (args.col) {
        case "PICK_BOX":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹BOX 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            pickQty = $NC.getBQty(changeQty, rowData.PICK_EA, rowData.QTY_IN_BOX);
            if (rowData.ENTRY_QTY < pickQty) {
                alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹수량이 지시수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.PICK_BOX = changeQty;
            rowData.PICK_QTY = pickQty;
            $NC.setValue("#edtPick_Qty", rowData.PICK_QTY);

            if (rowData.PICK_YN == $ND.C_NO) {
                rowData.PICK_YN = $ND.C_YES;
                neededSort = true;
            }
            break;
        case "PICK_EA":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹EA 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            pickQty = $NC.getBQty(rowData.PICK_BOX, changeQty, rowData.QTY_IN_BOX);
            if (rowData.ENTRY_QTY < pickQty) {
                alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹수량이 지시수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.PICK_EA = changeQty;
            rowData.PICK_QTY = pickQty;
            $NC.setValue("#edtPick_Qty", rowData.PICK_QTY);

            if (rowData.PICK_YN == $ND.C_NO) {
                rowData.PICK_YN = $ND.C_YES;
                neededSort = true;
            }
            break;
        case "PICK_QTY":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            if (rowData.ENTRY_QTY < changeQty) {
                alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹수량이 지시수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.PICK_BOX = $NC.getBBox(changeQty, rowData.QTY_IN_BOX);
            rowData.PICK_EA = $NC.getBEa(changeQty, rowData.QTY_IN_BOX);
            rowData.PICK_QTY = changeQty;

            $NC.setValue("#edtPick_Box", rowData.PICK_BOX);
            $NC.setValue("#edtPick_Ea", rowData.PICK_EA);

            if (rowData.PICK_YN == $ND.C_NO) {
                rowData.PICK_YN = $ND.C_YES;
                neededSort = true;
            }

            // 피킹수량일 경우 파렛트ID으로
            setFocusScan("#edtPallet_Id");
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    // 정렬이 필요할 경우 정렬
    if (neededSort) {
        grdMasterOnSort();
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.PICK_QTY)) {
            alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹 수량을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            setFocusScan("#edtPick_Qty");
            return false;
        }
        if (Number(rowData.PICK_QTY) < 0) {
            alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹 수량을 정확히 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            setFocusScan("#edtPick_Qty");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnSort() {

    $NC.setGridSort(G_GRDMASTER, {
        sortField: true,
        sortColumns: [
            {
                field: "PICK_YN",
                sortAsc: true
            },
            {
                field: "RVIRTUAL_YN",
                sortAsc: true
            },
            {
                field: "LOC_ORDER",
                sortAsc: true
            },
            {
                field: "LOCATION_CD",
                sortAsc: true
            },
            {
                field: "PALLET_ID",
                sortAsc: true
            },
            {
                field: "KEEP_DIV",
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
                field: "VALID_DATE",
                sortAsc: true
            },
            {
                field: "BATCH_NO",
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
    $NC.setValue("#edtOutbound_No", rowData["OUTBOUND_NO"]);
    $NC.setValue("#edtDelivery_Nm", rowData["DELIVERY_NM"]);
    $NC.setValue("#edtShipper_Nm", rowData["SHIPPER_NM"]);

    // 토탈피킹
    if (rowData.PAPER_DIV == "TP") {
        $NC.setValue("#lblOutbound_Batch", $NC.getDisplayName("OUTBOUND_BATCH"));
        $NC.setVisible("#edtOutbound_Batch");
        $NC.setVisible("#edtOutbound_No", false);
        $NC.setVisible("#ctrDelivery", false);
        $NC.setVisible("#ctrShipper", false);
    }
    // 오더피킹
    else {
        $NC.setValue("#lblOutbound_Batch", $NC.getDisplayName("OUTBOUND_NO"));
        $NC.setVisible("#edtOutbound_Batch", false);
        $NC.setVisible("#edtOutbound_No");
        // B2C
        if (rowData.INOUT_SUB_CD == "DM") {
            $NC.setVisible("#ctrDelivery", false);
            $NC.setVisible("#ctrShipper");
        }
        // B2B
        else {
            $NC.setVisible("#ctrDelivery");
            $NC.setVisible("#ctrShipper", false);
        }
    }
    // 리사이즈 호출
    $NC.onGlobalResize();
}

function setDetailInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.G_VAR.lastPalletId = rowData["PALLET_ID"];
    $NC.setValue("#edtPallet_Id", rowData["PALLET_ID"]);
    $NC.setValue("#edtItem_Cd", rowData["ITEM_CD"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtItem_State", $NC.getDisplayCombo(rowData["ITEM_STATE"], rowData["ITEM_STATE_D"]));
    $NC.setValue("#edtItem_Lot", rowData["ITEM_LOT"]);
    $NC.setValue("#edtValid_Date", rowData["VALID_DATE"]);
    $NC.setValue("#edtBatch_No", rowData["BATCH_NO"]);
    $NC.setValue("#edtQty_In_Box", rowData["QTY_IN_BOX"]);
    $NC.setValue("#edtLocation_Cd", rowData["LOCATION_CD"]);
    $NC.setValue("#edtEntry_Box", rowData["ENTRY_BOX"]);
    $NC.setValue("#edtEntry_Ea", rowData["ENTRY_EA"]);
    $NC.setValue("#edtEntry_Qty", rowData["ENTRY_QTY"]);
    $NC.setValue("#edtPick_Box", rowData["PICK_BOX"]);
    $NC.setValue("#edtPick_Ea", rowData["PICK_EA"]);
    $NC.setValue("#edtPick_Qty", rowData["PICK_QTY"]);

    // 입력 활성/비활성
    $NC.setEnableGroup("#ctrDetailView", $NC.isNotNull($NC.G_VAR.lastPalletId));

    // 가입고 피킹불가
    $NC.setEnable("#edtPick_Box", rowData.RVIRTUAL_YN == $ND.C_NO);
    $NC.setEnable("#edtPick_Ea", rowData.RVIRTUAL_YN == $ND.C_NO);
    $NC.setEnable("#edtPick_Qty", rowData.RVIRTUAL_YN == $ND.C_NO);

    setFocusScan("#edtPallet_Id");
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "출고지시 정보가 없습니다."));
        _Cancel();
        return;
    }

    // 기본 체크, 첫번째 ROW 데이터로
    var resultData = dsResult[0];
    if (resultData.OUTBOUND_STATE != $ND.C_STATE_DIRECTIONS) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "출고지시 상태가 아닙니다. 확인 후 작업하십시오."));
        _Cancel();
        return;
    }

    if (resultData.ALL_PICK_YN == $ND.C_YES) {
        if (!confirm("피킹 완료된 지시서입니다.\n재피킹 처리하시겠습니까?")) {
            _Cancel();
            return;
        }
    }

    // 입력 활성, 값 세팅
    $NC.setEnableGroup("#ctrMasterInfoView");
    $NC.setEnableGroup("#ctrDetailView");
    setMasterInputValue(resultData);

    // 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDMASTER, dsResult);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    // 초기 재정렬, 피킹완료 아래로
    grdMasterOnSort();
}

function onGetDetail() {

    // 파렛트ID 검색
    var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
        searchKey: "PALLET_ID",
        searchVal: $NC.G_VAR.lastPalletId
    });

    if (searchRows.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "피킹지시서에 존재하지 않는 파렛트ID입니다."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    // 피킹 안한 상품 검색
    var rIndex, rCount, rowData, targetRow = -1;
    for (rIndex = 0, rCount = searchRows.length; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(searchRows[rIndex]);
        if (rowData.PICK_YN == $ND.C_NO) {
            targetRow = searchRows[rIndex];
            break;
        }
    }

    var pickYn = $ND.C_NO;
    // 해당 파렛트ID 피킹 완료면, 메시지 표시 후 첫번째 상품 선택
    if (targetRow == -1) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "해당 파렛트ID는 피킹이 완료되었습니다."));
        targetRow = searchRows[0];
        pickYn = $ND.C_YES;
    }

    // 상품 선택
    G_GRDMASTER.lastRow = -1;
    $NC.setGridSelectRow(G_GRDMASTER, targetRow);
    // setFocusScan("#edtPallet_Id");

    // 정책 - [PDA]출고피킹(파렛트ID) 처리방식
    // 2 - 자동처리
    if (pickYn == $ND.C_NO && $NC.G_VAR.policyVal.LO610 == "2") {
        // 파렛트ID 스캔시 완료 처리
        onQtyApply();
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
    $NC.serviceCall("/PDA_LOC02330E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onPaperError);
}

function onPalletIdScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtPallet_Id");
        scanVal = $NC.getValue($scan);
    }

    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        setFocusScan($scan);
        return;
    }

    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_DETAIL);

    $NC.G_VAR.lastPalletId = scanVal;
    $NC.setValue($scan, scanVal);

    onGetDetail();

}

function onSave(ajaxData) {

    var title = $NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "확인"), //
    message = $NC.getDisplayMsg("JS.PDA_LOC02330E0.XXX", "정상 처리되었습니다."), //
    buttons = {};
    buttons[title] = function() {
        _Cancel();
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
    _Cancel();
    setFocusScan();
}

function onPalletIdError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel($ND.C_CLEAR_TYPE_DETAIL);
    setFocusScan("#edtPallet_Id");
}

function onPickYnApply() {

    if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan();
        return;
    }

    if ($NC.isNull($NC.G_VAR.lastPalletId)) {
        setFocusScan();
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        setFocusScan();
        return;
    }

    // 가입고, 미입고는 처리 안함
    if (rowData.RVIRTUAL_YN == $ND.C_YES) {
        setFocusScan();
        return;
    }

    // 피킹했을 경우 처리 안함
    if (rowData.PICK_YN == $ND.C_YES) {
        setFocusScan();
        return;
    }

    rowData.PICK_YN = $ND.C_YES;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    grdMasterOnSort();
}

function onQtyApply() {

    if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan();
        return;
    }

    if ($NC.isNull($NC.G_VAR.lastPalletId)) {
        setFocusScan();
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        setFocusScan();
        return;
    }

    // 가입고, 미입고는 처리 안함
    if (rowData.RVIRTUAL_YN == $ND.C_YES) {
        setFocusScan();
        return;
    }

    // 수량이 동일하고 피킹했을 경우는 처리 안함
    if (rowData.PICK_YN == $ND.C_YES && rowData.ENTRY_QTY == rowData.PICK_QTY) {
        setFocusScan();
        return;
    }

    var neededSort = false;
    rowData.PICK_BOX = rowData.ENTRY_BOX;
    rowData.PICK_EA = rowData.ENTRY_EA;
    rowData.PICK_QTY = rowData.ENTRY_QTY;

    $NC.setValue("#edtPick_Box", rowData.PICK_BOX);
    $NC.setValue("#edtPick_Ea", rowData.PICK_EA);
    $NC.setValue("#edtPick_Qty", rowData.PICK_QTY);

    if (rowData.PICK_YN == $ND.C_NO) {
        rowData.PICK_YN = $ND.C_YES;
        neededSort = true;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    // 정렬이 필요할 경우 정렬
    if (neededSort) {
        grdMasterOnSort();
    }
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    if (!permission.canSave) {
        $("#btnSave").addClass("styDisabled");
    }
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD
    }, function() {
        // 재고관리기준에 따라 유효일자/배치번호별 표시/비표시
        // 1 - 입고일자별, 2 - 입고일자, 유효일자/배치번호별
        if ($NC.G_VAR.policyVal.LS210 == "2") {
            $NC.setVisible("#ctrValidDate");
            // $NC.setVisible("#ctrBatchNo");
        } else {
            $NC.setVisible("#ctrValidDate", false);
            // $NC.setVisible("#ctrBatchNo", false);
        }
    });
}