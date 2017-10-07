'use strict';

require('dotenv').config();

const url = 'http://kamatte.cc/';
const site_name = 'kamatte';
const meta_description = 'description';
const meta_keywords = ['kamatte'];
const share_image = 'http://localhost/img/ogp.png';
const og_description = 'description';
const og_image_width = 1200;
const og_image_height = 630;
const tw_description = 'description';
const tw_site = '@hoge';
const tw_creator = '@hoge';

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
    <meta property="og:description" content=${(og_description || meta_description)}>
    <meta property="og:image" content=${share_image}>
    <meta property="og:image:width", content=${ogp_image_width}>
    <meta property="og:image:height", content=${ogp_image_height}>
    <meta property="fb:app_id", content=${fb_appid}>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content=${title}>
    <meta name="twitter:description" content=${(tw_description || meta_description)}>
    <meta name="twitter:image" content=${share_image}>
    <meta name="twitter:site" content=${tw_site}>
    <meta name="twitter:creator" content=${tw_creator}>
  </head>
  <body>
    <script>
      location.href = '/share?token=${id}'
    </script>
  </body>
</html>
`;

exports.handler = (event, context, callback) => {
  console.log(event.pathParameters);
  const id = event.pathParameters;
  const title = 'fuga';
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: genHtml({ id, title }),
  };
  callback(null, response);
};
