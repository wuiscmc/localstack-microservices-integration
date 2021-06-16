'use strict';

const axios = require('axios');
const AWS = require('aws-sdk');

const express = require('express');
const app = express();
const port = process.env.PORT_EXTERNAL || 80;

const BUCKET = process.env.BUCKET || 'test-bucket';

let S3;

const createSourceMapping = async (arn) => {
  await axios.post(`http://testable-lambda-example/createSourceMapping?arn=${arn}`);
  console.log(`DONE: Mapping created for ${arn}`);
}

const createBucket = async () => {
  if(!S3) {
    S3 = new AWS.S3({
      endpoint: new AWS.Endpoint('http://localstack:4566'),
      accessKeyId: 'identity',
      secretAccessKey: 'credential',
      s3ForcePathStyle: true
    });
  }

  await S3.createBucket({
    Bucket: BUCKET
  }).promise();

  console.log('bucket created');

  const {data: {arn}} = await axios.get(`http://testable-lambda-example/arn`);

  await S3.putBucketNotificationConfiguration({
    Bucket: BUCKET,
    NotificationConfiguration: {
      LambdaFunctionConfigurations: [
        {
          Events: [ 's3:ObjectCreated:* ' ],
          LambdaFunctionArn: arn
        },
      ],
    }
  }).promise();

  console.log('created configuration notification for ', BUCKET);
}

const provisionService = async ({sourceMappingArn}) => {
  if(sourceMappingArn) {
    await createSourceMappings(sourceMappingArn);
  }
  await createBucket();
}

app.get('/healthcheck', (_req, res) => {
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
			provision: {
				href: "/provision",
				method: "put"
			}
		}
	};
	res.send(endpointInformation);
});

app.put('/provision', async (req, res) => {
  await provisionService(req.query);

  const json = {success: "OK"}
  res.set('Content-Type', 'application/json');
  res.send(json);
});

app.listen(port, () => {
	console.log(`Listening at ${port}`);
});
