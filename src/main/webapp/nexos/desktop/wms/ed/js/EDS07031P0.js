/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDS07031P0
 *  프로그램명         : 배송처[한덱스]미송신내역 팝업
 *  프로그램설명       : 배송처[한덱스]미송신내역 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-08-11
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-08-11    ASETEC           신규작성
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
    $("#btnClose").click(onClose); // 닫기버튼
    $("#btnSend").click(btnSendOnClick); // 송신처리버튼
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

    // 팝업이 정상적으로 표시되지 않아 _OnResize 한번 호출
    $NC.onGlobalResize();

    _Inquiry();
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
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 조회
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_EDI_DIV: $NC.G_VAR.G_PARAMETER.P_EDI_DIV,
        P_DEFINE_NO: $NC.G_VAR.G_PARAMETER.P_DEFINE_NO,
        P_CENTER_CD: "",
        P_SEND_DATE1: "",
        P_SEND_DATE2: ""
    };
    // 데이터 조회
    $NC.serviceCall("/EDS07030E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처코드",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "EDCOMMON.POP_NON_SEND_INFO",
        sortCol: "DELIVERY_CD",
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

/**
 * 미송신 내역
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);
}

function btnSendOnClick() {

    if (!$NC.G_VAR.G_PARAMETER.P_PERMISSION.canSave) {
        alert($NC.getDisplayMsg("JS.EDS07031P0.002", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.EDS07031P0.003", "송신처리할 배송처 데이터가 없습니다."));
        return;
    }

    var refRowData = $NC.getGridItemFromGroup(G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow), G_GRDMASTER);
    if (!confirm($NC.getDisplayMsg("JS.EDS07031P0.004", "미송신 배송처 데이터를 송신하시겠습니까?"))) {
        return;
    }

    $NC.setPopupCloseAction($ND.C_OK, refRowData);
    $NC.onPopupClose();
}