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
GnosisSafe deployed at: 0xeA9e96EC29aDAfB0962c23eDEe0caafc250f75C7
GnosisSafeProxyFactory deployed at: 0x691EbA0B80Caee249931e30daAAEe29B7B792b22
CompatibilityFallbackHandler deployed at: 0xdB8da6B0a8d681eC5d2A705C2cE6E93436c0EbDC
ERC20Token deployed at: 0x6c7179bB7105344b91B56328Fcc72E9c18b845d5
Counter deployed at: 0xe928ab3623b05F0C329E07E99ae34E301C2Ac360

hh verify --contract @gnosis.pm/safe-contracts/contracts/GnosisSafe.sol:GnosisSafe 0xeA9e96EC29aDAfB0962c23eDEe0caafc250f75C7
hh verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol:GnosisSafeProxyFactory 0x691EbA0B80Caee249931e30daAAEe29B7B792b22
hh verify --contract @gnosis.pm/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol:CompatibilityFallbackHandler 0xdB8da6B0a8d681eC5d2A705C2cE6E93436c0EbDC
hh verify --contract contracts/MockStandardERC20.sol:MockStandardERC20 0x6c7179bB7105344b91B56328Fcc72E9c18b845d5
hh verify --contract contracts/Counter.sol:Counter 0xe928ab3623b05F0C329E07E99ae34E301C2Ac360
*/

/*
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol:GnosisSafe at 0xeA9e96EC29aDAfB0962c23eDEe0caafc250f75C7
for verification on Etherscan. Waiting for verification result...

Successfully verified contract GnosisSafe on Etherscan.
https://goerli.etherscan.io/address/0xeA9e96EC29aDAfB0962c23eDEe0caafc250f75C7#code
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol:GnosisSafeProxyFactory at 0x691EbA0B80Caee249931e30daAAEe29B7B792b22
for verification on Etherscan. Waiting for verification result...

Successfully verified contract GnosisSafeProxyFactory on Etherscan.
https://goerli.etherscan.io/address/0x691EbA0B80Caee249931e30daAAEe29B7B792b22#code
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol:CompatibilityFallbackHandler at 0xdB8da6B0a8d681eC5d2A705C2cE6E93436c0EbDC
for verification on Etherscan. Waiting for verification result...

Successfully verified contract CompatibilityFallbackHandler on Etherscan.
https://goerli.etherscan.io/address/0xdB8da6B0a8d681eC5d2A705C2cE6E93436c0EbDC#code
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
contracts/MockStandardERC20.sol:MockStandardERC20 at 0x6c7179bB7105344b91B56328Fcc72E9c18b845d5
for verification on Etherscan. Waiting for verification result...

Successfully verified contract MockStandardERC20 on Etherscan.
https://goerli.etherscan.io/address/0x6c7179bB7105344b91B56328Fcc72E9c18b845d5#code
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
contracts/Counter.sol:Counter at 0xe928ab3623b05F0C329E07E99ae34E301C2Ac360
for verification on Etherscan. Waiting for verification result...

Successfully verified contract Counter on Etherscan.
https://goerli.etherscan.io/address/0xe928ab3623b05F0C329E07E99ae34E301C2Ac360#code
*/