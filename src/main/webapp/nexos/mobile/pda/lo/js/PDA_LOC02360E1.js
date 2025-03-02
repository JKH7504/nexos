/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LOC02360E1
 *  프로그램명         : PDA 상차검수 (의류)
 *  프로그램설명       : PDA 상차검수 (의류) 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-06-30
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-06-30    ASETEC           신규작성
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
            container: "#ctrMasterView",
            grids: "#grdMaster",
            exceptHeight: function() {
                return $NC.getViewHeight("#ctrMasterInfoView,#ctrActionBar");
            }
        },

        ignoreKeyUp: false,
        lastWbNo: null

    });

    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 취소버튼 클릭 -> _Cancel로 처리
    // $("#btnCancel").click(_Cancel);
    // 처리버튼 클릭 -> _Save로 처리
    $("#btnSave").click(_Save);

    $NC.setValue("#edtTot_Wb_No_Cnt", "0");
    $NC.setValue("#edtScan_Wb_No_Cnt", "0");

    // 그리드 초기화
    grdMasterInitialize();

    // 권한 설정
    setUserProgramPermission();

    _Inquiry();

}

/**
 * Window Open 시 호출 됨
 */
function _OnLoaded() {

    setFocusScan();
    _Cancel($ND.C_CLEAR_TYPE_ALL);
}

/**
 * Window Focus 시 호출 됨
 */
function _OnFocus() {

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

}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    // 기본정보 변경, id는 무조건 기본정보 뷰의 id 기준
    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            break;
        case "BU_CD":
            break;
        case "WORK_DATE":
            break;
    }

    // 조건 변경시 초기화
    _Cancel($ND.C_CLEAR_TYPE_ALL);
    _Inquiry();
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "WB_NO":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onWbNoScan(view, val);
            break;
    }
}

/**
 * Input KeyUp Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnInputKeyUp(e, view) {

    // Enter Key일 경우만 처리
    if (e.keyCode != 13) {
        return;
    }

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "WB_NO":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onWbNoScan(view, $NC.getValue(view));
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_WORK_DATE: $NC.G_USERINFO.WORK_DATE
    };
    // 데이터 조회
    $NC.serviceCall("/PDA_LOC02360E1/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onWbNoError);

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

    // 저장 전 Validation
    if ($NC.isNull($NC.G_VAR.lastWbNo)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02360E1.XXX", "운송장번호를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    $NC.serviceCall("/PDA_LOC02360E1/callLOProcLoadCheck.do", {
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_WORK_DATE: $NC.G_USERINFO.WORK_DATE,
        P_WB_NO: $NC.G_VAR.lastWbNo,
        P_LOAD_USER_ID: $NC.G_USERINFO.USER_ID,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onWbNoError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel(clearType) {

    // clearType
    // C_CLEAR_TYPE_ALL: 0
    // C_CLEAR_TYPE_MASTER: 1
    if ($NC.isNull(clearType)) {
        clearType = $ND.C_CLEAR_TYPE_ALL;
    }
    // clearType가 취소 버튼 클릭 Event Object일 경우도 있음
    if (clearType instanceof $.Event || $NC.isNull(clearType)) {
        clearType = $ND.C_CLEAR_TYPE_MASTER;
    }
    if (clearType <= $ND.C_CLEAR_TYPE_ALL) {
        // 전역 변수 초기화
        $NC.G_VAR.lastWbNo = null;

        // 값 초기화
        $NC.setValue("#edtWb_No");
        $NC.setValue("#edtTot_Wb_No_Cnt", "0");
        $NC.setValue("#edtScan_Wb_No_Cnt", "0");
        $NC.setValue("#edtOrderer_Nm");
        $NC.setValue("#edtShipper_Nm");
        $NC.clearGridData(G_GRDMASTER);
    }
    if (clearType <= $ND.C_CLEAR_TYPE_MASTER) {
        // 전역 변수 초기화
        $NC.G_VAR.lastWbNo = null;

        // 값 초기화
        $NC.setValue("#edtWb_No");

    }

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
 * 최상위 컨테이너 Click에 이벤트 바인딩하여 스캔 Edit로 포커스 이동 처리
 * 
 * @param e
 * @returns
 */
