/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDC02010E0
 *  프로그램명         : 송수신 스케줄링
 *  프로그램설명       : 송수신 스케줄링 화면 Javascript
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
        autoResizeView: {
            container: "#divMasterView",
            grids: [
                "#grdMaster"
            ]
        }
    });

    // 그리드 초기화
    grdMasterInitialize();

    // 사업부 검색 버튼 클릭
    $("#btnQBu_Cd").click(showUserBuPopup);

    // 스케줄러 Event 바인딩
    $("#btnStartScheduler").click(btnStartSchedulerOnClick);
    $("#btnStopScheduler").click(btnStopSchedulerOnClick);

    // SAP Server Event 바인딩
    $("#btnStartSAPServer").click(btnStartSAPServerOnClick);
    $("#btnStopSAPServer").click(btnStopSAPServerOnClick);

    // 원 Display 기억을 위해 코딩으로 숨김
    $NC.setVisible("#divSAPServer", false);
    getSAPServerUseYn();
    $NC.setEnableButton("#divMasterView", false);
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
 * Input, Select Change Event 처리
 * 
 * @param e
 *        이벤트 핸들러
 * @param view
 *        대상 Object
 */
function _OnConditionChange(e, view, val) {

    // 조회 조건에 Object Change
    var id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
        case "BU_CD":
            if (val == $ND.C_BASE_BU_CD) {
                $NC.setValue("#edtQBu_Nm", $ND.C_BASE_NM);
                break;
            } else {
                $NP.onUserBuChange(val, {
                    P_USER_ID: $NC.G_USERINFO.USER_ID,
                    P_BU_CD: val,
                    P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
                }, onUserBuPopup, {
                    addBase: $ND.C_BASE_BU_CD
                });
                return;
            }
    }
    // 화면클리어
    onChangingCondition();
}

function onChangingCondition() {

    // 초기화
    $NC.clearGridData(G_GRDMASTER);
    $NC.setValue("#lblQSchedulerStartedYN", $NC.getDisplayMsg("JS.EDC02010E0.001", "스케줄실행여부: 미확인"));

    // 공통 버튼 초기화 - 조회 버튼만 활성
    $NC.setInitTopButtons();
    $NC.setEnableButton("#divMasterView", false);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    // 조회조건 체크
    var BU_CD = $NC.getValue("#edtQBu_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_BU_CD: BU_CD
    };
    // 데이터 조회
    $NC.serviceCall("/EDC02010E0/getSchedulerDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    // 스케줄 동작여부
    getSchedulerStartedYn();
    // SAP서버 동작여부
    getSAPServerStartedYn();
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

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BU_CD_F",
        field: "BU_CD_F",
        name: "사업부"
    });
    $NC.setGridColumn(columns, {
        id: "EDI_DIV_D",
        field: "EDI_DIV_D",
        name: "송수신구분"
    });
    $NC.setGridColumn(columns, {
        id: "DEFINE_NO",
        field: "DEFINE_NO",
        name: "정의번호"
    });
    $NC.setGridColumn(columns, {
        id: "DEFINE_NM",
        field: "DEFINE_NM",
        name: "정의명칭"
    });
    $NC.setGridColumn(columns, {
        id: "DATA_DIV_D",
        field: "DATA_DIV_D",
        name: "데이터처리구분"
    });
    $NC.setGridColumn(columns, {
        id: "AUTO_EXEC_YN",
        field: "AUTO_EXEC_YN",
        name: "자동수행여부",
        cssClass: "styCenter",
        resizable: false,
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "REMOTE_DIV_D",
        field: "REMOTE_DIV_D",
        name: "원격송수신구분"
    });
    $NC.setGridColumn(columns, {
        id: "DATA_CYCLE_DIV_D",
        field: "DATA_CYCLE_DIV_D",
        name: "송수신주기구분"
    });
    $NC.setGridColumn(columns, {
        id: "REPEAT_EXEC_TIME",
        field: "REPEAT_EXEC_TIME",
        name: "수행주기"
    });
    $NC.setGridColumn(columns, {
        id: "CURR_EXEC_YN",
        field: "CURR_EXEC_YN",
        name: "현재수행여부",
        cssClass: "styCenter",
        resizable: false,
        formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
        id: "CURR_EXEC_TIME",
        field: "CURR_EXEC_TIME",
        name: "현재수행시간(초)",
        cssClass: "styRight"
    });
    $NC.setGridColumn(columns, {
        id: "NEXT_EXEC_TIME",
        field: "NEXT_EXEC_TIME",
        name: "다음수행시각",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "LAST_EXEC_TIME",
        field: "LAST_EXEC_TIME",
        name: "최종수행시각",
        cssClass: "styCenter"
    });

    return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 수신처리 내역
 */
function grdMasterInitialize() {

    var options = {
        frozenColumn: 3,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                // 실행 중
                if (rowData.CURR_EXEC_YN == $ND.C_YES) {
                    // 1시간 이상
                    if (Number(rowData.CURR_EXEC_TIME) > 3600) {
                        return "styError";
                    } else {
                        return "styActive";
                    }
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "EDC02010E0.RS_MASTER",
        sortCol: "BU_CD",
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

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    $NC.setInitGridAfterOpen(G_GRDMASTER);

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
    $NC.setEnableButton("#divMasterView", $NC.getProgramPermission().canSave);
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */

function showUserBuPopup() {

    $NP.showUserBuPopup({
        queryParams: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: $ND.C_ALL,
            P_VIEW_DIV: "2" // 1:등록팝업, 2:조회팝업
        },
        addBase: $ND.C_BASE_BU_CD
    }, onUserBuPopup, function() {
        $NC.setFocus("#edtQBu_Cd", true);
    });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
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

function btnStartSchedulerOnClick() {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.002", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.003", "조회 후 시작 처리하십시오."));
        return;
    }

    $NC.serviceCall("/EDC02010E0/startScheduler.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, _Inquiry, function(ajaxData) {
        $NC.onError(ajaxData);
        _Inquiry();
    });
}

function btnStopSchedulerOnClick() {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.002", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.004", "조회 후 스케줄러 중지 처리하십시오."));
        return;
    }

    $NC.serviceCall("/EDC02010E0/stopScheduler.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, _Inquiry, function(ajaxData) {
        $NC.onError(ajaxData);
        _Inquiry();
    });
}

function getSchedulerStartedYn(ajaxData) {

    $NC.serviceCall("/EDC02010E0/getSchedulerStartedYN.do", null, onGetSchedulerStartedYN);

    if ($NC.isNull(ajaxData)) {
        return;
    }
    var resultData = $NC.getErrorMessage(ajaxData);
    if ($NC.isNotNull(resultData.RESULT_MSG) && resultData.RESULT_MSG != $ND.C_OK) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.XXX", resultData.RESULT_MSG));
        return;
    }
}

function onGetSchedulerStartedYN(ajaxData) {

    var result = $NC.toObject(ajaxData);

    if (result.RESULT_DATA == $ND.C_YES) {
        $NC.setValue("#lblQSchedulerStartedYN", $NC.getDisplayMsg("JS.EDC02010E0.005", "스케줄실행여부: 실행 중"));
    } else {
        $NC.setValue("#lblQSchedulerStartedYN", $NC.getDisplayMsg("JS.EDC02010E0.006", "스케줄실행여부: 대기 중"));
    }
}

function btnStartSAPServerOnClick() {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.002", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.003", "조회 후 시작 처리하십시오."));
        return;
    }

    $NC.serviceCall("/EDC02010E0/startSAPServer.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, _Inquiry, function(ajaxData) {
        $NC.onError(ajaxData);
        _Inquiry();
    });
}

function btnStopSAPServerOnClick() {

    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.002", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.007", "조회 후 SAP서버 중지 처리하십시오."));
        return;
    }

    $NC.serviceCall("/EDC02010E0/stopSAPServer.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, _Inquiry, function(ajaxData) {
        $NC.onError(ajaxData);
        _Inquiry();
    });
}

function getSAPServerStartedYn(ajaxData) {

    $NC.serviceCall("/EDC02010E0/getSAPServerStartedYN.do", null, onGetSAPServerStartedYN);

    if ($NC.isNull(ajaxData)) {
        return;
    }
    var resultData = $NC.getErrorMessage(ajaxData);
    if ($NC.isNotNull(resultData.RESULT_MSG) && resultData.RESULT_MSG != $ND.C_OK) {
        alert($NC.getDisplayMsg("JS.EDC02010E0.XXX", resultData.RESULT_MSG));
        return;
    }
}

function onGetSAPServerStartedYN(ajaxData) {

    var result = $NC.toObject(ajaxData);

    if (result.RESULT_DATA == $ND.C_YES) {
        $NC.setValue("#lblQSAPServerStartedYN", $NC.getDisplayMsg("JS.EDC02010E0.008", "SAP서버실행여부: 실행 중"));
    } else {
        $NC.setValue("#lblQSAPServerStartedYN", $NC.getDisplayMsg("JS.EDC02010E0.009", "SAP서버실행여부: 대기 중"));
    }
}

function getSAPServerUseYn() {

    $NC.serviceCall("/EDC02010E0/getSAPServerUseYN.do", null, function(ajaxData) {
        var result = $NC.toObject(ajaxData);
        $NC.setVisible("#divSAPServer", result.RESULT_DATA == $ND.C_YES);
    }, function(ajaxData) {
        $NC.setVisible("#divSAPServer", false);
    });
}
