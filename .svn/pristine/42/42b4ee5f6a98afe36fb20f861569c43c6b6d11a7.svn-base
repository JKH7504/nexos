/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC01010E0
 *  프로그램명         : 배차조정
 *  프로그램설명       : 배차조정 화면 Javascript
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
        carChangeType: "",
        // 체크할 정책 값
        policyVal: {
            CM510: "" // 운송권역 관리정책
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();
    grdCarMasterInitialize();

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
    $("#btnInitTransRoute_M").bind("click", function(e) {
        var view = $(this);
        btnInitTransRoutOnClick(e, view);
    });// 운송차수 전체차량 루트초기화
    $("#btnInitTransRoute_D").bind("click", function(e) {
        var view = $(this);
        btnInitTransRoutOnClick(e, view);
    });// 차량 운송루트초기화
    $("#btnMoveUpRoute").click(btnMoveUpRouteOnClick);// 운송루트 변경
    $("#btnMoveDownRoute").click(btnMoveDownRouteOnClick);// 운송루트 변경
    $("#btnChangeCar_Car").click(showCarMasterOverlay); // 차량변경
    $("#btnChangeCar_Outbound").click(showCarMasterOverlay); // 전표단위 차량변경
    $("#btnChangeCar_Line").click(showCarMasterOverlay); // 상품단위 차량변경
    $("#btnCarMasterOverlayClose").click(function() { // 차량변경 창 닫기
        $("#divCarMasterOverlay").hide();
    });
    $("#btnSplitOrder").click(btnSplitOrderOnClick); // 전표분할
    $("#btnCarSelect").click(function(e) {
        grdCarMasterOnDblClick(e, G_GRDCARMASTER.view.getActiveCell());
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
    $NC.setInitSplitter("#divMasterView", "v", 600);
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

    if (!$NC.isVisible("#divCarMasterOverlay")) {
        return;
    }

    var $parent = $("#divCarMasterView").parent();
    $NC.resizeGridView("#divCarMasterView", "#grdCarMaster", null, $parent.height() - $NC.getViewHeight($parent.children().not("#divCarMasterView")));
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
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC01010E0.001", "출고일자를 정확히 입력하십시오."));
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
    $NC.clearGridData(G_GRDCARMASTER);

    // 수량정보 필드 readOnly
    $NC.setValue("#edtL1_Total_Plt", "0");
    $NC.setValue("#edtL1_Total_Box", "0");
    $NC.setValue("#edtL1_Total_Weight", "0");
    $NC.setValue("#edtL1_Total_Cbm", "0");

    $NC.setValue("#edtL2_Total_Plt", "0");
    $NC.setValue("#edtL2_Total_Box", "0");
    $NC.setValue("#edtL2_Total_Weight", "0");
    $NC.setValue("#edtL2_Total_Cbm", "0");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.003", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var DELIVERY_BATCH = $NC.getValue("#cboQDelivery_Batch");
    if ($NC.isNull(DELIVERY_BATCH)) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.004", "운송차수를 선택하십시오."));
        $NC.setFocus("#cboQDelivery_Batch");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_DELIVERY_BATCH: DELIVERY_BATCH,
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC01010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDCARMASTER);

    G_GRDCARMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_CAR_CD: "",
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC01010E0/getDataSet.do", $NC.getGridParams(G_GRDCARMASTER), onGetCarMaster);
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
    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.005", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var dsDetail = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_CAR_CD: rowData.CAR_CD,
            P_CUST_CD: rowData.CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_RDELIVERY_CD: rowData.RDELIVERY_CD,
            P_DELIVERY_MSG: rowData.DELIVERY_MSG,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.006", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LDC01010E0/saveMsgChange.do", {
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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
        alert($NC.getDisplayMsg("JS.LDC01010E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.003", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var DELIVERY_BATCH = $NC.getValue("#cboQDelivery_Batch");
    if ($NC.isNull(DELIVERY_BATCH)) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.004", "운송차수를 선택하십시오."));
        $NC.setFocus("#cboQDelivery_Batch");
        return;
    }

    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var DELIVERY_BATCH_F = $NC.getValueCombo("#cboQDelivery_Batch", "F");

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LDC01 - 상차지시서
        case "PAPER_LDC01":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                checkColumnId: "CHECK_YN",
                valueColumns: "CAR_CD"
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

    // 수량정보 세팅.
    var rowData = grdObject.data.getItem(args.row);
    setSummaryInfo(grdObject, rowData.CHECK_YN, args.row);
}

/**
 * 수량정보 세팅
 */
function setSummaryInfo(grdSelector, checkValue, row) {

    var grdObject = $NC.getGridObject(grdSelector);
    var viewPrefix = grdObject.selector == "#grdDetail" ? "#edtL1_Total" : "#edtL2_Total";
    var rowData, sumVals;
    // 전체 계산
    if (arguments.length == 1) {
        sumVals = $NC.getGridSumVal(grdObject, {
            searchKey: "CHECK_YN",
            searchVal: $ND.C_YES,
            sumKey: [
                "TRANS_PLT",
                "TRANS_BOX",
                "TRANS_WEIGHT",
                "TRANS_CBM"
            ]
        });
    }
    // 단건 계산
    else {
        sumVals = {
            TRANS_PLT: $NC.toNumber($NC.getValue(viewPrefix + "_Plt")),
            TRANS_BOX: $NC.toNumber($NC.getValue(viewPrefix + "_Box")),
            TRANS_WEIGHT: $NC.toNumber($NC.getValue(viewPrefix + "_Weight")),
            TRANS_CBM: $NC.toNumber($NC.getValue(viewPrefix + "_Cbm"))
        };

        rowData = grdObject.data.getItem(row);
        if (checkValue == $ND.C_YES) {
            sumVals.TRANS_PLT += $NC.toNumber(rowData.TRANS_PLT);
            sumVals.TRANS_BOX += $NC.toNumber(rowData.TRANS_BOX);
            sumVals.TRANS_WEIGHT += $NC.toNumber(rowData.TRANS_WEIGHT);
            sumVals.TRANS_CBM += $NC.toNumber(rowData.TRANS_CBM);
        } else {
            sumVals.TRANS_PLT -= $NC.toNumber(rowData.TRANS_PLT);
            sumVals.TRANS_BOX -= $NC.toNumber(rowData.TRANS_BOX);
            sumVals.TRANS_WEIGHT -= $NC.toNumber(rowData.TRANS_WEIGHT);
            sumVals.TRANS_CBM -= $NC.toNumber(rowData.TRANS_CBM);
        }
    }

    $NC.setValue(viewPrefix + "_Plt", $NC.getDisplayNumber($NC.getRoundVal(sumVals.TRANS_PLT, 3)));
    $NC.setValue(viewPrefix + "_Box", $NC.getDisplayNumber($NC.getRoundVal(sumVals.TRANS_BOX, 3)));
    $NC.setValue(viewPrefix + "_Weight", $NC.getDisplayNumber($NC.getRoundVal(sumVals.TRANS_WEIGHT, 3)));
    $NC.setValue(viewPrefix + "_Cbm", $NC.getDisplayNumber($NC.getRoundVal(sumVals.TRANS_CBM, 3)));
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
        id: "AREA_CD",
        field: "AREA_CD",
        name: "권역"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운전자성명"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "권역명"
    });
    $NC.setGridColumn(columns, {
        id: "CALL_CNT",
        field: "CALL_CNT",
        name: "콜수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "운송박스수",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "운송파렛트수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_BOX",
        field: "CAPACITY_BOX",
        name: "적재박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_TON_DIV_D",
        field: "CAR_TON_DIV_D",
        name: "차량톤",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_WEIGHT",
        field: "CAPACITY_WEIGHT",
        name: "적재중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "운송중량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_CBM",
        field: "CAPACITY_CBM",
        name: "적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "운송용적",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_CBM"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_DIV_D",
        field: "TRANS_DIV_D",
        name: "운송구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_KEEP_DIV_D",
        field: "CAR_KEEP_DIV_D",
        name: "차량보관구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 2,
        specialRow: {
            compareKey: "FULL_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styOver"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LDC01010E0.RS_MASTER",
        sortCol: "AREA_CD",
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
                    result = "[차량: " + $NC.getDisplayCombo(rowData.CAR_CD, rowData.CAR_NM) + "]를 이동";
                } else {
                    result = "[차량: " + $NC.getDisplayCombo(rowData.CAR_CD, rowData.CAR_NM) + "] 외 " + (dd.dragCount - 1) + "건 이동";
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
                        changeCar($NC.getGridObject(dd.dragElement), rowData.CAR_CD, "1");
                        break;
                    case "grdDetail":
                        changeCar($NC.getGridObject(dd.dragElement), rowData.CAR_CD, "2");
                        break;
                    case "grdSub":
                        changeCar($NC.getGridObject(dd.dragElement), rowData.CAR_CD, "3");
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
        P_CAR_CD: rowData.CAR_CD,
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    // 데이터 조회
    $NC.serviceCall("/LDC01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

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
        id: "TRANS_ROUTE",
        field: "TRANS_ROUTE",
        name: "운송루트",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처"
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
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
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
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "PLT수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM",
        field: "ADDR_NM",
        name: "주소"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_MSG",
        field: "DELIVERY_MSG",
        name: "배송처공지사항",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_ROUTE",
        field: "DELIVERY_ROUTE",
        name: "배송루트",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "중량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "CBM",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_CBM"),
        cssClass: "styRight"
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
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailInitialize() {

    var options = {
        frozenColumn: 3,
        editable: true,
        autoEdit: true,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.CONFIRM_YN == $ND.C_NO) {
                    return;
                }
                return "styError";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LDC01010E0.RS_DETAIL",
        sortCol: "AREA_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-cell",
            targetChecked: true, // 체크된 데이터로
            onGetDraggable: function(e, dd) {
                return G_GRDMASTER.data.getLength() > 1; // 챠량정보 1건 이상일 때만
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
            },
            onCheckedRowsChanged: function(e, args) {
                // 체크 참조 정보
                // args.dragGridObject: Grid Object
                // args.allCheckedRows: 전체 체크된 Row Indexes
                // args.newCheckedRows: 신규 체크된 Row Indexes
                for (var rIndex = 0, rCount = args.newCheckedRows.length; rIndex < rCount; rIndex++) {
                    setSummaryInfo(args.dragGridObject, $ND.C_YES, args.newCheckedRows[rIndex]);
                }
            }
        }
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
    G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

function grdDetailOnBeforeEditCell(e, args) {

    return true;
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDDETAIL, e, args);
            // 수량정보 세팅.
            setSummaryInfo(G_GRDDETAIL);
            break;
    }
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAIL.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
        data: null
    });

    G_GRDSUB.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_CAR_CD: rowData.CAR_CD,
        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
        P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
        P_DELIVERY_CD: rowData.DELIVERY_CD,
        P_RDELIVERY_CD: rowData.RDELIVERY_CD
    };
    // 데이터 조회
    $NC.serviceCall("/LDC01010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

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
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        resizable: false,
        cssClass: "styRight"
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
        id: "ENTRY_BOX",
        field: "ENTRY_BOX",
        name: "BOX수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_EA",
        field: "ENTRY_EA",
        name: "EA수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
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
        id: "TRANS_EA",
        field: "TRANS_EA",
        name: "EA수량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
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
        id: "BOX_IN_PLT",
        field: "BOX_IN_PLT",
        name: "파렛트입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "중량",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "CBM",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_CBM"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_CBM",
        field: "BOX_CBM",
        name: "박스용적",
        cssClass: "styRight"
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
        id: "BU_LINE_NO",
        field: "BU_LINE_NO",
        name: "전표순번"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubInitialize() {

    var options = {
        frozenColumn: 4,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.CONFIRM_YN == $ND.C_NO) {
                    return;
                }
                return "styError";
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LDC01010E0.RS_SUB",
        sortCol: "ITEM_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-cell",
            targetChecked: true, // 체크된 데이터로
            onGetDraggable: function(e, dd) {
                return G_GRDMASTER.data.getLength() > 1; // 챠량정보 1건 이상일 때만
            },
            // helperMessageFormat: "선택 상품 [%d건]을 이동",
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
                    result = "[상품: " + $NC.getDisplayCombo(rowData.ITEM_CD, rowData.ITEM_NM) + "]을 이동";
                } else {
                    result = "[상품: " + $NC.getDisplayCombo(rowData.ITEM_CD, rowData.ITEM_NM) + "] 외 " + (dd.dragCount - 1) + "건 이동";
                }
                return result;
            },
            onCheckedRowsChanged: function(e, args) {
                // 체크 참조 정보
                // args.dragGridObject: Grid Object
                // args.allCheckedRows: 전체 체크된 Row Indexes
                // args.newCheckedRows: 신규 체크된 Row Indexes
                for (var rIndex = 0, rCount = args.newCheckedRows.length; rIndex < rCount; rIndex++) {
                    setSummaryInfo(args.dragGridObject, $ND.C_YES, args.newCheckedRows[rIndex]);
                }
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
            // 수량정보 세팅.
            setSummaryInfo(G_GRDSUB);
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

function grdCarMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운전자성명"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "권역명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_CD",
        field: "AREA_CD",
        name: "권역"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

function grdCarMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdCarMaster", {
        columns: grdCarMasterOnGetColumns(),
        queryId: "LDC01010E0.RS_SUB1",
        sortCol: "CAR_CD",
        gridOptions: options
    });

    G_GRDCARMASTER.view.onSelectedRowsChanged.subscribe(grdCarMasterOnAfterScroll);
    G_GRDCARMASTER.view.onDblClick.subscribe(grdCarMasterOnDblClick);
}

function grdCarMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDCARMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDCARMASTER, row + 1);
}

function grdCarMasterOnDblClick(e, args) {

    var rowData = G_GRDCARMASTER.data.getItem(args.row);
    if ($NC.isNull(rowData)) {
        return;
    }

    $("#divCarMasterOverlay").hide();
    var grdObject;
    switch ($NC.G_VAR.carChangeType) {
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
        changeCar(grdObject, rowData.CAR_CD, $NC.G_VAR.carChangeType);
    }
}

/**
 * 차량마스터 데이터 필터 - 현재 선택한 차량 제외
 */
function grdCarMasterOnFilter(item) {

    if ($.isArray(G_GRDCARMASTER.lastFilterVal)) {
        var canDisplay = true;
        for ( var rIndex in G_GRDCARMASTER.lastFilterVal) {
            if (G_GRDCARMASTER.lastFilterVal[rIndex] == item.CAR_CD) {
                canDisplay = false;
                break;
            }
        }
        return canDisplay;
    } else {
        return G_GRDCARMASTER.lastFilterVal != item.CAR_CD;
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "OUTBOUND_DATE",
        "DELIVERY_BATCH",
        "CAR_CD"
    ], true)) {
        // 디테일 초기화
        $NC.clearGridData(G_GRDDETAIL);
        // 출고지시 초기화
        $NC.clearGridData(G_GRDSUB);
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = $NC.iif(G_GRDMASTER.data.getLength() > 0, "1", "0");

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "OUTBOUND_NO",
        "DELIVERY_CD",
        "RDELIVERY_CD"
    ]);

    // 수량정보 초기화
    $NC.setValue("#edtL1_Total_Plt", "0");
    $NC.setValue("#edtL1_Total_Box", "0");
    $NC.setValue("#edtL1_Total_Weight", "0");
    $NC.setValue("#edtL1_Total_Cbm", "0");
}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB);

    // 수량정보 초기화
    $NC.setValue("#edtL2_Total_Plt", "0");
    $NC.setValue("#edtL2_Total_Box", "0");
    $NC.setValue("#edtL2_Total_Weight", "0");
    $NC.setValue("#edtL2_Total_Cbm", "0");
}

