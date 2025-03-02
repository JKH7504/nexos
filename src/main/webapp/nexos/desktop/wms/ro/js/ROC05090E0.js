/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : ROC05090E0
 *  프로그램명         : 반출작업비등록
 *  프로그램설명       : 반출작업비등록 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-03-09
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-03-09    ASETEC           신규작성
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
                "#grdDetail",
                "#grdSub"
            ]
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();

    // 조회조건 - 물류센터 세팅
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

    // 브랜드 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQVendor_Cd").click(showVendorPopup);
    // 브랜드의 고객사 코드 값 설정
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#chkQExtra_Work_Div1", $ND.C_YES);
    $NC.setValue("#chkQExtra_Work_Div2", $ND.C_YES);

    // 출고일자에 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2");
}

function _OnLoaded() {

    // 스플리터 초기화
    // $NC.setInitSplitter("#divMasterView", "v", 600);
    // $NC.setInitSplitter("#divRightView", "h", 350);
    $NC.setInitSplitter("#divMasterView", "h", 450);
    $NC.setInitSplitter("#divRightView", "vr", 500);
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
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
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
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.ROC05090E0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.ROC05090E0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
        case "EXTRA_WORK_DIV1":
        case "EXTRA_WORK_DIV2":
            break;
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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.ROC05090E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.ROC05090E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.ROC05090E0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.ROC05090E0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.ROC05090E0.007", "반출일자 범위 입력오류입니다."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var EXTRA_WORK_DIV1 = $NC.getValue("#chkQExtra_Work_Div1");
    var EXTRA_WORK_DIV2 = $NC.getValue("#chkQExtra_Work_Div2");
    if ($NC.isNull(EXTRA_WORK_DIV1) && $NC.isNull(EXTRA_WORK_DIV2)) {
        alert($NC.getDisplayMsg("JS.ROC05090E0.008", "작업구분을 선택하십시오."));
        $NC.setFocus("#chkQExtra_Work_Div1");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE1: OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: OUTBOUND_DATE2,
        P_INOUT_CD: INOUT_CD,
        P_VENDOR_CD: VENDOR_CD,
        P_EXTRA_WORK_DIV1: EXTRA_WORK_DIV1,
        P_EXTRA_WORK_DIV2: EXTRA_WORK_DIV2,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/ROC05090E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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

    if (G_GRDMASTER.data.getLength() == 0 || G_GRDDETAIL.data.getLength() == 0 || G_GRDSUB.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.ROC05090E0.009", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }

    var dsMaster = [ ];
    var rIndex, rCount, rowData, rowDataS;
    // 반출내역 데이터
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_BILL_PLT_QTY: rowData.BILL_PLT_QTY,
            P_BILL_BOX_QTY: rowData.BILL_BOX_QTY,
            P_BILL_EA_QTY: rowData.BILL_EA_QTY,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD,
            P_CHECK_STATE: rowData.OUTBOUND_STATE
        });
    }

    var rowDataM = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    var dsSub = [ ];
    // 추가작업비 데이터
    for (rIndex = 0, rCount = G_GRDSUB.data.getLength(); rIndex < rCount; rIndex++) {
        rowDataS = G_GRDSUB.data.getItem(rIndex);
        if (rowDataS.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        if (rowDataS.EXIST_YN == $ND.C_NO) {
            rowDataS.CRUD = $ND.C_DV_CRUD_C;
        }
        dsSub.push({
            P_CENTER_CD: rowDataM.CENTER_CD,
            P_BU_CD: rowDataM.BU_CD,
            P_OUTBOUND_DATE: rowDataM.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowDataM.OUTBOUND_NO,
            P_EXTRA_WORK_DIV: rowDataS.EXTRA_WORK_DIV,
            P_EXTRA_WORK_QTY: rowDataS.EXTRA_WORK_QTY,
            P_REMARK1: rowDataS.REMARK1,
            P_CRUD: rowDataS.CRUD,
            P_CHECK_STATE: rowData.OUTBOUND_STATE
        });
    }

    if (dsMaster.length == 0 && dsSub.length == 0) {
        alert($NC.getDisplayMsg("JS.ROC05090E0.010", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/ROC05090E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_SUB: dsSub,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
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

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "OUTBOUND_NO"
        ]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDSUB, {
        selectKey: "EXTRA_WORK_DIV"
    });

    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
    G_GRDSUB.lastKeyVal = lastKeyVal2;

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
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "반출일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "반출번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_STATE_D",
        field: "OUTBOUND_STATE_D",
        name: "진행상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_PLT_QTY",
        field: "BILL_PLT_QTY",
        name: "정산파렛트수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "BILL_BOX_QTY",
        field: "BILL_BOX_QTY",
        name: "정산박스수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "BILL_EA_QTY",
        field: "BILL_EA_QTY",
        name: "정산낱개수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "TOT_EXTRA_WORK_QTY",
        field: "TOT_EXTRA_WORK_QTY",
        name: "총추가작업수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_USER_ID",
        field: "BILL_USER_ID",
        name: "정산사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_DATETIME",
        field: "BILL_DATETIME",
        name: "정산일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 왼쪽그리드 초기화
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 1,
        editable: true,
        autoEdit: true,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if ($NC.toNumber(rowData.BILL_PLT_QTY) + $NC.toNumber(rowData.BILL_BOX_QTY) //
                    + $NC.toNumber(rowData.BILL_EA_QTY) + $NC.toNumber(rowData.TOT_EXTRA_WORK_QTY) > 0) {
                    return "styDone";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "ROC05090E0.RS_MASTER",
        sortCol: "OUTBOUND_NO",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 보안일자보다 입고일자가 낮은 Row 수정 제한
    if (rowData.PROTECT_DATE >= rowData.OUTBOUND_DATE) {
        switch (args.column.id) {
            case "BILL_PLT_QTY":
            case "BILL_BOX_QTY":
            case "BILL_EA_QTY":
                return false;
        }
    }
}

/**
 * 왼쪽 그리드의 입력체크 처리
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.BILL_PLT_QTY)) {
            alert($NC.getDisplayMsg("JS.ROC05090E0.011", "정산PLT를 정확히 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "BILL_PLT_QTY", true);
            return false;
        }
        if ($NC.isNull(rowData.BILL_BOX_QTY)) {
            alert($NC.getDisplayMsg("JS.ROC05090E0.012", "정산BOX를 정확히 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "BILL_BOX_QTY", true);
            return false;
        }
        if ($NC.isNull(rowData.BILL_EA_QTY)) {
            alert($NC.getDisplayMsg("JS.ROC05090E0.013", "정산EA를 정확히 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "BILL_EA_QTY", true);
            return false;
        }
    }
    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

/**
 * 왼쪽 그리드의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "BILL_PLT_QTY":
            if (Number(rowData.BILL_PLT_QTY) < 0) {
                alert($NC.getDisplayMsg("JS.ROC05090E0.014", "정산PLT에는 0보다 작은값을 입력할 수 없습니다."));
                rowData.BILL_PLT_QTY = 0;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
            }
            break;
        case "BILL_BOX_QTY":
            if (Number(rowData.BILL_BOX_QTY) < 0) {
                alert($NC.getDisplayMsg("JS.ROC05090E0.015", "정산BOX에는 0보다 작은값을 입력할 수 없습니다."));
                rowData.BILL_BOX_QTY = 0;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
            }
            break;
        case "BILL_EA_QTY":
            if (Number(rowData.BILL_EA_QTY) < 0) {
                alert($NC.getDisplayMsg("JS.ROC05090E0.016", "정산EA에는 0보다 작은값을 입력할 수 없습니다."));
                rowData.BILL_EA_QTY = 0;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        summaryTitle: "[합계]"
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
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_PLT",
        field: "CONFIRM_PLT",
        name: "확정PLT",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "확정BOX",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "확정EA",
        cssClass: "styRight",
        aggregator: "SUM"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 오른쪽 상단 그리드 초기화
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 1,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "ROC05090E0.RS_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdSubOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "EXTRA_WORK_DIV_D",
        field: "EXTRA_WORK_DIV_D",
        name: "추가작업비구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "EXTRA_WORK_QTY",
        field: "EXTRA_WORK_QTY",
        name: "추가작업수량",
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
    $NC.setGridColumn(columns, {
        id: "LAST_USER_ID",
        field: "LAST_USER_ID",
        name: "최종수정자ID"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 오른쪽 하단 그리드 초기화
 */
function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "ROC05090E0.RS_SUB1",
        sortCol: "EXTRA_WORK_DIV",
        gridOptions: options
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

/**
 * 오른쪽 하단그리드의 입력체크 처리
 */
function grdSubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUB, row)) {
        return true;
    }

    var rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.EXTRA_WORK_QTY)) {
            alert($NC.getDisplayMsg("JS.ROC05090E0.017", "추가작업수량을 정확히 입력하십시오."));
            $NC.setFocusGrid(G_GRDSUB, row, "EXTRA_WORK_QTY", true);
            return false;
        }
    }
    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUB, rowData);
    return true;
}

