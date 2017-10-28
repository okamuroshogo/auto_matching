'use strict';

require('dotenv').config();

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'us-east-1'});

const stage = process.env.STAGE;

function getItemById(id) {
  const params = {
    Key: {
     'id': id
    }, 
    TableName: `matching-${stage}`
    //TableName: `matching-dev`
  };
  return new Promise((resolve, reject) => {
    dynamo.get(params, (err, data) => {
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
