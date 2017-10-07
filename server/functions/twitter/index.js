'use strict';

const aws         = require('aws-sdk');
//const querystring = require('querystring');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});
const twitterAPI = require('node-twitter-api');
const twitter = new twitterAPI({
  consumerKey: process.env.twitter_access,
  consumerSecret: process.env.twitter_secret,
  callback: process.env.twitter_callback
});

exports.handler = (event, context, callback) => {
  twitterRequestToken().then(function(tokenHash) {
    return putToken(tokenHash); 
  }).then(function(requestToken) {
    const response = {
      statusCode: 302,
      headers: {
        'Location': twitter.getAuthUrl(requestToken)
      }
    };
    callback(null, response);
  }).catch(function(error) {
    //console.log('errror twitter token');
    callback(null, {statusCode: 400, error: error});
  });
};

function twitterRequestToken() {
  return new Promise(function (resolve, reject) {
    //twitter.getRequestToken((error, requestToken, requestTokenSecret, results) => {
    twitter.getRequestToken((error, requestToken, requestTokenSecret) => {
      if (error) {
        //console.log(error);
        reject(error);
        return;
      } 
      resolve({requestToken, requestTokenSecret});
    });
  });
}

function putToken(tokenHash) {
  return new Promise(function (resolve, reject) {
    dynamo.put({
      //FIXME: 
      TableName: 'dev-test-troop-twitter',
      Item:{
        request_token : tokenHash.requestToken,
        request_secret : tokenHash.requestTokenSecret
        //follow : JSON.parse(querystring.parse(event['body-json']).follow)
      }
    },  function(err){
    //},  function(err, res){
      if (err){
        //console.log(err);
        reject();
        return;
      }
      resolve(tokenHash.requestToken);        
    }); 
  });
}
