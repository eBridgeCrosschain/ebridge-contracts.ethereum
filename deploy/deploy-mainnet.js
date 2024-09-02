const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');


async function main() {
    const [deployer,admin] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const bridgeOutAddress = '';
    const bridgeOutImplementationAddress = '';
    const bridgeOutLibAddress = '';

    //BridgeOut library
    // console.log("Start to deploy BridgeOutLib.");
    // const BridgeOutLib = await ethers.getContractFactory("BridgeOutLibrary");
    // const bridgeOutLib = await BridgeOutLib.deploy();
    // console.log("bridgeOutLib address:", bridgeOutLib.address);

    // await run("verify:verify", {
    //     address: bridgeOutLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeOutLibrary.sol:BridgeOutLibrary"
    // })

    // BridgeOutImplementationV1
    // console.log("Start to deploy BridgeOutImplementationV1 contract.");
    // const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
    //     libraries:{
    //         BridgeOutLibrary : bridgeOutLibAddress
    //     }
    // });
    // const bridgeOutImplementation = await BridgeOutImplementation.deploy();
    // console.log("BridgeOutImplementation address:", bridgeOutImplementation.address);

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