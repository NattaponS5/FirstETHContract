const { Web3 } = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

async function checkDuplicateTxInput() {
    const latestBlock = await web3.eth.getBlockNumber();
    const txInputs = new Map();
    const duplicates = [];

    for (let i = 0; i <= latestBlock; i++) {
        const block = await web3.eth.getBlock(i, true);
        if (block && block.transactions) {
            block.transactions.forEach(tx => {
                const inputSlice = tx.input.slice(138, 202);
                if (txInputs.has(inputSlice)) {
                    txInputs.get(inputSlice).push(tx.hash);
                } else {
                    txInputs.set(inputSlice, [tx.hash]);
                }
            });
        }
    }

    txInputs.forEach((hashes, inputSlice) => {
        if (hashes.length > 1) {
            duplicates.push({ inputSlice, hashes });
        }
    });

    return duplicates;
}

checkDuplicateTxInput().then(duplicates => {
    if (duplicates.length > 0) {
        console.log('Duplicate transaction inputs found:');
        duplicates.forEach(duplicate => {
            console.log(`Input Slice: ${duplicate.inputSlice}`);
            console.log('Transactions:', duplicate.hashes);
        });
    } else {
        console.log('No duplicate transaction inputs found.');
    }
}).catch(error => {
    console.error('Error checking duplicate transaction inputs:', error);
});