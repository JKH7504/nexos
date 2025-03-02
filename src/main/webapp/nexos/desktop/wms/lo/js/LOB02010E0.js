/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LOB02010E0
 *  프로그램명         : 출고작업
 *  프로그램설명       : 출고작업 화면 Javascript
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
            var resizeView = {
                container: "#divMasterView",
                childContainer: $NC.G_VAR.activeView.container,
                exceptHeight: $NC.getViewHeight("#divMasterInfoView")
            };
            switch ($NC.G_VAR.activeView.PROCESS_CD) {
                // 출고등록[개별]
                case $ND.C_PROCESS_ENTRY:
                    resizeView.grids = [
                        "#grdMasterB",
                        "#grdDetailB"
                    ];
                    break;
                // 출고등록[일괄]
                case $ND.C_PROCESS_ENTRY_BATCH:
                    break;
                // 출고지시
                case $ND.C_PROCESS_DIRECTIONS:
                    break;
                // 출고확정
                case $ND.C_PROCESS_CONFIRM:
                    break;
                // 배송완료
                case $ND.C_PROCESS_DELIVERY:
                    resizeView.grids = [
                        "#grdMasterE",
                        "#grdDetailE"
                    ];
                    break;
            }

            return resizeView;
        },
        autoResizeFixedView: function() {
            var resizeView;
            switch ($NC.G_VAR.activeView.PROCESS_CD) {
                // 출고등록[일괄] 고정뷰 처리
                case $ND.C_PROCESS_ENTRY_BATCH:
                    resizeView = {
                        viewFirst: {
                            container: "#divSplitterBT",
                            grids: [
                                "#grdMasterBT",
                                "#grdDetailBT"
                            ]
                        },
                        viewSecond: {
                            container: "#divOutwaitQtyInfoViewBT"
                        },
                        viewType: "h",
                        viewFixed: {
                            container: "viewSecond",
                            size: 230
                        },
                        exceptHeight: $NC.getViewHeight("#divAdditionalViewBT")
                    };
                    break;
                // 출고지시
                case $ND.C_PROCESS_DIRECTIONS:
                    // 컨테이너가 한번도 감싸져 있어 autoResizeView에서는 같이 처리 불가로 추가 처리
                    // view 정보를 하나만 return 하여 일반 리사이즈로 처리
                    resizeView = {
                        viewFirst: {
                            container: "#divSplitterC",
                            grids: [
                                "#grdMasterC",
                                "#grdDetailC"
                            ]
                        },
                        exceptHeight: $NC.getViewHeight("#divAdditionalViewC")
                    };
                    break;
                // 출고확정
                case $ND.C_PROCESS_CONFIRM:
                    // 컨테이너가 한번도 감싸져 있어 autoResizeView에서는 같이 처리 불가로 추가 처리
                    // view 정보를 하나만 return 하여 일반 리사이즈로 처리
                    resizeView = {
                        viewFirst: {
                            container: "#divSplitterLRD",
                            grids: [
                                "#grdMasterD",
                                "#grdDetailD",
                                "#grdSubD"
                            ]
                        },
                        exceptHeight: $NC.getViewHeight("#divAdditionalViewD")
                    };
                    break;
            }

            return resizeView;
        },
        // 현재 액티브된 뷰 정보
        activeView: {
            container: "",
            PROCESS_CD: ""
        },
        // 체크할 정책 값
        policyVal: {
            CM510: "", // 운송권역 관리정책
            CM530: "", // [택배일반]운송장번호관리정책
            LO190: "", // 공급금액 계산 정책
            LO210: "", // [B2B]일반출고 신규등록 정책
            LO212: "", // 수송출고등록 전표생성 가능여부
            LO230: "NN", // [B2B]예정으로 등록 시 추가/삭제 허용 기준
            LO250: "", // 유통기한/제조배치번호 지정 정책
            LO341: "", // 출고지시 선택 기본전표수
            LO410: "", // [B2B]출고 확정 수량 수정 허용 기준
            LO450: "", // 송장 공급자표시 기준
            LO490: "", // [B2B]출고확정시 검수완료 체크여부
            LO492: "", // 출고확정시 미출고사유 체크여부
            LO510: "", // 출고배송 수량 수정 가능여부
            LO720: "", // [B2B]기본배차 생성 기준
            LS210: "" // 재고 관리 기준
        },
        // 프로세스별 확정/취소 처리가능 진행상태
        // 0: A, 1: B, 2 : C, 3 : D, 4: E
        stateFWBW: {
            A: {
                CONFIRM: "",
                CANCEL: ""
            },
            B: {
                CONFIRM: "",
                CANCEL: ""
            },
            C: {
                CONFIRM: "",
                CANCEL: ""
            },
            D: {
                CONFIRM: "",
                CANCEL: ""
            },
            E: {
                CONFIRM: "",
                CANCEL: ""
            }
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

    $NC.setValue("#edtQBu_No");
    $NC.setValue("#edtQSo_No");
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setValue("#chkQState_Pre_Yn", $ND.C_YES);
    $NC.setValue("#chkQState_Cur_Yn", $ND.C_YES);

    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    $NC.setValue("#edtQRDelivery_Cd");
    $NC.setValue("#edtQRDelivery_Nm");

    $NC.setInitDatePicker("#dtpQOutbound_Date");
    $NC.setInitDatePicker("#dtpOutbound_DateBT");
    $NC.setInitDatePicker("#dtpOutbound_DateB");
    $NC.setInitDateRangePicker("#dtpQOrder_Date1", "#dtpQOrder_Date2", null, 1);
    $NC.setInitDatePicker("#dtpInout_DateD"); // 거래명세서일자

    // 미사용기능 숨김 처리
    // 초기 숨김 처리
    $("#tdQDsp_Area_Cd").parent().hide(); // 운송권역(tr)비표시
    $("#tdQDsp_Outbound_BatchC").hide();
    $("#divQOutbound_BatchD").hide();
    // 초기 비활성화 처리
    // 이벤트 연결
    $("#divMasterInfoView input[type=button]").bind("click", function(e) {
        onSubViewChange(e, $(this));
    });

    $("#btnQBu_Cd").click(showUserBuPopup);
    $("#btnQBrand_Cd").click(showBuBrandPopup);
    $("#btnQDelivery_Cd").click(showDeliveryPopup);
    $("#btnQRDelivery_Cd").click(showRDeliveryPopup);
    $("#btnQArea_Cd").click(showDeliveryAreaPopup);

    // 출고지시 화면의 출고차수 새로고침
    $("#btnQOutbound_BatchC").click(function() {
        setOutboundBatchCombo("#cboQOutbound_BatchC", false);
    });
    // 출고지시 화면(입력용)의 출고차수 새로고침
    $("#btnOutbound_BatchC").click(function() {
        setOutboundBatchCombo("#cboOutbound_BatchC", false);
    });
    // 출고확정의 출고차수 새로고침
    $("#btnQOutbound_BatchD").click(function() {
        // 출고차수 콤보 값 설정
        setOutboundBatchCombo("#cboQOutbound_BatchD", true);
    });
    // 출고등록(개별) 화면의 운송차수 새로고침
    $("#btnDelivery_BatchB").click(function() {
        setDeliveryBatchCombo($ND.C_PROCESS_ENTRY);
    });
    // 출고등록(일괄) 화면의 운송차수 새로고침
    $("#btnDelivery_BatchBT").click(function() {
        setDeliveryBatchCombo($ND.C_PROCESS_ENTRY_BATCH);
    });
    // ERP차수 (조회조건) 새로고침
    $("#btnQErp_Batch").click(function() {
        setErpBatchCombo($NC.G_VAR.activeView.PROCESS_CD);
        onChangingCondition();
    });

    $("#btnAttachFileUpload").click(window.btnAttachFileUploadOnClick); // 파일첨부 버튼 클릭
    $("#btnAttachFileDelete").click(window.btnAttachFileDeleteOnClick); // 파일삭제 버튼 클릭
    $("#btnAttachFileDownloadB").click(window.btnAttachFileDownloadBOnClick); // 파일첨부 다운로드 버튼 클릭
    $("#btnAttachFileDownloadD").click(window.btnAttachFileDownloadDOnClick); // 파일첨부 다운로드 버튼 클릭

    $("#btnEquipSend").click(window.btnEquipSendOnClick); // 출하장비전송 버튼 클릭
    $("#btnEquipSendCancel").click(window.btnEquipSendCancelOnClick); // 출하장비전송 취소 버튼 클릭
    $("#btnBill_Cnt").click(window.btnBillCntOnClick); // 출고지시 선택 기본전표수 선택버튼 이벤트

    $("#btnOutwaitInfo").click(window.showOutwaitOverlay); // 출고대기량 조회 버튼 클릭
    $("#btnOutwaitOverlayClose").click(function() { // 출고대기에서 창 닫기
        $("#divOutwaitOverlay").hide();
    });
    // $("#btnInout_DateD").click(window.btnInoutDateDOnClick); // 거래명세서 수정 버튼 클릭

    $("#btnAcsGetAddress").click(window.btnAcsGetAddressOnClick); // 주소정제 처리 버튼 클릭
    $("#btnSetCarrierCdB").click(window.btnSetCarrierCdBOnClick); // 운송사 설정 버튼 클릭
    $("#btnSetAddress").click(window.btnSetAddressOnClick); // 배송지갱신 버튼 클릭

    // 확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
    setUserProgramPermission();

    // 그리드 초기화 - 출고등록
    window.grdMasterBInitialize();
    window.grdDetailBInitialize();

    window.grdMasterBTInitialize();
    window.grdDetailBTInitialize();
    window.grdOutwaitInitialize();

    // 그리드 초기화 - 출고지시
    window.grdMasterCInitialize();
    window.grdDetailCInitialize();

    // 그리드 초기화 - 출고확정
    window.grdMasterDInitialize();
    window.grdDetailDInitialize();
    window.grdSubDInitialize();

    // 그리드 초기화 - 배송완료
    window.grdMasterEInitialize();
    window.grdDetailEInitialize();

    // 조회조건 - 출고구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "INOUT_CD",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: [
                $ND.C_INOUT_GRP_D1,
                $ND.C_INOUT_GRP_D2
            ].join($ND.C_SEP_DATA),
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQInout_Cd",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });

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
            // ※ 조회 조건이 모두 세팅이 되는 시점
            setTimeout(function() {
                // 출고차수 콤보 값 설정
                setOutboundBatchCombo("#cboQOutbound_BatchC", false);
                setOutboundBatchCombo("#cboOutbound_BatchC", false);
                setOutboundBatchCombo("#cboQOutbound_BatchD", true);

                // 운송차수 콤보 값 설정
                setDeliveryBatchCombo($ND.C_PROCESS_ENTRY);
                setDeliveryBatchCombo($ND.C_PROCESS_ENTRY_BATCH);
                // ERP차수 콤보 값 설정
                setErpBatchCombo($NC.G_VAR.activeView.PROCESS_CD);

                // 출고전표/수량 정보 세팅, 프로세스 정보
                setMasterSummaryInfo();
                setPolicyValInfo();
                setProcessStateInfo();
                setMasterProcessInfo();
            }, $ND.C_TIMEOUT_ACT);
        }
    });

    // 조회조건 - 배송처구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "DELIVERY_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업

        }
    }, {
        selector: "#cboQDelivery_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });

    // 조회조건 - 지역구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "REGION_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQRegion_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });

    // 조회조건 - 차량구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "CAR_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboQCar_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        addAll: true
    });

    // 출고지시 출하장비구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "EQUIP_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "0,1",
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboEquip_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        onComplete: function(dsResultData) {
            // 사용 가능한 출하장비가 없을 경우 출하장비 관련 숨김
            if ($NC.isNull(dsResultData) || dsResultData.length == 0) {
                $("#trViewCEquipInfo").hide();
                $("#tdViewCOrderCnt").hide();
                // $("#tdViewCBillCnt").hide();
                $NC.setValue("#edtBill_Cnt", $NC.G_VAR.policyVal.LO341);
            }
            // 분배가능 세팅 - 출하장비구분의 특성03(최대할당)
            else {
                var equipCnt = $NC.toNumber(dsResultData[$NC.getComboSelectedIndex("#cboEquip_Div")].ATTR03_CD);
                $NC.setValue("#edtEquip_Cnt", equipCnt);
                $NC.setValue("#edtBill_Cnt", equipCnt == 0 ? $NC.G_VAR.policyVal.LO341 : equipCnt);
            }
        }
    });

    // 출고지시 출하장비 할당구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "EQUIP_ALLOC_DIV",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "0,1",
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboEquip_Alloc_Div",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        onComplete: function(dsResult) {
            // 출하장비 할당구분에 따라 타이틀, 선택 수 변경
            var equipAllocDiv = dsResult[$NC.getComboSelectedIndex("#cboEquip_Alloc_Div")].COMMON_CD == "1";
            $NC.setVisible("#lblSelected_Order_Cnt", equipAllocDiv);
            $NC.setVisible("#lblSelected_Rdelivery_Cnt", !equipAllocDiv);
        }
    });

    // 운송사(택배용) 세팅 - 운송사(택배용) 콤보
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCARRIER_HDC",
        P_QUERY_PARAMS: {
            P_CARRIER_CD: $ND.C_ALL,
            P_CUST_CD: $NC.G_USERINFO.CUST_CD,
            P_HDC_DIV_ATTR03_CD: $ND.C_ALL, // Y:정제대상, N:정제미대상, %: 전체
            P_HDC_DIV_ATTR05_CD: "1", // 1:B2B, 2:B2C
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboCarrier_CdB",
        codeField: "CARRIER_CD",
        nameField: "CARRIER_NM",
        fullNameField: "CARRIER_CD_F"
    });

    // 취소/처리 버튼 툴팁 세팅
    $NC.setTooltip("#btnProcessPreB", $NC.getDisplayMsg("JS.LOB02010E0.001", $NC.getValue("#btnProcessB") + " 취소", $NC.getValue("#btnProcessB")));
    $NC.setTooltip("#btnProcessNxtB", $NC.getDisplayMsg("JS.LOB02010E0.002", $NC.getValue("#btnProcessB") + " 처리", $NC.getValue("#btnProcessB")));
    $NC.setTooltip("#btnProcessPreC", $NC.getDisplayMsg("JS.LOB02010E0.001", $NC.getValue("#btnProcessC") + " 취소", $NC.getValue("#btnProcessC")));
    $NC.setTooltip("#btnProcessNxtC", $NC.getDisplayMsg("JS.LOB02010E0.002", $NC.getValue("#btnProcessC") + " 처리", $NC.getValue("#btnProcessC")));
    $NC.setTooltip("#btnProcessPreD", $NC.getDisplayMsg("JS.LOB02010E0.001", $NC.getValue("#btnProcessD") + " 취소", $NC.getValue("#btnProcessD")));
    $NC.setTooltip("#btnProcessNxtD", $NC.getDisplayMsg("JS.LOB02010E0.002", $NC.getValue("#btnProcessD") + " 처리", $NC.getValue("#btnProcessD")));
    $NC.setTooltip("#btnProcessPreE", $NC.getDisplayMsg("JS.LOB02010E0.001", $NC.getValue("#btnProcessE") + " 취소", $NC.getValue("#btnProcessE")));
    $NC.setTooltip("#btnProcessNxtE", $NC.getDisplayMsg("JS.LOB02010E0.002", $NC.getValue("#btnProcessE") + " 처리", $NC.getValue("#btnProcessE")));
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

    if ($NC.isVisible("#divOutwaitOverlay")) {
        var $parent = $("#divOutwaitView").parent();
        $NC.resizeGridView("#divOutwaitView", "#grdOutwait", null, $parent.height() - $NC.getViewHeight($parent.children().not("#divOutwaitView")));
    }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            onChangingCondition();
            setMasterProcessInfo();
            setPolicyValInfo();
            setProcessStateInfo();
            setOutboundBatchCombo("#cboQOutbound_BatchC", false);
            setOutboundBatchCombo("#cboOutbound_BatchC", false);
            setOutboundBatchCombo("#cboQOutbound_BatchD", true);
            setDeliveryBatchCombo($ND.C_PROCESS_ENTRY);
            setDeliveryBatchCombo($ND.C_PROCESS_ENTRY_BATCH);
            setErpBatchCombo($NC.G_VAR.activeView.PROCESS_CD);
            return;
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "BRAND_CD":
            $NP.onBuBrandChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd"),
                P_BRAND_CD: val
            }, onBuBrandPopup);
            return;
        case "DELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onDeliveryPopup);
            return;
        case "RDELIVERY_CD":
            $NP.onDeliveryChange(val, {
                P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
                P_DELIVERY_CD: val,
                P_DELIVERY_DIV: $ND.C_ALL,
                P_VIEW_DIV: "2"
            }, onRDeliveryPopup);
            return;
        case "AREA_CD":
            $NP.onDeliveryAreaChange(val, {
                P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
                P_AREA_CD: val
            }, onDeliveryAreaPopup);
            return;
        case "OUTBOUND_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB02010E0.003", "검색 출고일자를 정확히 입력하십시오."));
            setOutboundBatchCombo("#cboQOutbound_BatchC", false);
            setOutboundBatchCombo("#cboOutbound_BatchC", false);
            setOutboundBatchCombo("#cboQOutbound_BatchD", true);
            setErpBatchCombo($NC.G_VAR.activeView.PROCESS_CD);
            break;
        case "ORDER_DATE1":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB02010E0.004", "검색 시작일자를 정확히 입력하십시오."));
            setErpBatchCombo($NC.G_VAR.activeView.PROCESS_CD);
            break;
        case "ORDER_DATE2":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB02010E0.005", "검색 종료일자를 정확히 입력하십시오."));
            setErpBatchCombo($NC.G_VAR.activeView.PROCESS_CD);
            break;
        case "OUTBOUND_BATCHC":
            _Inquiry();
            return;
    }

    onChangingCondition();
}

function onChangingCondition() {

    for ( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
        if (PROCESS_CD == $ND.C_PROCESS_ORDER) {
            continue;
        }
        $NC.clearGridData(window["G_GRDMASTER" + PROCESS_CD]); // 마스터
        $NC.clearGridData(window["G_GRDDETAIL" + PROCESS_CD]); // 디테일
        // 확정일 경우
        if (PROCESS_CD == $ND.C_PROCESS_CONFIRM) {
            $NC.clearGridData(window["G_GRDSUB" + PROCESS_CD]);
        }
    }

    // 일괄출고등록 초기화
    $NC.clearGridData(G_GRDMASTERBT); // 마스터
    $NC.clearGridData(G_GRDDETAILBT); // 디테일
    window.clearAdjustQtyInfo(); // 일괄출고 조정수량 정보 클리어

    // 전표건수/수량 정보 재조회
    setMasterSummaryInfo();

    // 출고등록 기능 활성/비활성화
    window.setUserProgramPermissionB();
    // 출고확정 기능 활성/비활성화
    window.setUserProgramPermissionD();

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * 출고지시 화면에서 출고차수 값 변경시 그리드 클리어 (출고지시 화면만 해당됨)
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "OUTBOUND_BATCHC":
            if (val == $ND.C_BASE_BATCH_NO) {
                $NC.setEnable("#edtOutbound_Batch_NmC", true);
            } else {
                $NC.setEnable("#edtOutbound_Batch_NmC", false);
                $NC.setValue("#edtOutbound_Batch_NmC");
            }
            break;
        case "OUTBOUND_DATEBT":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB02010E0.006", "일괄처리생성정보의 출고일자를 정확히 입력하십시오."));
            setDeliveryBatchCombo($ND.C_PROCESS_ENTRY_BATCH);
            break;
        case "OUTBOUND_DATEB":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB02010E0.007", "출고일자를 정확히 입력하십시오."));
            setDeliveryBatchCombo($ND.C_PROCESS_ENTRY);
            break;
        case "DELIVERY_BATCHB":
            $NC.setEnable("#edtDelivery_Batch_NmB", val == $ND.C_BASE_BATCH_NO);
            break;
        case "DELIVERY_BATCHBT":
            $NC.setEnable("#edtDelivery_Batch_NmBT", val == $ND.C_BASE_BATCH_NO);
            break;
        case "QVIEW_DIV0":
        case "QVIEW_DIV1":
            if (G_GRDDETAILBT.view.getEditorLock().isActive()) {
                G_GRDDETAILBT.view.getEditorLock().commitCurrentEdit();
            }

            if (G_GRDDETAILBT["isCellChangeError"] == true) {
                $NC.setValueRadioGroup("rgbQView_Div", val == "0" ? "1" : "0");
                G_GRDDETAILBT["isCellChangeError"] = false;
                return;
            }
            // 마지막 선택 Row Validation 체크
            if (!$NC.isGridValidLastRow(G_GRDDETAILBT)) {
                $NC.setValueRadioGroup("rgbQView_Div", val == "0" ? "1" : "0");
                return;
            }

            // 디테일 수정여부 체크, 수정시 자동 저장 처리
            if ($NC.isGridModified(G_GRDDETAILBT)) {
                if (!window.saveEntryBT()) {
                    return;
                }
            }

            $NC.clearGridData(G_GRDDETAILBT);
            $NC.setInitGridVar(G_GRDMASTERBT);
            $NC.setGridFilterValue(G_GRDMASTERBT, val);
            window.setAdjustQtyInfo(true);
            break;
        case "INOUT_DATED":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LOB02010E0.008", "거래명세서일자를 정확히 입력하십시오."));
            break;
        case "DIRECTIONS_DIV1":
        case "DIRECTIONS_DIV2":
            window.setDirectionsDiv(val);
            break;
        case "EQUIP_DIV":
            window.setEquipDiv(val);
            break;
        case "EQUIP_ALLOC_DIV":
            // 출하장비 할당구분에 따라 타이틀, 선택 수 변경
            $NC.setVisible("#lblSelected_Order_Cnt", val == "1");
            $NC.setVisible("#lblSelected_Rdelivery_Cnt", val != "1");
            window.setSelectedCount();
            break;
    }
}

/**
 * Sub View Button Click 시 호출 됨
 */
function onSubViewChange(e, $view) {

    // btnProcessA ---> A
    var PROCESS_CD = $view.prop("id").substr(10).toUpperCase();
    if ($NC.G_VAR.activeView.PROCESS_CD == PROCESS_CD) {
        return;
    }

    for ( var INIT_PROCESS_CD in $NC.G_VAR.stateFWBW) {
        if (INIT_PROCESS_CD == $ND.C_PROCESS_ORDER) {
            continue;
        }
        $("#btnProcess" + INIT_PROCESS_CD).removeClass("stySelect");
        $("#divSubView" + INIT_PROCESS_CD).hide();
    }

    $("#btnProcessBT").removeClass("stySelect");
    $("#divSubViewBT").hide();

    $NC.G_VAR.activeView.container = "#divSubView" + PROCESS_CD;
    $NC.G_VAR.activeView.PROCESS_CD = PROCESS_CD;

    $view.addClass("stySelect");
    $($NC.G_VAR.activeView.container).show();

    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        // 출고 등록
        case $ND.C_PROCESS_ENTRY:
            $("#divQOrder_Date").show(); // 출고예정일자 표시
            $("#divQOutbound_BatchD").hide(); // 출고차수 비표시
            $("#tdQSpecialCondition").show();
            $("#tdQDsp_Area_Cd").parent().hide(); // 운송권역(tr)비표시
            $("#tdQState_Yn").parent().show(); // 검색구분(tr)표시
            $("#tdQDsp_Outbound_BatchC").hide(); // 출고차수(지시) 비표시
            $("#tdQDsp_Delivery_Div").parent().show(); // 배송처구분 표시

            setDeliveryBatchCombo($ND.C_PROCESS_ENTRY);

            // 스플리터가 초기화 또는 리사이즈 호출
            if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
                $($NC.G_VAR.activeView.container).trigger("resize");
            } else {
                $NC.setInitSplitter($NC.G_VAR.activeView.container, "hb", 350);
            }
            break;
        // 출고 등록(일괄)
        case $ND.C_PROCESS_ENTRY_BATCH:
            $("#divQOrder_Date").show(); // 출고예정일자 표시
            $("#divQOutbound_BatchD").hide(); // 출고차수 비표시
            $("#tdQSpecialCondition").show();
            $("#tdQDsp_Area_Cd").parent().hide(); // 운송권역(tr)비표시
            $("#tdQState_Yn").parent().hide(); // 검색구분(tr)비표시
            $("#tdQDsp_Outbound_BatchC").hide(); // 출고차수(지시) 비표시
            $("#tdQDsp_Delivery_Div").parent().show(); // 배송처구분 비표시

            // 스플리터가 초기화 또는 리사이즈 호출
            if ($NC.isSplitter("#divSplitterBT")) {
                $("#divSplitterBT").trigger("resize");
            } else {
                $NC.setInitSplitter("#divSplitterBT", "hb", 350);
            }
            break;
        // 출고 지시
        case $ND.C_PROCESS_DIRECTIONS:
            $("#divQOrder_Date").hide(); // 출고예정일자 비표시
            $("#divQOutbound_BatchD").hide(); // 출고차수 비표시
            $("#tdQSpecialCondition").hide();
            $("#tdQDsp_Area_Cd").parent().hide(); // 운송권역(tr)비표시
            $("#tdQState_Yn").parent().show(); // 검색구분(tr)표시
            $("#tdQDsp_Outbound_BatchC").show(); // 출고차수(지시) 표시
            $("#tdQDsp_Delivery_Div").parent().show(); // 배송처구분 표시

            setOutboundBatchCombo("#cboQOutbound_BatchC", false, "first");
            $NC.setValue("#cboQOutbound_BatchC", $ND.C_BASE_BATCH_NO);

            // 스플리터가 초기화 또는 리사이즈 호출
            if ($NC.isSplitter("#divSplitterC")) {
                $("#divSplitterC").trigger("resize");
            } else {
                $NC.setInitSplitter("#divSplitterC", "v", 500, 270, 400);
            }
            break;
        // 출고 확정
        case $ND.C_PROCESS_CONFIRM:
            $("#divQOrder_Date").hide(); // 출고예정일자 비표시
            $("#divQOutbound_BatchD").show(); // 출고차수 표시
            $("#tdQSpecialCondition").show();
            $("#tdQDsp_Area_Cd").parent().show(); // 운송권역(tr)표시
            $("#tdQState_Yn").parent().show(); // 검색구분(tr)표시
            $("#tdQDsp_Outbound_BatchC").hide(); // 출고차수(지시) 비표시
            $("#tdQDsp_Delivery_Div").parent().show(); // 배송처구분 표시

            setOutboundBatchCombo("#cboQOutbound_BatchD", true, "first");

            // 스플리터가 초기화 또는 리사이즈 호출
            if ($NC.isSplitter("#divSplitterLRD")) {
                $("#divSplitterLRD").trigger("resize");
                $("#divSplitterTBD").trigger("resize");
            } else {
                $NC.setInitSplitter("#divSplitterLRD", "v", 500, 270, 400);
                $NC.setInitSplitter("#divSplitterTBD", "hb", 400);
            }
            break;
        // 배송완료
        case $ND.C_PROCESS_DELIVERY:
            $("#divQOrder_Date").hide(); // 출고예정일자 비표시
            $("#divQOutbound_BatchD").show(); // 출고차수 표시
            $("#tdQSpecialCondition").show();
            $("#tdQDsp_Area_Cd").parent().show(); // 운송권역(tr)표시
            $("#tdQState_Yn").parent().show(); // 검색구분(tr)표시
            $("#tdQDsp_Outbound_BatchC").hide(); // 출고차수(지시) 비표시
            $("#tdQDsp_Delivery_Div").parent().show(); // 배송처구분 표시

            // 스플리터가 초기화 또는 리사이즈 호출
            if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
                $($NC.G_VAR.activeView.container).trigger("resize");
            } else {
                $NC.setInitSplitter($NC.G_VAR.activeView.container, "hb", 350);
            }
            break;
    }

    // 출고등록[일괄]일 경우는 재조회 처리 안함
    if ($NC.G_VAR.activeView.PROCESS_CD == $ND.C_PROCESS_ENTRY_BATCH) {
        // 그리드 초기화
        $NC.clearGridData(G_GRDMASTERBT);
        $NC.clearGridData(G_GRDDETAILBT);
        // 일괄출고 조정수량 정보 클리어
        window.clearAdjustQtyInfo();

        // _Inquiry();
        setReportInfo();
        // 조회를 안하기 때문에 공통버튼 초기화 처리
        setTopButtons();
    } else {
        _Inquiry();
        setReportInfo();
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.009", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.010", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.011", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }
    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    if ($NC.isNull(ORDER_DATE1)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.012", "출고예정 검색 시작일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date1");
        return;
    }
    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    if ($NC.isNull(ORDER_DATE2)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.013", "출고예정 검색 종료일자를 입력하십시오."));
        $NC.setFocus("#dtpQOrder_Date2");
        return;
    }
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    if ($NC.isNull(INOUT_CD)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.014", "출고구분을 선택하십시오."));
        $NC.setFocus("#cboQInout_Cd");
        return;
    }
    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var SO_NO = $NC.getValue("#edtQSo_No", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

    var OUTBOUND_BATCHC = $NC.getValue("#cboQOutbound_BatchC");
    // 출고차수의 값이 없을 경우 출고지시의 출고차수는 "000"으로 처리
    if (OUTBOUND_BATCHC == "") {
        OUTBOUND_BATCHC = $ND.C_BASE_BATCH_NO;
    }
    var OUTBOUND_BATCHD = $NC.getValue("#cboQOutbound_BatchD");

    var STATE_PRE_YN = $NC.getValue("#chkQState_Pre_Yn");
    var STATE_CUR_YN = $NC.getValue("#chkQState_Cur_Yn");
    if (STATE_PRE_YN == $ND.C_NO && STATE_CUR_YN == $ND.C_NO) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.015", "검색구분을 선택하십시오."));
        $NC.setFocus("#chkQState_Pre_Yn");
        return;
    }

    var CAR_DIV = $NC.getValue("#cboQCar_Div", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
    var DELIVERY_DIV = $NC.getValue("#cboQDelivery_Div", true);
    var REGION_DIV = $NC.getValue("#cboQRegion_Div", true);
    var ERP_BATCH = $NC.getValue("#cboQErp_Batch");
    var AREA_CD = $NC.getValue("#edtQArea_Cd", true);

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_Inquiry" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn({
            CENTER_CD: CENTER_CD,
            BU_CD: BU_CD,
            OUTBOUND_DATE: OUTBOUND_DATE,
            ORDER_DATE1: ORDER_DATE1,
            ORDER_DATE2: ORDER_DATE2,
            INOUT_CD: INOUT_CD,
            BU_NO: BU_NO,
            SO_NO: SO_NO,
            BRAND_CD: BRAND_CD,
            ITEM_CD: ITEM_CD,
            ITEM_NM: ITEM_NM,
            CAR_DIV: CAR_DIV,
            ERP_BATCH: ERP_BATCH,
            DELIVERY_CD: DELIVERY_CD,
            RDELIVERY_CD: RDELIVERY_CD,
            DELIVERY_DIV: DELIVERY_DIV,
            REGION_DIV: REGION_DIV,
            AREA_CD: AREA_CD,
            OUTBOUND_BATCHC: OUTBOUND_BATCHC,
            OUTBOUND_BATCHD: OUTBOUND_BATCHD,
            STATE_PRE_YN: STATE_PRE_YN,
            STATE_CUR_YN: STATE_CUR_YN
        });
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_New" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn();
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_Save" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn();
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_Delete" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn();
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
        return;
    }
    var callFn = window["_Cancel" + $NC.G_VAR.activeView.PROCESS_CD];
    if ($NC.isNotNull(callFn)) {
        callFn();
    }
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

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.009", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.010", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(OUTBOUND_DATE)) {
        alert($NC.getDisplayMsg("JS.LOB02010E0.011", "출고일자를 입력하십시오."));
        $NC.setFocus("#dtpQOutbound_Date");
        return;
    }

    var OUTBOUND_BATCH = "";
    // 대상 그리드 선택
    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        case $ND.C_PROCESS_ENTRY:
            OUTBOUND_BATCH = $ND.C_BASE_BATCH_NO;
            break;
        case $ND.C_PROCESS_DIRECTIONS:
            OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_BatchC");
            if ($NC.isNull(OUTBOUND_BATCH)) {
                alert($NC.getDisplayMsg("JS.LOB02010E0.016", "출고차수를 선택하십시오."));
                $NC.setFocus("#cboQOutbound_BatchC");
                return;
            }
            break;
        case $ND.C_PROCESS_CONFIRM:
        case $ND.C_PROCESS_DELIVERY:
            // 아래 레포트는 차수 필수 선택
            // PAPER_LOB03 - 토탈피킹지시서
            // PAPER_LOB04 - 분배지시서
            // PAPER_LOB05 - 차량별토탈피킹지시서
            // PAPER_LOB06 - 차량별분배지시서
            // PAPER_LOB08 - 배송처별토탈피킹지시서
            // PAPER_LOB09 - 실배송처별토탈피킹지시서
            if (reportInfo.REPORT_CD == "PAPER_LOB03" //
                || reportInfo.REPORT_CD == "PAPER_LOB04" //
                || reportInfo.REPORT_CD == "PAPER_LOB05" //
                || reportInfo.REPORT_CD == "PAPER_LOB06" // 
                || reportInfo.REPORT_CD == "PAPER_LOB08" //
                || reportInfo.REPORT_CD == "PAPER_LOB09") {
                OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_BatchD");
                if (OUTBOUND_BATCH == $ND.C_ALL) {
                    alert($NC.getDisplayMsg("JS.LOB02010E0.016", "출고차수를 선택하십시오."));
                    $NC.setFocus("#cboQOutbound_BatchD");
                    return;
                }
            }
            break;
        default:
            alert($NC.getDisplayMsg("JS.LOB02010E0.017", "해당 프로세스는 출력물이 없습니다."));
            return;
    }

    var grdObject = $NC.getGridObject("G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD);
    if (grdObject.view.getEditorLock().isActive()) {
        grdObject.view.getEditorLock().commitCurrentEdit();
    }

    // 레포트별 출력 데이터 세팅
    var checkedData = {};
    var queryParams;

    // 택배라벨 팝업
    // if (reportInfo.REPORT_CD == "LABEL_LOB04") {
    // var masterDRowData = G_GRDMASTERD.data.getItem(G_GRDMASTERD.lastRow);
    // if ($NC.isNull(masterDRowData)) {
    // masterDRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
    // }
    // if ($NC.isNull(masterDRowData)) {
    // masterDRowData = G_GRDMASTERE.data.getItem(G_GRDMASTERE.lastRow);
    // }
    // if (masterDRowData.OUTBOUND_STATE >= $ND.C_STATE_DIRECTIONS) {
    // $NC.showProgramSubPopup({
    // PROGRAM_ID: "LOB02012P0",
    // PROGRAM_NM: $NC.getDisplayMsg("JS.LOB02012P0.001", "택배라벨출력"),
    // url: "lo/LOB02012P0.html",
    // width: 320,
    // height: 220,
    // G_PARAMETER: {
    // P_CENTER_CD: masterDRowData.CENTER_CD,
    // P_CENTER_NM: masterDRowData.CENTER_NM,
    // P_BU_CD: masterDRowData.BU_CD,
    // P_BU_NM: $NC.getValue("#edtQBu_Nm"),
    // P_BU_NO: masterDRowData.BU_NO,
    // P_BU_DATE: masterDRowData.BU_DATE,
    // P_OUTBOUND_DATE: masterDRowData.OUTBOUND_DATE,
    // P_DELIVERY_NM: masterDRowData.DELIVERY_NM
    // },
    // onOk: function(resultInfo) {
    // queryParams = {
    // P_CENTER_CD: masterDRowData.CENTER_CD,
    // P_BU_CD: masterDRowData.BU_CD,
    // P_OUTBOUND_DATE: masterDRowData.OUTBOUND_DATE,
    // P_OUTBOUND_NO: masterDRowData.OUTBOUND_NO,
    // P_BOX_CNT: $NC.toNumber(resultInfo)
    // };
    // // 출력 파라메터 세팅
    // var printOptions = {
    // reportDoc: reportInfo.REPORT_DOC_URL,
    // reportTitle: reportInfo.REPORT_TITLE_NM,
    // queryId: reportInfo.REPORT_QUERY_ID,
    // queryParams: queryParams,
    // internalQueryYn: reportInfo.INTERNAL_QUERY_YN,
    // checkedValue: $NC.toJoin(checkedData.values)
    // };
    // // 출력 미리보기 호출
    // setTimeout(function() {
    // $NC.showPrintPreview(printOptions);
    // }, $ND.C_TIMEOUT_ACT);
    // }
    // });
    // } else {
    // alert($NC.getDisplayMsg("JS.LOB02010E0.016", "[" + reportInfo.REPORT_NM + "]출력할 데이터를 선택하십시오.", reportInfo.REPORT_NM));
    // return;
    // }
    //
    // }
    switch (reportInfo.REPORT_CD) {
        // PAPER_LOB02 - 오더피킹지시서
        case "PAPER_LOB02":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_DIRECTIONS;
                }
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_POLICY_CM510: $NC.G_VAR.policyVal.CM510
            };
            break;
        // PAPER_LOB03 - 토탈피킹지시서
        case "PAPER_LOB03":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH
            };
            break;
        // PAPER_LOB04 - 분배지시서
        case "PAPER_LOB04":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH
            };
            break;
        // PAPER_LOB05 - 차량별토탈피킹지시서
        case "PAPER_LOB05":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH
            };
            break;
        // PAPER_LOB06 - 차량별분배지시서
        case "PAPER_LOB06":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH
            };
            break;
        // PAPER_LOB08 - 배송처별토탈피킹지시서
        case "PAPER_LOB08":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH
            };
            break;
        // PAPER_LOB09 - 실배송처별토탈피킹지시서
        case "PAPER_LOB09":
            // 선택 데이터 가져오기
            // checkedData = {};
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_BATCH: OUTBOUND_BATCH
            };
            break;
        // LABEL_LOB04 - 택배송장(우체국)
        case "LABEL_LOB04":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                dataType: "S", // 문자열 결합
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_DIRECTIONS //
                        && (rowData.HDC_DIV == $ND.C_HDC_DIV_EPOST_B2B || rowData.HDC_DIV == $ND.C_HDC_DIV_EPOST_B2C);
                }
            });
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_POLICY_LO450: $NC.G_VAR.policyVal.LO450
            };
            break;
        // LABEL_LOB05 - 택배송장(한진)
        case "LABEL_LOB05":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                dataType: "S", // 문자열 결합
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_DIRECTIONS //
                        && (rowData.HDC_DIV == $ND.C_HDC_DIV_HANJIN_B2B || rowData.HDC_DIV == $ND.C_HDC_DIV_HANJIN_B2C);
                }
            });
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_POLICY_LO450: $NC.G_VAR.policyVal.LO450
            };
            break;
        // LABEL_LOB06 - 택배송장(CJ대한통운)
        case "LABEL_LOB06":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                dataType: "S", // 문자열 결합
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_DIRECTIONS //
                        && (rowData.HDC_DIV == $ND.C_HDC_DIV_CJ_B2B || rowData.HDC_DIV == $ND.C_HDC_DIV_CJ_B2C);
                }
            });
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_POLICY_LO450: $NC.G_VAR.policyVal.LO450
            };
            break;
        // SPEC_LOB01 - 거래명세서
        case "SPEC_LOB01":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_CONFIRM;
                }
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_DSP_AMT_YN: $ND.C_YES
            };
            break;
        // SPEC_LOB02 - 납품명세서
        case "SPEC_LOB02":
            // 선택 데이터 가져오기
            checkedData = $NC.getGridCheckedValues(grdObject, {
                valueColumns: "OUTBOUND_NO",
                compareFn: function(rowData) {
                    return rowData.OUTBOUND_STATE >= $ND.C_STATE_DIRECTIONS;
                }
            });
            // checkedValues 외 쿼리 파라메터 세팅
            queryParams = {
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE
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

    // 출력 미리보기 호출
    $NC.showPrintPreview(printOptions);
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
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, null, false);
            break;
    }
}

/**
 * Grid Column 중 진행상태의 Fomatter
 */
function getGridStateFormatter(row, cell, value, columnDef, dataContext) {

    return "<span class='styIcoState" + dataContext.OUTBOUND_STATE + "'></span>";
}

/**
 * Grid Column 중 프로세스의 Fomatter
 */
function getGridProcessFormatter(row, cell, value, columnDef, dataContext) {

    switch (dataContext.OUTBOUND_STATE) {
        case $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL:
            return "<span class='styIcoPrior'></span>";
        case $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM:
            return "<span class='styIcoNext'></span>";
        default:
            return "<span class='styIcoStop'></span>";
    }
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    // 저장
    $NC.setEnable("#btnEquipSend", permission.canSave);
    // 삭제
    $NC.setEnable("#btnEquipSendCancel", permission.canDelete);

    // 행추가 하는 이벤트 없음
    // 확정
    if (permission.canConfirm) {
        $("#btnProcessNxtB").click(window.onProcessNxtB);
        $("#btnProcessNxtC").click(window.onProcessNxtC);
        $("#btnProcessNxtD").click(window.onProcessNxtD);
        $("#btnProcessNxtE").click(window.onProcessNxtE);
        $("#btnProcessNxtBT").click(window.onProcessNxtBT);
    }
    $NC.setEnable("#btnProcessNxtB", permission.canConfirm);
    $NC.setEnable("#btnProcessNxtC", permission.canConfirm);
    $NC.setEnable("#btnProcessNxtD", permission.canConfirm);
    $NC.setEnable("#btnProcessNxtE", permission.canConfirm);
    $NC.setEnable("#btnProcessNxtBT", permission.canConfirm);

    // 취소
    if (permission.canConfirmCancel) {
        $("#btnProcessPreB").click(window.onProcessPreB);
        $("#btnProcessPreC").click(window.onProcessPreC);
        $("#btnProcessPreD").click(window.onProcessPreD);
        $("#btnProcessPreE").click(window.onProcessPreE);
        $("#btnProcessPreBT").click(window.onProcessPreBT);
    }
    $NC.setEnable("#btnProcessPreB", permission.canConfirmCancel);
    $NC.setEnable("#btnProcessPreC", permission.canConfirmCancel);
    $NC.setEnable("#btnProcessPreD", permission.canConfirmCancel);
    $NC.setEnable("#btnProcessPreE", permission.canConfirmCancel);
    $NC.setEnable("#btnProcessPreBT", permission.canConfirmCancel);
}

function setTopButtons() {

    // 기본값
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        // 출고 등록
        case $ND.C_PROCESS_ENTRY:
            // 공통 버튼 활성화 처리

            // 예정데이터 주소정제 작업 필수, 출고작업 신규생성 불가
            // if ($NC.G_VAR.policyVal.LO210 == $ND.C_YES || $NC.G_VAR.policyVal.LO212 == $ND.C_YES) {
            // $NC.G_VAR.buttons._new = "1";
            // }

            if (G_GRDMASTERB.data.getLength() > 0) {
                if (!$NC.isEnable("#btnProcessC")) {
                    $NC.G_VAR.buttons._print = "1";
                }
            }
            break;
        // 일괄출고 등록
        case $ND.C_PROCESS_ENTRY_BATCH:
            break;
        // 출고 지시
        case $ND.C_PROCESS_DIRECTIONS:
            // 공통 버튼 활성화 처리
            if (G_GRDMASTERC.data.getLength() > 0) {
                $NC.G_VAR.buttons._save = "1";
                $NC.G_VAR.buttons._print = "1";
            }
            break;
        // 출고 확정
        case $ND.C_PROCESS_CONFIRM:
            // 공통 버튼 활성화 처리
            if (G_GRDMASTERD.data.getLength() > 0) {
                $NC.G_VAR.buttons._save = "1";
                $NC.G_VAR.buttons._print = "1";
            }
            break;
        // 배송완료
        case $ND.C_PROCESS_DELIVERY:
            // 공통 버튼 활성화 처리
            if (G_GRDMASTERE.data.getLength() > 0) {
                $NC.G_VAR.buttons._save = "1";
                $NC.G_VAR.buttons._print = "1";
            }
            break;
    }

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function setReportInfo() {

    var PROGRAM_SUB_CD = [ ];

    // 레포트 세팅
    switch ($NC.G_VAR.activeView.PROCESS_CD) {
        // 출고 등록
        case $ND.C_PROCESS_ENTRY:
            // 현재 프로세스 단계 레포트 추가(현재 출고 등록에 레포트가 없으나 기본 코딩은 함)
            PROGRAM_SUB_CD.push($ND.C_PROCESS_ENTRY);
            // 출고지시 스킵시 출고지시 레포트 포함
            if (!$NC.isEnable("#btnProcessC")) {
                PROGRAM_SUB_CD.push($ND.C_PROCESS_DIRECTIONS);
            }
            break;
        case $ND.C_PROCESS_ENTRY_BATCH:
            // 현재 프로세스 단계 레포트 추가(현재 일괄출고 등록에 레포트가 없으나 기본 코딩은 함)
            PROGRAM_SUB_CD.push($ND.C_PROCESS_ENTRY_BATCH);
            // 출고지시 스킵하더라도 일괄출고등록에는 출고지시 레포트 포함하지 않음
            /*
            if (!$NC.isEnable("#btnProcessC")) {
                PROGRAM_SUB_CD.push($ND.C_PROCESS_DIRECTIONS);
            }
            */
            break;
        // 출고 지시
        case $ND.C_PROCESS_DIRECTIONS:
            // 이전 단계 레포트도 출력되도록 추가
            PROGRAM_SUB_CD.push($ND.C_PROCESS_ENTRY);
            // 현재 프로세스 단계 레포트 추가
            PROGRAM_SUB_CD.push($ND.C_PROCESS_DIRECTIONS);
            break;
        // 출고 확정
        case $ND.C_PROCESS_CONFIRM:
            // 이전 단계 레포트도 출력되도록 추가
            PROGRAM_SUB_CD.push($ND.C_PROCESS_ENTRY + $ND.C_SEP_DATA + $ND.C_PROCESS_DIRECTIONS);
            // 현재 프로세스 단계 레포트 추가
            PROGRAM_SUB_CD.push($ND.C_PROCESS_CONFIRM);
            // 배송완료 스킵시 배송완료 레포트 포함(현재 배송완료에 레포트가 없으나 기본 코딩은 함)
            if (!$NC.isEnable("#btnProcessE")) {
                PROGRAM_SUB_CD.push($ND.C_PROCESS_DELIVERY);
            }
            break;
        // 배송완료
        case $ND.C_PROCESS_DELIVERY:
            // 이전 단계 레포트도 출력되도록 추가
            PROGRAM_SUB_CD.push($ND.C_PROCESS_ENTRY + $ND.C_SEP_DATA + $ND.C_PROCESS_DIRECTIONS + $ND.C_SEP_DATA + $ND.C_PROCESS_CONFIRM);
            // 현재 프로세스 단계 레포트 추가
            PROGRAM_SUB_CD.push($ND.C_PROCESS_DELIVERY);
            break;
    }

    // 프로그램 레포트 정보 세팅
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    $NC.setProgramReportInfo({
        P_PROGRAM_SUB_CD: $NC.toJoin(PROGRAM_SUB_CD),
        P_BU_CD: BU_CD
    }, function(reportInfo) {
        // 출고지시 스킵시 출고등록 단계에서는 오더피킹지시서만 표시되도록 조정
        if ($NC.G_VAR.activeView.PROCESS_CD == $ND.C_PROCESS_ENTRY) {
            // PAPER_LOB03 - 토탈피킹지시서
            // PAPER_LOB04 - 분배지시서
            // PAPER_LOB05 - 차량별토탈피킹지시서
            // PAPER_LOB06 - 차량별분배지시서
            // PAPER_LOB08 - 배송처별토탈피킹지시서
            return reportInfo.REPORT_CD != "PAPER_LOB03" //
                && reportInfo.REPORT_CD != "PAPER_LOB04" //
                && reportInfo.REPORT_CD != "PAPER_LOB05" //
                && reportInfo.REPORT_CD != "PAPER_LOB06" //
                && reportInfo.REPORT_CD != "PAPER_LOB08";
        }

        return true;
    });
}

function onGetMasterSummary(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    var PROCESS_CD;
    if (dsResult.length == 0) {
        for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
            $NC.setValue("#divProcessCnt" + PROCESS_CD, "0 / 0");
        }
    } else {
        var rowData = dsResult[0];
        var PROCESS_CNT, PROCESS_QTY;
        for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
            PROCESS_CNT = $NC.getDisplayNumber($NC.nullToDefault(rowData["CNT_" + PROCESS_CD], "0"));
            PROCESS_QTY = $NC.getDisplayNumber($NC.nullToDefault(rowData["QTY_" + PROCESS_CD], "0"));

            $NC.setValue("#divProcessCnt" + PROCESS_CD, PROCESS_CNT + " / " + PROCESS_QTY);
        }
    }
}

function onGetProcessInfo(ajaxData) {

    var PROCESS_CD;
    // 버튼 전체 비활성화
    for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
        $NC.setEnable("#btnProcess" + PROCESS_CD, false);
    }
    $NC.setEnable("#btnProcessBT", false);

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult.length;
    if (rCount > 0) {
        var rowData;
        // 프로세스 사용 가능여부 세팅
        for (var rIndex = 0; rIndex < rCount; rIndex++) {
            rowData = dsResult[rIndex];
            $NC.setEnable("#btnProcess" + rowData.PROCESS_CD, rowData.EXEC_PROCESS_YN == $ND.C_YES);
        }
        $NC.setEnable("#btnProcessBT", $NC.isEnable("#btnProcessB"));

        if ($NC.isEnable("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD)) {
            return;
        }
        // 현재 선택된 프로세스 View가 사용 가능하지 않으면 사용가능한 첫번째 뷰 선택
        for (PROCESS_CD in $NC.G_VAR.stateFWBW) {
            if ($NC.isEnable("#btnProcess" + PROCESS_CD)) {
                $("#btnProcess" + PROCESS_CD).click();
                return;
            }
        }
    }

    $("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD).removeClass("stySelect");
    $("#divSubView" + $NC.G_VAR.activeView.PROCESS_CD).hide();
    // alert($NC.getDisplayMsg("JS.LOB02010E0.018", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록하십시오."));
    $NC.G_VAR.activeView.PROCESS_CD = "";
    $NC.showMessage({
        message: $NC.getDisplayMsg("JS.LOB02010E0.018", "수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록하십시오."),
        width: 400,
        autoCloseDelayTime: $ND.C_TIMEOUT_CLOSE
    });
}

function setMasterSummaryInfo() {

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
    var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    var INOUT_CD = $NC.getValue("#cboQInout_Cd");
    var REGION_DIV = $NC.getValue("#cboQRegion_Div");

    var BU_NO = $NC.getValue("#edtQBu_No", true);
    var SO_NO = $NC.getValue("#edtQSo_No", true);
    var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
    var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

    var CAR_DIV = $NC.getValue("#cboQCar_Div", true);
    var ERP_BATCH = $NC.getValue("#cboQErp_Batch", true);
    var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
    var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
    var DELIVERY_DIV = $NC.getValue("#cboQDelivery_Div", true);

    // 데이터 조회
    $NC.serviceCall("/LOB02010E0/getDataSet.do", {
        P_QUERY_ID: "LOB02010E0.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_ORDER_DATE1: ORDER_DATE1,
            P_ORDER_DATE2: ORDER_DATE2,
            P_INOUT_CD: INOUT_CD,
            P_BU_NO: BU_NO,
            P_SO_NO: SO_NO,
            P_BRAND_CD: BRAND_CD,
            P_ITEM_CD: ITEM_CD,
            P_ITEM_NM: ITEM_NM,
            P_CAR_DIV: CAR_DIV,
            P_ERP_BATCH: ERP_BATCH,
            P_DELIVERY_CD: DELIVERY_CD,
            P_RDELIVERY_CD: RDELIVERY_CD,
            P_DELIVERY_DIV: DELIVERY_DIV,
            P_REGION_DIV: REGION_DIV
        }
    }, onGetMasterSummary);
}

function setMasterProcessInfo() {

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");

    // 데이터 조회
    $NC.serviceCall("/LOB02010E0/getDataSet.do", {
        P_QUERY_ID: "WC.GET_PROCESS_INFO",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_PROCESS_GRP: $ND.C_PROCESS_GRP_OUT
        }
    }, onGetProcessInfo);
}

function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd")
    }, function() {
        window.grdDetailBOnSetColumns();
        window.grdDetailCOnSetColumns();
        window.grdDetailDOnSetColumns();
        window.grdSubDOnSetColumns();

        $NC.setValue("#edtBill_Cnt", $NC.G_VAR.policyVal.LO341);
        $NC.setVisible("#divDelivery_BatchB", $NC.G_VAR.policyVal.LO720 == $ND.C_YES);
        $NC.setVisible("#divDelivery_BatchBT", $NC.G_VAR.policyVal.LO720 == $ND.C_YES);

        $NC.onGlobalResize();
    });
}

function setProcessStateInfo() {

    for ( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
        $NC.G_VAR.stateFWBW[PROCESS_CD].CONFIRM = "";
        $NC.G_VAR.stateFWBW[PROCESS_CD].CANCEL = "";
    }

    // 값 오류 체크는 안함
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var PROCESS_GRP = $ND.C_PROCESS_GRP_OUT;

    // 데이터 조회
    $NC.serviceCall("/LOB02010E0/getDataSet.do", {
        P_QUERY_ID: "WC.GET_PROCESS_STATE_FWBW",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_PROCESS_GRP: PROCESS_GRP
        }
    }, onGetProcessState);
}

