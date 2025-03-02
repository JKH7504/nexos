﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : RIB05050E0
 *  프로그램명         : 반입시리얼관리
 *  프로그램설명       : 반입시리얼관리 화면 Javascript
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
                container: "#ctrMasterView",
                grids: $NC.getTabActiveIndex("#ctrMasterView") == 1 ? "#grdT2Master" : ""
            };
        },
        autoResizeFixedView: function() {
            if ($NC.getTabActiveIndex("#ctrMasterView") == 0) {
                return {
                    viewFirst: {
                        container: "#ctrLeftView",
                        grids: [
                            "#grdT1Master",
                            "#grdT1Detail"
                        ]
                    },
                    viewSecond: {
                        container: "#ctrRightView",
                        grids: "#grdT1Sub"
                    },
                    viewType: "h",
                    viewFixed: {
                        container: "viewSecond",
                        size: 500
                    }
                };
            }
        }
    });

    // 탭 초기화
    $NC.setInitTab("#ctrMasterView", {
        tabIndex: 0,
        onBeforeActivate: tabOnBeforeActivate,
        onActivate: tabOnActivate
    });

    $NC.setVisible("#ctrQT2_Inbound_Date", false);
    $NC.setVisible("#ctrQItem_Serial", false);
    $NC.setEnableGroup("#ctrAdditional_grdT1Sub", false);
    $NC.setEnable("#btnSerialHistory", false);

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT1SubInitialize();
    grdSerialHistoryInitialize();
    grdT2MasterInitialize();

    // 조회조건 - 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 조회조건 - 배송처 초기값 설정
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");

    // 조회조건 - 반입일자 초기화
    $NC.setInitDatePicker("#dtpQInbound_Date");
    $NC.setInitDateRangePicker("#dtpQInbound_Date1", "#dtpQInbound_Date2");

    // 조회조건 - 상품 초기값 설정
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnSerialHistory").click(showSerialHistoryOverlay);
    $("#btnSerialHistoryClose").click(function() {
        $("#ctrSerialHistoryOverlay").hide();
        window.G_GRDSERIALHISTORY.refRowData = null;
        setFocusScan();
    });

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
}

function _OnLoaded() {

    $NC.setInitSplitter("#ctrLeftView", "h", 300);
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

    if ($NC.isVisible("#ctrSerialHistoryOverlay")) {
        var $parent = $("#ctrSerialHistoryView").parent();
        $NC.resizeGridView("#ctrSerialHistoryView", "#grdSerialHistory",//
        null, //
        $parent.height() - $NC.getViewHeight($parent.children().not("#ctrSerialHistoryView")));
    }
}

function _OnFocus() {

    setFocusScan();
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
        case "INBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIB05050E0.001", "반입일자를 정확히 입력하십시오."));
            break;
        case "INBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIB05050E0.002", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIB05050E0.003", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "ITEM_SERIAL":
            onScanSerial(view, val);
            break;
        case "ITEM_BAR_CD":
            onScanItem(view, val);
            break;
        case "L1_ITEM_SERIAL":
            onOverlayScanSerial(view, val);
            break;
    }
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputKeyUp(e, view) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "ITEM_SERIAL":
        case "ITEM_BAR_CD":
            // Enter-Key 포커스 이동 무시
            if (e.keyCode == 13) {
                e.stopImmediatePropagation();
                // MS-IE일 경우 event가 완전히 무시 처리되기 때문에 change 강제 호출
                if ($.browser.msie) {
                    setTimeout(function() {
                        view.change();
                    });
                }
            }
            break;
    }
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT1SUB);
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.setEnableGroup("#ctrAdditional_grdT1Sub", false);
    grdT1SubOnInputValue();
    $NC.setEnable("#btnSerialHistory", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_NO;
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_NO;
}

function onInquiry(isSave) {

    if (isSave !== true && $NC.isGridModified(G_GRDT1SUB)) {
        if (!confirm($NC.getDisplayMsg("JS.RIB05050E0.004", "반입 시리얼번호 등록 작업 중 입니다.\n재조회 처리하시겠습니까?\n\n※ 현재 작업 중인 데이터는 저장되지 않습니다."))) {
            setFocusScan();
            return;
        }
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.005", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.006", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBrand_Cd");
        return;
    }

    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

    // 반입시리얼 등록 탭
    if ($NC.getTabActiveIndex("#ctrMasterView") == 0) {
        var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
        if ($NC.isNull(INBOUND_DATE)) {
            alert($NC.getDisplayMsg("JS.RIB05050E0.007", "반입일자를 입력하십시오."));
            $NC.setFocus("#dtpQInbound_Date");
            return;
        }

        // 조회시 값 초기화
        $NC.clearGridData(G_GRDT1MASTER);
        $NC.clearGridData(G_GRDT1DETAIL);
        $NC.clearGridData(G_GRDT1SUB);
        $NC.setEnableGroup("#ctrAdditional_grdT1Sub", false);
        grdT1SubOnInputValue();
        $NC.setEnable("#btnSerialHistory", false);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INBOUND_DATE: INBOUND_DATE,
            P_DELIVERY_CD: DELIVERY_CD,
            P_BU_NO: BU_NO,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM
        };
        // 데이터 조회
        $NC.serviceCall("/RIB05050E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    }
    // 반입시리얼 내역 탭
    else {
        var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
        if ($NC.isNull(INBOUND_DATE1)) {
            alert($NC.getDisplayMsg("JS.RIB05050E0.008", "시작일자를 입력하십시오."));
            $NC.setFocus("#dtpQInbound_Date1");
            return;
        }

        var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
        if ($NC.isNull(INBOUND_DATE2)) {
            alert($NC.getDisplayMsg("JS.RIB05050E0.009", "종료일자를 입력하십시오."));
            $NC.setFocus("#dtpQInbound_Date2");
            return;
        }

        if (INBOUND_DATE1 > INBOUND_DATE2) {
            alert($NC.getDisplayMsg("JS.RIB05050E0.010", "반입일자 검색 범위 오류입니다."));
            $NC.setFocus("#dtpQInbound_Date1");
            return;
        }
        var ITEM_SERIAL = $NC.getValue("#edtQItem_Serial", true);

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INBOUND_DATE1: INBOUND_DATE1,
            P_INBOUND_DATE2: INBOUND_DATE2,
            P_DELIVERY_CD: DELIVERY_CD,
            P_BU_NO: BU_NO,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_SERIAL: ITEM_SERIAL
        };
        // 데이터 조회
        $NC.serviceCall("/RIB05050E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    onInquiry(false);
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

    if ($NC.getTabActiveIndex("#ctrMasterView") != 0) {
        return;
    }

    if (G_GRDT1DETAIL.data.getLength() == 0 || $NC.isNull(G_GRDT1DETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.011", "시리얼번호 저장할 상품을 먼저 선택하십시오."));
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }
    var refRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);

    if (G_GRDT1SUB.data.getItems().length == 0) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.012", "저장할 데이터가 없습니다."));
        setFocusScan();
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1SUB)) {
        setFocusScan();
        return;
    }

    // 저장시 전체삭제 후 재등록이기 때문에 등록할 건수가 있을 경우에 수량이 같은지 체크
    if (G_GRDT1SUB.data.getLength() > 0) {
        var SUM_CONFIRM_QTY = $NC.getGridSumVal(G_GRDT1SUB, {
            sumKey: "CONFIRM_QTY"
        });
        if (refRowData.CONFIRM_QTY < SUM_CONFIRM_QTY) {
            alert($NC.getDisplayMsg("JS.RIB05050E0.013", "반입수량을 초과해서 시리얼번호를 등록할 수 없습니다."));
            setFocusScan();
            return;
        }
    }

    // 전체 삭제 후 재등록 처리하므로 화면에 표시된 데이터 전체를 송신 함
    var dsSub = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDT1SUB.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1SUB.data.getItem(rIndex);
        dsSub.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_ITEM_SERIAL: rowData.ITEM_SERIAL,
            P_SERIAL_DATA_DIV: "1", // 1: 일련번호로 세팅
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_CONFIRM_QTY: rowData.CONFIRM_QTY,
            P_REMARK1: rowData.REMARK1,
            P_REG_USER_ID: rowData.REG_USER_ID, // 수정하지 않은 데이터는 원등록자/시간 유지
            P_REG_DATETIME: rowData.REG_DATETIME, // "
            P_LAST_USER_ID: rowData.LAST_USER_ID, // "
            P_LAST_DATETIME: rowData.LAST_DATETIME, // "
            P_CRUD: rowData.CRUD
        });
    }

    $NC.serviceCall("/RIB05050E0/save.do", {
        P_MASTER_PARAMS: {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_INBOUND_DATE: refRowData.INBOUND_DATE,
            P_INBOUND_NO: refRowData.INBOUND_NO,
            P_LINE_NO: refRowData.LINE_NO,
            P_INBOUND_STATE: refRowData.INBOUND_STATE
        },
        P_DS_SUB: dsSub,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if ($NC.getTabActiveIndex("#ctrMasterView") != 0) {
        return;
    }

    if (G_GRDT1SUB.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.014", "삭제할 데이터가 없습니다."));
        setFocusScan();
        return;
    }
    var rowData = G_GRDT1SUB.data.getItem(G_GRDT1SUB.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제, 그외 CRUD를 "D"로 변경
    var rowCount = $NC.deleteGridRowData(G_GRDT1SUB, rowData, true);

    // 디테일 시리얼수량 변경
    rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
    rowData.SERIAL_QTY = rowCount;
    $NC.setGridApplyPost(G_GRDT1DETAIL, rowData, true);
    $NC.setValue("#edtSerial_Qty", rowData.SERIAL_QTY);

    setEnableCondition(!$NC.isGridModified(G_GRDT1SUB));

    setFocusScan();
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

function tabOnBeforeActivate(event, ui) {

    if ($NC.isGridModified(G_GRDT1SUB)) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.015", "반입 시리얼번호 등록 작업 중 입니다.\n\n작업완료(저장) 후 이동하십시오."));
        event.preventDefault();
        setFocusScan();
        return;
    }
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

    if ($NC.getTabActiveIndex("#ctrMasterView") == 0) {
        $NC.setVisible("#ctrQT1_Inbound_Date");
        $NC.setVisible("#ctrQT2_Inbound_Date", false);
        $NC.setVisible("#ctrQItem_Serial", false);

        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#ctrLeftView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#ctrLeftView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#ctrLeftView", "h", 300);
        }

        // 공통 버튼 활성화 처리
        if ($NC.G_VAR.T1_INQUIRY_YN == $ND.C_YES) {
            $NC.G_VAR.buttons._inquiry = "1";
            $NC.G_VAR.buttons._new = "0";
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "0";
            $NC.G_VAR.buttons._delete = "1";
            $NC.G_VAR.buttons._print = "0";

            $NC.setInitTopButtons($NC.G_VAR.buttons);
            setFocusScan();
        }
    } else {
        $NC.setVisible("#ctrQT1_Inbound_Date", false);
        $NC.setVisible("#ctrQT2_Inbound_Date");
        $NC.setVisible("#ctrQItem_Serial");

        $NC.onGlobalResize();

        // 공통 버튼 활성화 처리
        $NC.setInitTopButtons();
    }
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_D",
        field: "INBOUND_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "반입구분"
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
        id: "PLANED_DATETIME",
        field: "PLANED_DATETIME",
        name: "도착예정일시",
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
 * 반입시리얼 등록 탭의 상단그리드 초기화
 */
function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.INBOUND_STATE < $ND.C_STATE_CONFIRM) {
                    return;
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "RIB05050E0.RS_T1_MASTER",
        sortCol: "INBOUND_NO",
        gridOptions: options,
        onBeforeSort: function(args) {
            if ($NC.isGridModified(G_GRDT1SUB)) {
                alert($NC.getDisplayMsg("JS.RIB05050E0.016", "반입 시리얼번호 등록 작업 중 입니다.\n\n작업완료(저장) 후 정렬하십시오."));
                return false;
            }
            return true;
        }
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

/**
 * 반입시리얼 등록탭 상단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }

    if ($NC.isGridModified(G_GRDT1SUB)) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.015", "반입 시리얼번호 등록 작업 중 입니다.\n\n작업완료(저장) 후 이동하십시오."));
        e.stopImmediatePropagation();
        var activeCell = G_GRDT1MASTER.view.getActiveCell();
        $NC.setGridSelectRow(G_GRDT1MASTER, G_GRDT1MASTER.lastRow, activeCell.cell, false, 1);
        setFocusScan();
        return;
    }

    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    // 조회시 값 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);

    G_GRDT1DETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/RIB05050E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1DetailOnGetColumns() {

    var columns = [];
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
        id: "SERIAL_IN_YN",
        field: "SERIAL_IN_YN",
        name: "시리얼관리여부",
        minWidth: 90,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_QTY",
        field: "SERIAL_QTY",
        name: "시리얼등록수량",
        minWidth: 90,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 반입시리얼 등록 탭의 하단그리드 초기화
 */
function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.SERIAL_IN_YN == $ND.C_NO) {
                    return;
                }
                if (rowData.CONFIRM_QTY > rowData.SERIAL_QTY) {
                    return "styError";
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "RIB05050E0.RS_T1_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options,
        onBeforeSort: function(args) {
            if ($NC.isGridModified(G_GRDT1SUB)) {
                alert($NC.getDisplayMsg("JS.RIB05050E0.016", "반입 시리얼번호 등록 작업 중 입니다.\n\n작업완료(저장) 후 정렬하십시오."));
                return false;
            }
            return true;
        }
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onGetCellValue.subscribe(grdT1DetailOnGetCellValue);
}

function grdT1DetailOnGetCellValue(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "SERIAL_QTY":
            if (rowData.SERIAL_IN_YN == $ND.C_NO) {
                return "-";
            }
            break;
    }
    return null;
}

/**
 * 반입시리얼 등록 탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }

    if ($NC.isGridModified(G_GRDT1SUB)) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.015", "반입 시리얼번호 등록 작업 중 입니다.\n\n작업완료(저장) 후 이동하십시오."));
        e.stopImmediatePropagation();
        var activeCell = G_GRDT1DETAIL.view.getActiveCell();
        $NC.setGridSelectRow(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, activeCell.cell, false, 1);
        setFocusScan();
        return;
    }

    var row = args.rows[0];
    var rowData = G_GRDT1DETAIL.data.getItem(row);

    $NC.clearGridData(G_GRDT1SUB);
    if (rowData.SERIAL_IN_YN == $ND.C_NO) {
        $NC.setEnableGroup("#ctrAdditional_grdT1Sub", false);
        grdT1SubOnInputValue();
    } else {
        $NC.setEnableGroup("#ctrAdditional_grdT1Sub");
        grdT1SubOnInputValue(rowData);
        // 그리드 전역변수 값 초기화
        $NC.clearGridData(G_GRDT1SUB);
        G_GRDT1SUB.queryParams = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO,
            P_LINE_NO: rowData.LINE_NO
        };
        // 데이터 조회
        $NC.serviceCall("/RIB05050E0/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function grdT1SubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_SERIAL",
        field: "ITEM_SERIAL",
        name: "시리얼번호",
        minWidth: 200,
        cssClass: "styCenter styImportant"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 반입시리얼 등록 탭의 하단그리드 초기화
 */
function grdT1SubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0,
        rowHeight: 26
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Sub", {
        columns: grdT1SubOnGetColumns(),
        queryId: "RIB05050E0.RS_T1_SUB",
        sortCol: "ITEM_SERIAL",
        gridOptions: options,
        onFilter: grdT1SubOnFilter
    });

    G_GRDT1SUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
    G_GRDT1SUB.view.onBeforeEditCell.subscribe(grdT1SubOnBeforeEditCell);
    G_GRDT1SUB.view.onCellChange.subscribe(grdT1SubOnCellChange);
    G_GRDT1SUB.view.onClick.subscribe(grdT1SubOnClick);
}

/**
 * grdT1Sub 데이터 필터링 이벤트
 */
function grdT1SubOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

/**
 * 반입시리얼 등록 탭 하단그리드 행 클릭시
 * 
 * @param e
 * @param args
 */
function grdT1SubOnClick(e, args) {

    if (G_GRDT1SUB.view.getColumnField(args.cell) != "REMARK1") {
        setFocusScan();
    }
}

/**
 * 반입시리얼 등록 탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
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
 * 수정 가능 여부 체크
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdT1SubOnBeforeEditCell(e, args) {

    // var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    // if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
    switch (args.column.id) {
        case "ITEM_SERIAL":
            return false;
    }
    // }
    return true;
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdT1SubOnNewRecord(args) {

    // 신규 추가 후 포커싱
    _OnFocus();
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdT1SubOnCellChange(e, args) {

    var rowData = args.item;
    // switch (G_GRDT1SUB.view.getColumnId(args.cell)) {
    // case "ITEM_SERIAL":
    // break;
    // }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1SUB, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdT1SubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1SUB, row, "ITEM_SERIAL")) {
        return true;
    }
    var rowData = G_GRDT1SUB.data.getItem(row);

    // 신규 데이터 업데이트, N -> C, 일반 데이터 강제 업데이트
    $NC.setGridApplyPost(G_GRDT1SUB, rowData, true);
    return true;
}

function grdT1SubOnInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }
    $NC.setValue("#edtItem_Bar_Cd");
    $NC.setValue("#edtItem_Serial");

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtLine_No", rowData["LINE_NO"]);
    $NC.setValue("#edtItem_Cd", rowData["ITEM_CD"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtItem_Spec", rowData["ITEM_SPEC"]);
    $NC.setValue("#edtBrand_Cd", rowData["BRAND_CD"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtConfirm_Qty", rowData["CONFIRM_QTY"]);
    $NC.setValue("#edtSerial_Qty", rowData["SERIAL_QTY"]);

    if ($NC.isNotNull(rowData["LINE_NO"])) {
        $NC.setFocus("#edtItem_Serial");
    }
}

function grdSerialHistoryOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "SERIAL_DATE",
        field: "SERIAL_DATE",
        name: "입출고일자",
        minWidth: 90,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_NO",
        field: "SERIAL_NO",
        name: "입출고번호",
        minWidth: 90,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "VD_CD",
        field: "VD_CD",
        name: "공급처/배송처",
        minWidth: 100
    });
    $NC.setGridColumn(columns, {
        id: "VD_NM",
        field: "VD_NM",
        name: "공급처/배송처명",
        minWidth: 120
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "수령자전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "수령자휴대폰",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        minWidth: 150
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSerialHistoryInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSerialHistory", {
        columns: grdSerialHistoryOnGetColumns(),
        queryId: "RIB05050E0.RS_T1_REF2",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    window.G_GRDSERIALHISTORY.view.onSelectedRowsChanged.subscribe(grdSerialHistoryOnAfterScroll);
}

function grdSerialHistoryOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(window.G_GRDSERIALHISTORY, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(window.G_GRDSERIALHISTORY, row + 1);
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "반입일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]",
        groupToggler: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
        cssClass: "styCenter",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight",
        groupToggler: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SERIAL",
        field: "ITEM_SERIAL",
        name: "시리얼번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_QTY",
        field: "SERIAL_QTY",
        name: "시리얼수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "반입구분",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 반입시리얼 내역 탭의 그리드 초기화
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 5,
        summaryRow: {
            visible: true
        }
    };

    // Data Grouping
    var dataGroupOptions = [
        {
            getter: function(rowData) {
                return rowData.INBOUND_DATE + "|" + rowData.INBOUND_NO;
            }
        },
        {
            getter: "LINE_NO"
        }
    ];

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "RIB05050E0.RS_T2_MASTER",
        sortCol: "INBOUND_NO",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
    G_GRDT2MASTER.view.onGetCellValue.subscribe(grdT2MasterOnGetCellValue);
}

function grdT2MasterOnGetCellValue(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "SERIAL_QTY":
            return rowData.__group ? null : "";
    }
    return null;
}

/**
 * 반입시리얼 내역 탭의 그리드 행 클릭시 처리
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
 * 반입시리얼 등록 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDT1MASTER, "INBOUND_NO")) {
        $NC.setEnable("#btnSerialHistory");
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_YES;

    setEnableCondition();
}

/**
 * 반입시리얼 내역 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER, "INBOUND_NO");
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_YES;
}

/**
 * 반입시리얼 등록 탭 하단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1DETAIL, "LINE_NO")) {
        $NC.setInitGridVar(G_GRDT1SUB);
        onGetT1Sub({
            data: null
        });
    }
}

/**
 * 반입시리얼 등록 탭 하단 그리드에 데이터 표시처리
 */
