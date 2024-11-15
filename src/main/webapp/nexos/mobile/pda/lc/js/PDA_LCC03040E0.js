/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LCC03040E0
 *  프로그램명         : PDA 재고이동
 *  프로그램설명       : PDA 재고이동 화면 Javascript
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
        SCANNED_INC_QTY: false, // 기본값 false
        SCANNED_DISPLAY_ITEM_BAR_CD: true, // 기본값 true
        SCANNED_LOCATION_CD: false,
        SCANNED_ITEM_BAR_CD: false,

        ignoreKeyUp: false,
        lastPaperNo: null,
        lastLocationCd: null,
        lastItemBarCd: null,

        // 체크할 정책 값
        policyVal: {
            LS210: "" // 재고 관리 기준
        }
    });

    $NC.setVisible("#tdQDsp_Brand_Nm", false);
    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 취소버튼 클릭 -> _Cancel로 처리
    $("#btnCancel").click(_Cancel);
    // 처리버튼 클릭 -> _Save로 처리
    $("#btnSave").click(_Save);
    $("#btnAll").click(btnAllOnClick);
    // 수량 입력
    $("#lblConfirm_Qty").click(onQtyApply);

    // 그리드 초기화
    grdMasterInitialize();

    // 정책 값 읽기
    setPolicyValInfo();
    // 권한 설정
    setUserProgramPermission();
    // 환경 세팅 읽기
    if ($Android.isValid()) {
        var props = [
            "SCANNED_INC_QTY",
            "SCANNED_DISPLAY_ITEM_BAR_CD"
        ];
        // 프로그램 단위 환경 세팅은 PROGRAM_ID + "," + propertyName으로 읽기
        $NC.G_VAR[props[0]] = $Android.callby("getBooleanGlobalProp", props[0], $NC.G_VAR[props[0]]);
        $NC.G_VAR[props[1]] = $Android.callby("getBooleanGlobalProp", props[1], $NC.G_VAR[props[1]]);
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
        case "LOCATION_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onLocationScan(view, val);
            break;
        case "ITEM_BAR_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onItemScan(view, val);
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
        case "LOCATION_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onLocationScan(view, $NC.getValue(view));
            break;
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

    // 저장 전 Validation
    if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "지시서를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "처리할 상품 내역이 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
        checkColumnId: $ND.C_NULL, // 체크없이 전체
        dataType: "S", // 문자열 결합
        valueColumns: [
            "CONFIRM_QTY",
            "LINE_NO"
        ]
    });

    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "처리할 상품 내역이 없습니다. 재고이동할 상품을 선택하고 이동수량을 입력하십시오."));
        setFocusScan();
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "재고이동 처리하시겠습니까?"))) {
        setFocusScan();
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(0);
    $NC.serviceCall("/PDA_LCC03040E0/callLCProcMove.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_MOVE_DATE: $NC.G_USERINFO.WORK_DATE,
        P_MOVE_NO: refRowData.MOVE_NO,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onLocationError);
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
    // if ($NC.isNull(clearType)) {
    // clearType = $ND.C_CLEAR_TYPE_ALL;
    // }
    // clearType가 취소 버튼 클릭 Event Object일 경우도 있음
    if (clearType instanceof $.Event || $NC.isNull(clearType)) {
        clearType = $ND.C_CLEAR_TYPE_ALL;
    }

    if (clearType <= $ND.C_CLEAR_TYPE_MASTER) {
        // 전역 변수 초기화
        $NC.G_VAR.lastPaperNo = null;
        $NC.G_VAR.lastLocationCd = null;
        $NC.G_VAR.lastItemBarCd = null;

        // 값 초기화
        $NC.setValue("#edtPaper_No");
        setMasterInputValue();

        $NC.clearGridData(G_GRDMASTER);
        // 모두 비활성
        $NC.setEnableGroup("#ctrDetailView", false);
    }

    if (clearType <= $ND.C_CLEAR_TYPE_DETAIL) {
        // 전역 변수 초기화
        $NC.G_VAR.lastLocationCd = null;
        $NC.G_VAR.lastItemBarCd = null;
        // 값 초기화
        setDetailInputValue();

        if (clearType == $ND.C_CLEAR_TYPE_DETAIL) {
            $NC.setEnable("#edtLocation_Cd");
        }
    }

    if (clearType == $ND.C_CLEAR_TYPE_DETAIL) {
        setFocusScan("#edtLocation_Cd");
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
    if ($view.prop("id") == "edtLocation_Cd") {
        // 비활성이면 지시서로
        if (!$NC.isEnable($view)) {
            setFocusScan("#edtPaper_No");
        }
        return;
    }
    // 스캔 Element - 상품바코드
    if ($view.prop("id") == "edtItem_Bar_Cd") {
        // 비활성이면 로케이션으로
        if (!$NC.isEnable($view)) {
            setFocusScan("#edtLocation_Cd");
        }
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        // 지시서 스캔하여 정상 조회되어 있으면 상품바코드에 포커스
        if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
            setFocusScan();
        } else {
            if ($NC.G_VAR.SCANNED_INC_QTY) {
                setFocusScan("#edtLocation_Cd");
            } else {
                setFocusScan("#edtConfirm_Qty");
            }
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
        minWidth: 30,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        minWidth: 80
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        minWidth: 120
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_D",
        field: "ITEM_STATE_D",
        name: "상태",
        minWidth: 70
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "이동수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        minWidth: 100
    });
    // $NC.setGridColumn(columns, {
    // id: "BRAND_NM",
    // field: "BRAND_NM",
    // name: "브랜드명"
    // });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        rowHeight: 30,
        frozenColumn: 0,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.ENTRY_QTY == rowData.CONFIRM_QTY) {
                    return "styEqual";
                }
                if (rowData.CONFIRM_QTY > 0) {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "PDA_LCC03040E0.RS_MASTER",
        sortCol: "ROW_NO",
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

    var changeQty, confirmQty;
    switch (args.col) {
        case "CONFIRM_BOX":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "이동BOX 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            confirmQty = $NC.getBQty(changeQty, rowData.CONFIRM_EA, rowData.QTY_IN_BOX);
            if (rowData.ENTRY_QTY < confirmQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "이동수량이 재고수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.CONFIRM_BOX = changeQty;
            rowData.CONFIRM_QTY = confirmQty;
            rowData.INSPECT_YN = $ND.C_YES;

            $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
            break;
        case "CONFIRM_EA":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "이동EA 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            confirmQty = $NC.getBQty(rowData.CONFIRM_BOX, changeQty, rowData.QTY_IN_BOX);
            if (rowData.ENTRY_QTY < confirmQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "이동수량이 재고수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.CONFIRM_EA = changeQty;
            rowData.CONFIRM_QTY = confirmQty;
            rowData.INSPECT_YN = $ND.C_YES;

            $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
            break;
        case "CONFIRM_QTY":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "이동 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            if (rowData.ENTRY_QTY < changeQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "이동수량이 재고수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.CONFIRM_BOX = $NC.getBBox(changeQty, rowData.QTY_IN_BOX);
            rowData.CONFIRM_EA = $NC.getBEa(changeQty, rowData.QTY_IN_BOX);
            rowData.CONFIRM_QTY = changeQty;
            rowData.INSPECT_YN = $ND.C_YES;

            $NC.setValue("#edtConfirm_Box", rowData.CONFIRM_BOX);
            $NC.setValue("#edtConfirm_Ea", rowData.CONFIRM_EA);

            // 검수수량일 경우 로케이션으로
            setFocusScan("#edtLocation_Cd");
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    grdMasterOnSort();
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CONFIRM_QTY)) {
            alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "검수 수량을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            setFocusScan("#edtConfirm_Qty");
            return false;
        }
        if (Number(rowData.CONFIRM_QTY) < 0) {
            alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "검수 수량을 정확히 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            setFocusScan("#edtConfirm_Qty");
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
                field: "INSPECT_YN",
                sortAsc: true
            },
            {
                field: "LOCATION_CD",
                sortAsc: true
            },
            {
                field: "ITEM_CD",
                sortAsc: true
            },
            {
                field: "BRAND_CD",
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
    $NC.setValue("#edtMove_Date", rowData["MOVE_DATE"]);
    $NC.setValue("#edtMove_No", rowData["MOVE_NO"]);

    // 리사이즈 호출
    $NC.onGlobalResize();

    setFocusScan("#edtLocation_Cd");
}

function setDetailInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.G_VAR.lastLocationCd = rowData["MLOCATION_CD"];
    $NC.G_VAR.lastItemBarCd = rowData["ITEM_BAR_CD"];
    if ($NC.G_VAR.SCANNED_DISPLAY_ITEM_BAR_CD) {
        $NC.setValue("#edtItem_Bar_Cd", $NC.isNull(rowData["ITEM_BAR_CD"]) ? $NC.G_VAR.lastItemBarCd : rowData["ITEM_BAR_CD"]);
    } else {
        $NC.setValue("#edtItem_Bar_Cd", $NC.G_VAR.lastItemBarCd);
    }

    $NC.setValue("#edtLocation_Cd", rowData["LOCATION_CD"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtItem_State", $NC.getDisplayCombo(rowData["ITEM_STATE"], rowData["ITEM_STATE_D"]));
    $NC.setValue("#edtValid_Date", rowData["VALID_DATE"]);
    $NC.setValue("#edtBatch_No", rowData["BATCH_NO"]);
    $NC.setValue("#edtQty_In_Box", rowData["QTY_IN_BOX"]);
    $NC.setValue("#edtBox_In_Plt", rowData["BOX_IN_PLT"]);
    $NC.setValue("#edtMove_Location_Cd", rowData["MLOCATION_CD"]);
    $NC.setValue("#edtEntry_Box", rowData["ENTRY_BOX"]);
    $NC.setValue("#edtEntry_Ea", rowData["ENTRY_EA"]);
    $NC.setValue("#edtEntry_Qty", rowData["ENTRY_QTY"]);
    $NC.setValue("#edtConfirm_Box", rowData["CONFIRM_BOX"]);
    $NC.setValue("#edtConfirm_Ea", rowData["CONFIRM_EA"]);
    $NC.setValue("#edtConfirm_Qty", rowData["CONFIRM_QTY"]);
    // 입력 활성/비활성
    $NC.setEnableGroup("#ctrDetailView", $NC.isNotNull($NC.G_VAR.lastItemBarCd));

    if ($NC.G_VAR.SCANNED_LOCATION_CD) {
        $NC.G_VAR.SCANNED_LOCATION_CD = false;

        setFocusScan("#edtItem_Bar_Cd");
    } else if ($NC.G_VAR.SCANNED_ITEM_BAR_CD) {
        $NC.G_VAR.SCANNED_ITEM_BAR_CD = false;

        setFocusScan("#edtConfirm_Qty");
    } else {
        setFocusScan("#edtLocation_cd");
    }
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "로케이션이동지시 정보가 없습니다."));
        _Cancel();
        return;
    }

    var resultData = dsResult[0];
    if (resultData.CONFIRM_YN != $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02310E0.XXX", "로케이션이동이 완료 된 상태입니다. 확인 후 작업하십시오."));
        _Cancel();
        return;
    }

    if (resultData.ALL_INSPECT_YN == $ND.C_YES) {
        if (!confirm("검수 완료된 지시서입니다.\n재검수 처리하시겠습니까?")) {
            _Cancel();
            return;
        }
    }

    // 입력 활성, 값 세팅
    $NC.setEnableGroup("#ctrDetailView");
    setMasterInputValue(resultData);

    // 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDMASTER, dsResult);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    // 초기 재정렬, 피킹완료 아래로
    grdMasterOnSort();
}

