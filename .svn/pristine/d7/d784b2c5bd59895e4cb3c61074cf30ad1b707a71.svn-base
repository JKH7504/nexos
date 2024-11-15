package nexos.service.ed.common;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sap.conn.jco.ext.DataProviderException;
import com.sap.conn.jco.ext.DataProviderException.Reason;
import com.sap.conn.jco.ext.DestinationDataEventListener;
import com.sap.conn.jco.ext.DestinationDataProvider;
import com.sap.conn.jco.ext.Environment;
import com.sap.conn.jco.ext.ServerDataEventListener;
import com.sap.conn.jco.ext.ServerDataProvider;

import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.support.NexosSupport;

/**
 * Class: EDSAPDataProvider<br>
 * Description: SAP 접속 정보 처리를 담당하는 공통 Class<br>
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
public class EDSAPDataProvider implements ServerDataProvider, DestinationDataProvider {

    private final Logger            logger               = LoggerFactory.getLogger(EDSAPDataProvider.class);

    private final String            PROVIDER_SERVER      = "SERVER";
    private final String            PROVIDER_DESTINATION = "DESTINATION";
    private final String            PROVIDER_DEFAULT     = "DEFAULT";
    private Map<String, Properties> provider             = null;

    public EDSAPDataProvider() {

        provider = new HashMap<String, Properties>();
        // Server
        String[] serverProviders = NexosSupport.getGlobalProperty("EDI.SAP.JCO_SERVER.PROVIDERS", "").split(Consts.SEP_DATA);
        for (String serverProvider : serverProviders) {
            if (Util.isNull(serverProvider)) {
                continue;
            }
            Properties serverProps = new Properties();
            serverProps.setProperty(ServerDataProvider.JCO_GWHOST, getServerProperty(serverProvider, "GWHOST"));
            serverProps.setProperty(ServerDataProvider.JCO_GWSERV, getServerProperty(serverProvider, "GWSERV"));
            serverProps.setProperty(ServerDataProvider.JCO_PROGID, getServerProperty(serverProvider, "PROGID"));
            serverProps.setProperty(ServerDataProvider.JCO_REP_DEST, getServerProperty(serverProvider, "REP_DEST"));
            serverProps.setProperty(ServerDataProvider.JCO_CONNECTION_COUNT, getServerProperty(serverProvider, "CONNECTION_COUNT"));
            provider.put(String.format("%s.%s", PROVIDER_SERVER, serverProvider), serverProps);
        }

        // Destination
        String[] destProviders = NexosSupport.getGlobalProperty("EDI.SAP.JCO_DESTINATION.PROVIDERS", "").split(Consts.SEP_DATA);
        for (String destProvider : destProviders) {
            if (Util.isNull(destProvider)) {
                continue;
            }
            Properties destinationProps = new Properties();
            destinationProps.setProperty(DestinationDataProvider.JCO_ASHOST, getDestinationProperty(destProvider, "ASHOST"));
            destinationProps.setProperty(DestinationDataProvider.JCO_SYSNR, getDestinationProperty(destProvider, "SYSNR"));
            destinationProps.setProperty(DestinationDataProvider.JCO_CLIENT, getDestinationProperty(destProvider, "CLIENT"));
            destinationProps.setProperty(DestinationDataProvider.JCO_USER, getDestinationProperty(destProvider, "USER"));
            destinationProps.setProperty(DestinationDataProvider.JCO_PASSWD, getDestinationProperty(destProvider, "PASSWD"));
            destinationProps.setProperty(DestinationDataProvider.JCO_LANG, getDestinationProperty(destProvider, "LANG"));
            destinationProps.setProperty(DestinationDataProvider.JCO_PEAK_LIMIT, getDestinationProperty(destProvider, "PEAK_LIMIT"));
            destinationProps.setProperty(DestinationDataProvider.JCO_POOL_CAPACITY, getDestinationProperty(destProvider, "POOL_CAPACITY"));
            provider.put(String.format("%s.%s", PROVIDER_DESTINATION, destProvider), destinationProps);
        }
    }

    /**
     * Server 프로퍼티 값 리턴
     *
     * @param providerName
     * @param propertyName
     * @return
     */
    private String getServerProperty(String providerName, String propertyName) {

        return NexosSupport.getGlobalProperty("EDI.SAP.JCO_SERVER." + providerName + "." + propertyName);
    }

    /**
     * Destination 프로퍼티 값 리턴
     *
     * @param providerName
     * @param propertyName
     * @return
     */
    private String getDestinationProperty(String providerName, String propertyName) {

        return NexosSupport.getGlobalProperty("EDI.SAP.JCO_DESTINATION." + providerName + "." + propertyName);
    }

    /**
     * Site 기본 Server 외에 다른 Server를 사용할 경우 Server 정보를 추가<br>
     * 동일 Server 정보가 있을 경우 변경 됨. Site Server 정보는 변경불가
     *
     * @param serverProgramID
     * @param serverProperties
     */
    public void addServer(String serverProgramID, Properties serverProperties) {

        if (serverProgramID.equals(serverProgramID)) {
            return;
        }
        provider.put(String.format("%s.%s", PROVIDER_SERVER, serverProgramID), serverProperties);
    }

    /**
     * 기본 Server 외에 다른 Server를 사용할 경우 Server 정보를 제거<br>
     * 기본 Server 정보는 제거불가
     *
     * @param serverName
     */
    public void removeServer(String serverName) {

        if (PROVIDER_DEFAULT.equals(serverName)) {
            return;
        }
        provider.remove(String.format("%s.%s", PROVIDER_SERVER, serverName));
    }

    /**
     * 기본 Destination 외에 다른 Destination 정보를 사용할 경우 Destination 정보를 추가<br>
     * 동일 DestinationName이 있을 경우 변경 됨. 기본 Destination은 변경불가
     *
     * @param destinationName
     * @param destinationProperties
     */
    public void addDestination(String destinationName, Properties destinationProperties) {

        if (PROVIDER_DEFAULT.equals(destinationName)) {
            return;
        }
        provider.put(String.format("%s.%s", PROVIDER_DESTINATION, destinationName), destinationProperties);
    }

    /**
     * Site 기본 Destination 외에 다른 Destination 정보를 사용할 경우 Destination 정보를 제거<br>
     * Site Destination은 제거불가
     *
     * @param destinationName
     */
    public void removeDestination(String destinationName) {

        if (PROVIDER_DEFAULT.equals(destinationName)) {
            return;
        }
        provider.remove(String.format("%s.%s", PROVIDER_DESTINATION, destinationName));
    }

    /**
     * Default Server/Destination명 리턴
     *
     * @return
     */
    public String getDefaultProviderName() {

        return PROVIDER_DEFAULT;
    }

    /**
     * Registers a provider for destination data.
     */
    public void registerDataProvider() {

        Environment.registerDestinationDataProvider(this);
        Environment.registerServerDataProvider(this);
    }

    /**
     * Unregisters a provider for destination data.
     */
    public void unregisterDataProvider() {

        Environment.unregisterDestinationDataProvider(this);
        Environment.unregisterServerDataProvider(this);
    }

    // ===============================================================================================================================================
    // [S]ServerDataProvider[S]
    // ===============================================================================================================================================
    @Override
    public Properties getServerProperties(String serverName) throws DataProviderException {

        logger.info("Providing server properties for server '" + serverName + "' using the specified properties");
        Properties serverProps = provider.get(String.format("%s.%s", PROVIDER_SERVER, serverName));
        if (serverProps == null) {
            throw new DataProviderException(Reason.INVALID_CONFIGURATION, "no server information.", null);
        }
        // logger.debug("Server proerties : " + siteProperties.toString());

        return serverProps;
    }

    @Override
    public void setServerDataEventListener(ServerDataEventListener listener) {
        // do nothing
    }
    // ===============================================================================================================================================
    // [E]ServerDataProvider[E]
    // ===============================================================================================================================================

    // ===============================================================================================================================================
    // [S]DestinationDataProvider[S]
    // ===============================================================================================================================================
    @Override
    public Properties getDestinationProperties(String destinationName) throws DataProviderException {

        // logger.info("Providing destination properties for destination '" + destinationName + "' using the specified properties");
        Properties destinationProps = provider.get(String.format("%s.%s", PROVIDER_DESTINATION, destinationName));
        if (destinationProps == null) {
            throw new DataProviderException(Reason.INVALID_CONFIGURATION, "no destination information.", null);
        }

        return destinationProps;
    }

    @Override
    public void setDestinationDataEventListener(DestinationDataEventListener listener) {
        // do nothing
    }
    // ===============================================================================================================================================
    // [E]DestinationDataProvider[E]
    // ===============================================================================================================================================

    // ===============================================================================================================================================
    // [S]ServerDataProvider, DestinationDataProvider[S]
    // ===============================================================================================================================================
    @Override
    public boolean supportsEvents() {
        return false;
    }
    // ===============================================================================================================================================
    // [E]ServerDataProvider, DestinationDataProvider[E]
    // ===============================================================================================================================================
}
