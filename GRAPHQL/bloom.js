const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { Web3 } = require('web3');
const AdaptiveBloomFilter = require('./AdaptiveBloomFilter'); // Import the AdaptiveBloomFilter class

// Web3 setup
const web3 = new Web3('http://localhost:7545');

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

// Combined GraphQL schema
const schema = buildSchema(`
    type Transaction {
        hash: String
        input: String
    }

    type Duplicate {
        inputSlice: String
        hashes: [String]
    }

    type Query {
        searchTransaction(text1: String, text2: String, textcontains: String): [Transaction]
        findDuplicates: [Duplicate]
    }
`);

// Resolver functions
const root = {
    searchTransaction: async ({ text1, text2, textcontains }) => {
        const transactions = await getTransactionHashes();

        let countbit = 92;
        let endat = 110; // Adjust to capture more bits if necessary

        // check if the last char is _
        let secondLastChartext1 = text1 ? text1.charAt(text1.length - 2) : '';
        let secondLastChartext2 = text2 ? text2.charAt(text2.length - 2) : '';
        if (secondLastChartext1 === '_' || secondLastChartext2 === '_') {
            countbit = 88;
        }

        // Ensure sufficient bits are captured for differentiation
        let filteredTransactions = transactions;

        if (text2 != "") {
            console.log("have text2");
            // Hexadecimal conversions
            text2 = web3.utils.asciiToHex(web3.utils.asciiToHex(text2));
            text2 = text2.slice(6, endat);
            filteredTransactions = filteredTransactions.filter(tx => tx.input.includes(text2));
        }

        if (textcontains != "") {
            console.log("have textcontains");
            filteredTransactions = filteredTransactions.filter(tx => tx.input.includes(textcontains));
        }

        if (text1 != "") {
            console.log("have text1");
            text1 = web3.utils.asciiToHex(web3.utils.asciiToHex(text1));
            text1 = text1.slice(6, endat);
            filteredTransactions = filteredTransactions.filter(tx => tx.input.includes(text1));
            if (filteredTransactions.length > 1) {
                const result = [];
                for (const filteredTran of filteredTransactions) {
                    if (text1.length === 92) {
                        if (filteredTran.input.slice(330 + text1.length + 4, 330 + text1.length + 8) === "0000") {
                            result.push(filteredTran);
                        }
                    }

                    if (text1.length === 96){
                        if (filteredTran.input.slice(330 + text1.length + 4 + 4, 330 + text1.length + 8 + 4) === "0000"){
                          result.push(filteredTran);
                        }
                      }

                    if ((filteredTran.input.slice(330, 330 + text1.length).length === countbit) && (filteredTran.input.slice(330 + text1.length + 4, 330 + text1.length + 6) === "00") && (text1.length != 92) && (text1.length != 96)) {
                        result.push(filteredTran);
                    }
                }
                return result;
            }
        }

        return filteredTransactions;
    },
    findDuplicates: async () => {
        const duplicates = await checkDuplicateTxInput();
        return duplicates;
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
    console.log('Running a combined GraphQL API server at http://localhost:4000/graphqlbloom');
});

// Initialize AdaptiveBloomFilter
const bloomFilter = new AdaptiveBloomFilter();

// Populate the bloom filter with transaction inputs
async function populateBloomFilter() {
    const transactions = await getTransactionHashes();
    transactions.forEach(tx => {
        bloomFilter.add(tx.input);
    });
}

// Populate the bloom filter on server start
populateBloomFilter().then(() => {
    console.log('Bloom filter populated with transaction inputs.');
}).catch(err => {
    console.error('Error populating bloom filter:', err);
});

// Pre-filter query function
async function preFilterQuery(text1, text2, textcontains) {
    // Check if any of the query parameters are in the Bloom Filter
    if (text1 && !bloomFilter.contains(text1)) {
        return [];
    }
    if (text2 && !bloomFilter.contains(text2)) {
        return [];
    }
    if (textcontains && !bloomFilter.contains(textcontains)) {
        return [];
    }

    // If all query parameters are in the Bloom Filter, proceed with the GraphQL query
    return await root.searchTransaction({ text1, text2, textcontains });
}

// Function to calculate false positive rate (implement this function)
function calculateFalsePositiveRate() {
    // Implement logic to calculate the false positive rate
    return 0.05; // Example value
}

// Periodically adjust the Bloom Filter
function adjustBloomFilter() {
    const falsePositiveRate = calculateFalsePositiveRate();
    bloomFilter.adapt(falsePositiveRate);
}

setInterval(adjustBloomFilter, 60000); // Adjust every minute

// // Example usage of preFilterQuery
// // You can integrate this function into your GraphQL resolver or any other part of your application
// preFilterQuery('someText1', 'someText2', 'someTextContains').then(result => {
//     console.log(result);
// });