/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOM07061P0
 *  프로그램명         : CJ대한통운 정산데이터 엑셀등록 팝업
 *  프로그램설명       : CJ대한통운 정산데이터 엑셀등록 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-05-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-05-07    ASETEC           신규작성
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
        // 마스터 데이터
        masterData: null
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기
    $("#btnSave").click(_Save); // 저장
    $("#btnDownloadXLSFormat").click(btnDownloadXLSFormatOnClick); // 엑셀포맷 다운로드
    $("#btnUploadXLS").click(btnUploadXLSOnClick); // 엑셀업로드

    $NC.setEnable("#edtCenter_Cd_F", false); // 물류센터 비활성화
    $NC.setEnable("#edtBu_Cd", false); // 사업부 비활성화
    $NC.setEnable("#mtpAdjust_Month", false); // 정산월 비활성화

    // 그리드 초기화
    grdDetailInitialize();
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
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);
    $NC.setValue("#mtpAdjust_Month", $NC.G_VAR.G_PARAMETER.P_ADJUST_MONTH);

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
        CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        ADJUST_MONTH: $NC.G_VAR.G_PARAMETER.P_ADJUST_MONTH + "-01"
    };

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

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOM07061P0.002", "저장할 데이터가 없습니다."));
        return;
    }

    var dsMaster = [ ];
    var rowData, rIndex, rCount;
    var totalCnt = G_GRDDETAIL.data.getLength();
    var errorCnt = 0;

    for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.ERROR_YN == $ND.C_YES) {
            errorCnt++;
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_WB_NO: rowData.WB_NO,
            P_WB_BOX_DIV: rowData.WB_BOX_DIV,
            P_WB_ADD_AMT: rowData.WB_ADD_AMT,
            P_ADJUST_MONTH: $NC.G_VAR.masterData.ADJUST_MONTH,
            P_CRUD: $ND.C_DV_CRUD_U
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM07061P0.003", "저장 가능한 데이터가 없습니다."));
        return;
    }

    var message = "[업로드건수] " + totalCnt + "\n[오류건수] " + errorCnt + "\n[저장가능한건수] " + (totalCnt - errorCnt);

    if (!confirm($NC.getDisplayMsg("JS.LOM07061P0.004", message + "\n저장 하시겠습니까?", message))) {
        return;
    }

    $NC.serviceCall("/LOM07060E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

}

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ACS_ERROR_MSG",
        field: "ACS_ERROR_MSG",
        name: "오류내용",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호"
    });
    $NC.setGridColumn(columns, {
        id: "WB_BOX_DIV",
        field: "WB_BOX_DIV",
        name: "택배박스구분",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "WB_ADD_FEE1_AMT",
        field: "WB_ADD_FEE1_AMT",
        name: "도선료",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "WB_ADD_FEE2_AMT",
        field: "WB_ADD_FEE2_AMT",
        name: "제주운임",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "WB_ADD_FEE3_AMT",
        field: "WB_ADD_FEE3_AMT",
        name: "기타운임",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "WB_ADD_AMT",
        field: "WB_ADD_AMT",
        name: "택배추가요금합계",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight",
        aggregator: "SUM",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter",
        band: 3
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호",
        band: 3
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 1,
        showBandRow: true,
        bands: [
            $NC.getDisplayMsg("JS.LOM07061P0.005", ""),
            $NC.getDisplayMsg("JS.LOM07061P0.006", "오류정보"),
            $NC.getDisplayMsg("JS.LOM07061P0.007", "CJ대한통운수수료정보"),
            $NC.getDisplayMsg("JS.LOM07061P0.008", "WNS정보")
        ],
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: null,
        sortCol: "WB_NO",
        gridOptions: options,
        canExportExcel: false
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

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}

function btnDownloadXLSFormatOnClick() {

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07061P0.009", "물류센터를 입력하십시오."));
        return;
    }
    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07061P0.010", "사업부를 입력하십시오."));
        return;
    }
    if ($NC.isNull($NC.G_VAR.masterData.ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LOM07061P0.011", "정산월을 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "WB_NO",
            P_COLUMN_TITLE: "운송장번호",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "WB_BOX_DIV_D",
            P_COLUMN_TITLE: "박스타입",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "WB_ADD_FEE1_AMT",
            P_COLUMN_TITLE: "도선료",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "WB_ADD_FEE2_AMT",
            P_COLUMN_TITLE: "제주운임",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "WB_ADD_FEE3_AMT",
            P_COLUMN_TITLE: "기타운임",
            P_COLUMN_WIDTH: 15
        }
    ];

    $NC.excelFileDownload({
        P_QUERY_ID: "LOM07060E0.RS_SUB1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_ADJUST_MONTH: $NC.G_VAR.masterData.ADJUST_MONTH
        },
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "CJ대한통운수수료업로드", // Excel Sheet Title
            P_EXCEL_FREEZE_ROW: 2
        // 고정 ROW
        },
        P_COLUMN_INFO: COLUMN_INFO
    });
}

function btnUploadXLSOnClick() {

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07061P0.009", "물류센터를 입력하십시오."));
        return;
    }
    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07061P0.010", "사업부를 입력하십시오."));
        return;
    }
    if ($NC.isNull($NC.G_VAR.masterData.ADJUST_MONTH)) {
        alert($NC.getDisplayMsg("JS.LOM07061P0.011", "정산월을 입력하십시오."));
        return;
    }

    if (G_GRDDETAIL.data.getLength() > 0) {
        if (!confirm($NC.getDisplayMsg("JS.LOM07061P0.012", "엑셀 업로드하시겠습니까?"))) {
            return;
        }
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "WB_NO",
            P_XLS_COLUMN_NM: "A"
        },
        {
            P_COLUMN_NM: "WB_BOX_DIV_D",
            P_XLS_COLUMN_NM: "B"
        },
        {
            P_COLUMN_NM: "WB_ADD_FEE1_AMT",
            P_XLS_COLUMN_NM: "C"
        },
        {
            P_COLUMN_NM: "WB_ADD_FEE2_AMT",
            P_XLS_COLUMN_NM: "D"
        },
        {
            P_COLUMN_NM: "WB_ADD_FEE3_AMT",
            P_XLS_COLUMN_NM: "E"
        }
    ];

    $NC.excelFileUpload({
        P_QUERY_ID: "LOM07060E0.RS_SUB2",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_COL_CHECK_YN: $ND.C_YES,
            P_XLS_FIRST_ROW: 3,
            P_XLS_FILE_DIV: "LO050NM"
        },
        P_COLUMN_INFO: COLUMN_INFO
    }, function(ajaxData, dsResultData) {

        if ($NC.isNull(dsResultData) || dsResultData.length == 0) {
            alert($NC.getDisplayMsg("JS.LOM07061P0.013", "업로드할 수 있는 대상 데이터가 없습니다. 엑셀 파일을 확인하십시오."));
            return;
        }

        $NC.setInitGridData(G_GRDDETAIL, dsResultData);
        $NC.setGridSelectRow(G_GRDDETAIL, 0);
    });
}
