/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOM07050E0
 *  프로그램명         : 운송장수동관리
 *  프로그램설명       : 운송장수동관리 화면 Javascript
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
        autoResizeView: function() {
            return {
                container: "#ctrMasterView",
                grids: $NC.getTabActiveIndex("#ctrMasterView") == 0 ? "#grdT1Master" : null
            };
        },
        autoResizeFixedView: function() {
            if ($NC.getTabActiveIndex("#ctrMasterView") == 1) {
                return {
                    viewFirst: {
                        container: "#ctrLeftView",
                        grids: "#grdT2Master"
                    },
                    viewSecond: {
                        container: "#ctrRightView"
                    },
                    viewType: "h",
                    viewFixed: {
                        container: "viewSecond",
                        size: 500
                    }
                };
            }
        },
        // 체크할 정책 값
        policyVal: {
            CM530: "", // [택배일반]운송장번호관리정책
            LO440: "" // 출고 스캔검수 기본택배사
        }
    });

    // 그리드 초기화
    grdT1MasterInitialize();
    grdT2MasterInitialize();

    // 탭 초기화
    $NC.setInitTab("#ctrMasterView", {
        tabIndex: 0,
        onActivate: tabOnActivate
    });

    // 초기 숨김 처리
    $NC.setVisible("#ctrQT2_Outbound_Date", false);
    $NC.setVisible("#ctrQT2_Wb_No", false);
    $NC.setEnableGroup("#ctrAdditional_grdT1Master", false); // 현재 지원 포맷이 CJ만 가능하므로 정책으로 세팅, 변경불가
    $NC.setEnableGroup("#ctrAdditional_grdT2Master", false); // 현재 지원 포맷이 CJ만 가능하므로 정책으로 세팅, 변경불가
    $NC.setEnableGroup("#ctrT2MasterInfoView", false);

    // 조회조건 - 출고일자 초기화
    $NC.setInitDatePicker("#dtpQOutbound_Date");
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2");

    // 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    // 버튼 이벤트 바인딩
    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnT1_Carrier_Cd").click(showWbBasePopupT1);
    $("#btnT2_Carrier_Cd").click(showWbBasePopupT2);
    $("#btnExcelDownload").click(btnExcelDownloadOnClick);

    // 조회조건 - 물류센터 세팅
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
            setPolicyValInfo();
        }
    });

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

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

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            setPolicyValInfo();
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "DELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: "92", // 92 - 온라인몰
                P_VIEW_DIV: "2"
            }, onDeliveryPopup, {
                title: $NC.getDisplayMsg("JS.LOM07050E0.001", "온라인몰 검색"),
                columnTitle: [
                    "온라인몰코드",
                    "온라인몰명"
                ],
                errorMessage: $NC.getDisplayMsg("JS.LOM07050E0.002", "등록되어 있지 않은 온라인몰입니다.")
            });
            return;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOM07050E0.003", "출고일자를 정확히 입력하십시오."));
            break;
    }

    onChangingCondition();
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "T1_CARRIER_CD":
            $NP.onWbBaseChange(val, {
                P_CARRIER_CD: val,
                P_CUST_CD: $NC.G_VAR.policyVal.CM530 == "1" ? $ND.C_BASE_CUST_CD : $NC.getValue("#edtQCust_Cd"), // 고객사[택배기준]
                P_ATTR05_CD: "2" // 2 - B2C
            }, onWbBasePopupT1);
            return;
        case "T2_CARRIER_CD":
            $NP.onWbBaseChange(val, {
                P_CARRIER_CD: val,
                P_CUST_CD: $NC.G_VAR.policyVal.CM530 == "1" ? $ND.C_BASE_CUST_CD : $NC.getValue("#edtQCust_Cd"), // 고객사[택배기준]
                P_ATTR05_CD: "2" // 2 - B2C
            }, onWbBasePopupT2);
            return;
        case "T2_WB_NO":
            grdT2MasterOnCellChange(e, {
                view: view,
                col: id,
                val: val
            });
            break;
    }
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT2MASTER);
    $NC.setEnableGroup("#ctrT2MasterInfoView", false);
    grdT2MasterOnInputValue();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_NO;
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_NO;

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07050E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07050E0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);
    var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var SHIPPER_TEL = $NC.getValue("#edtQShipper_Tel", true);
    var SHIPPER_HP = $NC.getValue("#edtQShipper_Hp", true);
    var SHIPPER_ZIP_CD = $NC.getValue("#edtQShipper_Zip_Cd", true);
    var SHIPPER_ADDR = $NC.getValue("#edtQShipper_Addr", true);

    // 운송장수동발행 엑셀다운로드 조회
    if ($NC.getTabActiveIndex("#ctrMasterView") == 0) {
        var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
        if ($NC.isNull(OUTBOUND_DATE)) {
            alert($NC.getDisplayMsg("JS.LOM07050E0.006", "출고일자를 입력하십시오."));
            $NC.setFocus("#dtpQOutbound_Date");
            return;
        }

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT1MASTER);
        G_GRDT1MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_SHIPPER_NM: SHIPPER_NM,
            P_ORDERER_NM: ORDERER_NM,
            P_BU_NO: BU_NO,
            P_SHIPPER_TEL: SHIPPER_TEL,
            P_SHIPPER_HP: SHIPPER_HP,
            P_SHIPPER_ZIP_CD: SHIPPER_ZIP_CD,
            P_SHIPPER_ADDR: SHIPPER_ADDR,
            P_DELIVERY_CD: DELIVERY_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LOM07050E0/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    }
    // 운송장번호 수동등록 조회
    else {
        var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
        if ($NC.isNull(OUTBOUND_DATE1)) {
            alert($NC.getDisplayMsg("JS.LOM07050E0.007", "출고 시작 일자를 입력하십시오."));
            $NC.setFocus("#dtpQOutbound_Date1");
            return;
        }
        var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
        if ($NC.isNull(OUTBOUND_DATE2)) {
            alert($NC.getDisplayMsg("JS.LOM07050E0.008", "출고 종료 일자를 입력하십시오."));
            $NC.setFocus("#dtpQOutbound_Date2");
            return;
        }

        var WB_NO = $NC.getValue("#edtQWb_No", true);

        // 조회시 전역 변수 값 초기화
        $NC.setInitGridVar(G_GRDT2MASTER);
        $NC.setEnableGroup("#ctrT2MasterInfoView", false);
        grdT2MasterOnInputValue();

        // 운송장번호 수동등록 조회
        G_GRDT2MASTER.queryParams = {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2,
            P_SHIPPER_NM: SHIPPER_NM,
            P_ORDERER_NM: ORDERER_NM,
            P_WB_NO: WB_NO,
            P_BU_NO: BU_NO,
            P_SHIPPER_TEL: SHIPPER_TEL,
            P_SHIPPER_HP: SHIPPER_HP,
            P_SHIPPER_ZIP_CD: SHIPPER_ZIP_CD,
            P_SHIPPER_ADDR: SHIPPER_ADDR,
            P_DELIVERY_CD: DELIVERY_CD
        };
        // 데이터 조회
        $NC.serviceCall("/LOM07050E0/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    }

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

    if ($NC.getTabActiveIndex("#ctrMasterView") != 1) {
        return;
    }

    if (G_GRDT2MASTER.data.getItems().length == 0) {
        alert($NC.getDisplayMsg("JS.LOM07050E0.009", "저장할 데이터가 없습니다."));
        setFocusScan();
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDT2MASTER)) {
        setFocusScan();
        return;
    }

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDT2MASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDT2MASTER.data.getItem(rIndex);
        if (rowData.CRUD != $ND.C_DV_CRUD_U) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_WB_NO: rowData.WB_NO,
            P_CARRIER_CD: rowData.CARRIER_CD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM07050E0.010", "데이터 수정 후 저장하십시오."));
        setFocusScan();
        return;
    }

    $NC.serviceCall("/LOM07050E0/callLOWBNoManualUpdate.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveT2, onSaveErrorT2);
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

    if ($NC.getTabActiveIndex("#ctrMasterView") == 0) {
        $NC.setVisible("#ctrQT1_Outbound_Date");
        $NC.setVisible("#ctrQT2_Outbound_Date", false);
        $NC.setVisible("#ctrQT2_Wb_No", false);

        // 공통 버튼 활성화 처리
        $NC.setInitTopButtons();
    } else {
        $NC.setVisible("#ctrQT1_Outbound_Date", false);
        $NC.setVisible("#ctrQT2_Outbound_Date");
        $NC.setVisible("#ctrQT2_Wb_No");

        // 공통 버튼 활성화 처리
        if ($NC.G_VAR.T2_INQUIRY_YN == $ND.C_YES) {
            $NC.G_VAR.buttons._inquiry = "1";
            $NC.G_VAR.buttons._new = "0";
            $NC.G_VAR.buttons._save = "1";
            $NC.G_VAR.buttons._cancel = "0";
            $NC.G_VAR.buttons._delete = "0";
            $NC.G_VAR.buttons._print = "0";

            $NC.setInitTopButtons($NC.G_VAR.buttons);
        }
    }
    $NC.onGlobalResize();

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function grdT1MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
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
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "수령자전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL"),
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "수령자핸드폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL"),
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ZIP_CD",
        field: "SHIPPER_ZIP_CD",
        name: "수령자우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "수령자주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_INFO",
        field: "ITEM_INFO",
        name: "상품정보",
        minWidth: 250
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 운송장내역 탭의 그리드 초기화
 */
function grdT1MasterInitialize() {

    var options = {
        frozenColumn: 6
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT1Master", {
        columns: grdT1MasterOnGetColumns(),
        queryId: "LOM07050E0.RS_T1_MASTER",
        sortCol: "OUTBOUND_NO",
        gridOptions: options
    });

    G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

/**
 * 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT1MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT1MASTER, row + 1);
}

function grdT2MasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_CD",
        field: "CARRIER_CD",
        name: "운송사"
    });
    $NC.setGridColumn(columns, {
        id: "CARRIER_NM",
        field: "CARRIER_NM",
        name: "운송사명"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_DATE",
        field: "OUTBOUND_DATE",
        name: "출고일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_NO",
        field: "OUTBOUND_NO",
        name: "출고번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM")
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "수령자전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL"),
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "수령자핸드폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL"),
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ZIP_CD",
        field: "SHIPPER_ZIP_CD",
        name: "수령자우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "수령자주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS")
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_INFO",
        field: "ITEM_INFO",
        name: "상품정보",
        minWidth: 250
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명"
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter"
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

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 주소정제 오류내역 탭의 그리드 초기화
 */
function grdT2MasterInitialize() {

    var options = {
        frozenColumn: 7,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.OUTBOUND_STATE >= $ND.C_STATE_CONFIRM) {
                    return "styError";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdT2Master", {
        columns: grdT2MasterOnGetColumns(),
        queryId: "LOM07050E0.RS_T2_MASTER",
        sortCol: "OUTBOUND_NO",
        gridOptions: options
    });

    G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT2MasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDT2MASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDT2MASTER.data.getItem(row);

    if (rowData.OUTBOUND_STATE >= $ND.C_STATE_CONFIRM) {
        $NC.setEnableGroup("#ctrT2MasterInfoView", false);
        grdT2MasterOnInputValue();
    } else {
        $NC.setEnableGroup("#ctrT2MasterInfoView");
        grdT2MasterOnInputValue(rowData);
    }

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDT2MASTER, row + 1);
}

