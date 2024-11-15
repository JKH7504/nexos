/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LOC02390E0
 *  프로그램명         : PDA 적재팔레트 매핑
 *  프로그램설명       : PDA 적재팔레트 매핑
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-06-15
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-06-15    ASETEC           신규작성
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
                return $NC.getViewHeight("#ctrMasterInfoView,#ctrDetailView,#ctrActionBar");
            }
        },
        ignoreKeyUp: false,
        lastShipId: null,
        lastOutboundDate: null,
        lastOutboundNo: null,
        lastBoxLabel: null

    });

    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 저장버튼 클릭 -> _Cancel로 처리
    $("#btnSave").click(_Cancel);
    // 취소버튼 클릭 -> _Cancel로 처리
    $("#btnCancel").click(_Cancel);
    // 취소버튼 클릭 -> _Cancel로 처리
    $("#btnDelete").click(_Delete);

    // 그리드 초기화
    grdMasterInitialize();
}

/**
 * Window Open 시 호출 됨
 */
function _OnLoaded() {

    // setFocusScan();
    _Cancel();
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
            setPolicyValInfo();
            break;
        case "BU_CD":
            setPolicyValInfo();
            break;
        case "WORK_DATE":
            break;
    }

    // 조건 변경시 초기화
    _Cancel($ND.C_CLEAR_TYPE_ALL);
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
        case "SHIP_ID":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onShipIdScan(view, val);
            break;
        case "BOX_LABEL":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onBoxLabelScan(view, val);
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
        case "SHIP_ID":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onShipIdScan(view, $NC.getValue(view));
            break;
        case "BOX_LABEL":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onBoxLabelScan(view, $NC.getValue(view));
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
        P_OUTBOUND_DATE: $NC.G_VAR.lastOutboundDate,
        P_OUTBOUND_NO: $NC.G_VAR.lastOutboundNo,
        P_SHIP_ID: $NC.G_VAR.lastShipId,
        P_OUTBOUND_YN: $NC.iif($NC.isNotNull($NC.G_VAR.lastOutboundNo), $ND.C_YES, $ND.C_NO)
    };
    // 데이터 조회
    $NC.serviceCall("/PDA_LOC02390E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onShipIdError);
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
    if ($NC.isNull($NC.G_VAR.lastShipId)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02310E0.XXX", "적재파렛트를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02310E0.XXX", "처리할 매핑 내역이 없습니다."));
        setFocusScan();
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.serviceCall("/PDA_LOC02390E0/callLOShipWork.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: refRowData.OUTBOUND_NO,
        P_BOX_NO: refRowData.BOX_NO,
        P_SHIP_ID: refRowData.SHIP_ID,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02390E0.XXX", "삭제할 데이터가 없습니다."));
        return;
    }

    // 마지막 row 삭제 시 전역변수(출고일자/번호) 초기화
    if (G_GRDMASTER.data.getLength() == 1) {
        $NC.G_VAR.lastOutboundDate = null;
        $NC.G_VAR.lastOutboundNo = null;
        setMasterInputValue();
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.serviceCall("/PDA_LOC02390E0/callLOShipDelete.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_OUTBOUND_DATE: refRowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: refRowData.OUTBOUND_NO,
        P_BOX_NO: refRowData.BOX_NO,
        P_SHIP_ID: refRowData.SHIP_ID,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel(clearType) {

    // clearType
    // C_CLEAR_TYPE_ALL: 0
    // C_CLEAR_TYPE_MASTER: 1
    // C_CLEAR_TYPE_DETAIL: 2
    // C_CLEAR_TYPE_SUB: 3
    // clearType가 취소 버튼 클릭 Event Object일 경우도 있음
    if (clearType instanceof $.Event || $NC.isNull(clearType)) {
        clearType = $ND.C_CLEAR_TYPE_ALL;
    }

    if (clearType <= $ND.C_CLEAR_TYPE_MASTER) {
        // 전역 변수 초기화
        $NC.G_VAR.lastShipId = null;
        $NC.G_VAR.lastOutboundDate = null;
        $NC.G_VAR.lastOutboundNo = null;
        $NC.G_VAR.lastBoxLabel = null;

        // 값 초기화
        $NC.setValue("#edtShip_Id");
        $NC.setValue("#edtBox_Label");

        $NC.clearGridData(G_GRDMASTER);
        // 모두 비활성
        $NC.setEnable("#edtBox_Label", false);

        // 리사이즈 호출
        $NC.onGlobalResize();
    }

    if (clearType <= $ND.C_CLEAR_TYPE_DETAIL) {
        // 전역 변수 초기화
        $NC.G_VAR.lastBoxLabel = null;
        $NC.G_VAR.lastOutboundDate = null;
        $NC.G_VAR.lastOutboundNo = null;
        // 값 초기화
        setMasterInputValue();

        if (clearType == $ND.C_CLEAR_TYPE_DETAIL) {
            $NC.setEnable("#edtBox_Label");
        }
    }

    if (clearType == $ND.C_CLEAR_TYPE_SUB) {
        // 전역 변수 초기화
        $NC.G_VAR.lastBoxLabel = null;
        $NC.setValue("#edtBox_Label");
    }

    if (clearType >= $ND.C_CLEAR_TYPE_DETAIL) {
        setFocusScan("#edtBox_Label");
    } else {
        setFocusScan();
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
    // 스캔 Element - 적재파렛트
    if ($view.prop("id") == "edtShip_Id") {
        return;
    }
    // 스캔 Element - 박스라벨
    if ($view.prop("id") == "edtBox_Label") {
        // 비활성이면 적재파렛트로
        if (!$NC.isEnable($view)) {
            setFocusScan();
        }
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        // 적재파렛트 스캔하여 정상 조회되어 있으면 박스라벨에 포커스
        if ($NC.isNull($NC.G_VAR.lastShipId)) {
            setFocusScan();
        } else {
            setFocusScan("#edtBox_Label");
        }
    }
}

function setFocusScan(selector) {

    var $view = $NC.getView($NC.isNull(selector) ? "#edtShip_Id" : selector);
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
        id: "BOX_LABEL",
        field: "BOX_LABEL",
        name: "박스라벨",
        minWidth: 100
    });
    $NC.setGridColumn(columns, {
        id: "BOX_NO",
        field: "BOX_NO",
        name: "박스번호",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_SIZE_NM",
        field: "BOX_SIZE_NM",
        name: "박스사이즈",
        minWidth: 80
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        minWidth: 65,
        cssClass: "styRight"
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
        queryId: "PDA_LOC02390E0.RS_MASTER",
        sortCol: "BOX_LABEL",
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

function setMasterInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtOutbound_Date", rowData["OUTBOUND_DATE"]);
    $NC.setValue("#edtOutbound_No", rowData["OUTBOUND_NO"]);
    $NC.setValue("#edtRDelivery_Nm", rowData["RDELIVERY_NM"]);
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    // 기본 체크, 첫번째 ROW 데이터로
    var resultData = dsResult[0];

    $NC.setInitGridData(G_GRDMASTER, dsResult);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "BOX_LABEL", true)) {
        $NC.G_VAR.lastOutboundDate = resultData.OUTBOUND_DATE;
        $NC.G_VAR.lastOutboundNo = resultData.OUTBOUND_NO;
    }

    // 입력 활성, 값 세팅
    $NC.setEnableGroup("#ctrDetailView");
    setMasterInputValue(resultData);
    setFocusScan("#edtBox_Label");
}

function onGetBoxLabel(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02390E0.XXX", "박스라벨 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }

    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }

    var outboundInfo = $NC.G_VAR.lastBoxLabel.split("-");

    // 신규 데이터 공통 처리
    var rowData = {
        CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        BU_CD: $NC.G_USERINFO.BU_CD,
        OUTBOUND_DATE: $NC.iif($NC.isDate($NC.G_VAR.lastOutboundDate), $NC.G_VAR.lastOutboundDate, $NC.getDate(outboundInfo[2])),
        OUTBOUND_NO: $NC.iif($NC.isNotNull($NC.G_VAR.lastOutboundNo), $NC.G_VAR.lastOutboundNo, outboundInfo[3]),
        BOX_LABEL: $NC.G_VAR.lastBoxLabel,
        BOX_NO: outboundInfo[4],
        SHIP_DATE: $NC.G_USERINFO.LOGIN_DATE,
        SHIP_ID: $NC.G_VAR.lastShipId,
        CRUD: $ND.C_DV_CRUD_C,
        id: $NC.getGridNewRowId()
    };

    setFocusScan("#edtBox_Label");
    $NC.newGridRowData(G_GRDMASTER, rowData);

    _Save();
}

function onShipIdScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtShip_Id");
        scanVal = $NC.getValue($scan);
    }

    if ($NC.isNull(scanVal)) {
        _Cancel();
        return;
    }

    // 초기화
    // _Cancel();
    $NC.G_VAR.lastOutboundDate = null;
    $NC.G_VAR.lastOutboundNo = null;

    $NC.G_VAR.lastShipId = scanVal;
    $NC.setValue($scan, scanVal);

    $NC.serviceCall("/PDA_LOC02390E0/getDataSet.do", {
        P_QUERY_ID: "PDA_LOC02390E0.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_OUTBOUND_DATE: $NC.G_VAR.lastOutboundDate,
            P_OUTBOUND_NO: $NC.G_VAR.lastOutboundNo,
            P_SHIP_ID: $NC.G_VAR.lastShipId,
            P_OUTBOUND_YN: $ND.C_NO
        }
    }, onGetMaster, onShipIdError);
}

function onBoxLabelScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtBox_Label");
        scanVal = $NC.getValue($scan);
    }

    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        setFocusScan("#edtBox_Label");
        return;
    }

    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_SUB);

    $NC.G_VAR.lastBoxLabel = scanVal;
    $NC.setValue($scan, scanVal);

    // 박스라벨 길이 체크
    if ($NC.G_VAR.lastBoxLabel.length < 25) {
        alert($NC.getDisplayMsg("JS.PDA_LOC02390E0.XXX", "박스라벨 형식이 아닙니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }

    // 박스라벨 검색
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: "BOX_LABEL",
        searchVal: $NC.G_VAR.lastBoxLabel

    });
    if (searchRow > -1) {
        $NC.setGridSelectRow(G_GRDMASTER, searchRow);
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }

    $NC.serviceCall("/PDA_LOC02390E0/getData.do", {
        P_QUERY_ID: "PDA_LOC02390E0.LO_BOXLABEL_CHECK",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_OUTBOUND_DATE: $NC.G_VAR.lastOutboundDate,
            P_OUTBOUND_NO: $NC.G_VAR.lastOutboundNo,
            P_SHIP_ID: $NC.G_VAR.lastShipId,
            P_BOX_LABEL: $NC.G_VAR.lastBoxLabel,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }
    }, onGetBoxLabel, onBoxLabelError);
}

function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);

    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }

    _Cancel($ND.C_CLEAR_TYPE_SUB);

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "BOX_LABEL"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onShipIdError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel();
    setFocusScan();
}

function onBoxLabelError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel($ND.C_CLEAR_TYPE_SUB);
    setFocusScan("#edtBox_Label");
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel($ND.C_CLEAR_TYPE_SUB);

    _Inquiry();
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

}