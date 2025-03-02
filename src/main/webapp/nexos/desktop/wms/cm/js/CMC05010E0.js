/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC05010E0
 *  프로그램명         : 권장로케이션관리
 *  프로그램설명       : 권장로케이션관리 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2017-10-10
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
        autoResizeView: {
            container: "#divMasterView",
            grids: [
                "#grdMaster"
            ]
        },
        // 체크할 정책 값
        policyVal: {
            CM120: "", // 로케이션표시정책
            CM121: "", // 로케이션 존 길이
            CM122: "", // 로케이션 행 길이
            CM123: "", // 로케이션 열 길이
            CM124: "" // 로케이션 단 길이
        },
        // 현재 생성구분 값
        activeView: null
    });

    // 초기화 및 초기값 세팅
    $NC.G_JWINDOW.set("minWidth", 1050);

    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 이벤트 연결
    $("#btnInquiryItem").click(btnInquiryItemOnClick);
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    // 권장로케이션 등록 버튼
    $("#btnEntryRecommendLoc").click(btnEntryRecommendLocOnClick);

    // 그리드 초기화
    grdMasterInitialize();
    grdZoneInitialize();
    grdBankInitialize();
    grdBayInitialize();
    grdLevInitialize();
    grdSubInitialize();
    grdDepartInitialize();
    grdLineInitialize();
    grdClassInitialize();
    grdItemInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CSUSERCENTER",
                P_QUERY_ID: "WC.POP_CSUSERCENTER",
                P_QUERY_PARAMS: {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_CENTER_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_STATE",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_STATE",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_KEEP_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "KEEP_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
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
            data: $NC.toArray(multipleData.O_WC_POP_CSUSERCENTER),
            onComplete: function() {
                $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
                setPolicyValInfo();
            }
        });
        // 조회조건 - 상품상태 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_State",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE),
            onComplete: function() {
                $NC.setValue("#cboQItem_State", $ND.C_BASE_ITEM_STATE);
            }
        });
        $NC.setInitComboData({
            selector: "#cboQKeep_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_KEEP_DIV),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQKeep_Div", $ND.C_ALL);
            }
        });
    });

    $NC.setInitComboData({
        selector: "#cboCreate_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        data: [
            {
                COMMON_CD: "1",
                COMMON_NM: $NC.getDisplayMsg("JS.CMC05010E0.001", "사업부별")
            },
            {
                COMMON_CD: "2",
                COMMON_NM: $NC.getDisplayMsg("JS.CMC05010E0.002", "상품보관별")
            },
            {
                COMMON_CD: "3",
                COMMON_NM: $NC.getDisplayMsg("JS.CMC05010E0.003", "상품그룹별")
            },
            {
                COMMON_CD: "4",
                COMMON_NM: $NC.getDisplayMsg("JS.CMC05010E0.004", "상품별")
            }
        ],
        onComplete: function() {
            $NC.G_VAR.activeView = $NC.setValue("#cboCreate_Div", "1");
        }
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "h", 300);

    $NC.G_VAR.activeView = $NC.getValue("#cboCreate_Div");
    onSubViewChange($NC.G_VAR.activeView);

}

function _SetResizeOffset() {

    $NC.G_OFFSET.fixedZoneWidth = 250;
    $NC.G_OFFSET.fixedOtherWidth = 100;

    $NC.G_OFFSET.exceptDetailHeight = $("#divDetailInfoView").outerHeight(true) + $NC.G_LAYOUT.header;
}

