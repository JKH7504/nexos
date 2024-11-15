/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC07010E0
 *  프로그램명         : 우편번호관리
 *  프로그램설명       : 우편번호관리 화면 Javascript
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#divLeftView",
                grids: "#grdMaster"
            },
            viewSecond: {
                container: "#divRightView"
            },
            viewType: "h",
            viewFixed: {
                container: "#divRightView",
                sizeFn: function(viewWidth, viewHeight) {

                    var scrollOffset = viewHeight < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
                    // Container 사이즈 조정
                    return $NC.G_OFFSET.rightViewWidth + scrollOffset;
                }
            }
        },
        // 택배사구분의 표시여부
        HDC: {
            // CJ대한통운
            CJ: {
                USE_YN: $ND.C_NO,
                HDC_DIV: "01"
            },
            // 롯데택배
            LT: {
                USE_YN: $ND.C_NO,
                HDC_DIV: "02"
            },
            // 우체국택배
            EP: {
                USE_YN: $ND.C_NO,
                HDC_DIV: "03"
            },
            // 한진택배
            HJ: {
                USE_YN: $ND.C_NO,
                HDC_DIV: "05"
            }
        }
    });

    // 초기화 및 초기값 세팅
    // 택배사구분 표시여부 변수값 세팅
    setHDCUseInfo();

    // 초기 숨김 처리
    // 택배사구분 표시여부 적용
    $NC.setVisible("#ctrHdc_Div01", $NC.G_VAR.HDC.CJ.USE_YN == $ND.C_YES);
    $NC.setVisible("#ctrHdc_Div02", $NC.G_VAR.HDC.LT.USE_YN == $ND.C_YES);
    $NC.setVisible("#ctrHdc_Div03", $NC.G_VAR.HDC.EP.USE_YN == $ND.C_YES);
    $NC.setVisible("#ctrHdc_Div05", $NC.G_VAR.HDC.HJ.USE_YN == $ND.C_YES);

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 그리드 초기화
    grdMasterInitialize();
}

function _SetResizeOffset() {

    $NC.G_OFFSET.rightViewWidth = 450;
    $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

    onChangingCondition();
}

