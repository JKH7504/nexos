/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04080E0
 *  프로그램명         : 어소트구성관리
 *  프로그램설명       : 어소트구성관리 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-04-05
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-04-05    ASETEC           신규작성
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
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQBrand_Cd", $NC.G_USERINFO.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", $NC.G_USERINFO.BRAND_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 이벤트 연결
    $("#btnQBrand_Cd").click(showUserBrandPopup);
    $("#btnQVendor_Cd").click(showVenderPopup);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
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
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 - 연도구분 세팅
        $NC.setInitComboData({
            selector: "#cboQYear_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_YEAR_DIV),
            addAll: true,
            multiSelect: true,
            onComplete: function() {
                $NC.setValue("#cboQYear_Div", 0);
            }
        });
        // 조회조건 - 시즌구분 세팅
        $NC.setInitComboData({
            selector: "#cboQSeason_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SEASON_DIV),
            addAll: true,
            multiSelect: true
        });
    });
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

    $NC.setInitSplitter("#divMasterView", "vr", 500);
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

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BRAND_CD":
            $NP.onUserBrandChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BRAND_CD: val
            }, onUserBrandPopup);
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

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAIL);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    if ($NC.isNull(BRAND_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04080E0.001", "브랜드를 먼저 입력하십시오."));
        $NC.setFocus("#edtQBrand_Cd");
        return;
    }

    var ASSORT_CD = $NC.getValue("#edtQAssort_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
    var YEAR_DIV = $NC.getValue("#cboQYear_Div");
    var SEASON_DIV = $NC.getValue("#cboQSeason_Div");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_BRAND_CD: BRAND_CD,
        P_ASSORT_CD: ASSORT_CD,
        P_ITEM_CD: ITEM_CD,
        P_VENDOR_CD: VENDOR_CD,
        P_YEAR_DIV: YEAR_DIV,
        P_SEASON_DIV: SEASON_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04080E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04080E0.002", "저장할 데이터가 없습니다."));
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04080E0.004", "구성상품 등록 후 저장하십시오"));
        $NC.setFocusGrid(G_GRDDETAIL);
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var dsCU = [];
    var dsD = [];
    var dsMaster, dsDetail, rowData, rIndex, rCount;
    // 어소트 수정/삭제 건
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        // 신규 없음, 수정/삭제만 존재
        if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsMaster = dsD;
        } else {
            dsMaster = dsCU;
        }
        dsMaster.push({
            P_BRAND_CD: rowData.BRAND_CD,
            P_ASSORT_CD: rowData.ASSORT_CD,
            P_CUST_CD: rowData.CUST_CD,
            P_VENDOR_CD: rowData.VENDOR_CD,
            P_MULTI_STYLE_YN: rowData.MULTI_STYLE_YN,
            P_PACK_DIV: rowData.PACK_DIV,
            P_SORTER_PUT_YN: rowData.SORTER_PUT_YN,
            P_CRUD: rowData.CRUD
        });
    }
    dsMaster = dsD.concat(dsCU);

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    dsCU = [];
    dsD = [];
    // 어소트 구성품 수정/삭제 건
    for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsDetail = dsD;
        } else {
            dsDetail = dsCU;
        }
        dsDetail.push({
            P_BRAND_CD: refRowData.BRAND_CD,
            P_ASSORT_CD: refRowData.ASSORT_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_CONS_QTY: rowData.CONS_QTY,
            P_CUST_CD: refRowData.CUST_CD,
            P_VENDOR_CD: refRowData.VENDOR_CD,
            P_MULTI_STYLE_YN: refRowData.MULTI_STYLE_YN,
            P_PACK_DIV: refRowData.PACK_DIV,
            P_SORTER_PUT_YN: refRowData.SORTER_PUT_YN,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }
    dsDetail = dsD.concat(dsCU);

    // 어소트 정보 수정/삭제 처리 후 어소트 구성품 정보 처리하도록 배열 결합
    dsMaster = dsMaster.concat(dsDetail);

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04080E0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC04080E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var rowData;
    if (G_GRDMASTER.focused) {

        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04080E0.005", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC04080E0.006", "삭제 하시겠습니까?"))) {
            return;
        }

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDMASTER, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDMASTER.data.updateItem(rowData.id, rowData);
            _Save();
        }
    } else {

        if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04080E0.005", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC04080E0.006", "삭제 하시겠습니까?"))) {
            return;
        }

        rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDDETAIL, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "ASSORT_CD",
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "ITEM_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
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
        case "SORTER_PUT_YN":
        case "MULTI_STYLE_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ASSORT_CD",
        field: "ASSORT_CD",
        name: "어소트코드"
    });
    $NC.setGridColumn(columns, {
        id: "TOTAL_CONS_QTY",
        field: "TOTAL_CONS_QTY",
        name: "총구성수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SORTER_PUT_YN",
        field: "SORTER_PUT_YN",
        name: "소터투입여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "MULTI_STYLE_YN",
        field: "MULTI_STYLE_YN",
        name: "다중스타일여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "PACK_DIV_F",
        field: "PACK_DIV_F",
        name: "포장구분"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처코드"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {
    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC04080E0.RS_MASTER",
        sortCol: "ASSORT_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
    G_GRDMASTER.view.onFocus.subscribe(grdMasterOnFocus);

    // 최초 조회시 포커스 처리
    G_GRDMASTER.focused = true;
}

function grdMasterOnFocus(e, args) {

    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;

    // 디테일 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);

    G_GRDDETAIL.queryParams = {
        P_BRAND_CD: rowData.BRAND_CD,
        P_ASSORT_CD: rowData.ASSORT_CD
    };
    // 디테일 조회
    $NC.serviceCall("/CMC04080E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "ASSORT_CD":
                return false;
        }
    }
    return true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "VENDOR_CD":
            $NP.onVendorChange(rowData.VENDOR_CD, {
                P_CUST_CD: rowData.CUST_CD,
                P_VENDOR_CD: rowData.VENDOR_CD,
                P_VIEW_DIV: "1"
            }, grdMasterOnVendorPopup);
            return;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "ASSORT_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ASSORT_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04080E0.007", "어소트코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "ASSORT_CD", true);
            return false;
        }
    }
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.VENDOR_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04080E0.008", "공급처를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "VENDOR_CD", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdDetailOnGetColumns() {

    var columns = [];
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
        id: "CONS_QTY",
        field: "CONS_QTY",
        name: "구성수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CMC04080E0.RS_DETAIL",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
    G_GRDDETAIL.view.onFocus.subscribe(grdDetailOnFocus);
}

