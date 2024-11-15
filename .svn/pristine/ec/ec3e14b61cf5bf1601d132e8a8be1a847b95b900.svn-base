package nexos.dao.cm;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.DaoSupport;

/**
 * Class: WCDAOImpl<br>
 * Description: CMC02060E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2021-11-26    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("CMC02060E0DAO")
public class CMC02060E0DAOImpl extends DaoSupport implements CMC02060E0DAO {

    final String PROGRAM_ID              = "CMC02060E0";

    final String TABLE_NM_CMWBBASE       = "CMWBBASE";
    final String INSERT_ID_CMWBBASE      = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMWBBASE;
    final String UPDATE_ID_CMWBBASE      = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMWBBASE;
    final String DELETE_ID_CMWBBASE      = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMWBBASE;

    final String TABLE_NM_CMWBNOBAND     = "CMWBNOBAND";
    final String INSERT_ID_CMWBNOBAND    = PROGRAM_ID + ".INSERT_" + TABLE_NM_CMWBNOBAND;
    final String UPDATE_ID_CMWBNOBAND    = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CMWBNOBAND;
    final String DELETE_ID_CMWBNOBAND    = PROGRAM_ID + ".DELETE_" + TABLE_NM_CMWBNOBAND;

    final String SP_ID_CM_WBNOBAND_GETNO = "WB.CM_WBNOBAND_GETNO";
    final String SP_ID_SET_WBNO_DELETE   = "WB.SET_WBNO_DELETE";

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
                insertSql(INSERT_ID_CMWBBASE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMWBBASE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 운송장 생성 체크
                Map<String, Object> callParams = Util.newMap();
                callParams.put("P_TABLE_NM", "CMWBNOBAND");
                callParams.put("P_PARAM_NAMES", "CARRIER_CD;CUST_CD;HDC_DIV");
                callParams.put("P_PARAM_VALUES", //
                    Util.nullToEmpty(rowData.get("P_CARRIER_CD")) //
                        + Consts.SEP_COL + Util.nullToEmpty(rowData.get("P_CUST_CD")) //
                        + Consts.SEP_COL + Util.nullToEmpty(rowData.get("P_HDC_DIV")) //
                );
                Map<String, Object> resultMap = getDataExistYn(callParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                } else if (Consts.YES.equals(resultMap.get("O_EXIST_YN"))) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WB.001", "운송장번호대역 정보가 생성되어 있습니다. 운송장번호대역을 삭제 후 처리하십시오."));
                }
                deleteSql(DELETE_ID_CMWBBASE, rowData);
            }
        }
    }

    @Override
    public void saveDetail(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsDetail = Util.getDataSet(params, Consts.PK_DS_DETAIL);
        String userId = (String)params.get(Consts.PK_USER_ID);

        Map<String, Object> callParams = Util.newMap();
        for (int rIndex = 0, rCount = dsDetail.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsDetail.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {

                // 순번 채번
                callParams.clear();
                callParams.put("P_CARRIER_CD", rowData.get("P_CARRIER_CD"));
                callParams.put("P_CUST_CD", rowData.get("P_CUST_CD"));
                callParams.put("P_HDC_DIV", rowData.get("P_HDC_DIV"));
                Map<String, Object> resultMap = callProcedure(SP_ID_CM_WBNOBAND_GETNO, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                int lineNo = ((Number)resultMap.get("O_LINE_NO")).intValue();
                rowData.put("P_LINE_NO", lineNo);

                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CMWBNOBAND, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CMWBNOBAND, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {

                // 기생성된 운송장번호 삭제
                callParams.clear();
                callParams.put("P_CARRIER_CD", rowData.get("P_CARRIER_CD"));
                callParams.put("P_CUST_CD", rowData.get("P_CUST_CD"));
                callParams.put("P_HDC_DIV", rowData.get("P_HDC_DIV"));
                callParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));
                callParams.put(Consts.PK_USER_ID, userId);
                Map<String, Object> resultMap = callProcedure(SP_ID_SET_WBNO_DELETE, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }

                deleteSql(DELETE_ID_CMWBNOBAND, rowData);
            }
        }
    }
}
