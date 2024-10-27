const CID = 'Qmdg9DKADcfURhW8y8hVBPdkatGAk8pLkv7ZJKbvGuaVwp';

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
    })
    .catch(console.error);