function grdDetailOnFocus(e, args) {

    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "ITEM_CD":
                return false;
        }
    }
    return true;
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDDETAIL.view.getColumnId(args.cell)) {
        case "ITEM_CD":
            $NP.onItemChange(rowData.ITEM_CD, {
                P_BRAND_CD: rowData.BRAND_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdDetailOnItemPopup, {
                queryId: "WC.POP_CMBRANDITEM"
            });
            return;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04080E0.009", "상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_CD", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "ASSORT_CD", G_GRDMASTER.focused)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
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

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "ITEM_CD", G_GRDDETAIL.focused);
}

function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "ASSORT_CD"
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "ITEM_CD"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var grdObject;
    if (G_GRDMASTER.focused) {
        grdObject = G_GRDMASTER;
    } else {
        grdObject = G_GRDDETAIL;
    }

    var rowData = grdObject.data.getItem(grdObject.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(grdObject, rowData, true);
    }
}

function grdMasterOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "VENDOR_CD":
            $NP.showVendorPopup({
                queryParams: {
                    P_CUST_CD: rowData.CUST_CD,
                    P_VENDOR_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1"
                }
            }, grdMasterOnVendorPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            break;
    }
}

function grdDetailOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "ITEM_CD":
            $NP.showItemPopup({
                queryId: "WC.POP_CMBRANDITEM",
                queryParams: {
                    P_BRAND_CD: rowData.BRAND_CD,
                    P_ITEM_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1",
                    P_DEPART_CD: $ND.C_ALL,
                    P_LINE_CD: $ND.C_ALL,
                    P_CLASS_CD: $ND.C_ALL
                }
            }, grdDetailOnItemPopup, function() {
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true, true);
            });
            break;
    }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showUserBrandPopup() {

    $NP.showUserBrandPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BRAND_CD: $ND.C_ALL
    }, onUserBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onUserBrandPopup(resultInfo) {

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
 * 검색조건의 공급처 검색 팝업 클릭
 */
function showVenderPopup() {

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

/**
 * 그리드 마스터의 공급처 검색 결과
 * 
 * @param resultInfo
 */
function grdMasterOnVendorPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.VENDOR_CD = resultInfo.VENDOR_CD;
        rowData.VENDOR_NM = resultInfo.VENDOR_NM;
        focusCol = G_GRDMASTER.view.getColumnIndex("SORTER_PUT_YN");
    } else {
        rowData.VENDOR_CD = "";
        rowData.VENDOR_NM = "";
        focusCol = G_GRDMASTER.view.getColumnIndex("VENDOR_CD");
    }
    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 그리드 디테일의 상품 검색 결과
 */
function grdDetailOnItemPopup(resultInfo) {

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
        focusCol = G_GRDDETAIL.view.getColumnIndex("CONS_QTY");
    } else {
        rowData.SET_ITEM_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";
        focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
    }
    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);

    $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}