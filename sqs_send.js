const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var sqs = new AWS.SQS({accessKeyId: 'AKIA5NQGXQ7RWW26VIB4', secretAccessKey: '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', apiVersion: '2012-11-05'});

const sendMessage = (url) => {
    var params = {
        // Remove DelaySeconds parameter and value for FIFO queues
       DelaySeconds: 10,
       MessageAttributes: {
         "S3_URL": {
           DataType: "String",
           StringValue: url
         }
       },
       MessageBody: "S3 URLs.",
       // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
       // MessageGroupId: "Group1",  // Required for FIFO queues
       QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs"
     };
     
     sqs.sendMessage(params, function(err, data) {
       if (err) {
         console.log("Error", err);
       } else {
         console.log("Success", data.MessageId);
       }
     });
}

s3_url = ['https://cc-project-input-images.s3.amazonaws.com/test_0.JPEG','https://cc-project-input-images.s3.amazonaws.com/test_1.JPEG']
for (const index in s3_url) {  
    sendMessage(s3_url[index])

  }