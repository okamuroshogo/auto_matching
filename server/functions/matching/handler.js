'use strict';

const aws = require('aws-sdk');
require('dotenv').config();
// aws.config.endpoint = new aws.Endpoint('http://localhost:8000'); // TODO
aws.config.region = 'ap-northeast-1';


const dynamo = new aws.DynamoDB.DocumentClient();


const getUser = (gender) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: `tweets-${process.env.STAGE}`,
      FilterExpression: "#key = :key",
      ExpressionAttributeNames: {
        "#key": "gender"
      },
      ExpressionAttributeValues: {
        ":key": {"N": gender}
      },
      Limit: 1
    };
    dynamo.scan(params, (err, data) => {
      if (err) {
        console.error('dynamodb scan error');
        console.error(err.message);
        reject(err)
      }
      console.log(data);
      deleteUser(data.tweetID)
        .then(() => {
          resolve(data)
        })
    });
  });
};

const deleteUser = (tweetID) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: `tweets-${process.env.STAGE}`,
      Key: {
        tweetID: tweetID
      }
    };
    dynamo.delete(params, (err) => {
      if (err) {
        console.error('dynamodb delete error');
        console.error(err.message);
        reject(err)
      }
      resolve()
    });
  });
};


const createMatching = () => {
  Promise.all([1, 2].map((gender) => {
    return getUser(gender)
  }))
    .then((users) => {
      console.log(users);
    })
};


module.exports.createMatching = (event, context, callback) => {
  createMatching()
};

createMatching();
