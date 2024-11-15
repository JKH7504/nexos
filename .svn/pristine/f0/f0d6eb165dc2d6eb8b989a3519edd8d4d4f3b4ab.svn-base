/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC02020E0
 *  프로그램명         : 차량관리
 *  프로그램설명       : 차량관리 화면 Javascript
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
            CM710: "" // 좌표검색 API 사용
        },
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: {
                container: "#divRightView",
                sizeFn: function(viewWidth, viewHeight) {

                    var scrollOffset = viewHeight < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
                    // Container 사이즈 조정
                    return $NC.G_OFFSET.rightViewWidth + scrollOffset;
                }
            }
        },
        INIT_TRANS_DIV: "1",
        INIT_CAR_TON_DIV: "000",
        INIT_CAR_KEEP_DIV: "10"
    });
    // 탭 초기화
    $NC.setInitTab("#divRightView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });
    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQCarrier_Cd");
    $NC.setValue("#edtQCarrier_Nm");

    $NC.setValue("#chkQDeal_Div1", true);
    $NC.setValue("#chkQDeal_Div2", true);

    $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
    $NC.setInitDatePicker("#dtpClose_Date", null, "N");

    $NC.setInitTimePicker("#dtpWorking_STime", null);
    $NC.setInitTimePicker("#dtpWorking_ETime", null);

    $NC.setInitDatePicker("#dtpCar_Year", null, "N");
    $NC.setInitDatePicker("#dtpCar_Made_Date", null, "N");
    $NC.setInitDatePicker("#dtpCar_Paint_Year", null, "N");
    $NC.setInitDatePicker("#dtpInsurance_Expire_Date", null, "N");
    // 초기 비활성화 처리
    $NC.setEnableGroup("#divRightView", false);

    // 이벤트 연결
    $("#btnQCarrier_Cd").click(showQCarrierPopup);
    $("#btnCarrier_Cd").click(showCarrierPopup);
    $("#btnZip_Cd").click(showPostPopup);
    $("#btnZip_Cd_Clear").click(btnZipCdClearOnClick);
    $("#btnGetCoord").click(btnGetCoordOnClick);
    $("#btnEntryCoord").click(btnEntryCoordOnClick);

    // 그리드 초기화
    grdMasterInitialize();

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CAR_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CAR_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_TRANS_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "TRANS_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CAR_TON_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CAR_TON_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CAR_KEEP_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CAR_KEEP_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CAR_KIND_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CAR_KIND_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_INSURANCE_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "INSURANCE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 차량구분 세팅
        $NC.setInitComboData({
            selector: "#cboCar_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            addEmpty: true,
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CAR_DIV),
            onComplete: function() {
                $NC.setValue("#cboCar_Div");
            }
        });
        // 운송구분 세팅
        $NC.setInitComboData({
            selector: "#cboTrans_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_TRANS_DIV),
            onComplete: function() {
                $NC.setValue("#cboTrans_Div");
            }
        });
        // 차량톤수구분 세팅
        $NC.setInitComboData({
            selector: "#cboCar_Ton_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CAR_TON_DIV),
            onComplete: function() {
                $NC.setValue("#cboCar_Ton_Div");
            }
        });
        // 차량보관구분 세팅
        $NC.setInitComboData({
            selector: "#cboCar_Keep_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CAR_KEEP_DIV),
            onComplete: function() {
                $NC.setValue("#cboCar_Keep_Div");
            }
        });
        // 차종구분 세팅
        $NC.setInitComboData({
            selector: "#cboCar_Kind_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CAR_KIND_DIV),
            onComplete: function() {
                $NC.setValue("#cboCar_Kind_Div");
            }
        });
        // 자동차보험구분 세팅
        $NC.setInitComboData({
            selector: "#cboInsurance_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_INSURANCE_DIV),
            onComplete: function() {
                $NC.setValue("#cboInsurance_Div");
            }
        });
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
    // 정책값 설정
    setPolicyValInfo();
}

