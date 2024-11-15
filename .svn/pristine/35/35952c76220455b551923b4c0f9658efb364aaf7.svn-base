/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC04070E0
 *  프로그램명         : 프로모션관리
 *  프로그램설명       : 프로모션관리 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-01-08
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-01-08    ASETEC           신규작성
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

            // 프로모션 등록 탭
            if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                resizeView.grids = "#grdT1Master";
            }
            // 온라인몰 등록 탭
            else {
                resizeView.grids = "#grdT2Master";
            }
            return resizeView;
        },
        autoResizeSplitView: {
            splitViews: function(viewWidth, viewHeight) {
                var resizeView = [ ];
                if ($NC.getTabActiveIndex("#divMasterView") == 0) {
                    resizeView.push({
                        container: "#divT1BottomLeft",
                        grids: "#grdT1Detail"
                    });
                    if ($NC.isVisible("#divT1BottomRight")) {
                        resizeView.push({
                            container: "#divT1BottomRight",
                            grids: "#grdT1Sub",
                            size: Math.floor(viewWidth / 3)
                        });
                    }
                } else {
                    resizeView.push({
                        container: "#divT2BottomLeft",
                        grids: "#grdT2Detail"
                    });
                    resizeView.push({
                        container: "#divT2BottomRight",
                        grids: "#grdT2Sub",
                        size: Math.floor(viewWidth / 4)
                    });
                }
                return resizeView;
            },
            viewType: "h"
        },
        dsPromotionDivD: null,
        PROMOTION_DIV_ITEM: "1", // 상품기준
        PROMOTION_DIV_AMT: "2", // 금액기준
        PROMOTION_DIV_PHASED: "1", // 단계별증정
        PROMOTION_DIV_MULTI: "2", // 복수증정
        saveIndex: "0" // 저장할 때 포커스 처리 구분 값
    });

    // 탭 초기화
    $NC.setInitTab("#divMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT1DetailInitialize();
    grdT1SubInitialize();
    grdT2MasterInitialize();
    grdT2DetailInitialize();
    grdT2SubInitialize();

    // 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);
    $NC.setValue("#chkQDeal_Div2", $ND.C_YES);

    // 데이터 조회
    $NC.serviceCall("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "PROMOTION_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, function(ajaxData) {
        $NC.G_VAR.dsPromotionDivD = $NC.toArray(ajaxData);
        // 조회조건 - 프로모션구분 세팅
        $NC.setInitComboData({
            selector: "#cboQPromotion_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.G_VAR.dsPromotionDivD,
            addAll: true
        });
    });

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnAddDelivery").click(btnAddDeliveryOnClick);
    $("#btnDeleteDelivery").click(btnDeleteDeliveryOnClick);

    $NC.setInitDateRangePicker("#dtpQOpen_Date1", "#dtpQOpen_Date2");

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    $NC.setInitSplitter("#divT1TabSheetView", "h", 350);
    $NC.setInitSplitter("#divT2TabSheetView", "h", 350);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.fixedBottomRightViewWidth = 500;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();

    switch (id) {
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "OPEN_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.CMC04070E0.001", "거래 시작일자를 정확히 입력하십시오."));
            break;
        case "OPEN_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.CMC04070E0.002", "거래 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 화면 클리어
    onChangingCondition();
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDT2MASTER.data.getLength() > 0;
    // 저장

    $NC.setEnable("#btnAddDelivery", permission.canSave && enable);
    $NC.setEnable("#btnDeleteDelivery", permission.canDelete && enable);
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 데이터 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT1SUB);
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.clearGridData(G_GRDT2DETAIL);
    $NC.clearGridData(G_GRDT2SUB);

    // 초기화면 세팅
    resizeT1Bottom();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.CMC04070E0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OPEN_DATE1 = $NC.getValue("#dtpQOpen_Date1");
    if ($NC.isNull(OPEN_DATE1)) {
        alert($NC.getDisplayMsg("JS.CMC04070E0.001", "거래 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOpen_Date1");
        return;
    }
    var OPEN_DATE2 = $NC.getValue("#dtpQOpen_Date2");
    if ($NC.isNull(OPEN_DATE2)) {
        alert($NC.getDisplayMsg("JS.CMC04070E0.002", "거래 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOpen_Date2");
        return;
    }
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

    var PROMOTION_DIV = $NC.getValue("#cboQPromotion_Div");
    var PROMOTION_CD = $NC.getValue("#edtQPromotion_Cd");
    var PROMOTION_NM = $NC.getValue("#edtQPromotion_Nm");

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var PROMOTION_ITEM_CD = $NC.getValue("#edtQPromotion_Item_Cd");

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);

        // 파라메터 세팅
        G_GRDT1MASTER.queryParams = {
            P_BU_CD: BU_CD,
            P_OPEN_DATE1: OPEN_DATE1,
            P_OPEN_DATE2: OPEN_DATE2,
            P_PROMOTION_DIV: PROMOTION_DIV,
            P_PROMOTION_CD: PROMOTION_CD,
            P_PROMOTION_NM: PROMOTION_NM,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_PROMOTION_ITEM_CD: PROMOTION_ITEM_CD,
            P_DEAL_DIV1: DEAL_DIV1,
            P_DEAL_DIV2: DEAL_DIV2,
            P_DEAL_DIV3: DEAL_DIV3
        };
        // 데이터 조회
        $NC.serviceCall("/CMC04070E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    } else {
        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);

        // 파라메터 세팅
        G_GRDT2MASTER.queryParams = {
            P_BU_CD: BU_CD,
            P_OPEN_DATE1: OPEN_DATE1,
            P_OPEN_DATE2: OPEN_DATE2,
            P_PROMOTION_DIV: PROMOTION_DIV,
            P_PROMOTION_CD: PROMOTION_CD,
            P_PROMOTION_NM: PROMOTION_NM,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_PROMOTION_ITEM_CD: PROMOTION_ITEM_CD,
            P_DEAL_DIV1: DEAL_DIV1,
            P_DEAL_DIV2: DEAL_DIV2,
            P_DEAL_DIV3: DEAL_DIV3
        };
        // 데이터 조회
        $NC.serviceCall("/CMC04070E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var newRowData, refRowData;
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // grdT1Master에 포커스가 있을 경우
        if (G_GRDT1MASTER.focused) {
            // 마지막 선택 Row Validation 체크
            if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
                return;
            }

            // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
            newRowData = {
                BU_CD: $NC.getValue("#edtQBu_Cd"),
                PROMOTION_CD: null,
                PROMOTION_NM: null,
                PROMOTION_DIV: "11",
                PROMOTION_DIV_F: $NC.getGridComboName(G_GRDT1MASTER, {
                    columnId: "PROMOTION_DIV_F",
                    searchVal: "11",
                    dataCodeField: "COMMON_CD",
                    dataFullNameField: "COMMON_CD_F"
                }),
                BRAND_CD: null,
                BRAND_CD_NM: null,
                ITEM_CD: null,
                ITEM_CD_NM: null,
                PROMOTION_USE_DIV: "1",
                PROMOTION_USE_DIV_F: $NC.getGridComboName(G_GRDT1MASTER, {
                    columnId: "PROMOTION_USE_DIV_F",
                    searchVal: "1",
                    dataCodeField: "COMMON_CD",
                    dataFullNameField: "COMMON_CD_F"
                }),
                PROMOTION_MIN_AMT: 0,
                PROMOTION_MAX_AMT: 0,
                PROMOTION_LIMIT_QTY: 0,
                PROMOTION_USED_QTY: 0,
                DEAL_DIV: "1",
                DEAL_DIV_F: $NC.getGridComboName(G_GRDT1MASTER, {
                    columnId: "DEAL_DIV_F",
                    searchVal: "1",
                    dataCodeField: "COMMON_CD",
                    dataFullNameField: "COMMON_CD_F"
                }),
                OPEN_DATE: null,
                CLOSE_DATE: null,
                REMARK1: null,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_N
            };

            // 신규 데이터 생성 및 이벤트 호출
            $NC.newGridRowData(G_GRDT1MASTER, newRowData);
        }
        // grdT1Detail에 포커스가 있을 경우
        else if (G_GRDT1DETAIL.focused) {
            if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
                alert($NC.getDisplayMsg("JS.CMC04070E0.004", "프로모션 정보가 없습니다.\n\n프로모션 정보를 먼저 등록하십시오."));
                return;
            }

            refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
            if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
                alert($NC.getDisplayMsg("JS.CMC04070E0.005", "신규 프로모션코드 입니다.\n\n저장 후 프로모션 상품을 등록하십시오."));
                return;
            }

            // 마지막 선택 Row Validation 체크
            if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
                return;
            }

            // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
            newRowData = {
                BU_CD: refRowData.BU_CD,
                PROMOTION_CD: refRowData.PROMOTION_CD,
                PROMOTION_BRAND_CD: null,
                PROMOTION_BRAND_NM: null,
                PROMOTION_ITEM_CD: null,
                PROMOTION_ITEM_NM: null,
                PROMOTION_QTY: 1,
                PROMOTION_RANK: 1,
                PROMOTION_LIMIT_QTY: 0,
                PROMOTION_USED_QTY: 0,
                REMARK1: null,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_N
            };

            // 신규 데이터 생성 및 이벤트 호출
            $NC.newGridRowData(G_GRDT1DETAIL, newRowData);
        }
        // grdT1Sub에 포커스가 있을 경우
        else if (G_GRDT1SUB.focused) {
            if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
                alert($NC.getDisplayMsg("JS.CMC04070E0.004", "프로모션 정보가 없습니다.\n\프로모션 정보를 먼저 등록하십시오."));
                return;
            }

            refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
            if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
                alert($NC.getDisplayMsg("JS.CMC04070E0.005", "신규 프로모션 코드 입니다.\n\n저장 후 프로모션 상품을 등록하십시오."));
                return;
            }

            // 마지막 선택 Row Validation 체크
            if (!$NC.isGridValidLastRow(G_GRDT1SUB)) {
                return;
            }

            // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
            newRowData = {
                BU_CD: refRowData.BU_CD,
                PROMOTION_CD: refRowData.PROMOTION_CD,
                EXCEPT_BRAND_CD: null,
                EXCEPT_BRAND_NM: null,
                EXCEPT_ITEM_CD: null,
                EXCEPT_ITEM_NM: null,
                REMARK1: null,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_N
            };

            // 신규 데이터 생성 및 이벤트 호출
            $NC.newGridRowData(G_GRDT1SUB, newRowData);
        }
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    var dsMaster, dsDetail, dsSub, dsTarget, rowData, rIndex, rCount;
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        if (G_GRDT1MASTER.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.006", "저장할 데이터가 없습니다."));
            return;
        }

        if (G_GRDT1MASTER.focused) {
            // 마지막 선택 Row Validation 체크
            if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
                return;
            }
        } else if (G_GRDT1DETAIL.focused) {
            // 마지막 선택 Row Validation 체크
            if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
                return;
            }
        } else {
            // 마지막 선택 Row Validation 체크
            if (!$NC.isGridValidLastRow(G_GRDT1SUB)) {
                return;
            }
        }

        dsMaster = [ ];
        dsDetail = [ ];
        dsSub = [ ];

        // 프로모션코드 수정 데이터
        for (rIndex = 0, rCount = G_GRDT1MASTER.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDT1MASTER.data.getItem(rIndex);
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            }
            dsMaster.push({
                P_BU_CD: rowData.BU_CD,
                P_PROMOTION_CD: rowData.PROMOTION_CD,
                P_PROMOTION_NM: rowData.PROMOTION_NM,
                P_PROMOTION_DIV: rowData.PROMOTION_DIV,
                P_BRAND_CD: rowData.BRAND_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_PROMOTION_USE_DIV: rowData.PROMOTION_USE_DIV,
                P_PROMOTION_MIN_AMT: rowData.PROMOTION_MIN_AMT,
                P_PROMOTION_MAX_AMT: rowData.PROMOTION_MAX_AMT,
                P_PROMOTION_LIMIT_QTY: rowData.PROMOTION_LIMIT_QTY,
                P_PROMOTION_USED_QTY: rowData.PROMOTION_USED_QTY,
                P_DEAL_DIV: rowData.DEAL_DIV,
                P_OPEN_DATE: rowData.OPEN_DATE,
                P_CLOSE_DATE: rowData.CLOSE_DATE,
                P_REMARK1: rowData.REMARK1,
                P_CRUD: rowData.CRUD
            });
        }

        // 프로모션상세 수정 데이터
        for (rIndex = 0, rCount = G_GRDT1DETAIL.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDT1DETAIL.data.getItem(rIndex);
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            }
            dsDetail.push({
                P_BU_CD: rowData.BU_CD,
                P_PROMOTION_CD: rowData.PROMOTION_CD,
                P_PROMOTION_BRAND_CD: rowData.PROMOTION_BRAND_CD,
                P_PROMOTION_ITEM_CD: rowData.PROMOTION_ITEM_CD,
                P_PROMOTION_QTY: rowData.PROMOTION_QTY,
                P_PROMOTION_RANK: rowData.PROMOTION_RANK,
                P_PROMOTION_LIMIT_QTY: rowData.PROMOTION_LIMIT_QTY,
                P_PROMOTION_USED_QTY: rowData.PROMOTION_USED_QTY,
                P_REMARK1: rowData.REMARK1,
                P_CRUD: rowData.CRUD
            });
        }

        // 프로모션 제외상품 수정 데이터
        for (rIndex = 0, rCount = G_GRDT1SUB.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDT1SUB.data.getItem(rIndex);
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            }
            dsSub.push({
                P_BU_CD: rowData.BU_CD,
                P_PROMOTION_CD: rowData.PROMOTION_CD,
                P_EXCEPT_BRAND_CD: rowData.EXCEPT_BRAND_CD,
                P_EXCEPT_ITEM_CD: rowData.EXCEPT_ITEM_CD,
                P_REMARK1: rowData.REMARK1,
                P_CRUD: rowData.CRUD
            });
        }

        if (dsMaster.length == 0 && dsDetail.length == 0 && dsSub.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.007", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/CMC04070E0/save.do", {
            P_DS_MASTER: dsMaster,
            P_DS_DETAIL: dsDetail,
            P_DS_SUB: dsSub,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveError);
    } else {
        if (G_GRDT2MASTER.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.006", "저장할 데이터가 없습니다."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDT2DETAIL)) {
            return;
        }

        var dsD = [ ];
        var dsCU = [ ];
        dsTarget = G_GRDT2DETAIL.data.getItems();
        for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
            rowData = dsTarget[rIndex];
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
                dsDetail = dsD;
            } else {
                dsDetail = dsCU;
            }
            dsDetail.push({
                P_BU_CD: rowData.BU_CD,
                P_PROMOTION_CD: rowData.PROMOTION_CD,
                P_DELIVERY_CD: rowData.DELIVERY_CD,
                P_REMARK1: rowData.REMARK1,
                P_CRUD: rowData.CRUD
            });
        }
        dsDetail = dsD.concat(dsCU);

        if (dsDetail.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.007", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/CMC04070E0/saveDelivery.do", {
            P_DS_DETAIL: dsDetail,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveError);
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {

        var rowData;
        if (G_GRDT1MASTER.focused) {
            if (G_GRDT1MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT1MASTER.lastRow)) {
                alert($NC.getDisplayMsg("JS.CMC04070E0.008", "삭제할 데이터가 없습니다."));
                return;
            }

            if (G_GRDT1DETAIL.data.getLength() == 0 && G_GRDT1SUB.data.getLength() == 0) {
                if (!confirm($NC.getDisplayMsg("JS.CMC04070E0.009", "프로모션 코드를 삭제 하시겠습니까?"))) {
                    return;
                }
            } else {
                if (!confirm($NC.getDisplayMsg("JS.CMC04070E0.010", "하위 데이터가 있습니다.\n\n그래도 프로모션 코드를 삭제 하시겠습니까?"))) {
                    return;
                }
            }

            rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
            // 신규 데이터일 경우 Grid 데이터만 삭제
            if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
                if ($NC.deleteGridRowData(G_GRDT1MASTER, rowData) == 0) {
                    // 마지막 데이터 삭제시 초기화면 세팅
                    resizeT1Bottom();
                }
            } else {
                rowData.CRUD = $ND.C_DV_CRUD_D;
                G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
                _Save();
            }
        } else if (G_GRDT1DETAIL.focused) {

            if (G_GRDT1DETAIL.data.getLength() == 0) {
                alert($NC.getDisplayMsg("JS.CMC04070E0.008", "삭제할 데이터가 없습니다."));
                return;
            }
            if (!confirm($NC.getDisplayMsg("JS.CMC04070E0.011", "프로모션 상품정보를 삭제 하시겠습니까?"))) {
                return;
            }

            rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
            // 신규 데이터일 경우 Grid 데이터만 삭제
            if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
                $NC.deleteGridRowData(G_GRDT1DETAIL, rowData);
            } else {
                rowData.CRUD = $ND.C_DV_CRUD_D;
                G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
                _Save();
            }
        } else {

            if (G_GRDT1SUB.data.getLength() == 0) {
                alert($NC.getDisplayMsg("JS.CMC04070E0.008", "삭제할 데이터가 없습니다."));
                return;
            }
            if (!confirm($NC.getDisplayMsg("JS.CMC04070E0.012", "프로모션 제외 상품정보를 삭제 하시겠습니까?"))) {
                return;
            }

            rowData = G_GRDT1SUB.data.getItem(G_GRDT1SUB.lastRow);
            // 신규 데이터일 경우 Grid 데이터만 삭제
            if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
                $NC.deleteGridRowData(G_GRDT1SUB, rowData);
            } else {
                rowData.CRUD = $ND.C_DV_CRUD_D;
                G_GRDT1SUB.data.updateItem(rowData.id, rowData);
                _Save();
            }
        }
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal1, lastKeyVal2, lastKeyVal3;
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
            selectKey: "PROMOTION_CD",
            isCancel: true
        });
        lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
            selectKey: "PROMOTION_ITEM_CD",
            isCancel: true
        });
        lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDT1SUB, {
            selectKey: "EXCEPT_ITEM_CD",
            isCancel: true
        });
        var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
        var rowCount = G_GRDT1MASTER.data.getLength();
        _Inquiry();
        G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
        G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
        G_GRDT1SUB.lastKeyVal = lastKeyVal3;
        // 마스터 데이터가 없을 때 신규 취소시 화면 초기화
        if (rowData.CRUD == $ND.C_DV_CRUD_N && rowCount == 1) {
            resizeT1Bottom($NC.G_VAR.PROMOTION_DIV_AMT);
        }
    } else {
        lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
            selectKey: "PROMOTION_CD",
            isCancel: true
        });
        lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT2DETAIL, {
            selectKey: [
                "PROMOTION_CD",
                "DELIVERY_CD"
            ],
            isCancel: true
        });
        lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDT2SUB, {
            selectKey: "DELIVERY_CD",
            isCancel: true
        });
        _Inquiry();
        G_GRDT2MASTER.lastKeyVal = lastKeyVal1;
        G_GRDT2DETAIL.lastKeyVal = lastKeyVal2;
        G_GRDT2SUB.lastKeyVal = lastKeyVal3;
    }
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

    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT1TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT1TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT1TabSheetView", "h", 350);
        }
    } else {
        // 스플리터가 초기화가 되어 있으면 _OnResize 호출
        if ($NC.isSplitter("#divT2TabSheetView")) {
            // 스필리터를 통한 _OnResize 호출
            $("#divT2TabSheetView").trigger("resize");
        } else {
            // 스플리터 초기화
            $NC.setInitSplitter("#divT2TabSheetView", "h", 350);
        }
    }
    // 화면상단의 공통 메뉴 버튼 이미지 표시 : true인 경우는 조회 버튼만 활성화 한다.
    setTopButtons();
}

