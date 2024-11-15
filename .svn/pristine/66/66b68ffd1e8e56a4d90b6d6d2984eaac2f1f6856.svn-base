/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_RIB01110E1
 *  프로그램명         : PDA 반품도착확인 (의류)
 *  프로그램설명       : PDA 반품도착확인 (의류) 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-06-22
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-06-22    ASETEC           신규작성
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
        lastBuNo: null

    });

    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 취소버튼 클릭 -> _Cancel로 처리
    // $("#btnCancel").click(_Cancel);
    // 처리버튼 클릭 -> _Save로 처리
    $("#btnSave").click(_Save);

    // 그리드 초기화
    grdMasterInitialize();

    // 권한 설정
    setUserProgramPermission();

    onGetGrdMaster();
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
    onGetGrdMaster();
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
        case "BU_NO":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onBuNoScan(view, val);
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
        case "BU_NO":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onBuNoScan(view, $NC.getValue(view));
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

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
    if ($NC.isNull($NC.G_VAR.lastBuNo)) {
        alert($NC.getDisplayMsg("JS.PDA_RIB01110E1.XXX", "전표번호를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    $NC.serviceCall("/PDA_RIB01110E1/callRIProcArrivalCheck.do", {
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_ARRIVAL_DATE: $NC.G_USERINFO.WORK_DATE,
        P_BU_NO: $NC.G_VAR.lastBuNo,
        P_ARRIVAL_USER_ID: $NC.G_USERINFO.USER_ID,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onBuNoError);
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
        $NC.G_VAR.lastBuNo = null;

        // 값 초기화
        $NC.setValue("#edtBu_No");
        $NC.clearGridData(G_GRDMASTER);
    }
    if (clearType <= $ND.C_CLEAR_TYPE_MASTER) {
        // 전역 변수 초기화
        $NC.G_VAR.lastBuNo = null;

        // 값 초기화
        $NC.setValue("#edtBu_No");

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
    // 스캔 Element - 전표번호
    if ($view.prop("id") == "edtBu_No") {
        return;
    }

    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        // 전표번호 스캔하여 정상 조회되어 있으면 다시 전표번호에 포커스
        if ($NC.isNull($NC.G_VAR.lastBuNo)) {
            setFocusScan();
        }
    }
}
function setFocusScan(selector) {
    var $view = $NC.getView($NC.isNull(selector) ? "#edtBu_No" : selector);
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
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        rowHeight: 30,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "PDA_RIB01110E1.RS_MASTER",
        sortCol: "BU_NO",
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

    $NC.setValue("#edtPre_Bu_No", rowData.BU_NO);

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

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);

    // 입력 활성, 값 세팅
    $NC.setEnableGroup("#ctrMasterInfoView");

    // 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDMASTER, dsResult);
    $NC.setInitGridAfterOpen(G_GRDMASTER);
    $NC.setValue("#edtBu_No_Cnt", dsResult.length);

}

function onBuNoScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtBu_No");
        scanVal = $NC.getValue($scan);
    }

    // 전표번호
    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_MASTER);
        return;
    }
    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_MASTER);
    $NC.G_VAR.lastBuNo = scanVal;
    $NC.setValue($scan, scanVal);

    _Save();

}

function onSave(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);

    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_RIB01110E10.XXX", "전표번호 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_MASTER);
        return;
    }

    var applyRow = -1, searchRow, rIndex, rCount, rowData;
    // 검색 데이터가 1건
    if ($NC.isNotNull(dsResult)) {
        rowData = dsResult;
        // 상품코드 검색
        searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
            searchKey: [
                "BU_NO"
            ],
            searchVal: [
                rowData.BU_NO
            ]
        });
        // 없을 경우 데이터 추가
        if (searchRow == -1) {
            rowData.ROW_NO = G_GRDMASTER.data.getLength() + 1;
            rowData.BU_NO = $NC.G_VAR.lastBuNo;
            rowData.id = $NC.getGridNewRowId();

            // 상품 선택
            G_GRDMASTER.lastRow = -1;
            $NC.newGridRowData(G_GRDMASTER, rowData);
        } else {

            // 상품 선택
            G_GRDMASTER.lastRow = -1;
            $NC.setGridSelectRow(G_GRDMASTER, searchRow);
        }
    } else {
        // 여러건이면 어떤 상품인지 알 수 없으므로 수량을 0으로 추가
        for (rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
                searchKey: [
                    "BU_NO"
                ],
                searchVal: [
                    rowData.BU_NO
                ]
            });
            // 없을 경우 데이터 추가
            if (searchRow == -1) {
                rowData.ROW_NO = G_GRDMASTER.data.getLength() + 1;
                rowData.BU_NO = $NC.G_VAR.lastBuNo;
                rowData.id = $NC.getGridNewRowId();

                // 상품 선택
                G_GRDMASTER.lastRow = -1;
                $NC.newGridRowData(G_GRDMASTER, rowData);

                applyRow = G_GRDMASTER.lastRow;
            } else {
                applyRow = searchRow;
            }
        }

        // 상품 선택
        G_GRDMASTER.lastRow = -1;
        $NC.setGridSelectRow(G_GRDMASTER, applyRow);
    }
    $NC.setValue("#edtBu_No_Cnt", dsResult.ROW_NO);
    _Cancel($ND.C_CLEAR_TYPE_MASTER);
}

function onBuNoError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel($ND.C_CLEAR_TYPE_MASTER);
    setFocusScan();
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
function onGetGrdMaster() {
    $NC.serviceCall("/PDA_RIB01110E1/getDataSet.do", {
        P_QUERY_ID: "PDA_RIB01110E1.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_ARRIVAL_DATE: $NC.G_USERINFO.WORK_DATE,
            P_ARRIVAL_USER_ID: $NC.G_USERINFO.USER_ID
        }
    }, onGetMaster, onBuNoError);
}