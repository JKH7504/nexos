/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LCC03020E0
 *  프로그램명         : PDA 재고이동[단일상품매핑]
 *  프로그램설명       : PDA 재고이동[단일상품매핑] 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-03-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-03-07    ASETEC           신규작성
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
            exceptHeight: function() {
                return $NC.getViewHeight("#ctrActionBar");
            }
        },
        ignoreKeyUp: false,
        lastPalletId: null,
        lastLocationCd: null,
        lastMoveLocationCd: null,
        masterData: null,

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
    // [Overlay] 선택버튼 클릭
    $("#btnL1_Select").click(btnStockSearchOnClick);
    // [Overlay] 이전버튼 클릭
    $("#btnL1_Close").click(function() {
        $NC.hideView("#ctrSubOverlay", function() {
            setFocusScan("#edtMove_Location_Cd");
        });
    });

    // Overlay 그리드 초기화
    grdSubInitialize();

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

    var $parent;
    // Overlay 표시할 경우 화면 리사이즈 처리
    if ($NC.isVisible("#ctrSubOverlay")) {
        $parent = $("#ctrSubView").parent();
        $NC.resizeGridView("#ctrSubView", "#grdSub", null, $parent.height() - $NC.getViewHeight($parent.children().not("#ctrSubView")));
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
    var changeQty, confirmQty;
    switch (id) {
        case "PALLET_ID":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onPalletScan(view, val);
            break;
        case "CONFIRM_BOX":
            changeQty = $NC.toNumber(val, -1);
            if (changeQty == -1) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "이동BOX 수량을 정확히 입력하십시오."));
                $NC.setFocus(view);
                return;
            }
            confirmQty = $NC.getBQty(changeQty, $NC.G_VAR.masterData.CONFIRM_EA, $NC.G_VAR.masterData.QTY_IN_BOX);
            if ($NC.G_VAR.masterData.STOCK_QTY < confirmQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "이동수량이 재고수량보다 클 수 없습니다."));
                $NC.setValue(view, $NC.G_VAR.masterData.CONFIRM_BOX); // 수량 복원
                $NC.setFocus(view);
                return;
            }

            // Editor 수량 및 데이터 수량 변경
            $NC.G_VAR.masterData.CONFIRM_BOX = changeQty;
            $NC.G_VAR.masterData.CONFIRM_QTY = confirmQty;

            $NC.setValue("#edtConfirm_Qty", confirmQty);
            break;
        case "CONFIRM_EA":
            changeQty = $NC.toNumber(val, -1);
            if (changeQty == -1) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "이동EA 수량을 정확히 입력하십시오."));
                $NC.setFocus(view);
                return;
            }
            confirmQty = $NC.getBQty($NC.G_VAR.masterData.CONFIRM_BOX, changeQty, $NC.G_VAR.masterData.QTY_IN_BOX);
            if ($NC.G_VAR.masterData.STOCK_QTY < confirmQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "이동수량이 재고수량보다 클 수 없습니다."));
                $NC.setValue(view, $NC.G_VAR.masterData.CONFIRM_EA); // 수량 복원
                $NC.setFocus(view);
                return;
            }

            // Editor 수량 및 데이터 수량 변경
            $NC.G_VAR.masterData.CONFIRM_EA = changeQty;
            $NC.G_VAR.masterData.CONFIRM_QTY = confirmQty;

            $NC.setValue("#edtConfirm_Qty", confirmQty);
            break;
        case "CONFIRM_QTY":
            changeQty = $NC.toNumber(val, -1);
            if (changeQty == -1) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "이동 수량을 정확히 입력하십시오."));
                $NC.setFocus(view);
                return;
            }
            if ($NC.G_VAR.masterData.STOCK_QTY < changeQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "이동수량이 재고수량보다 클 수 없습니다."));
                $NC.setValue(view, $NC.G_VAR.masterData.CONFIRM_QTY); // 수량 복원
                $NC.setFocus(view);
                return;
            }

            // Editor 수량 및 데이터 수량 변경
            $NC.G_VAR.masterData.CONFIRM_BOX = $NC.getBBox(changeQty, $NC.G_VAR.masterData.QTY_IN_BOX);
            $NC.G_VAR.masterData.CONFIRM_EA = $NC.getBEa(changeQty, $NC.G_VAR.masterData.QTY_IN_BOX);
            $NC.G_VAR.masterData.CONFIRM_QTY = changeQty;

            $NC.setValue("#edtConfirm_Box", $NC.G_VAR.masterData.CONFIRM_BOX);
            $NC.setValue("#edtConfirm_Ea", $NC.G_VAR.masterData.CONFIRM_EA);
            break;
        case "MOVE_LOCATION_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onMoveLocationScan(view, val);
            break;
        default:
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
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
        case "MOVE_LOCATION_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onMoveLocationScan(view, $NC.getValue(view));
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    $NC.serviceCall("/PDA_LCC03020E0/getDataSet.do", {
        P_QUERY_ID: "PDA_LCC03020E0.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_PALLET_ID: $NC.G_VAR.lastPalletId,
            P_LOCATION_CD: $NC.isNull($NC.G_VAR.lastLocationCd) ? "" : $NC.G_VAR.lastLocationCd
        }
    }, onGetMaster, onError);
}
/*
* Sub1 Inquiry Event - 파렛트ID 스캔 시 데이터 n건일 경우 호출
*/
function SubInquiry() {

    $NC.serviceCall("/PDA_LCC03020E0/getDataSet.do", {
        P_QUERY_ID: "PDA_LCC03020E0.RS_SUB",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_PALLET_ID: $NC.G_VAR.lastPalletId
        }
    }, onGetSub, onLocationError);
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
    if ($NC.isNull($NC.G_VAR.masterData)) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "파렛트ID를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if ($NC.isNull($NC.G_VAR.lastMoveLocationCd)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "이동로케이션을 먼저 스캔하십시오."));
        setFocusScan("#edtMove_Location_Cd");
        return;
    }

    if ($NC.G_VAR.masterData.CONFIRM_QTY == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03010E0.XXX", "처리할 상품 내역이 없습니다. 이동수량을 입력하십시오."));
        setFocusScan("#edtConfirm_Qty");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "재고이동 처리하시겠습니까?"))) {
        setFocusScan();
        return;
    }

    $NC.serviceCall("/PDA_LCC03020E0/callLCProcMove.do", {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_MOVE_DATE: $NC.G_USERINFO.WORK_DATE,
        P_LOCATION_CD: $NC.G_VAR.masterData.LOCATION_CD,
        P_MLOCATION_CD: $NC.G_VAR.lastMoveLocationCd,
        P_CHECKED_VALUE: $NC.toJoin([
            $NC.G_VAR.masterData.BRAND_CD,
            $NC.G_VAR.masterData.ITEM_CD,
            $NC.G_VAR.masterData.ITEM_STATE,
            $NC.G_VAR.masterData.ITEM_LOT,
            $NC.G_VAR.masterData.VALID_DATE,
            $NC.G_VAR.masterData.BATCH_NO,
            $NC.G_VAR.lastPalletId,
            $NC.G_VAR.masterData.STOCK_QTY,
            $NC.G_VAR.masterData.CONFIRM_QTY
        ], ";"),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onError);
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
    $NC.G_VAR.lastMoveLocationCd = null;
    $NC.setValue("#edtMove_Location_Cd");

    if (clearType <= $ND.C_CLEAR_TYPE_MASTER) {
        // 전역 변수 초기화
        $NC.G_VAR.masterData = null;
        $NC.G_VAR.lastPalletId = null;
        $NC.G_VAR.lastLocationCd = null;
        $NC.G_VAR.lastMoveLocationCd = null;

        // 값 초기화
        $NC.setValue("#edtPallet_Id");
        $NC.clearGridData(G_GRDSUB);

        // 모두 비활성
        setInputValue();
        $NC.setEnableGroup("#ctrMasterView", false);

        // 스캔만 활성, 포커스
        $NC.setEnable("#edtPallet_Id");
        setFocusScan();
    } else {
        // 로케이션에 포커스
        setFocusScan("#edtMove_Location_Cd");
    }

    if (clearType == $ND.C_CLEAR_TYPE_ALL) {
        // Overlay 창 닫기
        $NC.hideView("#ctrSubOverlay");
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
    // Overlay 표시되어 있을 경우
    if ($NC.isVisible("#ctrSubOverlay")) {
        // 그리드 셀 복사일 경우 처리 안함
        if (e.ctrlKey && $view.is(".slick-cell")) {
            return;
        }
        // 입력 Element가 아니면 스캔 Element에 포커스
        if (!$view.is(":focus")) {
            // 로케이션 코드에 포커스
            setFocusScan();
        }
    }
    // 메인 화면
    else {
        // 스캔 Element - 파렛트ID
        if ($view.prop("id") == "edtPallet_Id") {
            return;
        }
        // 스캔 Element - 로케이션
        if ($view.prop("id") == "edtMove_Location_Cd") {
            // 비활성이면 파렛트ID로
            if (!$NC.isEnable($view)) {
                setFocusScan();
            }
            return;
        }
        // 입력 Element가 아니면 스캔 Element에 포커스
        if (!$view.is(":focus")) {
            // 파렛트ID 스캔하여 정상 조회되어 있으면 로케이션에 포커스
            if ($NC.isNull($NC.G_VAR.lastPalletId)) {
                setFocusScan();
            } else {
                setFocusScan("#edtMove_Location_Cd");
            }
        }
    }
}

function setFocusScan(selector) {

    var $view;

    // Overlay 표시 경우
    if ($NC.isVisible("#ctrSubOverlay")) {
        G_GRDSUB.view.focus();
    }
    // 메인 화면
    else {
        $view = $NC.getView($NC.isNull(selector) ? "#edtPallet_Id" : selector);
    }

    if ($NC.isEnable($view)) {
        // Delay 처리
        setTimeout(function() {
            $view.focus();
            $NC.hideSoftInput(); // 일단 스캔 항목 키보드 숨김 처리
        }, $ND.C_TIMEOUT_FOCUS);
    }
}

function grdSubOnGetColumns() {

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
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

    var options = {
        rowHeight: 30,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "PDA_LCC03020E0.RS_SUB",
        sortCol: "ROW_NO",
        gridOptions: options
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재 row/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

function setInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtItem_Cd", rowData["ITEM_CD"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtItem_State", rowData["ITEM_STATE_F"]);
    $NC.setValue("#edtValid_Date", rowData["VALID_DATE"]);
    $NC.setValue("#edtBatch_No", rowData["BATCH_NO"]);
    $NC.setValue("#edtQty_In_Box", rowData["QTY_IN_BOX"]);
    $NC.setValue("#edtBox_In_Plt", rowData["BOX_IN_PLT"]);
    $NC.setValue("#edtStock_Box", rowData["STOCK_BOX"]);
    $NC.setValue("#edtStock_Ea", rowData["STOCK_EA"]);
    $NC.setValue("#edtStock_Qty", rowData["STOCK_QTY"]);
    $NC.setValue("#edtConfirm_Box", rowData["CONFIRM_BOX"]);
    $NC.setValue("#edtConfirm_Ea", rowData["CONFIRM_EA"]);
    $NC.setValue("#edtConfirm_Qty", rowData["CONFIRM_QTY"]);
    $NC.setValue("#edtLocation_Cd", rowData["LOCATION_CD"]);
    $NC.setValue("#edtMove_Location_Cd", rowData["MLOCATION_CD"]);
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "파렛트ID 정보가 없습니다."));
        _Cancel();
        return;
    }

    var resultData = dsResult[0];
    if (resultData.CENTER_CD != $NC.G_USERINFO.CENTER_CD) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "물류센터: [" + resultData.CENTER_CD + "] 설정된 물류센터와 다른 물류센터의 파렛트ID입니다.", resultData.BU_CD));
        _Cancel();
        return;
    }
    if (resultData.BU_CD != $NC.G_USERINFO.BU_CD) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "사업부: [" + resultData.BU_CD + "] 설정된 사업부와 다른 사업부의 파렛트ID입니다.", resultData.BU_CD));
        _Cancel();
        return;
    }

    // 한 파렛트ID에 n건의 로케이션 있을 경우 Overlay 활성화
    if (!$NC.isVisible("#ctrSubOverlay") && dsResult.length > 1) {
        SubInquiry();
    } else {
        // 값 세팅
        $NC.G_VAR.masterData = resultData;
        $NC.setEnableGroup("#ctrMasterView");
        setInputValue($NC.G_VAR.masterData);

        // "L - 라벨링"일 경우 수량 변경 제한
        if (resultData.ITEM_STATE == "L") {
            onQtyApply();
            $NC.setEnableGroup("#trConfirmQty", false);

            setFocusScan("#edtMove_Location_Cd");
        } else {
            setFocusScan("#edtConfirm_Qty");
        }
    }
}

