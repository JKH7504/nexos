package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: WCDAOImpl<br>
 * Description: CMC04070E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2018-01-10    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("CMC04070E0DAO")
public class CMC04070E0DAOImpl extends DaoSupport implements CMC04070E0DAO {

    final String PROGRAM_ID                    = "CMC04070E0";

    final String TABLE_NM_CMPROMOTION          = "CMPROMOTION";
    final String INSERT_ID_CMPROMOTION         = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMPROMOTION;
    final String UPDATE_ID_CMPROMOTION         = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMPROMOTION;
    final String DELETE_ID_CMPROMOTION         = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMPROMOTION;

    final String TABLE_NM_CMPROMOTIONITEM      = "CMPROMOTIONITEM";
    final String INSERT_ID_CMPROMOTIONITEM     = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMPROMOTIONITEM;
    final String UPDATE_ID_CMPROMOTIONITEM     = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMPROMOTIONITEM;
    final String DELETE_ID_CMPROMOTIONITEM     = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMPROMOTIONITEM;

    final String TABLE_NM_CMPROMOTIONEXCEPT    = "CMPROMOTIONEXCEPT";
    final String INSERT_ID_CMPROMOTIONEXCEPT   = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMPROMOTIONEXCEPT;
    final String UPDATE_ID_CMPROMOTIONEXCEPT   = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMPROMOTIONEXCEPT;
    final String DELETE_ID_CMPROMOTIONEXCEPT   = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMPROMOTIONEXCEPT;

    final String TABLE_NM_CMPROMOTIONDELIVERY  = "CMPROMOTIONDELIVERY";
    final String INSERT_ID_CMPROMOTIONDELIVERY = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMPROMOTIONDELIVERY;
    final String UPDATE_ID_CMPROMOTIONDELIVERY = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMPROMOTIONDELIVERY;
    final String DELETE_ID_CMPROMOTIONDELIVERY = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMPROMOTIONDELIVERY;

    @Override
    public void saveMaster(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMPROMOTION, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMPROMOTION, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 프로모션코드 삭제일 경우 디테일, 배송처 먼저 전체 삭제
                deleteSql(DELETE_ID_CMPROMOTIONDELIVERY, rowData);
                deleteSql(DELETE_ID_CMPROMOTIONITEM, rowData);
                deleteSql(DELETE_ID_CMPROMOTIONEXCEPT, rowData);
                deleteSql(DELETE_ID_CMPROMOTION, rowData);
            }
        }
    }

    @Override
    public void saveDetail(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMPROMOTIONITEM, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMPROMOTIONITEM, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMPROMOTIONITEM, rowData);
            }
        }
    }

    @Override
    public void saveSub(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSub = Util.getDataSet(params, Consts.PK_DS_SUB);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsSub.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsSub.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMPROMOTIONEXCEPT, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMPROMOTIONEXCEPT, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMPROMOTIONEXCEPT, rowData);
            }
        }
    }

    @Override
    public void saveDelivery(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);
            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMPROMOTIONDELIVERY, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMPROMOTIONDELIVERY, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMPROMOTIONDELIVERY, rowData);
            }
        }
    }

}
