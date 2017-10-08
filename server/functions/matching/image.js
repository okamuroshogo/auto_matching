const fs = require('fs');
const uuid = require('uuid');
// const s3 = new aws.S3();
const Jimp = require('jimp');

const print = (image, x, y, text) => {


};

const createImage = (user_image1, user_image2, matching_reasons) => {
  return new Promise((resolve, reject) => {
    const dir = `/tmp/${uuid.v4()}`; // 書き込み可能なのは/tmp以下だけ、かつ名前重複でエラー起きるので重複できないようにする。
    Jimp.read(user_image1).then(function (image) {
      Jimp.read('kareshi.png').then(function (kareshi) {
        Jimp.read('kareshi.png').then(function (kanojo) {
          image.composite(kareshi,0,0)
            .write('done.png');

        })
      })
    }).catch(function (err) {
      console.error(err);
    });


    // s3.putObject({
    //   Bucket: "",
    //   Key: "",
    //   Body: fs.createReadStream(`${dir}/image.png`),
    //   ContentEncoded: 'base64',
    //   ContentType: 'image/png'
    // }, (ex) => {
    //   if (ex) {
    //     callback(ex);
    //     return;
    //   }
    //   callback(null, "success");
    // });
  });
};


createImage(
  'http://pbs.twimg.com/profile_images/897798178891718656/8HuJpyth_bigger.jpg',
  'http://pbs.twimg.com/profile_images/897798178891718656/8HuJpyth_bigger.jpg',
  ''
).then(() => {

}).catch((err) => {
  console.log(err);
});