function onGetCarMaster(ajaxData) {

    $NC.setInitGridData(G_GRDCARMASTER, ajaxData, grdCarMasterOnFilter);
    $NC.setInitGridAfterOpen(G_GRDCARMASTER, "CAR_CD");
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    _Inquiry();
    G_GRDMASTER.lastKeyVal = G_GRDMASTER.lastNewKeyVal;
    G_GRDMASTER.lastNewKeyVal = null;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDDETAIL, rowData, true);
    }

    _Inquiry();
}

function onLevelchange(ajaxData) {
    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "DELIVERY_BATCH",
            "CAR_CD"
        ]
    });
    var lastItemKeyVal = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "OUTBOUND_NO",
            "DELIVERY_CD",
            "RDELIVERY_CD"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
    G_GRDDETAIL.lastKeyVal = lastItemKeyVal;

}

function btnInitTransRoutOnClick(e, $view) {

    var INIT_TYPE = $view.prop("id").substr(18).toUpperCase();

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.003", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var DELIVERY_BATCH = $NC.getValue("#cboQDelivery_Batch");
    if ($NC.isNull(DELIVERY_BATCH)) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.004", "운송차수를 선택하십시오."));
        $NC.setFocus("#cboQDelivery_Batch");
        return;
    }

    var CAR_CD;
    if (INIT_TYPE == $ND.C_DETAIL) {
        var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if ($NC.isNull(rowData)) {
            alert($NC.getDisplayMsg("JS.LDC01010E0.007", "초기화 가능한 데이터가 존재하지 않습니다."));
            return;
        }
        CAR_CD = rowData.CAR_CD;
    } else {
        CAR_CD = $ND.C_ALL;
    }

    $NC.serviceCall("/LDC01010E0/callLDFwInitTransRoute.do", {
        P_CENTER_CD: CENTER_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_DELIVERY_BATCH: DELIVERY_BATCH,
        P_CAR_CD: CAR_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onLevelchange);
}

