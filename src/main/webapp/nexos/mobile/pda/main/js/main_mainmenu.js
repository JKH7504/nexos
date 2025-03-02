/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : PDA Main Menu - main에서 분리
 *  프로그램명         : PDA Main Menu
 *  프로그램설명       : PDA Main Menu 화면 Javascript
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
function _OnResizeMainMenu(parent, viewWidth, viewHeight, syncResize) {

    $NC.resizeContainer("#ctrMainMenu", $NC.G_CHILDLAYOUT.width, $("#ctrMenuView").height() //
        - $NC.getViewHeight("#ctrMenuActionBar"));
}

function _OnInputChangeMainMenu(e, view, val) {

    // 기본정보 조건 변경
    if ($.type(e) == "string") {
        switch (e) {
            case "CENTER_CD":
                setPolicyValInfo();
                break;
            case "BU_CD":
                setPolicyValInfo();
                break;
            case "WORK_DATE":
                break;
        }
        return;
    }

    // 그외 뷰의 입력 콘트롤, ctrLIC..., ctrLOB...
    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        case "L1_CENTER_CD":
            // 기본 물류센터 변경 후 Change Event 호출
            view = $("#cboCenter_Cd");
            $NC.setValue(view, val);
            view.change();
            break;
        case "L1_BU_CD":
            // 기본 사업부 변경 후 Change Event 호출
            view = $("#cboBu_Cd");
            $NC.setValue(view, val);
            view.change();
            break;
        case "L1_WORK_DATE":
            // 기본 작업일자 변경 후 Change Event 호출
            view = $("#dtpWork_Date");
            $NC.setValue(view, val);
            view.change();
            break;
        default:
            break;
    }

    // 기본정보 조건 변경시 활성화된 윈도우로 이벤트 전달
    if ($NC.isNotNull($NC.G_VAR.activeWindow)) {
        var contentWindow = $NC.getChildWindow($NC.G_VAR.activeWindow);
        if ($.isFunction(contentWindow._OnConditionChange)) {
            contentWindow._OnConditionChange(e, view, val);
        }
    }
}

function _OnInputKeyUpMainMenu(e, view) {

    // 그외 뷰의 입력 콘트롤, ctrLIC..., ctrLOB...
    var id = view.prop("id").substr(3).toUpperCase();
    switch (id) {
        default:
            break;
    }
}

function _OnLoginMainMenu() {

    // 사용자 프로그램 메뉴 조회
    $NC.serviceCallAndWait("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.GET_CSUSERPDAPROGRAM",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }
    }, onGetUserProgramMenu);

    // 물류센터 초기화
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSUSERCENTER",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_CENTER_CD: $ND.C_ALL
        }
    }, {
        selector: "#cboCenter_Cd",
        codeField: "CENTER_CD",
        nameField: "CENTER_NM",
        onComplete: function(dsResult) {
            $NC.setValue("#cboCenter_Cd", $NC.G_USERINFO.CENTER_CD);

            // 기본정보 레이어 물류센터 초기화
            $NC.setInitComboData({
                selector: "#cboL1_Center_Cd",
                codeField: "CENTER_CD",
                nameField: "CENTER_NM",
                data: dsResult.slice(),
                onComplete: function() {
                    $NC.setValue("#cboL1_Center_Cd", $NC.G_USERINFO.CENTER_CD);
                }
            });
        }
    });

    // 사업부 초기화
    $NC.setInitCombo("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSUSERBU",
        P_QUERY_PARAMS: {
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_BU_CD: $ND.C_ALL
        }
    }, {
        selector: "#cboBu_Cd",
        codeField: "BU_CD",
        nameField: "BU_NM",
        onComplete: function(dsResult) {
            $NC.setValue("#cboBu_Cd", $NC.G_USERINFO.BU_CD);

            // 기본정보 레이어 사업부 초기화
            $NC.setInitComboData({
                selector: "#cboL1_Bu_Cd",
                codeField: "BU_CD",
                nameField: "BU_NM",
                data: dsResult.slice(),
                onComplete: function() {
                    $NC.setValue("#cboL1_Bu_Cd", $NC.G_USERINFO.BU_CD);
                }
            });
        }
    });

    // 정책 값 읽기
    setPolicyValInfo();
}

function mainMenuInitialize() {

    $NC.setInitDatePicker("#dtpWork_Date");

    // 데이터 다시 읽어서 메뉴 재구성
    $("#btnMenuRefresh").click(function() {
        $NC.serviceCall("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.GET_CSUSERPDAPROGRAM",
            P_QUERY_PARAMS: {
                P_USER_ID: $NC.G_USERINFO.USER_ID
            }
        }, onGetUserProgramMenu);
    });

    // 기본정보 레이어 초기화
    $NC.setInitDatePicker("#dtpL1_Work_Date");
    $("#ctrWCLayer").css("background-color", "#fff");
    $("#ctrDefaultInfoLayer") //
    .css("padding-top", $NC.G_OFFSET.nonClientHeight + "px") //
    .click(function(e) {
        if (e.target != e.currentTarget) {
            return;
        }
        $("#btnDefaultInfoClose").trigger("click");
    });
    $("#btnDefaultInfoClose").click(function() {
        $("#ctrDefaultInfoLayer").hide();

        if ($NC.isNull($NC.G_VAR.activeWindow)) {
            return;
        }

        if ($NC.G_VAR.activeWindow.hasFocus()) {
            var contentWindow = $NC.getChildWindow($NC.G_VAR.activeWindow);
            if ($.isFunction(contentWindow._OnFocus)) {
                contentWindow._OnFocus();
            }
        } else {
            $NC.G_VAR.activeWindow.focus();
        }
    });
}

function showDefaultInfoLayer() {

    // 기본정보 값 기준으로 레이어 값 초기화 후 보임
    $NC.setValue("#cboL1_Center_Cd", $NC.G_USERINFO.CENTER_CD);
    $NC.setValue("#cboL1_Bu_Cd", $NC.G_USERINFO.BU_CD);
    $NC.setValue("#dtpL1_Work_Date", $NC.G_USERINFO.WORK_DATE);

    $NC.showOverlay("#ctrDefaultInfoLayer", {
        backgroundColor: "rgba(0, 0, 0, 0.1)"
    });
}

function hideDefaultInfoLayer() {

    $("#btnDefaultInfoClose").click();
}

/**
 * 사용자 메뉴 가져오기 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetUserProgramMenu(ajaxData) {

    var dsResult = $NC.toArray(ajaxData), //
    $ctrMenuItems = $("#ctrMenuItems"), //
    $ctrMenuViews = $("#ctrMenuViews"), //
    $mnuWC = $("#mnuWC"), //
    $ctrMenuView, lastMenuGrp, pi;

    // 메뉴 데이터 전역변수에 추가, 프로그램 실행시 사용
    $NC.G_VAR.G_PROGRAMMENU = dsResult;

    // 기본정보는 제외하고 메뉴 모두 제거
    $ctrMenuItems.children().not(".default").remove();
    $ctrMenuViews.children().not(".default").remove();

    // 그외 등록 프로그램에 따라 메뉴그룹 및 메뉴 생성
    for (var rIndex = 0, rCount = dsResult.length; rIndex < rCount; rIndex++) {
        pi = dsResult[rIndex];
        // 메뉴 표시 안함이면 다음
        if (pi.DISPLAY_YN == $ND.C_NO) {
            continue;
        }
        // 메뉴 그룹이 다를 경우 메뉴 생성 및 메뉴 컨테이너 추가
        if (lastMenuGrp !== pi.MENU_GRP) {
            $("<div id='mnu" + pi.MENU_GRP + "' class='menu'><span class='actionItem'>" + pi.MENU_GRP_NM + "</span></div>") //
            .appendTo($ctrMenuItems) //
            .click(mainMenuItemOnClick);
            $ctrMenuView = $("<div id='ctr" + pi.MENU_GRP + "' class='panel' style='display: none;'></div>") //
            .appendTo($ctrMenuViews);
            lastMenuGrp = pi.MENU_GRP;
        }
        // 메뉴 컨테이너에 프로그램 추가
        // $("<div class='actionItem'><input id='btn" + pi.PROGRAM_ID + "' class='btnAction' type='button' value='" + pi.PROGRAM_NM + "' /></div>") //
        $("<div class='actionItem'><div id='btn" + pi.PROGRAM_ID + "' class='btnAction'><span>" + pi.PROGRAM_NM + "</span></div>") //
        .appendTo($ctrMenuView) //
        .children().click(mainMenuActionOnClick);
    }

    // 기본정보, Click 이벤트 체크, 지정되어 있지 않을 경우 연결
    if ($NC.isNull(($._data($mnuWC[0], "events") || {}).click)) {
        $mnuWC.click(mainMenuItemOnClick);
    } else {
        $mnuWC.click();
    }
}

function mainMenuItemOnClick(e) {

    var $view = $(e.currentTarget);

    $("#ctrMenuItems").children().removeClass("active");
    $("#ctrMenuViews").children().hide();
    $view.addClass("active");
    $("#" + $view.prop("id").replace("mnu", "ctr")).show();

    // 파렛트ID 매핑 기준 정책값에 따라 [입고]파렛트매핑 메뉴표시 안함
    if ($NC.G_VAR.policyVal.LI230 == "1" && $view.prop("id") == "mnuLI") {
        $("#btnPDA_LIC02210E0").unwrap(); // 해당 버튼의 부모 요소 삭제
        $("#btnPDA_LIC02210E0").detach(); // DOM트리에서 삭제
    }
}

function mainMenuActionOnClick(e) {

    var $view = $(e.currentTarget), //
    programId = $view.prop("id").substring(3);
    // 파렛트ID 매핑 기준 정책값에 따라 검수/적치 프로그램ID 강제 변경
    switch (programId) {
        case "PDA_LIC02310E0":
            switch ($NC.G_VAR.policyVal.LI230) {
                // 입고검수 - 단일
                case "1":
                    break;
                // 입고검수 - 멀티
                case "2":
                case "3":
                    programId = "PDA_LIC02320E0";
                    break;
                default:
                    alert("정책: LI230 - " + $NC.G_VAR.policyVal.LI230 + "\n해당 정책 값은 처리할 수 없습니다. 정책을 확인하십시오.");
                    return;
            }
            break;
        case "PDA_LIC02350E0":
            switch ($NC.G_VAR.policyVal.LI230) {
                // 입고적치 - 단일
                case "1":
                    break;
                // 입고적치 - 멀티
                case "2":
                case "3":
                    programId = "PDA_LIC02360E0";
                    break;
                default:
                    alert("정책: LI230 - " + $NC.G_VAR.policyVal.LI230 + "\n해당 정책 값은 처리할 수 없습니다. 정책을 확인하십시오.");
                    return;
            }
            break;
        case "PDA_LCC03020E0":
            switch ($NC.G_VAR.policyVal.LI230) {
                // 재고이동 - 단일
                case "1":
                    break;
                // 재고이동 - 멀티
                case "2":
                case "3":
                    programId = "PDA_LCC03030E0";
                    break;
                default:
                    alert("정책: LI230 - " + $NC.G_VAR.policyVal.LI230 + "\n해당 정책 값은 처리할 수 없습니다. 정책을 확인하십시오.");
                    return;
            }
            break;
    }

    // 프로그램 실행
    window.showProgramPopup(programId);
}

/**
 * 전역 변수에 정책 값 정보 세팅
 */
function setPolicyValInfo() {

    if ($NC.isNull($NC.G_VAR.policyVal)) {
        $NC.G_VAR.policyVal = {};
    }

    $NC.setPolicyValInfo({
        P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_POLICY_CD: "LI230"
    });
}