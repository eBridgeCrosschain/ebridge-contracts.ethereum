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
    const bridgeInAddress = '0x7ffD4a8823626AF7E181dF36AAFF4270Aeb96Ddd';
    const bridgeInImplementationAddress = '0xE30382636E09a94aAF7b7e8e03a948624AbdE284';
    const bridgeOutAddress = '0x648C372668Fb65f46DB478AF0302330d06B16b8B';
    const bridgeOutImplementationAddress = '0xDcB192379260A29DE6D9C4ce4BAc6f663599dad9';
    const bridgeInLibAddress = '0x4A91FE2893c77F7C9a44bbDE1a4d226DDe0612ed';
    const bridgeOutLibAddress = '0x15BBf8aBBC1c9cfcAc1498dD4E066f1483bAF185';
    const LimiterAddress = '';
    const LimiterImplementationAddress = '0xcaEbC5663Dae6B57Ae0EB6F014d92e3A52C8b39e';
    const tokenPoolImplementationAddress = '0xcBE05A71Fba4cBf7490758305411B6F261722d68';
    const tokenPoolAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';
    const commonLibAddress = '0xD7C80E5035D4Bb2630E8367Ca7a0b9Db9F3A2717';

    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";


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


    //
    // await run("verify:verify", {
    //     address: bridgeInImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
    // })

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
    //     address: bridgeOutImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
    // })


    // // LimiterImplementation
    // console.log("start deploy limiter implementation.")
    // const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    // const limiterImplementation = await LimiterImplementation.deploy();
    // console.log("limiterImplementation address:", limiterImplementation.address);
    //     await run("verify:verify", {
    // address: LimiterImplementationAddress,
    // constructorArguments: [],
    // contract: "contracts/LimiterImplementation.sol:LimiterImplementation"
    //   })

    //     //deploy regiment implementation
    // console.log("Start to deploy regiment implementation contract.");
    // const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    // const regimentImplementation = await RegimentImplementation.deploy();
    // console.log("Regiment implementation address:", regimentImplementation.address);
    // regimentImplementationAddress = regimentImplementation.address;

    // await run("verify:verify", {
    //     address: "0x0C5ADDA344F68961038739E9B405202dd8F7DEd8",
    //     constructorArguments: [],
    //     contract: "contracts/RegimentImplementation.sol:RegimentImplementation"
    //   })

    //  // TokenPoolImplementation
    // console.log("start deploy tokenPool implementation.")
    // const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    // const tokenpoolImplementation = await TokenPoolImplementation.deploy();
    // console.log("tokenpoolImplementation address:", tokenpoolImplementation.address);

    // TokenPool
    // const TokenPool = await ethers.getContractFactory("TokenPool");
    // const TokenPoolProxy = await TokenPool.deploy(bridgeInAddress,bridgeOutAddress,wethAddress,deployer.address,tokenPoolImplementationAddress);
    // console.log("TokenPool address:", TokenPoolProxy.address);

    //  await run("verify:verify", {
    //     address: tokenPoolAddress,
    //     constructorArguments: [bridgeInAddress,bridgeOutAddress,wethAddress,deployer.address,tokenPoolImplementationAddress],
    //     contract: "contracts/TokenPool.sol:TokenPool"
    //  })
    // await run("verify:verify", {
    //     address: tokenPoolImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/TokenPoolImplementation.sol:TokenPoolImplementation"
    // })

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });