const { create } = require('ipfs-http-client');
const { Web3 } = require('web3');
const path = require('path');
const fs = require('fs');
const { Buffer } = require('buffer');

// Set up IPFS instance
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

// Set up Web3 instance
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

// Set up your Ethereum contract instance
const contractAddress = '0xF34C9Ad56aB9a25d831A482cF589152BDB361Bc6'; // Replace with an actual address from Ganache
const abiPath = path.resolve(__dirname, '../contracts/DataStore.abi');

if (!fs.existsSync(abiPath)) {
  console.error(`ABI file not found at path: ${abiPath}`);
  process.exit(1);
}

let contractABI;
try {
  contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
} catch (err) {
  console.error('Error parsing ABI file:', err);
  process.exit(1);
}

const contract = new web3.eth.Contract(contractABI, contractAddress);
// console.log(contract.methods);  // Add this line to log the contract's methods

// Data to be stored in IPFS
const data = 'Sample Data from Linux'; // encrypted data from your contract

const buffer = Buffer.from(data, 'utf-8');
ipfs.add(buffer).then(result => {
  const cid = result.path;
  console.log(`Data added to IPFS with CID: ${cid}`);

  // Convert CID to bytes
  const cidBytes = web3.utils.hexToBytes(web3.utils.asciiToHex(cid));

  // Store CID on Ethereum blockchain
  contract.methods.storeData(1, cidBytes).send({ from: '0xA0f28fd7A20b073785c0Edfe941c0eCf282e8D06' }) // Adjust the parameters as needed
    .then(receipt => {
      console.log(`CID stored on blockchain: ${cid}`);
      console.log(`Transaction receipt:`, receipt);
    })
    .catch(err => {
      console.error('Error storing CID on blockchain:', err);
    });
}).catch(err => {
  console.error('Error adding data to IPFS:', err);
});
