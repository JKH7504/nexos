﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : previewpopup
 *  프로그램명         : 출력미리보기 팝업
 *  프로그램설명       : 출력미리보기 팝업 화면 Javascript
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
    // $NC.setGlobalVar({});

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

    $NC.resizeContainer($("#ifmReportPreview"), $("#ifmCommonPopupPrintPreview").width(), $("#ifmCommonPopupPrintPreview").height());
}

/**
 * Load Complete Event
 */
function _OnLoaded() {

    // IE 문제로 body 크기지정
    var viewWidth = $NC.G_JWINDOW.get("width");
    var viewHeight = $NC.G_JWINDOW.get("height");
    $("body").css({
        width: viewWidth,
        height: viewHeight
    });

    var $ifmReportPreview = $("#ifmReportPreview").css({
        width: viewWidth,
        height: viewHeight
    });

    var reportParams = getReportParams();

    var $frmReport = $("#frmReport");
    $frmReport.empty().attr({
        method: "post",
        action: "/report.do",
        target: $ifmReportPreview.attr("id"),
        enctype: "multipart/form-data"
    });

    $("<input/>", {
        id: "P_REPORT_PARAMS",
        type: "hidden",
        name: "P_REPORT_PARAMS",
        value: $NC.toJson(reportParams)
    }).appendTo($frmReport);

    // 개인정보 출력에 대한 기록
    writePIPrintActivityLog(reportParams);

    if ($.browser.mobile || $.browser.msedge) {
        alert($NC.getDisplayMsg("JS.PREVIEWPOPUP.001",
            "해당 브라우저는 출력 미리보기를 할 수 없습니다.\n\n다른 브라우저를 사용하거나 PDF 문서를 PC에 저장 후 출력 또는 내용을 확인하십시오.\n\n파일 다운로드 창이 표시될때까지 기다려주십시오."));
        $frmReport.submit();
    } else {
        $frmReport.submit();

        onLoadEventInitialize();
    }
}

function getReportParams() {

    var params = {
        P_REPORT_FILE: $NC.G_VAR.G_PARAMETER.reportDoc,
        P_QUERY_ID: $NC.G_VAR.G_PARAMETER.queryId,
        P_QUERY_PARAMS: "",
        P_CHECKED_VALUE: "",
        P_INTERNAL_QUERY_YN: $ND.C_NO,
        P_PRINT_COPY: 1,
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_USER_NM: $NC.G_USERINFO.USER_NM,
        P_CLIENT_IP: $NC.G_USERINFO.CLIENT_IP
    };

    if ($NC.isNotNull($NC.G_VAR.G_PARAMETER.checkedValue)) {
        params.P_CHECKED_VALUE = $NC.G_VAR.G_PARAMETER.checkedValue;
    }

    if ($NC.isNotNull($NC.G_VAR.G_PARAMETER.queryParams)) {
        params.P_QUERY_PARAMS = $NC.G_VAR.G_PARAMETER.queryParams;
    }

    if ($NC.isNotNull($NC.G_VAR.G_PARAMETER.internalQueryYn)) {
        params.P_INTERNAL_QUERY_YN = $NC.G_VAR.G_PARAMETER.internalQueryYn;
    }

    if ($NC.isNotNull($NC.G_VAR.G_PARAMETER.printCopy)) {
        params.P_PRINT_COPY = $NC.G_VAR.G_PARAMETER.printCopy;
    }

    if ($NC.isNotNull($NC.G_VAR.G_PARAMETER.programId)) {
        params.P_PROGRAM_ID = $NC.G_VAR.G_PARAMETER.programId;
    }

    if ($NC.isNotNull($NC.G_VAR.G_PARAMETER.reportTitle)) {
        params.P_REPORT_TITLE_NM = $NC.G_VAR.G_PARAMETER.reportTitle;
    }

    return params;
}

function onLoadEventInitialize() {

    var $ifmReportPreview = $("#ifmReportPreview");

    if ($.browser.msie && $.browser.versionNumber < 11) {
        $ifmReportPreview[0].onreadystatechange = function() {

            var readyState = $ifmReportPreview[0].readyState;
            if (readyState != "loading" && readyState != "uninitialized") {
                $ifmReportPreview[0].onreadystatechange = null;
                onDocumentLoaded($ifmReportPreview);
            }
        };
    } else {
        $ifmReportPreview.bind("load", function() {
            onDocumentLoaded($ifmReportPreview);
        });
    }
}

function onDocumentLoaded($ifmReportPreview) {

    $("#ctrPrintingLayer").remove();

    var ajaxData = null;
    var $docBody = null;
    try {
        $docBody = $($ifmReportPreview[0].contentDocument.body);
        if ($docBody.children("embed").length == 0) {
            ajaxData = $docBody.text();
            if ($NC.isNotNull(ajaxData)) {
                if (ajaxData.indexOf("RESULT_CD") == -1 && $docBody.children().length > 0) {
                    ajaxData = $($ifmReportPreview[0].contentDocument).children("html")[0].outerHTML;
                }
            }
            $docBody.css("color", "transparent");
        }
    } catch (e) {
        //
    }
    if ($NC.isNotNull(ajaxData)) {
        setTimeout(function() {
            $NC.onError(ajaxData);
            setTimeout(function() {
                onCancel();
            }, $ND.C_TIMEOUT_CLOSE_FAST);
        }, $ND.C_TIMEOUT_ACT);
    } else {
        $NC.resizeContainer($ifmReportPreview, $("#ifmCommonPopupPrintPreview").width(), $("#ifmCommonPopupPrintPreview").height());
        if ($docBody) {
            $docBody.hide().fadeIn(500, function() {
                setDownloadButton($docBody);
            });
        }
    }
}

function setDownloadButton($docBody) {

    var styles = "style='background-color: #efefef; padding: 2px 5px; border: 1px solid #c7c7c7; border-radius: 16px; " //
        + "position: absolute; display: inline-block; right: 22px; bottom: 5px; width: 22px; " //
        + "text-align: center; line-height: 26px; color: #6f6f6f; cursor: pointer;'";
    $docBody.append("<div id='btnDownloadPDF' title='PDF 다운로드'" + styles + ">▼</div>");
    var $btnDownloadPDF = $docBody.find("#btnDownloadPDF").click(function() {
        top.fileDownload("/report.do", getReportParams());
    }).hide();

    setTimeout(function() {
        $btnDownloadPDF.show();
    }, $ND.C_TIMEOUT_CLOSE_SLOW);
}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

    $NC.setPopupCloseAction($ND.C_CANCEL);
    $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

    $NC.setPopupCloseAction($ND.C_OK);
    $NC.onPopupClose();
}

function writePIPrintActivityLog(reportParams) {
    // 개인정보 출력에 대한 기록
    if ($NC.G_USERINFO.USE_SECURITY_LOG === $ND.C_YES) {
        try {
            var $mainNC = $NC.G_MAIN.$NC;
            var ACTIVITY_PROGRAM_ID = reportParams.P_PROGRAM_ID;
            if ($NC.isNull(ACTIVITY_PROGRAM_ID) && $NC.isNotNull($mainNC.G_VAR.lastWindow)) {
                var G_PARAMETER = $mainNC.G_VAR.lastWindow.get("G_PARAMETER");
                ACTIVITY_PROGRAM_ID = G_PARAMETER.PROGRAM_ID || "";
            }
            for (var rIndex = 0, rCount = $mainNC.G_VAR.personalInfoPrograms.length; rIndex < rCount; rIndex++) {
                var checkingProgram = $mainNC.G_VAR.personalInfoPrograms[rIndex] || "";
                if (ACTIVITY_PROGRAM_ID.indexOf(checkingProgram) == -1) {
                    continue;
                }
                $NC.serviceCallAndWait("/WC/writeActivityLog.do", {
                    P_ACTIVITY_CD: ACTIVITY_PROGRAM_ID,
                    P_ACTIVITY_COMMENT: $NC.G_MAIN.objToParamString({
                        P_REPORT_FILE: reportParams.P_REPORT_FILE,
                        P_QUERY_ID: reportParams.P_QUERY_ID,
                        P_QUERY_PARAMS: reportParams.P_QUERY_PARAMS,
                        P_CHECKED_VALUE: reportParams.P_CHECKED_VALUE
                    }),
                    P_ACTIVITY_DIV: "22", // 22 - 개인정보출력
                    P_USER_ID: $NC.G_USERINFO.USER_ID
                }, function() {
                    // 성공
                }, function() {
                    // 실패 메시지 표시 하지 않음
                });
                break;
            }
        } catch (e) {
            //
        }
    }
}