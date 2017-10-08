'use strict';

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});

exports.handler = (event, context, callback) => {
  const data = event.queryStringParameters;
  const roomID = data.roomID - 0;

  getItem(roomID).then((item) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({matching: item}),
      headers: {
        "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
      }
    };
    callback(null, response);
  }).catch(function (error) {
    console.error('error');
    console.error(error);
    callback(null, {statusCode: 400, error: error});
  });
};

function getItem(roomID) {
  return new Promise(function (resolve, reject) {
    var params = {
      TableName : 'matching-dev',
      Key: {
        'id': roomID
      }
    };
    console.log('iiiiiiii');
    console.log(params);

    dynamo.get(params, function(err, data) {
      if (err){
        console.log(err);
        reject(err);
      } else {
        console.log('datiiiiiiii');
        console.log(data);
        resolve(data);
      }
    });
  });
}


