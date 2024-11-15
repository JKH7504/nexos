/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC05011P0
 *  프로그램명         : 재고분할등록 팝업
 *  프로그램설명       : 재고분할등록 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-09-27
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-09-27    ASETEC           신규작성
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
            container: "#divDetailView",
            grids: [
                "#grdDetail"
            ],
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        },
        masterData: null
    });

    // 버튼 클릭 이벤트 연결
    $("#btnNew").click(_New); // 신규버튼
    $("#btnDelete").click(_Delete); // 삭제버튼
    $("#btnSave").click(_Save); // 저장버튼
    $("#btnClose").click(onCancel); // 닫기버튼

    $NC.setEnable("#edtItem_Cd", false); // 상품코드 비활성화
    $NC.setEnable("#edtItem_Nm", false); // 상품명 비활성화
    $NC.setEnable("#edtBrand_Nm", false); // 브랜드명 비활성화
    $NC.setEnable("#edtItem_State_F", false); // 상품상태 비활성화
    $NC.setEnable("#edtLocation_Cd", false); // 로케이션 비활성화
    $NC.setEnable("#edtBatch_No", false); // 제조배치 비활성화
    $NC.setEnable("#edtStock_Date", false); // 입고일자 비활성화
    $NC.setEnable("#edtValid_Date", false); // 사용기한 비활성화
    $NC.setEnable("#edtPstock_Qty", false); // 출고가능량 비활성화
    $NC.setEnable("#edtRemark1", false); // 비고 비활성화

    // 그리드 초기화
    grdDetailInitialize();

    // 신규/삭제 버튼 툴팁 세팅
    $NC.setTooltip("#btnNew", $NC.getDisplayMsg("JS.LCC05011P0.001", "신규"));
    $NC.setTooltip("#btnDelete", $NC.getDisplayMsg("JS.LCC05011P0.002", "삭제"));
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    // 재고정보 에디터 값 세팅
    $NC.setValue("#edtItem_Cd", $NC.G_VAR.G_PARAMETER.P_ITEM_CD);
    $NC.setValue("#edtItem_Nm", $NC.G_VAR.G_PARAMETER.P_ITEM_NM);
    $NC.setValue("#edtBrand_Nm", $NC.G_VAR.G_PARAMETER.P_BRAND_NM);
    $NC.setValue("#edtItem_State_F", $NC.G_VAR.G_PARAMETER.P_ITEM_STATE_F);
    $NC.setValue("#edtLocation_Cd", $NC.G_VAR.G_PARAMETER.P_LOCATION_CD);
    $NC.setValue("#edtStock_Date", $NC.G_VAR.G_PARAMETER.P_STOCK_DATE);
    $NC.setValue("#edtValid_Date", $NC.G_VAR.G_PARAMETER.P_VALID_DATE);
    $NC.setValue("#edtBatch_No", $NC.G_VAR.G_PARAMETER.P_BATCH_NO);
    $NC.setValue("#edtPstock_Qty", $NC.G_VAR.G_PARAMETER.P_PSTOCK_QTY);
    $NC.setValue("#edtRemark1", $NC.G_VAR.G_PARAMETER.P_REMARK1);

    $NC.G_VAR.masterData = {
        CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        LOCATION_CD: $NC.G_VAR.G_PARAMETER.P_LOCATION_CD,
        BRAND_CD: $NC.G_VAR.G_PARAMETER.P_BRAND_CD,
        ITEM_CD: $NC.G_VAR.G_PARAMETER.P_ITEM_CD,
        ITEM_STATE: $NC.G_VAR.G_PARAMETER.P_ITEM_STATE,
        ITEM_LOT: $NC.G_VAR.G_PARAMETER.P_ITEM_LOT,
        STOCK_DATE: $NC.G_VAR.G_PARAMETER.P_STOCK_DATE,
        STOCK_IN_GRP: $NC.G_VAR.G_PARAMETER.P_STOCK_IN_GRP,
        STOCK_ID: $NC.G_VAR.G_PARAMETER.P_STOCK_ID,
        VALID_DATE: $NC.G_VAR.G_PARAMETER.P_VALID_DATE,
        BATCH_NO: $NC.G_VAR.G_PARAMETER.P_BATCH_NO,
        STOCK_QTY: $NC.G_VAR.G_PARAMETER.P_STOCK_QTY,
        PSTOCK_QTY: $NC.G_VAR.G_PARAMETER.P_PSTOCK_QTY,
        REMARK1: $NC.G_VAR.G_PARAMETER.P_REMARK1
    };
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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

    // 현재 선택된 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var rCount = G_GRDDETAIL.data.getLength();
    if (rCount > 0) {
        // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
        var rowData = G_GRDDETAIL.data.getItem(rCount - 1);
        if (rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.setFocusGrid(G_GRDDETAIL, rCount - 1, G_GRDDETAIL.view.getColumnIndex("VALID_DATE"), true);
            return;
        }

        var sumStockQty = $NC.getGridSumVal(G_GRDDETAIL, {
            sumKey: "STOCK_QTY"
        });
        if (Number($NC.G_VAR.masterData.PSTOCK_QTY) == sumStockQty) {
            alert($NC.getDisplayMsg("JS.LCC05011P0.003", "출고가능량을 초과하여 등록할 수 없습니다."));
            return;
        }
    }

    var newRowData = {
        VALID_DATE: null,
        BATCH_NO: null,
        STOCK_QTY: 0,
        REMARK1: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };
    G_GRDDETAIL.data.addItem(newRowData);

    $NC.setGridSelectRow(G_GRDDETAIL, rCount);
    if (rCount == 0) {
        $NC.setGridDisplayRows(G_GRDDETAIL, rCount + 1, G_GRDDETAIL.data.getLength());
    }

    // 수정 상태로 변경
    G_GRDDETAIL.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdDetailOnNewRecord({
        row: rCount,
        rowData: newRowData
    });

}

