Prerequisites

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

---------------------------------

###STEPS###

1.
node scripts/filestorage.js ; call contract at ganache; aeskey + ciphertext + nonce save to IPFS in HEX decode; hash value of plaintext send to Ganache as transaction hash: TX

########################
Data 400 (DevID+TS+Hash+ECC(AES)+ENC(PT)+nonce) stored on IPFS CID: QmYddbqBYgM6LrKKQfpAhTpPzE8qaJW1CpHdkjP35kCqoZ
IPFS Link: http://localhost:8080/ipfs/QmYddbqBYgM6LrKKQfpAhTpPzE8qaJW1CpHdkjP35kCqoZ

Data 400 stored on Ethereum with transaction hash: 0xa83b5516a7ed4a1787d651073aa9f427588830e2921b6a48b34716a9add0c196
########################

$$$ The log folder keeps the CID(IPFS) and txHash(ETH) log for every time contract run
(after running node scripts/filestorage.js) $$$

2.
node python/save.js ; download data from http://localhost:8080/ipfs/{CID} to "download" subfolder inside the "python" folder, 
**please fix CID inside the code**

########################
Secret: {"deviceId":"0x706c616e745f686f7573655f395f73656e736f725f39","timestamp":"0x323032342d30342d33305f30332d30392d3337","hash":"0x8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566","eccaesKey":"147df5b0bd03d3e28ac9cf40472353c2","encryptedData":"72f1ba9ec68be0e312ef8a176c0354e321e8e8f7e1eb4d3359ed421fb70ccbc9799ee07dc620c7b142b1145894168e1cdb52300dc8a46e9f55d5f067f960615ebabfa2ddb13461ef1a0596634f8277e677e3678467","nonce":"dba072e13bdef030"}
Data saved to /home/nattapons5/vscode/FirstETHContract/python/download/data.json
########################

3. **IPFS** from python/download/data.json
python python/decrypt.py ; encrypt ecckey to aeskey to decrypt to Plaintext
(Dont forget to select correct interpretator == conda activate blockchain)

########################
Parsed Secret: {'deviceId': '0x706c616e745f686f7573655f395f73656e736f725f39', 'timestamp': '0x323032342d30342d33305f30332d30392d3337', 'hash': '0x8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566', 'eccaesKey': '147df5b0bd03d3e28ac9cf40472353c2', 'encryptedData': '72f1ba9ec68be0e312ef8a176c0354e321e8e8f7e1eb4d3359ed421fb70ccbc9799ee07dc620c7b142b1145894168e1cdb52300dc8a46e9f55d5f067f960615ebabfa2ddb13461ef1a0596634f8277e677e3678467', 'nonce': 'dba072e13bdef030'}

AES key decrypted for plant_house_9_sensor_9
Device ID: plant_house_9_sensor_9
Timestamp: 2024-04-30_03-09-37
Hash: 0x8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566


Plant House: 9, Sensor: 9
Sensor 9 data: 0.46055327561090587
--------------------
######################

4. **ETH** from const txHash
node scripts/ethgetdata.js ; get hash value from Ethereum using Transcation Hash: TX
**Please change const txHash in the file before run**

########################
Transaction Details:
From: 0x873e34c7fd011cb61fdfa52d16f914d3d5e780df
To: 0x94dfdea7c5746d8382cbd789a537c4bc31524a5b

Input Data: 0x6aaffe33000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e08aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f5660000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000002e30783730366336313665373435663638366637353733363535663339356637333635366537333666373235663339000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002830783332333033323334326433303334326433333330356633303333326433303339326433333337000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005e307835313664353936343634363237313432353936373464333634633732346234623531363637303431363835343730353037613435333837313631346135373331343337303438363436623661353033333335366234333731366635610000

After remove 0x:
Hash of PT: 8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566
DeviceId: 706c616e745f686f7573655f395f73656e736f725f39
Timestamp: 323032342d30342d33305f30332d30392d3337
CID: 516d59646462714259674d364c724b4b51667041685470507a453871614a5731437048646b6a5033356b43716f5a

Decoded Parameters:
Hash of PT: 8aaaa14ab531f24a155dcbe56f80e3789b337e0e8c094baf6baf80b0bbd2f566
DeviceId: plant_house_9_sensor_9
Timestamp: 2024-04-30_03-09-37
CID: QmYddbqBYgM6LrKKQfpAhTpPzE8qaJW1CpHdkjP35kCqoZ
######################


----END----
You can check they are all correlated to one another. Smiles face

For GraphQL to find secret in Ethereum
install dependencies by

npm install express express-graphql graphql

then run

node GRAPHQL/findtxHash.js ; this will open port 4000

open thundercilent and query something like

{
  "query": "{ searchTransaction(text1: \"plant_house_3_sensor_4\", text2: \"2024-04-30_03-05-32\") { hash input } }"
}

or 

{
  "query": "{ searchTransaction(text1: \"plant_house_9_sensor_9\") { hash input } }"
}

or 

{
  "query": "{ searchTransaction(text1: \"2024-04-30_03-09-37\") { hash input } }"
}


**text1 and text2 can be either timestamp or deviceId**

you can see the txHash belongs to that query response 



Note:
Restart the ganache and IPFS every time when running new contract, because it lags. idk why either :/