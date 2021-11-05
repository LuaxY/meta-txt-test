import { run, ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";

const prompt = require('prompt-sync')();
dotenvConfig();

// hh run scripts/demo/1-create-two-new-users.ts

async function main() {
    const accounts = await ethers.getSigners();

    const alice = accounts[1];
    console.log("Alice EOA:", alice.address, "balance:", await alice.getBalance());

    const david = accounts[2];
    console.log("David EOA:", david.address, "balance:", await david.getBalance());

    prompt('Press enter to continue...');

    const GNOSIS_SAFE_SIGNELTON_ADDRESS = "0xeA9e96EC29aDAfB0962c23eDEe0caafc250f75C7";
    const GNOSIS_SAFE_PROXY_FACTORY_ADDRESS = "0x691EbA0B80Caee249931e30daAAEe29B7B792b22";
    const COMPATIBILITY_FALLBACK_HANDLER_ADDRESS = "0xdB8da6B0a8d681eC5d2A705C2cE6E93436c0EbDC";

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");
    const gnosisSafe = GnosisSafe.attach(GNOSIS_SAFE_SIGNELTON_ADDRESS);
    console.log("GnosisSafe deployed at:", gnosisSafe.address);

    const GnosisSafeProxyFactory = await ethers.getContractFactory("GnosisSafeProxyFactory");
    const gnosisSafeProxyFactory = GnosisSafeProxyFactory.attach(GNOSIS_SAFE_PROXY_FACTORY_ADDRESS);
    console.log("GnosisSafeProxyFactory deployed at:", gnosisSafeProxyFactory.address);

    const CompatibilityFallbackHandler = await ethers.getContractFactory("CompatibilityFallbackHandler");
    const compatibilityFallbackHandler = CompatibilityFallbackHandler.attach(COMPATIBILITY_FALLBACK_HANDLER_ADDRESS);
    console.log("CompatibilityFallbackHandler deployed at:", compatibilityFallbackHandler.address);

    prompt('Press enter to continue...');

    await createNewUserWallet(alice, gnosisSafe, gnosisSafeProxyFactory, compatibilityFallbackHandler);
    await createNewUserWallet(david, gnosisSafe, gnosisSafeProxyFactory, compatibilityFallbackHandler);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

async function createNewUserWallet(user: any, gnosisSafe: any, gnosisSafeProxyFactory: any, compatibilityFallbackHandler: any) {
    const params = [
        [user.address], // Owners
        1, // threshold
        "0x0000000000000000000000000000000000000000", // To
        "0x", // Data
        compatibilityFallbackHandler.address, // FallbackHandler
        "0x0000000000000000000000000000000000000000", // PaymentMaster
        0, // Payment
        "0x0000000000000000000000000000000000000000", // PaymentReceiver
    ]

    const initializer = gnosisSafe.interface.encodeFunctionData("setup", params);
    const gnosisSafeProxyAddress = await gnosisSafeProxyFactory.createProxyWithNonce(gnosisSafe.address, initializer, Date.now());
    console.log("TX GnosisSafeProxyFactory.createProxyWithNonce():", gnosisSafeProxyAddress.hash);

    const receipt = await gnosisSafeProxyAddress.wait();
    const proxyCreactionEvents = receipt.events?.filter((x: any) => { return x.event == "ProxyCreation" })
    console.log("GnosisSafeProxy deployed at:", proxyCreactionEvents[0].args.proxy);

    console.log("hh verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy", proxyCreactionEvents[0].args.proxy, gnosisSafe.address)
}

/*
Alice EOA: 0x7c15d0fbC081C05Ff0E5442c87aC46396aA70488 balance: 0
David EOA: 0x5965b116464E09a13AcAaeC3a37cB2dB066e7929 balance: 0

GnosisSafe deployed at: 0xeA9e96EC29aDAfB0962c23eDEe0caafc250f75C7
GnosisSafeProxyFactory deployed at: 0x691EbA0B80Caee249931e30daAAEe29B7B792b22
CompatibilityFallbackHandler deployed at: 0xdB8da6B0a8d681eC5d2A705C2cE6E93436c0EbDC

TX GnosisSafeProxyFactory.createProxyWithNonce(): 0x4393b2359b62dce76596e1a7ac610a1909155156718277b24fcd2fa88459d320
GnosisSafeProxy deployed at: 0xD79e44a675F7e98539b860BEadfdd56dA580DCAF
hh verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy 0xD79e44a675F7e98539b860BEadfdd56dA580DCAF 0xeA9e96EC29aDAfB0962c23eDEe0caafc250f75C7

TX GnosisSafeProxyFactory.createProxyWithNonce(): 0x77621e01c9438a0acb23e7f7af8ff015007f7c48aa8b970c31c5ce558a451da7
GnosisSafeProxy deployed at: 0x5D8f7aEe31782f37D02E133d08E3Ff1D22179b19
hh verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy 0x5D8f7aEe31782f37D02E133d08E3Ff1D22179b19 0xeA9e96EC29aDAfB0962c23eDEe0caafc250f75C7
*/

/*
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy at 0xD79e44a675F7e98539b860BEadfdd56dA580DCAF
for verification on Etherscan. Waiting for verification result...

Successfully verified contract GnosisSafeProxy on Etherscan.
https://goerli.etherscan.io/address/0xD79e44a675F7e98539b860BEadfdd56dA580DCAF#code

Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy at 0x5D8f7aEe31782f37D02E133d08E3Ff1D22179b19
for verification on Etherscan. Waiting for verification result...

Successfully verified contract GnosisSafeProxy on Etherscan.
https://goerli.etherscan.io/address/0x5D8f7aEe31782f37D02E133d08E3Ff1D22179b19#code
*/