function grdT1MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "PROMOTION_CD",
        field: "PROMOTION_CD",
        name: "프로모션코드",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_NM",
        field: "PROMOTION_NM",
        name: "프로모션명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_DIV_F",
        field: "PROMOTION_DIV_F",
        name: "프로모션구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "PROMOTION_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "PROMOTION_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "기준상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdT1MasterOnPopup,
            isKeyField: true
        }
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
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_USE_DIV_F",
        field: "PROMOTION_USE_DIV_F",
        name: "프로모션사용구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "PROMOTION_USE_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "PROMOTION_USE_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_MIN_AMT",
        field: "PROMOTION_MIN_AMT",
        name: "증정최소금액",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_MAX_AMT",
        field: "PROMOTION_MAX_AMT",
        name: "증정최대금액",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_LIMIT_QTY",
        field: "PROMOTION_LIMIT_QTY",
        name: "제한수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_USED_QTY",
        field: "PROMOTION_USED_QTY",
        name: "제공수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_F",
        field: "DEAL_DIV_F",
        name: "거래구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "DEAL_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "DEAL_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래시작일자",
        editor: Slick.Editors.Date,
        editorOptions: {
            isKeyField: true
        },
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        editor: Slick.Editors.Date,
        editorOptions: {
            isKeyField: true
        },
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

