/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOM04050E0
 *  프로그램명         : 수동DAS작업
 *  프로그램설명       : 수동DAS작업 화면 Javascript
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
            // 단일
            if ($NC.G_VAR.active.process != "BT") {
                return {
                    container: "#ctrProcessS",
                    grids: "#grdMaster"
                };
            }
        },
        autoResizeFixedView: function() {
            // 단일
            if ($NC.G_VAR.active.process != "BT") {
                return {
                    viewFirst: {
                        container: "#ctrLeftView",
                        grids: "#grdMaster"
                    },
                    viewSecond: {
                        container: "#ctrRightView"
                    },
                    viewType: "h",
                    viewFixed: {
                        container: "viewSecond",
                        size: 450
                    },
                    exceptHeight: $NC.getViewHeight("#ctrProcessAction")
                };
            }
        },
        active: {
            process: "B", // 현재 활성화된 작업
            preProcess: "", // 이전 작업
            // [일괄] 현재 활성화된 블럭번호
            blockNo: 1,
            // [일괄] 선반 Row 건수, 리사이즈에서 사용
            shelfRowCount: 0,
            // [일괄] ShelfDs의 첫번째 데이터, 체크, 참조용으로 사용
            shelfData: null,
            // [일괄] 선반번호별 작업대상 정보
            shelfDs: null
        },
        summary: {
            TOT_ENTRY_QTY: 0,
            TOT_DISTRIBUTE_QTY: 0,
            TOT_REMAIN_QTY: 0
        }
    });

    $NC.setEnableGroup("#ctrInfoView", false);

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 조회조건 - 출고일자 초기화
    $NC.setInitDatePicker("#dtpQOutbound_Date");

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQOutbound_Batch").click(function() {
        // 차수 새로고침
        setOutboundBatchCombo();

        onChangingCondition();
    });
    $("#btnOverlayClose").click(function() {
        $("#ctrProcessBT").css("visibility", "hidden");

        // 전역 변수 초기화
        $NC.G_VAR.active.process = $NC.G_VAR.active.preProcess;
        // 기본값으로 지정
        $NC.G_VAR.active.blockNo = 1;
        $NC.G_VAR.active.shelfRowCount = 0;
        $NC.G_VAR.active.shelfData = null;
        $NC.G_VAR.active.shelfDs = null;

        $NC.onGlobalResize();

        setFocusScan();
    });

    // 메인화면 포커스 유지 - Scan
    $("#ctrProcessAction,#ctrProcessS").click(function(e) {
        var $view = $(e.target);
        // 스캔 Element - 상품바코드
        if ($view.prop("id") == "edtItem_Bar_Cd") {
            return;
        }

        // 입력 Element가 아니면 스캔 Element에 포커스
        if (!$view.is(":focus")) {
            setFocusScan();
        }
    });

    // 일괄화면 포커스 유지 - Scan
    $("#ctrProcessBT").click(function(e) {
        var $view = $(e.target);

        // 스캔 Element - 상품바코드
        if ($view.prop("id") == "edtL1_Item_Bar_Cd") {
            return;
        }

        // 입력 Element가 아니면 스캔 Element에 포커스
        if (!$view.is(":focus")) {
            setFocusScan("#edtL1_Item_Bar_Cd");
        }
    });

    // 프로세스 선택 버튼 이벤트 세팅
    $("#btnProcessS,#btnProcessB").click(function(e) {
        onProcessChange(e, $(this));
    });

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
            setOutboundBatchCombo();
        }
    });

    // 버튼 권한 체크 및 클릭 이벤트 연결
    setUserProgramPermission();
    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo();

}

function _OnLoaded() {

    setFocusScan();
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

    if ($NC.G_VAR.active.process == "BT") {
        $NC.resizeContainer("#ctrProcessBTView", null, $("#ctrProcessBT").height() - $NC.getViewHeight("#ctrOverlayTitleBar"));

        // viewFirst, viewSecond, viewType, viewFixed, exceptHeight, setMinMax
        $NC.resizeFixedView({
            container: "#ctrSubLeft"
        }, {
            container: "#ctrSubRight"
        }, "h", {
            container: "viewSecond",
            size: 450
        });

        $NC.resizeContainer("#ctrBlocks", null, $("#ctrSubLeft").height() - $NC.getViewHeight("#ctrBlockInfo"));

        // 블럭 선택 버튼 사이즈 조정, 버튼이 많을 경우, 99: 앞 라벨 너비
        $("#ctrBlockButton").width($("#ctrBlockButton").parent().width() - 99);

        // 활성 블럭
        var $ctrBlock = $("#ctrBlock" + $NC.G_VAR.active.blockNo);
        $NC.resizeContainer($ctrBlock);

        // 선반번호 사이즈 조정
        // 81 : 상단 div * 2, 5: border-spacing, 25.5: 선반번호 + td border + 0.5
        var blockHeight = viewHeight - 81 - (5 * ($NC.G_VAR.active.shelfRowCount + 1));
        var shelfRowHeight = Math.round((blockHeight / $NC.G_VAR.active.shelfRowCount) - 25.5);
        $ctrBlock.find(".rQty").css({
            "height": shelfRowHeight + "px",
            "line-height": shelfRowHeight + "px"
        });
    } else {
        // 블럭 선택 버튼 사이즈 조정, 버튼이 많을 경우, 99: 앞 라벨 너비
        $("#ctrProgressBar").width($("#ctrProgressBar").parent().width() - 331);
    }
}

function _OnFocus() {

    setFocusScan();
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

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            setOutboundBatchCombo();
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOM04050E0.001", "출고일자를 정확히 입력하십시오."));
            setOutboundBatchCombo();
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "ITEM_BAR_CD":
            onScanItem(view, val);
            break;
        case "L1_ITEM_BAR_CD":
            onScanItemDistribute(view, val);
            break;
    }
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputKeyUp(e, view) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "ITEM_SERIAL":
        case "ITEM_BAR_CD":
            // Enter-Key 포커스 이동 무시
            if (e.keyCode == 13) {
                e.stopImmediatePropagation();
                // MS-IE일 경우 event가 완전히 무시 처리되기 때문에 change 강제 호출
                if ($.browser.msie) {
                    setTimeout(function() {
                        view.change();
                    });
                }
            }
            break;
    }
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);
    G_GRDMASTER.INQUERY_YN = false;
    $NC.setEnableGroup("#ctrInfoView", false);
    grdMasterOnScan();
    // 수량 초기화
    $NC.G_VAR.summary.TOT_ENTRY_QTY = 0;
    $NC.G_VAR.summary.TOT_DISTRIBUTE_QTY = 0;
    $NC.G_VAR.summary.TOT_REMAIN_QTY = 0;
    // 진행율 표시
    setProgressBar(0, 0, 0);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();

    // 스캔에 포커스
    setFocusScan();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.002", "물류센터를 선택하십시오."), "#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.003", "사업부를 입력하십시오."), "#edtQBrand_Cd");
        return;
    }

    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.004", "출고일자를 입력하십시오."), "#dtpQOutbound_Date");
        return;
    }

    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
    if ($NC.isNull(OUTBOUND_BATCH)) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.005", "출고차수를 선택하십시오."), "#cboQOutbound_Batch");
        return;
    }

    // 조회시 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.setEnableGroup("#ctrInfoView", false);
    grdMasterOnScan();
    // 진행율 초기화
    setProgressBar(0, 0, 0);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_BATCH: OUTBOUND_BATCH
    };
    // 데이터 조회
    $NC.serviceCall("/LOM04050E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        alert($NC.getDisplayMsg("JS.LOM04050E0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM04050E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LOM04050E0.004", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
    if ($NC.isNull(OUTBOUND_BATCH)) {
        alert($NC.getDisplayMsg("JS.LOM04050E0.005", "출고차수를 선택하십시오."));
        $NC.setFocus("#cboQOutbound_Batch");
        return;
    }
    if ($NC.getComboData("#cboQOutbound_Batch")[$NC.getComboSelectedIndex("#cboQOutbound_Batch") - 1].OUTBOUND_BATCH_DIV != "11") {
        alert($NC.getDisplayMsg("JS.LOM04050E0.006", "결품차수를 선택하십시오."));
        return;
    }

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // 결품피킹 지시서
        case "PAPER_LOM01":
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH
            };
            break;
        // 선반번호 변경리스트
        case "PAPER_LOM09":
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH,
                P_PRE_OUTBOUND_BATCH: $ND.C_ALL
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
        id: "SHELF_NO",
        field: "SHELF_NO",
        name: "DAS번호",
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
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ENTRY_QTY",
        field: "ENTRY_QTY",
        name: "등록수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_QTY",
        field: "DISTRIBUTE_QTY",
        name: "분배수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMAIN_QTY",
        field: "REMAIN_QTY",
        name: "미분배수량",
        cssClass: "styRight"
    }, false); // 컬럼명 변경안함
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.DISTRIBUTE_QTY > 0 && rowData.ENTRY_QTY > rowData.DISTRIBUTE_QTY) {
                    return "styDiff";
                }
                if (rowData.COMPLETE_YN == $ND.C_YES) {
                    return "styDone";
                }
            }
        },
        rowHeight: 30
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOM04050E0.RS_MASTER",
        sortCol: "SHELF_NO",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.INQUERY_YN = false;
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }

    var row = args.rows[0];

    // var rowData = G_GRDMASTER.data.getItem(row);
    // grdMasterOnScan(rowData);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnScan(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }
    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtShelf_No", rowData["SHELF_NO"]);
    $NC.setValue("#edtItem_Cd", rowData["ITEM_CD"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtItem_Spec", rowData["ITEM_SPEC"]);
    $NC.setValue("#edtBrand_Cd_F", $NC.getDisplayCombo(rowData["BRAND_CD"], rowData["BRAND_NM"]));
    $NC.setValue("#edtTot_Entry_Qty", rowData["TOT_ENTRY_QTY"]);
    $NC.setValue("#edtShipper_Nm", rowData["SHIPPER_NM"]);
    $NC.setValue("#edtOrderer_Msg", rowData["ORDERER_MSG"]);
    $NC.setValue("#edtBu_Date", rowData["BU_DATE"]);
    $NC.setValue("#edtBu_No", rowData["BU_NO"]);
    $NC.setValue("#edtEntry_Qty", rowData["ENTRY_QTY"]);
    $NC.setValue("#edtDistribute_Qty", rowData["DISTRIBUTE_QTY"]);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "OUTBOUND",
        "ITEM_CD",
        "ITEM_STATE",
        "ITEM_LOT"
    ]);

    // 조회여부
    G_GRDMASTER.INQUERY_YN = true;
    // 진행율
    onCalcSummary();

    setFocusScan();
    setTopButtons();
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

    setOutboundBatchCombo();

    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    onChangingCondition();
}

/**
 * 저장 정상 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "OUTBOUND",
            "ITEM_CD",
            "ITEM_STATE",
            "ITEM_LOT"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장 오류 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

    $NC.playErrorSound();
    $NC.onError(ajaxData);
    setFocusScan();
}

function onAlert(message, focusEl) {

    $NC.playWarningSound();
    alert(message);
    setFocusScan(focusEl);
}

function onScanItem($view, scanVal) {

    $NC.setValue($view);
    if ($NC.lStr(scanVal, 2) == "TP") { // 토탈피킹지시서 스캔
        onPickInstr(scanVal);
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.007", "조회 후 처리하십시오."), $view);
        return;
    }

    if ($NC.isNull(scanVal)) {
        setFocusScan($view);
        return;
    }

    // 수량과 관계없이 검색, 메시지 처리
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: [
            "ITEM_CD",
            "ITEM_BAR_CD",
            "BOX_BAR_CD",
            "CASE_BAR_CD"
        ],
        searchVal: scanVal,
        compareFn: function(item, searchKeys, searchKeyCount, searchVals) {
            for (var rIndex = 0; rIndex < searchKeyCount; rIndex++) {
                if ($NC.equals(item[searchKeys[rIndex]], searchVals[0])) {
                    return true;
                }
            }
            return false;
        }
    });
    if (searchRow == -1) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.008", "해당 차수에 존재하지 않는 상품입니다."), $view);
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(searchRow);
    // 완료된 상품이면, 완료 안된 상품 검색
    var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
        searchKey: "ITEM_CD",
        searchVal: rowData.ITEM_CD,
        compareFn: function(item, searchKeys, searchKeyCount, searchVals) {
            // 존재하고, 수량이 남으면 OK
            for (var rIndex = 0; rIndex < searchKeyCount; rIndex++) {
                if ($NC.equals(item[searchKeys[rIndex]], searchVals[0]) && item.REMAIN_QTY > 0) {
                    return true;
                }
            }
            return false;
        }
    });
    if (searchRows.length == 0) {
        $NC.setGridSelectRow(G_GRDMASTER, searchRow);
        // 그리드 선택 후 바로 alert를 표시하면 그리드 선택이 alert 닫은 후 표시 됨
        // 그리드 선택된 후 alert 표시되도록 setTimeout으로 처리
        setTimeout(function() {
            onAlert($NC.getDisplayMsg("JS.LOM04050E0.009", "해당 상품은 이미 분배가 완료된 상품입니다"), $view);
        });
        return;
    }
    // 화면 정렬과 관계없이 DAS번호 빠른순으로 처리하기 위해 검색된 인덱스 재정렬
    else {
        if (searchRows.length > 1) {
            searchRows.sort(function(index1, index2) {
                var item1 = G_GRDMASTER.data.getItem(index1), //
                item2 = G_GRDMASTER.data.getItem(index2);
                if (item1.SHELF_NO > item2.SHELF_NO) {
                    return 1;
                }
                if (item1.SHELF_NO < item2.SHELF_NO) {
                    return -1;
                }
                return 0;
            });
        }

        searchRow = searchRows[0];
        rowData = G_GRDMASTER.data.getItem(searchRow);
    }

    // 단일 처리
    if ($NC.G_VAR.active.process == "S") {
        var ITEM_QTY = 1;
        // 분배 수량 +
        rowData.DISTRIBUTE_QTY = rowData.DISTRIBUTE_QTY + ITEM_QTY;
        // 남은 수량 -
        rowData.REMAIN_QTY = rowData.REMAIN_QTY - ITEM_QTY;
        // 모두 처리되었으면 분배여부도 조정
        if (rowData.REMAIN_QTY == 0) {
            rowData.COMPLETE_YN = $ND.C_YES;
        }
        // 변경 적용
        $NC.setGridApplyChange(G_GRDMASTER, rowData);

        // DB 반영, 정상반영시 표시
        if (callLODistributeQtyUpdate(rowData)) {
            grdMasterOnScan(rowData);

            // 수량이 변경되었으면 진행율 조정
            setSummaryDistributeQty(ITEM_QTY);

            // 상품이 완료되면 재정렬
            if (rowData.REMAIN_QTY == 0) {
                // 재정렬 후 현재 Row를 찾아 가도록 선택 후 정렬
                $NC.setGridSelectRow(G_GRDMASTER, searchRow);

                $NC.setGridSort(G_GRDMASTER, {
                    sortField: true,
                    sortColumns: [
                        {
                            field: "COMPLETE_YN",
                            sortAsc: true
                        },
                        {
                            field: "SHELF_NO",
                            sortAsc: true
                        },
                        {
                            field: "BRAND_CD",
                            sortAsc: true
                        },
                        {
                            field: "ITEM_CD",
                            sortAsc: true
                        },
                        {
                            field: "ITEM_STATE",
                            sortAsc: true
                        },
                        {
                            field: "ITEM_LOT",
                            sortAsc: true
                        }
                    ]
                });
            }
        }
        // 반영 실패시 수량 복원
        else {
            // 모두 처리되었으면 분배여부도 조정
            if (rowData.REMAIN_QTY == 0) {
                rowData.COMPLETE_YN = $ND.C_NO;
            }
            // 분배 수량 -
            rowData.DISTRIBUTE_QTY = rowData.DISTRIBUTE_QTY - ITEM_QTY;
            // 남은 수량 -
            rowData.REMAIN_QTY = rowData.REMAIN_QTY + ITEM_QTY;
            // 변경 적용
            $NC.setGridApplyChange(G_GRDMASTER, rowData);
        }

        // 미분배수량이 있을 경우 데이터 선택, 없으면 사전 정렬에 의해 밑으로 이동, 인덱스가 변경 됨
        if (rowData.REMAIN_QTY > 0) {
            $NC.setGridSelectRow(G_GRDMASTER, searchRow);
        }
        setFocusScan();
    }
    // 일괄 처리
    else {
        $NC.setGridSelectRow(G_GRDMASTER, searchRow);

        onScanItemTotal(rowData);
    }
}

function onScanItemTotal(refRowData) {

    var dsSub = [];
    var serviceCallError = false;
    // 상품 일괄 데이터 조회
    $NC.serviceCallAndWait("/LOM04050E0/getDataSet.do", {
        P_QUERY_ID: "LOM04050E0.RS_SUB1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: refRowData.CENTER_CD,
            P_BU_CD: refRowData.BU_CD,
            P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
            P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
            P_BRAND_CD: refRowData.BRAND_CD,
            P_ITEM_CD: refRowData.ITEM_CD,
            P_ITEM_STATE: refRowData.ITEM_STATE,
            P_ITEM_LOT: refRowData.ITEM_LOT
        }
    }, function(subAjaxData) {
        dsSub = $NC.toArray(subAjaxData);
    }, function(subAjaxData) {
        $NC.playErrorSound();
        $NC.onError(subAjaxData);
        serviceCallError = true;
    });
    if (serviceCallError) {
        setFocusScan();
        return;
    }
    if (dsSub.length == 0) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.010", "일괄 분배할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
        return;
    }

    // 첫번째 데이터를 선반 기준 데이터로
    var shelfData = {
        TOT_ORDER_CNT: dsSub[0].TOT_ORDER_CNT,
        DISTRIBUTE_ORDER_CNT: dsSub[0].DISTRIBUTE_ORDER_CNT,
        TOT_ENTRY_QTY: dsSub[0].TOT_ENTRY_QTY,
        TOT_DISTRIBUTE_QTY: dsSub[0].TOT_DISTRIBUTE_QTY,
        TOT_REMAIN_QTY: dsSub[0].TOT_REMAIN_QTY,
        BLOCK_SHELF_CNT: dsSub[0].BLOCK_SHELF_CNT,
        BLOCK_COL_CNT: dsSub[0].BLOCK_COL_CNT,
        // 상품 스캔시 체크, 분배완료 처리
        ITEM_CD: refRowData.ITEM_CD,
        ITEM_BAR_CD: refRowData.ITEM_BAR_CD,
        BOX_BAR_CD: refRowData.BOX_BAR_CD,
        CASE_BAR_CD: refRowData.CASE_BAR_CD
    };

    // 기본 정보 세팅
    $NC.setValue("#edtL1_Order_CntBT", shelfData.DISTRIBUTE_ORDER_CNT + " / " + shelfData.TOT_ORDER_CNT);
    $NC.setValue("#edtL1_Item_Cd", refRowData.ITEM_CD);
    $NC.setValue("#edtL1_Item_Nm", refRowData.ITEM_NM);
    $NC.setValue("#edtL1_Item_Spec", refRowData.ITEM_SPEC);
    $NC.setValue("#edtL1_Brand_Cd", refRowData.BRAND_CD);
    $NC.setValue("#edtL1_Brand_Nm", refRowData.BRAND_NM);

    $NC.setValue("#edtL1_Entry_Qty", shelfData.TOT_ENTRY_QTY);
    $NC.setValue("#edtL1_Distribute_Qty", shelfData.TOT_DISTRIBUTE_QTY);
    $NC.setValue("#edtL1_Remain_Qty", shelfData.TOT_REMAIN_QTY);
    $NC.setValue("#edtL1_New_Distribute_Qty", shelfData.TOT_REMAIN_QTY);

    $NC.G_VAR.active.shelfDs = dsSub;
    $NC.G_VAR.active.shelfData = shelfData;
    $NC.G_VAR.active.shelfRowCount = Math.ceil(shelfData.BLOCK_SHELF_CNT / shelfData.BLOCK_COL_CNT);

    // 선반 Element 생성
    drawShelfBlocks();

    // 작업 대상 블럭 활성
    $NC.G_VAR.preActiveProcess = $NC.G_VAR.active.process;
    $NC.G_VAR.active.process = "BT";
    // 활성 블럭, drawShelfBlocks에서 세팅 됨
    if ($NC.isNull($NC.G_VAR.active.blockNo)) {
        $NC.G_VAR.active.blockNo = 1;
    }
    $("#ctrBlock" + $NC.G_VAR.active.blockNo).show();
    $("#btnBlock" + $NC.G_VAR.active.blockNo).removeClass("btnNormal").addClass("btnSpecial");
    $NC.onGlobalResize();

    // hide/show 처리시 사이즈가 늘어나는 형태로 보여져서
    // 사이즈 조정된 상태에서 보이도록 visibility로 조정
    $("#ctrProcessBT").css("visibility", "visible").hide();
    $NC.showOverlay("#ctrProcessBT", {
        onComplete: function() {
            $NC.onGlobalResize();

            // 상품바코드에 포커스
            setFocusScan("#edtL1_Item_Bar_Cd");
        }
    });
}

function onScanItemDistribute($view, scanVal) {

    $NC.setValue($view);
    if ($NC.isNull(scanVal)) {
        setFocusScan($view);
        return;
    }

    // 현재 작업중인 상품인지 체크
    if ($NC.G_VAR.active.shelfData.ITEM_CD == scanVal //
        || $NC.G_VAR.active.shelfData.ITEM_BAR_CD == scanVal //
        || $NC.G_VAR.active.shelfData.BOX_BAR_CD == scanVal //
        || $NC.G_VAR.active.shelfData.CASE_BAR_CD == scanVal) {
        // 맞으면 완료 처리
        btnDistributeCompleteOnClick();
    }
    // 현재 작업중인 상품이 아닐 경우
    else {
        setFocusScan($view);
    }
}

function onPickInstr(scanVal) {

    if (G_GRDMASTER.data.getLength() > 0 && $NC.G_VAR.summary.TOT_REMAIN_QTY > 0) {// 미분배 수량 존재 시
        if (!confirm($NC.getDisplayMsg("JS.LOM04050E0.011", "현재 분배 작업 중입니다.\n새로운 차수를 작업 하시겠습니까"))) {
            return;
        }
    }

    // 값 초기화
    onChangingCondition();

    // 피킹지시서 체크
    var orderInfo = scanVal.substring(2).split("-");
    if (orderInfo[0] != $NC.getValue("#cboQCenter_Cd") && orderInfo[0] != $ND.C_BASE_CENTER_CD) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.012", "현재 작업중인 물류센터와 다른 피킹지시서 입니다. 조회조건을 확인하십시오."));
        return;
    }
    if (orderInfo[1] != $NC.getValue("#edtQBu_Cd") && orderInfo[1] != $ND.C_BASE_BU_CD) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.013", "현재 작업중인 사업부와 다른 피킹지시서 입니다. 조회조건을 확인하십시오."));
        return;
    }
    if ($NC.getDate(orderInfo[2]) != $NC.getValue("#dtpQOutbound_Date")) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.014", "현재 작업중인 출고일자와 다른 피킹지시서 입니다. 조회조건을 확인하십시오."));
        return;
    }

    // 출고차수 세팅
    $NC.setValue("#cboQOutbound_Batch", orderInfo[3]);

    // 조회
    _Inquiry();

}

function drawShelfBlocks() {

    // 버튼
    var $ctrBlockButton = $("#ctrBlockButton").empty();
    var $ctrBlocks = $("#ctrBlocks").empty();
    var rowData, lastBlockNo = 0, lastColNo = 0, //
    blockHeight, blockColWidth, blockRowHeight, shelfRowHeight, //
    $btnBlock, $ctrBlock, $ctrBlockRow;

    // Col Width
    blockColWidth = 100 / $NC.G_VAR.active.shelfData.BLOCK_COL_CNT;
    // Row, Col Height
    blockRowHeight = $NC.G_VAR.active.shelfData.BLOCK_SHELF_CNT / $NC.G_VAR.active.shelfData.BLOCK_COL_CNT;
    // 81 : 상단 div * 2, 5: border-spacing, 25.5: 선반번호 + td border + 0.5
    blockHeight = $(window).height() - 81 - (5 * ($NC.G_VAR.active.shelfRowCount + 1));
    shelfRowHeight = Math.round((blockHeight / $NC.G_VAR.active.shelfRowCount) - 25.5);

    // 분배해야하는 첫번째 선반의 블럭을 세팅하기 위해 초기화
    $NC.G_VAR.active.blockNo = null;

    // 블럭 생성
    for (var r = 0, rCount = $NC.G_VAR.active.shelfDs.length; r < rCount; r++) {
        rowData = $NC.G_VAR.active.shelfDs[r];
        // 블럭번호가 바뀔 때 버튼 및 컨데이터 생성
        if (rowData.BLOCK_NO != lastBlockNo) {
            // 버튼
            $btnBlock = $( //
            "<input id=\"btnBlock" + rowData.BLOCK_NO //
                + "\" class=\"btnNormal styAction btnBlock\" type=\"button\" style=\"width: 180px; font-size: 14pt;\" />" //
            );
            $btnBlock.appendTo($ctrBlockButton);
            $btnBlock.data("BLOCK_NO", rowData.BLOCK_NO);
            $btnBlock.click(function(e) {
                var $activeBlock = $(this), //
                $preActiveBlock = $activeBlock.parent().children(".btnBlock").filter(".btnSpecial");
                try {
                    if ($activeBlock.prop("id") == $preActiveBlock.prop("id")) {
                        return;
                    }

                    // 이전 활성버튼 비활성
                    $preActiveBlock.removeClass("btnSpecial").addClass("btnNormal");
                    // 현재 버튼 활성
                    $activeBlock.removeClass("btnNormal").addClass("btnSpecial");
                    // 이전 블럭 컨테이니 숨김
                    $("#ctrBlock" + $preActiveBlock.data("BLOCK_NO")).hide();
                    // 현재 블럭 컨테이너 보임
                    $NC.G_VAR.active.blockNo = $activeBlock.data("BLOCK_NO");
                    $("#ctrBlock" + $NC.G_VAR.active.blockNo).show();
                    $NC.onGlobalResize();
                } finally {
                    // 상품바코드에 포커스
                    setFocusScan("#edtL1_Item_Bar_Cd");
                }
            });
            $NC.setValue($btnBlock, ((rowData.BLOCK_NO - 1) * rowData.BLOCK_SHELF_CNT + 1) // 시작 선반번호
                + " - " + rowData.BLOCK_NO * rowData.BLOCK_SHELF_CNT // 마지막 선반번호
                + " (" + rowData.DISTRIBUTE_SHELF_CNT + ")" // 작업 대상 선반번호
            );

            // 블럭 컨테이너
            $ctrBlock = $( //
            "<table id=\"ctrBlock" + rowData.BLOCK_NO + "\" class=\"ctrBlock\"></table>" //
            );
            $ctrBlock.appendTo($ctrBlocks);
            // 초기 숨김
            $ctrBlock.hide();

            // 블럭이 변경되면 블럭 Row 컨테이너 생성
            $ctrBlockRow = $( //
            "<tr style=\"height: " + blockRowHeight + "%;\"></tr>" //
            );
            $ctrBlockRow.appendTo($ctrBlock);

            // 번호 세팅
            lastBlockNo = rowData.BLOCK_NO;
            lastColNo = 0;
        } else {
            // 블럭 Row에 Col 만큼 추가되면 블럭 Row 컨데이터 생성
            if (lastColNo >= rowData.BLOCK_COL_CNT) {
                $ctrBlockRow = $( //
                "<tr style=\"height: " + blockRowHeight + "%;\"></tr>" //
                );
                $ctrBlockRow.appendTo($ctrBlock);
                // 컬럼 번호 초기화
                lastColNo = 0;
            }
        }

        // 최대 선반번호 이상일 경우 비활성
        if (rowData.SHELF_NO > rowData.MAX_SHELF_NO) {
            $("<td class=\"inactive\" style=\"width: " + blockColWidth + "%;\">" //
                + "<div class=\"shelf\">" //
                // + "<div class=\"no\">" + rowData.SHELF_NO + "</div>" // 선반번호
                + "<div class=\"no\">---</div>" // 선반번호 표시하지 않음
                + "<div class=\"rQty\" style=\"height: " + shelfRowHeight + "px; line-height: " + shelfRowHeight + "px;\">&nbsp;</div>" // 남은 분배수량
                // + "<div class=\"tQty\">&nbsp;</div>" // 총수량
                + "</div>" //
                + "</td>") //
            .appendTo($ctrBlockRow);
        }
        // 차수의 작업 대상 선반
        else {
            // 작업대상
            if (rowData.WORK_TARGET_YN == $ND.C_YES) {
                // 작업대상
                if (rowData.REMAIN_QTY > 0) {
                    // 활성화할 블럭, 분배해야하는 첫번째 선반의 블럭
                    if ($NC.isNull($NC.G_VAR.active.blockNo)) {
                        $NC.G_VAR.active.blockNo = rowData.BLOCK_NO;
                    }
                    $("<td class=\"active\" style=\"width: " + blockColWidth + "%;\">" //
                        + "<div class=\"shelf\">" //
                        + "<div class=\"no\">" + rowData.SHELF_NO + "</div>" // 선반번호
                        + "<div class=\"rQty\" style=\"height: " + shelfRowHeight + "px; line-height: " + shelfRowHeight + "px;\">" //
                        + (rowData.REMAIN_QTY > 0 ? rowData.REMAIN_QTY : "&nbsp;") + "</div>" // 남은 분배수량
                        // + "<div class=\"tQty\">" + rowData.ENTRY_QTY + "</div>" // 총수량
                        + "</div>" //
                        + "</td>") //
                    .appendTo($ctrBlockRow);
                }
                // 작업완료
                else {
                    // 작업 대상 아님으로 변경
                    rowData.WORK_TARGET_YN = $ND.C_NO;

                    $("<td style=\"width: " + blockColWidth + "%;\">" //
                        + "<div class=\"shelf\">" //
                        + "<div class=\"no\">" + rowData.SHELF_NO + "</div>" // 선반번호
                        + "<div class=\"rQty\" style=\"height: " + shelfRowHeight + "px; line-height: " + shelfRowHeight + "px;\">" //
                        + (rowData.REMAIN_QTY > 0 ? rowData.REMAIN_QTY : "&nbsp;") + "</div>" // 남은 분배수량
                        // + "<div class=\"tQty\">" + rowData.ENTRY_QTY + "</div>" // 총수량
                        + "</div>" //
                        + "</td>") //
                    .appendTo($ctrBlockRow);
                }
            }
            //
            else {
                $("<td style=\"width: " + blockColWidth + "%;\">" //
                    + "<div class=\"shelf\">" //
                    + "<div class=\"no\">" + rowData.SHELF_NO + "</div>" // 선반번호
                    + "<div class=\"rQty\" style=\"height: " + shelfRowHeight + "px; line-height: " + shelfRowHeight + "px;\">&nbsp;</div>" // 남은 분배수량
                    // + "<div class=\"tQty\">&nbsp;</div>" // 총수량
                    + "</div>" //
                    + "</td>") //
                .appendTo($ctrBlockRow);
            }
        }

        lastColNo++;
    }
}

function setFocusScan(selector) {

    var $view = $NC.getView($NC.isNull(selector) ? "#edtItem_Bar_Cd" : selector);
    if ($NC.isEnable($view)) {
        // Delay 처리
        setTimeout(function() {
            $view.focus();
        }, $ND.C_TIMEOUT_FOCUS);
    }
}

function onProcessChange(e, $view) {

    var viewId = $view.prop("id"), //
    thisProcess = viewId.substring(viewId.length - 1), //
    otherProcess = thisProcess == "S" ? "B" : "S";

    // 버튼 활성상태 변경
    $("#btnProcess" + thisProcess).removeClass("btnNormal btnSpecial").addClass("btnSpecial");
    $("#btnProcess" + otherProcess).removeClass("btnNormal btnSpecial").addClass("btnNormal");

    $NC.G_VAR.active.process = thisProcess;
    $NC.onGlobalResize();

    // 스캔 포커스
    setFocusScan();
}

function setOutboundBatchCombo() {

    // 조회조건 - 출고차수 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "LOM04050E0.RS_SUB2",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date")
        }
    }, {
        selector: "#cboQOutbound_Batch",
        codeField: "OUTBOUND_BATCH",
        fullNameField: "OUTBOUND_BATCH_F",
        addEmpty: true
    });
}

function callLODistributeQtyUpdate(rowData) {

    var errorData;
    $NC.serviceCallAndWait("/LOM04050E0/callLODistributeQtyUpdate.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_DISTRIBUTE_QTY: rowData.DISTRIBUTE_QTY,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
    }, function(ajaxData) {
        errorData = ajaxData;
    });

    if ($NC.isNull(errorData)) {
        return true;
    } else {
        $NC.playErrorSound();
        $NC.onError(errorData);
        return false;
    }
}

/**
 * 현재 분배작업 차수의 분배 미완료 전표를 결품차수 생성 하는 팝업 오픈
 */
