import { run, ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { relay } from "./utils/relay"
import { signMetaTxRequest } from "./utils/sign"
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// npx hardhat run scripts/5-deploy-gnosis-safe.ts

async function main() {
    const GnosisSafe = await ethers.getContractFactory("MockGnosisSafe");
    const gnosisSafe = await GnosisSafe.deploy();
    await gnosisSafe.deployed();
    console.log("GnosisSafe deployed at:", gnosisSafe.address);

    const GnosisSafeProxyFactory = await ethers.getContractFactory("MockGnosisSafeProxyFactory");
    const gnosisSafeProxyFactory = await GnosisSafeProxyFactory.deploy();
    await gnosisSafeProxyFactory.deployed();
    console.log("GnosisSafeProxyFactory deployed at:", gnosisSafeProxyFactory.address);

    console.log("npx hardhat verify --contract contracts/MockGnosisSafe.sol:MockGnosisSafe", gnosisSafe.address)
    try {
        await run("verify:verify", {
            address: gnosisSafe.address,
            contract: "contracts/MockGnosisSafe.sol:MockGnosisSafe"
        });
    } catch (error) {
        console.error(error);
    }

    console.log("npx hardhat verify --contract contracts/MockGnosisSafeProxyFactory.sol:MockGnosisSafeProxyFactory", gnosisSafeProxyFactory.address)
    try {
        await run("verify:verify", {
            address: gnosisSafeProxyFactory.address,
            contract: "contracts/MockGnosisSafeProxyFactory.sol:MockGnosisSafeProxyFactory"
        });
    } catch (error) {
        console.error(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });