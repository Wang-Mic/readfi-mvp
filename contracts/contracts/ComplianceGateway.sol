// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ComplianceGateway {
    mapping(address => bool) public verifiedUsers;
    address public owner;

    event Verified(address user);
    event Revoked(address user);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function markVerified(address user) external onlyOwner {
        verifiedUsers[user] = true;
        emit Verified(user);
    }

    function revokeVerification(address user) external onlyOwner {
        verifiedUsers[user] = false;
        emit Revoked(user);
    }

    function isVerified(address user) external view returns (bool) {
        return verifiedUsers[user];
    }
}
