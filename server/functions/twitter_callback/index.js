'use strict';

const twitterAPI = require('node-twitter-api');
const twitter = new twitterAPI({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callback: process.env.TWITTER_CALLBACK
});
const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});

exports.handler = (event, context, callback) => {
  const data = event.queryStringParameters;
  const oauth_token = data.oauth_token;
  const oauth_verifier = data.oauth_verifier;
  const roomID = data.matching_id;
  let isReservation = false;
  let reservationURL = "";
  fetchToken(oauth_token).then(function(dynamo) { 
    return accessToken(dynamo.Item.request_token, dynamo.Item.request_secret, oauth_verifier);
  }).then(function (token) {
    return userAuth(token, roomID);
  }).then((dataHash) => {
    const userID = data.userID;
    if (('Item' in dataHash) && (userID === dataHash.Item.userID1)) {
      console.log('user1');
      isReservation = dataHash.Item.userStatus2;
      reservationURL = dataHash.Item.reservationURL;
      return updateStatus('userStatus1', roomID);
    } else if (('Item' in dataHash) && (userID === dataHash.Item.userID2)) {
      console.log('user2');
      isReservation = dataHash.Item.userStatus2;
      reservationURL = dataHash.Item.reservationURL;
      return updateStatus('userStatus2', roomID);
    } else {
      console.log('user3');
      const response = {
        statusCode: 301,
        headers: {},
        body: '',
      };
      response.headers['location'] = `https://www.kamatte.cc/detail/?id=${roomID}&error=1`;
      callback(null, response);
    }
  }).then(() => {
    if (isReservation) {
      const response = {
        statusCode: 301,
        headers: {},
        body: '',
      };
      response.headers['location'] = reservationURL;
      callback(null, response);
    } else {
      const response = {
        statusCode: 301,
        headers: {},
        body: '',
      };
      response.headers['location'] = `https:\/\/www.kamatte.cc\/detail\/${roomID}`;
      callback(null, response);
    }
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
  const get_query = {
    TableName: 'twitter-session-dev',
    Key: {"request_token" : oauth_token}
  };
  return new Promise(function (resolve, reject) {
    dynamo.get(get_query, function(err, res){
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

function userAuth(token, roomID) {
  const twUserID = token.results.user_id
  return new Promise(function (resolve, reject) {
    var params = {
      TableName : 'matching-dev',
      Key: {
        'id': roomID
      }
    };
    console.log('params1');
    console.log(params);

    dynamo.get(params, function(err, data) {
      if (err){
        console.log(err);
        reject(err);
      } else {
        console.log('dataaaaa');
        console.log(data);
        resolve(data);
      }
    });
  });
}

function updateStatus(updateColumn, roomID) {
  const params = {
      TableName: 'matching-dev',
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
  console.log('params');
  console.log(params);

  return new Promise(function (resolve, reject) {
    dynamo.update(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(data);
        resolve();
      }
    });
  });
}

