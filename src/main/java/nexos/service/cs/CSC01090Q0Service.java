package nexos.service.cs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.stereotype.Service;

import nexos.framework.Consts;
import nexos.framework.security.SecurityUserDetails;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CSC01090Q0Service<br>
 * Description: WMS 사용자 접속로그 조회(CSC01090Q0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2020-06-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class CSC01090Q0Service extends ServiceSupport {

    @Autowired
    private SessionRegistry sessionRegistry;

    @Override
    public List<Map<String, Object>> getDataList(String queryId, Map<String, Object> params) throws DataAccessException {

        List<Map<String, Object>> dsResult = getDefaultDao().getDataList(queryId, params);
        if (dsResult != null && dsResult.size() > 0) {
            // 현재 로그인한 유저 정보
            Map<String, String> loginUsers = new HashMap<String, String>();
            List<Object> principals = sessionRegistry.getAllPrincipals();
            for (Object principal : principals) {
                if (principal instanceof SecurityUserDetails) {
                    loginUsers.put(((SecurityUserDetails)principal).getUsername(), null);
                }
            }
            // 현재 로그인 여부 추가
            for (int rIndex = 0, rCount = dsResult.size(); rIndex < rCount; rIndex++) {
                Map<String, Object> rowData = dsResult.get(rIndex);
                if (loginUsers.containsKey(rowData.get("USER_ID"))) {
                    rowData.put("LOGIN_YN", Consts.YES);
                } else {
                    rowData.put("LOGIN_YN", Consts.NO);
                }
            }
        }
        return dsResult;
    }
}
