import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function TransactionInfo() {
    const [txReceipt, setTxReceipt] = useState({});

    useEffect(() => {
        const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        const txHash = '0x290666cc163d075c42b74a0b3f2b050ec133c019f9a574918ed1d971f4b790a9';
        
        web3.eth.getTransactionReceipt(txHash, (err, receipt) => {
            if (err) {
                console.error(err);
            } else {
                setTxReceipt(receipt);
            }
        });
    }, []);

    return (
        <h1>
            <h2>Transaction Info</h2>
            <p>Contract Address: {txReceipt.contractAddress}</p>
            <p>Gas Usage: {txReceipt.gasUsed}</p>
            <p>Block Number: {txReceipt.blockNumber}</p>
            <p>Block Time: {txReceipt.blockTime}</p>
        </h1>
    );
}

module.exports = TransactionInfo;