const port = process.env.PORT || 8000;
const express = require('express');
const app = express();

const multer = require('multer');
const upload = multer({ dest: 'tmp/' });

const sharp = require('sharp');
const sizeOf = require('image-size');
const fs = require('fs');

app.use(express.urlencoded({extended: true})); //form形式で受け取れるように

app.get('/upload', (req, res) => {
  res.sendFile(__dirname + '/public/client.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    console.log(req.file.path);
    var outpath = (req.file.path + '_out.jpg'); //処理後のファイル名
    var image = sharp(req.file.path);
    if (req.body.size) { //sizeが指定されている場合はリサイズ
      var dimensions = sizeOf(req.file.path);
      var outwidth = Math.round(dimensions.width * ( req.body.size / 100 )); //sizeからサイズを計算&四捨五入
      image.resize(outwidth, null);
    };
    image.toFormat('jpg', {
      quality: 75
    });
    image.toFile(outpath, (err, info) => {
      console.log(info);
      var outfile = fs.readFileSync(outpath);
      var dlfilename = req.file.filename + '_out.jpg'
      res.set({'Content-Disposition': `attachment; filename=${dlfilename}`});
      res.send(outfile);
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(outpath);
    });
  } catch(e) {
    res.status(500).send('Error');
    console.log(e);
  };
});

app.listen(port, () => {
  console.log('Server listen on port ' + port)
});
