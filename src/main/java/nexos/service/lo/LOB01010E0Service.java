package nexos.service.lo;

import java.io.File;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.web.multipart.MultipartFile;

import nexos.dao.lo.LOB01010E0DAO;
import nexos.framework.Consts;
import nexos.framework.NexosConsts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: LOB01010E0Service<br>
 * Description: 출고예정작업(LOB01010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class LOB01010E0Service extends ServiceSupport {

    final String          SP_ID_GET_LO_OUTBOUND_STATE    = "WF.GET_LO_OUTBOUND_STATE";
    final String          SP_ID_CHK_LOORDER_DEADLINE     = "WF.CHK_LOORDER_DEADLINE";
    final String          SP_ID_LO_ORDER_CLOSING         = "LO_ORDER_CLOSING";
    final String          SP_ID_LO_ORDER_DELETE          = "LO_ORDER_DELETE";
    final String          SP_ID_LO_ORDER_HOLD            = "LO_ORDER_HOLD";
    final String          SP_ID_LO_ATTACH_FILE_NM_UPDATE = "LO_ATTACH_FILE_NM_UPDATE";

    final String          CHECK_STATE                    = Consts.STATE_ORDER;

    @Autowired
    private LOB01010E0DAO dao;

    /**
     * 첨부파일 업로드 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> attachmentFileUpload(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;
        File oldAttachFile = null;
        File oldAttachBackupFile = null;
        TransactionStatus ts = beginTrans();
        try {
            String attachFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.ATTACHMENT.ORDER.LO") //
            );
            MultipartFile attachmentMultipartFile = (MultipartFile)params.get("P_UPLOAD_FILE");
            params.remove("P_UPLOAD_FILE"); // return시 MultipartFile는 serialize가 안되기 때문에 제거
            String attachFileNm = Util.replaceRestrictChars(attachmentMultipartFile.getOriginalFilename());
            params.put("P_ATTACH_FILE_NM", attachFileNm);

            resultMap = callProcedure(SP_ID_LO_ATTACH_FILE_NM_UPDATE, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            String newAttachFileNm = (String)resultMap.get("O_NEW_ATTACH_FILE_NM");
            String oldAttachFileNm = (String)resultMap.get("O_OLD_ATTACH_FILE_NM");

            File newAttachFile = new File(attachFilePath, newAttachFileNm);
            if (newAttachFile.exists()) {
                // 첨부파일명과 동일한 파일이 이미 존재할 경우, 삭제, 삭제불가시 오류
                if (!newAttachFile.delete()) {
                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB01010E0.XXX", "첨부파일: " + attachFileNm //
                        + "\n\n해당 파일명으로 파일을 저장할 수 없습니다. 파일명을 변경 후 처리하십시오.", new String[] {attachFileNm}));
                }
            }

            // 기존 첨부파일이 존재할 경우 백업 후 정상 처리될 경우에 삭제
            if (Util.isNotNull(oldAttachFileNm)) {
                oldAttachFile = new File(attachFilePath, oldAttachFileNm);
                if (oldAttachFile.exists()) {
                    oldAttachBackupFile = new File(attachFilePath, oldAttachFileNm + ".bak");
                    if (!oldAttachFile.renameTo(oldAttachBackupFile)) {
                        // throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB02010E0.XXX", "기존 첨부 파일을 삭제할 수 없습니다."));
                    }
                }
            }
            try {
                attachmentMultipartFile.transferTo(newAttachFile);
            } catch (Exception e) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB01010E0.XXX", "첨부파일: " + attachFileNm //
                    + "\n\n해당 첨부 파일을 전송하지 못했습니다.", new String[] {attachFileNm}));
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 정상 처리시 이전 파일 삭제
        if (oldAttachFile != null) {
            try {
                if (oldAttachFile.exists()) {
                    oldAttachFile.delete();
                }
            } catch (Exception e) {
            }
        }
        if (oldAttachBackupFile != null) {
            try {
                if (oldAttachBackupFile.exists()) {
                    oldAttachBackupFile.delete();
                }
            } catch (Exception e) {
            }
        }

        return resultMap;
    }

    /**
     * 첨부파일 삭제 처리
     *
     * @param params
     * @return
     * @throws Exception
     */
    public Map<String, Object> attachmentFileDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap = null;
        TransactionStatus ts = beginTrans();
        try {
            String attachFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.ATTACHMENT.ORDER.LO") //
            );

            resultMap = callProcedure(SP_ID_LO_ATTACH_FILE_NM_UPDATE, params);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            // String newAttachFileNm = (String)resultMap.get("O_NEW_ATTACH_FILE_NM");
            String oldAttachFileNm = (String)resultMap.get("O_OLD_ATTACH_FILE_NM");
            // 기존 첨부파일이 존재할 경우 삭제
            if (Util.isNotNull(oldAttachFileNm)) {
                File oldAttachFile = new File(attachFilePath, oldAttachFileNm);
                if (oldAttachFile.exists()) {
                    if (!oldAttachFile.delete()) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB01010E0.XXX", "기존 첨부 파일을 삭제할 수 없습니다."));
                    }
                }
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return resultMap;
    }

    /**
     * 출고예정작업 팝업 화면 저장 처리
     *
     * @param params
     *        신규, 수정된 데이터
     */
    public String save(Map<String, Object> params) throws Exception {

        // 신규 등록이 아닐 경우 저장 전 출고진행상태 체크
        Map<String, Object> masterRowData = Util.getParameter(params, Consts.PK_DS_MASTER);
        String processCd = (String)params.get(Consts.PK_PROCESS_CD);

        Map<String, Object> checkParams = Util.newMap();
        // 출고예정 - 신규 등록
        if (Consts.PROCESS_ORDER_CREATE.equals(processCd)) {
            checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            checkParams.put("P_ORDER_DATE", masterRowData.get("P_ORDER_DATE"));
            checkParams.put("P_INOUT_GRP", masterRowData.get("P_INOUT_GRP"));

            String oMsg = canCreateOrder(checkParams);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }
        // 출고예정 - 수정
        else {
            checkParams.put("P_CENTER_CD", masterRowData.get("P_CENTER_CD"));
            checkParams.put("P_BU_CD", masterRowData.get("P_BU_CD"));
            checkParams.put("P_OUTBOUND_DATE", masterRowData.get("P_ORDER_DATE"));
            checkParams.put("P_OUTBOUND_NO", masterRowData.get("P_ORDER_NO"));
            checkParams.put("P_LINE_NO", "");
            checkParams.put(Consts.PK_PROCESS_CD, Consts.PROCESS_ORDER);
            checkParams.put("P_STATE_DIV", "1");

            String oMsg = canProcessingState(checkParams, CHECK_STATE);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
        }

        // 저장 처리
        String result = Consts.ERROR;
        TransactionStatus ts = beginTrans();
        try {
            dao.save(params);
            commitTrans(ts);
            result = Consts.OK;
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return result;
    }

    /**
     * 저장/삭제시 상태를 체크해서 "10"이 아닐경우 저장/삭제 불가
     *
     * @param params
     * @param checkState
     * @return
     */
    public String canProcessingState(Map<String, Object> params, String checkState) {

        String result = Consts.OK;
        Map<String, Object> resultMap = callProcedure(SP_ID_GET_LO_OUTBOUND_STATE, params);

        String oMsg = Util.getOutMessage(resultMap);
        if (Consts.OK.equals(oMsg)) {
            String oOutboundState = (String)resultMap.get("O_OUTBOUND_STATE");
            if (!checkState.equals(oOutboundState)) {
                result = NexosMessage.getDisplayMsg("JAVA.STATE.001", "[진행상태 : " + oOutboundState + "] 처리할 수 있는 상태가 아닙니다.",
                    new String[] {oOutboundState});
            }
        } else {
            result = oMsg;
        }
        return result;
    }

    /**
     * 출고예정 생성 가능 여부
     *
     * @param params
     * @param checkState
     * @return
     */
    public String canCreateOrder(Map<String, Object> params) {

        String result = Consts.OK;

        try {
            Map<String, Object> resultMap = callProcedure(SP_ID_CHK_LOORDER_DEADLINE, params);

            String oMsg = Util.getOutMessage(resultMap);
            if (Consts.OK.equals(oMsg)) {
                String orderYn = (String)resultMap.get("O_ORDER_YN");
                String deadlineTime = (String)resultMap.get("O_DEADLINE_TIME");
                if (!Consts.YES.equals(orderYn)) {
                    result = NexosMessage.getDisplayMsg("JAVA.LOB01010E0SERVICE.001", "[발주마감시간 : " + deadlineTime + "] 출고예정 등록 가능한 시간이 아닙니다.",
                        new String[] {deadlineTime});
                }
            }
        } catch (Exception e) {
            result = NexosMessage.getDisplayMsg("JAVA.LOB01010E0SERVICE.002", "발주마감시간을 확인할 수 없습니다.\n\n") + e.getMessage();
        }

        return result;
    }

    /**
     * 출고예정 종결 처리
     *
     * @param params
     */
    public Map<String, Object> callLOOrderClosing(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_ORDER_CLOSING, params);

            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }

    /**
     * 출고예정 삭제 처리
     *
     * @param params
     */
    public Map<String, Object> callLOOrderDelete(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        String attachFileNm = (String)params.get("P_ATTACH_FILE_NM");
        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_ORDER_DELETE, params);

            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 첨부파일이 존재할 경우 삭제
        if (Util.isNotNull(attachFileNm)) {
            String attachFilePath = Util.getFileRootPath( //
                NexosSupport.getGlobalProperty(NexosConsts.WEBAPP_ROOT), //
                NexosSupport.getGlobalProperty("FILE.ATTACHMENT.ORDER.LO") //
            );
            File oldAttachFile = new File(attachFilePath, attachFileNm);
            if (oldAttachFile.exists()) {
                if (!oldAttachFile.delete()) {
                    // 오류 무시
                    // throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.LOB01010E0.XXX", "기존 첨부 파일을 삭제할 수 없습니다."));
                }
            }
        }

        return resultMap;
    }

    /**
     * 출고예정 보류 처리
     *
     * @param params
     */
    public Map<String, Object> callLOOrderHold(Map<String, Object> params) throws Exception {

        Map<String, Object> resultMap;

        TransactionStatus ts = beginTrans();
        try {
            resultMap = callProcedure(SP_ID_LO_ORDER_HOLD, params);

            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            throw new RuntimeException(Util.getErrorMessage(e));
        }
        return resultMap;
    }
}
