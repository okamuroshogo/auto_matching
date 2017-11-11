'use strict';
require('dotenv').config();

const twitterAPI = require('node-twitter-api');
const twitter = new twitterAPI({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callback: process.env.TWITTER_CALLBACK
});
const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});

exports.handler = (event, context, callback) => {
  const qs = event.queryStringParameters;
  const userID = qs && qs.user_id;
  const roomID = qs && qs.matching_id;
  const oauth_token = qs.oauth_token;
  const oauth_verifier = qs.oauth_verifier;
  fetchToken(oauth_token).then(function(dynamo) { 
    return accessToken(dynamo.Item.request_token, dynamo.Item.request_secret, oauth_verifier);
  }).then((token) => {
    return putUser(token, roomID);
  }).then(() => {
    const expire = new Date();
    expire.setYear(expire.getFullYear() + 1);
    const response = {
        statusCode: 302,
        headers: {
          'Location': `https://kamatte.cc/detail/?id=${roomID}&callback=true`,
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
          "Cookie": `user_id=${userID}; domain=kamatte.cc; expires=${expire.toUTCString()};"`
        },
        body: "",
        "Cookie": `user_id=${userID}; domain=kamatte.cc; expires=${expire.toUTCString()};"`
    };
    console.log('responseseeeeeeee');
    console.log(response);
    callback(null, response);
  }).catch(function (error) {
    console.error('error');
    console.error(error);
    callback(null, {statusCode: 400, error: error});
  });
};

function accessToken(request_token, request_secret, oauth_verifier) {
  return new Promise(function (resolve, reject) {
    twitter.getAccessToken(request_token, request_secret, oauth_verifier, function(err, accessToken, accessTokenSecret, results) {
      console.log('results');
      console.log(results);
      if (err) {
        reject(err);
        return;
      }
      resolve({accessToken, accessTokenSecret, results});
    });
  });
}

function fetchToken(oauth_token) {
  const getQuery = {
    TableName: `twitter-session-${process.env.STAGE}`,
    Key: {"request_token" : oauth_token}
  };
  return new Promise(function (resolve, reject) {
    dynamo.get(getQuery, function(err, res){
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

function putUser(tokenHash, roomID) {
  const userID = tokenHash.results.user_id;
  const putQuery = {
    TableName: `users-${process.env.STAGE}`,
    Item:{
      twiid: userID,
      roomID: roomID,
      accessToken : tokenHash.accessToken,
      accessTokenSecret : tokenHash.accessTokenSecret
    }
  };
  console.log(putQuery);
  return new Promise((resolve, reject) => {
    dynamo.put(putQuery, (err) => {
      if (err){
        console.log(err);
        reject();
        return;
      }
      resolve(tokenHash);        
    }); 
  });
}


