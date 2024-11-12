const fs = require('fs');
const path = require('path');

const CID = 'QmPDA5A1DpnEu9BNoNdTbbvWrzM9JZNMzzNEwBtiG3zmDG';

// Example function to retrieve data from CID
async function retrieveDataFromCID(cid) {
    const url = `http://localhost:8080/ipfs/${cid}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        return data;
    } catch (error) {
        throw new Error(`Failed to retrieve data: ${error.message}`);
    }
}

// Ensure the function is defined before calling it
retrieveDataFromCID(CID)
    .then(secret => {
        console.log('Secret:', secret);
        const downloadPath = path.join(__dirname, 'download', 'data.json');
        fs.writeFileSync(downloadPath, JSON.stringify({ secret }, null, 2));
        console.log('Data saved to', downloadPath);
    })
    .catch(console.error);