/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC02020E1
 *  프로그램명         : 상품변환관리 (의류)
 *  프로그램설명       : 상품변환관리 (의류) 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-08-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-07    ASETEC           신규작성
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
        },
        // 체크할 정책 값
        policyVal: {
            LS210: "" // 재고 관리 기준
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

    $NC.setInitDateRangePicker("#dtpQEtc_Date1", "#dtpQEtc_Date2");

    // 확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
    setUserProgramPermission();

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
            setPolicyValInfo();
        }
    });
    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo({
        P_BU_CD: $NC.G_USERINFO.BU_CD
    });

    // 취소/처리 버튼 툴팁 세팅
    $NC.setTooltip("#btnProcessPre", $NC.getDisplayMsg("JS.COMMON.039", "확정 취소"));
    $NC.setTooltip("#btnProcessNxt", $NC.getDisplayMsg("JS.COMMON.040", "확정 처리"));
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
        case "BRAND_CD":
            var BU_CD = $NC.getValue("#edtQBu_Cd");
            if ($NC.isNull(BU_CD)) {
                alert($NC.getDisplayMsg("JS.LCC02020E1.021", "사업부를 먼저 선택 하십시오."));
                $NC.setValue("#edtQBrand_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onBuBrandChange(val, {
                P_BU_CD: BU_CD,
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "ETC_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC02020E1.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "ETC_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC02020E1.002", "검색 종료일자를 정확히 입력하십시오."));
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
        alert($NC.getDisplayMsg("JS.LCC02020E1.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var ETC_DATE1 = $NC.getValue("#dtpQEtc_Date1");
    if ($NC.isNull(ETC_DATE1)) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQEtc_Date1");
        return;
    }
    var ETC_DATE2 = $NC.getValue("#dtpQEtc_Date2");
    if ($NC.isNull(ETC_DATE2)) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQEtc_Date2");
        return;
    }
    if (ETC_DATE1 > ETC_DATE2) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.007", "입출고일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQEtc_Date1");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");

    // 등록 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ETC_DATE1: ETC_DATE1,
            P_ETC_DATE2: ETC_DATE2,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        };
        // 데이터 조회
        $NC.serviceCall("/LCC02020E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    }
    // 내역 조회
    else {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ETC_DATE1: ETC_DATE1,
            P_ETC_DATE2: ETC_DATE2,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        };
        // 데이터 조회
        $NC.serviceCall("/LCC02020E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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
        var ETC_DATE = $NC.getValue("#dtpQEtc_Date2");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "LCC02021P1",
            PROGRAM_NM: $NC.getDisplayMsg("JS.LCC02020E1.008", "상품변환 등록"),
            url: "lc/LCC02021P1.html",
            width: 1024,
            height: 600,
            G_PARAMETER: {
                P_PROCESS_CD: $ND.C_PROCESS_ENTRY_CREATE,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_ETC_DATE: ETC_DATE,
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_MASTER_DS: {},
                P_DETAIL_DS: [],
                P_SUB_DS: []
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

    // 등록 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.LCC02020E1.009", "삭제할 데이터가 없습니다."));
            return;
        }

        var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
        if (rowData.CONFIRM_YN == $ND.C_YES) {
            alert($NC.getDisplayMsg("JS.LCC02020E1.010", "이미 확정한 데이터는 삭제할수 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.LCC02020E1.011", "삭제 하시겠습니까?"))) {
            return;
        }

        $NC.serviceCall("/LCC02020E0/callLCProcessing.do", {
            P_PROCESS_DIV: "DEL",
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_ETC_DATE: rowData.ETC_DATE,
            P_ETC_NO: rowData.ETC_NO,
            P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
            P_LINK_BU_CD: rowData.LINK_BU_CD,
            P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
            P_LINK_ETC_NO: rowData.LINK_ETC_NO,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onExecSP);
    }
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

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if ($NC.isNull(rowData)) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.012", "출력할 데이터를 먼저 선택하십시오."));
        return;
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LCC03 - 상품변환지시서
        case "PAPER_LCC03":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_ETC_DATE: rowData.ETC_DATE,
                P_ETC_NO: rowData.ETC_NO,
                P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
                P_LINK_BU_CD: rowData.LINK_BU_CD,
                P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
                P_LINK_ETC_NO: rowData.LINK_ETC_NO
            };
            break;
        // LABEL_CMC03 - 파렛트ID라벨(단일상품)
        case "LABEL_CMC03":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: rowData.LINK_CENTER_CD,
                P_BU_CD: rowData.LINK_BU_CD,
                P_INBOUND_DATE: rowData.LINK_ETC_DATE,
                P_INBOUND_NO: rowData.LINK_ETC_NO,
                P_LINE_NO: "",
                P_PROCESS_GRP: "LC"
            };
            break;
        // LABEL_CMC04 - 파렛트ID라벨(멀티상품)
        case "LABEL_CMC04":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: rowData.LINK_CENTER_CD,
                P_BU_CD: rowData.LINK_BU_CD,
                P_INBOUND_DATE: rowData.LINK_ETC_DATE,
                P_INBOUND_NO: rowData.LINK_ETC_NO,
                P_PROCESS_GRP: "LC"
            };
            break;
        // 미정의된 레포트
        default:
            alert($NC.getDisplayMsg("JS.COMMON.036", "[" + reportInfo.REPORT_NM + "]구현되지 않은 레포트 정보입니다. 출력할 수 없습니다.", reportInfo.REPORT_NM));
            return;
    }

    if ($NC.isNotEmpty(checkedData)) {
        // 선택 건수 체크
        if (checkedData.checkedCount == 0) {
            alert($NC.getDisplayMsg("JS.COMMON.037", "[" + reportInfo.REPORT_NM + "]출력할 데이터를 선택하십시오.", reportInfo.REPORT_NM));
            return;
        }
        // 선택 건수 중 출력 대상 건수
        if (checkedData.values.length == 0) {
            alert($NC.getDisplayMsg("JS.COMMON.038", "[" + reportInfo.REPORT_NM + "]출력 가능한 데이터를 선택하십시오.", reportInfo.REPORT_NM));
            return;
        }
    }

    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: reportInfo.REPORT_DOC_URL,
        reportTitle: reportInfo.REPORT_TITLE_NM,
        queryId: reportInfo.REPORT_QUERY_ID,
        queryParams: queryParams,
        internalQueryYn: reportInfo.INTERNAL_QUERY_YN,
        checkedValue: $NC.toJoin(checkedData.values)
    };

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "ETC_DATE",
            "ETC_NO"
        ]
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
}

function onExecSP(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "ETC_DATE",
            "ETC_NO"
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
            $NC.setInitSplitter("#divT1TabSheetView", "h");
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
        id: "ETC_DATE",
        field: "ETC_DATE",
        name: "상품변환일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_NO",
        field: "ETC_NO",
        name: "상품변환번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "상품변환구분"
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
        id: "LINK_ETC_NO",
        field: "LINK_ETC_NO",
        name: "상대입출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_USER_ID",
        field: "ENTRY_USER_ID",
        name: "최종등록자"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_DATETIME",
        field: "ENTRY_DATETIME",
        name: "최종등록일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_YN",
        field: "CONFIRM_YN",
        name: "확정여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_USER_ID",
        field: "CONFIRM_USER_ID",
        name: "확정자"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_DATETIME",
        field: "CONFIRM_DATETIME",
        name: "확정일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 2,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.CONFIRM_YN == $ND.C_NO) {
                    return;
                }
                if (rowData.SEND_STATE >= "10") {
                    return "stySendDone";
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LCC02020E1.RS_T1_MASTER",
        sortCol: "ETC_DATE",
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

    // 확정처리된 전표는 수정불가함.
    if (refRowData.CONFIRM_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.013", "확정 된 전표입니다."));
        return;
    }

    // 조회후 상태가 바뀌었는지 한번더 상태 체크
    $NC.serviceCall("/LCC02020E0/getConfirmYn.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_ETC_DATE: refRowData.ETC_DATE,
        P_ETC_NO: refRowData.ETC_NO,
        P_TABLE_DIV: "A" // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    }, //
    // ServiceCall SuccessCallback
    function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            alert($NC.getDisplayMsg("JS.LCC02020E1.014", "확정여부를 확인하지 못했습니다.\n다시 처리하십시오."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }
        if (resultData.O_CONFIRM_YN != $ND.C_NO) {
            alert($NC.getDisplayMsg("JS.LCC02020E1.015", "이미 확정처리된 데이터입니다.\n다시 조회 후 데이터를 확인하십시오."));
            return;
        }

        var dsSub = [];
        var serviceCallError = false;
        // 데이터 조회 - 하단그리드
        $NC.serviceCallAndWait("/LCC02020E0/getDataSet.do", {
            P_QUERY_ID: "LCC02020E1.RS_SUB2",
            P_QUERY_PARAMS: {
                P_CENTER_CD: refRowData.CENTER_CD,
                P_BU_CD: refRowData.BU_CD,
                P_ETC_DATE: refRowData.ETC_DATE,
                P_ETC_NO: refRowData.ETC_NO
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
            alert($NC.getDisplayMsg("JS.LCC02020E1.016", "수정할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
            return;
        }

        var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
        var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
        var BU_CD = $NC.getValue("#edtQBu_Cd");
        var BU_NM = $NC.getValue("#edtQBu_Nm");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "LCC02021P1",
            PROGRAM_NM: $NC.getDisplayMsg("JS.LCC02020E1.008", "상품변환 등록"),
            url: "lc/LCC02021P1.html",
            width: 1024,
            height: 600,
            G_PARAMETER: {
                P_PROCESS_CD: $ND.C_PROCESS_ENTRY_UPDATE,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_MASTER_DS: refRowData,
                P_SUB_DS: dsSub,
                P_PERMISSION: permission
            },
            onOk: function() {
                onSave();
            }
        });
    });
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
        P_ETC_DATE: rowData.ETC_DATE,
        P_ETC_NO: rowData.ETC_NO,
        P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
        P_LINK_BU_CD: rowData.LINK_BU_CD,
        P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
        P_LINK_ETC_NO: rowData.LINK_ETC_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LCC02020E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

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
        name: "기준상품코드"
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
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
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
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_WEIGHT",
        field: "CONFIRM_WEIGHT",
        name: "확정중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_CD",
        field: "LINK_ITEM_CD",
        name: "변환상품코드"
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
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumn(columns, {
        id: "LINK_VALID_DATE",
        field: "LINK_VALID_DATE",
        name: "변환사용기한",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_BATCH_NO",
        field: "LINK_BATCH_NO",
        name: "변환제조배치",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_QTY_IN_BOX",
        field: "LINK_QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_CONFIRM_BOX",
        field: "LINK_CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_CONFIRM_EA",
        field: "LINK_CONFIRM_EA",
        name: "확정EA",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_CONFIRM_WEIGHT",
        field: "LINK_CONFIRM_WEIGHT",
        name: "확정중량",
        cssClass: "styRight"
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

function grdT1DetailOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDT1DETAIL, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "LINK_VALID_DATE,LINK_BATCH_NO" : ""
    ]);
}

function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "LCC02020E1.RS_T1_DETAIL",
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
        id: "ETC_DATE",
        field: "ETC_DATE",
        name: "상품변환일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_NO",
        field: "ETC_NO",
        name: "상품변환번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "상품변환구분"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ETC_NO",
        field: "LINK_ETC_NO",
        name: "상대입출고번호",
        cssClass: "styCenter"
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
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "확정EA",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_WEIGHT",
        field: "CONFIRM_WEIGHT",
        name: "확정중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_CD",
        field: "LINK_ITEM_CD",
        name: "변환상품코드"
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
        id: "LINK_ITEM_LOT",
        field: "LINK_ITEM_LOT",
        name: "LOT번호"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumn(columns, {
        id: "LINK_VALID_DATE",
        field: "LINK_VALID_DATE",
        name: "변환사용기한",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_BATCH_NO",
        field: "LINK_BATCH_NO",
        name: "변환제조배치",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_QTY_IN_BOX",
        field: "LINK_QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_CONFIRM_QTY",
        field: "LINK_CONFIRM_QTY",
        name: "확정수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_CONFIRM_BOX",
        field: "LINK_CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_CONFIRM_EA",
        field: "LINK_CONFIRM_EA",
        name: "확정EA",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_CONFIRM_WEIGHT",
        field: "LINK_CONFIRM_WEIGHT",
        name: "확정중량",
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDT2MASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "LINK_VALID_DATE,LINK_BATCH_NO" : ""
    ]);
}

/**
 * 내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 8,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LCC02020E1.RS_T2_MASTER",
        sortCol: "ETC_DATE",
        gridOptions: options
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
        "ETC_DATE",
        "ETC_NO"
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
        $NC.setFocus("#dtpQEtc_Date1", true);
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
    setPolicyValInfo();
    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo({
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    });
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
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    // 확정
    if (permission.canConfirm) {
        $("#btnProcessNxt").click(onProcessNxt);
    }
    $NC.setEnable("#btnProcessNxt", permission.canConfirm);

    // 취소
    if (permission.canConfirmCancel) {
        $("#btnProcessPre").click(onProcessPre);
    }
    $NC.setEnable("#btnProcessPre", permission.canConfirmCancel);
}

/**
 * 취소처리
 */
function onProcessPre() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.017", "조회 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.CONFIRM_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.018", "확정된 전표만 취소 할 수 있습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC02020E1.019", "취소 처리 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC02020E0/callLCProcessing.do", {
        P_PROCESS_DIV: $ND.C_DIRECTION_BW,
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ETC_DATE: rowData.ETC_DATE,
        P_ETC_NO: rowData.ETC_NO,
        P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
        P_LINK_BU_CD: rowData.LINK_BU_CD,
        P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
        P_LINK_ETC_NO: rowData.LINK_ETC_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
}

/**
 * 확정처리
 */
function onProcessNxt() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.017", "조회 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.CONFIRM_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC02020E1.013", "확정 된 전표입니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC02020E1.020", "확정 처리 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC02020E0/callLCProcessing.do", {
        P_PROCESS_DIV: $ND.C_DIRECTION_FW,
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ETC_DATE: rowData.ETC_DATE,
        P_ETC_NO: rowData.ETC_NO,
        P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
        P_LINK_BU_CD: rowData.LINK_BU_CD,
        P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
        P_LINK_ETC_NO: rowData.LINK_ETC_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
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
            if (G_GRDT1MASTER.data.getLength() > 0) {
                $NC.G_VAR.buttons._print = "1";
            }
        }
    }
    $NC.setInitTopButtons($NC.G_VAR.buttons);
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
        grdT1DetailOnSetColumns();
        grdT2MasterOnSetColumns();
    });
}
