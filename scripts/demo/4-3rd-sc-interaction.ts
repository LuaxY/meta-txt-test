import { ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";
import { buildSafeTransaction, safeSignTypedData, SafeSignature, executeTx } from "@gnosis.pm/safe-contracts";

const prompt = require('prompt-sync')();
dotenvConfig();

// hh run scripts/demo/4-3rd-sc-interaction.ts

async function main() {
    const accounts = await ethers.getSigners();

    const masterEOA = accounts[0];

    const alice = accounts[1];
    console.log("Alice EOA:", alice.address, "balance:", await alice.getBalance());

    const david = accounts[2];
    console.log("David EOA:", david.address, "balance:", await david.getBalance());

    prompt('Press enter to continue...');

    // To be replace by GTS js client
    const credentials = { apiKey: process.env.RELAY_API_KEY!, apiSecret: process.env.RELAY_API_SECRET! }
    const relayerProvider = new DefenderRelayProvider(credentials);
    const relayerSigner = new DefenderRelaySigner(credentials, relayerProvider);

    const COUNTER_ADDRESS = "0x107935cBAA8bBC1Bc2c5C78747Bc653504Effd0A";
    const ALICE_SC_WALLET_ADDRESS = "0xf7E894Dd1321639262E91D2E4ae96926D539b6dB";
    const DAVID_SC_WALLET_ADDRESS = "0x5A8D625062419942A4bf18cb60C45699b5F3FDF6";

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");

    const Counter = await ethers.getContractFactory("Counter");
    const counter = Counter.attach(COUNTER_ADDRESS);
    console.log("Counter deployed at:", counter.address);

    const user1Wallet = GnosisSafe.attach(ALICE_SC_WALLET_ADDRESS);
    console.log("Alice wallet deployed at:", user1Wallet.address);

    const user2Wallet = GnosisSafe.attach(DAVID_SC_WALLET_ADDRESS);
    console.log("David wallet deployed at:", user2Wallet.address);

    prompt('Press enter to continue...');

    console.log("Counter value:", (await counter.counter()).toString());

    prompt('Press enter to continue...');

    // Alice wallet increment the counter
    {
        const data = counter.interface.encodeFunctionData("increment");
        const nonce = await user1Wallet.nonce();
        const tx = buildSafeTransaction({ to: counter.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(alice, user1Wallet, tx)];
        const result = await executeTx(user1Wallet.connect(relayerSigner), tx, sigs);
        console.log("TX USER1 INCREMENT", result.hash);
        await result.wait();
    }

    console.log("Counter value:", (await counter.counter()).toString());

    prompt('Press enter to continue...');

    // David wallet increment the counter
    {
        const data = counter.interface.encodeFunctionData("increment");
        const nonce = await user2Wallet.nonce();
        const tx = buildSafeTransaction({ to: counter.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(david, user2Wallet, tx)];
        const result = await executeTx(user2Wallet.connect(relayerSigner), tx, sigs);
        console.log("TX USER2 INCREMENT", result.hash);
        await result.wait();
    }

    console.log("Counter value:", (await counter.counter()).toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });