/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC03050E0
 *  프로그램명         : 배송처운송권역관리
 *  프로그램설명       : 배송처운송권역관리 화면 Javascript
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
                "#grdSub"
            ]
        },
        // 체크할 정책 값
        policyVal: {
            CM510: "" // 운송권역 관리정책
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);

    // 이벤트 연결
    $("#btnQCust_Cd").click(showCustPopup);
    $("#btnAddDelivery").click(btnAddDeliveryOnClick);
    $("#btnQArea_Cd").click(showQDeliveryAreaPopup);
    $("#btnArea_Cd").click(showDeliveryAreaPopup);
    $("#btnCarrier_Cd").click(showCarrierPopup);
    // 그리드 초기화
    grdMasterInitialize(); // 상단그리드 초기화
    grdSubInitialize(); // 하단그리드 초기화

    // 거리등급 세팅
    $NC.serviceCall("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "DISTANCE_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, function(ajaxData) {
        $NC.G_VAR.dsDistanceDiv = $NC.toArray(ajaxData);
        // 조회조건 - 프로모션구분 세팅
        $NC.setInitComboData({
            selector: "#cboDistance_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.G_VAR.dsDistanceDiv,
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboDistance_Div");
            }
        });
    });

    // 전역 변수에 정책 값 정보 세팅
    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // 운송권역 관리정책 : 1-물류센터별 관리
        if ($NC.G_VAR.policyVal.CM510 == $ND.C_POLICY_VAL_1) {
            $NC.setVisible("#divQCenter_Cd", true);

            $NC.setInitCombo("/WC/getDataSet.do", {
                P_QUERY_ID: "WC.POP_CSUSERCENTER",
                P_QUERY_PARAMS: {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_CENTER_CD: $ND.C_ALL,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            }, {
                selector: "#cboQCenter_Cd",
                codeField: "CENTER_CD",
                nameField: "CENTER_NM",
                onComplete: function() {
                    $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
                }
            });
            // 운송권역 관리정책 : 2-통합 관리
        } else {
            $NC.setVisible("#divQCenter_Cd", false);

            $NC.setInitComboData({
                selector: "#cboQCenter_Cd",
                codeField: "CENTER_CD",
                nameField: "CENTER_NM",
                data: [
                    {
                        CENTER_CD: "*",
                        CENTER_NM: $NC.getDisplayMsg("JS.CMC03050E0.011", "전체")
                    }
                ],
                onComplete: function() {
                    $NC.setValue("#cboQCenter_Cd", "*");
                }
            });
        }
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function _OnLoaded() {

    $NC.setInitSplitter("#divMasterView", "h", 300);
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
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            $NC.setValue("#edtQArea_Cd");
            $NC.setValue("#edtQArea_Nm");
            $NC.setValue("#edtArea_Cd");
            $NC.setValue("#edtArea_Nm");
            break;
        case "CUST_CD":
            $NP.onUserCustChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_CUST_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onCustPopup);
            return;
        case "AREA_CD":
            $NP.onDeliveryAreaChange(val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: val
            }, onQDeliveryAreaPopup);
            return;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    // 하단그리드 위의 운송권역 검색 값 변경 했을 경우
    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "AREA_CD":
            $NP.onDeliveryAreaChange(val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: val
            }, onDeliveryAreaPopup);
            return;
        case "CARRIER_CD":
            $NP.onCarrierChange(val, {
                P_CARRIER_CD: $NC.getValue("#edtCarrier_Cd"),
                P_CARRIER_DIV: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }, onCarrierPopup);
            return;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC03050E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.CMC03050E0.002", "고객사를 입력하십시오."));
        $NC.setFocus("#edtQCust_Cd");
        return;
    }

    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd");
    var DELIVERY_NM = $NC.getValue("#edtQDelivery_Nm");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_CUST_CD: CUST_CD,
        P_AREA_CD: AREA_CD,
        P_DELIVERY_CD: DELIVERY_CD,
        P_DELIVERY_NM: DELIVERY_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CMC03050E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);

    G_GRDSUB.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_CUST_CD: CUST_CD
    };
    // 데이터 조회
    $NC.serviceCall("/CMC03050E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
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
        alert($NC.getDisplayMsg("JS.CMC03050E0.003", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 운송권역 입력여부 체크(INSERT/UPDATE), 미입력시 FRK 오류
    var searchRows = $NC.getGridSearchRows(G_GRDMASTER, {
        compareFn: function(rowData) {
            // CRUD가 C/N/U만 체크 대상
            if (rowData.CRUD == $ND.C_DV_CRUD_R || rowData.CRUD == $ND.C_DV_CRUD_D) {
                return false;
            }
            // 운송권역 미입력 체크
            if ($NC.isNull(rowData.AREA_CD)) {
                return true;
            }
            return false;
        }
    });
    if (searchRows.length > 0) {
        alert($NC.getDisplayMsg("JS.CMC03050E0.005", "운송권역 미입력 데이터가 존재합니다. 운송권역을 먼저 입력하십시오."));
        $NC.setGridSelectRow(G_GRDMASTER, {
            selectRow: searchRows[0],
            activeCell: "AREA_CD",
            editMode: true
        });
        return;
    }

    // 물류센터코드는 저장시 선택된 물류센터로 입력
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    // 고객사코드는 저장시 입력한고객사로 입력
    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    var dsMaster = [ ];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: CENTER_CD,
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_CARRIER_CD: rowData.CARRIER_CD,
            P_CHUTE_NO: rowData.CHUTE_NO,
            P_DAS_NO: rowData.DAS_NO,
            P_AREA_CD: rowData.AREA_CD,
            P_DELIVERY_ROUTE: rowData.DELIVERY_ROUTE,
            P_DISTANCE_DIV: rowData.DISTANCE_DIV,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC03050E0.004", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC03050E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03050E0.006", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC03050E0.007", "삭제 하시겠습니까?"))) {
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
        selectKey: "DELIVERY_CD",
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

function grdMasterOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "AREA_CD",
        field: "AREA_CD",
        name: "운송권역",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup
        }
    });
    $NC.setGridColumn(columns, {
        id: "AREA_NM",
        field: "AREA_NM",
        name: "운송권역명"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_ROUTE",
        field: "DELIVERY_ROUTE",
        name: "운송루트",
        cssClass: "styRight",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "DISTANCE_DIV_F",
        field: "DISTANCE_DIV_F",
        name: "거리등급",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "DISTANCE_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "DISTANCE_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            addEmpty: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_CD",
        field: "CARRIER_CD",
        name: "운송사",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdMasterOnPopup
        }
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_NM",
        field: "CARRIER_NM",
        name: "운송사명"
    });
    $NC.setGridColumn(columns, {
        id: "CHUTE_NO",
        field: "CHUTE_NO",
        name: "슈트번호",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "DAS_NO",
        field: "DAS_NO",
        name: "DAS번호",
        editor: Slick.Editors.Number
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM",
        field: "ADDR_NM",
        name: "주소",
        editor: Slick.Editors.text
    });
    $NC.setGridColumn(columns, {
        id: "REGION_DIV_F",
        field: "REGION_DIV_F",
        name: "배송지역"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_REMARK1",
        field: "DELIVERY_REMARK1",
        name: "배송처비고"
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
 * 상단그리드 초기화
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
        queryId: "CMC03050E0.RS_MASTER",
        sortCol: "DELIVERY_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "AREA_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.AREA_CD)) {
            alert($NC.getDisplayMsg("JS.CMC03050E0.008", "운송권역코드를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "AREA_CD", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

/**
 * 상단그리드의 입력항목 값 변경
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "AREA_CD":
            $NP.onDeliveryAreaChange(rowData.AREA_CD, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: rowData.AREA_CD
            }, grdMasterOnDeliveryAreaPopup);
            return;
        case "CARRIER_CD":
            $NP.onCarrierChange(rowData.CARRIER_CD, {
                P_CARRIER_CD: rowData.CARRIER_CD,
                P_CARRIER_DIV: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }, grdMasterOnCarrierPopup);
            return;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

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
 * 그리드의 운송권역 셀의 검색 아이콘 클릭시 팝업창 표시
 */
function grdMasterOnPopup(e, args) {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CARRIER_CD = $NC.getValue("#edtCarrier_Cd", true);
    switch (args.column.id) {
        case "AREA_CD":
            $NP.showDeliveryAreaPopup({
                P_CENTER_CD: CENTER_CD,
                P_AREA_CD: $ND.C_ALL
            }, grdMasterOnDeliveryAreaPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            break;
        case "CARRIER_CD":
            $NP.showCarrierPopup({
                P_CARRIER_CD: CARRIER_CD,
                P_CARRIER_DIV: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }, grdMasterOnCarrierPopup, function() {
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true, true);
            });
            break;
    }
}

function grdMasterOnDeliveryAreaPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.AREA_CD = resultInfo.AREA_CD;
        rowData.AREA_NM = resultInfo.AREA_NM;
        focusCol = G_GRDMASTER.view.getColumnIndex("DELIVERY_ROUTE");
    } else {
        rowData.AREA_CD = "";
        rowData.AREA_NM = "";
        focusCol = G_GRDMASTER.view.getColumnIndex("AREA_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

function grdMasterOnCarrierPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.CARRIER_CD = resultInfo.CARRIER_CD;
        rowData.CARRIER_NM = resultInfo.CARRIER_NM;
        focusCol = G_GRDMASTER.view.getColumnIndex("CHUTE_NO");
    } else {
        rowData.CARRIER_CD = "";
        rowData.CARRIER_NM = "";
        focusCol = G_GRDMASTER.view.getColumnIndex("CARRIER_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}
function grdSubOnGetColumns() {

    var columns = [ ];
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
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "배송처"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "배송처명"
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM",
        field: "ADDR_NM",
        name: "주소"
    });
    $NC.setGridColumn(columns, {
        id: "REGION_DIV_F",
        field: "REGION_DIV_F",
        name: "배송지역"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 하단그리드 초기화
 */
function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "CMC03050E0.RS_SUB1",
        sortCol: "DELIVERY_CD",
        gridOptions: options
    });

    G_GRDSUB.view.onHeaderClick.subscribe(grdSubOnHeaderClick);
    G_GRDSUB.view.onClick.subscribe(grdSubOnClick);
    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHECK_YN");
}

/**
 * 하단 그리드.헤더의 전체선택 체크박스 클릭
 */
function grdSubOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDSUB, e, args);
            break;
    }
}

