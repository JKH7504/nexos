/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LFC03030E0
 *  프로그램명         : 일기타단가 기준관리
 *  프로그램설명       : 일기타단가 기준관리 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2023-04-13
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2023-04-13    ASETEC           신규작성
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
        PRICE_DIV: "04" // 단가관리구분 - 일기타단가
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 조회조건 - 계약기준월 세팅
    $NC.setInitMonthPicker("#dtpQContract_Month");

    // 계약번호 검색 이미지 클릭
    $("#btnQContract_No").click(showContractPopup);
    // 정산구분 검색 이미지 클릭
    $("#btnQBill_Div").click(showBillPopup);
    $("#btnDownloadXLSFormat").click(btnDownloadXLSFormatOnClick); // 엑셀포맷 다운로드
    $("#btnUploadXLS").click(btnUploadXLSOnClick); // 엑셀업로드

    $NC.setEnable("#btnDownloadXLSFormat", false);
    $NC.setEnable("#btnUploadXLS", false);
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

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CONTRACT_NO":
            $NP.onContractChange(val, {
                P_CONTRACT_NO: val,
                P_PRICE_DIV: $NC.G_VAR.PRICE_DIV,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onContractPopup);
            return;
        case "BILL_DIV":
            $NP.onBillChange(val, {
                P_CONTRACT_NO: $NC.getValue("#edtQContract_No"),
                P_BILL_DIV: val,
                P_PRICE_DIV: $NC.G_VAR.PRICE_DIV,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onBillPopup);
            return;
        case "CONTRACT_MONTH":
            if ($NC.isNotNull(val)) {
                $NC.setValueMonthPicker(view, val, $NC.getDisplayMsg("JS.LFC03030E0.001", "계약월를 정확히 입력하십시오."));
            }
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var CONTRACT_MONTH = $NC.getValue("#dtpQContract_Month");
    if ($NC.isNotNull(CONTRACT_MONTH)) {
        if (!$NC.isMonth(CONTRACT_MONTH)) {
            alert($NC.getDisplayMsg("JS.LFC03020E0.001", "계약월을 정확히 입력하십시오."));
            $NC.setFocus("#dtpQContract_Month");
            return;
        }
    }

    var CONTRACT_NO = $NC.getValue("#edtQContract_No", true);
    var BILL_DIV = $NC.getValue("#edtQBill_Div", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_BILL_DIV: BILL_DIV,
        P_CONTRACT_NO: CONTRACT_NO,
        P_CONTRACT_MONTH: CONTRACT_MONTH + $NC.iif($NC.isNotNull(CONTRACT_MONTH), "-01", "")
    };
    // 데이터 조회
    $NC.serviceCall("/LFC03030E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var CONTRACT_NO = $NC.getValue("#edtQContract_No", true);
    var BILL_DIV = $NC.getValue("#edtQBill_Div", true);

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CONTRACT_NO: null,
        CONTRACT_NM: null,
        BILL_DIV: null,
        BILL_DIV_D: null,
        CONTRACT_DATE: $NC.getFirstDate($NC.G_USERINFO.LOGIN_DATE),
        CONTRACT_END_DATE: null,
        ETC_DAILY_DIV: null,
        UNIT_DIV: null,
        UNIT_DIV_F: null,
        UNIT_PRICE: 0,
        CALC_QTY_DIV: "10",
        CALC_QTY_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
            columnId: "CALC_QTY_DIV_F",
            searchVal: "10",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        }),
        CALC_AMT_DIV: "10",
        CALC_AMT_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
            columnId: "CALC_AMT_DIV_F",
            searchVal: "10",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F"
        }),
        REMARK1: null,
        REG_USER_ID: null,
        REG_DATETIME: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);

    // 계약번호-정산구분 조회조건 세팅할 경우 신규 ROW 데이터 SET
    if (CONTRACT_NO != $ND.C_ALL) {
        $NP.onContractBillChange(CONTRACT_NO, {
            P_CONTRACT_NO: CONTRACT_NO,
            P_BILL_DIV: BILL_DIV,
            P_PRICE_DIV: $NC.G_VAR.PRICE_DIV,
            P_VIEW_DIV: "1"
        }, grdMasterOnContractBillPopup);
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LFC03030E0.004", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsMaster = [ ];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CONTRACT_NO: rowData.CONTRACT_NO,
            P_BILL_DIV: rowData.BILL_DIV,
            P_CONTRACT_DATE: rowData.CONTRACT_DATE,
            P_ETC_DAILY_DIV: rowData.ETC_DAILY_DIV,
            P_UNIT_DIV: rowData.UNIT_DIV,
            P_UNIT_PRICE: rowData.UNIT_PRICE,
            P_CALC_QTY_DIV: rowData.CALC_QTY_DIV,
            P_CALC_AMT_DIV: rowData.CALC_AMT_DIV,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LFC03030E0.005", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LFC03030E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.LFC03030E0.006", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LFC03030E0.007", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.deleteGridRowData(G_GRDMASTER, rowData);
    } else {
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
            "CONTRACT_NO",
            "BILL_DIV",
            "CONTRACT_DATE",
            "ETC_DAILY_DIV"
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

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    $NC.setEnable("#btnDownloadXLSFormat", false);
    $NC.setEnable("#btnUploadXLS", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

function grdMasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "CONTRACT_NO_F",
        field: "CONTRACT_NO_F",
        name: "계약번호",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "CUST_CD_F",
        field: "CUST_CD_F",
        name: "고객사"
    });
    $NC.setGridColumn(columns, {
        id: "BILL_DIV_F",
        field: "BILL_DIV_F",
        name: "수수료구분"
    });
    $NC.setGridColumn(columns, {
        id: "ETC_DAILY_DIV_F",
        field: "ETC_DAILY_DIV_F",
        name: "일기타비구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "LFC03030E0.RS_SUB1"
        }, {
            codeField: "ETC_DAILY_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "UNIT_DIV_F",
        field: "UNIT_DIV_F",
        name: "단위구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "UNIT_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_ATTR04_CD: $ND.C_YES,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "UNIT_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "UNIT_PRICE",
        field: "UNIT_PRICE",
        name: "기준단가",
        cssClass: "styRight",
        editor: Slick.Editors.Number,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "CALC_QTY_DIV_F",
        field: "CALC_QTY_DIV_F",
        name: "수량계산구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "CALC_QTY_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "CALC_QTY_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "CALC_AMT_DIV_F",
        field: "CALC_AMT_DIV_F",
        name: "금액계산구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "CALC_AMT_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "CALC_AMT_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "CONTRACT_DATE",
        field: "CONTRACT_DATE",
        name: "계약시작일자",
        cssClass: "styCenter",
        editor: Slick.Editors.Date,
        editorOptions: {
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "CONTRACT_END_DATE",
        field: "CONTRACT_END_DATE",
        name: "계약종료일자",
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

function grdMasterInitialize() {

    var options = {
        frozenColumn: 3,
        editable: true,
        autoEdit: true
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LFC03030E0.RS_MASTER",
        sortCol: "CONTRACT_NO",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnPopup(e, args) {

    // var rowData = args.item;
    switch (args.column.id) {
        case "CONTRACT_NO_F":
            $NP.showContractBillPopup({
                P_CONTRACT_NO: $ND.C_ALL,
                P_PRICE_DIV: $NC.G_VAR.PRICE_DIV,
                P_VIEW_DIV: "1"
            }, grdMasterOnContractBillPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            return;
    }
}

function grdMasterOnContractBillPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.CONTRACT_NO = resultInfo.CONTRACT_NO;
        rowData.CONTRACT_NM = resultInfo.CONTRACT_NM;
        rowData.CONTRACT_NO_F = resultInfo.CONTRACT_NO_F;
        rowData.BILL_DIV = resultInfo.BILL_DIV;
        rowData.BILL_DIV_D = resultInfo.BILL_DIV_D;
        rowData.BILL_DIV_F = resultInfo.BILL_DIV_F;
        rowData.CUST_CD_F = resultInfo.CUST_CD_F;

        focusCol = G_GRDMASTER.view.getColumnIndex("ETC_DAILY_DIV_F");
    } else {
        rowData.CONTRACT_NO = "";
        rowData.CONTRACT_NM = "";
        rowData.CONTRACT_NO_F = "";
        rowData.BILL_DIV = "";
        rowData.BILL_DIV_D = "";
        rowData.BILL_DIV_F = "";
        rowData.CUST_CD_F = "";

        focusCol = G_GRDMASTER.view.getColumnIndex("CONTRACT_NO_F");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 그리드의 편집 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "CONTRACT_NO_F":
            $NP.onContractBillChange(rowData.CONTRACT_NO_F, {
                P_CONTRACT_NO: rowData.CONTRACT_NO_F,
                P_PRICE_DIV: $NC.G_VAR.PRICE_DIV,
                P_VIEW_DIV: "1"
            }, grdMasterOnContractBillPopup);
            return;
        case "CONTRACT_DATE":
            if ($NC.isNotNull(rowData.CONTRACT_DATE)) {
                if (!$NC.isDate(rowData.CONTRACT_DATE)) {
                    alert($NC.getDisplayMsg("JS.LFC03030E0.008", "계약시작일자를 정확히 입력하십시오."));
                    rowData.CONTRACT_DATE = "";
                    $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
                } else {
                    rowData.CONTRACT_DATE = $NC.getFirstDate(rowData.CONTRACT_DATE);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규 데이터일 때만 수정 가능한 컬럼
    var isNew = rowData.CRUD == $ND.C_DV_CRUD_N || rowData.CRUD === $ND.C_DV_CRUD_C;
    switch (args.column.id) {
        case "CONTRACT_NO_F":
        case "CONTRACT_DATE":
        case "ETC_DAILY_DIV_F":
            return isNew;
    }
    return true;
}

/**
 * 그리드 입력 체크
 * 
 * @param row
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, [
        "CONTRACT_NO",
        "BILL_DIV",
        "CONTRACT_DATE",
        "ETC_DAILY_DIV"
    ])) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CONTRACT_NO)) {
            alert($NC.getDisplayMsg("JS.LFC03030E0.009", "계약번호를 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "CONTRACT_NO_F", true);
            return false;
        }
        if ($NC.isNull(rowData.ETC_DAILY_DIV)) {
            alert($NC.getDisplayMsg("JS.LFC03030E0.010", "일기타비구분을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "ETC_DAILY_DIV_F", true);
            return false;
        }
        if ($NC.isNull(rowData.UNIT_DIV)) {
            alert($NC.getDisplayMsg("JS.LFC03030E0.011", "단위구분을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "UNIT_DIV_F", true);
            return false;
        }
        if ($NC.isNull(rowData.UNIT_PRICE)) {
            alert($NC.getDisplayMsg("JS.LFC03030E0.012", "기준단가를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "UNIT_PRICE", true);
            return false;
        }
        if ($NC.isNull(rowData.CALC_QTY_DIV)) {
            alert($NC.getDisplayMsg("JS.LFC03030E0.013", "수량계산구분을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "CALC_QTY_DIV_F", true);
            return false;
        }
        if ($NC.isNull(rowData.CALC_AMT_DIV)) {
            alert($NC.getDisplayMsg("JS.LFC03030E0.014", "금액계산구분을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "CALC_AMT_DIV_F", true);
            return false;
        }
        if ($NC.isNull(rowData.CONTRACT_DATE)) {
            alert($NC.getDisplayMsg("JS.LFC03030E0.015", "계약시작일자을 선택하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "CONTRACT_DATE", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDMASTER, args.row, "CONTRACT_NO_F", true);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, [
        "CONTRACT_NO",
        "BILL_DIV",
        "CONTRACT_DATE",
        "ETC_DAILY_DIV"
    ]);

    $NC.setEnable("#btnDownloadXLSFormat", true);
    $NC.setEnable("#btnUploadXLS", true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "CONTRACT_NO",
            "BILL_DIV",
            "CONTRACT_DATE",
            "ETC_DAILY_DIV"
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

/**
 * 검색조건의 계약번호 검색 이미지 클릭
 */
function showContractPopup() {

    $NP.showContractPopup({
        P_CONTRACT_NO: $ND.C_ALL,
        P_PRICE_DIV: $NC.G_VAR.PRICE_DIV,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onContractPopup, function() {
        $NC.setFocus("#edtQContract_No", true);
    });
}

function onContractPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQContract_No", resultInfo.CONTRACT_NO);
        $NC.setValue("#edtQContract_Nm", resultInfo.CONTRACT_NM);
    } else {
        $NC.setValue("#edtQContract_No");
        $NC.setValue("#edtQContract_Nm");
        $NC.setFocus("#edtQContract_No", true);
    }

    onChangingCondition();
}

/**
 * 검색조건의 비용구분 검색 이미지 클릭
 */
function showBillPopup() {

    var CONTRACT_NO = $NC.getValue("#edtQContract_No", true);

    $NP.showBillPopup({
        P_CONTRACT_NO: CONTRACT_NO,
        P_BILL_DIV: $ND.C_ALL,
        P_PRICE_DIV: $NC.G_VAR.PRICE_DIV,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onBillPopup, function() {
        $NC.setFocus("#edtQBill_Div", true);
    });
}

function onBillPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBill_Div", resultInfo.BILL_DIV);
        $NC.setValue("#edtQBill_Div_D", resultInfo.BILL_DIV_D);
    } else {
        $NC.setValue("#edtQBill_Div");
        $NC.setValue("#edtQBill_Div_D");
        $NC.setFocus("#edtQBill_Div", true);
    }

    onChangingCondition();
}

function btnDownloadXLSFormatOnClick() {

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "CONTRACT_NO",
            P_COLUMN_TITLE: "계약번호",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "ETC_DAILY_DIV",
            P_COLUMN_TITLE: "일기타구분",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "UNIT_DIV",
            P_COLUMN_TITLE: "정산단위구분",
            P_COLUMN_WIDTH: 20
        },

        {
            P_COLUMN_NM: "UNIT_PRICE",
            P_COLUMN_TITLE: "정산단가",
            P_COLUMN_WIDTH: 20
        },

        {
            P_COLUMN_NM: "CALC_QTY_DIV",
            P_COLUMN_TITLE: "수량계산구분",
            P_COLUMN_WIDTH: 20
        },

        {
            P_COLUMN_NM: "CALC_AMT_DIV",
            P_COLUMN_TITLE: "금액계산구분",
            P_COLUMN_WIDTH: 20
        },

        {
            P_COLUMN_NM: "CONTRACT_DATE",
            P_COLUMN_TITLE: "계약일자",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "REMARK1",
            P_COLUMN_TITLE: "비고",
            P_COLUMN_WIDTH: 40
        }
    ];

    $NC.excelFileDownload({
        P_QUERY_ID: "LFC03030E0.RS_SUB2",
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "일기타수수료단가업로드", // Excel Sheet Title
            P_EXCEL_FREEZE_ROW: 2
        // 고정 ROW
        },
        P_COLUMN_INFO: COLUMN_INFO
    });
}

function btnUploadXLSOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "CONTRACT_NO",
            P_XLS_COLUMN_NM: "A"
        },
        {
            P_COLUMN_NM: "ETC_DAILY_DIV",
            P_XLS_COLUMN_NM: "B"
        },
        {
            P_COLUMN_NM: "UNIT_DIV",
            P_XLS_COLUMN_NM: "C"
        },

        {
            P_COLUMN_NM: "UNIT_PRICE",
            P_XLS_COLUMN_NM: "D"
        },

        {
            P_COLUMN_NM: "CALC_QTY_DIV",
            P_XLS_COLUMN_NM: "E"
        },

        {
            P_COLUMN_NM: "CALC_AMT_DIV",
            P_XLS_COLUMN_NM: "F"
        },

        {
            P_COLUMN_NM: "CONTRACT_DATE",
            P_XLS_COLUMN_NM: "G"
        }
    ];

    $NC.excelFileUpload({
        P_QUERY_ID: "LFC03030E0.RS_SUB3",
        P_SERVICE_PARAMS: {
            P_XLS_COL_CHECK_YN: $ND.C_YES,
            P_XLS_FIRST_ROW: 3
        },
        P_COLUMN_INFO: COLUMN_INFO
    }, function(ajaxData, dsResultData) {

        if ($NC.isNull(dsResultData) || dsResultData.length == 0) {
            alert($NC.getDisplayMsg("JS.LFC03030E0.XXX", "업로드할 수 있는 대상 데이터가 없습니다. 엑셀 파일을 확인하십시오."));
            return;
        }

        var dsMaster = [ ];
        for (var rIndex = 0; rIndex < dsResultData.length; rIndex++) {
            dsMaster.push({
                P_CONTRACT_NO: dsResultData[rIndex].CONTRACT_NO,
                P_BILL_DIV: dsResultData[rIndex].BILL_DIV,
                P_ETC_DAILY_DIV: dsResultData[rIndex].ETC_DAILY_DIV,
                P_UNIT_DIV: dsResultData[rIndex].UNIT_DIV,
                P_UNIT_PRICE: dsResultData[rIndex].UNIT_PRICE,
                P_CALC_QTY_DIV: dsResultData[rIndex].CALC_QTY_DIV,
                P_CALC_AMT_DIV: dsResultData[rIndex].CALC_AMT_DIV,
                P_CONTRACT_DATE: dsResultData[rIndex].CONTRACT_DATE,
                P_CRUD: $ND.C_DV_CRUD_C
            });
        }

        $NC.serviceCall("/LFC03030E0/save.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveError);
    });
}