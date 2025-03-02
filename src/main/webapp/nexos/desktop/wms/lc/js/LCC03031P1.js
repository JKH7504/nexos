/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC03031P1
 *  프로그램명         : 어소트재고이동등록 팝업
 *  프로그램설명       : 어소트재고이동등록 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-08-08
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-08-08    ASETEC           신규작성
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
            exceptHeight: $NC.getViewHeight("#ctrPopupView")
        },
        // 마스터 데이터
        masterData: null,
        MOVE_DIV: "11",
        DIV_LOC: "_____", // '_' 다섯개
        // 체크할 정책 값
        policyVal: {
            CM120: "", // 로케이션표시정책
            CM121: "", // 로케이션 존 길이
            CM122: "", // 로케이션 행 길이
            CM123: "", // 로케이션 열 길이
            CM124: "" // 로케이션 단 길이
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnNew").click(_New); // 그리드 행 추가 버튼
    $("#btnDelete").click(_Delete); // 그리드 행 삭제버튼
    $("#btnSave").click(_Save); // 저장 버튼
    $("#btnQItem_Cd").click(showItemPopup); // 현재고 검색의 상품검색 버튼 클릭

    $("#btnQLocation_Cd").click(showQLocationPopup);
    $("#btnLocation_Cd").click(showLocationPopup);
    $("#btnSearchStock").click(_Inquiry);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    $NC.setInitDatePicker("#dtpMove_Date"); // 이동일자
    $NC.setInitDatePicker("#dtpQStock_Date", null, "N"); // 재고일자

    // 그리드 초기화
    grdDetailInitialize();
    grdSubInitialize();

    // 상품상태 콤보 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_STATE",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "1,3",
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQItem_State",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: false
    });

    // 정책 값 세팅
    setPolicyValInfo();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setEnable("#edtCenter_Cd_F", false);
    $NC.setEnable("#edtBu_Cd", false);
    $NC.setEnable("#edtMove_No", false);

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtCenter_Cd", $NC.G_VAR.G_PARAMETER.P_CENTER_CD);
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
                    STOCK_IN_GRP: rowData.STOCK_IN_GRP,
                    MOVE_DIV: rowData.MOVE_DIV,
                    BRAND_CD: rowData.BRAND_CD,
                    BRAND_NM: rowData.BRAND_NM,
                    ITEM_STATE: rowData.ITEM_STATE,
                    ITEM_LOT: rowData.ITEM_LOT,
                    VALID_DATE: rowData.VALID_DATE,
                    BATCH_NO: rowData.BATCH_NO,
                    STOCK_QTY: rowData.STOCK_QTY,
                    MLOCATION_CD: rowData.MLOCATION_CD,
                    MSTOCK_QTY: rowData.MSTOCK_QTY,
                    ITEM_STATE_F: rowData.ITEM_STATE_F,
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

        $NC.setGridSelectRow(G_GRDSUB, 0);
    }
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
                alert($NC.getDisplayMsg("JS.LCC03031P1.001", "로케이션 존코드 길이(" + $NC.G_VAR.policyVal.CM121 + "자리) 를 정확히 입력하여 주십시오.",
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
                // 1 - 일반, 2- 유통가공, 3 - 보세
                P_ZONE_DIV_ATTR01_CD: getZoneDivAttr01Cd($NC.getValue("#cboQItem_State"))
            }, onQLocationPopup, {
                errorMessage: $NC.getDisplayMsg("JS.LCC03031P1.002", "선택된 상품 상태와 매칭되는 존이 검색되지 않았습니다.")
            });
            return;
        case "BANK_CD":
            if ($NC.isNull(val)) {
                break;
            }
            if (val.length != Number($NC.G_VAR.policyVal.CM122)) {
                alert($NC.getDisplayMsg("JS.LCC03031P1.003", "로케이션 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리) 를 정확히 입력하여 주십시오.",
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
                alert($NC.getDisplayMsg("JS.LCC03031P1.004", "로케이션 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리) 를 정확히 입력하여 주십시오.",
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
                alert($NC.getDisplayMsg("JS.LCC03031P1.005", "로케이션 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리) 를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.policyVal.CM124));
                $NC.setValue("#edtQLev_Cd");
                $NC.setFocus("#edtQLev_Cd", true);
            }
            break;
        case "STOCK_DATE":
            if ($NC.isNotNull(val)) {
                $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC03031P1.006", "입고일자를 정확히 입력하십시오."));
            }
            break;
        case "ITEM_STATE":
            if ($NC.isNotNull(val)) {
                // 상품 상태가 변경되면 로케이션 조건 초기화
                $NC.setValue("#edtQZone_Cd");
                $NC.setValue("#edtQZone_Nm");
                $NC.setValue("#edtQBank_Cd");
                $NC.setValue("#edtQBay_Cd");
                $NC.setValue("#edtQLev_Cd");
                $NC.setValue("#edtLocation_Cd");
                $NC.setFocus("#edtQZone_Cd", true);
            }
            break;
    }

    // 화면클리어
    onChangingCondition();
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

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var ITEM_LOT = $NC.getValue("#edtQItem_Lot");
    var STOCK_DATE = $NC.getValue("#dtpQStock_Date");
    var ZONE_CD = $NC.getValue("#edtQZone_Cd");
    var BANK_CD = $NC.getValue("#edtQBank_Cd");
    var BAY_CD = $NC.getValue("#edtQBay_Cd");
    var LEV_CD = $NC.getValue("#edtQLev_Cd");

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
        P_ITEM_LOT: ITEM_LOT,
        P_LOCATION_CD: LOCATION_CD,
        P_STOCK_DATE: STOCK_DATE
    };
    // 데이터 조회
    $NC.serviceCall("/LCC03030E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
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
        alert($NC.getDisplayMsg("JS.LCC03031P1.008", "추가할 재고내역 데이터를 선택하십시오."));
        return;
    }

    var LOCATION_CD = $NC.getValue("#edtLocation_Cd");
    if ($NC.isNull(LOCATION_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03031P1.009", "상품추가 시 먼저 이동할 로케이션을 선택하십시오."));
        $NC.setFocus("#edtLocation_Cd");
        return;
    }

    // 기등록 체크 키
    var searchKey = [
        "BRAND_CD",
        "ITEM_STATE",
        "ITEM_LOT",
        "LOCATION_CD"
    ];

    var addedCount = 0, sameLocCount = 0;
    var rowData, newRowData;
    G_GRDSUB.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = checkedRows.length; rIndex < rCount; rIndex++) {
            // 선택 데이터
            rowData = G_GRDDETAIL.data.getItem(checkedRows[rIndex]);
            // 동일 로케이션
            if (rowData.LOCATION_CD == LOCATION_CD) {
                sameLocCount++;
                continue;
            }
            // 기등록 체크
            if ($NC.getGridSearchRow(G_GRDSUB, {
                searchKey: searchKey,
                searchVal: [
                    rowData.BRAND_CD,
                    rowData.ITEM_STATE,
                    rowData.ITEM_LOT,
                    rowData.LOCATION_CD
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
                ITEM_STATE: rowData.ITEM_STATE,
                ITEM_LOT: rowData.ITEM_LOT,
                VALID_DATE: rowData.VALID_DATE,
                BATCH_NO: rowData.BATCH_NO,
                STOCK_QTY: rowData.STOCK_QTY,
                PSTOCK_QTY: rowData.PSTOCK_QTY,
                MSTOCK_QTY: rowData.PSTOCK_QTY,
                MLOCATION_CD: LOCATION_CD,
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
        if (checkedRows.length == sameLocCount) {
            alert($NC.getDisplayMsg("JS.LCC03031P1.010", "선택한 상품의 재고로케이션과 이동로케이션이 모두 같습니다.\n이동로케이션 변경 후 추가하십시오."));
        } else {
            alert($NC.getDisplayMsg("JS.LCC03031P1.011", "선택한 상품은 이미 추가된 재고내역입니다."));
        }
        return;
    }
    $NC.setGridSelectRow(G_GRDSUB, G_GRDSUB.data.getLength() - 1);

    // 수정 상태로 변경
    G_GRDSUB.lastRowModified = true;

    // 상태 콤보 disable
    $NC.setEnable("#cboQItem_State", false);
}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Save() {

    if (G_GRDSUB.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC03031P1.012", "저장할 데이터가 없습니다."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03031P1.013", "물류센터를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03031P1.014", "사업부를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.MOVE_DATE)) {
        alert($NC.getDisplayMsg("JS.LCC03031P1.015", "먼저 이동일자를 입력하십시오."));
        $NC.setFocus("#dtpMove_Date");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }

    var dsD = [];
    var dsCU = [];
    var dsSub, rowData;
    var dsTarget = G_GRDSUB.data.getItems();
    var addSubItemFn = function(ajaxData) {
        var dsResult = $NC.toArray(ajaxData);
        var resultRowData;
        for (var aIndex = 0, aCount = dsResult.length; aIndex < aCount; aIndex++) {
            resultRowData = dsResult[aIndex];
            dsSub.push({
                P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
                P_BU_CD: $NC.G_VAR.masterData.BU_CD,
                P_MOVE_DATE: $NC.G_VAR.masterData.MOVE_DATE,
                P_MOVE_NO: $NC.G_VAR.masterData.MOVE_NO,
                P_LINE_NO: rowData.CRUD == $ND.C_DV_CRUD_D ? resultRowData.LINE_NO : rowData.LINE_NO,
                P_MOVE_DIV: $NC.G_VAR.masterData.MOVE_DIV,
                P_REMARK1: $NC.G_VAR.masterData.REMARK1,
                P_LOCATION_CD: rowData.LOCATION_CD,
                P_BRAND_CD: rowData.BRAND_CD,
                P_ITEM_CD: resultRowData.ITEM_CD,
                P_ITEM_STATE: rowData.ITEM_STATE,
                P_ITEM_LOT: rowData.ITEM_LOT,
                P_VALID_DATE: rowData.VALID_DATE,
                P_BATCH_NO: rowData.BATCH_NO,
                P_STOCK_QTY: rowData.STOCK_QTY * resultRowData.CONS_QTY,
                P_MSTOCK_QTY: rowData.MSTOCK_QTY * resultRowData.CONS_QTY,
                P_MLOCATION_CD: rowData.MLOCATION_CD,
                P_PALLET_ID: "",
                P_CRUD: rowData.CRUD
            });
        }
    };

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
            dsSub = dsCU;
        }

        // 어소트구성상품 조회 후 처리
        // 삭제시 LINE_NO 조회 후 처리
        $NC.serviceCallAndWait("/LCC03030E0/getDataSet.do", {
            P_QUERY_ID: "LCC03030E1.RS_SUB2",
            P_QUERY_PARAMS: {
                P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
                P_BU_CD: $NC.G_VAR.masterData.BU_CD,
                P_MOVE_DATE: $NC.G_VAR.masterData.MOVE_DATE,
                P_MOVE_NO: $NC.G_VAR.masterData.MOVE_NO,
                P_LOCATION_CD: rowData.LOCATION_CD,
                P_ITEM_STATE: rowData.ITEM_STATE,
                P_BRAND_CD: rowData.BRAND_CD,
                P_ASSORT_CD: rowData.ITEM_LOT
            }
        }, addSubItemFn);
    }

    dsSub = dsCU.concat(dsD);
    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_C) {
        if (dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC03031P1.016", "저장할 지시내역 정보가 없습니다."));
            return;
        }
    } else {
        if ($NC.G_VAR.masterData.CRUD != $ND.C_DV_CRUD_U && dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.LCC03031P1.017", "데이터 수정 후 저장하십시오."));
            return;
        }
    }

    $NC.serviceCall("/LCC03030E0/save.do", {
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
        alert($NC.getDisplayMsg("JS.LCC03031P1.018", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제, 그외 CRUD를 "D"로 변경
    $NC.deleteGridRowData(G_GRDSUB, rowData, true);
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
                // 1 - 일반, 2- 유통가공, 3 - 보세
                P_ZONE_DIV_ATTR01_CD: getZoneDivAttr01Cd($NC.getValue("#cboQItem_State"))
            }, onLocationPopup, {
                errorMessage: $NC.getDisplayMsg("JS.LCC03031P1.019", "이동 가능한 로케이션이 검색되지 않았습니다.")
            });
            return;
        case "MOVE_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LCC03031P1.020", "이동일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.MOVE_DATE = $NC.getValue("#dtpMove_Date");
            break;
        case "REMARK1":
            $NC.G_VAR.masterData.REMARK1 = args.val;
            break;
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
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드(상품정보) 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LCC03030E1.RS_SUB1",
        sortCol: "ITEM_LOT",
        gridOptions: options,
        canExportExcel: false
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

function grdDetailOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDDETAIL, e, args);
            break;
    }
}

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
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
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
        name: "이동수량",
        cssClass: "styRight",
        // 기본 editorOptions 자동 지정이 아닌 임의 지정
        editor: Slick.Editors.Number,
        editorOptions: $NC.getGridNumberColumnOptions({
            formatterType: "FLOAT_QTY",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "MLOCATION_CD",
        field: "MLOCATION_CD",
        name: "이동로케이션",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdSubOnPopup,
            isKeyField: true
        },
        cssClass: "styCenter"
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
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "재고로케이션",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 로케이션이동 지시 데이터 그리드 초기값 설정
 */
function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 2

    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: null,
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
 * 재고이동 지시 데이터 그리드 행 선택 변경 했을 경우
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
 * 재고이동 지시 데이터 그리드 편집 불가 처리
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
 * 재고이동 지시 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDSUB.view.getColumnId(args.cell)) {
        case "MLOCATION_CD":
            $NP.onLocationChange(rowData.MLOCATION_CD, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: rowData.MLOCATION_CD,
                // 1 - 일반, 2- 유통가공, 3 - 보세
                P_ZONE_DIV_ATTR01_CD: getZoneDivAttr01Cd(rowData.ITEM_STATE)
            }, grdSubOnLocationPopup, {
                errorMessage: $NC.getDisplayMsg("JS.LCC03031P1.019", "이동 가능한 로케이션이 검색되지 않았습니다.")
            });
            return;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);
}

/**
 * grdSub 데이터(로케이션이동 지시 데이터) 필터링 이벤트
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

/**
 * 그리드 팝업 버튼 클릭 이벤트
 */
function grdSubOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "MLOCATION_CD":
            $NP.showLocationPopup({
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: rowData.MLOCATION_CD,
                // 1 - 일반, 2- 유통가공, 3 - 보세
                P_ZONE_DIV_ATTR01_CD: getZoneDivAttr01Cd($NC.getValue("#cboQItem_State"))
            }, grdSubOnLocationPopup, function() {
                $NC.setFocusGrid(G_GRDSUB, args.row, args.cell, true, true);
            });
            return;
    }
}

function grdSubOnLocationPopup(resultInfo) {

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.MLOCATION_CD = resultInfo.LOCATION_CD;

        focusCol = G_GRDSUB.view.getColumnIndex("MSTOCK_QTY");
    } else {
        rowData.MLOCATION_CD = "";

        focusCol = G_GRDSUB.view.getColumnIndex("MLOCATION_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);

    $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, focusCol, true, true);
}

function validateSubData(row, rowData) {

    if ($NC.isNull(rowData.MSTOCK_QTY) || Number(rowData.MSTOCK_QTY) <= 0) {
        alert($NC.getDisplayMsg("JS.LCC03031P1.021", "이동수량에 0보다 큰 수량을 입력하십시오."));
        $NC.setFocusGrid(G_GRDSUB, row, "MSTOCK_QTY", true);
        return false;
    }

    if (rowData.CRUD == $ND.C_DV_CRUD_C && Number(rowData.PSTOCK_QTY) < Number(rowData.MSTOCK_QTY)) {
        alert($NC.getDisplayMsg("JS.LCC03031P1.022", "재고수량 보다 많은 수량을 입력하실 수 없습니다."));
        $NC.setFocusGrid(G_GRDSUB, row, "MSTOCK_QTY", true);
        return false;
    }

    if ($NC.isNull(rowData.MLOCATION_CD)) {
        alert($NC.getDisplayMsg("JS.LCC03031P1.023", "이동할 로케이션을 선택하십시오."));
        $NC.setFocusGrid(G_GRDSUB, row, "MLOCATION_CD", true);
        return false;
    }
    return true;
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "LOCATION_CD");
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
    });
}

