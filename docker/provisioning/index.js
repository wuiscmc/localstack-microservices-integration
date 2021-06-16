'use strict';

const axios = require('axios');
const AWS = require('aws-sdk');

const express = require('express');
const app = express();
const port = process.env.PORT_EXTERNAL || 80;

const BUCKET = process.env.BUCKET || 'test-bucket';

let S3;

const getS3Conn = () => {
  if(S3) {
    return S3;
  }

  S3 = new AWS.S3({
    endpoint: new AWS.Endpoint('http://localstack:4566'),
    accessKeyId: 'identity',
    secretAccessKey: 'credential',
    s3ForcePathStyle: true
  });

  return S3;
}


const createSourceMapping = async (arn) => {
  await axios.post(`http://testable-lambda-example/createSourceMapping?arn=${arn}`);
  console.log(`DONE: Mapping created for ${arn}`);
}

const createBucket = async () => {
  try {
    await getS3Conn().createBucket({
      Bucket: BUCKET
    }).promise();

    console.log('bucket created');
  } catch(error) {
    console.log('Error creating bucket, might already exist');
  }
}

const createBucketNotificationConfiguration = async () => {
  const response = await axios.get(`http://testable-lambda-example/arn`);
  console.log(`Lambda arn: ${JSON.stringify(response.data)}`);
  const {data: {arn}} = response;

  if(!arn) {
    console.log('No ARN was found for lambda while provisioning');
    return false;
  }

  await getS3Conn().putBucketNotificationConfiguration({
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
  await createBucketNotificationConfiguration();
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

  const json = {provision: "DONE"}
  res.set('Content-Type', 'application/json');
  res.send(json);
});

app.listen(port, () => {
	console.log(`Listening at ${port}`);
});
