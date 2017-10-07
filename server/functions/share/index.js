'use strict';

require('dotenv').config();

const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    hoge
  </body>
</html>
`;

exports.handler = (event, context, callback) => {
  console.log(event.pathParameters);
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html,
  };
  callback(null, response);
};
