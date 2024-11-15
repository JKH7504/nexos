/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC04010E0
 *  프로그램명         : 정책관리
 *  프로그램설명       : 정책관리 화면 Javascript
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
                "#grdMaster",
                "#grdDetail"
            ]
        }
    });

    // 조회조건 - 정책그룹 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "POLICY_GRP",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQPolicy_Grp",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "v", $NC.G_OFFSET.leftViewWidth, 300, 400);
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.leftViewWidth = 500;
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

    onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 데이터 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var POLICY_GRP = $NC.getValue("#cboQPolicy_Grp");
    var POLICY_NM = $NC.getValue("#edtQPolicy_Nm", true);
    var POLICY_VAL_NM = $NC.getValue("#edtQPolicy_Val_Nm", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_POLICY_GRP: POLICY_GRP,
        P_POLICY_NM: POLICY_NM,
        P_POLICY_VAL_NM: POLICY_VAL_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CSC04010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var refRowData, newRowData;
    // grdMaster에 포커스가 있을 경우 (왼쪽그리드)
    if (G_GRDMASTER.focused) {

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }

        refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        // 정책그룹 기본값
        var POLICY_DIV = "3"; // 사업부정책이 기본값
        var POLICY_GRP;
        if ($NC.isNull(refRowData)) {
            POLICY_GRP = "CM";
        } else {
            POLICY_GRP = refRowData.POLICY_GRP;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            POLICY_CD: null,
            POLICY_NM: null,
            POLICY_DIV: POLICY_DIV,
            POLICY_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
                columnId: "POLICY_DIV_F",
                searchVal: POLICY_DIV,
                dataCodeField: "COMMON_CD",
                dataFullNameField: "COMMON_CD_F"
            }),
            POLICY_GRP: POLICY_GRP,
            POLICY_GRP_F: $NC.getGridComboName(G_GRDMASTER, {
                columnId: "POLICY_GRP_F",
                searchVal: POLICY_GRP,
                dataCodeField: "COMMON_CD",
                dataFullNameField: "COMMON_CD_F"
            }),
            REMARK1: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDMASTER, newRowData);
    }
    // grdDetail에 포커스가 있을 경우
    else {
        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.001", "정책코드가 없습니다.\n\n정책코드를 먼저 등록하십시오."));
            return;
        }

        refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.002", "신규 정책코드입니다.\n\n저장 후 정책 상세정보를 등록하십시요."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            POLICY_CD: refRowData.POLICY_CD,
            POLICY_VAL: null,
            POLICY_VAL_NM: null,
            RECOMMEND_YN: $ND.C_NO,
            REMARK1: null,
            REG_USER_ID: null,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_N
        };

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDDETAIL, newRowData);
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CSC04010E0.003", "저장할 데이터가 없습니다."));
        return;
    }

    if (G_GRDMASTER.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }
    } else {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }
    }

    // 상세정보가 변경되었을 때 권장여부 선택여부 체크
    if ($NC.isGridModified(G_GRDDETAIL)) {
        var searchRows = $NC.getGridSearchRows(G_GRDDETAIL, {
            searchKey: "RECOMMEND_YN",
            searchVal: $ND.C_YES
        });
        if (searchRows.length == 0) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.005", "권장 정책값을 선택하십시오."));
            return;
        } else if (searchRows.length > 1) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.006", "권장 정책값은 하나만 선택해야 합니다."));
            return;
        }
    }

    // 정책코드 수정 데이터
    var dsMaster = [];
    var rowData, rIndex, rCount;
    for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_POLICY_CD: rowData.POLICY_CD,
            P_POLICY_NM: rowData.POLICY_NM,
            P_POLICY_DIV: rowData.POLICY_DIV,
            P_POLICY_GRP: rowData.POLICY_GRP,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    // 정책값 수정 데이터
    var dsDetail = [];
    for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_POLICY_CD: rowData.POLICY_CD,
            P_POLICY_VAL: rowData.POLICY_VAL,
            P_POLICY_VAL_NM: rowData.POLICY_VAL_NM,
            P_RECOMMEND_YN: rowData.RECOMMEND_YN,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0 && dsDetail.length == 0) {
        alert($NC.getDisplayMsg("JS.CSC04010E0.004", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CSC04010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_RECOMMEND_PARAMS: $NC.G_VAR.recommendParams,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var rowData;
    if (G_GRDMASTER.focused) {

        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.007", "삭제할 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CSC04010E0.008", "정책을 삭제 하시겠습니까?"))) {
            return;
        }

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDMASTER, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDMASTER.data.updateItem(rowData.id, rowData);
            _Save();
        }
    } else {

        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.007", "삭제할 데이터가 없습니다."));
            return;
        }

        rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        // 권장을 삭제할 경우 먼저 삭제할 데이터를 제외하고 다른 정책값을 선택하도록 메시지 표시
        if (rowData.RECOMMEND_YN == $ND.C_YES) {
            if (G_GRDDETAIL.data.getLength() > 1) {
                alert($NC.getDisplayMsg("JS.CSC04010E0.009", "권장 정책값을 삭제하려면 다른 정책값을 권장으로 지정 후 삭제하십시오."));
                return;
            }
        }

        if (!confirm($NC.getDisplayMsg("JS.CSC04010E0.010", "정책 상세정보를 삭제 하시겠습니까?"))) {
            return;
        }

        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.deleteGridRowData(G_GRDDETAIL, rowData);
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }
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
        selectKey: "POLICY_VAL",
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
        case "RECOMMEND_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            var refRowData = G_GRDDETAIL.data.getItem(args.row);
            if (refRowData.RECOMMEND_YN == $ND.C_YES) {
                // 권장정책이 변경될 경우 기록
                $NC.G_VAR.recommendParams = {
                    P_POLICY_DIV: $ND.C_NULL, // 정책관리 화면은 *로 입력
                    P_CENTER_CD: $ND.C_NULL,
                    P_BU_CD: $ND.C_NULL,
                    P_POLICY_CD: refRowData.POLICY_CD,
                    P_POLICY_VAL: refRowData.POLICY_VAL
                };

                // 정책상세 그리드의 권장여부는 한 행만 "Y"이어야 한다.
                var rowData;
                for (var rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
                    rowData = G_GRDDETAIL.data.getItem(rIndex);
                    if (rowData.RECOMMEND_YN == $ND.C_YES && rowData.id != refRowData.id) {
                        rowData.RECOMMEND_YN = $ND.C_NO;

                        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
                        $NC.setGridApplyChange(G_GRDDETAIL, rowData);
                    }
                }
            }
            break;
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "POLICY_GRP_F",
        field: "POLICY_GRP_F",
        name: "정책그룹",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "POLICY_GRP",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "POLICY_GRP",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_CD",
        field: "POLICY_CD",
        name: "정책코드",
        cssClass: "styCenter",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_NM",
        field: "POLICY_NM",
        name: "정책명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_DIV_F",
        field: "POLICY_DIV_F",
        name: "정책구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "POLICY_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "POLICY_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 정책(왼쪽그리드) 그리드 초기값 설정
 */
