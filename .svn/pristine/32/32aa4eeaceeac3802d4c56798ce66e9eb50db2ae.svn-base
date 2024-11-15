/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : CMC03070E0
 *  프로그램명         : 로고이미지관리
 *  프로그램설명       : 로고이미지관리 화면 Javascript
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
        autoResizeSplitView: {
            splitViews: [
                {
                    container: "#divMasterView",
                    grids: "#grdMaster",
                    exceptHeight: $NC.getViewHeight("#ctrMasterLogoView")
                },
                {
                    container: "#divDetailView",
                    grids: "#grdDetail",
                    exceptHeight: $NC.getViewHeight("#ctrDetailLogoView")
                },
                {
                    container: "#divSubView",
                    grids: "#grdSub",
                    exceptHeight: $NC.getViewHeight("#ctrSubLogoView")
                }
            ],
            viewType: "h"
        }
    });

    // 이벤트 연결
    $("#btnBICustUpload").click(btnBICustUploadOnClick);
    $("#btnBICustRemove").click(btnBICustRemoveOnClick);

    $("#btnBIBuUpload").click(btnBIBuUploadOnClick);
    $("#btnBIBuRemove").click(btnBIBuRemoveOnClick);

    $("#btnBIBrandUpload").click(btnBIBrandUploadOnClick);
    $("#btnBIBrandRemove").click(btnBIBrandRemoveOnClick);

    // 그리드 초기화
    grdMasterInitialize();
    grdDetailInitialize();
    grdSubInitialize();

    // 프로그램 사용 권한 설정
    setUserProgramPermission("I");
}

function _SetResizeOffset() {

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

}

function setUserProgramPermission(setType) {

    if (setType == "I") {
        $NC.setEnable("#btnBICustUpload", false);
        $NC.setEnable("#btnBICustRemove", false);
        $NC.setEnable("#btnBIBuUpload", false);
        $NC.setEnable("#btnBIBuRemove", false);
        $NC.setEnable("#btnBIBrandUpload", false);
        $NC.setEnable("#btnBIBrandRemove", false);

        return;
    }

    var permission = $NC.getProgramPermission();
    var enable = false;
    switch (setType) {
        case "M":
            enable = G_GRDMASTER.data.getLength() > 0;
            $NC.setEnable("#btnBICustUpload", permission.canSave && enable);
            $NC.setEnable("#btnBICustRemove", permission.canDelete && enable);
            break;
        case "D":
            enable = G_GRDDETAIL.data.getLength() > 0;
            $NC.setEnable("#btnBIBuUpload", permission.canSave && enable);
            $NC.setEnable("#btnBIBuRemove", permission.canDelete && enable);
            break;
        case "S":
            enable = G_GRDSUB.data.getLength() > 0;
            $NC.setEnable("#btnBIBrandUpload", permission.canSave && enable);
            $NC.setEnable("#btnBIBrandRemove", permission.canDelete && enable);
            break;
    }
}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

}

function onChangingCondition() {

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

    setUserProgramPermission("I");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);

    // 파라메터 세팅
    G_GRDMASTER.queryParams = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    // 데이터 조회
    $NC.serviceCall("/CMC03070E0/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        id: "CUST_CD",
        field: "CUST_CD",
        name: "고객사코드"
    });
    $NC.setGridColumn(columns, {
        id: "CUST_NM",
        field: "CUST_NM",
        name: "고객사명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdMaster", {
        columns: grdMasterOnGetColumns(),
        queryId: "CMC03070E0.RS_MASTER",
        sortCol: "DEPART_CD",
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

    $NC.setInitGridVar(G_GRDDETAIL);
    G_GRDDETAIL.queryParams = {
        P_CUST_CD: rowData.CUST_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    $NC.serviceCall("/CMC03070E0/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    $NC.setInitGridVar(G_GRDSUB);
    G_GRDSUB.queryParams = {
        P_CUST_CD: rowData.CUST_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    $NC.serviceCall("/CMC03070E0/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

    onGetBIImage("#imgBICust", "01", rowData.CUST_CD);
    $NC.setGridDisplayRows(G_GRDMASTER, row + 1);
}

function grdDetailOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BU_CD",
        field: "BU_CD",
        name: "사업부코드",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "BU_NM",
        field: "BU_NM",
        name: "사업부명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "CMC03070E0.RS_DETAIL",
        sortCol: "BU_CD",
        gridOptions: options
    });
    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDDETAIL.data.getItem(row);

    onGetBIImage("#imgBIBu", "02", rowData.BU_CD);
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

function grdSubOnGetColumns() {

    var columns = [];
    $NC.setGridColumn(columns, {
        id: "BRAND_CD",
        field: "BRAND_CD",
        name: "브랜드코드"
    });
    $NC.setGridColumn(columns, {
        id: "BRAND_NM",
        field: "BRAND_NM",
        name: "브랜드명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

    var options = {
        frozenColumn: 0
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        queryId: "CMC03070E0.RS_SUB",
        sortCol: "BRAND_CD",
        gridOptions: options
    });
    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);

}

function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];
    var rowData = G_GRDSUB.data.getItem(row);

    onGetBIImage("#imgBIBrand", "03", rowData.BRAND_CD);
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

function onGetMaster(ajaxData) {

    $NC.setInitGridData(G_GRDMASTER, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDMASTER, "CUST_CD", true)) {
        onGetBIImage("#imgBICust", "01", "");

        $NC.setInitGridVar(G_GRDDETAIL);
        $NC.setInitGridVar(G_GRDSUB);
        onGetDetail({
            data: null
        });
        onGetSub({
            data: null
        });
    }
    setUserProgramPermission("M");

    // 공통 버튼 활성화 처리
    $NC.G_VAR.buttons._inquiry = "1";
    $NC.G_VAR.buttons._new = "0";
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";

    $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetDetail(ajaxData) {

    $NC.setInitGridData(G_GRDDETAIL, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDDETAIL, "BU_CD")) {
        onGetBIImage("#imgBIBu", "02", "");
    }
    setUserProgramPermission("D");
}

function onGetSub(ajaxData) {

    $NC.setInitGridData(G_GRDSUB, ajaxData);
    if (!$NC.setInitGridAfterOpen(G_GRDSUB, "BRAND_CD")) {
        onGetBIImage("#imgBIBrand", "03", "");
    }

    setUserProgramPermission("S");
}

function onSave(ajaxData) {

}

function onGetBIImage(selector, imageDiv, imageCd1) {

    $NC.serviceCall("/CMC03070E0/getBIImage.do", {
        P_IMAGE_DIV: imageDiv,
        P_IMAGE_CD1: $NC.nullToDefault(imageCd1, $ND.C_NULL)
    }, function(ajaxData) {
        var resultData = $NC.toObject(ajaxData);
        var oMsg = $NC.getOutMessage(resultData);
        if (oMsg != $ND.C_OK) {
            $(selector).prop("src", null);
            alert(oMsg);
        } else {
            $(selector).prop("src", resultData.O_IMAGE_CONTENT);
        }
    }, function(ajaxData) {
        $(selector).prop("src", null);
        $NC.onError(ajaxData);
    });
}

function btnBICustUploadOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03070E0.001", "로고를 업로드할 고객사를 선택 후 파일업로드 처리 하십시오."));
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.showUploadFilePopup(".jpg, .png", function(view, fileFullName, fileName) {
        var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (fileExt != "jpg" && fileExt != "png") {
            alert($NC.getDisplayMsg("JS.CMC03070E0.002", "로고 파일(*.jpg, *.png) 파일을 선택하십시오."));
            return;
        }

        $NC.fileUpload("/CMC03070E0/saveBIImage.do", {
            P_IMAGE_DIV: "01",
            P_IMAGE_CD1: rowData.CUST_CD,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, function(ajaxData) {
            onGetBIImage("#imgBICust", "01", rowData.CUST_CD);
        });
    });
}

function btnBICustRemoveOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDMASTER.data.getLength() == 0 || $NC.isNull(G_GRDMASTER.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03070E0.003", "로고를 삭제할 고객사를 선택 후 삭제처리 하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC03070E0.004", "선택한 고객사의 로고를 삭제하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.serviceCall("/CMC03070E0/removeBIImage.do", {
        P_IMAGE_DIV: "01",
        P_IMAGE_CD1: rowData.CUST_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        onGetBIImage("#imgBICust", "01", rowData.CUST_CD);
    });
}

function btnBIBuUploadOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03070E0.005", "로고를 업로드할 사업부를 선택 후 파일업로드 처리 하십시오."));
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    $NC.showUploadFilePopup(".jpg, .png", function(view, fileFullName, fileName) {
        var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (fileExt != "jpg" && fileExt != "png") {
            alert($NC.getDisplayMsg("JS.CMC03070E0.002", "로고 파일(*.jpg, *.png) 파일을 선택하십시오."));
            return;
        }

        $NC.fileUpload("/CMC03070E0/saveBIImage.do", {
            P_IMAGE_DIV: "02",
            P_IMAGE_CD1: rowData.BU_CD,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, function(ajaxData) {
            onGetBIImage("#imgBIBu", "02", rowData.BU_CD);
        });
    });
}

function btnBIBuRemoveOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDDETAIL.data.getLength() == 0 || $NC.isNull(G_GRDDETAIL.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03070E0.006", "로고를 삭제할 사업부를 선택 후 삭제처리 하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC03070E0.007", "선택한 사업부의 로고를 삭제하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    $NC.serviceCall("/CMC03070E0/removeBIImage.do", {
        P_IMAGE_DIV: "02",
        P_IMAGE_CD1: rowData.BU_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        onGetBIImage("#imgBIBu", "02", rowData.BU_CD);
    });
}

function btnBIBrandUploadOnClick() {

    if (!$NC.getProgramPermission().canSave) {
        alert($NC.getDisplayMsg("JS.MAIN.001", "해당 프로그램의 저장권한이 없습니다."));
        return;
    }

    if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03070E0.008", "로고를 업로드할 브랜드를 선택 후 파일업로드 처리 하십시오."));
        return;
    }

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    $NC.showUploadFilePopup(".jpg, .png", function(view, fileFullName, fileName) {
        var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (fileExt != "jpg" && fileExt != "png") {
            alert($NC.getDisplayMsg("JS.CMC03070E0.002", "로고 파일(*.jpg, *.png) 파일을 선택하십시오."));
            return;
        }

        $NC.fileUpload("/CMC03070E0/saveBIImage.do", {
            P_IMAGE_DIV: "03",
            P_IMAGE_CD1: rowData.BRAND_CD,
            P_USER_ID: $NC.G_USERINFO.USER_ID
        }, function(ajaxData) {
            onGetBIImage("#imgBIBrand", "03", rowData.BRAND_CD);
        });
    });
}

function btnBIBrandRemoveOnClick() {

    if (!$NC.getProgramPermission().canDelete) {
        alert($NC.getDisplayMsg("JS.MAIN.002", "해당 프로그램의 삭제권한이 없습니다."));
        return;
    }

    if (G_GRDSUB.data.getLength() == 0 || $NC.isNull(G_GRDSUB.lastRow)) {
        alert($NC.getDisplayMsg("JS.CMC03070E0.009", "로고를 삭제할 브랜드를 선택 후 삭제처리 하십시오."));
        return;
    }

    if (!confirm($NC.getDisplayMsg("JS.CMC03070E0.010", "선택한 브랜드의 로고를 삭제하시겠습니까?"))) {
        return;
    }

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

    $NC.serviceCall("/CMC03070E0/removeBIImage.do", {
        P_IMAGE_DIV: "03",
        P_IMAGE_CD1: rowData.BRAND_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
        onGetBIImage("#imgBIBrand", "03", rowData.BRAND_CD);
    });
}
