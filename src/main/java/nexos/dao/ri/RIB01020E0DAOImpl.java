package nexos.dao.ri;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.DaoSupport;

/**
 * Class: RIB01020EDAOImpl<br>
 * Description: RIB01020E0 DAO (Data Access Object)<br>
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
@Repository("RIB01020E0DAO")
public class RIB01020E0DAOImpl extends DaoSupport implements RIB01020E0DAO {

    final String PROGRAM_ID        = "RIB01020E0";

    final String TABLE_NM_RI010NM  = "RI010NM";
    final String UPDATE_ID_RI010NM = PROGRAM_ID + ".UPDATE_" + TABLE_NM_RI010NM;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);
            int count = updateSql(UPDATE_ID_RI010NM, rowData);
            if (count == 0) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.RIB01020E0.001", "반입예정 상태의 전표만 저장 처리가 가능합니다."));
            }
        }
    }

}
