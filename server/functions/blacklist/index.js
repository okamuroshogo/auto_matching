'use strict';

require('dotenv').config();
const aws         = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});
const twitterAPI = require('node-twitter-api');
const moment = require('moment-timezone')
let twitter;

const createResponse = (statusCode, body) => (
  {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  }
);

exports.handler = (event, context, callback) => {
  const json = JSON.parse(event.body);
  console.log('json');
  console.log(json);
  const roomID = (json && json.matching_id);
  const userID = (json && json.user_id) || '';

  twitter = new twitterAPI({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callback: `${process.env.TWITTER_CALLBACK}?matching_id=${roomID}&user_id=${userID}&type=3`
  });

  Promise.resolve().then(function(){
    console.log('userID');
    console.log(userID);
    //if (!userID) {  
    if (userID == 'undefined' || !userID) {
      return new Promise(function(fulfilled, rejected){
        twitterRequestToken().then((tokenHash) => {
          return putToken(tokenHash); 
        }).then((requestToken) => {
          const response = {
            success: true,
            login: false,
            'location': twitter.getAuthUrl(requestToken)
          };
          console.log('responseseeeeeeee');
          console.log(response);
          fulfilled(response); 

          console.log('ok! token');
          //callback(null, createResponse(200, response));
          return;
        }).catch((error) => {
          rejected(error);
        });
      });
    } else {
      return new Promise(function(fulfilled, rejected){
        console.log('black list put');
        console.log('userID');
        console.log(userID);
        putUser(userID).then(() => {
          fulfilled();
        }).catch((error) => {
          rejected(error); 
        });
      });
    }
  }).then((response) => {
    callback(null, createResponse(200, response));
  }).catch((error) => {
    console.log("error400");
    console.log(error);
    callback(null, createResponse(400, {Message: error.message}));
  });
};

function twitterRequestToken() {
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
    console.log('tokenHash');
    console.log(tokenHash);
    dynamo.put({
      TableName: `twitter-session-${process.env.STAGE}`,
      Item:{
        request_token : tokenHash.requestToken,
        request_secret : tokenHash.requestTokenSecret
        //follow : JSON.parse(querystring.parse(event['body-json']).follow)
      }
    },  (err) => {
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

function putUser(twUserID) {
  return new Promise((resolve, reject) => {
    dynamo.put({
      TableName : `twitter-user-black-lists-${process.env.STAGE}`,
      Item:{
        userID : twUserID
      }
    }, (err) => {
      if (err){
        console.log(err);
        reject();
        return;
      }
      resolve();
    }); 
  });
}


