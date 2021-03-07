var express = require("express");

var bodyParser = require("body-parser");
var multer = require('multer');
var app = express();
app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");

// app.set('view engine', 'html');

const fs = require('fs');
const AWS = require('aws-sdk');
const BUCKET_NAME = 'cc-project-input-images';
AWS.config.update({region: 'us-east-1'});
var sqs = new AWS.SQS({accessKeyId: 'AKIA5NQGXQ7RWW26VIB4', secretAccessKey: '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', apiVersion: '2012-11-05'});


const s3 = new AWS.S3({
    accessKeyId: 'AKIA5NQGXQ7RWW26VIB4',
    secretAccessKey: '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'
});


var receiveParams = {
  AttributeNames: ["SentTimestamp"],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ["All"],
  QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
  VisibilityTimeout: 1,
  WaitTimeSeconds: 0
  };

const uploadFile = (fileName) => {

    const path = require("path");
    const fileContent = fs.readFileSync(path.resolve(__dirname, "./uploads/"+fileName));
    console.log(fileContent)
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
        console.log(data)
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

var NumOfMessages = 10;
var queParams = {
  QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
  AttributeNames : ['All'],
};

var dataDict = {}
app.get('/receive', function(req, res){
  
  receiveMessage();
  // for (var key of Object.keys(dataDict)) {
  //   console.log(key + " -> " + dataDict[key])
  // }
  // console.log("message: "+dataDict);
  // dataDict['sample'] = 'sample';
  res.render("index", {dataDict:dataDict});
  // res.json(dataDict);

});
  
var receiveMessage = function() {
  sqs.receiveMessage(receiveParams, function(err, data) {
      if(err){
          console.log(err);
          }
      if (data.Messages) {
          console.log("inside data.messages");
          for (var i = 0; i < data.Messages.length; i++) {
            console.log("--------------------  inside For Loop --------------------" +i);
              var message = data.Messages[i];              
              // execute logic
              NumOfMessages = data.Messages.length;
              // console.log("Number of messages received: "+NumOfMessages);
              // console.log("Received message: "+JSON.stringify(data.Messages[i]));
              // console.log("Message body: "+data.Messages[i].Body);                      
              
              const recvData = data.Messages[i];                            
              result = recvData['MessageAttributes']['output']['StringValue'].split("#");
              imageName = result[0];
              ans = result[1];            
              dataDict[imageName] = ans;
              removeFromQueue(message);
          }
          receiveMessage();
      } else {
          setTimeout(function() {
              receiveMessage();
          }, 10 * 1000);
        // dataDict = {}
      }
  });
};

var removeFromQueue = function(message) {
  console.log("Remove message from Queue")
  sqs.deleteMessage({
      QueueUrl : "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-sqs-response",
      ReceiptHandle : message.ReceiptHandle
  }, function(err, data) {
      err && console.log(err);
  });
};

const sendMessage = (url) => {
    var params = {
       DelaySeconds: 0,
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