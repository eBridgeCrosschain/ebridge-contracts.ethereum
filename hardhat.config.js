// const dotenv = require('dotenv');
require('solidity-coverage');
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');
require("@nomicfoundation/hardhat-toolbox");
// const result = dotenv.config();
// if (result.error) {
//   throw result.error;
// }
// console.log(result.parsed);
// const API_KEY = process.env.apikey;
//
// console.log("API_KEY--------" + API_KEY)
// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts


module.exports = {
  solidity: {
    compilers:[
      {
      version: "0.8.9",
      setting: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
    {
      version: "0.8.10",
    },
    {
      version: "0.8.20",
    },
    {
      version: "0.4.18",
    },{
      version: "0.8.0",
    },
    ]
  },
  contractSizer:{
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  networks: {
    hardhat: {
      chainId: 11155111,
      allowUnlimitedContractSize: true
    }
    // bsc_test: {
    //   url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    //   chainId: 97,
    //   accounts: [process.env.key0,process.env.key1]
    // },
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/" + API_KEY,
    //   chainId: 11155111,
    //   accounts: [process.env.key0,process.env.key1]
    // }
    // bsc: {
    //   url: "https://bsc-dataseed2.binance.org",
    //   chainId: 56,
    //   accounts: [process.env.keymain]
    // },
    // ethereum: {
    //   url: "https://mainnet.infura.io/v3/" + API_KEY,
    //   chainId: 1,
    //   accounts: [process.env.keymain]
    // },
    // base_sepolia: {
    //   url: "https://sepolia.base.org",
    //   chainId: 84532,
    //   accounts: [process.env.key0,process.env.key1]
    // }
    //   base: {
    //     url: "https://mainnet.base.org",
    //     chainId: 8453,
    //     accounts: [process.env.keymain]
    // }

  },
  etherscan: {
    apiKey: {
      // mainnet: process.env.ethscan_api_key,
      // bsc: process.env.bscscan_api_key
      // sepolia: process.env.ethscan_api_key,
      // base_sepolia:process.env.basescan_api_key,
      // base:process.env.basescan_api_key
      // bscTestnet :process.env.bscscan_api_key
    },
    customChains: [
      // {
      //   network: "base_sepolia",
      //   chainId: 84532,
      //   urls: {
      //     apiURL: "https://api-sepolia.basescan.org/api",
      //     browserURL: "https://sepolia.basescan.org"
      //   }
      // },
      // {
      //   network: "base",
      //   chainId: 8453,
      //   urls: {
      //     apiURL: "https://api.basescan.org/api",
      //     browserURL: "https://basescan.org"
      //   }
      // }
    ]
  }
};

