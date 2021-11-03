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

    const user1 = accounts[1];
    const user1Balance = await user1.getBalance();
    console.log(`user1 EOA ${user1.address}, balance: ${user1Balance}`);

    const user2 = accounts[2];
    const user2Balance = await user2.getBalance();
    console.log(`user2 EOA ${user2.address}, balance: ${user2Balance}`);

    prompt('Press enter to continue...');

    // To be replace by GTS js client
    const credentials = { apiKey: process.env.RELAY_API_KEY!, apiSecret: process.env.RELAY_API_SECRET! }
    const relayerProvider = new DefenderRelayProvider(credentials);
    const relayerSigner = new DefenderRelaySigner(credentials, relayerProvider);

    const COUNTER_ADDRESS = "0x107935cBAA8bBC1Bc2c5C78747Bc653504Effd0A";
    const USER1_SC_WALLET_ADDRESS = "0x4443Ff21B6Fc0f28c8DE9E7BeFff2c727D48c4d2";
    const USER2_SC_WALLET_ADDRESS = "0xDA2397Ec2517865ca31F9017ef0D9Ae43E0AE9c6";

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");

    const Counter = await ethers.getContractFactory("Counter");
    const counter = Counter.attach(COUNTER_ADDRESS);
    console.log("Counter deployed at:", counter.address);

    const user1Wallet = GnosisSafe.attach(USER1_SC_WALLET_ADDRESS);
    console.log("user1 wallet deployed at:", user1Wallet.address);

    const user2Wallet = GnosisSafe.attach(USER2_SC_WALLET_ADDRESS);
    console.log("user2 wallet deployed at:", user2Wallet.address);

    prompt('Press enter to continue...');

    console.log("Counter value:", (await counter.counter()).toString());

    prompt('Press enter to continue...');

    // user1 wallet increment the counter
    {
        const data = counter.interface.encodeFunctionData("increment");
        const nonce = await user1Wallet.nonce();
        const tx = buildSafeTransaction({ to: counter.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(user1, user1Wallet, tx)];
        const result = await executeTx(user1Wallet.connect(relayerSigner), tx, sigs);
        console.log("TX USER1 INCREMENT", result.hash);
        await result.wait();
    }

    console.log("Counter value:", (await counter.counter()).toString());

    prompt('Press enter to continue...');

    // user2 wallet increment the counter
    {
        const data = counter.interface.encodeFunctionData("increment");
        const nonce = await user2Wallet.nonce();
        const tx = buildSafeTransaction({ to: counter.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(user2, user2Wallet, tx)];
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