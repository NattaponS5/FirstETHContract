// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract HashStorage {
    bytes32[] public hashes;
    string[] public deviceId;
    string[] public timestamp;
    string[] public cid;

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

    function storeDeviceId(string memory id) public {
        deviceId.push(id);
    }

    function getDeviceId(uint256 index) public view returns (string memory) {
        require(index < deviceId.length, "Index out of bounds");
        return deviceId[index];
    }

    function getDeviceIdCount() public view returns (uint256) {
        return deviceId.length;
    }

    function storeTimestamp(string memory time) public {
        timestamp.push(time);
    }

    function getTimestamp(uint256 index) public view returns (string memory) {
        require(index < timestamp.length, "Index out of bounds");
        return timestamp[index];
    }

    function getTimestampCount() public view returns (uint256) {
        return timestamp.length;
    }

    function storeCid(string memory id) public {
        cid.push(id);
    }

    function getCid(uint256 index) public view returns (string memory) {
        require(index < cid.length, "Index out of bounds");
        return cid[index];
    }

    function getCidCount() public view returns (uint256) {
        return cid.length;
    }

    function storeData(string memory newDeviceId, string memory newTimestamp, bytes32 hash, string memory newCid) public {
        storeDeviceId(newDeviceId);
        storeTimestamp(newTimestamp);
        storeHash(hash);
        storeCid(newCid);
    }
}
