/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC01031P0
 *  프로그램명         : 기본로케이션생성 팝업
 *  프로그램설명       : 기본로케이션생성 팝업 화면 Javascript
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
            container: "#ctrPopupView"
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnOk").click(onLocationCreate);
    $("#btnCancel").click(onCancel);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMZONE",
                P_QUERY_ID: "WC.POP_CMZONE",
                P_QUERY_PARAMS: {
                    P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
                    P_ZONE_CD: $ND.C_ALL
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_LOC_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "LOC_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_CELL_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "CELL_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 존 세팅
        $NC.setInitComboData({
            selector: "#cboZone_Cd",
            codeField: "ZONE_CD",
            fullNameField: "ZONE_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMZONE),
            onComplete: function() {
                $NC.setValue("#cboZone_Cd", $NC.G_VAR.G_PARAMETER.P_ZONE_CD);
            }
        });
        // 로케이션구분 세팅
        $NC.setInitComboData({
            selector: "#cboLoc_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_LOC_DIV),
            onComplete: function() {
                $NC.setValue("#cboLoc_Div", "1");
            }
        });
        // 셀구분 세팅
        $NC.setInitComboData({
            selector: "#cboCell_Div",
            codeField: "COMMON_CD",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_CELL_DIV),
            onComplete: function() {
                $NC.setValue("#cboCell_Div", "01");
            }
        });
    });

    $NC.setValue("#edtLoc_Order", "1");
    $NC.setValue("#edtPlt_Qty", "1");
    $NC.setValue("#edtCell_Length", "0");
    $NC.setValue("#edtCell_Width", "0");
    $NC.setValue("#edtCell_Height", "0");
    $NC.setValue("#edtCell_Weight", "0");

    $NC.setFocus("#edtBank_Cd1");
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

function onLocationCreate() {

    var ZONE_CD = $NC.getValue("#cboZone_Cd");
    if ($NC.isNull(ZONE_CD)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.002", "로케이션 존을 선택하십시오."));
        $NC.setFocus("#cboZone_Cd");
        return;
    }

    var BANK_CD1 = $NC.getValue("#edtBank_Cd1");
    if ($NC.isNull(BANK_CD1)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.003", "시작 행코드를 입력하십시오."));
        $NC.setFocus("#edtBank_Cd1");
        return;
    }
    if (BANK_CD1.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM122)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.004", "시작 행코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM122 + "자리)를 정확히 입력하여 주십시오.",
            $NC.G_VAR.G_PARAMETER.P_POLICY_CM122));
        $NC.setFocus("#edtBank_Cd1");
        return;
    }

    var BANK_CD2 = $NC.getValue("#edtBank_Cd2");
    if ($NC.isNull(BANK_CD2)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.005", "종료 행코드를 입력하십시오."));
        $NC.setFocus("#edtBank_Cd2");
        return;
    }
    if (BANK_CD2.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM122)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.006", "종료 행코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM122 + "자리)를 정확히 입력하여 주십시오.",
            $NC.G_VAR.G_PARAMETER.P_POLICY_CM122));
        $NC.setFocus("#edtBank_Cd2");
        return;
    }

    if (BANK_CD1 > BANK_CD2) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.007", "행 첫번째 값이 두번째 값보다 클 수 없습니다."));
        $NC.setFocus("#edtBank_Cd1");
        return;
    }

    var BAY_CD1 = $NC.getValue("#edtBay_Cd1");
    if ($NC.isNull(BAY_CD1)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.008", "시작 열코드를 입력하십시오."));
        $NC.setFocus("#edtBay_Cd1");
        return;
    }
    if (BAY_CD1.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM123)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.009", "시작 열코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM123 + "자리)를 정확히 입력하여 주십시오.",
            $NC.G_VAR.G_PARAMETER.P_POLICY_CM123));
        $NC.setFocus("#edtBay_Cd1");
        return;
    }

    var BAY_CD2 = $NC.getValue("#edtBay_Cd2");
    if ($NC.isNull(BAY_CD2)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.010", "종료 열코드를 입력하십시오."));
        $NC.setFocus("#edtBay_Cd2");
        return;
    }
    if (BAY_CD2.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM123)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.011", "종료 열코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM123 + "자리)를 정확히 입력하여 주십시오.",
            $NC.G_VAR.G_PARAMETER.P_POLICY_CM123));
        $NC.setFocus("#edtBay_Cd2");
        return;
    }

    if (BAY_CD1 > BAY_CD2) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.012", "열 첫번째 값이 두번째 값보다 클 수 없습니다."));
        $NC.setFocus("#edtBay_Cd1");
        return;
    }

    var LEV_CD1 = $NC.getValue("#edtLev_Cd1");
    if ($NC.isNull(LEV_CD1)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.013", "시작 단코드를 입력하십시오."));
        $NC.setFocus("#edtLev_Cd1");
        return;
    }
    if (LEV_CD1.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM124)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.014", "시작 단코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM124 + "자리)를 정확히 입력하여 주십시오.",
            $NC.G_VAR.G_PARAMETER.P_POLICY_CM124));
        $NC.setFocus("#edtLev_Cd1");
        return;
    }

    var LEV_CD2 = $NC.getValue("#edtLev_Cd2");
    if ($NC.isNull(LEV_CD2)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.015", "종료 단코드를 입력하십시오."));
        $NC.setFocus("#edtLev_Cd2");
        return;
    }
    if (LEV_CD2.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM124)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.016", "종료 단코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM124 + "자리)를 정확히 입력하여 주십시오.",
            $NC.G_VAR.G_PARAMETER.P_POLICY_CM124));
        $NC.setFocus("#edtLev_Cd2");
        return;
    }

    if (LEV_CD1 > LEV_CD2) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.017", "단 첫번째 값이 두번째 값보다 클 수 없습니다."));
        $NC.setFocus("#edtLev_Cd1");
        return;
    }

    var LOC_DIV = $NC.getValue("#cboLoc_Div");
    if ($NC.isNull(LOC_DIV)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.018", "로케이션구분을 선택하십시오."));
        $NC.setFocus("#cboLoc_Div");
        return;
    }

    var CELL_DIV = $NC.getValue("#cboCell_Div");
    if ($NC.isNull(CELL_DIV)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.019", "셀구분을 선택하십시오."));
        $NC.setFocus("#cboCell_Div");
        return;
    }

    var PLT_QTY = $NC.getValue("#edtPlt_Qty");
    if ($NC.isNull(PLT_QTY)) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.020", "적재파렛트수를 입력하십시오."));
        $NC.setFocus("#edtPlt_Qty");
        return;
    }
    if (Number(PLT_QTY) < 1) {
        alert($NC.getDisplayMsg("JS.CMC01031P0.021", "적재파렛트수에 1이상의 정수를 입력하십시오."));
        $NC.setFocus("#edtQty_In_Box");
        return false;
    }

    var LOC_ORDER = $NC.getValue("#edtLoc_Order");
    var CELL_WEIGHT = $NC.getValue("#edtCell_Weight");
    var CELL_WIDTH = $NC.getValue("#edtCell_Width");
    var CELL_LENGTH = $NC.getValue("#edtCell_Length");
    var CELL_HEIGHT = $NC.getValue("#edtCell_Height");

    $NC.serviceCall("/CMC01030E0/callCMLocationCreate.do", {
        P_CENTER_CD: $NC.G_VAR.G_PARAMETER.P_CENTER_CD,
        P_ZONE_CD: ZONE_CD,
        P_BANK_CD1: BANK_CD1,
        P_BANK_CD2: BANK_CD2,
        P_BAY_CD1: BAY_CD1,
        P_BAY_CD2: BAY_CD2,
        P_LEV_CD1: LEV_CD1,
        P_LEV_CD2: LEV_CD2,
        P_LOC_DIV: LOC_DIV,
        P_CELL_DIV: CELL_DIV,
        P_LOC_ORDER: LOC_ORDER,
        P_PLT_QTY: PLT_QTY,
        P_CELL_WEIGHT: CELL_WEIGHT,
        P_CELL_WIDTH: CELL_WIDTH,
        P_CELL_LENGTH: CELL_LENGTH,
        P_CELL_HEIGHT: CELL_HEIGHT,
        P_POLICY_CM120: $NC.G_VAR.G_PARAMETER.P_POLICY_CM120,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        onClose();
    });
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "BANK_CD1":
            if (val.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM122)) {
                alert($NC.getDisplayMsg("JS.CMC01031P0.004", "시작 행코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM122 + "자리)를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.G_PARAMETER.P_POLICY_CM122));
                $NC.setFocus("#edtBank_Cd1");
            } else {
                $NC.setValue("#edtBank_Cd1", val.toUpperCase());
            }
            break;
        case "BANK_CD2":
            if (val.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM122)) {
                alert($NC.getDisplayMsg("JS.CMC01031P0.006", "종료 행코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM122 + "자리)를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.G_PARAMETER.P_POLICY_CM122));
                $NC.setFocus("#edtBank_Cd2");
            } else {
                $NC.setValue("#edtBank_Cd2", val.toUpperCase());
            }
            break;
        case "BAY_CD1":
            if (val.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM123)) {
                alert($NC.getDisplayMsg("JS.CMC01031P0.009", "시작 열코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM123 + "자리)를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.G_PARAMETER.P_POLICY_CM123));
                $NC.setFocus("#edtBay_Cd1");
            } else {
                $NC.setValue("#edtBay_Cd1", val.toUpperCase());
            }
            break;
        case "BAY_CD2":
            if (val.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM123)) {
                alert($NC.getDisplayMsg("JS.CMC01031P0.011", "종료 열코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM123 + "자리)를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.G_PARAMETER.P_POLICY_CM123));
                $NC.setFocus("#edtBay_Cd2");
            } else {
                $NC.setValue("#edtBay_Cd2", val.toUpperCase());
            }
            break;
        case "LEV_CD1":
            if (val.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM124)) {
                alert($NC.getDisplayMsg("JS.CMC01031P0.014", "시작 단코드 길이(" + $NC.G_VAR.G_PARAMETER.P_POLICY_CM124 + "자리)를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.G_PARAMETER.P_POLICY_CM124));
                $NC.setFocus("#edtLev_Cd1");
            } else {
                $NC.setValue("#edtLev_Cd1", val.toUpperCase());
            }
            break;
        case "LEV_CD2":
            if (val.length != Number($NC.G_VAR.G_PARAMETER.P_POLICY_CM124)) {
                alert($NC.getDisplayMsg("JS.CMC01031P0.016", "종료 단코드 길이를 " + $NC.G_VAR.G_PARAMETER.P_POLICY_CM124 + "자리)를 정확히 입력하여 주십시오.",
                    $NC.G_VAR.G_PARAMETER.P_POLICY_CM124));
                $NC.setFocus("#edtLev_Cd2");
            } else {
                $NC.setValue("#edtLev_Cd2", val.toUpperCase());
            }
            break;
    }
}