function _SetResizeOffset() {

    $NC.G_OFFSET.rightViewWidth = 450;
    $NC.G_OFFSET.rightViewMinHeight = $("#divT1TabSheetView").outerHeight(true) + $NC.G_LAYOUT.header;
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
                P_CARRIER_DIV: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }, onQCarrierPopup);
            return;
    }

    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);

    setInputValue("#grdMaster");
    $NC.setEnableGroup("#divRightView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    grdMasterOnCellChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_CARRIER_CD: CARRIER_CD,
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3
    };
    // 데이터 조회
    $NC.serviceCall("/CMC02020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
    var CARRIER_NM = $NC.getValue("#edtQCarrier_Nm");

    if ($NC.isNull(CARRIER_CD) || CARRIER_CD == $ND.C_ALL) {
        CARRIER_CD = "";
        CARRIER_NM = "";
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        CAR_CD: null,
        CAR_NM: null,
        CAR_DIV: null,
        CARRIER_CD: CARRIER_CD,
        CARRIER_NM: CARRIER_NM,
        TRANS_DIV: $NC.G_VAR.INIT_TRANS_DIV,
        TRANS_DIV_F: $NC.getValueCombo("#cboTrans_Div", {
            searchVal: $NC.G_VAR.INIT_TRANS_DIV,
            returnVal: "F"
        }),
        CAR_TON_DIV: $NC.G_VAR.INIT_CAR_TON_DIV,
        CAR_TON_DIV_F: $NC.getValueCombo("#cboCar_Ton_Div", {
            searchVal: $NC.G_VAR.INIT_CAR_TON_DIV,
            returnVal: "F"
        }),
        CAR_KEEP_DIV: $NC.G_VAR.INIT_CAR_KEEP_DIV,
        CAR_KEEP_DIV_F: $NC.getValueCombo("#cboCar_Keep_Div", {
            searchVal: $NC.G_VAR.INIT_CAR_KEEP_DIV,
            returnVal: "F"
        }),
        CAR_KIND_DIV: $NC.G_VAR.INIT_CAR_KIND_DIV,
        CAR_KIND_DIV_F: $NC.getValueCombo("#cboCar_Kind_Div", {
            searchVal: $NC.G_VAR.INIT_CAR_KIND_DIV,
            returnVal: "F"
        }),
        INSURANCE_DIV: $NC.G_VAR.INIT_INSURANCE_DIV,
        INSURANCE_DIV_F: $NC.getValueCombo("#cboCar_Insurance_Div", {
            searchVal: $NC.G_VAR.INIT_INSURANCE_DIV,
            returnVal: "F"
        }),
        CAR_YEAR: null,
        CAR_MADE_DATE: null,
        CAR_PAINT_YN: $ND.C_NO,
        CAR_PAINT_YEAR: null,
        HIPASS_YN: $ND.C_NO,
        INSURANCE_EXPIRE_DATE: null,
        LOAD_INSURANCE_YN: $ND.C_NO,
        CAPACITY_CBM: "0",
        CAPACITY_WEIGHT: "0",
        CAPACITY_BOX: "0",
        CAPACITY_WIDTH: "0",
        CAPACITY_LENGTH: "0",
        CAPACITY_HEIGHT: "0",
        FUEL_RATE: "0",
        DRIVER_NM: null,
        DRIVER_HP: null,
        WORKING_STIME: null,
        WORKING_ETIME: null,
        ZIP_CD: null,
        ADDR_BASIC: null,
        ADDR_DETAIL: null,
        GEOCODE_LAT: null,
        GEOCODE_LNG: null,
        DEAL_DIV: "1",
        OPEN_DATE: null,
        CLOSE_DATE: null,
        MANAGER_NM: null,
        REMARK1: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 이전 데이터가 한건도 없었으면 에디터 Enable
    if (G_GRDMASTER.data.getLength() == 0) {
        $NC.setEnableGroup("#divRightView", true);
    }

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

function grdMasterOnNewRecord(args) {

    $NC.setValue("#rgbDeal_Div", args.rowData.DEAL_DIV);
    $NC.setValue("#cboTrans_Div", args.rowData.TRANS_DIV);
    $NC.setValue("#cboCar_Keep_Div", args.rowData.CAR_KEEP_DIV);

    $NC.setFocus("#edtCar_Cd");
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC02020E0.001", "저장할 데이터가 없습니다."));
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
            P_CAR_CD: rowData.CAR_CD,
            P_CAR_NM: rowData.CAR_NM,
            P_CAR_DIV: rowData.CAR_DIV,
            P_CARRIER_CD: rowData.CARRIER_CD,
            P_TRANS_DIV: rowData.TRANS_DIV,
            P_CAR_TON_DIV: rowData.CAR_TON_DIV,
            P_CAR_KEEP_DIV: rowData.CAR_KEEP_DIV,
            P_CAR_KIND_DIV: rowData.CAR_KIND_DIV,
            P_CAR_YEAR: rowData.CAR_YEAR,
            P_CAR_MADE_DATE: rowData.CAR_MADE_DATE,
            P_CAR_PAINT_YN: rowData.CAR_PAINT_YN,
            P_CAR_PAINT_YEAR: rowData.CAR_PAINT_YEAR,
            P_HIPASS_YN: rowData.HIPASS_YN,
            P_INSURANCE_DIV: rowData.INSURANCE_DIV,
            P_INSURANCE_EXPIRE_DATE: rowData.INSURANCE_EXPIRE_DATE,
            P_LOAD_INSURANCE_YN: rowData.LOAD_INSURANCE_YN,
            P_CAPACITY_CBM: rowData.CAPACITY_CBM,
            P_CAPACITY_WEIGHT: rowData.CAPACITY_WEIGHT,
            P_CAPACITY_BOX: rowData.CAPACITY_BOX,
            P_CAPACITY_WIDTH: rowData.CAPACITY_WIDTH,
            P_CAPACITY_LENGTH: rowData.CAPACITY_LENGTH,
            P_CAPACITY_HEIGHT: rowData.CAPACITY_HEIGHT,
            P_FUEL_RATE: rowData.FUEL_RATE,
            P_DRIVER_NM: rowData.DRIVER_NM,
            P_DRIVER_HP: rowData.DRIVER_HP,
            P_WORKING_STIME: $NC.isNull(rowData.WORKING_STIME) ? "" : "1900-01-01 " + rowData.WORKING_STIME,
            P_WORKING_ETIME: $NC.isNull(rowData.WORKING_ETIME) ? "" : "1900-01-01 " + rowData.WORKING_ETIME,
            P_ZIP_CD: rowData.ZIP_CD,
            P_ADDR_BASIC: rowData.ADDR_BASIC,
            P_ADDR_DETAIL: rowData.ADDR_DETAIL,
            P_GEOCODE_LAT: rowData.GEOCODE_LAT,
            P_GEOCODE_LNG: rowData.GEOCODE_LNG,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC02020E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC02020E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC02020E0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC02020E0.004", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
            $NC.setEnableGroup("#divRightView", false);
            setInputValue("#grdMaster");
        }
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
        selectKey: "CAR_CD",
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
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *        newTab: The tab that was just activated.<br>
 *        oldTab: The tab that was just deactivated.<br>
 *        newPanel: The panel that was just activated.<br>
 *        oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {
    $NC.onGlobalResize();
}

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }
        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtCar_Cd", rowData.CAR_CD);
        $NC.setValue("#edtCar_Nm", rowData.CAR_NM);
        $NC.setValue("#cboCar_Div", rowData.CAR_DIV);
        $NC.setValue("#edtCarrier_Cd", rowData.CARRIER_CD);
        $NC.setValue("#edtCarrier_Nm", rowData.CARRIER_NM);
        $NC.setValue("#cboTrans_Div", rowData.TRANS_DIV);
        $NC.setValue("#cboCar_Ton_Div", rowData.CAR_TON_DIV);
        $NC.setValue("#cboCar_Keep_Div", rowData.CAR_KEEP_DIV);
        $NC.setValue("#cboCar_Kind_Div", rowData.CAR_KIND_DIV);
        $NC.setValue("#dtpCar_Year", rowData.CAR_YEAR);
        $NC.setValue("#dtpCar_Made_Date", rowData.CAR_MADE_DATE);
        $NC.setValue("#chkCar_Paint_Yn", rowData.CAR_PAINT_YN);
        $NC.setValue("#dtpCar_Paint_Year", rowData.CAR_PAINT_YEAR);
        $NC.setValue("#chkHipass_Yn", rowData.HIPASS_YN);
        $NC.setValue("#cboInsurance_Div", rowData.INSURANCE_DIV);
        $NC.setValue("#dtpInsurance_Expire_Date", rowData.INSURANCE_EXPIRE_DATE);
        $NC.setValue("#chkLoad_Insurance_Yn", rowData.LOAD_INSURANCE_YN);
        $NC.setValue("#edtCapacity_Width", rowData.CAPACITY_WIDTH);
        $NC.setValue("#edtCapacity_Height", rowData.CAPACITY_HEIGHT);
        $NC.setValue("#edtCapacity_Length", rowData.CAPACITY_LENGTH);
        $NC.setValue("#edtCapacity_Cbm", rowData.CAPACITY_CBM);
        $NC.setValue("#edtCapacity_Weight", rowData.CAPACITY_WEIGHT);
        $NC.setValue("#edtCapacity_Box", rowData.CAPACITY_BOX);
        $NC.setValue("#edtFuel_Rate", rowData.FUEL_RATE);
        $NC.setValue("#edtDriver_Nm", rowData.DRIVER_NM);
        $NC.setValue("#edtDriver_Hp", rowData.DRIVER_HP);
        $NC.setValue("#dtpWorking_STime", rowData.WORKING_STIME);
        $NC.setValue("#dtpWorking_ETime", rowData.WORKING_ETIME);
        $NC.setValue("#edtZip_Cd", rowData.ZIP_CD);
        $NC.setValue("#edtAddr_Basic", rowData.ADDR_BASIC);
        $NC.setValue("#edtAddr_Detail", rowData.ADDR_DETAIL);
        $NC.setValue("#edtGeocode_Lat", rowData.GEOCODE_LAT);
        $NC.setValue("#edtGeocode_Lng", rowData.GEOCODE_LNG);
        $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV == "1");
        $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV == "2");
        $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV == "3");
        $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
        $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
        $NC.setValue("#edtRemark1", rowData.REMARK1);
        // 신규 데이터면 차량코드 수정할 수 있게 함
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtCar_Cd");
        } else {
            $NC.setEnable("#edtCar_Cd", false);
        }
        if (rowData.CAR_PAINT_YN == $ND.C_NO) {
            $NC.setEnable("#dtpCar_Paint_Year", false);
        } else {
            $NC.setEnable("#dtpCar_Paint_Year");
        }
        $NC.setEnable("#btnGetCoord", $NC.isNull(rowData.GEOCODE_LAT) //
            || $NC.isNull(rowData.GEOCODE_LNG));
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "CAR_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CAR_CD)) {
            alert($NC.getDisplayMsg("JS.CMC02020E0.005", "차량코드를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtCar_Cd");
            return false;
        }
        if ($NC.isNull(rowData.CAR_NM)) {
            alert($NC.getDisplayMsg("JS.CMC02020E0.006", "차량번호를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtCar_Nm");
            return false;
        }

        if ($NC.isNull(rowData.TRANS_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC02020E0.007", "운송구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboTrans_Div");
            return false;
        }

        if ($NC.isNull(rowData.CAR_TON_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC02020E0.008", "차량톤수를 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboCar_Ton_Div");
            return false;
        }

        if ($NC.isNull(rowData.CAR_KEEP_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC02020E0.008", "차량보관유형을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#cboCar_Keep_Div");
            return false;
        }

        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC02020E0.009", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#dtpClose_Date");
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}
function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CAR_CD",
        field: "CAR_CD",
        name: "차량코드"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_NM",
        field: "CAR_NM",
        name: "차량명"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_DIV_F",
        field: "CAR_DIV_F",
        name: "차량구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_KIND_DIV_F",
        field: "CAR_KIND_DIV_F",
        name: "차종구분"
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_CD",
        field: "CARRIER_CD",
        name: "운송사코드"
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_NM",
        field: "CARRIER_NM",
        name: "운송사명"
    });
    $NC.setGridColumn(columns, {
        id: "TRANS_DIV_F",
        field: "TRANS_DIV_F",
        name: "운송구분"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_TON_DIV_F",
        field: "CAR_TON_DIV_F",
        name: "차량톤수"
    });
    $NC.setGridColumn(columns, {
        id: "CAR_KEEP_DIV_F",
        field: "CAR_KEEP_DIV_F",
        name: "차량보관유형"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_CBM",
        field: "CAPACITY_CBM",
        name: "적재용적",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_WEIGHT",
        field: "CAPACITY_WEIGHT",
        name: "적재중량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CAPACITY_BOX",
        field: "CAPACITY_BOX",
        name: "적재박스수",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "FUEL_RATE",
        field: "FUEL_RATE",
        name: "연비",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_NM",
        field: "DRIVER_NM",
        name: "운전자성명"
    });
    $NC.setGridColumn(columns, {
        id: "DRIVER_HP",
        field: "DRIVER_HP",
        name: "운전자휴대전화번호"
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_BASIC",
        field: "ADDR_BASIC",
        name: "기본주소"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_DETAIL",
        field: "ADDR_DETAIL",
        name: "상세주소"
    });
    // 좌표API사용 기준 : 1 - 네이버 API 사용
    $NC.setGridColumn(columns, {
        id: "GEOCODE_LAT",
        field: "GEOCODE_LAT",
        name: "위도",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "GEOCODE_LNG",
        field: "GEOCODE_LNG",
        name: "경도",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterOnSetColumns() {

    $NC.setGridColumns(G_GRDMASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.CM710 != "1" ? "GEOCODE_LAT,GEOCODE_LNG" : ""
    ]);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC02020E0.RS_MASTER",
        sortCol: "CAR_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 에디터 값 세팅
    setInputValue("#grdMaster", G_GRDMASTER.data.getItem(row));

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }
    switch (args.col) {
        case "CAR_CD":
            rowData.CAR_CD = args.val;
            break;
        case "CAR_NM":
            rowData.CAR_NM = args.val;
            break;
        case "CAR_DIV":
            rowData.CAR_DIV = args.val;
            rowData.CAR_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "CARRIER_CD":
            $NP.onCarrierChange(args.val, {
                P_CARRIER_CD: args.val,
                P_CARRIER_DIV: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }, onCarrierPopup);
            return;
        case "CARRIER_NM":
            rowData.CARRIER_NM = args.val;
            break;
        case "TRANS_DIV":
            rowData.TRANS_DIV = args.val;
            rowData.TRANS_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "CAR_TON_DIV":
            rowData.CAR_TON_DIV = args.val;
            rowData.CAR_TON_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "CAR_KEEP_DIV":
            rowData.CAR_KEEP_DIV = args.val;
            rowData.CAR_KEEP_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "CAR_KIND_DIV":
            rowData.CAR_KIND_DIV = args.val;
            rowData.CAR_KIND_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "CAR_YEAR":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC02020E0.010", "차량연식을 정확히 입력하십시오."), "N");
            }
            rowData.CAR_YEAR = $NC.getValue(args.view);
            break;
        case "CAR_MADE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC02020E0.011", "차량출고일자를 정확히 입력하십시오."), "N");
            }
            rowData.CAR_MADE_DATE = $NC.getValue(args.view);
            break;
        case "CAR_PAINT_YN":
            rowData.CAR_PAINT_YN = args.val;
            if (rowData.CAR_PAINT_YN == $ND.C_NO) {
                $NC.setEnable("#dtpCar_Paint_Year", false);
                rowData.CAR_PAINT_YEAR = "";
                $NC.setValue("#dtpCar_Paint_Year", rowData.CAR_PAINT_YEAR);
            } else {
                $NC.setEnable("#dtpCar_Paint_Year");
            }
            break;
        case "CAR_PAINT_YEAR":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC02020E0.012", "차량도색연도를 정확히 입력하십시오."), "N");
            }
            rowData.CAR_PAINT_YEAR = $NC.getValue(args.view);
            break;
        case "HIPASS_YN":
            rowData.HIPASS_YN = args.val;
            break;
        case "INSURANCE_DIV":
            rowData.INSURANCE_DIV = args.val;
            rowData.INSURANCE_DIV_F = $NC.getValueCombo(args.view, "F");
            break;
        case "INSURANCE_EXPIRE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC02020E0.013", "자동차보험만기일자를 정확히 입력하십시오."), "N");
            }
            rowData.INSURANCE_EXPIRE_DATE = $NC.getValue(args.view);
            break;
        case "LOAD_INSURANCE_YN":
            rowData.LOAD_INSURANCE_YN = args.val;
            break;
        case "CAPACITY_CBM":
            if ($NC.isNull(args.val)) {
                rowData.CAPACITY_CBM = "0";
                $NC.setValue(args.view, rowData.CAPACITY_CBM);
            } else {
                rowData.CAPACITY_CBM = args.val;
            }
            break;
        case "CAPACITY_WEIGHT":
            if ($NC.isNull(args.val)) {
                rowData.CAPACITY_WEIGHT = "0";
                $NC.setValue(args.view, rowData.CAPACITY_WEIGHT);
            } else {
                rowData.CAPACITY_WEIGHT = args.val;
            }
            break;
        case "CAPACITY_WIDTH":
            if ($NC.isNull(args.val)) {
                rowData.CAPACITY_WIDTH = "0";
                $NC.setValue(args.view, rowData.CAPACITY_WIDTH);
            } else {
                rowData.CAPACITY_WIDTH = args.val;
            }
            rowData.CAPACITY_CBM = getCapacityCbm();
            break;
        case "CAPACITY_HEIGHT":
            if ($NC.isNull(args.val)) {
                rowData.CAPACITY_HEIGHT = "0";
                $NC.setValue(args.view, rowData.CAPACITY_HEIGHT);
            } else {
                rowData.CAPACITY_HEIGHT = args.val;
            }
            rowData.CAPACITY_CBM = getCapacityCbm();
            break;
        case "CAPACITY_LENGTH":
            if ($NC.isNull(args.val)) {
                rowData.CAPACITY_LENGTH = "0";
                $NC.setValue(args.view, rowData.CAPACITY_LENGTH);
            } else {
                rowData.CAPACITY_LENGTH = args.val;
            }
            rowData.CAPACITY_CBM = getCapacityCbm();
            break;
        case "CAPACITY_BOX":
            if ($NC.isNull(args.val)) {
                rowData.CAPACITY_BOX = "0";
                $NC.setValue(args.view, rowData.CAPACITY_BOX);
            } else {
                rowData.CAPACITY_BOX = args.val;
            }
            break;
        case "FUEL_RATE":
            if ($NC.isNull(args.val)) {
                rowData.FUEL_RATE = "0";
                $NC.setValue(args.view, rowData.FUEL_RATE);
            } else {
                rowData.FUEL_RATE = args.val;
            }
            break;
        case "DRIVER_NM":
            rowData.DRIVER_NM = args.val;
            break;
        case "DRIVER_HP":
            rowData.DRIVER_HP = args.val;
            break;
        case "WORKING_STIME":
            if ($NC.isNotNull(args.val)) {
                if (!$NC.isTime(args.val)) {
                    alert($NC.getDisplayMsg("JS.CMC02020E0.014", "근무시작시각을 정확히 입력하십시오."));
                    rowData.WORKING_STIME = "";
                    $NC.setValue(args.view);
                } else {
                    rowData.WORKING_STIME = $NC.getTime(args.val);
                }
            } else {
                rowData.WORKING_STIME = $NC.getTime(args.val);
            }
            break;
        case "WORKING_ETIME":
            if ($NC.isNotNull(args.val)) {
                if (!$NC.isTime(args.val)) {
                    alert($NC.getDisplayMsg("JS.CMC02020E0.015", "근무마감시각을 정확히 입력하십시오."));
                    rowData.WORKING_ETIME = "";
                    $NC.setValue(args.view);
                } else {
                    rowData.WORKING_ETIME = $NC.getTime(args.val);
                }
            } else {
                rowData.WORKING_ETIME = $NC.getTime(args.val);
            }
            break;
        case "ZIP_CD":
            rowData.ZIP_CD = args.val;
            break;
        case "ADDR_BASIC":
            rowData.ADDR_BASIC = args.val;
            break;
        case "ADDR_DETAIL":
            rowData.ADDR_DETAIL = args.val;
            break;
        case "GEOCODE_LAT":
            rowData.GEOCODE_LAT = args.val;
            break;
        case "GEOCODE_LNG":
            rowData.GEOCODE_LNG = args.val;
            break;
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC02020E0.016", "거래일자를 정확히 입력하십시오."), "N");
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC02020E0.017", "종료일자를 정확히 입력하십시오."), "N");
            }
            rowData.CLOSE_DATE = $NC.getValue(args.view);
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "CAR_CD", true)) {
        $NC.setEnableGroup("#divRightView", true);
        $NC.setEnable("#edtCar_Cd", false);
        $NC.setEnable("#btnGetCoord", $NC.isNull($NC.getValue("#edtGeocode_Lat")) //
            || $NC.isNull($NC.getValue("#edtGeocode_Lat")));
        $NC.setEnable("#dtpCar_Paint_Year", $NC.getValue("#chkCar_Paint_Yn") == $ND.C_YES);
    } else {
        $NC.setEnableGroup("#divRightView", false);
        setInputValue("#grdMaster");
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "CAR_CD"
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

function showQCarrierPopup() {

    var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
    $NP.showCarrierPopup({
        queryParams: {
            P_CARRIER_CD: CARRIER_CD,
            P_CARRIER_DIV: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onQCarrierPopup, function() {
        $NC.setFocus("#edtQCarrier_Cd", true);
    });
}

function onQCarrierPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQCarrier_Cd", resultInfo.CARRIER_CD);
        $NC.setValue("#edtQCarrier_Nm", resultInfo.CARRIER_NM);
    } else {
        $NC.setValue("#edtQCarrier_Cd");
        $NC.setValue("#edtQCarrier_Nm");
    }
    onChangingCondition();
}

function showCarrierPopup() {

    var CARRIER_CD = $NC.getValue("#edtCarrier_Cd");
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

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtCarrier_Cd", resultInfo.CARRIER_CD);
        $NC.setValue("#edtCarrier_Nm", resultInfo.CARRIER_NM);

        rowData.CARRIER_CD = resultInfo.CARRIER_CD;
        rowData.CARRIER_NM = resultInfo.CARRIER_NM;

    } else {
        $NC.setValue("#edtCarrier_Cd");
        $NC.setValue("#edtCarrier_Nm");

        rowData.CARRIER_CD = "";
        rowData.CARRIER_NM = "";

    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);

    $NC.setFocus("#edtCarrier_Cd", true);
}

