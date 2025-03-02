﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC01010E0
 *  프로그램명         : 사용자관리
 *  프로그램설명       : 사용자관리 화면 Javascript
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
        },
        // 체크할 정책 값
        policyVal: {
            CS130: "", // 사용자 비밀번호 오류 시스템 사용제한 기준
            CS141: "" // 장기 미사용자 시스템 사용 기준
        },
        // 프로그램권한세팅사용
        useProgramRoleSetting: false
    });

    // 초기화 및 초기값 세팅
    // 탭 초기화
    $NC.setInitTab("#divRightView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 초기 숨김 처리
    $NC.setVisible("#btnDormantUser", false);
    $NC.setVisible("#btnPwdErrorUser", false);
    $NC.setVisible("#btnProgramRole", $NC.G_VAR.useProgramRoleSetting);

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divRightView", false);

    // 이벤트 연결
    $("#btnEntryUser").click(btnEntryUserOnClick);
    $("#btnDormantUser").click(btnDormantUserOnClick);
    $("#btnPwdErrorUser").click(btnPwdErrorUserOnClick);
    $("#btnProgramRole").click(btnProgramRoleOnClick);
    $("#btnQBu_Cd").click(showBuPopup);
    $("#btnAddCenter").click(btnAddCenterOnClick);
    $("#btnDeleteCenter").click(btnDeleteCenterOnClick);
    $("#btnAddBu").click(btnAddBuOnClick);
    $("#btnDeleteBu").click(btnDeleteBuOnClick);
    $("#btnVendor_Cd").click(showVendorPopup);
    $("#btnCarrier_Cd").click(showCarrierPopup);
    $("#btnCar_Cd").click(showCarPopup);
    $("#btnUser_Cust_Cd").click(showCustPopup);
    $("#btnUser_Dept_Cd").click(showDeptPopup);

    // 그리드 초기화
    grdMasterInitialize();
    // 물류센터
    grdDetail1Initialize();
    grdDetail2Initialize();
    // 사업부
    grdDetail3Initialize();
    grdDetail4Initialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCENTER",
                P_QUERY_ID: "WC.POP_CMCENTER",
                P_QUERY_PARAMS: {
                    P_CENTER_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CERTIFY_DIV_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CERTIFY_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CERTIFY_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CERTIFY_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ROLE_GROUP_DIV_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ROLE_GROUP_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ROLE_GROUP_DIV_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ROLE_GROUP_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_SYS_LANG",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "SYS_LANG",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_USER_WORK_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "USER_WORK_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 조회조건 - 물류센터 초기화
        $NC.setInitComboData({
            selector: "#cboQCenter_Cd",
            codeField: "CENTER_CD",
            nameField: "CENTER_NM",
            addAll: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCENTER),
            onComplete: function() {
                $NC.setValue("#cboQCenter_Cd", $ND.C_ALL);
            }
        });
        // 사용자구분
        // 조회조건 - 사용자구분 세팅
        $NC.setInitComboData({
            selector: "#cboQCertify_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CERTIFY_DIV_2),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQCertify_Div", $ND.C_ALL);
            }
        });
        // 사용자구분 세팅
        $NC.setInitComboData({
            selector: "#cboCertify_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CERTIFY_DIV_1),
            onComplete: function() {
                $NC.setValue("#cboCertify_Div");
            }
        });
        // 조회조건 - 프로그램권한그룹구분 세팅
        $NC.setInitComboData({
            selector: "#cboQRole_Group_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ROLE_GROUP_DIV_2),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQRole_Group_Div", $ND.C_ALL);
            }
        });
        // 프로그램권한그룹구분 세팅
        $NC.setInitComboData({
            selector: "#cboRole_Group_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ROLE_GROUP_DIV_1),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboRole_Group_Div");
            }
        });
        // 기본언어 세팅
        $NC.setInitComboData({
            selector: "#cboSys_Lang",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_SYS_LANG),
            onComplete: function() {
                $NC.setValue("#cboSys_Lang");
            }
        });
        // 재직구분 세팅
        $NC.setInitComboData({
            selector: "#cboUser_Work_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_USER_WORK_DIV),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboUser_Work_Div");
            }
        });
    });

    $NC.setInitComboData({
        selector: "#cboQDelete_Yn",
        codeField: "DELETE_YN",
        nameField: "DELETE_YN_D",
        data: [
            {
                DELETE_YN: "N",
                DELETE_YN_D: $NC.getDisplayMsg("JS.CSC01010E0.032", "사용가능")
            },
            {
                DELETE_YN: "Y",
                DELETE_YN_D: $NC.getDisplayMsg("JS.CSC01010E0.033", "사용불가")
            }
        ],
        addAll: true,
        onComplete: function() {
            $NC.setValue("#cboQDelete_Yn", "N");
        }
    });

    // 전역 정책 값 세팅
    setPolicyValInfo();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.rightViewWidth = 500;
    $NC.G_OFFSET.rightViewMinHeight = $("#divT1TabSheetView").outerHeight(true) + $NC.G_LAYOUT.tabHeader;

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    // 물류센터/사업부 사이즈 조정
    viewHeight = $("#divT2TabSheetView").height() - $("#divT2DetailInfo").height();

    // 물류센터/사업부 컨테이너 리사이즈
    $NC.resizeSplitView({
        containers: [
            "#divGrdTopView",
            "#divGrdBottomView"
        ]
    }, "v", null, null, viewHeight);
    // 물류센터 그리드 리사이즈
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
    // 사업부 그리드 리사이즈
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

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;
    // 저장

    $NC.setEnable("#btnEntryUser", permission.canSave && enable);
    $NC.setEnable("#btnProgramRole", permission.canSave && enable);
    $NC.setEnable("#btnDormantUser", permission.canSave && enable);
    $NC.setEnable("#btnPwdErrorUser", permission.canSave && enable);
    $NC.setEnableButton("#divRightView", permission.canSave && enable);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BU_CD":
            $NP.onBuChange(val, {
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onBuPopup);
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
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL1);
    $NC.clearGridData(G_GRDDETAIL2);
    $NC.clearGridData(G_GRDDETAIL3);
    $NC.clearGridData(G_GRDDETAIL4);

    // 사용자상세정보 컴퍼넌트 초기화.
    setInputValue("#grdMaster");
    // 에디터 Disable
    $NC.setEnableGroup("#divT1TabSheetView", false);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 * @param view
 *        대상 Object
 * @param args
 *        row, cell, value
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
            // 체크에 대한 기본 처리
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            // 사용자 정보
            var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
            // 마지막 체크 처리한 정보
            var lastRowData = grdObject.data.getItem(args.row);
            var rowData, rIndex, rCount;
            // 체크했을 경우는 현재 체크한 데이터를 제외한 나머지는 체크해제
            if (lastRowData.CHECK_YN == $ND.C_YES) {
                grdObject.data.beginUpdate();
                try {
                    for (rIndex = 0, rCount = grdObject.data.getLength(); rIndex < rCount; rIndex++) {
                        rowData = grdObject.data.getItem(rIndex);
                        if (lastRowData.id != rowData.id && rowData.CHECK_YN == $ND.C_YES) {
                            rowData.CHECK_YN = $ND.C_NO;
                            grdObject.data.updateItem(rowData.id, rowData);
                        }
                    }
                } finally {
                    grdObject.data.endUpdate();
                }
                // 체크시 사용자의 기본물류센터/사업부를 체크한 데이터로 변경
                // 관리물류센터 그리드일 경우
                if (args.grid == "grdDetail1") {
                    refRowData.CENTER_CD = lastRowData.CENTER_CD;
                    refRowData.CENTER_NM = lastRowData.CENTER_NM;
                }
                // 관리사업부 그리드일 경우
                else if (args.grid == "grdDetail3") {
                    refRowData.BU_CD = lastRowData.BU_CD;
                    refRowData.BU_NM = lastRowData.BU_NM;
                    refRowData.CUST_CD = lastRowData.CUST_CD;
                    refRowData.CUST_NM = lastRowData.CUST_NM;
                }
                // 그외 처리 안함
                else {
                    refRowData = null;
                }
            }
            // 체크해제시는 모두해제 되었기 때문에 기본물류센터/사업부를 제거
            else {
                // 관리물류센터 그리드일 경우
                if (args.grid == "grdDetail1") {
                    refRowData.CENTER_CD = null;
                    refRowData.CENTER_NM = null;
                }
                // 관리사업부 그리드일 경우
                else if (args.grid == "grdDetail3") {
                    refRowData.BU_CD = null;
                    refRowData.BU_NM = null;
                    refRowData.CUST_CD = null;
                    refRowData.CUST_NM = null;
                }
                // 그외 처리 안함
                else {
                    refRowData = null;
                }
            }

            if ($NC.isNotNull(refRowData)) {
                // 관리물류센터 그리드일 경우
                if (args.grid == "grdDetail1") {
                    $NC.setValue("#edtCenter_Cd", refRowData.CENTER_CD);
                    $NC.setValue("#edtCenter_Nm", refRowData.CENTER_NM);
                }
                // 관리사업부 그리드일 경우
                else if (args.grid == "grdDetail3") {
                    $NC.setValue("#edtBu_Cd", refRowData.BU_CD);
                    $NC.setValue("#edtBu_Nm", refRowData.BU_NM);
                    $NC.setValue("#edtCust_Cd", refRowData.CUST_CD);
                    $NC.setValue("#edtCust_Nm", refRowData.CUST_NM);
                }

                if (refRowData.CRUD == $ND.C_DV_CRUD_N) {
                    refRowData.CRUD = $ND.C_DV_CRUD_C;
                }
                // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
                $NC.setGridApplyChange(G_GRDMASTER, refRowData);
            }
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    setInputValue("#grdMaster");

    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var CERTIFY_DIV = $NC.getValue("#cboQCertify_Div", true);
    var DELETE_YN = $NC.getValue("#cboQDelete_Yn", true);
    var ROLE_GROUP_DIV = $NC.getValue("#cboQRole_Group_Div", true);

    // User Center 데이터 조회
    $NC.setInitGridVar(G_GRDDETAIL1);
    $NC.serviceCallAndWait("/CSC01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);

    // User Bu 데이터 조회
    $NC.setInitGridVar(G_GRDDETAIL3);
    $NC.serviceCall("/CSC01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL3), onGetDetail3);

    // Center 데이터 조회
    $NC.setInitGridVar(G_GRDDETAIL2);
    G_GRDDETAIL2.queryParams = {
        P_CENTER_CD: $ND.C_ALL
    };
    $NC.serviceCallAndWait("/CSC01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL2), onGetDetail2);

    // Bu 데이터 조회
    $NC.setInitGridVar(G_GRDDETAIL4);
    G_GRDDETAIL4.queryParams = {
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2"
    };
    $NC.serviceCall("/CSC01010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL4), onGetDetail4);

    // 사용자 정보 조회
    $NC.setInitGridVar(G_GRDMASTER);
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_CERTIFY_DIV: CERTIFY_DIV,
        P_DELETE_YN: DELETE_YN,
        P_ROLE_GROUP_DIV: ROLE_GROUP_DIV
    };
    $NC.serviceCall("/CSC01010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

function _OnLoaded() {

    // Safari에서 관리물류센터, 물류센터 그리드의 Viewport 위치가 정상적으로 표시되지 않아서 Resize 호출
    $NC.onGlobalResize();
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 조회조건의 사용자구분이 전체일 경우 초기값으로 사용자구분의 첫번째 값 세팅
    var CERTIFY_DIV = $NC.getValue("#cboQCertify_Div");
    if (CERTIFY_DIV == $ND.C_ALL) {
        $NC.setValue("#cboCertify_Div", 0);
        CERTIFY_DIV = $NC.getValue("#cboCertify_Div");
    }
    var certifyData = $NC.getComboData("#cboCertify_Div", CERTIFY_DIV);
    var ROLE_GROUP_DIV = $NC.getValue("#cboQRole_Group_Div");
    if (ROLE_GROUP_DIV == $ND.C_ALL) {
        $NC.setValue("#cboRole_Group_Div", 1);
        ROLE_GROUP_DIV = $NC.getValue("#cboRole_Group_Div");
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        USER_ID: null,
        USER_NM: null,
        USER_PWD: null,
        ORG_USER_PWD: null,
        CERTIFY_DIV: CERTIFY_DIV,
        ROLE_GROUP_DIV: ROLE_GROUP_DIV,
        CENTER_CD: null,
        BU_CD: null,
        CUST_CD: null,
        VENDOR_CD: null,
        CARRIER_CD: null,
        CAR_CD: null,
        SYS_LANG: "1",
        EMPLOYEE_ID: null,
        USER_CUST_CD: null,
        USER_DEPT_CD: null,
        USER_HP: null,
        USER_EMAIL: null,
        USER_WORK_DIV: "1",
        ENTRY_COMMENT: null,
        DELETE_COMMENT: null,
        DELETE_YN: $ND.C_NO,
        REMARK1: null,
        REG_USER_ID: null,
        REG_DATETIME: null,
        CERTIFY_DIV_F: certifyData.COMMON_CD_F,
        CERTIFY_DIV_ATTR01_CD: certifyData.ATTR01_CD,
        ROLE_GROUP_DIV_F: $NC.getValueCombo("#cboRole_Group_Div", {
            searchVal: ROLE_GROUP_DIV,
            returnVal: "F"
        }),
        SYS_LANG_F: $NC.getValueCombo("#cboSys_Lang", {
            searchVal: "1",
            returnVal: "F"
        }),
        USER_WORK_DIV_F: $NC.getValueCombo("#cboUser_Work_Div", {
            searchVal: "1",
            returnVal: "F"
        }),
        CENTER_NM: null,
        BU_NM: null,
        OLD_CERTIFY_DIV: null,
        OLD_ROLE_GROUP_DIV: null,
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
 * 신규 데이터 생성 후 포커싱.
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {

    $NC.setFocus("#edtUser_Id");
}

/**
 * 현재 선택된 row Validation 체크.
 * 
 * @param row
 * @returns {Boolean}
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "USER_ID")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        // 신규일 때 차량 코드가 없으면 신규 취소
        if ($NC.isNull(rowData.USER_ID)) {
            alert($NC.getDisplayMsg("JS.CSC01010E0.002", "사용자ID를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtUser_Id");
            return false;
        }
        if ($NC.isNull(rowData.USER_NM)) {
            alert($NC.getDisplayMsg("JS.CSC01010E0.003", "사용자명을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtUser_Nm");
            return false;
        }
        if ($NC.isNull(rowData.CERTIFY_DIV)) {
            alert($NC.getDisplayMsg("JS.CSC01010E0.004", "사용자구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboCertify_Div");
            return false;
        }
        if (rowData.CERTIFY_DIV == "30") {
            var VENDOR_CD = $NC.getValue("#edtVendor_Cd");
            if ($NC.isNull(VENDOR_CD)) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.005", "공급처를 선택하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#edtVendor_Cd");
                return false;
            }
        } else if (rowData.CERTIFY_DIV == "40") {
            var CARRIER_CD = $NC.getValue("#edtCarrier_Cd");
            if ($NC.isNull(CARRIER_CD)) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.006", "운송사를 선택하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#edtCarrier_Cd");
                return false;
            }
        } else if (rowData.CERTIFY_DIV == "50") {
            var CAR_CD = $NC.getValue("#edtCar_Cd");
            if ($NC.isNull(CAR_CD)) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.007", "차량을 선택하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#edtCar_Cd");
                return false;
            }
        }
        /*
        if ($NC.isNull(rowData.ROLE_GROUP_DIV)) {
            alert($NC.getDisplayMsg("JS.CSC01010E0.XXX", "프로그램 권한그룹구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboRole_Group_Div");
            return false;
        }
        */
        if ($NC.isNull(rowData.USER_PWD)) {
            alert($NC.getDisplayMsg("JS.CSC01010E0.008", "패스워드를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtUser_Pwd");
            return false;
        }
        if (rowData.CERTIFY_DIV_ATTR01_CD !== $ND.C_NO) {
            if ($NC.isNull(rowData.CENTER_CD)) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.009", "기본물류센터를 선택하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row);
                return false;
            }
            if ($NC.isNull(rowData.BU_CD)) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.010", "기본사업부를 선택하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row);
                return false;
            }
        }
        if ($NC.isNull(rowData.SYS_LANG)) {
            alert($NC.getDisplayMsg("JS.CSC01010E0.011", "기본언어를 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboSys_Lang");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.012", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 사용자 마스터
    var dsD = [];
    var dsCU = [];
    var dsMaster, dsDetail, dsSub, dsTarget, rowData, rIndex, rCount;
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.DELETE_YN == $ND.C_YES) {
            if ($NC.isNull(rowData.DELETE_COMMENT)) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.014", "삭제 사유를 입력하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, rIndex);
                $NC.setFocus("#edtDelete_Comment");
                return;
            }
        }
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        } else if (rowData.CRUD == $ND.C_DV_CRUD_D) {
            dsMaster = dsD;
        } else {
            dsMaster = dsCU;
        }
        dsMaster.push({
            P_USER_ID: rowData.USER_ID,
            P_USER_NM: rowData.USER_NM,
            P_USER_PWD: rowData.USER_PWD,
            P_ORG_USER_PWD: rowData.ORG_USER_PWD,
            P_CERTIFY_DIV: rowData.CERTIFY_DIV,
            P_ROLE_GROUP_DIV: rowData.ROLE_GROUP_DIV,
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_CUST_CD: rowData.CUST_CD,
            P_VENDOR_CD: rowData.VENDOR_CD,
            P_CARRIER_CD: rowData.CARRIER_CD,
            P_CAR_CD: rowData.CAR_CD,
            P_SYS_LANG: rowData.SYS_LANG,
            P_EMPLOYEE_ID: rowData.EMPLOYEE_ID,
            P_USER_CUST_CD: rowData.USER_CUST_CD,
            P_USER_DEPT_CD: rowData.USER_DEPT_CD,
            P_USER_HP: rowData.USER_HP,
            P_USER_EMAIL: rowData.USER_EMAIL,
            P_USER_WORK_DIV: rowData.USER_WORK_DIV,
            P_ENTRY_COMMENT: rowData.ENTRY_COMMENT,
            P_DELETE_COMMENT: rowData.DELETE_COMMENT,
            P_DELETE_YN: rowData.DELETE_YN,
            P_REMARK1: rowData.REMARK1,
            P_OLD_CERTIFY_DIV: rowData.OLD_CERTIFY_DIV,
            P_OLD_ROLE_GROUP_DIV: rowData.OLD_ROLE_GROUP_DIV,
            P_REG_USER_ID: null,
            P_REG_DATETIME: null,
            P_CRUD: rowData.CRUD
        });
    }
    dsMaster = dsD.concat(dsCU);

    // 사용자별운영센터 마스터
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
            P_USER_ID: rowData.USER_ID,
            P_CENTER_CD: rowData.CENTER_CD,
            P_REG_USER_ID: null,
            P_REG_DATETIME: null,
            P_CRUD: rowData.CRUD
        });
    }
    dsDetail = dsD.concat(dsCU);

    // 사용자별운영사업부 마스터
    dsD = [];
    dsCU = [];
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
            P_USER_ID: rowData.USER_ID,
            P_BU_CD: rowData.BU_CD,
            P_REG_USER_ID: null,
            P_REG_DATETIME: null,
            P_CRUD: rowData.CRUD
        });
    }
    dsSub = dsD.concat(dsCU);

    if (dsMaster.length == 0 && dsDetail.length == 0 && dsSub.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.013", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC01010E0/save.do", {
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
        alert($NC.getDisplayMsg("JS.CSC01010E0.015", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC01010E0.016", "삭제 하시겠습니까?"))) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (refRowData.CRUD == $ND.C_DV_CRUD_C || refRowData.CRUD == $ND.C_DV_CRUD_N) {
        if ($NC.deleteGridRowData(G_GRDMASTER, refRowData) == 0) {
            $NC.setEnableGroup("#divRightView", false);
            setInputValue("#grdMaster");
        }

        var dsTarget, rowData, rIndex;
        // 해당USER의 관리 물류센터 전체 삭제.
        dsTarget = G_GRDDETAIL1.data.getItems();
        for (rIndex = dsTarget.length - 1; rIndex > 0; rIndex--) {
            rowData = dsTarget[rIndex];
            if (rowData.USER_ID == refRowData.USER_ID) {
                G_GRDDETAIL1.data.deleteItem(rowData.id);
            }
        }

        // 해당USER의 관리 사업부 전체 삭제.
        dsTarget = G_GRDDETAIL3.data.getItems();
        for (rIndex = dsTarget.length - 1; rIndex > 0; rIndex--) {
            rowData = dsTarget[rIndex];
            if (rowData.USER_ID == refRowData.USER_ID) {
                G_GRDDETAIL3.data.deleteItem(rowData.id);
            }
        }
    } else {
        refRowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDMASTER.data.updateItem(refRowData.id, refRowData);

        $NC.serviceCall("/CSC01010E0/callUserDelete.do", {
            P_DELETE_USER_ID: refRowData.USER_ID,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveError);
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "USER_ID",
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CERTIFY_DIV_F",
        field: "CERTIFY_DIV_F",
        name: "사용자구분"
    });
    $NC.setGridColumn(columns, {
        id: "USER_ID",
        field: "USER_ID",
        name: "사용자ID"
    });
    $NC.setGridColumn(columns, {
        id: "USER_NM",
        field: "USER_NM",
        name: "사용자명"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_CD_B",
        field: "CENTER_CD",
        name: "기본물류센터",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_NM_B",
        field: "CENTER_NM",
        name: "기본물류센터명"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD_B",
        field: "BU_CD",
        name: "기본사업부",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM_B",
        field: "BU_NM",
        name: "기본사업부명"
    });
    $NC.setGridColumn(columns, {
        id: "SYS_LANG_F",
        field: "SYS_LANG_F",
        name: "기본언어"
    });
    $NC.setGridColumn(columns, {
        id: "ROLE_GROUP_DIV_F",
        field: "ROLE_GROUP_DIV_F",
        name: "권한그룹구분"
    });
    $NC.setGridColumn(columns, {
        id: "DELETE_YN",
        field: "DELETE_YN",
        name: "삭제여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "PWD_LAST_DATE",
        field: "PWD_LAST_DATE",
        name: "비밀번호변경일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "PWD_ERROR_CNT",
        field: "PWD_ERROR_CNT",
        name: "비밀번호오류건수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LOGIN_LAST_DATE",
        field: "LOGIN_LAST_DATE",
        name: "최종로그인일자",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 사용자정보 그리드 초기화.
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC01010E0.RS_MASTER",
        sortCol: "USER_ID",
        gridOptions: options,
        canDblClick: $NC.G_VAR.useProgramRoleSetting
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function grdMasterOnDblClick(e, args) {

    if ($NC.G_VAR.useProgramRoleSetting) {
        btnProgramRoleOnClick();
    }
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

    if (rowData.DELETE_YN == $ND.C_YES) {
        $NC.setEnable("#edtDelete_Comment", true);
    } else {
        $NC.setEnable("#edtDelete_Comment", false);
    }

    switch (rowData.CERTIFY_DIV) {
        case "30":
            $("#divVendorInfo").show();
            $("#divCarrierInfo").hide();
            $("#divCarInfo").hide();
            break;
        case "40":
            $("#divVendorInfo").hide();
            $("#divCarrierInfo").show();
            $("#divCarInfo").hide();
            break;
        case "50":
            $("#divVendorInfo").hide();
            $("#divCarrierInfo").hide();
            $("#divCarInfo").show();
            break;
        default:
            $("#divVendorInfo").hide();
            $("#divCarrierInfo").hide();
            $("#divCarInfo").hide();
            break;
    }

    // 관리물류센터 필터링
    $NC.setInitGridVar(G_GRDDETAIL1);
    $NC.setGridFilterValue(G_GRDDETAIL1, rowData.USER_ID);

    // 관리사업부 필터링
    $NC.setInitGridVar(G_GRDDETAIL3);
    $NC.setGridFilterValue(G_GRDDETAIL3, rowData.USER_ID);

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
        $NC.setValue("#edtUser_Id", rowData.USER_ID);
        $NC.setValue("#edtUser_Nm", rowData.USER_NM);
        $NC.setValue("#edtUser_Pwd", rowData.USER_PWD);
        $NC.setValue("#cboCertify_Div", rowData.CERTIFY_DIV);
        $NC.setValue("#cboRole_Group_Div", rowData.ROLE_GROUP_DIV);
        $NC.setValue("#edtCenter_Cd", rowData.CENTER_CD);
        $NC.setValue("#edtCenter_Nm", rowData.CENTER_NM);
        $NC.setValue("#edtBu_Cd", rowData.BU_CD);
        $NC.setValue("#edtBu_Nm", rowData.BU_NM);
        $NC.setValue("#edtCust_Cd", rowData.CUST_CD);
        $NC.setValue("#edtCust_Nm", rowData.CUST_NM);

        $NC.setValue("#edtEmployee_Id", rowData.EMPLOYEE_ID);
        $NC.setValue("#edtUser_Hp", rowData.USER_HP);
        $NC.setValue("#edtUser_Email", rowData.USER_EMAIL);
        $NC.setValue("#cboUser_Work_Div", rowData.USER_WORK_DIV);
        $NC.setValue("#edtUser_Cust_Cd", rowData.USER_CUST_CD);
        $NC.setValue("#edtUser_Cust_Nm", rowData.USER_CUST_NM);
        $NC.setValue("#edtUser_Dept_Cd", rowData.USER_DEPT_CD);
        $NC.setValue("#edtUser_Dept_Nm", rowData.USER_DEPT_NM);
        $NC.setValue("#edtEntry_Comment", rowData.ENTRY_COMMENT);
        $NC.setValue("#edtDelete_Comment", rowData.DELETE_COMMENT);
        $NC.setValue("#chkDelete_Yn", rowData.DELETE_YN);
        $NC.setValue("#edtRemark1", rowData.REMARK1);

        $NC.setValue("#edtVendor_Cd", rowData.VENDOR_CD);
        $NC.setValue("#edtVendor_Nm", rowData.VENDOR_NM);
        $NC.setValue("#edtCarrier_Cd", rowData.CARRIER_CD);
        $NC.setValue("#edtCarrier_Nm", rowData.CARRIER_NM);
        $NC.setValue("#edtCar_Cd", rowData.CAR_CD);
        $NC.setValue("#edtCar_Nm", rowData.CAR_NM);
        $NC.setValue("#cboSys_Lang", rowData.SYS_LANG);

        // 신규 데이터면 수정할 수 있게 함
        setEnableUserId(rowData);
    }
}

function setEnableUserId(rowData) {

    if ($NC.isNull(rowData)) {
        $NC.setEnable("#edtUser_Id", false);
        return;
    }

    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.setEnable("#edtUser_Id", G_GRDDETAIL1.data.getLength() == 0 && G_GRDDETAIL3.data.getLength() == 0);
    } else {
        $NC.setEnable("#edtUser_Id", false);
    }
}

/**
 * 사용자정보 데이터 변경 시.
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var CUST_CD;
    switch (args.col) {
        case "USER_ID":
            var searchIndex = $NC.getGridSearchRow(G_GRDMASTER, {
                compareFn: function(compareRowData) {
                    // 현재 데이터를 제외하고 나머지 데이터에서 같은 사용자ID 체크
                    return rowData.id != compareRowData.id && compareRowData.USER_ID == args.val;
                }
            });
            if (searchIndex > -1) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.017", "중복 사용자ID 입니다. 다시 입력하십시오."));
                rowData.USER_ID = "";
                $NC.setValue("#edtUser_Id");
                $NC.setFocus("#edtUser_Id");
            } else {
                rowData.USER_ID = args.val;
            }
            break;
        case "USER_NM":
            rowData.USER_NM = args.val;
            break;
        case "USER_PWD":
            rowData.USER_PWD = args.val;
            break;
        case "CERTIFY_DIV":
            rowData.CERTIFY_DIV = args.val;
            var certifyData = $NC.getComboData(args.view, rowData.CERTIFY_DIV);
            rowData.CERTIFY_DIV_F = certifyData.COMMON_CD_F;
            rowData.CERTIFY_DIV_ATTR01_CD = certifyData.ATTR01_CD;
            switch (rowData.CERTIFY_DIV) {
                case "30":
                    $("#divVendorInfo").show();
                    $("#divCarrierInfo").hide();
                    $("#divCarInfo").hide();

                    rowData.CARRIER_CD = "";
                    rowData.CARRIER_NM = "";
                    rowData.CAR_CD = "";
                    rowData.CAR_NM = "";
                    $NC.setValue("#edtCarrier_Cd");
                    $NC.setValue("#edtCarrier_Nm");
                    $NC.setValue("#edtCar_Cd");
                    $NC.setValue("#edtCar_Nm");
                    break;
                case "40":
                    $("#divCarrierInfo").show();
                    $("#divVendorInfo").hide();
                    $("#divCarInfo").hide();

                    rowData.VENDOR_CD = "";
                    rowData.VENDOR_NM = "";
                    rowData.CAR_CD = "";
                    rowData.CAR_NM = "";
                    $NC.setValue("#edtVendor_Cd");
                    $NC.setValue("#edtVendor_Nm");
                    $NC.setValue("#edtCar_Cd");
                    $NC.setValue("#edtCar_Nm");
                    break;
                case "50":
                    $("#divCarInfo").show();
                    $("#divVendorInfo").hide();
                    $("#divCarrierInfo").hide();

                    rowData.VENDOR_CD = "";
                    rowData.VENDOR_NM = "";
                    rowData.CARRIER_CD = "";
                    rowData.CARRIER_NM = "";
                    $NC.setValue("#edtVendor_Cd");
                    $NC.setValue("#edtVendor_Nm");
                    $NC.setValue("#edtCarrier_Cd");
                    $NC.setValue("#edtCarrier_Nm");
                    break;
                default:
                    $("#divVendorInfo").hide();
                    $("#divCarrierInfo").hide();
                    $("#divCarInfo").hide();

                    rowData.CARRIER_CD = "";
                    rowData.CARRIER_NM = "";
                    rowData.VENDOR_CD = "";
                    rowData.VENDOR_NM = "";
                    rowData.CAR_CD = "";
                    rowData.CAR_NM = "";
                    $NC.setValue("#edtVendor_Cd");
                    $NC.setValue("#edtVendor_Nm");
                    $NC.setValue("#edtCarrier_Cd");
                    $NC.setValue("#edtCarrier_Nm");
                    $NC.setValue("#edtCar_Cd");
                    $NC.setValue("#edtCar_Nm");
                    break;
            }
            break;
        case "ROLE_GROUP_DIV":
            rowData.ROLE_GROUP_DIV = args.val;
            rowData.ROLE_GROUP_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "VENDOR_CD":
            CUST_CD = $NC.getValue("#edtCust_Cd");
            if ($NC.isNotNull(args.val) && $NC.isNotNull(CUST_CD)) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.018", "기본사업부를 먼저 선택하십시오."));
                rowData.VENDOR_CD = "";
                rowData.VENDOR_NM = "";
                $NC.setValue("#edtVendor_Cd");
                $NC.setValue("#edtVendor_Nm");
                $NC.setFocus("#grdDetail3");
            } else {
                $NP.onVendorChange(args.val, {
                    P_CUST_CD: CUST_CD,
                    P_VENDOR_CD: args.val,
                    P_VIEW_DIV: "1"
                }, onVendorPopup);
                return;
            }
            break;
        case "CARRIER_CD":
            $NP.onCarrierChange(args.val, {
                P_CARRIER_CD: args.val,
                P_CARRIER_DIV: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }, onCarrierPopup);
            return;
        case "CAR_CD":
            $NP.onCarChange(args.val, {
                P_CAR_CD: args.val,
                P_VIEW_DIV: "1"
            }, onCarPopup);
            return;
        case "USER_CUST_CD":
            $NP.onCustChange(args.val, {
                P_CUST_CD: args.val,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, onCustPopup);
            return;
        case "USER_DEPT_CD":
            CUST_CD = $NC.getValue("#edtUser_Cust_Cd");
            if ($NC.isNull(CUST_CD)) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.019", "소속고객사를 먼저 선택하십시오."));
                $NC.setValue("#edtUser_Dept_Cd");
                $NC.setValue("#edtUser_Dept_Nm");
                rowData.USER_DEPT_CD = "";
                rowData.USER_DEPT_NM = "";
            } else {
                $NP.onDeptChange(args.val, {
                    P_CUST_CD: CUST_CD,
                    P_DEPT_CD: args.val,
                    P_VIEW_DIV: "1"
                }, onDeptPopup);
                return;
            }
            break;
        case "EMPLOYEE_ID":
            searchIndex = $NC.getGridSearchRow(G_GRDMASTER, {
                compareFn: function(compareRowData) {
                    // 현재 데이터를 제외하고 나머지 데이터에서 같은 사용자 사원번호 체크
                    return rowData.id != compareRowData.id && compareRowData.EMPLOYEE_ID == args.val;
                }
            });
            if (searchIndex > -1) {
                alert($NC.getDisplayMsg("JS.CSC01010E0.020", "동일한 사원번호가 존재합니다. 다시 입력하십시오."));
                rowData.EMPLOYEE_ID = "";
                $NC.setValue("#edtEmployee_Id");
                $NC.setFocus("#edtEmployee_Id");
            } else {
                rowData.EMPLOYEE_ID = args.val;
            }
            break;
        case "USER_HP":
            rowData.USER_HP = args.val;
            break;
        case "USER_EMAIL":
            rowData.USER_EMAIL = args.val;
            break;
        case "USER_WORK_DIV":
            rowData.USER_WORK_DIV = args.val;
            break;
        case "ENTRY_COMMENT":
            rowData.ENTRY_COMMENT = args.val;
            break;
        case "DELETE_COMMENT":
            rowData.DELETE_COMMENT = args.val;
            break;
        case "DELETE_YN":
            var DELETE_YN = $NC.getValue("#chkDelete_Yn");
            if (DELETE_YN == $ND.C_YES) {
                $NC.setEnable("#edtDelete_Comment", true);
            } else {
                $NC.setEnable("#edtDelete_Comment", false);
                rowData.DELETE_COMMENT = "";
                $NC.setValue("#edtDelete_Comment");
            }
            rowData.DELETE_YN = args.val;
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
        case "CENTER_CD":
            rowData.CENTER_CD = args.val;
            break;
        case "CENTER_NM":
            rowData.CENTER_NM = args.val;
            break;
        case "BU_CD":
            rowData.BU_CD = args.val;
            break;
        case "BU_NM":
            rowData.BU_NM = args.val;
            break;
        case "SYS_LANG":
            rowData.SYS_LANG = args.val;
            rowData.SYS_LANG_F = $NC.getValueCombo(args.view, "F");
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdDetail1OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    }, false);
    $NC.setGridColumn(columns, {
        id: "CENTER_CD",
        field: "CENTER_CD",
        name: "코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_NM",
        field: "CENTER_NM",
        name: "명칭"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 관리물류센터 그리드 초기화.
 */
function grdDetail1Initialize() {

    var options = {
        multiSelect: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail1", {
        columns: grdDetail1OnGetColumns(),
        queryId: "CSC01010E0.RS_SUB1",
        sortCol: "CENTER_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            // helperMessageFormat: "선택 물류센터 %d건 삭제",
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
                    result = "[물류센터: " + $NC.getDisplayCombo(rowData.CENTER_CD, rowData.CENTER_NM) + "]를 삭제";
                } else {
                    result = "[물류센터: " + $NC.getDisplayCombo(rowData.CENTER_CD, rowData.CENTER_NM) + "] 외 " + (dd.dragCount - 1) + "건 삭제";
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
                btnAddCenterOnClick();
            }
        }
    });

    G_GRDDETAIL1.view.onSelectedRowsChanged.subscribe(grdDetail1OnAfterScroll);
}

