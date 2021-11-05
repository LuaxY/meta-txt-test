import { ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";
import { buildSafeTransaction, safeSignTypedData, SafeSignature, executeTx } from "@gnosis.pm/safe-contracts";
import chalk from "chalk";
import { erc20Balance, txHash, relayBalance, colored, pause } from "../utils/demo";

const prompt = require('prompt-sync')();
dotenvConfig();

// hh run scripts/demo/3-erc20-transfer.ts

async function main() {
    const accounts = await ethers.getSigners();

    const alice = accounts[1];
    const david = accounts[2];

    // To be replace by GTS js client
    const credentials = { apiKey: process.env.RELAY_API_KEY!, apiSecret: process.env.RELAY_API_SECRET! }
    const relayerProvider = new DefenderRelayProvider(credentials);
    const relayerSigner = new DefenderRelaySigner(credentials, relayerProvider);

    const ERC20_ADDRESS = "0x6c7179bB7105344b91B56328Fcc72E9c18b845d5";
    const ALICE_SC_WALLET_ADDRESS = "0xD79e44a675F7e98539b860BEadfdd56dA580DCAF";
    const DAVID_SC_WALLET_ADDRESS = "0x5D8f7aEe31782f37D02E133d08E3Ff1D22179b19";

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");

    const ERC20Token = await ethers.getContractFactory("ERC20");
    const erc20Token = ERC20Token.attach(ERC20_ADDRESS);
    console.log(`\n🪙  ERC20Token deployed at: ${colored(erc20Token.address)}\n`);

    const aliceWallet = GnosisSafe.attach(ALICE_SC_WALLET_ADDRESS);
    const davidWallet = GnosisSafe.attach(DAVID_SC_WALLET_ADDRESS);

    await erc20Balance("Alice", alice, erc20Token, aliceWallet);
    await erc20Balance("David", david, erc20Token, davidWallet);

    const tokenAmount = ethers.utils.parseEther("100");
    const relayerAddress = await relayerSigner.getAddress();

    pause();

    // Transfer erc20 tokens from Relayer EOA to Alice wallet
    {
        const result = await erc20Token.connect(relayerSigner).transfer(aliceWallet.address, tokenAmount);
        console.log(`👀 [ Send ${chalk.bold(ethers.utils.formatEther(tokenAmount) + " TKN")} from Relayer EOA ${colored(relayerAddress)} to Alice Wallet ${colored(aliceWallet.address)} ]\n`);
        txHash(result.hash);
        const receipt = await result.wait();
        console.log("✅ Mined...\n");
        await relayBalance(receipt);
    }

    await erc20Balance("Alice", alice, erc20Token, aliceWallet);
    await erc20Balance("David", david, erc20Token, davidWallet);

    pause();

    // Transfer erc20 tokens from Alice wallet to David wallet
    {
        const data = erc20Token.interface.encodeFunctionData("transfer", [davidWallet.address, tokenAmount]);
        const nonce = await aliceWallet.nonce();
        const tx = buildSafeTransaction({ to: erc20Token.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(alice, aliceWallet, tx)];
        const result = await executeTx(aliceWallet.connect(relayerSigner), tx, sigs);
        console.log(`👀 [ Send ${chalk.bold(ethers.utils.formatEther(tokenAmount) + " TKN")} from Alice Wallet ${colored(aliceWallet.address)} to David Wallet ${colored(davidWallet.address)} ]\n`);
        txHash(result.hash);
        const receipt = await result.wait();
        console.log("✅ Mined...\n");
        await relayBalance(receipt);
    }

    await erc20Balance("Alice", alice, erc20Token, aliceWallet);
    await erc20Balance("David", david, erc20Token, davidWallet);

    pause();

    // Transfer erc20 tokens from David wallet to Relayer EOA
    {
        const data = erc20Token.interface.encodeFunctionData("transfer", [relayerAddress, tokenAmount]);
        const nonce = await davidWallet.nonce();
        const tx = buildSafeTransaction({ to: erc20Token.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(david, davidWallet, tx)];
        const result = await executeTx(davidWallet.connect(relayerSigner), tx, sigs);
        console.log(`👀 [ Send ${chalk.bold(ethers.utils.formatEther(tokenAmount) + " TKN")} from David Wallet ${colored(davidWallet.address)} to Relayer EOA ${colored(relayerAddress)} ]\n`);
        txHash(result.hash);
        const receipt = await result.wait();
        console.log("✅ Mined...\n");
        await relayBalance(receipt);
    }

    await erc20Balance("Alice", alice, erc20Token, aliceWallet);
    await erc20Balance("David", david, erc20Token, davidWallet);

    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });