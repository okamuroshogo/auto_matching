'use strict';

require('dotenv').config();
const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});
const twitterAPI = require('node-twitter-api');
let twitter;
let reservationURL = "";

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
    callback: `${process.env.TWITTER_CALLBACK}?matching_id=${roomID}&user_id=${userID}`
  });

  Promise.resolve().then(function () {
    //if (!userID) {  
    if (userID == 'undefined' || !userID) {
      return new Promise(function (fulfilled, rejected) {
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
      return new Promise(function (fulfilled, rejected) {
        console.log('userID');
        console.log(userID);
        console.log('roomID');
        console.log(roomID);
        getUser(userID, roomID).then((dataHash) => {
          if (!('Item' in dataHash)) {
            rejected('Item in dataHash');
            return;
          }
          reservationURL = dataHash.Item.shopReservationUrl;
          console.log('dataHash');
          console.log(dataHash);
          if (userID === dataHash.Item.userID1) {
            console.log('userID === dataHash.Item.userID1');
            if (!dataHash.Item.userStatus2) {
              console.log('!dataHash.Item.userStatus2');
              rejected('!dataHash.Item.userStatus2');
              return;
            }
            return updateStatus('userStatus1', roomID);
          } else if (userID === dataHash.Item.userID2) {
            console.log('userID === dataHash.Item.userID2');
            if (!dataHash.Item.userStatus1) {
              console.log('!dataHash.Item.userStatus1');
              rejected('!dataHash.Item.userStatus1');
              return;
            }
            return updateStatus('userStatus2', roomID);
          } else {
            const response = {
              success: false,
              error: 1
            };
            fulfilled(response);
            return;
          }
        }).then(() => {
          return getUser(userID, roomID);
        }).then((dataHash) => {
          const isReservation1 = dataHash.Item.userStatus1;
          const isReservation2 = dataHash.Item.userStatus2;
          if (isReservation1 && isReservation2) {
            const response = {
              success: true,
              reservation_url: reservationURL
            };
            fulfilled(response);
          } else {
            rejected('end');
          }
        });
      });
    }
  }).then((response) => {
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
      Item: {
        request_token: tokenHash.requestToken,
        request_secret: tokenHash.requestTokenSecret
        //follow : JSON.parse(querystring.parse(event['body-json']).follow)
      }
    }, (err) => {
      //},  function(err, res){
      if (err) {
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
      TableName: `matching-${process.env.STAGE}`,
      Key: {
        'id': roomID
      },
      ConsistentRead: true
    };

    dynamo.get(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function updateStatus(updateColumn, roomID) {
  console.log('updateStatus');
  const params = {
    TableName: `matching-${process.env.STAGE}`,
    Key: {
      id: roomID
    },
    ReturnValues: "UPDATED_NEW"
  };
  console.log(params);


  params['ExpressionAttributeNames'] = {};
  params['ExpressionAttributeNames']['#b'] = `${updateColumn}`;
  params['ExpressionAttributeValues'] = {};
  params['ExpressionAttributeValues'][':status'] = true;
  params['UpdateExpression'] = 'SET #b = :status';

  console.log(params);
  console.log('params');


  return new Promise(function (resolve, reject) {
    dynamo.update(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log('updateStatus put success!');
        resolve();
      }
    });
  });
}

