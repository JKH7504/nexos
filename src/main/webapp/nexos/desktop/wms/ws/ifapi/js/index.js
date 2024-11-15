/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

    // 단위화면에서 사용될 일반 전역 변수 정의
    $NC.setGlobalVar({
        autoResizeView: {
            container: "#ctrMasterView"
        }
    });

    var urlPrefix = $.browser.urlPrefix + "/ifapi/";
    $NC.setValue("#edtUrl", urlPrefix);
    $NC.setValue("#edtReceive", urlPrefix + $NC.getValue("#edtReceive"));
}