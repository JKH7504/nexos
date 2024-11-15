/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01013P0
 *  프로그램명         : 장기미사용자관리 팝업
 *  프로그램설명       : 장기미사용자관리 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2016-12-14    ASETEC           신규작성
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
                "#grdMaster"
            ]
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnActivityUser").click(_Save);
    $("#btnClose").click(onClose);

    // 그리드 초기화
    grdMasterInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setInitGridData(G_GRDMASTER, $NC.G_VAR.G_PARAMETER.P_MASTER_DS);
    $NC.setInitGridAfterOpen(G_GRDMASTER);
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
    $NC.clearGridData(G_GRDMASTER);

    // 데이터 조회
    $NC.serviceCall("/CSC01010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01013P0.002", "활성처리할 장기미사용자를 선택하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (!confirm($NC.getDisplayMsg("JS.CSC01013P0.003", "사용자 : " + rowData.USER_ID + " - " + rowData.USER_NM //
        + "\n\n해당 사용자를 활성처리하시겠습니까?", rowData.USER_ID, rowData.USER_NM))) {
        return;
    }

    // 사용자 마스터
    var dsMaster = [
        {
            P_USER_ID: rowData.USER_ID,
            P_LOGIN_LAST_DATE: $NC.G_USERINFO.LOGIN_DATE,
            P_CRUD: $ND.C_DV_CRUD_U
        }
    ];

    $NC.serviceCall("/CSC01010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: [],
        P_DS_SUB: [],
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, _Inquiry);
}

/**
 * 삭제
 */
function _Delete() {

}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "USER_ID",
        field: "USER_ID",
        name: "사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "USER_NM",
        field: "USER_NM",
        name: "사용자명"
    });
    $NC.setGridColumn(columns, {
        id: "LOGIN_LAST_DATE",
        field: "LOGIN_LAST_DATE",
        name: "최종로그인일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REG_DATETIME",
        field: "REG_DATETIME",
        name: "최초등록일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CERTIFY_DIV_F",
        field: "CERTIFY_DIV_F",
        name: "사용자구분"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_CD_B",
        field: "CENTER_CD",
        name: "기본물류센터",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_NM_B",
        field: "CENTER_NM",
        name: "기본물류센터명"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD_B",
        field: "BU_CD",
        name: "기본사업부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM_B",
        field: "BU_NM",
        name: "기본사업부명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC01010E0.RS_SUB4",
        sortCol: "USER_ID",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER)) {
        // 팝업 창이 정상 표시되기 전에 Alert 창이 표시되므로 팝업 창 정상 표시를 위해 Delay 처이
        setTimeout(function() {
            alert($NC.getDisplayMsg("JS.CSC01013P0.004", "장기미사용 기준에 부합하는 사용자가 더 이상 없습니다."));
            onClose();
        }, $ND.C_TIMEOUT_CLOSE);
    }
}
