import express from 'express';
const app = express();
const port = process.env.PORT || 8000;

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
