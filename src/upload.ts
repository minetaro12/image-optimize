import express from 'express';
const router = express.Router();

import multer from 'multer';
const upload = multer({
  limits: {
    fileSize: 10485760, //10MB
    files: 1
  }
});

import sharp from 'sharp';
import sizeOf from 'image-size';
import path from 'path';
import log4js from 'log4js';
const logger = log4js.getLogger();
logger.level = 'info';

router.post('/', upload.single('file'), (req,res) => {
  if (req.file) {
    const originName: string = req.file.originalname;
    const originMime: string = req.file.mimetype;

    const sizeOp: string = req.body.size;
    const qualityOp: string = req.body.quality;
    const formatOp: string = req.body.format;
    const removemetaOp: string = req.body.removemeta;
    const grayOp: string = req.body.gray;

     (async () => {
      try {
        //画像かどうか
        if (originMime != 'image/jpeg' && originMime != 'image/png' && originMime != 'image/webp') {throw new Error('Invalid type')};
        logger.info(`${originName}\n\
type: ${originMime}\n\
resize: ${sizeOp}\n\
quality: ${qualityOp}\n\
format: ${formatOp}\n\
removemeta: ${removemetaOp}\n\
grayscale: ${grayOp}`);

        if (!req.file?.buffer) {
          throw new Error('Buffer not found');
        };
        const image = sharp(req.file.buffer);

        if (removemetaOp == '1') { //メタデータ削除が指定された場合
          logger.debug('Remove meta');
        } else {
          image.withMetadata();
          logger.debug('Keep meta');
        };

        if (sizeOp && sizeOp != '' && sizeOp != '100') { //sizeが指定されている場合はリサイズ
          const inWidth: number|undefined = sizeOf(req.file.buffer).width; //元画像の横サイズを取得
          if (inWidth) {
            const numSize: number = Number(sizeOp);
            const outWidth: number = Math.round(inWidth * ( numSize / 100 )); //sizeからサイズを計算&四捨五入
            image.resize(outWidth);
            logger.debug('Resized');
          };
        };

        let outQuality: number;
        if (qualityOp && qualityOp != '') { //qualityがあれば指定
          const numQuality: number = Number(qualityOp);
          if (1 <= numQuality && numQuality <= 100) {
            outQuality = numQuality;
          } else {
            outQuality = 75;
          };
        } else { //なければ75
          outQuality = 75;
        };

        if (grayOp == '1') { //グレースケールオプション
          image.grayscale();
          logger.debug('Grayscale');
        };

        let outBuffer: Buffer;
        let outName: string;
        const filenameParsed = path.parse(originName).name;
        if (formatOp == 'png' || formatOp == 'webp') { //formatがあれば指定
          outName = `${filenameParsed}_out.${formatOp}`;
          outBuffer = await image
            .toFormat(formatOp, {
              quality: outQuality
            })
            .toBuffer();
        } else {
          outName = `${filenameParsed}_out.jpg`;
          outBuffer = await image
            .toFormat('jpg', {
              mozjpeg: true,
              quality: outQuality
            })
            .toBuffer()
        };

        //ファイルの送信
        res.set({'Content-Disposition': `attachment; filename=${outName}`});
        res.send(outBuffer);
        logger.info('Complete');

      } catch(e) {
        logger.error(e);
        res.status(500).send('Error');
      }
      
    })();
  } else {
    res.status(500).send('Error');
  };
});

export default router;
