const { buildSchema } = require('graphql');
const { Web3 } = require('web3');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { AdaptiveBloomFilter } = require('./AdaptiveBloomFilter');

// Web3 setup
const web3 = new Web3('http://localhost:7545');

// Adaptive Bloom Filter instance
const adaptiveBloomFilter = new AdaptiveBloomFilter();

// Function to fetch transaction hashes from Ganache
async function getTransactionHashes() {
    const accounts = await web3.eth.getAccounts();
    const firstAccount = accounts[0];
    const blockNumber = await web3.eth.getBlockNumber();
    let transactions = [];

    for (let i = 0; i <= blockNumber; i++) {
        const block = await web3.eth.getBlock(i, true);
        if (block && block.transactions) {
            block.transactions.forEach(tx => {
                if (tx.from.toLowerCase() === firstAccount.toLowerCase()) {
                    transactions.push({ hash: tx.hash, input: tx.input });
                }
            });
        }
    }

    return transactions;
}

// Function to update the Bloom filter with new transactions
async function updateBloomFilter() {
    const transactions = await getTransactionHashes();
    transactions.forEach(tx => {
        adaptiveBloomFilter.add(tx.hash);
    });
}

// Function to check for duplicate transaction inputs
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

// GraphQL schema
const schema = buildSchema(`
    type Duplicate {
        inputSlice: String
        hashes: [String]
    }

    type Transaction {
        hash: String
        input: String
    }

    type Query {
        findDuplicates: [Duplicate]
        searchTransaction(text1: String, text2: String, textcontains: String): [Transaction]
    }
`);

// Resolver functions
const root = {
    findDuplicates: async () => {
        const duplicates = await checkDuplicateTxInput();
        return duplicates;
    },
    searchTransaction: async ({ text1, text2, textcontains }) => {
        const transactions = await getTransactionHashes();
        const filteredTransactions = transactions.filter(tx => adaptiveBloomFilter.contains(tx.hash));

        // Further refine based on input criteria
        const refineTransactions = (transactions, text1, text2, textcontains) => {
            let endat = 110;
            let secondLastChartext1 = text1 ? text1.charAt(text1.length - 2) : '';
            let secondLastChartext2 = text2 ? text2.charAt(text2.length - 2) : '';
            if (secondLastChartext1 === '_' || secondLastChartext2 === '_') {
                endat = 88;
            }

            if (text2) {
                text1 = web3.utils.asciiToHex(web3.utils.asciiToHex(text1));
                text1 = text1.slice(6, endat);
                text2 = web3.utils.asciiToHex(web3.utils.asciiToHex(text2));
                text2 = text2.slice(6, endat);
                return transactions.filter(tx => tx.input.includes(text1) && tx.input.includes(text2));
            } else if (textcontains) {
                return transactions.filter(tx => tx.input.includes(textcontains));
            } else {
                text1 = web3.utils.asciiToHex(web3.utils.asciiToHex(text1));
                text1 = text1.slice(6, endat);
                const filtered = transactions.filter(tx => tx.input.includes(text1));
                if (filtered.length > 1) {
                    return filtered;
                }
                return filtered;
            }
        };

        return refineTransactions(filteredTransactions, text1, text2, textcontains);
    },
};

// Create an express app
const app = express();

// GraphQL endpoint
app.use('/graphqlbloom', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

// Start the server
app.listen(4000, () => {
    console.log('Running a GraphQL API server at http://localhost:4000/graphqlbloom');
});

// Periodically update the Bloom filter
setInterval(updateBloomFilter, 60000); // Update every minute
