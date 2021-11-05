import { ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";
import { buildSafeTransaction, safeSignTypedData, SafeSignature, executeTx } from "@gnosis.pm/safe-contracts";
import chalk from "chalk";
import { ethBalance, txHash, relayBalance, colored, pause } from "../utils/demo";

const prompt = require('prompt-sync')();
dotenvConfig();

// hh run scripts/demo/4-3rd-sc-interaction.ts

async function main() {
    const accounts = await ethers.getSigners();

    const alice = accounts[1];
    const david = accounts[2];

    // To be replace by GTS js client
    const credentials = { apiKey: process.env.RELAY_API_KEY!, apiSecret: process.env.RELAY_API_SECRET! }
    const relayerProvider = new DefenderRelayProvider(credentials);
    const relayerSigner = new DefenderRelaySigner(credentials, relayerProvider);

    const COUNTER_ADDRESS = "0xe928ab3623b05F0C329E07E99ae34E301C2Ac360";
    const ALICE_SC_WALLET_ADDRESS = "0xD79e44a675F7e98539b860BEadfdd56dA580DCAF";
    const DAVID_SC_WALLET_ADDRESS = "0x5D8f7aEe31782f37D02E133d08E3Ff1D22179b19";

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");

    const Counter = await ethers.getContractFactory("Counter");
    const counter = Counter.attach(COUNTER_ADDRESS);
    console.log(`\n🔢 Counter deployed at: ${colored(counter.address)}\n`);

    const aliceWallet = GnosisSafe.attach(ALICE_SC_WALLET_ADDRESS);
    const davidWallet = GnosisSafe.attach(DAVID_SC_WALLET_ADDRESS);

    await ethBalance("Alice", alice, aliceWallet);
    await ethBalance("David", david, davidWallet);

    console.log(`\n#️⃣  Counter value: ${chalk.bold((await counter.counter()).toString())}`);

    pause();

    // Alice wallet increment the counter
    {
        const data = counter.interface.encodeFunctionData("increment");
        const nonce = await aliceWallet.nonce();
        const tx = buildSafeTransaction({ to: counter.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(alice, aliceWallet, tx)];
        const result = await executeTx(aliceWallet.connect(relayerSigner), tx, sigs);
        console.log(`👀 [ Call ${chalk.bold("Counter.increment()")} by Alice Wallet ${colored(aliceWallet.address)} ]\n`);
        txHash(result.hash);
        const receipt = await result.wait();
        console.log("✅ Mined...\n");
        await relayBalance(receipt);
    }

    console.log(`#️⃣  Counter value: ${chalk.bold((await counter.counter()).toString())}`);

    pause();

    // David wallet increment the counter
    {
        const data = counter.interface.encodeFunctionData("increment");
        const nonce = await davidWallet.nonce();
        const tx = buildSafeTransaction({ to: counter.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(david, davidWallet, tx)];
        const result = await executeTx(davidWallet.connect(relayerSigner), tx, sigs);
        console.log(`👀 [ Call ${chalk.bold("Counter.increment()")} by David Wallet ${colored(davidWallet.address)} ]\n`);
        txHash(result.hash);
        const receipt = await result.wait();
        console.log("✅ Mined...\n");
        await relayBalance(receipt);
    }

    console.log(`#️⃣  Counter value: ${chalk.bold((await counter.counter()).toString())}`);
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });