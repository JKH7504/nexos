/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LFC04021P0
 *  프로그램명         : 전월데이터복사 팝업
 *  프로그램설명       : 전월데이터복사 팝업 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2021-04-29
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2021-04-29    ASETEC           신규작성
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
                container: "#divLeftView"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: 300
        }
    });

    $NC.setInitMonthPicker("#mtpFrom_Month");
    $NC.setInitMonthPicker("#mtpTo_Month");

    // 버튼 클릭 이벤트 연결
    $("#btnCancel").click(onCancel);
    $("#btnCopy").click(onPreviousMonthDataCopy);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    var previousMonth = $NC.addMonth($NC.G_VAR.G_PARAMETER.P_ADJUST_MONTH + "-01", -1);
    previousMonth = $NC.dateToStr(new Date(previousMonth), true);

    $NC.setValue("#mtpFrom_Month", previousMonth);
    $NC.setValue("#mtpTo_Month", $NC.G_VAR.G_PARAMETER.P_ADJUST_MONTH);

    $NC.setFocus("#mtpFrom_Month");
}

/**
 * 화면 리사이즈 Offset 계산
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
 * 조회
 */
function _Inquiry() {
}

/**
 * 신규
 */
function _New() {
}

/**
 * 저장
 */
function _Save() {

}

/**
 * 삭제
 */
function _Delete() {
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "FROM_MONTH":
            $NC.setValueMonthPicker(view, val, $NC.getDisplayMsg("JS.LFC04021P0.002", "정산월을 정확히 입력하십시오."));
            break;
        case "TO_MONTH":
            if (!$NC.isMonth(val)) {
                alert($NC.getDisplayMsg("JS.LFC04021P0.002", "정산월을 정확히 입력하십시오."));
                $NC.setValue("#mtpTo_Month", $NC.G_VAR.G_PARAMETER.P_ADJUST_MONTH);
                $NC.setFocus("#mtpTo_Month");
                return;
            } else {
                // 보안일자 체크
                $NC.serviceCallAndWait("/LFC04020E0/getDataSet.do", {
                    P_QUERY_ID: "WC.GET_PROTECT",
                    P_QUERY_PARAMS: {
                        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
                        P_PROTECT_DATE: val + "-01"
                    }
                }, onGetProtectInfo);
            }
            break;
    }
}

function onPreviousMonthDataCopy() {

    var FROM_MONTH = $NC.getValue("#mtpFrom_Month");
    if ($NC.isNull(FROM_MONTH)) {
        alert($NC.getDisplayMsg("JS.LFC04021P0.003", "정산월을 입력하십시오."));
        $NC.setFocus("#mtpFrom_Month");
        return;
    }

    var TO_MONTH = $NC.getValue("#mtpTo_Month");
    if ($NC.isNull(TO_MONTH)) {
        alert($NC.getDisplayMsg("JS.LFC04021P0.003", "정산월을 입력하십시오."));
        $NC.setFocus("#mtpTo_Month");
        return;
    }
    if (FROM_MONTH >= TO_MONTH) {
        alert($NC.getDisplayMsg("JS.LFC04021P0.004", "복사대상 월보다 복사 월이 낮을 수 없습니다.\n\n다시 선택하십시오."));
        $NC.setFocus("#mtpTo_Month");
        return;
    }
    if (!confirm($NC.getDisplayMsg("JS.LFC04021P0.005", "복사 월의 등록된 데이터는 모두 삭제됩니다.\n\n그래도 복사하시겠습니까?"))) {
        return;
    }
    $NC.serviceCall("/LFC04020E0/setPreviousMonthDataCopy.do", {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
        P_FROM_MONTH: FROM_MONTH + "-01",
        P_TO_MONTH: TO_MONTH + "-01",
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        onClose();
    });
}
function onGetProtectInfo(ajaxData) {
    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length > 0) {
        var rowData = dsResult[0];
        if (rowData.PROTECT_YN == $ND.C_YES) {
            alert($NC.getDisplayMsg("JS.LFC04021P0.006", "자료 보안설정이 되어 있어 처리할 수 없습니다."));
            $NC.setValue("#mtpTo_Month", $NC.G_VAR.G_PARAMETER.P_ADJUST_MONTH);
            $NC.setFocus("#mtpTo_Month");
            return;
        }
    }
}