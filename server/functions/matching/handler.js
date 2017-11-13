'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3();
require('dotenv').config();

const fs = require('fs');
const uuid = require('uuid');
const request = require('request');
const apiUrl = `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${process.env.HOT_API_KEY}&large_area=Z011&format=json`;
const gurunabiURL = process.env.GURUNABI_API_URL;

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

const getImageFromText = (text) => {
  return new Promise((resolve, reject) => {
    const apiURL = process.env.API_URL + encodeURIComponent(text);
    console.log(apiURL);

    request.get(apiURL, (err, res, body) => {
      if (err) {
        console.log('-------------getImageFromText-------------');
        console.log(err);
        console.log('-------------getImageFromText-------------');
        reject(err)
      }
      resolve(Jimp.read(Buffer.from(body, 'base64')));
    })
  });
};


const createImage = (item) => {
  // .userImageUrl1, params.Item.userImageUrl2, params.Item.id
  return new Promise((resolve, reject) => {
    let userImage1 = item.userImageUrl1;
    let userImage2 = item.userImageUrl2;
    const targetWord1 = item.targetWord1;
    const targetWord2 = item.targetWord2;
    const _uuid = item.id;
    let targetWordImage1;
    let targetWordImage2;

    getImageFromText(targetWord1).then((_targetWordImage1) => {
      targetWordImage1 = _targetWordImage1;
      return getImageFromText(targetWord2)
    })
      .then((_targetWordImage2) => {
        targetWordImage2 = _targetWordImage2;
        const fileName = `/tmp/${_uuid}.png`; // 書き込み可能なのは/tmp以下だけ、かつ名前重複でエラー起きるので重複できないようにする。
        console.log('-----------------start---------------------');
        console.log(userImage1, userImage2, uuid);
        console.log('-----------------start---------------------');

        console.log(fileName);
        console.log(__dirname + '/baseImage.png');

        userImage1 = userImage1.replace('normal', 'bigger');
        userImage2 = userImage2.replace('normal', 'bigger');


        Jimp.read(__dirname + '/baseImage.png').then(function (base) {

          Jimp.read(userImage1).then(function (image1) {
            console.log('image1');
            Jimp.read(userImage2).then(function (image2) {
              console.log('image2');
              image1.scale(2.5, () => {
                console.log('scale1');
                image2.scale(2.5, () => {
                  console.log('scale2');
                  base.composite(targetWordImage1, 90, 450)
                    .composite(targetWordImage2, 705, 450)
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
        }).catch(function (err) {
          console.error(err);
        });
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

const getGurunabi = () => {
  return new Promise((resolve, reject) => {
    console.log(gurunabiURL);
    request.get(gurunabiURL, (err, data) => {
      if (err) {
        reject(err)
      }
      const body = JSON.parse(data.body);
      console.log(body);
      const rest = body.rest[getRandomInt(0, 9)];
      console.log(rest);
      console.log(rest.id);
      const url = `https://r.gnavi.co.jp/plan/${rest.id}/plan-reserve/plan/plan_list/#wrapper`;
      console.log(url);
      resolve({
        shopName: rest.name,
        shopUrl: rest.url,
        shopImageUrl: rest.image_url.shop_image1,
        shopReservationUrl: `https://r.gnavi.co.jp/plan/${rest.id}/plan-reserve/plan/plan_list/#wrapper`,
        shopAddress: rest.address
      });
    })
  });
};


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

const getHotpepper = () => {
  return new Promise((resolve, reject) => {
    request.get(apiUrl, (err, data) => {
      if (err) {
        console.log(err);
      }
      const body = JSON.parse(data.body);
      const shop = body.results.shop[getRandomInt(0, 9)];
      checkReservation(shop.id).then((hasReservation) => {
        if (hasReservation) {
          const selectedShop = shop;
          console.log(selectedShop);
          resolve({
            shopName: selectedShop.name,
            shopUrl: selectedShop.urls.pc,
            shopImageUrl: selectedShop.photo.pc.l,
            shopReservationUrl: `https://www.hotpepper.jp/str${selectedShop.id}/yoyaku`,
            shopAddress: selectedShop.address
          })
        }
        else {
          const selectedShop =  body.results.shop[getRandomInt(0, 9)];
          console.log(selectedShop);
          resolve({
            shopName: selectedShop.name,
            shopUrl: selectedShop.urls.pc,
            shopImageUrl: selectedShop.photo.pc.l,
            shopReservationUrl: `https://www.hotpepper.jp/str${selectedShop.id}/yoyaku`,
            shopAddress: selectedShop.address
          })
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

const updateStatus = (roomID, matchingTweetID) => {
  const params = {
      TableName: `matching-${process.env.STAGE}`,
      Key:{
        id: roomID
      },
      ReturnValues:"UPDATED_NEW"
  };
  
  params['ExpressionAttributeNames'] = {};
  params['ExpressionAttributeNames']['#b'] = 'matchingTweetID';
  params['ExpressionAttributeValues'] = {};
  params['ExpressionAttributeValues'][':status'] = matchingTweetID;
  params['UpdateExpression'] = 'SET #b = :status';

  return new Promise(function (resolve, reject) {
    dynamo.update(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve();
      }
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
    console.log(params);
    dynamo.delete(params, (err) => {
      if (err) {
        console.error('dynamodb delete error');
        console.error(err.message);
        reject(err)
      }
      console.log('before resolve');
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

    const shareUrl = `https://kamatte.cc/share/${matching.id}`;

    // TODO　コミットしない
    client.post('statuses/update',
      // {status: `${toUser} \n【お店をご用意しました！】\n\nあなたの過去のツイートより勝手にマッチングし、お店もご用意させていただきました！🎉🎉\n\n ${shareUrl} #kamatte_cc`},
      {status: `${toUser} \n【お店をご用意しました！】\n\n\n\n只今、いいとものデモでマッチングしています。 ${shareUrl}`},
      function (error, tweet, response) {
        if (error) {
          console.log(error);
          reject(error)
        }
        resolve(tweet);
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

      // gurunabi と ほっとの割合を決める
      const dice = getRandomInt(1, 10);
      console.log(dice);
      let reservationFunc;
      if (dice === 1) {
        console.log('-------------------gurunabi-----------------');
        reservationFunc = getGurunabi;
        console.log('-------------------gurunabi-----------------');
      } else {
        console.log('-------------------getHotpepper-----------------');
        reservationFunc = getHotpepper;
        console.log('-------------------getHotpepper-----------------');
      }


      reservationFunc().then((shop) => {
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
            userStatus1: false,
            userStatus2: false,
            targetWord1: users[0].targetWord,
            targetWord2: users[1].targetWord,
            shopName: shop.shopName,
            shopUrl: shop.shopUrl,
            shopImageUrl: shop.shopImageUrl,
            shopReservationUrl: shop.shopReservationUrl,
            shopAddress: shop.shopAddress,
          }
        };

        if (params.Item.userID1 === params.Item.userID2) {
          deleteUser({tweetID: params.Item.tweetID1, gender: params.Item.userGender1}).then(() => {
            console.log("ユーザネームが一緒エラー");
          });
          return
        }
        createImage(params.Item).then((fileName) => {
          uploadImage(fileName).then((ogpUrl) => {
            params.Item["ogpUrl"] = ogpUrl;
              // return 'hoge'; // TODO

            postTweet(params.Item).then((tweet) => {
              create(params).then(() => {
                // return callback(null, 'hoge'); // TODO
                deleteUser({
                  gender: params.Item.userGender1,
                  tweetID: params.Item.tweetID1
                })
                  .then(() => {
                    deleteUser({
                      gender: params.Item.userGender2,
                      tweetID: params.Item.tweetID2
                    }).then(() => {
                      console.log('tweet');
                      console.log('tweet');
                      console.log(tweet);
                      updateStatus(params.Item.id, tweet.id_str).then(() => {
                        
                      });
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
  callback(null,createMatching());
};

// createMatching();
