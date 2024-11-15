/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC04010E0
 *  프로그램명         : 재고실사관리
 *  프로그램설명       : 재고실사관리 화면 Javascript
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
            var resizeView = {
                container: "#divMasterView"
            };
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = [
                    "#grdT1Master",
                    "#grdT1Detail"
                ];
            } else if ($NC.getTabActiveIndex("#divMasterView") == 1) {
                resizeView.grids = "#grdT2Master";
            } else if ($NC.getTabActiveIndex("#divMasterView") == 2) {
                resizeView.grids = "#grdT3Master";
            }
            return resizeView;
        },
        // 체크할 정책 값
        policyVal: {
            LC110: "", // 재고실사수량정책
            LC130: "", // 재고실사 재고반영 버튼 추가 정책
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
    grdT3MasterInitialize();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    $NC.setInitDateRangePicker("#dtpQInvest_Date1", "#dtpQInvest_Date2");

    // 재고반영버튼 숨기기
    $NC.setEnable("#btnApplyResult", false);
    $NC.setVisible("#btnApplyResult", false);

    // 수불발생여부 콤보박스 세팅
    $NC.setInitComboData({
        selector: "#cboQView_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        data: [
            {
                COMMON_CD: "0",
                COMMON_NM: $NC.getDisplayMsg("JS.LCC04010E0.038", "전체")
            },
            {
                COMMON_CD: "1",
                COMMON_NM: $NC.getDisplayMsg("JS.LCC04010E0.039", "차이분")
            }
        ],
        onComplete: function() {
            $NC.setValue("#cboQView_Div", 1);
        }
    });
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
                P_RESULT_ID: "O_WC_POP_CMCODE_GAP_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "GAP_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 - 물류센터 초기화
        $NC.setInitComboData({
            selector: "#cboQCenter_Cd",
            codeField: "CENTER_CD",
            nameField: "CENTER_NM",
            data: $NC.toArray(multipleData.O_WC_POP_CSUSERCENTER),
            onComplete: function() {
                $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
                setPolicyValInfo();
            }
        });
        // 조회조건 - 실사차이구분 세팅
        $NC.setInitComboData({
            selector: "#cboQGap_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_GAP_DIV),
            addAll: true
        });
    });

    setUserProgramPermission();
    // 프로그램 레포트 정보 세팅
    setReportInfo();

    // 취소/처리 버튼 툴팁 세팅
    $NC.setTooltip("#btnProcessPre", $NC.getDisplayMsg("JS.COMMON.039", "확정 취소"));
    $NC.setTooltip("#btnProcessNxt", $NC.getDisplayMsg("JS.COMMON.040", "확정 처리"));
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

    $("#divQView_Div").hide();
    $("#divQGap_Div").hide();
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
                alert($NC.getDisplayMsg("JS.LCC04010E0.025", "사업부를 먼저 선택 하십시오."));
                $NC.setValue("#edtQBrand_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onBuBrandChange(val, {
                P_BU_CD: BU_CD,
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "INVEST_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC04010E0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INVEST_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC04010E0.002", "검색 종료일자를 정확히 입력하십시오."));
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
        alert($NC.getDisplayMsg("JS.LCC04010E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INVEST_DATE1 = $NC.getValue("#dtpQInvest_Date1");
    if ($NC.isNull(INVEST_DATE1)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInvest_Date1");
        return;
    }
    var INVEST_DATE2 = $NC.getValue("#dtpQInvest_Date2");
    if ($NC.isNull(INVEST_DATE2)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInvest_Date2");
        return;
    }
    if (INVEST_DATE1 > INVEST_DATE2) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.007", "실사일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQInvest_Date1");
        return;
    }

    var VIEW_DIV = $NC.getValue("#cboQView_Div");
    if ($NC.isNull(VIEW_DIV)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.008", "차이분여부를 선택하십시오."));
        $NC.setFocus("#cboQView_Div");
        return;
    }

    var GAP_DIV = $NC.getValue("#cboQGap_Div");
    if ($NC.isNull(GAP_DIV)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.009", "실사차이사유구분을 선택 입력하십시오."));
        $NC.setFocus("#cboQGap_Div");
        return;
    }
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    // 재고실사등록 화면
    if (tabActiveIndex == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INVEST_DATE1: INVEST_DATE1,
            P_INVEST_DATE2: INVEST_DATE2
        };
        $NC.serviceCall("/LCC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    }
    // 사유관리내역
    else if (tabActiveIndex == 1) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_BRAND_CD: BRAND_CD,
            P_INVEST_DATE1: INVEST_DATE1,
            P_INVEST_DATE2: INVEST_DATE2,
            P_GAP_DIV: GAP_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/LCC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }
    // 재고실사내역
    else {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT3MASTER);

        G_GRDT3MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_BRAND_CD: BRAND_CD,
            P_INVEST_DATE1: INVEST_DATE1,
            P_INVEST_DATE2: INVEST_DATE2,
            P_VIEW_DIV: VIEW_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/LCC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
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
        var INVEST_DATE = $NC.getValue("#dtpQInvest_Date2");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "LCC04011P0",
            PROGRAM_NM: $NC.getDisplayMsg("JS.LCC04010E0.010", "재고실사등록/수정"),
            url: "lc/LCC04011P0.html",
            width: 1024,
            height: 610,
            G_PARAMETER: {
                P_PROCESS_CD: $ND.C_PROCESS_ENTRY_CREATE,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_INVEST_DATE: INVEST_DATE,
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_POLICY_LC110: $NC.G_VAR.policyVal.LC110,
                P_POLICY_LS210: $NC.G_VAR.policyVal.LS210,
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

    if ($NC.getTabActiveIndex("#divMasterView") != 0) {
        return;
    }

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.011", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        return;
    }
    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
        return;
    }

    var dsMaster = [];
    var dsDetail = [];
    var rIndex, rCount;
    var rowData;
    for (rIndex = 0, rCount = G_GRDT1MASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1MASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INVEST_DATE: rowData.INVEST_DATE,
            P_INVEST_NO: rowData.INVEST_NO,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    for (rIndex = 0, rCount = G_GRDT1DETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1DETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }

        dsDetail.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INVEST_DATE: rowData.INVEST_DATE,
            P_INVEST_NO: rowData.INVEST_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_LOCATION_CD: rowData.LOCATION_CD,
            P_INVEST_QTY: rowData.INVEST_QTY,
            P_GAP_DIV: rowData.GAP_DIV,
            P_GAP_COMMENT: rowData.GAP_COMMENT,
            P_INSPECT_YN: rowData.GAP_QTY == 0 ? $ND.C_NO : $ND.C_YES,
            P_CRUD: rowData.CRUD
        });
    }

    var refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (dsDetail.length > 0 && refRowData.REFLECT_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.012", "이미 재고에 반영된 데이터에 대하여 수정할 수 없습니다."));
        return;
    }
    if (dsDetail.length > 0 && refRowData.CONFIRM_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.013", "이미 확정된 데이터에 대하여 수정할 수 없습니다."));
        return;
    }

    if (dsMaster.length == 0 && dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.014", "수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LCC04010E0/saveEntry.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    // 재고실사 등록 화면
    if ($NC.getTabActiveIndex("#divMasterView") != 0) {
        return;
    }

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.015", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.REFLECT_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.016", "이미 재고에 반영된 데이터에 대하여 삭제할 수 없습니다."));
        return;
    }
    if (rowData.CONFIRM_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.017", "이미 확정된 데이터 입니다. \n취소처리 후 삭제 하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC04010E0.018", "삭제 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [
        {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INVEST_DATE: rowData.INVEST_DATE,
            P_INVEST_NO: rowData.INVEST_NO,
            P_CRUD: $ND.C_DV_CRUD_D
        }
    ];

    $NC.serviceCall("/LCC04010E0/delete.do", {
        P_DS_MASTER: dsMaster
    }, onExecSP);
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "INVEST_DATE",
            "INVEST_NO"
        ]
    });

    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "LINE_NO"
    });

    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyValM;
    G_GRDT1DETAIL.lastKeyVal = lastKeyValD;
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

    var rowData;
    switch (reportInfo.REPORT_CD) {
        case "PAPER_LCC07": // PAPER_LCC07 - 재고실사표
        case "PAPER_LCC08": // PAPER_LCC08 - 재고실사표(재고포함)
        case "PAPER_LCC09": // PAPER_LCC09 - 재고실사내역
        case "PAPER_LCC10": // PAPER_LCC10 - 재고실사차이내역
            // case "PAPER_LCC11": // PAPER_LCC11 - 재고실사표(제조번호/사용기한)
            // case "PAPER_LCC12": // PAPER_LCC12 - 재고실사내역(제조번호/사용기한)
            // case "PAPER_LCC14": // PAPER_LCC14 - 재고실사표(제조번호/사용기한)
            if (G_GRDT1MASTER.data.getLength() == 0 || G_GRDT1MASTER.lastRow == null) {
                alert($NC.getDisplayMsg("JS.COMMON.037", "[" + reportInfo.REPORT_NM + "]출력할 데이터를 선택하십시오.", reportInfo.REPORT_NM));
                return;
            }
            rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
            break;
        // 미정의된 레포트
        default:
            alert($NC.getDisplayMsg("JS.COMMON.036", "[" + reportInfo.REPORT_NM + "]구현되지 않은 레포트 정보입니다. 출력할 수 없습니다.", reportInfo.REPORT_NM));
            return;
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LCC07 - 재고실사표
        case "PAPER_LCC07":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_INVEST_DATE: rowData.INVEST_DATE,
                P_INVEST_NO: rowData.INVEST_NO
            };
            break;
        // PAPER_LCC08 - 재고실사표(재고포함)
        case "PAPER_LCC08":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_INVEST_DATE: rowData.INVEST_DATE,
                P_INVEST_NO: rowData.INVEST_NO
            };
            break;
        // PAPER_LCC09 - 재고실사내역
        case "PAPER_LCC09":
            if (rowData.CONFIRM_YN == $ND.C_NO) {
                alert($NC.getDisplayMsg("JS.LCC04010E0.019", "[" + reportInfo.REPORT_NM + "]재고실사 확정된 내역을 선택하십시오.", reportInfo.REPORT_NM));
                return;
            }
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_INVEST_DATE: rowData.INVEST_DATE,
                P_INVEST_NO: rowData.INVEST_NO
            };
            break;
        // PAPER_LCC10 - 재고실사차이내역
        case "PAPER_LCC10":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_INVEST_DATE: rowData.INVEST_DATE,
                P_INVEST_NO: rowData.INVEST_NO
            };
            break;
        // // PAPER_LCC11 - 재고실사표(제조번호/사용기한)
        // case "PAPER_LCC11":
        // // 선택 데이터 가져오기
        // // checkedData = {};
        // // checkedValues 외 쿼리 파라메터 세팅
        // queryParams = {
        // P_CENTER_CD: rowData.CENTER_CD,
        // P_BU_CD: rowData.BU_CD,
        // P_INVEST_DATE: rowData.INVEST_DATE,
        // P_INVEST_NO: rowData.INVEST_NO
        // };
        // break;
        // // PAPER_LCC12 - 재고실사내역(제조번호/사용기한)
        // case "PAPER_LCC12":
        // // 선택 데이터 가져오기
        // // checkedData = {};
        // // checkedValues 외 쿼리 파라메터 세팅
        // queryParams = {
        // P_CENTER_CD: rowData.CENTER_CD,
        // P_BU_CD: rowData.BU_CD,
        // P_INVEST_DATE: rowData.INVEST_DATE,
        // P_INVEST_NO: rowData.INVEST_NO
        // };
        // break;
        // // PAPER_LCC13 - 재고실사차이내역(제조번호/사용기한)
        // case "PAPER_LCC13":
        // // 선택 데이터 가져오기
        // // checkedData = {};
        // // checkedValues 외 쿼리 파라메터 세팅
        // queryParams = {
        // P_CENTER_CD: rowData.CENTER_CD,
        // P_BU_CD: rowData.BU_CD,
        // P_INVEST_DATE: rowData.INVEST_DATE,
        // P_INVEST_NO: rowData.INVEST_NO
        // };
        // break;
        // // PAPER_LCC14 - 재고실사표(재고포함)(제조번호/사용기한)
        // case "PAPER_LCC14":
        // // 선택 데이터 가져오기
        // // checkedData = {};
        // // checkedValues 외 쿼리 파라메터 세팅
        // queryParams = {
        // P_CENTER_CD: rowData.CENTER_CD,
        // P_BU_CD: rowData.BU_CD,
        // P_INVEST_DATE: rowData.INVEST_DATE,
        // P_INVEST_NO: rowData.INVEST_NO
        // };
        // break;
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

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "INVEST_DATE",
            "INVEST_NO"
        ]
    });

    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "LINE_NO"
    });

    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyValM;
    G_GRDT1DETAIL.lastKeyVal = lastKeyValD;
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
            "INVEST_DATE",
            "INVEST_NO"
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

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    // 재고실사등록
    if (tabActiveIndex == 0) {

        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT1TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT1TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT1TabSheetView", "h");
        }
        $("#divQView_Div").hide();
        $("#divQGap_Div").hide();
    }
    // 사유관리내역
    else if (tabActiveIndex == 1) {
        $("#divQView_Div").hide();
        $("#divQGap_Div").show();

        $NC.onGlobalResize();
    }
    // 재고실사내역
    else {
        $("#divQView_Div").show();
        $("#divQGap_Div").hide();
        $NC.onGlobalResize();
    }
    // 화면상단의 공통 메뉴 버튼 이미지 표시 : true인 경우는 조회 버튼만 활성화 한다.
    setReportInfo();
    setTopButtons();
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INVEST_DATE",
        field: "INVEST_DATE",
        name: "실사일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_NO",
        field: "INVEST_NO",
        name: "실사번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_DIV_F",
        field: "INVEST_DIV_F",
        name: "실사구분"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_START_DATE",
        field: "INVEST_START_DATE",
        name: "실사시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_END_DATE",
        field: "INVEST_END_DATE",
        name: "실사종료일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "MANAGER_ID",
        field: "MANAGER_ID",
        name: "실사당당자ID"
    });
    $NC.setGridColumn(columns, {
        id: "MANAGER_NM",
        field: "MANAGER_NM",
        name: "실사당당자명"
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
    $NC.setGridColumn(columns, {
        id: "REFLECT_YN",
        field: "REFLECT_YN",
        name: "재고반영여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "REFLECT_USER_ID",
        field: "REFLECT_USER_ID",
        name: "재고반영자"
    });
    $NC.setGridColumn(columns, {
        id: "REFLECT_DATETIME",
        field: "REFLECT_DATETIME",
        name: "재고반영일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 2,
        editable: true,
        autoEdit: true,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.CONFIRM_YN == $ND.C_NO) {
                    return;
                }
                if (rowData.REFLECT_YN == $ND.C_YES) {
                    return "styApplyDone";
                }
                return "styDone";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LCC04010E0.RS_T1_MASTER",
        sortCol: "INVEST_DATE",
        gridOptions: options,
        canDblClick: true
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onBeforeEditCell.subscribe(grdT1MasterOnBeforeEditCell);
    G_GRDT1MASTER.view.onCellChange.subscribe(grdT1MasterOnCellChange);
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
    if (refRowData.REFLECT_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.020", "이미 재고에 반영된 데이터 입니다."));
        return;
    }
    if (refRowData.CONFIRM_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.021", "이미 확정처리된 전표입니다."));
        return;
    }

    // 조회후 상태가 바뀌었는지 한번더 상태 체크
    $NC.serviceCall("/LCC04010E0/getConfirmYn.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_ETC_DATE: refRowData.INVEST_DATE,
        P_ETC_NO: refRowData.INVEST_NO,
        P_TABLE_DIV: "C" // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    }, //
    // ServiceCall SuccessCallback
    function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            alert($NC.getDisplayMsg("JS.LCC04010E0.022", "확정여부를 확인하지 못했습니다.\n다시 처리하십시오."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }
        if (resultData.O_CONFIRM_YN != $ND.C_NO) {
            alert($NC.getDisplayMsg("JS.LCC04010E0.023", "이미 확정처리된 전표입니다.\n다시 조회 후 데이터를 확인하십시오."));
            return;
        }

        // 디테일 데이터 재조회 후 처리, 다른 사용자에 의해 변경될 수 있음
        $NC.clearGridData(G_GRDT1DETAIL);
        G_GRDT1DETAIL.queryParams = {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_INVEST_DATE: refRowData.INVEST_DATE,
            P_INVEST_NO: refRowData.INVEST_NO
        };
        // 데이터 조회, Synchronize
        var serviceCallError = false;
        $NC.serviceCallAndWait("/LCC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail, function(subAjaxData) {
            $NC.onError(subAjaxData);
            serviceCallError = true;
        });
        if (serviceCallError) {
            return;
        }
        var dsDetail = G_GRDT1DETAIL.data.getItems();
        if (dsDetail.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC04010E0.024", "수정할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
            return;
        }

        var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
        var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
        var BU_CD = $NC.getValue("#edtQBu_Cd");
        var BU_NM = $NC.getValue("#edtQBu_Nm");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "LCC04011P0",
            PROGRAM_NM: $NC.getDisplayMsg("JS.LCC04010E0.0010", "재고실사등록/수정"),
            url: "lc/LCC04011P0.html",
            width: 1024,
            height: 610,
            G_PARAMETER: {
                P_PROCESS_CD: $ND.C_PROCESS_ENTRY_UPDATE,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_INVEST_DATE: refRowData.INVEST_DATE,
                P_INVEST_NO: refRowData.INVEST_NO,
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_POLICY_LC110: $NC.G_VAR.policyVal.LC110,
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

/**
 * 재고실사등록 탭의 그리드 행 클릭시 처리
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
        P_INVEST_DATE: rowData.INVEST_DATE,
        P_INVEST_NO: rowData.INVEST_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LCC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

/**
 * 재고실사 등록 탭 : 상태가 등록인 경우만 그리드 편집 가능
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdT1MasterOnBeforeEditCell(e, args) {

    var rowData = args.item;

    switch (args.column.id) {
        case "REMARK1":
            return rowData.INVEST_STATE == $ND.C_STATE_ENTRY;
        default:
            return false;
    }
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);
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
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
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
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_BOX",
        field: "STOCK_BOX",
        name: "재고BOX",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_QTY",
        field: "INVEST_QTY",
        name: "실사수량",
        // 기본 editorOptions 자동 지정이 아닌 임의 지정
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions({
            formatterType: "FLOAT_QTY",
            isKeyField: true
        }),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_BOX",
        field: "INVEST_BOX",
        name: "실사BOX",
        editor: Slick.Editors.Number,
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_EA",
        field: "INVEST_EA",
        name: "실사EA",
        editor: Slick.Editors.Number,
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_QTY",
        field: "GAP_QTY",
        name: "차이수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
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
        id: "GAP_DIV_F",
        field: "GAP_DIV_F",
        name: "실사차이사유구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "GAP_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "GAP_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        })
    });
    $NC.setGridColumn(columns, {
        id: "GAP_COMMENT",
        field: "GAP_COMMENT",
        name: "실사차이사유내역",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_YN",
        field: "INSPECT_YN",
        name: "실사여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_USER_ID",
        field: "INSPECT_USER_ID",
        name: "실사자"
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_DATETIME",
        field: "INSPECT_DATETIME",
        name: "실사일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDT1DETAIL, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

function grdT1DetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 5,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.GAP_QTY != 0) {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "LCC04010E0.RS_T1_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onCellChange.subscribe(grdT1DetailOnCellChange);
    G_GRDT1DETAIL.view.onBeforeEditCell.subscribe(grdT1DetailOnBeforeEditCell);
}

/**
 * 재고실사등록 탭의 하단그리드 행 클릭시 처리
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

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnCellChange(e, args) {

    var rowData = args.item;
    var columnId = G_GRDT1DETAIL.view.getColumnId(args.cell);
    switch (columnId) {
        case "INVEST_QTY":
        case "INVEST_BOX":
        case "INVEST_EA":
            rowData = grdT1DetailOnCalc(rowData, columnId);
            rowData.GAP_QTY = Number(rowData.INVEST_QTY) - Number(rowData.STOCK_QTY);
            if (rowData.GAP_QTY == 0) {
                rowData.GAP_DIV = "";
                rowData.GAP_DIV_F = "";
                rowData.GAP_COMMENT = "";
            } else {
                rowData.GAP_DIV = $ND.C_REASON_ETC_DIV;
                rowData.GAP_DIV_F = $NC.getGridComboName(G_GRDT1DETAIL, {
                    columnId: "GAP_DIV_F",
                    searchVal: $ND.C_REASON_ETC_DIV,
                    dataCodeField: "COMMON_CD",
                    dataFullNameField: "COMMON_CD_F"
                });
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1DETAIL, rowData);
}

function grdT1DetailOnBeforeEditCell(e, args) {

    var refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (refRowData.CONFIRM_YN == $ND.C_YES) {
        return false;
    }

    var rowData = args.item;
    switch (args.column.id) {
        case "GAP_DIV_F":
        case "GAP_COMMENT":
            return Number(rowData.GAP_QTY) != 0;

    }
    return true;
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INVEST_DATE",
        field: "INVEST_DATE",
        name: "실사일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_NO",
        field: "INVEST_NO",
        name: "실사번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_DIV_F",
        field: "INVEST_DIV_F",
        name: "실사구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
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
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_QTY",
        field: "INVEST_QTY",
        name: "실사수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_QTY",
        field: "GAP_QTY",
        name: "차이수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_BOX",
        field: "GAP_BOX",
        name: "차이BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_EA",
        field: "GAP_EA",
        name: "차이EA",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_WEIGHT",
        field: "GAP_WEIGHT",
        name: "차이중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_DIV_F",
        field: "GAP_DIV_F",
        name: "실사차이사유구분"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_COMMENT",
        field: "GAP_COMMENT",
        name: "실사차이사유내역"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDT2MASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

/**
 * 재고실사내역탭의 그리드 초기값 설정
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
        queryId: "LCC04010E0.RS_T2_MASTER",
        sortCol: "INVEST_DATE",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 사유관리별입고내역 탭의 그리드 행 클릭시 처리
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

function grdT3MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INVEST_DATE",
        field: "INVEST_DATE",
        name: "실사일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_NO",
        field: "INVEST_NO",
        name: "실사번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
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
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_AMT",
        field: "STOCK_AMT",
        name: "재고금액",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_QTY",
        field: "INVEST_QTY",
        name: "실사수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "INVEST_AMT",
        field: "INVEST_AMT",
        name: "실사금액",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_QTY",
        field: "GAP_QTY",
        name: "차이수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_AMT",
        field: "GAP_AMT",
        name: "차이금액",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_BOX",
        field: "GAP_BOX",
        name: "차이BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_EA",
        field: "GAP_EA",
        name: "차이EA",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "GAP_WEIGHT",
        field: "GAP_WEIGHT",
        name: "차이중량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
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
        id: "INSPECT_YN",
        field: "INSPECT_YN",
        name: "실사여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_USER_ID",
        field: "INSPECT_USER_ID",
        name: "실사자"
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_DATETIME",
        field: "INSPECT_DATETIME",
        name: "실사일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3MasterOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDT3MASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

/**
 * 재고실사내역탭의 그리드 초기값 설정
 */
function grdT3MasterInitialize() {

    var options = {
        frozenColumn: 6,
        summaryRow: {
            visible: true
        }
    };

    // Grid DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT3Master", {
        columns: grdT3MasterOnGetColumns(),
        queryId: "LCC04010E0.RS_T3_MASTER",
        sortCol: "INVEST_DATE",
        gridOptions: options
    });

    G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
}

/**
 * 사유관리별입고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT3MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT3MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT3MASTER, row + 1);
}

/**
 * 재고실사등록 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, [
        "INVEST_DATE",
        "INVEST_NO"
    ])) {
        $NC.clearGridData(G_GRDT1DETAIL);
        $NC.setEnable("#btnApplyResult", false);
    } else {
        $NC.setEnable("#btnApplyResult", $NC.getProgramPermission().canConfirm);
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
 * 재고실사내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);
    setTopButtons();
}

/**
 * 재고실사내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT3Master(ajaxData) {

    $NC.setInitGridData(G_GRDT3MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT3MASTER);
    setTopButtons();
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    // 재고실사등록 화면
    $NC.clearGridData(G_GRDT1MASTER, [
        "queryParams"
    ]);
    $NC.clearGridData(G_GRDT1DETAIL);
    // 사유관리내역 화면
    $NC.clearGridData(G_GRDT2MASTER);
    // 재고실사내역 화면
    $NC.clearGridData(G_GRDT3MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    $NC.setEnable("#btnApplyResult", false);
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
        $NC.setFocus("#dtpQInvest_Date1", true);
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
    // 프로그램 레포트 정보 세팅
    setReportInfo();

    setPolicyValInfo();
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
        $("#btnApplyResult").click(btnApplyResultOnClick);
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
        alert($NC.getDisplayMsg("JS.LCC04010E0.026", "처리할 데이터가 없습니다.\n 조회 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.CONFIRM_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.027", "확정된 데이터에 대하여 취소 할 수 있습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC04010E0.028", "취소를 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC04010E0/callLcInvestConfirm.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INVEST_DATE: rowData.INVEST_DATE,
        P_INVEST_NO: rowData.INVEST_NO,
        P_DIRECTION: $ND.C_DIRECTION_BW,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
}

/**
 * 확정처리
 */
function onProcessNxt() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.029", "처리할 데이터가 없습니다.\n 조회 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.CONFIRM_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.030", "확정 된 데이터입니다."));
        return;
    }

    if (G_GRDT1MASTER.view.getEditorLock().isActive()) {
        G_GRDT1MASTER.view.getEditorLock().commitCurrentEdit();
    }

    if ($NC.isGridModified(G_GRDT1DETAIL)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.031", "데이터가 수정되었습니다. 저장 후 확정 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC04010E0.032", "확정을 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC04010E0/callLcInvestConfirm.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INVEST_DATE: rowData.INVEST_DATE,
        P_INVEST_NO: rowData.INVEST_NO,
        P_DIRECTION: $ND.C_DIRECTION_FW,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
}

/**
 * 재고반영
 */
function btnApplyResultOnClick() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.033", "조회 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.CONFIRM_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.034", "확정된 전표만 재고반영 처리할 수 있습니다."));
        return;
    }
    if (rowData.REFLECT_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC04010E0.035", "이미 재고에 반영된 된 데이터입니다."));
        return;
    }
    if (rowData.DATA_CREATE_DIV == "1" && $NC.G_VAR.policyVal.LS210 == "2") {
        alert($NC.getDisplayMsg("JS.LCC04010E0.036", "유통기한/제조배치가 없이 상품별로 생성된 재고실사 데이터입니다.\n해당 데이터는 재고반영 처리할 수 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC04010E0.037", "재고반영을 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC04010E0/callLcFwInvestReplectConfirm.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INVEST_DATE: rowData.INVEST_DATE,
        P_INVEST_NO: rowData.INVEST_NO,
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

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    // 재고실사등록탭
    if (tabActiveIndex == 0) {

        if ($NC.isNotNull(G_GRDT1MASTER.queryParams)) {
            $NC.G_VAR.buttons._new = "1";
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "1";
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
        // [LC130] 재고실사 재고버튼 추가/삭제 정책
        $NC.setVisible("#btnApplyResult", $NC.G_VAR.policyVal.LC130 == $ND.C_YES);

        // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
        // 컬럼 표시 조정
        grdT1DetailOnSetColumns();
        grdT2MasterOnSetColumns();
        grdT3MasterOnSetColumns();
    });
}

function setReportInfo() {

    var tabIndex = $NC.getTabActiveIndex("#divMasterView");
    if (tabIndex == 1 || tabIndex == 2) {
        $NC.G_VAR.printOptions = [];
        return;
    }

    var PROGRAM_SUB_CD = [];

    // 레포트 세팅
    if (tabIndex == 0) {
        // 등록
        PROGRAM_SUB_CD.push("T1");
    }

    // 프로그램 레포트 정보 세팅
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    $NC.setProgramReportInfo({
        P_PROGRAM_SUB_CD: $NC.toJoin(PROGRAM_SUB_CD),
        P_BU_CD: BU_CD
    });
}

function grdT1DetailOnCalc(rowData, changedColumnId) {

    switch (changedColumnId) {
        case "INVEST_BOX":
        case "INVEST_EA":
            rowData.INVEST_QTY = $NC.getBQty(rowData.INVEST_BOX, rowData.INVEST_EA, rowData.QTY_IN_BOX);
            break;
    }

    rowData.INVEST_BOX = $NC.getBBox(rowData.INVEST_QTY, rowData.QTY_IN_BOX);
    rowData.INVEST_EA = $NC.getBEa(rowData.INVEST_QTY, rowData.QTY_IN_BOX);

    return rowData;
}