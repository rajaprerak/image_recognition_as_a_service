// load the SDK for JavaScript
const AWS = require('aws-sdk');
var metadata = require('node-ec2-metadata');
 // set the region
AWS.config.update({region:'us-east-1'});

// create an ec2 object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15',accessKeyId: 'AKIA5NQGXQ7RWW26VIB4', secretAccessKey: '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'});


metadata.getMetadataForInstance('instance-id')
.then(function(instanceId) {
    console.log("Instance ID: " + instanceId);
    // setup params
    const params = {
    InstanceIds: [
         instanceId
    ]
  };
  
  ec2.terminateInstances(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      console.log(data);           // successful response
    }  
  });
  
})
.fail(function(error) {
    console.log("Error: " + error);
});

