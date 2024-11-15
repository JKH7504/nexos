/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : RIM05080Q0
 *  프로그램명         : 반입배치번호이력조회[B2C]
 *  프로그램설명       : 반입배치번호이력조회[B2C] 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-05-11
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-05-11    ASETEC           신규작성
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
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $NC.setInitDateRangePicker("#dtpQInbound_Date1", "#dtpQInbound_Date2");

    // 조회조건 - 물류센터 초기화
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
                title: $NC.getDisplayMsg("JS.RIM05080Q0.008", "온라인몰 검색"),
                columnTitle: [
                    "온라인몰코드",
                    "온라인몰명"
                ],
                errorMessage: $NC.getDisplayMsg("JS.RIM05080Q0.009", "등록되어 있지 않은 온라인몰입니다.")
            });
            return;
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "INBOUND_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIM05080Q0.001", "검색 시작일자를 정확히 입력하십시오."));
            break;
        case "INBOUND_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.RIM05080Q0.002", "검색 종료일자를 정확히 입력하십시오."));
            break;
    }

    // 화면클리어
    onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
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
        alert($NC.getDisplayMsg("JS.RIM05080Q0.003", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.RIM05080Q0.004", "사업부코드를 입력하십시오."));
        $NC.setFocus("#edtQBrand_Cd");
        return;
    }

    var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
    if ($NC.isNull(INBOUND_DATE1)) {
        alert($NC.getDisplayMsg("JS.RIM05080Q0.005", "시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }

    var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
    if ($NC.isNull(INBOUND_DATE2)) {
        alert($NC.getDisplayMsg("JS.RIM05080Q0.006", "종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQInbound_Date2");
        return;
    }

    if (INBOUND_DATE1 > INBOUND_DATE2) {
        alert($NC.getDisplayMsg("JS.RIM05080Q0.007", "반입일자 검색 범위 오류입니다."));
        $NC.setFocus("#dtpQInbound_Date1");
        return;
    }

    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
    var BATCH_NO = $NC.getValue("#edtQBatch_No", true);
    var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
    var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INBOUND_DATE1: INBOUND_DATE1,
        P_INBOUND_DATE2: INBOUND_DATE2,
        P_DELIVERY_CD: DELIVERY_CD,
        P_BU_NO: BU_NO,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_NM: ITEM_NM,
        P_ORDERER_NM: ORDERER_NM,
        P_SHIPPER_NM: SHIPPER_NM,
        P_BATCH_NO: BATCH_NO
    };
    // 데이터 조회
    $NC.serviceCall("/RIM05080Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "INBOUND_DATE",
        field: "INBOUND_DATE",
        name: "반입일자",
        cssClass: "styCenter",
        summaryTitle: "[합계]",
        groupToggler: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "INBOUND_NO",
        field: "INBOUND_NO",
        name: "반입번호",
        cssClass: "styCenter",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "ORDERER_NM",
        field: "ORDERER_NM",
        name: "주문자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM"),
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_NM",
        field: "SHIPPER_NM",
        name: "수령자명",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("NM"),
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "LINE_NO",
        field: "LINE_NO",
        name: "순번",
        cssClass: "styRight",
        groupToggler: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_BAR_CD",
        field: "ITEM_BAR_CD",
        name: "상품바코드",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_SPEC",
        field: "ITEM_SPEC",
        name: "규격",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "QTY_IN_BOX",
        field: "QTY_IN_BOX",
        name: "입수",
        cssClass: "styRight",
        groupDisplay: true,
        groupLevel: 1
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "배치번호"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "확정수량",
        cssClass: "styRight",
        aggregator: "SUM"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_CD_F",
        field: "INOUT_CD_F",
        name: "반입구분",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "온라인몰",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "온라인몰명",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "BU_DATE",
        field: "BU_DATE",
        name: "전표일자",
        cssClass: "styCenter",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "BU_NO",
        field: "BU_NO",
        name: "전표번호",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "MALL_MSG",
        field: "MALL_MSG",
        name: "온라인몰메시지",
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_TEL",
        field: "SHIPPER_TEL",
        name: "전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL"),
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_HP",
        field: "SHIPPER_HP",
        name: "휴대폰번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL"),
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "SHIPPER_ADDR",
        field: "SHIPPER_ADDR",
        name: "주소",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("ADDRESS"),
        groupDisplay: true,
        groupLevel: 0
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_USER_ID",
        field: "LAST_USER_ID",
        name: "최종수정자ID"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_DATETIME",
        field: "LAST_DATETIME",
        name: "최종수정일시",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 반입배치번호 내역 그리드 초기화
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 5,
        summaryRow: {
            visible: true
        }
    };

    // Data Grouping
    var dataGroupOptions = [
        {
            getter: function(rowData) {
                return rowData.INBOUND_DATE + "|" + rowData.INBOUND_NO;
            }
        },
        {
            getter: "LINE_NO"
        }
    ];

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "RIM05080Q0.RS_MASTER",
        sortCol: "INBOUND_NO",
        gridOptions: options,
        dataGroupOptions: dataGroupOptions,
        showGroupToggler: true
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * 반입배치번호 내역 그리드 행 클릭시 처리
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

/**
 * 반입배치번호 내역 조회 버튼 클릭후 그리드에 데이터 표시처리
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, "INBOUND_NO");
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
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

/**
 * 사업부 검색 결과
 * 
 * @param resultInfo
 */
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
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    $NP.showBuBrandPopup({
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
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
    onChangingCondition();
}

/**
 * 검색조건의 배송처 검색 이미지 클릭
 */
function showDeliveryPopup() {

    $NP.showDeliveryPopup({
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
        P_DELIVERY_CD: $ND.C_ALL,
        P_DELIVERY_DIV: $ND.C_ALL,
        P_VIEW_DIV: "2"
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