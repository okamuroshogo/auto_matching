const request = require('request');
const apiUrl = `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${process.env.HOT_API_KEY}&large_area=Z011&format=json`;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const searchShop = () => {
  return new Promise((resolve, reject) => {
    request.get(apiUrl, (err, data) => {
      if (err) {
        console.log(err);
      }

      const body = JSON.parse(data.body);

      console.log(body.results.shop[getRandomInt(0, 10)]);
      const shop = body.results.shop[getRandomInt(0, 10)];
      resolve(shop);
    })
  })
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

const searchShop2 = () => {
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

// searchShop();
searchShop2().then((shop) => {
  console.log(shop.id);
});