/**
 * grdDetail1 데이터 필터링 이벤트
 */
function grdDetail1OnFilter(item) {

    return G_GRDDETAIL1.lastFilterVal == item.USER_ID //
        && item.CRUD != $ND.C_DV_CRUD_D;
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
        id: "CENTER_CD",
        field: "CENTER_CD",
        name: "코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_NM",
        field: "CENTER_NM",
        name: "명칭"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 물류센터 그리드 초기화.
 */
function grdDetail2Initialize() {

    var options = {
        multiSelect: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail2", {
        columns: grdDetail2OnGetColumns(),
        queryId: "WC.POP_CMCENTER",
        sortCol: "CENTER_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            onGetDraggable: function(e, dd) {
                // Drag 가능 여부
                return G_GRDMASTER.data.getLength() > 0;
            },
            // helperMessageFormat: "선택 물류센터 %d건 추가",
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
                    result = "[물류센터: " + $NC.getDisplayCombo(rowData.CENTER_CD, rowData.CENTER_NM) + "]를 추가";
                } else {
                    result = "[물류센터: " + $NC.getDisplayCombo(rowData.CENTER_CD, rowData.CENTER_NM) + "] 외 " + (dd.dragCount - 1) + "건 추가";
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
                btnDeleteCenterOnClick();
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
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    }, false);
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
 * 관리사업부 그리드 초기화.
 */
