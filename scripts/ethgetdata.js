const { Web3 } = require('web3');

// Connect to the Ganache instance
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

// Transaction hash you want to look up
const txHash = '0x2e0381d2b61b6e328d5595b7d72c79e999e5fef4c5ce17d73d4444055badcdd6';

// Function to fetch and display the transaction details
async function getTransactionDetails() {
  try {
    const transaction = await web3.eth.getTransaction(txHash);

    if (transaction) {
      console.log('Transaction Details:');
      console.log('From:', transaction.from);
      console.log('To:', transaction.to);
      //console.log('Value:', web3.utils.fromWei(transaction.value, 'ether'), 'ETH');
      //console.log('Gas:', transaction.gas);
      //console.log('Gas Price:', web3.utils.fromWei(transaction.gasPrice, 'gwei'), 'Gwei');
      console.log('Input Data:', transaction.input);
    } else {
      console.log('Transaction not found.');
    }
  } catch (error) {
    console.error('Error fetching transaction:', error);
  }
}

// Execute the function
getTransactionDetails();
