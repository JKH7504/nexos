﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC02030E0
 *  프로그램명         : 관련사관리
 *  프로그램설명       : 관련사관리 화면 Javascript
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: {
                container: "#divRightView",
                sizeFn: function(viewWidth, viewHeight) {

                    var scrollOffset = viewHeight < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
                    // Container 사이즈 조정
                    return $NC.G_OFFSET.rightViewWidth + scrollOffset;
                }
            }
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);
    $NC.setValue("#chkQDeal_Div2", $ND.C_YES);

    $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
    $NC.setInitDatePicker("#dtpClose_Date", null, "N");

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 이벤트 연결
    $("#btnZip_Cd").click(showPostPopup);
    $("#btnZip_Cd_Clear").click(btnZipCdClearOnClick);
    $("#btnManager_Id").click(showManagerPopup);

    // 그리드 초기화
    grdMasterInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_REF_CUST_DIV_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "REF_CUST_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_REF_CUST_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "REF_CUST_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 - 관련사구분 세팅
        $NC.setInitComboData({
            selector: "#cboQRef_Cust_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_REF_CUST_DIV_2),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQRef_Cust_Div", 0);
            }
        });
        // 관련사구분 세팅
        $NC.setInitComboData({
            selector: "#cboRef_Cust_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_REF_CUST_DIV_1),
            onComplete: function() {
                $NC.setValue("#cboRef_Cust_Div");
            }
        });
    });
}

