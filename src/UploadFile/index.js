'use strict';

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

module.exports = async ({filename}) => {
  const s3Conn = await getS3Connection();

  await s3Conn.putObject({
    Key: filename,
    Bucket: process.env.BUCKET,
    Body: JSON.stringify({content: {filename, ds: Date.now()}})
  }).promise();
}