function onGetDetail(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "로케이션 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    setFocusScan("#edtMove_Location_Cd");
}

/**
 * 재고 내역 정상 Callback
 */
function onGetSub(ajaxData) {

    // 현품표 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB);

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    $NC.setValue("#edtL1_Pallet_Id", rowData.PALLET_ID);
    $NC.setValue("#edtL1_Item_Cd", rowData.ITEM_CD);
    $NC.setValue("#edtL1_Item_Nm", rowData.ITEM_NM);

    // Overlay 표시
    $NC.showOverlay("#ctrSubOverlay", {
        onComplete: function() {
            $NC.onGlobalResize();
            G_GRDSUB.view.focus();
            setFocusScan();
        }
    });
}

/**
 * 파렛트ID 스캔
 */
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

    _Inquiry();
}

/**
 * 이동로케이션 스캔
 */
function onMoveLocationScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtMove_Location_Cd");
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

    $NC.G_VAR.lastMoveLocationCd = scanVal;
    $NC.setValue($scan, scanVal);

    $NC.serviceCall("/PDA_COMMON/getData.do", {
        P_QUERY_ID: "PDA_COMMON.CM_LOCATION_CHECK",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_LOCATION_CD: $NC.G_VAR.lastMoveLocationCd,
            P_INOUT_DIV: "1",
            P_LOC_DIV_ATTR03_CD: "10"
        }
    }, onGetDetail, onLocationError);
}

