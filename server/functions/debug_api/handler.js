'use strict';

const aws = require('aws-sdk');
require('dotenv').config();

aws.config.region = 'ap-northeast-1';


// ここだけ、関数で違う
const targetWord = process.env.TARGET_WORD_WOMAN;
const targetWord2 = process.env.TARGET_WORD_MAN;



const dynamo = new aws.DynamoDB.DocumentClient();


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


// TODO ここも男女で違う
module.exports.create = (event, context, callback) => {
  const tweetParams1 = {
    TableName: `tweets-${process.env.STAGE}`,
    Item: {
      tweetID: "929300676135419904",
      userID: "893286010494242816",
      createdAt: "Fri Aug 04 01:42:36 +0000 2017",
      userName: '_serinuntius',
      userScreenName: '_serinuntius',
      userImageUrl: "http://pbs.twimg.com/profile_images/893287715831111681/pAKX7FV9_normal.jpg",
      tweet: "上映会\n\n#kamatte_w",
      targetWord: targetWord,
      gender: 1 // 男なら１, 女なら２
    }
  };

  const tweetParams2 = {
    TableName: `tweets-${process.env.STAGE}`,
    Item: {
      createdAt: "Sat Dec 06 05:48:22 +0000 2014",
      gender: 2,
      tweet: "ツイートテスト\n#kamatte_w",
      tweetID: "928975279543824385",
      userID: "2920271672",
      userImageUrl: "http://pbs.twimg.com/profile_images/837534598523301889/dRhYxxM7_normal.jpg",
      userName: "okamu-",
      userScreenName: "okaignishon",
      targetWord: targetWord2,
    }
  };


  put(tweetParams1)
    .then(()=> {
      return put(tweetParams2)
    })
    .then(()=> {
      callback(null,'ok')
    })

};

// getTweet();
