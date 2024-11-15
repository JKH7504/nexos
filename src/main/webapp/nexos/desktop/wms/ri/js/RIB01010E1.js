/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : RIB01010E1
 *  프로그램명         : 반입예정작업(의류)
 *  프로그램설명       : 반입예정작업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-13
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-16    ASETEC           신규작성
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
            container: "#divMasterView",
            grids: [
                "#grdMaster",
                "#grdDetail"
            ]
        },
        // 체크할 정책 값
        policyVal: {
            RI110: "", // 반입예정생성가능여부
            RI190: "",// 매입금액 계산정책
            RI240: "", // 반품입고시 기준 상품상태
            LS210: "" // 재고관리기준
        },
        // 진행가능/불가 값
        stateFWBW: {
            CONFIRM: "",// 진행가능
            CANCEL: "" // 진행불가
        }
    });

    // 상단그리드 초기화
    grdMasterInitialize();
    // 하단그리드 초기화
    grdDetailInitialize();

    // 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnQRDelivery_Cd").click(showRDeliveryPopup);
    $("#btnOrderClosing").click(btnOrderClosingOnClick);

    $NC.setInitDateRangePicker("#dtpQOrder_Date1", "#dtpQOrder_Date2", null, "W2"); // -15
    $NC.setValue("#rgbQArrival_Yn1", $ND.C_ALL);

    // 조회조건 - 반입구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: $ND.C_INOUT_GRP_E3,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
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
            // 정책코드 취득
            setPolicyValInfo();
            // 진행불가/가능 취득
            setProcessStateInfo();
        }
    });

    // 조회조건 - 연도구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "YEAR_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQYear_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    // 조회조건 - 시즌구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "SEASON_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQSeason_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    // 조회조건 - 상품구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        multiSelect: true
    });

    // 조회조건 - 반품유형 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "RETURN_TYPE",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQReturn_Type",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        addAll: true
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
        addAll: true,
        multiSelect: true
    });

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

    // 화면에 splitter 설정
    $NC.setInitSplitter("#divMasterView", "h", $NC.G_OFFSET.topViewHeight);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.topViewHeight = 350;
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
        case "CENTER_CD":
            setPolicyValInfo();
            setProcessStateInfo();
            break;
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
        case "ORDER_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIB01010E1.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "ORDER_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIB01010E1.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
        case "DELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
        case "RDELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onRDeliveryPopup);
            return;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    if ($NC.isNull(ORDER_DATE1)) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }

    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    if ($NC.isNull(ORDER_DATE2)) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date2");
        return;
    }

    if (ORDER_DATE1 > ORDER_DATE2) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.007", "반입예정일자 범위 입력오류입니다."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    var BU_NO = $NC.getValue("#edtQBu_No");
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    var RETURN_TYPE = $NC.getValue("#cboQReturn_Type");
    var ARRIVAL_YN = $NC.getValueRadioGroup("rgbQArrival_Yn");
    var BOX_SEQ = $NC.getValue("#edtQBox_Seq");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var YEAR_DIV = $NC.getValue("#cboQYear_Div");
    var SEASON_DIV = $NC.getValue("#cboQSeason_Div");
    var ITEM_DIV = $NC.getValue("#cboQItem_Div");

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ORDER_DATE1: ORDER_DATE1,
        P_ORDER_DATE2: ORDER_DATE2,
        P_INOUT_CD: INOUT_CD,
        P_BRAND_CD: BRAND_CD,
        P_BU_NO: BU_NO,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM,
        P_DELIVERY_CD: DELIVERY_CD,
        P_RDELIVERY_CD: RDELIVERY_CD,
        P_RETURN_TYPE: RETURN_TYPE,
        P_ARRIVAL_YN: ARRIVAL_YN,
        P_BOX_SEQ: BOX_SEQ,
        P_ITEM_STATE: ITEM_STATE,
        P_YEAR_DIV: YEAR_DIV,
        P_SEASON_DIV: SEASON_DIV,
        P_ITEM_DIV: ITEM_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/RIB01010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 반입예정생성가능여부가 "Y"일때만 신규등록 가능
    if ($NC.G_VAR.policyVal.RI110 != $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.008", "반입예정정보 신규등록/수정이 불가능한 사업부입니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var ORDER_DATE = $NC.getValue("#dtpQOrder_Date2");

    $NC.showProgramSubPopup({
        PROGRAM_ID: "RIB01011P1",
        PROGRAM_NM: $NC.getDisplayMsg("JS.RIB01010E1.009", "반입예정등록/수정"),
        url: "ri/RIB01011P1.html",
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
            P_POLICY_RI110: $NC.G_VAR.policyVal.RI110,
            P_POLICY_RI190: $NC.G_VAR.policyVal.RI190,
            P_POLICY_RI240: $NC.G_VAR.policyVal.RI240,
            P_POLICY_LS210: $NC.G_VAR.policyVal.LS210,
            P_MASTER_DS: {},
            P_DETAIL_DS: []
        },
        onOk: function() {
            onSave();
        }
    });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "ORDER_DATE",
            "ORDER_NO"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장시 에러 발생 했을 경우 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData, true);
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.010", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.G_VAR.stateFWBW.CANCEL != rowData.INBOUND_STATE) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.011", "삭제가 불가능한 전표입니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.RIB01010E1.012", "예정전표를 삭제하시겠습니까?"))) {
        return;
    }

    // 삭제처리 호출
    $NC.serviceCall("/RIB01010E0/callRIOrderDelete.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_RIC02 - 반입예정의뢰서
        case "PAPER_RIC02":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                valueColumns: function(rowData) {
                    return rowData.ORDER_DATE + ";" + rowData.ORDER_NO;
                },
                compareFn: function(rowData) {
                    return rowData.INBOUND_STATE == $ND.C_STATE_ORDER;
                }
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD
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
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 * @param view
 *        대상 Object
 * @param args
 *        grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

    var grdObject = $NC.getGridObject(args.grid);
    if (!grdObject.isValid) {
        return;
    }

    var columnId = grdObject.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

/**
 * Grid Column 중 진행상태의 Fomatter
 */
function getGridStateFormatter(row, cell, value, columnDef, dataContext) {

    return "<span class='styIcoState" + dataContext.INBOUND_STATE + "'>&nbsp;</span>";
}

/**
 * Grid Column 중 프로세스의 Fomatter
 */
function getGridProcessFormatter(row, cell, value, columnDef, dataContext) {

    switch (dataContext.INBOUND_STATE) {
        case $NC.G_VAR.stateFWBW.CANCEL:
            return "<span class='styIcoNext'>&nbsp;</span>";
        case $NC.G_VAR.stateFWBW.CONFIRM:
            return "<span class='styIcoPrior'>&nbsp;</span>";
        default:
            return "<span class='styIcoStop'>&nbsp;</span>";
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_P",
        field: "INBOUND_STATE",
        name: "P",
        resizable: false,
        formatter: getGridProcessFormatter
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_S",
        field: "INBOUND_STATE",
        name: "S",
        resizable: false,
        formatter: getGridStateFormatter
    });
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
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
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "반입구분"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_STATE_D",
        field: "INBOUND_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
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
        id: "RETURN_TYPE_F",
        field: "RETURN_TYPE_F",
        name: "반품유형"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_SEQ",
        field: "BOX_SEQ",
        name: "반품박스번호"
    });
    $NC.setGridColumn(columns, {
        id: "TOT_ORDER_QTY",
        field: "TOT_ORDER_QTY",
        name: "총예정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
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
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량번호"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "RIB01010E1.RS_MASTER",
        sortCol: "ORDER_DATE",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

function grdMasterOnClick(e, args) {

    var columnId = G_GRDMASTER.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTER, e, args);
            break;
    }
}

