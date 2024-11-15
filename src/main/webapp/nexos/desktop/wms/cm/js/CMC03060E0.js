/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC03060E0
 *  프로그램명         : 사업부관리
 *  프로그램설명       : 사업부관리 화면 Javascript
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
                container: "#divMasterView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divDetailView"
            },
            viewType: "h",
            viewFixed: {
                container: "#divDetailView",
                size: 500
            }
        },
        // 체크할 정책 값
        policyVal: {
            CM210: "" // 재고 제공사업부 관리 정책
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);
    $NC.setValue("#chkQDeal_Div2", $ND.C_YES);

    $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
    $NC.setInitDatePicker("#dtpClose_Date", null, "N");

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divDetailInfoView", false);

    // 이벤트 연결
    $("#btnQCust_Cd").click(showQCustPopup);
    $("#btnCust_Cd").click(showCustPopup);
    $("#btnAddBrand").click(btnAddBrandOnClick);
    $("#btnDeleteBrand").click(btnDeleteBrandOnClick);
    $("#btnAddBu").click(btnAddBuOnClick);
    $("#btnDeleteBu").click(btnDeleteBuOnClick);
    $("#btnZip_Cd").click(showPostPopup);
    $("#btnZip_Cd_Clear").click(btnZipCdClearOnClick);

    // 그리드 초기화
    grdMasterInitialize();
    // 브랜드
    grdDetail1Initialize();
    grdDetail2Initialize();
    // 사업부
    grdDetail3Initialize();
    grdDetail4Initialize();

    // 콤보박스 초기화
    // 사업부구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "BU_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboBu_Div",
        codeField: "COMMON_CD",
        fullNameField: "COMMON_CD_F",
        onComplete: function() {
            $NC.setValue("#cboBu_Div");
        }
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    // 정책값 설정
    setPolicyValInfo();
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.fixedDetailHeight = $("#divDetailInfoView").outerHeight(true) + $NC.G_LAYOUT.header;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    // 브랜드/재고제공사업부 사이즈 조정
    viewHeight = $("#divDetailView").height() - $NC.G_OFFSET.fixedDetailHeight;
    // 재고 제공사업부 관리 정책
    // 1 : 관리함
    if ($NC.G_VAR.policyVal.CM210 == "2") {
        // 브랜드/재고제공사업부 컨테이너 리사이즈
        $NC.resizeSplitView({
            containers: [
                "#divGrdTopView",
                "#divGrdBottomView"
            ]
        }, "v", null, null, viewHeight);
        // 브랜드 그리드 리사이즈
        $NC.resizeSplitView({
            containers: [
                "#divSubView1",
                "#divSubView2"
            ],
            grids: [
                "#grdDetail1",
                "#grdDetail2"
            ]
        }, "h");
        // 재고제공사업부 그리드 리사이즈
        $NC.resizeSplitView({
            containers: [
                "#divSubView3",
                "#divSubView4"
            ],
            grids: [
                "#grdDetail3",
                "#grdDetail4"
            ]
        }, "h");
    }
    // 2 : 관리안함
    else {
        // 브랜드 그리드 리사이즈
        $NC.resizeSplitView({
            containers: [
                "#divSubView1",
                "#divSubView2"
            ],
            grids: [
                "#grdDetail1",
                "#grdDetail2"
            ]
        }, "h", "#divGrdTopView", null, viewHeight);
    }
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;
    // 저장

    $NC.setEnableButton("#divDetailView", permission.canSave && enable);
    $NC.setEnable("#btnCust_Cd", false);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        // 고객사 Key 입력
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

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "CUST_CD":
            $NP.onCustChange(args.val, {
                P_CUST_CD: args.val,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, onCustPopup);
            return;
        case "BU_CD":
            var searchIndex = $NC.getGridSearchRow(G_GRDMASTER, {
                searchKey: [
                    "BU_CD"
                ],
                searchVal: [
                    args.val
                ]
            });
            if (searchIndex > -1) {
                alert($NC.getDisplayMsg("JS.CMC03060E0.001", "중복사업부 입니다."));
                $NC.setValue("#edtBu_Cd");
                $NC.setFocus("#edtBu_Cd");
                rowData.BU_CD = "";
            } else {
                rowData.BU_CD = args.val;
            }
            break;
        case "BU_NM":
            rowData.BU_NM = args.val;
            if ($NC.isNull(rowData.BU_FULL_NM)) {
                rowData.BU_FULL_NM = rowData.BU_NM;
                $NC.setValue("#edtBu_Full_Nm", rowData.BU_FULL_NM);
            }
            break;
        case "BU_FULL_NM":
            rowData.BU_FULL_NM = args.val;
            break;
        case "BU_DIV":
            rowData.BU_DIV = args.val;
            rowData.BU_DIV_F = $NC.getValueCombo(args.view, "F");
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
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC03060E0.002", "거래일자를 정확히 입력하십시오."), "N");
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC03060E0.003", "종료일자를 정확히 입력하십시오."), "N");
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
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL1);
    $NC.clearGridData(G_GRDDETAIL2);
    $NC.clearGridData(G_GRDDETAIL3);
    $NC.clearGridData(G_GRDDETAIL4);

    // 사업부상세정보 컴퍼넌트 초기화.
    setInputValue("#grdMaster");
    // 에디터 Disable
    $NC.setEnableGroup("#divDetailInfoView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    $NC.setInitGridVar(G_GRDDETAIL1);
    $NC.setInitGridVar(G_GRDDETAIL2);

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");
    var USER_ID = $NC.G_USERINFO.USER_ID;

    // 관리브랜드 데이터 조회
    G_GRDDETAIL1.queryParams = {
        P_CUST_CD: CUST_CD
    };
    $NC.serviceCallAndWait("/CMC03060E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);

    // 브랜드 데이터 조회
    G_GRDDETAIL2.queryParams = {
        P_CUST_CD: CUST_CD
    };
    $NC.serviceCallAndWait("/CMC03060E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL2), onGetDetail2);

    if ($NC.G_VAR.policyVal.CM210 == "2") {

        $NC.setInitGridVar(G_GRDDETAIL3);
        $NC.setInitGridVar(G_GRDDETAIL4);

        // 재고제공사업부 데이터 조회
        G_GRDDETAIL3.queryParams = {
            P_CUST_CD: CUST_CD
        };
        $NC.serviceCallAndWait("/CMC03060E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL3), onGetDetail3);

        // 사업부 조회
        G_GRDDETAIL4.queryParams = {
            P_CUST_CD: CUST_CD
        };
        $NC.serviceCallAndWait("/CMC03060E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL4), onGetDetail4);
    }

    // 사업부 정보 조회
    G_GRDMASTER.queryParams = {
        P_CUST_CD: CUST_CD,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3,
        P_USER_ID: USER_ID
    };
    $NC.serviceCall("/CMC03060E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

function _OnLoaded() {

    // Safari에서 그리드의 Viewport 위치가 정상적으로 표시되지 않아서 Resize 호출
    $NC.onGlobalResize();
}

function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var CUST_NM = $NC.getValue("#edtQCust_Nm");

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        BU_CD: null,
        BU_NM: null,
        BU_DIV: "01",
        BU_DIV_F: $NC.getValueCombo("#cboBu_Div", {
            searchVal: "01",
            returnVal: "F"
        }),
        BU_FULL_NM: null,
        CUST_CD: CUST_CD,
        CUST_NM: CUST_NM,
        REG_USER_ID: null,
        REG_DATETIME: null,
        ZIP_CD: null,
        ADDR_BASIC: null,
        ADDR_DETAIL: null,
        CHARGE_NM: null,
        TEL_NO: null,
        DEAL_DIV: "1",
        OPEN_DATE: null,
        CLOSE_DATE: null,
        REMARK1: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 이전 데이터가 한건도 없었으면 에디터 Enable
    if (G_GRDMASTER.data.getLength() == 0) {
        $NC.setEnableGroup("#divDetailInfoView", true);
    }

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);

    if (G_GRDDETAIL1.data.getLength() == 0) {
        $NC.setGridDisplayRows(G_GRDDETAIL1, 0, 0);
    }

    if ($NC.G_VAR.policyVal.CM210 == "2" && G_GRDDETAIL3.data.getLength() == 0) {
        $NC.setGridDisplayRows(G_GRDDETAIL3, 0, 0);
    }
}

/*
 * * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC03060E0.004", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 사업부 마스터
    var dsD = [];
    var dsCU = [];
    var dsMaster, dsDetail, dsSub, dsTarget, rowData, rIndex, rCount;
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsMaster = dsD;
        } else {
            dsMaster = dsCU;
        }
        dsMaster.push({
            P_BU_CD: rowData.BU_CD,
            P_BU_NM: rowData.BU_NM,
            P_BU_FULL_NM: rowData.BU_FULL_NM,
            P_BU_DIV: rowData.BU_DIV,
            P_CUST_CD: rowData.CUST_CD,
            P_ZIP_CD: rowData.ZIP_CD,
            P_ADDR_BASIC: rowData.ADDR_BASIC,
            P_ADDR_DETAIL: rowData.ADDR_DETAIL,
            P_CHARGE_NM: rowData.CHARGE_NM,
            P_TEL_NO: rowData.TEL_NO,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }
    dsMaster = dsD.concat(dsCU);

    // 사업부운용 브랜드 마스터
    dsD = [];
    dsCU = [];
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    dsTarget = G_GRDDETAIL1.data.getItems();
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
            P_BRAND_CD: rowData.BRAND_CD,
            P_CRUD: rowData.CRUD
        });
    }
    dsDetail = dsD.concat(dsCU);

    // 사업부운용 재고제공사업부 마스터
    dsD = [];
    dsCU = [];
    if ($NC.G_VAR.policyVal.CM210 == "2") {
        // 필터링 된 데이터라 전체 데이터를 기준으로 처리
        dsTarget = G_GRDDETAIL3.data.getItems();
        for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
            rowData = dsTarget[rIndex];
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
                dsSub = dsD;
            } else {
                dsSub = dsCU;
            }
            dsSub.push({
                P_BU_CD: rowData.BU_CD,
                P_PROVIDE_BU_CD: rowData.PROVIDE_BU_CD,
                P_PROVIDE_BU_NM: rowData.PROVIDE_BU_NM,
                P_PROVIDE_ORDER: rowData.PROVIDE_ORDER,
                P_CRUD: rowData.CRUD
            });
        }
    }
    dsSub = dsD.concat(dsCU);

    if (dsMaster.length == 0 && dsDetail.length == 0 && dsSub.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC03060E0.005", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC03060E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_DS_SUB: dsSub,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03060E0.006", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC03060E0.007", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    var rIndex;
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        // 사업부 삭제 전 해당 사업부의 브랜드, 재고제공사업부 삭제, 신규 데이터이기 때문에 Grid에서만 데이터 삭제
        // 브랜드 삭제 - 필터링 되어 있기 때문에 보이는 데이터만 삭제
        for (rIndex = G_GRDDETAIL1.data.getLength() - 1; rIndex >= 0; rIndex--) {
            G_GRDDETAIL1.data.deleteItem(G_GRDDETAIL1.data.getItem(rIndex).id);
        }
        // 재고제공사업부 삭제 - 필터링 되어 있기 때문에 보이는 데이터만 삭제
        if ($NC.G_VAR.policyVal.CM210 == "2") {
            for (rIndex = G_GRDDETAIL3.data.getLength() - 1; rIndex >= 0; rIndex--) {
                G_GRDDETAIL3.data.deleteItem(G_GRDDETAIL3.data.getItem(rIndex).id);
            }
        }
        if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
            $NC.setEnableGroup("#divDetailInfoView", false);
            setInputValue("#grdMaster");
        }
    } else {
        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDMASTER.data.updateItem(rowData.id, rowData);

        // 사업부 삭제 전 해당 사업부의 브랜드, 재고제공사업부 삭제
        // 사업부 삭제시 Java에서 관련 데이터 모두 삭제하므로 Grid에서만 데이터 삭제
        // 브랜드 삭제 - 필터링 되어 있기 때문에 보이는 데이터만 삭제
        for (rIndex = G_GRDDETAIL1.data.getLength() - 1; rIndex >= 0; rIndex--) {
            G_GRDDETAIL1.data.deleteItem(G_GRDDETAIL1.data.getItem(rIndex).id);
        }
        // 재고제공사업부 삭제 - 필터링 되어 있기 때문에 보이는 데이터만 삭제
        if ($NC.G_VAR.policyVal.CM210 == "2") {
            for (rIndex = G_GRDDETAIL3.data.getLength() - 1; rIndex >= 0; rIndex--) {
                G_GRDDETAIL3.data.deleteItem(G_GRDDETAIL3.data.getItem(rIndex).id);
            }
        }

        _Save();
    }
}

function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "BU_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부코드"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });
    $NC.setGridColumn(columns, {
        id: "BU_FULL_NM",
        field: "BU_FULL_NM",
        name: "정식명칭"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DIV_F",
        field: "BU_DIV_F",
        name: "사업부구분"
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

/**
 * 사업부정보 그리드 초기화.
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC03060E0.RS_MASTER",
        sortCol: "BU_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * 신규 데이터 생성 후 포커싱.
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {

    $NC.setFocus("#edtBu_Cd");
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "BU_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        // 신규일 때 사업부 코드가 없으면 신규 취소
        if ($NC.isNull(rowData.BU_CD)) {
            alert($NC.getDisplayMsg("JS.CMC03060E0.008", "사업부를 입력하십시오."));
            $NC.setFocus("#edtBu_Cd");
            return false;
        }
        if ($NC.isNull(rowData.BU_NM)) {
            alert($NC.getDisplayMsg("JS.CMC03060E0.009", "사업부명을 입력하십시오."));
            $NC.setFocus("#edtBu_Nm");
            $NC.setGridSelectRow(G_GRDMASTER, row);
            return false;
        }
        if ($NC.isNull(rowData.BU_FULL_NM)) {
            alert($NC.getDisplayMsg("JS.CMC03060E0.010", "정식명칭을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtBu_Full_Nm");
            return false;
        }
        if ($NC.isNull(rowData.BU_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC03060E0.011", "사업부구분을 선택하십시오."));
            $NC.setFocus("#cboBu_Div");
            $NC.setGridSelectRow(G_GRDMASTER, row);
            return false;
        }
        if ($NC.isNull(rowData.CUST_CD)) {
            alert($NC.getDisplayMsg("JS.CMC03060E0.012", "고객사코드를 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboCust_Cd");
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC03060E0.013", "거래구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#rgbDeal_Div");
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC03060E0.014", "거래일자와 종료일자의 범위 입력오류입니다."));
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

/**
 * Row Change Event.b
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 관리브랜드 필터링
    $NC.setInitGridVar(G_GRDDETAIL1);
    $NC.setGridFilterValue(G_GRDDETAIL1, rowData.BU_CD);

    // 브랜드 필터링
    $NC.setInitGridVar(G_GRDDETAIL2);
    $NC.setGridFilterValue(G_GRDDETAIL2, rowData.CUST_CD);

    if ($NC.G_VAR.policyVal.CM210 == "2") {

        // 재고제공사업부 필터링
        $NC.setInitGridVar(G_GRDDETAIL3);
        $NC.setGridFilterValue(G_GRDDETAIL3, rowData.BU_CD);

        // 사업부 필터링
        $NC.setInitGridVar(G_GRDDETAIL4);
        $NC.setGridFilterValue(G_GRDDETAIL4, [
            rowData.CUST_CD,
            rowData.BU_CD
        ]);
    }

    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 그리드 데이터를 컴퍼넌트로 binding.
 */
function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }
        // 선택된 로우 데이터로 에디터 세팅
        $NC.setValue("#edtBu_Cd", rowData.BU_CD);
        $NC.setValue("#cboBu_Div", rowData.BU_DIV);
        $NC.setValue("#edtBu_Nm", rowData.BU_NM);
        $NC.setValue("#edtBu_Full_Nm", rowData.BU_FULL_NM);
        $NC.setValue("#edtRemark1", rowData.REMARK1);
        $NC.setValue("#edtCust_Cd", rowData.CUST_CD);
        $NC.setValue("#edtCust_Nm", rowData.CUST_NM);
        $NC.setValue("#edtZip_Cd", rowData.ZIP_CD);
        $NC.setValue("#edtAddr_Basic", rowData.ADDR_BASIC);
        $NC.setValue("#edtAddr_Detail", rowData.ADDR_DETAIL);
        $NC.setValue("#edtCharge_Nm", rowData.CHARGE_NM);
        $NC.setValue("#edtTel_No", rowData.TEL_NO);
        $NC.setValue("#edtSalesman_Nm", rowData.SALESMAN_NM);
        $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV == "1");
        $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV == "2");
        $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV == "3");
        $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
        $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
        // 신규 데이터면 사업부코드 수정할 수 있게 함
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtBu_Cd");
            var editable = G_GRDDETAIL1.data.getLength() == 0 && G_GRDDETAIL3.data.getLength() == 0;
            $NC.setEnable("#edtCust_Cd", editable);
            $NC.setEnable("#btnCust_Cd", editable);
        } else {
            $NC.setEnable("#edtBu_Cd", false);
            $NC.setEnable("#edtCust_Cd", false);
            $NC.setEnable("#btnCust_Cd", false);
        }
        return true;

    }
}

function grdDetail1OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "명칭"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 관리브랜드 그리드 초기화.
 */
function grdDetail1Initialize() {

    var options = {
        multiSelect: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail1", {
        columns: grdDetail1OnGetColumns(),
        queryId: "CMC03060E0.RS_SUB1",
        sortCol: "BRAND_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 브랜드 %d건 삭제",
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
                    result = "[브랜드: " + $NC.getDisplayCombo(rowData.BRAND_CD, rowData.BRAND_NM) + "]를 삭제";
                } else {
                    result = "[브랜드: " + $NC.getDisplayCombo(rowData.BRAND_CD, rowData.BRAND_NM) + "] 외 " + (dd.dragCount - 1) + "건 삭제";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdDetail2",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                btnAddBrandOnClick();
            }
        }
    });

    G_GRDDETAIL1.view.onSelectedRowsChanged.subscribe(grdDetail1OnAfterScroll);
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail1OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL1, args.rows, e)) {
        if (args.rows.length == 0) {
            // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
            if (G_GRDDETAIL1.data.getLength() == 0) {
                $NC.setGridDisplayRows(G_GRDDETAIL1, 0, 0);
            } else {
                $NC.setGridSelectRow(G_GRDDETAIL1, G_GRDDETAIL1.lastRow);
            }
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL1, row + 1);
}

