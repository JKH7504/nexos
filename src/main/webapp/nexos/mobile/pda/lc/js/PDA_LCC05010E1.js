/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LCC05010E1
 *  프로그램명         : PDA 매장실사 (의류)
 *  프로그램설명       : PDA 매장실사 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-07-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-07-07    ASETEC           신규작성
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
        SCANNED_INC_QTY: true, // 기본값 false
        SCANNED_DISPLAY_ITEM_BAR_CD: true, // 기본값 true
        SCANNED_ITEM_BAR_CD: false,

        ignoreKeyUp: false,
        lastDeliveryCd: null,
        lastBoxNo: null,
        lastItemBarCd: null,

        // 체크할 정책 값
        policyVal: {
            LS210: "" // 재고 관리 기준
        }
    });

    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setVisible("#tdQDsp_Brand_Nm", false);
    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 취소버튼 클릭 -> _Cancel로 처리
    $("#btnCancel").click(_Cancel);
    // 처리버튼 클릭 -> _Save로 처리
    $("#btnSave").click(_Save);

    // 그리드 초기화
    grdMasterInitialize();

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
        case "DELIVERY_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            setFocusScan("#edtBox_No");
            break;
        case "BOX_NO":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            _Inquiry();
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
        case "DELIVERY_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            setFocusScan("#edtBox_No");
            break;
        case "BOX_NO":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            _Inquiry();
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

    $NC.clearGridData(G_GRDMASTER);
    $NC.setEnableGroup("#ctrDetailView", false);

    $NC.G_VAR.lastDeliveryCd = $NC.getValue("#edtDelivery_Cd");
    $NC.G_VAR.lastBoxNo = $NC.getValue("#edtBox_No");
    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    // 저장 전 Validation
    if ($NC.isNull($NC.G_VAR.lastDeliveryCd)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.001", "배송처를 먼저 입력하십시오."));
        setFocusScan("#edtDelivery_Cd");
        return;
    }

    if ($NC.isNull($NC.G_VAR.lastBoxNo)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.002", "박스번호를 먼저 입력하십시오."));
        setFocusScan("#edtBox_No");
        return;
    }

    if ($NC.G_VAR.lastBoxNo < 1) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.003", "박스번호를 정확히 입력하십시오."));
        setFocusScan("#edtBox_No");
        return;
    }

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_CUST_CD: CUST_CD,
        P_INVEST_DATE: $NC.G_USERINFO.WORK_DATE,
        P_BOX_NO: $NC.G_VAR.lastBoxNo,
        P_DELIVERY_CD: $NC.G_VAR.lastDeliveryCd
    };
    // 데이터 조회
    $NC.serviceCall("/PDA_LCC05010E1/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onBoxNoError);
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
    if ($NC.isNull($NC.G_VAR.lastDeliveryCd)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.001", "배송처를 먼저 입력하십시오."));
        setFocusScan();
        return;
    }

    if ($NC.isNull($NC.G_VAR.lastBoxNo)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.002", "박스번호을 먼저 입력하십시오."));
        setFocusScan("#edtBox_No");
        return;
    }

    if ($NC.G_VAR.lastBoxNo < 1) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.003", "박스번호를 정확히 입력하십시오."));
        setFocusScan("#edtBox_No");
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.004", "처리할 상품 내역이 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
        checkColumnId: $ND.C_NULL, // 체크없이 전체
        compareFn: function(rowData) {
            // 기존 데이터는 전체, 신규 데이터는 수량이 0보다 큰 내역만 처리
            return rowData.CRUD != $ND.C_DV_CRUD_R || (rowData.NEW_YN == $ND.C_YES && rowData.INVEST_QTY > 0);
        },
        dataType: "S", // 문자열 결합
        valueColumns: [
            "BRAND_CD",
            "ITEM_CD",
            "LINE_NO",
            "INVEST_QTY",
            "ORG_IVEST_QTY"
        ]
    });

    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.005", "처리할 상품 내역이 없습니다. 매장실사할 상품을 선택하고 실사수량을 입력하십시오."));
        return;
    }

    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        compareFn: function(rowData) {
            // 기존 데이터 중에 실사수량이 0
            return rowData.NEW_YN == $ND.C_NO && rowData.INVEST_QTY == 0;
        }
    });

    if (searchRow == -1) {
        if (!confirm($NC.getDisplayMsg("JS.PDA_LCC05010E1.006", "매장실사 처리하시겠습니까?"))) {
            setFocusScan();
            return;
        }
    } else {
        if (!confirm($NC.getDisplayMsg("JS.PDA_LCC05010E1.007", "실사수량이 0인 상품이 존재합니다.\n매장실사 처리하시겠습니까?"))) {
            setFocusScan();
            return;
        }
    }

    var refRowData = G_GRDMASTER.data.getItem(0);
    $NC.serviceCall("/PDA_LCC05010E1/callLCProcDeliveryInvest.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_INVEST_DATE: refRowData.INVEST_DATE,
        P_DELIVERY_CD: refRowData.DELIVERY_CD,
        P_BOX_NO: $NC.G_VAR.lastBoxNo,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onBoxNoError);
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
        $NC.G_VAR.lastDeliveryCd = null;
        $NC.G_VAR.lastBoxNo = null;
        $NC.G_VAR.lastItemBarCd = null;

        // 값 초기화
        $NC.setValue("#edtDelivery_Cd");
        $NC.setValue("#edtBox_No");

        $NC.clearGridData(G_GRDMASTER);
        // 모두 비활성
        $NC.setEnableGroup("#ctrDetailView", false);
    }

    if (clearType <= $ND.C_CLEAR_TYPE_DETAIL) {
        // 전역 변수 초기화
        $NC.G_VAR.lastItemBarCd = null;
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
    // 스캔 Element - 배송처
    if ($view.prop("id") == "edtDelivery_Cd") {
        return;
    }
    // 스캔 Element - 상품바코드
    if ($view.prop("id") == "edtItem_Bar_Cd") {
        // 비활성이면 파렛트ID로
        if (!$NC.isEnable($view)) {
            setFocusScan();
        }
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        // 박스번호 스캔하여 정상 조회되어 있으면 상품바코드에 포커스
        if ($NC.isNull($NC.G_VAR.lastBoxNo)) {
            setFocusScan();
        } else {
            if ($NC.G_VAR.SCANNED_INC_QTY) {
                setFocusScan("#edtItem_Bar_Cd");
            } else {
                setFocusScan("#edtInvest_Qty");
            }
        }
    }
}

