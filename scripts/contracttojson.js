const fs = require('fs');
const path = require('path');

// Load the ABI and bytecode files
const abiFile = path.resolve(__dirname, '../build/contracts_HashStorage_sol_HashStorage.abi');
const binFile = path.resolve(__dirname, '../build/contracts_HashStorage_sol_HashStorage.bin');

try {
    const abi = fs.readFileSync(abiFile, 'utf8');
    const bytecode = fs.readFileSync(binFile, 'utf8');

    // Create the JSON object
    const contractJson = {
        contractName: 'HashStorage',
        abi: JSON.parse(abi),
        bytecode: '0x' + bytecode.toString('hex'),
        deployedBytecode: '0x' + bytecode.toString('hex')
    };

    // Write the JSON file
    const outputFile = path.resolve(__dirname, '../contracts/HashStorage.json');
    fs.writeFileSync(outputFile, JSON.stringify(contractJson, null, 2));

    console.log(`Wrote ${outputFile}`);
} catch (error) {
    console.error('Error reading or writing files:', error);
}