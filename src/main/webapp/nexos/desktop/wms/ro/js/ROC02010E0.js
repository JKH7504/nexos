/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : ROC02010E0
 *  프로그램명         : 반출작업
 *  프로그램설명       : 반출작업 화면 Javascript
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
                container: "#divMasterView",
                childContainer: $NC.G_VAR.activeView.container,
                exceptHeight: $NC.getViewHeight("#divMasterInfoView")
            };
            switch ($NC.G_VAR.activeView.PROCESS_CD) {
                // 반출등록
                case $ND.C_PROCESS_ENTRY:
                    resizeView.grids = [
                        "#grdMasterB",
                        "#grdDetailB"
                    ];
                    break;
                // 반출확정
                case $ND.C_PROCESS_CONFIRM:
                    resizeView.grids = [
                        "#grdMasterD",
                        "#grdDetailD",
                        "#grdSubD"
                    ];
                    break;
            }

            return resizeView;
        },
        // 현재 액티브된 뷰 정보
        activeView: {
            container: "",
            PROCESS_CD: ""
        },
        // 체크할 정책 값
        policyVal: {
            RO190: "", // 공급금액 계산정책
            RO210: "", // 반출등록 전표생성 가능여부
            RO220: "", // 반출등록 수량 허용기준
            RO221: "", // 예정으로 등록시 추가/삭제 허용
            RO240: "", // 반출 기존 상품상태 기준
            RO250: "", // 유통기한/제조배치번호 지정 정책
            RO410: "", // 반출확정 수량 수정 가능여부
            LS210: "" // 재고 관리 기준
        },
        // 프로세스별 확정/취소 처리가능 진행상태
        // 0: A, 1: B, 2 : C, 3 : D, 4: E
        stateFWBW: {
            A: {
                CONFIRM: "",
                CANCEL: ""
            },
            B: {
                CONFIRM: "",
                CANCEL: ""
            },
            D: {
                CONFIRM: "",
                CANCEL: ""
            }
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");
    $NC.setValue("#chkQState_Pre_Yn", $ND.C_YES);
    $NC.setValue("#chkQState_Cur_Yn", $ND.C_YES);

    $NC.setInitDatePicker("#dtpQOutbound_Date");
    $NC.setInitDatePicker("#dtpOutbound_DateB");
    $NC.setInitDateRangePicker("#dtpQOrder_Date1", "#dtpQOrder_Date2", null, -2);

    // 미사용기능 숨김 처리
    // 초기 숨김 처리
    // 초기 비활성화 처리
    // 이벤트 연결
    $("#divMasterInfoView input[type=button]").bind("click", function(e) {
        onSubViewChange(e, $(this));
    });

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQVendor_Cd").click(showVendorPopup);

    // 반출확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
    setUserProgramPermission();

    // 그리드 초기화 - 반출등록
    window.grdMasterBInitialize();
    window.grdDetailBInitialize();

    // 그리드 초기화 - 반출확정
    window.grdMasterDInitialize();
    window.grdDetailDInitialize();
    window.grdSubDInitialize();

    // 조회조건 - 반출구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: $ND.C_INOUT_GRP_D3,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });

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
            // 반출전표/수량 정보 세팅, 프로세스 정보, ※ 조회 조건이 모두 세팅이 되는 시점
            setTimeout(function() {
                setMasterSummaryInfo();
                setPolicyValInfo();
                setProcessStateInfo();
                setMasterProcessInfo();
            }, $ND.C_TIMEOUT_ACT);
        }
    });

    // 취소/처리 버튼 툴팁 세팅
    $NC.setTooltip("#btnProcessPreB", $NC.getDisplayMsg("JS.ROC02010E0.001", $NC.getValue("#btnProcessB") + " 취소", $NC.getValue("#btnProcessB")));
    $NC.setTooltip("#btnProcessNxtB", $NC.getDisplayMsg("JS.ROC02010E0.002", $NC.getValue("#btnProcessB") + " 처리", $NC.getValue("#btnProcessB")));
    $NC.setTooltip("#btnProcessPreD", $NC.getDisplayMsg("JS.ROC02010E0.001", $NC.getValue("#btnProcessD") + " 취소", $NC.getValue("#btnProcessD")));
    $NC.setTooltip("#btnProcessNxtD", $NC.getDisplayMsg("JS.ROC02010E0.002", $NC.getValue("#btnProcessD") + " 처리", $NC.getValue("#btnProcessD")));
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

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
        case "CENTER_CD":
            onChangingCondition();
            setMasterProcessInfo();
            setPolicyValInfo();
            setProcessStateInfo();
            return;
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
        case "VENDOR_CD":
            $NP.onVendorChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_VENDOR_CD: val,
                P_VIEW_DIV: "2"
            }, onVendorPopup);
            return;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.ROC02010E0.003", "검색 반출일자를 정확히 입력하십시오."));
            break;
        case "ORDER_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.ROC02010E0.004", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "ORDER_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.ROC02010E0.005", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

function onChangingCondition() {

    for ( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
        if (PROCESS_CD == $ND.C_PROCESS_ORDER) {
            continue;
        }
        $NC.clearGridData(window["G_GRDMASTER" + PROCESS_CD]); // 마스터
        $NC.clearGridData(window["G_GRDDETAIL" + PROCESS_CD]); // 디테일
        // 확정일 경우
        if (PROCESS_CD == $ND.C_PROCESS_CONFIRM) {
            $NC.clearGridData(window["G_GRDSUB" + PROCESS_CD]);
        }
    }

    // 전표건수/수량 정보 재조회
    setMasterSummaryInfo();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "OUTBOUND_DATEB":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.ROC02010E0.006", "반출일자를 정확히 입력하십시오."));
            break;
    }
}

/**
 * Sub View Button Click 시 호출 됨
 */
function onSubViewChange(e, $view) {

    // btnProcessA ---> A
    var PROCESS_CD = $view.prop("id").substr(10).toUpperCase();
    if ($NC.G_VAR.activeView.PROCESS_CD == PROCESS_CD) {
        return;
    }

    for ( var INIT_PROCESS_CD in $NC.G_VAR.stateFWBW) {
        if (INIT_PROCESS_CD == $ND.C_PROCESS_ORDER) {
            continue;
        }
        $("#btnProcess" + INIT_PROCESS_CD).removeClass("stySelect");
        $("#divSubView" + INIT_PROCESS_CD).hide();
    }

    $NC.G_VAR.activeView.container = "#divSubView" + PROCESS_CD;
    $NC.G_VAR.activeView.PROCESS_CD = PROCESS_CD;

    $view.addClass("stySelect");
    $($NC.G_VAR.activeView.container).show();

    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        // 반출 등록
        case $ND.C_PROCESS_ENTRY:
            $("#tdQOrder_Date").show(); // 반출예정일자 표시
            // 스플리터가 초기화 또는 리사이즈 호출
            if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
                $($NC.G_VAR.activeView.container).trigger("resize");
            } else {
                $NC.setInitSplitter($NC.G_VAR.activeView.container, "hb", 350);
            }
            break;
        // 반출 확정
        case $ND.C_PROCESS_CONFIRM:
            $("#tdQOrder_Date").hide(); // 반출예정일자 비표시

            // 스플리터가 초기화 또는 리사이즈 호출
            if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
                $($NC.G_VAR.activeView.container).trigger("resize");
                $("#divSubViewDDetail").trigger("resize");
            } else {
                $NC.setInitSplitter($NC.G_VAR.activeView.container, "v", 500, 270, 400);
                $NC.setInitSplitter("#divSubViewDDetail", "hb", 400);
            }
            break;
    }

    _Inquiry();
    setReportInfo();
    return;
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.007", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.008", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.009", "반출일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }
    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    if ($NC.isNull(ORDER_DATE1)) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.010", "반출예정 검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }
    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    if ($NC.isNull(ORDER_DATE2)) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.011", "반출예정 검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date2");
        return;
    }
    if (ORDER_DATE1 > ORDER_DATE2) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.012", "반출예정일자 범위 입력오류입니다."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);

    var STATE_PRE_YN = $NC.getValue("#chkQState_Pre_Yn");
    var STATE_CUR_YN = $NC.getValue("#chkQState_Cur_Yn");
    if (STATE_PRE_YN == $ND.C_NO && STATE_CUR_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.013", "검색구분을 선택하십시오."));
        $NC.setFocus("#chkQState_Pre_Yn");
        return;
    }

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_Inquiry" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn({
            CENTER_CD: CENTER_CD,
            BU_CD: BU_CD,
            OUTBOUND_DATE: OUTBOUND_DATE,
            ORDER_DATE1: ORDER_DATE1,
            ORDER_DATE2: ORDER_DATE2,
            INOUT_CD: INOUT_CD,
            VENDOR_CD: VENDOR_CD,
            BRAND_CD: BRAND_CD,
            ITEM_CD: ITEM_CD,
            ITEM_NM: ITEM_NM,
            STATE_PRE_YN: STATE_PRE_YN,
            STATE_CUR_YN: STATE_CUR_YN
        });
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_New" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn();
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_Save" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn();
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_Delete" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn();
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_Cancel" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn();
    }
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
        alert($NC.getDisplayMsg("JS.ROC02010E0.007", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.008", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.ROC02010E0.009", "반출일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var grdObject;
    // 대상 그리드 선택
    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        case $ND.C_PROCESS_ENTRY:
        case $ND.C_PROCESS_CONFIRM:
            grdObject = $NC.getGridObject("G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD);
            break;
        default:
            alert($NC.getDisplayMsg("JS.ROC02010E0.014", "해당 프로세스는 출력물이 없습니다."));
            return;
    }

    if (grdObject.view.getEditorLock().isActive()) {
        grdObject.view.getEditorLock().commitCurrentEdit();
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_ROC01 - 반출지시서
        case "PAPER_ROC01":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_ENTRY;
                }
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE
            };
            break;
        // PAPER_ROC02 - 매입반품예정의뢰서
        case "PAPER_ROC02":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_ENTRY;
                }
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE
            };
            break;

        // SPEC_ROC01 - 거래명세서
        case "SPEC_ROC01":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_CONFIRM;
                }
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE
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

    return "<span class='styIcoState" + dataContext.OUTBOUND_STATE + "'></span>";
}

/**
 * Grid Column 중 프로세스의 Fomatter
 */
function getGridProcessFormatter(row, cell, value, columnDef, dataContext) {

    switch (dataContext.OUTBOUND_STATE) {
        case $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL:
            return "<span class='styIcoPrior'></span>";
        case $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM:
            return "<span class='styIcoNext'></span>";
        default:
            return "<span class='styIcoStop'></span>";
    }
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    // 저장

    // 행추가 하는 이벤트 없음
    // 확정
    if (permission.canConfirm) {
        $("#btnProcessNxtB").click(window.onProcessNxtB);
        $("#btnProcessNxtD").click(window.onProcessNxtD);
    }
    $NC.setEnable("#btnProcessNxtB", permission.canConfirm);
    $NC.setEnable("#btnProcessNxtD", permission.canConfirm);

    // 취소
    if (permission.canConfirmCancel) {
        $("#btnProcessPreB").click(window.onProcessPreB);
        $("#btnProcessPreD").click(window.onProcessPreD);
    }
    $NC.setEnable("#btnProcessPreB", permission.canConfirmCancel);
    $NC.setEnable("#btnProcessPreD", permission.canConfirmCancel);
}

function setTopButtons() {

    // 기본값
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        // 반출 등록
        case $ND.C_PROCESS_ENTRY:
            // 공통 버튼 활성화 처리
            if ($NC.G_VAR.policyVal.RO210 == $ND.C_YES) {
                $NC.G_VAR.buttons._new = "1";
            }

            if (G_GRDMASTERB.data.getLength() > 0) {
                $NC.G_VAR.buttons._print = "1";
            }
            break;
        // 반출 확정
        case $ND.C_PROCESS_CONFIRM:
            // 공통 버튼 활성화 처리
            if (G_GRDMASTERD.data.getLength() > 0) {
                $NC.G_VAR.buttons._save = "1";
                $NC.G_VAR.buttons._print = "1";
            }
            break;
    }

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function setReportInfo() {

    var PROGRAM_SUB_CD = [];

    // 레포트 세팅
    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        // 반출 등록
        case $ND.C_PROCESS_ENTRY:
            // 현재 프로세스 단계 레포트 추가(현재 출고 등록에 레포트가 없으나 기본 코딩은 함)
            PROGRAM_SUB_CD.push($ND.C_PROCESS_ENTRY);
            break;
        // 반출 확정
        case $ND.C_PROCESS_CONFIRM:
            // 이전 단계 레포트도 출력되도록 추가
            PROGRAM_SUB_CD.push($ND.C_PROCESS_ENTRY);
            // 현재 프로세스 단계 레포트 추가
            PROGRAM_SUB_CD.push($ND.C_PROCESS_CONFIRM);
            break;
    }

    // 프로그램 레포트 정보 세팅
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    $NC.setProgramReportInfo({
        P_PROGRAM_SUB_CD: $NC.toJoin(PROGRAM_SUB_CD),
        P_BU_CD: BU_CD
    });
}

function onGetMasterSummary(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var PROCESS_CD;
    if (dsResult.length == 0) {
        for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
            $NC.setValue("#divProcessCnt" + PROCESS_CD, "0 / 0");
        }
    } else {
        var rowData = dsResult[0];
        var PROCESS_CNT, PROCESS_QTY;
        for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
            PROCESS_CNT = $NC.getDisplayNumber($NC.nullToDefault(rowData["CNT_" + PROCESS_CD], "0"));
            PROCESS_QTY = $NC.getDisplayNumber($NC.nullToDefault(rowData["QTY_" + PROCESS_CD], "0"));

            $NC.setValue("#divProcessCnt" + PROCESS_CD, PROCESS_CNT + " / " + PROCESS_QTY);
        }
    }
}

