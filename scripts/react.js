// no need to care this file, just for testing purpose

const React = require('react');
const { useState, useEffect } = React;
const { Web3 } = require('web3');

function TransactionInfo() {
    const [txReceipt, setTxReceipt] = useState({});

    useEffect(() => {
        const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
        const txHash = '0xd76a3fd4a07790f374a403b2e4fe8f8ef7cde81272a003f6fab2b1fd98a881a8';
        
        web3.eth.getTransactionReceipt(txHash, (err, receipt) => {
            if (err) {
                console.error(err);
            } else {
                setTxReceipt(receipt);
            }
        });
    }, []);

    return React.createElement(
        React.createElement('h2', null, 'Transaction Info'),
        React.createElement('p', null, `Contract Address: ${txReceipt.contractAddress}`),
        React.createElement('p', null, `Gas Usage: ${txReceipt.gasUsed}`),
        React.createElement('p', null, `Block Number: ${txReceipt.blockNumber}`),
        React.createElement('p', null, `Block Time: ${txReceipt.blockTime}`)
    );
}

module.exports = TransactionInfo;
