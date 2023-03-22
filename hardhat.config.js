//const dotenv = require('dotenv');
require('solidity-coverage');
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');
// require("@nomicfoundation/hardhat-toolbox");
// const result = dotenv.config();
// if (result.error) {
//   throw result.error;
// }
// console.log(result.parsed);
// const API_KEY = process.env.apikey;

// console.log("API_KEY--------" + API_KEY)
// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts


module.exports = {
  solidity: {
    version: "0.8.9",
    setting: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  contractSizer:{
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  networks: {
     
    // kovan: {
    //   url: "https://kovan.infura.io/v3/" + API_KEY,
    //   chainId: 42,
    //   accounts: [process.env.kovan_key0]
    // },
    // goerli: {
    //   url: "https://goerli.infura.io/v3/" + API_KEY,
    //   chainId: 5,
    //   accounts: [process.env.kovan_key0]
    // },
    // bsc_test: {
    //   url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    //   chainId: 97,
    //   accounts: [process.env.kovan_key0]
    // }


  },
  etherscan: {
    apiKey:
      process.env.BNBSCAN_API_KEY,

  }
};

