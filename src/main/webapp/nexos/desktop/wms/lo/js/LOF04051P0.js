/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOF04051P0
 *  프로그램명         : 수동DAS 결품차수 생성 팝업 [풀필먼트]
 *  프로그램설명       : 수동DAS 결품차수 생성 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-10-20
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-12-24    ASETEC           신규작성
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
        autoResizeFixedView: function() {
            var resizeView = {
                viewType: "v",
                viewFixed: 180,
                exceptHeight: $NC.getViewHeight("#ctrPopupView")
            };
            // 기타출고
            if ($NC.isVisible("#divDetailView")) {
                resizeView.viewFirst = {
                    container: "#divDetailView",
                    grids: "#grdDetail"
                };
            }
            // 기타입고
            else {
                resizeView.viewSecond = {
                    container: "#divSubView",
                    grids: "#grdSub"
                };
            }

            return resizeView;
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnCancel").click(onCancel);
    $("#btnComplete").click(_Save);
    $("#btnClose").click(onClose);

    // 조회조건 - 출고차수 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "LOF04050E0.RS_SUB3",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            P_BU_CD: "",
            P_OUTBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE
        }
    }, {
        selector: "#cboQOutbound_Batch",
        codeField: "OUTBOUND_BATCH",
        fullNameField: "OUTBOUND_BATCH_F",
        addCustom: {
            codeFieldVal: $ND.C_BASE_BATCH_NO,
            nameFieldVal: "신규"
        }
    });

    $("#divDetailView").show(); // 결품차수 생성전 결품내역 G_GRDDETAIL 표시
    $("#divSubView").hide(); // 결품차수 생성후 분배번호 변경내역 G_GRDSUB 비표시
    $("#btnComplete").show();// 처리 버튼 표시
    $("#btnCancel").show();// 취소 버튼 표시
    $("#btnClose").hide(); // 닫기 버튼 비표시

    $("#ctrInfoView").show(); // 전표 수 표시
    $("#ctrShelfView").hide();// 분배번호 비표시

    // 그리드 초기화
    grdDetailInitialize();
    grdSubInitialize();

    $("#btnPrint").click(btnPrintOnClick);

    // 전표수 세팅
    setOrderCnt();

    setReportInfo();

    // 조회
    _Inquiry();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

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

    $NC.setPopupCloseAction($ND.C_OK);
    $NC.onPopupClose();
}

/**
 * 조회
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);

    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_OUTBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE,
        P_OUTBOUND_BATCH: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_BATCH
    };

    // 데이터 조회
    $NC.serviceCall("/LOF04050E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

/**
 * 신규
 */
function _New() {
}

/**
 * 저장
 */
function _Save() {

    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");

    if (OUTBOUND_BATCH == $NC.G_VAR.G_PARAMETER.P_OUTBOUND_BATCH) {// 작업차수와 결품차수가 동일할때
        alert($NC.getDisplayMsg("JS.LOF04051P0.002", "현재 작업중인 차수와 동일한 차수 입니다."));
        return;
    }

    $NC.serviceCall("/LOF04050E0/callLOProcDistributeReBatch.do", {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: "",
        P_OUTBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE,
        P_OUTBOUND_BATCH: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_BATCH,
        P_NEW_OUTBOUND_BATCH: OUTBOUND_BATCH,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * 삭제
 */
function _Delete() {
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {
}

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "SHELF_NO",
        field: "SHELF_NO",
        name: "DAS번호",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
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

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LOF04050E0.RS_SUB4",
        sortCol: "SHELF_NO",
        gridOptions: options

    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

}

/**
 * 그리드 행 선택 변경 했을 경우
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

function grdSubOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "PRE_OUTBOUND_BATCH",
        field: "PRE_OUTBOUND_BATCH",
        name: "이전출고차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PRE_SHELF_NO",
        field: "PRE_SHELF_NO",
        name: "이전DAS번호",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_BATCH",
        field: "OUTBOUND_BATCH",
        name: "출고차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHELF_NO",
        field: "SHELF_NO",
        name: "DAS번호",
        cssClass: "styRight"
    });
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

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdSubInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LOF04050E0.RS_SUB5",
        sortCol: "SHELF_NO",
        gridOptions: options

    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);

}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDSUB.data.getItem(row);

    $NC.setValue("#edtPre_Shelf_No", rowData.PRE_SHELF_NO);
    $NC.setValue("#edtOutBound_Batch", rowData.OUTBOUND_BATCH);
    $NC.setValue("#edtShelf_No", rowData.SHELF_NO);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "SHELF_NO");
}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB, "SHELF_NO");
}

/**
 * 결품처리 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {
    $("#divDetailView").hide();
    $("#divSubView").show();

    $("#ctrInfoView").hide();
    $("#ctrShelfView").show();
    $("#btnCancel").hide();// 취소 비표시
    $("#btnComplete").hide();// 처리 비표시
    $("#btnClose").show(); // 닫기 표시

    $NC.onGlobalResize();

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);

    G_GRDSUB.queryParams = {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: "",
        P_OUTBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE,
        P_PRE_OUTBOUND_BATCH: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_BATCH
    // 결품 처리 후 이전출고차수
    };

    // 데이터 조회
    $NC.serviceCall("/LOF04050E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

}

/**
 * 저장 오류 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

    $NC.playErrorSound();
    $NC.onError(ajaxData);
}

/**
 * 차수의 전표 수 및 작업완료,미완료 전표수 조회
 */
function setOrderCnt() {
    // 데이터 조회
    $NC.serviceCallAndWait("/LOF04050E0/getData.do", {
        P_QUERY_ID: "WF.GET_DISTRIBUTE_ORDER_CNT",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            P_BU_CD: "",
            P_OUTBOUND_DATE: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_DATE,
            P_OUTBOUND_BATCH: $NC.G_VAR.G_PARAMETER.P_OUTBOUND_BATCH
        }
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        if ($NC.isEmpty(resultData)) {
            alert($NC.getDisplayMsg("JS.LOF04051P0.003", "작업이 완료된 차수 입니다."));
            return;
        }
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }

        $NC.setValue("#edtTotal_Order_Cnt", resultData.O_TOTAL_ORDER_CNT);
        $NC.setValue("#edtTotal_Complete_Cnt", resultData.O_TOTAL_COMPLETE_CNT);
        $NC.setValue("#edtTotal_Remain_Cnt", resultData.O_TOTAL_REMAIN_CNT);

    });
}

/**
 * 출력 Button Event
 */
function btnPrintOnClick() {
    var reportIndex = $NC.getSearchArray($NC.G_VAR.printOptions, {
        searchKey: "REPORT_CD",
        searchVal: "PAPER_LOF08" // PAPER_LOF08 - 선반번호변경지시서(결품차수)
    });
    if (reportIndex == -1) {
        alert($NC.getDisplayMsg("JS.LOF04051P0.004", "출력할 레포트 정보를 검색할 수 없습니다. 관리자에게 문의하십시오."));
        return;
    }
    var reportInfo = $NC.G_VAR.printOptions[reportIndex];

    if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
        alert($NC.getDisplayMsg("JS.LOF04051P0.005", "출력 할 데이터가 없습니다."));
        return;
    }
    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

    if (!confirm($NC.getDisplayMsg("JS.LOF04051P0.006", "출력 하시겠습니까?"))) {
        return;
    }

    var checkedData = [ ];
    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: reportInfo.REPORT_DOC_URL,
        reportTitle: reportInfo.REPORT_TITLE_NM,
        queryId: reportInfo.REPORT_QUERY_ID,
        queryParams: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: "",
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
            P_PRE_OUTBOUND_BATCH: rowData.PRE_OUTBOUND_BATCH
        },
        internalQueryYn: reportInfo.INTERNAL_QUERY_YN,
        checkedValue: $NC.toJoin(checkedData)
    };

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);
}

function setReportInfo() {

    // 레포트 세팅
    $NC.setProgramReportInfo("/WC/getDataSet.do", "WC.GET_CSPROGRAMREPORT", {
        P_PROGRAM_ID: "LOF04050E0",
        P_PROGRAM_SUB_CD: $ND.C_NULL,
        P_BU_CD: $NC.G_USERINFO.BU_CD
    });
}
