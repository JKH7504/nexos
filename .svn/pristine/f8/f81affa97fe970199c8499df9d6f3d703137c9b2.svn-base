/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04020E2
 *  프로그램명         : 상품관리
 *  프로그램설명       : 상품관리 화면(의약) Javascript
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
                grids: [
                    "#grdMaster",
                    "#grdDetail"
                ]
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
        },
        // 체크할 정책 값
        policyVal: {
            CM310: "" // 상품바코드 관리 정책
        }
    });

    // 초기화 및 초기값 세팅
    // 탭 초기화
    $NC.setInitTab("#divRightView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
    $NC.setInitDatePicker("#dtpClose_Date", null, "N");

    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);

    // 검색.거래구분에 거래진행 체크
    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divRightView", false);
    $NC.setEnable("#btnAddBarCd", false);
    $("#ctrAdditional_grdDetail").hide();

    // 이벤트 연결
    $("#btnQCust_Cd").click(showQCustPopup);
    $("#btnQBrand_Cd").click(showQCustBrandPopup);
    $("#btnBrand_Cd").click(showCustBrandPopup);
    $("#btnBIItemUpload").click(btnBIItemUploadOnClick);
    $("#btnBIItemRemove").click(btnBIItemRemoveOnClick);
    $("#btnVendor_Cd").click(showVendorPopup);
    $("#btnMaker_Cd").click(showReferencePopup);
    $("#btnAddItemBarCd").click(btnAddItemBarCdOnClick);
    $("#btnAddBarCd").click(btnAddBarCdOnClick);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    // 콤보박스 초기화
    // 대분류 combo 설정
    setDepartCombo();
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_KEEP_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "KEEP_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_PLT_SPLIT_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "PLT_SPLIT_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_VALID_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "VALID_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_TERM_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "TERM_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_IN_UNIT_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "IN_UNIT_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_OUT_UNIT_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "OUT_UNIT_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_DRUG_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "DRUG_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_MEDICATION_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "MEDICATION_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_SERIAL_IN_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "SERIAL_IN_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_SERIAL_OUT_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "SERIAL_OUT_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 상품구분 콤보
        $NC.setInitComboData({
            selector: "#cboItem_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_DIV),
            onComplete: function() {
                $NC.setValue("#cboItem_Div");
            }
        });
        // 보관구분 콤보
        $NC.setInitComboData({
            selector: "#cboKeep_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_KEEP_DIV),
            onComplete: function() {
                $NC.setValue("#cboKeep_Div");
            }
        });
        // 파렛트분할구분 콤보
        $NC.setInitComboData({
            selector: "#cboPlt_Split_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_PLT_SPLIT_DIV),
            onComplete: function() {
                $NC.setValue("#cboPlt_Split_Div");
            }
        });
        // 유통기한구분 콤보
        $NC.setInitComboData({
            selector: "#cboValid_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_VALID_DIV),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboValid_Div");
            }
        });
        // 유통기한적용단위 콤보
        $NC.setInitComboData({
            selector: "#cboTerm_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_TERM_DIV),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboTerm_Div");
            }
        });
        // 입고단위 콤보
        $NC.setInitComboData({
            selector: "#cboIn_Unit_Cd",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_IN_UNIT_DIV),
            onComplete: function() {
                $NC.setValue("#cboIn_Unit_Cd");
            }
        });
        // 출고단위 콤보
        $NC.setInitComboData({
            selector: "#cboOut_Unit_Cd",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_OUT_UNIT_DIV),
            onComplete: function() {
                $NC.setValue("#cboOut_Unit_Cd");
            }
        });
        // 약품구분 콤보
        $NC.setInitComboData({
            selector: "#cboDrug_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_DRUG_DIV),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboDrug_Div");
            }
        });
        // 투여구분 콤보
        $NC.setInitComboData({
            selector: "#cboMedication_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_MEDICATION_DIV),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboMedication_Div");
            }
        });
        // 입고일련번호관리구분 콤보
        $NC.setInitComboData({
            selector: "#cboSerial_In_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SERIAL_IN_DIV),
            onComplete: function() {
                $NC.setValue("#cboSerial_In_Div");
            }
        });
        // 출고일련번호관리구분 콤보
        $NC.setInitComboData({
            selector: "#cboSerial_Out_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SERIAL_OUT_DIV),
            onComplete: function() {
                $NC.setValue("#cboSerial_Out_Div");
            }
        });
    });

    // 사이트 정책 취득
    setPolicyValInfo();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divLeftView", "h", 500);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.rightViewWidth = 450;
    $NC.G_OFFSET.rightViewMinHeight = $("#divT1TabSheetView").outerHeight(true) + $NC.G_LAYOUT.header;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    if ($NC.getTabActiveIndex("#divRightView") == 2) {
        var $container = $("#imgBIItem").parent();
        $NC.resizeContainer($container, null, null, $("#ctrT3ActionBar").outerHeight(true));
        $container.css("line-height", $container.css("height"));
    }
}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CUST_CD":
            $NP.onCustChange(val, {
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQCustPopup);
            return;
        case "BRAND_CD":
            $NP.onCustBrandChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_BRAND_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQCustBrandPopup);
            return;
    }

    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    // 바코드 컨테이너 추가
    if (view.parents("#ctrAdditional_grdDetail:first").length > 0) {
        switch (id) {
            case "L1_SCAN_BAR_CD":
                $NC.setValue("#edtL1_Item_Bar_Cd", getItemBarCd($NC.getValue(view)));
                break;
        }
    }
    // 마스터 컨테이너 정보
    else {
        grdMasterOnCellChange(e, {
            view: view,
            col: id,
            val: val
        });
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.001", "고객사를 선택하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    G_GRDMASTER.queryParams = {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: BRAND_CD,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var newRowData;
    // 상품
    if (G_GRDMASTER.focused) {

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
            BRAND_NM: $NC.getValue("#edtQBrand_Nm"),
            ITEM_CD: null,
            ITEM_NM: null,
            ITEM_FULL_NM: null,
            ITEM_SPEC: null,
            ITEM_DIV: null,
            CUST_CD: $NC.getValue("#edtQCust_Cd"),
            VENDOR_CD: null,
            VENDOR_NM: null,
            DEPART_CD: "",
            LINE_CD: "",
            CLASS_CD: "",
            KEEP_DIV: null,
            KEEP_DETAIL: null,
            ITEM_BAR_CD: null,
            CASE_BAR_CD: null,
            BOX_BAR_CD: null,
            IN_UNIT_CD: null,
            OUT_UNIT_CD: null,
            ITEM_WEIGHT: null,
            BOX_WEIGHT: null,
            BOX_WIDTH: null,
            BOX_LENGTH: null,
            BOX_HEIGHT: null,
            BOX_CBM: null,
            QTY_IN_CASE: null,
            QTY_IN_BOX: 1,
            BOX_IN_PLT: 0,
            PLT_STAIR: null,
            PLT_PLACE: null,
            FILL_UNIT_QTY: null,
            PLT_SPLIT_DIV: "1",
            VALID_DIV: null,
            TERM_DIV: null,
            TERM_VAL: "0",
            BUY_PRICE: null,
            SUPPLY_PRICE: null,
            SALE_PRICE: null,
            VAT_YN: $ND.C_NO,
            SET_ITEM_YN: $ND.C_NO,
            MAKER_CD: null,
            MAKER_NM: null,
            DRUG_CD: null,
            DRUG_DIV: null,
            MEDICATION_DIV: null,
            RESTRICT_IN_MONTHS: null,
            RESTRICT_OUT_MONTHS: null,
            SERIAL_QTY: null,
            SERIAL_IN_DIV: "1",
            SERIAL_IN_DIV_F: $NC.getValueCombo("#cboSerial_In_Div", {
                searchVal: "1",
                returnVal: "F"
            }),
            SERIAL_OUT_DIV: "1",
            SERIAL_OUT_DIV_F: $NC.getValueCombo("#cboSerial_Out_Div", {
                searchVal: "1",
                returnVal: "F"
            }),
            DEAL_DIV: "1",
            OPEN_DATE: null,
            CLOSE_DATE: null,
            REMARK1: null,
            REG_USER_ID: null,
            REG_DATETIME: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 대분류/중분류/소분류 초기화
        $NC.setValue("#cboDepart_Cd", newRowData.DEPART_CD);
        $("#cboLine_Cd").empty();
        $("#cboClass_Cd").empty();

        // 이전 데이터가 한건도 없었으면 에디터 Enable
        if (G_GRDMASTER.data.getLength() == 0) {
            $NC.setEnableGroup("#divRightView", true);
        }

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDMASTER, newRowData);
    }
    // 바코드
    else {
        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.002", "상품 내역이 없습니다.\n\n상품을 먼저 등록하십시오."));
            return;
        }

        var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.003", "신규 상품 입니다.\n\n저장 후 상품바코드를 등록하십시오."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            CUST_CD: refRowData.CUST_CD,
            ITEM_BARCD: null,
            BARCD_DIV: "0",
            BRAND_CD: refRowData.BRAND_CD,
            ITEM_CD: refRowData.ITEM_CD,
            ITEM_PACK: "",
            REMARK1: "",
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDDETAIL, newRowData);
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.004", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var BRAND_CD = $NC.getValue("#edtBrand_Cd");
    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    var dsMaster = [ ];
    var rowData, rIndex, rCount;
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_NM: rowData.ITEM_NM,
            P_ITEM_FULL_NM: rowData.ITEM_FULL_NM,
            P_ITEM_SPEC: rowData.ITEM_SPEC,
            P_ITEM_DIV: rowData.ITEM_DIV,
            P_CUST_CD: CUST_CD,
            P_VENDOR_CD: rowData.VENDOR_CD,
            P_DEPART_CD: rowData.DEPART_CD,
            P_LINE_CD: rowData.LINE_CD,
            P_CLASS_CD: rowData.CLASS_CD,
            P_KEEP_DIV: rowData.KEEP_DIV,
            P_KEEP_DETAIL: rowData.KEEP_DETAIL,
            P_ITEM_BAR_CD: rowData.ITEM_BAR_CD,
            P_CASE_BAR_CD: rowData.CASE_BAR_CD,
            P_BOX_BAR_CD: rowData.BOX_BAR_CD,
            P_IN_UNIT_CD: rowData.IN_UNIT_CD,
            P_OUT_UNIT_CD: rowData.OUT_UNIT_CD,
            P_ITEM_WEIGHT: rowData.ITEM_WEIGHT,
            P_BOX_WEIGHT: rowData.BOX_WEIGHT,
            P_BOX_WIDTH: rowData.BOX_WIDTH,
            P_BOX_LENGTH: rowData.BOX_LENGTH,
            P_BOX_HEIGHT: rowData.BOX_HEIGHT,
            P_BOX_CBM: rowData.BOX_CBM,
            P_QTY_IN_CASE: rowData.QTY_IN_CASE,
            P_QTY_IN_BOX: rowData.QTY_IN_BOX,
            P_BOX_IN_PLT: rowData.BOX_IN_PLT,
            P_PLT_STAIR: rowData.PLT_STAIR,
            P_PLT_PLACE: rowData.PLT_PLACE,
            P_FILL_UNIT_QTY: rowData.FILL_UNIT_QTY,
            P_PLT_SPLIT_DIV: rowData.PLT_SPLIT_DIV,
            P_VALID_DIV: rowData.VALID_DIV,
            P_TERM_DIV: $NC.isNotNull(rowData.VALID_DIV) ? rowData.TERM_DIV : "",
            P_TERM_VAL: $NC.isNotNull(rowData.VALID_DIV) ? rowData.TERM_VAL : 0,
            P_BUY_PRICE: rowData.BUY_PRICE,
            P_SUPPLY_PRICE: rowData.SUPPLY_PRICE,
            P_SALE_PRICE: rowData.SALE_PRICE,
            P_VAT_YN: rowData.VAT_YN,
            P_SET_ITEM_YN: rowData.SET_ITEM_YN,
            P_MAKER_CD: rowData.MAKER_CD,
            P_DRUG_CD: rowData.DRUG_CD,
            P_DRUG_DIV: rowData.DRUG_DIV,
            P_MEDICATION_DIV: rowData.MEDICATION_DIV,
            P_RESTRICT_IN_MONTHS: rowData.RESTRICT_IN_MONTHS,
            P_RESTRICT_OUT_MONTHS: rowData.RESTRICT_OUT_MONTHS,
            P_SERIAL_QTY: rowData.SERIAL_QTY,
            P_SERIAL_IN_DIV: rowData.SERIAL_IN_DIV,
            P_SERIAL_OUT_DIV: rowData.SERIAL_OUT_DIV,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_REMARK1: rowData.REMARK1,
            P_CMITEMBARCD_REG_YN: $NC.G_VAR.policyVal.CM310 == "2" ? $ND.C_YES : $ND.C_NO,
            P_CRUD: rowData.CRUD
        });
    }

    var dsDetail = [ ];
    for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_CUST_CD: rowData.CUST_CD,
            P_ITEM_BARCD: rowData.ITEM_BARCD,
            P_BARCD_DIV: rowData.BARCD_DIV,
            P_BARCD_QTY: rowData.BARCD_QTY,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_PACK: rowData.ITEM_PACK,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0 && dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.005", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC04020E0/saveP2.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var rowData;
    if (G_GRDMASTER.focused) {

        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.006", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC04020E2.007", "상품을 삭제 하시겠습니까?"))) {
            return;
        }

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
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
    } else {

        if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.006", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC04020E2.008", "상품바코드를 삭제 하시겠습니까?"))) {
            return;
        }

        rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDDETAIL, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "BRAND_CD",
            "ITEM_CD"
        ]
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

    if ($NC.getTabActiveIndex("#divRightView") == 2) {
        var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow) || {};
        onGetBIImage("#imgBIItem", "04", rowData["BRAND_CD"], rowData["ITEM_CD"]);
    }
    $NC.onGlobalResize();
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
        $NC.setValue("#edtBrand_Cd", rowData.BRAND_CD);
        $NC.setValue("#edtBrand_Nm", rowData.BRAND_NM);
        $NC.setValue("#edtItem_Cd", rowData.ITEM_CD);
        $NC.setValue("#edtItem_Nm", rowData.ITEM_NM);
        $NC.setValue("#edtItem_Full_Nm", rowData.ITEM_FULL_NM);
        $NC.setValue("#edtItem_Spec", rowData.ITEM_SPEC);
        $NC.setValue("#cboItem_Div", rowData.ITEM_DIV);
        $NC.setValue("#cboDepart_Cd", rowData.DEPART_CD);
        setLineCombo(rowData.LINE_CD);
        setClassCombo(rowData.LINE_CD, rowData.CLASS_CD);
        $NC.setValue("#cboKeep_Div", rowData.KEEP_DIV);
        $NC.setValue("#edtKeep_Detail", rowData.KEEP_DETAIL);
        $NC.setValue("#edtItem_Bar_Cd", rowData.ITEM_BAR_CD);
        $NC.setValue("#edtCase_Bar_Cd", rowData.CASE_BAR_CD);
        $NC.setValue("#edtBox_Bar_Cd", rowData.BOX_BAR_CD);
        $NC.setValue("#cboIn_Unit_Cd", rowData.IN_UNIT_CD);
        $NC.setValue("#cboOut_Unit_Cd", rowData.OUT_UNIT_CD);
        $NC.setValue("#edtItem_Weight", rowData.ITEM_WEIGHT);
        $NC.setValue("#edtBox_Weight", rowData.BOX_WEIGHT);
        $NC.setValue("#edtBox_Width", rowData.BOX_WIDTH);
        $NC.setValue("#edtBox_Length", rowData.BOX_LENGTH);
        $NC.setValue("#edtBox_Height", rowData.BOX_HEIGHT);
        $NC.setValue("#edtBox_Cbm", rowData.BOX_CBM);
        $NC.setValue("#edtQty_In_Case", rowData.QTY_IN_CASE);
        $NC.setValue("#edtQty_In_Box", rowData.QTY_IN_BOX);
        $NC.setValue("#edtBox_In_Plt", rowData.BOX_IN_PLT);
        $NC.setValue("#edtPlt_Stair", rowData.PLT_STAIR);
        $NC.setValue("#edtPlt_Place", rowData.PLT_PLACE);
        $NC.setValue("#edtFill_Unit_Qty", rowData.FILL_UNIT_QTY);
        $NC.setValue("#cboPlt_Split_Div", rowData.PLT_SPLIT_DIV);
        $NC.setValue("#edtVendor_Cd", rowData.VENDOR_CD);
        $NC.setValue("#edtVendor_Nm", rowData.VENDOR_NM);
        $NC.setValue("#cboValid_Div", rowData.VALID_DIV);
        $NC.setValue("#cboTerm_Div", rowData.TERM_DIV);
        $NC.setValue("#edtTerm_Val", rowData.TERM_VAL);
        $NC.setValue("#edtBuy_Price", rowData.BUY_PRICE);
        $NC.setValue("#edtSupply_Price", rowData.SUPPLY_PRICE);
        $NC.setValue("#edtSale_Price", rowData.SALE_PRICE);
        $NC.setValue("#chkVat_Yn", rowData.VAT_YN);
        $NC.setValue("#chkSet_Item_Yn", rowData.SET_ITEM_YN);
        $NC.setValue("#edtMaker_Cd", rowData.MAKER_CD);
        $NC.setValue("#edtMaker_Nm", rowData.MAKER_NM);
        $NC.setValue("#edtDrug_Cd", rowData.DRUG_CD);
        $NC.setValue("#cboDrug_Div", rowData.DRUG_DIV);
        $NC.setValue("#cboMedication_Div", rowData.MEDICATION_DIV);
        $NC.setValue("#edtRestrict_In_Months", rowData.RESTRICT_IN_MONTHS);
        $NC.setValue("#edtRestrict_Out_Months", rowData.RESTRICT_OUT_MONTHS);
        $NC.setValue("#edtSerial_Qty", rowData.SERIAL_QTY);
        $NC.setValue("#cboSerial_In_Div", rowData.SERIAL_IN_DIV);
        $NC.setValue("#cboSerial_Out_Div", rowData.SERIAL_OUT_DIV);
        $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV == "1");
        $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV == "2");
        $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV == "3");
        $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
        $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
        $NC.setValue("#edtRemark1", rowData.REMARK1);

        // 신규 데이터면 상품코드 수정할 수 있게 함
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtBrand_Cd");
            $NC.setEnable("#edtItem_Cd");
            $NC.setEnable("#btnBrand_Cd");
        } else {
            $NC.setEnable("#edtBrand_Cd", false);
            $NC.setEnable("#edtItem_Cd", false);
            $NC.setEnable("#btnBrand_Cd", false);
        }
        return true;
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "CUST_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.BRAND_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.009", "브랜드코드를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtBrand_Cd");
            return false;
        }
        if ($NC.isNull(rowData.ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.010", "상품코드를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtItem_Cd");
            return false;
        }
        if ($NC.isNull(rowData.ITEM_NM)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.011", "상품명을 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtItem_Nm");
            return false;
        }

        // 바코드 중복불가 정책인 경우만 중복체크함,
        if ($NC.G_VAR.policyVal.CM310 == "2") {
            var ITEM_BARCD = $NC.getValue("#edtItem_Bar_Cd");
            var BOX_BAR_CD = $NC.getValue("#edtBox_Bar_Cd");
            var CASE_BAR_CD = $NC.getValue("#edtCase_Bar_Cd");
            if (ITEM_BARCD == BOX_BAR_CD && !$NC.isNull(ITEM_BARCD)) {
                alert($NC.getDisplayMsg("JS.CMC04020E2.012", "상품바코드와 박스바코드에는 서로 다른 값을 입력하십시오."));
                $NC.setTabActiveIndex("#divRightView", 0);
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#edtItem_Bar_Cd");
                return false;
            }
            if (ITEM_BARCD == CASE_BAR_CD && !$NC.isNull(ITEM_BARCD)) {
                alert($NC.getDisplayMsg("JS.CMC04020E2.013", "상품바코드와 소박스바코드에는 서로 다른 값을 입력하십시오."));
                $NC.setTabActiveIndex("#divRightView", 0);
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#edtItem_Bar_Cd");
                return false;
            }
            if (BOX_BAR_CD == CASE_BAR_CD && !$NC.isNull(BOX_BAR_CD)) {
                alert($NC.getDisplayMsg("JS.CMC04020E2.014", "박스바코드와 소박스바코드에는 서로 다른 값을 입력하십시오."));
                $NC.setTabActiveIndex("#divRightView", 0);
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#edtBox_Bar_Cd");
                return false;
            }
        }

        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.015", "거래구분을 선택하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#rgbDeal_Div");
            return false;
        }
        if ($NC.isNull(rowData.QTY_IN_BOX)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.016", "박스입수를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtQty_In_Box");
            return false;
        }
        if ($NC.isNull(rowData.BOX_IN_PLT)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.017", "파렛트입수를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 1);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtBox_In_Plt");
            return false;
        }
        if ($NC.isNull(rowData.PLT_SPLIT_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.018", "파렛트분할을 선택하십시오."));
            $NC.setTabActiveIndex("#divRightView", 1);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboPlt_Split_Div");
            return false;
        }
        if ($NC.isNull(rowData.SERIAL_IN_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.019", "입고일련번호관리구분을 선택하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboSerial_In_Div");
            return false;
        }
        if ($NC.isNull(rowData.SERIAL_OUT_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.020", "출고일련번호관리구분을 선택하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboSerial_Out_Div");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnNewRecord(args) {

    $NC.setValue("#cboPlt_Split_Div", args.rowData.PLT_SPLIT_DIV);
    $NC.setValue("#rgbDeal_Div", args.rowData.DEAL_DIV);

    $NC.setTabActiveIndex("#divRightView", 0);

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    if ($NC.isNull(BRAND_CD)) {
        $NC.setFocus("#edtBrand_Cd");
    } else {
        $NC.setFocus("#edtItem_Cd");
    }
}

function grdMasterOnGetColumns() {

    var columns = [ ];
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
        id: "ITEM_FULL_NM",
        field: "ITEM_FULL_NM",
        name: "상품정식명칭"
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
        id: "ITEM_DIV_F",
        field: "ITEM_DIV_F",
        name: "상품구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_F",
        field: "KEEP_DIV_F",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DETAIL",
        field: "KEEP_DETAIL",
        name: "보관상세"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_F",
        field: "DRUG_DIV_F",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_F",
        field: "MEDICATION_DIV_F",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "RESTRICT_IN_MONTHS",
        field: "RESTRICT_IN_MONTHS",
        name: "입고제한잔존개월수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "RESTRICT_OUT_MONTHS",
        field: "RESTRICT_OUT_MONTHS",
        name: "출고제한잔존개월수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_QTY",
        field: "SERIAL_QTY",
        name: "일련번호관리수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_IN_DIV_F",
        field: "SERIAL_IN_DIV_F",
        name: "입고일련번호관리구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SERIAL_OUT_DIV_F",
        field: "SERIAL_OUT_DIV_F",
        name: "출고일련번호관리구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_CASE",
        field: "QTY_IN_CASE",
        name: "소박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_WEIGHT",
        field: "ITEM_WEIGHT",
        name: "상품중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_WEIGHT",
        field: "BOX_WEIGHT",
        name: "박스중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_LENGTH",
        field: "BOX_LENGTH",
        name: "박스길이",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_HEIGHT",
        field: "BOX_HEIGHT",
        name: "박스높이",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_CBM",
        field: "BOX_CBM",
        name: "박스용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_IN_PLT",
        field: "BOX_IN_PLT",
        name: "파렛트입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PLT_PLACE",
        field: "PLT_PLACE",
        name: "파렛트면박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PLT_STAIR",
        field: "PLT_STAIR",
        name: "파렛트단박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DIV_F",
        field: "VALID_DIV_F",
        name: "유통기한구분"
    });
    $NC.setGridColumn(columns, {
        id: "DEPART_CD",
        field: "DEPART_CD",
        name: "상품대분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_CD",
        field: "LINE_CD",
        name: "상품중분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_CD",
        field: "CLASS_CD",
        name: "상품소분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "MAKER_CD",
        field: "MAKER_CD",
        name: "제약사코드"
    });
    $NC.setGridColumn(columns, {
        id: "MAKER_NM",
        field: "MAKER_NM",
        name: "제약사명"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처코드"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "BUY_PRICE",
        field: "BUY_PRICE",
        name: "매입단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SUPPLY_PRICE",
        field: "SUPPLY_PRICE",
        name: "공급단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "SALE_PRICE",
        field: "SALE_PRICE",
        name: "판매단가",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VAT_YN",
        field: "VAT_YN",
        name: "과세여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "SET_ITEM_YN",
        field: "SET_ITEM_YN",
        name: "세트상품여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "CASE_BAR_CD",
        field: "CASE_BAR_CD",
        name: "소박스바코드"
    });
    $NC.setGridColumn(columns, {
        id: "BOX_BAR_CD",
        field: "BOX_BAR_CD",
        name: "박스바코드"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_CD",
        field: "IN_UNIT_CD",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "OUT_UNIT_CD",
        field: "OUT_UNIT_CD",
        name: "출고단위"
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
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC04020E2.RS_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onFocus.subscribe(grdMasterOnFocus);

    // 최초 조회시 포커스 처리
    G_GRDMASTER.focused = true;
}

function grdMasterOnFocus(e, args) {

    if (G_GRDMASTER.focused) {
        return;
    }

    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;

    // 행 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDDETAIL, null, e)) {
        return;
    }

}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);
    if ($NC.getTabActiveIndex("#divRightView") == 2) {
        onGetBIImage("#imgBIItem", "04", rowData.BRAND_CD, rowData.ITEM_CD);
    }
    $NC.setEnable("#btnAddBarCd", true);
    $("#ctrAdditional_grdDetail").hide();
    $NC.resizeGrid(G_GRDDETAIL); // $NC.onGlobalResize();

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    G_GRDDETAIL.queryParams = {
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04020E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

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
            $NP.onCustBrandChange(args.val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_BRAND_CD: args.val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onCustBrandPopup);
            return;
        case "ITEM_CD":
            rowData.ITEM_CD = args.val;
            break;
        case "ITEM_NM":
            rowData.ITEM_NM = args.val;
            if ($NC.isNull(rowData.ITEM_FULL_NM)) {
                rowData.ITEM_FULL_NM = rowData.ITEM_NM;
                $NC.setValue("#edtItem_Full_Nm", rowData.ITEM_FULL_NM);
            }
            break;
        case "ITEM_FULL_NM":
            rowData.ITEM_FULL_NM = args.val;
            break;
        case "ITEM_SPEC":
            rowData.ITEM_SPEC = args.val;
            break;
        case "ITEM_DIV":
            rowData.ITEM_DIV = args.val;
            rowData.ITEM_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "KEEP_DIV":
            rowData.KEEP_DIV = args.val;
            rowData.KEEP_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "KEEP_DETAIL":
            rowData.KEEP_DETAIL = args.val;
            break;
        case "VENDOR_CD":
            $NP.onVendorChange(args.val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_VENDOR_CD: args.val,
                P_VIEW_DIV: "1"
            }, onVendorPopup);
            return;
        case "DEPART_CD":
            rowData.DEPART_CD = args.val;
            rowData.LINE_CD = null;
            rowData.CLASS_CD = null;
            setLineCombo(rowData.LINE_CD);
            break;
        case "LINE_CD":
            rowData.LINE_CD = args.val;
            rowData.CLASS_CD = null;
            setClassCombo(rowData.LINE_CD, rowData.CLASS_CD);
            break;
        case "CLASS_CD":
            rowData.CLASS_CD = args.val;
            break;
        case "ITEM_BAR_CD":
            rowData.ITEM_BAR_CD = args.val;
            break;
        case "CASE_BAR_CD":
            rowData.CASE_BAR_CD = args.val;
            break;
        case "BOX_BAR_CD":
            rowData.BOX_BAR_CD = args.val;
            break;
        case "IN_UNIT_CD":
            rowData.IN_UNIT_CD = args.val;
            break;
        case "OUT_UNIT_CD":
            rowData.OUT_UNIT_CD = args.val;
            break;
        case "ITEM_WEIGHT":
            if ($NC.isNull(args.val)) {
                rowData.ITEM_WEIGHT = "0";
                $NC.setValue(args.view, rowData.ITEM_WEIGHT);
            } else {
                rowData.ITEM_WEIGHT = args.val;
            }
            break;
        case "BOX_WEIGHT":
            if ($NC.isNull(args.val)) {
                rowData.BOX_WEIGHT = "0";
                $NC.setValue(args.view, rowData.BOX_WEIGHT);
            } else {
                rowData.BOX_WEIGHT = args.val;
            }
            break;
        case "BOX_WIDTH":
            if ($NC.isNull(args.val)) {
                rowData.BOX_WIDTH = "0";
                $NC.setValue(args.view, rowData.BOX_WIDTH);
            } else {
                rowData.BOX_WIDTH = args.val;
            }
            rowData.BOX_CBM = getBoxCbm();
            break;
        case "BOX_LENGTH":
            if ($NC.isNull(args.val)) {
                rowData.BOX_LENGTH = "0";
                $NC.setValue(args.view, rowData.BOX_LENGTH);
            } else {
                rowData.BOX_LENGTH = args.val;
            }
            rowData.BOX_CBM = getBoxCbm();
            break;
        case "BOX_HEIGHT":
            if ($NC.isNull(args.val)) {
                rowData.BOX_HEIGHT = "0";
                $NC.setValue(args.view, rowData.BOX_HEIGHT);
            } else {
                rowData.BOX_HEIGHT = args.val;
            }
            rowData.BOX_CBM = getBoxCbm();
            break;
        case "BOX_CBM":
            if ($NC.isNull(args.val)) {
                rowData.BOX_CBM = "0";
                $NC.setValue(args.view, rowData.BOX_CBM);
            } else {
                rowData.BOX_CBM = args.val;
            }
            break;
        case "QTY_IN_CASE":
            if ($NC.isNull(args.val)) {
                rowData.QTY_IN_CASE = "1";
                $NC.setValue(args.view, rowData.QTY_IN_CASE);
            } else if (Number(args.val) < 1) {
                alert($NC.getDisplayMsg("JS.CMC04020E2.021", "소박스입수에 1이상의 정수를 입력하십시오."));
                rowData.QTY_IN_CASE = "1";
                $NC.setValue(args.view, rowData.QTY_IN_CASE);
                $NC.setFocus(args.view);
            } else {
                rowData.QTY_IN_CASE = args.val;
            }
            break;
        case "QTY_IN_BOX":
            if ($NC.isNull(args.val)) {
                rowData.QTY_IN_BOX = "1";
                $NC.setValue(args.view, rowData.QTY_IN_BOX);
            } else if (Number(args.val) < 1) {
                alert($NC.getDisplayMsg("JS.CMC04020E2.022", "박스입수에 1이상의 정수를 입력하십시오."));
                rowData.QTY_IN_BOX = "1";
                $NC.setValue(args.view, rowData.QTY_IN_BOX);
                $NC.setFocus(args.view);
            } else {
                rowData.QTY_IN_BOX = args.val;
            }
            break;
        case "BOX_IN_PLT":
            if ($NC.isNull(args.val)) {
                rowData.BOX_IN_PLT = "0";
                $NC.setValue(args.view, rowData.BOX_IN_PLT);
            } else {
                rowData.BOX_IN_PLT = args.val;
            }
            break;
        case "PLT_STAIR":
            if ($NC.isNull(args.val)) {
                rowData.PLT_STAIR = "0";
                $NC.setValue(args.view, rowData.PLT_STAIR);
            } else {
                rowData.PLT_STAIR = args.val;
            }
            rowData.BOX_IN_PLT = rowData.PLT_STAIR * rowData.PLT_PLACE;
            $NC.setValue("#edtBox_In_Plt", rowData.BOX_IN_PLT);
            break;
        case "PLT_PLACE":
            if ($NC.isNull(args.val)) {
                rowData.PLT_PLACE = "0";
                $NC.setValue(args.view, rowData.PLT_PLACE);
            } else {
                rowData.PLT_PLACE = args.val;
            }
            rowData.BOX_IN_PLT = rowData.PLT_STAIR * rowData.PLT_PLACE;
            $NC.setValue("#edtBox_In_Plt", rowData.BOX_IN_PLT);
            break;
        case "PLT_SPLIT_DIV":
            rowData.PLT_SPLIT_DIV = args.val;
            break;
        case "VALID_DIV":
            rowData.VALID_DIV = args.val;
            rowData.VALID_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "TERM_DIV":
            rowData.TERM_DIV = args.val;
            break;
        case "TERM_VAL":
            if ($NC.isNull(args.val)) {
                rowData.TERM_VAL = "0";
                $NC.setValue(args.view, rowData.TERM_VAL);
            } else {
                rowData.TERM_VAL = args.val;
            }
            break;
        case "BUY_PRICE":
            if ($NC.isNull(args.val)) {
                rowData.BUY_PRICE = "0";
                $NC.setValue(args.view, rowData.BUY_PRICE);
            } else {
                rowData.BUY_PRICE = args.val;
            }
            break;
        case "SUPPLY_PRICE":
            if ($NC.isNull(args.val)) {
                rowData.SUPPLY_PRICE = "0";
                $NC.setValue(args.view, rowData.SUPPLY_PRICE);
            } else {
                rowData.SUPPLY_PRICE = args.val;
            }
            break;
        case "SALE_PRICE":
            if ($NC.isNull(args.val)) {
                rowData.SALE_PRICE = "0";
                $NC.setValue(args.view, rowData.SALE_PRICE);
            } else {
                rowData.SALE_PRICE = args.val;
            }
            break;
        case "VAT_YN":
            rowData.VAT_YN = args.val;
            break;
        case "SET_ITEM_YN":
            rowData.SET_ITEM_YN = args.val;
            break;
        case "MAKER_CD":
            $NP.onReferenceChange(args.val, {
                P_REF_CUST_CD: args.val,
                P_REF_CUST_DIV: "2", // 제약사
                P_VIEW_DIV: "1"
            }, onReferencePopup);
            return;
        case "DRUG_CD":
            rowData.DRUG_CD = args.val;
            break;
        case "DRUG_DIV":
            rowData.DRUG_DIV = args.val;
            rowData.DRUG_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "MEDICATION_DIV":
            rowData.MEDICATION_DIV = args.val;
            rowData.MEDICATION_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "RESTRICT_IN_MONTHS":
            rowData.RESTRICT_IN_MONTHS = args.val;
            break;
        case "RESTRICT_OUT_MONTHS":
            rowData.RESTRICT_OUT_MONTHS = args.val;
            break;
        case "SERIAL_QTY":
            rowData.SERIAL_QTY = args.val;
            break;
        case "SERIAL_IN_DIV":
            rowData.SERIAL_IN_DIV = args.val;
            rowData.SERIAL_IN_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "SERIAL_OUT_DIV":
            rowData.SERIAL_OUT_DIV = args.val;
            rowData.SERIAL_OUT_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC04020E2.023", "거래일자를 정확히 입력하십시오."));
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC04020E2.024", "종료일자를 정확히 입력하십시오."));
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

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "ITEM_BARCD",
        field: "ITEM_BARCD",
        name: "상품바코드",
        resizable: false,
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "BARCD_QTY",
        field: "BARCD_QTY",
        name: "환산수량",
        cssClass: "styRight",
        resizable: false,
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_PACK",
        field: "ITEM_PACK",
        name: "상품단위",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "LAST_USER_ID",
        field: "LAST_USER_ID",
        name: "최종수정자ID"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정일시",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CMC04020E2.RS_DETAIL",
        sortCol: "ITEM_BARCD",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
    G_GRDDETAIL.view.onFocus.subscribe(grdDetailOnFocus);
}

