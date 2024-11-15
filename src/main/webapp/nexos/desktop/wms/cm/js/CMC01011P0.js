/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC01011P0
 *  프로그램명         : 물류센터마스터 좌표일괄등록 팝업
 *  프로그램설명       : 물류센터마스터 좌표일괄등록 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2020-08-26
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-08-26    ASETEC           신규작성
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
            container: "#ctrPopupView",
            grids: [
                "#grdMaster"
            ]
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 버튼 클릭 이벤트 연결
    $("#btnEntryCoord").click(btnEntryCoordOnClick); // 일괄등록버튼
    $("#btnClose").click(onCancel); // 닫기버튼
}

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

    // 그리드 데이터 세팅
    var dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
    var rowData, newRowData;
    G_GRDMASTER.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = dsMaster.length; rIndex < rCount; rIndex++) {
            rowData = dsMaster[rIndex];
            newRowData = {
                CENTER_CD: rowData.CENTER_CD,
                CENTER_NM: rowData.CENTER_NM,
                ZIP_CD: rowData.ZIP_CD,
                ADDR_BASIC: rowData.ADDR_BASIC,
                ADDR_DETAIL: rowData.ADDR_DETAIL,
                GEOCODE_LAT: rowData.GETCODE_LAT,
                GEOCODE_LNG: rowData.GETCODE_LNG,
                CHECK_YN: $ND.C_YES,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_R
            };
            G_GRDMASTER.data.addItem(newRowData);
        }
    } finally {
        G_GRDMASTER.data.endUpdate();
    }

    $NC.setGridSelectRow(G_GRDMASTER, 0);
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

}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

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

}

/**
 * 삭제
 */
function _Delete() {

}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CENTER_CD",
        field: "CENTER_CD",
        name: "물류센터코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_NM",
        field: "CENTER_NM",
        name: "물류센터명"
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_BASIC",
        field: "ADDR_BASIC",
        name: "기본주소"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_DETAIL",
        field: "ADDR_DETAIL",
        name: "상세주소"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: null,
        sortCol: "CENTER_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

// 일괄등록 처리
function btnEntryCoordOnClick() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC01011P0.002", "일괄등록 처리 하시겠습니까?"))) {
        return;
    }

    var checkedValue = $NC.getGridCheckedValues(G_GRDMASTER, {
        valueColumns: "CENTER_CD",
        dataType: "O"
    }).values;

    var serviceParams = {
        P_TABLE_NM: "CMCENTER",
        P_PROGRAM_ID: $NC.G_VAR.G_PARAMETER.P_PROGRAM_ID
    };

    $NC.serviceCall("/CMC01010E0/callGetCoordinate.do", {
        P_CHECKED_VALUE: checkedValue,
        P_SERVICE_PARAMS: serviceParams,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }

        $NC.setPopupCloseAction($ND.C_OK);
        $NC.onPopupClose();
    });
}
