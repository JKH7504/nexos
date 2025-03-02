/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LIC02360E0
 *  프로그램명         : PDA 입고적치[멀티상품매핑]
 *  프로그램설명       : PDA 입고적치[멀티상품매핑] 화면 Javascript
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
        lastPalletId: null,
        lastLocationCd: null,

        // 체크할 정책 값
        policyVal: {
            LI230: "", // 파렛트ID 매핑 기준
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
    // 수량 입력
    $("#lblConfirm_Qty").click(onQtyApply);
    // 로케이션 입력
    $("#lblPutaway_Location_Cd").click(onLocationApply);

    $NC.setInitDatePicker("#dtpValid_Date", null, "N");

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
        case "PALLET_ID":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onPalletScan(view, val);
            break;
        case "PUTAWAY_LOCATION_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onLocationScan(view, val);
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
        case "PALLET_ID":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onPalletScan(view, $NC.getValue(view));
            break;
        case "PUTAWAY_LOCATION_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onLocationScan(view, $NC.getValue(view));
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
    if ($NC.isNull($NC.G_VAR.lastPalletId)) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "파렛트ID를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "처리할 상품 내역이 없습니다."));
        setFocusScan();
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(0);
    var PUTAWAY_LOCATION_CD = $NC.getValue("#edtPutaway_Location_Cd");

    // 정책이 유통기한 관리일 경우 유통기한 체크, 검수 안했을 경우
    if (refRowData.INSPECT_YN == $ND.C_NO) {
        // 유통기한필수대상 여부체크, 제조번호필수대상 여부 체크
        var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
            compareFn: function(rowData) {
                // 필수대상 미입력의 경우
                return rowData.VALID_DATE_REQ_YN == $ND.C_YES && $NC.isNull(rowData.VALID_DATE);
            }
        });
        if (searchRows.length > 0) {
            alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "유통기한필수대상 상품입니다. 유통기한을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, searchRows[0]);
            // Scroll에서 데이터 표시 후 포커스 이동하도록 딜레이 처리
            setTimeout(function() {
                setFocusScan("#dtpValid_Date");
            }, $ND.C_TIMEOUT_FOCUS);
            return;
        }

        // 제조번호필수대상 여부 체크
        searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
            compareFn: function(rowData) {
                // 필수대상 미입력의 경우
                return rowData.BATCH_NO_REQ_YN == $ND.C_YES && $NC.isNull(rowData.BATCH_NO);
            }
        });
        if (searchRows.length > 0) {
            alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "제조번호필수대상 상품입니다. 제조번호를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, searchRows[0]);
            // Scroll에서 데이터 표시 후 포커스 이동하도록 딜레이 처리
            setTimeout(function() {
                setFocusScan("#edtBatch_No");
            }, $ND.C_TIMEOUT_FOCUS);
            return;
        }
    }

    // 적치 로케이션 체크
    if ($NC.isNull($NC.G_VAR.lastLocationCd)) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "적치 로케이션을 먼저 스캔하십시오."));
        setFocusScan("#edtPutaway_Location_Cd");
        return;
    }

    var checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
        checkColumnId: $ND.C_NULL, // 체크없이 전체
        dataType: "S", // 문자열 결합
        valueColumns: [
            "BRAND_CD",
            "ITEM_CD",
            "ITEM_STATE",
            "ITEM_LOT",
            "VALID_DATE",
            "BATCH_NO",
            "ENTRY_QTY",
            "CONFIRM_QTY"
        ]
    });

    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "처리할 상품 내역이 없습니다."));
        setFocusScan();
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "적치 처리하시겠습니까?"))) {
        setFocusScan();
        return;
    }

    $NC.serviceCall("/PDA_LIC02360E0/callLIProcPutawayT2.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_INBOUND_DATE: refRowData.INBOUND_DATE,
        P_INBOUND_NO: refRowData.INBOUND_NO,
        P_PALLET_ID: refRowData.PALLET_ID,
        P_PUTAWAY_LOCATION_CD: PUTAWAY_LOCATION_CD,
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
    // clearType가 취소 버튼 클릭 Event Object일 경우도 있음
    if (clearType instanceof $.Event || $NC.isNull(clearType)) {
        clearType = $ND.C_CLEAR_TYPE_ALL;
    }

    // 로케이션은 무조건 초기화
    $NC.G_VAR.lastLocationCd = null;
    $NC.setValue("#edtPutaway_Location_Cd");

    if (clearType <= $ND.C_CLEAR_TYPE_MASTER) {
        // 전역 변수 초기화
        $NC.G_VAR.lastPalletId = null;
        $NC.G_VAR.lastLocationCd = null;
        // 값 초기화
        $NC.setValue("#edtPallet_Id");
        setMasterInputValue();
        setDetailInputValue();

        $NC.clearGridData(G_GRDMASTER);
        // 모두 비활성
        $NC.setEnableGroup("#ctrDetailView", false);
        setFocusScan();
    } else {
        // 로케이션에 포커스
        setFocusScan("#edtPutaway_Location_Cd");
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
    // 스캔 Element - 파렛트ID
    if ($view.prop("id") == "edtPallet_Id") {
        return;
    }
    // 스캔 Element - 로케이션
    if ($view.prop("id") == "edtPutaway_Location_Cd") {
        // 비활성이면 파렛트ID로
        if (!$NC.isEnable($view)) {
            setFocusScan();
        }
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        // 파렛트ID 스캔하여 정상 조회되어 있으면 로케이션에 포커
        if ($NC.isNull($NC.G_VAR.lastPalletId)) {
            setFocusScan();
        } else {
            setFocusScan("#edtPutaway_Location_Cd");
        }
    }
}

function setFocusScan(selector) {

    var $view = $NC.getView($NC.isNull(selector) ? "#edtPallet_Id" : selector);
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
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        minWidth: 165
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "지시수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
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
                if (rowData.ENTRY_QTY != rowData.CONFIRM_QTY) {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "PDA_LIC02360E0.RS_MASTER",
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

    var changeQty;
    switch (args.col) {
        case "VALID_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.PDA_LIC02360E0.009", "유통기한을 정확히 입력하십시오."), "N");
            }
            rowData.VALID_DATE = $NC.getValue(args.view);
            break;
        case "BATCH_NO":
            rowData.BATCH_NO = args.val;
            break;
        case "CONFIRM_BOX":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "검수BOX 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.CONFIRM_BOX = changeQty;
            rowData.CONFIRM_QTY = $NC.getBQty(rowData.CONFIRM_BOX, rowData.CONFIRM_EA, rowData.QTY_IN_BOX);
            $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
            break;
        case "CONFIRM_EA":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "검수EA 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.CONFIRM_EA = changeQty;
            rowData.CONFIRM_QTY = $NC.getBQty(rowData.CONFIRM_BOX, rowData.CONFIRM_EA, rowData.QTY_IN_BOX);
            $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
            break;
        case "CONFIRM_QTY":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "검수 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            rowData.CONFIRM_BOX = $NC.getBBox(changeQty, rowData.QTY_IN_BOX);
            rowData.CONFIRM_EA = $NC.getBEa(changeQty, rowData.QTY_IN_BOX);
            rowData.CONFIRM_QTY = changeQty;

            $NC.setValue("#edtConfirm_Box", rowData.CONFIRM_BOX);
            $NC.setValue("#edtConfirm_Ea", rowData.CONFIRM_EA);

            // 검수수량일 경우 포커스 유지
            $NC.setFocus(args.view);
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CONFIRM_QTY)) {
            alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "검수 수량을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            setFocusScan("#edtConfirm_Qty");
            return false;
        }
        if (Number(rowData.CONFIRM_QTY) < 0) {
            alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "검수 수량을 정확히 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            setFocusScan("#edtConfirm_Qty");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function setMasterInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtInbound_Date", rowData["INBOUND_DATE"]);
    $NC.setValue("#edtInbound_No", rowData["INBOUND_NO"]);
    $NC.setValue("#edtVendor_Nm", rowData["VENDOR_NM"]);
}

function setDetailInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtItem_Bar_Cd", rowData["ITEM_BAR_CD"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtItem_State", rowData["ITEM_STATE_D"]);
    $NC.setValue("#dtpValid_Date", rowData["VALID_DATE"]);
    $NC.setValue("#edtBatch_No", rowData["BATCH_NO"]);
    $NC.setValue("#edtRec_Location_Cd", rowData["PUTAWAY_LOCATION_CD"]);
    $NC.setValue("#edtQty_In_Box", rowData["QTY_IN_BOX"]);
    $NC.setValue("#edtEntry_Box", rowData["ENTRY_BOX"]);
    $NC.setValue("#edtEntry_Ea", rowData["ENTRY_EA"]);
    $NC.setValue("#edtEntry_Qty", rowData["ENTRY_QTY"]);
    $NC.setValue("#edtConfirm_Box", rowData["CONFIRM_BOX"]);
    $NC.setValue("#edtConfirm_Ea", rowData["CONFIRM_EA"]);
    $NC.setValue("#edtConfirm_Qty", rowData["CONFIRM_QTY"]);

    setFocusScan("#edtPutaway_Location_Cd");
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "파렛트ID 정보가 없습니다."));
        _Cancel();
        return;
    }
    // 기본 체크, 첫번째 ROW 데이터로
    var resultData = dsResult[0];
    if (resultData.INBOUND_STATE != $ND.C_STATE_DIRECTIONS && resultData.INBOUND_STATE != $ND.C_STATE_CONFIRM) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "입고진행 상태 : [" + resultData.INBOUND_STATE + "] 적치가능한 상태가 아닙니다.", resultData.INBOUND_STATE));
        _Cancel();
        return;
    }
    if (resultData.CENTER_CD != $NC.G_USERINFO.CENTER_CD) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "물류센터: [" + resultData.CENTER_CD + "] 설정된 물류센터와 다른 물류센터의 파렛트ID입니다.", resultData.BU_CD));
        _Cancel();
        return;
    }
    if (resultData.BU_CD != $NC.G_USERINFO.BU_CD) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "사업부: [" + resultData.BU_CD + "] 설정된 사업부와 다른 사업부의 파렛트ID입니다.", resultData.BU_CD));
        _Cancel();
        return;
    }
    // if (resultData.INBOUND_DATE != $NC.G_USERINFO.WORK_DATE) {
    // alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "입고일자: [" + resultData.INBOUND_DATE + "] 설정된 작업일자와 다른 입고일자의 파렛트ID입니다.",
    // resultData.INBOUND_DATE));
    // _Cancel();
    // return;
    // }

    if (resultData.PUTAWAY_YN == $ND.C_YES) {
        if (!confirm($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "적치 처리된 파렛트ID입니다.\n재적치 처리하시겠습니까?"))) {
            _Cancel();
            return;
        }
    }

    // 입력 활성, 값 세팅
    $NC.setEnableGroup("#ctrMasterInfoView");
    $NC.setEnableGroup("#ctrDetailView");
    // 검수가 됐으면 검수 관련 비활성
    if (resultData.INSPECT_YN == $ND.C_YES) {
        $NC.setEnable("#dtpValid_Date", false);
        $NC.setEnable("#edtBatch_No", false);
        $NC.setEnable("#edtConfirm_Box", false);
        $NC.setEnable("#edtConfirm_Ea", false);
        $NC.setEnable("#edtConfirm_Qty", false);
    }
    setMasterInputValue(resultData);

    // 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDMASTER, dsResult);
    $NC.setInitGridAfterOpen(G_GRDMASTER);
}

