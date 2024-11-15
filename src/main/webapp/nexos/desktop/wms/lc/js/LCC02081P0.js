/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LCC02081P0
 *  프로그램명         : 라벨링작업등록 팝업
 *  프로그램설명       : 라벨링작업등록 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2016-12-14
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2016-12-14    ASETEC           신규작성
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#ctrSub1View",
                grids: "#grdSub1"
            },
            viewSecond: {
                container: "#ctrSub2View",
                grids: "#grdSub2"
            },
            viewType: "v",
            viewFixed: 180,
            exceptHeight: function() {
                return $NC.getViewHeight("#ctrPopupView");
            }
        },
        // 마스터 데이터
        masterData: null,
        // 체크할 정책 값
        policyVal: {
            LS210: "" // 재고 관리 기준
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnSave").click(_Save); // 저장 버튼
    $("#btnLocation_Cd").click(showLocationPopup); // 입고지시 그리드의 로케이션 값 설정에 사용되는 로케이션 검색 버튼
    $("#btnSearchInbound").click(_Inquiry); // 현재고검색 버튼 클릭
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnChange_Item_State").click(btnChangeItemStateOnClick);
    $("#btnChange_Location_Cd").click(btnChangeLocationCdOnClick);
    $("#btnChange_Etc_Div").click(btnChangeEtcDivOnClick);

    $NC.setEnable("#edtCenter_Cd_F", false); // 물류센터 비활성화
    $NC.setEnable("#edtBu_Cd", false); // 사업부 비활성화
    $NC.setEnable("#edtEtc_No", false); // 입출고번호 비활성화

    $NC.setInitDatePicker("#dtpEtc_Date"); // 입출고일자
    $NC.setInitDateRangePicker("#dtpQInbound_Date1", "#dtpQInbound_Date2", null, -7);

    grdSub1Initialize();
    grdSub2Initialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ETC_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ETC_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR03_CD: $ND.C_YES, // Y - 라벨링작업사유여부
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_ITEM_STATE",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "ITEM_STATE",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "1",
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 변환상품상태 콤보 세팅
        $NC.setInitComboData({
            selector: "#cboItem_State",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ITEM_STATE)
        });
        // 사유구분 콤보 세팅
        $NC.setInitComboData({
            selector: "#cboEtc_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_ETC_DIV)
        });
    });

    // 정책 값 세팅
    setPolicyValInfo();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.G_PARAMETER.P_CENTER_CD_F);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);
    $NC.setValue("#dtpEtc_Date", $NC.G_VAR.G_PARAMETER.P_ETC_DATE);

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
        CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        ETC_DATE: $NC.getValue("#dtpEtc_Date"),
        ETC_NO: "",
        INOUT_CD: "",
        REMARK1: "",
        CRUD: $ND.C_DV_CRUD_C
    };

    // 입출고구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "D5", // 상태변환작업그룹
            P_ATTR02_CD: "2", // 2 - 특수작업
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        selectOption: "F",
        onComplete: function() {
            $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
        }
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
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_OK);
    $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "INBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC02081P0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LCC02081P0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    masterDataOnChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * 조회
 */
