/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : VOC01020Q0
 *  프로그램명         : 보이스 실적
 *  프로그램설명       : 보이스 실적 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2019-02-25
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2019-02-25    ASETEC           신규작성
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

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 브랜드 초기화
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    // 조회조건 - 일자 초기화
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2");

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
            $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
        }
    });

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
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.VOC01020Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.VOC01020Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
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
        alert($NC.getDisplayMsg("JS.VOC01020Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.VOC01020Q0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.VOC01020Q0.005", "출고예정 검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }
    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.VOC01020Q0.006", "출고예정 검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }
    var PICK_USER_NM = $NC.getValue("#edtQPick_User_Nm", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 데이터 조회
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE1: OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: OUTBOUND_DATE2,
        P_PICK_USER_NM: PICK_USER_NM
    };
    $NC.serviceCall("/VOC01020Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        alert($NC.getDisplayMsg("JS.VOC01020Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // LABEL_CM01 - 로케이션라벨
        case "LABEL_CMC01":
        case "LABEL_CMC06":
        case "LABEL_CMC07":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                valueColumns: "LOCATION_CD"
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD
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
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
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
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "작업일자",
        cssClass: "styCenter",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "PICK_USER_ID",
        field: "PICK_USER_ID",
        name: "작업자ID",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "START_TIME",
        field: "START_TIME",
        name: "시작시간",
        cssClass: "styCenter",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "END_TIME",
        field: "END_TIME",
        name: "종료시간",
        cssClass: "styCenter",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "WORK_TIME",
        field: "WORK_TIME",
        name: "작업시간",
        cssClass: "styCenter",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "BREAK_TIME",
        field: "BREAK_TIME",
        name: "휴식시간",
        cssClass: "styCenter",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_P_HOUR",
        field: "ORDER_P_HOUR",
        name: "전표/시간",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "REC_P_HOUR",
        field: "REC_P_HOUR",
        name: "건수/시간",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "QTY_P_HOUR",
        field: "QTY_P_HOUR",
        name: "수량/시간",
        cssClass: "styRight",
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_CNT",
        field: "BATCH_CNT",
        name: "차수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_CNT",
        field: "ORDER_CNT",
        name: "전표",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "REC_CNT",
        field: "REC_CNT",
        name: "건수",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 2
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_QTY",
        field: "ITEM_QTY",
        name: "수량",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        band: 2
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.BOLD_YN == $ND.C_YES) {
                    return "styDone";
                }
                if (rowData.BOLD_YN == "YY") {
                    return "styOver";
                }
            }
        },
        showBandRow: true,
        bands: [
            "기준정보",
            "작업시간정보",
            "출고실적정보"
        ]
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "VOC01020Q0.RS_MASTER",
        sortCol: "PICK_USER_ID",
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
    $NC.setInitGridAfterOpen(G_GRDMASTER, null, true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function showUserBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtQBu_Cd", true);
    });
}

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

    onChangingCondition();
}