function onGetProcessState(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if ($NC.isNull(dsResult)) {
        return;
    }

    var rowData;
    for (var rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
        rowData = dsResult[rIndex];
        if (rowData.PROCESS_CD == $ND.C_NULL) {
            $NC.G_VAR.PROCESS_YN = $NC.isNotNull(rowData.PROCESS_STATE_CONFIRM) ? $ND.C_YES : $ND.C_NO;
        } else {
            $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CONFIRM = rowData.PROCESS_STATE_CONFIRM;
            $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CANCEL = rowData.PROCESS_STATE_CANCEL;
        }
    }

    // [처리가능 진행상태] 값이 세팅되기 전 마스터가 자동 조회될 경우
    // 처리가능 프로세스 이미지가 잘못 표시됨(X), 정상 표시되도록 그리드 새로고침
    var grdObject = $NC.getGridObject("G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD);
    if (grdObject.isValid) {
        grdObject.view.invalidate();
    }
}

function getOutboundState(params, onSuccess) {

    // 데이터 조회
    $NC.serviceCall("/LOB02010E0/getData.do", {
        P_QUERY_ID: "WF.GET_LO_OUTBOUND_STATE",
        P_QUERY_PARAMS: params
    }, onSuccess);
}

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

    // 출고차수 새로고침
    setOutboundBatchCombo("#cboQOutbound_BatchC", false);
    setOutboundBatchCombo("#cboOutbound_BatchC", false);
    setOutboundBatchCombo("#cboQOutbound_BatchD", true);

    // ERP 차수 새로고침
    setErpBatchCombo($NC.G_VAR.activeView.PROCESS_CD);

    // 운송사(택배용) 세팅 - 운송사(택배용) 콤보
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCARRIER_HDC",
        P_QUERY_PARAMS: {
            P_CARRIER_CD: $ND.C_ALL,
            P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
            P_HDC_DIV_ATTR03_CD: $ND.C_ALL, // Y:정제대상, N:정제미대상, %: 전체
            P_HDC_DIV_ATTR05_CD: "1", // 1:B2B, 2:B2C
            P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboCarrier_CdB",
        codeField: "CARRIER_CD",
        nameField: "CARRIER_NM",
        fullNameField: "CARRIER_CD_F"
    });

    // 배송처 조회조건 초기화
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    // 실배송처 조회조건 초기화
    $NC.setValue("#edtQRDelivery_Cd");
    $NC.setValue("#edtQRDelivery_Nm");
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");

    onChangingCondition();
    setMasterProcessInfo();
    setPolicyValInfo();
    setProcessStateInfo();
    // 레포트 정보 재세팅
    setReportInfo();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

    var BU_CD = $NC.getValue("#edtQBu_Cd");

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
    onChangingCondition();
}

function showDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: $ND.C_ALL,
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

function showRDeliveryPopup() {

    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NP.showDeliveryPopup({
        queryParams: {
            P_CUST_CD: CUST_CD,
            P_DELIVERY_CD: $ND.C_ALL,
            P_DELIVERY_DIV: $ND.C_ALL,
            P_VIEW_DIV: "2"
        }
    }, onRDeliveryPopup, function() {
        $NC.setFocus("#edtQRDelivery_Cd", true);
    });
}

function onRDeliveryPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQRDelivery_Cd", resultInfo.DELIVERY_CD);
        $NC.setValue("#edtQRDelivery_Nm", resultInfo.DELIVERY_NM);
    } else {
        $NC.setValue("#edtQRDelivery_Cd");
        $NC.setValue("#edtQRDelivery_Nm");
        $NC.setFocus("#edtQRDelivery_Cd", true);
    }
    onChangingCondition();
}

/**
 * 운송권역 검색 팝업 표시
 */
function showDeliveryAreaPopup() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    $NP.showDeliveryAreaPopup({
        queryParams: {
            P_CENTER_CD: CENTER_CD,
            P_AREA_CD: $ND.C_ALL
        }
    }, onDeliveryAreaPopup, function() {
        $NC.setFocus("#edtQArea_Cd");
    });
}

function onDeliveryAreaPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQArea_Cd", resultInfo.AREA_CD);
        $NC.setValue("#edtQArea_Nm", resultInfo.AREA_NM);
    } else {
        $NC.setValue("#edtQArea_Cd");
        $NC.setValue("#edtQArea_Nm");
        $NC.setFocus("#edtQArea_Cd", true);
    }
    onChangingCondition();
}

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo(comboId, isAddAll, setPos) {

    var position, selectOption = null, selectVal = null;
    if ($NC.isNull(setPos)) {
        position = "first";
    } else {
        position = setPos;
    }
    if (position == "first") {
        selectOption = "F";
    } else if (position == "last") {
        selectOption = "L";
    }
    if ($NC.isNull(selectOption)) {
        selectVal = position;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
    // 출고작업구분(1:기본출고, 2:온라인출고)
    var OUTBOUND_DIV = "1";
    // 출고 지시(입력용)일 경우 토탈출고만
    var OUTBOUND_BATCH_GRP = null;
    var onComplete;
    if (comboId == "#cboOutbound_BatchC") {
        OUTBOUND_BATCH_GRP = "1";
        onComplete = function() {
            $NC.setEnable("#edtOutbound_Batch_NmC", $NC.getValue("#cboOutbound_BatchC") == $ND.C_BASE_BATCH_NO);
        };
    }

    // 조회조건 - 출고차수 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
        P_QUERY_PARAMS: {
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_OUTBOUND_DIV: OUTBOUND_DIV,
            P_OUTBOUND_BATCH_GRP: OUTBOUND_BATCH_GRP
        }
    }, {
        selector: comboId,
        codeField: "OUTBOUND_BATCH",
        fullNameField: "OUTBOUND_BATCH_F",
        addAll: isAddAll,
        addCustom: !isAddAll ? {
            codeFieldVal: $ND.C_BASE_BATCH_NO,
            nameFieldVal: "신규"
        } : null,
        selectOption: selectOption,
        selectVal: selectVal,
        onComplete: onComplete,
        forceSync: true
    });
}

/**
 * 물류센터/사업부/출고일자 값 변경시 운송차수 콤보 재설정
 */
function setDeliveryBatchCombo(processCd) {

    if ($NC.isNull(processCd)) {
        processCd = $ND.C_PROCESS_ENTRY_BATCH;
    }

    var cboSelector = "#cboDelivery_Batch" + processCd;
    // 조회조건 - 운송차수 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_DELIVERY_BATCH",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_OUTBOUND_DATE: $NC.getValue("#dtpOutbound_Date" + processCd)
        }
    }, {
        selector: cboSelector,
        codeField: "DELIVERY_BATCH",
        nameField: "DELIVERY_BATCH_D",
        fullNameField: "DELIVERY_BATCH_F",
        addCustom: {
            codeFieldVal: $ND.C_BASE_BATCH_NO,
            nameFieldVal: "신규"
        },
        selectOption: "L",
        onComplete: function() {
            $NC.setEnable("#edtDelivery_Batch_Nm" + processCd, $NC.getValue(cboSelector) == $ND.C_BASE_BATCH_NO);
        }
    });
}

/**
 * 물류센터/사업부/출고일자 값 변경시 ERP차수 콤보 재설정
 */
function setErpBatchCombo(processCd) {

    var ORDER_DATE1, ORDER_DATE2;
    if ($NC.isNull(processCd)) {
        processCd = $ND.C_PROCESS_ENTRY;
    }
    if (processCd == $ND.C_PROCESS_ENTRY || processCd == $ND.C_PROCESS_ENTRY_BATCH) {
        ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
        ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
    }

    $NC.setInitCombo("/LOB02010E0/getDataSet.do", {
        P_QUERY_ID: "LOB02010E0.RS_SUB5",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
            P_BU_CD: $NC.getValue("#edtQBu_Cd"),
            P_ORDER_DATE1: ORDER_DATE1,
            P_ORDER_DATE2: ORDER_DATE2,
            P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date")
        }
    }, {
        selector: "#cboQErp_Batch",
        codeField: "ERP_BATCH",
        fullNameField: "ERP_BATCH",
        addAll: true
    });
}
