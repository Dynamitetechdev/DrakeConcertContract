require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
const POLYGON_RPC = process.env.POLYGON_RPC;
const SEPOLIA_API_KEY = process.env.SEPOLIA_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",

  networks: {
    localhost: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    sepolia: {
      chainId: 11155111,
      url: SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
      blockConfirmations: 2,
    },
    polygon: {
      chainId: 80001,
      url: POLYGON_RPC,
      accounts: [PRIVATE_KEY],
      blockConfirmations: 2,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: SEPOLIA_API_KEY,
      polygon: POLYGON_API_KEY,
    },
  },
  gasReporter: {
    enabled: false,
    noColors: true,
    outputFile: "gas-reporter.txt",
    currency: "USD",
    // coinmarketcap: "d4720ed6-4d46-4490-9a1c-c2b4539b3b5e",
    token: "ETH",
  },
};
// 0xed4df04d4a4dcff13ba7f934f49cb05524346fc8;