/**
 * 검색조건의 우편번호 검색 이미지 클릭
 */
function showPostPopup() {

    $NP.showPostPopup({
        P_ADDR_NM: $ND.C_ALL
    }, onPostPopup, function() {
    });
}

/**
 * 우편번호 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onPostPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtZip_Cd", resultInfo.ZIP_CD);
        $NC.setValue("#edtAddr_Basic", resultInfo.ADDR_NM_REAL);

        rowData.ZIP_CD = resultInfo.ZIP_CD;
        rowData.ADDR_BASIC = resultInfo.ADDR_NM_REAL;
    } else {
        $NC.setValue("#edtZip_Cd");
        $NC.setValue("#edtAddr_Basic");

        rowData.ZIP_CD = "";
        rowData.ADDR_BASIC = "";
    }
    $NC.setValue("#edtGeocode_Lat");
    $NC.setValue("#edtGeocode_Lng");
    $NC.setEnable("#btnGetCoord");

    rowData.GEOCODE_LAT = "";
    rowData.GEOCODE_LNG = "";

    $NC.setFocus("#edtAddr_Detail", true);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}
function btnZipCdClearOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNull(rowData.ZIP_CD) //
        && $NC.isNull(rowData.ADDR_BASIC) //
        && $NC.isNull(rowData.ADDR_DETAIL)) {
        $NC.setFocus("#edtAddr_Detail");
        return;
    }

    $NC.setValue("#edtZip_Cd");
    $NC.setValue("#edtAddr_Basic");
    $NC.setValue("#edtAddr_Detail");
    $NC.setValue("#edtGeocode_Lat");
    $NC.setValue("#edtGeocode_Lng");
    $NC.setFocus("#edtAddr_Detail");
    $NC.setEnable("#btnGetCoord");

    rowData.ZIP_CD = "";
    rowData.ADDR_BASIC = "";
    rowData.ADDR_DETAIL = "";
    rowData.GEOCODE_LAT = "";
    rowData.GEOCODE_LNG = "";

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

// 기본주소를 기준으로 좌표계산 후 입력 처리
function btnGetCoordOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if ($NC.isNull(rowData.ADDR_BASIC)) {
        alert($NC.getDisplayMsg("JS.CMC02020E0.018", "주소 정보가 등록되어 있지 않습니다."));
        return;
    }

    var checkedValue = [
        {
            P_CAR_CD: rowData.CAR_CD
        }
    ];

    var serviceParams = {
        P_TABLE_NM: "DUMMY",
        P_ADDR_BASIC: rowData.ADDR_BASIC
    };

    $NC.serviceCall("/CMC02020E0/callGetCoordinate.do", {
        P_CHECKED_VALUE: checkedValue,
        P_SERVICE_PARAMS: serviceParams,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }

        var geocodeLat = resultData.O_GEOCODE_LAT; // 위도
        var geocodeLng = resultData.O_GEOCODE_LNG; // 경도

        $NC.setValue("#edtGeocode_Lat", geocodeLat);
        $NC.setValue("#edtGeocode_Lng", geocodeLng);

        rowData.GEOCODE_LAT = geocodeLat;
        rowData.GEOCODE_LNG = geocodeLng;

        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData);
        $NC.setEnable("#btnGetCoord", false);
    });
}

function btnEntryCoordOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC02020E0.019", "처리할 데이터가 없습니다."));
        return;
    }

    if ($NC.isGridModified(G_GRDMASTER)) {
        alert($NC.getDisplayMsg("JS.CMC02020E0.020", "데이터가 변경되었습니다. 저장 후 처리하십시오."));
        return;
    }

    var rowData;
    var dsMaster = [];
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);

        // 기본주소가 null이거나 좌표가 등록되어 있으면 처리 대상이 아님
        if ($NC.isNull(rowData.ADDR_BASIC) //
            || ($NC.isNotNull(rowData.GEOCODE_LAT) //
                && $NC.isNotNull(rowData.GEOCODE_LNG))) {
            continue;
        }

        dsMaster.push(rowData);
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC02020E0.021", "등록 가능한 데이터가 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC02021P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC02021P0.001", "좌표일괄등록"),
        url: "cm/CMC02021P0.html",
        width: 800,
        height: 500,
        G_PARAMETER: {
            P_MASTER_DS: dsMaster,
            P_PROGRAM_ID: $NC.G_VAR.G_PARAMETER.PROGRAM_ID
        },
        onOk: function() {
            onSave();
        }
    });
}
/**
 * CBM 계산
 */
