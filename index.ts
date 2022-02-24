import express = require('express');
const app = express();
const port = process.env.PORT || 8000;

import multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  dest: 'tmp/',
  limits: {
    fileSize: 10485760, //10MB
    files: 1
  }
});

import fs = require('fs');

import sharp = require('sharp');

app.use(express.urlencoded({extended: true}));

app.post('/', upload.single('file'), (req,res) => {
  if (req.file) {
    (async () => {
      await sharp(req.file?.path)
        .jpeg({
          mozjpeg: true,
          quality: 75
        })
        .toFile(req.file?.path + '_out');
        const outfile = fs.readFileSync(req.file?.path + '_out');
        res.set({'Content-Disposition': `attachment; filename=${req.file?.filename + '_out.jpg'}`});
        res.send(outfile);
    })();
  } else {
    res.end();
  };
});

app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});