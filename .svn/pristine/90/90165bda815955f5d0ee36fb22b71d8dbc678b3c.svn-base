/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC04050Q0
 *  프로그램명         : 설정정책조회
 *  프로그램설명       : 설정정책조회 화면 Javascript
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
                "#grdMaster"
            ]
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

    // 이벤트 연결
    $("#btnQBu_Cd").click(showUserBuPopup);

    // 그리드 초기화
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
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
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

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CSC04050Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CSC04050Q0.002", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var POLICY_GRP = $NC.getValue("#cboQPolicy_Grp");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_POLICY_GRP: POLICY_GRP
    };
    // 데이터 조회
    $NC.serviceCall("/CSC04050Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "POLICY_GRP_F",
        field: "POLICY_GRP_F",
        name: "정책그룹",
        resizable: false,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_CD",
        field: "POLICY_CD",
        name: "정책코드",
        resizable: false,
        cssClass: "styCenter",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_NM",
        field: "POLICY_NM",
        name: "정책명",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_DIV_F",
        field: "POLICY_DIV_F",
        name: "정책구분",
        resizable: false,
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_VAL",
        field: "POLICY_VAL",
        name: "정책값",
        resizable: false,
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
        frozenColumn: 3,
        specialRow: {
            compareKey: "SELECT_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styApplyDone",
            // css 적용 컬럼, 시작 Index
            columns: 4
        },
        multiColumnSort: false
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC04050Q0.RS_MASTER",
        sortCol: "POLICY_CD",
        gridOptions: options,
        // 그룹핑했을때처럼 정렬처리
        onSortCompare: function(item1, item2) {
            var result = 0;
            var compareFn = function(field) {
                var x = item1[field];
                var y = item2[field];
                if (x == y) {
                    return 0;
                }
                return x > y ? 1 : -1;
            };

            result = compareFn("POLICY_CD");
            if (G_GRDMASTER.view.getColumn(G_GRDMASTER.sortCol).groupDisplay == true) {
                if (G_GRDMASTER.sortCol == "POLICY_CD") {
                    if (result == 0) {
                        result = compareFn("POLICY_VAL");
                    }
                } else {
                    if (result == 0) {
                        result = compareFn(G_GRDMASTER.sortCol);
                        if (result == 0) {
                            result = compareFn("POLICY_VAL") * G_GRDMASTER.sortDir;
                        }
                    } else {
                        var x = item1[G_GRDMASTER.sortCol] + item1["POLICY_CD"];
                        var y = item2[G_GRDMASTER.sortCol] + item2["POLICY_CD"];
                        if (x == y) {
                            result = 0;
                        } else {
                            result = x > y ? 1 : -1;
                        }
                        if (result == 0) {
                            result = compareFn("POLICY_VAL") * G_GRDMASTER.sortDir;
                        }
                    }
                }
            } else {
                if (result == 0) {
                    result = compareFn(G_GRDMASTER.sortCol);
                    if (result == 0 && G_GRDMASTER.sortCol != "POLICY_VAL") {
                        result = compareFn("POLICY_VAL") * G_GRDMASTER.sortDir;
                    }
                } else {
                    result = result * G_GRDMASTER.sortDir;
                }
            }
            return result;
        }
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onGetCellValue.subscribe(grdMasterOnGetCellValue);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * OnGetCellValue, Cell 표시 값 리턴, 그리드에 값 표시하기전에 Event 발생
 * 
 * @param e
 * @param args
 *        row<br>
 *        cell<br>
 *        item<br>
 *        column<br>
 *        value<br>
 * @returns {String}<br>
 *          display value<br>
 *          null, undefined -> default value
 */
function grdMasterOnGetCellValue(e, args) {

    if (args.row > 0 && args.column.groupDisplay == true) {
        if (G_GRDMASTER.data.getItem(args.row - 1)["POLICY_CD"] == args.item["POLICY_CD"]) {
            return "";
        }
    }
    return null;
}

function onGetMaster(ajaxData) {
    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, null, true);

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

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

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