function onGetProcessInfo(ajaxData) {

    var PROCESS_CD;
    // 버튼 전체 비활성화
    for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
        $NC.setEnable("#btnProcess" + PROCESS_CD, false);
    }

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult.length;
    if (rCount > 0) {
        var rowData;
        // 프로세스 사용 가능여부 세팅
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            $NC.setEnable("#btnProcess" + rowData.PROCESS_CD, rowData.EXEC_PROCESS_YN == $ND.C_YES);
        }

        if ($NC.isEnable("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD)) {
            return;
        }
        // 현재 선택된 프로세스 View가 사용 가능하지 않으면 사용가능한 첫번째 뷰 선택
        for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
            if ($NC.isEnable("#btnProcess" + PROCESS_CD)) {
                $("#btnProcess" + PROCESS_CD).click();
                return;
            }
        }
    }

    $("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD).removeClass("stySelect");
    $("#divSubView" + $NC.G_VAR.activeView.PROCESS_CD).hide();
    // alert($NC.getDisplayMsg("JS.ROC02010E0.015", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록하십시오."));
    $NC.G_VAR.activeView.PROCESS_CD = "";
    $NC.showMessage({
        message: $NC.getDisplayMsg("JS.ROC02010E0.015", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록하십시오."),
        width: 400,
        autoCloseDelayTime: $ND.C_TIMEOUT_CLOSE
    });
}

function setMasterSummaryInfo() {

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);

    // 데이터 조회
    $NC.serviceCall("/ROC02010E0/getDataSet.do", {
        P_QUERY_ID: "ROC02010E0.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_ORDER_DATE1: ORDER_DATE1,
            P_ORDER_DATE2: ORDER_DATE2,
            P_INOUT_CD: INOUT_CD,
            P_VENDOR_CD: VENDOR_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM
        }
    }, onGetMasterSummary);
}

function setMasterProcessInfo() {

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");

    // 데이터 조회
    $NC.serviceCall("/ROC02010E0/getDataSet.do", {
        P_QUERY_ID: "WC.GET_PROCESS_INFO",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_PROCESS_GRP: $ND.C_PROCESS_GRP_RTN_OUT
        }
    }, onGetProcessInfo);
}

function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    }, function() {
        window.grdDetailBOnSetColumns();
        window.grdSubDOnSetColumns();
    });
}

function setProcessStateInfo() {

    for ( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
        $NC.G_VAR.stateFWBW[PROCESS_CD].CONFIRM = "";
        $NC.G_VAR.stateFWBW[PROCESS_CD].CANCEL = "";
    }

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var PROCESS_GRP = $ND.C_PROCESS_GRP_RTN_OUT;

    // 데이터 조회
    $NC.serviceCall("/ROC02010E0/getDataSet.do", {
        P_QUERY_ID: "WC.GET_PROCESS_STATE_FWBW",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_PROCESS_GRP: PROCESS_GRP
        }
    }, onGetProcessState);
}

function onGetProcessState(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if ($NC.isNull(dsResult)) {
        return;
    }

    var rowData;
    for (var rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
        rowData = dsResult[rIndex];
        if (rowData.PROCESS_CD == $ND.C_NULL) {
            $NC.G_VAR.PROCESS_YN = $NC.isNotNull(rowData.PROCESS_STATE_CONFIRM) ? $ND.C_YES : $ND.C_NO;
        } else {
            $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CONFIRM = rowData.PROCESS_STATE_CONFIRM;
            $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CANCEL = rowData.PROCESS_STATE_CANCEL;
        }
    }

    // [처리가능 진행상태] 값이 세팅되기 전 마스터가 자동 조회될 경우
    // 처리가능 프로세스 이미지가 잘못 표시됨(X), 정상 표시되도록 그리드 새로고침
    var grdObject = $NC.getGridObject("G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD);
    if (grdObject.isValid) {
        grdObject.view.invalidate();
    }
}

function getOutboundState(params, onSuccess) {

    // 데이터 조회
    $NC.serviceCall("/ROC02010E0/getData.do", {
        P_QUERY_ID: "WF.GET_RO_OUTBOUND_STATE",
        P_QUERY_PARAMS: params
    }, onSuccess);
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

    // 공급처 조회조건 초기화
    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
    setMasterProcessInfo();
    setPolicyValInfo();
    setProcessStateInfo();
    // 레포트 정보 재세팅
    setReportInfo();
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
 * 검색조건의 공급처 검색 클릭
 */
function showVendorPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showVendorPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_VENDOR_CD: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onVendorPopup, function() {
        $NC.setFocus("#edtQVendor_Cd", true);
    });
}

function onVendorPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQVendor_Cd", resultInfo.VENDOR_CD);
        $NC.setValue("#edtQVendor_Nm", resultInfo.VENDOR_NM);
    } else {
        $NC.setValue("#edtQVendor_Cd");
        $NC.setValue("#edtQVendor_Nm");
        $NC.setFocus("#edtQVendor_Cd", true);
    }
    onChangingCondition();
}
