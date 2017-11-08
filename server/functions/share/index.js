'use strict';

require('dotenv').config();

const getMatchingData = require('./get_matching_data');

const url = 'http://kamatte.cc/';
const site_name = 'kamatte(かまって)';
const meta_description = 'かまってちゃんのための「勝手にマッチングしてお店の手配まで」するサービス';
const meta_keywords = ['kamatte'];

const share_image = (id) => {
  return `https:\/\/kamatte.cc\/ogp\/${id}.png`;
};

const og_description = 'かまってちゃんのための「勝手にマッチングしてお店の手配まで」するサービス';
const og_image_width = 1200;
const og_image_height = 630;
const fb_appid = '';
const tw_description = 'かまってちゃんのための「勝手にマッチングしてお店の手配まで」するサービス';
const tw_site = '@kamatte_cc';
const tw_creator = '@kamatte_cc';

const genHtml = ({ id, title }) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <meta name="description" content=${meta_description}>
    <meta name="keywords" content=${meta_keywords.join(",")}>
    <meta property="og:locale" content="ja_JP">
    <meta property="og:type" content="website">
    <meta property="og:url" content=${url}>
    <meta property="og:title" content=${title}>
    <meta property="og:site_name" content=${site_name}>
    <meta property="og:description" content=${og_description}>
    <meta property="og:image" content=${share_image(id)}>
    <meta property="og:image:width" content=${og_image_width}>
    <meta property="og:image:height" content=${og_image_height}>
    <meta property="fb:app_id" content=${fb_appid}>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content=${title}>
    <meta name="twitter:description" content=${tw_description}>
    <meta name="twitter:image" content=${share_image(id)}>
    <meta name="twitter:site" content=${tw_site}>
    <meta name="twitter:creator" content=${tw_creator}>
  </head>
  <body>
    <script>
      location.href = '/detail/?id=${id}';
    </script>
  </body>
</html>
`;

exports.handler = (event, context, callback) => {
  console.log(event.pathParameters);
  const id = event.pathParameters.id;
  getMatchingData(id).then((data) => {
    const title = 'kamatte(かまって)';
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: genHtml({ id, title }),
    };
    callback(null, response);
  });
};
