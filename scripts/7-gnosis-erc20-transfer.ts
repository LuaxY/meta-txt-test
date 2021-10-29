import { ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { config as dotenvConfig } from "dotenv";
import { buildSafeTransaction, safeSignTypedData, SafeSignature, executeTx } from "@gnosis.pm/safe-contracts";

dotenvConfig();

// npx hardhat run scripts/7-gnosis-erc20-transfer.ts

async function main() {
    const accounts = await ethers.getSigners();

    const credentials = { apiKey: process.env.RELAY_API_KEY!, apiSecret: process.env.RELAY_API_SECRET! }
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider);

    const ERC20Token = await ethers.getContractFactory("ERC20");
    const erc20Token = ERC20Token.attach("0x0bd8048318Ab82A4c2b3De92D22e5b9E39A3eD66"); // Dummy ERC20 token
    await erc20Token.deployed();
    console.log("ERC20Token deployed at:", erc20Token.address);

    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");
    const gnosisSafe = GnosisSafe.attach("0x7c1b2AF88357546d1057F057505569e7Dd3445e4"); // Gnosis Safe 1.3.0 Proxy
    await gnosisSafe.deployed();
    console.log("GnosisSafe deployed at:", gnosisSafe.address);

    // Transfer some initial tokens to the user wallet if needed
    // await erc20Token.transfer(gnosisSafe.address, ethers.utils.parseEther("100"));

    const data = erc20Token.interface.encodeFunctionData("transfer", ["0xdead000000000000000042069420694206942069", ethers.utils.parseEther("1")]); // Black hole
    const nonce = await gnosisSafe.nonce();
    const tx = buildSafeTransaction({ to: erc20Token.address, data, safeTxGas: 1000000, nonce });
    const threshold = await gnosisSafe.getThreshold();
    
    const sigs: SafeSignature[] = await Promise.all(accounts.slice(0, threshold).map(async (signer) => {
        return await safeSignTypedData(signer, gnosisSafe, tx)
    }));

    console.log("DATA", data);
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