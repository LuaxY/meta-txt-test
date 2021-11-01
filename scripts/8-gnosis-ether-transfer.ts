import { ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";
import { buildSafeTransaction, safeSignTypedData, SafeSignature, executeTx } from "@gnosis.pm/safe-contracts";

dotenvConfig();

// npx hardhat run scripts/8-gnosis-ether-transfer.ts

async function main() {
    const accounts = await ethers.getSigners();
    const userEOA = accounts[0];

    const credentials = { apiKey: process.env.RELAY_API_KEY!, apiSecret: process.env.RELAY_API_SECRET! }
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider);

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");
    const gnosisSafe = GnosisSafe.attach("0x7c1b2AF88357546d1057F057505569e7Dd3445e4"); // Gnosis Safe 1.3.0 Proxy
    await gnosisSafe.deployed();
    console.log("GnosisSafe deployed at:", gnosisSafe.address);

    // Transfer some ethers to the user wallet if needed
    // await userEOA.sendTransaction({ to: gnosisSafe.address, value: ethers.utils.parseEther("0.01") });

    const nonce = await gnosisSafe.nonce();
    const tx = buildSafeTransaction({ to: userEOA.address, value: ethers.utils.parseEther("0.01"), safeTxGas: 1000000, nonce });
    const threshold = await gnosisSafe.getThreshold();
    
    const sigs: SafeSignature[] = await Promise.all(accounts.slice(0, threshold).map(async (signer) => {
        return await safeSignTypedData(signer, gnosisSafe, tx)
    }));

    console.log("VALUE", ethers.utils.parseEther("0.01"));
    console.log("NONCE", nonce);
    console.log("TX", tx);
    console.log("THRESHOLD", threshold);
    console.log("SIGS", sigs);

    // const result = await executeTx(gnosisSafe, tx, sigs); // Direct execution
    const result = await executeTx(gnosisSafe.connect(signer), tx, sigs); // Relayed execution
    console.log("RESULT", result);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});