/**
 * 저장
 */
function _Save() {

    // 현재 선택된 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var rCount = G_GRDDETAIL.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LCC05011P0.004", "저장할 데이터가 없습니다."));
        return;
    }

    var searchIndex = $NC.getGridSearchRow(G_GRDDETAIL, {
        searchKey: [
            "VALID_DATE",
            "BATCH_NO"
        ],
        searchVal: [
            $NC.G_VAR.masterData.VALID_DATE,
            $NC.G_VAR.masterData.BATCH_NO
        ]
    });

    if (searchIndex > -1) {
        alert($NC.getDisplayMsg("JS.LCC05011P0.005", "분할 대상 재고와 동일한 데이터가 존재합니다."));
        $NC.setGridSelectRow(G_GRDDETAIL, searchIndex);
        return;
    }

    // 현재 수정모드면 grid Editor Lock
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
        G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    for (var row = 0; row < rCount; row++) {
        var searchRows = [];
        var rowData = G_GRDDETAIL.data.getItem(row);

        searchRows = $NC.getGridSearchRows(G_GRDDETAIL, {
            searchKey: [
                "VALID_DATE",
                "BATCH_NO"
            ],
            searchVal: [
                rowData.VALID_DATE,
                rowData.BATCH_NO
            ]
        });

        if (searchRows.length > 1) {
            alert($NC.getDisplayMsg("JS.LCC05011P0.006", "중복된 데이터가 존재합니다."));
            $NC.setGridSelectRow(G_GRDDETAIL, row);
            return;
        }

        dsMaster.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_LOCATION_CD: $NC.G_VAR.masterData.LOCATION_CD,
            P_BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
            P_ITEM_CD: $NC.G_VAR.masterData.ITEM_CD,
            P_ITEM_STATE: $NC.G_VAR.masterData.ITEM_STATE,
            P_ITEM_LOT: $NC.G_VAR.masterData.ITEM_LOT,
            P_STOCK_DATE: $NC.G_VAR.masterData.STOCK_DATE,
            P_STOCK_IN_GRP: $NC.G_VAR.masterData.STOCK_IN_GRP,
            P_STOCK_ID: $NC.G_VAR.masterData.STOCK_ID,
            P_VALID_DATE: rowData.VALID_DATE,
            P_BATCH_NO: rowData.BATCH_NO,
            P_STOCK_QTY: rowData.STOCK_QTY,
            P_REMARK1: rowData.REMARK1
        });

    }

    if (!confirm($NC.getDisplayMsg("JS.LCC05011P0.007", "재고분할 처리하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/LCC05010E0/callPorpertiesSplit.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC05011P0.008", "삭제할 데이터가 없습니다."));
        return;
    }

    if (G_GRDDETAIL.lastRow == null) {
        alert($NC.getDisplayMsg("JS.LCC05011P0.009", "삭제할 데이터를 선택하십시오"));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    G_GRDDETAIL.data.deleteItem(rowData.id);

    // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
    if (G_GRDDETAIL.lastRow > 1) {
        $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
    } else {
        G_GRDDETAIL.lastRow = null;
        $NC.setGridSelectRow(G_GRDDETAIL, 0);

        if (G_GRDDETAIL.data.getLength() == 0) {
            $NC.setGridDisplayRows(G_GRDDETAIL, 0, 0);
        }
    }

    // 마지막 선택 Row 수정 상태 복원
    G_GRDDETAIL.lastRowModified = false;
}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_OK, $NC.G_VAR.resultInfo);
    $NC.onPopupClose();
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "제조일자",
        minWidth: 100,
        cssClass: "styCenter",
        editor: Slick.Editors.Date
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치",
        minWidth: 100,
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        minWidth: 70,
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
        minWidth: 200,
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: null,
        sortCol: "VALID_DATE",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("VALID_DATE"), true);
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    $NC.G_VAR.resultInfo = G_GRDDETAIL.data.getItem(row);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
        case "VALID_DATE":
            if ($NC.isNotNull(rowData.VALID_DATE)) {
                if (!$NC.isDate(rowData.VALID_DATE)) {
                    alert($NC.getDisplayMsg("JS.LCC05011P0.010", "제조일자를 정확히 입력하십시오."));
                    rowData.VALID_DATE = "";
                    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("VALID_DATE"), true);
                    return false;
                } else {
                    rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
                    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
                }
            }
            break;
    }

    G_GRDDETAIL.data.updateItem(rowData.id, rowData);

    // 마지막 선택 Row 수정 상태로 변경
    G_GRDDETAIL.lastRowModified = true;
}

/**
 * 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

    if (!G_GRDDETAIL.lastRowModified) {
        return true;
    }
    var rowData = G_GRDDETAIL.data.getItem(row);
    if ($NC.isNull(rowData)) {
        return true;
    }

    // 신규일 때 키 값이 없으면 신규 취소
    if (rowData.CRUD == $ND.C_DV_CRUD_N) {
        if (rowData.STOCK_QTY == 0) {
            G_GRDDETAIL.data.deleteItem(rowData.id);
            if (row > 0) {
                $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
            } else {
                $NC.setGridDisplayRows(G_GRDDETAIL);
            }
            return true;
        }
    }

    if ($NC.isNull(rowData.STOCK_QTY) || Number(rowData.STOCK_QTY) == 0) {
        alert($NC.getDisplayMsg("JS.LCC05011P0.011", "분할수량에 0보다 큰 수량을 입력하십시오."));
        $NC.setFocusGrid(G_GRDDETAIL, row, G_GRDDETAIL.view.getColumnIndex("STOCK_QTY"), true);
        return false;
    }

    var sumStockQty = $NC.getGridSumVal(G_GRDDETAIL, {
        sumKey: "STOCK_QTY"
    });
    if (Number($NC.G_VAR.masterData.PSTOCK_QTY) < sumStockQty) {
        alert($NC.getDisplayMsg("JS.LCC05011P0.012", "분할수량이 출고가능량보다 클 수 없습니다."));
        $NC.setFocusGrid(G_GRDDETAIL, row, G_GRDDETAIL.view.getColumnIndex("STOCK_QTY"), true);
        return false;
    }

    if (rowData.CRUD == $ND.C_DV_CRUD_N) {
        rowData.CRUD = $ND.C_DV_CRUD_C;
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    }
    return true;
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}
