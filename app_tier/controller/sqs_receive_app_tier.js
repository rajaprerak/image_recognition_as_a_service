const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const shell = require('shelljs')
var sqs = new AWS.SQS({accessKeyId: 'AKIA6JGAEEXD2JWXRFD2', secretAccessKey: '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', apiVersion: '2012-11-05'});
const fs = require('fs')

const BUCKET_NAME = "cc-project-input-image"
var s3 = new AWS.S3({
    accessKeyId: 'AKIA6JGAEEXD2JWXRFD2',
    secretAccessKey: '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',
})

var queueURL = "https://sqs.us-east-1.amazonaws.com/981802952135/cc-project-sqs-input";

var params = {
 AttributeNames: [
    "SentTimestamp"
 ],
 MaxNumberOfMessages: 1,
 MessageAttributeNames: [
    "All"
 ],
 QueueUrl: queueURL,
 VisibilityTimeout: 10,
 WaitTimeSeconds: 20
};

sqs.receiveMessage(params, function(err, data) {
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };
    // console.log(data.Messages[0].MessageAttributes.S3_URL.StringValue)
    s3_url = data.Messages[0].MessageAttributes.S3_URL.StringValue
    s3_image_name = s3_url.split('/')
    image_name = s3_image_name[s3_image_name.length - 1]
    downloadFile(image_name)
    sqs.deleteMessage(deleteParams, function(err, data) {
      // if (err) {
      //   console.log("Delete Error", err);
      // } else {
      //   console.log("Message Deleted", data);
      // }
    });
  } else{
      shell.exec('/home/ubuntu/CC_Project_App_Tier/terminate_app_tier.sh')
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
      if (data.Body){
        fs.writeFileSync('/home/ubuntu/CC_Project_App_Tier/classifier/'+fileName, data.Body)
      }
      // console.log('file downloaded successfully')
  })
};
