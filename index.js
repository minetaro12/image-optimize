const port = process.env.PORT || 8000;
const express = require('express');
const app = express();

const multer = require('multer');
const upload = multer({
  dest: 'tmp/',
  limits: {
    fileSize: 10485760, //10MB
    files: 1
  }
});

const sharp = require('sharp');
const sizeOf = require('image-size');
const fs = require('fs');

const remove = function(file) { //一時ファイルの削除
  try {
    fs.unlinkSync(file);
    console.log('Removed:' + file);
  } catch(e) {
    console.log('Remove Error:' + file);
  };
};

app.use(express.urlencoded({extended: true})); //form形式で受け取れるように

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/client.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    //ファイルがあるかどうか
    if (typeof req.file == 'undefined') {throw new Error('No file')};

    //画像かどうか
    if (req.file.mimetype != 'image/jpeg' && req.file.mimetype != 'image/png' && req.file.mimetype != 'image/webp') {throw new Error('Invalid type')};

    console.log('\n' + req.file.path + '\n mimetype:' + req.file.mimetype + '\n quality:' + req.body.quality + '\n format:' + req.body.format + '\n size:' + req.body.size);
    const image = sharp(req.file.path);

    if (!isNaN(req.body.size) && req.body.size != '' && req.body.size != '100') { //sizeが指定されている場合はリサイズ
      let inwidth = sizeOf(req.file.path).width; //元画像の横サイズを取得
      let outwidth = Math.round(inwidth * ( req.body.size / 100 )); //sizeからサイズを計算&四捨五入
      image.resize(outwidth, null);
      console.log('Resized');
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
    if (req.body.format == 'jpeg' || req.body.format == 'jpg' || req.body.format == 'png' || req.body.format == 'webp') { //formatがあれば指定
      image.toFormat(req.body.format, {
        quality: outquality
      });
      outname = req.file.filename + '_out.' + req.body.format;
    } else {
      image.toFormat('jpg', { //なければjpg
        quality: outquality
      });
      outname = req.file.filename + '_out.jpg';
    };

    const outpath = 'tmp/' + outname
    image.toFile(outpath, (err, info) => {
      try {
        console.log(info);
        console.log('Saveto:' + outpath);
        let outfile = fs.readFileSync(outpath);
        res.set({'Content-Disposition': `attachment; filename=${outname}`});
        res.send(outfile);
        remove(req.file.path);
        remove(outpath);
      } catch(e) {
        res.status(500).send('Error');
        console.log(e);
        if (typeof req.file !== 'undefined') {
          remove(req.file.path);
        };
        if (typeof outpath !== 'undefined') {
          remove(outpath);
        };
      };
    });

  } catch(e) {
    res.status(500).send('Error');
    console.log(e);
    if (typeof req.file !== 'undefined') {
      remove(req.file.path);
    };
    if (typeof outpath !== 'undefined') {
      remove(outpath);
    };
  };
});

app.listen(port, () => {
  console.log('Server listen on port ' + port);
});
