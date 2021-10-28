//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol";

contract MockGnosisSafeProxyFactory is GnosisSafeProxyFactory {
    constructor() GnosisSafeProxyFactory() {
    }
}