function _SetResizeOffset() {

    $NC.G_OFFSET.rightViewWidth = 450;
    $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

function onChangingCondition() {
    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    setInputValue("#grdMaster");
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    grdMasterOnCellChange(e, {
        view: view,
        col: id,
        val: val
    });
}
/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var REF_CUST_DIV = $NC.getValue("#cboQRef_Cust_Div");
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_REF_CUST_DIV: REF_CUST_DIV,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3
    };
    // 데이터 조회
    $NC.serviceCall("/CMC02030E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var REF_CUST_DIV = $NC.getValue("#cboQRef_Cust_Div");
    if ($NC.isNull(REF_CUST_DIV) || REF_CUST_DIV == $ND.C_ALL) {
        REF_CUST_DIV = "";
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        REF_CUST_CD: null,
        REF_CUST_NM: null,
        REF_CUST_FULL_NM: null,
        REF_CUST_DIV: REF_CUST_DIV,
        BUSINESS_NO: null,
        CEO_NM: null,
        BUSINESS_KIND: null,
        BUSINESS_TYPE: null,
        IDENTITY_NO: null,
        ZIP_CD: null,
        ADDR_BASIC: null,
        ADDR_DETAIL: null,
        TEL_NO: null,
        FAX_NO: null,
        CHARGE_NM: null,
        CHARGE_DUTY: null,
        CHARGE_TEL: null,
        CHARGE_HP: null,
        CHARGE_EMAIL: null,
        MANAGER_ID: null,
        DEAL_DIV: "1",
        OPEN_DATE: null,
        CLOSE_DATE: null,
        REMARK1: null,
        REG_USER_ID: null,
        REG_DATETIME: null,
        MANAGER_NM: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 이전 데이터가 한건도 없었으면 에디터 Enable
    if (G_GRDMASTER.data.getLength() == 0) {
        $NC.setEnableGroup("#divMasterInfoView", true);
    }

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC02030E0.001", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_REF_CUST_CD: rowData.REF_CUST_CD,
            P_REF_CUST_NM: rowData.REF_CUST_NM,
            P_REF_CUST_FULL_NM: rowData.REF_CUST_FULL_NM,
            P_REF_CUST_DIV: rowData.REF_CUST_DIV,
            P_BUSINESS_NO: rowData.BUSINESS_NO,
            P_CEO_NM: rowData.CEO_NM,
            P_BUSINESS_KIND: rowData.BUSINESS_KIND,
            P_BUSINESS_TYPE: rowData.BUSINESS_TYPE,
            P_IDENTITY_NO: rowData.IDENTITY_NO,
            P_ZIP_CD: rowData.ZIP_CD,
            P_ADDR_BASIC: rowData.ADDR_BASIC,
            P_ADDR_DETAIL: rowData.ADDR_DETAIL,
            P_TEL_NO: rowData.TEL_NO,
            P_FAX_NO: rowData.FAX_NO,
            P_CHARGE_NM: rowData.CHARGE_NM,
            P_CHARGE_DUTY: rowData.CHARGE_DUTY,
            P_CHARGE_TEL: rowData.CHARGE_TEL,
            P_CHARGE_HP: rowData.CHARGE_HP,
            P_CHARGE_EMAIL: rowData.CHARGE_EMAIL,
            P_MANAGER_ID: rowData.MANAGER_ID,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC02030E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC02030E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC02030E0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC02030E0.004", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 그냥 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
            $NC.setEnableGroup("#divMasterInfoView", false);
            setInputValue("#grdMaster");
        }
    } else {
        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        _Save();
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "REF_CUST_CD",
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

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }
        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtRef_Cust_Cd", rowData["REF_CUST_CD"]);
        $NC.setValue("#edtRef_Cust_Nm", rowData["REF_CUST_NM"]);
        $NC.setValue("#edtRef_Cust_Full_Nm", rowData["REF_CUST_FULL_NM"]);
        $NC.setValue("#cboRef_Cust_Div", rowData["REF_CUST_DIV"]);
        $NC.setValue("#edtBusiness_No", rowData["BUSINESS_NO"]);
        $NC.setValue("#edtCeo_Nm", rowData["CEO_NM"]);
        $NC.setValue("#edtBusiness_Kind", rowData["BUSINESS_KIND"]);
        $NC.setValue("#edtBusiness_Type", rowData["BUSINESS_TYPE"]);
        $NC.setValue("#edtIdentity_No", rowData["IDENTITY_NO"]);
        $NC.setValue("#edtZip_Cd", rowData["ZIP_CD"]);
        $NC.setValue("#edtAddr_Basic", rowData["ADDR_BASIC"]);
        $NC.setValue("#edtAddr_Detail", rowData["ADDR_DETAIL"]);
        $NC.setValue("#edtTel_No", rowData["TEL_NO"]);
        $NC.setValue("#edtFax_No", rowData["FAX_NO"]);
        $NC.setValue("#edtCharge_Nm", rowData["CHARGE_NM"]);
        $NC.setValue("#edtCharge_Duty", rowData["CHARGE_DUTY"]);
        $NC.setValue("#edtCharge_Tel", rowData["CHARGE_TEL"]);
        $NC.setValue("#edtCharge_Hp", rowData["CHARGE_HP"]);
        $NC.setValue("#edtCharge_Email", rowData["CHARGE_EMAIL"]);
        $NC.setValue("#edtManager_Id", rowData["MANAGER_ID"]);
        $NC.setValue("#edtManager_Nm", rowData["MANAGER_NM"]);
        $NC.setValue("#rgbDeal_Div1", rowData["DEAL_DIV"] == "1");
        $NC.setValue("#rgbDeal_Div2", rowData["DEAL_DIV"] == "2");
        $NC.setValue("#rgbDeal_Div3", rowData["DEAL_DIV"] == "3");
        $NC.setValue("#dtpOpen_Date", rowData["OPEN_DATE"]);
        $NC.setValue("#dtpClose_Date", rowData["CLOSE_DATE"]);
        $NC.setValue("#edtRemark1", rowData["REMARK1"]);
        // 신규 데이터면 관련사코드 수정할 수 있게 함
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtRef_Cust_Cd");
        } else {
            $NC.setEnable("#edtRef_Cust_Cd", false);
        }
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "REF_CUST_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.REF_CUST_CD)) {
            alert($NC.getDisplayMsg("JS.CMC02030E0.005", "관련사코드를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtRef_Cust_Cd");
            return false;
        }
        if ($NC.isNull(rowData.REF_CUST_NM)) {
            alert($NC.getDisplayMsg("JS.CMC02030E0.006", "관련사명을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtRef_Cust_Nm");
            return false;
        }
        if ($NC.isNull(rowData.REF_CUST_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC02030E0.007", "관련사구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboRef_Cust_Div");
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC02030E0.008", "거래구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#rgbDeal_Div");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnNewRecord(args) {

    $NC.setValue("#cboRef_Cust_Div", args.rowData.REF_CUST_DIV);
    $NC.setValue("#rgbDeal_Div", args.rowData.DEAL_DIV);

    $NC.setFocus("#edtRef_Cust_Cd");
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "REF_CUST_CD",
        field: "REF_CUST_CD",
        name: "관련사코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REF_CUST_NM",
        field: "REF_CUST_NM",
        name: "관련사명"
    });
    $NC.setGridColumn(columns, {
        id: "REF_CUST_FULL_NM",
        field: "REF_CUST_FULL_NM",
        name: "관련사정식명칭"
    });
    $NC.setGridColumn(columns, {
        id: "REF_CUST_DIV_F",
        field: "REF_CUST_DIV_F",
        name: "관련사구분"
    });
    $NC.setGridColumn(columns, {
        id: "BUSINESS_NO",
        field: "BUSINESS_NO",
        name: "사업자등록번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CEO_NM",
        field: "CEO_NM",
        name: "대표자명"
    });
    $NC.setGridColumn(columns, {
        id: "BUSINESS_KIND",
        field: "BUSINESS_KIND",
        name: "업태"
    });
    $NC.setGridColumn(columns, {
        id: "BUSINESS_TYPE",
        field: "BUSINESS_TYPE",
        name: "종목"
    });
    $NC.setGridColumn(columns, {
        id: "IDENTITY_NO",
        field: "IDENTITY_NO",
        name: "법인번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("RRN")
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_BASIC",
        field: "ADDR_BASIC",
        name: "기본주소"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_DETAIL",
        field: "ADDR_DETAIL",
        name: "상세주소"
    });
    $NC.setGridColumn(columns, {
        id: "TEL_NO",
        field: "TEL_NO",
        name: "대표전화번호"
    });
    $NC.setGridColumn(columns, {
        id: "FAX_NO",
        field: "FAX_NO",
        name: "팩스번호"
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
        queryId: "CMC02030E0.RS_MASTER",
        sortCol: "REF_CUST_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 에디터 값 세팅
    setInputValue("#grdMaster", G_GRDMASTER.data.getItem(row));

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "REF_CUST_CD":
            rowData.REF_CUST_CD = args.val;
            break;
        case "REF_CUST_NM":
            rowData.REF_CUST_NM = args.val;
            if ($NC.isNull(rowData.REF_CUST_FULL_NM)) {
                rowData.REF_CUST_FULL_NM = rowData.REF_CUST_NM;
                $NC.setValue("#edtRef_Cust_Full_Nm", rowData.REF_CUST_FULL_NM);
            }
            break;
        case "REF_CUST_FULL_NM":
            rowData.REF_CUST_FULL_NM = args.val;
            break;
        case "REF_CUST_DIV":
            rowData.REF_CUST_DIV = args.val;
            rowData.REF_CUST_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "BUSINESS_NO":
            rowData.BUSINESS_NO = args.val;
            break;
        case "CEO_NM":
            rowData.CEO_NM = args.val;
            break;
        case "BUSINESS_KIND":
            rowData.BUSINESS_KIND = args.val;
            break;
        case "BUSINESS_TYPE":
            rowData.BUSINESS_TYPE = args.val;
            break;
        case "IDENTITY_NO":
            rowData.IDENTITY_NO = args.val;
            break;
        case "ZIP_CD":
            rowData.ZIP_CD = args.val;
            break;
        case "ADDR_BASIC":
            rowData.ADDR_BASIC = args.val;
            break;
        case "ADDR_DETAIL":
            rowData.ADDR_DETAIL = args.val;
            break;
        case "TEL_NO":
            rowData.TEL_NO = args.val;
            break;
        case "FAX_NO":
            rowData.FAX_NO = args.val;
            break;
        case "CHARGE_NM":
            rowData.CHARGE_NM = args.val;
            break;
        case "CHARGE_DUTY":
            rowData.CHARGE_DUTY = args.val;
            break;
        case "CHARGE_TEL":
            rowData.CHARGE_TEL = args.val;
            break;
        case "CHARGE_HP":
            rowData.CHARGE_HP = args.val;
            break;
        case "CHARGE_EMAIL":
            rowData.CHARGE_EMAIL = args.val;
            break;
        case "MANAGER_ID":
            $NP.onUserChange(args.val, {
                P_USER_ID: args.val,
                P_CERTIFY_DIV: $ND.C_ALL
            }, onManagerPopup);
            return;
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC02030E0.009", "거래일자를 정확히 입력하십시오."), "N");
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC02030E0.010", "종료일자를 정확히 입력하십시오."), "N");
            }
            rowData.CLOSE_DATE = $NC.getValue(args.view);
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "REF_CUST_CD", true)) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnable("#edtRef_Cust_Cd", false);
    } else {
        $NC.setEnableGroup("#divMasterInfoView", false);
        setInputValue("#grdMaster");
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "REF_CUST_CD"
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

/**
 * 관리책임자 검색 이미지 클릭
 */

function showManagerPopup() {

    $NP.showUserPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CERTIFY_DIV: $ND.C_ALL
    }, onManagerPopup, function() {
        $NC.setFocus("#edtManager_Id", true);
    });
}

