const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var sqs = new AWS.SQS({accessKeyId: 'AKIA5NQGXQ7RWW26VIB4', secretAccessKey: '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', apiVersion: '2012-11-05'});

const sendMessage = (output) => {
    var params = {
        // Remove DelaySeconds parameter and value for FIFO queues
       DelaySeconds: 1,
       MessageAttributes: {
         'output': {
           DataType: "String",
           StringValue: output
         }
       },
       MessageBody: "SQS Response.",
       // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
       // MessageGroupId: "Group1",  // Required for FIFO queues
       QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response"
     };
     
     sqs.sendMessage(params, function(err, data) {
       if (err) {
         console.log("Error", err);
       } else {
         console.log("Success", data.MessageId);
       }
     });
}
const fs = require('fs')


const BUCKET_NAME = 'cc-project-output-response';

const s3 = new AWS.S3({
  accessKeyId: 'AKIA5NQGXQ7RWW26VIB4',
  secretAccessKey: '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'
});

const uploadFile = (data) => {

  const params = {
      Bucket: BUCKET_NAME,
      Key: (key,value),
      Body: value
  };

  s3.upload(params, function(err, data) {
      if (err) {
          throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      sendMessage(data.Location)
    });   
};


fs.readFile('output.txt', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
  key = data.split('#')[0]
  value = data.split('#')[1]
  sendMessage(key+'#'+value)
  uploadFile(data)
})


 