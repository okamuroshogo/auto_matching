'use strict';

const aws = require('aws-sdk');
require('dotenv').config();
// aws.config.endpoint = new aws.Endpoint('http://localhost:8000'); // TODO
aws.config.region = 'ap-northeast-1';



// ここだけ、関数で違う
const targetWord = process.env.TARGET_WORD_WOMAN;
const gender = 2;


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


const getTweet = () => {
  const stream = client.stream('statuses/filter', {track: targetWord});
  stream.on('data', function (event) {
    console.log(event.id);
    console.log(event.user.id);
    console.log(event.user.created_at);
    console.log(event.user.name);
    console.log(event.user.screen_name);
    console.log(event.user.profile_image_url);
    console.log(event.text);

    const tweetParams = {
      TableName: `tweets-${process.env.STAGE}`,
      Item: {
        tweetID: event.id,
        userID: event.user.id,
        createdAt: event.user.created_at,
        userName: event.user.name,
        userScreenName: event.user.screen_name,
        userImageUrl: event.user.profile_image_url,
        tweet: event.text,
        gender: gender // 男なら１, 女なら２
      }
    };
    put(tweetParams).then()
  });

  stream.on('error', function (error) {
    throw error;
  });
};

// TODO ここも男女で違う
module.exports.getTweetWoman = (event, context, callback) => {
  getTweet()
};

getTweet();
