'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3();
require('dotenv').config();

const fs = require('fs');
const uuid = require('uuid');
const request = require('request');
const apiUrl = `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${process.env.HOT_API_KEY}&large_area=Z011&format=json`;
const Jimp = require('jimp');

const twitter = require('twitter');

const client = new twitter({
  consumer_key: process.env.CONSUMER_KEY2,
  consumer_secret: process.env.CONSUMER_SECRET2,
  access_token_key: process.env.ACCESS_TOKEN_KEY2,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET2
});


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

    userImage1 = userImage1.replace('normal', 'bigger');
    userImage2 = userImage2.replace('normal', 'bigger');

    Jimp.read(__dirname + '/baseImage.png').then(function (base) {

      Jimp.read(userImage1).then(function (image1) {
        Jimp.read(userImage2).then(function (image2) {
          Jimp.read(__dirname + '/kareshi.png').then(function (kareshi) {
            Jimp.read(__dirname + '/kanojo.png').then(function (kanojo) {
              image1.scale(2.5, () => {
                image2.scale(2.5, () => {
                  base.composite(kareshi, 150, 500)
                    .composite(kanojo, 700, 500)
                    .composite(image1, 200, 200)
                    .composite(image2, 800, 200)
                    .write(fileName, () => {
                      console.log(fileName);
                      resolve(fileName);
                    });

                });
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
      Key: `ogp/${fileName.replace('/tmp/', '')}`,
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
      resolve(data.Items[0]);
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


const postTweet = (matching) => {
  console.log('-----------------matching---------------');
  console.log(matching);
  console.log('-----------------matching---------------');

  return new Promise((resolve, reject) => {
    console.log('matching.ScreenName1');
    console.log(matching.screenName1);
    console.log('matching.ScreenName2');
    console.log(matching.screenName2);

    let toUser = `@${matching.screenName1} @${matching.screenName2}`;
    console.log(toUser);
    // toUser = `@okaignishon`; // TODO 消す

    const shareUrl = `https://www.kamatte.cc/share/${matching.id}`;

    // TODO　コミットしない
    client.post('statuses/update',
      // {status: `${toUser} \n【お店をご用意しました！】\n\nあなたの過去のツイートより勝手にマッチングし、お店もご用意させていただきました！🎉🎉\n\n ${shareUrl} #kamatte_cc`},
      {status: `${toUser} \n【お店をご用意しました！】\n\n\n\n只今、いいとものデモでマッチングしています。 ${shareUrl}`},
      function (error, tweet, response) {
        if (error) {
          console.log(error);
          reject(error)
        }
        resolve()
      })
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
            userGender1: users[0].gender,
            userGender2: users[1].gender,
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

        if (param.Item.userID1 === param.Item.userID2) {
          throw new Error("ユーザネームが一緒エラー")
        }

        createImage(params.Item.userImageUrl1, params.Item.userImageUrl2, params.Item.id).then((fileName) => {
          uploadImage(fileName).then((ogpUrl) => {
            params.Item["ogpUrl"] = ogpUrl;
            create(params).then(() => {
              postTweet(params.Item).then(() => {
                deleteUser({
                  gender: params.Item.userGender1,
                  tweetID: params.Item.tweetID1
                })
                  .then(() => {
                    deleteUser({
                      gender: params.Item.userGender2,
                      tweetID: params.Item.tweetID2
                    }).then(() => {

                    })
                  })
              })
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
