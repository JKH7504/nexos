﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04100E0
 *  프로그램명         : 몰상품관리
 *  프로그램설명       : 몰상품관리 화면 Javascript
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
                grids: $NC.getTabActiveIndex("#divMasterView") == 1 ? "#grdT2Master" : ""
            };
            return resizeView;
        },
        autoResizeFixedView: function() {
            var resizeView = {
                container: "#divMasterView"
            };
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView = {
                    viewFirst: {
                        container: "#divSplitter",
                        grids: [
                            "#grdT1Master",
                            "#grdT1Detail"
                        ]
                    },
                    exceptHeight: $NC.getViewHeight("#divAdditionalView")
                };
            }
            return resizeView;
        }
    });

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 검색.거래구분에 거래진행 체크
    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);

    $("#btnDownloadXLSFormat").click(btnDownloadXLSFormatOnClick); // 엑셀포맷 다운로드
    $("#btnUploadXLS").click(btnUploadXLSOnClick); // 엑셀업로드

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT2MasterInitialize();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    G_GRDT1MASTER.focused = true;
    G_GRDT1DETAIL.focused = false;
}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divSplitter", "v", 600);
}

function _SetResizeOffset() {

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
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "DELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: "92",
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
    }

    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04100E0.001", "사업부를 먼저 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd");
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");
    var MALL_ITEM_CD = $NC.getValue("#edtQMall_Item_Cd");
    var MALL_ITEM_NM = $NC.getValue("#edtQMall_Item_Nm");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");

    // 몰상품등록 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        $NC.setInitGridVar(G_GRDT1MASTER);
        $NC.setInitGridVar(G_GRDT1DETAIL);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_BU_CD: BU_CD,
            P_DELIVERY_CD: DELIVERY_CD,
            P_DEAL_DIV1: DEAL_DIV1,
            P_DEAL_DIV2: DEAL_DIV2,
            P_DEAL_DIV3: DEAL_DIV3,
            P_MALL_ITEM_CD: MALL_ITEM_CD,
            P_MALL_ITEM_NM: MALL_ITEM_NM,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM
        };
        // 데이터 조회
        $NC.serviceCall("/CMC04100E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    } else {

        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_BU_CD: BU_CD,
            P_DELIVERY_CD: DELIVERY_CD,
            P_DEAL_DIV1: DEAL_DIV1,
            P_DEAL_DIV2: DEAL_DIV2,
            P_DEAL_DIV3: DEAL_DIV3,
            P_MALL_ITEM_CD: MALL_ITEM_CD,
            P_MALL_ITEM_NM: MALL_ITEM_NM,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM
        };
        // 데이터 조회
        $NC.serviceCall("/CMC04100E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var refRowData, newRowData;
    // grdT1Master에 포커스가 있을 경우
    if (G_GRDT1MASTER.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            BU_CD: $NC.getValue("#edtQBu_Cd"),
            CUST_CD: $NC.getValue("#edtQCust_Cd"),
            DELIVERY_CD: null,
            MALL_ITEM_CD: null,
            MALL_ITEM_NM: null,
            MALL_OPT_CD: $ND.C_NULL,
            MALL_OPT_NM: null,
            DEAL_DIV: "1",
            OPEN_DATE: "",
            CLOSE_DATE: "",
            REMARK1: null,
            DEAL_DIV_F: $NC.getGridComboName(G_GRDT1MASTER, {
                columnId: "DEAL_DIV_F",
                searchVal: "1",
                dataCodeField: "COMMON_CD",
                dataFullNameField: "COMMON_CD_F"
            }),
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDT1MASTER, newRowData);
    }
    // grdT1Detail에 포커스가 있을 경우
    else if (G_GRDT1DETAIL.focused) {
        if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.002", "몰상품이 없습니다.\n\n몰상품을 먼저 등록하십시오."));
            return;
        }

        refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
        if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.003", "신규 몰상품입니다.\n\n저장 후 몰상품 구성을 진행하십시오."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            BU_CD: refRowData.BU_CD,
            CUST_CD: refRowData.CUST_CD,
            DELIVERY_CD: refRowData.DELIVERY_CD,
            MALL_ITEM_CD: refRowData.MALL_ITEM_CD,
            MALL_ITEM_NM: refRowData.MALL_ITEM_NM,
            MALL_OPT_CD: refRowData.MALL_OPT_CD,
            ITEM_CD: null,
            ITEM_NM: null,
            ITEM_QTY: "0",
            REMARK1: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDT1DETAIL, newRowData);
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDT1MASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04100E0.006", "저장할 데이터가 없습니다."));
        return;
    }

    // 몰상품 내역
    if (G_GRDT1MASTER.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
            return;
        }
    }
    // 몰상품 구성
    else {
        if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
            // 마지막 선택 Row Validation 체크
            return;
        }
    }

    var dsMaster = [];
    var dsDetail = [];
    var rIndex, rCount, rowData;

    // 몰상품 수정 데이터
    for (rIndex = 0, rCount = G_GRDT1MASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1MASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_BU_CD: rowData.BU_CD,
            P_CUST_CD: rowData.CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_MALL_ITEM_CD: rowData.MALL_ITEM_CD,
            P_MALL_ITEM_NM: rowData.MALL_ITEM_NM,
            P_MALL_OPT_CD: rowData.MALL_OPT_CD,
            P_MALL_OPT_NM: rowData.MALL_OPT_NM,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    // 몰상품 구성 수정 데이터
    for (rIndex = 0, rCount = G_GRDT1DETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1DETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_BU_CD: rowData.BU_CD,
            P_CUST_CD: rowData.CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_MALL_ITEM_CD: rowData.MALL_ITEM_CD,
            P_MALL_OPT_CD: rowData.MALL_OPT_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_QTY: rowData.ITEM_QTY,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0 && dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04100E0.007", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC04100E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var rowData;
    // 몰상품 삭제
    if (G_GRDT1MASTER.focused) {

        if (G_GRDT1MASTER.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.008", "삭제할 데이터가 없습니다."));
            return;
        }

        if (G_GRDT1DETAIL.data.getLength() > 0) {
            alert($NC.getDisplayMsg("JS.CMC01030E0.009", "하위 데이터가 있습니다. 삭제할 수 없습니다."));
            return;
        }

        rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDT1MASTER, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
    // 몰상품 구성 삭제
    else if (G_GRDT1DETAIL.focused) {

        if (G_GRDT1DETAIL.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.008", "삭제할 데이터가 없습니다."));
            return;
        }

        rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDT1DETAIL, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "DELIVERY_CD",
            "MALL_ITEM_CD",
            "MALL_OPT_CD"
        ],
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "ITEM_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
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
    // 스플리터가 초기화가 되어 있으면 _OnResize 호출

    if (tabActiveIndex == 0) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divSplitter")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divSplitter").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divSplitter", "v", 600);
        }
    } else {
        $NC.onGlobalResize();
    }

    setTopButtons();
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdT1MasterOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_ITEM_CD",
        field: "MALL_ITEM_CD",
        name: "몰상품코드",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "MALL_ITEM_NM",
        field: "MALL_ITEM_NM",
        name: "몰상품명",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "MALL_OPT_CD",
        field: "MALL_OPT_CD",
        name: "몰상품옵션코드",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "MALL_OPT_NM",
        field: "MALL_OPT_NM",
        name: "몰상품옵션명",
        editor: Slick.Editors.Text
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
        name: "거래일자",
        editor: Slick.Editors.Date,
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "종료일자",
        editor: Slick.Editors.Date,
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
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "CMC04100E0.RS_T1_MASTER",
        sortCol: "DELIVERY_CD",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onBeforeEditCell.subscribe(grdT1MasterOnBeforeEditCell);
    G_GRDT1MASTER.view.onCellChange.subscribe(grdT1MasterOnCellChange);
    G_GRDT1MASTER.view.onFocus.subscribe(grdT1MasterOnFocus);

    // 최초 조회시 포커스 처리
    G_GRDT1MASTER.focused = true;
}

function grdT1MasterOnFocus(e, args) {

    G_GRDT1MASTER.focused = true;
    G_GRDT1DETAIL.focused = false;

    // 디테일 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
        return;
    }

}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    // 몰상품 구성 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);
    onGetT1Detail({
        data: null
    });

    // 몰상품 구성 조회
    if (rowData.CRUD != $ND.C_DV_CRUD_C && rowData.CRUD != $ND.C_DV_CRUD_N) {
        G_GRDT1DETAIL.queryParams = {
            P_BU_CD: rowData.BU_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_MALL_ITEM_CD: rowData.MALL_ITEM_CD,
            P_MALL_OPT_CD: rowData.MALL_OPT_CD
        };
        $NC.serviceCall("/CMC04100E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1MasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "DELIVERY_CD":
            case "MALL_ITEM_CD":
            case "MALL_OPT_CD":
                return false;
        }
    }
    return true;
}

function grdT1MasterOnCellChange(e, args) {

    var rowData = args.item;
    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    switch (G_GRDT1MASTER.view.getColumnId(args.cell)) {
        case "DELIVERY_CD":
            $NP.onDeliveryChange(rowData.DELIVERY_CD, {
                P_CUST_CD: CUST_CD,
                P_DELIVERY_CD: rowData.DELIVERY_CD,
                P_DELIVERY_DIV: "92",
                P_VIEW_DIV: "1"
            }, grdT1MasterOnDeliveryPopup);
            return;
        case "OPEN_DATE":
            if ($NC.isNotNull(rowData.OPEN_DATE)) {
                if (!$NC.isDate(rowData.OPEN_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04100E0.014", "거래일자를 정확히 입력하십시오."));
                    rowData.OPEN_DATE = "";
                    $NC.setFocusGrid(G_GRDT1MASTER, args.row, args.cell, true);
                } else {
                    rowData.OPEN_DATE = $NC.getDate(rowData.OPEN_DATE);
                }
            }
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(rowData.CLOSE_DATE)) {
                if (!$NC.isDate(rowData.CLOSE_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04100E0.015", "종료일자를 정확히 입력하십시오."));
                    rowData.CLOSE_DATE = "";
                    $NC.setFocusGrid(G_GRDT1MASTER, args.row, args.cell, true);
                } else {
                    rowData.CLOSE_DATE = $NC.getDate(rowData.CLOSE_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);
}

function grdT1MasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDT1MASTER, args.row, 0, true);
}

function grdT1MasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1MASTER, row, [
        "DELIVERY_CD",
        "MALL_ITEM_CD",
        "MALL_OPT_CD"
    ])) {
        return true;
    }

    var rowData = G_GRDT1MASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.DELIVERY_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.016", "배송처코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "DELIVERY_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.MALL_ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.017", "몰상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "MALL_ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.MALL_OPT_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.018", "몰상품옵션코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "MALL_OPT_CD", true);
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC04100E0.019", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setFocusGrid(G_GRDT1MASTER, row, "CLOSE_DATE", true);
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1MASTER, rowData);
    return true;
}

function grdT1MasterOnPopup(e, args) {

    // var rowData = args.item;
    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    switch (args.column.id) {
        case "DELIVERY_CD":
            $NP.showDeliveryPopup({
                P_CUST_CD: CUST_CD,
                P_DELIVERY_CD: $ND.C_ALL,
                P_DELIVERY_DIV: "92",
                P_VIEW_DIV: "1"
            }, grdT1MasterOnDeliveryPopup, function() {
                $NC.setFocusGrid(G_GRDT1MASTER, args.row, args.cell, true, true);
            });
            return;
    }
}

function grdT1DetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdT1DetailOnPopup,
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
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_QTY",
        field: "ITEM_QTY",
        name: "구성수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "CMC04100E0.RS_T1_DETAIL",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onBeforeEditCell.subscribe(grdT1DetailOnBeforeEditCell);
    G_GRDT1DETAIL.view.onCellChange.subscribe(grdT1DetailOnCellChange);
    G_GRDT1DETAIL.view.onFocus.subscribe(grdT1DetailOnFocus);
}

function grdT1DetailOnFocus(e, args) {

    G_GRDT1MASTER.focused = false;
    G_GRDT1DETAIL.focused = true;

    // 마스터 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        return;
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

function grdT1DetailOnBeforeEditCell(e, args) {

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

function grdT1DetailOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDT1DETAIL.view.getColumnId(args.cell)) {
        case "ITEM_CD":
            $NP.onItemChange(rowData.ITEM_CD, {
                P_BU_CD: rowData.BU_CD,
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: rowData.ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdT1DetailOnItemPopup);
            return;
        case "ITEM_QTY":
            if (Number(rowData.ITEM_QTY) < 1) {
                alert($NC.getDisplayMsg("JS.CMC04100E0.020", "구성수량을 1보다 큰수를 입력하십시오."));
                rowData.ITEM_QTY = args.oldItem.ITEM_QTY;
                $NC.setFocusGrid(G_GRDT1DETAIL, args.row, args.cell, true);
                return false;
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1DETAIL, rowData);
}

function grdT1DetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDT1DETAIL, args.row, "ITEM_CD", true);
}

