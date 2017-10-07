'use strict';

const twitterAPI = require('node-twitter-api');
const twitter = new twitterAPI({
  consumerKey: process.env.twitter_access,
  consumerSecret: process.env.twitter_secret,
  callback: process.env.twitter_callback
});

exports.handler = (event, context, callback) => {
  const oauth_token = event.queryStringParameters.oauth_token;
  const oauth_verifier = event.queryStringParameters.oauth_verifier;
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: process.env.test_message,
      input: event,
    }),
  };

  fetchToken(oauth_token).then(function(dynamo) { 
    return accessToken(dynamo.Item.request_token, dynamo.Item.request_secret, oauth_verifier);
  }).then(function (token){
    return sendDM(token.accessToken, token.accessTokenSecret)
  }).then(function () {
    callback.callback(null, response); 
  })
  .catch(function (error) {
    //console.error(error);
    callback(null, {statusCode: 400, error: error});
  });
};

function sendDM(accessToken, accessTokenSecret) {
  return new Promise(function (resolve, reject) {
    twitter.verifyCredentials(accessToken, accessTokenSecret, {}, function(err, data) {
    //twitter.verifyCredentials(accessToken, accessTokenSecret, {}, function(err, data, response) {
      if (err) {
        reject(err);
        return
      }
      twitter.direct_messages("new", {
        user_id: data.id,
        text: 'てすとおおおおおおおおおおおおおおおおおおおおおおおん'
      //}, accessToken, accessTokenSecret, function(error, dmData, response){
      }, accessToken, accessTokenSecret, function(error){
        if (error) { 
          reject(error);
          return;
        }
        resolve();
      });
    });
  });
}

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
    TableName: 'dev-test-troop-twitter',
    Key: {"request_token" : oauth_token}
  };

  return new Promise(function (resolve, reject) {
    dynamo.get(get_query, function(err,res){
      if (err || typeof res.Item === 'undefined'){
        reject();
        return;
      }
      resolve(res);
    });
  });
}
