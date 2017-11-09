'use strict';

const aws = require('aws-sdk');
require('dotenv').config();
// aws.config.endpoint = new aws.Endpoint('http://localhost:8000'); // TODO
aws.config.region = 'ap-northeast-1';



// ここだけ、関数で違う
const targetWord = process.env.TARGET_WORD_WOMAN;
const targetWord2 = process.env.TARGET_WORD_MAN;
const gender = 2;


const dynamo = new aws.DynamoDB.DocumentClient();

const twitter = require('twitter');

const client = new twitter({
  consumer_key: process.env.CONSUMER_KEY2,
  consumer_secret: process.env.CONSUMER_SECRET2,
  access_token_key: process.env.ACCESS_TOKEN_KEY2,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET2
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
        gender: gender // 男なら１, 女なら２
      }
    };
    if (event.text.indexOf(targetWord2) === -1) {
      put(tweetParams).then()
    }
  });

  stream.on('error', function (error) {
    throw error;
  });
};

// TODO ここも男女で違う
module.exports.getTweetWoman = (event, context, callback) => {
  getTweet()
};

// getTweet();