function onContainerFocus(e) {

    var $view = $(e.target);
    // 하단 액션버튼은 처리 안함
    if ($view.is("span") && $view.parent(".btnAction").length > 0) {
        return;
    }
    // 그리드 셀 복사일 경우 처리 안함
    if (e.ctrlKey && $view.is(".slick-cell")) {
        return;
    }
    // 스캔 Element - 운송장번호
    if ($view.prop("id") == "edtWb_No") {
        return;
    }

    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        // 운송장번호 스캔하여 정상 조회되어 있으면 다시 운송장번호에 포커스
        if ($NC.isNull($NC.G_VAR.lastWbNo)) {
            setFocusScan();
        }
    }
}
function setFocusScan(selector) {
    var $view = $NC.getView($NC.isNull(selector) ? "#edtWb_No" : selector);
    if ($NC.isEnable($view)) {
        // Delay 처리
        setTimeout(function() {
            $view.focus();
            $NC.hideSoftInput(); // 일단 스캔 항목 키보드 숨김 처리
        }, $ND.C_TIMEOUT_FOCUS);
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ROW_NO",
        field: "ROW_NO",
        name: "No",
        resizable: false,
        minWidth: 30,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        rowHeight: 30,
        frozenColumn: 0,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.CANCEL_YN == $ND.C_YES) {
                    return "styDiff";
                }
                if (rowData.LOAD_YN == $ND.C_YES) {
                    return "styDone";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "PDA_LOC02360E1.RS_MASTER",
        sortCol: "WB_NO",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    var rowData = G_GRDMASTER.data.getItem(row);
    setTimeout(function() {
        setDetailInputValue(rowData);
    });

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnCellChange() {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    rowData.LOAD_YN = $ND.C_YES;
    $NC.setValue("#edtScan_Wb_No_Cnt", $NC.toNumber($NC.getValue("#edtScan_Wb_No_Cnt")) + 1);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function setMasterInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtTot_Wb_No_Cnt", rowData["TOT_WB_NO_CNT"]);
    $NC.setValue("#edtScan_Wb_No_Cnt", rowData["SCAN_WB_NO_CNT"]);
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    // 기본 체크, 첫번째 ROW 데이터로
    var resultData = dsResult[0];
    // if (dsResult.length == 0) {
    // alert($NC.getDisplayMsg("JS.PDA_LOC02360E10.XXX", "상차검수 정보가 없습니다."));
    // _Cancel();
    // return;
    // }

    if (dsResult.length !== 0) {
        // 입력 활성, 값 세팅
        $NC.setEnableGroup("#ctrMasterInfoView");
        setMasterInputValue(resultData);

        // 그리드 데이터 세팅
        $NC.setInitGridData(G_GRDMASTER, dsResult);
        $NC.setInitGridAfterOpen(G_GRDMASTER);
    }

}

function onWbNoScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtWb_No");
        scanVal = $NC.getValue($scan);
    }

    // 운송장번호
    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_MASTER);
        setFocusScan();
        return;
    }
    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_MASTER);
    $NC.G_VAR.lastWbNo = scanVal;
    $NC.setValue($scan, scanVal);

    _Save();

}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02360E1.XXX", "운송장번호 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_MASTER);
        return;
    }
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_MASTER);
        return;
    }

    // 운송장번호 검색
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: [
            "WB_NO"
        ],
        searchVal: [
            resultData.P_WB_NO
        ]
    });

    if (searchRow == -1) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02360E10.XXX", "상차 검수에 존재하지 않는 운송장번호입니다."));
        _Cancel($ND.C_CLEAR_TYPE_MASTER);
        return;
    } else {
        $NC.setGridSelectRow(G_GRDMASTER, searchRow);
        grdMasterOnCellChange();
    }

    _Cancel($ND.C_CLEAR_TYPE_MASTER);
    setFocusScan();
}

function onWbNoError(ajaxData) {

    $NC.onError(ajaxData);
    setFocusScan();
}

function setDetailInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtOrderer_Nm", $NC.getDisplayNumber(rowData["ORDERER_NM"]));
    $NC.setValue("#edtShipper_Nm", $NC.getDisplayNumber(rowData["SHIPPER_NM"]));
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    if (!permission.canSave) {
        $("#btnSave").addClass("styDisabled");
    }
}