function grdT1MasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "CMC04070E0.RS_T1_MASTER",
        sortCol: "PROMOTION_CD",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
    G_GRDT1MASTER.view.onBeforeEditCell.subscribe(grdT1MasterOnBeforeEditCell);
    G_GRDT1MASTER.view.onCellChange.subscribe(grdT1MasterOnCellChange);
    G_GRDT1MASTER.view.onFocus.subscribe(grdT1MasterOnFocus);

    // 최초 조회시 포커스 처리
    G_GRDT1MASTER.focused = true;
}

function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT1MASTER.data.getItem(row);

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);
    $NC.setInitGridVar(G_GRDT1SUB);

    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        onGetT1Detail({
            data: null
        });
        onGetT1Sub({
            data: null
        });
    } else {
        G_GRDT1DETAIL.queryParams = {
            P_BU_CD: rowData.BU_CD,
            P_PROMOTION_CD: rowData.PROMOTION_CD
        };
        $NC.serviceCall("/CMC04070E0/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

        G_GRDT1SUB.queryParams = {
            P_BU_CD: rowData.BU_CD,
            P_PROMOTION_CD: rowData.PROMOTION_CD
        };
        $NC.serviceCall("/CMC04070E0/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);
    }

    grdT1DetailOnSetColumns(rowData);

    // 금액기준일 경우는 프로모션 제외상품 그리드 표시. 상품기준일 경우는 프로모션 제외상품 그리드 숨김
    resizeT1Bottom(getPromotionDiv(rowData.PROMOTION_DIV, "A"));

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT1MasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    var ITEM_AMT_DIV = getPromotionDiv(rowData.PROMOTION_DIV, "A");
    var PHASED_MULTI_DIV = getPromotionDiv(rowData.PROMOTION_DIV, "B");

    // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
    switch (args.column.id) {
        // 상품기준일 경우 증정금액 입력 불가
        case "PROMOTION_MIN_AMT":
        case "PROMOTION_MAX_AMT":
            return ITEM_AMT_DIV != $NC.G_VAR.PROMOTION_DIV_ITEM;
            // 단계별증정일 경우, 제한수량 입력 불가
        case "PROMOTION_LIMIT_QTY":
            return PHASED_MULTI_DIV != $NC.G_VAR.PROMOTION_DIV_PHASED;
            // 금액기준일 경우는 상품코드 입력 불가
        case "ITEM_CD":
            return ITEM_AMT_DIV != $NC.G_VAR.PROMOTION_DIV_AMT;
            // 신규 데이터일 때만 수정 가능한 컬럼
        case "PROMOTION_CD":
        case "PROMOTION_DIV_F":
            return rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD == $ND.C_DV_CRUD_C;
    }
    return true;
}

function grdT1MasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDT1MASTER.view.getColumnId(args.cell)) {
        case "ITEM_CD":
            $NP.onItemChange(rowData.ITEM_CD, {
                P_BU_CD: rowData.BU_CD,
                P_ITEM_CD: rowData.ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdT1MasterOnItemPopup);
            return;
        case "PROMOTION_DIV_F":
            var ITEM_AMT_DIV = getPromotionDiv(rowData.PROMOTION_DIV, "A");
            var PHASED_MULTI_DIV = getPromotionDiv(rowData.PROMOTION_DIV, "B");
            // 상품기준일 경우
            if (ITEM_AMT_DIV == $NC.G_VAR.PROMOTION_DIV_ITEM) {
                resizeT1Bottom(ITEM_AMT_DIV);
                rowData.ITEM_CD = null;
                rowData.ITEM_NM = null;
                rowData.PROMOTION_MIN_AMT = "0";
                rowData.PROMOTION_MAX_AMT = "0";
                // 금액기준일 경우
            } else if (ITEM_AMT_DIV == $NC.G_VAR.PROMOTION_DIV_AMT) {
                resizeT1Bottom(ITEM_AMT_DIV);
                $NC.setFocusGrid(G_GRDT1MASTER, args.row, args.cell, true, true);
                rowData.ITEM_CD = "0";
                rowData.ITEM_NM = null;
                rowData.BRAND_CD = "0";
                rowData.BRAND_NM = null;
            }
            // 단계별증정일 경우
            if (PHASED_MULTI_DIV == $NC.G_VAR.PROMOTION_DIV_PHASED) {
                // rowData.PROMOTION_RANK = "0";
                rowData.PROMOTION_LIMIT_QTY = "0";
            }

            grdT1DetailOnSetColumns(rowData);
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(rowData.OPEN_DATE)) {
                if (!$NC.isDate(rowData.OPEN_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04070E0.001", "거래시작일자를 정확히 입력하십시오."));
                    rowData.OPEN_DATE = "";
                    $NC.setFocusGrid(G_GRDT1MASTER, args.row, args.cell, true);
                } else {
                    rowData.OPEN_DATE = $NC.getDate(rowData.OPEN_DATE);
                }
            }
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(rowData.CLOSE_DATE)) {
                if (!$NC.isDate(rowData.CLOSE_DATE)) {
                    alert($NC.getDisplayMsg("JS.CMC04070E0.002", "거래종료일자를 정확히 입력하십시오."));
                    rowData.CLOSE_DATE = "";
                    $NC.setFocusGrid(G_GRDT1MASTER, args.row, args.cell, true);
                } else {
                    rowData.CLOSE_DATE = $NC.getDate(rowData.CLOSE_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);
}

function grdT1MasterOnFocus(e, args) {

    G_GRDT1MASTER.focused = true;
    G_GRDT1DETAIL.focused = false;
    G_GRDT1SUB.focused = false;

    // 디테일 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
        return;
    }

    // 서브 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDT1SUB)) {
        return;
    }
}

function grdT1MasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDT1MASTER, args.row, "PROMOTION_CD", true);
}

function grdT1MasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1MASTER, row, "PROMOTION_CD")) {
        return true;
    }

    var rowData = G_GRDT1MASTER.data.getItem(row);
    var ITEM_AMT_DIV = getPromotionDiv(rowData.PROMOTION_DIV, "A");
    var PHASED_MULTI_DIV = getPromotionDiv(rowData.PROMOTION_DIV, "B");
    var CHECK_LIMIT_QTY = 0;
    var CHECK_AMT = 0;

    // 복수증정일 경우는 제한수량 입력 필수
    if (PHASED_MULTI_DIV == $NC.G_VAR.PROMOTION_DIV_MULTI) {
        CHECK_LIMIT_QTY = 1;
    }
    // 금액기준일 경우는 금액 필수
    if (ITEM_AMT_DIV == $NC.G_VAR.PROMOTION_DIV_AMT) {
        CHECK_AMT = 1;
    }

    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.PROMOTION_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.013", "프로모션 코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "PROMOTION_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.PROMOTION_NM)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.014", "프로모션명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "PROMOTION_NM", true);
            return false;
        }
        if ($NC.isNull(rowData.PROMOTION_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.015", "프로모션구분을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "PROMOTION_DIV_F", true);
            return false;
        }
        if ($NC.isNull(rowData.ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.016", "기준상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.017", "프로모션사용구분을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "PROMOTION_USE_DIV_F", true);
            return false;
        }
        if ($NC.toNumber(rowData.PROMOTION_MIN_AMT) < CHECK_AMT) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.018", "증정최소금액을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "PROMOTION_MIN_AMT", true);
            return false;
        }
        if ($NC.toNumber(rowData.PROMOTION_MAX_AMT) != 0 && $NC.toNumber(rowData.PROMOTION_MAX_AMT) < $NC.toNumber(rowData.PROMOTION_MIN_AMT)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.019", "증정최대금액은 증정최소금액보다 작을 수 없습니다."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "PROMOTION_MAX_AMT", true);
            return false;
        }
        if ($NC.toNumber(rowData.PROMOTION_LIMIT_QTY) < CHECK_LIMIT_QTY) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.020", "제한수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "PROMOTION_LIMIT_QTY", true);
            return false;
        }
        if ($NC.toNumber(rowData.PROMOTION_LIMIT_QTY) < rowData.PROMOTION_USED_QTY) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.021", "제한수량은 제공수량보다 작을 수 없습니다."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "PROMOTION_LIMIT_QTY", true);
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.022", "거래구분을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "DEAL_DIV_F", true);
            return false;
        }
        if ($NC.isNull(rowData.OPEN_DATE)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.023", "거래시작일자를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "OPEN_DATE", true);
            return false;
        }
        if ($NC.isNull(rowData.CLOSE_DATE)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.024", "거래종료일자를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1MASTER, row, "CLOSE_DATE", true);
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC04070E0.XXX", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setFocusGrid(G_GRDT1MASTER, row, "CLOSE_DATE", true);
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1MASTER, rowData);
    return true;
}

function grdT1DetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "PROMOTION_ITEM_CD",
        field: "PROMOTION_ITEM_CD",
        name: "프로모션상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdT1DetailOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_ITEM_NM",
        field: "PROMOTION_ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_BRAND_NM",
        field: "PROMOTION_BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_QTY",
        field: "PROMOTION_QTY",
        name: "증정수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    // 단계별증정일 경우만 표시 -----------------
    $NC.setGridColumn(columns, {
        id: "PROMOTION_RANK",
        field: "PROMOTION_RANK",
        name: "증정순위",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        },
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_LIMIT_QTY",
        field: "PROMOTION_LIMIT_QTY",
        name: "제한수량",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_USED_QTY",
        field: "PROMOTION_USED_QTY",
        name: "제공수량",
        cssClass: "styRight",
        initialHidden: true
    });
    // ------------------------------------------
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailOnSetColumns(refRowData) {

    if ($NC.isNull(refRowData)) {
        refRowData = {};
    }

    var PROMOTION_DIV = getPromotionDiv(refRowData.PROMOTION_DIV, "B");
    $NC.setGridColumns(G_GRDT1DETAIL, [ // 숨김컬럼 세팅
        PROMOTION_DIV != $NC.G_VAR.PROMOTION_DIV_PHASED ? "PROMOTION_RANK,PROMOTION_LIMIT_QTY,PROMOTION_USED_QTY" : ""
    ]);
}

function grdT1DetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Detail", {
        columns: grdT1DetailOnGetColumns(),
        queryId: "CMC04070E0.RS_T1_DETAIL",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
    G_GRDT1DETAIL.view.onBeforeEditCell.subscribe(grdT1DetailOnBeforeEditCell);
    G_GRDT1DETAIL.view.onCellChange.subscribe(grdT1DetailOnCellChange);
    G_GRDT1DETAIL.view.onFocus.subscribe(grdT1DetailOnFocus);
}

function grdT1DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1DETAIL, row + 1);
}

function grdT1DetailOnBeforeEditCell(e, args) {

    // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
    var refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (getPromotionDiv(refRowData.PROMOTION_DIV, "B") == $NC.G_VAR.PROMOTION_MULTI) {
        return false;
    }

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "PROMOTION_ITEM_CD":
                return false;
        }
    }
    return true;
}

function grdT1DetailOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDT1DETAIL.view.getColumnId(args.cell)) {
        case "PROMOTION_ITEM_CD":
            $NP.onItemChange(rowData.PROMOTION_ITEM_CD, {
                P_BU_CD: rowData.BU_CD,
                P_ITEM_CD: rowData.PROMOTION_ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdT1DetailOnItemPopup);
            return;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1DETAIL, rowData);
}

function grdT1DetailOnFocus(e, args) {

    G_GRDT1MASTER.focused = false;
    G_GRDT1DETAIL.focused = true;
    G_GRDT1SUB.focused = false;

    // 마스터 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        return;
    }

    // 서브 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDT1SUB)) {
        return;
    }
}

function grdT1DetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDT1DETAIL, args.row, "PROMOTION_ITEM_CD", true);
}

function grdT1DetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1DETAIL, row, "PROMOTION_ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDT1DETAIL.data.getItem(row);
    var refRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    var PHASED_MULTI_DIV = getPromotionDiv(refRowData.PROMOTION_DIV, "B");
    var CHECK_LIMIT_QTY = 1;

    // 복수증정일 경우는 제한수량 입력 필수
    if (PHASED_MULTI_DIV == $NC.G_VAR.PROMOTION_DIV_MULTI) {
        CHECK_LIMIT_QTY = 0;
    }

    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.PROMOTION_ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.025", "프로모션상품코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1DETAIL, row, "PROMOTION_ITEM_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.PROMOTION_QTY)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.026", "증정수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1DETAIL, row, "PROMOTION_QTY", true);
            return false;
        }
        if ($NC.isNull(rowData.PROMOTION_RANK)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.027", "증정순위을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1DETAIL, row, "PROMOTION_RANK", true);
            return false;
        }
        if (rowData.PROMOTION_LIMIT_QTY < CHECK_LIMIT_QTY) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.028", "제한수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDT1DETAIL, row, "PROMOTION_LIMIT_QTY", true);
            return false;
        }
        if (rowData.PROMOTION_LIMIT_QTY < rowData.PROMOTION_USED_QTY) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.029", "제한수량은 제공수량보다 작을 수 없습니다."));
            $NC.setFocusGrid(G_GRDT1DETAIL, row, "PROMOTION_LIMIT_QTY", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1DETAIL, rowData);
    return true;
}

function grdT1SubOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "EXCEPT_ITEM_CD",
        field: "EXCEPT_ITEM_CD",
        name: "제외상품코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdT1SubOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드"
    });
    $NC.setGridColumn(columns, {
        id: "EXCEPT_ITEM_NM",
        field: "EXCEPT_ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "EXCEPT_BRAND_NM",
        field: "EXCEPT_BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1SubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Sub", {
        columns: grdT1SubOnGetColumns(),
        queryId: "CMC04070E0.RS_T1_SUB",
        sortCol: "EXCEPT_ITEM_CD",
        gridOptions: options
    });

    G_GRDT1SUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
    G_GRDT1SUB.view.onBeforeEditCell.subscribe(grdT1SubOnBeforeEditCell);
    G_GRDT1SUB.view.onCellChange.subscribe(grdT1SubOnCellChange);
    G_GRDT1SUB.view.onFocus.subscribe(grdT1SubOnFocus);
}

function grdT1SubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1SUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1SUB, row + 1);
}

function grdT1SubOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "EXCEPT_ITEM_CD":
                return false;
        }
    }
    return true;
}

function grdT1SubOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDT1SUB.view.getColumnId(args.cell)) {
        case "EXCEPT_ITEM_CD":
            $NP.onItemChange(rowData.EXCEPT_ITEM_CD, {
                P_BU_CD: rowData.BU_CD,
                P_ITEM_CD: rowData.EXCEPT_ITEM_CD,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdT1SubOnItemPopup);
            return;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1SUB, rowData);
}

function grdT1SubOnFocus(e, args) {

    G_GRDT1MASTER.focused = false;
    G_GRDT1DETAIL.focused = false;
    G_GRDT1SUB.focused = true;

    // 마스터 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDT1MASTER)) {
        return;
    }

    // 디테일 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDT1DETAIL)) {
        return;
    }
}

function grdT1SubOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDT1SUB, args.row, "EXCEPT_ITEM_CD", true);
}

function grdT1SubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT1SUB, row, "EXCEPT_ITEM_CD")) {
        return true;
    }

    var rowData = G_GRDT1SUB.data.getItem(row);

    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.EXCEPT_ITEM_CD)) {
            alert($NC.getDisplayMsg("JS.CMC04070E0.030", "제외상품코드를 선택하십시오."));
            $NC.setFocusGrid(G_GRDT1SUB, row, "EXCEPT_ITEM_CD", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDT1SUB, rowData);
    return true;
}

function grdT2MasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "PROMOTION_CD",
        field: "PROMOTION_CD",
        name: "프로모션코드"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_NM",
        field: "PROMOTION_NM",
        name: "프로모션명"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_DIV_F",
        field: "PROMOTION_DIV_F",
        name: "프로모션구분"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "기준상품코드"
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
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_MIN_AMT",
        field: "PROMOTION_MIN_AMT",
        name: "증정최소금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_MAX_AMT",
        field: "PROMOTION_MAX_AMT",
        name: "증정최대금액",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_LIMIT_QTY",
        field: "PROMOTION_LIMIT_QTY",
        name: "제한수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "PROMOTION_USED_QTY",
        field: "PROMOTION_USED_QTY",
        name: "제공수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_F",
        field: "DEAL_DIV_F",
        name: "거래구분"
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

function grdT2MasterInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "CMC04070E0.RS_T2_MASTER",
        sortCol: "PROMOTION_CD",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT2MASTER.data.getItem(row);

    // 조회시 디테일, 서브 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2DETAIL);
    $NC.setInitGridVar(G_GRDT2SUB);

    G_GRDT2DETAIL.queryParams = {
        P_BU_CD: rowData.BU_CD,
        P_PROMOTION_CD: rowData.PROMOTION_CD
    };
    $NC.serviceCall("/CMC04070E0/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

    G_GRDT2SUB.queryParams = {
        P_BU_CD: rowData.BU_CD,
        P_PROMOTION_CD: rowData.PROMOTION_CD
    };
    $NC.serviceCall("/CMC04070E0/getDataSet.do", $NC.getGridParams(G_GRDT2SUB), onGetT2Sub);

    // 디테일 필터링
    $NC.setInitGridVar(G_GRDT2DETAIL);
    $NC.setGridFilterValue(G_GRDT2DETAIL, rowData.USER_ID);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

function grdT2DetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "PROMOTION_CD",
        field: "PROMOTION_CD",
        name: "프로모션코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        multiSelect: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Detail", {
        columns: grdT2DetailOnGetColumns(),
        queryId: "CMC04070E0.RS_T2_DETAIL",
        sortCol: "DELIVERY_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 온라인몰 %d건 삭제",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = dd.dragGridObject.data.getItem(dd.dragRows[0]);
                var result;
                if (dd.dragCount == 1) {
                    result = "[온라인몰: " + $NC.getDisplayCombo(rowData.DELIVERY_CD, rowData.DELIVERY_NM) + "]를 삭제";
                } else {
                    result = "[온라인몰: " + $NC.getDisplayCombo(rowData.DELIVERY_CD, rowData.DELIVERY_NM) + "] 외 " + (dd.dragCount - 1) + "건 삭제";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdT2Sub",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                btnAddDeliveryOnClick();
            }
        }
    });

    G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
    G_GRDT2DETAIL.view.onCellChange.subscribe(grdT2DetailOnCellChange);
}

function grdT2DetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2DETAIL, args.rows, e)) {
        if (args.rows.length == 0) {
            // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
            $NC.setGridSelectRow(G_GRDT2DETAIL, G_GRDT2DETAIL.lastRow);
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2DETAIL, row + 1);
}

function grdT2DetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * grdT2Detail 데이터 필터링 이벤트
 */
function grdT2DetailOnFilter(item) {

    return G_GRDT2DETAIL.lastFilterVal == item.PROMOTION_CD //
        && item.CRUD != $ND.C_DV_CRUD_D;
}

function grdT2SubOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        multiSelect: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Sub", {
        columns: grdT2SubOnGetColumns(),
        queryId: "CMC04070E0.RS_T2_SUB",
        sortCol: "DELIVERY_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 온라인몰 %d건 추가",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = dd.dragGridObject.data.getItem(dd.dragRows[0]);
                var result;
                if (dd.dragCount == 1) {
                    result = "[온라인몰: " + $NC.getDisplayCombo(rowData.DELIVERY_CD, rowData.DELIVERY_NM) + "]를 추가";
                } else {
                    result = "[온라인몰: " + $NC.getDisplayCombo(rowData.DELIVERY_CD, rowData.DELIVERY_NM) + "] 외 " + (dd.dragCount - 1) + "건 추가";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdT2Detail",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                btnDeleteDeliveryOnClick();
            }
        }
    });

    G_GRDT2SUB.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
}

function grdT2SubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2SUB, args.rows, e)) {
        if (args.rows.length == 0) {
            // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
            $NC.setGridSelectRow(G_GRDT2SUB, G_GRDT2SUB.lastRow);
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2SUB, row + 1);
}

function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

    if (!$NC.setInitGridAfterOpen(G_GRDT1MASTER, "PROMOTION_CD", G_GRDT1MASTER.focused)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDT1DETAIL);
        onGetT1Detail({
            data: null
        });
        $NC.setInitGridVar(G_GRDT1SUB);
        onGetT1Sub({
            data: null
        });
        resizeT1Bottom();
    }

    // 공통 버튼 활성화 처리
    setTopButtons();
}

function onGetT1Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1DETAIL, "PROMOTION_ITEM_CD", G_GRDT1DETAIL.focused);
}

function onGetT1Sub(ajaxData) {

    $NC.setInitGridData(G_GRDT1SUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1SUB, "EXCEPT_ITEM_CD", G_GRDT1SUB.focused);
}

function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

    if (!$NC.setInitGridAfterOpen(G_GRDT2MASTER, "PROMOTION_CD", true)) {
        // 디테일 초기화
        $NC.setInitGridVar(G_GRDT2DETAIL);
        onGetT2Detail({
            data: null
        });
        $NC.setInitGridVar(G_GRDT2SUB);
        onGetT2Sub({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    setTopButtons();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onGetT2Detail(ajaxData) {

    $NC.setInitGridData(G_GRDT2DETAIL, ajaxData, grdT2DetailOnFilter);

    var rowData = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);
    $NC.setGridFilterValue(G_GRDT2DETAIL, $NC.isNotNull(rowData) ? rowData.PROMOTION_CD : "");
    $NC.setInitGridAfterOpen(G_GRDT2DETAIL, [
        "PROMOTION_CD",
        "DELIVERY_CD"
    ]);
}

function onGetT2Sub(ajaxData) {

    $NC.setInitGridData(G_GRDT2SUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2SUB, "DELIVERY_CD");
}

function onSave(ajaxData) {

    var lastKeyVal1, lastKeyVal2, lastKeyVal3;
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
            selectKey: "PROMOTION_CD"
        });
        lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
            selectKey: "PROMOTION_ITEM_CD"
        });
        lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDT1SUB, {
            selectKey: "EXCEPT_ITEM_CD"
        });
        _Inquiry();
        G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
        G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
        G_GRDT1SUB.lastKeyVal = lastKeyVal3;
    } else {
        lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
            selectKey: "PROMOTION_CD"
        });
        if ($NC.G_VAR.saveIndex == "0") {
            // 비고 저장시 마지막 선택된 데이터에 포커스
            lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT2DETAIL, {
                selectKey: [
                    "PROMOTION_CD",
                    "DELIVERY_CD"
                ]
            });
        } else {
            // 첫번째 데이터에 포커스 처리
            lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT2DETAIL, 0);
        }
        _Inquiry();
        G_GRDT2MASTER.lastKeyVal = lastKeyVal1;
        G_GRDT2DETAIL.lastKeyVal = lastKeyVal2;
        // 포커스 처리 구분 값 초기화
        $NC.G_VAR.saveIndex = "0";
    }
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var grdObject;
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        if (G_GRDT1MASTER.focused) {
            grdObject = G_GRDT1MASTER;
        } else if (G_GRDT1DETAIL.focused) {
            grdObject = G_GRDT1DETAIL;
        } else {
            grdObject = G_GRDT1SUB;
        }
    } else {
        grdObject = G_GRDT2DETAIL;
    }

    var rowData = grdObject.data.getItem(grdObject.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(grdObject, rowData, true);
    }
}

function btnAddDeliveryOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDT2MASTER.data.getLength() == 0 || $NC.isNull(G_GRDT2MASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC04070E0.031", "온라인몰을 등록할 프로모션코드를 선택하십시오."));
        return;
    }

    if (G_GRDT2SUB.data.getLength() == 0) {
        return;
    }

    var refRowData = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);
    if ($NC.isNull(refRowData.PROMOTION_CD)) {
        alert($NC.getDisplayMsg("JS.CMC04070E0.032", "프로모션코드를 먼저 등록하십시오."));
        return;
    }

    var selectedRows = G_GRDT2SUB.view.getSelectedRows();
    var rowData, newRowData;
    G_GRDT2DETAIL.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDT2SUB.data.getItem(selectedRows[rIndex]);

            // 기등록여부 체크
            if ($NC.getGridSearchRow(G_GRDT2DETAIL, {
                searchKey: "DELIVERY_CD",
                searchVal: rowData.DELIVERY_CD
            }) != -1) {
                continue;
            }

            newRowData = {
                BU_CD: refRowData.BU_CD,
                PROMOTION_CD: refRowData.PROMOTION_CD,
                DELIVERY_CD: rowData.DELIVERY_CD,
                DELIVERY_NM: rowData.DELIVERY_NM,
                REMARK1: null,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };

            G_GRDT2DETAIL.data.addItem(newRowData);
        }
    } finally {
        G_GRDT2DETAIL.data.endUpdate();
    }

    // 디테일 필터링
    $NC.setGridFilterValue(G_GRDT2DETAIL, refRowData.PROMOTION_CD);
    $NC.setGridSort(G_GRDT2DETAIL, {
        sortColumns: {
            columnId: "DELIVERY_CD",
            sortAsc: true
        }
    });

    // 첫번째 데이터에 포커스 처리
    $NC.G_VAR.saveIndex = "1";
    _Save();
}

function btnDeleteDeliveryOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDT2DETAIL.data.getLength() == 0) {
        return;
    }

    var selectedRows = G_GRDT2DETAIL.view.getSelectedRows();
    var rowData;
    G_GRDT2DETAIL.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDT2DETAIL.data.getItem(selectedRows[rIndex]);
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                rowData.CRUD = $ND.C_DV_CRUD_D;
                G_GRDT2DETAIL.data.updateItem(rowData.id, rowData);
            } else {
                G_GRDT2DETAIL.data.deleteItem(rowData.id);
            }
        }
    } finally {
        G_GRDT2DETAIL.data.endUpdate();
    }

    if (G_GRDT2DETAIL.data.getLength() > 0) {
        $NC.setGridSelectRow(G_GRDT2DETAIL, 0);
    } else {
        $NC.setGridDisplayRows(G_GRDT2DETAIL, 0, 0);
    }

    // 첫번째 데이터에 포커스 처리
    $NC.G_VAR.saveIndex = "1";
    _Save();
}

