install extensions: Install https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity

Please run in Linux

npm install -g solc

Open Ganache desktop application
./ganache-2.7.1-linux-x86_64.AppImage

Open IPFS Desktop App
./ipfs-desktop-0.39.0-linux-x86_64.AppImage

Prepare your data to store in ETH and IPFS

const hashDir = '/home/YOUR_PATH_TO/hash_plant_house_logs_400';
const keyDir = '/home/YOUR_PATH_TO/aes_keys_logs';
const encryptedDataDir = '/home/YOUR_PATH_TO/ciphertext_logs';

------------------------------------------
For new solidity
Write a new .sol code (Contract) then 
 
Save both abi and bin in the "build" folder using Solidity Code
solcjs --bin --abi --output-dir ./build ./contracts/HashStorage.sol

node scripts/tojson.js; call bin and abi from "build" folder + create json in "contracts" folder

add   ,
  "networks": {
    "5777": {
      "address": "0x94dfdEa7C5746D8382cbd789A537c4bc31524A5B"
    }
  }

into the end of HashStorage.json; address is the contract address (can be any)


node scripts/filestorage.js ; call contract at ganache; aeskey + ciphertext + nonce save to IPFS in HEX decode; hash value of plaintext send to Ganache as transaction hash: TX

node python/save.js ; download data from http://localhost:8080/ipfs/{CID} to "download" subfolder inside the "python" folder, please fix CID inside the code

python python/decrypt.py ; run to see the plaintext in the terminal

node scripts/ethgetdata.js ; get hash value from Ethereum using Transcation Hash: TX

Decoded Parameters from ETH:
Hash of PT: 8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566
DeviceId: plant_house_9_sensor_9
Timestamp: 2024-04-30_03-09-37
CID: QmRZzqdkJy3JzgEeQYZhbiSimNk9wxhsvTzP1gxF7ZjjsH

----END----


Note:
Restart the ganache and IPFS every time when running new contract, because it lags. idk y