function btnBatchCompleteOnClick(e) {

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan();
        return;
    }

    // 분배수량이 존재하고(작업시작), 미분배 수량이 존재(100% 완료가 아닐 경우) 작업완료 처리
    if ($NC.G_VAR.summary.TOT_DISTRIBUTE_QTY == 0) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.015", "분배 작업하지 않은 차수입니다."));
        return;
    } else {
        if ($NC.G_VAR.summary.TOT_REMAIN_QTY == 0 && $NC.G_VAR.summary.TOT_DISTRIBUTE_QTY == $NC.G_VAR.summary.TOT_ENTRY_QTY) {
            onAlert($NC.getDisplayMsg("JS.LOM04050E0.016", "분배 완료 된 차수입니다."));
            return;
        }
    }

    if (!confirm($NC.getDisplayMsg("JS.LOM04050E0.017", "분배미완료 전표를 결품 처리하시겠습니까?"))) {
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LOM04051P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LOM04051P0.001", "수동 DAS 결품차수 생성"),
        url: "lo/LOM04051P0.html",
        width: 920,
        height: 500,
        G_PARAMETER: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_OUTBOUND_BATCH: OUTBOUND_BATCH
        },
        onOk: function() {
            // 차수 새로고침
            setOutboundBatchCombo();
            onChangingCondition();
        }
    });

}

function btnDistributeQtyApplyOnClick() {

    var NEW_DISTRIBUTE_QTY = $NC.toNumber($NC.getValue("#edtL1_New_Distribute_Qty"), -1);
    if (NEW_DISTRIBUTE_QTY <= 0) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.018", "조정할 분배수량을 정확히 입력하십시오."), "#edtL1_New_Distribute_Qty");
        return;
    }

    if ($NC.G_VAR.active.shelfData.TOT_REMAIN_QTY == NEW_DISTRIBUTE_QTY) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.019", "분배수량 조정 후 반영 처리하십시오."), "#edtL1_New_Distribute_Qty");
        return;
    }

    if ($NC.G_VAR.active.shelfData.TOT_REMAIN_QTY < NEW_DISTRIBUTE_QTY) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.020", "조정할 분배수량이 미분배수량을 초과할 수 없습니다."), "#edtL1_New_Distribute_Qty");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOM04050E0.021", "입력한 조정수량을 적용하시겠습니까?"))) {
        return;
    }

    var r, rCount, rowData, remainQty, bolckInfo = {}, blockNo;
    for (r = 0, rCount = $NC.G_VAR.active.shelfDs.length; r < rCount; r++) {
        rowData = $NC.G_VAR.active.shelfDs[r];

        if (rowData.WORK_TARGET_YN == $ND.C_NO) {
            continue;
        }

        blockNo = "BLOCK" + rowData.BLOCK_NO;
        if ($NC.isNull(bolckInfo[blockNo])) {
            bolckInfo[blockNo] = {
                DISTRIBUTE_SHELF_CNT: 0
            };
        }

        // 이전에 작업완료는 처리안함
        remainQty = rowData.ENTRY_QTY - rowData.DISTRIBUTE_QTY;
        if (remainQty == 0) {
            continue;
        }

        // 남은 수량이 없으면 다음
        if (NEW_DISTRIBUTE_QTY < 1) {
            rowData.REMAIN_QTY = 0;
            rowData.WORK_TARGET_YN = $ND.C_NO;
            continue;
        }

        // 분배수량 모두 처리할 수 있는 경우
        if (NEW_DISTRIBUTE_QTY >= remainQty) {
            rowData.REMAIN_QTY = remainQty;
            rowData.WORK_TARGET_YN = $ND.C_YES;

            bolckInfo[blockNo].DISTRIBUTE_SHELF_CNT += 1;
            NEW_DISTRIBUTE_QTY -= remainQty;
            continue;
        }

        // 분배수량 일부만 처리 가능한 경우
        if (NEW_DISTRIBUTE_QTY < remainQty) {
            rowData.REMAIN_QTY = NEW_DISTRIBUTE_QTY;
            rowData.WORK_TARGET_YN = $ND.C_YES;

            bolckInfo[blockNo].DISTRIBUTE_SHELF_CNT += 1;
            NEW_DISTRIBUTE_QTY = 0;
        }
    }

    // 선반 Element 생성시 분배 대상 선반수가 필요, 계산하여 입력
    for (r = 0, rCount = $NC.G_VAR.active.shelfDs.length; r < rCount; r++) {
        rowData = $NC.G_VAR.active.shelfDs[r];
        // 작업 대상 선반수 재세팅
        rowData.DISTRIBUTE_SHELF_CNT = 0;
        if ($NC.isNotNull(bolckInfo["BLOCK" + rowData.BLOCK_NO])) {
            rowData.DISTRIBUTE_SHELF_CNT = bolckInfo["BLOCK" + rowData.BLOCK_NO].DISTRIBUTE_SHELF_CNT;
        }
    }

    // 주문 수 조정
    var DISTRIBUTE_ORDER_CNT = 0;
    for (r in bolckInfo) {
        DISTRIBUTE_ORDER_CNT += bolckInfo[r].DISTRIBUTE_SHELF_CNT;
    }
    $NC.setValue("#edtL1_Order_CntBT", DISTRIBUTE_ORDER_CNT + " / " + $NC.G_VAR.active.shelfData.TOT_ORDER_CNT);

    // 다시 생성
    drawShelfBlocks();

    // 작업 대상 블럭 활성, 미분배 대상이 있는 블럭, drawShelfBlocks에서 세팅 됨
    if ($NC.isNull($NC.G_VAR.active.blockNo)) {
        $NC.G_VAR.active.blockNo = 1;
    }
    $("#ctrBlock" + $NC.G_VAR.active.blockNo).show();
    $("#btnBlock" + $NC.G_VAR.active.blockNo).removeClass("btnNormal").addClass("btnSpecial");
    $NC.onGlobalResize();

    // 상품바코드에 포커스
    setFocusScan("#edtL1_Item_Bar_Cd");
}

