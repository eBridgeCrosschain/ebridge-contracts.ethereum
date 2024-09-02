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
    const bridgeInAddress = '';
    const bridgeInImplementationAddress = '';
    const bridgeOutAddress = '';
    const bridgeOutImplementationAddress = '';
    const bridgeInLibAddress = '';
    const bridgeOutLibAddress = '';
    const LimiterAddress = '';
    const LimiterImplementationAddress = '';
    const tokenPoolImplementationAddress = '';
    const tokenPoolAddress = '';

    const wethAddress = "";


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

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });