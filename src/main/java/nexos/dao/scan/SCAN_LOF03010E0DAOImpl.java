package nexos.dao.scan;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.DaoSupport;

/**
 * Class: ScanInspectionDAOImpl<br>
 * Description: ScanInspection DAO (Data Access Object)<br>
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
@Repository("SCAN_LOF03010E0DAO")
public class SCAN_LOF03010E0DAOImpl extends DaoSupport implements SCAN_LOF03010E0DAO {

    final String PROGRAM_ID                         = "SCAN_LOF03010E0";

    final String SP_ID_LO_SCAN_BOX_SAVE_T1          = PROGRAM_ID + ".LO_SCAN_BOX_SAVE_T1";          // 순번 단위 저장
    final String SP_ID_LO_SCAN_BOX_SAVE_T2          = PROGRAM_ID + ".LO_SCAN_BOX_SAVE_T2";          // 상품 단위 저장
    final String SP_ID_LO_SCAN_BOX_TOTAL_INSPECTION = PROGRAM_ID + ".LO_SCAN_BOX_TOTAL_INSPECTION"; // TOTAL 일괄검수 저장
    final String SP_ID_LO_SCAN_BOX_COMPLETE         = PROGRAM_ID + ".LO_SCAN_BOX_COMPLETE";
    final String SP_ID_LO_SCAN_BOX_DELETE           = PROGRAM_ID + ".LO_SCAN_BOX_DELETE";
    final String SP_ID_LO_SCAN_BOX_MERGE            = PROGRAM_ID + ".LO_SCAN_BOX_MERGE";
    final String SP_ID_LO_SCAN_SAVE_SERIAL          = PROGRAM_ID + ".LO_SCAN_SAVE_SERIAL";          // 일련번호 저장
    final String SP_ID_LO_SCAN_SAVE_BATCH           = PROGRAM_ID + ".LO_SCAN_SAVE_BATCH";           // 제조배치 저장
    final String SP_ID_LO_FW_SCAN_CONFIRM           = PROGRAM_ID + ".LO_FW_SCAN_CONFIRM";
    final String SP_ID_LO_BW_SCAN_CONFIRM           = PROGRAM_ID + ".LO_BW_SCAN_CONFIRM";
    final String SP_ID_LO_SCAN_TDAS_LABEL           = PROGRAM_ID + ".LO_SCAN_TDAS_LABEL";

    final String SP_ID_GET_WB_NO                    = "WB.GET_WB_NO";
    final String SP_ID_SET_WBNO_PRINT_CNT_UPDATE    = "WB.SET_WBNO_PRINT_CNT_UPDATE";

    @SuppressWarnings("unchecked")
    @Override
    public void callLOScanBoxSave(Map<String, Object> params) throws Exception {

        // 마스터 데이터
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        // 디테일 데이터
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        // 일련번호 데이터
        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);

        // 추가 정보
        String userId = (String)masterRowData.get(Consts.PK_USER_ID);
        String completeYn = (String)params.get("P_COMPLETE_YN"); // 박스완료여부
        // int orderType = (int)params.get("P_ORDER_TYPE"); // 1 - ORDER, 2 - TOTAL
        String saveType = (String)params.get("P_SAVE_TYPE"); // 저장타입 - T1 - 순번, T2 - 상품
        String callSPName;
        if ("T1".equals(saveType)) {
            callSPName = SP_ID_LO_SCAN_BOX_SAVE_T1;
        } else {
            callSPName = SP_ID_LO_SCAN_BOX_SAVE_T2;
        }

        // ORDER -> 수정된 데이터(전표의 상품 여러건), TOTAL -> 수정된 데이터(전표의 상품 한건)
        String oMsg;
        Map<String, Object> resultMap = null;
        int dsCnt = dsDetail.size();
        // ORDER
        // 박스저장 처리
        if (dsCnt > 0) {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsDetail.get(i);
                rowData.put(Consts.PK_USER_ID, userId);
                resultMap = callProcedure(callSPName, rowData);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }

            dsCnt = dsSub.size();
            if (dsCnt > 0) {
                for (int i = 0; i < dsCnt; i++) {
                    Map<String, Object> rowData = dsSub.get(i);
                    rowData.put(Consts.PK_USER_ID, userId);
                    resultMap = callProcedure(SP_ID_LO_SCAN_SAVE_SERIAL, rowData);
                    oMsg = Util.getOutMessage(resultMap);
                    if (!Consts.OK.equals(oMsg)) {
                        throw new RuntimeException(oMsg);
                    }
                }
            }
        }
        // 박스완료 처리, 송장번호는 SP에서 처리
        if (Consts.YES.equals(completeYn)) {
            resultMap = callProcedure(SP_ID_LO_SCAN_BOX_COMPLETE, masterRowData);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public void callLOScanPopBoxSave(Map<String, Object> params) throws Exception {

        // 마스터 데이터
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        // 디테일 데이터
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        // 추가 정보
        String userId = (String)masterRowData.get(Consts.PK_USER_ID);
        String saveType = (String)params.get("P_SAVE_TYPE"); // 저장타입 - T1 - 순번, T2 - 상품
        String callSPName;
        if ("T1".equals(saveType)) {
            callSPName = SP_ID_LO_SCAN_BOX_SAVE_T1;
        } else {
            callSPName = SP_ID_LO_SCAN_BOX_SAVE_T2;
        }

        // ORDER -> 수정된 데이터(전표의 상품 여러건), TOTAL -> 수정된 데이터(전표의 상품 한건)
        String oMsg;
        Map<String, Object> resultMap = null;
        int dsCnt = dsDetail.size();
        // ORDER
        // 박스저장 처리
        if (dsCnt > 0) {
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsDetail.get(i);
                rowData.put(Consts.PK_USER_ID, userId);
                resultMap = callProcedure(callSPName, rowData);
                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
        }
    }

    @Override
    public void callLOScanBoxTotalInspection(Map<String, Object> params) throws Exception {

        String oMsg;
        Map<String, Object> resultMap = null;

        // CHECKED_VALUE INSERT
        insertCheckedValue(params);

        // TOTAL 일괄검수 처리
        resultMap = callProcedure(SP_ID_LO_SCAN_BOX_TOTAL_INSPECTION, params);
        oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public String callLOScanBoxDelete(Map<String, Object> params) throws Exception {

        String result = Consts.OK;
        String userId = (String)params.get(Consts.PK_USER_ID);

        Map<String, Object> resultMap = null;
        String oMsg;

        // 파라메터 처리
        List<Map<String, Object>> dsMaster = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

        int dsCnt = dsMaster.size();
        if (dsCnt > 0) {
            // 디테일 처리
            for (int i = 0; i < dsCnt; i++) {
                Map<String, Object> rowData = dsMaster.get(i);

                rowData.put(Consts.PK_USER_ID, userId);
                resultMap = callProcedure(SP_ID_LO_SCAN_BOX_DELETE, rowData);

                oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
        }

        return result;
    }

    @Override
    public Map<String, Object> callLOScanBoxMerge(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LO_SCAN_BOX_MERGE, params);
    }

    @Override
    public Map<String, Object> callLOFWScanConfirm(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LO_FW_SCAN_CONFIRM, params);
    }

    @Override
    public Map<String, Object> callLOBWScanConfirm(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LO_BW_SCAN_CONFIRM, params);
    }

    @Override
    public Map<String, Object> callSetWbNoPrintCntUpdate(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_SET_WBNO_PRINT_CNT_UPDATE, params);
    }

    @Override
    public Map<String, Object> callLOScanTdasLabel(Map<String, Object> params) throws Exception {

        return callProcedure(SP_ID_LO_SCAN_TDAS_LABEL, params);
    }

}