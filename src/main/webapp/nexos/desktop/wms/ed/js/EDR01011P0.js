﻿/**
 * <pre>
 *  ==================================================================================================================================================
 *  프로그램ID         : EDR01011P0
 *  프로그램명         : 인터페이스수신정의등록 팝업
 *  프로그램설명       : 인터페이스수신정의등록 팝업 화면 Javascript
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
        autoResizeFixedView: {
            viewFirst: {
                container: "#ctrPopupView"
            },
            viewSecond: {
                container: "#divDetailView",
                grids: "#grdDetail"
            },
            viewType: "v",
            viewFixed: 352
        // 307; // 282; // 257; // 25
        },
        // 마스터 데이터
        masterData: null,
        TIME_DATA_DIV: ":",
        REPEAT_DATA_DIV: ",",
        useCustomMethod: false
    });

    $("#divDataCycleView1").show();
    $("#divDataCycleView2").hide();

    // 그리드 초기화
    grdDetailInitialize();
    // 그리드 초기화
    grdSubInitialize();

    // 버튼 클릭 이벤트 연결
    $("#btnClose").click(onCancel); // 닫기버튼
    $("#btnEntrySave").click(_Save); // 저장 버튼
    $("#btnAddAllColumns").click(btnAddAllColumnsOnClick); // 수신항목 전체추가 버튼

    $("#btnCycleNew").click(btnCycleNewOnClick); // 특정수신구주기추가
    $("#btnCycleDelete").click(btnCycleDeleteOnClick); // 특정수신구주기추가

    // Tooltip 세팅
    setTooltip();

    // TEXTAREA 포커스인/아웃시 사이즈 조정
    $("textarea[id^='edtXml']," //
        + "textarea[id^='edtJson']," //
        + "textarea[id^='edtWebService']," //
        + "textarea[id^='edtSAP']," //
        + "#edtLink_Where_Text," //
        + "#edtRemote_Param_Map") //
    .css("overflow", "hidden") //
    .focusin(function(e) {
        $(e.target).css({
            "width": "295px",
            "height": "250px",
            "position": "absolute",
            "margin-left": "6px",
            "z-index": "100",
            "overflow": "auto"
        });
    }) //
    .focusout(function(e) {
        var targetId = $(e.target).prop("id");
        var isRemoteSetting = targetId == "edtPkg_Param_Map" //
            || targetId == "edtWebService_Header_Val" //
            || targetId == "edtWebService_Param_Val" //
            || targetId == "edtRemote_Param_Map";
        $(e.target).css({
            "width": isRemoteSetting ? "295px" : "200px",
            "height": isRemoteSetting ? "20px" : "20px",
            "position": "relative",
            "margin-left": "0",
            "z-index": "0",
            "overflow": "hidden"
        });
    });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

    $NC.G_OFFSET.fixedSubGridWidth = 295;
    $NC.G_OFFSET.fixedSubGridHeight = 142; // 118; // 94; // 70; // 24
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, viewWidth, viewHeight) {

    // 송신주기 그리드 사이즈 조정
    $NC.resizeGridView("#divDataCycleView1", "#grdSub", $NC.G_OFFSET.fixedSubGridWidth, $NC.G_OFFSET.fixedSubGridHeight);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

    $NC.setValue("#edtBu_Cd", $NC.G_VAR.G_PARAMETER.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.G_PARAMETER.P_BU_NM);

    var dsMaster, newRowData, rowData, rIndex, rCount;
    // 신규 등록
    if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_CREATE) {

        // 마스터 데이터 세팅
        $NC.G_VAR.masterData = {
            BU_CD: $NC.G_VAR.G_PARAMETER.P_BU_CD,
            EDI_DIV: $NC.G_VAR.G_PARAMETER.P_EDI_DIV == $ND.C_ALL ? "" : $NC.G_VAR.G_PARAMETER.P_EDI_DIV,
            DEFINE_DIV: "1",
            DEFINE_NO: "",
            DEFINE_NM: "",
            DATA_DIV: $ND.C_DATA_DIV_DBLINK,
            // DBLink, DBConnect
            LINK_DB_NM: "",
            LINK_TABLE_NM: "",
            LINK_WHERE_TEXT: "",
            // EXCEL
            XLS_FIRST_ROW: "",
            // TEXT
            TXT_DELIMETER_YN: $ND.C_NO,
            TXT_COL_DELIMETER: "",
            // XML
            XML_TAG_ROOT: "",
            XML_TAG_BUNCH: "",
            XML_TAG_SUB_BUNCH: "",
            XML_TAG_RESULT: "",
            XML_TAG_RESULT_MAP: "",
            // JSON
            JSON_TAG_ROOT: "",
            JSON_TAG_BUNCH: "",
            JSON_TAG_SUB_BUNCH: "",
            JSON_TAG_STRUCT_DIV: "",
            JSON_TAG_LINK_MAP: "",
            JSON_TAG_RESULT: "",
            JSON_TAG_RESULT_MAP: "",
            // SAP
            SAP_FUNCTION_NM: "",
            SAP_TABLE_NM: "",
            SAP_PARAM_MAP: "",
            SAP_RESULT_MAP: "",
            // 원격송수신
            REMOTE_DIV: "",
            REMOTE_IP: "",
            REMOTE_PORT: "",
            REMOTE_USER_ID: "",
            REMOTE_USER_PWD: "",
            REMOTE_ACTION_TYPE: "",
            REMOTE_PARAM_MAP: "",
            REMOTE_PASSIVE_YN: $ND.C_NO,
            REMOTE_CHARSET: "",
            REMOTE_DIR: "",
            // 웹서비스
            WEBSERVICE_DIV: "",
            PKG_NM: "",
            PKG_PARAM_MAP: "",

            WEBSERVICE_URL: "",
            WEBSERVICE_HEADER_VAL: "",

            WEBSERVICE_METHOD: "",
            WEBSERVICE_NS_PREFIX: "",
            WEBSERVICE_NS_URI: "",
            WEBSERVICE_TAG_RESULT: "",

            WEBSERVICE_PARAM_NM: "",
            WEBSERVICE_PARAM_VAL: "",

            WEBSERVICE_AUTH_DIV: "",
            WEBSERVICE_AUTH_URL: "",
            WEBSERVICE_AUTH_TYPE: "",
            WEBSERVICE_AUTH_CID: "",
            WEBSERVICE_AUTH_CSECRET: "",
            // 자동실행
            AUTO_EXEC_YN: $ND.C_NO,
            DATA_CYCLE_DIV: "",
            REPEAT_EXEC_TIME: "",

            // Custom Method
            CUSTOM_METHOD: "",

            // 기타
            EDI_DIR: "",
            PREFIX_FILE_NM: "",
            REMARK1: "",
            CRUD: $ND.C_DV_CRUD_C
        };

        // 마스터 데이터 세팅
        dsMaster = $NC.G_VAR.masterData;

        $NC.setValue("#edtDefine_No");
        $NC.setValue("#edtDefine_Nm");
        $NC.setValue("#edtRemark1");
        // DBLink, DBConnect
        $NC.setValue("#edtLink_Db_Nm");
        $NC.setValue("#edtLink_Table_Nm");
        $NC.setValue("#edtLink_Where_Text");
        // EXCEL
        $NC.setValue("#edtXls_First_Row");
        // TEXT
        $NC.setValue("#chkTxt_Delimeter_Yn");
        $NC.setValue("#edtTxt_Col_Delimeter");
        // XML
        $NC.setValue("#edtXml_Tag_Root");
        $NC.setValue("#edtXml_Tag_Bunch");
        $NC.setValue("#edtXml_Tag_Sub_Bunch");
        $NC.setValue("#edtXml_Tag_Result");
        $NC.setValue("#edtXml_Tag_Result_Map");
        // JSON
        $NC.setValue("#edtJson_Tag_Root");
        $NC.setValue("#edtJson_Tag_Bunch");
        $NC.setValue("#edtJson_Tag_Sub_Bunch");
        $NC.setValue("#cboJson_Tag_Struct_Div");
        $NC.setValue("#edtJson_Tag_Link_Map");
        $NC.setValue("#edtJson_Tag_Result");
        $NC.setValue("#edtJson_Tag_Result_Map");
        // SAP
        $NC.setValue("#edtSAP_Function_Nm");
        $NC.setValue("#edtSAP_Table_Nm");
        $NC.setValue("#edtSAP_Param_Map");
        $NC.setValue("#edtSAP_Result_Map");
        // 원격송수신구분
        // FTP, SFTP, SQLServer, Oracle, MySQL
        $NC.setValue("#edtRemote_Ip");
        $NC.setValue("#edtRemote_Port");
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        $NC.setValue("#edtRemote_User_Id");
        $NC.setValue("#edtRemote_User_Pwd");
        // SQLServer, Oracle, MySQL
        $NC.setValue("#cboRemote_Action_Type");
        $NC.setValue("#edtRemote_Param_Map");
        // FTP, SFTP
        $NC.setValue("#chkRemote_Passive_Yn");
        $NC.setValue("#edtRemote_Charset");
        $NC.setValue("#edtRemote_Dir");
        // 웹서비스구분
        $NC.setValue("#cboWebService_Div");
        // Local WebService
        // $NC.setValue("#edtPkg_Nm");
        // $NC.setValue("#edtPkg_Param_Map");
        // Remote WebService - RESTful, SOAP
        $NC.setValue("#edtWebService_Url");
        $NC.setValue("#edtWebService_Header_Val");
        // Remote WebService - SOAP
        $NC.setValue("#edtWebService_Method");
        $NC.setValue("#edtWebService_NS_Prefix");
        $NC.setValue("#edtWebService_NS_Uri");
        $NC.setValue("#edtWebService_Tag_Result");
        // Remote WebService - RESTful
        $NC.setValue("#edtWebService_Param_Nm");
        $NC.setValue("#edtWebService_Param_Val");
        // 웹서비스인증구분
        $NC.setValue("#cboWebService_Auth_Div");
        // Remote WebService - OAuth
        $NC.setValue("#edtWebService_Auth_Url");
        $NC.setValue("#edtWebService_Auth_Type");
        // Custom Method
        $NC.setValue("#edtCustom_Method");
        // 파일 관련
        $NC.setValue("#edtEdi_Dir");
        $NC.setValue("#edtPrefix_File_Nm");
        // 자동실행
        $NC.setValue("#chkAuto_Exec_Yn");
        $NC.setValue("#edtStart_Time");
        $NC.setValue("#edtEnd_Time");
        $NC.setValue("#edtRepeat_Time");

        grdDetailOnSetColumns(dsMaster);
    }
    // 수정
    else {
        // 마스터 데이터 세팅
        dsMaster = $NC.G_VAR.G_PARAMETER.P_MASTER_DS;

        $NC.setValue("#edtDefine_No", dsMaster.DEFINE_NO);
        $NC.setValue("#edtDefine_Nm", dsMaster.DEFINE_NM);
        $NC.setValue("#edtRemark1", dsMaster.REMARK1);
        // DBLink, DBConnect
        $NC.setValue("#edtLink_Db_Nm", dsMaster.LINK_DB_NM);
        $NC.setValue("#edtLink_Table_Nm", dsMaster.LINK_TABLE_NM);
        $NC.setValue("#edtLink_Where_Text", dsMaster.LINK_WHERE_TEXT);
        // EXCEL
        $NC.setValue("#edtXls_First_Row", dsMaster.XLS_FIRST_ROW);
        // TEXT
        $NC.setValue("#chkTxt_Delimeter_Yn", dsMaster.TXT_DELIMETER_YN);
        $NC.setValue("#edtTxt_Col_Delimeter", dsMaster.TXT_COL_DELIMETER);
        // XML
        $NC.setValue("#edtXml_Tag_Root", dsMaster.XML_TAG_ROOT);
        $NC.setValue("#edtXml_Tag_Bunch", dsMaster.XML_TAG_BUNCH);
        $NC.setValue("#edtXml_Tag_Sub_Bunch", dsMaster.XML_TAG_SUB_BUNCH);
        $NC.setValue("#edtXml_Tag_Result", dsMaster.XML_TAG_RESULT);
        $NC.setValue("#edtXml_Tag_Result_Map", dsMaster.XML_TAG_RESULT_MAP);
        // JSON
        $NC.setValue("#edtJson_Tag_Root", dsMaster.JSON_TAG_ROOT);
        $NC.setValue("#edtJson_Tag_Bunch", dsMaster.JSON_TAG_BUNCH);
        $NC.setValue("#edtJson_Tag_Sub_Bunch", dsMaster.JSON_TAG_SUB_BUNCH);
        $NC.setValue("#cboJson_Tag_Struct_Div", dsMaster.JSON_TAG_STRUCT_DIV);
        $NC.setValue("#edtJson_Tag_Link_Map", dsMaster.JSON_TAG_LINK_MAP);
        $NC.setValue("#edtJson_Tag_Result", dsMaster.JSON_TAG_RESULT);
        $NC.setValue("#edtJson_Tag_Result_Map", dsMaster.JSON_TAG_RESULT_MAP);
        // SAP
        $NC.setValue("#edtSAP_Function_Nm", dsMaster.SAP_FUNCTION_NM);
        $NC.setValue("#edtSAP_Table_Nm", dsMaster.SAP_TABLE_NM);
        $NC.setValue("#edtSAP_Param_Map", dsMaster.SAP_PARAM_MAP);
        $NC.setValue("#edtSAP_Result_Map", dsMaster.SAP_RESULT_MAP);
        // 원격송수신
        // FTP, SFTP, SQLServer, Oracle, MySQL
        $NC.setValue("#edtRemote_Ip", dsMaster.REMOTE_IP);
        $NC.setValue("#edtRemote_Port", dsMaster.REMOTE_PORT);
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        $NC.setValue("#edtRemote_User_Id", dsMaster.REMOTE_USER_ID);
        $NC.setValue("#edtRemote_User_Pwd", dsMaster.REMOTE_USER_PWD);
        // SQLServer, Oracle, MySQL
        $NC.setValue("#cboRemote_Action_Type", dsMaster.REMOTE_ACTION_TYPE);
        $NC.setValue("#edtRemote_Param_Map", dsMaster.REMOTE_PARAM_MAP);
        // FTP, SFTP
        $NC.setValue("#chkRemote_Passive_Yn", dsMaster.REMOTE_PASSIVE_YN);
        $NC.setValue("#edtRemote_Charset", dsMaster.REMOTE_CHARSET);
        $NC.setValue("#edtRemote_Dir", dsMaster.REMOTE_DIR);
        // 웹서비스구분
        // Local WebService
        // $NC.setValue("#edtPkg_Nm", dsMaster.PKG_NM);
        // $NC.setValue("#edtPkg_Param_Map", dsMaster.PKG_PARAM_MAP);
        // Remote WebService - RESTful, SOAP
        $NC.setValue("#edtWebService_Url", dsMaster.WEBSERVICE_URL);
        $NC.setValue("#edtWebService_Header_Val", dsMaster.WEBSERVICE_HEADER_VAL);
        // Remote WebService - SOAP
        $NC.setValue("#edtWebService_Method", dsMaster.WEBSERVICE_METHOD);
        $NC.setValue("#edtWebService_NS_Prefix", dsMaster.WEBSERVICE_NS_PREFIX);
        $NC.setValue("#edtWebService_NS_Uri", dsMaster.WEBSERVICE_NS_URI);
        $NC.setValue("#edtWebService_Tag_Result", dsMaster.WEBSERVICE_TAG_RESULT);
        // Remote WebService - RESTful
        $NC.setValue("#edtWebService_Param_Nm", dsMaster.WEBSERVICE_PARAM_NM);
        $NC.setValue("#edtWebService_Param_Val", dsMaster.WEBSERVICE_PARAM_VAL);
        // 웹서비스인증구분
        // Remote WebService - OAuth
        $NC.setValue("#edtWebService_Auth_Url", dsMaster.WEBSERVICE_AUTH_URL);
        $NC.setValue("#edtWebService_Auth_Type", dsMaster.WEBSERVICE_AUTH_TYPE);
        $NC.setValue("#edtWebService_Auth_CId", dsMaster.WEBSERVICE_AUTH_CID);
        $NC.setValue("#edtWebService_Auth_CSecret", dsMaster.WEBSERVICE_AUTH_CSECRET);
        // Custom Method
        $NC.setValue("#edtCustom_Method", dsMaster.CUSTOM_METHOD);
        // 파일 관련
        $NC.setValue("#edtEdi_Dir", dsMaster.EDI_DIR);
        $NC.setValue("#edtPrefix_File_Nm", dsMaster.PREFIX_FILE_NM);
        // 자동실행
        $NC.setValue("#chkAuto_Exec_Yn", dsMaster.AUTO_EXEC_YN);
        $NC.setValue("#edtStart_Time");
        $NC.setValue("#edtEnd_Time");
        $NC.setValue("#edtRepeat_Time");

        // 송수신주기
        var dsRepeatTime;
        switch (dsMaster.DATA_CYCLE_DIV) {
            // 특정
            case "1":
                dsRepeatTime = (dsMaster.REPEAT_EXEC_TIME || "").split($NC.G_VAR.REPEAT_DATA_DIV);
                G_GRDSUB.data.beginUpdate();
                try {
                    for (rIndex = 0, rCount = dsRepeatTime.length; rIndex < rCount; rIndex++) {
                        newRowData = {
                            REPEAT_TIME: dsRepeatTime[rIndex],
                            id: $NC.getGridNewRowId(),
                            CRUD: $ND.C_DV_CRUD_R
                        };
                        G_GRDSUB.data.addItem(newRowData);
                    }
                } finally {
                    G_GRDSUB.data.endUpdate();
                }
                break;
            // 반복
            case "2":
                dsRepeatTime = (dsMaster.REPEAT_EXEC_TIME || "").split($NC.G_VAR.REPEAT_DATA_DIV);
                if (dsRepeatTime.length == "3") {
                    $NC.setValue("#edtStart_Time", dsRepeatTime[0]);
                    $NC.setValue("#edtEnd_Time", dsRepeatTime[1]);
                    $NC.setValue("#edtRepeat_Time", dsRepeatTime[2]);
                } else {
                    $NC.setValue("#edtRepeat_Time", dsRepeatTime[0]);
                }
                break;
        }

        $NC.G_VAR.masterData = {
            BU_CD: dsMaster.BU_CD,
            EDI_DIV: dsMaster.EDI_DIV,
            DEFINE_NO: dsMaster.DEFINE_NO,
            DEFINE_NM: dsMaster.DEFINE_NM,
            DATA_DIV: dsMaster.DATA_DIV,
            DEFINE_DIV: dsMaster.DEFINE_DIV,
            // DBLink, DBConnect
            LINK_DB_NM: dsMaster.LINK_DB_NM,
            LINK_TABLE_NM: dsMaster.LINK_TABLE_NM,
            LINK_WHERE_TEXT: dsMaster.LINK_WHERE_TEXT,
            // EXCEL
            XLS_FIRST_ROW: dsMaster.XLS_FIRST_ROW,
            // TEXT
            TXT_DELIMETER_YN: dsMaster.TXT_DELIMETER_YN,
            TXT_COL_DELIMETER: dsMaster.TXT_COL_DELIMETER,
            // XML
            XML_TAG_ROOT: dsMaster.XML_TAG_ROOT,
            XML_TAG_BUNCH: dsMaster.XML_TAG_BUNCH,
            XML_TAG_SUB_BUNCH: dsMaster.XML_TAG_SUB_BUNCH,
            XML_TAG_RESULT: dsMaster.XML_TAG_RESULT,
            XML_TAG_RESULT_MAP: dsMaster.XML_TAG_RESULT_MAP,
            // JSON
            JSON_TAG_ROOT: dsMaster.JSON_TAG_ROOT,
            JSON_TAG_BUNCH: dsMaster.JSON_TAG_BUNCH,
            JSON_TAG_SUB_BUNCH: dsMaster.JSON_TAG_SUB_BUNCH,
            JSON_TAG_STRUCT_DIV: dsMaster.JSON_TAG_STRUCT_DIV,
            JSON_TAG_LINK_MAP: dsMaster.JSON_TAG_LINK_MAP,
            JSON_TAG_RESULT: dsMaster.JSON_TAG_RESULT,
            JSON_TAG_RESULT_MAP: dsMaster.JSON_TAG_RESULT_MAP,
            // SAP
            SAP_FUNCTION_NM: dsMaster.SAP_FUNCTION_NM,
            SAP_TABLE_NM: dsMaster.SAP_TABLE_NM,
            SAP_PARAM_MAP: dsMaster.SAP_PARAM_MAP,
            SAP_RESULT_MAP: dsMaster.SAP_RESULT_MAP,
            // 원격송수신구분
            REMOTE_DIV: dsMaster.REMOTE_DIV,
            // FTP, SFTP, SQLServer, Oracle, MySQL
            REMOTE_IP: dsMaster.REMOTE_IP,
            REMOTE_PORT: dsMaster.REMOTE_PORT,
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            REMOTE_USER_ID: dsMaster.REMOTE_USER_ID,
            REMOTE_USER_PWD: dsMaster.REMOTE_USER_PWD,
            // SQLServer, Oracle, MySQL
            REMOTE_ACTION_TYPE: dsMaster.REMOTE_ACTION_TYPE,
            REMOTE_PARAM_MAP: dsMaster.REMOTE_PARAM_MAP,
            // FTP, SFTP
            REMOTE_PASSIVE_YN: dsMaster.REMOTE_PASSIVE_YN,
            REMOTE_CHARSET: dsMaster.REMOTE_CHARSET,
            REMOTE_DIR: dsMaster.REMOTE_DIR,
            // 웹서비스구분
            WEBSERVICE_DIV: dsMaster.WEBSERVICE_DIV,
            // Local WebService
            PKG_NM: dsMaster.PKG_NM,
            PKG_PARAM_MAP: dsMaster.PKG_PARAM_MAP,
            // Remote WebService - RESTful, SOAP
            WEBSERVICE_URL: dsMaster.WEBSERVICE_URL,
            WEBSERVICE_HEADER_VAL: dsMaster.WEBSERVICE_HEADER_VAL,
            // Remote WebService - SOAP
            WEBSERVICE_METHOD: dsMaster.WEBSERVICE_METHOD,
            WEBSERVICE_NS_PREFIX: dsMaster.WEBSERVICE_NS_PREFIX,
            WEBSERVICE_NS_URI: dsMaster.WEBSERVICE_NS_URI,
            WEBSERVICE_TAG_RESULT: dsMaster.WEBSERVICE_TAG_RESULT,
            // Remote WebService - RESTful
            WEBSERVICE_PARAM_NM: dsMaster.WEBSERVICE_PARAM_NM,
            WEBSERVICE_PARAM_VAL: dsMaster.WEBSERVICE_PARAM_VAL,
            // 웬서비스인증구분
            WEBSERVICE_AUTH_DIV: dsMaster.WEBSERVICE_AUTH_DIV,
            // Remote WebService - OAuth
            WEBSERVICE_AUTH_URL: dsMaster.WEBSERVICE_AUTH_URL,
            WEBSERVICE_AUTH_TYPE: dsMaster.WEBSERVICE_AUTH_TYPE,
            WEBSERVICE_AUTH_CID: dsMaster.WEBSERVICE_AUTH_CID,
            WEBSERVICE_AUTH_CSECRET: dsMaster.WEBSERVICE_AUTH_CSECRET,
            // Custom Method
            CUSTOM_METHOD: dsMaster.CUSTOM_METHOD,
            // 파일관련
            EDI_DIR: dsMaster.EDI_DIR,
            PREFIX_FILE_NM: dsMaster.PREFIX_FILE_NM,
            // 자동실행
            AUTO_EXEC_YN: dsMaster.AUTO_EXEC_YN,
            DATA_CYCLE_DIV: dsMaster.DATA_CYCLE_DIV,
            REPEAT_EXEC_TIME: dsMaster.REPEAT_EXEC_TIME,
            // 기타
            REMARK1: dsMaster.REMARK1,
            CRUD: $ND.C_DV_CRUD_R
        };

        grdDetailOnSetColumns(dsMaster);

        // 디테일 데이터 세팅
        var dsDetail = $NC.G_VAR.G_PARAMETER.P_DETAIL_DS;
        G_GRDDETAIL.data.beginUpdate();
        try {
            for (rIndex = 0, rCount = dsDetail.length; rIndex < rCount; rIndex++) {
                rowData = dsDetail[rIndex];
                newRowData = {
                    BU_CD: rowData.BU_CD,
                    EDI_DIV: rowData.EDI_DIV,
                    DEFINE_NO: rowData.DEFINE_NO,
                    COLUMN_NM: rowData.COLUMN_NM,
                    COLUMN_ID: rowData.COLUMN_ID,
                    DATA_TYPE: rowData.DATA_TYPE,
                    DATA_NULL_YN: rowData.DATA_NULL_YN,
                    DATA_DEFAULT: rowData.DATA_DEFAULT,
                    DATA_CHANGE_SQL: rowData.DATA_CHANGE_SQL,
                    DATE_FORMAT_DIV: rowData.DATE_FORMAT_DIV,
                    DATE_INPUT_DIV: rowData.DATE_INPUT_DIV,
                    IF_CODE_GRP: rowData.IF_CODE_GRP,
                    LINK_COLUMN_NM: rowData.LINK_COLUMN_NM,
                    TXT_POSITION: rowData.TXT_POSITION,
                    TXT_LENGTH: rowData.TXT_LENGTH,
                    XLS_COLUMN_NM: rowData.XLS_COLUMN_NM,
                    XML_TAG_NM: rowData.XML_TAG_NM,
                    XML_TAG_ATTR: rowData.XML_TAG_ATTR,
                    JSON_COLUMN_NM: rowData.JSON_COLUMN_NM,
                    DATA_TYPE_F: rowData.DATA_TYPE_F,
                    DATE_FORMAT_DIV_F: rowData.DATE_FORMAT_DIV_F,
                    DATE_INPUT_DIV_F: rowData.DATE_INPUT_DIV_F,
                    IF_CODE_GRP_D: rowData.IF_CODE_GRP_D,
                    REMARK1: rowData.REMARK1,
                    id: $NC.getGridNewRowId(),
                    CRUD: $ND.C_DV_CRUD_R
                };
                G_GRDDETAIL.data.addItem(newRowData);
            }
        } finally {
            G_GRDDETAIL.data.endUpdate();
        }

        // 수정일 경우 입력불가 항목 비활성화 처리
        $NC.setEnable("#cboEdi_Div", false);
        $NC.setEnable("#edtDefine_No", false);
        // $NC.setEnable("#edtDefine_Nm", false); // 정의명칭 변경 가능하도록 수정, 2018-03-21
        $NC.setEnable("#cboData_Div", false);

        $NC.setGridSelectRow(G_GRDDETAIL, 0);
    }

    setDataDivChange($NC.G_VAR.masterData.DATA_DIV, false);

    // 자동실행여부에 따른 활성화/비활성화
    setEnableWithVisible("#cboData_Cycle_Div", dsMaster.AUTO_EXEC_YN == $ND.C_YES);

    if (dsMaster.DATA_CYCLE_DIV == "1") {
        $("#divDataCycleView1").show();
        $("#divDataCycleView2").hide();
    } else if (dsMaster.DATA_CYCLE_DIV == "2") {
        $("#divDataCycleView1").hide();
        $("#divDataCycleView2").show();
    } else {
        $("#divDataCycleView1").hide();
        $("#divDataCycleView2").hide();
    }

    // 콤보박스 초기화
    $NC.serviceCall("/WC/getMultiDataSet.do", {
        P_SERVICE_PARAMS: [
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_EDI_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "EDI_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: "1",
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_DATA_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "DATA_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_DATA_CYCLE_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "DATA_CYCLE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_JSON_TAG_STRUCT_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "JSON_TAG_STRUCT_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_REMOTE_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "REMOTE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_WEBSERVICE_AUTH_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "WEBSERVICE_AUTH_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_WEBSERVICE_DIV",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "WEBSERVICE_DIV",
                    P_COMMON_CD: $ND.C_ALL,
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            },
            {
                P_RESULT_ID: "O_WC_POP_CMCODE_REMOTE_ACTION_TYPE",
                P_QUERY_ID: "WC.POP_CMCODE",
                P_QUERY_PARAMS: {
                    P_COMMON_GRP: "REMOTE_ACTION_TYPE",
                    P_COMMON_CD: $ND.C_ALL,
                    P_ATTR01_CD: [
                        "0",
                        "1"
                    ].join($ND.C_SEP_DATA),
                    P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
                }
            }
        ]
    }, function(ajaxData) {
        var multipleData = $NC.toObject(ajaxData);
        // 수신구분 세팅
        $NC.setInitComboData({
            selector: "#cboEdi_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_EDI_DIV),
            selectOption: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_CREATE ? "F" : null,
            onComplete: function() {
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_CREATE && $NC.isNull($NC.G_VAR.masterData.EDI_DIV)) {
                    $NC.G_VAR.masterData.EDI_DIV = $NC.getValue("#cboEdi_Div");
                } else {
                    $NC.setValue("#cboEdi_Div", $NC.G_VAR.masterData.EDI_DIV);
                }
            }
        });
        // 수신처리구분 세팅
        $NC.setInitComboData({
            selector: "#cboData_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_DATA_DIV),
            selectOption: $NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_CREATE ? "F" : null,
            onComplete: function() {
                if ($NC.G_VAR.G_PARAMETER.P_PROCESS_CD == $ND.C_PROCESS_CREATE) {
                    $NC.G_VAR.masterData.DATA_DIV = $NC.getValue("#cboData_Div");
                } else {
                    $NC.setValue("#cboData_Div", $NC.G_VAR.masterData.DATA_DIV);
                }
            }
        });
        // 수신주기구분 세팅
        $NC.setInitComboData({
            selector: "#cboData_Cycle_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_DATA_CYCLE_DIV),
            onComplete: function() {
                $NC.setValue("#cboData_Cycle_Div", $NC.G_VAR.masterData.DATA_CYCLE_DIV);
            }
        });
        // JSON태그구조구분 세팅
        $NC.setInitComboData({
            selector: "#cboJson_Tag_Struct_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_JSON_TAG_STRUCT_DIV),
            onComplete: function() {
                $NC.setValue("#cboJson_Tag_Struct_Div", $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV);
            }
        });
        // 원격송수신구분 세팅
        $NC.setInitComboData({
            selector: "#cboRemote_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_REMOTE_DIV),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboRemote_Div", $NC.G_VAR.masterData.REMOTE_DIV);
            }
        });
        // 웹서비스구분 세팅
        $NC.setInitComboData({
            selector: "#cboWebService_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_WEBSERVICE_DIV),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboWebService_Div", $NC.G_VAR.masterData.WEBSERVICE_DIV);
            }
        });
        // 웹서비스인증구분 세팅
        $NC.setInitComboData({
            selector: "#cboWebService_Auth_Div",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_WEBSERVICE_AUTH_DIV),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboWebService_Auth_Div", $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV);
            }
        });
        // 원격액션타입 세팅
        $NC.setInitComboData({
            selector: "#cboRemote_Action_Type",
            codeField: "COMMON_CD",
            nameField: "COMMON_NM",
            fullNameField: "COMMON_CD_F",
            data: $NC.toArray(multipleData.O_WC_POP_CMCODE_REMOTE_ACTION_TYPE),
            addEmpty: true,
            onComplete: function() {
                $NC.setValue("#cboRemote_Action_Type", $NC.G_VAR.masterData.REMOTE_ACTION_TYPE);
            }
        });
    });
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

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

    var id = view.prop("id").substr(3).toUpperCase();
    masterDataOnChange(e, {
        view: view,
        col: id,
        val: val
    });
}

/**
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

}

/**
 * 저장
 */
function _Save() {

    if (G_GRDDETAIL.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.002", "저장할 데이터가 없습니다."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.003", "사업부를 입력하십시오."));
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.EDI_DIV)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.004", "수신구분을 선택하십시오."));
        $NC.setFocus("#cboEdi_Div");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.DEFINE_NO)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.005", "정의번호를 입력하십시오."));
        $NC.setFocus("#edtDefine_No");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.DEFINE_NM)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.006", "정의명칭을 입력하십시오."));
        $NC.setFocus("#edtDefine_Nm");
        return;
    }

    if ($NC.isNull($NC.G_VAR.masterData.DATA_DIV)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.007", "수신처리구분을 선택하십시오."));
        $NC.setFocus("#cboData_Div");
        return;
    }

    var dataDiv = $NC.G_VAR.masterData.DATA_DIV;
    switch (dataDiv) {
        // DBLink
        case $ND.C_DATA_DIV_DBLINK:
            if ($NC.isNull($NC.G_VAR.masterData.LINK_TABLE_NM)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.008", "[DBLink]테이블명을 입력하십시오."));
                $NC.setFocus("#edtLink_Table_Nm");
                return;
            }
            break;
        // DBConnect
        case $ND.C_DATA_DIV_DBCONNECT:
            if ($NC.isNull($NC.G_VAR.masterData.REMOTE_ACTION_TYPE)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.009", "[DBLink]테이블명을 입력하십시오."));
                $NC.setFocus("#cboRemote_Action_Type");
                return;
            }
            // 원격액션타입이 TABLE<SELECT>일 경우 TABLE명 입력 체크
            if ($NC.G_VAR.masterData.REMOTE_ACTION_TYPE == "1" && $NC.isNull($NC.G_VAR.masterData.LINK_TABLE_NM)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.010", "[DBConnect]테이블명을 입력하십시오."));
                $NC.setFocus("#edtLink_Table_Nm");
                return;
            }
            break;
        // EXCEL
        case $ND.C_DATA_DIV_EXCEL:
            if ($NC.isNull($NC.G_VAR.masterData.XLS_FIRST_ROW)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.011", "[EXCEL]데이터첫행을 입력하십시오."));
                $NC.setFocus("#edtXls_First_Row");
                return;
            }
            break;
        // TEXT
        case $ND.C_DATA_DIV_TEXT:
            if ($NC.isNull($NC.G_VAR.masterData.TXT_DELIMETER_YN)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.012", "[TEXT]구분자사용여부를 선택하십시오."));
                $NC.setFocus("#chkTxt_Delimeter_Yn");
                return;
            }

            if ($NC.G_VAR.masterData.TXT_DELIMETER_YN == $ND.C_YES && $NC.isNull($NC.G_VAR.masterData.TXT_COL_DELIMETER)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.013", "[TEXT]구분자를 입력하십시오."));
                $NC.setFocus("#edtTxt_Col_Delimeter");
                return;
            }
            break;
        // XML
        case $ND.C_DATA_DIV_XML:
            if ($NC.isNull($NC.G_VAR.masterData.XML_TAG_ROOT)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.014", "[XML]루트태그를 입력하십시오."));
                $NC.setFocus("#edtXml_Tag_Root");
                return;
            }
            break;
        // SAP
        case $ND.C_DATA_DIV_SAP:
            if ($NC.isNull($NC.G_VAR.masterData.SAP_FUNCTION_NM)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.015", "[SAP]펑션명을 입력하십시오."));
                $NC.setFocus("#edtSAP_Function_Nm");
                return;
            }
            break;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }

    var remoteDiv = $NC.nullToDefault($NC.G_VAR.masterData.REMOTE_DIV, "");
    var isRemote = $NC.isNotNull(remoteDiv);
    var isIncorrectRemote = false;
    // 잘못 지정된 원격송수신정보 제거
    if (isRemote) {
        switch (dataDiv) {
            // DBLink는 원격송수신구분 - 설정 불가
            case $ND.C_DATA_DIV_DBLINK:
                $NC.G_VAR.masterData.REMOTE_DIV = "";
                remoteDiv = "";
                isRemote = false;
                break;
            // DBConnect는 원격송수신구분 - SQLServer, Oracle, MySQL만 가능
            case $ND.C_DATA_DIV_DBCONNECT:
                if (!remoteDiv.startsWith("3")) {
                    isIncorrectRemote = true;
                }
                break;
            // EXCEL은 원격송수신구분 - FTP, SFTP만 가능
            case $ND.C_DATA_DIV_EXCEL:
                if (!remoteDiv.startsWith("1")) {
                    isIncorrectRemote = true;
                }
                break;
            // TEXT, XML, JSON은 원격송수신구분 - FTP, SFTP, Local WebService, Remote WebService만 가능
            case $ND.C_DATA_DIV_TEXT:
            case $ND.C_DATA_DIV_XML:
            case $ND.C_DATA_DIV_JSON:
                if (!remoteDiv.startsWith("1") && !remoteDiv.startsWith("2")) {
                    isIncorrectRemote = true;
                }
                break;
            // SAP는 원격송수신구분 - SAP JCO Server, SAP RFC만 가능
            case $ND.C_DATA_DIV_SAP:
                if (!remoteDiv.startsWith("4")) {
                    isIncorrectRemote = true;
                }
                break;
        }
    }
    if (isIncorrectRemote) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.016", "원격송수신구분이 설정할 수 없는 값으로 지정되었습니다.\n원격송수신구분을 다시 설정하십시오."));
        $NC.setFocus("#cboRemote_Div");
        return;
    }

    var REPEAT_EXEC_TIME, rowData, rIndex, rCount;
    var dsRepeatTime = [ ];
    switch ($NC.getValue("#cboData_Cycle_Div")) {
        // 특정
        case "1":
            if (G_GRDSUB.data.getLength() == 0) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.017", "수행주기 데이터가 없습니다."));
                return;
            }
            for (rIndex = 0, rCount = G_GRDSUB.data.getLength(); rIndex < rCount; rIndex++) {
                rowData = G_GRDSUB.data.getItem(rIndex);
                dsRepeatTime.push(rowData.REPEAT_TIME);
            }
            dsRepeatTime.sort();
            REPEAT_EXEC_TIME = dsRepeatTime.join();
            break;
        // 반복
        case "2":
            var START_TIME = $NC.getValue("#edtStart_Time");
            var END_TIME = $NC.getValue("#edtEnd_Time");
            var REPEAT_TIME = $NC.getValue("#edtRepeat_Time");
            if ($NC.isNull(REPEAT_TIME)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.018", "수행주기를 초단위로 입력하십시오."));
                $NC.setFocus("#edtRepeat_Time");
                return;
            }
            if (Number(REPEAT_TIME) < 60) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.019", "수행주기는 60초(1분) 이상으로 지정하십시오."));
                $NC.setFocus("#edtRepeat_Time");
                return;
            }

            // 단순 반복
            if ($NC.isNull(START_TIME) && $NC.isNull(END_TIME)) {
                REPEAT_EXEC_TIME = REPEAT_TIME;
            }
            // 지정시각에 반복
            else {
                if ($NC.isNull(START_TIME)) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.020", "시작시각을 입력하십시오."));
                    $NC.setFocus("#edtStart_Time");
                    return;
                }
                if ($NC.isNull(END_TIME)) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.021", "종료시각을 입력하십시오."));
                    $NC.setFocus("#edtEnd_Time");
                    return;
                }

                var dsCheckTime, hh, mm;
                // 시작시간 체크
                dsCheckTime = START_TIME.split($NC.G_VAR.TIME_DATA_DIV);
                if (isNaN(dsCheckTime[0]) || isNaN(dsCheckTime[1])) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.022", "시작시각을 시분(00:00)형식으로 정확히 입력하십시오."));
                    $NC.setFocus("#edtStart_Time", true);
                    return;
                }

                hh = parseInt(dsCheckTime[0], 10);
                if (hh < 0 || hh > 23) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.023", "시간을 정확히 입력하십시오."));
                    $NC.setFocus("#edtStart_Time", true);
                    return;
                }
                mm = parseInt(dsCheckTime[1], 10);
                if (mm < 0 || mm > 59) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.024", "분을 정확히 입력하십시오."));
                    $NC.setFocus("#edtStart_Time", true);
                    return;
                }
                START_TIME = $NC.lPad(hh, 2) + ":" + $NC.lPad(mm, 2);

                // 종료 시간 체크
                dsCheckTime = END_TIME.split($NC.G_VAR.TIME_DATA_DIV);
                if (isNaN(dsCheckTime[0]) || isNaN(dsCheckTime[1])) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.025", "종료시각을 시분(00:00)형식으로 정확히 입력하십시오."));
                    $NC.setFocus("#edtEnd_Time", true);
                    return;
                }

                hh = parseInt(dsCheckTime[0], 10);
                if (hh < 0 || hh > 23) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.023", "시간을 정확히 입력하십시오."));
                    $NC.setFocus("#edtEnd_Time", true);
                    return;
                }
                mm = parseInt(dsCheckTime[1], 10);
                if (mm < 0 || mm > 59) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.024", "분을 정확히 입력하십시오."));
                    $NC.setFocus("#edtEnd_Time", true);
                    return;
                }
                END_TIME = $NC.lPad(hh, 2) + ":" + $NC.lPad(mm, 2);

                if (START_TIME > END_TIME) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.026", "수신주기 시작,종료시각 범위 입력오류입니다."));
                    $NC.setFocus("#edtEnd_Time");
                    return;
                }
                REPEAT_EXEC_TIME = START_TIME + $NC.G_VAR.REPEAT_DATA_DIV + END_TIME + $NC.G_VAR.REPEAT_DATA_DIV + REPEAT_TIME;
            }
            break;
    }

    // DATA_DIV별 사용하지 않는 컬럼은 값 지움
    switch (dataDiv) {
        /*----------------------------------------------------------------------------------------*/
        // DBLink
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_DBLINK:
            // DBLink
            // $NC.G_VAR.masterData.LINK_DB_NM = "";
            // $NC.G_VAR.masterData.LINK_TABLE_NM = "";
            // $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
            // EXCEL
            $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
            // TEXT
            $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
            $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
            // XML
            $NC.G_VAR.masterData.XML_TAG_ROOT = "";
            $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT_MAP = "";
            // JSON
            $NC.G_VAR.masterData.JSON_TAG_ROOT = "";
            $NC.G_VAR.masterData.JSON_TAG_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV = "";
            $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP = "";
            // SAP
            $NC.G_VAR.masterData.SAP_FUNCTION_NM = "";
            $NC.G_VAR.masterData.SAP_TABLE_NM = "";
            $NC.G_VAR.masterData.SAP_PARAM_MAP = "";
            $NC.G_VAR.masterData.SAP_RESULT_MAP = "";
            // 파일 관련
            $NC.G_VAR.masterData.EDI_DIR = "";
            // Custom Method
            $NC.G_VAR.masterData.CUSTOM_METHOD = "";
            break;

        /*----------------------------------------------------------------------------------------*/
        // DBConnect
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_DBCONNECT:
            // DBConnect
            // $NC.G_VAR.masterData.LINK_DB_NM = "";
            // $NC.G_VAR.masterData.LINK_TABLE_NM = "";
            // $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
            // EXCEL
            $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
            // TEXT
            $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
            $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
            // XML
            $NC.G_VAR.masterData.XML_TAG_ROOT = "";
            $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT_MAP = "";
            // JSON
            $NC.G_VAR.masterData.JSON_TAG_ROOT = "";
            $NC.G_VAR.masterData.JSON_TAG_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV = "";
            $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP = "";
            // SAP
            $NC.G_VAR.masterData.SAP_FUNCTION_NM = "";
            $NC.G_VAR.masterData.SAP_TABLE_NM = "";
            $NC.G_VAR.masterData.SAP_PARAM_MAP = "";
            $NC.G_VAR.masterData.SAP_RESULT_MAP = "";
            // 파일 관련
            $NC.G_VAR.masterData.EDI_DIR = "";
            break;

        /*----------------------------------------------------------------------------------------*/
        // EXCEL
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_EXCEL:
            // DBLink, DBConnect
            $NC.G_VAR.masterData.LINK_DB_NM = "";
            $NC.G_VAR.masterData.LINK_TABLE_NM = "";
            $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
            // EXCEL
            // $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
            // TEXT
            $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
            $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
            // XML
            $NC.G_VAR.masterData.XML_TAG_ROOT = "";
            $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT_MAP = "";
            // JSON
            $NC.G_VAR.masterData.JSON_TAG_ROOT = "";
            $NC.G_VAR.masterData.JSON_TAG_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV = "";
            $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP = "";
            // SAP
            $NC.G_VAR.masterData.SAP_FUNCTION_NM = "";
            $NC.G_VAR.masterData.SAP_TABLE_NM = "";
            $NC.G_VAR.masterData.SAP_PARAM_MAP = "";
            $NC.G_VAR.masterData.SAP_RESULT_MAP = "";
            // 파일 관련
            // $NC.G_VAR.masterData.EDI_DIR = "";
            break;

        /*----------------------------------------------------------------------------------------*/
        // TEXT
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_TEXT:
            // DBLink, DBConnect
            $NC.G_VAR.masterData.LINK_DB_NM = "";
            $NC.G_VAR.masterData.LINK_TABLE_NM = "";
            $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
            // EXCEL
            $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
            // TEXT
            // $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
            // $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
            // XML
            $NC.G_VAR.masterData.XML_TAG_ROOT = "";
            $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT_MAP = "";
            // JSON
            $NC.G_VAR.masterData.JSON_TAG_ROOT = "";
            $NC.G_VAR.masterData.JSON_TAG_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV = "";
            $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP = "";
            // SAP
            $NC.G_VAR.masterData.SAP_FUNCTION_NM = "";
            $NC.G_VAR.masterData.SAP_TABLE_NM = "";
            $NC.G_VAR.masterData.SAP_PARAM_MAP = "";
            $NC.G_VAR.masterData.SAP_RESULT_MAP = "";
            // 파일 관련
            // $NC.G_VAR.masterData.EDI_DIR = "";
            break;

        /*----------------------------------------------------------------------------------------*/
        // XML
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_XML:
            // DBLink, DBConnect
            $NC.G_VAR.masterData.LINK_DB_NM = "";
            $NC.G_VAR.masterData.LINK_TABLE_NM = "";
            $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
            // EXCEL
            $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
            // TEXT
            $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
            $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
            // XML
            // $NC.G_VAR.masterData.XML_TAG_ROOT = "";
            // $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
            // $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
            // $NC.G_VAR.masterData.XML_TAG_RESULT = "";
            // $NC.G_VAR.masterData.XML_TAG_RESULT_MAP = "";
            // JSON
            $NC.G_VAR.masterData.JSON_TAG_ROOT = "";
            $NC.G_VAR.masterData.JSON_TAG_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV = "";
            $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP = "";
            // SAP
            $NC.G_VAR.masterData.SAP_FUNCTION_NM = "";
            $NC.G_VAR.masterData.SAP_TABLE_NM = "";
            $NC.G_VAR.masterData.SAP_PARAM_MAP = "";
            $NC.G_VAR.masterData.SAP_RESULT_MAP = "";
            // 파일 관련
            // $NC.G_VAR.masterData.EDI_DIR = "";
            break;

        /*----------------------------------------------------------------------------------------*/
        // JSON
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_JSON:
            // DBLink, DBConnect
            $NC.G_VAR.masterData.LINK_DB_NM = "";
            $NC.G_VAR.masterData.LINK_TABLE_NM = "";
            $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
            // EXCEL
            $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
            // TEXT
            $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
            $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
            // XML
            $NC.G_VAR.masterData.XML_TAG_ROOT = "";
            $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT_MAP = "";
            // JSON
            // $NC.G_VAR.masterData.JSON_TAG_ROOT = "";
            // $NC.G_VAR.masterData.JSON_TAG_BUNCH = "";
            // $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH = "";
            // $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV = "";
            // $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = "";
            // $NC.G_VAR.masterData.JSON_TAG_RESULT = "";
            // $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP = "";
            if ($NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV != "4") {
                $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = "";
            }
            // SAP
            $NC.G_VAR.masterData.SAP_FUNCTION_NM = "";
            $NC.G_VAR.masterData.SAP_TABLE_NM = "";
            $NC.G_VAR.masterData.SAP_PARAM_MAP = "";
            $NC.G_VAR.masterData.SAP_RESULT_MAP = "";
            // 파일 관련
            // $NC.G_VAR.masterData.EDI_DIR = "";
            break;

        /*----------------------------------------------------------------------------------------*/
        // SAP
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_SAP:
            // DBLink, DBConnect
            $NC.G_VAR.masterData.LINK_DB_NM = "";
            $NC.G_VAR.masterData.LINK_TABLE_NM = "";
            $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
            // EXCEL
            $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
            // TEXT
            $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
            $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
            // XML
            $NC.G_VAR.masterData.XML_TAG_ROOT = "";
            $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT = "";
            $NC.G_VAR.masterData.XML_TAG_RESULT_MAP = "";
            // JSON
            $NC.G_VAR.masterData.JSON_TAG_ROOT = "";
            $NC.G_VAR.masterData.JSON_TAG_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH = "";
            $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV = "";
            $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT = "";
            $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP = "";
            // SAP
            // $NC.G_VAR.masterData.SAP_FUNCTION_NM = "";
            // $NC.G_VAR.masterData.SAP_TABLE_NM = "";
            // $NC.G_VAR.masterData.SAP_PARAM_MAP = "";
            // $NC.G_VAR.masterData.SAP_RESULT_MAP = "";
            // 파일 관련
            $NC.G_VAR.masterData.EDI_DIR = "";
            break;
    }

    // REMOTE_DIV별 사용하지 않는 컬럼은 값 지움
    var isFTP = remoteDiv.startsWith("1");
    var isWS = remoteDiv.startsWith("2");
    var isLocalWS = remoteDiv == "20";
    var isRemoteWS = remoteDiv == "21";
    var isWSMethod = isRemoteWS && $NC.isNotNull($NC.G_VAR.masterData.WEBSERVICE_DIV);
    var isWSRESTful = isWSMethod && $NC.G_VAR.masterData.WEBSERVICE_DIV.startsWith("1");
    var isWSSOAP = isWSMethod && $NC.G_VAR.masterData.WEBSERVICE_DIV == "20";
    var isWSAuth = isWSMethod && $NC.isNotNull($NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV);
    var isWSOAuth = isWSAuth && $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV == "2";
    var isDBConn = remoteDiv.startsWith("3");
    var isDBProcedureCall = isDBConn && $NC.G_VAR.masterData.REMOTE_ACTION_TYPE == "3";
    var isSAP = remoteDiv.startsWith("4");
    var isSAPServer = remoteDiv == "40";

    // 원격송수신 미지정시 초기화
    if (!isRemote) {
        // 원격송수신구분
        $NC.G_VAR.masterData.REMOTE_DIV = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL
        $NC.G_VAR.masterData.REMOTE_IP = "";
        $NC.G_VAR.masterData.REMOTE_PORT = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        $NC.G_VAR.masterData.REMOTE_USER_ID = "";
        $NC.G_VAR.masterData.REMOTE_USER_PWD = "";
        // SQLServer, Oracle, MySQL
        $NC.G_VAR.masterData.REMOTE_ACTION_TYPE = "";
        $NC.G_VAR.masterData.REMOTE_PARAM_MAP = "";
        // FTP, SFTP
        $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = "";
        $NC.G_VAR.masterData.REMOTE_CHARSET = "";
        $NC.G_VAR.masterData.REMOTE_DIR = "";
        // 웹서비스구분
        $NC.G_VAR.masterData.WEBSERVICE_DIV = "";
        // Local WebService
        $NC.G_VAR.masterData.PKG_NM = "";
        $NC.G_VAR.masterData.PKG_PARAM_MAP = "";
        // Remote WebService - RESTful, SOAP
        $NC.G_VAR.masterData.WEBSERVICE_URL = "";
        $NC.G_VAR.masterData.WEBSERVICE_HEADER_VAL = "";
        // Remote WebService - SOAP
        $NC.G_VAR.masterData.WEBSERVICE_METHOD = "";
        $NC.G_VAR.masterData.WEBSERVICE_NS_PREFIX = "";
        $NC.G_VAR.masterData.WEBSERVICE_NS_URI = "";
        $NC.G_VAR.masterData.WEBSERVICE_TAG_RESULT = "";
        // Remote WebService - RESTful
        $NC.G_VAR.masterData.WEBSERVICE_PARAM_NM = "";
        $NC.G_VAR.masterData.WEBSERVICE_PARAM_VAL = "";
        // 웹서비스인증구분
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV = "";
        // 웹서비스인증구분 - OAuth
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_URL = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_TYPE = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_CID = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_CSECRET = "";
        // 파일관련
        $NC.G_VAR.masterData.PREFIX_FILE_NM = "";
    }
    // FTP, SFTP
    else if (isFTP) {
        // 원격송수신구분
        // $NC.G_VAR.masterData.REMOTE_DIV = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL
        // $NC.G_VAR.masterData.REMOTE_IP = "";
        // $NC.G_VAR.masterData.REMOTE_PORT = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        // $NC.G_VAR.masterData.REMOTE_USER_ID = "";
        // $NC.G_VAR.masterData.REMOTE_USER_PWD = "";
        // SQLServer, Oracle, MySQL
        $NC.G_VAR.masterData.REMOTE_ACTION_TYPE = "";
        $NC.G_VAR.masterData.REMOTE_PARAM_MAP = "";
        // FTP, SFTP
        // $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = "";
        // $NC.G_VAR.masterData.REMOTE_CHARSET = "";
        // $NC.G_VAR.masterData.REMOTE_DIR = "";
        // 웹서비스구분
        $NC.G_VAR.masterData.WEBSERVICE_DIV = "";
        // Local WebService
        $NC.G_VAR.masterData.PKG_NM = "";
        $NC.G_VAR.masterData.PKG_PARAM_MAP = "";
        // Remote WebService - RESTful, SOAP
        $NC.G_VAR.masterData.WEBSERVICE_URL = "";
        $NC.G_VAR.masterData.WEBSERVICE_HEADER_VAL = "";
        // Remote WebService - SOAP
        $NC.G_VAR.masterData.WEBSERVICE_METHOD = "";
        $NC.G_VAR.masterData.WEBSERVICE_NS_PREFIX = "";
        $NC.G_VAR.masterData.WEBSERVICE_NS_URI = "";
        $NC.G_VAR.masterData.WEBSERVICE_TAG_RESULT = "";
        // Remote WebService - RESTful
        $NC.G_VAR.masterData.WEBSERVICE_PARAM_NM = "";
        $NC.G_VAR.masterData.WEBSERVICE_PARAM_VAL = "";
        // 웹서비스인증구분
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV = "";
        // 웹서비스인증구분 - OAuth
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_URL = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_TYPE = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_CID = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_CSECRET = "";
        // 파일관련
        // $NC.G_VAR.masterData.PREFIX_FILE_NM = "";
    }
    // Local WebService, Remote WebService
    else if (isWS) {
        // 원격송수신구분
        // $NC.G_VAR.masterData.REMOTE_DIV = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL
        $NC.G_VAR.masterData.REMOTE_IP = "";
        $NC.G_VAR.masterData.REMOTE_PORT = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        if (!isWSAuth) {
            $NC.G_VAR.masterData.REMOTE_USER_ID = "";
            $NC.G_VAR.masterData.REMOTE_USER_PWD = "";
        }
        // SQLServer, Oracle, MySQL
        $NC.G_VAR.masterData.REMOTE_ACTION_TYPE = "";
        $NC.G_VAR.masterData.REMOTE_PARAM_MAP = "";
        // FTP, SFTP
        $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = "";
        $NC.G_VAR.masterData.REMOTE_CHARSET = "";
        $NC.G_VAR.masterData.REMOTE_DIR = "";
        // 웹서비스구분
        // $NC.G_VAR.masterData.WEBSERVICE_DIV = "";
        // Local WebService
        if (!isLocalWS) {
            $NC.G_VAR.masterData.PKG_NM = "";
            $NC.G_VAR.masterData.PKG_PARAM_MAP = "";
        }
        // Remote WebService - RESTful, SOAP
        if (!isWSMethod) {
            $NC.G_VAR.masterData.WEBSERVICE_URL = "";
            $NC.G_VAR.masterData.WEBSERVICE_HEADER_VAL = "";
        }
        // Remote WebService - SOAP
        if (!isWSSOAP) {
            $NC.G_VAR.masterData.WEBSERVICE_METHOD = "";
            $NC.G_VAR.masterData.WEBSERVICE_NS_PREFIX = "";
            $NC.G_VAR.masterData.WEBSERVICE_NS_URI = "";
            $NC.G_VAR.masterData.WEBSERVICE_TAG_RESULT = "";
        }
        // Remote WebService - RESTful
        if (!isWSRESTful) {
            $NC.G_VAR.masterData.WEBSERVICE_PARAM_NM = "";
            $NC.G_VAR.masterData.WEBSERVICE_PARAM_VAL = "";
        }
        // 웹서비스인증구분
        if (!isWSMethod) {
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV = "";
        }
        // 웹서비스인증구분 - OAuth
        if (!isWSOAuth) {
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_URL = "";
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_TYPE = "";
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_CID = "";
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_CSECRET = "";
        }
        // 파일관련
        $NC.G_VAR.masterData.PREFIX_FILE_NM = "";
    }
    // DBConnect
    else if (isDBConn) {
        // 원격송수신구분
        // $NC.G_VAR.masterData.REMOTE_DIV = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL
        // $NC.G_VAR.masterData.REMOTE_IP = "";
        // $NC.G_VAR.masterData.REMOTE_PORT = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        // $NC.G_VAR.masterData.REMOTE_USER_ID = "";
        // $NC.G_VAR.masterData.REMOTE_USER_PWD = "";
        // SQLServer, Oracle, MySQL
        // $NC.G_VAR.masterData.REMOTE_ACTION_TYPE = "";
        if (!isDBProcedureCall) {
            $NC.G_VAR.masterData.REMOTE_PARAM_MAP = "";
        }
        // FTP, SFTP
        $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = "";
        $NC.G_VAR.masterData.REMOTE_CHARSET = "";
        $NC.G_VAR.masterData.REMOTE_DIR = "";
        // 웹서비스구분
        $NC.G_VAR.masterData.WEBSERVICE_DIV = "";
        // Local WebService
        $NC.G_VAR.masterData.PKG_NM = "";
        $NC.G_VAR.masterData.PKG_PARAM_MAP = "";
        // Remote WebService - RESTful, SOAP
        $NC.G_VAR.masterData.WEBSERVICE_URL = "";
        $NC.G_VAR.masterData.WEBSERVICE_HEADER_VAL = "";
        // Remote WebService - SOAP
        $NC.G_VAR.masterData.WEBSERVICE_METHOD = "";
        $NC.G_VAR.masterData.WEBSERVICE_NS_PREFIX = "";
        $NC.G_VAR.masterData.WEBSERVICE_NS_URI = "";
        $NC.G_VAR.masterData.WEBSERVICE_TAG_RESULT = "";
        // Remote WebService - RESTful
        $NC.G_VAR.masterData.WEBSERVICE_PARAM_NM = "";
        $NC.G_VAR.masterData.WEBSERVICE_PARAM_VAL = "";
        // 웹서비스인증구분
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV = "";
        // 웹서비스인증구분 - OAuth
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_URL = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_TYPE = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_CID = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_CSECRET = "";
        // 파일관련
        $NC.G_VAR.masterData.PREFIX_FILE_NM = "";
    }
    // SAP
    else if (isSAP) {
        // 원격송수신구분
        // $NC.G_VAR.masterData.REMOTE_DIV = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL
        $NC.G_VAR.masterData.REMOTE_IP = "";
        $NC.G_VAR.masterData.REMOTE_PORT = "";
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        $NC.G_VAR.masterData.REMOTE_USER_ID = "";
        $NC.G_VAR.masterData.REMOTE_USER_PWD = "";
        // SQLServer, Oracle, MySQL
        $NC.G_VAR.masterData.REMOTE_ACTION_TYPE = "";
        $NC.G_VAR.masterData.REMOTE_PARAM_MAP = "";
        // FTP, SFTP
        $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = "";
        $NC.G_VAR.masterData.REMOTE_CHARSET = "";
        $NC.G_VAR.masterData.REMOTE_DIR = "";
        // 웹서비스구분
        $NC.G_VAR.masterData.WEBSERVICE_DIV = "";
        // Local WebService
        $NC.G_VAR.masterData.PKG_NM = "";
        $NC.G_VAR.masterData.PKG_PARAM_MAP = "";
        // Remote WebService - RESTful, SOAP
        $NC.G_VAR.masterData.WEBSERVICE_URL = "";
        $NC.G_VAR.masterData.WEBSERVICE_HEADER_VAL = "";
        // Remote WebService - SOAP
        $NC.G_VAR.masterData.WEBSERVICE_METHOD = "";
        $NC.G_VAR.masterData.WEBSERVICE_NS_PREFIX = "";
        $NC.G_VAR.masterData.WEBSERVICE_NS_URI = "";
        $NC.G_VAR.masterData.WEBSERVICE_TAG_RESULT = "";
        // Remote WebService - RESTful
        $NC.G_VAR.masterData.WEBSERVICE_PARAM_NM = "";
        $NC.G_VAR.masterData.WEBSERVICE_PARAM_VAL = "";
        // 웹서비스인증구분
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV = "";
        // 웹서비스인증구분 - OAuth
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_URL = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_TYPE = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_CID = "";
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_CSECRET = "";
        // 파일관련
        $NC.G_VAR.masterData.PREFIX_FILE_NM = "";

        // SAP JCO Server일 경우 SAP_PARAM_MAP 제거
        if (isSAPServer) {
            $NC.G_VAR.masterData.SAP_PARAM_MAP = "";
        }
    }

    var dsMaster = [
        {
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_EDI_DIV: $NC.G_VAR.masterData.EDI_DIV,
            P_DEFINE_DIV: $NC.G_VAR.masterData.DEFINE_DIV,
            P_DEFINE_NO: $NC.G_VAR.masterData.DEFINE_NO,
            P_DEFINE_NM: $NC.G_VAR.masterData.DEFINE_NM,
            P_DATA_DIV: $NC.G_VAR.masterData.DATA_DIV,
            // DBLink, DBConnect
            P_LINK_DB_NM: $NC.G_VAR.masterData.LINK_DB_NM,
            P_LINK_TABLE_NM: $NC.G_VAR.masterData.LINK_TABLE_NM,
            P_LINK_WHERE_TEXT: $NC.G_VAR.masterData.LINK_WHERE_TEXT,
            // EXCEL
            P_XLS_FIRST_ROW: $NC.G_VAR.masterData.XLS_FIRST_ROW,
            // TEXT
            P_TXT_DELIMETER_YN: $NC.G_VAR.masterData.TXT_DELIMETER_YN,
            P_TXT_COL_DELIMETER: $NC.G_VAR.masterData.TXT_COL_DELIMETER,
            // XML
            P_XML_TAG_ROOT: $NC.G_VAR.masterData.XML_TAG_ROOT,
            P_XML_TAG_BUNCH: $NC.G_VAR.masterData.XML_TAG_BUNCH,
            P_XML_TAG_SUB_BUNCH: $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH,
            P_XML_TAG_RESULT: $NC.G_VAR.masterData.XML_TAG_RESULT,
            P_XML_TAG_RESULT_MAP: $NC.G_VAR.masterData.XML_TAG_RESULT_MAP,
            // JSON
            P_JSON_TAG_ROOT: $NC.G_VAR.masterData.JSON_TAG_ROOT,
            P_JSON_TAG_BUNCH: $NC.G_VAR.masterData.JSON_TAG_BUNCH,
            P_JSON_TAG_SUB_BUNCH: $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH,
            P_JSON_TAG_STRUCT_DIV: $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV,
            P_JSON_TAG_LINK_MAP: $NC.G_VAR.masterData.JSON_TAG_LINK_MAP,
            P_JSON_TAG_RESULT: $NC.G_VAR.masterData.JSON_TAG_RESULT,
            P_JSON_TAG_RESULT_MAP: $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP,
            // SAP
            P_SAP_FUNCTION_NM: $NC.G_VAR.masterData.SAP_FUNCTION_NM,
            P_SAP_TABLE_NM: $NC.G_VAR.masterData.SAP_TABLE_NM,
            P_SAP_PARAM_MAP: $NC.G_VAR.masterData.SAP_PARAM_MAP,
            P_SAP_RESULT_MAP: $NC.G_VAR.masterData.SAP_RESULT_MAP,
            // 원격송수신구분
            P_REMOTE_DIV: $NC.G_VAR.masterData.REMOTE_DIV,
            // FTP, SFTP, SQLServer, Oracle, MySQL
            P_REMOTE_IP: $NC.G_VAR.masterData.REMOTE_IP,
            P_REMOTE_PORT: $NC.G_VAR.masterData.REMOTE_PORT,
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            P_REMOTE_USER_ID: $NC.G_VAR.masterData.REMOTE_USER_ID,
            P_REMOTE_USER_PWD: $NC.G_VAR.masterData.REMOTE_USER_PWD,
            // SQLServer, Oracle, MySQL
            P_REMOTE_ACTION_TYPE: $NC.G_VAR.masterData.REMOTE_ACTION_TYPE,
            P_REMOTE_PARAM_MAP: $NC.G_VAR.masterData.REMOTE_PARAM_MAP,
            // FTP, SFTP
            P_REMOTE_PASSIVE_YN: $NC.G_VAR.masterData.REMOTE_PASSIVE_YN,
            P_REMOTE_CHARSET: $NC.G_VAR.masterData.REMOTE_CHARSET,
            P_REMOTE_DIR: $NC.G_VAR.masterData.REMOTE_DIR,
            // 웹서비스구분
            P_WEBSERVICE_DIV: $NC.G_VAR.masterData.WEBSERVICE_DIV,
            // Local WebService
            P_PKG_NM: $NC.G_VAR.masterData.PKG_NM,
            P_PKG_PARAM_MAP: $NC.G_VAR.masterData.PKG_PARAM_MAP,
            // Remote WebService - RESTful, SOAP
            P_WEBSERVICE_URL: $NC.G_VAR.masterData.WEBSERVICE_URL,
            P_WEBSERVICE_HEADER_VAL: $NC.G_VAR.masterData.WEBSERVICE_HEADER_VAL,
            // Remote WebService - SOAP
            P_WEBSERVICE_METHOD: $NC.G_VAR.masterData.WEBSERVICE_METHOD,
            P_WEBSERVICE_NS_PREFIX: $NC.G_VAR.masterData.WEBSERVICE_NS_PREFIX,
            P_WEBSERVICE_NS_URI: $NC.G_VAR.masterData.WEBSERVICE_NS_URI,
            P_WEBSERVICE_TAG_RESULT: $NC.G_VAR.masterData.WEBSERVICE_TAG_RESULT,
            // Remote WebService - RESTful
            P_WEBSERVICE_PARAM_NM: $NC.G_VAR.masterData.WEBSERVICE_PARAM_NM,
            P_WEBSERVICE_PARAM_VAL: $NC.G_VAR.masterData.WEBSERVICE_PARAM_VAL,
            // 웹서비스인증구분
            P_WEBSERVICE_AUTH_DIV: $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV,
            // Remote WebService - OAuth
            P_WEBSERVICE_AUTH_URL: $NC.G_VAR.masterData.WEBSERVICE_AUTH_URL,
            P_WEBSERVICE_AUTH_TYPE: $NC.G_VAR.masterData.WEBSERVICE_AUTH_TYPE,
            P_WEBSERVICE_AUTH_CID: $NC.G_VAR.masterData.WEBSERVICE_AUTH_CID,
            P_WEBSERVICE_AUTH_CSECRET: $NC.G_VAR.masterData.WEBSERVICE_AUTH_CSECRET,
            // Custom Method
            P_CUSTOM_METHOD: $NC.G_VAR.masterData.CUSTOM_METHOD,
            // 파일 관련
            P_EDI_DIR: $NC.G_VAR.masterData.EDI_DIR,
            P_PREFIX_FILE_NM: $NC.G_VAR.masterData.PREFIX_FILE_NM,
            // 자동실행
            P_AUTO_EXEC_YN: $NC.G_VAR.masterData.AUTO_EXEC_YN,
            P_DATA_CYCLE_DIV: $NC.G_VAR.masterData.DATA_CYCLE_DIV,
            P_REPEAT_EXEC_TIME: REPEAT_EXEC_TIME,
            // 기타
            P_REMARK1: $NC.G_VAR.masterData.REMARK1,
            P_CRUD: $NC.G_VAR.masterData.CRUD
        }
    ];

    var isDB = dataDiv == $ND.C_DATA_DIV_DBLINK || dataDiv == $ND.C_DATA_DIV_DBCONNECT || dataDiv == $ND.C_DATA_DIV_SAP;
    var isEXCEL = dataDiv == $ND.C_DATA_DIV_EXCEL;
    var isTEXT = dataDiv == $ND.C_DATA_DIV_TEXT;
    var isXML = dataDiv == $ND.C_DATA_DIV_XML;
    var isJSON = dataDiv == $ND.C_DATA_DIV_JSON;

    var dsDetail = [ ];
    var dsTarget = G_GRDDETAIL.data.getItems();
    for (rIndex = 0, rCount = dsTarget.length; rIndex < rCount; rIndex++) {
        rowData = dsTarget[rIndex];
        if (rowData.CRUD == $ND.C_DV_CRUD_R) {
            continue;
        }
        dsDetail.push({
            P_BU_CD: $NC.G_VAR.masterData.BU_CD,
            P_EDI_DIV: $NC.G_VAR.masterData.EDI_DIV,
            P_DEFINE_NO: $NC.G_VAR.masterData.DEFINE_NO,
            P_COLUMN_NM: rowData.COLUMN_NM,
            P_COLUMN_ID: rowData.COLUMN_ID,
            P_LINK_COLUMN_NM: isDB ? rowData.LINK_COLUMN_NM : null,
            P_XLS_COLUMN_NM: isEXCEL ? rowData.XLS_COLUMN_NM : null,
            P_TXT_POSITION: isTEXT ? rowData.TXT_POSITION : null,
            P_TXT_LENGTH: isTEXT ? rowData.TXT_LENGTH : null,
            P_XML_TAG_NM: isXML ? rowData.XML_TAG_NM : null,
            P_XML_TAG_ATTR: isXML ? rowData.XML_TAG_ATTR : null,
            P_JSON_COLUMN_NM: isJSON ? rowData.JSON_COLUMN_NM : null,
            P_DATA_TYPE: rowData.DATA_TYPE,
            P_DATA_NULL_YN: rowData.DATA_NULL_YN,
            P_DATA_DEFAULT: rowData.DATA_DEFAULT,
            P_DATA_CHANGE_SQL: rowData.DATA_CHANGE_SQL,
            P_DATE_FORMAT_DIV: rowData.DATE_FORMAT_DIV,
            P_DATE_INPUT_DIV: rowData.DATE_INPUT_DIV,
            P_IF_CODE_GRP: rowData.IF_CODE_GRP,
            P_REMARK1: rowData.REMARK1,
            P_CRUD: rowData.CRUD
        });
    }

    if (dsDetail.length == 0) {
        if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
            alert($NC.getDisplayMsg("JS.EDR01011P0.027", "데이터 수정 후 저장하십시오."));
            return;
        } else if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_C) {
            alert($NC.getDisplayMsg("JS.EDR01011P0.051", "상세내역 추가 후 저장하십시오."));
            return;
        }
    }

    $NC.serviceCall("/EDR01010E0/save.do", {
        P_DS_MASTER: dsMaster,
        P_DS_DETAIL: dsDetail,
        P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

    var dsCheckTime, hh, mm;
    switch (args.col) {
        case "EDI_DIV":
            $NC.G_VAR.masterData.EDI_DIV = args.val;
            $NC.clearGridData(G_GRDDETAIL);
            break;
        case "DEFINE_NO":
            $NC.G_VAR.masterData.DEFINE_NO = args.val;
            break;
        case "DEFINE_NM":
            $NC.G_VAR.masterData.DEFINE_NM = args.val;
            break;
        case "DATA_DIV":
            setDataDivChange(args.val, true);
            $NC.G_VAR.masterData.DATA_DIV = args.val;
            $NC.clearGridData(G_GRDDETAIL);
            grdDetailOnSetColumns($NC.G_VAR.masterData);
            break;
        case "DEFINE_DIV":
            $NC.G_VAR.masterData.DEFINE_DIV = args.val;
            break;
        // DBLink, DBConnect
        case "LINK_DB_NM":
            $NC.G_VAR.masterData.LINK_DB_NM = args.val;
            break;
        case "LINK_TABLE_NM":
            $NC.G_VAR.masterData.LINK_TABLE_NM = args.val;
            break;
        case "LINK_WHERE_TEXT":
            $NC.G_VAR.masterData.LINK_WHERE_TEXT = args.val;
            break;
        // EXCEL
        case "XLS_FIRST_ROW":
            if (isNaN(args.val)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.028", "숫자만 입력 가능합니다."));
                $NC.setValue(args.view);
                return;
            }
            $NC.G_VAR.masterData.XLS_FIRST_ROW = args.val;
            break;
        // TEXT
        case "TXT_DELIMETER_YN":
            $NC.G_VAR.masterData.TXT_DELIMETER_YN = args.val == $ND.C_YES ? args.val : $ND.C_NO;
            $NC.setEnable("#edtTxt_Col_Delimeter", $NC.G_VAR.masterData.TXT_DELIMETER_YN == $ND.C_YES);
            if ($NC.G_VAR.masterData.TXT_DELIMETER_YN != $ND.C_YES) {
                $NC.setValue("#edtTxt_Col_Delimeter");
                $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
            }
            break;
        case "TXT_COL_DELIMETER":
            $NC.G_VAR.masterData.TXT_COL_DELIMETER = args.val;
            break;
        // XML
        case "XML_TAG_ROOT":
            $NC.G_VAR.masterData.XML_TAG_ROOT = args.val;
            break;
        case "XML_TAG_BUNCH":
            $NC.G_VAR.masterData.XML_TAG_BUNCH = args.val;
            break;
        case "XML_TAG_SUB_BUNCH":
            $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = args.val;
            break;
        case "XML_TAG_RESULT":
            $NC.G_VAR.masterData.XML_TAG_RESULT = args.val;
            break;
        case "XML_TAG_RESULT_MAP":
            $NC.G_VAR.masterData.XML_TAG_RESULT_MAP = args.val;
            break;
        // JSON
        case "JSON_TAG_ROOT":
            $NC.G_VAR.masterData.JSON_TAG_ROOT = args.val;
            break;
        case "JSON_TAG_BUNCH":
            $NC.G_VAR.masterData.JSON_TAG_BUNCH = args.val;
            break;
        case "JSON_TAG_SUB_BUNCH":
            $NC.G_VAR.masterData.JSON_TAG_SUB_BUNCH = args.val;
            break;
        case "JSON_TAG_STRUCT_DIV":
            $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV = args.val;
            if ($NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV != "4") {
                $NC.setValue("#edtJson_Tag_Link_Map");
                $NC.setEnable("#edtJson_Tag_Link_Map", false);
            } else {
                $NC.setEnable("#edtJson_Tag_Link_Map");
            }
            break;
        case "JSON_TAG_LINK_MAP":
            $NC.G_VAR.masterData.JSON_TAG_LINK_MAP = args.val;
            break;
        case "JSON_TAG_RESULT":
            $NC.G_VAR.masterData.JSON_TAG_RESULT = args.val;
            break;
        case "JSON_TAG_RESULT_MAP":
            $NC.G_VAR.masterData.JSON_TAG_RESULT_MAP = args.val;
            break;
        // SAP
        case "SAP_FUNCTION_NM":
            $NC.G_VAR.masterData.SAP_FUNCTION_NM = args.val;
            break;
        case "SAP_TABLE_NM":
            $NC.G_VAR.masterData.SAP_TABLE_NM = args.val;
            break;
        case "SAP_PARAM_MAP":
            $NC.G_VAR.masterData.SAP_PARAM_MAP = args.val;
            break;
        case "SAP_RESULT_MAP":
            $NC.G_VAR.masterData.SAP_RESULT_MAP = args.val;
            break;
        // 원격송수신
        case "REMOTE_DIV":
            // 원격송수신 선택
            if ($NC.isNotNull(args.val)) {
                // DATA_DIV가 XLS 형식일 경우 웹서비스형식이면 에러 처리
                if ($NC.G_VAR.masterData.DATA_DIV == $ND.C_DATA_DIV_EXCEL && (args.val.startsWith("2") || args.val.startsWith("4"))) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.029", "[EXCEL]일 경우 웹서비스 또는 SAP 형식은 선택할 수 없습니다."));
                    args.val = "";
                    $NC.setValue(args.view);
                }
                // DATA_DIV가 파일 형식일 경우 DB형식이면 에러 처리
                else if ($NC.G_VAR.masterData.DATA_DIV.startsWith("3") && (args.val.startsWith("3") || args.val.startsWith("4"))) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.030", "데이터베이스 또는 SAP 형식은 선택할 수 없습니다."));
                    args.val = "";
                    $NC.setValue(args.view);
                }
                // DATA_DIV가 DBConnect 형식일 경우 DB 형식이 아니면 에러 처리
                else if ($NC.G_VAR.masterData.DATA_DIV == $ND.C_DATA_DIV_DBCONNECT && !args.val.startsWith("3")) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.031", "데이터베이스 접속 형식을 선택하십시오."));
                    args.val = "";
                    $NC.setValue(args.view);
                }
                // DATA_DIV가 SAP일 경우 SAP 형식이 아니면 에러 처리
                else if ($NC.G_VAR.masterData.DATA_DIV == $ND.C_DATA_DIV_SAP && !args.val.startsWith("4")) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.032", "[SAP]일 경우 SAP 형식을 선택하십시오."));
                    args.val = "";
                    $NC.setValue(args.view);
                }
            }
            // 원격 송수신 해제
            else {
                // 자동실행이 선택되어 있을 경우 해제
                if ($NC.G_VAR.masterData.AUTO_EXEC_YN == $ND.C_YES) {
                    $("#chkAuto_Exec_Yn").click();
                }
            }

            setRemoteDivChange(args.val);
            $NC.G_VAR.masterData.REMOTE_DIV = args.val;
            break;
        case "REMOTE_IP":
            $NC.G_VAR.masterData.REMOTE_IP = args.val;
            break;
        case "REMOTE_PORT":
            $NC.G_VAR.masterData.REMOTE_PORT = args.val;
            break;
        case "REMOTE_PASSIVE_YN":
            $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = args.val;
            break;
        case "REMOTE_USER_ID":
            $NC.G_VAR.masterData.REMOTE_USER_ID = args.val;
            break;
        case "REMOTE_USER_PWD":
            $NC.G_VAR.masterData.REMOTE_USER_PWD = args.val;
            break;
        case "REMOTE_ACTION_TYPE":
            setRemoteActionTypeChange(args.val);
            $NC.G_VAR.masterData.REMOTE_ACTION_TYPE = args.val;
            break;
        case "REMOTE_PARAM_MAP":
            $NC.G_VAR.masterData.REMOTE_PARAM_MAP = args.val;
            break;
        case "REMOTE_DIR":
            $NC.G_VAR.masterData.REMOTE_DIR = args.val;
            break;
        case "REMOTE_CHARSET":
            $NC.G_VAR.masterData.REMOTE_CHARSET = args.val;
            break;
        // 웹서비스
        case "WEBSERVICE_DIV":
            setWebServiceDivChange(args.val);
            $NC.G_VAR.masterData.WEBSERVICE_DIV = args.val;
            break;
        case "WEBSERVICE_URL":
            $NC.G_VAR.masterData.WEBSERVICE_URL = args.val;
            break;
        case "WEBSERVICE_HEADER_VAL":
            $NC.G_VAR.masterData.WEBSERVICE_HEADER_VAL = args.val;
            break;
        case "WEBSERVICE_METHOD":
            $NC.G_VAR.masterData.WEBSERVICE_METHOD = args.val;
            break;
        case "WEBSERVICE_NS_PREFIX":
            $NC.G_VAR.masterData.WEBSERVICE_NS_PREFIX = args.val;
            break;
        case "WEBSERVICE_NS_URI":
            $NC.G_VAR.masterData.WEBSERVICE_NS_URI = args.val;
            break;
        case "WEBSERVICE_TAG_RESULT":
            $NC.G_VAR.masterData.WEBSERVICE_TAG_RESULT = args.val;
            break;
        case "WEBSERVICE_PARAM_NM":
            $NC.G_VAR.masterData.WEBSERVICE_PARAM_NM = args.val;
            break;
        case "WEBSERVICE_PARAM_VAL":
            $NC.G_VAR.masterData.WEBSERVICE_PARAM_VAL = args.val;
            break;
        case "WEBSERVICE_AUTH_DIV":
            if (args.val == "2") {
                // 웹서비스가 SOAP일 경우 인증구분은 1 - Basic 인증만 가능
                if ($NC.G_VAR.masterData.WEBSERVICE_DIV == "20") {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.033", "SOAP 방식 인증은 BASIC 인증만 처리 가능합니다."));
                    args.val = "";
                    $NC.setValue(args.view);
                }
            }
            setWebServiceAuthDivChange(args.val);
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV = args.val;
            break;
        case "WEBSERVICE_AUTH_URL":
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_URL = args.val;
            break;
        case "WEBSERVICE_AUTH_TYPE":
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_TYPE = args.val;
            break;
        case "WEBSERVICE_AUTH_CID":
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_CID = args.val;
            break;
        case "WEBSERVICE_AUTH_CSECRET":
            $NC.G_VAR.masterData.WEBSERVICE_AUTH_CSECRET = args.val;
            break;
        case "CUSTOM_METHOD":
            $NC.G_VAR.masterData.CUSTOM_METHOD = args.val;
            break;
        case "PKG_NM":
            $NC.G_VAR.masterData.PKG_NM = args.val;
            break;
        case "PKG_PARAM_MAP":
            $NC.G_VAR.masterData.PKG_PARAM_MAP = args.val;
            break;
        // 스케줄
        case "AUTO_EXEC_YN":
            if (args.val == $ND.C_YES) {
                // 수신 오류 재처리를 위해 Local WebService도 스케줄 가능하게 체크 제외
                // if ($NC.G_VAR.masterData.REMOTE_DIV == "20") {
                // alert($NC.getDisplayMsg("JS.EDR01011P0.034", "원격송수신구분[20 - Local WebService]은 자동수행 할 수 없습니다."));
                // args.val = $ND.C_NO;
                // $NC.setValue("#chkAuto_Exec_Yn", args.val);
                // } else
                if ($NC.G_VAR.masterData.DATA_DIV != $ND.C_DATA_DIV_DBLINK && $NC.isNull($NC.G_VAR.masterData.REMOTE_DIV)) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.035", "원격송수신 정보를 먼저 지정하십시오."));
                    args.val = $ND.C_NO;
                    $NC.setValue(args.view, args.val);
                }
            }
            $NC.G_VAR.masterData.AUTO_EXEC_YN = args.val == $ND.C_YES ? args.val : $ND.C_NO;
            if ($NC.G_VAR.masterData.AUTO_EXEC_YN == $ND.C_YES) {
                setEnableWithVisible("#cboData_Cycle_Div", true);
                $NC.setValue("#cboData_Cycle_Div", "1");
                $NC.G_VAR.masterData.DATA_CYCLE_DIV = "1";
                $("#divDataCycleView1").show();
                $("#divDataCycleView2").hide();
            } else {
                setEnableWithVisible("#cboData_Cycle_Div", false);
                $NC.setValue("#cboData_Cycle_Div");
                $NC.G_VAR.masterData.DATA_CYCLE_DIV = "";
                $NC.G_VAR.masterData.REPEAT_EXEC_TIME = "";
                $NC.clearGridData(G_GRDSUB);
                $("#divDataCycleView1").hide();
                $("#divDataCycleView2").hide();
            }
            break;
        case "DATA_CYCLE_DIV":
            $NC.G_VAR.masterData.DATA_CYCLE_DIV = args.val;
            if (args.val == "1") {
                $("#divDataCycleView1").show();
                $("#divDataCycleView2").hide();
            } else if (args.val == "2") {
                $("#divDataCycleView1").hide();
                $("#divDataCycleView2").show();
            } else {
                $("#divDataCycleView1").hide();
                $("#divDataCycleView2").hide();
            }
            break;
        case "START_TIME":
        case "END_TIME":
            if ($NC.isNotNull(args.val)) {
                dsCheckTime = args.val.split($NC.G_VAR.TIME_DATA_DIV);
                if (isNaN(dsCheckTime[0]) || isNaN(dsCheckTime[1])) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.036", "시각을 시분(00:00)형식으로 정확히 입력하십시오."));
                    $NC.setFocus(args.view, true);
                    return;
                }

                hh = parseInt(dsCheckTime[0], 10);
                if (hh < 0 || hh > 23) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.023", "시간을 정확히 입력하십시오."));
                    $NC.setFocus(args.view, true);
                    return;
                }
                mm = parseInt(dsCheckTime[1], 10);
                if (Number(mm) < 0 || Number(mm) > 59) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.024", "분을 정확히 입력하십시오."));
                    $NC.setFocus(args.view, true);
                    return;
                }
                $NC.setValue(args.view, $NC.lPad(hh, 2) + $NC.G_VAR.TIME_DATA_DIV + $NC.lPad(mm, 2));
            }
            break;
        case "REPEAT_TIME":
            if ($NC.isNull(args.val)) {
                break;
            }
            var REPEAT_TIME = parseInt(args.val, 10);
            if (REPEAT_TIME < 60) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.019", "수행주기는 60초(1분) 이상으로 지정하십시오."));
                $NC.setFocus(args.view, true);
                return;
            }
            break;
        // 기타
        case "EDI_DIR":
            $NC.G_VAR.masterData.EDI_DIR = args.val;
            break;
        case "PREFIX_FILE_NM":
            $NC.G_VAR.masterData.PREFIX_FILE_NM = args.val;
            break;
        case "REMARK1":
            $NC.G_VAR.masterData.REMARK1 = args.val;
            break;
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }
}

function setDataDivChange(dataDiv, initialize) {

    var remoteDiv = /*--------*/initialize ? "" /*---*/: $NC.nullToDefault($NC.G_VAR.masterData.REMOTE_DIV, "");
    var webServiceDiv = /*----*/initialize ? "" /*---*/: $NC.nullToDefault($NC.G_VAR.masterData.WEBSERVICE_DIV, "");
    var webServiceAuthDiv = /**/initialize ? "" /*---*/: $NC.nullToDefault($NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV, "");
    var remoteActionType = /*-*/initialize ? "" /*---*/: $NC.nullToDefault($NC.G_VAR.masterData.REMOTE_ACTION_TYPE, "");

    var isRemote = $NC.isNotNull(remoteDiv);
    var isFTP = remoteDiv.startsWith("1");
    // var isWS = remoteDiv.startsWith("2");
    var isLocalWS = remoteDiv == "20";
    var isRemoteWS = remoteDiv == "21";
    var isWSMethod = isRemoteWS && $NC.isNotNull(webServiceDiv);
    var isWSRESTful = isWSMethod && webServiceDiv.startsWith("1");
    var isWSSOAP = isWSMethod && webServiceDiv == "20";
    var isWSAuth = isWSMethod && $NC.isNotNull(webServiceAuthDiv);
    var isWSOAuth = isWSAuth && webServiceAuthDiv == "2";
    var isDBConn = remoteDiv.startsWith("3");
    var isDBProcedureCall = isDBConn && remoteActionType == "3";

    switch (dataDiv) {
        /*----------------------------------------------------------------------------------------*/
        // DBLink일 경우
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_DBLINK:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            setEnableWithVisible("#edtLink_Db_Nm");
            setEnableWithVisible("#edtLink_Table_Nm");
            setEnableWithVisible("#edtLink_Where_Text");
            // EXCEL
            setEnableWithVisible("#edtXls_First_Row", false);
            // TEXT
            setEnableWithVisible("#chkTxt_Delimeter_Yn", false);
            setEnableWithVisible("#edtTxt_Col_Delimeter", false);
            // XML
            setEnableWithVisible("#edtXml_Tag_Root", false);
            setEnableWithVisible("#edtXml_Tag_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Sub_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Result", false);
            setEnableWithVisible("#edtXml_Tag_Result_Map", false);
            // JSON
            setEnableWithVisible("#edtJson_Tag_Root", false);
            setEnableWithVisible("#edtJson_Tag_Bunch", false);
            setEnableWithVisible("#edtJson_Tag_Sub_Bunch", false);
            setEnableWithVisible("#cboJson_Tag_Struct_Div", false);
            setEnableWithVisible("#edtJson_Tag_Link_Map", false);
            setEnableWithVisible("#edtJson_Tag_Result", false);
            setEnableWithVisible("#edtJson_Tag_Result_Map", false);
            // SAP
            setEnableWithVisible("#edtSAP_Function_Nm", false);
            setEnableWithVisible("#edtSAP_Table_Nm", false);
            setEnableWithVisible("#edtSAP_Param_Map", false);
            setEnableWithVisible("#edtSAP_Result_Map", false);
            // 원격송수신구분
            setEnableWithVisible("#cboRemote_Div", false);
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", false);
            setEnableWithVisible("#edtRemote_Port", false);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", false);
            setEnableWithVisible("#edtRemote_User_Pwd", false);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", false);
            setEnableWithVisible("#edtRemote_Param_Map", false);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", false);
            setEnableWithVisible("#edtRemote_Charset", false);
            setEnableWithVisible("#edtRemote_Dir", false);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", false);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", false);
            // setEnableWithVisible("#edtPkg_Param_Map", false);
            // Remote WebService - RESTful, SOAP
            setEnableWithVisible("#edtWebService_Url", false);
            setEnableWithVisible("#edtWebService_Header_Val", false);
            // Remote WebService - SOAP
            setEnableWithVisible("#edtWebService_Method", false);
            setEnableWithVisible("#edtWebService_NS_Prefix", false);
            setEnableWithVisible("#edtWebService_NS_Uri", false);
            setEnableWithVisible("#edtWebService_Tag_Result", false);
            // Remote WebService - RESTful
            setEnableWithVisible("#edtWebService_Param_Nm", false);
            setEnableWithVisible("#edtWebService_Param_Val", false);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", false);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", false);
            setEnableWithVisible("#edtWebService_Auth_Type", false);
            setEnableWithVisible("#edtWebService_Auth_CId", false);
            setEnableWithVisible("#edtWebService_Auth_CSecret", false);
            // Custom Method
            setEnableWithVisible("#edtCustom_Method", false);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtEdi_Dir", false);
            setEnableWithVisible("#edtPrefix_File_Nm", false);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            if (initialize) {
                $NC.setValue("#edtLink_Db_Nm");
                $NC.setValue("#edtLink_Table_Nm");
                $NC.setValue("#edtLink_Where_Text");
            }
            // EXCEL
            $NC.setValue("#edtXls_First_Row");
            // TEXT
            $NC.setValue("#chkTxt_Delimeter_Yn", $ND.C_NO);
            $NC.setValue("#edtTxt_Col_Delimeter");
            // XML
            $NC.setValue("#edtXml_Tag_Root");
            $NC.setValue("#edtXml_Tag_Bunch");
            $NC.setValue("#edtXml_Tag_Sub_Bunch");
            $NC.setValue("#edtXml_Tag_Result");
            $NC.setValue("#edtXml_Tag_Result_Map");
            // JSON
            $NC.setValue("#edtJson_Tag_Root");
            $NC.setValue("#edtJson_Tag_Bunch");
            $NC.setValue("#edtJson_Tag_Sub_Bunch");
            $NC.setValue("#cboJson_Tag_Struct_Div");
            $NC.setValue("#edtJson_Tag_Link_Map");
            $NC.setValue("#edtJson_Tag_Result");
            $NC.setValue("#edtJson_Tag_Result_Map");
            // SAP
            $NC.setValue("#edtSAP_Function_Nm");
            $NC.setValue("#edtSAP_Table_Nm");
            $NC.setValue("#edtSAP_Param_Map");
            $NC.setValue("#edtSAP_Result_Map");
            // 원격송수신구분
            $NC.setValue("#cboRemote_Div");
            // FTP, SFTP, SQLServer, Oracle, MySQL
            $NC.setValue("#edtRemote_Ip");
            $NC.setValue("#edtRemote_Port");
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            $NC.setValue("#edtRemote_User_Id");
            $NC.setValue("#edtRemote_User_Pwd");
            // SQLServer, Oracle, MySQL
            $NC.setValue("#cboRemote_Action_Type");
            $NC.setValue("#edtRemote_Param_Map");
            // FTP, SFTP
            $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
            $NC.setValue("#edtRemote_Charset");
            $NC.setValue("#edtRemote_Dir");
            // 웹서비스구분
            $NC.setValue("#cboWebService_Div");
            // Local WebService
            // $NC.setValue("#edtPkg_Nm");
            // $NC.setValue("#edtPkg_Param_Map");
            // Remote WebService - RESTful, SOAP
            $NC.setValue("#edtWebService_Url");
            $NC.setValue("#edtWebService_Header_Val");
            // Remote WebService - SOAP
            $NC.setValue("#edtWebService_Method");
            $NC.setValue("#edtWebService_NS_Prefix");
            $NC.setValue("#edtWebService_NS_Uri");
            $NC.setValue("#edtWebService_Tag_Result");
            // Remote WebService - RESTful
            $NC.setValue("#edtWebService_Param_Nm");
            $NC.setValue("#edtWebService_Param_Val");
            // 웹서비스인증구분
            $NC.setValue("#cboWebService_Auth_Div");
            // 웹서비스인증구분 - OAuth
            $NC.setValue("#edtWebService_Auth_Url");
            $NC.setValue("#edtWebService_Auth_Type");
            $NC.setValue("#edtWebService_Auth_CId");
            $NC.setValue("#edtWebService_Auth_CSecret");
            // Custom Method
            $NC.setValue("#edtCustom_Method");
            // EXCEL, TEXT, XML, JSON
            $NC.setValue("#edtEdi_Dir");
            $NC.setValue("#edtPrefix_File_Nm");
            break;

        /*----------------------------------------------------------------------------------------*/
        // DBConnect일 경우
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_DBCONNECT:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            setEnableWithVisible("#edtLink_Db_Nm");
            setEnableWithVisible("#edtLink_Table_Nm");
            setEnableWithVisible("#edtLink_Where_Text");
            // EXCEL
            setEnableWithVisible("#edtXls_First_Row", false);
            // TEXT
            setEnableWithVisible("#chkTxt_Delimeter_Yn", false);
            setEnableWithVisible("#edtTxt_Col_Delimeter", false);
            // XML
            setEnableWithVisible("#edtXml_Tag_Root", false);
            setEnableWithVisible("#edtXml_Tag_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Sub_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Result", false);
            setEnableWithVisible("#edtXml_Tag_Result_Map", false);
            // JSON
            setEnableWithVisible("#edtJson_Tag_Root", false);
            setEnableWithVisible("#edtJson_Tag_Bunch", false);
            setEnableWithVisible("#edtJson_Tag_Sub_Bunch", false);
            setEnableWithVisible("#cboJson_Tag_Struct_Div", false);
            setEnableWithVisible("#edtJson_Tag_Link_Map", false);
            setEnableWithVisible("#edtJson_Tag_Result", false);
            setEnableWithVisible("#edtJson_Tag_Result_Map", false);
            // SAP
            setEnableWithVisible("#edtSAP_Function_Nm", false);
            setEnableWithVisible("#edtSAP_Table_Nm", false);
            setEnableWithVisible("#edtSAP_Param_Map", false);
            setEnableWithVisible("#edtSAP_Result_Map", false);
            // 원격송수신구분 - DBConnect는 SQLServer, Oracle, MySQL만 가능
            setEnableWithVisible("#cboRemote_Div");
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", isDBConn);
            setEnableWithVisible("#edtRemote_Port", isDBConn);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", isDBConn);
            setEnableWithVisible("#edtRemote_User_Pwd", isDBConn);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", isDBConn);
            setEnableWithVisible("#edtRemote_Param_Map", isDBProcedureCall);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", false);
            setEnableWithVisible("#edtRemote_Charset", false);
            setEnableWithVisible("#edtRemote_Dir", false);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", false);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", false);
            // setEnableWithVisible("#edtPkg_Param_Map", false);
            // Remote WebService - RESTful, SOAP
            setEnableWithVisible("#edtWebService_Url", false);
            setEnableWithVisible("#edtWebService_Header_Val", false);
            // Remote WebService - SOAP
            setEnableWithVisible("#edtWebService_Method", false);
            setEnableWithVisible("#edtWebService_NS_Prefix", false);
            setEnableWithVisible("#edtWebService_NS_Uri", false);
            setEnableWithVisible("#edtWebService_Tag_Result", false);
            // Remote WebService - RESTful
            setEnableWithVisible("#edtWebService_Param_Nm", false);
            setEnableWithVisible("#edtWebService_Param_Val", false);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", false);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", false);
            setEnableWithVisible("#edtWebService_Auth_Type", false);
            setEnableWithVisible("#edtWebService_Auth_CId", false);
            setEnableWithVisible("#edtWebService_Auth_CSecret", false);
            // Custom Method
            setEnableWithVisible("#edtCustom_Method", $NC.G_VAR.useCustomMethod);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtEdi_Dir", false);
            setEnableWithVisible("#edtPrefix_File_Nm", false);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            if (initialize) {
                $NC.setValue("#edtLink_Db_Nm");
                $NC.setValue("#edtLink_Table_Nm");
                $NC.setValue("#edtLink_Where_Text");
            }
            // EXCEL
            $NC.setValue("#edtXls_First_Row");
            // TEXT
            $NC.setValue("#chkTxt_Delimeter_Yn", $ND.C_NO);
            $NC.setValue("#edtTxt_Col_Delimeter");
            // XML
            $NC.setValue("#edtXml_Tag_Root");
            $NC.setValue("#edtXml_Tag_Bunch");
            $NC.setValue("#edtXml_Tag_Sub_Bunch");
            $NC.setValue("#edtXml_Tag_Result");
            $NC.setValue("#edtXml_Tag_Result_Map");
            // JSON
            $NC.setValue("#edtJson_Tag_Root");
            $NC.setValue("#edtJson_Tag_Bunch");
            $NC.setValue("#edtJson_Tag_Sub_Bunch");
            $NC.setValue("#cboJson_Tag_Struct_Div");
            $NC.setValue("#edtJson_Tag_Link_Map");
            $NC.setValue("#edtJson_Tag_Result");
            $NC.setValue("#edtJson_Tag_Result_Map");
            // SAP
            $NC.setValue("#edtSAP_Function_Nm");
            $NC.setValue("#edtSAP_Table_Nm");
            $NC.setValue("#edtSAP_Param_Map");
            $NC.setValue("#edtSAP_Result_Map");
            // 원격송수신구분 - DBConnect는 SQLServer, Oracle, MySQL만 가능
            if (!isRemote || initialize || !isDBConn) {
                $NC.setValue("#cboRemote_Div");
                // FTP, SFTP, SQLServer, Oracle, MySQL
                $NC.setValue("#edtRemote_Ip");
                $NC.setValue("#edtRemote_Port");
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                $NC.setValue("#edtRemote_User_Id");
                $NC.setValue("#edtRemote_User_Pwd");
                // SQLServer, Oracle, MySQL
                $NC.setValue("#cboRemote_Action_Type");
                $NC.setValue("#edtRemote_Param_Map");
            }
            // FTP, SFTP
            $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
            $NC.setValue("#edtRemote_Charset");
            $NC.setValue("#edtRemote_Dir");
            // 웹서비스구분
            $NC.setValue("#cboWebService_Div");
            // Local WebService
            // $NC.setValue("#edtPkg_Nm");
            // $NC.setValue("#edtPkg_Param_Map");
            // Remote WebService - RESTful, SOAP
            $NC.setValue("#edtWebService_Url");
            $NC.setValue("#edtWebService_Header_Val");
            // Remote WebService - SOAP
            $NC.setValue("#edtWebService_Method");
            $NC.setValue("#edtWebService_NS_Prefix");
            $NC.setValue("#edtWebService_NS_Uri");
            $NC.setValue("#edtWebService_Tag_Result");
            // Remote WebService - RESTful
            $NC.setValue("#edtWebService_Param_Nm");
            $NC.setValue("#edtWebService_Param_Val");
            // 웹서비스인증구분
            $NC.setValue("#cboWebService_Auth_Div");
            // 웹서비스인증구분 - OAuth
            $NC.setValue("#edtWebService_Auth_Url");
            $NC.setValue("#edtWebService_Auth_Type");
            $NC.setValue("#edtWebService_Auth_CId");
            $NC.setValue("#edtWebService_Auth_CSecret");
            // Custom Method
            $NC.setValue("#edtCustom_Method");
            // EXCEL, TEXT, XML, JSON
            $NC.setValue("#edtEdi_Dir");
            $NC.setValue("#edtPrefix_File_Nm");
            break;

        /*----------------------------------------------------------------------------------------*/
        // EXCEL일 경우
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_EXCEL:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            setEnableWithVisible("#edtLink_Db_Nm", false);
            setEnableWithVisible("#edtLink_Table_Nm", false);
            setEnableWithVisible("#edtLink_Where_Text", false);
            // EXCEL
            setEnableWithVisible("#edtXls_First_Row");
            // TEXT
            setEnableWithVisible("#chkTxt_Delimeter_Yn", false);
            setEnableWithVisible("#edtTxt_Col_Delimeter", false);
            // XML
            setEnableWithVisible("#edtXml_Tag_Root", false);
            setEnableWithVisible("#edtXml_Tag_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Sub_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Result", false);
            setEnableWithVisible("#edtXml_Tag_Result_Map", false);
            // JSON
            setEnableWithVisible("#edtJson_Tag_Root", false);
            setEnableWithVisible("#edtJson_Tag_Bunch", false);
            setEnableWithVisible("#edtJson_Tag_Sub_Bunch", false);
            setEnableWithVisible("#cboJson_Tag_Struct_Div", false);
            setEnableWithVisible("#edtJson_Tag_Link_Map", false);
            setEnableWithVisible("#edtJson_Tag_Result", false);
            setEnableWithVisible("#edtJson_Tag_Result_Map", false);
            // SAP
            setEnableWithVisible("#edtSAP_Function_Nm", false);
            setEnableWithVisible("#edtSAP_Table_Nm", false);
            setEnableWithVisible("#edtSAP_Param_Map", false);
            setEnableWithVisible("#edtSAP_Result_Map", false);
            // 원격송수신구분 - EXCEL은 FTP, SFTP만 가능
            setEnableWithVisible("#cboRemote_Div");
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", isFTP);
            setEnableWithVisible("#edtRemote_Port", isFTP);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", isFTP);
            setEnableWithVisible("#edtRemote_User_Pwd", isFTP);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", false);
            setEnableWithVisible("#edtRemote_Param_Map", false);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", isFTP);
            setEnableWithVisible("#edtRemote_Charset", isFTP);
            setEnableWithVisible("#edtRemote_Dir", isFTP);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", false);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", false);
            // setEnableWithVisible("#edtPkg_Param_Map", false);
            // Remote WebService - RESTful, SOAP
            setEnableWithVisible("#edtWebService_Url", false);
            setEnableWithVisible("#edtWebService_Header_Val", false);
            // Remote WebService - SOAP
            setEnableWithVisible("#edtWebService_Method", false);
            setEnableWithVisible("#edtWebService_NS_Prefix", false);
            setEnableWithVisible("#edtWebService_NS_Uri", false);
            setEnableWithVisible("#edtWebService_Tag_Result", false);
            // Remote WebService - RESTful
            setEnableWithVisible("#edtWebService_Param_Nm", false);
            setEnableWithVisible("#edtWebService_Param_Val", false);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", false);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", false);
            setEnableWithVisible("#edtWebService_Auth_Type", false);
            setEnableWithVisible("#edtWebService_Auth_CId", false);
            setEnableWithVisible("#edtWebService_Auth_CSecret", false);
            // Custom Method
            setEnableWithVisible("#edtCustom_Method", $NC.G_VAR.useCustomMethod);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtEdi_Dir");
            setEnableWithVisible("#edtPrefix_File_Nm", isFTP);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            $NC.setValue("#edtLink_Db_Nm");
            $NC.setValue("#edtLink_Table_Nm");
            $NC.setValue("#edtLink_Where_Text");
            // EXCEL
            if (initialize) {
                $NC.setValue("#edtXls_First_Row");
            }
            // TEXT
            $NC.setValue("#chkTxt_Delimeter_Yn", $ND.C_NO);
            $NC.setValue("#edtTxt_Col_Delimeter");
            // XML
            $NC.setValue("#edtXml_Tag_Root");
            $NC.setValue("#edtXml_Tag_Bunch");
            $NC.setValue("#edtXml_Tag_Sub_Bunch");
            $NC.setValue("#edtXml_Tag_Result");
            $NC.setValue("#edtXml_Tag_Result_Map");
            // JSON
            $NC.setValue("#edtJson_Tag_Root");
            $NC.setValue("#edtJson_Tag_Bunch");
            $NC.setValue("#edtJson_Tag_Sub_Bunch");
            $NC.setValue("#cboJson_Tag_Struct_Div");
            $NC.setValue("#edtJson_Tag_Link_Map");
            $NC.setValue("#edtJson_Tag_Result");
            $NC.setValue("#edtJson_Tag_Result_Map");
            // SAP
            $NC.setValue("#edtSAP_Function_Nm");
            $NC.setValue("#edtSAP_Table_Nm");
            $NC.setValue("#edtSAP_Param_Map");
            $NC.setValue("#edtSAP_Result_Map");
            // 원격송수신구분 - EXCEL은 FTP, SFTP만 가능
            if (!isRemote || initialize) {
                $NC.setValue("#cboRemote_Div");
                // FTP, SFTP, SQLServer, Oracle, MySQL
                $NC.setValue("#edtRemote_Ip");
                $NC.setValue("#edtRemote_Port");
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                $NC.setValue("#edtRemote_User_Id");
                $NC.setValue("#edtRemote_User_Pwd");
                // FTP, SFTP
                $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                $NC.setValue("#edtRemote_Charset");
                $NC.setValue("#edtRemote_Dir");
            }
            // SQLServer, Oracle, MySQL
            $NC.setValue("#cboRemote_Action_Type");
            $NC.setValue("#edtRemote_Param_Map");
            // 웹서비스구분
            $NC.setValue("#cboWebService_Div");
            // Local WebService
            // $NC.setValue("#edtPkg_Nm");
            // $NC.setValue("#edtPkg_Param_Map");
            // Remote WebService - RESTful, SOAP
            $NC.setValue("#edtWebService_Url");
            $NC.setValue("#edtWebService_Header_Val");
            // Remote WebService - SOAP
            $NC.setValue("#edtWebService_Method");
            $NC.setValue("#edtWebService_NS_Prefix");
            $NC.setValue("#edtWebService_NS_Uri");
            $NC.setValue("#edtWebService_Tag_Result");
            // Remote WebService - RESTful
            $NC.setValue("#edtWebService_Param_Nm");
            $NC.setValue("#edtWebService_Param_Val");
            // 웹서비스인증구분
            $NC.setValue("#cboWebService_Auth_Div");
            // 웹서비스인증구분 - OAuth
            $NC.setValue("#edtWebService_Auth_Url");
            $NC.setValue("#edtWebService_Auth_Type");
            $NC.setValue("#edtWebService_Auth_CId");
            $NC.setValue("#edtWebService_Auth_CSecret");
            if (initialize) {
                // Custom Method
                $NC.setValue("#edtCustom_Method");
                // EXCEL, TEXT, XML, JSON
                $NC.setValue("#edtEdi_Dir");
            }
            if (!isRemote || initialize || !isFTP) {
                // EXCEL, TEXT, XML, JSON
                $NC.setValue("#edtPrefix_File_Nm");
            }
            break;

        /*----------------------------------------------------------------------------------------*/
        // TEXT일 경우
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_TEXT:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            setEnableWithVisible("#edtLink_Db_Nm", false);
            setEnableWithVisible("#edtLink_Table_Nm", false);
            setEnableWithVisible("#edtLink_Where_Text", false);
            // EXCEL
            setEnableWithVisible("#edtXls_First_Row", false);
            // TEXT
            setEnableWithVisible("#chkTxt_Delimeter_Yn");
            setEnableWithVisible("#edtTxt_Col_Delimeter", $NC.G_VAR.masterData.TXT_DELIMETER_YN == $ND.C_YES, true);
            // XML
            setEnableWithVisible("#edtXml_Tag_Root", false);
            setEnableWithVisible("#edtXml_Tag_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Sub_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Result", false);
            setEnableWithVisible("#edtXml_Tag_Result_Map", false);
            // JSON
            setEnableWithVisible("#edtJson_Tag_Root", false);
            setEnableWithVisible("#edtJson_Tag_Bunch", false);
            setEnableWithVisible("#edtJson_Tag_Sub_Bunch", false);
            setEnableWithVisible("#cboJson_Tag_Struct_Div", false);
            setEnableWithVisible("#edtJson_Tag_Link_Map", false);
            setEnableWithVisible("#edtJson_Tag_Result", false);
            setEnableWithVisible("#edtJson_Tag_Result_Map", false);
            // SAP
            setEnableWithVisible("#edtSAP_Function_Nm", false);
            setEnableWithVisible("#edtSAP_Table_Nm", false);
            setEnableWithVisible("#edtSAP_Param_Map", false);
            setEnableWithVisible("#edtSAP_Result_Map", false);
            // 원격송수신구분 - TEXT는 FTP, SFTP, Local WebService, Remote WebService만 가능
            setEnableWithVisible("#cboRemote_Div");
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", isFTP);
            setEnableWithVisible("#edtRemote_Port", isFTP);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", isFTP || isWSAuth);
            setEnableWithVisible("#edtRemote_User_Pwd", isFTP || isWSAuth);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", false);
            setEnableWithVisible("#edtRemote_Param_Map", false);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", isFTP);
            setEnableWithVisible("#edtRemote_Charset", isFTP);
            setEnableWithVisible("#edtRemote_Dir", isFTP);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", isRemoteWS);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", isLocalWS);
            // setEnableWithVisible("#edtPkg_Param_Map", isLocalWS);
            // Remote WebService - RESTful, SOAP
            setEnableWithVisible("#edtWebService_Url", isWSMethod);
            setEnableWithVisible("#edtWebService_Header_Val", isWSMethod);
            // Remote WebService - SOAP
            setEnableWithVisible("#edtWebService_Method", isWSSOAP);
            setEnableWithVisible("#edtWebService_NS_Prefix", isWSSOAP);
            setEnableWithVisible("#edtWebService_NS_Uri", isWSSOAP);
            setEnableWithVisible("#edtWebService_Tag_Result", isWSSOAP);
            // Remote WebService - RESTful
            setEnableWithVisible("#edtWebService_Param_Nm", isWSMethod);
            setEnableWithVisible("#edtWebService_Param_Val", isWSMethod);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", isWSMethod);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_Type", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_CId", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_CSecret", isWSOAuth);
            // Custom Method
            setEnableWithVisible("#edtCustom_Method", $NC.G_VAR.useCustomMethod);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtEdi_Dir");
            setEnableWithVisible("#edtPrefix_File_Nm", isFTP);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            $NC.setValue("#edtLink_Db_Nm");
            $NC.setValue("#edtLink_Table_Nm");
            $NC.setValue("#edtLink_Where_Text");
            // EXCEL
            $NC.setValue("#edtXls_First_Row");
            // TEXT
            if (initialize) {
                $NC.setValue("#chkTxt_Delimeter_Yn", $ND.C_NO);
                $NC.setValue("#edtTxt_Col_Delimeter");
            }
            // XML
            $NC.setValue("#edtXml_Tag_Root");
            $NC.setValue("#edtXml_Tag_Bunch");
            $NC.setValue("#edtXml_Tag_Sub_Bunch");
            $NC.setValue("#edtXml_Tag_Result");
            $NC.setValue("#edtXml_Tag_Result_Map");
            // JSON
            $NC.setValue("#edtJson_Tag_Root");
            $NC.setValue("#edtJson_Tag_Bunch");
            $NC.setValue("#edtJson_Tag_Sub_Bunch");
            $NC.setValue("#cboJson_Tag_Struct_Div");
            $NC.setValue("#edtJson_Tag_Link_Map");
            $NC.setValue("#edtJson_Tag_Result");
            $NC.setValue("#edtJson_Tag_Result_Map");
            // SAP
            $NC.setValue("#edtSAP_Function_Nm");
            $NC.setValue("#edtSAP_Table_Nm");
            $NC.setValue("#edtSAP_Param_Map");
            $NC.setValue("#edtSAP_Result_Map");
            // 원격송수신구분 - TEXT는 FTP, SFTP, Local WebService, Remote WebService만 가능
            // 미지정 또는 초기화
            if (!isRemote || initialize) {
                $NC.setValue("#cboRemote_Div");
                // FTP, SFTP, SQLServer, Oracle, MySQL
                $NC.setValue("#edtRemote_Ip");
                $NC.setValue("#edtRemote_Port");
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                $NC.setValue("#edtRemote_User_Id");
                $NC.setValue("#edtRemote_User_Pwd");
                // FTP, SFTP
                $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                $NC.setValue("#edtRemote_Charset");
                $NC.setValue("#edtRemote_Dir");
                // 웹서비스구분
                $NC.setValue("#cboWebService_Div");
                // Local WebService
                // $NC.setValue("#edtPkg_Nm");
                // $NC.setValue("#edtPkg_Param_Map");
                // Remote WebService - RESTful, SOAP
                $NC.setValue("#edtWebService_Url");
                $NC.setValue("#edtWebService_Header_Val");
                // Remote WebService - SOAP
                $NC.setValue("#edtWebService_Method");
                $NC.setValue("#edtWebService_NS_Prefix");
                $NC.setValue("#edtWebService_NS_Uri");
                $NC.setValue("#edtWebService_Tag_Result");
                // Remote WebService - RESTful
                $NC.setValue("#edtWebService_Param_Nm");
                $NC.setValue("#edtWebService_Param_Val");
                // 웹서비스인증구분
                $NC.setValue("#cboWebService_Auth_Div");
                // 웹서비스인증구분 - OAuth
                $NC.setValue("#edtWebService_Auth_Url");
                $NC.setValue("#edtWebService_Auth_Type");
                $NC.setValue("#edtWebService_Auth_CId");
                $NC.setValue("#edtWebService_Auth_CSecret");
                // EXCEL, TEXT, XML, JSON
                $NC.setValue("#edtPrefix_File_Nm");
            }
            // 지정했을 경우
            else {
                // FTP, SFTP, SQLServer, Oracle, MySQL
                if (!isFTP) {
                    $NC.setValue("#edtRemote_Ip");
                    $NC.setValue("#edtRemote_Port");
                }
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                if (!isFTP && !isWSAuth) {
                    $NC.setValue("#edtRemote_User_Id");
                    $NC.setValue("#edtRemote_User_Pwd");
                }
                // FTP, SFTP
                if (!isFTP) {
                    $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                    $NC.setValue("#edtRemote_Charset");
                    $NC.setValue("#edtRemote_Dir");
                }
                // 웹서비스구분
                if (!isRemoteWS) {
                    $NC.setValue("#cboWebService_Div");
                }
                // Local WebService
                // if (!isLocalWS) {
                // $NC.setValue("#edtPkg_Nm");
                // $NC.setValue("#edtPkg_Param_Map");
                // }
                // Remote WebService - RESTful, SOAP
                if (!isRemoteWS) {
                    $NC.setValue("#edtWebService_Url");
                    $NC.setValue("#edtWebService_Header_Val");
                }
                // Remote WebService - SOAP
                if (!isWSSOAP) {
                    $NC.setValue("#edtWebService_Method");
                    $NC.setValue("#edtWebService_NS_Prefix");
                    $NC.setValue("#edtWebService_NS_Uri");
                    $NC.setValue("#edtWebService_Tag_Result");
                }
                // Remote WebService - RESTful
                // if (!isWSRESTful) {
                if (!isWSMethod) {
                    $NC.setValue("#edtWebService_Param_Nm");
                    $NC.setValue("#edtWebService_Param_Val");
                }
                // 웹서비스인증구분
                if (!isWSAuth) {
                    $NC.setValue("#cboWebService_Auth_Div");
                }
                // 웹서비스인증구분 - OAuth
                if (!isWSOAuth) {
                    $NC.setValue("#edtWebService_Auth_Url");
                    $NC.setValue("#edtWebService_Auth_Type");
                    $NC.setValue("#edtWebService_Auth_CId");
                    $NC.setValue("#edtWebService_Auth_CSecret");
                }
                // EXCEL, TEXT, XML, JSON
                if (!isFTP) {
                    $NC.setValue("#edtPrefix_File_Nm");
                }
            }
            // SQLServer, Oracle, MySQL
            $NC.setValue("#cboRemote_Action_Type");
            $NC.setValue("#edtRemote_Param_Map");

            if (!isRemote || initialize) {
                // Custom Method
                $NC.setValue("#edtCustom_Method");
                // EXCEL, TEXT, XML, JSON
                $NC.setValue("#edtEdi_Dir");
            }
            break;

        /*----------------------------------------------------------------------------------------*/
        // XML일 경우
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_XML:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            setEnableWithVisible("#edtLink_Db_Nm", false);
            setEnableWithVisible("#edtLink_Table_Nm", false);
            setEnableWithVisible("#edtLink_Where_Text", false);
            // EXCEL
            setEnableWithVisible("#edtXls_First_Row", false);
            // TEXT
            setEnableWithVisible("#chkTxt_Delimeter_Yn", false);
            setEnableWithVisible("#edtTxt_Col_Delimeter", false);
            // XML
            setEnableWithVisible("#edtXml_Tag_Root");
            setEnableWithVisible("#edtXml_Tag_Bunch");
            setEnableWithVisible("#edtXml_Tag_Sub_Bunch");
            setEnableWithVisible("#edtXml_Tag_Result");
            setEnableWithVisible("#edtXml_Tag_Result_Map");
            // JSON
            setEnableWithVisible("#edtJson_Tag_Root", false);
            setEnableWithVisible("#edtJson_Tag_Bunch", false);
            setEnableWithVisible("#edtJson_Tag_Sub_Bunch", false);
            setEnableWithVisible("#cboJson_Tag_Struct_Div", false);
            setEnableWithVisible("#edtJson_Tag_Link_Map", false);
            setEnableWithVisible("#edtJson_Tag_Result", false);
            setEnableWithVisible("#edtJson_Tag_Result_Map", false);
            // SAP
            setEnableWithVisible("#edtSAP_Function_Nm", false);
            setEnableWithVisible("#edtSAP_Table_Nm", false);
            setEnableWithVisible("#edtSAP_Param_Map", false);
            setEnableWithVisible("#edtSAP_Result_Map", false);
            // 원격송수신구분 - XML은 FTP, SFTP, Local WebService, Remote WebService만 가능
            setEnableWithVisible("#cboRemote_Div");
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", isFTP);
            setEnableWithVisible("#edtRemote_Port", isFTP);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", isFTP || isWSAuth);
            setEnableWithVisible("#edtRemote_User_Pwd", isFTP || isWSAuth);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", false);
            setEnableWithVisible("#edtRemote_Param_Map", false);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", isFTP);
            setEnableWithVisible("#edtRemote_Charset", isFTP);
            setEnableWithVisible("#edtRemote_Dir", isFTP);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", isRemoteWS);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", isLocalWS);
            // setEnableWithVisible("#edtPkg_Param_Map", isLocalWS);
            // Remote WebService - RESTful, SOAP
            setEnableWithVisible("#edtWebService_Url", isWSMethod);
            setEnableWithVisible("#edtWebService_Header_Val", isWSMethod);
            // Remote WebService - SOAP
            setEnableWithVisible("#edtWebService_Method", isWSSOAP);
            setEnableWithVisible("#edtWebService_NS_Prefix", isWSSOAP);
            setEnableWithVisible("#edtWebService_NS_Uri", isWSSOAP);
            setEnableWithVisible("#edtWebService_Tag_Result", isWSSOAP);
            // Remote WebService - RESTful
            setEnableWithVisible("#edtWebService_Param_Nm", isWSMethod);
            setEnableWithVisible("#edtWebService_Param_Val", isWSMethod);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", isWSMethod);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_Type", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_CId", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_CSecret", isWSOAuth);
            // Custom Method
            setEnableWithVisible("#edtCustom_Method", $NC.G_VAR.useCustomMethod);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtEdi_Dir");
            setEnableWithVisible("#edtPrefix_File_Nm", isFTP);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            $NC.setValue("#edtLink_Db_Nm");
            $NC.setValue("#edtLink_Table_Nm");
            $NC.setValue("#edtLink_Where_Text");
            // EXCEL
            $NC.setValue("#edtXls_First_Row");
            // TEXT
            $NC.setValue("#chkTxt_Delimeter_Yn", $ND.C_NO);
            $NC.setValue("#edtTxt_Col_Delimeter");
            // XML
            if (initialize) {
                $NC.setValue("#edtXml_Tag_Root");
                $NC.setValue("#edtXml_Tag_Bunch");
                $NC.setValue("#edtXml_Tag_Sub_Bunch");
                $NC.setValue("#edtXml_Tag_Result");
                $NC.setValue("#edtXml_Tag_Result_Map");
            }
            // JSON
            $NC.setValue("#edtJson_Tag_Root");
            $NC.setValue("#edtJson_Tag_Bunch");
            $NC.setValue("#edtJson_Tag_Sub_Bunch");
            $NC.setValue("#cboJson_Tag_Struct_Div");
            $NC.setValue("#edtJson_Tag_Link_Map");
            $NC.setValue("#edtJson_Tag_Result");
            $NC.setValue("#edtJson_Tag_Result_Map");
            // SAP
            $NC.setValue("#edtSAP_Function_Nm");
            $NC.setValue("#edtSAP_Table_Nm");
            $NC.setValue("#edtSAP_Param_Map");
            $NC.setValue("#edtSAP_Result_Map");
            // 원격송수신구분 - XML은 FTP, SFTP, Local WebService, Remote WebService만 가능
            // 미지정 또는 초기화
            if (!isRemote || initialize) {
                $NC.setValue("#cboRemote_Div");
                // FTP, SFTP, SQLServer, Oracle, MySQL
                $NC.setValue("#edtRemote_Ip");
                $NC.setValue("#edtRemote_Port");
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                $NC.setValue("#edtRemote_User_Id");
                $NC.setValue("#edtRemote_User_Pwd");
                // FTP, SFTP
                $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                $NC.setValue("#edtRemote_Charset");
                $NC.setValue("#edtRemote_Dir");
                // 웹서비스구분
                $NC.setValue("#cboWebService_Div");
                // Local WebService
                // $NC.setValue("#edtPkg_Nm");
                // $NC.setValue("#edtPkg_Param_Map");
                // Remote WebService - RESTful, SOAP
                $NC.setValue("#edtWebService_Url");
                $NC.setValue("#edtWebService_Header_Val");
                // Remote WebService - SOAP
                $NC.setValue("#edtWebService_Method");
                $NC.setValue("#edtWebService_NS_Prefix");
                $NC.setValue("#edtWebService_NS_Uri");
                $NC.setValue("#edtWebService_Tag_Result");
                // Remote WebService - RESTful
                $NC.setValue("#edtWebService_Param_Nm");
                $NC.setValue("#edtWebService_Param_Val");
                // 웹서비스인증구분
                $NC.setValue("#cboWebService_Auth_Div");
                // 웹서비스인증구분 - OAuth
                $NC.setValue("#edtWebService_Auth_Url");
                $NC.setValue("#edtWebService_Auth_Type");
                $NC.setValue("#edtWebService_Auth_CId");
                $NC.setValue("#edtWebService_Auth_CSecret");
                // Custom Method
                $NC.setValue("#edtCustom_Method");
                // EXCEL, TEXT, XML, JSON
                $NC.setValue("#edtPrefix_File_Nm");
            }
            // 지정했을 경우
            else {
                // FTP, SFTP, SQLServer, Oracle, MySQL
                if (!isFTP) {
                    $NC.setValue("#edtRemote_Ip");
                    $NC.setValue("#edtRemote_Port");
                }
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                if (!isFTP && !isWSAuth) {
                    $NC.setValue("#edtRemote_User_Id");
                    $NC.setValue("#edtRemote_User_Pwd");
                }
                // FTP, SFTP
                if (!isFTP) {
                    $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                    $NC.setValue("#edtRemote_Charset");
                    $NC.setValue("#edtRemote_Dir");
                }
                // 웹서비스구분
                if (!isRemoteWS) {
                    $NC.setValue("#cboWebService_Div");
                }
                // Local WebService
                // if (!isLocalWS) {
                // $NC.setValue("#edtPkg_Nm");
                // $NC.setValue("#edtPkg_Param_Map");
                // }
                // Remote WebService - RESTful, SOAP
                if (!isRemoteWS) {
                    $NC.setValue("#edtWebService_Url");
                    $NC.setValue("#edtWebService_Header_Val");
                }
                // Remote WebService - SOAP
                if (!isWSSOAP) {
                    $NC.setValue("#edtWebService_Method");
                    $NC.setValue("#edtWebService_NS_Prefix");
                    $NC.setValue("#edtWebService_NS_Uri");
                    $NC.setValue("#edtWebService_Tag_Result");
                }
                // Remote WebService - RESTful
                if (!isWSRESTful) {
                    $NC.setValue("#edtWebService_Param_Nm");
                    $NC.setValue("#edtWebService_Param_Val");
                }
                // 웹서비스인증구분
                if (!isWSAuth) {
                    $NC.setValue("#cboWebService_Auth_Div");
                }
                // 웹서비스인증구분 - OAuth
                if (!isWSOAuth) {
                    $NC.setValue("#edtWebService_Auth_Url");
                    $NC.setValue("#edtWebService_Auth_Type");
                    $NC.setValue("#edtWebService_Auth_CId");
                    $NC.setValue("#edtWebService_Auth_CSecret");
                }
                // EXCEL, TEXT, XML, JSON
                if (!isFTP) {
                    $NC.setValue("#edtPrefix_File_Nm");
                }
            }
            // SQLServer, Oracle, MySQL
            $NC.setValue("#cboRemote_Action_Type");
            $NC.setValue("#edtRemote_Param_Map");

            if (!isRemote || initialize) {
                // Custom Method
                $NC.setValue("#edtCustom_Method");
                // EXCEL, TEXT, XML, JSON
                $NC.setValue("#edtEdi_Dir");
            }
            break;

        /*----------------------------------------------------------------------------------------*/
        // JSON일 경우
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_JSON:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            setEnableWithVisible("#edtLink_Db_Nm", false);
            setEnableWithVisible("#edtLink_Table_Nm", false);
            setEnableWithVisible("#edtLink_Where_Text", false);
            // EXCEL
            setEnableWithVisible("#edtXls_First_Row", false);
            // TEXT
            setEnableWithVisible("#chkTxt_Delimeter_Yn", false);
            setEnableWithVisible("#edtTxt_Col_Delimeter", false);
            // XML
            setEnableWithVisible("#edtXml_Tag_Root", false);
            setEnableWithVisible("#edtXml_Tag_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Sub_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Result", false);
            setEnableWithVisible("#edtXml_Tag_Result_Map", false);
            // JSON
            setEnableWithVisible("#edtJson_Tag_Root");
            setEnableWithVisible("#edtJson_Tag_Bunch");
            setEnableWithVisible("#edtJson_Tag_Sub_Bunch");
            setEnableWithVisible("#cboJson_Tag_Struct_Div");
            setEnableWithVisible("#edtJson_Tag_Link_Map", $NC.G_VAR.masterData.JSON_TAG_STRUCT_DIV == "4", true);
            setEnableWithVisible("#edtJson_Tag_Result");
            setEnableWithVisible("#edtJson_Tag_Result_Map");
            // SAP
            setEnableWithVisible("#edtSAP_Function_Nm", false);
            setEnableWithVisible("#edtSAP_Table_Nm", false);
            setEnableWithVisible("#edtSAP_Param_Map", false);
            setEnableWithVisible("#edtSAP_Result_Map", false);
            // 원격송수신구분 - XML은 FTP, SFTP, Local WebService, Remote WebService만 가능
            setEnableWithVisible("#cboRemote_Div");
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", isFTP);
            setEnableWithVisible("#edtRemote_Port", isFTP);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", isFTP || isWSAuth);
            setEnableWithVisible("#edtRemote_User_Pwd", isFTP || isWSAuth);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", false);
            setEnableWithVisible("#edtRemote_Param_Map", false);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", isFTP);
            setEnableWithVisible("#edtRemote_Charset", isFTP);
            setEnableWithVisible("#edtRemote_Dir", isFTP);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", isRemoteWS);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", isLocalWS);
            // setEnableWithVisible("#edtPkg_Param_Map", isLocalWS);
            // Remote WebService - RESTful, SOAP
            setEnableWithVisible("#edtWebService_Url", isWSMethod);
            setEnableWithVisible("#edtWebService_Header_Val", isWSMethod);
            // Remote WebService - SOAP
            setEnableWithVisible("#edtWebService_Method", isWSSOAP);
            setEnableWithVisible("#edtWebService_NS_Prefix", isWSSOAP);
            setEnableWithVisible("#edtWebService_NS_Uri", isWSSOAP);
            setEnableWithVisible("#edtWebService_Tag_Result", isWSSOAP);
            // Remote WebService - RESTful
            setEnableWithVisible("#edtWebService_Param_Nm", isWSMethod);
            setEnableWithVisible("#edtWebService_Param_Val", isWSMethod);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", isWSMethod);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_Type", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_CId", isWSOAuth);
            setEnableWithVisible("#edtWebService_Auth_CSecret", isWSOAuth);
            // Custom Method
            setEnableWithVisible("#edtCustom_Method", $NC.G_VAR.useCustomMethod);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtEdi_Dir");
            setEnableWithVisible("#edtPrefix_File_Nm", isFTP);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            $NC.setValue("#edtLink_Db_Nm");
            $NC.setValue("#edtLink_Table_Nm");
            $NC.setValue("#edtLink_Where_Text");
            // EXCEL
            $NC.setValue("#edtXls_First_Row");
            // TEXT
            $NC.setValue("#chkTxt_Delimeter_Yn", $ND.C_NO);
            $NC.setValue("#edtTxt_Col_Delimeter");
            // XML
            $NC.setValue("#edtXml_Tag_Root");
            $NC.setValue("#edtXml_Tag_Bunch");
            $NC.setValue("#edtXml_Tag_Sub_Bunch");
            $NC.setValue("#edtXml_Tag_Result");
            $NC.setValue("#edtXml_Tag_Result_Map");
            // JSON
            if (initialize) {
                $NC.setValue("#edtJson_Tag_Root");
                $NC.setValue("#edtJson_Tag_Bunch");
                $NC.setValue("#edtJson_Tag_Sub_Bunch");
                $NC.setValue("#cboJson_Tag_Struct_Div");
                $NC.setValue("#edtJson_Tag_Link_Map");
                $NC.setValue("#edtJson_Tag_Result");
                $NC.setValue("#edtJson_Tag_Result_Map");
            }
            // SAP
            $NC.setValue("#edtSAP_Function_Nm");
            $NC.setValue("#edtSAP_Table_Nm");
            $NC.setValue("#edtSAP_Param_Map");
            $NC.setValue("#edtSAP_Result_Map");
            // 원격송수신구분 - XML은 FTP, SFTP, Local WebService, Remote WebService만 가능
            // 미지정 또는 초기화
            if (!isRemote || initialize) {
                $NC.setValue("#cboRemote_Div");
                // FTP, SFTP, SQLServer, Oracle, MySQL
                $NC.setValue("#edtRemote_Ip");
                $NC.setValue("#edtRemote_Port");
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                $NC.setValue("#edtRemote_User_Id");
                $NC.setValue("#edtRemote_User_Pwd");
                // FTP, SFTP
                $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                $NC.setValue("#edtRemote_Charset");
                $NC.setValue("#edtRemote_Dir");
                // 웹서비스구분
                $NC.setValue("#cboWebService_Div");
                // Local WebService
                // $NC.setValue("#edtPkg_Nm");
                // $NC.setValue("#edtPkg_Param_Map");
                // Remote WebService - RESTful, SOAP
                $NC.setValue("#edtWebService_Url");
                $NC.setValue("#edtWebService_Header_Val");
                // Remote WebService - SOAP
                $NC.setValue("#edtWebService_Method");
                $NC.setValue("#edtWebService_NS_Prefix");
                $NC.setValue("#edtWebService_NS_Uri");
                $NC.setValue("#edtWebService_Tag_Result");
                // Remote WebService - RESTful
                $NC.setValue("#edtWebService_Param_Nm");
                $NC.setValue("#edtWebService_Param_Val");
                // 웹서비스인증구분
                $NC.setValue("#cboWebService_Auth_Div");
                // 웹서비스인증구분 - OAuth
                $NC.setValue("#edtWebService_Auth_Url");
                $NC.setValue("#edtWebService_Auth_Type");
                $NC.setValue("#edtWebService_Auth_CId");
                $NC.setValue("#edtWebService_Auth_CSecret");
                // Custom Method
                $NC.setValue("#edtCustom_Method");
                // EXCEL, TEXT, XML, JSON
                $NC.setValue("#edtPrefix_File_Nm");
            }
            // 지정했을 경우
            else {
                // FTP, SFTP, SQLServer, Oracle, MySQL
                if (!isFTP) {
                    $NC.setValue("#edtRemote_Ip");
                    $NC.setValue("#edtRemote_Port");
                }
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                if (!isFTP && !isWSAuth) {
                    $NC.setValue("#edtRemote_User_Id");
                    $NC.setValue("#edtRemote_User_Pwd");
                }
                // FTP, SFTP
                if (!isFTP) {
                    $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                    $NC.setValue("#edtRemote_Charset");
                    $NC.setValue("#edtRemote_Dir");
                }
                // 웹서비스구분
                if (!isRemoteWS) {
                    $NC.setValue("#cboWebService_Div");
                }
                // Local WebService
                if (!isLocalWS) {
                    $NC.setValue("#edtPkg_Nm");
                    $NC.setValue("#edtPkg_Param_Map");
                }
                // Remote WebService - RESTful, SOAP
                if (!isRemoteWS) {
                    $NC.setValue("#edtWebService_Url");
                    $NC.setValue("#edtWebService_Header_Val");
                }
                // Remote WebService - SOAP
                if (!isWSSOAP) {
                    $NC.setValue("#edtWebService_Method");
                    $NC.setValue("#edtWebService_NS_Prefix");
                    $NC.setValue("#edtWebService_NS_Uri");
                    $NC.setValue("#edtWebService_Tag_Result");
                }
                // Remote WebService - RESTful
                if (!isWSRESTful) {
                    $NC.setValue("#edtWebService_Param_Nm");
                    $NC.setValue("#edtWebService_Param_Val");
                }
                // 웹서비스인증구분
                if (!isWSAuth) {
                    $NC.setValue("#cboWebService_Auth_Div");
                }
                // 웹서비스인증구분 - OAuth
                if (!isWSOAuth) {
                    $NC.setValue("#edtWebService_Auth_Url");
                    $NC.setValue("#edtWebService_Auth_Type");
                    $NC.setValue("#edtWebService_Auth_CId");
                    $NC.setValue("#edtWebService_Auth_CSecret");
                }
                // EXCEL, TEXT, XML, JSON
                if (!isFTP) {
                    $NC.setValue("#edtPrefix_File_Nm");
                }
            }
            // SQLServer, Oracle, MySQL
            $NC.setValue("#cboRemote_Action_Type");
            $NC.setValue("#edtRemote_Param_Map");

            if (!isRemote || initialize) {
                // Custom Method
                $NC.setValue("#edtCustom_Method");
                // EXCEL, TEXT, XML, JSON
                $NC.setValue("#edtEdi_Dir");
            }
            break;

        /*----------------------------------------------------------------------------------------*/
        // SAP일 경우
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_SAP:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            setEnableWithVisible("#edtLink_Db_Nm", false);
            setEnableWithVisible("#edtLink_Table_Nm", false);
            setEnableWithVisible("#edtLink_Where_Text", false);
            // EXCEL
            setEnableWithVisible("#edtXls_First_Row", false);
            // TEXT
            setEnableWithVisible("#chkTxt_Delimeter_Yn", false);
            setEnableWithVisible("#edtTxt_Col_Delimeter", false);
            // XML
            setEnableWithVisible("#edtXml_Tag_Root", false);
            setEnableWithVisible("#edtXml_Tag_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Sub_Bunch", false);
            setEnableWithVisible("#edtXml_Tag_Result", false);
            setEnableWithVisible("#edtXml_Tag_Result_Map", false);
            // JSON
            setEnableWithVisible("#edtJson_Tag_Root", false);
            setEnableWithVisible("#edtJson_Tag_Bunch", false);
            setEnableWithVisible("#edtJson_Tag_Sub_Bunch", false);
            setEnableWithVisible("#cboJson_Tag_Struct_Div", false);
            setEnableWithVisible("#edtJson_Tag_Link_Map", false);
            setEnableWithVisible("#edtJson_Tag_Result", false);
            setEnableWithVisible("#edtJson_Tag_Result_Map", false);
            // SAP
            setEnableWithVisible("#edtSAP_Function_Nm");
            setEnableWithVisible("#edtSAP_Table_Nm");
            setEnableWithVisible("#edtSAP_Param_Map");
            setEnableWithVisible("#edtSAP_Result_Map");
            // 원격송수신구분
            setEnableWithVisible("#cboRemote_Div");
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", false);
            setEnableWithVisible("#edtRemote_Port", false);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", false);
            setEnableWithVisible("#edtRemote_User_Pwd", false);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", false);
            setEnableWithVisible("#edtRemote_Param_Map", false);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", false);
            setEnableWithVisible("#edtRemote_Charset", false);
            setEnableWithVisible("#edtRemote_Dir", false);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", false);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", false);
            // setEnableWithVisible("#edtPkg_Param_Map", false);
            // Remote WebService - RESTful, SOAP
            setEnableWithVisible("#edtWebService_Url", false);
            setEnableWithVisible("#edtWebService_Header_Val", false);
            // Remote WebService - SOAP
            setEnableWithVisible("#edtWebService_Method", false);
            setEnableWithVisible("#edtWebService_NS_Prefix", false);
            setEnableWithVisible("#edtWebService_NS_Uri", false);
            setEnableWithVisible("#edtWebService_Tag_Result", false);
            // Remote WebService - RESTful
            setEnableWithVisible("#edtWebService_Param_Nm", false);
            setEnableWithVisible("#edtWebService_Param_Val", false);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", false);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", false);
            setEnableWithVisible("#edtWebService_Auth_Type", false);
            setEnableWithVisible("#edtWebService_Auth_CId", false);
            setEnableWithVisible("#edtWebService_Auth_CSecret", false);
            // Custom Method
            setEnableWithVisible("#edtCustom_Method", false);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtEdi_Dir", false);
            setEnableWithVisible("#edtPrefix_File_Nm", false);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            // DBLink, DBConnect
            $NC.setValue("#edtLink_Db_Nm");
            $NC.setValue("#edtLink_Table_Nm");
            $NC.setValue("#edtLink_Where_Text");
            // EXCEL
            $NC.setValue("#edtXls_First_Row");
            // TEXT
            $NC.setValue("#chkTxt_Delimeter_Yn", $ND.C_NO);
            $NC.setValue("#edtTxt_Col_Delimeter");
            // XML
            $NC.setValue("#edtXml_Tag_Root");
            $NC.setValue("#edtXml_Tag_Bunch");
            $NC.setValue("#edtXml_Tag_Sub_Bunch");
            $NC.setValue("#edtXml_Tag_Result");
            $NC.setValue("#edtXml_Tag_Result_Map");
            // JSON
            $NC.setValue("#edtJson_Tag_Root");
            $NC.setValue("#edtJson_Tag_Bunch");
            $NC.setValue("#edtJson_Tag_Sub_Bunch");
            $NC.setValue("#cboJson_Tag_Struct_Div");
            $NC.setValue("#edtJson_Tag_Link_Map");
            $NC.setValue("#edtJson_Tag_Result");
            $NC.setValue("#edtJson_Tag_Result_Map");
            // SAP
            if (initialize) {
                $NC.setValue("#edtSAP_Function_Nm");
                $NC.setValue("#edtSAP_Table_Nm");
                $NC.setValue("#edtSAP_Param_Map");
                $NC.setValue("#edtSAP_Result_Map");
            }
            // 원격송수신구분
            $NC.setValue("#cboRemote_Div");
            // FTP, SFTP, SQLServer, Oracle, MySQL
            $NC.setValue("#edtRemote_Ip");
            $NC.setValue("#edtRemote_Port");
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            $NC.setValue("#edtRemote_User_Id");
            $NC.setValue("#edtRemote_User_Pwd");
            // SQLServer, Oracle, MySQL
            $NC.setValue("#cboRemote_Action_Type");
            $NC.setValue("#edtRemote_Param_Map");
            // FTP, SFTP
            $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
            $NC.setValue("#edtRemote_Charset");
            $NC.setValue("#edtRemote_Dir");
            // 웹서비스구분
            $NC.setValue("#cboWebService_Div");
            // Local WebService
            // $NC.setValue("#edtPkg_Nm");
            // $NC.setValue("#edtPkg_Param_Map");
            // Remote WebService - RESTful, SOAP
            $NC.setValue("#edtWebService_Url");
            $NC.setValue("#edtWebService_Header_Val");
            // Remote WebService - SOAP
            $NC.setValue("#edtWebService_Method");
            $NC.setValue("#edtWebService_NS_Prefix");
            $NC.setValue("#edtWebService_NS_Uri");
            $NC.setValue("#edtWebService_Tag_Result");
            // Remote WebService - RESTful
            $NC.setValue("#edtWebService_Param_Nm");
            $NC.setValue("#edtWebService_Param_Val");
            // 웹서비스인증구분
            $NC.setValue("#cboWebService_Auth_Div");
            // 웹서비스인증구분 - OAuth
            $NC.setValue("#edtWebService_Auth_Url");
            $NC.setValue("#edtWebService_Auth_Type");
            $NC.setValue("#edtWebService_Auth_CId");
            $NC.setValue("#edtWebService_Auth_CSecret");
            // Custom Method
            $NC.setValue("#edtCustom_Method");
            // EXCEL, TEXT, XML, JSON
            $NC.setValue("#edtEdi_Dir");
            $NC.setValue("#edtPrefix_File_Nm");
            break;
    }
}

function setRemoteDivChange(remoteDiv) {

    var dataDiv = $NC.nullToDefault($NC.G_VAR.masterData.DATA_DIV, "");
    remoteDiv = $NC.nullToDefault(remoteDiv, "");
    var isRemote = $NC.isNotNull(remoteDiv);
    // 원격송수신구분 값 제거시 Control 숨김 및 값 초기화
    if (!isRemote) {
        /*------------------------------------------------------------------------------------*/
        /*-- Control Enable/Visible ----------------------------------------------------------*/
        /*------------------------------------------------------------------------------------*/
        // FTP, SFTP, SQLServer, Oracle, MySQL
        setEnableWithVisible("#edtRemote_Ip", false);
        setEnableWithVisible("#edtRemote_Port", false);
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        setEnableWithVisible("#edtRemote_User_Id", false);
        setEnableWithVisible("#edtRemote_User_Pwd", false);
        // SQLServer, Oracle, MySQL
        setEnableWithVisible("#cboRemote_Action_Type", false);
        setEnableWithVisible("#edtRemote_Param_Map", false);
        // FTP, SFTP
        setEnableWithVisible("#chkRemote_Passive_Yn", false);
        setEnableWithVisible("#edtRemote_Charset", false);
        setEnableWithVisible("#edtRemote_Dir", false);
        // 웹서비스구분
        setEnableWithVisible("#cboWebService_Div", false);
        // Local WebService
        // setEnableWithVisible("#edtPkg_Nm", false);
        // setEnableWithVisible("#edtPkg_Param_Map", false);
        // Remote WebService
        setEnableWithVisible("#edtWebService_Url", false);
        setEnableWithVisible("#edtWebService_Header_Val", false);

        setEnableWithVisible("#edtWebService_Method", false);
        setEnableWithVisible("#edtWebService_NS_Prefix", false);
        setEnableWithVisible("#edtWebService_NS_Uri", false);
        setEnableWithVisible("#edtWebService_Tag_Result", false);

        setEnableWithVisible("#edtWebService_Param_Nm", false);
        setEnableWithVisible("#edtWebService_Param_Val", false);
        // 웹서비스인증구분
        setEnableWithVisible("#cboWebService_Auth_Div", false);
        // 웹서비스인증구분 - OAuth
        setEnableWithVisible("#edtWebService_Auth_Url", false);
        setEnableWithVisible("#edtWebService_Auth_Type", false);
        setEnableWithVisible("#edtWebService_Auth_CId", false);
        setEnableWithVisible("#edtWebService_Auth_CSecret", false);
        // EXCEL, TEXT, XML, JSON
        setEnableWithVisible("#edtPrefix_File_Nm", false);

        /*------------------------------------------------------------------------------------*/
        /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
        /*------------------------------------------------------------------------------------*/
        // FTP, SFTP, SQLServer, Oracle, MySQL
        $NC.setValue("#edtRemote_Ip");
        $NC.setValue("#edtRemote_Port");
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        $NC.setValue("#edtRemote_User_Id");
        $NC.setValue("#edtRemote_User_Pwd");
        // SQLServer, Oracle, MySQL
        $NC.setValue("#cboRemote_Action_Type");
        $NC.setValue("#edtRemote_Param_Map");
        // FTP, SFTP
        $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
        $NC.setValue("#edtRemote_Charset");
        $NC.setValue("#edtRemote_Dir");
        // 웹서비스구분
        $NC.setValue("#cboWebService_Div");
        // Local WebService
        // $NC.setValue("#edtPkg_Nm");
        // $NC.setValue("#edtPkg_Param_Map");
        // Remote WebService
        $NC.setValue("#edtWebService_Url");
        $NC.setValue("#edtWebService_Header_Val");

        $NC.setValue("#edtWebService_Method");
        $NC.setValue("#edtWebService_NS_Prefix");
        $NC.setValue("#edtWebService_NS_Uri");
        $NC.setValue("#edtWebService_Tag_Result");

        $NC.setValue("#edtWebService_Param_Nm");
        $NC.setValue("#edtWebService_Param_Val");
        // 웹서비스인증구분
        $NC.setValue("#cboWebService_Auth_Div");
        // 웹서비스인증구분 - OAuth
        $NC.setValue("#edtWebService_Auth_Url");
        $NC.setValue("#edtWebService_Auth_Type");
        $NC.setValue("#edtWebService_Auth_CId");
        $NC.setValue("#edtWebService_Auth_CSecret");
        // EXCEL, TEXT, XML, JSON
        $NC.setValue("#edtPrefix_File_Nm");
        return;
    }

    var isFTP = remoteDiv.startsWith("1");
    // var isLocalWS = remoteDiv == "20";
    var isRemoteWS = remoteDiv == "21";
    var isDBConn = remoteDiv.startsWith("3");
    var isDBProcedureCall = isDBConn && $NC.G_VAR.masterData.REMOTE_ACTION_TYPE == "3";
    switch (dataDiv) {
        /*----------------------------------------------------------------------------------------*/
        // DBLink일 경우
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_DBLINK:
            // DBLink는 원격송수신구분을 설정할 수 없음
            break;

        /*----------------------------------------------------------------------------------------*/
        // DBConnect일 경우 - SQLServer, Oracle, MySQL만 선택 가능
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_DBCONNECT:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", isDBConn);
            setEnableWithVisible("#edtRemote_Port", isDBConn);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", isDBConn);
            setEnableWithVisible("#edtRemote_User_Pwd", isDBConn);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", isDBConn);
            setEnableWithVisible("#edtRemote_Param_Map", isDBProcedureCall);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", false);
            setEnableWithVisible("#edtRemote_Charset", false);
            setEnableWithVisible("#edtRemote_Dir", false);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", false);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", false);
            // setEnableWithVisible("#edtPkg_Param_Map", false);
            // Remote WebService
            setEnableWithVisible("#edtWebService_Url", false);
            setEnableWithVisible("#edtWebService_Header_Val", false);

            setEnableWithVisible("#edtWebService_Method", false);
            setEnableWithVisible("#edtWebService_NS_Prefix", false);
            setEnableWithVisible("#edtWebService_NS_Uri", false);
            setEnableWithVisible("#edtWebService_Tag_Result", false);

            setEnableWithVisible("#edtWebService_Param_Nm", false);
            setEnableWithVisible("#edtWebService_Param_Val", false);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", false);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", false);
            setEnableWithVisible("#edtWebService_Auth_Type", false);
            setEnableWithVisible("#edtWebService_Auth_CId", false);
            setEnableWithVisible("#edtWebService_Auth_CSecret", false);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtPrefix_File_Nm", false);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            if (!isDBConn) {
                // FTP, SFTP, SQLServer, Oracle, MySQL
                $NC.setValue("#edtRemote_Ip");
                $NC.setValue("#edtRemote_Port");
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                $NC.setValue("#edtRemote_User_Id");
                $NC.setValue("#edtRemote_User_Pwd");
                // SQLServer, Oracle, MySQL
                $NC.setValue("#cboRemote_Action_Type");
                $NC.setValue("#edtRemote_Param_Map");
            }
            // FTP, SFTP
            $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
            $NC.setValue("#edtRemote_Charset");
            $NC.setValue("#edtRemote_Dir");
            // 웹서비스구분
            $NC.setValue("#cboWebService_Div");
            // Local WebService
            // $NC.setValue("#edtPkg_Nm");
            // $NC.setValue("#edtPkg_Param_Map");
            // Remote WebService
            $NC.setValue("#edtWebService_Url");
            $NC.setValue("#edtWebService_Header_Val");

            $NC.setValue("#edtWebService_Method");
            $NC.setValue("#edtWebService_NS_Prefix");
            $NC.setValue("#edtWebService_NS_Uri");
            $NC.setValue("#edtWebService_Tag_Result");

            $NC.setValue("#edtWebService_Param_Nm");
            $NC.setValue("#edtWebService_Param_Val");
            // 웹서비스인증구분
            $NC.setValue("#cboWebService_Auth_Div");
            // 웹서비스인증구분 - OAuth
            $NC.setValue("#edtWebService_Auth_Url");
            $NC.setValue("#edtWebService_Auth_Type");
            $NC.setValue("#edtWebService_Auth_CId");
            $NC.setValue("#edtWebService_Auth_CSecret");
            // EXCEL, TEXT, XML, JSON
            $NC.setValue("#edtPrefix_File_Nm");
            break;

        /*----------------------------------------------------------------------------------------*/
        // EXCEL일 경우 - FTP, SFTP만 선택 가능
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_EXCEL:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", isFTP);
            setEnableWithVisible("#edtRemote_Port", isFTP);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", isFTP);
            setEnableWithVisible("#edtRemote_User_Pwd", isFTP);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", false);
            setEnableWithVisible("#edtRemote_Param_Map", false);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", isFTP);
            setEnableWithVisible("#edtRemote_Charset", isFTP);
            setEnableWithVisible("#edtRemote_Dir", isFTP);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", false);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", false);
            // setEnableWithVisible("#edtPkg_Param_Map", false);
            // Remote WebService
            setEnableWithVisible("#edtWebService_Url", false);
            setEnableWithVisible("#edtWebService_Header_Val", false);

            setEnableWithVisible("#edtWebService_Method", false);
            setEnableWithVisible("#edtWebService_NS_Prefix", false);
            setEnableWithVisible("#edtWebService_NS_Uri", false);
            setEnableWithVisible("#edtWebService_Tag_Result", false);

            setEnableWithVisible("#edtWebService_Param_Nm", false);
            setEnableWithVisible("#edtWebService_Param_Val", false);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", false);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", false);
            setEnableWithVisible("#edtWebService_Auth_Type", false);
            setEnableWithVisible("#edtWebService_Auth_CId", false);
            setEnableWithVisible("#edtWebService_Auth_CSecret", false);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtPrefix_File_Nm", isFTP);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            if (!isFTP) {
                // FTP, SFTP, SQLServer, Oracle, MySQL
                $NC.setValue("#edtRemote_Ip");
                $NC.setValue("#edtRemote_Port");
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                $NC.setValue("#edtRemote_User_Id");
                $NC.setValue("#edtRemote_User_Pwd");
                // FTP, SFTP
                $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                $NC.setValue("#edtRemote_Charset");
                $NC.setValue("#edtRemote_Dir");
            }
            // SQLServer, Oracle, MySQL
            $NC.setValue("#cboRemote_Action_Type");
            $NC.setValue("#edtRemote_Param_Map");
            // FTP, SFTP
            $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
            $NC.setValue("#edtRemote_Charset");
            $NC.setValue("#edtRemote_Dir");
            // 웹서비스구분
            $NC.setValue("#cboWebService_Div");
            // Local WebService
            // $NC.setValue("#edtPkg_Nm");
            // $NC.setValue("#edtPkg_Param_Map");
            // Remote WebService
            $NC.setValue("#edtWebService_Url");
            $NC.setValue("#edtWebService_Header_Val");

            $NC.setValue("#edtWebService_Method");
            $NC.setValue("#edtWebService_NS_Prefix");
            $NC.setValue("#edtWebService_NS_Uri");
            $NC.setValue("#edtWebService_Tag_Result");

            $NC.setValue("#edtWebService_Param_Nm");
            $NC.setValue("#edtWebService_Param_Val");
            // 웹서비스인증구분
            $NC.setValue("#cboWebService_Auth_Div");
            // 웹서비스인증구분 - OAuth
            $NC.setValue("#edtWebService_Auth_Url");
            $NC.setValue("#edtWebService_Auth_Type");
            $NC.setValue("#edtWebService_Auth_CId");
            $NC.setValue("#edtWebService_Auth_CSecret");
            // EXCEL, TEXT, XML, JSON
            if (!isFTP) {
                $NC.setValue("#edtPrefix_File_Nm");
            }
            break;

        /*----------------------------------------------------------------------------------------*/
        // TEXT, XML, JSON일 경우 - FTP, SFTP, Local WebService, Remote WebService만 선택 가능
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_TEXT:
        case $ND.C_DATA_DIV_XML:
        case $ND.C_DATA_DIV_JSON:
            /*------------------------------------------------------------------------------------*/
            /*-- Control Enable/Visible ----------------------------------------------------------*/
            /*------------------------------------------------------------------------------------*/
            // FTP, SFTP, SQLServer, Oracle, MySQL
            setEnableWithVisible("#edtRemote_Ip", isFTP);
            setEnableWithVisible("#edtRemote_Port", isFTP);
            // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
            setEnableWithVisible("#edtRemote_User_Id", isFTP);
            setEnableWithVisible("#edtRemote_User_Pwd", isFTP);
            // SQLServer, Oracle, MySQL
            setEnableWithVisible("#cboRemote_Action_Type", false);
            setEnableWithVisible("#edtRemote_Param_Map", false);
            // FTP, SFTP
            setEnableWithVisible("#chkRemote_Passive_Yn", isFTP);
            setEnableWithVisible("#edtRemote_Charset", isFTP);
            setEnableWithVisible("#edtRemote_Dir", isFTP);
            // 웹서비스구분
            setEnableWithVisible("#cboWebService_Div", isRemoteWS);
            // Local WebService
            // setEnableWithVisible("#edtPkg_Nm", isLocalWS);
            // setEnableWithVisible("#edtPkg_Param_Map", isLocalWS);
            // Remote WebService
            setEnableWithVisible("#edtWebService_Url", false);
            setEnableWithVisible("#edtWebService_Header_Val", false);

            setEnableWithVisible("#edtWebService_Method", false);
            setEnableWithVisible("#edtWebService_NS_Prefix", false);
            setEnableWithVisible("#edtWebService_NS_Uri", false);
            setEnableWithVisible("#edtWebService_Tag_Result", false);

            setEnableWithVisible("#edtWebService_Param_Nm", false);
            setEnableWithVisible("#edtWebService_Param_Val", false);
            // 웹서비스인증구분
            setEnableWithVisible("#cboWebService_Auth_Div", false);
            // 웹서비스인증구분 - OAuth
            setEnableWithVisible("#edtWebService_Auth_Url", false);
            setEnableWithVisible("#edtWebService_Auth_Type", false);
            setEnableWithVisible("#edtWebService_Auth_CId", false);
            setEnableWithVisible("#edtWebService_Auth_CSecret", false);
            // EXCEL, TEXT, XML, JSON
            setEnableWithVisible("#edtPrefix_File_Nm", isFTP);

            /*------------------------------------------------------------------------------------*/
            /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
            /*------------------------------------------------------------------------------------*/
            // FTP, SFTP, SQLServer, Oracle, MySQL
            if (!isFTP) {
                $NC.setValue("#edtRemote_Ip");
                $NC.setValue("#edtRemote_Port");
                // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
                $NC.setValue("#edtRemote_User_Id");
                $NC.setValue("#edtRemote_User_Pwd");
                // FTP, SFTP
                $NC.setValue("#chkRemote_Passive_Yn", $ND.C_NO);
                $NC.setValue("#edtRemote_Charset");
                $NC.setValue("#edtRemote_Dir");
            }
            // SQLServer, Oracle, MySQL
            $NC.setValue("#cboRemote_Action_Type");
            $NC.setValue("#edtRemote_Param_Map");
            // 웹서비스구분
            $NC.setValue("#cboWebService_Div");
            // Local WebService
            // if (!isLocalWS) {
            // $NC.setValue("#edtPkg_Nm");
            // $NC.setValue("#edtPkg_Param_Map");
            // }
            // Remote WebService
            $NC.setValue("#edtWebService_Url");
            $NC.setValue("#edtWebService_Header_Val");

            $NC.setValue("#edtWebService_Method");
            $NC.setValue("#edtWebService_NS_Prefix");
            $NC.setValue("#edtWebService_NS_Uri");
            $NC.setValue("#edtWebService_Tag_Result");

            $NC.setValue("#edtWebService_Param_Nm");
            $NC.setValue("#edtWebService_Param_Val");
            // 웹서비스인증구분
            $NC.setValue("#cboWebService_Auth_Div");
            // 웹서비스인증구분 - OAuth
            $NC.setValue("#edtWebService_Auth_Url");
            $NC.setValue("#edtWebService_Auth_Type");
            $NC.setValue("#edtWebService_Auth_CId");
            $NC.setValue("#edtWebService_Auth_CSecret");
            // EXCEL, TEXT, XML, JSON
            if (!isFTP) {
                $NC.setValue("#edtPrefix_File_Nm");
            }
            break;

        /*----------------------------------------------------------------------------------------*/
        // SAP일 경우 - SAP JCO Server, SAP RFC만 선택 가능
        /*----------------------------------------------------------------------------------------*/
        case $ND.C_DATA_DIV_SAP:
            // SAP는 원격송수신 설정 값이 현재 config-task.properties 파일에 있음
            // 화면에서는 원격송수신구분만 선택 가능
            break;
    }
}

function setWebServiceDivChange(webServiceDiv) {

    var isWSMethod = $NC.isNotNull(webServiceDiv);
    // 웹서비스구분 값 제거시 Control 숨김 및 값 초기화
    if (!isWSMethod) {
        /*------------------------------------------------------------------------------------*/
        /*-- Control Enable/Visible ----------------------------------------------------------*/
        /*------------------------------------------------------------------------------------*/
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        setEnableWithVisible("#edtRemote_User_Id", false);
        setEnableWithVisible("#edtRemote_User_Pwd", false);
        // Remote WebService - RESTful, SOAP
        setEnableWithVisible("#edtWebService_Url", false);
        setEnableWithVisible("#edtWebService_Header_Val", false);
        // Remote WebService - SOAP
        setEnableWithVisible("#edtWebService_Method", false);
        setEnableWithVisible("#edtWebService_NS_Prefix", false);
        setEnableWithVisible("#edtWebService_NS_Uri", false);
        setEnableWithVisible("#edtWebService_Tag_Result", false);
        // Remote WebService - RESTful
        setEnableWithVisible("#edtWebService_Param_Nm", false);
        setEnableWithVisible("#edtWebService_Param_Val", false);
        // 웹서비스인증구분
        setEnableWithVisible("#cboWebService_Auth_Div", false);
        // 웹서비스인증구분 - OAuth
        setEnableWithVisible("#edtWebService_Auth_Url", false);
        setEnableWithVisible("#edtWebService_Auth_Type", false);
        setEnableWithVisible("#edtWebService_Auth_CId", false);
        setEnableWithVisible("#edtWebService_Auth_CSecret", false);

        /*------------------------------------------------------------------------------------*/
        /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
        /*------------------------------------------------------------------------------------*/
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        $NC.setValue("#edtRemote_User_Id");
        $NC.setValue("#edtRemote_User_Pwd");
        // Remote WebService - RESTful, SOAP
        $NC.setValue("#edtWebService_Url");
        $NC.setValue("#edtWebService_Header_Val");
        // Remote WebService - SOAP
        $NC.setValue("#edtWebService_Method");
        $NC.setValue("#edtWebService_NS_Prefix");
        $NC.setValue("#edtWebService_NS_Uri");
        $NC.setValue("#edtWebService_Tag_Result");
        // Remote WebService - RESTful
        $NC.setValue("#edtWebService_Param_Nm");
        $NC.setValue("#edtWebService_Param_Val");
        // 웹서비스인증구분
        $NC.setValue("#cboWebService_Auth_Div");
        // 웹서비스인증구분 - OAuth
        $NC.setValue("#edtWebService_Auth_Url");
        $NC.setValue("#edtWebService_Auth_Type");
        $NC.setValue("#edtWebService_Auth_CId");
        $NC.setValue("#edtWebService_Auth_CSecret");

        return;
    }

    // Remote WebService 선택되어 있을 경우만 호출 됨

    var isWSRESTful = webServiceDiv.startsWith("1");
    var isWSSOAP = webServiceDiv == "20";
    // SOAP, OAUTH면 인증구분 초기화
    if (isWSSOAP && $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV == "2") {
        $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV = "";
    }
    var isWSAuth = $NC.isNotNull($NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV);
    var isWSOAuth = isWSAuth && $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV == "2";

    /*------------------------------------------------------------------------------------*/
    /*-- Control Enable/Visible ----------------------------------------------------------*/
    /*------------------------------------------------------------------------------------*/
    // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
    setEnableWithVisible("#edtRemote_User_Id", isWSAuth);
    setEnableWithVisible("#edtRemote_User_Pwd", isWSAuth);
    // Remote WebService - RESTful, SOAP
    setEnableWithVisible("#edtWebService_Url");
    setEnableWithVisible("#edtWebService_Header_Val");
    // Remote WebService - SOAP
    setEnableWithVisible("#edtWebService_Method", isWSSOAP);
    setEnableWithVisible("#edtWebService_NS_Prefix", isWSSOAP);
    setEnableWithVisible("#edtWebService_NS_Uri", isWSSOAP);
    setEnableWithVisible("#edtWebService_Tag_Result", isWSSOAP);
    // Remote WebService - RESTful
    setEnableWithVisible("#edtWebService_Param_Nm"/* , isWSRESTful */);
    setEnableWithVisible("#edtWebService_Param_Val"/* , isWSRESTful */);
    // 웹서비스인증구분
    setEnableWithVisible("#cboWebService_Auth_Div");
    // 웹서비스인증구분 - OAuth
    setEnableWithVisible("#edtWebService_Auth_Url", isWSOAuth);
    setEnableWithVisible("#edtWebService_Auth_Type", isWSOAuth);
    setEnableWithVisible("#edtWebService_Auth_CId", isWSOAuth);
    setEnableWithVisible("#edtWebService_Auth_CSecret", isWSOAuth);

    /*------------------------------------------------------------------------------------*/
    /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
    /*------------------------------------------------------------------------------------*/
    // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
    if (!isWSAuth) {
        $NC.setValue("#edtRemote_User_Id");
        $NC.setValue("#edtRemote_User_Pwd");
    }
    // Remote WebService - SOAP
    if (!isWSSOAP) {
        $NC.setValue("#edtWebService_Method");
        $NC.setValue("#edtWebService_NS_Prefix");
        $NC.setValue("#edtWebService_NS_Uri");
        $NC.setValue("#edtWebService_Tag_Result");
    }
    // Remote WebService - RESTful
    if (!isWSRESTful) {
        $NC.setValue("#edtWebService_Param_Nm");
        $NC.setValue("#edtWebService_Param_Val");
    }
    // 웹서비스인증구분
    if (isWSAuth) {
        $NC.setValue("#cboWebService_Auth_Div", $NC.G_VAR.masterData.WEBSERVICE_AUTH_DIV);
    } else {
        $NC.setValue("#cboWebService_Auth_Div");
        // 웹서비스인증구분 - OAuth
        $NC.setValue("#edtWebService_Auth_Url");
        $NC.setValue("#edtWebService_Auth_Type");
        $NC.setValue("#edtWebService_Auth_CId");
        $NC.setValue("#edtWebService_Auth_CSecret");
    }
}

function setWebServiceAuthDivChange(webServiceAuthDiv) {

    var isWSAuth = $NC.isNotNull(webServiceAuthDiv);
    // 웹서비스인증구분 값 제거시 Control 숨김 및 값 초기화
    if (!isWSAuth) {
        /*------------------------------------------------------------------------------------*/
        /*-- Control Enable/Visible ----------------------------------------------------------*/
        /*------------------------------------------------------------------------------------*/
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        setEnableWithVisible("#edtRemote_User_Id", false);
        setEnableWithVisible("#edtRemote_User_Pwd", false);
        // 웹서비스인증구분 - OAuth
        setEnableWithVisible("#edtWebService_Auth_Url", false);
        setEnableWithVisible("#edtWebService_Auth_Type", false);
        setEnableWithVisible("#edtWebService_Auth_CId", false);
        setEnableWithVisible("#edtWebService_Auth_CSecret", false);

        /*------------------------------------------------------------------------------------*/
        /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
        /*------------------------------------------------------------------------------------*/
        // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
        $NC.setValue("#edtRemote_User_Id");
        $NC.setValue("#edtRemote_User_Pwd");
        // 웹서비스인증구분 - OAuth
        $NC.setValue("#edtWebService_Auth_Url");
        $NC.setValue("#edtWebService_Auth_Type");
        $NC.setValue("#edtWebService_Auth_CId");
        $NC.setValue("#edtWebService_Auth_CSecret");

        return;
    }

    // Remote WebService, 웹서비스구분이 선택되어 있을 경우만 호출 됨
    var isWSOAuth = webServiceAuthDiv == "2";

    /*------------------------------------------------------------------------------------*/
    /*-- Control Enable/Visible ----------------------------------------------------------*/
    /*------------------------------------------------------------------------------------*/
    // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
    setEnableWithVisible("#edtRemote_User_Id");
    setEnableWithVisible("#edtRemote_User_Pwd");
    // 웹서비스인증구분 - OAuth
    setEnableWithVisible("#edtWebService_Auth_Url", isWSOAuth);
    setEnableWithVisible("#edtWebService_Auth_Type", isWSOAuth);
    setEnableWithVisible("#edtWebService_Auth_CId", isWSOAuth);
    setEnableWithVisible("#edtWebService_Auth_CSecret", isWSOAuth);

    /*------------------------------------------------------------------------------------*/
    /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
    /*------------------------------------------------------------------------------------*/
    // FTP, SFTP, SQLServer, Oracle, MySQL, Remote WebService - Auth
    // $NC.setValue("#edtRemote_User_Id");
    // $NC.setValue("#edtRemote_User_Pwd");
    // 웹서비스인증구분 - OAuth
    if (!isWSOAuth) {
        $NC.setValue("#edtWebService_Auth_Url");
        $NC.setValue("#edtWebService_Auth_Type");
        $NC.setValue("#edtWebService_Auth_CId");
        $NC.setValue("#edtWebService_Auth_CSecret");
    }
}

function setRemoteActionTypeChange(remoteActionType) {

    var isDBRemoteAction = $NC.isNotNull(remoteActionType);
    // 원격액션타입 값 제거시 Control 숨김 및 값 초기화
    if (!isDBRemoteAction) {
        /*------------------------------------------------------------------------------------*/
        /*-- Control Enable/Visible ----------------------------------------------------------*/
        /*------------------------------------------------------------------------------------*/
        // SQLServer, Oracle, MySQL
        setEnableWithVisible("#edtRemote_Param_Map", false);

        /*------------------------------------------------------------------------------------*/
        /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
        /*------------------------------------------------------------------------------------*/
        // SQLServer, Oracle, MySQL
        $NC.setValue("#edtRemote_Param_Map");

        return;
    }

    // SQLServer, Oracle, MySQL, 원격액션타입이 선택되어 있을 경우만 호출 됨
    var isDBProcedureCall = remoteActionType == "3";

    /*------------------------------------------------------------------------------------*/
    /*-- Control Enable/Visible ----------------------------------------------------------*/
    /*------------------------------------------------------------------------------------*/
    // SQLServer, Oracle, MySQL
    setEnableWithVisible("#edtRemote_Param_Map", isDBProcedureCall);

    /*------------------------------------------------------------------------------------*/
    /*-- Control 값 초기화, $NC.G_VAR.masterData의 값은 초기화 하지 않음, 저장시 처리 ----*/
    /*------------------------------------------------------------------------------------*/
    // SQLServer, Oracle, MySQL
    if (!isDBProcedureCall) {
        $NC.setValue("#edtRemote_Param_Map");
    }
}

function setEnableWithVisible(selector, enable, visible) {

    if ($NC.isNull(enable)) {
        enable = true;
    }
    if ($NC.isNull(visible)) {
        visible = enable;
    }
    var view = $NC.getView(selector);
    $NC.setEnable(view, enable);
    if (visible) {
        view.parents("div:first").show();
    } else {
        view.parents("div:first").hide();
    }
}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 * @param view
 *        대상 Object
 * @param args
 *        grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

    var grdObject = $NC.getGridObject(args.grid);
    if (!grdObject.isValid) {
        return;
    }

    var columnId = grdObject.view.getColumnId(args.cell);
    if ($NC.isNull(columnId)) {
        return;
    }

    switch (columnId) {
        case "DATA_NULL_YN":
            $NC.onGridCheckBoxFormatterChange(grdObject, e, args, true);
            break;
    }
}

function grdDetailOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "COLUMN_ID",
        field: "COLUMN_ID",
        name: "ID",
        cssClass: "styCenter"
    });
    $NC.setGridColumn(columns, {
        id: "COLUMN_NM",
        field: "COLUMN_NM",
        name: "컬럼명"
    });
    $NC.setGridColumn(columns, {
        id: "REMARK1",
        field: "REMARK1",
        name: "컬럼설명",
        editor: Slick.Editors.Text
    });
    // DBLink, DBConnect, SAP
    $NC.setGridColumn(columns, {
        id: "DATA_TYPE_F",
        field: "DATA_TYPE_F",
        name: "수신컬럼타입",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "DATA_TYPE",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "DATA_TYPE",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            addEmpty: true
        }),
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "LINK_COLUMN_NM",
        field: "LINK_COLUMN_NM",
        name: "수신컬럼명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        },
        initialHidden: true
    });
    // EXCEL
    $NC.setGridColumn(columns, {
        id: "XLS_COLUMN_NM",
        field: "XLS_COLUMN_NM",
        name: "엑셀컬럼명",
        editor: Slick.Editors.Text,
        cssClass: "styCenter",
        editorOptions: {
            isKeyField: true
        },
        initialHidden: true
    });
    // TEXT
    $NC.setGridColumn(columns, {
        id: "TXT_POSITION",
        field: "TXT_POSITION",
        name: "텍스트시작위치",
        editor: Slick.Editors.Text,
        cssClass: "styRight",
        editorOptions: {
            isKeyField: true
        },
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "TXT_LENGTH",
        field: "TXT_LENGTH",
        name: "텍스트컬럼길이",
        editor: Slick.Editors.Text,
        cssClass: "styRight",
        initialHidden: true
    });
    // XML
    $NC.setGridColumn(columns, {
        id: "XML_TAG_NM",
        field: "XML_TAG_NM",
        name: "[XML]태그명",
        editor: Slick.Editors.Text,
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "XML_TAG_ATTR",
        field: "XML_TAG_ATTR",
        name: "[XML]태그속성",
        editor: Slick.Editors.Text,
        initialHidden: true
    });
    // JSON
    $NC.setGridColumn(columns, {
        id: "JSON_COLUMN_NM",
        field: "JSON_COLUMN_NM",
        name: "[JSON]태그명",
        editor: Slick.Editors.Text,
        editorOptions: {
            isKeyField: true
        },
        initialHidden: true
    });
    $NC.setGridColumn(columns, {
        id: "DATA_NULL_YN",
        field: "DATA_NULL_YN",
        name: "널허용여부",
        cssClass: "styCenter",
        formatter: Slick.Formatters.CheckBox,
        editorOptions: {
            valueChecked: $ND.C_YES,
            valueUnChecked: $ND.C_NO
        }
    });
    $NC.setGridColumn(columns, {
        id: "DATA_DEFAULT",
        field: "DATA_DEFAULT",
        name: "기본값",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "DATA_CHANGE_SQL",
        field: "DATA_CHANGE_SQL",
        name: "값변경SQL",
        editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
        id: "DATE_FORMAT_DIV_F",
        field: "DATE_FORMAT_DIV_F",
        name: "날짜포맷구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "DATE_FORMAT_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "DATE_FORMAT_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            addEmpty: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "DATE_INPUT_DIV_F",
        field: "DATE_INPUT_DIV_F",
        name: "날짜입력구분",
        editor: Slick.Editors.ComboBox,
        editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
            P_QUERY_ID: "WC.POP_CMCODE",
            P_QUERY_PARAMS: {
                P_COMMON_GRP: "DATE_INPUT_DIV",
                P_COMMON_CD: $ND.C_ALL,
                P_VIEW_DIV: "1" // 1:등록팝업, 2:조회팝업
            }
        }, {
            codeField: "DATE_INPUT_DIV",
            dataCodeField: "COMMON_CD",
            dataFullNameField: "COMMON_CD_F",
            addEmpty: true
        })
    });
    $NC.setGridColumn(columns, {
        id: "IF_CODE_GRP",
        field: "IF_CODE_GRP",
        name: "변환코드그룹",
        editor: Slick.Editors.Popup,
        editorOptions: {
            onPopup: grdDetailOnPopup
        }
    });
    $NC.setGridColumn(columns, {
        id: "IF_CODE_GRP_D",
        field: "IF_CODE_GRP_D",
        name: "변환코드그룹명"
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailOnSetColumns(refRowData) {

    if ($NC.isNull(refRowData)) {
        refRowData = {};
    }

    // 디테일 그리드 컬럼 세팅
    $NC.setGridColumns(G_GRDDETAIL, [ // 숨김컬럼 세팅
        refRowData.DATA_DIV != $ND.C_DATA_DIV_DBLINK //
            && refRowData.DATA_DIV != $ND.C_DATA_DIV_DBCONNECT //
            && refRowData.DATA_DIV != $ND.C_DATA_DIV_SAP ? "DATA_TYPE_F,LINK_COLUMN_NM" : "",
        refRowData.DATA_DIV != $ND.C_DATA_DIV_EXCEL ? "XLS_COLUMN_NM" : "",
        refRowData.DATA_DIV != $ND.C_DATA_DIV_TEXT ? "TXT_POSITION,TXT_LENGTH" : "",
        refRowData.DATA_DIV != $ND.C_DATA_DIV_XML ? "XML_TAG_NM,XML_TAG_ATTR" : "",
        refRowData.DATA_DIV != $ND.C_DATA_DIV_JSON ? "JSON_COLUMN_NM" : ""
    ]);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        frozenColumn: 2
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdDetail", {
        columns: grdDetailOnGetColumns(),
        queryId: "EDR01010E0.RS_DETAIL",
        sortCol: "COLUMN_ID",
        gridOptions: options
    });
    G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
    G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
    G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

    return item.CRUD != $ND.C_DV_CRUD_D;
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDDETAIL, args.row, "DATA_TYPE_F", true);
}

