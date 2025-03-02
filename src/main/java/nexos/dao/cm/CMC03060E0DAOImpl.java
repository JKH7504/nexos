package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CMC03060E0DAOImpl<br>
 * Description: CMC03060E0 DAO (Data Access Object)<br>
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
@Repository("CMC03060E0DAO")
public class CMC03060E0DAOImpl extends DaoSupport implements CMC03060E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CMC03060E0DAOImpl.class);

    final String PROGRAM_ID          = "CMC03060E0";

    final String TABLE_NM_CMBU       = "CMBU";                                      // 사업부마스터
    final String INSERT_ID_CMBU      = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMBU;
    final String UPDATE_ID_CMBU      = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMBU;
    final String DELETE_ID_CMBU      = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMBU;

    final String TABLE_NM_CMBUBRAND  = "CMBUBRAND";                                 // 사업부별운영브랜드마스터
    final String INSERT_ID_CMBUBRAND = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMBUBRAND;
    final String DELETE_ID_CMBUBRAND = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMBUBRAND;

    final String TABLE_NM_CMBUREF    = "CMBUREF";                                   // 사업부부가정보
    final String INSERT_ID_CMBUREF   = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMBUREF;
    final String DELETE_ID_CMBUREF   = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMBUREF;

    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        List<Map<String, Object>> dsSub = Util.getDataSet(params, Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMBU, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMBU, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMBUREF, rowData);
                deleteSql(DELETE_ID_CMBUBRAND, rowData);
                deleteSql(DELETE_ID_CMBU, rowData);
            }
        }

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMBUBRAND, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMBUBRAND, rowData);
            }
        }

        for (int rIndex = 0, rCount = dsSub.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsSub.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMBUREF, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMBUREF, rowData);
            }
        }
    }
}
