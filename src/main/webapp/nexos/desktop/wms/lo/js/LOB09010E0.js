﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB09010E0
 *  프로그램명         : 거래명세서회수
 *  프로그램설명       : 거래명세서회수 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-04-23
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-04-23    ASETEC           신규작성
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
                        container: "#ctrTopView"
                    },
                    viewSecond: {
                        container: "#ctrBottomView",
                        grids: [
                            "#grdT1Master"
                        ]
                    },

                    viewType: "v",
                    viewFixed: {
                        container: "viewFirst",
                        size: 53
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

    $("#divOConditionRetrieveDate").hide();
    $NC.setEnableGroup("#ctrAdditional_grdT1Sub", false);

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();

    // 조회조건 - 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    // 검색구분에 미회수를 선택
    $NC.setValue("#rgbQView_Div2", "1");

    // 조회조건 - 배송처 초기값 설정
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");

    // 조회조건 - 출고일자 초기화
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2", null, -15);

    // 조회조건 - 회수일자 초기화
    $NC.setInitDatePicker("#dtpQRetrieve_Date");
    $NC.setInitDateRangePicker("#dtpQRetrieve_Date1", "#dtpQRetrieve_Date2");

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);

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
        case "DELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB09010E0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB09010E0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
        case "RETRIEVE_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB09010E0.003", "회수일자를 정확히 입력하십시오."));
            break;
        case "RETRIEVE_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB09010E0.004", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "RETRIEVE_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB09010E0.005", "검색 종료일자를 정확히 입력하십시오."));
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
        case "SCAN_BAR_CD":
            onScanItem(view, val);
            break;
    }
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputKeyUp(e, view) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "SCAN_BAR_CD":
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
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.setEnableGroup("#ctrAdditional_grdT1Sub", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_NO;
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_NO;
}

