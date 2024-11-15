package nexos.dao.lf;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LFC03020E0DAOImpl<br>
 * Description: LFC03020E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2022-12-22    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LFC03020E0DAO")
public class LFC03020E0DAOImpl extends DaoSupport implements LFC03020E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(LFC03020E0DAOImpl.class);
    final String PROGRAM_ID            = "LFC03020E0";

    final String TABLE_NM_LFPRICECELL  = "LFPRICECELL";
    final String INSERT_ID_LFPRICECELL = PROGRAM_ID + ".INSERT_" + TABLE_NM_LFPRICECELL;
    final String UPDATE_ID_LFPRICECELL = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LFPRICECELL;
    final String DELETE_ID_LFPRICECELL = PROGRAM_ID + ".DELETE_" + TABLE_NM_LFPRICECELL;

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
                insertSql(INSERT_ID_LFPRICECELL, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LFPRICECELL, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                Map<String, Object> newRowData = new HashMap<String, Object>();
                newRowData.put("P_CONTRACT_NO", rowData.get("P_CONTRACT_NO"));
                newRowData.put("P_BILL_DIV", rowData.get("P_BILL_DIV"));
                newRowData.put("P_CONTRACT_DATE", rowData.get("P_CONTRACT_DATE"));
                deleteSql(DELETE_ID_LFPRICECELL, newRowData);
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
                insertSql(INSERT_ID_LFPRICECELL, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LFPRICECELL, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_LFPRICECELL, rowData);
            }
        }
    }

}
