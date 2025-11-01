// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBooks1155 {
    function safeMint(address to, uint256 id, uint256 amount, bytes calldata data) external;
}

interface ICompliance {
    function isCompliant(address user, uint256 skuId) external view returns (bool);
}

contract ReadFiMintGateway {
    address public owner;
    IBooks1155 public books;
    ICompliance public compliance;

    // sku 是否合規版
    mapping(uint256 => bool) public regulatedSku;

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    constructor(address _books, address _compliance) {
        owner = msg.sender;
        books = IBooks1155(_books);
        compliance = ICompliance(_compliance);
    }

    function setRegulatedSku(uint256 skuId, bool on) external onlyOwner {
        regulatedSku[skuId] = on;
    }

    function setCompliance(address c) external onlyOwner {
        compliance = ICompliance(c);
    }

    function setBooks(address b) external onlyOwner {
        books = IBooks1155(b);
    }

    function mint(address to, uint256 skuId, uint256 amount) external onlyOwner {
        if (regulatedSku[skuId]) {
            require(compliance.isCompliant(to, skuId), "not compliant");
        }
        books.safeMint(to, skuId, amount, "");
    }
}
