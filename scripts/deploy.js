const { Web3 } = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

const contract = require('../contracts/SampleContract.json');

async function deploy() {
    try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        // Deploy the contract
        const txCount = await web3.eth.getTransactionCount(account);
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await web3.eth.estimateGas({
            from: account,
            data: contract.bytecode,
        });

        const tx = {
            from: account,
            data: contract.bytecode,
            gas: gasEstimate,
            gasPrice: gasPrice,
        };

        const receipt = await web3.eth.sendTransaction(tx);
        console.log(`Contract deployed at ${receipt.contractAddress}`);
    } catch (err) {
        console.error(`Failed to deploy contract: ${err.message}`);
    }
}

deploy();