/**
 * 상단그리드 행 클릭시 이벤트 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAIL);
    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO
    };
    // 데이터 조회
    $NC.serviceCall("/RIB01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 마스터 그리드 더블 클릭 : 팝업 표시
 */
function grdMasterOnDblClick(e, args) {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(args.row);
    if ($NC.isNull(refRowData)) {
        return;
    }

    // 진행상태 체크 후 처리 가능시 팝업 표시
    getInboundState({
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_INBOUND_DATE: refRowData.ORDER_DATE,
        P_INBOUND_NO: refRowData.ORDER_NO,
        P_LINE_NO: "",
        P_PROCESS_CD: $ND.C_PROCESS_ORDER, // 프로세스코드([A]예정)
        P_STATE_DIV: $ND.C_STATE_MIN
    // 상태구분([1]MIN, [2]MAX)
    }, //
    // ServiceCall SuccessCallback
    function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            alert($NC.getDisplayMsg("JS.RIB01010E1.013", "입고진행상태를 확인하지 못했습니다.\n다시 처리하십시오."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }
        if (refRowData.INBOUND_STATE != resultData.O_INBOUND_STATE) {
            alert($NC.getDisplayMsg("JS.RIB01010E1.014", "[진행상태 : " + resultData.O_INBOUND_STATE + "] 데이터가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.",
                resultData.O_INBOUND_STATE));
            return;
        }

        // 디테일 데이터 재조회 후 처리, 다른 사용자에 의해 변경될 수 있음
        $NC.clearGridData(G_GRDDETAIL);
        G_GRDDETAIL.queryParams = {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_ORDER_DATE: refRowData.ORDER_DATE,
            P_ORDER_NO: refRowData.ORDER_NO
        };
        // 데이터 조회, Synchronize
        var serviceCallError = false;
        $NC.serviceCallAndWait("/RIB01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail, function(subAjaxData) {
            $NC.onError(subAjaxData);
            serviceCallError = true;
        });
        if (serviceCallError) {
            return;
        }

        var dsDetail = G_GRDDETAIL.data.getItems();
        if (dsDetail.length == 0) {
            alert($NC.getDisplayMsg("JS.RIB01010E1.015", "등록/수정할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
            return;
        }

        var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
        var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
        var BU_CD = $NC.getValue("#edtQBu_Cd");
        var BU_NM = $NC.getValue("#edtQBu_Nm");
        var CUST_CD = $NC.getValue("#edtQCust_Cd");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "RIB01011P1",
            PROGRAM_NM: $NC.getDisplayMsg("JS.RIB01010E1.009", "반입예정등록/수정"),
            url: "ri/RIB01011P1.html",
            width: 1024,
            height: 600,
            G_PARAMETER: {
                P_PROCESS_CD: $ND.C_PROCESS_ORDER_UPDATE,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_CUST_CD: CUST_CD,
                P_POLICY_RI110: $NC.G_VAR.policyVal.RI110,
                P_POLICY_RI190: $NC.G_VAR.policyVal.RI190,
                P_POLICY_RI240: $NC.G_VAR.policyVal.RI240,
                P_POLICY_LS210: $NC.G_VAR.policyVal.LS210,
                P_MASTER_DS: refRowData,
                P_DETAIL_DS: dsDetail,
                P_PERMISSION: permission
            },
            onOk: function() {
                onSave();
            }
        });
    });
}

