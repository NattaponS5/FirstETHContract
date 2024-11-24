const { Web3 } = require('web3');

// Function to convert hex to ASCII
function hexToAscii(hex) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

// Connect to the Ganache instance
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

// Transaction hash you want to look up
const txHash = '0x8ddf598574c375ecbc17b4b96c968b54be4b975f17e52d02e260c03736b536c7';

// Function to fetch and display the transaction details
async function getTransactionDetails() {
  try {
    const transaction = await web3.eth.getTransaction(txHash);

    if (transaction) {
      console.log('Transaction Details:');
      console.log('From:', transaction.from);
      console.log('To:', transaction.to);
      // console.log('Value:', web3.utils.fromWei(transaction.value, 'ether'), 'ETH');
      // console.log('Gas:', transaction.gas);
      // console.log('Gas Price:', web3.utils.fromWei(transaction.gasPrice, 'gwei'), 'Gwei');
     console.log('\nInput Data:', transaction.input);
      
      // Divide transaction input data into parameters
      const inputData = transaction.input;
      const params = {
      param1: inputData.slice(2, 10), // 8 bits (4 bytes)
      param2: inputData.slice(10, 74), // 64 bits (32 bytes)
      param3: inputData.slice(74, 138), // 64 bits (32 bytes)
      param4: inputData.slice(138, 202), // 64 bits (32 bytes)
      param5: inputData.slice(202, 266), // 64 bits (32 bytes)
      param6: inputData.slice(266, 330), // 64 bits (32 bytes)
      param7: inputData.slice(330, 458), // 128 bits (64 bytes)
      param8: inputData.slice(458, 522), // 64 bits (32 bytes)
      param9: inputData.slice(522, 650), // 128 bits (64 bytes)
      param10: inputData.slice(650, 906)  // 256 bits (128 bytes)
      };

      // console.log('Parameters:');
      // console.log('Param 1:', params.param1);
      // console.log('Param 2:', params.param2);
      // console.log('Param 3:', params.param3);
      // console.log('Param 4:', params.param4);
      // console.log('Param 5:', params.param5);
      // console.log('Param 6:', params.param6);
      console.log('Param 7:', params.param7);
      // console.log('Param 8:', params.param8);
      // console.log('Param 9:', params.param9);
      // param10 remove the front zeroes if found
      params.param10 = params.param10.replace(/^0+/, '');
      // console.log('Param 10:', params.param10);

      // dehex param 4, 7, 9 and 10
      const dehexParams = {
      param7: web3.utils.hexToUtf8(params.param7),
      param9: web3.utils.hexToUtf8(params.param9),
      param10: web3.utils.hexToUtf8(params.param10)
      };
      
      //remove 0x from the string in param 7, 9 and 10
      dehexParams.param7 = dehexParams.param7.replace(/^0x/, '');
      dehexParams.param9 = dehexParams.param9.replace(/^0x/, '');
      dehexParams.param10 = dehexParams.param10.slice(3);

      console.log('\nAfter remove 0x:');
      console.log('Hash of PT:', params.param4);
      console.log('DeviceId:', dehexParams.param7);
      console.log('Timestamp:', dehexParams.param9);
      console.log('CID:', dehexParams.param10);

      // decode dehexParams 7, 9 and 10
      const decodedParams = {
        param7: hexToAscii(dehexParams.param7),
        param9: hexToAscii(dehexParams.param9),
        param10: hexToAscii(dehexParams.param10)
      };

      console.log('\nDecoded Parameters:');
      console.log('Hash of PT:', params.param4);
      console.log('DeviceId:', decodedParams.param7);
      console.log('Timestamp:', decodedParams.param9);
      console.log('CID:', decodedParams.param10);

    } else {
      console.log('Transaction not found.');
    }
  } catch (error) {
    console.error('Error fetching transaction:', error);
  }
}

    // Execute the function
    getTransactionDetails();