function _Inquiry() {

    var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
    if ($NC.isNull(INBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.003", "검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }
    var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
    if ($NC.isNull(INBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.004", "검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date2");
        return;
    }
    if (INBOUND_DATE1 > INBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.005", "입고일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }

    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd");
    var SHIPMENT_NO = $NC.getValue("#edtQShipment_No", true);
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    var ITEM_STATE = $NC.getValue("#cboQItem_State");
    var ITEM_LOT = $NC.getValue("#edtQItem_Lot");

    $NC.clearGridData(G_GRDSUB1);
    $NC.clearGridData(G_GRDSUB2);

    G_GRDSUB1.queryParams = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_INBOUND_DATE1: INBOUND_DATE1,
        P_INBOUND_DATE2: INBOUND_DATE2,
        P_VENDOR_CD: VENDOR_CD,
        P_SHIPMENT_NO: SHIPMENT_NO,
        P_BU_NO: BU_NO,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_LOT: ITEM_LOT
    };
    // 데이터 조회
    $NC.serviceCall("/LCC02080E0/getDataSet.do", $NC.getGridParams(G_GRDSUB1), onGetSub1);
}

/**
 * 상품추가 버튼 클릭 이벤트 처리
 */
function _New() {

}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Save() {

    if (G_GRDSUB2.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.006", "저장할 데이터가 없습니다."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.007", "물류센터를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.008", "사업부를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.009", "먼저 입출고구분을 선택하십시오."));
        $NC.setFocus("#cboInout_Cd");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.ETC_DATE)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.010", "먼저 입출고일자를 입력하십시오."));
        $NC.setFocus("#dtpEtc_Date");
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB2)) {
        return;
    }

    // 체크 데이터 - 값 입력 체크
    for (var rIndex = 0, rCount = G_GRDSUB2.data.getLength(); rIndex < rCount; rIndex++) {
        var rowData = G_GRDSUB2.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        if (!validateSub2Data(rIndex, rowData)) {
            return;
        }
    }

    var checkedData = $NC.getGridCheckedValues(G_GRDSUB2, {
        dataType: "S", // 문자열 결합
        valueColumns: [
            "INBOUND_DATE",
            "INBOUND_NO",
            "LINE_NO",
            "PALLET_ID",
            "LINK_ITEM_STATE",
            "LINK_LOCATION_CD",
            "ETC_DIV",
            "ETC_COMMENT"
        ]
    });

    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.011", "처리할 상품을 선택 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/LCC02080E0/callLCFWLabellingOrder.do", {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
        P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
        P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
        P_REMARK1: $NC.G_VAR.masterData.REMARK1,
        P_CRUD: $NC.G_VAR.masterData.CRUD,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제 버튼 클릭 이벤트 처리(지시내역 그리드 행 삭제)
 */
function _Delete() {

}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

    switch (args.col) {
        case "LOCATION_CD":
            $NP.onLocationChange(args.val, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: args.val,
                P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, onLocationPopup);
            return;
        case "ETC_DATE":
            $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.LCC02081P0.012", "입출고일자를 정확히 입력하십시오."));
            $NC.G_VAR.masterData.ETC_DATE = $NC.getValue("#dtpEtc_Date");
            break;
        case "INOUT_CD":
            $NC.G_VAR.masterData.INOUT_CD = args.val;
            break;
        case "REMARK1":
            $NC.G_VAR.masterData.REMARK1 = args.val;
            break;
        default:
            // 마스터 데이터 변경이 아닐 경우는 CRUD 변경하지 않기 위해 RETURN
            return;
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
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

function grdSub1OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "입고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "입고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NM",
        field: "INOUT_NM",
        name: "입고구분"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_CD",
        field: "VENDOR_CD",
        name: "공급처"
    });
    $NC.setGridColumn(columns, {
        id: "VENDOR_NM",
        field: "VENDOR_NM",
        name: "공급처명"
    });
    $NC.setGridColumn(columns, {
        id: "IN_CAR_DIV_F",
        field: "IN_CAR_DIV_F",
        name: "입고차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NO",
        field: "CAR_NO",
        name: "차량번호"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_DATE",
        field: "ORDER_DATE",
        name: "예정일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ORDER_NO",
        field: "ORDER_NO",
        name: "예정번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPMENT_NO",
        field: "SHIPMENT_NO",
        name: "SHIPMENT번호"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSub1OnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDSUB1, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

/**
 * 상단그리드(상품정보) 초기값 설정
 */
function grdSub1Initialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub1", {
        columns: grdSub1OnGetColumns(),
        queryId: "LCC02080E0.RS_SUB1",
        sortCol: "INBOUND_NO",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDSUB1.view.onSelectedRowsChanged.subscribe(grdSub1OnAfterScroll);
}

/**
 * 상단 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSub1OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB1, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDSUB1.data.getItem(row);

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDSUB2);
    G_GRDSUB2.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LCC02080E0/getDataSet.do", $NC.getGridParams(G_GRDSUB2), onGetSub2);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB1, row + 1);
}

function grdSub2OnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CHECK_YN",
        field: "CHECK_YN",
        resizable: false,
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight"
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
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상태",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_LOT",
        field: "ITEM_LOT",
        name: "LOT번호"
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "IN_UNIT_DIV_F",
        field: "IN_UNIT_DIV_F",
        name: "입고단위"
    });
    $NC.setGridColumn(columns, {
        id: "PALLET_ID",
        field: "PALLET_ID",
        name: "파렛트ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "PSTOCK_QTY",
        field: "PSTOCK_QTY",
        name: "가용재고",
        cssClass: "styRight",
        // 기본 Formatter 자동 지정이 아닌 임의 지정
        formatter: Slick.Formatters.Number,
        formatterOptions: $NC.getGridNumberColumnOptions("FLOAT_QTY")
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "변환수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_BOX",
        field: "CONFIRM_BOX",
        name: "변환BOX",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_EA",
        field: "CONFIRM_EA",
        name: "변환EA",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "LINK_ITEM_STATE_F",
        field: "LINK_ITEM_STATE_F",
        name: "변환상태",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "ITEM_STATE",
                P_COMMON_CD: $ND.C_ALL,
                P_ATTR01_CD: "1",
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "LINK_ITEM_STATE",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "LINK_LOCATION_CD",
        field: "LINK_LOCATION_CD",
        name: "이동로케이션",
        cssClass: "styCenter",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdSub2OnPopup,
            isKeyField: true
        }
    });
    $NC.setGridColumn(columns, {
        id: "ETC_DIV_F",
        field: "ETC_DIV_F",
        name: "사유구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "ETC_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_ATTR03_CD: $ND.C_YES, // Y - 라벨링작업사유여부
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "ETC_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            isKeyField: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "ETC_COMMENT",
        field: "ETC_COMMENT",
        name: "사유내역",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "LOCATION_CD",
        field: "LOCATION_CD",
        name: "재고로케이션",
        cssClass: "styCenter"
    });
    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조배치번호",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LABELLING_DIV_D",
        field: "LABELLING_DIV_D",
        name: "라벨링구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_DIV_D",
        field: "DRUG_DIV_D",
        name: "약품구분"
    });
    $NC.setGridColumn(columns, {
        id: "MEDICATION_DIV_D",
        field: "MEDICATION_DIV_D",
        name: "투여구분"
    });
    $NC.setGridColumn(columns, {
        id: "KEEP_DIV_D",
        field: "KEEP_DIV_D",
        name: "보관구분"
    });
    $NC.setGridColumn(columns, {
        id: "DRUG_CD",
        field: "DRUG_CD",
        name: "보험코드"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSub2OnSetColumns() {

    // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
    $NC.setGridColumns(G_GRDSUB2, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.LS210 != "2" ? "VALID_DATE,BATCH_NO" : ""
    ]);
}

/**
 * 현재고 데이터 그리드 초기값 설정
 */
function grdSub2Initialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 5,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.PSTOCK_QTY != rowData.CONFIRM_QTY) {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub2", {
        columns: grdSub2OnGetColumns(),
        queryId: "LCC02080E0.RS_SUB2",
        sortCol: "LINE_NO",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDSUB2.view.onSelectedRowsChanged.subscribe(grdSub2OnAfterScroll);
    G_GRDSUB2.view.onBeforeEditCell.subscribe(grdSub2OnBeforeEditCell);
    G_GRDSUB2.view.onCellChange.subscribe(grdSub2OnCellChange);
    G_GRDSUB2.view.onHeaderClick.subscribe(grdSub2OnHeaderClick);
    G_GRDSUB2.view.onClick.subscribe(grdSub2OnClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDSUB2, "CHECK_YN");
}

/**
 * 현재고 데이터 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSub2OnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB2, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB2, row + 1);
}

/**
 * 현재고 데이터 그리드 편집 불가 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSub2OnBeforeEditCell(e, args) {

    var rowData = args.item;
    // 신규일 경우 모두 수정 가능, 그외 아래 컬럼만 수정 가능
    if (rowData.CRUD == $ND.C_DV_CRUD_R || rowData.CRUD == $ND.C_DV_CRUD_U) {
        switch (args.column.id) {
            case "LINK_ITEM_STATE_F":
            case "LINK_LOCATION_CD":
            case "ETC_DIV_F":
            case "ETC_COMMENT":
                return true;
        }
    }
    return true;
}

/**
 * 현재고 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSub2OnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDSUB2.view.getColumnId(args.cell)) {
        case "LINK_LOCATION_CD":
            $NP.onLocationChange(rowData.LINK_LOCATION_CD, {
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: rowData.LINK_LOCATION_CD,
                P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, grdSub2OnLocationPopup);
            return;
        case "ETC_COMMENT":
            rowData.ETC_COMMENT = (rowData.ETC_COMMENT || "").replace(/[;,]/g, " ");
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB2, rowData);
}

/**
 * 지시내역 그리드 입력 체크
 */
function grdSub2OnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUB2, row)) {
        return true;
    }

    var rowData = G_GRDSUB2.data.getItem(row);

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUB2, rowData);
    return true;
}

/**
 * 그리드의 존구분의 검색 버튼 클릭시 로케이션 검색 창 표시
 */
function grdSub2OnPopup(e, args) {

    switch (args.column.id) {
        case "LINK_LOCATION_CD":
            $NP.showLocationPopup({
                P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                P_ZONE_CD: "",
                P_BANK_CD: "",
                P_BAY_CD: "",
                P_LEV_CD: "",
                P_LOCATION_CD: $ND.C_ALL,
                P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
            }, grdSub2OnLocationPopup, function() {
                $NC.setFocusGrid(G_GRDSUB2, args.row, args.cell, true, true);
            });
            return;
    }
}

/**
 * 지시내역 그리드의 로케이션 검색 팝업창에서 행 클릭 혹은 취소 했을 경우 처리
 * 
 * @param resultInfo
 */

function grdSub2OnLocationPopup(resultInfo) {

    var rowData = G_GRDSUB2.data.getItem(G_GRDSUB2.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.LINK_LOCATION_CD = resultInfo.LOCATION_CD;

        focusCol = G_GRDSUB2.view.getColumnIndex("ETC_DIV_F");
    } else {
        rowData.LINK_LOCATION_CD = "";

        focusCol = G_GRDSUB2.view.getColumnIndex("LINK_LOCATION_CD");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB2, rowData);

    $NC.setFocusGrid(G_GRDSUB2, G_GRDSUB2.lastRow, focusCol, true, true);
}

function validateSub2Data(row, rowData) {

    if ($NC.isNull(rowData.LINK_ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.013", "변환상태를 선택하십시오."));
        $NC.setFocusGrid(G_GRDSUB2, row, "LINK_ITEM_STATE_F", true);
        return false;
    }

    if ($NC.isNull(rowData.LINK_LOCATION_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.014", "이동로케이션을 입력하십시오."));
        $NC.setFocusGrid(G_GRDSUB2, row, "LINK_LOCATION_CD", true);
        return false;
    }

    if ($NC.isNull(rowData.ETC_DIV)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.015", "사유구분을 선택하십시오."));
        $NC.setFocusGrid(G_GRDSUB2, row, "ETC_DIV_F", true);
        return false;
    }
    return true;
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdSub2OnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDSUB2, e, args);
            break;
    }
}

/**
 * 상단 그리드의 행 체크 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdSub2OnClick(e, args) {

    var columnId = G_GRDSUB2.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "CHECK_YN":
            $NC.onGridCheckBoxEditorChange(G_GRDSUB2, e, args);
            break;
    }
}

/**
 * 입고내역 검색후 처리
 * 
 * @param ajaxData
 */
function onGetSub1(ajaxData) {

    $NC.setInitGridData(G_GRDSUB1, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB1, [
        "INBOUND_DATE",
        "LINE_NO"
    ]);
}

/**
 * 입고 파렛트내역 검색후 처리
 * 
 * @param ajaxData
 */
