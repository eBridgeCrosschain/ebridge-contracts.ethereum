const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const regimentAddress = '';
    const merkleTreeAddress = '';
    const multiSigWalletAddress = '';
    const bridgeInAddress = '0xbAf5D0cA1e63CD10E479F227d2dc88E066F63872';
    const bridgeInImplementationAddress = '';
    const bridgeOutAddress = '0xE383261ABc2A32bdd54dC9cFB5C77407C5E660ef';
    const bridgeOutImplementationAddress = '';
    const bridgeInLibAddress = '';
    const bridgeOutLibAddress = '';
    const LimiterAddress = '';
    const LimiterImplementationAddress = '';
    const tokenPoolImplementationAddress = '0xcBE05A71Fba4cBf7490758305411B6F261722d68';
    const tokenPoolAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';

    const wbnbAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";


    // //BridgeIn library
    // console.log("Start to deploy BridgeInLib.");
    // const BridgeInLib = await ethers.getContractFactory("BridgeInLibrary");
    // const bridgeInLib = await BridgeInLib.deploy();
    // console.log("bridgeInLib address:", bridgeInLib.address);


    // // BridgeInImplementation
    // console.log("Start to deploy BridgeInImplementation contract.");
    // const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
    //         libraries:{
    //             BridgeInLibrary : bridgeInLibAddress
    //         }
    //     });
    // const bridgeInImplementation = await BridgeInImplementation.deploy();
    // console.log("BridgeInImplementation address:", bridgeInImplementation.address);

    // //BridgeOut library
    // console.log("Start to deploy BridgeOutLib.");
    // const BridgeOutLib = await ethers.getContractFactory("BridgeOutLibrary");
    // const bridgeOutLib = await BridgeOutLib.deploy();
    // console.log("bridgeOutLib address:", bridgeOutLib.address);


    // // BridgeOutImplementationV1
    // console.log("Start to deploy BridgeOutImplementationV1 contract.");
    // const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
    //     libraries:{
    //         BridgeOutLibrary : bridgeOutLibAddress
    //     }
    // });
    // const bridgeOutImplementation = await BridgeOutImplementation.deploy();
    // console.log("BridgeOutImplementation address:", bridgeOutImplementation.address);

    // await run("verify:verify", {
    //         address: bridgeInImplementationAddress,
    //         constructorArguments: [],
    //         contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
    //       })

    // await run("verify:verify", {
    //     address: bridgeOutLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeOutLibrary.sol:BridgeOutLibrary"
    // })
    // await run("verify:verify", {
    //     address: bridgeInLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeInLibrary.sol:BridgeInLibrary"
    // })
    // await run("verify:verify", {
    //         address: bridgeOutImplementationAddress,
    //         constructorArguments: [],
    //         contract: "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
    //       })

    //  // TokenPoolImplementation
    //  console.log("start deploy tokenPool implementation.")
    //  const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    //  const tokenpoolImplementation = await TokenPoolImplementation.deploy();
    //  console.log("tokenpoolImplementation address:", tokenpoolImplementation.address);
 
    //  // TokenPool
    //  const TokenPool = await ethers.getContractFactory("TokenPool");
    //  const TokenPoolProxy = await TokenPool.deploy(bridgeInAddress,bridgeOutAddress,wbnbAddress,deployer.address,tokenPoolImplementationAddress);
    //  console.log("TokenPool address:", TokenPoolProxy.address);
 
      await run("verify:verify", {
         address: tokenPoolAddress,
         constructorArguments: [bridgeInAddress,bridgeOutAddress,wbnbAddress,deployer.address,tokenPoolImplementationAddress],
         contract: "contracts/TokenPool.sol:TokenPool"
      })
     await run("verify:verify", {
         address: tokenPoolImplementationAddress,
         constructorArguments: [],
         contract: "contracts/TokenPoolImplementation.sol:TokenPoolImplementation"
     })    

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });