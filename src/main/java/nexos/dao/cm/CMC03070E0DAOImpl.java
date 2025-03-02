package nexos.dao.cm;

import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.support.DaoSupport;

/**
 * Class: CMC03070E0DAOImpl<br>
 * Description: CMC03070E0 DAO (Data Access Object)<br>
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
@Repository("CMC03070E0DAO")
public class CMC03070E0DAOImpl extends DaoSupport implements CMC03070E0DAO {

    final String PROGRAM_ID        = "CMC03070E0";

    final String TABLE_NM_CMIMAGE  = "CMIMAGE";
    final String INSERT_ID_CMIMAGE = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMIMAGE;
    final String UPDATE_ID_CMIMAGE = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMIMAGE;
    final String DELETE_ID_CMIMAGE = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMIMAGE;

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
}