function onGetT1Sub(ajaxData) {

    $NC.setInitGridData(G_GRDT1SUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1SUB, "ITEM_SERIAL");
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

    $NP.showBuBrandPopup({
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
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

    $NP.showDeliveryPopup({
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
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

function getInboundState(params, onSuccess) {

    // 데이터 조회
    $NC.serviceCall("/RIB05050E0/getData.do", {
        P_QUERY_ID: "WF.GET_RI_INBOUND_STATE",
        P_QUERY_PARAMS: params
    }, onSuccess);
}

/**
 * 저장 정상 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: "INBOUND_NO"
    });
    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "LINE_NO"
    });
    onInquiry(true);
    G_GRDT1MASTER.lastKeyVal = lastKeyValM;
    G_GRDT1DETAIL.lastKeyVal = lastKeyValD;
}

/**
 * 저장 오류 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

    $NC.onError(ajaxData);
    setFocusScan();
}

function onScanItem($view, scanVal) {

    $NC.setValue($view);
    if ($NC.getTabActiveIndex("#ctrMasterView") != 0) {
        return;
    }

    if (G_GRDT1DETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.017", "데이터 조회 후 처리하십시오."));
        setFocusScan($view);
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1SUB)) {
        setFocusScan($view);
        return;
    }
    if ($NC.isNull(scanVal)) {
        setFocusScan($view);
        return;
    }

    var searchRow = $NC.getGridSearchRow(G_GRDT1DETAIL, {
        searchKey: [
            "ITEM_CD",
            "ITEM_BAR_CD",
            "BOX_BAR_CD",
            "CASE_BAR_CD"
        ],
        searchVal: scanVal,
        compareFn: function(rowData, searchKeys, searchKeyCount, searchVals) {
            for (var rIndex = 0; rIndex < searchKeyCount; rIndex++) {
                if ($NC.equals(rowData[searchKeys[rIndex]], searchVals[0])) {
                    return true;
                }
            }
            return false;
        }
    });
    if (searchRow == -1) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.018", "해당 전표에 존재하지 않는 상품입니다."));
        setFocusScan($view);
        return;
    }

    var rowData = G_GRDT1DETAIL.data.getItem(searchRow);
    if (rowData.SERIAL_IN_YN != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.019", "시리얼번호 입력 대상 상품이 아닙니다."));
        setFocusScan($view);
        return;
    }

    $NC.setGridSelectRow(G_GRDT1DETAIL, searchRow);
    setFocusScan();
}

function onScanSerial($view, scanVal) {

    $NC.setValue($view);
    if ($NC.getTabActiveIndex("#ctrMasterView") != 0) {
        return;
    }

    if (G_GRDT1DETAIL.data.getLength() == 0 || $NC.isNull(G_GRDT1DETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.020", "시리얼번호를 입력할 상품을 먼저 선택하십시오."));
        setFocusScan("#edtItem_Bar_Cd");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1SUB)) {
        setFocusScan($view);
        return;
    }
    if ($NC.isNull(scanVal)) {
        setFocusScan($view);
        return;
    }
    var scanLen = scanVal.length;
    // Function Button -> FN-SAVE, FN-DELETE
    if (scanLen <= 9 && scanVal.startsWith("FN-")) {
        switch (scanVal) {
            case "FN-SAVE":
                _Save();
                return;
            case "FN-DELETE":
                _Delete();
                return;
        }
    }

    var ITEM_SERIAL = scanVal;
    var refRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
    var rowCount = G_GRDT1SUB.data.getLength();
    // 시리얼번호 건수 체크
    if (rowCount > 0) {
        var SUM_CONFIRM_QTY = $NC.getGridSumVal(G_GRDT1SUB, {
            sumKey: "CONFIRM_QTY"
        });
        if (refRowData.CONFIRM_QTY <= SUM_CONFIRM_QTY) {
            alert($NC.getDisplayMsg("JS.RIB05050E0.021", "반입수량과 동일하게 시리얼번호가 등록되었습니다.\n\n다른 시리얼번호를 등록하려면 삭제 후 등록하십시오."));
            setFocusScan($view);
            return;
        }
    }

    // 기등록된 시리얼번호인지 검색
    var searchRow = $NC.getGridSearchRow(G_GRDT1SUB, {
        searchKey: "ITEM_SERIAL",
        searchVal: ITEM_SERIAL
    });
    if (searchRow != -1) {
        $NC.setGridSelectRow(G_GRDT1SUB, searchRow);
        alert($NC.getDisplayMsg("JS.RIB05050E0.022", "이미 입력된 시리얼 번호 입니다."));
        setFocusScan($view);
        return;
    }

    // 시리얼번호 이력 조회
    var dsSerial, rowData;
    $NC.serviceCallAndWait("/RIB05050E0/getDataSet.do", {
        P_QUERY_ID: "RIB05050E0.RS_T1_REF1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_INBOUND_DATE: refRowData.INBOUND_DATE,
            P_INBOUND_NO: refRowData.INBOUND_NO,
            P_LINE_NO: refRowData.LINE_NO,
            P_BRAND_CD: refRowData.BRAND_CD,
            P_ITEM_CD: refRowData.ITEM_CD,
            P_ITEM_SERIAL: ITEM_SERIAL
        }
    }, function(ajaxData) {
        dsSerial = $NC.toArray(ajaxData);
    }, function(ajaxData) {
        $NC.onError(ajaxData);
    });
    if ((dsSerial || []).length == 0) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.023", "시리얼 입출고 정보를 가져오지 못했습니다."));
        setFocusScan($view);
        return;
    }
    rowData = dsSerial[0] || {};
    // 이전 출고내역 체크
    if (rowData.OUTBOUND_QTY == 0) {
        if (!confirm($NC.getDisplayMsg("JS.RIB05050E0.024", "[시리얼번호: " + ITEM_SERIAL + "] 출고이력이 없는 시리얼번호입니다.\n\n해당 시리얼번호를 추가하시겠습니까?", ITEM_SERIAL))) {
            setFocusScan($view);
            return;
        }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: refRowData.CENTER_CD,
        BU_CD: refRowData.BU_CD,
        INBOUND_DATE: refRowData.INBOUND_DATE,
        INBOUND_NO: refRowData.INBOUND_NO,
        LINE_NO: refRowData.LINE_NO,
        ITEM_SERIAL: ITEM_SERIAL,
        BRAND_CD: refRowData.BRAND_CD,
        ITEM_CD: refRowData.ITEM_CD,
        CONFIRM_QTY: 1,
        REMARK1: "",
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDT1SUB, newRowData);

    // 디테일 시리얼수량 변경
    refRowData.SERIAL_QTY = rowCount + 1;
    $NC.setGridApplyPost(G_GRDT1DETAIL, refRowData, true);
    $NC.setValue("#edtSerial_Qty", refRowData.SERIAL_QTY);

    setEnableCondition(false);
}

function setFocusScan(selector) {

    var $view = $NC.getView($NC.isNull(selector) ? "#edtItem_Serial" : selector);
    if ($NC.isEnable($view)) {
        // $NC.setFocus($view);
        $view.focus();
    }
}

function setEnableCondition(enable) {

    if ($NC.isNull(enable)) {
        enable = true;
    }

    var $ctrConditionView = $("#ctrConditionView");
    if (enable) {
        if ($ctrConditionView.hasClass("locked")) {
            $ctrConditionView.removeClass("locked");
            $NC.setEnableGroup("#ctrConditionView");
        }
    } else {
        if (!$ctrConditionView.hasClass("locked")) {
            $ctrConditionView.addClass("locked");
            $NC.setEnableGroup("#ctrConditionView", false);
        }
    }
}

function showSerialHistoryOverlay(e) {

    if ($NC.isVisible("#ctrSerialHistoryOverlay")) {
        $("#ctrSerialHistoryOverlay").hide();
        return;
    }

    if (G_GRDT1DETAIL.data.getLength() == 0 || $NC.isNull(G_GRDT1DETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.025", "시리얼 입출고 이력 조회할 상품을 선택하십시오."));
        return;
    }

    var refRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow) || {};
    if (refRowData.SERIAL_IN_YN !== $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.RIB05050E0.019", "시리얼번호 입력 대상 상품이 아닙니다."));
        return;
    }

    $NC.setValue("#edtL1_Item_Cd", refRowData.ITEM_CD);
    $NC.setValue("#edtL1_Item_Nm", refRowData.ITEM_NM);
    $NC.setValue("#edtL1_Item_Spec", refRowData.ITEM_SPEC);
    $NC.setValue("#edtL1_Brand_Cd", refRowData.BRAND_CD);
    $NC.setValue("#edtL1_Brand_Nm", refRowData.BRAND_NM);
    $NC.setValue("#edtL1_Item_Serial");

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(window.G_GRDSERIALHISTORY);
    window.G_GRDSERIALHISTORY.refRowData = {
        CENTER_CD: refRowData.CENTER_CD,
        BU_CD: refRowData.BU_CD,
        INBOUND_DATE: refRowData.INBOUND_DATE,
        INBOUND_NO: refRowData.INBOUND_NO,
        LINE_NO: refRowData.LINE_NO,
        BRAND_CD: refRowData.BRAND_CD,
        ITEM_CD: refRowData.ITEM_CD
    };

    $NC.showOverlay("#ctrSerialHistoryOverlay", {
        title: $NC.getDisplayMsg("JS.RIB05050E0.026", "시리얼 입출고 이력"),
        fullscreen: false,
        width: 650,
        height: 400,
        onComplete: function() {
            $NC.onGlobalResize();
            $NC.setFocus("#edtL1_Item_Serial");
        }
    });
}

function onOverlayScanSerial($view, scanVal) {

    $NC.setValue($view);
    $NC.clearGridData(window.G_GRDSERIALHISTORY);

    var refRowData = window.G_GRDSERIALHISTORY.refRowData;
    window.G_GRDSERIALHISTORY.queryParams = {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_INBOUND_DATE: refRowData.INBOUND_DATE,
        P_INBOUND_NO: refRowData.INBOUND_NO,
        P_LINE_NO: refRowData.LINE_NO,
        P_BRAND_CD: refRowData.BRAND_CD,
        P_ITEM_CD: refRowData.ITEM_CD,
        P_ITEM_SERIAL: scanVal
    };
    // 이력 데이터 조회
    $NC.serviceCallAndWait("/RIB05050E0/getDataSet.do", $NC.getGridParams(window.G_GRDSERIALHISTORY), function(ajaxData) {
        $NC.setInitGridData(window.G_GRDSERIALHISTORY, ajaxData);
        if (!$NC.setInitGridAfterOpen(window.G_GRDSERIALHISTORY)) {
            alert($NC.getDisplayMsg("JS.RIB05050E0.027", "시리얼 입출고 이력이 존재하지 않습니다."));
        }
        $NC.setFocus("#edtL1_Item_Serial");
    }, function(ajaxData) {
        $NC.onError(ajaxData);
        $NC.setFocus("#edtL1_Item_Serial");
        return;
    });
}
