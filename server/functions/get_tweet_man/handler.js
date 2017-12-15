'use strict';

const aws = require('aws-sdk');
const moment = require("moment");
require('dotenv').config();
// aws.config.endpoint = new aws.Endpoint('http://localhost:8000'); // TODO
aws.config.region = 'ap-northeast-1';


// ここだけ、関数で違う
const targetWord = process.env.TARGET_WORD_MAN;
const gender = 1;


const dynamo = new aws.DynamoDB.DocumentClient();

const twitter = require('twitter');

const client = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});


const put = (tweetParams) => {
  return new Promise((resolve, reject) => {
    dynamo.put(tweetParams, (err) => {
      if (err) {
        console.error('dynamodb put error');
        console.error(err.message);
        reject(err)
      }
      resolve()
    });
  });
};

const isblacklist = (userID) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName : `twitter-user-black-lists-${process.env.STAGE}`,
      Key: {
        'userID': userID
      }
    };
    dynamo.get(params, (err, data) => {
      if (err) {
        console.error('dynamodb get error');
        console.error('dynamodb get error');
        console.error('dynamodb get error');
        console.error('dynamodb get error');
        console.error('dynamodb get error');
        console.error('dynamodb get error');
        console.error('dynamodb get error');
        console.error(err.message);
        // error getできなかったら成功
        resolve(false);
      }
      console.log('black lists data');
      console.log(data);
      if (('Item' in data) && data.Item.userID === userID) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};


const getTweet = () => {
  const stream = client.stream('statuses/filter', {track: targetWord});
  stream.on('data', function (event) {
    console.log(event.id_str);
    console.log(event.user.id_str);
    console.log(event.user.created_at);
    console.log(event.user.name);
    console.log(event.user.screen_name);
    console.log(event.user.profile_image_url);
    console.log(event.text);
    console.log("moment().add()");
    console.log(moment().add('days', 1).unix());
          
    isblacklist(event.user.id_str).then((isblack) => {
      if(event.text.indexOf('RT') === -1 || !isblack) {
        const tweetParams = {
          TableName: `tweets-${process.env.STAGE}`,
          Item: {
            tweetID: event.id_str,
            userID: event.user.id_str,
            createdAt: event.user.created_at,
            userName: event.user.name,
            userScreenName: event.user.screen_name,
            userImageUrl: event.user.profile_image_url,
            tweet: event.text,
            targetWord: targetWord,
            gender: gender, // 男なら１, 女なら２
            ttl: moment().add('days', 1).unix()
          }
        };
        put(tweetParams);
      }
    });
  });

  stream.on('error', function (error) {
    throw error;
  });
};


module.exports.getTweetMan = (event, context, callback) => {
  getTweet()
};

// getTweet();
