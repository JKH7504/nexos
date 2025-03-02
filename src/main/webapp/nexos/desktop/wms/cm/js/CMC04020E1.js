/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04020E1
 *  프로그램명         : 상품관리
 *  프로그램설명       : 상품관리 화면(의류) Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-04-25
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-04-25    ASETEC           신규작성
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

    // 이벤트 연결
    $("#btnQCust_Cd").click(showQUserCustPopup);
    $("#btnQBrand_Cd").click(showQCustBrandPopup);
    $("#btnBrand_Cd").click(showCustBrandPopup);
    $("#btnBIItemUpload").click(btnBIItemUploadOnClick);
    $("#btnBIItemRemove").click(btnBIItemRemoveOnClick);
    $("#btnSetQtyInBox").click(btnSetQtyInBoxOnClick);

    // 그리드 초기화
    grdMasterInitialize();

    // 콤보박스 초기화
    // 대분류 combo 설정
    setDepartCombo();
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_YEAR_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "YEAR_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_SEASON_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "SEASON_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_DIV_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_YEAR_DIV_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "YEAR_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_SEASON_DIV_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "SEASON_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_GENDER_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "GENDER_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_PACK_BOX_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "PACK_BOX_DIV",
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
                P_RESULT_ID: "O_WC_POP_CMCODE_RETURN_BATCH_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "RETURN_BATCH_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ORIGIN_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ORIGIN_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_TAG_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "TAG_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }

        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 - 상품구분 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_DIV_2),
            addAll: true,
            multiSelect: true
        });
        // 조회조건 - 연도구분 세팅
        $NC.setInitComboData({
            selector: "#cboQYear_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_YEAR_DIV_2),
            addAll: true,
            multiSelect: true,
            onComplete: function() {
                $NC.setValue("#cboQYear_Div", 0);
            }
        });
        // 조회조건 - 시즌구분 세팅
        $NC.setInitComboData({
            selector: "#cboQSeason_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SEASON_DIV_2),
            addAll: true,
            multiSelect: true
        });
        // 상품구분 콤보
        $NC.setInitComboData({
            selector: "#cboItem_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_DIV_1),
            onComplete: function() {
                $NC.setValue("#cboItem_Div");
            }
        });
        // 연도구분 콤보
        $NC.setInitComboData({
            selector: "#cboYear_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_YEAR_DIV_1),
            onComplete: function() {
                $NC.setValue("#cboYear_Div");
            }
        });
        // 시즌구분 콤보
        $NC.setInitComboData({
            selector: "#cboSeason_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SEASON_DIV_1),
            onComplete: function() {
                $NC.setValue("#cboSeason_Div");
            }
        });
        // 성별구분 콤보
        $NC.setInitComboData({
            selector: "#cboGender_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_GENDER_DIV),
            onComplete: function() {
                $NC.setValue("#cboGender_Div");
            }
        });
        // 포장박스구분 콤보
        $NC.setInitComboData({
            selector: "#cboPack_Box_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_PACK_BOX_DIV),
            onComplete: function() {
                $NC.setValue("#cboPack_Box_Div");
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
        // 입고단위 콤보
        $NC.setInitComboData({
            selector: "#cboIn_Unit_Cd",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
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
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_OUT_UNIT_DIV),
            onComplete: function() {
                $NC.setValue("#cboOut_Unit_Cd");
            }
        });
        // 반품차수 콤보
        $NC.setInitComboData({
            selector: "#cboReturn_Batch_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_RETURN_BATCH_DIV),
            onComplete: function() {
                $NC.setValue("#cboReturn_Batch_Div");
            }
        });
        // 원산지구분 콤보
        $NC.setInitComboData({
            selector: "#cboOrigin_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ORIGIN_DIV),
            onComplete: function() {
                $NC.setValue("#cboOrigin_Div");
            }
        });
        // 택구분 콤보
        $NC.setInitComboData({
            selector: "#cboTag_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_TAG_DIV),
            onComplete: function() {
                $NC.setValue("#cboTag_Div");
            }
        });
    });

    // 사이트 정책 취득
    setPolicyValInfo();
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
            $NP.onUserCustChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQUserCustPopup);
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

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var CUST_NM = $NC.getValue("#edtQCust_Nm");
    if ($NC.isNull(CUST_NM)) {
        alert($NC.getDisplayMsg("JS.CMC04020E1.001", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_NM = $NC.getValue("#edtQItem_Nm");
    var YEAR_DIV = $NC.getValue("#cboQYear_Div");
    var SEASON_DIV = $NC.getValue("#cboQSeason_Div");
    var ITEM_DIV = $NC.getValue("#cboQItem_Div");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CUST_CD: CUST_CD,
        P_BRAND_CD: BRAND_CD,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM,
        P_YEAR_DIV: YEAR_DIV,
        P_SEASON_DIV: SEASON_DIV,
        P_ITEM_DIV: ITEM_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/CMC04020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        BRAND_NM: $NC.getValue("#edtQBrand_Nm"),
        ITEM_CD: null,
        ITEM_NM: null,
        ITEM_DIV: null,
        YEAR_DIV: null,
        SEASON_DIV: null,
        GENDER_DIV: null,
        DEPART_CD: "",
        LINE_CD: "",
        CLASS_CD: "",
        STYLE_CD: null,
        COLOR_CD: null,
        COLOR_NM: null,
        SIZE_CD: null,
        SIZE_NM: null,
        TAG_DIV: null,
        PACK_BOX_DIV: null,
        ITEM_BAR_CD: null,
        CASE_BAR_CD: null,
        BOX_BAR_CD: null,
        IN_UNIT_CD: null,
        OUT_UNIT_CD: null,
        ITEN_NO: null,
        ITEM_SEQ: null,
        RETURN_BATCH_DIV: null,
        RETURN_CELL_NO: null,
        IMPORT_CD: null,
        IMPORT_BAR_CD: null,
        ORIGIN_DIV: null,
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
        TAG_PRICE: null,
        SALE_PRICE: null,
        VAT_YN: $ND.C_NO,
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

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04020E1.002", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_NM: rowData.ITEM_NM,
            P_ITEM_FULL_NM: rowData.ITEM_NM,
            P_ITEM_DIV: rowData.ITEM_DIV,
            P_YEAR_DIV: rowData.YEAR_DIV,
            P_SEASON_DIV: rowData.SEASON_DIV,
            P_GENDER_DIV: rowData.GENDER_DIV,
            P_CUST_CD: CUST_CD,
            P_DEPART_CD: rowData.DEPART_CD,
            P_LINE_CD: rowData.LINE_CD,
            P_CLASS_CD: rowData.CLASS_CD,
            P_STYLE_CD: rowData.STYLE_CD,
            P_COLOR_CD: rowData.COLOR_CD,
            P_COLOR_NM: rowData.COLOR_NM,
            P_SIZE_CD: rowData.SIZE_CD,
            P_SIZE_NM: rowData.SIZE_NM,
            P_TAG_DIV: rowData.TAG_DIV,
            P_ITEM_BAR_CD: rowData.ITEM_BAR_CD,
            P_CASE_BAR_CD: rowData.CASE_BAR_CD,
            P_BOX_BAR_CD: rowData.BOX_BAR_CD,
            P_PACK_BOX_DIV: rowData.PACK_BOX_DIV,
            P_IN_UNIT_CD: rowData.IN_UNIT_CD,
            P_OUT_UNIT_CD: rowData.OUT_UNIT_CD,
            P_ITEM_NO: rowData.ITEM_NO,
            P_ITEM_SEQ: rowData.ITEM_SEQ,
            P_RETURN_BATCH_DIV: rowData.RETURN_BATCH_DIV,
            P_RETURN_CELL_NO: rowData.RETURN_CELL_NO,
            P_IMPORT_CD: rowData.IMPORT_CD,
            P_IMPORT_BAR_CD: rowData.IMPORT_BAR_CD,
            P_ORIGIN_DIV: rowData.ORIGIN_DIV,
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
            P_TAG_PRICE: rowData.TAG_PRICE,
            P_SALE_PRICE: rowData.SALE_PRICE,
            P_VAT_YN: rowData.VAT_YN,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_REMARK1: rowData.REMARK1,
            P_CMITEMBARCD_REG_YN: $NC.G_VAR.policyVal.CM310 == "1" ? $ND.C_NO : $ND.C_YES,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC04020E1.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC04020E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC04020E1.004", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC04020E1.005", "삭제 하시겠습니까?"))) {
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
        $NC.setValue("#cboItem_Div", rowData.ITEM_DIV);
        $NC.setValue("#cboYear_Div", rowData.YEAR_DIV);
        $NC.setValue("#cboSeason_Div", rowData.SEASON_DIV);
        $NC.setValue("#cboGender_Div", rowData.GENDER_DIV);
        $NC.setValue("#cboDepart_Cd", rowData.DEPART_CD);
        setLineCombo(rowData.LINE_CD);
        setClassCombo(rowData.LINE_CD, rowData.CLASS_CD);
        $NC.setValue("#edtStyle_Cd", rowData.STYLE_CD);
        $NC.setValue("#edtColor_Cd", rowData.COLOR_CD);
        $NC.setValue("#edtColor_Nm", rowData.COLOR_NM);
        $NC.setValue("#edtSize_Cd", rowData.SIZE_CD);
        $NC.setValue("#edtSize_Nm", rowData.SIZE_NM);
        $NC.setValue("#cboTag_Div", rowData.TAG_DIV);
        $NC.setValue("#edtItem_Bar_Cd", rowData.ITEM_BAR_CD);
        $NC.setValue("#edtCase_Bar_Cd", rowData.CASE_BAR_CD);
        $NC.setValue("#edtBox_Bar_Cd", rowData.BOX_BAR_CD);
        $NC.setValue("#cboPack_Box_Div", rowData.PACK_BOX_DIV);
        $NC.setValue("#cboIn_Unit_Cd", rowData.IN_UNIT_CD);
        $NC.setValue("#cboOut_Unit_Cd", rowData.OUT_UNIT_CD);
        $NC.setValue("#edtItem_No", rowData.ITEM_NO);
        $NC.setValue("#edtItem_Seq", rowData.ITEM_SEQ);
        $NC.setValue("#cboReturn_Batch_Div", rowData.RETURN_BATCH_DIV);
        $NC.setValue("#edtReturn_Cell_No", rowData.RETURN_CELL_NO);
        $NC.setValue("#edtImport_Cd", rowData.IMPORT_CD);
        $NC.setValue("#edtImport_Bar_Cd", rowData.IMPORT_BAR_CD);
        $NC.setValue("#cboOrigin_Div", rowData.ORIGIN_DIV);
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
        $NC.setValue("#edtTag_Price", rowData.TAG_PRICE);
        $NC.setValue("#edtSale_Price", rowData.SALE_PRICE);
        $NC.setValue("#chkVat_Yn", rowData.VAT_YN);
        $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV == "1");
        $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV == "2");
        $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV == "3");
        $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
        $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
        $NC.setValue("#edtRemark1", rowData.REMARK1);

        // 신규 데이터면 상품코드 수정할 수 있게 함
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtBrand_Cd");
            $NC.setEnable("#btnBrand_Cd");
            $NC.setEnable("#edtItem_Cd");
        } else {
            $NC.setEnable("#edtBrand_Cd", false);
            $NC.setEnable("#btnBrand_Cd", false);
            $NC.setEnable("#edtItem_Cd", false);
        }
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.BRAND_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04020E1.006", "브랜드코드를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtBrand_Cd");
            return false;
        }
        if ($NC.isNull(rowData.ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04020E1.007", "상품코드를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtItem_Cd");
            return false;
        }
        if ($NC.isNull(rowData.ITEM_NM)) {
            alert($NC.getDisplayMsg("JS.CMC04020E1.008", "상품명을 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtItem_Nm");
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04020E1.009", "거래구분을 선택하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#rgbDeal_Div");
            return false;
        }
        if ($NC.isNull(rowData.QTY_IN_BOX)) {
            alert($NC.getDisplayMsg("JS.CMC04020E1.010", "박스입수를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 0);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtQty_In_Box");
            return false;
        }
        if ($NC.isNull(rowData.BOX_IN_PLT)) {
            alert($NC.getDisplayMsg("JS.CMC04020E1.011", "파렛트입수를 입력하십시오."));
            $NC.setTabActiveIndex("#divRightView", 1);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtBox_In_Plt");
            return false;
        }
        if ($NC.isNull(rowData.PLT_SPLIT_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04020E1.012", "파렛트분할을 선택하십시오."));
            $NC.setTabActiveIndex("#divRightView", 1);
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboPlt_Split_Div");
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

    var columns = [];
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
        id: "YEAR_DIV_F",
        field: "YEAR_DIV_F",
        name: "연도구분"
    });
    $NC.setGridColumn(columns, {
        id: "SEASON_DIV_F",
        field: "SEASON_DIV_F",
        name: "시즌구분"
    });
    $NC.setGridColumn(columns, {
        id: "GENDER_DIV_F",
        field: "GENDER_DIV_F",
        name: "성별구분"
    });
    $NC.setGridColumn(columns, {
        id: "STYLE_CD",
        field: "STYLE_CD",
        name: "스타일코드"
    });
    $NC.setGridColumn(columns, {
        id: "COLOR_CD",
        field: "COLOR_CD",
        name: "컬러코드"
    });
    $NC.setGridColumn(columns, {
        id: "COLOR_NM",
        field: "COLOR_NM",
        name: "컬러명"
    });
    $NC.setGridColumn(columns, {
        id: "SIZE_CD",
        field: "SIZE_CD",
        name: "사이즈코드"
    });
    $NC.setGridColumn(columns, {
        id: "SIZE_NM",
        field: "SIZE_NM",
        name: "사이즈명"
    });
    $NC.setGridColumn(columns, {
        id: "TAG_DIV_F",
        field: "TAG_DIV_F",
        name: "택구분"
    });
    $NC.setGridColumn(columns, {
        id: "PACK_BOX_DIV_F",
        field: "PACK_BOX_DIV_F",
        name: "포장박스구분"
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
        id: "ITEM_NO",
        field: "ITEM_NO",
        name: "상품번호"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SEQ",
        field: "ITEM_SEQ",
        name: "상품순번"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_BATCH_DIV_F",
        field: "RETURN_BATCH_DIV_F",
        name: "반품차수"
    });
    $NC.setGridColumn(columns, {
        id: "RETURN_CELL_NO",
        field: "RETURN_CELL_NO",
        name: "반품셀번호"
    });
    $NC.setGridColumn(columns, {
        id: "IMPORT_CD",
        field: "IMPORT_CD",
        name: "수입상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "IMPORT_BAR_CD",
        field: "IMPORT_BAR_CD",
        name: "수입상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "ORIGIN_DIV_F",
        field: "ORIGIN_DIV_F",
        name: "원산지구분"
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
        id: "TAG_PRICE",
        field: "TAG_PRICE",
        name: "택단가",
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
        queryId: "CMC04020E1.RS_MASTER",
        sortCol: "ITEM_CD",
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

    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);

    if ($NC.getTabActiveIndex("#divRightView") == 2) {
        onGetBIImage("#imgBIItem", "04", rowData.BRAND_CD, rowData.ITEM_CD);
    }

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
                P_VIEW_DIV: "1"
            }, onCustBrandPopup);
            return;
        case "ITEM_CD":
            rowData.ITEM_CD = args.val;
            break;
        case "ITEM_NM":
            rowData.ITEM_NM = args.val;
            break;
        case "ITEM_DIV":
            rowData.ITEM_DIV = args.val;
            rowData.ITEM_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "YEAR_DIV":
            rowData.YEAR_DIV = args.val;
            rowData.YEAR_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "SEASON_DIV":
            rowData.SEASON_DIV = args.val;
            rowData.SEASON_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "GENDER_DIV":
            rowData.GENDER_DIV = args.val;
            rowData.GENDER_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
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
        case "STYLE_CD":
            rowData.STYLE_CD = args.val;
            break;
        case "COLOR_CD":
            rowData.COLOR_CD = args.val;
            break;
        case "COLOR_NM":
            rowData.COLOR_NM = args.val;
            break;
        case "SIZE_CD":
            rowData.SIZE_CD = args.val;
            break;
        case "SIZE_NM":
            rowData.SIZE_NM = args.val;
            break;
        case "TAG_DIV":
            rowData.TAG_DIV = args.val;
            rowData.TAG_DIV_F = $NC.getValueCombo(args.view, "F");
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
        case "PACK_BOX_DIV":
            rowData.PACK_BOX_DIV = args.val;
            rowData.PACK_BOX_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "ITEM_NO":
            rowData.ITEM_NO = args.val;
            break;
        case "ITEM_SEQ":
            rowData.ITEM_SEQ = args.val;
            break;
        case "RETURN_BATCH_DIV":
            rowData.RETURN_BATCH_DIV = args.val;
            rowData.RETURN_BATCH_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "RETURN_CELL_NO":
            rowData.RETURN_CELL_NO = args.val;
            break;
        case "IMPORT_CD":
            rowData.IMPORT_CD = args.val;
            break;
        case "IMPORT_BAR_CD":
            rowData.IMPORT_BAR_CD = args.val;
            break;
        case "ORIGIN_DIV":
            rowData.ORIGIN_DIV = args.val;
            rowData.ORIGIN_DIV_F = $NC.getValueCombo(args.view, "F");
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
                alert($NC.getDisplayMsg("JS.CMC04020E1.013", "소박스입수에 1이상의 정수를 입력하십시오."));
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
                alert($NC.getDisplayMsg("JS.CMC04020E1.014", "박스입수에 1이상의 정수를 입력하십시오."));
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
        case "TAG_PRICE":
            if ($NC.isNull(args.val)) {
                rowData.TAG_PRICE = "0";
                $NC.setValue(args.view, rowData.TAG_PRICE);
            } else {
                rowData.TAG_PRICE = args.val;
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
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC04020E1.015", "거래일자를 정확히 입력하십시오."));
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC04020E1.016", "종료일자를 정확히 입력하십시오."));
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
        addEmpty: true,
        fullNameField: "CLASS_CD_F",
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
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "ITEM_CD", true)) {
        $NC.setEnableGroup("#divRightView", true);
        $NC.setEnable("#edtBrand_Cd", false);
        $NC.setEnable("#btnBrand_Cd", false);
        $NC.setEnable("#edtItem_Cd", false);
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

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC04020E1.017", "이미지를 삭제할 상품을 선택 후 삭제처리 하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        alert($NC.getDisplayMsg("JS.CMC04020E1.018", "신규 데이터입니다. 저장 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC04020E1.019", "선택한 상품의 이미지를 삭제하시겠습니까?"))) {
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
        alert($NC.getDisplayMsg("JS.CMC04020E1.020", "로고를 업로드할 상품을 선택 후 파일업로드 처리 하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        alert($NC.getDisplayMsg("JS.CMC04020E1.018", "신규 데이터입니다. 저장 후 처리하십시오."));
        return;
    }

    $NC.showUploadFilePopup(".jpg, .png", function(view, fileFullName, fileName) {
        var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (fileExt != "jpg" && fileExt != "png") {
            alert($NC.getDisplayMsg("JS.CMC04020E1.021", "이미지 파일(*.jpg, *.png) 파일을 선택하십시오."));
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
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            $(selector).prop("src", null);
            alert(oMsg);
        } else {
            $(selector).prop("src", resultData.O_IMAGE_CONTENT);
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

    setInputValue("#grdMaster");
    $NC.setEnableGroup("#divRightView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */
function showQUserCustPopup() {

    $NP.showUserCustPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onQUserCustPopup, function() {
        $NC.setFocus("#edtQCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onQUserCustPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtQCust_Nm", resultInfo.CUST_NM);
    } else {
        $NC.setValue("#edtQCust_Cd");
        $NC.setValue("#edtQCust_Nm");
        $NC.setFocus("#edtQCust_Cd", true);
    }
    onChangingCondition();

    // 고객사 값 변경시 대분류 재 설정
    setDepartCombo();

}

/**
 * 검색조건의 브랜드 검색 이미지 클릭
 */
function showQCustBrandPopup() {

    $NP.showCustBrandPopup({
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
        P_BRAND_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onQCustBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과 / 검색 실패 했을 경우(not found)
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
 * 검색조건의 브랜드 검색 이미지 클릭
 */
function showCustBrandPopup() {

    $NP.showCustBrandPopup({
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
        P_BRAND_CD: $ND.C_ALL,
        P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
    }, onCustBrandPopup, function() {
        $NC.setFocus("#edtBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과 / 검색 실패 했을 경우(not found)
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
        rowData.BRAND_NM = "";
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

function btnSetQtyInBoxOnClick() {

    var QTY_IN_BOX = $NC.getValue("#edtQty_In_Box");
    if ($NC.isNull(QTY_IN_BOX) || Number(QTY_IN_BOX) < 1) {
        alert($NC.getDisplayMsg("JS.CMC04020E1.014", "박스입수에 1이상의 정수를 입력하십시오."));
        $NC.setFocus("#edtQty_In_Box");
        return;
    }

    // 동일 스타일 검색
    var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
        searchKey: "STYLE_CD",
        searchVal: $NC.getValue("#edtStyle_Cd")
    });

    var rowData;
    for (var rIndex = 0, rCount = searchRows.length; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(searchRows[rIndex]);
        rowData.QTY_IN_BOX = QTY_IN_BOX;
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            rowData.CRUD = $ND.C_DV_CRUD_U;
        }
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
}