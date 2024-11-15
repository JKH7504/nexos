package nexos.dao.li;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.DaoSupport;

/**
 * Class: LIC02010E0DAOImpl<br>
 * Description: LIC02010E0 DAO (Data Access Object)<br>
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
@Repository("LIC02010E0DAO")
public class LIC02010E0DAOImpl extends DaoSupport implements LIC02010E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(LIC02010E0DAOImpl.class);

    final String PROGRAM_ID                   = "LIC02010E0";

    final String TABLE_NM_LI020NM             = "LI020NM";
    final String INSERT_ID_LI020NM            = PROGRAM_ID + ".INSERT_" + TABLE_NM_LI020NM;
    final String UPDATE_ID_LI020NM            = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LI020NM;
    final String DELETE_ID_LI020NM            = PROGRAM_ID + ".DELETE_" + TABLE_NM_LI020NM;

    final String TABLE_NM_LI020ND             = "LI020ND";
    final String INSERT_ID_LI020ND            = PROGRAM_ID + ".INSERT_" + TABLE_NM_LI020ND;
    final String UPDATE_ID_LI020ND            = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LI020ND;
    final String DELETE_ID_LI020ND            = PROGRAM_ID + ".DELETE_" + TABLE_NM_LI020ND;

    final String TABLE_NM_LI020NS             = "LI020NS";
    final String INSERT_ID_LI020NS            = PROGRAM_ID + ".INSERT_" + TABLE_NM_LI020NS;
    final String UPDATE_ID_LI020NS            = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LI020NS;
    final String DELETE_ID_LI020NS            = PROGRAM_ID + ".DELETE_" + TABLE_NM_LI020NS;

    final String TABLE_NM_LI030NM             = "LI030NM";
    final String UPDATE_ID_LI030NM            = PROGRAM_ID + ".UPDATE_" + TABLE_NM_LI030NM;

    final String SP_ID_LI_020NM_GETNO         = "WT.LI_020NM_GETNO";
    final String SP_ID_LI_020ND_GETNO         = "WT.LI_020ND_GETNO";
    final String SP_ID_LI_PROCESSING          = "LI_PROCESSING";
    final String SP_ID_LI_POLICY_ENTRY_INIT   = "LI_POLICY_ENTRY_INIT";
    final String SP_ID_LI_FW_DIRECTIONS_PLTID = "LI_FW_DIRECTIONS_PLTID";
    final String SP_ID_LI_020ND_QTY_UPDATE    = "LI_020ND_QTY_UPDATE";
    final String SP_ID_LI_POLICY_PARTITIONING = "LI_POLICY_PARTITIONING";
    final String SP_ID_LI_POLICY_PLTID_CREATE = "LI_POLICY_PLTID_CREATE";
    final String SP_ID_SEND_FW_LI_ORDER       = "WCSASETEC.SEND_FW_LI_ORDER";

    /**
     * 입고등록 마스터/디테일 저장 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        // 파라메터 처리
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        // A: 예정 -> 등록, BU: 등록 -> 수정, BC: 신규 등록
        String PROCESS_CD = (String)params.get(Consts.PK_PROCESS_CD);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        Map<String, Object> callParams = new HashMap<String, Object>();
        int dsCount = Util.getCount(dsDetail);

        String CENTER_CD = (String)masterRowData.get("P_CENTER_CD");
        String BU_CD = (String)masterRowData.get("P_BU_CD");
        String INBOUND_DATE = (String)masterRowData.get("P_INBOUND_DATE");
        String INBOUND_NO = (String)masterRowData.get("P_INBOUND_NO");
        int LINE_NO;
        boolean RESET_PLT_ID = false;

        // 등록자ID 입력
        masterRowData.put(Consts.PK_USER_ID, USER_ID);

        // 등록 처리
        // A: 예정 > 등록, BC: 신규 등록
        if (Consts.PROCESS_ORDER.equals(PROCESS_CD) || Consts.PROCESS_ENTRY_CREATE.equals(PROCESS_CD)) {

            if (dsCount < 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LIC02010E0.001", "입고등록 상세내역이 존재하지 않습니다."));
            }

            // 입고번호 채번
            callParams.put("P_CENTER_CD", CENTER_CD);
            callParams.put("P_BU_CD", BU_CD);
            callParams.put("P_INBOUND_DATE", INBOUND_DATE);

            Map<String, Object> resultMap = callProcedure(SP_ID_LI_020NM_GETNO, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            INBOUND_NO = (String)resultMap.get("O_INBOUND_NO");
            LINE_NO = 1;

            // 입고번호 세팅
            masterRowData.put("P_INBOUND_NO", INBOUND_NO);

            // 등록자/등록일시 세팅
            masterRowData.put(Consts.PK_ENTRY_USER_ID, USER_ID);
            masterRowData.put(Consts.PK_ENTRY_DATETIME, Consts.DV_SYSDATE);
            // 마스터 생성, CRUD 체크 안함
            insertSql(INSERT_ID_LI020NM, masterRowData);
        }
        // 수정 처리
        else {
            // 입고순번 채번
            callParams.put("P_CENTER_CD", CENTER_CD);
            callParams.put("P_BU_CD", BU_CD);
            callParams.put("P_INBOUND_DATE", INBOUND_DATE);
            callParams.put("P_INBOUND_NO", INBOUND_NO);

            Map<String, Object> resultMap = callProcedure(SP_ID_LI_020ND_GETNO, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            LINE_NO = Util.toInt(resultMap.get("O_LINE_NO"), 1);

            // 마스터 수정, 마스터를 수정했으면
            if (Consts.DV_CRUD_U.equals(masterRowData.get(Consts.PK_CRUD))) {
                updateSql(UPDATE_ID_LI020NM, masterRowData);

                // 마스터만 수정시 파렛트ID수가 변경되었을 경우
                if (dsCount == 0 //
                    && (Util.toInt(masterRowData.get("P_PALLET_ID_CNT"), 0) != Util.toInt(masterRowData.get("P_OLD_PALLET_ID_CNT"), 0))) {
                    // 파렛트ID 생성하도록 SP 호출
                    RESET_PLT_ID = true;
                }
            }
        }

        // 디테일이 변경되었으면 LI_PROCESSING 호출
        if (dsCount > 0) {

            // 지시 초기화
            callParams.clear();
            callParams.put("P_CENTER_CD", CENTER_CD);
            callParams.put("P_BU_CD", BU_CD);
            callParams.put("P_INBOUND_DATE", INBOUND_DATE);
            callParams.put("P_INBOUND_NO", INBOUND_NO);
            // callParams.put("P_LINE_NO", "");
            // callParams.put("P_PLTID_DELETE_YN", Consts.YES);
            callParams.put(Consts.PK_USER_ID, USER_ID);

            Map<String, Object> resultMap = callProcedure(SP_ID_LI_POLICY_ENTRY_INIT, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            // 디테일 처리
            for (int i = 0; i < dsCount; i++) {
                Map<String, Object> rowData = dsDetail.get(i);
                rowData.put(Consts.PK_USER_ID, USER_ID);
                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowData.put("P_INBOUND_NO", INBOUND_NO);
                    if (Util.isNull(rowData.get("P_LINE_NO"))) {
                        rowData.put("P_LINE_NO", LINE_NO);
                        LINE_NO++;
                    }
                    rowData.put(Consts.PK_ENTRY_USER_ID, USER_ID);
                    rowData.put(Consts.PK_ENTRY_DATETIME, Consts.DV_SYSDATE);
                    insertSql(INSERT_ID_LI020ND, rowData);
                } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                    updateSql(UPDATE_ID_LI020ND, rowData);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_LI020ND, rowData);
                }
                // 디테일 상세 저장 호출 - 저장내용 있을 경우만 호출
                if (dsSub != null) {
                    saveNS(dsSub, String.valueOf(rowData.get("P_INBOUND_NO")), String.valueOf(rowData.get("P_LINE_NO")),
                        String.valueOf(rowData.get("P_ROW_ID")), USER_ID);
                }
            }

            callParams.clear();
            callParams.put("P_CENTER_CD", CENTER_CD);
            callParams.put("P_BU_CD", BU_CD);
            callParams.put("P_INBOUND_DATE", INBOUND_DATE);
            callParams.put("P_INBOUND_NO", INBOUND_NO);
            callParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER.equals(PROCESS_CD) ? Consts.PROCESS_ENTRY_CREATE : PROCESS_CD);
            callParams.put(Consts.PK_DIRECTION, Consts.DIRECTION_FW);
            callParams.put(Consts.PK_USER_ID, USER_ID);

            resultMap = callProcedure(SP_ID_LI_PROCESSING, callParams);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            // 입고번호 정보 리턴
            params.put("O_INBOUND_DATE", INBOUND_DATE);
            params.put("O_INBOUND_NO", INBOUND_NO);
        }
        // 디테일 변경 없이 파렛트ID수만 변경되었을 경우 파렛트ID 재생성
        else if (RESET_PLT_ID) {
            // 파렛트ID 생성하도록 SP 호출
            callParams.clear();
            callParams.put("P_CENTER_CD", CENTER_CD);
            callParams.put("P_BU_CD", BU_CD);
            callParams.put("P_INBOUND_DATE", INBOUND_DATE);
            callParams.put("P_INBOUND_NO", INBOUND_NO);
            callParams.put("P_POLICY_LI230", "");
            callParams.put(Consts.PK_USER_ID, USER_ID);

            Map<String, Object> resultMap = callProcedure(SP_ID_LI_POLICY_PLTID_CREATE, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public void saveMaster(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        int dsCount = Util.getCount(dsSave);
        for (int i = 0; i < dsCount; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, USER_ID);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LI020NM, rowData);
            }
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public void saveDetail(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        int dsCount = Util.getCount(dsSave);
        for (int i = 0; i < dsCount; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, USER_ID);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_LI020ND, rowData);
            }
        }
    }

    /**
     * 입고지시 - 입고지시 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Override
    public void saveDirectionsPltId(Map<String, Object> params) throws Exception {

        // 파라메터 처리
        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        // INSERT/UPDATE/DELETE 처리
        int dsCount = Util.getCount(dsSave);
        for (int i = 0; i < dsCount; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, USER_ID);

            // 지시 업데이트
            Map<String, Object> resultMap = callProcedure(SP_ID_LI_FW_DIRECTIONS_PLTID, rowData);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }

        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        masterRowData.put(Consts.PK_USER_ID, USER_ID);
        Map<String, Object> resultMap = callProcedure(SP_ID_LI_020ND_QTY_UPDATE, masterRowData);
        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }
    }

    /**
     * 입고확정/적치 - 입고지시 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Override
    public void saveDirections(Map<String, Object> params) throws Exception {

        // 파라메터 처리
        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        // 확정의 비고 수정가능하도록 추가
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        String PROCESS_CD = (String)masterRowData.get(Consts.PK_PROCESS_CD);
        String rowCrud = (String)masterRowData.get(Consts.PK_CRUD);

        masterRowData.put(Consts.PK_USER_ID, USER_ID);
        if (Consts.DV_CRUD_U.equals(rowCrud)) {
            updateSql(UPDATE_ID_LI020NM, masterRowData);
        }

        // 디테일 확정수량 수정 Map
        Map<String, Object> callParams = new HashMap<String, Object>();
        callParams.put(Consts.PK_USER_ID, USER_ID);
        callParams.put(Consts.PK_PROCESS_CD, PROCESS_CD);

        // INSERT/UPDATE/DELETE 처리
        int dsCount = Util.getCount(dsSave);
        for (int i = 0; i < dsCount; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, USER_ID);

            rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                // 지시 업데이트
                if (Consts.PROCESS_CONFIRM.equals(PROCESS_CD)) {
                    // 확정에서 저장시 검수여부에 따라 사용자정보 입력
                    if (Consts.YES.equals(rowData.get("P_INSPECT_YN"))) {
                        rowData.put("P_INSPECT_USER_ID", USER_ID);
                        rowData.put("P_INSPECT_DATETIME", Consts.DV_SYSDATE);
                    }

                } else if (Consts.PROCESS_PUTAWAY.equals(PROCESS_CD)) {
                    // 적치에서 저장시 검수여부에 따라 사용자정보 입력
                    if (Consts.YES.equals(rowData.get("P_PUTAWAY_YN"))) {
                        rowData.put("P_PUTAWAY_USER_ID", USER_ID);
                        rowData.put("P_PUTAWAY_DATETIME", Consts.DV_SYSDATE);
                    }
                }
                updateSql(UPDATE_ID_LI030NM, rowData);

                // 디테일 업데이트
                callParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
                callParams.put("P_BU_CD", rowData.get("P_BU_CD"));
                callParams.put("P_INBOUND_DATE", rowData.get("P_INBOUND_DATE"));
                callParams.put("P_INBOUND_NO", rowData.get("P_INBOUND_NO"));
                callParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));

                Map<String, Object> resultMap = callProcedure(SP_ID_LI_020ND_QTY_UPDATE, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
        }

    }

    /**
     * 디테일상세 저장
     *
     * @param dsSub
     * @param inboundNo
     * @param lineNo
     * @param rowId
     * @param userId
     */
    private void saveNS(List<Map<String, Object>> dsSub, String inboundNo, String lineNo, String rowId, String userId) {

        // 디테일 상세 처리
        for (int i = 0; i < dsSub.size(); i++) {
            Map<String, Object> rowData = dsSub.get(i);
            rowData.put(Consts.PK_USER_ID, userId);

            if (rowId.equals(String.valueOf(rowData.get("P_ROW_ID")))) {
                String rowCrud = (String)rowData.get(Consts.PK_CRUD);
                if (Consts.DV_CRUD_C.equals(rowCrud)) {
                    rowData.put("P_INBOUND_NO", inboundNo);
                    rowData.put("P_LINE_NO", lineNo);
                    rowData.put(Consts.PK_REG_USER_ID, userId);
                    rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                    insertSql(INSERT_ID_LI020NS, rowData);
                } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                    updateSql(UPDATE_ID_LI020NS, rowData);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_LI020NS, rowData);
                }
            }
        }
    }

    /**
     * 입고확정/적치 - 직송여부 변경 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Override
    public void saveDirectYn(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        int dsCount = Util.getCount(dsSave);
        for (int i = 0; i < dsCount; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, USER_ID);
            updateSql(UPDATE_ID_LI020NM, rowData);
        }
    }

    /**
     * 입고 부분취소 처리
     */
    @Override
    public void callLIPatialCancel(Map<String, Object> params) throws Exception {

        String oMsg;
        Map<String, Object> resultMap = null;

        // CHECKED_VALUE INSERT
        insertCheckedValue(params);

        resultMap = callProcedure(SP_ID_LI_POLICY_PARTITIONING, params);
        oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }

        params.put("P_INBOUND_NO", resultMap.get("O_INBOUND_NO"));
        resultMap = callProcedure(SP_ID_LI_PROCESSING, params);
        oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
        }
        // 적치단계에서 부분취소 호출 되었을 경우, 확정취소 안되어, 다시 확정 취소 호출 함
        if (Consts.PROCESS_PUTAWAY.equals(params.get("P_PROCESS_CD"))) {
            params.put("P_PROCESS_CD", Consts.PROCESS_CONFIRM);
            resultMap = callProcedure(SP_ID_LI_PROCESSING, params);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }

    }

    @Override
    @SuppressWarnings("unchecked")
    public void callSendFwLiOrder(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsSave = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        int dsCount = Util.getCount(dsSave);
        for (int i = 0; i < dsCount; i++) {
            Map<String, Object> rowData = dsSave.get(i);
            rowData.put(Consts.PK_USER_ID, USER_ID);
            Map<String, Object> resultMap = callProcedure(SP_ID_SEND_FW_LI_ORDER, rowData);

            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }
}
