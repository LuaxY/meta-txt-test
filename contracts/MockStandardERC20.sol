//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockStandardERC20 is ERC20 {
    constructor() ERC20("MockStandardERC20", "TKN") {
        _mint(msg.sender, 1000000 * 10**18); // 1,000,000 TKN
    }
}