function btnMoveUpRouteOnClick() {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

    // 동일 레벨의 이전 메뉴 검색
    var preRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow - 1);

    if ($NC.isNull(preRowData)) {
        return;
    }

    $NC.serviceCall("/LDC01010E0/callLDRouteLevelExchange.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
        P_CAR_CD: rowData.CAR_CD,
        P_CUST_CD: rowData.CUST_CD,
        P_DELIVERY_CD: rowData.DELIVERY_CD,
        P_RDELIVERY_CD: rowData.RDELIVERY_CD,
        P_TO_DELIVERY_CD: preRowData.DELIVERY_CD,
        P_TO_RDELIVERY_CD: preRowData.RDELIVERY_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onLevelchange);
}

function btnMoveDownRouteOnClick() {

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

    // 동일 레벨의 다음 메뉴 검색
    var nextRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow + 1);

    if ($NC.isNull(nextRowData)) {
        return;
    }

    $NC.serviceCall("/LDC01010E0/callLDRouteLevelExchange.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
        P_CAR_CD: rowData.CAR_CD,
        P_CUST_CD: rowData.CUST_CD,
        P_DELIVERY_CD: rowData.DELIVERY_CD,
        P_RDELIVERY_CD: rowData.RDELIVERY_CD,
        P_TO_DELIVERY_CD: nextRowData.DELIVERY_CD,
        P_TO_RDELIVERY_CD: nextRowData.RDELIVERY_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onLevelchange);
}

