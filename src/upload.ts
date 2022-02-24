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
import { visitFunctionBody } from 'typescript';

router.post('/', upload.single('file'), (req,res) => {
  if (req.file) {
    (async () => {
      try {
        //画像かどうか
        if (req.file?.mimetype != 'image/jpeg' && req.file?.mimetype != 'image/png' && req.file?.mimetype != 'image/webp') {throw new Error('Invalid type')};
        console.log(`\n${req.file.path}\nmimetype: ${req.file.mimetype}\nquality: ${req.body.quality}\nformat: ${req.body.format}\nsize: ${req.body.size}`);

        let outwidth
        if (!isNaN(req.body.size) && req.body.size != '') { //sizeが指定されている場合はリサイズ
          let inwidth = sizeOf(req.file.path).width; //元画像の横サイズを取得
          if (inwidth) {
            let outwidth = Math.round(inwidth * ( req.body.size / 100 )); //sizeからサイズを計算&四捨五入
            console.log('Resized');
          };
        };

        let outquality;
        if (!isNaN(req.body.quality) && req.body.quality != '') { //qualityがあれば指定
          let numquality = Number(req.body.quality);
          if (1 <= numquality && numquality <= 100) {
            outquality = numquality;
          } else {
            outquality = 75;
          };
        } else { //なければ75
          outquality = 75;
        };

        let outname;
        let outpach;
        if (req.body.format == 'png' || req.body.format == 'webp') { //formatがあれば指定
          outname = req.file.filename + '_out.' + req.body.format;
          outpach = req.file.path + '_out.' + req.body.format;
          await sharp(req.file?.path)
            .resize(outwidth, null)
            .toFormat(req.body.format, {
              quality: outquality
            })
            .toFile(outpach);
          console.log(outpach);
        } else {
          outname = req.file.filename + '_out.jpg';
          outpach = req.file.path + '_out.jpg';
          await sharp(req.file?.path)
            .resize(outwidth, null)
            .toFormat('jpg', {
              mozjpeg: true,
              quality: outquality
            })
            .toFile(outpach);
          console.log(outpach);
        };

        const outfile = fs.readFileSync(outpach);
        res.set({'Content-Disposition': `attachment; filename=${outname}`});
        res.send(outfile);

      } catch(e) {
        console.log(e);
        res.status(500).send('Error');
      }
    })();
  } else {
    res.status(500).send('Error');
  };
});

export default router;