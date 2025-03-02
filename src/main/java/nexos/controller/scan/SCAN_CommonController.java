package nexos.controller.scan;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.OutputStream;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import nexos.framework.NexosConsts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ControllerSupport;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: 스캔검수 컨트롤러<br>
 * Description: 스캔검수 공통/마스터 Controller<br>
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
@RequestMapping("/SCAN_COMMON")
public class SCAN_CommonController extends ControllerSupport {

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
     * SP 호출 - 조회
     *
     * @param request
     *        HttpServletRequest
     * @param queryId
     *        쿼리ID
     * @param queryParams
     *        쿼리 호출 파라메터
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
     * 업데이트 파일 다운로드 처리
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping(value = "/downloadProgram.do", method = RequestMethod.POST)
    public ResponseEntity<String> downloadProgram(HttpServletRequest request, HttpServletResponse response, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        OutputStream responseOutput = null;
        try {
            String downloadFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.DEPLOY.SCAN_INSPECTION") //
            );
            File downloadFile = new File(downloadFilePath, (String)params.get("P_PROGRAM_FILE_NM"));
            if (!downloadFile.exists()) {
                throw new FileNotFoundException(NexosMessage.getDisplayMsg("JAVA.SCANINSPECTION.001", "프로그램 업데이트 파일이 서버에 존재하지 않습니다."));
            }

            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, downloadFile);
            // 파일 기록
            setResponseBody(responseOutput, downloadFile);
        } catch (Exception e) {
            result = getResponseEntityError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.SCANINSPECTION.002", "프로그램 업데이트 파일 다운로드 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
        }

        return result;
    }

    /**
     * 해외운송장 다운로드
     *
     * @param request
     * @param response
     * @param params
     * @return
     */
    @RequestMapping(value = "/downloadWbPDF.do", method = RequestMethod.POST)
    public ResponseEntity<String> downloadWbPDF(HttpServletRequest request, HttpServletResponse response, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        OutputStream responseOutput = null;
        try {
            String downloadFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.ATTACHMENT.ORDER.LO.WB") //
            );
            String shipRcpNo = (String)params.get("P_SHIP_RCP_NO");
            File downloadFile = new File(downloadFilePath, shipRcpNo + ".pdf");
            if (!downloadFile.exists()) {
                downloadFile = new File(downloadFilePath, shipRcpNo);
                if (!downloadFile.exists()) {
                    throw new FileNotFoundException(NexosMessage.getDisplayMsg("JAVA.SCAN_COMMON.XXX", "[운송접수번호]에 해당하는 운송장 파일이 서버에 존재하지 않습니다."));
                }
            }

            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, downloadFile);
            // 파일 기록
            setResponseBody(responseOutput, downloadFile);
        } catch (Exception e) {
            result = getResponseEntitySubmitError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.SCAN_COMMON.XXX", "운송장 다운로드 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
        }
        return result;
    }
}
