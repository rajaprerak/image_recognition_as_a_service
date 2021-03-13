const AWS = require('aws-sdk');
const shell = require('shelljs')
AWS.config.update({region: 'us-east-1'});
var sqs = new AWS.SQS({accessKeyId: 'AKIA6JGAEEXD2JWXRFD2', secretAccessKey: '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', apiVersion: '2012-11-05'});
const fs = require('fs')

const sendMessage = (output) => {
    var params = {
       DelaySeconds: 0,
       MessageAttributes: {
         'output': {
           DataType: "String",
           StringValue: output
         }
       },
       MessageBody: "SQS Response.",
       QueueUrl: "https://sqs.us-east-1.amazonaws.com/981802952135/cc-project-sqs-response"
     };
     
     sqs.sendMessage(params, function(err, data) {
       if (err){
         console.log("Error",err);
       } else{
         console.log("Success", data.MessageId);
       }
     });
}

const BUCKET_NAME = 'cc-project-response';

const s3 = new AWS.S3({
  accessKeyId: 'AKIA6JGAEEXD2JWXRFD2',
  secretAccessKey: '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'
});

const uploadFile = (fileName) => {
  fs.readFile(fileName, (err,data)=> {
    if (err) throw err;
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: data
  };
  s3.upload(params, function(err, data) {
    if (err) {
        throw err;
    }
  });
  });
  
     
};


fs.readFile('output.txt', 'utf8' , (err, data) => {

  key = data.split('#')[0]
  key = key.split('/')[1]
  value = data.split('#')[1]
  value = value.replace("\n", "").replace("\r", "");
  file_content = '('+key+','+value+')'
  fileName = key.split('.')[0]+'.txt'
  fs.writeFile(fileName, file_content, function (err) {
    if (err) throw err;
  })
  sendMessage(key+'#'+value)
  uploadFile(fileName)
  fs.unlinkSync('output.txt')
  fs.unlinkSync(fileName)

  var receiveParams = {
    AttributeNames: [
       "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
       "All"
    ],
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/981802952135/cc-project-sqs-input",
    VisibilityTimeout: 10,
    WaitTimeSeconds: 20
   };
  sqs.receiveMessage(receiveParams, function(err, data) {
    if (err) {
      console.log("Receive Error", err);
    } else if (data.Messages) {
      shell.exec('/home/ubuntu/CC_Project_App_Tier/app_tier.sh')
    }
    else{
      shell.exec('/home/ubuntu/CC_Project_App_Tier/terminate_app_tier.sh')
    }
  });

})



 