function onChangingCondition() {

    // 전역 변수 값 초기화
    $NC.clearGridData(G_GRDMASTER);

    setInputValue("#grdMaster");
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    grdMasterOnCellChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 조회조건 체크
    var ZIP_CD = $NC.getValue("#edtQZip_Cd");
    var ADDR_NM = $NC.getValue("#edtQAddr_Nm");
    /*
     * if ($NC.isNull(ZIP_CD) && $NC.isNull(ADDR_NM)) {
     *     alert("검색 주소 값을 입력하십시오.");
     *     $NC.setFocus("#edtQZip_Cd"); return; 
     * }
     */
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_ZIP_CD: ZIP_CD,
        P_ADDR_NM: ADDR_NM
    };
    // 데이터 조회
    $NC.serviceCall("/CMC07010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        ZIP_CD: null,
        ADDR_NM1: null,
        ADDR_NM2: null,
        ADDR_NM3: null,
        ADDR_DETAIL: null,
        EP_TML_NM: null,
        EP_ARR_SHOP_NM: null,
        EP_ARR_CD: null,
        EP_COURSE_NO: null,
        CJ_TML_CD: null,
        CJ_TML_SUB_CD: null,
        CJ_ARR_SHOP_NM: null,
        CJ_ARR_CD: null,
        CJ_ARR_NM: null,
        CJ_ARR_ADDR: null,
        LT_TML_CD: null,
        LT_TML_NM: null,
        LT_ARR_SHOP_NM: null,
        LT_ARR_CD: null,
        LT_ARR_ADDR2: null,
        LT_ARR_ADDR3: null,
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 이전 데이터가 한건도 없었으면 에디터 Enable
    if (G_GRDMASTER.data.getLength() == 0) {
        $NC.setEnableGroup("#divMasterInfoView", true);
    }

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDMASTER, newRowData);
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC07010E0.001", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var dsMaster = [];
    var rowData;
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_ZIP_CD: rowData.ZIP_CD,
            P_ADDR_NM1: rowData.ADDR_NM1,
            P_ADDR_NM2: rowData.ADDR_NM2,
            P_ADDR_NM3: rowData.ADDR_NM3,
            P_ADDR_DETAIL: rowData.ADDR_DETAIL,
            P_EP_TML_NM: rowData.EP_TML_NM,
            P_EP_ARR_SHOP_NM: rowData.EP_ARR_SHOP_NM,
            P_EP_ARR_CD: rowData.EP_ARR_CD,
            P_EP_COURSE_NO: rowData.EP_COURSE_NO,
            P_CJ_TML_CD: rowData.CJ_TML_CD,
            P_CJ_TML_SUB_CD: rowData.CJ_TML_SUB_CD,
            P_CJ_ARR_SHOP_NM: rowData.CJ_ARR_SHOP_NM,
            P_CJ_ARR_CD: rowData.CJ_ARR_CD,
            P_CJ_ARR_NM: rowData.CJ_ARR_NM,
            P_CJ_ARR_ADDR: rowData.CJ_ARR_ADDR,
            P_LT_TML_CD: rowData.LT_TML_CD,
            P_LT_TML_NM: rowData.LT_TML_NM,
            P_LT_ARR_SHOP_NM: rowData.LT_ARR_SHOP_NM,
            P_LT_ARR_CD: rowData.LT_ARR_CD,
            P_LT_ARR_ADDR2: rowData.LT_ARR_ADDR2,
            P_LT_ARR_ADDR3: rowData.LT_ARR_ADDR3,
            P_HJ_TML_CD: rowData.HJ_TML_CD,
            P_HJ_TML_NM: rowData.HJ_TML_NM,
            P_HJ_CLASS1_CD: rowData.HJ_CLASS1_CD,
            P_HJ_CLASS2_CD: rowData.HJ_CLASS2_CD,
            P_HJ_CLASS3_CD: rowData.HJ_CLASS3_CD,
            P_HJ_ARR_NM: rowData.HJ_ARR_NM,
            P_HJ_ARR_SHOP_CD: rowData.HJ_ARR_SHOP_CD,
            P_HJ_ARR_SHOP_NM: rowData.HJ_ARR_SHOP_NM,
            P_HJ_DELIVER_NM: rowData.HJ_DELIVER_NM,
            P_HJ_SHIP_AIR_NM: rowData.HJ_SHIP_AIR_NM,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC07010E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC07010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC07010E0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC07010E0.004", "삭제 하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    // 신규 데이터일 경우 Grid 데이터만 삭제
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        if ($NC.deleteGridRowData(G_GRDMASTER, rowData) == 0) {
            $NC.setEnableGroup("#divMasterInfoView", false);
            setInputValue("#grdMaster");
        }
    } else {
        rowData.CRUD = $ND.C_DV_CRUD_D;
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        _Save();
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "ZIP_CD",
        isCancel: true
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
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
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM1",
        field: "ADDR_NM1",
        name: "시도",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM2",
        field: "ADDR_NM2",
        name: "시군구",
        band: 0
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_NM3",
        field: "ADDR_NM3",
        name: "읍면동",
        band: 1
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_DETAIL",
        field: "ADDR_DETAIL",
        name: "상세주소",
        band: 1
    });

    if ($NC.G_VAR.HDC.CJ.USE_YN == $ND.C_YES) {
        $NC.setGridColumn(columns, {
            id: "CJ_TML_CD",
            field: "CJ_TML_CD",
            name: "도착지코드",
            band: 2
        });
        $NC.setGridColumn(columns, {
            id: "CJ_TML_SUB_CD",
            field: "CJ_TML_SUB_CD",
            name: "도착지서브코드",
            band: 2
        });
        $NC.setGridColumn(columns, {
            id: "CJ_ARR_SHOP_NM",
            field: "CJ_ARR_SHOP_NM",
            name: "배달점소명",
            band: 2
        });
        $NC.setGridColumn(columns, {
            id: "CJ_ARR_CD",
            field: "CJ_ARR_CD",
            name: "배달사원분류코드",
            band: 2
        });
        $NC.setGridColumn(columns, {
            id: "CJ_ARR_NM",
            field: "CJ_ARR_NM",
            name: "배달사원명",
            band: 2
        });
        $NC.setGridColumn(columns, {
            id: "CJ_ARR_ADDR",
            field: "CJ_ARR_ADDR",
            name: "분류주소",
            band: 2
        });
    }
    if ($NC.G_VAR.HDC.LT.USE_YN == $ND.C_YES) {
        $NC.setGridColumn(columns, {
            id: "LT_TML_CD",
            field: "LT_TML_CD",
            name: "터미널코드",
            band: 3
        });
        $NC.setGridColumn(columns, {
            id: "LT_TML_NM",
            field: "LT_TML_NM",
            name: "터미널명",
            band: 3
        });
        $NC.setGridColumn(columns, {
            id: "LT_ARR_SHOP_NM",
            field: "LT_ARR_SHOP_NM",
            name: "배달영업소명",
            band: 3
        });
        $NC.setGridColumn(columns, {
            id: "LT_ARR_CD",
            field: "LT_ARR_CD",
            name: "도착지코드",
            band: 3
        });
        $NC.setGridColumn(columns, {
            id: "LT_ARR_ADDR2",
            field: "LT_ARR_ADDR2",
            name: "시군구주소",
            band: 3
        });
        $NC.setGridColumn(columns, {
            id: "LT_ARR_ADDR3",
            field: "LT_ARR_ADDR3",
            name: "읍면동주소",
            band: 3
        });
    }
    if ($NC.G_VAR.HDC.EP.USE_YN == $ND.C_YES) {
        $NC.setGridColumn(columns, {
            id: "EP_TML_NM",
            field: "EP_TML_NM",
            name: "도착집중국명",
            band: 4
        });
        $NC.setGridColumn(columns, {
            id: "EP_ARR_SHOP_NM",
            field: "EP_ARR_SHOP_NM",
            name: "배달우체국명",
            band: 4
        });
        $NC.setGridColumn(columns, {
            id: "EP_ARR_CD",
            field: "EP_ARR_CD",
            name: "집배코드",
            band: 4
        });
        $NC.setGridColumn(columns, {
            id: "EP_COURSE_NO",
            field: "EP_COURSE_NO",
            name: "구분코스",
            band: 4
        });
    }
    if ($NC.G_VAR.HDC.HJ.USE_YN == $ND.C_YES) {
        $NC.setGridColumn(columns, {
            id: "HJ_TML_CD",
            field: "HJ_TML_CD",
            name: "터미널코드",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_TML_NM",
            field: "HJ_TML_NM",
            name: "터미널명",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_CLASS1_CD",
            field: "HJ_CLASS1_CD",
            name: "대분류코드",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_CLASS2_CD",
            field: "HJ_CLASS2_CD",
            name: "중분류코드",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_CLASS3_CD",
            field: "HJ_CLASS3_CD",
            name: "소분류코드",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_ARR_NM",
            field: "HJ_ARR_NM",
            name: "집배구역명",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_ARR_SHOP_CD",
            field: "HJ_ARR_SHOP_CD",
            name: "영업소코드",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_ARR_SHOP_NM",
            field: "HJ_ARR_SHOP_NM",
            name: "영업소명",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_DELIVER_NM",
            field: "HJ_DELIVER_NM",
            name: "배송원명",
            band: 5
        });
        $NC.setGridColumn(columns, {
            id: "HJ_SHIP_AIR_NM",
            field: "HJ_SHIP_AIR_NM",
            name: "제주도서구분",
            band: 5
        });
    }

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 2,
        showBandRow: true,
        bands: [
            $NC.getDisplayMsg("JS.CMC07010E0.004", "주소정보"),
            $NC.getDisplayMsg("JS.CMC07010E0.005", "세부주소"),
            $NC.getDisplayMsg("JS.CMC07010E0.006", "CJ대한통운"),
            $NC.getDisplayMsg("JS.CMC07010E0.007", "롯데택배"),
            $NC.getDisplayMsg("JS.CMC07010E0.008", "우체국택배"),
            $NC.getDisplayMsg("JS.CMC07010E0.009", "한진택배")
        ]
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC07010E0.RS_MASTER",
        sortCol: "ZIP_CD",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnNewRecord(args) {

    $NC.setFocus("#edtZip_Cd");
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "ZIP_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.ZIP_CD)) {
            alert($NC.getDisplayMsg("JS.CMC07010E0.005", "우편번호를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtZip_Cd");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "ZIP_CD":
            rowData.ZIP_CD = args.val;
            break;
        case "ADDR_NM1":
            rowData.ADDR_NM1 = args.val;
            break;
        case "ADDR_NM2":
            rowData.ADDR_NM2 = args.val;
            break;
        case "ADDR_NM3":
            rowData.ADDR_NM3 = args.val;
            break;
        case "ADDR_DETAIL":
            rowData.ADDR_DETAIL = args.val;
            break;
        case "EP_TML_NM":
            rowData.EP_TML_NM = args.val;
            break;
        case "EP_ARR_SHOP_NM":
            rowData.EP_ARR_SHOP_NM = args.val;
            break;
        case "EP_ARR_CD":
            rowData.EP_ARR_CD = args.val;
            break;
        case "EP_COURSE_NO":
            rowData.EP_COURSE_NO = args.val;
            break;
        case "CJ_TML_CD":
            rowData.CJ_TML_CD = args.val;
            break;
        case "CJ_TML_SUB_CD":
            rowData.CJ_TML_SUB_CD = args.val;
            break;
        case "CJ_ARR_SHOP_NM":
            rowData.CJ_ARR_SHOP_NM = args.val;
            break;
        case "CJ_ARR_CD":
            rowData.CJ_ARR_CD = args.val;
            break;
        case "CJ_ARR_NM":
            rowData.CJ_ARR_NM = args.val;
            break;
        case "CJ_ARR_ADDR":
            rowData.CJ_ARR_ADDR = args.val;
            break;
        case "LT_TML_CD":
            rowData.LT_TML_CD = args.val;
            break;
        case "LT_TML_NM":
            rowData.LT_TML_NM = args.val;
            break;
        case "LT_ARR_SHOP_NM":
            rowData.LT_ARR_SHOP_NM = args.val;
            break;
        case "LT_ARR_CD":
            rowData.LT_ARR_CD = args.val;
            break;
        case "LT_ARR_ADDR2":
            rowData.LT_ARR_ADDR2 = args.val;
            break;
        case "LT_ARR_ADDR3":
            rowData.LT_ARR_ADDR3 = args.val;
            break;
        case "HJ_TML_CD":
            rowData.HJ_TML_CD = args.val;
            break;
        case "HJ_TML_NM":
            rowData.HJ_TML_NM = args.val;
            break;
        case "HJ_CLASS1_CD":
            rowData.HJ_CLASS1_CD = args.val;
            break;
        case "HJ_CLASS2_CD":
            rowData.HJ_CLASS2_CD = args.val;
            break;
        case "HJ_CLASS3_CD":
            rowData.HJ_CLASS3_CD = args.val;
            break;
        case "HJ_ARR_NM":
            rowData.HJ_ARR_NM = args.val;
            break;
        case "HJ_ARR_SHOP_CD":
            rowData.HJ_ARR_SHOP_CD = args.val;
            break;
        case "HJ_ARR_SHOP_NM":
            rowData.HJ_ARR_SHOP_NM = args.val;
            break;
        case "HJ_DELIVER_NM":
            rowData.HJ_DELIVER_NM = args.val;
            break;
        case "HJ_SHIP_AIR_NM":
            rowData.HJ_SHIP_AIR_NM = args.val;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }
        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtZip_Cd", rowData["ZIP_CD"]);
        $NC.setValue("#edtAddr_Nm1", rowData["ADDR_NM1"]);
        $NC.setValue("#edtAddr_Nm2", rowData["ADDR_NM2"]);
        $NC.setValue("#edtAddr_Nm3", rowData["ADDR_NM3"]);
        $NC.setValue("#edtAddr_Detail", rowData["ADDR_DETAIL"]);
        $NC.setValue("#edtEp_Tml_Nm", rowData["EP_TML_NM"]);
        $NC.setValue("#edtEp_Arr_Shop_Nm", rowData["EP_ARR_SHOP_NM"]);
        $NC.setValue("#edtEp_Arr_Cd", rowData["EP_ARR_CD"]);
        $NC.setValue("#edtEp_Course_No", rowData["EP_COURSE_NO"]);
        $NC.setValue("#edtCj_Tml_Cd", rowData["CJ_TML_CD"]);
        $NC.setValue("#edtCj_Tml_Sub_Cd", rowData["CJ_TML_SUB_CD"]);
        $NC.setValue("#edtCj_Arr_Shop_Nm", rowData["CJ_ARR_SHOP_NM"]);
        $NC.setValue("#edtCj_Arr_Cd", rowData["CJ_ARR_CD"]);
        $NC.setValue("#edtCj_Arr_Nm", rowData["CJ_ARR_NM"]);
        $NC.setValue("#edtCj_Arr_Addr", rowData["CJ_ARR_ADDR"]);
        $NC.setValue("#edtLt_Tml_Cd", rowData["LT_TML_CD"]);
        $NC.setValue("#edtLt_Tml_Nm", rowData["LT_TML_NM"]);
        $NC.setValue("#edtLt_Arr_Shop_Nm", rowData["LT_ARR_SHOP_NM"]);
        $NC.setValue("#edtLt_Arr_Cd", rowData["LT_ARR_CD"]);
        $NC.setValue("#edtLt_Arr_Addr2", rowData["LT_ARR_ADDR2"]);
        $NC.setValue("#edtLt_Arr_Addr3", rowData["LT_ARR_ADDR3"]);
        $NC.setValue("#edtHj_Tml_Cd", rowData["HJ_TML_CD"]);
        $NC.setValue("#edtHj_Tml_Nm", rowData["HJ_TML_NM"]);
        $NC.setValue("#edtHj_Class1_Cd", rowData["HJ_CLASS1_CD"]);
        $NC.setValue("#edtHj_Class2_Cd", rowData["HJ_CLASS2_CD"]);
        $NC.setValue("#edtHj_Class3_Cd", rowData["HJ_CLASS3_CD"]);
        $NC.setValue("#edtHj_Arr_Nm", rowData["HJ_ARR_NM"]);
        $NC.setValue("#edtHj_Arr_Shop_Cd", rowData["HJ_ARR_SHOP_CD"]);
        $NC.setValue("#edtHj_Arr_Shop_Nm", rowData["HJ_ARR_SHOP_NM"]);
        $NC.setValue("#edtHj_Deliver_Nm", rowData["HJ_DELIVER_NM"]);
        $NC.setValue("#edtHj_Ship_Air_Nm", rowData["HJ_SHIP_AIR_NM"]);

        // 신규 데이터면 우편번호 수정할 수 있게 함
        if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtZip_Cd");
        } else {
            $NC.setEnable("#edtZip_Cd", false);
        }
    }
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "ZIP_CD", true)) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnable("#edtZip_Cd", false);
    } else {
        $NC.setEnableGroup("#divMasterInfoView", false);
        setInputValue("#grdMaster");
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "1";
    $NC.G_VAR.buttons._delete = "1";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "ZIP_CD"
    });
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastKeyVal;
}

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

