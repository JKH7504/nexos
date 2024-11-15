package nexos.service.ed.common;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;

import nexos.dao.ed.common.EDCommonDAO;
import nexos.dao.ed.common.EDCustomMethodDAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.ServiceSupport;

/**
 * Class: EDCustomMethodService<br>
 * Description: 인터페이스 송수신시 표준 처리로 불가능한 경우 별도 코딩하여 처리할 수 있도록 하는 Class(트랜잭션처리 담당)<br>
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
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDCustomMethodService extends ServiceSupport {

    @SuppressWarnings("unused")
    @Autowired
    private EDCustomMethodDAO dao;

    @SuppressWarnings("unused")
    @Autowired
    private EDCommonDAO       commonDAO;

    // private final Logger logger = LoggerFactory.getLogger(EDCustomMethodService.class);

    public Map<String, Object> recvProcessing(Map<String, Object> params) {

        Map<String, Object> resultMap = new HashMap<String, Object>();
        Util.setOutMessage(resultMap, Consts.OK);
        try {
            // String buCd = (String)params.get("P_BU_CD");
            // String ediDiv = (String)params.get("P_EDI_DIV");
            // String defineNo = (String)params.get("P_DEFINE_NO");

            // 수신처리 로직 전체 구현
            // 1. 고객사로부터 데이터/파일 수신(FTP, WS, DBConnect 등) 후 EDI Table -> Insert
            // 2. ERProcessing -> Transaction Table -> Insert
            // 3. ERProcessingAfter -> 호출
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        }

        return resultMap;
    }

    public Map<String, Object> sendProcessing(Map<String, Object> params) {

        Map<String, Object> resultMap = new HashMap<String, Object>();
        Util.setOutMessage(resultMap, Consts.OK);
        try {
            // String buCd = (String)params.get("P_BU_CD");
            // String ediDiv = (String)params.get("P_EDI_DIV");
            // String defineNo = (String)params.get("P_DEFINE_NO");

            // 송신처리 로직 전체 구현
            // 1. ESProcessing -> EDI Table -> 호출하여 송신 데이터 생성
            // 2. 고객사로 데이터/파일 송신(FTP, WS, DBConnect 등)
        } catch (Exception e) {
            Util.setOutMessage(resultMap, Util.getErrorMessage(e));
        }

        return resultMap;
    }
}