function grdDetailOnGetColumns() {

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
        id: "ORDER_BOX",
        field: "ORDER_BOX",
        name: "예정BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_EA",
        field: "ORDER_EA",
        name: "예정EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_DIV_F",
        field: "RETURN_DIV_F",
        name: "반품사유구분"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_COMMENT",
        field: "RETURN_COMMENT",
        name: "반품사유내역"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_WEIGHT",
        field: "ORDER_WEIGHT",
        name: "예정중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_PRICE",
        field: "DC_PRICE",
        name: "할인단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "APPLY_PRICE",
        field: "APPLY_PRICE",
        name: "적용단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_AMT",
        field: "SUPPLY_AMT",
        name: "공급금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_AMT",
        field: "VAT_AMT",
        name: "부가세액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DC_AMT",
        field: "DC_AMT",
        name: "할인금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_AMT",
        field: "TOTAL_AMT",
        name: "합계금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });
    $NC.setGridColumn(columns, {
        id: "BU_KEY",
        field: "BU_KEY",
        name: "전표키"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDDETAIL, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

/**
 * 하단그리드 초기화
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "RIB01010E1.RS_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

/**
 * 하단그리드 행 클릭시 이벤트 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "ORDER_DATE",
        "ORDER_NO"
    ], true)) {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAIL);
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "1";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "LINE_NO");
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAIL);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
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
    // 실배송처 조회조건 초기화
    $NC.setValue("#edtQRDelivery_Cd");
    $NC.setValue("#edtQRDelivery_Nm");
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
    setPolicyValInfo();
    setProcessStateInfo();
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
 * 검색조건의 배송처 검색 팝업 클릭
 */
function showDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
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
 * 검색조건의 실배송처 검색 팝업 클릭
 */
function showRDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onRDeliveryPopup, function() {
        $NC.setFocus("#edtQRDelivery_Cd", true);
    });
}

function onRDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQRDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQRDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQRDelivery_Cd");
        $NC.setValue("#edtQRDelivery_Nm");
        $NC.setFocus("#edtQRDelivery_Cd", true);
    }
    onChangingCondition();
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    }, function() {
        // 재고관리기준에 따라 유효일자/배치번호별 표시/비표시
        grdDetailOnSetColumns();
    });
}

/**
 * 진행불가/가능 정보 취득
 */
function setProcessStateInfo() {

    $NC.G_VAR.stateFWBW.CONFIRM = "";
    $NC.G_VAR.stateFWBW.CANCEL = "";

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");

    // 데이터 조회
    $NC.serviceCall("/RIB01010E0/getData.do", {
        P_QUERY_ID: "WF.GET_PROCESS_STATE_FWBW",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_PROCESS_GRP: $ND.C_PROCESS_GRP_RTN_IN,
            P_PROCESS_CD: $ND.C_PROCESS_ORDER
        }
    }, onGetProcessState);
}

/**
 * 진행불가/가능 정보 취득 후 처리
 * 
 * @param ajaxData
 */
function onGetProcessState(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg == $ND.C_OK) {
        $NC.G_VAR.stateFWBW.CONFIRM = $NC.nullToDefault(resultData.O_STATE_CONFIRM, "");
        $NC.G_VAR.stateFWBW.CANCEL = $NC.nullToDefault(resultData.O_STATE_CANCEL, "");
    }
}

/**
 * 입고상태 조회
 * 
 * @param params
 * @param onSuccess
 */
function getInboundState(params, onSuccess) {

    // 데이터 조회
    $NC.serviceCall("/RIB01010E0/getData.do", {
        P_QUERY_ID: "WF.GET_RI_INBOUND_STATE",
        P_QUERY_PARAMS: params
    }, onSuccess);
}

/**
 * 종결처리 Button Event
 */
function btnOrderClosingOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.RIB01010E1.016", "종결처리할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.RIB01010E1.017", "종결처리 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 종결처리 호출
    $NC.serviceCall("/RIB01010E0/callRIOrderClosing.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnableButton("#divMasterView", permission.canSave && enable);
}