function grdDetail2OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "명칭"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 브랜드 그리드 초기화.
 */
function grdDetail2Initialize() {

    var options = {
        multiSelect: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail2", {
        columns: grdDetail2OnGetColumns(),
        queryId: "CMC03060E0.RS_SUB2",
        sortCol: "BRAND_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 브랜드 %d건 추가",
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
                    result = "[브랜드: " + $NC.getDisplayCombo(rowData.BRAND_CD, rowData.BRAND_NM) + "]를 추가";
                } else {
                    result = "[브랜드: " + $NC.getDisplayCombo(rowData.BRAND_CD, rowData.BRAND_NM) + "] 외 " + (dd.dragCount - 1) + "건 추가";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdDetail1",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                btnDeleteBrandOnClick();
            }
        }
    });

    G_GRDDETAIL2.view.onSelectedRowsChanged.subscribe(grdDetail2OnAfterScroll);
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail2OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL2, args.rows, e)) {
        if (args.rows.length == 0) {
            // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
            if (G_GRDDETAIL2.data.getLength() == 0) {
                $NC.setGridDisplayRows(G_GRDDETAIL2, 0, 0);
            } else {
                $NC.setGridSelectRow(G_GRDDETAIL2, G_GRDDETAIL2.lastRow);
            }
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL2, row + 1);
}

function grdDetail3OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "PROVIDE_BU_CD",
        field: "PROVIDE_BU_CD",
        name: "코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PROVIDE_BU_NM",
        field: "PROVIDE_BU_NM",
        name: "명칭"
    });
    /*
     * $NC.setGridColumn(columns, { id: "PROVIDE_ORDER", field: "PROVIDE_ORDER", name: "순위", minWidth: 80, cssClass:
     * "styRight" });
     */

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 관리브랜드 그리드 초기화.
 */
function grdDetail3Initialize() {

    var options = {
        multiSelect: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail3", {
        columns: grdDetail3OnGetColumns(),
        queryId: "CMC03060E0.RS_SUB3",
        sortCol: "PROVIDE_ORDER",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 사업부 %d건 삭제",
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
                    result = "[사업부: " + $NC.getDisplayCombo(rowData.BU_CD, rowData.BU_NM) + "]를 삭제";
                } else {
                    result = "[사업부: " + $NC.getDisplayCombo(rowData.BU_CD, rowData.BU_NM) + "] 외 " + (dd.dragCount - 1) + "건 삭제";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdDetail4",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                btnAddBuOnClick();
            }
        }
    });

    G_GRDDETAIL3.view.onSelectedRowsChanged.subscribe(grdDetail3OnAfterScroll);
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail3OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL3, args.rows, e)) {
        if (args.rows.length == 0) {
            // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
            if (G_GRDDETAIL3.data.getLength() == 0) {
                $NC.setGridDisplayRows(G_GRDDETAIL3, 0, 0);
            } else {
                $NC.setGridSelectRow(G_GRDDETAIL3, G_GRDDETAIL3.lastRow);
            }
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL3, row + 1);
}

