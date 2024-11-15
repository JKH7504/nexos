/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : main
 *  프로그램명         : MDI Main
 *  프로그램설명       : MDI Main 화면 Javascript
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
        // 실행 단위 화면 목록
        windows: [ ],
        // 최종 실행 화면, 단위화면, 단위화면 팝업, 공통코드검색 팝업, 출력미리보기 팝업
        lastWindow: null,
        // 현재 활성화된 단위 화면
        activeWindow: null,
        // 현재 활성화된 단위 화면 팝업
        activeSubWindow: null,
        // 현재 활성화된 공통코드검색, 출력미리보기 팝업
        activePopupWindow: null,
        // 오류 메시지 전체 표시 여부
        isFullErrorMessage: false,
        // 데이터 검색 및 복사 관련 정보
        copyInfo: {
            targetGrid: "",
            columnField: "",
            columnName: "",
            rowCount: 0,
            lastSearchVal: "",
            lastSearchIndex: -1
        },
        baseUrl: "/nexos/desktop/wms/",
        // 프로그램 목록 탭 Object
        sctProgram: null,
        // 로그아웃 여부
        isLogout: false,
        // 암호화 처리
        isEncPayload: true,
        // 메뉴 선택 옵션, 프로그램 활성시 닫힌 메뉴 펼치기 여부
        isAutoMenuExpand: false,
        // 메뉴 펼칠 때 다른 -1: 사용안함, 0: 전체, 1: 1 단계만
        autoMenuCloseLevel: 0,
        // 실행 단위 화면 리사이즈 처리 Timeout Event
        onResizeTimeout: null,
        // 출력물 리스트 Timeout Event
        onPrintListTimeout: null,
        // 데이터 복사 Timeout Event
        onCopyDataTimeout: null,
        // 프로그램 Loading Timeout Event
        onProgramLoadingTimeout: null
    });

    // 초기 숨김 처리
    $("#ctrTopCommonButtons").hide();

    // 모바일 화면 조정
    setMobileSupport();

    // 버튼 이벤트 바인딩
    commonEventInitialize();
    // 팝업 메뉴 초기화
    contextMenuInitialize();

    // 그리드 초기화
    grdProgramMenuInitialize();
    grdFavoriteMenuInitialize();
    grdReportInitialize();

    // 프로그램 리스트 Tab 초기화
    sctProgramInitialize();
    // 출력리스트 Overlay 초기화
    reportOverlayInitialize();
    // 그리드 데이터 복사 Overlay 초기화
    copyGridDataOverlayInitialize();
    // 개인정보 체크, 엑셀 다운로드 Overlay 초기화
    piExcelDownloadOverlayInitialize();
    // 로그인 팝업 초기화
    loginPopupInitialize();

    showMenu(false);
}

/**
 * Load 완료시 호출 됨
 */
function _OnLoaded() {

    getSessionUserInfo();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.minWidth = 1100;
    $NC.G_OFFSET.minHeight = 600;
    $NC.G_OFFSET.defaultMenuWidth = 220;
    $NC.G_OFFSET.currentMenuWidth = 0;
    $NC.G_OFFSET.tabProgramHeight = 24;
    $NC.G_OFFSET.nonClientHeight = $NC.getViewHeight("#ctrTopMenuBar,#ctrTopLineBar,#ctrBottomLineBar");

    // 모바일일 경우 최소 사이즈 조정
    if ($.browser.mobile) {
        var viewWidth = $(window).width(), viewHeight = $(window).height();
        // 가로뷰일 경우
        if (viewWidth > viewHeight) {
            $NC.G_OFFSET.minWidth = Math.max(viewWidth, $NC.G_OFFSET.minWidth);
            $NC.G_OFFSET.minHeight = Math.max(viewHeight, $NC.G_OFFSET.minHeight);
        }
        // 세로뷰일 경우
        else {
            $NC.G_OFFSET.minWidth = Math.max(viewHeight, $NC.G_OFFSET.minHeight) * (viewHeight / viewWidth);
            $NC.G_OFFSET.minHeight = Math.max(viewHeight, $NC.G_OFFSET.minHeight);
        }

        $NC.G_CHILDLAYOUT.minWidth = $NC.G_OFFSET.minWidth - $NC.G_OFFSET.defaultMenuWidth;
        $NC.G_CHILDLAYOUT.minHeight = $NC.G_OFFSET.minHeight - $NC.G_OFFSET.nonClientHeight;
    }
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight, syncResize) {

    // Viewport 사이즈/스크롤바 조정 - Window 사이즈에 맞게 조정, 화면 최소 사이즈보다 작으면 스크롤바 보임
    var actualWidth = viewWidth, actualHeight = viewHeight;
    var $view = $("#ctrViewport"), overflowX = "hidden", overflowY = "hidden", scrollX = 0, scrollY = 0;
    $NC.resizeContainer($view, actualWidth, actualHeight);

    if (actualWidth < $NC.G_OFFSET.minWidth) {
        scrollY = $NC.G_LAYOUT.scroll.height;
        overflowX = "scroll";
    }
    if (actualHeight < $NC.G_OFFSET.minHeight) {
        scrollX = $NC.G_LAYOUT.scroll.width;
        overflowY = "scroll";
    }
    $view.css("overflow", overflowX + " " + overflowY);

    // 화면 최대 사이즈 계산 - 화면 최소 사이즈 이상
    actualWidth = Math.max(actualWidth, $NC.G_OFFSET.minWidth) - scrollX;
    actualHeight = Math.max(actualHeight, $NC.G_OFFSET.minHeight) - scrollY;
    // 전체 화면 요소 사이즈 조정
    $NC.resizeContainer("#ctrMainView", actualWidth, actualHeight);

    // 단위 화면 영역 계산
    actualHeight -= $NC.G_OFFSET.nonClientHeight;
    $NC.resizeContainer("#ctrClientView", actualWidth, actualHeight);

    // 메뉴 사이즈 조정
    $NC.resizeGridView("#ctrMenuView", [
        "#grdProgramMenu",
        "#grdFavoriteMenu"
    ], $NC.G_OFFSET.currentMenuWidth, actualHeight, null, $NC.getViewHeight("#ctrMenuTitleBar"));

    // 단위 화면 영역 사이즈 조정
    actualWidth -= $NC.G_OFFSET.currentMenuWidth;
    $NC.resizeContainer("#ctrWindows", actualWidth, actualHeight);
    $NC.G_CHILDLAYOUT.width = actualWidth;
    $NC.G_CHILDLAYOUT.height = actualHeight;

    // 활성화된 단위화면, 일반/공통/미리보기 팝업 Window 사이즈 조정
    clearTimeout($NC.G_VAR.onResizeTimeout);
    if (syncResize) {
        resizeChildWindows();
    } else {
        $NC.G_VAR.onResizeTimeout = setTimeout(resizeChildWindows, $ND.C_TIMEOUT_ACT_FAST);
    }

    // ScrollTab 좌/우 스크롤버튼 처리를 위해 호출
    $NC.G_VAR.sctProgram.refreshScrollButtons();

    // 추가 조정
    // 로그인 팝업 표시 중이면 위치 조정
    $view = $("#ctrLoginLayer");
    if ($NC.isDialogOpen($view)) {
        $view.parent().css({
            left: (viewWidth - $view.outerWidth(true)) / 2,
            top: (viewHeight - $view.outerHeight(true)) / 2
        });
    }
    // 출력 항목 Overlay 표시시 위치 조정
    $view = $("#ctrReportLayer");
    if ($NC.isVisible($view)) {
        $view.css("left", $("#btnTopReport").offset().left);
    }
}

/**
 * 전체 서비스 호출 실행 후 Call
 * 
 * @param ajaxData
 *        ajaxData, serviceRequest: isSuccess, requestUrl, requestData
 * @returns
 */
function _OnAfterServiceCall(ajaxData, serviceRequest) {

    // 개인정보 조회에 대한 기록
    if ($NC.G_USERINFO.USE_SECURITY_LOG === $ND.C_YES) {
        // 체크 대상 프로그램이 없으면 처리 안함
        if ($NC.isNull($NC.G_VAR.personalInfoPrograms)) {
            return;
        }
        try {
            // 정상처리일 경우만 기록
            if (!serviceRequest.isSuccess) {
                return;
            }
            var requestUrl = serviceRequest.requestUrl || "";
            // 조회 서비스 호출, getData, getDataSet, getDataList
            if (requestUrl.indexOf("/getData") == -1) {
                return;
            }
            // 서비스 Url에서 프로그램ID Parsing
            var rIndex, rCount, isTarget = false, ACTIVITY_PROGRAM_ID = requestUrl.substring(1, requestUrl.indexOf("/", 1));
            // 프로그램 및 결과 데이터 체크
            for (rIndex = 0, rCount = $NC.G_VAR.personalInfoPrograms.length; rIndex < rCount; rIndex++) {
                var checkingProgram = $NC.G_VAR.personalInfoPrograms[rIndex] || "";
                if (ACTIVITY_PROGRAM_ID.indexOf(checkingProgram) == -1 || $NC.isNull(serviceRequest.requestData)) {
                    continue;
                }
                isTarget = true;
                break;
            }
            if (!isTarget) {
                return;
            }
            var responseData = ajaxData.data || "";
            var piColumns = $NC.G_VAR.personalInfoColumns || [ ];
            for (rIndex = 0, rCount = piColumns.length; rIndex < rCount; rIndex++) {
                if (responseData.indexOf("\"" + piColumns[rIndex] + "\"") > -1) {
                    $NC.serviceCallAndWait("/WC/writeActivityLog.do", {
                        P_QUERY_PARAMS: {
                            P_ACTIVITY_CD: ACTIVITY_PROGRAM_ID,
                            P_ACTIVITY_COMMENT: objToParamString(serviceRequest.requestData),
                            P_ACTIVITY_DIV: "21", // 21 - 개인정보조회
                            P_USER_ID: $NC.G_USERINFO.USER_ID
                        }
                    }, function() {
                        // 성공
                    }, function() {
                        // 실패 메시지 표시 하지 않음
                    });
                    break;
                }
            }

            // 프로그램만 체크
            // for (var rIndex = 0, rCount = $NC.G_VAR.personalInfoPrograms.length; rIndex < rCount; rIndex++) {
            // var checkingProgram = $NC.G_VAR.personalInfoPrograms[rIndex] || "";
            // if (ACTIVITY_PROGRAM_ID.indexOf(checkingProgram) == -1 || $NC.isNull(serviceRequest.requestData)) {
            // continue;
            // }
            // var QUERY_ID = serviceRequest.requestData.P_QUERY_ID || "";
            // if (QUERY_ID.indexOf(checkingProgram) == -1) {
            // continue;
            // }
            // $NC.serviceCallAndWait("/WC/writeActivityLog.do", {
            // P_ACTIVITY_CD: ACTIVITY_PROGRAM_ID,
            // P_ACTIVITY_COMMENT: objToParamString(serviceRequest.requestData),
            // P_ACTIVITY_DIV: "21", // 21 - 개인정보조회
            // P_USER_ID: $NC.G_USERINFO.USER_ID
            // }, function() {
            // // 성공
            // }, function() {
            // // 실패 메시지 표시 하지 않음
            // });
            // break;
            // }
        } catch (e) {
            //
        }
    }
}

function setMobileSupport() {

    if (!$.browser.mobile) {
        return;
    }

    $("#ctrTopCommonButtons").css("minWidth", 400);
    var $viewport = $("head").children("meta[name='viewport']"), content;
    if ($viewport.length < 1) {
        $viewport = $("<meta name='viewport' />").appendTo($("head"));
    }
    if (!$Android.isValid()) {
        content = "width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    } else {
        var viewportWidth = $(window).width(), viewportHeight = $(window).height();
        var designWidth = $Android.callby("getDesignWidth"), scaleVal;
        if ($Android.callby("getScreenOrientation") == 1) {
            scaleVal = viewportWidth / designWidth;
        } else {
            scaleVal = viewportHeight / designWidth;
        }

        $NC.G_OFFSET.viewportWidth = viewportWidth / scaleVal;
        $NC.G_OFFSET.viewportHeight = viewportHeight / scaleVal;

        content = "width=" + $NC.G_OFFSET.viewportWidth //
            + ", height=" + $NC.G_OFFSET.viewportHeight //
            + ", initial-scale=" + scaleVal //
            + ", maximum-scale=" + scaleVal;
    }
    $viewport.attr("content", content);
}

/**
 * Input KeyUp Event - Input, Select Keyup 시 호출 됨
 */
function _OnInputKeyUp(e, view) {

    if (e.keyCode != 13) {
        return;
    }

    switch (view.prop("id")) {
        case "edtUser_Pwd":
            btnLoginOnClick();
            break;
        case "edtReset_User_Email":
            btnResetUserPwdOnClick();
            break;
    }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    var contentWindow = $NC.getChildWindow(activeWindow);
    if ($.isFunction(contentWindow._Inquiry)) {
        contentWindow._Inquiry();
    }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    if (activeWindow.get("G_PARAMETER").EXE_LEVEL1 !== $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var contentWindow = $NC.getChildWindow(activeWindow);
    if ($.isFunction(contentWindow._New)) {
        contentWindow._New();
    }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    if (activeWindow.get("G_PARAMETER").EXE_LEVEL1 !== $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var contentWindow = $NC.getChildWindow(activeWindow);
    if ($.isFunction(contentWindow._Save)) {
        contentWindow._Save();
    }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    if (activeWindow.get("G_PARAMETER").EXE_LEVEL1 !== $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    var contentWindow = $NC.getChildWindow(activeWindow);
    if ($.isFunction(contentWindow._Cancel)) {
        contentWindow._Cancel();
    }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    if (activeWindow.get("G_PARAMETER").EXE_LEVEL2 !== $ND.C_YES) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    var contentWindow = $NC.getChildWindow(activeWindow);
    if ($.isFunction(contentWindow._Delete)) {
        contentWindow._Delete();
    }
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 */
function _Print() {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    var contentWindow = $NC.getChildWindow(activeWindow);
    if ($.isFunction(contentWindow._Print)) {
        var rowData = G_GRDREPORT.data.getItem(G_GRDREPORT.lastRow);
        if ($NC.isNull(rowData)) {
            return;
        }

        setTimeout(function() {
            contentWindow._Print(rowData);
        }, $ND.C_TIMEOUT_ACT);
    }
}

function _OnAfterPrint() {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    var contentWindow = $NC.getChildWindow(activeWindow);
    if ($.isFunction(contentWindow._OnAfterPrint)) {
        contentWindow._OnAfterPrint();
    }
}

/**
 * Event 초기화
 */
function commonEventInitialize() {

    $(window) //
    .on("beforeunload", function(e) {
        if ($NC.G_VAR.windows.length > 0 && $NC.G_VAR.isLogout == false) {
            return $NC.getDisplayMsg("JS.MAIN.003", "현재 작업 중인 화면이 존재합니다. 다른 사이트로 이동시 모든 화면이 초기화됩니다.");
        }
    }) //
    .on("unload", function(e) {
        // 프로그램 종료 기록
        writeProgramActivityLog("12");
    });

    $NC.setValue("#lblServerVersion", $("meta[name=Nexos-Server-Version]").prop("content") || "0.0.0");
    $("#btnTopInquiry").click(_Inquiry);
    $("#btnTopNew").click(_New);
    $("#btnTopSave").click(_Save);
    $("#btnTopCancel").click(_Cancel);
    $("#btnTopDelete").click(_Delete);
    $("#btnTopMenu").click(function(e) {
        if ($("#ctrPinMenu").is(".styActive")) {
            alert($NC.getDisplayMsg("JS.MAIN.004", "메뉴 항상 보이기로 설정되어 있습니다."));
            return;
        }
        toggleMenu();
    });
    $("#btnTopUser").click(showChangeUserPwdPopup);
    $("#btnTopClose").click(btnTopCloseOnClick);
    $("#btnTopLogout").click(btnTopLogoutOnClick);
    $("#btnReloadMenu").click(btnReloadMenuOnClick);
    $("#btnPinMenu").click(function(e) {
        var PIN_MENU = $("#ctrPinMenu").toggleClass("styActive").is(".styActive") ? $ND.C_YES : $ND.C_NO;
        $NC.setLocalStorage("_PIN_MENU", PIN_MENU);
    });
    $("#btnCloseMenu").click(function() {
        if ($("#ctrPinMenu").is(".styActive")) {
            alert($NC.getDisplayMsg("JS.MAIN.004", "메뉴 항상 보이기로 설정되어 있습니다."));
            return;
        }
        showMenu(false);
    });
    $("#btnLogin").click(btnLoginOnClick);
    $("#btnResetForm").click(toggleLoginForm).hide();
    $("#edtUser_Pwd").css("padding-right", "4px");
    $NC.setTooltip("#btnResetForm", $NC.getDisplayMsg("JS.MAIN.017", "비밀번호 초기화"));
    $("#btnLoginForm").click(toggleLoginForm);
    $("#btnResetUserPwd").click(btnResetUserPwdOnClick);
    $("#ctrTopLogo").dblclick(showDeveloperPopup);
    $("#ctrMainView").focus(setFocusActiveWindow);
    $("#dspProgramMenuTitle").click(function(e) {
        $NC.setLocalStorage("_FAVORITE", $ND.C_YES);
        showFavoriteMenu(e);
    });
    $("#dspFavoriteMenuTitle").click(function(e) {
        $NC.setLocalStorage("_FAVORITE", $ND.C_NO);
        showProgramMenu(e);
    });

    $("#edtSearchMenu") //
    .change(function(e) {
        var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(e.target).val()), "i");
        var matchedItems = $.grep(G_GRDPROGRAMMENU.data.getItems(), function(item) {
            return item.PROGRAM_DIV != "M" && (matcher.test(item.PROGRAM_ID) || matcher.test(item.PROGRAM_NM));
        });
        if ($NC.isNotNull(matchedItems) && matchedItems.length == 1) {
            showProgramPopup(matchedItems[0]);
            $(e.target).val("");
        }
    }) //
    .autocomplete({
        minLength: 2,
        source: function(request, response) {
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
            response($.grep(G_GRDPROGRAMMENU.data.getItems(), function(item) {
                return item.PROGRAM_DIV != "M" && (matcher.test(item.PROGRAM_ID) || matcher.test(item.PROGRAM_NM));
            }));
        },
        open: function(event, ui) {
            $(event.target).autocomplete("instance").bindings.filter("ul.ui-autocomplete").css({
                top: "65px",
                left: "0"
            });
        },
        // focus: function(event, ui) {
        // $(event.target).val(this.term);
        // return false;
        // },
        focus: function(event, ui) {
            return false;
        },
        select: function(event, ui) {
            showProgramPopup(ui.item);
            $(event.target).val("");
            return false;
        }
    }) //
    .data("uiAutocomplete")._renderItem = function(ul, item) {
        return $("<li>").append("<a>" + item.PROGRAM_NM + " (" + item.PROGRAM_ID + ")</a>").appendTo(ul);
    };

    var $view = $("#pgbProcessing");
    if ($view.length > 0) {
        $view.progressbar({
            value: false
        }).children().css("background-color", "#e6e6e6");
    }
    $("#ctrProcessingLayer") //
    .click(function(e) {
        if (e.ctrlKey || e.metaKey) {
            $NC.hideProgressMessage(true);
        }
    }) //
    .keydown(function(e) {
        e.preventDefault();
    });
    $("#ctrLoadingLayer") //
    .click(function(e) {
        if (e.ctrlKey || e.metaKey) {
            $NC.hideLoadingMessage(true);
        }
    }) //
    .keydown(function(e) {
        e.preventDefault();
    });
    $("#ctrPrintingLayer") //
    .click(function(e) {
        if (e.ctrlKey || e.metaKey) {
            $NC.hidePrintingMessage(true);
        }
    }) //
    .keydown(function(e) {
        e.preventDefault();
    });
}

/**
 * 팝업 메뉴 초기화
 */
function contextMenuInitialize() {

    $.contextMenu({
        selector: "#grdProgramMenu",
        trigger: "none",
        autoHide: true,
        forceHideBeforeCallback: true,
        zIndex: 1000,
        appendTo: "#ctrContextMenuLayer",
        itemClickEvent: "click",
        callback: function(itemKey, options) {
            var contextProgramId, rIndex, rowData;
            switch (itemKey) {
                case "add":
                    contextProgramId = $("#grdProgramMenu").data("contextProgramId");
                    rIndex = $NC.getGridSearchRow(G_GRDPROGRAMMENU, {
                        searchKey: "PROGRAM_ID",
                        searchVal: contextProgramId
                    });
                    if (rIndex == -1) {
                        alert($NC.getDisplayMsg("JS.MAIN.005", "프로그램 정보를 확인할 수 없습니다. 다시 작업하십시오."));
                        return;
                    }
                    $("#grdProgramMenu").contextMenu("hide");
                    rowData = G_GRDPROGRAMMENU.data.getItem(rIndex);
                    if (!confirm($NC.getDisplayMsg("JS.MAIN.006", "[프로그램명: " + rowData.PROGRAM_NM + "]\n\n해당 프로그램을 즐겨찾기에 추가하시겠습니까?",
                        rowData.PROGRAM_NM))) {
                        return;
                    }
                    // 
                    $NC.serviceCall("/WC/saveDataSet.do", {
                        P_DS_MASTER: [
                            {
                                P_PROGRAM_ID: contextProgramId,
                                P_USER_ID: $NC.G_USERINFO.USER_ID,
                                P_CRUD: $ND.C_DV_CRUD_C
                            }
                        ],
                        P_QUERY_PARAMS: {
                            P_CRUD_PROGRAM_ID: "WC",
                            P_CRUD_TABLE_NM: "CSUSERFAVORITE"
                        },
                        P_USER_ID: $NC.G_USERINFO.USER_ID
                    }, btnReloadMenuOnClick);
                    break;
                case "delete":
                    contextProgramId = $("#grdProgramMenu").data("contextProgramId");
                    rIndex = $NC.getGridSearchRow(G_GRDPROGRAMMENU, {
                        searchKey: "PROGRAM_ID",
                        searchVal: contextProgramId
                    });
                    if (rIndex == -1) {
                        alert($NC.getDisplayMsg("JS.MAIN.005", "프로그램 정보를 확인할 수 없습니다. 다시 작업하십시오."));
                        return;
                    }
                    $("#grdProgramMenu").contextMenu("hide");
                    rowData = G_GRDPROGRAMMENU.data.getItem(rIndex);
                    if (!confirm($NC.getDisplayMsg("JS.MAIN.007", "[프로그램명: " + rowData.PROGRAM_NM + "]\n\n해당 프로그램을 즐겨찾기에서 삭제하시겠습니까?",
                        rowData.PROGRAM_NM))) {
                        return;
                    }
                    // 
                    $NC.serviceCall("/WC/saveDataSet.do", {
                        P_DS_MASTER: [
                            {
                                P_PROGRAM_ID: contextProgramId,
                                P_USER_ID: $NC.G_USERINFO.USER_ID,
                                P_CRUD: $ND.C_DV_CRUD_D
                            }
                        ],
                        P_QUERY_PARAMS: {
                            P_CRUD_PROGRAM_ID: "WC",
                            P_CRUD_TABLE_NM: "CSUSERFAVORITE"
                        },
                        P_USER_ID: $NC.G_USERINFO.USER_ID
                    }, btnReloadMenuOnClick);
                    break;
            }
        },
        items: {
            "add": {
                name: "즐겨찾기 추가",
                icon: "add",
                disabled: function(itemKey, options) {

                    return $("#grdProgramMenu").data("contextFavoriteYn") == $ND.C_YES;
                }
            },
            "sep1": "---------",
            "delete": {
                name: "즐겨찾기 삭제",
                icon: "delete",
                disabled: function(itemKey, options) {

                    return $("#grdProgramMenu").data("contextFavoriteYn") == $ND.C_NO;
                }
            }
        }
    });

    $.contextMenu({
        selector: "#grdFavoriteMenu",
        trigger: "none",
        autoHide: true,
        forceHideBeforeCallback: true,
        zIndex: 1000,
        appendTo: "#ctrContextMenuLayer",
        itemClickEvent: "click",
        callback: function(itemKey, options) {
            switch (itemKey) {
                case "delete":
                    var contextProgramId = $("#grdFavoriteMenu").data("contextProgramId");
                    var rIndex = $NC.getGridSearchRow(G_GRDFAVORITEMENU, {
                        searchKey: "PROGRAM_ID",
                        searchVal: contextProgramId
                    });
                    if (rIndex == -1) {
                        alert($NC.getDisplayMsg("JS.MAIN.005", "프로그램 정보를 확인할 수 없습니다. 다시 작업하십시오."));
                        return;
                    }
                    var rowData = G_GRDFAVORITEMENU.data.getItem(rIndex);
                    if (!confirm($NC.getDisplayMsg("JS.MAIN.007", "[프로그램명: " + rowData.PROGRAM_NM + "]\n\n해당 프로그램을 즐겨찾기에서 삭제하시겠습니까?",
                        rowData.PROGRAM_NM))) {
                        return;
                    }
                    // 
                    $NC.serviceCall("/WC/saveDataSet.do", {
                        P_DS_MASTER: [
                            {
                                P_PROGRAM_ID: contextProgramId,
                                P_USER_ID: $NC.G_USERINFO.USER_ID,
                                P_CRUD: $ND.C_DV_CRUD_D
                            }
                        ],
                        P_QUERY_PARAMS: {
                            P_CRUD_PROGRAM_ID: "WC",
                            P_CRUD_TABLE_NM: "CSUSERFAVORITE"
                        },
                        P_USER_ID: $NC.G_USERINFO.USER_ID
                    }, btnReloadMenuOnClick);
                    break;
            }
        },
        items: {
            "delete": {
                name: "즐겨찾기 삭제",
                icon: "delete",
                disabled: function(itemKey, options) {

                    return $("#grdFavoriteMenu").data("contextFavoriteYn") == $ND.C_NO;
                }
            }
        }
    });

    $.contextMenu({
        selector: "#sctProgram",
        trigger: "none",
        autoHide: true,
        forceHideBeforeCallback: true,
        zIndex: 1000,
        appendTo: "#ctrContextMenuLayer",
        itemClickEvent: "click",
        callback: function(itemKey, options) {
            switch (itemKey) {
                case "close":
                    var windowIndex = getWindowIndex($("#sctProgram").data("contextProgramId"));
                    if (windowIndex == -1) {
                        return;
                    }

                    // 프로그램 실행 로그 기록
                    var closeWindow = $NC.G_VAR.windows[windowIndex];
                    writeProgramActivityLog("12", closeWindow.get("G_PARAMETER").PROGRAM_ID);
                    removeChildWindow(closeWindow);
                    break;
                case "closeAll":
                    writeProgramActivityLog("12");

                    removeAllChildWindow();
                    break;
            }
        },
        items: {
            "close": {
                name: "프로그램 종료",
                icon: "quit"
            },
            "sep1": "---------",
            "closeAll": {
                name: "전체 종료",
                icon: "quit"
            }
        }
    });
}

/**
 * 종료 버튼 클릭 이벤트
 */
function btnTopCloseOnClick(e) {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    if (e.ctrlKey || e.metaKey) {
        writeProgramActivityLog("12");

        removeAllChildWindow();
    } else {
        // 프로그램 실행 로그 기록
        writeProgramActivityLog("12", activeWindow.get("G_PARAMETER").PROGRAM_ID);

        removeChildWindow(activeWindow);
    }
}

/**
 * 로그인 버튼 클릭 이벤트
 */
function btnLoginOnClick(e) {

    var USER_ID = $NC.getValue("#edtUser_Id");
    var USER_PWD = $NC.getValue("#edtUser_Pwd");

    if ($NC.isNull(USER_ID)) {
        alert($NC.getDisplayMsg("JS.MAIN.008", "사용자ID를 입력하십시오."));
        $NC.setFocus("#edtUser_Id");
        return;
    }

    if ($NC.isNull(USER_PWD)) {
        alert($NC.getDisplayMsg("JS.MAIN.009", "비밀번호를 입력하십시오."));
        $NC.setFocus("#edtUser_Pwd");
        return;
    }

    if ($NC.isNotNull($NC.G_USERINFO) && USER_ID != $NC.G_USERINFO.USER_ID && $NC.G_VAR.windows.length > 0) {
        if (confirm($NC.getDisplayMsg("JS.MAIN.010", "기존에 로그인했던 사용자가 아닙니다.\n로그인시 실행중인 프로그램이 모두 종료됩니다.\n\n입력한 사용자로 로그인하시겠습니까?"))) {
            removeAllChildWindow();
        } else {
            $NC.setValue("#edtUser_Id");
            $NC.setValue("#edtUser_Pwd");
            $NC.setFocus("#edtUser_Id");
            return;
        }
    }

    var $ctrLoginLayer = $("#ctrLoginLayer");
    if ($NC.isNull($ctrLoginLayer.data("loginType"))) {
        $ctrLoginLayer.data("loginType", 0);
    }

    if ($NC.G_VAR.isEncPayload) {
        $NC.serviceCall("/WC/loginEnc.do", getEncPayload({
            P_USER_ID: USER_ID,
            P_USER_PWD: USER_PWD,
            P_APPLICATION_DIV: "1"
        }), onLogin, onLoginError);
    } else {
        $NC.serviceCall("/WC/login.do", {
            P_USER_ID: USER_ID,
            P_USER_PWD: USER_PWD,
            P_APPLICATION_DIV: "1"
        }, onLogin, onLoginError);
    }
}

/**
 * 로그아웃 버튼 클릭 이벤트
 */
function btnTopLogoutOnClick() {

    if (!confirm($NC.getDisplayMsg("JS.MAIN.011", "로그아웃 하시겠습니까?"))) {
        return;
    }

    $NC.G_VAR.isLogout = true;
    $NC.serviceCall("/WC/logout.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onLogout);
}

function btnResetUserPwdOnClick() {

    var USER_ID = $NC.getValue("#edtReset_User_Id");
    var USER_NM = $NC.getValue("#edtReset_User_Nm");
    var USER_EMAIL = $NC.getValue("#edtReset_User_Email");

    if ($NC.isNull(USER_ID)) {
        alert($NC.getDisplayMsg("JS.MAIN.047", "사용자ID를 입력하십시오."));
        $NC.setFocus("#edtReset_User_Id");
        return;
    }

    if ($NC.isNull(USER_NM)) {
        alert($NC.getDisplayMsg("JS.MAIN.048", "사용자명을 입력하십시오."));
        $NC.setFocus("#edtReset_User_Nm");
        return;
    }

    if ($NC.isNull(USER_EMAIL)) {
        alert($NC.getDisplayMsg("JS.MAIN.049", "사용자 이메일을 입력하십시오."));
        $NC.setFocus("#edtReset_User_Email");
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.MAIN.050", "사용자 비밀번호를 초기화 하시겠습니까?"))) {
        return;
    }

    $NC.serviceCall("/WC/resetUserPwd.do", {
        P_USER_ID: USER_ID,
        P_USER_NM: USER_NM,
        P_USER_EMAIL: USER_EMAIL
    }, onResetUserPwd, onResetUserPwdError, {
        type: 2,
        message: $NC.getDisplayMsg("JS.MAIN.051", "사용자 비밀번호 초기화 중 입니다. 잠시만 기다려 주십시오...")
    });
}

/**
 * 사용자 비밀번호 변경 팝업 호출
 */
function showChangeUserPwdPopup(e) {

    if ($NC.isNull($NC.G_USERINFO)) {
        return;
    }

    var viewLeft, viewTop;
    var viewWidth = 356;
    var viewHeight = 230;
    if ($NC.G_USERINFO.USE_PASSWORD_CHANGE_RULES == $ND.C_YES) {
        viewWidth = 650;
    }
    if ($NC.G_USERINFO.CHANGE_PWD_YN == $ND.C_YES // 
        || $NC.G_USERINFO.ERROR_CHANGE_PWD_YN == $ND.C_YES //
        || $NC.G_USERINFO.CHANGE_PWD_ALERT_YN == $ND.C_YES) {
        viewHeight = 250;
    }

    viewLeft = ($("#ctrClientView").outerWidth(true) - viewWidth) / 2;
    viewTop = ($("#ctrClientView").outerHeight(true) - viewHeight) / 2;

    showSubPopup({
        PROGRAM_ID: "CHANGEUSERPWDPOPUP",
        PROGRAM_NM: $NC.getDisplayMsg("JS.MAIN.012", "사용자 비밀번호 변경"),
        url: "popup/changeuserpwdpopup.html",
        G_PARAMETER: {
            P_ENC_PAYLOAD: $NC.G_VAR.isEncPayload ? getEncPayload : null
        },
        left: viewLeft,
        top: viewTop,
        width: viewWidth,
        height: viewHeight,
        resizeable: false,
        onOk: function() {

            // alert($NC.getDisplayMsg("JS.MAIN.013", "정상적으로 변경되었습니다. 로그인 화면에서 다시 로그인하십시오."));
            $NC.serviceCall("/WC/logout.do", {
                P_USER_ID: $NC.G_USERINFO.USER_ID
            }, function() {
                $NC.G_VAR.isLogout = true;
                onLogout();
            });
        },
        onCancel: function() {
            // 취소시
            // 비밀번호 변경규칙에 의한 비밀번호 변경 대상일 경우
            // 비밀번호 오류에 의한 비밀번호 변경 대상일 경우 로그아웃 함
            if ($NC.G_USERINFO.CHANGE_PWD_YN == $ND.C_YES //
                || $NC.G_USERINFO.ERROR_CHANGE_PWD_YN == $ND.C_YES) {

                // 비밀번호 변경 대상인데 취소하면 로그아웃 처리
                $NC.serviceCall("/WC/logout.do", {
                    P_USER_ID: $NC.G_USERINFO.USER_ID
                }, function() {
                    $NC.G_VAR.isLogout = true;
                    onLogout();
                });
            }
        }
    });
}

/**
 * 사용자 그리드 설정 팝업 호출
 */
function showUserGridLayoutPopup(options) {

    if ($NC.isNull($NC.G_USERINFO)) {
        return;
    }

    showSubPopup({
        PROGRAM_ID: "USERGRIDLAYOUTPOPUP",
        PROGRAM_NM: $NC.getDisplayMsg("JS.MAIN.052", "사용자 표시항목 설정"),
        url: "popup/usergridlayoutpopup.html",
        width: 580,
        height: 600,
        G_PARAMETER: options,
        onOk: function(resultInfo) {
            // 활성 윈도우 검색, 공통팝업은 그리드 설정 불가
            var activeWindow = $NC.G_VAR.activeSubWindow;
            if ($NC.isNull(activeWindow)) {
                activeWindow = $NC.G_VAR.activeWindow;
                if ($NC.isNull(activeWindow)) {
                    return;
                }
            }

            // 화면 재로딩
            setTimeout(function() {
                activeWindow.refresh();
            }, $ND.C_TIMEOUT_ACT);
        }
    });
}

/**
 * 로그인 폼 토글
 */
function toggleLoginForm(e) {

    if ($NC.isVisible("#ctrLoginForm")) {
        $NC.setValue("#edtReset_User_Id");
        $NC.setValue("#edtReset_User_Nm");
        $NC.setValue("#edtReset_User_Email");
        $NC.setVisible("#ctrLoginForm", false);
        $NC.showView("#ctrResetForm", null, function() {
            $NC.setFocus("#edtReset_User_Id");
        }, "fast", "slide", "left");
    } else {
        $NC.setValue("#edtUser_Id");
        $NC.setValue("#edtUser_Pwd");
        $NC.setVisible("#ctrResetForm", false);
        $NC.showView("#ctrLoginForm", null, function() {
            $NC.setFocus("#edtUser_Id");
        }, "fast", "slide", "left");
    }
}

/**
 * 사용자 정보 Load
 */
function getSessionUserInfo() {

    // 데이터 조회
    $("#ctrLoginLayer").data("loginType", 2);
    $NC.serviceCallAndWait("/WC/getSessionUserInfo.do", null, onLogin, function(ajaxData) {
        $("#ctrLoginLayer").data("encSalt", $NC.toObject(ajaxData).RESULT_DATA);
        showLoginPopup(0);
    });
    $("#ctrViewport").hide().css("visibility", "visible").fadeIn(2500);
    $NC.hideLoadingMessage(true);
}

/**
 * 화면 메시지 정보 Load
 * 
 * @param programId
 */
function getProgramMsg(programId) {

    if ($NC.isNotNull($NC.G_LANG[$ND.C_LANG_PROGRAM]) //
        && $NC.G_LANG[$ND.C_LANG_PROGRAM].indexOf(programId) > -1) {
        return;
    }

    $NC.serviceCallAndWait("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.GET_JS_MSG",
        P_QUERY_PARAMS: {
            P_SYS_LANG: $NC.G_USERINFO.SYS_LANG,
            P_PROGRAM_ID: programId
        }
    }, function(ajaxData) {

        // 프로그램 메시지 G_LANG에 세팅
        $NC.setGlobalDisplayInfo(ajaxData, programId);
    });
}

/**
 * 단위화면 실행 로그
 * 
 * @param activityDiv
 * @param programId
 */
function writeProgramActivityLog(activityDiv, programId) {

    if ($NC.G_USERINFO.USE_SECURITY_LOG !== $ND.C_YES) {
        return;
    }

    var activityCd = null;
    var activityComment = null;
    // 프로그램ID가 Null이면 전체 종료
    if ($NC.isNull(programId)) {
        var winCount = $NC.G_VAR.windows.length;
        if (winCount == 0) {
            return;
        }
        if (winCount == 1) {
            activityCd = programId;
        } else {
            var removeProgramIds = [ ];
            for (var rIndex = 0; rIndex < winCount; rIndex++) {
                removeProgramIds.push($NC.G_VAR.windows[rIndex].get("G_PARAMETER").PROGRAM_ID);
            }
            activityCd = "실행프로그램전체종료";
            activityComment = removeProgramIds.join(", ");
        }
    } else {
        activityCd = programId;
    }

    writeActivityLog(activityDiv, activityComment, activityCd);
}

/**
 * 액티비티 로그 기록
 * 
 * @param activityDiv
 *        "01": 로그인<br>
 *        "02": 로그아웃<br>
 *        "03": 프로그램실행<br>
 *        "04": 프로그램종료<br>
 * @param activityComment
 * @param activityCd
 */
function writeActivityLog(activityDiv, activityComment, activityCd) {

    if ($NC.G_USERINFO.USE_SECURITY_LOG !== $ND.C_YES) {
        return;
    }

    $NC.serviceCallAndWait("/WC/writeActivityLog.do", {
        P_ACTIVITY_CD: activityCd || null,
        P_ACTIVITY_COMMENT: activityComment || null,
        P_ACTIVITY_DIV: $NC.nullToDefault(activityDiv, "01"),
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function() {
        // 성공
    }, function() {
        // 실패 메시지 표시 하지 않음
    });
}

/**
 * 공통 버튼 활성화 처리
 */
function setInitTopButtons() {

    var activeWindow = $NC.G_VAR.activeWindow;
    if ($NC.isNull(activeWindow)) {
        return;
    }

    var contentWindow = $NC.getChildWindow(activeWindow);
    if (contentWindow.$NC && $.isFunction(contentWindow.$NC.setInitTopButtons)) {
        contentWindow.$NC.setInitTopButtons(contentWindow.$NC.G_VAR.buttons);
    } else {
        topButtonsInitialize();
    }
}

/**
 * 사용자 프로그램 메뉴 Load
 */
function btnReloadMenuOnClick(e) {

    // 조회시 전역 변수 값 초기화
    $NC.clearGridData(G_GRDPROGRAMMENU);
    $NC.clearGridData(G_GRDFAVORITEMENU);

    // 데이터 조회
    $NC.serviceCall("/WC/getUserProgramMenu.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_PROGRAM_ID: $ND.C_ALL
    }, onGetUserProgramMenu);

    $NC.serviceCall("/WC/getUserFavoriteMenu.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onGetUserFavoriteMenu);
}

/**
 * 공통 버튼 비활성화 처리
 */
function topButtonsInitialize(disabled) {

    if ($NC.isNull(disabled)) {
        disabled = true;
    }
    $NC.setEnable("#btnTopInquiry", !disabled);
    $NC.setEnable("#btnTopNew", false);
    $NC.setEnable("#btnTopSave", false);
    $NC.setEnable("#btnTopCancel", false);
    $NC.setEnable("#btnTopDelete", false);
    $NC.hideView("#btnTopReport");
}

/**
 * 프로그램 목록 ScrollTab 초기화
 */
function sctProgramInitialize() {

    var $sctProgram = $("#sctProgram");
    $NC.G_VAR.sctProgram = $sctProgram.scrollTabs({
        scrollDistance: 350,
        scrollDuration: 350,
        arrowWidth: 26,
        dragable: false,
        autoSizeChecking: false,
        onClick: sctProgramOnClick
    });
    $sctProgram //
    .css("z-index", 602) //
    .mouseup(sctProgramOnMouseUp) //
    .contextmenu(function(e) {
        return $NC.isNotNull($("#sctProgram").data("contextProgramId"));
    });
}

/**
 * 프로그램 목록 ScrollTab Tab Click Event
 * 
 * @param e
 */
function sctProgramOnClick(e) {

    var tabButtonId = $(e.target).prop("id");
    if ($NC.isNull(tabButtonId)) {
        return;
    }

    showProgramPopup(tabButtonId.replace("tab", "").toUpperCase());
}

/**
 * 프로그램 목록 ScrollTab Tab Mouse Up Event
 * 
 * @param e
 */
function sctProgramOnMouseUp(e) {

    if (e.button != 2) {
        return;
    }

    var $target = $(e.target);
    var $sctProgram = $("#sctProgram").removeData("contextProgramId");
    if ($target.hasClass("scroll_tab_cmd_button")) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var PROGRAM_ID = $target.prop("id").replace("tab", "").toUpperCase();
        if ($NC.isNull(PROGRAM_ID)) {
            return;
        }

        $sctProgram.data("contextProgramId", PROGRAM_ID);
        $sctProgram.contextMenu("hide").contextMenu({
            x: e.clientX - 5,
            y: e.clientY - 5
        });
    }
}

/**
 * 프로그램 목록 overlay 초기화
 */
function reportOverlayInitialize() {

    $("#ctrReportLayer").css({
        "top": 40,
        "background-color": "#fff",
        "z-index": 9999
    });

    $("#btnTopReport").click(function(e) {
        clearTimeout($NC.G_VAR.onPrintListTimeout);
        if (!$NC.isVisible("#ctrReportLayer")) {
            var viewHeight = Math.max(G_GRDREPORT.data.getLength() * G_GRDREPORT.view.getOptions().rowHeight, 60);
            $("#ctrReportLayer").css({
                left: $("#btnTopReport").offset().left,
                width: 180,
                height: viewHeight
            }).data("autoResized", true);
            $NC.resizeGrid("#grdReport");
            $NC.setInitGridActiveCell(G_GRDREPORT, true);
            $NC.showView("#ctrReportLayer", null, function() {
                G_GRDREPORT.view.focus();
            }, "fast", "blind", "up");
        } else {
            $NC.hideView("#ctrReportLayer", null, "fast", "blind", "up");
        }
    });
}

/**
 * 메뉴 보임/숨김
 */
function showMenu(show, params) {

    $NC.setInitGridActiveCell(G_GRDPROGRAMMENU);
    if (show) {
        $NC.G_OFFSET.currentMenuWidth = $NC.G_OFFSET.defaultMenuWidth;
        $("#ctrMenuView").show();
    } else {
        $NC.G_OFFSET.currentMenuWidth = 0;
        $("#ctrMenuView").hide();
    }
    var $parent = $(window);
    _OnResize($parent, $parent.width(), $parent.height(), true);

    if (!show) {
        return;
    }

    var PROGRAM_ID = null;
    if ($NC.isNotNull(params)) {
        PROGRAM_ID = params.PROGRAM_ID;
    } else if ($NC.isNotNull($NC.G_VAR.activeWindow)) {
        PROGRAM_ID = $NC.G_VAR.activeWindow.get("G_PARAMETER").PROGRAM_ID;
    }

    if ($NC.isNull(PROGRAM_ID)) {
        return;
    }

    var activeCell = G_GRDPROGRAMMENU.view.getActiveCell();
    if ($NC.isNotNull(activeCell)) {
        if (PROGRAM_ID != G_GRDPROGRAMMENU.data.getItem(activeCell.row).PROGRAM_ID) {
            setActiveProgramMenu(PROGRAM_ID);
        }
    } else {
        setActiveProgramMenu(PROGRAM_ID);
    }
}

/**
 * 프로그램 메뉴 표시
 * 
 * @param e
 */
function showProgramMenu(e) {

    $NC.setVisible("#dspFavoriteMenuTitle", false);
    $NC.setVisible("#grdFavoriteMenu", false);
    $("#ctrMenuTitle").width(28);
    $NC.setVisible("#ctrSearchMenu");

    $NC.setVisible("#dspProgramMenuTitle");
    $NC.setVisible("#edtSearchMenu");
    $NC.showView("#grdProgramMenu", null, function() {
        $NC.resizeGrid("#grdProgramMenu", null, null, $NC.getViewHeight("#ctrMenuTitleBar"));
    }, "fast", "slide", "left");
}

/**
 * 즐겨찾기 메뉴 표시
 * 
 * @param e
 */
function showFavoriteMenu(e) {

    $NC.setVisible("#dspProgramMenuTitle", false);
    $NC.setVisible("#grdProgramMenu", false);
    $NC.setVisible("#ctrSearchMenu", false);
    $("#ctrMenuTitle").width(137);

    $NC.setVisible("#dspFavoriteMenuTitle");
    $NC.showView("#grdFavoriteMenu", null, function() {
        $NC.resizeGrid("#grdFavoriteMenu", null, null, $NC.getViewHeight("#ctrMenuTitleBar"));
    }, "fast", "slide", "left");
}

/**
 * 메뉴 토글
 */
function toggleMenu() {

    showMenu($NC.G_OFFSET.currentMenuWidth == 0);
    scrollViewToTop();
}

/**
 * 단위 화면 실행<br>
 * 활성 윈도우는 activeWindow로 세팅 됨
 * 
 * @param {Object|String}
 *        programInfo[필수] 실행할 프로그램ID 또는 프로그램 정보<br>
 *        프로그램ID일 경우 메뉴리스트에서 검색해서 프로그램 정보를 참조 함<br>
 * @param {Object}
 *        params[선택] 해당 단위화면에서 사용하기 위한 추가 참조 데이터<br>
 *        화면 전역변수 $NC.G_VAR.G_PARAMETER로 추가 됨
 */
function showProgramPopup(programInfo, params) {

    if ($.type(programInfo) == "string") {
        var programIndex = $NC.getGridSearchRow(G_GRDPROGRAMMENU, {
            searchKey: "PROGRAM_ID",
            searchVal: programInfo,
            isAllData: true
        });

        if (programIndex == -1) {
            alert($NC.getDisplayMsg("JS.MAIN.014", "해당 프로그램[" + programInfo + "]을 사용할 권한이 없습니다.", programInfo));
            return;
        }
        programInfo = G_GRDPROGRAMMENU.data.getItems()[programIndex];
    }

    // 메뉴면 아무것도 안함
    if (programInfo.PROGRAM_DIV == "M") {
        return;
    }

    // 기존에 Open한 화면인지 체크
    var containerId = "ctr" + programInfo.PROGRAM_ID;
    var winIndex = getWindowIndex(containerId);
    if (winIndex > -1) {
        var $jWin = $NC.G_VAR.windows[winIndex];
        $NC.G_VAR.windows.splice(winIndex, 1);
        $NC.G_VAR.windows.push($jWin);
        $jWin.focus();
        return;
    }

    // 서버 상태 체크(세션 만료 포함)
    if (!isRunningServer()) {
        return;
    }

    // 프로그램 메시지 읽기
    getProgramMsg(programInfo.PROGRAM_ID);
    // 프로그램 실행 로그 기록
    writeProgramActivityLog("11", programInfo.PROGRAM_ID);

    // 화면 Layout 구성
    var programTitle = programInfo.PROGRAM_NM + " (" + programInfo.PROGRAM_ID + ")";
    // 클라이언트에 추가
    // var $parent = $("#ctrWindows");

    var P_PARAMETER = $.extend({}, params || {}, {
        ROW_ID: programInfo.id,
        PROGRAM_NM: programInfo.PROGRAM_NM,
        PROGRAM_ID: programInfo.PROGRAM_ID,
        WIDE_YN: programInfo.WIDE_YN,
        WEB_URL: programInfo.WEB_URL,
        PROGRAM_DIV: programInfo.PROGRAM_DIV,
        APPLICATION_DIV: programInfo.APPLICATION_DIV || "1",
        EXE_LEVEL1: programInfo.EXE_LEVEL1 || $ND.C_NO,
        EXE_LEVEL2: programInfo.EXE_LEVEL2 || $ND.C_NO,
        EXE_LEVEL3: programInfo.EXE_LEVEL3 || $ND.C_NO,
        EXE_LEVEL4: programInfo.EXE_LEVEL4 || $ND.C_NO,
        EXE_LEVEL5: programInfo.EXE_LEVEL5 || $ND.C_NO
    });

    $NC.hideLoadingMessage(true);
    $NC.showLoadingMessage();
    var childRect = $NC.getChildWindowRect();

    var $newJWindow = $.jWindow({
        parentElement: "#ctrWindows",
        id: containerId,
        title: programTitle,
        G_PARAMETER: P_PARAMETER,
        animationDuration: 200,
        posx: childRect.left,
        posy: childRect.top,
        minWidth: childRect.minWidth,
        minHeight: childRect.minHeight,
        width: childRect.width,
        height: childRect.height,
        windowType: 1,
        contentAttr: (P_PARAMETER.PROGRAM_DIV || "").toLowerCase(),
        type: "iframe",
        fixed: false,
        url: $.browser.urlPrefix + $NC.G_VAR.baseUrl + programInfo.WEB_URL,
        refreshButton: true,
        minimiseButton: false,
        maximiseButton: false,
        containment: true,
        draggable: false,
        resizeable: false,
        onRefreshing: function($jWindow) {
            // 서버 상태 체크(세션 만료 포함)
            return isRunningServer();
        },
        onClosing: function($jWindow) {
            if ($jWindow) {
                var contentWindow = $NC.getChildWindow($jWindow);
                if ($.isFunction(contentWindow._OnClose)) {
                    return contentWindow._OnClose();
                }
            }
            return true;
        },
        onClose: function($jWindow) {
            if ($jWindow) {
                // 프로그램 실행 로그 기록
                var G_PARAMETER = $jWindow.get("G_PARAMETER");
                writeProgramActivityLog("12", G_PARAMETER.PROGRAM_ID);

                // 화면 목록에서 제거
                removeChildWindow($jWindow);
            }
        },
        onFocus: function($jWindow) {
            // 메뉴에서 해당 화면 선택
            if ($NC.G_VAR.activeWindow != null) {
                $NC.G_VAR.activeWindow.getContainerNode().hide();
            }
            $NC.G_VAR.activeWindow = $jWindow;
            $NC.G_VAR.lastWindow = $jWindow;
            var G_PARAMETER = $jWindow.get("G_PARAMETER");

            if (!$("#ctrPinMenu").is(".styActive")) {
                if (G_PARAMETER.WIDE_YN == $ND.C_YES) {
                    showMenu(false);
                } else {
                    showMenu(true, G_PARAMETER);
                }
            } else {
                var activeCell = G_GRDPROGRAMMENU.view.getActiveCell();
                if ($NC.isNotNull(activeCell)) {
                    if (G_PARAMETER.PROGRAM_ID != G_GRDPROGRAMMENU.data.getItem(activeCell.row).PROGRAM_ID) {
                        setActiveProgramMenu(G_PARAMETER.PROGRAM_ID);
                    }
                } else {
                    setActiveProgramMenu(G_PARAMETER.PROGRAM_ID);
                }
            }

            setActiveProgramTab(G_PARAMETER.PROGRAM_ID);
            setActiveFavoriteMenu(G_PARAMETER.PROGRAM_ID);
            scrollViewToTop();
            setInitTopButtons();
            resizeActiveChildWindow();
            $NC.G_VAR.activeWindow.getContainerNode().show();

            var contentWindow = $NC.getChildWindow($jWindow);
            if ($.isFunction(contentWindow._OnWindowFocus)) { // @Deprecated 명칭 변경 _OnWindowFocus -> _OnFocus
                contentWindow._OnWindowFocus();
            } else if ($.isFunction(contentWindow._OnFocus)) {
                contentWindow._OnFocus();
            }
        }
    });

    showProgramTab(programInfo);
    // 해당 화면 목록에 추가
    $NC.G_VAR.windows.push($newJWindow);
    $newJWindow.update();
    $newJWindow.show();

    if (!$NC.isVisible("#ctrTopCommonButtons")) {
        $NC.showView("#ctrTopCommonButtons");
    }
}

/**
 * 공통 코드검색 팝업 창 표시<br>
 * 활성 윈도우는 activePopupWindow로 세팅 됨
 */
function showCommonPopup(options) {

    // 서버 상태 체크(세션 만료 포함)
    if (!isRunningServer()) {
        return;
    }

    if ($NC.isNull(options.containerId) || $NC.isNull(options.queryId)) {
        return;
    }

    options.PROGRAM_ID = "COMMONPOPUP";
    options.PROGRAM_NM = $NC.getDisplayMsg("JS.MAIN.015", "공통팝업");
    options.APPLICATION_DIV = "1";
    options.CLOSE_ACTION = $ND.C_CANCEL;

    if ($NC.isNull(options.title)) {
        options.title = $NC.getDisplayMsg("JS.MAIN.016", "코드 검색");
    }
    if ($NC.isNull(options.url)) {
        options.url = $.browser.urlPrefix + $NC.G_VAR.baseUrl + "popup/commonpopup.html";
    }

    var parentElement = "#ctrWindows";
    var $parent = $(parentElement);
    var parentOffset = $parent.offset();

    var viewWidth = $NC.isNull(options.width) ? 300 : options.width;
    var viewHeight = $NC.isNull(options.height) ? 400 : options.height;
    var viewLeft = ($parent.outerWidth(true) - viewWidth) / 2 + parentOffset.left;
    if (viewLeft < parentOffset.left) {
        viewLeft = parentOffset.left;
    }
    var viewTop = ($parent.outerHeight(true) - viewHeight) / 2 + parentOffset.top;
    if (viewTop < parentOffset.top) {
        viewTop = parentOffset.top;
    }

    var $newJWindow = $.jWindow({
        parentElement: parentElement,
        id: options.containerId,
        title: options.title,
        G_PARAMETER: options,
        animationDuration: 200,
        posx: viewLeft,
        posy: viewTop,
        minWidth: 350,
        minHeight: 300,
        width: viewWidth,
        height: viewHeight,
        windowType: 3,
        contentAttr: "c",
        type: "iframe",
        fixed: false,
        url: options.url,
        refreshButton: true,
        minimiseButton: false,
        maximiseButton: false,
        containment: true,
        modal: true,
        onRefreshing: function($jWindow) {
            // 서버 상태 체크(세션 만료 포함)
            return isRunningServer();
        },
        onClosing: function($jWindow) {
            if ($jWindow) {
                var contentWindow = $NC.getChildWindow($jWindow);
                if ($.isFunction(contentWindow._OnClose)) {
                    return contentWindow._OnClose();
                }
            }
            return true;
        },
        onClose: function($jWindow) {
            if ($jWindow) {
                var G_PARAMETER = $jWindow.get("G_PARAMETER");
                if ($.isFunction(G_PARAMETER.onClose)) {
                    G_PARAMETER.onClose();
                }

                var resultInfo = G_PARAMETER.RESULT_INFO;
                if (resultInfo) {
                    if ($.type(resultInfo) == "object") {
                        if (Array.isArray(resultInfo)) {
                            resultInfo = $.extend(true, [ ], resultInfo);
                        } else {
                            resultInfo = $.extend(true, {}, resultInfo);
                        }
                    }
                }

                // 팝업 CloseAction이 OK 일 경우
                if (G_PARAMETER.CLOSE_ACTION == $ND.C_OK) {
                    if ($.isFunction(options.onSelect)) {
                        options.onSelect(resultInfo);
                    }
                }
                // 팝업 CloseAction이 CANCEL 일 경우
                else if ($.isFunction(options.onCancel)) {
                    options.onCancel(resultInfo);
                }
            }

            // 팝업 제거
            setTimeout(function() {
                if ($jWindow) {
                    removePopupWindow($jWindow);
                }
                setFocusActiveWindow();
            }, $ND.C_TIMEOUT_ACT_FAST);
        },
        onFocus: function($jWindow) {
            $NC.G_VAR.activePopupWindow = $jWindow;
            $NC.G_VAR.lastWindow = $jWindow;

            var contentWindow = $NC.getChildWindow($jWindow);
            if ($.isFunction(contentWindow._OnWindowFocus)) { // @Deprecated 명칭 변경 _OnWindowFocus -> _OnFocus
                contentWindow._OnWindowFocus();
            } else if ($.isFunction(contentWindow._OnFocus)) {
                contentWindow._OnFocus();
            }
        }
    });

    $newJWindow.update();
    $newJWindow.show({
        duration: 200,
        complete: function() {
            if ($.browser.mobile) {
                $newJWindow.getDomNodes().modalBackground.css("overflow", "auto");
            }
        }
    });
}

/**
 * 하단 프로그램 탭에 메뉴 표시, 열린 프로그램이 2이상일 경우만 탭이 표시 됨
 * 
 * @param programInfo
 */
function showProgramTab(programInfo) {

    if ($NC.G_VAR.windows.length == 1) {
        $NC.G_CHILDLAYOUT.nonClientHeight = 28 + $NC.G_OFFSET.tabProgramHeight;
        $NC.showView("#sctProgram");
    }

    // 프로그램명 (프로그램ID)
    // [상위메뉴]
    var tabTooltip = programInfo.PROGRAM_NM // 프로그램명
        + " (" + programInfo.PROGRAM_ID + ")" // (프로그램ID)
        + ($NC.isNull(programInfo.PARENT_MENU_NM) ? "" : "&#10;[" + programInfo.PARENT_MENU_NM + "]") // [상위메뉴]
    ;

    $NC.G_VAR.sctProgram.addTab("<span id='tab" + programInfo.PROGRAM_ID + "' class='scroll_tab_cmd_button'" //
        + " title='" + tabTooltip + "'>" + programInfo.PROGRAM_NM + "</span>");
}

/**
 * 프로그램 탭에서 해당 프로그램ID 활성화
 * 
 * @param programId
 */
function setActiveProgramTab(programId) {

    $NC.G_VAR.sctProgram.selectTab("#tab" + programId);
}

/**
 * 프로그램 탭에서 해당 프로그램ID 제거
 * 
 * @param programId
 */
function removeProgramTab(programId) {

    $NC.G_VAR.sctProgram.removeTabs("#tab" + programId);
}

/**
 * 메시지 표시
 * 
 * @param options
 *        <br>
 *        String: 메시지<br>
 *        Object: <br>
 *        title[선택]: 기본값 -> 확인<br>
 *        message[필수]: 메시지<br>
 *        width, height[선택]: 메시지박스 크기<br>
 *        buttons[선택]: 기본값 -> 확인 버튼, {"예": function() { ... }, "아니오": function () { ... }}<br>
 *        hideFocus[선택]: 기본 버튼에 포커스 지정 여부, 기본값 true<br>
 *        onDialogOpen: 메시지박스 오픈시 호출되는 Event<br>
 *        autoCloseDelayTime[선택]: 지정시 지정된 시간 이후 자동으로 닫힘, 기본값 미지정
 */
function showMessage(options) {

    if ($NC.isNull(options)) {
        return;
    }

    if ($.type(options) == "string") {
        options = {
            message: options
        };
    }

    if ($NC.isNull(options.message)) {
        return;
    }

    var $ctrPopupMessageLayer = $("#ctrPopupMessageLayer");
    if ($NC.isDialogOpen($ctrPopupMessageLayer)) {
        $ctrPopupMessageLayer.dialog("close");
    }

    var buttons;
    if ($NC.isNull(options.buttons)) {
        buttons = {
            "확인": function() {
                $(this).dialog("close");
            }
        };
    } else {
        buttons = {};
        for ( var button in options.buttons) {
            buttons[button] = function(e) {
                var target = $(e.target).text();
                var onClick = options.buttons[target];
                $(this).dialog("close");
                if ($.isFunction(onClick)) {
                    onClick();
                }
            };
        }
    }

    var hideFocus = options.hideFocus || false;
    var onDialogOpen = options.onDialogOpen;
    var autoCloseDelayTime = options.autoCloseDelayTime;

    $ctrPopupMessageLayer.dialog({
        autoOpen: false,
        modal: true,
        minWidth: 250,
        minHeight: 100,
        title: options.title ? options.title : $NC.getDisplayMsg("JS.MAIN.018", "확인"),
        width: options.width ? options.width : 350,
        height: options.height ? options.height : 150,
        draggable: true,
        resizable: false,
        closeOnEscape: false,
        create: function(event, ui) {
            var dlgInstance = $(this).dialog("instance");
            dlgInstance.uiDialogTitlebar.css({
                "padding": "5px",
                "cursor": "default",
                "border-width": "0"
            });
            dlgInstance.uiDialogTitlebarClose.css({
                "width": "30px",
                "height": "20px"
            });
            dlgInstance.uiDialog.css({
                "zIndex": 1301,
                "padding": "1px"
            });
        },
        open: function() {
            var $view = $(this).text("");
            var dlgInstance = $view.dialog("instance");
            dlgInstance.overlay.css("zIndex", 1300);

            var $ifmMessage = $("<iframe id='ifmMessage' name='ifmMessage' style='width: " //
                + $view.width() + "px; height: " + ($view.height() - 3) //
                + "px; border: none;' src='about:blank'></iframe>");
            $ifmMessage.appendTo($view);
            var $messageDoc = $($ifmMessage.get(0).contentDocument);
            if (options.message.toLowerCase().indexOf("<html") > -1) {
                $messageDoc.get(0).write(options.message);
            } else {
                $messageDoc.find("body").css({
                    "padding": 0,
                    "margin": 0,
                    "font-famally": "GulimChe, 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
                    "font-size": "12px",
                    "font-weight": "bold",
                    "color": "#222222"
                }).html(options.message.replace(/\n|\r/gi, "<br>"));
            }
            $ifmMessage.hide().show();
            // $view.html(options.message.replace(/\n|\r/gi, "<br>"));
            dlgInstance.uiButtonSet.find(".ui-button").width(80);
            if ($NC.isNotNull(buttons)) {
                dlgInstance.uiDialogTitlebarClose.hide();
            }
            if (hideFocus) {
                $view.focus();
            } else if (Object.keys(buttons).length == 1) {
                dlgInstance.uiButtonSet.find(".ui-button").focus();
            }
            if ($.isFunction(onDialogOpen)) {
                onDialogOpen();
            }
            if (!$NC.isNull(autoCloseDelayTime)) {
                setTimeout(function() {
                    // 첫번째 버튼 클릭으로 자동 닫기 처리, 사용자가 닫지 않았을 경우
                    var $dialog = $view.dialog("instance");
                    if (!$NC.isNull($dialog)) {
                        $dialog.uiButtonSet.find(".ui-button:first").click();
                    }
                }, autoCloseDelayTime);
            }
        },
        close: function(event, ui) {
            var $view = $(this);
            $view.dialog("option", "title", "");
            $view.dialog("destroy");
            $view.css("display", "none");
        },
        buttons: buttons
    });
    setTimeout(function() {
        $ctrPopupMessageLayer.dialog("open");
    }, $ND.C_TIMEOUT_ACT_FAST);
}

/**
 * 단위화면에서 팝업화면 표시<br>
 * 활성 윈도우는 activeSubWindow로 세팅 됨
 * 
 * @param {Object}
 *        options<br>
 *        [String]PROGRAM_ID[필수]: 프로그램ID<br>
 *        [String]PROGRAM_NM[필수]: 프로그램명<br>
 *        [Object]G_PARAMETER[선택]: 해당 팝업화면에서 사용하기 위한 추가 참조 데이터<br>
 *        화면 전역변수 $NC.G_VAR.G_PARAMETER로 추가 됨<br>
 *        <b>PROGRAM_ID, PROGRAM_NM, CLOSE_ACTION, RESULT_INFO</b>는 내부적으로 사용하므로 해당 명칭 사용 금지, overwrite 처리 됨<br>
 *        [String]url[필수]: html url<br>
 *        [String]containerId[옵션]: 컨테이너ID(containerId)의 명칭 접두어는 ctr로 지정, 미지정시 "ctr" + options.PROGRAM_ID<br>
 *        [String]title[옵션]: 팝업창 제목, 미지정시 PROGRAM_NM + " (" + PROGRAM_ID + ")"<br>
 *        [Number]width[옵션]: 팝업창 너비<br>
 *        [Number]height[옵션]: 팝업창 높이<br>
 *        [Boolean]resizeable[옵션]: 팝업창 사이즈 조절 가능여부, 기본 True<br>
 *        [Boolean]skipServiceCall[옵션]: 서비스호출 처리하지 않음, 기본 False, since 7.0.0<br>
 *        [Function]onOk[옵션]: 확인 버튼 Click Callback Event<br>
 *        [Function]onCancel[옵션]: 취소, 닫기 버튼 Click Callback Event<br>
 */
function showProgramSubPopup(options) {

    if ($NC.isNull(options.skipServiceCall)) {
        options.skipServiceCall = false;
    }
    if (!options.skipServiceCall) {

        // 서버 상태 체크(세션 만료 포함)
        if (!isRunningServer()) {
            return;
        }

        // 프로그램 메시지 읽기
        getProgramMsg(options.PROGRAM_ID);
        // 프로그램 실행 로그 기록
        writeProgramActivityLog("11", options.PROGRAM_ID);
    }

    if ($NC.isNull(options.containerId)) {
        options.containerId = "ctr" + options.PROGRAM_ID;
    }
    if ($NC.isNull(options.title)) {
        options.title = options.PROGRAM_NM + " (" + options.PROGRAM_ID + ")";
    }
    if ($NC.isNull(options.resizeable)) {
        options.resizeable = true;
    }

    if ($NC.isNull(options.G_PARAMETER)) {
        options.G_PARAMETER = {};
    }
    options.G_PARAMETER.CLOSE_ACTION = $ND.C_CANCEL;
    options.G_PARAMETER.PROGRAM_ID = options.PROGRAM_ID;
    options.G_PARAMETER.PROGRAM_NM = options.PROGRAM_NM;
    options.G_PARAMETER.APPLICATION_DIV = "1";

    var parentElement = "#ctrWindows";
    var $parent = $(parentElement);
    var parentOffset = $parent.offset();
    var viewWidth = $NC.isNull(options.width) ? 800 : options.width;
    var viewHeight = $NC.isNull(options.height) ? 500 : options.height;
    var viewLeft, viewTop;
    if ($NC.isNull(options.left)) {
        viewLeft = ($parent.outerWidth(true) - viewWidth) / 2 + parentOffset.left;
        if (viewLeft < parentOffset.left) {
            viewLeft = parentOffset.left;
        }
    } else {
        viewLeft = options.left;
    }
    if ($NC.isNull(options.top)) {
        viewTop = ($parent.outerHeight(true) - viewHeight) / 2 + parentOffset.top;
        if (viewTop < parentOffset.top) {
            viewTop = parentOffset.top;
        }
    } else {
        viewTop = options.top;
    }

    var $newJWindow = $.jWindow({
        parentElement: parentElement,
        id: options.containerId,
        title: options.title,
        G_PARAMETER: options.G_PARAMETER,
        animationDuration: 200,
        posx: viewLeft,
        posy: viewTop,
        minWidth: viewWidth,
        minHeight: viewHeight,
        width: viewWidth,
        height: viewHeight,
        windowType: 2,
        contentAttr: "p",
        type: "iframe",
        fixed: false,
        url: $.browser.urlPrefix + $NC.G_VAR.baseUrl + options.url,
        refreshButton: true,
        minimiseButton: false,
        maximiseButton: false,
        containment: true,
        draggable: true,
        resizeable: options.resizeable,
        modal: true,
        onRefreshing: function($jWindow) {
            // 서버 상태 체크(세션 만료 포함)
            return isRunningServer();
        },
        onClosing: function($jWindow) {
            if ($jWindow) {
                var contentWindow = $NC.getChildWindow($jWindow);
                if ($.isFunction(contentWindow._OnClose)) {
                    return contentWindow._OnClose();
                }
            }
            return true;
        },
        onClose: function($jWindow) {
            if ($jWindow) {
                // X 버튼으로 Close시 onCancel 호출
                var G_PARAMETER = $jWindow.get("G_PARAMETER");
                if (!options.skipServiceCall) {
                    // 프로그램 실행 로그 기록
                    writeProgramActivityLog("12", G_PARAMETER.PROGRAM_ID);
                }

                var resultInfo = G_PARAMETER.RESULT_INFO;
                if (resultInfo) {
                    if ($.type(resultInfo) == "object") {
                        if (Array.isArray(resultInfo)) {
                            resultInfo = $.extend(true, [ ], resultInfo);
                        } else {
                            resultInfo = $.extend(true, {}, resultInfo);
                        }
                    }
                }

                // 팝업 CloseAction이 OK 일 경우
                if (G_PARAMETER.CLOSE_ACTION == $ND.C_OK) {
                    if ($.isFunction(options.onOk)) {
                        options.onOk(resultInfo);
                    }
                }
                // 팝업 CloseAction이 CANCEL 일 경우
                else if ($.isFunction(options.onCancel)) {
                    options.onCancel(resultInfo);
                }
            }

            // 팝업 제거
            setTimeout(function() {
                if ($jWindow) {
                    removePopupWindow($jWindow);
                }
                setFocusActiveWindow();
            }, $ND.C_TIMEOUT_ACT_FAST);
        },
        onFocus: function($jWindow) {
            $NC.G_VAR.activeSubWindow = $jWindow;
            $NC.G_VAR.lastWindow = $jWindow;

            var contentWindow = $NC.getChildWindow($jWindow);
            if ($.isFunction(contentWindow._OnWindowFocus)) { // @Deprecated 명칭 변경 _OnWindowFocus -> _OnFocus
                contentWindow._OnWindowFocus();
            } else if ($.isFunction(contentWindow._OnFocus)) {
                contentWindow._OnFocus();
            }
        }
    });

    $newJWindow.update();
    $newJWindow.show({
        duration: 200,
        complete: function() {
            if ($.browser.mobile) {
                $newJWindow.getDomNodes().modalBackground.css("overflow", "auto");
            }
        }
    });
}

/**
 * 팝업화면 표시<br>
 * 활성 윈도우는 activePopupWindow로 세팅 됨
 * 
 * @param {Object}
 *        options<br>
 *        [String]PROGRAM_ID[필수]: 프로그램ID<br>
 *        [String]PROGRAM_NM[필수]: 프로그램명<br>
 *        [Object]G_PARAMETER[선택]: 해당 팝업화면에서 사용하기 위한 추가 참조 데이터<br>
 *        화면 전역변수 $NC.G_VAR.G_PARAMETER로 추가 됨<br>
 *        <b>PROGRAM_ID, PROGRAM_NM, CLOSE_ACTION, RESULT_INFO</b>는 내부적으로 사용하므로 해당 명칭 사용 금지, overwrite 처리 됨<br>
 *        [String]url[필수]: html url<br>
 *        [String]containerId[옵션]: 컨테이너ID(containerId)의 명칭 접두어는 ctr로 지정, 미지정시 "ctr" + options.PROGRAM_ID<br>
 *        [String]title[옵션]: 팝업창 제목, 미지정시 PROGRAM_NM + " (" + PROGRAM_ID + ")"<br>
 *        [Number]width[옵션]: 팝업창 너비<br>
 *        [Number]height[옵션]: 팝업창 높이<br>
 *        [Boolean]resizeable[옵션]: 팝업창 사이즈 조절 가능여부, 기본 True<br>
 *        [Boolean]skipServiceCall[옵션]: 서비스호출 처리하지 않음, 기본 False, since 7.0.0<br>
 *        [Function]onOk[옵션]: 확인 버튼 Click Callback Event<br>
 *        [Function]onCancel[옵션]: 취소, 닫기 버튼 Click Callback Event<br>
 */
function showSubPopup(options) {

    if ($NC.isNull(options.skipServiceCall)) {
        options.skipServiceCall = false;
    }
    if (!options.skipServiceCall) {

        // 서버 상태 체크(세션 만료 포함)
        if (!isRunningServer()) {
            return;
        }

        // 프로그램 메시지 읽기
        getProgramMsg(options.PROGRAM_ID);
        // 프로그램 실행 로그 기록
        writeProgramActivityLog("11", options.PROGRAM_ID);
    }

    if ($NC.isNull(options.containerId)) {
        options.containerId = "ctr" + options.PROGRAM_ID;
    }
    if ($NC.isNull(options.title)) {
        options.title = options.PROGRAM_NM + " (" + options.PROGRAM_ID + ")";
    }
    if ($NC.isNull(options.resizeable)) {
        options.resizeable = true;
    }

    if ($NC.isNull(options.G_PARAMETER)) {
        options.G_PARAMETER = {};
    }
    options.G_PARAMETER.CLOSE_ACTION = $ND.C_CANCEL;
    options.G_PARAMETER.PROGRAM_ID = options.PROGRAM_ID;
    options.G_PARAMETER.PROGRAM_NM = options.PROGRAM_NM;
    options.G_PARAMETER.APPLICATION_DIV = "1";

    var parentElement = "#ctrWindows";
    var $parent = $(parentElement);
    var parentOffset = $parent.offset();
    var viewWidth = $NC.isNull(options.width) ? 800 : options.width;
    var viewHeight = $NC.isNull(options.height) ? 500 : options.height;
    var viewLeft, viewTop;
    if ($NC.isNull(options.left)) {
        viewLeft = ($parent.outerWidth(true) - viewWidth) / 2 + parentOffset.left;
        if (viewLeft < parentOffset.left) {
            viewLeft = parentOffset.left;
        }
    } else {
        viewLeft = options.left;
    }
    if ($NC.isNull(options.top)) {
        viewTop = ($parent.outerHeight(true) - viewHeight) / 2 + parentOffset.top;
        if (viewTop < parentOffset.top) {
            viewTop = parentOffset.top;
        }
    } else {
        viewTop = options.top;
    }

    var $newJWindow = $.jWindow({
        parentElement: parentElement,
        id: options.containerId,
        title: options.title,
        G_PARAMETER: options.G_PARAMETER,
        animationDuration: 200,
        posx: viewLeft,
        posy: viewTop,
        minWidth: viewWidth,
        minHeight: viewHeight,
        width: viewWidth,
        height: viewHeight,
        windowType: 3,
        contentAttr: "p",
        type: "iframe",
        fixed: false,
        url: $.browser.urlPrefix + $NC.G_VAR.baseUrl + options.url,
        refreshButton: true,
        minimiseButton: false,
        maximiseButton: false,
        containment: true,
        draggable: true,
        resizeable: options.resizeable,
        modal: true,
        onRefreshing: function($jWindow) {
            // 서버 상태 체크(세션 만료 포함)
            return isRunningServer();
        },
        onClosing: function($jWindow) {
            if ($jWindow) {
                var contentWindow = $NC.getChildWindow($jWindow);
                if ($.isFunction(contentWindow._OnClose)) {
                    return contentWindow._OnClose();
                }
            }
            return true;
        },
        onClose: function($jWindow) {
            if ($jWindow) {
                // X 버튼으로 Close시 onCancel 호출
                var G_PARAMETER = $jWindow.get("G_PARAMETER");
                if (!options.skipServiceCall) {
                    // 프로그램 실행 로그 기록
                    writeProgramActivityLog("12", G_PARAMETER.PROGRAM_ID);
                }

                var resultInfo = G_PARAMETER.RESULT_INFO;
                if (resultInfo) {
                    if ($.type(resultInfo) == "object") {
                        if (Array.isArray(resultInfo)) {
                            resultInfo = $.extend(true, [ ], resultInfo);
                        } else {
                            resultInfo = $.extend(true, {}, resultInfo);
                        }
                    }
                }

                // 팝업 CloseAction이 OK 일 경우
                if (G_PARAMETER.CLOSE_ACTION == $ND.C_OK) {
                    if ($.isFunction(options.onOk)) {
                        options.onOk(resultInfo);
                    }
                }
                // 팝업 CloseAction이 CANCEL 일 경우
                else if ($.isFunction(options.onCancel)) {
                    options.onCancel(resultInfo);
                }
            }

            // 팝업 제거
            setTimeout(function() {
                if ($jWindow) {
                    removePopupWindow($jWindow);
                }
                setFocusActiveWindow();
            }, $ND.C_TIMEOUT_ACT_FAST);
        },
        onFocus: function($jWindow) {
            $NC.G_VAR.activePopupWindow = $jWindow;
            $NC.G_VAR.lastWindow = $jWindow;

            var contentWindow = $NC.getChildWindow($jWindow);
            if ($.isFunction(contentWindow._OnWindowFocus)) { // @Deprecated 명칭 변경 _OnWindowFocus -> _OnFocus
                contentWindow._OnWindowFocus();
            } else if ($.isFunction(contentWindow._OnFocus)) {
                contentWindow._OnFocus();
            }
        }
    });

    $newJWindow.update();
    $newJWindow.show({
        duration: 200,
        complete: function() {
            if ($.browser.mobile) {
                $newJWindow.getDomNodes().modalBackground.css("overflow", "auto");
            }
        }
    });
}

/**
 * 출력 미리보기 표시<br>
 * 활성 윈도우는 activePopupWindow로 세팅 됨
 * 
 * @param options
 *        title: 미리보기 팝업창 제목, 기본값 "미리보기"<br>
 *        url: 미리보기 팝업 주소, 기본값 previewpopup<br>
 *        reportDoc: Report 파일<br>
 *        queryId: 쿼리ID<br>
 *        queryParams: 쿼리 파라메터<br>
 *        checkedValue: 선택 값<br>
 *        internalQueryYn: Report 내부 쿼리 사용여부, 기본값 "N"<br>
 *        printCopy: 출력매수, 기본값 1<br>
 *        onAfterPrint: 출력 후 호출할 Callback Function, 출력 여부를 알 수 없으므로 팝업 창을 닫을 시 호출 됨
 */
function showPrintPreview(options) {

    // 서버 상태 체크(세션 만료 포함)
    if (!isRunningServer()) {
        return;
    }

    if ($NC.isNull(options.containerId)) {
        options.containerId = "ctrCommonPopupPrintPreview";
    }
    if ($NC.isNull(options.title)) {
        options.title = $NC.getDisplayMsg("JS.MAIN.019", "출력 미리보기");
    }
    if ($NC.isNull(options.url)) {
        options.url = $.browser.urlPrefix + $NC.G_VAR.baseUrl + "popup/previewpopup.html";
    } else {
        options.url = $.browser.urlPrefix + $NC.G_VAR.baseUrl + options.url;
    }

    options.CLOSE_ACTION = $ND.C_CANCEL;

    var parentElement = "#ctrWindows";
    var $parent = $(parentElement);
    var parentOffset = $parent.offset();
    var viewWidth = $NC.isNull(options.width) ? 900 : options.width;
    var viewHeight = $NC.isNull(options.height) ? 600 : options.height;
    var viewLeft = ($parent.outerWidth(true) - viewWidth) / 2 + parentOffset.left;
    if (viewLeft < parentOffset.left) {
        viewLeft = parentOffset.left;
    }
    var viewTop = ($parent.outerHeight(true) - viewHeight) / 2 + parentOffset.top;
    if (viewTop < parentOffset.top) {
        viewTop = parentOffset.top;
    }

    var $newJWindow = $.jWindow({
        parentElement: parentElement,
        id: options.containerId,
        title: options.title,
        G_PARAMETER: options,
        animationDuration: 200,
        posx: viewLeft,
        posy: viewTop,
        minWidth: viewWidth,
        minHeight: viewHeight,
        width: viewWidth,
        height: viewHeight,
        windowType: 3,
        contentAttr: "r",
        type: "iframe",
        fixed: false,
        url: options.url,
        refreshButton: false,
        minimiseButton: false,
        maximiseButton: false,
        containment: true,
        resizeable: false,
        draggable: true,
        modal: true,
        onRefreshing: function($jWindow) {
            // 서버 상태 체크(세션 만료 포함)
            return isRunningServer();
        },
        onClosing: function($jWindow) {
            if ($jWindow) {
                var contentWindow = $NC.getChildWindow($jWindow);
                if ($.isFunction(contentWindow._OnClose)) {
                    return contentWindow._OnClose();
                }
            }
            return true;
        },
        onClose: function($jWindow) {
            // 팝업 제거
            setTimeout(function() {
                if ($jWindow) {
                    removePopupWindow($jWindow);
                }
                setFocusActiveWindow();
                if (options.onAfterPrint) {
                    options.onAfterPrint();
                }
            }, $ND.C_TIMEOUT_ACT_FAST);
        },
        onFocus: function($jWindow) {
            $NC.G_VAR.activePopupWindow = $jWindow;
            $NC.G_VAR.lastWindow = $jWindow;

            var contentWindow = $NC.getChildWindow($jWindow);
            if ($.isFunction(contentWindow._OnWindowFocus)) { // @Deprecated 명칭 변경 _OnWindowFocus -> _OnFocus
                contentWindow._OnWindowFocus();
            } else if ($.isFunction(contentWindow._OnFocus)) {
                contentWindow._OnFocus();
            }
        }
    });

    $newJWindow.update();
    $newJWindow.show({
        complete: function() {
            if ($.browser.mobile) {
                $newJWindow.getDomNodes().modalBackground.css("overflow", "auto");
            }
        }
    });
}

function showDeveloperPopup(e) {

    if ((e.ctrlKey || e.metaKey) && e.altKey && e.shiftKey) {
        showSubPopup({
            PROGRAM_ID: "DEVELOPERPOPUP",
            PROGRAM_NM: $NC.getDisplayMsg("JS.MAIN.020", "개발자 메뉴"),
            url: "popup/developerpopup.html",
            width: 500,
            height: 345,
            resizeable: false
        });
    }
}

/**
 * 실행된 단위 화면 전체 사이즈 조정
 */
function resizeChildWindows() {

    // 실행 중인 단위 화면 사이즈 조정
    var childRect = $NC.getChildWindowRect();
    childRect = {
        posx: childRect.left,
        posy: childRect.top,
        // minWidth: childRect.minWidth,
        // minHeight: childRect.minHeight,
        width: childRect.width,
        height: childRect.height
    };
    // for (var rIndex = 0, rCount = $NC.G_VAR.windows.length; rIndex < rCount; rIndex++) {
    // $NC.G_VAR.windows[rIndex].set(childRect);
    // }
    // 현재 활성 윈도우 위치 조정
    var childObject, $overlay;
    if ($NC.G_VAR.activeWindow != null) {
        $NC.G_VAR.activeWindow.set(childRect);
        // 내부 팝업 Overlay 위치 조정
        childObject = $NC.getChildObject($NC.G_VAR.activeWindow);
        if (childObject.isValid && childObject.$) {
            $overlay = childObject.$(childObject.document).find(".hasOverlayPopup");
            if ($NC.isVisible($overlay)) {
                $overlay.triggerHandler("overlayResize");
            }
        }
    }

    // 현재 활성 팝업 윈도우 위치 조정
    var posx, posy;
    if ($NC.G_VAR.activeSubWindow != null) {
        posx = $NC.G_VAR.activeSubWindow.get("posx");
        posy = $NC.G_VAR.activeSubWindow.get("posy");
        $NC.G_VAR.activeSubWindow.set({
            posx: posx,
            posy: posy
        });
        // 내부 팝업 Overlay 위치 조정
        childObject = $NC.getChildObject($NC.G_VAR.activeSubWindow);
        if (childObject.isValid && childObject.$) {
            $overlay = childObject.$(childObject.document).find(".hasOverlayPopup");
            if ($NC.isVisible($overlay)) {
                $overlay.triggerHandler("overlayResize");
            }
        }
    }

    // 현재 활성 공통 팝업 윈도우 위치 조정
    if ($NC.G_VAR.activePopupWindow != null) {
        posx = $NC.G_VAR.activePopupWindow.get("posx");
        posy = $NC.G_VAR.activePopupWindow.get("posy");
        $NC.G_VAR.activePopupWindow.set({
            posx: posx,
            posy: posy
        });
    }
}

/**
 * 실행된 단위 화면 사이즈 조정
 */
function resizeActiveChildWindow() {

    // 활성화된 화면만 리사이즈
    if ($NC.G_VAR.activeWindow == null) {
        return;
    }

    // 실행 중인 단위 화면 사이즈 조정
    var childRect = $NC.getChildWindowRect();
    $NC.G_VAR.activeWindow.set({
        posx: childRect.left,
        posy: childRect.top,
        // minWidth: childRect.minWidth,
        // minHeight: childRect.minHeight,
        width: childRect.width,
        height: childRect.height
    });

    $NC.onGlobalResize();
}

/**
 * 실행된 팝업 화면을 목록에서 제거
 */
function removePopupWindow($jWindow) {

    if ($NC.isNotNull($NC.G_VAR.activePopupWindow)) {
        $NC.G_VAR.activePopupWindow = null;
    } else if ($NC.isNotNull($NC.G_VAR.activeSubWindow)) {
        $NC.G_VAR.activeSubWindow = null;
    }
    $NC.G_VAR.lastWindow = null;

    if ($jWindow == null) {
        return;
    }

    var removeWindowId = $jWindow.get("id");
    $jWindow.update(null);
    $jWindow.removeWindow();
    delete $jWindow;
    $("#" + removeWindowId).remove();

    if ($NC.isNotNull($NC.G_VAR.activeSubWindow)) {
        $NC.G_VAR.activeSubWindow.focus();
        return;
    }

    if ($NC.isNotNull($NC.G_VAR.activeWindow)) {
        $NC.G_VAR.activeWindow.focus();
        return;
    }
}

/**
 * 실행된 단위 화면을 목록에서 제거
 */
function removeChildWindow($jWindow) {

    $NC.G_VAR.activeWindow = null;
    $NC.G_VAR.lastWindow = null;
    if ($jWindow == null) {
        return;
    }

    var removeWindowId = $jWindow.get("id");
    var removeProgramId;
    for (var rIndex = 0, rCount = $NC.G_VAR.windows.length; rIndex < rCount; rIndex++) {
        if (removeWindowId == $NC.G_VAR.windows[rIndex].get("id")) {

            removeProgramId = $jWindow.get("G_PARAMETER").PROGRAM_ID;
            $NC.G_VAR.windows.splice(rIndex, 1);

            $jWindow.update(null);
            $jWindow.removeWindow();
            delete $jWindow;
            $("#" + removeWindowId).remove();

            removeProgramTab(removeProgramId);
            break;
        }
    }

    // 마지막 화면 맨 앞으로
    var winCount = $NC.G_VAR.windows.length;
    if (winCount > 0) {
        if (winCount < 2) {
            $NC.G_CHILDLAYOUT.nonClientHeight = 28;
            $NC.hideView("#sctProgram");
        }

        $NC.G_VAR.activeWindow = $NC.G_VAR.windows[winCount - 1];
        $NC.G_VAR.activeWindow.getContainerNode().show();
        $NC.G_VAR.activeWindow.focus();
    } else {
        $NC.hideView("#ctrTopCommonButtons");

        topButtonsInitialize(true);
        scrollViewToTop();
        if ($NC.G_OFFSET.currentMenuWidth == 0) {
            var params = null;
            if ($NC.isNotNull(removeProgramId)) {
                params = {
                    PROGRAM_ID: removeProgramId
                };
            }
            showMenu(true, params);
        }
    }
}

/**
 * 실행된 단위 화면 전체를 목록에서 제거
 */
function removeAllChildWindow() {

    $NC.G_VAR.activeWindow = null;
    $NC.G_VAR.activePopupWindow = null;
    $NC.G_VAR.activeSubWindow = null;
    $NC.G_VAR.lastWindow = null;

    var removeWindowId, removeProgramId, $jWindow;
    for (var rIndex = $NC.G_VAR.windows.length - 1; rIndex > -1; rIndex--) {

        $jWindow = $NC.G_VAR.windows[rIndex];
        removeWindowId = $jWindow.get("id");
        removeProgramId = $jWindow.get("G_PARAMETER").PROGRAM_ID;

        $NC.G_VAR.windows.splice(rIndex, 1);

        $jWindow.update(null);
        $jWindow.removeWindow();
        delete $jWindow;
        $("#" + removeWindowId).remove();
        removeProgramTab(removeProgramId);
    }

    $NC.hideView("#ctrTopCommonButtons");
    $NC.G_CHILDLAYOUT.nonClientHeight = 28;
    $NC.hideView("#sctProgram");

    showMenu(true);
    scrollViewToTop();
}

/**
 * 프로그램ID로 jWindow 리턴
 * 
 * @params program_Id
 */
function getWindowIndex(programId) {

    var result = -1;

    var containerId = programId.indexOf("ctr") == 0 ? programId : "ctr" + programId;
    var $jWindow;
    for (var rIndex = 0, rCount = $NC.G_VAR.windows.length; rIndex < rCount; rIndex++) {
        $jWindow = $NC.G_VAR.windows[rIndex];
        if (containerId == $jWindow.get("id")) {
            result = rIndex;
            break;
        }
    }
    return result;
}

/**
 * 단위 화면에 참조정보 새로고침
 */
function refreshChildReferenceInfo() {

    var contentWindow;
    for (var rIndex = 0, rCount = $NC.G_VAR.windows.length; rIndex < rCount; rIndex++) {
        contentWindow = $NC.getChildWindow($NC.G_VAR.windows[rIndex]) || {};
        if ($NC.isNull(contentWindow.$NC) || !$.isFunction(contentWindow.$NC.refreshReferenceInfo)) {
            continue;
        }
        contentWindow.$NC.refreshReferenceInfo();
    }
}

/**
 * 로그인 팝업 초기화
 */
function loginPopupInitialize() {

    $("#ctrLoginLayer").dialog({
        autoOpen: false,
        modal: true,
        width: 498,
        height: 300,
        resizable: false,
        closeOnEscape: false,
        create: function(event, ui) {
            var dlgInstance = $(this).dialog("instance");
            dlgInstance.uiDialogTitlebar.hide();
            dlgInstance.uiDialog.addClass("ctrLoginDialog");
        },
        open: function() {
            var $view = $(this);
            var dlgLeft = ($(window).width() - $view.outerWidth(true)) / 2;
            var dlgTop = ($(window).height() - $view.outerHeight(true)) / 2;
            $view.parent().css({
                left: dlgLeft,
                top: dlgTop
            });
            $view.dialog("instance").overlay.css("zIndex", 1300).addClass("ctrLoginBgOverlay");

            // 정상 로그인
            if ($view.data("loginType") !== 1) {
                if ($NC.getLocalStorage("_SAVE_USER_ID") == $ND.C_YES) {
                    $NC.setValue("#chkSave_User_Id", true);
                    var userId = $NC.getLocalStorage("_USER_ID");
                    if ($NC.isNotNull(userId)) {
                        $NC.setValue("#edtUser_Id", userId);
                        $NC.setFocus("#edtUser_Pwd");
                        return;
                    }
                    $NC.setFocus("#edtUser_Id");
                }
            }
            // 재로그인시 id는 입력
            else {
                $NC.setValue("#edtUser_Id", $NC.G_USERINFO.USER_ID);
                $NC.setFocus("#edtUser_Pwd");
            }
        }
    });
}

/**
 * 로그인 팝업 실행
 * 
 * @param {Number}
 *        loginType<br>
 *        0: 정상 로그인<br>
 *        1: 재로그인<br>
 *        2: 세션만료 전 Main 화면 재오픈
 */
function showLoginPopup(loginType) {

    $NC.hideView("#ctrTopCommonButtons");
    $NC.hideView("#ctrTopFixedButtons");

    $("#ctrLoginLayer").data("loginType", loginType).dialog("open");
}

/**
 * 출력물 목록 값 세팅
 */
function setPrintList(data) {

    var dsResult = $.extend(true, [ ], data);
    for (var rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
        dsResult[rIndex]["id"] = $NC.getGridNewRowId();
    }

    $NC.setInitGridVar(G_GRDREPORT);
    $NC.setInitGridData(G_GRDREPORT, dsResult, grdReportOnFilter);
}

/**
 * 메인 윈도우에 포커스
 */
function setFocusMain() {

    window.focus();
}

/**
 * 활성화된 화면에 포커스
 */
function setFocusActiveWindow() {

    if ($NC.isNotNull($NC.G_VAR.activePopupWindow)) {
        $NC.G_VAR.lastWindow = $NC.G_VAR.activePopupWindow;
        $NC.G_VAR.lastWindow.focus();
    } else if ($NC.isNotNull($NC.G_VAR.activeSubWindow)) {
        $NC.G_VAR.lastWindow = $NC.G_VAR.activeSubWindow;
        $NC.G_VAR.lastWindow.focus();
    } else if ($NC.G_VAR.activeWindow) {
        $NC.G_VAR.lastWindow = $NC.G_VAR.activeWindow;
        $NC.G_VAR.lastWindow.focus();
    }
}

/**
 * 메인 윈도우가 스크롤 되어 있을 경우 왼쪽상단이 보이도록 위치 이동
 */
function scrollViewToTop() {

    var ctrViewport = $("#ctrViewport").get(0);
    if (ctrViewport) {
        ctrViewport.scrollLeft = 0;
        ctrViewport.scrollTop = 0;
    }
}

/**
 * 프로그램 ID로 프로그램 메뉴에서 선택
 * 
 * @param programId
 */
function setActiveProgramMenu(programId) {

    // Tree 형태의 그리드는 접힌 메뉴는 검색이 되지 않기 때문에 메뉴를 펼침
    var result = $NC.getGridSearchRow(G_GRDPROGRAMMENU, {
        searchKey: "PROGRAM_ID",
        searchVal: programId,
        isAllData: $NC.G_VAR.isAutoMenuExpand
    });
    if (result > -1) {
        var dsTarget = $NC.G_VAR.isAutoMenuExpand ? G_GRDPROGRAMMENU.data.getItems() : G_GRDPROGRAMMENU.data.getDisplayedItems();
        var activeProgramMenu = dsTarget[result], activeProgramParentMenuIds = [ ];
        if (activeProgramMenu) {
            var rowData = activeProgramMenu;
            while ($NC.isNotNull(rowData.parent)) {
                rowData = dsTarget[$NC.G_VAR.isAutoMenuExpand //
                ? G_GRDPROGRAMMENU.data.getIdxById(rowData.parent) //
                : $NC.getGridSearchRow(G_GRDPROGRAMMENU, {
                    searchKey: "id",
                    searchVal: rowData.parent
                })] || {};

                if ($NC.isNull(rowData.id)) {
                    continue;
                }

                // 상위 메뉴 추가
                activeProgramParentMenuIds.push(rowData.PROGRAM_ID);
                if (rowData._collapsed) {
                    rowData._collapsed = false;
                    G_GRDPROGRAMMENU.data.updateItem(rowData.id, rowData);
                }
            }

            // Active 메뉴를 제외한 나머지 메뉴 접기
            collapsedProgramMenu(activeProgramMenu, activeProgramParentMenuIds);
        }
        // Active 메뉴 선택
        $NC.setInitGridActiveCell(G_GRDPROGRAMMENU);
        $NC.setGridSelectRow(G_GRDPROGRAMMENU, {
            selectKey: "PROGRAM_ID",
            selectVal: programId,
            activeCell: true
        });
    }

    return result;
}

/**
 * 프로그램 ID로 즐겨찾기 메뉴에서 선택
 * 
 * @param programId
 */
function setActiveFavoriteMenu(programId) {

    var result = -1;

    // 해당 프로그램 선택 - 선택할 수 있을 경우만
    var rowData;
    for (var rIndex = 0, rCount = G_GRDFAVORITEMENU.data.getLength(); rIndex < rCount; rIndex++) {
        rowData = G_GRDFAVORITEMENU.data.getItem(rIndex);
        if (programId == rowData.PROGRAM_ID) {
            $NC.setGridSelectRow(G_GRDFAVORITEMENU, rIndex);
            result = rIndex;
            break;
        }
    }

    if (result == -1) {
        // 선택할 수 없을 경우 현재 선택된 Cell 초기화
        $NC.setInitGridActiveCell(G_GRDFAVORITEMENU, true);
    }
    return result;
}

/**
 * 엑셀 다운로드
 * 
 * @param params
 *        P_QUERY_ID<br>
 *        P_QUERY_PARAMS<br>
 *        P_SERVICE_PARAMS<br>
 *        P_COLUMN_INFO
 */
function excelFileDownload(params, onSuccessHandler, onErrorHandler) {

    var exportCallback = function() {
        params["P_USER_ID"] = $NC.G_USERINFO.USER_ID;
        fileDownload("/WC/excelExport.do", params, onSuccessHandler, onErrorHandler);
    };

    if ($NC.G_USERINFO.USE_SECURITY_LOG === $ND.C_YES) {
        var columns = (params || {}).P_COLUMN_INFO || [ ];
        var piColumns = $NC.G_VAR.personalInfoColumns || [ ];
        var requiredReason = false;
        for (var rIndex = 0, rCount = columns.length; rIndex < rCount; rIndex++) {
            if (piColumns.indexOf(columns[rIndex].P_COLUMN_NM) > -1) {
                requiredReason = true;
                break;
            }
        }
        if (requiredReason) {
            showPIExcelDownload(exportCallback, params);
            return;
        }
    }

    exportCallback();
}

/**
 * 엑셀 업로드 후 조회
 * 
 * @param params
 *        P_QUERY_ID<br>
 *        P_QUERY_PARAMS<br>
 *        P_SERVICE_PARAMS<br>
 *        P_COLUMN_INFO
 */
function excelFileUpload(params, onSuccessHandler, onErrorHandler) {

    params["P_USER_ID"] = $NC.G_USERINFO.USER_ID;
    fileUpload("/WC/excelImport.do", params, onSuccessHandler, onErrorHandler);
}

/**
 * File 업로드 IFrame 초기화
 * 
 * @param initType
 */
function frmFileInitialize(initType) {

    if (initType == 0 || initType == 1) {
        var $ifmFile = $("#ifmFile");
        $ifmFile.unbind("load");
        $ifmFile.prop("src", "about:blank");
    }

    if (initType == 0 || initType == 2) {
        var $frmFile = $("#frmFile");
        var $fileInput = $("#P_UPLOAD_FILE");
        if ($fileInput.length > 0) {
            $fileInput.removeAttr("accept");
            $fileInput.replaceWith($fileInput = $fileInput.clone(true));
        }
        $frmFile.empty();
        $frmFile.removeAttr("action");
        $frmFile.removeAttr("method");
        $frmFile.removeAttr("target");
        $frmFile.removeAttr("enctype");
    }
}

/**
 * 업로드 File 선택 Dialog
 * 
 * @param {String}
 *        accept 선택 가능 파일 종류 지정
 * @param onFileSelected
 */
function showUploadFilePopup(accept, onFileSelected) {

    frmFileInitialize(0);

    var backwardCompatibility = {};
    if (typeof accept == "string" || $.isFunction(onFileSelected)) {
        backwardCompatibility.accept = accept;
        backwardCompatibility.onFileSelected = onFileSelected;
    } else {
        backwardCompatibility.accept = null;
        backwardCompatibility.onFileSelected = accept;
    }
    var $frmFile = $("#frmFile");
    var $fileInput = $("<input/>", {
        id: "P_UPLOAD_FILE",
        type: "file",
        name: "P_UPLOAD_FILE"
    }).appendTo($frmFile);

    if ($NC.isNotNull(backwardCompatibility.accept)) {
        $fileInput.attr("accept", backwardCompatibility.accept);
    }

    if ($.isFunction(backwardCompatibility.onFileSelected)) {
        $fileInput.change(function(e) {
            var $view = $(e.target);
            var fileFullName = $NC.getValue($view);
            var fileName;
            if (fileFullName.indexOf("/") > -1) {
                fileName = fileFullName.substr(fileFullName.lastIndexOf("/") + 1);
            } else {
                fileName = fileFullName.substr(fileFullName.lastIndexOf("\\") + 1);
            }
            backwardCompatibility.onFileSelected($view, fileFullName, fileName);
        });
    }

    $fileInput.trigger("click");
}

/**
 * File 업로드 처리
 * 
 * @param requestUrl
 * @param requestData
 * @param onSuccessHandler
 * @param onErrorHandler
 */
function fileUpload(requestUrl, requestData, onSuccessHandler, onErrorHandler) {

    $NC.showProgressMessage({
        type: 2,
        message: $NC.getDisplayMsg("JS.MAIN.021", "파일을 업로드 중 입니다. 잠시만 기다려 주십시오...")
    });

    var $frmFile = $("#frmFile").attr({
        method: "post",
        action: requestUrl,
        target: "ifmFile",
        enctype: "multipart/form-data"
    });

    var requestParams = {
        P_UPLOAD_PARAMS: null
    };
    if (requestData) {
        requestParams.P_UPLOAD_PARAMS = $NC.toJson(requestData);
    }

    $("<input/>", {
        id: "P_UPLOAD_PARAMS",
        type: "hidden",
        name: "P_UPLOAD_PARAMS",
        value: requestParams.P_UPLOAD_PARAMS
    }).appendTo($frmFile);

    $frmFile.submit();
    setTimeout(function() {
        frmFileInitialize(2);
    }, $ND.C_TIMEOUT_CLOSE_FAST);

    // IE 11미만
    if ($.browser.msie && $.browser.versionNumber < 11) {
        $("#ifmFile")[0].onreadystatechange = function() {
            var $ifmFile = $("#ifmFile");
            var readyState = $ifmFile[0].readyState;
            if (readyState != "loading" && readyState != "uninitialized") {
                $ifmFile[0].onreadystatechange = null;
                onFileUpload(onSuccessHandler, onErrorHandler);
            }
        };
    }
    // 그외 Browser
    else {
        $("#ifmFile").on("load", function() {
            onFileUpload(onSuccessHandler, onErrorHandler);
        });
    }
}

/**
 * 파일 업로드 완료 콜백
 */
function onFileUpload(onSuccessHandler, onErrorHandler) {

    $NC.hideProgressMessage();

    var $body = $($("#ifmFile")[0].contentDocument.body);
    var ajaxData = $body.css("color", "transparent").text();
    if ($NC.isNull(ajaxData)) {
        return;
    }
    try {
        var resultData = $NC.toObject(ajaxData);
        // Array일 경우
        if (Array.isArray(resultData)) {
            if ($.isFunction(onSuccessHandler)) {
                onSuccessHandler(ajaxData, resultData);
            }
        }
        // 그외
        // 오류일 경우
        else if (("O_MSG" in resultData && resultData.O_MSG != $ND.C_OK) //
            || ("RESULT_CD" in resultData && resultData.RESULT_CD != $ND.C_RESULT_CD_OK)) {

            if ($.isFunction(onErrorHandler)) {
                onErrorHandler(ajaxData);
            } else {
                $NC.onError(ajaxData);
            }
        }
        // 정상일 경우
        else if ($.isFunction(onSuccessHandler)) {
            onSuccessHandler(ajaxData, resultData);
        }
    } catch (e) {
        if ($.isFunction(onErrorHandler)) {
            onErrorHandler(e);
        } else {
            alert(ajaxData);
        }
    } finally {
        $body.html("");
    }
}

/**
 * File 다운로드 처리
 * 
 * @param requestUrl
 * @param requestData
 * @param onSuccessHandler
 * @param onErrorHandler
 */
function fileDownload(requestUrl, requestData, onSuccessHandler, onErrorHandler) {

    $NC.showProgressMessage({
        type: 2,
        message: $NC.getDisplayMsg("JS.MAIN.022", "파일을 다운로드 중 입니다. 잠시만 기다려 주십시오...")
    });

    var requestParams = {
        P_DOWNLOAD_PARAMS: null
    };
    if (requestData) {
        requestParams.P_DOWNLOAD_PARAMS = $NC.toJson(requestData);
    }

    $.fileDownload(requestUrl, {
        parentElement: "#ctrFileView",
        httpMethod: "POST",
        enctype: "multipart/form-data",
        androidPostUnsupportedMessageHtml: null,
        cookieName: "neXosFileDownload",
        data: requestParams,
        successCallback: function(url) {

            $NC.hideProgressMessage();
            if ($.isFunction(onSuccessHandler)) {
                onSuccessHandler();
            }
            $("#ifmFileDownload").remove();
        },
        failCallback: function(responseHtml, url) {

            $NC.hideProgressMessage();
            if ($.isFunction(onErrorHandler)) {
                onErrorHandler(responseHtml);
            } else {
                $NC.onError(responseHtml);
            }
            $("#ifmFileDownload").remove();
        }
    });
}

function grdProgramMenuOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "PROGRAM_NM",
        field: "PROGRAM_NM",
        name: "프로그램명",
        resizable: false,
        minWidth: $NC.G_OFFSET.defaultMenuWidth - $NC.G_LAYOUT.border1,
        formatter: function(row, cell, value, columnDef, dataContext) {
            var result = "<span class='slick-group-toggle";
            if (dataContext.PROGRAM_DIV == "M") {
                if (dataContext._collapsed) {
                    result += " collapsed";
                } else {
                    result += " expanded";
                }
            }
            result += " styIcoProgram" + dataContext.PROGRAM_DIV + "'" //
                + "style='margin-left: " + (2 + 10 * dataContext["indent"]) + "px'></span>" + value;

            return result;
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * grdProgramMenu 초기화
 */
function grdProgramMenuInitialize() {

    var options = {
        showColumnHeader: false,
        rowHeight: 26,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.PROGRAM_DIV != "M") {
                    return "hover";
                } else {
                    return "menu";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdProgramMenu", {
        columns: grdProgramMenuOnGetColumns(),
        queryId: null,
        sortCol: "PROGRAM_ID",
        canCopyData: false,
        gridOptions: options
    });

    // Grid 클릭 이벤트
    G_GRDPROGRAMMENU.view.onClick.subscribe(grdProgramMenuOnClick);
    $("#grdProgramMenu").mouseup(grdProgramMenuOnMouseUp);
    $("#grdProgramMenu").contextmenu(grdProgramMenuOnContextMenu);

    // Grid 가로 스크롤바 숨김
    $NC.hideGridHorzScroller(G_GRDPROGRAMMENU);
}

/**
 * grdProgramMenu 팝업메뉴 Event
 * 
 * @param e
 * @returns
 */
function grdProgramMenuOnContextMenu(e) {

    return $NC.isNotNull($("#grdProgramMenu").data("contextProgramId"));
}

/**
 * grdProgramMenu Mouse Up Event
 * 
 * @param e
 */
function grdProgramMenuOnMouseUp(e) {

    if (e.button != 2) {
        return;
    }

    var $target = $(e.target);
    if (!$target.hasClass("slick-cell")) {
        return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    if ($target.hasClass("menu")) {
        return;
    }

    var $grdProgramMenu = $("#grdProgramMenu").removeData("contextProgramId").removeData("contextFavoriteYn");
    var dataCell = G_GRDPROGRAMMENU.view.getCellFromEvent(e);
    if ($NC.isNull(dataCell) || dataCell.row < 0) {
        return;
    }

    var rowData = G_GRDPROGRAMMENU.data.getItem(dataCell.row);
    $grdProgramMenu.data("contextFavoriteYn", rowData.FAVORITE_YN);
    $grdProgramMenu.data("contextProgramId", rowData.PROGRAM_ID);
    $grdProgramMenu.contextMenu("hide").contextMenu({
        x: e.clientX - 5,
        y: e.clientY - 5
    });
}

/**
 * grdProgramMenu Click Event
 * 
 * @param e
 * @param args
 */
function grdProgramMenuOnClick(e, args) {

    var rowData = G_GRDPROGRAMMENU.data.getItem(args.row);
    if (!rowData) {
        return;
    }
    // 메뉴
    if (rowData.PROGRAM_DIV == "M") {
        if (!rowData._collapsed) {
            rowData._collapsed = true;
        } else {
            rowData._collapsed = false;
        }
        G_GRDPROGRAMMENU.data.updateItem(rowData.id, rowData);
        setActiveProgramMenu(rowData.PROGRAM_ID);

        e.stopImmediatePropagation();
        return;
    }
    showProgramPopup(rowData);
}

/**
 * 활성[선택] 프로그램 외 다른 메뉴 모두 접기
 * 
 * @param activeProgramMenu
 * @param activeProgramParentMenuIds
 * @returns
 */
function collapsedProgramMenu(activeProgramMenu, activeProgramParentMenuIds) {

    // 메뉴를 닫았을 경우 처리하지 않음
    if (activeProgramMenu.PROGRAM_DIV == "M" && activeProgramMenu._collapsed) {
        return;
    }
    // 메뉴 자동 닫기 사용안함
    if ($NC.G_VAR.autoMenuCloseLevel == -1) {
        return;
    }

    var dsTarget = G_GRDPROGRAMMENU.data.getDisplayedItems();
    for (var rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        var rowData = dsTarget[rIndex];
        // 프로그램이 아닌 메뉴 중 열려 있는 메뉴만 대상
        if (rowData.PROGRAM_DIV != "M") {
            continue;
        }
        if (rowData._collapsed) {
            continue;
        }

        if ($NC.G_VAR.autoMenuCloseLevel == 1) {
            if (rowData.MENU_LEVEL1 == activeProgramMenu.MENU_LEVEL1) {
                continue;
            }
        }

        // 활성[선택] 프로그램이 아닐 경우
        if (rowData.PROGRAM_ID == activeProgramMenu.PROGRAM_ID) {
            continue;
        }

        // 상위 메뉴에 해당하지 않을 경우
        if (activeProgramParentMenuIds.indexOf(rowData.PROGRAM_ID) != -1) {
            continue;
        }

        rowData._collapsed = true;
        G_GRDPROGRAMMENU.data.updateItem(rowData.id, rowData);
    }
}

/**
 * grdProgramMenu 데이터 필터링 이벤트
 */
function grdProgramMenuOnFilter(item) {

    if (item.MENU_SHOW_YN == $ND.C_NO) {
        return false;
    }
    if ($NC.isNotNull(item.parent)) {
        var dsTarget = G_GRDPROGRAMMENU.data.getItems();
        var parent = dsTarget[G_GRDPROGRAMMENU.data.getIdxById(item.parent)];
        while ($NC.isNotNull(parent)) {
            if (parent._collapsed) {
                return false;
            }
            parent = dsTarget[G_GRDPROGRAMMENU.data.getIdxById(parent.parent)];
        }
    }
    return true;
}

function grdFavoriteMenuOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "PROGRAM_NM",
        field: "PROGRAM_NM",
        name: "프로그램명",
        resizable: false,
        minWidth: $NC.G_OFFSET.defaultMenuWidth - 2,
        formatter: function(row, cell, value, columnDef, dataContext) {
            var result = "<span class='slick-group-toggle";
            if (dataContext.PROGRAM_DIV == "M") {
                if (dataContext._collapsed) {
                    result += " collapsed";
                } else {
                    result += " expanded";
                }
            }
            result += " styIcoProgram" + dataContext.PROGRAM_DIV + "'></span>" + value;
            if ($NC.isNotNull(dataContext.PARENT_MENU_NM)) {
                result += "<span style='position: absolute; color: #808080; right: 5px; bottom: 0;'>" + dataContext.PARENT_MENU_NM + "</span>";
            }

            return result;
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * grdFavoriteMenu 초기화
 */
function grdFavoriteMenuInitialize() {

    var options = {
        showColumnHeader: false,
        rowHeight: 36,
        specialRow: {
            compareFn: function(specialRow, rowData, column, row, cell, colspan) {
                if (rowData.PROGRAM_DIV != "M") {
                    return "favhover";
                } else {
                    return "favmenu";
                }
            }
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdFavoriteMenu", {
        columns: grdFavoriteMenuOnGetColumns(),
        queryId: null,
        sortCol: "PROGRAM_ID",
        canCopyData: false,
        gridOptions: options
    });

    // Grid 이벤트
    G_GRDFAVORITEMENU.view.onClick.subscribe(grdFavoriteMenuOnClick);
    $("#grdFavoriteMenu").mouseup(grdFavoriteMenuOnMouseUp);
    $("#grdFavoriteMenu").contextmenu(grdFavoriteMenuOnContextMenu);

    // Grid 가로 스크롤바 숨김
    $NC.hideGridHorzScroller(G_GRDFAVORITEMENU);
}

/**
 * grdFavoriteMenu 팝업메뉴 Event
 * 
 * @param e
 * @returns
 */
function grdFavoriteMenuOnContextMenu(e) {

    return $NC.isNotNull($("#grdFavoriteMenu").data("contextProgramId"));
}

/**
 * grdFavoriteMenu Mouse Up Event
 * 
 * @param e
 */
function grdFavoriteMenuOnMouseUp(e) {

    if (e.button != 2) {
        return;
    }
    var $target = $(e.target);
    if (!$target.hasClass("slick-cell")) {
        return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();

    if ($target.hasClass("menu")) {
        return;
    }

    var $grdFavoriteMenu = $("#grdFavoriteMenu").removeData("contextProgramId").removeData("contextFavoriteYn");
    var dataCell = G_GRDFAVORITEMENU.view.getCellFromEvent(e);
    if ($NC.isNull(dataCell) || dataCell.row < 0) {
        return;
    }

    var rowData = G_GRDFAVORITEMENU.data.getItem(dataCell.row);
    $grdFavoriteMenu.data("contextFavoriteYn", rowData.FAVORITE_YN);
    $grdFavoriteMenu.data("contextProgramId", rowData.PROGRAM_ID);
    $grdFavoriteMenu.contextMenu("hide").contextMenu({
        x: e.clientX - 5,
        y: e.clientY - 5
    });
}

/**
 * grdFavoriteMenu Click Event
 * 
 * @param e
 * @param args
 */
function grdFavoriteMenuOnClick(e, args) {

    var rowData = G_GRDFAVORITEMENU.data.getItem(args.row);
    if (!rowData) {
        return;
    }
    showProgramPopup(rowData);
}

function grdReportOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "REPORT_NM",
        field: "REPORT_NM",
        name: "레포트명",
        minWidth: 180,
        cssClass: "print",
        formatter: function(row, cell, value, columnDef, dataContext) {
            return "<span class='slick-group-toggle styIcoProgramR'></span>" + value;
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * grdReport 초기화
 */
function grdReportInitialize() {

    var options = {
        showColumnHeader: false,
        rowHeight: 28,
        specialRow: {
            compareFn: "return 'hover';"
        }
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdReport", {
        columns: grdReportOnGetColumns(),
        queryId: null,
        sortCol: "REPORT_NM",
        gridOptions: options,
        canCopyData: false
    });

    // Grid 클릭 이벤트
    // cell, grid, row
    G_GRDREPORT.view.onClick.subscribe(grdReportOnClick);
    G_GRDREPORT.view.onFocus.subscribe(grdReportOnFocus);
    G_GRDREPORT.view.onBlur.subscribe(grdReportOnBlur);

    // Grid 가로 스크롤바 숨김
    $NC.hideGridHorzScroller(G_GRDREPORT);
}

/**
 * Grid Focus Event
 * 
 * @param e
 * @param args
 */
function grdReportOnFocus(e, args) {

    clearTimeout($NC.G_VAR.onPrintListTimeout);
}

/**
 * Grid Blur Event
 * 
 * @param e
 * @param args
 */
function grdReportOnBlur(e, args) {

    clearTimeout($NC.G_VAR.onPrintListTimeout);
    $NC.G_VAR.onPrintListTimeout = setTimeout(function() {
        $NC.hideView("#ctrReportLayer", null, $ND.C_TIMEOUT_CLOSE_FASTEST);
    }, $ND.C_TIMEOUT_CLOSE_FAST);
}

/**
 * Grid Click Event
 * 
 * @param e
 * @param args
 */
function grdReportOnClick(e, args) {

    G_GRDREPORT.lastRow = args.row;
    $NC.hideView("#ctrReportLayer", null, $ND.C_TIMEOUT_CLOSE_FASTEST);
    _Print();
}

/**
 * grdReport 데이터 필터링 이벤트
 */
function grdReportOnFilter(item) {

    return item.USE_YN == $ND.C_YES;
}

/**
 * 로그인 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onLogin(ajaxData) {

    var $ctrLoginLayer = $("#ctrLoginLayer");
    var loginType = $ctrLoginLayer.data("loginType");
    $NC.G_USERINFO = $NC.toObject(ajaxData);
    // Theme 적용
    var $body = $("body");
    var userTheme = $body.attr("user-theme");
    if ($NC.isNotNull(userTheme)) {
        $body.removeClass(userTheme);
    }
    userTheme = $NC.G_USERINFO.THEME_NM || "smoothness";
    $body.addClass(userTheme).attr("user-theme", userTheme);
    var $lblLoginServer = $("#lblLogin_Server").removeClass();
    if ($NC.isNotNull($NC.G_USERINFO._LOGIN_SERVER)) {
        $lblLoginServer.addClass("lblLoginServer " + $NC.G_USERINFO._LOGIN_SERVER);
    }
    // 비밀번호 사용기한 만료, 비밀번호 관리자 변경
    if ($NC.G_USERINFO.CHANGE_PWD_YN == $ND.C_YES //
        || $NC.G_USERINFO.ERROR_CHANGE_PWD_YN == $ND.C_YES) {
        $ctrLoginLayer.removeData("loginType").dialog("close");
        $NC.setValue("#edtUser_Id");
        $NC.setValue("#edtUser_Pwd");

        showChangeUserPwdPopup();
        return;
    }
    refreshChildReferenceInfo();

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDPROGRAMMENU);

    // 사용자 프로그램 메뉴 조회
    $NC.serviceCallAndWait("/WC/getUserProgramMenu.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_PROGRAM_ID: $ND.C_ALL
    }, onGetUserProgramMenu);

    // 사용자 즐겨찾기 메뉴 조회
    $NC.serviceCallAndWait("/WC/getUserFavoriteMenu.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onGetUserFavoriteMenu);

    // 메시지 조회
    $NC.serviceCallAndWait("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.GET_CSMSG",
        P_QUERY_PARAMS: {
            P_SYS_LANG: $NC.G_USERINFO.SYS_LANG
        }
    }, onGetMsg);

    // 사용자 ID 기록 여부 체크, 기록
    if ($NC.isDialogOpen($("#ctrLoginLayer"))) {
        if ($NC.getValue("#chkSave_User_Id") == $ND.C_YES) {
            $NC.setLocalStorage("_SAVE_USER_ID", $ND.C_YES);
            $NC.setLocalStorage("_USER_ID", $NC.G_USERINFO.USER_ID);
        } else {
            $NC.setLocalStorage("_SAVE_USER_ID", $ND.C_NO);
            $NC.setLocalStorage("_USER_ID", null);
        }
        $ctrLoginLayer.dialog("close");
        $NC.setValue("#edtUser_Id");
        $NC.setValue("#edtUser_Pwd");
    }
    $ctrLoginLayer.removeData("loginType");

    if (loginType != 1) {
        // 재로그인이 아닐 경우
        showMenu(true);

        if ($NC.getLocalStorage("_PIN_MENU") == $ND.C_YES) {
            $("#ctrPinMenu").addClass("styActive");
        }
    } else {
        // 재로그인
        setFocusActiveWindow();
    }

    // 비밀번호 변경 알림
    if (loginType == 0 && $NC.G_USERINFO.CHANGE_PWD_ALERT_YN == $ND.C_YES) {
        $ctrLoginLayer.removeData("loginType").dialog("close");
        $NC.setValue("#edtUser_Id");
        $NC.setValue("#edtUser_Pwd");

        showChangeUserPwdPopup();
        return;
    }

    if ($NC.G_USERINFO.USE_SECURITY_LOG === $ND.C_YES) {
        $NC.G_VAR.personalInfoPrograms = ($NC.G_USERINFO.PI_PROGRAMS || "").split(",");
        $NC.G_VAR.personalInfoColumns = ($NC.G_USERINFO.PI_COLUMNS || "").split(",");
        $NC.setInitCombo("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "WMSP24", // 개인정보 엑셀다운로드 사용
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1"
            }
        }, {
            selector: "#cboPI_Excel_Download_Cause_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F"
        });
    }
    delete $NC.G_USERINFO.PI_PROGRAMS;
    delete $NC.G_USERINFO.PI_COLUMNS;

    $NC.serviceCallAndWait("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSNOTICE",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }
    }, onGetNotice);
}

/**
 * 컬럼/화면 공통 메시지 Load시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetMsg(ajaxData) {

    $NC.setGlobalDisplayInfo(ajaxData);
    $NC.setInitDisplay();
    setReinitDisplayMain();
}

/**
 * 로그인 오류시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onLoginError(ajaxData) {

    $NC.G_USERINFO = null;
    $NC.onError(ajaxData);
    $("#ctrLoginLayer").removeData("loginType");
    $NC.setFocus("#edtUser_Pwd");
}

/**
 * 로그아웃 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onLogout(ajaxData) {

    window.location.replace($NC.G_VAR.baseUrl + "main/");
}

function onResetUserPwd(ajaxData) {

    alert($NC.getDisplayMsg("JS.MAIN.053", "사용자 이메일로 임시 비밀번호가 정상적으로 발송되었습니다."));

    toggleLoginForm();
}

function onResetUserPwdError(ajaxData) {

    $NC.onError(ajaxData);
    $NC.setFocus("#edtReset_User_Id");
}

function getEncPayload(requestData) {

    var encSalt = $("#ctrLoginLayer").data("encSalt") || $NC.lPad("", 32, "0");
    var secret = encSalt.substring(0, 16);
    var iv = encSalt.substring(16);
    var cipher = window.CryptoJS.AES.encrypt($NC.toJson(requestData), window.CryptoJS.enc.Utf8.parse(secret), {
        iv: window.CryptoJS.enc.Utf8.parse(iv),
        padding: window.CryptoJS.pad.Pkcs7,
        mode: window.CryptoJS.mode.CBC
    });

    return {
        P_ENC_SALT: encSalt,
        P_ENC_PAYLOAD: cipher.toString()
    };
}

/**
 * 화면 메시지 재세팅
 */
function setReinitDisplayMain() {

    $NC.setTooltip($("#btnTopUser").val($NC.G_USERINFO.USER_NM), $NC.G_USERINFO.USER_ID //
        + " - " + $NC.G_USERINFO.USER_NM //
        + "\n" + $NC.G_USERINFO.LOGIN_DATETIME //
        + " " + $NC.getDisplayMsg("JS.MAIN.023", "접속\n\n사용자 비밀번호를 변경하려면 버튼을 클릭하십시오."));

    $NC.setTooltip("#btnTopInquiry", $NC.getDisplayMsg("JS.MAIN.024", "조건에 맞는 데이터셋을 조회(ALT＋F5)"));
    $NC.setTooltip("#btnTopNew", $NC.getDisplayMsg("JS.MAIN.025", "데이터셋의 새로운 레코드 생성(ALT＋F6)"));
    $NC.setTooltip("#btnTopSave", $NC.getDisplayMsg("JS.MAIN.026", "데이터셋의 변경된 내역을 저장(ALT＋F7)"));
    $NC.setTooltip("#btnTopCancel", $NC.getDisplayMsg("JS.MAIN.027", "데이터셋의 변경 사항을 취소(ALT＋F8)"));
    $NC.setTooltip("#btnTopDelete", $NC.getDisplayMsg("JS.MAIN.028", "데이터셋의 현재 레코드 삭제(ALT＋F9)"));
    $NC.setTooltip("#btnTopMenu", $NC.getDisplayMsg("JS.MAIN.029", "메뉴 보임/숨김 토글"));

    $NC.setTooltip("#btnTopReport", $NC.getDisplayMsg("JS.MAIN.030", "활성화된 화면에서 출력할 수 있는 출력물 목록"));
    $NC.setTooltip("#btnTopClose", $NC.getDisplayMsg("JS.MAIN.031", "활성화된 화면 종료\n[Ctrl＋클릭]실행된 화면 전체 종료"));
    $NC.setTooltip("#btnTopLogout", $NC.getDisplayMsg("JS.MAIN.032", "로그인한 사용자 로그아웃"));
    $NC.setTooltip("#btnReloadMenu", $NC.getDisplayMsg("JS.MAIN.033", "메뉴 새로고침"));
    $NC.setTooltip("#btnPinMenu", $NC.getDisplayMsg("JS.MAIN.034", "메뉴 항상 보이기"));
    $NC.setTooltip("#btnCloseMenu", $NC.getDisplayMsg("JS.MAIN.035", "메뉴 닫기"));
    $NC.setTooltip("#dspProgramMenuTitle", $NC.getDisplayMsg("JS.MAIN.036", "즐겨찾기 메뉴 표시"));
    $NC.setTooltip("#dspFavoriteMenuTitle", $NC.getDisplayMsg("JS.MAIN.037", "메뉴 표시"));
    if ($.isFunction(window.setReinitDisplayLiveWM)) {
        window.setReinitDisplayLiveWM();
    }

    $NC.showView("#ctrTopFixedButtons", null, function() {
        if ($NC.isNotNull($NC.G_VAR.activeWindow)) {
            if (!$NC.isVisible("#ctrTopCommonButtons")) {
                $NC.showView("#ctrTopCommonButtons");
            }
        }
    }, "fast", "slide", "right");
}

/**
 * 사용자 메뉴 가져오기 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetUserProgramMenu(ajaxData) {

    $NC.setInitGridData(G_GRDPROGRAMMENU, ajaxData, grdProgramMenuOnFilter);
    $NC.setGridSelectRow(G_GRDPROGRAMMENU, 0);
}

/**
 * 사용자 즐겨찾기 메뉴 가져오기 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetUserFavoriteMenu(ajaxData) {

    $NC.setInitGridData(G_GRDFAVORITEMENU, ajaxData);
    $NC.setGridSelectRow(G_GRDFAVORITEMENU, 0);

    if ($NC.getLocalStorage("_FAVORITE") == $ND.C_YES) {
        showFavoriteMenu();
    }
}

/**
 * 공지사항 팝업 표시
 * 
 * @param ajaxData
 */
function onGetNotice(ajaxData) {

    var dsResult = $NC.toArray(ajaxData);
    if (dsResult && dsResult.length == 0) {
        return;
    }

    showProgramSubPopup({
        PROGRAM_ID: "NOTICEPOPUP",
        PROGRAM_NM: $NC.getDisplayMsg("JS.MAIN.038", "공지사항"),
        url: "popup/noticepopup.html",
        width: 800,
        height: 580,
        G_PARAMETER: {
            P_NOTICE_DS: dsResult
        }
    });
}

/**
 * 데이터 복사 Overlay 초기화
 */
function copyGridDataOverlayInitialize() {

    $("#ctrCopyGridDataView").draggable({
        containment: "#ctrWindows",
        scroll: false,
        drag: function(event, ui) {
            clearTimeout($NC.G_VAR.onCopyDataTimeout);
        },
        stop: function(event, ui) {
            $NC.setFocus("#edtCopyValue");
        }
    });

    $("#chkCopyOption") //
    .focus(function(e) {
        clearTimeout($NC.G_VAR.onCopyDataTimeout);
    }).bind("click blur", function(e) {
        $NC.setFocus("#edtCopyValue");
    }).change(function(e) {
        $NC.G_VAR.copyInfo.lastSearchVal = "";
        $NC.G_VAR.copyInfo.lastSearchIndex = -1;
    });

    $("#edtCopyValue") //
    .focus(function(e) {
        clearTimeout($NC.G_VAR.onCopyDataTimeout);
    }).blur(function(e) {
        $NC.G_VAR.onCopyDataTimeout = setTimeout(hideCopyGridData, $ND.C_TIMEOUT_CLOSE_FAST);
    }).keydown(function(e) {
        switch (e.keyCode) {
            // enter 무시
            case 13:
                e.preventDefault();
                break;
            // 정상 처리
            // Ctrl + [C, X]
            case 67:
            case 88:
                if (e.ctrlKey || e.metaKey) {
                    // 선택되어 있지 않을 경우 선택
                    var $edtCopyValue = $("#edtCopyValue");
                    if ($edtCopyValue.prop("selectionStart") == $edtCopyValue.prop("selectionEnd")) {
                        $edtCopyValue.prop("selectionStart", 0).prop("selectionEnd", -1);
                    }
                    hideCopyGridData();
                }
                break;
            // esc
            case 27:
                hideCopyGridData();
                e.preventDefault();
                break;
        }
    }).keyup(function(e) {
        if (e.keyCode != 13) {
            e.preventDefault();
            return;
        }

        if ($NC.G_VAR.copyInfo.columnField == $ND.C_ALL) {
            hideCopyGridData();
            return;
        }

        if ($NC.G_VAR.lastWindow == null || $NC.isNull($NC.G_VAR.copyInfo.targetGrid)) {
            alert($NC.getDisplayMsg("JS.MAIN.039", "검색할 그리드가 지정되지 않았습니다."));
            return;
        }

        var searchVal = $NC.getValue("#edtCopyValue");
        if ($NC.isNull(searchVal)) {
            alert($NC.getDisplayMsg("JS.MAIN.040", "검색할 값을 입력하십시오."));
            return;
        }
        var isFirst = false;
        if (searchVal != $NC.G_VAR.copyInfo.lastSearchVal) {
            $NC.G_VAR.copyInfo.lastSearchIndex = -1;
            $NC.G_VAR.copyInfo.lastSearchVal = searchVal;
            isFirst = true;
        }

        if ($NC.G_VAR.copyInfo.lastSearchIndex > -1) {
            $NC.G_VAR.copyInfo.lastSearchIndex += 1;
        }
        var isWhole = $NC.getValue("#chkCopyOption") == $ND.C_YES;

        var contentWindow = $NC.getChildWindow($NC.G_VAR.lastWindow);
        var grdObject = "G_" + $NC.G_VAR.copyInfo.targetGrid.toUpperCase();

        var searchIndex = $NC.getGridSearchRow(contentWindow[grdObject], {
            compareFn: function(rowData) {
                var compareVal = rowData[$NC.G_VAR.copyInfo.columnField] || "";
                return isWhole ? searchVal == compareVal : compareVal.indexOf(searchVal) > -1;
            },
            startIndex: $NC.G_VAR.copyInfo.lastSearchIndex
        });

        if (searchIndex == -1) {
            if (isFirst) {
                alert($NC.getDisplayMsg("JS.MAIN.041", "해당 값이 존재하지 않습니다."));
                $NC.G_VAR.copyInfo.lastSearchVal = "";
            } else {
                alert($NC.getDisplayMsg("JS.MAIN.042", "해당 값이 더이상 존재하지 않습니다."));
            }
            $NC.G_VAR.copyInfo.lastSearchIndex = -1;
        } else {
            $NC.setGridSelectRow(contentWindow[grdObject], searchIndex);

            $NC.setValue("#lblCopyColumn", $NC.G_VAR.copyInfo.columnName //
                + " (" + (searchIndex + 1) + "/" + $NC.G_VAR.copyInfo.rowCount + ")");
            $NC.G_VAR.copyInfo.lastSearchIndex = searchIndex;
        }
    });
}

/**
 * 데이터 복사 Overlay 보이기
 * 
 * @param selector
 * @param column
 * @param rowData
 * @param e
 * @param rowNum
 * @param rowCount
 */
function showCopyGridData(selector, column, rowData, e, rowNum, rowCount) {

    var $view = $NC.getView("#edtCopyValue");
    var grdObject = $NC.getChildWindow($NC.G_VAR.lastWindow)["G_" + selector.toUpperCase()];
    var copyValue = "";
    // 전체 항목일 경우
    if (e.shiftKey || e.altKey) {
        $NC.setValue("#lblCopyColumn", $NC.getDisplayMsg("JS.MAIN.043", "전체항목 (" + (rowNum + 1) + "/" + rowCount + ")", rowNum + 1, rowCount));

        if (rowData.__group) {
            rowData = $NC.getGridItemFromGroup(rowData, grdObject);
        }

        var colFields = [ ], colNames = [ ], colVals = [ ];
        var columns = grdObject.view.getColumns();
        var colIndex = 0, colCount = columns.length;
        for (; colIndex < colCount; colIndex++) {
            colFields.push(columns[colIndex].field);
            colNames.push(columns[colIndex].name);
        }
        for ( var field in rowData) {
            if (colFields.indexOf(field) > -1) {
                continue;
            }
            if ($NC.isNull(field) || field == "id" || field == "CRUD") {
                continue;
            }
            colFields.push(field);
            colNames.push($NC.getDisplayName(field, field));
        }
        colCount = colFields.length;

        for (colIndex = 0; colIndex < colCount; colIndex++) {
            colVals.push($NC.nullToDefault(rowData[colFields[colIndex]], ""));
        }
        if (e.shiftKey) {
            copyValue = colNames.join("\t") + "\n" + colVals.join("\t");
        } else {
            copyValue = colVals.join("\t");
        }

        $("#lblCopyComments").html($NC.getDisplayMsg("JS.MAIN.044", "데이터 복사: 값 선택 후 [Ctrl＋C] 키 입력"));
        $NC.setVisible($("#chkCopyOption").parent(), false);

        $NC.G_VAR.copyInfo.columnField = $ND.C_ALL;
        $NC.G_VAR.copyInfo.columnName = $NC.getDisplayMsg("JS.MAIN.045", "전체");
    }
    // 단일 항목일 경우
    else {
        // 컬럼 타이틀이 체크박스일 경우 Row 정보만 표시
        if ((column.name || "").indexOf("input") != -1) {
            $NC.setValue("#lblCopyColumn", "(" + (rowNum + 1) + "/" + rowCount + ")");
        } else {
            $NC.setValue("#lblCopyColumn", column.name + " (" + (rowNum + 1) + "/" + rowCount + ")");
        }

        if (rowData.__group) {
            rowData = $NC.getGridItemFromGroup(rowData, grdObject);
        }

        copyValue = rowData[column.field];
        $("#lblCopyComments").html($NC.getDisplayMsg("JS.MAIN.046", "데이터 검색: 검색할 값 입력 후 [Enter] 키 입력<br>데이터 복사: 값 선택 후 [Ctrl＋C] 키 입력"));
        $NC.setVisible($("#chkCopyOption").parent());

        $NC.G_VAR.copyInfo.columnField = column.field;
        $NC.G_VAR.copyInfo.columnName = column.name;
    }

    $NC.G_VAR.copyInfo.targetGrid = selector;
    $NC.G_VAR.copyInfo.rowCount = rowCount;

    $NC.G_VAR.lastWindow.focus(false);
    $NC.setValue($view, copyValue);
    $("#ctrCopyGridDataView").css("visibility", "hidden");
    $("#ctrCopyGridDataLayer").fadeIn("fast", function() {
        $("#ctrCopyGridDataView").css({
            "top": Math.ceil(($(window).height() - 60) / 2),
            "left": Math.ceil(($(window).width() - $("#ctrCopyGridDataView").outerWidth()) / 2),
            "visibility": "visible"
        });
        $NC.setFocus($view);
        $view.select();
    });
}

/**
 * 데이터 복사 Overlay 숨기기
 */
function hideCopyGridData() {

    clearTimeout($NC.G_VAR.onCopyDataTimeout);

    $NC.G_VAR.copyInfo.targetGrid = "";
    $NC.G_VAR.copyInfo.columnField = "";
    $NC.G_VAR.copyInfo.columnName = "";
    $NC.G_VAR.copyInfo.rowCount = 0;
    $NC.G_VAR.copyInfo.lastSearchVal = "";
    $NC.G_VAR.copyInfo.lastSearchIndex = -1;

    var $view = $("#ctrCopyGridDataLayer");
    if ($NC.isVisible($view)) {
        $view.fadeOut("fast", function() {
            setFocusActiveWindow();
        });
    }
}

/**
 * 엑셀 다운로드 Overla 초기화
 */
function piExcelDownloadOverlayInitialize() {

    $("#ctrPIExcelDownload").draggable({
        containment: "#ctrWindows",
        scroll: false,
        // drag: function(event, ui) { },
        stop: function(event, ui) {
            $NC.setFocus("#cboPI_Excel_Download_Cause_Div");
        }
    });

    $("#cboPI_Excel_Download_Cause_Div").change(function(e) {
        $("#edtPI_Excel_Download_Cause_Comment").focus().select();
    });
    $("#btnPIExcelDownloadCancel").click(hidePIExcelDownload);
}

/**
 * 엑셀 다운로드 Overlay 표시
 */
function showPIExcelDownload(exportCallback, params) {

    $NC.G_VAR.lastWindow.focus(false);
    // 사유구분은 마지막 선택 상태, 사유내역만 초기화
    $NC.setValue("#edtPI_Excel_Download_Cause_Comment");

    $("#ctrPIExcelDownload").css("visibility", "hidden");
    $("#ctrPIExcelDownloadLayer").fadeIn("fast", function() {
        $("#ctrPIExcelDownload").css({
            "top": Math.ceil(($(window).height() - 60) / 2),
            "left": Math.ceil(($(window).width() - $("#ctrPIExcelDownload").outerWidth()) / 2),
            "visibility": "visible"
        });
        $NC.setFocus("#edtPI_Excel_Download_Cause_Comment");
    });

    $("#btnPIExcelDownload").off("click").on("click", function() {
        // 개인정보 엑셀 다운로드 로그 저장
        // Window Type
        // 0: Main
        // 1: 프로그램 단위화면
        // 2: 프로그램 단위화면 서브 팝업
        // 3: 공통 코드검색, 출력 미리보기 팝업
        var ACTIVITY_COMMENT;
        var ACTIVITY_PROGRAM_ID;
        if ($NC.isNotNull($NC.G_VAR.lastWindow)) {
            var windowType = $NC.G_VAR.lastWindow.get("windowType");
            var G_PARAMETER = $NC.G_VAR.lastWindow.get("G_PARAMETER");
            ACTIVITY_PROGRAM_ID = G_PARAMETER.PROGRAM_ID || "";
            if (windowType == 3) {
                ACTIVITY_COMMENT = {
                    P_CAUSE_DIV: $NC.getValue("#cboPI_Excel_Download_Cause_Div"),
                    P_CAUSE_COMMENT: $NC.getValue("#edtPI_Excel_Download_Cause_Comment"),
                    P_QUERY_ID: G_PARAMETER.queryId,
                    P_QUERY_PARAMS: G_PARAMETER.queryParams
                };
            } else {
                ACTIVITY_COMMENT = {
                    P_CAUSE_DIV: $NC.getValue("#cboPI_Excel_Download_Cause_Div"),
                    P_CAUSE_COMMENT: $NC.getValue("#edtPI_Excel_Download_Cause_Comment"),
                    P_QUERY_ID: params.P_QUERY_ID,
                    P_QUERY_PARAMS: params.P_QUERY_PARAMS
                };
            }
        }
        var saveSuccess = false;
        $NC.serviceCallAndWait("/WC/writeActivityLog.do", {
            P_ACTIVITY_CD: ACTIVITY_PROGRAM_ID,
            P_ACTIVITY_COMMENT: objToParamString(ACTIVITY_COMMENT),
            P_ACTIVITY_DIV: "23", // 23 - 개인정보엑셀다운로드
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, function() {
            // 성공
            saveSuccess = true;
        }, function() {
            // 실패 메시지 표시 하지 않음
        });

        hidePIExcelDownload();
        if (saveSuccess) {
            if ($.isFunction(exportCallback)) {
                setTimeout(function() {
                    exportCallback();
                }, 100);
            }
        }
    });
}

/**
 * 엑셀 다운로드 Overlay 숨기기
 */
function hidePIExcelDownload() {

    var $view = $("#ctrPIExcelDownloadLayer");
    if ($NC.isVisible($view)) {
        $view.fadeOut("fast", function() {
            setFocusActiveWindow();
        });
    }
}

function objToParamString(obj, indent, preString) {
    indent = indent || "";
    var result = preString || "";
    if ($.isPlainObject(obj)) {
        var keys = Object.keys(obj), key;
        for (var rIndex = 0, rCount = keys.length; rIndex < rCount; rIndex++) {
            key = keys[rIndex];
            if ($.isPlainObject(obj[key])) {
                result += indent + key + ":\n";
                result += objToParamString(obj[key], indent + "    ", preString);
            } else {
                result += indent + key + ": " + obj[key] + "\n";
            }
        }
    }
    return result;
}

function isRunningServer() {

    var serverStatus = $NC.getServerStatus();
    if (serverStatus.error) {
        $NC.onError(serverStatus.error);
        return false;
    }
    return true;
}