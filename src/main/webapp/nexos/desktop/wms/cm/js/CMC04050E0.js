/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04050E0
 *  프로그램명         : 물류센터상품관리
 *  프로그램설명       : 물류센터상품관리 화면 Javascript
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

            // 물류센터상품 등록 탭
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = [
                    "#grdT1Master",
                    "#grdT1Detail"
                ];
            }
            // 물류센터상품 내역 탭
            else {
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

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $NC.setEnable("#btnEntryXLS", false);
    $NC.setEnable("#btnItemAllocate", false);
    $NC.setEnable("#btnAllocate", false);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQVendor_Cd").click(showVendorPopup);
    $("#btnEntryXLS").click(btnEntryXLSOnClick);
    $("#btnItemAllocate").click(btnItemAllocateOnClick);
    $("#btnAllocate").click(btnAllocateOnClick);

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT2MasterInitialize();

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

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

    $NC.setInitSplitter("#divT1TabSheetView", "hb", $NC.G_OFFSET.bottomViewHeight);
}

function _SetResizeOffset() {

    $NC.G_OFFSET.bottomViewHeight = 200;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

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
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, null, false);
            break;
    }
}

/**
 * Input, Select Change Event 처리
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
        case "VENDOR_CD":
            $NP.onVendorChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_VENDOR_CD: val,
                P_VIEW_DIV: "2"
            }, onVendorPopup);
            return;
    }

    // 화면클리어
    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT2MASTER);

    $NC.setEnable("#btnEntryXLS", false);
    $NC.setEnable("#btnItemAllocate", false);
    $NC.setEnable("#btnAllocate", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_NO;
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_NO;
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

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";

    // 물류센터상품 등록 탭
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT1TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT1TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT1TabSheetView", "hb", $NC.G_OFFSET.bottomViewHeight);
        }

        if ($NC.G_VAR.T1_INQUIRY_YN == $ND.C_YES) {
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "1";
        }
    } else {
        $NC.onGlobalResize();
    }

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);

    // 물류센터상품 등록
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_VENDOR_CD: VENDOR_CD
        };
        // 데이터 조회
        $NC.serviceCall("/CMC04050E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    }
    // 물류센터상품 내역
    else {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_VENDOR_CD: VENDOR_CD
        };
        // 데이터 조회
        $NC.serviceCall("/CMC04050E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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

    if (G_GRDT1MASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.002", "저장할 데이터가 없습니다."));
        return;
    }

    if (G_GRDT1MASTER.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
            return;
        }
    } else if (G_GRDT1DETAIL.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
            return;
        }
    }

    var dsMaster = [ ];
    var dsDetail = [ ];
    var rowData, rIndex, rCount;

    for (rIndex = 0, rCount = G_GRDT1MASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1MASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_DCTC_DIV: rowData.DCTC_DIV,
            P_REQUEST_MNG_DIV: rowData.REQUEST_MNG_DIV,
            P_FILL_LIMIT_DAY: rowData.FILL_LIMIT_DAY,
            P_BASE_OP_DAY: rowData.BASE_OP_DAY,
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
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_REASONABLE_QTY: rowData.REASONABLE_QTY,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0 && dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.003", "데이터를 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC04050E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDT1MASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.004", "삭제할 데이터가 없습니다."));
        return;
    }

    var searchRows = $NC.getGridSearchRows(G_GRDT1MASTER, {
        searchKey: "CHECK_YN",
        searchVal: $ND.C_YES
    });

    if (searchRows.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.006", "삭제할 데이터를 선택하십시오."));
        return;
    }
    if (!confirm($NC.getDisplayMsg("JS.CMC04050E0.005", "삭제 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [ ];
    var dsDetail = [ ];
    var rowData;
    for (var rIndex = 0, rCount = searchRows.length; rIndex < rCount; rIndex++) {
        rowData = G_GRDT1MASTER.data.getItem(searchRows[rIndex]);
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_CRUD: $ND.C_DV_CRUD_D
        });
    }

    $NC.serviceCall("/CMC04050E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: "ITEM_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
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

function grdT1MasterOnGetColumns() {

    var columns = [ ];
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
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DCTC_DIV_F",
        field: "DCTC_DIV_F",
        name: "발주상품구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "DCTC_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "DCTC_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "REQUEST_MNG_DIV_F",
        field: "REQUEST_MNG_DIV_F",
        name: "발주관리구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "REQUEST_MNG_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "REQUEST_MNG_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "FILL_LIMIT_DAY",
        field: "FILL_LIMIT_DAY",
        name: "보충기한일수",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions("INT")
    });
    $NC.setGridColumn(columns, {
        id: "BASE_OP_DAY",
        field: "BASE_OP_DAY",
        name: "기준운영일수",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions("INT")
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "CMC04050E0.RS_T1_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });
    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onCellChange.subscribe(grdT1MasterOnCellChange);
    G_GRDT1MASTER.view.onHeaderClick.subscribe(grdT1MasterOnHeaderClick);
    G_GRDT1MASTER.view.onFocus.subscribe(grdT1MasterOnFocus);
    $NC.setGridColumnHeaderCheckBox(G_GRDT1MASTER, "CHECK_YN");

    // 최초 조회시 포커스 처리
    G_GRDT1MASTER.focused = true;
}

function grdT1MasterOnFocus(e, args) {

    if (G_GRDT1MASTER.focused) {
        return;
    }
    G_GRDT1MASTER.focused = true;
    G_GRDT1DETAIL.focused = false;

    if (G_GRDT1DETAIL.view.getEditorLock().isActive()) {
        G_GRDT1DETAIL.view.getEditorLock().commitCurrentEdit();
    }
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);

    // 상품마스터 변수 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);

    G_GRDT1DETAIL.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04050E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1MasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDT1MASTER.view.getColumnId(args.cell)) {
        case "FILL_LIMIT_DAY":
            if (isNaN(rowData.FILL_LIMIT_DAY)) {
                rowData.FILL_LIMIT_DAY = "0";
            }
            break;
        case "BASE_OP_DAY":
            if (isNaN(rowData.BASE_OP_DAY)) {
                rowData.BASE_OP_DAY = "0";
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDT1MASTER, e, args, null, false);
            break;
    }
}

function grdT1DetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "REASONABLE_QTY",
        field: "REASONABLE_QTY",
        name: "적정재고수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "LEADTIME_DAY",
        field: "LEADTIME_DAY",
        name: "리드타임일수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "LEADTIME_STOCK_QTY",
        field: "LEADTIME_STOCK_QTY",
        name: "리드타임대응재고수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "SAFETY_QTY",
        field: "SAFETY_QTY",
        name: "안전재고수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "MAX_REQUEST_QTY",
        field: "MAX_REQUEST_QTY",
        name: "최대발주수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "MON3_OUT_QTY",
        field: "MON3_OUT_QTY",
        name: "출하수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "MON3_OUT_DAY",
        field: "MON3_OUT_DAY",
        name: "출하일수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "DAYAVG_OUT_QTY",
        field: "DAYAVG_OUT_QTY",
        name: "일평균출하수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "MONAVG_OUT_DAY",
        field: "MONAVG_OUT_DAY",
        name: "월평균출하일수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "OUT_CYCLE_DAY",
        field: "OUT_CYCLE_DAY",
        name: "출하주기(일수)",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "STD_DEVIATION",
        field: "STD_DEVIATION",
        name: "표준편차",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "SF_QTY",
        field: "SF_QTY",
        name: "안전계수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_F",
        field: "DEAL_DIV_F",
        name: "거래구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "DEAL_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "DEAL_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래시작일자",
        editor: Slick.Editors.Date,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        editor: Slick.Editors.Date,
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "CMC04050E0.RS_T1_DETAIL",
        sortCol: "BU_CD",
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onCellChange.subscribe(grdT1DetailOnCellChange);
    G_GRDT1DETAIL.view.onFocus.subscribe(grdT1DetailOnFocus);
}

function grdT1DetailOnFocus(e, args) {

    if (G_GRDT1DETAIL.focused) {
        return;
    }
    G_GRDT1MASTER.focused = false;
    G_GRDT1DETAIL.focused = true;

    if (G_GRDT1MASTER.view.getEditorLock().isActive()) {
        G_GRDT1MASTER.view.getEditorLock().commitCurrentEdit();
    }
}

function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function grdT1DetailOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDT1DETAIL.view.getColumnId(args.cell)) {
        case "OPEN_DATE":
            if ($NC.isNotNull(rowData.OPEN_DATE)) {
                if (!$NC.isDate(rowData.OPEN_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04050E0.007", "거래일자를 정확히 입력하십시오."));
                    rowData.OPEN_DATE = "";
                    $NC.setFocusGrid(G_GRDT1DETAIL, args.row, args.cell, true);
                } else {
                    rowData.OPEN_DATE = $NC.getDate(rowData.OPEN_DATE);
                }
            }
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(rowData.CLOSE_DATE)) {
                if (!$NC.isDate(rowData.CLOSE_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04050E0.008", "종료일자를 정확히 입력하십시오."));
                    rowData.CLOSE_DATE = "";
                    $NC.setFocusGrid(G_GRDT1DETAIL, args.row, args.row, args.cell, true);
                } else {
                    rowData.CLOSE_DATE = $NC.getDate(rowData.CLOSE_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1DETAIL, rowData);
}

function grdT1DetailOnBeforePost(row) {

    var rowData = G_GRDT1DETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC04050E0.XXX", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setFocusGrid(G_GRDT1DETAIL, row, "CLOSE_DATE", true);
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1DETAIL, rowData);
    return true;
}

function grdT2MasterOnGetColumns() {

    var columns = [ ];
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
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DCTC_DIV_F",
        field: "DCTC_DIV_F",
        name: "발주상품구분"
    });
    $NC.setGridColumn(columns, {
        id: "REQUEST_MNG_DIV_F",
        field: "REQUEST_MNG_DIV_F",
        name: "발주관리구분"
    });
    $NC.setGridColumn(columns, {
        id: "FILL_LIMIT_DAY",
        field: "FILL_LIMIT_DAY",
        name: "보충기한일수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BASE_OP_DAY",
        field: "BASE_OP_DAY",
        name: "기준운영일수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "MON3_OUT_QTY",
        field: "MON3_OUT_QTY",
        name: "출하수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "MON3_OUT_DAY",
        field: "MON3_OUT_DAY",
        name: "출하일수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "DAYAVG_OUT_QTY",
        field: "DAYAVG_OUT_QTY",
        name: "일평균출하수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "MONAVG_OUT_DAY",
        field: "MONAVG_OUT_DAY",
        name: "월평균출하일수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "OUT_CYCLE_DAY",
        field: "OUT_CYCLE_DAY",
        name: "출하주기(일수)",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "STD_DEVIATION",
        field: "STD_DEVIATION",
        name: "표준편차",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "SF_QTY",
        field: "SF_QTY",
        name: "안전계수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "LEADTIME_DAY",
        field: "LEADTIME_DAY",
        name: "리드타임일수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "LEADTIME_STOCK_QTY",
        field: "LEADTIME_STOCK_QTY",
        name: "리드타임대응재고수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "SAFETY_QTY",
        field: "SAFETY_QTY",
        name: "안전재고수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "REASONABLE_QTY",
        field: "REASONABLE_QTY",
        name: "적정재고수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "MAX_REQUEST_QTY",
        field: "MAX_REQUEST_QTY",
        name: "최대발주수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_F",
        field: "DEAL_DIV_F",
        name: "거래구분"
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "CMC04050E0.RS_T2_MASTER",
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

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: "ITEM_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
}

function btnItemAllocateOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.009", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC04051P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC04051P0.001", "상품개별등록"),
        url: "cm/CMC04051P0.html",
        width: 800,
        height: 500,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD
        },
        onOk: function() {
            _Inquiry();
        }
    });
}

function btnAllocateOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);

    if (!confirm($NC.getDisplayMsg("JS.CMC04050E0.010", "전체등록 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/CMC04050E0/callCenterItemAllocate.do", {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onAllocate);
}

function onAllocate(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    _Inquiry();
}

function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, "ITEM_CD", G_GRDT1MASTER.focused)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDT1DETAIL);
        onGetT1Detail({
            data: null
        });
    }
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_YES;

    $NC.setEnable("#btnEntryXLS");
    $NC.setEnable("#btnItemAllocate");
    $NC.setEnable("#btnAllocate");

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL, "BU_CD", G_GRDT1DETAIL.focused);
}

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
    // 공급처 조회조건 초기화
    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 공급처 검색 팝업 클릭
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

/**
 * 공급처 검색 결과
 * 
 * @param resultInfo
 */
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

function btnEntryXLSOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04050E0.009", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var BU_NM = $NC.getValue("#edtQBu_Nm");

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC04052P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC04052P0.001", "엑셀 등록"),
        url: "cm/CMC04052P0.html",
        width: 1024,
        height: 610,
        resizeable: false,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_BU_CD: BU_CD,
            P_BU_NM: BU_NM
        },
        onOk: function() {
            _Inquiry();
        }
    });
}