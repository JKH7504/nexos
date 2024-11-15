package nexos.service.ed;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.ResultContext;
import org.quartz.JobExecutionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.db.mybatis.JsonResultHandler;
import nexos.framework.json.JsonDataSet;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServiceSupport;
import nexos.service.ed.common.EDSAPService;
import nexos.service.ed.common.EDTaskManagerService;

/**
 * Class: EDC02010E0Service<br>
 * Description: 인터페이스 송수신 스케줄링(EDC02010E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
public class EDC02010E0Service extends ServiceSupport {

    private final Logger         logger = LoggerFactory.getLogger(EDC02010E0Service.class);

    @Autowired
    private EDTaskManagerService edTaskManagerService;

    @Autowired
    private EDSAPService         edSAPService;

    /**
     * 스케줄 데이터를 포함한 자동수행 인터페이스 정보 리턴
     * 
     * @param queryId
     * @param params
     * @return
     * @throws DataAccessException
     */
    public JsonDataSet getSchedulerDataSet(String queryId, Map<String, Object> params) throws DataAccessException {

        final List<Map<String, Object>> resultList = getDataList(queryId, params);
        JsonResultHandler resultHandler = new JsonResultHandler();
        if (resultList == null || resultList.size() == 0) {
            return resultHandler.getJsonDataSet();
        }

        // Scheduler Execution Job, Trigger NextFireTime 정보 가져오기
        final Map<String, Object> taskInfo = edTaskManagerService.getTaskInfo();
        final SimpleDateFormat dateFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        for (int row = 0; row < resultList.size(); row++) {
            final Map<String, Object> rowData = resultList.get(row);
            resultHandler.handleResult(new ResultContext<Map<String, Object>>() {
                @Override
                public Map<String, Object> getResultObject() {
                    // Job, Trigger Name Prefix
                    String prefixTaskName = Consts.TRIGER_GROUP + "." //
                        + (String)rowData.get("BU_CD") + "_" //
                        + (String)rowData.get("EDI_DIV") + "_" //
                        + (String)rowData.get("DEFINE_NO");
                    // 송수신정보로 실행 중인 Job 정보 검색
                    JobExecutionContext jobExecutionContext = (JobExecutionContext)taskInfo.get("EJ_" + prefixTaskName + "_Job");
                    if (jobExecutionContext == null) {
                        rowData.put("CURR_EXEC_YN", Consts.NO);
                        rowData.put("CURR_EXEC_TIME", "0.00");

                        // 현재 Job가 실행중이 아닐 경우만 다음 수행시각을 표시, 실행중일 경우 다음 수행시각은 지난(이전) 시간 임
                        Date nextExecTime = (Date)taskInfo.get("ET_" + prefixTaskName + "_Trigger");
                        if (nextExecTime != null) {
                            rowData.put("NEXT_EXEC_TIME", dateFormat.format(nextExecTime));
                        }
                    } else {
                        rowData.put("CURR_EXEC_YN", Consts.YES);
                        rowData.put("CURR_EXEC_TIME",
                            String.format("%.2f", (System.currentTimeMillis() - jobExecutionContext.getFireTime().getTime()) / 1000f));
                        rowData.put("NEXT_EXEC_TIME", null);
                    }

                    return rowData;
                }

                @Override
                public int getResultCount() {
                    return 1;
                }

                @Override
                public boolean isStopped() {
                    return false;
                }

                @Override
                public void stop() {
                }
            });
        }

        return resultHandler.getJsonDataSet();
    }

    /**
     * 스케줄 실행여부
     */
    public String getSchedulerStartedYN() {

        return edTaskManagerService.isStarted() ? Consts.YES : Consts.NO;
    }

    /**
     * 스케줄 실행
     */
    public String startScheduler(String userId) {

        logger.info("EDC02010E0[startScheduler] USER_ID: " + userId);
        String result = Consts.OK;
        try {
            edTaskManagerService.start();
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * 스케줄 중지
     */
    public String stopScheduler(String userId) throws Exception {

        logger.info("EDC02010E0[stopScheduler] USER_ID: " + userId);
        String result = Consts.OK;
        try {
            edTaskManagerService.stop();
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * SAP JCO 사용여부
     */
    public String getSAPServerUseYN() {

        return NexosSupport.getGlobalBooleanProperty("EDI.SAP.USE_JCO_SERVER", false) ? Consts.YES : Consts.NO;
    }

    /**
     * SAP JCO Server 실행여부
     */
    public String getSAPServerStartedYN() {

        return edSAPService.isStarted() ? Consts.YES : Consts.NO;
    }

    /**
     * SAP JCO Server 실행
     */
    public String startSAPServer(String userId) {

        logger.info("EDC02010E0[startSAPServer] USER_ID: " + userId);
        String result = Consts.OK;
        try {
            edSAPService.start();
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }

    /**
     * SAP JCO Server 중지
     */
    public String stopSAPServer(String userId) throws Exception {

        logger.info("EDC02010E0[stopSAPServer] USER_ID: " + userId);
        String result = Consts.OK;
        try {
            edSAPService.stop();
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        return result;
    }
}
