//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockStandardERC721 is ERC721 {
    constructor() ERC721("MockStandardERC721", "TKN") {
        _mint(msg.sender, 0); // token 0
    }
}
