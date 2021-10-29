import { run, ethers } from "hardhat";
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { relay } from "./utils/relay"
import { signMetaTxRequest } from "./utils/sign"
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// npx hardhat run scripts/3-forwaded-standard-erc721.ts

async function main() {
    const accounts = await ethers.getSigners();

    const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    const minimalForwarder = await MinimalForwarder.deploy();
    await minimalForwarder.deployed();
    console.log("MinimalForwarder deployed at:", minimalForwarder.address);

    const ERC721Token = await ethers.getContractFactory("MockStandardERC721");
    const erc721Token = await ERC721Token.deploy();
    await erc721Token.deployed();
    console.log("ERC721Token deployed at:", erc721Token.address);

    console.log("npx hardhat verify --contract @openzeppelin/contracts/metatx/MinimalForwarder.sol:MinimalForwarder", minimalForwarder.address)
    try {
        await run("verify:verify", {
            address: minimalForwarder.address,
            contract: "@openzeppelin/contracts/metatx/MinimalForwarder.sol:MinimalForwarder"
        });
    } catch (error) {
        console.error(error);
    }

    console.log("npx hardhat verify --contract contracts/MockStandardERC721.sol:MockStandardERC721", erc721Token.address)
    try {
        await run("verify:verify", {
            address: erc721Token.address,
            contract: "contracts/MockStandardERC721.sol:MockStandardERC721"
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
        to: erc721Token.address,
        data: erc721Token.interface.encodeFunctionData("transferFrom", [userEOA.address, "0xdead000000000000000042069420694206942069", 0]), // Black hole
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