package nexos.controller.cs;

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
import nexos.service.cs.CSC01000E0Service;

/**
 * Class: CSC01000E0Service 관리 컨트롤러<br>
 * Description: CSC01000E0Service 관리 Controller<br>
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
@RequestMapping("/CSC01000E0")
public class CSC01000E0Controller extends ControllerSupport {

    @Autowired
    private CSC01000E0Service service;

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
     * 공지 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveMaster.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveMaster(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveMaster(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 공지 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveMasterAttachment.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveMasterAttachment(HttpServletRequest request, @RequestParam("P_UPLOAD_FILE") MultipartFile uploadFile,
        @RequestParam("P_UPLOAD_PARAMS") String uploadParams) {

        Map<String, Object> params = getParameter(uploadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        ResponseEntity<String> result = null;

        try {
            params.put("P_UPLOAD_FILE", uploadFile);

            result = getResponseEntity(request, service.saveMaster(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 덧글 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveDetail.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveDetail(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveDetail(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 덧글 읽음 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/readNotice.do", method = RequestMethod.POST)
    public ResponseEntity<String> readNotice(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.readNotice(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 공지사항 첨부파일 다운로드 처리
     *
     * @param request
     * @param ediFile
     * @param queryId
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/attachmentDownload.do", method = RequestMethod.POST)
    public ResponseEntity<String> attachmentDownload(HttpServletRequest request, HttpServletResponse response,
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
                NexosSupport.getGlobalProperty("FILE.ATTACHMENT.NOTICE") //
            );
            File downloadFile = new File(downloadFilePath, (String)params.get("P_ATTACH_FILE_NM"));
            if (!downloadFile.exists()) {
                throw new FileNotFoundException(NexosMessage.getDisplayMsg("JAVA.WC.018", "첨부파일이 서버에 존재하지 않습니다."));
            }

            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, downloadFile);
            // 파일 기록
            setResponseBody(responseOutput, downloadFile);
        } catch (Exception e) {
            result = getResponseEntityError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.CSC01000E0.XXX", "첨부 파일 다운로드 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
        }

        return result;
    }
}
