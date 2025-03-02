package nexos.dao.lo;

import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.support.DaoSupport;

/**
 * Class: LOB08020Q0DAOImpl<br>
 * Description: LOB08020Q0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2019-02-20    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LOB08020Q0DAO")
public class LOB08020Q0DAOImpl extends DaoSupport implements LOB08020Q0DAO {

    final String PROGRAM_ID                      = "LOB08020Q0";

    final String SP_ID_SET_WBNO_PRINT_CNT_UPDATE = "WB.SET_WBNO_PRINT_CNT_UPDATE";

    @Override
    public Map<String, Object> callSetWbNoPrintCntUpdate(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_SET_WBNO_PRINT_CNT_UPDATE, params);
    }

}