package nexos.dao.pda;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: PDA_LCC03020E0Impl<br>
 * Description: PDA 재고이동(단일) DAO (Data Access Object)<br>
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
@Repository("PDA_LCC03020E0DAO")
public class PDA_LCC03020E0DAOImpl extends DaoSupport implements PDA_LCC03020E0DAO {

    final String PROGRAM_ID         = "PDA_LCC03020E0";

    final String SP_ID_LC_PROC_MOVE = PROGRAM_ID + ".LC_PROC_MOVE"; // [센터운영]재고이동(단일) - 재고이동 처리

    @Override
    public Map<String, Object> callLCProcMove(Map<String, Object> params) throws Exception {

        // 선택 값 CTCHECKVALUE 테이블에 INSERT
        String checkedValue = (String)params.get(Consts.PK_CHECKED_VALUE);
        Map<String, Object> checkedParams = new HashMap<String, Object>();
        checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
        insertCheckedValue(checkedParams);

        // 프로시저 호출
        return callProcedure(SP_ID_LC_PROC_MOVE, params);
    }
}
