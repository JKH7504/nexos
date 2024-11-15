package nexos.dao.pda;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: PDA_LIC02320E0DAOImpl<br>
 * Description: PDA 입고검수(멀티상품매핑) DAO (Data Access Object)<br>
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
@Repository("PDA_LIC02320E0DAO")
public class PDA_LIC02320E0DAOImpl extends DaoSupport implements PDA_LIC02320E0DAO {

    final String PROGRAM_ID               = "PDA_LIC02320E0";

    final String SP_ID_LI_PROC_INSPECT_T2 = PROGRAM_ID + ".LI_PROC_INSPECT_T2"; // [입고]입고검수(멀티상품매핑) - 검수 처리

    @Override
    public Map<String, Object> callLIProcInspectT2(Map<String, Object> params) throws Exception {

        // 선택 값 CTCHECKVALUE 테이블에 INSERT
        String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);
        Map<String, Object> checkedParams = new HashMap<String, Object>();
        checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
        insertCheckedValue(checkedParams);

        // 프로시저 호출
        return callProcedure(SP_ID_LI_PROC_INSPECT_T2, params);
    }
}
