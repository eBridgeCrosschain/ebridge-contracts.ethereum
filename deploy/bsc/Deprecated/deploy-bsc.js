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
    const bridgeInImplementationAddress = '0xD7C80E5035D4Bb2630E8367Ca7a0b9Db9F3A2717';
    const bridgeOutAddress = '0xE383261ABc2A32bdd54dC9cFB5C77407C5E660ef';
    const bridgeOutImplementationAddress = '0xE30382636E09a94aAF7b7e8e03a948624AbdE284';
    const bridgeInLibAddress = '0x4A91FE2893c77F7C9a44bbDE1a4d226DDe0612ed';
    const bridgeOutLibAddress = '0x15BBf8aBBC1c9cfcAc1498dD4E066f1483bAF185';
    const LimiterAddress = '';
    const LimiterImplementationAddress = '0xDcB192379260A29DE6D9C4ce4BAc6f663599dad9';
    const tokenPoolImplementationAddress = '0xcBE05A71Fba4cBf7490758305411B6F261722d68';
    const tokenPoolAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';
    const commonLibAddress = '0xC33cC89EF5D4Ef845eD280886dee803937506857';
    

    const wbnbAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";


    // // common library
    // console.log("Start to deploy CommonLib.");
    // const CommonLib = await ethers.getContractFactory("CommonLibrary");
    // const commonLib = await CommonLib.deploy();
    // console.log("commonLib address:", commonLib.address);

// // BridgeInImplementation
//     console.log("Start to deploy BridgeInImplementation contract.");
//     const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
//             libraries:{
//                 CommonLibrary : commonLibAddress
//             }
//         });
//     const bridgeInImplementation = await BridgeInImplementation.deploy();
//     console.log("BridgeInImplementation address:", bridgeInImplementation.address);



    // // BridgeOutImplementationV1
    // console.log("Start to deploy BridgeOutImplementationV1 contract.");
    // const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
    //     libraries:{
    //         CommonLibrary : commonLibAddress
    //     }
    // });
    // const bridgeOutImplementation = await BridgeOutImplementation.deploy();
    // console.log("BridgeOutImplementation address:", bridgeOutImplementation.address);



    // await run("verify:verify", {
    //         address: bridgeInImplementationAddress,
    //         constructorArguments: [],
    //         contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
    //       })
    //
    // await run("verify:verify", {
    //     address: commonLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/CommonLibrary.sol:CommonLibrary"
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

    // // LimiterImplementation
    // console.log("start deploy limiter implementation.")
    // const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    // const limiterImplementation = await LimiterImplementation.deploy();
    // console.log("limiterImplementation address:", limiterImplementation.address);
        await run("verify:verify", {
    address: LimiterImplementationAddress,
    constructorArguments: [],
    contract: "contracts/LimiterImplementation.sol:LimiterImplementation"
      })

    //  // TokenPoolImplementation
    //  console.log("start deploy tokenPool implementation.")
    //  const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    //  const tokenpoolImplementation = await TokenPoolImplementation.deploy();
    //  console.log("tokenpoolImplementation address:", tokenpoolImplementation.address);
 
    //  // TokenPool
    //  const TokenPool = await ethers.getContractFactory("TokenPool");
    //  const TokenPoolProxy = await TokenPool.deploy(bridgeInAddress,bridgeOutAddress,wbnbAddress,deployer.address,tokenPoolImplementationAddress);
    //  console.log("TokenPool address:", TokenPoolProxy.address);
 
    //   await run("verify:verify", {
    //      address: tokenPoolAddress,
    //      constructorArguments: [bridgeInAddress,bridgeOutAddress,wbnbAddress,deployer.address,tokenPoolImplementationAddress],
    //      contract: "contracts/TokenPool.sol:TokenPool"
    //   })
    //  await run("verify:verify", {
    //      address: tokenPoolImplementationAddress,
    //      constructorArguments: [],
    //      contract: "contracts/TokenPoolImplementation.sol:TokenPoolImplementation"
    //  })    

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });