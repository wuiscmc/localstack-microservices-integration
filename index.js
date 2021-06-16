'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT_EXTERNAL || 80;
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
			Create: {
				href: "/create{?filename}",
				method: "post"
			}
		}
	};
	res.send(endpointInformation);
});

const AWS = require('aws-sdk');
let S3;

const getS3Connection = async () => {
  if(S3) {
    return S3;
  }

  if(process.env.TEST_MODE) {
    S3 = new AWS.S3({
      endpoint: new AWS.Endpoint('http://localstack:4566'),
      accessKeyId: 'identity',
      secretAccessKey: 'credential',
      s3ForcePathStyle: true
    });
    return S3;
  }

  S3 = new AWS.S3();
  return S3;
}

const create = async ({filename}) => {
  const s3Conn = await getS3Connection();

  await s3Conn.putObject({
    Key: filename,
    Bucket: process.env.BUCKET,
    Body: JSON.stringify({content: {filename, ds: Date.now()}})
  }).promise();
}


app.post('/create', async (req, res, next) => {
	if(!req.query.url || req.query.url.length === 0) {
		res.status(400).send({message: 'required param missing (url)'});
		return;
	}
  try {
    await create(req.query);
    res.set('Content-Type', 'application/json');
    res.send({message: 'success'});
  }
  catch(error) {
    next(error);
  }
});

app.listen(port, () => {
	logger.info(`Listening at ${port}`);
});
