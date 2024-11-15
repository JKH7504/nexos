/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC04030E0
 *  프로그램명         : 물류센터정책관리
 *  프로그램설명       : 물류센터정책관리 화면 Javascript
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
        autoResizeView: {
            container: "#divMasterView",
            grids: [
                "#grdSub"
            ]
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divMaster",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divDetail",
                grids: "#grdDetail"
            },
            viewType: "h",
            viewFixed: 450
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();

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
                P_RESULT_ID: "O_WC_POP_CMCODE_POLICY_GRP",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "POLICY_GRP",
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
            }
        });

        // 조회조건 - 정책그룹 세팅
        $NC.setInitComboData({
            selector: "#cboQPolicy_Grp",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_POLICY_GRP),
            addAll: true
        });
    });
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.fixedLeftWidth = 450;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    // var id = view.prop("id").substr(4).toUpperCase();

    onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);
    $NC.clearGridData(G_GRDSUB);

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
        case "SELECT_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            var refRowData = G_GRDDETAIL.data.getItem(args.row);
            if (refRowData.SELECT_YN == $ND.C_YES) {
                // 권장정책이 변경될 경우 기록
                $NC.G_VAR.recommendParams = {
                    P_POLICY_DIV: "2", // 물류센터정책관리 화면은 2로 입력
                    P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                    P_BU_CD: $ND.C_NULL,
                    P_POLICY_CD: refRowData.POLICY_CD,
                    P_POLICY_VAL: refRowData.POLICY_VAL
                };

                // 정책상세 그리드의 권장여부는 한 행만 "Y"이어야 한다.
                var rowData;
                for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
                    rowData = G_GRDDETAIL.data.getItem(rIndex);
                    if (rowData.SELECT_YN == $ND.C_YES && rowData.id != refRowData.id) {
                        rowData.SELECT_YN = $ND.C_NO;

                        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
                        $NC.setGridApplyChange(G_GRDDETAIL, rowData);
                    }
                }
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
        alert($NC.getDisplayMsg("JS.CSC04030E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var POLICY_GRP = $NC.getValue("#cboQPolicy_Grp");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    $NC.setInitGridData(G_GRDMASTER);
    $NC.setInitGridVar(G_GRDDETAIL);
    $NC.setInitGridData(G_GRDDETAIL);
    $NC.setInitGridVar(G_GRDSUB);
    $NC.setInitGridData(G_GRDSUB);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_POLICY_GRP: POLICY_GRP
    };
    // 데이터 조회
    $NC.serviceCall("/CSC04030E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    // 파라메터 세팅
    G_GRDSUB.queryParams = {
        P_CENTER_CD: CENTER_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CSC04030E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
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

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC04030E0.002", "저장할 데이터가 없습니다."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CSC04030E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var dsD = [];
    var dsC = [];
    var selectedCount = 0;
    var rowData, saveRowData;
    for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        // 선택되었을 경우, 기존 등록 데이터가 아니면 생성
        if (rowData.SELECT_YN == $ND.C_YES) {
            selectedCount++;
            if (rowData.ENTRY_YN == $ND.C_NO) {
                saveRowData = {
                    P_CENTER_CD: CENTER_CD,
                    P_POLICY_CD: rowData.POLICY_CD,
                    P_POLICY_VAL: rowData.POLICY_VAL,
                    P_CRUD: $ND.C_DV_CRUD_C
                };
                dsC.push(saveRowData);
            }
        } else {
            // 선택되지 않았을 경우, 기존 등록 데이터면 삭제
            if (rowData.ENTRY_YN == $ND.C_YES) {
                saveRowData = {
                    P_CENTER_CD: CENTER_CD,
                    P_POLICY_CD: rowData.POLICY_CD,
                    P_POLICY_VAL: rowData.POLICY_VAL,
                    P_CRUD: $ND.C_DV_CRUD_D
                };
                dsD.push(saveRowData);
            }
        }
    }

    if (selectedCount > 1) {
        alert($NC.getDisplayMsg("JS.CSC04030E0.004", "정책 적용값은 하나만 선택하여야 합니다."));
        return;
    }

    var dsMaster = dsD.concat(dsC);
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC04030E0.003", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC04030E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_RECOMMEND_PARAMS: $NC.G_VAR.recommendParams,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
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

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "POLICY_CD",
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "POLICY_CD",
            "POLICY_VAL"
        ],
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "POLICY_GRP_F",
        field: "POLICY_GRP_F",
        name: "정책그룹"
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_CD",
        field: "POLICY_CD",
        name: "정책코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_NM",
        field: "POLICY_NM",
        name: "정책명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC04030E0.RS_MASTER",
        sortCol: "POLICY_CD",
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);

    // 파라메터 세팅
    G_GRDDETAIL.queryParams = {
        P_POLICY_CD: rowData.POLICY_CD,
        P_CENTER_CD: CENTER_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CSC04030E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "POLICY_VAL",
        field: "POLICY_VAL",
        name: "정책값",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_VAL_NM",
        field: "POLICY_VAL_NM",
        name: "정책값명"
    });
    $NC.setGridColumn(columns, {
        id: "RECOMMEND_YN",
        field: "RECOMMEND_YN",
        name: "권장여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "SELECT_YN",
        field: "SELECT_YN",
        name: "선택여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0,
        specialRow: {
            compareKey: "SELECT_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styApplyDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CSC04030E0.RS_DETAIL",
        sortCol: "POLICY_VAL",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "POLICY_GRP_F",
        field: "POLICY_GRP_F",
        name: "정책그룹"
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_CD",
        field: "POLICY_CD",
        name: "정책코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_NM",
        field: "POLICY_NM",
        name: "정책명"
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_VAL",
        field: "POLICY_VAL",
        name: "정책값",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_VAL_NM",
        field: "POLICY_VAL_NM",
        name: "정책값명"
    });
    $NC.setGridColumn(columns, {
        id: "RECOMMEND_YN",
        field: "RECOMMEND_YN",
        name: "권장정책여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "REG_USER_ID",
        field: "REG_USER_ID",
        name: "최종등록자"
    });
    $NC.setGridColumn(columns, {
        id: "REG_DATETIME",
        field: "REG_DATETIME",
        name: "최종등록일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

    var options = {
        frozenColumn: 3
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "CSC04030E0.RS_SUB1",
        sortCol: "POLICY_CD",
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

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "POLICY_CD", true)) {
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

    $NC.G_VAR.recommendParams = {}; // 정책값선택변경기록
    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    var rCount = G_GRDDETAIL.data.getLength();
    if (rCount > 0) {
        // 기존 선택값 복사
        var rowData;
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = G_GRDDETAIL.data.getItem(rIndex);
            rowData["ENTRY_YN"] = rowData.SELECT_YN;
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        }
    }
    $NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "POLICY_CD",
        "POLICY_VAL"
    ]);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB, "POLICY_CD");
}

function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "POLICY_CD"
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "POLICY_CD",
            "POLICY_VAL"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
}
