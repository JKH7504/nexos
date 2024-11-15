/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC05040E0
 *  프로그램명         : 고정로케이션관리
 *  프로그램설명       : 고정로케이션관리 화면(일반) Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2017-09-06
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2017-09-06    ASETEC           신규작성
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
    $NC.setGlobalVar({ // 현재 액티브된 뷰 및 그리드 정보
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
                size: 400
            }
        },
        // 체크할 정책 값
        policyVal: {
            CM120: "" // 로케이션 표시
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQL0_Bu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQL0_Bu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQL0_Cust_Cd", $NC.G_USERINFO.CUST_CD);
    // 검색구분에 전체를 선택
    $NC.setValue("#rgbQView_Div1", "1");

    // 이벤트 연결
    $("#btnInquiryItem").click(btnInquiryItemOnClick); // 상품 조회 클릭시 처리
    $("#btnAddItem").click(btnAddItemOnClick); // 고정로케이션 등록 버튼 클릭시 처리
    $("#btnDownloadXLSFormat").click(btnDownloadXLSFormatOnClick); // 엑셀포맷 다운로드
    $("#btnUploadXLS").click(btnUploadXLSOnClick); // 엑셀업로드
    $("#btnQBu_Cd").click(showQUserBuPopup); // 조회조건
    $("#btnQL0_Bu_Cd").click(showUserBuPopup); // 상품검색조건
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQVendor_Cd").click(showVendorPopup);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

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
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_STATE_2",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_STATE",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "1", // 1:일반조건
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_STATE_1",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_STATE",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "1", // 1:일반조건
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
            data: $NC.toArray(multipleData.O_WC_POP_CSUSERCENTER),
            onComplete: function() {
                $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
                // 정책값 세팅
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
        // 조회조건 - 상품상태 세팅
        $NC.setInitComboData({
            selector: "#cboQItem_State",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE_2),
            addAll: true
        });
        // 등록조건 - 상품상태 세팅
        $NC.setInitComboData({
            selector: "#cboItem_State",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE_1),
            onComplete: function() {
                $NC.setValue("#cboItem_State", $ND.C_BASE_ITEM_STATE);
            }
        });
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _SetResizeOffset() {

}

function _OnResize(parent, viewWidth, viewHeight) {

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
                // 존코드 세팅
                setZoneCdCombo();
                // 정책값 세팅
                setPolicyValInfo();
                break;
            case "BU_CD":
                $NP.onUserBuChange(val, {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_BU_CD: val,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }, onQUserBuPopup);
                return;
            case "ITEM_STATE":
                if (val != $ND.C_ALL) {
                    $NC.setValue("#cboItem_State", val);
                }
                break;
        }
        onChangingCondition();
    }
}

function itemConditionChange(e, args) {

    switch (args.col) {
        case "L0_BU_CD":
            $NP.onUserBuChange(args.val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: args.val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "BRAND_CD":
            $NP.onBuBrandChange(args.val, {
                P_BU_CD: $NC.getValue("#edtQL0_Bu_Cd"),
                P_BRAND_CD: args.val
            }, onBuBrandPopup);
            return;
        case "VENDOR_CD":
            $NP.onVendorChange(args.val, {
                P_CUST_CD: $NC.getValue("#edtQL0_Cust_Cd"),
                P_VENDOR_CD: args.val,
                P_VIEW_DIV: "2"
            }, onVendorPopup);
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
        alert($NC.getDisplayMsg("JS.CMC05040E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    if ($NC.isNull(ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.002", "상품상태를 선택하십시오."));
        $NC.setFocus("#cboQItem_State");
        return;
    }
    var ZONE_CD = $NC.getValue("#cboQZone_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ZONE_CD: ZONE_CD,
        P_ITEM_STATE: ITEM_STATE
    };
    // 데이터 조회
    $NC.serviceCall("/CMC05040E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        alert($NC.getDisplayMsg("JS.CMC05040E0.003", "저장할 데이터가 없습니다."));
        return;
    }

    // 현재 선택된 로우 Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
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
            P_BRAND_CD: rowData.BRAND_CD,
            P_ITEM_STATE: rowData.ITEM_STATE,
            P_ITEM_CD: rowData.ITEM_CD,
            P_ZONE_CD: rowData.ZONE_CD,
            P_BANK_CD: rowData.BANK_CD,
            P_BAY_CD: rowData.BAY_CD,
            P_LEV_CD: rowData.LEV_CD,
            P_LOCATION_CD: rowData.LOCATION_CD,
            P_FILL_UNIT_QTY: rowData.FILL_UNIT_QTY,
            P_FILL_SAFETY_QTY: rowData.FILL_SAFETY_QTY,
            P_FILL_MAX_QTY: rowData.FILL_MAX_QTY,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.004", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC05040E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.005", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC05040E0.006", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 삭제 상품 재선택을 위해 상품그리드에서 삭제 상품 선택 처리
    if (rowData.ITEM_STATE == $NC.getValue("#cboItem_State")) {
        var searchIndex = $NC.getGridSearchRow(G_GRDDETAIL, {
            searchKey: [
                "BRAND_CD",
                "ITEM_CD"
            ],
            searchVal: [
                rowData.BRAND_CD,
                rowData.ITEM_CD
            ]
        });

        if (searchIndex > -1) {
            $NC.setGridSelectRow(G_GRDDETAIL, searchIndex);
        }
    }

    rowData.CRUD = $ND.C_DV_CRUD_D;
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    _Save();
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyValM = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "LOCATION_CD",
            "BU_CD",
            "ITEM_STATE",
            "BRAND_CD",
            "ITEM_CD"
        ],
        isCancel: true
    });
    var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "BRAND_CD",
            "ITEM_CD"
        ],
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyValM;
    G_GRDDETAIL.lastKeyVal = lastKeyValD;
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;
    // 저장

    $NC.setEnable("#btnDownloadXLSFormat", enable);
    $NC.setEnable("#btnUploadXLS", permission.canSave && enable);
    $NC.setEnableGroup("#ctrAdditional_grdDetail", enable);
    $NC.setEnable("#btnInquiryItem", enable);
    $NC.setEnable("#btnAddItem", permission.canSave && enable);
}

function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);
    $NC.clearGridData(G_GRDDETAIL);

    // 프로그램 사용 권한 설정
    setUserProgramPermission();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

function onChangingItemCondition() {

    $NC.clearGridData(G_GRDDETAIL);
}

function setTopButtons() {

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    if (G_GRDMASTER.data.getLength() > 0) {
        $NC.G_VAR.buttons._save = "1";
        $NC.G_VAR.buttons._cancel = "1";
        $NC.G_VAR.buttons._delete = "1";
    }
    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "로케이션",
        cssClass: "styCenter",
        groupDisplay: true
    });
    $NC.setGridColumn(columns, {
        id: "LOC_DIV_D",
        field: "LOC_DIV_D",
        cssClass: "styCenter",
        name: "로케이션구분"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부"
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
        name: "브랜드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상품상태"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "박스입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FILL_UNIT_QTY",
        field: "FILL_UNIT_QTY",
        name: "단위보충수량",
        editor: Slick.Editors.Number,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FILL_SAFETY_QTY",
        field: "FILL_SAFETY_QTY",
        name: "안전재고수량",
        editor: Slick.Editors.Number,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FILL_MAX_QTY",
        field: "FILL_MAX_QTY",
        name: "적정재고수량",
        editor: Slick.Editors.Number,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처"
    });
    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 1,
        multiColumnSort: false
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC05040E0.RS_MASTER",
        sortCol: "LOCATION_CD",
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
            result = compareFn("LOCATION_CD");
            if (G_GRDMASTER.sortCol == "LOCATION_CD") {
                if (result == 0) {
                    result = compareFn("ITEM_CD");
                }
            } else {
                if (result == 0) {
                    result = compareFn(G_GRDMASTER.sortCol);
                    if (result == 0 && G_GRDMASTER.sortCol != "ITEM_CD") {
                        result = compareFn("ITEM_CD") * G_GRDMASTER.sortDir;
                    }
                } else {
                    result = result * G_GRDMASTER.sortDir;
                }
            }
            return result;
        },
        dropOptions: {
            dropAccept: "#grdDetail",
            onDrop: function(e, dd) {
                // Drag 참조 정보
                // dd.dragGridObject: Grid Object
                // dd.dragRows: Drag Selected Row Indexes
                // dd.dragCount: Drag Selected Count
                // Drop 참조 정보
                // dd.dropMode: drop-view, drop-cell
                // dd.dropGridObject: Grid Object
                // dd.dropCell: dropMode가 drop-cell, drop-all일 경우 Drop 된 Cell 정보, drop-all일 경우 dropCell이 없으면 cell이 아닌 위치에 DropV
                var selectedRow = dd.dropGridObject.view.getSelectedRows()[0];
                if (dd.dropCell.row != selectedRow) {
                    $NC.setGridSelectRow(dd.dropGridObject, dd.dropCell.row);
                }
                btnAddItemOnClick();
            }
        }
    });

    G_GRDMASTER.view.onGetCellValue.subscribe(grdMasterOnGetCellValue);
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
    G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 상품 지정되어 있을 경우만 수정 가능
    switch (args.column.id) {
        default:
            return $NC.isNotNull(rowData.ITEM_CD);
    }
}