function grdT2MasterOnCellChange(e, args) {

    var rowData = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "T2_WB_NO":
            rowData.WB_NO = args.val;
            if ($NC.isNull(rowData.WB_NO)) {
                rowData.CARRIER_CD = null;
                rowData.CARRIER_NM = null;
            } else {
                rowData.CARRIER_CD = $NC.getValue("#edtT2_Carrier_Cd");
                rowData.CARRIER_NM = $NC.getValue("#edtT2_Carrier_Nm");
            }
            $NC.setFocus(args.view);
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDT2MASTER, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdT2MasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDT2MASTER, row)) {
        return true;
    }
    var rowData = G_GRDT2MASTER.data.getItem(row);

    // 신규 데이터 업데이트, N -> C, 일반 데이터 강제 업데이트
    $NC.setGridApplyPost(G_GRDT2MASTER, rowData, true);
    return true;
}

function grdT2MasterOnInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtT2_Outbound_Date", rowData["OUTBOUND_DATE"]);
    $NC.setValue("#edtT2_Outbound_No", rowData["OUTBOUND_NO"]);
    $NC.setValue("#edtT2_Bu_Date", rowData["BU_DATE"]);
    $NC.setValue("#edtT2_Bu_No", rowData["BU_NO"]);
    $NC.setValue("#edtT2_Delivery_Cd", rowData["DELIVERY_CD"]);
    $NC.setValue("#edtT2_Delivery_Nm", rowData["DELIVERY_NM"]);
    $NC.setValue("#edtT2_Orderer_Nm", rowData["ORDERER_NM"]);
    $NC.setValue("#edtT2_Shipper_Nm", rowData["SHIPPER_NM"]);
    $NC.setValue("#edtT2_Shipper_Hp", rowData["SHIPPER_HP"]);
    $NC.setValue("#edtT2_Shipper_Tel", rowData["SHIPPER_TEL"]);
    $NC.setValue("#edtT2_Shipper_Addr", rowData["SHIPPER_ADDR"]);
    $NC.setValue("#edtT2_Item_Info", rowData["ITEM_INFO"]);
    $NC.setValue("#edtT2_Wb_No", rowData["WB_NO"]);

    if ($NC.isNotNull(rowData["OUTBOUND_NO"])) {
        $NC.setFocus("#edtT2_Wb_No");
    }
}