function grdDetailOnFocus(e, args) {

    if (G_GRDDETAIL.focused) {
        return;
    }

    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

    $NC.setValue("#edtL1_Scan_Bar_Cd");
    $NC.setValue("#edtL1_Item_Bar_Cd");
    $NC.setValue("#edtL1_Bar_Cd_Qty");
    $NC.setValue("#edtL1_Item_Pack");

    $NC.setFocus("#edtL1_Scan_Bar_Cd");
}

/**
 * 그리드에 입고예정등록 전표 생성 가능여부가 N일경우 편집 불가로 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "ITEM_BARCD":
                return false;
        }
    }
    return true;
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "ITEM_BARCD")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ITEM_BARCD)) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.025", "상품바코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "ITEM_BARCD", true);
            return false;
        }
        if ($NC.isNull(rowData.BARCD_QTY) || rowData.BARCD_QTY == 0) {
            alert($NC.getDisplayMsg("JS.CMC04020E2.026", "바코드수량은 0보다 큰 값을 입력 하십시오."));
            $NC.setGridSelectRow(G_GRDDETAIL, row, "BARCD_QTY", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

/**
 * 대분류 combobox 설정
 */
function setDepartCombo() {

    $("#cboDepart_Cd").empty();

    // 대분류 콤보
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_ITEMGROUP_DEPART",
        P_QUERY_PARAMS: {
            P_CUST_CD: $NC.getValue("#edtQCust_Cd")
        }
    }, {
        selector: "#cboDepart_Cd",
        codeField: "DEPART_CD",
        fullNameField: "DEPART_CD_F",
        addEmpty: true,
        onComplete: function() {
            $NC.setValue("#cboDepart_Cd");
        }
    });
    $("#cboLine_Cd").empty(); // 중분류 초기화
    $("#cboClass_Cd").empty(); // 소분류 초기화
}

