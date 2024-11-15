/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC05080Q0
 *  프로그램명         : 적재파렛트출력
 *  프로그램설명       : 적재파렛트출력 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-06-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-06-14    ASETEC           신규작성
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
            grids: "#grdMaster",
            exceptHeight: $NC.getViewHeight("#divTopView")
        },
        PRINTER_NAME: $NC.G_USERINFO.PRINT_SHIP_ID,
        shipIdGenYN: $ND.C_NO, // 적재파렛트 발행버튼 클릭 여부
        O_SHIP_ID1: "", // 시작파렛트ID
        O_SHIP_ID2: "" // 종료파렛트ID
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 사업부 초기화
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    // 조회조건 - 적재일자 초기화
    $NC.setInitDatePicker("#dtpQShip_Date");

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
        }
    });

    $("#btnQBu_Cd").click(showUserBuPopup); // 사업부 버튼 클릭 이벤트
    $("#btnShip_Id_Gen").click(onBtnShipIdGen); // 적재파렛트 발행 버튼 클릭 이벤트

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo({}, function(reportInfo) {

        // LABEL_LOM03 - 적재파렛트라벨이면 표시 안함, 자동출력시만 사용
        return reportInfo.REPORT_CD != "LABEL_LOM03";
    });
}

/**
 * IFrame이 로드가 완료되었을 경우 자동 호출 됨
 */

function _OnLoaded() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 * 
 * @param parent
 *        상위 view, 기본은 contentWindow
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * Input, Select Change Event - 조회 조건이 변경되었을 경우 호출 됨
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 * @param val
 *        변경된 값
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "SHIP_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.CMC05080Q0.001", "검색 적재일자를 정확히 입력하십시오."));
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
        case "SHIP_ID_CNT":
            $NC.setFocus("#btnShip_Id_Gen");
            break;
    }
}

function onChangingCondition() {

    // $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05080Q0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var SHIP_DATE = $NC.getValue("#dtpQShip_Date");
    if ($NC.isNull(SHIP_DATE)) {
        alert($NC.getDisplayMsg("JS.CMC05080Q0.003", "적재일자를 입력하십시오."));
        $NC.setFocus("#dtpQShip_Date");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_SHIP_DATE: SHIP_DATE
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05080Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    var dsMaster = [
        {
            P_PRINT_YN: $ND.C_YES,
            P_SHIP_ID1: $NC.G_VAR.O_SHIP_ID1,
            P_SHIP_ID2: $NC.G_VAR.O_SHIP_ID2,
            P_CRUD: $ND.C_DV_CRUD_U
        }
    ];

    $NC.serviceCall("/CMC05080Q0/save.do", {
        P_DS_MASTER: dsMaster,
        P_REG_USER_ID: $NC.G_USERINFO.USER_ID
    });
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

    // 조회조건 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05080Q0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var SHIP_DATE = $NC.getValue("#dtpQShip_Date");
    if ($NC.isNull(SHIP_DATE)) {
        alert($NC.getDisplayMsg("JS.CMC05080Q0.003", "적재일자를 입력하십시오."));
        $NC.setFocus("#dtpQShip_Date");
        return;
    }

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LOM07 - 적재파렛트내역
        case "PAPER_LOM07":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                valueColumns: "SHIP_ID"
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_SHIP_DATE: SHIP_DATE
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
        id: "SHIP_ID",
        field: "SHIP_ID",
        name: "적재파렛트ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIP_SEQ",
        field: "SHIP_SEQ",
        name: "일련번호",
        cssClass: "styCenter"
    });
    // $NC.setGridColumn(columns, {
    // id: "PRINT_YN",
    // field: "PRINT_YN",
    // name: "출력여부",
    // cssClass: "styRight",
    // formatter: Slick.Formatters.CheckBox
    // });
    $NC.setGridColumn(columns, {
        id: "REG_USER_ID",
        field: "REG_USER_ID",
        name: "최초등록자ID"
    });
    $NC.setGridColumn(columns, {
        id: "REG_DATETIME",
        field: "REG_DATETIME",
        name: "최초등록일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC05080Q0.RS_MASTER",
        sortCol: "SHIP_ID",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    // var rowData = G_GRDMASTER.data.getItem(row);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "SHIP_ID", true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);

    // 발행 버튼 클릭 시 추가된 row focus
    if ($NC.G_VAR.shipIdGenYN == $ND.C_YES) {
        var rowLengthGap = ($NC.G_VAR.O_SHIP_ID2.substr(8) - $NC.G_VAR.O_SHIP_ID1.substr(8)) + 1;
        $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.data.getLength() - rowLengthGap, false, true);
        $NC.G_VAR.shipIdGenYN = $ND.C_NO; // 발행버튼 클릭 여부 초기화
    }
}

