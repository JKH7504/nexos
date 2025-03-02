﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04030E0
 *  프로그램명         : 세트상품관리
 *  프로그램설명       : 세트상품관리 화면 Javascript
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
                grids: [
                    "#grdMaster",
                    "#grdDetail"
                ],
                exceptHeight: $NC.getViewHeight("#divAdditionalView")
            };
            return resizeView;
        }
    });

    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);

    // 세트구성여부에 구성, 미구성 체크
    $NC.setValue("#chkQSet_Div1", $ND.C_YES);
    $NC.setValue("#chkQSet_Div2", $ND.C_YES);

    $("#btnQCust_Cd").click(showQCustPopup);
    $("#btnQBrand_Cd").click(showQCustBrandPopup);
    $("#btnDownloadXLSFormat").click(btnDownloadXLSFormatOnClick); // 엑셀포맷 다운로드
    $("#btnUploadXLS").click(btnUploadXLSOnClick); // 엑셀업로드

    $NC.setEnable("#btnDownloadXLSFormat", false);
    $NC.setEnable("#btnUploadXLS", false);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
}

function _SetResizeOffset() {

}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "v", 500);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

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

    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDMASTER);

    $NC.setEnable("#btnDownloadXLSFormat", false);
    $NC.setEnable("#btnUploadXLS", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04030E0.001", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var SET_ITEM_CD = $NC.getValue("#edtQSet_Item_Cd");
    var SET_ITEM_NM = $NC.getValue("#edtQSet_Item_Nm");

    var SET_DIV1 = $NC.getValue("#chkQSet_Div1");
    var SET_DIV2 = $NC.getValue("#chkQSet_Div2");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM,
        P_SET_ITEM_CD: SET_ITEM_CD,
        P_SET_ITEM_NM: SET_ITEM_NM,
        P_SET_DIV1: SET_DIV1,
        P_SET_DIV2: SET_DIV2
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04030E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC04030E0.002", "세트상품 내역이 없습니다.\n\n세트상품을 먼저 등록하십시오."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        BRAND_CD: refRowData.BRAND_CD,
        ITEM_CD: refRowData.ITEM_CD,
        SET_BRAND_CD: null,
        SET_ITEM_CD: null,
        SET_ITEM_QTY: 1,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDDETAIL, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04030E0.003", "마스터 데이터가 없습니다."));
        return;
    }
    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04030E0.004", "저장할 디테일 데이터가 없습니다."));
        return;
    }

    // 구성상품 수정모드면
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 상용코드 수정 데이터
    var dsDetail = [ ];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_SET_BRAND_CD: rowData.SET_BRAND_CD,
            P_SET_ITEM_CD: rowData.SET_ITEM_CD,
            P_SET_ITEM_QTY: rowData.SET_ITEM_QTY,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04030E0.005", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC04030E0/save.do", {
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC04030E0.006", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC04030E0.007", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.deleteGridRowData(G_GRDDETAIL, rowData);
    } else {
        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        _Save();
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "BRAND_CD",
            "ITEM_CD"
        ],
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "SET_BRAND_CD",
            "SET_ITEM_CD"
        ],
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

function grdMasterOnGetColumns() {

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
    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC04030E0.RS_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
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
        P_ITEM_CD: rowData.ITEM_CD
    };
    // 디테일 조회
    $NC.serviceCall("/CMC04030E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "SET_ITEM_CD",
        field: "SET_ITEM_CD",
        name: "구성상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdDetailOnPopup,
            isKeyField: true
        }
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
        id: "SET_ITEM_QTY",
        field: "SET_ITEM_QTY",
        name: "기준수량",
        editor: Slick.Editors.Number,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SET_BRAND_CD",
        field: "SET_BRAND_CD",
        name: "구성브랜드"
    });
    $NC.setGridColumn(columns, {
        id: "SET_BRAND_NM",
        field: "SET_BRAND_NM",
        name: "구성브랜드명"
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
        queryId: "CMC04030E0.RS_DETAIL",
        sortCol: "SET_ITEM_CD",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onFocus.subscribe(grdDetailOnFocus);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnFocus(e, args) {

    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
}

function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "SET_ITEM_CD", true);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "SET_ITEM_CD":
                return false;
        }
    }
    return true;
}

function grdDetailOnCellChange(e, args) {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    var rowData = args.item;
    switch (G_GRDDETAIL.view.getColumnId(args.cell)) {
        case "SET_ITEM_CD":
            $NP.onItemChange(rowData.SET_ITEM_CD, {
                P_CUST_CD: CUST_CD,
                P_ITEM_CD: rowData.SET_ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdDetailOnItemPopup, {
                queryId: "WC.POP_CMCUSTITEM"
            });
            return;
        case "SET_ITEM_QTY":
            if (Number(rowData.SET_ITEM_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.CMC04030E0.008", "구성수량을 1보다 큰수를 입력하십시오."));
                rowData.SET_ITEM_QTY = args.oldItem.SET_ITEM_QTY;
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true);
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "SET_ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.SET_ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04030E0.009", "구성상품을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "SET_ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.SET_ITEM_QTY)) {
            alert($NC.getDisplayMsg("JS.CMC04030E0.010", "구성수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "SET_ITEM_QTY", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "ITEM_CD", G_GRDMASTER.focused)) {
        $NC.clearGridData(G_GRDDETAIL);
    }

    $NC.setEnable("#btnDownloadXLSFormat", true);
    $NC.setEnable("#btnUploadXLS", true);
    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "SET_ITEM_CD", G_GRDDETAIL.focused);
}

function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "BRAND_CD",
            "ITEM_CD"
        ]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "SET_BRAND_CD",
            "SET_ITEM_CD"
        ]
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

function grdDetailOnPopup(e, args) {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    // var rowData = args.item;
    switch (args.column.id) {
        case "SET_ITEM_CD":
            $NP.showItemPopup({
                queryId: "WC.POP_CMCUSTITEM",
                queryParams: {
                    P_CUST_CD: CUST_CD,
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

/**
 * 상품 검색 결과 / 검색 실패 했을 경우(not found)
 */
function grdDetailOnItemPopup(resultInfo) {

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        // 세트상품 코드와 구성상품코드 중복 시 return
        if (resultInfo.ITEM_CD == rowData.ITEM_CD) {
            alert($NC.getDisplayMsg("JS.CMC04030E0.011", "세트상품코드와 같은 값을 저장할 수 없습니다."));
            rowData.SET_ITEM_CD = "";
            $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("SET_ITEM_CD"), true, true);
            return;
        }

        rowData.SET_BRAND_CD = resultInfo.BRAND_CD;
        rowData.SET_BRAND_NM = resultInfo.BRAND_NM;
        rowData.SET_ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;

        focusCol = G_GRDDETAIL.view.getColumnIndex("SET_ITEM_QTY");
    } else {
        rowData.SET_BRAND_CD = "";
        rowData.SET_BRAND_NM = "";
        rowData.SET_ITEM_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";

        focusCol = G_GRDDETAIL.view.getColumnIndex("SET_ITEM_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);

    $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

function btnDownloadXLSFormatOnClick() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04030E0.012", "고객사를 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "ITEM_CD",
            P_COLUMN_TITLE: "상품코드",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "SET_ITEM_CD",
            P_COLUMN_TITLE: "구성상품코드",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "SET_ITEM_QTY",
            P_COLUMN_TITLE: "기준수량",
            P_COLUMN_WIDTH: 10
        },
        {
            P_COLUMN_NM: "REMARK1",
            P_COLUMN_TITLE: "비고",
            P_COLUMN_WIDTH: 40
        }
    ];

    $NC.excelFileDownload({
        P_QUERY_ID: "CMC04030E0.RS_SUB1",
        P_QUERY_PARAMS: {
            P_CUST_CD: CUST_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "세트상품업로드", // Excel Sheet Title
            P_EXCEL_FREEZE_ROW: 2
        // 고정 ROW
        },
        P_COLUMN_INFO: COLUMN_INFO
    });
}

function btnUploadXLSOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04030E0.XXX", "고객사를 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "ITEM_CD",
            P_XLS_COLUMN_NM: "A"
        },
        {
            P_COLUMN_NM: "SET_ITEM_CD",
            P_XLS_COLUMN_NM: "B"
        },
        {
            P_COLUMN_NM: "SET_ITEM_QTY",
            P_XLS_COLUMN_NM: "C"
        }
    ];

    $NC.excelFileUpload({
        P_QUERY_ID: "CMC04030E0.RS_SUB2",
        P_QUERY_PARAMS: {
            P_CUST_CD: CUST_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_COL_CHECK_YN: $ND.C_YES,
            P_XLS_FIRST_ROW: 3
        // P_XLS_FILE_DIV: "CMLOCATIONFIX"
        },
        P_COLUMN_INFO: COLUMN_INFO
    }, function(ajaxData, dsResultData) {

        if ($NC.isNull(dsResultData) || dsResultData.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04030E0.008", "업로드할 수 있는 대상 데이터가 없습니다. 엑셀 파일을 확인하십시오."));
            return;
        }

        var dsDetail = [ ];
        for (var rIndex = 0, rCount = dsResultData.length; rIndex < rCount; rIndex++) {
            dsDetail.push({
                P_BRAND_CD: dsResultData[rIndex].BRAND_CD,
                P_ITEM_CD: dsResultData[rIndex].ITEM_CD,
                P_SET_BRAND_CD: dsResultData[rIndex].SET_BRAND_CD,
                P_SET_ITEM_CD: dsResultData[rIndex].SET_ITEM_CD,
                P_SET_ITEM_QTY: dsResultData[rIndex].SET_ITEM_QTY,
                P_CRUD: $ND.C_DV_CRUD_C
            });
        }

        $NC.serviceCall("/CMC04030E0/save.do", {
            P_DS_DETAIL: dsDetail,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveError);
    });
}