function grdDetail4OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "명칭"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 브랜드 그리드 초기화.
 */
function grdDetail4Initialize() {

    var options = {
        multiSelect: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail4", {
        columns: grdDetail4OnGetColumns(),
        queryId: "CMC03060E0.RS_SUB4",
        sortCol: "BU_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 사업부 %d건 추가",
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
                    result = "[사업부: " + $NC.getDisplayCombo(rowData.BU_CD, rowData.BU_NM) + "]를 추가";
                } else {
                    result = "[사업부: " + $NC.getDisplayCombo(rowData.BU_CD, rowData.BU_NM) + "] 외 " + (dd.dragCount - 1) + "건 추가";
                }
                return result;
            }
        },
        dropOptions: {
            dropAccept: "#grdDetail3",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                btnDeleteBuOnClick();
            }
        }
    });

    G_GRDDETAIL4.view.onSelectedRowsChanged.subscribe(grdDetail4OnAfterScroll);
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail4OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL4, args.rows, e)) {
        if (args.rows.length == 0) {
            // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
            if (G_GRDDETAIL4.data.getLength() == 0) {
                $NC.setGridDisplayRows(G_GRDDETAIL4, 0, 0);
            } else {
                $NC.setGridSelectRow(G_GRDDETAIL4, G_GRDDETAIL4.lastRow);
            }
        }
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL4, row + 1);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "BU_CD", true)) {
        $NC.setEnableGroup("#divDetailInfoView", true);
        $NC.setEnable("#edtBu_Cd", false);
        $NC.setEnable("#edtCust_Cd", false);
        $NC.setEnable("#btnCust_Cd", false);
    } else {
        $NC.setEnableGroup("#divDetailInfoView", false);
        setInputValue("#grdMaster");
    }

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail1(ajaxData) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setGridFilterValue(G_GRDDETAIL1, $NC.isNotNull(rowData) ? rowData.BU_CD : "");
    $NC.setInitGridData(G_GRDDETAIL1, ajaxData, grdDetail1OnFilter);
    $NC.setInitGridAfterOpen(G_GRDDETAIL1);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail2(ajaxData) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setGridFilterValue(G_GRDDETAIL2, $NC.isNotNull(rowData) ? rowData.CUST_CD : "");
    $NC.setInitGridData(G_GRDDETAIL2, ajaxData, grdDetail2OnFilter);
    $NC.setInitGridAfterOpen(G_GRDDETAIL2);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail3(ajaxData) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setGridFilterValue(G_GRDDETAIL3, $NC.isNotNull(rowData) ? rowData.BU_CD : "");
    $NC.setInitGridData(G_GRDDETAIL3, ajaxData, grdDetail3OnFilter);
    $NC.setInitGridAfterOpen(G_GRDDETAIL3);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail4(ajaxData) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setGridFilterValue(G_GRDDETAIL4, $NC.isNotNull(rowData) ? [
        rowData.CUST_CD,
        rowData.BU_CD
    ] : [
        "",
        ""
    ]);
    $NC.setInitGridData(G_GRDDETAIL4, ajaxData, grdDetail4OnFilter);
    $NC.setInitGridAfterOpen(G_GRDDETAIL4);
}

/**
 * grdDetail1 데이터 필터링 이벤트
 */
function grdDetail1OnFilter(item) {

    return G_GRDDETAIL1.lastFilterVal == item.BU_CD //
        && item.CRUD != $ND.C_DV_CRUD_D;
}

function grdDetail2OnFilter(item) {

    return G_GRDDETAIL2.lastFilterVal == item.CUST_CD //
        && item.CRUD != $ND.C_DV_CRUD_D;
}

function grdDetail3OnFilter(item) {

    return G_GRDDETAIL3.lastFilterVal == item.BU_CD //
        && item.CRUD != $ND.C_DV_CRUD_D;
}

function grdDetail4OnFilter(item) {

    return G_GRDDETAIL4.lastFilterVal[0] == item.CUST_CD //
        && G_GRDDETAIL4.lastFilterVal[1] != item.BU_CD //
        && item.CRUD != $ND.C_DV_CRUD_D;
}

function btnAddBrandOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03060E0.015", "브랜드를 추가할 사업부를 선택하십시오."));
        return;
    }

    if (G_GRDDETAIL2.data.getLength() == 0) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (refRowData.CRUD == $ND.C_DV_CRUD_C || refRowData.CRUD == $ND.C_DV_CRUD_N) {
        alert($NC.getDisplayMsg("JS.CMC03060E0.016", "신규 사업부입니다. 저장 후 등록하십시오."));
        return;
    }

    // 추가할 선택 Rows
    var selectedRows = G_GRDDETAIL2.view.getSelectedRows();
    var BU_CD = $NC.getValue("#edtBu_Cd");

    var rowData, newRowData;
    G_GRDDETAIL1.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDDETAIL2.data.getItem(selectedRows[rIndex]);
            // 추가되어 있는지 체크
            if ($NC.getGridSearchRow(G_GRDDETAIL1, {
                searchKey: "BRAND_CD",
                searchVal: rowData.BRAND_CD
            }) != -1) {
                continue;
            }

            newRowData = {
                BU_CD: BU_CD,
                BRAND_CD: rowData.BRAND_CD,
                BRAND_NM: rowData.BRAND_NM,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };

            G_GRDDETAIL1.data.addItem(newRowData);
        }
    } finally {
        G_GRDDETAIL1.data.endUpdate();
    }

    // 관리브랜드 정렬
    $NC.setGridSort(G_GRDDETAIL1, {
        sortColumns: {
            columnId: "BRAND_CD",
            sortAsc: true
        }
    });

    $NC.setGridSelectRow(G_GRDDETAIL2, selectedRows[selectedRows.length - 1]);
}

function btnDeleteBrandOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDDETAIL1.data.getLength() == 0) {
        return;
    }

    // 삭제할 선택 Rows
    var selectedRows = G_GRDDETAIL1.view.getSelectedRows();

    var rowData;
    G_GRDDETAIL1.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDDETAIL1.data.getItem(selectedRows[rIndex]);
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                rowData.CRUD = $ND.C_DV_CRUD_D;
                G_GRDDETAIL1.data.updateItem(rowData.id, rowData);
            } else {
                G_GRDDETAIL1.data.deleteItem(rowData.id);
            }
        }
    } finally {
        G_GRDDETAIL1.data.endUpdate();
    }

    if (G_GRDDETAIL1.data.getLength() == 0) {
        $NC.setGridDisplayRows(G_GRDDETAIL1, 0, 0);
    } else {
        $NC.setGridSelectRow(G_GRDDETAIL1, G_GRDDETAIL1.data.getLength() - 1);
    }
}

function btnAddBuOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03060E0.017", "재고제공사업부를 추가할 사업부를 선택하십시오."));
        return;
    }

    if (G_GRDDETAIL4.data.getLength() == 0) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (refRowData.CRUD == $ND.C_DV_CRUD_C || refRowData.CRUD == $ND.C_DV_CRUD_N) {
        alert($NC.getDisplayMsg("JS.CMC03060E0.016", "신규 사업부입니다. 저장 후 등록하십시오."));
        return;
    }

    // 추가할 선택 Rows
    var selectedRows = G_GRDDETAIL4.view.getSelectedRows();
    var BU_CD = $NC.getValue("#edtBu_Cd");

    var rowData, newRowData;
    G_GRDDETAIL3.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDDETAIL4.data.getItem(selectedRows[rIndex]);
            // 추가되어 있는지 체크
            if ($NC.getGridSearchRow(G_GRDDETAIL3, {
                searchKey: "PROVIDE_BU_CD",
                searchVal: rowData.BU_CD
            }) != -1) {
                continue;
            }

            newRowData = {
                BU_CD: BU_CD,
                PROVIDE_BU_CD: rowData.BU_CD,
                PROVIDE_BU_NM: rowData.BU_NM,
                PROVIDE_ORDER: 0,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };

            G_GRDDETAIL3.data.addItem(newRowData);
        }
    } finally {
        G_GRDDETAIL3.data.endUpdate();
    }

    // 재고제공사업부 정렬
    $NC.setGridSort(G_GRDDETAIL3, {
        sortColumns: {
            columnId: "BU_CD",
            sortAsc: true
        }
    });

    $NC.setGridSelectRow(G_GRDDETAIL4, selectedRows[selectedRows.length - 1]);
}

function btnDeleteBuOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDDETAIL3.data.getLength() == 0) {
        return;
    }

    // 삭제할 선택 Rows
    var selectedRows = G_GRDDETAIL3.view.getSelectedRows();

    var rowData;
    G_GRDDETAIL3.data.beginUpdate();
    for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL3.data.getItem(selectedRows[rIndex]);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDDETAIL3.data.updateItem(rowData.id, rowData);
        } else {
            G_GRDDETAIL3.data.deleteItem(rowData.id);
        }
    }
    G_GRDDETAIL3.data.endUpdate();

    if (G_GRDDETAIL3.data.getLength() == 0) {
        $NC.setGridDisplayRows(G_GRDDETAIL3, 0, 0);
    } else {
        $NC.setGridSelectRow(G_GRDDETAIL3, G_GRDDETAIL3.data.getLength() - 1);
    }
}

/**
 * 저장 성공시
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "BU_CD"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장 실패시
 * 
 * @param ajaxData
 */
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
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // 재고 제공사업부 관리 정책 (1:관리안함, 2:관리함)
        if ($NC.G_VAR.policyVal.CM210 == "1") {
            $("#divSubView1").css("border-bottom-width", 0);
            $("#divSubView2").css("border-bottom-width", 0);
            $("#divGrdBottomView").hide();
        } else {
            $("#divSubView1").css("border-bottom-width", 1);
            $("#divSubView2").css("border-bottom-width", 1);
            $("#divGrdBottomView").show();
        }
        $NC.onGlobalResize();
    });
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
        P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
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

    $NC.setGridFilterValue(G_GRDDETAIL2, rowData.CUST_CD);
    if ($NC.G_VAR.policyVal.CM210 == "2") {
        $NC.setGridFilterValue(G_GRDDETAIL4, [
            rowData.CUST_CD,
            G_GRDDETAIL4.lastFilterVal[1]
        ]);
    }
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
