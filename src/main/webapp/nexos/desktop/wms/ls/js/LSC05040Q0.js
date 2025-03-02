/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : LSC05040Q0
 *  프로그램명         : 품목일련번호조회
 *  프로그램설명       : 품목일련번호조회 화면 Javascript
 *  작성자             : Copyright (c) 2013 ASETEC Corporation. All rights reserved.
 *  작성일자           : 2018-07-17
 *  버전               : 1.0
 * 
 *  --------------------------------------------------------------------------------------------------------------------------------------------------
 *  버전       작성일자      작성자           설명
 *  ---------  ------------  ---------------  --------------------------------------------------------------------------------------------------------
 *  1.0        2018-07-17    ASETEC           신규작성
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

    $NC.setInitDatePicker("#dtpQValid_Date");

    // 사업부 초기값 설정
    $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
    $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
    $NC.setValue("#dtpQValid_Date");
    $("#btnQItem_Cd").click(showItemPopup);
    $("#edtQItem_Serial").keydown(function(key) {
        if (key.keyCode == 13) {
            var SERIAL_NO = getSerialNo($NC.getValue("#edtQItem_Serial"));
            $NC.setValue("#edtQItem_Serial", SERIAL_NO);
        }
    });

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
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

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

    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BU_CD":
            $NP.onUserBuChange(val, {
                P_USER_ID: $NC.G_USERINFO.USER_ID,
                P_BU_CD: val,
                P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
            }, onUserBuPopup);
            return;
        case "VALID_DATE":
            $NC.setValueDatePicker(view, val, $NC.getDisplayMsg("JS.LSC05040Q0.001", "사용기한을 정확히 입력하십시오."));
            break;
        case "ITEM_CD":
            $NP.onItemChange(val, {
                P_BU_CD: $NC.getValue("#edtQBu_Cd", true),
                P_BRAND_CD: "%",
                P_ITEM_CD: val,
                P_VIEW_DIV: "2",
                P_DEPART_CD: $ND.C_ALL,
                P_LINE_CD: $ND.C_ALL,
                P_CLASS_CD: $ND.C_ALL
            }, onItemPopup);
            return;
    }

    onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(CENTER_CD)) {
        alert($NC.getDisplayMsg("JS.LSC05040Q0.002", "물류센터를 선택하십시오."));
        $NC.setFocus("#cboQCenter_Cd");
        return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
        alert($NC.getDisplayMsg("JS.LSC05040Q0.003", "사업부를 입력하십시오."));
        $NC.setFocus("#edtQBu_Cd");
        return;
    }

    var ITEM_CD = $NC.getValue("#edtQItem_Cd");
    if ($NC.isNull(ITEM_CD)) {
        alert($NC.getDisplayMsg("JS.LSC05040Q0.004", "상품코드를 입력하십시오."));
        $NC.setFocus("#edtQItem_Cd");
        return;
    }

    var ITEM_SERIAL = $NC.getValue("#edtQItem_Serial");
    if ($NC.isNull(ITEM_SERIAL)) {
        alert($NC.getDisplayMsg("JS.LSC05040Q0.005", "일련번호를 입력하십시오."));
        $NC.setFocus("#edtQItem_Serial");
        return;
    }

    var VALID_DATE = $NC.getValue("#dtpQValid_Date");
    var BATCH_NO = $NC.getValue("#edtQBatch_No");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ITEM_CD: ITEM_CD,
        P_ITEM_SERIAL: ITEM_SERIAL,
        P_BATCH_NO: BATCH_NO,
        P_VALID_DATE: VALID_DATE
    };
    // 데이터 조회
    $NC.serviceCall("/LSC05040Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "INOUT_SUB_CD_D",
        field: "INOUT_SUB_CD_D",
        name: "거래종류",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_DATE",
        field: "INOUT_DATE",
        name: "거래일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "INOUT_NO",
        field: "INOUT_NO",
        name: "거래번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_CD",
        field: "DELIVERY_CD",
        name: "거래처코드"
    });
    $NC.setGridColumn(columns, {
        id: "DELIVERY_NM",
        field: "DELIVERY_NM",
        name: "거래처명"
    });
    $NC.setGridColumn(columns, {
        id: "BATCH_NO",
        field: "BATCH_NO",
        name: "제조번호"
    });
    $NC.setGridColumn(columns, {
        id: "VALID_DATE",
        field: "VALID_DATE",
        name: "유통기한",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "비고"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "LSC05040Q0.RS_MASTER",
        sortCol: "INOUT_DATE",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER, null, true);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);

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
    } else {
        $NC.setValue("#edtQBu_Cd");
        $NC.setValue("#edtQBu_Nm");
        $NC.setFocus("#edtQBu_Cd", true);
    }

    onChangingCondition();
}

/**
 * 상품 검색 팝업 표시
 */
function showItemPopup() {
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);

    $NP.showItemPopup({
        P_BU_CD: BU_CD,
        P_BRAND_CD: "%",
        P_ITEM_CD: $ND.C_ALL,
        P_VIEW_DIV: "2",
        P_DEPART_CD: $ND.C_ALL,
        P_LINE_CD: $ND.C_ALL,
        P_CLASS_CD: $ND.C_ALL
    }, onItemPopup, function() {
        $NC.setFocus("#edtQItem_Cd", true);
    });
}

function onItemPopup(resultInfo) {

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
        $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
    } else {
        $NC.setValue("#edtQItem_Cd");
        $NC.setValue("#edtQItem_Nm");
        $NC.setFocus("#edtQItem_Cd", true);
    }
    onChangingCondition();
}

function getSerialNo(scanValOrg) {

    var scanVal = scanValOrg.replace(/[\\(]*[\\)]*/, "");
    var sizeParam = scanVal.length;
    var sSpecialChar = "]D2"; // 특수문자 (GroupSeperater)
    var strItemSerial;
    var barcodeAfter;

    // 묶음코드 SSCC코드, 일련번호식별자 없음.
    if ("00" == scanVal.substring(0, 2) && scanVal.length == 20) {
        // resultMsg = "상품바코드를 알 수 없는 묶음코드 입니다.";
    } else if ("01" == scanVal.substring(0, 2) && "0" != scanVal.substring(2, 3) && "9" != scanVal.substring(2, 3) && sizeParam >= 16) {
        if (scanValOrg.toUpperCase().indexOf(sSpecialChar) > -1) {
            // resultMsg = "상품바코드를 알 수 없는 묶음코드 입니다.";
        }
    } else {
        var arrGS = scanVal.toUpperCase().split(sSpecialChar);
        var rtnArr = new Array(3);

        if (arrGS.length < 2) {
            sSpecialChar = "";
        }

        var BAR_CD_DIV = "";
        var PREFIX = "";
        var chkLength = 13;

        try {
            // 2D BARCODE
            if ("]" == scanVal.substring(0, 1)) {
                BAR_CD_DIV = scanVal.substring(3, 6);
                PREFIX = BAR_CD_DIV.substring(0, 1);

                if ("010" == BAR_CD_DIV || "011" == BAR_CD_DIV) {
                    barcodeAfter = scanVal.substring(19, sizeParam);
                } else if ("1" <= PREFIX && "8" >= PREFIX && BAR_CD_DIV.endsWith("88")) {
                    barcodeAfter = scanVal.substring(16, sizeParam);
                } else if ("880" == BAR_CD_DIV) {
                    barcodeAfter = scanVal.substring(16, sizeParam);
                } else if (sizeParam >= 19) {
                    barcodeAfter = scanVal.substring(19, sizeParam);
                    chkLength = 19;
                } else {
                    chkLength = 9999;
                }

                if (sizeParam > chkLength) {
                    if (!$NC.isNull(sSpecialChar)) {
                        rtnArr = splitSerialBarCd(barcodeAfter, sSpecialChar);
                        strItemSerial = rtnArr[1]; // 일련번호
                    }
                }

                // 1D BarCode
            } else {

                BAR_CD_DIV = scanVal.substring(0, 3);
                PREFIX = BAR_CD_DIV.substring(0, 1);

                if ("010" == BAR_CD_DIV || "011" == BAR_CD_DIV) {
                    barcodeAfter = scanVal.substring(16, sizeParam);
                    chkLength = 16;
                } else if ("1" <= PREFIX && "8" >= PREFIX && BAR_CD_DIV.endsWith("88")) {
                    barcodeAfter = scanVal.substring(14, sizeParam);
                    chkLength = 14;
                } else if ("880" == BAR_CD_DIV && sizeParam >= 13) {
                    barcodeAfter = scanVal.substring(13, sizeParam);
                    chkLength = 13;
                } else if (sizeParam >= 16) {
                    barcodeAfter = scanVal.substring(17, sizeParam);
                    chkLength = 16;
                } else {
                    chkLength = 9999;
                }

                if (sizeParam > chkLength) {
                    if (!$NC.isNull(sSpecialChar)) {
                        rtnArr = splitSerialBarCd(barcodeAfter, sSpecialChar);
                        strItemSerial = rtnArr[1]; // 일련번호
                    }
                }
            }

        } catch (e) {
            // resultMsg = "바코드를 확인 할 수 없습니다. 확인 후 작업하십시오.";
        }
    }

    return $NC.isNull(strItemSerial) ? scanValOrg : strItemSerial;
}

function splitSerialBarCd(sBarcode, sGS) {

    var arrRtn = new Array(3);
    var arrGS = sBarcode.toUpperCase().split(sGS);

    var strSCProductNo = "10"; // 제조번호
    var strSCSeqNo = "21"; // 일련번호
    var strSCExpDt = "17"; // 유통기한(유효기간)

    var strIdxProductNo = 0; // 제조번호 위치
    var strIdxSeqNo = 0; // 일련번호 위치
    var strIdxExpDt = 0; // 유통기한 위치

    var strProductNo = ""; // 제조번호
    var strSeqNo = ""; // 일련번호
    var strExpDt = ""; // 유통기한
    var tmpIdx = 0;
    // var tmpIdx2 = 0;
    var tmpText = "";

    // 가변길이 컬럼뒤에만 GS가 나오며, 가변길이 컬럼이 맨뒤에 나오면 GS는 생략된다.
    // GS가 2개 나오면 배열의 크기가 3이되며, 제조번호가 맨앞에 나오거나, 일련번호가 맨앞에 나오는 두경우의 수 밖에 없다.
    if (arrGS.length == 3) {
        // 순서 => 바코드 , [10]제조번호 'GS' [21]일련번호 'GS' [17]유통기한
        // 순서 => 바코드 , [21]일련번호 'GS' [10]제조번호 'GS' [17]유통기한
        strIdxProductNo = arrGS[0].indexOf(strSCProductNo);
        if (strIdxProductNo != -1) {
            strProductNo = arrGS[0].substring(strIdxExpDt + 2, arrGS[0].length); // 제조번호
            strSeqNo = arrGS[1].substring(2, arrGS[1].length); // 일련번호
            strExpDt = arrGS[2].substring(2, arrGS[2].length); // 유통기한
        } else {
            strIdxSeqNo = arrGS[0].indexOf(strSCSeqNo); // 일련번호
            if (strIdxSeqNo != -1) {
                strProductNo = arrGS[1].substring(2, arrGS[1].length); // 제조번호
                strSeqNo = arrGS[0].substring(strIdxSeqNo + 2, arrGS[0].length); // 일련번호
                strExpDt = arrGS[2].substring(2, arrGS[2].length); // 유통기한
            } else {
                strProductNo = ""; // 제조번호
                strSeqNo = ""; // 일련번호
                strExpDt = ""; // 유통기한
            }
        }

    } else if (arrGS.length == 2) {

        tmpIdx = arrGS[1].substr(0, 2); // 유통기한(유효기간:17)

        if (tmpIdx == strSCExpDt) { // 유통기한

            // 유통기한이 뒤에 있다는것은 아래의 두경우 순서로 존재한다.
            // 제조번호 GS 유통기한 일련번호
            // 일련번호 GS 유통기한 제조번호
            strExpDt = arrGS[1].substr(2, 6);
            tmpText = arrGS[1].substring(8, arrGS[1].length);

            if (tmpText.substr(0, 2) == strSCProductNo) {
                // 순서 : 일련번호 GS 유통기한 제조번호
                strSeqNo = arrGS[0].substring(2, arrGS[0].length); // 일련번호
                strProductNo = tmpText.substring(2, tmpText.length); // 제조번호
            } else {
                // 순서 : 제조번호 GS 유통기한 일련번호
                strProductNo = arrGS[0].substring(2, arrGS[0].length); // 제조번호
                strSeqNo = tmpText.substring(2, tmpText.length); // 일련번호
            }
        } else {

            // 제조번호가 뒤에 있지 않으면 일련번호가 뒤에 있으며, 아래의 두경우 순서로 존재한다.
            // 유통기한 제조번호 GS 일련번호
            // 유통기한 일련번호 GS 제조번호
            strExpDt = arrGS[0].substr(2, 6);
            tmpText = arrGS[0].substring(8, arrGS[0].length);

            if (tmpText.substr(0, 2) == strSCSeqNo) {
                // 순서 : 유통기한 일련번호 GS 제조번호
                strProductNo = arrGS[1].substring(2, arrGS[1].length); // 제조번호
                strSeqNo = tmpText.substring(2, tmpText.length); // 일련번호
            } else {
                // 순서 : 유통기한 제조번호 GS 일련번호
                strProductNo = tmpText.substring(2, tmpText.length); // 제조번호
                strSeqNo = arrGS[1].substring(2, arrGS[1].length); // 일련번호
            }
        }
    }

    arrRtn[0] = strProductNo; // 제조번호
    arrRtn[1] = strSeqNo; // 일련번호
    arrRtn[2] = strExpDt; // 유통기한

    return arrRtn;
}