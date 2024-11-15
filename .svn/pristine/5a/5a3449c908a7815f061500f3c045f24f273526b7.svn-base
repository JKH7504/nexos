/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC03020E0
 *  프로그램명         : 브랜드관리
 *  프로그램설명       : 브랜드관리 화면 Javascript
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
    // $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    // $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);
    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);
    $NC.setValue("#chkQDeal_Div2", $ND.C_YES);

    $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
    $NC.setInitDatePicker("#dtpClose_Date", null, "N");

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 이벤트 연결
    $("#btnQCust_Cd").click(showQCustPopup);
    $("#btnCust_Cd").click(showCustPopup);
    $("#btnManager_Id").click(showManagerPopup);
    $("#btnSalesman_Id").click(showSalesmanPopup);
    $("#btnZip_Cd").click(showPostPopup);
    $("#btnZip_Cd_Clear").click(btnZipCdClearOnClick);

    // 그리드 초기화
    grdMasterInitialize();

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

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CUST_CD":
            $NP.onUserCustChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQCustPopup);
            return;
    }

    onChangingCondition();
}

function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);

    $NC.setEnableGroup("#divMasterInfoView", false);
    setInputValue("#grdMaster");

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
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

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");
    var USER_ID = $NC.G_USERINFO.USER_ID;

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CUST_CD: CUST_CD,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3,
        P_USER_ID: USER_ID
    };
    // 데이터 조회
    $NC.serviceCall("/CMC03020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var CUST_NM = $NC.getValue("#edtQCust_Nm");

    if ($NC.isNull(CUST_CD) || CUST_CD == $ND.C_ALL) {
        CUST_CD = "";
        CUST_NM = "";
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        BRAND_CD: null,
        BRAND_NM: null,
        BRAND_FULL_NM: null,
        BRAND_DIV: 1,
        CUST_CD: CUST_CD,
        CUST_NM: CUST_NM,
        MANAGER_ID: null,
        SALESMAN_ID: null,
        DEAL_DIV: "1",
        OPEN_DATE: null,
        CLOSE_DATE: null,
        ZIP_CD: null,
        ADDR_BASIC: null,
        ADDR_DETAIL: null,
        CHARGE_NM: null,
        TEL_NO: null,
        REMARK1: null,
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

function grdMasterOnNewRecord(args) {

    $NC.setFocus("#edtBrand_Cd");
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC03020E0.001", "저장할 데이터가 없습니다."));
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
            P_BRAND_CD: rowData.BRAND_CD,
            P_BRAND_NM: rowData.BRAND_NM,
            P_BRAND_FULL_NM: rowData.BRAND_FULL_NM,
            P_BRAND_DIV: rowData.BRAND_DIV,
            P_CUST_CD: rowData.CUST_CD,
            P_MANAGER_ID: rowData.MANAGER_ID,
            P_SALESMAN_ID: rowData.SALESMAN_ID,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_ZIP_CD: rowData.ZIP_CD,
            P_ADDR_BASIC: rowData.ADDR_BASIC,
            P_ADDR_DETAIL: rowData.ADDR_DETAIL,
            P_CHARGE_NM: rowData.CHARGE_NM,
            P_TEL_NO: rowData.TEL_NO,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC03020E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC03020E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03020E0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC03020E0.004", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
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
        selectKey: "BRAND_CD",
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

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "BRAND_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.BRAND_CD)) {
            alert($NC.getDisplayMsg("JS.CMC03020E0.005", "브랜드코드를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtBrand_Cd");
            return false;
        }
        if ($NC.isNull(rowData.BRAND_NM)) {
            alert($NC.getDisplayMsg("JS.CMC03020E0.006", "브랜드명을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtBrand_Nm");
            return false;
        }
        if ($NC.isNull(rowData.CUST_CD)) {
            alert($NC.getDisplayMsg("JS.CMC03020E0.007", "고객사를 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtCust_Cd");
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC03020E0.008", "거래구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#rgbDeal_Div");
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC03020E0.009", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#dtpClose_Date");
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "브랜드코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_FULL_NM",
        field: "BRAND_FULL_NM",
        name: "브랜드정식명칭"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
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
        id: "CHARGE_NM",
        field: "CHARGE_NM",
        name: "담당자명"
    });
    $NC.setGridColumn(columns, {
        id: "TEL_NO",
        field: "TEL_NO",
        name: "대표전화번호"
    });
    $NC.setGridColumn(columns, {
        id: "MANAGER_ID",
        field: "MANAGER_ID",
        name: "관리책임자ID"
    });
    $NC.setGridColumn(columns, {
        id: "MANAGER_NM",
        field: "MANAGER_NM",
        name: "관리책임자명"
    });
    $NC.setGridColumn(columns, {
        id: "SALESMAN_ID",
        field: "SALESMAN_ID",
        name: "영업담당자ID"
    });
    $NC.setGridColumn(columns, {
        id: "SALESMAN_NM",
        field: "SALESMAN_NM",
        name: "영업담당자명"
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
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
        queryId: "CMC03020E0.RS_MASTER",
        sortCol: "BRAND_CD",
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
        case "BRAND_CD":
            rowData.BRAND_CD = args.val;
            break;
        case "BRAND_NM":
            rowData.BRAND_NM = args.val;
            if ($NC.isNull(rowData.BRAND_FULL_NM)) {
                rowData.BRAND_FULL_NM = rowData.BRAND_NM;
                $NC.setValue("#edtBrand_Full_Nm", rowData.BRAND_FULL_NM);
            }
            break;
        case "BRAND_FULL_NM":
            rowData.BRAND_FULL_NM = args.val;
            break;
        case "CUST_CD":
            $NP.onCustChange(args.val, {
                P_CUST_CD: args.val,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, onCustPopup);
            return;
        case "MANAGER_ID":
            $NP.onUserChange(args.val, {
                P_USER_ID: args.val,
                P_CERTIFY_DIV: $ND.C_ALL
            }, onManagerPopup);
            return;
        case "SALESMAN_ID":
            $NP.onUserChange(args.val, {
                P_USER_ID: args.val,
                P_CERTIFY_DIV: $ND.C_ALL
            }, onSalesmanPopup);
            return;
        case "DEAL_DIV":
            rowData.DEAL_DIV = args.val;
            break;
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            rowData.DEAL_DIV_F = $NC.getDisplayCombo(args.val, $NC.getValueText(args.view));
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC03020E0.010", "거래일자를 정확히 입력하십시오."), "N");
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC03020E0.011", "종료일자를 정확히 입력하십시오."), "N");
            }
            rowData.CLOSE_DATE = $NC.getValue(args.view);
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
        case "CHARGE_NM":
            rowData.CHARGE_NM = args.val;
            break;
        case "TEL_NO":
            rowData.TEL_NO = args.val;
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
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "BRAND_CD", true)) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnable("#edtBrand_Cd", false);
        // 수정 시, 고객사 disable 처리
        $NC.setEnable("#edtCust_Cd", false);
        $NC.setEnable("#btnCust_Cd", false);
    } else {
        $NC.setEnableGroup("#divMasterInfoView", false);
        setInputValue("#grdMaster");
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "BRAND_CD"
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

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }
        // Row 데이터로 에디터 세팅
        // 선택된 로우 데이터로 에디터 세팅
        $NC.setValue("#edtBrand_Cd", rowData.BRAND_CD);
        $NC.setValue("#edtBrand_Nm", rowData.BRAND_NM);
        $NC.setValue("#edtBrand_Full_Nm", rowData.BRAND_FULL_NM);
        $NC.setValue("#cboBrand_Div", rowData.BRAND_DIV);
        $NC.setValue("#edtCust_Cd", rowData.CUST_CD);
        $NC.setValue("#edtCust_Nm", rowData.CUST_NM);
        $NC.setValue("#edtManager_Id", rowData.MANAGER_ID);
        $NC.setValue("#edtManager_Nm", rowData.MANAGER_NM);
        $NC.setValue("#edtSalesman_Id", rowData.SALESMAN_ID);
        $NC.setValue("#edtSalesman_Nm", rowData.SALESMAN_NM);
        $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV == "1");
        $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV == "2");
        $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV == "3");
        $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
        $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
        $NC.setValue("#edtZip_Cd", rowData.ZIP_CD);
        $NC.setValue("#edtAddr_Basic", rowData.ADDR_BASIC);
        $NC.setValue("#edtAddr_Detail", rowData.ADDR_DETAIL);
        $NC.setValue("#edtCharge_Nm", rowData.CHARGE_NM);
        $NC.setValue("#edtTel_No", rowData.TEL_NO);
        $NC.setValue("#edtRemark1", rowData.REMARK1);
        // 신규 데이터면 브랜드코드, 고객사 수정할 수 있게 함
        if (rowData["CRUD"] == $ND.C_DV_CRUD_C || rowData["CRUD"] == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtBrand_Cd");
            $NC.setEnable("#edtCust_Cd");
            $NC.setEnable("#btnCust_Cd");
        } else {
            $NC.setEnable("#edtBrand_Cd", false);
            $NC.setEnable("#edtCust_Cd", false);
            $NC.setEnable("#btnCust_Cd", false);
        }
    }

}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */

function showQCustPopup() {

    $NP.showUserCustPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onQCustPopup, function() {
        $NC.setFocus("#edtQCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onQCustPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtQCust_Nm", resultInfo.CUST_NM);
    } else {
        $NC.setValue("#edtQCust_Cd");
        $NC.setValue("#edtQCust_Nm");
        $NC.setFocus("#edtQCust_Cd", true);
    }
    onChangingCondition();
}

/**
 * 고객사 검색 이미지 클릭
 */

function showCustPopup() {

    $NP.showCustPopup({
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onCustPopup, function() {
        $NC.setFocus("#edtCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onCustPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtCust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtCust_Nm", resultInfo.CUST_NM);

        rowData.CUST_CD = resultInfo.CUST_CD;
        rowData.CUST_NM = resultInfo.CUST_NM;
    } else {
        $NC.setValue("#edtCust_Cd");
        $NC.setValue("#edtCust_Nm");
        $NC.setFocus("#edtCust_Cd", true);

        rowData.CUST_CD = "";
        rowData.CUST_NM = "";
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
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
 * 영업담당자 검색 이미지 클릭
 */
function showSalesmanPopup() {

    $NP.showUserPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CERTIFY_DIV: $ND.C_ALL
    }, onSalesmanPopup, function() {
        $NC.setFocus("#edtSalesman_Id", true);
    });
}

/**
 * 영업담당자 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onSalesmanPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtSalesman_Id", resultInfo.USER_ID);
        $NC.setValue("#edtSalesman_Nm", resultInfo.USER_NM);

        rowData.SALESMAN_ID = resultInfo.USER_ID;
        rowData.SALESMAN_NM = resultInfo.USER_NM;
    } else {
        $NC.setValue("#edtSalesman_Id");
        $NC.setValue("#edtSalesman_Nm");
        $NC.setFocus("#edtSalesman_Id", true);

        rowData.SALESMAN_ID = "";
        rowData.SALESMAN_NM = "";
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