/**
 * 전표분할 팝업 호출
 */
function btnSplitOrderOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
        return;
    }

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    if (rowData.ENTRY_QTY == 1) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.008", "출고수량이 1인 상품은 분할 할 수 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LDC01011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LDC01011P0.001", "전표분할"),
        url: "ld/LDC01011P0.html",
        width: 650,
        height: 265,
        G_PARAMETER: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_NM: rowData.ITEM_NM,
            P_ITEM_SPEC: rowData.ITEM_SPEC,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_SUB_DS: rowData,
            P_PERMISSION: permission
        },
        onOk: function() {
            // 조회시 전역 변수 값 초기화
            $NC.setInitGridVar(G_GRDSUB);

            var refRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
            G_GRDSUB.queryParams = {
                P_CENTER_CD: refRowData.CENTER_CD,
                P_BU_CD: refRowData.BU_CD,
                P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
                P_CAR_CD: refRowData.CAR_CD,
                P_DELIVERY_BATCH: refRowData.DELIVERY_BATCH,
                P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
                P_DELIVERY_CD: refRowData.DELIVERY_CD,
                P_RDELIVERY_CD: refRowData.RDELIVERY_CD
            };

            // 데이터 조회
            $NC.serviceCall("/LDC01010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
        }
    });
}

/**
 * 차량변경 배차조정
 * 
 * @param grdObject
 *        대상 그리드
 * @param carCd
 *        변경할 차량코드
 * @param changeType
 *        변경타입 (1: 차량단위, 2: 배송처단위, 3: 상품단위)
 */