/**
 * 적재파렛트 발행 버튼 클릭
 */
function onBtnShipIdGen() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05080Q0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var SHIP_ID_CNT = $NC.getValue("#edtShip_Id_Cnt");
    if ($NC.isNull(SHIP_ID_CNT)) {
        alert($NC.getDisplayMsg("JS.CMC05080Q0.004", "적재파렛트 발행매수를 입력하십시오."));
        $NC.setFocus("#edtShip_Id_Cnt");
        return;
    }

    $NC.serviceCall("/CMC05080Q0/callShipIdGetNo.do", {
        P_CENTER_CD: CENTER_CD,
        P_CREATE_DATE: "",
        P_SHIP_ID_CNT: SHIP_ID_CNT,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onGetShipIdGen);
}

function onGetShipIdGen(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    $NC.G_VAR.O_SHIP_ID1 = resultData.O_SHIP_ID1;
    $NC.G_VAR.O_SHIP_ID2 = resultData.O_SHIP_ID2;

    // 적재파렛트 발행버튼 클릭 여부 변수 UPDATE
    $NC.G_VAR.shipIdGenYN = $ND.C_YES;
    _Inquiry();

    doPrint();
}

/**
 * 자동 출력
 */
function doPrint() {

    var reportIndex = $NC.getSearchArray($NC.G_VAR.printOptions, {
        searchKey: "REPORT_CD",
        searchVal: "LABEL_LOM03"
    });
    if (reportIndex == -1) {
        alert($NC.getDisplayMsg("JS.CMC05080Q0.005", "출력할 레포트 정보를 검색할 수 없습니다. 관리자에게 문의하십시오."));
        return;
    }
    var reportInfo = $NC.G_VAR.printOptions[reportIndex];

    // 현재 자동 출력은 Internet Explorer 에서만 지원 됨, 그외 미리보기 표시
    if ($.browser.msie) {
        if ($NC.isNull($NC.G_USERINFO.PRINT_SHIP_ID)) {
            alert($NC.getDisplayMsg("JS.CMC05080Q0.006", "설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오."));
            return;
        }

        $NC.silentPrint({
            printParams: [
                {
                    reportDoc: reportInfo.REPORT_DOC_URL,
                    reportTitle: reportInfo.REPORT_TITLE_NM,
                    queryId: reportInfo.REPORT_QUERY_ID,
                    queryParams: {
                        P_SHIP_ID1: $NC.G_VAR.O_SHIP_ID1,
                        P_SHIP_ID2: $NC.G_VAR.O_SHIP_ID2
                    },
                    internalQueryYn: reportInfo.INTERNAL_QUERY_YN,
                    iFrameNo: 1,
                    silentPrinterName: $NC.G_VAR.PRINTER_NAME
                }
            ],
            onAfterPrint: function() {
                _Save();
            }
        });
    } else {
        // 출력 파라메터 세팅
        var printOptions = {
            reportDoc: reportInfo.REPORT_DOC_URL,
            reportTitle: reportInfo.REPORT_TITLE_NM,
            queryId: reportInfo.REPORT_QUERY_ID,
            queryParams: {
                P_SHIP_ID1: $NC.G_VAR.O_SHIP_ID1,
                P_SHIP_ID2: $NC.G_VAR.O_SHIP_ID2
            },
            internalQueryYn: reportInfo.INTERNAL_QUERY_YN
        };

        // 적재파렛트 출력 완료 후 출력 여부 업데이트 처리
        // printOptions.onAfterPrint = function() {
        // _Save();
        // };

        // 출력 미리보기 호출
        $NC.showPrintPreview(printOptions);
    }
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BRAND_CD: $ND.C_ALL,
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

    // 브랜드 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}
