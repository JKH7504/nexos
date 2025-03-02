package nexos.dao.ri;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.DaoSupport;

/**
 * Class: RIM02010E0DAOImpl<br>
 * Description: RIM02010E0 DAO (Data Access Object)<br>
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
@Repository("RIM02010E0DAO")
public class RIM02010E0DAOImpl extends DaoSupport implements RIM02010E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(RIM02010E0DAOImpl.class);
    final String PROGRAM_ID                   = "RIM02010E0";
    final String PRORAM_ID_RIB02010E0         = "RIB02010E0";

    final String TABLE_NM_RI020NM             = "RI020NM";
    final String INSERT_ID_RI020NM            = PRORAM_ID_RIB02010E0 + ".INSERT_" + TABLE_NM_RI020NM;
    final String UPDATE_ID_RI020NM            = PRORAM_ID_RIB02010E0 + ".UPDATE_" + TABLE_NM_RI020NM;
    final String DELETE_ID_RI020NM            = PRORAM_ID_RIB02010E0 + ".DELETE_" + TABLE_NM_RI020NM;

    final String TABLE_NM_RI020ND             = "RI020ND";
    final String INSERT_ID_RI020ND            = PRORAM_ID_RIB02010E0 + ".INSERT_" + TABLE_NM_RI020ND;
    final String UPDATE_ID_RI020ND            = PRORAM_ID_RIB02010E0 + ".UPDATE_" + TABLE_NM_RI020ND;
    final String DELETE_ID_RI020ND            = PRORAM_ID_RIB02010E0 + ".DELETE_" + TABLE_NM_RI020ND;

    final String TABLE_NM_RI030NM             = "RI030NM";
    final String UPDATE_ID_RI030NM            = PRORAM_ID_RIB02010E0 + ".UPDATE_" + TABLE_NM_RI030NM;

    final String SP_ID_RI_020NM_GETNO         = "WT.RI_020NM_GETNO";
    final String SP_ID_RI_020ND_GETNO         = "WT.RI_020ND_GETNO";
    final String SP_ID_RI_PROCESSING          = "RI_PROCESSING";
    final String SP_ID_RI_POLICY_ENTRY_INIT   = "RI_POLICY_ENTRY_INIT";
    final String SP_ID_RI_FW_DIRECTIONS_PLTID = "RI_FW_DIRECTIONS_PLTID";
    final String SP_ID_RI_020ND_QTY_UPDATE    = "RI_020ND_QTY_UPDATE";

    /**
     * 온라인반입등록 마스터/디테일 저장 처리
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
        // A: 예정 -> 등록, B: 등록 -> 수정, N: 신규 등록
        String PROCESS_CD = (String)params.get(Consts.PK_PROCESS_CD);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        Map<String, Object> callParams = new HashMap<String, Object>();
        int dsCount = Util.getCount(dsDetail);

        String CENTER_CD = (String)masterRowData.get("P_CENTER_CD");
        String BU_CD = (String)masterRowData.get("P_BU_CD");
        String INBOUND_DATE = (String)masterRowData.get("P_INBOUND_DATE");
        String INBOUND_NO = (String)masterRowData.get("P_INBOUND_NO");
        int LINE_NO;

        // 등록자ID 입력
        masterRowData.put(Consts.PK_USER_ID, USER_ID);

        // 등록 처리
        // A: 예정 > 등록, BC: 신규 등록
        if (Consts.PROCESS_ORDER.equals(PROCESS_CD) || Consts.PROCESS_ENTRY_CREATE.equals(PROCESS_CD)) {

            if (dsCount < 1) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.RIM02010E0.001", "온라인반입등록 상세내역이 존재하지 않습니다."));
            }

            // 온라인반입번호 채번
            callParams.put("P_CENTER_CD", CENTER_CD);
            callParams.put("P_BU_CD", BU_CD);
            callParams.put("P_INBOUND_DATE", INBOUND_DATE);

            Map<String, Object> resultMap = callProcedure(SP_ID_RI_020NM_GETNO, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            INBOUND_NO = (String)resultMap.get("O_INBOUND_NO");
            LINE_NO = 1;

            // 반입번호 세팅
            masterRowData.put("P_INBOUND_NO", INBOUND_NO);
            // 등록자/등록일시 세팅
            masterRowData.put(Consts.PK_ENTRY_USER_ID, USER_ID);
            masterRowData.put(Consts.PK_ENTRY_DATETIME, Consts.DV_SYSDATE);
            // 마스터 생성, CRUD 체크 안함
            insertSql(INSERT_ID_RI020NM, masterRowData);

        }
        // BU: 수정 처리
        else {
            // 온라인반입순번 채번
            callParams.put("P_CENTER_CD", CENTER_CD);
            callParams.put("P_BU_CD", BU_CD);
            callParams.put("P_INBOUND_DATE", INBOUND_DATE);
            callParams.put("P_INBOUND_NO", INBOUND_NO);

            Map<String, Object> resultMap = callProcedure(SP_ID_RI_020ND_GETNO, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            LINE_NO = Util.toInt(resultMap.get("O_LINE_NO"), 1);

            // 마스터 수정, 마스터를 수정했으면
            if (Consts.DV_CRUD_U.equals(masterRowData.get(Consts.PK_CRUD))) {
                updateSql(UPDATE_ID_RI020NM, masterRowData);
            }

        }

        // 디테일이 변경되었으면 RI_PROCESSING 호출
        if (dsCount > 0) {

            // 지시 초기화
            callParams.clear();
            callParams.put("P_CENTER_CD", CENTER_CD);
            callParams.put("P_BU_CD", BU_CD);
            callParams.put("P_INBOUND_DATE", INBOUND_DATE);
            callParams.put("P_INBOUND_NO", INBOUND_NO);
            // newParams.put("P_LINE_NO", "");
            // newParams.put("P_PLTID_DELETE_YN", "Y");
            callParams.put(Consts.PK_USER_ID, USER_ID);

            Map<String, Object> resultMap = callProcedure(SP_ID_RI_POLICY_ENTRY_INIT, callParams);
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
                    insertSql(INSERT_ID_RI020ND, rowData);
                } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                    updateSql(UPDATE_ID_RI020ND, rowData);
                } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                    deleteSql(DELETE_ID_RI020ND, rowData);
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

            resultMap = callProcedure(SP_ID_RI_PROCESSING, callParams);
            oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            // 반입번호 정보 리턴
            params.put("O_INBOUND_DATE", INBOUND_DATE);
            params.put("O_INBOUND_NO", INBOUND_NO);
        }
    }

    /**
     * 온라인반입지시 - 온라인반입지시 저장
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
            Map<String, Object> resultMap = callProcedure(SP_ID_RI_FW_DIRECTIONS_PLTID, rowData);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
    }

    /**
     * 온라인반입확정/적치 - 온라인반입지시 저장
     *
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Override
    public void saveDirections(Map<String, Object> params) throws Exception {

        // 파라메터 처리
        List<Map<String, Object>> dsDetail = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        List<Map<String, Object>> dsSub = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
        String USER_ID = (String)params.get(Consts.PK_USER_ID);

        // 확정의 비고 수정가능하도록 추가
        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        String PROCESS_CD = (String)masterRowData.get(Consts.PK_PROCESS_CD);
        String rowCrud = (String)masterRowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_U.equals(rowCrud)) {
            masterRowData.put(Consts.PK_USER_ID, USER_ID);

            updateSql(UPDATE_ID_RI020NM, masterRowData);
        }

        // 디테일 확정수량 수정 Map
        Map<String, Object> callParams = new HashMap<String, Object>();
        callParams.put(Consts.PK_USER_ID, USER_ID);
        callParams.put(Consts.PK_PROCESS_CD, PROCESS_CD);

        // INSERT/UPDATE/DELETE 처리
        int dsCount = Util.getCount(dsSub);
        for (int i = 0; i < dsCount; i++) {
            Map<String, Object> rowData = dsSub.get(i);
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
                updateSql(UPDATE_ID_RI030NM, rowData);

                // 디테일 업데이트
                callParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
                callParams.put("P_BU_CD", rowData.get("P_BU_CD"));
                callParams.put("P_INBOUND_DATE", rowData.get("P_INBOUND_DATE"));
                callParams.put("P_INBOUND_NO", rowData.get("P_INBOUND_NO"));
                callParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));

                Map<String, Object> resultMap = callProcedure(SP_ID_RI_020ND_QTY_UPDATE, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
        }

        // INSERT/UPDATE/DELETE 처리
        dsCount = Util.getCount(dsDetail);
        for (int i = 0; i < dsCount; i++) {
            Map<String, Object> rowData = dsDetail.get(i);
            rowData.put(Consts.PK_USER_ID, USER_ID);
            rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_RI020ND, rowData);
            }
        }
    }

}
