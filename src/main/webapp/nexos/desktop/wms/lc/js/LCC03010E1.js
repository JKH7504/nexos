/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC03010E1
 *  프로그램명         : 재고이동/보충관리 (의류)
 *  프로그램설명       : 재고이동/보충관리 (의류) 화면 Javascript
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
            }
            return resizeView;
        },
        // 체크할 정책 값
        policyVal: {
            LO330: "" // 재고 할당 기준 정책
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

    $NC.setInitDateRangePicker("#dtpQMove_Date1", "#dtpQMove_Date2");
    $NC.setInitDatePicker("#dtpOutbound_Date");

    // 출고일자/긴급보충내역생성 버튼 숨김
    $NC.setVisible("#divEmergency", false);
    $NC.setVisible("#tdQZone_Cd", false);

    // 확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
    setUserProgramPermission();

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
                P_RESULT_ID: "O_WC_POP_CMZONE",
                P_QUERY_ID: "WC.POP_CMZONE",
                P_QUERY_PARAMS: {
                    P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
                    P_ZONE_CD: $ND.C_ALL
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_MOVE_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "MOVE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "1",
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_YEAR_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "YEAR_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_SEASON_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "SEASON_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_DIV",
                    P_COMMON_CD: $ND.C_ALL,
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
                setPolicyValInfo();
            }
        });
        // 조회조건 - 존 세팅
        $NC.setInitComboData({
            selector: "#cboQZone_Cd",
            codeField: "ZONE_CD",
            nameField: "ZONE_NM",
            fullNameField: "ZONE_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMZONE),
            addAll: true
        });
        // 조회조건 - 이동구분 세팅
        $NC.setInitComboData({
            selector: "#cboQMove_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_MOVE_DIV),
            addAll: true
        });
        // 조회조건 - 연도구분 세팅
        $NC.setInitComboData({
            selector: "#cboQT2_Year_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_YEAR_DIV),
            addAll: true,
            multiSelect: true
        });
        // 조회조건 - 시즌구분 세팅
        $NC.setInitComboData({
            selector: "#cboQT2_Season_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SEASON_DIV),
            addAll: true,
            multiSelect: true
        });
        // 조회조건 - 상품구분 세팅
        $NC.setInitComboData({
            selector: "#cboQT2_Item_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_DIV),
            addAll: true,
            multiSelect: true
        });
        $NC.setInitComboData({
            selector: "#cboQItem_State",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE),
            addAll: true,
            multiSelect: true
        });
    });

    // 프로그램 레포트 정보 세팅
    setReportInfo();

    // 취소/처리 버튼 툴팁 세팅
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
            setZoneCdCombo();
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
                alert($NC.getDisplayMsg("JS.LCC03010E1.026", "사업부를 먼저 선택 하십시오."));
                $NC.setValue("#edtQBrand_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onBuBrandChange(val, {
                P_BU_CD: BU_CD,
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "MOVE_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC03010E1.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "MOVE_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC03010E1.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();

    switch (id) {
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC03010E1.003", "출고일자를 정확히 입력하십시오."));
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var MOVE_DATE1 = $NC.getValue("#dtpQMove_Date1");
    if ($NC.isNull(MOVE_DATE1)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.006", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQMove_Date1");
        return;
    }
    var MOVE_DATE2 = $NC.getValue("#dtpQMove_Date2");
    if ($NC.isNull(MOVE_DATE2)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.007", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQMove_Date2");
        return;
    }
    if (MOVE_DATE1 > MOVE_DATE2) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.008", "이동일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQMove_Date1");
        return;
    }

    var MOVE_DIV = $NC.getValue("#cboQMove_Div");
    if ($NC.isNull(MOVE_DIV)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.009", "이동구분을 선택하십시오."));
        $NC.setFocus("#cboQMove_Div");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    // var ZONE_CD = $NC.getValue("#cboQZone_Cd");

    var YEAR_DIV = $NC.getValue("#cboQT2_Year_Div");
    var SEASON_DIV = $NC.getValue("#cboQT2_Season_Div");
    var ITEM_DIV = $NC.getValue("#cboQT2_Item_Div");
    var LOCATION_CD = $NC.getValue("#edtQT2_Location_Cd");
    var MLOCATION_CD = $NC.getValue("#edtQT2_MLocation_Cd");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");

    var tabActiveIndex = $NC.getTabActiveIndex("#divMasterView");
    // 등록 화면
    if (tabActiveIndex == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_MOVE_DATE1: MOVE_DATE1,
            P_MOVE_DATE2: MOVE_DATE2,
            P_MOVE_DIV: MOVE_DIV,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_ITEM_STATE: ITEM_STATE
        };
        // 데이터 조회
        $NC.serviceCall("/LCC03010E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    } else if (tabActiveIndex == 1) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_MOVE_DATE1: MOVE_DATE1,
            P_MOVE_DATE2: MOVE_DATE2,
            P_MOVE_DIV: MOVE_DIV,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_LOCATION_CD: LOCATION_CD,
            P_MLOCATION_CD: MLOCATION_CD,
            P_YEAR_DIV: YEAR_DIV,
            P_SEASON_DIV: SEASON_DIV,
            P_ITEM_DIV: ITEM_DIV,
            P_ITEM_STATE: ITEM_STATE
        };
        // 데이터 조회
        $NC.serviceCall("/LCC03010E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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
        var MOVE_DATE = $NC.getValue("#dtpQMove_Date2");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "LCC03011P1",
            PROGRAM_NM: $NC.getDisplayMsg("JS.LCC03010E1.010", "재고이동등록/수정"),
            url: "lc/LCC03011P1.html",
            width: 1024,
            height: 610,
            G_PARAMETER: {
                P_PROCESS_CD: $ND.C_PROCESS_ENTRY_CREATE,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_MOVE_DATE: MOVE_DATE,
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
            alert($NC.getDisplayMsg("JS.LCC03010E1.011", "삭제할 데이터가 없습니다."));
            return;
        }

        var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
        if (rowData.CONFIRM_YN == $ND.C_YES) {
            alert($NC.getDisplayMsg("JS.LCC03010E1.012", "이미 확정한 데이터는 삭제할수 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.LCC03010E1.013", "삭제 하시겠습니까?"))) {
            return;
        }

        $NC.serviceCall("/LCC03010E0/callLcBwMoveEntry.do", {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_MOVE_DATE: rowData.MOVE_DATE,
            P_MOVE_NO: rowData.MOVE_NO,
            P_LINE_NO: null,
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
        alert($NC.getDisplayMsg("JS.LCC03010E1.014", "출력할 데이터를 먼저 선택하십시오."));
        return;
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LCC05 - 로케이션이동지시서
        case "PAPER_LCC05":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: rowData.CENTER_CD,
                P_BU_CD: rowData.BU_CD,
                P_MOVE_DATE: rowData.MOVE_DATE,
                P_MOVE_NO: rowData.MOVE_NO
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

    var REPORT_TITLE_NM;
    switch (rowData.MOVE_DIV) {
        case "31":
            REPORT_TITLE_NM = "긴급보충 작업의뢰서";
            break;
        case "41":
            REPORT_TITLE_NM = "수시보충 작업의뢰서";
            break;
        case "51":
            REPORT_TITLE_NM = "보충잔량이동 작업의뢰서";
            break;
        default:
            REPORT_TITLE_NM = reportInfo.REPORT_TITLE_NM;
            break;
    }

    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: reportInfo.REPORT_DOC_URL,
        reportTitle: REPORT_TITLE_NM,
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
            "MOVE_DATE",
            "MOVE_NO"
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
            "MOVE_DATE",
            "MOVE_NO"
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
    if (tabActiveIndex == 0) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT1TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT1TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT1TabSheetView", "h");
        }
        $NC.setVisible("#tdQZone_Cd", false);
        $NC.setVisible("#tdQMove_Date");
        $NC.setVisible("#tdQMove_Div");
        $("div.btnIcoAdditionalCondition").show();
    } else if (tabActiveIndex == 1) {
        $NC.setVisible("#tdQZone_Cd", false);
        $NC.setVisible("#tdQMove_Date");
        $NC.setVisible("#tdQMove_Div");
        $("div.btnIcoAdditionalCondition").show();
        $NC.onGlobalResize();
    } else {
        $NC.setVisible("#tdQZone_Cd");
        $NC.setVisible("#tdQMove_Date", false);
        $NC.setVisible("#tdQMove_Div", false);
        $("div.btnIcoAdditionalCondition").hide();
        $NC.onGlobalResize();
    }
    setReportInfo();
    // 화면상단의 공통 메뉴 버튼 이미지 표시 : true인 경우는 조회 버튼만 활성화 한다.
    setTopButtons();
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "MOVE_DATE",
        field: "MOVE_DATE",
        name: "이동일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "MOVE_NO",
        field: "MOVE_NO",
        name: "이동번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "MOVE_DIV_F",
        field: "MOVE_DIV_F",
        name: "이동구분"
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
            compareKey: "CONFIRM_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LCC03010E1.RS_T1_MASTER",
        sortCol: "MOVE_DATE",
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

    if (refRowData.MOVE_DIV == "31") {
        alert($NC.getDisplayMsg("JS.LCC03010E1.015", "긴급보충이동 데이터는 수정할 수 없습니다."));
        return;
    }

    // 등록수정여부가 N일 경우 수정불가함.
    if (refRowData.ENTRY_MODIFY_YN == $ND.C_NO) {
        return;
    }

    // 확정처리된 전표는 수정불가함.
    if (refRowData.CONFIRM_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.016", "이미 확정처리된 전표입니다."));
        return;
    }

    // 조회후 상태가 바뀌었는지 한번더 상태 체크
    $NC.serviceCall("/LCC03010E0/getConfirmYn.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_ETC_DATE: refRowData.MOVE_DATE,
        P_ETC_NO: refRowData.MOVE_NO,
        P_TABLE_DIV: "B" // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    }, //
    // ServiceCall SuccessCallback
    function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            alert($NC.getDisplayMsg("JS.LCC03010E1.017", "확정여부를 확인하지 못했습니다.\n다시 처리하십시오."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }
        if (resultData.O_CONFIRM_YN != $ND.C_NO) {
            alert($NC.getDisplayMsg("JS.LCC03010E1.018", "이미 확정처리된 데이터입니다.\n다시 조회 후 데이터를 확인하십시오."));
            return;
        }

        // 디테일 데이터 재조회 후 처리, 다른 사용자에 의해 변경될 수 있음
        $NC.clearGridData(G_GRDT1DETAIL);
        G_GRDT1DETAIL.queryParams = {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_MOVE_DATE: refRowData.MOVE_DATE,
            P_MOVE_NO: refRowData.MOVE_NO

        };
        // 데이터 조회, Synchronize
        var serviceCallError = false;
        $NC.serviceCallAndWait("/LCC03010E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail, function(subAjaxData) {
            $NC.onError(subAjaxData);
            serviceCallError = true;
        });
        if (serviceCallError) {
            return;
        }
        var dsSub = G_GRDT1DETAIL.data.getItems();
        if (dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC03010E1.019", "수정할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
            return;
        }

        var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
        var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
        var BU_CD = $NC.getValue("#edtQBu_Cd");
        var BU_NM = $NC.getValue("#edtQBu_Nm");

        $NC.showProgramSubPopup({
            PROGRAM_ID: "LCC03011P1",
            PROGRAM_NM: $NC.getDisplayMsg("JS.LCC03010E1.010", "재고이동등록/수정"),
            url: "lc/LCC03011P1.html",
            width: 1024,
            height: 610,
            G_PARAMETER: {
                P_PROCESS_CD: $ND.C_PROCESS_ENTRY_UPDATE,
                P_CENTER_CD: CENTER_CD,
                P_CENTER_CD_F: CENTER_CD_F,
                P_BU_CD: BU_CD,
                P_BU_NM: BU_NM,
                P_MOVE_DATE: refRowData.MOVE_DATE,
                P_MOVE_NO: refRowData.MOVE_NO,
                P_MOVE_DIV: refRowData.MOVE_DIV,
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_MASTER_DS: refRowData,
                P_DETAIL_DS: [],
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
        P_MOVE_DATE: rowData.MOVE_DATE,
        P_MOVE_NO: rowData.MOVE_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LCC03010E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 수기확정 불가일 경우 확정버튼 비활성
    if (rowData.NOTE_CONFIRM_YN == $ND.C_NO) {
        $NC.setEnable("#btnProcessNxt", false);
    } else {
        $NC.setEnable("#btnProcessNxt");
    }

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
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "재고로케이션",
        cssClass: "styCenter"
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
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_EA",
        field: "STOCK_EA",
        name: "재고EA",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "MLOCATION_CD",
        field: "MLOCATION_CD",
        name: "이동로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "MSTOCK_QTY",
        field: "MSTOCK_QTY",
        name: "이동수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "MSTOCK_BOX",
        field: "MSTOCK_BOX",
        name: "이동BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "MSTOCK_EA",
        field: "MSTOCK_EA",
        name: "이동EA",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "MSTOCK_WEIGHT",
        field: "MSTOCK_WEIGHT",
        name: "이동중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_YN",
        field: "INSPECT_YN",
        name: "이동여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_USER_ID",
        field: "INSPECT_USER_ID",
        name: "이동자"
    });
    $NC.setGridColumn(columns, {
        id: "INSPECT_DATETIME",
        field: "INSPECT_DATETIME",
        name: "이동일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 4,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.STOCK_QTY != rowData.MSTOCK_QTY) {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "LCC03010E1.RS_T1_DETAIL",
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
        id: "MOVE_DATE",
        field: "MOVE_DATE",
        name: "이동일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "MOVE_NO",
        field: "MOVE_NO",
        name: "이동번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "MOVE_DIV_F",
        field: "MOVE_DIV_F",
        name: "이동구분"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
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
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "재고로케이션",
        cssClass: "styCenter"
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
        id: "MLOCATION_CD",
        field: "MLOCATION_CD",
        name: "이동로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "MSTOCK_QTY",
        field: "MSTOCK_QTY",
        name: "이동수량",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "MSTOCK_BOX",
        field: "MSTOCK_BOX",
        name: "이동BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "MSTOCK_EA",
        field: "MSTOCK_EA",
        name: "이동EA",
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
        id: "MSTOCK_WEIGHT",
        field: "MSTOCK_WEIGHT",
        name: "이동중량",
        cssClass: "styRight",
        aggregator: "SUM"
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

/**
 * 내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 7,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LCC03010E1.RS_T2_MASTER",
        sortCol: "MOVE_DATE",
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
        "MOVE_DATE",
        "MOVE_NO"
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
        $NC.setFocus("#dtpQMove_Date1", true);
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
    setReportInfo();
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

    // 저장
    if (permission.canSave) {
        $("#btnReplenishEntry").click(btnReplenishEntryOnClick);
        $("#btnReplenishSpot").click(btnReplenishSpotOnClick);
    }
    $NC.setEnable("#btnReplenishEntry", permission.canSave);
    $NC.setEnable("#dtpOutbound_Date", permission.canSave);
    $NC.setEnable("#btnReplenishSpot", permission.canSave);
    // 확정
    if (permission.canConfirm) {
        $("#btnProcessNxt").click(onProcessNxt);
    }
    $NC.setEnable("#btnProcessNxt", permission.canConfirm);
}

/**
 * 확정처리
 */
function onProcessNxt() {

    if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.020", "조회 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.CONFIRM_YN == $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.021", "이미 확정 처리한 데이터입니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC03010E1.022", "확정 처리하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC03010E0/callLcMoveConfirm.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_MOVE_DATE: rowData.MOVE_DATE,
        P_MOVE_NO: rowData.MOVE_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
}

/**
 * 긴급보충
 */
function btnReplenishEntryOnClick() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var MOVE_DATE = $NC.getValue("#dtpOutbound_Date");
    if ($NC.isNull(MOVE_DATE)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.023", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpOutbound_Date");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LCC03010E1.024", "긴급보충내역을 생성 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC03010E0/callLcFWFillupEmergencyEntry.do", {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_MOVE_DATE: MOVE_DATE,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP);
}

/**
 * 수시보충
 */
function btnReplenishSpotOnClick() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03010E1.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LCC03012P1",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LCC03010E1.025", "수시보충내역생성"),
        url: "lc/LCC03012P1.html",
        width: 350,
        height: 550,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD
        },
        onOk: function() {
            _Inquiry();
        }
    });
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
        if ($NC.G_VAR.policyVal.LO330 == "1" || $NC.G_VAR.policyVal.LO330 == "2") { // 2019-07-10 LO330 정책에 '2' 추가로 인한 수정
            // 출고일자/긴급보충내역생성 버튼 숨김
            $NC.setVisible("#divEmergency");
        }
    });
}

// 조회조건 - 존코드 세팅
function setZoneCdCombo() {

    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMZONE",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_ZONE_CD: $ND.C_ALL
        }
    }, {
        selector: "#cboQZone_Cd",
        codeField: "ZONE_CD",
        nameField: "ZONE_NM",
        fullNameField: "ZONE_CD_F",
        addAll: true
    });
}

function setReportInfo() {

    var tabIndex = $NC.getTabActiveIndex("#divMasterView");
    if (tabIndex == 1) {
        $NC.G_VAR.printOptions = [];
        return;
    }

    var PROGRAM_SUB_CD = [];

    // 레포트 세팅
    if (tabIndex == 0) {
        // 등록
        PROGRAM_SUB_CD.push("T1");
    } else {
        // 내역
        PROGRAM_SUB_CD.push("T3");
    }

    // 프로그램 레포트 정보 세팅
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    $NC.setProgramReportInfo({
        P_PROGRAM_SUB_CD: $NC.toJoin(PROGRAM_SUB_CD),
        P_BU_CD: BU_CD
    });
}