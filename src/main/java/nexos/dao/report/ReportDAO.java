package nexos.dao.report;

import java.util.Map;

public interface ReportDAO {

    /**
     * Report 출력을 위해 PDF 문서 생성
     * 
     * @param params
     * @return Map
     * @throws Exception
     */
    Map<String, Object> getReport(Map<String, Object> params);
}