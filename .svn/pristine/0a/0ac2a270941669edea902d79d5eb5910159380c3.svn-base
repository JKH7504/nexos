/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CSC09010Q0
 *  프로그램명         : 쿼리실행기
 *  프로그램설명       : 쿼리실행기 화면 Javascript
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

    // 상단그리드 초기화
    grdMasterInitialize();

    // 버튼 이벤트 연결
    $("#btnOpenQuery").click(btnOpenQueryOnClick);
    $("#btnSaveQuery").click(btnSaveQueryOnClick);
}

function _OnLoaded() {

    // 스플리터 초기화
    $NC.setInitSplitter("#divMasterView", "h", 300);

    $NC.setFocus("#edtQQuery_Text");
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

    var $view = $("#edtQQuery_Text");
    $view.css({
        "width": $view.parent().width(),
        "height": $view.parent().height() - $NC.G_LAYOUT.header
    });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var P_QUERY_TEXT = $NC.getValue("#edtQQuery_Text");
    if ($NC.isNull(P_QUERY_TEXT)) {
        alert($NC.getDisplayMsg("JS.CSC09010Q0.001", "검색할 쿼리를 입력하십시오."));
        return;
    }

    // 쿼리 체크
    if (!canExecuteQuery(P_QUERY_TEXT.trim().toUpperCase())) {
        alert($NC.getDisplayMsg("JS.CSC09010Q0.002", "조회 쿼리만 실행 가능합니다."));
        return;
    }

    if (P_QUERY_TEXT.endsWith(";")) {
        P_QUERY_TEXT = P_QUERY_TEXT.substring(0, P_QUERY_TEXT.length - 1);
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);
    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_QUERY_TEXT: P_QUERY_TEXT,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    G_GRDMASTER.view.setColumns([]);
    // 데이터 조회 - 상단그리드
    $NC.serviceCall("/CSC09010Q0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onGetMasterError);
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

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: [],
        queryId: "WT.CS_DYNAMIC_SELECT",
        redefineColumn: $ND.C_NO
    // 컬럼 재정의 사용안함, 동적 컬럼 사용으로 재정의 사용불가
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

function grdMasterSetColumns(rowData) {

    var columns = [];
    if ($NC.isNotNull(rowData)) {
        for ( var field in rowData) {
            if (field == "id" || field == "CRUD") {
                continue;
            }
            $NC.setGridColumn(columns, {
                id: field,
                field: field,
                name: field,
                minWidth: field.length * 10
            });
        }
    }

    G_GRDMASTER.view.setColumns(columns);
}

function isBeginBlockComment(lineText) {

    var blockPosition, result = false;
    do {
        blockPosition = lineText.indexOf("/*");
        if (blockPosition == -1) {
            break;
        }
        blockPosition = lineText.indexOf("*/");
        if (blockPosition == -1) {
            result = true;
            break;
        }
        lineText = lineText.substring(blockPosition + 2).trim();
    } while (true);
    return {
        lineText: lineText,
        isComment: result
    };
}

function canExecuteQuery(queryText) {

    var result = false;
    try {
        var checkToken = queryText.substr(0, 2);
        // 주석 체크
        // 주석이 아닐 경우 SELECT인지 체크
        if (checkToken != "--" && checkToken != "/*") {
            if (queryText.substr(0, 6) == "SELECT" || queryText.substr(0, 4) == "WITH") {
                result = true;
            }
        }
        // 주석일 경우 라인단위로 체크
        else {
            var queryLines = queryText.split("\n");
            var lineText, blockPosition;
            var blockToken, blockComment = false;
            for (var rIndex = 0, rCount = queryLines.length; rIndex < rCount; rIndex++) {
                lineText = queryLines[rIndex].trim();
                if ($NC.isNull(lineText)) {
                    continue;
                }
                if (!blockComment) {
                    checkToken = lineText.substr(0, 2);
                    // 라인 주석 skip
                    if (checkToken == "--") {
                        continue;
                    }
                } else {
                    blockPosition = lineText.indexOf("*/");
                    if (blockPosition == -1) {
                        continue;
                    }
                    lineText = lineText.substring(blockPosition + 2).trim();
                }
                // 블럭 주석 체크
                blockToken = isBeginBlockComment(lineText);
                if (blockToken.isComment) {
                    blockComment = true;
                    continue;
                }
                lineText = blockToken.lineText;
                if (lineText.substr(0, 6) == "SELECT" || lineText.substr(0, 4) == "WITH") {
                    result = true;
                    break;
                }
            }
        }
    } catch (e) {
        //
    }
    return result;
}

function btnOpenQueryOnClick() {

    $NC.showUploadFilePopup(".txt, .sql", function(view, fileName) {

        var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (fileExt != "txt") {
            alert($NC.getDisplayMsg("JS.CSC09010Q0.003", "텍스트 또는 SQL 파일(*.txt, *.sql) 파일을 선택하십시오."));
            return;
        }

        $NC.fileUpload("/CSC09010Q0/openQuery.do", {
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, function(ajaxData) {
            var resultData = $NC.toObject(ajaxData);

            // 조회시 전역 변수 값 초기화
            $NC.setInitGridVar(G_GRDMASTER);
            G_GRDMASTER.view.setColumns([]);
            $NC.setInitGridData(G_GRDMASTER);

            $NC.setValue("#edtQQuery_Text", resultData.RESULT_DATA);
        });
    });
}

function btnSaveQueryOnClick() {

    var QUERY_TEXT = $NC.getValue("#edtQQuery_Text");
    if ($NC.isNull(QUERY_TEXT)) {
        alert($NC.getDisplayMsg("JS.CSC09010Q0.004", "저장할 쿼리를 입력하십시오."));
        return;
    }

    var result = confirm($NC.getDisplayMsg("JS.CSC09010Q0.005", "쿼리를 파일로 저장하시겠습니까?"));
    if (result) {
        $NC.fileDownload("/CSC09010Q0/saveQuery.do", {
            P_QUERY_TEXT: QUERY_TEXT,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        });
    }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if ($NC.setInitGridAfterOpen(G_GRDMASTER)) {
        var rowData = G_GRDMASTER.data.getItem(0);
        grdMasterSetColumns(rowData);
        try {
            G_GRDMASTER.view.autosizeColumns();
        } catch (e) {
            //
        }
    }

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetMasterError(ajaxData) {

    grdMasterSetColumns();
    $NC.setInitGridData(G_GRDMASTER);
    $NC.setGridDisplayRows(G_GRDMASTER, 0, 0);

    $NC.onError(ajaxData);
}
