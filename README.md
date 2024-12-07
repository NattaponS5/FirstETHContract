# FirstETHContract

This repository contains a comprehensive setup for developing and deploying Ethereum smart contracts, interacting with IPFS for decentralized storage, and utilizing various tools and libraries for data encryption, decryption, and querying.

## Prerequisites

### Install Extensions
- Install the Solidity extension for Visual Studio Code: [Solidity by Juan Blanco](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)

### System Requirements
- **Linux**: Recommended for better performance.
- **Node Version Manager (nvm)**: Use Node.js version 20.

### Dependencies
1. **Node.js**: Ensure you are using Node.js version 20.
   ```sh
   nvm use 20
   ```

2. **Clean Install**: Remove existing node modules and package-lock.json.
   ```sh
   npm uninstall $(ls node_modules)
   rm -rf node_modules
   rm package-lock.json
   ```

3. **Install Required Packages**:
   ```sh
   npm install express@^4.21.1 express-graphql@^0.12.0 fs@^0.0.1-security
   npm install ganache@^6.4.5 graphql@^15.9.0 ipfs@^0.66.1
   npm install ipfs-http-client@^53.0.1 react@^18.3.1 solc@^0.8.17 web3@^4.14.0
   ```

### Overrides
Add overrides to the `package.json` to ensure compatibility:
```json
{
  "overrides": {
    "electron": "33.0.2",
    "request": "2.88.2",
    "nugget": "2.2.0",
    "electron-download": "4.1.1",
    "tough-cookie": "5.0.0"
  },
  "keywords": []
}
```

### High Severity Vulnerabilities
There should be 2 high severity vulnerabilities. This is acceptable for the current setup.

## Setup and Execution

### 1. Compile and Deploy Smart Contract
1. **Write a new Solidity contract** and save it in the `contracts` directory.
2. **Compile the contract** and save the ABI and BIN files in the `build` folder:
   ```sh
   solcjs --bin --abi --output-dir ./build ./contracts/HashStorage.sol
   ```
3. **Convert the contract to JSON**:
   ```sh
   node scripts/contracttojson.js
   ```
   This script will create a `HashStorage.json` file in the `contracts` folder.

4. **Add the contract address** to the `HashStorage.json` file:
   ```json
   {
     "networks": {
       "5777": {
         "address": "0x94dfdEa7C5746D8382cbd789A537c4bc31524A5B"
       }
     }
   }
   ```

### 2. Start Ganache and IPFS
1. **Open Ganache**:
   ```sh
   ./ganache-2.7.1-linux-x86_64.AppImage
   ```
2. **Open IPFS**:
   ```sh
   ./ipfs-desktop-0.39.0-linux-x86_64.AppImage
   ```

### 3. Store Data in IPFS and Ganache
1. **Navigate to the project directory**:
   ```sh
   cd FirstETHContract
   ```
2. **Store data in IPFS and Ganache**:
   ```sh
   node scripts/filestorage.js
   ```
   This script will:
   - Call the contract on Ganache.
   - Save encrypted data to IPFS.
   - Send the hash of the plaintext to Ganache as a transaction hash (TX).
   - Update the index in both normal and adaptive Bloom filter text files.

### 4. Retrieve Data from Ethereum
1. **Get data from Ethereum using a transaction hash**:
   ```sh
   node scripts/ethgetdata.js
   ```
   **Note**: Change the `const txHash` in the file before running.

### 5. Search Transactions Using Bloom Filters
1. **Run the Bloom filter script**:
   ```sh
   node GRAPHQL/bloom.js
   ```
2. **Open `src/index.html`** and use the search options:
   - **Option 1**: Search Transactions (GraphQL)
   - **Option 2**: Search Transactions with Bloom Filter
   - **Option 3**: Search Transactions with Adaptive Bloom Filter

### 6. Retrieve Readable Data
1. **Download data from IPFS**:
   ```sh
   node python/save.js
   ```
2. **Decrypt the data**:
   ```sh
   python python/decrypt.py
   ```
   **Note**: Ensure you have the correct interpreter activated (`conda activate blockchain`).

## Test Cases

### Test Case 1: Find the Given Hash of the Plaintext
1. **Retrieve data from Ethereum**:
   ```sh
   node scripts/ethgetdata.js
   ```
2. **Search using Bloom filters**:
   ```sh
   node GRAPHQL/bloom.js
   ```
3. **Use `src/index.html`** to search for the hash.

### Test Case 2: Find an Unknown Random Hash
1. **Use the hash from `node scripts/ethgetdata.js`** or generate a new one.
2. **Search using Bloom filters**:
   ```sh
   node GRAPHQL/bloom.js
   ```
3. **Use `src/index.html`** to search for the hash.

### Test Case 3: Find Transactions by SensorID and Timestamp
1. **Run the Bloom filter script**:
   ```sh
   node GRAPHQL/bloom.js
   ```
2. **Use `src/index.html`** to search by SensorID and Timestamp.

### Test Case 4: Check for Data Duplicates
1. **Run the Bloom filter script**:
   ```sh
   node GRAPHQL/bloom.js
   ```
2. **Open `src/duplicate.html`** and click "Fetch Duplicate Transactions".

### Test Case 5: Retrieve Readable Data
1. **Download data from IPFS**:
   ```sh
   node python/save.js
   ```
2. **Decrypt the data**:
   ```sh
   python python/decrypt.py
   ```

## Conclusion
This setup allows you to develop, deploy, and interact with Ethereum smart contracts, store and retrieve data using IPFS, and utilize Bloom filters for efficient data querying. Follow the steps above to get started with your project.