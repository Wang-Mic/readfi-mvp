// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReadFiComplianceManager {
    address public owner;
    address public opl; // Oracle / OPL writer

    struct Receipt {
        bool ok;
        uint64 expiry;   // unix ts
    }

    // user => skuId => receipt
    mapping(address => mapping(uint256 => Receipt)) public receipts;

    event OplUpdated(address indexed user, uint256 indexed skuId, bool ok, uint64 expiry, bytes32 ref);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier onlyOPL() { require(msg.sender == opl, "not opl"); _; }

    constructor(address _opl) {
        owner = msg.sender;
        opl = _opl;
    }

    function setOPL(address _opl) external onlyOwner {
        opl = _opl;
    }

    // OPL 寫入最小揭露結果（不放 PII）
    function setReceipt(address user, uint256 skuId, bool ok, uint64 expiry, bytes32 ref) external onlyOPL {
        receipts[user][skuId] = Receipt(ok, expiry);
        emit OplUpdated(user, skuId, ok, expiry, ref);
    }

    function isCompliant(address user, uint256 skuId) external view returns (bool) {
        Receipt memory r = receipts[user][skuId];
        return r.ok && r.expiry >= uint64(block.timestamp);
    }

    function getReceipt(address user, uint256 skuId) external view returns (Receipt memory) {
        return receipts[user][skuId];
    }
}
