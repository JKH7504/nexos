/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC03040E0
 *  프로그램명         : 배송처관리
 *  프로그램설명       : 배송처관리 화면(일반) Javascript
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
        // 체크할 정책 값
        policyVal: {
            CM710: "" // 좌표검색 API 사용
        },
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
    $NC.setInitTab("#divRightView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);

    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);
    $NC.setValue("#chkQDeal_Div2", $ND.C_YES);

    $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
    $NC.setInitDatePicker("#dtpClose_Date", null, "N");
    $NC.setInitTimePicker("#dtpDelivery_Time", null);

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divRightView", false);

    // 이벤트 연결
    $("#btnQCust_Cd").click(showQCustPopup);
    $("#btnRDelivery_Cd").click(showRDeliveryPopup);
    $("#btnZip_Cd").click(showPostPopup);
    $("#btnZip_Cd_Clear").click(btnZipCdClearOnClick);
    $("#btnDept_Cd").click(showDeptPopup);
    $("#btnGetCoord").click(btnGetCoordOnClick);
    $("#btnEntryCoord").click(btnEntryCoordOnClick);

    // 그리드 초기화
    grdMasterInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_DELIVERY_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "DELIVERY_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_DELIVERY_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "DELIVERY_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_STOCK_FIRST_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "STOCK_FIRST_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_DISTRIBUTE_DIV_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "DISTRIBUTE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_DISTRIBUTE_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "DISTRIBUTE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_REGION_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "REGION_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_SALE_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "SALE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_TAG_MANAGE_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "TAG_MANAGE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 - 유통구분 세팅
        $NC.setInitComboData({
            selector: "#cboQDistribute_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_DISTRIBUTE_DIV_2),
            addAll: true
        });
        // 조회조건 - 배송처구분 세팅
        $NC.setInitComboData({
            selector: "#cboQDelivery_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_DELIVERY_DIV_2),
            addAll: true
        });
        // 배송처구분 세팅
        $NC.setInitComboData({
            selector: "#cboDelivery_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_DELIVERY_DIV),
            onComplete: function() {
                $NC.setValue("#cboDelivery_Div");
            }
        });
        // 재고우선순위 세팅
        $NC.setInitComboData({
            selector: "#cboStock_First_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_STOCK_FIRST_DIV),
            onComplete: function() {
                $NC.setValue("#cboStock_First_Div");
            }
        });
        // 유통구분 세팅
        $NC.setInitComboData({
            selector: "#cboDistribute_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_DISTRIBUTE_DIV_1),
            onComplete: function() {
                $NC.setValue("#cboDistribute_Div");
            }
        });
        // 지역구분 세팅
        $NC.setInitComboData({
            selector: "#cboRegion_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_REGION_DIV),
            onComplete: function() {
                $NC.setValue("#cboRegion_Div");
            }
        });
        // 판매방식구분 세팅
        $NC.setInitComboData({
            selector: "#cboSale_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SALE_DIV),
            onComplete: function() {
                $NC.setValue("#cboSale_Div");
            }
        });
        // 택관리구분 세팅
        $NC.setInitComboData({
            selector: "#cboTag_Manage_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_TAG_MANAGE_DIV),
            onComplete: function() {
                $NC.setValue("#cboTag_Manage_Div");
            }
        });
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    // 정책값 설정
    setPolicyValInfo();
}

function _SetResizeOffset() {

    $NC.G_OFFSET.rightViewWidth = 450;
    $NC.G_OFFSET.rightViewMinHeight = $("#divT1TabSheetView").outerHeight(true) + $NC.G_LAYOUT.header;

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
    $NC.setEnableGroup("#divRightView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 조회조건이 변경될 때 호출
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

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 조회조건 체크
    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var CUST_NM = $NC.getValue("#edtQCust_Nm");
    if ($NC.isNull(CUST_NM)) {
        alert($NC.getDisplayMsg("JS.CMC03040E0.001", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");
    var DELIVERY_DIV = $NC.getValue("#cboQDelivery_Div");
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd");
    var DELIVERY_NM = $NC.getValue("#edtQDelivery_Nm");
    var DISTRIBUTE_DIV = $NC.getValue("#cboQDistribute_Div");

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CUST_CD: CUST_CD,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3,
        P_DELIVERY_DIV: DELIVERY_DIV,
        P_DELIVERY_CD: DELIVERY_CD,
        P_DELIVERY_NM: DELIVERY_NM,
        P_DISTRIBUTE_DIV: DISTRIBUTE_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/CMC03040E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CUST_CD: $NC.getValue("#edtQCust_Cd"),
        DELIVERY_CD: null,
        DELIVERY_NM: null,
        DELIVERY_FULL_NM: null,
        DELIVERY_DIV: null,
        DELIVERY_DIV_F: null,
        DISTRIBUTE_DIV: null,
        SALE_DIV: null,
        TAG_MANAGE_DIV: null,
        NEW_DELIVERY_YN: null,
        REGION_DIV: null,
        SALESMAN_CD: null,
        SALESMAN_NM: null,
        BUSINESS_NO: null,
        CEO_NM: null,
        BUSINESS_KIND: null,
        BUSINESS_TYPE: null,
        IDENTITY_NO: null,
        ZIP_CD: null,
        ADDR_BASIC: null,
        ADDR_DETAIL: null,
        GEOCODE_LAT: null,
        GEOCODE_LNG: null,
        TEL_NO: null,
        FAX_NO: null,
        CHARGE_NM: null,
        CHARGE_DUTY: null,
        CHARGE_TEL: null,
        CHARGE_HP: null,
        CHARGE_EMAIL: null,
        TRANS_MANAGER_NM: null,
        TRANS_MANAGER_DUTY: null,
        TRANS_MANAGER_TEL: null,
        TRANS_MANAGER_HP: null,
        TRANS_MANAGER_EMAIL: null,
        RDELIVERY_CD: null,
        RDELIVERY_NM: null,
        STOCK_FIRST_DIV: "5",
        DELIVERY_TIME: null,
        DELIVERY_WEEK: "NNNNNNN",
        DEPT_CD: null,
        MIN_ORDER_AMT: null,
        DEAL_DIV: "1",
        OPEN_DATE: null,
        CLOSE_DATE: null,
        REMARK1: null,
        REG_USER_ID: null,
        REG_DATETIME: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 이전 데이터가 한건도 없었으면 에디터 Enable
    if (G_GRDMASTER.data.getLength() == 0) {
        $NC.setEnableGroup("#divRightView", true);
    }

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC03040E0.002", "저장할 데이터가 없습니다."));
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
            P_CUST_CD: rowData.CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_DELIVERY_NM: rowData.DELIVERY_NM,
            P_DELIVERY_FULL_NM: rowData.DELIVERY_FULL_NM,
            P_DELIVERY_DIV: rowData.DELIVERY_DIV,
            P_DISTRIBUTE_DIV: rowData.DISTRIBUTE_DIV,
            P_SALE_DIV: rowData.SALE_DIV,
            P_TAG_MANAGE_DIV: rowData.TAG_MANAGE_DIV,
            P_NEW_DELIVERY_YN: rowData.NEW_DELIVERY_YN,
            P_REGION_DIV: rowData.REGION_DIV,
            P_SALESMAN_CD: rowData.SALESMAN_CD,
            P_SALESMAN_NM: rowData.SALESMAN_NM,
            P_BUSINESS_NO: rowData.BUSINESS_NO,
            P_CEO_NM: rowData.CEO_NM,
            P_BUSINESS_KIND: rowData.BUSINESS_KIND,
            P_BUSINESS_TYPE: rowData.BUSINESS_TYPE,
            P_IDENTITY_NO: rowData.IDENTITY_NO,
            P_ZIP_CD: rowData.ZIP_CD,
            P_ADDR_BASIC: rowData.ADDR_BASIC,
            P_ADDR_DETAIL: rowData.ADDR_DETAIL,
            P_GEOCODE_LAT: rowData.GEOCODE_LAT,
            P_GEOCODE_LNG: rowData.GEOCODE_LNG,
            P_TEL_NO: rowData.TEL_NO,
            P_FAX_NO: rowData.FAX_NO,
            P_CHARGE_NM: rowData.CHARGE_NM,
            P_CHARGE_DUTY: rowData.CHARGE_DUTY,
            P_CHARGE_TEL: rowData.CHARGE_TEL,
            P_CHARGE_HP: rowData.CHARGE_HP,
            P_CHARGE_EMAIL: rowData.CHARGE_EMAIL,
            P_TRANS_MANAGER_NM: rowData.TRANS_MANAGER_NM,
            P_TRANS_MANAGER_DUTY: rowData.TRANS_MANAGER_DUTY,
            P_TRANS_MANAGER_TEL: rowData.TRANS_MANAGER_TEL,
            P_TRANS_MANAGER_HP: rowData.TRANS_MANAGER_HP,
            P_TRANS_MANAGER_EMAIL: rowData.TRANS_MANAGER_EMAIL,
            P_RDELIVERY_CD: rowData.RDELIVERY_CD,
            P_STOCK_FIRST_DIV: rowData.STOCK_FIRST_DIV,
            // DB 컬럼이 DATE 타입이기 때문에 시간에 기본 날짜 추가해서 저장
            P_DELIVERY_TIME: $NC.isNull(rowData.DELIVERY_TIME) ? "" : "1900-01-01 " + rowData.DELIVERY_TIME,
            P_DELIVERY_WEEK: rowData.DELIVERY_WEEK,
            P_DEPT_CD: rowData.DEPT_CD,
            P_MIN_ORDER_AMT: rowData.MIN_ORDER_AMT,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC03040E0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC03040E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03040E0.004", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC03040E0.005", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
            $NC.setEnableGroup("#divRightView", false);
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
        selectKey: "DELIVERY_CD",
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
        // 선택된 로우 데이터로 에디터 세팅
        $NC.setValue("#edtDelivery_Cd", rowData.DELIVERY_CD);
        $NC.setValue("#edtDelivery_Nm", rowData.DELIVERY_NM);
        $NC.setValue("#edtDelivery_Full_Nm", rowData.DELIVERY_FULL_NM);
        $NC.setValue("#cboDelivery_Div", rowData.DELIVERY_DIV);
        $NC.setValue("#cboDistribute_Div", rowData.DISTRIBUTE_DIV);
        $NC.setValue("#cboSale_Div", rowData.SALE_DIV);
        $NC.setValue("#cboTag_Manage_Div", rowData.TAG_MANAGE_DIV);
        $NC.setValue("#chkNew_Delivery_Yn", rowData.NEW_DELIVERY_YN);
        $NC.setValue("#cboRegion_Div", rowData.REGION_DIV);
        $NC.setValue("#edtDept_Cd", rowData.DEPT_CD);
        $NC.setValue("#edtDept_Nm", rowData.DEPT_NM);
        $NC.setValue("#edtSalesman_Cd", rowData.SALESMAN_CD);
        $NC.setValue("#edtSalesman_Nm", rowData.SALESMAN_NM);
        $NC.setValue("#edtBusiness_No", rowData.BUSINESS_NO);
        $NC.setValue("#edtCeo_Nm", rowData.CEO_NM);
        $NC.setValue("#edtBusiness_Kind", rowData.BUSINESS_KIND);
        $NC.setValue("#edtBusiness_Type", rowData.BUSINESS_TYPE);
        $NC.setValue("#edtIdentity_No", rowData.IDENTITY_NO);
        $NC.setValue("#edtZip_Cd", rowData.ZIP_CD);
        $NC.setValue("#edtAddr_Basic", rowData.ADDR_BASIC);
        $NC.setValue("#edtAddr_Detail", rowData.ADDR_DETAIL);
        $NC.setValue("#edtGeocode_Lat", rowData.GEOCODE_LAT);
        $NC.setValue("#edtGeocode_Lng", rowData.GEOCODE_LNG);
        $NC.setValue("#edtTel_No", rowData.TEL_NO);
        $NC.setValue("#edtFax_No", rowData.FAX_NO);
        $NC.setValue("#edtCharge_Nm", rowData.CHARGE_NM);
        $NC.setValue("#edtCharge_Duty", rowData.CHARGE_DUTY);
        $NC.setValue("#edtCharge_Tel", rowData.CHARGE_TEL);
        $NC.setValue("#edtCharge_Hp", rowData.CHARGE_HP);
        $NC.setValue("#edtCharge_Email", rowData.CHARGE_EMAIL);
        $NC.setValue("#edtTrans_Manager_Nm", rowData.TRANS_MANAGER_NM);
        $NC.setValue("#edtTrans_Manager_Duty", rowData.TRANS_MANAGER_DUTY);
        $NC.setValue("#edtTrans_Manager_Tel", rowData.TRANS_MANAGER_TEL);
        $NC.setValue("#edtTrans_Manager_Hp", rowData.TRANS_MANAGER_HP);
        $NC.setValue("#edtTrans_Manager_Email", rowData.TRANS_MANAGER_EMAIL);
        $NC.setValue("#edtRDelivery_Cd", rowData.RDELIVERY_CD);
        $NC.setValue("#edtRDelivery_Nm", rowData.RDELIVERY_NM);
        $NC.setValue("#cboStock_First_Div", rowData.STOCK_FIRST_DIV);
        $NC.setValue("#dtpDelivery_Time", rowData.DELIVERY_TIME);
        $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV == "1");
        $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV == "2");
        $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV == "3");
        $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
        $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
        for (var i = 0; i < 7; i++) {
            $NC.setValue("#chkDelivery_Week" + i, $NC.isNull(rowData.DELIVERY_WEEK) ? $ND.C_NO : rowData.DELIVERY_WEEK.substr(i, 1));
        }
        $NC.setValue("#edtTml_Cd", rowData.TML_CD);
        $NC.setValue("#edtTml_Nm", rowData.TML_NM);
        $NC.setValue("#edtMin_Order_Amt", rowData.MIN_ORDER_AMT);
        $NC.setValue("#edtRemark1", rowData.REMARK1);

        // 신규 데이터면 공급처코드 수정할 수 있게 함
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtDelivery_Cd");
        } else {
            $NC.setEnable("#edtDelivery_Cd", false);
        }
        $NC.setEnable("#btnGetCoord", $NC.isNull(rowData.GEOCODE_LAT) //
            || $NC.isNull(rowData.GEOCODE_LNG));
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "DELIVERY_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.DELIVERY_CD)) {
            alert($NC.getDisplayMsg("JS.CMC03040E0.006", "배송처코드를 입력하십시오."));
            $NC.setFocus("#edtVendor_Cd");
            $NC.setGridSelectRow(G_GRDMASTER, row);
            return false;
        }
        if ($NC.isNull(rowData.DELIVERY_NM)) {
            alert($NC.getDisplayMsg("JS.CMC03040E0.007", "배송처명을 입력하십시오."));
            $NC.setFocus("#edtVendor_Full_Nm");
            $NC.setGridSelectRow(G_GRDMASTER, row);
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC03040E0.008", "거래구분을 선택하십시오."));
            $NC.setFocus("#rgbDeal_Div");
            $NC.setGridSelectRow(G_GRDMASTER, row);
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC03040E0.009", "거래일자와 종료일자의 범위 입력오류입니다."));
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

function grdMasterOnNewRecord(args) {

    $NC.setValue("#cboDelivery_Div", args.rowData.DELIVERY_DIV);
    $NC.setValue("#cboDistribute_Div", args.rowData.DISTRIBUTE_DIV);
    $NC.setValue("#cboStock_First_Div", args.rowData.STOCK_FIRST_DIV);
    $NC.setValue("#rgbDeal_Div", args.rowData.DEAL_DIV);
    $NC.setValue("#cboRegion_Div", args.rowData.REGION_DIV);

    $NC.setFocus("#edtDelivery_Cd");
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_FULL_NM",
        field: "DELIVERY_FULL_NM",
        name: "배송처정식명칭"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_DIV_F",
        field: "DELIVERY_DIV_F",
        name: "배송처구분"
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
    // 좌표API사용 기준 : 1 - 네이버 API 사용
    $NC.setGridColumn(columns, {
        id: "GEOCODE_LAT",
        field: "GEOCODE_LAT",
        name: "위도",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "GEOCODE_LNG",
        field: "GEOCODE_LNG",
        name: "경도",
        initialHidden: true
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
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_CD",
        field: "RDELIVERY_CD",
        name: "실배송처코드"
    });
    $NC.setGridColumn(columns, {
        id: "RDELIVERY_NM",
        field: "RDELIVERY_NM",
        name: "실배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "DEPT_NM",
        field: "DEPT_NM",
        name: "부서명"
    });
    $NC.setGridColumn(columns, {
        id: "DISTRIBUTE_DIV_F",
        field: "DISTRIBUTE_DIV_F",
        name: "유통구분"
    });
    $NC.setGridColumn(columns, {
        id: "SALE_DIV_F",
        field: "SALE_DIV_F",
        name: "판매방식구분"
    });
    $NC.setGridColumn(columns, {
        id: "TAG_MANAGE_DIV_F",
        field: "TAG_MANAGE_DIV_F",
        name: "택관리구분"
    });
    $NC.setGridColumn(columns, {
        id: "NEW_DELIVERY_YN",
        field: "NEW_DELIVERY_YN",
        name: "오픈매장여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "REGION_DIV_F",
        field: "REGION_DIV_F",
        name: "지역구분"
    });
    $NC.setGridColumn(columns, {
        id: "SALESMAN_CD",
        field: "SALESMAN_CD",
        name: "영업사원코드"
    });
    $NC.setGridColumn(columns, {
        id: "SALESMAN_NM",
        field: "SALESMAN_NM",
        name: "영업사원명"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_WEEK_D",
        field: "DELIVERY_WEEK_D",
        name: "배송요일"
    });
    // $NC.setGridColumn(columns, {
    // id: "MIN_ORDER_AMT",
    // field: "MIN_ORDER_AMT",
    // name: "최소발주금액",
    // cssClass: "styRight"
    // });
    $NC.setGridColumn(columns, {
        id: "TML_CD",
        field: "TML_CD",
        name: "터미널코드"
    });
    $NC.setGridColumn(columns, {
        id: "TML_NM",
        field: "TML_NM",
        name: "터미널명"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_TIME",
        field: "DELIVERY_TIME",
        name: "납품지정시각"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterOnSetColumns() {

    $NC.setGridColumns(G_GRDMASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.CM710 != "1" ? "GEOCODE_LAT,GEOCODE_LNG" : ""
    ]);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC03040E0.RS_MASTER",
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
        case "DELIVERY_CD":
            rowData.DELIVERY_CD = args.val;
            break;
        case "DELIVERY_NM":
            rowData.DELIVERY_NM = args.val;
            if ($NC.isNull(rowData.DELIVERY_FULL_NM)) {
                rowData.DELIVERY_FULL_NM = rowData.DELIVERY_NM;
                $NC.setValue("#edtDelivery_Full_Nm", rowData.DELIVERY_FULL_NM);
            }
            break;
        case "DELIVERY_FULL_NM":
            rowData.DELIVERY_FULL_NM = args.val;
            break;
        case "DELIVERY_DIV":
            rowData.DELIVERY_DIV = args.val;
            rowData.DELIVERY_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "DISTRIBUTE_DIV":
            rowData.DISTRIBUTE_DIV = args.val;
            rowData.DISTRIBUTE_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "SALE_DIV":
            rowData.SALE_DIV = args.val;
            rowData.SALE_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "TAG_MANAGE_DIV":
            rowData.TAG_MANAGE_DIV = args.val;
            rowData.TAG_MANAGE_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "NEW_DELIVERY_YN":
            rowData.NEW_DELIVERY_YN = args.val;
            break;
        case "REGION_DIV":
            rowData.REGION_DIV = args.val;
            rowData.REGION_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "SALESMAN_CD":
            rowData.SALESMAN_CD = args.val;
            if ($NC.isNull(rowData.SALESMAN_NM)) {
                rowData.SALESMAN_NM = rowData.SALESMAN_CD;
                $NC.setValue("#edtSalesman_Nm", rowData.SALESMAN_NM);
            }
            break;
        case "SALESMAN_NM":
            rowData.SALESMAN_NM = args.val;
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
        case "GEOCODE_LAT":
            rowData.GEOCODE_LAT = args.val;
            break;
        case "GEOCODE_LNG":
            rowData.GEOCODE_LNG = args.val;
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
        case "TRANS_MANAGER_NM":
            rowData.TRANS_MANAGER_NM = args.val;
            break;
        case "TRANS_MANAGER_DUTY":
            rowData.TRANS_MANAGER_DUTY = args.val;
            break;
        case "TRANS_MANAGER_TEL":
            rowData.TRANS_MANAGER_TEL = args.val;
            break;
        case "TRANS_MANAGER_HP":
            rowData.TRANS_MANAGER_HP = args.val;
            break;
        case "TRANS_MANAGER_EMAIL":
            rowData.TRANS_MANAGER_EMAIL = args.val;
            break;
        case "RDELIVERY_CD":
            $NP.onDeliveryChange(args.val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: args.val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onRDeliveryPopup);
            break;
        case "STOCK_FIRST_DIV":
            rowData.STOCK_FIRST_DIV = args.val;
            break;
        case "DELIVERY_TIME":
            if ($NC.isNotNull(args.val)) {
                if (!$NC.isTime(args.val)) {
                    alert($NC.getDisplayMsg("JS.CMC03040E0.010", "납품지정시각을 정확히 입력하십시오."));
                    rowData.DELIVERY_TIME = "";
                    $NC.setValue(args.view);
                } else {
                    rowData.DELIVERY_TIME = $NC.getTime(args.val);
                }
            } else {
                rowData.DELIVERY_TIME = $NC.getTime(args.val);
            }
            break;
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC03040E0.011", "거래일자를 정확히 입력하십시오."), "N");
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC03040E0.012", "종료일자를 정확히 입력하십시오."), "N");
            }
            rowData.CLOSE_DATE = $NC.getValue(args.view);
            break;
        case "DELIVERY_WEEK0":
        case "DELIVERY_WEEK1":
        case "DELIVERY_WEEK2":
        case "DELIVERY_WEEK3":
        case "DELIVERY_WEEK4":
        case "DELIVERY_WEEK5":
        case "DELIVERY_WEEK6":
            var idx = Number(args.col.substr(args.col.length - 1));
            rowData.DELIVERY_WEEK = rowData.DELIVERY_WEEK.substr(0, idx) //
                + ($("#chkDelivery_Week" + idx).is(":checked") ? $ND.C_YES : $ND.C_NO) //
                + rowData.DELIVERY_WEEK.substr(idx + 1);
            rowData.DELIVERY_WEEK_D = $NC.getValueCheckGroup("chkDelivery_Week") //
            .replace("0", "일") //
            .replace("1", "월") //
            .replace("2", "화") //
            .replace("3", "수") //
            .replace("4", "목") //
            .replace("5", "금") //
            .replace("6", "토");
            break;
        case "MIN_ORDER_AMT":
            rowData.MIN_ORDER_AMT = args.val;
            break;
        case "DEPT_CD":
            $NP.onDeptChange(args.val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DEPT_CD: args.val,
                P_VIEW_DIV: "1"
            }, onDeptPopup);
            return;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "DELIVERY_CD", true)) {
        $NC.setEnableGroup("#divRightView", true);
        $NC.setEnable("#edtDelivery_Cd", false);
        $NC.setEnable("#btnGetCoord", $NC.isNull($NC.getValue("#edtGeocode_Lat")) //
            || $NC.isNull($NC.getValue("#edtGeocode_Lat")));
    } else {
        $NC.setEnableGroup("#divRightView", false);
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
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "DELIVERY_CD"
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
        $NC.setFocus("#edtRDelivery_Cd", true);
    });
}

function onRDeliveryPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtRDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtRDelivery_Nm", resultInfo.DELIVERY_NM);

        rowData.RDELIVERY_CD = resultInfo.DELIVERY_CD;
        rowData.RDELIVERY_NM = resultInfo.DELIVERY_NM;
    } else {
        $NC.setValue("#edtRDelivery_Cd");
        $NC.setValue("#edtRDelivery_Nm");

        rowData.RDELIVERY_CD = "";
        rowData.RDELIVERY_NM = "";

        $NC.setFocus("#edtRDelivery_Cd", true);
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
    $NC.setValue("#edtGeocode_Lat");
    $NC.setValue("#edtGeocode_Lng");
    $NC.setEnable("#btnGetCoord");

    rowData.GEOCODE_LAT = "";
    rowData.GEOCODE_LNG = "";

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
    $NC.setValue("#edtGeocode_Lat");
    $NC.setValue("#edtGeocode_Lng");
    $NC.setFocus("#edtAddr_Detail");
    $NC.setEnable("#btnGetCoord");

    rowData.ZIP_CD = "";
    rowData.ADDR_BASIC = "";
    rowData.ADDR_DETAIL = "";
    rowData.GEOCODE_LAT = "";
    rowData.GEOCODE_LNG = "";

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
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

    $NC.onGlobalResize();
}

