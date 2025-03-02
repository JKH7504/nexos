package nexos.framework.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import nexos.framework.interceptor.ControllerTraceInterceptor;

// ===================================================================================================================================================
// XML 원본 설정 - context-dispatcher.xml
// ===================================================================================================================================================
// <?xml version="1.0" encoding="UTF-8"?>
// <!--
// ==================================================================================================================================================
// Dispatcher Servlet 설정
// Author : ASETEC
// Date : 2012-10-25
// Description
// MVC 설정
// ==================================================================================================================================================
// -->
// <beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
// xmlns:context="http://www.springframework.org/schema/context" xmlns:mvc="http://www.springframework.org/schema/mvc"
// xmlns:tx="http://www.springframework.org/schema/tx"
// xsi:schemaLocation="http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.3.xsd
// http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-4.3.xsd
// http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
// http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd">
//
// <!--
// ==============================================================================================================================================
// Scans the classpath for annotated components that will be auto-registered as Spring beans. - Controller
// ==============================================================================================================================================
// -->
// <context:component-scan base-package="nexos" use-default-filters="false">
// <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller" />
// <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Service" />
// <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Repository" />
// </context:component-scan>
//
// <!--
// ==============================================================================================================================================
// @RequestMapping 어노테이션 등을 사용 가능하게
// ==============================================================================================================================================
// -->
// <mvc:annotation-driven />
// <mvc:default-servlet-handler />
//
// <!--
// ==============================================================================================================================================
// Handles HTTP GET requests for /resources/** by efficiently serving up static resources in the ${webappRoot}/resources
// directory
// ==============================================================================================================================================
// -->
// <mvc:resources mapping="/nexos/**" location="/nexos/,classpath:/META-INF/resources/nexos/" />
//
// <!--
// ==============================================================================================================================================
// MVC Handler Interceptor
// ==============================================================================================================================================
// -->
// <mvc:interceptors>
// <bean class="nexos.framework.interceptor.ControllerTraceInterceptor">
// <!-- Controller 로그 기록 제외 Method 세팅 -->
// <!-- 미지정시 WCController의 getServerStatus, writeActivityLog, login, logout만 처리 -->
// <!--
// <property name="excludeMethods" value="WCController.getServerStatus,WCController.writeActivityLog,WCController.login,WCController.logout"
// />
// -->
// </bean>
// </mvc:interceptors>
//
// <!--
// ==============================================================================================================================================
// Configure the multipart resolver
// ==============================================================================================================================================
// -->
// <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
// <!-- 최대 100MB, Byte 단위 -->
// <property name="maxUploadSize" value="102400000" />
// <!-- 업로드 위치는 FILE.UPLOAD_TEMP로 자동 세팅 됨 -->
// </bean>
//
// </beans>
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "nexos", //
    useDefaultFilters = false, //
    includeFilters = { //
        @Filter(type = FilterType.ANNOTATION, classes = Controller.class) //
    })
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/**") //
            .addResourceLocations("/", "classpath:/META-INF/resources/");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        ControllerTraceInterceptor interceptor = new ControllerTraceInterceptor();
        // interceptor.setExcludeMethods("");
        // interceptor.setExcludeParams("");

        registry.addInterceptor(interceptor);
    }

    /**
     * Multipart Resolver Bean - 최대 업로드 사이즈 제한
     * 
     * @return
     */
    @Bean
    public CommonsMultipartResolver multipartResolver() {

        CommonsMultipartResolver result = new CommonsMultipartResolver();
        result.setMaxUploadSize(102400000);

        return result;
    }

}