function grdMasterOnGetCellValue(e, args) {

    if (args.row > 0 && args.column.groupDisplay == true) {
        if (G_GRDMASTER.data.getItem(args.row - 1)["LOCATION_CD"] == args.item["LOCATION_CD"]) {
            return "";
        }
    }
    return null;
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDMASTER.view.getColumnId(args.cell)) {
        case "FILL_UNIT_QTY":
            if (Number(rowData.FILL_UNIT_QTY) < 0) {
                alert($NC.getDisplayMsg("JS.CMC05040E0.007", "보충단위수량에 0이상의 정수를 입력하십시오."));
                rowData.FILL_UNIT_QTY = args.oldItem.FILL_UNIT_QTY;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
            }
            break;
        case "FILL_SAFETY_QTY":
            if (Number(rowData.FILL_SAFETY_QTY) < 0 || Number(rowData.FILL_SAFETY_QTY) < Number(rowData.FILL_UNIT_QTY)) {
                alert($NC.getDisplayMsg("JS.CMC05040E0.008", "안전재고수량에 보충단위수량 이상의 정수를 입력하십시오."));
                rowData.FILL_SAFETY_QTY = args.oldItem.FILL_SAFETY_QTY;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
            }
            // FILL_SAFETY_QTY에 따라 FILL_MAX_QTY 변경
            if (Number(rowData.FILL_SAFETY_QTY) == 0) {
                rowData.FILL_MAX_QTY = rowData.FILL_SAFETY_QTY;
            } else {
                if (Number(rowData.FILL_MAX_QTY) < Number(rowData.FILL_SAFETY_QTY)) {
                    rowData.FILL_MAX_QTY = rowData.FILL_SAFETY_QTY;
                }
            }
            break;
        case "FILL_MAX_QTY":
            if (Number(rowData.FILL_MAX_QTY) < 0 || Number(rowData.FILL_MAX_QTY) < Number(rowData.FILL_SAFETY_QTY)) {
                alert($NC.getDisplayMsg("JS.CMC05040E0.009", "적정재고수량에 안전재고수량 이상의 정수를 입력하십시오."));
                rowData.FILL_MAX_QTY = args.oldItem.FILL_MAX_QTY;
                $NC.setFocusGrid(G_GRDMASTER, args.row, args.cell, true);
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.FILL_UNIT_QTY)) {
            alert($NC.getDisplayMsg("JS.CMC05040E0.010", "보충단위수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "FILL_UNIT_QTY", true);
            return false;
        }
        if ($NC.isNull(rowData.FILL_SAFETY_QTY) || Number(rowData.FILL_SAFETY_QTY) < Number(rowData.FILL_UNIT_QTY)) {
            alert($NC.getDisplayMsg("JS.CMC05040E0.011", "안전재고수량에 보충단위수량 이상의 정수를 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "FILL_SAFETY_QTY", true);
            return false;
        }
        if ($NC.isNull(rowData.FILL_MAX_QTY)) {
            alert($NC.getDisplayMsg("JS.CMC05040E0.012", "적정재고수량을 입력하십시오."));
            $NC.setFocusGrid(G_GRDMASTER, row, "FILL_MAX_QTY", true);
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdDetailInitialize() {

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
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CMC05040E0.RS_DETAIL",
        sortCol: "ITEM_CD",
        gridOptions: options,
        dragOptions: {
            dropMode: "drop-cell",
            onGetDraggable: function(e, dd) {
                // Drag 가능 여부
                return G_GRDMASTER.data.getLength() > 0;
            },
            // helperMessageFormat: "선택 상품 %d건 추가",
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
                    result = "[상품: " + $NC.getDisplayCombo(rowData.ITEM_CD, rowData.ITEM_NM) + "]를 추가";
                } else {
                    result = "[상품: " + $NC.getDisplayCombo(rowData.ITEM_CD, rowData.ITEM_NM) + "] 외 " + (dd.dragCount - 1) + "건 추가";
                }
                return result;
            }
        }
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onClick.subscribe(grdDetailOnClick);
}

function grdDetailOnGetColumns() {

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

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdDetailOnClick(e, args) {

    var rowData = G_GRDDETAIL.data.getItem(args.row);
    if ($NC.isNull(rowData)) {
        return;
    }

    var searchIndex = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: [
            "BRAND_CD",
            "ITEM_CD",
            "ITEM_STATE"
        ],
        searchVal: [
            rowData.BRAND_CD,
            rowData.ITEM_CD,
            $NC.getValue("#cboItem_State")
        ]
    });

    if (searchIndex > -1) {
        $NC.setGridSelectRow(G_GRDMASTER, searchIndex);
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, [
        "LOCATION_CD",
        "BU_CD",
        "ITEM_STATE",
        "BRAND_CD",
        "ITEM_CD"
    ], true)) {
        // 상품데이터 조회
        btnInquiryItemOnClick();
    } else {
        $NC.clearGridData(G_GRDDETAIL);
    }

    setTopButtons();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, [
        "BRAND_CD",
        "ITEM_CD"
    ]);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "LOCATION_CD",
            "BU_CD",
            "ITEM_STATE",
            "BRAND_CD",
            "ITEM_CD"
        ]
    });
    var lastItemKeyVal = $NC.getGridLastKeyVal(G_GRDDETAIL, {
        selectKey: [
            "BRAND_CD",
            "ITEM_CD"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
    G_GRDDETAIL.lastKeyVal = lastItemKeyVal;
}

function onSaveError(ajaxData) {

    $NC.onError(ajaxData);
    _Inquiry();
}

function btnInquiryItemOnClick() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQL0_Bu_Cd");
    var BU_NM = $NC.getValue("#edtQL0_Bu_Nm");
    if ($NC.isNull(BU_NM)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.013", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQL0_Bu_Cd");
        return;
    }
    var ITEM_STATE = $NC.getValue("#cboItem_State");
    if ($NC.isNull(ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.002", "상품상태를 선택하십시오."));
        $NC.setFocus("#cboItem_State");
        return;
    }
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
    var VIEW_DIV = $NC.getValueRadioGroup("rgbQView_Div");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    // 파라메터 세팅
    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM,
        P_VENDOR_CD: VENDOR_CD,
        P_VIEW_DIV: VIEW_DIV
    };
    // 상품 데이터 조회
    $NC.serviceCall("/CMC05040E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
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

function btnAddItemOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.014", "데이터 조회 후 등록 처리하십시오."));
        return;
    }
    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.015", "상품 조회 후 등록 처리하십시오."));
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    var CRUD = $ND.C_DV_CRUD_C;
    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    // 등록 여부 체크
    if (rowData.ENTRY_YN == $ND.C_YES) {
        // 같은 로케이션
        if (rowData.LOCATION_CD == refRowData.LOCATION_CD) {
            alert($NC.getDisplayMsg("JS.CMC05040E0.016", "로케이션: " + rowData.LOCATION_CD + "\n해당 로케이션에 이미 등록된 상품입니다. " //
                + "등록할 수 없습니다.", rowData.LOCATION_CD));
            return;
        }
        // 다른 로케이션
        else if (rowData.LOCATION_CD != refRowData.LOCATION_CD) {
            if (!confirm($NC.getDisplayMsg("JS.CMC05040E0.017", "기존로케이션: " + rowData.LOCATION_CD //
                + "\n변경로케이션: " + refRowData.LOCATION_CD + "\n다른 로케이션에 등록된 상품입니다. 변경 하시겠습니까?"//
            , rowData.LOCATION_CD, refRowData.LOCATION_CD))) {
                return;
            }
            CRUD = $ND.C_DV_CRUD_U;
        }
    }

    // 고정로케이션 신규 등록 / 변경 처리
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.001", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQL0_Bu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.013", "사업부를 입력하십시오."));
        return;
    }
    var ITEM_STATE = $NC.getValue("#cboItem_State");
    if ($NC.isNull(ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.002", "상품상태를 선택하십시오."));
        $NC.setFocus("#cboQItem_State");
        return;
    }
    var BRAND_CD = rowData.BRAND_CD;
    var ITEM_CD = rowData.ITEM_CD;
    var LOCATION_CD = refRowData.LOCATION_CD;

    var dsMaster = [
        {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_ITEM_STATE: ITEM_STATE,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ZONE_CD: refRowData.ZONE_CD,
            P_BANK_CD: refRowData.BANK_CD,
            P_BAY_CD: refRowData.BAY_CD,
            P_LEV_CD: refRowData.LEV_CD,
            P_LOCATION_CD: LOCATION_CD,
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CRUD: CRUD
        }
    ];

    $NC.serviceCall("/CMC05040E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        var lastKeyValM = [
            LOCATION_CD,
            BU_CD,
            ITEM_STATE,
            BRAND_CD,
            ITEM_CD
        ];
        var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
            selectKey: [
                "BRAND_CD",
                "ITEM_CD"
            ]
        });
        _Inquiry();
        G_GRDMASTER.lastKeyVal = lastKeyValM;
        G_GRDDETAIL.lastKeyVal = lastKeyValD;
    }, onSaveError);
}

/**
 * 조회조건의 사업부 검색 팝업 클릭
 */
function showQUserBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onQUserBuPopup, function() {
        $NC.setFocus("#edtQBu_Cd", true);
    });
}

/**
 * 조회조건의 사업부 검색 결과
 * 
 * @param resultInfo
 */
function onQUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
        $NC.setValue("#edtQL0_Bu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQL0_Bu_Nm", resultInfo.BU_NM);
        $NC.setValue("#edtQL0_Cust_Cd", resultInfo.CUST_CD);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setValue("#edtQL0_Bu_Cd");
        $NC.setValue("#edtQL0_Bu_Nm");
        $NC.setValue("#edtQL0_Cust_Cd");
        $NC.setFocus("#edtQBu_Cd", true);
    }

    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    onChangingCondition();
}

/**
 * 상품검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

    $NP.showUserBuPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: $ND.C_ALL,
        P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtQL0_Bu_Cd", true);
    });
}

/**
 * 상품검색조건의 사업부 검색 결과
 * 
 * @param resultInfo
 */
function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQL0_Bu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQL0_Bu_Nm", resultInfo.BU_NM);
        $NC.setValue("#edtQL0_Cust_Cd", resultInfo.CUST_CD);
    } else {
        $NC.setValue("#edtQL0_Bu_Cd");
        $NC.setValue("#edtQL0_Bu_Nm");
        $NC.setValue("#edtQL0_Cust_Cd");
        $NC.setFocus("#edtQL0_Bu_Cd", true);
    }

    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    onChangingItemCondition();
}

/**
 * 상품검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQL0_Bu_Cd");
    $NP.showBuBrandPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: $ND.C_ALL
    }, onBuBrandPopup, function() {
        $NC.setFocus("#edtQBrand_Cd", true);
    });
}

/**
 * 상품검색조건의 브랜드 검색 결과
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
 * 상품검색조건의 공급처 검색 팝업 클릭
 */
function showVendorPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

    $NP.showVendorPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_VENDOR_CD: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onVendorPopup, function() {
        $NC.setFocus("#edtQVendor_Cd", true);
    });
}

/**
 * 상품검색조건의 공급처 검색 결과
 * 
 * @param resultInfo
 */
function onVendorPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQVendor_Cd", resultInfo.VENDOR_CD);
        $NC.setValue("#edtQVendor_Nm", resultInfo.VENDOR_NM);
    } else {
        $NC.setValue("#edtQVendor_Cd");
        $NC.setValue("#edtQVendor_Nm");
        $NC.setFocus("#edtQVendor_Cd", true);
    }

    onChangingItemCondition();
}

/**
 * 조회조건 - 존코드 세팅
 */
function setZoneCdCombo() {

    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMZONE",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
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
}

function btnDownloadXLSFormatOnClick() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.015", "물류센터를 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "BU_CD",
            P_COLUMN_TITLE: "사업부코드",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "BRAND_CD",
            P_COLUMN_TITLE: "브랜드코드",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "ITEM_CD",
            P_COLUMN_TITLE: "상품코드",
            P_COLUMN_WIDTH: 20
        },
        {
            P_COLUMN_NM: "ITEM_STATE",
            P_COLUMN_TITLE: "상품상태",
            P_COLUMN_WIDTH: 10
        },
        {
            P_COLUMN_NM: "FLOCATION_CD",
            P_COLUMN_TITLE: "고정로케이션",
            P_COLUMN_WIDTH: 15
        },
        {
            P_COLUMN_NM: "FILL_UNIT_QTY",
            P_COLUMN_TITLE: "단위보충수량",
            P_COLUMN_WIDTH: 10
        },
        {
            P_COLUMN_NM: "FILL_SAFETY_QTY",
            P_COLUMN_TITLE: "안전재고수량",
            P_COLUMN_WIDTH: 10
        },
        {
            P_COLUMN_NM: "FILL_MAX_QTY",
            P_COLUMN_TITLE: "적정재고수량",
            P_COLUMN_WIDTH: 10
        },
        {
            P_COLUMN_NM: "REMARK1",
            P_COLUMN_TITLE: "비고",
            P_COLUMN_WIDTH: 40
        }
    ];

    $NC.excelFileDownload({
        P_QUERY_ID: "CMC05040E0.RS_SUB1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "고정로케이션업로드", // Excel Sheet Title
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.CMC05040E0.015", "물류센터를 입력하십시오."));
        return;
    }

    var COLUMN_INFO = [
        {
            P_COLUMN_NM: "BU_CD",
            P_XLS_COLUMN_NM: "A"
        },
        {
            P_COLUMN_NM: "BRAND_CD",
            P_XLS_COLUMN_NM: "B"
        },
        {
            P_COLUMN_NM: "ITEM_CD",
            P_XLS_COLUMN_NM: "C"
        },
        {
            P_COLUMN_NM: "ITEM_STATE",
            P_XLS_COLUMN_NM: "D"
        },
        {
            P_COLUMN_NM: "FLOCATION_CD",
            P_XLS_COLUMN_NM: "E"
        },
        {
            P_COLUMN_NM: "FILL_UNIT_QTY",
            P_XLS_COLUMN_NM: "F"
        },
        {
            P_COLUMN_NM: "FILL_SAFETY_QTY",
            P_XLS_COLUMN_NM: "G"
        },
        {
            P_COLUMN_NM: "FILL_MAX_QTY",
            P_XLS_COLUMN_NM: "H"
        }
    ];

    $NC.excelFileUpload({
        P_QUERY_ID: "CMC05040E0.RS_SUB2",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_COL_CHECK_YN: $ND.C_YES,
            P_XLS_FIRST_ROW: 3
        // P_XLS_FILE_DIV: "CMLOCATIONFIX"
        },
        P_COLUMN_INFO: COLUMN_INFO
    }, function(ajaxData, dsResultData) {

        if ($NC.isNull(dsResultData) || dsResultData.length == 0) {
            alert($NC.getDisplayMsg("JS.CMC05040E0.008", "업로드할 수 있는 대상 데이터가 없습니다. 엑셀 파일을 확인하십시오."));
            return;
        }

        var dsMaster = [];
        for (var rIndex = 0, rCount = dsResultData.length; rIndex < rCount; rIndex++) {
            dsMaster.push({
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: dsResultData[rIndex].BU_CD,
                P_BRAND_CD: dsResultData[rIndex].BRAND_CD,
                P_ITEM_STATE: dsResultData[rIndex].ITEM_STATE,
                P_ITEM_CD: dsResultData[rIndex].ITEM_CD,
                P_ZONE_CD: dsResultData[rIndex].ZONE_CD,
                P_BANK_CD: dsResultData[rIndex].BANK_CD,
                P_BAY_CD: dsResultData[rIndex].BAY_CD,
                P_LEV_CD: dsResultData[rIndex].LEV_CD,
                P_LOCATION_CD: dsResultData[rIndex].FLOCATION_CD,
                P_FILL_UNIT_QTY: dsResultData[rIndex].FILL_UNIT_QTY,
                P_FILL_SAFETY_QTY: dsResultData[rIndex].FILL_SAFETY_QTY,
                P_FILL_MAX_QTY: dsResultData[rIndex].FILL_MAX_QTY,
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_CRUD: dsResultData[rIndex].CRUD_FLAG
            });
        }

        $NC.serviceCall("/CMC05040E0/save.do", {
            P_DS_MASTER: dsMaster,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSave, onSaveError);
    });
}