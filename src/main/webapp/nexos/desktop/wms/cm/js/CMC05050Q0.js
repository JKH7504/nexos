/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC05050Q0
 *  프로그램명         : 상품로케이션내역
 *  프로그램설명       : 상품로케이션내역 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-02-28
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-02-28    ASETEC           신규작성
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
        }
    });

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 조회 조건 팝업버튼 Event 연결
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);

    // Grid 초기화
    grdMasterInitialize();

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
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_LOC_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_LOC_DIV",
                    P_COMMON_CD: $ND.C_ALL
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_STATE",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_STATE",
                    P_COMMON_CD: $ND.C_ALL
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
            onComplete: function(dsResult) {
                $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
            }
        });
        // 조회조건 - 상품로케이션구분 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_Loc_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_LOC_DIV),
            addAll: true,
            onComplete: function(dsResult) {
                $NC.setValue("#cboQItem_Loc_Div", $ND.C_ALL);
            }
        });
        // 조회조건 - 상품상태 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_State",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE),
            addAll: true,
            onComplete: function() {
                $NC.setValue("#cboQItem_State", $ND.C_ALL);
            }
        });
    });
}

/**
 * 화면 로드가 완료되었을 경우 자동 호출 됨
 */
function _OnLoaded() {

}

/**
 * 화면 리사이즈 Offset 세팅 - 고정 값
 */
function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 * 
 * @param {JQueryObject}
 *        parent Window JQueryObject
 * @param {Number}
 *        viewWidth Window width
 * @param {Number}
 *        viewHeight Window height
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회 조건 입력 값 체크
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05050Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05050Q0.002", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var ITEM_LOC_DIV = $NC.getValue("#cboQItem_Loc_Div");
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 서비스 호출 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_CUST_CD: CUST_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_LOC_DIV: ITEM_LOC_DIV,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM
    };
    // 데이터 조회 서비스 호출
    $NC.serviceCall("/CMC05050Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

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
 * 조회 조건에 있는 Input, Select Change Event 처리
 * 
 * @param {Object}
 *        e Event Object
 * @param {JQueryObject}
 *        view Event가 발생한 Element
 * @param {String}
 *        val Event가 발생한 Element의 현재 값
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
        default:
            break;
    }

    onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어 처리
 */
function onChangingCondition() {

    // 데이터 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * grdMaster Grid 컬럼 세팅
 * 
 * @returns {Array}
 */
function grdMasterOnGetColumns() {

    var columns = [ ];

    // 그리드 컬럼 정보
    // id: {String} 컬럼에 대한 ID
    // field: {String} 데이터 Field 명
    // name: {String} 컬럼 타이틀
    // minWidth: {Number} 컬럼 최소 너비
    // minWidth: {Number} 컬럼 최대 너비
    // formatter: {Object} 값 표시 Formatter, Slick.Formatters.CheckBox
    // editor: {Object} 값 편집 Editor, Slick.Editors.Text, CheckBox, Number, Date, ComboBox
    // editorOptions: {Object} Editor 옵션
    // summaryTitle: {String} Summary 컬럼 타이틀
    // groupToggler: {Boolean} Group Collapse/Expand 버튼 표시 컬럼
    // groupDisplay: {Boolean} Group 컬럼 값 표시
    // aggregator: {String} Aggregator, SUM, MAX, MIN, AVG
    // cssClass: {String} 컬럼 Css, styLeft, styCenter, styRight

    // TODO: 그리드 컬럼 세팅
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
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOC_DIV_F",
        field: "ITEM_LOC_DIV_F",
        name: "상품로케이션구분"
    });
    $NC.setGridColumn(columns, {
        id: "RECOMMEND_DIV_D",
        field: "RECOMMEND_DIV_D",
        name: "권장구분"
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
        id: "KEEP_DIV_F",
        field: "KEEP_DIV_F",
        name: "보관구분"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * grdMaster Grid 초기화
 */
function grdMasterInitialize() {

    // Grid 옵션 세팅
    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC05050Q0.RS_MASTER", // QUERY ID
        sortCol: "id", // 기본 정렬 컬럼의 ID
        gridOptions: options
    });

    // Grid 스크롤 이벤트
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * grdMaster Grid 스크롤 이벤트
 * 
 * @param {Object}
 *        e Event Object
 * @param {Object}
 *        args grid: SlickGrid, rows: Array
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재 Row/총 건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
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

    onChangingCondition();
}
