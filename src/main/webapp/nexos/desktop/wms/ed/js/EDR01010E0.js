/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDR01010E0
 *  프로그램명         : 인터페이스 수신관리
 *  프로그램설명       : 인터페이스 수신관리 화면 Javascript
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
            grids: "#grdDetail"
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divMaster",
                grids: "#grdMaster"
            },
            viewSecond: function(viewWidth, viewHeight) {
                return {
                    container: "#divSubView",
                    grids: $NC.getTabActiveIndex("#divSubView") == 0 ? "#grdSub2" : "#grdSub3"
                };
            },
            viewType: "h",
            viewFixed: {
                container: "viewSecond",
                size: 500
            }
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSub2Initialize();
    grdSub3Initialize();

    // 조회조건 - 사업부 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $("#btnQBu_Cd").click(showUserBuPopup);

    // 탭 초기화
    $NC.setInitTab("#divSubView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    $("#btnEntryCheck").click(btnEntryCheckOnClick);
    $("#btnEntryIdentifier").click(btnEntryIdentifierOnClick);
    $("#btnCopy").click(btnCopyOnClick);

    // 조회조건 - 수신구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "EDI_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "1",
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQEdi_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQEdi_Div", $ND.C_ALL);
        }
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "h", 200, 200);
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
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BU_CD":
            if (val == $ND.C_BASE_BU_CD) {
                $NC.setValue("#edtQBu_Nm", $ND.C_BASE_NM);
                break;
            } else {
                $NP.onUserBuChange(val, {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_BU_CD: val,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }, onUserBuPopup, {
                    addBase: $ND.C_BASE_BU_CD
                });
                return;
            }
    }
    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var BU_CD = $NC.getValue("#edtQBu_Cd", $ND.C_NULL);
    // if ($NC.isNull(BU_CD)) {
    // alert($NC.getDisplayMsg("JS.EDR01010E0.001", "사업부를 입력하십시오."));
    // $NC.setFocus("#edtQBu_Cd");
    // return;
    // }

    var EDI_DIV = $NC.getValue("#cboQEdi_Div");
    if ($NC.isNull(EDI_DIV)) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.002", "수신구분을 선택하십시오."));
        $NC.setFocus("#cboQEdi_Div");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_BU_CD: BU_CD,
        P_EDI_DIV: EDI_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/EDR01010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var BU_CD = $NC.getValue("#edtQBu_Cd", $ND.C_NULL);
    var BU_NM = $NC.getValue("#edtQBu_Nm", $NC.getDisplayMsg("JS.EDR01010E0.003", "공통"));
    // if ($NC.isNull(BU_CD)) {
    // alert($NC.getDisplayMsg("JS.EDR01010E0.001", "사업부를 입력하십시오."));
    // $NC.setFocus("#edtQBu_Cd");
    // return;
    // }

    var EDI_DIV = $NC.getValue("#cboQEdi_Div");
    if ($NC.isNull(EDI_DIV)) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.002", "수신구분을 선택하십시오."));
        $NC.setFocus("#cboQEdi_Div");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "EDR01011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.EDR01010E0.004", "수신정의등록/수정"),
        url: "ed/EDR01011P0.html",
        width: 1100,
        height: 620,
        G_PARAMETER: {
            P_PROCESS_CD: $ND.C_PROCESS_CREATE,
            P_BU_CD: BU_CD,
            P_BU_NM: BU_NM,
            P_EDI_DIV: EDI_DIV,
            P_MASTER_DS: {},
            P_DETAIL_DS: [ ]
        },
        onOk: function() {
            onSave();
        }
    });
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

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.005", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.EDR01010E0.006", "선택한 수신정의를 삭제하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    rowData.CRUD = $ND.C_DV_CRUD_D;
    G_GRDMASTER.data.updateItem(rowData.id, rowData);

    var dsMaster = [
        {
            P_BU_CD: rowData.BU_CD,
            P_EDI_DIV: rowData.EDI_DIV,
            P_DEFINE_NO: rowData.DEFINE_NO,
            P_CRUD: rowData.CRUD
        }
    ];

    $NC.serviceCall("/EDR01010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: null,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

}

/**
 * 조회조건 항목 값 변경시 화면 초기화
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDSUB2);
    $NC.clearGridData(G_GRDSUB3);
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function grdMasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "EDI_DIV",
        field: "EDI_DIV",
        name: "수신코드"
    });
    $NC.setGridColumn(columns, {
        id: "EDI_DIV_D",
        field: "EDI_DIV_D",
        name: "수신코드구분"
    });
    $NC.setGridColumn(columns, {
        id: "DEFINE_NO",
        field: "DEFINE_NO",
        name: "정의번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DEFINE_NM",
        field: "DEFINE_NM",
        name: "수신정의명"
    });
    $NC.setGridColumn(columns, {
        id: "DATA_DIV_D",
        field: "DATA_DIV_D",
        name: "수신처리구분"
    });
    // 스케줄
    $NC.setGridColumn(columns, {
        id: "AUTO_EXEC_YN",
        field: "AUTO_EXEC_YN",
        name: "자동실행여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    // DBLink, DBConnect
    $NC.setGridColumn(columns, {
        id: "LINK_WHERE_TEXT",
        field: "LINK_WHERE_TEXT",
        name: "수신추가조건절"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_DB_NM",
        field: "LINK_DB_NM",
        name: "데이터베이스명"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_TABLE_NM",
        field: "LINK_TABLE_NM",
        name: "테이블명"
    });
    // EXCEL
    $NC.setGridColumn(columns, {
        id: "XLS_FIRST_ROW",
        field: "XLS_FIRST_ROW",
        name: "엑셀데이터첫행",
        cssClass: "styRight"
    });
    // TEXT
    $NC.setGridColumn(columns, {
        id: "TXT_DELIMETER_YN",
        field: "TXT_DELIMETER_YN",
        name: "텍스트구분자사용여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "TXT_COL_DELIMETER",
        field: "TXT_COL_DELIMETER",
        name: "텍스트컬럼구분자"
    });
    // XML
    $NC.setGridColumn(columns, {
        id: "XML_TAG_ROOT",
        field: "XML_TAG_ROOT",
        name: "[XML]루트태그"
    });
    $NC.setGridColumn(columns, {
        id: "XML_TAG_BUNCH",
        field: "XML_TAG_BUNCH",
        name: "[XML]단위태그"
    });
    $NC.setGridColumn(columns, {
        id: "XML_TAG_SUB_BUNCH",
        field: "XML_TAG_SUB_BUNCH",
        name: "[XML]하위단위태그"
    });
    $NC.setGridColumn(columns, {
        id: "XML_TAG_RESULT",
        field: "XML_TAG_RESULT",
        name: "[XML]처리결과태그"
    });
    // JSON
    $NC.setGridColumn(columns, {
        id: "JSON_TAG_ROOT",
        field: "JSON_TAG_ROOT",
        name: "[JSON]루트태그"
    });
    $NC.setGridColumn(columns, {
        id: "JSON_TAG_BUNCH",
        field: "JSON_TAG_BUNCH",
        name: "[JSON]단위태그"
    });
    $NC.setGridColumn(columns, {
        id: "JSON_TAG_SUB_BUNCH",
        field: "JSON_TAG_SUB_BUNCH",
        name: "[JSON]하위단위태그"
    });
    $NC.setGridColumn(columns, {
        id: "JSON_TAG_RESULT",
        field: "JSON_TAG_RESULT",
        name: "[JSON]처리결과태그"
    });
    // SAP
    $NC.setGridColumn(columns, {
        id: "SAP_FUNCTION_NM",
        field: "SAP_FUNCTION_NM",
        name: "[SAP]펑션명"
    });
    $NC.setGridColumn(columns, {
        id: "SAP_TABLE_NM",
        field: "SAP_TABLE_NM",
        name: "[SAP]테이블명"
    });
    // $NC.setGridColumn(columns, {
    // id: "SAP_PARAM_MAP",
    // field: "SAP_PARAM_MAP",
    // name: "[SAP]파라메터매핑",
    // minWidth: 150
    // });
    // 원격송수신
    $NC.setGridColumn(columns, {
        id: "REMOTE_DIV_F",
        field: "REMOTE_DIV_F",
        name: "원격송수신구분"
    });
    $NC.setGridColumn(columns, {
        id: "REMOTE_IP",
        field: "REMOTE_IP",
        name: "원격서버IP"
    });
    $NC.setGridColumn(columns, {
        id: "REMOTE_PORT",
        field: "REMOTE_PORT",
        name: "원격서버포트"
    });
    $NC.setGridColumn(columns, {
        id: "REMOTE_PASSIVE_YN",
        field: "REMOTE_PASSIVE_YN",
        name: "패시브모드",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "REMOTE_USER_ID",
        field: "REMOTE_USER_ID",
        name: "원격사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "REMOTE_PARAM_MAP",
        field: "REMOTE_PARAM_MAP",
        name: "원격파라메터매핑"
    });
    $NC.setGridColumn(columns, {
        id: "REMOTE_DIR",
        field: "REMOTE_DIR",
        name: "원격서버경로"
    });
    // 웹서비스
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_DIV_F",
        field: "WEBSERVICE_DIV_F",
        name: "웹서비스구분"
    });
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_URL",
        field: "WEBSERVICE_URL",
        name: "웹서비스URL"
    });
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_HEADER_VAL",
        field: "WEBSERVICE_HEADER_VAL",
        name: "웹서비스헤더값"
    });
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_METHOD",
        field: "WEBSERVICE_METHOD",
        name: "웹서비스메소드"
    });
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_NS_PREFIX",
        field: "WEBSERVICE_NS_PREFIX",
        name: "웹서비스네임스페이스접두어"
    });
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_NS_URI",
        field: "WEBSERVICE_NS_URI",
        name: "웹서비스네임스페이스URI"
    });
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_TAG_RESULT",
        field: "WEBSERVICE_TAG_RESULT",
        name: "웹서비스호출결과태그"
    });
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_PARAM_NM",
        field: "WEBSERVICE_PARAM_NM",
        name: "웹서비스파라메터명"
    });
    $NC.setGridColumn(columns, {
        id: "WEBSERVICE_PARAM_VAL",
        field: "WEBSERVICE_PARAM_VAL",
        name: "웹서비스파라메터값"
    });
    $NC.setGridColumn(columns, {
        id: "CUSTOM_METHOD",
        field: "CUSTOM_METHOD",
        name: "수신처리메소드"
    });
    // 스케줄
    $NC.setGridColumn(columns, {
        id: "DATA_CYCLE_DIV_D",
        field: "DATA_CYCLE_DIV_D",
        name: "실행주기구분"
    });
    $NC.setGridColumn(columns, {
        id: "REPEAT_EXEC_TIME",
        field: "REPEAT_EXEC_TIME",
        name: "실행주기"
    });
    // 기타
    $NC.setGridColumn(columns, {
        id: "EDI_DIR",
        field: "EDI_DIR",
        name: "서버파일경로"
    });
    $NC.setGridColumn(columns, {
        id: "PREFIX_FILE_NM",
        field: "PREFIX_FILE_NM",
        name: "파일명접두사"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "EDR01010E0.RS_MASTER",
        sortCol: "DEFINE_NO",
        gridOptions: options,
        canDblClick: true
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDDETAIL);
    // 파라메터 세팅
    G_GRDDETAIL.queryParams = {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO
    };

    // 컬럼 표시 조정
    grdDetailOnSetColumns(rowData);
    // 데이터 조회
    $NC.serviceCall("/EDR01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDSUB2);
    // 파라메터 세팅
    G_GRDSUB2.queryParams = {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO
    };
    // 데이터 조회
    $NC.serviceCall("/EDR01010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB2), onGetSub2);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDSUB3);
    // 파라메터 세팅
    G_GRDSUB3.queryParams = {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO
    };
    // 데이터 조회
    $NC.serviceCall("/EDR01010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB3), onGetSub3);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnDblClick(e, args) {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.007", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(args.row);
    if ($NC.isNull(refRowData)) {
        return;
    }

    // 디테일 데이터 재조회 후 처리, 다른 사용자에 의해 변경될 수 있음
    $NC.clearGridData(G_GRDDETAIL);
    G_GRDDETAIL.queryParams = {
        P_BU_CD: refRowData.BU_CD,
        P_EDI_DIV: refRowData.EDI_DIV,
        P_DEFINE_NO: refRowData.DEFINE_NO
    };
    // 데이터 조회, Synchronize
    var serviceCallError = false;
    $NC.serviceCallAndWait("/EDR01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail, function(ajaxData) {
        $NC.onError(ajaxData);
        serviceCallError = true;
    });
    if (serviceCallError) {
        return;
    }
    var dsDetail = G_GRDDETAIL.data.getItems();
    if (dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.008", "수정할 데이터가 존재하지 않습니다. 다시 조회 후 데이터를 확인하십시오."));
        return;
    }

    var BU_NM = $NC.getValue("#edtQBu_Nm");

    $NC.showProgramSubPopup({
        PROGRAM_ID: "EDR01011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.EDR01011P0.001", "수신정의등록/수정"),
        url: "ed/EDR01011P0.html",
        width: 1100,
        height: 600,
        G_PARAMETER: {
            P_PROCESS_CD: $ND.C_PROCESS_UPDATE,
            P_BU_CD: refRowData.BU_CD,
            P_BU_NM: BU_NM,
            P_EDI_DIV: refRowData.EDI_DIV,
            P_MASTER_DS: refRowData,
            P_DETAIL_DS: dsDetail,
            P_PERMISSION: permission
        },
        onOk: function() {
            onSave();
        }
    });
}

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "COLUMN_ID",
        field: "COLUMN_ID",
        name: "ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_NM",
        field: "COLUMN_NM",
        name: "컬럼명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "컬럼설명"
    });
    // DBLink, DBConnect, SAP
    $NC.setGridColumn(columns, {
        id: "DATA_TYPE_F",
        field: "DATA_TYPE_F",
        name: "수신컬럼타입",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_COLUMN_NM",
        field: "LINK_COLUMN_NM",
        name: "수신컬럼명",
        initialHidden: true
    });
    // EXCEL
    $NC.setGridColumn(columns, {
        id: "XLS_COLUMN_NM",
        field: "XLS_COLUMN_NM",
        name: "엑셀컬럼명",
        cssClass: "styCenter",
        initialHidden: true
    });
    // TEXT
    $NC.setGridColumn(columns, {
        id: "TXT_POSITION",
        field: "TXT_POSITION",
        name: "텍스트시작위치",
        cssClass: "styRight",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "TXT_LENGTH",
        field: "TXT_LENGTH",
        name: "텍스트컬럼길이",
        cssClass: "styRight",
        initialHidden: true
    });
    // XML
    $NC.setGridColumn(columns, {
        id: "XML_TAG_NM",
        field: "XML_TAG_NM",
        name: "[XML]태그명",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "XML_TAG_ATTR",
        field: "XML_TAG_ATTR",
        name: "[XML]태그속성",
        initialHidden: true
    });
    // JSON
    $NC.setGridColumn(columns, {
        id: "JSON_COLUMN_NM",
        field: "JSON_COLUMN_NM",
        name: "[JSON]컬럼명",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "DATA_NULL_YN",
        field: "DATA_NULL_YN",
        name: "널허용여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "DATA_DEFAULT",
        field: "DATA_DEFAULT",
        name: "기본값"
    });
    $NC.setGridColumn(columns, {
        id: "DATA_CHANGE_SQL",
        field: "DATA_CHANGE_SQL",
        name: "값변경SQL"
    });
    $NC.setGridColumn(columns, {
        id: "DATE_FORMAT_DIV_F",
        field: "DATE_FORMAT_DIV_F",
        name: "날짜포맷구분"
    });
    $NC.setGridColumn(columns, {
        id: "DATE_INPUT_DIV_F",
        field: "DATE_INPUT_DIV_F",
        name: "날짜입력구분"
    });
    $NC.setGridColumn(columns, {
        id: "IF_CODE_GRP",
        field: "IF_CODE_GRP",
        name: "변환코드그룹"
    });
    $NC.setGridColumn(columns, {
        id: "IF_CODE_GRP_D",
        field: "IF_CODE_GRP_D",
        name: "변환코드그룹명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailOnSetColumns(refRowData) {

    if ($NC.isNull(refRowData)) {
        refRowData = {};
    }

    // 디테일 그리드 컬럼 세팅
    $NC.setGridColumns(G_GRDDETAIL, [ // 숨김컬럼 세팅
        refRowData.DATA_DIV != $ND.C_DATA_DIV_DBLINK //
            && refRowData.DATA_DIV != $ND.C_DATA_DIV_DBCONNECT //
            && refRowData.DATA_DIV != $ND.C_DATA_DIV_SAP ? "DATA_TYPE_F,LINK_COLUMN_NM" : "",
        refRowData.DATA_DIV != $ND.C_DATA_DIV_EXCEL ? "XLS_COLUMN_NM" : "",
        refRowData.DATA_DIV != $ND.C_DATA_DIV_TEXT ? "TXT_POSITION,TXT_LENGTH" : "",
        refRowData.DATA_DIV != $ND.C_DATA_DIV_XML ? "XML_TAG_NM,XML_TAG_ATTR" : "",
        refRowData.DATA_DIV != $ND.C_DATA_DIV_JSON ? "JSON_COLUMN_NM" : ""
    ]);
}

/**
 * 하단그리드 초기화
 */
function grdDetailInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "EDR01010E0.RS_DETAIL",
        sortCol: "COLUMN_ID",
        gridOptions: options
    });
    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSub2OnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "CHECK_NO",
        field: "CHECK_NO",
        name: "체크번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CHECK_NM",
        field: "CHECK_NM",
        name: "수신체크명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSub2Initialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub2", {
        columns: grdSub2OnGetColumns(),
        queryId: "EDR01010E0.RS_SUB2",
        sortCol: "CHECK_NO",
        gridOptions: options
    });
    G_GRDSUB2.view.onSelectedRowsChanged.subscribe(grdSub2OnAfterScroll);
}

function grdSub2OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB2, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB2, row + 1);
}

function grdSub3OnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "LINK_COLUMN_ID",
        field: "LINK_COLUMN_ID",
        name: "ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_COLUMN_NM",
        field: "LINK_COLUMN_NM",
        name: "컬럼명"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_DATA_TYPE_F",
        field: "LINK_DATA_TYPE_F",
        name: "컬럼타입"
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_VAL1",
        field: "COLUMN_VAL1",
        name: "초기값"
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_VAL2",
        field: "COLUMN_VAL2",
        name: "1차수신결과값"
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_VAL3",
        field: "COLUMN_VAL3",
        name: "최종수신결과값"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSub3Initialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub3", {
        columns: grdSub3OnGetColumns(),
        queryId: "EDR01010E0.RS_SUB3",
        sortCol: "LINK_COLUMN_ID",
        gridOptions: options
    });
    G_GRDSUB3.view.onSelectedRowsChanged.subscribe(grdSub3OnAfterScroll);
}

