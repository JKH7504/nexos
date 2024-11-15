/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04060E0
 *  프로그램명         : 공급처상품관리
 *  프로그램설명       : 공급처상품관리 화면 Javascript
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
                grids: null
            };

            switch ($NC.getTabActiveIndex("#divMasterView")) {
                // 공급처기준상품 등록 탭
                case 0:
                    resizeView.grids = "#grdT1Sub";
                    break;
                // 상품기준공급처 등록 탭
                case 1:
                    resizeView.grids = "#grdT2Sub";
                    break;
            }
            return resizeView;
        },
        autoResizeSplitView: function() {
            var resizeView = {
                viewType: "h"
            };

            switch ($NC.getTabActiveIndex("#divMasterView")) {
                // 공급처기준상품 등록 탭
                case 0:
                    resizeView.splitViews = [
                        {
                            container: "#divT1Master",
                            grids: "#grdT1Master",
                            size: 350
                        },
                        {
                            container: "#divT1Detail",
                            grids: "#grdT1Detail"
                        }
                    ];
                    break;
                // 상품기준공급처 등록 탭
                case 1:
                    resizeView.splitViews = [
                        {
                            container: "#divT2Master",
                            grids: "#grdT2Master"
                        },
                        {
                            container: "#divT2Detail",
                            grids: "#grdT2Detail",
                            size: 350
                        }
                    ];
                    resizeView.exceptHeight = $NC.getViewHeight("#divTopView");
                    break;
            }
            return resizeView;
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);
    $NC.setValueRadioGroup("rgbQSelect_Div", "1");

    $("#btnQCust_Cd").click(showQCustPopup);
    $("#btnQBrand_Cd").click(showCustBrandPopup);
    $("#btnQVendor_Cd").click(showVendorPopup);

    $("#btnT1AddItem").click(btnT1AddItemOnClick);
    $("#btnT2AddVendor").click(btnT2AddVendorOnClick);

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT1SubInitialize();
    grdT2MasterInitialize();
    grdT2DetailInitialize();
    grdT2SubInitialize();

    setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divT1TabSheetView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.fixedT1MasterWidth = 350;
    $NC.G_OFFSET.fixedT2MasterWidth = 350;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = false;

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        enable = G_GRDT1DETAIL.data.getLength() > 0;
        $NC.setEnable("#btnT1AddItem", permission.canSave && enable);
    } else {
        enable = G_GRDT2DETAIL.data.getLength() > 0;
        $NC.setEnable("#btnT2AddVendor", permission.canSave && enable);
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
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, null, false);
            break;
    }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CUST_CD":
            $NP.onCustChange(val, {
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQCustPopup);
            return;
        case "BRAND_CD":
            $NP.onCustBrandChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_BRAND_CD: val
            }, onCustBrandPopup);
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

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT1SUB);
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.clearGridData(G_GRDT2DETAIL);
    $NC.clearGridData(G_GRDT2SUB);

    setUserProgramPermission();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04060E0.001", "고객사를 먼저 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
    var SELECT_DIV = $NC.getValueRadioGroup("rgbQSelect_Div");

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_CUST_CD: CUST_CD,
            P_VENDOR_CD: VENDOR_CD
        };
        // 데이터 조회
        $NC.serviceCall("/CMC04060E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    } else {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_CUST_CD: CUST_CD,
            P_BRAND_CD: BRAND_CD,
            P_SELECT_DIV: SELECT_DIV
        };
        // 데이터 조회
        $NC.serviceCall("/CMC04060E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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

    var dsMaster, rowData, rIndex, rCount;
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        if (G_GRDT1SUB.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.002", "저장할 데이터가 없습니다."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDT1SUB)) {
            return;
        }

        dsMaster = [ ];
        for (rIndex = 0, rCount = G_GRDT1SUB.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDT1SUB.data.getItem(rIndex);
            if (rowData.CRUD != $ND.C_DV_CRUD_U) {
                continue;
            }
            dsMaster.push({
                P_BRAND_CD: rowData.BRAND_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_CUST_CD: rowData.CUST_CD,
                P_VENDOR_CD: rowData.VENDOR_CD,
                P_BUY_PRICE: rowData.BUY_PRICE,
                P_REQUEST_UNIT_DIV: rowData.REQUEST_UNIT_DIV,
                P_REQUEST_UNIT_QTY: rowData.REQUEST_UNIT_QTY,
                P_DEAL_DIV: rowData.DEAL_DIV,
                P_OPEN_DATE: rowData.OPEN_DATE,
                P_CLOSE_DATE: rowData.CLOSE_DATE,
                P_CRUD: rowData.CRUD
            });
        }

        if (dsMaster.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.003", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/CMC04060E0/save.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave);
    } else {

        if (G_GRDT2SUB.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.002", "저장할 데이터가 없습니다."));
            return;
        }

        // 현재 선택된 로우 Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDT2SUB)) {
            return;
        }

        // 저장시 추가로 발주비율 100%인지 체크
        var SUM_REQUEST_QTY_RATE = $NC.getGridSumVal(G_GRDT2SUB, {
            searchKey: null,
            searchVal: null,
            sumKey: "REQUEST_QTY_RATE",
            isAllData: true
        });

        if (SUM_REQUEST_QTY_RATE != 100) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.004", "발주비율은 100%가 되어야 합니다."));
            return;
        }

        dsMaster = [ ];
        for (rIndex = 0, rCount = G_GRDT2SUB.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDT2SUB.data.getItem(rIndex);
            if (rowData.CRUD != $ND.C_DV_CRUD_U) {
                continue;
            }
            dsMaster.push({
                P_BRAND_CD: rowData.BRAND_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_CUST_CD: rowData.CUST_CD,
                P_VENDOR_CD: rowData.VENDOR_CD,
                P_BUY_PRICE: rowData.BUY_PRICE,
                P_REQUEST_QTY_RATE: rowData.REQUEST_QTY_RATE,
                P_REQUEST_UNIT_DIV: rowData.REQUEST_UNIT_DIV,
                P_REQUEST_UNIT_QTY: rowData.REQUEST_UNIT_QTY,
                P_DEAL_DIV: rowData.DEAL_DIV,
                P_OPEN_DATE: rowData.OPEN_DATE,
                P_CLOSE_DATE: rowData.CLOSE_DATE,
                P_CRUD: rowData.CRUD
            });
        }

        if (dsMaster.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.003", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/CMC04060E0/save.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave);
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var searchRows, dsMaster, rowData, rIndex, rCount;
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        if (G_GRDT1SUB.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.005", "삭제할 데이터가 없습니다."));
            return;
        }

        searchRows = $NC.getGridSearchRows(G_GRDT1SUB, {
            searchKey: "CHECK_YN",
            searchVal: $ND.C_YES
        });

        if (searchRows.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.007", "삭제할 데이터를 선택하십시오."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC04060E0.006", "삭제 하시겠습니까?"))) {
            return;
        }

        dsMaster = [ ];
        for (rIndex = 0, rCount = searchRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDT1SUB.data.getItem(searchRows[rIndex]);
            dsMaster.push({
                P_BRAND_CD: rowData.BRAND_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_CUST_CD: rowData.CUST_CD,
                P_VENDOR_CD: rowData.VENDOR_CD,
                P_CRUD: $ND.C_DV_CRUD_D
            });
        }

        $NC.serviceCall("/CMC04060E0/save.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave);
    } else {

        if (G_GRDT2SUB.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.005", "삭제할 데이터가 없습니다."));
            return;
        }

        searchRows = $NC.getGridSearchRows(G_GRDT2SUB, {
            searchKey: "CHECK_YN",
            searchVal: $ND.C_YES
        });

        if (searchRows.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.007", "삭제할 데이터를 선택하십시오."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC04060E0.006", "삭제 하시겠습니까?"))) {
            return;
        }

        dsMaster = [ ];
        for (rIndex = 0, rCount = searchRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDT2SUB.data.getItem(searchRows[rIndex]);
            dsMaster.push({
                P_BRAND_CD: rowData.BRAND_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_CUST_CD: rowData.CUST_CD,
                P_VENDOR_CD: rowData.VENDOR_CD,
                P_CRUD: $ND.C_DV_CRUD_D
            });
        }

        $NC.serviceCall("/CMC04060E0/save.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave);
    }
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
    if (tabActiveIndex == 0) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT1TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT1TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT1TabSheetView", "h", 300);
        }
    } else if (tabActiveIndex == 1) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT2TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT2TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT2TabSheetView", "h", 300);
        }
    }
    onChangingCondition();
}

function grdT1MasterOnGetColumns() {

    var columns = [ ];
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "CMC04060E0.RS_T1_MASTER",
        sortCol: "VENDOR_CD",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    // 상품마스터 변수 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);
    onGetT1Detail({
        data: null
    });

    // 상품마스터 파라메터 세팅
    G_GRDT1DETAIL.queryParams = {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: BRAND_CD,
        P_VENDOR_CD: rowData.VENDOR_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04060E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

    // 공급처별 할당상품 변수 초기화
    $NC.setInitGridVar(G_GRDT1SUB);
    onGetT1Sub({
        data: null
    });

    // 공급처별 할당상품 파라메터 세팅
    G_GRDT1SUB.queryParams = {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: BRAND_CD,
        P_VENDOR_CD: rowData.VENDOR_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04060E0/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1DetailOnGetColumns() {

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
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "CMC04060E0.RS_T1_DETAIL",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onHeaderClick.subscribe(grdT1DetailOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDT1DETAIL, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDT1DETAIL, e, args, null, false);
            break;
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

function grdT1SubOnGetColumns() {

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
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "REQUEST_UNIT_DIV_F",
        field: "REQUEST_UNIT_DIV_F",
        name: "발주단위구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "REQUEST_UNIT_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "REQUEST_UNIT_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        })
    });
    $NC.setGridColumn(columns, {
        id: "REQUEST_UNIT_QTY",
        field: "REQUEST_UNIT_QTY",
        name: "최소발주단위수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
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

function grdT1SubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Sub", {
        columns: grdT1SubOnGetColumns(),
        queryId: "CMC04060E0.RS_T1_SUB",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT1SUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
    G_GRDT1SUB.view.onCellChange.subscribe(grdT1SubOnCellChange);
    G_GRDT1SUB.view.onHeaderClick.subscribe(grdT1SubOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDT1SUB, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT1SubOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDT1SUB, e, args, null, false);
            break;
    }
}

function grdT1SubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1SUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1SUB, row + 1);
}

function grdT1SubOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDT1SUB.view.getColumnId(args.cell)) {
        case "OPEN_DATE":
            if ($NC.isNotNull(rowData.OPEN_DATE)) {
                if (!$NC.isDate(rowData.OPEN_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04060E0.008", "거래일자를 정확히 입력하십시오."));
                    rowData.OPEN_DATE = "";
                    $NC.setFocusGrid(G_GRDT1SUB, args.row, args.cell, true);
                } else {
                    rowData.OPEN_DATE = $NC.getDate(rowData.OPEN_DATE);
                }
            }
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(rowData.CLOSE_DATE)) {
                if (!$NC.isDate(rowData.CLOSE_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04060E0.009", "종료일자를 정확히 입력하십시오."));
                    rowData.CLOSE_DATE = "";
                    $NC.setFocusGrid(G_GRDT1SUB, args.row, args.cell, true);
                } else {
                    rowData.CLOSE_DATE = $NC.getDate(rowData.CLOSE_DATE);
                }
            }
            break;
        case "BUY_PRICE":
            if (isNaN(rowData.BUY_PRICE)) {
                rowData.BUY_PRICE = "0";
            }
            break;
        case "REQUEST_UNIT_QTY":
            if (isNaN(rowData.REQUEST_UNIT_QTY)) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.010", "발주단위수량을 정확히 입력하십시오."));
                rowData.REQUEST_UNIT_QTY = args.oldItem.REQUEST_UNIT_QTY;
                $NC.setFocusGrid(G_GRDT1SUB, args.row, args.cell, true);
            } else if (Number(rowData.REQUEST_UNIT_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.011", "최소발주단위수량은 1보다 작을 수 없습니다."));
                rowData.REQUEST_UNIT_QTY = args.oldItem.REQUEST_UNIT_QTY;
                $NC.setFocusGrid(G_GRDT1SUB, args.row, args.cell, true);
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1SUB, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdT1SubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1SUB, row)) {
        return true;
    }

    var rowData = G_GRDT1SUB.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.REQUEST_UNIT_QTY)) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.012", "발주단위수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1SUB, G_GRDT1SUB.lastRow, "REQUEST_UNIT_QTY", true);
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.XXX", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setFocusGrid(G_GRDT1SUB, row, "CLOSE_DATE", true);
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1SUB, rowData);
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
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CNT",
        field: "VENDOR_CNT",
        name: "복수공급처",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "CMC04060E0.RS_T2_MASTER",
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
    var rowData = G_GRDT2MASTER.data.getItem(row);

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    // 상품마스터 변수 초기화
    $NC.setInitGridVar(G_GRDT2DETAIL);
    onGetT2Detail({
        data: null
    });

    // 상품마스터 파라메터 세팅
    G_GRDT2DETAIL.queryParams = {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04060E0/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

    // 공급처별 할당상품 변수 초기화
    $NC.setInitGridVar(G_GRDT2SUB);
    onGetT2Sub({
        data: null
    });

    // 공급처별 할당상품 파라메터 세팅
    G_GRDT2SUB.queryParams = {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04060E0/getDataSet.do", $NC.getGridParams(G_GRDT2SUB), onGetT2Sub);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}
function grdT2DetailOnGetColumns() {

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
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Detail", {
        columns: grdT2DetailOnGetColumns(),
        queryId: "CMC04060E0.RS_T2_DETAIL",
        sortCol: "VENDOR_CD",
        gridOptions: options
    });

    G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
    G_GRDT2DETAIL.view.onHeaderClick.subscribe(grdT2DetailOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDT2DETAIL, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT2DetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDT2DETAIL, e, args, null, false);
            break;
    }
}