function grdT1DetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1DETAIL, row, "ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDT1DETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.018", "상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1DETAIL, row, "ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_QTY) || rowData.ITEM_QTY == 0) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.019", "수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1DETAIL, row, "ITEM_QTY", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1DETAIL, rowData);
    return true;
}

function grdT1DetailOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "ITEM_CD":
            $NP.showItemPopup({
                P_BU_CD: rowData.BU_CD,
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: $ND.C_ALL,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdT1DetailOnItemPopup, function() {
                $NC.setFocusGrid(G_GRDT1DETAIL, args.row, args.cell, true, true);
            });
            break;
    }
}

function grdT2MasterOnGetColumns() {

    var columns = [];
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
        id: "MALL_ITEM_CD",
        field: "MALL_ITEM_CD",
        name: "몰상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_ITEM_NM",
        field: "MALL_ITEM_NM",
        name: "몰상품명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_OPT_CD",
        field: "MALL_OPT_CD",
        name: "몰상품옵션코드"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_OPT_NM",
        field: "MALL_OPT_NM",
        name: "몰상품옵션명"
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
        id: "ITEM_QTY",
        field: "ITEM_QTY",
        name: "구성수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_F",
        field: "DEAL_DIV_F",
        name: "거래구분"
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "종료일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });
    $NC.setGridColumn(columns, {
        id: "REG_USER_ID",
        field: "REG_USER_ID",
        name: "최초등록자ID"
    });
    $NC.setGridColumn(columns, {
        id: "REG_DATETIME",
        field: "REG_DATETIME",
        name: "최초등록일시"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_USER_ID",
        field: "LAST_USER_ID",
        name: "최종수정자ID"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정일시"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "CMC04100E0.RS_T2_MASTER",
        sortCol: "DELIVERY_CD",
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

function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, [
        "DELIVERY_CD",
        "MALL_ITEM_CD",
        "MALL_OPT_CD"
    ], G_GRDT1MASTER.focused)) {
        // 몰상품구성 초기화
        $NC.setInitGridVar(G_GRDT1DETAIL);
        onGetT1Detail({
            data: null
        });
    }

    setTopButtons();
}

function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL, "ITEM_CD", G_GRDT1DETAIL.focused);
}

function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);

    setTopButtons();
}

function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "DELIVERY_CD",
            "MALL_ITEM_CD",
            "MALL_OPT_CD"
        ]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
        selectKey: "ITEM_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var grdObject;
    if (G_GRDT1MASTER.focused) {
        grdObject = G_GRDT1MASTER;
    } else if (G_GRDT1DETAIL.focused) {
        grdObject = G_GRDT1DETAIL;
    }

    var rowData = grdObject.data.getItem(grdObject.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(grdObject, rowData, true);
    }

    _Cancel();
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
        $NC.setFocus("#edtQBu_Cd", true);
    }

    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");

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
            P_DELIVERY_DIV: "92",
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