function onGetLocation(ajaxData) {

    // 로케이션 검색
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: "LOCATION_CD",
        searchVal: $NC.G_VAR.lastLocationCd
    });

    if (searchRow == -1) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "재고이동지시서에 존재하지 않는 로케이션입니다."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    // 스캔으로 세팅
    $NC.G_VAR.SCANNED_LOCATION_CD = true;
    // 상품 선택
    G_GRDMASTER.lastRow = -1;
    $NC.setGridSelectRow(G_GRDMASTER, searchRow);
}

function onGetItem(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "상품바코드 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    // 상품코드 검색
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: [
            "LOCATION_CD",
            "BRAND_CD",
            "ITEM_CD"
        ],
        searchVal: [
            rowData.LOCATION_CD,
            resultData.O_BRAND_CD,
            resultData.O_ITEM_CD
        ]
    });

    if (searchRow == -1) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "로케이션에 존재하지 않는 상품입니다."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    // 스캔으로 세팅
    $NC.G_VAR.SCANNED_ITEM_BAR_CD = true;
    // 상품 선택
    G_GRDMASTER.lastRow = -1;
    $NC.setGridSelectRow(G_GRDMASTER, searchRow);
}

function onGetSub(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "로케이션 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }

    setFocusScan("#edtMove_Location_Cd");
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
        P_MOVE_DATE: $NC.G_USERINFO.WORK_DATE,
        P_PAPER_NO: $NC.G_VAR.lastPaperNo
    };
    // 데이터 조회
    $NC.serviceCall("/PDA_LCC03040E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onPaperError);
}

function onLocationScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtLocation_Cd");
        scanVal = $NC.getValue($scan);
    }

    // 로케이션
    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        setFocusScan($scan);
        return;
    }

    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_DETAIL);

    $NC.G_VAR.lastLocationCd = scanVal;
    $NC.setValue($scan, scanVal);

    onGetLocation();
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
    }, onGetItem, onItemError);
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

    if ($NC.isNull($NC.G_VAR.lastLocationCd)) {
        setFocusScan();
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        setFocusScan();
        return;
    }

    if (rowData.ENTRY_QTY == rowData.CONFIRM_QTY) {
        setFocusScan();
        return;
    }

    rowData.CONFIRM_BOX = rowData.ENTRY_BOX;
    rowData.CONFIRM_EA = rowData.ENTRY_EA;
    rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
    rowData.INSPECT_YN = $ND.C_YES;

    $NC.setValue("#edtConfirm_Box", rowData.CONFIRM_BOX);
    $NC.setValue("#edtConfirm_Ea", rowData.CONFIRM_EA);
    $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    grdMasterOnSort();
}

function onSave(ajaxData) {

    var title = $NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "확인"), //
    message = $NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "정상 처리되었습니다."), //
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

function onLocationError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel();
    setFocusScan();
}

function onItemError(ajaxData) {

    $NC.onError(ajaxData);

    setFocusScan("#edtItem_Bar_Cd");
}

function btnAllOnClick() {

    // 저장 전 Validation
    if ($NC.isNull($NC.G_VAR.lastPaperNo)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "지시서를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "처리할 상품 내역이 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.PDA_LCC03040E0.XXX", "전체 상품의 이동수량을 입력 처리하시겠습니까? "))) {
        return;
    }

    // 전체 데이터 이동수량 입력
    var rIndex, rCount, rowData;
    G_GRDMASTER.data.beginUpdate();
    try {
        for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(rIndex);

            // 수량 입력
            rowData.CONFIRM_BOX = rowData.ENTRY_BOX;
            rowData.CONFIRM_EA = rowData.ENTRY_EA;
            rowData.CONFIRM_QTY = rowData.ENTRY_QTY;

            // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
            $NC.setGridApplyChange(G_GRDMASTER, rowData);
        }
    } finally {
        G_GRDMASTER.data.endUpdate();

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

        $NC.setValue("#edtConfirm_Box", rowData.CONFIRM_BOX);
        $NC.setValue("#edtConfirm_Ea", rowData.CONFIRM_EA);
        $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);

        setFocusScan("#edtLocation_Cd");
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