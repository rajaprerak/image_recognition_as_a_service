const express = require('express');
const multer = require('multer');
const fs = require('fs');
const AWS = require('aws-sdk');

const BUCKET_NAME = 'cc-project-input-images';

const s3 = new AWS.S3({
    accessKeyId: 'AKIA5NQGXQ7RWW26VIB4',
    secretAccessKey: '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'
});

const uploadFile = (fileName) => {

    const path = require("path");
    const fileContent = fs.readFileSync(path.resolve(__dirname, "../Backend/uploads/images/"+fileName));

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

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/images')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) 
    }
  })

var upload = multer({ storage: storage });
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.post('/upload_image', upload.single('photo'), (req, res) => {
    if(req.file) {
        uploadFile(req.file.filename)
        res.json('success');
    }
    else throw 'error';
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});