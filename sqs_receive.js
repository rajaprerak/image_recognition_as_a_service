const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var sqs = new AWS.SQS({accessKeyId: 'AKIA5NQGXQ7RWW26VIB4', secretAccessKey: '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', apiVersion: '2012-11-05'});
const fs = require('fs')

const BUCKET_NAME = "cc-project-input-images"
var s3 = new AWS.S3({
    accessKeyId: 'AKIA5NQGXQ7RWW26VIB4',
    secretAccessKey: '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',
})

var queueURL = "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs";

var params = {
 AttributeNames: [
    "SentTimestamp"
 ],
 MaxNumberOfMessages: 1,
 MessageAttributeNames: [
    "All"
 ],
 QueueUrl: queueURL,
 VisibilityTimeout: 1,
 WaitTimeSeconds: 0
};

sqs.receiveMessage(params, function(err, data) {
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };
    console.log(data.Messages[0].MessageAttributes.S3_URL.StringValue)
    s3_url = data.Messages[0].MessageAttributes.S3_URL.StringValue
    s3_image_name = s3_url.split('/')
    image_name = s3_image_name[s3_image_name.length - 1]
    downloadFile(image_name)
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
  }
});


const downloadFile = (fileName) => {
  var params = {
      Key: fileName,
      Bucket: BUCKET_NAME
  }
  s3.getObject(params, function(err, data) {
      if (err) {
          throw err
      }
      fs.writeFileSync('./'+fileName, data.Body)
      console.log('file downloaded successfully')
  })
};