/**
 * 관리책임자 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onManagerPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtManager_Id", resultInfo.USER_ID);
        $NC.setValue("#edtManager_Nm", resultInfo.USER_NM);

        rowData.MANAGER_ID = resultInfo.USER_ID;
        rowData.MANAGER_NM = resultInfo.USER_NM;
    } else {
        $NC.setValue("#edtManager_Id");
        $NC.setValue("#edtManager_Nm");
        $NC.setFocus("#edtManager_Id", true);

        rowData.MANAGER_ID = "";
        rowData.MANAGER_NM = "";
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}
/**
 * 검색조건의 우편번호 검색 이미지 클릭
 */
function showPostPopup() {

    $NP.showPostPopup({
        P_ADDR_NM: $ND.C_ALL
    }, onPostPopup, function() {
    });
}

/**
 * 우편번호 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onPostPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtZip_Cd", resultInfo.ZIP_CD);
        $NC.setValue("#edtAddr_Basic", resultInfo.ADDR_NM_REAL);

        rowData.ZIP_CD = resultInfo.ZIP_CD;
        rowData.ADDR_BASIC = resultInfo.ADDR_NM_REAL;
    } else {
        $NC.setValue("#edtZip_Cd");
        $NC.setValue("#edtAddr_Basic");

        rowData.ZIP_CD = "";
        rowData.ADDR_BASIC = "";
    }
    $NC.setFocus("#edtAddr_Detail", true);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function btnZipCdClearOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNull(rowData.ZIP_CD) //
        && $NC.isNull(rowData.ADDR_BASIC) //
        && $NC.isNull(rowData.ADDR_DETAIL)) {
        $NC.setFocus("#edtAddr_Detail");
        return;
    }

    $NC.setValue("#edtZip_Cd");
    $NC.setValue("#edtAddr_Basic");
    $NC.setValue("#edtAddr_Detail");
    $NC.setFocus("#edtAddr_Detail");

    rowData.ZIP_CD = "";
    rowData.ADDR_BASIC = "";
    rowData.ADDR_DETAIL = "";

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}
