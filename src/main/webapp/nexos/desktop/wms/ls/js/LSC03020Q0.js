/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC03020Q0
 *  프로그램명         : 재고변동추적
 *  프로그램설명       : 재고변동추적조회 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2020-06-01
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-06-01    ASETEC           신규작성
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
            grids: [
                "#grdMaster"
            ]
        },
        // 체크할 정책 값
        policyVal: {
            LS210: "" // 재고 관리 기준
        }
    });

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setInitDateRangePicker("#dtpQInbound_Date1", "#dtpQInbound_Date2");

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQItem_Cd").click(showItemPopup);

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 물류센터 세팅
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
            $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
            setPolicyValInfo();
        }
    });

    // 조회조건 - 상품상태 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_STATE",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_State",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        onComplete: function() {
            $NC.setValue("#cboQItem_State", 0);
        }
    });
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
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            setPolicyValInfo();
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "ITEM_CD":
            $NP.onItemChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: val,
                P_VIEW_DIV: "2",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemPopup);
            return;
        case "INBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC03020Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC03020Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 조회 조건에 Object Change
    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LSC03020Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC03020Q0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
    if ($NC.isNull(INBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LSC03020Q0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }

    var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
    if ($NC.isNull(INBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LSC03020Q0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date2");
        return;
    }

    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    if ($NC.isNull(ITEM_CD)) {
        alert($NC.getDisplayMsg("JS.LSC03020Q0.007", "상품코드를 입력하십시오."));
        $NC.setFocus("#edtQItem_Cd");
        return;
    }
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    if ($NC.isNull(ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.LSC03020Q0.008", "상품 상태를 선택하십시오."));
        $NC.setFocus("#cboQItem_State");
        return;
    }
    var ITEM_LOT = $NC.getValue("#edtQItem_Lot", $ND.C_BASE_ITEM_LOT);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INBOUND_DATE1: INBOUND_DATE1,
        P_INBOUND_DATE2: INBOUND_DATE2,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_LOT: ITEM_LOT,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    // 데이터 조회
    $NC.serviceCall("/LSC03020Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

}

function grdMasterOnGetColumns() {

    // 컬럼 정렬은 안되도록 처리
    var columns = [];
    $NC.setGridColumn(columns, {
        id: "TRACKING_LEVEL",
        field: "TRACKING_LEVEL",
        name: "단계",
        formatter: function(row, cell, value, columnDef, dataContext) {
            var result = "<span";
            if (dataContext.CHILD_CNT > 0) {
                if (dataContext._collapsed) {
                    result += " class='slick-group-toggle collapsed'";
                } else {
                    result += " class='slick-group-toggle expanded'";
                }
                result += " style='margin-left: " + (15 * dataContext.TRACKING_LEVEL) + "px'></span>";
            } else {
                result += " style='margin-left: " + (18 + 15 * dataContext.TRACKING_LEVEL) + "px'></span>";
            }

            if (dataContext.TRACKING_LEVEL == 0) {
                result += "최초입고 - 기준";
            } else {
                result += "재고변동 - " + dataContext.TRACKING_LEVEL + "단계";
            }

            return result;
        },
        band: 0,
        sortable: false,
        minWidth: 200
    });
    $NC.setGridColumn(columns, {
        id: "TRACKING_RANK",
        field: "TRACKING_RANK",
        name: "추적순번",
        band: 0,
        sortable: false,
        minWidth: 70,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "입출고일자",
        band: 1,
        sortable: false,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NO",
        field: "INOUT_NO",
        name: "입출고번호",
        band: 1,
        sortable: false,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        band: 1,
        sortable: false,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        band: 1,
        name: "입출고구분",
        sortable: false
    });
    $NC.setGridColumn(columns, {
        id: "CLIENT_CD",
        field: "CLIENT_CD",
        name: "공급/배송처",
        band: 1,
        minWidth: 90,
        sortable: false
    });
    $NC.setGridColumn(columns, {
        id: "CLIENT_NM",
        field: "CLIENT_NM",
        name: "공급/배송처명",
        band: 1,
        minWidth: 120,
        sortable: false
    });
    $NC.setGridColumn(columns, {
        id: "RCLIENT_CD",
        field: "RCLIENT_CD",
        name: "실배송처",
        band: 1,
        minWidth: 90,
        sortable: false
    });
    $NC.setGridColumn(columns, {
        id: "RCLIENT_NM",
        field: "RCLIENT_NM",
        name: "실배송처명",
        band: 1,
        minWidth: 120,
        sortable: false
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        band: 1,
        sortable: false,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "EN_QTY",
        field: "EN_QTY",
        name: "입고수량",
        band: 1,
        sortable: false,
        minWidth: 80,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DN_QTY",
        field: "DN_QTY",
        name: "출고수량",
        band: 1,
        sortable: false,
        minWidth: 70,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "EC_QTY",
        field: "EC_QTY",
        name: "재고변동+",
        band: 2,
        sortable: false,
        minWidth: 70,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "EP_QTY",
        field: "EP_QTY",
        name: "원위치/병합+",
        band: 2,
        sortable: false,
        minWidth: 90,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DA_QTY",
        field: "DA_QTY",
        name: "재고변동-",
        band: 2,
        sortable: false,
        minWidth: 70,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CSTOCK_QTY",
        field: "CSTOCK_QTY",
        name: "[입고기준]재고수량",
        band: 2,
        sortable: false,
        minWidth: 170,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        band: 3,
        sortable: false,
        minWidth: 70,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_WAIT_QTY",
        field: "OUT_WAIT_QTY",
        name: "출고대기",
        band: 3,
        sortable: false,
        minWidth: 70,
        cssClass: "styRight"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유효일자",
        band: 3,
        sortable: false,
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        band: 3,
        name: "제조배치번호",
        sortable: false,
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        band: 3,
        sortable: false,
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDMASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1,
        showBandRow: true,
        bands: [
            "추적",
            "입출고정보",
            "수량변동정보",
            "현재고"
        ],
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.TRACKING_LEVEL == 0) {
                    return "stySpecial";
                }
                if (rowData.INOUT_GRP == "E") {
                    // 하위 단계가 있을 경우
                    if (rowData.CHILD_CNT > 0) {
                        return "stySummary";
                    }
                    // 하위 단계가 없을 경우
                    else {
                        return "styDone";
                    }
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LSC03020Q0.RS_MASTER",
        sortCol: "TRACKING_RANK",
        gridOptions: options,
        showGroupToggler: true
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    G_GRDMASTER.view.onGetCellValue.subscribe(grdMasterOnGetCellValue);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnClick(e, args) {

    var rowData = G_GRDMASTER.data.getItem(args.row);
    if ($NC.isNull(rowData)) {
        return;
    }
    // 그룹 토글 처리
    if ($(e.target).hasClass("slick-group-toggle")) {
        if (!rowData._collapsed) {
            rowData._collapsed = true;
        } else {
            rowData._collapsed = false;
        }
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDMASTER, args.row);

        e.stopImmediatePropagation();
        return;
    }
}

function grdMasterOnFilter(item) {

    if ($NC.isNotNull(item.parent)) {
        var dsTarget = G_GRDMASTER.data.getItems();
        var parent = dsTarget[G_GRDMASTER.data.getIdxById(item.parent)];
        while ($NC.isNotNull(parent)) {
            if (parent._collapsed) {
                return false;
            }
            parent = dsTarget[G_GRDMASTER.data.getIdxById(parent.parent)];
        }
    }
    return true;
}

function grdMasterOnGetCellValue(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "LOCATION_CD":
        case "VALID_DATE":
        case "BATCH_NO":
        case "PALLET_ID":
            // 이전 데이터와 중복표시 데이터 숨김
            if (args.row > 0 && rowData.INOUT_GRP == "D") {
                var refRowData = G_GRDMASTER.data.getItem(args.row - 1);
                if ((rowData.TRACKING_LEVEL == refRowData.TRACKING_LEVEL && refRowData.INOUT_GRP == "D") //
                    || (rowData.TRACKING_LEVEL > refRowData.TRACKING_LEVEL && refRowData.INOUT_GRP == "E")) {
                    return "";
                }
            }
            break;
        case "CSTOCK_QTY":
            if ($NC.isNotNull(rowData.EP_RANK)) {
                // return "[원위치/병합+]추적순번: " + rowData.EP_RANK;
                return "<span style='font-weight: normal;'>[원위치/병합+]추적순번: " + rowData.EP_RANK + "</span>";
            }
            if (rowData.CSTOCK_QTY < 1) {
                return "";
            }
            break;
    }
    return null;
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData, grdMasterOnFilter);
    $NC.setInitGridAfterOpen(G_GRDMASTER, null, true);
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    }, function() {
        // 컬럼 표시 조정
        grdMasterOnSetColumns();
    });
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
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

/**
 * 사업부 검색 결과
 * 
 * @param resultInfo
 */
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

    onChangingCondition();
    setPolicyValInfo();
}

/**
 * 상품 검색 팝업 표시
 */
function showItemPopup() {

    $NP.showItemPopup({
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_BRAND_CD: $ND.C_ALL,
        P_ITEM_CD: $ND.C_ALL,
        P_VIEW_DIV: "2",
        P_DEPART_CD: $ND.C_ALL,
        P_LINE_CD: $ND.C_ALL,
        P_CLASS_CD: $ND.C_ALL
    }, onItemPopup, function() {
        $NC.setFocus("#edtQItem_Cd", true);
    });
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onItemPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
        $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);

    } else {
        $NC.setValue("#edtQItem_Cd");
        $NC.setValue("#edtQItem_Nm");
        $NC.setValue("#edtQBrand_Cd");
        $NC.setFocus("#edtQItem_Cd", true);
    }

    onChangingCondition();
}