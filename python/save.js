const fs = require('fs');
const path = require('path');

const CID = 'QmRT2ej4u3wmnjpmtfS12TCG6j86WsJCFvuQ8Dag1qTSpx';

async function retrieveDataFromCID(cid) {
    const url = `http://127.0.0.1:8080/ipfs/${cid}`;
    try {
        const fetch = (await import('node-fetch')).default; // Dynamically import node-fetch
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        const data = await response.text();
        return data;
    } catch (error) {
        throw new Error(`Failed to retrieve data: ${error.message}`);
    }
}

retrieveDataFromCID(CID)
    .then(secret => {
        console.log('Secret:', secret);

        const downloadDir = path.join(__dirname, 'download');
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }

        const downloadPath = path.join(downloadDir, 'data.json');
        fs.writeFileSync(downloadPath, JSON.stringify({ secret }, null, 2));
        console.log('Data saved to', downloadPath);
    })
    .catch(console.error);