/**
 * Window Resize Event - Window Size 조정시호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    $NC.resizeSplitGrid({
        grids: [
            "#grdZone",
            "#grdBank",
            "#grdBay",
            "#grdLev"
        ],
        sizes: [
            $NC.G_OFFSET.fixedZoneWidth
        ]
    }, "h", "#divDetailView", //
    $NC.G_OFFSET.fixedZoneWidth + $NC.G_OFFSET.fixedOtherWidth * 3, //
    null, $NC.G_OFFSET.exceptDetailHeight);

    // 권장로케이션 지정 사이즈 조정
    switch ($NC.G_VAR.activeView) {
        // 상품보관별
        case "2":
            $NC.resizeGridView("#divKeepDivView", "#grdSub",//
            $("#divDetailView").parent().width() - $("#divDetailView").outerWidth(true));
            break;
        // 상품그룹별
        case "3":
            $NC.resizeSplitGrid({
                grids: [
                    "#grdDepart",
                    "#grdLine",
                    "#grdClass"
                ]
            }, "h", "#divItemGroupView", //
            $("#divDetailView").parent().width() - $("#divDetailView").outerWidth(true));
            break;
        // 상품별
        case "4":
            $NC.resizeGridView("#divItemView", "#grdItem",//
            $("#divDetailView").parent().width() - $("#divDetailView").outerWidth(true));
            break;
    }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    // 상품 조회 조건 변경
    if (view.parents(".ctrSubCondition:first").length > 0) {
        itemConditionChange(e, {
            view: view,
            col: id,
            val: val
        });
    }
    // 조회 조건 변경
    else {
        switch (id) {
            case "CENTER_CD":
                setPolicyValInfo();
                break;
            case "BU_CD":
                $NP.onUserBuChange(val, {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_BU_CD: val,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }, onUserBuPopup);
                return;
        }

        onChangingCondition();
    }
}

function _OnInputChange(e, view, val) {
    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "CREATE_DIV":
            onSubViewChange(val);
            break;
    }
}

function itemConditionChange(e, args) {

    switch (args.col) {
        case "BRAND_CD":
            $NP.onBuBrandChange(args.val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: args.val
            }, onBuBrandPopup);
            return;
    }

    onChangingItemCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.005", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.006", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    if ($NC.isNull(ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.007", "상품상태를 선택하십시오."));
        $NC.setFocus("#cboQItem_State");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_CUST_CD: CUST_CD,
        P_ITEM_STATE: ITEM_STATE
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    if (G_GRDZONE.data.getLength() == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDZONE);
        // 파라메터 세팅
        G_GRDZONE.queryParams = {
            P_CENTER_CD: CENTER_CD
        };
        // 로케이션 존 데이터 조회
        $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDZONE), onGetZone);
    }

    if (G_GRDSUB.data.getLength() == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDSUB);

        // 파라메터 세팅
        G_GRDSUB.queryParams = null;

        // 보관구분 데이터 조회
        $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
    }

    if (G_GRDDEPART.data.getLength() == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDDEPART);
        // 파라메터 세팅
        G_GRDDEPART.queryParams = {
            P_CUST_CD: CUST_CD
        };
        // 상품그룹 대분류 데이터 조회
        $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDDEPART), onGetDepart);
    }

    if (G_GRDITEM.data.getLength() == 0) {

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDITEM);
        // 파라메터 세팅
        G_GRDITEM.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_STATE: ITEM_STATE,
            P_ITEM_CD: $NC.getValue("#edtQItem_Cd"),
            P_ITEM_NM: $NC.getValue("#edtQItem_Nm"),
            P_KEEP_DIV: $NC.getValue("#cboQKeep_Div")
        };
        // 상품 데이터 조회
        $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDITEM), onGetItem);
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.008", "저장할 데이터가 없습니다."));
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
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_KEEP_DIV: rowData.KEEP_DIV,
            P_DEPART_CD: rowData.DEPART_CD,
            P_LINE_CD: rowData.LINE_CD,
            P_CLASS_CD: rowData.CLASS_CD,
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ZONE_CD: rowData.ZONE_CD,
            P_BANK_CD: rowData.BANK_CD,
            P_BAY_CD: rowData.BAY_CD,
            P_LEV_CD: rowData.LEV_CD,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.009", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC05010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_POLICY_CM120: $NC.G_VAR.policyVal.CM120,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.010", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC05010E0.011", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.deleteGridRowData(G_GRDMASTER, rowData);
    } else {
        // 삭제 시 상품 등록여부 N으로 변경
        if (rowData.ITEM_CD != "0") {
            var searchIndex = $NC.getGridSearchRow(G_GRDITEM, {
                searchKey: "ITEM_CD",
                searchVal: rowData.ITEM_CD
            });
            if (searchIndex > -1) {
                var refRowData = G_GRDITEM.data.getItem(searchIndex);
                refRowData.ENTRY_YN = $ND.C_NO;
                G_GRDITEM.data.updateItem(refRowData.id, refRowData);
                $NC.setGridSelectRow(G_GRDITEM, searchIndex);
            }
        }
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
            "KEEP_DIV",
            "DEPART_CD",
            "LINE_CD",
            "CLASS_CD",
            "BRAND_CD",
            "ITEM_CD",
            "ZONE_CD",
            "BANK_CD",
            "BAY_CD",
            "LEV_CD"
        ],
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

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDZONE);
    $NC.clearGridData(G_GRDBANK);
    $NC.clearGridData(G_GRDBAY);
    $NC.clearGridData(G_GRDLEV);
    $NC.clearGridData(G_GRDSUB);
    $NC.clearGridData(G_GRDDEPART);
    $NC.clearGridData(G_GRDLINE);
    $NC.clearGridData(G_GRDCLASS);
    $NC.clearGridData(G_GRDITEM);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onChangingItemCondition() {

    $NC.clearGridData(G_GRDITEM);
}

/**
 * 생성구분에 따라 화면 표시 변환
 */