function grdT1MasterOnDeliveryPopup(resultInfo) {

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.DELIVERY_CD = resultInfo.DELIVERY_CD;
        rowData.DELIVERY_NM = resultInfo.DELIVERY_NM;
        focusCol = G_GRDT1MASTER.view.getColumnIndex("MALL_ITEM_CD");
    } else {
        rowData.DELIVERY_CD = "";
        rowData.DELIVERY_NM = "";
        focusCol = G_GRDT1MASTER.view.getColumnIndex("DELIVERY_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);

    $NC.setFocusGrid(G_GRDT1MASTER, G_GRDT1MASTER.lastRow, focusCol, true, true);
}

/**
 * 상품 검색 결과 / 검색 실패 했을 경우(not found)
 */
function grdT1DetailOnItemPopup(resultInfo) {

    var rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.BRAND_CD = resultInfo.BRAND_CD;
        rowData.BRAND_NM = resultInfo.BRAND_NM;
        rowData.ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
        focusCol = G_GRDT1DETAIL.view.getColumnIndex("ITEM_QTY");
    } else {
        rowData.BRAND_CD = "";
        rowData.BRAND_NM = "";
        rowData.ITEM_CD = "";
        rowData.ITEM_NM = "";
        rowData.ITEM_SPEC = "";
        focusCol = G_GRDT1DETAIL.view.getColumnIndex("ITEM_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1DETAIL, rowData);

    $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, focusCol, true, true);
}

function btnDownloadXLSFormatOnClick() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");

    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04100E0.015", "사업부를 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "DELIVERY_CD",
            P_COLUMN_TITLE: "배송처",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "MALL_ITEM_CD",
            P_COLUMN_TITLE: "몰상품코드",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "MALL_ITEM_NM",
            P_COLUMN_TITLE: "몰상품명",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "MALL_OPT_CD",
            P_COLUMN_TITLE: "몰상품옵션코드",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "MALL_OPT_NM",
            P_COLUMN_TITLE: "몰상품옵션명",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "DEAL_DIV",
            P_COLUMN_TITLE: "거래구분",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "OPEN_DATE",
            P_COLUMN_TITLE: "거래시작일자",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "CLOSE_DATE",
            P_COLUMN_TITLE: "거래종료일자",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "BRAND_CD",
            P_COLUMN_TITLE: "브랜드코드",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "ITEM_CD",
            P_COLUMN_TITLE: "상품코드",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "ITEM_QTY",
            P_COLUMN_TITLE: "상품수량",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "REMARK1",
            P_COLUMN_TITLE: "비고",
            P_COLUMN_WIDTH: 40
        }
    ];

    $NC.excelFileDownload({
        P_QUERY_ID: "CMC04100E0.RS_SUB1",
        P_QUERY_PARAMS: {
            P_BU_CD: BU_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "몰상품등록", // Excel Sheet Title
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

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04100E0.015", "사업부를 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "DELIVERY_CD",
            P_XLS_COLUMN_NM: "A"
        },
        {
            P_COLUMN_NM: "MALL_ITEM_CD",
            P_XLS_COLUMN_NM: "B"
        },
        {
            P_COLUMN_NM: "MALL_ITEM_NM",
            P_XLS_COLUMN_NM: "C"
        },
        {
            P_COLUMN_NM: "MALL_OPT_CD",
            P_XLS_COLUMN_NM: "D"
        },
        {
            P_COLUMN_NM: "MALL_OPT_NM",
            P_XLS_COLUMN_NM: "E"
        },
        {
            P_COLUMN_NM: "DEAL_DIV",
            P_XLS_COLUMN_NM: "F"
        },
        {
            P_COLUMN_NM: "OPEN_DATE",
            P_XLS_COLUMN_NM: "G"
        },
        {
            P_COLUMN_NM: "CLOSE_DATE",
            P_XLS_COLUMN_NM: "H"
        },
        {
            P_COLUMN_NM: "BRAND_CD",
            P_XLS_COLUMN_NM: "I"
        },
        {
            P_COLUMN_NM: "ITEM_CD",
            P_XLS_COLUMN_NM: "J"
        },
        {
            P_COLUMN_NM: "ITEM_QTY",
            P_XLS_COLUMN_NM: "K"
        }
    ];

    $NC.excelFileUpload({
        P_QUERY_ID: "CMC04100E0.RS_SUB2",
        P_QUERY_PARAMS: {
            P_BU_CD: BU_CD,
            P_CUST_CD: CUST_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_COL_CHECK_YN: $ND.C_YES,
            P_XLS_FIRST_ROW: 3
        },
        P_COLUMN_INFO: COLUMN_INFO
    }, function(ajaxData, dsResultData) {

        if ($NC.isNull(dsResultData) || dsResultData.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04100E0.018", "업로드할 수 있는 대상 데이터가 없습니다. 엑셀 파일을 확인하십시오."));
            return;
        }

        var dsMaster = [];
        var dsDetail = [];
        var rIndex, rCount;

        for (rIndex = 0, rCount = dsResultData.length; rIndex < rCount; rIndex++) {
            if (dsResultData[rIndex].EXISIS_YN_M == $ND.C_YES || dsResultData[rIndex].FIRST_YN == $ND.C_NO) {
                continue;
            }
            dsMaster.push({
                P_BU_CD: dsResultData[rIndex].BU_CD,
                P_CUST_CD: dsResultData[rIndex].CUST_CD,
                P_DELIVERY_CD: dsResultData[rIndex].DELIVERY_CD,
                P_MALL_ITEM_CD: dsResultData[rIndex].MALL_ITEM_CD,
                P_MALL_ITEM_NM: dsResultData[rIndex].MALL_ITEM_NM,
                P_MALL_OPT_CD: dsResultData[rIndex].MALL_OPT_CD,
                P_MALL_OPT_NM: dsResultData[rIndex].MALL_OPT_NM,
                P_DEAL_DIV: dsResultData[rIndex].DEAL_DIV,
                P_OPEN_DATE: dsResultData[rIndex].OPEN_DATE,
                P_CLOSE_DATE: dsResultData[rIndex].CLOSE_DATE,
                P_CRUD: $ND.C_DV_CRUD_C
            });
        }

        for (rIndex = 0, rCount = dsResultData.length; rIndex < rCount; rIndex++) {
            if (dsResultData[rIndex].EXISIS_YN_D == $ND.C_YES) {
                continue;
            }
            dsDetail.push({
                P_BU_CD: dsResultData[rIndex].BU_CD,
                P_CUST_CD: dsResultData[rIndex].CUST_CD,
                P_DELIVERY_CD: dsResultData[rIndex].DELIVERY_CD,
                P_MALL_ITEM_CD: dsResultData[rIndex].MALL_ITEM_CD,
                P_MALL_OPT_CD: dsResultData[rIndex].MALL_OPT_CD,
                P_BRAND_CD: dsResultData[rIndex].BRAND_CD,
                P_ITEM_CD: dsResultData[rIndex].ITEM_CD,
                P_ITEM_QTY: dsResultData[rIndex].ITEM_QTY,
                P_CRUD: $ND.C_DV_CRUD_C
            });
        }

        var len = G_GRDT1MASTER.data.getLength();
        for (var row = 0; row < dsResultData.length; row++) {
            G_GRDT1MASTER.data.addItem(dsResultData[row]);
        }
        $NC.setGridSelectRow(G_GRDT1MASTER, len);

        $NC.serviceCall("/CMC04100E0/save.do", {
            P_DS_MASTER: dsMaster,
            P_DS_DETAIL: dsDetail,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveError);

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
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "1";
            $NC.G_VAR.buttons._delete = "1";
        }
    }
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    $NC.setEnable("#btnUploadXLS", permission.canSave);
}