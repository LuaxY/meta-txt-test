import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-watcher";
import "hardhat-tracer";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  defaultNetwork: "rinkeby",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    rinkeby: {
      chainId: 4,
      url: process.env.API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      // accounts: {
      //   mnemonic: process.env.MNEMONIC,
      //   initialIndex: 1
      // },
      gas: 12500000,
    },
    hardhat: {
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  watcher: {
    compile: {
      tasks: ["compile"],
    },
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: false
    }
  },
  mocha: {
    timeout: 20000
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;