function onSubViewChange(createDiv) {

    $("#divKeepDivView").hide(); // 상품보관별 보관구분
    $("#divItemGroupView").hide(); // 상품그룹별
    $("#divItemView").hide(); // 상품별

    $NC.G_VAR.activeView = createDiv;

    if ($NC.G_VAR.activeView == "2") { // 상품보관별
        $("#divKeepDivView").show();
    } else if ($NC.G_VAR.activeView == "3") { // 상품그룹별
        $("#divItemGroupView").show();
    } else if ($NC.G_VAR.activeView == "4") { // 상품별
        $("#divItemView").show();
    }

    $NC.onGlobalResize();
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_F",
        field: "KEEP_DIV_F",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DEPART_CD_F",
        field: "DEPART_CD_F",
        name: "대분류"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_CD_F",
        field: "LINE_CD_F",
        name: "중분류"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_CD_F",
        field: "CLASS_CD_F",
        name: "소분류"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
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
        id: "ZONE_CD",
        field: "ZONE_CD",
        name: "존",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BANK_CD",
        field: "BANK_CD",
        name: "행",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BAY_CD",
        field: "BAY_CD",
        name: "열",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LEV_CD",
        field: "LEV_CD",
        name: "단",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC05010E0.RS_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onGetCellValue.subscribe(grdMasterOnGetCellValue);
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnGetCellValue(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "KEEP_DIV":
        case "KEEP_DIV_F":
            if (rowData.KEEP_DIV == "0") {
                return "";
            }
            break;
        case "DEPART_CD":
        case "DEPART_CD_F":
            if (rowData.DEPART_CD == "0000") {
                return "";
            }
            break;
        case "LINE_CD":
        case "LINE_CD_F":
            if (rowData.LINE_CD == "0000") {
                return "";
            }
            break;
        case "CLASS_CD":
        case "CLASS_CD_F":
            if (rowData.CLASS_CD == "0000") {
                return "";
            }
            break;
        case "BRAND_CD":
        case "BRAND_NM":
            if (rowData.BRAND_CD == "0") {
                return "";
            }
            break;
        case "ITEM_CD":
        case "ITEM_NM":
        case "ITEM_SPEC":
            if (rowData.ITEM_CD == "0") {
                return "";
            }
            break;
    }
    return null;
}

function grdZoneOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ZONE_CD",
        field: "ZONE_CD",
        name: "존코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ZONE_NM",
        field: "ZONE_NM",
        name: "존명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdBankOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BANK_CD_D",
        field: "BANK_CD_D",
        name: "행",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdBayOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BAY_CD_D",
        field: "BAY_CD_D",
        name: "열",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdLevOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LEV_CD_D",
        field: "LEV_CD_D",
        name: "단",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdZoneInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdZone", {
        columns: grdZoneOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB1",
        sortCol: "ZONE_CD",
        gridOptions: options
    });
    G_GRDZONE.view.onSelectedRowsChanged.subscribe(grdZoneOnAfterScroll);
}

function grdZoneOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDZONE, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDZONE.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDBANK);

    // 파라메터 세팅
    G_GRDBANK.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_ZONE_CD: rowData.ZONE_CD,
        P_POLICY_VAL1: $NC.G_VAR.policyVal.CM121,
        P_POLICY_VAL2: $NC.G_VAR.policyVal.CM122
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDBANK), onGetBank);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDZONE, row + 1);
}

function grdBankInitialize() {

    var options = {
        editable: false,
        autoEdit: false
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdBank", {
        columns: grdBankOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB2",
        sortCol: "BANK_CD_D",
        gridOptions: options
    });
    G_GRDBANK.view.onSelectedRowsChanged.subscribe(grdBankOnAfterScroll);
}

function grdBankOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDBANK, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDBANK.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDBAY);
    // 파라메터 세팅
    G_GRDBAY.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_ZONE_CD: rowData.ZONE_CD,
        P_BANK_CD: rowData.BANK_CD,
        P_POLICY_VAL1: $NC.G_VAR.policyVal.CM122,
        P_POLICY_VAL2: $NC.G_VAR.policyVal.CM123
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDBAY), onGetBay);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDBANK, row + 1);
}

function grdBayInitialize() {

    var options = {
        editable: false,
        autoEdit: false
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdBay", {
        columns: grdBayOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB3",
        sortCol: "BAY_CD_D",
        gridOptions: options
    });
    G_GRDBAY.view.onSelectedRowsChanged.subscribe(grdBayOnAfterScroll);
}

function grdBayOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDBAY, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDBAY.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDLEV);
    // 파라메터 세팅
    G_GRDLEV.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_ZONE_CD: rowData.ZONE_CD,
        P_BANK_CD: rowData.BANK_CD,
        P_BAY_CD: rowData.BAY_CD,
        P_POLICY_VAL1: $NC.G_VAR.policyVal.CM123,
        P_POLICY_VAL2: $NC.G_VAR.policyVal.CM124
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDLEV), onGetLev);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDBAY, row + 1);
}

function grdLevInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.LOC_DIV == "2") {
                    return "stySpecial ";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdLev", {
        columns: grdLevOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB4",
        sortCol: "LEV_CD_D",
        gridOptions: options
    });
    G_GRDLEV.view.onSelectedRowsChanged.subscribe(grdLevOnAfterScroll);
}

function grdLevOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDLEV, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDLEV, row + 1);
}

function grdSubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV",
        field: "KEEP_DIV",
        name: "보관구분",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분명"
    });
    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB9",
        sortCol: "KEEP_DIV",
        gridOptions: options
    });
    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

function grdDepartOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "DEPART_CD",
        field: "DEPART_CD",
        name: "상품대분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DEPART_NM",
        field: "DEPART_NM",
        name: "대분류명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDepartInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDepart", {
        columns: grdDepartOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB5",
        sortCol: "DEPART_CD",
        gridOptions: options
    });
    G_GRDDEPART.view.onSelectedRowsChanged.subscribe(grdDepartOnAfterScroll);
}

function grdDepartOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDEPART, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDEPART.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDLINE);
    onGetLine({
        data: null
    });

    // 파라메터 세팅
    G_GRDLINE.queryParams = {
        P_CUST_CD: rowData.CUST_CD,
        P_DEPART_CD: rowData.DEPART_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDLINE), onGetLine);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDEPART, row + 1);
}

function grdLineOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_CD",
        field: "LINE_CD",
        name: "상품중분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NM",
        field: "LINE_NM",
        name: "중분류명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdLineInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdLine", {
        columns: grdLineOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB6",
        sortCol: "LINE_CD",
        gridOptions: options
    });
    G_GRDLINE.view.onSelectedRowsChanged.subscribe(grdLineOnAfterScroll);
}

function grdLineOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDLINE, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDLINE.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDCLASS);
    onGetClass({
        data: null
    });

    // 파라메터 세팅
    G_GRDCLASS.queryParams = {
        P_CUST_CD: rowData.CUST_CD,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05010E0/getDataSet.do", $NC.getGridParams(G_GRDCLASS), onGetClass);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDLINE, row + 1);
}

function grdClassOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CLASS_CD",
        field: "CLASS_CD",
        name: "상품소분류코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLASS_NM",
        field: "CLASS_NM",
        name: "소분류명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdClassInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdClass", {
        columns: grdClassOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB7",
        sortCol: "CLASS_CD",
        gridOptions: options
    });
    G_GRDCLASS.view.onSelectedRowsChanged.subscribe(grdClassOnAfterScroll);
}

function grdClassOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDCLASS, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDCLASS, row + 1);
}

function grdItemOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
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
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdItemInitialize() {

    var options = {
        editable: false,
        autoEdit: false,
        frozenColumn: 0,
        specialRow: {
            compareKey: "ENTRY_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdItem", {
        columns: grdItemOnGetColumns(),
        queryId: "CMC05010E0.RS_SUB8",
        sortCol: "ITEM_CD",
        gridOptions: options
    });
    G_GRDITEM.view.onSelectedRowsChanged.subscribe(grdItemOnAfterScroll);
    G_GRDITEM.view.onClick.subscribe(grdItemOnClick);
}

function grdItemOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDITEM, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDITEM, row + 1);
}

function grdItemOnClick(e, args) {

    var rowData = G_GRDITEM.data.getItem(args.row);

    var searchIndex = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: "ITEM_CD",
        searchVal: rowData.ITEM_CD
    });
    if (searchIndex > -1) {
        $NC.setGridSelectRow(G_GRDMASTER, searchIndex);
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "KEEP_DIV",
        "DEPART_CD",
        "LINE_CD",
        "CLASS_CD",
        "BRAND_CD",
        "ITEM_CD",
        "ZONE_CD",
        "BANK_CD",
        "BAY_CD",
        "LEV_CD"
    ], true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetZone(ajaxData) {

    $NC.setInitGridData(G_GRDZONE, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDZONE, "ZONE_CD");

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onGetBank(ajaxData) {

    $NC.setInitGridData(G_GRDBANK, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDBANK, "BANK_CD");
}

function onGetBay(ajaxData) {

    $NC.setInitGridData(G_GRDBAY, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDBAY, "BAY_CD");
}

function onGetLev(ajaxData) {

    $NC.setInitGridData(G_GRDLEV, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDLEV, "LEV_CD");
}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB, "KEEP_DIV");
}

function onGetDepart(ajaxData) {

    $NC.setInitGridData(G_GRDDEPART, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDEPART, "DEPART_CD");
}

function onGetLine(ajaxData) {

    $NC.setInitGridData(G_GRDLINE, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDLINE, "LINE_CD");
}

function onGetClass(ajaxData) {

    $NC.setInitGridData(G_GRDCLASS, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDCLASS, "CLASS_CD");
}

function onGetItem(ajaxData) {

    $NC.setInitGridData(G_GRDITEM, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDITEM, "ITEM_CD");
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "KEEP_DIV",
            "DEPART_CD",
            "LINE_CD",
            "CLASS_CD",
            "BRAND_CD",
            "ITEM_CD",
            "ZONE_CD",
            "BANK_CD",
            "BAY_CD",
            "LEV_CD"
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

function btnInquiryItemOnClick() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.005", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.006", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    if ($NC.isNull(ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.007", "상품상태를 선택하십시오."));
        $NC.setFocus("#cboQItem_State");
        return;
    }

    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var KEEP_DIV = $NC.getValue("#cboQKeep_Div");

    // 상품 데이터 조회
    $NC.serviceCall("/CMC05010E0/getDataSet.do", {
        P_QUERY_ID: "CMC05010E0.RS_SUB8",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ITEM_STATE: ITEM_STATE,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: $NC.getValue("#edtQItem_Cd"),
            P_ITEM_NM: $NC.getValue("#edtQItem_Nm"),
            P_KEEP_DIV: KEEP_DIV
        }
    }, onGetItem);
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $ND.C_NULL
    });
}

function btnEntryRecommendLocOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDLEV.data.getLength() == 0 || $NC.isNull(G_GRDLEV.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.012", "권장로케이션 등록할 로케이션(존/행/열/단)을 선택하십시오."));
        return;
    }

    if ($NC.G_VAR.activeView == "4" && G_GRDITEM.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC05010E0.013", "조회 후 상품을 선택하십시오."));
        return;
    }

    var rowData = G_GRDLEV.data.getItem(G_GRDLEV.lastRow);
    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        BU_CD: $NC.getValue("#edtQBu_Cd"),
        ITEM_STATE: $NC.getValue("#cboQItem_State"),
        KEEP_DIV: null,
        KEEP_DIV_F: null,
        DEPART_CD: null,
        LINE_CD: null,
        CLASS_CD: null,
        BRAND_CD: null,
        BRAND_NM: null,
        ITEM_CD: null,
        ITEM_NM: null,
        ITEM_SPEC: null,
        ZONE_CD: rowData.ZONE_CD,
        BANK_CD: rowData.BANK_CD,
        BAY_CD: rowData.BAY_CD,
        LEV_CD: rowData.LEV_CD,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_C
    };

    var refRowData;
    switch ($NC.G_VAR.activeView) {
        // 보관구분별
        case "2":
            refRowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

            newRowData.KEEP_DIV = refRowData.KEEP_DIV;
            newRowData.KEEP_DIV_F = refRowData.KEEP_DIV_F;

            newRowData.DEPART_CD = $ND.C_BASE_DEPART_CD;
            newRowData.LINE_CD = $ND.C_BASE_LINE_CD;
            newRowData.CLASS_CD = $ND.C_BASE_CLASS_CD;

            newRowData.BRAND_CD = $ND.C_BASE_BRAND_CD;
            newRowData.ITEM_CD = $ND.C_BASE_ITEM_CD;
            newRowData.ITEM_NM = $NC.getDisplayMsg("JS.CMC05010E0.014", "전체상품");
            newRowData.ITEM_SPEC = null;
            break;
        // 상품그룹별
        case "3":

            newRowData.KEEP_DIV = $ND.C_BASE_KEEP_DIV;

            refRowData = G_GRDDEPART.data.getItem(G_GRDDEPART.lastRow);
            newRowData.DEPART_CD = refRowData.DEPART_CD;
            refRowData = G_GRDLINE.data.getItem(G_GRDLINE.lastRow);
            newRowData.LINE_CD = refRowData.LINE_CD;
            refRowData = G_GRDCLASS.data.getItem(G_GRDCLASS.lastRow);
            newRowData.CLASS_CD = refRowData.CLASS_CD;

            newRowData.BRAND_CD = $ND.C_BASE_BRAND_CD;
            newRowData.ITEM_CD = $ND.C_BASE_ITEM_CD;
            newRowData.ITEM_NM = $NC.getDisplayMsg("JS.CMC05010E0.014", "전체상품");
            newRowData.ITEM_SPEC = null;
            break;
        // 상품별
        case "4":
            refRowData = G_GRDITEM.data.getItem(G_GRDITEM.lastRow);

            newRowData.KEEP_DIV = $ND.C_BASE_KEEP_DIV;

            newRowData.DEPART_CD = $ND.C_BASE_DEPART_CD;
            newRowData.LINE_CD = $ND.C_BASE_LINE_CD;
            newRowData.CLASS_CD = $ND.C_BASE_CLASS_CD;

            newRowData.BRAND_CD = refRowData.BRAND_CD;
            newRowData.BRAND_NM = refRowData.BRAND_NM;
            newRowData.ITEM_CD = refRowData.ITEM_CD;
            newRowData.ITEM_NM = refRowData.ITEM_NM;
            newRowData.ITEM_SPEC = refRowData.ITEM_SPEC;

            refRowData.ENTRY_YN = $ND.C_YES;
            G_GRDITEM.data.updateItem(refRowData.id, refRowData);
            break;
        // 사업부별
        default:
            newRowData.KEEP_DIV = $ND.C_BASE_KEEP_DIV;

            newRowData.DEPART_CD = $ND.C_BASE_DEPART_CD;
            newRowData.LINE_CD = $ND.C_BASE_LINE_CD;
            newRowData.CLASS_CD = $ND.C_BASE_CLASS_CD;

            newRowData.BRAND_CD = $ND.C_BASE_BRAND_CD;
            newRowData.ITEM_CD = $ND.C_BASE_ITEM_CD;
            newRowData.ITEM_NM = $NC.getDisplayMsg("JS.CMC05010E0.014", "전체상품");
            newRowData.ITEM_SPEC = null;
            break;
    }

    var searchIndex = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: [
            "KEEP_DIV",
            "DEPART_CD",
            "LINE_CD",
            "CLASS_CD",
            "BRAND_CD",
            "ITEM_CD",
            "ZONE_CD",
            "BANK_CD",
            "BAY_CD",
            "LEV_CD"
        ],
        searchVal: [
            newRowData.KEEP_DIV,
            newRowData.DEPART_CD,
            newRowData.LINE_CD,
            newRowData.CLASS_CD,
            newRowData.BRAND_CD,
            newRowData.ITEM_CD,
            newRowData.ZONE_CD,
            newRowData.BANK_CD,
            newRowData.BAY_CD,
            newRowData.LEV_CD
        ]
    });
    if (searchIndex > -1) {
        $NC.setGridSelectRow(G_GRDMASTER, searchIndex);
        alert($NC.getDisplayMsg("JS.CMC05010E0.015", "등록된 권장 로케이션이 존재합니다."));
        return;
    }

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);

    _Save();
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
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

/**
 * 사업부 검색 결과
 * 
 * @param resultInfo
 */
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

    onChangingItemCondition();
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDZONE.data.getLength() > 0;

    $NC.setEnable("#btnEntryRecommendLoc", permission.canSave && enable);
}