function btnDistributeCompleteOnClick(e) {

    // 버튼 클릭시 메시지 처리, 스캔은 물어보지 않음
    if ($NC.isNotNull(e)) {
        if (!confirm($NC.getDisplayMsg("JS.LOM04050E0.022", "분배완료 처리하시겠습니까?"))) {
            return;
        }
    }

    var r, rCount, rowData, dsSave = [];
    for (r = 0, rCount = $NC.G_VAR.active.shelfDs.length; r < rCount; r++) {
        rowData = $NC.G_VAR.active.shelfDs[r];

        if (rowData.WORK_TARGET_YN == $ND.C_NO) {
            continue;
        }

        dsSave.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: rowData.ITEM_LOT,
            P_DISTRIBUTE_QTY: rowData.DISTRIBUTE_QTY + rowData.REMAIN_QTY
        });
    }

    if (dsSave.length == 0) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.023", "저장 가능한 분배 데이터가 없습니다."));
        return;
    }

    // 저장
    $NC.serviceCall("/LOM04050E0/callLODistributeQtyUpdateBT.do", {
        P_DS_MASTER: dsSave,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        // 일괄 화면 닫고
        $("#btnOverlayClose").click();
        // 재조회 처리
        onSave(ajaxData);
    }, onSaveError, 2);
}

function btnDistributeCancelOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan();
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (refRowData.DISTRIBUTE_QTY == 0) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.024", "분배되지 않은 상품입니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOM04050E0.025", "상품: " + $NC.getDisplayCombo(refRowData.ITEM_CD, refRowData.ITEM_NM) //
        + "\n\n분배취소 처리하시겠습니까?", $NC.getDisplayCombo(refRowData.ITEM_CD, refRowData.ITEM_NM)))) {
        setFocusScan();
        return;
    }

    $NC.serviceCall("/LOM04050E0/callLOProcDistributeCancel.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
        P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
        P_BRAND_CD: refRowData.BRAND_CD,
        P_ITEM_CD: refRowData.ITEM_CD,
        P_ITEM_STATE: refRowData.ITEM_STATE,
        P_ITEM_LOT: refRowData.ITEM_LOT,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

function btnDistributeCancelBatchOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan();
        return;
    }

    if ($NC.G_VAR.summary.TOT_DISTRIBUTE_QTY == 0) {
        onAlert($NC.getDisplayMsg("JS.LOM04050E0.026", "분배취소 가능한 상품이 없습니다."));
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(0);
    if (!confirm($NC.getDisplayMsg("JS.LOM04050E0.027", "출고차수: " + refRowData.OUTBOUND_BATCH //
        + "\n\n전체 분배취소 처리하시겠습니까?", refRowData.OUTBOUND_BATCH))) {
        setFocusScan();
        return;
    }

    $NC.serviceCall("/LOM04050E0/callLOProcDistributeCancelBatch.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
        P_OUTBOUND_BATCH: refRowData.OUTBOUND_BATCH,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

function onCalcSummary() {

    if (G_GRDMASTER.data.getLength() == 0) {
        // 수량 초기화
        $NC.G_VAR.summary.TOT_ENTRY_QTY = 0;
        $NC.G_VAR.summary.TOT_DISTRIBUTE_QTY = 0;
        $NC.G_VAR.summary.TOT_REMAIN_QTY = 0;

        // 진행율 표시
        setProgressBar(0, 0, 0);
    } else {
        var summary = $NC.getGridSumVal(G_GRDMASTER, {
            sumKey: [
                "ENTRY_QTY",
                "DISTRIBUTE_QTY",
                "REMAIN_QTY"
            ]
        });

        // 수량 기록
        $NC.G_VAR.summary.TOT_ENTRY_QTY = summary.ENTRY_QTY; // 총출고수량
        $NC.G_VAR.summary.TOT_DISTRIBUTE_QTY = summary.DISTRIBUTE_QTY; // 총분배수량
        $NC.G_VAR.summary.TOT_REMAIN_QTY = summary.REMAIN_QTY; // 총남은수량
        // 진행율
        var DISTRIBUTE_RATE = Math.min($NC.getRoundVal((summary.DISTRIBUTE_QTY / summary.ENTRY_QTY) * 100, 1), 100);

        // 진행율 표시
        setProgressBar(summary.DISTRIBUTE_QTY, summary.ENTRY_QTY, DISTRIBUTE_RATE);
    }
}

function setSummaryDistributeQty(addValue) {

    if ($NC.isNull(addValue)) {
        addValue = 0;
    }

    // 수량 기록
    $NC.G_VAR.summary.TOT_DISTRIBUTE_QTY += addValue; // 총분배수량
    $NC.G_VAR.summary.TOT_REMAIN_QTY -= addValue; // 총남은수량
    // 진행율
    var DISTRIBUTE_RATE = Math.min($NC.getRoundVal(($NC.G_VAR.summary.TOT_DISTRIBUTE_QTY / $NC.G_VAR.summary.TOT_ENTRY_QTY) * 100, 1), 100);

    // 진행율 표시
    setProgressBar($NC.G_VAR.summary.TOT_DISTRIBUTE_QTY, $NC.G_VAR.summary.TOT_ENTRY_QTY, DISTRIBUTE_RATE);
}

function setProgressBar(totDistributeQty, totEntryQty, distributeRate) {

    $NC.setValue("#ctrProgressValue", totDistributeQty + " / " + totEntryQty + " ( " + distributeRate + "%)");
    $("#ctrProgressShape").css("width", distributeRate + "%");
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    // 저장
    if (permission.canSave) {
        $("#btnBatchComplete").click(btnBatchCompleteOnClick);
        $("#btnDistributeQtyApply").click(btnDistributeQtyApplyOnClick);
        $("#btnDistributeComplete").click(btnDistributeCompleteOnClick);
    }
    $NC.setEnable("#btnBatchComplete", permission.canSave);
    $NC.setEnable("#btnDistributeQtyApply", permission.canSave);
    $NC.setEnable("#btnDistributeComplete", permission.canSave);

    // 취소
    if (permission.canConfirmCancel) {
        $("#btnDistributeCancel").click(btnDistributeCancelOnClick);
        $("#btnDistributeCancelBatch").click(btnDistributeCancelBatchOnClick);
    }
    $NC.setEnable("#btnDistributeCancel", permission.canConfirmCancel);
    $NC.setEnable("#btnDistributeCancelBatch", permission.canConfirmCancel);
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

    if ($NC.isNotNull(G_GRDMASTER.queryParams)) {
        if (G_GRDMASTER.data.getLength() > 0) {
            $NC.G_VAR.buttons._print = "1";
        }
    }

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}