const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { Web3 } = require('web3');

// Web3 setup
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

// GraphQL schema
const schema = buildSchema(`
    type Duplicate {
        inputSlice: String
        hashes: [String]
    }

    type Query {
        findDuplicates: [Duplicate]
    }
`);

// Resolver functions
const root = {
    findDuplicates: async () => {
        const duplicates = await checkDuplicateTxInput();
        return duplicates;
    },
};

// Create an express app
const app = express();

// GraphQL endpoint
app.use('/graphqlfinddup', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

// Start the server
app.listen(4000, () => {
    console.log('Running a GraphQL API server at http://localhost:4000/graphqlfinddup');
});