/**
 * 조회버튼 클릭후 그리드에 데이터 표시처리
 */
function onGetT1Master(ajaxData) {

    $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT1MASTER);

    // 공통버튼 초기화
    $NC.setInitTopButtons();
    $NC.G_VAR.T1_INQUIRY_YN = $ND.C_YES;

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 조회버튼 클릭후 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

    $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDT2MASTER, [
        "OUTBOUND_DATE",
        "OUTBOUND_NO"
    ]);

    // 공통버튼 초기화
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    $NC.G_VAR.T2_INQUIRY_YN = $ND.C_YES;

    // 프로그램 사용 권한 설정
    setUserProgramPermission();
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

function onUserBuPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
        $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
        $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setValue("#edtQCust_Cd");
        $NC.setFocus("#edtQBu_Cd", true);
    }

    onChangingCondition();
    setPolicyValInfo();
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    }, function() {
        var O_RESULT_DATA = $NP.getWbBaseInfo({
            queryParams: {
                P_CARRIER_CD: $NC.G_VAR.policyVal.LO440,
                P_CUST_CD: $NC.G_VAR.policyVal.CM530 == "1" ? $ND.C_BASE_CUST_CD : $NC.getValue("#edtQCust_Cd"), // 고객사[택배기준]
                P_ATTR05_CD: "2" // 2 - B2C
            }
        });

        onWbBasePopupT1(O_RESULT_DATA[0]);
        onWbBasePopupT2(O_RESULT_DATA[0]);
    });
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSaveT2(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        // return;
        // 개별 트랜젝션 처리라 메시지 보이고 다시 조회
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "OUTBOUND_NO"
        ]
    });
    _Inquiry();
    G_GRDT2MASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장시 에러 발생 했을 경우 처리
 * 
 * @param ajaxData
 */
function onSaveErrorT2(ajaxData) {

    $NC.onError(ajaxData);

    // 운송장번호 포커스
    setFocusScan();
}

