/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC01040Q0
 *  프로그램명         : 로케이션라벨출력
 *  프로그램설명       : 로케이션라벨출력 화면 Javascript
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
        // 체크할 정책 값
        policyVal: {
            CM120: "", // 로케이션 표시
            CM121: "", // 로케이션 존 길이
            CM122: "", // 로케이션 행 길이
            CM123: "", // 로케이션 열 길이
            CM124: "" // 로케이션 단 길이
        },
        autoResizeView: {
            container: "#divMasterView",
            grids: [
                "#grdMaster"
            ]
        }

    });

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
                P_RESULT_ID: "O_WC_POP_CMZONE",
                P_QUERY_ID: "WC.POP_CMZONE",
                P_QUERY_PARAMS: {
                    P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
                    P_ZONE_CD: $ND.C_ALL
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
                // 정책
                setPolicyValInfo();
            }
        });
        // 조회조건 - 존코드 세팅
        $NC.setInitComboData({
            selector: "#cboQZone_Cd",
            codeField: "ZONE_CD",
            nameField: "ZONE_NM",
            fullNameField: "ZONE_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMZONE),
            addAll: true,
            multiSelect: true
        });
    });

    // 프로그램 레포트 정보 세팅
    $NC.setProgramReportInfo();
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
        case "CENTER_CD":
            // 존코드 세팅
            $NC.setInitCombo("/WC/getDataSet.do", {
                P_QUERY_ID: "WC.POP_CMZONE",
                P_QUERY_PARAMS: {
                    P_CENTER_CD: val,
                    P_ZONE_CD: $ND.C_ALL
                }
            }, {
                selector: "#cboQZone_Cd",
                codeField: "ZONE_CD",
                nameField: "ZONE_NM",
                fullNameField: "ZONE_CD_F",
                addAll: true,
                multiSelect: true
            });
            setPolicyValInfo();
            break;
        case "BANK_CD1":
            if (!$NC.isNull(val)) {
                if (val.length != Number($NC.G_VAR.policyVal.CM122)) {
                    alert($NC.getDisplayMsg("JS.CMC01040Q0.002", "시작 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리)를 정확히 입력하여 주십시오.",
                        $NC.G_VAR.policyVal.CM122));
                    $NC.setFocus("#edtQBank_Cd1");
                } else {
                    $NC.setValue("#edtQBank_Cd1", val.toUpperCase());
                }
            }
            break;
        case "BANK_CD2":
            if (!$NC.isNull(val)) {
                if (val.length != Number($NC.G_VAR.policyVal.CM122)) {
                    alert($NC.getDisplayMsg("JS.CMC01040Q0.003", "종료 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리)를 정확히 입력하여 주십시오.",
                        $NC.G_VAR.policyVal.CM122));
                    $NC.setFocus("#edtQBank_Cd2");
                } else {
                    $NC.setValue("#edtQBank_Cd2", val.toUpperCase());
                }
            }
            break;
        case "BAY_CD1":
            if (!$NC.isNull(val)) {
                if (val.length != Number($NC.G_VAR.policyVal.CM123)) {
                    alert($NC.getDisplayMsg("JS.CMC01040Q0.005", "시작 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리)를 정확히 입력하여 주십시오.",
                        $NC.G_VAR.policyVal.CM123));
                    $NC.setFocus("#edtQBay_Cd1");
                } else {
                    $NC.setValue("#edtQBay_Cd1", val.toUpperCase());
                }
            }
            break;
        case "BAY_CD2":
            if (!$NC.isNull(val)) {
                if (val.length != Number($NC.G_VAR.policyVal.CM123)) {
                    alert($NC.getDisplayMsg("JS.CMC01040Q0.006", "종료 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리)를 정확히 입력하여 주십시오.",
                        $NC.G_VAR.policyVal.CM123));
                    $NC.setFocus("#edtQBay_Cd2");
                } else {
                    $NC.setValue("#edtQBay_Cd2", val.toUpperCase());
                }
            }
            break;
        case "LEV_CD1":
            if (!$NC.isNull(val)) {
                if (val.length != Number($NC.G_VAR.policyVal.CM124)) {
                    alert($NC.getDisplayMsg("JS.CMC01040Q0.008", "시작 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리)를 정확히 입력하여 주십시오.",
                        $NC.G_VAR.policyVal.CM124));
                    $NC.setFocus("#edtQLev_Cd1");
                } else {
                    $NC.setValue("#edtQLev_Cd1", val.toUpperCase());
                }
            }
            break;
        case "LEV_CD2":
            if (!$NC.isNull(val)) {
                if (val.length != Number($NC.G_VAR.policyVal.CM124)) {
                    alert($NC.getDisplayMsg("JS.CMC01040Q0.009", "종료 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리)를 정확히 입력하여 주십시오.",
                        $NC.G_VAR.policyVal.CM124));
                    $NC.setFocus("#edtQLev_Cd2");
                } else {
                    $NC.setValue("#edtQLev_Cd2", val.toUpperCase());
                }
            }
            break;
    }

    onChangingCondition();
}

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
        alert($NC.getDisplayMsg("JS.CMC01040Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var ZONE_CD = $NC.getValue("#cboQZone_Cd", true);

    var BANK_CD1 = $NC.getValue("#edtQBank_Cd1");
    if ($NC.isNull(BANK_CD1)) {
        BANK_CD1 = "0";
    } else {
        if (!$NC.equals(BANK_CD1.length, Number($NC.G_VAR.policyVal.CM122))) {
            alert($NC.getDisplayMsg("JS.CMC01040Q0.002", "시작 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리)를 정확히 입력하여 주십시오.", $NC.G_VAR.policyVal.CM122));
            $NC.setFocus("#edtQBank_Cd1");
            return;
        } else {
            BANK_CD1 = BANK_CD1.toUpperCase();
            $NC.setValue("#edtQBank_Cd1", BANK_CD1);
        }
    }

    var BANK_CD2 = $NC.getValue("#edtQBank_Cd2");
    if ($NC.isNull(BANK_CD2)) {
        BANK_CD2 = "ZZZ";
    } else {
        if (!$NC.equals(BANK_CD2.length, Number($NC.G_VAR.policyVal.CM122))) {
            alert($NC.getDisplayMsg("JS.CMC01040Q0.003", "종료 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리)를 정확히 입력하여 주십시오.", $NC.G_VAR.policyVal.CM122));
            $NC.setFocus("#edtQBank_Cd2");
            return;
        } else {
            BANK_CD2 = BANK_CD2.toUpperCase();
            $NC.setValue("#edtQBank_Cd2", BANK_CD2);
        }
    }

    if (BANK_CD1 > BANK_CD2) {
        alert($NC.getDisplayMsg("JS.CMC01040Q0.004", "행 첫번째 값이 두번째 값보다 클 수 없습니다."));
        $NC.setFocus("#edtQBank_Cd1");
        return;
    }

    var BAY_CD1 = $NC.getValue("#edtQBay_Cd1");
    if ($NC.isNull(BAY_CD1)) {
        BAY_CD1 = "0";
    } else {
        if (!$NC.equals(BAY_CD1.length, Number($NC.G_VAR.policyVal.CM123))) {
            alert($NC.getDisplayMsg("JS.CMC01040Q0.005", "시작 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리)를 정확히 입력하여 주십시오.", $NC.G_VAR.policyVal.CM123));
            $NC.setFocus("#edtQBay_Cd1");
            return;
        } else {
            BAY_CD1 = BAY_CD1.toUpperCase();
            $NC.setValue("#edtQBay_Cd1", BAY_CD1);
        }
    }

    var BAY_CD2 = $NC.getValue("#edtQBay_Cd2");
    if ($NC.isNull(BAY_CD2)) {
        BAY_CD2 = "ZZZ";
    } else {
        if (!$NC.equals(BAY_CD2.length, Number($NC.G_VAR.policyVal.CM123))) {
            alert($NC.getDisplayMsg("JS.CMC01040Q0.006", "종료 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리)를 정확히 입력하여 주십시오.", $NC.G_VAR.policyVal.CM123));
            $NC.setFocus("#edtQBay_Cd2");
            return;
        } else {
            BAY_CD2 = BAY_CD2.toUpperCase();
            $NC.setValue("#edtQBay_Cd2", BAY_CD2);
        }
    }

    if (BAY_CD1 > BAY_CD2) {
        alert($NC.getDisplayMsg("JS.CMC01040Q0.007", "열 첫번째 값이 두번째 값보다 클 수 없습니다."));
        $NC.setFocus("#edtQBay_Cd1");
        return;
    }

    var LEV_CD1 = $NC.getValue("#edtQLev_Cd1");
    if ($NC.isNull(LEV_CD1)) {
        LEV_CD1 = "0";
    } else {
        if (!$NC.equals(LEV_CD1.length, Number($NC.G_VAR.policyVal.CM124))) {
            alert($NC.getDisplayMsg("JS.CMC01040Q0.008", "시작 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리)를 정확히 입력하여 주십시오.", $NC.G_VAR.policyVal.CM124));
            $NC.setFocus("#edtQLev_Cd1");
            return;
        } else {
            LEV_CD1 = LEV_CD1.toUpperCase();
            $NC.setValue("#edtQLev_Cd1", LEV_CD1);
        }
    }

    var LEV_CD2 = $NC.getValue("#edtQLev_Cd2");
    if ($NC.isNull(LEV_CD2)) {
        LEV_CD2 = "ZZZ";
    } else {
        if (!$NC.equals(LEV_CD2.length, Number($NC.G_VAR.policyVal.CM124))) {
            alert($NC.getDisplayMsg("JS.CMC01040Q0.009", "종료 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리)를 정확히 입력하여 주십시오.", $NC.G_VAR.policyVal.CM124));
            $NC.setFocus("#edtQLev_Cd2");
            return;
        } else {
            LEV_CD2 = LEV_CD2.toUpperCase();
            $NC.setValue("#edtQLev_Cd2", LEV_CD2);
        }
    }

    if (LEV_CD1 > LEV_CD2) {
        alert($NC.getDisplayMsg("JS.CMC01040Q0.010", "단 첫번째 값이 두번째 값보다 클 수 없습니다."));
        $NC.setFocus("#edtQLev_Cd1");
        return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 데이터 조회
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_ZONE_CD: ZONE_CD,
        P_BANK_CD1: BANK_CD1,
        P_BANK_CD2: BANK_CD2,
        P_BAY_CD1: BAY_CD1,
        P_BAY_CD2: BAY_CD2,
        P_LEV_CD1: LEV_CD1,
        P_LEV_CD2: LEV_CD2
    };
    $NC.serviceCall("/CMC01040Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC01040Q0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // LABEL_CMC01 - 로케이션라벨
        case "LABEL_CMC01":
        case "LABEL_CMC11":
        case "LABEL_CMC12":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                valueColumns: "LOCATION_CD"
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD
            };
            break;
        // 미정의된 레포트
        default:
            alert($NC.getDisplayMsg("JS.COMMON.036", "[" + reportInfo.REPORT_NM + "]구현되지 않은 레포트 정보입니다. 출력할 수 없습니다.", reportInfo.REPORT_NM));
            return;
    }

    if ($NC.isNotEmpty(checkedData)) {
        // 선택 건수 체크
        if (checkedData.checkedCount == 0) {
            alert($NC.getDisplayMsg("JS.COMMON.037", "[" + reportInfo.REPORT_NM + "]출력할 데이터를 선택하십시오.", reportInfo.REPORT_NM));
            return;
        }
        // 선택 건수 중 출력 대상 건수
        if (checkedData.values.length == 0) {
            alert($NC.getDisplayMsg("JS.COMMON.038", "[" + reportInfo.REPORT_NM + "]출력 가능한 데이터를 선택하십시오.", reportInfo.REPORT_NM));
            return;
        }
    }

    // 출력 파라메터 세팅
    var printOptions = {
        reportDoc: reportInfo.REPORT_DOC_URL,
        reportTitle: reportInfo.REPORT_TITLE_NM,
        queryId: reportInfo.REPORT_QUERY_ID,
        queryParams: queryParams,
        internalQueryYn: reportInfo.INTERNAL_QUERY_YN,
        checkedValue: $NC.toJoin(checkedData.values)
    };

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);
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

function grdMasterOnGetColumns() {

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
    });
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
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC01040Q0.RS_MASTER",
        sortCol: "ZONE_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
    G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

function grdMasterOnClick(e, args) {

    var columnId = G_GRDMASTER.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDMASTER, e, args);
            break;
    }
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
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
    $NC.G_VAR.buttons._print = $NC.iif(G_GRDMASTER.data.getLength() > 0, "1", "0");

    $NC.setInitTopButtons($NC.G_VAR.buttons);
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
