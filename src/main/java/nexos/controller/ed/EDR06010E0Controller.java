package nexos.controller.ed;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ControllerSupport;
import nexos.service.ed.EDR06010E0Service;
import nexos.service.ed.common.EDCommonService;

/**
 * Class: [수신]반출예정 관리<br>
 * Description: [수신]반출예정 관리 Controller<br>
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
@Controller
@RequestMapping("/EDR06010E0")
public class EDR06010E0Controller extends ControllerSupport {

    @Autowired
    private EDR06010E0Service service;

    @Autowired
    private EDCommonService   edCommonService;

    /**
     * 데이터 조회
     *
     * @param request
     *        HttpServletRequest
     * @param queryId
     *        쿼리ID
     * @param queryParams
     *        쿼리 호출 파라메터
     * @return
     */
    @RequestMapping(value = "/getDataSet.do", method = RequestMethod.POST)
    public ResponseEntity<String> getDataSet(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getDataSet(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * File(EXCEL, TEXT, XML, JSON) 수신 처리
     *
     * @param request
     * @param ediFile
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/recvFile.do", method = RequestMethod.POST)
    public ResponseEntity<String> recvFile(HttpServletRequest request, @RequestParam("P_UPLOAD_FILE") MultipartFile uploadFile,
        @RequestParam("P_UPLOAD_PARAMS") String uploadParams) {

        Map<String, Object> params = getParameter(uploadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        ResponseEntity<String> result = null;

        try {
            if (uploadFile == null || uploadFile.isEmpty()) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.017", "빈 파일입니다. 다른 파일을 선택하십시오."));
            }

            params.put("P_UPLOAD_FILE", uploadFile);
            params.put("P_FILE_DIV", "2"); // "2" - FILE_DIV_ATTACHMENT

            result = getResponseEntity(request, edCommonService.attachmentRecvProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * ER_PROCESSING 호출 - DBLink, DBConnect, 자료구분이 파일 형태(EXCEL, TEXT, XML, JSON)이면서 원격송수신 지정된 수신정의
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/recvProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> recvProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, edCommonService.manualRecvProcessing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * EDI 수신 데이터 및 해당 데이터로 생성된 예정 삭제 SP 호출
     *
     * @param params
     *        조회조건
     */
    @RequestMapping(value = "/callERROOrderDelete.do", method = RequestMethod.POST)
    public ResponseEntity<String> callERROOrderDelete(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callERROOrderDelete(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
