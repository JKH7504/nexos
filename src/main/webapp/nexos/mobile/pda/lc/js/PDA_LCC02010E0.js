/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA_LCC02010E0
 *  프로그램명         : PDA 상태변환
 *  프로그램설명       : PDA 상태변환 화면 Javascript
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
            grids: "#grdMaster",
            exceptHeight: function() {
                return $NC.getViewHeight("#ctrMasterInfoView,#ctrDetailView,#ctrActionBar");
            }
        },
        // 옵션
        SCANNED_INC_QTY: false, // 기본값 false
        SCANNED_DISPLAY_ITEM_BAR_CD: true, // 기본값 true
        SCANNED_ITEM_BAR_CD: false,

        ignoreKeyUp: false,
        lastLocationCd: null,
        lastItemBarCd: null,
        lastLinkLocationCd: null,

        // 체크할 정책 값
        policyVal: {
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
    $("#btnAll").click(btnAllOnClick);
    // 수량 입력
    $("#lblConfirm_Qty").click(onQtyApply);

    // 그리드 초기화
    grdMasterInitialize();

    // 상품상태 콤보박스 초기화
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: {
            P_COMMON_GRP: "ITEM_STATE",
            P_COMMON_CD: $ND.C_ALL,
            P_ATTR01_CD: "1",
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        }
    }, {
        selector: "#cboLink_Item_State",
        codeField: "COMMON_CD",
        nameField: "COMMON_NM",
        fullNameField: "COMMON_CD_F",
        onComplete: function() {
            // 선택 안함
            $NC.setValue("#cboLink_Item_State", -1);
        }
    });

    // 정책 값 읽기
    setPolicyValInfo();
    // 권한 설정
    setUserProgramPermission();
    // 환경 세팅 읽기
    if ($Android.isValid()) {
        var props = [
            "SCANNED_INC_QTY",
            "SCANNED_DISPLAY_ITEM_BAR_CD"
        ];
        // 프로그램 단위 환경 세팅은 PROGRAM_ID + "," + propertyName으로 읽기
        $NC.G_VAR[props[0]] = $Android.callby("getBooleanGlobalProp", props[0], $NC.G_VAR[props[0]]);
        $NC.G_VAR[props[1]] = $Android.callby("getBooleanGlobalProp", props[1], $NC.G_VAR[props[1]]);
    }
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

    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "LOCATION_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onLocationScan(view, val);
            break;
        case "ITEM_BAR_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onItemScan(view, val);
            break;
        case "LINK_LOCATION_CD":
            // Enter Key로 Change가 발생하면 KeyUp은 무시
            $NC.G_VAR.ignoreKeyUp = true;
            onLinkLocationScan(view, val);
            break;
        default:
            grdMasterOnCellChange(e, {
                view: view,
                col: id,
                val: val
            });
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
        case "LOCATION_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onLocationScan(view, $NC.getValue(view));
            break;
        case "ITEM_BAR_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onItemScan(view, $NC.getValue(view));
            break;
        case "LINK_LOCATION_CD":
            // KeyUp 무시면 리턴
            if ($NC.G_VAR.ignoreKeyUp) {
                $NC.G_VAR.ignoreKeyUp = false;
                return;
            }
            onLinkLocationScan(view, $NC.getValue(view));
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
    if ($NC.isNull($NC.G_VAR.lastLocationCd)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "로케이션을 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if ($NC.isNull($NC.G_VAR.lastLinkLocationCd)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "이동로케이션을 먼저 스캔하십시오."));
        setFocusScan("#edtLink_Location_Cd");
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "처리할 상품 내역이 없습니다."));
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDMASTER)) {
        return;
    }

    var checkedData = $NC.getGridCheckedValues(G_GRDMASTER, {
        checkColumnId: $ND.C_NULL, // 체크없이 전체
        compareFn: function(rowData) {
            // 변환 상태, 수량 입력 상품만
            return $NC.isNotNull(rowData.LINK_ITEM_STATE) && rowData.CONFIRM_QTY > 0;
        },
        dataType: "S", // 문자열 결합
        valueColumns: [
            "BRAND_CD",
            "ITEM_CD",
            "ITEM_STATE",
            "ITEM_LOT",
            "VALID_DATE",
            "BATCH_NO",
            "CONFIRM_QTY",
            "LINK_ITEM_STATE"
        ]
    });

    if (checkedData.checkedCount == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "처리할 상품 내역이 없습니다. 상태변환할 상품을 선택하고 변환수량을 입력하십시오."));
        setFocusScan();
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "상태변환 처리하시겠습니까?"))) {
        setFocusScan();
        return;
    }

    var refRowData = G_GRDMASTER.data.getItem(0);
    $NC.serviceCall("/PDA_LCC02010E0/callLCProcStateChange.do", {
        P_CENTER_CD: refRowData.CENTER_CD,
        P_BU_CD: refRowData.BU_CD,
        P_ETC_DATE: $NC.G_USERINFO.WORK_DATE,
        P_LOCATION_CD: refRowData.LOCATION_CD,
        P_LINK_LOCATION_CD: $NC.G_VAR.lastLinkLocationCd,
        P_CHECKED_VALUE: $NC.toJoin(checkedData.values),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onLocationError);
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
    if (clearType instanceof $.Event || $NC.isNull(clearType)) {
        clearType = $ND.C_CLEAR_TYPE_ALL;
    }

    if (clearType <= $ND.C_CLEAR_TYPE_MASTER) {
        // 전역 변수 초기화
        $NC.G_VAR.lastLocationCd = null;
        $NC.G_VAR.lastItemBarCd = null;
        $NC.G_VAR.lastLinkLocationCd = null;

        // 값 초기화
        $NC.setValue("#edtLocation_Cd");

        $NC.clearGridData(G_GRDMASTER);
        // 모두 비활성
        $NC.setEnableGroup("#ctrDetailView", false);
    }

    if (clearType <= $ND.C_CLEAR_TYPE_DETAIL) {
        // 전역 변수 초기화
        $NC.G_VAR.lastItemBarCd = null;
        // 값 초기화
        setDetailInputValue();

        if (clearType == $ND.C_CLEAR_TYPE_DETAIL) {
            $NC.setEnable("#edtItem_Bar_Cd");
        }
    }

    if (clearType <= $ND.C_CLEAR_TYPE_SUB) {
        // 전역 변수 초기화
        $NC.G_VAR.lastLinkLocationCd = null;
        // 값 초기화
        $NC.setValue("#edtLink_Location_Cd");
    }

    if (clearType == $ND.C_CLEAR_TYPE_SUB) {
        setFocusScan("#edtLink_Location_Cd");
    } else if (clearType == $ND.C_CLEAR_TYPE_DETAIL) {
        setFocusScan("#edtItem_Bar_Cd");
    } else {
        setFocusScan();
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
    // 그리드 셀 복사일 경우 처리 안함
    if (e.ctrlKey && $view.is(".slick-cell")) {
        return;
    }
    // 스캔 Element - 로케이션
    if ($view.prop("id") == "edtLocation_Cd") {
        return;
    }
    // 스캔 Element - 상품바코드
    if ($view.prop("id") == "edtItem_Bar_Cd") {
        // 비활성이면 파렛트ID로
        if (!$NC.isEnable($view)) {
            setFocusScan();
        }
        return;
    }
    // 입력 Element가 아니면 스캔 Element에 포커스
    if (!$view.is(":focus")) {
        // 파렛트ID 스캔하여 정상 조회되어 있으면 상품바코드에 포커스
        if ($NC.isNull($NC.G_VAR.lastLocationCd)) {
            setFocusScan();
        } else {
            if ($NC.G_VAR.SCANNED_INC_QTY) {
                setFocusScan("#edtItem_Bar_Cd");
            } else {
                setFocusScan("#edtConfirm_Qty");
            }
        }
    }
}

function setFocusScan(selector) {

    var $view = $NC.getView($NC.isNull(selector) ? "#edtLocation_Cd" : selector);
    if ($NC.isEnable($view)) {
        // Delay 처리
        setTimeout(function() {
            $view.focus();
            $NC.hideSoftInput(); // 일단 스캔 항목 키보드 숨김 처리
        }, $ND.C_TIMEOUT_FOCUS);
    }
}

function grdMasterOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "ROW_NO",
        field: "ROW_NO",
        name: "No",
        resizable: false,
        minWidth: 30,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_NM",
        field: "ITEM_NM",
        name: "상품명",
        minWidth: 120
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_STATE_D",
        field: "ITEM_STATE_D",
        name: "상태",
        minWidth: 70
    });
    $NC.setGridColumn(columns, {
        id: "STOCK_QTY",
        field: "STOCK_QTY",
        name: "재고수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "CONFIRM_QTY",
        field: "CONFIRM_QTY",
        name: "변환수량",
        minWidth: 65,
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "ITEM_CD",
        field: "ITEM_CD",
        name: "상품코드",
        minWidth: 100
    });
    // $NC.setGridColumn(columns, {
    // id: "BRAND_NM",
    // field: "BRAND_NM",
    // name: "브랜드명"
    // });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        rowHeight: 30,
        frozenColumn: 0,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.CONFIRM_QTY > 0) {
                    return "styDiff";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "PDA_LCC02010E0.RS_MASTER",
        sortCol: "ITEM_CD",
        gridOptions: options
    });

    G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDMASTER, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDMASTER.data.getItem(row);
    setTimeout(function() {
        setDetailInputValue(rowData);
    });

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdMasterOnCellChange(e, args) {

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var changeQty, confirmQty;
    switch (args.col) {
        case "LINK_ITEM_STATE":
            if (rowData.ITEM_STATE == args.val) {
                alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "변환상태를 현재상태와 다르게 지정하십시오."));
                $NC.setValue(args.view, rowData.LINK_ITEM_STATE);
                $NC.setFocus(args.view);
                return;
            }
            rowData.LINK_ITEM_STATE = args.val;
            break;
        case "CONFIRM_BOX":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "변환BOX 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            confirmQty = $NC.getBQty(changeQty, rowData.CONFIRM_EA, rowData.QTY_IN_BOX);
            if (rowData.STOCK_QTY < confirmQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "변환수량이 재고수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.CONFIRM_BOX = changeQty;
            rowData.CONFIRM_QTY = confirmQty;
            $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
            break;
        case "CONFIRM_EA":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "변환EA 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            confirmQty = $NC.getBQty(rowData.CONFIRM_BOX, changeQty, rowData.QTY_IN_BOX);
            if (rowData.STOCK_QTY < confirmQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "변환수량이 재고수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.CONFIRM_EA = changeQty;
            rowData.CONFIRM_QTY = confirmQty;
            $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
            break;
        case "CONFIRM_QTY":
            changeQty = $NC.toNumber(args.val, -1);
            if (changeQty < 0) {
                alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "변환 수량을 정확히 입력하십시오."));
                $NC.setFocus(args.view);
                return;
            }
            if (rowData.STOCK_QTY < changeQty) {
                alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "변환수량이 재고수량을 초과할 수 없습니다."));
                $NC.setFocus(args.view);
                return;
            }

            rowData.CONFIRM_BOX = $NC.getBBox(changeQty, rowData.QTY_IN_BOX);
            rowData.CONFIRM_EA = $NC.getBEa(changeQty, rowData.QTY_IN_BOX);
            rowData.CONFIRM_QTY = changeQty;

            $NC.setValue("#edtConfirm_Box", rowData.CONFIRM_BOX);
            $NC.setValue("#edtConfirm_Ea", rowData.CONFIRM_EA);

            // 검수수량일 경우 포커스 유지
            // $NC.setFocus(args.view);
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function grdMasterOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDMASTER, row)) {
        return true;
    }

    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNull(rowData.CONFIRM_QTY)) {
            alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "검수 수량을 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            setFocusScan("#edtConfirm_Qty");
            return false;
        }
        if (Number(rowData.CONFIRM_QTY) < 0) {
            alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "검수 수량을 정확히 입력하십시오."));
            $NC.setGridSelectRow(G_GRDMASTER, row);
            setFocusScan("#edtConfirm_Qty");
            return false;
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDMASTER, rowData);
    return true;
}

