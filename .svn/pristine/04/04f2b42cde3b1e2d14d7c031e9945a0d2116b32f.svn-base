/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LIC04010E0
 *  프로그램명         : 미입고사유관리
 *  프로그램설명       : 미입고사유관리 화면 Javascript
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
        autoResizeView: function() {
            var resizeView = {
                container: "#divMasterView"
            };
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = "#grdT1Master";
            } else {
                resizeView.grids = "#grdT2Master";
            }
            return resizeView;
        },
        policyVal: {
            LI450: "" // 미입고관리대상 정책
        }
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    $("#btnQBu_Cd").click(showUserBuPopup);

    $NC.setInitDateRangePicker("#dtpQInbound_Date1", "#dtpQInbound_Date2", null, -2);

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
            setPolicyValInfo();
        }
    });

    // 조회조건 - 입고구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: [
                $ND.C_INOUT_GRP_E1,
                $ND.C_INOUT_GRP_E2
            ].join($ND.C_SEP_DATA),
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });
    // 검색구분에 미입고를 선택
    $NC.setValue("#rgbQView_Div1", "1");
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
        case "CENTER_CD":
            onChangingCondition();
            setPolicyValInfo();
            return;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "INBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LIC04010E0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LIC04010E0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
        case "VIEW_DIV0":
        case "VIEW_DIV1":
            break;
    }
    onChangingCondition();
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    // 상품별 입고내역 화면
    $NC.clearGridData(G_GRDT1MASTER);

    // 미입고사유등록 탭의 검색구분 변경 되어도 기간별 미입고 내역 탭의 그리드는 클리어 하지 않는다.
    // 공급처별 입고내역 화면
    $NC.clearGridData(G_GRDT2MASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LIC04010E0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LIC04010E0.004", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
    if ($NC.isNull(INBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LIC04010E0.005", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }
    var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
    if ($NC.isNull(INBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LIC04010E0.006", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date2");
        return;
    }
    if (INBOUND_DATE1 > INBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LIC04010E0.007", "입고일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    if ($NC.isNull(INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LIC04010E0.008", "입고구분을 선택하십시오."));
        $NC.setFocus("#cboQInout_Cd");
        return;
    }
    var VIEW_DIV = $NC.getValueRadioGroup("rgbQView_Div");
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
    var VENDOR_NM = $NC.getValue("#edtQVendor_Nm", true);

    // 상품별 입고내역 화면
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INBOUND_DATE1: INBOUND_DATE1,
            P_INBOUND_DATE2: INBOUND_DATE2,
            P_VIEW_DIV: VIEW_DIV,
            P_INOUT_CD: INOUT_CD,
            P_VENDOR_CD: VENDOR_CD,
            P_VENDOR_NM: VENDOR_NM,
            P_POLICY_LI450: $NC.G_VAR.policyVal.LI450,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        };
        // 데이터 조회
        $NC.serviceCall("/LIC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    } else {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INBOUND_DATE1: INBOUND_DATE1,
            P_INBOUND_DATE2: INBOUND_DATE2,
            P_VIEW_DIV: VIEW_DIV,
            P_INOUT_CD: INOUT_CD,
            P_VENDOR_CD: VENDOR_CD,
            P_VENDOR_NM: VENDOR_NM,
            P_POLICY_LI450: $NC.G_VAR.policyVal.LI450,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        };
        // 데이터 조회
        $NC.serviceCall("/LIC04010E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);

    }
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

    if (G_GRDT1MASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LIC04010E0.009", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        return;
    }

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDT1MASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT1MASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_UNPAID_DIV: rowData.UNPAID_DIV,
            P_UNPAID_COMMENT: rowData.UNPAID_COMMENT,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LIC04010E0.010", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LIC04010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
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

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "INBOUND_DATE",
            "VENDOR_CD",
            "INBOUND_NO",
            "LINE_NO"
        ]
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
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
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
        selectKey: [
            "INBOUND_DATE",
            "VENDOR_CD",
            "INBOUND_NO",
            "LINE_NO"
        ]
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
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

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        $("#divViewDiv").show();
        if (G_GRDT1MASTER.data.getLength() > 0) {
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "1";
        }
    } else {
        $("#divViewDiv").hide();
    }
    $NC.setInitTopButtons($NC.G_VAR.buttons);
    $NC.onGlobalResize();
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "입고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "입고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "UNPAID_QTY",
        field: "UNPAID_QTY",
        name: "미입고수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "UNPAID_DIV_F",
        field: "UNPAID_DIV_F",
        name: "미입고사유",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "UNPAID_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "UNPAID_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "UNPAID_COMMENT",
        field: "UNPAID_COMMENT",
        name: "미입고사유내역",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "LABELLING_DIV_D",
        field: "LABELLING_DIV_D",
        name: "라벨링구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입고구분"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 7
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LIC04010E0.RS_T1_MASTER",
        sortCol: "INBOUND_DATE",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onBeforeEditCell.subscribe(grdT1MasterOnBeforeEditCell);
    G_GRDT1MASTER.view.onCellChange.subscribe(grdT1MasterOnCellChange);
}

/**
 * 상품별입고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1MasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "UNPAID_DIV_F":
        case "UNPAID_COMMENT":
            // 1. 미입고만 대상, 2.미입고/초과입고 둘다 대상
            if ($NC.G_VAR.policyVal.LI450 == $ND.C_POLICY_VAL_1) {
                return rowData.UNPAID_QTY > "0";
            } else {
                return rowData.UNPAID_QTY != "0";
            }
    }
    return true;
}

/**
 * 그리드의 입력항목 값 변경
 */
function grdT1MasterOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);
}

/**
 * 미입고사유등록 그리드의 입력값 체크
 */
function grdT1MasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1MASTER, row)) {
        return true;
    }

    var rowData = G_GRDT1MASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.UNPAID_DIV)) {
            alert($NC.getDisplayMsg("JS.LIC04010E0.011", "미입고사유를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "UNPAID_DIV_F", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1MASTER, rowData);
    return true;
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "입고일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "입고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_QTY",
        field: "ORDER_QTY",
        name: "예정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "UNPAID_QTY",
        field: "UNPAID_QTY",
        name: "미입고수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "UNPAID_DIV_F",
        field: "UNPAID_DIV_F",
        name: "미입고사유"
    });
    $NC.setGridColumn(columns, {
        id: "UNPAID_COMMENT",
        field: "UNPAID_COMMENT",
        name: "미입고사유내역"
    });
    $NC.setGridColumn(columns, {
        id: "LABELLING_DIV_D",
        field: "LABELLING_DIV_D",
        name: "라벨링구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "입고구분"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 공급처별 입고내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 7,
        summaryRow: {
            visible: true
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LIC04010E0.RS_T2_MASTER",
        sortCol: "INBOUND_DATE",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 공급처별입고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

/**
 * 상품별입고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER, [
        "INBOUND_DATE",
        "VENDOR_CD",
        "INBOUND_NO",
        "LINE_NO"
    ]);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 공급처별입고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
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
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setFocus("#edtQBu_Cd", true);
    }
    onChangingCondition();
    setPolicyValInfo();
}

function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    });
}