/**
 * 그리드에 셀 입력전
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

    // 처리사업부는 공토일 경우만 수정 가능
    if ($NC.G_VAR.masterData.BU_CD != $ND.C_BASE_BU_CD && args.item.COLUMN_NM == "PROC_BU_CD") {
        return false;
    }

    switch ($NC.G_VAR.masterData.DATA_DIV) {
        // DBLink
        case $ND.C_DATA_DIV_DBLINK:
            switch (args.column.id) {
                // case "LINK_COLUMN_NM":
                case "XLS_COLUMN_NM":
                case "TXT_POSITION":
                case "TXT_LENGTH":
                case "XML_TAG_NM":
                case "XML_TAG_ATTR":
                case "JSON_COLUMN_NM":
                    // case "DATA_TYPE_F":
                    return false;
            }
            break;
        // DBConnect
        case $ND.C_DATA_DIV_DBCONNECT:
            switch (args.column.id) {
                // case "LINK_COLUMN_NM":
                case "XLS_COLUMN_NM":
                case "TXT_POSITION":
                case "TXT_LENGTH":
                case "XML_TAG_NM":
                case "XML_TAG_ATTR":
                case "JSON_COLUMN_NM":
                    // case "DATA_TYPE_F":
                    return false;
            }
            break;
        // EXCEL
        case $ND.C_DATA_DIV_EXCEL:
            switch (args.column.id) {
                case "LINK_COLUMN_NM":
                    // case "XLS_COLUMN_NM":
                case "TXT_POSITION":
                case "TXT_LENGTH":
                case "XML_TAG_NM":
                case "XML_TAG_ATTR":
                case "JSON_COLUMN_NM":
                    // case "DATA_TYPE_F":
                    return false;
            }
            break;
        // TEXT
        case $ND.C_DATA_DIV_TEXT:
            switch (args.column.id) {
                case "LINK_COLUMN_NM":
                case "XLS_COLUMN_NM":
                    // case "TXT_POSITION":
                    // case "TXT_LENGTH":
                case "XML_TAG_NM":
                case "XML_TAG_ATTR":
                case "JSON_COLUMN_NM":
                    // case "DATA_TYPE_F":
                    return false;
            }
            break;
        // XML
        case $ND.C_DATA_DIV_XML:
            switch (args.column.id) {
                case "LINK_COLUMN_NM":
                case "XLS_COLUMN_NM":
                case "TXT_POSITION":
                case "TXT_LENGTH":
                    // case "XML_TAG_NM":
                    // case "XML_TAG_ATTR":
                case "JSON_COLUMN_NM":
                case "DATA_TYPE_F":
                    return false;
            }
            break;
        // JSON
        case $ND.C_DATA_DIV_JSON:
            switch (args.column.id) {
                case "LINK_COLUMN_NM":
                case "XLS_COLUMN_NM":
                case "TXT_POSITION":
                case "TXT_LENGTH":
                case "XML_TAG_NM":
                case "XML_TAG_ATTR":
                    // case "JSON_COLUMN_NM":
                    // case "DATA_TYPE_F":
                    return false;
            }
            break;
        // SAP
        case $ND.C_DATA_DIV_SAP:
            switch (args.column.id) {
                // case "LINK_COLUMN_NM":
                case "XLS_COLUMN_NM":
                case "TXT_POSITION":
                case "TXT_LENGTH":
                case "XML_TAG_NM":
                case "XML_TAG_ATTR":
                case "JSON_COLUMN_NM":
                    // case "DATA_TYPE_F":
                    return false;
            }
            break;
    }

    return true;
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDDETAIL.view.getColumnId(args.cell)) {
        case "IF_CODE_GRP":
            $NP.onCodeChange(rowData.IF_CODE_GRP, {
                P_COMMON_GRP: "IF_CODE_GRP",
                P_COMMON_CD: rowData.IF_CODE_GRP,
                P_VIEW_DIV: "1"
            }, grdDetailOnIfCodeGrpPopup);
            return;
        case "TXT_POSITION":
            if ($NC.isNotNull(rowData.TXT_POSITION)) {
                if (isNaN(rowData.TXT_POSITION)) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.037", "텍스트시작위치에 숫자 값을 입력하십시오."));
                    rowData.TXT_POSITION = "";
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, "TXT_POSITION", true);
                } else if (Number(rowData.TXT_POSITION) < 1) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.038", "텍스트시작위치에 0보다 큰 숫자를 입력하십시오."));
                    rowData.TXT_POSITION = "";
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, "TXT_POSITION", true);
                }
            }
            break;
        case "TXT_LENGTH":
            if ($NC.isNotNull(rowData.TXT_LENGTH)) {
                if (isNaN(rowData.TXT_LENGTH)) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.039", "텍스트컬럼길이에 숫자 값을 입력하십시오."));
                    rowData.TXT_LENGTH = "";
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, "TXT_LENGTH", true);
                } else if (Number(rowData.TXT_LENGTH) < 1) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.040", "텍스트컬럼길이 0보다 큰 숫자를 입력하십시오."));
                    rowData.TXT_LENGTH = "";
                    $NC.setFocusGrid(G_GRDDETAIL, args.row, "TXT_LENGTH", true);
                }
            }
            break;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDDETAIL, row)) {
        return true;
    }

    var rowData = G_GRDDETAIL.data.getItem(row);
    // 데이터타입의 값이 있으면 해당컬럼을 사용하는 것으로 봄
    if (rowData.CRUD != $ND.C_DV_CRUD_R) {
        if ($NC.isNotNull(rowData.DATA_TYPE)) {
            if ($NC.isNull(rowData.DATA_NULL_YN)) {
                alert($NC.getDisplayMsg("JS.EDR01011P0.041", "널허용여부를 선택하십시오."));
                $NC.setFocusGrid(G_GRDDETAIL, row, "DATA_NULL_YN", true);
                return false;
            }
            // 데이터타입이 날짜인 경우
            if (rowData.DATA_TYPE == "2") {
                if ($NC.isNull(rowData.DATE_FORMAT_DIV)) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.042", "날짜포맷구분을 선택하십시오."));
                    $NC.setFocusGrid(G_GRDDETAIL, row, "DATE_FORMAT_DIV_F", true);
                    return false;
                }

                if ($NC.isNull(rowData.DATE_INPUT_DIV)) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.043", "날짜입력구분을 선택하십시오."));
                    $NC.setFocusGrid(G_GRDDETAIL, row, "DATE_INPUT_DIV_F", true);
                    return false;
                }
            }

            // var DATA_DIV = $NC.getValue("#cboData_Div");
            // //수신처리구분이 DBLink일 경우
            // if (DATA_DIV == $ND.C_DATA_DIV_DBLINK) {
            // if ($NC.isNull(rowData.LINK_COLUMN_NM)) {
            // alert("수신컬럼명을 입력하십시오.");
            // $NC.setFocusGrid(G_GRDDETAIL, row, "LINK_COLUMN_NM", true);
            // return false;
            // }
            // //수신처리구분이 EXCEL일 경우
            // } else if (DATA_DIV == $ND.C_DATA_DIV_EXCEL) {
            // if ($NC.isNull(rowData.XLS_COLUMN_NM)) {
            // alert("엑셀컬럼명을 입력하십시오.");
            // $NC.setFocusGrid(G_GRDDETAIL, row, "XLS_COLUMN_NM", true);
            // return false;
            // }
            // //수신처리구분이 TEXT일 경우
            // } else if (DATA_DIV == $ND.C_DATA_DIV_TEXT) {
            // if ($NC.isNull(rowData.TXT_POSITION)) {
            // alert("텍스트시작위치를 입력하십시오.");
            // $NC.setFocusGrid(G_GRDDETAIL, row, "TXT_POSITION", true);
            // return false;
            // }
            // if ($NC.isNull(rowData.TXT_LENGTH)) {
            // alert("텍스트컬럼길이를 입력하십시오.");
            // $NC.setFocusGrid(G_GRDDETAIL, row, "TXT_LENGTH", true);
            // return false;
            // }
            // }
        } else {
            if ($NC.isNotNull(rowData.DATE_FORMAT_DIV)) {
                if ($NC.isNull(rowData.DATE_INPUT_DIV)) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.043", "날짜입력구분을 선택하십시오."));
                    $NC.setFocusGrid(G_GRDDETAIL, row, "DATE_INPUT_DIV_F", true);
                    return false;
                }
            }
        }
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDDETAIL, rowData);
    return true;
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDDETAIL, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDDETAIL, row + 1);
}

/**
 * 그리드의 변환코드그룹 팝업 처리
 */
function grdDetailOnPopup(e, args) {

    var rowData = args.item;
    switch (args.column.id) {
        case "IF_CODE_GRP":
            $NP.showCodePopup({
                P_COMMON_GRP: "IF_CODE_GRP",
                P_COMMON_CD: rowData.IF_CODE_GRP,
                P_VIEW_DIV: "1"
            }, grdDetailOnIfCodeGrpPopup, function() {
                $NC.setFocusGrid(G_GRDDETAIL, args.row, args.cell, true, true);
            });
            break;
    }
}

function grdSubOnGetColumns() {

    var columns = [ ];
    $NC.setGridColumn(columns, {
        id: "REPEAT_TIME",
        field: "REPEAT_TIME",
        name: "특정 수신주기",
        editor: Slick.Editors.Text,
        cssClass: "styCenter",
        editorOptions: {
            isKeyField: true
        }
    });

    return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdSubInitialize() {

    var options = {
        editable: true,
        autoEdit: true,
        showColumnHeader: false
    };

    // Grid Object, DataView 생성 및 초기화
    $NC.setInitGridObject("#grdSub", {
        columns: grdSubOnGetColumns(),
        sortCol: "REPEAT_TIME",
        gridOptions: options,
        canExportExcel: false
    });

    G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
    G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSubOnAfterScroll(e, args) {

    if (!$NC.isGridValidLastRow(G_GRDSUB, args.rows, e)) {
        return;
    }
    var row = args.rows[0];

    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows(G_GRDSUB, row + 1);
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

    var rowData = args.item;
    switch (G_GRDSUB.view.getColumnId(args.cell)) {
        case "REPEAT_TIME":
            if ($NC.isNotNull(rowData.REPEAT_TIME)) {
                var checkTime = rowData.REPEAT_TIME.split($NC.G_VAR.TIME_DATA_DIV);
                if (isNaN(checkTime[0]) || isNaN(checkTime[1])) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.044", "특정수신주기를 시분(00:00)형식으로 정확히 입력하십시오."));
                    rowData.REPEAT_TIME = "";
                    $NC.setFocusGrid(G_GRDSUB, args.row, "REPEAT_TIME", true);
                    break;
                }

                var hh = parseInt(checkTime[0], 10);
                if (hh < 0 || hh > 23) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.045", "특정수신주기가 시간을 정확히 입력하십시오."));
                    rowData.REPEAT_TIME = "";
                    $NC.setFocusGrid(G_GRDSUB, args.row, "REPEAT_TIME", true);
                    break;
                }
                var mm = parseInt(checkTime[1], 10);
                if (mm < 0 || mm > 59) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.046", "특정수신주기가 분을 정확히 입력하십시오."));
                    rowData.REPEAT_TIME = "";
                    $NC.setFocusGrid(G_GRDSUB, args.row, "REPEAT_TIME", true);
                    break;
                }

                rowData.REPEAT_TIME = $NC.lPad(hh, 2) + ":" + $NC.lPad(mm, 2);
                var searchRows = $NC.getGridSearchRows(G_GRDSUB, {
                    searchKey: "REPEAT_TIME",
                    searchVal: rowData.REPEAT_TIME
                });
                if (searchRows.length > 1) {
                    alert($NC.getDisplayMsg("JS.EDR01011P0.047", "이미 등록된 [특정수신주기] 입니다."));
                    rowData.REPEAT_TIME = "";
                    $NC.setFocusGrid(G_GRDSUB, args.row, "REPEAT_TIME", true);
                    break;
                }
            }
            break;
    }

    if ($NC.G_VAR.masterData.CRUD == $ND.C_DV_CRUD_R) {
        $NC.G_VAR.masterData.CRUD = $ND.C_DV_CRUD_U;
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDSUB, rowData);
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdSubOnNewRecord(args) {

    $NC.setFocusGrid(G_GRDSUB, args.row, "REPEAT_TIME", true);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdSubOnBeforePost(row) {

    // Validation 대상인지 체크, 아니면 True로 리턴
    if (!$NC.isGridValidPostRow(G_GRDSUB, row, "REPEAT_TIME")) {
        return true;
    }

    var rowData = G_GRDSUB.data.getItem(row);
    if ($NC.isNull(rowData.REPEAT_TIME)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.048", "수행주기를 입력하십시오."));
        $NC.setFocusGrid(G_GRDSUB, row, "REPEAT_TIME", true);
        return false;
    }

    // 신규 데이터 업데이트, N -> C
    $NC.setGridApplyPost(G_GRDSUB, rowData);
    return true;
}

function btnAddAllColumnsOnClick() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    var EDI_DIV = $NC.getValue("#cboEdi_Div");
    if ($NC.isNull(EDI_DIV)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.004", "수신구분을 선택하십시오."));
        $NC.setFocus("#cboEdi_Div");
        return;
    }

    var DEFINE_NO = $NC.getValue("#edtDefine_No");
    if ($NC.isNull(DEFINE_NO)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.005", "정의번호를 입력하십시오."));
        $NC.setFocus("#edtDefine_No");
        return;
    }

    var DEFINE_NM = $NC.getValue("#edtDefine_Nm");
    if ($NC.isNull(DEFINE_NM)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.006", "정의명칭을 입력하십시오."));
        $NC.setFocus("#edtDefine_Nm");
        return;
    }

    var DATA_DIV = $NC.getValue("#cboData_Div");
    if ($NC.isNull(DATA_DIV)) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.007", "수신처리구분을 선택하십시오."));
        $NC.setFocus("#cboData_Div");
        return;
    }

    // 데이터 조회
    $NC.serviceCall("/EDR01010E0/getDataSet.do", {
        P_QUERY_ID: "EDR01010E0.RS_SUB1",
        P_QUERY_PARAMS: {
            P_EDI_DIV: EDI_DIV
        }
    }, onGetSub1);
}

function onGetSub1(ajaxData) {

    var BU_CD = $NC.getValue("#edtBu_Cd");
    var EDI_DIV = $NC.getValue("#cboEdi_Div");
    var DEFINE_NO = $NC.getValue("#edtDefine_No");

    var dsResult = $NC.toArray(ajaxData);
    var rCount = dsResult.length;
    if (rCount == 0) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.049", "수신항목이 없습니다."));
        return;
    }

    var rowData, newRowData, rIndex, searchIndex;
    // 삭제된 항목 제거
    for (rIndex = G_GRDDETAIL.data.getLength() - 1; rIndex >= 0; rIndex--) {
        rowData = G_GRDDETAIL.data.getItem(rIndex);

        searchIndex = $NC.getSearchArray(dsResult, {
            searchKey: "COLUMN_NM",
            searchVal: rowData.COLUMN_NM
        });
        if (searchIndex == -1) {
            // 신규 데이터일 경우 Grid 데이터 삭제, 그외 CRUD를 "D"로 변경
            $NC.deleteGridRowData(G_GRDDETAIL, rowData, true);
        }
    }

    // 상세내역에 없는 항목 추가
    for (rIndex = 0; rIndex < rCount; rIndex++) {
        rowData = dsResult[rIndex];

        // 존재할 경우 컬럼ID만 변경
        searchIndex = $NC.getGridSearchRow(G_GRDDETAIL, {
            searchKey: "COLUMN_NM",
            searchVal: rowData.COLUMN_NM
        });
        if (searchIndex > -1) {
            newRowData = G_GRDDETAIL.data.getItem(searchIndex);
            newRowData.COLUMN_ID = rowData.COLUMN_ID;
            $NC.setGridApplyChange(G_GRDDETAIL, newRowData);
            continue;
        }

        newRowData = {
            BU_CD: BU_CD,
            EDI_DIV: EDI_DIV,
            DEFINE_NO: DEFINE_NO,
            COLUMN_NM: rowData.COLUMN_NM,
            COLUMN_ID: rowData.COLUMN_ID,
            DATA_TYPE: null,
            DATA_NULL_YN: $ND.C_YES,
            DATA_DEFAULT: rowData.DATA_DEFAULT,
            DATA_CHANGE_SQL: null,
            DATE_FORMAT_DIV: null,
            DATE_INPUT_DIV: null,
            IF_CODE_GRP: null,
            LINK_COLUMN_NM: null,
            TXT_POSITION: null,
            TXT_LENGTH: null,
            XLS_COLUMN_NM: null,
            XML_TAG_NM: null,
            XML_TAG_ATTR: null,
            JSON_COLUMN_NM: null,
            REMARK1: rowData.REMARK1,
            id: $NC.getGridNewRowId(),
            CRUD: $ND.C_DV_CRUD_C
        };

        // 처리사업부는 공통이 아닐 경우 처리사업부변경 불가
        if ($NC.G_VAR.masterData.BU_CD != $ND.C_BASE_BU_CD && rowData.COLUMN_NM == "PROC_BU_CD") {
            newRowData.DATA_DEFAULT = $NC.G_VAR.masterData.BU_CD;
        }

        G_GRDDETAIL.data.addItem(newRowData);
    }

    // 컬럼ID로 재정렬
    $NC.setGridSort(G_GRDDETAIL, {
        showSortIndicator: false,
        sortColumns: {
            columnId: "COLUMN_ID",
            sortAsc: true
        }
    });

    $NC.setInitGridAfterOpen(G_GRDDETAIL, "COLUMN_ID");
}

/**
 * 수행주기 추가
 */
function btnCycleNewOnClick() {

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDDETAIL)) {
        return;
    }

    // 마지막 선택 Row Validation 체크
    if (!$NC.isGridValidLastRow(G_GRDSUB)) {
        return;
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
        REPEAT_TIME: "",
        id: $NC.getGridNewRowId(),
        CRUD: $ND.C_DV_CRUD_N
    };

    // 신규 데이터 생성 및 이벤트 호출
    $NC.newGridRowData(G_GRDSUB, newRowData);
}

/**
 * 수행주기 삭제
 */
function btnCycleDeleteOnClick() {

    if (G_GRDSUB.data.getLength() == 0) {
        alert($NC.getDisplayMsg("JS.EDR01011P0.050", "삭제할 데이터가 없습니다."));
        return;
    }

    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    $NC.deleteGridRowData(G_GRDSUB, rowData);
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

    var resultData = $NC.toObject(ajaxData);
    var oMsg = $NC.getOutMessage(resultData);
    if (oMsg != $ND.C_OK) {
        alert(oMsg);
        return;
    }

    onClose();
}

/**
 * 인터페이스코드그룹 검색 결과 / 검색 실패 했을 경우(not found)
 */
function grdDetailOnIfCodeGrpPopup(resultInfo) {

    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if ($NC.isNull(rowData)) {
        return;
    }

    var focusCol;
    if ($NC.isNotNull(resultInfo)) {
        rowData.IF_CODE_GRP = resultInfo.COMMON_CD;
        rowData.IF_CODE_GRP_D = resultInfo.COMMON_NM;

        focusCol = G_GRDDETAIL.view.getColumnIndex("DATA_TYPE_F");
    } else {
        rowData.IF_CODE_GRP = "";
        rowData.IF_CODE_GRP_D = "";

        focusCol = G_GRDDETAIL.view.getColumnIndex("IF_CODE_GRP");
    }

    // 마지막 선택 Row 수정 데이터 반영 및 상태 변경
    $NC.setGridApplyChange(G_GRDDETAIL, rowData);

    $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

function setTooltip() {

    // 신규/삭제/저장 버튼 툴팁 세팅
    $NC.setTooltip("#btnCycleNew", $NC.getDisplayMsg("JS.EDR01011P0.052", "신규"));
    $NC.setTooltip("#btnCycleDelete", $NC.getDisplayMsg("JS.EDR01011P0.053", "삭제"));
    $NC.setTooltip("#btnEntrySave", $NC.getDisplayMsg("JS.EDR01011P0.054", "저장"));

    $NC.setTooltip("#edtLink_Where_Text", "수신 테이블의 대상 검색시 특정 데이터만 처리할 경우 입력");

    $NC.setTooltip("#edtTxt_Col_Delimeter", "컬럼구분자를 사용할 경우 컬럼 설정\n" //
        + "[TXT]시작위치: 1부터 순서대로 입력\n" //
        + "[TXT]컬럼길이: 값의 최대 길이 입력, [최대 길이 < 값의 길이] 최대 길이로 자름");

    $NC.setTooltip("#edtXml_Tag_Result", "처리결과정보 입력 태그 설정(태그명: #RESULT_DATA#)\n" //
        + "처리결과코드:  #RESULT_CD#\n처리결과메시지:  #RESULT_MSG#");

    $NC.setTooltip("#edtXml_Tag_Result_Map", "처리결과 매핑정보 설정(Key=Value)\n" //
        + "RESULT_CD_SUCCESS=정상코드 값, 기본값: 0\nRESULT_CD_ERROR=오류코드 값, 기본값: -1\nRESULT_CD_DATA_TYPE=코드 데이터 타입(STRING, NUMBER)\n" //
        + "PATTERN_RESULT_CD=처리결과 코드 검색을 위한 정규식 패턴\nPATTERN_RESULT_MSG=처리결과 메시지 검색을 위한 정규식 패턴");

    $NC.setTooltip("#edtJson_Tag_Result", "처리결과정보 입력 태그 설정(태그명: #RESULT_DATA#)\n" //
        + "처리결과코드:  #RESULT_CD#\n처리결과메시지:  #RESULT_MSG#");

    $NC.setTooltip("#edtJson_Tag_Result_Map", "처리결과 매핑정보 설정(Key=Value)\n" //
        + "RESULT_CD_SUCCESS=정상코드 값, 기본값: 0\nRESULT_CD_ERROR=오류코드 값, 기본값: -1\nRESULT_CD_DATA_TYPE=코드 데이터 타입(STRING, NUMBER)\n" //
        + "PATTERN_RESULT_CD=처리결과 코드 검색을 위한 정규식 패턴\nPATTERN_RESULT_MSG=처리결과 메시지 검색을 위한 정규식 패턴");

    $NC.setTooltip("#edtSAP_Param_Map", "SAP 파라메터 매핑 값(Key=Value)\n" //
        + "동적 값 입력시 SQL#[SQL_TEXT]# 형식으로 입력, SQL_TEXT 값을 SELECT해서 입력 함\n" //
        + "EX) I_DATE=SQL#[TO_CHAR(SYSDATE, 'YYYYMMDD')]#\n     I_TIME=120000");

    $NC.setTooltip("#edtSAP_Result_Map", "처리결과 매핑정보 설정(Key=Value)\n" //
        + "RESULT_CD_SUCCESS=정상코드 값, 기본값: S\nRESULT_CD_ERROR=오류코드 값, 기본값: E\n" //
        + "COLUMN_RESULT_CD=처리결과 코드 컬럼명\nCOLUMN_RESULT_MSG=처리결과 메시지 컬럼명");

    $NC.setTooltip("#cboData_Cycle_Div", "송수신주기 설정\n" //
        + "시각설정: 시간:분 형식, 12:00");

    $NC.setTooltip("#edtWebService_Auth_Type", "웹서비스인증타입 설정\n" //
        + "지원: client_credentials, password");

    $NC.setTooltip("#edtWebService_Param_Val", "웹서비스 파라메터 값\n" //
        + "동적 값 입력시 SQL#[SQL_TEXT]# 형식으로 입력, SQL_TEXT 값을 SELECT해서 입력 함");

    $NC.setTooltip("#edtWebService_Header_Val", "웹서비스 헤더 설정\n" //
        + "Http 헤더에 입력할 값을 Key=Value 형식으로 입력");

    $NC.setTooltip("#edtRemote_Charset", "캐릭터셋 설정\n" //
        + "기본값: utf-8");

    $NC.setTooltip("#edtPrefix_File_Nm", "수신 위치에 여려 유형의 파일이 존재할 경우 구분할 수 있는 파일명 접두사\n" //
        + "기본값: 없음");

    $NC.setTooltip("#edtCustom_Method", "기본 로직으로 처리가 불가능해 별도 로직으로 구현했을 경우 지정\n" //
        + "기본값: 없음");

    $NC.setTooltip("#edtRemote_Param_Map", "원격파라메터 매핑 설정, PROCEDURE<CALL>일 경우\n" //
        + "ALL_PARAMS: PROCEDURE 호출 파라메터 전체를 순서대로 입력\n" //
        + "  형식: 파라메터1,파라메터2,...\n" //
        + "파라메터명=값: 호출시 입력할 파라메터명, 값 지정\n" //
        + "  형식: 파라메터=값\n파라메터1=상수값1\n파라메터2=<SQL문>,호출시 문장 그대로 입력(접속 DB 형식에 맞는 문장)\n" //
        + "파라메터3=[지정값], USER_ID, SYSDATE 등 지정값\n파라메터4=SQL#[SQL_TEXT]#, SQL 실행 결과값 입력\n" //
        + "EX)\n" //
        + "  ALL_PARAMS=P_CENTER_CD,P_BU_CD,P_RECV_DATE\n" //
        + "  P_CENTER_CD=A1\n" //
        + "  P_BU_CD=0000\n" //
        + "  P_RECV_DATE=<TRUNC(SYSDATE)>");
}