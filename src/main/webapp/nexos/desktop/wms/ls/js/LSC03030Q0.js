/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC03030Q0
 *  프로그램명         : 재고분석현황
 *  프로그램설명       : 재고분석현황 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-13
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-10-13    ASETEC           신규작성
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
            var resizeView = {
                container: "#divMasterView"
            };
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = "#grdT1Master";
            } else {
                resizeView.grids = "#grdT2Master";
            }
            return resizeView;
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $NC.setInitDatePicker("#dtpQInout_Date");

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQDept_Cd").click(showDeptPopup);

    // 대분류 combo 설정
    setDepartCombo();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CSUSERCENTER",
                P_QUERY_ID: "WC.POP_CSUSERCENTER",
                P_QUERY_PARAMS: {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_CENTER_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_STATE",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_STATE",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CLASS_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CLASS_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_VALID_RANK",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "VALID_RANK",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 - 물류센터 세팅
        $NC.setInitComboData({
            selector: "#cboQCenter_Cd",
            codeField: "CENTER_CD",
            nameField: "CENTER_NM",
            data: $NC.toArray(multipleData.O_WC_POP_CSUSERCENTER),
            onComplete: function() {
                $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
            }
        });
        // 조회조건 - 상품상태 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_State",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQItem_State", 0);
            }
        });
        // 조회조건 - 분류구분 세팅
        $NC.setInitComboData({
            selector: "#cboQClass_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CLASS_DIV),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQClass_Div", 0);
            }
        });
        // 조회조건 - 임박구분 세팅
        $NC.setInitComboData({
            selector: "#cboQValid_Rank",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_VALID_RANK),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQValid_Rank", 0);
            }
        });
    });

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
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
        case "DEPT_CD":
            $NP.onDeptChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DEPT_CD: val
            }, onDeptPopup);
            return;
        case "INOUT_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC03030Q0.001", "기준일자를 정확히 입력하십시오."));
            break;
        case "DEPART_CD":
            setLineCombo();
            break;
        case "LINE_CD":
            setClassCombo();
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
        alert($NC.getDisplayMsg("JS.LSC03030Q0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC03030Q0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    var ITEM_STATE = $NC.getValue("#cboQItem_State");

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");

    var BASE_DATE = $NC.getValue("#dtpQInout_Date");
    if ($NC.isNull(BASE_DATE)) {
        alert($NC.getDisplayMsg("JS.LSC03030Q0.004", "기준일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date");
        return;
    }

    var DEPT_CD = $NC.getValue("#edtQDept_Cd", true);
    var CLASS_DIV = $NC.getValue("#cboQClass_Div", true);
    var DEPART_CD = $NC.getValue("#cboQDepart_Cd", true);
    var LINE_CD = $NC.getValue("#cboQLine_Cd", true);
    var CLASS_CD = $NC.getValue("#cboQClass_Cd", true);
    var VALID_RANK = $NC.getValue("#cboQValid_Rank", true);

    switch (tabActiveIndex) {
        case 0:
            $NC.setInitGridVar(G_GRDT1MASTER);
            // 파라메터 세팅
            G_GRDT1MASTER.queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_BASE_DATE: BASE_DATE,
                P_ITEM_CD: ITEM_CD,
                P_ITEM_NM: ITEM_NM,
                P_ITEM_STATE: ITEM_STATE,
                P_DEPT_CD: DEPT_CD,
                P_CLASS_DIV: CLASS_DIV,
                P_DEPART_CD: DEPART_CD,
                P_LINE_CD: LINE_CD,
                P_CLASS_CD: CLASS_CD,
                P_VALID_RANK: VALID_RANK
            };

            // 데이터 조회
            $NC.serviceCall("/LSC03030Q0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
            break;
        case 1:
            $NC.setInitGridVar(G_GRDT2MASTER);
            // 파라메터 세팅
            G_GRDT2MASTER.queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_BASE_DATE: BASE_DATE,
                P_ITEM_CD: ITEM_CD,
                P_ITEM_NM: ITEM_NM,
                P_DEPT_CD: DEPT_CD,
                P_CLASS_DIV: CLASS_DIV,
                P_DEPART_CD: DEPART_CD,
                P_LINE_CD: LINE_CD,
                P_CLASS_CD: CLASS_CD
            };

            // 데이터 조회
            $NC.serviceCall("/LSC03030Q0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
            break;
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

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    switch (tabActiveIndex) {
        case 0:
            $("#divQConditionItemState").show();
            $("#divQConditionValidRank").show();
            break;
        case 1:
            $("#divQConditionItemState").hide();
            $("#divQConditionValidRank").hide();
            break;

    }

    $NC.onGlobalResize();

}

function grdT1MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "VALID_RANK",
        field: "VALID_RANK",
        name: "임박구분",
        cssClass: "styCenter"
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
        id: "DEPT_NM",
        field: "DEPT_NM",
        name: "부서명"
    });
    $NC.setGridColumn(columns, {
        id: "DEPART_NM",
        field: "DEPART_NM",
        name: "대분류"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NM",
        field: "LINE_NM",
        name: "중분류"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_NM",
        field: "CLASS_NM",
        name: "소분류"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_DIV_F",
        field: "CLASS_DIV_F",
        name: "분류구분"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상품상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 유효기간임박 상품분석
 */
function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 5,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.VALID_RANK == 0) {// 1/2 이상 남은 재고, 유통기한 적용단위값이 존재하지 않는 재고
                    return;
                } else if (rowData.VALID_RANK == 2) {// 1/3 ~ 1/2 재고
                    return "styHalf ";
                } else if (rowData.VALID_RANK == 3) {// 1/4 ~ 1/3 재고
                    return "styThird";
                } else if (rowData.VALID_RANK == 4) {// 1/4 이하 재고
                    return "styQuarter";
                } else if (rowData.VALID_RANK == 1) {// 유통기한 적용 값이 존재하지만 유통기한이 null 인 재고
                    return "styNull";
                }
                return "styOver"; // 유통기한 초과 재고
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LSC03030Q0.RS_T1_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT2MasterOnGetColumns() {

    var columns = [ ];
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
        id: "DEPT_NM",
        field: "DEPT_NM",
        name: "부서명"
    });
    $NC.setGridColumn(columns, {
        id: "DEPART_NM",
        field: "DEPART_NM",
        name: "대분류"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NM",
        field: "LINE_NM",
        name: "중분류"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_NM",
        field: "CLASS_NM",
        name: "소분류"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_DIV_D",
        field: "ITEM_DIV_D",
        name: "상품구분"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_DIV_F",
        field: "CLASS_DIV_F",
        name: "분류구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상품상태",
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
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")

    });
    $NC.setGridColumn(columns, {
        id: "LAST_WEEKS",
        field: "LAST_WEEKS",
        name: "최근 2주",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_MONTH",
        field: "LAST_MONTH",
        name: "전월",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_YEAR_MONTH",
        field: "LAST_YEAR_MONTH",
        name: "전년동월",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_YEAR_RATE",
        field: "LAST_YEAR_RATE",
        name: "누계증감",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SALE_DAY",
        field: "SALE_DAY",
        name: "일평균",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ROTATION_DAY",
        field: "ROTATION_DAY",
        name: "재고회전일",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 평균재고회전율
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LSC03030Q0.RS_T2_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

/**
 * 유통기한임박
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER);
}

/**
 * 평균재고회전율
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
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

    // 브랜드 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();

    // 상품그룹 콤보 재설정
    setDepartCombo();
}

/**
 * 부서 검색 이미지 클릭
 * 
 * @param resultInfo
 */

function showDeptPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

    $NP.showDeptPopup({
        P_CUST_CD: CUST_CD,
        P_DEPT_CD: $ND.C_ALL
    }, onDeptPopup, function() {
        $NC.setFocus("#edtQDept_Cd", true);
    });
}

/**
 * 부서 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onDeptPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQDept_Cd", resultInfo.DEPT_CD);
        $NC.setValue("#edtQDept_Nm", resultInfo.DEPT_NM);
    } else {
        $NC.setValue("#edtQDept_Cd");
        $NC.setValue("#edtQDept_Nm");
        $NC.setFocus("#edtQDept_Cd", true);
    }

    onChangingCondition();
}

/**
 * 대분류 combobox 설정
 */
function setDepartCombo() {

    $NC.clearComboData("#cboQDepart_Cd"); // 대분류 초기화

    // 대분류 콤보
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_ITEMGROUP_DEPART",
        P_QUERY_PARAMS: {
            P_CUST_CD: $NC.getValue("#edtQCust_Cd")
        }
    }, {
        selector: "#cboQDepart_Cd",
        codeField: "DEPART_CD",
        fullNameField: "DEPART_CD_F",
        addEmpty: true,
        onComplete: function() {
            $NC.setValue("#cboQDepart_Cd");
        }
    });
    $NC.clearComboData("#cboQLine_Cd"); // 중분류 초기화
    $NC.clearComboData("#cboQClass_Cd"); // 소분류 초기화
}

/**
 * 중분류 combobox 설정
 */
function setLineCombo() {

    $NC.clearComboData("#cboQLine_Cd"); // 중분류 초기화
    $NC.clearComboData("#cboQClass_Cd"); // 소분류 초기화

    var DEPART_CD = $NC.getValue("#cboQDepart_Cd");
    if ($NC.isNull(DEPART_CD)) {
        return;
    }

    // 중분류 콤보
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_ITEMGROUP_LINE",
        P_QUERY_PARAMS: {
            P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
            P_DEPART_CD: DEPART_CD
        }
    }, {
        selector: "#cboQLine_Cd",
        codeField: "LINE_CD",
        fullNameField: "LINE_CD_F",
        addEmpty: true,
        onComplete: function() {
            $NC.setValue("#cboQLine_Cd");
        }
    });
}

/**
 * 소분류 combobox 설정
 */
function setClassCombo() {

    $NC.clearComboData("#cboQClass_Cd"); // 소분류 초기화

    var DEPART_CD = $NC.getValue("#cboQDepart_Cd");
    var LINE_CD = $NC.getValue("#cboQLine_Cd");
    if ($NC.isNull(DEPART_CD) || $NC.isNull(LINE_CD)) {
        return;
    }

    // 소분류 콤보
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_ITEMGROUP_CLASS",
        P_QUERY_PARAMS: {
            P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
            P_DEPART_CD: DEPART_CD,
            P_LINE_CD: LINE_CD
        }
    }, {
        selector: "#cboQClass_Cd",
        codeField: "CLASS_CD",
        fullNameField: "CLASS_CD_F",
        addEmpty: true,
        onComplete: function() {
            $NC.setValue("#cboQClass_Cd");
        }
    });
}
