//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";

contract MockGnosisSafe is GnosisSafe {
    constructor() GnosisSafe() {
    }
}