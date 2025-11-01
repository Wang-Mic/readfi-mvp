// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ReadFiBooks1155 is ERC1155, Ownable {
    string public name = "ReadFi Books";
    string public symbol = "RBOOK";

    constructor(string memory baseURI, address owner_) ERC1155(baseURI) Ownable(owner_) {}

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    function safeMint(address to, uint256 id, uint256 amount, bytes memory data) external onlyOwner {
        _mint(to, id, amount, data);
    }
}
