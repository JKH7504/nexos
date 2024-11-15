/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC01010E0
 *  프로그램명         : 물류센터관리
 *  프로그램설명       : 물류센터관리 화면 Javascript
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
        // 체크할 정책 값
        policyVal: {
            CM710: "" // 좌표검색 API 사용
        },
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
        }
    });

    // 초기화 및 초기값 세팅
    $NC.setValue("#chkQDeal_Div1", $ND.C_YES);
    $NC.setValue("#chkQDeal_Div2", $ND.C_YES);

    $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
    $NC.setInitDatePicker("#dtpClose_Date", null, "N");

    // 초기 비활성화 처리
    $NC.setEnableGroup("#divMasterInfoView", false);

    // 이벤트 연결
    $("#btnZip_Cd").click(showPostPopup);
    $("#btnZip_Cd_Clear").click(btnZipCdClearOnClick);
    $("#btnManager_Id").click(showManagerPopup);
    $("#btnGetCoord").click(btnGetCoordOnClick);
    $("#btnEntryCoord").click(btnEntryCoordOnClick);
    $("#btnBasicMaster").click(btnBasicMasterOnClick);

    // 그리드 초기화
    grdMasterInitialize();
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
    // 정책값 설정
    setPolicyValInfo();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
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
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

    onChangingCondition();
}

function onChangingCondition() {

    $NC.clearGridData(G_GRDMASTER);

    $NC.setEnableGroup("#divMasterInfoView", false);
    setInputValue("#grdMaster");

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

    var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
    var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
    var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    G_GRDMASTER.queryParams = {
        P_DEAL_DIV1: DEAL_DIV1,
        P_DEAL_DIV2: DEAL_DIV2,
        P_DEAL_DIV3: DEAL_DIV3
    };
    // 데이터 조회
    $NC.serviceCall("/CMC01010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        CENTER_CD: null,
        CENTER_NM: null,
        CENTER_FULL_NM: null,
        BUSINESS_NO: null,
        CEO_NM: null,
        BUSINESS_KIND: null,
        BUSINESS_TYPE: null,
        ZIP_CD: null,
        ADDR_BASIC: null,
        ADDR_DETAIL: null,
        GEOCODE_LAT: null,
        GEOCODE_LNG: null,
        TEL_NO: null,
        FAX_NO: null,
        MANAGER_ID: null,
        MANAGER_NM: null,
        MANAGER_TEL: null,
        MANAGER_HP: null,
        DEAL_DIV: "1",
        OPEN_DATE: null,
        CLOSE_DATE: null,
        REMARK1: null,
        REG_USER_ID: null,
        REG_DATETIME: null,
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
        alert($NC.getDisplayMsg("JS.CMC01010E0.001", "저장할 데이터가 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var rowData;
    var dsMaster = [];
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsMaster.push({
            P_CENTER_CD: rowData.CENTER_CD,
            P_CENTER_NM: rowData.CENTER_NM,
            P_CENTER_FULL_NM: rowData.CENTER_FULL_NM,
            P_BUSINESS_NO: rowData.BUSINESS_NO,
            P_CEO_NM: rowData.CEO_NM,
            P_BUSINESS_KIND: rowData.BUSINESS_KIND,
            P_BUSINESS_TYPE: rowData.BUSINESS_TYPE,
            P_ZIP_CD: rowData.ZIP_CD,
            P_ADDR_BASIC: rowData.ADDR_BASIC,
            P_ADDR_DETAIL: rowData.ADDR_DETAIL,
            P_GEOCODE_LAT: rowData.GEOCODE_LAT,
            P_GEOCODE_LNG: rowData.GEOCODE_LNG,
            P_TEL_NO: rowData.TEL_NO,
            P_FAX_NO: rowData.FAX_NO,
            P_MANAGER_ID: rowData.MANAGER_ID,
            P_MANAGER_TEL: rowData.MANAGER_TEL,
            P_MANAGER_HP: rowData.MANAGER_HP,
            P_DEAL_DIV: rowData.DEAL_DIV,
            P_OPEN_DATE: rowData.OPEN_DATE,
            P_CLOSE_DATE: rowData.CLOSE_DATE,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }
    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC01010E0.002", "데이터 수정 후 저장하십시오."));
        return;
    }

    $NC.serviceCall("/CMC01010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC01010E0.003", "삭제할 데이터가 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC01010E0.004", "삭제 하시겠습니까?"))) {
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
        selectKey: "CENTER_CD",
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

function setInputValue(grdSelector, rowData) {

    if (grdSelector == "#grdMaster") {

        if ($NC.isNull(rowData)) {
            // 초기화시 기본값 지정
            rowData = {
                CRUD: $ND.C_DV_CRUD_R
            };
        }
        // Row 데이터로 에디터 세팅
        $NC.setValue("#edtCenter_Cd", rowData["CENTER_CD"]);
        $NC.setValue("#edtCenter_Nm", rowData["CENTER_NM"]);
        $NC.setValue("#edtCenter_Full_Nm", rowData["CENTER_FULL_NM"]);
        $NC.setValue("#edtBusiness_No", rowData["BUSINESS_NO"]);
        $NC.setValue("#edtCeo_Nm", rowData["CEO_NM"]);
        $NC.setValue("#edtBusiness_Kind", rowData["BUSINESS_KIND"]);
        $NC.setValue("#edtBusiness_Type", rowData["BUSINESS_TYPE"]);
        $NC.setValue("#edtZip_Cd", rowData["ZIP_CD"]);
        $NC.setValue("#edtAddr_Basic", rowData["ADDR_BASIC"]);
        $NC.setValue("#edtAddr_Detail", rowData["ADDR_DETAIL"]);
        $NC.setValue("#edtGeocode_Lat", rowData["GEOCODE_LAT"]);
        $NC.setValue("#edtGeocode_Lng", rowData["GEOCODE_LNG"]);
        $NC.setValue("#edtTel_No", rowData["TEL_NO"]);
        $NC.setValue("#edtFax_No", rowData["FAX_NO"]);
        $NC.setValue("#edtManager_Id", rowData["MANAGER_ID"]);
        $NC.setValue("#edtManager_Nm", rowData["MANAGER_NM"]);
        $NC.setValue("#edtManager_Tel", rowData["MANAGER_TEL"]);
        $NC.setValue("#edtManager_Hp", rowData["MANAGER_HP"]);
        $NC.setValue("#rgbDeal_Div1", rowData["DEAL_DIV"] == "1");
        $NC.setValue("#rgbDeal_Div2", rowData["DEAL_DIV"] == "2");
        $NC.setValue("#rgbDeal_Div3", rowData["DEAL_DIV"] == "3");
        $NC.setValue("#dtpOpen_Date", rowData["OPEN_DATE"]);
        $NC.setValue("#dtpClose_Date", rowData["CLOSE_DATE"]);
        $NC.setValue("#edtRemark1", rowData["REMARK1"]);
        // 신규 데이터면 물류센터코드 수정할 수 있게 함
        if (rowData["CRUD"] == $ND.C_DV_CRUD_C || rowData["CRUD"] == $ND.C_DV_CRUD_N) {
            $NC.setEnable("#edtCenter_Cd");
        } else {
            $NC.setEnable("#edtCenter_Cd", false);
        }
        $NC.setEnable("#btnGetCoord", $NC.isNull(rowData["GEOCODE_LAT"]) //
            || $NC.isNull(rowData["GEOCODE_LNG"]));
    }
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row, "CENTER_CD")) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CENTER_CD)) {
            alert($NC.getDisplayMsg("JS.CMC01010E0.005", "물류센터코드를 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtCenter_Cd");
            return false;
        }
        if ($NC.isNull(rowData.CENTER_NM)) {
            alert($NC.getDisplayMsg("JS.CMC01010E0.006", "물류센터명을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#edtCenter_Nm");
            return false;
        }
        if ($NC.isNull(rowData.DEAL_DIV)) {
            alert($NC.getDisplayMsg("JS.CMC01010E0.007", "거래구분을 선택하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            $NC.setFocus("#rgbDeal_Div");
            return false;
        }
        if ($NC.isNotNull(rowData.OPEN_DATE) && $NC.isNotNull(rowData.CLOSE_DATE)) {
            if (rowData.CLOSE_DATE < rowData.OPEN_DATE) {
                alert($NC.getDisplayMsg("JS.CMC01010E0.008", "거래일자와 종료일자의 범위 입력오류입니다."));
                $NC.setGridSelectRow(G_GRDMASTER, row);
                $NC.setFocus("#dtpClose_Date");
                return false;
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "CENTER_CD",
        field: "CENTER_CD",
        name: "물류센터코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_NM",
        field: "CENTER_NM",
        name: "물류센터명"
    });
    $NC.setGridColumn(columns, {
        id: "CENTER_FULL_NM",
        field: "CENTER_FULL_NM",
        name: "물류센터정식명칭"
    });
    $NC.setGridColumn(columns, {
        id: "BUSINESS_NO",
        field: "BUSINESS_NO",
        name: "사업자등록번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CEO_NM",
        field: "CEO_NM",
        name: "대표자명"
    });
    $NC.setGridColumn(columns, {
        id: "BUSINESS_KIND",
        field: "BUSINESS_KIND",
        name: "업태"
    });
    $NC.setGridColumn(columns, {
        id: "BUSINESS_TYPE",
        field: "BUSINESS_TYPE",
        name: "종목"
    });
    $NC.setGridColumn(columns, {
        id: "ZIP_CD",
        field: "ZIP_CD",
        name: "우편번호",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_BASIC",
        field: "ADDR_BASIC",
        name: "기본주소"
    });
    $NC.setGridColumn(columns, {
        id: "ADDR_DETAIL",
        field: "ADDR_DETAIL",
        name: "상세주소"
    });
    // 좌표API사용 기준 : 1 - 네이버 API 사용 ---
    $NC.setGridColumn(columns, {
        id: "GEOCODE_LAT",
        field: "GEOCODE_LAT",
        name: "위도",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "GEOCODE_LNG",
        field: "GEOCODE_LNG",
        name: "경도",
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "TEL_NO",
        field: "TEL_NO",
        name: "대표전화번호"
    });
    $NC.setGridColumn(columns, {
        id: "FAX_NO",
        field: "FAX_NO",
        name: "팩스번호"
    });
    $NC.setGridColumn(columns, {
        id: "MANAGER_NM",
        field: "MANAGER_NM",
        name: "관리책임자"
    });
    $NC.setGridColumn(columns, {
        id: "MANAGER_TEL",
        field: "MANAGER_TEL",
        name: "관리책임자전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "MANAGER_HP",
        field: "MANAGER_HP",
        name: "관리책임자휴대전화번호",
        formatter: Slick.Formatters.Mask,
        formatterOptions: $NC.getGridMaskColumnOptions("TEL")
    });
    $NC.setGridColumn(columns, {
        id: "DEAL_DIV_F",
        field: "DEAL_DIV_F",
        name: "거래구분"
    });
    $NC.setGridColumn(columns, {
        id: "OPEN_DATE",
        field: "OPEN_DATE",
        name: "거래시작일자",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "CLOSE_DATE",
        field: "CLOSE_DATE",
        name: "거래종료일자",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterOnSetColumns() {

    $NC.setGridColumns(G_GRDMASTER, [ // 숨김컬럼 세팅
        $NC.G_VAR.policyVal.CM710 != "1" ? "GEOCODE_LAT,GEOCODE_LNG" : ""
    ]);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 1
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC01010E0.RS_MASTER",
        sortCol: "CENTER_CD",
        gridOptions: options
    });
    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnNewRecord(args) {

    $NC.setFocus("#edtCenter_Cd");
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);

    // 기본마스터생성버튼 disabled
    if (rowData.CRUD == $ND.C_DV_CRUD_C || rowData.CRUD == $ND.C_DV_CRUD_N) {
        $NC.setEnable("#btnBasicMaster", false);
    } else {
        $NC.setEnable("#btnBasicMaster", true);
    }

    // 에디터 값 세팅
    setInputValue("#grdMaster", G_GRDMASTER.data.getItem(row));

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    switch (args.col) {
        case "CENTER_CD":
            rowData.CENTER_CD = args.val;
            break;
        case "CENTER_NM":
            rowData.CENTER_NM = args.val;
            if ($NC.isNull(rowData.CENTER_FULL_NM)) {
                rowData.CENTER_FULL_NM = args.val;
                $NC.setValue("#edtCenter_Full_Nm", rowData.CENTER_FULL_NM);
            }
            break;
        case "CENTER_FULL_NM":
            rowData.CENTER_FULL_NM = args.val;
            break;
        case "BUSINESS_NO":
            rowData.BUSINESS_NO = args.val;
            break;
        case "CEO_NM":
            rowData.CEO_NM = args.val;
            break;
        case "BUSINESS_KIND":
            rowData.BUSINESS_KIND = args.val;
            break;
        case "BUSINESS_TYPE":
            rowData.BUSINESS_TYPE = args.val;
            break;
        case "ZIP_CD":
            rowData.ZIP_CD = args.val;
            break;
        case "ADDR_BASIC":
            rowData.ADDR_BASIC = args.val;
            break;
        case "ADDR_DETAIL":
            rowData.ADDR_DETAIL = args.val;
            break;
        case "GEOCODE_LAT":
            rowData.GEOCODE_LAT = args.val;
            break;
        case "GEOCODE_LNG":
            rowData.GEOCODE_LNG = args.val;
            break;
        case "TEL_NO":
            rowData.TEL_NO = args.val;
            break;
        case "FAX_NO":
            rowData.FAX_NO = args.val;
            break;
        case "DEAL_DIV":
            rowData.DEAL_DIV = args.val;
            break;
        case "DEAL_DIV1":
        case "DEAL_DIV2":
        case "DEAL_DIV3":
            rowData.DEAL_DIV = args.val;
            rowData.DEAL_DIV_F = $NC.getDisplayCombo(args.val, $NC.getValueText(args.view));
            break;
        case "OPEN_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC01010E0.009", "거래일자를 정확히 입력하십시오."), "N");
            }
            rowData.OPEN_DATE = $NC.getValue(args.view);
            break;
        case "CLOSE_DATE":
            if ($NC.isNotNull(args.val)) {
                $NC.setValueDatePicker(args.view, args.val, $NC.getDisplayMsg("JS.CMC01010E0.010", "종료일자를 정확히 입력하십시오."), "N");
            }
            rowData.CLOSE_DATE = $NC.getValue(args.view);
            break;
        case "REMARK1":
            rowData.REMARK1 = args.val;
            break;
        case "MANAGER_ID":
            $NP.onUserChange(args.val, {
                P_USER_ID: args.val,
                P_CERTIFY_DIV: $ND.C_ALL
            }, onManagerPopup);
            return;
        case "MANAGER_TEL":
            rowData.MANAGER_TEL = args.val;
            break;
        case "MANAGER_HP":
            rowData.MANAGER_HP = args.val;
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function showPostPopup() {

    $NP.showPostPopup({
        P_ADDR_NM: $ND.C_ALL
    }, onPostPopup, function() {
    });
}

function onPostPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtZip_Cd", resultInfo.ZIP_CD);
        $NC.setValue("#edtAddr_Basic", resultInfo.ADDR_NM_REAL);

        rowData.ZIP_CD = resultInfo.ZIP_CD;
        rowData.ADDR_BASIC = resultInfo.ADDR_NM_REAL;
    } else {
        $NC.setValue("#edtZip_Cd");
        $NC.setValue("#edtAddr_Basic");

        rowData.ZIP_CD = "";
        rowData.ADDR_BASIC = "";
    }
    $NC.setValue("#edtGeocode_Lat");
    $NC.setValue("#edtGeocode_Lng");
    $NC.setEnable("#btnGetCoord");

    rowData.GEOCODE_LAT = "";
    rowData.GEOCODE_LNG = "";

    $NC.setFocus("#edtAddr_Detail", true);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function btnZipCdClearOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNull(rowData.ZIP_CD) //
        && $NC.isNull(rowData.ADDR_BASIC) //
        && $NC.isNull(rowData.ADDR_DETAIL)) {
        $NC.setFocus("#edtAddr_Detail");
        return;
    }

    $NC.setValue("#edtZip_Cd");
    $NC.setValue("#edtAddr_Basic");
    $NC.setValue("#edtAddr_Detail");
    $NC.setValue("#edtGeocode_Lat");
    $NC.setValue("#edtGeocode_Lng");
    $NC.setFocus("#edtAddr_Detail");
    $NC.setEnable("#btnGetCoord");

    rowData.ZIP_CD = "";
    rowData.ADDR_BASIC = "";
    rowData.ADDR_DETAIL = "";
    rowData.GEOCODE_LAT = "";
    rowData.GEOCODE_LNG = "";

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function showManagerPopup() {

    $NP.showUserPopup({
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CERTIFY_DIV: $ND.C_ALL
    }, onManagerPopup, function() {
        $NC.setFocus("#edtManager_Id", true);
    });
}

function onManagerPopup(resultInfo) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    if ($NC.isNotNull(resultInfo)) {
        $NC.setValue("#edtManager_Id", resultInfo.USER_ID);
        $NC.setValue("#edtManager_Nm", resultInfo.USER_NM);

        rowData.MANAGER_ID = resultInfo.USER_ID;
        rowData.MANAGER_NM = resultInfo.USER_NM;
    } else {
        $NC.setValue("#edtManager_Id");
        $NC.setValue("#edtManager_Nm");
        $NC.setFocus("#edtManager_Id", true);

        rowData.MANAGER_ID = "";
        rowData.MANAGER_NM = "";

    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER, "CENTER_CD", true)) {
        $NC.setEnableGroup("#divMasterInfoView", true);
        $NC.setEnable("#edtCenter_Cd", false);
        $NC.setEnable("#btnGetCoord", $NC.isNull($NC.getValue("#edtGeocode_Lat")) //
            || $NC.isNull($NC.getValue("#edtGeocode_Lat")));
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
    // 프로그램 사용 권한 설정
    setUserProgramPermission();
}

function onSave(ajaxData) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: "CENTER_CD"
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

// 기본주소를 기준으로 좌표계산 후 입력 처리
function btnGetCoordOnClick() {

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if ($NC.isNull(rowData.ADDR_BASIC)) {
        alert($NC.getDisplayMsg("JS.CMC01010E0.011", "주소 정보가 등록되어 있지 않습니다."));
        return;
    }

    var checkedValue = [
        {
            P_CENTER_CD: rowData.CENTER_CD
        }
    ];

    var serviceParams = {
        P_TABLE_NM: "DUMMY",
        P_ADDR_BASIC: rowData.ADDR_BASIC
    };

    $NC.serviceCall("/CMC01010E0/callGetCoordinate.do", {
        P_CHECKED_VALUE: checkedValue,
        P_SERVICE_PARAMS: serviceParams,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            alert(oMsg);
            return;
        }

        var geocodeLat = resultData.O_GEOCODE_LAT; // 위도
        var geocodeLng = resultData.O_GEOCODE_LNG; // 경도

        $NC.setValue("#edtGeocode_Lat", geocodeLat);
        $NC.setValue("#edtGeocode_Lng", geocodeLng);

        rowData.GEOCODE_LAT = geocodeLat;
        rowData.GEOCODE_LNG = geocodeLng;

        // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
        $NC.setGridApplyChange(G_GRDMASTER, rowData);
        $NC.setEnable("#btnGetCoord", false);
    });
}

function btnEntryCoordOnClick() {

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.CMC01010E0.012", "처리할 데이터가 없습니다."));
        return;
    }

    if ($NC.isGridModified(G_GRDMASTER)) {
        alert($NC.getDisplayMsg("JS.CMC01010E0.013", "데이터가 변경되었습니다. 저장 후 처리하십시오."));
        return;
    }

    var rowData;
    var dsMaster = [];
    for (var rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDMASTER.data.getItem(rIndex);

        // 기본주소가 null이거나 좌표가 등록되어 있으면 처리 대상이 아님
        if ($NC.isNull(rowData.ADDR_BASIC) //
            || ($NC.isNotNull(rowData.GEOCODE_LAT) //
            && $NC.isNotNull(rowData.GEOCODE_LNG))) {
            continue;
        }

        dsMaster.push(rowData);
    }

    if (dsMaster.length == 0) {
        alert($NC.getDisplayMsg("JS.CMC01010E0.014", "등록 가능한 데이터가 없습니다."));
        return;
    }

    $NC.showProgramSubPopup({
        PROGRAM_ID: "CMC01011P0",
        PROGRAM_NM: $NC.getDisplayMsg("JS.CMC01011P0.001", "좌표일괄등록"),
        url: "cm/CMC01011P0.html",
        width: 800,
        height: 500,
        G_PARAMETER: {
            P_MASTER_DS: dsMaster,
            P_PROGRAM_ID: $NC.G_VAR.G_PARAMETER.PROGRAM_ID
        },
        onOk: function() {
            onSave();
        }
    });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

    var permission = $NC.getProgramPermission();
    var enable = G_GRDMASTER.data.getLength() > 0;

    $NC.setEnable("#btnEntryCoord", permission.canSave && enable);
}

function btnBasicMasterOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC01010E0.015", "생성할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.serviceCall("/CMC01010E0/callCenterMasterCreate.do", {
        P_CENTER_CD: rowData.CENTER_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        alert($NC.getDisplayMsg("JS.CMC01010E0.016", "기본 마스터가 생성되었습니다."));
    });
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    $NC.setPolicyValInfo({
        P_CENTER_CD: $ND.C_NULL,
        P_BU_CD: $ND.C_NULL
    }, function() {
        // 좌표검색 API 사용 정책 (0:사용안함, 1:네이버API사용)
        if ($NC.G_VAR.policyVal.CM710 == "0") {
            $("#btnEntryCoord").hide();
            $("#btnGetCoord").hide();
            $("#coordGroupRow").hide();
            $("#lblGeocode_Lat").hide();
            $("#edtGeocode_Lat").hide();
            $("#lblGeocode_Lng").hide();
            $("#edtGeocode_Lng").hide();
        } else {
            $("#btnEntryCoord").show();
            $("#btnGetCoord").show();
            $("#coordGroupRow").show();
            $("#lblGeocode_Lat").show();
            $("#edtGeocode_Lat").show();
            $("#lblGeocode_Lng").show();
            $("#edtGeocode_Lng").show();
        }
        // 컬럼 표시 조정
        grdMasterOnSetColumns();

        $NC.onGlobalResize();
    });
}