function changeCar(grdObject, carCd, changeType) {

    // 현재 수정모드면
    if (grdObject.view.getEditorLock().isActive()) {
        grdObject.view.getEditorLock().commitCurrentEdit();
    }

    var dsMaster = [];
    var rowData, rIndex, rCount;
    switch (changeType) {
        // 차량
        case "1":
            for (rIndex = 0, rCount = grdObject.data.getLength(); rIndex < rCount; rIndex++) {
                rowData = grdObject.data.getItem(rIndex);
                if (rowData.CRUD != $ND.C_DV_CRUD_R && rowData.CHECK_YN == $ND.C_YES) {
                    if (rowData.CAR_CD == carCd) {
                        alert($NC.getDisplayMsg("JS.LDC01010E0.009", "같은 차량으로 변경 할 수 없습니다."));
                        return;
                    }
                    dsMaster.push({
                        P_CENTER_CD: rowData.CENTER_CD,
                        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
                        P_CAR_CD: rowData.CAR_CD,
                        P_NEW_CAR_CD: carCd,
                        P_CRUD: rowData.CRUD
                    });
                }
            }
            break;
        // 배송처
        case "2":
            for (rIndex = 0, rCount = grdObject.data.getLength(); rIndex < rCount; rIndex++) {
                rowData = grdObject.data.getItem(rIndex);
                if (rowData.CRUD != $ND.C_DV_CRUD_R && rowData.CHECK_YN == $ND.C_YES) {
                    if (rowData.CAR_CD == carCd) {
                        alert($NC.getDisplayMsg("JS.LDC01010E0.009", "같은 차량으로 변경 할 수 없습니다."));
                        return;
                    }
                    dsMaster.push({
                        P_CENTER_CD: rowData.CENTER_CD,
                        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
                        P_CAR_CD: rowData.CAR_CD,
                        P_CUST_CD: rowData.CUST_CD,
                        P_DELIVERY_CD: rowData.DELIVERY_CD,
                        P_RDELIVERY_CD: rowData.RDELIVERY_CD,
                        P_NEW_CAR_CD: carCd,
                        P_CRUD: rowData.CRUD
                    });
                }
            }
            break;
        // 상품
        case "3":
            for (rIndex = 0, rCount = grdObject.data.getLength(); rIndex < rCount; rIndex++) {
                rowData = grdObject.data.getItem(rIndex);
                if (rowData.CRUD != $ND.C_DV_CRUD_R && rowData.CHECK_YN == $ND.C_YES) {
                    if (rowData.CAR_CD == carCd) {
                        alert($NC.getDisplayMsg("JS.LDC01010E0.009", "같은 차량으로 변경 할 수 없습니다."));
                        return;
                    }
                    dsMaster.push({
                        P_CENTER_CD: rowData.CENTER_CD,
                        P_BU_CD: rowData.BU_CD,
                        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
                        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
                        P_LINE_NO: rowData.LINE_NO,
                        P_CAR_CD: rowData.CAR_CD,
                        P_NEW_CAR_CD: carCd,
                        P_CRUD: rowData.CRUD
                    });
                }
            }
            break;
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.010", "차량 변경할 데이터를 선택하십시오."));
        return;
    }

    G_GRDMASTER.lastNewKeyVal = carCd;
    $NC.serviceCall("/LDC01010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_CHANGE_TYPE: changeType,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

function showCarMasterOverlay(e) {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.011", "차량 변경할 데이터가 없습니다."));
        return;
    }

    var $view = $(e.target);
    switch ($view[0].id) {
        case "btnChangeCar_Car":
            $NC.G_VAR.carChangeType = "1";

            var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
                searchKey: "CHECK_YN",
                searchVal: $ND.C_YES
            });
            if (searchRows.length > 1) {
                if (!confirm($NC.getDisplayMsg("JS.LDC01010E0.012", "여러 대의 차량을 다른 차량으로 변경하시겠습니까?"))) {
                    return;
                }
            }
            break;
        case "btnChangeCar_Outbound":
            $NC.G_VAR.carChangeType = "2";
            break;
        case "btnChangeCar_Line":
            $NC.G_VAR.carChangeType = "3";
            break;
    }

    var rowData;
    if ($NC.G_VAR.carChangeType != "1") {
        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        G_GRDCARMASTER.lastFilterVal = rowData.CAR_CD;
    } else {
        G_GRDCARMASTER.lastFilterVal = [];
        for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(rIndex);
            if (rowData.CHECK_YN != $ND.C_YES) {
                continue;
            }
            G_GRDCARMASTER.lastFilterVal.push(rowData.CAR_CD);
        }
    }
    G_GRDCARMASTER.data.refresh();
    if (G_GRDCARMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC01010E0.013", "이동 가능한 대상 차량이 없습니다."));
        return;
    }

    $NC.showOverlay("#divCarMasterOverlay", {
        title: $NC.getDisplayMsg("JS.LDC01010E0.014", "차량 변경"),
        fullscreen: false,
        width: 400,
        height: 500,
        onComplete: function() {
            $NC.onGlobalResize();
            G_GRDCARMASTER.view.focus();
            G_GRDCARMASTER.view.invalidate();
            $NC.setGridSelectRow(G_GRDCARMASTER, 0);
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
    $NC.setEnable("#btnInitTransRoute_M", permission.canSave && enable);
}
