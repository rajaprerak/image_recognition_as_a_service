var express = require("express");
var bodyParser = require("body-parser");
var multer = require('multer');
var app = express();
const fs = require('fs');

const AWS = require('aws-sdk');

const BUCKET_NAME = 'cc-project-input-images';

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
          console.log(`${req.files[index].filename} is at position ${index}`)
          uploadFile(req.files[index].filename)
        }
        res.end("File is uploaded");
    });

});

app.listen(3000,function(){
    console.log("Working on port 3000");
});