/**
 * 로케이션 검색 이미지 클릭
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
        P_ZONE_DIV_ATTR01_CD: getZoneDivAttr01Cd($NC.getValue("#cboQItem_State"))
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
        P_ZONE_DIV_ATTR01_CD: getZoneDivAttr01Cd($NC.getValue("#cboQItem_State"))
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
function showItemPopup() {

    $NP.showItemPopup({
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        P_ITEM_CD: $ND.C_ALL,
        P_VIEW_DIV: "2",
        P_DEPART_CD: $ND.C_ALL,
        P_LINE_CD: $ND.C_ALL,
        P_CLASS_CD: $ND.C_ALL
    }, onItemPopup, function() {
        $NC.setFocus("#edtQItem_Cd", true);
    });
}

/**
 * 그리드에서 상품 선택했을 경우 처리
 * 
 * @param resultInfo
 */
function onItemPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
        $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
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

/**
 * 상품상태에 따른 ZONE_DIV 특성코드 리턴
 */
function getZoneDivAttr01Cd(itemState) {

    // 보세품 -> 보세구역
    if (itemState == "B") {
        return "3"; // 3 - 보세
    } else {
        return "1,2"; // 1 - 일반, 2 - 유통가공
    }
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 디테일초기화(재고현황)
    $NC.clearGridData(G_GRDDETAIL);
}
