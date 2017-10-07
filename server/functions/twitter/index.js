'use strict';

require('dotenv').config();
const aws         = require('aws-sdk');
//const querystring = require('querystring');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});
const twitterAPI = require('node-twitter-api');
let twitter;

exports.handler = (event, context, callback) => {
  console.log('process.env');
  console.log(process);
  console.log(event);
  console.log(context);
  twitter = new twitterAPI({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callback: `https:\/\/${event.headers.Host}/dev/twitter/callback?userID=1234&roomID=4321`
  });
  console.log('twitter');
  console.log(twitter);
  twitterRequestToken().then(function(tokenHash) {
    console.log(tokenHash);
    return putToken(tokenHash); 
  }).then(function(requestToken) {
    console.log('requestToken');
    console.log(requestToken);
    const response = {
      statusCode: 302,
      headers: {
        'Location': twitter.getAuthUrl(requestToken)
      }
    };
    console.log('response');
    console.log(response);
    callback(null, response);
  }).catch(function(error) {
    console.log('errror twitter token');
    callback(null, {statusCode: 400, error: error});
  });
};

function twitterRequestToken() {
  return new Promise(function (resolve, reject) {
    //twitter.getRequestToken((error, requestToken, requestTokenSecret, results) => {
    twitter.getRequestToken((error, requestToken, requestTokenSecret) => {
      if (error) {
        console.log(error);
        reject(error);
        return;
      } 
      resolve({requestToken, requestTokenSecret});
    });
  });
}

function putToken(tokenHash) {
  return new Promise(function (resolve, reject) {
    console.log('tokenHash');
    console.log(tokenHash);
    dynamo.put({
      TableName: `twitter-session-dev`,
      Item:{
        request_token : tokenHash.requestToken,
        request_secret : tokenHash.requestTokenSecret
        //follow : JSON.parse(querystring.parse(event['body-json']).follow)
      }
    },  function(err){
    //},  function(err, res){
      if (err){
        console.log(err);
        reject();
        return;
      }
      resolve(tokenHash.requestToken);        
    }); 
  });
}
