const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { Web3 } = require('web3');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Web3 setup
const web3 = new Web3('http://localhost:7545');

// Bloom filter library
const BloomFilter = require('YOUR_PATH/FirstETHContract/scripts/bloomFilter.js');
const AdaptiveBloomFilter = require('YOUR_PATH/FirstETHContract/scripts/adaptiveBloomFilter.js');


// // Read the Bloom filter state as a plain text file
// const bloomFilter_2048_FilePath = 'YOUR_PATH/FirstETHContract/scripts/bloom_filter_2048_state.txt';
// let bloomFilter_2048_State = '';

// if (fs.existsSync(bloomFilter_2048_FilePath)) {
//   bloomFilter_2048_State = fs.readFileSync(bloomFilter_2048_FilePath, 'utf8').trim(); // Trim to remove extra spaces or newlines
// }

// // Initialize Bloom filter and set its state
// const bloomFilter_2048 = new BloomFilter(size=2048, hashFunctions=3);

// /// If there is an existing bloom filter state, load it
// if (bloomFilter_2048_State) {
//   const bitArray = bloomFilter_2048_State.split('').map(bit => bit === '1'); // Convert binary string to boolean array
//   bloomFilter_2048.bitArray = bitArray; // Set the bitArray of the bloom filter to the loaded state
// }

// Define a function to initialize and load a Bloom filter state
function initializeBloomFilter(size, hashFunctions) {
    const filePath = `YOUR_PATH/FirstETHContract/scripts/bloom_filter_${size}_state.txt`;
    let bloomFilterState = '';
  
    // Check if the file exists and read the state
    if (fs.existsSync(filePath)) {
      bloomFilterState = fs.readFileSync(filePath, 'utf8').trim(); // Trim to remove extra spaces or newlines
    }
  
    // Initialize a new Bloom filter (assuming BloomFilter is a class you have implemented)
    const bloomFilter = new BloomFilter(size, hashFunctions);
  
    // If there is an existing Bloom filter state, load it
    if (bloomFilterState) {
      const bitArray = bloomFilterState.split('').map(bit => bit === '1'); // Convert binary string to boolean array
      bloomFilter.bitArray = bitArray; // Set the bitArray of the Bloom filter to the loaded state
    }
  
    return bloomFilter;
  }
  
  // Initialize Bloom filters for different sizes and hash functions
  const bloomFilter_2048 = initializeBloomFilter(2048, 3);
  const bloomFilter_4096 = initializeBloomFilter(4096, 5);
  const bloomFilter_8192 = initializeBloomFilter(8192, 7);


// Adaptive Bloom filter file path
const adaptiveBloomFilterFilePath = 'YOUR_PATH/FirstETHContract/scripts/adaptive_bloom_filter_state.txt';
let adaptiveBloomFilterState = '';

// Read the adaptive Bloom filter state as a JSON file
if (fs.existsSync(adaptiveBloomFilterFilePath)) {
  adaptiveBloomFilterState = fs.readFileSync(adaptiveBloomFilterFilePath, 'utf8').trim(); // Trim to remove extra spaces or newlines
}

// Initialize the adaptive Bloom filter and set its state
const adaptiveBloomFilter = new AdaptiveBloomFilter();

// If there is an existing adaptive Bloom filter state, load it
if (adaptiveBloomFilterState) {
  try {
    const stateObject = JSON.parse(adaptiveBloomFilterState); // Parse the JSON string to an object

    // Set the properties for the adaptive Bloom filter from the parsed state
    adaptiveBloomFilter.size = stateObject.size;
    adaptiveBloomFilter.numItems = stateObject.numItems;
    adaptiveBloomFilter.expectedItems = stateObject.expectedItems;
    adaptiveBloomFilter.errorRate = stateObject.errorRate;
    adaptiveBloomFilter.hashFunctions = stateObject.hashFunctions;
    adaptiveBloomFilter.filter = stateObject.filter; // 'filter' is the bit array for the adaptive Bloom filter
    adaptiveBloomFilter.itemsSet = new Set(stateObject.itemsSet); // 'itemsSet' is the set of items added to the adaptive Bloom filter

  } catch (error) {
    console.error('Error parsing adaptive Bloom filter state:', error);
  }
}

// Web3 functions
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
    searchWithBloomFilter2048(textcontains: String): [Transaction]
    searchWithBloomFilter4096(textcontains: String): [Transaction]
    searchWithBloomFilter8192(textcontains: String): [Transaction]
    searchWithAdaptiveBloomFilter(textcontains: String): [Transaction]
    findDuplicates: [Duplicate]
  }
`
);

function prepareHex(hex) {
  // Strip '0x' if it exists
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }

  // Ensure the string has an even length
  if (hex.length % 2 !== 0) {
    hex = '0' + hex; // Add leading zero if length is odd
  }

  return hex;
}

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

    searchWithBloomFilter2048: async ({ textcontains }) => {
    // Check Bloom filter with the hash of the textcontains
    textcontains = prepareHex(textcontains);
    if (!bloomFilter_2048.contains(textcontains)) {
        console.log("Data does not exist according to Bloom filter with size 2048.");
        return []; // Return empty array if Bloom filter check fails
    }

    // If the Bloom filter passes, proceed with the traditional search logic
    console.log("Data possibly exists, proceeding with full search...");
    return await root.searchTransaction({ text1: '', text2: '', textcontains });
    },

    searchWithBloomFilter4096: async ({ textcontains }) => {
        // Check Bloom filter with the hash of the textcontains
        textcontains = prepareHex(textcontains);
        if (!bloomFilter_4096.contains(textcontains)) {
            console.log("Data does not exist according to Bloom filter with size 4096.");
            return []; // Return empty array if Bloom filter check fails
        }

        // If the Bloom filter passes, proceed with the traditional search logic
        console.log("Data possibly exists, proceeding with full search...");
        return await root.searchTransaction({ text1: '', text2: '', textcontains });
    },

    searchWithBloomFilter8192: async ({ textcontains }) => {
        // Check Bloom filter with the hash of the textcontains
        textcontains = prepareHex(textcontains);
        if (!bloomFilter_8192.contains(textcontains)) {
            console.log("Data does not exist according to Bloom filter 8192.");
            return []; // Return empty array if Bloom filter check fails
        }

        // If the Bloom filter passes, proceed with the traditional search logic
        console.log("Data possibly exists, proceeding with full search...");
        return await root.searchTransaction({ text1: '', text2: '', textcontains });
    },

  searchWithAdaptiveBloomFilter: async ({ textcontains }) => {
    // Check Bloom filter with the hash of the textcontains
    textcontains = prepareHex(textcontains);
    console.log(textcontains);
    if (!adaptiveBloomFilter.exists(textcontains)) {
        console.log("Data does not exist according to Bloom filter.");
        return []; // Return empty array if Bloom filter check fails
    }

    // If the Bloom filter passes, proceed with the traditional search logic
    console.log("Data possibly exists, proceeding with full search...");
    return await root.searchTransaction({ text1: '', text2: '', textcontains });
},


  findDuplicates: async () => {
    const duplicates = await checkDuplicateTxInput();
    return duplicates;
  },

};

// Create an express app
const app = express();

app.use(cors());

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Start the server
app.listen(4000, () => {
  console.log('Running a combined GraphQL API server at http://localhost:4000/graphql');
});