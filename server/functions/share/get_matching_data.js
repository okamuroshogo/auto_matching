'use strict';

require('dotenv').config();

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});

const stage = process.env.stage;

function getItemById(id) {
  const params = {
    Key: {
     'id': {
       S: id
      }
    }, 
    TableName: `matching-${stage}`
  };
  return new Promise((resolve, reject) => {
    dynamo.getItem(params, (err, data) => {
      if (err) {
        console.error('dynamodb get error');
        console.error(err.message);
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

module.exports = getItemById;
