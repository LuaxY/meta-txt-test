import { ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";
import { buildSafeTransaction, safeSignTypedData, SafeSignature, executeTx } from "@gnosis.pm/safe-contracts";
import chalk from "chalk";
import { ethBalance, txHash, relayBalance, colored, pause } from "../utils/demo";

const prompt = require('prompt-sync')();
dotenvConfig();

// hh run scripts/demo/2-ethers-transfer.ts

async function main() {
    const accounts = await ethers.getSigners();

    const alice = accounts[1];
    const david = accounts[2];

    console.log();

    // To be replace by GTS js client
    const credentials = { apiKey: process.env.RELAY_API_KEY!, apiSecret: process.env.RELAY_API_SECRET! }
    const relayerProvider = new DefenderRelayProvider(credentials);
    const relayerSigner = new DefenderRelaySigner(credentials, relayerProvider);

    const ALICE_SC_WALLET_ADDRESS = "0xD79e44a675F7e98539b860BEadfdd56dA580DCAF";
    const DAVID_SC_WALLET_ADDRESS = "0x5D8f7aEe31782f37D02E133d08E3Ff1D22179b19";

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");

    const aliceWallet = GnosisSafe.attach(ALICE_SC_WALLET_ADDRESS);
    const davidWallet = GnosisSafe.attach(DAVID_SC_WALLET_ADDRESS);

    await ethBalance("Alice", alice, aliceWallet);
    await ethBalance("David", david, davidWallet);

    const ethersAmount = ethers.utils.parseEther("0.01");
    const relayerAddress = await relayerSigner.getAddress();

    pause();

    // Transfer ethers from Relayer EOA to Alice wallet
    {
        const result = await relayerSigner.sendTransaction({ to: aliceWallet.address, value: ethersAmount });
        console.log(`👀 [ Send ${chalk.bold(ethers.utils.formatEther(ethersAmount) + " ETH")} from Relayer EOA ${colored(relayerAddress)} to Alice Wallet ${colored(aliceWallet.address)} ]\n`);
        txHash(result.hash);
        const receipt = await result.wait();
        console.log("✅ Mined...\n");
        await relayBalance(receipt);
    }

    await ethBalance("Alice", alice, aliceWallet);
    await ethBalance("David", david, davidWallet);

    pause();

    // Transfer ethers from Alice wallet to David wallet
    {
        const nonce = await aliceWallet.nonce();
        const tx = buildSafeTransaction({ to: davidWallet.address, value: ethersAmount, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(alice, aliceWallet, tx)];
        const result = await executeTx(aliceWallet.connect(relayerSigner), tx, sigs);
        console.log(`👀 [ Send ${chalk.bold(ethers.utils.formatEther(ethersAmount) + " ETH")} from Alice Wallet ${colored(aliceWallet.address)} to David Wallet ${colored(davidWallet.address)} ]\n`);
        txHash(result.hash);
        const receipt = await result.wait();
        console.log("✅ Mined...\n");
        await relayBalance(receipt);
    }

    await ethBalance("Alice", alice, aliceWallet);
    await ethBalance("David", david, davidWallet);

    pause();

    // Transfer ethers from David wallet to Relayer EOA
    {
        const nonce = await davidWallet.nonce();
        const tx = buildSafeTransaction({ to: relayerAddress, value: ethersAmount, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(david, davidWallet, tx)];
        const result = await executeTx(davidWallet.connect(relayerSigner), tx, sigs);
        console.log(`👀 [ Send ${chalk.bold(ethers.utils.formatEther(ethersAmount) + " ETH")} from David Wallet ${colored(davidWallet.address)} to Relayer EOA ${colored(relayerAddress)} ]\n`);
        txHash(result.hash);
        const receipt = await result.wait();
        console.log("✅ Mined...\n");
        await relayBalance(receipt);
    }

    await ethBalance("Alice", alice, aliceWallet);
    await ethBalance("David", david, davidWallet);

    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });