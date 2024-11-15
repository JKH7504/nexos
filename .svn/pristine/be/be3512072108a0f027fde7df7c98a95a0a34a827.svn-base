/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : commonpopup
 *  프로그램명         : 공통코드검색 팝업
 *  프로그램설명       : 공통코드검색 팝업 화면 Javascript
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
            container: "#ctrDaumPostCode"
        }
    });

    // HTML head에 스크립트 추가시 <script src="http://dmaps.daum.net/map_js_init/postcode.v2.js"></script>
    // 공통에서 Cache 처리를 위해 HTML Script src에 postcode.v2.js?version=1.0 형태로 version 파라미터 추가하게 되어 있는데
    // 다음에서 허용되지 않는 파라미터로 API 사용제한 처리 함, 2021-03-31
    //
    // [오류메시지]
    // [우편번호 서비스] API 로딩시 허용되지 않은 파라미터가 감지되어 API 작동이 중지되었습니다.
    // 사이트 관리자분께서는 가이드페이지( https://postcode.map.daum.net/guide )의 기본 사용법을 참고하시어 수정 부탁드립니다.
    //
    // 사이트 소스 반영 문제로 공통 수정없이 해당 Popup HTML/JS 수정으로 처리
    loadDaumPostcode();
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
 * Load Complete Event
 */
function _OnLoaded() {

}

function _OnInputKeyUp(e, view) {

}

function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);

    var onAfterCancel = $NC.G_VAR.G_PARAMETER.onCancel;
    $NC.onPopupClose();
    if (onAfterCancel) {
        onAfterCancel();
    }
}

function onClose(rowData) {

    $NC.setPopupCloseAction($ND.C_OK);

    var onSelect = $NC.G_VAR.G_PARAMETER.onSelect;
    if (onSelect) {

        $NC.onPopupClose();
        onSelect(rowData);
    } else {
        $NC.onPopupClose();
    }
}

function loadDaumPostcode() {
    var head = document.head;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

    // cross browser compatibility.
    script.onreadystatechange = onDaumPostcodeInitialize;
    script.onload = onDaumPostcodeInitialize;

    head.appendChild(script);
}

function onDaumPostcodeInitialize() {

    var $ctrDaumPostCode = $("#ctrDaumPostCode");
    // 크롬(83버전)에서 화면이 표시되지 않는 현상 발생으로 컨테이너 숨김 처리 후 onresize에서 보임 처리
    $ctrDaumPostCode.hide();
    var searchVal = $NC.G_VAR.G_PARAMETER.queryParams[$NC.G_VAR.G_PARAMETER.querySearchParam];
    new daum.Postcode({
        oncomplete: onDaumPostcodeComplete,
        width: "100%",
        height: "100%",
        maxSuggestItems: 5,
        onresize: function(size) {
            // 컨테이너 보임 처리(fadeIn으로)
            $ctrDaumPostCode.fadeIn(500);
        }
    }).embed($ctrDaumPostCode.get(0), {
        // 검색어
        q: searchVal == $ND.C_ALL ? null : searchVal,
        // 자동닫힘유무
        autoClose: false
    });
}

function onDaumPostcodeComplete(data) {

    /*
    // 각 주소의 노출 규칙에 따라 주소를 조합한다.
    // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
    var fullAddr = data.address; // 최종 주소 변수
    var extraAddr = ''; // 조합형 주소 변수

    // 기본 주소가 도로명 타입일때 조합한다.
    if (data.addressType === 'R') {
        // 법정동명이 있을 경우 추가한다.
        if (data.bname !== '') {
            extraAddr += data.bname;
        }
        // 건물명이 있을 경우 추가한다.
        if (data.buildingName !== '') {
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
        }
        // 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
        fullAddr += (extraAddr !== '' ? ' (' + extraAddr + ')' : '');
    }
    */

    // 주소 노출 규칙에 따라 입력되던 부분을 사용자가 선택한 주소로 입력 되도록 수정
    var fullAddr = "";
    if (data.userSelectedType == "J") {
        // 지번 선택
        fullAddr = data.jibunAddress;
    } else {
        // 도로명 주소의 노출 규칙에 따라 주소를 조합한다.
        // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
        fullAddr = data.roadAddress; // 도로명 주소 변수

        var extraRoadAddr = ""; // 도로명 조합형 주소 변수
        // 법정동명이 있을 경우 추가한다. (법정리는 제외)
        // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
        if (data.bname !== "" && (/[동|로|가]$/g).test(data.bname)) {
            extraRoadAddr += data.bname;
        }
        // 건물명이 있고, 공동주택일 경우 추가한다.
        if (data.buildingName !== "" //
            // && data.apartment === $ND.C_YES // 건물명이 표시되지 않아 수정
        ) {
            extraRoadAddr += extraRoadAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        // 도로명, 지번 조합형 주소가 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
        if (extraRoadAddr !== "") {
            extraRoadAddr = " (" + extraRoadAddr + ")";
        }
        // 도로명, 지번 주소의 유무에 따라 해당 조합형 주소를 추가한다.
        if (fullAddr !== "") {
            fullAddr += extraRoadAddr;
        }
    }

    data.ZIP_CD = data.zonecode;
    data.ADDR_NM_REAL = fullAddr;

    onClose(data);
}