function grdSubOnClick(e, args) {

    var columnId = G_GRDSUB.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDSUB, e, args);
            break;
    }
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 *        event object
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

/**
 * 운송권역(검색항목) 검색 팝업 표시
 */
function showQDeliveryAreaPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showDeliveryAreaPopup({
        queryParams: {
            P_CENTER_CD: CENTER_CD,
            P_AREA_CD: $ND.C_ALL
        }
    }, onQDeliveryAreaPopup, function() {
        $NC.setFocus("#edtQArea_Cd");
    });
}

function onQDeliveryAreaPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQArea_Cd", resultInfo.AREA_CD);
        $NC.setValue("#edtQArea_Nm", resultInfo.AREA_NM);
    } else {
        $NC.setValue("#edtQArea_Cd");
        $NC.setValue("#edtQArea_Nm");
        $NC.setFocus("#edtQArea_Cd", true);
    }
    // 화면 클리어
    onChangingCondition();
}

/**
 * 운송권역(차량등록) 검색 팝업 표시
 */
function showDeliveryAreaPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showDeliveryAreaPopup({
        queryParams: {
            P_CENTER_CD: CENTER_CD,
            P_AREA_CD: $ND.C_ALL
        }
    }, onDeliveryAreaPopup, function() {
        $NC.setFocus("#edtArea_Cd", true);
    });
}

function onDeliveryAreaPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtArea_Cd", resultInfo.AREA_CD);
        $NC.setValue("#edtArea_Nm", resultInfo.AREA_NM);
    } else {
        $NC.setValue("#edtArea_Cd");
        $NC.setValue("#edtArea_Nm");
        $NC.setFocus("#edtArea_Cd", true);
    }
}
/**
 * 운송사(차량등록) 검색 팝업 표시
 */
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

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtCarrier_Cd", resultInfo.CARRIER_CD);
        $NC.setValue("#edtCarrier_Nm", resultInfo.CARRIER_NM);
    } else {
        $NC.setValue("#edtCarrier_Cd");
        $NC.setValue("#edtCarrier_Nm");
        $NC.setFocus("#edtCarrier_Cd", true);
    }
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
    $NC.setInitGridAfterOpen(G_GRDMASTER, "DELIVERY_CD", true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 조회버튼 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB, "AREA_CD");
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 저장 처리 성공 했을 경우 처리
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "DELIVERY_CD"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장 처리 실패 했을 경우 처리
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
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDSUB);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 하단 그리드에서 선택한 행을 상단 그리드에 추가
 */
function btnAddDeliveryOnClick() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    if (G_GRDSUB.view.getEditorLock().isActive()) {
        G_GRDSUB.view.getEditorLock().commitCurrentEdit();
    }

    // 선택 데이터 검색 -> Indexes
    var checkedRows = $NC.getGridSearchRows(G_GRDSUB, {
        searchKey: "CHECK_YN",
        searchVal: $ND.C_YES
    });
    if (checkedRows.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC03050E0.009", "추가할 미등록 배송처 데이터를 선택하십시오."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var AREA_CD = $NC.getValue("#edtArea_Cd");
    var AREA_NM = $NC.getValue("#edtArea_Nm");
    var DELIVERY_ROUTE = $NC.getValue("#edtDelivery_Route");
    var DISTANCE_DIV = $NC.getValue("#cboDistance_Div");
    var DISTANCE_DIV_F = $NC.getValueCombo("#cboDistance_Div", "F");
    var CARRIER_CD = $NC.getValue("#edtCarrier_Cd");
    var CARRIER_NM = $NC.getValue("#edtCarrier_Nm");

    var rowCount = G_GRDMASTER.data.getLength();
    var addedCount = 0;
    var rowData, newRowData;
    G_GRDMASTER.data.beginUpdate();
    try {
        for (var rIndex = 0, rCount = checkedRows.length; rIndex < rCount; rIndex++) {
            // 선택 데이터
            rowData = G_GRDSUB.data.getItem(checkedRows[rIndex]);
            // 추가하려는 배송처가 상단그리드에 존재하는지 체크
            if ($NC.getGridSearchRow(G_GRDMASTER, {
                searchKey: "DELIVERY_CD",
                searchVal: rowData.DELIVERY_CD
            }) != -1) {
                continue;
            }
            newRowData = {
                CENTER_CD: CENTER_CD,
                DELIVERY_CD: rowData.DELIVERY_CD,
                DELIVERY_NM: rowData.DELIVERY_NM,
                AREA_CD: AREA_CD,
                AREA_NM: AREA_NM,
                CARRIER_CD: CARRIER_CD,
                CARRIER_NM: CARRIER_NM,
                DELIVERY_ROUTE: DELIVERY_ROUTE,
                DISTANCE_DIV: DISTANCE_DIV,
                DISTANCE_DIV_F: DISTANCE_DIV_F,
                ZIP_CD: rowData.ZIP_CD,
                ADDR_NM: rowData.ADDR_NM,
                DELIVERY_REMARK1: rowData.REMARK1,
                REMARK1: "",
                id: $NC.getGridNewRowId(),
                CRUD: $ND.C_DV_CRUD_C
            };
            G_GRDMASTER.data.addItem(newRowData);
            addedCount++;
        }
    } finally {
        G_GRDMASTER.data.endUpdate();
    }

    if (addedCount == 0) {
        alert($NC.getDisplayMsg("JS.CMC03050E0.010", "선택한 배송처는 이미 추가된 배송처입니다."));
        return;
    }

    if ($NC.isNull(AREA_CD)) {
        $NC.setGridSelectRow(G_GRDMASTER, {
            selectRow: rowCount,
            activeCell: "AREA_CD",
            editMode: true
        });
    } else {
        $NC.setGridSelectRow(G_GRDMASTER, rowCount);
    }
    // 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
}

/**
 * 검색조건의 고객사 검색 이미지 클릭
 */

function showCustPopup() {

    $NP.showUserCustPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CUST_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onCustPopup, function() {
        $NC.setFocus("#edtQCust_Cd", true);
    });
}

/**
 * 고객사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onCustPopup(resultInfo) {

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
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDSUB.data.getLength() > 0;

    $NC.setEnable("#btnAddDelivery", permission.canSave && enable);
}
