package nexos.framework.config;

import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.channel.ChannelProcessingFilter;
import org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.ConcurrentSessionControlAuthenticationStrategy;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionFixationProtectionStrategy;
import org.springframework.security.web.authentication.switchuser.SwitchUserFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.session.ConcurrentSessionFilter;

import nexos.framework.Util;
import nexos.framework.filter.SecurityUserAuthenticationFilter;
import nexos.framework.filter.ServletRequestFilter;
import nexos.framework.filter.ServletResponseFilter;
import nexos.framework.security.DataEncryptor;
import nexos.framework.security.SecurityUserDetailsService;
import nexos.framework.security.SecurityUserPasswordEncoder;

// ===================================================================================================================================================
// XML 원본 설정 - context-security.xml
// ===================================================================================================================================================
// <?xml version="1.0" encoding="UTF-8"?>
// <!--
// ==================================================================================================================================================
// Spring Root Context 설정 [보안 설정]
// Author : ASETEC
// Date : 2012-10-25
// Description
// Root Context 중에서 보안 설정 부분
// ==================================================================================================================================================
// -->
// <beans xmlns="http://www.springframework.org/schema/beans" xmlns:security="http://www.springframework.org/schema/security"
// xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
// xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
// http://www.springframework.org/schema/security http://www.springframework.org/schema/security/spring-security-5.7.xsd">
// <!--
// ==============================================================================================================================================
// Security 보안 설정
// ==============================================================================================================================================
// -->
// <security:http auto-config="true" use-expressions="true">
// <security:intercept-url pattern="/**" requires-channel="#{commonProps['HTTP.REQUIRES.CHANNEL']}" />
// <security:custom-filter position="CONCURRENT_SESSION_FILTER" ref="sessionAuthenticationFilter" />
// <security:session-management session-authentication-strategy-ref="sessionAuthenticationStrategy" />
// <security:form-login login-page="/" />
//
// <!-- Cross Site Request Forgery (CSRF) - 사용안함(미적용) -->
// <security:csrf disabled="true" />
// <!-- iFrame 사용을 위해 X-Frame-Options을 SAMEORIGIN으로 적용 -->
// <!-- 캐시 사용안함으로 설정 되지 않도록 지정(캐시 설정은 ResponseFilter에서 처리) -->
// <security:headers>
// <security:frame-options policy="SAMEORIGIN" />
// <security:cache-control disabled="true" />
// </security:headers>
// </security:http>
//
// <bean id="sessionRegistry" class="org.springframework.security.core.session.SessionRegistryImpl" />
// <bean id="securityContextRepository" class="org.springframework.security.web.context.HttpSessionSecurityContextRepository" />
//
// <!--
// ==============================================================================================================================================
// Session 체크 관련, 세션에 대한 별도 오류 처리 필터
// ==============================================================================================================================================
// -->
// <bean id="sessionAuthenticationFilter" class="nexos.framework.filter.SecurityUserAuthenticationFilter">
// <constructor-arg name="sessionRegistry" ref="sessionRegistry" />
// </bean>
//
// <!--
// ==============================================================================================================================================
// Security User 정보
// ==============================================================================================================================================
// -->
// <!-- depends-on="defaultDao" -->
// <bean id="securityUserDetailsService" class="nexos.framework.security.SecurityUserDetailsService">
// <!-- 직접 CSUSER 테이블에서 사용자 검색시 생성자에 dataSource 지정 -->
// <constructor-arg ref="dataSource" />
// <!-- 정의 된 SQL Mapper로 사용자 검색시 생성자에 dataSource를 지정하지 않고, Mapper 호출 속성을 세팅 -->
// <!-- 미지정시 아래 정보를 사용 -->
// <!--
// <property name="queryId" value="WC.GET_LOGIN" />
// <property name="paramUserId" value="P_USER_ID" />
// <property name="columnUserId" value="USER_ID" />
// <property name="columnUserPwd" value="USER_PWD" />
// -->
// </bean>
//
// <!--
// ==============================================================================================================================================
// Security User Password 암호화 처리
// ==============================================================================================================================================
// -->
// <!-- depends-on="dataEncryptor" -->
// <bean id="securityUserPasswordEncoder" class="nexos.framework.security.SecurityUserPasswordEncoder">
// <property name="dataEncryptor" ref="dataEncryptor" />
// </bean>
//
// <!--
// ==============================================================================================================================================
// User 단일 접속 처리 관련
// ==============================================================================================================================================
// -->
// <bean id="sessionAuthenticationStrategy"
// class="org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy">
// <constructor-arg>
// <list>
// <bean class="org.springframework.security.web.authentication.session.ConcurrentSessionControlAuthenticationStrategy">
// <constructor-arg ref="sessionRegistry" />
// <property name="maximumSessions" value="#{commonProps['MAXIMUM.SESSIONS']}" />
// <property name="exceptionIfMaximumExceeded" value="false" />
// </bean>
// <bean class="org.springframework.security.web.authentication.session.SessionFixationProtectionStrategy" />
// <bean class="org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy">
// <constructor-arg ref="sessionRegistry" />
// </bean>
// </list>
// </constructor-arg>
// </bean>
//
// <!--
// ==============================================================================================================================================
// Security 관련
// ==============================================================================================================================================
// -->
// <security:authentication-manager alias="authenticationManager">
// <security:authentication-provider ref="authenticationProvider" />
// </security:authentication-manager>
//
// <bean id="authenticationProvider" class="org.springframework.security.authentication.dao.DaoAuthenticationProvider">
// <property name="userDetailsService" ref="securityUserDetailsService" />
// <property name="passwordEncoder" ref="securityUserPasswordEncoder" />
// <!-- <property name="hideUserNotFoundExceptions" value="false" /> -->
// </bean>
//
// <!--
// ==============================================================================================================================================
// Service 대해 ROLE_USER를 세팅
// ==============================================================================================================================================
// -->
// <!-- DAO, SERVICE Security 체크 사용안함
// <security:global-method-security secured-annotations="enabled">
// <security:protect-pointcut access="ROLE_USER" expression="execution(* nexos.service..*.*(..))" />
// <security:protect-pointcut access="ROLE_USER" expression="execution(* nexos.dao..*.*(..))" />
// </security:global-method-security>
// -->
// </beans>
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * SecurityFilterChain 등록
     *
     * @param http
     * @param sessionAuthenticationStrategy
     * @param sessionAuthenticationFilter
     * @param servletRequestFilter
     * @param servletResponseFilter
     * @param globalProps
     * @return
     * @throws Exception
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, SessionAuthenticationStrategy sessionAuthenticationStrategy,
        SecurityUserAuthenticationFilter sessionAuthenticationFilter, ServletRequestFilter servletRequestFilter,
        ServletResponseFilter servletResponseFilter, GlobalProperties globalProps) throws Exception {

        http //
            .authorizeRequests() //
            .antMatchers("*.do").authenticated() //
            .and() //
            .formLogin().disable() //
            .logout().disable() //
            .httpBasic().disable() //
            .csrf().disable() //
            .headers() //
            .frameOptions().sameOrigin() //
            .cacheControl().disable() //
            .and() //
            .sessionManagement().sessionAuthenticationStrategy(sessionAuthenticationStrategy) //
            .and() //
            .addFilterAt(sessionAuthenticationFilter, ConcurrentSessionFilter.class) //
            .addFilterBefore(servletRequestFilter, ChannelProcessingFilter.class) //
            .addFilterAfter(servletResponseFilter, SwitchUserFilter.class) //
        ;

        if ("https".equalsIgnoreCase(globalProps.getProperty("HTTP.REQUIRES.CHANNEL"))) {
            http.requiresChannel().anyRequest().requiresSecure();
        } else {
            http.requiresChannel().anyRequest().requiresInsecure();
        }

        return http.build();
    }

    /**
     * SessionRegistry 등록 - 전체 세션 참조
     *
     * @return
     * @throws Exception
     */
    @Bean
    public SessionRegistry sessionRegistry() throws Exception {

        return new SessionRegistryImpl();
    }

    /**
     * HttpSessionSecurityContextRepository 등록 - 현 세션 정보 참조
     *
     * @return
     * @throws Exception
     */
    @Bean
    public HttpSessionSecurityContextRepository securityContextRepository() throws Exception {

        return new HttpSessionSecurityContextRepository();
    }

    /**
     * SecurityUserDetailsService 등록 - 인증 사용자 확인
     *
     * @param dataSource
     * @return
     * @throws Exception
     */
    @Bean
    public SecurityUserDetailsService securityUserDetailsService(DataSource dataSource) throws Exception {

        SecurityUserDetailsService result = new SecurityUserDetailsService(dataSource);

        return result;
    }

    /**
     * SecurityUserPasswordEncoder 등록 - 인증 사용자 비밀번호 Encoder
     *
     * @param dataEncryptor
     * @return
     * @throws Exception
     */
    @Bean
    public SecurityUserPasswordEncoder securityUserPasswordEncoder(DataEncryptor dataEncryptor) throws Exception {

        SecurityUserPasswordEncoder result = new SecurityUserPasswordEncoder();
        result.setDataEncryptor(dataEncryptor);

        return result;
    }

    /**
     * CompositeSessionAuthenticationStrategy 등록 - 세션 체크(다중 접속)
     *
     * @param sessionRegistry
     * @param globalProps
     * @return
     * @throws Exception
     */
    @Bean
    public CompositeSessionAuthenticationStrategy sessionAuthenticationStrategy(SessionRegistry sessionRegistry, GlobalProperties globalProps)
        throws Exception {

        List<SessionAuthenticationStrategy> delegateStrategies = new ArrayList<SessionAuthenticationStrategy>();

        ConcurrentSessionControlAuthenticationStrategy concurrentSessionControl = new ConcurrentSessionControlAuthenticationStrategy(sessionRegistry);
        concurrentSessionControl.setMaximumSessions(Util.toInt(globalProps.getProperty("MAXIMUM.SESSIONS")));
        concurrentSessionControl.setExceptionIfMaximumExceeded(false);

        delegateStrategies.add(concurrentSessionControl);
        delegateStrategies.add(new SessionFixationProtectionStrategy());
        delegateStrategies.add(new RegisterSessionAuthenticationStrategy(sessionRegistry));

        return new CompositeSessionAuthenticationStrategy(delegateStrategies);
    }

    /**
     * AuthenticationManager 등록
     *
     * @param http
     * @param authenticationProvider
     * @return
     * @throws Exception
     */
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, AuthenticationProvider authenticationProvider) throws Exception {

        AuthenticationManagerBuilder result = http.getSharedObject(AuthenticationManagerBuilder.class);
        result.authenticationProvider(authenticationProvider);

        return result.build();
    }

    /**
     * authenticationProvider 등록
     *
     * @param securityUserDetailsService
     * @param securityUserPasswordEncoder
     * @return
     * @throws Exception
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider(SecurityUserDetailsService securityUserDetailsService,
        SecurityUserPasswordEncoder securityUserPasswordEncoder) throws Exception {

        DaoAuthenticationProvider result = new DaoAuthenticationProvider();
        result.setUserDetailsService(securityUserDetailsService);
        result.setPasswordEncoder(securityUserPasswordEncoder);

        return result;
    }

    /**
     * SecurityUserAuthenticationFilter 등록 - 인증 체크 Filter
     *
     * @param sessionRegistry
     * @return
     * @throws Exception
     */
    @Bean
    public SecurityUserAuthenticationFilter sessionAuthenticationFilter(SessionRegistry sessionRegistry, GlobalProperties globalProps)
        throws Exception {

        SecurityUserAuthenticationFilter result = new SecurityUserAuthenticationFilter(sessionRegistry);
        // Bean 등록시 세팅할 경우는 기본값 세팅 값 포함해서 설정(제외: FILTER.SECURITY.EXCLUDE_URLS, 포함: FILTER.SECURITY.INCLUDE_URLS)
        result.setExcludeUrls(globalProps.getProperty("FILTER.SECURITY.EXCLUDE_URLS", "").split(","));
        // result.setIncludeUrls(globalProps.getProperty("FILTER.SECURITY.INCLUDE_URLS", "").split(","));

        return result;
    }

    /**
     * ServletRequestFilter 등록 - Request Wrapper(Request Content Caching)
     *
     * @return
     */
    @Bean
    public ServletRequestFilter servletRequestFilter(GlobalProperties globalProps) {

        ServletRequestFilter result = new ServletRequestFilter();
        // Bean 등록시 세팅할 경우는 기본값 세팅 값 포함해서 설정(제외: FILTER.REQUEST.EXCLUDE_URLS, 포함: FILTER.REQUEST.INCLUDE_URLS)
        // result.setExcludeUrls(globalProps.getProperty("FILTER.REQUEST.EXCLUDE_URLS", "").split(","));
        // result.setIncludeUrls(globalProps.getProperty("FILTER.REQUEST.INCLUDE_URLS", "").split(","));

        return result;
    }

    /**
     * ServletResponseFilter 등록 - HTML 문서 변경 관련
     *
     * @return
     */
    @Bean
    public ServletResponseFilter servletResponseFilter(GlobalProperties globalProps) {

        ServletResponseFilter result = new ServletResponseFilter();
        // Bean 등록시 세팅할 경우는 기본값 세팅 값 포함해서 설정(제외: FILTER.RESPONSE.EXCLUDE_URLS, 포함: FILTER.RESPONSE.INCLUDE_URLS)
        // result.setExcludeUrls(globalProps.getProperty("FILTER.RESPONSE.EXCLUDE_URLS", "").split(","));
        // result.setIncludeUrls(globalProps.getProperty("FILTER.RESPONSE.INCLUDE_URLS", "").split(","));
        // result.setCharacterEncoding(Consts.CHARSET);

        return result;
    }
}
