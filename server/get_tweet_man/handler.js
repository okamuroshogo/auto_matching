'use strict';

const aws = require('aws-sdk');
// aws.config.endpoint = new aws.Endpoint('http://localhost:8000'); // TODO
aws.config.region = 'ap-northeast-1';


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
        reject()
      }
      resolve()
    });
  });
};

module.exports.getTweetMan = (event, context, callback) => {

  client.stream('statuses/filter', {track: '彼女欲しい'}, stream => {
    stream.on('data', event => {
      console.log(event.id);
      console.log(event.user.id);
      console.log(event.user.created_at);
      console.log(event.user.name);
      console.log(event.user.screen_name);
      console.log(event.user.profile_image_url);
      console.log(event.text);

      const tweetParams = {
        TableName: `Tweets-${process.env.STAGE}`,
        Item: {
          tweet_id: event.id,
          user_id: event.user.id,
          created_at: event.user.created_at,
          user_name: event.user.name,
          user_screen_name: event.user.screen_name,
          user_image_url: event.user.profile_image_url,
          tweet: event.text,
          gender: 1 // 男なら１, 女なら２
        }
      };
      put(tweetParams).then()
    });

    stream.on('error', function (error) {
      throw error;
    });
  });
};
