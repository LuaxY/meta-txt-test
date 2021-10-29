import { run, ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { relay } from "./utils/relay"
import { signMetaTxRequest } from "./utils/sign"
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// npx hardhat run scripts/6-proxified-gnosis-safe.ts

async function main() {
    const accounts = await ethers.getSigners();

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");
    // const gnosisSafe = await GnosisSafe.attach("0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552"); // Gnosis Safe 1.3.0 // Official
    const gnosisSafe = await GnosisSafe.attach("0x2117b58d8750a0b3ad31744be6a2317292ee3643"); // Gnosis Safe 1.3.0 // Redeployed
    await gnosisSafe.deployed();
    console.log("GnosisSafe deployed at:", gnosisSafe.address);

    const GnosisSafeProxyFactory = await ethers.getContractFactory("GnosisSafeProxyFactory");
    // const gnosisSafeProxyFactory = await GnosisSafeProxyFactory.attach("0xa6b71e26c5e0845f74c812102ca7114b6a896ab2"); // Official
    const gnosisSafeProxyFactory = await GnosisSafeProxyFactory.attach("0xa2d07059fade97f61b989f9ca8ab522ce459684a"); // Redeployed
    await gnosisSafeProxyFactory.deployed();
    console.log("GnosisSafeProxyFactory deployed at:", gnosisSafeProxyFactory.address);

    const CompatibilityFallbackHandler = await ethers.getContractFactory("CompatibilityFallbackHandler");
    // const compatibilityFallbackHandler = await CompatibilityFallbackHandler.attach("0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4"); // Official
    const compatibilityFallbackHandler = await CompatibilityFallbackHandler.attach("0xA0c0e20669855D4C2b29a1608e3686255BBeB8ea"); // Redeployed
    await compatibilityFallbackHandler.deployed();
    console.log("CompatibilityFallbackHandler deployed at:", compatibilityFallbackHandler.address);

    const userEOA = accounts[0];

    const params = [
        [userEOA.address], // Owners
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
    console.log("CreateProxyWithNonce TX:", gnosisSafeProxyAddress.hash);

    const receipt = await gnosisSafeProxyAddress.wait();
    const proxyCreactionEvents = receipt.events?.filter((x: any) => { return x.event == "ProxyCreation" })
    console.log("GnosisSafeProxy deployed at:", proxyCreactionEvents[0].args.proxy);

    console.log("npx hardhat verify --contract @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy", proxyCreactionEvents[0].args.proxy, gnosisSafe.address)
    try {
        await run("verify:verify", {
            address: proxyCreactionEvents[0].args.proxy,
            contract: "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol:GnosisSafeProxy",
            constructorArguments: [gnosisSafe.address],
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