function grdT1MasterOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "ITEM_CD":
            $NP.showItemPopup({
                P_BU_CD: rowData.BU_CD,
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: $ND.C_ALL,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdT1MasterOnItemPopup, function() {
                $NC.setFocusGrid(G_GRDT1MASTER, args.row, args.cell, true, true);
            });
            return;
    }
}

function grdT1DetailOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "PROMOTION_ITEM_CD":
            $NP.showItemPopup({
                P_BU_CD: rowData.BU_CD,
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: $ND.C_ALL,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdT1DetailOnItemPopup, function() {
                $NC.setFocusGrid(G_GRDT1DETAIL, args.row, args.cell, true, true);
            });
            return;
    }
}

function grdT1SubOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "EXCEPT_ITEM_CD":
            $NP.showItemPopup({
                P_BU_CD: rowData.BU_CD,
                P_BRAND_CD: $ND.C_ALL,
                P_ITEM_CD: $ND.C_ALL,
                P_VIEW_DIV: "1",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, grdT1SubOnItemPopup, function() {
                $NC.setFocusGrid(G_GRDT1SUB, args.row, args.cell, true, true);
            });
            return;
    }
}

function getPromotionDiv(promotionDiv, subCdDiv) {

    if ($NC.isNull($NC.G_VAR.dsPromotionDivD)) {
        return "";
    }
    for (var rIndex = 0, rCount = $NC.G_VAR.dsPromotionDivD.length; rIndex < rCount; rIndex++) {
        if ($NC.G_VAR.dsPromotionDivD[rIndex].COMMON_CD == promotionDiv) {
            // 상품,금액 구분
            if (subCdDiv == "A") {
                return $NC.G_VAR.dsPromotionDivD[rIndex].COMMON_CD.substr(0, 1);
            }
            // 단계별,복수구분
            else if (subCdDiv == "B") {
                return $NC.G_VAR.dsPromotionDivD[rIndex].COMMON_CD.substr(1, 1);
            }
        }
    }
    return "";
}

function resizeT1Bottom(promotionDiv) {

    var $divT1BottomRight = $("#divT1BottomRight");
    // 금액기준일 경우는 프로모션 제외상품 그리드 표시. 상품기준일 경우는 프로모션 제외상품 그리드 숨김
    if (promotionDiv == $NC.G_VAR.PROMOTION_DIV_AMT) {
        $divT1BottomRight.show();
        $NC.resizeSplitView({
            containers: [
                "#divT1BottomLeft",
                "#divT1BottomRight"
            ],
            grids: [
                "#grdT1Detail",
                "#grdT1Sub"
            ],
            sizes: [
                null,
                Math.floor($divT1BottomRight.parent().width() / 3)
            ]
        }, "h");
    } else {
        $divT1BottomRight.hide();
        $NC.resizeGridView("#divT1BottomLeft", "#grdT1Detail");
    }
}

function grdT1MasterOnItemPopup(resultInfo) {

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if (!$NC.isNull(resultInfo)) {
        rowData.ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_BAR_CD = resultInfo.ITEM_BAR_CD;
        rowData.ITEM_NM = resultInfo.ITEM_NM;
        rowData.BRAND_CD = resultInfo.BRAND_CD;
        rowData.BRAND_NM = resultInfo.BRAND_NM;
        focusCol = G_GRDT1MASTER.view.getColumnIndex("PROMOTION_USE_DIV_F");
    } else {
        rowData.ITEM_CD = "";
        rowData.ITEM_BAR_CD = "";
        rowData.ITEM_NM = "";
        rowData.BRAND_CD = "";
        rowData.BRAND_NM = "";
        focusCol = G_GRDT1MASTER.view.getColumnIndex("ITEM_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1MASTER, rowData);

    $NC.setFocusGrid(G_GRDT1MASTER, G_GRDT1MASTER.lastRow, focusCol, true, true);
}

function grdT1DetailOnItemPopup(resultInfo) {

    var rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if (!$NC.isNull(resultInfo)) {
        rowData.PROMOTION_ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_BAR_CD = resultInfo.ITEM_BAR_CD;
        rowData.PROMOTION_ITEM_NM = resultInfo.ITEM_NM;
        rowData.PROMOTION_BRAND_CD = resultInfo.BRAND_CD;
        rowData.PROMOTION_BRAND_NM = resultInfo.BRAND_NM;
        focusCol = G_GRDT1DETAIL.view.getColumnIndex("PROMOTION_QTY");
    } else {
        rowData.PROMOTION_ITEM_CD = "";
        rowData.ITEM_BAR_CD = "";
        rowData.PROMOTION_ITEM_NM = "";
        rowData.PROMOTION_BRAND_CD = "";
        rowData.PROMOTION_BRAND_NM = "";
        focusCol = G_GRDT1DETAIL.view.getColumnIndex("PROMOTION_ITEM_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1DETAIL, rowData);

    $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, focusCol, true, true);
}

function grdT1SubOnItemPopup(resultInfo) {

    var rowData = G_GRDT1SUB.data.getItem(G_GRDT1SUB.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if (!$NC.isNull(resultInfo)) {
        rowData.EXCEPT_ITEM_CD = resultInfo.ITEM_CD;
        rowData.ITEM_BAR_CD = resultInfo.ITEM_BAR_CD;
        rowData.EXCEPT_ITEM_NM = resultInfo.ITEM_NM;
        rowData.EXCEPT_BRAND_CD = resultInfo.BRAND_CD;
        rowData.EXCEPT_BRAND_NM = resultInfo.BRAND_NM;
        focusCol = G_GRDT1SUB.view.getColumnIndex("EXCEPT_ITEM_CD");
    } else {
        rowData.EXCEPT_ITEM_CD = "";
        rowData.ITEM_BAR_CD = "";
        rowData.EXCEPT_ITEM_NM = "";
        rowData.EXCEPT_BRAND_CD = "";
        rowData.EXCEPT_BRAND_NM = "";
        focusCol = G_GRDT1SUB.view.getColumnIndex("EXCEPT_ITEM_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT1SUB, rowData);

    $NC.setFocusGrid(G_GRDT1SUB, G_GRDT1SUB.lastRow, focusCol, true, true);
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
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

function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setValue("#edtQCust_Cd");
        $NC.setFocus("#edtQBu_Cd", true);
    }

    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");

    $NP.showBuBrandPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: $ND.C_ALL
    }, onBuBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 검색조건의 브랜드 검색 결과
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
    onChangingCondition();
}

/**
 * 상단 공통 버튼 제어
 */
function setTopButtons() {

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    // 등록 탭
    if ($NC.getTabActiveIndex("#divMasterView") == 0) {
        if ($NC.isNotNull(G_GRDT1MASTER.queryParams)) {
            $NC.G_VAR.buttons._new = "1";
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "1";
            $NC.G_VAR.buttons._delete = "1";
        }
    } else {
        if ($NC.isNotNull(G_GRDT2MASTER.queryParams)) {
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "1";
        }
    }
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}