function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CSC04010E0.RS_MASTER",
        sortCol: "POLICY_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
    G_GRDMASTER.view.onFocus.subscribe(grdMasterOnFocus);

    // 최초 조회시 포커스 처리
    G_GRDMASTER.focused = true;
}

function grdMasterOnFocus(e, args) {

    if (G_GRDMASTER.focused) {
        return;
    }
    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;

    // 디테일 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }
}

/**
 * New버튼 클릭시 추가한 행의 첫번째 셀로 포커스 이동
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, "POLICY_GRP_F", true);
}

/**
 * 정책(왼쪽그리드) 그리드: 신규일 경우만 정책코드 편집 가능하도록 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "POLICY_CD":
            case "POLICY_GRP_F":
                return false;
        }
    }
    return true;
}

/**
 * 정책(왼쪽그리드) 그리드의 셀 값 변경 되었을 경우 처리
 * 
 * @param e
 * @param args
 *        row: activeRow, cell: activeCell, item: item
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 정책(왼쪽그리드) 그리드의 입력값 체크
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "POLICY_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.POLICY_CD)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.011", "정책코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "POLICY_CD", true);
            return false;
        }
        if ($NC.isNull(rowData.POLICY_NM)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.012", "정책명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "POLICY_NM", true);
            return false;
        }
        if ($NC.isNull(rowData.POLICY_GRP)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.013", "정책그룹을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "POLICY_GRP_F", true);
            return false;
        }
        if ($NC.isNull(rowData.POLICY_DIV)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.014", "정책구분을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "POLICY_DIV_F", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);

    // 정책의 중복체크
    if (rowData.CRUD == $ND.C_DV_CRUD_C) {
        var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
            searchKey: [
                "POLICY_GRP",
                "POLICY_CD"
            ],
            searchVal: [
                rowData.POLICY_GRP,
                rowData.POLICY_CD
            ]
        });
        if (searchRows.length > 1) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.015", "정책코드 중복입니다. 확인 후 다시 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "POLICY_GRP_F", true);
            return false;
        }
    }
    return true;
}

/**
 * 정책(왼쪽그리드) 그리드의 행 클릭시 처리
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

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        onGetDetail({
            data: null
        });
    } else {
        G_GRDDETAIL.queryParams = {
            P_POLICY_CD: rowData.POLICY_CD
        };
        // 디테일 조회
        $NC.serviceCall("/CSC04010E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);

}
function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "POLICY_VAL",
        field: "POLICY_VAL",
        name: "정책값",
        editor: Slick.Editors.Text,
        cssClass: "styCenter",
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "POLICY_VAL_NM",
        field: "POLICY_VAL_NM",
        name: "정책값명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "RECOMMEND_YN",
        field: "RECOMMEND_YN",
        name: "권장여부",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 정책상세(오른쪽 그리드)의 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0,
        specialRow: {
            compareKey: "RECOMMEND_YN",
            compareVal: $ND.C_YES,
            compareOperator: "==",
            cssClass: "styApplyDone"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CSC04010E0.RS_DETAIL",
        sortCol: "POLICY_VAL",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
    G_GRDDETAIL.view.onFocus.subscribe(grdDetailOnFocus);
}

function grdDetailOnFocus(e, args) {

    if (G_GRDDETAIL.focused) {
        return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;

    // 디테일 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }
}

function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "POLICY_VAL", true);
}

/**
 * 정책상세(오른쪽그리드)의 셀 값 변경전 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "POLICY_VAL":
                return false;
        }
    }
    return true;
}

/**
 * 정책상세(오른쪽그리드)의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 *        row: activeRow, cell: activeCell, item: item
 */
function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

/**
 * 정책상세(오른쪽그리드)의 입력체크 처리
 */
function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "POLICY_VAL")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.POLICY_VAL)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.016", "적용값을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "POLICY_VAL", true);
            return false;
        }
        if ($NC.isNull(rowData.POLICY_VAL_NM)) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.017", "적용값명을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "POLICY_VAL_NM", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);

    // 정책상세의 중복체크
    if (rowData.CRUD == $ND.C_DV_CRUD_C) {
        var searchRows = $NC.getGridSearchRows(G_GRDDETAIL, {
            searchKey: "POLICY_VAL",
            searchVal: rowData.POLICY_VAL
        });
        if (searchRows.length > 1) {
            alert($NC.getDisplayMsg("JS.CSC04010E0.018", "적용값 중복입니다. 확인 후 다시 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "POLICY_VAL", true);
            return false;
        }
    }
    return true;
}

/**
 * 정책상세(오른쪽그리드)에 행 클릭 처리
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
 * 왼쪽그리드(정책)에 데이터 표시 처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "POLICY_CD", G_GRDMASTER.focused)) {
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
    }

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
 * 정책상세(오른쪽그리드)에 표시할 데이터를 취득해서 화면에 표시
 */
function onGetDetail(ajaxData) {

    $NC.G_VAR.recommendParams = {}; // 정책값권장변경기록
    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "POLICY_VAL", G_GRDDETAIL.focused);
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "POLICY_CD"
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "POLICY_VAL"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal1;
    G_GRDDETAIL.lastKeyVal = lastKeyVal2;
}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var grdObject;
    if (G_GRDMASTER.focused) {
        grdObject = G_GRDMASTER;
    } else {
        grdObject = G_GRDDETAIL;
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