function grdSub3OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB3, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB3, row + 1);
}

/**
 * 수신정의 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "EDI_DIV",
        "DEFINE_NO"
    ], true)) {
        $NC.clearGridData(G_GRDDETAIL);
        $NC.clearGridData(G_GRDSUB2);
        $NC.clearGridData(G_GRDSUB3);
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 수신정의 상세내역 조회
 * 
 * @param ajaxData
 */
function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "COLUMN_ID");
}

function onGetSub2(ajaxData) {

    $NC.setInitGridData(G_GRDSUB2, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB2, "CHECK_NO");
}

function onGetSub3(ajaxData) {

    $NC.setInitGridData(G_GRDSUB3, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB3, "LINK_COLUMN_ID");
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        queryParams: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        },
        addBase: $ND.C_BASE_BU_CD
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtQBu_Cd", true);
    });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setFocus("#edtQBu_Cd", true);
    }
    onChangingCondition();
}

function btnEntryCheckOnClick() {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.007", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.009", "등록된 수신정의가 한건도 없습니다."));
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.showProgramSubPopup({
        PROGRAM_ID: "EDR01012P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.EDR01012P0.001", "수신체크등록/수정"),
        url: "ed/EDR01012P0.html",
        width: 800,
        height: 600,
        G_PARAMETER: {
            P_BU_CD: refRowData.BU_CD,
            P_EDI_DIV: refRowData.EDI_DIV,
            P_DEFINE_NO: refRowData.DEFINE_NO,
            P_MASTER_DS: G_GRDSUB2.data.getItems()
        },
        onOk: function() {
            onSave();
        }
    });
}

