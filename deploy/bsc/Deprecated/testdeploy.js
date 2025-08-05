const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());


    // //BridgeIn library
    // console.log("Start to deploy BridgeInLib.");
    // const BridgeInLib = await ethers.getContractFactory("BridgeInLibrary");
    // const bridgeInLib = await BridgeInLib.deploy();
    // console.log("bridgeInLib address:", bridgeInLib.address);

    // const TokenFactory = await ethers.getContractFactory("TokenFactory");
    // const tokenFactory = await TokenFactory.deploy();
    // console.log("tokenFactory address:", tokenFactory.address);
  
     await run("verify:verify", {
         address: "0xa0fdD7D43353Dd142B6F27D362ca056BC136aeeD",
         constructorArguments: [],
         contract: "contracts/testTokenFactory.sol:TokenFactory"
     })  
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });