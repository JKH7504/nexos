package nexos.service.lc;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.dao.lc.LCC01010E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.ServiceSupport;
import nexos.service.ed.common.EDCommonService;

/**
 * Class: LCC01010E0Service<br>
 * Description: 기타입출고관리(LCC01010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service
public class LCC01010E0Service extends ServiceSupport {

    final String            SP_ID_GET_LC_CONFIRM_YN        = "WF.GET_LC_CONFIRM_YN";
    final String            SP_ID_LC_BW_ETC_ENTRY          = "LC_BW_ETC_ENTRY";
    final String            SP_ID_LC_FW_ETC_INCONFIRM      = "LC_FW_ETC_INCONFIRM";
    final String            SP_ID_LC_BW_ETC_INCONFIRM      = "LC_BW_ETC_INCONFIRM";
    final String            SP_ID_LC_FW_ETC_OUTCONFIRM     = "LC_FW_ETC_OUTCONFIRM";
    final String            SP_ID_LC_BW_ETC_OUTCONFIRM     = "LC_BW_ETC_OUTCONFIRM";
    final String            SP_ID_WCSRFID_SEND_FW_LC_ORDER = "WCSRFID.SEND_FW_LC_ORDER";
    final String            SP_ID_WCSRFID_SEND_BW_LC_ORDER = "WCSRFID.SEND_BW_LC_ORDER";

    @Autowired
    private LCC01010E0DAO   dao;

    @Autowired
    private EDCommonService edCommonService;

    /**
     * 기타입출고관리 - 비고 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    public String updateRemark(Map<String, Object> params) throws Exception {

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.updateRemark(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 기타입출고관리 - 기타입출고 등록 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    @SuppressWarnings("unchecked")
    public String save(Map<String, Object> params) throws Exception {

        // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
        final String TABLE_DIV = "A";

        Map<String, Object> masterRowData = (Map<String, Object>)params.get(Consts.PK_DS_MASTER);
        String processCd = (String)params.get(Consts.PK_PROCESS_CD);
        String userId = (String)params.get(Consts.PK_USER_ID);
        String policyEM191 = (String)masterRowData.get("P_POLICY_EM191");

        if (!Consts.PROCESS_ENTRY_CREATE.equals(processCd)) {
            Map<String, Object> checkParams = new HashMap<String, Object>();
            checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            checkParams.put("P_ETC_DATE", masterRowData.get("P_ETC_DATE"));
            checkParams.put("P_ETC_NO", masterRowData.get("P_ETC_NO"));
            checkParams.put("P_TABLE_DIV", TABLE_DIV);

            String oMsg = getConfirmYn(checkParams);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }

        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.save(params);

            // [RFID]시스템연동 정책 - 1.연동함
            if ("1".equals(policyEM191) && Consts.PROCESS_ENTRY_CREATE.equals(processCd)) {
                Map<String, Object> rfidParams = new HashMap<String, Object>();
                rfidParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
                rfidParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
                rfidParams.put("P_ETC_DATE", masterRowData.get("P_ETC_DATE"));
                rfidParams.put("P_ETC_NO", params.get("O_ETC_NO"));
                rfidParams.put("P_USER_ID", userId);
                Map<String, Object> resultMap = callProcedure(SP_ID_WCSRFID_SEND_FW_LC_ORDER, rfidParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 저장/삭제시 확정된 전표일 경우 저장/삭제 불가
     *
     * @param params
     * @param checkState
     * @return
     */
    public String getConfirmYn(Map<String, Object> params) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_LC_CONFIRM_YN, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (!Consts.OK.equals(oMsg)) {
            result = oMsg;
        } else {
            String oConfirmYn = (String)resultMap.get("O_CONFIRM_YN");
            if (Consts.YES.equals(oConfirmYn)) {
                result = NexosMessage.getDisplayMsg("JAVA.LCC.001", "이미 확정 처리된 데이터입니다.");
            } else {
                result = oMsg;
            }
        }
        return result;
    }

    /**
     * 삭제/확정/취소시 SP 호출
     *
     * @param params
     * @return
     * @throws Exception
     */
    public String callLCProcessing(Map<String, Object> params) throws Exception {

        String result = Consts.OK;
        final String IN_CD = "E";
        final String DV_DEL = "DEL";

        Map<String, Object> callParams = new HashMap<String, Object>();
        callParams.put("P_CENTER_CD", params.get("P_CENTER_CD"));
        callParams.put("P_BU_CD", params.get("P_BU_CD"));
        callParams.put("P_ETC_DATE", params.get("P_ETC_DATE"));
        callParams.put("P_ETC_NO", params.get("P_ETC_NO"));
        callParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));

        String PROCEDURE_ID = null;
        String PROCESS_DIV = (String)params.get("P_PROCESS_DIV");
        String inoutGrp = params.get("P_INOUT_CD").toString().substring(0, 1);
        if (inoutGrp.equals(IN_CD)) {
            if (Consts.DIRECTION_FW.equals(PROCESS_DIV)) {
                PROCEDURE_ID = SP_ID_LC_FW_ETC_INCONFIRM;
            } else if (Consts.DIRECTION_BW.equals(PROCESS_DIV)) {
                PROCEDURE_ID = SP_ID_LC_BW_ETC_INCONFIRM;
            } else {
                PROCEDURE_ID = SP_ID_LC_BW_ETC_ENTRY;
                callParams.put("P_LINE_NO", "");
            }
        } else {
            if (Consts.DIRECTION_FW.equals(PROCESS_DIV)) {
                PROCEDURE_ID = SP_ID_LC_FW_ETC_OUTCONFIRM;
            } else if (Consts.DIRECTION_BW.equals(PROCESS_DIV)) {
                PROCEDURE_ID = SP_ID_LC_BW_ETC_OUTCONFIRM;
            } else {
                PROCEDURE_ID = SP_ID_LC_BW_ETC_ENTRY;
                callParams.put("P_LINE_NO", "");
            }
        }

        Map<String, Object> realtimeMap = null;
        TransactionStatus ts = beginTrans();
        try {
            Map<String, Object> resultMap = null;
            String oMsg = null;
            String policyEM191 = (String)params.get("P_POLICY_EM191");
            if ("1".equals(policyEM191) && DV_DEL.equals(PROCESS_DIV)) {
                resultMap = callProcedure(SP_ID_WCSRFID_SEND_BW_LC_ORDER, callParams);
                oMsg = Util.getOutMessage(resultMap);
                // 오류면 Rollback
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }

            resultMap = callProcedure(PROCEDURE_ID, callParams);
            oMsg = Util.getOutMessage(resultMap);
            // 오류면 Rollback
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }

            // 실시간 송신 호출
            if (SP_ID_LC_FW_ETC_INCONFIRM.equals(PROCEDURE_ID) || SP_ID_LC_FW_ETC_OUTCONFIRM.equals(PROCEDURE_ID)
                || SP_ID_LC_BW_ETC_INCONFIRM.equals(PROCEDURE_ID) || SP_ID_LC_BW_ETC_OUTCONFIRM.equals(PROCEDURE_ID)) {
                realtimeMap = edCommonService.realtimeSendProcessing();
                oMsg = Util.getOutMessage(realtimeMap);
                // 오류면 Rollback
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 실시간 결과 데이터 반영, 자체 트랜잭션 처리 함
        if (realtimeMap != null && Consts.OK.equals(Util.getOutMessage(realtimeMap))) {
            edCommonService.ifResultProcessing(realtimeMap);
        }

        return result;
    }
}