function btnEntryIdentifierOnClick() {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.007", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.009", "등록된 수신정의가 한건도 없습니다."));
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (!(refRowData.DATA_DIV == $ND.C_DATA_DIV_DBLINK || (refRowData.DATA_DIV == $ND.C_DATA_DIV_DBCONNECT && refRowData.REMOTE_ACTION_TYPE == "1"))) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.010", "수신처리구분이 [DBLink, DBConnect - TABLE<SELECT>]인 경우만 등록할 수 있습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "EDR01013P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.EDR01013P0.001", "수신플래그등록/수정"),
        url: "ed/EDR01013P0.html",
        width: 1024,
        height: 300,
        G_PARAMETER: {
            P_BU_CD: refRowData.BU_CD,
            P_EDI_DIV: refRowData.EDI_DIV,
            P_DEFINE_NO: refRowData.DEFINE_NO,
            P_MASTER_DS: G_GRDSUB3.data.getItems()
        },
        onOk: function() {
            onSave();
        }
    });
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "EDI_DIV",
            "DEFINE_NO"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장시 에러 발생 했을 경우 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData, true);
    }
}

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *        newTab: The tab that was just activated.<br>
 *        oldTab: The tab that was just deactivated.<br>
 *        newPanel: The panel that was just activated.<br>
 *        oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

    $NC.onGlobalResize();
}

function btnCopyOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.007", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.EDR01010E0.001", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "EDR01014P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.EDR01014P0.001", "수신관리 복사"),
        url: "ed/EDR01014P0.html",
        width: 800,
        height: 500,
        resizeable: false,
        G_PARAMETER: {
            P_BU_CD: BU_CD,
            P_BU_NM: BU_NM,
            P_PERMISSION: permission
        },
        onOk: function() {
            _Inquiry();
        }
    });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnableButton("#divSubView", permission.canSave && enable);
    $NC.setEnable("#btnCopy", permission.canSave && enable);
}