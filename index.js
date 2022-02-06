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
  if(file) {
    try {
      fs.unlinkSync(file);
      console.log('Removed:' + file);
    } catch(e) {
      console.log('Remove Error:' + file);
    };
  };
};

app.use(express.urlencoded({extended: true})); //form形式で受け取れるように

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/client.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    console.log('\n' + req.file.path + '\n quality:' + req.body.quality + '\n format:' + req.body.format + '\n size:' + req.body.size);
    var image = sharp(req.file.path);
    if (!isNaN(req.body.size) && req.body.size != '' && req.body.size != '100') { //sizeが指定されている場合はリサイズ
      var dimensions = sizeOf(req.file.path); //元画像のサイズを取得
      var outwidth = Math.round(dimensions.width * ( req.body.size / 100 )); //sizeからサイズを計算&四捨五入
      image.resize(outwidth, null);
      console.log('Resized');
    };
    if (!isNaN(req.body.quality) && req.body.quality != '') { //qualityがあれば指定
      var numquality = Number(req.body.quality);
      if (1 <= numquality <= 100) {
        var outquality = numquality;
      } else {
        var outquality =75;
      };
    } else { //なければ75
      var outquality = 75;
    };
    if (req.body.format == 'jpeg' || req.body.format == 'jpg' || req.body.format == 'png' || req.body.format == 'webp') { //formatがあれば指定
      image.toFormat(req.body.format, {
        quality: outquality
      });
      var outname = req.file.filename + '_out.' + req.body.format;
    } else {
      image.toFormat('jpg', { //なければjpg
        quality: outquality
      });
      var outname = req.file.filename + '_out.jpg';
    };
    var outpath = 'tmp/' + outname
    image.toFile(outpath, (err, info) => {
      try {
        console.log(info);
        console.log(outpath);
        var outfile = fs.readFileSync(outpath);
        res.set({'Content-Disposition': `attachment; filename=${outname}`});
        res.send(outfile);
        remove(req.file.path);
        remove(outpath);
      } catch(e) {
        res.status(500).send('Error');
        remove(req.file.path);
        remove(outpath);
      };
    });
  } catch(e) {
    res.status(500).send('Error');
    console.log(e);
    remove(req.file.path);
    remove(outpath);
  };
});

app.listen(port, () => {
  console.log('Server listen on port ' + port)
});
