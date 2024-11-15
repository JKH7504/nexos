/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LDC05020E0
 *  프로그램명         : 물류비정산
 *  프로그램설명       : 물류비정산 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-02-27
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-12-24    ASETEC           신규작성
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
        },
        // 체크할 정책 값
        policyVal: {
            CM510: "" // 운송권역 관리정책
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2", null, "CM");

    // 이벤트 연결
    $("#btnQArea_Cd").click(showQDeliveryAreaPopup);
    $("#btnQRDelivery_Cd").click(showRDeliveryPopup);
    $("#btnQDept_Cd").click(showDeptPopup);

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 물류센터 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSUSERCENTER",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CENTER_CD: $ND.C_ALL
        }
    }, {
        selector: "#cboQCenter_Cd",
        codeField: "CENTER_CD",
        nameField: "CENTER_NM",
        onComplete: function() {
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
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
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC05020E0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LDC05020E0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
        case "RDELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onRDeliveryPopup);
            return;
        case "AREA_CD":
            $NP.onDeliveryAreaChange(val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: val
            }, onQDeliveryAreaPopup);
            return;
        case "DEPT_CD":
            $NP.onDeptChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DEPT_CD: val
            }, onDeptPopup);
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
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnInputChange(e, view, val) {

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LDC05020E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LDC05020E0.004", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }

    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LDC05020E0.005", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LDC05020E0.006", "출고일자 범위 입력오류입니다."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }
    var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);
    var DEPT_CD = $NC.getValue("#edtQDept_Cd", true);
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 데이터 조회
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_OUTBOUND_DATE1: OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: OUTBOUND_DATE2,
        P_RDELIVERY_CD: RDELIVERY_CD,
        P_AREA_CD: AREA_CD,
        P_DEPT_CD: DEPT_CD,
        P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
    };
    $NC.serviceCall("/LDC05020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LDC05020E0.007", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var rowData;
    var dsMaster = [ ];
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_CAR_CD: rowData.CAR_CD,
            P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
            P_BU_CD: rowData.BU_CD,
            P_CUST_CD: rowData.CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_RDELIVERY_CD: rowData.RDELIVERY_CD,
            P_ADJUST_SETTLE_AMT: rowData.ADJUST_SETTLE_AMT,
            P_ADJUST_COMMENT: rowData.ADJUST_COMMENT,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LDC05020E0.008", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LDC05020E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "CAR_CD",
            "DELIVERY_BATCH",
            "RDELIVERY_CD"
        ],
        isCancel: true
    });

    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
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
function grdMasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운송자성명"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_BATCH_F",
        field: "DELIVERY_BATCH_F",
        name: "운송차수"
    });
    $NC.setGridColumn(columns, {
        id: "DEPT_NM",
        field: "DEPT_NM",
        name: "부서명"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_PLT",
        field: "TRANS_PLT",
        name: "운송PLT",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BOX",
        field: "TRANS_BOX",
        name: "운송BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_WEIGHT",
        field: "TRANS_WEIGHT",
        name: "운송중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_CBM",
        field: "TRANS_CBM",
        name: "운송적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_BSUPPLY_AMT",
        field: "TRANS_BSUPPLY_AMT",
        name: "운송기준단가금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_QTY",
        field: "DISTANCE_QTY",
        name: "운행거리",
        cssClass: "styRight",
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_WEIGHT")
    });
    $NC.setGridColumn(columns, {
        id: "SETTLE1_AMT",
        field: "SETTLE1_AMT",
        name: "정산1금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SETTLE2_AMT",
        field: "SETTLE2_AMT",
        name: "정산2금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SETTLE3_AMT",
        field: "SETTLE3_AMT",
        name: "정산3금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SETTLE_AMT",
        field: "SETTLE_AMT",
        name: "정산금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_SETTLE_AMT",
        field: "ADJUST_SETTLE_AMT",
        name: "조정금액",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "ADJUST_COMMENT",
        field: "ADJUST_COMMENT",
        name: "조정사유",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LDC05020E0.RS_MASTER",
        sortCol: "OUTBOUND_DATE",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

/**
 * @param e
 * @param args
 *        cell, column, grid, item, row
 * @returns {Boolean}
 */
function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;

    switch (args.column.id) {
        case "ADJUST_COMMENT":
            return rowData.ADJUST_SETTLE_AMT != rowData.SETTLE_AMT;
    }
    return true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "ADJUST_SETTLE_AMT":
            if (Number(rowData.ADJUST_SETTLE_AMT) < 0) {
                alert($NC.getDisplayMsg("JS.LDC05020E0.009", "조정금액은 0보다 작을 수 없습니다."));
                rowData.ADJUST_SETTLE_AMT = args.oldItem.ADJUST_SETTLE_AMT;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                break;
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ADJUST_SETTLE_AMT)) {
            alert($NC.getDisplayMsg("JS.LDC05020E0.010", "조정금액을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "ADJUST_SETTLE_AMT", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
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
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "OUTBOUND_DATE",
        "CAR_CD",
        "DELIVERY_BATCH",
        "RDELIVERY_CD"
    ], true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "CAR_CD",
            "DELIVERY_BATCH",
            "RDELIVERY_CD"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

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

function showRDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onRDeliveryPopup, function() {
        $NC.setFocus("#edtQRDelivery_Cd", true);
    });
}

function onRDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQRDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQRDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQRDelivery_Cd");
        $NC.setValue("#edtQRDelivery_Nm");
        $NC.setFocus("#edtQRDelivery_Cd", true);
    }
    onChangingCondition();
}

/**
 * 운송권역(검색항목) 검색 팝업 표시
 */
function showQDeliveryAreaPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showDeliveryAreaPopup({
        queryParams: {
            P_CENTER_CD: CENTER_CD,
            P_AREA_CD: $ND.C_ALL
        }
    }, onQDeliveryAreaPopup, function() {
        $NC.setFocus("#edtQArea_Cd");
    });
}

function onQDeliveryAreaPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQArea_Cd", resultInfo.AREA_CD);
        $NC.setValue("#edtQArea_Nm", resultInfo.AREA_NM);
    } else {
        $NC.setValue("#edtQArea_Cd");
        $NC.setValue("#edtQArea_Nm");
        $NC.setFocus("#edtQArea_Cd", true);
    }
    // 화면 클리어
    onChangingCondition();
}

/**
 * 부서 검색 이미지 클릭
 * 
 * @param resultInfo
 */

function showDeptPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

    $NP.showDeptPopup({
        P_CUST_CD: CUST_CD,
        P_DEPT_CD: $ND.C_ALL
    }, onDeptPopup, function() {
        $NC.setFocus("#edtQDept_Cd", true);
    });
}

/**
 * 부서 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onDeptPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQDept_Cd", resultInfo.DEPT_CD);
        $NC.setValue("#edtQDept_Nm", resultInfo.DEPT_NM);
    } else {
        $NC.setValue("#edtQDept_Cd");
        $NC.setValue("#edtQDept_Nm");
        $NC.setFocus("#edtQDept_Cd", true);
    }

    onChangingCondition();
}
