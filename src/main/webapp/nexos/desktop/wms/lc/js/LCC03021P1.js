/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC03021P1
 *  프로그램명         : 파렛트ID병합등록 팝업 (의류)
 *  프로그램설명       : 파렛트ID병합등록 팝업 (의류) 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-08-07
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-07    ASETEC           신규작성
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
                container: "#divDetailView",
                grids: "#grdDetail"
            },
            viewSecond: {
                container: "#divSubView",
                grids: "#grdSub"
            },
            viewType: "v",
            viewFixed: 180,
            exceptHeight: function() {
                return $NC.getViewHeight("#ctrPopupView");
            }
        },
        // 마스터 데이터
        masterData: null,
        detailData: null,
        MOVE_DIV: "61",
        DIV_LOC: "_____", // '_' 다섯개
        // 체크할 정책 값
        policyVal: {
            CM120: "", // 로케이션표시정책
            CM121: "", // 로케이션 존 길이
            CM122: "", // 로케이션 행 길이
            CM123: "", // 로케이션 열 길이
            CM124: "", // 로케이션 단 길이
            LS210: "" // 재고 관리 기준
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기
    $("#btnNew").click(_New); // 데이터 추가
    $("#btnDelete").click(_Delete); // 데이터 삭제
    $("#btnSave").click(_Save); // 저장
    $("#btnQLocation_Cd").click(showQLocationPopup); // 현재고 검색시 사용되는 로케이션 검색 버튼 클릭
    $("#btnLocation_Cd").click(showLocationPopup); // 병합 로케이션 값 설정에 사용되는 로케이션 검색 버튼
    $("#btnSearchStock").click(_Inquiry); // 현재고검색 버튼 클릭
    $("#btnQItem_Cd").click(showQItemPopup); // 현재고 검색의 상품검색 버튼 클릭
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    $NC.setEnable("#edtCenter_Cd_F", false); // 물류센터 비활성화
    $NC.setEnable("#edtBu_Cd", false); // 사업부 비활성화
    $NC.setEnable("#edtMove_No", false); // 이동번호 비활성화

    $NC.setInitDatePicker("#dtpMove_Date"); // 병합일자
    $NC.setInitDatePicker("#dtpQValid_Date", null, "N"); // 유효기한
    $NC.setInitDatePicker("#dtpQStock_Date", null, "N"); // 재고일자

    // 그리드 초기화
    grdDetailInitialize();
    grdSubInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_STATE",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_STATE",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "1",
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_YEAR_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "YEAR_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_SEASON_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "SEASON_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 상품상태 콤보 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_State",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE)
        });
        // 조회조건 - 연도구분 세팅
        $NC.setInitComboData({
            selector: "#cboQYear_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_YEAR_DIV),
            addAll: true,
            multiSelect: true
        });
        // 조회조건 - 시즌구분 세팅
        $NC.setInitComboData({
            selector: "#cboQSeason_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SEASON_DIV),
            addAll: true,
            multiSelect: true
        });
        // 조회조건 - 상품구분 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_DIV),
            addAll: true,
            multiSelect: true
        });
    });

    // 정책 값 세팅
    setPolicyValInfo();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);

    // 신규 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {

        $NC.setValue("#dtpMove_Date", $NC.G_VAR.G_PARAMETER.P_MOVE_DATE);

        var MOVE_DATE = $NC.getValue("#dtpMove_Date");
        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            MOVE_DATE: MOVE_DATE,
            MOVE_NO: "",
            MOVE_DIV: $NC.G_VAR.MOVE_DIV,
            TAG_DIV: "",
            REMARK1: "",
            CRUD: $ND.C_DV_CRUD_C
        };
    }
    // 예정 -> 등록, 등록 수정
    else {
        // 마스터 데이터 세팅
        var dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;
        $NC.setValue("#dtpMove_Date", dsMaster.MOVE_DATE);
        $NC.setValue("#edtMove_No", dsMaster.MOVE_NO);
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);

        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            CENTER_CD: dsMaster.CENTER_CD,
            BU_CD: dsMaster.BU_CD,
            MOVE_DATE: dsMaster.MOVE_DATE,
            MOVE_NO: dsMaster.MOVE_NO,
            MOVE_DIV: dsMaster.MOVE_DIV,
            TAG_DIV: dsMaster.TAG_DIV,
            REMARK1: dsMaster.REMARK1,
            CRUD: $ND.C_DV_CRUD_R
        };

        // SUB 데이터 세팅
        var dsSub = $NC.G_VAR.G_PARAMETER.P_SUB_DS;
        var rowData, newRowData;
        G_GRDSUB.data.beginUpdate();
        try {
            for (var rIndex = 0, rCount = dsSub.length; rIndex < rCount; rIndex++) {
                rowData = dsSub[rIndex];
                newRowData = {
                    CENTER_CD: rowData.CENTER_CD,
                    BU_CD: rowData.BU_CD,
                    MOVE_DATE: rowData.MOVE_DATE,
                    MOVE_NO: rowData.MOVE_NO,
                    LINE_NO: rowData.LINE_NO,
                    LOCATION_CD: rowData.LOCATION_CD,
                    STOCK_DATE: rowData.STOCK_DATE,
                    STOCK_IN_GRP: rowData.STOCK_IN_GRP,
                    STOCK_ID: rowData.STOCK_ID,
                    MOVE_DIV: rowData.MOVE_DIV,
                    BRAND_CD: rowData.BRAND_CD,
                    BRAND_NM: rowData.BRAND_NM,
                    ITEM_CD: rowData.ITEM_CD,
                    ITEM_STATE: rowData.ITEM_STATE,
                    ITEM_STATE_F: rowData.ITEM_STATE_F,
                    ITEM_LOT: rowData.ITEM_LOT,
                    VALID_DATE: rowData.VALID_DATE,
                    BATCH_NO: rowData.BATCH_NO,
                    PALLET_ID: rowData.PALLET_ID,
                    STOCK_QTY: rowData.STOCK_QTY,
                    PSTOCK_QTY: rowData.PSTOCK_QTY,
                    MLOCATION_CD: rowData.MLOCATION_CD,
                    MSTOCK_ID: rowData.MSTOCK_ID,
                    MPALLET_ID: rowData.MPALLET_ID,
                    MSTOCK_QTY: rowData.MSTOCK_QTY,
                    ITEM_NM: rowData.ITEM_NM,
                    ITEM_SPEC: rowData.ITEM_SPEC,
                    QTY_IN_BOX: rowData.QTY_IN_BOX,
                    BOX_WEIGHT: rowData.BOX_WEIGHT,
                    MSTOCK_BOX: rowData.MSTOCK_BOX,
                    MSTOCK_EA: rowData.MSTOCK_EA,
                    MSTOCK_WEIGHT: rowData.MSTOCK_WEIGHT,
                    id: $NC.getGridNewRowId(),
                    CRUD: $ND.C_DV_CRUD_R
                };
                G_GRDSUB.data.addItem(newRowData);
            }
        } finally {
            G_GRDSUB.data.endUpdate();
        }

        // 수정일 경우 비활성화
        $NC.setEnable("#dtpMove_Date", false);
        // $NC.setEnable("#edtRemark1", false);

        $NC.setGridSelectRow(G_GRDSUB, 0);

        if (G_GRDSUB.data.getLength() > 0) {
            $NC.setValue("#edtLocation_Cd", G_GRDSUB.data.getItem(G_GRDSUB.lastRow).MLOCATION_CD);
            $NC.setEnable("#edtLocation_Cd", false);
        }
    }

    // 택구분 콤보 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "TAG_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboTag_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        selectOption: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE ? "F" : null,
        onComplete: function() {
            if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_ENTRY_CREATE) {
                $NC.G_VAR.masterData.TAG_DIV = $NC.getValue("#cboTag_Div");
            } else {
                $NC.setValue("#cboTag_Div", $NC.G_VAR.masterData.TAG_DIV);
            }
        }
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
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_OK);
    $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "ZONE_CD":
            if ($NC.isNull(val)) {
                $NC.setValue("#edtQZone_Nm");
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM121)) {
                alert($NC.getDisplayMsg("JS.LCC03021P1.001", "로케이션 존코드 길이(" + $NC.G_VAR.policyVal.CM121 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM121));
                $NC.setValue("#edtQZone_Cd");
                $NC.setValue("#edtQZone_Nm");
                $NC.setFocus("#edtQZone_Cd", true);
                break;
            }
            $NP.onZoneChange(val, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: val,
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: "",
                P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, onQLocationPopup);
            return;
        case "BANK_CD":
            if ($NC.isNull(val)) {
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM122)) {
                alert($NC.getDisplayMsg("JS.LCC03021P1.002", "로케이션 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM122));
                $NC.setValue("#edtQBank_Cd");
                $NC.setFocus("#edtQBank_Cd", true);
            }
            break;
        case "BAY_CD":
            if ($NC.isNull(val)) {
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM123)) {
                alert($NC.getDisplayMsg("JS.LCC03021P1.003", "로케이션 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM123));
                $NC.setValue("#edtQBay_Cd");
                $NC.setFocus("#edtQBay_Cd", true);
            }
            break;
        case "LEV_CD":
            if ($NC.isNull(val)) {
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM124)) {
                alert($NC.getDisplayMsg("JS.LCC03021P1.004", "로케이션 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM124));
                $NC.setValue("#edtQLev_Cd");
                $NC.setFocus("#edtQLev_Cd", true);
            }
            break;
        case "STOCK_DATE":
            if ($NC.isNotNull(val)) {
                $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC03021P1.005", "입고일자를 정확히 입력하십시오."), "N");
            }
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(val)) {
                $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC03021P1.006", "유통기한를 정확히 입력하십시오."), "N");
            }
            break;
    }

    // 화면클리어
    // onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    masterDataOnChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * 조회
 */
function _Inquiry() {

    // 현재 수정모드면
    if (G_GRDSUB.view.getEditorLock().isActive()) {
        G_GRDSUB.view.getEditorLock().commitCurrentEdit();
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var STOCK_DATE = $NC.getValue("#dtpQStock_Date");
    var ZONE_CD = $NC.getValue("#edtQZone_Cd");
    var BANK_CD = $NC.getValue("#edtQBank_Cd");
    var BAY_CD = $NC.getValue("#edtQBay_Cd");
    var LEV_CD = $NC.getValue("#edtQLev_Cd");
    var TAG_DIV = $NC.getValue("#cboTag_Div");
    var YEAR_DIV = $NC.getValue("#cboQYear_Div");
    var SEASON_DIV = $NC.getValue("#cboQSeason_Div");
    var ITEM_DIV = $NC.getValue("#cboQItem_Div");

    if ($NC.isNull(ZONE_CD)) {
        ZONE_CD = $NC.G_VAR.DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM121);
    }

    if ($NC.isNull(BANK_CD)) {
        BANK_CD = $NC.G_VAR.DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM122);
    }

    if ($NC.isNull(BAY_CD)) {
        BAY_CD = $NC.G_VAR.DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM123);
    }

    if ($NC.isNull(LEV_CD)) {
        LEV_CD = $NC.G_VAR.DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM124);
    }

    var LOCATION_CD = $NC.getDisplayLocation(ZONE_CD, BANK_CD, BAY_CD, LEV_CD, $NC.G_VAR.policyVal.CM120);

    $NC.setInitGridVar(G_GRDDETAIL);

    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_LOCATION_CD: LOCATION_CD,
        P_STOCK_DATE: STOCK_DATE,
        P_TAG_DIV: TAG_DIV,
        P_YEAR_DIV: YEAR_DIV,
        P_SEASON_DIV: SEASON_DIV,
        P_ITEM_DIV: ITEM_DIV
    };
    // 데이터 조회
    $NC.serviceCall("/LCC03020E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

/**
 * 상품추가 버튼 클릭 이벤트 처리
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 선택 데이터 검색 -> Indexes
    var checkedRows = $NC.getGridSearchRows(G_GRDDETAIL, {
        searchKey: "CHECK_YN",
        searchVal: $ND.C_YES
    });
    if (checkedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.008", "추가할 재고내역 데이터를 선택하십시오."));
        return;
    }

    // 기등록 체크 키
    var searchKey = [
        "BRAND_CD",
        "ITEM_CD",
        "ITEM_STATE",
        "ITEM_LOT",
        "VALID_DATE",
        "BATCH_NO",
        "LOCATION_CD",
        "PALLET_ID"
    ];

    var addedCount = 0;
    var rowData, newRowData;
    G_GRDSUB.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = checkedRows.length; rIndex < rCount; rIndex++) {
            // 선택 데이터
            rowData = G_GRDDETAIL.data.getItem(checkedRows[rIndex]);
            // 기등록 체크
            if ($NC.getGridSearchRow(G_GRDSUB, {
                searchKey: searchKey,
                searchVal: [
                    rowData.BRAND_CD,
                    rowData.ITEM_CD,
                    rowData.ITEM_STATE,
                    rowData.ITEM_LOT,
                    rowData.VALID_DATE,
                    rowData.BATCH_NO,
                    rowData.LOCATION_CD,
                    rowData.PALLET_ID
                ]
            }) > -1) {
                continue;
            }
            // 추가할 데이터
            newRowData = {
                LINE_NO: "",
                LOCATION_CD: rowData.LOCATION_CD,
                BRAND_CD: rowData.BRAND_CD,
                BRAND_NM: rowData.BRAND_NM,
                ITEM_CD: rowData.ITEM_CD,
                ITEM_BAR_CD: rowData.ITEM_BAR_CD,
                ITEM_STATE: rowData.ITEM_STATE,
                ITEM_LOT: rowData.ITEM_LOT,
                VALID_DATE: rowData.VALID_DATE,
                STOCK_DATE: rowData.STOCK_DATE,
                BATCH_NO: rowData.BATCH_NO,
                PALLET_ID: rowData.PALLET_ID,
                STOCK_QTY: rowData.STOCK_QTY,
                PSTOCK_QTY: rowData.PSTOCK_QTY,
                MSTOCK_QTY: rowData.PSTOCK_QTY,
                ITEM_NM: rowData.ITEM_NM,
                ITEM_SPEC: rowData.ITEM_SPEC,
                QTY_IN_BOX: rowData.QTY_IN_BOX,
                MLOCATION_CD: "",
                ITEM_STATE_F: rowData.ITEM_STATE_F,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };
            G_GRDSUB.data.addItem(newRowData);
            addedCount++;
        }
    } finally {
        G_GRDSUB.data.endUpdate();
    }

    // 선택한 행이 모두 이미 지시내역 그리드에 존재할 경우
    if (addedCount == 0) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.009", "선택한 상품은 이미 추가된 재고내역입니다."));
        return;
    }

    // 택구분 비활성화
    $NC.setEnable("#cboTag_Div", false);
    $NC.setGridSelectRow(G_GRDSUB, G_GRDSUB.data.getLength() - 1);

    // 수정 상태로 변경
    G_GRDSUB.lastRowModified = true;
}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Save() {

    if (G_GRDSUB.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.010", "저장할 데이터가 없습니다."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.011", "물류센터를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.012", "사업부를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.MOVE_DATE)) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.013", "먼저 병합일자를 입력하십시오."));
        $NC.setFocus("#dtpMove_Date");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }

    var MLOCATION_CD = $NC.getValue("#edtLocation_Cd");
    if ($NC.isNull(MLOCATION_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.014", "먼저 병합로케이션을 선택하십시오."));
        $NC.setFocus("#edtLocation_Cd");
        return;
    }

    var dsD = [];
    var dsC = [];
    var dsSub, rowData;
    var dsTarget = G_GRDSUB.data.getItems();
    for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        if (!validateSubData(rIndex, rowData)) {
            return;
        }
        if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsSub = dsD;
        } else {
            dsSub = dsC;
        }

        dsSub.push({
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_MOVE_DATE: $NC.G_VAR.masterData.MOVE_DATE,
            P_MOVE_NO: $NC.G_VAR.masterData.MOVE_NO,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_LINE_NO: rowData.LINE_NO,
            P_MOVE_DIV: $NC.G_VAR.masterData.MOVE_DIV,
            P_LOCATION_CD: rowData.LOCATION_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_LOT: rowData.ITEM_LOT,
            P_VALID_DATE: $NC.isNull(rowData.VALID_DATE) ? "" : rowData.VALID_DATE,
            P_BATCH_NO: $NC.isNull(rowData.BATCH_NO) ? "" : rowData.BATCH_NO,
            P_STOCK_DATE: $NC.isNull(rowData.STOCK_DATE) ? "" : rowData.STOCK_DATE,
            P_STOCK_QTY: rowData.STOCK_QTY,
            P_MSTOCK_QTY: rowData.MSTOCK_QTY,
            P_MLOCATION_CD: MLOCATION_CD,
            P_PALLET_ID: $NC.isNull(rowData.PALLET_ID) ? "" : rowData.PALLET_ID,
            P_CRUD: rowData.CRUD
        });
    }

    // 생성된 파렛트ID를 그대로 사용하기 위해
    // 삭제할 데이터를 마지막에 추가
    dsSub = dsC.concat(dsD);

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_C) {
        if (dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC03021P1.015", "저장할 지시내역 정보가 없습니다."));
            return;
        }
    } else {
        if ($NC.G_VAR.masterData.CRUD != $ND.C_DV_CRUD_U && dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC03021P1.016", "수정 후 저장하십시오."));
            return;
        }
    }

    $NC.serviceCall("/LCC03020E0/save.do", {
        P_DS_MASTER: {
            P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_MOVE_DATE: $NC.G_VAR.masterData.MOVE_DATE,
            P_MOVE_NO: $NC.G_VAR.masterData.MOVE_NO,
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_CRUD: $NC.G_VAR.masterData.CRUD
        },
        P_DS_SUB: dsSub,
        P_PROCESS_CD: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 상품삭제 버튼 클릭 이벤트 처리
 */
function _Delete() {

    if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.017", "삭제할 병합 데이터를 선택하십시오."));
        return;
    }

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제, 그외 CRUD를 "D"로 변경
    if ($NC.deleteGridRowData(G_GRDSUB, rowData, true) == 0) {
        // 지시데이터가 모두 삭제되면 택구분 다시 활성화
        $NC.setEnable("#cboTag_Div");
    }
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

    switch (args.col) {
        case "LOCATION_CD":
            $NP.onLocationChange(args.val, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: args.val,
                P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, onLocationPopup);
            return;
        case "MOVE_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LCC03021P1.018", "병합일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.MOVE_DATE = $NC.getValue("#dtpMove_Date");
            break;
        case "REMARK1":
            $NC.G_VAR.masterData.REMARK1 = args.val;
            break;
        case "TAG_DIV":
            $NC.clearGridData(G_GRDDETAIL);
            $NC.setValue("#edtQItem_Cd");
            $NC.setValue("#edtQItem_Nm");
            $NC.G_VAR.masterData.TAG_DIV = args.val;
            return;
        default:
            // 마스터 데이터 변경이 아닐 경우는 CRUD 변경하지 않기 위해 RETURN
            return;
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 * @param view
 *        대상 Object
 * @param args
 *        grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

    var grdObject = $NC.getGridObject(args.grid);
    if (!grdObject.isValid) {
        return;
    }

    var columnId = grdObject.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
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
        id: "FLOCATION_CD",
        field: "FLOCATION_CD",
        name: "고정로케이션",
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
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDDETAIL, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

/**
 * 상단그리드(상품정보) 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LCC03020E1.RS_SUB1",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
    G_GRDDETAIL.view.onClick.subscribe(grdDetailOnClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

/**
 * 상단 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDDETAIL, e, args);
            break;
    }
}

/**
 * 상단 그리드의 행 체크 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnClick(e, args) {

    var columnId = G_GRDDETAIL.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDDETAIL, e, args);
            break;
    }
}

function grdSubOnGetColumns() {

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
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "MSTOCK_QTY",
        field: "MSTOCK_QTY",
        name: "병합수량",
        cssClass: "styRight",
        // 기본 editorOptions 자동 지정이 아닌 임의 지정
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions({
            formatterType: "FLOAT_QTY",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "재고로케이션",
        cssClass: "styCenter"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubOnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDSUB, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

/**
 * 파렛트ID병합 지시 데이터 그리드 초기값 설정
 */
function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 4

    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "LCC03020E1.RS_T1_DETAIL",
        sortCol: "LOCATION_CD",
        gridOptions: options,
        canExportExcel: false,
        onFilter: grdSubOnFilter
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
    G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

/**
 * 파렛트ID병합 지시 데이터 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

/**
 * 파렛트ID병합 지시 데이터 그리드 편집 불가 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSubOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규일 경우 모두 수정 가능, 그외 아래 컬럼만 수정 가능
    if (rowData.CRUD == $ND.C_DV_CRUD_R) {
        switch (args.column.id) {
            default:
                return false;
        }
    }
    return true;
}

/**
 * 파렛트ID병합 지시 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);
}

/**
 * grdSub 데이터(파렛트ID병합 지시 데이터) 필터링 이벤트
 */
function grdSubOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

/**
 * 현재고 그리드 입력 체크
 */
function grdSubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUB, row)) {
        return true;
    }

    var rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if (!validateSubData(row, rowData)) {
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUB, rowData);
    return true;
}

function validateSubData(row, rowData) {

    if ($NC.isNull(rowData.MSTOCK_QTY) || Number(rowData.MSTOCK_QTY) <= 0) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.019", "병합수량에 0보다 큰 수량을 입력하십시오."));
        $NC.setFocusGrid(G_GRDSUB, row, "MSTOCK_QTY", true);
        return false;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_C && Number(rowData.PSTOCK_QTY) < Number(rowData.MSTOCK_QTY)) {
        alert($NC.getDisplayMsg("JS.LCC03021P1.020", "재고수량 보다 많은 수량을 입력하실 수 없습니다."));
        $NC.setFocusGrid(G_GRDSUB, row, "MSTOCK_QTY", true);
        return false;
    }
    return true;
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "BRAND_CD",
        "ITEM_CD",
        "ITEM_STATE",
        "ITEM_LOT",
        "VALID_DATE",
        "BATCH_NO",
        "LOCATION_CD"
    ]);
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD
    }, function() {
        // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
        if ($NC.G_VAR.policyVal.LS210 == "2") {
            // 컬럼 표시 조정
            grdDetailOnSetColumns();
            grdSubOnSetColumns();
        }
    });
}

/**
 * 로케이션 검색 클릭 이벤트
 */
function showQLocationPopup() {

    $NP.showLocationPopup({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: $ND.C_ALL,
        // 1 - 일반, 2 - 유통가공, 3 - 보세
        P_ZONE_DIV_ATTR01_CD: "1"
    }, onQLocationPopup, function() {
        $NC.setFocus("#edtQZone_Cd", true);
    });
}

