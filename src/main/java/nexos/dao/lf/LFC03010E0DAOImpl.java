package nexos.dao.lf;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LFC03010E0DAOImpl<br>
 * Description: LFC03010E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-03-24    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LFC03010E0DAO")
public class LFC03010E0DAOImpl extends DaoSupport implements LFC03010E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(LFC03010E0DAOImpl.class);
    final String PROGRAM_ID        = "LFC03010E0";

    final String TABLE_NM_LFPRICE  = "LFPRICE";
    final String INSERT_ID_LFPRICE = PROGRAM_ID + ".INSERT_" + TABLE_NM_LFPRICE;
    final String UPDATE_ID_LFPRICE = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LFPRICE;
    final String DELETE_ID_LFPRICE = PROGRAM_ID + ".DELETE_" + TABLE_NM_LFPRICE;

    @SuppressWarnings("unchecked")
    @Override
    public void saveMaster(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        // 사업부별 기준수수료 처리
        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_LFPRICE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LFPRICE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                Map<String, Object> newRowData = new HashMap<String, Object>();
                newRowData.put("P_BILL_DIV", rowData.get("P_BILL_DIV"));
                newRowData.put("P_CONTRACT_NO", rowData.get("P_CONTRACT_NO"));
                newRowData.put("P_CONTRACT_DATE", rowData.get("P_CONTRACT_DATE"));
                deleteSql(DELETE_ID_LFPRICE, newRowData);
            }
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public void saveDetail(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        // 상품그룹 중분류 처리
        int dsCnt = dsSave.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_LFPRICE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LFPRICE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_LFPRICE, rowData);
            }
        }
    }

}
