﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB05020E0
 *  프로그램명         : 출고중량관리
 *  프로그램설명       : 출고중량관리 화면 Javascript
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
        autoResizeView: function() {
            return {
                container: "#divMasterView",
                grids: $NC.getTabActiveIndex("#divMasterView") == 0 ? "#grdT1Master" : "#grdT2Master"
            };
        },
        autoResizeFixedView: function() {
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                return {
                    viewFirst: {
                        container: "#divBottomLeft",
                        grids: "#grdT1Detail"
                    },
                    viewSecond: {
                        container: "#divBottomRight",
                        grids: "#grdT1Sub"
                    },
                    viewType: "h",
                    viewFixed: {
                        container: "viewSecond",
                        size: 420
                    }
                };
            }
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT1SubInitialize();
    grdT2MasterInitialize();

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
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 출고일자에 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2");

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    $NC.setInitSplitter("#divT1TabSheetView", "h", 300);
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
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "DELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB05020E0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB05020E0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT1SUB);
    $NC.clearGridData(G_GRDT2MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB05020E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB05020E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOB05020E0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOB05020E0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LOB05020E0.007", "출고일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

    // 출고중량등록 탭
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 조회시 값 초기화
        $NC.clearGridData(G_GRDT1MASTER);
        $NC.clearGridData(G_GRDT1DETAIL);
        $NC.clearGridData(G_GRDT1SUB);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2,
            P_DELIVERY_CD: DELIVERY_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM
        };
        // 데이터 조회
        $NC.serviceCall("/LOB05020E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    }
    // 출고중량내역 탭
    else {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2,
            P_DELIVERY_CD: DELIVERY_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM
        };
        // 데이터 조회
        $NC.serviceCall("/LOB05020E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }
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

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *        newTab: The tab that was just activated.<br>
 *        oldTab: The tab that was just deactivated.<br>
 *        newPanel: The panel that was just activated.<br>
 *        oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT1TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT1TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT1TabSheetView", "h", 300);
        }
    } else {
        $NC.onGlobalResize();
    }
}

function grdT1MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_STATE_D",
        field: "OUTBOUND_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "출고구분"
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
        id: "ORDER_DATE",
        field: "ORDER_DATE",
        name: "예정일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_NO",
        field: "ORDER_NO",
        name: "예정번호",
        cssClass: "styCenter"
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
        id: "OUTBOUND_BATCH",
        field: "OUTBOUND_BATCH",
        name: "출고차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 출고중량등록탭의 상단그리드 초기화
 */
function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.OUTBOUND_STATE < $ND.C_STATE_CONFIRM) {
                    return;
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LOB05020E0.RS_T1_MASTER",
        sortCol: "OUTBOUND_NO",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1DetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
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
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "확정EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "WEIGHT_ITEM_YN",
        field: "WEIGHT_ITEM_YN",
        name: "중량상품여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 출고중량등록탭의 하단그리드 초기화
 */
function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.WEIGHT_ITEM_YN == $ND.C_NO) {
                    return;
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "LOB05020E0.RS_T1_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onClick.subscribe(grdT1DetailOnClick);
    G_GRDT1DETAIL.view.onDblClick.subscribe(grdT1DetailOnDblClick);
}

/**
 * 하단그리드 더블 클릭 : 팝업 표시
 */
function grdT1DetailOnDblClick(e, args) {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow) || G_GRDT1DETAIL.data.getLength() == 0) {
        return;
    }

    var rowData = G_GRDT1DETAIL.data.getItem(args.row);
    if (rowData.WEIGHT_ITEM_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.LOB05020E0.008", "[중량상태여부 : " + rowData.WEIGHT_ITEM_YN + "] 데이터는 수정할 수 없습니다.", rowData.WEIGHT_ITEM_YN));
        return;
    }

    var refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    getOutboundState({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_LINE_NO: "",
        P_PROCESS_CD: $ND.C_PROCESS_ENTRY, // 프로세스코드([A]예정, [B]등록)
        P_STATE_DIV: $ND.C_STATE_MIN
    // 상태구분([1]MIN, [2]MAX)
    }, //
    // ServiceCall SuccessCallback
    function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            alert($NC.getDisplayMsg("JS.LOB05020E0.009", "출고진행상태를 확인하지 못했습니다.\n다시 처리하십시오."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }
        if (refRowData.OUTBOUND_STATE != resultData.O_OUTBOUND_STATE) {
            alert($NC.getDisplayMsg("JS.LOB05020E0.010", "[진행상태 : " + resultData.O_OUTBOUND_STATE + "] 데이터가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.",
                resultData.O_OUTBOUND_STATE));
            return;
        }
        if (refRowData.OUTBOUND_STATE == $ND.C_STATE_CONFIRM || refRowData.OUTBOUND_STATE == $ND.C_STATE_DELIVERY) {
            alert($NC.getDisplayMsg("JS.LOB05020E0.011", "[진행상태 : " + refRowData.OUTBOUND_STATE_D //
                + "] 데이터는 수정할 수 없습니다.", refRowData.OUTBOUND_STATE_D));
            return;
        }

        // 중량정보 데이터 재조회 후 처리, 다른 사용자에 의해 변경될 수 있음
        $NC.clearGridData(G_GRDT1SUB);
        G_GRDT1SUB.queryParams = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_LINE_NO: rowData.LINE_NO
        };
        // 데이터 조회, Synchronize
        var serviceCallError = false;
        $NC.serviceCallAndWait("/LOB05020E0/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub, function(subAjaxData) {
            $NC.onError(subAjaxData);
            serviceCallError = true;
        });
        if (serviceCallError) {
            return;
        }
        var dsSub = G_GRDT1SUB.data.getItems();

        $NC.showProgramSubPopup({
            PROGRAM_ID: "LOB05021P0",
            PROGRAM_NM: $NC.getDisplayMsg("JS.LOB05021P0.001", "출고중량등록/수정"),
            url: "lo/LOB05021P0.html",
            width: 650,
            height: 450,
            G_PARAMETER: {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                P_OUTBOUND_NO: rowData.OUTBOUND_NO,
                P_LINE_NO: rowData.LINE_NO,
                P_OUTBOUND_STATE: refRowData.OUTBOUND_STATE,
                P_BRAND_CD: rowData.BRAND_CD,
                P_BRAND_NM: rowData.BRAND_NM,
                P_ITEM_CD: rowData.ITEM_CD,
                P_ITEM_NM: rowData.ITEM_NM,
                P_ITEM_SPEC: rowData.ITEM_SPEC,
                P_CONFIRM_QTY: rowData.CONFIRM_QTY,
                P_SUB_DS: dsSub
            },
            onOk: function() {
                popUpOnOk();
            }
        });
    });
}

