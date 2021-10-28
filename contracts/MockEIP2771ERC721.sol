//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";

contract MockEIP2771ERC721 is ERC721, BaseRelayRecipient {
    constructor(address _trustedForwarder) ERC721("MockEIP2771ERC721", "TKN") {
        _setTrustedForwarder(_trustedForwarder);
        _mint(msg.sender, 0); // token 0
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
}