/**
 * 중분류 combobox 설정
 */
function setLineCombo(LINE_CD) {

    $("#cboLine_Cd").empty();
    $("#cboClass_Cd").empty();

    var DEPART_CD = $NC.getValue("#cboDepart_Cd");
    if ($NC.isNull(DEPART_CD)) {
        return;
    }

    // 중분류 콤보
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_ITEMGROUP_LINE",
        P_QUERY_PARAMS: {
            P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
            P_DEPART_CD: DEPART_CD
        }
    }, {
        selector: "#cboLine_Cd",
        codeField: "LINE_CD",
        fullNameField: "LINE_CD_F",
        addEmpty: true,
        onComplete: function() {
            $NC.setValue("#cboLine_Cd", LINE_CD);
        }
    });
}

/**
 * 소분류 combobox 설정
 */
function setClassCombo(LINE_CD, CLASS_CD) {

    $("#cboClass_Cd").empty();

    var DEPART_CD = $NC.getValue("#cboDepart_Cd");
    if ($NC.isNull(DEPART_CD) || $NC.isNull(LINE_CD)) {
        return;
    }

    // 소분류 콤보
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_ITEMGROUP_CLASS",
        P_QUERY_PARAMS: {
            P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
            P_DEPART_CD: DEPART_CD,
            P_LINE_CD: LINE_CD
        }
    }, {
        selector: "#cboClass_Cd",
        codeField: "CLASS_CD",
        fullNameField: "CLASS_CD_F",
        addEmpty: true,
        onComplete: function() {
            $NC.setValue("#cboClass_Cd", CLASS_CD);
        }
    });
}

