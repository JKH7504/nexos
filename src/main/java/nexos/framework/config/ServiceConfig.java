package nexos.framework.config;

import java.util.Properties;

import javax.servlet.annotation.WebListener;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import nexos.framework.listener.ApplicationEventListener;
import nexos.framework.support.ApplicationContextActionSupport;
import nexos.framework.support.DaoSupport;
import nexos.framework.support.ServiceSupport;

// ===================================================================================================================================================
// XML 원본 설정 - context-service.xml
// ===================================================================================================================================================
// <?xml version="1.0" encoding="UTF-8"?>
// <!--
// ==================================================================================================================================================
// Spring Root Context 설정 [Service]
// Author : ASETEC
// Date : 2012-10-25
// Description
// Root Context 중에서 공통적인 설정
// ==================================================================================================================================================
// -->
// <beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
// xmlns:context="http://www.springframework.org/schema/context" xmlns:aop="http://www.springframework.org/schema/aop"
// xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
// http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd
// http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-4.3.xsd">
//
// <!--
// ==============================================================================================================================================
// annotated components Scan - Service, Dao(Repository)
// ==============================================================================================================================================
// -->
// <context:component-scan base-package="nexos" use-default-filters="false">
// <context:include-filter type="annotation" expression="org.springframework.stereotype.Service" />
// <context:include-filter type="annotation" expression="org.springframework.stereotype.Repository" />
// <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller" />
// </context:component-scan>
//
// <!--
// ==============================================================================================================================================
// 인터페이스 없이 직접적으로 Proxy 적용하도록 설정
// ==============================================================================================================================================
// -->
// <aop:config proxy-target-class="true">
// <aop:advisor advice-ref="serviceTraceInterceptor" pointcut="execution(public * nexos.service..*.*(..))" />
// </aop:config>
//
// <!--
// ==============================================================================================================================================
// 기본 DAO 등록
// depends-on="sqlSessionFactory"
// ==============================================================================================================================================
// -->
// <bean id="defaultDao" class="nexos.framework.support.DaoSupport" />
//
// <!--
// ==============================================================================================================================================
// 기본 Service 등록 - (단순 조회화면에서 사용)
// depends-on="defaultDao,txManager"
// ==============================================================================================================================================
// -->
// <bean id="defaultService" class="nexos.framework.support.ServiceSupport" />
//
// <!--
// ==============================================================================================================================================
// ApplicationEventListener
// ==============================================================================================================================================
// -->
// <bean id="applicationEventListener" class="nexos.framework.listener.ApplicationEventListener" init-method="initalize"
// destroy-method="destory" />
//
// <!--
// ==============================================================================================================================================
// ApplicationContextActionSupport
// ==============================================================================================================================================
// -->
// <bean id="applicationContextActionSupport" class="nexos.framework.support.ApplicationContextActionSupport" init-method="initalize"
// destroy-method="destory">
// <!-- JAVA 메시지 정보를 읽기 위한 Mapper ID 세팅 -->
// <!-- 미지정시 아래 정보를 사용 -->
// <!--
// <property name="messageQueryId" value="WC.GET_JAVA_MSG" />
// -->
// </bean>
//
// <!--
// ==============================================================================================================================================
// Task Scheduler 등록
// ==============================================================================================================================================
// -->
// <bean id="taskScheduler" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
// <property name="quartzProperties">
// <props>
// <prop key="org.quartz.scheduler.instanceName">nexosTaskScheduler</prop>
// <prop key="org.quartz.scheduler.instanceId">AUTO</prop>
// <prop key="org.quartz.scheduler.skipUpdateCheck">true</prop>
// <prop key="org.quartz.threadPool.class">org.quartz.simpl.SimpleThreadPool</prop>
// <prop key="org.quartz.threadPool.threadCount">5</prop>
// <prop key="org.quartz.threadPool.threadPriority">2</prop>
// <prop key="org.quartz.jobStore.misfireThreshold">60000</prop>
// <prop key="org.quartz.jobStore.class">org.quartz.simpl.RAMJobStore</prop>
// </props>
// </property>
// <property name="startupDelay" value="5" />
// <property name="autoStartup" value="false" />
// <property name="waitForJobsToCompleteOnShutdown" value="true" />
// </bean>
//
// <!--
// ==============================================================================================================================================
// Servlet Respose Filter
// ==============================================================================================================================================
// -->
// <bean id="servletResponseFilter" class="nexos.framework.filter.ServletResponseFilter">
// <!-- Response 데이터 변경 처리를 위한 기본 정보 -->
// <!-- excludeUrls -> 체크 제외 Urls (기본: 없음) -->
// <!-- includeUrls -> 체크할 Urls -->
// <!-- charsetName -> 문자열 처리시 사용될 CHARSET -->
// <!-- 미지정시 아래 정보를 사용 -->
// <!--
// <property name="excludeUrls" value="" />
// <property name="includeUrls" value=".html" />
// <property name="characterEncoding" value="utf-8" />
// -->
// </bean>
//
// <!--
// ==============================================================================================================================================
// Service Call 로그 기록
// ==============================================================================================================================================
// -->
// <bean id="serviceTraceInterceptor" class="nexos.framework.interceptor.ServiceTraceInterceptor">
// <property name="useDynamicLogger" value="true" />
// </bean>
//
// </beans>
@Configuration
@ComponentScan(basePackages = "nexos", //
    useDefaultFilters = false, //
    includeFilters = { //
        @Filter(type = FilterType.ANNOTATION, classes = Service.class), //
        @Filter(type = FilterType.ANNOTATION, classes = Repository.class), //
        @Filter(type = FilterType.ANNOTATION, classes = WebListener.class) //
    })
// Service Trace 로그 사용 안함
// 사용시 Annotation, serviceTraceAdvisor, ServiceTraceInterceptor
// @EnableAspectJAutoProxy(proxyTargetClass = true)
public class ServiceConfig {

    /**
     * Service 처리 로그 기록을 위한 Interceptor Bean
     *
     * @return
     */
    // @Bean
    // public ServiceTraceInterceptor serviceTraceInterceptor() {
    //
    // ServiceTraceInterceptor result = new ServiceTraceInterceptor();
    // result.setUseDynamicLogger(true);
    //
    // return result;
    // }

    /**
     * 기본 서비스에서 사용할 DAO Bean
     *
     * @return
     */
    @Bean
    public DaoSupport defaultDao() {

        return new DaoSupport();
    }

    /**
     * 기본 서비스 Bean - 조회용 공통 서비스
     *
     * @return
     */
    @Bean
    public ServiceSupport defaultService() {

        return new ServiceSupport();
    }

    /**
     * 서버 시작/종료시 필요한 기본 처리를 위한 Listener Bean - 공통
     *
     * @return
     */
    @Bean(initMethod = "initalize", destroyMethod = "destory")
    public ApplicationEventListener applicationEventListener() {

        return new ApplicationEventListener();
    }

    /**
     * 서버 시작/종료시 필요한 기본 처리를 Customizing 하기 위한 Bean - 사이트
     *
     * @return
     */
    @Bean(initMethod = "initalize", destroyMethod = "destory")
    public ApplicationContextActionSupport applicationContextActionSupport() {

        return new ApplicationContextActionSupport();
    }

    /**
     * IF Scheduler Bean
     *
     * @return
     */
    @Bean
    public SchedulerFactoryBean taskScheduler() {

        SchedulerFactoryBean factory = new SchedulerFactoryBean();
        factory.setStartupDelay(5);
        factory.setAutoStartup(false);
        factory.setWaitForJobsToCompleteOnShutdown(true);

        Properties properties = new Properties();
        properties.put("org.quartz.scheduler.instanceName", "nexosTaskScheduler");
        properties.put("org.quartz.scheduler.instanceId", "AUTO");
        properties.put("org.quartz.scheduler.skipUpdateCheck", "true");
        properties.put("org.quartz.threadPool.class", "org.quartz.simpl.SimpleThreadPool");
        properties.put("org.quartz.threadPool.threadCount", "5");
        properties.put("org.quartz.threadPool.threadPriority", "2");
        properties.put("org.quartz.jobStore.misfireThreshold", "60000");
        properties.put("org.quartz.jobStore.class", "org.quartz.simpl.RAMJobStore");
        factory.setQuartzProperties(properties);

        return factory;
    }

    /**
     * 서비스 Trace Log 기록을 위한 Bean
     *
     * @param serviceTraceInterceptor
     * @return
     */
    // @Bean
    // public Advisor serviceTraceAdvisor(ServiceTraceInterceptor serviceTraceInterceptor) {
    //
    // AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
    // pointcut.setExpression("execution(public * nexos.service..*.*(..))");
    //
    // return new DefaultPointcutAdvisor(pointcut, serviceTraceInterceptor);
    // }
}
