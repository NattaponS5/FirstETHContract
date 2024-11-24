class AdaptiveBloomFilter {
    constructor(size = 10000, hashFunctions = 3) {
        this.size = size;
        this.hashFunctions = hashFunctions;
        this.bitArray = new Array(size).fill(0);
    }

    hash(item, seed) {
        let hash = 0;
        for (let i = 0; i < item.length; i++) {
            hash = (hash << 5) - hash + item.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
            hash += seed;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash % this.size);
    }

    add(item) {
        for (let i = 0; i < this.hashFunctions; i++) {
            const index = this.hash(item, i);
            this.bitArray[index] = 1;
        }
    }

    contains(item) {
        for (let i = 0; i < this.hashFunctions; i++) {
            const index = this.hash(item, i);
            if (this.bitArray[index] === 0) {
                return false;
            }
        }
        return true;
    }

    adapt(falsePositiveRate) {
        // Adjust the size and hash functions based on the false positive rate
        if (falsePositiveRate > 0.1) {
            this.size *= 2;
            this.hashFunctions += 1;
            this.bitArray = new Array(this.size).fill(0);
        } else if (falsePositiveRate < 0.01) {
            this.size /= 2;
            this.hashFunctions -= 1;
            this.bitArray = new Array(this.size).fill(0);
        }
    }
}

module.exports = AdaptiveBloomFilter;