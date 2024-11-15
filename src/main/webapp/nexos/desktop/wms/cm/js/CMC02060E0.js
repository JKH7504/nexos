/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC02060E0
 *  프로그램명         : 택배기준관리
 *  프로그램설명       : 택배기준관리 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-11-26
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-11-26    ASETEC           신규작성
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
            CM530: "" // [택배일반]운송장번호관리정책
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divRightView",
                grids: "#grdDetail"
            },
            viewType: "h",
            viewFixed: {
                container: "#divRightView",
                size: 620
            }
        }
    });

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divRightView", false);
    // 이벤트 연결
    $("#btnQCarrier_Cd").click(showQCarrierPopup);
    $("#btnCreateWbNo").click(btnCreateWbNoOnClick);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

    // 사이트 정책 취득
    setPolicyValInfo();
}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();

    switch (id) {
        case "CARRIER_CD":
            $NP.onCarrierChange(val, {
                P_CARRIER_CD: val,
                P_CARRIDER_DIV: "1",
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onQCarrierPopup);
            return;
    }

    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    $NC.setEnableGroup("#divRightView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CARRIER_CD: CARRIER_CD,
        P_POLICY_CM530: $NC.G_VAR.policyVal.CM530
    };
    // 데이터 조회
    $NC.serviceCall("/CMC02060E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var refRowData, newRowData;
    // grdMaster에 포커스가 있을 경우
    if (G_GRDMASTER.focused) {
        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }
        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        if ($NC.G_VAR.policyVal.CM530 == $ND.C_POLICY_VAL_1) {
            newRowData = {
                CARRIER_CD: null,
                CUST_CD: $ND.C_NULL,
                HDC_DIV: null,
                HD_CUST_ID: null,
                HD_CREDIT_ID: null,
                HD_EDI_USER_ID: null,
                HD_CUST_KEY: null,
                REMARK1: null,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_N
            };
        } else if ($NC.G_VAR.policyVal.CM530 == $ND.C_POLICY_VAL_2) {
            newRowData = {
                CARRIER_CD: null,
                CUST_CD: null,
                HDC_DIV: null,
                HD_CUST_ID: null,
                HD_CREDIT_ID: null,
                HD_EDI_USER_ID: null,
                HD_CUST_KEY: null,
                REMARK1: null,
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_N
            };
        }

        // 신규 데이터 생성 및 이벤트 호출
        $NC.newGridRowData(G_GRDMASTER, newRowData);
    }
    // grdDetail에 포커스가 있을 경우
    else if (G_GRDDETAIL.focused) {
        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.001", "조회 후 등록하십시오."));
            return;
        }

        refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

        if (refRowData.CRUD == $ND.C_DV_CRUD_N || refRowData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.002", "신규 택배기준입니다.\n\n저장 후 운송장대역번호를 등록하십시요."));
            return;
        }

        if (refRowData.CARRIER_DIV != "1") {
            alert($NC.getDisplayMsg("JS.CMC02060E0.003", "[운송사구분]이 택배사가 아닙니다. 택배사를 선택하고 작업하십시오."));
            return;
        }

        if ($NC.isNull(refRowData.HDC_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.004", "[택배사구분]을 먼저 지정 후 처리하십시오."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }

        // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
        newRowData = {
            CARRIER_CD: refRowData.CARRIER_CD,
            CUST_CD: refRowData.CUST_CD,
            HDC_DIV: refRowData.HDC_DIV,
            LINE_NO: null,
            WB_NO_CONST: null,
            WB_NO_BEGIN: null,
            WB_NO_END: null,
            REMARK1: null,
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

    var rowData, rIndex, rCount;

    // 택배기준
    if (G_GRDMASTER.focused) {

        if (G_GRDMASTER.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.005", "저장할 데이터가 없습니다."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
            return;
        }

        var dsMaster = [];
        for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(rIndex);
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            }
            dsMaster.push({
                P_CARRIER_CD: rowData.CARRIER_CD,
                P_CUST_CD: rowData.CUST_CD,
                P_HDC_DIV: rowData.HDC_DIV,
                P_HD_CUST_ID: rowData.HD_CUST_ID,
                P_HD_CREDIT_ID: rowData.HD_CREDIT_ID,
                P_HD_EDI_USER_ID: rowData.HD_EDI_USER_ID,
                P_HD_CUST_KEY: rowData.HD_CUST_KEY,
                P_REMARK1: rowData.REMARK1,
                P_CRUD: rowData.CRUD
            });
        }
        if (dsMaster.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.006", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/CMC02060E0/saveMaster.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveError);
    }
    // 운송사대역
    else if (G_GRDDETAIL.focused) {
        if (G_GRDDETAIL.data.getLength() == 0) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.005", "저장할 데이터가 없습니다."));
            return;
        }

        // 마지막 선택 Row Validation 체크
        if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
            return;
        }

        var dsDetail = [];
        for (rIndex = 0, rCount = G_GRDDETAIL.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDDETAIL.data.getItem(rIndex);
            if (rowData.CRUD == $ND.C_DV_CRUD_R) {
                continue;
            }
            dsDetail.push({
                P_CARRIER_CD: rowData.CARRIER_CD,
                P_CUST_CD: rowData.CUST_CD,
                P_HDC_DIV: rowData.HDC_DIV,
                P_LINE_NO: rowData.LINE_NO,
                P_WB_NO_CONST: rowData.WB_NO_CONST,
                P_WB_NO_BEGIN: rowData.WB_NO_BEGIN,
                P_WB_NO_END: rowData.WB_NO_END,
                P_REMARK1: rowData.REMARK1,
                P_CRUD: rowData.CRUD
            });
        }

        if (dsDetail.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.006", "데이터 수정 후 저장하십시오."));
            return;
        }

        $NC.serviceCall("/CMC02060E0/saveDetail.do", {
            P_DS_DETAIL: dsDetail,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave2, onSave2Error);
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var rowData;

    // 택배기준 삭제
    if (G_GRDMASTER.focused) {
        if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.007", "삭제할 운송사 데이터가 없습니다."));
            return;
        }

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
        if (rowData.CARRIER_DIV == "1" && rowData.WB_CREATE_YN == $ND.C_YES) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.008", "운송장번호대역 정보가 생성되어 있습니다. 운송장번호대역을 삭제 후 처리하십시오."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC02060E0.009", "운송사를 삭제 하시겠습니까?"))) {
            return;
        }

        // 신규 데이터일 경우 Grid 데이터만 삭제
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
                $NC.setEnableGroup("#divRightView", false);
            }
        } else {
            rowData.CRUD = $ND.C_DV_CRUD_D;
            G_GRDMASTER.data.updateItem(rowData.id, rowData);
            _Save();
        }
    }// 운송장번호대역 삭제
    else if (G_GRDDETAIL.focused) {
        if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.010", "삭제할 운송장번호대역 데이터가 없습니다."));
            return;
        }

        if (!confirm($NC.getDisplayMsg("JS.CMC02060E0.011", "운송장번호대역을 삭제 하시겠습니까?"))) {
            return;
        }

        rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
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
        selectKey: [
            "CARRIER_CD",
            "CUST_CD",
            "HDC_DIV"
        ],
        isCancel: true
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "LINE_NO",
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
        id: "CARRIER_CD",
        field: "CARRIER_CD",
        name: "운송사코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_NM",
        field: "CARRIER_NM",
        name: "운송사명"
    });
    // 
    $NC.setGridColumn(columns, {
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup,
            isKeyField: true
        },
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "HDC_DIV_F",
        field: "HDC_DIV_F",
        name: "택배사구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "HDC_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_ATTR01_CD: $ND.C_YES,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "HDC_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "HD_CUST_ID",
        field: "HD_CUST_ID",
        name: "택배고객사ID",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "HD_CREDIT_ID",
        field: "HD_CREDIT_ID",
        name: "택배신용번호",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "HD_EDI_USER_ID",
        field: "HD_EDI_USER_ID",
        name: "택배EDI사용자ID",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "HD_CUST_KEY",
        field: "HD_CUST_KEY",
        name: "택배고객사인증키",
        editor: Slick.Editors.Text,
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ALL")
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고",
        editor: Slick.Editors.Text
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterOnSetColumns() {

    // [택배일반]운송장번호관리 정책 (1:운용사별관리, 2:고객사별관리)
    $NC.setGridColumns(G_GRDMASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.CM530 != "2" ? "CUST_CD,CUST_NM" : ""
    ]);
}

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC02060E0.RS_MASTER",
        sortCol: "CARRIER_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onFocus.subscribe(grdMasterOnFocus);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);

    // 최초 조회시 포커스 처리
    G_GRDMASTER.focused = true;
}

function grdMasterOnCellChange(e, args) {

    var rowData = args.item;

    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "CARRIER_CD":
            $NP.onCarrierChange(rowData.CARRIER_CD, {
                P_CARRIER_CD: rowData.CARRIER_CD,
                P_CARRIER_DIV: "1",
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, grdMasterOnCarrierPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            return;
        case "CUST_CD":
            $NP.onCustChange(rowData.CUST_CD, {
                P_CUST_CD: rowData.CUST_CD
            }, grdMasterOnCustPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            return;
    }
    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, "CARRIER_CD", true);
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

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "CARRIER_CD":
            case "CUST_CD":
            case "HDC_DIV_F":
                return false;
        }
    }
    return true;
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "CARRIER_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);

    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.G_VAR.policyVal.CM530 == $ND.C_POLICY_VAL_1) {
            if ($NC.isNull(rowData.CARRIER_CD)) {
                alert($NC.getDisplayMsg("JS.CMC02060E0.012", "운송사코드를 입력하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row, "CARRIER_CD", true);
                return false;
            }
            if ($NC.isNull(rowData.HDC_DIV)) {
                alert($NC.getDisplayMsg("JS.CMC02060E0.013", "택배사구분을 선택하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row, "HDC_DIV_F", true);
                return false;
            }
        } else if ($NC.G_VAR.policyVal.CM530 == $ND.C_POLICY_VAL_2) {
            if ($NC.isNull(rowData.CARRIER_CD)) {
                alert($NC.getDisplayMsg("JS.CMC02060E0.014", "운송사코드를 입력하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row, "CARRIER_CD", true);
                return false;
            }
            if ($NC.isNull(rowData.CUST_CD)) {
                alert($NC.getDisplayMsg("JS.CMC02060E0.015", "고객사코드를 입력하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row, "CUST_CD", true);
                return false;
            }
            if ($NC.isNull(rowData.HDC_DIV)) {
                alert($NC.getDisplayMsg("JS.CMC02060E0.016", "택배사구분을 선택하십시오."));
                $NC.setGridSelectRow(G_GRDMASTER, row, "HDC_DIV_F", true);
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);

    if ($NC.isNotNull(rowData)) {
        if (rowData.CRUD != $ND.C_DV_CRUD_C && rowData.CRUD != $ND.C_DV_CRUD_N) {
            G_GRDDETAIL.queryParams = {
                P_CARRIER_CD: rowData.CARRIER_CD,
                P_CUST_CD: rowData.CUST_CD,
                P_HDC_DIV: rowData.HDC_DIV
            };

            // 디테일 조회
            $NC.serviceCall("/CMC02060E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
        }
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnPopup(e, args) {

    switch (args.column.id) {
        case "CARRIER_CD":
            $NP.showCarrierPopup({
                P_CARRIER_CD: $ND.C_ALL,
                P_CARRIER_DIV: "1",
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }, grdMasterOnCarrierPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            return;
        case "CUST_CD":
            $NP.showCustPopup({
                P_CUST_CD: $ND.C_ALL
            }, grdMasterOnCustPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
    }
}

function grdMasterOnCarrierPopup(resultInfo) {

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().cancelCurrentEdit();
    }
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.CARRIER_CD = resultInfo.CARRIER_CD;
        rowData.CARRIER_NM = resultInfo.CARRIER_NM;
        if ($NC.G_VAR.policyVal.CM530 == $ND.C_POLICY_VAL_1) {
            focusCol = G_GRDMASTER.view.getColumnIndex("HDC_DIV_F");
        } else if ($NC.G_VAR.policyVal.CM530 == $ND.C_POLICY_VAL_2) {
            focusCol = G_GRDMASTER.view.getColumnIndex("CUST_CD");
        }
    } else {
        rowData.CARRIER_CD = "";
        rowData.CARRIER_NM = "";
        focusCol = G_GRDMASTER.view.getColumnIndex("CARRIER_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true);
}

function grdMasterOnCustPopup(resultInfo) {

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().cancelCurrentEdit();
    }
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.CUST_CD = resultInfo.CUST_CD;
        rowData.CUST_NM = resultInfo.CUST_NM;
        focusCol = G_GRDMASTER.view.getColumnIndex("HDC_DIV_F");
    } else {
        rowData.CUST_CD = "";
        rowData.CUST_NM = "";
        focusCol = G_GRDMASTER.view.getColumnIndex("CUST_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO_CNT",
        field: "WB_NO_CNT",
        name: "잔여수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO_CONST",
        field: "WB_NO_CONST",
        name: "설정상수",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO_BEGIN",
        field: "WB_NO_BEGIN",
        name: "설정시작값",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO_END",
        field: "WB_NO_END",
        name: "설정종료값",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
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

function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CMC02060E0.RS_DETAIL",
        sortCol: "LINE_NO",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onFocus.subscribe(grdDetailOnFocus);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnFocus(e, args) {

    if (G_GRDDETAIL.focused) {
        return;
    }

    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;

    // 택배기준 데이터 Post 처리
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

}

function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "WB_NO_CONST", true);
}

function grdDetailOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    if (rowData.CRUD != $ND.C_DV_CRUD_N && rowData.CRUD != $ND.C_DV_CRUD_C) {
        switch (args.column.id) {
            case "WB_NO_CONST":
            case "WB_NO_BEGIN":
            case "WB_NO_END":
                return false;
        }
    }
    return true;
}

function grdDetailOnCellChange(e, args) {

    var rowData = args.item;

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row, "WB_NO_CONST")) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.WB_NO_CONST)) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.017", "운송장번호 상수값을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "WB_NO_CONST", true);
            return false;
        }
        if ($NC.isNull(rowData.WB_NO_BEGIN)) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.018", "운송장번호 시작값을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "WB_NO_BEGIN", true);
            return false;
        }
        if ($NC.isNull(rowData.WB_NO_END)) {
            alert($NC.getDisplayMsg("JS.CMC02060E0.019", "운송장번호 종료값을 입력하십시오."));
            $NC.setFocusGrid(G_GRDDETAIL, row, "WB_NO_END", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, [
        "CARRIER_CD",
        "CUST_CD",
        "HDC_DIV"
    ], G_GRDMASTER.focused)) {
        $NC.setEnableGroup("#divRightView", true);
    } else {
        $NC.setEnableGroup("#divRightView", false);
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

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "LINE_NO", G_GRDDETAIL.focused);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "CARRIER_CD",
            "CUST_CD",
            "HDC_DIV"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);

    var grdObject;
    if (G_GRDMASTER.focused) {
        grdObject = G_GRDMASTER;
    } else if (G_GRDDETAIL.focused) {
        grdObject = G_GRDDETAIL;
    }

    var rowData = grdObject.data.getItem(grdObject.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    // var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData, true);
    }
}

function onSave2(ajaxData) {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "CARRIER_CD",
            "CUST_CD",
            "HDC_DIV"
        ]
    });
    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: "LINE_NO"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyValM;
    G_GRDDETAIL.lastKeyVal = lastKeyValD;
}

function onSave2Error(ajaxData) {

    $NC.onError(ajaxData);

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_D) {
        // 마지막 선택 Row 수정 데이터 반영 및 상태 강제 변경
        $NC.setGridApplyChange(G_GRDDETAIL, rowData, true);
    }
}

/**
 * 검색조건의 운송사 검색 이미지 클릭
 */

function showQCarrierPopup() {

    var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
    $NP.showCarrierPopup({
        P_CARRIER_CD: CARRIER_CD,
        P_CARRIER_DIV: "1",
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onQCarrierPopup, function() {
        $NC.setFocus("#edtQCarrier_Cd", true);
    });
}

/**
 * 운송사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onQCarrierPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCarrier_Cd", resultInfo.CARRIER_CD);
        $NC.setValue("#edtQCarrier_Nm", resultInfo.CARRIER_NM);
    } else {
        $NC.setValue("#edtQCarrier_Cd");
        $NC.setValue("#edtQCarrier_Nm");
        $NC.setFocus("#edtQCarrier_Cd", true);
    }
    onChangingCondition();

}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // [택배일반]운송장번호관리 정책 (1:운용사별관리, 2:고객사별관리)
        grdMasterOnSetColumns();
    });
}

/**
 * 운송장번호 생성
 */
function btnCreateWbNoOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC02060E0.020", "운송장번호 생성할 운송장번호대역을 선택 후 처리하십시오."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        alert($NC.getDisplayMsg("JS.CMC02060E0.021", "신규 운송장대역 데이터입니다. 저장 후 운송장번호를 생성하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC02060E0.022", "운송장번호를 생성하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/CMC02060E0/callSetWbNoCreate.do", {
        P_CARRIER_CD: rowData.CARRIER_CD,
        P_CUST_CD: rowData.CUST_CD,
        P_HDC_DIV: rowData.HDC_DIV,
        P_LINE_NO: rowData.LINE_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        alert($NC.getDisplayMsg("JS.CMC02060E0.023", "운송장번호가 생성되었습니다."));
        onSave2(ajaxData);
    });
}