function onGetSub2(ajaxData) {

    $NC.setInitGridData(G_GRDSUB2, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDSUB2, "LINE_NO");
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD
    }, function() {
        // 재고 관리 기준 : 2 - 입고일자, 유효일자, 배치번호별 관리
        if ($NC.G_VAR.policyVal.LS210 == "2") {
            // 컬럼 표시 조정
            grdSub1OnSetColumns();
            grdSub2OnSetColumns();
        }
    });
}

/**
 * 기타입고 지시내역의 로케이션 검색 이미지 클릭
 */
function showLocationPopup() {

    $NP.showLocationPopup({
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: $ND.C_ALL,
        P_ZONE_DIV_ATTR01_CD: "1" // 1 - 일반, 2- 유통가공, 3 - 보세
    }, onLocationPopup, function() {
        $NC.setFocus("#edtLocation_Cd", true);
    });
}

/**
 * 로케이션 검색 팝업창에서 행 클릭 했을 경우 처리
 * 
 * @param resultInfo
 */
function onLocationPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtLocation_Cd", resultInfo.LOCATION_CD);
    } else {
        $NC.setValue("#edtLocation_Cd");
        $NC.setFocus("#edtLocation_Cd", true);
    }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtBu_Cd");

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
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");

}

function btnChangeItemStateOnClick() {

    if (G_GRDSUB2.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.016", "변환상태를 수정할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB2)) {
        return;
    }

    var LINK_ITEM_STATE = $NC.getValue("#cboItem_State");
    var LINK_ITEM_STATE_F = $NC.getValueCombo("#cboItem_State", "F");

    if ($NC.isNull(LINK_ITEM_STATE)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.017", "변경할 변환상태를 선택하십시오."));
        return;
    }

    var checkCount = 0;
    for (var rIndex = 0, rowCount = G_GRDSUB2.data.getLength(); rIndex < rowCount; rIndex++) {
        var rowData = G_GRDSUB2.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }

        checkCount++;
        rowData.LINK_ITEM_STATE = LINK_ITEM_STATE;
        rowData.LINK_ITEM_STATE_F = LINK_ITEM_STATE_F;

        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
        $NC.setGridApplyChange(G_GRDSUB2, rowData);
    }

    if (checkCount == 0) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.018", "변경할 데이터를 선택 후 처리하십시오."));
        return;
    }
}

function btnChangeLocationCdOnClick() {

    if (G_GRDSUB2.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.019", "이동로케이션을 수정할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB2)) {
        return;
    }

    var LINK_LOCATION_CD = $NC.getValue("#edtLocation_Cd");

    if ($NC.isNull(LINK_LOCATION_CD)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.020", "변경할 이동로케이션을 입력하십시오."));
        return;
    }

    var checkCount = 0;
    for (var rIndex = 0, rowCount = G_GRDSUB2.data.getLength(); rIndex < rowCount; rIndex++) {
        var rowData = G_GRDSUB2.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }

        checkCount++;
        rowData.LINK_LOCATION_CD = LINK_LOCATION_CD;

        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
        $NC.setGridApplyChange(G_GRDSUB2, rowData);
    }

    if (checkCount == 0) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.021", "변경할 데이터를 선택 후 처리하십시오."));
        return;
    }
}

function btnChangeEtcDivOnClick() {

    if (G_GRDSUB2.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.022", "사유구분을 수정할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB2)) {
        return;
    }

    var ETC_DIV = $NC.getValue("#cboEtc_Div");
    var ETC_DIV_F = $NC.getValueCombo("#cboEtc_Div", "F");

    if ($NC.isNull(ETC_DIV)) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.023", "변경할 사유구분을 선택하십시오."));
        return;
    }

    var checkCount = 0;
    for (var rIndex = 0, rowCount = G_GRDSUB2.data.getLength(); rIndex < rowCount; rIndex++) {
        var rowData = G_GRDSUB2.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }

        checkCount++;
        rowData.ETC_DIV = ETC_DIV;
        rowData.ETC_DIV_F = ETC_DIV_F;

        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
        $NC.setGridApplyChange(G_GRDSUB2, rowData);
    }

    if (checkCount == 0) {
        alert($NC.getDisplayMsg("JS.LCC02081P0.024", "변경할 데이터를 선택 후 처리하십시오."));
        return;
    }
}