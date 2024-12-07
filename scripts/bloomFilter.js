const { promises: fs } = require('fs');
const crypto = require('crypto');

class BloomFilter {
    constructor(size = 2048, hashFunctions = 3) {
        this.size = size;
        this.bitArray = new Array(size).fill(false); // Bit array initialized to false
        this.hashFunctions = hashFunctions;
    }

    // Improved hash function: using SHA256 combined with a seed to generate distinct hash values
    hash(data, seed) {
        const hash = crypto.createHash('sha256').update(data + seed).digest('hex');
        return parseInt(hash.substring(0, 8), 16) % this.size; // Take first 8 chars to ensure consistency
    }

    // Add an item (hash) to the filter
    add(item) {
        console.log("Adding item to Bloom filter:", item);
    
        // Iterate over the hash functions
        for (let i = 0; i < this.hashFunctions; i++) {
            // Calculate the bit array index for this hash function
            const index = this.hash(item, i);
    
            // Log the index being updated
            console.log(`Hash Function ${i + 1} - Updated bit index:`, index);
    
            // Update the bit array at the calculated index
            this.bitArray[index] = true;
        }
    }
    
    // Check if an item (hash) exists in the filter
    contains(item) {
        console.log("Checking item in Bloom filter:", item);
        for (let i = 0; i < this.hashFunctions; i++) {
            const index = this.hash(item, i);
            console.log(`Hash Function ${i + 1} - Checking bit index:`, index);
            if (!this.bitArray[index]) {
                console.log(`Bit at index ${index} is false.`);
                return false; // If any index is false, return false
            }
        }
        console.log("All bits are true, item possibly exists.");
        return true; // If all indices are true, item is in the filter
    }

    // Save the filter state to a file (as binary)
    async saveToFile(filePath) {
        const binaryData = this.bitArray.map(bit => (bit ? 1 : 0)).join('');
        try {
            await fs.writeFile(filePath, binaryData, 'utf-8');
        } catch (error) {
            console.error('Error saving Bloom filter state to file:', error);
        }
    }

    // Load the filter state from a file
    static async loadFromFile(filePath, size = 2048, hashFunctions = 3) {
        try {
            const binaryData = await fs.readFile(filePath, 'utf-8');
            const bitArray = binaryData.split('').map(bit => bit === '1');
            const filter = new BloomFilter(size, hashFunctions);
            filter.bitArray = bitArray;
            return filter;
        } catch (error) {
            console.error('Error loading Bloom filter state:', error);
            return new BloomFilter(size, hashFunctions); // Return a new filter if the file doesn't exist
        }
    }
}

module.exports = BloomFilter;