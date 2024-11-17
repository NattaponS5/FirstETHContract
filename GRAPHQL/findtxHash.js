const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');
const { Web3 } = require('web3');

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

// GraphQL schema
const schema = buildSchema(`
  type Transaction {
    hash: String
    input: String
  }

  type Query {
    searchTransaction(text1: String!, text2: String): [Transaction]
  }
`);

// Resolver functions
const root = {
  searchTransaction: async ({ text1, text2 }) => {
    const transactions = await getTransactionHashes();

    // Filter transactions based on whether text2 is provided
    if (text2) {
      // hex text1 and text2 twice to match the input data
      text1 = web3.utils.asciiToHex(web3.utils.asciiToHex(text1));
      // slice the first 6 bit out
      text1 = text1.slice(6, );
      text2 = web3.utils.asciiToHex(web3.utils.asciiToHex(text2));
      // slice the first 6 bit out
      text2 = text2.slice(6, );

      return transactions.filter(tx => tx.input.includes(text1) && tx.input.includes(text2));
    } else {
      // hex text1 twice to match the input data  
      text1 = web3.utils.asciiToHex(web3.utils.asciiToHex(text1));
      // slice the first 6 bit out
      text1 = text1.slice(6, );
      return transactions.filter(tx => tx.input.includes(text1));
    }
  },
};

// Create an express app
const app = express();

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Start the server
app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});