function grdDetail3Initialize() {

    var options = {
        multiSelect: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail3", {
        columns: grdDetail3OnGetColumns(),
        queryId: "CSC01010E0.RS_SUB2",
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
                var rowData = G_GRDDETAIL3.data.getItem(dd.dragRows[0]);
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
 * grdDetail3 데이터 필터링 이벤트
 */
function grdDetail3OnFilter(item) {

    return G_GRDDETAIL3.lastFilterVal == item.USER_ID //
        && item.CRUD != $ND.C_DV_CRUD_D;
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
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 사업부 그리드 초기화.
 */
function grdDetail4Initialize() {

    var options = {
        multiSelect: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail4", {
        columns: grdDetail4OnGetColumns(),
        queryId: "WC.POP_CMBU",
        sortCol: "BU_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-view",
            onGetDraggable: function(e, dd) {
                // Drag 가능 여부
                return G_GRDMASTER.data.getLength() > 0;
            },
            // helperMessageFormat: "선택 사업부 %d건 추가",
            onGetDragHelper: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // 단순 문자열 리턴: 기본 스타일
                // HTML 문자 리턴: 해당 HTML을 Object화해서 표현
                var rowData = G_GRDDETAIL4.data.getItem(dd.dragRows[0]);
                var result = "";
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
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "USER_ID", true)) {
        $NC.setEnableGroup("#divRightView", true);
        $NC.setEnable("#edtUser_Id", false);
        if ($NC.getValue("#chkDelete_Yn") == $ND.C_YES) {
            $NC.setEnable("#edtDelete_Comment", true);
        } else {
            $NC.setEnable("#edtDelete_Comment", false);
        }
    } else {
        $NC.setEnableGroup("#divRightView", false);
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

    $NC.setInitGridData(G_GRDDETAIL1, ajaxData, grdDetail1OnFilter);
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setGridFilterValue(G_GRDDETAIL1, $NC.isNotNull(rowData) ? rowData.USER_ID : "");
    $NC.setInitGridAfterOpen(G_GRDDETAIL1, "CENTER_CD");
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail2(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL2, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL2, "CENTER_CD");
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail3(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL3, ajaxData, grdDetail3OnFilter);
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setGridFilterValue(G_GRDDETAIL3, $NC.isNotNull(rowData) ? rowData.USER_ID : "");
    $NC.setInitGridAfterOpen(G_GRDDETAIL3, "BU_CD");
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail4(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL4, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL4, "BU_CD");
}

/**
 * 저장 성공시
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "USER_ID"
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

function btnProgramRoleOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.021", "신규 사용자입니다. 저장 후 프로그램을 등록하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CSC01010E0.022", "현재 선택한 사용자의 프로그램 권한을 설정 하시겠습니까?"))) {
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC01012P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC01012P0.001", "프로그램 권한설정"),
        url: "cs/CSC01012P0.html",
        width: 1000,
        height: 600,
        resizeable: false,
        G_PARAMETER: {
            P_USER_ID: rowData.USER_ID,
            P_USER_NM: rowData.USER_NM,
            P_ROLE_GROUP_DIV: rowData.ROLE_GROUP_DIV,
            P_ROLE_GROUP_DIV_F: rowData.ROLE_GROUP_DIV_F,
            P_PERMISSION: permission
        },
        onOk: function() {
            _Inquiry();
        }
    });
}

/**
 * 관리물류센터 등록
 */
function btnAddCenterOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.023", "관리물류센터를 추가할 사용자를 선택하십시오."));
        return;
    }

    if (G_GRDDETAIL2.data.getLength() == 0) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(refRowData.USER_ID)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.024", "사용자ID를 먼저 입력하십시오."));
        $NC.setFocus("#edtUser_Id");
        return;
    }

    var newRowData, rowData;
    var selectedRows = G_GRDDETAIL2.view.getSelectedRows();
    G_GRDDETAIL1.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDDETAIL2.data.getItem(selectedRows[rIndex]);
            if ($NC.getGridSearchRow(G_GRDDETAIL1, {
                searchKey: "CENTER_CD",
                searchVal: rowData.CENTER_CD
            }) != -1) {
                continue;
            }

            newRowData = {
                USER_ID: refRowData.USER_ID,
                CENTER_CD: rowData.CENTER_CD,
                CENTER_NM: rowData.CENTER_NM,
                REG_USER_ID: null,
                REG_DATETIME: null,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };

            G_GRDDETAIL1.data.addItem(newRowData);
        }
    } finally {
        G_GRDDETAIL1.data.endUpdate();
    }

    // 관리물류센터 필터링
    $NC.setGridFilterValue(G_GRDDETAIL1, refRowData.USER_ID);
    // 관리물류센터 강제 정렬
    $NC.setGridSort(G_GRDDETAIL1, {
        sortColumns: {
            columnId: "CENTER_CD",
            sortAsc: true
        }
    });

    $NC.setGridSelectRow(G_GRDDETAIL2, selectedRows[selectedRows.length - 1]);
    setEnableUserId(refRowData);
}

