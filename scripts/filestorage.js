const { create } = require('ipfs-http-client');
const { Web3 } = require('web3');
const { promises: fs } = require('fs');
const path = require('path');
const { Buffer } = require('buffer');

const contract = require('../contracts/HashStorage.json'); // Make sure this file exists and is correctly generated
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

async function getFiles(dir) {
    try {
        const files = await fs.readdir(dir);
        return files.map(file => path.join(dir, file));
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
        throw error;
    }
}

async function processAllData(hashDir, keyDir, encryptedDataDir) {
    try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = contract.networks[networkId];
        if (!deployedNetwork) {
            console.error(`Contract not deployed to detected network ID: ${networkId}`);
            return;
        }
        const instance = new web3.eth.Contract(contract.abi, deployedNetwork.address);

        const [hashFiles, keyFiles, encryptedDataFiles] = await Promise.all([
            getFiles(hashDir),
            getFiles(keyDir),
            getFiles(encryptedDataDir),
        ]);

        if (hashFiles.length !== 400) {
            throw new Error(`Expected 400 hash files, but found ${hashFiles.length}`);
        }

        if (keyFiles.length !== 10) {
            throw new Error(`Expected 10 key files, but found ${keyFiles.length}`);
        }

        if (encryptedDataFiles.length !== 800) {
            throw new Error(`Expected 800 encrypted data files, but found ${encryptedDataFiles.length}`);
        }

        const accounts = await web3.eth.getAccounts();

        for (let i = 0; i < hashFiles.length; i++) {
            const hashFile = hashFiles[i];
            let keyFile;
            if (hashFile.includes('plant_house_1_')) {
                keyFile = path.join(keyDir, 'plant_house_1.key.enc');
            } else if (hashFile.includes('plant_house_2_')) {
                keyFile = path.join(keyDir, 'plant_house_2.key.enc');
            } else if (hashFile.includes('plant_house_3_')) {
                keyFile = path.join(keyDir, 'plant_house_3.key.enc');
            } else if (hashFile.includes('plant_house_4_')) {
                keyFile = path.join(keyDir, 'plant_house_4.key.enc');
            } else if (hashFile.includes('plant_house_5_')) {
                keyFile = path.join(keyDir, 'plant_house_5.key.enc');
            } else if (hashFile.includes('plant_house_6_')) {
                keyFile = path.join(keyDir, 'plant_house_6.key.enc');
            } else if (hashFile.includes('plant_house_7_')) {
                keyFile = path.join(keyDir, 'plant_house_7.key.enc');
            } else if (hashFile.includes('plant_house_8_')) {
                keyFile = path.join(keyDir, 'plant_house_8.key.enc');
            } else if (hashFile.includes('plant_house_9_')) {
                keyFile = path.join(keyDir, 'plant_house_9.key.enc');
            } else if (hashFile.includes('plant_house_10')) {
                keyFile = path.join(keyDir, 'plant_house_10.key.enc');
            } else {
                throw new Error(`No matching key file for hash file: ${hashFile}`);
            }
            const encryptedDataFile = encryptedDataFiles[i * 2];
            const nonceFile = encryptedDataFiles[i * 2 + 1];

            console.log(`\nNEW ${i+1}, Processing hash file: ${hashFile}`);
            const [hash, aesKeyBuffer, encryptedDataBuffer, nonceBuffer] = await Promise.all([
                fs.readFile(hashFile),
                fs.readFile(keyFile),
                fs.readFile(encryptedDataFile),
                fs.readFile(nonceFile),
            ]);

            const aesKeyString = aesKeyBuffer.toString('hex');
            const encryptedData = encryptedDataBuffer.toString('hex');
            const nonce = nonceBuffer.toString('hex');

            // Split the string and get the device ID by combining elements 1, 2, and 3
            const pathComponents = hashFile.split('/');
            const fileName = pathComponents[pathComponents.length - 1];
            const components = fileName.split('_');

            const deviceIdToStore = components.slice(0, -2).join('_');
            console.log(`Device ID: ${deviceIdToStore}`);
            const deviceIdToStoreH = web3.utils.asciiToHex(deviceIdToStore)

            // Correct the timestamp processing
            const timestampToStore = fileName.replace('.log.hash', '').split('_').slice(-2).join('_');
            console.log(`Timestamp: ${timestampToStore}`);
            const timestampToStoreH = web3.utils.asciiToHex(timestampToStore)

            const hashToStore = '0x' + hash;

            // ipfs part
            let ipfsResult;

            try {
                ipfsResult = await ipfs.add({
                    path: `data_${i+1}.json`,
                    content: JSON.stringify({
                        deviceId: deviceIdToStoreH,
                        timestamp: timestampToStoreH,
                        hash: hashToStore,
                        eccaesKey: aesKeyString,
                        encryptedData: encryptedData,
                        nonce: nonce,
                    }),
                });

                console.log("{");
                console.log(`aesKey: ${aesKeyString}`);
                console.log(`aesKey file location: ${keyFile}`);
                console.log(`encryptedData: ${encryptedData}`);
                console.log(`encryptedData file location: ${encryptedDataFile}`);
                console.log(`nonce: ${nonce}`);
                console.log(`nonce file location: ${nonceFile}`);
                console.log("}");

                console.log(`Data ${i + 1} (DevID+TS+Hash+ECC(AES)+ENC(PT)+nonce) stored on IPFS CID:`, ipfsResult.cid.toString());
                console.log(`IPFS Link: http://localhost:8080/ipfs/${ipfsResult.cid.toString()}`);
            } catch (error) {
                console.error('Error adding data to IPFS:', error);
            }
            // conclude all of the ipfsResult.cid.toString() and store in log folder create a file named "IPFS_CID.log"
            const logDir = '/home/nattapons5/vscode/FirstETHContract/log';
            const logFile = path.join(logDir, 'IPFS_CID.log');
            const ethlogFile = path.join(logDir, 'ETH_CID.log');

            try {
                await fs.mkdir(logDir, { recursive: true });
                await fs.appendFile(logFile, `${ipfsResult.cid.toString()},\n`);
                // console.log(`IPFS CID ${ipfsResult.cid.toString()} logged to ${logFile}`);
            } catch (error) {
                console.error('Error writing IPFS CID to log file:', error);
            }

            // Ethereum part
            // cidToStore rely on line 110 let ipfsResult;
            const cidToStore = ipfsResult.cid.toString();
            //console.log(`IPFS CID: ${cidToStore}`);
            const cidToStoreH = web3.utils.asciiToHex(cidToStore)
            
            try {
                const transactionHash = await instance.methods.storeData(deviceIdToStoreH, timestampToStoreH, hashToStore, cidToStoreH).send({ from: accounts[0], gas: 3000000 });
                console.log(`\nData ${i + 1} stored on Ethereum with transaction hash: ${transactionHash.transactionHash}`);
                await fs.appendFile(ethlogFile, `${transactionHash.transactionHash},\n`);
                // console.log(`Transaction hash ${transactionHash.transactionHash} logged to ${ethlogFile}`);
            } catch (error) {
                console.error('Error sending transaction:', error);
            }
        }
    } catch (error) {
        console.error('Error processing data:', error);
    }
}

const hashDir = '/home/nattapons5/vscode/EncryptHash/hash_plant_house_logs_400_2';
const keyDir = '/home/nattapons5/vscode/EncryptHash/enc_aes_key_logs_2';
const encryptedDataDir = '/home/nattapons5/vscode/EncryptHash/ciphertext_logs_2';

processAllData(hashDir, keyDir, encryptedDataDir);
