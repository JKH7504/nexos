package nexos.dao.lc;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LCC02080E0DAOImpl<br>
 * Description: LCC02080E0 DAO (Data Access Object)<br>
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
@Repository("LCC02080E0DAO")
public class LCC02080E0DAOImpl extends DaoSupport implements LCC02080E0DAO {

    final String SP_ID_LC_FW_LABELLING_ORDER = "LC_FW_LABELLING_ORDER";

    /**
     * 라벨링작업 자동등록 SP 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    @Override
    public Map<String, Object> callLCFWLabellingOrder(Map<String, Object> params) throws Exception {

        // 선택 값 CTCHECKVALUE 테이블에 INSERT
        String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);
        Map<String, Object> checkedParams = new HashMap<String, Object>();
        checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
        insertCheckedValue(checkedParams);

        // 프로시저 호출
        return callProcedure(SP_ID_LC_FW_LABELLING_ORDER, params);
    }
}
