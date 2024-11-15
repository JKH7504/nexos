package nexos.controller.pda;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.OutputStream;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import nexos.framework.NexosConsts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ControllerSupport;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: PDA_CommonController<br>
 * Description: PDA 공통/마스터 컨트롤러<br>
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
@RequestMapping("/PDA_COMMON")
public class PDA_CommonController extends ControllerSupport {

    @Autowired
    @Qualifier("defaultService")
    private ServiceSupport service;

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
     * 멀티 쿼리ID로 데이터 조회 후 Json 문자열로 리턴
     *
     * @param queryId
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/getMultiDataSet.do", method = RequestMethod.POST)
    public ResponseEntity<String> getMultiDataSet(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getMultiDataSet(getServiceParamList(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * Procedure 호출
     *
     * @param request
     * @param queryId
     * @param queryParams
     * @return
     */
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
     * PDA 업데이트 파일 다운로드
     *
     * @param request
     * @param response
     * @param downloadFileNm
     * @return
     */
    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    @RequestMapping(value = "/REF-FILES/deploy/pda", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<String> updateFileDownload(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("P_DOWNLOAD_FILE_NM") String downloadFileNm) {

        ResponseEntity<String> result = null;

        OutputStream responseOutput = null;
        try {
            String downloadFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.DEPLOY.PDA") //
            );
            File downloadFile = new File(downloadFilePath, downloadFileNm);
            if (!downloadFile.exists()) {
                throw new FileNotFoundException(NexosMessage.getDisplayMsg("JAVA.PDA_COMMON.001", "PDA 업데이트 파일이 서버에 존재하지 않습니다."));
            }

            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, downloadFile);
            // 파일 기록
            setResponseBody(responseOutput, downloadFile);
        } catch (Exception e) {
            result = getResponseEntitySubmitError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.PDA_COMMON.002", "PDA 업데이트 파일 다운로드 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
        }

        return result;
    }
}
