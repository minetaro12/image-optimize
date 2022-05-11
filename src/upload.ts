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
    const originPath: string = req.file.path;
    const originName: string = req.file.filename;
    const originMime: string = req.file.mimetype;

    const sizeOp: string = req.body.size;
    const qualityOp: string = req.body.quality;
    const formatOp: string = req.body.format;
    const removemetaOp: string = req.body.removemeta;
    const grayOp: string = req.body.gray;

    let outQuality: number;
    let outPath: string|undefined;
    let outName: string;

     (async () => {
      try {
        //画像かどうか
        if (originMime != 'image/jpeg' && originMime != 'image/png' && originMime != 'image/webp') {throw new Error('Invalid type')};
        console.log(`\n${originPath}\nmimetype: ${originMime}\nresize: ${sizeOp}\nquality: ${qualityOp}\nformat: ${formatOp}\nremovemeta: ${removemetaOp}\ngrayscale: ${grayOp}\n`);

        const image = sharp(originPath);

        if (removemetaOp == '1') { //メタデータ削除が指定された場合
          console.log('Remove meta');
        } else {
          image.withMetadata();
          console.log('Keep meta');
        };

        if (sizeOp && sizeOp != '' && sizeOp != '100') { //sizeが指定されている場合はリサイズ
          const inWidth: number|undefined = sizeOf(originPath).width; //元画像の横サイズを取得
          if (inWidth) {
            const numSize: number = Number(sizeOp);
            const outWidth: number = Math.round(inWidth * ( numSize / 100 )); //sizeからサイズを計算&四捨五入
            image.resize(outWidth);
            console.log('Resized');
          };
        };

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
          console.log('Grayscale');
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
        const outFile: Buffer = fs.readFileSync(outPath);
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
