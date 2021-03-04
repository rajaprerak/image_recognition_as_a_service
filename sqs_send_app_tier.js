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

key = 'test_0.JPEG'
value = 'bathtub'
sendMessage(key+'#'+value)

 