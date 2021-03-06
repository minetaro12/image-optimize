import express from 'express';
const app = express();
const port = process.env.PORT || 8000;
import log4js from 'log4js';
const logger = log4js.getLogger();
logger.level = 'debug';

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

import uploadProcess from './upload';
app.use('/upload', uploadProcess);

import htmlClient from './client';
app.use('/', htmlClient);

app.listen(port, () => {
  logger.info(`Server listen on port ${port}`);
});