/**
 * 관리물류센터 해제
 */
function btnDeleteCenterOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.025", "관리물류센터를 삭제할 사용자를 선택하십시오."));
        return;
    }

    if (G_GRDDETAIL1.data.getLength() == 0) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    var rowData;
    var selectedRows = G_GRDDETAIL1.view.getSelectedRows();
    G_GRDDETAIL1.data.beginUpdate();
    for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL1.data.getItem(selectedRows[rIndex]);
        // 기본 물류센터를 삭제 시, 기본물류센터 값 삭제.
        if (rowData.CHECK_YN == $ND.C_YES) {
            $NC.setValue("#edtCenter_Cd");
            $NC.setValue("#edtCenter_Nm");

            refRowData.CENTER_CD = "";
            refRowData.CENTER_NM = "";

            // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
            $NC.setGridApplyChange(G_GRDMASTER, refRowData);
        }

        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDDETAIL1.data.updateItem(rowData.id, rowData);
        } else {
            G_GRDDETAIL1.data.deleteItem(rowData.id);
        }
    }
    G_GRDDETAIL1.data.endUpdate();

    if (G_GRDDETAIL1.data.getLength() > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL1, G_GRDDETAIL1.data.getLength() - 1);
    } else {
        $NC.setGridDisplayRows(G_GRDDETAIL1, 0, 0);
    }
    setEnableUserId(refRowData);
}

/**
 * 관리사업부 등록
 */
function btnAddBuOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.026", "관리사업부를 추가할 사용자를 선택하십시오."));
        return;
    }

    if (G_GRDDETAIL4.data.getLength() == 0) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(refRowData.USER_ID)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.024", "사용자ID를 먼저 입력하십시오."));
        $NC.setFocus("#edtUser_Id");
        return;
    }

    var newRowData, rowData;
    var selectedRows = G_GRDDETAIL4.view.getSelectedRows();
    G_GRDDETAIL3.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
            rowData = G_GRDDETAIL4.data.getItem(selectedRows[rIndex]);
            if ($NC.getGridSearchRow(G_GRDDETAIL3, {
                searchKey: "BU_CD",
                searchVal: rowData.BU_CD
            }) != -1) {
                continue;
            }

            newRowData = {
                USER_ID: refRowData.USER_ID,
                BU_CD: rowData.BU_CD,
                BU_NM: rowData.BU_NM,
                CUST_CD: rowData.CUST_CD,
                CUST_NM: rowData.CUST_NM,
                REG_USER_ID: null,
                REG_DATETIME: null,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };

            G_GRDDETAIL3.data.addItem(newRowData);
        }
    } finally {
        G_GRDDETAIL3.data.endUpdate();
    }

    // 관리사업부 필터링
    $NC.setGridFilterValue(G_GRDDETAIL3, refRowData.USER_ID);
    // 관리사업부 강제 정렬
    $NC.setGridSort(G_GRDDETAIL3, {
        sortColumns: {
            columnId: "BU_CD",
            sortAsc: true
        }
    });

    $NC.setGridSelectRow(G_GRDDETAIL4, selectedRows[selectedRows.length - 1]);
    setEnableUserId(refRowData);
}

