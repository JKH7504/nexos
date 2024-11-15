package nexos.framework.config;

import java.util.EnumSet;
import java.util.Set;
import java.util.TimeZone;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;
import javax.servlet.SessionTrackingMode;

import org.apache.logging.log4j.web.Log4jServletContextListener;
import org.apache.logging.log4j.web.Log4jWebSupport;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.util.WebUtils;

import nexos.framework.Consts;

// ===================================================================================================================================================
// XML 원본 설정 - web.xml
// ===================================================================================================================================================
// <?xml version="1.0" encoding="UTF-8"?>
// <web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
// xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd" version="3.0">
//
// <display-name>Nexos Application</display-name>
//
// <welcome-file-list>
// <welcome-file>index.html</welcome-file>
// <welcome-file>main.html</welcome-file>
// </welcome-file-list>
//
// <!--
// ==============================================================================================================================================
// Error Page Settings
// ==============================================================================================================================================
// -->
// <error-page>
// <error-code>400</error-code>
// <location>/nexos/desktop/wms/main/error400.html</location>
// </error-page>
//
// <error-page>
// <error-code>403</error-code>
// <location>/nexos/desktop/wms/main/error400.html</location>
// </error-page>
//
// <error-page>
// <error-code>501</error-code>
// <location>/nexos/desktop/wms/main/error400.html</location>
// </error-page>
//
// <error-page>
// <error-code>404</error-code>
// <location>/nexos/desktop/wms/main/error404.html</location>
// </error-page>
//
// <error-page>
// <error-code>405</error-code>
// <location>/nexos/desktop/wms/main/error404.html</location>
// </error-page>
//
// <!--
// ==============================================================================================================================================
// Web App Root Listener 및 Log4j2 Settings
// Context xml 파일에서 Web Root의 절대경로를 알 필요가 있어서 지정 함.
//
// webAppRootKey ____________________________________ Web root 절대경로를 System Property에 세팅
// __________________________________________________ param-name은 webAppRootKey로 고정
// __________________________________________________ param-value에 System Property의 키 값을 지정 ,미지정시 webapp.root로 지정 됨.
//
// isLog4jAutoInitializationDisabled ________________ Log4j2 자동 초기화 기능 사용중지
//
// log4jConfigLocation ______________________________ log4j2의 설정파일 위치
// __________________________________________________ log4j2는 자동 초기화시 해당 설정은 적용되자 않고 classes 하위에 log4j2.xml만
// __________________________________________________ 인식하도록 되어 있음, config-log4j2.xml이란 이름으로 사용하기 위해 지정
// ==============================================================================================================================================
// -->
// <context-param>
// <param-name>webAppRootKey</param-name>
// <param-value>NEXOS.WEBAPP.ROOT</param-value>
// </context-param>
//
// <listener>
// <listener-class>nexos.framework.listener.NexosServletContextListener</listener-class>
// </listener>
//
// <context-param>
// <param-name>isLog4jAutoInitializationDisabled</param-name>
// <param-value>true</param-value>
// </context-param>
//
// <context-param>
// <param-name>log4jConfigLocation</param-name>
// <param-value>/WEB-INF/classes/nexos/config/config-log4j2.xml</param-value>
// </context-param>
//
// <listener>
// <listener-class>org.apache.logging.log4j.web.Log4jServletContextListener</listener-class>
// </listener>
//
// <!--
// ==============================================================================================================================================
// Spring MVC Dispatcher Servlet Settings - (NexosMVCServlet)WebApplicationContext
// ==============================================================================================================================================
// -->
// <servlet>
// <servlet-name>Nexos-Dispatcher</servlet-name>
// <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
// <init-param>
// <param-name>contextConfigLocation</param-name>
// <param-value>classpath:/nexos/config/servlet-dispatcher.xml</param-value>
// </init-param>
// <load-on-startup>1</load-on-startup>
// </servlet>
//
// <servlet-mapping>
// <servlet-name>Nexos-Dispatcher</servlet-name>
// <url-pattern>/</url-pattern>
// </servlet-mapping>
//
// <!--
// ==============================================================================================================================================
// Root Context Settings - (root)WebApplicationContext
// ==============================================================================================================================================
// -->
// <context-param>
// <param-name>serverVersion</param-name>
// <param-value>7.5.0</param-value>
// </context-param>
//
// <context-param>
// <param-name>contextConfigLocation</param-name>
// <param-value>classpath:/nexos/config/context-*.xml</param-value>
// </context-param>
//
// <listener>
// <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
// </listener>
//
// <!--
// ==============================================================================================================================================
// Session Settings
// Timeout - 분 단위
// Cookie Settings
// Session 기록 명칭 변경 - 프로젝트명으로 지정
// - <Single Domain, Multiple Service>일 경우 Session Invalid 문제 해결
// - 다중화, LB사용으로 세션 복제 사용시 name 주석 처리 필요
// ==============================================================================================================================================
// -->
// <session-config>
// <session-timeout>60</session-timeout>
// <cookie-config>
// <!-- <name>000_NEXOS_HTML5_SERVER_V75</name> -->
// <http-only>true</http-only>
// <!-- <secure>true</secure>-->
// </cookie-config>
// </session-config>
//
// <!-- 세션 복제를 위해 필요(다중화, LB사용시) -->
// <distributable />
//
// <!--
// ==============================================================================================================================================
// Session Create/Destroy Listener
// ==============================================================================================================================================
// -->
// <listener>
// <listener-class>org.springframework.security.web.session.HttpSessionEventPublisher</listener-class>
// </listener>
//
// <!--
// ==============================================================================================================================================
// Spring Security Filter
// ==============================================================================================================================================
// -->
// <filter>
// <filter-name>springSecurityFilterChain</filter-name>
// <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
// </filter>
//
// <filter-mapping>
// <filter-name>springSecurityFilterChain</filter-name>
// <url-pattern>/*</url-pattern>
// </filter-mapping>
//
// <!--
// ==============================================================================================================================================
// Encoding Filter
// ==============================================================================================================================================
// -->
// <filter>
// <filter-name>encodingFilter</filter-name>
// <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
// <async-supported>true</async-supported>
// <init-param>
// <param-name>encoding</param-name>
// <param-value>utf-8</param-value>
// </init-param>
// <init-param>
// <param-name>forceEncoding</param-name>
// <param-value>true</param-value>
// </init-param>
// </filter>
//
// <filter-mapping>
// <filter-name>encodingFilter</filter-name>
// <url-pattern>/*</url-pattern>
// </filter-mapping>
//
// <!--
// ==============================================================================================================================================
// Http Servlet Request Filter
// ==============================================================================================================================================
// -->
// <filter>
// <filter-name>servletRequestFilter</filter-name>
// <filter-class>nexos.framework.filter.ServletRequestFilter</filter-class>
// </filter>
//
// <filter-mapping>
// <filter-name>servletRequestFilter</filter-name>
// <url-pattern>*.do</url-pattern>
// </filter-mapping>
// -->
//
// <!--
// ==============================================================================================================================================
// Http Servlet Response Filter
// ==============================================================================================================================================
// -->
// <filter>
// <filter-name>servletResponseFilter</filter-name>
// <filter-class>nexos.framework.filter.ServletResponseFilter</filter-class>
// </filter>
//
// <filter-mapping>
// <filter-name>servletResponseFilter</filter-name>
// <url-pattern>/*</url-pattern>
// </filter-mapping>
//
// <!--
// ==============================================================================================================================================
// Https 사용시
// ==============================================================================================================================================
// -->
// <!--
// <security-constraint>
// <web-resource-collection>
// <web-resource-name>Secure Nexos Application</web-resource-name>
// <url-pattern>/*</url-pattern>
// </web-resource-collection>
// <user-data-constraint>
// <transport-guarantee>CONFIDENTIAL</transport-guarantee>
// </user-data-constraint>
// </security-constraint>
//
// <security-constraint>
// <web-resource-collection>
// <web-resource-name>Static Nexos Application</web-resource-name>
// <url-pattern>/nexos/*</url-pattern>
// </web-resource-collection>
// <user-data-constraint>
// <transport-guarantee>NONE</transport-guarantee>
// </user-data-constraint>
// </security-constraint>
// -->
//
// </web-app>
public class WebAppInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {

        // Default TimeZone 한국 시간으로 강제 변경
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));

        setContextParams(servletContext);

        AnnotationConfigWebApplicationContext rootContext = registerListener(servletContext);
        registerDispatcherContext(servletContext);

        registerFilters(rootContext);
    }

    /**
     * Root Context 생성 및 Listener 등록
     *
     * @param servletContext
     * @return
     */
    private AnnotationConfigWebApplicationContext registerListener(ServletContext servletContext) {

        // Root Context 생성
        AnnotationConfigWebApplicationContext context = createContext( //
            servletContext, //
            CommonConfig.class, //
            DatabaseConfig.class, //
            SecurityConfig.class, //
            ServiceConfig.class //
        );

        // Listener 등록
        servletContext.addListener(new ContextLoaderListener(context));
        servletContext.addListener(new Log4jServletContextListener());
        servletContext.addListener(new HttpSessionEventPublisher());

        return context;
    }

    /**
     * Context Parameter 세팅
     *
     * @param servletContext
     */
    private void setContextParams(ServletContext servletContext) {

        servletContext.setInitParameter(WebUtils.WEB_APP_ROOT_KEY_PARAM, "NEXOS.WEBAPP.ROOT");
        servletContext.setInitParameter(Log4jWebSupport.IS_LOG4J_AUTO_INITIALIZATION_DISABLED, "true");
        servletContext.setInitParameter(Log4jWebSupport.LOG4J_CONFIG_LOCATION, "/WEB-INF/classes/nexos/config/config-log4j2.xml");
    }

    /**
     * Dispatcher Servlet 등록
     *
     * @param servletContext
     * @return
     */
    private AnnotationConfigWebApplicationContext registerDispatcherContext(ServletContext servletContext) {

        AnnotationConfigWebApplicationContext context = createContext(servletContext, WebConfig.class);

        DispatcherServlet dispatcherServlet = new DispatcherServlet(context);

        ServletRegistration.Dynamic webServlet = servletContext.addServlet("Nexos-Dispatcher", dispatcherServlet);
        webServlet.addMapping("/");
        webServlet.setLoadOnStartup(2);

        return context;
    }

    /**
     * 필터 등록
     *
     * @param rootContext
     */
    private void registerFilters(AnnotationConfigWebApplicationContext rootContext) {

        ServletContext servletContext = rootContext.getServletContext();

        // Spring Security Filter
        servletContext.setSessionTrackingModes(getSessionTrackingModes());
        DelegatingFilterProxy securityFilterChain = new DelegatingFilterProxy("springSecurityFilterChain");
        FilterRegistration.Dynamic webSecurityFilterChain = servletContext.addFilter("springSecurityFilterChain", securityFilterChain);
        webSecurityFilterChain.setAsyncSupported(true);
        EnumSet<DispatcherType> dispatcherTypes = getSecurityDispatcherTypes();
        webSecurityFilterChain.addMappingForUrlPatterns(dispatcherTypes, false, "/*");

        // Encoding Filter
        CharacterEncodingFilter encodingFilter = new CharacterEncodingFilter(Consts.CHARSET, true, true);
        FilterRegistration.Dynamic webEncodingFilter = servletContext.addFilter("encodingFilter", encodingFilter);
        webEncodingFilter.addMappingForUrlPatterns(null, false, "/*");
        webEncodingFilter.setAsyncSupported(true);
    }

    /**
     * Context 생성
     *
     * @param servletContext
     * @param annotatedClasses
     * @return
     */
    private AnnotationConfigWebApplicationContext createContext(ServletContext servletContext, final Class<?>... annotatedClasses) {

        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.register(annotatedClasses);
        context.setServletContext(servletContext);

        return context;
    }

    private Set<SessionTrackingMode> getSessionTrackingModes() {
        return EnumSet.of(SessionTrackingMode.COOKIE);
    }

    private EnumSet<DispatcherType> getSecurityDispatcherTypes() {
        return EnumSet.of(DispatcherType.REQUEST, DispatcherType.ERROR, DispatcherType.ASYNC);
    }
}