/**
 * 오른쪽 하단그리드의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDSUB.view.getColumnId(args.cell)) {
        case "EXTRA_WORK_QTY":
            if ($NC.isNull(rowData.EXTRA_WORK_QTY)) {
                rowData.EXTRA_WORK_QTY = "0";
            }
            if (Number(rowData.EXTRA_WORK_QTY) < 0) {
                alert($NC.getDisplayMsg("JS.ROC05090E0.018", "추가작업수량에는 0보다 작은값을 입력할 수 없습니다."));
                rowData.EXTRA_WORK_QTY = 0;
                $NC.setFocusGrid(G_GRDSUB, args.row, args.cell, true);
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);
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
 * 검색조건의 배송처 검색 이미지 클릭
 */
function showVendorPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showVendorPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_VENDOR_CD: $ND.C_ALL,
            P_VIEW_DIV: "1"
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
 * 왼쪽그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
        data: null
    });

    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/ROC05090E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
        data: null
    });

    G_GRDSUB.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/ROC05090E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

    var canEdit = rowData.PROTECT_DATE < rowData.OUTBOUND_DATE;
    G_GRDSUB.view.setOptions({
        editable: canEdit,
        autoEdit: canEdit
    });

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);

}

/**
 * 오른쪽 상단 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);

}

/**
 * 오른쪽 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

/**
 * 조회버튼 클릭후 왼쪽 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "OUTBOUND_DATE",
        "OUTBOUND_NO"
    ])) {
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
        $NC.setInitGridVar(G_GRDSUB);
        onGetSub({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 오른쪽 상단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "LINE_NO");
}

/**
 * 오른쪽 하단 그리드에 데이터 표시처리
 */
function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB, "EXTRA_WORK_DIV");
}

/**
 * 저장 처리 성공 했을 경우 처리
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "OUTBOUND_NO"
        ]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDSUB, {
        selectKey: "EXTRA_WORK_DIV"
    });

    _Inquiry();

    G_GRDMASTER.lastKeyVal = lastKeyVal;
    G_GRDSUB.lastKeyVal = lastKeyVal2;
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDSUB);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}