function grdT2DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2DETAIL, row + 1);
}

function grdT2SubOnGetColumns() {

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
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "REQUEST_QTY_RATE",
        field: "REQUEST_QTY_RATE",
        name: "발주비율(%)",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions("FLOAT")
    });
    $NC.setGridColumn(columns, {
        id: "REQUEST_UNIT_DIV_F",
        field: "REQUEST_UNIT_DIV_F",
        name: "발주단위구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "REQUEST_UNIT_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "REQUEST_UNIT_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        })
    });
    $NC.setGridColumn(columns, {
        id: "REQUEST_UNIT_QTY",
        field: "REQUEST_UNIT_QTY",
        name: "최소발주단위수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
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

function grdT2SubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Sub", {
        columns: grdT2SubOnGetColumns(),
        queryId: "CMC04060E0.RS_T2_SUB",
        sortCol: "VENDOR_CD",
        gridOptions: options
    });

    G_GRDT2SUB.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
    G_GRDT2SUB.view.onCellChange.subscribe(grdT2SubOnCellChange);
    G_GRDT2SUB.view.onHeaderClick.subscribe(grdT2SubOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDT2SUB, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT2SubOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDT2SUB, e, args, null, false);
            break;
    }
}

function grdT2SubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2SUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2SUB, row + 1);
}

