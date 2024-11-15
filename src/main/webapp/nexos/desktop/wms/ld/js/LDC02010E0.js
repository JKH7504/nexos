/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC02010E0
 *  프로그램명         : 도크지정
 *  프로그램설명       : 도크지정 화면 Javascript
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
        autoResizeView: {
            container: "#divMasterView",
            grids: [
                "#grdMaster",
                "#grdDetail",
                "#grdSub"
            ]
        },
        dockChangeType: "",
        // 체크할 정책 값
        policyVal: {
            CM510: "" // 운송권역 관리정책
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();
    grdDockMasterInitialize();

    $NC.setInitDatePicker("#dtpQOutbound_Date");

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
            // 출고차수 콤보 값 설정
            refreshDeliveryBatchCombo();
        }
    });

    // 버튼 이벤트 연결
    $("#btnChangeDock_Dock").click(showDockMasterOverlay); // 도크변경
    $("#btnChangeDock_Outbound").click(showDockMasterOverlay); // 배송처별 도크변경
    $("#btnChangeDock_Delivery").click(showDockMasterOverlay); // 도크 미지정 배송처에 도크 설정
    $("#btnDockMasterOverlayClose").click(function() { // 도크변경 창 닫기
        $("#divDockMasterOverlay").hide();
    });
    $("#btnDockSelect").click(function(e) {
        grdDockMasterOnDblClick(e, G_GRDDOCKMASTER.view.getActiveCell());
    });

    // 출고확정의 출고차수 다시보기 이미지 클릭시 처리
    $("#btnQDelivery_Batch").click(function() {
        // 출고차수 콤보 값 설정
        refreshDeliveryBatchCombo();
    });

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    });

    // 프로그램 권한 설정
    setUserProgramPermission();

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "v", 500);
    $NC.setInitSplitter("#divSubViewDetail", "h", 350);
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

    if (!$NC.isVisible("#divDockMasterOverlay")) {
        return;
    }

    var $parent = $("#divDockMasterView").parent();
    $NC.resizeGridView("#divDockMasterView", "#grdDockMaster", null, $parent.height()
        - $NC.getViewHeight($parent.children().not("#divDockMasterView")));
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            refreshDeliveryBatchCombo();
            break;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC02010E0.001", "출고일자를 정확히 입력하십시오."));
            refreshDeliveryBatchCombo();
            break;
        case "DELIVERY_BATCH":
            break;
    }

    onChangingCondition();
}

function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDSUB);
    $NC.clearGridData(G_GRDDOCKMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.003", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var DELIVERY_BATCH = $NC.getValue("#cboQDelivery_Batch");
    if ($NC.isNull(DELIVERY_BATCH)) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.004", "운송차수를 선택하십시오."));
        $NC.setFocus("#cboQDelivery_Batch");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_DELIVERY_BATCH: DELIVERY_BATCH
    };
    // 데이터 조회
    $NC.serviceCall("/LDC02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDOCKMASTER);

    G_GRDDOCKMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LDC02010E0/getDataSet.do", $NC.getGridParams(G_GRDDOCKMASTER), onGetDockMaster);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);

    G_GRDSUB.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_DELIVERY_BATCH: DELIVERY_BATCH,
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC02010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.003", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var DELIVERY_BATCH = $NC.getValue("#cboQDelivery_Batch");
    if ($NC.isNull(DELIVERY_BATCH)) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.004", "운송차수를 선택하십시오."));
        $NC.setFocus("#cboQDelivery_Batch");
        return;
    }

    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var DELIVERY_BATCH_F = $NC.getValueCombo("#cboQDelivery_Batch", "F");

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LDC02 - 도크출하지시서
        case "PAPER_LDC02":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                checkColumnId: "CHECK_YN",
                valueColumns: "DOCK_NO"
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_DELIVERY_BATCH: DELIVERY_BATCH,
                P_CENTER_CD_F: CENTER_CD_F,
                P_DELIVERY_BATCH_F: DELIVERY_BATCH_F
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

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function refreshDeliveryBatchCombo() {

    // 조회조건 - 출고차수 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_DELIVERY_BATCH",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date")
        }
    }, {
        selector: "#cboQDelivery_Batch",
        codeField: "DELIVERY_BATCH",
        nameField: "DELIVERY_BATCH",
        fullNameField: "DELIVERY_BATCH_F"
    });
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
        id: "DOCK_NO",
        field: "DOCK_NO",
        name: "도크번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DOCK_DIV_D",
        field: "DOCK_DIV_D",
        name: "접안차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "MAX_TON_DIV_D",
        field: "MAX_TON_DIV_D",
        name: "최대접안톤구분"
    });
    $NC.setGridColumn(columns, {
        id: "CALL_CNT",
        field: "CALL_CNT",
        name: "콜수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "총PLT",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "총BOX",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1,
        specialRow: {
            compareKey: "CALL_CNT",
            compareVal: "0",
            compareOperator: ">",
            cssClass: "styDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LDC02010E0.RS_MASTER",
        sortCol: "DOCK_NO",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-cell",
            targetChecked: true, // 체크된 데이터로
            onGetDraggable: function(e, dd) {
                return G_GRDMASTER.data.getLength() > 1; // 챠량정보 1건 이상일 때만
            },
            // helperMessageFormat: "선택 차량 [%d건]을 이동",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = dd.dragGridObject.data.getItem(dd.dragRows[0]);
                var result;
                if (dd.dragCount == 1) {
                    result = "[도크: " + $NC.getDisplayCombo(rowData.DOCK_NO, rowData.DOCK_DIV_D) + "]를 이동";
                } else {
                    result = "[도크: " + $NC.getDisplayCombo(rowData.DOCK_NO, rowData.DOCK_DIV_D) + "] 외 " + (dd.dragCount - 1) + "건 이동";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdMaster,#grdDetail,#grdSub",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV

                var rowData = G_GRDMASTER.data.getItem(dd.dropCell.row);
                switch (dd.dragElement) {
                    case "grdMaster":
                        changeDock($NC.getGridObject(dd.dragElement), rowData.DOCK_NO, "1");
                        break;
                    case "grdDetail":
                        changeDock($NC.getGridObject(dd.dragElement), rowData.DOCK_NO, "2");
                        break;
                    case "grdSub":
                        changeDock($NC.getGridObject(dd.dragElement), rowData.DOCK_NO, "3");
                        break;
                }
            }
        }
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

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
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
        P_DOCK_NO: rowData.DOCK_NO,
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC02010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

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
        id: "AREA_CD",
        field: "AREA_CD",
        name: "권역"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "권역명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
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
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "PLT수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "BOX수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM",
        field: "ADDR_NM",
        name: "주소"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailInitialize() {

    var options = {
        frozenColumn: 5
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LDC02010E0.RS_DETAIL",
        sortCol: "DELIVERY_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-cell",
            targetChecked: true, // 체크된 데이터로
            onGetDraggable: function(e, dd) {
                return G_GRDMASTER.data.getLength() > 1; // 도크정보 1건 이상일 때만
            },
            // helperMessageFormat: "선택 배송처 [%d건]을 이동",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = dd.dragGridObject.data.getItem(dd.dragRows[0]);
                var result;
                if (dd.dragCount == 1) {
                    result = "[배송처: " + $NC.getDisplayCombo(rowData.DELIVERY_CD, rowData.DELIVERY_NM) + "]를 이동";
                } else {
                    result = "[배송처: " + $NC.getDisplayCombo(rowData.DELIVERY_CD, rowData.DELIVERY_NM) + "] 외 " + (dd.dragCount - 1) + "건 이동";
                }
                return result;
            }
        }
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

function grdDetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDDETAIL, e, args);
            break;
    }
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSubOnGetColumns() {

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
        id: "AREA_CD",
        field: "AREA_CD",
        name: "권역"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "권역명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
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
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "PLT수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "BOX수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM",
        field: "ADDR_NM",
        name: "주소"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubInitialize() {

    var options = {
        frozenColumn: 5
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LDC02010E0.RS_SUB",
        sortCol: "DELIVERY_CD",
        gridOptions: options,
        dragOptions: {
            targetChecked: true, // 체크된 데이터로
            onGetDraggable: function(e, dd) {
                return G_GRDMASTER.data.getLength() > 1; // 도크정보 1건 이상일 때만
            },
            // helperMessageFormat: "선택 배송처 [%d건]을 이동",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = dd.dragGridObject.data.getItem(dd.dragRows[0]);
                var result;
                if (dd.dragCount == 1) {
                    result = "[배송처: " + $NC.getDisplayCombo(rowData.DELIVERY_CD, rowData.DELIVERY_NM) + "]를 이동";
                } else {
                    result = "[배송처: " + $NC.getDisplayCombo(rowData.DELIVERY_CD, rowData.DELIVERY_NM) + "] 외 " + (dd.dragCount - 1) + "건 이동";
                }
                return result;
            }
        }
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onHeaderClick.subscribe(grdSubOnHeaderClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHECK_YN");
}

function grdSubOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDSUB, e, args);
            break;
    }
}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

function grdDockMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DOCK_NO",
        field: "DOCK_NO",
        name: "도크번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DOCK_DIV_D",
        field: "DOCK_DIV_D",
        name: "접안차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "MAX_TON_DIV_D",
        field: "MAX_TON_DIV_D",
        name: "최대접안톤구분"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDockMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDockMaster", {
        columns: grdDockMasterOnGetColumns(),
        queryId: "LDC02010E0.RS_SUB1",
        sortCol: "DOCK_NO",
        gridOptions: options
    });

    G_GRDDOCKMASTER.view.onSelectedRowsChanged.subscribe(grdDockMasterOnAfterScroll);
    G_GRDDOCKMASTER.view.onDblClick.subscribe(grdDockMasterOnDblClick);
}

function grdDockMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDOCKMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDOCKMASTER, row + 1);
}

function grdDockMasterOnDblClick(e, args) {

    var rowData = G_GRDDOCKMASTER.data.getItem(args.row);
    if ($NC.isNull(rowData)) {
        return;
    }

    $("#divDockMasterOverlay").hide();
    var grdObject;
    switch ($NC.G_VAR.dockChangeType) {
        case "1":
            grdObject = G_GRDMASTER;
            break;
        case "2":
            grdObject = G_GRDDETAIL;
            break;
        case "3":
            grdObject = G_GRDSUB;
            break;
    }
    if ($NC.isNotNull(grdObject)) {
        changeDock(grdObject, rowData.DOCK_NO, $NC.G_VAR.dockChangeType);
    }
}

/**
 * 도크마스터 데이터 필터 - 현재 선택한 도크 제외
 */
function grdDockMasterOnFilter(item) {

    if ($.isArray(G_GRDDOCKMASTER.lastFilterVal)) {
        var canDisplay = true;
        for ( var rIndex in G_GRDDOCKMASTER.lastFilterVal) {
            if (G_GRDDOCKMASTER.lastFilterVal[rIndex] == item.DOCK_NO) {
                canDisplay = false;
                break;
            }
        }
        return canDisplay;
    } else {
        return G_GRDDOCKMASTER.lastFilterVal != item.DOCK_NO;
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "DOCK_NO")) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = $NC.iif(G_GRDMASTER.data.getLength() > 0, "1", "0");

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 권한 설정
    setUserProgramPermission();
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);

    $NC.setInitGridAfterOpen(G_GRDDETAIL);
}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB);
}

function onGetDockMaster(ajaxData) {

    $NC.setInitGridData(G_GRDDOCKMASTER, ajaxData, grdDockMasterOnFilter);
    $NC.setInitGridAfterOpen(G_GRDDOCKMASTER, "DOCK_NO");
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    // var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    // selectKey: "DOCK_NO"
    // });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = G_GRDMASTER.lastNewKeyVal;
    G_GRDMASTER.lastNewKeyVal = null;
}

/**
 * 도크변경조정
 * 
 * @param grdObject
 *        대상 그리드
 * @param dockNo
 *        변경할 도크번호
 * @param changeType
 *        변경타입 (1: 도크단위, 2: 지정 배송처, 3: 미지정 배송처)
 */
function changeDock(grdObject, dockNo, changeType) {

    // 현재 수정모드면
    if (grdObject.view.getEditorLock().isActive()) {
        grdObject.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    var rowData, rIndex, rCount;
    switch (changeType) {
        // 도크
        case "1":
            for (rIndex = 0, rCount = grdObject.data.getLength(); rIndex < rCount; rIndex++) {
                rowData = grdObject.data.getItem(rIndex);
                if (rowData.CRUD != $ND.C_DV_CRUD_R && rowData.CHECK_YN == $ND.C_YES) {
                    if (rowData.DOCK_NO == dockNo) {
                        alert($NC.getDisplayMsg("JS.LDC02010E0.005", "같은 도크번호로 변경 할 수 없습니다."));
                        return;
                    }
                    if (Number(rowData.CALL_CNT) <= 0) {
                        continue;
                    }
                    dsMaster.push({
                        P_CENTER_CD: rowData.CENTER_CD,
                        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
                        P_DOCK_NO: $NC.isNull(rowData.DOCK_NO) ? "" : rowData.DOCK_NO,
                        P_NEW_DOCK_NO: dockNo,
                        P_CRUD: rowData.CRUD
                    });
                }
            }
            break;
        // 도크 지정/미지정 배송처
        case "2":
        case "3":
            for (rIndex = 0, rCount = grdObject.data.getLength(); rIndex < rCount; rIndex++) {
                rowData = grdObject.data.getItem(rIndex);
                if (rowData.CRUD != $ND.C_DV_CRUD_R && rowData.CHECK_YN == $ND.C_YES) {
                    if (rowData.DOCK_NO == dockNo) {
                        alert($NC.getDisplayMsg("JS.LDC02010E0.005", "같은 도크번호로 변경 할 수 없습니다."));
                        return;
                    }
                    dsMaster.push({
                        P_CENTER_CD: rowData.CENTER_CD,
                        P_BU_CD: rowData.BU_CD,
                        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
                        P_CAR_CD: rowData.CAR_CD,
                        P_DOCK_NO: $NC.isNull(rowData.DOCK_NO) ? "" : rowData.DOCK_NO,
                        P_NEW_DOCK_NO: dockNo,
                        P_CRUD: rowData.CRUD
                    });
                }
            }
            break;
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.006", "도크 변경할 데이터를 선택하십시오."));
        return;
    }

    G_GRDMASTER.lastNewKeyVal = dockNo;
    $NC.serviceCall("/LDC02010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_CHANGE_TYPE: changeType,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

function showDockMasterOverlay(e) {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.007", "도크 변경할 데이터가 없습니다."));
        return;
    }

    var $view = $(e.target);
    switch ($view[0].id) {
        case "btnChangeDock_Dock":
            $NC.G_VAR.dockChangeType = "1";

            var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
                searchKey: "CHECK_YN",
                searchVal: $ND.C_YES
            });
            if (searchRows.length > 1) {
                if (!confirm($NC.getDisplayMsg("JS.LDC02010E0.008", "여러 도크번호를 다른 도크번호로 변경하시겠습니까?"))) {
                    return;
                }
            }
            break;
        case "btnChangeDock_Outbound":
            $NC.G_VAR.dockChangeType = "2";
            break;
        case "btnChangeDock_Delivery":
            $NC.G_VAR.dockChangeType = "3";
            break;
    }

    var rowData;
    if ($NC.G_VAR.dockChangeType != "3") {
        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        G_GRDDOCKMASTER.lastFilterVal = rowData.DOCK_NO;
    } else {
        G_GRDDOCKMASTER.lastFilterVal = [];
        for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(rIndex);
            if (rowData.CHECK_YN != $ND.C_YES) {
                continue;
            }
            G_GRDDOCKMASTER.lastFilterVal.push(rowData.DOCK_NO);
        }
    }
    G_GRDDOCKMASTER.data.refresh();
    if (G_GRDDOCKMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC02010E0.009", "지정 가능한 도크가 없습니다."));
        return;
    }

    $NC.showOverlay("#divDockMasterOverlay", {
        title: $NC.getDisplayMsg("JS.LDC02010E0.010", "도크 변경"),
        fullscreen: false,
        width: 400,
        height: 500,
        onComplete: function() {
            $NC.onGlobalResize();
            G_GRDDOCKMASTER.view.focus();
            G_GRDDOCKMASTER.view.invalidate();
            $NC.setGridSelectRow(G_GRDDOCKMASTER, 0);
        }
    });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnableButton("#divMasterView", permission.canSave && enable);
}
