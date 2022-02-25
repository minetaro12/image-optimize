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

//一時ファイルの削除
const remove = function(file: string) {
  try {
    if(fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Removed: ${file}`);
    } else {
      console.log(`Skip: ${file}`);
    };
  } catch(e) {
    console.log('Remove Error');
  };
};

router.post('/', upload.single('file'), (req,res) => {
  if (req.file) {
    (async () => {
      let outwidth;
      let outquality;
      let outpath;
      let outname;

      try {
        //画像かどうか
        if (req.file?.mimetype != 'image/jpeg' && req.file?.mimetype != 'image/png' && req.file?.mimetype != 'image/webp') {throw new Error('Invalid type')};
        console.log(`\n${req.file.path}\nmimetype: ${req.file.mimetype}\nquality: ${req.body.quality}\nformat: ${req.body.format}\nsize: ${req.body.size}`);

        if (!isNaN(req.body.size) && req.body.size != '') { //sizeが指定されている場合はリサイズ
          let inwidth = sizeOf(req.file.path).width; //元画像の横サイズを取得
          if (inwidth) {
            outwidth = Math.round(inwidth * ( req.body.size / 100 )); //sizeからサイズを計算&四捨五入
            console.log('Resized');
          };
        } else {
          outwidth = sizeOf(req.file.path).width
        };

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

        if (req.body.format == 'png' || req.body.format == 'webp') { //formatがあれば指定
          outname = req.file.filename + '_out.' + req.body.format;
          outpath = req.file.path + '_out.' + req.body.format;
          await sharp(req.file?.path)
            .resize(outwidth, null)
            .toFormat(req.body.format, {
              quality: outquality
            })
            .toFile(outpath);
          console.log(outpath);
        } else {
          outname = req.file.filename + '_out.jpg';
          outpath = req.file.path + '_out.jpg';
          await sharp(req.file?.path)
            .resize(outwidth, null)
            .toFormat('jpg', {
              mozjpeg: true,
              quality: outquality
            })
            .toFile(outpath);
          console.log(outpath);
        };

        //ファイルの送信
        const outfile = fs.readFileSync(outpath);
        res.set({'Content-Disposition': `attachment; filename=${outname}`});
        res.send(outfile);

        //一時ファイルの削除
        remove(req.file.path);
        remove(outpath);

      } catch(e) {
        console.log(e);
        res.status(500).send('Error');
        if (req.file) {remove(req.file.path)};
        if (outpath) {remove(outpath)};
      }
    })();
  } else {
    res.status(500).send('Error');
  };
});

export default router;