function showDeliveryPopup() {

    $NP.showDeliveryPopup({
        title: $NC.getDisplayMsg("JS.LOM07050E0.001", "온라인몰 검색"),
        columnTitle: [
            "온라인몰코드",
            "온라인몰명"
        ],
        queryParams: {
            P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: "92", // 92 - 온라인몰
            P_VIEW_DIV: "2"
        }
    }, onDeliveryPopup, function() {
        $NC.setFocus("#edtQDelivery_Cd", true);
    });
}

function onDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQDelivery_Cd");
        $NC.setValue("#edtQDelivery_Nm");
        $NC.setFocus("#edtQDelivery_Cd", true);
    }
    onChangingCondition();
}

function btnExcelDownloadOnClick() {

    var HDC_DIV = $NC.getValue("#edtT1_Hdc_Div");
    if (HDC_DIV != "C2") {
        alert($NC.getDisplayMsg("JS.LOM07050E0.011", "정의된 엑셀다운로드는 택배사구분이 [C2 - CJ대한통운B2C]만 가능합니다."));
        $NC.setFocus("#edtT1_Carrier_Cd");
        return;
    }
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07050E0.004", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07050E0.005", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LOM07050E0.006", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);
    var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var SHIPPER_TEL = $NC.getValue("#edtQShipper_Tel", true);
    var SHIPPER_HP = $NC.getValue("#edtQShipper_Hp", true);
    var SHIPPER_ZIP_CD = $NC.getValue("#edtQShipper_Zip_Cd", true);
    var SHIPPER_ADDR = $NC.getValue("#edtQShipper_Addr", true);

    var dsColumns;
    switch (HDC_DIV) {
        case "C2": // CJ대한통운B2C
            dsColumns = [
                {
                    P_COLUMN_NM: "SHIPPER_NM",
                    P_COLUMN_TITLE: "받는분성명",
                    P_COLUMN_WIDTH: 20
                },
                {
                    P_COLUMN_NM: "SHIPPER_HP",
                    P_COLUMN_TITLE: "받는분전화번호",
                    P_COLUMN_WIDTH: 20
                },
                {
                    P_COLUMN_NM: "SHIPPER_TEL",
                    P_COLUMN_TITLE: "받는분기타연락처",
                    P_COLUMN_WIDTH: 20
                },
                {
                    P_COLUMN_NM: "SHIPPER_ADDR",
                    P_COLUMN_TITLE: "받는분주소(전체, 분할)",
                    P_COLUMN_WIDTH: 30
                },
                {
                    P_COLUMN_NM: "ITEM_INFO",
                    P_COLUMN_TITLE: "품목명",
                    P_COLUMN_WIDTH: 30
                },
                {
                    P_COLUMN_NM: "BOX_TYPE_DIV",
                    P_COLUMN_TITLE: "박스타입",
                    P_COLUMN_WIDTH: 15
                },
                {
                    P_COLUMN_NM: "BOX_CNT",
                    P_COLUMN_TITLE: "박스수량",
                    P_COLUMN_WIDTH: 15
                },
                {
                    P_COLUMN_NM: "SHIP_COST",
                    P_COLUMN_TITLE: "기본운임",
                    P_COLUMN_WIDTH: 15
                },
                {
                    P_COLUMN_NM: "SHIP_COST_DIV",
                    P_COLUMN_TITLE: "운임구분",
                    P_COLUMN_WIDTH: 15
                },
                {
                    P_COLUMN_NM: "ORDERER_MSG",
                    P_COLUMN_TITLE: "배송메세지1",
                    P_COLUMN_WIDTH: 30
                },
                {
                    P_COLUMN_NM: "ORDERER_MSG2",
                    P_COLUMN_TITLE: "배송메세지2",
                    P_COLUMN_WIDTH: 30
                }
            ];
            break;
    }

    // 엑셀 다운로드
    $NC.excelFileDownload({
        P_QUERY_ID: "LOM07050E0.RS_T1_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_SHIPPER_NM: SHIPPER_NM,
            P_ORDERER_NM: ORDERER_NM,
            P_BU_NO: BU_NO,
            P_SHIPPER_TEL: SHIPPER_TEL,
            P_SHIPPER_HP: SHIPPER_HP,
            P_SHIPPER_ZIP_CD: SHIPPER_ZIP_CD,
            P_SHIPPER_ADDR: SHIPPER_ADDR,
            P_DELIVERY_CD: DELIVERY_CD
        },
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "운송장수동발행", // 엑셀시트 타이틀
            P_EXPORT_TYPE: "1" // 컬럼정보에 있는 항목만 Export 하기 위해 데이터셋이 아닌 그리드로 처리
        },
        P_COLUMN_INFO: dsColumns
    });
}

