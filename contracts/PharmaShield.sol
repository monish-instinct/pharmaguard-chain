// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PharmaShield {
    struct Batch {
        string manufacturerName;
        string batchHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Batch) private batches;
    
    event BatchRegistered(string indexed batchId, string manufacturerName, uint256 timestamp);

    function registerBatch(
        string calldata batchId,
        string calldata manufacturerName,
        string calldata batchHash
    ) external {
        require(!batches[batchId].exists, "Batch already registered");
        
        batches[batchId] = Batch({
            manufacturerName: manufacturerName,
            batchHash: batchHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit BatchRegistered(batchId, manufacturerName, block.timestamp);
    }

    function verifyBatch(string calldata batchId) 
        external 
        view 
        returns (
            string memory manufacturerName,
            string memory batchHash,
            uint256 timestamp,
            bool exists
        ) 
    {
        Batch memory batch = batches[batchId];
        return (batch.manufacturerName, batch.batchHash, batch.timestamp, batch.exists);
    }
}
