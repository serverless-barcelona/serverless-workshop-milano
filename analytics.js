'use strict';
const { IncomingWebhook } = require('@slack/webhook');
const url = process.env.WEBHOOK;
const webhook = new IncomingWebhook(url);

const send = async text => {
    const result = await webhook.send({
        text: text
      });
    return JSON.stringify(result);
};


module.exports.consume = async event => {
    let success = 0;
    let failure = 0;
    var output = [];
    for(var i = 0; i < event.records.length; i++){
        const record = event.records[i];
        const str = Buffer.from(record.data, 'base64').toString();
        try {
            const res = await send(str);
            success++;
            let analyticsResult = {
                recordId: record.recordId,
                result: 'Ok'
            };
            output.push(analyticsResult);
        } catch (err) {
            failure++;
            let analyticsResult = {
                recordId: record.recordId,
                result: 'DeliveryFailed'
            };
            output.push(analyticsResult);
        }
    }
    console.log(`Successful delivered records ${success}, Failed delivered records ${failure}.`);
    console.log(JSON.stringify(output));
    return { records: output };

};