/**
 * 로케이션 검색 정상 처리 콜백
 * 
 * @param resultInfo
 */
function onQLocationPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQZone_Cd", resultInfo.ZONE_CD);
        $NC.setValue("#edtQZone_Nm", resultInfo.ZONE_NM);
        $NC.setValue("#edtQBank_Cd", resultInfo.BANK_CD);
        $NC.setValue("#edtQBay_Cd", resultInfo.BAY_CD);
        $NC.setValue("#edtQLev_Cd", resultInfo.LEV_CD);
    } else {
        $NC.setValue("#edtQZone_Cd");
        $NC.setValue("#edtQZone_Nm");
        $NC.setFocus("#edtQZone_Cd", true);
    }
}

/**
 * 로케이션 검색 클릭 이벤트
 */
function showLocationPopup() {

    $NP.showLocationPopup({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: $ND.C_ALL,
        // 1 - 일반, 2 - 유통가공, 3 - 보세
        P_ZONE_DIV_ATTR01_CD: "1"
    }, onLocationPopup, function() {
        $NC.setFocus("#edtLocation_Cd", true);
    });
}

/**
 * 로케이션 검색 정상 처리 콜백
 * 
 * @param resultInfo
 */
function onLocationPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtLocation_Cd", resultInfo.LOCATION_CD);
    } else {
        $NC.setValue("#edtLocation_Cd");
        $NC.setFocus("#edtLocation_Cd", true);
    }
}

/**
 * 상품 검색 팝업 표시
 */
function showQItemPopup() {

    $NP.showItemPopup({
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        P_ITEM_CD: $ND.C_ALL,
        P_VIEW_DIV: "2",
        P_DEPART_CD: $ND.C_ALL,
        P_LINE_CD: $ND.C_ALL,
        P_CLASS_CD: $ND.C_ALL,
        P_TAG_DIV: $NC.getValue("#cboTag_Div")
    }, onQItemPopup, function() {
        $NC.setFocus("#edtQItem_Cd", true);
    });
}

/**
 * 그리드에서 상품 선택했을 경우 처리
 * 
 * @param resultInfo
 */
function onQItemPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
        $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
        $NC.setFocus("#edtQZone_Cd", true);
    } else {
        $NC.setValue("#edtQItem_Cd");
        $NC.setValue("#edtQItem_Nm");
        $NC.setFocus("#edtQItem_Cd", true);
    }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtBu_Cd");

    $NP.showBuBrandPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: $ND.C_ALL
    }, onBuBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 브랜드 검색 결과
 * 
 * @param resultInfo
 */
function onBuBrandPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
        $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
    } else {
        $NC.setValue("#edtQBrand_Cd");
        $NC.setValue("#edtQBrand_Nm");
        $NC.setFocus("#edtQBrand_Cd", true);
    }
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");

}
