package nexos.dao.cs;

import java.io.File;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.DaoSupport;
import nexos.framework.support.NexosSupport;

/**
 * Class: CSC01000E0DAOImpl<br>
 * Description: CSC01000E0 DAO (Data Access Object)<br>
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
@Repository("CSC01000E0DAO")
public class CSC01000E0DAOImpl extends DaoSupport implements CSC01000E0DAO {

    // private final Logger logger = LoggerFactory.getLogger(CSC01000E0DAOImpl.class);

    final String   PROGRAM_ID                 = "CSC01000E0";

    final String   SELECT_ID_CSNOTICEREPLY    = PROGRAM_ID + ".RS_SUB1";

    final String   TABLE_NM_CSNOTICE          = "CSNOTICE";
    final String   INSERT_ID_CSNOTICE         = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSNOTICE;
    final String   UPDATE_ID_CSNOTICE         = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSNOTICE;
    final String   DELETE_ID_CSNOTICE         = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSNOTICE;

    final String   TABLE_NM_CSNOTICEREPLY     = "CSNOTICEREPLY";
    final String   INSERT_ID_CSNOTICEREPLY    = PROGRAM_ID + ".INSERT_" + TABLE_NM_CSNOTICEREPLY;
    final String   UPDATE_ID_CSNOTICEREPLY    = PROGRAM_ID + ".UPDATE_" + TABLE_NM_CSNOTICEREPLY;
    final String   DELETE_ID_CSNOTICEREPLY    = PROGRAM_ID + ".DELETE_" + TABLE_NM_CSNOTICEREPLY;

    final String   SP_ID_CS_NOTICE_GETNO      = "WT.CS_NOTICE_GETNO";
    final String   SP_ID_CS_NOTICEREPLY_GETNO = "WT.CS_NOTICEREPLY_GETNO";

    final String[] BYTE_UNITS                 = new String[] {"B", "KB", "MB", "GB", "TB"};

    @Override
    public void saveMaster(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> dsMaster = Util.getDataSet(params, Consts.PK_DS_MASTER);
        String userId = (String)params.get(Consts.PK_USER_ID);

        String attachmentFullPath = NexosSupport.getWebFileRootPath("FILE.ATTACHMENT.NOTICE");
        MultipartFile attachmentMultipartFile = null;

        for (int rIndex = 0, rCount = dsMaster.size(); rIndex < rCount; rIndex++) {
            Map<String, Object> rowData = dsMaster.get(rIndex);
            rowData.put(Consts.PK_USER_ID, userId);

            String rowCrud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(rowCrud)) {
                Map<String, Object> resultMap = callProcedure(SP_ID_CS_NOTICE_GETNO, Util.newMap());
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                rowData.put("P_WRITE_NO", resultMap.get("O_WRITE_NO"));
                attachmentMultipartFile = (MultipartFile)params.get("P_UPLOAD_FILE");

                if (attachmentMultipartFile != null) {
                    // 서버에 첨부파일 저장
                    int writeNo = ((Number)rowData.get("P_WRITE_NO")).intValue();
                    String attachmentTempFileName = attachmentMultipartFile.getOriginalFilename().replace(" ", "_");
                    String attachmentFileName = writeNo + "_" + attachmentTempFileName;
                    String attachmentFileFullName = attachmentFullPath + attachmentFileName;

                    deleteAttachmentFile(attachmentFileFullName);
                    File attachmentUploadFile = new File(attachmentFileFullName);
                    try {
                        attachmentMultipartFile.transferTo(attachmentUploadFile);
                        params.remove("P_UPLOAD_FILE");
                    } catch (Exception e) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.021", "첨부 파일을 전송하지 못했습니다."));
                    }
                    rowData.put("P_ATTACH_FILE_NM", attachmentFileName);
                    rowData.put("P_ATTACH_FILE_SIZE", getAttachmentFileSize(attachmentUploadFile.length()));
                }

                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSNOTICE, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {

                attachmentMultipartFile = (MultipartFile)params.get("P_UPLOAD_FILE");
                // 파일이 지정되었고
                if (attachmentMultipartFile != null) {
                    // 서버에 첨부파일 저장
                    int write_No = ((Number)rowData.get("P_WRITE_NO")).intValue();
                    String noticeAttachmentTempFileName = attachmentMultipartFile.getOriginalFilename().replace(" ", "_");
                    String noticeAttachmentFileName = write_No + "_" + noticeAttachmentTempFileName;
                    String noticeAttachmentFileFullName = attachmentFullPath + noticeAttachmentFileName;

                    deleteAttachmentFile(noticeAttachmentFileFullName);
                    File noticeAttachmentUploadFile = new File(noticeAttachmentFileFullName);
                    try {
                        attachmentMultipartFile.transferTo(noticeAttachmentUploadFile);
                        params.remove("P_UPLOAD_FILE");
                    } catch (Exception e) {
                        throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.021", "첨부 파일을 전송하지 못했습니다."));
                    }
                    rowData.put("P_ATTACH_FILE_NM", noticeAttachmentFileName);
                    rowData.put("P_ATTACH_FILE_SIZE", getAttachmentFileSize(noticeAttachmentUploadFile.length()));

                    // 이전 첨부 파일 삭제
                    String orgFileNm = (String)rowData.get("P_ORG_ATTACH_FILE_NM");
                    if (orgFileNm != null) {
                        deleteAttachmentFile(attachmentFullPath + orgFileNm);
                    }
                } else if (Util.isNotNull(rowData.get("P_ORG_ATTACH_FILE_NM")) && Util.isNull(rowData.get("P_ATTACH_FILE_NM"))) {
                    rowData.put("P_ATTACH_FILE_SIZE", "");
                    // 이전 첨부 파일 삭제
                    deleteAttachmentFile(attachmentFullPath + (String)rowData.get("P_ORG_ATTACH_FILE_NM"));
                }

                updateSql(UPDATE_ID_CSNOTICE, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                // 삭제일 경우 덧글 먼저 삭제
                deleteSql(DELETE_ID_CSNOTICEREPLY, rowData);
                deleteSql(DELETE_ID_CSNOTICE, rowData);
                // 이전 첨부 파일 삭제
                if (Util.isNotNull(rowData.get("P_ORG_ATTACH_FILE_NM"))) {
                    deleteAttachmentFile(attachmentFullPath + (String)rowData.get("P_ORG_ATTACH_FILE_NM"));
                }
            }
        }
    }

    /**
     * 첨부 파일 사이즈 리턴
     *
     * @param size
     * @return
     */
    public String getAttachmentFileSize(long size) {

        if (size <= 0) {
            return "0 B";
        }
        int digitGroups = (int)(Math.log10(size) / Math.log10(1024));
        return new DecimalFormat("#,##0.#").format(size / Math.pow(1024, digitGroups)) + " " + BYTE_UNITS[digitGroups];
    }

    /**
     * 이전 첨부 파일 삭제
     *
     * @param fileName
     */
    public void deleteAttachmentFile(String fileName) {

        File attachmentFile = new File(fileName);
        if (attachmentFile.exists() && attachmentFile.isFile()) {
            attachmentFile.delete();
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
                Map<String, Object> callParams = new HashMap<String, Object>();
                callParams.put("P_WRITE_NO", rowData.get("P_WRITE_NO"));
                callParams.put("P_REPLY_DIV", rowData.get("P_REPLY_DIV"));
                Map<String, Object> resultMap = callProcedure(SP_ID_CS_NOTICEREPLY_GETNO, callParams);
                String oMsg = Util.getOutMessage(resultMap);
                if (!Consts.OK.equals(oMsg)) {
                    throw new RuntimeException(oMsg);
                }
                rowData.put("P_REPLY_NO", resultMap.get("O_REPLY_NO"));

                rowData.put(Consts.PK_REG_USER_ID, userId);
                rowData.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
                insertSql(INSERT_ID_CSNOTICEREPLY, rowData);
            } else if (Consts.DV_CRUD_U.equals(rowCrud)) {
                updateSql(UPDATE_ID_CSNOTICEREPLY, rowData);
            } else if (Consts.DV_CRUD_D.equals(rowCrud)) {
                deleteSql(DELETE_ID_CSNOTICEREPLY, rowData);
            }
        }
    }

    @Override
    public void readNotice(Map<String, Object> params) throws Exception {

        int replyNo = 0;
        List<Map<String, Object>> dsCSNoticeReply = getDataList(SELECT_ID_CSNOTICEREPLY, params);
        if (Util.getCount(dsCSNoticeReply) > 0) {
            replyNo = Util.toInt(dsCSNoticeReply.get(0).get("REPLY_NO"));
        }
        String userId = (String)params.get(Consts.PK_USER_ID);

        if (replyNo == 0) {
            Map<String, Object> callParams = new HashMap<String, Object>();
            callParams.put("P_WRITE_NO", params.get("P_WRITE_NO"));
            callParams.put("P_REPLY_DIV", params.get("P_REPLY_DIV"));
            Map<String, Object> resultMap = callProcedure(SP_ID_CS_NOTICEREPLY_GETNO, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            params.put("P_REPLY_NO", resultMap.get("O_REPLY_NO"));

            params.put(Consts.PK_REG_USER_ID, userId);
            params.put(Consts.PK_REG_DATETIME, Consts.DV_SYSDATE);
            insertSql(INSERT_ID_CSNOTICEREPLY, params);
        } else {
            params.put("P_REPLY_NO", replyNo);
            updateSql(UPDATE_ID_CSNOTICEREPLY, params);
        }
    }
}
