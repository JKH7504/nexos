package nexos.service.ed.common;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.PersistJobDataAfterExecution;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.AuthenticationUtil;
import nexos.framework.support.NexosSupport;

@PersistJobDataAfterExecution
@DisallowConcurrentExecution
public class EDTask implements Job {

    private final Logger logger = LoggerFactory.getLogger(EDTask.class);

    @SuppressWarnings("unchecked")
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {

        SimpleDateFormat sdf = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        JobDataMap jobDataMap = context.getJobDetail().getJobDataMap();

        String jobNm = jobDataMap.getString("P_JOB_NM");
        Map<String, Object> defineInfo = (Map<String, Object>)jobDataMap.get("P_DEFINE_INFO");
        int execCount = jobDataMap.getInt("P_EXEC_COUNT");
        execCount++;
        jobDataMap.put("P_EXEC_COUNT", execCount);

        StringBuffer sbLog = new StringBuffer();
        sbLog.append("Executing task\n");
        sbLog.append("[START TASK]\n");
        sbLog.append("  ▶ JOB      :【").append(jobNm).append("】\n");
        sbLog.append("  ▶ JOB 설명 :【").append((String)defineInfo.get("P_DEFINE_NM")).append("】\n");
        sbLog.append("  ▶ JOB 실행 :【").append(execCount).append("】\n");
        sbLog.append("    [준비    ").append(sdf.format(System.currentTimeMillis())).append("] ");
        sbLog.append(pauseJob(jobDataMap)).append("\n");
        sbLog.append("    [실행    ").append(sdf.format(System.currentTimeMillis())).append("] ");
        sbLog.append(execJob(jobDataMap)).append("\n");
        sbLog.append("    [대기    ").append(sdf.format(System.currentTimeMillis())).append("] ");
        sbLog.append(scheduleJob(jobDataMap)).append("\n");
        logger.info(sbLog.append("[STOP  TASK]\n").toString());
    }

    @SuppressWarnings("unchecked")
    private String execJob(JobDataMap jobDataMap) {

        String result = null;

        AuthenticationUtil.configureAuthentication();
        try {
            EDCommonService edCommon = NexosSupport.getBean(EDCommonService.class);
            Map<String, Object> params = (Map<String, Object>)jobDataMap.get("P_DEFINE_INFO");
            String oMsg = edCommon.execTask(params);
            if (Consts.OK.equals(oMsg)) {
                result = "Success : " + getSuccessInfo(params);
            } else {
                result = "Error   : " + oMsg;
            }
        } catch (Exception e) {
            result = "Error   : " + Util.getErrorMessage(e);
        } finally {
            AuthenticationUtil.clearAuthentication();
        }

        return result;
    }

    private String pauseJob(JobDataMap jobDataMap) {

        String result = "Success : ";

        String jobNm = jobDataMap.getString("P_JOB_NM");
        EDTaskManagerService taskManager = (EDTaskManagerService)jobDataMap.get("P_TASK_MANAGER");

        try {
            taskManager.getTaskScheduler().pauseJob(new JobKey(jobNm, Consts.TRIGER_GROUP));
            result += Consts.OK;
        } catch (Exception e) {
            result = "Error   : " + Util.getErrorMessage(e);
        }

        return result;
    }

    private String scheduleJob(JobDataMap jobDataMap) {

        String result = "Success : ";

        String triggerNm = jobDataMap.getString("P_TRIGGER_NM");
        EDTaskManagerService taskManager = (EDTaskManagerService)jobDataMap.get("P_TASK_MANAGER");
        // 다음 실행 스케줄 등록
        try {
            Date triggerStartTime = taskManager.getNextExecTime(jobDataMap);
            SimpleScheduleBuilder jobSchedule = SimpleScheduleBuilder.simpleSchedule().withIntervalInHours(24 * 365).withRepeatCount(1);

            Trigger trigger = TriggerBuilder.newTrigger().withIdentity(triggerNm, Consts.TRIGER_GROUP).startAt(triggerStartTime)
                .withSchedule(jobSchedule).build();

            taskManager.getTaskScheduler().rescheduleJob(new TriggerKey(triggerNm, Consts.TRIGER_GROUP), trigger);

            result += NexosMessage.getDisplayMsg("JAVA.ED.137", "[다음실행일시: " + jobDataMap.getString("P_NEXT_EXEC_TIME") + "]",
                new String[] {Util.toString(jobDataMap.get("P_NEXT_EXEC_TIME"))});
        } catch (Exception e) {
            result = "Error   : " + Util.getErrorMessage(e);
        }

        return result;
    }

    private String getSuccessInfo(Map<String, Object> params) {

        StringBuffer sbResult = new StringBuffer();

        Object PROCESS_CNT = params.get("O_PROCESS_CNT");
        if (PROCESS_CNT != null) {
            if ("1".equals(params.get("P_DEFINE_DIV"))) {
                sbResult.append(NexosMessage.getDisplayMsg("JAVA.ED.138", "[수신번호: ")).append(params.get("P_RECV_NO"))
                    .append(NexosMessage.getDisplayMsg("JAVA.ED.139", ", 데이터건수: ")).append(PROCESS_CNT).append("] ");
            } else {
                sbResult.append(NexosMessage.getDisplayMsg("JAVA.ED.140", "[송신번호: ")).append(params.get("P_SEND_NO"))
                    .append(NexosMessage.getDisplayMsg("JAVA.ED.139", ", 데이터건수: ")).append(PROCESS_CNT).append("] ");
            }
        }

        return sbResult.append(Consts.OK).toString();
    }
}
