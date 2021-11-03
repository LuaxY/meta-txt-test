import { run, ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// hh run scripts/demo/0-deploy-required-contracts.ts

async function main() {
    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");
    const gnosisSafe = await GnosisSafe.deploy();
    await gnosisSafe.deployed();
    console.log("GnosisSafe deployed at:", gnosisSafe.address);

    const GnosisSafeProxyFactory = await ethers.getContractFactory("GnosisSafeProxyFactory");
    const gnosisSafeProxyFactory = await GnosisSafeProxyFactory.deploy();
    await gnosisSafeProxyFactory.deployed();
    console.log("GnosisSafeProxyFactory deployed at:", gnosisSafeProxyFactory.address);

    const CompatibilityFallbackHandler = await ethers.getContractFactory("CompatibilityFallbackHandler");
    const compatibilityFallbackHandler = await CompatibilityFallbackHandler.deploy();
    await compatibilityFallbackHandler.deployed();
    console.log("CompatibilityFallbackHandler deployed at:", compatibilityFallbackHandler.address);

    const ERC20Token = await ethers.getContractFactory("MockStandardERC20");
    const erc20Token = await ERC20Token.deploy();
    await erc20Token.deployed();
    console.log("ERC20Token deployed at:", erc20Token.address);

    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    await counter.deployed();
    console.log("Counter deployed at:", counter.address);

    console.log("hh verify --contract @gnosis.pm/safe-contracts/contracts/GnosisSafe.sol:GnosisSafe", gnosisSafe.address);
    console.log("hh verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol:GnosisSafeProxyFactory", gnosisSafeProxyFactory.address);
    console.log("hh verify --contract @gnosis.pm/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol:CompatibilityFallbackHandler", compatibilityFallbackHandler.address);
    console.log("hh verify --contract contracts/MockStandardERC20.sol:MockStandardERC20", erc20Token.address);
    console.log("hh verify --contract contracts/Counter.sol:Counter", counter.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/*
GnosisSafe deployed at: 0xa76331135509E4C982f3534A4C80b18Fb79BB27d
GnosisSafeProxyFactory deployed at: 0x3355Ff1809784a6361437E53d1dDaac88e1a6008
CompatibilityFallbackHandler deployed at: 0xD557d951349849ecEBfD3D5308e3df362E2aAF45
ERC20Token deployed at: 0xB1e9229061cc31e6d67ec812872e97A7c51801AE
Counter deployed at: 0x107935cBAA8bBC1Bc2c5C78747Bc653504Effd0A

hh verify --contract @gnosis.pm/safe-contracts/contracts/GnosisSafe.sol:GnosisSafe 0xa76331135509E4C982f3534A4C80b18Fb79BB27d
hh verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol:GnosisSafeProxyFactory 0x3355Ff1809784a6361437E53d1dDaac88e1a6008
hh verify --contract @gnosis.pm/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol:CompatibilityFallbackHandler 0xD557d951349849ecEBfD3D5308e3df362E2aAF45
hh verify --contract contracts/MockStandardERC20.sol:MockStandardERC20 0xB1e9229061cc31e6d67ec812872e97A7c51801AE
hh verify --contract contracts/Counter.sol:Counter 0x107935cBAA8bBC1Bc2c5C78747Bc653504Effd0A
*/

/*
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol:GnosisSafe at 0xa76331135509E4C982f3534A4C80b18Fb79BB27d
for verification on Etherscan. Waiting for verification result...

Successfully verified contract GnosisSafe on Etherscan.
https://rinkeby.etherscan.io/address/0xa76331135509E4C982f3534A4C80b18Fb79BB27d#code
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol:GnosisSafeProxyFactory at 0x3355Ff1809784a6361437E53d1dDaac88e1a6008
for verification on Etherscan. Waiting for verification result...

Successfully verified contract GnosisSafeProxyFactory on Etherscan.
https://rinkeby.etherscan.io/address/0x3355Ff1809784a6361437E53d1dDaac88e1a6008#code
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol:CompatibilityFallbackHandler at 0xD557d951349849ecEBfD3D5308e3df362E2aAF45
for verification on Etherscan. Waiting for verification result...

Successfully verified contract CompatibilityFallbackHandler on Etherscan.
https://rinkeby.etherscan.io/address/0xD557d951349849ecEBfD3D5308e3df362E2aAF45#code
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
contracts/MockStandardERC20.sol:MockStandardERC20 at 0xB1e9229061cc31e6d67ec812872e97A7c51801AE
for verification on Etherscan. Waiting for verification result...

Successfully verified contract MockStandardERC20 on Etherscan.
https://rinkeby.etherscan.io/address/0xB1e9229061cc31e6d67ec812872e97A7c51801AE#code
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
contracts/Counter.sol:Counter at 0x107935cBAA8bBC1Bc2c5C78747Bc653504Effd0A
for verification on Etherscan. Waiting for verification result...

Successfully verified contract Counter on Etherscan.
https://rinkeby.etherscan.io/address/0x107935cBAA8bBC1Bc2c5C78747Bc653504Effd0A#code
*/