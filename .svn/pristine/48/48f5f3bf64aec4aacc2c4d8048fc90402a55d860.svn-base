/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC05070Q0
 *  프로그램명         : 상품바코드라벨출력
 *  프로그램설명       : 상품바코드라벨출력 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-11-03
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-11-03    ASETEC           신규작성
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
                "#grdMaster"
            ]
        }
    });

    // 사업부 초기값 설정
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);

    $("#btnQCust_Cd").click(showQCustPopup);
    $("#btnQBrand_Cd").click(showQCustBrandPopup);

    // 그리드 초기화
    grdMasterInitialize();

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo();
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
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CUST_CD":
            $NP.onUserCustChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQCustPopup);
            return;
        case "BRAND_CD":
            $NP.onCustBrandChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_BRAND_CD: val
            }, onQCustBrandPopup);
            return;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05070E0.001", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05070Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05070Q0.001", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }
    var ITEM_NM_YN = $NC.getValue("#chkItem_Nm_Yn");
    var PRINT_DATE_YN = $NC.getValue("#chkPrint_Date_Yn");
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // LABEL_CMC06 - 상품바코드라벨(한진)
        case "LABEL_CMC06":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                valueColumns: "ITEM_CD"
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CUST_CD: CUST_CD,
                P_ITEM_NM_YN: ITEM_NM_YN,
                P_PRINT_DATE_YN: PRINT_DATE_YN
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
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
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "브랜드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC05070Q0.RS_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
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

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = $NC.iif(G_GRDMASTER.data.getLength() > 0, "1", "0");

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */

function showQCustPopup() {

    $NP.showUserCustPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onQCustPopup, function() {
        $NC.setFocus("#edtQCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onQCustPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtQCust_Nm", resultInfo.CUST_NM);
    } else {
        $NC.setValue("#edtQCust_Cd");
        $NC.setValue("#edtQCust_Nm");
        $NC.setFocus("#edtQCust_Cd", true);
    }

    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showQCustBrandPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showCustBrandPopup({
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: $ND.C_ALL
    }, onQCustBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onQCustBrandPopup(resultInfo) {

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
