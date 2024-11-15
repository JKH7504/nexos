/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : developerpopup
 *  프로그램명         : 개발자메뉴 팝업
 *  프로그램설명       : 개발자메뉴 팝업 화면 Javascript
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
        autoResizeView: {
            container: "#ctrPopupView"
        }
    });

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onClose);
    $("#btnReloadSqlMap").click(btnReloadSqlMapOnClick);
    $("#btnReloadMsg").click(btnReloadMsgOnClick);
    $("#btnReloadJavaMsg").click(btnReloadJavaMsgOnClick);
}

/**
 * 등록팝업 Open 시 호출 됨
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
function _OnInputChange(e, view, val) {

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
 * SQLMAP 다시 읽기
 * 
 * @param e
 */
function btnReloadSqlMapOnClick(e) {

    if (!confirm($NC.getDisplayMsg("JS.DEVELOPERPOPUP.001", "SqlMap을 다시 로드하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/WC/reloadSqlMap.do", null, function(ajaxData) {
        alert($NC.getDisplayMsg("JS.DEVELOPERPOPUP.002", "정상 처리되었습니다."));
        setTimeout(function() {
            onClose();
        }, $ND.C_TIMEOUT_CLOSE_FAST);
    });
}

/**
 * Java/DB 메시지 다시 읽기
 * 
 * @param e
 */
function btnReloadJavaMsgOnClick(e) {

    if (!confirm($NC.getDisplayMsg("JS.DEVELOPERPOPUP.003", "Java/DB 메시지를 다시 로드하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/WC/reloadDisplayMsg.do", null, function(ajaxData) {
        alert($NC.getDisplayMsg("JS.DEVELOPERPOPUP.002", "정상 처리되었습니다."));
        setTimeout(function() {
            onClose();
        }, $ND.C_TIMEOUT_CLOSE_FAST);
    });
}

/**
 * Javascript 메시지 다시 읽기
 */
function btnReloadMsgOnClick(e) {

    if (!confirm($NC.getDisplayMsg("JS.DEVELOPERPOPUP.004", "Javascript 메시지를 다시 로드하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.GET_CSMSG",
        P_QUERY_PARAMS: {
            P_SYS_LANG: $NC.G_USERINFO.SYS_LANG
        }
    }, function(ajaxData) {
        $NC.setGlobalDisplayInfo(ajaxData);
        $NC.setInitDisplay();
        $NC.G_MAIN.setReinitDisplayMain();
        alert($NC.getDisplayMsg("JS.DEVELOPERPOPUP.002", "정상 처리되었습니다."));
        setTimeout(function() {
            onClose();
        }, $ND.C_TIMEOUT_CLOSE_FAST);
    });
}
