install extensions: Install https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity

npm install -g solc

Open Ganache desktop application

run node scripts/deploy.js


------------------------------------------
For new solidity
Write a new .sol code (Contract) then 
run solcjs --bin --abi contracts/DataStore.sol --> Save both abi and bin in the contracts folder

run node scripts/tojson.js

lastly open Ganache desktop application & IPFS desktop

node scripts/deploy.js ; set contract address (in block) & account address

node scripts/ipfs-storage.js ; copy created CID to callsecret.js

node scripts/callsecret.js ; from http://localhost:8080/ipfs/{CID}
