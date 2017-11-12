'use strict';

require('dotenv').config();
const aws         = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});
const twitterAPI = require('node-twitter-api');
let twitter;
let reservationURL = "";

const twitterClient = require('twitter');
const client = new twitterClient({
  consumer_key: process.env.CONSUMER_KEY2,
  consumer_secret: process.env.CONSUMER_SECRET2,
  access_token_key: process.env.ACCESS_TOKEN_KEY2,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET2
});

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
  //const matchingID = event.path.split('/').pop();

  const json = JSON.parse(event.body);
  console.log('json');
  console.log(json);
  const roomID = (json && json.matching_id);
  const userID = (json && json.user_id);

  twitter = new twitterAPI({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callback: `${process.env.TWITTER_CALLBACK}?matching_id=${roomID}&user_id=${userID}`
  });

  Promise.resolve().then(function(){
    if (!userID) {  
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
        }).catch((error) => {
          rejected(error);
        });
      });
    } else {
      return new Promise((fulfilled, rejected) => {
        console.log('userID');
        console.log(userID);
        console.log('roomID');
        console.log(roomID);
        getUser(userID, roomID).then((dataHash) => {
          if (!('Item' in dataHash)) { return; }
          reservationURL = dataHash.Item.shopReservationUrl;
          console.log('dataHash');
          console.log(dataHash);
          return updateStatus('complete', roomID);
        }).then(() => {
          return updateStatus('userStatus1', roomID);
        }).then(() => {
          return updateStatus('userStatus2', roomID);
        }).then(() => {
          return getUser(userID, roomID);
        }).then((dataHash) => {
          const toUser = `@${dataHash.Item.screenName1} @${dataHash.Item.screenName2}`;
          const shareUrl = dataHash.Item.ogpUrl;
          client.post('statuses/update',
            {status: `${toUser} \n【予約が確定されました】\n\n\n\n只今、デモです。\nおめでとうございます！！予約が確定したみたいです。楽しいひと時をお過ごしください！ ${shareUrl}`},
            function (error, tweet, response) {
              if (error) {
                console.log(error);
                rejected(error);
                return;
              }
              fulfilled();
          });
        });
      });
    }
  }).then(() => {
    const response = {
      success: true
    };
    callback(null, createResponse(200, response));
  }).catch((error) => {
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

function getUser(twUserID, roomID) {
  return new Promise((resolve, reject) => {
    var params = {
      TableName : `matching-${process.env.STAGE}`,
      Key: {
        'id': roomID
      },
      ConsistentRead: true
    };

    dynamo.get(params, (err, data) => {
      if (err){
        console.log(err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function updateStatus(updateColumn, roomID) {
  const params = {
      TableName: `matching-${process.env.STAGE}`,
      Key:{
        id: roomID
      },
      ReturnValues:"UPDATED_NEW"
  };
  
  params['ExpressionAttributeNames'] = {};
  params['ExpressionAttributeNames']['#b'] = `${updateColumn}`;
  params['ExpressionAttributeValues'] = {};
  params['ExpressionAttributeValues'][':status'] = true;
  params['UpdateExpression'] = 'SET #b = :status';

  return new Promise(function (resolve, reject) {
    dynamo.update(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