/**
 * 용적 계산
 */
function getBoxCbm() {

    // var width = $NC.getValue("#edtBox_Width").replace(",", "");
    // var length = $NC.getValue("#edtBox_Length").replace(",", "");
    // var height = $NC.getValue("#edtBox_Height").replace(",", "");
    var width = $NC.toNumber($NC.getValue("#edtBox_Width"));
    var length = $NC.toNumber($NC.getValue("#edtBox_Length"));
    var height = $NC.toNumber($NC.getValue("#edtBox_Height"));

    var cbm = width * length * height / 1000000000;
    $NC.setValue("#edtBox_Cbm", cbm);
    return cbm;
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, [
        "BRAND_CD",
        "ITEM_CD"
    ], G_GRDMASTER.focused)) {
        $NC.setEnableGroup("#divRightView", true);
        $NC.setEnable("#edtBrand_Cd", false);
        $NC.setEnable("#edtItem_Cd", false);
        $NC.setEnable("#btnBrand_Cd", false);
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
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "ITEM_BARCD", G_GRDDETAIL.focused);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "BRAND_CD",
            "ITEM_CD"
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

function btnBIItemRemoveOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.027", "이미지를 삭제할 상품을 선택 후 삭제처리 하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.028", "신규 데이터입니다. 저장 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC04020E2.029", "선택한 상품의 이미지를 삭제하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/CMC04020E0/removeBIImage.do", {
        P_IMAGE_DIV: "04",
        P_IMAGE_CD1: rowData.BRAND_CD,
        P_IMAGE_CD2: rowData.ITEM_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        onGetBIImage("#imgBIItem", "04", rowData.BRAND_CD, rowData.ITEM_CD);
    });
}

function btnBIItemUploadOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.030", "로고를 업로드할 상품을 선택 후 파일업로드 처리 하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.028", "신규 데이터입니다. 저장 후 처리하십시오."));
        return;
    }

    $NC.showUploadFilePopup(".jpg, .png", function(view, fileFullName, fileName) {
        var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (fileExt != "jpg" && fileExt != "png") {
            alert($NC.getDisplayMsg("JS.CMC04020E2.031", "이미지 파일(*.jpg, *.png) 파일을 선택하십시오."));
            return;
        }

        $NC.fileUpload("/CMC04020E0/saveBIImage.do", {
            P_IMAGE_DIV: "04",
            P_IMAGE_CD1: rowData.BRAND_CD,
            P_IMAGE_CD2: rowData.ITEM_CD,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, function(ajaxData) {
            onGetBIImage("#imgBIItem", "04", rowData.BRAND_CD, rowData.ITEM_CD);
        });
    });
}

function onGetBIImage(selector, imageDiv, imageCd1, imageCd2) {

    $NC.serviceCall("/CMC04020E0/getBIImage.do", {
        P_IMAGE_DIV: imageDiv,
        P_IMAGE_CD1: $NC.nullToDefault(imageCd1, $ND.C_NULL),
        P_IMAGE_CD2: $NC.nullToDefault(imageCd2, $ND.C_NULL)
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        try {
            $(selector).prop("src", resultData.O_IMAGE_CONTENT);
        } catch (e) {
            $(selector).prop("src", null);
            alert(e);
        }
    }, function(ajaxData) {
        $(selector).prop("src", null);
        $NC.onError(ajaxData);
    });
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    setInputValue("#grdMaster");
    $NC.setEnableGroup("#divRightView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showQCustPopup() {

    $NP.showCustPopup({
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
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setFocus("#edtQBrand_Cd", true);
    } else {
        $NC.setValue("#edtQCust_Cd");
        $NC.setValue("#edtQCust_Nm");
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setFocus("#edtQCust_Cd", true);
    }
    onChangingCondition();

    // 고객사 값 변경시 대분류 재 설정
    setDepartCombo();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showQCustBrandPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showCustBrandPopup({
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onQCustBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onQCustBrandPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
    } else {
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setFocus("#edtQBrand_Cd", true);
    }
    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showCustBrandPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showCustBrandPopup({
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onCustBrandPopup, function() {
        $NC.setFocus("#edtBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onCustBrandPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtBrand_Nm", resultInfo.BRAND_NM);

        rowData.BRAND_CD = resultInfo.BRAND_CD;
        rowData.BRAND_NM = resultInfo.BRAND_NM;
    } else {
        $NC.setValue("#edtBrand_Cd");
        $NC.setValue("#edtBrand_Nm");
        $NC.setFocus("#edtBrand_Cd", true);

        rowData.BRAND_CD = "";
        rowData.BRNAD_NM = "";
    }
    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 공급처 검색 결과
 * 
 * @param resultInfo
 */
function showVendorPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

    $NP.showVendorPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_VENDOR_CD: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onVendorPopup, function() {
        $NC.setFocus("#edtVendor_Cd", true);
    });
}

function onVendorPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
        $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);

        rowData.VENDOR_CD = resultInfo.VENDOR_CD;
        rowData.VENDOR_NM = resultInfo.VENDOR_NM;
    } else {
        $NC.setValue("#edtVendor_Cd");
        $NC.setValue("#edtVendor_Nm");
        $NC.setFocus("#edtVendor_Cd", true);

        rowData.VENDOR_CD = "";
        rowData.VENDOR_NM = "";

    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 제약사 검색 결과
 * 
 * @param resultInfo
 */
function showReferencePopup() {

    $NP.showReferencePopup({
        queryParams: {
            P_REF_CUST_CD: $ND.C_ALL,
            P_REF_CUST_DIV: "2", // 제약사
            P_VIEW_DIV: "2"
        },
        title: "제약사",
        columnTitle: [
            "제약사코드",
            "제약사명"
        ]
    }, onReferencePopup, function() {
        $NC.setFocus("#edtMaker_Cd", true);
    });
}

function onReferencePopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtMaker_Cd", resultInfo.REF_CUST_CD);
        $NC.setValue("#edtMaker_Nm", resultInfo.REF_CUST_NM);

        rowData.MAKER_CD = resultInfo.REF_CUST_CD;
        rowData.MAKER_NM = resultInfo.REF_CUST_NM;
    } else {
        $NC.setValue("#edtMaker_Cd");
        $NC.setValue("#edtMaker_Nm");
        $NC.setFocus("#edtMaker_Cd", true);

        rowData.MAKER_CD = "";
        rowData.MAKER_NM = "";

    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    });
}

function btnAddBarCdOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.032", "바코드 추가할 상품을 선택 후 처리하십시오."));
        return;
    }

    $NC.setEnable("#btnAddBarCd", false);
    $("#ctrAdditional_grdDetail").show();
    $NC.resizeGrid(G_GRDDETAIL); // $NC.onGlobalResize();

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setValue("#edtL1_Scan_Bar_Cd");
    $NC.setValue("#edtL1_Item_Bar_Cd");
    $NC.setValue("#edtL1_Item_Pack", rowData.ITEM_SPEC);
    $NC.setValue("#edtL1_Bar_Cd_Qty", "1");

    $NC.setFocus("#edtL1_Scan_Bar_Cd");
}

function btnAddItemBarCdOnClick() {

    var SCAN_BARCD = $NC.getValue("#edtL1_Scan_Bar_Cd");
    if ($NC.isNull(SCAN_BARCD)) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.033", "바코드스캔에 상품바코드를 스캔하십시오."));
        $NC.setFocus("#edtL1_Scan_Bar_Cd");
        return false;
    }
    var ITEM_BARCD = $NC.getValue("#edtL1_Item_Bar_Cd");
    if ($NC.isNull(ITEM_BARCD)) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.034", "바코드를 파싱할 수 없습니다."));
        $NC.setFocus("#edtL1_Item_Bar_Cd");
        return false;
    }
    var BARCD_QTY = $NC.getValue("#edtL1_Bar_Cd_Qty");
    if ($NC.isNull(BARCD_QTY) || BARCD_QTY == 0) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.026", "바코드수량은 0보다 큰 값을 입력 하십시오."));
        $NC.setFocus("#edtL1_Bar_Cd_Qty");
        return false;
    }

    var ITEM_PACK = $NC.getValue("#edtL1_Item_Pack");

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.003", "신규 상품 입니다.\n\n저장 후 상품바코드를 등록하십시오."));
        return;
    }

    if ($NC.getGridSearchRow(G_GRDDETAIL, {
        searchKey: "ITEM_BARCD",
        searchVal: ITEM_BARCD,
        isAllData: true
    }) != -1) {
        alert($NC.getDisplayMsg("JS.CMC04020E2.035", "동일한 바코드가 존재합니다.\n확인 후 다시 작업하십시오."));
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CUST_CD: refRowData.CUST_CD,
        ITEM_BARCD: ITEM_BARCD,
        BARCD_DIV: "0",
        BRAND_CD: refRowData.BRAND_CD,
        ITEM_CD: refRowData.ITEM_CD,
        BARCD_QTY: BARCD_QTY,
        ITEM_PACK: ITEM_PACK,
        REMARK1: "",
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_C
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDDETAIL, newRowData);
}

function getItemBarCd(orgScanBarCd) {

    var itemBarCd = ""; // 바코드
    var scanBarCd = orgScanBarCd.replace(/[\\(]*[\\)]*/, "");
    var scanBarCdLen = scanBarCd.length;
    var sSpecialChar = "]D2"; // 특수문자 (GroupSeperater)

    // 묶음코드 SSCC코드, 일련번호식별자 없음.
    if ("00" == scanBarCd.substring(0, 2) && scanBarCdLen == 20) {
        // resultMsg = "상품바코드를 알 수 없는 묶음코드 입니다.";;
    } else if ("01" == scanBarCd.substring(0, 2) && "0" != scanBarCd.substring(2, 3) && "9" != scanBarCd.substring(2, 3) && scanBarCdLen >= 16) {
        if (orgScanBarCd.toUpperCase().indexOf(sSpecialChar) > -1) {
            // resultMsg = "상품바코드를 알 수 없는 묶음코드 입니다.";
        } else {
            itemBarCd = scanBarCd.substring(2, 16);
        }
    } else {
        var BAR_CD_DIV = "";
        var PREFIX = "";
        var prefixPosition;

        try {
            // 2D BARCODE
            if ("]" == scanBarCd.substring(0, 1)) {
                BAR_CD_DIV = scanBarCd.substring(3, 6);
                PREFIX = BAR_CD_DIV.substring(0, 1);

                if ("010" == BAR_CD_DIV || "011" == BAR_CD_DIV) {
                    itemBarCd = scanBarCd.substring(6, 18);
                } else if ("1" <= PREFIX && "8" >= PREFIX && BAR_CD_DIV.endsWith("88")) {
                    itemBarCd = scanBarCd.substring(4, 15);
                } else if ("880" == BAR_CD_DIV) {
                    itemBarCd = scanBarCd.substring(3, 15);
                } else {
                    prefixPosition = scanBarCd.indexOf("880");
                    if (prefixPosition > -1 && scanBarCdLen >= prefixPosition + 13) {
                        itemBarCd = scanBarCd.substring(prefixPosition, prefixPosition + 13);
                    } else {
                        itemBarCd = scanBarCd;
                    }
                }
            }
            // 1D BarCode
            else {
                BAR_CD_DIV = scanBarCd.substring(0, 3);
                PREFIX = BAR_CD_DIV.substring(0, 1);

                if ("010" == BAR_CD_DIV || "011" == BAR_CD_DIV) {
                    itemBarCd = scanBarCd.substring(3, 16);
                } else if ("1" <= PREFIX && "8" >= PREFIX && BAR_CD_DIV.endsWith("88")) {
                    itemBarCd = scanBarCd.substring(0, 14);
                } else if ("880" == BAR_CD_DIV) {
                    itemBarCd = scanBarCd.substring(0, 13);
                } else {
                    prefixPosition = scanBarCd.indexOf("880");
                    if (prefixPosition > -1 && scanBarCdLen >= prefixPosition + 13) {
                        itemBarCd = scanBarCd.substring(prefixPosition, prefixPosition + 13);
                    } else {
                        itemBarCd = scanBarCd;
                    }
                }
            }
        } catch (e) {
            // resultMsg = "바코드를 확인 할 수 없습니다. 확인 후 작업하십시오.";
        }
    }

    return itemBarCd;
}