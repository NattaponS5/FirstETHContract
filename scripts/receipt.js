const { Web3 } = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

const txHash = '0xfa67ec0cf910c604aada6a17cf5e3f33b19b794fc7c280f91b283269e6dd6455';

console.log('Fetching transaction receipt for:', txHash);

web3.eth.getTransactionReceipt(txHash).then(console.log);