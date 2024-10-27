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

-----------------------------------------

If facing any problem.

node init
node audit fix --> remove node_modules and package-lock.json
add override in package.json
node update
node install

else, don't follow me, bc idk

-----------------------------------------
Current npm
├── ganache@6.4.5
├── ipfs-http-client@53.0.1
├── ipfs@0.66.1
├── solc@0.8.28
└── web3@4.14.0