function setDetailInputValue(rowData) {

    if ($NC.isNull(rowData)) {
        // 초기화시 기본값 지정
        rowData = {
            CRUD: $ND.C_DV_CRUD_R
        };
    }

    // Row 데이터로 에디터 세팅
    $NC.G_VAR.lastItemBarCd = rowData["ITEM_CD"];
    if ($NC.G_VAR.SCANNED_DISPLAY_ITEM_BAR_CD) {
        $NC.setValue("#edtItem_Bar_Cd", $NC.isNull(rowData["ITEM_BAR_CD"]) ? $NC.G_VAR.lastItemBarCd : rowData["ITEM_BAR_CD"]);
    } else {
        $NC.setValue("#edtItem_Bar_Cd", $NC.G_VAR.lastItemBarCd);
    }

    $NC.setValue("#edtItem_Nm", rowData["ITEM_NM"]);
    $NC.setValue("#edtBrand_Nm", rowData["BRAND_NM"]);
    $NC.setValue("#edtItem_State", $NC.getDisplayCombo(rowData["ITEM_STATE"], rowData["ITEM_STATE_D"]));
    // 정상 데이터일 경우 변환상태 최초 강제 지정
    if ($NC.isNotNull(rowData["ITEM_CD"])) {
        if ($NC.isNull(rowData["LINK_ITEM_STATE"])) {
            if (rowData["ITEM_STATE"] == "A") {
                rowData["LINK_ITEM_STATE"] = "X";
            } else {
                rowData["LINK_ITEM_STATE"] = "A";
            }
        }

        $NC.setValue("#cboLink_Item_State", rowData["LINK_ITEM_STATE"]);
    } else {
        // 빈값 선택
        $NC.setValue("#cboLink_Item_State", -1);
    }
    $NC.setValue("#edtValid_Date", rowData["VALID_DATE"]);
    $NC.setValue("#edtBatch_No", rowData["BATCH_NO"]);
    $NC.setValue("#edtQty_In_Box", rowData["QTY_IN_BOX"]);
    $NC.setValue("#edtBox_In_Plt", rowData["BOX_IN_PLT"]);
    $NC.setValue("#edtStock_Box", rowData["STOCK_BOX"]);
    $NC.setValue("#edtStock_Ea", rowData["STOCK_EA"]);
    $NC.setValue("#edtStock_Qty", rowData["STOCK_QTY"]);
    $NC.setValue("#edtConfirm_Box", rowData["CONFIRM_BOX"]);
    $NC.setValue("#edtConfirm_Ea", rowData["CONFIRM_EA"]);
    $NC.setValue("#edtConfirm_Qty", rowData["CONFIRM_QTY"]);

    // 입력 활성/비활성
    $NC.setEnableGroup("#ctrDetailView", $NC.isNotNull($NC.G_VAR.lastItemBarCd));

    // 스캔 수량 증가일 경우
    if ($NC.G_VAR.SCANNED_INC_QTY) {
        if ($NC.G_VAR.SCANNED_ITEM_BAR_CD) {
            if (rowData["STOCK_QTY"] > rowData["CONFIRM_QTY"]) {
                rowData["CONFIRM_QTY"] = rowData["CONFIRM_QTY"] + 1;
                rowData["CONFIRM_BOX"] = $NC.getBBox(rowData["CONFIRM_QTY"], rowData["QTY_IN_BOX"]);
                rowData["CONFIRM_EA"] = $NC.getBEa(rowData["CONFIRM_QTY"], rowData["QTY_IN_BOX"]);

                $NC.setValue("#edtConfirm_Box", rowData["CONFIRM_BOX"]);
                $NC.setValue("#edtConfirm_Ea", rowData["CONFIRM_EA"]);
                $NC.setValue("#edtConfirm_Qty", rowData["CONFIRM_QTY"]);

                $NC.setGridApplyChange(G_GRDMASTER, rowData);
            }
        }
        // 스캔 세팅 해제
        $NC.G_VAR.SCANNED_ITEM_BAR_CD = false;

        setFocusScan("#edtItem_Bar_Cd");
    } else {
        setFocusScan("#edtConfirm_Qty");
    }
}

function onGetMaster(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult.length == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "해당 로케이션에 재고가 존재하지 않습니다."));
        _Cancel();
        return;
    }

    // 입력 활성, 값 세팅
    $NC.setEnableGroup("#ctrDetailView");

    // 그리드 데이터 세팅
    $NC.setInitGridData(G_GRDMASTER, dsResult);
    $NC.setInitGridAfterOpen(G_GRDMASTER);
}

function onGetDetail(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "상품바코드 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    // 상품코드 검색
    var searchRow = $NC.getGridSearchRow(G_GRDMASTER, {
        searchKey: [
            "BRAND_CD",
            "ITEM_CD"
        ],
        searchVal: [
            resultData.O_BRAND_CD,
            resultData.O_ITEM_CD
        ]
    });

    if (searchRow == -1) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "로케이션에 존재하지 않는 상품입니다."));
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        return;
    }

    // 스캔으로 세팅
    $NC.G_VAR.SCANNED_ITEM_BAR_CD = true;
    // 상품 선택
    G_GRDMASTER.lastRow = -1;
    $NC.setGridSelectRow(G_GRDMASTER, searchRow);
    // setFocusScan("#edtItem_Bar_Cd");
}

function onGetSub(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    // 리턴 값이 없으면 다시
    if ($NC.isEmpty(resultData)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "로케이션 존재여부를 확인하지 못했습니다. 다시 스캔하십시오."));
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        return;
    }

    setFocusScan("#edtLink_Location_Cd");
}

function onLocationScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtLocation_Cd");
        scanVal = $NC.getValue($scan);
    }

    // 이동(상대)로케이션
    if ($NC.isNull(scanVal)) {
        _Cancel();
        return;
    }

    // 초기화
    _Cancel();

    $NC.G_VAR.lastLocationCd = scanVal;
    $NC.setValue($scan, scanVal);

    G_GRDMASTER.queryParams = {
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_LOCATION_CD: $NC.G_VAR.lastLocationCd
    };
    // 데이터 조회
    $NC.serviceCall("/PDA_LCC02010E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onLocationError);
}

function onItemScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtItem_Bar_Cd");
        scanVal = $NC.getValue($scan);
    }

    // 상품바코드
    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_DETAIL);
        setFocusScan($scan);
        return;
    }

    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_DETAIL);

    $NC.G_VAR.lastItemBarCd = scanVal;
    if ($NC.G_VAR.SCANNED_DISPLAY_ITEM_BAR_CD) {
        $NC.setValue("#edtItem_Bar_Cd", scanVal);
    }

    $NC.serviceCall("/PDA_COMMON/getData.do", {
        P_QUERY_ID: "PDA_COMMON.CM_ITEM_CHECK",
        P_QUERY_PARAMS: {
            P_BU_CD: $NC.G_USERINFO.BU_CD,
            P_ITEM_BAR_CD: $NC.G_VAR.lastItemBarCd
        }
    }, onGetDetail, onItemError);
}

function onLinkLocationScan($scan, scanVal) {

    if ($NC.isNull($scan)) {
        $scan = $("#edtLink_Location_Cd");
        scanVal = $NC.getValue($scan);
    }

    // 로케이션
    if ($NC.isNull(scanVal)) {
        _Cancel($ND.C_CLEAR_TYPE_SUB);
        setFocusScan($scan);
        return;
    }

    // 초기화
    _Cancel($ND.C_CLEAR_TYPE_SUB);

    $NC.G_VAR.lastLinkLocationCd = scanVal;
    $NC.setValue($scan, scanVal);

    $NC.serviceCall("/PDA_COMMON/getData.do", {
        P_QUERY_ID: "PDA_COMMON.CM_LOCATION_CHECK",
        P_QUERY_PARAMS: {
            P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
            P_LOCATION_CD: $NC.G_VAR.lastLinkLocationCd,
            P_INOUT_DIV: "1"
        }
    }, onGetSub, onLinkLocationError);
}

function onQtyApply() {

    if ($NC.isNull($NC.G_VAR.lastLocationCd)) {
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        setFocusScan();
        return;
    }

    if ($NC.isNull($NC.G_VAR.lastItemBarCd)) {
        setFocusScan();
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if ($NC.isNull(rowData)) {
        setFocusScan();
        return;
    }

    if (rowData.STOCK_QTY == rowData.CONFIRM_QTY) {
        setFocusScan();
        return;
    }

    rowData.CONFIRM_BOX = rowData.STOCK_BOX;
    rowData.CONFIRM_EA = rowData.STOCK_EA;
    rowData.CONFIRM_QTY = rowData.STOCK_QTY;

    $NC.setValue("#edtConfirm_Box", rowData.CONFIRM_BOX);
    $NC.setValue("#edtConfirm_Ea", rowData.CONFIRM_EA);
    $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDMASTER, rowData);
}

function onSave(ajaxData) {

    var title = $NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "확인"), //
    message = $NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "정상 처리되었습니다."), //
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

function onLocationError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel();
    setFocusScan();
}

function onItemError(ajaxData) {

    $NC.onError(ajaxData);

    setFocusScan("#edtItem_Bar_Cd");
}

function onLinkLocationError(ajaxData) {

    $NC.onError(ajaxData);
    _Cancel($ND.C_CLEAR_TYPE_SUB);
    setFocusScan("#edtLink_Location_Cd");
}

function btnAllOnClick() {

    // 저장 전 Validation
    if ($NC.isNull($NC.G_VAR.lastLocationCd)) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "로케이션을 먼저 스캔하십시오."));
        setFocusScan();
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "처리할 상품 내역이 없습니다."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.PDA_LCC02010E0.XXX", "전체 상품의 변환수량을 입력 처리하시겠습니까? "))) {
        return;
    }

    // 전체 데이터 이동수량 입력
    var rIndex, rCount, rowData;
    G_GRDMASTER.data.beginUpdate();
    try {
        for (rIndex = 0, rCount = G_GRDMASTER.data.getLength(); rIndex < rCount; rIndex++) {
            rowData = G_GRDMASTER.data.getItem(rIndex);

            // 변환상태 지정되어 있지 않은 경우 강제 지정
            if ($NC.isNull(rowData.LINK_ITEM_STATE)) {
                if (rowData.ITEM_STATE == "A") {
                    rowData.LINK_ITEM_STATE = "X";
                } else {
                    rowData.LINK_ITEM_STATE = "A";
                }
            }

            // 수량 입력
            rowData.CONFIRM_BOX = rowData.STOCK_BOX;
            rowData.CONFIRM_EA = rowData.STOCK_EA;
            rowData.CONFIRM_QTY = rowData.STOCK_QTY;

            // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
            $NC.setGridApplyChange(G_GRDMASTER, rowData);
        }
    } finally {
        G_GRDMASTER.data.endUpdate();

        rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

        $NC.setValue("#edtConfirm_Box", rowData.CONFIRM_BOX);
        $NC.setValue("#edtConfirm_Ea", rowData.CONFIRM_EA);
        $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);

        setFocusScan("#edtLink_Location_Cd");
    }
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
    });
}