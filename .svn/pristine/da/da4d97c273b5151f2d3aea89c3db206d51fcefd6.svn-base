package nexos.service.cs;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;

import nexos.framework.Consts;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CSC09010Q0Service<br>
 * Description: 쿼리 실행기 데이터 조회(CSC09010Q0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 *
 * @author ASETEC
 * @version 1.0
 *          <pre style="font-family: GulimChe; font-size: 12px;">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2020-06-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 *          </pre>
 */
@Service
public class CSC09010Q0Service extends ServiceSupport {

    public List<Map<String, Object>> getDataListEx(String queryId, Map<String, Object> params) throws SQLException {

        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();

        // 컬럼순서대로 select하기 위해 jdbc 직접 호출하여 Meta 정보 참조
        Statement statement = null;
        TransactionStatus ts = beginTrans(); // Connection 사용을 위해
        try {
            String sql = (String)params.get("P_QUERY_TEXT");

            statement = getDefaultDao().getConnection().createStatement();
            statement.setFetchSize(500);
            ResultSet dsResult = statement.executeQuery(sql);
            ResultSetMetaData metaData = dsResult.getMetaData();
            int columnCount = metaData.getColumnCount();
            SimpleDateFormat sdfTimestamp = new SimpleDateFormat(Consts.DATETIME_FORMAT);
            while (dsResult.next()) {
                Map<String, Object> rowData = new LinkedHashMap<String, Object>(); // LinkedHashMap 사용하여 순서대로 입력
                for (int cIndex = 1; cIndex <= columnCount; cIndex++) {
                    Object columnValue = JdbcUtils.getResultSetValue(dsResult, cIndex);
                    if (columnValue instanceof Timestamp || columnValue instanceof Date) {
                        columnValue = sdfTimestamp.format(columnValue).replace(Consts.DV_NULL_TIME, "");
                    }
                    rowData.put(metaData.getColumnName(cIndex), columnValue);
                }
                result.add(rowData);
            }
        } finally {
            JdbcUtils.closeStatement(statement);
            rollbackTrans(ts);
        }

        return result;
    }
}