/**
 * 관리사업부 해제
 */
function btnDeleteBuOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.027", "관리사업부를 삭제할 사용자를 선택하십시오."));
        return;
    }

    if (G_GRDDETAIL3.data.getLength() == 0) {
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    var rowData;
    var selectedRows = G_GRDDETAIL3.view.getSelectedRows();
    G_GRDDETAIL3.data.beginUpdate();
    for (var rIndex = 0, rCount = selectedRows.length; rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL3.data.getItem(selectedRows[rIndex]);
        // 기본 사업부를 삭제 시, 기본사업부 기본 고객사 값 삭제.
        if (rowData.CHECK_YN == $ND.C_YES) {
            $NC.setValue("#edtBu_Cd");
            $NC.setValue("#edtBu_Nm");
            $NC.setValue("#edtCust_Cd");
            $NC.setValue("#edtCust_Nm");

            refRowData.BU_CD = "";
            refRowData.BU_NM = "";
            refRowData.CUST_CD = "";
            refRowData.CUST_NM = "";

            // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
            $NC.setGridApplyChange(G_GRDMASTER, refRowData);
        }

        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDDETAIL3.data.updateItem(rowData.id, rowData);
        } else {
            G_GRDDETAIL3.data.deleteItem(rowData.id);
        }
    }
    G_GRDDETAIL3.data.endUpdate();

    if (G_GRDDETAIL3.data.getLength() > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL3, G_GRDDETAIL3.data.getLength() - 1);
    } else {
        $NC.setGridDisplayRows(G_GRDDETAIL3, 0, 0);
    }
    setEnableUserId(refRowData);
}

/**
 * 사용자 복사등록 버튼 호출.
 */
function btnEntryUserOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    // 신규 사용자일 경우 기본값 표시 안함
    var USER_ID = "";
    var USER_NM = "";

    if (rowData.CRUD == $ND.C_DV_CRUD_R || rowData.CRUD == $ND.C_DV_CRUD_U) {
        USER_ID = rowData.USER_ID;
        USER_NM = rowData.USER_NM;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC01011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC01011P0.001", "사용자 복사"),
        url: "cs/CSC01011P0.html",
        width: 610,
        height: 270,
        resizeable: false,
        G_PARAMETER: {
            P_USER_ID: USER_ID,
            P_USER_NM: USER_NM,
            P_PERMISSION: permission
        },
        onOk: function() {
            _Inquiry();
        }
    });
}

/**
 * 장기미사용자관리 버튼 호출.
 */
function btnDormantUserOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    // 데이터 조회, Synchronize
    var dsResult;
    var serviceCallError = false;
    $NC.serviceCallAndWait("/CSC01010E0/getDataSet.do", {
        P_QUERY_ID: "CSC01010E0.RS_SUB4",
        P_QUERY_PARAMS: null
    }, function(ajaxData) {
        dsResult = $NC.toArray(ajaxData);
    }, function(ajaxData) {
        $NC.onError(ajaxData);
        serviceCallError = true;
    });
    if (serviceCallError) {
        return;
    }

    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.028", "장기미사용자가 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC01013P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC01013P0.001", "장기미사용자관리"),
        url: "cs/CSC01013P0.html",
        width: 800,
        height: 450,
        resizeable: false,
        G_PARAMETER: {
            P_MASTER_DS: dsResult,
            P_PERMISSION: permission
        }
    });
}

/**
 * 비밀번호오류사용자관리 버튼 호출.
 */
function btnPwdErrorUserOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    // 데이터 조회, Synchronize
    var dsResult;
    var serviceCallError = false;
    $NC.serviceCallAndWait("/CSC01010E0/getDataSet.do", {
        P_QUERY_ID: "CSC01010E0.RS_SUB5",
        P_QUERY_PARAMS: null
    }, function(ajaxData) {
        dsResult = $NC.toArray(ajaxData);
    }, function(ajaxData) {
        $NC.onError(ajaxData);
        serviceCallError = true;
    });
    if (serviceCallError) {
        return;
    }

    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.029", "비밀번호 오류 사용자가 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CSC01014P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CSC01014P0.001", "비밀번호오류사용자 관리"),
        url: "cs/CSC01014P0.html",
        width: 800,
        height: 450,
        resizeable: false,
        G_PARAMETER: {
            P_MASTER_DS: dsResult,
            P_PERMISSION: permission
        }
    });
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showBuPopup() {

    $NP.showBuPopup({
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onBuPopup, function() {
        $NC.setFocus("#edtQBu_Cd", true);
    });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onBuPopup(resultInfo) {

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

/**
 * 검색조건의 공급처 검색 이미지 클릭
 */
function showVendorPopup() {

    var CUST_CD = $NC.getValue("#edtCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.030", "기본사업부를 선택하십시오."));
        $NC.setFocus("#grdDetail3");
        return;
    }

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

function showCarrierPopup() {

    var CARRIER_CD = $NC.getValue("#edtCarrier_Cd", true);
    $NP.showCarrierPopup({
        queryParams: {
            P_CARRIER_CD: CARRIER_CD,
            P_CARRIER_DIV: $ND.C_ALL,
            P_VIEW_DIV: "1"
        }
    }, onCarrierPopup, function() {
        $NC.setFocus("#edtCarrier_Cd", true);
    });
}

function onCarrierPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtCarrier_Cd", resultInfo.CARRIER_CD);
        $NC.setValue("#edtCarrier_Nm", resultInfo.CARRIER_NM);

        rowData.CARRIER_CD = resultInfo.CARRIER_CD;
        rowData.CARRIER_NM = resultInfo.CARRIER_NM;
    } else {
        $NC.setValue("#edtCarrier_Cd");
        $NC.setValue("#edtCarrier_Nm");
        $NC.setFocus("#edtCarrier_Cd", true);

        rowData.CARRIER_CD = "";
        rowData.CARRIER_NM = "";
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function showCarPopup() {

    var CAR_CD = $NC.getValue("#edtCar_Cd", true);
    $NP.showCarPopup({
        queryParams: {
            P_CAR_CD: CAR_CD,
            P_VIEW_DIV: "1"
        }
    }, onCarPopup, function() {
        $NC.setFocus("#edtCar_Cd", true);
    });
}

function onCarPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtCar_Cd", resultInfo.CAR_CD);
        $NC.setValue("#edtCar_Nm", resultInfo.CAR_NM);

        rowData.CAR_CD = resultInfo.CAR_CD;
        rowData.CAR_NM = resultInfo.CAR_NM;
    } else {
        $NC.setValue("#edtCar_Cd");
        $NC.setValue("#edtCar_Nm");
        $NC.setFocus("#edtCar_Cd", true);

        rowData.CARRIER_CD = "";
        rowData.CARRIER_NM = "";
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 부서 검색 이미지 클릭
 * 
 * @param resultInfo
 */

function showDeptPopup() {

    var CUST_CD = $NC.getValue("#edtUser_Cust_Cd");

    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CSC01010E0.031", "소속고객사를 먼저 선택하십시오."));
        return;
    }
    $NP.showDeptPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DEPT_CD: $ND.C_ALL,
            P_VIEW_DIV: "1"
        }
    }, onDeptPopup, function() {
        $NC.setFocus("#edtUser_Dept_Cd", true);
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
        $NC.setValue("#edtUser_Dept_Cd", resultInfo.DEPT_CD);
        $NC.setValue("#edtUser_Dept_Nm", resultInfo.DEPT_NM);

        rowData.USER_DEPT_CD = resultInfo.DEPT_CD;
        rowData.USER_DEPT_NM = resultInfo.DEPT_NM;
    } else {
        $NC.setValue("#edtUser_Dept_Cd");
        $NC.setValue("#edtUser_Dept_Nm");
        $NC.setFocus("#edtUser_Dept_Cd", true);

        rowData.USER_DEPT_CD = "";
        rowData.USER_DEPT_NM = "";
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */

function showCustPopup() {

    $NP.showCustPopup({
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onCustPopup, function() {
        $NC.setFocus("#edtUser_Cust_Cd", true);
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
        $NC.setValue("#edtUser_Cust_Cd", resultInfo.CUST_CD);
        $NC.setValue("#edtUser_Cust_Nm", resultInfo.CUST_NM);
        $NC.setValue("#edtUser_Dept_Cd");
        $NC.setValue("#edtUser_Dept_Nm");

        rowData.USER_CUST_CD = resultInfo.CUST_CD;
        rowData.USER_CUST_NM = resultInfo.CUST_NM;
        rowData.USER_DEPT_CD = "";
        rowData.USER_DEPT_NM = "";
    } else {
        $NC.setValue("#edtUser_Cust_Cd");
        $NC.setValue("#edtUser_Cust_Nm");
        $NC.setFocus("#edtUser_Cust_Cd", true);
        $NC.setValue("#edtUser_Dept_Cd");
        $NC.setValue("#edtUser_Dept_Nm");

        rowData.USER_CUST_CD = "";
        rowData.USER_CUST_NM = "";
        rowData.USER_DEPT_CD = "";
        rowData.USER_DEPT_NM = "";
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
    }, function() {
        // 저장 권한이 있고, 장기 미사용자 시스템 사용불가일 경우만 사용 가능
        $NC.setVisible("#btnDormantUser", $NC.getProgramPermission().canSave && $NC.G_VAR.policyVal.CS141 == $ND.C_NO);
        // 저장 권한이 있고, 사용자 비밀번호 오류 시스템 사용제한일 경우만 사용 가능
        $NC.setVisible("#btnPwdErrorUser", $NC.getProgramPermission().canSave && $NC.G_VAR.policyVal.CS130 != "-1");
    });
}