function onGetDetail(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "로케이션 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    setFocusScan("#edtPutaway_Location_Cd");
}

function onPalletScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtPallet_Id");
        scanVal = $NC.getValue($scan);
    }

    // 파렛트ID
    if ($NC.isNull(scanVal)) {
        _Cancel();
        return;
    }

    // 초기화
    _Cancel();

    $NC.G_VAR.lastPalletId = scanVal;
    $NC.setValue($scan, scanVal);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_PALLET_ID: $NC.G_VAR.lastPalletId
    };
    // 데이터 조회
    $NC.serviceCall("/PDA_LIC02360E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onPalletError);
}

function onLocationScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtPutaway_Location_Cd");
        scanVal = $NC.getValue($scan);
    }

    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        setFocusScan($scan);
        return;
    }

    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_DETAIL);

    $NC.G_VAR.lastLocationCd = scanVal;
    $NC.setValue($scan, scanVal);

    $NC.serviceCall("/PDA_COMMON/getData.do", {
        P_QUERY_ID: "PDA_COMMON.CM_LOCATION_CHECK",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_LOCATION_CD: $NC.G_VAR.lastLocationCd,
            P_INOUT_DIV: "1"
        }
    }, onGetDetail, onLocationError);
}

function onSave(ajaxData) {

    var title = $NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "확인"), //
    message = $NC.getDisplayMsg("JS.PDA_LIC02360E0.XXX", "정상 처리되었습니다."), //
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

