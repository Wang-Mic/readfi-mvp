require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const { ZIRCUIT_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.24", // ✅ 改這裡
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris"
    }
  },
  sourcify: { enabled: true }, // ✅ 開 Sourcify
  etherscan: {
    apiKey: {
      zircuitTestnet: "blockscout-does-not-require-apikey"
    },
    customChains: [
      {
        network: "zircuitTestnet",
        chainId: 48898,
        urls: {
          apiURL: "https://explorer.garfield-testnet.zircuit.com/api",
          browserURL: "https://explorer.garfield-testnet.zircuit.com"
        }
      }
    ]
  },
  networks: {
    zircuitTestnet: {
      url: ZIRCUIT_RPC_URL || "https://zircuit-garfield-testnet.drpc.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
