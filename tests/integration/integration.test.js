'use strict';

const axios = require('axios');
const {promisify} = require('util');
const AWS = require('aws-sdk');
const moment = require('moment');

const sleep = promisify(setTimeout);

let maxAttemptsWaitForInfra = 5;
const waitForInfra = async () => {
  const retry = async () => {
    if(maxAttemptsWaitForInfra === 0) {
      throw new Error('WAIT_FOR_INFRA: Timeout');
    }
    console.log('infra not ready, retrying in 5 secs');
    await sleep(5000);
    await waitForInfra();
    maxAttemptsWaitForInfra -= 1;
  }

  const {data} = await axios.get('http://localstack:4566/health');

  if(!data) {
    await retry();
  }

  const {services: {s3, lambda}} = data;

  if(s3 !== 'running' && lambda !== 'running') {
    await retry();
  }
};

let S3;
const getS3Connection = () => {
  if(S3) {
    return S3;
  }

  S3 = new AWS.S3({
    accessKeyId: 'foo',
    secretAccessKey: 'bar',
    s3ForcePathStyle: true,
    endpoint: new AWS.Endpoint('http://localstack:4566')
  });

  return S3;
};

const getObjectGracefully = async ({Bucket, Key}) => {
  try {
    return await getS3Connection().getObject({Bucket, Key}).promise();
  } catch(error) {
    console.log(error);
    // we don't care
  }
};


describe('microservice', () => {
  jest.setTimeout(60000);

  beforeAll(async () => {
    await waitForInfra();
    await axios.put('http://provisioning/provision');
  });

  describe('tests', () => {
    beforeAll(async () => {
      await axios.post('http://microservice/uploadFile?filename=blahonga');
    });

    it('should have a backup file in S3', async () => {
      const date = moment().format('YYYY/MM/DD');
      let retries = 5;
      let backupObject;
      while(retries > 0 && !backupObject) {
        backupObject = await getObjectGracefully({Bucket: process.env.DEST_BUCKET, Key: `${date}/blahonga`});
        await sleep(5000);
        retries -= 1;
      }

      expect(backupObject).toBeDefined();
    });
  });
});
