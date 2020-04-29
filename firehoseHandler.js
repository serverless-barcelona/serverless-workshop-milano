'use strict';
const crypto = require('crypto');
const AWS = require('aws-sdk');
var firehose = new AWS.Firehose();


module.exports.push = async event => {
    console.log(JSON.stringify(event));
    try{
        event.body = JSON.parse(event.body);
        //event.body.user = event.requestContext.authorizer.claims.email;
        const md5User = crypto.createHash('md5').update(event.requestContext.authorizer.claims.email).digest("hex");
        const user = event.requestContext.authorizer.claims.email.split('@')[0];
        event.body.user = md5User + " - *" + user + "*";
    } catch(e){}
    var params = {
        DeliveryStreamName: process.env.DELIVERY_STREAM, /* required */
        Record: { /* required */
          Data: JSON.stringify(event.body)
        }
      };
    var result = await firehose.putRecord(params).promise();
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(
            {
                message: JSON.stringify(result),
            },
            null,
            2
        ),
    };

};