function setHDCUseInfo() {

    var rowData;
    for ( var hdcName in $NC.G_VAR.HDC) {
        $NC.G_VAR.HDC[hdcName].USE_YN = $ND.C_NO;
        rowData = $NC.G_VAR.HDC[hdcName];
        // 데이터 조회
        $NC.serviceCallAndWait("/CMC07010E0/getData.do", {
            P_QUERY_ID: "WB.GET_HDC_DIV_YN",
            P_QUERY_PARAMS: {
                P_HDC_DIV: rowData.HDC_DIV
            }
        }, onGetHDCUseInfo);
    }
}

function onGetHDCUseInfo(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    switch (resultData.P_HDC_DIV) {
        // CJ
        case "01":
            $NC.G_VAR.HDC.CJ.USE_YN = resultData.O_HDC_DIV_YN;
            break;
        // LOTTE
        case "02":
            $NC.G_VAR.HDC.LT.USE_YN = resultData.O_HDC_DIV_YN;
            break;
        // EPOST
        case "03":
            $NC.G_VAR.HDC.EP.USE_YN = resultData.O_HDC_DIV_YN;
            break;
        // HANJIN
        case "05":
            $NC.G_VAR.HDC.HJ.USE_YN = resultData.O_HDC_DIV_YN;
            break;
    }
}
