const { promises: fs } = require('fs');
const crypto = require('crypto');

class AdaptiveBloomFilter {
    constructor(initialSize = 1000, initialMaxSize = 2000, errorRate = 0.01, resizeThreshold = 0.95) {
        this.size = initialSize; // Initial size of the bloom filter
        this.maxSize = initialMaxSize; // Maximum size threshold
        this.errorRate = errorRate;
        this.numItems = 0; // Current number of items
        this.hashFunctions = this.calculateOptimalHashFunctions(this.size, this.numItems);

        // Resize threshold: when the filter is resizeThreshold full, resize automatically
        this.resizeThreshold = resizeThreshold;

        // Initialize the filter
        this.filter = new Array(this.size).fill(false);

        // Set to track items added
        this.itemsSet = new Set();
    }

    // Method to calculate the optimal number of hash functions
    calculateOptimalHashFunctions(size, numItems) {
        if (numItems === 0) return 1; // Avoid division by zero
        return Math.ceil((size / numItems) * Math.log(2));
    }

    // Method to calculate the optimal size of the filter
    calculateOptimalSize(numItems, errorRate) {
        if (numItems === 0) return this.size; // Avoid division by zero
        return Math.ceil(-(numItems * Math.log(errorRate)) / (Math.log(2) ** 2));
    }

    // Method to update the maxSize automatically
    autoUpdateMaxSize() {
        // Calculate the current usage as the ratio of numItems to filter size
        const usageRatio = this.numItems / this.size;

        console.log("usageRatio =", usageRatio);

        // If the filter is getting close to full, update maxSize
        if (usageRatio > this.resizeThreshold && this.size < this.maxSize) {
            this.size *= 2;  // Double the size
            this.hashFunctions = this.calculateOptimalHashFunctions(this.size, this.numItems);
            this.filter = new Array(this.size).fill(false);
            console.log(`Filter size automatically updated to: ${this.size}`);
        }
    }

    // Resize the filter when the number of items exceeds maxSize
    resizeFilter() {
        console.log('Resizing filter...');

        // Calculate new filter size based on current number of items and error rate
        const newSize = this.calculateOptimalSize(this.numItems, this.errorRate);
        const newHashFunctions = this.calculateOptimalHashFunctions(newSize, this.numItems);

        // Create a new filter with the updated size
        const newFilter = new Array(newSize).fill(false);

        // Re-add all items into the new filter
        this.itemsSet.forEach(item => {
            const hashValues = this.getHashValues(item, newSize, newHashFunctions);
            hashValues.forEach(value => {
                newFilter[value] = true;
            });
        });

        // Update the filter parameters
        this.size = newSize;
        this.hashFunctions = newHashFunctions;
        this.filter = newFilter;
    }

    // Add an item to the filter
    add(item) {
        if (this.itemsSet.has(item)) return; // Item already added

        // Automatically update filter size if needed
        this.autoUpdateMaxSize();

        // If the filter exceeds the max size, resize the filter
        if (this.size >= this.maxSize) {
            this.resizeFilter();
        }

        // Add the item to the set
        this.itemsSet.add(item);

        // Hash and set the bits in the filter
        const hashValues = this.getHashValues(item);
        hashValues.forEach(value => {
            this.filter[value] = true;
        });

        this.numItems++;
        console.log(`Item ${item} added to adaptive Bloom filter.`);
    }

    // Get the hash values for an item
    getHashValues(item, newSize, newHashFunctions) {
        if (newSize && newHashFunctions) {
            // Use new size and hash functions for resizing
            const hashValues = [];
            for (let i = 0; i < newHashFunctions; i++) {
                hashValues.push(this.hash(item, i, newSize));
            }
            return hashValues;
        } else {
            // Use current hash functions and size
            const hashValues = [];
            for (let i = 0; i < this.hashFunctions; i++) {
                hashValues.push(this.hash(item, i));
            }
            return hashValues;
        }
    }

    // Perform a hash operation on the item with a seed for each hash function
    hash(data, seed, newSize) {
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const seedString = seed.toString();
        const hash = crypto.createHash('sha256').update(dataString + seedString).digest('hex');
        const hashInt = parseInt(hash.substring(0, 8), 16);
        return newSize ? hashInt % newSize : hashInt % this.size;
    }

    // Check if an item exists in the filter
    exists(item) {
        const hashValues = this.getHashValues(item);
        const exists = hashValues.every(value => this.filter[value]);
        console.log(`Item ${item} exists in adaptive Bloom filter: ${exists}`);
        return exists;
    }

    // Save the current filter state to a file
    saveToFile(filePath) {
        const data = {
            size: this.size,
            maxSize: this.maxSize,
            numItems: this.numItems,
            errorRate: this.errorRate,
            resizeThreshold: this.resizeThreshold,
            hashFunctions: this.hashFunctions,
            filter: this.filter,
            itemsSet: Array.from(this.itemsSet),
        };
        fs.writeFile(filePath, JSON.stringify(data));
    }

    // Load the filter state from a file
    // Load the filter state from a file
    static loadFromFile(filePath) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const filter = new AdaptiveBloomFilter(
            data.size,
            data.maxSize,
            data.errorRate,
            data.resizeThreshold
        );
        filter.size = data.size;
        filter.maxSize = data.maxSize;
        filter.numItems = data.numItems;
        filter.errorRate = data.errorRate;
        filter.resizeThreshold = data.resizeThreshold;
        filter.hashFunctions = data.hashFunctions;
        filter.filter = data.filter;
        filter.itemsSet = new Set(data.itemsSet);
        return filter;
    }
}

module.exports = AdaptiveBloomFilter;