/**
 * 검색조건의 운송사 검색 이미지 클릭
 */
function showWbBasePopupT1() {

    $NP.showWbBasePopup({
        queryParams: {
            P_CARRIER_CD: $ND.C_ALL,
            P_CUST_CD: $NC.G_VAR.policyVal.CM530 == "1" ? $ND.C_BASE_CUST_CD : $NC.getValue("#edtQCust_Cd"), // 고객사[택배기준]
            P_ATTR05_CD: "2" // 2 - B2C
        }
    }, onWbBasePopupT1, function() {
        $NC.setFocus("#edtT1_Carrier_Cd", true);
    });
}

/**
 * 운송사 검색 결과
 * 
 * @param resultInfo
 */
function onWbBasePopupT1(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtT1_Carrier_Cd", resultInfo.CARRIER_CD);
        $NC.setValue("#edtT1_Carrier_Nm", resultInfo.CARRIER_NM);
        $NC.setValue("#edtT1_Hdc_Div", resultInfo.HDC_DIV);
    } else {
        $NC.setValue("#edtT1_Carrier_Cd");
        $NC.setValue("#edtT1_Carrier_Nm");
        $NC.setValue("#edtT1_Hdc_Div");
        $NC.setFocus("#edtT1_Carrier_Cd", true);
    }
}

/**
 * 검색조건의 운송사 검색 이미지 클릭
 */
function showWbBasePopupT2() {

    $NP.showWbBasePopup({
        queryParams: {
            P_CARRIER_CD: $ND.C_ALL,
            P_CUST_CD: $NC.G_VAR.policyVal.CM530 == "1" ? $ND.C_BASE_CUST_CD : $NC.getValue("#edtQCust_Cd"), // 고객사[택배기준]
            P_ATTR05_CD: "2" // 2 - B2C
        }
    }, onWbBasePopupT2, function() {
        $NC.setFocus("#edtT2_Carrier_Cd", true);
    });
}

/**
 * 운송사 검색 결과
 * 
 * @param resultInfo
 */
function onWbBasePopupT2(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtT2_Carrier_Cd", resultInfo.CARRIER_CD);
        $NC.setValue("#edtT2_Carrier_Nm", resultInfo.CARRIER_NM);
        $NC.setValue("#edtT2_Hdc_Div", resultInfo.HDC_DIV);
    } else {
        $NC.setValue("#edtT2_Carrier_Cd");
        $NC.setValue("#edtT2_Carrier_Nm");
        $NC.setValue("#edtT2_Hdc_Div");
        $NC.setFocus("#edtT2_Carrier_Cd", true);
    }
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    if ($NC.getTabActiveIndex("#ctrMasterView") == 0) {
        $NC.setEnableButton("#ctrTitleBar_grdT1Master", G_GRDT1MASTER.data.getLength() > 0);
    } else {
        $NC.setEnableButton("#ctrTitleBar_grdT2Master", G_GRDT2MASTER.data.getLength() > 0);
    }
}

/**
 * 운송장번호에 포커스 처리
 * 
 * @returns
 */
function setFocusScan() {

    var $view = $NC.getView("#edtT2_Wb_No");
    if ($NC.isEnable($view)) {
        $NC.setFocus($view);
    }
}