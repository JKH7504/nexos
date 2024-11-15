package nexos.controller.lo;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.OutputStream;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import nexos.framework.Consts;
import nexos.framework.NexosConsts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ControllerSupport;
import nexos.framework.support.NexosSupport;
import nexos.service.lo.LOB01010E0Service;

/**
 * Class: 출고예정작업 컨트롤러<br>
 * Description: 출고예정작업 Controller<br>
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
@RequestMapping("/LOB01010E0")
public class LOB01010E0Controller extends ControllerSupport {

    @Autowired
    private LOB01010E0Service service;

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
     * 첨부파일 업로드 처리
     *
     * @param request
     * @param uploadFile
     * @param uploadParams
     * @return
     */
    @RequestMapping(value = "/attachmentFileUpload.do", method = RequestMethod.POST)
    public ResponseEntity<String> attachmentFileUpload(HttpServletRequest request, @RequestParam("P_UPLOAD_FILE") MultipartFile uploadFile,
        @RequestParam("P_UPLOAD_PARAMS") String uploadParams) {

        Map<String, Object> params = getParameter(uploadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        ResponseEntity<String> result = null;

        try {
            params.put("P_UPLOAD_FILE", uploadFile);

            result = getResponseEntity(request, service.attachmentFileUpload(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 첨부파일 삭제 처리
     *
     * @param request
     * @param uploadFile
     * @param uploadParams
     * @return
     */
    @RequestMapping(value = "/attachmentFileDelete.do", method = RequestMethod.POST)
    public ResponseEntity<String> attachmentFileDelete(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.attachmentFileDelete(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 첨부파일 다운로드 처리
     *
     * @param request
     * @param response
     * @param downloadParams
     * @return
     */
    @RequestMapping(value = "/attachmentFileDownload.do", method = RequestMethod.POST)
    public ResponseEntity<String> attachmentFileDownload(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("P_DOWNLOAD_PARAMS") String downloadParams) {

        ResponseEntity<String> result = null;

        Map<String, Object> params = getParameter(downloadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        OutputStream responseOutput = null;
        try {
            String downloadFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.ATTACHMENT.ORDER.LO") //
            );
            File downloadFile = new File(downloadFilePath, (String)params.get("P_ATTACH_FILE_NM"));
            if (!downloadFile.exists()) {
                throw new FileNotFoundException(NexosMessage.getDisplayMsg("JAVA.LOB01010E0.XXX", "첨부 파일이 서버에 존재하지 않습니다."));
            }

            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, downloadFile);
            // 파일 기록
            setResponseBody(responseOutput, downloadFile);
        } catch (Exception e) {
            result = getResponseEntityError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.LOB01010E0.XXX", "첨부 파일 다운로드 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
        }

        return result;
    }

    /**
     * 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/save.do", method = RequestMethod.POST)
    public ResponseEntity<String> save(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.save(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    @RequestMapping(value = "/getData.do", method = RequestMethod.POST)
    public ResponseEntity<String> getData(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getData(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고예정 종결처리 SP 호출
     *
     * @param params
     */
    @RequestMapping(value = "/callLOOrderClosing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOOrderClosing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOOrderClosing(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고예정 삭제처리 SP 호출
     *
     * @param params
     */
    @RequestMapping(value = "/callLOOrderDelete.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOOrderDelete(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOOrderDelete(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고예정 보류처리 SP 호출
     *
     * @param params
     */
    @RequestMapping(value = "/callLOOrderHold.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOOrderHold(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLOOrderHold(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
