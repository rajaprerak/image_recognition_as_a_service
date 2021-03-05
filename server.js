var express = require("express");
var bodyParser = require("body-parser");
var multer = require('multer');
var app = express();
const fs = require('fs');
const AWS = require('aws-sdk');
const BUCKET_NAME = 'cc-project-input-images';
AWS.config.update({region: 'us-east-1'});
var sqs = new AWS.SQS({accessKeyId: 'AKIA5NQGXQ7RWW26VIB4', secretAccessKey: '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', apiVersion: '2012-11-05'});


const s3 = new AWS.S3({
    accessKeyId: 'AKIA5NQGXQ7RWW26VIB4',
    secretAccessKey: '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'
});

const uploadFile = (fileName) => {

    const path = require("path");
    const fileContent = fs.readFileSync(path.resolve(__dirname, "./uploads/"+fileName));

    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileContent
    };

    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
        sendMessage(data.Location)
      });   
};

app.use(bodyParser.json());


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) 
  }
})

var upload = multer({ storage: storage }).array('userPhoto',1000);
app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {

        if(err) {
          console.log(err)
            return res.end("Error uploading file.");
        }
        for (const index in req.files) {  
          uploadFile(req.files[index].filename)

        }
        res.end("File is uploaded");

    });

});

var NumOfMessages = 1000;

app.get('/receive', function(req, res){
  
  var dataDict = {}
  while (true){
    
    getQueueAttributes();
    console.log("Num of msg (after fn): "+NumOfMessages)
    if (NumOfMessages === 0){
      break;
    }
    
    receiveMessage();
    // store data in dict and return dictionary
    // console.log("Num of MESSAGES: "+NumOfMessages);
  
   }
   
});


// function getQueueAttributes() {

//   console.log("Inside getQueueATtributes")
//   var queParams = {
//     QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
//     AttributeNames : ['All'],
//   };
//   sqs.getQueueAttributes(queParams, function(err, data){

//     console.log("Inside sqs.getQueueATtributes")
//     if (err) {
//            console.log("Error", err);
//          } else {
           
//           NumOfMessages = parseInt(data['Attributes']['ApproximateNumberOfMessages']);
//           console.log("INSIDE SQS.GET NumOfMES: "+NumOfMessages);
//           console.log(data);          
//           console.log(data['Attributes']['ApproximateNumberOfMessages']);
          
//         }              
//   });
//   // console.log("Inside getQueueATtributes --> NumOfMessages: "+NumOfMessages);
//   return NumOfMessages;
// }

const getQueueAttributes = () => {
  var queParams = {
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
    AttributeNames : ['All'],
  };
  sqs.getQueueAttributes(queParams, function(err, data){
    console.log("Inside sqs.getQueueATtributes")
    if (err) {
           console.log("Error", err);
         } else {
           
          NumOfMessages = parseInt(data['Attributes']['ApproximateNumberOfMessages']);
          console.log(data);          
          console.log(data['Attributes']['ApproximateNumberOfMessages']);
          
        }              
  });
}


function receiveMessage(){
  var params = {
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ["All"],
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
    VisibilityTimeout: 1,
    WaitTimeSeconds: 0
   };

   sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.log("Receive Error in web tier", err);
    } else if (data.Messages) {
      console.log("Number of messages received: "+data.Messages.length);
      console.log("Received message: "+JSON.stringify(data.Messages[0]));
      console.log("Message body: "+data.Messages[0].Body);

      // const recvData = JSON.parse(data.Messages[0].Body);
      const recvDataStr = JSON.stringify(data.Messages[0]);
      const recvData = data.Messages[0];
      console.log("Data Received: "+recvData['MessageAttributes']['output']['StringValue']);
      result = recvData['MessageAttributes']['output']['StringValue'].split("#");
      // imageName = result.split(".")[0];
      // ans = result[1];
      console.log("Image: "+result[0]);
      console.log("Ans: "+result[1]);

      var deleteParams = {
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      
      sqs.deleteMessage(deleteParams, function(err, data) {
        if (err) {
          console.log("Delete Error", err);
        } else {
          console.log("Message Deleted", data);
        }
      });
    } else {
      console.log("No messages received!");
    }
  });
}
// const receiveMessage = () => {
//   var params = {
//     AttributeNames: ["SentTimestamp"],
//     MaxNumberOfMessages: 1,
//     MessageAttributeNames: ["All"],
//     QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
//     VisibilityTimeout: 1,
//     WaitTimeSeconds: 0
//    };

//    sqs.receiveMessage(params, function(err, data) {
//     if (err) {
//       console.log("Receive Error in web tier", err);
//     } else if (data.Messages) {
//       console.log("Number of messages received: "+data.Messages.length);
//       console.log("Received message: "+JSON.stringify(data.Messages[0]));
//       console.log("Message body: "+data.Messages[0].Body);

//       // const recvData = JSON.parse(data.Messages[0].Body);
//       const recvDataStr = JSON.stringify(data.Messages[0]);
//       const recvData = data.Messages[0];
//       console.log("Data Received: "+recvData['MessageAttributes']['output']['StringValue']);
//       result = recvData['MessageAttributes']['output']['StringValue'].split("#");
//       // imageName = result.split(".")[0];
//       // ans = result[1];
//       console.log("Image: "+result[0]);
//       console.log("Ans: "+result[1]);

//       var deleteParams = {
//         QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
//         ReceiptHandle: data.Messages[0].ReceiptHandle
//       };
      
//       sqs.deleteMessage(deleteParams, function(err, data) {
//         if (err) {
//           console.log("Delete Error", err);
//         } else {
//           console.log("Message Deleted", data);
//         }
//       });
//     } else {
//       console.log("No messages received!");
//     }
//   });
  
// }

const sendMessage = (url) => {
    var params = {
       DelaySeconds: 1,
       MessageAttributes: {
         "S3_URL": {
           DataType: "String",
           StringValue: url
         }
       },
       MessageBody: "S3 URLs.",
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


app.listen(3000,function(){
    console.log("Working on port 3000");
});