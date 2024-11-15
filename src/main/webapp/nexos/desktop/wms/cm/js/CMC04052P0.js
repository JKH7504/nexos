/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04052P0
 *  프로그램명         : 물류센터상품등록 팝업
 *  프로그램설명       : 물류센터상품등록 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-10-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-10-14    ASETEC           신규작성
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

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
        CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD
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
        alert($NC.getDisplayMsg("JS.CMC04052P0.002", "저장할 데이터가 없습니다."));
        return;
    }

    var dsMaster = [];
    var dsDetail = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);

        if ($NC.isNotNull(rowData.OPEN_DATE)) {
            if (!$NC.isDate(rowData.OPEN_DATE)) {
                alert($NC.getDisplayMsg("JS.CMC04052P0.003", "상품: " + rowData.ITEM_CD + "의 거래일자 타입 오류입니다.", rowData.ITEM_CD));
                $NC.setFocusGrid(G_GRDDETAIL, rIndex);
                return;
            }
        }
        if ($NC.isNotNull(rowData.CLOSE_DATE)) {
            if (!$NC.isDate(rowData.CLOSE_DATE)) {
                alert($NC.getDisplayMsg("JS.CMC04052P0.004", "상품: " + rowData.ITEM_CD + "의 종료일자 타입 오류입니다.", rowData.ITEM_CD));
                $NC.setFocusGrid(G_GRDDETAIL, rIndex);
                return;
            }
        }

        dsMaster.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_DCTC_DIV: rowData.DCTC_DIV,
            P_REQUEST_MNG_DIV: rowData.REQUEST_MNG_DIV,
            P_FILL_LIMIT_DAY: rowData.FILL_LIMIT_DAY,
            P_BASE_OP_DAY: rowData.BASE_OP_DAY,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: $NC.getDate(rowData.OPEN_DATE),
            P_CLOSE_DATE: $NC.getDate(rowData.CLOSE_DATE),
            P_CRUD: rowData.CRUD_FLAG,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        });
    }

    $NC.serviceCall("/CMC04050E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "브랜드코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "DCTC_DIV_F",
        field: "DCTC_DIV_F",
        name: "발주상품구분"
    });
    $NC.setGridColumn(columns, {
        id: "REQUEST_MNG_DIV_F",
        field: "REQUEST_MNG_DIV_F",
        name: "발주관리구분"
    });
    $NC.setGridColumn(columns, {
        id: "FILL_LIMIT_DAY",
        field: "FILL_LIMIT_DAY",
        name: "리드타임",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BASE_OP_DAY",
        field: "BASE_OP_DAY",
        name: "기준운영일수",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY"),
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
        name: "거래시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        cssClass: "styCenter"
    });

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
        queryId: null,
        sortCol: "ITEM_CD",
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
        alert($NC.getDisplayMsg("JS.CMC04052P0.005", "물류센터를 입력하십시오."));
        return;
    }
    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04052P0.006", "사업부를 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "BRAND_CD",
            P_COLUMN_TITLE: "브랜드코드",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "ITEM_CD",
            P_COLUMN_TITLE: "상품코드",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "DCTC_DIV",
            P_COLUMN_TITLE: "발주상품구분",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "REQUEST_MNG_DIV",
            P_COLUMN_TITLE: "발주관리구분",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "FILL_LIMIT_DAY",
            P_COLUMN_TITLE: "리드타임",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "BASE_OP_DAY",
            P_COLUMN_TITLE: "기준운영일수",
            P_COLUMN_WIDTH: 15
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
            P_COLUMN_NM: "REMARK1",
            P_COLUMN_TITLE: "비고",
            P_COLUMN_WIDTH: 40
        }
    ];

    $NC.excelFileDownload({
        P_QUERY_ID: "CMC04050E0.RS_SUB2",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "물류센터상품업로드", // Excel Sheet Title
            P_EXCEL_FREEZE_ROW: 2
            // 고정 ROW
        },
        P_COLUMN_INFO: COLUMN_INFO
    });
}

function btnUploadXLSOnClick() {

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04052P0.005", "물류센터를 입력하십시오."));
        return;
    }
    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04052P0.006", "사업부를 입력하십시오."));
        return;
    }
    if (G_GRDDETAIL.data.getLength() > 0) {
        if (!confirm($NC.getDisplayMsg("JS.CMC04052P0.007", "엑셀 업로드시 기존 내역 삭제 후 추가됩니다. 엑셀 업로드하시겠습니까?"))) {
            return;
        }
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "BRAND_CD",
            P_XLS_COLUMN_NM: "A"
        },
        {
            P_COLUMN_NM: "ITEM_CD",
            P_XLS_COLUMN_NM: "B"
        },
        {
            P_COLUMN_NM: "DCTC_DIV",
            P_XLS_COLUMN_NM: "C"
        },
        {
            P_COLUMN_NM: "REQUEST_MNG_DIV",
            P_XLS_COLUMN_NM: "D"
        },
        {
            P_COLUMN_NM: "FILL_LIMIT_DAY",
            P_XLS_COLUMN_NM: "E"
        },
        {
            P_COLUMN_NM: "BASE_OP_DAY",
            P_XLS_COLUMN_NM: "F"
        },
        {
            P_COLUMN_NM: "DEAL_DIV",
            P_XLS_COLUMN_NM: "G"
        },
        {
            P_COLUMN_NM: "OPEN_DATE",
            P_XLS_COLUMN_NM: "H"
        },
        {
            P_COLUMN_NM: "CLOSE_DATE",
            P_XLS_COLUMN_NM: "I"
        }
    ];

    $NC.excelFileUpload({
        P_QUERY_ID: "CMC04050E0.RS_SUB3",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_COL_CHECK_YN: $ND.C_YES,
            P_XLS_FIRST_ROW: 3,
            P_XLS_FILE_DIV: "CENTERITEM"
        },
        P_COLUMN_INFO: COLUMN_INFO
    }, function(ajaxData, dsResultData) {

        if ($NC.isNull(dsResultData) || dsResultData.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04052P0.008", "업로드할 수 있는 대상 데이터가 없습니다. 엑셀 파일을 확인하십시오."));
            return;
        }

        $NC.setInitGridData(G_GRDDETAIL, dsResultData);
        $NC.setGridSelectRow(G_GRDDETAIL, 0);
    });
}
