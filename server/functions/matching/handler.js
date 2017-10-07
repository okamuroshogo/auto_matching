'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3();
const fs = require('fs');
const uuid = require('uuid');
const exec = require('child_process').exec;


require('dotenv').config();
// aws.config.endpoint = new aws.Endpoint('http://localhost:8000'); // TODO
aws.config.region = 'ap-northeast-1';


const dynamo = new aws.DynamoDB.DocumentClient();


const getUser = (gender) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: `tweets-${process.env.STAGE}`,
      KeyConditionExpression: "#key = :key",
      ExpressionAttributeNames: {
        "#key": 'gender'
      },
      ExpressionAttributeValues: {
        ":key": gender
      },
      Limit: 1
    };
    dynamo.query(params, (err, data) => {
      if (err) {
        console.error('dynamodb scan error');
        console.error(err.message);
        reject(err);
        return
      }

      if (data.Count == 0) {
        console.log(data);
        reject(params);
        return
      }

      deleteUser(data.Items[0])
        .then(() => {
          resolve(data.Items[0])
        })
    });
  });
};

const deleteUser = (user) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: `tweets-${process.env.STAGE}`,
      Key: {
        gender: user.gender,
        tweetID: user.tweetID
      }
    };
    dynamo.delete(params, (err) => {
      if (err) {
        console.error('dynamodb delete error');
        console.error(err.message);
        reject(err)
      }
      resolve()
    });
  });
};

const createImage = (user_image1, user_image2, matching_reasons) => {
  return new Promise((resolve, reject) => {
    const dir = `/tmp/${uuid.v4()}`; // 書き込み可能なのは/tmp以下だけ、かつ名前重複でエラー起きるので重複できないようにする。
    const options = [
      "-size 300x300", // 画像のサイズ。変更元をxc:whiteにしているため必要
      "-font ipam.ttf", // TrueTypeFontファイルへのパス。好きなフォントのTTFを使えばよろし。
      "-pointsize 24", // 文字サイズ
      '-fill "#000000"', // 文字色
      "-gravity center", // 文字の基準位置
      `-annotate +0+0 "${matching_reasons.join(',')}"` // 文字。基準位置(もしくは左上)からの位置を調整できる。
    ];
    exec(`mkdir ${dir} && convert ${options.join(" ")} xc:white ${dir}/image.png`, (err, stdout, stderr) => {
      if (err) {
        callback(stderr.split("\n"));
        return;
      }
      s3.putObject({
        Bucket: "",
        Key: "",
        Body: fs.createReadStream(`${dir}/image.png`),
        ContentEncoded: 'base64',
        ContentType: 'image/png'
      }, (ex) => {
        if (ex) {
          callback(ex);
          return;
        }
        callback(null, "success");
      });
    });
  });
};


const createMatching = () => {
  Promise.all([1, 2].map((gender) => {
    return getUser(gender)
  }))
    .then((users) => {
      console.log('users');
      console.log(users);
      console.log('users');
    })
    .catch((err) => {
      console.log('catch error');
      console.log(err);
      console.log('catch error');
    })
};


module.exports.createMatching = (event, context, callback) => {
  createMatching()
};

createMatching();
