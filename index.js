'use strict';

const express = require('express');
const app = express();

const UploadFile = require('./src/UploadFile');
const logger = require('./src/logger');

app.get('/healthcheck', (req, res) => {
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  const endpointInformation = {
    links: {
      self: {
        href: req.originalUrl
      },
    },
    data: {
      UploadFile: {
        href: "/uploadFile{?filename}",
        method: "post"
      }
    }
  };
  res.send(endpointInformation);
});

app.post('/uploadFile', async (req, res, next) => {
  if(!req.query.filename || req.query.filename.length === 0) {
    res.status(422).send({message: 'required param missing (filename)'});
    return;
  }
  try {
    await UploadFile(req.query);
    res.set('Content-Type', 'application/json');
    res.send({message: 'success'});
  }
  catch(error) {
    next(error);
  }
});

const port = process.env.PORT_EXTERNAL || 80;

app.listen(port, () => {
  logger.info(`Listening at ${port}`);
});
