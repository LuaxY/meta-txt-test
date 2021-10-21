//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";

contract MockEIP2771ERC20 is ERC20, BaseRelayRecipient {
    constructor(address _trustedForwarder) ERC20("MockEIP2771ERC20", "TKN") {
        trustedForwarder = _trustedForwarder;
        _mint(msg.sender, 1000000 * 10**18); // 1,000,000 TKN
    }

    function _msgSender()
        internal
        view
        override(Context, BaseRelayRecipient)
        returns (address)
    {
        return BaseRelayRecipient._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, BaseRelayRecipient)
        returns (bytes memory)
    {
        return BaseRelayRecipient._msgData();
    }

    function versionRecipient() external pure override returns (string memory) {
        return "1";
    }

    // function transfer(address recipient, uint256 amount)
    //     public
    //     virtual
    //     override
    //     returns (bool)
    // {
    //     _transfer(BaseRelayRecipient._msgSender(), recipient, amount);
    //     return true;
    // }
}
