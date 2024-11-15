package nexos.controller.cm;

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
import nexos.framework.support.ControllerSupport;
import nexos.service.cm.CMC03070E0Service;

/**
 * Class: 로고이미지 관리 컨트롤러<br>
 * Description: 로고이미지 관리 Controller<br>
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
@RequestMapping("/CMC03070E0")
public class CMC03070E0Controller extends ControllerSupport {

    // private final Logger logger = LoggerFactory.getLogger(CMC03070E0Controller.class);

    @Autowired
    private CMC03070E0Service service;

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
     * 로고이미지 저장 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @return
     */
    @RequestMapping(value = "/saveBIImage.do", method = RequestMethod.POST)
    public ResponseEntity<String> saveBIImage(HttpServletRequest request, @RequestParam("P_UPLOAD_FILE") MultipartFile uploadFile,
        @RequestParam("P_UPLOAD_PARAMS") String uploadParams) {

        Map<String, Object> params = getParameter(uploadParams);
        String oMsg = Util.getOutMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            return getResponseEntitySubmitError(request, oMsg);
        }

        ResponseEntity<String> result = null;

        try {
            params.put("P_IMAGE_CD2", "X");
            params.put("P_UPLOAD_FILE", uploadFile);

            result = getResponseEntity(request, service.saveBIImage(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 로고이미지 삭제 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @return
     */
    @RequestMapping(value = "/removeBIImage.do", method = RequestMethod.POST)
    public ResponseEntity<String> removeBIImage(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            params.put("P_IMAGE_CD2", "X");

            result = getResponseEntity(request, service.removeBIImage(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 로고이미지 표시 처리
     * 
     * @param request
     *        HttpServletRequest
     * @param dsMaster
     *        DataSet
     * @return reponse OutputStream으로 이미지 문서를 리턴
     */
    @RequestMapping(value = "/getBIImage.do", method = RequestMethod.POST)
    public ResponseEntity<String> getBIImage(HttpServletRequest request, @RequestBody Map<String, Object> params) {

        ResponseEntity<String> result = null;

        try {
            params.put("P_IMAGE_CD2", "X");

            result = getResponseEntity(request, service.getBIImage(params));
        } catch (Exception e) {
            ResponseEntity<String> responseEntity = getResponseEntityError(request, e);
            result = new ResponseEntity<String>(responseEntity.getBody(), responseEntity.getHeaders(), responseEntity.getStatusCode());
        }
        return result;
    }
}
