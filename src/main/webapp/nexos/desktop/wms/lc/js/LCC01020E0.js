/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC01020E0
 *  프로그램명         : 세트예정등록
 *  프로그램설명       : 세트예정등록 화면 Javascript
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
                grids: $NC.getTabActiveIndex("#divMasterView") == 0 ? [
                    "#grdT1Master",
                    "#grdT1Detail"
                ] : "#grdT2Master"
            };
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
    grdT2MasterInitialize();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    $NC.setInitDateRangePicker("#dtpQOrder_Date1", "#dtpQOrder_Date2");

    // 조회조건 - 물류센터 초기화
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

    // 조회조건 - 출고구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: $ND.C_INOUT_GRP_D4,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });
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
 * Condition Change Event - Input, Select Change 시 호출 됨
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
            var BU_CD = $NC.getValue("#edtQBu_Cd");
            if ($NC.isNull(BU_CD)) {
                alert($NC.getDisplayMsg("JS.LCC01020E0.008", "사업부를 먼저 선택 하십시오."));
                $NC.setValue("#edtQBrand_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onBuBrandChange(val, {
                P_BU_CD: BU_CD,
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "ORDER_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC01020E0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "ORDER_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC01020E0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    if ($NC.isNull(ORDER_DATE1)) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }
    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    if ($NC.isNull(ORDER_DATE2)) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date2");
        return;
    }
    if (ORDER_DATE1 > ORDER_DATE2) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.007", "입출고일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }

    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_BAR_CD = $NC.getValue("#edtQItem_Bar_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");

    // 등록 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ORDER_DATE1: ORDER_DATE1,
            P_ORDER_DATE2: ORDER_DATE2,
            P_INOUT_CD: INOUT_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_BAR_CD: ITEM_BAR_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LCC01020E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    }
    // 내역 조회
    else {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ORDER_DATE1: ORDER_DATE1,
            P_ORDER_DATE2: ORDER_DATE2,
            P_INOUT_CD: INOUT_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_BAR_CD: ITEM_BAR_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LCC01020E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 등록 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
        var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
        var BU_CD = $NC.getValue("#edtQBu_Cd");
        var BU_NM = $NC.getValue("#edtQBu_Nm");
        var ORDER_DATE = $NC.getValue("#dtpQOrder_Date2");
        var CUST_CD = $NC.getValue("#edtQCust_Cd");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "LCC01021P0",
            PROGRAM_NM: $NC.getDisplayMsg("JS.LCC01020E0.009", "세트예정 등록"),
            url: "lc/LCC01021P0.html",
            width: 1024,
            height: 600,
            G_PARAMETER: {
                P_PROCESS_CD: $ND.C_PROCESS_ORDER_CREATE,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_ORDER_DATE: ORDER_DATE,
                P_CUST_CD: CUST_CD,
                P_INOUT_CD: "",
                P_MASTER_DS: {},
                P_DETAIL_DS: []
            },
            onOk: function() {
                onSave();
            }
        });
    }
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

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.010", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    // 등록처리된 전표는 삭제불가
    if (rowData.ETC_STATE != $ND.C_STATE_ORDER) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.011", "이미 등록된 데이터는 삭제할 수 없습니다."));
        return;
    }

    // 재고이동한 전표는 삭제불가
    if (rowData.MOVE_ENTRY_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.012", "재고이동 등록된 전표는 삭제할 수 없습니다.\n재고이동 삭제 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC01020E0.013", "삭제 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC01020E0/callLcOrderDelete.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO
    }, onSave);
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    _Inquiry();
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
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "ORDER_DATE",
            "ORDER_NO"
        ]
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
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
    // 화면상단의 공통 메뉴 버튼 이미지 표시 : true인 경우는 조회 버튼만 활성화 한다.
    setTopButtons();
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "세트변환구분"
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
        id: "LINK_ORDER_NO",
        field: "LINK_ORDER_NO",
        name: "상대예정번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });
    $NC.setGridColumn(columns, {
        id: "MOVE_ENTRY_YN",
        field: "MOVE_ENTRY_YN",
        name: "재고이동여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_USER_ID",
        field: "ORDER_USER_ID",
        name: "예정사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_DATETIME",
        field: "ORDER_DATETIME",
        name: "예정등록일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LCC01020E0.RS_T1_MASTER",
        sortCol: "ORDER_DATE",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onDblClick.subscribe(grdT1MasterOnDblClick);
}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function grdT1MasterOnDblClick(e, args) {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var refRowData = G_GRDT1MASTER.data.getItem(args.row);
    if ($NC.isNull(refRowData)) {
        return;
    }

    // 인터페이스 데이터는 수정불가
    if (refRowData.DATA_DIV != "00") {
        alert($NC.getDisplayMsg("JS.LCC01020E0.014", "인터페이스 수신된 전표는 처리할 수 없습니다."));
        return;
    }

    // 확정처리된 전표는 수정불가
    if (refRowData.ETC_STATE != $ND.C_STATE_ORDER) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.015", "예정 상태의 전표만 처리할 수 있습니다."));
        return;
    }

    // 재고이동한 전표는 수정불가
    if (refRowData.MOVE_ENTRY_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC01020E0.016", "재고이동 등록 된 전표는 처리할 수 없습니다.\n재고이동 삭제 후 처리하십시오."));
        return;
    }

    var ableYn = $ND.C_YES;
    // 조회 후 상태가 바뀌었는지 한번더 상태 체크
    getEtcState({
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_ETC_DATE: refRowData.ORDER_DATE,
        P_ETC_NO: refRowData.ORDER_NO,
        P_LINE_NO: "",
        P_PROCESS_CD: $ND.C_PROCESS_ORDER,
        P_STATE_DIV: $ND.C_STATE_MIN
    }, //
    // ServiceCall SuccessCallback
    function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            ableYn = $ND.C_NO;
            alert($NC.getDisplayMsg("JS.LCC01020E0.017", "진행상태를 확인하지 못했습니다.\n다시 처리하십시오."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            ableYn = $ND.C_NO;
            alert(oMsg);
            return;
        }
        if (refRowData.ETC_STATE != resultData.O_ETC_STATE) {
            ableYn = $ND.C_NO;
            alert($NC.getDisplayMsg("JS.LCC01020E0.018", "[진행상태 : " + resultData.O_ETC_STATE + "] 데이터가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.",
                resultData.O_ETC_STATE));
            return;
        }
    });

    if (ableYn == $ND.C_YES) {
        // 조회 후 재고이동 상태가 바뀌었는지 체크
        getMoveState({
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_ORDER_DATE: refRowData.ORDER_DATE,
            P_ORDER_NO: refRowData.ORDER_NO
        }, //
        // ServiceCall SuccessCallback
        function(ajaxData) {
            var resultData = $NC.toObject(ajaxData);
            if ($NC.isEmpty(resultData)) {
                alert($NC.getDisplayMsg("JS.LCC01020E0.017", "진행상태를 확인하지 못했습니다.\n다시 처리하십시오."));
                return;
            }
            if (resultData[0].MOVE_ENTRY_YN == $ND.C_YES) {
                alert($NC.getDisplayMsg("JS.LCC01020E0.019", "재고이동 등록 된 전표는 처리할 수 없습니다.\n재고이동 삭제 후 처리하십시오."));
                return;
            }

            var dsDetail = [];
            var serviceCallError = false;
            // 데이터 조회 - 세트상품정보
            $NC.serviceCallAndWait("/LCC01020E0/getDataSet.do", {
                P_QUERY_ID: "LCC01020E0.RS_SUB3",
                P_QUERY_PARAMS: {
                    P_CENTER_CD: refRowData.CENTER_CD,
                    P_BU_CD: refRowData.BU_CD,
                    P_ORDER_DATE: refRowData.ORDER_DATE,
                    P_ORDER_NO: $NC.iif(refRowData.INOUT_WORK_DIV == 1, refRowData.LINK_ORDER_NO, refRowData.ORDER_NO)
                }
            }, function(dateilAjaxData) {
                dsDetail = $NC.toArray(dateilAjaxData);
            }, function(dateilAjaxData) {
                $NC.onError(dateilAjaxData);
                serviceCallError = true;
            });
            if (serviceCallError) {
                return;
            }
            if (dsDetail.length == 0) {
                alert($NC.getDisplayMsg("JS.LCC01020E0.020", "등록할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
                return;
            }

            var dsSub = [];
            serviceCallError = false;
            // 데이터 조회 - 구성상품정보
            $NC.serviceCallAndWait("/LCC01020E0/getDataSet.do", {
                P_QUERY_ID: "LCC01020E0.RS_SUB4",
                P_QUERY_PARAMS: {
                    P_CENTER_CD: refRowData.CENTER_CD,
                    P_BU_CD: refRowData.BU_CD,
                    P_ORDER_DATE: refRowData.ORDER_DATE,
                    P_ORDER_NO: $NC.iif(refRowData.INOUT_WORK_DIV == 1, refRowData.ORDER_NO, refRowData.LINK_ORDER_NO),
                    P_LINK_ORDER_NO: $NC.iif(refRowData.INOUT_WORK_DIV == 1, refRowData.LINK_ORDER_NO, refRowData.ORDER_NO)
                }
            }, function(subAjaxData) {
                dsSub = $NC.toArray(subAjaxData);
            }, function(subAjaxData) {
                $NC.onError(subAjaxData);
                serviceCallError = true;
            });
            if (serviceCallError) {
                return;
            }
            if (dsSub.length == 0) {
                alert($NC.getDisplayMsg("JS.LCC01020E0.020", "등록할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
                return;
            }

            var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
            var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
            var BU_CD = $NC.getValue("#edtQBu_Cd");
            var BU_NM = $NC.getValue("#edtQBu_Nm");
            var CUST_CD = $NC.getValue("#edtQCust_Cd");

            $NC.showProgramSubPopup({
                PROGRAM_ID: "LCC01021P0",
                PROGRAM_NM: $NC.getDisplayMsg("JS.LCC01020E0.009", "세트예정 등록"),
                url: "lc/LCC01021P0.html",
                width: 1024,
                height: 600,
                G_PARAMETER: {
                    P_PROCESS_CD: $ND.C_PROCESS_ORDER_UPDATE,
                    P_CENTER_CD: CENTER_CD,
                    P_CENTER_CD_F: CENTER_CD_F,
                    P_BU_CD: BU_CD,
                    P_BU_NM: BU_NM,
                    P_ORDER_DATE: refRowData.ORDER_DATE,
                    P_ORDER_NO: refRowData.ORDER_NO,
                    P_CUST_CD: CUST_CD,
                    P_MASTER_DS: refRowData,
                    P_DETAIL_DS: dsDetail,
                    P_SUB_DS: dsSub,
                    P_PERMISSION: permission
                },
                onOk: function() {
                    onSave();
                }
            });
        });
    }
}

/**
 * 등록 탭의 그리드 행 클릭시 처리
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

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDT1DETAIL);
    G_GRDT1DETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
        P_LINK_BU_CD: rowData.LINK_BU_CD,
        P_LINK_ORDER_DATE: rowData.LINK_ORDER_DATE,
        P_LINK_ORDER_NO: rowData.LINK_ORDER_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LCC01020E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);

    grdT1DetailOnSetColumns(rowData);
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
        name: "기준상품코드"
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
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "SET_ITEM_QTY",
        field: "SET_ITEM_QTY",
        name: "기준수량",
        cssClass: "styRight",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
        name: "예정EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_WEIGHT",
        field: "ORDER_WEIGHT",
        name: "예정중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_CD",
        field: "LINK_ITEM_CD",
        name: "변환상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_BAR_CD",
        field: "LINK_ITEM_BAR_CD",
        name: "변환상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_NM",
        field: "LINK_ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_SPEC",
        field: "LINK_ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_BRAND_NM",
        field: "LINK_BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_STATE_F",
        field: "LINK_ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_LOT",
        field: "LINK_ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_QTY_IN_BOX",
        field: "LINK_QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_IN_UNIT_DIV_F",
        field: "LINK_IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_SET_ITEM_QTY",
        field: "LINK_SET_ITEM_QTY",
        name: "기준수량",
        cssClass: "styRight",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ORDER_QTY",
        field: "LINK_ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ORDER_BOX",
        field: "LINK_ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ORDER_EA",
        field: "LINK_ORDER_EA",
        name: "예정EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ORDER_WEIGHT",
        field: "LINK_ORDER_WEIGHT",
        name: "예정중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_LINE_NO",
        field: "ORDER_LINE_NO",
        name: "예정순번"
    });
    $NC.setGridColumn(columns, {
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_DIV_F",
        field: "ETC_DIV_F",
        name: "사유구분"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_COMMENT",
        field: "ETC_COMMENT",
        name: "사유내역"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailOnSetColumns(rowData) {

    $NC.setGridColumns(G_GRDT1DETAIL, [ // 숨김컬럼 세팅
        rowData.INOUT_WORK_DIV != "1" ? "SET_ITEM_QTY" : "LINK_SET_ITEM_QTY"
    ]);
}

function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "LCC01020E0.RS_T1_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
}

/**
 * 등록 탭의 하단그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ORDER_DATE",
        field: "ORDER_DATE",
        name: "예정일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]",
        groupToggler: true
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_NO",
        field: "ORDER_NO",
        name: "예정번호",
        cssClass: "styCenter",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "ETC_STATE_D",
        field: "ETC_STATE_D",
        name: "진행상태",
        cssClass: "styCenter",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "세트변환구분",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "기준상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "기준상품바코드"
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
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "SET_ITEM_QTY",
        field: "SET_ITEM_QTY",
        name: "기준수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
        name: "예정EA",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_WEIGHT",
        field: "ORDER_WEIGHT",
        name: "예정중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "등록BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "등록EA",
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
        id: "LINK_ITEM_CD",
        field: "LINK_ITEM_CD",
        name: "변환상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_BAR_CD",
        field: "LINK_ITEM_BAR_CD",
        name: "변환상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_NM",
        field: "LINK_ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_SPEC",
        field: "LINK_ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_BRAND_NM",
        field: "LINK_BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_STATE_F",
        field: "LINK_ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_LOT",
        field: "LINK_ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_QTY_IN_BOX",
        field: "LINK_QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_IN_UNIT_DIV_F",
        field: "LINK_IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_SET_ITEM_QTY",
        field: "LINK_SET_ITEM_QTY",
        name: "기준수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ORDER_QTY",
        field: "LINK_ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ORDER_BOX",
        field: "LINK_ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ORDER_EA",
        field: "LINK_ORDER_EA",
        name: "예정EA",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ORDER_WEIGHT",
        field: "LINK_ORDER_WEIGHT",
        name: "예정중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ENTRY_QTY",
        field: "LINK_ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ENTRY_BOX",
        field: "LINK_ENTRY_BOX",
        name: "등록BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ENTRY_EA",
        field: "LINK_ENTRY_EA",
        name: "등록EA",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ENTRY_WEIGHT",
        field: "LINK_ENTRY_WEIGHT",
        name: "등록중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_DIV_F",
        field: "ETC_DIV_F",
        name: "사유구분"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_COMMENT",
        field: "ETC_COMMENT",
        name: "사유내역"
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
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 8,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                // 등록 상태이면서 예정수량과 등록수량이 다른 경우
                if (rowData.ETC_STATE > $ND.C_STATE_ORDER //
                    && (rowData.ORDER_QTY != rowData.ENTRY_QTY || rowData.LINK_ORDER_QTY != rowData.LINK_ENTRY_QTY)) {
                    return "stySpecial";
                }
                // 등록 상태인 경우
                if (rowData.ETC_STATE > $ND.C_STATE_ORDER) {
                    return "styDone";
                }
            }
        },
        summaryRow: {
            visible: true
        }
    };

    // Data Grouping
    var dataGroupOptions = {
        getter: function(rowData) {
            return rowData.ORDER_DATE //
                + "|" + rowData.ORDER_NO //
                + "|" + rowData.ETC_STATE // 
                + "|" + rowData.INOUT_CD;
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LCC01020E0.RS_T2_MASTER",
        sortCol: "ORDER_DATE",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 내역 탭의 그리드 행 클릭시 처리
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
 * 등록 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, [
        "ORDER_DATE",
        "ORDER_NO"
    ])) {
        $NC.clearGridData(G_GRDT1DETAIL);
    }

    setTopButtons();
}

/**
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL, "LINE_NO");
}

/**
 * 내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);

    setTopButtons();
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    // 등록 화면
    $NC.clearGridData(G_GRDT1MASTER, [
        "queryParams"
    ]);
    // 등록 화면
    $NC.clearGridData(G_GRDT1DETAIL);
    // 내역 화면
    $NC.clearGridData(G_GRDT2MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
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
        $NC.setFocus("#dtpQOrder_Date1", true);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setValue("#edtQCust_Cd");
        $NC.setFocus("#edtQBu_Cd", true);
    }

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
 * 상단 공통 버튼 제어
 */
function setTopButtons() {

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    // 등록 탭
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        if ($NC.isNotNull(G_GRDT1MASTER.queryParams)) {
            $NC.G_VAR.buttons._new = "1";
            $NC.G_VAR.buttons._delete = "1";
        }
    }
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function getGridStateFormatter(row, cell, value, columnDef, dataContext) {

    return "<span class='styIcoState" + dataContext.ETC_STATE + "'>&nbsp;</span>";
}

function getEtcState(params, onSuccess) {

    // 데이터 조회
    $NC.serviceCallAndWait("/LCC01020E0/getData.do", {
        P_QUERY_ID: "WF.GET_LC_ETC_STATE",
        P_QUERY_PARAMS: params
    }, onSuccess);
}

function getMoveState(params, onSuccess) {

    $NC.serviceCall("/LCC01020E0/getDataSet.do", {
        P_QUERY_ID: "LCC01020E0.RS_SUB5",
        P_QUERY_PARAMS: params
    }, onSuccess);
}