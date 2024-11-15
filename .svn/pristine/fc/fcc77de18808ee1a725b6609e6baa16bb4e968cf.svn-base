package nexos.dao.cs;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CSC04030E0DAOImpl<br>
 * Description: CSC04030E0 DAO (Data Access Object)<br>
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
@Repository("CSC04030E0DAO")
public class CSC04030E0DAOImpl extends DaoSupport implements CSC04030E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CSC04030E0DAOImpl.class);

    final String PROGRAM_ID                       = "CSC04030E0";
    final String TABLE_NM_CPCENTERPOLICYVAL       = "CPCENTERPOLICYVAL";
    final String INSERT_ID_CPCENTERPOLICYVAL      = PROGRAM_ID + ".INSERT_" + TABLE_NM_CPCENTERPOLICYVAL;
    final String DELETE_ID_CPCENTERPOLICYVAL      = PROGRAM_ID + ".DELETE_" + TABLE_NM_CPCENTERPOLICYVAL;

    final String SP_ID_CS_POLICY_RECOMMEND_UPDATE = "CS_POLICY_RECOMMEND_UPDATE";

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        Map<String, Object> recommendParams = Util.getParameter(params, "P_RECOMMEND_PARAMS");
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CPCENTERPOLICYVAL, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CPCENTERPOLICYVAL, rowData);
            }
        }
        // 선택이 하나만 지정되도록 SP 호출
        if (Util.getCount(recommendParams) > 0) {
            recommendParams.put(Consts.PK_USER_ID, userId);
            Map<String, Object> resultMap = callProcedure(SP_ID_CS_POLICY_RECOMMEND_UPDATE, recommendParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }

}
