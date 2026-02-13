// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PharmaShield
 * @dev Decentralized pharmaceutical supply chain verification system
 * Built for Polygon Testnet (Mumbai)
 * 
 * Features:
 * - Batch registration and verification
 * - Anti-counterfeiting measures through blockchain immutability
 * - Manufacturer-based tracking
 * - Immutable audit trail of all batches
 * 
 * Contract deployed on Polygon Mumbai Testnet
 * Chain ID: 80002
 * Network: Mumbai (https://mumbai.polygonscan.com)
 */

contract PharmaShield {
    // ============ Types ============
    
    struct Batch {
        string manufacturerName;
        string batchHash;
        uint256 timestamp;
        address registeredBy;
        bool exists;
    }

    struct ScanRecord {
        uint256 timestamp;
        string status;
        string location;
    }

    // ============ State Variables ============
    
    address public owner;
    
    mapping(string => Batch) public batches;
    mapping(string => ScanRecord[]) public scanHistory;
    mapping(address => uint256) public registrationCount;
    
    string[] public allBatchIds;
    
    // ============ Events ============
    
    event BatchRegistered(
        string indexed batchId,
        string manufacturerName,
        address indexed registeredBy,
        uint256 timestamp
    );
    
    event BatchVerified(
        string indexed batchId,
        string verificationStatus,
        address indexed verifier,
        uint256 timestamp
    );
    
    event ScanRecorded(
        string indexed batchId,
        string status,
        string location,
        uint256 timestamp
    );

    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner");
        _;
    }

    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
    }

    // ============ Core Functions ============
    
    /**
     * @dev Register a new pharmaceutical batch
     * @param batchId Unique batch identifier (e.g., "BATCH-2026-001")
     * @param manufacturerName Name of the manufacturer
     * @param batchHash SHA-256 hash of batch metadata
     */
    function registerBatch(
        string calldata batchId,
        string calldata manufacturerName,
        string calldata batchHash
    ) external {
        require(!batches[batchId].exists, "Batch already registered");
        require(bytes(batchId).length > 0, "Batch ID cannot be empty");
        require(bytes(manufacturerName).length > 0, "Manufacturer name cannot be empty");
        require(bytes(batchHash).length == 64, "Hash must be 256-bit hex");
        
        batches[batchId] = Batch({
            manufacturerName: manufacturerName,
            batchHash: batchHash,
            timestamp: block.timestamp,
            registeredBy: msg.sender,
            exists: true
        });
        
        allBatchIds.push(batchId);
        registrationCount[msg.sender]++;

        emit BatchRegistered(batchId, manufacturerName, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify a batch exists on-chain
     * @param batchId The batch ID to verify
     * @return manufacturerName Manufacturer name if found
     * @return batchHash Hash of batch metadata
     * @return timestamp Registration timestamp
     * @return exists Whether batch is registered
     */
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

    /**
     * @dev Record a scan/verification event for a batch
     * @param batchId The batch ID being scanned
     * @param status Verification status ("authentic", "suspicious", "not_found")
     * @param location Geographic location of scan
     */
    function recordScan(
        string calldata batchId,
        string calldata status,
        string calldata location
    ) external {
        require(batches[batchId].exists, "Batch not registered");
        
        scanHistory[batchId].push(ScanRecord({
            timestamp: block.timestamp,
            status: status,
            location: location
        }));

        emit ScanRecorded(batchId, status, location, block.timestamp);
    }

    /**
     * @dev Get scan history for a batch
     * @param batchId The batch ID
     * @return Array of scan records
     */
    function getScanHistory(string calldata batchId)
        external
        view
        returns (ScanRecord[] memory)
    {
        return scanHistory[batchId];
    }

    /**
     * @dev Get total number of registered batches
     * @return Total batch count
     */
    function getTotalBatches() external view returns (uint256) {
        return allBatchIds.length;
    }

    /**
     * @dev Get batch ID at specific index
     * @param index Position in batch list
     * @return Batch ID at that index
     */
    function getBatchIdAt(uint256 index) external view returns (string memory) {
        require(index < allBatchIds.length, "Index out of bounds");
        return allBatchIds[index];
    }

    /**
     * @dev Get registration count for an address
     * @param addr The address to check
     * @return Number of batches registered by this address
     */
    function getRegistrationCount(address addr) external view returns (uint256) {
        return registrationCount[addr];
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Transfer contract ownership (admin only)
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
