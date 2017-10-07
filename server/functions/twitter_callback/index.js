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
  const oauth_token = event.queryStringParameters.oauth_token;
  const oauth_verifier = event.queryStringParameters.oauth_verifier;
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: process.env.TESTMESSAGE,
      input: event,
    }),
  };

  const data = event.queryStringParameters;
  const roomID = data.roomID - 0;
  fetchToken(oauth_token).then(function(dynamo) { 
    return accessToken(dynamo.Item.request_token, dynamo.Item.request_secret, oauth_verifier);
  }).then(function (token) {
    return userAuth(token, roomID);
  }).then((item) => {
    const userID = data.userID;
      console.log(userID);
      console.log(item.user_id1);
    if (userID === item.user_id1) {
      console.log('user1');
      return updateStatus('user_status1', roomID);
    } else if (userID === item.user_id2) {
      console.log('user2');
      return updateStatus('user_status2', roomID);
    } else {
      console.log('user3');
      const response = {
        statusCode: 200,
        body: JSON.stringify({message: 'ないぜーーー'})
      };
      callback(null, response);
    }
  }).then(() => {
      const response = {
        statusCode: 200,
        body: JSON.stringify({message: '成功'})
      };
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
        resolve(data.Item);
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
//      ExpressionAttributeNames: {
//        '#n': 'status'
//      },
//      UpdateExpression: "set #user =  :user",
 //     ExpressionAttributeValues:{
 //         `:${updateColumn}`: true
 //    },
      ReturnValues:"UPDATED_NEW"
  };
  
  params['ExpressionAttributeNames'] = {};
  params['ExpressionAttributeNames']['#b'] = `${updateColumn}`;
  params['ExpressionAttributeValues'] = {};
  params['ExpressionAttributeValues'][':status'] = true;
  params['UpdateExpression'] = 'SET #b = :status';
  console.log('params');
  console.log(params);

  
  dynamo.update(params, function (err, data) {
      if (err) {
          console.log(err);
      } else {
          console.log(data);
      }
  });
}
    //dynamo.put({
    //  TableName: 'twitter-profile-dev',
    //  Item:{
    //    uid : userID,
    //    screen_name : token.results.screen_name,
    //    secret : token.accessToken,
    //    token : token.accessTokenSecret
    //  },
    //   "ConditionExpression" : "attribute_not_exists(uid)"
    //}, function (err, result){
    //  if (err){
    //    console.log("There was a database error:");
    //    reject(err);
    //    return;
    //  }
    //  resolve();
    //});

