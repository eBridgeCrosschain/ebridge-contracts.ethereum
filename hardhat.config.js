const dotenv = require('dotenv');
require('solidity-coverage');
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');
require("@nomicfoundation/hardhat-toolbox");
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
console.log(result.parsed);
const API_KEY = process.env.apikey;

console.log("API_KEY--------" + API_KEY)
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
      version: "0.4.18",
    }
    ]
  },
  contractSizer:{
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  networks: {
    // hardhat: {
    //   allowUnlimitedContractSize: true
    // },
    // kovan: {
    //   url: "https://kovan.infura.io/v3/" + API_KEY,
    //   chainId: 42,
    //   accounts: [process.env.kovan_key0]
    // },
    // goerli: {
    //   url: "https://goerli.infura.io/v3/" + API_KEY,
    //   chainId: 5,
    //   accounts: [process.env.goerli_key0,process.env.goerli_key1,process.env.goerli_key2,process.env.goerli_key3,process.env.goerli_key4,process.env.goerli_key5]
    // },
    // bsc_test: {
    //   url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    //   chainId: 97,
    //   accounts: [process.env.key0,process.env.keymanager,process.env.key1,process.env.key2,process.env.key3,process.env.key4,process.env.key5,process.env.key6]
    // },
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + API_KEY,
      chainId: 11155111,
      accounts: [process.env.key0]
    }
    // bsc: {
    //   url: "https://bsc-dataseed2.binance.org",
    //   chainId: 56,
    //   accounts: [process.env.key0]
    // },
    // ethereum: {
    //   url: "https://mainnet.infura.io/v3/" + API_KEY,
    //   chainId: 1,
    //   accounts: [process.env.key0]
    // }

  },
  etherscan: {
    apiKey: {
      // ethereum: process.env.ethsacn_api_key,
      // bscscan: process.env.bscscan_api_key
      sepolia: process.env.ethsacn_api_key
    },
    // customChains: [
    //   {
    //     network: "sepolia",
    //     chainId: 11155111,
    //     urls: {
    //       apiURL: "https://api-sepolia.etherscan.io/api",
    //       browserURL: "https://sepolia.etherscan.io"
    //     }
    //   }
    // ]
  }
};

