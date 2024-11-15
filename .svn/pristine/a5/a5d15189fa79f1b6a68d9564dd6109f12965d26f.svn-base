package nexos.dao.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.DaoSupport;

/**
 * Class: LCC02090E0DAOImpl<br>
 * Description: LCC02090E0 DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2023-04-18    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Repository("LCC02090E0DAO")
public class LCC02090E0DAOImpl extends DaoSupport implements LCC02090E0DAO {

    final String PROGRAM_ID                     = "LCC02090E0";

    final String TABLE_NM_LC110NM               = "LC110NM";
    final String INSERT_ID_LC110NM              = PROGRAM_ID + ".INSERT_" + TABLE_NM_LC110NM;
    final String UPDATE_ID_LC110NM              = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC110NM;

    final String TABLE_NM_LC110ND               = "LC110ND";
    final String INSERT_ID_LC110ND              = PROGRAM_ID + ".INSERT_" + TABLE_NM_LC110ND;
    final String UPDATE_ID_LC110ND              = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LC110ND;
    final String DELETE_ID_LC110ND              = PROGRAM_ID + ".DELETE_" + TABLE_NM_LC110ND;

    final String SP_ID_LC110NM_GETNO            = "WT.LC_110NM_GETNO";
    final String SP_ID_LC_FW_PROCESSING_CONFIRM = "LC_FW_PROCESSING_CONFIRM";
    final String SP_ID_LC_BW_PROCESSING_CONFIRM = "LC_BW_PROCESSING_CONFIRM";
    final String SP_ID_LC_BW_PROCESSING_ENTRY   = "LC_BW_PROCESSING_ENTRY";

    /*
     * 마스터/디테일 저장 처리
     */
    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        // 파라메터 처리
        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);

        String processCd = (String)params.get(Consts.PK_PROCESS_CD);
        String userId = (String)params.get(Consts.PK_USER_ID);

        String centerCd = (String)params.get("P_CENTER_CD");
        String buCd = (String)params.get("P_BU_CD");

        String processingNo = null;
        String oMsg = null;

        Map<String, Object> callParams = null;
        Map<String, Object> resultMap = null;

        int dsMasterCnt = dsMaster.size();
        int dsDetailCnt = dsDetail.size();

        // 신규 등록 시 저장할 디테일 내역 체크
        if (Consts.PROCESS_ENTRY_CREATE.equals(processCd)) {

            if (dsDetailCnt < 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LCC02090E0.001", "가공작업 상세내역이 존재하지 않습니다."));
            }
        }

        // (MasterGrid)가공작업 추가/수정 처리
        for (int i = 0; i < dsMasterCnt; i++) {
            Map<String, Object> rowData = dsMaster.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {

                // 가공작업일자 가져오기
                callParams = new HashMap<String, Object>();
                callParams.put("P_CENTER_CD", centerCd);
                callParams.put("P_BU_CD", buCd);
                callParams.put("P_PROCESSING_DATE", rowData.get("P_PROCESSING_DATE"));

                resultMap = callProcedure(SP_ID_LC110NM_GETNO, callParams);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }

                processingNo = (String)resultMap.get("O_PROCESSING_NO");
                rowData.put("P_PROCESSING_NO", processingNo);
                // 최초등록자ID/일자 put
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);

                insertSql(INSERT_ID_LC110NM, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LC110NM, rowData);
            }
        }

        // (DetailGrid)가공작업상세 추가/수정/삭제 처리
        for (int i = 0; i < dsDetailCnt; i++) {
            Map<String, Object> rowData = dsDetail.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {

                // 신규등록 내역일 경우, rowData에 작업일자 put
                String processingNoD = (String)rowData.get("P_PROCESSING_NO");
                if (processingNoD == null || processingNoD.equals("")) {
                    rowData.put("P_PROCESSING_NO", processingNo);
                }
                // 최초등록자ID/일자 put
                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);

                insertSql(INSERT_ID_LC110ND, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LC110ND, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_LC110ND, rowData);
            }
        }
    }

    /*
     * 마스터/디테일 비고 저장 처리
     */
    @Override
    @SuppressWarnings("unchecked")
    public void updateRemark(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);

        String userId = (String)params.get(Consts.PK_USER_ID);

        int dsMasterCnt = dsMaster.size();
        int dsDetailCnt = dsDetail.size();

        // (MasterGrid)가공작업
        for (int i = 0; i < dsMasterCnt; i++) {
            Map<String, Object> rowData = dsMaster.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LC110NM, rowData);
            }
        }
        // (DetailGrid)가공작업상세
        for (int i = 0; i < dsDetailCnt; i++) {
            Map<String, Object> rowData = dsDetail.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LC110ND, rowData);
            }
        }
    }

    /*
     * 가공작업관리 상태 업데이트
     */
    @SuppressWarnings("unchecked")
    @Override
    public void callLCProcessing(Map<String, Object> params) throws Exception {

        // 파라메터 처리
        Map<String, Object> dsMaster = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);

        String processState = (String)params.get(Consts.PK_PROCESS_STATE_FW);
        String oMsg;

        Map<String, Object> resultMap = null;

        // 확정/확정취소 프로시저 호출
        if (Consts.DIRECTION_FW.equals(processState)) {
            resultMap = callProcedure(SP_ID_LC_FW_PROCESSING_CONFIRM, dsMaster);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        } else {
            resultMap = callProcedure(SP_ID_LC_BW_PROCESSING_CONFIRM, dsMaster);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }

    /*
     * 가공작업관리 내역 삭제
     */
    @Override
    public Map<String, Object> callLCBwProcessingEntry(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LC_BW_PROCESSING_ENTRY, params);
    }
}