/**
 * 출고중량 등록 팝업 호출 후
 */
function popUpOnOk() {

    var rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1SUB);

    G_GRDT1SUB.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_LINE_NO: rowData.LINE_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LOB05020E0/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);
}

function grdT1SubOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_WEIGHT",
        field: "ITEM_WEIGHT",
        name: "상품중량",
        cssClass: "styRight",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 출고중량등록탭의 하단그리드 초기화
 */
function grdT1SubInitialize() {

    var options = {
        frozenColumn: 0,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Sub", {
        columns: grdT1SubOnGetColumns(),
        queryId: "LOB05020E0.RS_T1_SUB",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT1SUB.view.onClick.subscribe(grdT1SubOnClick);
    G_GRDT1SUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
}

function grdT2MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]",
        groupToggler: true
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_WEIGHT",
        field: "ITEM_WEIGHT",
        name: "상품중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_WEIGHT",
        field: "ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "출고구분",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 출고중량내역 탭의 그리드 초기화
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 6,
        summaryRow: {
            visible: true
        }
    };

    // Data Grouping
    var dataGroupOptions = {
        getter: function(rowData) {
            return $NC.rPad(rowData.OUTBOUND_DATE, 10) //
                + "|" + $NC.rPad(rowData.OUTBOUND_NO, 6) //
                + "|" + $NC.lPad(rowData.LINE_NO, 10);

        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LOB05020E0.RS_T2_MASTER",
        sortCol: "LINE_NO",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 출고중량등록 탭 하단 그리드 행 클릭시
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnClick(e, args) {

    G_GRDT1DETAIL.focused = true;

}

/**
 * 출고중량등록 탭 하단 그리드 행 클릭시
 * 
 * @param e
 * @param args
 */
function grdT1SubOnClick(e, args) {

    G_GRDT1SUB.focused = true;

}

/**
 * 출고중량등록탭 상단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    var rowData = G_GRDT1MASTER.data.getItem(row);

    // 조회시 값 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);

    G_GRDT1DETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LOB05020E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

/**
 * 출고중량내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

/**
 * 출고중량등록탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1DETAIL.data.getItem(row);

    // 조회시 값 초기화
    $NC.clearGridData(G_GRDT1SUB);

    G_GRDT1SUB.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_LINE_NO: rowData.LINE_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LOB05020E0/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

/**
 * 출고중량등록탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1SubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1SUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1SUB, row + 1);
}

/**
 * 출고중량등록 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, "OUTBOUND_NO")) {
        $NC.setInitGridVar(G_GRDT1DETAIL);
        onGetT1Detail({
            data: null
        });
    }
}

/**
 * 출고중량내역 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER, "OUTBOUND_NO");
}

/**
 * 출고중량등록 탭 하단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1DETAIL, "ITEM_CD")) {
        $NC.setInitGridVar(G_GRDT1SUB);
        onGetT1Sub({
            data: null
        });
    }
}

/**
 * 출고중량등록 탭 하단 그리드에 데이터 표시처리
 */
function onGetT1Sub(ajaxData) {

    $NC.setInitGridData(G_GRDT1SUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1SUB, "ITEM_CD");
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
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");

    $NP.showBuBrandPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: $ND.C_ALL
    }, onBuBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
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

    // 배송처 조회조건 초기화
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onBuBrandPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
    } else {
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setFocus("#edtQBrand_Cd", true);
    }
    onChangingCondition();
}

/**
 * 검색조건의 배송처 검색 이미지 클릭
 */
function showDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: $ND.C_ALL,
        P_DELIVERY_DIV: $ND.C_ALL,
        P_VIEW_DIV: "2"
    }, onDeliveryPopup, function() {
        $NC.setFocus("#edtQDelivery_Cd", true);
    });
}

function onDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQDelivery_Cd");
        $NC.setValue("#edtQDelivery_Nm");
        $NC.setFocus("#edtQDelivery_Cd", true);
    }
    onChangingCondition();
}

/**
 * 출고상태 조회
 * 
 * @param params
 * @param onSuccess
 */
function getOutboundState(params, onSuccess) {

    // 데이터 조회
    $NC.serviceCall("/LOB05020E0/getData.do", {
        P_QUERY_ID: "WF.GET_LO_OUTBOUND_STATE",
        P_QUERY_PARAMS: params
    }, onSuccess);
}
