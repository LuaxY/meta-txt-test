import { run, ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { relay } from "./utils/relay"
import { signMetaTxRequest } from "./utils/sign"
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// npx hardhat run scripts/5-deploy-gnosis-safe.ts

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

    console.log("npx hardhat verify --contract @gnosis.pm/safe-contracts/contracts/GnosisSafe.sol:GnosisSafe", gnosisSafe.address)
    try {
        await run("verify:verify", {
            address: gnosisSafe.address,
            contract: "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol:GnosisSafe"
        });
    } catch (error) {
        console.error(error);
    }

    console.log("npx hardhat verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol:GnosisSafeProxyFactory", gnosisSafeProxyFactory.address)
    try {
        await run("verify:verify", {
            address: gnosisSafeProxyFactory.address,
            contract: "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol:GnosisSafeProxyFactory"
        });
    } catch (error) {
        console.error(error);
    }

    console.log("npx hardhat verify --contract @gnosis.pm/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol:CompatibilityFallbackHandler", compatibilityFallbackHandler.address)
    try {
        await run("verify:verify", {
            address: compatibilityFallbackHandler.address,
            contract: "@gnosis.pm/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol:CompatibilityFallbackHandler"
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