package nexos.service.cm;

import java.awt.Image;
import java.awt.image.BufferedImage;
import java.awt.image.PixelGrabber;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributeView;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.swing.ImageIcon;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import nexos.dao.cm.CMC03070E0DAO;
import nexos.framework.Consts;
import nexos.framework.Util;
import nexos.framework.message.NexosMessage;
import nexos.framework.security.DataEncryptor;
import nexos.framework.support.NexosSupport;
import nexos.framework.support.ServiceSupport;

/**
 * Class: CMC03070E0Service<br>
 * Description: 고객사이미지관리 관리(CMC03070E0) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service
public class CMC03070E0Service extends ServiceSupport {

    // private final Logger logger = LoggerFactory.getLogger(CMC03070E0Service.class);

    final String          SELECT_ID_RS_REF1 = "CMC03070E0.RS_REF1";
    final int             MAX_IMAGE_SIZE    = 350;
    final String          IMAGE_FORMAT      = "png";
    final byte[]          SIGNATURE_PNG     = new byte[] {(byte)137, (byte)80, (byte)78, (byte)71, (byte)13, (byte)10, (byte)26, (byte)10};

    @Autowired
    private CMC03070E0DAO dao;

    @Autowired
    private DataEncryptor dataEncryptor;

    @SuppressWarnings("rawtypes")
    public Map<String, Object> getBIImage(Map<String, Object> params) {

        Map<String, Object> result = new HashMap<String, Object>();

        String imageDiv = (String)params.get("P_IMAGE_DIV");
        String imageCd1 = (String)params.get("P_IMAGE_CD1");
        String imagePath = null;

        if ("01".equals(imageDiv)) {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.CUST");
        } else if ("02".equals(imageDiv)) {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.BU");
        } else {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.BRAND");
        }

        try {
            File biImageFile = new File(Util.getFileName(imagePath, imageCd1));
            String imageContent = null;
            if (biImageFile.exists()) {
                imageContent = dataEncryptor.encryptBase64(FileUtils.readFileToByteArray(biImageFile));
            } else {
                List<Map<String, Object>> lstBIImage = getDataList(SELECT_ID_RS_REF1, params);
                if (lstBIImage.size() > 0) {
                    imageContent = (String)((Map)lstBIImage.get(0)).get("IMAGE_CONTENT");
                }
            }

            if (Util.isNull(imageContent)) {
                imagePath = NexosSupport.getWebFileRootPath("FILE.BI.ROOT");
                imageContent = dataEncryptor.encryptBase64(FileUtils.readFileToByteArray(new File(Util.getFileName(imagePath, "no_image"))));
            }
            result.put("O_IMAGE_CONTENT", "data:image/png;base64, " + imageContent);
            Util.setOutMessage(result, Consts.OK);
        } catch (Exception e) {
            Util.setOutMessage(result, Util.getErrorMessage(e));
        }
        return result;
    }

    public String saveBIImage(Map<String, Object> params) throws Exception {

        String result = Consts.OK;

        String imageDiv = (String)params.get("P_IMAGE_DIV");
        String imageCd = (String)params.get("P_IMAGE_CD1");
        String imagePath = null;

        if ("01".equals(imageDiv)) {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.CUST");
        } else if ("02".equals(imageDiv)) {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.BU");
        } else {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.BRAND");
        }

        MultipartFile multipartFile = (MultipartFile)params.get("P_UPLOAD_FILE");
        File orgImageFile = new File(Util.getFileName(imagePath, imageCd + ".org"));
        File resizeImageFile = new File(Util.getFileName(imagePath, imageCd));
        try {
            multipartFile.transferTo(orgImageFile);
            params.remove("P_UPLOAD_FILE");
        } catch (Exception e) {
            throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.022", "이미지 파일을 전송하지 못했습니다."));
        }

        params.put("P_IMAGE_CONTENT", toImageContent(orgImageFile, resizeImageFile));
        Path path = Paths.get(resizeImageFile.getAbsolutePath());
        BasicFileAttributes fileAttr = Files.getFileAttributeView(path, BasicFileAttributeView.class).readAttributes();
        params.put("P_IMAGE_DATETIME", Util.toString(new Date(fileAttr.creationTime().toMillis()), Consts.DATETIME_FORMAT));
        params.put("P_CRUD", Consts.DV_CRUD_C);
        dao.saveImage(params);

        return result;
    }

    public String removeBIImage(Map<String, Object> params) throws Exception {

        String result = Consts.OK;

        String imageDiv = (String)params.get("P_IMAGE_DIV");
        String imageCd1 = (String)params.get("P_IMAGE_CD1");
        String imagePath = null;

        if ("01".equals(imageDiv)) {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.CUST");
        } else if ("02".equals(imageDiv)) {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.BU");
        } else {
            imagePath = NexosSupport.getWebFileRootPath("FILE.BI.BRAND");
        }

        params.put("P_CRUD", Consts.DV_CRUD_D);
        dao.saveImage(params);

        File imageFile = new File(Util.getFileName(imagePath, imageCd1));
        if (imageFile.exists() && imageFile.isFile()) {
            if (!imageFile.delete()) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.023", "이미지 파일을 삭제하지 못했습니다."));
            }
        }

        return result;
    }

    public String toImageContent(File orgImageFile, File resizeImageFile) throws Exception {

        try {
            Image srcImage = null;
            byte[] byteBIImage = FileUtils.readFileToByteArray(orgImageFile);
            if (MediaType.IMAGE_PNG.equals(getMediaType(byteBIImage))) {
                srcImage = ImageIO.read(orgImageFile);
            } else {
                srcImage = new ImageIcon(byteBIImage).getImage();
            }

            int srcWidth = srcImage.getWidth(null);
            int srcHeight = srcImage.getHeight(null);
            if (srcWidth < 0 || srcHeight < 0) {
                throw new RuntimeException(NexosMessage.getDisplayMsg("JAVA.WC.024", "처리할 수 있는 이미지 파일이 아닙니다."));
            }

            int destWidth = srcWidth, destHeight = srcHeight;
            if (srcWidth > MAX_IMAGE_SIZE || srcHeight > MAX_IMAGE_SIZE) {
                if (srcWidth > srcHeight) {
                    destWidth = MAX_IMAGE_SIZE;
                    double ratio = (double)destWidth / (double)srcWidth;
                    destHeight = (int)(srcHeight * ratio);
                } else {
                    destHeight = MAX_IMAGE_SIZE;
                    double ratio = (double)destHeight / (double)srcHeight;
                    destWidth = (int)(srcWidth * ratio);
                }
            }

            Image destImage = srcImage.getScaledInstance(destWidth, destHeight, Image.SCALE_SMOOTH);
            int pixels[] = new int[destWidth * destHeight];
            PixelGrabber pg = new PixelGrabber(destImage, 0, 0, destWidth, destHeight, pixels, 0, destWidth);
            try {
                pg.grabPixels();
            } catch (InterruptedException e) {
                throw new Exception(Util.getErrorMessage(e));
            }
            BufferedImage destImageBuffer = new BufferedImage(destWidth, destHeight, BufferedImage.TYPE_INT_RGB);
            destImageBuffer.setRGB(0, 0, destWidth, destHeight, pixels, 0, destWidth);

            ImageIO.write(destImageBuffer, IMAGE_FORMAT, resizeImageFile);
        } finally {
            FileUtils.forceDelete(orgImageFile);
        }

        return dataEncryptor.encryptBase64(FileUtils.readFileToByteArray(resizeImageFile));
    }

    public MediaType getMediaType(byte[] byteImage) {

        if (byteImage == null || byteImage.length < SIGNATURE_PNG.length) {
            return MediaType.IMAGE_JPEG;
        }
        for (int i = 0, checkCount = SIGNATURE_PNG.length; i < checkCount; i++) {
            if (byteImage[i] != SIGNATURE_PNG[i]) {
                return MediaType.IMAGE_JPEG;
            }
        }

        return MediaType.IMAGE_PNG;
    }

}
