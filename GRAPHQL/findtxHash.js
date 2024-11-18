const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
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

    let countbit = 92;
    let endat = 110; // Adjust to capture more bits if necessary

    // check if the last char is _
    let secondLastChartext1 = text1 ? text1.charAt(text1.length - 2) : '';
    let secondLastChartext2 = text2 ? text2.charAt(text2.length - 2) : '';
    if (secondLastChartext1 === '_' || secondLastChartext2 === '_') {
      countbit = 88;
    }

    // Ensure sufficient bits are captured for differentiation
    if (text2) {
      // Hexadecimal conversions
      text1 = web3.utils.asciiToHex(web3.utils.asciiToHex(text1));
      text1 = text1.slice(6, endat);
    
      text2 = web3.utils.asciiToHex(web3.utils.asciiToHex(text2));
      text2 = text2.slice(6, endat);
    
      // Correctly filter by ensuring enough recorded bits from the encoding
      return transactions.filter(tx => tx.input.includes(text1) && tx.input.includes(text2));
    } 
    else {
      text1 = web3.utils.asciiToHex(web3.utils.asciiToHex(text1));
      // console.log(text1);
      text1 = text1.slice(6, endat);
      // console.log(text1);
      // console.log(text1.length)
      const filteredTransactions = transactions.filter(tx => tx.input.includes(text1));
      if (filteredTransactions.length > 1) {
        // console.log('filteredTransactions', filteredTransactions);
        // console.log(countbit);
        for (const filteredTran of filteredTransactions) {
          // console.log((filteredTran.input.slice(330 + text1.length + 4 ,330 + text1.length + 6)));
          if ((filteredTran.input.slice(330, 330 + text1.length).length === countbit) && (filteredTran.input.slice(330 + text1.length +4 ,330 + text1.length + 6) === "00")) {
            // console.log(text1);
            // console.log(filteredTran.input.slice(330, 330 + text1.length).length);
            // console.log('filteredTran', filteredTran);
            return [filteredTran];
          }
        }
        return [];
      }
      return filteredTransactions;
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
