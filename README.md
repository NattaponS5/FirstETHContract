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

########################
Data 400 (DevID+TS+Hash+ECC(AES)+ENC(PT)+nonce) stored on IPFS CID: QmPDA5A1DpnEu9BNoNdTbbvWrzM9JZNMzzNEwBtiG3zmDG
IPFS Link: http://localhost:8080/ipfs/QmPDA5A1DpnEu9BNoNdTbbvWrzM9JZNMzzNEwBtiG3zmDG
Data 400 stored on Ethereum with transaction hash: 0xb134cd8e480511c43447b42ac7a85c3aad381a12f33ed919de428b0313fffcde
########################

node python/save.js ; download data from http://localhost:8080/ipfs/{CID} to "download" subfolder inside the "python" folder, please fix CID inside the code

########################
Secret: {"deviceId":"0x706c616e745f686f7573655f395f73656e736f725f39","timestamp":"0x323032342d30342d33305f30332d30392d3337","hash":"0x8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566","eccaesKey":"e56e52d402c530d6b66003bdc85a87a5","encryptedData":"72f1ba9ec68be0e312ef8a176c0354e321e8e8f7e1eb4d3359ed421fb70ccbc9799ee07dc620c7b142b1145894168e1cdb52300dc8a46e9f55d5f067f960615ebabfa2ddb13461ef1a0596634f8277e677e3678467","nonce":"dba072e13bdef030"}
Data saved to /home/nattapons5/vscode/FirstETHContract/python/download/data.json
########################

python python/decrypt.py ; run to see the plaintext in the terminal (Dont forget to select correct interpretator == conda activate blockchain)

########################
Parsed Secret: {'deviceId': '0x706c616e745f686f7573655f395f73656e736f725f39', 'timestamp': '0x323032342d30342d33305f30332d30392d3337', 'hash': '0x8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566', 'eccaesKey': 'e56e52d402c530d6b66003bdc85a87a5', 'encryptedData': '72f1ba9ec68be0e312ef8a176c0354e321e8e8f7e1eb4d3359ed421fb70ccbc9799ee07dc620c7b142b1145894168e1cdb52300dc8a46e9f55d5f067f960615ebabfa2ddb13461ef1a0596634f8277e677e3678467', 'nonce': 'dba072e13bdef030'}
Device ID: plant_house_9_sensor_9
Timestamp: 2024-04-30_03-09-37
Hash: 0x8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566
Plant House: 9, Sensor: 9
Sensor 9 data: 0.46055327561090587
--------------------
######################

node scripts/ethgetdata.js ; get hash value from Ethereum using Transcation Hash: TX

########################
Transaction Details:
From: 0x90c4401472825d8f7ab312be07220750ab865bc5
To: 0x94dfdea7c5746d8382cbd789a537c4bc31524a5b

Input Data: 0x6aaffe33000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e08aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f5660000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000002e30783730366336313665373435663638366637353733363535663339356637333635366537333666373235663339000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002830783332333033323334326433303334326433333330356633303333326433303339326433333337000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005e307835313664353034343431333534313331343437303665343537353339343234653666346536343534363236323736353737323761346433393461356134653464376137613465343537373432373436393437333337613664343434370000

After remove 0x:
Hash of PT: 8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566
DeviceId: 706c616e745f686f7573655f395f73656e736f725f39
Timestamp: 323032342d30342d33305f30332d30392d3337
CID: 516d50444135413144706e457539424e6f4e645462627657727a4d394a5a4e4d7a7a4e457742746947337a6d4447

Decoded Parameters:
Hash of PT: 8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566
DeviceId: plant_house_9_sensor_9
Timestamp: 2024-04-30_03-09-37
CID: QmPDA5A1DpnEu9BNoNdTbbvWrzM9JZNMzzNEwBtiG3zmDG
######################


----END----
You can check they are all correlated to one another. Smiles face


Note:
Restart the ganache and IPFS every time when running new contract, because it lags. idk why either :/