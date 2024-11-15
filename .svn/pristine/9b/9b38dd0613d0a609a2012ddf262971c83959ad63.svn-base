package nexos.dao.lf;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: LFC02020E0DAOImpl<br>
 * Description: LFC02020E0 DAO (Data Access Object)<br>
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
@Repository("LFC02020E0DAO")
public class LFC02020E0DAOImpl extends DaoSupport implements LFC02020E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(LFC02020E0DAOImpl.class);
    final String PROGRAM_ID              = "LFC02020E0";

    final String TABLE_NM_LFBILL         = "LFBILL";                                        // 정산항목 마스터
    final String INSERT_ID_LFBILL        = PROGRAM_ID + ".INSERT_" + TABLE_NM_LFBILL;
    final String UPDATE_ID_LFBILL        = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LFBILL;
    final String DELETE_ID_LFBILL        = PROGRAM_ID + ".DELETE_" + TABLE_NM_LFBILL;

    final String TABLE_NM_LFBILLCENTER   = "LFBILLCENTER";                                  // 정산항목 물류센터 마스터
    final String INSERT_ID_LFBILLCENTER  = PROGRAM_ID + ".INSERT_" + TABLE_NM_LFBILLCENTER;
    final String DELETE_ID_LFBILLCENTER  = PROGRAM_ID + ".DELETE_" + TABLE_NM_LFBILLCENTER;

    final String TABLE_NM_LFBILLBU       = "LFBILLBU";                                      // 정산항목사업부 마스터
    final String INSERT_ID_LFBILLBU      = PROGRAM_ID + ".INSERT_" + TABLE_NM_LFBILLBU;
    final String DELETE_ID_LFBILLBU      = PROGRAM_ID + ".DELETE_" + TABLE_NM_LFBILLBU;

    final String TABLE_NM_LFBILLINOUTCD  = "LFBILLINOUTCD";                                 // 정산항목 입출고구분 마스터
    final String INSERT_ID_LFBILLINOUTCD = PROGRAM_ID + ".INSERT_" + TABLE_NM_LFBILLINOUTCD;
    final String DELETE_ID_LFBILLINOUTCD = PROGRAM_ID + ".DELETE_" + TABLE_NM_LFBILLINOUTCD;

    @Override
    @SuppressWarnings("unchecked")
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        List<Map<String, Object>> dsSub1 = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB1);
        List<Map<String, Object>> dsSub2 = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB2);

        String userId = (String)params.get(Consts.PK_USER_ID);

        int msCnt = dsMaster.size();
        if (msCnt > 0) {
            for (int i = 0; i < msCnt; i++) {
                Map<String, Object> rowData = dsMaster.get(i);
                rowData.put(Consts.PK_USER_ID, userId);
                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowData.put(Consts.PK_REG_USER_ID, userId);
                    rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                    insertSql(INSERT_ID_LFBILL, rowData);
                } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                    updateSql(UPDATE_ID_LFBILL, rowData);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_LFBILL, rowData);
                }
            }
        }

        int dsCnt = dsDetail.size();
        if (dsCnt > 0) {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsDetail.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowData.put(Consts.PK_REG_USER_ID, userId);
                    rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                    insertSql(INSERT_ID_LFBILLCENTER, rowData);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_LFBILLCENTER, rowData);
                }
            }
        }

        int ssCnt1 = dsSub1.size();
        if (ssCnt1 > 0) {
            for (int i = 0; i < ssCnt1; i++) {
                Map<String, Object> rowData = dsSub1.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowData.put(Consts.PK_REG_USER_ID, userId);
                    rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                    insertSql(INSERT_ID_LFBILLBU, rowData);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_LFBILLBU, rowData);
                }
            }
        }

        int ssCnt2 = dsSub2.size();
        if (ssCnt2 > 0) {
            for (int i = 0; i < ssCnt2; i++) {
                Map<String, Object> rowData = dsSub2.get(i);
                rowData.put(Consts.PK_USER_ID, userId);

                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowData.put(Consts.PK_REG_USER_ID, userId);
                    rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                    insertSql(INSERT_ID_LFBILLINOUTCD, rowData);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_LFBILLINOUTCD, rowData);
                }
            }
        }

    }

}
