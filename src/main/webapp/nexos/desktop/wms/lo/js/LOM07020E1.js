/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOM07020E1
 *  프로그램명         : 운송장내역(의류)
 *  프로그램설명       : 운송장내역(의류) 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-07-20
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2020-07-20    ASETEC           신규작성
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
                container: "#divMasterView",
                grids: [
                    "#grdMaster",
                    "#grdDetail"
                ]
            };
        },
        // 체크할 정책 값
        policyVal: {
            LO450: "", // 송장 공급자 표시 기준
            LS210: "", // 재고 관리 기준
            RI190: "", // 공급금액 계산정책
            RI240: "" // 반입 기본 상품상태 기준
        }
    });

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();

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
            setOutboundBatchCombo();
        }
    });

    // 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnQOutbound_Batch").click(function() {
        // 차수 새로고침
        setOutboundBatchCombo();

        onChangingCondition();
    });

    $("#btnExcelDownload").click(btnExcelDownloadOnClick);
    $("#btnWBDeliveryInfo").click(btnWBDeliveryInfoOnClick);
    $("#btnCreateReturn").click(btnCreateReturnOnClick); // 반품요청

    // 출고일자에 달력이미지 설정
    $NC.setInitDateRangePicker("#dtpQOutbound_Date1", "#dtpQOutbound_Date2");

    setReportInfo();
    setTopButtons();
    setFocus();

    $NC.setTooltip("#btnExcelDownload", "사방넷주문번호, 운송장번호\n엑셀 다운로드");
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

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

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            setPolicyValInfo();
            setOutboundBatchCombo();
            break;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "OUTBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOM07020E1.001", "검색 출고 시작 일자를 정확히 입력하십시오."));
            setOutboundBatchCombo();
            break;
        case "OUTBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOM07020E1.002", "검색 출고 종료 일자를 정확히 입력하십시오."));
            break;
        case "DELIVERY_CD":
            var CUST_CD = $NC.getValue("#edtQCust_Cd");
            if ($NC.isNull(CUST_CD)) {
                alert($NC.getDisplayMsg("JS.LOM07020E1.003", "사업부를 먼저 선택 하십시오."));
                $NC.setValue("#edtQDelivery_Cd");
                $NC.setFocus("#edtQBu_Cd");
                return;
            }
            $NP.onDeliveryChange(val, {
                P_CUST_CD: CUST_CD,
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: "92", // 92 - 온라인몰
                P_VIEW_DIV: "2"
            }, onDeliveryPopup, {
                title: $NC.getDisplayMsg("JS.LOM07020E1.004", "온라인몰 검색"),
                columnTitle: [
                    "온라인몰코드",
                    "온라인몰명"
                ],
                errorMessage: $NC.getDisplayMsg("JS.LOM07020E1.005", "등록되어 있지 않은 온라인몰입니다.")
            });
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
    $NC.clearGridData(G_GRDDETAIL);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry(scanVal) {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.006", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);
    // if ($NC.isNull(BU_CD)) {
    // alert($NC.getDisplayMsg("JS.LOM07020E0.007", "사업부를 입력하십시오."));
    // $NC.setFocus("#edtQBu_Cd");
    // return;
    // }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.008", "출고 시작 일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }
    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.009", "출고 종료 일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);
    var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
    var WB_NO;
    if ($NC.isNull(scanVal)) {
        WB_NO = $NC.getValue("#edtQWb_No", true);
    } else {
        WB_NO = scanVal;
    }

    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var SHIPPER_TEL = $NC.getValue("#edtQShipper_Tel", true);
    var SHIPPER_HP = $NC.getValue("#edtQShipper_Hp", true);
    var SHIPPER_ZIP_CD = $NC.getValue("#edtQShipper_Zip_Cd", true);
    var SHIPPER_ADDR = $NC.getValue("#edtQShipper_Addr", true);
    var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    $NC.setInitGridVar(G_GRDDETAIL);
    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE1: OUTBOUND_DATE1,
        P_OUTBOUND_DATE2: OUTBOUND_DATE2,
        P_OUTBOUND_BATCH: OUTBOUND_BATCH,
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
    $NC.serviceCall("/LOM07020E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    var rCount = G_GRDMASTER.data.getLength();
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.010", "조회 후 처리하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.LOM07020E1.011", "선택한 운송장 번호를 삭제 하시겠습니까?"))) {
        return;
    }

    var dsMaster = [];
    var checkedCount = 0;
    var rowData;
    for (var rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CHECK_YN != $ND.C_YES) {
            continue;
        }
        checkedCount++;
        // 추가발행 대상 및 CJ대한통운 인터페이스 송신 전 데이터만 삭제 가능
        if (rowData.ADD_YN != $ND.C_YES || rowData.SEND_STATE != $ND.C_BASE_STATE) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_BOX_NO: rowData.BOX_NO,
            P_CRUD: $ND.C_DV_CRUD_D
        });
    }
    if (checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.012", "운송장 번호 삭제 처리할 데이터를 선택하십시오."));
        return;
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.013", "선택한 데이터 중 삭제 처리 가능한 운송장 번호가 없습니다."));
        return;
    }

    $NC.serviceCall("/LOM07020E0/delete.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
        G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.006", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.007", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var checkedData;
    var queryParams;
    switch (reportInfo.REPORT_CD) {
        // LABEL_LOM02 - 택배송장(CJ대한통운)
        // LABEL_LOM04 - 택배송장(우체국)
        case "LABEL_LOM02":
        case "LABEL_LOM04":
            // checkedValues 외 쿼리 파라메터 세팅
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
                valueColumns: function(rowData) {
                    return rowData.OUTBOUND_DATE + ";" + rowData.OUTBOUND_NO + ";" + rowData.BOX_NO;
                }
            });
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_POLICY_LO450: $NC.G_VAR.policyVal.LO450
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

    // 송장 출력 완료 후 출력 횟수 업데이트 처리
    if (reportInfo.REPORT_CD == "LABEL_LOM04" || reportInfo.REPORT_CD == "LABEL_LOM02") {
        printOptions.onAfterPrint = function() {
            for (var i = 0; i < checkedData.values.length; i++) {
                var callParams = checkedData.values[i].split(";");
                $NC.serviceCall("/LOM07020E0/callSetWbNoPrintCntUpdate.do", {
                    P_CENTER_CD: CENTER_CD,
                    P_BU_CD: BU_CD,
                    P_OUTBOUND_DATE: callParams[0],
                    P_OUTBOUND_NO: callParams[1],
                    P_BOX_NO: callParams[2],
                    P_USER_ID: $NC.G_USERINFO.USER_ID
                }, onSetWbNoPrintCntUpdate);
            }
        };
    }

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);
}

/**
 * Key Up Event
 * 
 * @param e
 * @param view
 */
function _OnInputKeyUp(e, view) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "WB_NO":
            // TAB Key 무시
            if (e.keyCode == 9) {
                e.stopImmediatePropagation();
                return;
            }

            // Enter Key
            if (e.keyCode != 13) {
                break;
            }
            var scanVal = $NC.getValue(view);
            var scanLen = scanVal.length;
            if (scanLen == 0) {
                e.stopImmediatePropagation();
                $NC.setFocus("#edtQWb_No");
                return;
            }

            // 대문자로 변환 ????????????????
            scanVal = scanVal.toUpperCase();

            _Inquiry(scanVal);

            e.stopImmediatePropagation();
            return;
    }
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
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
        editor: Slick.Editors.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "WB_NO",
        field: "WB_NO",
        name: "운송장번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
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
    // $NC.setGridColumn(columns, {
    // id: "ADD_YN",
    // field: "ADD_YN",
    // name: "추가발행",
    // cssClass: "styCenter",
    // formatter: Slick.Formatters.CheckBox
    // });
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
        id: "OUTBOUND_BATCH",
        field: "OUTBOUND_BATCH",
        name: "출고차수",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "OUTBOUND_STATE_D",
        field: "OUTBOUND_STATE_D",
        name: "출고상태",
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
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "몰메시지"
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_MSG",
        field: "ORDERER_MSG",
        name: "배송메시지"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 운송장내역 탭의 그리드 초기화
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 2
    // specialRow: {
    // compareFn: function(specialRow, rowData, column, row, cell, colspan) {
    // if (rowData.ADD_YN == $ND.C_YES) {
    // return "stySpecial";
    // }
    // }
    // }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LOM07020E1.RS_MASTER",
        sortCol: "OUTBOUND_NO",
        gridOptions: options
    // canDblClick: true
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
    // G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
    G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);

    $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

/**
 * 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
        data: null
    });

    var rowData = G_GRDMASTER.data.getItem(row);
    G_GRDDETAIL.queryParams = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
        P_RDELIVERY_CD: rowData.RDELIVERY_CD,
        P_WB_NO: rowData.WB_NO
    };
    // 데이터 조회
    $NC.serviceCall("/LOM07020E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);

}

// function grdMasterOnDblClick(e, args) {
//
// var permission = $NC.getProgramPermission();
// if (!permission.canSave) {
// alert($NC.getDisplayMsg("JS.LOM07020E1.014", "해당 프로그램의 저장권한이 없습니다."));
// return;
// }
//
// var rowData = G_GRDMASTER.data.getItem(args.row);
// if ($NC.isNull(rowData)) {
// return;
// }
//
// $NC.showProgramSubPopup({
// PROGRAM_ID: "LOM07021P0",
// PROGRAM_NM: $NC.getDisplayMsg("JS.LOM07021P0.001", "운송장 상품내역"),
// url: "lo/LOM07021P0.html",
// width: 870,
// height: 450,
// G_PARAMETER: {
// P_CENTER_CD: rowData.CENTER_CD,
// P_BU_CD: rowData.BU_CD,
// P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
// P_OUTBOUND_NO: rowData.OUTBOUND_NO,
// P_BOX_NO: rowData.BOX_NO,
// P_WB_NO: rowData.WB_NO,
// P_CARRIER_CD: rowData.CARRIER_CD,
// P_CARRIER_NM: rowData.CARRIER_NM,
// P_PERMISSION: permission
// },
// onOk: function() {
// $NC.setValue("#edtQOrderer_Nm", rowData.ORDERER_NM);
// $NC.setValue("#edtQShipper_Nm", rowData.SHIPPER_NM);
// setTimeout(function() {
// _Inquiry();
// $NC.setValue("#edtQOrderer_Nm");
// $NC.setValue("#edtQShipper_Nm");
// }, $ND.C_TIMEOUT_ACT);
// }
// });
// }

function grdMasterOnHeaderClick(e, args) {

    switch (args.column.id) {
        case "CHECK_YN":
            $NC.onGridColumnHeaderCheckBoxChange(G_GRDMASTER, e, args);
            break;
    }
}

/**
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDDETAIL, "LINE_NO");
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NO",
        field: "ITEM_NO",
        name: "상품번호"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SEQ",
        field: "ITEM_SEQ",
        name: "상품순번"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_F",
        field: "ITEM_STATE_F",
        name: "상품상태"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_DIV_F",
        field: "ITEM_DIV_F",
        name: "상품구분"
    });
    $NC.setGridColumn(columns, {
        id: "YEAR_DIV_F",
        field: "YEAR_DIV_F",
        name: "연도구분"
    });
    $NC.setGridColumn(columns, {
        id: "SEASON_DIV_F",
        field: "SEASON_DIV_F",
        name: "시즌구분"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        frozenColumn: 4
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "LOM07020E1.RS_DETAIL",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

/**
 * 등록 탭의 하단그리드 행 클릭시 처리
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
 * 조회버튼 클릭후 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);

    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, [
        "RDELIVERY_CD",
        "WB_NO"
    ])) {
        $NC.setInitGridVar(G_GRDDETAIL);
        onGetDetail({
            data: null
        });
        $NC.setInitTopButtons();
    } else {
        $NC.G_VAR.buttons._inquiry = "1";
        $NC.G_VAR.buttons._new = "0";
        $NC.G_VAR.buttons._save = "0";
        $NC.G_VAR.buttons._cancel = "0";
        $NC.G_VAR.buttons._delete = "1";
        $NC.G_VAR.buttons._print = "1";

        $NC.setInitTopButtons($NC.G_VAR.buttons);
    }
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

    // 온라인몰 조회조건 초기화
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");

    setOutboundBatchCombo();
    onChangingCondition();
    setPolicyValInfo();

}

/**
 * 운송장번호 초기화 및 포커스
 */
function setFocus() {

    // 초기화
    $NC.setValue("#edtQWb_No");
    // 포커스
    $NC.setFocus("#edtQWb_No");
}

/**
 * 상단 버튼 설정
 */
function setTopButtons() {

    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    if ($NC.isNotNull(G_GRDMASTER.queryParams)) {
        if (G_GRDMASTER.data.getLength() > 0) {
            $NC.G_VAR.buttons._print = "1";
        }
    }
    $NC.setInitTopButtons($NC.G_VAR.buttons);

}

function setReportInfo() {

    $NC.setProgramReportInfo();

}

function onSetWbNoPrintCntUpdate(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    });
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: [
            "OUTBOUND_DATE",
            "OUTBOUND_NO",
            "BOX_NO",
            "WB_NO"
        ]
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장시 에러 발생 했을 경우 처리
 * 
 * @param ajaxData
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

function showDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");
    if ($NC.isNull(CUST_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.003", "사업부를 먼저 선택 하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    $NP.showDeliveryPopup({
        title: $NC.getDisplayMsg("JS.LOM07020E1.004", "온라인몰 검색"),
        columnTitle: [
            "온라인몰코드",
            "온라인몰명"
        ],
        queryParams: {
            P_CUST_CD: CUST_CD,
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

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.010", "조회 후 처리하십시오."));
        return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.006", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.007", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
    if ($NC.isNull(OUTBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.008", "출고 시작 일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date1");
        return;
    }
    var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
    if ($NC.isNull(OUTBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.009", "출고 종료 일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date2");
        return;
    }

    $NC.excelFileDownload({
        P_QUERY_ID: "LOM07020E1.RS_REF1",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE1: OUTBOUND_DATE1,
            P_OUTBOUND_DATE2: OUTBOUND_DATE2
        },
        P_SERVICE_PARAMS: {
            P_XLS_SHEET_NAME: "송장내역"
        },
        P_COLUMN_INFO: [
            {
                P_COLUMN_NM: "BU_NO",
                P_COLUMN_TITLE: "쇼핑몰주문번호",
                P_COLUMN_WIDTH: 20
            },
            {
                P_COLUMN_NM: "BU_KEY",
                P_COLUMN_TITLE: "사방넷주문번호",
                P_COLUMN_WIDTH: 20
            },
            {
                P_COLUMN_NM: "WB_NO",
                P_COLUMN_TITLE: "운송장번호",
                P_COLUMN_WIDTH: 20
            },
            {
                P_COLUMN_NM: "BU_DATE",
                P_COLUMN_TITLE: "주문일자",
                P_COLUMN_WIDTH: 15
            },
            {
                P_COLUMN_NM: "CENTER_CD",
                P_COLUMN_TITLE: "물류센터코드",
                P_COLUMN_WIDTH: 15
            },
            {
                P_COLUMN_NM: "BU_CD",
                P_COLUMN_TITLE: "사업부코드",
                P_COLUMN_WIDTH: 15
            },
            {
                P_COLUMN_NM: "OUTBOUND_DATE",
                P_COLUMN_TITLE: "출고일자",
                P_COLUMN_WIDTH: 15
            },
            {
                P_COLUMN_NM: "OUTBOUND_NO",
                P_COLUMN_TITLE: "출고번호",
                P_COLUMN_WIDTH: 15
            }
        ]
    });
}

function btnWBDeliveryInfoOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.010", "조회 후 처리하십시오."));
        return;
    }

    if (G_GRDMASTER.lastRow == null) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.015", "배송조회할 운송장을 선택하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.SEND_STATE != "50") {
        alert($NC.getDisplayMsg("JS.LOM07020E1.016", "아직 택배사로 송신되지 않은 운송장입니다. 배송조회할 수 없습니다."));
        return;
    }

    if ($NC.isNull(rowData.WB_NO)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.017", "운송장번호가 없는 데이터입니다. 배송조회할 수 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LOM07022P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LOM07022P0.001", "택배사 배송조회"),
        url: "lo/LOM07022P0.html",
        width: 1100,
        height: 600,
        G_PARAMETER: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_WB_NO: rowData.WB_NO,
            P_CARRIER_CD: rowData.CARRIER_CD,
            P_CARRIER_NM: rowData.CARRIER_NM,
            P_HDC_DIV: rowData.HDC_DIV
        }
    });
}

