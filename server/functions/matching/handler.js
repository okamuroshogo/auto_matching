'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3();
const fs = require('fs');
const uuid = require('uuid');
const request = require('request');
const apiUrl = `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${process.env.HOT_API_KEY}&large_area=Z011&format=json`;
const Jimp = require('jimp');


require('dotenv').config();
// aws.config.endpoint = new aws.Endpoint('http://localhost:8000'); // TODO
aws.config.region = 'ap-northeast-1';


const dynamo = new aws.DynamoDB.DocumentClient();


const createImage = (userImage1, userImage2, uuid) => {
  return new Promise((resolve, reject) => {
    const fileName = `/tmp/${uuid}.png`; // 書き込み可能なのは/tmp以下だけ、かつ名前重複でエラー起きるので重複できないようにする。
    console.log('-----------------start---------------------');
    console.log(userImage1, userImage2, uuid);
    console.log('-----------------start---------------------');

    console.log(fileName);
    console.log(__dirname + '/baseImage.png');

    Jimp.read(__dirname + '/baseImage.png').then(function (base) {

      Jimp.read(userImage1).then(function (image1) {
        Jimp.read(userImage2).then(function (image2) {
          Jimp.read(__dirname + '/kareshi.png').then(function (kareshi) {
            Jimp.read(__dirname + '/kareshi.png').then(function (kanojo) {
              base.composite(kareshi, 0, 0)
                .composite(kanojo, 0, 30)
                .composite(image1, 0, 60)
                .composite(image2, 0, 90)
                .write(fileName, () => {
                  console.log(fileName);
                  resolve(fileName);
                });
            })
          })
        })
      })
    }).catch(function (err) {
      console.error(err);
    });
  });
};


const uploadImage = (fileName) => {
  return new Promise((resolve, reject) => {
    // s3.putObject({
    s3.upload({
      Bucket: `${process.env.OGP_BUCKET_NAME}`,
      Key: fileName.replace('/tmp/', ''),
      Body: fs.createReadStream(fileName),
      ContentType: 'image/png',
      ACL: 'public-read'
    }, (ex, data) => {
      if (ex) {
        reject(ex);
        return;
      }
      console.log(data);
      console.log(data.Location);
      resolve(data.Location);
    });
  });
};


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
        console.log('-------------searchShop----------------');

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
            shopImageUrl: shop.photo.pc.l,
            shopReservationUrl: `https://www.hotpepper.jp/str${shop.id}/yoyaku`,
            shopAddress: shop.address,
          }
        };

        createImage(params.Item.userImageUrl1, params.Item.userImageUrl1, params.Item.id).then((fileName) => {
          uploadImage(fileName).then((ogpUrl) => {
            params.Item["ogpUrl"] = ogpUrl;
            create(params).then(() => {

            }).catch((err) => {
              console.log('---------createError------');

              console.log(err);
            });
          }).catch((err) => {
            console.log('---------uploadImageError------');

            console.log(err);
          });
        }).catch((err) => {
          console.log('---------createImageError------');

          console.log(err);
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

// createMatching();