function onPalletError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel();
    setFocusScan();
}

function onLocationError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel($ND.C_CLEAR_TYPE_DETAIL);
    setFocusScan("#edtPutaway_Location_Cd");
}

// 확정수량을 등록수량으로 UPDATE
function onQtyApply() {

    if ($NC.isNull($NC.G_VAR.lastPalletId)) {
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan();
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        setFocusScan();
        return;
    }

    if (rowData.ENTRY_QTY == rowData.CONFIRM_QTY) {
        setFocusScan("#edtConfirm_Qty");
        return;
    }

    rowData.CONFIRM_BOX = rowData.ENTRY_BOX;
    rowData.CONFIRM_EA = rowData.ENTRY_EA;
    rowData.CONFIRM_QTY = rowData.ENTRY_QTY;

    $NC.setValue("#edtConfirm_Box", rowData.CONFIRM_BOX);
    $NC.setValue("#edtConfirm_Ea", rowData.CONFIRM_EA);
    $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    setFocusScan("#edtConfirm_Qty");
}

// 로케이션을 권장로케이션 값으로 UPDATE
function onLocationApply() {

    if ($NC.isNull($NC.G_VAR.lastPalletId)) {
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan();
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        setFocusScan();
        return;
    }

    $NC.G_VAR.lastLocationCd = rowData.PUTAWAY_LOCATION_CD;

    $NC.setValue("#edtPutaway_Location_Cd", $NC.G_VAR.lastLocationCd);

    $NC.serviceCall("/PDA_COMMON/getData.do", {
        P_QUERY_ID: "PDA_COMMON.CM_LOCATION_CHECK",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_LOCATION_CD: $NC.G_VAR.lastLocationCd,
            P_INOUT_DIV: "1"
        }
    }, onGetDetail, onLocationError);
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
        // 파렛트ID 매핑 기준 정책값에 따라 화면 강제 종료
        // 멀티화면이므로 단일은 종료
        switch ($NC.G_VAR.policyVal.LI230) {
            // 입고검수 - 단일
            // case "1":
            // break;
            // 입고검수 - 멀티
            case "2":
            case "3":
                break;
            default:
                alert("해당 사업부는 사용할 수 없는 프로그램입니다. 프로그램을 종료합니다.");
                $NC.G_MAIN.hideDefaultInfoLayer();
                setTimeout(function() {
                    $("#btnClose").click();
                }, $ND.C_TIMEOUT_CLOSE_FAST);
                return;
        }
    });
}