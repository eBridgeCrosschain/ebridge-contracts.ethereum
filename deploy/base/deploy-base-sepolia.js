const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');


async function main() {
    const [deployer,admin] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("admin account:", admin.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const regimentAddress = '';
    const regimentImplementationAddress = '';
    const limiterAddress = '';
    const limiterImplementationAddress = '';
    const tokenPoolAddress = '';
    const tokenPoolImplementationAddress = '';
    const commonLibAddress = '';
    const bridgeInImplementationAddress = '';
    const bridgeInAddress = '0x7e308DC172faa2a6560C2cd806e8282C51E5BFA5';
    const bridgeOutImplementationAddress = '';
    const bridgeOutAddress = '0xA251aE4C14C53d980699b14319bf2Ad5A4bC4A14';
    const multiSigWalletAddress = '';
    const timelockAddress = '';

    const nativeTokenAddress = '0x13aEe64E227af004De02BA2d651E4e3670e15A83';
    const usdcAddress = '0xB110e5d737dcfb38CE22E58482F9546D401F0A2D';
    const mockMultiSigWalletAddress = '0xA2263D5c14F9c711A8b3C4AA2FD522Efdb5d5e44';
    const _memberJoinLimit = 10;
    const _regimentLimit = 20;
    const _maximumAdminsCount = 3;
    const pauseController = "0xA2263D5c14F9c711A8b3C4AA2FD522Efdb5d5e44";

    // const WETH = await ethers.getContractFactory("WETH9");
    // const weth = await WETH.deploy();
    // console.log("weth address:", weth.address);

    // const USDC = await ethers.getContractFactory("USDC");
    // const usdc = await USDC.deploy();
    // console.log("usdc address:", usdc.address);

    // await run("verify:verify", {
    //     address: usdcAddress,
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/MockUSDC.sol:USDC"
    // })

    // await run("verify:verify", {
    //     address: nativeTokenAddress,
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/WETH9.sol:WETH9"
    // })


    // //deploy regiment implementation
    // console.log("Start to deploy regiment implementation contract.");
    // const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    // const regimentImplementation = await RegimentImplementation.deploy();
    // console.log("Regiment implementation address:", regimentImplementation.address);

    // //regiment contract
    // console.log("Start to deploy regiment contract.");
    // const Regiment = await ethers.getContractFactory("Regiment");
    // const regimentProxy = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress);
    // console.log("Regiment address:", regimentProxy.address);

    // await run("verify:verify", {
    //     address: regimentImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/RegimentImplementation.sol:RegimentImplementation"
    //   })

    // await run("verify:verify", {
    //     address: regimentAddress,
    //     constructorArguments: [_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress],
    //     contract: "contracts/Regiment.sol:Regiment"
    //   })

    // // LimiterImplementation
    // console.log("start deploy limiter implementation.")
    // const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    // const limiterImplementation = await LimiterImplementation.deploy();
    // console.log("limiterImplementation address:", limiterImplementation.address);
    
    // // Limiter
    // console.log("start deploy limiter.")
    // const Limiter = await ethers.getContractFactory("Limiter");
    // const LimiterProxy = await Limiter.deploy(admin.address,limiterImplementationAddress);
    // console.log("Limiter address:", LimiterProxy.address);

    // await run("verify:verify", {
    //     address: limiterAddress,
    //     constructorArguments: [admin.address,limiterImplementationAddress],
    //     contract: "contracts/Limiter.sol:Limiter"
    // })
    // await run("verify:verify", {
    //     address: limiterImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/LimiterImplementation.sol:LimiterImplementation"
    // })

    // // TokenPoolImplementation
    // console.log("start deploy tokenPool implementation.")
    // const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    // const tokenpoolImplementation = await TokenPoolImplementation.deploy();
    // console.log("tokenpoolImplementation address:", tokenpoolImplementation.address);

    // // TokenPool
    // const TokenPool = await ethers.getContractFactory("TokenPool");
    // const TokenPoolProxy = await TokenPool.deploy(admin.address,nativeTokenAddress,tokenPoolImplementationAddress);
    // console.log("TokenPool address:", TokenPoolProxy.address);


    // await run("verify:verify", {
    //     address: tokenPoolAddress,
    //     constructorArguments: [admin.address,nativeTokenAddress,tokenPoolImplementationAddress],
    //     contract: "contracts/TokenPool.sol:TokenPool"
    //  })
    // await run("verify:verify", {
    //     address: tokenPoolImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/TokenPoolImplementation.sol:TokenPoolImplementation"
    // })

    // Common library
    console.log("Start to deploy CommonLib.");
    const CommonLib = await ethers.getContractFactory("CommonLibrary");
    const commonLib = await CommonLib.deploy();
    console.log("common lib address:", commonLib.address);


    // // BridgeInImplementation
    // console.log("Start to deploy BridgeInImplementation contract.");
    // const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
    //         libraries:{
    //             CommonLibrary : commonLibAddress
    //         }
    //     });
    // const bridgeInImplementation = await BridgeInImplementation.deploy();
    // console.log("BridgeInImplementation address:", bridgeInImplementation.address);


    // // BridgeIn
    // console.log("Start to deploy BridgeIn contract.");
    // const BridgeIn = await ethers.getContractFactory("BridgeIn");
    // const bridgeInProxy = await BridgeIn.deploy(mockMultiSigWalletAddress, nativeTokenAddress, pauseController,limiterAddress,tokenPoolAddress,bridgeInImplementationAddress);
    // console.log("BridgeIn address:", bridgeInProxy.address);

    // await run("verify:verify", {
    //     address: bridgeInLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeInLibrary.sol:BridgeInLibrary"
    // })
    // await run("verify:verify", {
    //     address: bridgeInImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
    // })
    // await run("verify:verify", {
    //     address: bridgeInAddress,
    //     constructorArguments: [mockMultiSigWalletAddress, nativeTokenAddress, pauseController,limiterAddress,tokenPoolAddress,bridgeInImplementationAddress],
    //     contract: "contracts/BridgeIn.sol:BridgeIn"
    // })


    // // BridgeOut library
    // console.log("Start to deploy BridgeOutLib.");
    // const BridgeOutLib = await ethers.getContractFactory("BridgeOutLibrary");
    // const bridgeOutLib = await BridgeOutLib.deploy();
    // console.log("bridgeOutLib address:", bridgeOutLib.address);


    // // BridgeOutImplementationV1
    // console.log("Start to deploy BridgeOutImplementationV1 contract.");
    // const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
    //     libraries:{
    //         CommonLibrary : commonLibAddress
    //     }
    // });
    // const bridgeOutImplementation = await BridgeOutImplementation.deploy();
    // console.log("BridgeOutImplementation address:", bridgeOutImplementation.address);

    // // BridgeOut
    // console.log("Start to deploy BridgeOut contract.");
    // const BridgeOut = await ethers.getContractFactory("BridgeOut");
    // const bridgeOutProxy = await BridgeOut.deploy(regimentAddress, bridgeInAddress ,mockMultiSigWalletAddress, nativeTokenAddress, limiterAddress, tokenPoolAddress, bridgeOutImplementationAddress);
    // console.log("BridgeOut address:", bridgeOutProxy.address);

    // await run("verify:verify", {
    //     address: bridgeOutLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeOutLibrary.sol:BridgeOutLibrary"
    // })
    // await run("verify:verify", {
    //     address: bridgeOutImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
    // })
    // await run("verify:verify", {
    //     address: bridgeOutAddress,
    //     constructorArguments: [regimentAddress, bridgeInAddress ,mockMultiSigWalletAddress, nativeTokenAddress, limiterAddress, tokenPoolAddress, bridgeOutImplementationAddress],
    //     contract: "contracts/BridgeOut.sol:BridgeOut"
    // })

    //MultiSigWallet
    var members = [
        "0x00378D56583235ECc92E7157A8BdaC1483094223",
        "0xEA7Dfc13498E2Ca99a3a74e144F4Afa4dD28b3fc",
        "0x2B5BD5995D6AAeC027c2f6d6a80ae2D792b52aFA",
        "0xA36FF0f2cB7A35E597Bf862C5618c201bD44Dd29",
        "0xE91839Cb35e0c67B5179B31d7A9DE4fde269aBD4",
        ];
    var required = 3;

    // console.log("Start to deploy MultiSigWallet contract.");
    // const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    // const multiSigWallet = await MultiSigWallet.deploy(members, required);
    // console.log("MultiSigWallet address:", multiSigWallet.address);


    // await run("verify:verify", {
    //     address: multiSigWalletAddress,
    //     constructorArguments: [members,required],
    // })    

    // console.log("Start to deploy Timelock contract.");
    // const delay = new BigNumber(10 * 60);
    // const Timelock = await ethers.getContractFactory("Timelock");
    // const timelock = await Timelock.deploy(deployer.address,delay.toFixed());
    // console.log("timelock address:", timelock.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });