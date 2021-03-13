const AWS = require('aws-sdk');
var metadata = require('node-ec2-metadata');
AWS.config.update({region:'us-east-1'});

const ec2 = new AWS.EC2({apiVersion: '2016-11-15',accessKeyId: 'AKIA6JGAEEXD2JWXRFD2', secretAccessKey: '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'});


metadata.getMetadataForInstance('instance-id')
.then(function(instanceId) {
    console.log("Instance ID: " + instanceId);
    const params = {
    InstanceIds: [
         instanceId
    ]
  };
  
  ec2.terminateInstances(params, function(err, data) {
    // if (err) {
    //   console.log(err, err.stack); 
    // } else {
    //   console.log(data);          
    // }  
  });
  
})
.fail(function(error) {
    console.log("Error: " + error);
});

