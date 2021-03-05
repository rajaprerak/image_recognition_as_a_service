const AWS = require('aws-sdk')
AWS.config.update({region: 'us-west-2'})
const sqs = new AWS.SQS({accessKeyId: 'AKIA5NQGXQ7RWW26VIB4', secretAccessKey: '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',apiVersion: '2012-11-05'})

const send = async (url, groupId, messageId) => {
  return await sqs.sendMessage({
    var params = {
    MessageAttributes: {
        "S3_URL": {
          DataType: "String",
          StringValue: url
        }
      },
    MessageGroupId: `group-${groupId}`,
    MessageDeduplicationId: `m-${groupId}-${messageId}`,
    MessageBody: `${messageId}`,
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/922358351843/cc-project1-input.fifo"
  }}).promise()
}

const main = async () => {
  await send ('url','A', '1')
}
main()