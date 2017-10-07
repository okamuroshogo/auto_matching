'use strict';

const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB();

exports.handler = (event, context, callback) => {
  descItem().then((count) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({count: count})
    };
    callback(null, response);
  }).catch(function (error) {
    console.error('error');
    console.error(error);
    callback(null, {statusCode: 400, error: error});
  });
};

function descItem() {
  return new Promise(function (resolve, reject) {
    const params = {
      TableName: 'matching-dev'
    };
    dynamodb.describeTable(params, (err, data) => {
      if (err){
        console.log(err);
        reject(err);
      } else {
        console.log('datiiiiiiii');
        console.log(data);
        resolve(data.Table.ItemCount);
      }
    });
  });
}


