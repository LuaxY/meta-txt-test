import { ethers } from "hardhat";
import chalk from "chalk";
const color = require("color-seed");
const prompt = require('prompt-sync')();

export async function ethBalance(name: any, user: any, wallet: any) {
    console.log(`💰 [ ${name} EOA ${colored(user.address)} ${ethers.utils.formatEther(await user.getBalance())} ETH ] [ SC Wallet ${colored(wallet.address)} ${ethers.utils.formatEther(await ethers.provider.getBalance(wallet.address))} ETH ]`);
}

export async function erc20Balance(name: any, user: any, token: any, wallet: any) {
    console.log(`💰 [ ${name} EOA ${colored(user.address)} ${ethers.utils.formatEther(await user.getBalance())} ETH ] [ SC Wallet ${colored(wallet.address)} ${ethers.utils.formatEther(await token.balanceOf(wallet.address))} ${await token.symbol()} ]`);
}

export function txHash(hash: any) {
    console.log(`🔗 TX hash: ${hash}`);
    console.log(`🔎 https://rinkeby.etherscan.io/tx/${hash}`);
    console.log(`🔎 https://ethtx.info/rinkeby/${hash}/`);
}

export async function relayBalance(receipt: any) {
    const balanceAfter = await ethers.provider.getBalance(receipt.from);
    const balanceBefore = await ethers.provider.getBalance(receipt.from, receipt.blockNumber - 1);

    console.log(`💰 Balance of Relayer EOA ${colored(receipt.from)}`);
    console.log(`📈 [ BEFORE ] ${ethers.utils.formatEther(balanceBefore)} ETH`);
    console.log(`📉 [  AFTER ] ${ethers.utils.formatEther(balanceAfter)} ETH (${chalk.bold.red("-" + ethers.utils.formatUnits(receipt.gasUsed.mul(receipt.effectiveGasPrice)) + " ETH")})\n`);
}

export function colored(seed: any) {
    const hex = color.getColor(ethers.utils.getAddress(seed) + 52);
    return chalk.bold.hex(hex)(ethers.utils.getAddress(seed));
}

export function pause() {
    console.log();
    prompt('⌛ Press enter to continue...');
    console.log();
}