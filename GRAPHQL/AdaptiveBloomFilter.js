class AdaptiveBloomFilter {
    constructor(size = 1000, hashFunctions = 3) {
        this.size = size;
        this.hashFunctions = hashFunctions;
        this.bitArray = new Uint8Array(Math.ceil(size / 8));
        this.elementCount = 0;
    }

    add(item) {
        for (let i = 0; i < this.hashFunctions; i++) {
            const index = this.hash(item, i) % this.size;
            const byteIndex = Math.floor(index / 8);
            const bitIndex = index % 8;
            this.bitArray[byteIndex] |= (1 << bitIndex);
        }
        this.elementCount++;
        this.adjustParameters();
    }

    contains(item) {
        for (let i = 0; i < this.hashFunctions; i++) {
            const index = this.hash(item, i) % this.size;
            const byteIndex = Math.floor(index / 8);
            const bitIndex = index % 8;
            if ((this.bitArray[byteIndex] & (1 << bitIndex)) === 0) return false;
        }
        return true;
    }

    hash(item, seed) {
        let hash = 0;
        for (let i = 0; i < item.length; i++) {
            hash = (hash << 5) - hash + item.charCodeAt(i);
            hash |= 0; // Convert to 32-bit integer
        }
        return hash ^ seed;
    }

    adjustParameters() {
        const loadFactor = this.elementCount / this.size;
        const thresholdHigh = 0.7 + (this.elementCount / 1000000);
        const thresholdLow = 0.3 - (this.elementCount / 1000000);
    
        if (loadFactor > thresholdHigh) {
            this.size *= 2;
            this.bitArray = new Uint8Array(Math.ceil(this.size / 8));
            this.hashFunctions += 1;
            this.rehash();
        } else if (loadFactor < thresholdLow && this.size > 1000) {
            this.size = Math.floor(this.size / 2);
            this.bitArray = new Uint8Array(Math.ceil(this.size / 8));
            this.hashFunctions -= 1;
            this.rehash();
        }
    }
    

    rehash() {
        const newBitArray = new Array(this.size).fill(0);
        for (let i = 0; i < this.bitArray.length; i++) {
            if (this.bitArray[i] === 1) {
                for (let j = 0; j < this.hashFunctions; j++) {
                    const index = this.hash(this.bitArray[i], j) % this.size;
                    newBitArray[index] = 1;
                }
            }
        }
        this.bitArray = newBitArray;
    }
}

module.exports = { AdaptiveBloomFilter };
