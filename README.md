install extensions: Install https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity

npm install -g solc

Open Ganache desktop application

run node scripts/deploy.js


------------------------------------------
For new solidity
Write a new .sol code (Contract) then 
run solcjs --bin --abi contracts/DataStore.sol --> Save both abi and bin in the contracts folder

run node scripts/tojson.js

lastly open Ganache desktop application & run node scripts/deploy.js