function onInquiry(isSave) {

    if (isSave !== true && $NC.isGridModified(G_GRDT1MASTER)) {
        if (!confirm($NC.getDisplayMsg("JS.LOB09010E0.006", "출고 거래명세서 회수 작업 중 입니다.\n재조회 처리하시겠습니까?\n\n※ 현재 작업 중인 데이터는 저장되지 않습니다."))) {
            setFocusScan();
            return;
        }
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.007", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.008", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBrand_Cd");
        return;
    }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.009", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.010", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.011", "출고일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);

    // 거래명세서회수 등록 탭
    if ($NC.getTabActiveIndex("#ctrMasterView") == 0) {
        var VIEW_DIV = $NC.getValueRadioGroup("rgbQView_Div");

        // 조회시 값 초기화
        $NC.clearGridData(G_GRDT1MASTER);
        $NC.setEnableGroup("#ctrAdditional_grdT1Sub", false);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2,
            P_DELIVERY_CD: DELIVERY_CD,
            P_VIEW_DIV: VIEW_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/LOB09010E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    }
    // 거래명세서회수 내역 탭
    else {
        var RETRIEVE_DATE1 = $NC.getValue("#dtpQRetrieve_Date1");
        if ($NC.isNull(RETRIEVE_DATE1)) {
            alert($NC.getDisplayMsg("JS.LOB09010E0.012", "회수 검색 시작일자를 입력하십시오."));
            $NC.setFocus("#dtpQRetrieve_Date1");
            return;
        }

        var RETRIEVE_DATE2 = $NC.getValue("#dtpQRetrieve_Date2");
        if ($NC.isNull(RETRIEVE_DATE2)) {
            alert($NC.getDisplayMsg("JS.LOB09010E0.013", "회수 검색 종료일자를 입력하십시오."));
            $NC.setFocus("#dtpQRetrieve_Date2");
            return;
        }

        if (RETRIEVE_DATE1 > RETRIEVE_DATE2) {
            alert($NC.getDisplayMsg("JS.LOB09010E0.014", "회수일자 검색 범위 오류입니다."));
            $NC.setFocus("#dtpQRetrieve_Date1");
            return;
        }

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2,
            P_DELIVERY_CD: DELIVERY_CD,
            P_RETRIEVE_DATE1: RETRIEVE_DATE1,
            P_RETRIEVE_DATE2: RETRIEVE_DATE2
        };
        // 데이터 조회
        $NC.serviceCall("/LOB09010E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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

    if (G_GRDT1MASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.015", "저장할 데이터가 없습니다."));
        setFocusScan();
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        setFocusScan();
        return;
    }

    var dsMaster = [ ];
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    dsMaster.push({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_RETRIEVE_YN: rowData.RETRIEVE_YN,
        P_RETRIEVE_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CRUD: rowData.CRUD
    });

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.016", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LOB09010E0/save.do", {
        P_MASTER_PARAMS: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_RETRIEVE_YN: rowData.RETRIEVE_YN,
            P_OUTBOUND_STATE: rowData.OUTBOUND_STATE,
            P_RETRIEVE_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CRUD: rowData.CRUD
        },
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

function tabOnBeforeActivate(event, ui) {

    if ($NC.isGridModified(G_GRDT1MASTER)) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.017", "출고 거래명세서 회수 작업 중 입니다.\n\n작업완료(저장) 후 이동하십시오."));
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
        $("#divOConditionViewDiv").show();
        $("#divOConditionRetrieveDate").hide();

        // 공통 버튼 활성화 처리
        if ($NC.G_VAR.T1_INQUIRY_YN == $ND.C_YES) {
            $NC.G_VAR.buttons._inquiry = "1";
            $NC.G_VAR.buttons._new = "0";
            $NC.G_VAR.buttons._save = "0";
            $NC.G_VAR.buttons._cancel = "0";
            $NC.G_VAR.buttons._delete = "0";
            $NC.G_VAR.buttons._print = "0";

            $NC.setInitTopButtons($NC.G_VAR.buttons);
            setFocusScan();
        }
    } else {
        $("#divOConditionViewDiv").hide();
        $("#divOConditionRetrieveDate").show();

        $NC.onGlobalResize();

        // 공통 버튼 활성화 처리
        $NC.setInitTopButtons();
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
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
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
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
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
        id: "OUTBOUND_BATCH_F",
        field: "OUTBOUND_BATCH_F",
        name: "출고차수"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });
    $NC.setGridColumn(columns, {
        id: "RETRIEVE_YN",
        field: "RETRIEVE_YN",
        name: "회수여부",
        minWidth: 90,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "RETRIEVE_USER_ID",
        field: "RETRIEVE_USER_ID",
        name: "회수사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "RETRIEVE_DATETIME",
        field: "RETRIEVE_DATETIME",
        name: "회수일시"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 거래명세서회수 등록 탭의 상단그리드 초기화
 */
function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 1,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.RETRIEVE_YN == $ND.C_NO) {
                    return;
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LOB09010E0.RS_T1_MASTER",
        sortCol: "OUTBOUND_DATE",
        gridOptions: options,
        onBeforeSort: function(args) {
            if ($NC.isGridModified(G_GRDT1MASTER)) {
                alert($NC.getDisplayMsg("JS.LOB09010E0.017", "출고 거래명세서 회수 작업 중 입니다.\n\n작업완료(저장) 후 정렬하십시오."));
                return false;
            }
            return true;
        }
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

/**
 * 거래명세서회수 등록탭 상단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }

    if ($NC.isGridModified(G_GRDT1MASTER)) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.017", "출고 거래명세소 회수 작업 중 입니다.\n\n작업완료(저장) 후 이동하십시오."));
        e.stopImmediatePropagation();
        var activeCell = G_GRDT1MASTER.view.getActiveCell();
        $NC.setGridSelectRow(G_GRDT1MASTER, G_GRDT1MASTER.lastRow, activeCell.cell, false, 1);
        setFocusScan();
        return;
    }

    var row = args.rows[0];

    $NC.setEnableGroup("#ctrAdditional_grdT1Sub");
    $NC.setFocus("#edtScan_Bar_Cd");

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT2MasterOnGetColumns() {

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
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
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
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
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
        id: "OUTBOUND_BATCH_F",
        field: "OUTBOUND_BATCH_F",
        name: "출고차수"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });
    $NC.setGridColumn(columns, {
        id: "RETRIEVE_YN",
        field: "RETRIEVE_YN",
        name: "회수여부",
        minWidth: 90,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "RETRIEVE_USER_ID",
        field: "RETRIEVE_USER_ID",
        name: "회수사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "RETRIEVE_DATETIME",
        field: "RETRIEVE_DATETIME",
        name: "회수일시"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 거래명세서회수 내역 탭의 그리드 초기화
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LOB09010E0.RS_T2_MASTER",
        sortCol: "OUTBOUND_DATE",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 거래명세서회수 내역 탭의 그리드 행 클릭시 처리
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
 * 거래명세서회수 등록 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER, [
        "OUTBOUND_DATE",
        "OUTBOUND_NO"
    ], true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_YES;

    setEnableCondition();
}

/**
 * 거래명세서회수 내역 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_YES;
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

    // 배송처 조회조건 초기화
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

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

/**
 * 저장 정상 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "OUTBOUND_NO"
        ]
    });
    onInquiry(true);
    G_GRDT1MASTER.lastKeyVal = lastKeyValM;
}

/**
 * 저장 오류 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

    $NC.onError(ajaxData);
    onInquiry(true);
    setFocusScan();
}

function onScanItem($view, scanVal) {

    $NC.setValue($view);
    if ($NC.getTabActiveIndex("#ctrMasterView") != 0) {
        return;
    }

    if (G_GRDT1MASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.018", "조회 후 처리하십시오."));
        setFocusScan($view);
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        setFocusScan($view);
        return;
    }
    if ($NC.isNull(scanVal)) {
        setFocusScan($view);
        return;
    }

    // 바코드 파싱
    var SCAN_DATA = scanVal.split($ND.C_SEP_LOC);
    var SCAN_OUTBOUND_DATE = $NC.getDate(SCAN_DATA[2]);
    var SCAN_OUTBOUND_NO = SCAN_DATA[3];

    var searchRow = $NC.getGridSearchRow(G_GRDT1MASTER, {
        searchKey: [
            "OUTBOUND_DATE",
            "OUTBOUND_NO"
        ],
        searchVal: [
            SCAN_OUTBOUND_DATE,
            SCAN_OUTBOUND_NO
        ]
    });
    if (searchRow == -1) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.019", "존재하지 않는 전표입니다."));
        setFocusScan($view);
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(searchRow);
    if (rowData.RETRIEVE_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LOB09010E0.020", "이미 거래명세서 회수 처리된 전표입니다."));
        setFocusScan($view);
        return;
    }

    $NC.setGridSelectRow(G_GRDT1MASTER, searchRow);

    // 마스터 회수여부 변경
    rowData.RETRIEVE_YN = $ND.C_YES;
    $NC.setGridApplyPost(G_GRDT1MASTER, rowData, true);

    _Save();

    setEnableCondition(false);
    setFocusScan();
}

function setFocusScan(selector) {

    var $view = $NC.getView("#edtScan_Bar_Cd");
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
