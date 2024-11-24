class AdaptiveBloomFilter {
    constructor(size = 1000, hashFunctions = 3) {
        this.size = size; // Initial size of the Bloom filter
        this.hashFunctions = hashFunctions; // Number of hash functions
        this.bitArray = new Uint8Array(Math.ceil(size / 8)); // Bit array to store the Bloom filter
        this.elementCount = 0; // Counter to track the number of elements
    }

    add(item) {
        // Add an item to the Bloom filter
        for (let i = 0; i < this.hashFunctions; i++) {
            const index = this.hash(item, i) % this.size;
            const byteIndex = Math.floor(index / 8);
            const bitIndex = index % 8;
            this.bitArray[byteIndex] |= (1 << bitIndex); // Set the bit
        }
        this.elementCount++;
        this.adjustParameters(); // Adjust Bloom filter parameters if needed
    }

    contains(item) {
        // Check if an item might exist in the Bloom filter
        for (let i = 0; i < this.hashFunctions; i++) {
            const index = this.hash(item, i) % this.size;
            const byteIndex = Math.floor(index / 8);
            const bitIndex = index % 8;
            if ((this.bitArray[byteIndex] & (1 << bitIndex)) === 0) {
                return false; // Bit not set, item definitely not present
            }
        }
        return true; // Might be present
    }

    hash(item, seed) {
        // Generate a hash for the item using the seed
        let hash = 0;
        for (let i = 0; i < item.length; i++) {
            hash = (hash << 5) - hash + item.charCodeAt(i);
            hash |= 0; // Convert to 32-bit integer
        }
        return hash ^ seed; // XOR with the seed to create multiple hash functions
    }

    adjustParameters() {
        // Adjust parameters based on load factor
        const loadFactor = this.elementCount / this.size;
        const thresholdHigh = 0.7 + (this.elementCount / 1000000); // High threshold for resizing
        const thresholdLow = 0.3 - (this.elementCount / 1000000); // Low threshold for shrinking

        if (loadFactor > thresholdHigh) {
            this.size *= 2; // Double the size
            this.bitArray = new Uint8Array(Math.ceil(this.size / 8)); // Reinitialize bit array
            this.hashFunctions += 1; // Increase the number of hash functions
            this.rehash();
        } else if (loadFactor < thresholdLow && this.size > 1000) {
            this.size = Math.floor(this.size / 2); // Halve the size
            this.bitArray = new Uint8Array(Math.ceil(this.size / 8)); // Reinitialize bit array
            this.hashFunctions = Math.max(1, this.hashFunctions - 1); // Reduce hash functions but not below 1
            this.rehash();
        }
    }

    rehash() {
        // Rehash all elements in the filter after resizing
        const newBitArray = new Uint8Array(Math.ceil(this.size / 8));
        for (let i = 0; i < this.bitArray.length * 8; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = i % 8;
            if ((this.bitArray[byteIndex] & (1 << bitIndex)) !== 0) {
                for (let j = 0; j < this.hashFunctions; j++) {
                    const newIndex = this.hash(i.toString(), j) % this.size;
                    const newByteIndex = Math.floor(newIndex / 8);
                    const newBitIndex = newIndex % 8;
                    newBitArray[newByteIndex] |= (1 << newBitIndex);
                }
            }
        }
        this.bitArray = newBitArray; // Replace the old bit array with the new one
    }
}

module.exports = { AdaptiveBloomFilter };
