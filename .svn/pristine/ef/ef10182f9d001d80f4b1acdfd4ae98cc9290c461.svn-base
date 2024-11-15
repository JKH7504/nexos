package nexos.framework.support;

import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;

import nexos.framework.Util;

/**
 * Class: DataMaskUtil<br>
 * Description: 데이터 마스킹 처리 Class<br>
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
public class DataMaskUtil implements DataMaskSupport {

    private final boolean enable;

    private final String  MASK_CHAR    = "*";

    private final int     MASK_NONE    = -1; // 변경금지
    private final int     MASK_ALL     = 1;
    private final int     MASK_OTHER   = 2;
    private final int     MASK_ID      = 3;
    private final int     MASK_NM      = 4;
    private final int     MASK_ADDRESS = 5;
    private final int     MASK_TEL     = 6;
    private final int     MASK_RRN     = 7;
    private final int     MASK_EMAIL   = 8;
    private final int     MASK_IP      = 9;

    private final Pattern patternAll;
    private final Pattern patternOther;
    private final Pattern patternId;
    private final Pattern patternNm;
    private final Pattern patternAddress;
    private final Pattern patternTel;
    private final Pattern patternRrn;
    private final Pattern patternEmail;
    private final Pattern patternIp;

    public DataMaskUtil() {

        this.enable = NexosSupport.getGlobalBooleanProperty("XLS.ENABLE_DATA_MASK", false);

        this.patternAll = NexosSupport.getGlobalPatternProperty("XLS.MASK_ALL", "");
        this.patternOther = NexosSupport.getGlobalPatternProperty("XLS.MASK_OTHER", "");
        this.patternId = NexosSupport.getGlobalPatternProperty("XLS.MASK_ID", "ORDERER_CD");
        this.patternNm = NexosSupport.getGlobalPatternProperty("XLS.MASK_NM", "ORDERER_NM,SHIPPER_NM");
        this.patternAddress = NexosSupport.getGlobalPatternProperty("XLS.MASK_ADDRESS", "SHIPPER_ADDR_BASIC,SHIPPER_ADDR_DETAIL,SHIPPER_ADDR");
        this.patternTel = NexosSupport.getGlobalPatternProperty("XLS.MASK_TEL", "ORDERER_TEL,ORDERER_HP,SHIPPER_TEL,SHIPPER_HP,CHARGE_TEL,CHARGE_HP");
        this.patternRrn = NexosSupport.getGlobalPatternProperty("XLS.MASK_RRN", "IDENTITY_NO");
        this.patternEmail = NexosSupport.getGlobalPatternProperty("XLS.MASK_EMAIL", "_EMAIL");
        this.patternIp = NexosSupport.getGlobalPatternProperty("XLS.MASK_IP", "_IP");
    }

    @Override
    public boolean isEnable() {

        return this.enable;
    }

    @Override
    public String getMaskChar() {

        return this.MASK_CHAR;
    }

    @Override
    public int getMaskType(String columnName) {

        int result = MASK_NONE;
        if (!enable) {
            return result;
        }

        try {
            // ID
            if (patternId != null && patternId.matcher(columnName).find()) {
                result = MASK_ID;
            }
            // 성명
            else if (patternNm != null && patternNm.matcher(columnName).find()) {
                result = MASK_NM;
            }
            // 주소
            else if (patternAddress != null && patternAddress.matcher(columnName).find()) {
                result = MASK_ADDRESS;
            }
            // 전화번호
            else if (patternTel != null && patternTel.matcher(columnName).find()) {
                result = MASK_TEL;
            }
            // 이메일
            else if (patternEmail != null && patternEmail.matcher(columnName).find()) {
                result = MASK_EMAIL;
            }
            // 주민번호
            else if (patternRrn != null && patternRrn.matcher(columnName).find()) {
                result = MASK_RRN;
            }
            // IP
            else if (patternIp != null && patternIp.matcher(columnName).find()) {
                result = MASK_IP;
            }
            // 첫글자외 마스킹
            else if (patternOther != null && patternOther.matcher(columnName).find()) {
                result = MASK_OTHER;
            }
            // 전체 마스킹
            else if (patternAll != null && patternAll.matcher(columnName).find()) {
                result = MASK_ALL;
            }
        } catch (Exception e) {
        }
        return result;
    }

    @Override
    public String getMaskString(int maskType, String value) {

        String result = null;
        if (Util.isNull(value)) {
            return result;
        }

        switch (maskType) {
            // 마스킹 안함
            case MASK_NONE:
                result = value;
                break;
            // ID
            case MASK_ID:
                result = getMaskId(value);
                break;
            // 성명
            case MASK_NM:
                result = getMaskNm(value);
                break;
            // 주소
            case MASK_ADDRESS:
                result = getMaskAddress(value);
                break;
            // 전화번호
            case MASK_TEL:
                result = getMaskTel(value);
                break;
            // 이메일
            case MASK_EMAIL:
                result = getMaskEmail(value);
                break;
            // 주민번호
            case MASK_RRN:
                result = getMaskRrn(value);
                break;
            // IP
            case MASK_IP:
                result = getMaskIp(value);
                break;
            // 첫글자외 마스킹
            case MASK_OTHER:
                result = getMaskOther(value);
                break;
            // 전체 마스킹
            case MASK_ALL:
                result = getMaskAll(value);
                break;
            default:
                result = value;
                break;
        }

        return result;
    }

    @Override
    public String getMaskAll(String value) {

        String result = Util.nullToDefault(value, "");

        if (Util.isNull(result)) {
            return result;
        }

        return result.replaceAll(".", MASK_CHAR);
    }

    @Override
    public String getMaskOther(String value) {

        return getMaskOther(value, -1);
    }

    @Override
    public String getMaskOther(String value, int lenValue) {

        String result;
        int lenResult;

        // value만 입력시 기본 처리
        if (lenValue == -1) {
            result = Util.nullToDefault(value, "");
            if (Util.isNull(result)) {
                return result;
            }
            lenResult = result.length();
        }
        // value, lenValue 입력시 체크 없음
        else {
            result = value;
            lenResult = lenValue;
        }

        // 2자 이상, AB --> A*
        if (lenResult >= 2) {
            result = result.substring(0, 1) + result.substring(1).replaceAll(".", MASK_CHAR);
        }
        // 1자, A -> *
        else {
            result = MASK_CHAR;
        }

        return result;
    }

    @Override
    public String getMaskId(String value) {

        String result = Util.nullToDefault(value, "");

        if (Util.isNull(result)) {
            return result;
        }
        int lenResult = result.length();

        // ID 앞 2자리 제외한 나머지 마스킹
        // 규칙 적용 가능(3자 이상), USER01 -> US****
        if (lenResult >= 3) {
            result = result.substring(0, 2) + Util.lPad(MASK_CHAR, lenResult - 2, MASK_CHAR);
        }
        // 규칙 적용 불가(3자 미만)
        else {
            result = getMaskOther(result, lenResult);
        }

        return result;
    }

    @Override
    public String getMaskNm(String value) {

        String result = Util.nullToDefault(value, "");

        if (Util.isNull(result)) {
            return result;
        }
        int lenResult = result.length();

        // 성명(국문) 가운데 1자 마스킹, 4자이상은 3자로 표시
        // 한글 포함시 성명 국문으로 처리
        if (result.matches(".*[ㄱ-ㅎㅏ-ㅣ가-힣]+.*")) {
            // 규칙 적용 가능(3자 이상), 홍길동 -> 홍*동, 박세리나 -> 박*나
            if (lenResult >= 3) {
                result = result.substring(0, 1) + MASK_CHAR + result.substring(lenResult - 1);
            }
            // 규칙 적용 불가(3자 미만)
            else {
                result = getMaskOther(result, lenResult);
            }
        }
        // 성명(영문) 앞 4자를 제외한 나머지 마스킹
        else {
            // 규칙 적용 가능(5자 이상), 성명(영문), Barack Obama -> Bara********
            if (lenResult >= 5) {
                result = result.substring(0, 4) + Util.lPad(MASK_CHAR, lenResult - 4, MASK_CHAR);
            }
            // 규칙 적용 불가(3자 미만)
            else {
                result = getMaskOther(result, lenResult);
            }
        }

        return result;
    }

    @Override
    public String getMaskEmail(String value) {

        String result = Util.nullToDefault(value, "");

        if (Util.isNull(result)) {
            return result;
        }
        // int lenResult = result.length();

        // ID에서 앞 2자리 제외한 나머지 마스킹
        // @ 앞을 ID로 처리, @부터는 마스킹 하지 않음
        int posAt = result.indexOf("@");
        // @가 없을 경우, 전체를 ID로 인식하고 처리 --> US****
        if (posAt == -1) {
            result = getMaskId(result);
        }
        // @가 있을 경우, USER01@EMAIL.COM -> US****@EMAIL.COM
        else {
            result = getMaskId(result.substring(0, posAt)) + result.substring(posAt);
        }

        return result;
    }

    @Override
    public String getMaskTel(String value) {

        String result = Util.nullToDefault(value, "");

        if (Util.isNull(result)) {
            return result;
        }
        int lenResult = result.length();

        // 전화번호 또는 휴대폰 뒤 4자리 마스킹
        // 규칙 적용 가능(5자 이상), 010-1234-5678 -> 010-1234-****, 01012345678 -> 0101234****
        if (lenResult >= 5) {
            result = result.substring(0, lenResult - 4) + Util.lPad(MASK_CHAR, 4, MASK_CHAR);
        }
        // 규칙 적용 불가(3자 미만)
        else {
            result = getMaskOther(result, lenResult);
        }

        return result;
    }

    @Override
    public String getMaskRrn(String value) {

        String result = Util.nullToDefault(value, "");

        if (Util.isNull(result)) {
            return result;
        }
        int lenResult = result.length();

        // 주민번호 뒤 7자리 마스킹
        // 규칙 적용 가능(8자 이상), 110101-*******, 110101*******
        if (lenResult >= 8) {
            result = result.substring(0, lenResult - 7) + Util.lPad(MASK_CHAR, 7, MASK_CHAR);
        }
        // 규칙 적용 불가(8자 미만)
        else {
            result = getMaskOther(result, lenResult);
        }

        return result;
    }

    @Override
    public String getMaskAddress(String addrBasic, String addrDetail) {

        String result = "";

        addrBasic = Util.nullToDefault(addrBasic, "");
        addrDetail = Util.nullToDefault(addrDetail, "");

        boolean isNullB = Util.isNull(addrBasic);
        boolean isNullD = Util.isNull(addrDetail);

        if (isNullB && isNullD) {
            return result;
        }

        // 주소가 구분되어 있을 경우 상세주소만 마스킹
        if (!isNullB && !isNullD) {
            result = addrBasic + " " + getMaskAll(addrDetail);
        }
        // 주소가 구분되어 있지 않을 경우 숫자만 마스킹
        else {
            result = (addrBasic + " " + addrDetail).trim().replaceAll("[0-9]", MASK_CHAR);
        }

        return result;
    }

    @Override
    public String getMaskAddress(String value) {

        String result = Util.nullToDefault(value, "");

        if (Util.isNull(result)) {
            return result;
        }

        // 주소가 구분되어 있지 않기 때문에 숫자만 마스킹
        return result.replaceAll("[0-9]", MASK_CHAR);
    }

    @Override
    public String getMaskIp(String value) {

        String result = Util.nullToDefault(value, "");

        if (Util.isNull(result)) {
            return result;
        }
        int lenResult = result.length();
        int dotCnt = StringUtils.countMatches(result, ".");

        // IP 형태일 경우
        // 255.255.255.255 -> ***.255.255.***
        if (dotCnt == 3) {
            int posDot1 = result.indexOf(".");
            int posDot2 = result.lastIndexOf(".");
            result = Util.lPad(MASK_CHAR, posDot1, MASK_CHAR) //
                + result.substring(posDot1, posDot2 + 1) //
                + Util.lPad(MASK_CHAR, lenResult - posDot2 - 1, MASK_CHAR);
        }
        // IP 형태가 아닐 경우
        // 123.567 최소자리 이상(7자), ***.***
        else if (lenResult >= 7) {
            result = Util.lPad(MASK_CHAR, 3, MASK_CHAR) //
                + result.substring(3, lenResult - 3) //
                + Util.lPad(MASK_CHAR, 3, MASK_CHAR);
        }
        // 규칙 적용 불가(7자 미만)
        else {
            result = getMaskOther(result, lenResult);
        }

        return result;
    }
}