function btnCreateReturnOnClick() {

    var permission = $NC.getProgramPermission();
    if (!permission.canSave) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.018", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.010", "조회 후 처리하십시오."));
        return;
    }

    if (G_GRDMASTER.lastRow == null) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.021", "반품요청 할 운송장을 선택하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.OUTBOUND_STATE < $ND.C_STATE_CONFIRM) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.022", "출고확정 처리 되지 않은 데이터입니다. 반품요청 할 수 없습니다."));
        return;
    }

    if (rowData.SEND_STATE != "50") {
        alert($NC.getDisplayMsg("JS.LOM07020E1.023", "아직 택배사로 송신되지 않은 운송장입니다. 반품요청 할 수 없습니다."));
        return;
    }

    if ($NC.isNull(rowData.WB_NO)) {
        alert($NC.getDisplayMsg("JS.LOM07020E1.024", "운송장번호가 없는 데이터입니다. 반품요청 할 수 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "LOM07023P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.LOM07023P0.001", "반품요청"),
        url: "lo/LOM07023P0.html",
        width: 1100,
        height: 600,
        G_PARAMETER: {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_OUTBOUND_NO: rowData.OUTBOUND_NO,
            P_BOX_NO: rowData.BOX_NO,
            P_WB_NO: rowData.WB_NO,
            P_CARRIER_CD: rowData.CARRIER_CD,
            P_CARRIER_NM: rowData.CARRIER_NM,
            P_BU_DATE: rowData.BU_DATE,
            P_BU_NO: rowData.BU_NO,
            P_DELIVERY_CD: rowData.DELIVERY_CD,
            P_DELIVERY_NM: rowData.DELIVERY_NM,
            P_RDELIVERY_CD: rowData.RDELIVERY_CD,
            P_MALL_MSG: rowData.MALL_MSG,
            P_ORDERER_CD: rowData.ORDERER_CD,
            P_ORDERER_NM: rowData.ORDERER_NM,
            P_ORDERER_TEL: rowData.ORDERER_TEL,
            P_ORDERER_HP: rowData.ORDERER_HP,
            P_ORDERER_EMAIL: rowData.ORDERER_EMAIL,
            P_ORDERER_MSG: rowData.ORDERER_MSG,
            P_SHIPPER_NM: rowData.SHIPPER_NM,
            P_SHIPPER_TEL: rowData.SHIPPER_TEL,
            P_SHIPPER_HP: rowData.SHIPPER_HP,
            P_SHIPPER_ZIP_CD: rowData.SHIPPER_ZIP_CD,
            P_SHIPPER_ADDR_BASIC: rowData.SHIPPER_ADDR_BASIC,
            P_SHIPPER_ADDR_DETAIL: rowData.SHIPPER_ADDR_DETAIL,
            P_POLICY_RI190: $NC.G_VAR.policyVal.RI190,
            P_POLICY_RI240: $NC.G_VAR.policyVal.RI240,
            P_POLICY_LS210: $NC.G_VAR.policyVal.LS210,
            P_PERMISSION: permission
        }
    });

}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    $NC.setEnableButton("#divMasterView", G_GRDMASTER.data.getLength() > 0);
}

function setOutboundBatchCombo() {

    // 조회조건 - 출고차수 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date1"),
            P_OUTBOUND_DIV: "2" // --출고작업구분(1:기본출고, 2:온라인출고)
        }
    }, {
        selector: "#cboQOutbound_Batch",
        codeField: "OUTBOUND_BATCH",
        fullNameField: "OUTBOUND_BATCH_F",
        addAll: true
    });
}
