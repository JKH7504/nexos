package nexos.service.ed.common;

import java.net.InetAddress;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.quartz.impl.matchers.GroupMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServerHandlerSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: EDTaskManagerService<br>
 * Description: 인터페이스 송수신 스케줄을 관리하는 Class(트랜잭션처리 담당)<br>
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
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDTaskManagerService extends ServiceSupport implements ServerHandlerSupport {

    private final Logger logger                         = LoggerFactory.getLogger(EDTaskManagerService.class);

    final String         SELECT_ID_SCHEDULE_DEFINE_INFO = "EDCOMMON.RS_SCHEDULE_DEFINE_INFO";
    final String         SP_ID_EM_IFTASK_DELETE         = "EM_IFTASK_DELETE";

    final int            TIME_HOUR                      = 0;
    final int            TIME_MINUTE                    = 1;
    final int            TIME_START                     = 0;
    final int            TIME_FINISH                    = 1;
    final int            TIME_REPEAT                    = 2;

    @Autowired
    @Qualifier("taskScheduler")
    private Scheduler    taskScheduler;

    @Override
    public boolean isStarted() {

        boolean result = false;
        try {
            if (taskScheduler != null) {
                // 스케줄을 시작했고, 현재 stand-by 모드가 아닐 경우 스케줄이 동작 중
                result = taskScheduler.isStarted() && !taskScheduler.isInStandbyMode();
            }
        } catch (SchedulerException e) {
            Util.writeErrorMessage("Checking Whether Scheduler Started", e);
        }

        return result;
    }

    @Override
    public void start() throws Exception {

        startScheduler(false);
    }

    @Override
    public void stop() throws Exception {

        // logger.info("EDTaskManagerService.stop");
        if (!isStarted()) {
            return;
        }
        String message = null;
        try {
            if (taskScheduler != null) {
                // Trigger 멈춤
                taskScheduler.standby();
                // 등록된 Job, Trigger 데이터 모두 제거
                taskScheduler.clear();
                // 현재 실행중인 Job 체크
                List<JobExecutionContext> executingJobs = taskScheduler.getCurrentlyExecutingJobs();
                if (executingJobs != null && executingJobs.size() > 0) {
                    message = NexosMessage.getDisplayMsg("JAVA.ED.066",
                        "스케줄러 중지를 정상 호출하였습니다.\n\n현재 수행 중인 [" + executingJobs.size() + "]개의 송수신 작업이 끝나면 중지 처리가 완료됩니다.",
                        new String[] {String.valueOf(executingJobs.size())});
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(NexosMessage.getDisplayMsg("JAVA.ED.067", "스케줄러 중지 중 오류가 발생했습니다.\n\n"), e));
        }
        if (Util.isNotNull(message)) {
            throw new RuntimeException(message);
        }
    }

    public Map<String, Object> getTaskInfo() {

        Map<String, Object> resultMap = new HashMap<String, Object>();
        if (taskScheduler != null) {
            try {
                List<JobExecutionContext> executingJobs = taskScheduler.getCurrentlyExecutingJobs();
                if (executingJobs != null) {
                    for (JobExecutionContext executingJob : executingJobs) {
                        JobDetail jobDetail = executingJob.getJobDetail();
                        if (jobDetail == null) {
                            continue;
                        }
                        resultMap.put("EJ_" + jobDetail.getKey().toString()/* Group.Name */, executingJob);
                    }
                }

                Set<TriggerKey> triggerKeys = taskScheduler.getTriggerKeys(GroupMatcher.triggerGroupEquals(Consts.TRIGER_GROUP));
                if (triggerKeys != null) {
                    Iterator<TriggerKey> itrTriggerKey = triggerKeys.iterator();
                    while (itrTriggerKey.hasNext()) {
                        Trigger trigger = taskScheduler.getTrigger(itrTriggerKey.next());
                        resultMap.put("ET_" + trigger.getKey().toString()/* Group.Name */, trigger.getNextFireTime());
                    }
                }
            } catch (Exception e) {
                Util.writeErrorMessage("getTaskInfo", e);
            }
        }

        return resultMap;
    }

    @Override
    public void startup() throws Exception {

        startScheduler(true);
    }

    @Override
    public void shutdown() throws Exception {

        if (!isStarted()) {
            return;
        }

        try {
            if (taskScheduler != null) {
                taskScheduler.shutdown(true);
            }
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(NexosMessage.getDisplayMsg("JAVA.ED.067", "스케줄러 중지 중 오류가 발생했습니다.\n\n"), e));
        }
    }

    private void startScheduler(boolean autoStartup) throws Exception {

        if (isStarted()) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.068", "스케줄러가 이미 동작 중 입니다."));
        }

        // 화면에서 실행할 경우 중지 후 실행중인 Job 체크, 완료될 때 까지 재실행 못함.
        // if (!autoStartup) {
        // List<JobExecutionContext> executingJobs = taskScheduler.getCurrentlyExecutingJobs();
        // if (executingJobs != null && executingJobs.size() > 0) {
        // throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.069","현재 수행 중인 [" + executingJobs.size() + "]개의 작업이 완료되지 않았습니다.\n해당 작업들이
        // 완료되면 스케줄러를 재실행할 수 있습니다."new String[] {String.valueOf(executingJobs.size())}));
        // }
        // }
        try {
            createJobs(autoStartup);

            if (taskScheduler != null) {
                taskScheduler.start();
            }
        } catch (Exception e) {
            throw new RuntimeException(Util.getErrorMessage(e));
        }

        // 스케줄러 실행 호출 후 기존 실행 내역 삭제
        callEMIFTaskDelete();
    }

    /**
     * Task Job 생성
     * <br>
     * 체크 로직 수정시 EDCommonService.validateParameters method도 확인하여 수정
     * 
     * @param autoStartup
     * @throws Exception
     */
    private void createJobs(boolean autoStartup) throws Exception {

        Map<String, Object> params = new HashMap<String, Object>();

        StringBuffer jobLog = new StringBuffer();
        jobLog.append("Creating task").append(Consts.CRLF);
        // 수신정의 데이터 쿼리
        List<Map<String, Object>> lstDefineInfo = getScheduleDefineInfo(params);
        try {
            if (lstDefineInfo == null || lstDefineInfo.size() == 0) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.070", "실행할 스케줄 데이터가 존재하지 않습니다."));
            }

            if (taskScheduler == null) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.071", "스케줄러가 존재하지 않습니다."));
            }

            for (int i = 0, defineCount = lstDefineInfo.size(); i < defineCount; i++) {
                Map<String, Object> rowData = lstDefineInfo.get(i);

                String buCd = (String)rowData.get("BU_CD");
                String ediDiv = (String)rowData.get("EDI_DIV");
                String defineNo = (String)rowData.get("DEFINE_NO");
                String defineDiv = (String)rowData.get("DEFINE_DIV");
                String dataDiv = Util.nullToEmpty(rowData.get("DATA_DIV"));
                String dataCycleDiv = (String)rowData.get("DATA_CYCLE_DIV"); // 1: 특정, 2: 반복
                String repeatExecTime = (String)rowData.get("REPEAT_EXEC_TIME");
                String[] repeatExecTimes = null;
                if (repeatExecTime == null) {
                    repeatExecTime = "";
                    repeatExecTimes = new String[] {};
                } else {
                    repeatExecTimes = repeatExecTime.split(",");
                }

                String msgPrefix = NexosMessage.getDisplayMsg("JAVA.ED.154", "[사업부,송수신구분,정의번호: " + buCd + "," + ediDiv + "," + defineNo + "]",
                    new String[] {Util.toString(buCd), Util.toString(ediDiv), Util.toString(defineNo)});
                String msgSuffix = NexosMessage.getDisplayMsg("JAVA.ED.155", "설정 수정 후 수동으로 스케줄러를 재시작하십시오.");
                String errMsg = null;

                // 송수신유형 체크
                if (!Consts.DEFINE_DIV_RECV.equals(defineDiv) && !Consts.DEFINE_DIV_SEND.equals(defineDiv)) {
                    throw new RuntimeException(
                        NexosMessage.getDisplayMsg("JAVA.ED.141", msgPrefix + "처리할 수 없는 송수신유형 구분입니다.", new String[] {Util.toString(msgPrefix)}));
                }

                // 데이터처리유형 체크
                if (!Consts.DATA_DIV_DBLINK.equals(dataDiv) //
                    && !Consts.DATA_DIV_DBCONNECT.equals(dataDiv) //
                    && !Consts.DATA_DIV_XLS.equals(dataDiv) //
                    && !Consts.DATA_DIV_TXT.equals(dataDiv) //
                    && !Consts.DATA_DIV_XML.equals(dataDiv) //
                    && !Consts.DATA_DIV_JSON.equals(dataDiv)//
                    && !Consts.DATA_DIV_SAP.equals(dataDiv)) {
                    throw new RuntimeException(
                        NexosMessage.getDisplayMsg("JAVA.ED.142", msgPrefix + "처리할 수 없는 데이터처리유형 구분입니다.", new String[] {Util.toString(msgPrefix)}));
                }

                // 실행주기 체크
                if (repeatExecTimes.length == 0 || "2".equals(dataCycleDiv) && repeatExecTimes.length != 1 && repeatExecTimes.length != 3) {
                    errMsg = NexosMessage.getDisplayMsg("JAVA.ED.143", msgPrefix + "스케줄 수행주기 설정이 잘못되었습니다.", new String[] {Util.toString(msgPrefix)});
                    if (autoStartup) {
                        logger.info(errMsg + msgSuffix);
                        continue;
                    } else {
                        throw new RuntimeException(errMsg);
                    }
                }

                // DBLink가 아닐 경우 접속 정보 체크
                if (!Consts.DATA_DIV_DBLINK.equals(dataDiv)) {

                    String remoteDiv = (String)rowData.get("REMOTE_DIV");
                    String remoteIp = (String)rowData.get("REMOTE_IP");
                    String remotePort = (String)rowData.get("REMOTE_PORT");
                    // String remotePassiveYn = (String)rowData.get("REMOTE_PASSIVE_YN");
                    // String remoteCharset = (String)rowData.get("REMOTE_CHARSET");
                    // String remoteConnTimeout = (String)rowData.get("REMOTE_CONN_TIMEOUT");
                    // String remoteReadTimeout = (String)rowData.get("REMOTE_READ_TIMEOUT");
                    String remoteUserId = (String)rowData.get("REMOTE_USER_ID");
                    String remoteUserPwd = (String)rowData.get("REMOTE_USER_PWD");
                    String remoteActionType = (String)rowData.get("REMOTE_ACTION_TYPE");
                    String remoteParamMap = (String)rowData.get("REMOTE_PARAM_MAP");
                    // String remoteDir = (String)rowData.get("REMOTE_DIR");
                    // String ediDir = (String)rowData.get("EDI_DIR");
                    String linkDbNm = (String)rowData.get("LINK_DB_NM");
                    String linkTableNm = (String)rowData.get("LINK_TABLE_NM");

                    String webServiceDiv = (String)rowData.get("WEBSERVICE_DIV");
                    String webServiceUrl = (String)rowData.get("WEBSERVICE_URL");
                    // String webServiceHeaderVal = (String)rowData.get("P_WEBSERVICE_HEADER_VAL");
                    String webServiceMethod = (String)rowData.get("WEBSERVICE_METHOD");
                    String webServiceNSPrefix = (String)rowData.get("P_WEBSERVICE_NS_PREFIX");
                    String webServiceNSUri = (String)rowData.get("P_WEBSERVICE_NS_URI");
                    // String webServiceTagResult = (String)rowData.get("P_WEBSERVICE_TAG_RESULT");
                    String webServiceParamNm = (String)rowData.get("WEBSERVICE_PARAM_NM");
                    // String webServiceParamVal = (String)rowData.get("WEBSERVICE_PARAM_VAL");
                    String webServiceAuthDiv = (String)params.get("P_WEBSERVICE_AUTH_DIV");
                    String webServiceAuthUrl = (String)params.get("P_WEBSERVICE_AUTH_URL");
                    String webServiceAuthType = (String)params.get("P_WEBSERVICE_AUTH_TYPE");
                    String webServiceClientId = (String)params.get("P_WEBSERVICE_AUTH_CID");
                    String webServiceClientSecret = (String)params.get("P_WEBSERVICE_AUTH_CSECRET");

                    // FTP, SFTP 체크
                    if (Consts.REMOTE_DIV_FTP.equals(remoteDiv) || Consts.REMOTE_DIV_SFTP.equals(remoteDiv)) {
                        if (Util.isNull(remoteIp) //
                            || Util.isNull(remotePort) //
                            || Util.isNull(remoteUserId) //
                            || Util.isNull(remoteUserPwd)) {
                            errMsg = NexosMessage.getDisplayMsg("JAVA.ED.144", msgPrefix + "FTP접속 정보가 정상적으로 지정되지 않았습니다.",
                                new String[] {Util.toString(msgPrefix)});
                            if (autoStartup) {
                                logger.info(errMsg + msgSuffix);
                                continue;
                            } else {
                                throw new RuntimeException(errMsg);
                            }
                        }
                    }
                    // Local WebService, Remote WebService
                    else if (Consts.REMOTE_DIV_LOCAL_WS.equals(remoteDiv) || Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {
                        // EXCEL 파일은 웹서비스로 처리 불가
                        if (Consts.DATA_DIV_XLS.equals(dataDiv)) {
                            errMsg = NexosMessage.getDisplayMsg("JAVA.ED.145", msgPrefix + "엑셀 파일은 웹서비스로 송수신 처리할 수 없습니다.",
                                new String[] {Util.toString(msgPrefix)});
                            if (autoStartup) {
                                logger.info(errMsg + msgSuffix);
                                continue;
                            } else {
                                throw new RuntimeException(errMsg);
                            }
                        }
                        // Local WebService일 경우는 수신 오류 재처리를 위해 스케줄이 가능하게 함.
                        if (Consts.REMOTE_DIV_LOCAL_WS.equals(remoteDiv) && Consts.DEFINE_DIV_SEND.equals(defineDiv)) {
                            errMsg = NexosMessage.getDisplayMsg("JAVA.ED.146", msgPrefix + "[송신]Local WebService는 스케줄러로 처리할 수 없습니다.");
                            if (autoStartup) {
                                logger.info(errMsg + msgSuffix);
                                continue;
                            } else {
                                throw new RuntimeException(errMsg);
                            }
                        }
                        if (Consts.REMOTE_DIV_REMOTE_WS.equals(remoteDiv)) {
                            if (Util.isNull(webServiceDiv) //
                                || Util.isNull(webServiceUrl) //
                                || "1".equals(defineDiv) && webServiceDiv.startsWith("1") && Util.isNull(webServiceParamNm) //
                                || webServiceDiv.startsWith("2")
                                    && (Util.isNull(webServiceMethod) || Util.isNull(webServiceNSPrefix) || Util.isNull(webServiceNSUri))) {
                                errMsg = NexosMessage.getDisplayMsg("JAVA.ED.147", msgPrefix + "웹서비스 정보가 정상적으로 지정되지 않았습니다.",
                                    new String[] {Util.toString(msgPrefix)});
                                if (autoStartup) {
                                    logger.info(errMsg + msgSuffix);
                                    continue;
                                } else {
                                    throw new RuntimeException(errMsg);
                                }
                            }
                            if (Util.isNotNull(webServiceAuthDiv)) {
                                // Basic 인증
                                if (webServiceAuthDiv.equals("1")) {
                                    if (Util.isNull(remoteUserId) || Util.isNull(remoteUserPwd)) {
                                        errMsg = NexosMessage.getDisplayMsg("JAVA.ED.148", msgPrefix + "웹서비스 호출 인증을 위한 정보가 정상적으로 지정되지 않았습니다.",
                                            new String[] {Util.toString(msgPrefix)});
                                        if (autoStartup) {
                                            logger.info(errMsg + msgSuffix);
                                            continue;
                                        } else {
                                            throw new RuntimeException(errMsg);
                                        }
                                    }
                                }
                                // OAuth 인증
                                else if (webServiceAuthDiv.equals("2")) {
                                    if (Util.isNull(webServiceAuthUrl) || Util.isNull(webServiceClientId) || Util.isNull(webServiceClientSecret) //
                                        || Util.isNull(webServiceAuthType) //
                                        || "password".equals(webServiceAuthType) && (Util.isNull(remoteUserId) || Util.isNull(remoteUserPwd))) {
                                        errMsg = NexosMessage.getDisplayMsg("JAVA.ED.148", msgPrefix + "웹서비스 호출 인증을 위한 정보가 정상적으로 지정되지 않았습니다.",
                                            new String[] {Util.toString(msgPrefix)});
                                        if (autoStartup) {
                                            logger.info(errMsg + msgSuffix);
                                            continue;
                                        } else {
                                            throw new RuntimeException(errMsg);
                                        }
                                    }
                                }
                                // 기타 오류
                                else {
                                    throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.ED.024", "처리할 수 없는 인증구분입니다."));
                                }
                            }
                        }
                    }
                    // DBConnect 체크
                    else if (Consts.DATA_DIV_DBCONNECT.equals(dataDiv)) {
                        // 필수 체크
                        if (Util.isNull(remoteIp) //
                            || Util.isNull(remotePort) //
                            || Util.isNull(remoteUserId) //
                            || Util.isNull(remoteUserPwd) //
                            || Util.isNull(linkDbNm) //
                            || Util.isNull(remoteActionType)) {
                            errMsg = NexosMessage.getDisplayMsg("JAVA.ED.149", msgPrefix + "원격DB접속 정보가 정상적으로 지정되지 않았습니다.",
                                new String[] {Util.toString(msgPrefix)});
                            if (autoStartup) {
                                logger.info(errMsg + msgSuffix);
                                continue;
                            } else {
                                throw new RuntimeException(errMsg);
                            }
                        }

                        // 선택에 따른 체크
                        // LINK_TABLE_NM 필수, 1 - TABLE<SELECT>, 2 - TABLE<INSERT>
                        if (("1".equals(remoteActionType) || "2".equals(remoteActionType)) && Util.isNull(linkTableNm)) {
                            errMsg = NexosMessage.getDisplayMsg("JAVA.ED.150", msgPrefix + "송수신 테이블명이 지정 않았습니다.",
                                new String[] {Util.toString(msgPrefix)});
                            if (autoStartup) {
                                logger.info(errMsg + msgSuffix);
                                continue;
                            } else {
                                throw new RuntimeException(errMsg);
                            }
                        }
                        // REMOTE_PARAM_MAP 필수, 3 - PROCEDURE<CALL>, 4 - SCRIPT<CALL>
                        if (("3".equals(remoteActionType) || "4".equals(remoteActionType)) && Util.isNull(remoteParamMap)) {
                            errMsg = msgPrefix + "원격파라메터매핑 정보가 지정되지 않았습니다.";
                            if (autoStartup) {
                                logger.info(errMsg + msgSuffix);
                                continue;
                            } else {
                                throw new RuntimeException(errMsg);
                            }
                        }
                    }
                    // SAP
                    else if (Consts.DATA_DIV_SAP.equals(dataDiv)) {
                        if (Util.isNull(remoteDiv)) {
                            errMsg = NexosMessage.getDisplayMsg("JAVA.ED.151", msgPrefix + "원격송수신구분이 선택되지 않았습니다.",
                                new String[] {Util.toString(msgPrefix)});
                            if (autoStartup) {
                                logger.info(errMsg + msgSuffix);
                                continue;
                            } else {
                                throw new RuntimeException(errMsg);
                            }
                        }
                    }
                }

                String jobDefine = buCd + "_" + ediDiv + "_" + defineNo;
                String jobName = jobDefine + "_Job";
                String triggerName = jobDefine + "_Trigger";

                // Job 생성
                JobDetail jobDetail = JobBuilder.newJob(EDTask.class).withIdentity(jobName, Consts.TRIGER_GROUP).build();

                // Job 정보 세팅
                JobDataMap jobDataMap = jobDetail.getJobDataMap();
                jobDataMap.put("P_JOB_NM", jobName);
                jobDataMap.put("P_TRIGGER_NM", triggerName);
                jobDataMap.put("P_TASK_MANAGER", this);
                jobDataMap.put("P_DATA_CYCLE_DIV", dataCycleDiv);
                jobDataMap.put("P_REPEAT_EXEC_TIMES", repeatExecTimes);
                jobDataMap.put("P_EXEC_COUNT", 0);
                jobDataMap.put("P_DEFINE_INFO", Util.toParameter(rowData));

                Date triggerStartTime = getNextExecTime(jobDataMap);
                SimpleScheduleBuilder jobSchedule = SimpleScheduleBuilder.simpleSchedule().withIntervalInHours(24 * 365).withRepeatCount(1);

                // 스케줄 트리거 생성
                Trigger trigger = TriggerBuilder.newTrigger().withIdentity(triggerName, Consts.TRIGER_GROUP).startAt(triggerStartTime)
                    .withSchedule(jobSchedule).build();

                // 스케줄 등록
                taskScheduler.scheduleJob(jobDetail, trigger);

                jobLog.append("[BEGIN TASK CREATION]\n") //
                    .append("  ▶ TASK     :【").append(i + 1).append("】\n") //
                    .append("  ▶ JOB      :【").append(jobName).append("】\n") //
                    .append("  ▶ JOB 설명 :【").append((String)rowData.get("DEFINE_NM")).append("】\n") //
                    .append("    [자료구분: ").append(dataDiv) //
                    .append("], [송수신구분: ").append(defineDiv).append(", ").append(Consts.DEFINE_DIV_RECV.equals(defineDiv) ? "수신" : "송신") //
                    .append("], [송수신주기: ").append(dataCycleDiv).append(", ").append(repeatExecTime) //
                    .append("], [다음실행일시: ").append(jobDataMap.getString("P_NEXT_EXEC_TIME")).append("]\n") //
                    .append("[END   TASK CREATION]\n\n");
            }
            logger.info(jobLog.toString());
        } catch (Exception e) {
            clearJobs();
            if (autoStartup) {
                Util.writeErrorMessage(NexosMessage.getDisplayMsg("JAVA.ED.152", "스케줄 생성 중 오류가 발생했습니다."), e);
            } else {
                throw new RuntimeException(Util.getErrorMessage(NexosMessage.getDisplayMsg("JAVA.ED.072", "스케줄 생성 중 오류가 발생했습니다.\n\n"), e));
            }
        }
    }

    private void clearJobs() {
        try {
            if (isStarted()) {
                stop();
            } else {
                if (taskScheduler != null) {
                    taskScheduler.clear();
                }
            }
        } catch (Exception e) {
            Util.writeErrorMessage(NexosMessage.getDisplayMsg("JAVA.ED.153", "스케줄 초기화 중 오류가 발생했습니다."), e);
        }
    }

    /**
     * 다음 실행일시 계산
     * 
     * @param jobDataMap
     * @return
     */
    public Date getNextExecTime(JobDataMap jobDataMap) {

        Date result = null;
        String dataCycleDiv = jobDataMap.getString("P_DATA_CYCLE_DIV");
        String[] repeatExecTimes = (String[])jobDataMap.get("P_REPEAT_EXEC_TIMES");

        SimpleDateFormat sdfDatetime = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        Calendar calNextDatetime = Calendar.getInstance();

        Date currDatetime = calNextDatetime.getTime();
        String currDatetimeString = sdfDatetime.format(currDatetime);
        String currTimeString = currDatetimeString.substring(11, 16);
        String[] nextTimeParts = null;
        // 1: 특정 -> [12:00, 13:00, ...]
        // A.compareTo(B) -> A > B >> 양수, A = B >> 0, A < B << 음수
        if ("1".equals(dataCycleDiv)) {
            for (int i = 0, timeCount = repeatExecTimes.length; i < timeCount; i++) {
                if (currTimeString.compareTo(repeatExecTimes[i]) < 0) {
                    nextTimeParts = repeatExecTimes[i].split(":");
                    break;
                }
            }
            // 당일 가능 시간이 지났으면 다음 날 첫번째 시간으로 지정
            if (nextTimeParts == null) {
                nextTimeParts = repeatExecTimes[0].split(":");
                calNextDatetime.set(Calendar.DATE, calNextDatetime.get(Calendar.DATE) + 1);
                calNextDatetime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeParts[TIME_HOUR]));
                calNextDatetime.set(Calendar.MINUTE, Integer.parseInt(nextTimeParts[TIME_MINUTE]));
                calNextDatetime.set(Calendar.SECOND, 0);
                calNextDatetime.set(Calendar.MILLISECOND, 0);
            }
            // 당일 다음 실행 시간으로 지정
            else {
                calNextDatetime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeParts[TIME_HOUR]));
                calNextDatetime.set(Calendar.MINUTE, Integer.parseInt(nextTimeParts[TIME_MINUTE]));
                calNextDatetime.set(Calendar.SECOND, 0);
                calNextDatetime.set(Calendar.MILLISECOND, 0);
            }
        }
        // 2: 반복, [30] or [12:00, 23:00, 600]
        else {
            // 수행 주기만 지정 되었을 경우 현재일시 + 수행주기(초)로 다음 실행일시 지정
            if (repeatExecTimes.length == 1) {
                // 다음 실행일시 처리 기준 변경
                // 기존 현재일시 + 수행주기(초)
                // calNextDatetime.set(Calendar.SECOND, calNextDatetime.get(Calendar.SECOND) + Integer.parseInt(repeatExecTimes[TIME_START]));
                // 변경 현재일시의 초를 10초 단위 올림 + 수행주기(초)로 다음 실행일시 지정
                int currTimeSecond = calNextDatetime.get(Calendar.SECOND);
                // 51초 이상일 경우 분을 변경
                if (currTimeSecond > 50) {
                    calNextDatetime.set(Calendar.MINUTE, calNextDatetime.get(Calendar.MINUTE) + 1);
                    calNextDatetime.set(Calendar.SECOND, Integer.parseInt(repeatExecTimes[TIME_START]));
                } else {
                    currTimeSecond = (int)Math.ceil(currTimeSecond / 10.0d) * 10;
                    calNextDatetime.set(Calendar.SECOND, currTimeSecond + Integer.parseInt(repeatExecTimes[TIME_START]));
                }
                calNextDatetime.set(Calendar.MILLISECOND, 0);
            }
            // 시작,종료시간 + 수행주기가 지정시간내 있으면 다음 실행시간을 지정
            else {
                // 다음 실행일시, 단순 계산(현재일시 + 수행주기)
                int repeatSecond = Integer.parseInt(repeatExecTimes[TIME_REPEAT]);
                calNextDatetime.set(Calendar.SECOND, calNextDatetime.get(Calendar.SECOND) + repeatSecond);
                calNextDatetime.set(Calendar.MILLISECOND, 0);

                String nextDatetimeString = sdfDatetime.format(calNextDatetime.getTime());
                String nextTimeString = nextDatetimeString.substring(11, 16); // 다음 실행일시의 시분 -> 12:00
                nextTimeParts = repeatExecTimes[TIME_START].split(":");

                // 다음 실행일시의 날짜가 현재날짜와 같을 경우
                if (currDatetimeString.substring(0, 10).equals(nextDatetimeString.substring(0, 10))) {
                    // 다음 실행 시간이 시작 시간 전일 경우 현재 날짜에 시작 시간
                    if (nextTimeString.compareTo(repeatExecTimes[TIME_START]) < 0) {
                        calNextDatetime.setTime(currDatetime);
                        calNextDatetime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeParts[TIME_HOUR]));
                        calNextDatetime.set(Calendar.MINUTE, Integer.parseInt(nextTimeParts[TIME_MINUTE]));
                        calNextDatetime.set(Calendar.SECOND, 0);
                        calNextDatetime.set(Calendar.MILLISECOND, 0);
                    }
                    // 다음 실행 시간이 종료 시간 이후일 경우 다음날 시작시간
                    else if (nextTimeString.compareTo(repeatExecTimes[TIME_FINISH]) > 0) {
                        calNextDatetime.setTime(currDatetime);
                        calNextDatetime.set(Calendar.DATE, calNextDatetime.get(Calendar.DATE) + 1);
                        calNextDatetime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeParts[TIME_HOUR]));
                        calNextDatetime.set(Calendar.MINUTE, Integer.parseInt(nextTimeParts[TIME_MINUTE]));
                        calNextDatetime.set(Calendar.SECOND, 0);
                        calNextDatetime.set(Calendar.MILLISECOND, 0);
                    }
                    // 시작 시간 기준, 다음 시작 시간 재계산, 지정된 수행주기 단위로 변경
                    // 수행주기(초) 600(10분) 일 경우 10, 20, 30, 40, 50, 00 단위로 실행하도록 조정
                    // 수행주기(초) 60 ( 1분) 일 경우 01, 02, 03, ..., 58, 59 단위로 실행하도록 조정
                    else {
                        long currentTimeMillis = currDatetime.getTime();
                        Calendar calCalcDatetime = Calendar.getInstance();
                        calCalcDatetime.setTimeInMillis(currentTimeMillis);
                        calCalcDatetime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeParts[TIME_HOUR]));
                        calCalcDatetime.set(Calendar.MINUTE, Integer.parseInt(nextTimeParts[TIME_MINUTE]));
                        calCalcDatetime.set(Calendar.SECOND, 0);
                        calCalcDatetime.set(Calendar.MILLISECOND, 0);
                        // 시작시간부터 수행주기만큼 +해서 (현재일시+1분)보다 커질 때까지 Loop
                        while (calCalcDatetime.getTimeInMillis() < currentTimeMillis) {
                            calCalcDatetime.set(Calendar.SECOND, calCalcDatetime.get(Calendar.SECOND) + repeatSecond);
                        }
                        // 다음 실행시간이 종료 시간 이후일 경우
                        nextDatetimeString = sdfDatetime.format(calCalcDatetime.getTime());
                        nextTimeString = nextDatetimeString.substring(11, 16); // 다음 실행일시의 시분 -> 12:00
                        // 다음 실행 시간이 시작 시간 전일 경우 현재 날짜에 시작 시간
                        if (nextTimeString.compareTo(repeatExecTimes[TIME_START]) < 0) {
                            calNextDatetime.setTime(currDatetime);
                            calNextDatetime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeParts[TIME_HOUR]));
                            calNextDatetime.set(Calendar.MINUTE, Integer.parseInt(nextTimeParts[TIME_MINUTE]));
                            calNextDatetime.set(Calendar.SECOND, 0);
                            calNextDatetime.set(Calendar.MILLISECOND, 0);
                        }
                        // 다음 실행 시간이 종료 시간 이후일 경우 다음날 시작시간
                        else if (nextTimeString.compareTo(repeatExecTimes[TIME_FINISH]) > 0) {
                            calNextDatetime.setTime(currDatetime);
                            calNextDatetime.set(Calendar.DATE, calNextDatetime.get(Calendar.DATE) + 1);
                            calNextDatetime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeParts[TIME_HOUR]));
                            calNextDatetime.set(Calendar.MINUTE, Integer.parseInt(nextTimeParts[TIME_MINUTE]));
                            calNextDatetime.set(Calendar.SECOND, 0);
                            calNextDatetime.set(Calendar.MILLISECOND, 0);
                        }
                        // 당일 시작/종료 시간 사이
                        else {
                            calNextDatetime.setTimeInMillis(calCalcDatetime.getTimeInMillis());
                        }
                    }
                }
                // 다음 실행일시의 날짜가 현재날짜와 다를 경우 다음 날 시작 시간으로 지정
                else {
                    calNextDatetime.setTime(currDatetime);
                    calNextDatetime.set(Calendar.DATE, calNextDatetime.get(Calendar.DATE) + 1);
                    calNextDatetime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeParts[TIME_HOUR]));
                    calNextDatetime.set(Calendar.MINUTE, Integer.parseInt(nextTimeParts[TIME_MINUTE]));
                    calNextDatetime.set(Calendar.SECOND, 0);
                    calNextDatetime.set(Calendar.MILLISECOND, 0);
                }
            }
        }

        result = calNextDatetime.getTime();
        jobDataMap.put("P_NEXT_EXEC_TIME", sdfDatetime.format(result));
        return result;
    }

    public Scheduler getTaskScheduler() {

        return this.taskScheduler;
    }

    private List<Map<String, Object>> getScheduleDefineInfo(Map<String, Object> params) {

        return getDataList(SELECT_ID_SCHEDULE_DEFINE_INFO, params);
    }

    private void callEMIFTaskDelete() {

        Map<String, Object> callParams = new HashMap<String, Object>();
        try {
            callParams.put("P_SERVER_IP", InetAddress.getLocalHost().getHostAddress());
        } catch (Exception e) {
            callParams.put("P_SERVER_IP", "0.0.0.0");
        }
        callParams.put("P_SERVER_SALT", NexosSupport.getGlobalProperty("WEBAPP.SALT"));
        callParams.put(Consts.PK_USER_ID, NexosSupport.getGlobalProperty("EDI.USER_ID"));

        TransactionStatus ts = beginTrans();
        try {
            Map<String, Object> resultMap = callProcedure(SP_ID_EM_IFTASK_DELETE, callParams);
            String oMsg = Util.getOutMessage(resultMap);
            if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
            }
            commitTrans(ts);
        } catch (Exception e) {
            rollbackTrans(ts);
            Util.writeErrorMessage("EDTaskManagerService[callEMIFTaskDelete] Error", e);
        }
    }
}
