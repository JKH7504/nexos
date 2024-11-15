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
import nexos.service.lo.LOB02010E0Service;

/**
 * Class: 출고작업 컨트롤러<br>
 * Description: 출고작업 관리 Controller
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
@RequestMapping("/LOB02010E0")
public class LOB02010E0Controller extends ControllerSupport {

    @Autowired
    private LOB02010E0Service service;

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
     * 출고등록 (일괄) 조회 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/getDataSetEntryBT.do", method = RequestMethod.POST)
    public ResponseEntity<String> getDataSetEntryBT(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getDataSetEntryBT(getQueryId(params), getQueryParams(params)));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고차수를 채번
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/getOutboundBatch.do", method = RequestMethod.POST)
    public ResponseEntity<String> getOutboundBatch(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.getOutboundBatch(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * SP호출
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
     * 출고등록/출고지시- Confirm/Cancel 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callLOProcessing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLOProcessing(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            // 출고등록[일괄], 일괄등록일 경우
            if (Consts.PROCESS_ENTRY_BATCH.equals(params.get(Consts.PK_PROCESS_CD)) && "1".equals(params.get("P_ENTRY_BATCH_DIV"))) {
                result = getResponseEntity(request, service.callEntryBatchProcessing(params));
            }
            // 그외
            else {
                result = getResponseEntity(request, service.callLOProcessing(params));
            }
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 주소정제 처리
     *
     * @param request
     *        HttpServletRequest
     * @param params
     * @return
     */
    @RequestMapping(value = "/callAcsGetAddress.do", method = RequestMethod.POST)
    public ResponseEntity<String> callAcsGetAddress(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callAcsGetAddress(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 배송지갱신 처리
     *
     * @param request
     *        HttpServletRequest
     * @param params
     * @return
     */
    @RequestMapping(value = "/callLoSetAddress.do", method = RequestMethod.POST)
    public ResponseEntity<String> callLoSetAddress(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callLoSetAddress(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 거래명세서일자 수정 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/callInoutDateUpdate.do", method = RequestMethod.POST)
    public ResponseEntity<String> callInoutDateUpdate(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callInoutDateUpdate(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고지시 - 출하장비전송 처리
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callSendFwLoBatch.do", method = RequestMethod.POST)
    public ResponseEntity<String> callSendFwLoBatch(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callSendFwLoBatch(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고지시 - 출하장비전송 취소 처리
     *
     * @param request
     * @param queryParams
     * @return
     */
    @RequestMapping(value = "/callSendBwLoBatch.do", method = RequestMethod.POST)
    public ResponseEntity<String> callSendBwLoBatch(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.callSendBwLoBatch(params));
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
                throw new FileNotFoundException(NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "첨부 파일이 서버에 존재하지 않습니다."));
            }

            responseOutput = response.getOutputStream();
            // 파일 다운로드 헤더 세팅
            setFileDownloadHeaders(request, response, downloadFile);
            // 파일 기록
            setResponseBody(responseOutput, downloadFile);
        } catch (Exception e) {
            result = getResponseEntityError(request, Util.getErrorMessage( //
                NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "첨부 파일 다운로드 중 오류가 발생했습니다.\n\n"), e) //
            );
        } finally {
            Util.closeObject(responseOutput);
        }

        return result;
    }

    /**
     * 출고등록 - 출고등록 마스터/디테일 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
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

    /**
     * 출고등록(개별) - 출고예정 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveOrder.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveOrder(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveOrder(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고확정 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveConfirm.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveConfirm(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveConfirm(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고확정 - 유통구분, 직송여부 변경
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveConfirmData.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveConfirmData(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveConfirmData(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고확정 - 디테일 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsDetail
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveConfirmDetail.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveConfirmDetail(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveConfirmDetail(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 배송완료 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveDelivery.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveDelivery(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveDelivery(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 출고등록 (일괄) 저장 처리
     *
     * @param request
     *        HttpServletRequest
     * @param dsSub
     *        DataSet
     * @param userId
     *        사용자ID
     * @return
     */
    @RequestMapping(value = "/saveEntryBT.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveEntryBT(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            result = getResponseEntity(request, service.saveEntryBT(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }
}
