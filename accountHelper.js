const { STS } = require('aws-sdk');
const sts = new STS();

module.exports.getAccountId = async () => {
  // Get AccountId based on current IAM credentials
  const { Account } = await sts.getCallerIdentity().promise();
  return Account;
};