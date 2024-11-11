// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract HashStorage {
    bytes32[] public hashes;

    function storeHash(bytes32 hash) public {
        hashes.push(hash);
    }

    function getHash(uint256 index) public view returns (bytes32) {
        require(index < hashes.length, "Index out of bounds");
        return hashes[index];
    }

    function getHashCount() public view returns (uint256) {
        return hashes.length;
    }
}
