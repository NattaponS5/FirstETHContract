// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract DataStore {
    // Mapping of data indexes to their corresponding data
    mapping (uint256 => bytes) public dataIndex;

    // Event emitted when new data is stored
    event DataStored(uint256 indexed index, bytes data);

    // Function to store data by index
    function storeData(uint256 index, bytes memory data) public {
        // Check if the index is not already in use
        require(dataIndex[index].length == 0, "Index already in use");

        // Store the data at the specified index
        dataIndex[index] = data;

        // Emit the DataStored event
        emit DataStored(index, data);
    }

    // Function to retrieve data by index
    function getData(uint256 index) public view returns (bytes memory) {
        // Check if the index exists
        require(dataIndex[index].length != 0, "Index does not exist");

        // Return the data at the specified index
        return dataIndex[index];
    }
}
