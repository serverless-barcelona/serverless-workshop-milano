const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const state = JSON.parse(fs.readFileSync('.serverless/serverless-state.json'));
const AWS = require('aws-sdk');
AWS.config.region = state.service.provider.region;
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

(async () => {
    const cloudformation = await run(command);
    const output = JSON.parse(cloudformation).Stacks[0].Outputs;
    const website = getOutputValue(output, 'WebsiteBucket');
    const streamBucket = getOutputValue(output, 'AthenaBucket');
    console.log(`Removing objects from ${website}, ${streamBucket}`);
    await run(`aws s3 rm s3://${website} --recursive`);
    await run(`aws s3 rm s3://${streamBucket} --recursive`);
    
})();
