package nexos.dao.ed.common;

import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Repository;

import nexos.framework.support.DaoSupport;

/**
 * Class: EDCustomMethodDAOImpl<br>
 * Description: EDI Custom Method DAO (Data Access Object) - 데이터처리를 담당하는 Class<br>
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
@Repository("EDCUSTOMMETHODDAO")
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDCustomMethodDAOImpl extends DaoSupport implements EDCustomMethodDAO {

}
