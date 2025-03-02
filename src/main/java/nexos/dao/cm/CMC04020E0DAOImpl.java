package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: CMC04020E0DAOImpl<br>
 * Description: CMC04020E0 DAO (Data Access Object)<br>
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
@Repository("CMC04020E0DAO")
public class CMC04020E0DAOImpl extends DaoSupport implements CMC04020E0DAO {

    final String PROGRAM_ID              = "CMC04020E0";

    final String TABLE_NM_CMITEM         = "CMITEM";
    final String INSERT_ID_CMITEM        = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMITEM;
    final String UPDATE_ID_CMITEM        = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMITEM;
    final String DELETE_ID_CMITEM        = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMITEM;

    final String TABLE_NM_CMBARCD        = "CMITEMBARCD";
    final String INSERT_ID_CMBARCD       = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMBARCD;
    final String UPDATE_ID_CMBARCD       = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMBARCD;
    final String DELETE_ID_CMBARCD       = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMBARCD;

    final String TABLE_NM_CMIMAGE        = "CMIMAGE";
    final String INSERT_ID_CMIMAGE       = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMIMAGE;
    final String UPDATE_ID_CMIMAGE       = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMIMAGE;
    final String DELETE_ID_CMIMAGE       = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMIMAGE;

    final String SP_ID_CM_ITEMBARCD_SAVE = "CM_ITEMBARCD_SAVE";                       // 상품바코드 마스터 등록

    @Override
    public void saveMaster(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        Map<String, Object> cmImageRowData = Util.newMap();
        cmImageRowData.put("P_IMAGE_DIV", "04"); // 상품이미지
        cmImageRowData.put(Consts.PK_CRUD, Consts.DV_CRUD_D);

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMITEM, rowData);

                // 상품바코드 생성
                saveItemBarcd(rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMITEM, rowData);

                // 상품바코드 수정
                saveItemBarcd(rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                cmImageRowData.put("P_IMAGE_CD1", rowData.get("P_BRAND_CD"));
                cmImageRowData.put("P_IMAGE_CD2", rowData.get("P_ITEM_CD"));

                // 상품바코드 삭제
                saveItemBarcd(rowData);
                deleteSql(DELETE_ID_CMIMAGE, cmImageRowData);
                deleteSql(DELETE_ID_CMITEM, rowData);
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
                insertSql(INSERT_ID_CMBARCD, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMBARCD, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CMBARCD, rowData);
            }
        }
    }

    @Override
    public void saveImage(Map<String, Object> params) throws Exception {

        String rowCrud = (String)params.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(rowCrud)) {
            int updateRow = updateSql(UPDATE_ID_CMIMAGE, params);
            if (updateRow < 1) {
                params.put(Consts.PK_REG_USER_ID, params.get(Consts.PK_USER_ID));
                params.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMIMAGE, params);
            }
        } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
            updateSql(UPDATE_ID_CMIMAGE, params);
        } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
            deleteSql(DELETE_ID_CMIMAGE, params);
        }
    }

    /**
     * 상품바코드 마스터 등록/수정/삭제
     *
     * @param rowData
     * @return
     */
    private void saveItemBarcd(Map<String, Object> rowData) throws Exception {

        // 상품바코드 별도관리일 경우
        if (!Consts.YES.equals(rowData.get("P_CMITEMBARCD_REG_YN"))) {
            return;
        }

        // 상품바코드 등록/수정/삭제
        Map<String, Object> resultMap = callProcedure(SP_ID_CM_ITEMBARCD_SAVE, rowData);
        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }
    }

}
