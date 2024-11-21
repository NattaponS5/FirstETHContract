const { Web3 } = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

const txHash = '0x9d4eec1e9806d24110ca879218c48f0acdd9ade6281f7dafd2368cd2835e4abf';

console.log('Fetching transaction receipt for:', txHash);

web3.eth.getTransactionReceipt(txHash).then(console.log);