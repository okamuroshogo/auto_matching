'use strict';

const twitterAPI = require('node-twitter-api');
const twitter = new twitterAPI({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.COMSUMER_SECRET,
  callback: process.env.TWITTER_CALLBACK
});

exports.handler = (event, context, callback) => {
  const oauth_token = event.queryStringParameters.oauth_token;
  const oauth_verifier = event.queryStringParameters.oauth_verifier;
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: process.env.TESTMESSAGE,
      input: event,
    }),
  };

  fetchToken(oauth_token).then(function(dynamo) { 
    return accessToken(dynamo.Item.request_token, dynamo.Item.request_secret, oauth_verifier);
  }).then(function (token) {
    console.log('token');
    console.log(token);
    callback(null, response); 
  })
  .catch(function (error) {
    console.error('error');
    console.error(error);
    callback(null, {statusCode: 400, error: error});
  });
};

function accessToken(request_token, request_secret, oauth_verifier) {
  return new Promise(function (resolve, reject) {
    //twitter.getAccessToken(request_token, request_secret, oauth_verifier, function(err, accessToken, accessTokenSecret, results) {
    twitter.getAccessToken(request_token, request_secret, oauth_verifier, function(err, accessToken, accessTokenSecret) {
      if (err) {
        reject();
        return;
      }
      resolve({accessToken, accessTokenSecret});
    });
  });
}

function fetchToken(oauth_token) {
  const aws = require('aws-sdk');
  const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});
  const get_query = {
    TableName: 'twitter-session-dev',
    Key: {"request_token" : oauth_token}
  };

  return new Promise(function (resolve, reject) {
    dynamo.get(get_query, function(err,res){
      if (err || typeof res.Item === 'undefined'){
        console.error('err');
        console.error(err);
        reject();
        return;
      }
      resolve(res);
    });
  });
}
