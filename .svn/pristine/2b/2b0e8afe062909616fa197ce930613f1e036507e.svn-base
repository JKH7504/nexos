/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC05020Q0
 *  프로그램명         : 품질검사실시대장
 *  프로그램설명       : 품질검사실시대장 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-06-28
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-06-28    ASETEC           신규작성
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

    $NC.setInitDatePicker("#dtpQInout_Date");

    $("#btnQBu_Cd").click(showUserBuPopup);

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

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
            $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
        }
    });

    // 조회조건 - 입출고구분 세팅
    $NC.setInitComboData({
        selector: "#cboQInout_Grp",
        data: [
            {
                COMMON_CD: $ND.C_INOUT_GRP_E1,
                COMMON_NM: $NC.getDisplayMsg("JS.LSC05020Q0.006", "입고")
            },
            {
                COMMON_CD: $ND.C_INOUT_GRP_E3,
                COMMON_NM: $NC.getDisplayMsg("JS.LSC05020Q0.007", "반입")
            },
            {
                COMMON_CD: $ND.C_INOUT_GRP_E4,
                COMMON_NM: $NC.getDisplayMsg("JS.LSC05020Q0.008", "불량")
            },
            {
                COMMON_CD: $ND.C_INOUT_GRP_D1,
                COMMON_NM: $NC.getDisplayMsg("JS.LSC05020Q0.009", "출고")
            }
        ],
        codeField: "COMMON_CD",
        nameField: "COMMON_NM"
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo({
        P_BU_CD: $NC.G_USERINFO.BU_CD
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
        case "INOUT_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC05020Q0.001", "입출고일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LSC05020Q0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC05020Q0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var INOUT_DATE = $NC.getValue("#dtpQInout_Date");
    if ($NC.isNull(INOUT_DATE)) {
        alert($NC.getDisplayMsg("JS.LSC05020Q0.004", "입출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQInout_Date");
        return;
    }

    var INOUT_GRP = $NC.getValue("#cboQInout_Grp");
    var DRUG_CAUTION_YN = $NC.getValue("#chkQDrug_Caution_Yn");
    if ($NC.isNull(DRUG_CAUTION_YN)) {
        DRUG_CAUTION_YN = $ND.C_NO;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INOUT_GRP: INOUT_GRP,
        P_INOUT_DATE: INOUT_DATE,
        P_DRUG_CAUTION_YN: DRUG_CAUTION_YN
    };
    // 데이터 조회
    $NC.serviceCall("/LSC05020Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        alert($NC.getDisplayMsg("JS.LSC05020Q0.005", "출력할 데이터가 없습니다. 조회 후 출력하십시오."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var INOUT_DATE = $NC.getValue("#dtpQInout_Date");
    var INOUT_GRP = $NC.getValue("#cboQInout_Grp");
    var DRUG_CAUTION_YN = $NC.getValue("#chkQDrug_Caution_Yn");
    if ($NC.isNull(DRUG_CAUTION_YN)) {
        DRUG_CAUTION_YN = $ND.C_NO;
    }

    var reportDiv = "01";
    if (INOUT_GRP == $ND.C_INOUT_GRP_E4) {
        reportDiv = "02";
    } else if (INOUT_GRP == $ND.C_INOUT_GRP_E3) {
        reportDiv = "03";
    }
    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // PAPER_LSC02 - 품질관리대장
        case "PAPER_LSC02":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_INOUT_GRP: INOUT_GRP,
                P_INOUT_DATE: INOUT_DATE,
                P_DRUG_CAUTION_YN: DRUG_CAUTION_YN
            };
            break;
        // 미정의된 레포트
        default:
            alert($NC.getDisplayMsg("JS.COMMON.036", "[" + reportInfo.REPORT_NM + "]구현되지 않은 레포트 정보입니다. 출력할 수 없습니다.", reportInfo.REPORT_NM));
            return;
    }

    // if ($NC.isNotEmpty(checkedData)) {
    // // 선택 건수 체크
    // if (checkedData.checkedCount == 0) {
    // alert($NC.getDisplayMsg("JS.COMMON.037", "[" + reportInfo.REPORT_NM + "]출력할 데이터를 선택하십시오.", reportInfo.REPORT_NM));
    // return;
    // }
    // // 선택 건수 중 출력 대상 건수
    // if (checkedData.values.length == 0) {
    // alert($NC.getDisplayMsg("JS.COMMON.038", "[" + reportInfo.REPORT_NM + "]출력 가능한 데이터를 선택하십시오.", reportInfo.REPORT_NM));
    // return;
    // }
    // }

    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: reportInfo.REPORT_DOC_URL + reportDiv,
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
        id: "INOUT_GRP_NM",
        field: "INOUT_GRP_NM",
        name: "입출고구분"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "MAKER_CD",
        field: "MAKER_CD",
        name: "제약사"
    });
    $NC.setGridColumn(columns, {
        id: "MAKER_NM",
        field: "MAKER_NM",
        name: "제약사명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
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
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DETAIL",
        field: "KEEP_DETAIL",
        name: "보관상세"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_DIV_D",
        field: "RETURN_DIV_D",
        name: "반품사유"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LSC05020Q0.RS_MASTER",
        sortCol: "DELIVERY_CD",
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

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
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
    $NC.G_VAR.buttons._print = "1";

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
}