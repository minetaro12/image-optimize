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

router.post('/', upload.single('file'), (req,res) => {
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

export default router;