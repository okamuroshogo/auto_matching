const aws = require('aws-sdk');
aws.config.endpoint = new aws.Endpoint('http://localhost:8000');
aws.config.region = 'ap-northeast-1';

const dynamo = new aws.DynamoDB();



const params = {
  TableName : "Tweets",
  KeySchema: [
    { AttributeName: "tweetID", KeyType: "HASH"},
  ],
  AttributeDefinitions: [
    { AttributeName: "tweetID", AttributeType: "N" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};

dynamo.createTable(params, function(err, data) {
  if (err) {
    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
  }
});