function setFocusScan(selector) {

    var $view = $NC.getView($NC.isNull(selector) ? "#edtDelivery_Cd" : selector);
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
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        minWidth: 120
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_QTY",
        field: "INVEST_QTY",
        name: "실사수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "COLOR_NM",
        field: "COLOR_NM",
        name: "컬러"
    });
    $NC.setGridColumn(columns, {
        id: "SIZE_NM",
        field: "SIZE_NM",
        name: "사이즈"
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
        queryId: "PDA_LCC05010E1.RS_MASTER",
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

    var changeQty, confirmQty;
    switch (args.col) {
        case "INVEST_BOX":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.008", "실사BOX 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            confirmQty = $NC.getBQty(changeQty, rowData.INVEST_EA, rowData.QTY_IN_BOX);

            rowData.INVEST_BOX = changeQty;
            rowData.INVEST_QTY = confirmQty;
            $NC.setValue("#edtInvest_Qty", rowData.INVEST_QTY);
            break;
        case "INVEST_EA":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.009", "실사EA 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            confirmQty = $NC.getBQty(rowData.INVEST_BOX, changeQty, rowData.QTY_IN_BOX);

            rowData.INVEST_EA = changeQty;
            rowData.INVEST_QTY = confirmQty;
            $NC.setValue("#edtInvest_Qty", rowData.INVEST_QTY);
            break;
        case "INVEST_QTY":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.010", "실사 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.INVEST_BOX = $NC.getBBox(changeQty, rowData.QTY_IN_BOX);
            rowData.INVEST_EA = $NC.getBEa(changeQty, rowData.QTY_IN_BOX);
            rowData.INVEST_QTY = changeQty;

            $NC.setValue("#edtInvest_Box", rowData.INVEST_BOX);
            $NC.setValue("#edtInvest_Ea", rowData.INVEST_EA);

            // 실사수량일 경우 포커스 유지
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
        if ($NC.isNull(rowData.INVEST_QTY)) {
            alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.011", "검수 수량을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtInvest_Qty");
            return false;
        }
        if (Number(rowData.INVEST_QTY) < 0) {
            alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.012", "검수 수량을 정확히 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtInvest_Qty");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
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

    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtInvest_Box", rowData["INVEST_BOX"]);
    $NC.setValue("#edtInvest_Ea", rowData["INVEST_EA"]);
    $NC.setValue("#edtInvest_Qty", rowData["INVEST_QTY"]);

    // 스캔 수량 증가일 경우
    if ($NC.G_VAR.SCANNED_INC_QTY) {
        if ($NC.G_VAR.SCANNED_ITEM_BAR_CD) {
            // if (rowData["STOCK_QTY"] > rowData["INVEST_QTY"]) {
            rowData["INVEST_QTY"] = rowData["INVEST_QTY"] + 1;
            rowData["INVEST_BOX"] = $NC.getBBox(rowData["INVEST_QTY"], rowData["QTY_IN_BOX"]);
            rowData["INVEST_EA"] = $NC.getBEa(rowData["INVEST_QTY"], rowData["QTY_IN_BOX"]);

            $NC.setValue("#edtInvest_Box", rowData["INVEST_BOX"]);
            $NC.setValue("#edtInvest_Ea", rowData["INVEST_EA"]);
            $NC.setValue("#edtInvest_Qty", rowData["INVEST_QTY"]);

            $NC.setGridApplyChange(G_GRDMASTER, rowData);
            // }
        }
        // 스캔 세팅 해제
        $NC.G_VAR.SCANNED_ITEM_BAR_CD = false;

        setFocusScan("#edtItem_Bar_Cd");
    } else {
        setFocusScan("#edtInvest_Qty");
    }
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);

    // 입력 활성, 값 세팅
    $NC.setEnableGroup("#ctrDetailView");

    // 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDMASTER, dsResult);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan("#edtItem_Bar_Cd");
    }
}

function onGetDetail(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC05010E1.XXX", "상품마스터에 존재하지 않는 상품입니다."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    var rowData = dsResult[0];
    // 상품코드 검색
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: [
            "BRAND_CD",
            "ITEM_CD"
        ],
        searchVal: [
            rowData.BRAND_CD,
            rowData.ITEM_CD
        ]
    });

    if (searchRow == -1) {
        // 신규 데이터 공통 처리
        rowData.ROW_NO = G_GRDMASTER.data.getLength() + 1;
        rowData.CENTER_CD = $NC.G_USERINFO.CENTER_CD;
        rowData.BU_CD = $NC.G_USERINFO.BU_CD;
        rowData.INVEST_DATE = $NC.G_USERINFO.WORK_DATE;
        rowData.DELIVERY_CD = $NC.getValue("#edtDelivery_Cd");
        rowData.BOX_NO = $NC.getValue("#edtBox_No");
        rowData.LINE_NO = null;
        rowData.COLOR_CD = null;
        rowData.SIZE_CD = null;
        rowData.INVEST_BOX = 0;
        rowData.INVEST_EA = 0;
        rowData.INVEST_QTY = 0;
        rowData.ORG_INVEST_QTY = null;
        rowData.NEW_YN = $ND.C_YES;
        rowData.CRUD = $ND.C_DV_CRUD_C;
        rowData.id = $NC.getGridNewRowId();

        // 스캔으로 세팅
        $NC.G_VAR.SCANNED_ITEM_BAR_CD = true;
        // 상품 선택
        G_GRDMASTER.lastRow = -1;
        $NC.newGridRowData(G_GRDMASTER, rowData);
    } else {
        // 스캔으로 세팅
        $NC.G_VAR.SCANNED_ITEM_BAR_CD = true;
        // 상품 선택
        G_GRDMASTER.lastRow = -1;
        $NC.setGridSelectRow(G_GRDMASTER, searchRow);
        // setFocusScan("#edtItem_Bar_Cd");
    }
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

    $NC.serviceCall("/PDA_LCC05010E1/getDataSet.do", {
        P_QUERY_ID: "PDA_LCC05010E1.RS_DETAIL",
        P_QUERY_PARAMS: {
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_ITEM_BAR_CD: $NC.G_VAR.lastItemBarCd
        }
    }, onGetDetail, onItemError);
}

function onSave(ajaxData) {

    var title = $NC.getDisplayMsg("JS.PDA_LCC05010E1.XXX", "확인"), //
    message = $NC.getDisplayMsg("JS.PDA_LCC05010E1.XXX", "정상 처리되었습니다."), //
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

function onBoxNoError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel($ND.C_CLEAR_TYPE_ALL);

    setFocusScan();
}

function onItemError(ajaxData) {

    $NC.onError(ajaxData);

    setFocusScan("#edtItem_Bar_Cd");
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
