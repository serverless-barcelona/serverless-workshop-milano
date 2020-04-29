const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const state = JSON.parse(fs.readFileSync('.serverless/serverless-state.json'));
const AWS = require('aws-sdk');
AWS.config.region = state.service.provider.region;
var kinesisanalytics = new AWS.KinesisAnalytics();
const command = `aws cloudformation describe-stacks --stack-name ${state.service.service}-dev --region ${state.service.provider.region}`; //--profile ${state.service.provider.profile}

async function run(command) {
    const { stdout, stderr } = await exec(command);
    return stdout || stderr;
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}

function getOutputValue(OutputArray, OutputKey) {
    var ret = false;
    OutputArray.map(output => {
        if (output.OutputKey == OutputKey) {
            ret = output.OutputValue;
        }
    })
    return ret;
}

async function startAnalytics(appName) {
    var params = {
        ApplicationName: appName
    };
    const analytics = await kinesisanalytics.describeApplication(params).promise();
    if (analytics.ApplicationDetail.ApplicationStatus == 'READY') {
        console.log(`Starting Analytics Application ${appName}, version: ${analytics.ApplicationDetail.InputDescriptions[0].InputId}`);
        params = {
            ApplicationName: appName, /* required */
            InputConfigurations: [ /* required */
                {
                    Id: analytics.ApplicationDetail.InputDescriptions[0].InputId,
                    InputStartingPositionConfiguration: { /* required */
                        InputStartingPosition: 'NOW'
                    }
                },
                /* more items */
            ]
        };
        return await kinesisanalytics.startApplication(params).promise();
    }
    return "Analytics app not in Ready status"
}

(async () => {
    const cloudformation = await run(command);
    const output = JSON.parse(cloudformation).Stacks[0].Outputs;
    const configFile = `window._config = {
        cognito: {
            userPoolId: '${getOutputValue(output, 'CognitoUserPoolId')}',
            userPoolClientId: '${getOutputValue(output, 'CognitoUserPoolClientId')}',
            userIdentityPoolId: '${getOutputValue(output, 'CognitoIdentityPoolId')}',
            region: '${state.service.provider.region}',
            deliveryStreamName: '${getOutputValue(output, 'DeliveryStreamName')}'
        },
        api: {
            invokeUrl: '${getOutputValue(output, 'ServiceEndpoint')}'
        }
    };`;
    fs.writeFileSync('./website/js/config.js', configFile);
    console.log("config.js generated: \n", configFile);
    const website = getOutputValue(output, 'WebsiteBucket');
    const athenaBucket = getOutputValue(output, 'StreamBucket');
    console.log(`Syncing website folder with S3 website bucket ${website}`);
    await run(`aws s3 sync ./website s3://${website}`);
    const analyticsAppName = getOutputValue(output, 'AnalyticsApplication');
    const analyticsStartOutput = await startAnalytics(analyticsAppName);
    console.log('Analytics Start Output: ', JSON.stringify(analyticsStartOutput));
})();
