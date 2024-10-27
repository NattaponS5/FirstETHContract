const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const txHash = '0x290666cc163d075c42b74a0b3f2b050ec133c019f9a574918ed1d971f4b790a9';

web3.eth.getTransactionReceipt(txHash, (err, receipt) => {
    if (err) {
        console.error(err);
    } else {
        console.log(receipt);
    }
});
