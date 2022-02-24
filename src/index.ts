import express from 'express';
const app = express();
const port = process.env.PORT || 8000;

app.use(express.urlencoded({extended: true}));

import uploadProcess from './upload';

app.use('/upload', uploadProcess);

app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});
