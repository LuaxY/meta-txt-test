import { ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";
import { buildSafeTransaction, safeSignTypedData, SafeSignature, executeTx } from "@gnosis.pm/safe-contracts";

const prompt = require('prompt-sync')();
dotenvConfig();

// hh run scripts/demo/2-ethers-transfer.ts

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

    const USER1_SC_WALLET_ADDRESS = "0x4443Ff21B6Fc0f28c8DE9E7BeFff2c727D48c4d2";
    const USER2_SC_WALLET_ADDRESS = "0xDA2397Ec2517865ca31F9017ef0D9Ae43E0AE9c6";

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");

    const user1Wallet = GnosisSafe.attach(USER1_SC_WALLET_ADDRESS);
    console.log("user1 wallet deployed at:", user1Wallet.address);

    const user2Wallet = GnosisSafe.attach(USER2_SC_WALLET_ADDRESS);
    console.log("user2 wallet deployed at:", user2Wallet.address);

    console.log("user1 wallet ethers balance:", ethers.utils.formatEther(await ethers.provider.getBalance(user1Wallet.address)), "ETH");
    console.log("user2 wallet ethers balance:", ethers.utils.formatEther(await ethers.provider.getBalance(user2Wallet.address)), "ETH");

    prompt('Press enter to continue...');

    const ethersAmount = ethers.utils.parseEther("0.01");

    // Transfer some ethers from master EOA to user1 wallet
    {
        const result = await masterEOA.sendTransaction({ to: user1Wallet.address, value: ethersAmount });
        console.log("TX MASTER -> USER1", result.hash);
        await result.wait();
    }

    console.log("user1 wallet ethers balance:", ethers.utils.formatEther(await ethers.provider.getBalance(user1Wallet.address)), "ETH");
    console.log("user2 wallet ethers balance:", ethers.utils.formatEther(await ethers.provider.getBalance(user2Wallet.address)), "ETH");

    prompt('Press enter to continue...');

    // Transfer some ethers from user1 wallet to user2 wallet
    {
        const nonce = await user1Wallet.nonce();
        const tx = buildSafeTransaction({ to: user2Wallet.address, value: ethersAmount, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(user1, user1Wallet, tx)];
        const result = await executeTx(user1Wallet.connect(relayerSigner), tx, sigs);
        console.log("TX USER1 -> USER2", result.hash);
        await result.wait();
    }

    console.log("user1 wallet ethers balance:", ethers.utils.formatEther(await ethers.provider.getBalance(user1Wallet.address)), "ETH");
    console.log("user2 wallet ethers balance:", ethers.utils.formatEther(await ethers.provider.getBalance(user2Wallet.address)), "ETH");

    prompt('Press enter to continue...');

    // Transfer some ethers from user2 wallet to master EOA
    {
        const nonce = await user2Wallet.nonce();
        const tx = buildSafeTransaction({ to: masterEOA.address, value: ethersAmount, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(user2, user2Wallet, tx)];
        const result = await executeTx(user2Wallet.connect(relayerSigner), tx, sigs);
        console.log("TX USER2 -> MASTER", result.hash);
        await result.wait();
    }

    console.log("user1 wallet ethers balance:", ethers.utils.formatEther(await ethers.provider.getBalance(user1Wallet.address)), "ETH");
    console.log("user2 wallet ethers balance:", ethers.utils.formatEther(await ethers.provider.getBalance(user2Wallet.address)), "ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });