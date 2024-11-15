package nexos.framework.support;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;

import nexos.framework.event.ApplicationContextActionEvent;
import nexos.framework.message.NexosMessage;

public class ApplicationContextActionSupport implements ApplicationListener<ApplicationContextActionEvent> {

    private final Logger logger = LoggerFactory.getLogger(ApplicationContextActionSupport.class);

    @Override
    public void onApplicationEvent(ApplicationContextActionEvent event) {

        logger.info("Application Context Action...[" + event.getAction() + "]");
        // Application 시작
        if (event.getAction() == ApplicationContextActionEvent.STARTUP) {
            startup();
            return;
        }

        // Application 종료
        if (event.getAction() == ApplicationContextActionEvent.SHUTDOWN) {
            shutdown();
            return;
        }
    }

    public void initalize() {

        // logger.info("ApplicationContextActionSupport.initalize");
    }

    public void destory() {

        // logger.info("ApplicationContextActionSupport.destory");
    }

    /**
     * Dispatcher context 시작시 호출<br>
     * Application 시작 후 처리할 사항
     */
    public void startup() {

        // 데이터 마스크 세팅
        NexosSupport.setDataMaskSupport(new DataMaskUtil());

    }

    /**
     * Dispatcher context 종료 전 호출<br>
     * Application 종료 전 처리할 사항
     */
    public void shutdown() {

    }

    /**
     * 메시지 검색 쿼리ID 지정
     * 
     * @param messageQueryId
     */
    public void setMessageQueryId(String messageQueryId) {

        NexosMessage.setQueryId(messageQueryId);
    }

}