function getCapacityCbm() {

    var width = $NC.getValue("#edtCapacity_Width");
    var height = $NC.getValue("#edtCapacity_Height");
    var length = $NC.getValue("#edtCapacity_Length");

    var cbm = (width * length * height) / 1000000000;
    $NC.setValue("#edtCapacity_Cbm", cbm);
    return cbm;
}
/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnable("#btnEntryCoord", permission.canSave && enable);
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // 좌표검색 API 사용 정책 (0:사용안함, 1:네이버API사용)
        if ($NC.G_VAR.policyVal.CM710 == "0") {
            $("#btnEntryCoord").hide();
            $("#btnGetCoord").hide();
            $("#coordGroupRow").hide();
            $("#lblGeocode_Lat").hide();
            $("#edtGeocode_Lat").hide();
            $("#lblGeocode_Lng").hide();
            $("#edtGeocode_Lng").hide();
        } else {
            $("#btnEntryCoord").show();
            $("#btnGetCoord").show();
            $("#coordGroupRow").show();
            $("#lblGeocode_Lat").show();
            $("#edtGeocode_Lat").show();
            $("#lblGeocode_Lng").show();
            $("#edtGeocode_Lng").show();
        }
        // 컬럼 표시 조정
        grdMasterOnSetColumns();

        $NC.onGlobalResize();
    });
}