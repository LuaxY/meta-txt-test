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

    const GNOSIS_SAFE_SIGNELTON_ADDRESS = "0xa76331135509E4C982f3534A4C80b18Fb79BB27d";
    const GNOSIS_SAFE_PROXY_FACTORY_ADDRESS = "0x3355Ff1809784a6361437E53d1dDaac88e1a6008";
    const COMPATIBILITY_FALLBACK_HANDLER_ADDRESS = "0xD557d951349849ecEBfD3D5308e3df362E2aAF45";

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
Bob EOA 0x7c15d0fbC081C05Ff0E5442c87aC46396aA70488, balance: 0
Zoe EOA 0x5965b116464E09a13AcAaeC3a37cB2dB066e7929, balance: 0

GnosisSafe deployed at: 0xa76331135509E4C982f3534A4C80b18Fb79BB27d
GnosisSafeProxyFactory deployed at: 0x3355Ff1809784a6361437E53d1dDaac88e1a6008
CompatibilityFallbackHandler deployed at: 0xD557d951349849ecEBfD3D5308e3df362E2aAF45

GnosisSafeProxy deployed at: 0x4443Ff21B6Fc0f28c8DE9E7BeFff2c727D48c4d2
hh verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy 0x4443Ff21B6Fc0f28c8DE9E7BeFff2c727D48c4d2 0xa76331135509E4C982f3534A4C80b18Fb79BB27d

GnosisSafeProxy deployed at: 0xDA2397Ec2517865ca31F9017ef0D9Ae43E0AE9c6
hh verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy 0xDA2397Ec2517865ca31F9017ef0D9Ae43E0AE9c6 0xa76331135509E4C982f3534A4C80b18Fb79BB27d
*/

/*
Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy at 0x4443Ff21B6Fc0f28c8DE9E7BeFff2c727D48c4d2
for verification on Etherscan. Waiting for verification result...

Successfully verified contract GnosisSafeProxy on Etherscan.
https://rinkeby.etherscan.io/address/0x4443Ff21B6Fc0f28c8DE9E7BeFff2c727D48c4d2#code

Nothing to compile
Compiling 1 file with 0.8.9
Successfully submitted source code for contract
@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy at 0xDA2397Ec2517865ca31F9017ef0D9Ae43E0AE9c6
for verification on Etherscan. Waiting for verification result...

Successfully verified contract GnosisSafeProxy on Etherscan.
https://rinkeby.etherscan.io/address/0xDA2397Ec2517865ca31F9017ef0D9Ae43E0AE9c6#code
*/