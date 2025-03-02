/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LIC02310E0
 *  프로그램명         : PDA 입고검수[단일상품매핑]
 *  프로그램설명       : PDA 입고검수[단일상품매핑] 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-02-27
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-02-27    ASETEC           신규작성
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
            container: "#ctrMasterView",
            exceptHeight: function() {
                return $NC.getViewHeight("#ctrActionBar");
            }
        },
        ignoreKeyUp: false,
        lastPalletId: null,
        masterData: null,

        // 체크할 정책 값
        policyVal: {
            CM490: "", // 상품일련번호 관리여부
            LI230: "", // 파렛트ID 매핑 기준
            LI530: "", // [PDA]검수처리방식
            LS210: "" // 재고 관리 기준
        }
    });

    $NC.setVisible("#tdQDsp_Brand_Nm", false);
    // 컨테이너 클릭시 포커스 이동 처리
    $("body").click(onContainerFocus);
    // 이전버튼 클릭 -> 메인 종료로 처리
    $("#btnClose").click($NC.G_MAIN.btnCloseOnClick);
    // 취소버튼 클릭 -> _Cancel로 처리
    $("#btnCancel").click(_Cancel);
    // 처리버튼 클릭 -> _Save로 처리
    $("#btnSave").click(_Save);
    // 수량 입력
    $("#lblConfirm_Qty").click(onQtyApply);

    $NC.setInitDatePicker("#dtpValid_Date", null, "N");

    // 정책 값 읽기
    setPolicyValInfo();
    // 권한 설정
    setUserProgramPermission();
}

/**
 * Window Open 시 호출 됨
 */
function _OnLoaded() {

    // setFocusScan();
    _Cancel();
}

/**
 * Window Focus 시 호출 됨
 */
function _OnFocus() {

    setFocusScan();
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

    // 기본정보 변경, id는 무조건 기본정보 뷰의 id 기준
    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "CENTER_CD":
            setPolicyValInfo();
            break;
        case "BU_CD":
            setPolicyValInfo();
            break;
        case "WORK_DATE":
            break;
    }

    // 조건 변경시 초기화
    _Cancel($ND.C_CLEAR_TYPE_ALL);
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

    var id = view.prop("id").substr(3).toUpperCase(), //
    changeQty, confirmQty;

    switch (id) {
        case "PALLET_ID":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onPalletScan(view, val);
            break;
        case "VALID_DATE":
            if ($NC.isNotNull(val)) {
                if (!$NC.isDate(val)) {
                    alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "유통기한을 정확히 입력하십시오."));
                    $NC.G_VAR.masterData.VALID_DATE = "";
                    $NC.setValue(view);
                    $NC.setFocus(view);
                } else {
                    // 기본 포맷으로 변경된 날짜, Editor의 값도 동일하게 변경
                    $NC.G_VAR.masterData.VALID_DATE = $NC.getDate(val);
                    $NC.setValue(view, $NC.G_VAR.masterData.VALID_DATE);
                }
            } else {
                $NC.G_VAR.masterData.VALID_DATE = val;

                $NC.setFocus("#edtConfirm_Qty");
            }
            break;
        case "BATCH_NO":
            $NC.G_VAR.masterData.BATCH_NO = val;
            break;
        case "CONFIRM_BOX":
            changeQty = $NC.toNumber(val, -1);
            if (changeQty == -1) {
                alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수BOX 수량을 정확히 입력하십시오."));
                $NC.setFocus(view);
                return;
            }
            confirmQty = $NC.getBQty(changeQty, $NC.G_VAR.masterData.CONFIRM_EA, $NC.G_VAR.masterData.QTY_IN_BOX);
            // 수송입고
            if ($NC.G_VAR.masterData.INOUT_SUB_CD == "E2") {
                if ($NC.G_VAR.masterData.ENTRY_QTY < confirmQty) {
                    alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수수량이 지시수량보다 클 수 없습니다."));
                    $NC.setValue(view, $NC.G_VAR.masterData.CONFIRM_BOX); // 수량 복원
                    $NC.setFocus(view);
                    return;
                }
            }

            // Editor 수량 및 데이터 수량 변경
            $NC.G_VAR.masterData.CONFIRM_BOX = changeQty;
            $NC.G_VAR.masterData.CONFIRM_QTY = confirmQty;

            $NC.setValue("#edtConfirm_Qty", confirmQty);
            break;
        case "CONFIRM_EA":
            changeQty = $NC.toNumber(val, -1);
            if (changeQty == -1) {
                alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수EA 수량을 정확히 입력하십시오."));
                $NC.setFocus(view);
                return;
            }
            confirmQty = $NC.getBQty($NC.G_VAR.masterData.CONFIRM_BOX, changeQty, $NC.G_VAR.masterData.QTY_IN_BOX);
            // 수송입고
            if ($NC.G_VAR.masterData.INOUT_SUB_CD == "E2") {
                if ($NC.G_VAR.masterData.ENTRY_QTY < confirmQty) {
                    alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수수량이 지시수량보다 클 수 없습니다."));
                    $NC.setValue(view, $NC.G_VAR.masterData.CONFIRM_EA); // 수량 복원
                    $NC.setFocus(view);
                    return;
                }
            }

            // Editor 수량 및 데이터 수량 변경
            $NC.G_VAR.masterData.CONFIRM_EA = changeQty;
            $NC.G_VAR.masterData.CONFIRM_QTY = confirmQty;

            $NC.setValue("#edtConfirm_Qty", confirmQty);
            break;
        case "CONFIRM_QTY":
            changeQty = $NC.toNumber(val, -1);
            if (changeQty == -1) {
                alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수 수량을 정확히 입력하십시오."));
                $NC.setFocus(view);
                return;
            }
            // 수송입고
            if ($NC.G_VAR.masterData.INOUT_SUB_CD == "E2") {
                if ($NC.G_VAR.masterData.ENTRY_QTY < changeQty) {
                    alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수수량이 지시수량보다 클 수 없습니다."));
                    $NC.setValue(view, $NC.G_VAR.masterData.CONFIRM_QTY); // 수량 복원
                    $NC.setFocus(view);
                    return;
                }
            }

            // Editor 수량 및 데이터 수량 변경
            $NC.G_VAR.masterData.CONFIRM_BOX = $NC.getBBox(changeQty, $NC.G_VAR.masterData.QTY_IN_BOX);
            $NC.G_VAR.masterData.CONFIRM_EA = $NC.getBEa(changeQty, $NC.G_VAR.masterData.QTY_IN_BOX);
            $NC.G_VAR.masterData.CONFIRM_QTY = changeQty;

            $NC.setValue("#edtConfirm_Box", $NC.G_VAR.masterData.CONFIRM_BOX);
            $NC.setValue("#edtConfirm_Ea", $NC.G_VAR.masterData.CONFIRM_EA);

            // 포커스 유지
            setFocusScan("#edtConfirm_Qty");
            break;
    }
}

/**
 * Input KeyUp Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnInputKeyUp(e, view) {

    // Enter Key일 경우만 처리
    if (e.keyCode != 13) {
        return;
    }

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "PALLET_ID":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onPalletScan(view, $NC.getValue(view));
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

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

    // 저장 전 Validation
    if ($NC.isNull($NC.G_VAR.masterData)) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "파렛트ID를 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    // 수송입고
    if ($NC.G_VAR.masterData.INOUT_SUB_CD == "E2") {
        if ($NC.G_VAR.masterData.ENTRY_QTY < $NC.G_VAR.masterData.CONFIRM_QTY) {
            alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수수량이 지시수량보다 클 수 없습니다."));
            setFocusScan("#edtConfirm_Qty");
            return;
        }
    }

    // 유통기한필수대상 상품일 경우 유통기한 체크
    if ($NC.G_VAR.masterData.VALID_DATE_REQ_YN == $ND.C_YES && $NC.isNull($NC.G_VAR.masterData.VALID_DATE)) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "유통기한필수대상 상품입니다. 유통기한을 입력하십시오."));
        setFocusScan("#dtpValid_Date");
        return;
    }

    // 제조번호필수대상 상품일 경우 제조번호 체크
    if ($NC.G_VAR.masterData.BATCH_NO_REQ_YN == $ND.C_YES && $NC.isNull($NC.G_VAR.masterData.BATCH_NO)) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "제조번호필수대상 상품입니다. 제조번호를 입력하십시오."));
        setFocusScan("#edtBatch_No");
        return;
    }

    // 검수 자동처리 시 확인 alert 생략
    if ($NC.G_VAR.policyVal.LI530 != "2") {
        if (!confirm($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수 처리하시겠습니까?"))) {
            setFocusScan();
            return;
        }
    }

    $NC.serviceCall("/PDA_LIC02310E0/callLIProcInspectT1.do", {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
        P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
        P_LINE_NO: $NC.G_VAR.masterData.LINE_NO,
        P_PALLET_ID: $NC.G_VAR.masterData.PALLET_ID,
        P_VALID_DATE: $NC.G_VAR.masterData.VALID_DATE,
        P_BATCH_NO: $NC.G_VAR.masterData.BATCH_NO,
        P_ENTRY_QTY: $NC.G_VAR.masterData.ENTRY_QTY,
        P_CONFIRM_QTY: $NC.G_VAR.masterData.CONFIRM_QTY,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onPalletError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel(clearType) {

    // clearType
    // C_CLEAR_TYPE_ALL: 0
    // C_CLEAR_TYPE_MASTER: 1
    // C_CLEAR_TYPE_DETAIL: 2
    // C_CLEAR_TYPE_SUB: 3
    // if ($NC.isNull(clearType)) {
    // clearType = $ND.C_CLEAR_TYPE_ALL;
    // }
    // clearType가 취소 버튼 클릭 Event Object일 경우도 있음
    // if (clearType instanceof $.Event || $NC.isNull(clearType)) {
    // clearType = $ND.C_CLEAR_TYPE_ALL;
    // }
    // 전역 변수 초기화
    $NC.G_VAR.masterData = null;
    $NC.G_VAR.lastPalletId = null;
    $NC.setValue("#edtPallet_Id");

    // 모두 비활성
    setInputValue();
    $NC.setEnableGroup("#ctrMasterView", false);

    // 스캔만 활성, 포커스
    $NC.setEnable("#edtPallet_Id");
    setFocusScan();
    // }
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
 * 최상위 컨테이너 Click에 이벤트 바인딩하여 스캔 Edit로 포커스 이동 처리
 * 
 * @param e
 * @returns
 */
function onContainerFocus(e) {

    var $view = $(e.target);
    // 하단 액션버튼은 처리 안함
    if ($view.is("span") && $view.parent(".btnAction").length > 0) {
        return;
    }
    // 스캔 Element - 파렛트ID
    if ($view.prop("id") == "edtPallet_Id") {
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        setFocusScan();
    }
}

function setFocusScan(selector) {

    var $view;

    if ($NC.isNull(selector)) {
        if ($NC.isNull($NC.G_VAR.lastPalletId)) {
            $view = $NC.getView("#edtPallet_Id");
        } else {
            $view = $NC.getView("#edtConfirm_Qty");
        }
    } else {
        $view = $NC.getView(selector);
    }

    if ($NC.isEnable($view)) {
        // Delay 처리
        setTimeout(function() {
            $view.focus();
            $NC.hideSoftInput(); // 일단 스캔 항목 키보드 숨김 처리
        }, $ND.C_TIMEOUT_FOCUS);
    }
}

function setInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtInbound_Date", rowData["INBOUND_DATE"]);
    $NC.setValue("#edtInbound_No", rowData["INBOUND_NO"]);
    $NC.setValue("#edtVendor_Nm", rowData["VENDOR_NM"]);
    $NC.setValue("#edtItem_Cd", rowData["ITEM_CD"]);
    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtItem_State", rowData["ITEM_STATE_F"]);
    $NC.setValue("#dtpValid_Date", rowData["VALID_DATE"]);
    $NC.setValue("#edtBatch_No", rowData["BATCH_NO"]);
    $NC.setValue("#edtRec_Location_Cd", rowData["PUTAWAY_LOCATION_CD"]);
    $NC.setValue("#edtQty_In_Box", rowData["QTY_IN_BOX"]);
    $NC.setValue("#edtBox_In_Plt", rowData["BOX_IN_PLT"]);
    $NC.setValue("#edtPlt_Tihi", rowData["PLT_TIHI"]);
    $NC.setValue("#edtKeep_Div", rowData["KEEP_DIV_D"]);
    $NC.setValue("#edtEntry_Box", rowData["ENTRY_BOX"]);
    $NC.setValue("#edtEntry_Ea", rowData["ENTRY_EA"]);
    $NC.setValue("#edtEntry_Qty", rowData["ENTRY_QTY"]);
    $NC.setValue("#edtConfirm_Box", rowData["CONFIRM_BOX"]);
    $NC.setValue("#edtConfirm_Ea", rowData["CONFIRM_EA"]);
    $NC.setValue("#edtConfirm_Qty", rowData["CONFIRM_QTY"]);

    setFocusScan("#edtConfirm_Qty");
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "파렛트ID 정보가 없습니다."));
        _Cancel();
        return;
    }
    var resultData = dsResult[0];
    if (resultData.INBOUND_STATE != $ND.C_STATE_DIRECTIONS) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "입고진행 상태 : [" + resultData.INBOUND_STATE + "] 검수가능한 상태가 아닙니다.", resultData.INBOUND_STATE));
        _Cancel();
        return;
    }
    if (resultData.CENTER_CD != $NC.G_USERINFO.CENTER_CD) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "물류센터: [" + resultData.CENTER_CD + "] 설정된 물류센터와 다른 물류센터의 파렛트ID입니다.", resultData.BU_CD));
        _Cancel();
        return;
    }
    if (resultData.BU_CD != $NC.G_USERINFO.BU_CD) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "사업부: [" + resultData.BU_CD + "] 설정된 사업부와 다른 사업부의 파렛트ID입니다.", resultData.BU_CD));
        _Cancel();
        return;
    }
    if (resultData.INBOUND_DATE != $NC.G_USERINFO.WORK_DATE) {
        alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "입고일자: [" + resultData.INBOUND_DATE + "] 설정된 작업일자와 다른 입고일자의 파렛트ID입니다.",
            resultData.INBOUND_DATE));
        _Cancel();
        return;
    }

    // 입고일련번호관리대상 상품일 경우 일련번호 체크
    if ($NC.G_VAR.policyVal.CM490 == $ND.C_YES) {
        if (resultData.SERIAL_IN_DIV == $ND.C_POLICY_VAL_2 && resultData.SERIAL_QTY != resultData.CONFIRM_QTY) {
            alert($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "입고일련번호관리대상 상품입니다.\n[입고시리얼관리]화면에서 작업 후 진행하십시오."));
            _Cancel();
            return;
        }
    }

    if (resultData.INSPECT_YN == $ND.C_YES) {
        if (!confirm($NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "검수 처리된 파렛트ID입니다.\n재검수 처리하시겠습니까?"))) {
            _Cancel();
            return;
        }
    }

    // 값 세팅
    $NC.G_VAR.masterData = resultData;
    $NC.setEnableGroup("#ctrMasterView");
    setInputValue($NC.G_VAR.masterData);

    // 스캔 즉시 적치 처리
    if ($NC.G_VAR.policyVal.LI530 == "2") {
        _Save();
        return;
    }
}

function onPalletScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtPallet_Id");
        scanVal = $NC.getValue($scan);
    }

    // 파렛트ID
    if ($NC.isNull(scanVal)) {
        _Cancel();
        return;
    }

    // 초기화
    _Cancel();

    $NC.G_VAR.lastPalletId = scanVal;
    $NC.setValue($scan, scanVal);

    // 데이터 조회
    $NC.serviceCall("/PDA_LIC02310E0/getDataSet.do", {
        P_QUERY_ID: "PDA_LIC02310E0.RS_MASTER",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_PALLET_ID: $NC.G_VAR.lastPalletId
        }
    }, onGetMaster, onPalletError);
}

function onSave(ajaxData) {

    var title = $NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "확인"), //
    message = $NC.getDisplayMsg("JS.PDA_LIC02310E0.XXX", "정상 처리되었습니다."), //
    buttons = {};
    buttons[title] = function() {
        _Cancel();
    };

    $NC.showMessage({
        title: title,
        message: message,
        width: 300,
        height: 150,
        autoCloseDelayTime: $ND.C_TIMEOUT_CLOSE,
        buttons: buttons
    });
}

function onPalletError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel();
    setFocusScan();
}

// 확정수량을 등록수량으로 UPDATE
function onQtyApply() {

    if ($NC.isNull($NC.G_VAR.lastPalletId)) {
        setFocusScan();
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData)) {
        setFocusScan();
        return;
    }

    if ($NC.G_VAR.masterData.ENTRY_QTY == $NC.G_VAR.masterData.CONFIRM_QTY) {
        setFocusScan("#edtConfirm_Qty");
        return;
    }

    $NC.G_VAR.masterData.CONFIRM_BOX = $NC.G_VAR.masterData.ENTRY_BOX;
    $NC.G_VAR.masterData.CONFIRM_EA = $NC.G_VAR.masterData.ENTRY_EA;
    $NC.G_VAR.masterData.CONFIRM_QTY = $NC.G_VAR.masterData.ENTRY_QTY;

    $NC.setValue("#edtConfirm_Box", $NC.G_VAR.masterData.CONFIRM_BOX);
    $NC.setValue("#edtConfirm_Ea", $NC.G_VAR.masterData.CONFIRM_EA);
    $NC.setValue("#edtConfirm_Qty", $NC.G_VAR.masterData.CONFIRM_QTY);

    setFocusScan("#edtConfirm_Qty");
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();

    if (!permission.canSave) {
        $("#btnSave").addClass("styDisabled");
    }
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD
    }, function() {
        // 재고관리기준에 따라 유효일자/배치번호별 표시/비표시
        // 1 - 입고일자별, 2 - 입고일자, 유효일자/배치번호별
        if ($NC.G_VAR.policyVal.LS210 == "2") {
            $NC.setVisible("#ctrValidDate");
            // $NC.setVisible("#ctrBatchNo");
        } else {
            $NC.setVisible("#ctrValidDate", false);
            // $NC.setVisible("#ctrBatchNo", false);
        }
        // 파렛트ID 매핑 기준 정책값에 따라 화면 강제 종료
        // 단일화면이므로 멀티는 종료
        switch ($NC.G_VAR.policyVal.LI230) {
            // 입고검수 - 단일
            case "1":
                break;
            // 입고검수 - 멀티
            // case "2":
            // case "3":
            // break;
            default:
                alert("해당 사업부는 사용할 수 없는 프로그램입니다. 프로그램을 종료합니다.");
                $NC.G_MAIN.hideDefaultInfoLayer();
                setTimeout(function() {
                    $("#btnClose").click();
                }, $ND.C_TIMEOUT_CLOSE_FAST);
                return;
        }
    });
}