function grdT2SubOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDT2SUB.view.getColumnId(args.cell)) {
        case "OPEN_DATE":
            if ($NC.isNotNull(rowData.OPEN_DATE)) {
                if (!$NC.isDate(rowData.OPEN_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04060E0.008", "거래일자를 정확히 입력하십시오."));
                    rowData.OPEN_DATE = "";
                    $NC.setFocusGrid(G_GRDT2SUB, args.row, args.cell, true);
                } else {
                    rowData.OPEN_DATE = $NC.getDate(rowData.OPEN_DATE);
                }
            }
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(rowData.CLOSE_DATE)) {
                if (!$NC.isDate(rowData.CLOSE_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04060E0.009", "종료일자를 정확히 입력하십시오."));
                    rowData.CLOSE_DATE = "";
                    $NC.setFocusGrid(G_GRDT2SUB, args.row, args.cell, true);
                } else {
                    rowData.CLOSE_DATE = $NC.getDate(rowData.CLOSE_DATE);
                }
            }
            break;
        case "BUY_PRICE":
            if (isNaN(rowData.BUY_PRICE)) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.013", "매입금액을 정확히 입력하십시오."));
                rowData.BUY_PRICE = "0";
                $NC.setFocusGrid(G_GRDT2SUB, args.row, args.cell, true);
            }
            break;
        case "REQUEST_QTY_RATE":
            if (isNaN(rowData.REQUEST_QTY_RATE)) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.014", "발주비율을 정확히 입력하십시오."));
                rowData.REQUEST_QTY_RATE = args.oldItem.REQUEST_QTY_RATE;
                $NC.setFocusGrid(G_GRDT2SUB, args.row, args.cell, true);
            } else if (Number(rowData.REQUEST_QTY_RATE) > 100) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.015", "발주비율은 100보다 클수 없습니다."));
                rowData.REQUEST_QTY_RATE = args.oldItem.REQUEST_QTY_RATE;
                $NC.setFocusGrid(G_GRDT2SUB, args.row, args.cell, true);
            }
            break;
        case "REQUEST_UNIT_QTY":
            if (isNaN(rowData.REQUEST_UNIT_QTY)) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.016", "발주단위수량을 정확히 입력하십시오."));
                rowData.REQUEST_UNIT_QTY = args.oldItem.REQUEST_UNIT_QTY;
                $NC.setFocusGrid(G_GRDT2SUB, args.row, args.cell, true);
            } else if (Number(rowData.REQUEST_UNIT_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.017", "발주단위수량은 1보다 작을 수 없습니다."));
                rowData.REQUEST_UNIT_QTY = args.oldItem.REQUEST_UNIT_QTY;
                $NC.setFocusGrid(G_GRDT2SUB, args.row, args.cell, true);
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT2SUB, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdT2SubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT2SUB, row)) {
        return true;
    }

    var rowData = G_GRDT2SUB.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.REQUEST_QTY_RATE)) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.014", "발주비율을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT2SUB, row, "REQUEST_QTY_RATE", true);
            return false;
        }
        if ($NC.isNull(rowData.REQUEST_UNIT_QTY)) {
            alert($NC.getDisplayMsg("JS.CMC04060E0.018", "최소발주단위수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT2SUB, G_GRDT2SUB.lastRow, "REQUEST_UNIT_QTY", true);
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC04060E0.XXX", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setFocusGrid(G_GRDT2SUB, row, "CLOSE_DATE", true);
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT2SUB, rowData);
    return true;
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, "VENDOR_CD", true)) {
        // 상품마스터 초기화
        $NC.setInitGridVar(G_GRDT1DETAIL);
        onGetT1Detail({
            data: null
        });

        // 공급처별 할당상품 초기화
        $NC.setInitGridVar(G_GRDT1SUB);
        onGetT1Sub({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL);

    setUserProgramPermission();
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Sub(ajaxData) {

    $NC.setInitGridData(G_GRDT1SUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1SUB, "ITEM_CD");
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT2MASTER, "ITEM_CD", true)) {
        // 상품마스터 초기화
        $NC.setInitGridVar(G_GRDT2DETAIL);
        onGetT2Detail({
            data: null
        });

        // 공급처별 할당상품 초기화
        $NC.setInitGridVar(G_GRDT2SUB);
        onGetT2Sub({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2DETAIL);

    setUserProgramPermission();
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Sub(ajaxData) {

    $NC.setInitGridData(G_GRDT2SUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2SUB, [
        "VENDOR_CD",
        "ITEM_CD"
    ]);
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showQCustPopup() {

    $NP.showCustPopup({
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
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setValue("#edtQVendor_Cd");
        $NC.setValue("#edtQVendor_Nm");
    } else {
        $NC.setValue("#edtQCust_Cd");
        $NC.setValue("#edtQCust_Nm");
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setValue("#edtQVendor_Cd");
        $NC.setValue("#edtQVendor_Nm");
        $NC.setFocus("#edtQCust_Cd", true);
    }
    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showCustBrandPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showCustBrandPopup({
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: $ND.C_ALL
    }, onCustBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onCustBrandPopup(resultInfo) {

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
 * 검색조건의 공급처 검색 이미지 클릭
 */
function showVendorPopup() {

    $NP.showVendorPopup({
        queryParams: {
            P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
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

/**
 * 상품추가
 */
function btnT1AddItemOnClick() {

    if (G_GRDT1DETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04060E0.019", "추가할 데이터가 없습니다."));
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04060E0.001", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    // 선택 데이터 가져오기
    var checkedData = $NC.getGridCheckedValues(G_GRDT1DETAIL, {
        valueColumns: function(rowData) {
            return rowData.BRAND_CD + ";" + rowData.ITEM_CD;
        }
    });

    if (checkedData.values.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04060E0.020", "추가 상품을 선택하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC04060E0.021", "상품을 추가 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    $NC.serviceCall("/CMC04060E0/callVendorItemAddItem.do", {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: rowData.VENDOR_CD,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onAddItem);
}

function onAddItem(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: "VENDOR_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
}

/**
 * 공급처추가
 */
function btnT2AddVendorOnClick() {

    if (G_GRDT2DETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04060E0.019", "추가할 데이터가 없습니다."));
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04060E0.001", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    // 선택 데이터 가져오기
    var checkedData = $NC.getGridCheckedValues(G_GRDT2DETAIL, {
        valueColumns: "VENDOR_CD"
    });

    if (checkedData.values.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04060E0.020", "추가 상품을 선택하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC04060E0.022", "공급처를 추가 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);
    $NC.serviceCall("/CMC04060E0/callVendorItemAddVendor.do", {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onAddVendor);
}

function onAddVendor(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
        selectKey: "ITEM_CD"
    });
    _Inquiry();
    G_GRDT2MASTER.lastKeyVal = lastKeyVal;
}

function onSave(ajaxData) {

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
            selectKey: "VENDOR_CD"
        });
        var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1SUB, {
            selectKey: "ITEM_CD"
        });
        _Inquiry();
        G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
        G_GRDT1SUB.lastKeyVal = lastKeyVal2;
    } else {

        var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
            selectKey: "ITEM_CD"
        });
        var lastKeyVal4 = $NC.getGridLastKeyVal(G_GRDT2SUB, {
            selectKey: [
                "VENDOR_CD",
                "ITEM_CD"
            ]
        });
        _Inquiry();
        G_GRDT2MASTER.lastKeyVal = lastKeyVal3;
        G_GRDT2SUB.lastKeyVal = lastKeyVal4;
    }
}