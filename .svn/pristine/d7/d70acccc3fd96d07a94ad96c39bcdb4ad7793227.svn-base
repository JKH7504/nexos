package nexos.service.ed.common;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;

import javax.xml.soap.MessageFactory;
import javax.xml.soap.MimeHeaders;
import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPConnection;
import javax.xml.soap.SOAPConnectionFactory;
import javax.xml.soap.SOAPElement;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPFault;
import javax.xml.soap.SOAPMessage;
import javax.xml.soap.SOAPPart;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import nexos.dao.ed.common.EDCommonDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.AuthenticationUtil;
import nexos.framework.support.ServiceSupport;
import nexos.framework.web.NexosURLStreamHandler;

/**
 * Class: EDSOAPService<br>
 * Description: SOAP 관련 인터페이스 처리를 담당하는 공통 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */

@Service
public class EDSOAPService extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(EDSOAPService.class);

    final String                  SELECT_ID_GET_ACS_INFO_CJ_SOAP     = "EDIFAPI.GET_ACS_INFO_CJ_SOAP";
    final String                  SELECT_ID_GET_KPIS_INFO_BNO        = "EDIFAPI.GET_KPIS_INFO_BNO";
    final String                  SELECT_ID_GET_KPIS_INFO_RFID       = "EDIFAPI.GET_KPIS_INFO_RFID";
    final String                  SELECT_ID_GET_KPIS_INFO_SNO        = "EDIFAPI.GET_KPIS_INFO_SNO";
    final String                  SELECT_ID_GET_KPIS_INFO_SNO_DETAIL = "EDIFAPI.GET_KPIS_INFO_SNO_DETAIL";
    final String                  SELECT_ID_GET_KPIS_INFO_STD_CD     = "EDIFAPI.GET_KPIS_INFO_STD_CD";

    final String                  SP_ID_PROCESSING_ACS_RESULT_CJ     = "EDIFAPI.PROCESSING_ACS_RESULT_CJ";

    @Autowired
    private EDCommonDAO           dao;

    private MessageFactory        messageFactory;
    // private TransformerFactory transformerFactory;
    private SOAPConnectionFactory soapConnectionFactory;

    public EDSOAPService() throws Exception {

        this.messageFactory = MessageFactory.newInstance();
        // this.transformerFactory = TransformerFactory.newInstance();
        this.soapConnectionFactory = SOAPConnectionFactory.newInstance();
    }

    /**
     * 데이터의 키/값을 서비스 호출 데이터 키/값으로 변경 처리
     *
     * @param rowData
     *        변경 처리할 데이터 맵
     * @param excludeKeys
     *        변경 처리에서 제외할 데이터 키
     * @param dataValues
     *        SOAP 서비스호출 데이터 키/값 맵
     * @param callParams
     *        결과반영 호출 파라메터 맵
     */
    private void setParameter(Map<String, Object> rowData, String[] excludeKeys, Map<String, Object> dataValues, Map<String, Object> callParams) {

        callParams.clear();
        dataValues.clear();
        for (Map.Entry<String, Object> entry : rowData.entrySet()) {
            String key = entry.getKey();
            for (String excludeKey : excludeKeys) {
                if (key.equals(excludeKey)) {
                    continue;
                }
            }
            // 서비스호출 데이터 키/값
            if (key.startsWith("DV_")) {
                dataValues.put(key, entry.getValue());
            }
            // 결과반영 호출 기본 파라메터
            else if (key.startsWith("P_")) {
                callParams.put(key, entry.getValue());
            }
        }
    }

    /**
     * 서비스호출 기본정보 리턴
     *
     * @param ifApiSpec
     * @return
     */
    private Map<String, Object> getServiceParams(Map<String, Object> ifApiParams, Map<String, Object> ifApiSpec) {

        Map<String, Object> result = Util.newMap();

        for (Map.Entry<String, Object> entry : ifApiSpec.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("SP_")) {
                result.put(key.replaceFirst("SP_", "P_"), entry.getValue());
            }
        }

        // 서비스 호출 결과 파라메터 매핑 정보 파싱
        Map<String, Object> resultTagParams = Util.toKeyValues((String)result.get("P_RESULT_TAG_PARAM_MAP"));
        if (resultTagParams.size() == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[RESULT_TAG_PARAM_MAP]파라메터 매핑 정보가 존재하지 않습니다."));
        }
        // 서비스 호출 헤더 매핑정보 파싱
        Map<String, Object> headerParams = Util.toKeyValues((String)result.get("P_HEADER_PARAM_MAP"));
        result.put("P_RESULT_TAG_PARAMS", resultTagParams);
        result.put("P_HEADER_PARAMS", headerParams);
        // IFAPI 구분 값 입력
        result.put("P_IFAPI_DIV", ifApiParams.get("P_IFAPI_DIV"));

        return result;
    }

    /**
     * 서비스 호출 파라메터명 구분에 따라 변경
     *
     * @param caseDiv
     * @param paramName
     * @return
     */
    private String getParamName(String caseDiv, String paramName) {

        String result = paramName;
        switch (caseDiv) {
            case "1": // CamelCase
                result = Util.toCamelCase(result, true);
                break;
            case "2": // UpperCase
                result = result.toUpperCase();
                break;
            case "3": // LowerCase
                result = result.toLowerCase();
                break;
        }

        return result;
    }

    /**
     * 압축된 SOAPMessage일 경우 압축해제한 후 리턴
     *
     * @param soapResponse
     * @return
     * @throws Exception
     */
    private SOAPMessage decompressMessage(SOAPMessage soapResponse) throws Exception {

        SOAPMessage result = soapResponse;
        // GZip 압축 체크, 변경
        MimeHeaders mimeHeaders = soapResponse.getMimeHeaders();
        String[] encodings = mimeHeaders.getHeader(HttpHeaders.CONTENT_ENCODING);
        if (encodings != null) {
            for (int rIndex = 0, rCount = encodings.length; rIndex < rCount; rIndex++) {
                if (encodings[rIndex].toLowerCase().equals("gzip")) {
                    ByteArrayOutputStream byteArrayStream = new ByteArrayOutputStream();
                    result.writeTo(byteArrayStream);
                    GZIPInputStream gzipStream = new GZIPInputStream(new ByteArrayInputStream(byteArrayStream.toByteArray()));
                    result = messageFactory.createMessage(mimeHeaders, gzipStream);
                    byteArrayStream.close();
                    gzipStream.close();
                    break;
                }
            }
        }

        return result;
    }

    /**
     * SOAP Request Message 생성
     * <pre style="font-family: GulimChe; font-size: 12px;">
     * <b>Sample message</b><br>
     * {@code
     * <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
     *     xmlns:ns1="http://endpoint.sample.com/">
     *     <soapenv:Header/>
     *     <soapenv:Body>
     *         <ns1:getMsg>
     *             <arg0>Send message</arg0>
     *          </ns1:getMsg>
     *      </soapenv:Body>
     *  </soapenv:Envelope>
     * }
     * </pre>
     *
     * @param serviceParams
     *        서비스 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_WEBSERVICE_URL          SOAP Url
     * P_METHOD_NM               SOAP Method Name
     * P_NS_PREFIX               SOAP Message Namespace prefix Name
     * P_NS_URI                  SOAP Message Namespace Uri
     * P_HEADER_PARAM_MAP        SOAP 호출 Header에 추가할 값, key1=value || WD.C_CR || key2=value
     * P_CONN_TIMEOUT            서비스 Connection Timeout(초)
     * P_READ_TIMEOUT            서비스 Data Read Timeout(초)
     * P_DATA_TAG                SOAP 호출 데이터가 입력될 상위 태그명
     * P_RESULT_TAG              결과 정보를 읽을 상위 태그명
     * P_RESULT_LIST_TAG         결과 정보가 리스트형태일 경우 읽을 태그명
     * P_RESULT_SUB_NODE_YN      리스트 결과 정보에서 값을 읽을 경우 서브 노드에서 읽을지 현재 노드에서 읽을지 여부
     * P_RESULT_TAG_PARAM_MAP    결과 정보에서 읽은 태그 값을 반영할 때 사용할 파라메터 매핑
     * P_RESULT_CD_TAG           결과 정보에서 처리결과 코드를 읽을 태그명
     * P_RESULT_MSG_TAG          결과 정보에서 처리결과 메시지를 읽을 태그명
     * P_ERROR_CD_PARAM          결과 정보에서 처리결과 코드를 읽을 파라메터명
     * P_ERROR_MSG_PARAM         결과 정보에서 처리결과 메시지를 읽을 파라메터명
     * P_EXEC_TIME_PARAM         처리 응답시간을 기록할 파라메터명, NULL 허용
     *        </pre>
     * @param callParams
     *        결과반영 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_...                     기본 파라메터, P_로 시작하는 컬럼
     * P_REQUEST_PARAMS          Request Parameter Hashmap, DV로 시작하는 컬럼
     *        </pre>
     * @return SOAPMessage
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    private SOAPMessage getRequestPayload(Map<String, Object> serviceParams, Map<String, Object> callParams) throws Exception {

        SOAPMessage resultMessage = messageFactory.createMessage();
        SOAPPart soapPart = resultMessage.getSOAPPart();
        SOAPEnvelope soapEnvelope = soapPart.getEnvelope();

        // Namespace 체크
        // xmlns:ns1="http://endpoint.sample.com/"
        String nsPrefix = (String)serviceParams.get("P_NS_PREFIX");
        String nsUri = (String)serviceParams.get("P_NS_URI");

        if (Util.isNull(nsPrefix) || Util.isNull(nsUri)) {
            throw new RuntimeException(
                NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[P_NS_PREFIX, P_NS_URI]서비스 호출 Namespace Prefix 또는 Uri가 지정되지 않았습니다."));
        }
        // 호출 Method 체크
        // <ns1:getMsg>
        String methodNm = (String)serviceParams.get("P_METHOD_NM");
        if (Util.isNull(methodNm)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[P_METHOD_NM]서비스 호출 메서드명이 지정되지 않았습니다."));
        }
        String dataTag = (String)serviceParams.get("P_DATA_TAG");
        if (Util.isNull(dataTag)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[P_DATA_TAG]서비스 호출 데이터 입력 Tag가 지정되지 않았습니다."));
        }

        // 데이터 체크
        // <arg0>Send message</arg0>
        Map<String, Object> requestParams = (Map<String, Object>)callParams.get("P_REQUEST_PARAMS");
        if (Util.isNull(requestParams)) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[P_REQUEST_PARAMS]서비스 호출 파라메터가 지정되지 않았습니다."));
        }

        soapEnvelope.addNamespaceDeclaration(nsPrefix, nsUri);
        SOAPBody soapBody = soapEnvelope.getBody();
        SOAPElement methodElement = soapBody.addChildElement(methodNm, nsPrefix);
        // 전송 데이터 입력
        String paramNmCaseDiv = Util.nullToDefault(serviceParams.get("P_PARAM_NM_CASE_DIV"), "1");
        SOAPElement dataElement = methodElement.addChildElement(dataTag);
        for (Map.Entry<String, Object> requestParam : requestParams.entrySet()) {
            // P_PARAM_CASE_DIV 값에 따라 변경로 변경 - > DV_COLUMN_NM - > 1 - columnNm, 2 - COLUMN_NM, 3 - column_nm, 4 - COLUMN_NM
            dataElement.addChildElement(getParamName(paramNmCaseDiv, requestParam.getKey().substring(3))) //
                .addTextNode(Util.nullToEmpty(requestParam.getValue()));
        }

        // 기본 헤더 정보 세팅
        MimeHeaders mimeHeaders = resultMessage.getMimeHeaders();
        // 추가 헤더 정보 세팅
        Map<String, Object> headerParams = (Map<String, Object>)serviceParams.get("P_HEADER_PARAMS");
        if (Util.isNotNull(headerParams)) {
            for (Map.Entry<String, Object> headerParam : headerParams.entrySet()) {
                mimeHeaders.setHeader(headerParam.getKey(), headerParam.getValue().toString());
            }
        }
        if (mimeHeaders.getHeader(HttpHeaders.CONTENT_TYPE) == null) {
            mimeHeaders.addHeader(HttpHeaders.CONTENT_TYPE, "application/soap+xml;charset=" + Consts.CHARSET);
        }
        if (mimeHeaders.getHeader(HttpHeaders.CONNECTION) == null) {
            // mimeHeaders.addHeader(HttpHeaders.CONNECTION, "Keep-Alive");
            mimeHeaders.addHeader(HttpHeaders.CONNECTION, "close");
        }
        resultMessage.setProperty(SOAPMessage.CHARACTER_SET_ENCODING, Consts.CHARSET);
        resultMessage.saveChanges();

        return resultMessage;
    }

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public Map<String, Object> getXMLResultInfo() {

        return dao.getXMLResultInfo(null, null);
    }

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public Map<String, Object> receiveXML(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = Util.newMap();

        String buCd = (String)params.get("P_BU_CD");
        String ediDiv = (String)params.get("P_EDI_DIV");
        String defineNo = (String)params.get("P_DEFINE_NO");
        String returnAfterDataInsertYn = (String)params.get("P_RETURN_AFTER_DATA_INSERT");
        try {
            List<Map<String, Object>> lstDefineInfo = dao.getDefineRemoteInfo(params);
            if (lstDefineInfo == null || lstDefineInfo.size() == 0) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX",
                    "[사업부,수신구분,수신정의번호: " + buCd + "," + ediDiv + "," + defineNo + "]수신정의 정보가 존재하지 않습니다. 확인 후 작업하십시오.",
                    new String[] {Util.toString(buCd), Util.toString(ediDiv), Util.toString(defineNo)}));
            }
            Map<String, Object> defineInfo = lstDefineInfo.get(0);

            params.put("P_DATA_DIV", Consts.DATA_DIV_XML);
            Map<String, Object> xmlResultInfo = dao.getXMLResultInfo((String)defineInfo.get("XML_TAG_RESULT"), //
                (String)defineInfo.get("XML_TAG_RESULT_MAP"));
            params.put("P_XML_RESULT_INFO", xmlResultInfo);
            if (Util.isNull(returnAfterDataInsertYn)) {
                returnAfterDataInsertYn = (String)xmlResultInfo.get("P_RETURN_AFTER_DATA_INSERT");
            }

            // Json parsing -> Insert EDI Table
            TransactionStatus ts = beginTrans();
            try {
                resultMap = dao.recvDataProcessing(params);

                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }

                commitTrans(ts);
            } catch (Exception e) {
                rollbackTrans(ts);
                throw new RuntimeException(Util.getErrorMessage(e));
            }

            params.put("P_RECV_DATE", resultMap.get("P_RECV_DATE"));
            params.put("P_RECV_NO", resultMap.get("P_RECV_NO"));

            if (Consts.YES.equals(returnAfterDataInsertYn)) {
                receiveXMLTask(params);
            } else {
                // ER_PROCESSING 호출
                ts = beginTrans();
                try {
                    params.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);
                    resultMap = dao.callERProcessing(params);

                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    throw new RuntimeException(Util.getErrorMessage(e));
                }

                // ER_PROCESSING_AFTER 호출
                ts = beginTrans();
                try {
                    resultMap = dao.callERProcessingAfter(params);

                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                    commitTrans(ts);
                } catch (Exception e) {
                    rollbackTrans(ts);
                    throw new RuntimeException(Util.getErrorMessage(e));
                }
            }
            Util.setOutMessage(params, Consts.OK);
        } catch (Exception e) {
            Util.setOutMessage(params, Util.getErrorMessage(e));
        }
        return params;
    }

    private void receiveXMLTask(Map<String, Object> params) {

        final Map<String, Object> callParams = Util.newMap(params);
        new Thread(new Runnable() {

            @Override
            public void run() {
                AuthenticationUtil.configureAuthentication();
                try {
                    TransactionStatus ts = null;
                    Map<String, Object> resultMap;
                    // ER_PROCESSING 호출
                    ts = beginTrans();
                    try {
                        callParams.put(Consts.PK_PROCESS_CD, Consts.EDI_PROCESS_CHECKING);
                        resultMap = dao.callERProcessing(callParams);

                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }

                    // ER_PROCESSING_AFTER 호출
                    ts = beginTrans();
                    try {
                        resultMap = dao.callERProcessingAfter(callParams);

                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            throw new RuntimeException(oMsg);
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                        throw new RuntimeException(Util.getErrorMessage(e));
                    }
                } catch (Exception e) {
                } finally {
                    AuthenticationUtil.clearAuthentication();
                }
            }
        }).start();
    }

    /**
     * [CJ대한통운] 주소정제 웹서비스 호출
     *
     * @param params
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_PROCESS_CD          프로세스코드(A: 출고예정, B: 출고등록)
     * P_CHECKED_VALUE       프로세스코드에 맞는 출고정보 및 택배기준(운송사/고객사/택배사구분)정보
     * P_USER_ID             사용자ID
     * P_THREAD_YN           쓰레드로 동작할지 여부, 기본값 N
     *        </pre>
     * @return
     */
    public void callAcsGetAddressCJ(final Map<String, Object> params) {

        // TODO: 2023-05, since 7.5.0, 기존 호출로직 변경, 사용시 테스트 필요, 테스트 후 해당 주석 라인 삭제
        List<Map<String, Object>> dsAcsGetAddress = null;
        TransactionStatus ts = beginTrans();
        try {
            getDefaultDao().insertCheckedValue(params);
            dsAcsGetAddress = getDataList(SELECT_ID_GET_ACS_INFO_CJ_SOAP, params);
        } finally {
            rollbackTrans(ts);
        }
        if (dsAcsGetAddress == null || dsAcsGetAddress.size() == 0) {
            return;
        }

        // IFAPI 구분 값 입력
        params.put("P_IFAPI_DIV", "ACS_CJ");
        // 쓰레드 동작, 기본값 N
        String threadYn = Util.nullToDefault(params.get("P_THREAD_YN"), Consts.NO);
        if (Consts.YES.equals(threadYn)) {
            final List<Map<String, Object>> dsThreadAcsGetAddress = dsAcsGetAddress;
            new Thread(new Runnable() {

                @Override
                public void run() {
                    AuthenticationUtil.configureAuthentication();
                    try {
                        callAcsGetAddressCJ(params, dsThreadAcsGetAddress);
                    } catch (Exception e) {
                    } finally {
                        AuthenticationUtil.clearAuthentication();
                    }
                }
            }).start();

        } else {
            callAcsGetAddressCJ(params, dsAcsGetAddress);
        }
    }

    /**
     * CJ대한통운 SOAP 서비스 호출
     *
     * @param params
     * @param dsAddress
     */
    private void callAcsGetAddressCJ(Map<String, Object> params, List<Map<String, Object>> dsAcsGetAddress) {

        int acsTotal = dsAcsGetAddress.size();
        int acsProcess = 0;
        int acsError = 0;
        try {
            // 서비스 호출 기본정보 - 컬럼명 SP_로 시작, 입력시 P_로 변경하여 입력
            Map<String, Object> serviceParams = getServiceParams(params, dsAcsGetAddress.get(0));
            String errorCdParam = (String)serviceParams.get("P_ERROR_CD_PARAM");
            String errorMsgParam = (String)serviceParams.get("P_ERROR_MSG_PARAM");
            String execTimeParam = (String)serviceParams.get("P_EXEC_TIME_PARAM");
            String userId = (String)params.get(Consts.PK_USER_ID);
            Util.setOutMessage(params, Consts.OK);

            // 전표 단위 처리
            Map<String, Object> callParams = Util.newMap();
            Map<String, Object> dataValues = Util.newMap();
            String[] excludeDataKeys = new String[] {};
            for (Map<String, Object> rowData : dsAcsGetAddress) {
                boolean incAcsError = false;
                TransactionStatus ts = beginTrans();
                try {
                    // 주소정제 데이터 서비스호출/ 결과반영 키/값으로 변경
                    setParameter(rowData, excludeDataKeys, dataValues, callParams);
                    // 추가 정보 파라메터에 추가
                    callParams.put(Consts.PK_USER_ID, userId);
                    callParams.put("P_REQUEST_PARAMS", dataValues);

                    long startTime = System.currentTimeMillis();
                    Map<String, Object> resultMap = callAcsServiceWithSoap(serviceParams, callParams);
                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        resultMap.put(errorCdParam, "-1");
                        resultMap.put(errorMsgParam, oMsg);
                        incAcsError = true;
                    } else if (Consts.YES.equals(resultMap.get("O_ACS_ERROR_YN"))) {
                        incAcsError = true;
                    }
                    if (Util.isNotNull(execTimeParam)) {
                        resultMap.put(execTimeParam, String.format("%.2f", (System.currentTimeMillis() - startTime) / 1000f));
                    }
                    acsProcess++;

                    Map<String, Object> callResultMap = callProcedure(SP_ID_PROCESSING_ACS_RESULT_CJ, resultMap);
                    oMsg = Util.getOutMessage(callResultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }

                    commitTrans(ts);
                    if (incAcsError) {
                        acsError++;
                    }
                } catch (Exception e) {
                    acsError++;
                    rollbackTrans(ts);
                }
            }
        } catch (Exception e) {
            Util.setOutMessage(params, Util.getErrorMessage(e));
        }
        // 처리건수 및 오류건수 리턴
        params.put("O_TOTAL_CNT", acsTotal);
        params.put("O_PROCESS_CNT", acsProcess);
        params.put("O_ERROR_CNT", acsError);
    }

    /**
     * SOAP Response Message 생성
     * <pre style="font-family: GulimChe; font-size: 12px;">
     * <b>Sample message</b><br>
     * {@code
     * <?xml version="1.0" encoding="UTF-8"?>
     * <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
     *     <S:Body>
     *         <ns2:getMsgResponse xmlns:ns2="http://endpoint.sample.com/">
     *             <return>Response message</return>
     *         </ns2:getMsgResponse>
     *     </S:Body>
     * </S:Envelope>
     * }
     * </pre>
     *
     * @param serviceParams
     *        서비스 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_WEBSERVICE_URL          SOAP Url
     * P_METHOD_NM               SOAP Method Name
     * P_NS_PREFIX               SOAP Message Namespace prefix Name
     * P_NS_URI                  SOAP Message Namespace Uri
     * P_HEADER_PARAM_MAP        SOAP 호출 Header에 추가할 값, key1=value || WD.C_CR || key2=value
     * P_CONN_TIMEOUT            서비스 Connection Timeout(초)
     * P_READ_TIMEOUT            서비스 Data Read Timeout(초)
     * P_DATA_TAG                SOAP 호출 데이터가 입력될 상위 태그명
     * P_RESULT_TAG              결과 정보를 읽을 상위 태그명
     * P_RESULT_LIST_TAG         결과 정보가 리스트형태일 경우 읽을 태그명
     * P_RESULT_SUB_NODE_YN      리스트 결과 정보에서 값을 읽을 경우 서브 노드에서 읽을지 현재 노드에서 읽을지 여부
     * P_RESULT_TAG_PARAM_MAP    결과 정보에서 읽은 태그 값을 반영할 때 사용할 파라메터 매핑
     * P_RESULT_CD_TAG           결과 정보에서 처리결과 코드를 읽을 태그명
     * P_RESULT_MSG_TAG          결과 정보에서 처리결과 메시지를 읽을 태그명
     * P_ERROR_CD_PARAM          결과 정보에서 처리결과 코드를 읽을 파라메터명
     * P_ERROR_MSG_PARAM         결과 정보에서 처리결과 메시지를 읽을 파라메터명
     * P_EXEC_TIME_PARAM         처리 응답시간을 기록할 파라메터명, NULL 허용
     *        </pre>
     * @param callParams
     *        결과반영 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_...                     기본 파라메터, P_로 시작하는 컬럼
     * P_REQUEST_PARAMS          Request Parameter Hashmap, DV로 시작하는 컬럼
     *        </pre>
     * @param soapResponse
     * @return Map
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> getAcsResponseCJ(Map<String, Object> serviceParams, Map<String, Object> callParams, SOAPMessage soapResponse) {

        Map<String, Object> resultMap = Util.newMap(callParams);
        Util.setOutMessage(resultMap, Consts.OK);
        try {
            // GZip 압축 체크, 변경
            SOAPMessage resultMessage = decompressMessage(soapResponse);
            // Message Body Parsing
            SOAPBody soapBody = resultMessage.getSOAPBody();
            if (soapBody.hasFault()) {
                SOAPFault fault = soapBody.getFault();
                throw new RuntimeException(String.format(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "서비스 호출 오류\n오류코드: %s, 오류내역: %s"),
                    fault.getFaultCode(), fault.getFaultString()));
            }

            String resultTag = (String)serviceParams.get("P_RESULT_TAG");
            String resultListTag = (String)serviceParams.get("P_RESULT_LIST_TAG");
            String resultSubNodeYn = Util.nullToDefault(serviceParams.get("P_RESULT_SUB_NODE_YN"), Consts.YES);
            NodeList resultTagNodes = soapBody.getElementsByTagName(resultTag);
            if (resultTagNodes == null || resultTagNodes.getLength() == 0) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[P_RESULT_TAG]서비스 호출 결과 데이터가 존재하지 않습니다."));
            }

            // Result Tag Mapping 정보, 매핑정보가 없으면 XML 태그 정보로 리턴
            Map<String, Object> resultTagParams = (Map<String, Object>)serviceParams.get("P_RESULT_TAG_PARAMS");
            if (resultTagParams == null) {
                resultTagParams = Util.newMap();
            }

            // 1 레코드, 멀티 레코드 기본 Result Tag에서 기본 처리
            for (int rIndex = 0, rCount = resultTagNodes.getLength(); rIndex < rCount; rIndex++) {
                // Result Tag Node
                NodeList resultTagNode = (NodeList)resultTagNodes.item(rIndex);
                for (int cIndex = 0, cCount = resultTagNode.getLength(); cIndex < cCount; cIndex++) {
                    // Result Tag Sub Node
                    Node node = resultTagNode.item(cIndex);
                    resultMap.put(Util.nullToDefault(resultTagParams.get(node.getNodeName()), node.getNodeName()), node.getTextContent());
                }
            }

            // 멀티 레코드일 경우 List에서 추가 처리
            if (Util.isNotNull(resultListTag)) {
                // Result Tag에서 매핑정보에 해당하는 항목 검색하여 Map에 입력
                for (int rIndex = 0, rCount = resultTagNodes.getLength(); rIndex < rCount; rIndex++) {
                    // Result Tag Node
                    NodeList resultTagNode = (NodeList)resultTagNodes.item(rIndex);
                    for (int cIndex = 0, cCount = resultTagNode.getLength(); cIndex < cCount; cIndex++) {
                        // Result Tag Sub Node
                        Node node = resultTagNode.item(cIndex);
                        resultMap.put(Util.nullToDefault(resultTagParams.get(node.getNodeName()), node.getNodeName()), node.getTextContent());
                    }
                }

                // Result List Tag에서 매핑정보에 해당하는 항목 검색하여 List에 입력
                ArrayList<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
                NodeList resultListTagNodes = soapBody.getElementsByTagName(resultListTag);
                // Result List Tag에서 값을 읽을 때 SubNode에서 읽을 경우
                if (Consts.YES.equals(resultSubNodeYn)) {
                    for (int rIndex = 0, rCount = resultListTagNodes.getLength(); rIndex < rCount; rIndex++) {
                        // Result List Tag Node
                        NodeList resultListTagNode = (NodeList)resultListTagNodes.item(rIndex);
                        Map<String, Object> resultListTagSubNode = Util.newMap();
                        for (int cIndex = 0, cCount = resultListTagNode.getLength(); cIndex < cCount; cIndex++) {
                            // Result List Tag Sub Node
                            Node node = resultListTagNode.item(cIndex);
                            resultListTagSubNode.put(Util.nullToDefault(resultTagParams.get(node.getNodeName()), node.getNodeName()),
                                node.getTextContent());
                        }
                        resultList.add(resultListTagSubNode);
                    }
                }
                // Result List Tag명으로 값이 들어 있을 경우
                else {
                    // Result List Tag -> ResultMap Key 명칭
                    String resultListTagKey = Util.nullToDefault(resultTagParams.get(resultListTag), resultListTag);
                    for (int rIndex = 0, rCount = resultListTagNodes.getLength(); rIndex < rCount; rIndex++) {
                        // Result List Tag Node
                        Node node = resultListTagNodes.item(rIndex);
                        Map<String, Object> resultListItem = Util.newMap();
                        resultListItem.put(resultListTagKey, node.getTextContent());
                        resultList.add(resultListItem);
                    }
                }
                resultMap.put(resultListTag, resultList);
            }

            String errorCdParam = (String)serviceParams.get("P_ERROR_CD_PARAM");
            String resultCdSuccess = Util.nullToDefault(serviceParams.get("P_RESULT_CD_SUCCESS"), "0");
            // resultCdTag(errorCd)가 없거나 정상 코드일 경우 주소정제 정상 값으로 세팅
            String resultCd = (String)resultMap.get(errorCdParam);
            if (Util.isNull(resultCd) || !resultCdSuccess.equals(resultCd)) {
                resultMap.put(errorCdParam, Util.nullToDefault(resultCd, "-1"));
                resultMap.put("O_ACS_ERROR_YN", Consts.YES);
            } else {
                resultMap.put(errorCdParam, "0");
            }
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        }

        return resultMap;
    }

    /**
     * SOAP Message 전송<br>
     * <pre style="font-family: GulimChe; font-size: 12px;">
     * <b>Sample message</b><br>
     * {@code
     * ----------SOAP Request------------
     *
     *  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
     *      xmlns:ns1="http://endpoint.sample.com/">
     *      <soapenv:Header/>
     *      <soapenv:Body>
     *          <ns1:getMsg>
     *              <arg0>Send message</arg0>
     *          </ns1:getMsg>
     *      </soapenv:Body>
     *  </soapenv:Envelope>
     *
     *  ----------SOAP Response-----------
     *
     *  <?xml version="1.0" encoding="UTF-8"?>
     *  <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
     *      <S:Body>
     *          <ns2:getMsgResponse xmlns:ns2="http://endpoint.sample.com/">
     *              <return>Response message</return>
     *          </ns2:getMsgResponse>
     *      </S:Body>
     *  </S:Envelope>
     *  }
     * </pre>
     *
     * @param serviceParams
     *        서비스 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_WEBSERVICE_URL          SOAP Url
     * P_METHOD_NM               SOAP Method Name
     * P_NS_PREFIX               SOAP Message Namespace prefix Name
     * P_NS_URI                  SOAP Message Namespace Uri
     * P_HEADER_PARAM_MAP        SOAP 호출 Header에 추가할 값, key1=value || WD.C_CR || key2=value
     * P_CONN_TIMEOUT            서비스 Connection Timeout(초)
     * P_READ_TIMEOUT            서비스 Data Read Timeout(초)
     * P_DATA_TAG                SOAP 호출 데이터가 입력될 상위 태그명
     * P_RESULT_TAG              결과 정보를 읽을 상위 태그명
     * P_RESULT_LIST_TAG         결과 정보가 리스트형태일 경우 읽을 태그명
     * P_RESULT_SUB_NODE_YN      리스트 결과 정보에서 값을 읽을 경우 서브 노드에서 읽을지 현재 노드에서 읽을지 여부
     * P_RESULT_TAG_PARAM_MAP    결과 정보에서 읽은 태그 값을 반영할 때 사용할 파라메터 매핑
     * P_RESULT_CD_TAG           결과 정보에서 처리결과 코드를 읽을 태그명
     * P_RESULT_MSG_TAG          결과 정보에서 처리결과 메시지를 읽을 태그명
     * P_ERROR_CD_PARAM          결과 정보에서 처리결과 코드를 읽을 파라메터명
     * P_ERROR_MSG_PARAM         결과 정보에서 처리결과 메시지를 읽을 파라메터명
     * P_EXEC_TIME_PARAM         처리 응답시간을 기록할 파라메터명, NULL 허용
     *        </pre>
     * @param callParams
     *        결과반영 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_...                     기본 파라메터, P_로 시작하는 컬럼
     * P_REQUEST_PARAMS          Request Parameter Hashmap, DV로 시작하는 컬럼
     *        </pre>
     * @return Map
     */
    private Map<String, Object> callAcsServiceWithSoap(Map<String, Object> serviceParams, Map<String, Object> callParams) {

        Map<String, Object> resultMap = Util.newMap();
        Util.setOutMessage(resultMap, Consts.OK);

        SOAPConnection soapConnection = null;
        try {
            String webServiceUrl = (String)serviceParams.get("P_WEBSERVICE_URL");
            if (Util.isNull(webServiceUrl)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[P_WEBSERVICE_URL]서비스 호출 Url이 지정되지 않았습니다."));
            }
            // Connection 생성
            soapConnection = soapConnectionFactory.createConnection();
            // 호출 Request 생성
            SOAPMessage soapRequest = getRequestPayload(serviceParams, callParams);
            // Timeout 세팅을 위해 호출 방법 변경
            URL endpoint = new URL(null, webServiceUrl, new NexosURLStreamHandler( //
                Math.min(Util.toInt(serviceParams.get("P_CONN_TIMEOUT"), 5), 5), //
                Math.min(Util.toInt(serviceParams.get("P_READ_TIMEOUT"), 20), 20) //
            ));
            SOAPMessage soapResponse = soapConnection.call(soapRequest, endpoint);
            // 서비스 호출 결과 파싱, 결과 파싱 방식이 다를 경우 getAcsResponseCJ 대신 별도 메서드를 만들고 지정
            switch ((String)serviceParams.get("P_IFAPI_DIV")) {
                case "ACS_CJ":
                    resultMap = getAcsResponseCJ(serviceParams, callParams, soapResponse);
                    break;
                default:
                    Util.setOutMessage(resultMap, NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[SOAP]서비스 호출 방식이 잘못 지정되었습니다."));
                    break;
            }
            // logger.debug("sendSoapMessage[Result]: " + resultMap.toString());
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        } finally {
            if (soapConnection != null) {
                try {
                    soapConnection.close();
                } catch (SOAPException e) {
                }
            }
        }

        return resultMap;
    }

    /**
     * [심평원] 표준코드 조회 웹서비스 호출
     *
     * @param params
     *        <br>
     *        P_CHECKED_VALUE: 표준코드<br>
     *        P_USER_ID: 사용자ID<br>
     *        P_THREAD_YN: 쓰레드로 동작할지 여부<br>
     *        P_QUERY_ID: 결과 반영할 쿼리ID, 쓰레드로 동작할려면 결과반영할 쿼리ID가 존재해야 함, 없으면 오류
     * @return
     */
    public Map<String, Object> callKpisGetStdCd(final Map<String, Object> params) {

        // TODO: 2023-05, since 7.5.0, 기존 호출로직 변경, 사용시 테스트 필요, 테스트 후 해당 주석 라인 삭제
        List<Map<String, Object>> dsKpisGetInfo = null;
        TransactionStatus ts = beginTrans();
        try {
            getDefaultDao().insertCheckedValue(params);
            dsKpisGetInfo = getDataList(SELECT_ID_GET_KPIS_INFO_STD_CD, params);
        } finally {
            rollbackTrans(ts);
        }
        if (dsKpisGetInfo == null || dsKpisGetInfo.size() == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "표준코드 조회 서비스를 호출할 표준코드 데이터가 존재하지 않습니다."));
        }

        // IFAPI 구분 값 입력
        params.put("P_IFAPI_DIV", "KPIS_STDCD");
        // 쓰레드 동작, 기본값 N
        String threadYn = Util.nullToDefault(params.get("P_THREAD_YN"), Consts.NO);
        String queryId = (String)params.get("P_QUERY_ID");
        if (Consts.YES.equals(threadYn)) {
            if (Util.isNull(queryId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "쓰레드로 동작하기 위해선 쿼리ID를 지정해야 합니다."));
            }

            final List<Map<String, Object>> dsThreadKpisGetInfo = dsKpisGetInfo;
            new Thread(new Runnable() {

                @Override
                public void run() {
                    AuthenticationUtil.configureAuthentication();
                    try {
                        callKpisGetAny(params, dsThreadKpisGetInfo);
                    } catch (Exception e) {
                    } finally {
                        AuthenticationUtil.clearAuthentication();
                    }
                }
            }).start();
            return null;
        } else {
            if (dsKpisGetInfo.size() > 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "처리 결과를 받을 경우 1건만 처리 가능합니다."));
            }
            return callKpisGetAny(params, dsKpisGetInfo);
        }
    }

    /**
     * [심평원] RFID 조회 웹서비스 호출
     *
     * @param params
     *        <br>
     *        P_CHECKED_VALUE: RFID태그코드;RFID일련번호<br>
     *        P_USER_ID: 사용자ID<br>
     *        P_THREAD_YN: 쓰레드로 동작할지 여부<br>
     *        P_QUERY_ID: 결과 반영할 쿼리ID, 쓰레드로 동작할려면 결과반영할 쿼리ID가 존재해야 함, 없으면 오류
     * @return
     */
    public Map<String, Object> callKpisGetRfid(final Map<String, Object> params) {

        // TODO: 2023-05, since 7.5.0, 기존 호출로직 변경, 사용시 테스트 필요, 테스트 후 해당 주석 라인 삭제
        List<Map<String, Object>> dsKpisGetInfo = null;
        TransactionStatus ts = beginTrans();
        try {
            getDefaultDao().insertCheckedValue(params);
            dsKpisGetInfo = getDataList(SELECT_ID_GET_KPIS_INFO_RFID, params);
        } finally {
            rollbackTrans(ts);
        }
        if (dsKpisGetInfo == null || dsKpisGetInfo.size() == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "RFID 조회 서비스를 호출할 태그/일련번호 데이터가 존재하지 않습니다."));
        }

        // IFAPI 구분 값 입력
        params.put("P_IFAPI_DIV", "KPIS_RFID");
        // 쓰레드 동작, 기본값 N
        String threadYn = Util.nullToDefault(params.get("P_THREAD_YN"), Consts.NO);
        String queryId = (String)params.get("P_QUERY_ID");
        if (Consts.YES.equals(threadYn)) {
            if (Util.isNull(queryId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "쓰레드로 동작하기 위해선 쿼리ID를 지정해야 합니다."));
            }

            final List<Map<String, Object>> dsThreadKpisGetInfo = dsKpisGetInfo;
            new Thread(new Runnable() {

                @Override
                public void run() {
                    AuthenticationUtil.configureAuthentication();
                    try {
                        callKpisGetAny(params, dsThreadKpisGetInfo);
                    } catch (Exception e) {
                    } finally {
                        AuthenticationUtil.clearAuthentication();
                    }
                }
            }).start();
            return null;
        } else {
            if (dsKpisGetInfo.size() > 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "처리 결과를 받을 경우 1건만 처리 가능합니다."));
            }
            return callKpisGetAny(params, dsKpisGetInfo);
        }
    }

    /**
     * [심평원] 묶음번호(최소박스) 조회 웹서비스 호출
     *
     * @param params
     *        <br>
     *        P_CHECKED_VALUE: 묶음번호(상위묶음번호)<br>
     *        P_USER_ID: 사용자ID<br>
     *        P_THREAD_YN: 쓰레드로 동작할지 여부<br>
     *        P_QUERY_ID: 결과 반영할 쿼리ID, 쓰레드로 동작할려면 결과반영할 쿼리ID가 존재해야 함, 없으면 오류
     * @return
     */
    public Map<String, Object> callKpisGetBNo(final Map<String, Object> params) {

        // TODO: 2023-05, since 7.5.0, 기존 호출로직 변경, 사용시 테스트 필요, 테스트 후 해당 주석 라인 삭제
        List<Map<String, Object>> dsKpisGetInfo = null;
        TransactionStatus ts = beginTrans();
        try {
            getDefaultDao().insertCheckedValue(params);
            dsKpisGetInfo = getDataList(SELECT_ID_GET_KPIS_INFO_BNO, params);
        } finally {
            rollbackTrans(ts);
        }
        if (dsKpisGetInfo == null || dsKpisGetInfo.size() == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "묶음번호(최소박스) 조회 서비스를 호출할 묶음번호(상위묶음번호) 데이터가 존재하지 않습니다."));
        }

        // IFAPI 구분 값 입력
        params.put("P_IFAPI_DIV", "KPIS_BNO");
        // 쓰레드 동작, 기본값 N
        String threadYn = Util.nullToDefault(params.get("P_THREAD_YN"), Consts.NO);
        String queryId = (String)params.get("P_QUERY_ID");
        if (Consts.YES.equals(threadYn)) {
            if (Util.isNull(queryId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "쓰레드로 동작하기 위해선 쿼리ID를 지정해야 합니다."));
            }

            final List<Map<String, Object>> dsThreadKpisGetInfo = dsKpisGetInfo;
            new Thread(new Runnable() {

                @Override
                public void run() {
                    AuthenticationUtil.configureAuthentication();
                    try {
                        callKpisGetAny(params, dsThreadKpisGetInfo);
                    } catch (Exception e) {
                    } finally {
                        AuthenticationUtil.clearAuthentication();
                    }
                }
            }).start();
            return null;
        } else {
            if (dsKpisGetInfo.size() > 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "처리 결과를 받을 경우 1건만 처리 가능합니다."));
            }
            return callKpisGetAny(params, dsKpisGetInfo);
        }
    }

    /**
     * [심평원] 묶음번호(일련번호) 조회 웹서비스 호출
     *
     * @param params
     *        <br>
     *        P_CHECKED_VALUE: 묶음번호(최소묶음(박스)번호)<br>
     *        P_USER_ID: 사용자ID<br>
     *        P_THREAD_YN: 쓰레드로 동작할지 여부<br>
     *        P_QUERY_ID: 결과 반영할 쿼리ID, 쓰레드로 동작할려면 결과반영할 쿼리ID가 존재해야 함, 없으면 오류
     * @return
     */
    public Map<String, Object> callKpisGetSNo(final Map<String, Object> params) {

        // TODO: 2023-05, since 7.5.0, 기존 호출로직 변경, 사용시 테스트 필요, 테스트 후 해당 주석 라인 삭제
        List<Map<String, Object>> dsKpisGetInfo = null;
        TransactionStatus ts = beginTrans();
        try {
            getDefaultDao().insertCheckedValue(params);
            dsKpisGetInfo = getDataList(SELECT_ID_GET_KPIS_INFO_SNO, params);
        } finally {
            rollbackTrans(ts);
        }
        if (dsKpisGetInfo == null || dsKpisGetInfo.size() == 0) {
            throw new RuntimeException(
                NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "묶음번호(일련번호) 조회 서비스를 호출할 묶음번호(최소묶음(박스)번호) 데이터가 존재하지 않습니다."));
        }

        // IFAPI 구분 값 입력
        params.put("P_IFAPI_DIV", "KPIS_SNO");
        // 쓰레드 동작, 기본값 N
        String threadYn = Util.nullToDefault(params.get("P_THREAD_YN"), Consts.NO);
        String queryId = (String)params.get("P_QUERY_ID");
        if (Consts.YES.equals(threadYn)) {
            if (Util.isNull(queryId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "쓰레드로 동작하기 위해선 쿼리ID를 지정해야 합니다."));
            }

            final List<Map<String, Object>> dsThreadKpisGetInfo = dsKpisGetInfo;
            new Thread(new Runnable() {

                @Override
                public void run() {
                    AuthenticationUtil.configureAuthentication();
                    try {
                        callKpisGetAny(params, dsThreadKpisGetInfo);
                    } catch (Exception e) {
                    } finally {
                        AuthenticationUtil.clearAuthentication();
                    }
                }
            }).start();
            return null;
        } else {
            if (dsKpisGetInfo.size() > 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "처리 결과를 받을 경우 1건만 처리 가능합니다."));
            }
            return callKpisGetAny(params, dsKpisGetInfo);
        }
    }

    /**
     * [심평원] 묶음번호(일련번호) 상세 조회 웹서비스 호출
     *
     * @param params
     *        <br>
     *        P_CHECKED_VALUE: 최소묶음(박스)번호<br>
     *        P_USER_ID: 사용자ID<br>
     *        P_THREAD_YN: 쓰레드로 동작할지 여부<br>
     *        P_QUERY_ID: 결과 반영할 쿼리ID, 쓰레드로 동작할려면 결과반영할 쿼리ID가 존재해야 함, 없으면 오류
     * @return
     */
    public Map<String, Object> callKpisGetSNoDetail(final Map<String, Object> params) {

        // TODO: 2023-05, since 7.5.0, 기존 호출로직 변경, 사용시 테스트 필요, 테스트 후 해당 주석 라인 삭제
        List<Map<String, Object>> dsKpisGetInfo = null;
        TransactionStatus ts = beginTrans();
        try {
            getDefaultDao().insertCheckedValue(params);
            dsKpisGetInfo = getDataList(SELECT_ID_GET_KPIS_INFO_SNO_DETAIL, params);
        } finally {
            rollbackTrans(ts);
        }
        if (dsKpisGetInfo == null || dsKpisGetInfo.size() == 0) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "묶음번호(일련번호) 상세 조회 서비스를 호출할 최소묶음(박스)번호 데이터가 존재하지 않습니다."));
        }

        // IFAPI 구분 값 입력
        params.put("P_IFAPI_DIV", "KPIS_SNODETAIL");
        // 쓰레드 동작, 기본값 N
        String threadYn = Util.nullToDefault(params.get("P_THREAD_YN"), Consts.NO);
        String queryId = (String)params.get("P_QUERY_ID");
        if (Consts.YES.equals(threadYn)) {
            if (Util.isNull(queryId)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "쓰레드로 동작하기 위해선 쿼리ID를 지정해야 합니다."));
            }

            final List<Map<String, Object>> dsThreadKpisGetInfo = dsKpisGetInfo;
            new Thread(new Runnable() {

                @Override
                public void run() {
                    AuthenticationUtil.configureAuthentication();
                    try {
                        callKpisGetAny(params, dsThreadKpisGetInfo);
                    } catch (Exception e) {
                    } finally {
                        AuthenticationUtil.clearAuthentication();
                    }
                }
            }).start();
            return null;
        } else {
            if (dsKpisGetInfo.size() > 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JJAVA.EDSOAPSERVICE.XXX", "처리 결과를 받을 경우 1건만 처리 가능합니다."));
            }
            return callKpisGetAny(params, dsKpisGetInfo);
        }
    }

    /**
     * 심평원 SOAP 서비스 호출
     *
     * @param params
     * @param dsKpisGetInfo
     * @return
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> callKpisGetAny(Map<String, Object> params, List<Map<String, Object>> dsKpisGetInfo) {

        Map<String, Object> resultMap = Util.newMap();
        Util.setOutMessage(resultMap, Consts.OK);
        try {
            // 서비스 호출 기본정보 - 컬럼명 SP_로 시작, 입력시 P_로 변경하여 입력
            Map<String, Object> serviceParams = getServiceParams(params, dsKpisGetInfo.get(0));
            Map<String, Object> resultTagParams = (Map<String, Object>)serviceParams.get("P_RESULT_TAG_PARAMS");
            String execTimeParam = (String)serviceParams.get("P_EXEC_TIME_PARAM");
            String userId = (String)params.get(Consts.PK_USER_ID);
            String queryId = (String)params.get("P_QUERY_ID");
            Util.setOutMessage(params, Consts.OK);

            // 레코드 단위 처리
            Map<String, Object> callParams = Util.newMap();
            Map<String, Object> dataValues = Util.newMap();
            String[] excludeDataKeys = new String[] {};
            // 결과 List로 리턴
            if (Util.isNull(queryId)) {
                for (Map<String, Object> rowData : dsKpisGetInfo) {
                    // 주소정제 데이터 서비스호출/ 결과반영 키/값으로 변경
                    setParameter(rowData, excludeDataKeys, dataValues, callParams);

                    // 추가 정보 파라메터에 추가
                    callParams.put(Consts.PK_USER_ID, userId);
                    callParams.put("P_REQUEST_PARAMS", dataValues);

                    // long startTime = System.currentTimeMillis();
                    resultMap = callKpisServiceWithSoap(serviceParams, callParams);
                    String oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        resultMap.put((String)resultTagParams.get(serviceParams.get("P_RESULT_CD_TAG")), "-1");
                        resultMap.put((String)resultTagParams.get(serviceParams.get("P_RESULT_MSG_TAG")), oMsg);
                    }
                    // resultMap.put(responseTimeParamNm, String.format("%.2f", (System.currentTimeMillis() - startTime) / 1000f));
                }
            }
            // 결과 DB에 반영
            else {
                for (Map<String, Object> rowData : dsKpisGetInfo) {
                    // 주소정제 데이터 서비스호출/ 결과반영 키/값으로 변경
                    setParameter(rowData, excludeDataKeys, dataValues, callParams);

                    TransactionStatus ts = beginTrans();
                    try {
                        // 추가 정보 파라메터에 추가
                        callParams.put(Consts.PK_USER_ID, userId);
                        callParams.put("P_REQUEST_PARAMS", dataValues);

                        long startTime = System.currentTimeMillis();
                        resultMap = callKpisServiceWithSoap(serviceParams, callParams);
                        String oMsg = Util.getOutMessage(resultMap);
                        if (!Consts.OK.equals(oMsg)) {
                            resultMap.put((String)resultTagParams.get(serviceParams.get("P_RESULT_CD_TAG")), "-1");
                            resultMap.put((String)resultTagParams.get(serviceParams.get("P_RESULT_MSG_TAG")), oMsg);
                        }
                        if (Util.isNotNull(execTimeParam)) {
                            resultMap.put(execTimeParam, String.format("%.2f", (System.currentTimeMillis() - startTime) / 1000f));
                        }

                        List<Map<String, Object>> dsResult = (List<Map<String, Object>>)resultMap.get(serviceParams.get("P_RESULT_LIST_TAG"));
                        Map<String, Object> soapResultParams = Util.newMap();
                        for (int rIndex = 0, rCount = dsResult.size(); rIndex < rCount; rIndex++) {
                            soapResultParams.clear();
                            // 기본 파라메터 추가
                            soapResultParams.putAll(callParams);
                            // 서비스 호출 결과 데이터 파라메터로 추가
                            soapResultParams.putAll(dsResult.get(rIndex));
                            Map<String, Object> callResultMap = callProcedure(queryId, soapResultParams);
                            oMsg = Util.getOutMessage(callResultMap);
                            if (!Consts.OK.equals(oMsg)) {
                                throw new RuntimeException(oMsg);
                            }
                        }
                        commitTrans(ts);
                    } catch (Exception e) {
                        rollbackTrans(ts);
                    }
                }
            }
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        }
        return resultMap;
    }

    /**
     * SOAP Response Message 생성
     * <pre style="font-family: GulimChe; font-size: 12px;">
     * <b>Sample message</b><br>
     * {@code
     * <?xml version="1.0" encoding="UTF-8"?>
     * <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
     *     <S:Body>
     *         <ns2:getMsgResponse xmlns:ns2="http://endpoint.sample.com/">
     *             <return>Response message</return>
     *         </ns2:getMsgResponse>
     *     </S:Body>
     * </S:Envelope>
     * }
     * </pre>
     *
     * @param serviceParams
     *        서비스 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_WEBSERVICE_URL          SOAP Url
     * P_METHOD_NM               SOAP Method Name
     * P_NS_PREFIX               SOAP Message Namespace prefix Name
     * P_NS_URI                  SOAP Message Namespace Uri
     * P_HEADER_PARAM_MAP        SOAP 호출 Header에 추가할 값, key1=value || WD.C_CR || key2=value
     * P_CONN_TIMEOUT            서비스 Connection Timeout(초)
     * P_READ_TIMEOUT            서비스 Data Read Timeout(초)
     * P_DATA_TAG                SOAP 호출 데이터가 입력될 상위 태그명
     * P_RESULT_TAG              결과 정보를 읽을 상위 태그명
     * P_RESULT_LIST_TAG         결과 정보가 리스트형태일 경우 읽을 태그명
     * P_RESULT_SUB_NODE_YN      리스트 결과 정보에서 값을 읽을 경우 서브 노드에서 읽을지 현재 노드에서 읽을지 여부
     * P_RESULT_TAG_PARAM_MAP    결과 정보에서 읽은 태그 값을 반영할 때 사용할 파라메터 매핑
     * P_RESULT_CD_TAG           결과 정보에서 처리결과 코드를 읽을 태그명
     * P_RESULT_MSG_TAG          결과 정보에서 처리결과 메시지를 읽을 태그명
     * P_ERROR_CD_PARAM          결과 정보에서 처리결과 코드를 읽을 파라메터명
     * P_ERROR_MSG_PARAM         결과 정보에서 처리결과 메시지를 읽을 파라메터명
     * P_EXEC_TIME_PARAM         처리 응답시간을 기록할 파라메터명, NULL 허용
     *        </pre>
     * @param callParams
     *        결과반영 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_...                     기본 파라메터, P_로 시작하는 컬럼
     * P_REQUEST_PARAMS          Request Parameter Hashmap, DV로 시작하는 컬럼
     *        </pre>
     * @param soapResponse
     * @return Map
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> getKpisResponseAny(Map<String, Object> serviceParams, Map<String, Object> callParams, SOAPMessage soapResponse) {

        Map<String, Object> resultMap = Util.newMap(callParams);
        Util.setOutMessage(resultMap, Consts.OK);
        try {
            // GZip 압축 체크, 변경
            SOAPMessage resultMessage = decompressMessage(soapResponse);
            // Message Body Parsing
            SOAPBody soapBody = resultMessage.getSOAPBody();
            if (soapBody.hasFault()) {
                SOAPFault fault = soapBody.getFault();
                throw new RuntimeException(String.format(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "서비스 호출 오류\n오류코드: %s, 오류내역: %s"),
                    fault.getFaultCode(), fault.getFaultString()));
            }

            String resultTag = (String)serviceParams.get("P_RESULT_TAG");
            String resultListTag = (String)serviceParams.get("P_RESULT_LIST_TAG");
            String resultSubNodeYn = Util.nullToDefault(serviceParams.get("P_RESULT_SUB_NODE_YN"), Consts.YES);
            NodeList resultTagNodes = soapBody.getElementsByTagName(resultTag);
            if (resultTagNodes == null || resultTagNodes.getLength() == 0) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[P_RESULT_TAG]서비스 호출 결과 데이터가 존재하지 않습니다."));
            }

            // Result Tag Mapping 정보, 매핑정보가 없으면 XML 태그 정보로 리턴
            Map<String, Object> resultTagParams = (Map<String, Object>)serviceParams.get("P_RESULT_TAG_PARAMS");
            if (resultTagParams == null) {
                resultTagParams = Util.newMap();
            }

            // 1 레코드, 멀티 레코드 기본 Result Tag에서 기본 처리
            for (int rIndex = 0, rCount = resultTagNodes.getLength(); rIndex < rCount; rIndex++) {
                // Result Tag Node
                NodeList resultTagNode = (NodeList)resultTagNodes.item(rIndex);
                for (int cIndex = 0, cCount = resultTagNode.getLength(); cIndex < cCount; cIndex++) {
                    // Result Tag Sub Node
                    Node node = resultTagNode.item(cIndex);
                    resultMap.put(Util.nullToDefault(resultTagParams.get(node.getNodeName()), node.getNodeName()), node.getTextContent());
                }
            }

            // 멀티 레코드일 경우 List에서 추가 처리
            if (Util.isNotNull(resultListTag)) {
                // Result Tag에서 매핑정보에 해당하는 항목 검색하여 Map에 입력
                for (int rIndex = 0, rCount = resultTagNodes.getLength(); rIndex < rCount; rIndex++) {
                    // Result Tag Node
                    NodeList resultTagNode = (NodeList)resultTagNodes.item(rIndex);
                    for (int cIndex = 0, cCount = resultTagNode.getLength(); cIndex < cCount; cIndex++) {
                        // Result Tag Sub Node
                        Node node = resultTagNode.item(cIndex);
                        resultMap.put(Util.nullToDefault(resultTagParams.get(node.getNodeName()), node.getNodeName()), node.getTextContent());
                    }
                }

                // Result List Tag에서 매핑정보에 해당하는 항목 검색하여 List에 입력
                ArrayList<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
                NodeList resultListTagNodes = soapBody.getElementsByTagName(resultListTag);
                // Result List Tag에서 값을 읽을 때 SubNode에서 읽을 경우
                if (Consts.YES.equals(resultSubNodeYn)) {
                    for (int rIndex = 0, rCount = resultListTagNodes.getLength(); rIndex < rCount; rIndex++) {
                        // Result List Tag Node
                        NodeList resultListTagNode = (NodeList)resultListTagNodes.item(rIndex);
                        Map<String, Object> resultListTagSubNode = Util.newMap();
                        for (int cIndex = 0, cCount = resultListTagNode.getLength(); cIndex < cCount; cIndex++) {
                            // Result List Tag Sub Node
                            Node node = resultListTagNode.item(cIndex);
                            resultListTagSubNode.put(Util.nullToDefault(resultTagParams.get(node.getNodeName()), node.getNodeName()),
                                node.getTextContent());
                        }
                        resultList.add(resultListTagSubNode);
                    }
                }
                // Result List Tag명으로 값이 들어 있을 경우
                else {
                    // Result List Tag -> ResultMap Key 명칭
                    String resultListTagKey = Util.nullToDefault(resultTagParams.get(resultListTag), resultListTag);
                    for (int rIndex = 0, rCount = resultListTagNodes.getLength(); rIndex < rCount; rIndex++) {
                        // Result List Tag Node
                        Node node = resultListTagNodes.item(rIndex);
                        Map<String, Object> resultListItem = Util.newMap();
                        resultListItem.put(resultListTagKey, node.getTextContent());
                        resultList.add(resultListItem);
                    }
                }
                resultMap.put(resultListTag, resultList);
            }
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        }

        return resultMap;
    }

    /**
     * SOAP Message 전송<br>
     * <pre style="font-family: GulimChe; font-size: 12px;">
     * <b>Sample message</b><br>
     * {@code
     * ----------SOAP Request------------
     *
     *  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
     *      xmlns:ns1="http://endpoint.sample.com/">
     *      <soapenv:Header/>
     *      <soapenv:Body>
     *          <ns1:getMsg>
     *              <arg0>Send message</arg0>
     *          </ns1:getMsg>
     *      </soapenv:Body>
     *  </soapenv:Envelope>
     *
     *  ----------SOAP Response-----------
     *
     *  <?xml version="1.0" encoding="UTF-8"?>
     *  <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
     *      <S:Body>
     *          <ns2:getMsgResponse xmlns:ns2="http://endpoint.sample.com/">
     *              <return>Response message</return>
     *          </ns2:getMsgResponse>
     *      </S:Body>
     *  </S:Envelope>
     *  }
     * </pre>
     *
     * @param serviceParams
     *        서비스 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_WEBSERVICE_URL          SOAP Url
     * P_METHOD_NM               SOAP Method Name
     * P_NS_PREFIX               SOAP Message Namespace prefix Name
     * P_NS_URI                  SOAP Message Namespace Uri
     * P_HEADER_PARAM_MAP        SOAP 호출 Header에 추가할 값, key1=value || WD.C_CR || key2=value
     * P_CONN_TIMEOUT            서비스 Connection Timeout(초)
     * P_READ_TIMEOUT            서비스 Data Read Timeout(초)
     * P_DATA_TAG                SOAP 호출 데이터가 입력될 상위 태그명
     * P_RESULT_TAG              결과 정보를 읽을 상위 태그명
     * P_RESULT_LIST_TAG         결과 정보가 리스트형태일 경우 읽을 태그명
     * P_RESULT_SUB_NODE_YN      리스트 결과 정보에서 값을 읽을 경우 서브 노드에서 읽을지 현재 노드에서 읽을지 여부
     * P_RESULT_TAG_PARAM_MAP    결과 정보에서 읽은 태그 값을 반영할 때 사용할 파라메터 매핑
     * P_RESULT_CD_TAG           결과 정보에서 처리결과 코드를 읽을 태그명
     * P_RESULT_MSG_TAG          결과 정보에서 처리결과 메시지를 읽을 태그명
     * P_ERROR_CD_PARAM          결과 정보에서 처리결과 코드를 읽을 파라메터명
     * P_ERROR_MSG_PARAM         결과 정보에서 처리결과 메시지를 읽을 파라메터명
     * P_EXEC_TIME_PARAM         처리 응답시간을 기록할 파라메터명, NULL 허용
     *        </pre>
     * @param callParams
     *        결과반영 호출 파라메터
     *        <pre style="font-family: GulimChe; font-size: 12px;">
     * P_...                     기본 파라메터, P_로 시작하는 컬럼
     * P_REQUEST_PARAMS          Request Parameter Hashmap, DV로 시작하는 컬럼
     *        </pre>
     * @return Map
     */
    private Map<String, Object> callKpisServiceWithSoap(Map<String, Object> serviceParams, Map<String, Object> callParams) {

        Map<String, Object> resultMap = Util.newMap();
        Util.setOutMessage(resultMap, Consts.OK);

        SOAPConnection soapConnection = null;
        try {
            String webServiceUrl = (String)serviceParams.get("P_WEBSERVICE_URL");
            if (Util.isNull(webServiceUrl)) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[P_WEBSERVICE_URL]서비스 호출 Url이 지정되지 않았습니다."));
            }
            // Connection 생성
            soapConnection = soapConnectionFactory.createConnection();
            // 호출 Request 생성
            SOAPMessage soapRequest = getRequestPayload(serviceParams, callParams);
            // Timeout 세팅을 위해 호출 방법 변경
            URL endpoint = new URL(null, webServiceUrl, new NexosURLStreamHandler( //
                Math.min(Util.toInt(serviceParams.get("P_CONN_TIMEOUT"), 5), 5), //
                Math.min(Util.toInt(serviceParams.get("P_READ_TIMEOUT"), 20), 20) //
            ));
            SOAPMessage soapResponse = soapConnection.call(soapRequest, endpoint);
            // 서비스 호출 결과 파싱, 결과 파싱 방식이 다를 경우 getKpisResponseAny 대신 별도 메서드를 만들고 지정
            switch ((String)serviceParams.get("P_IFAPI_DIV")) {
                case "KPIS_BNO":
                case "KPIS_RFID":
                case "KPIS_SNO":
                case "KPIS_SNODETAIL":
                case "KPIS_STDCD":
                    resultMap = getKpisResponseAny(serviceParams, callParams, soapResponse);
                    break;
                default:
                    Util.setOutMessage(resultMap, NexosMessage.getDisplayMsg("JAVA.EDSOAPSERVICE.XXX", "[SOAP]서비스 호출 방식이 잘못 지정되었습니다."));
                    break;
            }
            // logger.debug("sendSoapMessage[Result]: " + resultMap.toString());
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        } finally {
            if (soapConnection != null) {
                try {
                    soapConnection.close();
                } catch (SOAPException e) {
                }
            }
        }

        return resultMap;
    }
}