/**
 * 부서 검색 이미지 클릭
 * 
 * @param resultInfo
 */

function showDeptPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

    $NP.showDeptPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DEPT_CD: $ND.C_ALL,
            P_VIEW_DIV: "1"
        }
    }, onDeptPopup, function() {
        $NC.setFocus("#edtDept_Cd", true);
    });
}

/**
 * 부서 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onDeptPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtDept_Cd", resultInfo.DEPT_CD);
        $NC.setValue("#edtDept_Nm", resultInfo.DEPT_NM);

        rowData.DEPT_CD = resultInfo.DEPT_CD;
        rowData.DEPT_NM = resultInfo.DEPT_NM;

    } else {
        $NC.setValue("#edtDept_Cd");
        $NC.setValue("#edtDept_Nm");
        $NC.setFocus("#edtDept_Cd", true);

        rowData.DEPT_CD = "";
        rowData.DEPT_NM = "";
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

// 기본주소를 기준으로 좌표계산 후 입력 처리
function btnGetCoordOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if ($NC.isNull(rowData.ADDR_BASIC)) {
        alert($NC.getDisplayMsg("JS.CMC03040E0.013", "주소 정보가 등록되어 있지 않습니다."));
        return;
    }

    var checkedValue = [
        {
            P_CUST_CD: rowData.CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD
        }
    ];

    var serviceParams = {
        P_TABLE_NM: "DUMMY",
        P_ADDR_BASIC: rowData.ADDR_BASIC
    };

    $NC.serviceCall("/CMC03040E0/callGetCoordinate.do", {
        P_CHECKED_VALUE: checkedValue,
        P_SERVICE_PARAMS: serviceParams,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }

        var geocodeLat = resultData.O_GEOCODE_LAT; // 위도
        var geocodeLng = resultData.O_GEOCODE_LNG; // 경도

        $NC.setValue("#edtGeocode_Lat", geocodeLat);
        $NC.setValue("#edtGeocode_Lng", geocodeLng);

        rowData.GEOCODE_LAT = geocodeLat;
        rowData.GEOCODE_LNG = geocodeLng;

        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData);
        $NC.setEnable("#btnGetCoord", false);
    });
}

function btnEntryCoordOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC03040E0.014", "처리할 데이터가 없습니다."));
        return;
    }

    if ($NC.isGridModified(G_GRDMASTER)) {
        alert($NC.getDisplayMsg("JS.CMC03040E0.015", "데이터가 변경되었습니다. 저장 후 처리하십시오."));
        return;
    }

    var rowData;
    var dsMaster = [];
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);

        // 기본주소가 null이거나 좌표가 등록되어 있으면 처리 대상이 아님
        if ($NC.isNull(rowData.ADDR_BASIC) //
            || ($NC.isNotNull(rowData.GEOCODE_LAT) //
            && $NC.isNotNull(rowData.GEOCODE_LNG))) {
            continue;
        }

        dsMaster.push(rowData);
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC03040E0.016", "등록 가능한 데이터가 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC03041P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC03041P0.001", "좌표일괄등록"),
        url: "cm/CMC03041P0.html",
        width: 800,
        height: 500,
        G_PARAMETER: {
            P_MASTER_DS: dsMaster,
            P_PROGRAM_ID: $NC.G_VAR.G_PARAMETER.PROGRAM_ID
        },
        onOk: function() {
            onSave();
        }
    });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnable("#btnEntryCoord", permission.canSave && enable);
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // 좌표검색 API 사용 정책 (0:사용안함, 1:네이버API사용)
        if ($NC.G_VAR.policyVal.CM710 == "0") {
            $("#btnEntryCoord").hide();
            $("#btnGetCoord").hide();
            $("#coordGroupRow").hide();
            $("#lblGeocode_Lat").hide();
            $("#edtGeocode_Lat").hide();
            $("#lblGeocode_Lng").hide();
            $("#edtGeocode_Lng").hide();
        } else {
            $("#btnEntryCoord").show();
            $("#btnGetCoord").show();
            $("#coordGroupRow").show();
            $("#lblGeocode_Lat").show();
            $("#edtGeocode_Lat").show();
            $("#lblGeocode_Lng").show();
            $("#edtGeocode_Lng").show();
        }
        // 컬럼 표시 조정
        grdMasterOnSetColumns();

        $NC.onGlobalResize();
    });
}