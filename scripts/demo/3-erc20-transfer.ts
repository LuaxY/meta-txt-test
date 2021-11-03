import { ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";
import { buildSafeTransaction, safeSignTypedData, SafeSignature, executeTx } from "@gnosis.pm/safe-contracts";

const prompt = require('prompt-sync')();
dotenvConfig();

// hh run scripts/demo/3-erc20-transfer.ts

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

    const ERC20_ADDRESS = "0xB1e9229061cc31e6d67ec812872e97A7c51801AE";
    const USER1_SC_WALLET_ADDRESS = "0x4443Ff21B6Fc0f28c8DE9E7BeFff2c727D48c4d2";
    const USER2_SC_WALLET_ADDRESS = "0xDA2397Ec2517865ca31F9017ef0D9Ae43E0AE9c6";

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");

    const ERC20Token = await ethers.getContractFactory("ERC20");
    const erc20Token = ERC20Token.attach(ERC20_ADDRESS);
    console.log("ERC20Token deployed at:", erc20Token.address);

    const user1Wallet = GnosisSafe.attach(USER1_SC_WALLET_ADDRESS);
    console.log("user1 wallet deployed at:", user1Wallet.address);

    const user2Wallet = GnosisSafe.attach(USER2_SC_WALLET_ADDRESS);
    console.log("user2 wallet deployed at:", user2Wallet.address);

    console.log("user1 wallet erc20 balance:", ethers.utils.formatEther(await erc20Token.balanceOf(user1Wallet.address)), "TKN");
    console.log("user2 wallet erc20 balance:", ethers.utils.formatEther(await erc20Token.balanceOf(user2Wallet.address)), "TKN");

    prompt('Press enter to continue...');

    const tokenAmount = ethers.utils.parseEther("100");

    // Transfer some erc20 tokens from master EOA to user1 wallet
    {
        const result = await erc20Token.transfer(user1Wallet.address, tokenAmount);
        console.log("TX MASTER -> USER1", result.hash);
        await result.wait();
    }

    console.log("user1 wallet erc20 balance:", ethers.utils.formatEther(await erc20Token.balanceOf(user1Wallet.address)), "TKN");
    console.log("user2 wallet erc20 balance:", ethers.utils.formatEther(await erc20Token.balanceOf(user2Wallet.address)), "TKN");

    prompt('Press enter to continue...');

    // Transfer some erc20 tokens from user1 wallet to user2 wallet
    {
        const data = erc20Token.interface.encodeFunctionData("transfer", [user2Wallet.address, tokenAmount]);
        const nonce = await user1Wallet.nonce();
        const tx = buildSafeTransaction({ to: erc20Token.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(user1, user1Wallet, tx)];
        const result = await executeTx(user1Wallet.connect(relayerSigner), tx, sigs);
        console.log("TX USER1 -> USER2", result.hash);
        await result.wait();
    }

    console.log("user1 wallet erc20 balance:", ethers.utils.formatEther(await erc20Token.balanceOf(user1Wallet.address)), "TKN");
    console.log("user2 wallet erc20 balance:", ethers.utils.formatEther(await erc20Token.balanceOf(user2Wallet.address)), "TKN");

    prompt('Press enter to continue...');

    // Transfer some erc20 tokens from user2 wallet to master EOA
    {
        const data = erc20Token.interface.encodeFunctionData("transfer", [masterEOA.address, tokenAmount]);
        const nonce = await user2Wallet.nonce();
        const tx = buildSafeTransaction({ to: erc20Token.address, data, safeTxGas: 1000000, nonce });
        const sigs: SafeSignature[] = [await safeSignTypedData(user2, user2Wallet, tx)];
        const result = await executeTx(user2Wallet.connect(relayerSigner), tx, sigs);
        console.log("TX USER2 -> MASTER", result.hash);
        await result.wait();
    }

    console.log("user1 wallet erc20 balance:", ethers.utils.formatEther(await erc20Token.balanceOf(user1Wallet.address)), "TKN");
    console.log("user2 wallet erc20 balance:", ethers.utils.formatEther(await erc20Token.balanceOf(user2Wallet.address)), "TKN");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });