'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3();
const fs = require('fs');
const uuid = require('uuid');
const exec = require('child_process').exec;
const request = require('request');
const apiUrl = `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${process.env.HOT_API_KEY}&large_area=Z011&format=json`;


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



const checkReservation = (id) => {
  return new Promise((resolve, reject) => {
    const reservationUrl = `https://www.hotpepper.jp/str${id}/yoyaku`;
    console.log(reservationUrl);
    request.get({url: reservationUrl, followRedirect: false}, (err, res, data2) => {
      console.log(res.statusCode);
      if (res.statusCode === 200) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
};

const searchShop = () => {
  return new Promise((resolve, reject) => {
    request.get(apiUrl, (err, data) => {
      if (err) {
        console.log(err);
      }
      const body = JSON.parse(data.body);
      const shop = body.results.shop[getRandomInt(0, 9)];
      checkReservation(shop.id).then((hasReservation) => {
        if (hasReservation) {
          resolve(shop)
        }
        else {
          resolve(body.results.shop[getRandomInt(0, 9)])
        }
      })
    })
  })
};


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

const create = (params) => {
  return new Promise((resolve, reject) => {
    dynamo.put(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
        return
      }
      resolve()
    })
  })
};


const createMatching = () => {
  Promise.all([1, 2].map((gender) => {
    return getUser(gender)
  }))
    .then((users) => {
      console.log('users');
      console.log(users);
      console.log('users');

      searchShop().then((shop) => {

        const params = {
          TableName: `matching-${process.env.STAGE}`,
          Item: {
            id: uuid.v4(),
            userID1: users[0].userID,
            userID2: users[1].userID,
            tweetID1: users[0].tweetID,
            tweetID2: users[1].tweetID,
            screenName1: users[0].userScreenName,
            screenName2: users[1].userScreenName,
            userImageUrl1: users[0].userImageUrl,
            userImageUrl2: users[1].userImageUrl,
            userStatus1: 0,
            userStatus2: 0,
            shopName: shop.name,
            shopUrl: shop.urls.pc,
            shopReservationUrl: `https://www.hotpepper.jp/str${shop.id}/yoyaku`,
            shopAddress: shop.address,
          }
        };


        create(params).then(() => {

        });



      });

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
