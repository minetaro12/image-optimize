import express from 'express';
const router = express.Router();

import path from 'path'; //実行しているディレクトリ名の解決のため

router.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
});

export default router;
