import express from 'express';
const router = express.Router();

import multer from 'multer';
const upload = multer({
  dest: 'tmp/',
  limits: {
    fileSize: 10485760, //10MB
    files: 1
  }
});

import fs from 'fs';
import sharp from 'sharp';
import sizeOf from 'image-size';
import remove from './remove';

router.post('/', upload.single('file'), (req,res) => {
  if (req.file) {
    const originPath = req.file.path;
    const originName = req.file.filename;
    const originMime = req.file.mimetype;

    const sizeOp = req.body.size;
    const qualityOp = req.body.quality;
    const formatOp = req.body.format;
    const removemetaOp = req.body.removemeta;

    let outQuality;
    let outPath;
    let outName;

     (async () => {
      try {
        //画像かどうか
        if (originMime != 'image/jpeg' && originMime != 'image/png' && originMime != 'image/webp') {throw new Error('Invalid type')};
        console.log(`\n${originPath}\nmimetype: ${originMime}\nresize: ${sizeOp}\nquality: ${qualityOp}\nformat: ${formatOp}\nremovemeta: ${removemetaOp}\n`);

        const image = sharp(originPath);

        if (removemetaOp == '1') { //メタデータ削除が指定された場合
          console.log('Remove meta');
        } else {
          image.withMetadata();
          console.log('Keep meta');
        };

        if (!isNaN(sizeOp) && sizeOp != '' && sizeOp != '100') { //sizeが指定されている場合はリサイズ
          const inWidth = sizeOf(originPath).width; //元画像の横サイズを取得
          if (inWidth) {
            const outWidth = Math.round(inWidth * ( sizeOp / 100 )); //sizeからサイズを計算&四捨五入
            image.resize(outWidth);
            console.log('Resized');
          };
        };

        if (!isNaN(qualityOp) && qualityOp != '') { //qualityがあれば指定
          const numQuality = Number(qualityOp);
          if (1 <= numQuality && numQuality <= 100) {
            outQuality = numQuality;
          } else {
            outQuality = 75;
          };
        } else { //なければ75
          outQuality = 75;
        };

        if (formatOp == 'png' || formatOp == 'webp') { //formatがあれば指定
          outName = `${originName}_out.${formatOp}`;
          outPath = `${originPath}_out.${formatOp}`;
          await image
            .toFormat(formatOp, {
              quality: outQuality
            })
            .toFile(outPath);
          console.log(outPath);
        } else {
          outName = `${originName}_out.jpg`;
          outPath = `${originPath}_out.jpg`;
          await image
            .toFormat('jpg', {
              mozjpeg: true,
              quality: outQuality
            })
            .toFile(outPath);
          console.log(outPath);
        };

        //ファイルの送信
        const outFile = fs.readFileSync(outPath);
        res.set({'Content-Disposition': `attachment; filename=${outName}`});
        res.send(outFile);

        //一時ファイルの削除
        remove(originPath);
        remove(outPath);

      } catch(e) {
        console.log(e);
        res.status(500).send('Error');
        remove(originPath)
        if (outPath) {remove(outPath)};
      }
    })();
  } else {
    res.status(500).send('Error');
  };
});

export default router;