/**
 * 확정수량 클릭 이벤트
 */
function onQtyApply() {

    if ($NC.isNull($NC.G_VAR.lastPalletId)) {
        setFocusScan();
        return;
    }

    if ($NC.getValue("#edtStock_Qty") == $NC.getValue("#edtConfirm_Qty")) {
        setFocusScan();
        return;
    }

    $NC.G_VAR.masterData.CONFIRM_BOX = $NC.G_VAR.masterData.STOCK_BOX;
    $NC.G_VAR.masterData.CONFIRM_EA = $NC.G_VAR.masterData.STOCK_EA;
    $NC.G_VAR.masterData.CONFIRM_QTY = $NC.G_VAR.masterData.STOCK_QTY;

    $NC.setValue("#edtConfirm_Box", $NC.getValue("#edtStock_Box"));
    $NC.setValue("#edtConfirm_Ea", $NC.getValue("#edtStock_Ea"));
    $NC.setValue("#edtConfirm_Qty", $NC.getValue("#edtStock_Qty"));
}

/**
 * Overlay 선택 버튼 처리
 */
function btnStockSearchOnClick() {

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    $NC.G_VAR.lastLocationCd = rowData.LOCATION_CD;

    // Overlay 창 닫기
    $NC.hideView("#ctrSubOverlay", function() {
        setFocusScan("#edtConfirm_Qty");
    });

    _Inquiry();
}

function onSave(ajaxData) {

    var title = $NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "확인"), //
    message = $NC.getDisplayMsg("JS.PDA_LCC03020E0.XXX", "정상 처리되었습니다."), //
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

function onError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel();
    setFocusScan();
}

function onLocationError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel($ND.C_CLEAR_TYPE_DETAIL);
    setFocusScan("#edtMove_Location_Cd");
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
        // 단일화면이므로 멀티는 종료
        switch ($NC.G_VAR.policyVal.LI230) {
            // 입고검수 - 단일
            case "1":
                break;
            // 입고검수 - 멀티
            // case "2":
            // case "3":
            // break;
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