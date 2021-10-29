import { run, ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { relay } from "./utils/relay"
import { signMetaTxRequest } from "./utils/sign"
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// npx hardhat run scripts/1-forwaded-standard-erc20.ts

async function main() {
    const accounts = await ethers.getSigners();

    const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    const minimalForwarder = await MinimalForwarder.deploy();
    await minimalForwarder.deployed();
    console.log("MinimalForwarder deployed at:", minimalForwarder.address);

    const ERC20Token = await ethers.getContractFactory("MockStandardERC20");
    const erc20Token = await ERC20Token.deploy();
    await erc20Token.deployed();
    console.log("ERC20Token deployed at:", erc20Token.address);

    console.log("npx hardhat verify --contract @openzeppelin/contracts/metatx/MinimalForwarder.sol:MinimalForwarder", minimalForwarder.address)
    try {
        await run("verify:verify", {
            address: minimalForwarder.address,
            contract: "@openzeppelin/contracts/metatx/MinimalForwarder.sol:MinimalForwarder"
        });
    } catch (error) {
        console.error(error);
    }

    console.log("npx hardhat verify --contract contracts/MockStandardERC20.sol:MockStandardERC20", erc20Token.address)
    try {
        await run("verify:verify", {
            address: erc20Token.address,
            contract: "contracts/MockStandardERC20.sol:MockStandardERC20"
        });
    } catch (error) {
        console.error(error);
    }

    const credentials = { apiKey: process.env.RELAY_API_KEY!, apiSecret: process.env.RELAY_API_SECRET! }
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider);

    const userEOA = accounts[0];

    const { request, signature } = await signMetaTxRequest(userEOA.provider, minimalForwarder, {
        from: userEOA.address,
        to: erc20Token.address,
        data: erc20Token.interface.encodeFunctionData("transfer", ["0xdead000000000000000042069420694206942069", ethers.utils.parseEther("1")]), // Black hole
    });

    console.log("Request: ", request);
    console.log("Signature: ", signature);

    const tx = await relay(minimalForwarder.connect(signer), request, signature);
    console.log("Sent meta-tx:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });