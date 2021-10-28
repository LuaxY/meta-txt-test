import { run, ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { relay } from "./utils/relay"
import { signMetaTxRequest } from "./utils/sign"
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// npx hardhat run scripts/6-proxified-gnosis-safe.ts

async function main() {
    const accounts = await ethers.getSigners();

    const GnosisSafe = await ethers.getContractFactory("MockGnosisSafe");
    const gnosisSafe = await GnosisSafe.attach("0xc09963688b72eae430b8b898414473cfdd410372"); // Gnosis Safe 1.3.0
    await gnosisSafe.deployed();
    console.log("GnosisSafe deployed at:", gnosisSafe.address);

    const GnosisSafeProxyFactory = await ethers.getContractFactory("MockGnosisSafeProxyFactory");
    const gnosisSafeProxyFactory = await GnosisSafeProxyFactory.attach("0x75a53960e4df3f2E6F4008E07b5C471d3783Abc5");
    await gnosisSafeProxyFactory.deployed();
    console.log("GnosisSafeProxyFactory deployed at:", gnosisSafeProxyFactory.address);

    const userEOA = accounts[0];

    const data = gnosisSafe.interface.encodeFunctionData("setup", [
        [userEOA.address], // Owners
        1, // threshold
        "0x0000000000000000000000000000000000000000", // To
        "0x", // Data
        "0x0000000000000000000000000000000000000000", // FallbackHandler TODO CompatibilityFallbackHandler
        "0x0000000000000000000000000000000000000000", // PaymentMaster
        0, // Payment
        "0x0000000000000000000000000000000000000000", // PaymentReceiver
    ]);

    console.log("data:", data);

    const gnosisSafeProxyAddress = await gnosisSafeProxyFactory.createProxy(gnosisSafe.address, data);
    console.log("GnosisSafeProxy deployed at:", gnosisSafeProxyAddress);

    // npx hardhat verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy 0x4B91940dccAEa370216D642e73Df9eea1756FF7A 0xc09963688b72eae430b8b898414473cfdd410372
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });