package nexos.framework.config;

import java.io.IOException;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.config.PropertiesFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.security.DataEncryptor;

// ===================================================================================================================================================
// XML 원본 설정 - context-common.xml
// ===================================================================================================================================================
// <?xml version="1.0" encoding="UTF-8"?>
// <!--
// ==================================================================================================================================================
// Spring Root Context 설정 [공통]
// Author : ASETEC
// Date : 2012-10-25
// Description
// Root Context 중에서 공통적인 설정
// ==================================================================================================================================================
// -->
// <beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
// xmlns:p="http://www.springframework.org/schema/p" xmlns:context="http://www.springframework.org/schema/context"
// xmlns:util="http://www.springframework.org/schema/util"
// xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
// http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-4.3.xsd
// http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd">
// <!--
// ==============================================================================================================================================
// Annotation 사용을 위한 BeanPostProcessor 자동 등록
// - AutowiredAnnotationBeanPostProcessor CommonAnnotationBeanPostProcessor
// - PersistenceAnnotationBeanPostProcessor RequiredAnnotationBeanPostProcessor
// ==============================================================================================================================================
// -->
// <context:annotation-config />
//
// <!--
// ==============================================================================================================================================
// TaskScheduler 관련 Properties 등록
// ==============================================================================================================================================
// -->
// <util:properties id="taskProps"
// location="classpath:/nexos/config/config-task.properties,classpath:/nexos/config/config-task-ext${spring.profiles.apply}.properties" />
//
// <!--
// ==============================================================================================================================================
// 암호화/복호화 처리 관련
// depends-on="taskProps"
// ==============================================================================================================================================
// -->
// <bean id="dataEncryptor" class="nexos.framework.security.DataEncryptor" />
//
// <!--
// spring.profiles.apply는 spring.profiles.active 세팅에 따른 실제 적용 값
// -->
// <!--
// ==============================================================================================================================================
// 암호화된 공통 Properties 등록 - System Property에 등록 됨
// ==============================================================================================================================================
// -->
// <bean id="encryptProps" class="org.jasypt.spring4.properties.EncryptablePropertyPlaceholderConfigurer">
// <constructor-arg ref="dataEncryptor" />
// <property name="location" value="classpath:/nexos/config/config-encrypt${spring.profiles.apply}.properties" />
// </bean>
//
// <!--
// ==============================================================================================================================================
// 공통 Properties 등록
// ==============================================================================================================================================
// -->
// <util:properties id="commonProps"
// location="classpath:/nexos/config/config-globals.properties,classpath:/nexos/config/config-globals-ext${spring.profiles.apply}.properties">
// <prop key="WEBAPP.ROOT">${NEXOS.WEBAPP.ROOT}</prop>
// <!-- encryptProps에 등록된 Property 추가 -->
// <prop key="DB.JDBC_URL">${ENC.DB.JDBC_URL}</prop>
// <prop key="DB.USER_ID">${ENC.DB.USER_ID}</prop>
// <prop key="DB.USER_PWD">${ENC.DB.USER_PWD}</prop>
// </util:properties>
//
// <!--
// ==============================================================================================================================================
// 전체 Properties 관련
// ==============================================================================================================================================
// -->
// <!-- depends-on="commonProps,taskProps" -->
// <bean id="globalProps" class="nexos.framework.config.GlobalProperties">
// <property name="commonProps" ref="commonProps" />
// <property name="taskProps" ref="taskProps" />
// </bean>
//
// </beans>
@Configuration
public class CommonConfig {

    /**
     * Scheduler/IF 관련 Properties Bean
     *
     * @return
     * @throws IOException
     */
    @Bean
    public Properties taskProps() throws IOException {

        PropertiesFactoryBean factory = new PropertiesFactoryBean();
        factory.setFileEncoding(Consts.CHARSET);
        factory.setLocations(new Resource[] { //
            new ClassPathResource("/nexos/config/config-task.properties"), // 기본 설정
            new ClassPathResource(getApplySettingFileName("config-task-ext", ".properties", null)) // 서버별 추가 설정
        });
        factory.afterPropertiesSet();

        return factory.getObject();
    }

    /**
     * 개인정보 암호화/복호화 처리 Bean
     *
     * @return
     */
    @Bean
    public DataEncryptor dataEncryptor() {

        return new DataEncryptor();
    }

    /**
     * 암호화가 필요한 Properties Bean
     *
     * @return
     * @throws IOException
     */
    @Bean
    public Properties encryptProps() throws IOException {

        PropertiesFactoryBean factory = new PropertiesFactoryBean();
        factory.setFileEncoding(Consts.CHARSET);
        factory.setLocation(new ClassPathResource(getApplySettingFileName("config-encrypt", ".properties", null)));
        factory.afterPropertiesSet();

        return factory.getObject();
    }

    /**
     * 일반 설정 관련 Properties Bean
     *
     * @param dataEncryptor
     * @param encryptProps
     * @return
     * @throws IOException
     */
    @Bean
    public Properties commonProps(DataEncryptor dataEncryptor, @Qualifier("encryptProps") Properties encryptProps) throws IOException {

        PropertiesFactoryBean factory = new PropertiesFactoryBean();
        factory.setFileEncoding(Consts.CHARSET);
        factory.setLocations(new Resource[] { //
            new ClassPathResource("/nexos/config/config-globals.properties"), // 기본 설정
            new ClassPathResource(getApplySettingFileName("config-globals-ext", ".properties", null)) // 서버별 추가 설정
        });
        factory.afterPropertiesSet();

        Properties properties = factory.getObject();

        // APP 추가 정보 기록
        properties.put(Consts.WEBAPP_ROOT, System.getProperty("NEXOS.WEBAPP.ROOT", ""));
        properties.put("WEBAPP.SALT", System.getProperty("NEXOS.WEBAPP.SALT", //
            String.format("%013d%05d", System.currentTimeMillis(), (int)(Math.random() * 100000)).substring(0, 18)));

        // encryptProps Properties 값 복호화해서 commonProps에 추가
        // Key 값 변경: ENC.DB.JDBC_URL - > DB.JDBC_URL
        for (Object encryptKey : encryptProps.keySet()) {
            String orgKey = (String)encryptKey;
            String newKey = orgKey.replace("ENC.", "");
            properties.put(newKey, dataEncryptor.decrypt(encryptProps.getProperty(orgKey, "")));
        }

        return properties;
    }

    /**
     * Properties 관련 Wrapper Bean
     *
     * @param commonProps
     * @param taskProps
     * @return
     * @throws IOException
     */
    @Bean
    public GlobalProperties globalProps(@Qualifier("commonProps") Properties commonProps, @Qualifier("taskProps") Properties taskProps)
        throws IOException {

        GlobalProperties result = new GlobalProperties();
        result.setCommonProps(commonProps);
        result.setTaskProps(taskProps);

        return result;
    }

    /**
     * Profile에 따른 적용할 Properties 파일명 리턴
     *
     * @param baseFileName
     * @param fileExt
     * @param path
     * @return
     */
    private String getApplySettingFileName(String baseFileName, String fileExt, String path) {

        path = Util.nullToDefault(path, "/nexos/config/");
        if (!path.endsWith("/")) {
            path += "/";
        }

        String applyProfile = System.getProperty(Consts.SPRING_PROFILES_APPLY);
        if (Util.isNotNull(applyProfile)) {
            path += applyProfile + "/";
        }

        fileExt = Util.nullToDefault(fileExt, ".properties");
        if (!fileExt.startsWith(".")) {
            fileExt = "." + fileExt;
        }

        return path //
            + baseFileName //
            + fileExt;
    }
}
